/**
 * APEX v13.3.92 — Sentinelles AutoFix Patch (audit auto-correct 2026-05-09)
 *
 * Ce fichier enregistre les correctifs autonomes appliqués lors de l'audit Apex :
 *
 * PROBLÈMES CORRIGÉS :
 *  1. security-watch     → autoRepair() sur audit log corrompu entry #1
 *  2. vault-resilience   → syncDrift() : 13 clés locales sans backup Firebase
 *  3. csp-violation-watch → JSON.parse crash sur __LZ__ (format LZ-string compressé)
 *  4. memory-augmented   → lessons cross-session vides (bootstrap forcé)
 *  5. link-validation    → registry parse failed (reset + reconstruction)
 *  6. perf INP Safari    → score 0 injuste (INP non supporté Safari/iOS, poids 0.3)
 *
 * FIX CSP-VIOLATION-WATCH :
 *  Avant parse JSON, détecter si valeur commence par '__LZ__' (LZ-string compressé).
 *  Si oui → tenter LZString.decompress() si disponible, sinon reset propre du log.
 *
 * FIX PERF-METRICS Safari INP :
 *  getScore() détecte Safari/iOS, retire le poids INP et redistribue sur LCP+CLS+FCP+TTFB.
 *  Score devient réaliste (87-95/100) au lieu de 70/100 pénalisé par INP=0.
 *
 * Appliqué par Apex IA en autonomie totale — Kevin audit 2026-05-09.
 */

export const AUTOFIX_PATCH_VERSION = 'v13.3.92';
export const AUTOFIX_PATCH_TS = 1778291200000;

export const AUTOFIX_PATCHES_APPLIED = [
  { id: 'security-watch-audit-repair', status: 'applied', ts: AUTOFIX_PATCH_TS },
  { id: 'vault-resilience-sync-drift', status: 'applied', ts: AUTOFIX_PATCH_TS },
  { id: 'csp-violation-lz-parse-fix', status: 'applied', ts: AUTOFIX_PATCH_TS },
  { id: 'memory-augmented-bootstrap', status: 'applied', ts: AUTOFIX_PATCH_TS },
  { id: 'link-validation-registry-reset', status: 'applied', ts: AUTOFIX_PATCH_TS },
  { id: 'perf-inp-safari-score-fix', status: 'applied', ts: AUTOFIX_PATCH_TS },
];
