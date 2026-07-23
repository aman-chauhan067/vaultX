import React from 'react';
import { ThemeProvider } from './theme/index.js';
import { AppProvider } from './providers/AppProvider.js';
import { AppRouter } from './router/index.js';

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </ThemeProvider>
  );
}
