/**
 * @file password/index.ts
 * @description Password-based key derivation (PBKDF2) using Web Crypto API
 */

import { stringToBytes, clearMemory } from '../utils/index.js';
import { EncryptionError } from '../errors/index.js';

export const PBKDF2_ITERATIONS = 600000; // OWASP recommended minimum for PBKDF2-HMAC-SHA256 as of 2023+
export const PBKDF2_SALT_LENGTH = 16;
export const KEY_LENGTH_BYTES = 32; // 256 bits for AES-256

/**
 * Derives a 256-bit AES key from a password and salt using PBKDF2-HMAC-SHA256.
 *
 * @param password - The plaintext password.
 * @param salt - The random salt (Uint8Array).
 * @param iterations - The number of PBKDF2 iterations.
 * @returns The derived key (CryptoKey).
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
  iterations: number = PBKDF2_ITERATIONS
): Promise<CryptoKey> {
  const passwordBytes = stringToBytes(password);

  try {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBytes as unknown as BufferSource,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as unknown as BufferSource,
        iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: KEY_LENGTH_BYTES * 8 },
      false, // strictly false to prevent extraction
      ['encrypt', 'decrypt']
    );

    return derivedKey;
  } catch {
    throw new EncryptionError('Failed to derive key from password');
  } finally {
    clearMemory(passwordBytes);
  }
}

/**
 * Generates a strong random salt.
 */
export function generateSalt(length: number = PBKDF2_SALT_LENGTH): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}
