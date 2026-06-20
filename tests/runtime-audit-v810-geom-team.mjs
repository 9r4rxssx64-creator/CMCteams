// v9.810 runtime test — DÉTECTION ÉQUIPES PAR GÉOMÉTRIE (position dans le PDF).
//
// Bug réel Kevin (import JUILLET 2026) : « BJ Éq.3 = 10 personnes mais devrait
// être ~6 ». Les personnes en trop (GARRO S, FAUTRIER M) ont une rotation
// journalière IDENTIQUE à l'équipe de l'admin sur chaque jour co-travaillé →
// AUCUN algo basé sur l'horaire (rest-pattern OU union-find codes journaliers)
// ne peut les séparer. Dans le PDF source, ils sont dans un BLOC PHYSIQUE
// DIFFÉRENT : il y a DEUX blocs "22/6c" séparés dans la section "Chefs black
// Jack", avec un bloc "20/5c" entre eux. Seule la POSITION verticale les sépare.
//
// Scénario synthétique : on construit un window._cmcPdfGeometry reproduisant la
// structure réelle. Ordre vertical (une équipe = UN bloc contigu CROSS-FAMILLE,
// séparé du suivant par un TRAIT NOIR / ligne vide = gros écart vertical) :
//   [blocA : 6 emps dont "DESARZENS K" — 2 roulettes + 2 cmc + 2 bj MÉLANGÉS]
//   [—— trait noir ——]
//   [blocB : 5 emps]
//   [—— trait noir ——]
//   [blocC : 2 emps dont "GARRO S", rotation IDENTIQUE à blocA]
// blocA et blocC ont des repos+rotation IDENTIQUES (un algo horaire les fusionnerait) ;
// seul l'ÉCART VERTICAL (position) les sépare.
//
// Assertions :
//   (1) _cmcDetectTeamsByGeometry retourne ≥2 équipes.
//   (2) DESARZENS et GARRO finissent dans des teamHistory ids DIFFÉRENTS (séparés
//       purement par la position).
//   (3) Les 6 de blocA partagent un id ; les 2 de blocC partagent un autre id.
//   (4) Après "boot" (geometry effacée + teamHistory wipé + _cmcApplyGeomTeams +
//       détecteurs d'horaire), la séparation PERSISTE.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('\n=== Test runtime v9.810 — split équipes par GÉOMÉTRIE (position PDF) ===\n');
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 375, height: 812 } })).newPage();
  await page.goto('file://' + resolve(__dirname, '../index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.A === 'object'
    && typeof window._cmcDetectTeamsByGeometry === 'function'
    && typeof window._cmcApplyGeomTeams === 'function'
    && typeof window._cmcDetectTeamsByDailyCodes === 'function'
    && typeof window._cmcDetectTeamsByRestPattern === 'function'
    && typeof window._cmcTeamLockReset === 'function'
    && typeof window.TextParser === 'object'
    && typeof window.TextParser.groupItemsByLine === 'function', { timeout: 20000 });
  await page.evaluate(() => { window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' }; });

  const out = await page.evaluate(() => {
    const res = { tests: [] };
    const t = (label, fn) => { try { const ok = fn(); res.tests.push({ label, ok: ok === true, error: ok === true ? null : ('got ' + JSON.stringify(ok)) }); } catch (e) { res.tests.push({ label, ok: false, error: e.message }); } };
    const key = '2026-6'; window.A.year = 2026; window.A.month = 6; // juillet (index 6) 31 jours
    window.A.overrides = window.A.overrides || {}; window.A.overrides[key] = {};
    window.A.employees.forEach(e => { if (e.teamHistory) delete e.teamHistory[key]; if (e.familyHistory) delete e.familyHistory[key]; });
    try { localStorage.removeItem('cmc_team_mirror_' + key); } catch (_) {}
    try { localStorage.removeItem('cmc_geom_teams'); } catch (_) {}
    window._cmcTeamLockReset(key);

    // --- Rotation A (blocA + blocC, IDENTIQUE) et rotation B (blocB), tous chefs BJ (suffixe c)
    const restRH = [6, 13, 20, 27];
    const restR = [7, 14, 21, 28];
    const isRH = d => restRH.indexOf(d) >= 0;
    const isR = d => restR.indexOf(d) >= 0;
    function workA(d) { if (d === 1) return '22/6c'; const arr = ['19/4c', '16/22c', '14/19c', '22/6c', '16/3c']; return arr[d % arr.length]; }
    function workB(d) { if (d === 1) return '20/5c'; const arr = ['18/3c', '12/17c', '10/15c', '20/5c', '15/2c']; return arr[d % arr.length]; }
    function sched(work) {
      const o = {};
      for (let d = 1; d <= 31; d++) { if (isRH(d)) o[d] = 'RH'; else if (isR(d)) o[d] = 'R'; else o[d] = work(d); }
      return o;
    }
    // Pick 13 employees, force family bj via familyHistory (chefs black jack section)
    const emps = window.A.employees.filter(e => (e.family || '') !== 'cadres').slice(0, 13);
    if (emps.length < 13) return { error: 'not enough emps (' + emps.length + ')' };
    const ov = window.A.overrides[key];
    const setFam = (e, fam) => { if (!e.familyHistory) e.familyHistory = {}; e.familyHistory[key] = fam; };
    // blocA : emps 0..5 (rotation A) — inclut "DESARZENS" (emp 0). CROSS-FAMILLE :
    //   2 roulettes + 2 cmc + 2 bj dans le MÊME bloc contigu (règle Kevin).
    const blocA = emps.slice(0, 6);
    const blocB = emps.slice(6, 11);
    const blocC = emps.slice(11, 13); // inclut "GARRO" (emp 11), rotation A À NOUVEAU
    const famA = ['roulettes', 'roulettes', 'cmc', 'cmc', 'bj', 'bj'];
    blocA.forEach((e, i) => { ov[e.id] = sched(workA); setFam(e, famA[i]); });
    blocB.forEach(e => { ov[e.id] = sched(workB); setFam(e, 'bj'); });
    blocC.forEach(e => { ov[e.id] = sched(workA); setFam(e, 'bj'); }); // MÊME rotation que blocA

    // --- Construire window._cmcPdfGeometry : 1 page, items {str,x,y,w,h}.
    //     Une LIGNE par emp (même y pour tous les items de la ligne), y DÉCROISSANT
    //     du haut vers le bas (groupItemsByLine trie y décroissant). Chaque ligne =
    //     code-poste BRTPECK + NOM + initiale + 31 codes (pour que parseLineForEmployee
    //     extraie le nom). On utilise les VRAIS noms des emps.
    const items = [];
    let y = 700; // haut de page → on décrémente
    function addEmpLine(emp, row) {
      // name string sans codes-poste parasites : on met juste le nom propre.
      // parseLineForEmployee attend "SURNAME Init ...codes". emp.name est déjà "SURNAME Init".
      const lineY = y;
      let x = 10;
      const nameParts = String(emp.name).trim().split(/\s+/);
      nameParts.forEach(p => { items.push({ str: p, x: x, y: lineY, w: 8, h: 6 }); x += 30; });
      for (let d = 1; d <= 31; d++) { items.push({ str: row[String(d)] || '', x: x, y: lineY, w: 8, h: 6 }); x += 14; }
      y -= 12; // ligne suivante plus bas
    }
    // Section header (n'est pas un emp — ignoré par parseLineForEmployee)
    items.push({ str: 'Chefs', x: 10, y: y, w: 8, h: 6 }); items.push({ str: 'black', x: 50, y: y, w: 8, h: 6 }); items.push({ str: 'Jack', x: 90, y: y, w: 8, h: 6 }); y -= 12;
    // ORDRE VERTICAL = blocA puis blocB puis blocC
    blocA.forEach(e => addEmpLine(e, ov[e.id]));
    y -= 40; // TRAIT NOIR / ligne vide entre équipes (gros écart vertical, pitch=12)
    blocB.forEach(e => addEmpLine(e, ov[e.id]));
    y -= 40; // TRAIT NOIR entre blocB et blocC
    blocC.forEach(e => addEmpLine(e, ov[e.id]));
    window._cmcPdfGeometry = { pages: [{ pageNum: 1, items: items }], textRaw: '', ts: Date.now() };

    // === IMPORT : géométrie (autorité position, verrouille+persiste) PUIS horaire ===
    const rGeom = window._cmcDetectTeamsByGeometry(2026, 6);
    const rDC = window._cmcDetectTeamsByDailyCodes(2026, 6);
    const rRP = window._cmcDetectTeamsByRestPattern(2026, 6);

    const th = id => { const e = window.A.employees.find(x => x.id === id); return e && e.teamHistory && e.teamHistory[key]; };
    const teamDES = th(blocA[0].id); // "DESARZENS"
    const teamGAR = th(blocC[0].id); // "GARRO"

    res._diag = {
      geom: rGeom, teamDES, teamGAR,
      blocA_ids: blocA.map(e => th(e.id)),
      blocC_ids: blocC.map(e => th(e.id)),
      matched_names_sample: blocA[0].name + ' / ' + blocC[0].name
    };

    t('(1) _cmcDetectTeamsByGeometry a clusterisé ≥2 équipes', () => !!rGeom && rGeom.ok === true && rGeom.teams >= 2);
    t('(2) DESARZENS (blocA) a une équipe', () => !!teamDES);
    t('(2) GARRO (blocC) a une équipe', () => !!teamGAR);
    t('(2) DESARZENS ≠ GARRO — séparés par POSITION malgré rotation identique', () => !!teamDES && !!teamGAR && teamDES !== teamGAR);
    t('(3) blocA : les 6 partagent le MÊME id', () => blocA.every(e => th(e.id) === teamDES) && teamDES != null);
    t('(3) blocC : les 2 partagent le MÊME id', () => blocC.every(e => th(e.id) === teamGAR) && teamGAR != null);
    const fh = id => { const e = window.A.employees.find(x => x.id === id); return e && e.familyHistory && e.familyHistory[key]; };
    t('(3b) blocA est CROSS-FAMILLE (≥2 familles) mais MÊME équipe', () => { const distinct = Array.from(new Set(blocA.map(e => fh(e.id)))).filter(Boolean); return distinct.length >= 2 && blocA.every(e => th(e.id) === teamDES); });

    // === SIMULER UN BOOT : géométrie absente, teamHistory wipé, ré-appliquer ===
    window._cmcPdfGeometry = null; // boot : pas de géométrie
    window.A.employees.forEach(e => { if (e.teamHistory) delete e.teamHistory[key]; }); // boot wipe teamHistory
    // familyHistory PRÉSERVÉE (comme en prod). cmc_geom_teams PRÉSERVÉ (jamais wipé).
    window._cmcTeamLockReset(key);
    const rApply = window._cmcApplyGeomTeams(2026, 6); // auto-pin
    window._cmcDetectTeamsByDailyCodes(2026, 6);
    window._cmcDetectTeamsByRestPattern(2026, 6);

    const teamDES2 = th(blocA[0].id);
    const teamGAR2 = th(blocC[0].id);
    res._diag.afterBoot = { rApply, teamDES2, teamGAR2 };

    t('(4) après BOOT : _cmcApplyGeomTeams a ré-appliqué ≥8 emps', () => !!rApply && rApply.ok === true && rApply.applied >= 8);
    t('(4) après BOOT : DESARZENS et GARRO TOUJOURS séparés (persistance auto-pin)', () => !!teamDES2 && !!teamGAR2 && teamDES2 !== teamGAR2);
    t('(4) après BOOT : blocA toujours groupé', () => blocA.every(e => th(e.id) === teamDES2));
    t('(4) après BOOT : blocC toujours groupé', () => blocC.every(e => th(e.id) === teamGAR2));

    // === BACKWARD-COMPAT : pas de géométrie + pas de cmc_geom_teams → no-op ===
    const key2 = '2026-7'; // août, vierge
    window.A.overrides[key2] = {};
    window._cmcPdfGeometry = null;
    const rNoGeo = window._cmcDetectTeamsByGeometry(2026, 7);
    t('(5) backward-compat : sans géométrie ni record → no-op (ok:false)', () => !!rNoGeo && rNoGeo.ok === false);

    return res;
  });

  if (out.error) { console.log('❌ ' + out.error); await browser.close(); process.exit(1); }
  if (out._diag) console.log('  diag:', JSON.stringify(out._diag));
  let pass = 0, fail = 0;
  out.tests.forEach(tt => { if (tt.ok) { console.log('  ✅ ' + tt.label); pass++; } else { console.log('  ❌ ' + tt.label + ' — ' + tt.error); fail++; } });
  console.log('\n========================================');
  console.log(fail === 0 ? '✅ SPLIT ÉQUIPES PAR GÉOMÉTRIE OK' : '❌ SPLIT ÉQUIPES PAR GÉOMÉTRIE KO');
  console.log('PASS: ' + pass + ' · FAIL: ' + fail);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
