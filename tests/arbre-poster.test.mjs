#!/usr/bin/env node
/* Garde permanente — Poster grand format de l'arbre (arbre/index.html, v3.15).
   Hors ligne, 0 dépendance, < 1 s. Vérifie que la fonction existe, qu'elle est CÂBLÉE (Declaration ≠ Deployment),
   que la version de l'app et celle du cache hors-ligne sont identiques, et que les données de personnes
   passent par esc() dans le bloc poster (XSS). La vérification en vrai navigateur est dans
   tools/arbre/verify-poster.mjs (Playwright).
   Usage : node tests/arbre-poster.test.mjs [--fichier arbre/index.html] */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argFile = (() => { const i = process.argv.indexOf('--fichier'); return i > 0 ? path.resolve(process.argv[i + 1]) : path.join(ROOT, 'arbre', 'index.html'); })();
const html = fs.readFileSync(argFile, 'utf8');
const sw = fs.readFileSync(path.join(path.dirname(argFile), 'sw.js'), 'utf8');

const fails = [];
function ok(cond, label, detail) { console.log((cond ? '  ✅ ' : '  ❌ ') + label + (detail ? ' — ' + detail : '')); if (!cond) fails.push(label); }

// 1. version app == version du cache hors-ligne (sinon l'iPhone garde l'ancienne version)
const appVer = (html.match(/var APP_VER="([^"]+)"/) || [])[1];
const cacheVer = (sw.match(/var CACHE = "arbre-([^"]+)"/) || [])[1];
ok(appVer && appVer === cacheVer, 'APP_VER == CACHE du service worker', `${appVer} / ${cacheVer}`);

// 2. le bloc poster : de son en-tête jusqu'à renderTools
const a = html.indexOf('POSTER GRAND FORMAT'); const b = html.indexOf('function renderTools(){');
ok(a > 0 && b > a, 'Bloc « POSTER GRAND FORMAT » présent avant renderTools');
const block = a > 0 && b > a ? html.slice(a, b) : '';

// 3. les fonctions existent
for (const fn of ['posterBuild', 'posterCompose', 'posterTilesSVG', 'posterAssemblySVG', 'openPoster', 'posterPrint', 'posterPrintTiles', 'posterDownloadSVG', 'posterDownloadPNG', 'posterThumbs', '_posterPaper', '_posterInfoHTML']) {
  ok(new RegExp('function ' + fn + '\\(').test(block), `function ${fn}() définie`);
}
// 4. et elles sont CÂBLÉES (une fonction définie mais jamais appelée = code mort, erreur #28)
ok(/id="btnPrint"[^]*?onclick=exportPrint/.test(html) && /function exportPrint\(\)\{openPoster\(\);\}/.test(html), 'Bouton Outils « Poster grand format » → openPoster()');
ok(/data-z="print"/.test(html) && /b\.dataset\.z==="print"\)openPoster\(\)/.test(html), 'Bouton 🖨 de la vue Arbre → openPoster()');
ok(/\$\("#poPrint",ov\)\.onclick=posterPrint;\$\("#poTiles",ov\)\.onclick=posterPrintTiles;\$\("#poSvg",ov\)\.onclick=posterDownloadSVG;\$\("#poPng",ov\)\.onclick=posterDownloadPNG/.test(block), 'Les 4 sorties sont branchées dans la feuille');
// 5. formats : du A4 au A0, orientation automatique, page CSS injectée à l'impression
for (const p of ['A4', 'A3', 'A2', 'A1', 'A0', 'B0']) ok(new RegExp(p + ':\\[\\d+,\\d+\\]').test(block), `Format ${p} déclaré`);
for (const p of ['L100', 'L150', 'L200']) ok(new RegExp(p + ':\\[\\d+,0\\]').test(block), `Bannière ${p.slice(1)} cm déclarée (hauteur automatique)`);
ok(/orient:"bannière"/.test(block), 'Bannière : hauteur = celle de l\'arbre, aucun blanc perdu');
ok(/@page\{size:'\+pr\.pp\.wmm\+'mm '\+pr\.pp\.hmm\+'mm;margin:0\}/.test(block) && /@page\{size:A4 portrait;margin:0\}/.test(block), 'Taille de page injectée en mm : poster au format choisi (bannières comprises), mosaïque en A4');
ok(/portrait\?"portrait":"paysage"/.test(block), 'Orientation automatique (celle qui donne le plus grand dessin)');
// 6. mosaïque : marge 10 mm, recouvrement 10 mm, feuille numérotée + plan de montage
ok(/TW=190,TH=277,OV=10/.test(block) && /Feuille '\+i\+' \/ '\+N/.test(block) && /Plan de montage/.test(block), 'Mosaïque A4 : 10 mm de marge, 10 mm de recouvrement, feuilles numérotées, plan de montage');
// 7. photos : vignettes 96 px, jamais la photo pleine taille ; image HD plafonnée (iPhone)
ok(/var S=96,cv=document\.createElement\("canvas"\)/.test(block), 'Photos réduites en vignettes 96 px');
ok(/MAXPX=16e6/.test(block), 'Image HD plafonnée à 16 Mpx (limite canvas iPhone)');
// 8. XSS : toute donnée de personne écrite dans le SVG passe par esc() ou _fitText() (qui appelle esc)
const raw = block.match(/'\s*\+\s*(p\.(nom|prenom)|full\(p\)|sub|b\.label|lab|pr\.title)\s*\+\s*'</g) || [];
ok(raw.length === 0, 'Aucune donnée de personne écrite brute dans le SVG (esc/_fitText partout)', raw.length ? raw.slice(0, 3).join(' | ') : `${(block.match(/esc\(/g) || []).length} appels à esc()`);
ok(/function _fitText[^]*?esc\(txt\)/.test(block), '_fitText échappe son texte');
// 9. l'outil de vérification réelle existe
ok(fs.existsSync(path.join(ROOT, 'tools', 'arbre', 'verify-poster.mjs')), 'tools/arbre/verify-poster.mjs présent (vérification en vrai navigateur)');

console.log(fails.length ? `\n❌ arbre-poster : ${fails.length} échec(s)` : `\n✅ arbre-poster : ${appVer} — poster grand format défini, câblé, formats A4→A0, mosaïque, XSS ok`);
process.exit(fails.length ? 1 : 0);
