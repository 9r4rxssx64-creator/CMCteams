#!/usr/bin/env node
/* ============================================================================
 * GARDE — « le planning affiché aux employés vient-il encore des PDF ? »
 * ----------------------------------------------------------------------------
 * Kevin 2026-09-19 : « Fais CMCteams et light à jour en priorité, des
 * personnes s'en servent pour le travail. »
 *
 * TROU MESURÉ CE JOUR-LÀ : `test:parite-cmcteams-light` compare les deux
 * GÉNÉRATEURS entre eux (mêmes PDF, mêmes mois, mêmes effectifs) — il passe
 * donc au vert même si les DEUX fichiers réellement livrés datent d'un mois.
 * Entre le PDF et l'écran de l'employé, il y a une étape à la main : relancer
 * les générateurs. Rien ne vérifiait qu'elle avait été faite.
 *
 * Conséquence possible, et invisible : un PDF corrigé (ou un générateur
 * amélioré) sans régénération → un croupier lit un planning périmé, et aucun
 * contrôle n'est rouge.
 *
 * MÉTHODE : on ne refabrique pas tout (c'est long). On compare les empreintes.
 *  · un PDF ou un générateur a changé, mais PAS le fichier livré → régénération
 *    oubliée : le planning affiché n'est plus celui des PDF.
 *  · le fichier livré a changé sans que rien d'autre ne bouge → il a été
 *    modifié à la main (les deux fichiers portent « NE PAS éditer à la main »).
 *
 * C'est fiable parce que les générateurs sont REPRODUCTIBLES — mêmes PDF,
 * même sortie à l'octet près (garde `generateurs-reproductibles.test.mjs`).
 *
 *   npm run test:donnees-a-jour
 * ========================================================================== */

import { readFileSync, existsSync } from 'node:fs';
import { etatActuel, FICHIER, PIECES } from '../tools/shared/_empreintes-donnees.mjs';

let ok = 0, ko = 0;
const T = (nom, cond, detail = '') => {
  if (cond) { ok++; console.log('  ✅ ' + nom); }
  else { ko++; console.log('  ❌ ' + nom + (detail ? '\n       ' + detail : '')); }
};

console.log('== Le planning livré vient-il encore des PDF ? ==\n');

if (!existsSync(FICHIER)) {
  console.error(`❌ ${FICHIER} absent — je ne peux RIEN conclure.`);
  console.error('   Le créer : node tools/shared/_empreintes-donnees.mjs --ecrire');
  process.exit(2);
}
const attendu = JSON.parse(readFileSync(FICHIER, 'utf8'));
const actuel = etatActuel();

/* Un fichier disparu fausserait tout : on refuse de conclure plutôt que de
   rassurer à tort (leçon #103, le faux vert). */
const manquants = [];
for (const g of Object.keys(PIECES)) for (const f of PIECES[g]) if (actuel[g][f] === null) manquants.push(f);
if (manquants.length) {
  console.error('❌ MESURE IMPOSSIBLE : fichier(s) introuvable(s) :');
  for (const f of manquants) console.error('   · ' + f);
  process.exit(2);
}

const change = (g, f) => attendu[g] && attendu[g][f] !== actuel[g][f];
const sourcesModifiees = [
  ...PIECES.pdf.filter((f) => change('pdf', f)).map((f) => ({ f, quoi: 'PDF' })),
  ...PIECES.generateurs.filter((f) => change('generateurs', f)).map((f) => ({ f, quoi: 'générateur' })),
];
const livresModifies = PIECES.livres.filter((f) => change('livres', f));

console.log(`  ${PIECES.pdf.length} PDF · ${PIECES.generateurs.length} générateurs · ${PIECES.livres.length} fichiers livrés\n`);

T('le planning livré correspond aux PDF (aucune régénération en attente)',
  sourcesModifiees.length === 0 || livresModifies.length === PIECES.livres.length,
  sourcesModifiees.length
    ? `${sourcesModifiees.map((s) => s.quoi + ' modifié : ' + s.f).join(' · ')}\n       `
      + `→ RELANCER LES DEUX, puis noter les empreintes :\n       `
      + `node tools/shared/_gen-seed.mjs && node tools/departs/_gen-boards.mjs \\\n         `
      + `&& node tools/shared/_empreintes-donnees.mjs --ecrire`
    : '');

T('aucun fichier de planning modifié à la main',
  livresModifies.length === 0 || sourcesModifiees.length > 0,
  livresModifies.length
    ? `${livresModifies.join(' · ')} a changé alors qu'aucun PDF ni générateur n'a bougé.\n       `
      + `Ces fichiers portent « NE PAS éditer à la main » : ils se régénèrent.`
    : '');

/* Les DEUX surfaces bougent ENSEMBLE (règle « CMCteams ET light, toujours les
   deux »). Un seul côté régénéré = divergence silencieuse. */
T('les deux surfaces ont été régénérées ensemble',
  livresModifies.length === 0 || livresModifies.length === PIECES.livres.length,
  livresModifies.length === 1
    ? `un seul côté régénéré : ${livresModifies[0]}. L'autre surface reste sur d'anciennes données.`
    : '');

console.log(`\n=== ${ok} OK / ${ko} FAIL ===`);
if (ko) {
  console.log('\nCe contrôle protège ce que les employés lisent vraiment :');
  console.log('entre le PDF et leur écran, la régénération est une étape à la main.');
}
process.exit(ko ? 1 : 0);
