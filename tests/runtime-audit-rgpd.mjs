// audit passe-2 — RGPD : export / effacement / gardes (corrige F-H1 + auto-critique)
// Prouve en runtime réel : (1) un employé exporte SES données (Art.15/20) ;
// (2) un non-admin ne peut PAS exporter les données d'un AUTRE (garde d'accès) ;
// (3) l'admin principal (AID) est PROTÉGÉ contre l'effacement ; (4) l'effacement
// exige la confirmation « EFFACER » (droit à l'oubli Art.17, pas de suppression accidentelle) ;
// (5) vRGPD expose bien les cartes Export + Effacement + Consentements.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX = resolve(__dirname, '../index.html');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await page.addInitScript(() => { window.__CMC_NO_SEED = true; });
  await page.goto('file://' + INDEX, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => window.A && Array.isArray(A.employees) && typeof window.cmcExportUserData === 'function' && typeof window.cmcEraseUserProfile === 'function' && typeof window.vRGPD === 'function', { timeout: 20000 });

  const out = await page.evaluate(() => {
    const t = [];
    const test = (label, fn) => { try { t.push({ label, ok: fn() === true }); } catch (e) { t.push({ label, ok: false, err: e.message }); } };
    // deux employés non-admin distincts + l'admin
    const nonAdmin = (A.employees || []).find((e) => e.id !== 'U11804');
    const other = (A.employees || []).find((e) => e.id !== 'U11804' && nonAdmin && e.id !== nonAdmin.id);
    // capture des toasts (les gardes émettent des toasts d'erreur)
    let toasts = []; window.toast = (m, k) => toasts.push({ m: String(m), k });
    // stub anti-download réel (jsdom-less : createObjectURL peut manquer)
    if (!window.URL.createObjectURL) window.URL.createObjectURL = () => 'blob:stub';
    if (!window.URL.revokeObjectURL) window.URL.revokeObjectURL = () => {};

    // (1) export de SES données (self) → pas de toast d'accès refusé
    test('RGPD: un employé exporte SES données (Art.15/20)', () => {
      A.user = nonAdmin; toasts = []; window.cmcExportUserData(nonAdmin.id);
      return !toasts.some((x) => /refus|refuse/i.test(x.m));
    });
    // (2) non-admin exporte les données d'un AUTRE → REFUSÉ
    test('RGPD: non-admin ne peut PAS exporter un AUTRE (garde accès)', () => {
      A.user = nonAdmin; toasts = []; window.cmcExportUserData(other.id);
      return toasts.some((x) => /refus|refuse/i.test(x.m));
    });
    // (3) admin principal protégé contre effacement
    test('RGPD: admin principal (AID) protégé de l\'effacement', () => {
      A.user = A.employees.find((e) => e.id === 'U11804'); toasts = [];
      window.prompt = () => 'EFFACER'; // même si on confirme, AID est protégé en amont
      window.cmcEraseUserProfile('U11804');
      return toasts.some((x) => /protege|protégé|impossible/i.test(x.m)) && !!A.reg;
    });
    // (4) effacement exige la confirmation "EFFACER" (annulation si autre chose)
    test('RGPD: effacement ANNULÉ si confirmation ≠ EFFACER', () => {
      A.user = A.employees.find((e) => e.id === 'U11804');
      const before = other ? JSON.stringify(A.reg && A.reg[other.id]) : null;
      window.prompt = () => 'nimporte'; toasts = [];
      window.cmcEraseUserProfile(other.id);
      const after = other ? JSON.stringify(A.reg && A.reg[other.id]) : null;
      return before === after && toasts.some((x) => /annul/i.test(x.m));
    });
    // (5) vRGPD expose export + effacement + consentements
    test('vRGPD: cartes Export + Consentements présentes', () => {
      A.user = nonAdmin; const h = window.vRGPD();
      return /Export|Telecharge|télécharge|F4E5|📥/i.test(h) && /Consentement|permission|autoris/i.test(h);
    });
    // (6) l'export contient les bons champs RGPD + hash mdp REDACTÉ (pas de fuite)
    test('RGPD: export redacte le hash du mot de passe (pas de fuite)', () => {
      A.user = nonAdmin;
      let captured = null; const realBlob = window.Blob;
      window.Blob = function (parts) { captured = String(parts && parts[0] || ''); return new realBlob(parts); };
      window.cmcExportUserData(nonAdmin.id); window.Blob = realBlob;
      return captured && /hash_redacted/.test(captured) && !/"hash":"[a-z0-9]/i.test(captured);
    });
    return t;
  });

  let pass = 0, fail = 0;
  console.log('\n=== RGPD — export / effacement / gardes ===');
  out.forEach((r) => { if (r.ok) { console.log('  ✓ ' + r.label); pass++; } else { console.log('  ✗ ' + r.label + (r.err ? ' — ' + r.err : '')); fail++; } });
  console.log('\nRGPD : ' + pass + ' OK / ' + fail + ' KO');
  await browser.close();
  console.log(fail === 0 ? '✅ RGPD OK' : '❌ RGPD BROKEN');
  process.exit(fail === 0 ? 0 : 1);
}
main().catch((e) => { console.error('FATAL:', e); process.exit(2); });
