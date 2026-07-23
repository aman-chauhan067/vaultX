/**
 * @file factories/index.ts
 * @description Factories to instantiate blockchain resources without leaking ethers.js
 */

import { EthersProviderAdapter } from '../providers/index.js';
import { EthersSignerAdapter } from '../signers/index.js';
import type { IProvider, ISigner } from '../types/index.js';

export class BlockchainFactory {
  /**
   * Creates a new provider instance connected to the given URL.
   */
  public static createProvider(url: string): IProvider {
    return new EthersProviderAdapter(url);
  }

  /**
   * Creates a new signer instance from a private key.
   */
  public static createSigner(privateKey: string, provider?: IProvider): ISigner {
    return new EthersSignerAdapter(privateKey, provider);
  }
}
