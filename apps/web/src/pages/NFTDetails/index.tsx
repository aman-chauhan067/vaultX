import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../../layout/index.js';
import { Button, Badge, Skeleton, Card, GlassCard, EmptyState } from '../../design-system/index.js';
import { BackButton } from '../../components/index.js';
import { ExternalLink, Image as ImageIcon, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { VaultXService } from '../../services/VaultXService.js';
import { useActiveWallet } from '../../hooks/index.js';
import type { NFT } from '@vaultx/network-engine';

export default function NFTDetails() {
  const { chainId, contract, tokenId } = useParams<{
    chainId: string;
    contract: string;
    tokenId: string;
  }>();
  const navigate = useNavigate();
  const activeWallet = useActiveWallet();

  const [nft, setNft] = useState<NFT | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNFT() {
      if (!chainId || !contract || !tokenId || !activeWallet) return;
      setIsLoading(true);
      setError(null);
      try {
        const vaultXService = VaultXService.getInstance();
        const discovered = await vaultXService.assetManager.discoverNFT(
          contract,
          tokenId,
          parseInt(chainId, 10),
          activeWallet.address,
          true
        );
        if (discovered) {
          setNft(discovered);
        } else {
          setError('NFT not found or unsupported contract.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load NFT details.');
      } finally {
        setIsLoading(false);
      }
    }
    loadNFT();
  }, [chainId, contract, tokenId, activeWallet]);

  if (isLoading) {
    return (
      <PageLayout title="NFT Details" action={<BackButton />}>
        <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
            <Skeleton width="100%" height={500} style={{ borderRadius: 'var(--radius-xl)' }} />
          </div>
          <div
            style={{
              flex: '1 1 400px',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)'
            }}
          >
            <Skeleton width="60%" height={48} />
            <Skeleton width="100%" height={100} />
            <Skeleton width="100%" height={200} />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !nft) {
    return (
      <PageLayout title="NFT Details" action={<BackButton />}>
        <EmptyState
          icon={<ShieldAlert size={40} />}
          title="NFT Not Found"
          description={error || "We couldn't load this NFT."}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout title={nft.name || `Token #${nft.tokenId}`} action={<BackButton />}>
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-8)',
          flexWrap: 'wrap',
          alignItems: 'flex-start'
        }}
      >
        {/* Left Column: Pinterest-style Hero Artwork */}
        <div style={{ flex: '1 1 400px', position: 'sticky', top: 'var(--space-6)' }}>
          <GlassCard
            padding="none"
            style={{
              overflow: 'hidden',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border-primary)'
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-surface)',
                aspectRatio: '1'
              }}
            >
              {nft.image ? (
                <img
                  src={nft.image}
                  alt={nft.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style');
                  }}
                />
              ) : null}
              <div
                style={{
                  display: nft.image ? 'none' : 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  color: 'var(--color-text-muted)'
                }}
              >
                <ImageIcon size={64} />
                <span style={{ fontSize: 'var(--text-body)' }}>No Image Available</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Metadata */}
        <div
          style={{
            flex: '1 1 400px',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-8)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div
              style={{
                fontSize: 'var(--text-h3)',
                color: 'var(--color-accent-purple)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              {nft.collectionName}
            </div>
            <h1
              style={{
                fontSize: '3rem',
                fontWeight: 'var(--font-weight-bold)',
                lineHeight: 1.1,
                margin: 0,
                color: 'var(--color-text-primary)'
              }}
            >
              {nft.name}
            </h1>
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-2)',
                flexWrap: 'wrap',
                marginTop: 'var(--space-2)'
              }}
            >
              <Badge variant="neutral">{nft.standard}</Badge>
              {nft.balance && nft.standard === 'ERC1155' && (
                <Badge variant="brand">Owned: {nft.balance}</Badge>
              )}
              <Badge variant={nft.metadataState === 'loaded' ? 'brand' : 'warning'}>
                Metadata: {nft.metadataState}
              </Badge>
            </div>
          </div>

          {nft.description && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <h3
                style={{
                  fontSize: 'var(--text-h4)',
                  color: 'var(--color-text-primary)',
                  margin: 0
                }}
              >
                Description
              </h3>
              <p
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  fontSize: 'var(--text-body)',
                  margin: 0
                }}
              >
                {nft.description}
              </p>
            </div>
          )}

          {nft.attributes && nft.attributes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <h3
                style={{
                  fontSize: 'var(--text-h4)',
                  color: 'var(--color-text-primary)',
                  margin: 0
                }}
              >
                Properties
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: 'var(--space-3)'
                }}
              >
                {nft.attributes.map((attr, idx) => (
                  <Card
                    key={idx}
                    padding="sm"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-1)',
                      alignItems: 'center',
                      textAlign: 'center',
                      background: 'var(--color-surface-elevated)'
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'var(--text-caption)',
                        color: 'var(--color-accent-purple)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {attr.trait_type}
                    </span>
                    <span
                      style={{
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      {attr.value}
                    </span>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h3
              style={{ fontSize: 'var(--text-h4)', color: 'var(--color-text-primary)', margin: 0 }}
            >
              Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Card
                padding="md"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ color: 'var(--color-text-secondary)' }}>Contract Address</span>
                <a
                  href={`https://sepolia.etherscan.io/address/${nft.contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: 'var(--color-accent-purple)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    textDecoration: 'none'
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    {nft.contractAddress.substring(0, 8)}...
                    {nft.contractAddress.substring(nft.contractAddress.length - 6)}
                  </span>
                  <ArrowUpRight size={14} />
                </a>
              </Card>

              <Card
                padding="md"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ color: 'var(--color-text-secondary)' }}>Token ID</span>
                <span
                  style={{
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {nft.tokenId.length > 10 ? `${nft.tokenId.substring(0, 10)}...` : nft.tokenId}
                </span>
              </Card>

              <Card
                padding="md"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ color: 'var(--color-text-secondary)' }}>Token Standard</span>
                <span
                  style={{
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {nft.standard}
                </span>
              </Card>

              <Card
                padding="md"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ color: 'var(--color-text-secondary)' }}>Chain ID</span>
                <span
                  style={{
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {nft.chainId}
                </span>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
