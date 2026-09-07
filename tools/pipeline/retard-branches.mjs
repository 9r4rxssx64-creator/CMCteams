#!/usr/bin/env node
/**
 * « Ma branche est-elle dangereusement en retard sur un fichier PARTAGÉ ? »
 *
 * POURQUOI CET OUTIL (Kevin 2026-09-06 : « applique tout pour tes autres branches
 * et qu'elles soient au courant de tes modifs ») — le coordinateur de branches
 * existant (branch-coordinator.yml) détecte les CHEVAUCHEMENTS (deux branches qui
 * touchent le même fichier). Il ne détecte PAS le retard : une branche peut porter
 * une version d'index.html vieille d'un mois et, à la fusion, si le conflit est
 * résolu « du mauvais côté », faire disparaître un mois de planning entier.
 *
 * Mesuré le 6.09.2026, c'était un risque RÉEL et non théorique :
 *   claude/cmcteams-clicking-issue-rmli6m  index.html v9.891, SEPTEMBRE ABSENT
 *   claude/miroir-pour-chaque              index.html v9.891, 178 commits derrière
 *   claude/surveillance-domaine-26-adresses index.html v9.891, 137 derrière
 *   claude/sarzance-family-tree-3jxi7i     index.html v9.893,  57 derrière
 * ...alors que main était en v9.895 avec les correctifs MATTERA M / NICASTRO M.
 *
 * CE N'EST PAS UN TEST BLOQUANT, et c'est volontaire : être en retard n'est pas
 * une faute, c'est normal quand on travaille. L'outil DIT le risque et donne la
 * commande exacte. Il sort en 0 sauf avec --strict.
 *
 * PAR DÉFAUT ON NE REGARDE QUE LES BRANCHES VIVANTES (21 jours). Sans ce filtre,
 * l'outil crache 200 lignes rouges de branches abandonnées depuis des mois : ça
 * noie le signal, et un outil qu'on n'arrive pas à lire ne sert à rien.
 *
 * Usage :
 *   node tools/pipeline/retard-branches.mjs              ma branche
 *   node tools/pipeline/retard-branches.mjs --toutes     les claude/* vivantes (21 j)
 *   node tools/pipeline/retard-branches.mjs --toutes --jours 60
 *   node tools/pipeline/retard-branches.mjs --toutes --tout   même les abandonnées
 *   node tools/pipeline/retard-branches.mjs --strict     sort en 1 si un rouge
 */
import { execSync } from 'child_process';

const ARGS = process.argv.slice(2);
const TOUTES = ARGS.includes('--toutes');
const STRICT = ARGS.includes('--strict');
const TOUT = ARGS.includes('--tout');
const JOURS = Number((ARGS[ARGS.indexOf('--jours') + 1] || '').match(/^\d+$/)?.[0] || 21);

// Fichiers réellement PARTAGÉS entre sessions : deux surfaces les lisent, ou une
// règle absolue les lie. Un retard dessus se paie en données perdues, pas en
// conflit visible.
const PARTAGES = [
  { f: 'index.html',                      quoi: 'app CMCteams' },
  { f: 'sw.js',                           quoi: 'cache PWA (règle « MAJ auto forcée »)' },
  { f: 'tools/shared/planning-seed.js',   quoi: 'données planning CMCteams' },
  { f: 'tools/departs/boards-gen.js',     quoi: 'données planning page Départs' },
  { f: 'tools/departs/index.html',        quoi: 'page Départs' },
  { f: 'package.json',                    quoi: 'la barrière test:ci' },
];

const sh = (c) => execSync(c, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const essaie = (c, def = '') => { try { return sh(c); } catch { return def; } };

// Fail-open : sans main, on ne peut rien comparer — on le dit et on sort en 0.
if (!essaie('git rev-parse --verify origin/main')) {
  console.log('origin/main introuvable — rien à comparer (fail-open).');
  console.log('  → git fetch origin main');
  process.exit(0);
}

const LIMITE = Date.now() - JOURS * 86400000;
const branches = TOUTES
  ? essaie(`git for-each-ref --format='%(committerdate:unix) %(refname:short)' refs/remotes/origin/claude/`)
      .split('\n').map((l) => l.trim().replace(/^'|'$/g, '')).filter(Boolean)
      .map((l) => { const [t, ...r] = l.split(' '); return { t: Number(t) * 1000, b: r.join(' ').replace(/^origin\//, '') }; })
      .filter((x) => TOUT || x.t >= LIMITE)
      .sort((a, b) => b.t - a.t).map((x) => x.b)
  : [essaie('git rev-parse --abbrev-ref HEAD', 'HEAD')];

if (TOUTES) {
  console.log(TOUT
    ? `Toutes les branches claude/*, y compris les abandonnées (${branches.length}).`
    : `Branches claude/* vivantes (activité < ${JOURS} jours) : ${branches.length}. « --tout » pour voir les abandonnées.`);
}

/** Les mois présents dans un fichier de données, à une révision donnée. */
function moisDe(rev, fichier) {
  const t = essaie(`git show ${rev}:${fichier}`);
  if (!t) return null;
  return [...new Set([...t.matchAll(/"(20\d\d)-(\d{1,2})"/g)].map((m) => `${m[1]}-${m[2]}`))].sort();
}

let rouges = 0, examinees = 0;

for (const b of branches) {
  const rev = essaie(`git rev-parse --verify origin/${b}`) ? `origin/${b}` : b;
  if (!essaie(`git rev-parse --verify ${rev}`)) continue;
  const derriere = Number(essaie(`git rev-list --count ${rev}..origin/main`, '0'));
  const devant = Number(essaie(`git rev-list --count origin/main..${rev}`, '0'));
  if (derriere === 0) continue;           // à jour : rien à dire
  examinees++;

  // Un fichier n'est « en retard » que s'il a bougé sur main SANS bouger ici.
  const enRetard = PARTAGES.filter(({ f }) => {
    const base = essaie(`git merge-base ${rev} origin/main`);
    if (!base) return false;
    const bougeMain = essaie(`git diff --name-only ${base} origin/main -- ${f}`);
    const bougeIci = essaie(`git diff --name-only ${base} ${rev} -- ${f}`);
    return bougeMain && !bougeIci;
  });

  // Le cas GRAVE : un mois de planning présent sur main et absent ici.
  const perdus = [];
  for (const f of ['tools/shared/planning-seed.js', 'tools/departs/boards-gen.js']) {
    const ici = moisDe(rev, f), sur = moisDe('origin/main', f);
    if (!ici || !sur) continue;
    const manquants = sur.filter((m) => !ici.includes(m));
    if (manquants.length) perdus.push({ f, manquants });
  }

  const grave = perdus.length > 0;
  if (grave) rouges++;
  const icone = grave ? '🔴' : enRetard.length ? '🟠' : '·';
  console.log(`\n${icone} ${b}  (${devant} devant / ${derriere} derrière)`);
  for (const { f, quoi } of enRetard) console.log(`     en retard : ${f}  — ${quoi}`);
  for (const { f, manquants } of perdus) {
    console.log(`     ⚠ MOIS ABSENT ici mais présent sur main : ${manquants.join(', ')}  (${f})`);
  }
  if (enRetard.length || grave) {
    console.log(`     → git fetch origin main && git merge origin/main`);
    if (grave) console.log(`     → en cas de conflit sur ces fichiers : GARDER LE CÔTÉ DE MAIN (jamais le vôtre),`);
    if (grave) console.log(`       puis prouver avec : npm run test:pdf-fidelite`);
  }
}

console.log(`\n${examinees} branche(s) en retard examinée(s) · ${rouges} avec un mois de planning manquant`);
if (!examinees) console.log('Rien à signaler : à jour sur les fichiers partagés.');
if (STRICT && rouges) process.exit(1);
