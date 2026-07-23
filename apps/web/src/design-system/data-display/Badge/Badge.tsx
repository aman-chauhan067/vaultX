import React from 'react';
import clsx from 'clsx';
import styles from './Badge.module.css';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'error' | 'brand';
}
export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  className,
  children,
  ...props
}) => {
  return (
    <span className={clsx(styles.badge, styles[variant], className)} {...props}>
      {children}
    </span>
  );
};
