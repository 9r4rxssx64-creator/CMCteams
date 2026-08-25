/* Smoke LIVE navigateur du moteur décès INSEE (Kevin : prouver, pas supposer).
   Charge tools/deces-insee/ dans un vrai Chromium, lance une recherche connue
   contre le Parquet sur R2 (DuckDB-WASM + Range), vérifie ≥1 résultat + 0 erreur JS.
   Réseau ouvert requis (runner CI). Usage : node tools/arbre/deces-smoke.mjs */
import { chromium } from 'playwright';

const URL = 'http://127.0.0.1:8000/tools/deces-insee/?nom=MAIFFRET';
const b = await chromium.launch();
const p = await b.newPage();
const errs = [];
p.on('pageerror', e => errs.push('pageerror: ' + e.message));
p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
p.on('requestfailed', r => { const u = r.url(); if (/r2\.dev|127\.0\.0\.1/.test(u)) errs.push('reqfail: ' + u + ' — ' + (r.failure()?.errorText || '')); });

console.log('→', URL);
await p.goto(URL, { waitUntil: 'load', timeout: 60000 });
// attend un état terminal : résultats rendus OU message de statut explicite
await p.waitForFunction(() => {
  const s = document.getElementById('st'); const r = document.getElementById('res');
  if (r && r.querySelector('.hit')) return true;
  return s && /résultat|Aucun|Erreur|indisponible|construction/i.test(s.textContent || '');
}, { timeout: 120000 });

const status = await p.$eval('#st', e => e.textContent).catch(() => '(pas de #st)');
const hits = await p.$$eval('.hit', els => els.length).catch(() => 0);
const first = await p.$eval('.hit', e => e.innerText).catch(() => '');
await p.screenshot({ path: 'deces-smoke.png', fullPage: true }).catch(() => {});
await b.close();

console.log('STATUS :', status.trim());
console.log('HITS   :', hits);
if (first) console.log('1er    :', first.replace(/\s+/g, ' ').slice(0, 160));
if (errs.length) console.log('JS/RÉSEAU :', errs.slice(0, 8).join(' | '));

if (hits < 1) { console.error('::error::0 résultat MAIFFRET — le flux navigateur (DuckDB-WASM sur R2) ne rend pas'); process.exit(1); }
if (errs.some(e => /pageerror|reqfail/.test(e))) { console.error('::error::erreurs JS/réseau détectées'); process.exit(1); }
console.log('✅ OK — recherche navigateur fonctionnelle contre R2');
