/**
 * @file providers/index.ts
 * @description Provider Manager orchestrating chains, RPC pools, and caching.
 */

import type { JsonRpcProvider } from 'ethers';
import { CHAIN_REGISTRY } from '../registry/index.js';
import { HealthMonitor } from '../health/index.js';
import { RpcPool } from '../rpc/index.js';
import { NetworkEventEmitter } from '../events/index.js';
import { UnsupportedChainError } from '../errors/index.js';
import type { ChainConfig } from '../types/index.js';

export class ProviderManager {
  public events: NetworkEventEmitter;
  private healthMonitor: HealthMonitor;
  private pools: Map<number, RpcPool> = new Map();
  private activeChainId: number | null = null;
  private customChains: Map<number, ChainConfig> = new Map();

  private activeProvider: JsonRpcProvider | null = null;
  private blockListener: ((blockNumber: number) => void) | null = null;

  constructor() {
    this.events = new NetworkEventEmitter();
    this.healthMonitor = new HealthMonitor(this.events);
  }

  public registerCustomChain(config: ChainConfig): void {
    this.customChains.set(config.chainId, config);
  }

  public removeCustomChain(chainId: number): void {
    this.customChains.delete(chainId);
  }

  public getChainConfig(chainId: number): ChainConfig {
    const config = this.customChains.get(chainId) || CHAIN_REGISTRY[chainId];
    if (!config) {
      throw new UnsupportedChainError(chainId);
    }
    return config;
  }

  public getAllChains(): ChainConfig[] {
    const builtin = Object.values(CHAIN_REGISTRY).map((c) => ({ ...c, isCustom: false }));
    const custom = Array.from(this.customChains.values()).map((c) => ({ ...c, isCustom: true }));
    return [...builtin, ...custom];
  }

  private getPool(chainId: number): RpcPool {
    if (!this.pools.has(chainId)) {
      const config = this.getChainConfig(chainId);
      const pool = new RpcPool(chainId, config.rpcUrls, this.healthMonitor);
      this.pools.set(chainId, pool);
    }
    return this.pools.get(chainId)!;
  }

  public switchChain(chainId: number): void {
    // Validate chain exists
    this.getChainConfig(chainId);

    const previousChainId = this.activeChainId;
    this.activeChainId = chainId;

    if (previousChainId !== null) {
      this.events.emit(
        'ProviderDisconnected',
        previousChainId,
        new Error('Switched to another chain')
      );
    }

    // Cleanup old listener to prevent memory leaks
    if (this.activeProvider && this.blockListener) {
      this.activeProvider.off('block', this.blockListener);
    }

    const pool = this.getPool(chainId);
    this.activeProvider = pool.getPrimaryProvider();

    this.blockListener = (blockNumber: number) => {
      this.events.emit('NewBlock', blockNumber);
    };

    this.activeProvider.on('block', this.blockListener);

    this.events.emit('ChainChanged', chainId);
    this.events.emit('ProviderConnected', chainId);
  }

  public getActiveChainId(): number | null {
    return this.activeChainId;
  }

  public getProvider(chainId: number): JsonRpcProvider {
    return this.getPool(chainId).getPrimaryProvider();
  }

  /**
   * Automatically executes a JSON-RPC operation with round-robin failover on the active chain.
   */
  public async execute<T>(operation: (provider: JsonRpcProvider) => Promise<T>): Promise<T> {
    if (this.activeChainId === null) {
      throw new Error('No active chain selected. Call switchChain() first.');
    }

    const pool = this.getPool(this.activeChainId);
    return pool.executeWithRetry(operation, 5000);
  }

  /**
   * Executes a JSON-RPC operation on a specific chain without changing the active chain.
   */
  public async executeOnChain<T>(
    chainId: number,
    operation: (provider: JsonRpcProvider) => Promise<T>
  ): Promise<T> {
    const pool = this.getPool(chainId);
    return pool.executeWithRetry(operation, 5000);
  }
}
