import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import { useIsTablet } from '../../hooks/useMediaQuery';

export const HeroZoomIntro: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isTablet = useIsTablet();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Scale up to 150 is enough to make the hole cover large monitors.
  // DO NOT animate opacity on the mask, as changing opacity on a mix-blend-mode element
  // forces a new stacking context, causing it to instantly turn solid black!
  const scale = useTransform(scrollYProgress, [0, 0.25, 0.3], [1, 15, 150]);
  const pointerEvents = useTransform(scrollYProgress, (p) => (p >= 0.29 ? 'none' : 'auto'));

  // Sequence 2: Hero Content emerges from background (0.3 to 0.45)
  // This leaves from 0.45 to 1.0 (over 200vh) of pure resting time for the user to interact
  const contentOpacity = useTransform(scrollYProgress, [0.3, 0.45], [0, 1]);
  const contentScale = useTransform(scrollYProgress, [0.3, 0.45], [1.2, 1]); // More subtle scale
  const blurValue = useTransform(scrollYProgress, [0.3, 0.45], [10, 0]); // More subtle blur
  const contentFilter = useMotionTemplate`blur(${blurValue}px)`;

  // Scroll Instruction Animation: Blurs out extremely quickly right at the start of scroll
  const scrollBlur = useTransform(scrollYProgress, [0, 0.1], [0, 20]);
  const scrollFilter = useMotionTemplate`blur(${scrollBlur}px)`;
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  if (isTablet) {
    return <div style={{ position: 'relative', width: '100%' }}>{children}</div>;
  }

  return (
    <div ref={containerRef} style={{ height: '400vh', position: 'relative', width: '100%' }}>
      {/* The Hero Content that emerges from the background */}
      <motion.div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          opacity: contentOpacity,
          scale: contentScale,
          filter: contentFilter,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {children}
      </motion.div>

      {/* The Cutout Mask Overlay */}
      <motion.div
        style={{
          position: 'sticky',
          top: 0,
          marginTop: '-100vh', // Pull it up so it overlays the sticky children
          height: '100vh',
          width: '100%',
          backgroundColor: '#ECE9E3', // User requested color
          mixBlendMode: 'screen', // Screen makes white stay white, and black become transparent
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          pointerEvents: pointerEvents as any,
          willChange: 'transform' // Optimize performance
        }}
      >
        {/* The Text that acts as the transparent cutout */}
        <motion.div
          style={{
            color: '#000000', // Black text becomes transparent with screen blend mode
            fontFamily: 'CustomHelvetica, sans-serif',
            fontSize: 'clamp(5rem, 15vw, 15rem)',
            fontWeight: 800,
            letterSpacing: '-0.05em',
            scale,
            transformOrigin: '55% 50%', // Offset transform origin slightly to zoom through the gap between T and X
            whiteSpace: 'nowrap'
          }}
        >
          VAULT X
        </motion.div>
      </motion.div>

      {/* Scroll Instruction (Outside the mask so it is clearly visible) */}
      <motion.div
        style={{
          position: 'fixed',
          bottom: '15%',
          left: '50%',
          x: '-50%',
          color: '#000000', // Changed to black to be visible on the white mask
          fontFamily: 'var(--font-sans)',
          fontSize: '0.875rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          opacity: scrollOpacity,
          filter: scrollFilter,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          pointerEvents: 'none',
          zIndex: 50
        }}
      >
        <span>Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          style={{
            width: '1px',
            height: '40px',
            background: 'linear-gradient(to bottom, #FFFFFF, transparent)'
          }}
        />
      </motion.div>
    </div>
  );
};

export default HeroZoomIntro;
