/**
 * @file errors/index.ts
 * @description Custom errors for Account Manager
 */

export class AccountManagerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountManagerError';
  }
}

export class SessionLockedError extends AccountManagerError {
  constructor() {
    super('The session is locked. Action not permitted.');
    this.name = 'SessionLockedError';
  }
}

export class StorageError extends AccountManagerError {
  constructor(reason: string) {
    super(`Storage operation failed: ${reason}`);
    this.name = 'StorageError';
  }
}
