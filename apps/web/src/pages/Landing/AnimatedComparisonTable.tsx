import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const comparisonData = [
  { feature: 'Key Storage', trad: 'Cloud servers', vault: 'Your device only' },
  { feature: 'Data Collection', trad: 'Analytics & tracking', vault: 'Zero telemetry' },
  { feature: 'Source Code', trad: 'Closed source', vault: 'Fully open source' },
  { feature: 'Account Required', trad: 'Email & KYC', vault: 'None' },
  { feature: 'Extension Size', trad: '50MB+', vault: 'Under 12MB' },
  { feature: 'Network Lock-in', trad: 'Limited chains', vault: 'Any EVM chain' }
];

function ExplodingText({
  text,
  trigger,
  style
}: {
  text: string;
  trigger: boolean;
  style?: React.CSSProperties;
}) {
  const letters = text.split('');
  return (
    <div style={{ display: 'inline-flex', overflow: 'visible', ...style }}>
      {letters.map((char: string, i: number) => {
        const randX = (Math.random() - 0.5) * 200;
        const randY = Math.random() * 200 + 100;
        const randRot = (Math.random() - 0.5) * 360;

        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={
              trigger
                ? {
                    x: randX,
                    y: randY,
                    rotate: randRot,
                    opacity: 0
                  }
                : {}
            }
            transition={{
              duration: 1.5,
              ease: 'easeOut',
              opacity: { duration: 1.2, delay: 0.2 }
            }}
            style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
          >
            {char}
          </motion.span>
        );
      })}
    </div>
  );
}

function ComparisonRow({
  row,
  index,
  startAnimation,
  isHeader = false
}: {
  row: { feature: string; trad: string; vault: string } | any;
  index: number;
  startAnimation: boolean;
  isHeader?: boolean;
}) {
  const [exploded, setExploded] = useState(false);

  useEffect(() => {
    if (startAnimation) {
      const timer = setTimeout(
        () => {
          setExploded(true);
        },
        index * 1200 + (isHeader ? 600 : 1200)
      );
      return () => clearTimeout(timer);
    }
  }, [startAnimation, index, isHeader]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        position: 'relative',
        background: isHeader ? 'rgba(255,255,255,0.02)' : 'transparent',
        borderBottom: isHeader
          ? '1px solid rgba(255,255,255,0.06)'
          : index < 5
            ? '1px solid rgba(255,255,255,0.06)'
            : 'none'
      }}
    >
      {/* Feature Column */}
      <div
        style={{
          padding: '1rem',
          fontFamily: 'CustomHelvetica, sans-serif',
          fontSize: isHeader ? 'clamp(0.65rem, 2vw, 0.75rem)' : 'clamp(0.75rem, 2.5vw, 0.9rem)',
          fontWeight: isHeader ? 500 : 300,
          letterSpacing: isHeader ? '0.06em' : '0.02em',
          textTransform: isHeader ? 'uppercase' : 'none',
          color: isHeader ? '#3F3F46' : '#71717A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        {row.feature}
      </div>

      {/* Comparison Column (Stacked) */}
      <div
        style={{
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* VaultX Text (Behind) */}
        <motion.div
          initial={{
            opacity: 0,
            filter: 'blur(10px)',
            textShadow: '0px 0px 0px rgba(255,255,255,0)'
          }}
          animate={
            exploded
              ? {
                  opacity: 1,
                  filter: 'blur(0px)',
                  textShadow: '0px 0px 20px rgba(255,255,255,0.4)'
                }
              : {}
          }
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            fontFamily: 'CustomHelvetica, sans-serif',
            fontSize: isHeader ? 'clamp(0.65rem, 2vw, 0.75rem)' : 'clamp(0.85rem, 3vw, 1.1rem)',
            fontWeight: 300,
            letterSpacing: isHeader ? '0.06em' : '0.02em',
            textTransform: isHeader ? 'uppercase' : 'none',
            color: '#FAFAFA',
            textAlign: 'center',
            zIndex: 1
          }}
        >
          {row.vault}
        </motion.div>

        {/* Traditional Text (In Front, Explodes) */}
        <ExplodingText
          text={row.trad}
          trigger={exploded}
          style={{
            position: 'absolute',
            fontFamily: 'CustomHelvetica, sans-serif',
            fontSize: isHeader ? 'clamp(0.65rem, 2vw, 0.75rem)' : 'clamp(0.75rem, 2.5vw, 0.9rem)',
            fontWeight: isHeader ? 500 : 300,
            letterSpacing: isHeader ? '0.06em' : '0.02em',
            textTransform: isHeader ? 'uppercase' : 'none',
            color: '#3F3F46',
            zIndex: 2
          }}
        />
      </div>
    </div>
  );
}

export function AnimatedComparisonTable() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-150px' });

  const headerRow = { feature: 'Feature', trad: 'Traditional', vault: 'VaultX' };

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        maxWidth: '800px',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        overflow: 'hidden'
      }}
    >
      {/* Header Row */}
      <ComparisonRow row={headerRow} index={0} startAnimation={isInView} isHeader={true} />

      {/* Data Rows */}
      <div>
        {comparisonData.map((row, i) => (
          <ComparisonRow key={i} row={row} index={i + 1} startAnimation={isInView} />
        ))}
      </div>
    </div>
  );
}
