#!/usr/bin/env node
/* ============================================================================
 * QU'EST-CE QUI EST RÉELLEMENT PUBLIC SUR kdmc-site.pages.dev ?
 * ----------------------------------------------------------------------------
 * Kevin, 4.09.2026 : capture d'écran de l'arbre familial ouvert sur
 * kdmc-site.pages.dev — 119 personnes, noms, dates de naissance, enfants,
 * divorces. Sans code.
 *
 * Le site est construit par Cloudflare Pages À PARTIR DU DÉPÔT ENTIER. Donc la
 * question n'est pas « l'arbre est-il public » mais « QUOI d'autre l'est ».
 * Ce script va le VÉRIFIER, page par page, au lieu de le supposer.
 *
 * Il ne peut pas tourner depuis la machine de l'agent (pare-feu) : sa place est
 * le runner, comme les autres vérifications réelles.
 *
 * PRUDENCE : il n'affiche JAMAIS les données trouvées, seulement le fait qu'un
 * marqueur est présent et combien de fois. Un journal de CI n'est pas l'endroit
 * où recopier les dates de naissance d'une famille.
 *
 * Lancer : node tools/audit/exposition-publique.mjs [--site https://...]
 * ========================================================================== */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SORTIE = join(RACINE, 'patrimoine-resultats');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const SITE = (arg('--site', 'https://kdmc-site.pages.dev')).replace(/\/$/, '');

/* Les chemins à sonder, du plus sensible au moins sensible. */
const CHEMINS = [
  { p: '/arbre/index.html', quoi: 'arbre familial (noms, dates de naissance, enfants)', grave: 3 },
  { p: '/arbre/research/actes.json', quoi: 'index des actes d\'état civil de la famille', grave: 3 },
  { p: '/NOTES_USER.md', quoi: 'notes métier (employés du casino, règles internes)', grave: 3 },
  { p: '/tools/shared/planning-seed.js', quoi: 'plannings : ~280 employés nommés', grave: 3 },
  { p: '/tools/departs/boards-gen.js', quoi: 'ordres de départ par employé', grave: 3 },
  { p: '/index.html', quoi: 'application CMCteams (effectif complet)', grave: 3 },
  { p: '/KEVIN_ACTIONS_TODO.md', quoi: 'actions en attente (comptes, fournisseurs)', grave: 2 },
  { p: '/pipeline/sessions.json', quoi: 'registre des sessions de travail', grave: 1 },
  { p: '/audit/github-reponse-support.md', quoi: 'échange avec le support GitHub', grave: 2 },
  { p: '/ETAT-INFRA.md', quoi: 'état de l\'infra (publication VOULUE)', grave: 0 },
  { p: '/CLAUDE.md', quoi: 'règles de travail', grave: 1 },
  { p: '/patrimoine/00-A-FAIRE.md', quoi: 'dossier patrimoine (doit être ABSENT)', grave: 3, doitEtreAbsent: true },
  { p: '/patrimoine-resultats/rapport.md', quoi: 'résultats des recherches (doit être ABSENT)', grave: 3, doitEtreAbsent: true },
];

/* Marqueurs de données personnelles — on compte, on n'affiche jamais. */
const MARQUEURS = [
  { nom: 'noms de famille de la lignée', re: /\b(SAUVAIGO|MAIFFRET|DESARZENS|VAN DEN BOSCH)\b/gi },
  { nom: 'dates de naissance complètes', re: /\b\d{1,2}[./]\d{1,2}[./](19|20)\d{2}\b/g },
  { nom: 'adresses e-mail', re: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi },
  { nom: 'numéros de téléphone', re: /\b(?:\+33|0|\+377)[\s.-]?[1-9](?:[\s.-]?\d{2}){4}\b/g },
];

mkdirSync(SORTIE, { recursive: true });
const lignes = [];
console.log(`Site sondé : ${SITE}\n`);

for (const c of CHEMINS) {
  let statut = 0, taille = 0, trouves = [];
  try {
    const r = await fetch(SITE + c.p, { redirect: 'follow' });
    statut = r.status;
    if (r.ok) {
      const t = await r.text();
      taille = t.length;
      for (const m of MARQUEURS) {
        const n = (t.match(m.re) || []).length;
        if (n > 0) trouves.push(`${m.nom} ×${n}`);
      }
    }
  } catch (e) {
    statut = -1;
    trouves = [String(e.message).slice(0, 60)];
  }
  const publique = statut >= 200 && statut < 300;
  const alerte = c.doitEtreAbsent ? (publique ? '🚨 FUITE' : '✅ absent')
    : (publique && c.grave >= 3 ? '🚨 EXPOSÉ'
      : publique && c.grave === 2 ? '⚠️ exposé'
        : publique ? 'ℹ️ public' : '— absent');
  lignes.push({ ...c, statut, taille, trouves, publique, alerte });
  console.log(`${alerte.padEnd(10)} HTTP ${String(statut).padEnd(4)} ${String(taille).padStart(8)} o  ${c.p}`);
  if (trouves.length) console.log(`             ↳ ${trouves.join(' · ')}`);
}

const graves = lignes.filter((l) => l.alerte.startsWith('🚨'));
let md = `# Ce qui est réellement public sur ${SITE}\n\n`;
md += `Sondé le ${new Date().toLocaleString('fr-FR')}. **${graves.length} exposition(s) grave(s).**\n\n`;
md += `| État | Chemin | Ce que c'est | HTTP | Taille | Données personnelles détectées |\n|---|---|---|---|---|---|\n`;
for (const l of lignes) {
  md += `| ${l.alerte} | \`${l.p}\` | ${l.quoi} | ${l.statut} | ${l.taille || '—'} | ${l.trouves.join(', ') || '—'} |\n`;
}
md += `\n*Les données elles-mêmes ne sont jamais recopiées ici : seulement le nombre\n`;
md += `d'occurrences. Un rapport n'a pas à republier ce qu'il dénonce.*\n`;
writeFileSync(join(SORTIE, 'exposition-publique.md'), md);
writeFileSync(join(SORTIE, 'exposition-publique.json'), JSON.stringify({ site: SITE, quand: new Date().toISOString(), lignes }, null, 2));

console.log(`\n${graves.length} exposition(s) grave(s) — détail dans patrimoine-resultats/exposition-publique.md`);
