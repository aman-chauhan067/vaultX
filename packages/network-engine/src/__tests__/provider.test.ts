import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ProviderManager } from '../providers/index.js';
import { UnsupportedChainError } from '../errors/index.js';

describe('ProviderManager', () => {
  let manager: ProviderManager;

  beforeEach(() => {
    manager = new ProviderManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should switch chains successfully and emit events', () => {
    const onConnected = vi.fn();
    const onChainChanged = vi.fn();

    manager.events.on('ProviderConnected', onConnected);
    manager.events.on('ChainChanged', onChainChanged);

    manager.switchChain(1); // Ethereum Mainnet

    expect(manager.getActiveChainId()).toBe(1);
    expect(onConnected).toHaveBeenCalledWith(1);
    expect(onChainChanged).toHaveBeenCalledWith(1);
  });

  it('should emit ProviderDisconnected when switching to a new chain', () => {
    const onDisconnected = vi.fn();
    manager.events.on('ProviderDisconnected', onDisconnected);

    manager.switchChain(1);
    manager.switchChain(137); // Switch to Polygon

    expect(onDisconnected).toHaveBeenCalledWith(1, expect.any(Error));
    expect(manager.getActiveChainId()).toBe(137);
  });

  it('should throw an error for unsupported chains', () => {
    expect(() => manager.switchChain(999999)).toThrow(UnsupportedChainError);
  });

  it('should register and switch to custom chains', () => {
    manager.registerCustomChain({
      chainId: 12345,
      name: 'Custom Chain',
      rpcUrls: ['https://custom.rpc'],
      currency: { name: 'Custom', symbol: 'CUST', decimals: 18 },
      isTestnet: false,
      supportsEIP1559: true,
      supportsENS: false
    });

    manager.switchChain(12345);
    expect(manager.getActiveChainId()).toBe(12345);
  });
});
