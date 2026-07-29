import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../design-system/index.js';
import { PremiumBackground } from '../../../components/background/PremiumBackground/index.js';

export const LandingHero: React.FC = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: 'var(--color-text-primary)'
      }}
    >
      {/* Huge empty breathing space / Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.2 }} />
      <PremiumBackground enabled={true} />

      <motion.div style={{ opacity }} className="hero-container">
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            maxWidth: '1440px',
            margin: '0 auto',
            width: '100%',
            padding: '72px 96px 96px',
            minHeight: '100vh',
            pointerEvents: 'none'
          }}
        >
          {/* Brand Label */}
          <motion.h1
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-brand)',
              fontSize: 'clamp(72px, 8vw, 144px)',
              fontWeight: 'normal',
              letterSpacing: '-0.05em',
              lineHeight: 0.9,
              margin: 0,
              background: 'linear-gradient(135deg, #FFF 0%, #A19BCC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              paddingRight: '0.1em'
            }}
          >
            VaultX
          </motion.h1>

          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(72px, 7vw, 128px)',
              fontWeight: 800,
              lineHeight: 0.92,
              maxWidth: '760px',
              letterSpacing: '-0.06em',
              margin: '24px 0 0 0'
            }}
          >
            Own your web3.
          </motion.h2>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: '22px',
              color: 'var(--color-text-secondary)',
              marginTop: '32px',
              maxWidth: '560px',
              lineHeight: '36px',
              fontWeight: 400
            }}
          >
            A premium consumer wallet designed for the next generation of digital asset ownership.
            Secure, fast, and remarkably intuitive.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '48px',
              pointerEvents: 'auto'
            }}
          >
            <div style={{ width: '180px' }}>
              <Button variant="primary" fullWidth onClick={() => navigate('/create-wallet')}>
                Create Wallet
              </Button>
            </div>
            <div style={{ width: '180px' }}>
              <Button variant="secondary" fullWidth onClick={() => navigate('/import-wallet')}>
                Import Wallet
              </Button>
            </div>
          </motion.div>

          {/* Editorial Floating Elements (Asymmetry) */}
          <motion.div
            style={{
              position: 'absolute',
              right: '10%',
              top: '40%',
              y: y1,
              fontFamily: 'var(--font-brand)',
              fontSize: '120px',
              color: 'rgba(255,255,255,0.03)',
              pointerEvents: 'none',
              lineHeight: 0.8
            }}
          >
            SECURE
          </motion.div>
          <motion.div
            style={{
              position: 'absolute',
              right: '20%',
              bottom: '10%',
              y: y2,
              fontFamily: 'var(--font-brand)',
              fontSize: '144px',
              color: 'rgba(255,255,255,0.03)',
              pointerEvents: 'none',
              lineHeight: 0.8
            }}
          >
            CRYPTO
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
