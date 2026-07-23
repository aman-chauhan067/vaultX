import React, { useCallback } from 'react';
import { BackButton } from '../../components/index.js';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Monitor, Smartphone, Shield, Clock, Lock, Trash2, X } from 'lucide-react';
import { useSettings } from '../../hooks/index.js';
import { VaultXService } from '../../services/VaultXService.js';
import { SessionData } from '@vaultx/account-manager';

export function DevicesPage() {
  const navigate = useNavigate();
  const { autoLockTime, setAutoLockTime } = useSettings();

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';
    if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';

    if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';

    return `${browser} · ${os}`;
  };

  const browserInfo = getBrowserInfo();

  const [sessions, setSessions] = React.useState<SessionData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showRevokeModal, setShowRevokeModal] = React.useState<string | null>(null);

  const accountManager = VaultXService.getInstance().accountManager;
  const sessionClient = accountManager.getSessionClient();
  const currentDeviceId = accountManager.getDeviceId();

  const fetchSessions = useCallback(async () => {
    try {
      const activeWallet = accountManager.getActiveWallet();
      if (!activeWallet) return;
      const data = await sessionClient.getSessions(activeWallet.metadata.walletId);
      setSessions(data.filter((s) => s.status === 'active'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [accountManager, sessionClient]);

  React.useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const handleRevoke = async (deviceId: string) => {
    await sessionClient.revokeSession(deviceId);
    setShowRevokeModal(null);
    fetchSessions();
  };

  const handleRename = async (deviceId: string) => {
    const newName = prompt('Enter a new name for this device:');
    if (newName && newName.trim() !== '') {
      await sessionClient.renameSession(deviceId, newName.trim());
      fetchSessions();
    }
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
      {/* Top Header / Breadcrumb Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2rem 0',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <BackButton />
        <span
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#52525b'
          }}
        >
          Security
        </span>
      </motion.div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          maxWidth: '560px',
          margin: '0 auto',
          width: '100%',
          paddingTop: '6vh',
          paddingBottom: '6vh'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}
        >
          {/* Title & Description Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(20, 184, 166, 0.12)',
                  border: '1px solid rgba(20, 184, 166, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Monitor size={22} color="#14B8A6" />
              </div>
              <h1
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                  margin: 0
                }}
              >
                Connected Devices
              </h1>
            </div>
            <p style={{ color: '#52525b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              View and manage all devices that have accessed your VaultX wallet.
            </p>
          </div>

          {/* Current Session Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#52525b'
              }}
            >
              Current Session
            </span>

            <div
              style={{
                padding: '1.25rem 1.5rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Monitor size={22} color="#ffffff" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span
                    style={{
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    {browserInfo}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#34C759',
                        boxShadow: '0 0 8px rgba(52, 199, 89, 0.6)'
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#52525b' }}>
                      Active now • {currentDeviceId.slice(0, 8)}
                    </span>
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(20, 184, 166, 0.12)',
                  border: '1px solid rgba(20, 184, 166, 0.3)',
                  borderRadius: '100px',
                  color: '#14B8A6',
                  whiteSpace: 'nowrap'
                }}
              >
                This device
              </span>
            </div>
          </div>

          {/* Other Sessions Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#52525b'
              }}
            >
              Other Sessions
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#52525b' }}>
                  Loading sessions...
                </div>
              ) : sessions.filter((s) => s.deviceId !== currentDeviceId).length === 0 ? (
                <div
                  style={{
                    padding: '3rem 1.5rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: '1rem'
                  }}
                >
                  <Smartphone size={56} color="#ffffff" style={{ opacity: 0.15 }} />
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      maxWidth: '420px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      No other sessions
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#52525b', lineHeight: 1.5 }}>
                      When you access VaultX from additional browsers, those sessions will appear
                      here.
                    </span>
                  </div>
                </div>
              ) : (
                sessions
                  .filter((s) => s.deviceId !== currentDeviceId)
                  .map((session) => (
                    <div
                      key={session.deviceId}
                      style={{
                        padding: '1.25rem 1.5rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div
                          style={{
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.04)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {session.platform === 'Web' ? (
                            <Monitor size={22} color="#ffffff" />
                          ) : (
                            <Smartphone size={22} color="#ffffff" />
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span
                            style={{
                              fontSize: '1rem',
                              fontWeight: 500,
                              color: 'var(--color-text-primary)'
                            }}
                          >
                            {session.deviceName || 'VaultX Device'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#52525b' }}>
                              {session.browser} · {session.platform} • Last seen:{' '}
                              {session.lastSeen
                                ? new Date(session.lastSeen).toLocaleString()
                                : 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleRename(session.deviceId)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: 'var(--color-text-primary)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }}
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => setShowRevokeModal(session.deviceId)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'transparent',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }}
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Session Security Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#52525b'
              }}
            >
              Session Security
            </span>

            <div
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Row 1: Auto-lock timeout */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <Clock size={18} color="#8A8A93" />
                  <span style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                    Auto-lock timeout
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={Math.max(1, autoLockTime / (60 * 1000))}
                    onChange={(e) => setAutoLockTime(parseInt(e.target.value) * 60 * 1000)}
                    style={{
                      width: '80px',
                      accentColor: '#14B8A6',
                      cursor: 'pointer'
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: '#14B8A6',
                      fontWeight: 500,
                      minWidth: '70px',
                      textAlign: 'right'
                    }}
                  >
                    {Math.max(1, autoLockTime / (60 * 1000))} minutes
                  </span>
                </div>
              </div>

              {/* Row 2: Idle detection */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <Shield size={18} color="#8A8A93" />
                  <span style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                    Idle detection
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      padding: '0.2rem 0.625rem',
                      background: 'rgba(52, 199, 89, 0.12)',
                      border: '1px solid rgba(52, 199, 89, 0.25)',
                      borderRadius: '100px',
                      color: '#34C759'
                    }}
                  >
                    Enabled
                  </span>
                </div>
              </div>

              {/* Row 3: Session encryption */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <Lock size={18} color="#8A8A93" />
                  <span style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                    Session encryption
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.625rem',
                    background: 'rgba(20, 184, 166, 0.1)',
                    border: '1px solid rgba(20, 184, 166, 0.2)',
                    borderRadius: '6px',
                    color: '#14B8A6'
                  }}
                >
                  AES-256-GCM
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {showRevokeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-secondary)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '400px',
              width: '100%'
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Revoke Device?</h3>
            <p
              style={{
                color: '#a1a1aa',
                fontSize: '0.875rem',
                marginBottom: '2rem',
                lineHeight: 1.5
              }}
            >
              This will log out the device and wipe its local storage. You will need to re-import
              your wallet on that device if you want to use it again.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowRevokeModal(null)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRevoke(showRevokeModal)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Yes, Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
