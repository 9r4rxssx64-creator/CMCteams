// v9.814 runtime test — DÉTECTEUR GÉOMÉTRIQUE (position) DÉSACTIVÉ + règle repos+codes.
//
// Historique : v9.810→813 avaient tenté de séparer les équipes par POSITION dans le
// PDF (écart vertical / "trait noir"). Les VRAIES données de juillet 2026 (Kevin) ont
// RÉFUTÉ cette approche : GARRO S se retrouvait dans BJ Éq.2 avec son voisin PHYSIQUE
// GAZAGNE F (rotation totalement différente). La POSITION ≠ ÉQUIPE pour ce PDF.
// → v9.814 désactive _cmcDetectTeamsByGeometry / _cmcApplyGeomTeams. La vérité d'équipe
//   = mêmes repos + mêmes codes (rest-pattern v9.803 + union-find dailyCodes v9.808).
//
// Ce test garde la non-régression : (1) le détecteur géométrique ABSTIENT toujours
// (même avec une géométrie présente), (2) il ne ré-applique plus d'anciennes équipes
// "g*", (3) la règle repos+codes regroupe bien des gens à repos+codes IDENTIQUES.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('\n=== Test runtime v9.814 — géométrie DÉSACTIVÉE + règle repos+codes ===\n');
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 375, height: 812 } })).newPage();
  await page.goto('file://' + resolve(__dirname, '../index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.A === 'object'
    && typeof window._cmcDetectTeamsByGeometry === 'function'
    && typeof window._cmcApplyGeomTeams === 'function'
    && typeof window._cmcDetectTeamsByRestPattern === 'function'
    && typeof window._cmcTeamLockReset === 'function'
    && typeof window.TextParser === 'object', { timeout: 20000 });
  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });

  const out = await page.evaluate(() => {
    const res = { tests: [] };
    const t = (label, fn) => { try { const ok = fn(); res.tests.push({ label, ok: ok === true, error: ok === true ? null : ('got ' + JSON.stringify(ok)) }); } catch (e) { res.tests.push({ label, ok: false, error: e.message }); } };
    const key = '2026-6'; window.A.year = 2026; window.A.month = 6;
    window.A.overrides = window.A.overrides || {}; window.A.overrides[key] = {};
    window.A.employees.forEach(e => { if (e.teamHistory) delete e.teamHistory[key]; if (e.familyHistory) delete e.familyHistory[key]; });
    try { localStorage.removeItem('cmc_team_mirror_' + key); } catch (_) {}
    try { localStorage.removeItem('cmc_geom_teams'); } catch (_) {}
    window._cmcTeamLockReset(key);

    // (1) Géométrie présente MAIS détecteur désactivé → doit ABSTENIR.
    window._cmcPdfGeometry = { pages: [{ pageNum: 1, items: [{ str: 'X', x: 1, y: 1, w: 1, h: 1 }] }], textRaw: '', ts: Date.now() };
    const rGeom = window._cmcDetectTeamsByGeometry(2026, 6);
    t('(1) _cmcDetectTeamsByGeometry ABSTIENT (désactivé v9.814)', () => !!rGeom && rGeom.ok === false);
    const rApply = window._cmcApplyGeomTeams(2026, 6);
    t('(2) _cmcApplyGeomTeams ABSTIENT (désactivé v9.814)', () => !!rApply && rApply.ok === false);

    // (3) Règle repos+codes : 2 emps même famille + MÊMES repos + MÊME 1er code travail
    //     = MÊME équipe ; un 3e à 1er code DIFFÉRENT (même repos) = équipe MIROIR.
    const restRH = [6, 13, 20, 27], restR = [7, 14, 21, 28];
    const sched = (work) => { const o = {}; for (let d = 1; d <= 31; d++) { if (restRH.indexOf(d) >= 0) o[d] = 'RH'; else if (restR.indexOf(d) >= 0) o[d] = 'R'; else o[d] = (d === 1 ? work : (['16/3c', '20/5c', '14/19c', '22/6c'][d % 4])); } return o; };
    const emps = window.A.employees.filter(e => (e.family || '') !== 'cadres').slice(0, 4);
    if (emps.length < 4) return { error: 'not enough emps' };
    const ov = window.A.overrides[key];
    emps.forEach(e => { if (!e.familyHistory) e.familyHistory = {}; e.familyHistory[key] = 'bj'; });
    ov[emps[0].id] = sched('22/6c');   // équipe A
    ov[emps[1].id] = sched('22/6c');   // même repos + même 1er code → MÊME équipe que A
    ov[emps[2].id] = sched('20/5c');   // équipe B (miroir : même repos, 1er code différent)
    ov[emps[3].id] = sched('20/5c');   // même que B
    window._cmcTeamLockReset(key);
    window._cmcDetectTeamsByRestPattern(2026, 6);
    const th = id => { const e = window.A.employees.find(x => x.id === id); return e && e.teamHistory && e.teamHistory[key]; };
    res._diag = { a: th(emps[0].id), b: th(emps[1].id), c: th(emps[2].id), d: th(emps[3].id) };
    t('(3) repos+codes identiques → MÊME équipe (A==B)', () => !!th(emps[0].id) && th(emps[0].id) === th(emps[1].id));
    t('(4) miroir : 2 emps même repos, 1er code ≠ → équipe DIFFÉRENTE mais groupés ensemble (C==D≠A)',
      () => !!th(emps[2].id) && th(emps[2].id) === th(emps[3].id) && th(emps[2].id) !== th(emps[0].id));

    return res;
  });

  if (out.error) { console.log('❌ ' + out.error); await browser.close(); process.exit(1); }
  if (out._diag) console.log('  diag:', JSON.stringify(out._diag));
  let pass = 0, fail = 0;
  out.tests.forEach(tt => { if (tt.ok) { console.log('  ✅ ' + tt.label); pass++; } else { console.log('  ❌ ' + tt.label + ' — ' + tt.error); fail++; } });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ GÉOMÉTRIE DÉSACTIVÉE + RÈGLE REPOS+CODES OK' : '❌ KO');
  console.log('PASS: ' + pass + ' · FAIL: ' + fail);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
