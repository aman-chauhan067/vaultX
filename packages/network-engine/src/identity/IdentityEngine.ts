import type { IIdentityResolver, IdentityProfile } from './types.js';
import type { ProviderManager } from '../providers/index.js';

interface CacheEntry {
  profile: IdentityProfile;
  timestamp: number;
}

export class IdentityEngine {
  private resolvers: IIdentityResolver[] = [];
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60; // 1 hour

  constructor(private providerManager: ProviderManager) {}

  public registerResolver(resolver: IIdentityResolver): void {
    this.resolvers.push(resolver);
  }

  private getCacheKey(addressOrName: string, chainId: number): string {
    return `${chainId}_${addressOrName.toLowerCase()}`;
  }

  /**
   * Looks up a primary name and avatar for an address.
   */
  public async lookupProfile(address: string, chainId: number): Promise<IdentityProfile | null> {
    const key = this.getCacheKey(address, chainId);
    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      if (Date.now() - entry.timestamp < this.CACHE_TTL) {
        return entry.profile;
      }
    }

    const provider = this.providerManager.getProvider(chainId);
    if (!provider) return null;

    for (const resolver of this.resolvers) {
      if (resolver.supportedChainIds.includes(chainId)) {
        const name = await resolver.lookupAddress(address, provider);
        if (name) {
          const avatar = await resolver.getAvatar(name, provider);
          const profile: IdentityProfile = {
            address,
            name,
            avatar,
            resolver: resolver.name
          };
          this.cache.set(key, { profile, timestamp: Date.now() });
          return profile;
        }
      }
    }

    // Cache null results shortly to prevent spamming RPC on unresolved addresses
    const nullProfile: IdentityProfile = { address, name: null, avatar: null, resolver: 'None' };
    this.cache.set(key, { profile: nullProfile, timestamp: Date.now() });

    return nullProfile;
  }

  /**
   * Resolves a name to an address.
   */
  public async resolveName(name: string, chainId: number): Promise<string | null> {
    const key = this.getCacheKey(name, chainId);
    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      if (Date.now() - entry.timestamp < this.CACHE_TTL) {
        return entry.profile.address;
      }
    }

    const provider = this.providerManager.getProvider(chainId);
    if (!provider) return null;

    for (const resolver of this.resolvers) {
      if (resolver.supportedChainIds.includes(chainId)) {
        const address = await resolver.resolveName(name, provider);
        if (address) {
          const profile: IdentityProfile = {
            address,
            name,
            avatar: null, // Defer avatar fetch
            resolver: resolver.name
          };
          this.cache.set(key, { profile, timestamp: Date.now() });
          return address;
        }
      }
    }

    return null;
  }
}
