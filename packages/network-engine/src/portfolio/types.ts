import type { Currency } from '../prices/types.js';

export interface PortfolioSnapshot {
  walletAddress: string;
  timestamp: number;
  netWorth: number;
  currency: Currency;
  chainTotals: Record<number, number>;
  tokenTotals: Record<string, number>; // contractAddress -> usdValue
}

export interface PortfolioAnalytics {
  totalNetWorth: number;
  change24hAbsolute: number;
  change24hPercentage: number;
  bestPerformer?: { symbol: string; change: number };
  worstPerformer?: { symbol: string; change: number };
  biggestAsset?: { symbol: string; value: number; percentage: number };
  smallestAsset?: { symbol: string; value: number; percentage: number };
  stablecoinAllocation: number; // percentage
  nativeAllocation: number; // percentage
  dailyVolatility: number;
}
