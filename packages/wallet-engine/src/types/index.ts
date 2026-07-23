/**
 * @file types/index.ts
 * @description Core types for the Wallet Engine
 */

export interface BackupStatus {
  verified: boolean;
  lastVerified?: string;
  reminderInterval?: number;
  recoveryTested?: boolean;
}

export interface WalletMetadata {
  /** Unique identifier for the wallet instance */
  walletId: string;
  /** Name of the wallet provided by the user */
  walletName: string;
  /** ISO 8601 timestamp of creation */
  createdAt: string;
  /** The BIP44 account index this wallet represents (e.g. 0 for m/44'/60'/0'/0/0) */
  accountIndex: number;
  /** The type of the wallet */
  walletType: 'HD' | 'IMPORTED' | 'WATCH_ONLY';
  /** The source of the wallet (e.g. "manual", "imported", "watch") */
  source: string;
  /** ISO 8601 timestamp of last activity */
  lastSeen?: string;
  /** Whether the wallet is marked as favorite */
  favorite: boolean;
  /** Whether the wallet is hidden from main views */
  hidden: boolean;
  /** Whether the wallet is archived */
  archived: boolean;
  /** The derivation path if applicable */
  hdPath?: string;
  /** Verification status of the backup */
  backupStatus?: BackupStatus;
}

export interface ExportedWallet {
  /** The 12 or 24-word BIP39 mnemonic phrase (if exported at root level) */
  mnemonic?: string;
  /** The Ethereum private key (0x-prefixed). Optional for watch-only wallets. */
  privateKey?: string;
  /** The Ethereum uncompressed public key (0x-prefixed). Optional for watch-only wallets. */
  publicKey?: string;
  /** The checksummed Ethereum address (0x-prefixed) */
  address: string;
  /** Wallet metadata */
  metadata: WalletMetadata;
}

export type MnemonicLength = 12 | 24;
