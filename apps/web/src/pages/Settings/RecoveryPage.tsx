import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, CheckCircle, Info } from 'lucide-react';
import { BackButton } from '../../components/index.js';

export function RecoveryPage() {
  const navigate = useNavigate();

  const maskedWords = Array.from({ length: 12 }, (_, i) => i + 1);

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
                  background: 'rgba(255,69,58,0.1)',
                  borderRadius: '14px',
                  display: 'flex'
                }}
              >
                <Shield size={22} color="#FF453A" />
              </div>
              <h1
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                  margin: 0
                }}
              >
                Recovery Center
              </h1>
            </div>
            <p style={{ color: '#52525b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Your 12-word recovery phrase was generated during wallet creation. It is the only way
              to restore your wallet if you lose access to this device.
            </p>
          </div>

          {/* Backup Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#52525b'
              }}
            >
              Backup Status
            </span>
            <div
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
                overflow: 'hidden'
              }}
            >
              {[
                { label: 'Status', value: 'Verified', badge: true },
                { label: 'Created', value: 'During wallet initialization' },
                { label: 'Encryption', value: 'AES-256-GCM' },
                { label: 'Standard', value: '12 words · BIP-39' }
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.5rem',
                    borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '0.875rem', color: '#8A8A93' }}>{row.label}</span>
                  {row.badge ? (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        fontSize: '0.8rem',
                        color: '#34C759',
                        background: 'rgba(52,199,89,0.1)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '100px'
                      }}
                    >
                      <CheckCircle size={12} /> Verified
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                      {row.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '1.25rem',
              background: 'rgba(59, 130, 246, 0.06)',
              border: '1px solid rgba(59, 130, 246, 0.15)',
              borderRadius: '12px'
            }}
          >
            <Info size={18} color="#3B82F6" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-primary)',
                  fontWeight: 500
                }}
              >
                Phrase Reveal is currently restricted
              </span>
              <span style={{ fontSize: '0.8rem', color: '#8A8A93', lineHeight: 1.5 }}>
                For your security, viewing your recovery phrase or exporting an encrypted backup
                requires a secure password re-verification flow. This flow is undergoing an
                additional security audit and will be available in v1.1.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
