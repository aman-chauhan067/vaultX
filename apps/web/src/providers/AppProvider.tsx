import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VaultProvider } from './VaultProvider.js';
import { NetworkProvider } from './NetworkProvider.js';
import { TransactionProvider } from './TransactionProvider.js';
import { PortfolioProvider } from '../contexts/PortfolioContext.js';
import { WalletConnectProvider } from '../contexts/WalletConnectProvider.js';
import { ExtensionProvider } from '../contexts/ExtensionProvider.js';
import { SettingsProvider } from './SettingsProvider.js';
import { ComingSoonProvider } from './ComingSoonProvider.js';
import { ToastProvider } from '../design-system/index.js';
import { AppErrorBoundary } from './AppErrorBoundary.js';
import { ExtensionRequestModal } from '../components/Modals/ExtensionRequestModal.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
      retry: 2
    }
  }
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ComingSoonProvider>
          <SettingsProvider>
            <ToastProvider>
              <VaultProvider>
                <NetworkProvider>
                  <TransactionProvider>
                    <PortfolioProvider>
                      <ExtensionProvider>
                        <WalletConnectProvider>
                          {children}
                          <ExtensionRequestModal />
                        </WalletConnectProvider>
                      </ExtensionProvider>
                    </PortfolioProvider>
                  </TransactionProvider>
                </NetworkProvider>
              </VaultProvider>
            </ToastProvider>
          </SettingsProvider>
        </ComingSoonProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};
