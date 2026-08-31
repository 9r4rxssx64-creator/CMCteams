// Faithful end-to-end import of a REAL PDF through the app's own pipeline.
// Routes the CDN pdf.js to the local node_modules copy (same version 3.11.174),
// drives handleFileImport with the real File, waits for doImport, then reports
// teams / horaires / départs / lieux / coverage. Also dumps faithful fixtures.
// Usage: node tests/import-real-pdf.mjs <pdf-path> <year> <monthIdx> [outFixtureBase]
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const pdfPath = process.argv[2];
const year = parseInt(process.argv[3], 10);
const monthIdx = parseInt(process.argv[4], 10);
const outBase = process.argv[5] || null;
if (!pdfPath || isNaN(year) || isNaN(monthIdx)) { console.error('usage: node tests/import-real-pdf.mjs <pdf> <year> <monthIdx0> [outBase]'); process.exit(2); }

const PDFJS = readFileSync(resolve(root, 'node_modules/pdfjs-dist/build/pdf.min.js'));
const PDFW = readFileSync(resolve(root, 'node_modules/pdfjs-dist/build/pdf.worker.min.js'));
const pdfBytes = readFileSync(resolve(root, pdfPath));

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  // Route the CDN pdf.js + worker to the local copies (faithful extraction, no egress).
  await ctx.route(/cdnjs\.cloudflare\.com\/.*pdf\.min\.js/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: PDFJS }));
  await ctx.route(/cdnjs\.cloudflare\.com\/.*pdf\.worker\.min\.js/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: PDFW }));
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.addInitScript(() => { window.__CMC_NO_SEED = true; });
  await page.goto('file://' + resolve(root, 'index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.handleFileImport === 'function' && window.A && Array.isArray(A.employees), { timeout: 20000 });
  await page.evaluate(({ y, m }) => {
    A.user = A.employees.find(e => e.id === 'U11804'); A.year = y; A.month = m;
    A.overrides = A.overrides || {}; delete A.overrides[y + '-' + m];
    // make sure import view exists so #impFile/#impTxt/#impY/#impM are present
    if (typeof sv === 'function') sv('import');
  }, { y: year, m: monthIdx });
  // Inject the PDF as a File on the import input and trigger the real handler.
  const b64 = pdfBytes.toString('base64');
  await page.evaluate(async ({ b64, name, y, m }) => {
    const bin = atob(b64); const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    const file = new File([arr], name, { type: 'application/pdf' });
    const inp = document.getElementById('impFile');
    const dt = new DataTransfer(); dt.items.add(file); inp.files = dt.files;
    const sy = document.getElementById('impY'); if (sy) sy.value = String(y);
    const sm = document.getElementById('impM'); if (sm) sm.value = String(m);
    window.__importDone = false;
    handleFileImport(inp);
  }, { b64, name: pdfPath.split('/').pop(), y: year, m: monthIdx });
  // Wait until overrides for the month are populated (extraction + doImport finished).
  await page.waitForFunction((key) => {
    const ov = (window.A && A.overrides && A.overrides[key]) || null;
    if (!ov) return false;
    const withCells = Object.keys(ov).filter(id => ov[id] && Object.keys(ov[id]).length > 0);
    return withCells.length > 50;
  }, year + '-' + monthIdx, { timeout: 45000 }).catch(() => {});
  // Give post-validate + team detection a moment.
  await page.waitForTimeout(2500);
  const out = await page.evaluate((key) => {
    const ov = A.overrides[key] || {};
    const days = (function(){ const [y,m]=key.split('-').map(Number); return new Date(y,m+1,0).getDate(); })();
    const ids = Object.keys(ov).filter(id => ov[id] && Object.keys(ov[id]).length > 0);
    let totalCells = 0; ids.forEach(id => totalCells += Object.keys(ov[id]).length);
    // teams
    const teams = {};
    A.employees.forEach(e => { const t = (e.teamHistory||{})[key]; if (t) { (teams[t]=teams[t]||[]).push(e.name); } });
    // out-of-bounds day keys
    let oob = 0; ids.forEach(id => Object.keys(ov[id]).forEach(d => { const n=+d; if (n<1||n>days) oob++; }));
    // lieux: codes present without a location mapping (codeToLieu)
    const codeSet = {}; ids.forEach(id => Object.keys(ov[id]).forEach(d => { codeSet[ov[id][d]] = 1; }));
    const noLieu = [];
    if (typeof codeToLieu === 'function') {
      Object.keys(codeSet).forEach(c => { try { const l = codeToLieu(c, null, key); } catch(_){} });
    }
    return {
      empsWithCells: ids.length, totalCells, days, oob,
      teamCount: Object.keys(teams).length,
      teamSizes: Object.keys(teams).sort().map(t => t+':'+teams[t].length).join(' '),
      sampleCodes: Object.keys(codeSet).slice(0, 40),
      kevinTeam: (A.employees.find(e=>e.id==='U11804')||{}).teamHistory ? (A.employees.find(e=>e.id==='U11804').teamHistory[key]) : null,
      textLen: (window._lastImportText||'').length,
      geoPages: (window._cmcPdfGeometry && window._cmcPdfGeometry.pages || []).length
    };
  }, year + '-' + monthIdx);
  // Dump faithful fixtures if requested
  if (outBase) {
    const dump = await page.evaluate(() => ({ text: window._lastImportText || '', geo: window._cmcPdfGeometry || null }));
    writeFileSync(resolve(root, outBase + '.txt'), dump.text);
    if (dump.geo) writeFileSync(resolve(root, outBase + '.geo.json'), JSON.stringify(dump.geo));
    console.log('fixtures written:', outBase + '.txt (' + dump.text.length + '), .geo.json');
  }
  console.log('pageerrors:', errs.length, errs.slice(0, 3));
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
}
main().catch(e => { console.error(e); process.exit(1); });
