/* GARDE — aucun marqueur de conflit Git ne doit entrer dans le dépôt.
 *
 * CAUSE RACINE (vécue le 2026-08-06) : après un merge, `git checkout --ours`
 * n'avait été appliqué qu'à 2 fichiers, puis `git add -A` a mis en scène un
 * package.json ENCORE en conflit. Résultat : package.json invalide poussé sur
 * la branche → plus aucun `npm run` ne démarrait. Aucun garde ne l'a vu, et
 * aucun crochet pre-commit n'est installé dans ce dépôt (seulement des
 * exemples .sample). D'où ce test, câblé dans le gate : il coûte 1 seconde et
 * empêche définitivement de repousser ce cas.
 *
 * Vérifie AUSSI que les fichiers JSON du dépôt se parsent — un package.json
 * cassé bloque tout le reste, ça doit échouer ICI et pas au 40ᵉ test.
 *
 * Lancer : node tests/no-conflict-markers.test.mjs
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const TEXT = /\.(json|js|mjs|cjs|ts|html|css|yml|yaml|md|sh|toml)$/i;
// Les marqueurs sont légitimes DANS ce fichier (on les décrit) et dans les docs
// qui expliquent comment les repérer.
const SELF = ['tests/no-conflict-markers.test.mjs'];

let files = [];
try {
  files = execSync('git ls-files -z', { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 })
    .toString().split('\0').filter(Boolean);
} catch (e) {
  console.error('FAIL impossible de lister les fichiers suivis :', e.message);
  process.exit(1);
}

const START = '<' + '<'.repeat(6) + ' ';
const MID = '='.repeat(7);
const END = '>' + '>'.repeat(6) + ' ';

const bad = [];
const badJson = [];
let scanned = 0, jsonChecked = 0;

for (const rel of files) {
  if (!TEXT.test(rel) || SELF.includes(rel)) continue;
  const abs = path.join(ROOT, rel);
  let st; try { st = fs.statSync(abs); } catch { continue; }
  if (!st.isFile() || st.size > 8 * 1024 * 1024) continue;
  const txt = fs.readFileSync(abs, 'utf8');
  scanned++;
  const lines = txt.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith(START) || l === MID || l.startsWith(END)) {
      bad.push(`${rel}:${i + 1}  ${l.slice(0, 60)}`);
      break;                       // une occurrence suffit pour signaler le fichier
    }
  }
  // On ne parse QUE les JSON de code/config. Les captures brutes de recherche
  // (arbre/research/…raw/) contiennent volontairement la réponse telle quelle,
  // y compris un message d'erreur d'API — ce n'est pas du JSON et c'est normal.
  const rawCapture = /\/(fixtures|research)\//.test(rel) || /raw\//.test(rel);
  if (rel.endsWith('.json') && !rawCapture) {
    jsonChecked++;
    try { JSON.parse(txt); } catch (e) { badJson.push(`${rel} → ${e.message.slice(0, 90)}`); }
  }
}

console.log(`Marqueurs de conflit : ${scanned} fichiers analysés, ${jsonChecked} JSON vérifiés.`);
if (bad.length) {
  console.error(`\nFAIL ${bad.length} fichier(s) contiennent un marqueur de conflit Git :`);
  bad.slice(0, 20).forEach((b) => console.error('  ' + b));
  console.error('\n→ Un merge a été committé sans être résolu. Résous le conflit puis recommite.');
}
if (badJson.length) {
  console.error(`\nFAIL ${badJson.length} fichier(s) JSON illisibles :`);
  badJson.forEach((b) => console.error('  ' + b));
}
if (bad.length || badJson.length) process.exit(1);
console.log('OK aucun marqueur de conflit, tous les JSON se parsent.');
