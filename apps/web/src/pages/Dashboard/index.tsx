import React from 'react';
import { motion } from 'framer-motion';
import { useActiveWallet, useNetwork, useTransactions, usePortfolio } from '../../hooks/index.js';
import { formatUnits, formatEther } from '@vaultx/network-engine';
import { useNetworkStats } from '../../hooks/useNetworkStats.js';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { AnimatedNumber } from '../../components/AnimatedNumber.js';
import { useTranslation } from 'react-i18next';
import { VaultXService } from '../../services/VaultXService.js';

export default function Dashboard() {
  const activeWallet = useActiveWallet();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { activeChainId, supportedNetworks } = useNetwork();
  const { history, pendingTransactions } = useTransactions();
  const { portfolio } = usePortfolio();
  const { data: stats, isLoading: isStatsLoading } = useNetworkStats(activeWallet?.address);

  const activeNetwork = supportedNetworks.find((n) => n.chainId === activeChainId);

  const allTxs = [...pendingTransactions, ...history]
    .filter((tx) => tx.request.chainId === activeChainId)
    .sort((a, b) => b.timestamp - a.timestamp);
  const recentTxs = allTxs.slice(0, 3);

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
      {/* Top Nav is handled globally by Layout/Header.tsx */}

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
                      fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                      fontWeight: 300,
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    {portfolio?.currency === 'INR' ? '₹' : '$'}
                    {portfolio?.ethPrice?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) || '0.00'}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '100px',
                      backgroundColor:
                        (portfolio?.ethPriceChange24h || 0) >= 0
                          ? 'var(--color-success-bg)'
                          : 'var(--color-danger-bg)',
                      color:
                        (portfolio?.ethPriceChange24h || 0) >= 0
                          ? 'var(--color-success)'
                          : 'var(--color-danger)',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    {(portfolio?.ethPriceChange24h || 0) >= 0 ? '▲' : '▼'}
                    {portfolio?.ethPriceChange24h
                      ? `${portfolio.ethPriceChange24h > 0 ? '+' : ''}${portfolio.ethPriceChange24h.toFixed(2)}%`
                      : '0.00%'}
                  </div>
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
                    <span style={{ color: 'var(--color-success)', marginRight: '4px' }}>●</span>
                    Last Updated:{' '}
                    {Math.max(0, Math.floor((Date.now() - portfolio.lastUpdated) / 1000))} sec ago
                  </div>
                )}
              </>
            )}

            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {activeNetwork?.isTestnet ? (
                'Market Price: Not Available'
              ) : (
                <>
                  <span style={{ color: 'var(--color-success)', marginRight: '4px' }}>●</span>
                  {portfolio?.lastUpdated && (
                    <span>
                      Last Updated:{' '}
                      {Math.max(0, Math.floor((Date.now() - portfolio.lastUpdated) / 1000))} sec ago
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

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
            <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 500 }}>Recent Transactions</h3>
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
                    No recent transactions on {activeNetwork?.name}.
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
                  : activeNetwork?.currency.symbol || 'ETH';

                const formatBalance = (bal: string) => {
                  const num = parseFloat(bal);
                  if (isNaN(num)) return '0.00';
                  return num.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 18
                  });
                };

                const amount = isERC20
                  ? tokenInfo
                    ? formatUnits(decoded.amount, tokenInfo.decimals)
                    : decoded.amount
                  : tx.request.value
                    ? formatBalance(formatEther(tx.request.value))
                    : '0.0';

                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (tx.hash && activeNetwork?.explorer) {
                        window.open(`${activeNetwork.explorer}/tx/${tx.hash}`, '_blank');
                      } else if (tx.receipt?.transactionHash && activeNetwork?.explorer) {
                        window.open(
                          `${activeNetwork.explorer}/tx/${tx.receipt.transactionHash}`,
                          '_blank'
                        );
                      }
                    }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1.5rem 1.5rem',
                      margin: '0 -1.5rem',
                      borderBottom: '1px solid var(--glass-border-light)',
                      borderRadius: '16px',
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
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1 }}>
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
                      <span
                        style={{
                          fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
                          fontWeight: 300,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        {isSend ? 'Sent' : 'Received'} {symbol}
                        {isSend ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '0.25rem'
                      }}
                    >
                      <span style={{ fontSize: 'clamp(1.1rem, 2vw, 1.25rem)', fontWeight: 400 }}>
                        {amount}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          color: 'var(--color-text-muted)'
                        }}
                      >
                        {tx.hash
                          ? `${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}`
                          : tx.receipt?.transactionHash
                            ? `${tx.receipt.transactionHash.slice(0, 10)}...${tx.receipt.transactionHash.slice(-8)}`
                            : ''}
                      </span>
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
