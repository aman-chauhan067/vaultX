import { useContext } from 'react';
import { WalletContext } from '../contexts/WalletContext.js';
import { AccountContext } from '../contexts/AccountContext.js';
import { NetworkContext } from '../contexts/NetworkContext.js';
import { TransactionContext } from '../contexts/TransactionContext.js';
import { SettingsContext } from '../contexts/SettingsContext.js';

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a VaultProvider');
  return context;
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) throw new Error('useAccount must be used within an AccountProvider');
  return context;
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) throw new Error('useNetwork must be used within a NetworkProvider');
  return context;
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) throw new Error('useTransactions must be used within a TransactionProvider');
  return context;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
}

export function useActiveWallet() {
  const { wallets, activeWalletId } = useWallet();
  return wallets.find((w) => w.metadata.walletId === activeWalletId) || null;
}

export function useActiveAccount() {
  const { activeAccount } = useAccount();
  return activeAccount;
}
export * from './useNetworkStats.js';
export * from './useNFTs.js';
export * from './usePortfolio.js';
