// v9.815 — _cmcDetectTeamsByDailyCodes (union-find) DÉSACTIVÉ (garde non-régression).
// L'union-find par codes journaliers (≥82% sur jours co-travaillés) était l'autorité,
// mais il MERGE les équipes MIROIRS (mêmes repos, 1er code ≠ → >82% communs ; ex
// team 8 juillet mêlait 22/6 et 20/5) et peut joindre des gens à repos DIFFÉRENTS
// (Kevin diag juillet 2026 « pas les mêmes repos »). L'autorité unique est désormais
// le rest-pattern (même famille + MÊMES repos + même 1er code), couvert par
// test:team-rule. Ce test garde que l'union-find ABSTIENT.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('\n=== Test v9.815 — _cmcDetectTeamsByDailyCodes DÉSACTIVÉ ===\n');
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 375, height: 812 } })).newPage();
  await page.goto('file://' + resolve(__dirname, '../index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window._cmcDetectTeamsByDailyCodes === 'function', { timeout: 20000 });
  const out = await page.evaluate(() => {
    const tests = [];
    const t = (label, ok) => tests.push({ label, ok: ok === true });
    const r = window._cmcDetectTeamsByDailyCodes(2026, 6);
    t('_cmcDetectTeamsByDailyCodes ABSTIENT (ok:false, désactivé v9.815)', !!r && r.ok === false);
    return tests;
  });
  let pass = 0, fail = 0;
  out.forEach(tt => { if (tt.ok) { console.log('  ✅ ' + tt.label); pass++; } else { console.log('  ❌ ' + tt.label); fail++; } });
  console.log('\n' + (fail === 0 ? '✅ dailyCodes DÉSACTIVÉ OK (autorité = rest-pattern)' : '❌ KO') + '  PASS: ' + pass + ' · FAIL: ' + fail);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
