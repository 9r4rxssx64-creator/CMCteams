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
    /* Lignée olivier : les racines naissent en Principauté (lieu fictif « Monaco ») → badge ◆ + règne vérifiables (v3.18) */
    const root = add({ id: key + '_g0_1', prenom: key === 'o' ? 'Olivier-A1' : 'Chêne-A1', nom: noms[0], sexe: 'M', naissance: { date: '1.01.' + annee0, lieu: key === 'o' ? 'Monaco' : 'Ville-Test' }, deces: { date: '1.01.' + (annee0 + 80), lieu: 'Ville-Test' } });
    const rootC = add({ id: key + '_g0_2', prenom: key === 'o' ? 'Olivia-A2' : 'Chênette-A2', nom: noms[1], sexe: 'F', naissance: { date: '1.01.' + (annee0 + 2), lieu: key === 'o' ? 'Monte-Carlo' : 'Ville-Test' }, deces: { date: '1.01.' + (annee0 + 85), lieu: key === 'o' ? 'Monaco' : 'Ville-Test' } });
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
  /* PERSONNES DÉTACHÉES — une par cause, pour que la section « 🔗 À relier » de l'app
     (v3.19) soit vérifiable en vrai navigateur au lieu d'être supposée. Sans elles la
     fixture n'a AUCUN isolé : le code d'affichage des détachés ne serait jamais exécuté
     par les gardes, donc jamais prouvé (leçon #103 : ne rien vérifier ressemble à OK).
     Les 4 causes que relierPourquoi() doit distinguer : */
  /* 1. « fiche du parent introuvable » — la mère est renseignée mais n'existe pas dans
        la base : le lien est perdu dans les DEUX arbres. C'est le seul VRAI défaut. */
  add({ id: 'iso_fantome', prenom: 'Isolée-F1', nom: 'MAIFFRET', sexe: 'F', mere: 'personne_supprimee_xyz', naissance: { date: '6.06.1962', lieu: 'Ville-Test' } });
  /* 2. « aucun lien renseigné » — personne ne sait encore où la placer. */
  add({ id: 'iso_seul', prenom: 'Isolé-S1', nom: 'MOLINARIO', sexe: 'M', naissance: { date: '7.07.1948', lieu: 'Ville-Test' } });
  /* 3. « couple sans parents ni enfants » — mariés, mais rattachés à rien. */
  const isoA = add({ id: 'iso_couple_1', prenom: 'Isolé-C1', nom: 'VIRGILI', sexe: 'M', naissance: { date: '8.08.1955', lieu: 'Ville-Test' } });
  const isoB = add({ id: 'iso_couple_2', prenom: 'Isolée-C2', nom: 'BOSCH', sexe: 'F', naissance: { date: '9.09.1957', lieu: 'Ville-Test' } });
  couple(isoA, isoB);
  /* 4. « relié dans l'autre arbre » — son père est un DESARZENS (chêne) : dans la vue
        olivier le lien est coupé par le filtre, alors qu'elle est bien reliée à côté. */
  add({ id: 'iso_autrefam', prenom: 'Isolée-A1', nom: 'SAUVAIGO', sexe: 'F', pere: 'c_g1_0_0', naissance: { date: '10.10.1984', lieu: 'Ville-Test' } });
  /* 5. UNE BRANCHE SÉPARÉE — le cas le plus fréquent et le plus invisible : une mère et
        sa fille sont bien reliées ENTRE ELLES, mais leur petit groupe ne touche pas le
        tronc (les parents de la mère ne sont pas encore renseignés). L'arbre l'affichait
        avec le même bandeau que le tronc principal : rien ne disait que ces deux-là
        flottaient à côté. C'est la situation signalée le 10.09.2026
        (aucun prénom réel ici : le garde arbre-prive les refuse, commentaires compris). */
  const brMere = add({ id: 'branche_mere', prenom: 'Branche-M1', nom: 'MAIFFRET', sexe: 'F', naissance: { date: '11.11.1938', lieu: 'Ville-Test' } });
  add({ id: 'branche_fille', prenom: 'Branche-F1', nom: 'MAIFFRET', sexe: 'F', mere: brMere, naissance: { date: '12.12.1966', lieu: 'Ville-Test' }, vivant: true });
  return { persons, meta: { updatedAt: t } };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const fx = fixture();
  if (process.argv.includes('--json')) console.log(JSON.stringify(fx));
  else console.log(`Famille synthétique : ${Object.keys(fx.persons).length} personnes (0 donnée réelle).`);
}
