import type { IIdentityResolver } from '../types.js';

export class ENSResolver implements IIdentityResolver {
  public readonly name = 'ENS';
  public readonly supportedChainIds = [1, 5, 11155111]; // Mainnet, Goerli, Sepolia

  public async resolveName(name: string, provider: any): Promise<string | null> {
    try {
      if (!name.endsWith('.eth')) return null;
      return await provider.resolveName(name);
    } catch {
      return null;
    }
  }

  public async lookupAddress(address: string, provider: any): Promise<string | null> {
    try {
      return await provider.lookupAddress(address);
    } catch {
      return null;
    }
  }

  public async getAvatar(name: string, provider: any): Promise<string | null> {
    try {
      if (!name.endsWith('.eth')) return null;
      return await provider.getAvatar(name);
    } catch {
      return null;
    }
  }
}
