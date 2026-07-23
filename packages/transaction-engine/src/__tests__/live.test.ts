import { describe, it, expect, beforeAll } from 'vitest';
import { ethers } from 'ethers';
import { TransactionExecutor } from '../executor/index.js';
import type {
  IProvider,
  ISigner,
  ITransaction,
  ITransactionReceipt,
  IBlock,
  IFeeData
} from '@vaultx/blockchain-core';
import type { ITransactionRequest } from '../types/index.js';

class EthersProviderAdapter implements IProvider {
  constructor(private provider: ethers.JsonRpcProvider) {}
  async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }
  async getBlock(hashOrTag: string | number): Promise<IBlock | null> {
    const b = await this.provider.getBlock(hashOrTag);
    if (!b) return null;
    return { number: b.number, hash: b.hash!, timestamp: b.timestamp, parentHash: b.parentHash };
  }
  async getBalance(address: string): Promise<string> {
    return (await this.provider.getBalance(address)).toString();
  }
  async getTransactionCount(address: string): Promise<number> {
    return this.provider.getTransactionCount(address);
  }
  async getFeeData(): Promise<IFeeData> {
    const f = await this.provider.getFeeData();
    return {
      gasPrice: f.gasPrice?.toString(),
      maxFeePerGas: f.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: f.maxPriorityFeePerGas?.toString()
    };
  }
  async estimateGas(tx: unknown): Promise<string> {
    const request = tx as ethers.TransactionRequest;
    return (await this.provider.estimateGas(request)).toString();
  }
  async resolveName(name: string): Promise<string | null> {
    return this.provider.resolveName(name);
  }
  async lookupAddress(address: string): Promise<string | null> {
    return this.provider.lookupAddress(address);
  }
  async call(tx: { to: string; data: string }): Promise<string> {
    return this.provider.call(tx);
  }
  async broadcastTransaction(signedTx: string): Promise<string> {
    const response = await this.provider.broadcastTransaction(signedTx);
    return response.hash;
  }
  async waitForTransaction(txHash: string, confirmations?: number): Promise<ITransactionReceipt> {
    const receipt = await this.provider.waitForTransaction(txHash, confirmations);
    if (!receipt) throw new Error('Receipt not found');
    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status!,
      gasUsed: receipt.gasUsed.toString()
    };
  }
}

class EthersSignerAdapter implements ISigner {
  constructor(
    private signer: ethers.Wallet,
    private providerAdapter: IProvider
  ) {}
  async getAddress(): Promise<string> {
    return this.signer.getAddress();
  }
  async signMessage(msg: string | Uint8Array): Promise<string> {
    return this.signer.signMessage(msg);
  }
  async signTypedData(domain: unknown, types: unknown, value: unknown): Promise<string> {
    const d = domain as ethers.TypedDataDomain;
    const t = types as Record<string, ethers.TypedDataField[]>;
    const v = value as Record<string, unknown>;
    return this.signer.signTypedData(d, t, v);
  }
  async signTransaction(tx: Partial<ITransaction>): Promise<string> {
    return this.signer.signTransaction(tx as unknown as ethers.TransactionRequest);
  }
  getProvider(): IProvider | null {
    return this.providerAdapter;
  }
  connect(): ISigner {
    return this;
  }
}

// Skipped by default because it requires a local Anvil node running on 127.0.0.1:8545
describe.skip('TransactionExecutor Live Integration', () => {
  let provider: EthersProviderAdapter;
  let signer: EthersSignerAdapter;
  let hardhatAccount: string;

  beforeAll(async () => {
    const rpc = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    provider = new EthersProviderAdapter(rpc);
    // Hardhat Account #1 private key
    const wallet = new ethers.Wallet(
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
      rpc
    );
    signer = new EthersSignerAdapter(wallet, provider);
    hardhatAccount = await wallet.getAddress();
  });

  it('should create, sign, broadcast and confirm a transaction via executor', async () => {
    const receiver = ethers.Wallet.createRandom().address;
    const nonce = await provider.getTransactionCount(hardhatAccount);

    const txReq: ITransactionRequest = {
      to: receiver,
      from: hardhatAccount,
      nonce: nonce,
      data: '0x',
      value: ethers.parseEther('0.5').toString(),
      chainId: 31337,
      gasLimit: '21000',
      gasPrice: '2000000000', // 2 gwei
      type: 0 // legacy
    };

    const executor = new TransactionExecutor(txReq, { provider, signer });
    const receipt = await executor.execute();

    expect(receipt).toBeDefined();
    expect(receipt.status).toBe(1);
    expect(executor.transactionHash).toBeDefined();

    const balance = await provider.getBalance(receiver);
    expect(balance).toBe(ethers.parseEther('0.5').toString());
  });
});
