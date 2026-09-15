#!/usr/bin/env node
/* ============================================================================
 * LE BOUTON DE KEVIN EXISTE-T-IL VRAIMENT ? (page admin, VRAI navigateur)
 * ----------------------------------------------------------------------------
 * La garde `test:perimetre-apps` prouve que le ROUTEUR applique la règle. Elle ne
 * prouve PAS que Kevin peut s'en servir : une règle que personne ne peut régler
 * depuis son iPhone n'existe pas pour lui.
 *
 * Ici on sert la VRAIE page admin (kdmc-home/admin) dans Chromium, avec un faux
 * domaine qui répond comme le routeur, et on vérifie ce qu'un doigt obtient :
 * le bloc s'affiche, les cases se grisent quand elles n'ont pas de sens, et le
 * bouton Enregistrer envoie EXACTEMENT ce qui a été coché.
 *
 * Écran iPhone (390 × 844) et cibles tactiles mesurées à >= 44 px (règle Apple).
 *
 * Lancer : node tests/verify-perimetre-page.mjs
 * ========================================================================== */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let ko = 0;
const ok = (c, m, d) => { console.log((c ? '  ✅ ' : '  ❌ ') + m + (!c && d ? ' — ' + d : '')); if (!c) ko++; };

/* ── Faux domaine : répond comme le routeur, et ENREGISTRE ce qu'on lui envoie ─ */
const recu = [];
const FICHES = [
  { uid: 'cliente_lolo', name: 'Marie Dupont', last_seen: Date.now(), created: Date.now() - 9e6, hits: 4, apps: {}, portee: 'app', acces: ['chez-lolo'], bloque: [] },
  { uid: 'ami_domaine', name: 'Paul Martin', last_seen: Date.now() - 6e5, created: Date.now() - 9e7, hits: 30, apps: {}, portee: 'domaine', acces: [], bloque: ['arbre'] },
];
const APPS = ['apex-ai', 'arbre', 'chez-lolo', 'cmcteams', 'coffre', 'cuisine', 'departs', 'lingua', 'studio'];
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json' };

const serveur = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const jj = (o) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(o)); };
  if (u.pathname === '/__admin/accounts') return jj({ ok: true, kv: true, accounts: FICHES, count: FICHES.length });
  if (u.pathname === '/__admin/audit') return jj({ ok: true, log: [] });
  if (u.pathname === '/__admin/acces' && req.method === 'GET') return jj({ ok: true, apps: APPS });
  if (u.pathname === '/__admin/acces' && req.method === 'POST') {
    let c = ''; req.on('data', (d) => { c += d; });
    return req.on('end', () => { const b = JSON.parse(c || '{}'); recu.push(b); jj({ ok: true, uid: b.uid, portee: b.portee, acces: b.acces || [], bloque: b.bloque || [] }); });
  }
  if (u.pathname.startsWith('/__')) return jj({ ok: true });
  let p = u.pathname === '/' ? '/kdmc-home/admin/index.html' : u.pathname;
  if (p.endsWith('/')) p += 'index.html';
  /* Sur le vrai domaine, kd-mc.com EST le dossier kdmc-home (table ROUTES) : la page
     demande « /design-system.css » et le reçoit. Sans ce repli, la feuille de style
     partait en 404 ici et la capture montrait un thème clair qui n'existe nulle part
     — une vérification visuelle qui ne montre pas la vraie page ne vérifie rien. */
  let f = path.join(ROOT, p);
  if (!fs.existsSync(f)) { const alt = path.join(ROOT, 'kdmc-home', p); if (fs.existsSync(alt)) f = alt; }
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise((r) => serveur.listen(0, '127.0.0.1', r));
const BASE = 'http://127.0.0.1:' + serveur.address().port;

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const erreurs = [];
page.on('pageerror', (e) => erreurs.push(String(e && e.message || e)));

/* Le laissez-passer admin est normalement obtenu en tapant le code ; on le pose
   directement pour tester la PAGE, pas le portail de connexion (couvert ailleurs). */
await page.addInitScript(() => {
  try { localStorage.setItem('kdmc_admin_tok', 'jeton-de-test'); } catch (e) { /* */ }
});
await page.goto(BASE + '/kdmc-home/admin/', { waitUntil: 'networkidle' });
await page.waitForSelector('details.acces', { timeout: 8000 }).catch(() => {});

console.log('\nLa page');
const blocs = await page.locator('details.acces').count();
ok(blocs === FICHES.length, `un réglage « Où elle peut aller » sur chacune des ${FICHES.length} fiches`, String(blocs));
ok(erreurs.length === 0, 'aucune erreur JavaScript à l\'ouverture', erreurs.join(' | '));

const pill = await page.locator('#pill-limites').innerText().catch(() => '');
ok(/^1\s*limité à une app/.test(pill.trim()), 'la pastille « limité à une app » compte les personnes à décider (1 sur 2 ici)', pill);

const resume = await page.locator('details.acces[data-uid="cliente_lolo"] > summary').innerText();
ok(/chez-lolo/.test(resume), 'on lit son périmètre sans ouvrir quoi que ce soit', resume);
const resume2 = await page.locator('details.acces[data-uid="ami_domaine"] > summary').innerText();
ok(/Tout le domaine/.test(resume2) && /sauf/.test(resume2) && /arbre/.test(resume2),
  'et pour quelqu\'un du domaine, on lit aussi ce qui lui est fermé', resume2);

const bloc = page.locator('details.acces[data-uid="cliente_lolo"]');
await bloc.locator('> summary').first().click();

console.log('\nCe qu\'un doigt obtient');
const chips = bloc.locator('.grpacces .chipacc');
const n = await chips.count();
ok(n === APPS.length, `les ${APPS.length} applications du domaine sont proposées`, String(n));

/* On ne mesure que ce qui est RÉELLEMENT visible : les cases du repli « Fermer une
   application » sont dans un <details> fermé, donc hautes de 0 px tant qu'on ne
   l'ouvre pas. Les compter donnait un rouge au hasard (1 fois sur 3) — un test
   qui échoue par intermittence ne prouve rien et finit par être ignoré. */
async function mesurer(cible, etiquette) {
  const petites = [];
  for (const sel of ['.accradio', '.chipacc', '.savacc', 'summary']) {
    const els = cible.locator(sel);
    for (let i = 0; i < await els.count(); i++) {
      const el = els.nth(i);
      if (!(await el.isVisible())) continue;
      const b = await el.boundingBox();
      if (b && b.height < 44) petites.push(etiquette + ' ' + sel + '#' + i + ' = ' + Math.round(b.height) + 'px');
    }
  }
  return petites;
}
let petites = await mesurer(bloc, 'ouvert');
ok(petites.length === 0, 'toutes les cibles tactiles font au moins 44 px de haut', petites.slice(0, 4).join(', '));

/* Portée « domaine » → les cases « autorisée » n'ont plus de sens : elles doivent
   être désactivées, sinon on coche quelque chose qui ne servira à rien. */
await bloc.locator('input[data-portee="domaine"]').check();
ok(await chips.first().locator('input').isDisabled(),
  'en « partout dans le domaine », les cases d\'autorisation se grisent');
await bloc.locator('input[data-portee="app"]').check();
ok(!(await chips.first().locator('input').isDisabled()),
  'en « seulement les apps cochées », elles redeviennent cliquables');

/* Le garde-fou : « une seule app » sans app cochée ne part PAS au serveur. */
for (let i = 0; i < n; i++) { const c = chips.nth(i).locator('input'); if (await c.isChecked()) await c.uncheck(); }
await bloc.locator('.savacc').click();
await page.waitForTimeout(250);
ok(recu.length === 0, 'rien n\'est envoyé si aucune app n\'est cochée', JSON.stringify(recu));
ok(/au moins une application/i.test(await bloc.locator('.accmsg').innerText()),
  'et Kevin lit pourquoi, en français');

/* Le vrai enregistrement : ce qui est coché est exactement ce qui part. */
await bloc.locator('.grpacces .chipacc', { hasText: 'chez-lolo' }).locator('input').check();
await bloc.locator('.grpacces .chipacc', { hasText: 'cuisine' }).locator('input').check();
await bloc.locator('.sousbloc > summary').click();
/* Maintenant que le repli est ouvert, ses cases SONT visibles : on les mesure
   aussi, sinon la moitié des cibles tactiles ne serait jamais contrôlée. */
const petites2 = await mesurer(bloc.locator('.sousbloc'), 'repli ouvert');
ok(petites2.length === 0, 'les cases du repli « Fermer une application » font aussi 44 px', petites2.slice(0, 4).join(', '));
await bloc.locator('.sousbloc .chipacc', { hasText: 'arbre' }).locator('input').check();
await bloc.locator('.savacc').click();
await page.waitForFunction(() => /Enregistré/.test(document.querySelector('details.acces[data-uid="cliente_lolo"] .accmsg')?.textContent || ''), null, { timeout: 5000 }).catch(() => {});

const env = recu[recu.length - 1] || {};
ok(env.uid === 'cliente_lolo' && env.portee === 'app', 'l\'enregistrement part avec la bonne personne et la bonne portée', JSON.stringify(env));
ok(JSON.stringify((env.acces || []).sort()) === '["chez-lolo","cuisine"]',
  'les applications envoyées sont EXACTEMENT celles cochées', JSON.stringify(env.acces));
ok(JSON.stringify(env.bloque || []) === '["arbre"]', 'la fermeture cochée part aussi', JSON.stringify(env.bloque));
ok(/Enregistré/.test(await bloc.locator('.accmsg').innerText()), 'Kevin voit que c\'est enregistré');
ok(/chez-lolo/.test(await bloc.locator('> summary').first().innerText()), 'et le résumé se met à jour sans recharger');

ok(erreurs.length === 0, 'toujours aucune erreur JavaScript après manipulation', erreurs.join(' | '));

fs.mkdirSync(path.join(ROOT, 'audit/captures-perimetre'), { recursive: true });
await bloc.locator('> summary').first().scrollIntoViewIfNeeded();
await page.screenshot({ path: path.join(ROOT, 'audit/captures-perimetre/reglage-acces.png'), fullPage: false });

await nav.close();
serveur.close();
console.log('');
if (ko) { console.log(`${ko} problème(s) sur la page de réglage.`); process.exit(1); }
console.log('Le réglage « Où elle peut aller » marche vraiment, au doigt, sur écran iPhone. ✅');
