import { useQuery } from '@tanstack/react-query';
import { VaultXService } from '../services/VaultXService.js';
import { useNetwork } from './index.js';
import { formatEther, formatUnits } from '@vaultx/network-engine';

export interface NetworkStats {
  blockNumber: number;
  gasPrice: string;
  balance: string;
  lastSync: number;
}

export function useNetworkStats(address: string | undefined, refreshInterval = 10000) {
  const { activeChainId } = useNetwork();

  return useQuery<NetworkStats | null>({
    queryKey: ['networkStats', activeChainId, address],
    queryFn: async () => {
      if (!activeChainId) return null;

      const service = VaultXService.getInstance();
      try {
        return await service.networkEngine.execute(async (provider) => {
          const [blockNumber, feeData, balanceWei] = await Promise.all([
            provider.getBlockNumber(),
            provider.getFeeData(),
            address ? provider.getBalance(address) : Promise.resolve(0n)
          ]);

          const gasPriceWei = feeData.gasPrice || feeData.maxFeePerGas || 0n;

          return {
            blockNumber,
            gasPrice: formatUnits(gasPriceWei, 'gwei'),
            balance: formatEther(balanceWei),
            lastSync: Date.now()
          };
        });
      } catch (err) {
        console.error('Failed to fetch network stats:', err);
        return null;
      }
    },
    enabled: !!activeChainId,
    refetchInterval: refreshInterval
  });
}
