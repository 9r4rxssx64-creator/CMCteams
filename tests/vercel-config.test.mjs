#!/usr/bin/env node
/**
 * Garde : `tools/agent/vercel.json` respecte le SCHÉMA de Vercel.
 *
 * POURQUOI ELLE EXISTE
 * --------------------
 * 05/09/2026, deux fois de suite, un déploiement Vercel a échoué AVANT le build
 * (journaux de build vides) — donc un mail « Preview deployment failed » à Kevin
 * à CHAQUE push du dépôt, sur TOUTES les branches. Les deux causes venaient de
 * moi, et toutes deux étaient invisibles en lisant le fichier :
 *
 *   1. `"_note": "…"` ajouté pour expliquer le filtre
 *      → « The vercel.json schema validation failed: should NOT have additional
 *         property "_note" » : Vercel refuse TOUTE clé inconnue.
 *   2. `ignoreCommand` de 406 caractères (messages en clair)
 *      → « `ignoreCommand` should NOT be longer than 256 characters ».
 *
 * Leçon #218. Un commentaire se met dans le commit ou dans un .md voisin
 * (README-vercel.md), jamais dans un fichier de configuration à schéma strict.
 *
 * Câblé dans `npm run test:ci`.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FICHIER = join(ROOT, 'tools/agent/vercel.json');

/* Clés réellement acceptées par le schéma Vercel et utilisées ici. Ajouter une
   clé à cette liste = avoir vérifié qu'elle existe dans le schéma, pas l'inverse. */
const CLES_CONNUES = new Set([
  '$schema', 'version', 'git', 'ignoreCommand', 'crons', 'functions',
  'buildCommand', 'installCommand', 'outputDirectory', 'devCommand',
  'framework', 'headers', 'redirects', 'rewrites', 'regions', 'public',
  'cleanUrls', 'trailingSlash', 'images', 'rootDirectory',
]);
const MAX_IGNORE = 256;

let ok = 0;
let fail = 0;
const OK = (m) => { ok++; console.log('  OK   ' + m); };
const FAIL = (m) => { fail++; console.log('  FAIL ' + m); };

console.log('\nConfiguration Vercel — schéma strict (leçon #218)\n');

if (!existsSync(FICHIER)) {
  console.log('  (tools/agent/vercel.json absent — rien à vérifier)');
  process.exit(0);
}

let conf;
try {
  conf = JSON.parse(readFileSync(FICHIER, 'utf8'));
  OK('vercel.json est un JSON valide');
} catch (e) {
  FAIL('vercel.json illisible : ' + e.message);
  console.log('\n=== ' + ok + ' OK / ' + fail + ' FAIL ===\n');
  process.exit(1);
}

const inconnues = Object.keys(conf).filter((k) => !CLES_CONNUES.has(k));
if (inconnues.length === 0) {
  OK('aucune clé inconnue (Vercel les refuse et le déploiement échoue AVANT le build)');
} else {
  FAIL(
    'clé(s) refusée(s) par Vercel : ' + inconnues.join(', ') +
    ' — une explication va dans le commit ou tools/agent/README-vercel.md, pas ici'
  );
}

if (typeof conf.ignoreCommand === 'string') {
  const n = conf.ignoreCommand.length;
  if (n <= MAX_IGNORE) OK('ignoreCommand : ' + n + ' caractères (limite ' + MAX_IGNORE + ')');
  else FAIL('ignoreCommand : ' + n + ' caractères > ' + MAX_IGNORE + ' → schéma refusé, mail d\'échec à chaque push');

  /* Le filtre doit rester capable de survivre à un clone sans historique :
     `git diff HEAD^` seul plantait sur le clone Vercel → « Build error ». */
  if (/rev-parse .*HEAD\^/.test(conf.ignoreCommand)) {
    OK('ignoreCommand vérifie l\'existence de HEAD^ avant de comparer (clone Vercel superficiel)');
  } else if (/HEAD\^/.test(conf.ignoreCommand)) {
    FAIL('ignoreCommand compare HEAD^ sans vérifier qu\'il existe — plante sur le clone Vercel');
  }

  /* Et il doit continuer à couper les prévisualisations de branche (40/jour le 05/09). */
  if (/VERCEL_GIT_COMMIT_REF/.test(conf.ignoreCommand)) {
    OK('ignoreCommand distingue main des branches (pas de prévisualisation par branche)');
  } else {
    FAIL('ignoreCommand ne regarde plus la branche — les prévisualisations reviennent');
  }
}

console.log('\n=== ' + ok + ' OK / ' + fail + ' FAIL ===\n');
process.exit(fail ? 1 : 0);
