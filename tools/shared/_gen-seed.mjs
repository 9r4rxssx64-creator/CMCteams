// Génère le SEED de planning partagé pour CMCteams (l'app) — même source que la page
// Départs (vrais PDF, parser géométrique validé). Sortie : tools/shared/planning-seed.js
//   window.CMC_PLANNING_SEED = { version, months: { "<y>-<m>": {
//      ov:{empId:{day:code}}, emps:[{id,name,family}], team:{empId:teamId},
//      fam:{empId:familyId}, mirror:{teamId:teamMir} } } }
// L'app applique ce seed en LECTURE/affichage pour les mois qu'elle n'a pas encore
// (jamais d'écrasement des données live/Firebase). Régénère après chaque nouveau mois.
// Usage: node tools/shared/_gen-seed.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', '..');
const PDFJS = readFileSync(resolve(root, 'node_modules/pdfjs-dist/build/pdf.min.js'));
const PDFW = readFileSync(resolve(root, 'node_modules/pdfjs-dist/build/pdf.worker.min.js'));

const TARGETS = [
  { pdf: 'tests/fixtures/aout-2026-v1.pdf', year: 2026, monthIdx: 7 },
  { pdf: 'tests/fixtures/juillet-2026-v2.pdf', year: 2026, monthIdx: 6 },
];

async function extract(browser, pdfRel, year, monthIdx) {
  const pdfBytes = readFileSync(resolve(root, pdfRel));
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/cdnjs\.cloudflare\.com\/.*pdf\.min\.js/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: PDFJS }));
  await ctx.route(/cdnjs\.cloudflare\.com\/.*pdf\.worker\.min\.js/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: PDFW }));
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.__CMC_NO_SEED = true; });
  await page.goto('file://' + resolve(root, 'index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.handleFileImport === 'function' && window.A && Array.isArray(A.employees), { timeout: 20000 });
  await page.evaluate(({ y, m }) => { A.user = A.employees.find(e => e.id === 'U11804'); A.year = y; A.month = m; A.overrides = A.overrides || {}; delete A.overrides[y + '-' + m]; if (typeof sv === 'function') sv('import'); }, { y: year, m: monthIdx });
  const b64 = pdfBytes.toString('base64');
  await page.evaluate(async ({ b64, name, y, m }) => {
    const bin = atob(b64); const arr = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    const file = new File([arr], name, { type: 'application/pdf' });
    const inp = document.getElementById('impFile'); const dt = new DataTransfer(); dt.items.add(file); inp.files = dt.files;
    const sy = document.getElementById('impY'); if (sy) sy.value = String(y); const sm = document.getElementById('impM'); if (sm) sm.value = String(m);
    handleFileImport(inp);
  }, { b64, name: pdfRel.split('/').pop(), y: year, m: monthIdx });
  await page.waitForFunction((key) => { const ov = (window.A && A.overrides && A.overrides[key]) || null; return ov && Object.keys(ov).filter(id => ov[id] && Object.keys(ov[id]).length > 0).length > 50; }, year + '-' + monthIdx, { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.evaluate(({ y, m }) => { try { if (typeof _cmcFinalGeometricFill === 'function') _cmcFinalGeometricFill(y, m); } catch (_) {} }, { y: year, m: monthIdx });
  await page.waitForTimeout(500);
  const out = await page.evaluate((key) => {
    const ov = {}, raw = A.overrides[key] || {};
    Object.keys(raw).forEach(id => { const r = raw[id]; if (r && Object.keys(r).length) { ov[id] = {}; Object.keys(r).forEach(d => { if (r[d]) ov[id][d] = r[d]; }); } });
    const team = {}, fam = {}, emps = [];
    A.employees.forEach(e => {
      if (!e || !e.id) return;
      const t = (e.teamHistory || {})[key], f = (e.familyHistory || {})[key];
      if (ov[e.id]) { emps.push({ id: e.id, name: e.name, family: e.family || '' }); if (t) team[e.id] = t; if (f) fam[e.id] = f; }
    });
    let mirror = {}; try { mirror = JSON.parse(localStorage.getItem('cmc_team_mirror_' + key) || '{}'); } catch (_) {}
    return { ov, team, fam, mirror, emps, nCells: Object.keys(ov).reduce((s, id) => s + Object.keys(ov[id]).length, 0) };
  }, year + '-' + monthIdx);
  await ctx.close();
  return out;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const months = {};
  for (const tg of TARGETS) {
    const key = tg.year + '-' + tg.monthIdx;
    const r = await extract(browser, tg.pdf, tg.year, tg.monthIdx);
    months[key] = { ov: r.ov, emps: r.emps, team: r.team, fam: r.fam, mirror: r.mirror };
    console.log(key + ' : ' + r.emps.length + ' emps · ' + r.nCells + ' cellules · ' + Object.keys(r.team).length + ' avec équipe · ' + (Object.keys(r.mirror).length / 2) + ' miroirs');
  }
  await browser.close();
  const payload = { version: '2026-06-28', months };
  const js = '/* SEED planning CMCteams — GÉNÉRÉ par tools/shared/_gen-seed.mjs depuis les vrais PDF\n'
    + '   (même source que la page Départs). NE PAS éditer à la main. Appliqué en affichage\n'
    + '   par l\'app pour les mois sans données live (jamais d\'écrasement). */\n'
    + 'window.CMC_PLANNING_SEED=' + JSON.stringify(payload) + ';\n';
  writeFileSync(resolve(__dirname, 'planning-seed.js'), js);
  console.log('→ tools/shared/planning-seed.js écrit (' + js.length + ' octets, ' + Object.keys(months).length + ' mois)');
}
main().catch(e => { console.error(e); process.exit(1); });
