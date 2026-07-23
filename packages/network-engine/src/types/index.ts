/**
 * @file types/index.ts
 * @description Core types for the Network Engine
 */

export interface CurrencyConfig {
  name: string;
  symbol: string;
  decimals: number;
}

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrls: string[];
  currency: CurrencyConfig;
  explorer?: string;
  icon?: string;
  isTestnet: boolean;
  supportsEIP1559: boolean;
  supportsENS: boolean;
  isCustom?: boolean;
}

export interface RpcHealth {
  url: string;
  isHealthy: boolean;
  latencyMs: number;
  lastChecked: number;
  failures: number;
}

export interface NetworkEvents {
  ProviderConnected: (chainId: number) => void;
  ProviderDisconnected: (chainId: number, error: Error) => void;
  ChainChanged: (newChainId: number) => void;
  RPCFailed: (url: string, error: Error) => void;
  RPCRecovered: (url: string) => void;
  LatencyUpdated: (url: string, latencyMs: number) => void;
  NewBlock: (blockNumber: number) => void;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  timeoutMs: number;
}
