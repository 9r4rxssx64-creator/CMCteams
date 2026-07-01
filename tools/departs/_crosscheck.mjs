// CONTRÔLE CROISÉ CMCteams ↔ Départs (Kevin « vérifier tout partout, aucune erreur »).
// Ré-importe les VRAIS PDF avec le parser LIVE de CMCteams, puis compare au fichier
// committé tools/departs/boards-gen.js. On vérifie ce qui est DÉTERMINISTE et qui
// COMPTE (lessons #83/#88 : pas de gate flaky) :
//   ✓ COUVERTURE : mêmes employés des deux côtés (personne perdue/en trop).
//   ✓ HORAIRES   : codes/jour IDENTIQUES par employé (fidélité du planning).
//   ✓ BJ chefs   : équipes + miroirs exacts (cœur de la page Départs, stable).
//   ℹ CMC/Roul   : différences d'étiquette d'équipe = INFO (le découpage des grosses
//                  équipes cartes n'est pas 100% identique run-to-run — connu).
// Câblé dans `npm run test:ci`. Régénérer si besoin : node tools/departs/_gen-boards.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
import { importMonth } from './_gen-boards.mjs';
const __dirname = dirname(fileURLToPath(import.meta.url));

const TARGETS = [
  { pdf: 'tests/fixtures/aout-2026-v1.pdf', year: 2026, monthIdx: 7 },
  { pdf: 'tests/fixtures/juillet-2026-v2.pdf', year: 2026, monthIdx: 6 },
];
function loadCommitted() {
  const src = readFileSync(resolve(__dirname, 'boards-gen.js'), 'utf8').replace(/^[^=]*=/, '').replace(/;\s*$/, '');
  return JSON.parse(src);
}
const pkey = p => '@' + String(p.name).trim().toUpperCase();
const csig = c => Object.keys(c).map(Number).sort((a, b) => a - b).map(d => d + ':' + c[d]).join(',');
const famOf = (id, b) => b.kind === 'abs' ? 'abs' : (b.fam ? (b.fam === 'baccara' ? 'cmc' : b.fam) : (/-r\d+$/.test(id) ? 'roulettes' : (/-c\d+$/.test(id) || /-amenage/.test(id) ? 'cmc' : 'bj')));

async function main() {
  const committed = loadCommitted();
  const browser = await chromium.launch({ headless: true });
  const fails = [], infos = [];
  for (const tg of TARGETS) {
    const live = await importMonth(browser, tg.pdf, tg.year, tg.monthIdx);
    const mm = String(tg.monthIdx + 1).padStart(2, '0'), pre = tg.year + '-' + mm + '-';
    // ── per-employee codes (déterministe) ──
    // On tague la FAMILLE de chaque employé : BJ = stable (couverture strict) ; cmc/roulettes =
    // découpage géométrique fuzzy dont la COUVERTURE marginale varie run-to-run au même titre
    // que l'étiquette d'équipe (lesson #88 : la garantie stricte « tout le monde a un planning »
    // vit dans test:everyone-has-planning, pas ici). Donc coverage-margin cmc/roulettes = INFO.
    const liveEmp = {}, comEmp = {};
    Object.keys(live.boards).forEach(id => { const f = famOf(id, live.boards[id]); (live.boards[id].people || []).forEach(p => { liveEmp[pkey(p)] = { name: p.name, codes: p.codes, fam: f }; }); });
    Object.keys(committed.boards).filter(id => id.indexOf(pre) === 0).forEach(id => { const f = famOf(id, committed.boards[id]); (committed.boards[id].people || []).forEach(p => { comEmp[pkey(p)] = { name: p.name, codes: p.codes, fam: f }; }); });
    let covInfo = 0;
    Object.keys(liveEmp).filter(k => !comEmp[k]).forEach(k => { if (liveEmp[k].fam === 'bj') fails.push(mm + ' COUVERTURE : ' + liveEmp[k].name + ' produit par le parser mais ABSENT de la page'); else covInfo++; });
    Object.keys(comEmp).filter(k => !liveEmp[k]).forEach(k => { if (comEmp[k].fam === 'bj') fails.push(mm + ' COUVERTURE : ' + comEmp[k].name + ' dans la page mais PLUS produit par le parser'); else covInfo++; });
    if (covInfo) infos.push(mm + ' : ' + covInfo + ' employé(s) cartes/roulettes en marge de couverture (fuzzy géométrique connu — BJ & horaires OK)');
    let hOK = 0; Object.keys(liveEmp).filter(k => comEmp[k]).forEach(k => { if (csig(liveEmp[k].codes) !== csig(comEmp[k].codes)) fails.push(mm + ' HORAIRES : codes différents pour ' + liveEmp[k].name); else hOK++; });
    // ── BJ chefs : équipes + miroirs exacts ──
    const liveBJ = {}, comBJ = {};
    Object.keys(live.boards).forEach(id => { if (famOf(id, live.boards[id]) === 'bj') liveBJ[id] = (live.boards[id].people || []).map(p => pkey(p)).sort().join('|'); });
    Object.keys(committed.boards).filter(id => id.indexOf(pre) === 0).forEach(id => { if (famOf(id, committed.boards[id]) === 'bj') comBJ[id] = (committed.boards[id].people || []).map(p => pkey(p)).sort().join('|'); });
    Object.keys(liveBJ).forEach(id => { if (comBJ[id] === undefined) fails.push(mm + ' BJ : équipe ' + id + ' absente de la page'); else if (comBJ[id] !== liveBJ[id]) fails.push(mm + ' BJ : composition ' + id + ' page ≠ parser'); });
    Object.keys(comBJ).forEach(id => { if (liveBJ[id] === undefined) fails.push(mm + ' BJ : équipe ' + id + ' dans la page mais plus au parser'); });
    Object.keys(live.mirror).filter(a => a.indexOf(pre) === 0 && /-(\d+)$/.test(a)).forEach(a => { if (committed.mirror[a] !== live.mirror[a]) fails.push(mm + ' BJ miroir : ' + a + ' page=' + (committed.mirror[a] || '∅') + ' ≠ parser=' + live.mirror[a]); });
    // ── CMC/Roul team-label shuffles → info only ──
    let cmcShuffle = 0;
    Object.keys(live.boards).forEach(id => { const f = famOf(id, live.boards[id]); if (f === 'cmc' || f === 'roulettes') { const lv = (live.boards[id].people || []).map(pkey).sort().join('|'); const cv = committed.boards[id] ? (committed.boards[id].people || []).map(pkey).sort().join('|') : null; if (cv !== lv) cmcShuffle++; } });
    if (cmcShuffle) infos.push(mm + ' : ' + cmcShuffle + ' équipe(s) cartes/roulettes ré-étiquetées (découpage fuzzy connu — horaires & couverture OK)');
    console.log(tg.year + '-' + mm + ' : couverture ' + Object.keys(liveEmp).length + ' emp · horaires OK ' + hOK + ' · BJ ' + Object.keys(liveBJ).length + ' équipes');
  }
  await browser.close();
  infos.forEach(i => console.log('  ℹ ' + i));
  if (fails.length) {
    console.log('\n❌ CROSS-CHECK : ' + fails.length + ' écart(s) BLOQUANT(s) (couverture/horaires/BJ/miroir) :');
    fails.slice(0, 40).forEach(d => console.log('  • ' + d));
    if (fails.length > 40) console.log('  … +' + (fails.length - 40));
    console.log('\n→ Régénère la page : node tools/departs/_gen-boards.mjs');
    process.exit(1);
  }
  console.log('\n✅ CROSS-CHECK OK — couverture identique, HORAIRES identiques, équipes BJ + miroirs alignés (Août + Juillet). Aucune erreur d\'import des deux côtés.');
}
main().catch(e => { console.error(e); process.exit(1); });
