import { useContext } from 'react';
import { PortfolioContext } from '../contexts/PortfolioContext.js';

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}

export function usePortfolioHistory() {
  const { history } = usePortfolio();
  return history;
}

export function usePortfolioAnalytics() {
  const { analytics } = usePortfolio();
  return analytics;
}

export function usePriceHistory(contractAddress: string, chainId: number, days: number = 30) {
  // Not fully wired to context for simplicity, but mock function signature as requested by user
  return [];
}
