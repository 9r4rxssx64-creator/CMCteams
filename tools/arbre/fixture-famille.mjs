#!/usr/bin/env node
/* Famille SYNTHÉTIQUE pour vérifier l'arbre en vrai navigateur SANS aucune donnée personnelle.
   Depuis la v3.16 (fait n°12), arbre/index.html ne contient plus personne : les vraies données vivent sur le
   domaine (KV du routeur) et sur les appareils. Les outils de vérification (verify-poster, verify-domaine)
   chargent donc cette famille inventée — même structure (pere/mere/conjoints, générations, deux lignées
   reconnues par les noms de la fonction famOf : SAUVAIGO·MAIFFRET côté olivier, DESARZENS côté chêne).
   Les prénoms sont des étiquettes (« Olivier-A1 »), les dates sont fictives et régulières.
   Usage : node tools/arbre/fixture-famille.mjs [--json]   ou   import { fixture } from './fixture-famille.mjs' */
import { fileURLToPath } from 'node:url';

export function fixture() {
  const persons = {};
  let t = 1700000000000;
  function add(o) {
    o.conjoints = o.conjoints || []; o.photos = []; o.sources = []; o.comments = []; o.updatedAt = ++t;
    persons[o.id] = o; return o.id;
  }
  function couple(a, b) { persons[a].conjoints.push(b); persons[b].conjoints.push(a); }
  const NOMS_O = ['SAUVAIGO', 'MAIFFRET', 'BOSCH', 'MOLINARIO', 'VIRGILI'];
  const NOMS_C = ['DESARZENS', 'DESARZENS', 'DESARZENS'];
  /* Une lignée : racine + conjoint, puis `larg` enfants par couple sur `gens` générations. */
  function lignee(key, noms, gens, larg, annee0) {
    const root = add({ id: key + '_g0_1', prenom: key === 'o' ? 'Olivier-A1' : 'Chêne-A1', nom: noms[0], sexe: 'M', naissance: { date: '1.01.' + annee0, lieu: 'Ville-Test' }, deces: { date: '1.01.' + (annee0 + 80), lieu: 'Ville-Test' } });
    const rootC = add({ id: key + '_g0_2', prenom: key === 'o' ? 'Olivia-A2' : 'Chênette-A2', nom: noms[1], sexe: 'F', naissance: { date: '1.01.' + (annee0 + 2), lieu: 'Ville-Test' }, deces: { date: '1.01.' + (annee0 + 85), lieu: 'Ville-Test' } });
    couple(root, rootC);
    let parents = [[root, rootC]];
    for (let g = 1; g < gens; g++) {
      const next = [];
      parents.forEach(([p, m], pi) => {
        const n = g === gens - 1 ? Math.max(1, larg - 1) : larg;
        for (let k = 0; k < n; k++) {
          const sexe = k % 2 ? 'F' : 'M';
          const id = `${key}_g${g}_${pi}_${k}`;
          const annee = annee0 + 28 * g + 3 * k;
          add({ id, prenom: `${key === 'o' ? 'Olivier' : 'Chêne'}-${String.fromCharCode(65 + g)}${pi}${k}`, nom: persons[p].nom, sexe, pere: p, mere: m, naissance: { date: `${1 + k}.0${1 + (g % 8)}.${annee}`, lieu: 'Ville-Test' }, vivant: annee > 1945, deces: annee > 1945 ? undefined : { date: `${1 + k}.0${1 + (g % 8)}.${annee + 75}`, lieu: 'Ville-Test' } });
          if (g < gens - 1 && k < 2) { /* les deux premiers enfants fondent un foyer */
            const cid = id + '_c';
            add({ id: cid, prenom: `Conjoint-${String.fromCharCode(65 + g)}${pi}${k}`, nom: noms[(g + k + 2) % noms.length], sexe: sexe === 'M' ? 'F' : 'M', naissance: { date: `2.02.${annee + 1}`, lieu: 'Autre-Ville-Test' }, vivant: annee > 1945 });
            couple(id, cid);
            next.push(sexe === 'M' ? [id, cid] : [cid, id]);
          }
        }
      });
      parents = next;
    }
    return root;
  }
  lignee('o', NOMS_O, 5, 3, 1900); // olivier : 5 générations
  lignee('c', NOMS_C, 4, 3, 1920); // chêne : 4 générations
  /* Un pont entre les deux lignées (comme dans une vraie famille) : un DESARZENS épouse une SAUVAIGO. */
  const pont = add({ id: 'pont_1', prenom: 'Pont-Z1', nom: 'DESARZENS', sexe: 'M', pere: 'c_g1_0_0', mere: 'c_g1_0_0_c', naissance: { date: '3.03.1978', lieu: 'Ville-Test' }, vivant: true });
  const pontC = add({ id: 'pont_2', prenom: 'Pont-Z2', nom: 'SAUVAIGO', sexe: 'F', pere: 'o_g2_0_0', mere: 'o_g2_0_0_c', naissance: { date: '4.04.1980', lieu: 'Ville-Test' }, vivant: true });
  couple(pont, pontC);
  add({ id: 'pont_3', prenom: 'Pont-Z3', nom: 'DESARZENS', sexe: 'M', pere: pont, mere: pontC, naissance: { date: '5.05.2008', lieu: 'Ville-Test' }, vivant: true });
  return { persons, meta: { updatedAt: t } };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const fx = fixture();
  if (process.argv.includes('--json')) console.log(JSON.stringify(fx));
  else console.log(`Famille synthétique : ${Object.keys(fx.persons).length} personnes (0 donnée réelle).`);
}
