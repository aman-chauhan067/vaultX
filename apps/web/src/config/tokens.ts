import type { TokenInfo } from '@vaultx/network-engine';

export const DEFAULT_TOKENS: TokenInfo[] = [
  {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    chainId: 1,
    verified: true
  },
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    chainId: 1,
    verified: true
  },
  {
    address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    chainId: 137,
    verified: true
  },
  {
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    chainId: 137,
    verified: true
  },
  {
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
    chainId: 11155111,
    verified: true
  },
  {
    address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    chainId: 11155111,
    verified: true
  }
];
