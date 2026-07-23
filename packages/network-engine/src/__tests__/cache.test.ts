import { describe, it, expect, beforeEach } from 'vitest';
import { ProviderCache } from '../cache/index.js';

describe('ProviderCache', () => {
  let cache: ProviderCache;

  beforeEach(() => {
    cache = new ProviderCache(100); // 100ms default TTL
  });

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should expire values after TTL', async () => {
    cache.set('key1', 'value1', 50);

    expect(cache.get('key1')).toBe('value1');

    await new Promise((resolve) => setTimeout(resolve, 60)); // Wait for 60ms

    expect(cache.get('key1')).toBeNull();
  });

  it('should fetch if not cached or expired', async () => {
    let fetchCount = 0;
    const fetcher = async () => {
      fetchCount++;
      return 'data';
    };

    const res1 = await cache.getOrFetch('key', fetcher, 50);
    expect(res1).toBe('data');
    expect(fetchCount).toBe(1);

    // Call again, should hit cache
    const res2 = await cache.getOrFetch('key', fetcher, 50);
    expect(res2).toBe('data');
    expect(fetchCount).toBe(1);

    // Wait for expire
    await new Promise((resolve) => setTimeout(resolve, 60));

    const res3 = await cache.getOrFetch('key', fetcher, 50);
    expect(res3).toBe('data');
    expect(fetchCount).toBe(2);
  });
});
