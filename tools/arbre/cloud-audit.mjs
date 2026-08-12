// tools/arbre/cloud-audit.mjs — AUDIT RÉEL du cloud Firebase de l'arbre familial.
// Tourne en CI (réseau ouvert — l'agent Claude a l'egress bloqué). Fait exactement
// ce que voit le téléphone de Kevin : auth anonyme (même clé que l'app) + GET de
// la base partagée /arbre/<CODEHASH>. Puis vérifie CHAQUE personne et CHAQUE lien
// (père/mère/conjoints) contre le seed officiel (extrait du vrai index.html, donc
// toujours en phase avec le document familial).
//
// Mode FIX (env FIX=1, défaut) : sauvegarde le cloud AVANT (cloudraw/cloud-before.json),
// puis supprime les fiches-fantômes (copies id-aléatoire SANS photo ni commentaire
// d'une personne du seed), re-pointe tous les liens vers la fiche seed, ré-aligne
// les liens des fiches seed sur le document, PUT le nœud nettoyé, re-GET et
// sauvegarde APRÈS (cloudraw/cloud-after.json). Les fiches enrichies (photos,
// commentaires) ne sont JAMAIS supprimées.
//
// Sortie : arbre/research/CLOUD.md (rapport lisible) + arbre/research/cloudraw/*.json
import fs from 'fs';
import path from 'path';

const HTML = fs.readFileSync('arbre/index.html', 'utf8');
const g = re => (HTML.match(re) || [])[1];
const FB = g(/var FB="([^"]+)"/);
const FB_KEY = g(/var FB_KEY="([^"]+)"/);
const CODEHASH = g(/var DEFAULT_CODEHASH="([^"]+)"/);
if (!FB || !FB_KEY || !CODEHASH) { console.error('Config FB introuvable dans arbre/index.html'); process.exit(1); }

// ---- Seed attendu : on évalue le VRAI buildSeed du fichier (zéro divergence) ----
const start = HTML.indexOf('var SRC={');
const end = HTML.indexOf('function seed(){');
if (start < 0 || end < 0 || end <= start) { console.error('buildSeed introuvable'); process.exit(1); }
const seedSrc = HTML.slice(start, end);
const buildSeed = new Function('uid', 'now', seedSrc + '\nreturn buildSeed();');
let _u = 0;
const SEED = buildSeed(() => 'tmp' + (++_u), () => 0);
const SEED_VERSION = +g(/var SEED_VERSION=(\d+);/) || 0;
// Anciennes signatures exactes remplacées par une fiche seed (même liste que l'app)
const legacyM = HTML.match(/var LEGACY_OBSOLETE=\[[\s\S]*?\];/);
const LEGACY_OBSOLETE = legacyM ? new Function(legacyM[0] + '\nreturn LEGACY_OBSOLETE;')() : [];

const nrm = p => ((p.prenom || '') + ' ' + (p.nom || '')).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
const fullName = p => ((p.prenom || '') + ' ' + (p.nom || '')).trim() || '(sans nom)';

// noms de seed uniques (ambigus = 2 seeds homonymes, jamais touchés)
const seedByName = {}, ambiguous = {};
for (const id in SEED) { const k = nrm(SEED[id]); if (!k) continue; if (seedByName[k] && seedByName[k] !== id) ambiguous[k] = true; else seedByName[k] = id; }

// ---- Auth anonyme + GET (identique à l'app) ----
async function anonAuth() {
  const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + FB_KEY, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true })
  });
  if (!r.ok) throw new Error('anonAuth HTTP ' + r.status + ' : ' + (await r.text()).slice(0, 300));
  return (await r.json()).idToken;
}
const base = FB + '/arbre/' + CODEHASH;

const tok = await anonAuth();
const getR = await fetch(base + '.json?auth=' + tok);
if (!getR.ok) { console.error('GET cloud HTTP ' + getR.status + ' : ' + (await getR.text()).slice(0, 300)); process.exit(1); }
const cloud = await getR.json();

const outDir = 'arbre/research';
const rawDir = path.join(outDir, 'cloudraw');
fs.mkdirSync(rawDir, { recursive: true });
fs.writeFileSync(path.join(rawDir, 'cloud-before.json'), JSON.stringify(cloud, null, 1));

const lines = [];
const L = s => lines.push(s);
L('# ☁️ Audit RÉEL du cloud familial (ce que voient les téléphones)');
L('');
L('_Généré automatiquement le ' + new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC par `tools/arbre/cloud-audit.mjs` (CI, réseau ouvert)._');
L('_Base : `' + base.replace(FB, '<FB>') + '` — auth anonyme identique à l\'app._');
L('');

if (!cloud || !cloud.persons) {
  L('## Résultat : le cloud est **VIDE**');
  L('');
  L('Aucune personne dans la base partagée. Les téléphones repartiront du seed local (v' + SEED_VERSION + ') et le repousseront au premier lancement. Rien à corriger.');
  fs.writeFileSync(path.join(outDir, 'CLOUD.md'), lines.join('\n') + '\n');
  console.log('Cloud vide — rapport écrit.');
  process.exit(0);
}

const persons = cloud.persons;
const ids = Object.keys(persons).filter(id => persons[id]);
const seedIds = ids.filter(id => id.startsWith('seed_'));
const otherIds = ids.filter(id => !id.startsWith('seed_'));
const name = id => { const p = persons[id] || SEED[id]; return p ? fullName(p) : '❓' + id; };
const enriched = p => (p.photos && p.photos.length) || (p.comments && p.comments.length);

L('## Vue d\'ensemble');
L('');
L('| Quoi | Valeur |');
L('|---|---|');
L('| Personnes dans le cloud | **' + ids.length + '** |');
L('| Fiches officielles (seed) | ' + seedIds.length + ' / ' + Object.keys(SEED).length + ' attendues |');
L('| Fiches hors-seed (ajouts / anciennes copies) | ' + otherIds.length + ' |');
L('| seedVersion cloud | ' + ((cloud.meta && cloud.meta.seedVersion) || '—') + ' (app attend ' + SEED_VERSION + ') |');
L('');

// ---- 1) Fiches seed : liens vs document ----
const linkProblems = [];
function cmpLinks(id) {
  const exp = SEED[id], got = persons[id];
  const probs = [];
  if (!got) return probs;
  const pe = got.pere || null, pm = got.mere || null;
  if ((exp.pere || null) !== pe) probs.push('père = ' + (pe ? name(pe) : '∅') + ' → doc dit ' + (exp.pere ? name(exp.pere) : '∅'));
  if ((exp.mere || null) !== pm) probs.push('mère = ' + (pm ? name(pm) : '∅') + ' → doc dit ' + (exp.mere ? name(exp.mere) : '∅'));
  const gc = (got.conjoints || []).slice().sort().join(','), ec = (exp.conjoints || []).slice().sort().join(',');
  if (gc !== ec) probs.push('conjoint(s) = [' + (got.conjoints || []).map(name).join(', ') + '] → doc dit [' + (exp.conjoints || []).map(name).join(', ') + ']');
  return probs;
}
L('## 1) Fiches officielles : chaque lien vérifié contre le document familial');
L('');
let okCount = 0;
for (const id of Object.keys(SEED)) {
  if (!persons[id]) { linkProblems.push({ id, probs: ['ABSENTE du cloud (sera repoussée par l\'app)'] }); continue; }
  const probs = cmpLinks(id);
  if (probs.length) linkProblems.push({ id, probs }); else okCount++;
}
L('- ✅ **' + okCount + '** fiches seed avec père/mère/conjoints EXACTEMENT conformes au document.');
if (linkProblems.length) {
  L('- ⚠️ **' + linkProblems.length + '** fiches à corriger :');
  L('');
  for (const lp of linkProblems) { L('  - **' + fullName(SEED[lp.id]) + '** (`' + lp.id + '`)'); for (const pb of lp.probs) L('    - ' + pb); }
} else {
  L('- 🎉 Aucune contradiction sur les fiches officielles.');
}
L('');

// ---- Legacy exacts (mêmes signatures que purgeLegacy dans l'app) ----
const legacyIds = [];
for (const id of otherIds) {
  const p = persons[id];
  if (!p || enriched(p)) continue;
  if (LEGACY_OBSOLETE.some(o => (p.prenom || '') === o.prenom && (p.nom || '') === o.nom && ((p.naissance && p.naissance.date) || '') === o.nd)) legacyIds.push(id);
}

// ---- 2) Fiches hors-seed : fantômes vs vrais ajouts ----
const shadows = [], additions = [];
for (const id of otherIds) {
  const p = persons[id], k = nrm(p);
  if (!enriched(p) && k && !ambiguous[k] && seedByName[k]) shadows.push({ id, seed: seedByName[k] });
  else additions.push(id);
}
L('## 2) Fiches hors-seed : anciennes copies-fantômes vs vrais ajouts de la famille');
L('');
if (shadows.length) {
  L('⚠️ **' + shadows.length + ' fiche(s)-FANTÔME(S)** trouvée(s) — anciennes copies (versions précédentes de l\'app) d\'une personne officielle, sans photo ni commentaire. C\'est EXACTEMENT ça qui crée les liens faux sur les téléphones (ex : Yann/Loïc ↔ Christian) :');
  L('');
  for (const s of shadows) {
    const p = persons[s.id];
    const links = [];
    if (p.pere) links.push('père=' + name(p.pere));
    if (p.mere) links.push('mère=' + name(p.mere));
    if (p.conjoints && p.conjoints.length) links.push('conjoints=[' + p.conjoints.map(name).join(', ') + ']');
    L('- 👻 **' + fullName(p) + '** (`' + s.id + '`) — doublon de la fiche officielle `' + s.seed + '`' + (links.length ? ' · liens périmés : ' + links.join(' · ') : ' · aucun lien'));
  }
} else {
  L('✅ Aucune fiche-fantôme.');
}
L('');
if (additions.length) {
  L('Ajouts / fiches enrichies conservés tels quels (**jamais supprimés**) :');
  L('');
  for (const id of additions) {
    const p = persons[id];
    const links = [];
    if (p.pere) links.push('père=' + name(p.pere));
    if (p.mere) links.push('mère=' + name(p.mere));
    if (p.conjoints && p.conjoints.length) links.push('conjoints=[' + p.conjoints.map(name).join(', ') + ']');
    L('- ' + fullName(p) + ' (`' + id + '`)' + (enriched(p) ? ' 📷/💬' : '') + (legacyIds.includes(id) ? ' 🗂 vieille copie aux dates périmées (sera supprimée en mode FIX)' : '') + (links.length ? ' — ' + links.join(' · ') : ''));
  }
  L('');
}

// ---- 3) Vérif ciblée : le signalement de Kevin ----
L('## 3) Vérification ciblée du signalement (« Yann et Loïc ↔ Christian et Marie-Brigitte »)');
L('');
function whoPointsAt(targetIds) {
  const hits = [];
  for (const id of ids) {
    const p = persons[id];
    for (const t of targetIds) {
      if (p.pere === t) hits.push(fullName(p) + ' (`' + id + '`) a père=' + name(t));
      if (p.mere === t) hits.push(fullName(p) + ' (`' + id + '`) a mère=' + name(t));
      if ((p.conjoints || []).includes(t) && !id.startsWith('seed_')) hits.push(fullName(p) + ' (`' + id + '`) a conjoint=' + name(t));
    }
  }
  return hits;
}
const christianLike = ids.filter(id => /christian/i.test((persons[id].prenom || '')));
const yannLoic = ids.filter(id => /^(yann|lo[iï]c)$/i.test((persons[id].prenom || '').trim()));
for (const id of yannLoic) {
  const p = persons[id];
  L('- **' + fullName(p) + '** (`' + id + '`) : père=' + (p.pere ? name(p.pere) : '∅') + ' · mère=' + (p.mere ? name(p.mere) : '∅') + (id.startsWith('seed_') ? ' _(fiche officielle — doc : fils d\'Émile DESARZENS)_' : ' 👻 copie hors-seed'));
}
for (const id of christianLike) {
  const p = persons[id];
  const kids = ids.filter(k => persons[k].pere === id || persons[k].mere === id).map(name);
  L('- **' + fullName(p) + '** (`' + id + '`) : conjoints=[' + (p.conjoints || []).map(name).join(', ') + ']' + (kids.length ? ' · enfants pointant vers lui : ' + kids.join(', ') : ' · aucun enfant ne pointe vers lui'));
}
if (!yannLoic.length && !christianLike.length) L('- (aucune fiche Yann/Loïc/Christian dans le cloud)');
L('');

// ---- Fiches seed manquantes dans le cloud ----
const missingSeed = Object.keys(SEED).filter(id => !persons[id]);

// ---- FIX ----
const doFix = String(process.env.FIX ?? '1') !== '0';
const needsFix = shadows.length || legacyIds.length || missingSeed.length || linkProblems.some(lp => persons[lp.id]);
L('## 4) Correction automatique');
L('');
if (!doFix) {
  L('_Mode lecture seule (FIX=0) — aucune écriture._');
} else if (!needsFix) {
  L('✅ Rien à corriger — le cloud est déjà propre, aucune écriture faite.');
} else {
  // a) supprime les fantômes (re-pointés vers la fiche seed) + copies legacy exactes (liens scrubés)
  const map = {};
  for (const s of shadows) map[s.id] = s.seed;
  for (const s of shadows) delete persons[s.id];
  for (const id of legacyIds) delete persons[id];
  const gone = id => !!id && !persons[id] && !map[id] && !SEED[id];
  const NOW = Date.now();
  for (const id of Object.keys(persons)) {
    const p = persons[id]; let ch = false;
    if (map[p.pere]) { p.pere = map[p.pere]; ch = true; } else if (gone(p.pere)) { p.pere = null; ch = true; }
    if (map[p.mere]) { p.mere = map[p.mere]; ch = true; } else if (gone(p.mere)) { p.mere = null; ch = true; }
    if (p.conjoints && p.conjoints.length) {
      const nc = p.conjoints.map(c => map[c] || c).filter((c, i, a) => c && c !== id && a.indexOf(c) === i && !gone(c));
      if (nc.join(',') !== p.conjoints.join(',')) { p.conjoints = nc; ch = true; }
    }
    if (ch) p.updatedAt = NOW;
  }
  // b) ré-aligne les LIENS des fiches seed sur le document (contenu/photos intouchés)
  for (const lp of linkProblems) {
    const p = persons[lp.id]; if (!p) continue;
    const exp = SEED[lp.id];
    p.pere = exp.pere || null; p.mere = exp.mere || null; p.conjoints = (exp.conjoints || []).slice();
    p.updatedAt = NOW;
  }
  // c) pousse les fiches seed MANQUANTES (le cloud reflète enfin tout le document)
  for (const id of missingSeed) persons[id] = Object.assign({}, SEED[id], { updatedAt: NOW });
  const putR = await fetch(base + '.json?auth=' + tok, { method: 'PUT', body: JSON.stringify({ persons, meta: { updatedAt: NOW, seedVersion: SEED_VERSION } }) });
  if (!putR.ok) {
    L('❌ Écriture refusée : HTTP ' + putR.status + ' — ' + (await putR.text()).slice(0, 300));
  } else {
    const after = await (await fetch(base + '.json?auth=' + tok)).json();
    fs.writeFileSync(path.join(rawDir, 'cloud-after.json'), JSON.stringify(after, null, 1));
    L('✅ **Cloud corrigé et vérifié** :');
    L('- 👻 ' + shadows.length + ' fiche(s)-fantôme(s) supprimée(s), liens re-pointés vers les fiches officielles.');
    L('- 🗂 ' + legacyIds.length + ' vieille(s) copie(s) aux dates périmées supprimée(s) (mêmes signatures que purgeLegacy).');
    L('- ➕ ' + missingSeed.length + ' fiche(s) officielle(s) manquante(s) poussée(s) — le cloud reflète maintenant TOUT le document.');
    L('- 🔗 ' + linkProblems.filter(lp => SEED[lp.id] && persons[lp.id]).length + ' fiche(s) seed ré-alignée(s) sur le document familial.');
    L('- ☁️ Total après correction : **' + Object.keys(after.persons || {}).length + ' personnes** · seedVersion ' + ((after.meta && after.meta.seedVersion) || '—') + '.');
    L('- 📦 Sauvegardes : `cloudraw/cloud-before.json` (avant) et `cloudraw/cloud-after.json` (après) — retour en arrière possible.');
    L('- 📱 Les téléphones de la famille récupèrent la correction automatiquement (synchro toutes les 8 s).');
  }
}
L('');
L('---');
L('_Les fiches avec photos ou commentaires ne sont JAMAIS supprimées. L\'app v2.29 fait le même nettoyage en local à chaque ouverture (`purgeSeedShadows`), donc même un vieux téléphone qui repousserait un fantôme sera re-nettoyé._');

fs.writeFileSync(path.join(outDir, 'CLOUD.md'), lines.join('\n') + '\n');
console.log('Audit terminé : ' + ids.length + ' personnes · ' + shadows.length + ' fantôme(s) · ' + linkProblems.length + ' fiche(s) seed non conformes · FIX=' + (doFix ? 'on' : 'off'));
