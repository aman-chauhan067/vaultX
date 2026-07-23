import type { IPriceProvider, PriceData, Currency } from '../types.js';

/**
 * Maps standard chain IDs to CoinGecko asset platform IDs
 */
const COINGECKO_PLATFORMS: Record<number, string> = {
  1: 'ethereum',
  11155111: 'ethereum', // Sepolia (mock via ETH)
  56: 'binance-smart-chain',
  97: 'binance-smart-chain', // BSC Testnet
  137: 'polygon-pos',
  80002: 'polygon-pos', // Amoy
  42161: 'arbitrum-one',
  10: 'optimistic-ethereum',
  8453: 'base',
  59144: 'linea',
  43114: 'avalanche',
  250: 'fantom'
};

const COINGECKO_NATIVE_IDS: Record<number, string> = {
  1: 'ethereum',
  11155111: 'ethereum',
  56: 'binancecoin',
  97: 'binancecoin',
  137: 'matic-network',
  80002: 'matic-network',
  42161: 'ethereum', // Arbitrum uses ETH
  10: 'ethereum', // Optimism uses ETH
  8453: 'ethereum', // Base uses ETH
  59144: 'ethereum', // Linea uses ETH
  43114: 'avalanche-2',
  250: 'fantom'
};

export class CoinGeckoProvider implements IPriceProvider {
  public name = 'CoinGecko';
  private baseUrl = 'https://api.coingecko.com/api/v3';

  public async getPrice(
    contractAddress: string,
    chainId: number,
    currency: Currency
  ): Promise<PriceData | null> {
    const platform = COINGECKO_PLATFORMS[chainId];
    if (!platform) return null;

    try {
      const vs = currency.toLowerCase();
      const res = await fetch(
        `${this.baseUrl}/simple/token_price/${platform}?contract_addresses=${contractAddress}&vs_currencies=${vs}&include_24hr_change=true`
      );

      if (!res.ok) {
        throw new Error(`CoinGecko HTTP ${res.status}`);
      }

      const data = await res.json();
      const addrKey = contractAddress.toLowerCase();

      if (data[addrKey] && data[addrKey][vs]) {
        return {
          price: data[addrKey][vs],
          change24h: data[addrKey][`${vs}_24h_change`] || 0
        };
      }
      return null;
    } catch (err) {
      console.error(`CoinGeckoProvider getPrice failed:`, err);
      return null;
    }
  }

  public async getNativePrice(chainId: number, currency: Currency): Promise<PriceData | null> {
    const cgId = COINGECKO_NATIVE_IDS[chainId];
    if (!cgId) return null;

    try {
      const vs = currency.toLowerCase();
      const res = await fetch(
        `${this.baseUrl}/simple/price?ids=${cgId}&vs_currencies=${vs}&include_24hr_change=true`
      );

      if (!res.ok) {
        throw new Error(`CoinGecko HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data[cgId] && data[cgId][vs]) {
        return {
          price: data[cgId][vs],
          change24h: data[cgId][`${vs}_24h_change`] || 0
        };
      }
      return null;
    } catch (err) {
      console.error(`CoinGeckoProvider getNativePrice failed:`, err);
      return null;
    }
  }

  public async getHistoricalPrices(
    contractAddress: string,
    chainId: number,
    currency: Currency,
    days: number
  ): Promise<[number, number][] | null> {
    // Note: CoinGecko public API has strict limits on historical data, this is best-effort
    const platform = COINGECKO_PLATFORMS[chainId];
    if (!platform) return null;

    try {
      const vs = currency.toLowerCase();
      const res = await fetch(
        `${this.baseUrl}/coins/${platform}/contract/${contractAddress}/market_chart/?vs_currency=${vs}&days=${days}`
      );

      if (!res.ok) {
        throw new Error(`CoinGecko HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.prices) {
        return data.prices;
      }
      return null;
    } catch (err) {
      return null;
    }
  }
}
