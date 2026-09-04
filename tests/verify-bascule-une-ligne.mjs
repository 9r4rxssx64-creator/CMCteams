/* PREUVE — la bascule tient avec le routeur TEL QU'IL EST EN LIGNE.
 *
 * Kevin 2026-08-16 : « vérifie tout avant de me le faire faire ». Je lui avais
 * dit de poser deux variables (UPSTREAM_BASE / UPSTREAM_PREFIX) dans le tableau
 * de bord. Vérification faite : le code EN LIGNE (dernier push réussi) contient
 * `const UPSTREAM = 'https://…github.io'` EN DUR et ZÉRO occurrence de
 * UPSTREAM_BASE. Ces variables n'auraient rien fait.
 *
 * 2026-08-17 — SECONDE correction, sur constat de Kevin : « ouvert
 * kdmc0.pages.dev, CMCteams toujours ». Impossible si le paquet était rangé
 * dans un dossier CMCteams/ (la racine n'aurait aucun index.html → 404 de
 * Cloudflare). Donc Cloudflare Pages a APLATI le dossier déposé : les fichiers
 * sont à la RACINE du projet. Or le routeur en ligne demande TOUJOURS
 * /CMCteams/… (les valeurs de ROUTES le contiennent en dur) → sans rien
 * changer d'autre, tout renverrait 404.
 *
 * Ce test couvre donc les DEUX rangements possibles et prouve, pour chacun,
 * QUELLE unique ligne change et que les 8 sous-domaines rendent leur page :
 *
 *   A. paquet dans un dossier CMCteams/   → ligne 14 (l'adresse)
 *   B. paquet à la RACINE  ← le cas réel  → ligne 111 (adresse + retrait du préfixe)
 *
 * Le test prend le VRAI code déployé (extrait de git), applique l'unique
 * modification, sert le paquet en local comme le fera Cloudflare Pages, et
 * vérifie le rendu. Il vérifie aussi qu'appliquer la modification de A au
 * rangement B (et l'inverse) NE marche PAS — sinon il ne prouverait rien.
 *
 * Lancer : node tests/verify-bascule-une-ligne.mjs
 */
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { tmpdir } from 'node:os';

const REF = 'github/claude/capcut-mini-versions-66tfum';   /* = ce qui est en ligne */
const R = { ok: [], ko: [] };
const chk = (c, m) => (c ? R.ok : R.ko).push(m);

/* --- les deux rangements possibles du même paquet -------------------------- */
const RANGEMENTS = {
  A: { racine: 'services/kdmc-router/public', quoi: 'dans un dossier CMCteams/', args: ['--leger'] },
  B: { racine: 'services/kdmc-router/pages-upload', quoi: 'à la RACINE (cas réel)', args: ['--pages', '--leger'] },
};
for (const r of Object.values(RANGEMENTS)) {
  if (!existsSync(r.racine)) {
    execFileSync(process.execPath, ['services/kdmc-router/prepare-secours.mjs', ...r.args], { stdio: 'inherit' });
  }
}

/* --- serveur local qui joue Cloudflare Pages ------------------------------ */
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.txt': 'text/plain' };
let RACINE_SERVIE = RANGEMENTS.A.racine;
const serveur = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = join(RACINE_SERVIE, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); return res.end('introuvable'); }
  res.writeHead(200, { 'content-type': TYPES[extname(f).toLowerCase()] || 'application/octet-stream' });
  res.end(await readFile(f));
});
await new Promise((r) => serveur.listen(0, '127.0.0.1', r));
const PAGES = 'http://127.0.0.1:' + serveur.address().port;

/* --- le routeur EN LIGNE --------------------------------------------------- */
const deploye = execFileSync('git', ['show', `${REF}:services/kdmc-router/worker.js`], { encoding: 'utf8' });
const L14 = "const UPSTREAM = 'https://9r4rxssx64-creator.github.io';";
const L111 = 'const upstreamUrl = UPSTREAM + upstreamPath + url.search;';
chk(deploye.includes(L14), 'le code en ligne a bien l\'adresse EN DUR (c\'est ce qui rend les variables inutiles)');
chk(!/UPSTREAM_BASE/.test(deploye), 'le code en ligne ne connaît PAS UPSTREAM_BASE — vérifié, pas supposé');
chk(deploye.includes(L111), 'la ligne qui fabrique l\'adresse demandée est bien celle annoncée');
/* Le préfixe est en dur dans les valeurs de ROUTES : c'est pour ça qu'un simple
   changement d'adresse ne suffit pas quand le paquet est à la racine. */
chk(/'cmcteams\.kd-mc\.com': '\/CMCteams'/.test(deploye),
  'le préfixe /CMCteams est en dur dans ROUTES (le changer d\'adresse seul ne suffit pas si le paquet est à la racine)');

/* Les DEUX corrections possibles, chacune d'UNE seule ligne. */
const CORRECTIONS = {
  A: { ligne: 14, de: L14, vers: () => `const UPSTREAM = '${PAGES}';` },
  B: { ligne: 111, de: L111,
    vers: () => `const upstreamUrl = '${PAGES}' + upstreamPath.replace('/CMCteams', '') + url.search;` },
};

const dossier = await mkdtemp(join(tmpdir(), 'routeur-'));
for (const m of ['webauthn.js', 'fb-token.js']) {
  await writeFile(join(dossier, m), execFileSync('git', ['show', `${REF}:services/kdmc-router/${m}`], { encoding: 'utf8' }));
}
let compteur = 0;
async function routeurAvec(correction) {
  const code = deploye.replace(correction.de, correction.vers());
  if (code === deploye) throw new Error('la ligne à remplacer est introuvable');
  const cible = join(dossier, 'w' + (++compteur) + '.js');
  await writeFile(cible, code);
  return (await import('file://' + cible)).default;
}

/* --- chaque sous-domaine rend-il SA page ? -------------------------------- */
const SOUS = [
  ['kd-mc.com', 'KDMC'],
  ['cmcteams.kd-mc.com', 'CMC'],
  ['departs.kd-mc.com', 'CMCteams light'],
  ['studio.kd-mc.com', ''],
  ['lingua.kd-mc.com', ''],
  ['coffre.kd-mc.com', ''],
  ['apex-ai.kd-mc.com', ''],
  ['apex-chat.kd-mc.com', ''],
];
async function essai(routeur, hote) {
  try {
    const rep = await routeur.fetch(new Request('https://' + hote + '/'), {});
    const txt = await rep.text();
    return { statut: rep.status, taille: txt.length, txt };
  } catch (e) { return { statut: 0, taille: 0, txt: 'ERREUR ' + e.message }; }
}

for (const cle of ['A', 'B']) {
  RACINE_SERVIE = RANGEMENTS[cle].racine;
  const routeur = await routeurAvec(CORRECTIONS[cle]);
  console.log(`\n■ Rangement ${cle} — paquet ${RANGEMENTS[cle].quoi} → UNE ligne à changer : la ${CORRECTIONS[cle].ligne}`);
  console.log('  sous-domaine              HTTP   taille   contenu attendu');
  console.log('  ──────────────────────────────────────────────────────────');
  for (const [hote, attendu] of SOUS) {
    const r = await essai(routeur, hote);
    const verdict = attendu ? (r.txt.includes(attendu) ? '✅ « ' + attendu + ' »' : '❌ « ' + attendu + ' » absent') : '—';
    console.log(`  ${hote.padEnd(24)} ${String(r.statut).padStart(4)}  ${String(r.taille).padStart(7)}  ${verdict}`);
    chk(r.statut === 200, `[${cle}] ${hote} → 200 après la bascule (reçu ${r.statut})`);
    chk(r.taille > 500, `[${cle}] ${hote} → vraie page (${r.taille} caractères)`);
    if (attendu) chk(r.txt.includes(attendu), `[${cle}] ${hote} → c'est bien SA page (« ${attendu} » présent)`);
  }
}

/* --- DISCRIMINANT 1 : la correction de A ne marche PAS sur le rangement B --- */
RACINE_SERVIE = RANGEMENTS.B.racine;
const rMauvais = await essai(await routeurAvec(CORRECTIONS.A), 'kd-mc.com');
chk(rMauvais.statut !== 200,
  `DISCRIMINANT : sur un paquet à la RACINE, changer seulement la ligne 14 ne marche PAS (${rMauvais.statut}) — c'est pourquoi la consigne a changé`);

/* --- DISCRIMINANT 2 : sans aucune correction, tout reste cassé ------------- */
const rRien = await essai(await routeurAvec({ de: L14, vers: () => "const UPSTREAM = 'http://127.0.0.1:1';" }), 'kd-mc.com');
chk(rRien.statut !== 200, `DISCRIMINANT : sans la bonne adresse, kd-mc.com ne marche PAS (${rRien.statut || 'erreur'})`);

serveur.close();
console.log();
R.ko.forEach((m) => console.log('  FAIL ' + m));
console.log(`\n=== ${R.ok.length} OK / ${R.ko.length} FAIL ===`);
process.exit(R.ko.length ? 1 : 0);
