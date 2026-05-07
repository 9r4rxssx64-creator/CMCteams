import { resolve } from 'node:path';

import { defineConfig } from 'vite';

import { cspNonceDynamic } from './vite-csp-nonce-plugin.js';

/* Audit Kevin v13.1.0 production-grade : bundle optimization
 * Cible : main + initial chunks < 50 KB gzip total, aucun chunk > 80 KB.
 * Stratégie : manualChunks splits par domaine + esbuild minify rapide.
 * NB : terser disponible via Vite (peer optional) si on veut compression +5%
 * mais esbuild suffit largement pour atteindre les budgets et est 20-40× plus rapide. */
export default defineConfig({
  plugins: [cspNonceDynamic()],
  base: './',
  root: '.',
  publicDir: 'assets',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    cssCodeSplit: true,
    /* v13.3.28 perf 100/100 (Kevin 2026-05-07) : sourcemaps 'hidden' = générés mais
     * non référencés dans le bundle prod → 5 MB économisés sur télécharg. user réel.
     * Maps disponibles côté serveur pour déboguer Sentry stack-traces (sentry-cli upload). */
    sourcemap: 'hidden',
    minify: 'esbuild',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 50 /* warn si chunk > 50 KB raw — proxy gzip ~16-20 KB */,
    /* P0-3 PERF (audit v13.2.5) : modulePreload trop agressif preload TOUS les chunks
     * dynamiquement importés au boot (apex-tools-dispatch, marketplaces, auto-improvement).
     * Filtre : preload uniquement les dépendances directes du chunk d'entrée principal.
     * Les chunks lazy (admin views, plugins, etc.) sont chargés à la demande.
     * v13.3.28 perf 100/100 (Kevin 2026-05-07) : élargi à 16 chunks heavy lazy
     * (apex-tools-registry, apex-kb, credential-patterns, monitoring …) — économisent
     * ~33 KB gzip au boot (4 modulepreload retirés). Charge à la demande quand user
     * navigue chat/admin/credentials/vault. */
    modulePreload: {
      resolveDependencies: (filename, deps): string[] => {
        const HEAVY_LAZY = [
          'apex-tools-dispatch',
          'apex-tools-registry',
          'apex-meta-marketplace',
          'auto-improvement',
          'apex-plugins-marketplace',
          'apex-extended-catalog',
          'apex-self-audit',
          'apex-claude-code-parity',
          'apex-kb',
          'apex-knowledge-base',
          'credential-patterns',
          'monitoring',
          'voice',
          'wake-word',
          'vision',
          'smart-camera',
          'preflight',
          'links-registry',
          'sentinels-registry',
          'sentinels',
          'feature-toggles',
          'device-control',
          'ai-router',
          'ai-providers-health',
          'auto-discover-links',
          'innovation-watch',
          'consumption-monitor',
          'unknown-credential-resolver',
          'multi-key-vault',
          'memory-bridge',
          'media-studio',
          'card-emulator',
          'badge-cloner',
          'network-scan',
          'financial-bilan',
          'personal-assistant',
          'auto-backup',
        ];
        return deps.filter((d) => !HEAVY_LAZY.some((h) => d.includes(h)));
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'core/[name]-[hash].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash][extname]',
        manualChunks: (id: string): string | undefined => {
          /* Audit Kevin v13.1.0 : split par domaine pour cap chaque chunk < 30 KB gzip */
          /* v13.3.57 PUSH-100 : fine-grain split + isolation chunks lazy */
          if (id.includes('apex-tools-dispatch')) return 'apex-tools-dispatch';
          if (id.includes('apex-tools') && !id.includes('apex-tools-dispatch')) return 'apex-tools-registry';
          if (id.includes('credential-patterns')) return 'credential-patterns';
          if (id.includes('voices-registry') || id.includes('services/voice')) return 'voice';
          if (id.includes('apex-knowledge-base')) return 'apex-kb';
          if (id.includes('sentry-bridge') || id.includes('observability')) return 'monitoring';
          /* v13.3.57 PUSH-100 : split auto-improvement en bloc lazy à la demande */
          if (id.includes('auto-improvement')) return 'auto-improvement';
          if (id.includes('innovation-watch')) return 'innovation-watch';
          if (id.includes('apex-plugins-marketplace')) return 'apex-plugins-marketplace';
          /* OCR offline lazy chunk (tesseract.js fallback) */
          if (id.includes('services/ocr-offline')) return 'ocr-offline';
          /* Multi-source-analyze isole : code dense (vision + OCR + extraction patterns) */
          if (id.includes('multi-source-analyze')) return 'multi-source-analyze';
          if (id.includes('node_modules')) {
            if (id.includes('dompurify')) return 'vendor-dompurify';
            if (id.includes('fuse.js')) return 'vendor-fuse';
          }
          return undefined;
        },
      },
    },
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
  server: {
    port: 5173,
    strictPort: true,
    open: false,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
