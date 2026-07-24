import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Key, Lock, ShieldCheck, Info } from 'lucide-react';
import { BackButton } from '../../components/index.js';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--glass-border-light)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    padding: '1rem 3rem 1rem 1rem',
    color: '#6b7280',
    fontSize: '1rem',
    outline: 'none',
    cursor: 'not-allowed',
    boxSizing: 'border-box'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--color-text-secondary)',
    marginBottom: '0.5rem'
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2rem 0',
          borderBottom: '1px solid var(--glass-border-light)'
        }}
      >
        <BackButton />
        <span
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-text-secondary)'
          }}
        >
          Authentication
        </span>
      </motion.div>

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
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  padding: '0.875rem',
                  background: 'rgba(59,130,246,0.1)',
                  borderRadius: '14px',
                  display: 'flex'
                }}
              >
                <Key size={22} color="var(--color-info)" />
              </div>
              <h1
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                  margin: 0
                }}
              >
                Change Password
              </h1>
            </div>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                margin: 0
              }}
            >
              Your vault password is used to derive your AES-GCM encryption key. For security, this
              flow is temporarily disabled pending an additional audit of the key derivation
              re-encryption logic.
            </p>
          </div>

          {/* Status Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 1.25rem',
              background: 'rgba(59,130,246,0.06)',
              border: '1px solid rgba(59,130,246,0.15)',
              borderRadius: '12px'
            }}
          >
            <ShieldCheck size={16} color="var(--color-info)" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              <span
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-primary)',
                  fontWeight: 500
                }}
              >
                Password Change Restricted
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Available in v1.1 · Security audit in progress
              </span>
            </div>
          </div>

          {/* Info Panels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                padding: '1.5rem',
                background: 'var(--color-surface)',
                borderRadius: '16px',
                border: '1px solid var(--glass-border-light)',
                display: 'flex',
                gap: '1.25rem'
              }}
            >
              <Lock
                size={24}
                color="var(--color-text-secondary)"
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span
                  style={{ fontSize: '1rem', color: 'var(--color-text-primary)', fontWeight: 500 }}
                >
                  How Password Encryption Works
                </span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6
                  }}
                >
                  Your password is never stored by VaultX. Instead, it is passed through Argon2 to
                  derive a strong AES-GCM encryption key. This key encrypts your recovery phrase and
                  private keys locally on your device.
                </span>
              </div>
            </div>

            <div
              style={{
                padding: '1.5rem',
                background: 'var(--color-surface)',
                borderRadius: '16px',
                border: '1px solid var(--glass-border-light)',
                display: 'flex',
                gap: '1.25rem'
              }}
            >
              <Key
                size={24}
                color="var(--color-text-secondary)"
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span
                  style={{ fontSize: '1rem', color: 'var(--color-text-primary)', fontWeight: 500 }}
                >
                  Why Rotation Requires Migration
                </span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6
                  }}
                >
                  Changing your password requires decrypting your entire vault with the old key, and
                  re-encrypting it with a new key derived from the new password. This process must
                  be entirely fault-tolerant to prevent data loss.
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
