// v9.821 — vérifie que vVerify() (vue de vérification autonome) rend correctement
// après un VRAI import (Août V1 + Juillet V2), sans erreur, avec ses 6 sections.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const PDFJS = readFileSync(resolve(root, 'node_modules/pdfjs-dist/build/pdf.min.js'));
const PDFW = readFileSync(resolve(root, 'node_modules/pdfjs-dist/build/pdf.worker.min.js'));

async function runOne(browser, pdfRel, year, monthIdx, label) {
  const pdfBytes = readFileSync(resolve(root, pdfRel));
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/cdnjs\.cloudflare\.com\/.*pdf\.min\.js/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: PDFJS }));
  await ctx.route(/cdnjs\.cloudflare\.com\/.*pdf\.worker\.min\.js/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: PDFW }));
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
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
  await page.waitForFunction((key) => { const ov = (window.A && A.overrides && A.overrides[key]) || null; if (!ov) return false; return Object.keys(ov).filter(id => ov[id] && Object.keys(ov[id]).length > 0).length > 50; }, year + '-' + monthIdx, { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const out = await page.evaluate(() => {
    A.view = 'verify';
    const html = (typeof vVerify === 'function') ? vVerify() : '';
    return {
      len: html.length,
      hasVerdict: /Tout est correct|à vérifier|à corriger/.test(html),
      secCouverture: /Couverture/.test(html),
      secHoraires: /Horaires/.test(html),
      secEquipes: /Équipes —/.test(html),
      secDeparts: /Ordre de départ/.test(html),
      secLieux: /Lieux \(tables/.test(html),
      secAbsences: /Absences intégrales/.test(html),
      verdict: (html.match(/Tout est correct|\d+ point\(s\) à vérifier|\d+ problème\(s\) à corriger/) || ['?'])[0]
    };
  });
  const tests = []; const t = (l, ok) => tests.push({ l, ok: ok === true });
  t(label + ' : aucune pageerror', errs.length === 0);
  t(label + ' : vVerify rend du contenu', out.len > 1000);
  t(label + ' : section Couverture', out.secCouverture);
  t(label + ' : section Horaires', out.secHoraires);
  t(label + ' : section Équipes', out.secEquipes);
  t(label + ' : section Départs', out.secDeparts);
  t(label + ' : section Lieux', out.secLieux);
  t(label + ' : section Absences', out.secAbsences);
  t(label + ' : verdict global présent', out.hasVerdict);
  await ctx.close();
  return { tests, verdict: out.verdict, err: errs.slice(0, 2) };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const r1 = await runOne(browser, 'tests/fixtures/aout-2026-v1.pdf', 2026, 7, 'Août V1');
  const r2 = await runOne(browser, 'tests/fixtures/juillet-2026-v2.pdf', 2026, 6, 'Juillet V2');
  await browser.close();
  let pass = 0, fail = 0;
  [r1, r2].forEach(r => r.tests.forEach(tt => { console.log((tt.ok ? '  ✅ ' : '  ❌ ') + tt.l); tt.ok ? pass++ : fail++; }));
  console.log('\nVerdict Août V1 :', r1.verdict, r1.err.length ? ('· err ' + JSON.stringify(r1.err)) : '');
  console.log('Verdict Juillet V2 :', r2.verdict, r2.err.length ? ('· err ' + JSON.stringify(r2.err)) : '');
  console.log('\n' + (fail === 0 ? '✅ vVERIFY OK' : '❌ KO') + '  PASS:' + pass + ' FAIL:' + fail);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
