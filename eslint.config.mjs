import { FlatCompat } from '@eslint/eslintrc';

// ESLint 9 flat config. The legacy `next/core-web-vitals` shareable config is
// adapted to flat config via FlatCompat. This replaces the old .eslintrc.json.
const compat = new FlatCompat({ baseDir: import.meta.dirname });

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'coverage/**',
      'node_modules/**',
      'playwright-report/**',
    ],
  },
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      '@next/next/no-page-custom-font': 'off', // App Router — false positivo de Pages Router
    },
  },
];

export default eslintConfig;
