import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Copy,
  Check,
  Plus,
  ExternalLink,
  X,
  Eye,
  EyeOff,
  EyeOff as HideIcon,
  Trash2
} from 'lucide-react';
import { useWallet, useSettings } from '../../hooks/index.js';
import { BackButton } from '../../components/index.js';

export function ProfilePage() {
  const navigate = useNavigate();
  const {
    wallets,
    activeWalletId,
    setActiveWallet,
    deriveAccount,
    hideWallet,
    removeWallet,
    verifyPassword
  } = useWallet();
  const { displayName, setDisplayName } = useSettings();

  const [localName, setLocalName] = useState(displayName);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    'SWITCH' | 'CREATE' | 'HIDE' | 'DELETE' | null
  >(null);
  const [pendingWalletId, setPendingWalletId] = useState<string | null>(null);

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

  const handleOpenModalForCreate = () => {
    setPendingAction('CREATE');
    setPendingWalletId(null);
    setIsModalOpen(true);
    setPassword('');
  };

  const handleOpenModalForSwitch = (walletId: string) => {
    if (walletId === activeWalletId) return;
    setPendingAction('SWITCH');
    setPendingWalletId(walletId);
    setIsModalOpen(true);
    setPassword('');
  };

  const handleOpenModalForHide = (walletId: string) => {
    setPendingAction('HIDE');
    setPendingWalletId(walletId);
    setIsModalOpen(true);
    setPassword('');
  };

  const handleOpenModalForDelete = (walletId: string) => {
    setPendingAction('DELETE');
    setPendingWalletId(walletId);
    setIsModalOpen(true);
    setPassword('');
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

      if (pendingAction === 'SWITCH' && pendingWalletId) {
        setActiveWallet(pendingWalletId);
        setIsModalOpen(false);
      } else if (pendingAction === 'CREATE') {
        await deriveAccount(`Account ${wallets.length + 1}`);
        const evt = new CustomEvent('toast', {
          detail: { type: 'success', message: 'New account created successfully' }
        });
        window.dispatchEvent(evt);
        setIsModalOpen(false);
        const phrase = wallets.find((w) => w.mnemonic)?.mnemonic || '';
        navigate('/create-wallet', { state: { viewOnlyPhrase: phrase } });
      } else if (pendingAction === 'HIDE' && pendingWalletId) {
        await hideWallet(pendingWalletId, true);
        const evt = new CustomEvent('toast', {
          detail: { type: 'success', message: 'Account hidden successfully' }
        });
        window.dispatchEvent(evt);
        setIsModalOpen(false);
      } else if (pendingAction === 'DELETE' && pendingWalletId) {
        await removeWallet(pendingWalletId);
        const evt = new CustomEvent('toast', {
          detail: { type: 'success', message: 'Account deleted successfully' }
        });
        window.dispatchEvent(evt);
        setIsModalOpen(false);
      }
    } catch (e: any) {
      console.error(e);
      const evt = new CustomEvent('toast', {
        detail: {
          type: 'error',
          message: e.message || 'Incorrect password?'
        }
      });
      window.dispatchEvent(evt);
    } finally {
      setIsProcessing(false);
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
              {wallets
                .filter((w) => !w.metadata.hidden)
                .map((wallet, index, visibleWallets) => {
                  const isActive = wallet.metadata.walletId === activeWalletId;
                  const isImported = wallet.metadata.walletType === 'IMPORTED' || !wallet.mnemonic;

                  return (
                    <div
                      key={wallet.metadata.walletId}
                      onClick={() => handleOpenModalForSwitch(wallet.metadata.walletId)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1.125rem 1.5rem',
                        borderBottom:
                          index < visibleWallets.length - 1
                            ? '1px solid rgba(255, 255, 255, 0.04)'
                            : 'none',
                        cursor: 'pointer',
                        background: isActive ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (!isActive)
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
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
                          title="Copy Address"
                        >
                          {copiedId === wallet.metadata.walletId ? (
                            <Check size={14} />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModalForHide(wallet.metadata.walletId);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#8A8A93',
                            cursor: 'pointer',
                            padding: '0.25rem'
                          }}
                          title="Hide Account"
                        >
                          <HideIcon size={14} />
                        </button>

                        {!isImported && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModalForDelete(wallet.metadata.walletId);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              padding: '0.25rem'
                            }}
                            title="Delete Account"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}

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
              onClick={handleOpenModalForCreate}
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

      {/* Password Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(24px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                background: 'rgba(24, 24, 27, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 32px 64px -16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                borderRadius: '24px',
                padding: '2.5rem 2rem',
                width: '100%',
                maxWidth: '420px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Subtle background glow */}
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
                      color: '#ffffff'
                    }}
                  >
                    {pendingAction === 'SWITCH'
                      ? 'Switch Account'
                      : pendingAction === 'HIDE'
                        ? 'Hide Account'
                        : pendingAction === 'DELETE'
                          ? 'Delete Account'
                          : 'Create Account'}
                  </h2>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#8A8A93' }}>
                    Enter your Vault password to authorize.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    color: '#8A8A93',
                    cursor: 'pointer',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = '#8A8A93';
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {pendingAction === 'CREATE' && (
                <div
                  style={{
                    background: 'rgba(59, 130, 246, 0.05)',
                    borderLeft: '2px solid #3B82F6',
                    padding: '1rem 1.25rem',
                    borderRadius: '0 8px 8px 0',
                    zIndex: 1
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#93C5FD', lineHeight: 1.5 }}>
                    This derives a new account from your existing Secret Recovery Phrase.
                  </p>
                </div>
              )}

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
                      e.currentTarget.style.borderBottomColor = '#ffffff';
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
                      color: '#8A8A93',
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
                    background: isProcessing || !password ? 'rgba(255,255,255,0.05)' : '#ffffff',
                    border: 'none',
                    borderRadius: '100px',
                    color: isProcessing || !password ? '#52525b' : '#000000',
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
