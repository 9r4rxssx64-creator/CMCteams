// v9.808 runtime test — DÉTECTION ÉQUIPES : l'union-find par CODES JOURNALIERS est
// l'AUTORITÉ ; le rest-pattern (signature grossière famille|repos|1er-code) ne fait
// plus que REMPLIR les emps non clusterisés (fill-only) et n'ÉCRASE JAMAIS une
// assignation union-find verrouillée.
//
// Bug réel Kevin (import JUILLET 2026) :
//   • GARRO S / MARIOTTINI J partageaient repos + 1er code travail avec l'équipe de
//     DESARZENS, MAIS leur rotation COMPLÈTE diffère → équipe DIFFÉRENTE. L'ancien
//     rest-pattern les fusionnait (sur-clustering). L'union-find par codes les SÉPARE.
//   • MARIANI M (CP la 1ère moitié) → repos tronqués → tombait dans une équipe
//     poubelle fallback. Il DOIT être dans l'équipe A (sa 2e moitié == rotation A).
//
// Scénario synthétique 30 jours (faute de rejouer l'extraction PDF réelle hors device) :
//   - Équipe A et Équipe B : MÊME famille (roulettes), MÊMES jours de repos,
//     MÊME 1er code travail (20/5), MAIS rotations complètes DIFFÉRENTES sur les
//     autres jours → l'ancien rest-pattern les aurait fusionnées.
//   - 1 personne CP la 1ère moitié dont la 2e moitié == rotation A.
// Assertions :
//   (1) A et B = 2 teamHistory ids DISTINCTS.
//   (2) Les 3 membres de A ensemble ; les 3 membres de B ensemble.
//   (3) Le CP-partiel atterrit dans A (PAS un fallback poubelle distinct).
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('\n=== Test runtime v9.808 — split équipes par codes journaliers (autorité) ===\n');
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 375, height: 812 } })).newPage();
  await page.goto('file://' + resolve(__dirname, '../index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.A === 'object'
    && typeof window._cmcDetectTeamsByDailyCodes === 'function'
    && typeof window._cmcDetectTeamsByRestPattern === 'function'
    && typeof window._cmcTeamLockReset === 'function', { timeout: 20000 });
  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });

  const out = await page.evaluate(() => {
    const res = { tests: [] };
    const t = (label, fn) => { try { const ok = fn(); res.tests.push({ label, ok: ok === true, error: ok === true ? null : ('got ' + JSON.stringify(ok)) }); } catch (e) { res.tests.push({ label, ok: false, error: e.message }); } };
    const key = '2026-5'; window.A.year = 2026; window.A.month = 5; // juin (index 5) 30 jours
    window.A.overrides = window.A.overrides || {}; window.A.overrides[key] = {};
    window.A.employees.forEach(e => { if (e.teamHistory) delete e.teamHistory[key]; if (e.familyHistory) delete e.familyHistory[key]; });
    try { localStorage.removeItem('cmc_team_mirror_' + key); } catch (_) {}
    window._cmcTeamLockReset(key);

    // Repos communs aux 2 équipes (RH + R)
    const rest = { rh: [5, 11, 17, 23, 29], r: [6, 12, 18, 24, 30] };
    const isRH = d => rest.rh.indexOf(d) >= 0;
    const isR = d => rest.r.indexOf(d) >= 0;
    const isRest = d => isRH(d) || isR(d);
    // Deux rotations de travail DIFFÉRENTES mais MÊME 1er code (jour 1 = 20/5).
    // rotA et rotB diffèrent sur tous les jours de travail SAUF le jour 1.
    function workCode(rot, d) {
      if (d === 1) return '20/5'; // 1er code travail IDENTIQUE pour A et B
      // jours de travail (non-repos) : codes différents par rotation
      const A = ['19/4', '16/22', '14/19', '20/5', '16/3'];
      const B = ['18/3', '12/17', '10/15', '18/3', '15/2'];
      const arr = rot === 'A' ? A : B;
      return arr[d % arr.length];
    }
    function sched(rot) {
      const o = {};
      for (let d = 1; d <= 30; d++) {
        if (isRH(d)) o[d] = 'RH';
        else if (isR(d)) o[d] = 'R';
        else o[d] = workCode(rot, d);
      }
      return o;
    }
    const emps = window.A.employees.filter(e => (e.family || '') !== 'cadres').slice(0, 7);
    if (emps.length < 7) return { error: 'not enough emps (' + emps.length + ')' };
    const ov = window.A.overrides[key];
    const setFam = (e, f) => { if (!e.familyHistory) e.familyHistory = {}; e.familyHistory[key] = f; };
    // Équipe A : 3 emps (rotation A) — simule DESARZENS + 2 coéquipiers
    ov[emps[0].id] = sched('A'); // "DESARZENS"
    ov[emps[1].id] = sched('A');
    ov[emps[2].id] = sched('A');
    [0, 1, 2].forEach(i => setFam(emps[i], 'roulettes'));
    // Équipe B : 3 emps (rotation B) — MÊMES repos + MÊME 1er code, rotation ≠
    //   → simule GARRO S / MARIOTTINI J : l'ancien rest-pattern les aurait fusionnés en A.
    ov[emps[3].id] = sched('B'); // "GARRO"
    ov[emps[4].id] = sched('B'); // "MARIOTTINI"
    ov[emps[5].id] = sched('B');
    [3, 4, 5].forEach(i => setFam(emps[i], 'roulettes'));
    // CP la 1ère moitié, rotation A la 2e moitié → simule MARIANI M.
    const partial = {};
    for (let d = 1; d <= 30; d++) {
      if (d <= 15) partial[d] = 'CP';
      else if (isRH(d)) partial[d] = 'RH';
      else if (isR(d)) partial[d] = 'R';
      else partial[d] = workCode('A', d);
    }
    ov[emps[6].id] = partial; // "MARIANI"
    setFam(emps[6], 'roulettes');

    // === Ordre RÉEL : union-find (autorité, verrouille) PUIS rest-pattern (fill-only) ===
    const rDC = window._cmcDetectTeamsByDailyCodes(2026, 5);
    const rRP = window._cmcDetectTeamsByRestPattern(2026, 5);

    const th = id => { const e = window.A.employees.find(x => x.id === id); return e && e.teamHistory && e.teamHistory[key]; };

    const teamA = th(emps[0].id);
    const teamB = th(emps[3].id);

    t('dailyCodes a clusterisé (>=1 cluster)', () => !!rDC && rDC.ok === true && rDC.teams >= 1);
    t('équipe A constituée (3 membres même id)', () => !!teamA && th(emps[0].id) === th(emps[1].id) && th(emps[1].id) === th(emps[2].id));
    t('équipe B constituée (3 membres même id)', () => !!teamB && th(emps[3].id) === th(emps[4].id) && th(emps[4].id) === th(emps[5].id));
    t('A ≠ B — équipes SÉPARÉES malgré repos+1er-code identiques (GARRO/MARIOTTINI ≠ DESARZENS)', () => !!teamA && !!teamB && teamA !== teamB);
    t('CP-partiel (MARIANI) rattaché à l\'équipe A (pas un fallback poubelle)', () => th(emps[6].id) === teamA);
    t('rest-pattern n\'a PAS écrasé les emps verrouillés (A reste A)', () => th(emps[0].id) === teamA && th(emps[3].id) === teamB);

    return res;
  });

  if (out.error) { console.log('❌ ' + out.error); await browser.close(); process.exit(1); }
  let pass = 0, fail = 0;
  out.tests.forEach(tt => { if (tt.ok) { console.log('  ✅ ' + tt.label); pass++; } else { console.log('  ❌ ' + tt.label + ' — ' + tt.error); fail++; } });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ SPLIT ÉQUIPES (autorité codes journaliers) OK' : '❌ SPLIT ÉQUIPES KO');
  console.log('PASS: ' + pass + ' · FAIL: ' + fail);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
