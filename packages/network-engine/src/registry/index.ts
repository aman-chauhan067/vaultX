/**
 * @file registry/index.ts
 * @description The static chain registry holding supported EVM networks.
 */

import type { ChainConfig } from '../types/index.js';

export const CHAIN_REGISTRY: Record<number, ChainConfig> = {
  // Ethereum
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrls: ['https://eth.llamarpc.com', 'https://cloudflare-eth.com'],
    currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    explorer: 'https://etherscan.io',
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    isTestnet: false,
    supportsEIP1559: true,
    supportsENS: true
  },
  11155111: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrls: [
      'https://rpc.ankr.com/eth_sepolia',
      'https://ethereum-sepolia-rpc.publicnode.com',
      'https://rpc.sepolia.org'
    ],
    currency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
    explorer: 'https://sepolia.etherscan.io',
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    isTestnet: true,
    supportsEIP1559: true,
    supportsENS: true
  },
  // Polygon
  137: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrls: ['https://polygon-rpc.com', 'https://rpc-mainnet.maticvigil.com'],
    currency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    explorer: 'https://polygonscan.com',
    icon: 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
    isTestnet: false,
    supportsEIP1559: true,
    supportsENS: false
  },
  80002: {
    chainId: 80002,
    name: 'Polygon Amoy',
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    currency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    explorer: 'https://amoy.polygonscan.com',
    icon: 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
    isTestnet: true,
    supportsEIP1559: true,
    supportsENS: false
  },
  // Base
  8453: {
    chainId: 8453,
    name: 'Base',
    rpcUrls: ['https://mainnet.base.org'],
    currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    explorer: 'https://basescan.org',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png',
    isTestnet: false,
    supportsEIP1559: true,
    supportsENS: false
  },
  84532: {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrls: ['https://sepolia.base.org'],
    currency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
    explorer: 'https://sepolia.basescan.org',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png',
    isTestnet: true,
    supportsEIP1559: true,
    supportsENS: false
  },
  // Arbitrum
  42161: {
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    explorer: 'https://arbiscan.io',
    icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg',
    isTestnet: false,
    supportsEIP1559: true,
    supportsENS: false
  },
  421614: {
    chainId: 421614,
    name: 'Arbitrum Sepolia',
    rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
    currency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
    explorer: 'https://sepolia.arbiscan.io',
    icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg',
    isTestnet: true,
    supportsEIP1559: true,
    supportsENS: false
  },
  // Optimism
  10: {
    chainId: 10,
    name: 'OP Mainnet',
    rpcUrls: ['https://mainnet.optimism.io'],
    currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    explorer: 'https://optimistic.etherscan.io',
    icon: 'https://cryptologos.cc/logos/optimism-op-logo.svg',
    isTestnet: false,
    supportsEIP1559: true,
    supportsENS: false
  },
  11155420: {
    chainId: 11155420,
    name: 'OP Sepolia',
    rpcUrls: ['https://sepolia.optimism.io'],
    currency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
    explorer: 'https://sepolia-optimism.etherscan.io',
    icon: 'https://cryptologos.cc/logos/optimism-op-logo.svg',
    isTestnet: true,
    supportsEIP1559: true,
    supportsENS: false
  },
  // BNB Chain
  56: {
    chainId: 56,
    name: 'BNB Smart Chain',
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    currency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    explorer: 'https://bscscan.com',
    icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
    isTestnet: false,
    supportsEIP1559: false, // Legacy BNB
    supportsENS: false
  },
  97: {
    chainId: 97,
    name: 'BNB Smart Chain Testnet',
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    currency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    explorer: 'https://testnet.bscscan.com',
    icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
    isTestnet: true,
    supportsEIP1559: false,
    supportsENS: false
  },
  // Avalanche
  43114: {
    chainId: 43114,
    name: 'Avalanche C-Chain',
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    currency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
    explorer: 'https://snowtrace.io',
    icon: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg',
    isTestnet: false,
    supportsEIP1559: true,
    supportsENS: false
  },
  // Fantom
  250: {
    chainId: 250,
    name: 'Fantom Opera',
    rpcUrls: ['https://rpc.ftm.tools'],
    currency: { name: 'Fantom', symbol: 'FTM', decimals: 18 },
    explorer: 'https://ftmscan.com',
    icon: 'https://cryptologos.cc/logos/fantom-ftm-logo.svg',
    isTestnet: false,
    supportsEIP1559: true,
    supportsENS: false
  },
  // Linea
  59144: {
    chainId: 59144,
    name: 'Linea Mainnet',
    rpcUrls: ['https://rpc.linea.build'],
    currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    explorer: 'https://lineascan.build',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/linea/info/logo.png',
    isTestnet: false,
    supportsEIP1559: true,
    supportsENS: false
  },
  // Local Hardhat
  31337: {
    chainId: 31337,
    name: 'Hardhat Local',
    rpcUrls: ['http://127.0.0.1:8545'],
    currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    isTestnet: true,
    supportsEIP1559: true,
    supportsENS: false
  }
};
