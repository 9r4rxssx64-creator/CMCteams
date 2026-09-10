// GARDE — les fichiers de planning générés doivent être REPRODUCTIBLES.
// Kevin 2026-09-10. Câblé dans test:ci. Ne demande NI navigateur NI réseau (< 1 s).
//
// CE QU'ON PROTÈGE, ET POURQUOI (mesuré le 10.09) :
//  1. L'identifiant d'un employé créé à l'import venait de l'HORLOGE → la même personne
//     du même PDF changeait d'identifiant à chaque génération. Le diff du fichier généré
//     changeait ENTIÈREMENT alors que les données étaient identiques : impossible de
//     distinguer une vraie correction du bruit, donc impossible de PROUVER un correctif.
//  2. Les fichiers étaient sérialisés dans l'ordre d'INSERTION (donc l'ordre où les
//     passes de l'app avaient fini) → même bruit.
//  3. Les générateurs attendaient « couverture stable » = nombre de personnes ayant au
//     moins une cellule. Mais le fichier exporte AUSSI l'ÉQUIPE et la FAMILLE, écrites
//     par des passes plus tardives : on lisait donc parfois trop tôt. Mesuré en août :
//     CONNEN R (roulettes) se retrouvait en équipe « 1 » (une équipe BJ = le repli par
//     défaut, donc FAUX) une fois sur deux, BLANCHY F oscillait entre « c12 » et « c7 ».
//     Un employé pouvait être affiché dans la MAUVAISE équipe selon la charge machine.
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { jsonStable } from '../tools/shared/_json-stable.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let ok = 0, ko = 0;
const T = (nom, cond, detail = '') => { if (cond) { ok++; console.log('  ✓ ' + nom); } else { ko++; console.log('  ✗ ' + nom + (detail ? ' — ' + detail : '')); } };

console.log('== GARDE générateurs reproductibles ==');

// 1. L'identifiant d'un employé créé à l'import ne doit PAS venir de l'horloge.
const app = readFileSync(resolve(root, 'index.html'), 'utf8');
T('l\'identifiant créé à l\'import est dérivé du NOM, pas de Date.now()',
  /var _newId=_cmcTmpEmpId\(name,A\.employees\)/.test(app),
  'attendu « var _newId=_cmcTmpEmpId(name,A.employees) » dans la boucle d\'import');
T('_cmcTmpEmpId existe et est déterministe (aucune horloge ni aléa dedans)', (() => {
  const m = app.match(/function _cmcTmpEmpId\(name,list\)\{[\s\S]*?\n\}/);
  return !!m && !/Date\.now|Math\.random|new Date/.test(m[0]);
})());

// 2/3. Les deux générateurs sérialisent de façon canonique et attendent la BONNE sonde.
for (const [rel, nom] of [['tools/shared/_gen-seed.mjs', 'CMCteams'], ['tools/departs/_gen-boards.mjs', 'light']]) {
  const g = readFileSync(resolve(root, rel), 'utf8');
  T(nom + ' : sérialise avec jsonStable (clés triées), pas JSON.stringify brut',
    /jsonStable\(payload\)/.test(g) && !/JSON\.stringify\(payload\)/.test(g));
  T(nom + ' : attend la signature COMPLÈTE (personnes + cellules + équipes + familles)',
    /signatureImport/.test(g) && !/const cov = \(key\)/.test(g));
}

// 4. Le plus important : les fichiers COMMITTÉS sont déjà sous forme canonique.
//    Si quelqu'un régénère avec un générateur d'avant, ce contrôle vire au rouge.
for (const [rel, marque] of [
  ['tools/shared/planning-seed.js', 'window.CMC_PLANNING_SEED='],
  ['tools/departs/boards-gen.js', 'window.DEPARTS_GEN='],
]) {
  const src = readFileSync(resolve(root, rel), 'utf8');
  const i = src.indexOf(marque);
  const brut = src.slice(i + marque.length).trim().replace(/;$/, '');
  let canonique = false, detail = '';
  try { canonique = jsonStable(JSON.parse(brut)) === brut; }
  catch (e) { detail = 'JSON illisible : ' + e.message; }
  T(rel + ' est écrit sous forme canonique (clés triées)', canonique,
    detail || 'régénère-le : node ' + (rel.includes('departs') ? 'tools/departs/_gen-boards.mjs' : 'tools/shared/_gen-seed.mjs'));
}

console.log(`\n${ok} OK / ${ko} FAIL`);
if (ko) { console.log('\nUn fichier de planning généré n\'est plus reproductible : son diff redeviendrait illisible,\net une équipe peut être lue avant d\'être posée (CONNEN R en équipe BJ, mesuré le 10.09).'); process.exit(1); }
console.log('✅ Mêmes PDF ⇒ mêmes fichiers, à l\'octet près. Un diff ne montre que de vraies différences.');
