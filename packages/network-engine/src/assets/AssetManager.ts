import { Contract, formatUnits, parseUnits, Interface } from 'ethers';
import type { ProviderManager } from '../providers/index.js';
import { NFTMetadataResolver } from './resolvers/NFTMetadataResolver.js';
import { IPFSResolver } from './resolvers/IPFSResolver.js';
import type { NFT, NFTStandard, NFTMetadataState, NFTMetadata } from './resolvers/types.js';

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
  chainId: number;
  verified: boolean;
}

export interface TokenBalance extends TokenInfo {
  balance: string; // raw amount as string
  formattedBalance: string; // human readable based on decimals
}

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)'
];

const ERC165_ABI = ['function supportsInterface(bytes4 interfaceId) view returns (bool)'];

const ERC721_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)'
];

const ERC1155_ABI = [
  'function uri(uint256 id) view returns (string)',
  'function balanceOf(address account, uint256 id) view returns (uint256)'
];

const ERC721_INTERFACE_ID = '0x80ac58cd';
const ERC1155_INTERFACE_ID = '0xd9b67a26';

interface NFTCacheEntry {
  nft: NFT;
  timestamp: number;
}

export class AssetManager {
  private customTokens: Map<number, TokenInfo[]> = new Map();
  private nftResolver: NFTMetadataResolver;

  // Cache for contract standards: chainId_contractAddress -> 'ERC721' | 'ERC1155' | 'Unknown'
  private standardCache: Map<string, NFTStandard> = new Map();

  // Cache for specific NFTs: chainId_contractAddress_tokenId -> NFTCacheEntry
  private nftCache: Map<string, NFTCacheEntry> = new Map();
  private readonly NFT_CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

  constructor(private providerManager: ProviderManager) {
    const ipfsResolver = new IPFSResolver();
    this.nftResolver = new NFTMetadataResolver(ipfsResolver);
  }

  // ==========================================
  // ERC20 Tokens
  // ==========================================

  public registerCustomToken(token: TokenInfo): void {
    const tokens = this.customTokens.get(token.chainId) || [];
    if (!tokens.find((t) => t.address.toLowerCase() === token.address.toLowerCase())) {
      this.customTokens.set(token.chainId, [...tokens, token]);
    }
  }

  public getTokensForChain(chainId: number): TokenInfo[] {
    return this.customTokens.get(chainId) || [];
  }

  public async fetchTokenMetadata(address: string, chainId: number): Promise<TokenInfo> {
    // Discovery Priority: 1. Contract Address & ChainId
    const existingToken = this.getTokensForChain(chainId).find(
      (t) => t.address.toLowerCase() === address.toLowerCase()
    );
    if (existingToken) return existingToken;

    return await this.providerManager.executeOnChain(chainId, async (provider: any) => {
      const contract = new Contract(address, ERC20_ABI, provider) as any;
      const [name, symbol, decimals] = await Promise.all([
        contract.name().catch(() => 'Unknown Token'),
        contract.symbol().catch(() => 'UNK'),
        contract.decimals().catch(() => 18)
      ]);

      return {
        address,
        name,
        symbol,
        decimals: Number(decimals),
        chainId,
        verified: false
      };
    });
  }

  public async getBalances(walletAddress: string, chainId: number): Promise<TokenBalance[]> {
    const tokens = this.getTokensForChain(chainId);
    if (tokens.length === 0) return [];

    return await this.providerManager.executeOnChain(chainId, async (provider: any) => {
      const balances = await Promise.all(
        tokens.map(async (token) => {
          try {
            const contract = new Contract(token.address, ERC20_ABI, provider) as any;
            const balance = await contract.balanceOf(walletAddress);
            return {
              ...token,
              balance: balance.toString(),
              formattedBalance: formatUnits(balance, token.decimals)
            };
          } catch (err) {
            return {
              ...token,
              balance: '0',
              formattedBalance: '0'
            };
          }
        })
      );
      return balances;
    });
  }

  public buildTransferData(to: string, amount: string, decimals: number): string {
    const iface = new Interface(ERC20_ABI);
    const parsedAmount = parseUnits(amount, decimals);
    return iface.encodeFunctionData('transfer', [to, parsedAmount]);
  }

  public parseTransferData(data: string): { to: string; amount: string } | null {
    if (!data || data === '0x') return null;
    try {
      const iface = new Interface(ERC20_ABI);
      const decoded = iface.decodeFunctionData('transfer', data);
      return {
        to: decoded[0],
        amount: decoded[1].toString()
      };
    } catch {
      return null;
    }
  }

  // ==========================================
  // NFTs (ERC721 / ERC1155)
  // ==========================================

  private getStandardCacheKey(chainId: number, contractAddress: string): string {
    return `${chainId}_${contractAddress.toLowerCase()}`;
  }

  private getNftCacheKey(chainId: number, contractAddress: string, tokenId: string): string {
    return `${chainId}_${contractAddress.toLowerCase()}_${tokenId}`;
  }

  /**
   * Identifies the standard of a contract using ERC165 supportsInterface.
   * Caches the result to avoid duplicate RPC calls.
   */
  public async getContractStandard(
    contractAddress: string,
    chainId: number,
    provider: any
  ): Promise<NFTStandard> {
    const cacheKey = this.getStandardCacheKey(chainId, contractAddress);
    if (this.standardCache.has(cacheKey)) {
      return this.standardCache.get(cacheKey)!;
    }

    try {
      const contract = new Contract(contractAddress, ERC165_ABI, provider) as any;
      const is721 = await contract.supportsInterface(ERC721_INTERFACE_ID).catch(() => false);
      if (is721) {
        this.standardCache.set(cacheKey, 'ERC721');
        return 'ERC721';
      }

      const is1155 = await contract.supportsInterface(ERC1155_INTERFACE_ID).catch(() => false);
      if (is1155) {
        this.standardCache.set(cacheKey, 'ERC1155');
        return 'ERC1155';
      }
    } catch (err) {
      // Ignore
    }

    this.standardCache.set(cacheKey, 'Unknown');
    return 'Unknown';
  }

  /**
   * Main entry point to discover known NFTs for a wallet.
   * For ERC721, it requires either known tokenIds or an indexer.
   * Since this is a lightweight wallet without an indexer, we rely on a list of known tokens or collections.
   * For demonstration, we'll implement fetching a specific token's full NFT data.
   */
  public async discoverNFT(
    contractAddress: string,
    tokenId: string,
    chainId: number,
    walletAddress: string,
    forceRefresh = false
  ): Promise<NFT | null> {
    const cacheKey = this.getNftCacheKey(chainId, contractAddress, tokenId);

    if (!forceRefresh && this.nftCache.has(cacheKey)) {
      const entry = this.nftCache.get(cacheKey)!;
      if (Date.now() - entry.timestamp < this.NFT_CACHE_TTL_MS) {
        return entry.nft;
      }
    }

    return await this.providerManager.executeOnChain(chainId, async (provider: any) => {
      const standard = await this.getContractStandard(contractAddress, chainId, provider);

      if (standard === 'Unknown') {
        return null; // Not an NFT contract we support
      }

      let tokenUri = '';
      let collectionName = 'Unknown Collection';
      let owner = '';
      let balance = '0';

      if (standard === 'ERC721') {
        const contract = new Contract(contractAddress, ERC721_ABI, provider) as any;
        [collectionName, tokenUri, owner] = await Promise.all([
          contract.name().catch(() => 'Unknown Collection'),
          contract.tokenURI(tokenId).catch(() => ''),
          contract.ownerOf(tokenId).catch(() => '')
        ]);
        balance = owner.toLowerCase() === walletAddress.toLowerCase() ? '1' : '0';
      } else if (standard === 'ERC1155') {
        const contract = new Contract(contractAddress, ERC1155_ABI, provider) as any;
        // ERC1155 might not have name(), so we catch
        try {
          collectionName = await contract.name();
        } catch {
          collectionName = 'Unknown ERC1155 Collection';
        }
        [tokenUri, balance] = await Promise.all([
          contract.uri(tokenId).catch(() => ''),
          contract.balanceOf(walletAddress, tokenId).catch(() => 0n)
        ]);
        balance = balance.toString();
        owner = balance !== '0' ? walletAddress : '';
        // ERC1155 expects `{id}` replacement in URI
        if (tokenUri.includes('{id}')) {
          const hexId = BigInt(tokenId).toString(16).padStart(64, '0');
          tokenUri = tokenUri.replace('{id}', hexId);
        }
      }

      // Only fetch metadata if we have a URI
      let metadataState: NFTMetadataState = 'failed';
      let metadata: NFTMetadata = {};

      if (tokenUri) {
        const result = await this.nftResolver.resolveMetadata(tokenUri);
        metadataState = result.state;
        metadata = result.metadata;
      }

      const nft: NFT = {
        contractAddress,
        tokenId,
        chainId,
        collectionName,
        name: metadata.name || `${collectionName} #${tokenId}`,
        description: metadata.description || '',
        image: metadata.image || '',
        attributes: metadata.attributes || [],
        standard,
        owner,
        balance,
        metadataState
      };

      this.nftCache.set(cacheKey, { nft, timestamp: Date.now() });
      return nft;
    });
  }

  /**
   * For discovery, if we know a user owns some NFTs on specific contracts,
   * we fetch them. Since we don't have an indexer in this demo phase,
   * we pass known pairings.
   */
  public async discoverNFTs(
    knownTokens: { contract: string; id: string }[],
    chainId: number,
    walletAddress: string
  ): Promise<NFT[]> {
    const results: NFT[] = [];
    // To avoid rate limits, we fetch sequentially or in small batches.
    // For now, sequentially is safer for RPC limits on free endpoints.
    for (const token of knownTokens) {
      const nft = await this.discoverNFT(token.contract, token.id, chainId, walletAddress);
      if (nft && nft.balance !== '0') {
        results.push(nft);
      }
    }
    return results;
  }
}
