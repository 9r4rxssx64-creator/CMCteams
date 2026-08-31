/* GARDE-FOU — ne jamais demander à Kevin un geste qui ne SERT À RIEN,
 * ni lui donner un numéro de ligne faux.
 *
 * Deux erreurs vécues, à deux jours d'intervalle :
 *   16/08 — je lui fais poser deux variables Cloudflare (UPSTREAM_BASE,
 *           UPSTREAM_PREFIX) : le code réellement en ligne contient l'adresse
 *           en dur et ne les lit NULLE PART. Geste inutile.
 *   17/08 — je lui annonce « change la ligne 14 » : vrai seulement si le paquet
 *           est rangé dans un dossier CMCteams/. Cloudflare Pages a aplati le
 *           dossier déposé → les fichiers sont à la RACINE → il fallait la
 *           ligne 111. Consigne fausse.
 *
 * Sa réponse : « vérifie tout avant de me le faire faire ».
 *
 * Ce test compare la CONSIGNE écrite dans REMETTRE_EN_LIGNE.md au CODE
 * RÉELLEMENT EN LIGNE (extrait de git, dernier push réussi).
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
const lignes = deploye.split('\n');

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

/* --- Règle 2 : la ligne annoncée existe VRAIMENT, au bon numéro ------------ */
/* La doc doit montrer la ligne actuelle suivie de « ← avant », et annoncer son
   numéro sous la forme « ligne **N** ». On vérifie que les deux concordent avec
   le code en ligne — c'est exactement ce qui a manqué le 17/08. */
const avant = (doc.match(/^(.*?)\s*\/\/\s*←\s*avant\s*$/m) || [])[1];
chk(!!avant, avant ? `Règle 2 : la doc montre la ligne actuelle (« ← avant »)` : 'Règle 2 VIOLÉE : la doc ne montre pas la ligne actuelle avec « ← avant »');

if (avant) {
  const code = avant.trim();
  const trouvees = lignes
    .map((l, i) => (l.trim() === code ? i + 1 : 0))
    .filter(Boolean);
  chk(trouvees.length === 1,
    trouvees.length === 1
      ? `Règle 2 : cette ligne existe une seule fois dans le code en ligne (ligne ${trouvees[0]})`
      : `Règle 2 VIOLÉE : la ligne montrée apparaît ${trouvees.length} fois dans le code en ligne → consigne ambiguë`);

  const annonce = (doc.match(/ligne\s+\*\*(\d+)\*\*/) || [])[1];
  chk(!!annonce, annonce ? `Règle 2 : un numéro de ligne est annoncé (${annonce})` : 'Règle 2 VIOLÉE : aucun numéro de ligne annoncé à Kevin');
  if (annonce && trouvees.length === 1) {
    chk(Number(annonce) === trouvees[0],
      Number(annonce) === trouvees[0]
        ? `Règle 2 : le numéro annoncé (${annonce}) est le BON`
        : `Règle 2 VIOLÉE : la doc annonce la ligne ${annonce}, c'est en réalité la ${trouvees[0]}`);
  }
}

/* --- Règle 3 : la correction s'accorde avec le RANGEMENT réel du paquet ---- */
/* Le routeur en ligne demande toujours /CMCteams/… (préfixe en dur dans ROUTES).
   Deux rangements possibles, et une seule correction juste pour chacun :
     • paquet dans un dossier CMCteams/  → il suffit de changer l'adresse
     • paquet à la RACINE                → il FAUT aussi retirer le préfixe    */
const apres = (doc.match(/^(.*?)\s*\/\/\s*←\s*après\s*$/m) || [])[1] || '';
const retirePrefixe = /replace\(\s*['"]\/CMCteams['"]/.test(apres);
chk(/const PAGES_PREFIX = '\/CMCteams'/.test(deploye) && /'cmcteams\.kd-mc\.com': '\/CMCteams'/.test(deploye),
  'Règle 3 : le code en ligne demande bien /CMCteams (préfixe en dur dans ROUTES)');
chk(retirePrefixe,
  retirePrefixe
    ? 'Règle 3 : la correction retire le préfixe /CMCteams — accordée au paquet servi à la RACINE (cas réel constaté par Kevin)'
    : 'Règle 3 VIOLÉE : la correction ne retire pas /CMCteams alors que Cloudflare sert le paquet à la RACINE → 404 partout');
chk(existsSync('services/kdmc-router/pages-upload'),
  'Règle 3 : le paquet « racine » existe bien (services/kdmc-router/pages-upload)');

R.ko.forEach((m) => console.log('  FAIL ' + m));
R.ok.forEach((m) => console.log('  OK   ' + m));
console.log(`\n=== ${R.ok.length} OK / ${R.ko.length} FAIL ===`);
process.exit(R.ko.length ? 1 : 0);
