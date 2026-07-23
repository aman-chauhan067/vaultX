import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { microInteractions } from '../../../theme/animations.js';
import styles from './GlassCard.module.css';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, padding = 'md', interactive = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={clsx(
          styles.glassCard,
          styles[`p-${padding}`],
          interactive && styles.interactive,
          className
        )}
        whileHover={interactive ? (microInteractions.liftHover as any) : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = 'GlassCard';
