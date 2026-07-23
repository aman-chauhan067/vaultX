import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const LandingHero: React.FC = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const y3 = useTransform(scrollY, [0, 1000], [0, 100]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
        color: '#f4f4f5',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridTemplateRows: 'repeat(12, 1fr)'
      }}
    >
      {/* Massive Watermark Typography */}
      <motion.div
        style={{
          position: 'absolute',
          top: '10%',
          left: '-5%',
          fontSize: '32vw',
          fontWeight: 900,
          lineHeight: 0.8,
          letterSpacing: '-0.08em',
          color: 'rgba(255, 255, 255, 0.02)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          y: y1,
          fontFamily: 'var(--font-brand)'
        }}
      >
        VAULTX
      </motion.div>

      {/* Hero Content - Broken Grid Placement */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        style={{
          gridColumn: '4 / 11',
          gridRow: '4 / 8',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          mixBlendMode: 'difference'
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(4rem, 10vw, 12rem)',
            fontWeight: 400,
            lineHeight: 0.85,
            letterSpacing: '-0.06em',
            margin: 0,
            textTransform: 'uppercase',
            fontFamily: 'var(--font-brand)'
          }}
        >
          Unseen
          <br />
          <span style={{ paddingLeft: '15%', fontStyle: 'italic', fontWeight: 300 }}>Control.</span>
        </h1>
      </motion.div>

      {/* Asymmetric Supporting Text */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        style={{
          gridColumn: '2 / 5',
          gridRow: '8 / 10',
          zIndex: 10,
          paddingTop: '2rem'
        }}
      >
        <p
          style={{
            fontSize: '1.25rem',
            lineHeight: 1.6,
            fontWeight: 300,
            color: '#a1a1aa',
            margin: 0,
            maxWidth: '300px'
          }}
        >
          The definitive web3 vault. An immaculate interface for your digital sovereignty, stripped
          of the unessential.
        </p>
      </motion.div>

      {/* Floating CTA Group - Offset */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        style={{
          gridColumn: '9 / 12',
          gridRow: '7 / 9',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '1rem',
          zIndex: 20,
          y: y2
        }}
      >
        <div
          onClick={() => navigate('/create-wallet')}
          style={{
            padding: '1.5rem 3rem',
            backgroundColor: '#ffffff',
            color: '#000000',
            fontSize: '1.125rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            borderRadius: '0px',
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
            transition: 'transform 0.3s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          Initialize
        </div>
        <div
          onClick={() => navigate('/import-wallet')}
          style={{
            padding: '1rem 2rem',
            color: 'var(--color-text-primary)',
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            position: 'relative',
            opacity: 0.6,
            transition: 'opacity 0.3s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '0.6')}
        >
          Restore Access
          <div
            style={{
              position: 'absolute',
              bottom: '0.5rem',
              left: '2rem',
              right: '2rem',
              height: '1px',
              backgroundColor: '#ffffff'
            }}
          />
        </div>
      </motion.div>

      {/* Abstract Graphic Element */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '20%',
          width: '40vw',
          height: '40vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          y: y3
        }}
      />
    </div>
  );
};
