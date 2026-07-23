import { createContext } from 'react';
import type { ExportedWallet } from '@vaultx/wallet-engine';

export interface WalletContextState {
  isLocked: boolean;
  hasVault: boolean;
  wallets: ExportedWallet[];
  activeWalletId: string | null;
  activeAccountId: string | null;
  error: Error | null;
}

export interface WalletContextActions {
  unlock: (password: string) => Promise<void>;
  createVault: (password: string) => Promise<void>;
  lock: () => void;
  resetVault: () => Promise<void>;
  createWallet: (mnemonic: string, name: string) => Promise<void>;
  deriveAccount: (name: string) => Promise<void>;
  importWallet: (privateKey: string, name: string) => Promise<void>;
  hideWallet: (walletId: string, hidden: boolean) => Promise<void>;
  removeWallet: (walletId: string) => Promise<void>;
  verifyPassword: (password: string) => Promise<boolean>;
  generateMnemonic: (length?: 12 | 24) => string;
  validateMnemonic: (mnemonic: string) => boolean;
  setActiveWallet: (walletId: string) => void;
  setActiveAccount: (accountId: string) => void;
  pingSession: () => void;
  getSessionState: () => {
    isLocked: boolean;
    lockoutUntil: number | null;
    failedAttempts: number;
    autoLockTimeoutMs: number | null;
    lastActiveTime: number;
  };
}

export type WalletContextType = WalletContextState & WalletContextActions;

export const WalletContext = createContext<WalletContextType | null>(null);
