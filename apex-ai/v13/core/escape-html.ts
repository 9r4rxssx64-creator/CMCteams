/**
 * APEX v13.4.185 — escapeHtml centralisé (Kevin "Go tout", gap audit #5).
 *
 * Audit indépendant v13.4.183 a flaggé 77 fichiers qui dupliquent
 * `function escapeHtml(s: string): string` en copy-paste. Maintenance réduite.
 *
 * Source unique ici. Migrations 77 duplicats → import centralisé en wave
 * (v13.4.186+).
 *
 * Implementation conforme aux 77 versions copiées : escape les 5 chars
 * dangereux (`& < > " '`) pour innerHTML XSS-safe.
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Échappe une string pour insertion safe dans innerHTML.
 * Pure, déterministe, XSS-safe sur les 5 chars critiques.
 *
 * Accepte string/number/boolean (auto-stringify via String()) pour ergonomie —
 * v13.4.186 widening pour préserver le contrat historique de html-safe.ts.
 *
 * @param s valeur user-controlled à échapper (peut être null/undefined)
 * @returns string avec entités HTML
 */
export function escapeHtml(s: string | number | boolean | null | undefined): string {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>"']/g, (c) => HTML_ESCAPE_MAP[c] ?? c);
}

/**
 * Variant qui accepte aussi number/boolean (auto-stringify).
 * Utile pour interpolation directe dans templates.
 */
export function esc(v: string | number | boolean | null | undefined): string {
  if (v === null || v === undefined) return '';
  return escapeHtml(String(v));
}
