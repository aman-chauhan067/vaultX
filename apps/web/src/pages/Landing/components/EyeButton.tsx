import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { ButtonProps } from '../../../design-system/index.js';
import { Button } from '../../../design-system/index.js';

type EyeButtonProps = ButtonProps;

const Eye: React.FC<{ cursorX: number; cursorY: number; centerX: number; centerY: number }> = ({
  cursorX,
  cursorY,
  centerX,
  centerY
}) => {
  const [blink, setBlink] = useState(false);
  const [microMove, setMicroMove] = useState({ x: 0, y: 0 });
  const controls = useAnimation();

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const triggerBlink = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 120 + Math.random() * 60);
      timeout = setTimeout(triggerBlink, 4000 + Math.random() * 5000);
    };
    timeout = setTimeout(triggerBlink, Math.random() * 5000);

    let microTimeout: ReturnType<typeof setTimeout>;
    const triggerMicro = () => {
      setMicroMove({ x: (Math.random() - 0.5) * 1.5, y: (Math.random() - 0.5) * 1.5 });
      microTimeout = setTimeout(triggerMicro, 500 + Math.random() * 2000);
    };
    triggerMicro();

    return () => {
      clearTimeout(timeout);
      clearTimeout(microTimeout);
    };
  }, []);

  // Calculate pupil offset
  const dx = cursorX - centerX;
  const dy = cursorY - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxOffset = 3;
  // Apply micro movements if cursor is far (idle)
  const isIdle = dist > 200;
  let pupilX = dist > 0 ? (dx / dist) * Math.min(dist * 0.05, maxOffset) : 0;
  let pupilY = dist > 0 ? (dy / dist) * Math.min(dist * 0.05, maxOffset) : 0;

  if (isIdle) {
    pupilX += microMove.x;
    pupilY += microMove.y;
  }

  // Slightly different speeds per eye
  const stiffness = centerX % 2 === 0 ? 300 : 250;
  const damping = centerX % 2 === 0 ? 20 : 25;

  return (
    <div
      style={{
        width: '12px',
        height: '12px',
        backgroundColor: 'white',
        borderRadius: '50%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
        flexShrink: 0
      }}
    >
      {/* Eyelid for blinking */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: blink ? '12px' : '0px' }}
        transition={{ duration: 0.1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--color-bg-tertiary)',
          zIndex: 10
        }}
      />
      {/* Pupil */}
      <motion.div
        animate={{
          x: pupilX,
          y: pupilY,
          scale: 1
        }}
        transition={{ type: 'spring', stiffness, damping }}
        style={{
          width: '5px',
          height: '5px',
          backgroundColor: 'var(--color-bg-primary)',
          borderRadius: '50%',
          position: 'absolute'
        }}
      />
    </div>
  );
};

export const EyeButton: React.FC<EyeButtonProps> = ({ children, onClick, ...props }) => {
  const [cursor, setCursor] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [centers, setCenters] = useState([
    { x: 0, y: 0 },
    { x: 0, y: 0 }
  ]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCenters([
        { x: rect.left + 24, y: rect.top + rect.height / 2 },
        { x: rect.left + 44, y: rect.top + rect.height / 2 }
      ]);
    }
  }, [cursor]); // rough update

  return (
    <motion.div
      id="cta-eye-button"
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        borderRadius: 'var(--radius-full)',
        cursor: 'pointer'
      }}
      whileHover={{ scale: 1.05, y: -2, boxShadow: '0 12px 36px rgba(168, 85, 247, 0.5)' }}
      whileTap={{ scale: 0.95, y: 0, boxShadow: '0 4px 12px rgba(168, 85, 247, 0.8)' }}
      whileFocus={{ outline: '2px solid rgba(168, 85, 247, 0.8)', outlineOffset: '4px' }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      onClick={onClick as any}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(e as any);
        }
      }}
    >
      <Button {...props} style={{ paddingLeft: '64px', pointerEvents: 'none', ...props.style }}>
        <div
          style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            gap: '6px'
          }}
        >
          <Eye
            cursorX={cursor.x}
            cursorY={cursor.y}
            centerX={centers[0]?.x || 0}
            centerY={centers[0]?.y || 0}
          />
          <Eye
            cursorX={cursor.x}
            cursorY={cursor.y}
            centerX={centers[1]?.x || 0}
            centerY={centers[1]?.y || 0}
          />
        </div>
        {children as React.ReactNode}
      </Button>
    </motion.div>
  );
};
