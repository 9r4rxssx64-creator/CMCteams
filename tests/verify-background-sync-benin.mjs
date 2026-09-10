// v9.899 — VU EN VRAI sur cmcteams.kd-mc.com (workflow « Voir comme Kevin », run 34517319384) :
// 5 s après l'ouverture, l'écran « ⚠️ Erreur asynchrone non gérée — Background Sync is disabled »
// remplaçait TOUTE l'app (plus de menu, plus de planning). Cause : reg.sync.register() renvoie une
// promesse rejetée quand Background Sync est désactivé (Chrome réglage du site, Brave par défaut,
// Chromium sans permission) ; le try/catch ne l'attrapait pas, et le gardien global la traitait
// comme fatale. Ce test rejoue la panne dans un vrai navigateur sur la page servie et exige que
// l'app RESTE utilisable (leçon #250 — PROTECTION ≠ STABILITÉ : un échec bénin ne tue jamais l'UI).
//   node tests/verify-background-sync-benin.mjs
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p.startsWith('/CMCteams/')) p = p.slice('/CMCteams'.length);
  const file = join(ROOT, p.replace(/^\/+/, ''));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  const ext = (file.match(/\.[a-z0-9]+$/i) || [''])[0].toLowerCase();
  res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream', 'service-worker-allowed': '/' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const APP = `http://127.0.0.1:${server.address().port}/CMCteams/index.html`;

let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fails++; };
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/firebasedatabase\.app/, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: route.request().method() === 'GET' ? 'null' : '{}' }));
const page = await ctx.newPage();
const logs = [];
page.on('console', (m) => logs.push(m.text()));
page.on('pageerror', (e) => logs.push('PAGEERROR ' + e.message));
// Rejoue EXACTEMENT la panne vue en prod : Background Sync présent mais refusé.
await page.addInitScript(() => {
  try {
    localStorage.setItem('cmc_uid', 'U11804'); localStorage.setItem('cmc_lastact', String(Date.now()));
    localStorage.setItem('cmc_dver', '30'); localStorage.setItem('cmc_v706_total_wiped', '1');
    // Le SW réel peut ne jamais devenir « ready » sur un serveur de test (installation partielle)
    // → on fournit une inscription factice DÉJÀ prête, dont Background Sync est refusé, exactement
    // comme Chrome/Brave le font en prod. (1re version du test : getter sur le prototype → jamais
    // atteint, le test passait même sur l'ancien code = faux vert, corrigé par sabotage.)
    const fauxReg = {
      sync: { register: () => Promise.reject(new Error('Background Sync is disabled.')), getTags: () => Promise.resolve([]) },
      active: null, installing: null, waiting: null, scope: location.origin + '/',
      update: () => Promise.resolve(), unregister: () => Promise.resolve(true),
      addEventListener() {}, removeEventListener() {},
      pushManager: { getSubscription: () => Promise.resolve(null), subscribe: () => Promise.reject(new Error('non')) },
    };
    Object.defineProperty(ServiceWorkerContainer.prototype, 'ready', { configurable: true, get() { return Promise.resolve(fauxReg); } });
    window.__fauxRegSync = true;
  } catch (e) { console.warn('init', e && e.message); }
});
await page.goto(APP, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => window.A && Array.isArray(A.employees), { timeout: 30000 });
await page.waitForTimeout(9000); // l'enregistrement Background Sync part 5 s après le boot
const R = await page.evaluate(() => {
  const txt = (document.body && document.body.innerText) || '';
  return {
    fatal: /Erreur asynchrone non gérée|Background Sync is disabled/.test(txt),
    content: !!document.getElementById('content') && !!document.getElementById('content').innerHTML.trim(),
    nav: !!document.getElementById('bnav'),
    view: window.A && A.view,
    ver: window.APP_VER,
    sw: !!(navigator.serviceWorker && navigator.serviceWorker.controller) || 'pas encore',
  };
});
await page.evaluate(() => { try { if (typeof sv === 'function') sv('monplanning'); } catch (e) { console.warn('sv', e && e.message); } });
await page.waitForTimeout(1500);
const R2 = await page.evaluate(() => ({ view: window.A && A.view, content: !!document.getElementById('content') && document.getElementById('content').innerText.length > 100 }));
ok(!R.fatal, 'aucun écran « Erreur asynchrone non gérée » 9 s après l\'ouverture (Background Sync refusé)');
ok(R.content && R.nav, 'l\'app reste rendue (#content + navigation présents), vue ' + R.view + ', ' + R.ver);
ok(R2.view === 'monplanning' && R2.content, 'on peut encore naviguer (Mon planning s\'affiche)');
ok(logs.some((l) => /unhandled promise bénigne.*Background Sync/i.test(l)) || !logs.some((l) => /Background Sync/.test(l)), 'le rejet est classé bénin (ou absorbé par le .catch), jamais fatal');
ok(!logs.some((l) => /^PAGEERROR/.test(l)), '0 erreur JS ' + logs.filter((l) => /^PAGEERROR/.test(l)).slice(0, 2).join(' | '));
await browser.close(); server.close();
console.log(fails ? `\n❌ ${fails} échec(s)` : '\n✅ Background Sync refusé = bénin, l\'app reste utilisable');
process.exit(fails ? 1 : 0);
