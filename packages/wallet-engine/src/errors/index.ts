/**
 * @file errors/index.ts
 * @description Custom error classes for the Wallet Engine ensuring no sensitive data is logged
 */

export class WalletEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletEngineError';
  }
}

export class InvalidMnemonicError extends WalletEngineError {
  constructor() {
    super('The provided mnemonic is invalid or fails the checksum verification.');
    this.name = 'InvalidMnemonicError';
  }
}

export class DerivationError extends WalletEngineError {
  constructor(reason: string) {
    super(`Failed to derive HD node: ${reason}`);
    this.name = 'DerivationError';
  }
}
