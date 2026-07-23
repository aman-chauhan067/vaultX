/**
 * @file controllers/AccountManager.ts
 * @description The central coordinator connecting Keyring, Storage, and Session.
 */

import { KeyringController, type EncryptedVaultData } from '@vaultx/keyring';
import type { ExportedWallet } from '@vaultx/wallet-engine';
import { generateMnemonic, validateMnemonic } from '@vaultx/wallet-engine';
import { TypedEventEmitter } from '../events/index.js';
import { SessionLockedError, StorageError } from '../errors/index.js';
import type { SessionState, StorageInterface } from '../types/index.js';

const STORAGE_KEY = 'vaultx_encrypted_vault';
const DEFAULT_AUTO_LOCK_MS = 5 * 60 * 1000; // 5 minutes

export class AccountManager {
  private keyring: KeyringController;
  private storage: StorageInterface;
  public events: TypedEventEmitter;

  private session: SessionState & { password?: string } = {
    isLocked: true,
    lastActiveTime: Date.now(),
    autoLockTimeoutMs: DEFAULT_AUTO_LOCK_MS,
    failedAttempts: 0,
    lockoutUntil: null
  };

  private autoLockTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(storage: StorageInterface) {
    this.storage = storage;
    this.keyring = new KeyringController();
    this.events = new TypedEventEmitter();
  }

  public getKeyringController(): KeyringController {
    return this.keyring;
  }

  /**
   * Initializes the manager, checking if a vault exists in storage.
   * @returns boolean - True if a vault exists and needs unlocking, false if brand new.
   */
  public async hasExistingVault(): Promise<boolean> {
    const data = await this.storage.getItem(STORAGE_KEY);
    return data !== null;
  }

  /**
   * Updates the last active time to prevent auto-lock.
   */
  public pingSession(): void {
    if (!this.session.isLocked) {
      this.session.lastActiveTime = Date.now();
      this.resetAutoLockTimer();
    }
  }

  /**
   * Configures the auto-lock timeout.
   */
  public setAutoLockTimeout(ms: number | null): void {
    this.session.autoLockTimeoutMs = ms;
    this.resetAutoLockTimer();
  }

  private resetAutoLockTimer(): void {
    if (this.autoLockTimer) {
      clearTimeout(this.autoLockTimer);
      this.autoLockTimer = null;
    }

    if (this.session.autoLockTimeoutMs !== null && !this.session.isLocked) {
      this.autoLockTimer = setTimeout(() => {
        this.lock();
      }, this.session.autoLockTimeoutMs);
    }
  }

  /**
   * Locks the account manager and the keyring.
   */
  public lock(): void {
    this.keyring.lock();
    this.session.isLocked = true;
    delete this.session.password;
    if (this.autoLockTimer) {
      clearTimeout(this.autoLockTimer);
      this.autoLockTimer = null;
    }
    this.events.emit('WalletLocked');
  }

  /**
   * Unlocks the account manager using a password.
   */
  public async unlock(password: string): Promise<void> {
    if (this.session.lockoutUntil && Date.now() < this.session.lockoutUntil) {
      throw new Error(`Vault is locked due to too many failed attempts. Try again later.`);
    }

    const rawData = await this.storage.getItem(STORAGE_KEY);
    if (!rawData) {
      throw new StorageError('No vault found in storage.');
    }

    const encryptedVault: EncryptedVaultData = JSON.parse(rawData);

    try {
      await this.keyring.unlockVault(password, encryptedVault);
    } catch {
      this.session.failedAttempts += 1;
      if (this.session.failedAttempts >= 5) {
        this.session.lockoutUntil = Date.now() + 30 * 1000; // 30 seconds cooldown
      }
      throw new Error('Incorrect password');
    }

    this.session.failedAttempts = 0;
    this.session.lockoutUntil = null;
    this.session.isLocked = false;
    this.session.password = password;
    this.pingSession();
    this.events.emit('WalletUnlocked');
  }

  /**
   * Creates a brand new vault and stores it.
   */
  public async createVault(password: string): Promise<void> {
    // If a vault already exists, we might want to warn or prevent overwrite, but we'll overwrite for now.
    const encryptedVault = await this.keyring.createVault(password);
    await this.storage.setItem(STORAGE_KEY, JSON.stringify(encryptedVault));

    // Once created, unlock it automatically
    await this.unlock(password);
  }

  /**
   * Ensures the session is active and valid.
   */
  private ensureUnlocked(): void {
    if (this.session.isLocked) {
      throw new SessionLockedError();
    }
    this.pingSession();
  }

  /**
   * Resets the entire vault, clearing storage and memory.
   */
  public async resetVault(): Promise<void> {
    this.lock();
    await this.storage.removeItem(STORAGE_KEY);
    this.events.emit('VaultDeleted');
  }

  /**
   * Retrieves all wallets.
   */
  public getWallets(): Record<string, ExportedWallet> {
    this.ensureUnlocked();
    return this.keyring.getWallets();
  }

  /**
   * Retrieves the current session state.
   */
  public getSessionState(): SessionState {
    return {
      isLocked: this.session.isLocked,
      lastActiveTime: this.session.lastActiveTime,
      autoLockTimeoutMs: this.session.autoLockTimeoutMs,
      failedAttempts: this.session.failedAttempts,
      lockoutUntil: this.session.lockoutUntil
    };
  }

  /**
   * Retrieves the active wallet.
   */
  public getActiveWallet(): ExportedWallet | null {
    this.ensureUnlocked();
    const activeId = this.keyring.getActiveWalletId();
    if (!activeId) return null;
    return this.keyring.getWallets()[activeId] ?? null;
  }

  /**
   * Switches the active wallet.
   */
  public setActiveWallet(walletId: string): void {
    this.ensureUnlocked();
    this.keyring.setActiveWallet(walletId);
    this.events.emit('WalletChanged', walletId);
  }

  /**
   * Generates a new random BIP39 mnemonic phrase.
   */
  public generateMnemonic(length: 12 | 24 = 12): string {
    return generateMnemonic(length);
  }

  /**
   * Validates a BIP39 mnemonic phrase.
   */
  public validateMnemonic(mnemonic: string): boolean {
    try {
      return validateMnemonic(mnemonic);
    } catch {
      return false;
    }
  }

  /**
   * Generates a new wallet from mnemonic and updates storage.
   */
  public async generateWalletFromMnemonic(
    mnemonic: string,
    accountIndex: number = 0,
    name?: string
  ): Promise<ExportedWallet> {
    this.ensureUnlocked();

    const wallet = this.keyring.generateWalletFromMnemonic(mnemonic, accountIndex, name);
    this.events.emit('WalletCreated', wallet);

    // Persist new state
    if (this.session.password) {
      await this.persistState(this.session.password);
    }

    return wallet;
  }

  /**
   * Imports a private key as a wallet and updates storage.
   */
  public async importWallet(privateKey: string, name?: string): Promise<ExportedWallet> {
    this.ensureUnlocked();

    const wallet = this.keyring.importWallet(privateKey, name);
    this.events.emit('WalletCreated', wallet);

    // Persist new state
    if (this.session.password) {
      await this.persistState(this.session.password);
    }

    return wallet;
  }

  /**
   * Removes a wallet.
   */
  public async removeWallet(walletId: string): Promise<void> {
    this.ensureUnlocked();
    this.keyring.removeWallet(walletId);
    this.events.emit('WalletDeleted', walletId);

    if (this.session.password) {
      await this.persistState(this.session.password);
    }
  }

  /**
   * Persists the current unlocked state back to storage by re-encrypting.
   */
  private async persistState(password: string): Promise<void> {
    const encryptedVault = await this.keyring.createVault(password);
    await this.storage.setItem(STORAGE_KEY, JSON.stringify(encryptedVault));
  }

  // --- Phase 5 Additions ---

  /**
   * Imports a watch-only address.
   */
  public async importWatchOnlyWallet(address: string, name?: string): Promise<ExportedWallet> {
    this.ensureUnlocked();
    const wallet = this.keyring.importWatchOnlyWallet(address, name);
    this.events.emit('WalletCreated', wallet);
    if (this.session.password) {
      await this.persistState(this.session.password);
    }
    return wallet;
  }

  /**
   * Sets backup verified status for a wallet.
   */
  public async setBackupVerified(walletId: string, verified: boolean): Promise<void> {
    this.ensureUnlocked();
    const wallets = this.keyring.getWallets();
    if (wallets[walletId] && wallets[walletId].metadata.backupStatus) {
      wallets[walletId].metadata.backupStatus!.verified = verified;
      wallets[walletId].metadata.backupStatus!.lastVerified = new Date().toISOString();
      if (this.session.password) {
        await this.persistState(this.session.password);
      }
    }
  }

  /**
   * Clears the system clipboard securely if possible.
   * In a browser extension, this requires explicit permissions or interactions,
   * but we can attempt to write empty string.
   */
  public async clearClipboard(): Promise<void> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText('');
      }
    } catch {
      // Ignore if not permitted
    }
  }
}
