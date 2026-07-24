import React from 'react';
import { AppProvider } from './providers/AppProvider.js';
import { AppRouter } from './router/index.js';

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
