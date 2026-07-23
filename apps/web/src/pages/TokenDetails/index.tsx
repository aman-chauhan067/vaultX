import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageLayout } from '../../layout/index.js';
import { Card, Button, Badge, GlassCard, EmptyState } from '../../design-system/index.js';
import { usePortfolio, useNetwork, useActiveWallet } from '../../hooks/index.js';
import { BackButton } from '../../components/index.js';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Send,
  Coins,
  Globe,
  Hash,
  ShieldQuestion
} from 'lucide-react';

export default function TokenDetails() {
  const { address } = useParams();
  const navigate = useNavigate();
  const { portfolio } = usePortfolio();
  const { activeChainId, supportedNetworks } = useNetwork();
  const activeNetwork = supportedNetworks.find((n) => n.chainId === activeChainId);
  const activeWallet = useActiveWallet();
  const [copied, setCopied] = React.useState(false);

  const isNative = address === 'native';

  const token = useMemo(() => {
    if (isNative) {
      return {
        name: activeNetwork?.currency.name || 'Ethereum',
        symbol: activeNetwork?.currency.symbol || 'ETH',
        decimals: activeNetwork?.currency.decimals || 18,
        address: 'Native Asset',
        balance: portfolio?.ethBalance || '0',
        formattedBalance: portfolio?.formattedEthBalance || '0.0',
        verified: true
      };
    }
    return portfolio?.tokens.find((t) => t.address.toLowerCase() === address?.toLowerCase());
  }, [address, portfolio, isNative, activeNetwork]);

  if (!token) {
    return (
      <PageLayout title="Token Details">
        <EmptyState
          icon={<ShieldQuestion size={40} />}
          title="Token not found"
          description="We couldn't find this token in your portfolio."
          action={<Button onClick={() => navigate('/portfolio')}>Back to Portfolio</Button>}
        />
      </PageLayout>
    );
  }

  const handleCopy = () => {
    if (isNative) return;
    navigator.clipboard.writeText(token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const explorerUrl = activeNetwork?.explorer
    ? isNative
      ? `${activeNetwork.explorer}/address/${activeWallet?.address}`
      : `${activeNetwork.explorer}/token/${token.address}`
    : null;

  return (
    <PageLayout
      title={`${token.symbol} Details`}
      action={<BackButton onClick={() => navigate('/portfolio')} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <GlassCard
          padding="lg"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'var(--color-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Coins size={24} color="var(--color-text-secondary)" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 'var(--text-h3)',
                    fontWeight: 'var(--font-weight-bold)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                  }}
                >
                  {token.name}
                  {token.verified && <Badge variant="brand">Verified</Badge>}
                </div>
                <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
                  {activeNetwork?.name}
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => navigate(`/send?token=${isNative ? 'native' : token.address}`)}
            >
              <Send size={16} style={{ marginRight: 'var(--space-2)' }} />
              Send
            </Button>
          </div>

          <div style={{ padding: 'var(--space-4) 0' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
              style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}
            >
              <span
                style={{
                  fontSize: '4rem',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-primary)'
                }}
              >
                {token.formattedBalance}
              </span>
              <span style={{ fontSize: 'var(--text-h2)', color: 'var(--color-text-muted)' }}>
                {token.symbol}
              </span>
            </motion.div>
          </div>
        </GlassCard>

        <h3
          style={{
            fontSize: 'var(--text-h4)',
            margin: '0',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)'
          }}
        >
          Token Information
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Card
            padding="md"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Globe size={20} color="var(--color-text-secondary)" />
              <span style={{ color: 'var(--color-text-secondary)' }}>Network</span>
            </div>
            <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{activeNetwork?.name}</span>
          </Card>

          <Card
            padding="md"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Hash size={20} color="var(--color-text-secondary)" />
              <span style={{ color: 'var(--color-text-secondary)' }}>Decimals</span>
            </div>
            <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{token.decimals}</span>
          </Card>

          <Card
            padding="md"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Coins size={20} color="var(--color-text-secondary)" />
              <span style={{ color: 'var(--color-text-secondary)' }}>Raw Balance</span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
                maxWidth: '50%',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {token.balance}
            </span>
          </Card>

          {!isNative && (
            <Card
              padding="md"
              interactive
              onClick={handleCopy}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'copy'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Copy size={20} color="var(--color-text-secondary)" />
                <span style={{ color: 'var(--color-text-secondary)' }}>Contract Address</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}
                >
                  {token.address.slice(0, 10)}...{token.address.slice(-8)}
                </span>
                {copied ? (
                  <Check size={16} color="var(--color-success)" />
                ) : (
                  <Copy size={16} color="var(--color-text-muted)" />
                )}
              </div>
            </Card>
          )}

          {explorerUrl && (
            <Card
              padding="md"
              interactive
              onClick={() => window.open(explorerUrl, '_blank')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <ExternalLink size={20} color="var(--color-text-secondary)" />
                <span style={{ color: 'var(--color-text-secondary)' }}>Explorer</span>
              </div>
              <div
                style={{
                  color: 'var(--color-accent-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)'
                }}
              >
                View on Explorer <ArrowUpRight size={16} />
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

const ArrowUpRight = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7 7 17 7 17 17"></polyline>
  </svg>
);
