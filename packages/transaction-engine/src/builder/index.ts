/**
 * @file builder/index.ts
 * @description Immutable transaction builder.
 */

import { TransactionValidator } from '../validator/index.js';
import { TransactionType, type ITransactionRequest, type AccessListEntry } from '../types/index.js';

export class TransactionBuilder {
  private readonly req: ITransactionRequest;

  private constructor(req: ITransactionRequest) {
    this.req = { ...req }; // Immutable copy
  }

  public static create(chainId: number): TransactionBuilder {
    return new TransactionBuilder({
      chainId,
      type: TransactionType.EIP1559 // default to EIP-1559
    });
  }

  public setType(type: TransactionType): TransactionBuilder {
    const clone = { ...this.req, type };
    if (type === TransactionType.LEGACY) {
      delete clone.maxFeePerGas;
      delete clone.maxPriorityFeePerGas;
      delete clone.accessList;
    } else if (type === TransactionType.EIP1559) {
      delete clone.gasPrice;
    }
    return new TransactionBuilder(clone);
  }

  public setTo(address: string): TransactionBuilder {
    return new TransactionBuilder({ ...this.req, to: address });
  }

  public setFrom(address: string): TransactionBuilder {
    return new TransactionBuilder({ ...this.req, from: address });
  }

  public setValue(value: string | bigint): TransactionBuilder {
    return new TransactionBuilder({ ...this.req, value: value.toString() });
  }

  public setData(data: string): TransactionBuilder {
    return new TransactionBuilder({ ...this.req, data });
  }

  public setNonce(nonce: number): TransactionBuilder {
    return new TransactionBuilder({ ...this.req, nonce });
  }

  public setGasLimit(limit: string | bigint): TransactionBuilder {
    return new TransactionBuilder({ ...this.req, gasLimit: limit.toString() });
  }

  public setGasPrice(price: string | bigint): TransactionBuilder {
    return new TransactionBuilder({
      ...this.req,
      gasPrice: price.toString(),
      type: TransactionType.LEGACY
    });
  }

  public setMaxFeePerGas(fee: string | bigint): TransactionBuilder {
    return new TransactionBuilder({ ...this.req, maxFeePerGas: fee.toString() });
  }

  public setMaxPriorityFeePerGas(fee: string | bigint): TransactionBuilder {
    return new TransactionBuilder({ ...this.req, maxPriorityFeePerGas: fee.toString() });
  }

  public setAccessList(list: AccessListEntry[]): TransactionBuilder {
    const type = this.req.type === TransactionType.LEGACY ? TransactionType.EIP2930 : this.req.type;
    return new TransactionBuilder({ ...this.req, accessList: [...list], type });
  }

  public build(): Readonly<ITransactionRequest> {
    TransactionValidator.validate(this.req);
    return Object.freeze({ ...this.req });
  }
}
