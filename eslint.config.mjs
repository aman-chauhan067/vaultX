import baseConfig from '@vaultx/config/eslint';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/.pnpm-store/**',
      '**/.tooling/**',
      '**/dist/**',
      '**/artifacts/**',
      '**/cache/**',
      '**/coverage/**',
      '**/*.config.js',
      '**/*.config.cjs',
      '**/public/injected.js',
      'puppeteer-tests.js', 'check_errors.js'
    ]
  },
  ...baseConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      'no-undef': 'off'
    }
  }
];
