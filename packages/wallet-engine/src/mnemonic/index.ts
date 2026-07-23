/**
 * @file mnemonic/index.ts
 * @description BIP39 mnemonic phrase generation and validation
 */

import { ethers } from 'ethers';
import { InvalidMnemonicError } from '../errors/index.js';
import type { MnemonicLength } from '../types/index.js';

/**
 * Generates a secure BIP39 mnemonic phrase.
 *
 * @param length - The number of words (12 or 24). Default is 12.
 * @returns The generated mnemonic string.
 */
export function generateMnemonic(length: MnemonicLength = 12): string {
  const entropyBytes = length === 12 ? 16 : 32;
  const entropy = ethers.randomBytes(entropyBytes);
  const mnemonic = ethers.Mnemonic.fromEntropy(entropy);

  // Clear entropy buffer if possible, though JS garbage collection handles it.
  entropy.fill(0);

  return mnemonic.phrase;
}

/**
 * Validates a BIP39 mnemonic phrase.
 *
 * @param phrase - The mnemonic string to validate.
 * @returns True if valid, throws an InvalidMnemonicError otherwise.
 */
export function validateMnemonic(phrase: string): boolean {
  try {
    const isValid = ethers.Mnemonic.isValidMnemonic(phrase);
    if (!isValid) {
      throw new InvalidMnemonicError();
    }
    return true;
  } catch {
    throw new InvalidMnemonicError();
  }
}
