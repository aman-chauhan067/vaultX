import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function BackButton({ label = 'Back', onClick, style }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={onClick || (() => navigate(-1))}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--color-text-secondary)',
        padding: '0.5rem 0',
        transition: 'color 0.3s ease',
        ...style
      }}
      onMouseOver={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
      onMouseOut={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
      onFocus={(e) => {
        e.currentTarget.style.color = 'var(--color-text-primary)';
        e.currentTarget.style.outline = '2px solid rgba(255, 255, 255, 0.2)';
        e.currentTarget.style.outlineOffset = '2px';
        e.currentTarget.style.borderRadius = '4px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.color = 'var(--color-text-secondary)';
        e.currentTarget.style.outline = 'none';
      }}
      aria-label="Go back"
    >
      <ArrowLeft size={16} /> {label}
    </button>
  );
}
