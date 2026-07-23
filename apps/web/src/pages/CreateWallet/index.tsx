import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Key,
  Eye,
  EyeOff,
  FileText,
  CheckCircle,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react';
import { BackButton } from '../../components/index.js';
import { useWallet } from '../../hooks/index.js';
import { VaultXService } from '../../services/VaultXService.js';
import { ethers } from 'ethers';

type CreateStage = 'intro' | 'backup' | 'confirm' | 'password';

export default function CreateWallet() {
  const navigate = useNavigate();
  const { createVault, createWallet } = useWallet();
  const [stage, setStage] = useState<CreateStage>('intro');
  const [mnemonic, setMnemonic] = useState('');
  const [words, setWords] = useState<string[]>([]);

  // Confirm stage
  const [confirmIndices, setConfirmIndices] = useState<number[]>([]);
  const [confirmInputs, setConfirmInputs] = useState<Record<number, string>>({});

  // Password stage
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const startBackup = () => {
    const wallet = ethers.Wallet.createRandom();
    const phrase = wallet.mnemonic?.phrase || '';
    setMnemonic(phrase);
    setWords(phrase.split(' '));
    setStage('backup');
  };

  const startConfirm = () => {
    // pick 3 random indices to confirm
    const indices: number[] = [];
    while (indices.length < 3) {
      const r = Math.floor(Math.random() * 12);
      if (indices.indexOf(r) === -1) indices.push(r);
    }
    setConfirmIndices(indices.sort((a, b) => a - b));
    setConfirmInputs({});
    setError('');
    setStage('confirm');
  };

  const verifyConfirm = () => {
    for (const idx of confirmIndices) {
      if ((confirmInputs[idx] || '').trim().toLowerCase() !== words[idx]) {
        setError('Incorrect words. Please check your backup.');
        return;
      }
    }
    setError('');
    setStage('password');
  };

  const handleCreate = async () => {
    if (isCreating) return;
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsCreating(true);
    setError('');
    try {
      await new Promise((r) => setTimeout(r, 1000)); // luxury delay
      await createVault(password);
      await createWallet(mnemonic, 'Main Account');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create wallet');
      setIsCreating(false);
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
          onClick={() =>
            stage === 'intro'
              ? navigate(-1)
              : setStage(stage === 'backup' ? 'intro' : stage === 'confirm' ? 'backup' : 'confirm')
          }
        />
        <div
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#56565C'
          }}
        >
          Setup
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
                Secure your wealth
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
                You are about to generate a 12-word recovery phrase. This is the only way to recover
                your wallet.
              </p>
              <div
                onClick={startBackup}
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
                Generate Phrase <ArrowRight size={18} />
              </div>
            </motion.div>
          )}

          {stage === 'backup' && (
            <motion.div
              key="backup"
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
                Write this down
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
                Do not take a screenshot. Write these words on paper and keep them offline.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '4rem'
                }}
              >
                {words.map((word, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem 1.5rem',
                      borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: '#56565C', width: '24px' }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 400 }}>{word}</span>
                  </div>
                ))}
              </div>

              <div
                onClick={startConfirm}
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
                I saved it <ArrowRight size={18} />
              </div>
            </motion.div>
          )}

          {stage === 'confirm' && (
            <motion.div
              key="confirm"
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
                Verify backup
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
                Enter the missing words to confirm you saved them correctly.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2rem',
                  marginBottom: '4rem'
                }}
              >
                {confirmIndices.map((idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: error ? '1px solid #FF453A' : '1px solid rgba(255,255,255,0.2)',
                      paddingBottom: '0.5rem'
                    }}
                  >
                    <span style={{ fontSize: '0.875rem', color: '#8A8A93', width: '40px' }}>
                      Word {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={confirmInputs[idx] || ''}
                      onChange={(e) => {
                        setConfirmInputs((prev) => ({ ...prev, [idx]: e.target.value }));
                        setError('');
                      }}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-primary)',
                        fontSize: '1.5rem',
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
                  onClick={verifyConfirm}
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
                  fontSize: 'clamp(2rem, 8vw, 4rem)',
                  fontWeight: 300,
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  marginBottom: '1rem',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                Secure access
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
                Create a password to unlock your wallet on this device.
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
                  onClick={handleCreate}
                  style={{
                    opacity: isCreating ? 0.5 : 1,
                    pointerEvents: isCreating ? 'none' : 'auto',
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
                  {isCreating ? 'Creating...' : 'Create Wallet'} <ArrowRight size={18} />
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
