/**
 * @file providers/index.ts
 * @description Ethers.js implementation of the IProvider interface.
 */

import { JsonRpcProvider } from 'ethers';
import type { IProvider, IBlock, ITransactionReceipt, IFeeData } from '../types/index.js';

export class EthersProviderAdapter implements IProvider {
  private provider: JsonRpcProvider;

  constructor(url: string) {
    this.provider = new JsonRpcProvider(url, undefined, { staticNetwork: true });
  }

  // To allow signers to connect natively if needed under the hood
  public getInternalProvider(): JsonRpcProvider {
    return this.provider;
  }

  public async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  public async getBlock(blockHashOrBlockTag: number | string): Promise<IBlock | null> {
    const block = await this.provider.getBlock(blockHashOrBlockTag);
    if (!block) return null;
    return {
      number: block.number,
      hash: block.hash || '',
      timestamp: block.timestamp,
      parentHash: block.parentHash
    };
  }

  public async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return balance.toString();
  }

  public async getTransactionCount(address: string): Promise<number> {
    return this.provider.getTransactionCount(address);
  }

  public async getFeeData(): Promise<IFeeData> {
    const feeData = await this.provider.getFeeData();
    return {
      gasPrice: feeData.gasPrice?.toString(),
      maxFeePerGas: feeData.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString()
    };
  }

  public async estimateGas(transaction: {
    to?: string;
    from?: string;
    data?: string;
    value?: string;
  }): Promise<string> {
    const limit = await this.provider.estimateGas(transaction);
    return limit.toString();
  }

  public async resolveName(name: string): Promise<string | null> {
    return this.provider.resolveName(name);
  }

  public async lookupAddress(address: string): Promise<string | null> {
    return this.provider.lookupAddress(address);
  }

  public async call(transaction: { to: string; data: string }): Promise<string> {
    return this.provider.call(transaction);
  }

  public async broadcastTransaction(signedTransaction: string): Promise<string> {
    const response = await this.provider.broadcastTransaction(signedTransaction);
    return response.hash;
  }

  public async waitForTransaction(
    transactionHash: string,
    confirmations: number = 1
  ): Promise<ITransactionReceipt> {
    const receipt = await this.provider.waitForTransaction(transactionHash, confirmations);
    if (!receipt) throw new Error('Transaction receipt not found');

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status || 0,
      gasUsed: receipt.gasUsed.toString()
    };
  }
}
