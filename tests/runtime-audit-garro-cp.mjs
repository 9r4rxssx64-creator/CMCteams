// v9.817 — RÉGRESSION : un employé dans l'encadré d'ABSENCE (CP/M…) ne doit JAMAIS
// recevoir une rotation de travail fabriquée (Kevin 2026-06-23 « GARRO est dans
// l'encadré CP → congé 1-31 », « M = malade »). Avant le fix, la passe consensus
// (emp.team DEF_EMP) tournait AVANT les encadrés et collait à GARRO la rotation
// chef de l'équipe de Kevin. Fix : appliquer les encadrés géométriques AVANT le
// consensus. Test contre le VRAI PDF juillet 2026 V1 de Kevin (géométrie réelle).
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('\n=== Test v9.817 — encadré CP/M prioritaire sur consensus (GARRO=CP, MIRANDA=M) ===\n');
  const text = readFileSync(resolve(__dirname, 'fixtures/juillet-2026-v1.txt'), 'utf8');
  const geo = JSON.parse(readFileSync(resolve(__dirname, 'fixtures/juillet-2026-v1.geo.json'), 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + resolve(__dirname, '../index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.doImport === 'function' && window.A && Array.isArray(A.employees), { timeout: 20000 });
  await page.evaluate(() => { A.user = A.employees.find(e => e.id === 'U11804'); A.year = 2026; A.month = 6; A.overrides = A.overrides || {}; delete A.overrides['2026-6']; });
  const out = await page.evaluate(async ({ text, geo }) => {
    window._cmcPdfGeometry = geo; window._lastImportText = text;
    window.doImport(); await new Promise(r => setTimeout(r, 1800));
    const key = '2026-6', ov = A.overrides[key] || {};
    const cells = nm => { const e = A.employees.find(x => x.name && x.name.toUpperCase().indexOf(nm) >= 0); if (!e) return null; const c = ov[e.id] || {}; const ks = Object.keys(c); const cnt = {}; ks.forEach(d => { cnt[c[d]] = (cnt[c[d]] || 0) + 1; }); return { id: e.id, n: ks.length, cnt, team: (e.teamHistory || {})[key] }; };
    const me = A.employees.find(x => x.id === 'U11804'); const myTeam = me && (me.teamHistory || {})[key];
    const mates = A.employees.filter(x => (x.teamHistory || {})[key] === myTeam && Object.keys(ov[x.id] || {}).length > 0).map(x => x.name);
    return { total: Object.keys(ov).length, GARRO: cells('GARRO S'), MIRANDA: cells('MIRANDA T'), DESARZENS: cells('DESARZENS K'), GAZAGNE: cells('GAZAGNE F'), myTeam, mates };
  }, { text, geo });
  const tests = [];
  const t = (label, ok) => tests.push({ label, ok: ok === true });
  t('aucune pageerror', errs.length === 0);
  t('GARRO en CP tout le mois (≥28 jours CP, 0 code chef)', !!out.GARRO && (out.GARRO.cnt.CP || 0) >= 28 && !Object.keys(out.GARRO.cnt).some(c => /c$/.test(c)));
  t('MIRANDA en M (malade) tout le mois (≥28 jours M)', !!out.MIRANDA && (out.MIRANDA.cnt.M || 0) >= 28);
  t('GARRO PAS dans l\'équipe de Kevin', !!out.GARRO && out.GARRO.team !== out.myTeam);
  t('DESARZENS garde sa vraie grille (31 cellules, codes chef présents)', !!out.DESARZENS && out.DESARZENS.n === 31 && Object.keys(out.DESARZENS.cnt).some(c => /c$/.test(c)));
  t('GAZAGNE garde sa vraie grille roulette (31 cellules)', !!out.GAZAGNE && out.GAZAGNE.n === 31);
  t('couverture préservée (≥287 employés avec cellules)', out.total >= 287);
  // v9.818 : congé PARTIEL (Kevin CP 16-31) reste dans son équipe de TRAVAIL avec
  // ses coéquipiers présents tout le mois (pas une équipe à part).
  const KEVIN_MATES = ['DEJANOVIC', 'DESSI', 'MALENFANT', 'MARIOTTINI', 'PUGNETTI'];
  const matesFound = KEVIN_MATES.filter(n => (out.mates || []).some(m => m.toUpperCase().indexOf(n) >= 0));
  t('Kevin (CP partiel) reste avec son équipe de travail (≥5 coéquipiers présents)', matesFound.length >= 5);
  let pass = 0, fail = 0;
  tests.forEach(tt => { if (tt.ok) { console.log('  ✅ ' + tt.label); pass++; } else { console.log('  ❌ ' + tt.label); fail++; } });
  console.log('\nGARRO:', JSON.stringify(out.GARRO), '\nMIRANDA:', JSON.stringify(out.MIRANDA));
  console.log('\n' + (fail === 0 ? '✅ ENCADRÉ ABSENCE PRIORITAIRE OK' : '❌ KO') + '  PASS: ' + pass + ' · FAIL: ' + fail);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
