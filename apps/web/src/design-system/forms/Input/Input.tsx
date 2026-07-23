import React from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { feedbackVariants } from '../../../theme/animations.js';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean;
  success?: boolean;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, success, label, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = React.useId();
    const finalId = id || inputId;
    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={finalId} className={styles.label}>
            {label}
          </label>
        )}
        <motion.div
          className={styles.inputContainer}
          variants={feedbackVariants}
          animate={error ? 'shake' : success ? 'pulse' : (undefined as any)}
          initial={false}
        >
          {leftIcon && <div className={clsx(styles.iconWrapper, styles.left)}>{leftIcon}</div>}
          <input
            id={finalId}
            ref={ref}
            className={clsx(
              styles.input,
              error && styles.hasError,
              success && styles.hasSuccess,
              leftIcon && styles.hasLeft,
              rightIcon && styles.hasRight,
              className
            )}
            {...props}
          />
          {rightIcon && <div className={clsx(styles.iconWrapper, styles.right)}>{rightIcon}</div>}
        </motion.div>
        <AnimatePresence>
          {error && (
            <motion.span
              className={styles.errorText}
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
            >
              {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
Input.displayName = 'Input';
