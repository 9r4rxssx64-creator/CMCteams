// v9.844 — SÉCU P0 (audit externe) : les mots de passe ne sont JAMAIS stockés en clair.
// Le champ .clear était persisté dans cmc_pw (synchronisé Firebase, base ouverte) → fuite.
// Vérifie : (1) définir un mot de passe n'écrit aucun .clear ; (2) le scrub de boot purge
// tout .clear existant + re-pousse cmc_pw nettoyé ; (3) aucun écrivain .clear ne subsiste
// dans le source. Câblé test:ci.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

// 3) source : aucun ",clear:" écrivain, aucun lecteur passwords[...].clear
const src = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
ok(!/,clear:[a-zA-Z_0-9]+/.test(src), 'aucun écrivain de mot de passe en clair (,clear:…) dans le source');
ok(!/passwords\[[^\]]*\]\.clear/.test(src), 'aucun lecteur passwords[…].clear (feature « révéler » retirée)');
ok(/cmc_v844_pw_scrub_done/.test(src), 'scrub de boot présent (cmc_v844_pw_scrub_done)');

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
// Injecte un cmc_pw AVEC des .clear existants AVANT le boot → le scrub doit les purger
await page.addInitScript(() => {
  window.__CMC_NO_SEED = true;
  localStorage.setItem('cmc_pw', JSON.stringify({ U00071: { h: 'abc', clear: 'secret1' }, U00072: { h: 'def', clear: 'secret2' } }));
});
await page.goto('file://' + resolve(__dirname, '../index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForFunction(() => typeof window.A === 'object' && A.passwords, { timeout: 20000 });

// 2) scrub de boot : plus aucun .clear en localStorage
const afterScrub = await page.evaluate(() => {
  const pw = JSON.parse(localStorage.getItem('cmc_pw') || '{}');
  return { hasClear: Object.keys(pw).some(u => pw[u] && ('clear' in pw[u])), hHeld: !!(pw.U00071 && pw.U00071.h), flag: localStorage.getItem('cmc_v844_pw_scrub_done') };
});
ok(!afterScrub.hasClear, 'scrub de boot : plus aucun .clear en localStorage');
ok(afterScrub.hHeld, 'le hash .h est préservé (login intact)');
ok(!!afterScrub.flag, 'flag scrub posé (one-time)');

// 1) définir un mot de passe (admin) n'écrit aucun .clear
const afterSet = await page.evaluate(() => {
  A.user = A.employees.find(e => e.id === 'U11804');
  const emp = A.employees.find(e => e.id !== 'U11804') || A.employees[0];
  if (typeof adminSetPw === 'function') adminSetPw(emp.id, 'nouveauMotDePasse123');
  const e = A.passwords[emp.id] || {};
  return { hasClear: ('clear' in e), hasHash: !!e.h };
});
ok(!afterSet.hasClear, 'adminSetPw n\'écrit AUCUN .clear');
ok(afterSet.hasHash, 'adminSetPw écrit bien le hash .h');

await browser.close();
console.log('\nPW NO-CLEAR : ' + pass + ' OK / ' + fail + ' KO');
process.exit(fail ? 1 : 0);
