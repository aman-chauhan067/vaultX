import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useSettings } from '../../hooks/index.js';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'auto';
  withText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'auto',
  withText = true,
  className
}) => {
  const { theme } = useSettings();
  const isLight =
    theme === 'light' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);

  const logoSrc =
    variant === 'light'
      ? '/logolight.png'
      : variant === 'dark'
        ? '/logo.png'
        : isLight
          ? '/logolight.png'
          : '/logo.png';

  // Size mapping
  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
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
      <motion.img
        src={logoSrc}
        alt="VaultX Logo"
        className="vaultx-logo-icon"
        style={{
          width: iconSize * 1.5,
          height: iconSize * 1.5,
          objectFit: 'contain',
          flexShrink: 0
        }}
        whileHover={{
          filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))',
          scale: 1.05
        }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      />

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
