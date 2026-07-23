import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 30000,
    server: {
      deps: {
        inline: [/@walletconnect/]
      }
    }
  }
});
