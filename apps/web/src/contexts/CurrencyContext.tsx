import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Currency } from '@vaultx/network-engine';

export interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  getSymbol: (currency: Currency) => string;
}

export const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: () => {},
  getSymbol: () => '$'
});

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vaultx_currency') as Currency;
      if (stored) setCurrencyState(stored);
    } catch (err) {
      console.warn('Failed to load currency from local storage');
    }
  }, []);

  const setCurrency = (cur: Currency) => {
    setCurrencyState(cur);
    try {
      localStorage.setItem('vaultx_currency', cur);
    } catch (err) {
      console.warn('Failed to save currency to local storage');
    }
  };

  const getSymbol = (cur: Currency) => {
    switch (cur) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'INR':
        return '₹';
      case 'JPY':
        return '¥';
      case 'AUD':
        return 'A$';
      case 'CAD':
        return 'C$';
      default:
        return '$';
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, getSymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
