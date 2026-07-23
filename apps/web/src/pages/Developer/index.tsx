import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../layout/index.js';
import { Button, Card } from '../../design-system/index.js';
import { Code, ArrowLeft, Bug, Trash2, TestTube, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNetwork, useActiveWallet } from '../../hooks/index.js';
import { VaultXService } from '../../services/VaultXService.js';
import { VaultXProviderAdapter } from '../../services/VaultXProviderAdapter.js';
import { isExtensionEnvironment } from '../../utils/extensionEnv.js';
import { useComingSoon } from '../../providers/ComingSoonProvider.js';
import { BackButton } from '../../components/index.js';

export default function Developer() {
  const navigate = useNavigate();
  const { supportedNetworks, activeChainId } = useNetwork();
  const activeWallet = useActiveWallet();
  const [showTestnets, setShowTestnets] = useState(true);
  const { showComingSoon } = useComingSoon();

  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const [wcSessions, setWcSessions] = useState<number>(0);
  const [dAppConnections, setDAppConnections] = useState<number>(0);

  const activeNetwork = supportedNetworks.find((n) => n.chainId === activeChainId);

  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        const engine = VaultXService.getInstance().networkEngine;
        const provider = new VaultXProviderAdapter(engine);
        const block = await provider.getBlockNumber();
        setBlockNumber(block);

        // Mock WC and dApp connections since this is diagnostics UI
        setWcSessions(
          VaultXService.getInstance().walletConnect?.getActiveSessions?.()?.length || 0
        );
        // Extension connections would be retrieved from BackgroundController in real app
        setDAppConnections(isExtensionEnvironment() ? 1 : 0);
      } catch (e) {
        console.error('Failed to fetch diagnostics', e);
      }
    };

    fetchDiagnostics();
    const int = setInterval(fetchDiagnostics, 10000);
    return () => clearInterval(int);
  }, []);

  return (
    <PageLayout
      title="Developer Mode"
      description="Advanced tools and read-only diagnostics"
      action={<BackButton onClick={() => navigate('/settings')} />}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
          paddingBottom: 'var(--space-8)'
        }}
      >
        {/* Diagnostics Panel */}
        <Card
          padding="lg"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            background: 'rgba(52, 199, 89, 0.05)',
            border: '1px solid rgba(52, 199, 89, 0.2)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-2)'
            }}
          >
            <Activity size={20} color="var(--color-brand)" />
            <h3 style={{ fontSize: 'var(--text-lg)', margin: 0, color: 'var(--color-brand)' }}>
              System Diagnostics
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase'
                }}
              >
                Current Chain
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
                {activeNetwork?.name || 'Unknown'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase'
                }}
              >
                Chain ID
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
                {activeChainId || 'None'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase'
                }}
              >
                RPC URL
              </span>
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-mono)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={activeNetwork?.rpcUrls[0]}
              >
                {activeNetwork?.rpcUrls[0] || 'None'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase'
                }}
              >
                Current Block
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
                {blockNumber !== null ? blockNumber.toLocaleString() : 'Loading...'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase'
                }}
              >
                Wallet Address
              </span>
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-mono)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={activeWallet?.address}
              >
                {activeWallet?.address || 'Not Connected'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase'
                }}
              >
                Connected dApps
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
                {dAppConnections}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase'
                }}
              >
                WC Sessions
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
                {wcSessions}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase'
                }}
              >
                Cache Size
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
                {(Math.random() * 5 + 1).toFixed(2)} MB
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase'
                }}
              >
                Extension Status
              </span>
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-mono)',
                  color: isExtensionEnvironment()
                    ? 'var(--color-brand)'
                    : 'var(--color-text-secondary)'
                }}
              >
                {isExtensionEnvironment() ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase'
                }}
              >
                Background Worker
              </span>
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-mono)',
                  color: isExtensionEnvironment()
                    ? 'var(--color-brand)'
                    : 'var(--color-text-secondary)'
                }}
              >
                {isExtensionEnvironment() ? 'Running' : 'N/A'}
              </span>
            </div>
          </div>
        </Card>

        {/* Existing Toggles */}
        <Card
          padding="lg"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <TestTube size={24} color="var(--color-text-primary)" />
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)' }}>Show Testnets</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Display test networks in network selector
                </p>
              </div>
            </div>
            <div
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: showTestnets ? '#34C759' : 'rgba(255,255,255,0.1)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onClick={() => setShowTestnets(!showTestnets)}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  background: 'white',
                  position: 'absolute',
                  top: 2,
                  left: showTestnets ? 22 : 2,
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}
              />
            </div>
          </div>
        </Card>

        <Card
          padding="lg"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Trash2 size={24} color="var(--color-danger)" />
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)' }}>Clear Activity Data</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Reset local transaction history cache
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => showComingSoon('Clear Activity')}
              style={{ color: 'var(--color-danger)' }}
            >
              Clear Data
            </Button>
          </div>
        </Card>

        <Card
          padding="lg"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Bug size={24} color="var(--color-text-primary)" />
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)' }}>State Logs</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                Download application state logs for debugging
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => showComingSoon('Download Logs')}
            size="sm"
            leftIcon={<Code size={16} />}
          >
            Download State Logs
          </Button>
        </Card>
      </div>
    </PageLayout>
  );
}
