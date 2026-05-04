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
        /* UI HTML statique (admin tabs, settings, pro, studios, remote) testé E2E Playwright */
        'features/admin/index.ts',
        'features/settings/index.ts',
        'features/pro/index.ts',
        'features/studios/index.ts',
        'features/remote/index.ts',
        'features/sentinels/index.ts',
        'features/browser/index.ts',
        'features/crypto/index.ts',
        'features/domotique/index.ts',
        'features/workflow/index.ts',
        'features/laurence/index.ts',
      ],
      thresholds: {
        /* Sprint 8 Kevin v13.0.67 : seuils relevés (anti-régression strict).
           Si baisse → CI fail. JAMAIS abaisser ces valeurs. */
        lines: 84,
        functions: 92,
        branches: 77,
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
