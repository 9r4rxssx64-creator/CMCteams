#!/usr/bin/env node
/* ============================================================================
   BOUÉE DE SECOURS kd-mc.com — remet le domaine en ligne SANS GitHub.
   ----------------------------------------------------------------------------
   Le 14/08/2026, le compte GitHub de Kevin a été suspendu. Or le routeur
   Cloudflare (qui, lui, tourne toujours) va chercher CHAQUE page ici :

       const UPSTREAM = 'https://9r4rxssx64-creator.github.io';

   GitHub Pages s'éteint avec le compte → les 20 sous-domaines renvoient 404.
   Vérifié par Kevin sur son iPhone : « 404 ».

   Ce script recopie les dossiers réellement servis (et EUX SEULS) dans
   services/kdmc-router/public/, en gardant le préfixe /CMCteams/… attendu par
   la table ROUTES. Le Worker les sert alors lui-même quand GitHub ne répond
   pas — et REDEVIENT un simple proxy dès que GitHub revient, sans rien
   toucher : le repli ne se déclenche que sur échec de l'amont.

   Usage :
     node services/kdmc-router/prepare-secours.mjs            # apps + médias
     node services/kdmc-router/prepare-secours.mjs --leger    # apps seules (rapide)
   ========================================================================== */

import { cpSync, existsSync, mkdirSync, rmSync, statSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = resolve(ICI, '../..');
const LEGER = process.argv.includes('--leger');
/* --pages : sortie destinée à Cloudflare Pages, qui sert à la RACINE.
   GitHub Pages ajoutait le préfixe /CMCteams (le nom du dépôt) ; Pages non.
   Le routeur retire ce préfixe quand UPSTREAM_PREFIX est vide — les deux
   doivent donc s'accorder, sinon on obtient des 404 partout. */
const POUR_PAGES = process.argv.includes('--pages');
const SORTIE = POUR_PAGES ? join(ICI, 'pages-upload') : join(ICI, 'public', 'CMCteams');

/* Exactement la table ROUTES du worker. Toute entrée ajoutée là-bas doit
   l'être ici — un test de parité le vérifie (rien ne doit rester sans secours). */
const APPS = [
  { chemin: 'kdmc-home', quoi: 'accueil kd-mc.com' },
  { chemin: 'apex-ai-v13', quoi: 'apex-ai' },
  { chemin: 'messaging-app', quoi: 'apex-chat' },
  { chemin: 'coffre-fort', quoi: 'coffre' },
  { chemin: 'tools/departs', quoi: 'départs / cmcteams-light' },
  { chemin: 'tools/crea-studio', quoi: 'studio' },
  { chemin: 'tools/crypto-bot-dashboard', quoi: 'bot' },
  { chemin: 'tools/poolrobot', quoi: 'beatbot' },
  { chemin: 'tools/approvals', quoi: 'autorisations' },
  { chemin: 'lingua', quoi: 'lingua' },
  { chemin: 'shops/dashboard', quoi: 'dashboard' },
  { chemin: 'shops/sourcing', quoi: 'sourcing' },
];
/* Lourds en photos : on peut les remettre dans un second temps. */
const MEDIAS = [
  { chemin: 'arbre', quoi: 'arbre généalogique' },
  { chemin: 'shops/chez-lolo', quoi: 'chez-lolo' },
  { chemin: 'la-detente', quoi: 'la-detente' },
];
/* cmcteams.kd-mc.com pointe sur la RACINE du dépôt : on ne recopie donc que
   les fichiers de l'app, surtout pas les 500 Mo de coulisses. */
const RACINE_FICHIERS = ['index.html', 'sw.js', 'manifest.webmanifest', 'manifest.json', 'favicon.ico', 'robots.txt'];

/* Dossiers jamais recopiés. « tests » et « workers » s'ajoutent au ménage
   habituel : mesuré le 15/08/2026 sur l'ancien site, on publiait 77 fichiers de
   test, 289 cartes de code source (elles exposent TOUT le source) et 9 fichiers
   de code SERVEUR. Aucune page ne les charge — vérifié, 0 référence. Refaire le
   paquet est l'occasion de ne plus les mettre en ligne. */
const IGNORER = new Set(['node_modules', '.git', 'coverage', '.DS_Store', 'tests', '__tests__', 'workers']);
function filtre(src) {
  const base = src.split('/').pop();
  if (IGNORER.has(base)) return false;
  if (/\.(mp4|mov|avi|zip|patch)$/i.test(base)) return false;   // trop lourd, inutile au dépannage
  if (/\.map$/i.test(base)) return false;                       // carte de code source = tout le source exposé
  if (/\.(test|spec)\.[jt]sx?$/i.test(base)) return false;
  /* Notes internes : SECRETS_TODO.md listait l'architecture des secrets de
     Kevin (les noms, pas les valeurs) — inutile de la laisser en ligne. */
  if (/^(SECRETS|CLAUDE|NOTES_|MEMO|KEVIN_).*\.md$/i.test(base)) return false;
  if (/TODO.*\.md$/i.test(base)) return false;
  try { if (statSync(src).size > 24 * 1024 * 1024) return false; } catch (_) { /* rien */ }
  return true;
}
function compte(dir) {
  let n = 0, o = 0;
  const pile = [dir];
  while (pile.length) {
    const d = pile.pop();
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) { if (!IGNORER.has(e.name)) pile.push(p); }
      else { n++; try { o += statSync(p).size; } catch (_) { /* rien */ } }
    }
  }
  return { n, o };
}

rmSync(SORTIE, { recursive: true, force: true });
mkdirSync(SORTIE, { recursive: true });

const liste = LEGER ? APPS : APPS.concat(MEDIAS);
let totalFichiers = 0, totalOctets = 0;
const absents = [];
for (const a of liste) {
  const src = join(RACINE, a.chemin);
  if (!existsSync(src)) { absents.push(a.chemin); continue; }
  const dst = join(SORTIE, a.chemin);
  mkdirSync(dirname(dst), { recursive: true });
  cpSync(src, dst, { recursive: true, filter: filtre });
  const { n, o } = compte(dst);
  totalFichiers += n; totalOctets += o;
  console.log(`  ${String(n).padStart(5)} fichiers  ${(o / 1048576).toFixed(1).padStart(6)} Mo   ${a.chemin}  (${a.quoi})`);
}
for (const f of RACINE_FICHIERS) {
  const src = join(RACINE, f);
  if (!existsSync(src)) continue;
  cpSync(src, join(SORTIE, f));
  totalFichiers++; totalOctets += statSync(src).size;
}
console.log(`  ${String(RACINE_FICHIERS.filter((f) => existsSync(join(RACINE, f))).length).padStart(5)} fichiers          racine (cmcteams.kd-mc.com)`);

console.log('\n────────────────────────────────────────────────');
console.log(`  TOTAL : ${totalFichiers} fichiers, ${(totalOctets / 1048576).toFixed(1)} Mo`);
console.log(`  Limite Cloudflare : 20 000 fichiers, 25 Mo par fichier`);
if (absents.length) console.log(`  ⚠️  absents du dépôt (ignorés) : ${absents.join(', ')}`);
if (totalFichiers > 20000) {
  console.error('\n❌ trop de fichiers pour Cloudflare — relance avec --leger');
  process.exit(1);
}
if (POUR_PAGES) {
  console.log('\n✅ Prêt pour Cloudflare Pages (envoi direct, sans aucun dépôt de code).');
  console.log('   Dossier : ' + SORTIE);
  console.log('   Les fichiers sont à la RACINE (pas de préfixe /CMCteams) :');
  console.log('   il faudra donc laisser UPSTREAM_PREFIX VIDE dans le routeur.\n');
} else {
  console.log('\n✅ Prêt. Pour remettre kd-mc.com en ligne :');
  console.log('     cd services/kdmc-router && npx wrangler login && npx wrangler deploy\n');
}
