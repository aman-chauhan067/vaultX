import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/styles/index.css';
import App from './App.js';
import './i18n/config.js';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('VaultX root element was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
