import { createContext } from 'react';

export interface NotificationSettings {
  incoming: boolean;
  outgoing: boolean;
  failed: boolean;
  login: boolean;
  dapps: boolean;
  feature: boolean;
  network: boolean;
}

export interface SettingsContextState {
  theme: 'light' | 'dark' | 'system';
  autoLockTime: number; // in milliseconds
  currency: 'USD' | 'EUR' | 'GBP';
  displayName: string;
  language: string;
  dateFormat: string;
  numberFormat: string;
  notifications: NotificationSettings;
}

export interface SettingsContextActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAutoLockTime: (ms: number) => void;
  setCurrency: (currency: 'USD' | 'EUR' | 'GBP') => void;
  setDisplayName: (name: string) => void;
  setLanguage: (lang: string) => void;
  setDateFormat: (format: string) => void;
  setNumberFormat: (format: string) => void;
  setNotifications: (settings: Partial<NotificationSettings>) => void;
}

export type SettingsContextType = SettingsContextState & SettingsContextActions;

export const SettingsContext = createContext<SettingsContextType | null>(null);
