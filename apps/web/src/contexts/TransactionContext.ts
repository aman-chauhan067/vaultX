import { createContext } from 'react';
import type { ITransactionRequest, TransactionState } from '@vaultx/transaction-engine';
import type { ITransactionReceipt } from '@vaultx/blockchain-core';

export interface PendingTransaction {
  hash: string;
  request: ITransactionRequest;
  state: TransactionState;
  timestamp: number;
}

export interface HistoricalTransaction {
  request: ITransactionRequest;
  receipt: ITransactionReceipt;
  timestamp: number;
}

export interface TransactionContextState {
  pendingTransactions: PendingTransaction[];
  history: HistoricalTransaction[];
  error: Error | null;
}

export interface TransactionContextActions {
  prepareTransaction: (request: Partial<ITransactionRequest>) => Promise<ITransactionRequest>;
  sendTransaction: (request: Partial<ITransactionRequest>) => Promise<string>;
  cancelTransaction: (hash: string, gasBumpPercentage?: number) => Promise<void>;
  clearHistory: () => void;
}

export type TransactionContextType = TransactionContextState & TransactionContextActions;

export const TransactionContext = createContext<TransactionContextType | null>(null);
