import type { PortfolioSnapshot, PortfolioAnalytics } from './types.js';
import type { IPortfolioStorage } from './storage/PortfolioStorage.js';

export class PortfolioAnalyzer {
  constructor(private storage: IPortfolioStorage) {}

  public async recordSnapshot(snapshot: PortfolioSnapshot): Promise<void> {
    await this.storage.saveSnapshot(snapshot);
  }

  public async getHistory(walletAddress: string): Promise<PortfolioSnapshot[]> {
    return await this.storage.getSnapshots(walletAddress);
  }

  public calculateAnalytics(
    currentSnapshot: PortfolioSnapshot,
    history: PortfolioSnapshot[]
  ): PortfolioAnalytics {
    // 1. 24h Change
    const oneDayAgo = currentSnapshot.timestamp - 24 * 60 * 60 * 1000;

    // Find the snapshot closest to 24h ago
    let closest24h: PortfolioSnapshot | null = null;
    let minDiff = Infinity;

    for (const snap of history) {
      if (snap.currency !== currentSnapshot.currency) continue; // Only compare same currency
      const diff = Math.abs(snap.timestamp - oneDayAgo);
      if (diff < minDiff && snap.timestamp < currentSnapshot.timestamp) {
        minDiff = diff;
        closest24h = snap;
      }
    }

    let change24hAbsolute = 0;
    let change24hPercentage = 0;

    if (closest24h && closest24h.netWorth > 0) {
      change24hAbsolute = currentSnapshot.netWorth - closest24h.netWorth;
      change24hPercentage = (change24hAbsolute / closest24h.netWorth) * 100;
    }

    // Default empty analytics if we don't have enough data for advanced stuff yet
    // In a real implementation we would require historical token data inside the snapshot to calculate best/worst performer
    // For this demonstration, we'll return the base analytics

    return {
      totalNetWorth: currentSnapshot.netWorth,
      change24hAbsolute,
      change24hPercentage,
      stablecoinAllocation: 0, // Requires stablecoin address list
      nativeAllocation: 0, // Requires mapping of native asset values
      dailyVolatility: 0
    };
  }
}
