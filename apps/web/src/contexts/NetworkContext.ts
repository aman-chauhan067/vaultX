import { createContext } from 'react';
import type { ChainConfig } from '@vaultx/network-engine';

export interface NetworkContextState {
  activeChainId: number | null;
  supportedNetworks: ChainConfig[];
  error: Error | null;
}

export interface NetworkContextActions {
  switchNetwork: (chainId: number) => Promise<void>;
  addNetwork: (config: ChainConfig) => void;
  removeNetwork: (chainId: number) => void;
}

export type NetworkContextType = NetworkContextState & NetworkContextActions;

export const NetworkContext = createContext<NetworkContextType | null>(null);
