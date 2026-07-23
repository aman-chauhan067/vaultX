/**
 * @file encryption/index.ts
 * @description Authenticated encryption using AES-256-GCM
 */

import { bytesToBase64, base64ToBytes, clearMemory } from '../utils/index.js';
import { EncryptionError, DecryptionError } from '../errors/index.js';

export const IV_LENGTH_BYTES = 12; // 96 bits recommended for GCM

export interface EncryptedPayload {
  ciphertextBase64: string;
  ivBase64: string;
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 *
 * @param plaintext - The data to encrypt (typically JSON).
 * @param key - The CryptoKey derived via PBKDF2.
 * @returns The encrypted payload containing the Base64 IV and Ciphertext.
 */
export async function encryptData(plaintext: string, key: CryptoKey): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));
  const encodedPlaintext = new TextEncoder().encode(plaintext);

  try {
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource
      },
      key,
      encodedPlaintext as unknown as BufferSource
    );

    // In Web Crypto API, the authentication tag is appended to the ciphertext buffer
    const encryptedBytes = new Uint8Array(encryptedBuffer);

    return {
      ivBase64: bytesToBase64(iv),
      ciphertextBase64: bytesToBase64(encryptedBytes)
    };
  } catch {
    throw new EncryptionError('AES-GCM encryption failed');
  } finally {
    clearMemory(encodedPlaintext);
  }
}

/**
 * Decrypts a ciphertext using AES-256-GCM.
 *
 * @param payload - The encrypted payload.
 * @param key - The CryptoKey.
 * @returns The decrypted plaintext string.
 */
export async function decryptData(payload: EncryptedPayload, key: CryptoKey): Promise<string> {
  try {
    const iv = base64ToBytes(payload.ivBase64);
    const ciphertext = base64ToBytes(payload.ciphertextBase64);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource
      },
      key,
      ciphertext as unknown as BufferSource
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch {
    throw new DecryptionError('AES-GCM decryption failed (Wrong password or corrupted data)');
  }
}
