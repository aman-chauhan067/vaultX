import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

import { extensionSendMessage, isExtensionEnvironment } from '../utils/extensionEnv.js';

// Locally defined to avoid cross-package TS resolution errors in the monorepo build
export type RequestStatus =
  | 'Created'
  | 'Queued'
  | 'Displayed'
  | 'Approved'
  | 'Rejected'
  | 'TimedOut'
  | 'Cancelled'
  | 'Completed'
  | 'Failed';

export interface ProviderRequest {
  requestId: string;
  origin: string;
  tabId?: number;
  frameId?: number;
  chainId?: number;
  account?: string;
  createdAt: number;
  expiresAt: number;
  method: string;
  params: any[];
  status: RequestStatus;
  error?: string;
  result?: any;
}

interface ExtensionContextState {
  currentRequest: ProviderRequest | null;
  approveRequest: (result: any) => Promise<void>;
  rejectRequest: (reason: string) => Promise<void>;
}

export const ExtensionContext = createContext<ExtensionContextState | null>(null);

export const useExtensionContext = () => {
  const ctx = useContext(ExtensionContext);
  if (!ctx) throw new Error('useExtensionContext must be used within ExtensionProvider');
  return ctx;
};

export const ExtensionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRequest, setCurrentRequest] = useState<ProviderRequest | null>(null);

  // Poll for active request if running inside extension
  useEffect(() => {
    if (!isExtensionEnvironment()) return; // Not in extension context

    const fetchPending = () => {
      extensionSendMessage({ type: 'GET_PENDING_REQUEST' }, (response: any) => {
        if (response && response.success && response.data) {
          setCurrentRequest(response.data);
        } else {
          setCurrentRequest(null);
        }
      });
    };

    fetchPending();
    const interval = setInterval(fetchPending, 1000); // Check queue every second

    return () => clearInterval(interval);
  }, []);

  const approveRequest = useCallback(
    async (result: any) => {
      if (!currentRequest) return;
      if (isExtensionEnvironment()) {
        extensionSendMessage({
          type: 'RESOLVE_REQUEST',
          payload: { requestId: currentRequest.requestId, result }
        });
      }
      setCurrentRequest(null);
      // Let the interval fetch the next one if it exists
    },
    [currentRequest]
  );

  const rejectRequest = useCallback(
    async (reason: string) => {
      if (!currentRequest) return;
      if (isExtensionEnvironment()) {
        extensionSendMessage({
          type: 'REJECT_REQUEST',
          payload: { requestId: currentRequest.requestId, reason }
        });
      }
      setCurrentRequest(null);
    },
    [currentRequest]
  );

  return (
    <ExtensionContext.Provider value={{ currentRequest, approveRequest, rejectRequest }}>
      {children}
    </ExtensionContext.Provider>
  );
};
