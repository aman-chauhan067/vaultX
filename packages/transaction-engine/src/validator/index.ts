/**
 * @file validator/index.ts
 * @description Validates transactions for correctness, bounds, and combinations.
 */

import { TransactionValidationError } from '../errors/index.js';
import { TransactionType, type ITransactionRequest } from '../types/index.js';

export class TransactionValidator {
  private static isAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  private static isHexNumber(value: string): boolean {
    return /^0x[a-fA-F0-9]*$/.test(value) || /^\d+$/.test(value);
  }

  public static validate(tx: ITransactionRequest): void {
    if (tx.chainId <= 0) {
      throw new TransactionValidationError('ChainId must be greater than 0');
    }

    if (tx.to && !this.isAddress(tx.to)) {
      throw new TransactionValidationError('Invalid "to" address');
    }

    if (tx.to && tx.to === '0x0000000000000000000000000000000000000000') {
      throw new TransactionValidationError('Cannot send to zero address');
    }

    if (tx.from && !this.isAddress(tx.from)) {
      throw new TransactionValidationError('Invalid "from" address');
    }

    if (tx.value && !this.isHexNumber(tx.value)) {
      throw new TransactionValidationError('Invalid value format');
    }

    if (tx.nonce !== undefined && tx.nonce < 0) {
      throw new TransactionValidationError('Nonce cannot be negative');
    }

    if (tx.type === TransactionType.LEGACY) {
      if (tx.maxFeePerGas !== undefined || tx.maxPriorityFeePerGas !== undefined) {
        throw new TransactionValidationError('Legacy transactions cannot specify EIP-1559 fees');
      }
    }

    if (tx.type === TransactionType.EIP1559 || tx.type === TransactionType.EIP4844) {
      if (tx.gasPrice !== undefined) {
        throw new TransactionValidationError(
          'EIP-1559/EIP-4844 transactions cannot specify gasPrice'
        );
      }

      if (tx.maxFeePerGas && tx.maxPriorityFeePerGas) {
        const max = BigInt(tx.maxFeePerGas);
        const priority = BigInt(tx.maxPriorityFeePerGas);
        if (priority > max) {
          throw new TransactionValidationError('maxPriorityFeePerGas cannot exceed maxFeePerGas');
        }
      }
    }
  }
}
