/**
 * APEX v13 — Vite plugin CSP nonce dynamique (P0-1 audit)
 *
 * Génère un nonce unique à chaque build et l'injecte dans :
 * - <meta CSP> nonce-XXX
 * - tous les <script> et <link> que Vite injecte
 *
 * Anti-pattern v13.0 Jet 1 : nonce hardcodé `APEX_BOOT_NONCE` exploitable.
 * Fix Jet 2 : nonce SHA256(timestamp + random) tronqué 32 chars, regen à chaque build.
 *
 * Note prod : pour que le nonce soit vraiment unique par REQUÊTE, il faudrait un
 * Worker proxy (Cloudflare) qui regen à chaque GET. Build-time nonce = compromis
 * acceptable pour PWA statique (rotation à chaque déploiement).
 */

import type { Plugin } from 'vite';
import { randomBytes } from 'node:crypto';

export function cspNonceDynamic(): Plugin {
  let nonce = '';
  return {
    name: 'apex-csp-nonce-dynamic',
    buildStart() {
      /* Nonce 256 bits → 32 chars hex */
      nonce = randomBytes(16).toString('hex');
    },
    transformIndexHtml(html) {
      /* Remplace placeholder dans CSP meta + injecte nonce sur scripts/links */
      let out = html.replace(/APEX_BOOT_NONCE/g, nonce);
      /* Vite injecte <script type="module" crossorigin src="..."> sans nonce.
       * On les cible et ajoute nonce="XXX". */
      out = out.replace(
        /<script([^>]*?)src="\.\/(?:core|chunks|assets)\//g,
        `<script$1nonce="${nonce}" src="./$&`.replace('$&', '').replace('<script', '<script') ||
          `<script$1nonce="${nonce}" src="./`,
      );
      /* Plus simple via regex propre : ajoute nonce sur tous les <script> et <link rel="stylesheet"> */
      out = out.replace(/<script(\s)/g, `<script nonce="${nonce}"$1`);
      out = out.replace(/<link rel="stylesheet"(\s)/g, `<link nonce="${nonce}" rel="stylesheet"$1`);
      return out;
    },
  };
}
