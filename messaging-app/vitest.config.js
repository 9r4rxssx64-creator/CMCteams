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
    exclude: ['tests/e2e/**', 'e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['lib/**/*.js', 'workers/**/*.js'],
      exclude: [
        'tests/**',
        'node_modules/**',
        '**/*.test.js',
        '**/*.spec.js',
      ],
      // api-worker.js (~5800 lignes : OTP, admin, JWT, premium) n'est PLUS caché
      // (audit 2026-07-07). Il est MESURÉ avec un plancher dédié anti-régression
      // au lieu d'être exclu du gate (règle "jamais estimer, toujours mesurer" +
      // "le filet ne doit pas mentir sur le fichier le plus critique"). Couverture
      // RÉELLE mesurée ce jour : 82.49% stmts / 76.29% branches / 88.27% funcs.
      // Plancher = quelques points sous l'actuel (marge anti-flaky), à remonter.
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
        'workers/api-worker.js': {
          statements: 80,
          branches: 74,
          functions: 86,
          lines: 80,
        },
      },
    },
  },
});
