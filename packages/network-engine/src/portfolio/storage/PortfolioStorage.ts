import type { PortfolioSnapshot } from '../types.js';

export interface IPortfolioStorage {
  /**
   * Initialize the storage
   */
  init(): Promise<void>;

  /**
   * Save a snapshot to storage
   */
  saveSnapshot(snapshot: PortfolioSnapshot): Promise<void>;

  /**
   * Retrieve all stored snapshots for a specific wallet address
   */
  getSnapshots(walletAddress: string): Promise<PortfolioSnapshot[]>;

  /**
   * Clear all snapshots for a wallet address
   */
  clearSnapshots(walletAddress: string): Promise<void>;
}

export class LocalStoragePortfolio implements IPortfolioStorage {
  private readonly STORAGE_KEY = 'vaultx_portfolio_snapshots';
  private inMemoryFallback: PortfolioSnapshot[] = [];
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  public async init(): Promise<void> {
    // No-op for local storage
  }

  public async saveSnapshot(snapshot: PortfolioSnapshot): Promise<void> {
    const all = await this.getAll();
    all.push(snapshot);
    // Keep last 30 days of daily snapshots approximately (30 * 24 if hourly, just limit to 1000 for now)
    if (all.length > 1000) {
      all.shift();
    }
    await this.saveAll(all);
  }

  public async getSnapshots(walletAddress: string): Promise<PortfolioSnapshot[]> {
    const all = await this.getAll();
    return all.filter((s) => s.walletAddress.toLowerCase() === walletAddress.toLowerCase());
  }

  public async clearSnapshots(walletAddress: string): Promise<void> {
    const all = await this.getAll();
    const filtered = all.filter(
      (s) => s.walletAddress.toLowerCase() !== walletAddress.toLowerCase()
    );
    await this.saveAll(filtered);
  }

  private async getAll(): Promise<PortfolioSnapshot[]> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const data = await chrome.storage.local.get(this.STORAGE_KEY);
        return data[this.STORAGE_KEY] ? JSON.parse(data[this.STORAGE_KEY]) : [];
      } catch {
        return this.inMemoryFallback;
      }
    }
    if (!this.isBrowser) return this.inMemoryFallback;
    try {
      const data = window.localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      return this.inMemoryFallback;
    }
  }

  private async saveAll(data: PortfolioSnapshot[]): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        await chrome.storage.local.set({ [this.STORAGE_KEY]: JSON.stringify(data) });
        return;
      } catch {
        this.inMemoryFallback = data;
        return;
      }
    }
    if (!this.isBrowser) {
      this.inMemoryFallback = data;
      return;
    }
    try {
      window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      this.inMemoryFallback = data;
    }
  }
}
