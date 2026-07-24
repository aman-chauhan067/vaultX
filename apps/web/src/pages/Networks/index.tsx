import React, { useState, useMemo, useEffect } from 'react';
import { PageLayout } from '../../layout/index.js';
import { Button, Card, Badge, Input, useToast } from '../../design-system/index.js';
import { Search, CheckCircle2, XCircle, Clock, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNetwork } from '../../hooks/index.js';
import { BackButton } from '../../components/index.js';
import { CryptoIcon } from '../../components/CryptoIcon.js';

export default function Networks() {
  const navigate = useNavigate();
  const { supportedNetworks, activeChainId, switchNetwork, addNetwork, removeNetwork } =
    useNetwork();
  const { showToast } = useToast();

  const [showAdd, setShowAdd] = useState(false);
  const [newChainId, setNewChainId] = useState('');
  const [newName, setNewName] = useState('');
  const [newRpc, setNewRpc] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Mainnets' | 'Testnets' | 'Custom'>('All');
  const [switchingChainId, setSwitchingChainId] = useState<number | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const [rpcStatus, setRpcStatus] = useState<
    Record<number, { latency: number; sync: string; status: 'connected' | 'disconnected' }>
  >({});

  useEffect(() => {
    const statuses: any = {};
    supportedNetworks.forEach((net) => {
      statuses[net.chainId] = {
        latency: Math.floor(Math.random() * 200) + 20,
        sync: 'Just now',
        status: 'connected'
      };
    });
    setRpcStatus(statuses);
  }, [supportedNetworks]);

  const handleAdd = () => {
    try {
      if (!newChainId || !newName || !newRpc)
        throw new Error('Please fill in all required fields.');
      const chainIdNum = parseInt(newChainId);
      if (isNaN(chainIdNum) || chainIdNum <= 0)
        throw new Error('Please enter a valid numeric Chain ID.');

      addNetwork({
        chainId: chainIdNum,
        name: newName,
        rpcUrls: [newRpc],
        isTestnet: false,
        currency: newSymbol
          ? { name: newSymbol, symbol: newSymbol, decimals: 18 }
          : { name: 'ETH', symbol: 'ETH', decimals: 18 }
      } as any);
      setShowAdd(false);
      setNewChainId('');
      setNewName('');
      setNewRpc('');
      setNewSymbol('');
      setError('');
      showToast({ title: `${newName} added successfully`, type: 'success' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSwitch = async (chainId: number) => {
    if (switchingChainId !== null) return;
    setSwitchingChainId(chainId);
    const net = supportedNetworks.find((n) => n.chainId === chainId);
    try {
      await switchNetwork(chainId);
      showToast({ title: `Network switched to ${net?.name || chainId}`, type: 'success' });
    } catch {
      showToast({
        title: `Failed to switch to ${net?.name || chainId}. Please try again.`,
        type: 'error'
      });
    } finally {
      setSwitchingChainId(null);
    }
  };

  const filteredNetworks = useMemo(() => {
    let result = supportedNetworks;

    if (filterType === 'Mainnets') result = result.filter((n) => !n.isTestnet);
    if (filterType === 'Testnets') result = result.filter((n) => n.isTestnet);
    if (filterType === 'Custom') result = result.filter((n) => !n.explorer);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.chainId.toString().includes(q) ||
          n.currency?.symbol.toLowerCase().includes(q)
      );
    }

    const active = result.find((n) => n.chainId === activeChainId);
    const others = result.filter((n) => n.chainId !== activeChainId);
    return active ? [active, ...others] : others;
  }, [supportedNetworks, filterType, searchQuery, activeChainId]);

  return (
    <PageLayout
      title="Networks"
      description="Manage custom RPCs and active chains"
      action={<BackButton onClick={() => navigate('/settings')} />}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          maxWidth: '800px',
          margin: '0 auto',
          height: 'calc(100vh - 180px)'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            alignItems: 'center',
            background: 'var(--color-surface)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <Search
              size={18}
              color="var(--color-text-secondary)"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
            <input
              type="text"
              placeholder="Search networks, chain ID, token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                background: 'var(--color-border-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['All', 'Mainnets', 'Testnets', 'Custom'].map((f) => (
              <Badge
                key={f}
                variant={filterType === f ? 'brand' : 'neutral'}
                style={{ cursor: 'pointer' }}
                onClick={() => setFilterType(f as any)}
              >
                {f}
              </Badge>
            ))}
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => setShowAdd(!showAdd)}
          >
            Add
          </Button>
        </div>

        {showAdd && (
          <Card
            padding="lg"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              background: 'var(--color-surface)'
            }}
          >
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>New RPC Network</h3>
            <Input
              label="Network Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Polygon Mainnet"
            />
            <Input
              label="New RPC URL"
              value={newRpc}
              onChange={(e) => setNewRpc(e.target.value)}
              placeholder="https://"
            />
            <Input
              label="Chain ID"
              value={newChainId}
              onChange={(e) => setNewChainId(e.target.value)}
              placeholder="e.g. 137"
              type="number"
            />
            <Input
              label="Currency Symbol (Optional)"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              placeholder="e.g. MATIC"
            />

            {error && (
              <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-xs)' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <Button variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAdd}>
                Save Network
              </Button>
            </div>
          </Card>
        )}

        <div
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            flex: 1,
            overflowY: 'auto',
            paddingRight: '10px',
            position: 'relative'
          }}
        >
          {filteredNetworks.map((net, index) => {
            const status = rpcStatus[net.chainId];
            const isActive = activeChainId === net.chainId;
            const isSwitching = switchingChainId === net.chainId;

            const startFade = index * 160;
            const distance = 160;

            let opacity = 1;
            let scale = 1;

            if (scrollTop > startFade) {
              const progress = Math.min((scrollTop - startFade) / distance, 1);
              opacity = 1 - progress;
              scale = 1 - progress * 0.05;
            }

            return (
              <div
                id={`network-card-${net.chainId}`}
                key={net.chainId}
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: index,
                  opacity,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center',
                  flexShrink: 0
                }}
              >
                <Card
                  padding="md"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                    border: isActive
                      ? '1px solid rgba(52, 199, 89, 0.4)'
                      : '1px solid var(--glass-border-light)',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isActive
                      ? 'inset 0 0 15px rgba(52, 199, 89, 0.1), 0 4px 15px rgba(0,0,0,0.1)'
                      : '0 4px 15px rgba(0,0,0,0.05)',
                    borderRadius: '20px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <CryptoIcon symbol={net.currency?.symbol || 'ETH'} size={40} />
                      <div>
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: 'var(--text-md)',
                              fontWeight: 'var(--font-weight-medium)'
                            }}
                          >
                            {net.name}
                          </h3>
                          {net.isTestnet && <Badge variant="neutral">Testnet</Badge>}
                          {isActive && <Badge variant="brand">Active</Badge>}
                        </div>
                        <div
                          style={{
                            color: 'var(--color-text-secondary)',
                            fontSize: 'var(--text-xs)',
                            marginTop: 'var(--space-1)',
                            display: 'flex',
                            gap: 'var(--space-3)',
                            alignItems: 'center'
                          }}
                        >
                          <span>ID: {net.chainId}</span>
                          <span>•</span>
                          <span>Token: {net.currency?.symbol || 'ETH'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      {isActive ? (
                        <Button variant="outline" size="sm" disabled>
                          Connected
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSwitch(net.chainId)}
                          disabled={switchingChainId !== null}
                        >
                          {isSwitching ? 'Switching...' : 'Switch'}
                        </Button>
                      )}
                      {net.isCustom && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeNetwork(net.chainId)}
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 'var(--space-4)',
                      paddingTop: 'var(--space-2)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      {status?.status === 'connected' ? (
                        <CheckCircle2 size={12} color="var(--color-brand)" />
                      ) : (
                        <XCircle size={12} color="var(--color-danger)" />
                      )}
                      RPC: {status?.status === 'connected' ? 'Connected' : 'Offline'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <Clock size={12} />
                      Latency: {status?.latency || 0}ms
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      Last Sync: {status?.sync || 'Never'}
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}

          <div style={{ height: 'calc(100vh - 280px)', flexShrink: 0 }} />

          {filteredNetworks.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-6)',
                color: 'var(--color-text-secondary)'
              }}
            >
              No networks found.
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
