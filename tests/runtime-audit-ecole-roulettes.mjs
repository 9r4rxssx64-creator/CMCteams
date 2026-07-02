// Régression v9.846/v9.848 — ÉCOLE ROULETTE EUROPE (Kevin 2026-07-01 « dans les employés
// carte, tous ceux avec le fond bleu clair doivent être intégrés dans les équipes roulettes.
// Ce sont des employés qui sortent de l'école roulette Europe » + captures IMG_2957/2958
// « pareil pour les autres avec le fond bleu »).
// Le fond bleu clair = code-poste contenant « KE » (.BRTCP+KE / .BRTCPKE). Prouve
// _cmcApplyEcoleToRoulettes : (1) un employé CARTE (cmc) dont le code-poste contient KE
// passe en famille ROULETTES + teamHistory du mois effacée ; (2) un carte .BRTCPK (K SANS
// E) N'EST PAS déplacé (pas de faux positif) ; (3) un roulettes avec KE (déjà roulettes)
// intouché (garde famille) ; (4) anti-homonyme (initiale) ; (5) tag pixel {{ECOLE}}
// accepté en secondaire ; (6) un code bleu isolé (DELTTRA, aucun employé) ignoré.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newContext().then(c => c.newPage());
  const perr = [];
  page.on('pageerror', e => perr.push(e.message));
  await page.addInitScript(() => { window.__CMC_NO_SEED = true; });
  await page.goto('file://' + resolve(root, 'index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window._cmcApplyEcoleToRoulettes === 'function' && window.A, { timeout: 20000 });

  const r = await page.evaluate(() => {
    const key = '2026-7';
    A.employees = [
      { id: 'E1', name: 'BARILARO A', family: 'cmc', familyHistory: { [key]: 'cmc' }, teamHistory: { [key]: 'c8' } },     // carte .BRTCP+KE → roulettes
      { id: 'E2', name: 'CABALLERO PA', family: 'cmc', familyHistory: { [key]: 'cmc' }, teamHistory: { [key]: 'c3' } },   // carte .BRTCPKE → roulettes
      { id: 'E3', name: 'SONDOORKHAN N', family: 'cmc', familyHistory: { [key]: 'cmc' }, teamHistory: { [key]: 'c3' } },  // carte .BRTCPK (K sans E) → RESTE cmc
      { id: 'E4', name: 'GARINO Y', family: 'roulettes', familyHistory: { [key]: 'roulettes' }, teamHistory: { [key]: 'r2' } }, // déjà roulettes (a KE) → intouché
      { id: 'E5', name: 'SERRA N', family: 'cmc', familyHistory: { [key]: 'cmc' }, teamHistory: { [key]: 'c3' } },        // carte {{ECOLE}} pixel → roulettes
      { id: 'E6', name: 'SERRA X', family: 'cmc', familyHistory: { [key]: 'cmc' }, teamHistory: { [key]: 'c3' } }         // homonyme SERRA autre initiale → NE bouge PAS
    ];
    A.overrides = { [key]: {
      E1: { 1: '20/5', 2: '19/4', 3: 'RH', 4: 'R' }, E2: { 1: '20/5', 2: '19/4', 3: 'RH', 4: 'R' },
      E3: { 1: '20/5', 2: '19/4', 3: 'RH', 4: 'R' }, E4: { 1: '20/5', 2: '19/4', 3: 'RH', 4: 'R' },
      E5: { 1: '20/5', 2: '19/4', 3: 'RH', 4: 'R' }, E6: { 1: '20/5', 2: '19/4', 3: 'RH', 4: 'R' }
    }};
    // source au FORMAT PDF réel : code-poste<TAB>nom<TAB>1<TAB>31…
    const src = [
      '.BRTCP+KE\tBARILARO A\t1\t31',
      '.BRTCPKE\tCABALLERO PA\t1\t31',
      '.BRTCPK\tSONDOORKHAN N\t1\t31',      // K sans E → NE doit PAS matcher
      'BRTP+KE.\tGARINO Y\t1\t31',          // roulettes (garde famille bloque)
      'SERRA N{{ECOLE}}\t20/5\tRH',         // secondaire pixel
      'DELTTRA{{ECOLE}}\t20/5'              // code bleu, aucun employé
    ].join('\n');
    const res = _cmcApplyEcoleToRoulettes(key, src);
    const fam = id => { const e = A.employees.find(x => x.id === id); return e.familyHistory[key]; };
    const team = id => { const e = A.employees.find(x => x.id === id); return e.teamHistory ? (e.teamHistory[key] || null) : null; };
    return { res, e1: [fam('E1'), team('E1')], e2: [fam('E2'), team('E2')], e3: [fam('E3'), team('E3')], e4: [fam('E4'), team('E4')], e5: [fam('E5'), team('E5')], e6: [fam('E6'), team('E6')] };
  });

  console.log('Résultat : ' + JSON.stringify(r.res));
  ok(perr.length === 0, 'aucune erreur page (' + perr.join(' | ') + ')');
  ok(r.res && r.res.moved === 3, '3 employés déplacés (BARILARO, CABALLERO, SERRA ; GARINO bloqué par le garde famille) — moved=' + (r.res && r.res.moved));
  ok(r.e1[0] === 'roulettes' && r.e1[1] === null, 'BARILARO A (.BRTCP+KE) → roulettes + team effacée');
  ok(r.e2[0] === 'roulettes' && r.e2[1] === null, 'CABALLERO PA (.BRTCPKE) → roulettes + team effacée');
  ok(r.e3[0] === 'cmc' && r.e3[1] === 'c3', 'SONDOORKHAN N (.BRTCPK, K sans E) RESTE carte (pas de faux positif KE)');
  ok(r.e4[0] === 'roulettes' && r.e4[1] === 'r2', 'GARINO Y (déjà roulettes, a KE) intouché — garde famille');
  ok(r.e5[0] === 'roulettes' && r.e5[1] === null, 'SERRA N ({{ECOLE}} pixel secondaire) → roulettes');
  ok(r.e6[0] === 'cmc', 'SERRA X (homonyme, autre initiale) NON déplacé (anti-homonyme #38)');
  ok(!(r.res && r.res.names && r.res.names.indexOf('DELTTRA') >= 0), 'DELTTRA (code bleu, aucun employé) ignoré');

  await page.context().close();
} finally { await browser.close(); }

console.log('\nÉCOLE-ROULETTES : ' + pass + ' OK / ' + fail + ' KO');
process.exit(fail ? 1 : 0);
