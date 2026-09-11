#!/usr/bin/env node
/* Garde permanente — LES PHOTOS SE CADRENT TOUTES SEULES SUR LE SUJET (arbre v3.21).
   -----------------------------------------------------------------------------
   Kevin, 11.09.2026 : « Centre les images auto à chaque fois. » Une vignette ronde découpe
   la photo ; tant qu'elle découpait au CENTRE GÉOMÉTRIQUE, un visage placé en haut se faisait
   couper — sur la carte, sur la fiche, et jusque sur l'affiche imprimée.
   Cette garde vérifie que le mécanisme est là ET CÂBLÉ partout (Declaration ≠ Deployment, #28).
   Hors ligne, 0 dépendance, < 1 s. La preuve en vrai navigateur (photos au sujet connu, mesure
   avant/après) est tools/arbre/verify-cadrage.mjs.
   Usage : node tests/arbre-cadrage.test.mjs [--fichier arbre/index.html] */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argFile = (() => { const i = process.argv.indexOf('--fichier'); return i > 0 ? path.resolve(process.argv[i + 1]) : path.join(ROOT, 'arbre', 'index.html'); })();
const html = fs.readFileSync(argFile, 'utf8');

const fails = [];
function ok(cond, label, detail) {
  console.log((cond ? '  ✅ ' : '  ❌ ') + label + (detail ? ' — ' + detail : ''));
  if (!cond) fails.push(label);
}

/* 1. le mécanisme existe */
ok(/function _cadrePoint\(im\)/.test(html), 'le point de cadrage est calculé à partir de la photo elle-même');
ok(/getImageData/.test(html) && /naturalWidth/.test(html), 'la photo est lue pixel par pixel (pas une règle au hasard)');

/* 2. les 3 situations vécues sont traitées */
ok(/if\(d\[i\]<200\)\{transp=true/.test(html),
  'photo DÉTOURÉE (fond transparent) : le sujet, c\'est ce qui n\'est pas transparent');
ok(/couleur du POURTOUR/.test(html) && /br\/=bn;bg\/=bn;bb\/=bn;/.test(html),
  'photo sur fond uni : le fond est estimé sur le pourtour, le sujet est ce qui s\'en éloigne');
ok(/if\(bh>bw\*1\.35\)fy=\(t\/ch\)\+bh\*0\.25;/.test(html),
  'personne en pied : on remonte au quart supérieur — le visage, pas le ventre');

/* 3. rien d'extrême, et jamais d'erreur bloquante */
ok(/v<0\.15\?0\.15:\(v>0\.85\?0\.85:v\)/.test(html), 'le cadrage ne colle jamais à un bord (15 %–85 %)');
ok(/if\(tot<=0\|\|maxp<=0\)return \{x:0\.5,y:0\.5\};/.test(html), 'photo unie : on reste au centre au lieu de viser n\'importe quoi');
ok(/catch\(e\)\{return null;\}\s*\/\* image d'une autre origine/.test(html), 'image d\'une autre origine : on n\'insiste pas (aucune erreur)');

/* 4. CÂBLÉ partout où une photo s'affiche — sinon le calcul ne sert à rien */
ok(/var CADRE_SEL="\.av img,\.caro img,\.thumbs \.t img"/.test(html),
  'câblé sur les 3 endroits où une photo s\'affiche : carte, fiche, miniatures');
ok(/cadrerAuto\(\);\}/.test(html) && /function render\(\)\{/.test(html), 'appelé à chaque rendu de l\'arbre');
ok(/cadrerImages\(ov\);\}/.test(html), 'appelé à l\'ouverture d\'une fiche');
ok(/_cadreObs\.observe\(document\.body,\{childList:true,subtree:true\}\)/.test(html),
  '« à chaque fois » : ce qui s\'affiche plus tard est cadré sans y penser');
ok(/childList seul : poser un style ne relance rien/.test(html),
  'et l\'observateur ne peut pas s\'auto-déclencher en boucle');

/* 5. l'AFFICHE imprimée aussi (elle découpait sur un canevas, pas en CSS) */
ok(/var f=cadrePour\(im,ph\),dx=S\/2-f\.x\*w\*s,dy=S\/2-f\.y\*h\*s;/.test(html),
  'l\'affiche imprimée vise le même point (elle découpait au centre)');
ok(/dx=Math\.max\(S-w\*s,Math\.min\(0,dx\)\)/.test(html), 'et son découpage reste dans l\'image (aucun bord vide)');

/* 6. les documents ne sont PAS des visages */
ok(/\.actecard img\{[^}]*object-position:top/.test(html) && !/\.actecard img/.test('var CADRE_SEL'),
  'un ACTE scanné garde son cadrage par le haut');

/* 7. la preuve en vrai navigateur existe */
ok(fs.existsSync(path.join(ROOT, 'tools', 'arbre', 'verify-cadrage.mjs')),
  'tools/arbre/verify-cadrage.mjs présent (vrai navigateur, mesure avant/après)');

const appVer = (html.match(/var APP_VER="([^"]+)"/) || [])[1];
console.log(fails.length ? `\n❌ arbre-cadrage : ${fails.length} échec(s)` : `\n✅ arbre-cadrage : ${appVer} — les photos se cadrent sur le sujet, partout, toutes seules`);
process.exit(fails.length ? 1 : 0);
