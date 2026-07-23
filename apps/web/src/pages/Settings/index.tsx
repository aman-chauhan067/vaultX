import React from 'react';
import { BackButton } from '../../components/index.js';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Sun, Globe, Shield, CreditCard, Bell, Smartphone, Key } from 'lucide-react';
import { useActiveWallet, useSettings } from '../../hooks/index.js';
import { useComingSoon } from '../../providers/ComingSoonProvider.js';
import { useTheme } from '../../theme/index.js';

export default function Settings() {
  const navigate = useNavigate();
  const activeWallet = useActiveWallet();
  const { showComingSoon } = useComingSoon();
  const { theme, setTheme } = useTheme();
  const { displayName, language } = useSettings();
  // We'll dispatch a custom toast event since we are auditing toasts
  const cycleTheme = () => {
    let nextTheme: 'light' | 'dark' | 'system' = 'dark';
    if (theme === 'dark') nextTheme = 'light';
    else if (theme === 'light') nextTheme = 'system';

    setTheme(nextTheme);

    // Dispatch toast
    const evt = new CustomEvent('toast', {
      detail: { type: 'success', message: `Appearance updated to ${nextTheme}` }
    });
    window.dispatchEvent(evt);
  };

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
          borderBottom: '1px solid rgba(255,255,255,0.05)'
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
            Settings
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#56565C',
                paddingLeft: '1rem'
              }}
            >
              Account
            </span>
            <motion.div
              variants={itemVariants}
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.5rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #34C759, #3B82F6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    marginRight: '1.5rem'
                  }}
                >
                  A
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 400 }}>{displayName}</span>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: '#8A8A93',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {activeWallet?.address || 'Not connected'}
                  </span>
                </div>
                <div
                  onClick={() => navigate('/settings/profile')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '100px',
                    background: 'rgba(255,255,255,0.1)',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Edit
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
                color: '#56565C',
                paddingLeft: '1rem'
              }}
            >
              Preferences
            </span>
            <motion.div
              variants={itemVariants}
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              <div
                onClick={() => navigate('/networks')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.5rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')
                }
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Globe size={24} color="#8A8A93" style={{ marginRight: '1.5rem' }} />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 400 }}>
                    Networks & Custom RPCs
                  </span>
                </div>
              </div>

              <div
                onClick={() => navigate('/settings/language')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.5rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')
                }
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Globe size={24} color="#8A8A93" style={{ marginRight: '1.5rem' }} />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 400 }}>Language & Region</span>
                </div>
                <span style={{ color: '#8A8A93', fontSize: '1rem' }}>
                  {language.split(' (')[0]}
                </span>
              </div>

              <div
                onClick={cycleTheme}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.5rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')
                }
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {theme === 'dark' ? (
                  <Moon size={24} color="#8A8A93" style={{ marginRight: '1.5rem' }} />
                ) : (
                  <Sun size={24} color="#8A8A93" style={{ marginRight: '1.5rem' }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 400 }}>Appearance</span>
                </div>
                <span style={{ color: '#8A8A93', fontSize: '1rem', textTransform: 'capitalize' }}>
                  {theme}
                </span>
              </div>

              <div
                onClick={() => navigate('/settings/notifications')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')
                }
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Bell size={24} color="#8A8A93" style={{ marginRight: '1.5rem' }} />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 400 }}>Notifications</span>
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
                color: '#56565C',
                paddingLeft: '1rem'
              }}
            >
              Security
            </span>
            <motion.div
              variants={itemVariants}
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              <div
                onClick={() => navigate('/security')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.5rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')
                }
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Shield size={24} color="#8A8A93" style={{ marginRight: '1.5rem' }} />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 400 }}>Security Center</span>
                </div>
              </div>

              <div
                onClick={() => navigate('/security/recovery')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.5rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')
                }
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Key size={24} color="#8A8A93" style={{ marginRight: '1.5rem' }} />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 400 }}>Recovery Phrase</span>
                </div>
              </div>

              <div
                onClick={() => navigate('/security/devices')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')
                }
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Smartphone size={24} color="#8A8A93" style={{ marginRight: '1.5rem' }} />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 400 }}>Connected Devices</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
