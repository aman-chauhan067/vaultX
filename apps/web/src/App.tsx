import React from 'react';
import { ThemeProvider } from './theme/index.js';
import { AppProvider } from './providers/AppProvider.js';
import { AppRouter } from './router/index.js';
import { BackgroundLayer } from './components/background/BackgroundLayer.js';

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BackgroundLayer />
        <AppRouter />
      </AppProvider>
    </ThemeProvider>
  );
}
