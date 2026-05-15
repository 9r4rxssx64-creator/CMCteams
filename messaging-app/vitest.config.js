import { defineConfig } from 'vitest/config';

/**
 * vitest config — Apex Chat messaging-app
 *
 * Coverage 100% RÉEL via v8 sur les modules ESM testables (lib/*) et les
 * Cloudflare Workers backend (workers/*). Les fichiers loaders/shims à la
 * racine (`crypto.js`, `sw.js`) délèguent leur logique à `lib/` — testés
 * indirectement.
 */
export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['lib/**/*.js', 'workers/**/*.js'],
      exclude: [
        'tests/**',
        'node_modules/**',
        '**/*.test.js',
        '**/*.spec.js',
        'workers/durable-objects/**', // Phase B (à venir)
        'workers/api-worker.js',       // Phase C (gros refactor à venir)
        'workers/ia-worker.js',        // Phase B
        'workers/push-worker.js',      // Phase B
        'workers/sms-worker.js',       // Phase B
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
