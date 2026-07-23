/**
 * @file controllers/KeyringController.ts
 * @description The main controller managing vault state, encryption, and keys.
 */

import {
  generateAccountFromMnemonic,
  importWalletFromPrivateKey,
  importWatchOnlyWallet,
  type ExportedWallet
} from '@vaultx/wallet-engine';
import { deriveKeyFromPassword, generateSalt, PBKDF2_ITERATIONS } from '../password/index.js';
import { encryptData, decryptData } from '../encryption/index.js';
import { bytesToBase64, base64ToBytes } from '../utils/index.js';
import { VaultLockedError, InvalidPasswordError } from '../errors/index.js';
import type { EncryptedVaultData, SerializedVaultState } from '../types/index.js';

export class KeyringController {
  private isLocked: boolean = true;
  private vaultId: string | null = null;
  private wallets: Record<string, ExportedWallet> = {};
  private activeWalletId: string | null = null;

  /**
   * Status of the Vault
   */
  public get status(): 'Locked' | 'Unlocked' {
    return this.isLocked ? 'Locked' : 'Unlocked';
  }

  public getActiveWalletId(): string | null {
    return this.activeWalletId;
  }

  public getWallets(): Record<string, ExportedWallet> {
    this.ensureUnlocked();
    return this.wallets;
  }

  public setActiveWallet(walletId: string): void {
    this.ensureUnlocked();
    if (!this.wallets[walletId]) {
      throw new Error(`Wallet with ID ${walletId} not found`);
    }
    this.activeWalletId = walletId;
  }

  /**
   * Locks the vault and wipes decrypted wallets from memory.
   */
  public lock(): void {
    this.isLocked = true;
    this.wallets = {};
    this.activeWalletId = null;
  }

  /**
   * Ensures the vault is currently unlocked, otherwise throws VaultLockedError.
   */
  private ensureUnlocked(): void {
    if (this.isLocked) {
      throw new VaultLockedError();
    }
  }

  /**
   * Adds an existing exported wallet to the unlocked keyring.
   */
  public addWallet(wallet: ExportedWallet): void {
    this.ensureUnlocked();
    const id = wallet.metadata.walletId;
    this.wallets[id] = wallet;
    if (!this.activeWalletId) {
      this.activeWalletId = id;
    }
  }

  /**
   * Generates a new wallet from a mnemonic and adds it to the vault.
   */
  public generateWalletFromMnemonic(
    mnemonic: string,
    accountIndex: number = 0,
    name?: string
  ): ExportedWallet {
    this.ensureUnlocked();
    const wallet = generateAccountFromMnemonic(mnemonic, accountIndex, name);
    this.addWallet(wallet);
    return wallet;
  }

  /**
   * Imports a private key as a wallet into the vault.
   */
  public importWallet(privateKey: string, name?: string): ExportedWallet {
    this.ensureUnlocked();
    const wallet = importWalletFromPrivateKey(privateKey, name);
    this.addWallet(wallet);
    return wallet;
  }

  /**
   * Renames a wallet
   */
  public renameWallet(walletId: string, newName: string): void {
    this.ensureUnlocked();
    if (!this.wallets[walletId]) {
      throw new Error(`Wallet with ID ${walletId} not found`);
    }
    this.wallets[walletId].metadata.walletName = newName;
  }

  public hideWallet(walletId: string, hidden: boolean): void {
    this.ensureUnlocked();
    if (!this.wallets[walletId]) throw new Error(`Wallet not found`);
    this.wallets[walletId].metadata.hidden = hidden;
  }

  public archiveWallet(walletId: string, archived: boolean): void {
    this.ensureUnlocked();
    if (!this.wallets[walletId]) throw new Error(`Wallet not found`);
    this.wallets[walletId].metadata.archived = archived;
  }

  public favoriteWallet(walletId: string, favorite: boolean): void {
    this.ensureUnlocked();
    if (!this.wallets[walletId]) throw new Error(`Wallet not found`);
    this.wallets[walletId].metadata.favorite = favorite;
  }

  public exportPrivateKey(walletId: string): string {
    this.ensureUnlocked();
    const wallet = this.wallets[walletId];
    if (!wallet) throw new Error(`Wallet not found`);
    if (wallet.metadata.walletType === 'WATCH_ONLY' || !wallet.privateKey) {
      throw new Error('Cannot export private key of a watch-only wallet');
    }
    return wallet.privateKey;
  }

  public importWatchOnlyWallet(address: string, name?: string): ExportedWallet {
    this.ensureUnlocked();
    const wallet = importWatchOnlyWallet(address, name);
    this.addWallet(wallet);
    return wallet;
  }

  /**
   * Removes a wallet from the vault.
   */
  public removeWallet(walletId: string): void {
    this.ensureUnlocked();
    delete this.wallets[walletId];
    if (this.activeWalletId === walletId) {
      const remainingIds = Object.keys(this.wallets);
      this.activeWalletId = remainingIds.length > 0 ? (remainingIds[0] ?? null) : null;
    }
  }

  /**
   * Serializes the current decrypted state for encryption.
   */
  private getSerializedState(): string {
    const state: SerializedVaultState = {
      wallets: this.wallets,
      activeWalletId: this.activeWalletId
    };
    return JSON.stringify(state);
  }

  /**
   * Creates a new Vault, locking the current state and returning the encrypted export.
   * This is used to save the vault to storage.
   */
  public async createVault(password: string): Promise<EncryptedVaultData> {
    const salt = generateSalt();
    const key = await deriveKeyFromPassword(password, salt, PBKDF2_ITERATIONS);

    // In a real scenario, this gets called when unlocked to 'save' current state.
    // If it's the very first time, state might be empty.
    const plaintext = this.getSerializedState();
    const payload = await encryptData(plaintext, key);

    const vaultId =
      this.vaultId ||
      (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2));

    const encryptedVault: EncryptedVaultData = {
      vaultId,
      createdAt: new Date().toISOString(),
      version: '1.0',
      iterations: PBKDF2_ITERATIONS,
      salt: bytesToBase64(salt),
      iv: payload.ivBase64,
      authTag: '', // Note: In Web Crypto API, the auth tag is appended to the ciphertext automatically, so we don't separate it
      ciphertext: payload.ciphertextBase64,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0',
        walletsCount: Object.keys(this.wallets).length
      }
    };

    return encryptedVault;
  }

  /**
   * Signs a transaction using the requested wallet's private key.
   */
  public async signTransaction(walletId: string, transaction: any): Promise<string> {
    this.ensureUnlocked();
    const walletData = this.wallets[walletId];
    if (!walletData) throw new Error(`Wallet ${walletId} not found in unlocked keyring`);
    if (walletData.metadata.walletType === 'WATCH_ONLY' || !walletData.privateKey) {
      throw new Error('Cannot sign with a watch-only wallet');
    }

    // We instantiate the wallet temporarily and let garbage collection wipe it later.
    const { Wallet } = await import('ethers');
    const signer = new Wallet(walletData.privateKey);
    return signer.signTransaction(transaction);
  }

  /**
   * Signs a standard personal message.
   */
  public async signMessage(walletId: string, message: string | Uint8Array): Promise<string> {
    this.ensureUnlocked();
    const walletData = this.wallets[walletId];
    if (!walletData) throw new Error(`Wallet ${walletId} not found in unlocked keyring`);
    if (walletData.metadata.walletType === 'WATCH_ONLY' || !walletData.privateKey) {
      throw new Error('Cannot sign with a watch-only wallet');
    }

    const { Wallet } = await import('ethers');
    const signer = new Wallet(walletData.privateKey);
    return signer.signMessage(message);
  }

  /**
   * Signs EIP-712 typed data.
   */
  public async signTypedData(
    walletId: string,
    domain: any,
    types: any,
    value: any
  ): Promise<string> {
    this.ensureUnlocked();
    const walletData = this.wallets[walletId];
    if (!walletData) throw new Error(`Wallet ${walletId} not found in unlocked keyring`);
    if (walletData.metadata.walletType === 'WATCH_ONLY' || !walletData.privateKey) {
      throw new Error('Cannot sign with a watch-only wallet');
    }

    const { Wallet } = await import('ethers');
    const signer = new Wallet(walletData.privateKey);
    return signer.signTypedData(domain, types, value);
  }

  /**
   * Unlocks an encrypted vault given the password.
   * Upon success, populates the decrypted state in memory.
   */
  public async unlockVault(password: string, encryptedVault: EncryptedVaultData): Promise<void> {
    try {
      const salt = base64ToBytes(encryptedVault.salt);
      const key = await deriveKeyFromPassword(password, salt, encryptedVault.iterations);

      const payload = {
        ivBase64: encryptedVault.iv,
        ciphertextBase64: encryptedVault.ciphertext
      };

      const plaintext = await decryptData(payload, key);
      const state: SerializedVaultState = JSON.parse(plaintext);

      this.wallets = state.wallets ?? {};
      this.activeWalletId = state.activeWalletId ?? null;
      this.vaultId = encryptedVault.vaultId;
      this.isLocked = false;
    } catch {
      throw new InvalidPasswordError();
    }
  }
}
