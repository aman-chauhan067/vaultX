import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { microInteractions } from '../../../theme/animations.js';
import styles from './Button.module.css';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      fullWidth,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        className={clsx(
          styles.button,
          styles[variant],
          styles[size],
          fullWidth && styles.fullWidth,
          className
        )}
        disabled={disabled || isLoading}
        whileHover={!(disabled || isLoading) ? (microInteractions.hover as any) : undefined}
        whileTap={!(disabled || isLoading) ? (microInteractions.tap as any) : undefined}
        {...props}
      >
        {isLoading && <span className={styles.spinner} />}
        {!isLoading && leftIcon && <span className={styles.iconWrapper}>{leftIcon}</span>}
        <span className={styles.content}>{children as React.ReactNode}</span>
        {!isLoading && rightIcon && <span className={styles.iconWrapper}>{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
