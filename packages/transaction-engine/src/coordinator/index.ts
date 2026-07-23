/**
 * @file coordinator/index.ts
 * @description Master orchestrator for preparing transactions safely.
 */

import type { IProvider } from '@vaultx/blockchain-core';
import { TransactionBuilder } from '../builder/index.js';
import { GasEngine } from '../gas/index.js';
import { NonceManager } from '../nonce/index.js';
import type { ITransactionRequest } from '../types/index.js';

export interface CoordinatorOptions {
  gasEngine?: GasEngine;
}

export class TransactionCoordinator {
  private gasEngine: GasEngine;
  private nonceManager: NonceManager;

  constructor(options?: CoordinatorOptions) {
    this.gasEngine = options?.gasEngine ?? new GasEngine();
    this.nonceManager = NonceManager.getInstance();
  }

  /**
   * Prepares a transaction by fetching gas, estimating limit, and allocating a sequential nonce.
   */
  public async prepareTransaction(
    partialReq: Omit<
      ITransactionRequest,
      'nonce' | 'gasLimit' | 'maxFeePerGas' | 'maxPriorityFeePerGas' | 'gasPrice'
    >,
    provider: IProvider
  ): Promise<ITransactionRequest> {
    let builder = TransactionBuilder.create(partialReq.chainId);

    if (partialReq.to) builder = builder.setTo(partialReq.to);
    if (partialReq.from) builder = builder.setFrom(partialReq.from);
    if (partialReq.value) builder = builder.setValue(partialReq.value);
    if (partialReq.data) builder = builder.setData(partialReq.data);
    if (partialReq.type !== undefined) builder = builder.setType(partialReq.type);

    // 1. Gas Fees (EIP-1559 or Legacy)
    builder = await this.gasEngine.populateFees(builder, provider);

    // 2. Gas Limit (with safety caps)
    builder = await this.gasEngine.populateGasLimit(builder, provider);

    // 3. Nonce Allocation (done last so we don't hold a nonce if gas fails)
    if (!partialReq.from) {
      throw new Error('Cannot prepare transaction without a sender (from)');
    }
    const nonce = await this.nonceManager.getNextNonce(partialReq.from, provider);
    builder = builder.setNonce(nonce);

    try {
      return builder.build();
    } catch (err) {
      // If validation fails after building, release the nonce
      this.nonceManager.releaseNonce(partialReq.from, nonce);
      throw err;
    }
  }

  /**
   * Cancels a pending transaction by sending 0 ETH to self with the same nonce and 10% bumped gas.
   */
  public async prepareCancelTransaction(
    originalReq: ITransactionRequest,
    provider: IProvider
  ): Promise<ITransactionRequest> {
    if (!originalReq.nonce) throw new Error('Cannot cancel a transaction without a nonce');
    if (!originalReq.from) throw new Error('Cannot cancel a transaction without a sender');

    let builder = TransactionBuilder.create(originalReq.chainId)
      .setFrom(originalReq.from)
      .setTo(originalReq.from) // send to self
      .setValue('0')
      .setData('0x')
      .setNonce(originalReq.nonce);

    // Bump fee by 15% to ensure replacement
    const bump = (val: string) => ((BigInt(val) * 115n) / 100n).toString();

    if (originalReq.maxFeePerGas) {
      builder = builder
        .setMaxFeePerGas(bump(originalReq.maxFeePerGas))
        .setMaxPriorityFeePerGas(bump(originalReq.maxPriorityFeePerGas!))
        .setType(originalReq.type);
    } else if (originalReq.gasPrice) {
      builder = builder.setGasPrice(bump(originalReq.gasPrice)).setType(originalReq.type);
    } else {
      // If the original didn't have fees populated, just fetch current ones and bump slightly
      builder = await this.gasEngine.populateFees(builder, provider);
      const tempReq = builder.build();
      if (tempReq.maxFeePerGas) {
        builder = builder
          .setMaxFeePerGas(bump(tempReq.maxFeePerGas))
          .setMaxPriorityFeePerGas(bump(tempReq.maxPriorityFeePerGas!));
      } else if (tempReq.gasPrice) {
        builder = builder.setGasPrice(bump(tempReq.gasPrice));
      }
    }

    builder = builder.setGasLimit('21000'); // 0 ETH to self is always 21000

    return builder.build();
  }
}
