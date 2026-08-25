/* GARDE-FOU — la chaîne « app web → vraie app iPhone » (Kevin 2026-08-13, « Go tout »).
 *
 * Ce que ce test empêche, dans l'ordre de gravité :
 *  1. Un identifiant d'app (bundleId) qui change → Apple créerait une app DIFFÉRENTE :
 *     testeurs, avis et achats perdus. C'est irréversible, donc figé ici.
 *  2. Un fichier référencé en absolu par l'app qui n'est PAS embarqué → l'app s'ouvre
 *     et un morceau ne charge jamais, en silence. (Trouvé en vrai : CMCteams charge
 *     /CMCteams/tools/… ; dans l'app native la racine est « / ».)
 *  3. Un secret Apple qui traînerait dans le dépôt.
 *  4. Un déclenchement automatique du build iOS (coûteux, et une soumission Apple est
 *     irréversible → bouton uniquement).
 *
 * node tests/mobile-ios-config.test.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fichiersRetenus, identifiantValide } from '../mobile/build-ios.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CFG = JSON.parse(readFileSync(join(ROOT, 'mobile/apps.json'), 'utf8'));
const WF = readFileSync(join(ROOT, '.github/workflows/ios-testflight.yml'), 'utf8');

let pass = 0;
const fails = [];
const ok = (c, m) => (c ? pass++ : fails.push(m));

/* ── 1. Identifiants figés — ne JAMAIS changer après publication ─────────────── */
/* SANS TIRET : Capacitor et Apple exigent la forme « paquet Java ». Le 1er essai
   com.kd-mc.* a été refusé au build (run 31762220281) — corrigé AVANT toute publication,
   donc sans conséquence. Après publication, changer un identifiant crée une app
   DIFFÉRENTE chez Apple : testeurs, avis et achats perdus. D'où le gel ici. */
const ATTENDUS = {
  cmcteams: 'com.kdmc.cmcteams',
  'apex-chat': 'com.kdmc.apexchat',
  lingua: 'com.kdmc.lingua',
};
ok(CFG.apps.length === 3, `3 apps déclarées (vu ${CFG.apps.length})`);
for (const a of CFG.apps) {
  ok(ATTENDUS[a.id] === a.bundleId,
    `${a.id} : identifiant Apple attendu ${ATTENDUS[a.id]}, trouvé ${a.bundleId} — le changer perd testeurs/avis/achats`);
  ok(identifiantValide(a.bundleId), `${a.id} : identifiant Apple mal formé (forme paquet Java, aucun tiret)`);
  ok(!a.bundleId.includes('-'), `${a.id} : un TIRET dans l'identifiant — Capacitor refuse le build`);
  ok(!!a.name && !!a.site && !!a.categorieApple, `${a.id} : nom / site / catégorie renseignés`);
  /* Apple refuse les coquilles vides (règle 4.2) : on exige une justification ÉCRITE. */
  ok((a.pourquoiPasUneCoquille || '').length > 80,
    `${a.id} : justifier par écrit pourquoi ce n'est pas un site emballé (règle Apple 4.2)`);
}
ok(new Set(CFG.apps.map((a) => a.bundleId)).size === CFG.apps.length, 'aucun identifiant Apple en double');

/* ── 2. Le contenu embarqué existe vraiment, et les chemins absolus résolvent ── */
for (const a of CFG.apps) {
  const src = join(ROOT, a.webDir);
  ok(existsSync(join(src, 'index.html')), `${a.id} : ${a.webDir}/index.html introuvable`);
  const fichiers = fichiersRetenus(src, a.include);
  ok(fichiers.length > 0, `${a.id} : aucun fichier retenu — l'app serait vide`);
  ok(fichiers.includes('index.html'), `${a.id} : index.html doit être embarqué`);

  /* Chaque référence absolue de l'app doit être couverte par la config. */
  const html = readFileSync(join(src, 'index.html'), 'utf8');
  const refs = [...html.matchAll(/(?:src|href)="(\/[^"]+\.(?:js|css|png|jpe?g|svg|webp|woff2?|json))"/g)]
    .map((m) => m[1]).filter((u, i, arr) => arr.indexOf(u) === i);
  for (const r of refs) {
    const sansPrefixe = a.dupliquerSous ? r.replace(new RegExp('^/' + a.dupliquerSous + '/'), '') : r.replace(/^\//, '');
    ok(fichiers.includes(sansPrefixe),
      `${a.id} : « ${r} » est chargé par l'app mais n'est PAS embarqué → morceau mort dans l'app iPhone`);
  }
  if (refs.some((r) => r.startsWith('/CMCteams/')))
    ok(a.dupliquerSous === 'CMCteams', `${a.id} : charge /CMCteams/… → « dupliquerSous » obligatoire, sinon 404 dans l'app`);
}

/* ── 3. Aucun secret Apple dans le dépôt ─────────────────────────────────────── */
ok(!/BEGIN PRIVATE KEY/.test(WF), 'aucune clé .p8 en clair dans le workflow');
for (const s of ['ASC_KEY_ID', 'ASC_ISSUER_ID', 'ASC_PRIVATE_KEY'])
  ok(WF.includes('secrets.' + s), `${s} doit venir des secrets GitHub`);
ok(/rm -f .*asc\.p8/.test(WF), 'la clé .p8 doit être effacée du runner après usage');

/* ── 4. Rien d'automatique : bouton uniquement ───────────────────────────────── */
ok(WF.includes('workflow_dispatch'), 'le build iOS se lance à la main');
ok(!/^\s*(push|schedule):/m.test(WF), 'aucun déclenchement automatique (build macOS coûteux + soumission irréversible)');
ok(/inputs\.envoyer/.test(WF), 'l\'envoi à Apple est un choix explicite, séparé de la construction');
ok(/pipefail/.test(WF), 'pipefail : un échec ne doit pas ressortir vert (leçon #176)');

console.log(`App iPhone : ${pass} vérifications OK, ${fails.length} échec(s)`);
fails.forEach((f) => console.log('  ✗ ' + f));
process.exit(fails.length ? 1 : 0);
