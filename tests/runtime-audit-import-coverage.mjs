// runtime-audit-import-coverage.mjs
// ─────────────────────────────────────────────────────────────────────────
// AUDIT COUVERTURE D'IMPORT — fixture mai 2026 V1 full (vrai PDF Kevin).
//
// Mesure honnête de ce que l'app détecte vs le PDF source réel :
//   • % d'employés actifs reçoivent un teamHistory pour le mois
//   • Nombre d'équipes créées (cible : ~22 selon NOTES_USER vérité terrain)
//   • Liste des employés "perdus" (sans teamHistory) avec cause si dispo
//   • Lignes en erreur (importSkipped)
//
// Aucune modification du parser. Diagnostic uniquement.
// Mode INFORMATIONAL (exit 0) tant qu'aucune régression majeure (<85%).
//
// Lancement : PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npm run test:coverage
// ─────────────────────────────────────────────────────────────────────────
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await ctx.newPage();
  await page.goto('file://' + resolve(ROOT, 'index.html'),
    { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(
    () => typeof window.A === 'object' && Array.isArray(window.A.employees) && typeof window.doImport === 'function',
    { timeout: 20000 });

  const fixturePath = resolve(ROOT, 'tests/fixtures/mai-2026-v1-real.txt');
  const txt = fs.readFileSync(fixturePath, 'utf8');

  const result = await page.evaluate((txt) => {
    window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };
    const key = '2026-4';
    if (!window.A.overrides) window.A.overrides = {};
    window.A.overrides[key] = {};
    // Reset teamHistory pour mesure propre
    window.A.employees.forEach(e => {
      if (e.teamHistory) e.teamHistory[key] = undefined;
      if (e.familyHistory) e.familyHistory[key] = undefined;
    });

    let ta = document.getElementById('impTxt');
    if (!ta) { ta = document.createElement('textarea'); ta.id = 'impTxt'; document.body.appendChild(ta); }
    ta.value = txt;
    [['impY', '2026'], ['impM', '4']].forEach(([id, v]) => {
      let e = document.getElementById(id);
      if (!e) { e = document.createElement('input'); e.id = id; document.body.appendChild(e); }
      e.value = v;
    });
    window._lastImportText = txt;
    try { window.doImport(); } catch (e) { return { fatal: 'doImport: ' + e.message }; }

    const ov = window.A.overrides[key] || {};
    const active = window.A.employees.filter(e => typeof window.isEmpActive === 'function'
      ? window.isEmpActive(e, 2026, 4) : (e.active !== false));

    const stats = {
      activeEmps: active.length,
      empsWithCodes: 0,
      empsWithTeam: 0,
      cadresWithoutSchedule: 0,
      cadresTotal: 0,
      amenageAssigned: 0,
      lostEmps: [],   // emps avec cellules mais sans teamHistory
      teamsSet: new Set(),
      teamsByFamily: { bj: new Set(), roulettes: new Set(), cmc: new Set(), cadres: new Set(), amenage: new Set() },
    };

    active.forEach(e => {
      const row = ov[e.id] || {};
      const cells = Object.keys(row).filter(d => row[d]).length;
      const isCadre = (e.family || '') === 'cadres';
      if (isCadre) stats.cadresTotal++;
      if (cells > 0) stats.empsWithCodes++;
      if (isCadre && cells === 0) stats.cadresWithoutSchedule++;

      const t = e.teamHistory && e.teamHistory[key];
      if (t) {
        stats.empsWithTeam++;
        stats.teamsSet.add(t);
        if (t === 'amenage') stats.amenageAssigned++;
        const fam = (e.familyHistory && e.familyHistory[key]) || e.family || 'unknown';
        if (stats.teamsByFamily[fam]) stats.teamsByFamily[fam].add(t);
      } else if (!isCadre && cells > 0) {
        // emp avec cellules mais sans équipe = perdu
        stats.lostEmps.push({ name: e.name, id: e.id, cells, family: e.family });
      }
    });

    const out = {
      ...stats,
      teamsTotal: stats.teamsSet.size,
      teamsByFamily: {
        bj: stats.teamsByFamily.bj.size,
        roulettes: stats.teamsByFamily.roulettes.size,
        cmc: stats.teamsByFamily.cmc.size,
        cadres: stats.teamsByFamily.cadres.size,
        amenage: stats.teamsByFamily.amenage.size,
      },
      teamsList: [...stats.teamsSet].sort(),
      importSkipped: window._importSkipped || 0,
      importType: (window.lg && (window.lg('cmc_last_import_type_' + key, null) || {}).type) || null,
    };
    delete out.teamsSet;
    return out;
  }, txt);

  console.log('\n=== AUDIT COUVERTURE IMPORT — mai 2026 V1 full ===');
  if (result.fatal) { console.error('FATAL:', result.fatal); await browser.close(); process.exit(2); }

  console.log(`Import type             : ${result.importType}`);
  console.log(`Employés actifs         : ${result.activeEmps}`);
  console.log(`Employés avec codes     : ${result.empsWithCodes} (${(result.empsWithCodes / result.activeEmps * 100).toFixed(1)}%)`);
  console.log(`Employés avec équipe    : ${result.empsWithTeam} (${(result.empsWithTeam / result.activeEmps * 100).toFixed(1)}%)`);
  console.log(`Cadres sans horaire     : ${result.cadresWithoutSchedule}/${result.cadresTotal} (normal pour V1)`);
  console.log(`Aménage assignés        : ${result.amenageAssigned} (cible : 2 — BLANZIERI K + ACCOMASSO F)`);
  console.log(`Lignes en erreur        : ${result.importSkipped}`);
  console.log('');
  console.log(`Équipes totales         : ${result.teamsTotal} (cible NOTES_USER : ~22)`);
  console.log(`  • BJ        : ${result.teamsByFamily.bj}`);
  console.log(`  • Roulettes : ${result.teamsByFamily.roulettes}`);
  console.log(`  • CMC       : ${result.teamsByFamily.cmc}`);
  console.log(`  • Cadres    : ${result.teamsByFamily.cadres}`);
  console.log(`  • Aménage   : ${result.teamsByFamily.amenage}`);

  if (result.lostEmps.length) {
    console.log(`\n--- ${result.lostEmps.length} emp(s) avec cellules mais SANS équipe (invisibles dans "Ma section") ---`);
    result.lostEmps.slice(0, 30).forEach(e => {
      console.log(`  ✗ ${e.name.padEnd(28)} (${e.id}, fam=${e.family}, ${e.cells} cellules)`);
    });
    if (result.lostEmps.length > 30) console.log(`  ... +${result.lostEmps.length - 30} autres`);
  }

  const coverage = result.empsWithTeam / result.activeEmps;
  const coverageOnCoded = result.empsWithCodes > 0 ? result.empsWithTeam / result.empsWithCodes : 0;
  console.log('\n========================================');
  console.log(`📊 Couverture équipes (vs actifs) : ${(coverage * 100).toFixed(1)}%`);
  console.log(`📊 Couverture équipes (vs codés) : ${(coverageOnCoded * 100).toFixed(1)}%`);
  console.log('');
  console.log('⚠ Règle Kevin v9.734 : AUCUNE invention, reproduction EXACTE du PDF.');
  console.log('   Les emps non assignés explicitement par le PDF source restent sans');
  console.log('   équipe (section "❔ Pas de planning"). C\'est CONFORME à la règle,');
  console.log('   pas un défaut à compenser par inférence/rescue.');
  if (coverage >= 0.82) {
    console.log('✅ Couverture stable (≥82% baseline v9.734 post-revert rescue)');
  } else {
    console.log('❌ Régression majeure (<82%) — vérifier le parser pdf-column');
  }
  console.log('========================================');
  await browser.close();
  // Exit 0 sauf régression majeure (sans rescue/invention)
  process.exit(coverage >= 0.82 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
