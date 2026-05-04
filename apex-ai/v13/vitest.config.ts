import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['core/**/*.ts', 'services/**/*.ts', 'features/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types.ts',
        '**/*.d.ts',
        /* Infrastructure bootstrap testée en E2E (Playwright) : */
        'core/bootstrap.ts',
        /* Browser-API only testé via E2E iPhone réel : */
        'services/webauthn.ts',
        'services/bodyguard.ts',
      ],
      thresholds: {
        /* Sprint 8 Kevin v13.0.60 : seuils relevés (anti-régression strict).
           Si baisse → CI fail. JAMAIS abaisser ces valeurs. */
        lines: 84,
        functions: 91,
        branches: 76,
        statements: 84,
      },
    },
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'dist', 'tests/e2e'],
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'core'),
      '@services': resolve(__dirname, 'services'),
      '@modules': resolve(__dirname, 'modules'),
      '@features': resolve(__dirname, 'features'),
      '@ui': resolve(__dirname, 'ui'),
      '@workers': resolve(__dirname, 'workers'),
    },
  },
});
