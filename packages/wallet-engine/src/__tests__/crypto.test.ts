import { describe, it, expect } from 'vitest';
import { generateRandomWallet, importWalletFromPrivateKey } from '../crypto/index.js';
import { isValidAddress, isValidPrivateKey } from '../utils/index.js';

describe('Crypto Operations', () => {
  it('should generate a random single wallet', () => {
    const wallet = generateRandomWallet();

    expect(wallet.mnemonic).toBeUndefined();
    expect(isValidPrivateKey(wallet.privateKey)).toBe(true);
    expect(isValidAddress(wallet.address)).toBe(true);
    expect(wallet.metadata.accountIndex).toBe(0);
  });

  it('should recover a wallet from a private key', () => {
    const originalWallet = generateRandomWallet();
    const recoveredWallet = importWalletFromPrivateKey(originalWallet.privateKey);

    expect(recoveredWallet.address).toBe(originalWallet.address);
    expect(recoveredWallet.publicKey).toBe(originalWallet.publicKey);
  });
});
