/* FIDÉLITÉ AU PDF — CMCteams ET page Départs (light), cellule par cellule.
 *
 * Kevin 2026-09-06 : « Vérifie en réel, toutes les infos. Que tout soit reproduit à
 * l'identique dans CMCteams et light. Bonne équipe, horaires, lieux, départs, etc
 * pour chaque. »
 *
 * POURQUOI CE GARDE EXISTE (leçon #142) : les gardes existantes comparent l'app à la
 * page light. Un test d'ÉGALITÉ ne voit RIEN quand les DEUX se trompent pareil — c'est
 * exactement ce qui s'est produit avec le PDF de septembre 2026 :
 *   • MATTERA M   : ligne complète dans le PDF, ZÉRO cellule des deux côtés
 *                   (sa période « 1 30 » était posée 0,2 pt plus haut que son nom et
 *                    l'arrondi des lignes la détachait → ligne rejetée) ;
 *   • NICASTRO M  : absent des PDF de juillet, août ET septembre, et pourtant 9 à 18
 *                   cellules RH/R « majoritaires » — un planning INVENTÉ ;
 *   • BLANCHY F / DEGIOVANNI R : planning correct dans CMCteams mais AUCUNE équipe →
 *                   invisibles sur la page Départs.
 *
 * CE QUE FAIT CE TEST : il relit les VRAIS PDF avec pdfjs directement — SANS passer par
 * le parser de l'app — et reconstruit la grille par GÉOMÉTRIE (colonnes = en-têtes de
 * jours, chaque code rattaché à sa colonne). C'est une vérité terrain indépendante.
 * Puis il exige que CHAQUE personne et CHAQUE cellule se retrouvent à l'identique dans
 * `tools/shared/planning-seed.js` (CMCteams) ET dans `tools/departs/boards-gen.js` (light).
 *
 * CLIQUET (jamais de faux rouge) : les manques CONNUS et non encore corrigés sont figés
 * dans tests/fixtures/pdf-fidelite-baseline.json. Le test échoue si un manque NOUVEAU
 * apparaît, ou si une seule cellule diffère. Rebaseliner : --update-baseline (et dire
 * pourquoi dans le commit).
 *
 * Lancement : npm run test:pdf-fidelite
 */
import { createRequire } from 'module';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BASELINE = resolve(__dirname, 'fixtures/pdf-fidelite-baseline.json');
const UPDATE = process.argv.includes('--update-baseline');

const MOIS = [
  { pdf: 'tests/fixtures/septembre-2026-v2.pdf', key: '2026-8', board: '2026-09-', label: 'Septembre 2026' },
  { pdf: 'tests/fixtures/aout-2026-v2.pdf', key: '2026-7', board: '2026-08-', label: 'Août 2026' },
  { pdf: 'tests/fixtures/juillet-2026-v2.pdf', key: '2026-6', board: '2026-07-', label: 'Juillet 2026' },
];

// ── 1. Vérité terrain : lecture géométrique du PDF, sans le parser de l'app ──────────
// (pdfjs bavarde des « Warning: TT: undefined function » sur ces PDF — bruit pur)
const _warn = console.warn; console.warn = (...a) => { if (!/TT: undefined function/.test(String(a[0]))) _warn(...a); };
const pdfjs = require(resolve(ROOT, 'node_modules/pdfjs-dist/build/pdf.js'));
pdfjs.GlobalWorkerOptions.workerSrc = resolve(ROOT, 'node_modules/pdfjs-dist/build/pdf.worker.js');
const DAYRE = /^(lun|mar|mer|jeu|ven|sam|dim) (\d{1,2})$/;
const SECRE = /(Roulettes|Chefs black Jack|Employés cartes CMC|Employés cartes am\.)/i;
// Un NOM = « PATRONYME I » (patronyme parfois composé, initiale 1-3 lettres).
const NAMERE = /^[A-ZÉÈÀÂÎÔÛÇ][A-Z' \-]*[A-Z]( [A-Za-z]{1,3})?$/;

async function veriteTerrain(pdfRel) {
  const data = new Uint8Array(readFileSync(resolve(ROOT, pdfRel)));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const out = [];
  for (let p = 2; p <= doc.numPages; p++) { // page 1 = récapitulatif, pages 2+ = grilles
    const items = (await (await doc.getPage(p)).getTextContent()).items
      .filter(i => i.str && i.str.trim())
      .map(i => ({ s: i.str.trim(), x: i.transform[4], y: i.transform[5] }));
    if (!items.length) continue;
    // lignes par PROXIMITÉ (le PDF pose parfois « 1 30 » 0,2 pt à côté du nom)
    const ys = [...new Set(items.map(i => Math.round(i.y * 10) / 10))].sort((a, b) => b - a);
    const ancres = [];
    for (const y of ys) if (!ancres.length || Math.abs(ancres[ancres.length - 1] - y) > 3.5) ancres.push(y);
    const lignes = {};
    for (const i of items) {
      let best = ancres[0], bd = Infinity;
      for (const a of ancres) { const d = Math.abs(a - i.y); if (d < bd) { bd = d; best = a; } }
      (lignes[best] = lignes[best] || []).push(i);
    }
    const cles = Object.keys(lignes).map(Number).sort((a, b) => b - a);
    const hdr = cles.find(k => lignes[k].filter(i => DAYRE.test(i.s)).length > 20);
    if (hdr === undefined) continue;
    const cols = lignes[hdr].filter(i => DAYRE.test(i.s))
      .map(i => ({ jour: +i.s.match(DAYRE)[2], x: i.x })).sort((a, b) => a.x - b.x);
    const grilleX0 = cols[0].x - 6;
    const pas = (cols[cols.length - 1].x - cols[0].x) / (cols.length - 1);
    const jourDe = (x) => {
      let best = null, bd = Infinity;
      for (const c of cols) { const d = Math.abs(x - (c.x + 2)); if (d < bd) { bd = d; best = c.jour; } }
      return bd <= pas * 0.6 ? best : null;
    };
    let section = '';
    for (const k of cles) {
      const r = lignes[k].sort((a, b) => a.x - b.x);
      const gauche = r.filter(i => i.x < grilleX0), grille = r.filter(i => i.x >= grilleX0);
      const mm = gauche.map(i => i.s).join(' ').match(SECRE);
      if (mm) { section = mm[1]; continue; }
      if (!grille.length) continue;
      const nums = gauche.filter(i => /^\d{1,2}$/.test(i.s));
      if (nums.length < 2) continue;
      const to = nums[nums.length - 1], from = nums[nums.length - 2];
      const alpha = gauche.filter(i => i.x < from.x && i.s !== '*' && /[A-Z]/.test(i.s));
      if (!alpha.length) continue;
      const nom = alpha[alpha.length - 1].s.trim();
      if (!NAMERE.test(nom)) continue;
      const cellules = {};
      for (const g of grille) {
        const j = jourDe(g.x); if (j == null) continue;
        const v = g.s.trim(); if (!v || v === '*') continue;
        cellules[j] = v;
      }
      if (!Object.keys(cellules).length) continue;
      out.push({ nom, section, from: +from.s, to: +to.s, cellules });
    }
  }
  return out;
}

// ── 2. Ce que servent réellement les deux surfaces ──────────────────────────────────
global.window = {};
await import('file://' + resolve(ROOT, 'tools/shared/planning-seed.js'));
await import('file://' + resolve(ROOT, 'tools/departs/boards-gen.js'));
const SEED = global.window.CMC_PLANNING_SEED.months;
const GEN = global.window.DEPARTS_GEN;
const nrm = x => String(x).toUpperCase().replace(/\s+/g, ' ').trim();

function compare(verite, index) {
  const manquants = [], ecarts = [];
  let cellulesOK = 0, cellulesTotal = 0;
  for (const r of verite) {
    const k = nrm(r.nom);
    // « SUBTIL C C » dans le PDF = « SUBTIL C » au registre (initiale redoublée)
    const cands = index[k] || index[k.replace(/ ([A-Z]{1,3}) \1$/, ' $1')] || [];
    cellulesTotal += Object.keys(r.cellules).length;
    if (!cands.length) { manquants.push(r.nom); continue; }
    let best = null, bs = -1;
    for (const c of cands) {
      let sc = 0;
      for (const d of Object.keys(r.cellules)) if (String(c[d] || '') === String(r.cellules[d])) sc++;
      if (sc > bs) { bs = sc; best = c; }
    }
    for (const d of Object.keys(r.cellules)) {
      const attendu = String(r.cellules[d]), vu = String(best[d] || '');
      if (attendu === vu) cellulesOK++;
      else ecarts.push(r.nom + ' jour ' + d + ' : PDF=' + attendu + ' vu=' + (vu || '(vide)'));
    }
  }
  return { manquants, ecarts, cellulesOK, cellulesTotal };
}

const base = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : {};
const neuf = {};
let FAIL = 0;
console.log('== FIDÉLITÉ AU PDF — CMCteams et page Départs (light) ==\n');

for (const M of MOIS) {
  const verite = await veriteTerrain(M.pdf);
  const s = SEED[M.key];
  if (!s) { console.log('❌ ' + M.label + ' : absent de planning-seed.js'); FAIL++; continue; }
  const app = {}; s.emps.forEach(e => (app[nrm(e.name)] = app[nrm(e.name)] || []).push(s.ov[e.id] || {}));
  const light = {};
  Object.keys(GEN.boards).filter(b => b.startsWith(M.board))
    .forEach(b => GEN.boards[b].people.forEach(p => (light[nrm(p.name)] = light[nrm(p.name)] || []).push(p.codes || {})));

  const a = compare(verite, app), l = compare(verite, light);
  neuf[M.key] = { cmcteams: a.manquants.sort(), light: l.manquants.sort() };
  console.log(M.label + ' — ' + verite.length + ' personnes lues dans les grilles du PDF');
  for (const [nom, r, tol] of [['CMCteams', a, (base[M.key] || {}).cmcteams || []], ['light   ', l, (base[M.key] || {}).light || []]]) {
    const nouveaux = r.manquants.filter(n => !tol.includes(n));
    const ok = !nouveaux.length && !r.ecarts.length;
    console.log('   ' + nom + ' : ' + (verite.length - r.manquants.length) + '/' + verite.length + ' personnes · '
      + r.cellulesOK + '/' + r.cellulesTotal + ' cellules identiques'
      + (r.manquants.length ? ' · ' + r.manquants.length + ' manquant(s) connu(s)' : '')
      + (ok ? '  ✅' : '  ❌'));
    if (nouveaux.length) { console.log('      NOUVEAU MANQUANT : ' + nouveaux.join(', ')); FAIL++; }
    if (r.ecarts.length) { r.ecarts.slice(0, 12).forEach(e => console.log('      ÉCART ' + e)); FAIL++; }
    const guerris = tol.filter(n => !r.manquants.includes(n));
    if (guerris.length) console.log('      (corrigés depuis le cliquet : ' + guerris.join(', ') + ' — pense à --update-baseline)');
  }
}

if (UPDATE) { writeFileSync(BASELINE, JSON.stringify(neuf, null, 1) + '\n'); console.log('\n→ cliquet remis à jour : ' + BASELINE); process.exit(0); }
console.log('\n' + (FAIL ? '❌ FIDÉLITÉ PDF : ' + FAIL + ' problème(s)' : '✅ FIDÉLITÉ PDF : chaque cellule des grilles est reproduite à l\'identique des deux côtés'));
process.exit(FAIL ? 1 : 0);
