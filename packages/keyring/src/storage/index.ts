/**
 * @file storage/index.ts
 * @description In-memory serialization interfaces for vaults
 */

import type { EncryptedVaultData } from '../types/index.js';

/**
 * Serializes the EncryptedVaultData to a JSON string.
 * This can be written to localStorage, IndexedDB, or a file.
 */
export function serializeVault(vault: EncryptedVaultData): string {
  return JSON.stringify(vault);
}

/**
 * Parses an EncryptedVaultData from a JSON string.
 */
export function deserializeVault(json: string): EncryptedVaultData {
  return JSON.parse(json) as EncryptedVaultData;
}
