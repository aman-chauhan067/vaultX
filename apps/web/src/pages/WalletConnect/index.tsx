import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../layout/index.js';
import { Card, Button, Input, Badge, GlassCard, EmptyState } from '../../design-system/index.js';
import { VaultXService } from '../../services/VaultXService.js';
import { Link, Trash2, Shield, Globe } from 'lucide-react';
import type { WCSession } from '@vaultx/network-engine';

export default function WalletConnectSettings() {
  const [uri, setUri] = useState('');
  const [sessions, setSessions] = useState<WCSession[]>([]);
  const [isPairing, setIsPairing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wcService = VaultXService.getInstance().walletConnect;

  const loadSessions = () => {
    try {
      const active = wcService.getActiveSessions();
      setSessions(active);
    } catch {
      setSessions([]);
    }
  };

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 2000);
    return () => clearInterval(interval);
  }, [wcService]);

  const handlePair = async () => {
    if (!uri) return;
    setIsPairing(true);
    setError(null);
    try {
      await wcService.pair(uri);
      setUri('');
    } catch (err: any) {
      setError(
        err.message || 'Unable to connect to the DApp. Verify the WalletConnect URI and try again.'
      );
    } finally {
      setIsPairing(false);
    }
  };

  const handleDisconnect = async (topic: string) => {
    try {
      await wcService.disconnectSession(topic);
      loadSessions();
    } catch (err: any) {
      setError(err.message || 'Unable to disconnect this session. Please try again.');
    }
  };

  return (
    <PageLayout title="WalletConnect" description="Manage your DApp connections">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <GlassCard
          padding="lg"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        >
          <div>
            <h2 style={{ fontSize: 'var(--text-xl)', margin: '0 0 var(--space-2) 0' }}>
              New Connection
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
              Paste a WalletConnect URI to connect to a DApp.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Input
              placeholder="wc:..."
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              disabled={isPairing}
              style={{ flex: 1 }}
              error={!!error}
            />
            <Button
              onClick={handlePair}
              disabled={!uri || isPairing}
              variant="primary"
              isLoading={isPairing}
            >
              Connect
            </Button>
          </div>
          {error && (
            <span style={{ color: 'var(--color-danger)', fontSize: 'var(--text-xs)' }}>
              {error}
            </span>
          )}
        </GlassCard>

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-4)'
            }}
          >
            <h3 style={{ fontSize: 'var(--text-xl)', margin: 0 }}>Active Sessions</h3>
            <Badge variant="neutral">{sessions.length}</Badge>
          </div>

          {sessions.length === 0 ? (
            <EmptyState
              icon={<Link size={40} />}
              title="No active connections"
              description="Connect to a DApp to see it here."
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 'var(--space-4)'
              }}
            >
              {sessions.map((session) => (
                <Card
                  key={session.topic}
                  padding="md"
                  style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--color-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}
                    >
                      {session.peer.icons?.[0] ? (
                        <img
                          src={session.peer.icons[0]}
                          alt={session.peer.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <Globe size={24} color="var(--color-text-secondary)" />
                      )}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <h4
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                          margin: '0 0 var(--space-1) 0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {session.peer.name || 'Unknown DApp'}
                      </h4>
                      <a
                        href={session.peer.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-1)'
                        }}
                      >
                        <Shield size={12} />{' '}
                        {new URL(session.peer.url || 'https://unknown').hostname}
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(session.topic)}
                    >
                      <Trash2 size={16} style={{ marginRight: 'var(--space-2)' }} /> Disconnect
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
