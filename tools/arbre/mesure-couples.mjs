#!/usr/bin/env node
/* MESURE (pas d'avis) — écart réel entre les cartes d'un même foyer, y compris quand une
   personne a DEUX conjoints (cas Guy Édouard : Renée puis Yvette). Kevin 10.09.2026 :
   « Guy est si près de Renée ». Avant de changer quoi que ce soit, on mesure en vrai
   navigateur : distance entre cartes voisines dans un foyer à 2 personnes, dans un foyer
   à 3 personnes, et entre deux foyers. Sortie : des nombres, pas une impression.
   Usage : node tools/arbre/mesure-couples.mjs */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fixture } from './fixture-famille.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ARBRE = path.join(ROOT, 'arbre');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml' };
const srv = await new Promise((res) => {
  const s = http.createServer((req, rsp) => {
    let f = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (f === '/' || f === '') f = '/index.html';
    const fp = path.join(ARBRE, f);
    if (!fp.startsWith(ARBRE) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { rsp.writeHead(404); rsp.end(); return; }
    rsp.writeHead(200, { 'content-type': MIME[path.extname(fp)] || 'application/octet-stream' });
    fs.createReadStream(fp).pipe(rsp);
  });
  s.listen(0, '127.0.0.1', () => res(s));
});
const base = `http://127.0.0.1:${srv.address().port}`;
async function loadPlaywright() {
  for (const n of ['playwright', 'playwright-core']) { try { return await import(n); } catch (e) { /* suivant */ } }
  if (process.env.PW_MODULE_DIR) return import(pathToFileURL(path.join(process.env.PW_MODULE_DIR, 'node_modules', 'playwright-core', 'index.mjs')).href);
  throw new Error('playwright introuvable');
}
function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const b = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try { for (const d of fs.readdirSync(b).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse()) { const c = path.join(b, d, 'chrome-linux', 'chrome'); if (fs.existsSync(c)) return c; } } catch (e) { /* rien */ }
  return undefined;
}

/* On ajoute une SECONDE épouse à une personne de la famille synthétique — même structure
   que le foyer réel qui pose question, 0 donnée personnelle. */
const fx = fixture();
const cible = 'o_g1_0_0';
const p = fx.persons[cible];
fx.persons.deuxieme_epouse = { id: 'deuxieme_epouse', prenom: 'Seconde-E1', nom: 'BOSCH', sexe: 'F', conjoints: [cible], photos: [], sources: [], comments: [], naissance: { date: '3.03.1932', lieu: 'Ville-Test' }, updatedAt: 1 };
p.conjoints = (p.conjoints || []).concat(['deuxieme_epouse']);

const pw = await loadPlaywright();
const browser = await pw.chromium.launch({ headless: true, executablePath: chromePath() });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'fr-FR' });
await ctx.route('**/*', (r) => (r.request().url().startsWith(base) && !/\/sw\.js(\?|$)/.test(r.request().url()) ? r.continue() : r.abort()));
await ctx.addInitScript((a) => { localStorage.setItem('arbre_trust', '1'); localStorage.setItem('arbre_codehash', a.h); localStorage.setItem('arbre_v2_text', a.db); }, { h: 'f'.repeat(64), db: JSON.stringify(fx) });
const page = await ctx.newPage();
await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => document.querySelectorAll('#stage .tnode, #stage .tmed').length > 0, null, { timeout: 30000 });

const m = await page.evaluate((cible) => {
  FAMKEY = 'o'; renderTree();
  const lay = _lay, pos = {};
  lay.nodes.forEach((n) => { pos[n.id] = n; });
  const T = TREE;
  /* foyer à 3 : la personne + ses deux conjointes ; on lit leurs x réels */
  const trio = [cible].concat(P(cible).conjoints || []).filter((x) => pos[x]);
  const xs = trio.map((x) => ({ id: x, x: pos[x].x, y: pos[x].y })).sort((a, b) => a.x - b.x);
  const ecarts = [];
  for (let i = 1; i < xs.length; i++) ecarts.push({ de: xs[i - 1].id, a: xs[i].id, dx: Math.round(xs[i].x - xs[i - 1].x), memeLigne: xs[i].y === xs[i - 1].y });
  /* un foyer normal à 2, pour comparer */
  let duo = null;
  for (const id in DB.persons) {
    const c = (P(id).conjoints || []).filter((x) => pos[x]);
    if (c.length === 1 && pos[id] && id !== cible && c[0] !== cible) { duo = { a: id, b: c[0], dx: Math.round(Math.abs(pos[c[0]].x - pos[id].x)) }; break; }
  }
  /* le plus petit écart entre deux cartes de la MÊME ligne, tous foyers confondus */
  const parLigne = {};
  lay.nodes.forEach((n) => { (parLigne[n.y] = parLigne[n.y] || []).push(n.x); });
  let mini = Infinity;
  Object.keys(parLigne).forEach((y) => { const a = parLigne[y].slice().sort((u, v) => u - v); for (let i = 1; i < a.length; i++) mini = Math.min(mini, a[i] - a[i - 1]); });
  /* Les vraies boîtes à l'écran : une carte, et les pastilles de couple (💍 / 💔 divorcés).
     C'est ce qui décide s'il y a chevauchement, pas les constantes du code. */
  const carte = document.querySelector('#stage .tnode, #stage .tmed');
  const rc = carte ? carte.getBoundingClientRect() : null;
  const sc = (VIEWST && VIEWST.sc) || 1;
  const pastilles = [].slice.call(document.querySelectorAll('.couplebadge')).map((b) => {
    const r = b.getBoundingClientRect();
    return { ex: b.classList.contains('exb'), largeur: Math.round(r.width / sc), texte: (b.textContent || '').trim().slice(0, 20) };
  });
  const parType = {};
  pastilles.forEach((x) => { const k = x.ex ? 'ex' : 'mariage'; parType[k] = parType[k] || { n: 0, max: 0, texte: x.texte }; parType[k].n++; parType[k].max = Math.max(parType[k].max, x.largeur); });
  return { BOXW: T.BOXW, CARD: T.CARD, COUPLEGAP: T.COUPLEGAP, UNITGAP: T.UNITGAP, ecarts, duo, miniLigne: Math.round(mini),
    carteLargeur: rc ? Math.round(rc.width / sc) : null, pastilles: parType, zoom: sc };
}, cible);

console.log('\n📏 MESURE — écarts réels entre cartes (famille synthétique, 0 donnée réelle)\n');
const pitch = m.BOXW + m.COUPLEGAP;
const largeur = m.carteLargeur || m.CARD;
console.log(`  pas entre deux cartes d'un même foyer : ${pitch} px · largeur RÉELLE d'une carte : ${largeur} px`);
console.log(`  → espace blanc réellement disponible entre elles : ${pitch - largeur} px`);
Object.keys(m.pastilles || {}).forEach((k) => {
  const x = m.pastilles[k];
  const trop = x.max - (pitch - largeur);
  console.log(`  pastille « ${k} » (${x.n}) : ${x.max} px de large → ${trop > 0 ? 'DÉBORDE de ' + trop + ' px sur les cartes' : 'tient dans l\'espace'}`);
});
console.log(`  réglages : COUPLEGAP=${m.COUPLEGAP} · UNITGAP=${m.UNITGAP}`);
if (m.duo) console.log(`\n  foyer à 2 personnes : ${m.duo.dx} px entre les deux cartes`);
console.log('  foyer à 3 personnes (deux conjointes) :');
m.ecarts.forEach((e) => console.log(`    ${e.de} → ${e.a} : ${e.dx} px${e.memeLigne ? '' : ' (pas sur la même ligne)'}`));
console.log(`\n  plus petit écart entre deux cartes voisines d'une même ligne : ${m.miniLigne} px`);
console.log(`  (une carte fait ${m.CARD} px : en dessous de ${m.CARD} px, elles se CHEVAUCHENT)\n`);

/* --------------------------------------------------------------------------------
   AJOUT D'UN ENFANT : l'autre parent est-il pré-rempli SANS RISQUE ?
   Une personne à 1 conjoint → on peut pré-remplir (aucun doute).
   Une personne à 2 conjoints → il FAUT laisser vide : choisir d'office le premier
   de la liste attache l'enfant au mauvais parent une fois sur deux, en silence. */
const ajout = await page.evaluate((cible) => {
  function essaie(pid) {
    openEdit(null, { childOf: pid });
    const sels = [].slice.call(document.querySelectorAll('select[data-f="pere"], select[data-f="mere"]'));
    const remplis = sels.filter((s) => s.value).map((s) => s.dataset.f + '=' + (P(s.value) ? full(P(s.value)) : s.value));
    const c = document.querySelector('.ov'); if (c) c.remove();
    return { conjoints: (P(pid).conjoints || []).length, remplis };
  }
  /* quelqu'un qui n'a qu'un seul conjoint */
  let unSeul = null;
  for (const id in DB.persons) { if ((P(id).conjoints || []).length === 1 && id !== cible) { unSeul = id; break; } }
  return { deux: essaie(cible), un: unSeul ? essaie(unSeul) : null };
}, cible);
console.log('👶 Ajouter un enfant — parents pré-remplis :');
if (ajout.un) console.log(`  parent à ${ajout.un.conjoints} conjoint  → ${ajout.un.remplis.join(' · ') || '(aucun)'}   ${ajout.un.remplis.length === 2 ? '✅ les deux parents, sans risque' : '⚠️'}`);
console.log(`  parent à ${ajout.deux.conjoints} conjoints → ${ajout.deux.remplis.join(' · ') || '(aucun)'}   ${ajout.deux.remplis.length === 1 ? '✅ le second est laissé à choisir (pas de lien inventé)' : '❌ un parent a été choisi d\'office'}`);
console.log('');

await browser.close(); srv.close();
