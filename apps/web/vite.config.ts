import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          ethers: ['ethers'],
          animation: ['framer-motion', 'lottie-web'],
          physics: ['matter-js'],
          ui: ['lucide-react', 'qrcode.react'],
          vaultx: [
            '@vaultx/account-manager',
            '@vaultx/blockchain-core',
            '@vaultx/keyring',
            '@vaultx/network-engine',
            '@vaultx/transaction-engine',
            '@vaultx/wallet-engine'
          ]
        }
      }
    }
  }
});
