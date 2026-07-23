/**
 * @file serialization.ts
 * @description Framework-agnostic interface for transaction serialization.
 */

import { Transaction } from 'ethers';
import type { ITransaction } from '../types/index.js';

export class TransactionSerializer {
  public static serialize(tx: Partial<ITransaction>): string {
    const payload: Record<string, unknown> = {
      to: tx.to ?? null,
      from: tx.from,
      nonce: tx.nonce,
      data: tx.data,
      value: tx.value,
      chainId: tx.chainId
    };
    if (payload.from) delete payload.from; // Cannot serialize 'from' in unsigned ethers transaction
    const ethersTx = Transaction.from(payload);
    return ethersTx.unsignedSerialized;
  }

  public static deserialize(serializedTx: string): Partial<ITransaction> {
    const tx = Transaction.from(serializedTx);
    const result: Record<string, unknown> = {
      to: tx.to || undefined,
      from: tx.from || undefined,
      nonce: tx.nonce,
      data: tx.data,
      value: tx.value?.toString(),
      chainId: Number(tx.chainId)
    };
    if (result.to === undefined) delete result.to;
    if (result.from === undefined) delete result.from;
    if (result.value === undefined) delete result.value;
    return result;
  }
}
