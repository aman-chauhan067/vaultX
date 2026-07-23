import { describe, it, expect } from 'vitest';
import { TransactionExecutor, TransactionBuilder, TransactionState } from '../index.js';
import type { IProvider, ISigner } from '@vaultx/blockchain-core';

class MockProvider implements IProvider {
  async getBlockNumber() {
    return 100;
  }
  async getBlock() {
    return null;
  }
  async getBalance() {
    return '1000';
  }
  async getTransactionCount() {
    return 1;
  }
  async getFeeData() {
    return {};
  }
  async estimateGas() {
    return '21000';
  }
  async resolveName() {
    return null;
  }
  async lookupAddress() {
    return null;
  }
  async call() {
    return '0x';
  }
  async broadcastTransaction() {
    return '0xmockhash';
  }
  async waitForTransaction(hash: string) {
    return { transactionHash: hash, blockNumber: 100, status: 1, gasUsed: '21000' };
  }
}

class MockSigner implements ISigner {
  async getAddress() {
    return '0x123';
  }
  async signMessage() {
    return '0xmsg';
  }
  async signTypedData() {
    return '0xtyped';
  }
  async signTransaction() {
    return '0xsignedtx';
  }
  getProvider() {
    return new MockProvider();
  }
  connect() {
    return this;
  }
}

describe('TransactionExecutor', () => {
  it('should execute a transaction and update state properly', async () => {
    const req = TransactionBuilder.create(1)
      .setTo('0x1234567890123456789012345678901234567890')
      .setValue('100')
      .build();
    const provider = new MockProvider();
    const signer = new MockSigner();

    const executor = new TransactionExecutor(req, { provider, signer });

    const states: TransactionState[] = [];
    executor.stateMachine.onTransition((prev, curr) => states.push(curr));

    const receipt = await executor.execute();

    expect(receipt.status).toBe(1);
    expect(executor.transactionHash).toBe('0xmockhash');
    expect(states).toContain(TransactionState.SIGNING);
    expect(states).toContain(TransactionState.SIGNED);
    expect(states).toContain(TransactionState.BROADCASTING);
    expect(states).toContain(TransactionState.PENDING);
    expect(states).toContain(TransactionState.CONFIRMED);
  });

  it('should cancel a pending transaction', async () => {
    const req = TransactionBuilder.create(1)
      .setTo('0x1234567890123456789012345678901234567890')
      .setFrom('0x0987654321098765432109876543210987654321')
      .setMaxFeePerGas('100')
      .setMaxPriorityFeePerGas('10')
      .build();

    const provider = new MockProvider();
    const signer = new MockSigner();

    let resolveWait: (val: unknown) => void;
    let callCount = 0;
    provider.waitForTransaction = async () => {
      callCount++;
      if (callCount === 1) {
        return new Promise((resolve) => {
          resolveWait = resolve;
        });
      }
      return { transactionHash: '0xmockhash2', blockNumber: 101, status: 1, gasUsed: '21000' };
    };

    const executor = new TransactionExecutor(req, { provider, signer });

    const execPromise = executor.execute();

    // Wait a tick to let it reach broadcasting/pending
    await new Promise((r) => setTimeout(r, 50));

    const cancelReceipt = await executor.cancel(10); // bump gas by 10%
    expect(cancelReceipt.status).toBe(1);
    expect(executor.stateMachine.getState()).toBe(TransactionState.CANCELLED);

    // Resolve the original hanging promise to let the test exit cleanly
    resolveWait!({ transactionHash: '0xmockhash', blockNumber: 100, status: 0, gasUsed: '21000' });
    await execPromise;
  });
});
