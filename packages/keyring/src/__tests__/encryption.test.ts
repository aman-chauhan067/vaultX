import { describe, it, expect } from 'vitest';
import { encryptData, decryptData } from '../encryption/index.js';
import { deriveKeyFromPassword, generateSalt } from '../password/index.js';
import { DecryptionError } from '../errors/index.js';

describe('Encryption Operations', () => {
  it('should encrypt and decrypt successfully', async () => {
    const password = 'my-secret-password';
    const salt = generateSalt();
    const key = await deriveKeyFromPassword(password, salt);

    const plaintext = JSON.stringify({ test: 'data' });
    const encrypted = await encryptData(plaintext, key);

    expect(encrypted.ciphertextBase64).toBeDefined();
    expect(encrypted.ivBase64).toBeDefined();

    const decrypted = await decryptData(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });

  it('should fail decryption if tampered', async () => {
    const password = 'my-secret-password';
    const salt = generateSalt();
    const key = await deriveKeyFromPassword(password, salt);

    const plaintext = JSON.stringify({ test: 'data' });
    const encrypted = await encryptData(plaintext, key);

    // Tamper with the ciphertext (change the first character)
    const tamperedCiphertext = 'A' + encrypted.ciphertextBase64.substring(1);

    await expect(
      decryptData({ ...encrypted, ciphertextBase64: tamperedCiphertext }, key)
    ).rejects.toThrow(DecryptionError);
  });
});
