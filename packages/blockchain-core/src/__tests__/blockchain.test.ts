import { describe, it, expect } from 'vitest';
import { BlockchainFactory } from '../factories/index.js';
import type { IProvider, ISigner } from '../types/index.js';

describe('Blockchain Abstraction Layer', () => {
  it('should create a provider without exposing ethers.js types', () => {
    const provider: IProvider = BlockchainFactory.createProvider('http://127.0.0.1:8545');
    expect(provider).toBeDefined();
    expect(typeof provider.getBlockNumber).toBe('function');
    expect(typeof provider.getBalance).toBe('function');
  });

  it('should create a signer without exposing ethers.js types', async () => {
    // Random private key for testing
    const pk = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const signer: ISigner = BlockchainFactory.createSigner(pk);

    expect(signer).toBeDefined();

    const address = await signer.getAddress();
    expect(typeof address).toBe('string');
    expect(address.startsWith('0x')).toBe(true);
  });

  it('should allow signer to connect to an abstract provider', () => {
    const provider = BlockchainFactory.createProvider('http://127.0.0.1:8545');
    const pk = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    const signer = BlockchainFactory.createSigner(pk);
    signer.connect(provider);

    expect(signer.getProvider()).toBe(provider);
  });
});
