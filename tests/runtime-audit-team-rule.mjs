// v9.803 runtime test — RÈGLE EXACTE Kevin 2026-06-14 pour _cmcDetectTeamsByRestPattern :
//   • ÉQUIPE  = même FAMILLE + MÊMES jours de repos (RH ∪ R)
//   • MIROIR  = même famille + MÊMES repos + HORAIRE (1er code travail) DIFFÉRENT
//   • familles différentes avec mêmes repos → JAMAIS la même équipe
//   • repos différents (même famille) → équipes différentes (pas miroir)
//   • CP partiel (repos ⊆ ceux d'une équipe) → rattaché à cette équipe
//
// Données synthétiques 30 jours (faute de pouvoir rejouer l'extraction PDF réelle hors
// device). La famille est déduite des suffixes de code (c→bj, "→cmc, nu→roulettes),
// donc on encode la famille via les codes.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('\n=== Test runtime v9.803 — équipes par repos + miroir par horaire ===\n');
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 375, height: 812 } })).newPage();
  await page.goto('file://' + resolve(__dirname, '../index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.A === 'object' && typeof window._cmcDetectTeamsByRestPattern === 'function', { timeout: 20000 });
  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });

  const out = await page.evaluate(() => {
    const res = { tests: [] };
    const t = (label, fn) => { try { const ok = fn(); res.tests.push({ label, ok: ok === true, error: ok === true ? null : ('got ' + JSON.stringify(ok)) }); } catch (e) { res.tests.push({ label, ok: false, error: e.message }); } };
    const key = '2026-4'; window.A.year = 2026; window.A.month = 4;
    window.A.overrides = window.A.overrides || {}; window.A.overrides[key] = {};
    window.A.employees.forEach(e => { if (e.teamHistory) delete e.teamHistory[key]; if (e.familyHistory) delete e.familyHistory[key]; });
    try { localStorage.removeItem('cmc_team_mirror_' + key); } catch (_) {}

    // restPair: array of [RHday, Rday] pairs → produce 30-day schedule with given work code family
    // restA = days 5,6,11,12,17,18,23,24,29,30  ; restB = days 2,3,8,9,14,15,20,21,26,27
    const restA = { rh: [5, 11, 17, 23, 29], r: [6, 12, 18, 24, 30] };
    const restB = { rh: [2, 8, 14, 20, 26], r: [3, 9, 15, 21, 27] };
    function sched(rest, fw, work) {
      const o = {};
      for (let d = 1; d <= 30; d++) {
        if (rest.rh.indexOf(d) >= 0) o[d] = 'RH';
        else if (rest.r.indexOf(d) >= 0) o[d] = 'R';
        else o[d] = (d === 1 ? fw : work);
      }
      return o;
    }
    // pick 18 distinct non-cadre real emps
    const emps = window.A.employees.filter(e => (e.family || '') !== 'cadres').slice(0, 18);
    if (emps.length < 18) return { error: 'not enough emps' };
    const ov = window.A.overrides[key];
    // v9.805 (vérité terrain Kevin 2026-06-15) : la FAMILLE vient de la SECTION du
    // PDF (familyHistory[key], posé à l'import) — PAS du suffixe 'c' (= chef). On
    // simule donc l'import en posant familyHistory pour chaque emp.
    const setFam = (e, f) => { if (!e.familyHistory) e.familyHistory = {}; e.familyHistory[key] = f; };
    // roulettes — team R1 (fw 20/5) rest A : 2 croupiers (plain) + 1 CHEF (codes 'c')
    ov[emps[0].id] = sched(restA, '20/5', '19/4');
    ov[emps[1].id] = sched(restA, '20/5', '19/4');
    // emps[2] = CHEF de ROULETTE : codes 'c' MAIS section roulettes (LARINI H réel) →
    // DOIT rester roulettes + même équipe que 0,1 (fwBase 20/5 identique).
    ov[emps[2].id] = sched(restA, '20/5c', '19/4c');
    [0, 1, 2].forEach(i => setFam(emps[i], 'roulettes'));
    // roulettes mirror R1' (fw 22/6') rest A — SAME repos, diff horaire
    ov[emps[3].id] = sched(restA, "22/6'", '19/4');
    ov[emps[4].id] = sched(restA, "22/6'", '19/4');
    ov[emps[5].id] = sched(restA, "22/6'", '19/4');
    [3, 4, 5].forEach(i => setFam(emps[i], 'roulettes'));
    // roulettes team R2 (fw 14/19) rest B — diff repos → diff team, no mirror
    ov[emps[6].id] = sched(restB, '14/19', '16/22');
    ov[emps[7].id] = sched(restB, '14/19', '16/22');
    ov[emps[8].id] = sched(restB, '14/19', '16/22');
    [6, 7, 8].forEach(i => setFam(emps[i], 'roulettes'));
    // BJ chefs (codes 'c') section bj, rest A fw 20/5c — MÊMES repos + MÊMES codes 'c'
    // que le chef roulette emps[2], mais FAMILLE bj (section) → équipe séparée.
    ov[emps[9].id] = sched(restA, '20/5c', '19/4c');
    ov[emps[10].id] = sched(restA, '20/5c', '19/4c');
    [9, 10].forEach(i => setFam(emps[i], 'bj'));
    // CMC ('"' codes) rest A fw 20/5" — family cmc → separate
    ov[emps[12].id] = sched(restA, '20/5"', '19/4"');
    ov[emps[13].id] = sched(restA, '20/5"', '19/4"');
    [12, 13].forEach(i => setFam(emps[i], 'cmc'));
    // CP-partial roulettes: rest = subset of restA (only first half present, CP after)
    const partial = {}; for (let d = 1; d <= 30; d++) { if (d > 18) partial[d] = 'CP'; else if (restA.rh.indexOf(d) >= 0) partial[d] = 'RH'; else if (restA.r.indexOf(d) >= 0) partial[d] = 'R'; else partial[d] = (d === 1 ? '20/5' : '19/4'); }
    ov[emps[11].id] = partial;
    setFam(emps[11], 'roulettes');

    // v9.847 (Kevin « équipe 5 trop de monde = équipe+miroir regroupés ; horaires du 1er
    // ET du 3ème jour pour dispatch ») — CAS CRITIQUE : équipe X et son miroir partagent
    // les MÊMES repos ET le MÊME 1er code travail (20/5), mais divergent au JOUR 3 (16/22
    // vs 14/19). AVANT (signature = seul 1er code) → fusionnées en 1 équipe surpeuplée.
    // APRÈS (signature = 3 premiers codes travail) → 2 équipes distinctes + lien miroir.
    const restC = { rh: [4, 10, 16, 22, 28], r: [7, 13, 19, 25] };
    function schedD(rest, d1, d2, d3, work) { const o = {}; for (let d = 1; d <= 30; d++) { if (rest.rh.indexOf(d) >= 0) o[d] = 'RH'; else if (rest.r.indexOf(d) >= 0) o[d] = 'R'; else o[d] = (d === 1 ? d1 : d === 2 ? d2 : d === 3 ? d3 : work); } return o; }
    // Équipe X : jours 1-3 = 20/5, 16/22, 14/19
    ov[emps[14].id] = schedD(restC, '20/5', '16/22', '14/19', '19/4');
    ov[emps[15].id] = schedD(restC, '20/5', '16/22', '14/19', '19/4');
    // Miroir X' : jour 1 = 20/5 (IDENTIQUE), jour 3 = 16/3 (DIFFÉRENT)
    ov[emps[16].id] = schedD(restC, '20/5', '16/22', '16/3', '19/4');
    ov[emps[17].id] = schedD(restC, '20/5', '16/22', '16/3', '19/4');
    [14, 15, 16, 17].forEach(i => setFam(emps[i], 'roulettes'));

    const r = window._cmcDetectTeamsByRestPattern(2026, 4);
    const th = id => { const e = window.A.employees.find(x => x.id === id); return e && e.teamHistory && e.teamHistory[key]; };
    const fam = id => { const e = window.A.employees.find(x => x.id === id); return e && e.familyHistory && e.familyHistory[key]; };
    let mir = {}; try { mir = JSON.parse(localStorage.getItem('cmc_team_mirror_' + key) || '{}'); } catch (_) {}

    t('algo ok', () => r && r.ok === true);
    t('R1 : 3 emps même équipe (dont le CHEF emps[2] codes c)', () => th(emps[0].id) && th(emps[0].id) === th(emps[1].id) && th(emps[1].id) === th(emps[2].id));
    t('R1 : famille roulettes (id r*)', () => /^r/.test(th(emps[0].id) || '') && fam(emps[0].id) === 'roulettes');
    t("CHEF de roulette (codes 'c') RESTE roulettes (≠ bj)", () => fam(emps[2].id) === 'roulettes' && th(emps[2].id) === th(emps[0].id));
    t("R1' miroir : 3 emps même équipe", () => th(emps[3].id) && th(emps[3].id) === th(emps[4].id) && th(emps[4].id) === th(emps[5].id));
    t("R1 ≠ R1' (équipe vs miroir distinctes)", () => th(emps[0].id) !== th(emps[3].id));
    t("MIROIR détecté R1 ↔ R1'", () => mir[th(emps[0].id)] === th(emps[3].id) && mir[th(emps[3].id)] === th(emps[0].id));
    t('R2 (repos différents) : équipe distincte', () => th(emps[6].id) && th(emps[6].id) === th(emps[7].id) && th(emps[6].id) !== th(emps[0].id) && th(emps[6].id) !== th(emps[3].id));
    t('R2 SANS miroir (repos uniques)', () => !mir[th(emps[6].id)]);
    t('BJ mêmes repos que R1 mais FAMILLE bj → équipe séparée', () => th(emps[9].id) === th(emps[10].id) && th(emps[9].id) !== th(emps[0].id) && fam(emps[9].id) === 'bj');
    t('CMC mêmes repos que R1 mais FAMILLE cmc → équipe séparée', () => th(emps[12].id) === th(emps[13].id) && th(emps[12].id) !== th(emps[0].id) && fam(emps[12].id) === 'cmc');
    t('CP partiel (repos ⊆ R1) rattaché à R1', () => th(emps[11].id) === th(emps[0].id));
    // v9.847 — dispatch par les 3 premiers codes travail (le vrai bug « équipe 5 trop de monde »)
    t('X : 2 emps même équipe (1-3 : 20/5·16/22·14/19)', () => th(emps[14].id) && th(emps[14].id) === th(emps[15].id));
    t("X' : 2 emps même équipe (1-3 : 20/5·16/22·16/3)", () => th(emps[16].id) && th(emps[16].id) === th(emps[17].id));
    t("X ≠ X' : même repos + MÊME 1er code mais jour 3 DIFFÉRENT → équipes SÉPARÉES", () => th(emps[14].id) !== th(emps[16].id));
    t("MIROIR détecté X ↔ X' (dispatch jour 3)", () => mir[th(emps[14].id)] === th(emps[16].id) && mir[th(emps[16].id)] === th(emps[14].id));
    return res;
  });

  if (out.error) { console.log('❌ ' + out.error); await browser.close(); process.exit(1); }
  let pass = 0, fail = 0;
  out.tests.forEach(t => { if (t.ok) { console.log('  ✅ ' + t.label); pass++; } else { console.log('  ❌ ' + t.label + ' — ' + t.error); fail++; } });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ RÈGLE ÉQUIPES (repos + miroir horaire) OK' : '❌ RÈGLE ÉQUIPES KO');
  console.log('PASS: ' + pass + ' · FAIL: ' + fail);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
