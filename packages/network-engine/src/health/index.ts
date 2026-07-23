/**
 * @file health/index.ts
 * @description Health monitor for RPC URLs.
 */

import { JsonRpcProvider } from 'ethers';
import type { RpcHealth } from '../types/index.js';
import type { NetworkEventEmitter } from '../events/index.js';

export class HealthMonitor {
  private healthStates: Map<string, RpcHealth> = new Map();
  private events: NetworkEventEmitter;

  constructor(events: NetworkEventEmitter) {
    this.events = events;
  }

  public initialize(urls: string[]): void {
    for (const url of urls) {
      if (!this.healthStates.has(url)) {
        this.healthStates.set(url, {
          url,
          isHealthy: true,
          latencyMs: 0,
          lastChecked: 0,
          failures: 0
        });
      }
    }
  }

  public getHealthyUrls(urls: string[]): string[] {
    return urls.filter((url) => {
      const state = this.healthStates.get(url);
      return state ? state.isHealthy : false;
    });
  }

  public reportFailure(url: string, error: Error): void {
    const state = this.healthStates.get(url);
    if (state) {
      state.failures += 1;
      if (state.failures >= 3) {
        state.isHealthy = false;
        this.events.emit('RPCFailed', url, error);
      }
      this.healthStates.set(url, state);
    }
  }

  public reportSuccess(url: string, latencyMs: number): void {
    const state = this.healthStates.get(url);
    if (state) {
      const wasDown = !state.isHealthy;

      state.isHealthy = true;
      state.failures = 0;
      state.latencyMs = latencyMs;
      state.lastChecked = Date.now();

      this.healthStates.set(url, state);

      if (wasDown) {
        this.events.emit('RPCRecovered', url);
      }
      this.events.emit('LatencyUpdated', url, latencyMs);
    }
  }

  public async ping(url: string): Promise<void> {
    const start = Date.now();
    try {
      const provider = new JsonRpcProvider(url, undefined, { staticNetwork: true });
      await provider.getBlockNumber();
      const latency = Date.now() - start;
      this.reportSuccess(url, latency);
    } catch (error) {
      this.reportFailure(url, error instanceof Error ? error : new Error('Unknown ping error'));
    }
  }
}
