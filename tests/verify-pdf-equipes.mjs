/* FIDÉLITÉ AU PDF — LES ÉQUIPES, d'après le RÉCAPITULATIF (page 1) du planning SBM.
 *
 * Kevin 2026-09-10 : « Vérifie dans CMCteams et light, il y a des erreurs. Personnes dans
 * les mauvaises équipes, mauvaises horaires. Vérifie en réel, comme moi. Aucune erreur
 * n'est tolérée. Des gens travaillent avec ces informations. »
 *
 * POURQUOI : `test:pdf-fidelite` compare les CELLULES (codes jour par jour) et passe au
 * vert ; aucun test ne comparait les ÉQUIPES au PDF. Or la page 1 du PDF SBM est un
 * récapitulatif où chaque équipe est un BLOC : en-tête « <effectif> <horaire du 1er jour>
 * du au », puis la liste des membres. Deux rangées de blocs par section = équipe et son
 * miroir (mêmes colonnes). C'est la représentation officielle des équipes par SBM — la
 * même règle que celle de Kevin (mêmes repos + mêmes codes = une équipe).
 *
 * CE QUE FAIT CE TEST : il lit la page 1 avec pdfjs par GÉOMÉTRIE (6 colonnes de blocs,
 * pas ≈ 101,5 pt ; les colonnes se lisent chacune de haut en bas), reconstruit les blocs
 * d'équipe (seuls les en-têtes à HORAIRE comptent — M/CP/FORMATION/CSS sont des encadrés
 * d'absence, pas des équipes), vérifie que l'effectif lu == l'effectif écrit dans l'en-tête
 * (auto-contrôle du parseur), puis exige que CHAQUE bloc soit exactement UNE équipe dans
 * `tools/shared/planning-seed.js` (CMCteams) ET dans `tools/departs/boards-gen.js` (light),
 * et que les deux rangées d'une même colonne soient déclarées MIROIRS.
 *
 * Lancement : npm run test:pdf-equipes   (option --detail pour lister tous les blocs)
 */
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DETAIL = process.argv.includes('--detail');

export const MOIS = [
  { pdf: 'tests/fixtures/octobre-2026.pdf', key: '2026-9', board: '2026-10-', label: 'Octobre 2026' },
  { pdf: 'tests/fixtures/septembre-2026-v2.pdf', key: '2026-8', board: '2026-09-', label: 'Septembre 2026' },
  { pdf: 'tests/fixtures/aout-2026-v2.pdf', key: '2026-7', board: '2026-08-', label: 'Août 2026' },
  { pdf: 'tests/fixtures/juillet-2026-v2.pdf', key: '2026-6', board: '2026-07-', label: 'Juillet 2026' },
];

const _warn = console.warn; console.warn = (...a) => { if (!/TT: undefined function/.test(String(a[0]))) _warn(...a); };
const pdfjs = require(resolve(ROOT, 'node_modules/pdfjs-dist/build/pdf.js'));
pdfjs.GlobalWorkerOptions.workerSrc = resolve(ROOT, 'node_modules/pdfjs-dist/build/pdf.worker.js');

const PAS = 101.5;                                   // largeur d'une colonne de blocs (pt)
const HORAIRE = /^(\d{1,2}\/\d{1,2}[^A-Za-z0-9]*c?[^A-Za-z0-9]*|RH|R)$/;   // 20/5, 19/4"", 22/6'c (chefs), RH, R
const NAMERE = /^[A-ZÉÈÀÂÎÔÛÇ][A-Z' \-]*[A-Z]( [A-Za-z]{1,3})?$/;
const SECTION = /^(Roulettes|Chefs black Jack|Employés cartes)/i;
export const nrm = x => String(x).toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

/** Lit la page 1 : retourne [{section, rangee, col, count, code, membres:[{nom,from,to}]}]. */
export async function blocsRecap(pdfRel) {
  const data = new Uint8Array(readFileSync(resolve(ROOT, pdfRel)));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const items = (await (await doc.getPage(1)).getTextContent()).items
    .filter(i => i.str && i.str.trim())
    .map(i => ({ s: i.str.trim(), x: i.transform[4], y: i.transform[5] }));
  // Sections : titres centrés au-dessus de chaque groupe de rangées, du haut vers le bas
  const sections = items.filter(i => SECTION.test(i.s)).sort((a, b) => b.y - a.y);
  const sectionAt = y => { const s = sections.filter(t => t.y > y).pop(); return s ? s.s.replace(/\/.*$/, '').trim() : ''; };   // le titre le plus PROCHE au-dessus
  // Lignes par proximité (comme le test des cellules : « 1 30 » peut être 0,3 pt à côté)
  const ys = [...new Set(items.map(i => Math.round(i.y * 10) / 10))].sort((a, b) => b - a);
  const ancres = [];
  for (const y of ys) if (!ancres.length || Math.abs(ancres[ancres.length - 1] - y) > 3) ancres.push(y);
  const ligne = i => { let b = ancres[0], bd = Infinity; for (const a of ancres) { const d = Math.abs(a - i.y); if (d < bd) { bd = d; b = a; } } return b; };
  const parCol = {};                                  // col → ancre → items (triés par x)
  for (const i of items) { const c = Math.floor(i.x / PAS); ((parCol[c] = parCol[c] || {})[ligne(i)] = parCol[c][ligne(i)] || []).push(i); }
  const blocs = [];
  for (const c of Object.keys(parCol).map(Number).sort((a, b) => a - b)) {
    const lignes = Object.keys(parCol[c]).map(Number).sort((a, b) => b - a);
    let bloc = null;
    for (const y of lignes) {
      const r = parCol[c][y].sort((a, b) => a.x - b.x).map(i => i.s);
      // en-tête « N <horaire> du au » (ou « N <M|CP|…> du au » = encadré d'absence → ferme le bloc)
      const h = r.findIndex((s, k) => /^\d{1,2}$/.test(s) && r[k + 2] === 'du' && r[k + 3] === 'au');
      if (h >= 0) {
        bloc = HORAIRE.test(r[h + 1]) && +r[h] > 0
          ? { section: sectionAt(y), col: c, y, count: +r[h], code: r[h + 1], membres: [], sousBlocs: [] } : null;
        if (bloc) blocs.push(bloc);
        continue;
      }
      if (!bloc) continue;
      // « GR1 CRAPS 1 31 » (oct. 2026) : sous-groupe craps À L'INTÉRIEUR d'un bloc d'équipe —
      // SBM le compte comme une ligne dans l'effectif de l'en-tête ; ses membres suivent.
      const craps = r.find(s => /^GR\d CRAPS$/.test(s));
      if (craps) { bloc.sousBlocs.push(craps); continue; }
      // membre : « <poste> NOM I [*] from to » — le nom est le dernier token alphabétique avant les 2 nombres
      const nums = r.map((s, k) => (/^\d{1,2}$/.test(s) ? k : -1)).filter(k => k >= 0);
      const alpha = r.map((s, k) => (NAMERE.test(s) && !/^(du|au)$/.test(s) ? k : -1)).filter(k => k >= 0);
      if (!alpha.length) continue;
      const kNom = alpha[alpha.length - 1];
      const nom = r[kNom];
      if (/^(RH|R|CP|M|FORMATION|CSS|B|BT)$/.test(nom)) continue;       // un poste seul (« B », « BT ») n'est pas un nom
      const apres = nums.filter(k => k > kNom);
      const from = apres.length >= 2 ? +r[apres[0]] : null, to = apres.length >= 2 ? +r[apres[1]] : null;
      bloc.membres.push({ nom, from, to, sousBloc: bloc.sousBlocs[bloc.sousBlocs.length - 1] || '' });
    }
  }
  // rangée = rang de l'en-tête dans sa section (1 = équipe, 2 = miroir)
  const parSection = {};
  for (const b of blocs.sort((a, b) => b.y - a.y || a.col - b.col)) {
    const k = b.section + '|' + b.col;
    b.rangee = (parSection[k] = (parSection[k] || 0) + 1);
  }
  return blocs;
}

// ── Les deux surfaces ─────────────────────────────────────────────────────────────────
global.window = {};
await import('file://' + resolve(ROOT, 'tools/shared/planning-seed.js'));
await import('file://' + resolve(ROOT, 'tools/departs/boards-gen.js'));
const SEED = global.window.CMC_PLANNING_SEED.months;
const GEN = global.window.DEPARTS_GEN;

/** Pour une surface : {equipeDe: nom→équipe, membres: équipe→[noms], miroir: équipe→équipe}. */
function surfaceApp(key) {
  const s = SEED[key]; if (!s) return null;
  const equipeDe = {}, membres = {};
  for (const e of s.emps) { const t = s.team[e.id]; if (!t) continue; equipeDe[nrm(e.name)] = t; (membres[t] = membres[t] || []).push(nrm(e.name)); }
  return { equipeDe, membres, miroir: s.mirror || {} };
}
function surfaceLight(prefix) {
  const equipeDe = {}, membres = {}, miroir = {};
  const ids = Object.keys(GEN.boards).filter(b => b.startsWith(prefix));
  if (!ids.length) return null;
  for (const b of ids) {
    const t = b.slice(prefix.length);
    for (const p of GEN.boards[b].people) { equipeDe[nrm(p.name)] = t; (membres[t] = membres[t] || []).push(nrm(p.name)); }
    const m = (GEN.mirror || {})[b]; if (m && m.startsWith(prefix)) miroir[t] = m.slice(prefix.length);
  }
  return { equipeDe, membres, miroir };
}

function verifier(blocs, surf, label) {
  const pb = [];
  // les rangées « aménagement » (horaires aménagés, effectif 0 ou 1) ne sont pas des équipes
  const equipes = blocs.filter(b => b.count > 0 && b.membres.length && !/am[ée]nagement/i.test(b.section));
  for (const b of equipes) {
    if (b.membres.length + b.sousBlocs.length !== b.count) pb.push(`PARSEUR ${b.section} col${b.col} r${b.rangee} (${b.code}) : ${b.membres.length} lu(s) pour ${b.count} annoncé(s) — ${b.membres.map(m => m.nom).join(', ')}`);
    const noms = b.membres.map(m => nrm(m.nom).replace(/ ([A-Z]{1,3}) \1$/, ' $1'));
    const vus = noms.map(n => surf.equipeDe[n] || '(aucune)');
    const cnt = {}; vus.forEach(v => cnt[v] = (cnt[v] || 0) + 1);
    const maj = Object.keys(cnt).sort((a, c) => cnt[c] - cnt[a])[0];
    noms.forEach((n, i) => { if (vus[i] !== maj) pb.push(`${b.section} col${b.col} r${b.rangee} (${b.code}) : ${n} est en « ${vus[i]} » alors que ses coéquipiers PDF sont en « ${maj} »`); });
    // intrus : membres de l'équipe majoritaire côté surface qui ne sont pas dans le bloc PDF
    if (maj !== '(aucune)') for (const m of surf.membres[maj] || []) if (!noms.includes(m)) pb.push(`${b.section} col${b.col} r${b.rangee} (${b.code}) : « ${maj} » contient ${m} qui n'est PAS dans ce bloc du PDF`);
    b.equipeSurface = maj;
  }
  // miroirs : rangée 1 ↔ rangée 2 d'une même colonne, même section
  for (const b of equipes.filter(x => x.rangee === 1)) {
    const m = equipes.find(x => x.section === b.section && x.col === b.col && x.rangee === 2);
    if (!m || b.equipeSurface === '(aucune)' || m.equipeSurface === '(aucune)') continue;
    const vu = surf.miroir[b.equipeSurface];
    if (vu !== m.equipeSurface) pb.push(`MIROIR ${b.section} col${b.col} : « ${b.equipeSurface} » (${b.code}) devrait avoir pour miroir « ${m.equipeSurface} » (${m.code}), vu « ${vu || '(aucun)'} »`);
  }
  return pb;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  let FAIL = 0;
  console.log('== FIDÉLITÉ AU PDF — ÉQUIPES du récapitulatif (page 1), CMCteams et light ==\n');
  for (const M of MOIS) {
    const blocs = await blocsRecap(M.pdf);
    const equipes = blocs.filter(b => b.count > 0 && b.membres.length && !/am[ée]nagement/i.test(b.section));
    console.log(`${M.label} — ${equipes.length} blocs d'équipe, ${equipes.reduce((s, b) => s + b.membres.length, 0)} affectations lues`);
    if (DETAIL) for (const b of equipes) console.log(`   [${b.section} col${b.col} r${b.rangee} ${b.code} ×${b.count}] ${b.membres.map(m => m.nom + (m.from !== 1 || (m.to !== 30 && m.to !== 31) ? ` (${m.from}-${m.to})` : '')).join(', ')}`);
    for (const [nom, surf] of [['CMCteams', surfaceApp(M.key)], ['light   ', surfaceLight(M.board)]]) {
      if (!surf) { console.log(`   ${nom} : ❌ mois absent`); FAIL++; continue; }
      const pb = verifier(blocs, surf, nom);
      console.log(`   ${nom} : ${pb.length ? '❌ ' + pb.length + ' problème(s)' : '✅ chaque bloc du PDF = une équipe, miroirs conformes'}`);
      pb.forEach(p => console.log('      ' + p));
      if (pb.length) FAIL++;
    }
  }
  console.log('\n' + (FAIL ? `❌ ÉQUIPES : ${FAIL} surface(s)/mois en défaut` : '✅ ÉQUIPES : conformes au récapitulatif du PDF des deux côtés'));
  process.exit(FAIL ? 1 : 0);
}
