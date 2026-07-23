import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import styles from './Card.module.css';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'whileHover' | 'whileTap'> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass' | 'highlight';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, padding = 'md', variant = 'default', interactive = false, children, ...props },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={clsx(
          styles.card,
          styles[`p-${padding}`],
          styles[`variant-${variant}`],
          interactive && styles.interactive,
          className
        )}
        {...(interactive
          ? {
              whileHover: { y: -2, transition: { duration: 0.15 } },
              whileTap: { scale: 0.98 }
            }
          : {})}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = 'Card';
