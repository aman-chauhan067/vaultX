/**
 * @file types/index.ts
 * @description Framework-independent interfaces for the Blockchain Abstraction Layer.
 */

export interface IBlock {
  number: number;
  hash: string;
  timestamp: number;
  parentHash: string;
}

export interface ITransaction {
  hash: string;
  to?: string;
  from: string;
  nonce: number;
  data: string;
  value: string;
  chainId: number;
}

export interface ITransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  status: number;
  gasUsed: string;
}

export interface IFeeData {
  gasPrice?: string | undefined;
  maxFeePerGas?: string | undefined;
  maxPriorityFeePerGas?: string | undefined;
}

export interface IProvider {
  getBlockNumber(): Promise<number>;
  getBlock(blockHashOrBlockTag: number | string): Promise<IBlock | null>;
  getBalance(address: string): Promise<string>; // Returns balance in wei as string
  getTransactionCount(address: string): Promise<number>;
  getFeeData(): Promise<IFeeData>;
  estimateGas(transaction: {
    to?: string;
    from?: string;
    data?: string;
    value?: string;
  }): Promise<string>;
  resolveName(name: string): Promise<string | null>;
  lookupAddress(address: string): Promise<string | null>;
  call(transaction: { to: string; data: string }): Promise<string>;
  broadcastTransaction(signedTransaction: string): Promise<string>;
  waitForTransaction(transactionHash: string, confirmations?: number): Promise<ITransactionReceipt>;
}

export interface ISigner {
  getAddress(): Promise<string>;
  signMessage(message: string | Uint8Array): Promise<string>;
  signTypedData(
    domain: Record<string, unknown>,
    types: Record<string, unknown[]>,
    value: Record<string, unknown>
  ): Promise<string>;
  signTransaction(transaction: Partial<ITransaction>): Promise<string>;
  getProvider(): IProvider | null;
  connect(provider: IProvider): ISigner;
}
