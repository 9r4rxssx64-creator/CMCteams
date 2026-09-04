#!/usr/bin/env node
/* ============================================================================
 * LES DÉCÈS QUE L'ARBRE NE CONNAÎT PAS — fichier INSEE, accès libre
 * ----------------------------------------------------------------------------
 * L'arbre contient 102 personnes, mais une famille en compte bien plus : des
 * grands-oncles, des cousins, des branches perdues de vue. Or c'est justement
 * une personne qu'on a perdue de vue qui peut avoir souscrit une assurance vie
 * en désignant « mes neveux » — et personne ne réclame.
 *
 * Ce script interroge l'API publique matchID (deces.matchid.io), qui expose le
 * fichier officiel des personnes décédées de l'INSEE (open data, 1970→aujourd'hui).
 * C'est une API prévue pour ça : pas de scraping, pas de compte, pas de captcha.
 *
 * Il cherche par NOM DE FAMILLE — les noms sont lus dans l'arbre, jamais recopiés
 * ici (le dépôt est public). Pour chaque décès trouvé, il dit s'il est DÉJÀ dans
 * l'arbre ou s'il est NOUVEAU, et si la piste vaut la peine (prescription 30 ans).
 *
 * Il ne peut pas tourner depuis la machine de l'agent (pare-feu) : sa place est
 * le runner GitLab, comme les recherches Ciclade.
 *
 * Lancer : node tools/patrimoine/deces-insee.mjs [--nom SAUVAIGO] [--max 5]
 * ========================================================================== */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { lireArbre, RACINE, anneeDe } from './lire-arbre.mjs';

const SORTIE = join(RACINE, 'patrimoine-resultats');
const API = 'https://deces.matchid.io/deces/api/v1/search';
const PAUSE_MS = 1500;
const CETTE_ANNEE = new Date().getFullYear();

const arg = (n, d = null) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const MAX = +(arg('--max', 0)) || 0;

mkdirSync(SORTIE, { recursive: true });

/* --- les noms de famille de la lignée, lus dans l'arbre -------------------- */
const arbre = Object.values(lireArbre());
const nomsFamille = [...new Set(arbre.map((p) => (p.nom || '').trim().toUpperCase()).filter((n) => n.length >= 3))];
const unNom = arg('--nom');
const cibles = unNom ? [unNom.toUpperCase()] : (MAX ? nomsFamille.slice(0, MAX) : nomsFamille);

/* --- ce que l'arbre connaît déjà, pour ne signaler que le NOUVEAU ---------- */
const connus = new Set(arbre.map((p) => {
  const a = anneeDe(p.deces?.date);
  return `${(p.nom || '').toUpperCase()}|${(p.prenom || '').toUpperCase().split(/[\s-]/)[0]}|${a || ''}`;
}));

const dejaConnu = (nom, prenom, annee) =>
  connus.has(`${nom.toUpperCase()}|${(prenom || '').toUpperCase().split(/[\s-]/)[0]}|${annee || ''}`);

/* --- interrogation --------------------------------------------------------- */

async function chercherNom(nom) {
  const url = `${API}?lastName=${encodeURIComponent(nom)}&size=200`;
  const r = await fetch(url, { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  const hits = (j?.response?.persons) || j?.persons || [];
  return hits.map((h) => {
    const d = h.death || {};
    const n = h.name || {};
    const annee = +String(d.date || '').slice(0, 4) || null;
    return {
      nom: (Array.isArray(n.last) ? n.last[0] : n.last) || nom,
      prenom: (Array.isArray(n.first) ? n.first.join(' ') : n.first) || '',
      naissance: h.birth?.date || '',
      lieuNaissance: h.birth?.location?.city || '',
      deces: d.date || '',
      lieuDeces: d.location?.city || '',
      age: h.age || null,
      annee,
      ans: annee ? CETTE_ANNEE - annee : null,
    };
  });
}

/* Certains noms de l'arbre sont très répandus (BRUNO, GOMEZ, MATHIEU…) : les
   interroger sans filtre remonterait des milliers d'homonymes sans aucun lien.
   Au-delà d'un certain nombre de résultats, on ne garde que la géographie
   RÉELLE de la famille — Alpes-Maritimes, Monaco, Var, Bouches-du-Rhône —, et
   on l'écrit dans le rapport pour que la restriction soit visible, pas cachée. */
const SEUIL_HOMONYMES = 40;
const REGION = /(06\d{3}|alpes-maritimes|nice|villefranche|beaulieu|cagnes|antibes|cannes|menton|monaco|99138|83\d{3}|var\b|ramatuelle|13\d{3}|marseille|salon)/i;
const proche = (h) => REGION.test(`${h.lieuDeces} ${h.lieuNaissance}`);

const tout = [];
const erreurs = [];
const restreints = [];
console.log(`Noms de famille lus dans l'arbre : ${cibles.length}`);

for (const nom of cibles) {
  try {
    const hits = await chercherNom(nom);
    let nouveaux = hits.filter((h) => !dejaConnu(h.nom, h.prenom, h.annee));
    if (nouveaux.length > SEUIL_HOMONYMES) {
      const avant = nouveaux.length;
      nouveaux = nouveaux.filter(proche);
      restreints.push(`${nom} (${avant} → ${nouveaux.length})`);
    }
    /* seules les pistes non prescrites valent un courrier */
    const utiles = nouveaux.filter((h) => h.ans !== null && h.ans <= 30);
    console.log(`  ${nom.padEnd(16)} ${String(hits.length).padStart(4)} décès · ${String(nouveaux.length).padStart(4)} absents de l'arbre · ${String(utiles.length).padStart(3)} exploitables (≤30 ans)`);
    tout.push(...utiles.map((h) => ({ ...h, recherche: nom })));
  } catch (e) {
    erreurs.push(`${nom} : ${e.message}`);
    console.log(`  ${nom.padEnd(16)} ⚠️ ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, PAUSE_MS));
}

tout.sort((a, b) => (b.annee || 0) - (a.annee || 0));
writeFileSync(join(SORTIE, 'deces-insee.json'), JSON.stringify({ quand: new Date().toISOString(), erreurs, trouves: tout }, null, 2));

let md = `# Décès trouvés au fichier INSEE, absents de l'arbre\n\n`;
md += `Le ${new Date().toLocaleString('fr-FR')} · ${cibles.length} nom(s) de famille interrogé(s)\n\n`;
md += `Le fichier de l'INSEE couvre les décès **depuis 1970**. Ne sont listés ici que\n`;
md += `ceux qui **ne sont pas dans l'arbre** et dont le décès a **moins de 30 ans**\n`;
md += `(au-delà, les sommes non réclamées sont acquises à l'État).\n\n`;
if (erreurs.length) md += `⚠️ ${erreurs.length} nom(s) n'ont pas pu être interrogés : ${erreurs.join(' · ')}\n\n`;
if (restreints.length) {
  md += `🔎 **Noms trop répandus, restreints à la géographie de la famille** `;
  md += `(Alpes-Maritimes, Monaco, Var, Bouches-du-Rhône) : ${restreints.join(' · ')}. `;
  md += `Sans cette restriction, ces noms remontent des centaines d'homonymes sans lien.\n\n`;
}
if (!tout.length) {
  md += `**Aucun décès nouveau exploitable.** Ce n'est pas un échec : ça veut dire que\n`;
  md += `l'arbre est à jour sur les 30 dernières années pour ces noms.\n`;
} else {
  md += `| Nom | Prénom(s) | Né(e) le | Décès | Lieu | Il y a |\n|---|---|---|---|---|---|\n`;
  for (const h of tout) md += `| ${h.nom} | ${h.prenom} | ${h.naissance || '?'} | ${h.deces} | ${h.lieuDeces || '?'} | ${h.ans} ans |\n`;
  md += `\n**${tout.length} piste(s)**. Pour chacune, la même porte que pour les autres :\n`;
  md += `l'AGIRA cherche gratuitement si Kevin est bénéficiaire d'une assurance vie —\n`;
  md += `et l'AGIRA n'exige PAS d'être héritier.\n`;
}
writeFileSync(join(SORTIE, 'deces-insee.md'), md);
console.log(`\n${tout.length} piste(s) écrite(s) dans patrimoine-resultats/deces-insee.md`);
