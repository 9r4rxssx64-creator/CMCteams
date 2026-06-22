// v9.815 — détection par COLONNE PDF DÉSACTIVÉE (garde non-régression).
// Ce test vérifiait les tailles d'équipes produites par _cmcDetectTeamsByPdfColumn
// (groupement par position). Cette approche a été RÉFUTÉE (position ≠ équipe,
// Kevin diag juillet 2026 « pas les mêmes repos ») → détecteur désactivé. Les
// tailles/compositions d'équipes sont désormais garanties par la règle repos+codes
// (rest-pattern), couverte par test:team-rule. Ce test garde que pdfColumn ABSTIENT.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('\n=== Test v9.815 — détection par colonne PDF DÉSACTIVÉE (tailles via repos+codes) ===\n');
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 375, height: 812 } })).newPage();
  await page.goto('file://' + resolve(__dirname, '../index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window._cmcDetectTeamsByPdfColumn === 'function', { timeout: 20000 });
  const out = await page.evaluate(() => {
    const tests = [];
    const t = (label, ok) => tests.push({ label, ok: ok === true });
    const r = window._cmcDetectTeamsByPdfColumn('BJ\n22/6c 19/4c\nNOM A NOM B', 2026, 6);
    t('_cmcDetectTeamsByPdfColumn ABSTIENT (ok:false, désactivé v9.815)', !!r && r.ok === false);
    return tests;
  });
  let pass = 0, fail = 0;
  out.forEach(tt => { if (tt.ok) { console.log('  ✅ ' + tt.label); pass++; } else { console.log('  ❌ ' + tt.label); fail++; } });
  console.log('\n' + (fail === 0 ? '✅ TAILLES ÉQUIPES (pdfColumn désactivé) OK' : '❌ TAILLES ÉQUIPES KO') + '  PASS: ' + pass + ' · FAIL: ' + fail);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
