/**
 * @file errors/index.ts
 * @description Custom errors for transaction validation.
 */

export class TransactionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransactionValidationError';
  }
}
