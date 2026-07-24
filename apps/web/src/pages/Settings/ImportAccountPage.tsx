import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { BackButton } from '../../components/index.js';
import { useWallet } from '../../hooks/index.js';
import { ethers } from 'ethers';

type ImportStage = 'intro' | 'phrase' | 'privateKey' | 'success';

export function ImportAccountPage() {
  const navigate = useNavigate();
  const { createWallet, importWallet } = useWallet();

  const [stage, setStage] = useState<ImportStage>('intro');
  const [phraseWords, setPhraseWords] = useState<string[]>(Array(12).fill(''));
  const [privateKey, setPrivateKey] = useState('');

  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importedAddress, setImportedAddress] = useState('');

  const handlePhraseWordChange = (index: number, value: string) => {
    const newWords = [...phraseWords];

    if (value.includes(' ')) {
      const pastedWords = value.trim().split(/\s+/);
      for (let i = 0; i < pastedWords.length && index + i < 12; i++) {
        const word = pastedWords[i];
        if (word) {
          newWords[index + i] = word.toLowerCase();
        }
      }
    } else {
      newWords[index] = value.trim().toLowerCase();
    }

    setPhraseWords(newWords);
    setError('');
  };

  const handlePhraseSubmit = async () => {
    if (isImporting) return;
    const phrase = phraseWords.join(' ');
    const isValid = ethers.Mnemonic.isValidMnemonic(phrase);
    if (!isValid) {
      setError('Invalid recovery phrase');
      return;
    }

    setIsImporting(true);
    setError('');

    try {
      // Small delay for UI
      await new Promise((r) => setTimeout(r, 500));
      await createWallet(phrase, 'Imported Account');

      const evt = new CustomEvent('toast', {
        detail: { type: 'success', message: 'Account imported successfully' }
      });
      window.dispatchEvent(evt);

      const tempWallet = ethers.Wallet.fromPhrase(phrase);
      setImportedAddress(tempWallet.address);
      setStage('success');
    } catch (err: any) {
      setError(err.message || 'Failed to import account');
    } finally {
      setIsImporting(false);
    }
  };

  const handlePrivateKeySubmit = async () => {
    if (isImporting) return;
    if (!privateKey.trim()) {
      setError('Private key is required');
      return;
    }

    setIsImporting(true);
    setError('');

    try {
      // Validate
      const tempWallet = new ethers.Wallet(privateKey.trim());

      await new Promise((r) => setTimeout(r, 500));
      await importWallet(privateKey.trim(), 'Imported Account');

      const evt = new CustomEvent('toast', {
        detail: { type: 'success', message: 'Account imported successfully' }
      });
      window.dispatchEvent(evt);

      setImportedAddress(tempWallet.address);
      setStage('success');
    } catch (err: any) {
      setError('Invalid private key format');
    } finally {
      setIsImporting(false);
    }
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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
          borderBottom: '1px solid var(--color-border-secondary)'
        }}
      >
        <BackButton
          label={stage === 'intro' ? 'Cancel' : 'Back'}
          onClick={() => {
            if (stage === 'intro' || stage === 'success') {
              navigate(-1);
            } else {
              setStage('intro');
              setError('');
            }
          }}
        />
        <span
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-text-muted)'
          }}
        >
          Import Account
        </span>
      </motion.div>

      <div
        style={{
          flex: 1,
          maxWidth: '560px',
          margin: '0 auto',
          width: '100%',
          paddingTop: '6vh',
          paddingBottom: '6vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <AnimatePresence mode="wait">
          {stage === 'intro' && (
            <motion.div
              key="intro"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2.5rem'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h1
                  style={{
                    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                    fontWeight: 300,
                    letterSpacing: '-0.02em',
                    margin: 0
                  }}
                >
                  Import Account
                </h1>
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    margin: 0
                  }}
                >
                  Add an existing account to your vault using its recovery phrase or private key.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  onClick={() => setStage('phrase')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    background: 'var(--color-surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--color-border-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    e.currentTarget.style.background = 'var(--color-surface-hover)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                    e.currentTarget.style.background = 'var(--color-surface)';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      Recovery Phrase
                    </span>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-text-secondary)',
                        marginTop: '0.25rem'
                      }}
                    >
                      Import using a 12-word seed phrase
                    </span>
                  </div>
                  <ArrowRight size={20} color="var(--color-text-secondary)" />
                </div>

                <div
                  onClick={() => setStage('privateKey')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    background: 'var(--color-surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--color-border-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    e.currentTarget.style.background = 'var(--color-surface-hover)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                    e.currentTarget.style.background = 'var(--color-surface)';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      Private Key
                    </span>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-text-secondary)',
                        marginTop: '0.25rem'
                      }}
                    >
                      Import using a 64-character private key
                    </span>
                  </div>
                  <ArrowRight size={20} color="var(--color-text-secondary)" />
                </div>
              </div>
            </motion.div>
          )}

          {stage === 'phrase' && (
            <motion.div
              key="phrase"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              style={{ width: '100%' }}
            >
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '0.5rem' }}>
                  Recovery Phrase
                </h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  Enter your 12-word phrase in the correct order.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem'
                }}
              >
                {phraseWords.map((word, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.875rem'
                      }}
                    >
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={word}
                      onChange={(e) => handlePhraseWordChange(index, e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border-primary)',
                        borderRadius: '8px',
                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                        color: 'var(--color-text-primary)',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--color-info)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--color-border-primary)')}
                    />
                  </div>
                ))}
              </div>

              {error && (
                <div
                  style={{
                    color: 'var(--color-danger)',
                    fontSize: '0.875rem',
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                  }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={handlePhraseSubmit}
                disabled={isImporting || phraseWords.some((w) => !w)}
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: phraseWords.some((w) => !w)
                    ? 'var(--color-surface)'
                    : 'var(--color-brand-primary)',
                  color: phraseWords.some((w) => !w)
                    ? 'var(--color-text-muted)'
                    : 'var(--color-text-inverse)',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: phraseWords.some((w) => !w) || isImporting ? 'not-allowed' : 'pointer',
                  opacity: isImporting ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {isImporting ? 'Importing...' : 'Import Account'}
              </button>
            </motion.div>
          )}

          {stage === 'privateKey' && (
            <motion.div
              key="privateKey"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              style={{ width: '100%' }}
            >
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '0.5rem' }}>
                  Private Key
                </h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  Paste your 64-character private key.
                </p>
              </div>

              <textarea
                value={privateKey}
                onChange={(e) => {
                  setPrivateKey(e.target.value);
                  setError('');
                }}
                placeholder="Enter private key (e.g. 0x123...)"
                style={{
                  width: '100%',
                  height: '120px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  color: 'var(--color-text-primary)',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  outline: 'none',
                  resize: 'none',
                  marginBottom: '1.5rem',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-info)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--color-border-primary)')}
              />

              {error && (
                <div
                  style={{
                    color: 'var(--color-danger)',
                    fontSize: '0.875rem',
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                  }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={handlePrivateKeySubmit}
                disabled={isImporting || !privateKey}
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: !privateKey ? 'var(--color-surface)' : 'var(--color-brand-primary)',
                  color: !privateKey ? 'var(--color-text-muted)' : 'var(--color-text-inverse)',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: !privateKey || isImporting ? 'not-allowed' : 'pointer',
                  opacity: isImporting ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {isImporting ? 'Importing...' : 'Import Account'}
              </button>
            </motion.div>
          )}

          {stage === 'success' && (
            <motion.div
              key="success"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                paddingTop: '2rem'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--color-success-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem'
                }}
              >
                <CheckCircle2 size={32} color="var(--color-success)" />
              </div>

              <h1 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '1rem' }}>Success!</h1>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                Account imported successfully.
              </p>

              <div
                style={{
                  background: 'var(--color-surface)',
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border-secondary)',
                  marginBottom: '3rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: 'var(--color-info)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                >
                  I
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {formatAddress(importedAddress)}
                </span>
              </div>

              <button
                onClick={() => navigate('/settings/profile')}
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: 'var(--color-brand-primary)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Back to Accounts
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
