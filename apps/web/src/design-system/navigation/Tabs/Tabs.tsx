import React, { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import styles from './Tabs.module.css';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, className }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={clsx(styles.tab, isActive && styles.active)}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.label}>{tab.label}</span>
              {isActive && (
                <motion.div
                  className={styles.indicator}
                  layoutId="activeTabIndicator"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className={styles.contentContainer} role="tabpanel">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeContent}
        </motion.div>
      </div>
    </div>
  );
};
