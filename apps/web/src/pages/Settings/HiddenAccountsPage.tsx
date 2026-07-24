import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, X, EyeOff } from 'lucide-react';
import { useWallet } from '../../hooks/index.js';
import { BackButton } from '../../components/index.js';

export default function HiddenAccountsPage() {
  const navigate = useNavigate();
  const { wallets, verifyPassword, hideWallet } = useWallet();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hiddenWallets = wallets.filter((w) => w.metadata.hidden);

  const formatAddress = (addr: string) => {
    if (!addr) return '0x0000...0000';
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handlePasswordConfirm = async () => {
    if (!password) {
      const evt = new CustomEvent('toast', {
        detail: { type: 'error', message: 'Password required' }
      });
      window.dispatchEvent(evt);
      return;
    }
    try {
      setIsProcessing(true);
      const isValid = await verifyPassword(password);
      if (!isValid) {
        throw new Error('Incorrect password');
      }
      setIsUnlocked(true);
    } catch (e: any) {
      console.error(e);
      const evt = new CustomEvent('toast', {
        detail: { type: 'error', message: e.message || 'Incorrect password?' }
      });
      window.dispatchEvent(evt);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnhide = async (walletId: string) => {
    try {
      await hideWallet(walletId, false);
      const evt = new CustomEvent('toast', {
        detail: { type: 'success', message: 'Account unhidden successfully' }
      });
      window.dispatchEvent(evt);
    } catch (err: any) {
      const evt = new CustomEvent('toast', {
        detail: { type: 'error', message: err.message || 'Failed to unhide' }
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
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
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
                <EyeOff size={22} color="var(--color-info)" />
              </div>
              <h1
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                  margin: 0
                }}
              >
                Hidden Accounts
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
              Manage accounts you have hidden from the main interface. Unhide them to make them
              visible again.
            </p>
          </div>

          {isUnlocked ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {hiddenWallets.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    color: 'var(--color-text-secondary)',
                    padding: '3rem 1rem',
                    background: 'var(--color-surface)',
                    borderRadius: '16px'
                  }}
                >
                  No hidden accounts.
                </div>
              ) : (
                <div
                  style={{
                    background: 'var(--color-surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--glass-border-light)',
                    overflow: 'hidden'
                  }}
                >
                  {hiddenWallets.map((wallet, index) => (
                    <div
                      key={wallet.metadata.walletId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1.125rem 1.5rem',
                        borderBottom:
                          index < hiddenWallets.length - 1
                            ? '1px solid var(--glass-border-light)'
                            : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #EF4444, #F59E0B)',
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
                              color: 'var(--color-text-secondary)',
                              fontFamily: 'var(--font-mono, monospace)'
                            }}
                          >
                            {formatAddress(wallet.address)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUnhide(wallet.metadata.walletId)}
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: 'none',
                          color: 'var(--color-info)',
                          cursor: 'pointer',
                          padding: '0.5rem 1rem',
                          borderRadius: '100px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}
                      >
                        Unhide
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 32px 64px -16px rgba(0,0,0,0.5), inset 0 1px 0 var(--glass-border)',
                borderRadius: '24px',
                padding: '2.5rem 2rem',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                position: 'relative',
                overflow: 'hidden',
                marginTop: '1rem'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  right: '-50%',
                  bottom: '-50%',
                  background:
                    'radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent 50%)',
                  pointerEvents: 'none'
                }}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  zIndex: 1
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '1.5rem',
                      fontWeight: 300,
                      letterSpacing: '-0.02em',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    Authentication Required
                  </h2>
                  <p
                    style={{
                      margin: '0.5rem 0 0 0',
                      fontSize: '0.9rem',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    Enter your Vault password to view hidden accounts.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 1 }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoFocus
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.2)',
                      padding: '1rem 2.5rem 1rem 0',
                      color: 'white',
                      fontSize: '1.25rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s, box-shadow 0.3s',
                      letterSpacing: password && !showPassword ? '0.2em' : 'normal',
                      fontFamily: password && !showPassword ? 'var(--font-sans)' : 'inherit'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderBottomColor = 'var(--color-text-primary)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.2)';
                    }}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', marginTop: '1rem', zIndex: 1 }}>
                <button
                  onClick={handlePasswordConfirm}
                  disabled={isProcessing || !password}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background:
                      isProcessing || !password
                        ? 'var(--color-border-secondary)'
                        : 'var(--color-text-primary)',
                    border: 'none',
                    borderRadius: '100px',
                    color:
                      isProcessing || !password
                        ? 'var(--color-text-secondary)'
                        : 'var(--color-bg-primary)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    cursor: isProcessing || !password ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    transform: isProcessing || !password ? 'none' : 'translateY(0)',
                    boxShadow:
                      isProcessing || !password
                        ? 'none'
                        : '0 10px 25px -5px rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseOver={(e) => {
                    if (!isProcessing && password)
                      e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    if (!isProcessing && password)
                      e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {isProcessing ? 'Authorizing...' : 'Authorize'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
