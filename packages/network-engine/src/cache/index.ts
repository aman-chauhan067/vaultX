/**
 * @file cache/index.ts
 * @description In-memory TTL cache for provider requests to reduce RPC load.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class ProviderCache {
  private store: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTtlMs: number;

  constructor(defaultTtlMs: number = 5000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  public set<T>(key: string, value: T, ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.store.set(key, { value, expiresAt });
  }

  public get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  public clear(): void {
    this.store.clear();
  }

  /**
   * Helper to fetch data via a function, checking the cache first.
   */
  public async getOrFetch<T>(key: string, fetcher: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fetcher();
    this.set(key, fresh, ttlMs);
    return fresh;
  }
}
