#!/usr/bin/env node
/* Vérification RÉELLE — ajouter un conjoint, un enfant et un petit-enfant par IMPORT.
   -----------------------------------------------------------------------------------
   Kevin fournit des liens de famille par message ; l'app les reçoit sous forme de petit
   fichier à importer (Réglages → Importer). Ce qui doit être vrai, et qui est vérifié ici
   dans un Chromium réel, sur la famille SYNTHÉTIQUE (0 donnée réelle) :
     · l'import AJOUTE sans rien écraser : les fiches déjà présentes gardent leurs champs ;
     · un lien de conjoint noté d'UN SEUL côté forme quand même un couple à l'écran
       (normaliserConjoints le répare à la sauvegarde) — sinon le couple existe dans les
       données mais reste invisible, et personne ne s'en aperçoit ;
     · l'enfant apparaît bien SOUS ses deux parents, et le petit-enfant sous sa mère ;
     · aucune des personnes ajoutées ne se retrouve dans les « à relier ».
   Usage : node tools/arbre/verify-ajout-famille.mjs   · sortie 1 si une vérification échoue. */
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
const fails = [];
function check(ok, label, detail) {
  console.log((ok ? '  ✅ ' : '  ❌ ') + label + (detail ? ' — ' + detail : ''));
  if (!ok) fails.push(label);
}

const fx = fixture();
/* La personne à qui on rattache la nouvelle famille : quelqu'un de la lignée olivier,
   déjà marié une fois, comme dans le cas réel (remariage). */
const MERE = 'o_g2_0_0_c';
const avant = JSON.parse(JSON.stringify(fx.persons[MERE]));

/* Le patch, exactement dans la forme envoyée à Kevin : QUE des personnes nouvelles.
   On ne renvoie PAS la fiche de la mère — l'import remplacerait sa fiche entière et
   ferait perdre ce qu'elle contient. Le lien vers elle est porté par les nouveaux. */
const patch = { persons: {
  test_conjoint: { id: 'test_conjoint', prenom: 'Nouveau-C1', nom: 'TESTLIER', sexe: 'M', conjoints: [MERE], photos: [], sources: [], comments: [], updatedAt: Date.now() },
  test_enfant: { id: 'test_enfant', prenom: 'Nouvelle-E1', nom: 'TESTLIER', sexe: 'F', mere: MERE, pere: 'test_conjoint', photos: [], sources: [], comments: [], updatedAt: Date.now() },
  test_petite: { id: 'test_petite', prenom: 'Nouvelle-P1', nom: 'TESTLIER', sexe: 'F', mere: 'test_enfant', photos: [], sources: [], comments: [], updatedAt: Date.now() },
} };

const pw = await loadPlaywright();
const browser = await pw.chromium.launch({ headless: true, executablePath: chromePath() });
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'fr-FR' });
  await ctx.route('**/*', (r) => (r.request().url().startsWith(base) && !/\/sw\.js(\?|$)/.test(r.request().url()) ? r.continue() : r.abort()));
  await ctx.addInitScript((a) => { localStorage.setItem('arbre_trust', '1'); localStorage.setItem('arbre_codehash', a.h); localStorage.setItem('arbre_v2_text', a.db); }, { h: 'f'.repeat(64), db: JSON.stringify(fx) });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelectorAll('#stage .tnode, #stage .tmed').length > 0, null, { timeout: 30000 });

  const avantN = await page.evaluate(() => Object.keys(DB.persons).length);

  /* On applique le patch exactement comme le fait l'import JSON de l'app, puis on
     sauvegarde (c'est la sauvegarde qui répare la symétrie des conjoints). */
  const r = await page.evaluate(async (a) => {
    let ajoutes = 0;
    for (const id in a.patch.persons) {
      const rp = a.patch.persons[id], lp = DB.persons[id];
      if (!lp || (rp.updatedAt || 0) > (lp.updatedAt || 0)) { DB.persons[id] = rp; ajoutes++; }
    }
    await persist();
    FAMKEY = 'o'; renderTree();
    const pos = {}; (_lay.nodes || []).forEach((n) => { pos[n.id] = n; });
    const mere = P(a.MERE);
    const detaches = []; (aRelierGroupes || []).forEach((g) => detaches.push.apply(detaches, g.ids));
    (aRelierBranches || []).forEach((b) => detaches.push.apply(detaches, b.ids));
    return {
      ajoutes, total: Object.keys(DB.persons).length,
      mereConjoints: (mere.conjoints || []).slice(),
      mereChamps: Object.keys(mere).sort(),
      posConjoint: pos.test_conjoint || null, posMere: pos[a.MERE] || null,
      posEnfant: pos.test_enfant || null, posPetite: pos.test_petite || null,
      detaches: ['test_conjoint', 'test_enfant', 'test_petite'].filter((x) => detaches.indexOf(x) >= 0),
      enfantParents: { pere: P('test_enfant').pere, mere: P('test_enfant').mere },
      petiteMere: P('test_petite').mere,
    };
  }, { patch, MERE });

  console.log(`\n🌳 ${avantN} personnes → ${r.total} après import (${r.ajoutes} ajoutée(s))\n`);
  check(r.ajoutes === 3 && r.total === avantN + 3, 'les 3 personnes sont ajoutées, personne n\'est perdu', `${r.total} au total`);
  check(JSON.stringify(r.mereChamps) === JSON.stringify(Object.keys(avant).sort()),
    'la fiche existante n\'est pas écrasée : elle garde tous ses champs', r.mereChamps.join(', '));
  check(r.mereConjoints.indexOf('test_conjoint') >= 0,
    'le lien de conjoint, écrit d\'un seul côté, est réparé dans les deux sens', r.mereConjoints.join(' · '));
  check(r.mereConjoints.length === (avant.conjoints || []).length + 1,
    'l\'ancien conjoint est conservé (remariage, pas remplacement)', `${(avant.conjoints || []).length} → ${r.mereConjoints.length}`);
  check(!!r.posConjoint && !!r.posMere && r.posConjoint.y === r.posMere.y,
    'le nouveau conjoint est placé sur la MÊME ligne que sa conjointe (couple affiché)');
  check(!!r.posEnfant && !!r.posMere && r.posEnfant.y > r.posMere.y,
    'l\'enfant est placé SOUS ses parents');
  check(!!r.posPetite && !!r.posEnfant && r.posPetite.y > r.posEnfant.y,
    'le petit-enfant est placé SOUS sa mère');
  check(r.enfantParents.pere === 'test_conjoint' && r.enfantParents.mere === MERE,
    'l\'enfant a bien ses DEUX parents');
  check(r.petiteMere === 'test_enfant', 'le petit-enfant est bien rattaché à sa mère');
  check(r.detaches.length === 0, 'aucune des personnes ajoutées ne tombe dans les « à relier »', r.detaches.join(', '));
  check(errors.length === 0, '0 erreur JavaScript', errors.slice(0, 2).join(' | '));
} finally {
  await browser.close(); srv.close();
}
console.log(`\n=== ${fails.length ? '❌ ' + fails.length + ' échec(s)' : '✅ tout est vérifié'} ===`);
process.exit(fails.length ? 1 : 0);
