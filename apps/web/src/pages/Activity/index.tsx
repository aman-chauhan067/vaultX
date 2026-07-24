import React, { useState } from 'react';
import { BackButton } from '../../components/index.js';
import { useTransactions, useNetwork, usePortfolio, useActiveWallet } from '../../hooks/index.js';
import { VaultXService } from '../../services/VaultXService.js';
import { formatUnits, formatEther } from '@vaultx/network-engine';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Activity() {
  const { t } = useTranslation();
  const { history, pendingTransactions } = useTransactions();
  const { activeChainId, supportedNetworks } = useNetwork();
  const activeNetwork = supportedNetworks.find((n) => n.chainId === activeChainId);
  const { portfolio } = usePortfolio();
  const activeWallet = useActiveWallet();
  const navigate = useNavigate();

  const [filterMode, setFilterMode] = useState<'current' | 'all'>('current');

  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal: string) => {
    const num = parseFloat(bal);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 18 });
  };

  const filteredPending =
    filterMode === 'current'
      ? pendingTransactions.filter((tx) => tx.request.chainId === activeChainId)
      : pendingTransactions;

  const filteredHistory =
    filterMode === 'current'
      ? history.filter((tx) => tx.request.chainId === activeChainId)
      : history;

  const allEmpty = filteredPending.length === 0 && filteredHistory.length === 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        padding: '0 5vw',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2rem 0',
          borderBottom: '1px solid var(--glass-border-light)'
        }}
      >
        <BackButton />
        <span
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-text-secondary)'
          }}
        >
          {t('activity.title')}
        </span>
      </motion.div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '6vh' }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '4rem',
            flexWrap: 'wrap',
            gap: '2rem'
          }}
        >
          <div
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: '-0.02em'
            }}
          >
            {t('activity.title')}
          </div>

          <div
            style={{
              display: 'flex',
              background: 'var(--glass-overlay-light)',
              padding: '4px',
              borderRadius: '100px',
              border: '1px solid var(--glass-border-light)'
            }}
          >
            <button
              onClick={() => setFilterMode('current')}
              style={{
                padding: '8px 16px',
                borderRadius: '100px',
                background: filterMode === 'current' ? 'var(--color-text-primary)' : 'transparent',
                color:
                  filterMode === 'current'
                    ? 'var(--color-bg-primary)'
                    : 'var(--color-text-secondary)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 500,
                transition: 'all 0.3s ease'
              }}
            >
              Current Network
            </button>
            <button
              onClick={() => setFilterMode('all')}
              style={{
                padding: '8px 16px',
                borderRadius: '100px',
                background: filterMode === 'all' ? 'var(--color-text-primary)' : 'transparent',
                color:
                  filterMode === 'all' ? 'var(--color-bg-primary)' : 'var(--color-text-secondary)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 500,
                transition: 'all 0.3s ease'
              }}
            >
              All Networks
            </button>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ display: 'flex', flexDirection: 'column', paddingBottom: '10vh' }}
        >
          {allEmpty ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem',
                padding: '8vh 0',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '4rem', opacity: 0.2 }}>◎</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 400,
                    color: 'var(--color-text-primary)'
                  }}
                >
                  No activity found
                </span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                    maxWidth: '320px'
                  }}
                >
                  {filterMode === 'current'
                    ? `You have no recent transactions on ${activeNetwork?.name}.`
                    : 'Once you send or receive your first transaction, it will appear here.'}
                </span>
              </div>
              <div
                onClick={() => navigate('/send')}
                style={{
                  padding: '0.875rem 2rem',
                  borderRadius: '100px',
                  backgroundColor: 'var(--color-text-primary)',
                  color: 'var(--color-bg-primary)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                  transition: 'transform 0.3s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                Send your first transaction
              </div>
            </motion.div>
          ) : (
            <>
              {filteredPending.map((tx, i) => {
                const txChainId = tx.request.chainId;
                const txNetwork =
                  supportedNetworks.find((n) => n.chainId === txChainId) || activeNetwork;
                const decoded = VaultXService.getInstance().assetManager.parseTransferData(
                  tx.request.data || '0x'
                );
                const isERC20 = decoded !== null;
                const tokenInfo = isERC20
                  ? portfolio?.tokens.find(
                      (t) => t.address.toLowerCase() === tx.request.to?.toLowerCase()
                    )
                  : null;
                const symbol = isERC20
                  ? tokenInfo?.symbol || 'ERC20'
                  : txNetwork?.currency.symbol || 'ETH';
                const amount = isERC20
                  ? tokenInfo
                    ? formatUnits(decoded.amount, tokenInfo.decimals)
                    : decoded.amount
                  : tx.request.value
                    ? formatBalance(formatEther(tx.request.value))
                    : '0.0';

                return (
                  <motion.div
                    key={`pending-${tx.hash || i}`}
                    variants={itemVariants}
                    onClick={() => {
                      if (tx.hash && txNetwork?.explorer) {
                        window.open(`${txNetwork.explorer}/tx/${tx.hash}`, '_blank');
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2rem 1.5rem',
                      margin: '0 -1.5rem',
                      borderRadius: '16px',
                      borderBottom: '1px solid var(--glass-border-light)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'var(--glass-border-light)';
                    }}
                  >
                    <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: '2rem' }}>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--color-warning)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          width: '100px'
                        }}
                      >
                        Pending
                      </span>
                      <span style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 300 }}>
                        Sending {symbol}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '0.5rem'
                      }}
                    >
                      <span style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 300 }}>
                        {amount}
                      </span>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--color-text-secondary)',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        To: {shortenAddress(isERC20 ? decoded.to : tx.request.to || '')}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {filteredHistory.map((tx, i) => {
                const txChainId = tx.request.chainId;
                const txNetwork =
                  supportedNetworks.find((n) => n.chainId === txChainId) || activeNetwork;
                const decoded = VaultXService.getInstance().assetManager.parseTransferData(
                  tx.request.data || '0x'
                );
                const isERC20 = decoded !== null;
                const tokenInfo = isERC20
                  ? portfolio?.tokens.find(
                      (t) => t.address.toLowerCase() === tx.request.to?.toLowerCase()
                    )
                  : null;
                const symbol = isERC20
                  ? tokenInfo?.symbol || 'ERC20'
                  : txNetwork?.currency.symbol || 'ETH';
                const amount = isERC20
                  ? tokenInfo
                    ? formatUnits(decoded.amount, tokenInfo.decimals)
                    : decoded.amount
                  : tx.request.value
                    ? formatBalance(formatEther(tx.request.value))
                    : '0.0';

                const isSuccess = tx.receipt?.status === 1;
                const isSend =
                  tx.request?.from?.toLowerCase() === activeWallet?.address?.toLowerCase();

                return (
                  <motion.div
                    key={`history-${tx.receipt?.transactionHash || i}`}
                    variants={itemVariants}
                    onClick={() => {
                      const txChainId = tx.request.chainId;
                      const txNetwork =
                        supportedNetworks.find((n) => n.chainId === txChainId) || activeNetwork;
                      if (tx.receipt?.transactionHash && txNetwork?.explorer) {
                        window.open(
                          `${txNetwork.explorer}/tx/${tx.receipt.transactionHash}`,
                          '_blank'
                        );
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2rem 1.5rem',
                      margin: '0 -1.5rem',
                      borderRadius: '16px',
                      borderBottom: '1px solid var(--glass-border-light)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'var(--glass-border-light)';
                    }}
                  >
                    <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: '2rem' }}>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: isSuccess ? 'var(--color-text-secondary)' : 'var(--color-danger)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          width: '100px'
                        }}
                      >
                        {isSuccess ? 'Confirmed' : 'Failed'}
                      </span>
                      <span
                        style={{
                          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                          fontWeight: 300,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem'
                        }}
                      >
                        {isSend ? 'Sent' : 'Received'} {symbol}
                        {isSend ? (
                          <ArrowUpRight size={24} color="var(--color-text-secondary)" />
                        ) : (
                          <ArrowDownLeft size={24} color="var(--color-text-secondary)" />
                        )}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '0.5rem'
                      }}
                    >
                      <span
                        style={{
                          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                          fontWeight: 300,
                          color: isSuccess
                            ? 'var(--color-text-primary)'
                            : 'var(--color-text-secondary)'
                        }}
                      >
                        {amount}
                      </span>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--color-text-secondary)',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        {shortenAddress(tx.receipt?.transactionHash || '')}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
