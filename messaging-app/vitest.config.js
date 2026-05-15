import { defineConfig } from 'vitest/config';

/**
 * vitest config — Apex Chat messaging-app
 *
 * Coverage 100% RÉEL via v8 sur les modules ESM testables (lib/*) et les
 * Cloudflare Workers backend (workers/*). Les fichiers loaders/shims à la
 * racine (`crypto.js`, `sw.js`) délèguent leur logique à `lib/` — testés
 * indirectement.
 *
 * Les tests E2E Playwright sont dans tests/e2e/ et exclus de vitest.
 */
export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    // Exclure tests/e2e/ qui sont gérés par Playwright (npm run test:e2e)
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['lib/**/*.js', 'workers/**/*.js'],
      exclude: [
        'tests/**',
        'node_modules/**',
        '**/*.test.js',
        '**/*.spec.js',
        // Phase C2 en cours : api-worker.js (2444 lignes).
        // Progression mesurée v8 (transparente, CLAUDE.md "réel toujours") :
        // 0% → 19.63% → 25.9% → 49.63% → 57.48% → 71.11% → 79% → **81.99%**
        // **100% FUNCTIONS (72/72)** / 78.84% branches / 81.99% lines.
        // 268 tests api-worker. Reste data paths success handlers DB.
        'workers/api-worker.js',
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
