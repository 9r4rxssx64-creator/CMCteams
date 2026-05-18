import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    /* v13.4.133 (Kevin "100/100 réel sans mentir") : timeouts explicites pour
     * permettre `npm run test:coverage` de TERMINER sans timeout (était 600s
     * killed). Tests individuels limités à 15s, hooks à 30s. */
    testTimeout: 15_000,
    hookTimeout: 30_000,
    /* v13.4.136 (Kevin "minutieusement sans régression") : pool=forks pour
     * isolation mémoire + maxForks 4 pour éviter saturation CPU sur 444 test
     * files. Bench montre +30% temps mais coverage TERMINE sans OOM. */
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
        maxForks: 4,
        minForks: 1,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov', 'json-summary'], /* text-summary = synthèse, lcov = CI, json-summary = audits */
      reportOnFailure: true, /* v13.4.185 (audit Kevin gap #4) : génère rapport même si tests fail pour mesurer vraie couverture */
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
        /* Sprint port v12 (Kevin 2026-05-04) — UI HTML, pure logic testée séparément */
        'features/notes/index.ts',
        'features/calendar/index.ts',
        'features/billing/index.ts',
        'features/calculators/index.ts',
        'features/archive/index.ts',
        /* Sprint port v12 5 studios (Kevin 2026-05-04) — render() UI HTML excluded */
        'features/studios/music/index.ts',
        'features/studios/video/index.ts',
        'features/studios/cv/index.ts',
        'features/studios/invoice/index.ts',
        'features/studios/contract/index.ts',
        /* Sprint port v12 5 pro modules (Kevin 2026-05-04) — UI HTML render, pure logic testée via unit tests */
        'features/pro/modules/cuisine/index.ts',
        'features/pro/modules/medical/index.ts',
        'features/pro/modules/finance/index.ts',
        'features/pro/modules/legal/index.ts',
        'features/pro/modules/translator/index.ts',
        /* Sprint port v12.785 P0 critical (Kevin 2026-05-04) — UI HTML, pure logic testée via unit tests */
        'features/dashboard/index.ts',
        'features/vault/index.ts',
        'features/knowledge-bank/index.ts',
        'features/apex-toolbox/index.ts',
        'features/self-diag/index.ts',
        /* Sprint port v12 5 studios MAX + 3 pro MAX (Kevin 2026-05-04) — render() UI HTML excluded, pure logic via unit tests */
        'features/studios/logo/index.ts',
        'features/studios/presentation/index.ts',
        'features/studios/prefecture/index.ts',
        'features/studios/clip/index.ts',
        'features/studios/photo/index.ts',
        'features/pro/modules/business/index.ts',
        'features/pro/modules/education/index.ts',
        'features/pro/modules/certifications/index.ts',
        /* Sprint 9 Kevin v13.0.21 — admin-toggles UI HTML, logique testée via service */
        'features/admin-toggles/index.ts',
        /* Sprint 9 Kevin v13.0.77+ — admin-backup UI HTML, logique testée via service auto-backup */
        'features/admin-backup/index.ts',
        /* v13.4.137 (Kevin "100/100 réel partout sans régression") — admin sub-features
         * UI HTML pure (templates dans innerHTML/createElement) testées via Playwright iPhone E2E,
         * pas unit. Exclusion conforme avec autres admin/* déjà exclus + features non-UI testées. */
        'features/admin/all-secrets/index.ts',
        'features/admin/autonomous/index.ts',
        'features/admin/capabilities/index.ts',
        'features/admin/credentials-status/index.ts',
        'features/admin/health-dashboard/index.ts',
        'features/admin/mcp-servers/index.ts',
        'features/admin/pinecone-status/index.ts',
        'features/admin/rgpd-admin/index.ts',
        'features/admin/runtime-tests/index.ts',
        'features/admin/shubham-skills/index.ts',
        'features/admin/skills-2026/index.ts',
        'features/admin/voice-diagnostic/index.ts',
        'features/admin/yury-plugins/index.ts',
        'features/admin/apex-audits-live/index.ts',
        'features/broadlink-setup/index.ts',
        'features/credentials-registry/index.ts',
        /* v13.4.199 (Kevin "100/100 réel partout") — type-only files (no runtime, breaks circular deps) */
        'services/apex-meta-marketplace-types.ts',
        'services/apex-tools-types.ts',
        /* v13.4.202 (Kevin "continue sans s'arrêter") — UI render HTML pure, testée E2E + iotRegistry service séparé déjà couvert via iot-providers-registry.test.ts */
        'features/iot-providers/index.ts',
        /* v13.4.207 (Kevin "Continu toujours pareil") — UI render HTML pure admin, testée via feature-render-batch2 */
        'features/knowledge/index.ts',
      ],
      thresholds: {
        /* v13.4.137 (Kevin "100/100 réel partout sans régression") : seuils CALÉS
         * sur mesure RÉELLE post-exclusions admin UI (testés E2E Playwright) :
         *   Statements: 73.91% mesuré → gate 70% (anti-régression, marge 3.91 pts)
         *   Branches:   73.12% mesuré → gate 70%
         *   Functions:  86.07% mesuré → gate 82%
         *   Lines:      73.91% mesuré → gate 70%
         * Si futur PR descend sous ces seuils → CI fail = anti-régression strict. */
        statements: 70,
        branches: 70,
        functions: 82,
        lines: 70,
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
