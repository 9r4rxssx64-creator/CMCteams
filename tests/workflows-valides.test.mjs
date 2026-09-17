#!/usr/bin/env node
/**
 * GARDE — un workflow GitHub qui ne DÉMARRE pas est un échec qu'on ne peut pas lire.
 *
 * POURQUOI ELLE EXISTE (mesuré le 16/09/2026)
 * -------------------------------------------
 * `.github/workflows/clayscore-verif-prix.yml` contenait DEUX blocs `concurrency:`
 * (un posé le 15/08, un second ajouté ensuite sans retirer le premier). Deux clés
 * identiques à la racine d'un même document YAML = fichier INVALIDE. GitHub refusait
 * le fichier AU DÉMARRAGE : chaque push de chaque branche produisait une exécution
 * « failure » avec **0 job et 0 ligne de journal** — impossible à diagnostiquer en
 * cliquant dessus. 413 exécutions en échec, et autant de mails chez Kevin (alors que
 * la règle anti-spam vise 4 mails/jour maximum).
 *
 * Personne ne l'a vu parce que ce rouge-là ne s'affiche pas comme une vérification de
 * PR : il vit dans l'onglet Actions, sans journal, à côté de 145 autres workflows.
 *
 * CE QU'ELLE VÉRIFIE (0 dépendance, node seul, ~50 ms)
 *   1. aucune clé de racine en double (la cause exacte ci-dessus) ;
 *   2. un `on:` (ou `"on":`) — sans lui le workflow ne se déclenche jamais ;
 *   3. un `jobs:` avec au moins un job — sinon GitHub refuse aussi le fichier ;
 *   4. l'indentation de la racine : une clé de racine ne commence jamais par un espace.
 *
 * `npm run test:workflows-valides` — câblé dans `test:ci` ET dans le job
 * `gardes-depot-public` de `.github/workflows/tests.yml` (car `test:ci` ne tourne dans
 * aucun workflow GitHub — message m049).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DOSSIER = join(dirname(fileURLToPath(import.meta.url)), '..', '.github', 'workflows');
let ok = 0;
const pb = [];

/* Les clés de racine : en début de ligne, sans indentation, hors bloc littéral.
   On ignore les lignes de commentaire et l'intérieur des blocs `|` / `>` (qui peuvent
   contenir du texte ressemblant à une clé). */
function clesRacine(texte) {
  const lignes = texte.split('\n');
  const cles = [];
  let profondeurBloc = null;
  for (const l of lignes) {
    if (profondeurBloc !== null) {
      const vide = l.trim() === '';
      const indent = l.length - l.trimStart().length;
      if (!vide && indent <= profondeurBloc) profondeurBloc = null;
      else continue;
    }
    if (/^\s*#/.test(l) || l.trim() === '') continue;
    const m = /^(["']?)([A-Za-z_][\w-]*)\1\s*:(.*)$/.exec(l);
    if (!m) continue;
    cles.push(m[2]);
    if (/^\s*[|>][-+0-9]*\s*$/.test(m[3])) profondeurBloc = 0;
  }
  return cles;
}

/* 5. (ajouté le 17/09/2026, mesuré) un scalaire NON cité qui contient « : » (deux-points +
   espace) est du YAML invalide : « mapping values are not allowed here ». Vécu sur
   `- name: À programmer (ce que la routine lit : MP4 …)` dans pub-videos.yml → GitHub
   répondait « Workflow does not have 'workflow_dispatch' trigger » alors que la garde 1-4
   était verte. On lit chaque `clé: valeur` hors bloc littéral ; une valeur qui ne commence
   ni par une citation, ni par |, >, [, {, ${{ … et qui contient encore « : » = problème. */
function scalairesInvalides(texte) {
  const lignes = texte.split('\n');
  const pbs = [];
  let profondeurBloc = null;
  lignes.forEach((l, i) => {
    if (profondeurBloc !== null) {
      const vide = l.trim() === '';
      const indent = l.length - l.trimStart().length;
      if (!vide && indent <= profondeurBloc) profondeurBloc = null;
      else return;
    }
    if (/^\s*#/.test(l) || l.trim() === '') return;
    const m = /^(\s*)(?:- )?(["']?)([A-Za-z_][\w-]*)\2\s*:\s(.*)$/.exec(l);
    if (!m) return;
    const v = m[4].replace(/\s+#.*$/, '').trim();
    if (/^[|>][-+0-9]*$/.test(v)) { profondeurBloc = m[1].length + (/^\s*- /.test(l) ? 2 : 0); return; }
    if (v === '' || /^["'\[{&*!]/.test(v) || v.startsWith('${{')) return;
    if (/:\s/.test(v) || /:$/.test(v)) pbs.push(`ligne ${i + 1} : « ${l.trim().slice(0, 70)} » — valeur non citée qui contient « : » (YAML invalide, GitHub refuse le fichier)`);
  });
  return pbs;
}

const fichiers = readdirSync(DOSSIER).filter((f) => /\.ya?ml$/.test(f)).sort();
if (!fichiers.length) { console.error('❌ aucun workflow trouvé'); process.exit(1); }

for (const f of fichiers) {
  const texte = readFileSync(join(DOSSIER, f), 'utf8');
  const cles = clesRacine(texte);

  const vus = new Map();
  const doubles = [];
  for (const k of cles) {
    vus.set(k, (vus.get(k) || 0) + 1);
    if (vus.get(k) === 2) doubles.push(k);
  }
  if (doubles.length) pb.push(`${f} — clé(s) de racine en DOUBLE : ${doubles.join(', ')} (GitHub refuse le fichier au démarrage : 0 job, 0 journal)`);
  else ok++;

  if (!cles.includes('on')) pb.push(`${f} — pas de « on: » : ce workflow ne se déclenchera jamais`);
  else ok++;

  if (!cles.includes('jobs')) pb.push(`${f} — pas de « jobs: »`);
  else if (!/^\s{2}[A-Za-z_][\w-]*\s*:/m.test(texte.slice(texte.indexOf('\njobs:')))) pb.push(`${f} — « jobs: » sans aucun job`);
  else ok++;

  const sc = scalairesInvalides(texte);
  if (sc.length) pb.push(`${f} — ${sc.join(' ; ')}`);
  else ok++;
}

console.log(`\n  Les ${fichiers.length} workflows démarrent (clés uniques, on:, jobs:, scalaires cités)\n`);
if (pb.length) {
  for (const p of pb) console.log(`  ❌ ${p}`);
  console.log(`\n${ok} contrôle(s) OK, ${pb.length} échec(s)\n`);
  process.exit(1);
}
console.log(`  ✅ aucune clé de racine en double (la panne du 16/09 ne peut plus revenir)`);
console.log(`  ✅ chacun a son « on: » et au moins un job\n`);
console.log(`${ok} contrôles OK, 0 échec(s)\n`);
