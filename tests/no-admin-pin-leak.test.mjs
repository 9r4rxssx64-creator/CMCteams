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
/* Les COPIES de déploiement du routeur (public/, pages-upload/, app-tools-departs/) sont
   gitignorées et régénérées depuis les sources suivies : on juge les sources, pas des
   copies locales périmées (sinon un vieux build dans le bac à sable fait un faux rouge). */
const IGNORE = /node_modules|[\\/]tests?[\\/]|\.min\.|[\\/]dist[\\/]|\.map$|[\\/]kdmc-router[\\/](public|pages-upload|app-tools-departs)[\\/]/;
/* Deux niveaux, parce que le risque n'est pas le même :
   – SERVI (page/worker que le navigateur télécharge) = fuite publique → ÉCHEC ;
   – outillage du dépôt (tests, scripts e2e, mémoire locale) = à nettoyer, mais pas exposé au
     public → AVERTISSEMENT listé, pour ne pas masquer le problème derrière un vert. */
const NON_SERVI = /\.test\.(mjs|js|ts)$|[\\/](kdmc-[a-z-]*e2e|la-detente-e2e|firebase|memory)[\\/]|verify-[a-z-]*\.mjs$|[\\/]run\.mjs$/;

/* Tout nombre de 4 à 8 chiffres croisé avec les empreintes interdites. */
const NUM = /\b\d{4,8}\b/g;
/* TROUVÉ LE 2026-09-05 : la page Départs embarquait `PIN_SHA256="cbb0…"` — l'EMPREINTE du code,
   pas le code. Ce garde passait au vert. Or l'empreinte sha256 d'un code à 6 chiffres se casse en
   une seconde (10⁶ essais) : la publier revient à publier le code — et le dépôt est PUBLIC.
   Deux contrôles de plus, dont un STRUCTUREL qui ne dépend pas du code du jour :
   (a) tout 64-hex égal à l'empreinte d'un code interdit ; (b) toute variable nommée PIN…SHA…
   qui reçoit un 64-hex littéral — quel que soit le code derrière. La vérification d'un code
   se fait côté serveur (POST /__admin/login), jamais par comparaison dans la page. */
const HEX64 = /\b[0-9a-f]{64}\b/gi;
const PIN_SHA_LITTERAL = /\b[A-Za-z_]*PIN[A-Za-z0-9_]*SHA[A-Za-z0-9_]*\s*=\s*["'][0-9a-f]{64}["']/i;
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
    const signale = (index, quoi) => {
      const ligne = txt.slice(0, index).split('\n').length;
      const ref = relative(ROOT, p) + ':' + ligne + (quoi ? ' (' + quoi + ')' : '');
      (NON_SERVI.test(p) ? aNettoyer : trouve).push(ref);
    };
    while ((m = NUM.exec(txt))) {
      if (vus.has(m[0])) continue;
      vus.add(m[0]);
      if (INTERDITS.has(createHash('sha256').update(m[0]).digest('hex'))) signale(m.index, '');
    }
    HEX64.lastIndex = 0;
    while ((m = HEX64.exec(txt))) {
      if (INTERDITS.has(m[0].toLowerCase())) signale(m.index, 'empreinte du code');
    }
    const s = PIN_SHA_LITTERAL.exec(txt);
    if (s && p !== fileURLToPath(import.meta.url)) signale(s.index, 'empreinte de code embarquée côté client');
  }
}
for (const c of CIBLES) walk(join(ROOT, c));

/* La DOC du dépôt aussi (dépôt PUBLIC : un .md se lit depuis n'importe où). Le 5.09.2026 le code
   était en clair dans CLAUDE.md, NOTES_USER.md, KEVIN_INVENTORY.md… 68 fichiers. On scanne les
   .md de la racine et des dossiers de doc : le code en clair y est une FUITE, pas un « à nettoyer ». */
const DOCS = ['.', 'docs', 'messaging-app', 'shops', 'la-detente', 'coffre-fort', '.claude'];
for (const d of DOCS) {
  let entries = [];
  try { entries = readdirSync(join(ROOT, d)); } catch { continue; }
  for (const e of entries) {
    if (!/\.md$/i.test(e)) continue;
    const p = join(ROOT, d, e);
    let txt; try { txt = readFileSync(p, 'utf8'); } catch { continue; }
    scanned++;
    const vus = new Set(); let m; NUM.lastIndex = 0;
    while ((m = NUM.exec(txt))) {
      if (vus.has(m[0])) continue; vus.add(m[0]);
      if (INTERDITS.has(createHash('sha256').update(m[0]).digest('hex'))) {
        trouve.push(relative(ROOT, p) + ':' + txt.slice(0, m.index).split('\n').length + ' (doc publique)');
      }
    }
    HEX64.lastIndex = 0;
    while ((m = HEX64.exec(txt))) if (INTERDITS.has(m[0].toLowerCase())) trouve.push(relative(ROOT, p) + ' (empreinte du code dans la doc)');
  }
}

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
