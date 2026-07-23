/**
 * @file utils/index.ts
 * @description Utility functions for the wallet engine
 */

import { ethers } from 'ethers';

/**
 * Validates whether a given string is a valid Ethereum checksum address.
 *
 * @param address - The address string to validate.
 * @returns True if valid, false otherwise.
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Validates whether a given string is a valid 0x-prefixed private key.
 *
 * @param privateKey - The private key string to validate.
 * @returns True if valid, false otherwise.
 */
export function isValidPrivateKey(privateKey: string): boolean {
  return ethers.isHexString(privateKey, 32);
}
