// tools/arbre/research-registres.mjs — RÉCUPÉRATION AUTO DES ACTES (registres numérisés).
// Tourne en CI (réseau ouvert). Pour chaque personne du seed avec un lieu connu,
// interroge les bases d'archives officielles qui publient les registres SCANNÉS :
//   • Monaco  : archives.mairie.mc (Omeka S — API /api/items + recherche plein texte)
//   • AD06    : archives06.fr + ancienne base basesdocumentaires-cg06.fr (état civil Nice/Beaulieu…)
//   • AD13    : archives13.fr (état civil Salon-de-Provence…)
// Stratégie : probes défensives (chaque endpoint peut avoir changé), TOUT le brut est
// commité dans arbre/research/registresraw/ pour itérer, et REGISTRES.md résume les
// liens de visionneuse trouvés par personne (à intégrer ensuite dans les fiches).
import fs from 'fs';
import path from 'path';

const HTML = fs.readFileSync('arbre/index.html', 'utf8');
const start = HTML.indexOf('var SRC={');
const end = HTML.indexOf('function seed(){');
const buildSeed = new Function('uid', 'now', HTML.slice(start, end) + '\nreturn buildSeed();');
let _u = 0;
const SEED = buildSeed(() => 'tmp' + (++_u), () => 0);

const outDir = 'arbre/research';
const rawDir = path.join(outDir, 'registresraw');
fs.mkdirSync(rawDir, { recursive: true });

const yr = d => { const m = String(d || '').match(/(\d{4})/); return m ? +m[1] : 0; };
const NOWY = new Date().getFullYear();
const UA = { 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', 'accept-language': 'fr' };

async function probe(name, url, opts) {
  try {
    const r = await fetch(url, { headers: UA, redirect: 'follow', ...(opts || {}) });
    const txt = await r.text();
    fs.writeFileSync(path.join(rawDir, name), txt.slice(0, 400000));
    console.log('[probe]', name, r.status, txt.length + 'o', url);
    return { status: r.status, body: txt, finalUrl: r.url };
  } catch (e) {
    console.log('[probe]', name, 'ERREUR', e.message, url);
    fs.writeFileSync(path.join(rawDir, name), 'ERREUR ' + e.message + '\n' + url);
    return { status: 0, body: '', error: e.message };
  }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---- Cibles : personnes avec lieu + année communicable (les scans en ligne
//      s'arrêtent en général ~1925 naissances / ~1945 pour le reste) ----
const targets = [];
for (const id in SEED) {
  const p = SEED[id];
  const nom = ((p.prenom || '') + ' ' + (p.nom || '')).trim();
  const bl = ((p.naissance && p.naissance.lieu) || '').toLowerCase();
  const by = yr(p.naissance && p.naissance.date);
  const dl = ((p.deces && p.deces.lieu) || '').toLowerCase();
  const dy = yr(p.deces && p.deces.date);
  const dept = l => /monaco/.test(l) ? 'MC' : /nice|beaulieu|villefranche|cagnes|antibes|cannes|vence/.test(l) ? '06' : /salon|marseille|aix/.test(l) ? '13' : null;
  if (by && bl && NOWY - by >= 100 && dept(bl)) targets.push({ id, nom, type: 'naissance', lieu: (p.naissance.lieu || ''), an: by, dept: dept(bl) });
  if (dy && dl && NOWY - dy >= 75 && dept(dl)) targets.push({ id, nom, type: 'décès', lieu: (p.deces.lieu || ''), an: dy, dept: dept(dl) });
  // mariages notés dans le doc (75 ans) — MT×Victor 1939 Monaco? lieu inconnu → skip
}
targets.sort((a, b) => a.dept.localeCompare(b.dept) || a.an - b.an);
console.log('Cibles :', targets.length);

// ---- 1) Monaco — Omeka S : API items + recherche plein texte par NOM ----
const mcNames = [...new Set(targets.filter(t => t.dept === 'MC').map(t => (t.nom.split(' ').pop() || '')))];
const mcFound = {};
await probe('monaco-home.html', 'https://archives.mairie.mc/s/3/base-de-registres-a-partir-de-1900/');
await probe('monaco-api-root.json', 'https://archives.mairie.mc/api/items?per_page=2');
for (const nm of [...mcNames, 'MAIFFRET', 'SAUVAIGO', 'DESARZENS']) {
  const r = await probe('monaco-api-search-' + nm + '.json', 'https://archives.mairie.mc/api/items?fulltext_search=' + encodeURIComponent(nm) + '&per_page=50');
  await sleep(1200);
  try {
    const items = JSON.parse(r.body);
    if (Array.isArray(items) && items.length) {
      mcFound[nm] = items.map(it => ({
        titre: (it['o:title'] || '').slice(0, 160),
        url: (it['@id'] || '').replace('/api/items/', '/s/3/item/')
      }));
      console.log('  Monaco «' + nm + '» :', items.length, 'résultat(s)');
    }
  } catch (e) { /* pas du JSON → brut commité pour itérer */ }
}
// recherche du site public (au cas où l'API est fermée)
await probe('monaco-site-search.html', 'https://archives.mairie.mc/s/3/recherche?fulltext_search=MAIFFRET');

// ---- 2) AD06 — nouvelle plateforme + ancienne base état civil ----
await probe('ad06-home.html', 'https://archives06.fr/');
await probe('ad06-etatcivil.html', 'https://archives06.fr/archives-en-ligne/etat-civil');
await probe('ad06-search-nice.html', 'https://archives06.fr/rechercher?query=' + encodeURIComponent('état civil Nice naissances'));
// ancienne base Arkothèque (longtemps la porte d'entrée état civil 06)
await probe('ad06-old-ec.html', 'http://www.basesdocumentaires-cg06.fr/os_ecivile/');
await probe('ad06-old-ec2.html', 'http://www.basesdocumentaires-cg06.fr/archives/consultation_etat_civil.php');

// ---- 3) AD13 — état civil (Salon-de-Provence) ----
await probe('ad13-etatcivil.html', 'https://www.archives13.fr/archive/recherche/etatcivil/n:64');
await probe('ad13-salon.html', 'https://www.archives13.fr/archive/resultats/etatcivil/n:64?RECH_commune=SALON-DE-PROVENCE&type=etatcivil');

// ---- Rapport ----
const L = [];
L.push('# 📜 Récupération AUTO des actes — registres numérisés officiels');
L.push('');
L.push('_Généré le ' + new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC par `tools/arbre/research-registres.mjs` (CI, réseau ouvert). Brut complet dans `registresraw/` pour itération._');
L.push('');
L.push('## Cibles (actes assez anciens pour être consultables en ligne)');
L.push('');
L.push('| Personne | Acte | Lieu | Année | Base |');
L.push('|---|---|---|---|---|');
for (const t of targets) L.push('| ' + t.nom + ' | ' + t.type + ' | ' + t.lieu + ' | ' + t.an + ' | ' + (t.dept === 'MC' ? 'Monaco' : 'AD' + t.dept) + ' |');
L.push('');
L.push('## Monaco — résultats API (base registres ≥1900)');
L.push('');
const mk = Object.keys(mcFound);
if (mk.length) {
  for (const nm of mk) {
    L.push('### « ' + nm + ' » — ' + mcFound[nm].length + ' résultat(s)');
    for (const it of mcFound[nm].slice(0, 20)) L.push('- [' + (it.titre || 'item') + '](' + it.url + ')');
    L.push('');
  }
} else {
  L.push('_Aucun résultat JSON exploitable à ce run — voir `registresraw/monaco-*.json|html` pour adapter le prochain passage._');
}
L.push('');
L.push('## AD06 / AD13 — état des probes');
L.push('');
L.push('_Voir `registresraw/ad06-*.html` et `registresraw/ad13-*.html` (structure des formulaires / visionneuses) — le prochain run ciblera les bons endpoints détectés dedans._');
L.push('');
fs.writeFileSync(path.join(outDir, 'REGISTRES.md'), L.join('\n') + '\n');
fs.writeFileSync(path.join(rawDir, 'targets.json'), JSON.stringify(targets, null, 1));
console.log('REGISTRES.md écrit — ' + targets.length + ' cibles, Monaco: ' + mk.length + ' nom(s) avec résultats.');
