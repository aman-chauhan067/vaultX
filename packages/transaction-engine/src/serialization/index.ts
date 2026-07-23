/**
 * @file serialization/index.ts
 * @description Serialization wrapper for transactions.
 */

import { TransactionSerializer as CoreSerializer } from '@vaultx/blockchain-core';
import type { ITransactionRequest } from '../types/index.js';
import type { ITransaction } from '@vaultx/blockchain-core';

export class TransactionSerializer {
  public static serialize(tx: ITransactionRequest): string {
    const payload = { ...tx };
    if (payload.value === undefined) delete payload.value;
    if (payload.to === undefined) delete payload.to;
    if (payload.from === undefined) delete payload.from;

    return CoreSerializer.serialize(payload as unknown as ITransaction);
  }

  public static deserialize(serializedTx: string): Partial<ITransactionRequest> {
    const raw = CoreSerializer.deserialize(serializedTx);
    const result: Partial<ITransactionRequest> = { ...raw };
    if (result.value === undefined) delete result.value;
    return result;
  }
}
