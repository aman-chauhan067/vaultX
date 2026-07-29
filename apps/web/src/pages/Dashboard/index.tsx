import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PageLayout } from '../../layout/index.js';
import { EmptyState, Button, Badge, Card } from '../../design-system/index.js';
import { useActiveWallet, useNetwork, useTransactions, usePortfolio } from '../../hooks/index.js';
import { VaultXService } from '../../services/VaultXService.js';
import { formatUnits } from '@vaultx/network-engine';
import { useNetworkStats } from '../../hooks/useNetworkStats.js';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Activity as ActivityIcon,
  RefreshCw,
  Coins,
  Image as ImageIcon
} from 'lucide-react';

export default function Dashboard() {
  const activeWallet = useActiveWallet();
  const navigate = useNavigate();
  const { activeChainId, supportedNetworks } = useNetwork();
  const { history, pendingTransactions } = useTransactions();
  const { portfolio, refreshPortfolio, isLoading: isPortfolioLoading } = usePortfolio();
  const { data: stats, isLoading: isStatsLoading } = useNetworkStats(activeWallet?.address);
  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts' | 'activity'>('tokens');

  const activeNetwork = supportedNetworks.find((n) => n.chainId === activeChainId);

  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal: string) => {
    const num = parseFloat(bal);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  };

  // Truncate to top 3 for dashboard
  const recentHistory = history.slice(0, 3);
  const recentPending = pendingTransactions.slice(0, 3);

  return (
    <PageLayout title="Overview" description="Your web3 command center.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* 1. Portfolio & Balance (Hero Section) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
            alignItems: 'center',
            textAlign: 'center',
            paddingTop: 'var(--space-4)'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              alignItems: 'center'
            }}
          >
            <span
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}
            >
              Total Balance
              <Button
                size="sm"
                variant="ghost"
                onClick={() => refreshPortfolio()}
                disabled={isPortfolioLoading || isStatsLoading}
              >
                <RefreshCw
                  size={14}
                  style={{
                    animation:
                      isPortfolioLoading || isStatsLoading ? 'spin 1s linear infinite' : 'none'
                  }}
                />
              </Button>
            </span>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                fontSize: 'clamp(56px, 8vw, 80px)',
                fontWeight: 'var(--font-weight-bold)',
                display: 'flex',
                alignItems: 'baseline',
                gap: 'var(--space-2)',
                letterSpacing: '-0.04em'
              }}
            >
              {isStatsLoading ? '---' : formatBalance(stats?.balance || '0')}
              <span
                style={{
                  fontSize: 'var(--text-2xl)',
                  color: 'var(--color-text-muted)',
                  fontWeight: 'var(--font-weight-medium)',
                  letterSpacing: 'normal'
                }}
              >
                {activeNetwork?.currency.symbol || 'ETH'}
              </span>
            </motion.div>
          </div>

          {/* 2. Quick Actions */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-4)',
              width: '100%',
              maxWidth: '360px',
              margin: '0 auto'
            }}
          >
            <Button
              variant="primary"
              fullWidth
              leftIcon={<ArrowUpRight size={18} />}
              onClick={() => navigate('/send')}
            >
              Send
            </Button>
            <Button
              variant="secondary"
              fullWidth
              leftIcon={<ArrowDownLeft size={18} />}
              onClick={() => navigate('/receive')}
            >
              Receive
            </Button>
          </div>
        </div>

        {/* 3. Tabs (Tokens, NFTs, Activity) */}
        <div style={{ marginTop: 'var(--space-2)' }}>
          <div
            style={{
              display: 'flex',
              borderBottom: 'var(--border-width-sm) solid var(--color-border-primary)',
              marginBottom: 'var(--space-4)'
            }}
          >
            <div
              onClick={() => setActiveTab('tokens')}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                cursor: 'pointer',
                borderBottom:
                  activeTab === 'tokens'
                    ? '2px solid var(--color-brand-primary)'
                    : '2px solid transparent',
                color:
                  activeTab === 'tokens'
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-secondary)',
                fontWeight: activeTab === 'tokens' ? 'var(--font-weight-medium)' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              Tokens
            </div>
            <div
              onClick={() => setActiveTab('nfts')}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                cursor: 'pointer',
                borderBottom:
                  activeTab === 'nfts'
                    ? '2px solid var(--color-brand-primary)'
                    : '2px solid transparent',
                color:
                  activeTab === 'nfts'
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-secondary)',
                fontWeight: activeTab === 'nfts' ? 'var(--font-weight-medium)' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              NFTs
            </div>
            <div
              onClick={() => setActiveTab('activity')}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                cursor: 'pointer',
                borderBottom:
                  activeTab === 'activity'
                    ? '2px solid var(--color-brand-primary)'
                    : '2px solid transparent',
                color:
                  activeTab === 'activity'
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-secondary)',
                fontWeight: activeTab === 'activity' ? 'var(--font-weight-medium)' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              Activity
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {activeTab === 'tokens' && (
              <>
                {!portfolio || portfolio.tokens.length === 0 ? (
                  <EmptyState
                    icon={<Coins size={32} />}
                    title="No tokens found"
                    description="You don't have any ERC20 tokens yet."
                  />
                ) : (
                  portfolio.tokens.map((token, i) => (
                    <Card
                      key={i}
                      padding="md"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--radius-pill)',
                            background: 'var(--color-surface-hover)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          🪙
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: 'var(--font-weight-medium)',
                              fontSize: 'var(--text-sm)'
                            }}
                          >
                            {token.name}
                          </div>
                          <div
                            style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
                          >
                            {token.symbol}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontWeight: 'var(--font-weight-medium)',
                          fontSize: 'var(--text-sm)'
                        }}
                      >
                        {formatBalance(formatUnits(token.balance, token.decimals))}
                      </div>
                    </Card>
                  ))
                )}
              </>
            )}

            {activeTab === 'nfts' && (
              <EmptyState
                icon={<ImageIcon size={32} />}
                title="No NFTs found"
                description="Your NFT collection will appear here."
              />
            )}

            {activeTab === 'activity' && (
              <>
                {recentPending.length === 0 && recentHistory.length === 0 ? (
                  <EmptyState
                    icon={<ActivityIcon size={32} />}
                    title="No recent transactions"
                    description="Your transaction history will appear here once you send or receive tokens."
                  />
                ) : (
                  <>
                    {recentPending.map((tx, i) => {
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
                      const amount = isERC20
                        ? tokenInfo
                          ? formatUnits(decoded.amount, tokenInfo.decimals)
                          : decoded.amount
                        : tx.request.value
                          ? formatBalance(tx.request.value.toString())
                          : '0.0';

                      return (
                        <Card
                          key={`pending-${i}`}
                          padding="md"
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div
                            style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}
                          >
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 'var(--radius-pill)',
                                background: 'var(--color-warning-bg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-warning)'
                              }}
                            >
                              <RefreshCw
                                size={18}
                                style={{ animation: 'spin 1s linear infinite' }}
                              />
                            </div>
                            <div>
                              <div
                                style={{
                                  fontWeight: 'var(--font-weight-medium)',
                                  fontSize: 'var(--text-sm)'
                                }}
                              >
                                {isERC20 ? `Sending ${symbol}` : 'Sending'}
                              </div>
                              <div
                                style={{
                                  fontSize: 'var(--text-xs)',
                                  color: 'var(--color-text-muted)'
                                }}
                              >
                                {shortenAddress(tx.hash)}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div
                              style={{
                                fontWeight: 'var(--font-weight-medium)',
                                fontSize: 'var(--text-sm)'
                              }}
                            >
                              {amount}{' '}
                              <span style={{ color: 'var(--color-text-muted)' }}>{symbol}</span>
                            </div>
                            <Badge variant="warning">Pending</Badge>
                          </div>
                        </Card>
                      );
                    })}
                    {recentHistory.map((tx, i) => {
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
                      const amount = isERC20
                        ? tokenInfo
                          ? formatUnits(decoded.amount, tokenInfo.decimals)
                          : decoded.amount
                        : tx.request.value
                          ? formatBalance(tx.request.value.toString())
                          : '0.0';

                      return (
                        <Card
                          key={i}
                          padding="md"
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div
                            style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}
                          >
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 'var(--radius-pill)',
                                background: 'var(--color-surface-hover)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <ArrowUpRight size={18} color="var(--color-text-secondary)" />
                            </div>
                            <div>
                              <div
                                style={{
                                  fontWeight: 'var(--font-weight-medium)',
                                  fontSize: 'var(--text-sm)'
                                }}
                              >
                                {isERC20 ? `Sent ${symbol}` : 'Sent'}
                              </div>
                              <div
                                style={{
                                  fontSize: 'var(--text-xs)',
                                  color: 'var(--color-text-muted)'
                                }}
                              >
                                {shortenAddress(tx.receipt.transactionHash)}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div
                              style={{
                                fontWeight: 'var(--font-weight-medium)',
                                fontSize: 'var(--text-sm)'
                              }}
                            >
                              {amount}{' '}
                              <span style={{ color: 'var(--color-text-muted)' }}>{symbol}</span>
                            </div>
                            <Badge variant={tx.receipt.status === 1 ? 'success' : 'error'}>
                              {tx.receipt.status === 1 ? 'Confirmed' : 'Failed'}
                            </Badge>
                          </div>
                        </Card>
                      );
                    })}

                    {(history.length > 3 || pendingTransactions.length > 3) && (
                      <Button
                        variant="ghost"
                        fullWidth
                        onClick={() => navigate('/activity')}
                        style={{ marginTop: 'var(--space-2)' }}
                      >
                        View All Activity
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
