#!/usr/bin/env node
/* ============================================================================
 * PATRIMOINE DORMANT — préparer les recherches d'argent non réclamé de la famille
 * ----------------------------------------------------------------------------
 * Kevin 2026-09-04 : « Vérifie auto si quelqu'un de ma famille, même décédé,
 * a une assurance vie, un compte, des biens, etc. »
 *
 * CE QUE CET OUTIL FAIT (tout, sauf le clic final)
 *   1. lit l'arbre familial réel (export privé de l'app dans patrimoine/arbre.json,
 *      ignoré par git — le fichier public n'en contient plus depuis la v3.16) ;
 *   2. classe qui vaut la peine d'être cherché, et dans quel ordre ;
 *   3. écrit, pour chaque personne, les champs EXACTS à saisir sur Ciclade ;
 *   4. écrit une LETTRE AGIRA prête à envoyer (assurance vie d'un défunt) ;
 *   5. repère les cas étrangers (Monaco, Suisse, Tchéquie) qui ne relèvent PAS
 *      des fichiers français, et donne la bonne porte pour chacun.
 *
 * CE QU'IL NE FAIT PAS, ET POURQUOI (honnêteté — leçon #131)
 *   Aucun de ces services n'a d'interface automatique. Ciclade et l'AGIRA
 *   exigent l'identité du demandeur ; l'AGIRA exige un acte de décès signé.
 *   Personne — ni moi ni un robot — ne peut interroger ces fichiers à la place
 *   de Kevin. Ce qui est automatisable, c'est TOUT LE RESTE : la liste, l'ordre,
 *   les champs, les lettres. C'est ce que fait ce script.
 *
 * CONFIDENTIALITÉ — IMPORTANT
 *   Le dépôt est publié en entier sur un site public. Les dossiers produits ici
 *   contiennent des données personnelles (noms, dates, filiations) : ils sont
 *   écrits dans « patrimoine/ », qui est IGNORÉ PAR GIT. Ne jamais les committer.
 *
 * Lancer :  node tools/patrimoine/chercher.mjs
 * ========================================================================== */

import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { lireArbre, sourceArbre, RACINE, anneeDe } from './lire-arbre.mjs';
const SORTIE = join(RACINE, 'patrimoine');
const AUJOURD_HUI = new Date();

/* La lecture de l'arbre vit dans lire-arbre.mjs : une seule copie, sinon les
   deux divergent le jour où l'arbre change de forme. */

/* --- 2. dates : l'arbre les écrit « 12.07.1912 », parfois avec une réserve -- */

function dateNette(txt) {
  const m = String(txt || '').match(/\b(\d{1,2})[./](\d{1,2})[./](\d{4})\b/);
  return m ? `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3]}` : null;
}
function incertain(txt) {
  return /probable|\?|~|vers |environ/i.test(String(txt || ''));
}

/* --- 3. quel pays, donc quelle porte -------------------------------------- */

const PAYS = [
  { test: /monaco/i, code: 'MC', nom: 'Monaco' },
  { test: /suisse|switzerland|gen[èe]ve|lausanne|vaud/i, code: 'CH', nom: 'Suisse' },
  { test: /tch[èe]que|tchequie|prague|czech/i, code: 'CZ', nom: 'République tchèque' },
  { test: /belgique|bruxelles/i, code: 'BE', nom: 'Belgique' },
  { test: /italie|italy|turin|g[êe]nes/i, code: 'IT', nom: 'Italie' },
];
/* Le pays qui compte est celui du DÉCÈS (c'est là que la succession s'ouvre),
   pas celui de la naissance : Marie-Joe est née à Monaco et morte en Tchéquie —
   confondre les deux enverrait Kevin frapper à la mauvaise porte. */
function paysDe(p) {
  const mort = PAYS.find((x) => x.test.test(p.deces?.lieu || ''));
  if (mort) return mort;
  if (p.deces?.lieu) return { code: 'FR', nom: 'France' };
  const naiss = PAYS.find((x) => x.test.test(p.naissance?.lieu || ''));
  return naiss ? { ...naiss, suppose: true } : { code: 'FR', nom: 'France' };
}
const an = (n) => `${n} an${n > 1 ? 's' : ''}`;

/* --- 4. les portes officielles, par situation ----------------------------- */
/* Les délais ci-dessous servent à ORDONNER, jamais à exclure quelqu'un :
   une recherche Ciclade est gratuite et prend 2 minutes, donc dans le doute
   on cherche. La prescription trentenaire est rappelée pour être honnête sur
   les chances, pas pour décider à la place de Kevin. */

function portes(p, mort, ans) {
  const l = [];
  const pays = paysDe(p);

  if (mort) {
    l.push({
      cle: 'AGIRA',
      titre: 'AGIRA — « suis-je bénéficiaire d\'une assurance vie ? »',
      gratuit: true,
      quand: 'à tout moment après le décès, sans limite de durée',
      comment: 'un courrier + une copie de l\'acte de décès. L\'AGIRA interroge TOUS les assureurs français ; ceux qui ont un contrat à ce nom doivent répondre sous 15 jours.',
      lien: 'https://www.agira.asso.fr/recherche-des-contrats-dassurance-vie-en-cas-de-deces/',
      lettre: true,
    });
    l.push({
      cle: 'CICLADE',
      titre: 'Ciclade (Caisse des Dépôts) — comptes et contrats oubliés',
      gratuit: true,
      quand: ans >= 3 ? `possible (décès il y a ${an(ans)})` : `probablement trop tôt (décès il y a ${an(ans)} — les avoirs n'y sont versés qu'à partir de 3 ans)`,
      comment: 'recherche en ligne gratuite avec nom, prénom et date de naissance.',
      lien: 'https://ciclade.caissedesdepots.fr/',
      priorite: ans >= 3 && ans <= 30,
    });
    l.push({
      cle: 'NOTAIRE',
      titre: 'FICOBA + FICOVIE — par un notaire (héritiers)',
      gratuit: false,
      quand: 'utile surtout dans les 10 ans qui suivent le décès',
      comment: 'FICOBA liste TOUS les comptes bancaires ouverts au nom du défunt, FICOVIE les contrats d\'assurance vie de plus de 7 500 €. Ces deux fichiers ne sont PAS consultables en ligne : ils passent par un notaire, ou par une demande d\'héritier à la DGFiP.',
      lien: 'https://www.service-public.fr/particuliers/vosdroits/F16094',
    });
  } else {
    l.push({
      cle: 'CICLADE',
      titre: 'Ciclade — un compte à soi, oublié depuis longtemps',
      gratuit: true,
      quand: 'si un compte est resté sans mouvement 10 ans',
      comment: 'même recherche gratuite, sur soi-même : livret d\'enfance, compte d\'un ancien employeur, épargne salariale d\'un ancien poste.',
      lien: 'https://ciclade.caissedesdepots.fr/',
    });
  }

  if (pays.code === 'MC') {
    l.push({
      cle: 'MONACO',
      titre: '🇲🇨 Monaco — les fichiers français ne couvrent PAS Monaco',
      gratuit: false,
      quand: 'en plus des démarches françaises, pas à la place',
      comment: 'Un avoir dans une banque monégasque n\'apparaît ni sur Ciclade ni à l\'AGIRA. Il faut passer par un notaire de Monaco (règlement de la succession) ou écrire directement aux banques de la Principauté. Si la personne était de nationalité française avec des contrats français, les démarches françaises restent valables EN PLUS.',
      lien: 'https://service-public-particuliers.gouv.mc/',
    });
  }
  if (pays.code === 'CH') {
    l.push({
      cle: 'SUISSE',
      titre: '🇨🇭 Suisse — avoirs en déshérence',
      gratuit: true,
      quand: 'à tout moment',
      comment: 'La centrale de recherche de l\'Ombudsman des banques suisses cherche gratuitement dans toutes les banques du pays pour les héritiers.',
      lien: 'https://bankingombudsman.ch/fr/avoirs-en-desherence/',
    });
  }
  if (pays.code === 'CZ') {
    l.push({
      cle: 'ETRANGER',
      titre: '🇨🇿 République tchèque — succession locale',
      gratuit: false,
      quand: 'via la succession ouverte sur place',
      comment: 'Le décès a eu lieu hors de France : la succession relève d\'un notaire tchèque. Les avoirs français éventuels, eux, restent visibles par Ciclade et l\'AGIRA.',
      lien: 'https://fr.mzv.gov.cz/',
    });
  }
  return l;
}

/* --- 5. lettre AGIRA prête à envoyer -------------------------------------- */

function lettreAgira(p, mort) {
  const nom = `${p.prenom || ''} ${p.nom || ''}`.trim();
  const dn = dateNette(p.naissance?.date) || '(date de naissance à compléter)';
  const dd = dateNette(mort) || '(date de décès à compléter)';
  const ln = p.naissance?.lieu || '(lieu à compléter)';
  const ld = p.deces?.lieu || '(lieu à compléter)';
  return `Kevin DESARZENS
(adresse complète)
(code postal et ville)

                                        AGIRA — Recherche des contrats d'assurance vie
                                        1 rue Jules Lefebvre
                                        75431 PARIS CEDEX 09

                                        À ______________, le ____ / ____ / 2026

Objet : demande de recherche de contrat d'assurance vie souscrit au bénéfice
        éventuel du soussigné (article L.132-9-2 du code des assurances)

Madame, Monsieur,

Je vous prie de bien vouloir procéder à la recherche prévue par l'article
L.132-9-2 du code des assurances, afin de savoir si je suis désigné comme
bénéficiaire d'un contrat d'assurance sur la vie souscrit par la personne
décédée suivante :

    Nom et prénoms      : ${nom.toUpperCase()}
    Né(e) le            : ${dn}
    À                   : ${ln}
    Décédé(e) le        : ${dd}
    À                   : ${ld}

Vous trouverez ci-joint la copie de l'acte de décès de cette personne, ainsi
que la copie de ma pièce d'identité.

Je vous remercie de bien vouloir transmettre cette demande à l'ensemble des
entreprises d'assurance, organismes de prévoyance et unions concernés, et de
me faire connaître le résultat de vos recherches.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations
distinguées.

                                        Signature :


─────────────────────────────────────────────────────────────────────────────
PIÈCES À JOINDRE (sans elles, la demande est refusée)
  □ copie de l'acte de décès de ${nom}
  □ copie de ta pièce d'identité
LA DEMANDE EST GRATUITE. Les assureurs concernés doivent répondre sous 15 jours
à compter de la réception des pièces.

⚠️ VÉRIFIE L'ADRESSE AVANT DE POSTER : le pare-feu de ma machine m'interdit
   d'ouvrir agira.asso.fr, je n'ai donc PAS pu confirmer l'adresse postale
   ci-dessus. Elle est celle que je connais, mais elle a pu changer. L'AGIRA
   accepte aussi la demande par formulaire en ligne — c'est plus sûr et plus
   rapide : https://www.agira.asso.fr/recherche-des-contrats-dassurance-vie-en-cas-de-deces/
─────────────────────────────────────────────────────────────────────────────
`;
}

/* --- 6. assemblage -------------------------------------------------------- */

const gens = Object.values(lireArbre());
const fiches = gens.map((p) => {
  const mort = p.deces?.date || null;
  const anMort = anneeDe(mort);
  const ans = anMort ? AUJOURD_HUI.getFullYear() - anMort : null;
  return {
    p,
    nom: `${p.prenom || ''} ${p.nom || ''}`.trim(),
    mort,
    anMort,
    ans,
    pays: paysDe(p),
    doute: incertain(mort) || incertain(p.naissance?.date),
    portes: portes(p, mort, ans),
  };
});

const defunts = fiches.filter((f) => f.mort).sort((a, b) => (b.anMort || 0) - (a.anMort || 0));
/* On ne cherche que ce qui a une chance : la prescription est trentenaire. */
const chercheables = defunts.filter((f) => f.ans !== null && f.ans <= 30);
const tropAnciens = defunts.filter((f) => f.ans !== null && f.ans > 30);

rmSync(SORTIE, { recursive: true, force: true });
mkdirSync(join(SORTIE, 'lettres'), { recursive: true });

let md = `# 💶 Argent et biens non réclamés — la famille de Kevin

> Préparé le ${AUJOURD_HUI.toLocaleDateString('fr-FR')} à partir de l'arbre familial réel
> (${gens.length} personnes, ${defunts.length} décès datés).

## Ce que j'ai pu faire, et ce que je ne peux pas

**Je ne peux PAS interroger ces fichiers à ta place.** Ni moi ni aucun robot :
Ciclade et l'AGIRA demandent **ton identité**, et l'AGIRA exige en plus une
**copie de l'acte de décès**. Il n'existe aucune interface automatique — c'est
volontaire, c'est ce qui protège l'argent des familles.

**Ce que j'ai fait à la place** : tout le reste. La liste, l'ordre de priorité,
les champs exacts à saisir, et **${chercheables.length} lettres AGIRA déjà écrites**,
qu'il ne reste qu'à signer et poster.

## Les 3 portes, et ce que chacune ouvre

| Porte | Ce qu'elle trouve | Prix | Qui peut demander |
|---|---|---|---|
| **AGIRA** | une assurance vie dont **tu serais bénéficiaire** | gratuit | n'importe qui, même sans être héritier |
| **Ciclade** | comptes, livrets, épargne salariale et assurances vie **oubliés**, transférés à la Caisse des Dépôts | gratuit | n'importe qui peut chercher ; il faut prouver ses droits pour toucher |
| **Notaire (FICOBA + FICOVIE)** | **tous** les comptes bancaires et les assurances vie > 7 500 € | payant | héritiers seulement |

⚠️ **La prescription est trentenaire** : au-delà de 30 ans après le décès, les
sommes sont définitivement acquises à l'État. J'ai donc écarté ${tropAnciens.length} décès
trop anciens — ils sont listés à la fin, pour que tu voies que je ne les ai pas
oubliés, mais y consacrer du temps ne rapporterait rien.

---

## 🎯 Par où commencer — les ${Math.min(5, chercheables.length)} premiers

`;

chercheables.slice(0, 5).forEach((f, i) => {
  md += `${i + 1}. **${f.nom}** — décédé${f.p.sexe === 'F' ? 'e' : ''} il y a ${an(f.ans)}${f.pays.code !== 'FR' ? ` — ${f.pays.nom}` : ''}\n`;
});

/* Deux fiches pour une même personne = deux lettres pour rien. L'arbre en
   contient (une fiche « probable » et une fiche confirmée à l'INSEE) : on le
   signale plutôt que de laisser Kevin poster deux fois le même courrier. */
const doublons = [];
for (let i = 0; i < chercheables.length; i++) {
  for (let j = i + 1; j < chercheables.length; j++) {
    const a = chercheables[i], b = chercheables[j];
    if ((a.p.nom || '') === (b.p.nom || '') && a.anMort && a.anMort === b.anMort) {
      doublons.push([a.nom, b.nom]);
    }
  }
}
if (doublons.length) {
  md += `\n> ⚠️ **${doublons.length} personne${doublons.length > 1 ? 's apparaissent' : ' apparaît'} deux fois dans l'arbre** `;
  md += `(${doublons.map(([a, b]) => `« ${a} » et « ${b} »`).join(' ; ')}). `;
  md += `C'est probablement la même personne, avec une fiche « très probable » et une fiche confirmée. `;
  md += `**N'envoie qu'une seule lettre**, celle qui porte les dates confirmées.\n`;
}

md += `\n---\n\n## Fiche par personne\n`;

for (const f of chercheables) {
  const dn = dateNette(f.p.naissance?.date);
  md += `\n### ${f.nom}\n\n`;
  md += `| | |\n|---|---|\n`;
  md += `| Né${f.p.sexe === 'F' ? 'e' : ''} le | ${dn || '⚠️ à retrouver'} ${f.p.naissance?.lieu ? `à ${f.p.naissance.lieu}` : ''} |\n`;
  md += `| Décédé${f.p.sexe === 'F' ? 'e' : ''} le | ${dateNette(f.mort) || f.mort} ${f.p.deces?.lieu ? `à ${f.p.deces.lieu}` : ''} |\n`;
  md += `| Il y a | ${an(f.ans)} |\n`;
  if (f.doute) md += `| ⚠️ | une date porte une réserve dans l'arbre — la **copie intégrale de l'acte de décès** (gratuite) la tranchera |\n`;
  md += `\n**À saisir sur Ciclade** — copie-colle, c'est exactement ce qu'il demande :\n\n`;
  md += `> Nom : \`${(f.p.nom || '').toUpperCase()}\` · Prénom : \`${f.p.prenom || ''}\` · Né${f.p.sexe === 'F' ? 'e' : ''} le : \`${dn || 'à compléter'}\`\n\n`;
  for (const porte of f.portes) {
    md += `- **${porte.titre}** ${porte.gratuit ? '· gratuit' : ''}\n  - *Quand* : ${porte.quand}\n  - *Comment* : ${porte.comment}\n  - 👉 ${porte.lien}\n`;
  }
  if (f.mort) {
    const fichier = `AGIRA-${(f.p.nom || 'x').replace(/[^A-Za-zÀ-ÿ-]/g, '')}-${(f.p.prenom || 'x').replace(/[^A-Za-zÀ-ÿ-]/g, '')}.txt`;
    writeFileSync(join(SORTIE, 'lettres', fichier), lettreAgira(f.p, f.mort), 'utf8');
    md += `- 📄 **Lettre déjà écrite** : \`patrimoine/lettres/${fichier}\`\n`;
  }
}

md += `\n---\n\n## Toi et les vivants — la recherche à ne pas oublier\n\n`;
md += `Ciclade ne sert pas qu'aux défunts : un **livret d'enfance**, un compte d'un\n`;
md += `ancien employeur ou une **épargne salariale** d'un ancien poste dorment aussi.\n`;
md += `La recherche sur toi-même prend 2 minutes et ne coûte rien.\n\n`;
md += `> Nom : \`DESARZENS\` · Prénom : \`Kevin\` · ta date de naissance\n\n`;
md += `👉 https://ciclade.caissedesdepots.fr/\n`;

md += `\n---\n\n## Les décès de plus de 30 ans (écartés, pour mémoire)\n\n`;
md += tropAnciens.map((f) => `- ${f.nom} — ${f.anMort} (il y a ${an(f.ans)})`).join('\n') + '\n';

md += `\n---\n\n*Produit par \`node tools/patrimoine/chercher.mjs\`. Ces fichiers contiennent des\n`;
md += `données personnelles : le dossier \`patrimoine/\` est ignoré par git et n'est\n`;
md += `jamais publié.*\n`;

writeFileSync(join(SORTIE, '00-A-FAIRE.md'), md, 'utf8');

console.log(`arbre lu           : ${gens.length} personnes` + (sourceArbre() && sourceArbre().synthetique ? '  ⚠️ FAMILLE INVENTÉE (aucun export privé dans patrimoine/arbre.json) — résultats d\'essai' : ''));
console.log(`décès datés        : ${defunts.length}`);
console.log(`à chercher (≤30 a) : ${chercheables.length}`);
console.log(`écartés (>30 ans)  : ${tropAnciens.length}`);
console.log(`lettres AGIRA      : ${chercheables.length} dans patrimoine/lettres/`);
console.log(`dossier            : patrimoine/00-A-FAIRE.md`);
