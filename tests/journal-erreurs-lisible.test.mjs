/* JOURNAL D'ERREURS — il doit dire CE QUI a planté, pas « [undefined] undefined ».
 *
 * Histoire (à ne pas répéter) : `cmc_err_log` est rempli par TROIS écrivains, chacun
 * avec sa propre forme d'entrée —
 *    _logError()      → {ts, type, msg, stack, view}
 *    _cmcUserError()  → {ts, type, technical, userMsg, view}
 *    _cmcSafeCatch()  → {ts, ctx, err}
 * …et les TROIS lecteurs ne lisaient que `.type` / `.msg`. Conséquences mesurées
 * le 6.09.2026 : la page Debug admin et l'outil IA `get_error_log` affichaient
 * « [undefined] undefined » pour deux tiers du journal, et la sentinelle
 * `error-pattern` — celle qui est censée repérer une erreur qui se répète et
 * escalader — groupait sur la chaîne VIDE (« top: '' ×N »), donc elle était
 * AVEUGLE aux erreurs qu'elle surveille. Le test e2e, lui, sortait
 * « 5 erreurs runtime:  |  |  » : un rouge qui ne disait pas pourquoi.
 *
 * Ce garde vérifie que chaque lecteur passe par les normalisateurs
 * `_cmcErrType` / `_cmcErrMsg`, qui savent lire les trois formes.
 *
 * Lancement : npm run test:journal-erreurs
 */
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(resolve(ROOT, 'index.html'), 'utf8');

let ok = 0; const ko = [];
const verifie = (nom, condition, detail) => {
  if (condition) { ok++; console.log('  ✓ ' + nom); }
  else ko.push(nom + (detail ? ' — ' + detail : ''));
};

console.log("== JOURNAL D'ERREURS : lisible quelle que soit la forme d'entrée ==\n");

// 1. Les normalisateurs existent.
verifie('les normalisateurs _cmcErrType / _cmcErrMsg existent',
  /function _cmcErrType\(/.test(src) && /function _cmcErrMsg\(/.test(src));

// 2. Ils couvrent bien les trois formes.
const corpsMsg = (src.match(/function _cmcErrMsg\(e\)\{[^\n]*/) || [''])[0];
for (const champ of ['msg', 'err', 'technical', 'userMsg'])
  verifie('_cmcErrMsg lit le champ « ' + champ + ' »', corpsMsg.includes('e.' + champ),
    'une des trois formes resterait vide à l\'écran');
const corpsType = (src.match(/function _cmcErrType\(e\)\{[^\n]*/) || [''])[0];
verifie('_cmcErrType lit « type » ET « ctx »', corpsType.includes('e.type') && corpsType.includes('e.ctx'));

// 3. Les trois lecteurs passent par eux (aucun n'affiche un champ brut).
verifie('page Debug admin : affiche _cmcErrType/_cmcErrMsg',
  src.includes("esc(_cmcErrType(e))") && src.includes("esc(_cmcErrMsg(e))"),
  'la page Debug réafficherait « [undefined] undefined »');
verifie('outil IA get_error_log : affiche _cmcErrType/_cmcErrMsg',
  src.includes('"] "+_cmcErrMsg(l)') && src.includes('" ["+_cmcErrType(l)'),
  'l\'IA rendrait un journal illisible à l\'admin');
verifie('sentinelle error-pattern : groupe sur _cmcErrMsg',
  /recent\.forEach\(function\(e\)\{var k=\(_cmcErrType\(e\)\+" "\+_cmcErrMsg\(e\)\)/.test(src),
  'la sentinelle regrouperait tout sous la chaîne vide et n\'escaladerait jamais rien');

// 4. La cause du faux positif de départ : ne JAMAIS JSON.parse une chaîne vide.
verifie('_resolveIaKey ne JSON.parse que si la valeur ressemble à du JSON',
  /if\(k&&k\.charAt\(0\)==='"'\)try\{var p=JSON\.parse\(k\);/.test(src),
  'chaque démarrage sans clé partagée réinscrirait une fausse erreur « Unexpected end of JSON input »');

// 5. _cmcSafeCatch doit être visible DANS LA MÊME page (sinon décalage d'un chargement).
verifie('_cmcSafeCatch synchronise aussi _errLog en mémoire',
  /ls\("cmc_err_log",log\);if\(typeof _errLog!=="undefined"\)_errLog=log;/.test(src),
  'une erreur n\'apparaîtrait qu\'au chargement SUIVANT — diagnostic décalé');

// 6. Le harnais e2e doit dire POURQUOI il est rouge, et repartir propre par appareil.
const e2e = readFileSync(resolve(ROOT, 'tools/tests/e2e.test.js'), 'utf8');
verifie('e2e : remet le journal à zéro pour chaque appareil',
  e2e.includes("localStorage.removeItem('cmc_err_log')"),
  'les erreurs d\'un appareil seraient recomptées sur les suivants');
verifie('e2e : affiche le texte réel de l\'erreur',
  e2e.includes('e.err || e.technical || e.userMsg'),
  'le test resterait rouge avec un message vide');

console.log('');
if (ko.length) { ko.forEach(m => console.log('  ❌ ' + m));
  console.log('\n❌ JOURNAL : ' + ko.length + ' problème(s) — une erreur pourrait redevenir invisible'); process.exit(1); }
console.log('✅ JOURNAL : ' + ok + ' contrôle(s) OK — les trois formes d\'erreur restent lisibles partout');
