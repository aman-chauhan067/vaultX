import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json' with { type: 'json' };

import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@vaultx/web': resolve(__dirname, '../web')
    }
  },
  plugins: [react(), crx({ manifest })],
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      port: 5174
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
          ethers: ['ethers']
        }
      }
    }
  }
});
