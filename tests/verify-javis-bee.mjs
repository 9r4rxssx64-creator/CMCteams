/* GARDE-FOU — Bee (le widget Javis) : une seule Bee, et des pages qui la laissent vivre.
 *
 * Deux vraies pannes vécues, que ce test rend impossibles :
 *
 *  1. LA DÉRIVE DES COPIES. Le domaine n'a pas de bundler : chaque app statique garde
 *     SA copie de javis-widget.js. Le 16.09.2026, j'ai amélioré Bee et oublié de
 *     recopier dans arbre/ : deux Bee différentes en ligne, sans un seul message
 *     d'erreur. C'est la leçon #142 (« une logique recopiée finit par diverger »),
 *     et une règle qui vit seulement dans un document finit par être sautée.
 *     → ici on compare les octets, pas les intentions.
 *
 *  2. LA CSP QUI TUE EN SILENCE. Une balise <video> n'est PAS couverte par img-src :
 *     sans `media-src`, la vraie vidéo de Bee est bloquée SANS message et on ne voit
 *     que la marionnette. Même piège que le fetch bloqué faute de connect-src.
 *     → on vérifie les hôtes page par page, selon ce dont la page a besoin.
 *
 *  3. NE PAS DEMANDER UN FICHIER QUI N'EXISTE PAS. Bee réutilise les images et les
 *     vidéos de Lingua. Si on référence un clip non dessiné, le téléphone télécharge
 *     dans le vide (404 mesurés dans Lingua le 13.08). → chaque fichier cité existe.
 *
 * Lancer : node tests/verify-javis-bee.mjs
 */
import { readFileSync, existsSync } from 'node:fs';

const R = { ok: [], ko: [] };
const chk = (c, m) => (c ? R.ok : R.ko).push(m);

const CANON = 'tools/javis/javis-widget.js';
/* Chaque page qui embarque Bee + ce dont elle a besoin dans sa CSP.
   Ajouter Bee à une nouvelle app = ajouter sa ligne ICI dans le même commit. */
const PAGES = [
  { copie: 'arbre/javis-widget.js', page: 'arbre/index.html', video: false },
  { copie: 'javis/javis-widget.js', page: 'javis/index.html', video: true },
];

/* --- 1. une seule Bee : toutes les copies identiques à la source ----------- */
const canon = readFileSync(CANON);
chk(canon.length > 1000, `source canonique lue (${canon.length} octets) : ${CANON}`);
for (const { copie } of PAGES) {
  if (!existsSync(copie)) { chk(false, `COPIE MANQUANTE : ${copie}`); continue; }
  const buf = readFileSync(copie);
  chk(buf.equals(canon),
    buf.equals(canon)
      ? `copie identique à la source : ${copie}`
      : `COPIE QUI A DÉRIVÉ : ${copie} (${buf.length} octets contre ${canon.length}) — recopier ${CANON}`);
}

/* --- 2. chaque page charge bien Bee et lui ouvre les bons hôtes ------------ */
const src = canon.toString('utf8');
for (const { page, video } of PAGES) {
  if (!existsSync(page)) { chk(false, `PAGE MANQUANTE : ${page}`); continue; }
  const html = readFileSync(page, 'utf8');
  chk(/javis-widget\.js/.test(html), `${page} charge bien javis-widget.js`);
  const csp = (html.match(/Content-Security-Policy"[^>]*content="([^"]+)"/) || [])[1] || '';
  chk(!!csp, `${page} a une CSP`);
  const a = (directive) => (csp.match(new RegExp(directive + ' ([^;]+)')) || [])[1] || '';
  chk(a('img-src').includes('lingua.kd-mc.com'),
    `${page} · img-src autorise lingua.kd-mc.com (le dessin de Bee)`);
  chk(a('connect-src').includes('apis.kd-mc.com'),
    `${page} · connect-src autorise apis.kd-mc.com (le hub IA gratuit)`);
  chk(a('connect-src').includes('api.open-meteo.com'),
    `${page} · connect-src autorise api.open-meteo.com (la météo)`);
  if (video) {
    chk(a('media-src').includes('lingua.kd-mc.com'),
      `${page} · media-src autorise lingua.kd-mc.com — SANS LUI la vraie vidéo est bloquée sans message`);
    chk(/JAVIS_MODE\s*=\s*'app'/.test(html), `${page} · déclare bien le mode app`);
  }
}

/* --- 3. tout fichier cité existe vraiment --------------------------------- */
const rigBase = (src.match(/BEE_BASE = '([^']+)'/) || [])[1] || '';
const liveBase = (src.match(/BEE_LIVE = '([^']+)'/) || [])[1] || '';
chk(rigBase.startsWith('https://lingua.kd-mc.com/'), `images de Bee servies par Lingua : ${rigBase}`);
chk(liveBase.startsWith('https://lingua.kd-mc.com/'), `vidéos de Bee servies par Lingua : ${liveBase}`);
const localDe = (url) => 'lingua/' + url.replace('https://lingua.kd-mc.com/', '');

for (const m of src.matchAll(/BEE_BASE \+ '([a-z-]+\.webp)/g)) {
  const f = localDe(rigBase) + m[1];
  chk(existsSync(f), existsSync(f) ? `image présente : ${f}` : `IMAGE ABSENTE (404 garanti) : ${f}`);
}
const clips = ((src.match(/BEE_CLIPS = \[([^\]]+)\]/) || [])[1] || '')
  .split(',').map((c) => c.trim().replace(/'/g, '')).filter(Boolean);
chk(clips.length >= 1, `clips déclarés : ${clips.join(', ') || '(aucun)'}`);
for (const c of clips) {
  const f = localDe(liveBase) + c + '.mp4';
  chk(existsSync(f), existsSync(f) ? `clip présent : ${f}` : `CLIP ABSENT (404 garanti) : ${f}`);
}
chk(clips.includes('idle'), 'le clip de repos « idle » existe (c\'est le repli de tous les autres)');

/* --- 4. la discipline de repli est bien dans le code, pas juste promise ---- */
chk(/canplay/.test(src), 'la vidéo ne s\'affiche qu\'après « canplay » (jamais de trou noir)');
chk(/VID\.pret = false/.test(src), 'échec du clip de repos → retour marionnette, pas d\'écran vide');
chk(/VID\.absent\[m\[1\]\] = 1/.test(src), 'un clip manquant ne tue que CE mouvement-là');
chk(/if \(clip\(rig, kind/.test(src), 'les mouvements essaient la vraie vidéo avant la marionnette');
chk(/j\.verified === true && j\.admin === true/.test(src),
  'visibilité fail-CLOSED : Bee n\'apparaît que pour Kevin, Face ID prouvé');

/* --- verdict --------------------------------------------------------------- */
R.ok.forEach((m) => console.log('  ✅', m));
R.ko.forEach((m) => console.log('  ❌', m));
console.log(`\n${R.ok.length} contrôles OK, ${R.ko.length} échec(s)`);
process.exit(R.ko.length ? 1 : 0);
