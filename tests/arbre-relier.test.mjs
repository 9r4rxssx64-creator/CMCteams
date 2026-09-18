#!/usr/bin/env node
/* Garde permanente — section « 🔗 À relier » de l'arbre (arbre/index.html, v3.19).
   ---------------------------------------------------------------------------------
   Kevin 10.09.2026 : « as-tu attribué les orphelins ? tous, chaque arbre ? organise au
   plus clair ». Avant, les personnes détachées tombaient dans UNE grille alphabétique
   intitulée « Autres membres · à relier » : ni le nombre, ni la cause, ni l'arbre
   concerné n'apparaissaient — donc rien ne se rattachait jamais.
   Hors ligne, 0 dépendance, < 1 s. Vérifie que le classement existe, qu'il est CÂBLÉ
   (Declaration ≠ Deployment, erreur #28), que les 4 causes sont distinctes, que le
   panneau des Réglages lit la MÊME source que l'arbre (leçon #142 : deux surfaces qui
   recalculent la même règle divergent), et que le compteur est écrit APRÈS la mise en
   page (sinon il affiche celui du rendu précédent).
   La vérification en vrai navigateur est tools/arbre/verify-relier.mjs.
   Usage : node tests/arbre-relier.test.mjs [--fichier arbre/index.html] */
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

/* 1. la fonction qui NOMME la cause existe */
ok(/function relierPourquoi\(/.test(html), 'relierPourquoi() : la cause du détachement est nommée, pas devinée');

/* 2. les 4 causes sont distinctes — les confondre, c'est chercher au mauvais endroit */
const causes = ['fantome', 'autrefam', 'couple', 'seul'];
const manquantes = causes.filter((c) => !new RegExp('code:"' + c + '"').test(html));
ok(manquantes.length === 0, 'les 4 causes sont distinguées', manquantes.length ? 'manque : ' + manquantes.join(', ') : causes.join(' · '));

/* 3. « fiche du parent introuvable » = le SEUL vrai défaut de données : un parent
      renseigné dont la fiche n'existe plus coupe le lien dans les DEUX arbres. */
ok(/par\.some\(function\(x\)\{return !P\(x\);\}\)/.test(html),
  'un parent renseigné dont la fiche a disparu est détecté (lien perdu dans les deux arbres)');

/* 4. le classement est CÂBLÉ dans la mise en page (pas une fonction morte) */
ok(/relierPourquoi\(x,inSet\)/.test(html), 'le classement est utilisé par la mise en page (Declaration ≠ Deployment)');
ok(/aRelierGroupes=groupes;/.test(html), 'la mise en page publie ses groupes (source unique pour le panneau)');
ok(/aRelierGroupes=\[\];aRelierBranches=\[\];\s*\/\* remis à zéro/.test(html),
  'groupes ET branches remis à zéro à chaque mise en page (sinon une famille hérite de la liste précédente)');

/* 5. un bandeau par cause ET par lignée, avec son compte */
ok(/"🔗 À relier · "/.test(html) && /g\.branche\+" — "\+g\.lab\+" \("\+g\.ids\.length\+"\)"/.test(html),
  'un bandeau par cause et par lignée, avec le nombre de personnes');
ok(/var grp=\{\},ordre=\{fantome:0/.test(html), 'la cause la plus grave est présentée en premier');

/* 6. le panneau des Réglages : présent, câblé, et il parle des DEUX arbres */
ok(/function relierHTML\(/.test(html) && /relierHTML\(\)\+/.test(html), 'panneau « À relier » présent ET câblé dans les Réglages');
ok(/\["o","c"\]\.forEach/.test(html), 'le panneau couvre les DEUX arbres, pas seulement celui affiché');
ok(/function aRelierDe\(k\)/.test(html), 'aRelierDe() rejoue la mise en page de l\'autre famille au lieu de recalculer la règle (leçon #142)');
ok(/data-relier/.test(html) && /b\.onclick=function\(\)\{openPerson\(b\.dataset\.relier\);\}/.test(html),
  'chaque nom du panneau ouvre la fiche de la personne (1 clic pour rattacher)');

/* 7. le compteur affiché est celui du rendu COURANT */
ok(/id="relierBadge"/.test(html) && /_rb\.textContent=_relierBadge\(\)/.test(html),
  'le compteur est écrit APRÈS la mise en page (jamais celui du rendu précédent)');
const iBadge = html.indexOf('_rb.textContent=_relierBadge()');
const iDraw = html.indexOf('setupPanZoom();drawStage(true);');
ok(iDraw > 0 && iBadge > iDraw, 'le compteur est bien écrit après drawStage(), pas avant', `drawStage@${iDraw} · badge@${iBadge}`);

/* 8. XSS : les noms passent par esc() dans le panneau */
ok(/esc\(full\(P\(id\)\)\)/.test(html) && /data-relier="'\+esc\(id\)\+'"/.test(html),
  'les noms et identifiants du panneau passent par esc()');

/* 8 bis. une famille reliée mais SÉPARÉE du tronc est nommée pour ce qu'elle est —
   c'est le cas le plus fréquent (une mère et sa fille qui flottent à côté de l'arbre)
   et il portait exactement le même bandeau que le tronc principal. */
ok(/"🔗 Branche à rattacher · "\+compLabel\(trees\[i\]\)/.test(html),
  'une branche séparée du tronc porte un bandeau distinct du tronc');
ok(/aRelierBranches\.push\(\{ids:trees\[i\]\.slice\(\),racines:racines/.test(html),
  'la branche séparée retient QUI rattacher (sa personne la plus ancienne)');
ok(/b\.racines\.length\?b\.racines:b\.ids/.test(html), 'le panneau propose d\'abord la personne à rattacher');

/* 8 ter. AJOUT D'UN ENFANT — l'autre parent n'est pré-rempli que s'il n'y a aucun doute.
   Avant, on prenait `conjoints[0]` : pour quelqu'un ayant eu DEUX unions, l'enfant était
   rattaché d'office au premier de la liste, une fois sur deux au mauvais parent, en
   silence. Un lien de famille faux se recopie et se transmet ; un champ vide se voit. */
ok(/var cj=\(par\.conjoints\|\|\[\]\)\.filter/.test(html) && /if\(cj\.length===1\)\{var s2=cj\[0\];/.test(html),
  'ajout d\'un enfant : l\'autre parent n\'est deviné que si la personne n\'a QU\'UN conjoint');

/* 9. l'outil de vérification réelle et la fixture qui l'exerce existent */
ok(fs.existsSync(path.join(ROOT, 'tools', 'arbre', 'verify-relier.mjs')), 'tools/arbre/verify-relier.mjs présent (vrai navigateur)');
const fixture = fs.readFileSync(path.join(ROOT, 'tools', 'arbre', 'fixture-famille.mjs'), 'utf8');
ok(/iso_fantome/.test(fixture) && /iso_seul/.test(fixture) && /iso_couple_1/.test(fixture) && /iso_autrefam/.test(fixture) && /branche_mere/.test(fixture),
  'la famille synthétique contient un cas par cause, branche séparée comprise (sinon ce code n\'est jamais exécuté)');

const appVer = (html.match(/var APP_VER="([^"]+)"/) || [])[1];
console.log(fails.length ? `\n❌ arbre-relier : ${fails.length} échec(s)` : `\n✅ arbre-relier : ${appVer} — détachés classés par cause et par lignée, comptés, listés dans les deux arbres`);
process.exit(fails.length ? 1 : 0);
