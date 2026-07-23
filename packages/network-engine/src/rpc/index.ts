/**
 * @file rpc/index.ts
 * @description RPC Pool for load balancing and failover
 */

import { JsonRpcProvider } from 'ethers';
import type { HealthMonitor } from '../health/index.js';
import { RpcExhaustionError } from '../errors/index.js';

export class RpcPool {
  private urls: string[];
  private currentIndex: number = 0;
  private healthMonitor: HealthMonitor;
  private chainId: number;
  private providers: Map<string, JsonRpcProvider> = new Map();

  constructor(chainId: number, urls: string[], healthMonitor: HealthMonitor) {
    if (urls.length === 0) throw new Error('RPC Pool requires at least one URL');
    this.chainId = chainId;
    this.urls = urls;
    this.healthMonitor = healthMonitor;
    this.healthMonitor.initialize(urls);
  }

  public getNextUrl(): string {
    const healthyUrls = this.healthMonitor.getHealthyUrls(this.urls);
    if (healthyUrls.length === 0) {
      throw new RpcExhaustionError(this.chainId);
    }

    const url = healthyUrls[this.currentIndex % healthyUrls.length]!;
    this.currentIndex++;
    return url;
  }

  public getProvider(url: string): JsonRpcProvider {
    let provider = this.providers.get(url);
    if (!provider) {
      provider = new JsonRpcProvider(url, undefined, { staticNetwork: true });
      this.providers.set(url, provider);
    }
    return provider;
  }

  public getPrimaryProvider(): JsonRpcProvider {
    return this.getProvider(this.getNextUrl());
  }

  public async executeWithRetry<T>(
    operation: (provider: JsonRpcProvider) => Promise<T>,
    timeoutMs = 5000
  ): Promise<T> {
    let attempts = 0;
    const maxAttempts = this.urls.length * 2; // Try each URL up to 2 times

    while (attempts < maxAttempts) {
      const url = this.getNextUrl();
      const provider = this.getProvider(url);
      const start = Date.now();

      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('RPC Timeout')), timeoutMs);
        });

        const result = await Promise.race([operation(provider), timeoutPromise]);
        this.healthMonitor.reportSuccess(url, Date.now() - start);
        return result;
      } catch (error) {
        this.healthMonitor.reportFailure(
          url,
          error instanceof Error ? error : new Error('RPC Execution failed')
        );
        attempts++;
      }
    }

    throw new RpcExhaustionError(this.chainId);
  }

  public destroy() {
    for (const provider of this.providers.values()) {
      provider.removeAllListeners();
    }
    this.providers.clear();
  }
}
