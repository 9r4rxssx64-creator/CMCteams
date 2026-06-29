// v9.831 — REPRODUCTION IDENTIQUE des couleurs PDF (Kevin 2026-06-29) :
//   • jour de R travaillé (convention) = FOND ROUGE  → meta.bg === "CONV"
//   • horaire modifié = ÉCRITURE rouge / fond clair    → meta.fg === "red"
//   • code à apostrophe NON-convention (19/4'c, 14/19'c) = NI l'un NI l'autre
// Vérité terrain Kevin (AOÛT 2026, DESARZENS K) : day1 19/4'c (rien), day3 14/19'c
// (rien), day5 19/3c (CONV rouge), day8 16/3c (écriture rouge = horaire modifié).
// Détection par RASTÉRISATION du PDF (le pixel rendu, pas l'ordre des opérateurs).
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const PDFJS = readFileSync(resolve(root, 'node_modules/pdfjs-dist/build/pdf.min.js'));
const PDFW = readFileSync(resolve(root, 'node_modules/pdfjs-dist/build/pdf.worker.min.js'));

let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } }

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/cdnjs\.cloudflare\.com\/.*pdf\.min\.js/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: PDFJS }));
await ctx.route(/cdnjs\.cloudflare\.com\/.*pdf\.worker\.min\.js/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: PDFW }));
const page = await ctx.newPage();
await page.addInitScript(() => { window.__CMC_NO_SEED = true; });
await page.goto('file://' + resolve(root, 'index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForFunction(() => typeof window.handleFileImport === 'function' && window.A && Array.isArray(A.employees), { timeout: 20000 });

const Y = 2026, M = 7; // Août
await page.evaluate(({ y, m }) => { A.user = A.employees.find(e => e.id === 'U11804'); A.year = y; A.month = m; A.overrides = A.overrides || {}; delete A.overrides[y + '-' + m]; if (typeof sv === 'function') sv('import'); }, { y: Y, m: M });
const b64 = readFileSync(resolve(root, 'tests/fixtures/aout-2026-v1.pdf')).toString('base64');
await page.evaluate(async ({ b64, y, m }) => {
  const bin = atob(b64); const arr = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  const file = new File([arr], 'aout-2026-v1.pdf', { type: 'application/pdf' });
  const inp = document.getElementById('impFile'); const dt = new DataTransfer(); dt.items.add(file); inp.files = dt.files;
  const sy = document.getElementById('impY'); if (sy) sy.value = String(y); const sm = document.getElementById('impM'); if (sm) sm.value = String(m);
  handleFileImport(inp);
}, { b64, y: Y, m: M });
await page.waitForFunction((key) => { const ov = (window.A && A.overrides && A.overrides[key]) || null; return ov && Object.keys(ov).filter(id => ov[id] && Object.keys(ov[id]).length > 0).length > 50; }, Y + '-' + M, { timeout: 45000 }).catch(() => {});
await page.waitForTimeout(1500);

const r = await page.evaluate(({ key }) => {
  const ov = (A.overrides[key] || {})['U11804'] || {};
  const meta = ((A.overrides_meta || {})[key] || {})['U11804'] || {};
  const get = d => ({ code: ov[d] || ov[String(d)] || '', bg: (meta[d] || meta[String(d)] || {}).bg || null, fg: (meta[d] || meta[String(d)] || {}).fg || null });
  // count totals for sanity
  let convN = 0, modhN = 0;
  Object.keys(meta).forEach(d => { if (meta[d] && meta[d].bg === 'CONV') convN++; if (meta[d] && meta[d].fg === 'red') modhN++; });
  return { d1: get(1), d3: get(3), d5: get(5), d8: get(8), convN, modhN, name: (A.employees.find(e => e.id === 'U11804') || {}).name };
}, { key: Y + '-' + M });

console.log('DESARZENS K (' + r.name + ') AOÛT 2026 :');
console.log('  day1=' + JSON.stringify(r.d1) + '  day3=' + JSON.stringify(r.d3));
console.log('  day5=' + JSON.stringify(r.d5) + '  day8=' + JSON.stringify(r.d8));
console.log('  total CONV cells=' + r.convN + '  total MODH cells=' + r.modhN);

ok(r.d5.bg === 'CONV', 'day5 (19/3c) = convention FOND ROUGE (meta.bg=CONV)');
ok(r.d8.fg === 'red' && r.d8.bg !== 'CONV', 'day8 (16/3c) = horaire modifié ÉCRITURE ROUGE (meta.fg=red, pas CONV)');
ok(r.d1.bg !== 'CONV' && r.d1.fg !== 'red', "day1 (19/4'c) = NI convention NI modifié");
ok(r.d3.bg !== 'CONV' && r.d3.fg !== 'red', "day3 (14/19'c) = NI convention NI modifié");
ok(r.convN >= 1, 'au moins 1 cellule convention détectée dans le mois');

await browser.close();
console.log('\nconv-colors: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
