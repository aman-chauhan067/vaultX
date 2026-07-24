import React from 'react';
import { motion } from 'framer-motion';
import { useActiveWallet, useNetwork, useTransactions, usePortfolio } from '../../hooks/index.js';
import { formatUnits } from '@vaultx/network-engine';
import { useNetworkStats } from '../../hooks/useNetworkStats.js';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { AnimatedNumber } from '../../components/AnimatedNumber.js';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const activeWallet = useActiveWallet();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { activeChainId, supportedNetworks } = useNetwork();
  const { history, pendingTransactions } = useTransactions();
  const { portfolio } = usePortfolio();
  const { data: stats, isLoading: isStatsLoading } = useNetworkStats(activeWallet?.address);

  const activeNetwork = supportedNetworks.find((n) => n.chainId === activeChainId);

  const formatBalance = (bal: string) => {
    const num = parseFloat(bal);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  };

  const recentTxs = [...pendingTransactions, ...history].slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
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
      {/* Top Nav - Level 4 Metadata */}
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
        <div
          style={{
            fontFamily: 'var(--font-brand)',
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}
        >
          V.X
        </div>
        <div
          style={{
            display: 'flex',
            gap: '2rem',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-text-muted)'
          }}
        >
          <span
            onClick={() => navigate('/networks')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              transition: 'color 0.3s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            {activeNetwork?.name || t('dashboard.unknown_network')} <ArrowUpRight size={12} />
          </span>
          <span
            onClick={() => navigate('/settings')}
            style={{ cursor: 'pointer', transition: 'color 0.3s' }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            {activeWallet?.address
              ? `${activeWallet.address.slice(0, 6)}...${activeWallet.address.slice(-4)}`
              : ''}
          </span>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '15vh' }}
      >
        {/* Level 1: The Balance */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <span
            style={{
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'var(--color-text-secondary)',
              marginBottom: '1rem'
            }}
          >
            {t('dashboard.total_balance')}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
            <span
              style={{
                fontSize: 'clamp(2.5rem, 10vw, 6rem)',
                fontWeight: 300,
                lineHeight: 0.9,
                letterSpacing: '-0.04em'
              }}
            >
              {isStatsLoading ? (
                '---'
              ) : (
                <AnimatedNumber
                  value={parseFloat(stats?.balance || '0')}
                  minDecimals={2}
                  maxDecimals={6}
                />
              )}
            </span>
            <span
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                fontWeight: 300,
                color: 'var(--color-text-secondary)'
              }}
            >
              {activeNetwork?.currency.symbol || 'ETH'}
            </span>
          </div>

          {/* Enhanced Market Information */}
          <div
            style={{
              marginTop: '2.5rem',
              padding: '1.5rem 2.5rem',
              borderRadius: '16px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--glass-border-light)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: '280px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                color: 'var(--color-text-muted)',
                fontWeight: 500
              }}
            >
              <span>{activeNetwork?.name || 'Unknown'}</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>•</span>
              <span>{activeNetwork?.currency.symbol || 'ETH'}</span>
            </div>

            {activeNetwork?.isTestnet ? (
              <>
                <div
                  style={{
                    fontSize: '1.25rem',
                    color: 'var(--color-text-primary)',
                    marginTop: '0.25rem'
                  }}
                >
                  Test Network
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                    marginTop: '0.5rem'
                  }}
                >
                  Market Price: Not Available
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginTop: '0.25rem'
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 300,
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    {portfolio?.currency === 'INR' ? '₹' : '$'}
                    {portfolio?.ethPrice?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) || '---'}
                  </span>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color:
                        (portfolio?.ethPriceChange24h || 0) >= 0
                          ? 'var(--color-success)'
                          : 'var(--color-danger)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      backgroundColor:
                        (portfolio?.ethPriceChange24h || 0) >= 0
                          ? 'var(--color-success-bg)'
                          : 'var(--color-danger-bg)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px'
                    }}
                  >
                    {(portfolio?.ethPriceChange24h || 0) >= 0 ? '▲' : '▼'}
                    {portfolio?.ethPriceChange24h
                      ? `${portfolio.ethPriceChange24h > 0 ? '+' : ''}${portfolio.ethPriceChange24h.toFixed(2)}%`
                      : '0.00%'}
                  </span>
                </div>
                {portfolio?.lastUpdated && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-secondary)',
                      marginTop: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-success)'
                      }}
                    />
                    Last Updated:{' '}
                    {Math.max(0, Math.floor((Date.now() - portfolio.lastUpdated) / 1000))} sec ago
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* Level 2: Quick Actions */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '4rem'
          }}
        >
          <div
            onClick={() => navigate('/send')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2rem',
              borderRadius: '100px',
              backgroundColor: 'var(--color-text-primary)',
              color: 'var(--color-bg-primary)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
              transition: 'transform 0.3s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            Send <ArrowUpRight size={16} />
          </div>
          <div
            onClick={() => navigate('/receive')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2rem',
              borderRadius: '100px',
              backgroundColor: 'var(--color-border-secondary)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
              transition: 'background 0.3s'
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--color-border-primary)')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--color-border-secondary)')
            }
          >
            Receive <ArrowDownLeft size={16} />
          </div>
        </motion.div>

        {/* Level 3: Recent Activity (Raw Information, No Containers) */}
        <motion.div
          variants={itemVariants}
          style={{ marginTop: 'auto', paddingBottom: '4rem', paddingTop: '10vh' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderBottom: '1px solid var(--glass-border)',
              paddingBottom: '1rem',
              marginBottom: '2rem'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 500 }}>
              {t('dashboard.portfolio')}
            </h3>
            <span
              onClick={() => navigate('/activity')}
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-text-muted)',
                cursor: 'pointer'
              }}
            >
              View All
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentTxs.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1.5rem',
                  padding: '4vh 0',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '3rem', opacity: 0.15 }}>◎</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-secondary)',
                      marginTop: '0.5rem',
                      display: 'flex',
                      textAlign: 'center',
                      padding: '2rem 0'
                    }}
                  >
                    {t('dashboard.no_transactions')}
                  </div>
                </div>
                <span
                  onClick={() => navigate('/send')}
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    paddingBottom: '2px'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                >
                  Send a transaction →
                </span>
              </div>
            ) : (
              recentTxs.map((_tx, i) => {
                const tx = _tx as any;
                const isPending = !tx.receipt;
                const statusColor = isPending
                  ? 'var(--color-warning)'
                  : tx.receipt?.status === 1
                    ? 'var(--color-text-primary)'
                    : 'var(--color-danger)';
                const isSend =
                  tx.request?.from?.toLowerCase() === activeWallet?.address?.toLowerCase();

                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1.5rem 0',
                      borderBottom: '1px solid var(--glass-border-light)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          color: statusColor,
                          width: '80px'
                        }}
                      >
                        {isPending ? 'Pending' : tx.receipt?.status === 1 ? 'Confirmed' : 'Failed'}
                      </span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 300 }}>
                        {isSend ? 'Sent' : 'Received'} {activeNetwork?.currency.symbol}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.875rem',
                        color: 'var(--color-text-muted)'
                      }}
                    >
                      {tx.hash
                        ? `${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}`
                        : tx.receipt?.transactionHash
                          ? `${tx.receipt.transactionHash.slice(0, 10)}...${tx.receipt.transactionHash.slice(-8)}`
                          : ''}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
