import React from 'react';
import { Sidebar } from '../Sidebar/Sidebar.js';
import { Header } from '../Header/Header.js';
import styles from './AppShell.module.css';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Header />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
};
