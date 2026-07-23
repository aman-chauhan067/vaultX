import React, { useEffect, useRef } from 'react';
import { FirefliesCanvas } from './FirefliesCanvas.js';

export const BackgroundLayer: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const nebulaRef = useRef<HTMLDivElement>(null);
  const firefliesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const MAX_GLOW_DRIFT = 25; // px
    const MAX_TEXT_DRIFT = 5; // px (very slow, barely noticeable as requested)

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      requestAnimationFrame(() => {
        if (glowRef.current) {
          glowRef.current.style.transform = `translate(calc(-50% + ${x * MAX_GLOW_DRIFT}px), calc(-50% + ${y * MAX_GLOW_DRIFT}px))`;
        }
        if (textRef.current) {
          textRef.current.style.transform = `translate(calc(-50% + ${x * -MAX_TEXT_DRIFT}px), calc(-50% + ${y * -MAX_TEXT_DRIFT}px))`;
        }
        if (starsRef.current) {
          starsRef.current.style.transform = `translate(${x * -4}px, ${y * -4}px)`;
        }
        if (nebulaRef.current) {
          nebulaRef.current.style.transform = `translate(${x * -2}px, ${y * -2}px)`;
        }
      });
    };

    // Fallback animation for mobile/no-mouse
    let animationFrameId: number;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    if (isTouch) {
      let time = 0;
      const animateIdle = () => {
        time += 0.01;
        const x = Math.sin(time);
        const y = Math.cos(time * 0.8);

        if (glowRef.current) {
          glowRef.current.style.transform = `translate(calc(-50% + ${x * 15}px), calc(-50% + ${y * 15}px))`;
        }
        if (textRef.current) {
          textRef.current.style.transform = `translate(calc(-50% + ${x * -3}px), calc(-50% + ${y * -3}px))`;
        }

        animationFrameId = requestAnimationFrame(animateIdle);
      };
      animateIdle();
    } else {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (isTouch && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      } else {
        document.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden',
        backgroundColor: '#000000'
      }}
    >
      {/* 0. Soft Nebula */}
      <div
        ref={nebulaRef}
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '120%',
          height: '120%',
          zIndex: 0,
          background:
            'radial-gradient(ellipse at 30% 40%, rgba(25, 25, 112, 0.04) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(75, 0, 130, 0.03) 0%, transparent 50%)',
          filter: 'blur(80px)',
          transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
          willChange: 'transform'
        }}
      />

      {/* 1. Background stars */}
      <div
        ref={starsRef}
        style={{
          position: 'absolute',
          top: '-5%',
          left: '-5%',
          width: '110%',
          height: '110%',
          zIndex: 1,
          backgroundImage: `
            radial-gradient(1px 1px at 10% 20%, rgba(255, 255, 255, 0.15) 100%, transparent),
            radial-gradient(1.5px 1.5px at 30% 40%, rgba(255, 255, 255, 0.1) 100%, transparent),
            radial-gradient(1px 1px at 60% 80%, rgba(255, 255, 255, 0.2) 100%, transparent),
            radial-gradient(2px 2px at 80% 10%, rgba(255, 255, 255, 0.08) 100%, transparent),
            radial-gradient(1px 1px at 90% 60%, rgba(255, 255, 255, 0.15) 100%, transparent),
            radial-gradient(1.5px 1.5px at 40% 90%, rgba(255, 255, 255, 0.1) 100%, transparent),
            radial-gradient(1px 1px at 20% 70%, rgba(255, 255, 255, 0.12) 100%, transparent),
            radial-gradient(1.5px 1.5px at 70% 30%, rgba(255, 255, 255, 0.18) 100%, transparent)
          `,
          backgroundSize: '200px 200px',
          opacity: 0.8,
          transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
          willChange: 'transform'
        }}
      />

      {/* 2. Fireflies Canvas (Layer 4) */}
      <FirefliesCanvas />

      {/* 2. Large radial glow (Backlight) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div
          ref={glowRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80vw',
            height: '60vw',
            maxWidth: '1200px',
            maxHeight: '900px',
            background:
              'radial-gradient(ellipse at center, rgba(138, 43, 226, 0.08) 0%, rgba(75, 0, 130, 0.06) 30%, rgba(25, 25, 112, 0.04) 60%, rgba(255, 255, 255, 0.01) 80%, transparent 100%)',
            filter: 'blur(100px)',
            borderRadius: '50%',
            willChange: 'transform',
            transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        />
      </div>

      {/* 3. Background typography */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <h1
          ref={textRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 'clamp(8rem, 25vw, 30rem)',
            fontWeight: 900,
            letterSpacing: '0.05em',
            color: '#0b0b0b',
            opacity: 0.95,
            margin: 0,
            lineHeight: 1,
            textTransform: 'uppercase',
            willChange: 'transform',
            transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
            userSelect: 'none',
            fontFamily: 'var(--font-sans)'
          }}
        >
          VAULT
        </h1>
      </div>
    </div>
  );
};
