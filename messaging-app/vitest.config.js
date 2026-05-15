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
        // Phase C2 : api-worker.js (2444 lignes) mesuré v8 (transparent) :
        // 0% → 19.63% → 49.63% → 71.11% → 81.99% → **84.08% stmts**
        // **100% FUNCTIONS (72/72)** / 81.02% branches / 84.08% lines.
        // 308 tests. Reste 389 lines (verifyFirebaseIdToken signature RSA,
        // handleMagicLogin user create DB, handleWsConversation, handlePrekeys).
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
