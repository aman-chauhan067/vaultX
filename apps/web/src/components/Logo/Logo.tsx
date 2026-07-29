import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { VaultXLogoSVG } from './VaultXLogoSVG.js';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', withText = true, className }) => {
  // Size mapping
  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 36,
    xl: 52
  };

  const textSizes = {
    sm: '1rem',
    md: '1.25rem',
    lg: '1.5rem',
    xl: '2rem'
  };

  const iconSize = iconSizes[size];

  return (
    <div
      className={clsx('vaultx-logo-container', className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '8px' : '12px'
      }}
    >
      <motion.div
        className="vaultx-logo-icon"
        whileHover={{
          filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))',
          scale: 1.08
        }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <VaultXLogoSVG size={iconSize} />
      </motion.div>

      {withText && (
        <span
          className="vaultx-logo-text"
          style={{
            fontFamily: 'var(--font-brand)',
            fontSize: textSizes[size],
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: 'var(--color-text-primary)',
            lineHeight: 1,
            userSelect: 'none'
          }}
        >
          VaultX
        </span>
      )}
    </div>
  );
};
