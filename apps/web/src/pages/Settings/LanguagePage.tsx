import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Check, ChevronRight, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks/index.js';
import { BackButton } from '../../components/index.js';

interface LanguageItem {
  name: string;
  nativeName: string;
  code: string;
}

const ALL_LANGUAGES: LanguageItem[] = [
  { name: 'English (US)', nativeName: 'English (US)', code: 'en' },
  { name: 'Español', nativeName: 'Spanish', code: 'es' },
  { name: 'Français', nativeName: 'French', code: 'fr' },
  { name: 'Deutsch', nativeName: 'German', code: 'de' },
  { name: '中文', nativeName: 'Chinese Simplified', code: 'zh' },
  { name: '日本語', nativeName: 'Japanese', code: 'ja' },
  { name: '한국어', nativeName: 'Korean', code: 'ko' },
  { name: 'Português', nativeName: 'Portuguese', code: 'pt' },
  { name: 'हिन्दी', nativeName: 'Hindi', code: 'hi' }
];

const CURRENCIES = ['USD', 'EUR', 'GBP'];
const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
const NUMBER_FORMATS = ['1,234.56', '1.234,56'];

export function LanguagePage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
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
          borderBottom: '1px solid var(--glass-border-light)'
        }}
      >
        <BackButton />
        <span
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-text-muted)'
          }}
        >
          {t('settings.preferences')}
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
                <Globe size={22} color="var(--color-success)" />
              </div>
              <h1
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                  margin: 0
                }}
              >
                {t('settings.language_region')}
              </h1>
            </div>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                margin: 0
              }}
            >
              {t('settings.language_desc')}
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
                  color: 'var(--color-text-muted)'
                }}
              >
                {t('settings.language')}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-info)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Info size={12} /> Full translations coming in v1.1
              </span>
            </div>

            <div
              style={{
                background: 'var(--color-surface)',
                borderRadius: '16px',
                border: '1px solid var(--color-border-secondary)',
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
                      i18n.changeLanguage(lang.code);
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
                          ? '1px solid var(--color-border-secondary)'
                          : 'none',
                      cursor: 'pointer',
                      background: isActive ? 'var(--color-success-bg)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (!isActive)
                        e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
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
                        {isActive && <Check size={14} color="var(--color-success)" />}
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
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
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
                color: 'var(--color-text-muted)'
              }}
            >
              {t('settings.currency')}
            </span>

            <div
              style={{
                background: 'var(--color-surface)',
                borderRadius: '16px',
                border: '1px solid var(--color-border-secondary)',
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
                      index !== arr.length - 1 ? '1px solid var(--color-border-secondary)' : 'none',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
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
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.875rem',
                        fontFamily: 'var(--font-mono, monospace)'
                      }}
                    >
                      {setting.value}
                    </span>
                    <ChevronRight size={16} color="var(--color-text-muted)" />
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
