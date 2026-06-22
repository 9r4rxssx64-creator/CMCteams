// v9.815 — _cmcApplyValidatedTeams (union-find lib T1) DÉSACTIVÉ (garde non-régression).
// L'union-find par identité de codes journaliers MERGE les équipes MIROIRS (mêmes
// repos, 1er code différent → >82% de codes communs) et peut joindre des gens à
// repos DIFFÉRENTS. Réfuté par le diag juillet 2026 de Kevin (« pas les mêmes repos »).
// Seule règle correcte = même famille + MÊMES repos + même 1er code (rest-pattern,
// couvert par test:team-rule). Ce test garde que le détecteur union-find ABSTIENT.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('\n=== Test v9.815 — _cmcApplyValidatedTeams DÉSACTIVÉ ===\n');
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 375, height: 812 } })).newPage();
  await page.goto('file://' + resolve(__dirname, '../index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window._cmcApplyValidatedTeams === 'function', { timeout: 20000 });
  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });
  const out = await page.evaluate(() => {
    const tests = [];
    const t = (label, ok) => tests.push({ label, ok: ok === true });
    const r = window._cmcApplyValidatedTeams(2026, 6);
    t('_cmcApplyValidatedTeams ABSTIENT (ok:false, désactivé v9.815)', !!r && r.ok === false);
    return tests;
  });
  let pass = 0, fail = 0;
  out.forEach(tt => { if (tt.ok) { console.log('  ✅ ' + tt.label); pass++; } else { console.log('  ❌ ' + tt.label); fail++; } });
  console.log('\n' + (fail === 0 ? '✅ validatedTeams DÉSACTIVÉ OK' : '❌ ÉCHEC') + '  PASS: ' + pass + ' · FAIL: ' + fail);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
