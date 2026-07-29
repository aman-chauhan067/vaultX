import React from 'react';
import { LandingHero } from './components/LandingHero.js';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LandingNavbar = () => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 'fit-content',
        minWidth: '400px',
        height: '64px',
        padding: '0 24px',
        background: 'rgba(17, 11, 56, 0.4)',
        backdropFilter: 'blur(24px)',
        borderRadius: '999px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}
    >
      <div
        style={{ fontFamily: 'var(--font-brand)', fontSize: '24px', cursor: 'pointer' }}
        onClick={() => window.scrollTo(0, 0)}
      >
        VaultX
      </div>

      <div
        style={{
          display: 'flex',
          gap: '32px',
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--color-text-secondary)'
        }}
      >
        <span
          style={{ cursor: 'pointer', transition: 'color 0.2s' }}
          onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          Features
        </span>
        <span
          style={{ cursor: 'pointer', transition: 'color 0.2s' }}
          onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          Security
        </span>
      </div>

      <div
        style={{
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          color: '#fff',
          background: 'rgba(255,255,255,0.1)',
          padding: '8px 16px',
          borderRadius: '999px',
          transition: 'background 0.2s'
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
        onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
        onClick={() => navigate('/dashboard')}
      >
        Launch App
      </div>
    </motion.div>
  );
};

export default function Landing() {
  return (
    <>
      <LandingNavbar />
      <LandingHero />
    </>
  );
}
