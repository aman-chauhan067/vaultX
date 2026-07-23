import type { IPriceProvider, PriceData, Currency } from '../types.js';

export class MockProvider implements IPriceProvider {
  public name = 'MockProvider';

  private MOCK_PRICES: Record<string, number> = {
    ETH: 3000,
    USDC: 1,
    USDT: 1,
    MATIC: 0.5,
    BNB: 600,
    AVAX: 30,
    FTM: 0.5
  };

  private getRate(currency: Currency): number {
    switch (currency) {
      case 'EUR':
        return 0.92;
      case 'GBP':
        return 0.79;
      case 'INR':
        return 83.5;
      case 'JPY':
        return 150.0;
      case 'AUD':
        return 1.5;
      case 'CAD':
        return 1.35;
      case 'USD':
      default:
        return 1;
    }
  }

  public async getPrice(
    contractAddress: string,
    chainId: number,
    currency: Currency
  ): Promise<PriceData | null> {
    // We just return a deterministic mock price based on the length of the contract address for testing
    const base = contractAddress.length % 2 === 0 ? 10 : 50;
    const val = base * this.getRate(currency);
    return {
      price: val,
      change24h: 2.5
    };
  }

  public async getNativePrice(chainId: number, currency: Currency): Promise<PriceData | null> {
    let symbol = 'ETH';
    if (chainId === 56 || chainId === 97) symbol = 'BNB';
    else if (chainId === 137 || chainId === 80002) symbol = 'MATIC';
    else if (chainId === 43114) symbol = 'AVAX';
    else if (chainId === 250) symbol = 'FTM';

    const base = this.MOCK_PRICES[symbol] || 1000;
    return {
      price: base * this.getRate(currency),
      change24h: 1.2
    };
  }

  public async getHistoricalPrices(
    contractAddress: string,
    chainId: number,
    currency: Currency,
    days: number
  ): Promise<[number, number][] | null> {
    const now = Date.now();
    const data: [number, number][] = [];
    const basePrice = (await this.getPrice(contractAddress, chainId, currency))?.price || 100;

    for (let i = days; i >= 0; i--) {
      data.push([now - i * 24 * 60 * 60 * 1000, basePrice * (1 + (Math.random() * 0.1 - 0.05))]);
    }
    return data;
  }
}
