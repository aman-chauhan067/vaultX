import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  Activity,
  Settings,
  ShieldCheck,
  TerminalSquare
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { path: '/activity', label: 'Activity', icon: Activity },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/security', label: 'Security', icon: ShieldCheck },
  { path: '/developer', label: 'Developer', icon: TerminalSquare }
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <img
            src="/logo.png"
            alt="VaultX Logo"
            style={{ width: '150%', height: '150%', objectFit: 'contain' }}
          />
        </div>
        <span className={styles.brandName}>VaultX</span>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={clsx(styles.navLink, isActive && styles.active)}
              style={{ position: 'relative' }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'var(--color-surface-active)',
                    borderRadius: 'var(--radius-sm)',
                    zIndex: -1
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={18} className={styles.navIcon} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className={styles.footer}>
        <div className={styles.version}>v0.1.0-alpha</div>
      </div>
    </aside>
  );
};
