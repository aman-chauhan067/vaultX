import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { microInteractions } from '../../../theme/animations.js';
import styles from './Chip.module.css';

export interface ChipProps extends HTMLMotionProps<'span'> {
  variant?: 'outline' | 'filled';
  onDelete?: () => void;
  interactive?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  className,
  variant = 'filled',
  onDelete,
  interactive,
  children,
  ...props
}) => {
  return (
    <motion.span
      className={clsx(styles.chip, styles[variant], interactive && styles.interactive, className)}
      whileHover={interactive ? (microInteractions.hover as any) : undefined}
      whileTap={interactive ? (microInteractions.tap as any) : undefined}
      {...props}
    >
      {children as React.ReactNode}
      {onDelete && (
        <button
          className={styles.deleteButton}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete"
        >
          &times;
        </button>
      )}
    </motion.span>
  );
};
