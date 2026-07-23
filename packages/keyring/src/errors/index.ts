/**
 * @file errors/index.ts
 * @description Custom error classes for the Keyring ensuring no sensitive data is logged
 */

export class KeyringError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KeyringError';
  }
}

export class VaultLockedError extends KeyringError {
  constructor() {
    super('The vault is locked. You must unlock it before accessing wallets.');
    this.name = 'VaultLockedError';
  }
}

export class InvalidPasswordError extends KeyringError {
  constructor() {
    // We intentionally don't log the password in the error
    super('Invalid password provided.');
    this.name = 'InvalidPasswordError';
  }
}

export class EncryptionError extends KeyringError {
  constructor(reason: string = 'Encryption failed') {
    super(reason);
    this.name = 'EncryptionError';
  }
}

export class DecryptionError extends KeyringError {
  constructor(reason: string = 'Decryption failed (Possible tampering or wrong password)') {
    super(reason);
    this.name = 'DecryptionError';
  }
}
