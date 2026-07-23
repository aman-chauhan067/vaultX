import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  variant = 'text',
  style
}) => {
  return (
    <motion.div
      className={clsx(styles.skeleton, styles[variant], className)}
      style={{ width, height, ...style } as any}
      animate={{
        opacity: [0.5, 0.8, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
};
