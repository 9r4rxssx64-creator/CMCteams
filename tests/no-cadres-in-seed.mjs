/* GARDE : aucun CADRE (Pit Boss/Superviseur/Inspecteur, id P#####) dans le seed
 * ni dans les boards (Kevin 2026-07-09 « il ne peut plus y avoir de cadre présent
 * dans les plannings »). Les cadres viennent d'un 2e PDF séparé (lesson #70) et ne
 * font PAS partie du planning chefs/employés. Test pur node (rapide, déterministe).
 * Homonymes CHEFS (LANDAU B / ENZA B / CAMPI PH, id U#####) doivent RESTER présents.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const isCad = id => /^P\d/.test(id);
let fails = [];

// 1) SEED : aucun emp/ov cadre
const S = JSON.parse(readFileSync(resolve(ROOT, 'tools/shared/planning-seed.js'), 'utf8').replace(/^[^=]*=/, '').replace(/;\s*$/, ''));
for (const key of Object.keys(S.months)) {
  const mo = S.months[key];
  const cadEmps = (mo.emps || []).filter(e => isCad(e.id)).map(e => e.id);
  const cadOv = Object.keys(mo.ov || {}).filter(isCad);
  if (cadEmps.length) fails.push(`seed ${key}: cadres dans emps → ${cadEmps.join(',')}`);
  if (cadOv.length) fails.push(`seed ${key}: cadres dans ov → ${cadOv.join(',')}`);
}

// 2) BOARDS : aucun NOM de cadre connu (les boards utilisent des noms)
const G = JSON.parse(readFileSync(resolve(ROOT, 'tools/departs/boards-gen.js'), 'utf8').replace(/^[^=]*=/, '').replace(/;\s*$/, ''));
const CADRE_NAMES = ['LANDAU J', 'PETIT J', 'ENZA C', 'DI COLANGELO F', 'CAMPI H'];
const HOMO_CHEFS = ['LANDAU B', 'ENZA B', 'CAMPI PH']; // à GARDER
let boardHits = [], homoSeen = new Set();
Object.keys(G.boards).forEach(k => (G.boards[k].people || []).forEach(p => {
  if (CADRE_NAMES.includes(p.name)) boardHits.push(k + ':' + p.name);
  if (HOMO_CHEFS.includes(p.name)) homoSeen.add(p.name);
}));
if (boardHits.length) fails.push(`boards: noms de cadre présents → ${boardHits.join(', ')}`);
HOMO_CHEFS.forEach(n => { if (!homoSeen.has(n)) fails.push(`boards: homonyme CHEF ${n} MANQUANT (ne pas supprimer les chefs !)`); });

console.log('== GARDE cadres hors planning ==');
console.log(`  Seed: ${Object.keys(S.months).length} mois vérifiés · Boards: ${Object.keys(G.boards).length}`);
console.log(`  Homonymes CHEFS conservés: ${[...homoSeen].join(', ') || '(aucun)'}`);
if (fails.length) { fails.forEach(f => console.log('   ❌ ' + f)); console.log('\n❌ CADRES DÉTECTÉS DANS LE PLANNING'); process.exit(1); }
console.log('\n✅ Aucun cadre (P#####) dans le seed ni les boards · homonymes chefs préservés.');
