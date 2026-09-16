/* Preuve du site kit.kd-mc.com (Kit IA de l'indépendant).
   Ce qui coûte de l'argent si c'est faux : un prix affiché ≠ prix vérifié par le
   worker, une CSP qui bloque l'appel (« pas de réseau »), un module payant qui
   fuit dans l'aperçu, un lecteur qui ne s'ouvre pas avec un code valide. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import http from 'node:http';
import { extname, join } from 'node:path';
import { __test as VENTE } from '../services/kdmc-vente/worker.js';

const DIR = new URL('../shops/kit-ia/', import.meta.url);
const INDEX = readFileSync(new URL('index.html', DIR), 'utf8');
const LIRE = readFileSync(new URL('lire.html', DIR), 'utf8');
const JS = readFileSync(new URL('kit.js', DIR), 'utf8');
const CSS = readFileSync(new URL('kit.css', DIR), 'utf8');
const PRODUIT = VENTE.PRODUITS['kit-ia'];

test('PARITÉ : le produit, son prix et son adresse de lecture sont ceux du worker', () => {
  assert.ok(PRODUIT, 'kit-ia absent du catalogue du worker');
  assert.equal(JS.match(/var PRODUIT = '([^']+)'/)[1], 'kit-ia');
  assert.ok(INDEX.includes('<input type="hidden" id="produit" value="kit-ia">'));
  const prix = PRODUIT.prix + ' €';
  for (const id of ['payer-paypal', 'payer-revolut']) {
    const ligne = INDEX.match(new RegExp('id="' + id + '" href="([^"]+)"[^>]*>([^<]+)<'));
    assert.ok(ligne, id + ' absent');
    assert.ok(ligne[2].includes(prix), `${id} annonce « ${ligne[2]} » mais le worker vérifie ${prix}`);
    assert.ok(ligne[1].toLowerCase().includes(String(PRODUIT.prix) + 'eur'), `${id} : le lien de paiement ne porte pas le montant ${PRODUIT.prix} EUR (${ligne[1]})`);
  }
  assert.equal(PRODUIT.livre, 'https://kit.kd-mc.com/lire.html');
  assert.equal(PRODUIT.devise, 'EUR');
  assert.ok(INDEX.includes('"price":"' + PRODUIT.prix + '"'), 'le prix des données structurées a divergé');
});

test('CSP : les deux pages ne parlent QU\'au worker de vente, aucun script en ligne', () => {
  const api = JS.match(/var API = '([^']+)'/)[1];
  for (const [nom, html] of [['index', INDEX], ['lire', LIRE]]) {
    const csp = html.match(/Content-Security-Policy" content="([^"]+)"/)[1];
    assert.match(csp, /script-src 'self'(;|$)/, nom);
    assert.ok(!csp.includes("'unsafe-inline'") || !/script-src[^;]*'unsafe-inline'/.test(csp), nom + ' : script en ligne autorisé');
    assert.ok(csp.includes('connect-src ' + api), `${nom} : le script appelle ${api} mais la CSP ne l'autorise pas → « Load failed »`);
    assert.ok(!/<script>[^<]/.test(html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '')), nom + ' : script en ligne présent');
  }
});

test('aucun secret, aucun code d\'accès en dur, aucun contenu payant dans les fichiers publics', () => {
  for (const source of [INDEX, LIRE, JS, CSS]) {
    assert.ok(!/sk-ant-api|AIza[A-Za-z0-9_-]{20}|ghp_[A-Za-z0-9]{20}|xkeysib-/.test(source));
    assert.ok(!/[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}/.test(source), 'un code ressemblant à un accès valide est écrit en clair');
    assert.ok(!/<pre class="consigne">/.test(source), 'une consigne du kit (contenu payant) est dans un fichier public');
  }
});

test('logique pure : normaliseCode, interprete, interpreteLecture', () => {
  const fn = new Function('window', 'document', 'localStorage', 'location', JS + '\nreturn globalThis.__kit;');
  const k = fn({}, undefined, undefined, undefined);
  assert.ok(k, 'la logique pure doit être exportée même sans navigateur');
  assert.equal(k.normaliseCode(' abcd-efgh jklm npqr '), 'ABCD-EFGH-JKLM-NPQR');
  assert.equal(k.normaliseCode('ABCDEFGHJKLMNPQR'), 'ABCD-EFGH-JKLM-NPQR');
  assert.equal(k.normaliseCode('ABCD'), '', 'un code incomplet ne doit jamais passer');
  assert.equal(k.interprete({ ok: true, verifie: true, code: 'AAAA-BBBB-CCCC-DDDD' }, true).etat, 'ok');
  assert.match(k.interprete({ ok: true, en_attente: true, detail: 'jusqu\'à 3 h' }, true).texte, /3 h/, 'on DIT le délai');
  assert.equal(k.interprete({ ok: false, error: 'trop_de_tentatives' }, false).etat, 'erreur');
  const l = k.interpreteLecture;
  assert.equal(l({ ok: true, modules: [], sommaire: [] }, true, false).etat, 'apercu');
  assert.equal(l({ ok: true, modules: [], sommaire: [] }, true, true).etat, 'complet');
  assert.equal(l({ ok: false, error: 'invalide', detail: 'code inconnu' }, false, true).etat, 'code_invalide');
  assert.match(l({ ok: false, error: 'contenu_indisponible' }, false, true).texte, /code reste valable/, 'une panne de contenu ne doit pas faire croire au client que son code est mort');
});

function serveurLocal(racine) {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css' };
  const s = http.createServer((req, res) => {
    const chemin = decodeURIComponent(req.url.split('?')[0]);
    const f = join(racine, chemin === '/' ? '/index.html' : chemin);
    try { res.writeHead(200, { 'content-type': types[extname(f)] || 'application/octet-stream' }); res.end(readFileSync(f)); }
    catch (_) { res.writeHead(404); res.end('non trouvé'); }
  });
  return new Promise((ok) => s.listen(0, '127.0.0.1', () => ok({ s, port: s.address().port })));
}

/* Faux worker : ce que le VRAI renvoie (mêmes formes que vente.test.mjs). */
const SOMMAIRE = [{ id: 'm1', ordre: 1, titre: 'Ton assistant en 20 min', gratuit: true }, { id: 'm2', ordre: 2, titre: 'La consigne parfaite', gratuit: false }];
const M1 = { id: 'm1', ordre: 1, titre: 'Ton assistant en 20 min', gratuit: true, html: '<h2>Module 1</h2><p class="promesse">Promesse.</p><h3>Test</h3><pre class="consigne">Tu es [métier]. Écris…</pre><div class="exemple">Résultat</div>' };
const M2 = { id: 'm2', ordre: 2, titre: 'La consigne parfaite', gratuit: false, html: '<h2>Module 2</h2><pre class="consigne">SECRET-PAYANT</pre>' };
function fauxWorker(page) {
  const appels = [];
  return page.route('https://kdmc-vente.9r4rxssx64.workers.dev/**', (route) => {
    const u = new URL(route.request().url()); appels.push(u.pathname + u.search);
    const rep = (obj, status) => route.fulfill({ status: status || 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(obj) });
    if (u.pathname === '/apercu') return rep({ ok: true, produit: 'kit-ia', modules: [M1], sommaire: SOMMAIRE });
    if (u.pathname === '/lire') {
      return u.searchParams.get('c') === 'ABCD-EFGH-JKLM-NPQR'
        ? rep({ ok: true, produit: 'kit-ia', modules: [M1, M2], sommaire: SOMMAIRE })
        : rep({ ok: false, error: 'invalide', detail: 'code inconnu ou expiré' }, 404);
    }
    if (u.pathname === '/reclamer') return rep({ ok: true, verifie: true, code: 'ABCD-EFGH-JKLM-NPQR', livre: 'https://kit.kd-mc.com/lire.html' });
    return rep({ ok: false, error: 'not_found' }, 404);
  }).then(() => appels);
}

async function pageTest(nav, port, chemin) {
  const page = await nav.newPage({ viewport: { width: 375, height: 812 } });
  const soucis = [];
  page.on('pageerror', (e) => soucis.push('exception: ' + e.message));
  page.on('console', (m) => {
    if (m.type() !== 'error' || m.text().includes('ERR_CERT_AUTHORITY_INVALID')) return;
    /* Un mauvais code = le worker répond 404 EXPRÈS ; Chromium le journalise comme
       une « erreur » de ressource. C'est le comportement attendu, pas un défaut de la page. */
    const loc = (m.location() || {}).url || '';
    if (/404/.test(m.text()) && loc.startsWith('https://kdmc-vente.9r4rxssx64.workers.dev/')) return;
    soucis.push('console: ' + m.text());
  });
  const appels = await fauxWorker(page);
  await page.goto('http://127.0.0.1:' + port + chemin, { waitUntil: 'networkidle' });
  assert.equal(await page.evaluate(() => typeof window.__kit), 'object', 'kit.js n\'a pas tourné — tout le reste serait du faux vert');
  return { page, soucis, appels };
}
async function ciblesPetites(page) {
  return page.evaluate(() => [...document.querySelectorAll('input,select,button,a,summary')]
    .filter((e) => e.offsetParent !== null)
    .map((e) => ({ t: e.tagName + (e.id ? '#' + e.id : '') + (e.className ? '.' + String(e.className).split(' ')[0] : ''), h: Math.round(e.getBoundingClientRect().height) }))
    .filter((x) => x.h < 44));
}

test('vrai navigateur — page de vente : 44 px partout, 375 px sans débordement, récupération d\'accès → code', async () => {
  const { s, port } = await serveurLocal(DIR.pathname);
  const nav = await chromium.launch({ headless: true });
  try {
    const { page, soucis } = await pageTest(nav, port, '/index.html');
    assert.deepEqual(await ciblesPetites(page), [], 'cibles tactiles sous 44 px');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), false, 'débordement horizontal');
    assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById('resultat')).display), 'none');
    await page.fill('#email', 'client@exemple.fr');
    await page.click('#valider');
    await page.waitForSelector('#resultat.ok');
    assert.equal(await page.textContent('#resultat code'), 'ABCD-EFGH-JKLM-NPQR');
    assert.equal(await page.evaluate(() => localStorage.getItem('kit_ia_code')), 'ABCD-EFGH-JKLM-NPQR', 'le code doit être mémorisé pour le lecteur');
    assert.deepEqual(soucis, []);
  } finally { await nav.close(); s.close(); }
});

test('vrai navigateur — lecteur : aperçu gratuit sans code, verrou sur le module 2, ouverture complète avec le code', async () => {
  const { s, port } = await serveurLocal(DIR.pathname);
  const nav = await chromium.launch({ headless: true });
  try {
    const { page, soucis, appels } = await pageTest(nav, port, '/lire.html');
    await page.waitForSelector('#module h2');
    assert.equal(await page.textContent('#module h2'), 'Module 1');
    assert.ok(appels.some((a) => a.startsWith('/apercu?produit=kit-ia')), 'sans code, le lecteur demande l\'aperçu');
    assert.equal(await page.locator('#module button.copier').count(), 1, 'chaque consigne a son bouton Copier');
    assert.deepEqual(await ciblesPetites(page), [], 'cibles tactiles sous 44 px');
    /* Module 2 = verrouillé : on voit le titre et l'invitation à acheter, jamais le secret. */
    await page.click('#suivant');
    await page.waitForSelector('#verrou:not([hidden])');
    assert.ok(!(await page.content()).includes('SECRET-PAYANT'), 'le contenu payant ne doit pas être dans la page sans code');
    /* Mauvais code → message clair, retour à l'aperçu. Bon code → tout s'ouvre. */
    await page.fill('#codeAcces', 'ZZZZ-ZZZZ-ZZZZ-ZZZZ');
    await page.click('#ouvrir');
    await page.waitForSelector('#resultat.erreur');
    await page.fill('#codeAcces', 'abcd efgh jklm npqr');
    await page.click('#ouvrir');
    await page.waitForFunction(() => document.getElementById('titre').textContent === 'Ton kit complet');
    await page.click('#suivant');
    await page.waitForFunction(() => document.querySelector('#module h2') && document.querySelector('#module h2').textContent === 'Module 2');
    assert.ok((await page.textContent('#module')).includes('SECRET-PAYANT'));
    assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById('verrou')).display), 'none');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), false, 'débordement horizontal');
    assert.deepEqual(soucis, []);
  } finally { await nav.close(); s.close(); }
});
