// Usage: node preparer-toml.mjs <dossier-worker> <sortie.toml>
// Sort sur stdout la liste des bindings KV a re-creer (un par ligne: BINDING<TAB>ANCIEN_ID)
import { readFileSync, writeFileSync } from 'node:fs';
const [dir, out] = process.argv.slice(2);
const lignes = readFileSync(`${dir}/wrangler.toml`, 'utf8').split('\n');
const garde = []; let section = ''; let kv = []; let bindingCourant = null;
for (const l of lignes) {
  const sec = l.match(/^\s*\[\[?([a-z0-9_.]+)\]?\]/i);
  if (sec) { section = sec[1]; bindingCourant = null; }
  if (section === 'routes' || /^\s*routes\s*=/.test(l)) continue;        // pas de zone ici
  if (/^\s*(pattern|zone_name|custom_domain)\s*=/.test(l)) continue;
  if (section === 'kv_namespaces') {
    const b = l.match(/binding\s*=\s*"([^"]+)"/); if (b) bindingCourant = b[1];
    const i = l.match(/^\s*id\s*=\s*"([^"]+)"/);
    if (i && bindingCourant) { kv.push(`${bindingCourant}\t${i[1]}`); garde.push(`id = "@@${bindingCourant}@@"`); continue; }
  }
  if (/^\s*\[\[?routes\]?\]/.test(l)) continue;
  garde.push(l);
}
writeFileSync(out, garde.join('\n'));
console.log(kv.join('\n'));
