import React from 'react';
import { BackButton } from '../../components/index.js';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Info } from 'lucide-react';
import { useSettings } from '../../hooks/index.js';

interface ToggleProps {
  enabled?: boolean;
  disabled?: boolean;
}

function Toggle({ enabled = false, disabled = true }: ToggleProps) {
  return (
    <div
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '100px',
        background: enabled ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${enabled ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.1)'}`,
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0,
        transition: 'all 0.2s ease'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: enabled ? '22px' : '2px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: enabled ? '#F59E0B' : '#3a3a3f',
          transition: 'left 0.2s ease'
        }}
      />
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  sublabel?: string;
  enabled?: boolean;
  disabled?: boolean;
  onChange?: () => void;
}

function ToggleRow({
  label,
  sublabel,
  enabled = false,
  disabled = false,
  onChange
}: ToggleRowProps) {
  return (
    <div
      onClick={() => {
        if (!disabled && onChange) onChange();
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 1.5rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.05)',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{ fontSize: '1rem', fontWeight: 400 }}>{label}</span>
        {sublabel && <span style={{ fontSize: '0.75rem', color: '#52525b' }}>{sublabel}</span>}
      </div>
      <Toggle enabled={enabled} disabled={disabled} />
    </div>
  );
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, setNotifications } = useSettings();

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications({ [key]: !notifications[key] });
    const evt = new CustomEvent('toast', {
      detail: { type: 'success', message: 'Notification preferences updated' }
    });
    window.dispatchEvent(evt);
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
      {/* Top Header / Breadcrumb */}
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
          Preferences
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
          style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  padding: '0.875rem',
                  background: 'rgba(245,158,11,0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bell size={22} color="#F59E0B" />
              </div>
              <h1
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                  margin: 0
                }}
              >
                Notifications
              </h1>
            </div>
            <p style={{ color: '#52525b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Control how VaultX notifies you about transactions, security events, and updates.
            </p>
          </div>

          {/* Section: Transaction Alerts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#52525b',
                paddingLeft: '0.25rem'
              }}
            >
              Transaction Alerts
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <ToggleRow
                label="Incoming Transactions"
                sublabel="Get notified when you receive funds"
                enabled={notifications.incoming}
                onChange={() => handleToggle('incoming')}
              />
              <ToggleRow
                label="Outgoing Confirmations"
                sublabel="Confirmation when your transaction is mined"
                enabled={notifications.outgoing}
                onChange={() => handleToggle('outgoing')}
              />
              <ToggleRow
                label="Failed Transactions"
                sublabel="Alert when a transaction fails or reverts"
                enabled={notifications.failed}
                onChange={() => handleToggle('failed')}
              />
            </div>
          </div>

          {/* Section: Security Alerts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#52525b',
                paddingLeft: '0.25rem'
              }}
            >
              Security Alerts
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <ToggleRow
                label="Login Attempts"
                sublabel="Suspicious unlock attempts"
                enabled={notifications.login}
                onChange={() => handleToggle('login')}
              />
              <ToggleRow
                label="DApp Permissions"
                sublabel="When a new DApp requests access"
                enabled={notifications.dapps}
                onChange={() => handleToggle('dapps')}
              />
            </div>
          </div>

          {/* Section: Product Updates */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#52525b',
                paddingLeft: '0.25rem'
              }}
            >
              Product Updates
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <ToggleRow
                label="Feature Announcements"
                sublabel="New features and improvements"
                enabled={notifications.feature}
                onChange={() => handleToggle('feature')}
              />
              <ToggleRow
                label="Network Status"
                sublabel="RPC health and chain upgrades"
                enabled={notifications.network}
                onChange={() => handleToggle('network')}
              />
            </div>
          </div>

          {/* Info Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '1rem 1.25rem',
              background: 'rgba(245, 158, 11, 0.06)',
              border: '1px solid rgba(245, 158, 11, 0.15)',
              borderRadius: '12px',
              marginTop: '0.5rem'
            }}
          >
            <Info size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#8A8A93', lineHeight: 1.5 }}>
              Notifications require a background service worker connection. This integration is
              being tested to ensure reliable delivery across Chrome, Firefox, and Edge. Available
              in v1.2.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
