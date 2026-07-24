import React from 'react';
import { BackButton } from '../../components/index.js';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Key, Smartphone, AlertTriangle, EyeOff } from 'lucide-react';
import { useActiveWallet } from '../../hooks/index.js';

export default function Security() {
  const navigate = useNavigate();
  const activeWallet = useActiveWallet();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'transparent',
        color: 'var(--color-text-primary)',
        padding: '0 5vw',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2rem 0',
          borderBottom: '1px solid var(--glass-border-light)'
        }}
      >
        <BackButton />
      </motion.div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
          marginTop: '10vh',
          paddingBottom: '10vh'
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 300,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              marginBottom: '4rem'
            }}
          >
            Security Center
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}
        >
          <motion.div
            variants={itemVariants}
            style={{
              background: 'rgba(52, 199, 89, 0.05)',
              border: '1px solid rgba(52, 199, 89, 0.2)',
              borderRadius: '16px',
              padding: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem'
            }}
          >
            <ShieldCheck size={32} color="var(--color-success)" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--color-success)' }}>
                Account is Secure
              </span>
              <span
                style={{
                  fontSize: '1rem',
                  color: 'var(--color-text-secondary)',
                  marginTop: '0.5rem'
                }}
              >
                Your recovery phrase is backed up and password is strong.
              </span>
            </div>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-text-muted)',
                paddingLeft: '1rem'
              }}
            >
              Authentication
            </span>
            <motion.div
              variants={itemVariants}
              style={{
                background: 'var(--color-surface)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              <div
                onClick={() => navigate('/security/password')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.5rem',
                  borderBottom: '1px solid var(--glass-border-light)',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--color-surface)')
                }
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Key
                  size={24}
                  color="var(--color-text-secondary)"
                  style={{ marginRight: '1.5rem' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 400 }}>Change Password</span>
                </div>
              </div>

              <div
                onClick={() => navigate('/security/2fa')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.5rem',
                  borderBottom: '1px solid var(--glass-border-light)',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--color-surface)')
                }
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Smartphone
                  size={24}
                  color="var(--color-text-secondary)"
                  style={{ marginRight: '1.5rem' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 400 }}>
                    Two-Factor Authentication
                  </span>
                </div>
                <span
                  style={{
                    padding: '0.25rem 0.75rem',
                    background: 'var(--color-border-primary)',
                    borderRadius: '100px',
                    fontSize: '0.75rem'
                  }}
                >
                  Disabled
                </span>
              </div>

              <div
                onClick={() => navigate('/security/hidden-accounts')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--color-surface)')
                }
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <EyeOff
                  size={24}
                  color="var(--color-text-secondary)"
                  style={{ marginRight: '1.5rem' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 400 }}>Hidden Accounts</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-text-muted)',
                paddingLeft: '1rem'
              }}
            >
              Danger Zone
            </span>
            <motion.div
              variants={itemVariants}
              style={{
                background: 'var(--color-surface)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              <div
                onClick={() => navigate('/security/recovery')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = 'rgba(255, 69, 58, 0.1)')
                }
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <AlertTriangle size={24} color="#FF453A" style={{ marginRight: '1.5rem' }} />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 400, color: '#FF453A' }}>
                    Reveal Recovery Phrase
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
