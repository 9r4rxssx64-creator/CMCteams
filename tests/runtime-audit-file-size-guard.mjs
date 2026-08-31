// audit passe-5 — GARDE ANTI-CROISSANCE DU MONO-FICHIER (F-B1) — « mise sous contrôle »
// F-B1 = index.html est un SPA mono-fichier de ~49 630 lignes / ~3,33 Mo (dette structurelle
// documentée CLAUDE.md « monolith > 15K lignes »). On ne peut PAS le découper en une passe
// sans risque (globals partagés entre blocs <script> inline concaténés au build) : aucun
// doublon de fonction global à retirer (v9.807 les a déjà supprimés ; les « doublons »
// restants sont des helpers LOCAUX homonymes, scopés à leur parent — pas du code mort).
//
// À défaut de découpe sûre, on MET LA DETTE SOUS CONTRÔLE : un plafond ratchet interdit
// que le fichier GROSSISSE au-delà d'une marge. Objectif = FAIRE BAISSER ces plafonds au fil
// des extractions futures, JAMAIS les relever pour accommoder une croissance. Un dépassement
// = signal « ce nouveau code doit-il vraiment vivre dans index.html, ou dans un module externe
// / une autre app ? » (logique Phase 8 : empêcher la dette d'empirer, pas un pansement).
import { statSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX = resolve(__dirname, '../index.html');

// Baseline mesuré 2026-07-14 : 3 330 288 o / 49 630 lignes. Marge ~3 % (croissance normale
// tolérée), au-delà = revue requise. Ces plafonds ne doivent DESCENDRE, jamais monter.
const MAX_BYTES = 3_430_000;
const MAX_LINES = 51_000;

const bytes = statSync(INDEX).size;
const lines = readFileSync(INDEX, 'utf8').split('\n').length;
const fail = [];
if (bytes > MAX_BYTES) fail.push('taille ' + bytes.toLocaleString('fr') + ' o > plafond ' + MAX_BYTES.toLocaleString('fr') + ' o');
if (lines > MAX_LINES) fail.push('lignes ' + lines.toLocaleString('fr') + ' > plafond ' + MAX_LINES.toLocaleString('fr'));

console.log('\n=== GARDE MONO-FICHIER (F-B1) ===');
console.log('  index.html : ' + bytes.toLocaleString('fr') + ' o (plafond ' + MAX_BYTES.toLocaleString('fr') + ') · ' + lines.toLocaleString('fr') + ' lignes (plafond ' + MAX_LINES.toLocaleString('fr') + ')');
console.log('  marge restante : ' + Math.round((MAX_BYTES - bytes) / 1024) + ' Ko · ' + (MAX_LINES - lines) + ' lignes');
if (fail.length) {
  fail.forEach((f) => console.log('  ✗ ' + f));
  console.log('\n❌ MONO-FICHIER : index.html a franchi le plafond. NE PAS relever le plafond pour l\'accommoder —');
  console.log('   extraire le nouveau code dans un module externe / une autre surface, OU justifier + rebaseliner.');
  process.exit(1);
}
console.log('✅ MONO-FICHIER : sous le plafond (la dette n\'empire pas ; objectif = faire baisser les plafonds)');
process.exit(0);
