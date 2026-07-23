import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Key, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { BackButton } from '../../components/index.js';
import { useWallet } from '../../hooks/index.js';
import { VaultXService } from '../../services/VaultXService.js';
import { ethers } from 'ethers';

type ImportStage = 'intro' | 'phrase' | 'privateKey' | 'password';

export default function ImportWallet() {
  const navigate = useNavigate();
  const { createVault, createWallet, importWallet } = useWallet();

  const [stage, setStage] = useState<ImportStage>('intro');
  const [phraseWords, setPhraseWords] = useState<string[]>(Array(12).fill(''));
  const [privateKey, setPrivateKey] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handlePhraseWordChange = (index: number, value: string) => {
    const newWords = [...phraseWords];

    // Handle paste
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

  const handlePhraseSubmit = () => {
    const phrase = phraseWords.join(' ');
    const isValid = ethers.Mnemonic.isValidMnemonic(phrase);
    if (!isValid) {
      setError('Invalid recovery phrase');
      return;
    }
    setStage('password');
  };

  const handlePrivateKeySubmit = () => {
    try {
      new ethers.Wallet(privateKey);
      setStage('password');
    } catch {
      setError('Invalid private key format');
    }
  };

  const handleImport = async () => {
    if (isImporting) return;
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsImporting(true);
    setError('');

    try {
      await new Promise((r) => setTimeout(r, 1000));
      await createVault(password);
      if (phraseWords.join(' ').trim().length > 20) {
        await createWallet(phraseWords.join(' '), 'Imported Account');
      } else {
        await importWallet(privateKey, 'Imported Account');
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to import wallet');
      setIsImporting(false);
    }
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'transparent',
        color: 'var(--color-text-primary)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2rem 5vw',
          zIndex: 10
        }}
      >
        <BackButton
          label={stage === 'intro' ? 'Cancel' : 'Back'}
          onClick={() => (stage === 'intro' ? navigate(-1) : setStage('intro'))}
        />
        <div
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#56565C'
          }}
        >
          Import
        </div>
      </motion.div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 5vw',
          zIndex: 10
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
              transition={{ duration: 0.6 }}
              style={{
                maxWidth: '600px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(2rem, 8vw, 5rem)',
                  fontWeight: 300,
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  marginBottom: '2rem',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                Restore your access
              </div>
              <p
                style={{
                  fontSize: '1rem',
                  color: '#8A8A93',
                  marginBottom: '4rem',
                  maxWidth: '100%',
                  wordWrap: 'break-word'
                }}
              >
                Import an existing wallet using a recovery phrase or a private key.
              </p>
              <div
                style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}
              >
                <div
                  onClick={() => setStage('phrase')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem 3rem',
                    borderRadius: '100px',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    transition: 'transform 0.3s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  Recovery Phrase <ArrowRight size={18} />
                </div>
                <div
                  onClick={() => setStage('privateKey')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem 3rem',
                    borderRadius: '100px',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    transition: 'transform 0.3s, background 0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Private Key
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
              transition={{ duration: 0.6 }}
              style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <div
                style={{
                  fontSize: 'clamp(2rem, 8vw, 4rem)',
                  fontWeight: 300,
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  marginBottom: '1rem',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                Recovery Phrase
              </div>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: '#8A8A93',
                  marginBottom: '4rem',
                  maxWidth: '100%',
                  wordWrap: 'break-word'
                }}
              >
                Enter your 12-word secret recovery phrase.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '4rem'
                }}
              >
                {phraseWords.map((word, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: error ? '1px solid #FF453A' : '1px solid rgba(255,255,255,0.2)',
                      paddingBottom: '0.5rem'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#56565C',
                        width: '24px',
                        marginRight: '0.5rem',
                        display: 'inline-block'
                      }}
                    >
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={word}
                      onChange={(e) => handlePhraseWordChange(i, e.target.value)}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-primary)',
                        fontSize: '1.25rem',
                        outline: 'none'
                      }}
                      autoCapitalize="none"
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div
                  onClick={handlePhraseSubmit}
                  style={{
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem 3rem',
                    borderRadius: '100px',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    transition: 'transform 0.3s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  Verify <ArrowRight size={18} />
                </div>
                {error && <span style={{ color: '#FF453A', fontSize: '0.875rem' }}>{error}</span>}
              </div>
            </motion.div>
          )}

          {stage === 'privateKey' && (
            <motion.div
              key="privateKey"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.6 }}
              style={{ maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <div
                style={{
                  fontSize: 'clamp(2rem, 8vw, 4rem)',
                  fontWeight: 300,
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  marginBottom: '1rem',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                Private Key
              </div>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: '#8A8A93',
                  marginBottom: '4rem',
                  maxWidth: '100%',
                  wordWrap: 'break-word'
                }}
              >
                Enter your 64-character private key.
              </p>

              <div style={{ marginBottom: '4rem' }}>
                <input
                  type="password"
                  value={privateKey}
                  onChange={(e) => {
                    setPrivateKey(e.target.value);
                    setError('');
                  }}
                  placeholder="0x..."
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: error ? '1px solid #FF453A' : '1px solid rgba(255,255,255,0.2)',
                    padding: '1rem 0',
                    fontSize: '1.5rem',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    fontFamily: 'var(--font-mono)'
                  }}
                  onFocus={(e) => {
                    if (!error) e.currentTarget.style.borderBottomColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    if (!error) e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.2)';
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div
                  onClick={handlePrivateKeySubmit}
                  style={{
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem 3rem',
                    borderRadius: '100px',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    transition: 'transform 0.3s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  Verify <ArrowRight size={18} />
                </div>
                {error && <span style={{ color: '#FF453A', fontSize: '0.875rem' }}>{error}</span>}
              </div>
            </motion.div>
          )}

          {stage === 'password' && (
            <motion.div
              key="password"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.6 }}
              style={{ maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <div
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontWeight: 300,
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  marginBottom: '1rem'
                }}
              >
                Secure access
              </div>
              <p style={{ fontSize: '1rem', color: '#8A8A93', marginBottom: '4rem' }}>
                Create a password to encrypt this wallet on your device.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3rem',
                  marginBottom: '4rem'
                }}
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="New Password"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    padding: '1rem 0',
                    fontSize: '1.5rem',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = '#ffffff')}
                  onBlur={(e) =>
                    (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.2)')
                  }
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Confirm Password"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    padding: '1rem 0',
                    fontSize: '1.5rem',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = '#ffffff')}
                  onBlur={(e) =>
                    (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.2)')
                  }
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div
                  onClick={handleImport}
                  style={{
                    opacity: isImporting ? 0.5 : 1,
                    pointerEvents: isImporting ? 'none' : 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem 3rem',
                    borderRadius: '100px',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    transition: 'transform 0.3s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {isImporting ? 'Importing...' : 'Import Wallet'} <ArrowRight size={18} />
                </div>
                {error && <span style={{ color: '#FF453A', fontSize: '0.875rem' }}>{error}</span>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
