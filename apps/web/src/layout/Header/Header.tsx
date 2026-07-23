import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/index.js';
import { Moon, Sun, Monitor, Lock as LockIcon, Wallet, ChevronDown, Copy } from 'lucide-react';
import { useToast } from '../../design-system/index.js';
import { useWallet, useNetwork, useActiveWallet } from '../../hooks/index.js';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { lock, isLocked } = useWallet();
  const { supportedNetworks, activeChainId } = useNetwork();
  const activeWallet = useActiveWallet();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const activeNetwork = supportedNetworks.find((n) => n.chainId === activeChainId);
  const routeName = location.pathname.split('/')[1] || 'dashboard';
  const pageTitle = routeName.charAt(0).toUpperCase() + routeName.slice(1);

  const cycleTheme = () => {
    let next: 'light' | 'dark' | 'system' = 'dark';
    if (theme === 'dark') next = 'light';
    else if (theme === 'light') next = 'system';
    setTheme(next);
    showToast({ title: `Appearance changed to ${next}`, type: 'info' });
  };

  const shortenAddress = (addr?: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (!activeWallet?.address) return;
    try {
      await navigator.clipboard.writeText(activeWallet.address);
      showToast({ title: 'Wallet address copied', type: 'success' });
    } catch (e) {
      showToast({ title: 'Unable to copy address. Please try again.', type: 'error' });
    }
  };

  return (
    <header className={styles.header}>
      {/* Mobile Only: Brand Logo */}
      <div
        className={styles.mobileBrand}
        onClick={() => navigate('/dashboard')}
        style={{ cursor: 'pointer' }}
      >
        <div className={styles.mobileLogo}>
          <img
            src="/logo.png"
            alt="VaultX Logo"
            style={{ width: '150%', height: '150%', objectFit: 'contain' }}
          />
        </div>
        <span className={styles.mobileBrandName}>VaultX</span>
      </div>

      <div className={styles.left}>
        <div className={styles.breadcrumbs}>
          <span
            className={styles.crumb}
            onClick={() => navigate('/dashboard')}
            style={{ cursor: 'pointer' }}
          >
            VaultX
          </span>
          <span className={styles.separator}>/</span>
          <span className={styles.crumbActive}>{pageTitle}</span>
        </div>
      </div>

      <div className={styles.right}>
        {activeNetwork && (
          <div
            className={styles.networkSelector}
            onClick={() => navigate('/networks')}
            style={{ cursor: 'pointer' }}
            title="Switch Network"
          >
            <div className={styles.indicator} />
            <span className={styles.networkName}>{activeNetwork.name}</span>
          </div>
        )}

        {!isLocked && activeWallet && (
          <div
            className={styles.accountPill}
            onClick={copyAddress}
            style={{ cursor: 'pointer' }}
            title="Copy Address"
          >
            <span>{shortenAddress(activeWallet.address)}</span>
            <Copy size={14} style={{ opacity: 0.5 }} />
          </div>
        )}

        <button
          onClick={lock}
          className={styles.iconBtn}
          aria-label="Lock Vault"
          title="Lock Vault"
        >
          <LockIcon size={18} />
        </button>
        <button onClick={cycleTheme} className={styles.iconBtn} aria-label="Toggle theme">
          {theme === 'dark' ? (
            <Moon size={18} />
          ) : theme === 'light' ? (
            <Sun size={18} />
          ) : (
            <Monitor size={18} />
          )}
        </button>
      </div>
    </header>
  );
};
