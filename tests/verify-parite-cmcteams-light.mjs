/* GARDE-FOU — CMCteams et la page light doivent TOUJOURS porter les mêmes mois.
 *
 * Kevin 2026-09-02 : « Fais CMCteams et light aussi, toujours. Note-le. »
 * Il l'a dit en me prenant en flagrant délit : je venais d'importer septembre
 * dans la page Départs (tools/departs/boards-gen.js) et PAS dans l'app
 * principale (tools/shared/planning-seed.js). Résultat : la light affichait
 * septembre, CMCteams s'arrêtait en août. Deux surfaces, une seule vérité —
 * elles doivent bouger ENSEMBLE.
 *
 * Ce test compare, sans rien supposer :
 *   1. la LISTE DE PDF des deux générateurs (_gen-seed.mjs / _gen-boards.mjs) ;
 *   2. les MOIS réellement présents dans les deux fichiers produits ;
 *   3. que chaque mois porte un effectif crédible des deux côtés.
 *
 * Lancer : node tests/verify-parite-cmcteams-light.mjs
 */
import { readFileSync } from 'node:fs';

const R = { ok: [], ko: [] };
const chk = (c, m) => (c ? R.ok : R.ko).push(m);
const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet',
  'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

/* --- 1. les deux générateurs visent-ils les mêmes PDF ? -------------------- */
const pdfsDe = (f) => [...readFileSync(f, 'utf8')
  .matchAll(/pdf:\s*'([^']+\.pdf)'/g)].map((m) => m[1]).sort();
const pSeed = pdfsDe('tools/shared/_gen-seed.mjs');
const pBoards = pdfsDe('tools/departs/_gen-boards.mjs');
chk(pSeed.length > 0 && pBoards.length > 0, `PDF listés : ${pSeed.length} (CMCteams) / ${pBoards.length} (light)`);
const manqueLight = pSeed.filter((p) => !pBoards.includes(p));
const manqueSeed = pBoards.filter((p) => !pSeed.includes(p));
chk(manqueLight.length === 0 && manqueSeed.length === 0,
  manqueLight.length === 0 && manqueSeed.length === 0
    ? 'les deux générateurs visent EXACTEMENT les mêmes PDF'
    : `LISTES DÉSACCORDÉES — absent de light : ${manqueLight.join(', ') || '—'} · absent de CMCteams : ${manqueSeed.join(', ') || '—'}`);

/* --- 2. les mois réellement produits --------------------------------------- */
globalThis.window = globalThis;
// eslint-disable-next-line no-eval
eval(readFileSync('tools/shared/planning-seed.js', 'utf8'));
const SEED = globalThis.window.CMC_PLANNING_SEED || { months: {} };
// eslint-disable-next-line no-eval
eval(readFileSync('tools/departs/boards-gen.js', 'utf8'));
const GEN = globalThis.window.DEPARTS_GEN || { boards: {}, months: [] };

/* Le seed indexe par "année-moisIdx" ; les boards portent le mois dans le libellé. */
const moisSeed = new Set(Object.keys(SEED.months || {}).map((k) => {
  const [y, m] = k.split('-'); return MOIS[+m] + ' ' + y;
}));
const moisLight = new Set(Object.values(GEN.boards || {})
  .map((b) => (b.label || '').split(' — ')[0]).filter(Boolean));

const absentLight = [...moisSeed].filter((m) => !moisLight.has(m));
const absentSeed = [...moisLight].filter((m) => !moisSeed.has(m));
chk(absentLight.length === 0 && absentSeed.length === 0,
  absentLight.length === 0 && absentSeed.length === 0
    ? `mêmes mois des deux côtés : ${[...moisSeed].join(' · ')}`
    : `MOIS DÉSACCORDÉS — dans CMCteams sans être dans light : ${absentLight.join(', ') || '—'} · dans light sans être dans CMCteams : ${absentSeed.join(', ') || '—'}`);

/* --- 3. effectif crédible des deux côtés ------------------------------------ */
console.log('  mois            CMCteams   light');
console.log('  ' + '─'.repeat(40));
[...moisSeed].sort().forEach((lab) => {
  const cle = Object.keys(SEED.months).find((k) => {
    const [y, m] = k.split('-'); return MOIS[+m] + ' ' + y === lab;
  });
  const nSeed = cle ? Object.keys(SEED.months[cle].ov || {}).length : 0;
  const idsL = Object.keys(GEN.boards).filter((id) => (GEN.boards[id].label || '').startsWith(lab));
  const nLight = new Set(idsL.flatMap((id) => (GEN.boards[id].people || []).map((p) => p.name))).size;
  console.log(`  ${lab.padEnd(16)}${String(nSeed).padStart(6)}${String(nLight).padStart(9)}`);
  chk(nSeed > 100 && nLight > 100, `${lab} : effectif crédible (${nSeed} / ${nLight})`);
});
console.log();

R.ko.forEach((m) => console.log('  FAIL ' + m));
R.ok.forEach((m) => console.log('  OK   ' + m));
console.log(`\n=== ${R.ok.length} OK / ${R.ko.length} FAIL ===`);
if (R.ko.length) {
  console.log('\n⚠️  Un mois importé d\'un seul côté = CMCteams et la page Départs désaccordées.');
  console.log('    Relancer LES DEUX : node tools/shared/_gen-seed.mjs && node tools/departs/_gen-boards.mjs');
}
process.exit(R.ko.length ? 1 : 0);
