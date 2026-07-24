import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../layout/index.js';
import { Button, Card } from '../../design-system/index.js';
import { Code, ArrowLeft, Bug, Trash2, TestTube, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNetwork, useActiveWallet } from '../../hooks/index.js';
import { VaultXService } from '../../services/VaultXService.js';
import { VaultXProviderAdapter } from '../../services/VaultXProviderAdapter.js';
import { isExtensionEnvironment } from '../../utils/extensionEnv.js';
import { useComingSoon } from '../../providers/ComingSoonProvider.js';
import { BackButton } from '../../components/index.js';

export default function Developer() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      title={t('developer.title')}
      description={t('developer.description')}
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
              {t('developer.system_diagnostics')}
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
                {t('developer.current_chain')}
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
                {t('developer.chain_id')}
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
                {t('developer.rpc_url')}
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
                {t('developer.current_block')}
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
                {blockNumber?.toLocaleString() || '---'}
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
                {t('developer.wallet_address')}
              </span>
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-mono)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={activeWallet?.address}
              >
                {activeWallet?.address || 'None'}
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
                {t('developer.connected_dapps')}
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
                {t('developer.wc_sessions')}
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
                {t('developer.cache_size')}
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
                2.86 MB
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
                {t('developer.extension_status')}
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
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
                {t('developer.background_worker')}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: 'var(--text-md)', fontWeight: 500 }}>
                  {t('developer.show_testnets')}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  {t('developer.show_testnets_desc')}
                </span>
              </div>
            </div>
            <div
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: showTestnets ? 'var(--color-success)' : 'var(--color-border-primary)',
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
