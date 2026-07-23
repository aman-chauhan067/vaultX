import type { Variants } from 'framer-motion';

// Aligning to tokens.css:
// --motion-duration-fast: 0.15
// --motion-duration-normal: 0.25
// --motion-duration-slow: 0.40
// --motion-curve-default: [0.4, 0, 0.2, 1]
// --motion-curve-bounce: [0.34, 1.56, 0.64, 1]

const durationFast = 0.15;
const durationNormal = 0.25;
const durationSlow = 0.4;
const curveDefault = [0.4, 0, 0.2, 1] as [number, number, number, number];
const curveBounce = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

// Page Transitions
export const pageVariants: Variants = {
  initial: { opacity: 0, scale: 0.98, filter: 'blur(8px)', y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: durationSlow, ease: curveDefault }
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    filter: 'blur(4px)',
    y: -10,
    transition: { duration: durationNormal, ease: curveDefault }
  }
};

// Modal Transitions
export const modalOverlayVariants: Variants = {
  initial: { opacity: 0, backdropFilter: 'blur(0px)' },
  animate: {
    opacity: 1,
    backdropFilter: 'blur(16px)', // Matching var(--glass-blur)
    transition: { duration: durationNormal, ease: curveDefault }
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: { duration: durationFast, ease: curveDefault }
  }
};

export const modalContentVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: durationSlow, ease: curveBounce }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: { duration: durationFast, ease: curveDefault }
  }
};

// Micro-interactions (Hover, Tap)
export const microInteractions = {
  hover: { y: -2, transition: { duration: durationFast, ease: curveDefault } },
  tap: { scale: 0.98, transition: { duration: durationFast, ease: curveDefault } },
  liftHover: { y: -4, transition: { duration: durationFast, ease: curveDefault } },
  glowHover: {
    boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
    transition: { duration: durationFast }
  }
};

// Staggered Lists
export const listContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const listItemVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: durationNormal, ease: curveDefault }
  }
};

// State Feedback (Error Shake, Success Pulse)
export const feedbackVariants: Variants = {
  shake: {
    x: [0, -4, 4, -4, 4, 0],
    transition: { duration: durationSlow, ease: 'easeInOut' }
  },
  pulse: {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 0 0 0 rgba(16, 185, 129, 0.4)',
      '0 0 0 10px rgba(16, 185, 129, 0)',
      '0 0 0 0 rgba(16, 185, 129, 0)'
    ],
    transition: { duration: 0.6, ease: curveDefault }
  }
};
