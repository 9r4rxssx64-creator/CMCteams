/* GARDE-FOU — ne jamais demander à Kevin un geste qui ne SERT À RIEN.
 *
 * Le 16/08/2026 je lui ai fait poser deux variables (UPSTREAM_BASE,
 * UPSTREAM_PREFIX) dans le tableau de bord Cloudflare. Elles n'avaient
 * AUCUN effet : le code réellement en ligne contient l'adresse EN DUR et ne
 * lit ces variables nulle part. La lecture des variables existait bien… dans
 * du code écrit ce jour-là, jamais déployé (GitHub bloque le push).
 *
 * Sa réponse : « vérifie tout avant de me le faire faire ».
 *
 * Ce test compare la CONSIGNE écrite dans REMETTRE_EN_LIGNE.md au CODE
 * RÉELLEMENT EN LIGNE (extrait de git, dernier push réussi). Si la consigne
 * demande de poser une variable que le code déployé ne lit pas, il échoue.
 *
 * Lancer : node tests/verify-consigne-reelle.mjs
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const DOC = 'REMETTRE_EN_LIGNE.md';
const REF = 'origin/claude/capcut-mini-versions-66tfum';   /* = ce qui tourne en ligne */
const R = { ok: [], ko: [] };
const chk = (c, m) => (c ? R.ok : R.ko).push(m);

chk(existsSync(DOC), `${DOC} existe`);
const doc = existsSync(DOC) ? readFileSync(DOC, 'utf8') : '';

let deploye = '';
try {
  deploye = execFileSync('git', ['show', `${REF}:services/kdmc-router/worker.js`], { encoding: 'utf8' });
} catch (_) { /* branche absente : on le dit plutôt que de passer en vert */ }
chk(deploye.length > 1000, `le code EN LIGNE est lisible (${deploye.length} caractères, réf ${REF})`);

/* --- Règle 1 : toute variable citée comme consigne doit être LUE en ligne --- */
/* On ne relève que les majuscules présentées dans un tableau de consigne
   (`| \`NOM\` | …`) ou en `env.NOM` — pas les mots d'explication. */
const citees = new Set();
for (const m of doc.matchAll(/\|\s*`([A-Z][A-Z0-9_]{3,})`\s*\|/g)) citees.add(m[1]);
for (const m of doc.matchAll(/`env\.([A-Z][A-Z0-9_]{3,})`/g)) citees.add(m[1]);

const mortes = [...citees].filter((v) => !new RegExp('env(\\.|\\[[\'"])' + v).test(deploye));
chk(mortes.length === 0,
  mortes.length === 0
    ? `Règle 1 : les ${citees.size} variable(s) citée(s) sont bien lues par le code en ligne`
    : `Règle 1 VIOLÉE : ${mortes.join(', ')} — la consigne demande de la poser, le code EN LIGNE ne la lit PAS`);

/* --- Règle 2 : la ligne à modifier existe VRAIMENT, telle qu'annoncée ------ */
const LIGNE = "const UPSTREAM = 'https://9r4rxssx64-creator.github.io';";
chk(deploye.includes(LIGNE), 'Règle 2 : la ligne exacte annoncée à Kevin existe dans le code en ligne');

const numero = deploye.split('\n').findIndex((l) => l.includes(LIGNE)) + 1;
chk(numero > 0, `Règle 2 : elle est à la ligne ${numero}`);
const annonce = (doc.match(/ligne\s+\*\*(\d+)\*\*/) || [])[1];
chk(annonce ? Number(annonce) === numero : true,
  annonce
    ? (Number(annonce) === numero
      ? `Règle 2 : le numéro annoncé (${annonce}) est le BON`
      : `Règle 2 VIOLÉE : la doc annonce la ligne ${annonce}, c'est en réalité la ${numero}`)
    : 'Règle 2 : aucun numéro de ligne annoncé (rien à vérifier)');

/* --- Règle 3 : le paquet servi s'accorde avec le préfixe attendu ----------- */
/* Le routeur en ligne demande /CMCteams/… ; le dossier envoyé doit donc
   contenir un dossier CMCteams à sa racine, sinon c'est 404 partout. */
const attendPrefixe = /const PAGES_PREFIX = '\/CMCteams'/.test(deploye);
chk(attendPrefixe, 'Règle 3 : le code en ligne attend bien le préfixe /CMCteams');
if (attendPrefixe) {
  chk(existsSync('services/kdmc-router/public/CMCteams'),
    'Règle 3 : le paquet est bien enveloppé dans CMCteams/ (sinon 404 partout)');
}

R.ko.forEach((m) => console.log('  FAIL ' + m));
R.ok.forEach((m) => console.log('  OK   ' + m));
console.log(`\n=== ${R.ok.length} OK / ${R.ko.length} FAIL ===`);
process.exit(R.ko.length ? 1 : 0);
