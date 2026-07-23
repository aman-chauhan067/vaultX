/**
 * @file types/index.ts
 * @description Core types for the Secure Vault Keyring
 */

import type { ExportedWallet } from '@vaultx/wallet-engine';

export interface VaultMetadata {
  createdAt: string;
  updatedAt: string;
  version: string;
  walletsCount: number;
}

export interface EncryptedVaultData {
  vaultId: string;
  createdAt: string;
  version: string;
  /** Iterations used for PBKDF2 */
  iterations: number;
  /** Base64 encoded salt for PBKDF2 */
  salt: string;
  /** Base64 encoded Initialization Vector for AES-GCM */
  iv: string;
  /** Base64 encoded AES-GCM Authentication Tag */
  authTag: string;
  /** Base64 encoded ciphertext of the serialized wallet data */
  ciphertext: string;
  metadata: VaultMetadata;
}

export interface VaultState {
  isLocked: boolean;
  vaultId: string | null;
}

export interface SerializedVaultState {
  wallets: Record<string, ExportedWallet>;
  activeWalletId: string | null;
}
