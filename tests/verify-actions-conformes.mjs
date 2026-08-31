/* GARDE-FOU — GitHub Actions ne sert qu'à construire, tester et déployer CE dépôt.
 *
 * Le 15/08/2026, le compte GitHub de Kevin a été suspendu, et le support a
 * REFUSÉ de lever la restriction. Raison donnée mot pour mot :
 *
 *   « any repositories that use GitHub Actions solely to interact with 3rd
 *     party websites […] or for general computing purposes may fall afoul of
 *     the GitHub Additional Product Terms »
 *
 * Constat mesuré au moment de la suspension : 168 workflows, 51 avec
 * déclencheur horaire, ≈ 97 exécutions par jour, 44 qui n'appelaient QUE des
 * services extérieurs sans jamais toucher au code. C'est moi (Claude) qui ai
 * empilé la plupart de ces workflows, mois après mois, sans jamais vérifier
 * que ça correspondait à l'usage prévu. Ce test existe pour que ça ne
 * recommence pas — sur ce dépôt comme sur celui qui le remplacera.
 *
 * Il vérifie deux règles simples :
 *   1. AUCUNE exécution programmée (cron). Ce qui doit tourner en boucle
 *      appartient à un Cloudflare Worker, pas à un dépôt de code.
 *   2. AUCUN workflow dont le SEUL travail est d'appeler des services tiers.
 *      S'il n'installe rien, ne teste rien et ne déploie rien : il n'a rien à
 *      faire ici.
 *
 * Lancer : node tests/verify-actions-conformes.mjs
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DOSSIER = '.github/workflows';
const R = { ok: [], ko: [] };
const chk = (c, m) => (c ? R.ok : R.ko).push(m);

const fichiers = existsSync(DOSSIER)
  ? readdirSync(DOSSIER).filter((f) => /\.ya?ml$/.test(f))
  : [];
chk(fichiers.length > 0, `on inspecte ${fichiers.length} workflow(s)`);

/* --- Règle 1 : plus aucune exécution programmée -------------------------- */
const avecCron = [];
for (const f of fichiers) {
  const s = readFileSync(join(DOSSIER, f), 'utf8');
  /* on ignore les lignes commentées : le commentaire qui EXPLIQUE le retrait
     ne doit évidemment pas déclencher l'alarme */
  const actif = s.split('\n').some((l) => /^\s*-\s*cron\s*:/.test(l) && !/^\s*#/.test(l));
  if (actif) avecCron.push(f);
}
chk(avecCron.length === 0,
  avecCron.length === 0
    ? 'Règle 1 : aucune exécution programmée (0 cron) — c\'était ~97/jour avant la suspension'
    : `Règle 1 VIOLÉE : ${avecCron.length} workflow(s) avec cron → ${avecCron.join(', ')}`);

/* --- Règle 2 : rien qui ne fasse QUE appeler l'extérieur ------------------ */
const HOTE = /https?:\/\/(?!(?:api\.)?github\.com|raw\.githubusercontent|objects\.githubusercontent|uploads\.github)[a-z0-9.-]+/gi;
const CONSTRUIT = /npm (run|ci|test)|actions\/setup-node|wrangler deploy|npm install|actions\/deploy-pages|pytest|cargo /;
/* Exceptions ASSUMÉES : elles déploient réellement le code de Kevin, ce qui est
   l'usage prévu d'Actions. Toute nouvelle exception doit être justifiée ici. */
const TOLERES = new Set(['crypto-bot-deploy.yml', 'clayscore-extract-private.yml']);
const purs = [];
for (const f of fichiers) {
  if (TOLERES.has(f)) continue;
  const s = readFileSync(join(DOSSIER, f), 'utf8');
  const hotes = [...s.matchAll(HOTE)].map((m) => m[0]);
  if (hotes.length && !CONSTRUIT.test(s)) purs.push(f);
}
chk(purs.length === 0,
  purs.length === 0
    ? 'Règle 2 : aucun workflow qui n\'appelle QUE des services tiers'
    : `Règle 2 VIOLÉE : ${purs.length} workflow(s) n'appellent que l'extérieur → ${purs.join(', ')}`);

/* --- La note explicative doit rester lisible ----------------------------- */
const note = '.github/workflows-desactives/POURQUOI.md';
chk(existsSync(note), 'la note qui explique le retrait est présente (' + note + ')');
if (existsSync(note)) {
  const t = readFileSync(note, 'utf8');
  chk(/3rd party websites/.test(t), 'elle cite la raison EXACTE donnée par GitHub, pas un résumé');
}

R.ok.forEach((m) => console.log('  OK ' + m));
R.ko.forEach((m) => console.log('  FAIL ' + m));
console.log(`=== ${R.ok.length} OK / ${R.ko.length} FAIL ===`);
process.exit(R.ko.length ? 1 : 0);
