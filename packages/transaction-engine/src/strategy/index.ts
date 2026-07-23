/**
 * @file strategy/index.ts
 * @description Strategies for dynamic transaction population (Nonce and Gas).
 */

import type { IProvider } from '@vaultx/blockchain-core';
import type { TransactionBuilder } from '../builder/index.js';
import { TransactionType } from '../types/index.js';

export class TransactionPopulator {
  public static async populateNonce(
    builder: TransactionBuilder,
    provider: IProvider,
    fromAddress: string
  ): Promise<TransactionBuilder> {
    const nonce = await provider.getTransactionCount(fromAddress);
    return builder.setNonce(nonce).setFrom(fromAddress);
  }

  public static async populateFee(
    builder: TransactionBuilder,
    provider: IProvider
  ): Promise<TransactionBuilder> {
    const feeData = await provider.getFeeData();
    const req = builder.build();

    if (req.type === TransactionType.LEGACY) {
      if (!feeData.gasPrice) throw new Error('Network did not return gasPrice');
      return builder.setGasPrice(feeData.gasPrice);
    } else {
      if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
        throw new Error('Network did not return EIP-1559 fee data');
      }
      return builder
        .setMaxFeePerGas(feeData.maxFeePerGas)
        .setMaxPriorityFeePerGas(feeData.maxPriorityFeePerGas);
    }
  }

  public static async estimateGasLimit(
    builder: TransactionBuilder,
    provider: IProvider
  ): Promise<TransactionBuilder> {
    const req = builder.build();
    if (!req.to || !req.from) {
      throw new Error('Cannot estimate gas without "to" and "from" addresses');
    }

    const payload: { to: string; from: string; data: string; value?: string } = {
      to: req.to,
      from: req.from,
      data: req.data || '0x'
    };
    if (req.value !== undefined) payload.value = req.value;
    const limit = await provider.estimateGas(payload);
    return builder.setGasLimit(limit);
  }
}
