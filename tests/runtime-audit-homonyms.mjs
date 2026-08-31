// runtime-audit-homonyms.mjs
// ─────────────────────────────────────────────────────────────────────────
// AUDIT RÉGRESSION HOMONYMES — règle Kevin v9.658 + erreurs #38 et #44 (CLAUDE.md).
//
// Vérifie qu'à l'import d'un PDF V1 (employés+chefs), les fiches cadres
// homonymes (Pit Boss) NE REÇOIVENT PAS d'horaire à la place de leur frère
// employé. Cas connus :
//   - LANDAU B (chef BJ, U00062) ≠ LANDAU J (Pit Boss cadre, P00003)
//   - ENZA  B  (chef BJ, U00070) ≠ ENZA  C  (Pit Boss cadre, P00009)
//   - CAMPI PH (chef BJ, U00045) ≠ CAMPI H  (Pit Boss cadre, P00013)
//
// Le bug d'origine (v9.722 et antérieures) collait les codes de LANDAU B sur
// la fiche P00003 LANDAU J par match nom-de-famille seul → cadre avec horaire
// alors que le PDF V1 ne contient AUCUN planning cadre.
//
// Garde-fous mesurés :
//   1. v9.723 (l. 37866) : guard bigram refuse même surname + initiale différente
//   2. v9.723 (l. 37871) : fallback cadres gated par importFamily==="cadres"
//   3. v9.728         : 2 scans rattrapage cadres gated par hasCadres
//
// Diagnostic : mesure, ne corrige rien. Anti-régression pur.
//
// Lancement :  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npm run test:homonyms
// ─────────────────────────────────────────────────────────────────────────
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Fixture synthétique : 3 chefs BJ homonymes de cadres existants.
// Format V1 SBM standard : section "Chefs black Jack" + lignes grille.
// Aucun header PIT BOSS / SUPERVISEUR / INSPECTEUR → _importType="employees".
const FIXTURE = `Roulements du mois de:	mai 2026
Chefs black Jack 3 20/5 du au 3 19/4 du au 4 RH du au
BRTP+E	LANDAU B	1	31	20/5	19/4	RH	R	20/5	19/4	RH	R	20/5	19/4	RH	R	20/5	19/4	RH	R	20/5	19/4	RH	R	20/5	19/4	RH	R	20/5	19/4	RH	R
BRTP+E	ENZA B	1	31	19/4	20/5	RH	R	19/4	20/5	RH	R	19/4	20/5	RH	R	19/4	20/5	RH	R	19/4	20/5	RH	R	19/4	20/5	RH	R	19/4	20/5	RH	R
BRTP+E	CAMPI PH	1	31	16/3	20/5	RH	R	16/3	20/5	RH	R	16/3	20/5	RH	R	16/3	20/5	RH	R	16/3	20/5	RH	R	16/3	20/5	RH	R	16/3	20/5	RH	R
`;

const TARGETS = [
  { chefId: 'U00062', chefName: 'LANDAU B',  cadreId: 'P00003', cadreName: 'LANDAU J' },
  { chefId: 'U00070', chefName: 'ENZA B',    cadreId: 'P00009', cadreName: 'ENZA C' },
  { chefId: 'U00045', chefName: 'CAMPI PH', cadreId: 'P00013', cadreName: 'CAMPI H' },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await ctx.newPage();
  await page.goto('file://' + resolve(ROOT, 'index.html'),
    { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(
    () => typeof window.A === 'object' && Array.isArray(window.A.employees) && typeof window.doImport === 'function',
    { timeout: 20000 });

  const result = await page.evaluate(({ txt, targets }) => {
    window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };

    // Sanity : les 6 fiches doivent exister dans le roster DEF_EMP
    const presence = targets.map(t => ({
      chef: !!window.A.employees.find(e => e.id === t.chefId),
      cadre: !!window.A.employees.find(e => e.id === t.cadreId),
      ...t
    }));
    if (presence.some(p => !p.chef || !p.cadre)) {
      return { fatal: 'roster_missing', presence };
    }

    // Wipe overrides du mois cible pour partir propre
    if (!window.A.overrides) window.A.overrides = {};
    window.A.overrides['2026-4'] = {};

    // Import via le flux réel
    let ta = document.getElementById('impTxt');
    if (!ta) { ta = document.createElement('textarea'); ta.id = 'impTxt'; document.body.appendChild(ta); }
    ta.value = txt;
    [['impY', '2026'], ['impM', '4']].forEach(([id, v]) => {
      let e = document.getElementById(id);
      if (!e) { e = document.createElement('input'); e.id = id; document.body.appendChild(e); }
      e.value = v;
    });
    window._lastImportText = txt;
    try { window.doImport(); } catch (e) { return { fatal: 'doImport_throw: ' + e.message }; }

    const ov = (window.A.overrides && window.A.overrides['2026-4']) || {};
    const importType = (window.lg && window.lg('cmc_last_import_type_2026-4', null)) || null;

    const rows = targets.map(t => {
      const chefRow = ov[t.chefId] || {};
      const cadreRow = ov[t.cadreId] || {};
      const chefDays = Object.keys(chefRow).filter(d => chefRow[d]).length;
      const cadreDays = Object.keys(cadreRow).filter(d => cadreRow[d]).length;
      return {
        chefId: t.chefId, chefName: t.chefName, chefDays,
        cadreId: t.cadreId, cadreName: t.cadreName, cadreDays,
        chefSample: [1, 2, 3, 4, 5].map(d => chefRow[d] || '·').join('|'),
        cadreSample: [1, 2, 3, 4, 5].map(d => cadreRow[d] || '·').join('|'),
      };
    });

    return { importType, rows };
  }, { txt: FIXTURE, targets: TARGETS });

  console.log('\n=== AUDIT RÉGRESSION HOMONYMES — V1 chefs+employés ===');
  if (result.fatal) {
    console.error('FATAL:', result.fatal);
    if (result.presence) {
      result.presence.forEach(p => {
        if (!p.chef) console.error('  ✗ chef manquant:', p.chefId, p.chefName);
        if (!p.cadre) console.error('  ✗ cadre manquant:', p.cadreId, p.cadreName);
      });
    }
    await browser.close();
    process.exit(2);
  }

  console.log('Import type détecté :', result.importType && result.importType.type);
  console.log('');

  let fail = 0;
  result.rows.forEach(r => {
    const chefOk = r.chefDays > 0;       // chef DOIT recevoir des codes
    const cadreOk = r.cadreDays === 0;   // cadre NE DOIT PAS recevoir d'horaire
    const ok = chefOk && cadreOk;
    if (!ok) fail++;
    console.log(`${ok ? '✅' : '❌'}  ${r.chefName} (chef ${r.chefId}) → ${r.chefDays} jours [${r.chefSample}]`);
    console.log(`     ${r.cadreName} (cadre ${r.cadreId}) → ${r.cadreDays} jours [${r.cadreSample}]`);
    if (!chefOk) console.log(`     ⚠ chef sans horaire — match nom-import a échoué`);
    if (!cadreOk) console.log(`     ⚠ cadre contaminé — confusion homonyme (régression v9.723/728)`);
  });

  // Sanity import type
  const expectedType = 'employees';
  const actualType = result.importType && result.importType.type;
  if (actualType !== expectedType) {
    console.log(`⚠ Import type attendu "${expectedType}", reçu "${actualType}" — fixture mal détectée`);
    fail++;
  }

  console.log('\n========================================');
  console.log(fail === 0
    ? `✅ ${result.rows.length}/${result.rows.length} homonymes correctement séparés`
    : `❌ ${fail} régression(s) détectée(s)`);
  console.log('========================================');
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL:', e); process.exit(2); });
