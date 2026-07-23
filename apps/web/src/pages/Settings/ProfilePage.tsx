import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Copy, Lock, Check } from 'lucide-react';
import { useActiveWallet, useSettings } from '../../hooks/index.js';
import { BackButton } from '../../components/index.js';

export function ProfilePage() {
  const navigate = useNavigate();
  const activeWallet = useActiveWallet();
  const { displayName, setDisplayName } = useSettings();
  const [localName, setLocalName] = useState(displayName);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const rawAddress = activeWallet?.address || '';

  const formatAddress = (addr: string) => {
    if (!addr) return '0x0000...0000';
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const displayAddress = formatAddress(rawAddress);

  const handleCopy = () => {
    const textToCopy = rawAddress || '0x0000...0000';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);

    const evt = new CustomEvent('toast', {
      detail: { type: 'success', message: 'Wallet address copied to clipboard' }
    });
    window.dispatchEvent(evt);

    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
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

            {/* Wallet Address Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#52525b'
                }}
              >
                Wallet Address
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '0.375rem 0.375rem 0.375rem 1rem',
                  transition: 'border 0.3s'
                }}
              >
                <span
                  style={{
                    flex: 1,
                    color: 'var(--color-text-primary)',
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {displayAddress}
                </span>
                <button
                  onClick={handleCopy}
                  title="Copy address"
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    background: copied ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                    border: 'none',
                    color: copied ? '#34C759' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  onMouseOver={(e) => {
                    if (!copied) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    if (!copied)
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* 6. Section 'Account Type' */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#52525b'
              }}
            >
              Account Type
            </span>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.125rem 1.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
                }}
              >
                <span style={{ fontSize: '0.9rem', color: '#8A8A93' }}>Derivation Path</span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-mono, monospace)'
                  }}
                >
                  m/44'/60'/0'/0/0
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.125rem 1.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
                }}
              >
                <span style={{ fontSize: '0.9rem', color: '#8A8A93' }}>Account Index</span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-mono, monospace)'
                  }}
                >
                  0
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.125rem 1.5rem'
                }}
              >
                <span style={{ fontSize: '0.9rem', color: '#8A8A93' }}>Key Type</span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-mono, monospace)'
                  }}
                >
                  secp256k1
                </span>
              </div>
            </div>
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
