import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveWallet, useNetwork } from '../../hooks/index.js';
import { QrCode, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { BackButton } from '../../components/index.js';

export default function Receive() {
  const navigate = useNavigate();
  const activeWallet = useActiveWallet();
  const { activeChainId, supportedNetworks } = useNetwork();
  const activeNetwork = supportedNetworks.find((n) => n.chainId === activeChainId);
  const [copied, setCopied] = useState(false);

  const address = activeWallet?.address || '';

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    // Dispatch toast
    const evt = new CustomEvent('toast', {
      detail: { type: 'success', message: 'Wallet address copied' }
    });
    window.dispatchEvent(evt);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!address) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'VaultX Public Address',
          text: `Here is my VaultX public address for ${activeNetwork?.name || 'Ethereum'}: ${address}`
        });
      } else {
        throw new Error('Web Share API unsupported');
      }
    } catch (e) {
      // Fallback to clipboard
      handleCopy();
    }
  };

  const handleCancel = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCopy();
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
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
      {/* Top Nav - Level 4 Metadata */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2rem 0',
          borderBottom: '1px solid var(--glass-border-light)'
        }}
      >
        <BackButton label="Cancel" onClick={handleCancel} />
        <div
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-text-secondary)'
          }}
        >
          Receive {activeNetwork?.name}
        </div>
      </motion.div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '-10vh'
        }}
      >
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.2 } } }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4rem' }}
        >
          {/* Level 1: The QR Code */}
          <motion.div variants={itemVariants} style={{ position: 'relative' }}>
            <div
              style={{
                width: 'clamp(280px, 40vw, 400px)',
                height: 'clamp(280px, 40vw, 400px)',
                background: 'var(--color-text-primary)',
                padding: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 60px var(--glass-border-light)'
              }}
            >
              {address ? (
                <QRCodeSVG
                  value={address}
                  size={280}
                  style={{ width: '100%', height: '100%' }}
                  level="M"
                  includeMargin={false}
                />
              ) : (
                <QrCode size="100%" strokeWidth={1.5} color="var(--color-bg-primary)" />
              )}
            </div>
          </motion.div>

          {/* Level 2: The Address & Actions */}
          <motion.div
            variants={itemVariants}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              maxWidth: '600px',
              textAlign: 'center'
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: 'var(--color-text-secondary)'
              }}
            >
              Public Address
            </span>
            <div
              role="button"
              tabIndex={0}
              onClick={handleCopy}
              onKeyDown={handleKeyDown}
              aria-label="Copy public address"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                lineHeight: 1.2,
                fontWeight: 300,
                wordBreak: 'break-all',
                cursor: 'pointer',
                color: copied ? '#4ade80' : 'var(--color-text-primary)',
                transition: 'color 0.3s',
                outline: 'none',
                border: 'none',
                background: 'transparent',
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-md)'
              }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.2)')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              {address}
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span
                aria-live="polite"
                style={{
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: copied ? '#4ade80' : 'var(--color-text-secondary)',
                  transition: 'color 0.3s'
                }}
              >
                {copied ? 'Address Copied' : 'Click address to copy'}
              </span>
              <span style={{ color: 'var(--color-text-secondary)' }}>|</span>
              <button
                onClick={handleShare}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--color-text-primary)',
                  outline: 'none'
                }}
              >
                Share
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
