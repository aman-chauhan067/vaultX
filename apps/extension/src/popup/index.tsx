import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '@vaultx/web/src/App.js';

// Global error handler for extension context
window.addEventListener('unhandledrejection', (event) => {
  console.error('VaultX Popup Unhandled Promise Rejection:', event.reason);
});

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
