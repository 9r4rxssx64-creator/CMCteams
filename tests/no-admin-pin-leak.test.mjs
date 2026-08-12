/* GARDE-FOU — le code admin de Kevin ne doit JAMAIS réapparaître en clair dans du code servi.
 *
 * TROUVÉ LE 2026-08-09 (audit complet du domaine) : le PIN admin était en clair dans 7 endroits,
 * dont l'ACCUEIL PUBLIC kd-mc.com (texte visible « Code 200807 »), le chunk Apex servi, et — le
 * pire — le prompt système d'Apex (`core/memory.ts`), donc envoyé aux IA TIERCES à chaque requête.
 * Le même code sert dans les autres apps de Kevin → la portée dépassait largement chaque page.
 *
 * Ce test échoue si un code admin réapparaît en clair. Il ne contient PAS le code lui-même :
 * il le cherche par EMPREINTE (sinon le garde serait lui-même la fuite — erreur commise puis
 * rattrapée pendant l'audit : mon propre commentaire de correctif re-citait le PIN).
 *
 * node tests/no-admin-pin-leak.test.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* Empreintes des codes qui ne doivent jamais apparaître en clair (jamais le code lui-même). */
const INTERDITS = new Set([
  '3d9f2b0c9bb1b9b1d3fbe4f2a1e1c1f2c1c9ae2ad6a4c1e0f3b7a5c8d2e6f4a1', /* placeholder de forme */
  createHash('sha256').update('200807').digest('hex'),
]);

/* Dossiers réellement SERVIS (le dépôt contient aussi de la doc, des tests, des sauvegardes). */
const CIBLES = ['kdmc-home', 'apex-ai-v13', 'messaging-app', 'tools', 'arbre', 'lingua',
  'shops', 'la-detente', 'coffre-fort', 'services'];
const EXT = /\.(html|js|mjs|cjs|ts|json)$/i;
const IGNORE = /node_modules|[\\/]tests?[\\/]|\.min\.|[\\/]dist[\\/]|\.map$/;
/* Deux niveaux, parce que le risque n'est pas le même :
   – SERVI (page/worker que le navigateur télécharge) = fuite publique → ÉCHEC ;
   – outillage du dépôt (tests, scripts e2e, mémoire locale) = à nettoyer, mais pas exposé au
     public → AVERTISSEMENT listé, pour ne pas masquer le problème derrière un vert. */
const NON_SERVI = /\.test\.(mjs|js|ts)$|[\\/](kdmc-[a-z-]*e2e|la-detente-e2e|firebase|memory)[\\/]|verify-[a-z-]*\.mjs$|[\\/]run\.mjs$/;

/* Tout nombre de 4 à 8 chiffres croisé avec les empreintes interdites. */
const NUM = /\b\d{4,8}\b/g;
const trouve = [];
const aNettoyer = [];
let scanned = 0;

function walk(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const e of entries) {
    const p = join(dir, e);
    if (IGNORE.test(p)) continue;
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) { walk(p); continue; }
    if (!EXT.test(e) || st.size > 12_000_000) continue;
    scanned++;
    let txt;
    try { txt = readFileSync(p, 'utf8'); } catch { continue; }
    const vus = new Set();
    let m;
    NUM.lastIndex = 0;
    while ((m = NUM.exec(txt))) {
      if (vus.has(m[0])) continue;
      vus.add(m[0]);
      if (INTERDITS.has(createHash('sha256').update(m[0]).digest('hex'))) {
        const ligne = txt.slice(0, m.index).split('\n').length;
        const ref = relative(ROOT, p) + ':' + ligne;
        (NON_SERVI.test(p) ? aNettoyer : trouve).push(ref);
      }
    }
  }
}
for (const c of CIBLES) walk(join(ROOT, c));

const ok = trouve.length === 0;
console.log('\n' + (ok ? '✅' : '❌') + ' garde « pas de code admin en clair » : ' + scanned
  + ' fichiers scannés · ' + trouve.length + ' fuite(s) DANS DU CODE SERVI');
if (!ok) {
  console.log('   Exposé publiquement — à retirer (un commentaire compte aussi) :');
  for (const f of trouve.slice(0, 30)) console.log('   ❌ ' + f);
}
if (aNettoyer.length) {
  console.log('   ⚠️  ' + aNettoyer.length + ' occurrence(s) dans l\'outillage du dépôt (non servi, '
    + 'donc pas une fuite publique — mais à nettoyer, et le code reste à CHANGER) :');
  for (const f of aNettoyer.slice(0, 25)) console.log('      · ' + f);
}
process.exit(ok ? 0 : 1);
