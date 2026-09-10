// Critère de STABILITÉ d'un import, partagé par les deux générateurs
// (tools/shared/_gen-seed.mjs et tools/departs/_gen-boards.mjs). Kevin 2026-09-10.
//
// POURQUOI. Les générateurs pilotent la vraie app : l'import déclenche plusieurs passes,
// dont une passe géométrique différée. Pour ne pas lire trop tôt, on attendait « deux
// lectures identiques » — mais la lecture ne regardait QUE la COUVERTURE, c'est-à-dire
// le nombre de personnes ayant au moins une cellule. Or le fichier généré exporte AUSSI
// l'ÉQUIPE (teamHistory) et la FAMILLE (familyHistory) de chaque personne, écrites par
// des passes PLUS TARDIVES. Résultat : la couverture se figeait, on lisait, et les
// équipes n'étaient pas encore toutes posées.
//
// MESURÉ le 10.09 sur AOÛT 2026, deux générations des MÊMES PDF :
//   · CONNEN R (U00052, roulettes) : équipe « 1 » (une équipe BJ — c'est le repli par
//     défaut du code, donc FAUX) dans un tirage, « r2 » (juste) dans l'autre ;
//   · BLANCHY F (U00250, baccara)  : équipe « c12 » puis « c7 », et sa famille absente
//     d'un tirage sur deux.
// Autrement dit : la MÊME source pouvait afficher un employé dans la MAUVAISE équipe,
// selon la charge de la machine au moment de la génération. C'est exactement ce que la
// règle « reproduction à l'identique » interdit.
//
// CE QUE ÇA FAIT. La signature couvre TOUT ce que le fichier exporte : personnes,
// cellules, équipes, familles. « Deux lectures identiques » veut enfin dire « plus rien
// ne bouge », et pas seulement « le nombre de personnes ne bouge plus ».
export function signatureImport(key) {
  const ov = (window.A && A.overrides && A.overrides[key]) || {};
  const ids = Object.keys(ov).filter(id => ov[id] && Object.keys(ov[id]).length > 0);
  let cellules = 0;
  for (const id of ids) cellules += Object.keys(ov[id]).length;
  let equipes = 0, familles = 0;
  for (const e of (window.A && A.employees) || []) {
    if (!e || !e.id) continue;
    if ((e.teamHistory || {})[key]) equipes++;
    if ((e.familyHistory || {})[key]) familles++;
  }
  return { n: ids.length, sig: ids.length + '/' + cellules + '/' + equipes + '/' + familles };
}
