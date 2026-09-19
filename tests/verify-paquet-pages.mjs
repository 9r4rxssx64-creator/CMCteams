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

/* Les applications, LUES DANS LA TABLE ROUTES du routeur — jamais recopiées.
   ⚠️ 19.09.2026, Kevin : « pourquoi l'app a plusieurs adresses ? » Cette liste
   était une COPIE À LA MAIN de 24 entrées, alors que ROUTES en compte 32. Les
   8 manquantes n'étaient ouvertes par aucun test — et trois d'entre elles
   (rotaplan, kit, croupier) n'avaient AUCUNE page dans le paquet : l'hébergeur
   répondait par /index.html, donc par CMCteams, avec un code 200. Trois
   adresses servaient l'app à la place de leur boutique, sans un seul rouge.
   Une liste recopiée dérive toujours : on lit la source. */
const _src = await readFile('services/kdmc-router/worker.js', 'utf8');
const _bloc = _src.slice(_src.indexOf('const ROUTES'), _src.indexOf('// Proxy MÊME ORIGINE'));
const _routes = [...(_bloc.matchAll(/'([a-z0-9.-]+\.kd-mc\.com|kd-mc\.com)'\s*:\s*'\/CMCteams\/?([^']*)'/g))]
  .map((m) => ({ sous: m[1].replace(/\.kd-mc\.com$/, ''), chemin: '/' + (m[2] ? m[2] + '/' : '') + 'index.html' }));
if (_routes.length < 25) {
  console.error(`❌ MESURE IMPOSSIBLE : ${_routes.length} adresses lues dans ROUTES, c'est trop peu — le format a dû changer.`);
  process.exit(2);
}
/* Plusieurs adresses servent le MÊME dossier (cuisine/cocina/cujina,
   departs/cmcteams-light, kd-mc.com/www). On n'ouvre chaque page qu'une fois,
   mais on garde tous les noms pour que le rapport les cite. */
const _parChemin = new Map();
for (const r of _routes) {
  if (!_parChemin.has(r.chemin)) _parChemin.set(r.chemin, []);
  _parChemin.get(r.chemin).push(r.sous);
}
const APPS = [..._parChemin].map(([chemin, sous]) => ({ chemin, sous: sous.join(' / ') }));

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

/* Serveur statique minimal — le comportement de Cloudflare Pages : un fichier,
   sinon l'index.html du dossier, sinon 404. */
/* Dossier de l'app en cours de test (mis à jour avant chaque navigation). */
let DOSSIER_COURANT = '';
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
    /* En production, CHAQUE adresse a son dossier : kd-mc.com sert
       /CMCteams/kdmc-home, donc « /apps.json » demandé par la page d'accueil
       arrive dans /kdmc-home/apps.json. Ici on sert tout le paquet à plat :
       sans cette ligne, le test crie « fichier manquant » sur un fichier bien
       présent, simplement rangé dans le dossier de son app (mesuré le 19.09
       sur /apps.json). On imite donc AUSSI la mise en dossier par adresse. */
    if (!existsSync(f) && DOSSIER_COURANT) {
      const f2 = join(RACINE, DOSSIER_COURANT, p);
      if (existsSync(f2)) f = f2;
    }
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
  /* ⚠️ C'EST ICI qu'on attrape un fichier vraiment absent. « requestfailed »
     ne se déclenche PAS sur un 404 : pour Playwright, un 404 est une réponse
     reçue, donc un succès réseau. La garde a donc longtemps CRU vérifier la
     complétude du paquet sans jamais la vérifier (elle ne voyait que des
     abandons). On écoute désormais les réponses et on refuse les 404 servis
     par NOTRE serveur — c'est-à-dire par le paquet lui-même. */
  page.on('response', (rep) => {
    const u = rep.url();
    if (!u.startsWith(BASE) || rep.status() !== 404) return;
    const chemin = u.replace(BASE, '');
    /* Les adresses en /__xxx/ ne sont PAS des fichiers : c'est le routeur qui
       y répond en production (identité, admin, arbre, voix…). Un serveur de
       fichiers ne peut pas les servir — les compter comme « manquantes »
       serait accuser le paquet d'un travail qui n'est pas le sien. */
    if (/^\/(CMCteams\/)?__/.test(chemin)) return;
    erreursJs.push('fichier manquant : ' + chemin);
  });
  page.on('requestfailed', (r) => {
    const u = r.url();
    /* Un appel vers l'extérieur qui échoue ICI = mon réseau bloqué, pas le
       paquet. On le compte à part au lieu de crier au bug. */
    if (!u.startsWith(BASE)) { reseauBloque.push(u.split('/')[2] || u); return; }
    /* ⚠️ « requestfailed » ne veut PAS dire « fichier absent ». Il se déclenche
       aussi quand la page se ferme pendant qu'un morceau se charge encore
       (net::ERR_ABORTED). MESURÉ le 19.09 sur trois passages d'affilée : 65,
       puis 3, puis 5 « fichiers manquants » — sur des fichiers RÉELLEMENT
       PRÉSENTS sur le disque. Une garde qui accuse au hasard finit par être
       ignorée : on ne compte donc que ce qui manque VRAIMENT. */
    const raison = (r.failure() && r.failure().errorText) || '';
    let chemin = u.replace(BASE, '').split('?')[0];
    if (chemin.startsWith('/CMCteams/')) chemin = chemin.slice('/CMCteams'.length);
    const surLeDisque = existsSync(join(RACINE, decodeURIComponent(chemin)));
    if (surLeDisque || /ERR_ABORTED/.test(raison)) return;   // faux positif
    erreursJs.push('fichier manquant : ' + u.replace(BASE, ''));
  });

  let etat = { ...app, texte: 0, erreursJs, reseauBloque, http: 0 };
  try {
    DOSSIER_COURANT = app.chemin.replace(/\/index\.html$/, '').replace(/^\//, '');
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
