import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  TokenInfo,
  TokenBalance,
  Currency,
  PortfolioSnapshot,
  PortfolioAnalytics
} from '@vaultx/network-engine';
import { VaultXService } from '../services/VaultXService.js';
import { useActiveWallet, useNetwork, useCurrency } from '../hooks/index.js';
import { formatEther } from '@vaultx/network-engine';
import { DEFAULT_TOKENS } from '../config/tokens.js';

export interface TokenBalanceWithFiat extends TokenBalance {
  fiatValue: number;
  price: number;
  priceChange24h: number;
  isStale: boolean;
}

export interface PortfolioData {
  ethBalance: string;
  formattedEthBalance: string;
  ethFiatValue: number;
  ethPrice: number;
  ethPriceChange24h: number;
  tokens: TokenBalanceWithFiat[];
  totalAssetsValueFiat: number;
  currency: Currency;
  isStale: boolean;
  lastUpdated: number;
}

export interface PortfolioContextType {
  portfolio: PortfolioData | null;
  history: PortfolioSnapshot[];
  analytics: PortfolioAnalytics | null;
  isLoading: boolean;
  error: string | null;
  refreshPortfolio: () => Promise<void>;
  registerCustomToken: (tokenAddress: string) => Promise<void>;
}

export const PortfolioContext = createContext<PortfolioContextType>({
  portfolio: null,
  history: [],
  analytics: null,
  isLoading: false,
  error: null,
  refreshPortfolio: async () => {},
  registerCustomToken: async () => {}
});

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
  const activeWallet = useActiveWallet();
  const { activeChainId } = useNetwork();
  const { currency } = useCurrency();

  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [history, setHistory] = useState<PortfolioSnapshot[]>([]);
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vaultXService = VaultXService.getInstance();

  useEffect(() => {
    // Register default tokens
    DEFAULT_TOKENS.forEach((t) => vaultXService.assetManager.registerCustomToken(t));
  }, []);

  const refreshPortfolio = useCallback(async () => {
    if (!activeWallet || !activeChainId) return;

    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch ETH balance
      const rawEthBalance = await vaultXService.networkEngine.execute(async (provider: any) => {
        const bal = await provider.getBalance(activeWallet.address);
        return bal.toString();
      });

      // 2. Fetch Token balances
      const rawTokens = await vaultXService.assetManager.getBalances(
        activeWallet.address,
        activeChainId
      );

      const ethVal = parseFloat(formatEther(rawEthBalance));

      // 3. Fetch Native Price
      const nativePriceEntry = await vaultXService.priceEngine.getNativePrice(
        activeChainId,
        currency
      );
      const ethPrice = nativePriceEntry?.price || 0;
      const ethPriceChange24h = nativePriceEntry?.change24h || 0;
      const ethFiatValue = ethVal * ethPrice;
      let totalFiat = ethFiatValue;
      let isStale = false;
      if (nativePriceEntry && Date.now() - nativePriceEntry.timestamp > nativePriceEntry.ttl) {
        isStale = true;
      }

      // 4. Fetch Token Prices
      const tokensWithFiat: TokenBalanceWithFiat[] = [];
      const tokenTotals: Record<string, number> = {};

      for (const t of rawTokens) {
        if (t.balance === '0' && !t.verified) continue;

        const val = parseFloat(t.formattedBalance);
        const priceEntry = await vaultXService.priceEngine.getTokenPrice(
          t.address,
          activeChainId,
          currency
        );

        const price = priceEntry?.price || 0;
        const fiatValue = val * price;
        totalFiat += fiatValue;

        if (priceEntry && Date.now() - priceEntry.timestamp > priceEntry.ttl) {
          isStale = true;
        }

        tokensWithFiat.push({
          ...t,
          fiatValue,
          price,
          priceChange24h: priceEntry?.change24h || 0,
          isStale: priceEntry ? Date.now() - priceEntry.timestamp > priceEntry.ttl : true
        });

        tokenTotals[t.address.toLowerCase()] = fiatValue;
      }

      const chainTotals = { [activeChainId]: totalFiat };

      const currentPortfolio: PortfolioData = {
        ethBalance: rawEthBalance,
        formattedEthBalance: formatEther(rawEthBalance),
        ethFiatValue,
        ethPrice,
        ethPriceChange24h,
        tokens: tokensWithFiat,
        totalAssetsValueFiat: totalFiat,
        currency,
        isStale,
        lastUpdated: Date.now()
      };

      setPortfolio(currentPortfolio);

      // Record snapshot
      const snapshot: PortfolioSnapshot = {
        walletAddress: activeWallet.address,
        timestamp: Date.now(),
        netWorth: totalFiat,
        currency,
        chainTotals,
        tokenTotals
      };

      await vaultXService.portfolioAnalyzer.recordSnapshot(snapshot);

      // Load History and Analytics
      const hist = await vaultXService.portfolioAnalyzer.getHistory(activeWallet.address);
      setHistory(hist);
      setAnalytics(vaultXService.portfolioAnalyzer.calculateAnalytics(snapshot, hist));
    } catch (err: any) {
      console.error('Failed to fetch portfolio', err);
      setError(err.message || 'Failed to fetch portfolio data');
    } finally {
      setIsLoading(false);
    }
  }, [activeWallet?.address, activeChainId, currency]);

  useEffect(() => {
    refreshPortfolio();
  }, [refreshPortfolio]);

  const registerCustomToken = async (address: string) => {
    if (!activeChainId) throw new Error('No active network');
    const tokenInfo = await vaultXService.assetManager.fetchTokenMetadata(address, activeChainId);
    vaultXService.assetManager.registerCustomToken(tokenInfo);
    await refreshPortfolio();
  };

  return (
    <PortfolioContext.Provider
      value={{
        portfolio,
        history,
        analytics,
        isLoading,
        error,
        refreshPortfolio,
        registerCustomToken
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};
