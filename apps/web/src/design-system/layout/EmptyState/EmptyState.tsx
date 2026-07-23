import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { listContainerVariants, listItemVariants } from '../../../theme/animations.js';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  icon?: React.ReactNode;
  brandTitle?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  brandTitle = '',
  title,
  description,
  action,
  secondaryAction,
  className
}) => (
  <motion.div
    className={clsx(styles.emptyState, className)}
    variants={listContainerVariants}
    initial="initial"
    animate="animate"
  >
    <div className={styles.brandTitleBg}>{brandTitle}</div>

    <div
      style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {icon && (
        <motion.div className={styles.icon} variants={listItemVariants}>
          {icon}
        </motion.div>
      )}
      <motion.h3 className={styles.title} variants={listItemVariants}>
        {title}
      </motion.h3>
      {description && (
        <motion.p className={styles.description} variants={listItemVariants}>
          {description}
        </motion.p>
      )}
      {(action || secondaryAction) && (
        <motion.div className={styles.actionGroup} variants={listItemVariants}>
          {action}
          {secondaryAction}
        </motion.div>
      )}
    </div>
  </motion.div>
);
