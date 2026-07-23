import React, { useState, useEffect } from 'react';
import type { NotificationSettings } from '../contexts/SettingsContext.js';
import { SettingsContext } from '../contexts/SettingsContext.js';

const defaultNotifications: NotificationSettings = {
  incoming: true,
  outgoing: true,
  failed: true,
  login: false,
  dapps: true,
  feature: false,
  network: false
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');
  const [autoLockTime, setAutoLockTimeState] = useState(5 * 60 * 1000); // 5 minutes
  const [currency, setCurrencyState] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [displayName, setDisplayNameState] = useState('Main Account');
  const [language, setLanguageState] = useState('English (US)');
  const [dateFormat, setDateFormatState] = useState('MM/DD/YYYY');
  const [numberFormat, setNumberFormatState] = useState('1,234.56');
  const [notifications, setNotificationsState] =
    useState<NotificationSettings>(defaultNotifications);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vaultx_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.theme) setThemeState(parsed.theme);
        if (parsed.autoLockTime) setAutoLockTimeState(parsed.autoLockTime);
        if (parsed.currency) setCurrencyState(parsed.currency);
        if (parsed.displayName) setDisplayNameState(parsed.displayName);
        if (parsed.language) setLanguageState(parsed.language);
        if (parsed.dateFormat) setDateFormatState(parsed.dateFormat);
        if (parsed.numberFormat) setNumberFormatState(parsed.numberFormat);
        if (parsed.notifications)
          setNotificationsState({ ...defaultNotifications, ...parsed.notifications });
      } else {
        // Migration from old keys
        const oldCurrency = localStorage.getItem('vaultx_currency');
        if (oldCurrency === 'USD' || oldCurrency === 'EUR' || oldCurrency === 'GBP') {
          setCurrencyState(oldCurrency);
        }
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else if (theme === 'dark') {
      root.classList.remove('light-theme');
    } else {
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        root.classList.add('light-theme');
      } else {
        root.classList.remove('light-theme');
      }
    }
  }, [theme]);

  const saveSettings = (updates: any) => {
    try {
      const current = localStorage.getItem('vaultx_settings');
      const parsed = current ? JSON.parse(current) : {};
      localStorage.setItem('vaultx_settings', JSON.stringify({ ...parsed, ...updates }));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  const setTheme = (val: 'light' | 'dark' | 'system') => {
    setThemeState(val);
    saveSettings({ theme: val });
  };
  const setAutoLockTime = (val: number) => {
    setAutoLockTimeState(val);
    saveSettings({ autoLockTime: val });
  };
  const setCurrency = (val: 'USD' | 'EUR' | 'GBP') => {
    setCurrencyState(val);
    saveSettings({ currency: val });
  };
  const setDisplayName = (val: string) => {
    setDisplayNameState(val);
    saveSettings({ displayName: val });
  };
  const setLanguage = (val: string) => {
    setLanguageState(val);
    saveSettings({ language: val });
  };
  const setDateFormat = (val: string) => {
    setDateFormatState(val);
    saveSettings({ dateFormat: val });
  };
  const setNumberFormat = (val: string) => {
    setNumberFormatState(val);
    saveSettings({ numberFormat: val });
  };
  const setNotifications = (settings: Partial<NotificationSettings>) => {
    const next = { ...notifications, ...settings };
    setNotificationsState(next);
    saveSettings({ notifications: next });
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        autoLockTime,
        currency,
        displayName,
        language,
        dateFormat,
        numberFormat,
        notifications,
        setTheme,
        setAutoLockTime,
        setCurrency,
        setDisplayName,
        setLanguage,
        setDateFormat,
        setNumberFormat,
        setNotifications
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
