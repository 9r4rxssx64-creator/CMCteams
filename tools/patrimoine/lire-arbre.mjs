/* Lecture de l'arbre familial — source unique pour tous les outils patrimoine.
 * ===========================================================================
 * Depuis la v3.16 l'arbre n'est plus dans arbre/index.html (dépôt public) : on lit un export
 * privé (patrimoine/arbre.json, ignoré par git) via tools/arbre/lire-donnees.mjs. Jamais de copie
 * des données dans le code (garde test:patrimoine-prive).
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

export const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/* v3.16 (fait n°12) : arbre/index.html ne contient plus personne. On lit un export privé de l'app
   (patrimoine/arbre.json, ignoré par git, ou ARBRE_EXPORT=…) ; sans export, la famille INVENTÉE de
   fixture-famille.mjs, signalée par `sourceArbre().synthetique` — les gardes tournent, personne n'est cherché pour de vrai. */
let _src = null;
export function sourceArbre() { return _src; }
export function lireArbre() {
  if (!_src) {
    const r = spawnSync(process.execPath, ['--input-type=module', '-e',
      "import { lireDonnees } from " + JSON.stringify(pathToFileURL(join(RACINE, 'tools', 'arbre', 'lire-donnees.mjs')).href) + "; const d = await lireDonnees({ synthetiqueOk: true }); process.stdout.write(JSON.stringify(d));"],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    if (r.status !== 0) throw new Error((r.stderr || '').trim().split('\n').pop() || 'lecture des données impossible');
    _src = JSON.parse(r.stdout);
  }
  return _src.persons;
}
/* Ancien lecteur (buildSeed dans le fichier) — gardé pour un export « index.html » d'avant v3.16 passé en ARBRE_EXPORT_HTML. */
export function lireArbreDepuisHtml(fichier) {
  const src = readFileSync(fichier, 'utf8');
  const bloc = (marqueur) => {
    const i = src.indexOf(marqueur);
    if (i < 0) return '';
    let d = 0;
    for (let k = src.indexOf('{', i); k < src.length; k++) {
      if (src[k] === '{') d++;
      else if (src[k] === '}' && --d === 0) return src.slice(i, k + 1) + ';';
    }
    return '';
  };
  const srcObj = bloc('var SRC=') || bloc('const SRC=');
  const i = src.indexOf('function buildSeed()');
  if (i < 0) throw new Error("l'arbre a changé de forme : buildSeed introuvable");
  let d = 0, fin = -1;
  for (let k = i; k < src.length; k++) {
    if (src[k] === '{') d++;
    else if (src[k] === '}' && --d === 0) { fin = k + 1; break; }
  }
  // eslint-disable-next-line no-new-func
  return new Function('uid', 'now', `${srcObj}\n${src.slice(i, fin)}\nreturn buildSeed();`)(
    () => 'x' + Math.random().toString(36).slice(2, 9),
    () => Date.now(),
  );
}

export const anneeDe = (t) => {
  const m = String(t || '').match(/\b(1[89]\d{2}|20\d{2})\b/);
  return m ? +m[1] : null;
};
export const dateNette = (t) => {
  const m = String(t || '').match(/\b(\d{1,2})[./](\d{1,2})[./](\d{4})\b/);
  return m ? { j: m[1].padStart(2, '0'), m: m[2].padStart(2, '0'), a: m[3], fr: `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3]}` } : null;
};

/** Les personnes à interroger, dans l'ordre où ça vaut la peine.
 *
 *  Par défaut : les DÉFUNTS + Kevin lui-même, et personne d'autre.
 *  Pourquoi cette limite alors que la recherche Ciclade est publique : lancer
 *  des recherches nominatives sur des vivants — sa sœur, ses cousins — sans
 *  leur accord n'est pas à moi de le décider. Chacun peut faire la sienne en
 *  2 minutes. Passer `{ vivants: true }` lève la limite, en conscience.
 */
export function personnesACherchers({ vivants = false } = {}) {
  const cette = new Date().getFullYear();
  return Object.values(lireArbre())
    .map((p) => {
      const mort = p.deces?.date || null;
      const anMort = anneeDe(mort);
      return {
        nom: (p.nom || '').trim(),
        sexe: p.sexe || '',   // le formulaire Ciclade demande la civilité
        prenom: (p.prenom || '').trim(),
        naissance: dateNette(p.naissance?.date),
        deces: dateNette(mort),
        anMort,
        ans: anMort ? cette - anMort : null,
        lieuDeces: p.deces?.lieu || '',
        decede: !!mort,
      };
    })
    /* il faut au minimum un nom et une date de naissance : c'est ce que le
       formulaire de Ciclade exige, sans ça la recherche n'a pas de sens */
    .filter((p) => p.nom && p.prenom && p.naissance)
    /* prescription trentenaire : au-delà, les sommes sont acquises à l'État */
    .filter((p) => !p.decede || (p.ans !== null && p.ans <= 30))
    /* les vivants ne sont pas interrogés sans leur accord — sauf Kevin */
    .filter((p) => vivants || p.decede
      || (/^DESARZENS$/i.test(p.nom) && /^kevin$/i.test(p.prenom)))
    .sort((a, b) => (b.anMort || 9999) - (a.anMort || 9999));
}
