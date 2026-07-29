import React, { useEffect } from 'react';
import { Sidebar } from '../Sidebar/Sidebar.js';
import { Header } from '../Header/Header.js';
import { useSettings } from '../../hooks/index.js';
import styles from './AppShell.module.css';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useSettings();

  const isLight =
    theme === 'light' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (isLight) {
      document.documentElement.classList.add('light-theme');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#f2f2f7'); // Matches light theme background
      }
    } else {
      document.documentElement.classList.remove('light-theme');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#09111f'); // Matches dark theme background
      }
    }

    // Cleanup when AppShell unmounts (e.g. going back to Landing page)
    return () => {
      document.documentElement.classList.remove('light-theme');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#09111f');
      }
    };
  }, [isLight]);
  return (
    <div
      className={styles.shell}
      style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
    >
      <Sidebar />
      <div className={styles.main}>
        <Header />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
};
