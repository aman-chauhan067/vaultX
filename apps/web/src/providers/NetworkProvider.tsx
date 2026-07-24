import React, { useCallback, useEffect, useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { NetworkContext } from '../contexts/NetworkContext.js';
import { VaultXService } from '../services/VaultXService.js';
import { CHAIN_REGISTRY, type ChainConfig } from '@vaultx/network-engine';

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const service = VaultXService.getInstance();
  const networkEngine = service.networkEngine;
  const queryClient = useQueryClient();

  const [activeChainId, setActiveChainId] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { data: supportedNetworks = [] } = useQuery({
    queryKey: ['networks'],
    queryFn: () => {
      return networkEngine.getAllChains();
    }
  });

  // Initialize from persistence
  useEffect(() => {
    try {
      const persisted = localStorage.getItem('vaultx_active_chain');
      const targetChain = persisted ? parseInt(persisted, 10) : 1;
      if (networkEngine.getActiveChainId() !== targetChain) {
        networkEngine.switchChain(targetChain);
        setActiveChainId(targetChain);
      } else {
        setActiveChainId(targetChain);
      }
    } catch (err) {
      console.error('Failed to initialize persisted chain', err);
      if (networkEngine.getActiveChainId() !== 1) {
        networkEngine.switchChain(1);
        setActiveChainId(1);
      }
    }
  }, [networkEngine]);

  useEffect(() => {
    const handleChainChanged = (chainId: number) => {
      setActiveChainId(chainId);
      localStorage.setItem('vaultx_active_chain', chainId.toString());
      queryClient.invalidateQueries({ queryKey: ['network', chainId] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['networkStats'] });
    };

    const handleNewBlock = (blockNumber: number) => {
      queryClient.invalidateQueries({ queryKey: ['networkStats'] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
    };

    networkEngine.events.on('ChainChanged', handleChainChanged);
    networkEngine.events.on('NewBlock', handleNewBlock);

    return () => {
      networkEngine.events.off('ChainChanged', handleChainChanged);
      networkEngine.events.off('NewBlock', handleNewBlock);
    };
  }, [networkEngine, queryClient]);

  const switchNetwork = useCallback(
    async (chainId: number) => {
      try {
        networkEngine.switchChain(chainId);
        setError(null);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [networkEngine]
  );

  const addNetwork = useCallback(
    (config: ChainConfig) => {
      try {
        networkEngine.registerCustomChain(config);
        queryClient.invalidateQueries({ queryKey: ['networks'] });
        setError(null);
      } catch (err) {
        setError(err as Error);
      }
    },
    [networkEngine, queryClient]
  );

  const removeNetwork = useCallback(
    (chainId: number) => {
      try {
        if (chainId === activeChainId) {
          networkEngine.switchChain(1); // fallback
        }
        networkEngine.removeCustomChain(chainId);
        queryClient.invalidateQueries({ queryKey: ['networks'] });
        setError(null);
      } catch (err) {
        setError(err as Error);
      }
    },
    [networkEngine, queryClient, activeChainId]
  );

  return (
    <NetworkContext.Provider
      value={{ activeChainId, supportedNetworks, error, switchNetwork, addNetwork, removeNetwork }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
