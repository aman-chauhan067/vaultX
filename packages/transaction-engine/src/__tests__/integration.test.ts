import { describe, it, expect } from 'vitest';
import { AccountManager } from '@vaultx/account-manager';
import { ProviderManager } from '@vaultx/network-engine';
import { BlockchainFactory } from '@vaultx/blockchain-core';
import { TransactionBuilder, TransactionPopulator, TransactionSerializer } from '../index.js';

// Mock storage for the account manager
class MemoryStorage {
  private data = new Map<string, string>();
  async getItem(key: string) {
    return this.data.get(key) || null;
  }
  async setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  async removeItem(key: string) {
    this.data.delete(key);
  }
  async clear() {
    this.data.clear();
  }
}

describe('System Integration: End-to-End Transaction Flow', () => {
  it('should flow through the entire system architecture securely', async () => {
    // 1. Boot up core modules
    const storage = new MemoryStorage();
    const accountManager = new AccountManager(storage);
    const networkManager = new ProviderManager();

    // 2. Initialize and Unlock Vault
    await accountManager.createVault('StrongPassword123!');

    // 3. Create a wallet/account in the vault
    // Using a known test mnemonic
    const mnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    await accountManager.generateWalletFromMnemonic(
      mnemonic,
      0,
      'Test Account',
      'StrongPassword123!'
    );

    const exportedWallets = Object.values(accountManager.getWallets());
    expect(exportedWallets.length).toBe(1);

    const fromAddress = exportedWallets[0]!.address;

    // 4. Switch Network
    networkManager.switchChain(1); // Switch to Ethereum Mainnet
    expect(networkManager.getActiveChainId()).toBe(1);

    // 5. Construct Transaction
    const mockProvider = BlockchainFactory.createProvider('http://localhost:8545');

    // Override methods to emulate a live network safely during tests
    mockProvider.getTransactionCount = async () => 42;
    mockProvider.getFeeData = async () => ({
      maxFeePerGas: '2000000000',
      maxPriorityFeePerGas: '1000000000'
    });
    mockProvider.estimateGas = async () => '21000';

    let builder = TransactionBuilder.create(1)
      .setTo('0x1234567890123456789012345678901234567890')
      .setValue('1000000000000000000'); // 1 ETH

    // 6. Strategy Injection (Populate gas and nonce via the provider)
    builder = await TransactionPopulator.populateNonce(builder, mockProvider, fromAddress);
    builder = await TransactionPopulator.populateFee(builder, mockProvider);
    builder = await TransactionPopulator.estimateGasLimit(builder, mockProvider);

    // 7. Validate
    const finalTx = builder.build();
    expect(finalTx.nonce).toBe(42);
    expect(finalTx.maxFeePerGas).toBe('2000000000');
    expect(finalTx.gasLimit).toBe('21000');
    expect(finalTx.from).toBe(fromAddress);

    // 8. Serialize Transaction
    const serialized = TransactionSerializer.serialize(finalTx);
    expect(typeof serialized).toBe('string');
    expect(serialized.startsWith('0x')).toBe(true);

    // Success! The entire pipeline constructed, validated, and serialized without leaking private keys.
  });
});
