import React, { useCallback, useState, useEffect } from 'react';
import {
  TransactionContext,
  type HistoricalTransaction,
  type PendingTransaction
} from '../contexts/TransactionContext.js';
import { useQueryClient } from '@tanstack/react-query';
import {
  TransactionState,
  type ITransactionRequest,
  TransactionCoordinator,
  TransactionExecutor
} from '@vaultx/transaction-engine';
import { VaultXService } from '../services/VaultXService.js';
import { VaultXProviderAdapter } from '../services/VaultXProviderAdapter.js';
import { VaultXSignerAdapter } from '../services/VaultXSignerAdapter.js';

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [history, setHistory] = useState<HistoricalTransaction[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const [coordinator] = useState(() => new TransactionCoordinator());

  // Load from local storage
  useEffect(() => {
    try {
      const storedPending = localStorage.getItem('vaultx_pending_txs');
      if (storedPending) setPendingTransactions(JSON.parse(storedPending));

      const storedHistory = localStorage.getItem('vaultx_history_txs');
      if (storedHistory) setHistory(JSON.parse(storedHistory));
    } catch (err) {
      console.error('Failed to parse tx local storage', err);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('vaultx_pending_txs', JSON.stringify(pendingTransactions));
  }, [pendingTransactions]);

  useEffect(() => {
    localStorage.setItem('vaultx_history_txs', JSON.stringify(history));
  }, [history]);

  // Attempt to resolve pending transactions on load
  useEffect(() => {
    const resolvePending = async () => {
      const provider = new VaultXProviderAdapter(VaultXService.getInstance().networkEngine);
      for (const pending of pendingTransactions) {
        if (
          pending.state === TransactionState.PENDING ||
          pending.state === TransactionState.BROADCASTING
        ) {
          try {
            // Ethers provider waitForTransaction resolves to null if timeout
            const receipt = await provider.waitForTransaction(pending.hash, 1);
            if (receipt) {
              setPendingTransactions((p) => p.filter((t) => t.hash !== pending.hash));
              setHistory((h) => [
                { request: pending.request, receipt, timestamp: Date.now() },
                ...h
              ]);
            }
          } catch (e) {
            console.error('Failed to resolve pending tx', e);
          }
        }
      }
    };
    if (pendingTransactions.length > 0) resolvePending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prepareTransaction = useCallback(
    async (request: Partial<ITransactionRequest>) => {
      const activeWallet = VaultXService.getInstance().accountManager.getActiveWallet();
      if (!activeWallet) throw new Error('No active wallet');
      const provider = new VaultXProviderAdapter(VaultXService.getInstance().networkEngine);
      return coordinator.prepareTransaction(
        {
          ...request,
          from: activeWallet.address,
          chainId: VaultXService.getInstance().networkEngine.getActiveChainId()!
        } as any,
        provider
      );
    },
    [coordinator]
  );

  const sendTransaction = useCallback(
    async (request: Partial<ITransactionRequest>) => {
      try {
        const activeWallet = VaultXService.getInstance().accountManager.getActiveWallet();
        if (!activeWallet) throw new Error('No active wallet');

        const provider = new VaultXProviderAdapter(VaultXService.getInstance().networkEngine);
        const signer = new VaultXSignerAdapter(
          VaultXService.getInstance().keyringController,
          activeWallet.metadata.walletId,
          activeWallet.address,
          provider
        );

        // Prepare using coordinator (estimates gas, gets nonce) if it's not already prepared
        let preparedReq = request as ITransactionRequest;
        if (!preparedReq.gasLimit || preparedReq.nonce === undefined) {
          preparedReq = await prepareTransaction(request);
        }

        const executor = new TransactionExecutor(preparedReq, { provider, signer });

        const pseudoHash = 'temp-' + Date.now();
        setPendingTransactions((p) => [
          ...p,
          {
            hash: pseudoHash,
            request: preparedReq,
            state: TransactionState.CREATED,
            timestamp: Date.now()
          }
        ]);

        executor.stateMachine.onTransition((_prev, curr, _data) => {
          setPendingTransactions((p) => {
            const arr = [...p];
            const idx = arr.findIndex(
              (t) => t.hash === pseudoHash || t.hash === executor.transactionHash
            );
            if (idx !== -1) {
              const item = arr[idx];
              if (item) {
                item.state = curr;
                if (executor.transactionHash) {
                  item.hash = executor.transactionHash;
                }
              }
            }
            return arr;
          });
        });

        const receipt = await executor.execute();

        setPendingTransactions((p) =>
          p.filter((t) => t.hash !== executor.transactionHash && t.hash !== pseudoHash)
        );

        const historicalTx: HistoricalTransaction = {
          request: preparedReq,
          receipt,
          timestamp: Date.now()
        };

        setHistory((h) => [historicalTx, ...h]);
        queryClient.invalidateQueries({ queryKey: ['balances'] });

        return receipt.transactionHash;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [queryClient, prepareTransaction]
  );

  const cancelTransaction = useCallback(async (hash: string, gasBumpPercentage?: number) => {
    throw new Error('Not implemented');
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('vaultx_history_txs');
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        pendingTransactions,
        history,
        prepareTransaction,
        sendTransaction,
        cancelTransaction,
        clearHistory,
        error
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
