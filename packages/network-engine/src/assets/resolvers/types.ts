export type NFTStandard = 'ERC721' | 'ERC1155' | 'Unknown';
export type NFTMetadataState = 'loading' | 'loaded' | 'failed';

export interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: any[];
  [key: string]: any;
}

export interface NFT {
  contractAddress: string;
  tokenId: string;
  chainId: number;
  collectionName: string; // from contract

  // Standardized metadata
  name: string; // token specific name
  description: string;
  image: string; // resolved image URI (HTTP)
  attributes: any[];

  standard: NFTStandard;
  owner?: string;
  balance?: string; // primarily for ERC1155

  metadataState: NFTMetadataState;
}
