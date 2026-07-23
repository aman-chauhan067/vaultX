import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Check, ChevronRight, Info } from 'lucide-react';

import { useSettings } from '../../hooks/index.js';
import { BackButton } from '../../components/index.js';

interface LanguageItem {
  name: string;
  nativeName: string;
}

const ALL_LANGUAGES: LanguageItem[] = [
  { name: 'English (US)', nativeName: 'English (US)' },
  { name: 'Español', nativeName: 'Spanish' },
  { name: 'Français', nativeName: 'French' },
  { name: 'Deutsch', nativeName: 'German' },
  { name: '中文', nativeName: 'Chinese Simplified' },
  { name: '日本語', nativeName: 'Japanese' },
  { name: '한국어', nativeName: 'Korean' },
  { name: 'Português', nativeName: 'Portuguese' }
];

const CURRENCIES = ['USD', 'EUR', 'GBP'];
const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
const NUMBER_FORMATS = ['1,234.56', '1.234,56'];

export function LanguagePage() {
  const navigate = useNavigate();
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    dateFormat,
    setDateFormat,
    numberFormat,
    setNumberFormat
  } = useSettings();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        padding: '0 5vw',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header & Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2rem 0',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <BackButton />
        <span
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#52525b'
          }}
        >
          Preferences
        </span>
      </motion.div>

      {/* Content Container */}
      <div
        style={{
          flex: 1,
          maxWidth: '560px',
          margin: '0 auto',
          width: '100%',
          paddingTop: '6vh',
          paddingBottom: '6vh'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
        >
          {/* Title and Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  padding: '0.875rem',
                  background: 'rgba(52,199,89,0.1)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Globe size={22} color="#34C759" />
              </div>
              <h1
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                  margin: 0
                }}
              >
                Language &amp; Region
              </h1>
            </div>
            <p style={{ color: '#52525b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Choose your preferred language. VaultX will display all interface text in the selected
              language.
            </p>
          </div>

          {/* Language Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#52525b'
                }}
              >
                Language
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Info size={12} /> Language packs coming in v1.1
              </span>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                overflow: 'hidden'
              }}
            >
              {ALL_LANGUAGES.map((lang, index) => {
                const isActive = language === lang.name;
                return (
                  <div
                    key={lang.name}
                    onClick={() => {
                      setLanguage(lang.name);
                      const evt = new CustomEvent('toast', {
                        detail: { type: 'success', message: 'Language updated' }
                      });
                      window.dispatchEvent(evt);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.5rem',
                      borderBottom:
                        index !== ALL_LANGUAGES.length - 1
                          ? '1px solid rgba(255, 255, 255, 0.04)'
                          : 'none',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(52, 199, 89, 0.04)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (!isActive)
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isActive ? 'rgba(52, 199, 89, 0.15)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {isActive && <Check size={14} color="#34C759" />}
                      </div>
                      <span
                        style={{
                          fontSize: '0.95rem',
                          color: 'var(--color-text-primary)',
                          fontWeight: 400
                        }}
                      >
                        {lang.name}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#52525b' }}>
                        ({lang.nativeName})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Region Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#52525b'
              }}
            >
              Region
            </span>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                overflow: 'hidden'
              }}
            >
              {[
                {
                  label: 'Currency Display',
                  value: currency,
                  options: CURRENCIES,
                  setter: setCurrency
                },
                {
                  label: 'Date Format',
                  value: dateFormat,
                  options: DATE_FORMATS,
                  setter: setDateFormat
                },
                {
                  label: 'Number Format',
                  value: numberFormat,
                  options: NUMBER_FORMATS,
                  setter: setNumberFormat
                }
              ].map((setting, index, arr) => (
                <div
                  key={setting.label}
                  onClick={() => {
                    const currentIndex = setting.options.indexOf(setting.value);
                    const nextIndex = (currentIndex + 1) % setting.options.length;
                    setting.setter(setting.options[nextIndex] as any);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    borderBottom:
                      index !== arr.length - 1 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.95rem',
                      color: 'var(--color-text-primary)',
                      fontWeight: 400
                    }}
                  >
                    {setting.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        color: '#8A8A93',
                        fontSize: '0.875rem',
                        fontFamily: 'var(--font-mono, monospace)'
                      }}
                    >
                      {setting.value}
                    </span>
                    <ChevronRight size={16} color="#52525b" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
