export interface ChainDefinition {
  id: number;
  name: string;
  nativeCurrency: {
    decimals: number;
    name: string;
    symbol: string;
  };
}

export const SUPPORTED_CHAINS: readonly ChainDefinition[] = [
  {
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' }
  },
  {
    id: 10,
    name: 'OP Mainnet',
    nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' }
  },
  {
    id: 137,
    name: 'Polygon',
    nativeCurrency: { decimals: 18, name: 'POL', symbol: 'POL' }
  },
  {
    id: 8453,
    name: 'Base',
    nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' }
  },
  {
    id: 42161,
    name: 'Arbitrum One',
    nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' }
  }
];

export function getChainById(chainId: number): ChainDefinition | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId);
}
