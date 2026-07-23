import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Smartphone, Shield, Clock, QrCode, Key, Info } from 'lucide-react';
import { BackButton } from '../../components/index.js';

export function TwoFactorPage() {
  const navigate = useNavigate();

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
                  background: 'rgba(168,85,247,0.1)',
                  borderRadius: '14px',
                  display: 'flex'
                }}
              >
                <Smartphone size={22} color="#A855F7" />
              </div>
              <h1
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                  margin: 0
                }}
              >
                Two-Factor Authentication
              </h1>
            </div>
            <p style={{ color: '#52525b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Add a second layer of protection to your vault. VaultX will support both authenticator
              apps (TOTP) and hardware security keys (FIDO2).
            </p>
          </div>

          {/* Status Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 1.25rem',
              background: 'rgba(168,85,247,0.06)',
              border: '1px solid rgba(168,85,247,0.15)',
              borderRadius: '12px'
            }}
          >
            <Clock size={16} color="#A855F7" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              <span
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-primary)',
                  fontWeight: 500
                }}
              >
                2FA Not Yet Configured
              </span>
              <span style={{ fontSize: '0.75rem', color: '#52525b' }}>
                TOTP and FIDO2 support available in v1.2
              </span>
            </div>
          </div>

          {/* Methods */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#52525b'
              }}
            >
              Available Methods
            </span>

            <div
              style={{
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                opacity: 0.7
              }}
            >
              <QrCode size={28} color="#8A8A93" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1rem', fontWeight: 400 }}>Authenticator App</div>
                <div style={{ fontSize: '0.75rem', color: '#52525b', marginTop: '0.25rem' }}>
                  Google Authenticator, Authy, 1Password — TOTP (RFC 6238)
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.25rem 0.625rem',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '100px',
                  color: '#52525b',
                  whiteSpace: 'nowrap'
                }}
              >
                Coming in v1.2
              </span>
            </div>

            <div
              style={{
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                opacity: 0.7
              }}
            >
              <Key size={28} color="#8A8A93" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1rem', fontWeight: 400 }}>Hardware Security Key</div>
                <div style={{ fontSize: '0.75rem', color: '#52525b', marginTop: '0.25rem' }}>
                  YubiKey, Google Titan — FIDO2/WebAuthn
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.25rem 0.625rem',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '100px',
                  color: '#52525b',
                  whiteSpace: 'nowrap'
                }}
              >
                Coming in v1.2
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
