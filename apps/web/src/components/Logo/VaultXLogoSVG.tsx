import React from 'react';

export interface VaultXLogoSVGProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * VaultXLogoSVG — Pure inline SVG logo.
 * Scales infinitely without quality loss.
 * Automatically adapts to light/dark theme via CSS variables.
 */
export const VaultXLogoSVG: React.FC<VaultXLogoSVGProps> = ({ size = 32, className, style }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0, display: 'block', ...style }}
      aria-label="VaultX Logo"
      role="img"
    >
      {/* Outer shield / vault body */}
      <path
        d="M32 4 L56 16 L56 36 C56 50 32 60 32 60 C32 60 8 50 8 36 L8 16 Z"
        fill="var(--logo-fill-outer, rgba(255,255,255,0.08))"
        stroke="var(--logo-stroke, rgba(255,255,255,0.25))"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Inner V shape — primary brand mark */}
      <path
        d="M20 22 L32 44 L44 22"
        stroke="var(--logo-v-color, #ffffff)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Subtle inner V highlight */}
      <path
        d="M24 22 L32 38 L40 22"
        stroke="var(--logo-v-highlight, rgba(255,255,255,0.35))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Top accent line */}
      <line
        x1="20"
        y1="22"
        x2="44"
        y2="22"
        stroke="var(--logo-v-color, #ffffff)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
};
