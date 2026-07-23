/**
 * @file nonce/index.ts
 * @description Manages strictly sequential nonce allocation per address to prevent conflicts during parallel sends.
 */

import type { IProvider } from '@vaultx/blockchain-core';

export class NonceManager {
  private static instance: NonceManager;

  // Maps lowercase address to the next available nonce
  private pendingNonces: Map<string, number> = new Map();
  private isSynchronizing: Map<string, Promise<number>> = new Map();

  private constructor() {}

  public static getInstance(): NonceManager {
    if (!NonceManager.instance) {
      NonceManager.instance = new NonceManager();
    }
    return NonceManager.instance;
  }

  /**
   * Fetches and allocates the next sequential nonce for the given address.
   */
  public async getNextNonce(address: string, provider: IProvider): Promise<number> {
    const addrKey = address.toLowerCase();

    // If currently syncing from network, wait for it
    if (this.isSynchronizing.has(addrKey)) {
      await this.isSynchronizing.get(addrKey);
    }

    let nextNonce = this.pendingNonces.get(addrKey);

    if (nextNonce === undefined) {
      nextNonce = await this.sync(address, provider);
    } else {
      // Validate against the network in case of gaps or manual external transactions
      const networkNonce = await provider.getTransactionCount(address);
      if (networkNonce > nextNonce) {
        nextNonce = networkNonce;
      }
    }

    this.pendingNonces.set(addrKey, nextNonce + 1);
    return nextNonce;
  }

  /**
   * Resets the local pending nonce tracker by querying the network for confirmed nonces.
   */
  public async sync(address: string, provider: IProvider): Promise<number> {
    const addrKey = address.toLowerCase();

    if (this.isSynchronizing.has(addrKey)) {
      return this.isSynchronizing.get(addrKey)!;
    }

    const syncPromise = provider
      .getTransactionCount(address)
      .then((networkNonce) => {
        // We only update if the network nonce is higher than our pending nonce,
        // OR if we had no pending nonce tracking yet.
        const current = this.pendingNonces.get(addrKey);
        if (current === undefined || networkNonce > current) {
          this.pendingNonces.set(addrKey, networkNonce);
          return networkNonce;
        }
        return current;
      })
      .finally(() => {
        this.isSynchronizing.delete(addrKey);
      });

    this.isSynchronizing.set(addrKey, syncPromise);
    return syncPromise;
  }

  /**
   * Rolls back the pending nonce counter (useful if transaction creation failed before broadcast)
   */
  public releaseNonce(address: string, nonceToRelease: number): void {
    const addrKey = address.toLowerCase();
    const current = this.pendingNonces.get(addrKey);

    if (current !== undefined && current === nonceToRelease + 1) {
      this.pendingNonces.set(addrKey, nonceToRelease);
    }
  }

  /**
   * Used for tests or full reset
   */
  public clear(): void {
    this.pendingNonces.clear();
    this.isSynchronizing.clear();
  }
}
