import { describe, it, expect, beforeAll } from 'vitest';
import { generateAccountFromMnemonic } from '../accounts/index.js';

describe('Account Generation', () => {
  const phrase = 'test test test test test test test test test test test junk';

  beforeAll(() => {
    // Mock crypto.randomUUID for testing consistency if needed, though we just check existence
  });

  it('should generate a structured exported wallet from mnemonic', () => {
    const wallet = generateAccountFromMnemonic(phrase, 0, 'Main Wallet');

    expect(wallet.mnemonic).toBe(phrase);
    expect(wallet.address).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    expect(wallet.privateKey).toMatch(/^0x[0-9a-fA-F]{64}$/);
    expect(wallet.publicKey).toMatch(/^0x[0-9a-fA-F]+$/);

    expect(wallet.metadata.walletName).toBe('Main Wallet');
    expect(wallet.metadata.accountIndex).toBe(0);
    expect(wallet.metadata.walletId).toBeDefined();
    expect(wallet.metadata.createdAt).toBeDefined();
  });
});
