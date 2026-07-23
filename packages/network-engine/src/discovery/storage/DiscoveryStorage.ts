export interface DiscoveryState {
  lastScannedBlock: Record<number, number>; // chainId -> blockNumber
  discoveredTokens: string[]; // List of contract addresses
}

export interface IDiscoveryStorage {
  getState(walletAddress: string): Promise<DiscoveryState>;
  saveState(walletAddress: string, state: DiscoveryState): Promise<void>;
  updateLastScannedBlock(
    walletAddress: string,
    chainId: number,
    blockNumber: number
  ): Promise<void>;
  addDiscoveredToken(walletAddress: string, contractAddress: string): Promise<void>;
}

export class LocalDiscoveryStorage implements IDiscoveryStorage {
  private readonly PREFIX = 'vaultx_discovery_';
  private inMemoryFallback: Record<string, DiscoveryState> = {};
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private getKey(walletAddress: string) {
    return `${this.PREFIX}${walletAddress.toLowerCase()}`;
  }

  public async getState(walletAddress: string): Promise<DiscoveryState> {
    const defaultState: DiscoveryState = { lastScannedBlock: {}, discoveredTokens: [] };
    const key = this.getKey(walletAddress);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const data = await chrome.storage.local.get(key);
        return data[key] ? JSON.parse(data[key]) : defaultState;
      } catch {
        return defaultState;
      }
    }
    if (!this.isBrowser) return this.inMemoryFallback[walletAddress] || defaultState;
    try {
      const data = window.localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultState;
    } catch {
      return defaultState;
    }
  }

  public async saveState(walletAddress: string, state: DiscoveryState): Promise<void> {
    const key = this.getKey(walletAddress);
    const serialized = JSON.stringify(state);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        await chrome.storage.local.set({ [key]: serialized });
        return;
      } catch {
        this.inMemoryFallback[walletAddress] = state;
        return;
      }
    }
    if (!this.isBrowser) {
      this.inMemoryFallback[walletAddress] = state;
      return;
    }
    try {
      window.localStorage.setItem(key, serialized);
    } catch {
      this.inMemoryFallback[walletAddress] = state;
    }
  }

  public async updateLastScannedBlock(
    walletAddress: string,
    chainId: number,
    blockNumber: number
  ): Promise<void> {
    const state = await this.getState(walletAddress);
    state.lastScannedBlock[chainId] = blockNumber;
    await this.saveState(walletAddress, state);
  }

  public async addDiscoveredToken(walletAddress: string, contractAddress: string): Promise<void> {
    const state = await this.getState(walletAddress);
    if (!state.discoveredTokens.includes(contractAddress.toLowerCase())) {
      state.discoveredTokens.push(contractAddress.toLowerCase());
      await this.saveState(walletAddress, state);
    }
  }
}
