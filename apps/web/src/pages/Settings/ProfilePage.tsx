import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Copy, Check, Plus, ExternalLink } from 'lucide-react';
import { useWallet, useSettings } from '../../hooks/index.js';
import { BackButton } from '../../components/index.js';

export function ProfilePage() {
  const navigate = useNavigate();
  const { wallets, activeWalletId, setActiveWallet, deriveAccount } = useWallet();
  const { displayName, setDisplayName } = useSettings();

  const [localName, setLocalName] = useState(displayName);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatAddress = (addr: string) => {
    if (!addr) return '0x0000...0000';
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleCopy = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);

    const evt = new CustomEvent('toast', {
      detail: { type: 'success', message: 'Wallet address copied to clipboard' }
    });
    window.dispatchEvent(evt);

    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateAccount = async () => {
    try {
      await deriveAccount(`Account ${wallets.length + 1}`);
      const evt = new CustomEvent('toast', {
        detail: { type: 'success', message: 'New account created successfully' }
      });
      window.dispatchEvent(evt);
    } catch (e: any) {
      console.error(e);
      const evt = new CustomEvent('toast', {
        detail: { type: 'error', message: e.message || 'Failed to create account' }
      });
      window.dispatchEvent(evt);
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
      {/* 1. Header & Breadcrumb */}
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
          Account
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
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          {/* 2 & 3. Header Title & Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <User size={22} color="#3B82F6" />
              </div>
              <h1
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                  margin: 0
                }}
              >
                Edit Profile
              </h1>
            </div>
            <p style={{ color: '#52525b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Customize your wallet identity. These changes are stored locally.
            </p>
          </div>

          {/* 4. Section 'Avatar' */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #34C759, #3B82F6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.2)',
                flexShrink: 0
              }}
            >
              {localName ? localName.charAt(0).toUpperCase() : 'M'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span
                style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: 500 }}
              >
                Profile Avatar
              </span>
              <span style={{ fontSize: '0.8rem', color: '#8A8A93' }}>
                Auto-generated from your display name.
              </span>
            </div>
          </div>

          {/* 5. Section 'Account Details' */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#52525b'
              }}
            >
              Account Details
            </span>

            {/* Display Name Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#52525b'
                }}
              >
                Display Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '0.875rem 1rem',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border 0.3s'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                />
              </div>
            </div>
          </div>

          {/* Accounts List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#52525b'
              }}
            >
              Connected Wallets
            </span>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                overflow: 'hidden'
              }}
            >
              {wallets.map((wallet, index) => {
                const isActive = wallet.metadata.walletId === activeWalletId;
                return (
                  <div
                    key={wallet.metadata.walletId}
                    onClick={() => setActiveWallet(wallet.metadata.walletId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1.125rem 1.5rem',
                      borderBottom:
                        index < wallets.length - 1 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #34C759, #3B82F6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        {wallet.metadata.walletName?.charAt(0) || `A${index + 1}`}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                          {wallet.metadata.walletName || `Account ${index + 1}`}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: '#8A8A93',
                            fontFamily: 'var(--font-mono, monospace)'
                          }}
                        >
                          {formatAddress(wallet.address)}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(wallet.address, wallet.metadata.walletId);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: copiedId === wallet.metadata.walletId ? '#34C759' : '#8A8A93',
                          cursor: 'pointer',
                          padding: '0.25rem'
                        }}
                      >
                        {copiedId === wallet.metadata.walletId ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                      {isActive && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#34C759'
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleCreateAccount}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem',
                marginTop: '0.5rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                color: 'var(--color-text-primary)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              }}
            >
              <Plus size={16} />
              Create New Account
            </button>
          </div>

          {/* 7. 'Save Changes' button */}
          <button
            onClick={() => {
              setIsSaving(true);
              setDisplayName(localName);
              const evt = new CustomEvent('toast', {
                detail: { type: 'success', message: 'Profile updated' }
              });
              window.dispatchEvent(evt);
              setTimeout(() => setIsSaving(false), 500);
            }}
            disabled={isSaving || localName === displayName || localName.trim().length === 0}
            style={{
              marginTop: '0.5rem',
              padding: '1rem 2rem',
              borderRadius: '100px',
              background:
                isSaving || localName === displayName || localName.trim().length === 0
                  ? 'rgba(255, 255, 255, 0.05)'
                  : '#3B82F6',
              border:
                isSaving || localName === displayName || localName.trim().length === 0
                  ? '1px solid rgba(255, 255, 255, 0.08)'
                  : '1px solid #3B82F6',
              color:
                isSaving || localName === displayName || localName.trim().length === 0
                  ? '#52525b'
                  : '#ffffff',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
              cursor:
                isSaving || localName === displayName || localName.trim().length === 0
                  ? 'not-allowed'
                  : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
