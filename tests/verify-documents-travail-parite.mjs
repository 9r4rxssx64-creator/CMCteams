#!/usr/bin/env node
/* ============================================================================
 * LES DOCUMENTS DE TRAVAIL NE DOIVENT JAMAIS ÊTRE PUBLIÉS — SUR AUCUNE SURFACE
 * ----------------------------------------------------------------------------
 * Le dépôt est PUBLIC et les publications servent « tout ce qu'il y a
 * dedans ». Quatre fichiers, écrits à quatre endroits, décrivent la même règle :
 *
 *   1. .github/workflows/deploy.yml   → l'étape qui RETIRE les documents avant
 *                                        de publier sur kd-mc.com (GitHub Pages)
 *   2. tools/gitlab/publier.sh        → le miroir Cloudflare
 *   3. tools/audit/exposition-publique.mjs → ce que l'audit va SONDER en vrai
 *   4. services/kdmc-router/prepare-secours.mjs → le paquet TRIÉ, qui sert à la
 *                                        fois la copie de secours (GitHub éteint)
 *                                        et, depuis le 15.09.2026, le miroir
 *
 * Quatre listes séparées dérivent toujours. Et un test d'égalité entre deux
 * surfaces ne verrait rien si les deux oubliaient le MÊME fichier (leçon #142 :
 * app et page light se trompaient pareil, la comparaison restait verte). D'où
 * ce garde, qui contrôle le CONTENU :
 *
 *   A. les DEUX publications retirent TOUS les Markdown (règle mesurée le 5.09 :
 *      aucune page du site ne charge un .md — les renvois sont des adresses
 *      absolues vers github.com, et aucun service worker n'en met en cache) ;
 *   B. tout ce que GitHub retire EN PLUS est aussi tenu à l'écart du miroir, et
 *      SONDÉ par l'audit — sinon un retrait qui échoue passerait inaperçu.
 *      « Tenu à l'écart » se contrôle selon la forme du miroir : par ses
 *      --exclude s'il copie tout le dépôt, par le contenu du paquet (section E)
 *      s'il délègue à un fabricant de paquet trié ;
 *   C. les documents les plus sensibles restent nommés dans l'audit ;
 *   D. l'audit sort en erreur sur une fuite, casse le cache, et deploy.yml le
 *      lance vraiment après publication ;
 *   E. la copie de SECOURS obéit aux mêmes règles — sinon la panne publie ce
 *      que le fonctionnement normal cache (trouvé le 10.09, voir plus bas).
 *
 * Lancer : node tests/verify-documents-travail-parite.mjs
 * ========================================================================== */

import { readFileSync, existsSync } from 'node:fs';

const DEPLOY = '.github/workflows/deploy.yml';
const PUBLIER = 'tools/gitlab/publier.sh';
const AUDIT = 'tools/audit/exposition-publique.mjs';

let ko = 0;
const echec = (m) => { console.log(`❌ ${m}`); ko++; };
const ok = (m) => console.log(`✅ ${m}`);

for (const f of [DEPLOY, PUBLIER, AUDIT]) {
  if (!existsSync(f)) echec(`fichier introuvable : ${f}`);
}
if (ko) { console.log('\nGarde impossible à exécuter.'); process.exit(1); }

const deploy = readFileSync(DEPLOY, 'utf8');
const publier = readFileSync(PUBLIER, 'utf8');
const audit = readFileSync(AUDIT, 'utf8');

/* Une règle écrite dans un COMMENTAIRE ne protège rien. Ce garde a failli se
   faire avoir par son propre commentaire : la première version cherchait
   `--exclude='*.md'` n'importe où dans publier.sh, et la phrase d'explication
   juste au-dessus du tar suffisait à le rassurer (sabotage non détecté, 5.09).
   On ne lit donc que les lignes qui s'EXÉCUTENT. */
const sansCommentaires = (t) => t.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
const deployActif = sansCommentaires(deploy);
const publierActif = sansCommentaires(publier);

/* ── A. Les deux publications retirent TOUS les Markdown ──────────────────── */
const deployRetireLesMd = /find \. -name '\*\.md' -type f -delete/.test(deployActif);
if (!deployRetireLesMd) {
  echec(`${DEPLOY} ne retire plus tous les Markdown avant publication — c'est la règle qui se maintient toute seule : sans elle, chaque nouveau document de travail se retrouve en ligne`);
} else ok('kd-mc.com : tous les Markdown retirés avant publication');

/* Le miroir a DEUX formes possibles, et la seconde est meilleure :
 *   • LISTE NOIRE (ancienne) : `tar` de tout le dépôt moins des --exclude.
 *     Tout ce qu'on oublie d'exclure part en ligne.
 *   • LISTE BLANCHE (depuis le 15.09.2026) : il délègue au fabricant de paquet
 *     `prepare-secours.mjs`, qui n'embarque QUE les applications nommées.
 *     Tout ce qu'on oublie reste à terre — l'inverse, et c'est plus sûr.
 * MESURÉ le 15.09 avant de changer : l'ancienne forme publiait 2 049 fichiers de
 * `services/`, 37 498 d'`apex-ai/`, 193 de `.github/` — c'est-à-dire tout le code,
 * sur une adresse publique. Passer le dépôt GitHub en privé n'aurait donc rien
 * caché. On accepte les DEUX formes ici, mais on exige que la liste blanche soit
 * vraiment une liste blanche (packager + garde avant envoi). */
const miroirListeBlanche = /prepare-secours\.mjs[^\n]*--pages/.test(publierActif);
if (miroirListeBlanche) {
  const gardeAvantEnvoi = /find "\$PAQUET" -name '\*\.md'/.test(publierActif)
    && /PUBLICATION ANNULÉE|exit 1/.test(publierActif);
  if (!gardeAvantEnvoi) {
    echec(`${PUBLIER} fabrique le paquet trié mais ne le CONTRÔLE plus avant de l'envoyer — publier est irréversible, le contrôle doit être avant`);
  } else ok('miroir Cloudflare : liste blanche (paquet trié) + contrôle avant envoi');
} else if (!/--exclude='\*\.md'/.test(publierActif)) {
  echec(`${PUBLIER} n'exclut plus tous les Markdown — le miroir Cloudflare publierait ce que kd-mc.com cache`);
} else ok('miroir Cloudflare : tous les Markdown exclus');

/* ── L'étape de retrait existe-t-elle toujours, et que retire-t-elle d'autre ? */
const etape = deployActif.split('Retirer les documents de travail avant publication')[1] || '';
if (!etape) echec(`l'étape « Retirer les documents de travail » a disparu de ${DEPLOY}`);
const bloc = etape.split('- name:')[0];            // on s'arrête à l'étape suivante

const enPlus = new Set();                          // ce que GitHub retire EN PLUS des .md
const boucle = (bloc.match(/for f in([\s\S]*?)do/) || [])[1] || '';
for (const m of boucle.matchAll(/[\w./-]+\.(?:json|js|mjs|txt|yml|pdf)/g)) enPlus.add(m[0]);
for (const m of bloc.matchAll(/rm -rf ([^\n|&]+)/g)) {
  for (const d of m[1].trim().split(/\s+/)) {
    if (d.startsWith('-') || d.startsWith('2>')) continue;
    enPlus.add(d.replace(/\/$/, ''));
  }
}
if (enPlus.size < 4) echec(`seulement ${enPlus.size} entrée(s) non-Markdown retirées dans ${DEPLOY} — la liste a-t-elle été vidée ?`);
else ok(`${enPlus.size} entrée(s) non-Markdown retirées en plus (dossiers de travail, JSON)`);

/* ── Ce que la copie de secours embarque — lu ICI parce que ça sert DEUX fois ─
 * Depuis le 15.09.2026, `publier.sh` ne fabrique plus son paquet lui-même : il
 * appelle `prepare-secours.mjs --pages`, le MÊME fabricant que la copie de
 * secours. Les deux surfaces ont donc exactement le même contenu, et la seule
 * question qui vaille pour les deux est : « ce document peut-il finir dans le
 * paquet ? ». On lit donc la liste une fois, avant d'en avoir besoin. */
const SECOURS = 'services/kdmc-router/prepare-secours.mjs';
const secoursPresent = existsSync(SECOURS);
let secoursActif = '';
let recopies = [];
let travail = new Set();
if (!secoursPresent) {
  echec(`${SECOURS} introuvable — la copie de secours n'est plus contrôlée`);
} else {
  const secours = readFileSync(SECOURS, 'utf8');
  /* Un commentaire ne protège rien : on retire les blocs de commentaires avant
     de lire (même piège que la règle A ci-dessus, tombée dedans le 5.09). */
  secoursActif = secours.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const listeDe = (nom) => {
    const m = secoursActif.match(new RegExp('const ' + nom + ' = \\[([\\s\\S]*?)\\n\\];'));
    return m ? [...m[1].matchAll(/chemin:\s*'([^']+)'/g)].map((x) => x[1]) : [];
  };
  recopies = [...listeDe('APPS'), ...listeDe('MEDIAS'), ...listeDe('PARTAGES')];
  travail = new Set([...(secoursActif.match(/const TRAVAIL = new Set\(\[([^\]]*)\]/) || [, ''])[1]
    .matchAll(/'([^']+)'/g)].map((m) => m[1]));
}
/* Un document de travail n'est un problème que s'il peut être EMBARQUÉ, c'est-
   à-dire s'il vit sous un dossier recopié. Sinon il n'arrive jamais dans le
   paquet et l'exiger serait du bruit. */
const embarquable = (nom) => recopies.some((c) => nom === c || nom.startsWith(c + '/'));

/* ── B. Ce que GitHub retire EN PLUS : exclu du miroir, et sondé par l'audit ─ */
const exclus = new Set([...publierActif.matchAll(/--exclude=(?:'([^']*)'|([^\s\\]+))/g)]
  .map((m) => (m[1] || m[2]).replace(/\/$/, '')));
const couvertParExclusion = (nom) => {
  const base = nom.split('/').pop();
  if (exclus.has(nom) || exclus.has(base)) return true;
  for (const e of exclus) {
    if (nom.startsWith(e + '/')) return true;                       // dans un dossier exclu
    if (e.includes('*')) {
      const re = new RegExp('^' + e.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*') + '$');
      if (re.test(nom) || re.test(base)) return true;
    }
  }
  return false;
};
const sondes = [...audit.matchAll(/\{\s*p:\s*'([^']+)'[^}]*docTravail:\s*true/g)].map((m) => m[1].replace(/^\//, ''));
if (!sondes.length) echec(`aucun chemin marqué docTravail dans ${AUDIT} — l'audit ne vérifierait plus rien`);
else ok(`${sondes.length} chemin(s) réellement sondés par l'audit`);

const sondePar = (nom) => sondes.some((s) => s === nom || s.startsWith(nom.replace(/\/$/, '') + '/'));

/* Le miroir se contrôle SELON SA FORME — on ne baisse pas l'exigence, on la pose
 * au bon endroit :
 *   • LISTE NOIRE : chaque document retiré doit avoir son `--exclude`.
 *   • LISTE BLANCHE : il n'y a plus d'exclusions à vérifier — le paquet ne
 *     contient que les dossiers nommés. La vraie question devient « ce document
 *     peut-il finir dedans ? », et c'est exactement ce que contrôle la section E
 *     (règle .md + liste TRAVAIL). Un `--exclude` de plus ne protégerait rien ;
 *     ce qui protège, c'est que le fabricant refuse de l'embarquer.
 * Sans le fabricant, plus personne ne contrôle le miroir : on le dit. */
if (miroirListeBlanche && !secoursPresent) {
  echec(`${PUBLIER} délègue son paquet à ${SECOURS}, qui est introuvable — le contenu du miroir Cloudflare n'est plus contrôlé par personne`);
}
let manquantsMiroir = 0;
for (const nom of enPlus) {
  if (!miroirListeBlanche && !couvertParExclusion(nom)) {
    echec(`« ${nom} » est retiré de GitHub Pages mais PAS exclu du miroir Cloudflare (${PUBLIER}) — il resterait public d'un côté`);
    manquantsMiroir++;
  }
  if (!sondePar(nom)) {
    echec(`« ${nom} » est retiré avant publication, mais l'audit ne le sonde jamais — si le retrait échouait, personne ne le saurait. Ajoute-le dans CHEMINS avec docTravail: true (${AUDIT})`);
  }
}
if (miroirListeBlanche) {
  ok(`miroir Cloudflare : même paquet trié que la copie de secours — son contenu est contrôlé en E`);
} else if (!manquantsMiroir) {
  ok(`miroir Cloudflare : les ${enPlus.size} entrée(s) retirées de GitHub Pages y sont aussi exclues`);
}

/* ── C. Les documents les plus sensibles restent SONDÉS ───────────────────── */
const INCONTOURNABLES = ['NOTES_USER.md', 'KEVIN_ACTIONS_TODO.md', 'CLAUDE.md', 'MEMO_RESUME.md'];
for (const doc of INCONTOURNABLES) {
  if (!sondes.includes(doc)) {
    echec(`${doc} doit rester sondé par l'audit (${AUDIT}) — c'est lui qui nomme des personnes, et c'est la preuve que le retrait a marché`);
  }
}

/* ── D. L'audit doit être un vrai contrôle, et être vraiment lancé ────────── */
if (!/process\.exitCode\s*=\s*1/.test(audit)) {
  echec(`${AUDIT} ne sort plus en erreur quand un document de travail est public — le contrôle de deploy.yml passerait au vert sur une fuite`);
}
if (!/no-store/.test(audit) || !/_nocache=/.test(audit)) {
  echec(`${AUDIT} ne casse plus le cache de bordure — mesuré le 5.09 : sans ça il annonce une fuite déjà bouchée (et rassurerait à tort dans l'autre sens)`);
}
if (!/MESURE IMPOSSIBLE/.test(audit) || !/process\.exit\(2\)/.test(audit)) {
  echec(`${AUDIT} ne vérifie plus qu'il ATTEINT le site avant de conclure — sans ça, un réseau coupé donne « aucun document publié » : un ✅ franc alors que rien n'a été mesuré (vécu le 5.09, le pare-feu répondait 403 partout)`);
}
if (!/exposition-publique\.mjs/.test(deploy)) {
  echec(`${DEPLOY} ne vérifie plus, après publication, que le site ne sert aucun document de travail`);
}

/* ── E. La QUATRIÈME liste : la copie de secours ───────────────────────────
 *
 * TROU TROUVÉ LE 10.09.2026. Ce garde surveillait trois listes et se déclarait
 * complet. Mais quand GitHub est éteint, kd-mc.com n'est servi ni par GitHub
 * Pages ni par le miroir : il est servi par la COPIE DE SECOURS fabriquée par
 * prepare-secours.mjs. C'est une publication comme les autres — et elle
 * n'obéissait à aucune des règles ci-dessus. Mesuré ce jour-là : **33
 * Markdown** dedans (dont 21 fiches de recherche généalogique nommant la
 * famille), plus `arbre/research/actes.json` et `coffre-fort/memo` que les deux
 * autres surfaces retirent depuis le 5.09. Autrement dit : la panne publiait ce
 * que le fonctionnement normal cachait.
 *
 * Même raisonnement qu'en tête de ce fichier : une quatrième liste séparée
 * dérive aussi. On la rattache donc ici.
 *
 * DEPUIS LE 15.09.2026, cette section porte DEUX surfaces : la copie de secours
 * ET le miroir Cloudflare, qui partagent le même fabricant de paquet (cf. B).
 * Les listes ont été lues plus haut ; on ne fait ici que les contrôler.
 */
if (secoursPresent) {
  if (!secoursActif.includes('.md$/i.test(base)) return false')) {
    echec(`${SECOURS} ne retire plus tous les Markdown — GitHub éteint, la copie de secours publierait les documents de travail que les deux autres surfaces cachent`);
  } else ok('paquet trié (secours + miroir) : tous les Markdown exclus');

  if (!recopies.length) {
    echec(`${SECOURS} ne déclare plus aucun dossier à recopier (APPS/MEDIAS/PARTAGES) — le garde ne saurait plus dire ce qui peut être embarqué, et validerait tout`);
  }

  let manquants = 0;
  for (const nom of enPlus) {
    if (!embarquable(nom)) continue;
    if (!travail.has(nom)) {
      echec(`« ${nom} » est retiré de GitHub Pages, mais le paquet trié l'embarque encore (il est sous un dossier recopié) — il partirait sur la copie de secours ET sur le miroir Cloudflare. Ajoute-le à TRAVAIL dans ${SECOURS}`);
      manquants++;
    }
  }
  if (!manquants) ok(`paquet trié (secours + miroir) : les documents de travail embarquables (${[...travail].filter(embarquable).length}) sont exclus`);
}

console.log('');
if (ko) {
  console.log(`${ko} problème(s). Les documents de travail n'ont rien à faire sur un site public.`);
  process.exit(1);
}
console.log('Les quatre listes (GitHub Pages, miroir Cloudflare, audit, copie de secours) disent la même chose. ✅');
