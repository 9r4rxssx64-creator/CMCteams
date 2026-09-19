#!/usr/bin/env node
/* ============================================================================
 * EMPREINTES DES DONNÉES DE PLANNING — « ce qui est livré vient-il des PDF ? »
 * ----------------------------------------------------------------------------
 * Kevin 2026-09-19 : « Fais CMCteams et light à jour en priorité, des personnes
 * s'en servent pour le travail. »
 *
 * Les deux surfaces n'affichent PAS le PDF : elles affichent deux fichiers
 * fabriqués à partir de lui (`planning-seed.js` pour l'app, `boards-gen.js`
 * pour la page Départs). Entre le PDF et l'écran de l'employé, il y a donc une
 * étape manuelle : relancer les générateurs.
 *
 * Ce qui n'était surveillé par PERSONNE : que les fichiers livrés soient encore
 * ceux que les PDF produisent. Le garde de parité compare les deux GÉNÉRATEURS
 * entre eux — il passe au vert même si les deux fichiers livrés datent d'un
 * mois. Un PDF corrigé et non régénéré, ou un seul côté régénéré, et un employé
 * travaille sur un planning périmé sans que rien ne soit rouge.
 *
 * Plutôt que de tout refabriquer à chaque contrôle (long), on note l'empreinte
 * de chaque pièce. Si un PDF ou un générateur change sans que le fichier livré
 * change, c'est que la régénération a été oubliée.
 *
 *   node tools/shared/_empreintes-donnees.mjs --ecrire   (après régénération)
 *   node tools/shared/_empreintes-donnees.mjs            (affiche l'état)
 * ========================================================================== */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

export const FICHIER = 'tools/shared/donnees-empreintes.json';

/** Les pièces qui décident du contenu affiché aux employés. */
export const PIECES = {
  pdf: [
    'tests/fixtures/juillet-2026-v2.pdf',
    'tests/fixtures/aout-2026-v2.pdf',
    'tests/fixtures/septembre-2026-v2.pdf',
    'tests/fixtures/octobre-2026.pdf',
  ],
  generateurs: [
    'tools/shared/_gen-seed.mjs',
    'tools/departs/_gen-boards.mjs',
  ],
  livres: [
    'tools/shared/planning-seed.js',
    'tools/departs/boards-gen.js',
  ],
};

/* Le seed porte la version de l'app qui l'a produit (`"parser":"v9.xxx"`), et cette
   version doit suivre APP_VER — c'est une autre garde qui l'exige (test:seed-remplace).
   Résultat : une simple montée de version fait changer le fichier sans qu'aucune DONNÉE
   de planning n'ait bougé, et ce contrôle-ci criait « modifié à la main ».
   On empreinte donc ce qui compte : le planning lui-même, l'estampille mise de côté.
   (Leçon #295 : un faux rouge se corrige en rapprochant la garde de la réalité.) */
const SANS_ESTAMPILLE = /"parser":"v[0-9.]*"/g;

export function empreinte(chemin) {
  if (!existsSync(chemin)) return null;
  let contenu = readFileSync(chemin);
  if (/\.js$/.test(chemin)) contenu = Buffer.from(contenu.toString('utf8').replace(SANS_ESTAMPILLE, '"parser":"-"'), 'utf8');
  return createHash('sha256').update(contenu).digest('hex').slice(0, 16);
}

export function etatActuel() {
  const out = {};
  for (const groupe of Object.keys(PIECES)) {
    out[groupe] = {};
    for (const f of PIECES[groupe]) out[groupe][f] = empreinte(f);
  }
  return out;
}

if (process.argv[1] && process.argv[1].endsWith('_empreintes-donnees.mjs')) {
  const etat = etatActuel();
  if (process.argv.includes('--ecrire')) {
    writeFileSync(FICHIER, JSON.stringify({
      _note: "Empreintes des PDF, des générateurs et des fichiers livrés aux employés. "
        + "Régénéré par : node tools/shared/_gen-seed.mjs && node tools/departs/_gen-boards.mjs "
        + "&& node tools/shared/_empreintes-donnees.mjs --ecrire",
      _date: new Date().toISOString().slice(0, 10),
      ...etat,
    }, null, 2) + '\n');
    console.log(`✅ ${FICHIER} mis à jour`);
  } else {
    console.log(JSON.stringify(etat, null, 2));
  }
}
