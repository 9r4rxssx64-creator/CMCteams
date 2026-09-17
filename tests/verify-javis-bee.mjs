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
  /* Sa VOIX est un fichier audio servi par Lingua — donc media-src sur TOUTES les pages,
     pas seulement celles qui jouent la vidéo. Sans lui : elle reste muette, sans message. */
  chk(a('media-src').includes('lingua.kd-mc.com'),
    `${page} · media-src autorise lingua.kd-mc.com (sa voix, et la vidéo le cas échéant)`);
  if (video) {
    chk(/JAVIS_MODE\s*=\s*'app'/.test(html), `${page} · déclare bien le mode app`);
  }
}

/* --- 3. tout fichier cité existe vraiment, POUR LES DEUX PERSONNAGES --------
   Kevin 2026-09-17 : « intègre l'âne de Lingua, avoir le choix ». Depuis, le widget ne
   cite plus des chemins en dur mais une TABLE de mascottes. On la lit et on vérifie
   CHAQUE personnage — c'est précisément là qu'un fichier manquant se cacherait, parce
   qu'on ne regarde jamais le personnage qu'on n'utilise pas soi-même.
   Piège réel évité : l'âne n'a PAS d'ailes ; si on lui en déclarait, ce serait deux 404
   silencieux à chaque affichage. Le test l'exige explicitement. */
const localDe = (url) => 'lingua/' + url.replace('https://lingua.kd-mc.com/', '');
const LINGUA = (src.match(/var LINGUA = '([^']+)'/) || [])[1] || '';
chk(LINGUA === 'https://lingua.kd-mc.com/', `les dessins viennent de Lingua : ${LINGUA || '(introuvable)'}`);

const tableM = (src.match(/var MASCOTTES = \[([\s\S]*?)\n  \];/) || [])[1] || '';
const mascottes = [...tableM.matchAll(
  /\{\s*id:\s*'([a-z]+)',\s*rig:\s*'([^']+)',\s*live:\s*'([^']+)',\s*nom:\s*'([^']+)'[\s\S]*?pieces:\s*\[([^\]]*)\]/g
)].map((m) => ({ id: m[1], rig: m[2], live: m[3], nom: m[4],
  pieces: m[5].split(',').map((x) => x.trim().replace(/'/g, '')).filter(Boolean) }));
chk(mascottes.length === 2, `2 personnages proposés : ${mascottes.map((m) => m.nom).join(' + ') || '(aucun)'}`);
chk(mascottes.some((m) => m.id === 'bee') && mascottes.some((m) => m.id === 'donkey'),
  'les deux personnages de Lingua sont là : Bee et Bourricot');

const clips = ((src.match(/var CLIPS = \[([^\]]+)\]/) || [])[1] || '')
  .split(',').map((c) => c.trim().replace(/'/g, '')).filter(Boolean);
chk(clips.length >= 1, `clips déclarés : ${clips.join(', ') || '(aucun)'}`);
chk(clips.includes('idle'), 'le clip de repos « idle » existe (c\'est le repli de tous les autres)');

for (const M of mascottes) {
  const dossierRig = `lingua/${M.rig}/rig/`;
  const base = `${dossierRig}base.webp`;
  chk(existsSync(base), existsSync(base) ? `${M.nom} : dessin présent (${base})`
                                        : `${M.nom} : DESSIN ABSENT (404 garanti) : ${base}`);
  for (const piece of M.pieces) {
    const f = `${dossierRig}${piece}.webp`;
    chk(existsSync(f), existsSync(f) ? `${M.nom} : pièce « ${piece} » présente`
                                     : `${M.nom} : PIÈCE ABSENTE (404 garanti) : ${f}`);
  }
  for (const c of clips) {
    const f = `lingua/${M.live}/live/${c}.mp4`;
    chk(existsSync(f), existsSync(f) ? `${M.nom} : clip « ${c} » présent`
                                     : `${M.nom} : CLIP ABSENT (404 garanti) : ${f}`);
  }
}
const ane = mascottes.find((m) => m.id === 'donkey');
chk(ane && ane.pieces.length === 0,
  "l'âne n'a pas d'ailes déclarées (lui en donner = 2 images inexistantes chargées à chaque fois)");
chk(/\.bee-rig\[data-mascot="donkey"\]/.test(src),
  "l'âne a SA géométrie (yeux et bouche mesurés sur SON dessin, pas ceux de l'abeille)");
chk(/javis_mascotte/.test(src), 'le choix du personnage est retenu d\'une fois sur l\'autre');
chk(/javis-mpick/.test(src), 'le choix se fait à un doigt depuis le panneau');

/* --- 4. la discipline de repli est bien dans le code, pas juste promise ---- */
chk(/canplay/.test(src), 'la vidéo ne s\'affiche qu\'après « canplay » (jamais de trou noir)');
chk(/VID\.pret = false/.test(src), 'échec du clip de repos → retour marionnette, pas d\'écran vide');
chk(/VID\.absent\[m\[1\]\] = 1/.test(src), 'un clip manquant ne tue que CE mouvement-là');
chk(/if \(clip\(rig, kind/.test(src), 'les mouvements essaient la vraie vidéo avant la marionnette');
chk(/BEE_TTS = 'https:\/\/lingua\.kd-mc\.com/.test(src),
  'sa voix vient du domaine (aucun service tiers, aucune clé côté page)');
chk(/crossOrigin = 'anonymous'/.test(src),
  "la voix est demandée en crossOrigin — SANS ça l'analyse du son rend du silence et la bouche ne bouge pas");
chk(/AC\.state !== 'running'/.test(src),
  "moteur audio pas réveillé → on ne détourne PAS le son (sinon iPhone muet), la bouche bat en CSS");
chk(/function voixTelephone/.test(src),
  'voix du domaine injoignable → repli voix du téléphone, jamais muette');
chk(/maxR < 0\.012/.test(src),
  'amplitude plate (codec limité) → repli bouche en rythme, jamais une bouche figée');
chk(/j\.verified === true && j\.admin === true/.test(src),
  'visibilité fail-CLOSED : Bee n\'apparaît que pour Kevin, Face ID prouvé');

/* --- verdict --------------------------------------------------------------- */
R.ok.forEach((m) => console.log('  ✅', m));
R.ko.forEach((m) => console.log('  ❌', m));
console.log(`\n${R.ok.length} contrôles OK, ${R.ko.length} échec(s)`);
process.exit(R.ko.length ? 1 : 0);
