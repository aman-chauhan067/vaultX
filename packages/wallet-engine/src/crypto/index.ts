/**
 * @file crypto/index.ts
 * @description Cryptographic primitives and key management (non-HD)
 */

import { Wallet } from 'ethers';
import type { ExportedWallet } from '../types/index.js';

/**
 * Generates a random single-key Wallet (non-HD).
 *
 * @param walletName - An optional name for the wallet (default is "Random Wallet").
 * @returns The structured ExportedWallet.
 */
export function generateRandomWallet(walletName: string = 'Random Wallet'): ExportedWallet {
  const wallet = Wallet.createRandom();

  return {
    privateKey: wallet.privateKey,
    publicKey: wallet.signingKey.publicKey,
    address: wallet.address,
    metadata: {
      walletId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      walletName,
      createdAt: new Date().toISOString(),
      accountIndex: 0,
      walletType: 'IMPORTED',
      source: 'random',
      favorite: false,
      hidden: false,
      archived: false,
      backupStatus: {
        verified: false
      }
    }
  };
}

/**
 * Recovers a wallet from a given private key.
 *
 * @param privateKey - The 0x-prefixed private key.
 * @param walletName - An optional name for the wallet (default is "Imported Wallet").
 * @returns The structured ExportedWallet.
 */
export function importWalletFromPrivateKey(
  privateKey: string,
  walletName: string = 'Imported Wallet'
): ExportedWallet {
  const wallet = new Wallet(privateKey);

  return {
    privateKey: wallet.privateKey,
    publicKey: wallet.signingKey.publicKey,
    address: wallet.address,
    metadata: {
      walletId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      walletName,
      createdAt: new Date().toISOString(),
      accountIndex: 0,
      walletType: 'IMPORTED',
      source: 'imported',
      favorite: false,
      hidden: false,
      archived: false,
      backupStatus: {
        verified: false
      }
    }
  };
}

/**
 * Imports an address as a watch-only wallet.
 *
 * @param address - The Ethereum address to watch.
 * @param walletName - An optional name for the wallet (default is "Watch Wallet").
 * @returns The structured ExportedWallet.
 */
export function importWatchOnlyWallet(
  address: string,
  walletName: string = 'Watch Wallet'
): ExportedWallet {
  // Simple checksum validation fallback if ethers isn't strictly used here, but we assume it's valid if passed.
  return {
    address,
    metadata: {
      walletId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      walletName,
      createdAt: new Date().toISOString(),
      accountIndex: 0,
      walletType: 'WATCH_ONLY',
      source: 'watch',
      favorite: false,
      hidden: false,
      archived: false
    }
  };
}
