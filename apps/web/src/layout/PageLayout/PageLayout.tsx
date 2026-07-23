import React from 'react';
import clsx from 'clsx';
import styles from './PageLayout.module.css';

interface PageLayoutProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  action,
  children,
  className
}) => {
  return (
    <div className={clsx(styles.page, className)}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {action && <div className={styles.action}>{action}</div>}
      </header>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
