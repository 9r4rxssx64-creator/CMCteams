#!/usr/bin/env node
/* ============================================================================
 * LES DOCUMENTS DE TRAVAIL NE DOIVENT JAMAIS ÊTRE PUBLIÉS — SUR AUCUNE SURFACE
 * ----------------------------------------------------------------------------
 * Le dépôt est PUBLIC et les deux publications servent « tout ce qu'il y a
 * dedans ». Trois fichiers, écrits à trois endroits, décrivent la même règle :
 *
 *   1. .github/workflows/deploy.yml   → l'étape qui RETIRE les documents avant
 *                                        de publier sur kd-mc.com (GitHub Pages)
 *   2. tools/gitlab/publier.sh        → les --exclude du miroir Cloudflare
 *   3. tools/audit/exposition-publique.mjs → ce que l'audit va SONDER en vrai
 *
 * Trois listes séparées dérivent toujours. Et un test d'égalité entre deux
 * surfaces ne verrait rien si les deux oubliaient le MÊME fichier (leçon #142 :
 * app et page light se trompaient pareil, la comparaison restait verte). D'où
 * ce garde, qui contrôle le CONTENU :
 *
 *   A. les DEUX publications retirent TOUS les Markdown (règle mesurée le 5.09 :
 *      aucune page du site ne charge un .md — les renvois sont des adresses
 *      absolues vers github.com, et aucun service worker n'en met en cache) ;
 *   B. tout ce que GitHub retire EN PLUS est aussi exclu du miroir, et SONDÉ
 *      par l'audit — sinon un retrait qui échoue passerait inaperçu ;
 *   C. les documents les plus sensibles restent nommés dans l'audit ;
 *   D. l'audit sort en erreur sur une fuite, casse le cache, et deploy.yml le
 *      lance vraiment après publication.
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
const miroirExclutLesMd = /--exclude='\*\.md'/.test(publierActif);
if (!deployRetireLesMd) {
  echec(`${DEPLOY} ne retire plus tous les Markdown avant publication — c'est la règle qui se maintient toute seule : sans elle, chaque nouveau document de travail se retrouve en ligne`);
} else ok('kd-mc.com : tous les Markdown retirés avant publication');
if (!miroirExclutLesMd) {
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
for (const nom of enPlus) {
  if (!couvertParExclusion(nom)) {
    echec(`« ${nom} » est retiré de GitHub Pages mais PAS exclu du miroir Cloudflare (${PUBLIER}) — il resterait public d'un côté`);
  }
  if (!sondePar(nom)) {
    echec(`« ${nom} » est retiré avant publication, mais l'audit ne le sonde jamais — si le retrait échouait, personne ne le saurait. Ajoute-le dans CHEMINS avec docTravail: true (${AUDIT})`);
  }
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

console.log('');
if (ko) {
  console.log(`${ko} problème(s). Les documents de travail n'ont rien à faire sur un site public.`);
  process.exit(1);
}
console.log('Les trois listes (GitHub Pages, miroir Cloudflare, audit) disent la même chose. ✅');
