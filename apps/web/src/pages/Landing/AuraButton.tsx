import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/index.js';

export function AuraButton() {
  const { hasVault } = useWallet();
  const navigate = useNavigate();

  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    angle: Math.random() * Math.PI * 2,
    distance: 60 + Math.random() * 240, // Reduced radius for stars
    size: 1 + Math.random() * 3,
    duration: 6 + Math.random() * 6, // Slower star movement
    delay: Math.random() * 5
  }));

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '100px'
      }}
    >
      {/* Background Aura Wrapper (Fades and slides in gradually) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.6, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        {/* Subtle Central Radial Glow */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            background:
              'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 30%, transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Rotating Light Rays - Slowed down and softer */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.08) 10deg, transparent 20deg, rgba(255,255,255,0.04) 30deg, transparent 40deg, rgba(255,255,255,0.1) 50deg, transparent 60deg, rgba(255,255,255,0.04) 70deg, transparent 80deg, rgba(255,255,255,0.08) 90deg, transparent 100deg, rgba(255,255,255,0.04) 110deg, transparent 120deg, rgba(255,255,255,0.08) 130deg, transparent 140deg, rgba(255,255,255,0.04) 150deg, transparent 160deg, rgba(255,255,255,0.1) 170deg, transparent 180deg, rgba(255,255,255,0.04) 190deg, transparent 200deg, rgba(255,255,255,0.08) 210deg, transparent 220deg, rgba(255,255,255,0.04) 230deg, transparent 240deg, rgba(255,255,255,0.08) 250deg, transparent 260deg, rgba(255,255,255,0.04) 270deg, transparent 280deg, rgba(255,255,255,0.1) 290deg, transparent 300deg, rgba(255,255,255,0.04) 310deg, transparent 320deg, rgba(255,255,255,0.08) 330deg, transparent 340deg, rgba(255,255,255,0.04) 350deg, transparent 360deg)',
            maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 50%)',
            WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 50%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Secondary Counter-Rotating Light Rays */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            background:
              'conic-gradient(from 15deg, transparent 0deg, rgba(255,255,255,0.07) 15deg, transparent 30deg, rgba(255,255,255,0.03) 45deg, transparent 60deg, rgba(255,255,255,0.09) 75deg, transparent 90deg, rgba(255,255,255,0.05) 105deg, transparent 120deg, rgba(255,255,255,0.07) 135deg, transparent 150deg, rgba(255,255,255,0.03) 165deg, transparent 180deg, rgba(255,255,255,0.09) 195deg, transparent 210deg, rgba(255,255,255,0.05) 225deg, transparent 240deg, rgba(255,255,255,0.07) 255deg, transparent 270deg, rgba(255,255,255,0.03) 285deg, transparent 300deg, rgba(255,255,255,0.09) 315deg, transparent 330deg, rgba(255,255,255,0.05) 345deg, transparent 360deg)',
            maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 50%)',
            WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 50%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Twinkling Stars / Particles */}
        {particles.map((p) => {
          const targetX = Math.cos(p.angle) * p.distance;
          const targetY = Math.sin(p.angle) * p.distance;
          return (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x: [0, targetX],
                y: [0, targetY],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeOut'
              }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size,
                backgroundColor: 'rgba(255,255,255,0.6)',
                borderRadius: '50%',
                boxShadow: '0 0 6px 1px rgba(255,255,255,0.4)',
                pointerEvents: 'none',
                zIndex: 1
              }}
            />
          );
        })}
      </motion.div>

      {/* The Actual Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(hasVault ? '/dashboard' : '/create-wallet')}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1.25rem 2rem',
          borderRadius: '100px',
          backgroundColor: '#ffffff',
          color: '#000000',
          cursor: 'pointer',
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 700,
          transition: 'box-shadow 0.3s',
          zIndex: 10, // Above all effects
          boxShadow: '0 0 40px rgba(255,255,255,0.3), 0 0 15px rgba(255,255,255,0.4) inset'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow =
            '0 0 60px rgba(255,255,255,0.5), 0 0 15px rgba(255,255,255,0.5) inset';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow =
            '0 0 40px rgba(255,255,255,0.3), 0 0 15px rgba(255,255,255,0.4) inset';
        }}
      >
        Create Your Wallet <ArrowRight size={20} />
      </motion.div>
    </div>
  );
}
