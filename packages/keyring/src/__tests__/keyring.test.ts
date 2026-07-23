import { describe, it, expect, beforeEach } from 'vitest';
import { KeyringController } from '../controllers/KeyringController.js';
import { VaultLockedError, InvalidPasswordError } from '../errors/index.js';

describe('KeyringController', () => {
  let controller: KeyringController;

  beforeEach(() => {
    controller = new KeyringController();
  });

  it('should start locked', () => {
    expect(controller.status).toBe('Locked');
    expect(() => controller.getWallets()).toThrow(VaultLockedError);
  });

  it('should unlock and allow wallet operations', async () => {
    // 1. Initial state (locked) - we need to create a vault first
    // For a brand new user, they usually unlock by creating a vault, or we can just simulate it.
    // Wait, the API requires unlockVault with an EncryptedVaultData. Let's create one first.

    // Simulate initial unlock (bypassing for a new user would typically just mean setting isLocked = false, but the class currently enforces unlock via password).
    // Let's create a vault first with a dummy state.

    // But wait, to create a vault we need it to be unlocked? No, createVault doesn't check ensureUnlocked! Wait, let's verify.
    // If it's locked and we createVault, it will serialize an empty state.
    const password = 'secure-password';
    const encryptedVault = await controller.createVault(password);

    expect(encryptedVault).toBeDefined();
    expect(encryptedVault.ciphertext).toBeDefined();

    // Now unlock it
    await controller.unlockVault(password, encryptedVault);

    expect(controller.status).toBe('Unlocked');
    expect(controller.getWallets()).toEqual({});
  });

  it('should reject wrong passwords', async () => {
    const encryptedVault = await controller.createVault('correct-password');

    await expect(controller.unlockVault('wrong-password', encryptedVault)).rejects.toThrow(
      InvalidPasswordError
    );
  });

  it('should manage wallets correctly', async () => {
    const encryptedVault = await controller.createVault('test-password');
    await controller.unlockVault('test-password', encryptedVault);

    const wallet = controller.generateWalletFromMnemonic(
      'test test test test test test test test test test test junk'
    );

    expect(Object.keys(controller.getWallets()).length).toBe(1);
    expect(controller.getActiveWalletId()).toBe(wallet.metadata.walletId);

    // Save state
    const updatedVault = await controller.createVault('test-password');

    // Lock and restore
    controller.lock();
    expect(controller.status).toBe('Locked');

    await controller.unlockVault('test-password', updatedVault);
    expect(Object.keys(controller.getWallets()).length).toBe(1);
    expect(controller.getActiveWalletId()).toBe(wallet.metadata.walletId);
  });

  it('should handle wallet renaming and removal', async () => {
    const encryptedVault = await controller.createVault('test');
    await controller.unlockVault('test', encryptedVault);

    const wallet = controller.generateWalletFromMnemonic(
      'test test test test test test test test test test test junk'
    );
    const id = wallet.metadata.walletId;

    controller.renameWallet(id, 'New Name');
    expect(controller.getWallets()[id].metadata.walletName).toBe('New Name');

    controller.removeWallet(id);
    expect(Object.keys(controller.getWallets()).length).toBe(0);
    expect(controller.getActiveWalletId()).toBeNull();
  });
});
