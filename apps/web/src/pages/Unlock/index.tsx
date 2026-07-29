import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../../hooks/index.js';
import { ArrowRight, Check } from 'lucide-react';
import { Logo } from '../../components/Logo/index.js';

export default function Unlock() {
  const navigate = useNavigate();
  const { unlock, isLocked, hasVault } = useWallet();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!hasVault) navigate('/create-wallet');
    else if (!isLocked) navigate('/dashboard');
  }, [hasVault, isLocked, navigate]);

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isUnlocking || isSuccess) return;
    if (!password) return;

    setError(null);
    setIsUnlocking(true);

    try {
      await new Promise((r) => setTimeout(r, 600));
      await unlock(password);
      setIsUnlocking(false);
      setIsSuccess(true);
      await new Promise((r) => setTimeout(r, 500));
      navigate('/dashboard');
    } catch (err: any) {
      setError('Incorrect password');
      setPassword('');
      setIsUnlocking(false);
      setIsSuccess(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'transparent',
        color: 'var(--color-text-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Luxury OS style backdrop */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '400px'
        }}
      >
        <div style={{ marginBottom: '4rem' }}>
          <Logo size="lg" />
        </div>

        <form
          onSubmit={handleUnlock}
          style={{ width: '100%', position: 'relative', display: 'flex', justifyContent: 'center' }}
        >
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            placeholder="Enter Password"
            autoFocus
            disabled={isUnlocking || isSuccess}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: error
                ? '1px solid #FF453A'
                : isSuccess
                  ? '1px solid #34C759'
                  : '1px solid rgba(255,255,255,0.2)',
              padding: '1rem 2.5rem',
              fontSize: '1.5rem',
              color: isSuccess ? 'var(--color-success)' : 'var(--color-text-primary)',
              outline: 'none',
              textAlign: 'center',
              transition: 'border-color 0.3s, opacity 0.3s, color 0.3s, box-shadow 0.3s',
              fontFamily: 'var(--font-sans)',
              opacity: isUnlocking || isSuccess ? 0.7 : 1,
              letterSpacing: password.length > 0 ? '0.2em' : 'normal'
            }}
            onFocus={(e) => {
              if (!error && !isSuccess) {
                e.currentTarget.style.borderBottomColor = 'var(--color-text-primary)';
                e.currentTarget.style.boxShadow = '0 4px 12px var(--color-surface)';
              }
            }}
            onBlur={(e) => {
              if (!error && !isSuccess) {
                e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          />

          <AnimatePresence>
            {password.length > 0 && !isUnlocking && !isSuccess && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                type="submit"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: 'calc(50% - 4px)',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  color: 'var(--color-text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  padding: '8px',
                  opacity: 0.6,
                  transition: 'opacity 0.2s, transform 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(-50%) translateX(2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '0.6';
                  e.currentTarget.style.transform = 'translateY(-50%) translateX(0)';
                }}
              >
                <ArrowRight size={20} strokeWidth={1.5} />
              </motion.button>
            )}

            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Check size={20} strokeWidth={2} />
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <div
          style={{
            height: '2rem',
            marginTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {error && (
            <motion.span
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: '#FF453A', fontSize: '0.875rem', letterSpacing: '0.05em' }}
            >
              {error}
            </motion.span>
          )}
          {isUnlocking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.2)',
                borderTopColor: 'var(--color-text-primary)',
                animation: 'spin 1s linear infinite'
              }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
