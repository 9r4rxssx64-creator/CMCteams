/* PREUVE — la bascule tient avec le routeur TEL QU'IL EST EN LIGNE.
 *
 * Kevin 2026-08-16 : « vérifie tout avant de me le faire faire ». Je lui avais
 * dit de poser deux variables (UPSTREAM_BASE / UPSTREAM_PREFIX) dans le tableau
 * de bord. Vérification faite : le code EN LIGNE (dernier push réussi, 4677c47)
 * contient `const UPSTREAM = 'https://…github.io'` EN DUR et ZÉRO occurrence de
 * UPSTREAM_BASE. Ces variables n'auraient rien fait. La lecture des variables
 * est du code écrit aujourd'hui, jamais déployé — GitHub bloque le push.
 *
 * Le plan qui marche vraiment :
 *   1. le paquet est enveloppé dans un dossier CMCteams/ — parce que le routeur
 *      en ligne demande déjà /CMCteams/<app>/…
 *   2. Kevin change UNE ligne dans l'éditeur Cloudflare : l'adresse source
 *
 * Ce test prend le VRAI code déployé (extrait de git), applique cette unique
 * modification, sert le paquet en local, et vérifie que chaque sous-domaine
 * rend la bonne page. Si ça passe ici, ça passe chez lui.
 *
 * Lancer : node tests/verify-bascule-une-ligne.mjs
 */
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { tmpdir } from 'node:os';

const RACINE = 'services/kdmc-router/public';
const REF = 'origin/claude/capcut-mini-versions-66tfum';   /* = ce qui est en ligne */
const R = { ok: [], ko: [] };
const chk = (c, m) => (c ? R.ok : R.ko).push(m);

if (!existsSync(RACINE)) {
  execFileSync(process.execPath, ['services/kdmc-router/prepare-secours.mjs', '--leger'], { stdio: 'inherit' });
}

/* --- serveur local qui joue Cloudflare Pages ------------------------------ */
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.txt': 'text/plain' };
const serveur = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = join(RACINE, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); return res.end('introuvable'); }
  res.writeHead(200, { 'content-type': TYPES[extname(f).toLowerCase()] || 'application/octet-stream' });
  res.end(await readFile(f));
});
await new Promise((r) => serveur.listen(0, '127.0.0.1', r));
const PAGES = 'http://127.0.0.1:' + serveur.address().port;

/* --- le routeur EN LIGNE, avec la SEULE ligne que Kevin doit changer ------- */
const deploye = execFileSync('git', ['show', `${REF}:services/kdmc-router/worker.js`], { encoding: 'utf8' });
chk(/const UPSTREAM = 'https:\/\/9r4rxssx64-creator\.github\.io';/.test(deploye),
  'le code en ligne a bien l\'adresse EN DUR (c\'est ce qui rend les variables inutiles)');
chk(!/UPSTREAM_BASE/.test(deploye),
  'le code en ligne ne connaît PAS UPSTREAM_BASE — vérifié, pas supposé');

const modifie = deploye.replace(
  "const UPSTREAM = 'https://9r4rxssx64-creator.github.io';",
  `const UPSTREAM = '${PAGES}';`);
chk(modifie !== deploye, 'la modification d\'UNE ligne s\'applique proprement');

/* on écrit à côté des vrais modules (webauthn.js, fb-token.js) pour que les
   imports du worker se résolvent */
const dossier = await mkdtemp(join(tmpdir(), 'routeur-'));
for (const m of ['webauthn.js', 'fb-token.js']) {
  await writeFile(join(dossier, m), execFileSync('git', ['show', `${REF}:services/kdmc-router/${m}`], { encoding: 'utf8' }));
}
const cible = join(dossier, 'worker.js');
await writeFile(cible, modifie);
const routeur = (await import('file://' + cible)).default;

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
console.log('sous-domaine              HTTP   taille   contenu attendu');
console.log('──────────────────────────────────────────────────────────');
for (const [hote, attendu] of SOUS) {
  let statut = 0, taille = 0, txt = '';
  try {
    const rep = await routeur.fetch(new Request('https://' + hote + '/'), {});
    statut = rep.status;
    txt = await rep.text();
    taille = txt.length;
  } catch (e) { txt = 'ERREUR ' + e.message; }
  console.log(`${hote.padEnd(24)} ${String(statut).padStart(4)}  ${String(taille).padStart(7)}  ${attendu && txt.includes(attendu) ? '✅ « ' + attendu +' »' : (attendu ? '❌ « ' + attendu +' » absent' : '—')}`);
  chk(statut === 200, `${hote} → 200 après la bascule (reçu ${statut})`);
  chk(taille > 500, `${hote} → vraie page (${taille} caractères)`);
  if (attendu) chk(txt.includes(attendu), `${hote} → c'est bien SA page (« ${attendu} » présent)`);
}

/* --- DISCRIMINANT : sans la modification, tout reste cassé ---------------- */
await writeFile(cible, deploye.replace(
  "const UPSTREAM = 'https://9r4rxssx64-creator.github.io';",
  "const UPSTREAM = 'http://127.0.0.1:1';"));   /* amont injoignable = GitHub éteint */
const routeurKo = (await import('file://' + cible + '?v=2')).default;
let ko = 0;
try { const rep = await routeurKo.fetch(new Request('https://kd-mc.com/'), {}); ko = rep.status; } catch (_) { ko = 0; }
chk(ko !== 200, `DISCRIMINANT : sans la bonne adresse, kd-mc.com ne marche PAS (${ko || 'erreur'})`);

serveur.close();
R.ok.forEach((m) => console.log('  OK ' + m));
R.ko.forEach((m) => console.log('  FAIL ' + m));
console.log(`\n=== ${R.ok.length} OK / ${R.ko.length} FAIL ===`);
process.exit(R.ko.length ? 1 : 0);
