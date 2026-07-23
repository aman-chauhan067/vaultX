/**
 * @file signers/index.ts
 * @description Ethers.js implementation of the ISigner interface.
 */

import { Wallet, type TypedDataField } from 'ethers';
import type { ISigner, IProvider, ITransaction } from '../types/index.js';
import { EthersProviderAdapter } from '../providers/index.js';

export class EthersSignerAdapter implements ISigner {
  private signer: Wallet;
  private providerAdapter: IProvider | null = null;

  constructor(privateKey: string, providerAdapter?: IProvider) {
    this.signer = new Wallet(privateKey);
    if (providerAdapter) {
      this.connect(providerAdapter);
    }
  }

  public async getAddress(): Promise<string> {
    return this.signer.getAddress();
  }

  public async signMessage(message: string | Uint8Array): Promise<string> {
    return this.signer.signMessage(message);
  }

  public async signTypedData(
    domain: Record<string, unknown>,
    types: Record<string, unknown[]>,
    value: Record<string, unknown>
  ): Promise<string> {
    return this.signer.signTypedData(
      domain,
      types as unknown as Record<string, TypedDataField[]>,
      value
    );
  }

  public async signTransaction(transaction: Partial<ITransaction>): Promise<string> {
    return this.signer.signTransaction(transaction);
  }

  public getProvider(): IProvider | null {
    return this.providerAdapter;
  }

  public connect(provider: IProvider): ISigner {
    this.providerAdapter = provider;
    if (provider instanceof EthersProviderAdapter) {
      this.signer = this.signer.connect(provider.getInternalProvider()) as Wallet;
    }
    return this;
  }
}
