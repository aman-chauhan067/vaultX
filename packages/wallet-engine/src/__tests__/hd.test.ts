import { describe, it, expect } from 'vitest';
import { getMasterNodeFromMnemonic, deriveBIP44EthereumAccount } from '../hd/index.js';
import { DerivationError } from '../errors/index.js';

describe('HD Wallet Derivation', () => {
  const phrase = 'test test test test test test test test test test test junk';

  it('should generate a master node from a valid mnemonic', () => {
    const masterNode = getMasterNodeFromMnemonic(phrase);
    expect(masterNode).toBeDefined();
    expect(masterNode.privateKey).toBeDefined();
  });

  it('should derive a BIP44 Ethereum account (index 0)', () => {
    const masterNode = getMasterNodeFromMnemonic(phrase);
    const accountNode = deriveBIP44EthereumAccount(masterNode, 0);

    // Expected address for the test mnemonic at m/44'/60'/0'/0/0
    expect(accountNode.address).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  });

  it('should derive a BIP44 Ethereum account (index 1)', () => {
    const masterNode = getMasterNodeFromMnemonic(phrase);
    const accountNode = deriveBIP44EthereumAccount(masterNode, 1);

    // Expected address for the test mnemonic at m/44'/60'/0'/0/1
    expect(accountNode.address).toBe('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
  });

  it('should throw DerivationError for negative account index', () => {
    const masterNode = getMasterNodeFromMnemonic(phrase);
    expect(() => deriveBIP44EthereumAccount(masterNode, -1)).toThrow(DerivationError);
  });
});
