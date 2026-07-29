import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageLayout } from '../../layout/index.js';
import {
  Card,
  Button,
  Badge,
  Skeleton,
  Tabs,
  SearchBar,
  GlassCard,
  EmptyState
} from '../../design-system/index.js';
import {
  usePortfolio,
  useNFTs,
  useNetworkStats,
  useActiveWallet,
  useNetwork
} from '../../hooks/index.js';
import { RefreshCw, ArrowRight, Coins, Image as ImageIcon, SearchX } from 'lucide-react';

export default function Portfolio() {
  const navigate = useNavigate();
  const activeWallet = useActiveWallet();
  const { activeChainId, supportedNetworks } = useNetwork();
  const { data: stats, isLoading: isStatsLoading } = useNetworkStats(activeWallet?.address);
  const {
    portfolio,
    isLoading: isPortfolioLoading,
    error: portfolioError,
    refreshPortfolio
  } = usePortfolio();

  const {
    collections,
    searchQuery: nftSearchQuery,
    setSearchQuery: setNftSearchQuery,
    isLoading: isNftLoading,
    error: nftError,
    refreshNFTs,
    loadMore,
    hasMore
  } = useNFTs();

  const [tokenSearchQuery, setTokenSearchQuery] = useState('');
  const activeNetwork = supportedNetworks.find((n) => n.chainId === activeChainId);

  const formatBalance = (bal: string) => {
    const num = parseFloat(bal);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  };

  const filteredTokens = useMemo(() => {
    if (!portfolio) return [];
    if (!tokenSearchQuery)
      return portfolio.tokens.sort(
        (a, b) => Number(b.formattedBalance) - Number(a.formattedBalance)
      );

    const lowerQ = tokenSearchQuery.toLowerCase();
    return portfolio.tokens
      .filter(
        (t) =>
          t.name.toLowerCase().includes(lowerQ) ||
          t.symbol.toLowerCase().includes(lowerQ) ||
          t.address.toLowerCase().includes(lowerQ)
      )
      .sort((a, b) => Number(b.formattedBalance) - Number(a.formattedBalance));
  }, [portfolio, tokenSearchQuery]);

  const handleRefresh = (isNft: boolean) => {
    if (!isNft) {
      refreshPortfolio();
    } else {
      refreshNFTs();
    }
  };

  const TokenTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
    >
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <SearchBar
          placeholder="Search tokens..."
          value={tokenSearchQuery}
          onChange={(e) => setTokenSearchQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <Button
          variant="outline"
          onClick={() => handleRefresh(false)}
          disabled={isPortfolioLoading}
          aria-label="Refresh Tokens"
        >
          <RefreshCw
            size={18}
            style={{ animation: isPortfolioLoading ? 'spin 1s linear infinite' : 'none' }}
          />
        </Button>
      </div>

      {portfolioError && (
        <Badge variant="error" style={{ padding: 'var(--space-3)' }}>
          Error: {portfolioError}
        </Badge>
      )}

      {isPortfolioLoading && !portfolio ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              width="100%"
              height={72}
              style={{ borderRadius: 'var(--radius-lg)' }}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Native Token Card */}
          <Card
            padding="md"
            interactive
            onClick={() => navigate('/token/native')}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}
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
              <Coins size={20} color="var(--color-text-secondary)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
                {activeNetwork?.name || 'Ethereum'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {activeNetwork?.currency.symbol || 'ETH'}
              </div>
            </div>
            <div
              style={{
                textAlign: 'right',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)'
              }}
            >
              <div>
                <div
                  style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}
                >
                  {isStatsLoading ? '---' : formatBalance(stats?.balance || '0')}
                </div>
              </div>
              <ArrowRight size={18} color="var(--color-text-muted)" />
            </div>
          </Card>

          {/* ERC20 Tokens */}
          {filteredTokens.map((token) => (
            <Card
              key={token.address}
              padding="md"
              interactive
              onClick={() => navigate(`/token/${token.address}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}
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
                <Coins size={20} color="var(--color-text-secondary)" />
              </div>
              <div
                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: 'var(--text-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)'
                    }}
                  >
                    {token.name}
                    {token.verified && <Badge variant="brand">Verified</Badge>}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {token.symbol}
                  </div>
                </div>
              </div>
              <div
                style={{
                  textAlign: 'right',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)'
                }}
              >
                <div>
                  <div
                    style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}
                  >
                    {Number(token.formattedBalance) > 0
                      ? formatBalance(token.formattedBalance)
                      : '0.00'}
                  </div>
                </div>
                <ArrowRight size={18} color="var(--color-text-muted)" />
              </div>
            </Card>
          ))}

          {filteredTokens.length === 0 && portfolio?.tokens.length !== 0 && (
            <EmptyState
              icon={<SearchX size={32} />}
              title="No tokens found"
              description="No tokens match your search criteria."
            />
          )}
        </div>
      )}
    </motion.div>
  );

  const sortedCollections = useMemo(() => {
    return [...collections];
  }, [collections]);

  const NFTTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
    >
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <SearchBar
          placeholder="Search NFTs..."
          value={nftSearchQuery}
          onChange={(e) => setNftSearchQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <Button
          variant="outline"
          onClick={() => handleRefresh(true)}
          disabled={isNftLoading}
          aria-label="Refresh NFTs"
        >
          <RefreshCw
            size={18}
            style={{ animation: isNftLoading ? 'spin 1s linear infinite' : 'none' }}
          />
        </Button>
      </div>

      {nftError && (
        <Badge variant="error" style={{ padding: 'var(--space-3)' }}>
          Error: {nftError}
        </Badge>
      )}

      {isNftLoading && sortedCollections.length === 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 'var(--space-3)'
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              width="100%"
              height={180}
              style={{ borderRadius: 'var(--radius-lg)' }}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {sortedCollections.map((col) => (
            <div
              key={col.contractAddress}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <h3
                  style={{
                    fontSize: 'var(--text-lg)',
                    margin: 0,
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  {col.name}
                </h3>
                <Badge variant="neutral">{col.nfts.length}</Badge>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: 'var(--space-3)'
                }}
              >
                {col.nfts.map((nft) => (
                  <GlassCard
                    key={`${nft.contractAddress}-${nft.tokenId}`}
                    interactive
                    padding="none"
                    onClick={() =>
                      navigate(`/nft/${nft.chainId}/${nft.contractAddress}/${nft.tokenId}`)
                    }
                    style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1',
                        background: 'var(--color-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {nft.image ? (
                        <img
                          src={nft.image}
                          alt={nft.name}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.removeAttribute(
                              'style'
                            );
                          }}
                        />
                      ) : null}
                      <div
                        style={{
                          display: nft.image ? 'none' : 'flex',
                          color: 'var(--color-text-muted)'
                        }}
                      >
                        <ImageIcon size={32} />
                      </div>
                    </div>
                    <div
                      style={{
                        padding: 'var(--space-2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-1)'
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 'var(--font-weight-medium)',
                          fontSize: 'var(--text-xs)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {nft.name}
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span
                          style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-secondary)'
                          }}
                        >
                          #{nft.tokenId}
                        </span>
                        {nft.balance && nft.standard === 'ERC1155' && (
                          <Badge variant="brand">x{nft.balance}</Badge>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          ))}

          {sortedCollections.length === 0 && (
            <EmptyState
              icon={<ImageIcon size={32} />}
              title="No NFTs found"
              description="Your NFT collection will appear here."
            />
          )}

          {hasMore && (
            <Button variant="outline" fullWidth onClick={loadMore}>
              Load More
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );

  return (
    <PageLayout title="Portfolio" description="Manage your assets">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div
          style={{
            padding: 'var(--space-8) 0 var(--space-4) 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)'
          }}
        >
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '18px' }}>Net Worth</span>
          <div
            style={{
              fontSize: 'clamp(56px, 8vw, 80px)',
              fontWeight: 'var(--font-weight-bold)',
              letterSpacing: '-0.04em',
              lineHeight: 1
            }}
          >
            {portfolio?.totalAssetsValueFiat
              ? `$${portfolio.totalAssetsValueFiat.toFixed(2)}`
              : '$0.00'}
          </div>
        </div>

        <Tabs
          tabs={[
            { id: 'tokens', label: 'Tokens', content: <TokenTab /> },
            { id: 'nfts', label: 'NFTs', content: <NFTTab /> }
          ]}
        />
      </div>
    </PageLayout>
  );
}
