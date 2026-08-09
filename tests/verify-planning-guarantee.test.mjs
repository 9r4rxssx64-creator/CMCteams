/* NON-RÉGRESSION — la règle ABSOLUE n°1 de CMCteams : « tout le monde a un planning si son nom
 * est écrit dans le PDF ». L'écran « Vérification » (vVerify) doit RÉELLEMENT comparer les noms
 * du texte source aux cellules importées.
 *
 * BUG TROUVÉ LE 2026-08-09 (audit) : `cmc_import_src_<key>` est stocké en OBJET {txt,ts,…}
 * (index.html ~40194) mais vVerify faisait `.toUpperCase()` directement sur le retour de `lg()`
 * → TypeError sur un objet → avalé par un `catch(_){}` MUET → `src=""` → la boucle de contrôle
 * ne tournait jamais → l'écran affichait « ok » SANS avoir rien vérifié, dès que la page avait
 * été rechargée (`window._lastImportText` n'est pas persisté).
 *
 * node tests/verify-planning-guarantee.test.mjs
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');

let pass = 0;
const fails = [];
const ok = (c, m) => (c ? pass++ : fails.push(m));

/* 1. La source EST bien écrite en objet (si ça change un jour, ce test doit le dire). */
ok(/ls\("cmc_import_src_"\+key,\s*\{\s*txt:/.test(html),
  'la source PDF est stockée en objet {txt,…} — sinon adapter la lecture de vVerify');

/* 2. L'ANTI-PATTERN exact ne doit plus exister : .toUpperCase() collé au lg() de la source. */
ok(!/lg\("cmc_import_src_"\+key,\s*""\)\s*\|\|\s*""\)\.toUpperCase\(\)/.test(html),
  'vVerify ne fait plus .toUpperCase() sur le retour brut de lg() (objet → TypeError muet)');

/* 3. Le contrôle n'échoue plus EN SILENCE. */
const bloc = (html.match(/var srcMissing=\[\];[\s\S]{0,2200}?\}\s*var covState=/) || [''])[0];
ok(bloc.length > 100, 'le bloc de contrôle a bien été retrouvé pour analyse');
ok(/console\.error/.test(bloc), 'un échec du contrôle est désormais tracé (plus de catch muet)');
ok(/__CONTROLE_IMPOSSIBLE__/.test(bloc),
  'si le contrôle ne peut pas tourner, l\'écran ne doit PAS afficher « ok » : il signale l\'échec');

/* 4. COMPORTEMENT RÉEL — on exécute l'extraction extraite du fichier, avec un objet en entrée
      (le cas qui plantait) et avec les autres formes possibles. */
const extrait = (html.match(/var _srcEnt=lg\([\s\S]{0,400}?var src=String\([^\n]*\);/) || [''])[0];
ok(extrait.length > 50, 'l\'extraction de la source a été retrouvée pour être exécutée');
if (extrait) {
  const run = (stored, sessionTxt) => {
    const key = '2026-5';
    const lg = (k, d) => (k === 'cmc_import_src_' + key ? stored : d);
    const win = { _lastImportText: sessionTxt };
    // eslint-disable-next-line no-new-func
    const f = new Function('lg', 'key', 'window', extrait + ' return src;');
    return f(lg, key, win);
  };
  ok(run({ txt: 'DUPONT J 1 31', ts: 1 }, undefined) === 'DUPONT J 1 31',
    'CAS DU BUG : une source stockée en objet est bien lue (avant : chaîne vide)');
  ok(run('DUPONT J 1 31', undefined) === 'DUPONT J 1 31',
    'rétro-compat : une source stockée en texte brut marche encore');
  ok(run(null, 'MARTIN L 1 15') === 'MARTIN L 1 15',
    'la source de session (juste après import) reste prioritaire');
  ok(run(null, undefined) === '', 'aucune source → chaîne vide, pas de plantage');
}

console.log('\n' + (fails.length ? '❌' : '✅') + ' garde « tout le monde a un planning » : '
  + pass + ' vérif OK, ' + fails.length + ' échec(s)');
for (const f of fails) console.log('   ❌ ' + f);
process.exit(fails.length ? 1 : 0);
