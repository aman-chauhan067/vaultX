import { ethers } from 'ethers';
import type { ProviderManager } from '../providers/index.js';
import type { AssetManager } from '../assets/AssetManager.js';
import type { IDiscoveryStorage } from './storage/DiscoveryStorage.js';
import { SpamDetector } from './SpamDetector.js';

export class DiscoveryEngine {
  private spamDetector: SpamDetector;
  private isScanning: boolean = false;

  // Transfer(address indexed from, address indexed to, uint256 value)
  private readonly ERC20_TRANSFER_TOPIC =
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

  constructor(
    private providerManager: ProviderManager,
    private assetManager: AssetManager,
    private storage: IDiscoveryStorage
  ) {
    this.spamDetector = new SpamDetector();
  }

  /**
   * Scans a specific chain for new assets matching the wallet address incrementally.
   */
  public async scanChain(walletAddress: string, chainId: number): Promise<void> {
    if (this.isScanning) return; // Prevent concurrent overlapping scans
    this.isScanning = true;

    try {
      const provider = this.providerManager.getProvider(chainId);
      if (!provider) return;

      const state = await this.storage.getState(walletAddress);
      const currentBlock = await provider.getBlockNumber();

      // Default to 10,000 blocks ago if never scanned, or whatever limit the RPC allows
      // Free RPCs often restrict to 10k or 2k blocks for getLogs
      let fromBlock = state.lastScannedBlock[chainId] || currentBlock - 5000;
      if (fromBlock < 0) fromBlock = 0;

      if (fromBlock >= currentBlock) return; // Already up to date

      // Cap chunk size for RPC rate limits
      const maxBlocksPerChunk = 2000;
      const toBlock = Math.min(fromBlock + maxBlocksPerChunk, currentBlock);

      // ERC20 Transfer event where `to` == walletAddress
      const filter = {
        fromBlock,
        toBlock,
        topics: [
          this.ERC20_TRANSFER_TOPIC,
          null, // from
          ethers.zeroPadValue(walletAddress, 32) // to
        ]
      };

      const logs = await provider.getLogs(filter);

      const discoveredContracts = new Set<string>();
      logs.forEach((log: any) => {
        const address = log.address.toLowerCase();
        if (!state.discoveredTokens.includes(address)) {
          discoveredContracts.add(address);
        }
      });

      // Process discoveries
      for (const contractAddress of discoveredContracts) {
        // Fetch metadata (AssetManager internally caches and prioritizes known tokens)
        const metadata = await this.assetManager.fetchTokenMetadata(contractAddress, chainId);

        // Spam Check
        const spamAnalysis = this.spamDetector.analyzeToken(metadata);

        if (!spamAnalysis.isHidden) {
          // It's a valid token, register it
          this.assetManager.registerCustomToken(metadata);
          await this.storage.addDiscoveredToken(walletAddress, contractAddress);
        }
      }

      // Update scanned block
      await this.storage.updateLastScannedBlock(walletAddress, chainId, toBlock);
    } catch (err) {
      console.warn(`DiscoveryEngine: Failed to scan chain ${chainId}`, err);
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Discovers NFTs by looking up logs where 'to' is the wallet address
   * This is heavily simplified for demonstration. In production,
   * an indexer (Alchemy/Moralis) is absolutely mandatory for full coverage.
   */
  public async scanNFTs(walletAddress: string, chainId: number): Promise<void> {
    // Very similar to scanChain but looking for ERC721/1155 transfers
    // For 721: Transfer(from, to, tokenId) -> topics[3] is tokenId
    // For 1155: TransferSingle / TransferBatch
    // Implementation is similar to scanChain, delegated to indexers mostly.
  }
}
