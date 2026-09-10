// Sérialisation JSON REPRODUCTIBLE pour les fichiers générés (planning-seed.js,
// boards-gen.js). Kevin 2026-09-10.
//
// POURQUOI. Les générateurs pilotent la vraie app dans un navigateur : l'ordre dans
// lequel les employés atterrissent dans A.employees dépend du déroulement des passes
// (remplissage géométrique, réseau, timing). En JavaScript, l'ordre des clés d'un objet
// suit l'ordre d'insertion → deux générations des MÊMES PDF donnaient deux fichiers
// DIFFÉRENTS alors que les données étaient identiques au code près.
// Conséquence mesurée le 10.09 : le diff d'un fichier généré était ILLISIBLE (tout le
// fichier changeait), donc impossible de prouver qu'un correctif de parser modifiait
// quoi que ce soit — j'ai perdu une passe entière là-dessus sur « AOÛT 2026, MOREL F ».
//
// CE QUE ÇA FAIT. Les clés d'objet sont triées ; l'ordre des TABLEAUX est laissé tel
// quel (il porte du sens : ordre d'affichage des personnes, des équipes). Résultat :
// mêmes PDF ⇒ fichier identique à l'octet près, et un diff ne montre QUE de vraies
// différences de données.
export function jsonStable(value) {
  return JSON.stringify(value, (k, v) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const out = {};
      for (const key of Object.keys(v).sort()) out[key] = v[key];
      return out;
    }
    return v;
  });
}
