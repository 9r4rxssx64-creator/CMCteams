#!/usr/bin/env node
/* Garde permanente — IMPORTER NE DOIT JAMAIS FAIRE PERDRE UNE PHOTO (arbre v3.20).
   ------------------------------------------------------------------------------
   Kevin envoie une photo de famille par message ; elle arrive sur son iPhone par un
   petit fichier à importer. Avant v3.20, l'import REMPLAÇAIT la fiche entière : ajouter
   une photo à quelqu'un lui faisait perdre ses autres photos, ses actes et ses
   commentaires — en silence. Pire : un export TEXTE (qui n'emporte jamais les photos)
   réimporté effaçait les photos prises sur le téléphone.
   Hors ligne, 0 dépendance, < 1 s. La vérification en vrai navigateur est
   tools/arbre/verify-photo-fusion.mjs (elle prouve aussi que la photo s'AFFICHE).
   Usage : node tests/arbre-photo-fusion.test.mjs [--fichier arbre/index.html] */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { appEnLigneSaitFusionner } from '../tools/arbre/app-en-ligne.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argFile = (() => { const i = process.argv.indexOf('--fichier'); return i > 0 ? path.resolve(process.argv[i + 1]) : path.join(ROOT, 'arbre', 'index.html'); })();
const html = fs.readFileSync(argFile, 'utf8');

const fails = [];
function ok(cond, label, detail) {
  console.log((cond ? '  ✅ ' : '  ❌ ') + label + (detail ? ' — ' + detail : ''));
  if (!cond) fails.push(label);
}

/* 1. la fusion existe ET elle est CÂBLÉE dans l'import (Declaration ≠ Deployment, #28) */
ok(/function fusionnerFiche\(lp,rp,fusion\)/.test(html), 'fusionnerFiche() : compléter une fiche sans la remplacer');
ok(/DB\.persons\[id\]=fusionnerFiche\(lp,rp,true\)/.test(html) && /DB\.persons\[id\]=fusionnerFiche\(lp,rp,false\)/.test(html),
  'l\'import l\'utilise dans les DEUX cas : complément ET remplacement');
ok(!/\{DB\.persons\[id\]=rp;add\+\+;\}/.test(html),
  'plus aucun remplacement brut de fiche à l\'import (l\'ancien défaut)');

/* 2. les listes qui portent le travail de Kevin sont fusionnées, jamais écrasées */
ok(/\["photos","docs","comments"\]\.forEach/.test(html),
  'photos, documents ET commentaires sont protégés — pas seulement les photos');
ok(/if\(!b\.length\)\{q\[c\]=a\.slice\(\);return;\}/.test(html),
  'le fichier n\'en parle pas → on GARDE celles de l\'appareil (cas de l\'export texte)');
ok(/var vus=\{\},out=\[\];/.test(html), 'réimporter le même fichier n\'ajoute pas la même photo deux fois');

/* 3. un champ vide veut dire « je ne sais pas », jamais « efface » */
ok(/if\(v===null\|\|v===undefined\|\|v===""\)continue;/.test(html),
  'un champ vide du fichier n\'efface pas la valeur connue');

/* 4. un complément pour quelqu'un d'ABSENT ne crée pas une carte sans nom */
ok(/if\(!lp&&\(fus\|\|rp\.fusion\)&&!rp\.prenom&&!rp\.nom\)\{ignor\+\+;continue;\}/.test(html),
  'complément visant quelqu\'un d\'absent : ignoré et COMPTÉ, pas de carte vide');
ok(/ignorée\(s\) : personne introuvable/.test(html), 'et l\'app le DIT (jamais un échec silencieux)');

/* 5. les restes d'un export texte ne deviennent pas des données */
ok(/delete q\.photoCount;delete q\.docCount;/.test(html), 'photoCount/docCount d\'un export ne polluent pas la fiche');

/* 6. l'outil qui prépare la photo + la vérification navigateur existent */
ok(fs.existsSync(path.join(ROOT, 'tools', 'arbre', 'photo-vers-fiche.mjs')), 'tools/arbre/photo-vers-fiche.mjs présent');
ok(fs.existsSync(path.join(ROOT, 'tools', 'arbre', 'verify-photo-fusion.mjs')), 'tools/arbre/verify-photo-fusion.mjs présent (vrai navigateur)');
const outil = fs.readFileSync(path.join(ROOT, 'tools', 'arbre', 'photo-vers-fiche.mjs'), 'utf8');
ok(/startsWith\(ROOT \+ path\.sep\)/.test(outil) && /Refusé : la sortie tomberait DANS le dépôt/.test(outil),
  'l\'outil REFUSE d\'écrire une photo de famille dans le dépôt (public)');
ok(/await importPhoto\(f\)/.test(outil),
  'la photo est traitée par la fonction MÊME de l\'app (pas un traitement réinventé)');

/* 7. le fichier doit être lisible par l'app QUI TOURNE SUR SON TÉLÉPHONE, pas par ma branche.
   Le 11.09.2026 j'ai envoyé à Kevin un fichier « fusion » alors que son app était en v3.18 :
   mesuré depuis sur la vraie page v3.18, elle aurait REMPLACÉ la fiche de son père par la photo
   seule (« (sans nom) », sans dates ni parents). L'app en ligne = origin/main. */
ok(/appEnLigneSaitFusionner\(\(\) => lireAppEnLigne\(ROOT\)\)/.test(outil)
  && /deploye\.connu && !deploye\.ok/.test(outil) && /process\.exit\(2\)/.test(outil),
  'l\'outil interroge l\'app EN LIGNE et REFUSE d\'écrire si elle ne sait pas fusionner');
/* et la réponse est VÉRIFIÉE sur du vrai code, pas seulement lue dans le fichier :
   une page d'avant la fusion doit être refusée, une page d'après acceptée. */
const vieux = '<script>var APP_VER="v3.18";function doImport(e){DB.persons[id]=rp;}</script>';
const neuf = '<script>var APP_VER="v3.20";function fusionnerFiche(lp,rp,fusion){}\nDB.persons[id]=fusionnerFiche(lp,rp,true);</script>';
const rVieux = appEnLigneSaitFusionner(() => vieux);
const rNeuf = appEnLigneSaitFusionner(() => neuf);
const rMuet = appEnLigneSaitFusionner(() => { throw new Error('pas de git'); });
ok(rVieux.connu && !rVieux.ok && rVieux.ver === 'v3.18',
  'une app en ligne d\'AVANT la fusion est reconnue comme dangereuse', rVieux.ver);
ok(rNeuf.connu && rNeuf.ok, 'une app en ligne qui fusionne est acceptée', rNeuf.ver);
ok(!rMuet.connu, 'sans git : on prévient (connu:false), on ne bloque pas l\'outil');

const appVer = (html.match(/var APP_VER="([^"]+)"/) || [])[1];
console.log(fails.length ? `\n❌ arbre-photo-fusion : ${fails.length} échec(s)` : `\n✅ arbre-photo-fusion : ${appVer} — une photo s'ajoute sans rien faire perdre`);
process.exit(fails.length ? 1 : 0);
