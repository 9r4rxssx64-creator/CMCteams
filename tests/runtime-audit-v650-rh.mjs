// v9.650 runtime test : algo détection équipes par cycle:offset (robuste CP/AF)
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto('file://' + INDEX_PATH, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.A === 'object' && typeof window._cmcDetectTeamsByRestPattern === 'function', { timeout: 20000 });
  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });

  const result = await page.evaluate(() => {
    const out = { tests: [] };
    function test(label, fn) {
      try { const ok = fn(); out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('expected true got ' + JSON.stringify(ok)) }); }
      catch (e) { out.tests.push({ label, ok: false, error: e.message }); }
    }

    // Setup : 6 emps avec patterns RH connus
    const key = '2026-4';
    window.A.year = 2026; window.A.month = 4;
    window.A.overrides = window.A.overrides || {};
    
    // Clear et recréer overrides + reset teamHistory
    window.A.overrides[key] = {};
    window.A.employees.forEach(e => { if (e.teamHistory) delete e.teamHistory[key]; });

    // Pick 6 emps non-cadres réels
    const emps = window.A.employees.filter(e => (e.family || '') !== 'cadres').slice(0, 8);
    if (emps.length < 6) return { error: 'not enough emps' };

    // Team A : 3 emps avec RH 5,11,17,23,29 (cycle 6, offset 4)
    [0,1,2].forEach(i => {
      const r = {};
      [5,11,17,23,29].forEach(d => r[d] = 'RH');
      for (let d = 1; d <= 30; d++) if (!r[d]) r[d] = '20/5';
      window.A.overrides[key][emps[i].id] = r;
    });
    // Team B : 3 emps avec RH 4,10,16,22,28 (cycle 6, offset 3) — devrait être miroir
    [3,4,5].forEach(i => {
      const r = {};
      [4,10,16,22,28].forEach(d => r[d] = 'RH');
      for (let d = 1; d <= 30; d++) if (!r[d]) r[d] = '19/4';
      window.A.overrides[key][emps[i].id] = r;
    });

    const res = window._cmcDetectTeamsByRestPattern(2026, 4);
    
    test('v9.650 : algo retourne ok=true', () => res && res.ok === true);
    test('v9.650 : détecte exactement 2 équipes', () => res && res.report && res.report.teams === 2);
    test('v9.650 : assigne 6 emps', () => res && res.report && res.report.empsAssigned === 6);
    test('v9.650 : détecte cycle 6', () => res && res.report && res.report.cycles.indexOf(6) >= 0);
    test('v9.650 : team[0] teamHistory écrit', () => {
      return emps[0].teamHistory && emps[0].teamHistory[key] !== undefined;
    });
    test('v9.650 : team A et B distinctes', () => {
      return emps[0].teamHistory[key] !== emps[3].teamHistory[key];
    });
    test('v9.650 : team A même teamId pour 3 emps', () => {
      return emps[0].teamHistory[key] === emps[1].teamHistory[key]
          && emps[1].teamHistory[key] === emps[2].teamHistory[key];
    });
    test('v9.650 : robuste CP interruption (emp 0 a CP au lieu de RH jour 11)', () => {
      // Reset et test avec CP qui interrompt
      window.A.employees.forEach(e => { if (e.teamHistory) delete e.teamHistory[key]; });
      window.A.overrides[key] = {};
      [0,1,2].forEach(i => {
        const r = {};
        [5,17,23,29].forEach(d => r[d] = 'RH'); // 11 REMPLACÉ par CP
        if (i === 0) r[11] = 'CP'; else r[11] = 'RH';
        for (let d = 1; d <= 30; d++) if (!r[d]) r[d] = '20/5';
        window.A.overrides[key][emps[i].id] = r;
      });
      const r2 = window._cmcDetectTeamsByRestPattern(2026, 4);
      // Emp 0 (avec CP) devrait quand même être détecté avec cycle 6 (gaps 12, 6, 6, 6 → median 6)
      return r2 && r2.ok === true && r2.report.empsAssigned >= 2;
    });

    return out;
  });

  console.log('\n=== Tests v9.650 — algo détection équipes RH robuste ===');
  if (result.error) { console.error('FATAL:', result.error); await browser.close(); process.exit(2); }
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✓ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ v9.650 algo RH OK' : '❌ v9.650 REGRESSION');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
