/**
 * @file types/index.ts
 * @description Types for transaction building.
 */

export enum TransactionType {
  LEGACY = 0,
  EIP2930 = 1,
  EIP1559 = 2,
  EIP4844 = 3
}

export interface AccessListEntry {
  address: string;
  storageKeys: string[];
}

export interface ITransactionRequest {
  type: TransactionType;
  chainId: number;
  nonce?: number;
  to?: string;
  from?: string;
  data?: string;
  value?: string;

  // Legacy
  gasPrice?: string;

  // EIP-1559 / EIP-4844
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;

  // EIP-2930+
  accessList?: AccessListEntry[];

  // Base
  gasLimit?: string;
}
