/**
 * @file types/index.ts
 * @description Core types for the Account Manager
 */

import type { ExportedWallet } from '@vaultx/wallet-engine';

export interface SessionState {
  isLocked: boolean;
  lastActiveTime: number; // Timestamp
  autoLockTimeoutMs: number | null; // Null means disabled
  failedAttempts: number;
  lockoutUntil: number | null;
}

export interface StorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface AccountManagerEvents {
  VaultDeleted: () => void;
  WalletCreated: (wallet: ExportedWallet) => void;
  WalletDeleted: (walletId: string) => void;
  WalletUnlocked: () => void;
  WalletLocked: () => void;
  AccountCreated: (account: ExportedWallet) => void;
  AccountDeleted: (accountId: string) => void;
  AccountChanged: (accountId: string) => void;
  WalletChanged: (walletId: string) => void;
  AddressBookUpdated: () => void;
}
