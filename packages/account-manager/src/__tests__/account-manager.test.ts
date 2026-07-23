import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AccountManager } from '../controllers/AccountManager.js';
import { MemoryStorage } from '../storage/index.js';
import { SessionLockedError, StorageError } from '../errors/index.js';

describe('AccountManager', () => {
  let manager: AccountManager;
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
    manager = new AccountManager(storage);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should initialize locked and indicate no existing vault', async () => {
    const hasVault = await manager.hasExistingVault();
    expect(hasVault).toBe(false);
    expect(() => manager.getWallets()).toThrow(SessionLockedError);
  });

  it('should create a vault, unlock it, and emit events', async () => {
    const onUnlocked = vi.fn();
    manager.events.on('WalletUnlocked', onUnlocked);

    await manager.createVault('secure-password');

    // Automatically unlocked after creation
    expect(onUnlocked).toHaveBeenCalled();
    const hasVault = await manager.hasExistingVault();
    expect(hasVault).toBe(true);

    expect(manager.getWallets()).toEqual({});
  });

  it('should manage auto-lock timeouts correctly', async () => {
    manager.setAutoLockTimeout(5000); // 5 seconds

    const onLocked = vi.fn();
    manager.events.on('WalletLocked', onLocked);

    await manager.createVault('secure-password');

    // Advance time just under the limit
    vi.advanceTimersByTime(4000);
    expect(onLocked).not.toHaveBeenCalled();

    // Ping session to reset timer
    manager.pingSession();

    vi.advanceTimersByTime(4000);
    expect(onLocked).not.toHaveBeenCalled(); // 8 seconds total, but we pinged

    // Now let it expire
    vi.advanceTimersByTime(2000);
    expect(onLocked).toHaveBeenCalled();
    expect(() => manager.getWallets()).toThrow(SessionLockedError);
  });

  it('should generate wallets and persist state', async () => {
    await manager.createVault('pass');

    const onCreated = vi.fn();
    manager.events.on('WalletCreated', onCreated);

    const wallet = await manager.generateWalletFromMnemonic(
      'test test test test test test test test test test test junk',
      0,
      'My Wallet',
      'pass'
    );

    expect(onCreated).toHaveBeenCalledWith(wallet);
    expect(Object.keys(manager.getWallets()).length).toBe(1);
    expect(manager.getActiveWallet()?.metadata.walletId).toBe(wallet.metadata.walletId);

    // Lock it
    manager.lock();

    // Restore and verify it persisted
    await manager.unlock('pass');
    expect(Object.keys(manager.getWallets()).length).toBe(1);
  });

  it('should require current password to remove wallets', async () => {
    await manager.createVault('pass');
    const wallet = await manager.generateWalletFromMnemonic(
      'test test test test test test test test test test test junk',
      0,
      'My Wallet',
      'pass'
    );

    const onDeleted = vi.fn();
    manager.events.on('WalletDeleted', onDeleted);

    await manager.removeWallet(wallet.metadata.walletId, 'pass');

    expect(onDeleted).toHaveBeenCalledWith(wallet.metadata.walletId);
    expect(Object.keys(manager.getWallets()).length).toBe(0);
  });

  it('should fail to unlock with wrong password', async () => {
    await manager.createVault('pass');
    manager.lock();

    await expect(manager.unlock('wrong')).rejects.toThrow();
  });

  it('should fail to unlock if no vault exists', async () => {
    await expect(manager.unlock('pass')).rejects.toThrow(StorageError);
  });
});
