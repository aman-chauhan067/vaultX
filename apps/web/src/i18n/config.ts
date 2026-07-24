import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enLocales from './locales/en.json';
import esLocales from './locales/es.json';
import frLocales from './locales/fr.json';
import deLocales from './locales/de.json';
import zhLocales from './locales/zh.json';
import jaLocales from './locales/ja.json';
import koLocales from './locales/ko.json';
import ptLocales from './locales/pt.json';
import hiLocales from './locales/hi.json';

const resources = {
  en: { translation: enLocales },
  es: { translation: esLocales },
  fr: { translation: frLocales },
  de: { translation: deLocales },
  zh: { translation: zhLocales },
  ja: { translation: jaLocales },
  ko: { translation: koLocales },
  pt: { translation: ptLocales },
  hi: { translation: hiLocales }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en', // Default fallback
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false // React already safes from xss
  }
});

export default i18n;
