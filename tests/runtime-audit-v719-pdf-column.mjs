// v9.815 — _cmcDetectTeamsByPdfColumn DÉSACTIVÉ (garde de non-régression).
// Le groupement d'équipes par COLONNE/POSITION du PDF a été RÉFUTÉ par les vraies
// données (Kevin diag juillet 2026 : « encore tout mélangé, pas les mêmes repos »).
// La position met ensemble des gens à repos DIFFÉRENTS (position ≠ équipe, #112).
// Seule règle correcte = même famille + MÊMES repos + même 1er code (rest-pattern,
// couvert par test:team-rule). Ce test garde que le détecteur par position ABSTIENT.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('\n=== Test v9.815 — _cmcDetectTeamsByPdfColumn DÉSACTIVÉ ===\n');
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 375, height: 812 } })).newPage();
  await page.goto('file://' + resolve(__dirname, '../index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window._cmcDetectTeamsByPdfColumn === 'function', { timeout: 20000 });
  const out = await page.evaluate(() => {
    const tests = [];
    const t = (label, ok) => tests.push({ label, ok: ok === true });
    const r = window._cmcDetectTeamsByPdfColumn('NOM A 1 31 22/6c 19/4c\nNOM B 1 31 20/5c 16/3c', 2026, 6);
    t('_cmcDetectTeamsByPdfColumn ABSTIENT (ok:false, désactivé v9.815)', !!r && r.ok === false);
    return tests;
  });
  let pass = 0, fail = 0;
  out.forEach(tt => { if (tt.ok) { console.log('  ✅ ' + tt.label); pass++; } else { console.log('  ❌ ' + tt.label); fail++; } });
  console.log('\n' + (fail === 0 ? '✅ pdfColumn DÉSACTIVÉ OK' : '❌ ÉCHEC') + '  PASS: ' + pass + ' · FAIL: ' + fail);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
