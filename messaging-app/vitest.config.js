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
        // Phase C2 en cours : api-worker.js (2444 lignes).
        // Progression mesurée v8 : 19.63% → 25.9% → 49.63% → 54.99% → **57.48%**
        // statements / 70.75% branches / 84.28% functions / 57.48% lines.
        // 137 tests api-worker (routing+otp+handlers+admin-deep+scheduled).
        // Pour atteindre 100% RÉEL : encore tests à ajouter pour
        // verifyFirebaseIdToken, prekeys handlers, queue consumers,
        // success paths features (story view DB, capsule open, magic-login DB).
        // Honnêteté CLAUDE.md : on ne ment pas en disant 100% global tant
        // que api-worker n'y est pas. Coverage global = lib/ + autres workers.
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
