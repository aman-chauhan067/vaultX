import React, { useState, useMemo } from 'react';
import { BackButton } from '../../components/index.js';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  usePortfolio,
  useNFTs,
  useNetworkStats,
  useActiveWallet,
  useNetwork
} from '../../hooks/index.js';
import { formatUnits } from '@vaultx/network-engine';
import {} from 'lucide-react';
import { AnimatedNumber } from '../../components/AnimatedNumber.js';

export default function Portfolio() {
  const navigate = useNavigate();
  const activeWallet = useActiveWallet();
  const { activeChainId, supportedNetworks } = useNetwork();
  const { data: stats, isLoading: isStatsLoading } = useNetworkStats(activeWallet?.address);
  const { portfolio } = usePortfolio();

  const { collections } = useNFTs();
  const [activeView, setActiveView] = useState<'tokens' | 'nfts'>('tokens');

  const activeNetwork = supportedNetworks.find((n) => n.chainId === activeChainId);

  const formatBalance = (bal: string) => {
    const num = parseFloat(bal);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const tokens = useMemo(() => {
    if (!portfolio) return [];
    return [...portfolio.tokens].sort(
      (a, b) => Number(b.formattedBalance) - Number(a.formattedBalance)
    );
  }, [portfolio]);

  const nftsCount = collections.reduce((acc, c) => acc + c.nfts.length, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <BackButton />
        <div
          style={{
            display: 'flex',
            gap: '2rem',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
        >
          <span
            onClick={() => setActiveView('tokens')}
            style={{
              cursor: 'pointer',
              color: activeView === 'tokens' ? '#ffffff' : '#52525b',
              transition: 'color 0.3s'
            }}
          >
            Tokens
          </span>
          <span
            onClick={() => setActiveView('nfts')}
            style={{
              cursor: 'pointer',
              color: activeView === 'nfts' ? '#ffffff' : '#52525b',
              transition: 'color 0.3s'
            }}
          >
            Collectibles
          </span>
        </div>
      </motion.div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '10vh' }}>
        {/* Level 1: Context Header (Total Value / Count) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span
            style={{
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: '#52525b',
              display: 'block',
              marginBottom: '1rem'
            }}
          >
            {activeView === 'tokens' ? 'Net Liquidity' : 'Collection Size'}
          </span>
          <div
            style={{
              fontSize: 'clamp(3rem, 8vw, 5rem)',
              fontWeight: 300,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              marginBottom: '6rem'
            }}
          >
            {activeView === 'tokens' ? (
              portfolio?.totalAssetsValueFiat ? (
                <AnimatedNumber
                  prefix="$"
                  value={portfolio.totalAssetsValueFiat}
                  minDecimals={2}
                  maxDecimals={2}
                />
              ) : (
                '$0.00'
              )
            ) : (
              <AnimatedNumber value={nftsCount} minDecimals={0} maxDecimals={0} />
            )}
          </div>
        </motion.div>

        {/* Level 2: The Data List (No Cards) */}
        {activeView === 'tokens' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {/* Native Asset */}
            <motion.div
              variants={itemVariants}
              onClick={() => navigate('/token/native')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                padding: '2rem 0',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem' }}>
                <span style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 300 }}>
                  {activeNetwork?.name || 'Ethereum'}
                </span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: '#52525b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}
                >
                  {activeNetwork?.currency.symbol || 'ETH'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 300 }}>
                  {isStatsLoading ? (
                    '---'
                  ) : (
                    <AnimatedNumber
                      value={parseFloat(stats?.balance || '0')}
                      minDecimals={2}
                      maxDecimals={4}
                    />
                  )}
                </span>
              </div>
            </motion.div>

            {/* ERC20 Assets */}
            {tokens.map((token, i) => (
              <motion.div
                key={token.address}
                variants={itemVariants}
                onClick={() => navigate(`/token/${token.address}`)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  padding: '2rem 0',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  borderBottom:
                    i === tokens.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem' }}>
                  <span style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 300 }}>
                    {token.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: '#52525b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}
                  >
                    {token.symbol}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 300 }}>
                    {Number(token.formattedBalance) > 0 ? (
                      <AnimatedNumber
                        value={parseFloat(token.formattedBalance)}
                        minDecimals={2}
                        maxDecimals={4}
                      />
                    ) : (
                      '0.00'
                    )}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeView === 'nfts' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '4rem',
              paddingBottom: '4rem'
            }}
          >
            {collections.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  gridColumn: '1 / -1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2rem',
                  padding: '8vh 0',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '4rem', opacity: 0.2 }}>◇</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <span
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 300,
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    No collectibles found
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#52525b', maxWidth: '320px' }}>
                    NFTs and collectibles held by this wallet will appear here.
                  </span>
                </div>
              </motion.div>
            ) : (
              collections.map((col) =>
                col.nfts.map((nft) => (
                  <motion.div
                    key={`${nft.contractAddress}-${nft.tokenId}`}
                    variants={itemVariants}
                    onClick={() =>
                      navigate(`/nft/${nft.chainId}/${nft.contractAddress}/${nft.tokenId}`)
                    }
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                  >
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        backgroundColor: '#18181b',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {nft.image ? (
                        <img
                          src={nft.image}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          alt={nft.name}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#52525b',
                            fontSize: '0.875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                          }}
                        >
                          No preview
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        marginTop: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline'
                      }}
                    >
                      <span style={{ fontSize: '1.25rem', fontWeight: 300 }}>{nft.name}</span>
                      <span style={{ fontSize: '0.875rem', color: '#52525b' }}>#{nft.tokenId}</span>
                    </div>
                  </motion.div>
                ))
              )
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
