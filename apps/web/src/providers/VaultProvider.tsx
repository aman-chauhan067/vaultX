import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { VaultXService } from '../services/VaultXService.js';
import { WalletContext } from '../contexts/WalletContext.js';
import { AccountContext, type SafeAccount } from '../contexts/AccountContext.js';

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const service = VaultXService.getInstance();
  const accountManager = service.accountManager;

  const [isLocked, setIsLocked] = useState(() => accountManager.getSessionState().isLocked);
  const [hasVault, setHasVault] = useState(false);
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Initialize
  useEffect(() => {
    const init = async () => {
      const exists = await accountManager.hasExistingVault();
      setHasVault(exists);
      const locked = accountManager.getSessionState().isLocked;
      setIsLocked(locked);
      if (!locked) {
        const active = accountManager.getActiveWallet();
        if (active) setActiveWalletId(active.metadata.walletId);
      }
    };
    init();

    const handleLock = () => {
      setIsLocked(true);
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    };

    const handleUnlock = () => {
      setIsLocked(false);
      const active = accountManager.getActiveWallet();
      if (active) setActiveWalletId(active.metadata.walletId);
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    };

    accountManager.events.on('WalletLocked', handleLock);
    accountManager.events.on('WalletUnlocked', handleUnlock);
    return () => {
      accountManager.events.off('WalletLocked', handleLock);
      accountManager.events.off('WalletUnlocked', handleUnlock);
    };
  }, [accountManager, queryClient]);

  // Queries
  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets', isLocked],
    queryFn: async () => {
      if (isLocked) return [];
      return Object.values(accountManager.getWallets());
    },
    enabled: !isLocked
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts', activeWalletId, isLocked],
    queryFn: async () => {
      if (isLocked || !activeWalletId) return [];
      const wallet = accountManager.getWallets()[activeWalletId];
      if (!wallet) return [];
      if (wallet.metadata.hidden) {
        return [
          {
            id: wallet.metadata.walletId,
            address: '0x0000000000000000000000000000000000000000',
            name: 'Hidden Account'
          }
        ] as SafeAccount[];
      }

      return [
        {
          id: wallet.metadata.walletId,
          address: wallet.address,
          name: wallet.metadata.walletName
        }
      ] as SafeAccount[];
    },
    enabled: !isLocked && !!activeWalletId
  });

  // Actions
  const createVault = useCallback(
    async (password: string) => {
      try {
        await accountManager.createVault(password);
        setHasVault(true);
        setIsLocked(false);
        setError(null);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [accountManager]
  );

  const unlock = useCallback(
    async (password: string) => {
      try {
        await accountManager.unlock(password);
        setIsLocked(false);
        setError(null);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [accountManager]
  );

  const lock = useCallback(() => {
    accountManager.lock();
  }, [accountManager]);

  const resetVault = useCallback(async () => {
    try {
      await accountManager.resetVault();
      setHasVault(false);
      setIsLocked(true);
      setActiveWalletId(null);
      setActiveAccountId(null);
      queryClient.clear(); // Clear all cached user data
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [accountManager, queryClient]);

  const createWallet = useCallback(
    async (mnemonic: string, name: string) => {
      try {
        const wallet = await accountManager.generateWalletFromMnemonic(mnemonic, 0, name);
        setActiveWalletId(wallet.metadata.walletId);
        queryClient.invalidateQueries({ queryKey: ['wallets'] });
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [accountManager, queryClient]
  );

  const deriveAccount = useCallback(
    async (name: string) => {
      try {
        const currentWallets = Object.values(accountManager.getWallets());

        const rootWallet = currentWallets.find((w) => w.mnemonic);
        if (!rootWallet || !rootWallet.mnemonic) {
          throw new Error(
            'No root seed phrase found. Please create a new wallet or import a seed phrase.'
          );
        }

        const hdWallets = currentWallets.filter((w) => w.metadata.walletType === 'HD');
        const nextIndex =
          hdWallets.length > 0 ? Math.max(...hdWallets.map((w) => w.metadata.accountIndex)) + 1 : 0;

        const wallet = await accountManager.generateWalletFromMnemonic(
          rootWallet.mnemonic,
          nextIndex,
          name
        );
        setActiveWalletId(wallet.metadata.walletId);
        queryClient.invalidateQueries({ queryKey: ['wallets'] });
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [accountManager, queryClient]
  );

  const importWallet = useCallback(
    async (privateKey: string, name: string) => {
      try {
        const wallet = await accountManager.importWallet(privateKey, name);
        setActiveWalletId(wallet.metadata.walletId);
        queryClient.invalidateQueries({ queryKey: ['wallets'] });
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [accountManager, queryClient]
  );

  const hideWallet = useCallback(
    async (walletId: string, hidden: boolean) => {
      try {
        await accountManager.hideWallet(walletId, hidden);

        if (hidden && walletId === activeWalletId) {
          const wallets = Object.values(accountManager.getWallets());
          const visibleWallets = wallets.filter(
            (w) => !w.metadata.hidden && w.metadata.walletId !== walletId
          );
          const fallbackWallet = visibleWallets[0];
          if (fallbackWallet) {
            setActiveWalletId(fallbackWallet.metadata.walletId);
          }
        }

        queryClient.invalidateQueries({ queryKey: ['wallets'] });
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [accountManager, queryClient]
  );

  const removeWallet = useCallback(
    async (walletId: string) => {
      try {
        await accountManager.removeWallet(walletId);

        if (walletId === activeWalletId) {
          const wallets = Object.values(accountManager.getWallets());
          const visibleWallets = wallets.filter(
            (w) => !w.metadata.hidden && w.metadata.walletId !== walletId
          );
          const fallbackWallet = visibleWallets[0];
          if (fallbackWallet) {
            setActiveWalletId(fallbackWallet.metadata.walletId);
          }
        }

        queryClient.invalidateQueries({ queryKey: ['wallets'] });
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [accountManager, queryClient]
  );

  const verifyPassword = useCallback(
    async (password: string) => {
      return accountManager.verifyPassword(password);
    },
    [accountManager]
  );

  const generateMnemonic = useCallback(
    (length: 12 | 24 = 12) => {
      return accountManager.generateMnemonic(length);
    },
    [accountManager]
  );

  const validateMnemonic = useCallback(
    (mnemonic: string) => {
      return accountManager.validateMnemonic(mnemonic);
    },
    [accountManager]
  );

  const createAccount = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
  }, [queryClient]);

  const pingSession = useCallback(() => {
    accountManager.pingSession();
  }, [accountManager]);

  const getSessionState = useCallback(() => {
    return accountManager.getSessionState();
  }, [accountManager]);

  // Setup auto-lock activity listeners
  useEffect(() => {
    if (isLocked) return;

    let lastPing = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      // Throttle pings to once every 5 seconds to reduce overhead
      if (now - lastPing > 5000) {
        lastPing = now;
        accountManager.pingSession();
      }
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach((event) => document.addEventListener(event, handleActivity, { passive: true }));

    return () => {
      events.forEach((event) => document.removeEventListener(event, handleActivity));
    };
  }, [isLocked, accountManager]);

  const activeAccount = useMemo(() => {
    return accounts.find((a) => a.id === activeAccountId) || null;
  }, [accounts, activeAccountId]);

  return (
    <WalletContext.Provider
      value={{
        isLocked,
        hasVault,
        wallets,
        activeWalletId,
        activeAccountId,
        error,
        unlock,
        createVault,
        lock,
        resetVault,
        createWallet,
        deriveAccount,
        importWallet,
        hideWallet,
        removeWallet,
        verifyPassword,
        generateMnemonic,
        validateMnemonic,
        pingSession,
        getSessionState,
        setActiveWallet: (id) => setActiveWalletId(id),
        setActiveAccount: (id) => setActiveAccountId(id)
      }}
    >
      <AccountContext.Provider
        value={{
          activeAccount,
          accounts,
          error,
          createAccount
        }}
      >
        {children}
      </AccountContext.Provider>
    </WalletContext.Provider>
  );
};
