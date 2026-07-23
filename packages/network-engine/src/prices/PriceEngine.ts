import type { IPriceProvider, PriceCacheEntry, Currency, PriceData } from './types.js';

export class PriceEngine {
  private providers: IPriceProvider[] = [];

  // In-memory cache
  private cache: Map<string, PriceCacheEntry> = new Map();

  // Promise deduplication map to prevent simultaneous requests for the same asset
  private pendingRequests: Map<string, Promise<PriceData | null>> = new Map();

  // 5 minutes TTL
  private readonly DEFAULT_TTL = 5 * 60 * 1000;

  constructor(primaryProvider: IPriceProvider, fallbackProviders: IPriceProvider[] = []) {
    this.providers = [primaryProvider, ...fallbackProviders];
  }

  private getCacheKey(
    type: 'token' | 'native',
    id: string,
    chainId: number,
    currency: Currency
  ): string {
    return `${type}_${chainId}_${id.toLowerCase()}_${currency}`;
  }

  /**
   * Loads the persistent cache into memory
   */
  public loadCache(persistentData: Record<string, PriceCacheEntry>): void {
    Object.entries(persistentData).forEach(([k, v]) => {
      this.cache.set(k, v);
    });
  }

  /**
   * Exports the current memory cache to save to persistent storage
   */
  public exportCache(): Record<string, PriceCacheEntry> {
    const data: Record<string, PriceCacheEntry> = {};
    this.cache.forEach((v, k) => {
      data[k] = v;
    });
    return data;
  }

  /**
   * Main entry point to get a token price.
   * Resolves from memory -> persistent -> API
   */
  public async getTokenPrice(
    contractAddress: string,
    chainId: number,
    currency: Currency
  ): Promise<PriceCacheEntry | null> {
    const key = this.getCacheKey('token', contractAddress, chainId, currency);

    // 1. Check Memory Cache
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached;
    }

    // 2. Request deduplication (if already fetching, await that promise)
    if (this.pendingRequests.has(key)) {
      const result = await this.pendingRequests.get(key);
      if (result) return this.cache.get(key) || null;
      return cached || null; // fallback to stale if fetch failed
    }

    // 3. API Fetch with failover
    const fetchPromise = this.fetchWithFailover((p) =>
      p.getPrice(contractAddress, chainId, currency)
    );
    this.pendingRequests.set(key, fetchPromise);

    try {
      const result = await fetchPromise;
      if (result) {
        const entry: PriceCacheEntry = {
          price: result.price,
          change24h: result.change24h,
          timestamp: Date.now(),
          provider: 'unknown', // will be injected by failover
          confidence: 'HIGH',
          currency,
          ttl: this.DEFAULT_TTL
        };
        // In a real implementation we track which provider succeeded
        this.cache.set(key, entry);
        return entry;
      }
    } catch (err) {
      console.error(`PriceEngine: Failed to fetch token price for ${contractAddress}`, err);
    } finally {
      this.pendingRequests.delete(key);
    }

    // 4. Offline / Stale fallback
    return cached || null;
  }

  public async getNativePrice(
    chainId: number,
    currency: Currency
  ): Promise<PriceCacheEntry | null> {
    const key = this.getCacheKey('native', '0x0', chainId, currency);

    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached;
    }

    if (this.pendingRequests.has(key)) {
      const result = await this.pendingRequests.get(key);
      if (result) return this.cache.get(key) || null;
      return cached || null;
    }

    const fetchPromise = this.fetchWithFailover((p) => p.getNativePrice(chainId, currency));
    this.pendingRequests.set(key, fetchPromise);

    try {
      const result = await fetchPromise;
      if (result) {
        const entry: PriceCacheEntry = {
          price: result.price,
          change24h: result.change24h,
          timestamp: Date.now(),
          provider: 'unknown',
          confidence: 'HIGH',
          currency,
          ttl: this.DEFAULT_TTL
        };
        this.cache.set(key, entry);
        return entry;
      }
    } catch (err) {
      console.error(`PriceEngine: Failed to fetch native price for chain ${chainId}`, err);
    } finally {
      this.pendingRequests.delete(key);
    }

    return cached || null;
  }

  private async fetchWithFailover(
    fetcher: (provider: IPriceProvider) => Promise<PriceData | null>
  ): Promise<PriceData | null> {
    for (const provider of this.providers) {
      try {
        const result = await fetcher(provider);
        if (result !== null) {
          // Ideally we attach the provider name here, but we'll let the caller wrap it
          return result;
        }
      } catch (err) {
        console.warn(`PriceProvider ${provider.name} failed, trying next...`);
      }
    }
    return null;
  }
}
