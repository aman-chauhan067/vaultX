import type { IProvider, IBlock, ITransactionReceipt, IFeeData } from '@vaultx/blockchain-core';
import type { ProviderManager } from '@vaultx/network-engine';

export class VaultXProviderAdapter implements IProvider {
  constructor(private providerManager: ProviderManager) {}

  public async getBlockNumber(): Promise<number> {
    return this.providerManager.execute((p: any) => p.getBlockNumber());
  }

  public async getBlock(blockHashOrBlockTag: number | string): Promise<IBlock | null> {
    return this.providerManager.execute(async (p: any) => {
      const block = await p.getBlock(blockHashOrBlockTag);
      if (!block) return null;
      return {
        number: block.number,
        hash: block.hash || '',
        timestamp: block.timestamp,
        parentHash: block.parentHash
      };
    });
  }

  public async getBalance(address: string): Promise<string> {
    return this.providerManager.execute(async (p: any) => {
      const balance = await p.getBalance(address);
      return balance.toString();
    });
  }

  public async getTransactionCount(address: string): Promise<number> {
    return this.providerManager.execute((p: any) => p.getTransactionCount(address));
  }

  public async getFeeData(): Promise<IFeeData> {
    return this.providerManager.execute(async (p: any) => {
      const feeData = await p.getFeeData();
      return {
        gasPrice: feeData.gasPrice?.toString(),
        maxFeePerGas: feeData.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString()
      };
    });
  }

  public async estimateGas(transaction: {
    to?: string;
    from?: string;
    data?: string;
    value?: string;
  }): Promise<string> {
    return this.providerManager.execute(async (p: any) => {
      const limit = await p.estimateGas(transaction);
      return limit.toString();
    });
  }

  public async resolveName(name: string): Promise<string | null> {
    return this.providerManager.execute((p: any) => p.resolveName(name));
  }

  public async lookupAddress(address: string): Promise<string | null> {
    return this.providerManager.execute((p: any) => p.lookupAddress(address));
  }

  public async call(transaction: { to: string; data: string }): Promise<string> {
    return this.providerManager.execute((p: any) => p.call(transaction));
  }

  public async broadcastTransaction(signedTransaction: string): Promise<string> {
    return this.providerManager.execute(async (p: any) => {
      const response = await p.broadcastTransaction(signedTransaction);
      return response.hash;
    });
  }

  public async waitForTransaction(
    transactionHash: string,
    confirmations: number = 1
  ): Promise<ITransactionReceipt> {
    return this.providerManager.execute(async (p: any) => {
      const receipt = await p.waitForTransaction(transactionHash, confirmations);
      if (!receipt) throw new Error('Transaction receipt not found');
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        status: receipt.status || 0,
        gasUsed: receipt.gasUsed.toString()
      };
    });
  }
}
