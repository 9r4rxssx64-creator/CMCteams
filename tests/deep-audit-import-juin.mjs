// Deep end-to-end audit on Kevin's REAL JUIN 2026 V1 capture.
// Runs the FULL import pipeline (geometric + validated detector + fallback)
// and reports EVERY anomaly : people in wrong teams, teams in wrong families,
// absence section pollution, mirror broken.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');
const CAPTURE_PATH = resolve(__dirname, '../tools/planning-parser-tester/captures/_decrypted/1779981740200___JUIN_2026_V1.pdf.json');

async function main(){
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  // Surface console errors
  page.on('console', msg => {
    const t = msg.type();
    if(t === 'error' || t === 'warning'){
      console.log('  [BROWSER '+t+']', msg.text().slice(0, 200));
    }
  });
  await page.goto('file://' + INDEX_PATH, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.A === 'object' && Array.isArray(window.A.employees), { timeout: 20000 });

  // Load real capture
  const capture = JSON.parse(readFileSync(CAPTURE_PATH, 'utf-8'));
  const passA = capture.result.passes['0']; // pass A = PDF.js geometry
  const rawText = capture.rawText;

  const out = await page.evaluate(({ pages, rawText }) => {
    const log = [];
    const errors = [];

    function info(msg){ log.push(msg); }

    // 1) Set admin user
    window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };
    const iy = 2026, im = 5, key = iy + '-' + im; // JUIN = month 5 (0-indexed)
    window.A.year = iy;
    window.A.month = im;

    // 2) Inject geometry into window._cmcPdfGeometry (mimics what _doExtractPdfLines does)
    window._cmcPdfGeometry = { pages: pages, textRaw: rawText };
    window._lastImportText = rawText;

    // 3) Initialize overrides
    if(!window.A.overrides) window.A.overrides = {};
    window.A.overrides[key] = {};

    info('=== STEP 1: Apply geometric parse (TextParser.parseFromPdfJs + EncadresParser) ===');
    let geoRes = null;
    try { geoRes = window._cmcApplyGeometricParse(iy, im); }
    catch(e){ errors.push('geoParse err: ' + e.message); }
    info('geometric stats: ' + JSON.stringify(geoRes?.stats || geoRes));

    info('=== STEP 2: PDF column detector ===');
    try { window._cmcDetectTeamsByPdfColumn(rawText, iy, im); }
    catch(e){ errors.push('pdf-column err: ' + e.message); }

    info('=== STEP 3: Validated TeamDetector (T1 lib) ===');
    let valRes = null;
    try { valRes = window._cmcApplyValidatedTeams(iy, im); }
    catch(e){ errors.push('validated err: ' + e.message); }
    info('validated result: ' + JSON.stringify(valRes?.report || valRes));

    info('=== STEP 4: Rest pattern (filet) ===');
    try { window._cmcDetectTeamsByRestPattern(iy, im); } catch(e){}

    info('=== STEP 5: Fallback unassigned (v9.743/744/746/764) ===');
    let fbRes = null;
    try { fbRes = window._cmcFallbackUnassignedTeams(iy, im); }
    catch(e){ errors.push('fallback err: ' + e.message); }
    info('fallback result: ' + JSON.stringify(fbRes));

    // 6) Now ANALYZE the final state
    const ov = window.A.overrides[key];
    const empsWithData = window.A.employees.filter(e => ov[e.id] && Object.keys(ov[e.id]).length > 0);

    info('\n=== FINAL STATE ANALYSIS ===');
    info('Total emps with data: ' + empsWithData.length);

    // Build family-team-emps map from final state
    const teamFamily = {}; // teamId -> {family: count}
    const familyTeams = {}; // family -> teamIds[]
    const emplsByTeam = {}; // teamId -> [emp names]
    const noTeam = [];

    empsWithData.forEach(emp => {
      const t = emp.teamHistory && emp.teamHistory[key];
      const f = (emp.familyHistory && emp.familyHistory[key]) || emp.family || '?';
      if(!t){
        noTeam.push(emp.name + ' (' + f + ')');
        return;
      }
      if(!teamFamily[t]) teamFamily[t] = {};
      teamFamily[t][f] = (teamFamily[t][f] || 0) + 1;
      if(!familyTeams[f]) familyTeams[f] = new Set();
      familyTeams[f].add(t);
      if(!emplsByTeam[t]) emplsByTeam[t] = [];
      emplsByTeam[t].push({ name: emp.name, family: f, hasWork: hasWorkedDay(ov[emp.id]) });
    });

    function hasWorkedDay(row){
      const ABS = {RH:1,R:1,CP:1,M:1,MAL:1,AF:1,AT:1,PAT:1,ABI:1,SS:1,CFL:1,CRH:1,CDP:1,EDC:1,RRT:1,PRT:1,RTP:1,RTR:1,DEPL:1,DEP:1,CL:1,ABS:1,FL:1,HD:1,HC:1};
      for(const d in row){
        const c = row[d]; if(!c) continue;
        const u = String(c).toUpperCase().replace(/[C'"*:]+$/g,"");
        if(!ABS[u]) return true;
      }
      return false;
    }

    // ANOMALY 1: Team with mixed families
    info('\n=== ANOMALIE 1 : ÉQUIPES MULTI-FAMILLES ===');
    const teamsWithMixedFams = [];
    Object.keys(teamFamily).forEach(t => {
      const fams = Object.keys(teamFamily[t]);
      if(fams.length > 1){
        teamsWithMixedFams.push({ team: t, families: teamFamily[t] });
        info('  ✗ Équipe ' + t + ' contient des familles MIXTES: ' + JSON.stringify(teamFamily[t]));
        // List members per family
        const members = emplsByTeam[t] || [];
        const byFam = {};
        members.forEach(m => { (byFam[m.family] = byFam[m.family] || []).push(m.name); });
        Object.keys(byFam).forEach(f => info('       ' + f + ': ' + byFam[f].join(', ')));
      }
    });
    if(!teamsWithMixedFams.length) info('  ✓ Aucune équipe ne mélange 2 familles');

    // ANOMALY 2: Family with weird team IDs (e.g. BJ family with team "r3")
    info('\n=== ANOMALIE 2 : ÉQUIPES DANS LA MAUVAISE FAMILLE (id ↔ family) ===');
    const familyMismatches = [];
    function expectedFamilyFromTeamId(tid){
      if(tid === 'amenage') return 'amenage_or_*';
      if(tid === 'formation' || tid === 'maladie' || tid === 'conges' || tid === 'deplacement') return 'all';
      if(/^r/i.test(tid)) return 'roulettes';
      if(/^c/i.test(tid)) return 'cmc';
      if(/^b/i.test(tid)) return 'baccara';
      if(/^\d+$/.test(tid)) return 'bj';
      return '?';
    }
    Object.keys(emplsByTeam).forEach(t => {
      const expected = expectedFamilyFromTeamId(t);
      if(expected === '?' || expected === 'all' || expected === 'amenage_or_*') return;
      const members = emplsByTeam[t];
      const wrongFam = members.filter(m => m.family !== expected);
      if(wrongFam.length){
        familyMismatches.push({ team: t, expectedFamily: expected, wrongMembers: wrongFam });
        info('  ✗ Équipe ' + t + ' (devrait être famille=' + expected + ') contient:');
        wrongFam.forEach(m => info('       ' + m.name + ' (famille=' + m.family + ')'));
      }
    });
    if(!familyMismatches.length) info('  ✓ Pas de team avec famille incompatible avec son id');

    // ANOMALY 3: Absence section pollution
    info('\n=== ANOMALIE 3 : SECTIONS ABSENCE POLLUÉES ===');
    const absTeams = ['formation','maladie','conges','deplacement','amenage'];
    const ABS = {RH:1,R:1,CP:1,M:1,MAL:1,AF:1,AT:1,PAT:1,ABI:1,SS:1,CFL:1,CRH:1,CDP:1,EDC:1,RRT:1,PRT:1,RTP:1,RTR:1,DEPL:1,DEP:1,CL:1,ABS:1,FL:1,HD:1,HC:1};
    const absPolluted = [];
    absTeams.forEach(at => {
      const members = emplsByTeam[at] || [];
      if(!members.length) return;
      info('  → Section ' + at + ' = ' + members.length + ' emps');
      // Find emps with WORK days (not just absence)
      members.forEach(m => {
        const empObj = window.A.employees.find(e => e.name === m.name);
        if(!empObj) return;
        const row = ov[empObj.id] || {};
        const workCount = Object.keys(row).filter(d => {
          const c = row[d]; if(!c) return false;
          const u = String(c).toUpperCase().replace(/[C'"*:]+$/g,"");
          return !ABS[u];
        }).length;
        if(workCount >= 5){
          absPolluted.push({ section: at, name: m.name, workDays: workCount });
          info('    ✗ ' + m.name + ' a ' + workCount + ' jours TRAVAILLÉS — ne devrait pas être en ' + at);
        }
      });
    });
    if(!absPolluted.length) info('  ✓ Sections absence : aucune pollution (uniquement vrais absents)');

    // ANOMALY 4: Mirror
    info('\n=== ANOMALIE 4 : MIROIR ===');
    let mirrors = {};
    try { mirrors = JSON.parse(localStorage.getItem('cmc_team_mirror_' + key) || '{}'); } catch(_){}
    info('  Miroirs enregistrés: ' + JSON.stringify(mirrors));
    const mirrorIssues = [];
    Object.keys(mirrors).forEach(a => {
      const b = mirrors[a];
      // Both teams should exist
      const aMembers = emplsByTeam[a] || [];
      const bMembers = emplsByTeam[b] || [];
      if(!aMembers.length){ mirrorIssues.push('  ✗ Miroir ' + a + ' ↔ ' + b + ' : équipe ' + a + ' VIDE'); return; }
      if(!bMembers.length){ mirrorIssues.push('  ✗ Miroir ' + a + ' ↔ ' + b + ' : équipe ' + b + ' VIDE'); return; }
      // Both should be same family
      const aFam = aMembers[0].family, bFam = bMembers[0].family;
      if(aFam !== bFam){ mirrorIssues.push('  ✗ Miroir ' + a + ' ↔ ' + b + ' : familles DIFFÉRENTES (' + aFam + ' vs ' + bFam + ')'); }
    });
    if(mirrorIssues.length){ mirrorIssues.forEach(m => info(m)); }
    else info('  ✓ Miroirs cohérents (mêmes familles)');

    // ANOMALY 5: Emp data without team
    info('\n=== EMPS AVEC DATA MAIS SANS ÉQUIPE ===');
    info('  Total: ' + noTeam.length);
    if(noTeam.length <= 30) noTeam.forEach(n => info('    • ' + n));
    else { noTeam.slice(0,30).forEach(n => info('    • ' + n)); info('    ... +' + (noTeam.length - 30) + ' autres'); }

    // Summary by family
    info('\n=== RÉSUMÉ PAR FAMILLE ===');
    Object.keys(familyTeams).forEach(f => {
      const tids = Array.from(familyTeams[f]);
      info('  ' + f + ': ' + tids.length + ' équipes [' + tids.sort().join(', ') + ']');
    });

    return {
      log: log.join('\n'),
      errors: errors,
      stats: {
        totalEmpsWithData: empsWithData.length,
        mixedFamilyTeams: teamsWithMixedFams.length,
        wrongFamilyTeams: familyMismatches.length,
        absPolluted: absPolluted.length,
        mirrorIssues: mirrorIssues.length,
        empsWithoutTeam: noTeam.length
      }
    };
  }, { pages: passA.pages, rawText });

  console.log(out.log);
  console.log('\n=== ERRORS ===');
  if(out.errors.length) out.errors.forEach(e => console.log('  ' + e));
  else console.log('  (aucune)');
  console.log('\n=== STATS GLOBALES ===');
  console.log(JSON.stringify(out.stats, null, 2));

  await browser.close();

  // Exit code: 0 if no anomaly, 1 otherwise
  const totalAnomalies = out.stats.mixedFamilyTeams + out.stats.wrongFamilyTeams + out.stats.absPolluted + out.stats.mirrorIssues;
  process.exit(totalAnomalies > 0 ? 1 : 0);
}
main().catch(e => { console.error('FATAL:', e.stack || e); process.exit(2); });
