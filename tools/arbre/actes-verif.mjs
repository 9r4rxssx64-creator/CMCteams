/* =============================================================================
   ARBRE — VÉRIFICATION DES ACTES PERSONNE PAR PERSONNE (local, sans réseau)
   -----------------------------------------------------------------------------
   Demande Kevin 2026-08-04 : « Vérifie tous les actes pour chaque personne citée.
   Naissances, décès. » → tableau exhaustif : pour CHACUNE des personnes du seed,
   où en est l'acte de naissance et l'acte de décès (trouvé ✓ / verrouillé par la
   loi / base bloquée / vivant), et l'action qui reste pour l'obtenir.
   Sortie : arbre/research/ACTES-VERIF.md. Usage : node tools/arbre/actes-verif.mjs
============================================================================= */
import fs from 'fs';

const html = fs.readFileSync('arbre/index.html', 'utf8');
const start = html.indexOf('var SRC={');
const endMark = html.indexOf('function seed()');
const code = html.slice(start, endMark);
const fn = new Function('uid', 'now', code + '; return buildSeed();');
let n = 0;
const seedObj = fn(() => ('u' + (n++)), () => Date.now());
const seed = Object.values(seedObj);

const THIS_YEAR = new Date().getFullYear();
function year(d) { const m = String((d || {}).date || '').match(/(\d{4})/); return m ? +m[1] : null; }
function lieu(d) { return String((d || {}).lieu || '').trim(); }
function srcLabels(p) { return (p.sources || []).map(s => (s && s.label) || '').join(' | '); }

/* Classement naissance */
function naissanceStatus(p) {
  const y = year(p.naissance), l = lieu(p.naissance).toLowerCase();
  const S = srcLabels(p);
  if (/acte de naissance/i.test(S)) return ['✅ TROUVÉ', 'image scannée / référence dans la fiche'];
  if (!y) return ['❔ date inconnue', 'demander à la famille (année + lieu) pour cibler la bonne base'];
  const communicable = (THIS_YEAR - y) >= 100;
  if (/monaco/.test(l)) {
    if (y >= 1900 && communicable) return ['🔎 base Monaco ≥1900', 'robot images en cours — acte attendu'];
    if (y < 1900) return ['🔎 base Monaco <1900', 'robot images en cours — registres indexés'];
    return ['🔒 verrouillé (loi 100 ans)', 'demande officielle par courrier — chip 📋 dans la fiche'];
  }
  if (/nice|beaulieu|cannes|antibes|menton/.test(l)) {
    if (communicable) return ['🚧 AD06 (mur anti-robot)', 'consulter archives06.fr depuis le téléphone de Kevin (lien dans la fiche)'];
    return ['🔒 verrouillé (loi 100 ans)', 'demande officielle mairie — chip 📋 dans la fiche'];
  }
  if (/marseille|salon/.test(l)) {
    if (communicable) return ['🔎 AD13 accessible', 'à cibler au prochain run robot (registres numérisés)'];
    return ['🔒 verrouillé (loi 100 ans)', 'demande officielle mairie — chip 📋 dans la fiche'];
  }
  if (/suisse|lausanne|vaud|sarzens/.test(l)) return ['🔎 Archives vaudoises (davel)', 'registres paroissiaux VD — piste robot'];
  if (communicable) return ['🔎 à localiser', 'lieu hors bases connues — préciser la commune'];
  return ['🔒 verrouillé (loi 100 ans)', 'demande officielle mairie — chip 📋 dans la fiche'];
}

/* Classement décès */
function decesStatus(p) {
  if (p.vivant) return ['💚 vivant(e)', '—'];
  const y = year(p.deces), l = lieu(p.deces).toLowerCase();
  const S = srcLabels(p);
  if (/acte de décès|INSEE/i.test(S)) return ['✅ TROUVÉ (INSEE)', 'décès officiel vérifié'];
  if (!y && !(p.deces && p.deces.date)) return ['❔ inconnu', 'peut-être vivant(e) — à confirmer avec la famille'];
  if (!y) return ['❔ date incomplète', 'compléter l\'année pour chercher'];
  if (y >= 1970 && !/monaco|suisse/.test(l)) return ['🔎 INSEE devrait l\'avoir', 'relancer le robot INSEE (variantes du nom)'];
  if (/monaco/.test(l)) {
    const communicable = (THIS_YEAR - y) >= 75; /* décès Monaco : base en ligne partielle */
    return communicable ? ['🔎 base Monaco', 'robot images — table décès'] : ['🔒 récent (Monaco)', 'mairie de Monaco — état civil'];
  }
  if (/suisse/.test(l)) return ['🔎 Suisse', 'hommages.ch + état civil du canton (sonde en cours)'];
  if (y < 1970) return ['🚧 avant 1970 (hors INSEE)', 'archives départementales du lieu de décès'];
  return ['🔎 à chercher', 'préciser le lieu'];
}

/* Tri par famille puis par année de naissance */
const rows = seed.map(p => {
  const [ns, na] = naissanceStatus(p);
  const [ds, da] = decesStatus(p);
  return {
    nom: ((p.prenom || '') + ' ' + (p.nom || '')).trim() || p.id,
    fam: p.nom || '?',
    y: year(p.naissance) || 9999,
    naissance: ((p.naissance || {}).date || '?') + (lieu(p.naissance) ? ' à ' + lieu(p.naissance) : ''),
    deces: p.vivant ? '—' : (((p.deces || {}).date || '?') + (lieu(p.deces) ? ' à ' + lieu(p.deces) : '')),
    ns, na, ds, da,
  };
}).sort((a, b) => a.fam.localeCompare(b.fam) || a.y - b.y);

const stats = { nTrouve: 0, dTrouve: 0, vivants: 0, verrou: 0, ad06: 0 };
rows.forEach(r => {
  if (r.ns.startsWith('✅')) stats.nTrouve++;
  if (r.ds.startsWith('✅')) stats.dTrouve++;
  if (r.ds.startsWith('💚')) stats.vivants++;
  if (r.ns.startsWith('🔒')) stats.verrou++;
  if (r.ns.startsWith('🚧')) stats.ad06++;
});

const L = [];
L.push('# 📜 Vérification des actes — personne par personne (' + new Date().toISOString().slice(0, 10) + ')');
L.push('');
L.push('**' + seed.length + ' personnes.** Naissances trouvées : **' + stats.nTrouve + '** · Décès trouvés (INSEE) : **' + stats.dTrouve + '** · Vivants : ' + stats.vivants + ' · Naissances verrouillées par la loi des 100 ans : ' + stats.verrou + ' · Bloquées par le mur AD06 : ' + stats.ad06);
L.push('');
L.push('Légende : ✅ acte obtenu · 🔎 robot/base en cours · 🚧 base bloquée pour les robots (accessible depuis un téléphone) · 🔒 acte trop récent, verrouillé par la loi (demande par courrier — bouton 📋 dans chaque fiche) · 💚 vivant(e) · ❔ info manquante');
L.push('');
L.push('| Personne | Naissance | Acte naissance | Décès | Acte décès | Prochaine action |');
L.push('|---|---|---|---|---|---|');
rows.forEach(r => {
  const action = r.ns.startsWith('✅') && (r.ds.startsWith('✅') || r.ds.startsWith('💚')) ? 'rien — complet ✓' : (r.na !== '—' && !r.ns.startsWith('✅') ? r.na : r.da);
  L.push('| **' + r.nom + '** | ' + r.naissance + ' | ' + r.ns + ' | ' + r.deces + ' | ' + r.ds + ' | ' + action + ' |');
});
L.push('');
L.push('_Généré automatiquement par `tools/arbre/actes-verif.mjs` — relancer après chaque run robot._');

fs.writeFileSync('arbre/research/ACTES-VERIF.md', L.join('\n') + '\n');
console.log('OK — arbre/research/ACTES-VERIF.md (' + seed.length + ' personnes, naissances ✓ ' + stats.nTrouve + ', décès ✓ ' + stats.dTrouve + ')');
