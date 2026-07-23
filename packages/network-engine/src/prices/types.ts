export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'AUD' | 'CAD';

export interface PriceData {
  price: number;
  change24h: number;
  marketCap?: number;
  volume24h?: number;
}

export interface PriceCacheEntry {
  price: number;
  change24h: number;
  timestamp: number;
  provider: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  currency: Currency;
  ttl: number; // Time to live in ms
}

export interface IPriceProvider {
  name: string;

  /**
   * Fetch the current price for a specific token
   */
  getPrice(contractAddress: string, chainId: number, currency: Currency): Promise<PriceData | null>;

  /**
   * Fetch the current price for a native chain asset
   */
  getNativePrice(chainId: number, currency: Currency): Promise<PriceData | null>;

  /**
   * Fetch historical prices for a token (24h, 7d, 30d)
   */
  getHistoricalPrices(
    contractAddress: string,
    chainId: number,
    currency: Currency,
    days: number
  ): Promise<[number, number][] | null>;
}
