// Probe: import a real PDF, then for each team's chefs print the DEPARTURE grid
// produced by the app's calcDepPos, and validate that each day forms a valid
// permutation of 1..pc (no dup, no gap, none > pc). Also compare the current
// rotation rot=(wi%4)+floor(wi/4) against the simple daily rotation rot=wi.
// Usage: node tests/probe-departs.mjs <pdf> <year> <monthIdx0>
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pdfPath = process.argv[2], year = +process.argv[3], monthIdx = +process.argv[4];
const PDFJS = readFileSync(resolve(root, 'node_modules/pdfjs-dist/build/pdf.min.js'));
const PDFW = readFileSync(resolve(root, 'node_modules/pdfjs-dist/build/pdf.worker.min.js'));
const pdfBytes = readFileSync(resolve(root, pdfPath));

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/cdnjs\.cloudflare\.com\/.*pdf\.min\.js/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: PDFJS }));
await ctx.route(/cdnjs\.cloudflare\.com\/.*pdf\.worker\.min\.js/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: PDFW }));
const page = await ctx.newPage();
const errs = []; page.on('pageerror', e => errs.push(String(e)));
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
}, { b64, name: pdfPath.split('/').pop(), y: year, m: monthIdx });
await page.waitForFunction((key) => { const ov = (window.A && A.overrides && A.overrides[key]) || null; return ov && Object.keys(ov).filter(id => ov[id] && Object.keys(ov[id]).length > 0).length > 50; }, year + '-' + monthIdx, { timeout: 45000 }).catch(() => {});
await page.waitForTimeout(3000);

const res = await page.evaluate(({ y, m }) => {
  const key = y + '-' + m, days = new Date(y, m + 1, 0).getDate();
  const pl = gpl();
  // Build the chef roster per team exactly as calcDepPos does (CHEFS_T).
  const out = { teams: [], anomalies: [] };
  const teamIds = Object.keys(CHEFS_T || {}).filter(t => (CHEFS_T[t] || []).length);
  teamIds.forEach(tid => {
    const chefNames = CHEFS_T[tid] || [];
    // resolve active chef employees (mirror of calcDepPos)
    const seenId = {}, seenNm = {};
    let chefEmps = chefNames.map(n => {
      const ms = A.employees.filter(e => e.name === n);
      if (ms.length <= 1) return ms[0];
      const ov = A.overrides[key] || {};
      return ms.find(e => ov[e.id] && Object.keys(ov[e.id]).length) || ms[0];
    }).filter(e => e && isEmpActive(e, y, m) && !seenId[e.id] && !seenNm[e.name] && (seenId[e.id] = seenNm[e.name] = 1));
    chefEmps = chefEmps.filter(e => { for (let d = 1; d <= days; d++) if (isWork((pl[e.id] || {})[d] || '')) return true; return false; });
    if (!chefEmps.length) return;
    // per-day departure numbers via the real calcDepPos
    const grid = {}; // name -> {day:num}
    chefEmps.forEach(e => { grid[e.name] = {}; });
    const perDay = []; // {day, present:[{name,num}]}
    for (let d = 1; d <= days; d++) {
      const present = [];
      chefEmps.forEach(e => { const v = calcDepPos(e.name, tid, d); if (v != null) present.push({ name: e.name, num: v }); grid[e.name][d] = v; });
      if (present.length) perDay.push({ day: d, nums: present.map(p => p.num), names: present.map(p => p.name) });
    }
    // validity: each day with pc present must be a permutation of 1..pc
    let bad = 0; const badDays = [];
    perDay.forEach(pd => {
      const pc = pd.nums.length, set = new Set(pd.nums);
      const ok = set.size === pc && pd.nums.every(n => n >= 1 && n <= pc);
      if (!ok) { bad++; badDays.push({ day: pd.day, nums: pd.nums }); }
    });
    out.teams.push({ tid, chefs: chefEmps.map(e => e.name), nDays: perDay.length, badDays: badDays.slice(0, 8), badCount: bad,
      sample: perDay.slice(0, 16).map(pd => 'j' + pd.day + ':[' + pd.names.map((nm, i) => nm.split(' ')[0].slice(0,6) + '=' + pd.nums[i]).join(' ') + ']') });
    if (bad) out.anomalies.push(tid + ' → ' + bad + ' jours non-permutation');
  });
  return out;
}, { y: year, m: monthIdx });

console.log('pageerrors:', errs.length, errs.slice(0, 2));
console.log('\n===== DÉPARTS par équipe (calcDepPos réel) =====');
res.teams.forEach(t => {
  console.log('\n▸ ' + t.tid + '  (' + t.chefs.length + ' chefs: ' + t.chefs.join(', ') + ')  — ' + t.nDays + ' jours actifs, ' + t.badCount + ' anomalies');
  t.sample.forEach(s => console.log('   ' + s));
  if (t.badDays.length) console.log('   ⚠ jours non-permutation: ' + JSON.stringify(t.badDays));
});
console.log('\n===== ANOMALIES =====');
console.log(res.anomalies.length ? res.anomalies.join('\n') : '  aucune (toutes les journées = permutation valide 1..pc)');
await browser.close();
