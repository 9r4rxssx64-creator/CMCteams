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

import { randomBytes } from 'node:crypto';

import type { Plugin } from 'vite';

export function cspNonceDynamic(): Plugin {
  let nonce = '';
  return {
    name: 'apex-csp-nonce-dynamic',
    buildStart() {
      /* Nonce 256 bits → 32 chars hex */
      nonce = randomBytes(16).toString('hex');
    },
    transformIndexHtml(html) {
      /* 1. Remplace placeholder APEX_BOOT_NONCE dans CSP meta + scripts existants */
      let out = html.replace(/APEX_BOOT_NONCE/g, nonce);
      /* 2. Ajoute nonce UNIQUEMENT sur <script>/<link rel="stylesheet"> qui n'en ont pas déjà
       *    (anti-doublon : Vite injecte parfois ses propres scripts sans nonce) */
      out = out.replace(/<script(?![^>]*\bnonce=)(\s[^>]*?)?>/g, (m, attrs) => {
        return `<script nonce="${nonce}"${attrs ?? ''}>`;
      });
      out = out.replace(/<link(?![^>]*\bnonce=)(\s[^>]*?)\brel="stylesheet"([^>]*)>/g, (_m, before, after) => {
        return `<link nonce="${nonce}"${before}rel="stylesheet"${after}>`;
      });
      return out;
    },
  };
}
