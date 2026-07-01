// Régression v9.846 — ÉCOLE ROULETTE EUROPE (Kevin 2026-07-01 « Sur les imports, dans les
// employés carte, tous ceux avec le fond bleu clair doivent être intégrés dans les équipes
// roulettes par rapport au repos. Ce sont des employés qui sortent de l'école roulette Europe
// et s'intègrent dans les équipes. Les enlever des équipes cartes »).
// Prouve _cmcApplyEcoleToRoulettes : un employé CARTE (cmc) marqué fond bleu clair ({{ECOLE}})
// passe en famille ROULETTES + sa teamHistory du mois est effacée (re-team par repos) ; un
// employé bj/roulettes n'est PAS touché ; un tag {{ECOLE}} qui ne correspond à AUCUN employé
// (ex code DELTTRA, faux positif bleu) est ignoré ; anti-homonyme (initiale) respecté.
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
    // 3 employés carte + 1 vrai roulette + 1 chef BJ ; repos alignés sur une "équipe roulette"
    A.employees = [
      { id: 'E1', name: 'SANNA O', family: 'cmc', familyHistory: { [key]: 'cmc' }, teamHistory: { [key]: 'c3' } },   // école → doit passer roulettes
      { id: 'E2', name: 'CABALLERO PA', family: 'cmc', familyHistory: { [key]: 'cmc' }, teamHistory: { [key]: 'c3' } }, // PAS marqué → reste cmc
      { id: 'E3', name: 'MARTIRE D', family: 'roulettes', familyHistory: { [key]: 'roulettes' }, teamHistory: { [key]: 'r2' } }, // déjà roulettes → intouché
      { id: 'E4', name: 'SANNA X', family: 'cmc', familyHistory: { [key]: 'cmc' }, teamHistory: { [key]: 'c3' } }     // homonyme SANNA autre initiale → NE doit PAS bouger
    ];
    A.overrides = { [key]: {
      E1: { 1: '22/6', 2: '19/4', 3: 'RH', 4: 'R' },
      E2: { 1: '20/5', 2: '19/4', 3: 'RH', 4: 'R' },
      E3: { 1: '22/6', 2: '19/4', 3: 'RH', 4: 'R' },
      E4: { 1: '20/5', 2: '19/4', 3: 'RH', 4: 'R' }
    }};
    // source : SANNA O marqué école (bleu clair), + un faux positif DELTTRA (code, aucun emp)
    const src = 'SANNA O{{ECOLE}}\t22/6\tRH\nDELTTRA{{ECOLE}}\t20/5\nCABALLERO PA\t20/5\tRH';
    const res = _cmcApplyEcoleToRoulettes(key, src);
    return {
      res,
      e1fam: A.employees[0].familyHistory[key], e1team: A.employees[0].teamHistory ? (A.employees[0].teamHistory[key] || null) : null,
      e2fam: A.employees[1].familyHistory[key], e2team: A.employees[1].teamHistory[key],
      e3fam: A.employees[2].familyHistory[key], e3team: A.employees[2].teamHistory[key],
      e4fam: A.employees[3].familyHistory[key]
    };
  });

  console.log('Résultat : ' + JSON.stringify(r.res));
  ok(perr.length === 0, 'aucune erreur page (' + perr.join(' | ') + ')');
  ok(r.res && r.res.moved === 1, '1 seul employé déplacé (SANNA O) — ' + (r.res && r.res.moved));
  ok(r.e1fam === 'roulettes', 'SANNA O (carte, bleu clair) → famille roulettes');
  ok(r.e1team === null, 'SANNA O : teamHistory du mois effacée (re-team par repos)');
  ok(r.e2fam === 'cmc' && r.e2team === 'c3', 'CABALLERO PA (non marqué) reste carte + équipe intacte');
  ok(r.e3fam === 'roulettes' && r.e3team === 'r2', 'MARTIRE D (déjà roulettes) intouché');
  ok(r.e4fam === 'cmc', 'SANNA X (homonyme, autre initiale) NON déplacé (anti-homonyme #38)');
  ok(!(r.res && r.res.names && r.res.names.indexOf('DELTTRA') >= 0), 'DELTTRA (code bleu, aucun employé) ignoré');

  await page.context().close();
} finally { await browser.close(); }

console.log('\nÉCOLE-ROULETTES : ' + pass + ' OK / ' + fail + ' KO');
process.exit(fail ? 1 : 0);
