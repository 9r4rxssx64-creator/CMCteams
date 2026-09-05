/* Lecture des DONNÉES de l'arbre pour les outils locaux — source unique (v3.16, fait n°12).
 * ===========================================================================================
 * Avant, chaque outil (patrimoine, recherches, audit cloud) exécutait `buildSeed()` extrait
 * d'arbre/index.html. Depuis la v3.16 ce fichier ne contient PLUS PERSONNE : les données
 * vivent sur le domaine (KV du routeur) et sur les appareils. Un outil qui a besoin des vraies
 * personnes lit donc un EXPORT PRIVÉ de l'app (Outils → ⬇️ Exporter), déposé hors du dépôt :
 *   1. le fichier donné par ARBRE_EXPORT=/chemin/vers/export.json ;
 *   2. sinon  patrimoine/arbre.json   (dossier ignoré par git — jamais commité) ;
 *   3. sinon, UNIQUEMENT si `synthetiqueOk`, la famille inventée de fixture-famille.mjs,
 *      clairement signalée (`synthetique: true`) — pour que les gardes tournent sans données.
 * Retour : { persons, meta, source, synthetique }.  Jamais de copie de données dans le code.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const EXPORT_PRIVE = join(RACINE, 'patrimoine', 'arbre.json');

function lireFichier(p) {
  const d = JSON.parse(readFileSync(p, 'utf8'));
  const persons = d && d.persons && typeof d.persons === 'object' ? d.persons : (d && typeof d === 'object' && !Array.isArray(d) ? d : null);
  if (!persons || !Object.keys(persons).length) throw new Error(`export vide ou de forme inconnue : ${p}`);
  return { persons, meta: (d && d.meta) || { updatedAt: 0 }, source: p, synthetique: false };
}

export async function lireDonnees({ synthetiqueOk = false } = {}) {
  const env = process.env.ARBRE_EXPORT;
  if (env) return lireFichier(resolve(env));
  if (existsSync(EXPORT_PRIVE)) return lireFichier(EXPORT_PRIVE);
  if (synthetiqueOk) {
    const { fixture } = await import('./fixture-famille.mjs');
    const fx = fixture();
    return { persons: fx.persons, meta: fx.meta, source: 'tools/arbre/fixture-famille.mjs (FAMILLE INVENTÉE)', synthetique: true };
  }
  throw new Error("aucune donnée de l'arbre : depuis la v3.16 le fichier public n'en contient plus. Dépose un export de l'app (Outils → Exporter) dans patrimoine/arbre.json (ignoré par git) ou passe ARBRE_EXPORT=/chemin/export.json");
}

/** Bannière à imprimer / écrire quand on tourne sur la famille inventée. */
export const BANNIERE_SYNTHETIQUE = '⚠️ FAMILLE INVENTÉE (tools/arbre/fixture-famille.mjs) — aucune personne réelle : résultats d\'essai, à ne pas utiliser.';
