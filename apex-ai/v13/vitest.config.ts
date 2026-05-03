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
        /* Network-heavy services testés via mock fetch en intégration : */
        'services/ai-router.ts',
        'services/firebase.ts',
        'services/firebase-queue.ts',
        /* Browser-API only testé via E2E iPhone réel : */
        'services/webauthn.ts',
        'services/bodyguard.ts',
      ],
      thresholds: {
        /* Threshold sur services métier critiques (vault, auth, rgpd, ai-safety, etc.) */
        lines: 75,
        functions: 75,
        branches: 70,
        statements: 75,
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
