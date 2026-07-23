import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { VaultXService } from '../services/VaultXService.js';
import type { WCSessionProposal, WCSessionRequest } from '@vaultx/network-engine';
import { WCSessionProposalModal } from '../components/Modals/WCSessionProposalModal.js';
import { WCRequestModal } from '../components/Modals/WCRequestModal.js';

interface WCContextState {
  currentProposal: WCSessionProposal | null;
  currentRequest: WCSessionRequest | null;
  approveProposal: (approvedChains: number[]) => Promise<void>;
  rejectProposal: (reason: string) => Promise<void>;
  approveRequest: (result: any) => Promise<void>;
  rejectRequest: (reason: string) => Promise<void>;
}

export const WalletConnectContext = createContext<WCContextState | null>(null);

export const useWalletConnect = () => {
  const ctx = useContext(WalletConnectContext);
  if (!ctx) throw new Error('useWalletConnect must be used within WalletConnectProvider');
  return ctx;
};

export const WalletConnectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [proposalQueue, setProposalQueue] = useState<WCSessionProposal[]>([]);
  const [requestQueue, setRequestQueue] = useState<WCSessionRequest[]>([]);

  const wcService = VaultXService.getInstance().walletConnect;

  // Initialize WalletConnect (Ensure VITE_WC_PROJECT_ID is in .env)
  useEffect(() => {
    const projectId = import.meta.env.VITE_WC_PROJECT_ID;
    if (projectId) {
      VaultXService.getInstance().initWalletConnect(projectId);
    }
  }, []);

  useEffect(() => {
    const onProposal = (proposal: WCSessionProposal) => {
      setProposalQueue((prev) => [...prev, proposal]);
    };

    const onRequest = (request: WCSessionRequest) => {
      setRequestQueue((prev) => [...prev, request]);
    };

    const onDelete = (topic: string) => {
      // Clean up requests if session was deleted while pending
      setRequestQueue((prev) => prev.filter((req) => req.topic !== topic));
    };

    wcService.on('session_proposal', onProposal);
    wcService.on('session_request', onRequest);
    wcService.on('session_delete', onDelete);

    return () => {
      wcService.off('session_proposal', onProposal);
      wcService.off('session_request', onRequest);
      wcService.off('session_delete', onDelete);
    };
  }, [wcService]);

  const currentProposal = proposalQueue.length > 0 ? proposalQueue[0] || null : null;
  const currentRequest = requestQueue.length > 0 ? requestQueue[0] || null : null;

  const approveProposal = useCallback(
    async (approvedChains: number[]) => {
      if (!currentProposal) return;
      const activeWallet = VaultXService.getInstance().accountManager.getActiveWallet();
      if (!activeWallet) throw new Error('No active wallet');

      try {
        await wcService.approveSession(currentProposal.id, activeWallet.address, approvedChains);
      } finally {
        setProposalQueue((prev) => prev.slice(1));
      }
    },
    [currentProposal, wcService]
  );

  const rejectProposal = useCallback(
    async (reason: string) => {
      if (!currentProposal) return;
      try {
        await wcService.rejectSession(currentProposal.id, reason);
      } finally {
        setProposalQueue((prev) => prev.slice(1));
      }
    },
    [currentProposal, wcService]
  );

  const approveRequest = useCallback(
    async (result: any) => {
      if (!currentRequest) return;
      try {
        await wcService.respondToRequest(currentRequest.topic, {
          id: currentRequest.id,
          jsonrpc: '2.0',
          result
        });
      } finally {
        setRequestQueue((prev) => prev.slice(1));
      }
    },
    [currentRequest, wcService]
  );

  const rejectRequest = useCallback(
    async (reason: string) => {
      if (!currentRequest) return;
      try {
        await wcService.respondToRequest(currentRequest.topic, {
          id: currentRequest.id,
          jsonrpc: '2.0',
          error: { code: 5000, message: reason }
        });
      } finally {
        setRequestQueue((prev) => prev.slice(1));
      }
    },
    [currentRequest, wcService]
  );

  return (
    <WalletConnectContext.Provider
      value={{
        currentProposal,
        currentRequest,
        approveProposal,
        rejectProposal,
        approveRequest,
        rejectRequest
      }}
    >
      {children}
      <WCSessionProposalModal />
      <WCRequestModal />
    </WalletConnectContext.Provider>
  );
};
