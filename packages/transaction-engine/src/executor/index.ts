/**
 * @file executor/index.ts
 * @description The Transaction Execution Pipeline coordinating signing, broadcast, and tracking.
 */

import type {
  IProvider,
  ISigner,
  ITransactionReceipt,
  ITransaction
} from '@vaultx/blockchain-core';
import type { ITransactionRequest } from '../types/index.js';
import { TransactionStateMachine, TransactionState } from '../state/index.js';

export interface ExecutorOptions {
  provider: IProvider;
  signer: ISigner;
}

export class TransactionExecutor {
  public readonly stateMachine: TransactionStateMachine;
  private provider: IProvider;
  private signer: ISigner;
  private transactionReq: ITransactionRequest;

  public transactionHash?: string;
  public receipt?: ITransactionReceipt;
  public error?: Error;

  constructor(transactionReq: Readonly<ITransactionRequest>, options: ExecutorOptions) {
    this.transactionReq = { ...transactionReq };
    this.provider = options.provider;
    this.signer = options.signer;
    this.stateMachine = new TransactionStateMachine();
    // Transition from Created to Validated immediately as builder already validated it
    this.stateMachine.transition(TransactionState.VALIDATED);
    this.stateMachine.transition(TransactionState.READY);
  }

  public async execute(): Promise<ITransactionReceipt> {
    try {
      // 1. Signing
      this.stateMachine.transition(TransactionState.SIGNING);
      // Construct the partial transaction for ISigner
      const txToSign = {
        to: this.transactionReq.to,
        from: this.transactionReq.from,
        nonce: this.transactionReq.nonce,
        data: this.transactionReq.data,
        value: this.transactionReq.value,
        chainId: this.transactionReq.chainId
      };
      // For EIP-1559 we'd also pass fees, but we need to ensure ISigner accepts them.
      // Ethers ISigner signTransaction accepts a full transaction object.
      const signedTx = await this.signer.signTransaction({
        ...txToSign,
        gasPrice: this.transactionReq.gasPrice,
        maxFeePerGas: this.transactionReq.maxFeePerGas,
        maxPriorityFeePerGas: this.transactionReq.maxPriorityFeePerGas,
        gasLimit: this.transactionReq.gasLimit,
        type: this.transactionReq.type
      } as unknown as Partial<ITransaction>);
      this.stateMachine.transition(TransactionState.SIGNED, signedTx);

      // 2. Broadcasting
      this.stateMachine.transition(TransactionState.BROADCASTING);
      let txHash: string;
      try {
        txHash = await this.provider.broadcastTransaction(signedTx);
      } catch (broadcastErr) {
        // Broadcast failed, nonce is NOT consumed on chain. Release it to prevent gridlock.
        if (this.transactionReq.nonce !== undefined && this.transactionReq.from) {
          try {
            const { NonceManager } = await import('../nonce/index.js');
            NonceManager.getInstance().releaseNonce(
              this.transactionReq.from,
              this.transactionReq.nonce
            );
          } catch (e) {
            console.error('Failed to release nonce after broadcast error', e);
          }
        }
        throw broadcastErr;
      }
      this.transactionHash = txHash;
      this.stateMachine.transition(TransactionState.PENDING, txHash);

      // 3. Tracking Confirmations
      const receipt = await this.provider.waitForTransaction(txHash, 1);

      // If we got cancelled/replaced while waiting, stop processing.
      if (
        this.stateMachine.getState() === TransactionState.CANCELLED ||
        this.stateMachine.getState() === TransactionState.REPLACED
      ) {
        return this.receipt || receipt;
      }

      if (receipt.status === 0) {
        throw new Error('Transaction reverted on chain');
      }

      this.receipt = receipt;
      this.stateMachine.transition(TransactionState.CONFIRMED, receipt);

      return receipt;
    } catch (err: unknown) {
      this.error = err instanceof Error ? err : new Error(String(err));
      this.stateMachine.transition(TransactionState.FAILED, this.error);
      throw this.error;
    }
  }

  public async cancel(gasBumpPercentage: number = 10): Promise<ITransactionReceipt> {
    if (!this.transactionHash)
      throw new Error('Cannot cancel a transaction that is not broadcasting/pending');

    const sender = this.transactionReq.from;
    if (!sender) throw new Error('Cannot cancel a transaction without a sender address');

    const cancelReq = { ...this.transactionReq, to: sender, value: '0', data: '0x' };

    if (cancelReq.maxFeePerGas) {
      const base = BigInt(cancelReq.maxFeePerGas);
      cancelReq.maxFeePerGas = ((base * BigInt(100 + gasBumpPercentage)) / 100n).toString();
      const priority = BigInt(cancelReq.maxPriorityFeePerGas!);
      cancelReq.maxPriorityFeePerGas = (
        (priority * BigInt(100 + gasBumpPercentage)) /
        100n
      ).toString();
    } else if (cancelReq.gasPrice) {
      const price = BigInt(cancelReq.gasPrice);
      cancelReq.gasPrice = ((price * BigInt(100 + gasBumpPercentage)) / 100n).toString();
    }

    const replacementExecutor = new TransactionExecutor(cancelReq, {
      provider: this.provider,
      signer: this.signer
    });
    const receipt = await replacementExecutor.execute();

    this.stateMachine.transition(TransactionState.CANCELLED, receipt);
    return receipt;
  }
}
