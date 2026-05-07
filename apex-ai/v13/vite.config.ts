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
    sourcemap: true,
    minify: 'esbuild',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 50 /* warn si chunk > 50 KB raw — proxy gzip ~16-20 KB */,
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
          if (id.includes('apex-tools-dispatch')) return 'apex-tools-dispatch';
          if (id.includes('apex-tools') && !id.includes('apex-tools-dispatch')) return 'apex-tools-registry';
          if (id.includes('credential-patterns')) return 'credential-patterns';
          if (id.includes('voices-registry') || id.includes('services/voice')) return 'voice';
          if (id.includes('apex-knowledge-base')) return 'apex-kb';
          if (id.includes('sentry-bridge') || id.includes('observability')) return 'monitoring';
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
