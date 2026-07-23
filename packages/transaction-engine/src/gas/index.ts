/**
 * @file gas/index.ts
 * @description Gas estimation and fee preparation.
 */

import type { IProvider } from '@vaultx/blockchain-core';
import type { TransactionBuilder } from '../builder/index.js';
import { TransactionType } from '../types/index.js';

export interface GasEngineOptions {
  gasLimitMarginPercent?: number; // default 10%
  maxGasLimitCap?: string | bigint; // default 30,000,000
}

export class GasEngine {
  private marginPercent: number;
  private maxCap: bigint;

  constructor(options?: GasEngineOptions) {
    this.marginPercent = options?.gasLimitMarginPercent ?? 10;
    this.maxCap = BigInt(options?.maxGasLimitCap ?? 30_000_000);
  }

  public async populateFees(
    builder: TransactionBuilder,
    provider: IProvider
  ): Promise<TransactionBuilder> {
    const feeData = await provider.getFeeData();

    if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
      // EIP-1559 supported
      return builder
        .setType(TransactionType.EIP1559)
        .setMaxFeePerGas(feeData.maxFeePerGas.toString())
        .setMaxPriorityFeePerGas(feeData.maxPriorityFeePerGas.toString());
    } else if (feeData.gasPrice) {
      // Legacy fallback
      return builder.setType(TransactionType.LEGACY).setGasPrice(feeData.gasPrice.toString());
    } else {
      throw new Error('Network returned invalid fee data (neither EIP-1559 nor legacy)');
    }
  }

  public async populateGasLimit(
    builder: TransactionBuilder,
    provider: IProvider
  ): Promise<TransactionBuilder> {
    const req = builder.build();
    if (!req.to || !req.from) {
      throw new Error('Cannot estimate gas limit without "to" and "from" addresses');
    }

    const payload: { to: string; from: string; data: string; value?: string } = {
      to: req.to,
      from: req.from,
      data: req.data || '0x'
    };

    if (req.value !== undefined && req.value !== '0') {
      payload.value = req.value;
    }

    // Native exact transfer optimization
    if (payload.data === '0x' && req.value) {
      // simple transfer is always 21000
      return builder.setGasLimit('21000');
    }

    let estimatedLimit: string;
    try {
      estimatedLimit = await provider.estimateGas(payload);
    } catch (err: any) {
      throw new Error(`Gas estimation failed: ${err.message || String(err)}`);
    }

    let limitBig = BigInt(estimatedLimit);

    // Apply safety margin
    if (limitBig > 21000n) {
      limitBig = (limitBig * BigInt(100 + this.marginPercent)) / 100n;
    }

    // Safety Cap
    if (limitBig > this.maxCap) {
      throw new Error(
        `Estimated gas limit ${limitBig.toString()} exceeds safety cap of ${this.maxCap.toString()}`
      );
    }

    return builder.setGasLimit(limitBig.toString());
  }
}
