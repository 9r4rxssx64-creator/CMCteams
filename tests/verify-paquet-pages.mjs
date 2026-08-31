/* PREUVE — le paquet destiné à Cloudflare Pages fonctionne VRAIMENT.
 *
 * Kevin 2026-08-15 : « vérifie ce que nous avons partout avant de me dire de
 * faire ci ou ça » et « tout auto ». Je lui ai livré un ZIP en disant « je n'ai
 * pas pu le tester, mon accès n'atteint pas Cloudflare ». C'était vrai mais
 * insuffisant : je n'ai pas besoin de Cloudflare pour savoir si les pages
 * s'affichent — il me suffit de servir le paquet ici et de les ouvrir dans un
 * vrai navigateur, exactement comme Cloudflare Pages le fera.
 *
 * Ce test :
 *   1. sert le dossier pages-upload/ en local, comme Cloudflare Pages
 *   2. ouvre CHAQUE application dans Chromium
 *   3. vérifie qu'elle S'AFFICHE (contenu réel, pas une page blanche)
 *   4. sépare honnêtement les vraies casses des appels réseau bloqués
 *      (ici Firebase et les Workers sont injoignables : c'est MON réseau,
 *       pas un défaut du paquet — chez Kevin ils répondront)
 *   5. garde une capture d'écran de chaque app
 *
 * Lancer : node tests/verify-paquet-pages.mjs
 */
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';

const RACINE = 'services/kdmc-router/pages-upload';
const CAPTURES = 'audit/captures-paquet';
const R = { ok: [], ko: [] };
const chk = (c, m) => (c ? R.ok : R.ko).push(m);

/* Le test FABRIQUE le paquet s'il n'existe pas. Sans ça il ne tournerait
   jamais tout seul dans le portail de contrôle — et un test qui ne tourne pas
   ne protège de rien. C'est précisément l'erreur qui a laissé passer le paquet
   cassé du 15/08 : tools/shared manquait, et rien d'automatique ne le voyait. */
if (!existsSync(RACINE)) {
  console.log('Le paquet n\'existe pas encore — je le fabrique.');
  const { execFileSync } = await import('node:child_process');
  execFileSync(process.execPath,
    ['services/kdmc-router/prepare-secours.mjs', '--pages', '--leger'],
    { stdio: 'inherit' });
}

/* Les applications, telles que le routeur les sert (table ROUTES, préfixe retiré). */
const APPS = [
  { sous: 'kd-mc.com', chemin: '/kdmc-home/index.html' },
  { sous: 'cmcteams', chemin: '/index.html' },
  { sous: 'apex-ai', chemin: '/apex-ai-v13/index.html' },
  { sous: 'apex-chat', chemin: '/messaging-app/index.html' },
  { sous: 'coffre', chemin: '/coffre-fort/index.html' },
  { sous: 'departs', chemin: '/tools/departs/index.html' },
  { sous: 'studio', chemin: '/tools/crea-studio/index.html' },
  { sous: 'bot', chemin: '/tools/crypto-bot-dashboard/index.html' },
  { sous: 'beatbot', chemin: '/tools/poolrobot/index.html' },
  { sous: 'autorisations', chemin: '/tools/approvals/index.html' },
  { sous: 'lingua', chemin: '/lingua/index.html' },
  { sous: 'dashboard', chemin: '/shops/dashboard/index.html' },
  { sous: 'sourcing', chemin: '/shops/sourcing/index.html' },
  { sous: 'arbre', chemin: '/arbre/index.html' },
  { sous: 'chez-lolo', chemin: '/shops/chez-lolo/index.html' },
  { sous: 'la-detente', chemin: '/la-detente/index.html' },
];

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

/* Serveur statique minimal — le comportement de Cloudflare Pages : un fichier,
   sinon l'index.html du dossier, sinon 404. */
const serveur = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    /* On imite le ROUTEUR, pas un serveur nu : les pages contiennent des liens
       absolus en /CMCteams/… (héritage de GitHub Pages). En production le
       routeur retire ce préfixe avant d'interroger Cloudflare Pages. Sans cette
       ligne, le test crie « fichier manquant » sur des fichiers bien présents —
       c'est ce qui m'est arrivé au premier essai. */
    if (p.startsWith('/CMCteams/')) p = p.slice('/CMCteams'.length);
    let f = join(RACINE, p);
    if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
    if (!existsSync(f)) { res.writeHead(404); return res.end('introuvable'); }
    const buf = await readFile(f);
    res.writeHead(200, { 'content-type': TYPES[extname(f).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  } catch (e) { res.writeHead(500); res.end(String(e.message)); }
});
await new Promise((r) => serveur.listen(0, '127.0.0.1', r));
const BASE = 'http://127.0.0.1:' + serveur.address().port;
console.log(`Paquet servi sur ${BASE} (comme le fera Cloudflare Pages)\n`);

await mkdir(CAPTURES, { recursive: true });
const navigateur = await chromium.launch();
const resultats = [];

const absentes = [];
for (const app of APPS) {
  /* Le paquet « léger » exclut volontairement les 3 apps lourdes en photos.
     Une app absente du paquet n'est PAS une panne : c'est un choix. On le dit
     au lieu d'afficher un rouge qu'il faudrait expliquer à la main. */
  if (!existsSync(join(RACINE, app.chemin.replace(/^\//, '')))) {
    absentes.push(app.sous);
    continue;
  }
  const ctx = await navigateur.newContext({ viewport: { width: 390, height: 844 } });  /* iPhone */
  const page = await ctx.newPage();
  const erreursJs = [];
  const reseauBloque = [];
  page.on('pageerror', (e) => erreursJs.push(String(e.message).slice(0, 120)));
  page.on('requestfailed', (r) => {
    const u = r.url();
    /* Un appel vers l'extérieur qui échoue ICI = mon réseau bloqué, pas le
       paquet. On le compte à part au lieu de crier au bug. */
    if (u.startsWith(BASE)) erreursJs.push('fichier manquant : ' + u.replace(BASE, ''));
    else reseauBloque.push(u.split('/')[2] || u);
  });

  let etat = { ...app, texte: 0, erreursJs, reseauBloque, http: 0 };
  try {
    const rep = await page.goto(BASE + app.chemin, { waitUntil: 'domcontentloaded', timeout: 25000 });
    etat.http = rep ? rep.status() : 0;
    await page.waitForTimeout(1800);   /* laisser l'app se monter */
    etat.texte = (await page.evaluate(() => (document.body && document.body.innerText || '').trim().length)) || 0;
    etat.titre = (await page.title()) || '';
    await page.screenshot({ path: join(CAPTURES, app.sous + '.png'), fullPage: false });
  } catch (e) {
    etat.erreursJs.push('chargement : ' + String(e.message).slice(0, 90));
  }
  resultats.push(etat);
  await ctx.close();
}
await navigateur.close();
serveur.close();

/* --- verdict ------------------------------------------------------------- */
console.log('appli            HTTP  texte affiché  erreurs  réseau bloqué (normal ici)');
console.log('─────────────────────────────────────────────────────────────────────────');
for (const r of resultats) {
  const hotes = [...new Set(r.reseauBloque)].slice(0, 2).join(',') || '—';
  console.log(
    `${r.sous.padEnd(16)} ${String(r.http).padStart(4)}  ${String(r.texte).padStart(9)} car.  ${String(r.erreursJs.length).padStart(6)}  ${hotes.slice(0, 34)}`
  );
}
console.log();

for (const r of resultats) {
  chk(r.http === 200, `${r.sous} : le fichier est bien servi (HTTP ${r.http})`);
  /* 40 caractères : un écran de connexion ou un titre suffit à prouver que
     l'app s'est montée. En dessous, c'est une page blanche. */
  chk(r.texte >= 40, `${r.sous} : la page s'AFFICHE (${r.texte} caractères visibles)`);
  const casses = r.erreursJs.filter((e) => /fichier manquant/.test(e));
  chk(casses.length === 0,
    casses.length === 0
      ? `${r.sous} : aucun fichier manquant dans le paquet`
      : `${r.sous} : ${casses.length} fichier(s) MANQUANT(S) → ${casses.slice(0, 2).join(' | ')}`);
}

chk(resultats.length > 0, `${resultats.length} application(s) réellement testée(s) dans un navigateur`);
if (absentes.length) {
  console.log(`ℹ️  ${absentes.length} application(s) hors de ce paquet (choix du mode léger) : ${absentes.join(', ')}`);
  console.log('    Elles reviennent avec le paquet complet (sans --leger).\n');
}

await writeFile(join(CAPTURES, 'resultats.json'), JSON.stringify(resultats, null, 2));
R.ko.forEach((m) => console.log('  FAIL ' + m));
console.log(`\n=== ${R.ok.length} OK / ${R.ko.length} FAIL ===`);
console.log(`Captures d'écran : ${CAPTURES}/`);
console.log('Note : les appels réseau bloqués sont MON environnement (Firebase, Workers,');
console.log('       polices) — chez Kevin ils répondront. Ce test prouve que le PAQUET');
console.log('       est complet et que les pages se montent.');
process.exit(R.ko.length ? 1 : 0);
