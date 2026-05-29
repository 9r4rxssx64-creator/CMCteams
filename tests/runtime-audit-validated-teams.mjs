// v9.762 runtime test — DÉTECTION ÉQUIPES par la lib T1 VALIDÉE (window.TeamDetector
// via bridge _cmcApplyValidatedTeams). Vérifie l'intégration de l'algorithme union-find
// par identité des codes journaliers (validé 6/6 sur l'équipe juin de Kevin).
//
// Fixture : 2 équipes MIROIR (mêmes jours de repos exactement, rotations horaires
// différentes — une sur 20/5, l'autre sur 22/6). Un membre utilise "R" (pas "RH")
// pour prouver que R compte AUSSI comme repos (bug corrigé : l'ancien prod ne comptait
// que "RH"). Assertions :
//   (a) les membres d'une même équipe reçoivent le MÊME teamHistory id ;
//   (b) les 2 équipes sont enregistrées comme miroirs dans cmc_team_mirror_<key> ;
//   (c) l'emp en "R" (et non "RH") est correctement clusterisé avec son équipe.
//
// Justification de l'algorithme (ne pas affaiblir le test si écart) : NOTES_USER /
// CLAUDE.md « DÉTECTION ÉQUIPES PAR JOURS REPOS » + lessons #68/#69 — clé d'équipe =
// MÊMES codes journaliers sur jours co-travaillés ; miroir = même famille + mêmes
// repos + rotations différentes ; RH et R = repos.
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
  await page.waitForFunction(() => typeof window.A === 'object'
    && typeof window.TeamDetector === 'object'
    && typeof window.TeamDetector.detectTeams === 'function'
    && typeof window._cmcApplyValidatedTeams === 'function', { timeout: 20000 });
  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });

  const result = await page.evaluate(() => {
    const out = { tests: [] };
    function test(label, fn) {
      try { const ok = fn(); out.tests.push({ label, ok: ok === true, error: ok === true ? null : ('expected true got ' + JSON.stringify(ok)) }); }
      catch (e) { out.tests.push({ label, ok: false, error: e.message }); }
    }

    const key = '2026-4';
    window.A.year = 2026; window.A.month = 4;
    window.A.overrides = window.A.overrides || {};
    window.A.overrides[key] = {};
    window.A.employees.forEach(e => {
      if (e.teamHistory) delete e.teamHistory[key];
      if (e.familyHistory) delete e.familyHistory[key];
    });
    try { localStorage.removeItem('cmc_team_mirror_' + key); } catch (_) {}

    // 6 emps non-cadres réels (mêmes que les autres tests, pas de homonymes spéciaux)
    const emps = window.A.employees.filter(e => (e.family || '') !== 'cadres').slice(0, 6);
    if (emps.length < 6) return { error: 'not enough emps' };

    // Force la même famille pour que les 6 puissent former équipe + miroir (la famille
    // est exigée IDENTIQUE par l'union-find et par la détection miroir).
    const FAM = 'roulettes';
    emps.forEach(e => { e.familyHistory = e.familyHistory || {}; e.familyHistory[key] = FAM; });

    // Rotation ÉQUIPE A — base 20/5. Mêmes jours de repos = [5,11,17,23,29].
    // Membre A3 utilise "R" au lieu de "RH" sur ces mêmes jours → doit clusteriser
    // avec A1/A2 (REST == REST quel que soit RH ou R).
    function rotA(restCode) {
      const r = {};
      const cycle = ['20/5','19/4','16/22','14/19','REST','20/5'];
      for (let d = 1; d <= 30; d++) {
        const c = cycle[(d - 1) % cycle.length];
        r[d] = (c === 'REST') ? restCode : c;
      }
      // Forcer les jours de repos exacts [5,11,17,23,29] identiques pour A et B
      [5,11,17,23,29].forEach(d => { r[d] = restCode; });
      // S'assurer que les jours travaillés communs sont identiques entre membres A
      for (let d = 1; d <= 30; d++) { if ([5,11,17,23,29].indexOf(d) < 0) r[d] = ((d % 2) ? '20/5' : '19/4'); }
      [5,11,17,23,29].forEach(d => { r[d] = restCode; });
      return r;
    }
    // Rotation MIROIR B — base 22/6, MÊMES jours de repos [5,11,17,23,29], rotation ≠.
    function rotB() {
      const r = {};
      for (let d = 1; d <= 30; d++) { r[d] = ((d % 2) ? '22/6' : '16/3'); }
      [5,11,17,23,29].forEach(d => { r[d] = 'RH'; });
      return r;
    }

    // A1, A2 = RH ; A3 = R (test : R compte comme repos)
    window.A.overrides[key][emps[0].id] = rotA('RH');
    window.A.overrides[key][emps[1].id] = rotA('RH');
    window.A.overrides[key][emps[2].id] = rotA('R');
    // B1, B2, B3 = miroir (base 22/6)
    window.A.overrides[key][emps[3].id] = rotB();
    window.A.overrides[key][emps[4].id] = rotB();
    window.A.overrides[key][emps[5].id] = rotB();

    const res = window._cmcApplyValidatedTeams(2026, 4);
    out.res = res;

    const idOf = e => (e.teamHistory && e.teamHistory[key]) || null;

    test('bridge retourne ok=true', () => res && res.ok === true);
    test('détecte exactement 2 équipes', () => res && res.report && res.report.teams === 2);

    // (a) membres d'une même équipe = même teamHistory id
    test('(a) A1, A2, A3 (dont R) ont le MÊME teamHistory id', () => {
      const a1 = idOf(emps[0]), a2 = idOf(emps[1]), a3 = idOf(emps[2]);
      return a1 != null && a1 === a2 && a2 === a3;
    });
    test('(a) B1, B2, B3 ont le MÊME teamHistory id', () => {
      const b1 = idOf(emps[3]), b2 = idOf(emps[4]), b3 = idOf(emps[5]);
      return b1 != null && b1 === b2 && b2 === b3;
    });
    test('équipe A et équipe B sont DISTINCTES', () => {
      return idOf(emps[0]) != null && idOf(emps[3]) != null && idOf(emps[0]) !== idOf(emps[3]);
    });

    // (c) l'emp en "R" (pas "RH") est bien groupé avec A1/A2
    test('(c) emp en R (A3) groupé avec A1 (R compte comme repos)', () => {
      return idOf(emps[2]) === idOf(emps[0]);
    });

    // (b) les 2 équipes sont miroirs dans cmc_team_mirror_<key>
    test('(b) cmc_team_mirror_<key> lie A et B (bidirectionnel)', () => {
      const m = JSON.parse(localStorage.getItem('cmc_team_mirror_' + key) || '{}');
      const a = idOf(emps[0]), b = idOf(emps[3]);
      if (a == null || b == null) return false;
      return m[a] === b && m[b] === a;
    });
    test('(b) res.mirrors expose la paire miroir', () => {
      const a = idOf(emps[0]), b = idOf(emps[3]);
      return res && res.mirrors && res.mirrors[a] === b && res.mirrors[b] === a;
    });

    // Garde-fou reproduction identique : les codes de cellules ne sont PAS modifiés
    test('reproduction identique : codes cellules intacts (A1 jour 1)', () => {
      return window.A.overrides[key][emps[0].id][1] === '20/5';
    });
    test('reproduction identique : code R préservé (A3 jour 5)', () => {
      return window.A.overrides[key][emps[2].id][5] === 'R';
    });

    return out;
  });

  console.log('\n=== Test runtime v9.762 — équipes détectées par lib T1 validée ===');
  if (result.error) { console.error('FATAL:', result.error); await browser.close(); process.exit(2); }
  let pass = 0, fail = 0;
  result.tests.forEach(t => {
    if (t.ok) { console.log('  ✅ ' + t.label); pass++; }
    else { console.log('  ✗ ' + t.label + (t.error ? ' — ' + t.error : '')); fail++; }
  });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ ÉQUIPES VALIDÉES (lib T1) OK' : '❌ RÉGRESSION détection équipes validées');
  console.log(`PASS: ${pass} · FAIL: ${fail}`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
