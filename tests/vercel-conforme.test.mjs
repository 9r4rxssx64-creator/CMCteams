/* VERCEL — le fichier de configuration doit être ACCEPTÉ par le schéma, sinon le
 * correctif qu'il contient ne s'applique JAMAIS (et Kevin reçoit un mail d'échec).
 *
 * Histoire (à ne pas répéter) : le 5.09.2026, `tools/agent/vercel.json` a reçu une
 * `ignoreCommand` pour arrêter les 40 déploiements/jour (un par push de CHAQUE branche,
 * tous annulés ou en erreur, un mail à Kevin à chaque fois). Le correctif était juste.
 * Il n'a jamais pu s'appliquer : Vercel valide le fichier contre un schéma STRICT et le
 * refusait, pour DEUX raisons découvertes l'une après l'autre le 6.09 —
 *   1) « should NOT have additional property `_note` » : la note qui EXPLIQUAIT le
 *      correctif faisait rejeter le fichier (aucun commentaire, aucune clé inconnue) ;
 *   2) « `ignoreCommand` should NOT be longer than 256 characters » : elle en faisait 406.
 * Dans les deux cas le build sortait en ERREUR avant même de lire l'ignoreCommand : le
 * symptôme continuait, sur les pushs de toutes les sessions.
 *
 * Ce garde vérifie les deux contraintes, sur TOUT vercel.json du dépôt. Il est hors ligne
 * (aucun appel réseau) et tient en quelques millisecondes.
 *
 * Lancement : npm run test:vercel-conforme
 */
import { readFileSync, existsSync } from 'fs';
import { dirname, resolve, relative } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Clés acceptées au premier niveau d'un vercel.json (schéma Vercel, 09/2026).
const CLES_OK = new Set(['$schema', 'version', 'name', 'alias', 'scope', 'env', 'build',
  'builds', 'routes', 'rewrites', 'redirects', 'headers', 'cleanUrls', 'trailingSlash',
  'regions', 'functions', 'crons', 'git', 'github', 'ignoreCommand', 'buildCommand',
  'devCommand', 'installCommand', 'outputDirectory', 'framework', 'public',
  'images', 'framework', 'installCommand']);
const MAX_IGNORE = 256;

let ok = 0; const ko = [];
const fichiers = execSync('git ls-files "*vercel.json"', { cwd: ROOT, encoding: 'utf8' })
  .split('\n').map(s => s.trim()).filter(Boolean);

console.log('== VERCEL : configuration acceptée par le schéma ==\n');
if (!fichiers.length) { console.log('  (aucun vercel.json suivi par git)'); process.exit(0); }

for (const rel of fichiers) {
  const p = resolve(ROOT, rel);
  if (!existsSync(p)) continue;
  let d;
  try { d = JSON.parse(readFileSync(p, 'utf8')); }
  catch (e) { ko.push(rel + ' : JSON illisible — ' + e.message); continue; }

  const inconnues = Object.keys(d).filter(k => !CLES_OK.has(k));
  if (inconnues.length) ko.push(rel + ' : clé(s) hors schéma → ' + inconnues.join(', ')
    + '  (Vercel refuse le fichier ENTIER ; une explication va dans un README à côté)');
  else { ok++; console.log('  ✓ ' + rel + ' : aucune clé hors schéma'); }

  if (typeof d.ignoreCommand === 'string') {
    if (d.ignoreCommand.length > MAX_IGNORE)
      ko.push(rel + ' : ignoreCommand = ' + d.ignoreCommand.length + ' caractères (maximum '
        + MAX_IGNORE + ') — mettre la logique longue dans un script du dossier');
    else { ok++; console.log('  ✓ ' + rel + ' : ignoreCommand ' + d.ignoreCommand.length + '/' + MAX_IGNORE + ' caractères'); }
  }
}

console.log('');
if (ko.length) { ko.forEach(m => console.log('  ❌ ' + m)); console.log('\n❌ VERCEL : ' + ko.length + ' problème(s) — le fichier serait REFUSÉ, le correctif qu\'il contient ne s\'appliquerait pas'); process.exit(1); }
console.log('✅ VERCEL : ' + ok + ' contrôle(s) OK — les fichiers sont acceptables par le schéma');
