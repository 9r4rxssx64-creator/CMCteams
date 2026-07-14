// audit passe-2 — GARDE ANTI-XSS (ratchet) — corrige F-C2 + « cause racine → prévention »
// Empêche l'AJOUT de NOUVEAUX innerHTML avec interpolation de variable SANS esc().
// Les 10 occurrences existantes (baseline) sont des valeurs contrôlées-app (URLs blob,
// compteurs, couleurs, HTML pré-construit) — vérifiées échantillon dans audit/03.
// Toute NOUVELLE occurrence non échappée fait ÉCHOUER le gate → force esc() ou justification.
// (Ne remplace pas une revue, mais transforme la vérif manuelle en filet permanent.)
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
const lines = html.split('\n');

const BASELINE = 10; // ← ratchet. Faire BAISSER en nettoyant, jamais monter.
const SAFE = /esc\(|escapeHtml|_esc\(|String\(|renderMd|_cmcBreadcrumb|vMain\(\)|JSON\.stringify/;
const RISKY = /innerHTML *(\+?=) *[^;]*\+/;

const hits = [];
lines.forEach((l, i) => { if (RISKY.test(l) && !SAFE.test(l)) hits.push({ n: i + 1, txt: l.trim().slice(0, 110) }); });

console.log('\n=== GARDE XSS (innerHTML concat sans esc) ===');
console.log('  occurrences actuelles: ' + hits.length + ' · baseline autorisé: ' + BASELINE);
if (hits.length > BASELINE) {
  console.log('  ✗ RÉGRESSION — ' + (hits.length - BASELINE) + ' nouvelle(s) occurrence(s) non échappée(s) :');
  hits.slice(BASELINE).forEach((h) => console.log('    L' + h.n + ': ' + h.txt));
  console.log('\n❌ XSS GUARD : nouveau innerHTML non échappé. Utilise esc() sur les données, ou baisse le baseline si contrôlé-app.');
  process.exit(1);
}
if (hits.length < BASELINE) {
  console.log('  ℹ️  ' + (BASELINE - hits.length) + ' de moins que le baseline — pense à baisser BASELINE à ' + hits.length + ' dans ce fichier.');
}
console.log('✅ XSS GUARD : aucun nouveau innerHTML non échappé (≤ baseline)');
process.exit(0);
