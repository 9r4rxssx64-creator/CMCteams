/* GARDE-FOU — un fond d'écran invalide ne doit plus produire de CSS cassé (Kevin 2026-08-07).
 *
 * Vu EN VRAI (vérif réelle connectée, run 31129784556, surface CMCteams) : le navigateur
 * demandait `https://cmcteams.kd-mc.com/%22/%22` → 404. Cause : une valeur de fond valant
 * la chaîne `"/"` donnait `url(""/"")`, du CSS malformé que le navigateur relit comme une
 * adresse. Correctif : `_bgUrlOk()` — on ne pose un fond QUE si la valeur ressemble à une
 * vraie image ; sinon aucun fond (dégradation propre), jamais de CSS cassé.
 *
 * node tests/bg-url-guard.test.mjs
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');

let pass = 0;
const fails = [];
const ok = (c, m) => (c ? pass++ : fails.push(m));

/* 1. Le garde existe et les 3 poses de fond l'utilisent (sinon le bug revient par la fenêtre). */
ok(/function _bgUrlOk\(/.test(html), '_bgUrlOk() est défini');
for (const [nom, motif] of [
  ['login', /if\(_bgUrlOk\(ph\.loginBg\)\)/],
  ['accueil', /if\(_bgUrlOk\(_bgUrl\)\)/],
  ['planning', /if\(_bgUrlOk\(_planBg\)\)/],
]) ok(motif.test(html), `le fond « ${nom} » passe par _bgUrlOk`);

/* 2. Le comportement lui-même, exécuté (pas juste lu). */
const src = (html.match(/function _bgUrlOk\(u\)\{[\s\S]*?\}\n/) || [''])[0];
ok(src.length > 50, 'la fonction a bien été extraite pour être exécutée');
// eslint-disable-next-line no-new-func
const _bgUrlOk = new Function(src + '; return _bgUrlOk;')();

/* Le cas exact vu en production, plus les variantes qui cassent le CSS. */
for (const mauvais of ['"/"', '/', '', null, undefined, '  ', 'url("x")', "a'b", 'a(b)', 'a\\b', 'x'])
  ok(_bgUrlOk(mauvais) === false, `refusé : ${JSON.stringify(mauvais)}`);

/* Les vraies images doivent continuer de passer — sinon on casse les fonds de Kevin. */
for (const bon of [
  'data:image/png;base64,iVBORw0KGgo=',
  'data:image/jpeg;base64,/9j/4AAQ',
  'blob:https://cmcteams.kd-mc.com/1234-5678',
  'https://cmcteams.kd-mc.com/fond.jpg',
  'http://exemple.test/f.png',
  '/assets/fond.jpg',
  '  /assets/fond.jpg  ',
]) ok(_bgUrlOk(bon) === true, `accepté : ${bon}`);

console.log(`Fonds d'écran : ${pass} vérifications OK, ${fails.length} échec(s)`);
fails.forEach((f) => console.log('  ✗ ' + f));
process.exit(fails.length ? 1 : 0);
