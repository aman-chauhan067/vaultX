import React from 'react';
import clsx from 'clsx';
import styles from './Spinner.module.css';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'brand';
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', variant = 'brand', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(styles.spinner, styles[size], styles[variant], className)}
        {...props}
      />
    );
  }
);
Spinner.displayName = 'Spinner';
