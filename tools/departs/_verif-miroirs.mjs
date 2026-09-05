#!/usr/bin/env node
/* VÉRIFICATION DES ÉQUIPES MIROIR — et garde-fou contre la déduction au jugé.
 * ---------------------------------------------------------------------------
 * Kevin 2026-09-02 : « il manque les miroirs dans light. Vérifie tout réel
 * pour chaque personne. »
 *
 * Ce que l'outil fait, sur les VRAIES données (tools/departs/boards-gen.js) :
 *   1. compte les correspondances miroir et vérifie leur RÉCIPROCITÉ ;
 *   2. contrôle la règle métier SBM — une équipe et son miroir ont les MÊMES
 *      jours de repos (CLAUDE.md, « DÉTECTION ÉQUIPES SBM ») ;
 *   3. liste les équipes SANS miroir (le bouton 🔁 y est mort), en excluant
 *      « Congés » et « Maladie » qui n'en ont pas par nature ;
 *   4. contrôle l'intégrité par personne : doublons, cellules vides ;
 *   5. CALIBRE toute tentative de déduction automatique AVANT de l'autoriser.
 *
 * ⚠️ LE POINT LE PLUS IMPORTANT — pourquoi cet outil ne « répare » rien.
 * Mesuré le 2026-09-02 : déduire le miroir par ressemblance des jours de repos
 * ne retrouve le VRAI miroir que dans 6 cas sur 35 (17 %). C'est normal : dans
 * une rotation, BEAUCOUP d'équipes partagent les mêmes jours de repos — le
 * repos identifie le GROUPE, pas le partenaire unique. Le vrai miroir vient du
 * PDF (trait noir / horaires décalés) et n'est connu qu'à l'import.
 * Donc : réparer un miroir manquant = RÉIMPORTER le planning du mois, jamais
 * apparier au jugé. Une paire inventée fausserait les départs de deux équipes.
 *
 * Lancer : node tools/departs/_verif-miroirs.mjs
 */
import { readFileSync } from 'node:fs';

const SRC = 'tools/departs/boards-gen.js';
globalThis.window = globalThis;
// eslint-disable-next-line no-eval
eval(readFileSync(SRC, 'utf8'));
const G = globalThis.window.DEPARTS_GEN || {};
const B = G.boards || {};
const M = G.mirror || {};

const REPOS = new Set(['RH', 'R', 'RTP', 'RTR', 'RRT', 'RHS', 'DP']);
const estAbs = (id) => /Cong|Maladie/i.test(B[id].label || '') || B[id].kind === 'abs';
const mois = (id) => (B[id].label || '').split(' — ')[0];
const jours = (id) => B[id].days || 31;
const codeDe = (p, d) => String((p.codes && p.codes[d]) || '').trim();

/* Profil de repos : part des personnes au repos, jour par jour. */
function profil(id) {
  const P = B[id].people || [];
  const v = [];
  for (let d = 1; d <= jours(id); d++) {
    const n = P.filter((p) => REPOS.has(codeDe(p, d))).length;
    v.push(P.length ? n / P.length : 0);
  }
  return v;
}
function concordance(a, b) {
  const x = profil(a), y = profil(b), n = Math.min(x.length, y.length);
  let ok = 0;
  for (let i = 0; i < n; i++) if ((x[i] > 0.5) === (y[i] > 0.5)) ok++;
  return n ? ok / n : 0;
}

const R = { ok: [], ko: [], info: [] };
const chk = (c, m) => (c ? R.ok : R.ko).push(m);

/* --- 1. réciprocité -------------------------------------------------------- */
const paires = [];
const vus = new Set();
Object.keys(M).forEach((a) => {
  const b = M[a], k = [a, b].sort().join('|');
  if (vus.has(k)) return; vus.add(k);
  if (B[a] && B[b]) paires.push([a, b]);
});
const asym = Object.keys(M).filter((a) => M[M[a]] !== a);
chk(asym.length === 0, `réciprocité des miroirs (A→B ⇒ B→A) — ${asym.length} asymétrie(s)`);
chk(Object.keys(M).length > 0, `${Object.keys(M).length} correspondances miroir, ${paires.length} paires`);

/* --- 2. règle métier SBM : mêmes jours de repos ---------------------------- */
const faibles = paires.filter(([a, b]) => concordance(a, b) < 0.8);
chk(faibles.length === 0,
  faibles.length === 0
    ? `règle SBM respectée : ${paires.length}/${paires.length} paires ont les mêmes jours de repos`
    : `règle SBM VIOLÉE sur ${faibles.length} paire(s) : ${faibles.slice(0, 3).map(([a, b]) => B[a].label + ' vs ' + B[b].label).join(' | ')}`);

/* --- 3. équipes sans miroir ------------------------------------------------ */
const orphelins = Object.keys(B).filter((id) => !M[id] && !estAbs(id)).sort();
R.info.push(`équipes SANS miroir (bouton 🔁 inactif) : ${orphelins.length}`);
orphelins.forEach((id) => R.info.push(`   • ${B[id].label}  (${(B[id].people || []).length} pers.)`));

/* --- 4. intégrité par personne --------------------------------------------- */
const parMois = {};
Object.keys(B).forEach((id) => {
  const m = mois(id);
  parMois[m] = parMois[m] || {};
  (B[id].people || []).forEach((p) => { (parMois[m][p.name] = parMois[m][p.name] || []).push(B[id].label); });
});
let doublons = 0;
Object.keys(parMois).forEach((m) => {
  const d = Object.keys(parMois[m]).filter((n) => parMois[m][n].length > 1);
  doublons += d.length;
  R.info.push(`${m} : ${Object.keys(parMois[m]).length} personnes` + (d.length ? ` — ⚠ ${d.length} sur 2+ plateaux` : ''));
});
chk(doublons === 0, `aucune personne sur deux plateaux le même mois (${doublons} trouvé(s))`);

let cell = 0, vides = 0;
Object.keys(B).forEach((id) => (B[id].people || []).forEach((p) => {
  for (let d = 1; d <= jours(id); d++) { cell++; if (!codeDe(p, d)) vides++; }
}));
chk(vides / Math.max(1, cell) < 0.05, `cellules vides : ${vides}/${cell} (${(100 * vides / cell).toFixed(1)} %)`);

/* --- 5. CALIBRAGE : a-t-on le droit de déduire un miroir ? ------------------ */
let rang1 = 0;
paires.forEach(([a, b]) => {
  const cands = Object.keys(B).filter((x) => x !== a && !estAbs(x) && mois(x) === mois(a));
  cands.sort((p, q) => concordance(a, q) - concordance(a, p));
  if (cands[0] === b) rang1++;
});
const taux = paires.length ? rang1 / paires.length : 0;
R.info.push(`CALIBRAGE — la déduction par jours de repos retrouve le vrai miroir dans ${rang1}/${paires.length} cas (${Math.round(100 * taux)} %)`);
chk(taux < 0.95,
  taux < 0.95
    ? `déduction automatique INTERDITE (${Math.round(100 * taux)} % de justesse) → réimporter le mois, ne jamais apparier au jugé`
    : `déduction fiable à ${Math.round(100 * taux)} % — elle pourrait être autorisée, à revalider`);

/* --- verdict --------------------------------------------------------------- */
R.info.forEach((m) => console.log('  · ' + m));
console.log();
R.ok.forEach((m) => console.log('  OK   ' + m));
R.ko.forEach((m) => console.log('  FAIL ' + m));
console.log(`\n=== ${R.ok.length} OK / ${R.ko.length} FAIL ===`);
if (orphelins.length) {
  console.log(`\n⚠️  ${orphelins.length} équipe(s) sans miroir : la seule réparation SÛRE est de`);
  console.log('    réimporter le planning du mois concerné (le miroir vient du PDF).');
}
process.exit(R.ko.length ? 1 : 0);
