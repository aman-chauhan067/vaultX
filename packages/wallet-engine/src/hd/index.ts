/**
 * @file hd/index.ts
 * @description HD Node derivations and seed management
 */

import { ethers, HDNodeWallet } from 'ethers';
import { validateMnemonic } from '../mnemonic/index.js';
import { DerivationError } from '../errors/index.js';

/**
 * Generates an HDNodeWallet from a BIP39 mnemonic phrase.
 * This represents the master node of the HD Wallet.
 *
 * @param phrase - The validated BIP39 mnemonic phrase.
 * @returns The master HDNodeWallet.
 */
export function getMasterNodeFromMnemonic(phrase: string): HDNodeWallet {
  validateMnemonic(phrase);
  try {
    const mnemonic = ethers.Mnemonic.fromPhrase(phrase);
    return HDNodeWallet.fromMnemonic(mnemonic, 'm');
  } catch {
    throw new DerivationError('Invalid mnemonic for HD node generation.');
  }
}

/**
 * Derives a specific BIP44 Ethereum account node from a master node.
 * BIP44 Path for Ethereum: m/44'/60'/0'/0/accountIndex
 *
 * @param masterNode - The root HDNodeWallet.
 * @param accountIndex - The index of the account to derive (0-based).
 * @returns The derived HDNodeWallet for the account.
 */
export function deriveBIP44EthereumAccount(
  masterNode: HDNodeWallet,
  accountIndex: number
): HDNodeWallet {
  if (accountIndex < 0 || !Number.isInteger(accountIndex)) {
    throw new DerivationError('Account index must be a non-negative integer.');
  }

  const path = `m/44'/60'/0'/0/${accountIndex}`;
  try {
    return masterNode.derivePath(path);
  } catch {
    throw new DerivationError(`Failed to derive path ${path}`);
  }
}
