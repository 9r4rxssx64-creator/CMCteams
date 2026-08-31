// audit passe-3 — GARDE CONFIDENTIALITÉ CLÉ IA (F-C1) — « cause racine → prévention »
// F-C1 = la clé Anthropic de l'admin vit en clair dans localStorage. Les corrections
// risquées (chiffrer au repos = théâtre device-local, lecon #55 ; forcer le proxy par
// défaut = couper l'IA si Kevin n'a pas de proxy) sont ÉCARTÉES : « ne rien casser ».
// Ce qui compte vraiment = que la clé ne QUITTE JAMAIS le device (elle est déjà
// documentée « ne quitte pas votre device »). Ce garde VERROUILLE les 2 seuls vecteurs
// par lesquels elle pourrait fuir, pour qu'une édition future ne réintroduise pas le
// P0 de la lecon #787 (clé poussée EN CLAIR vers la DB Firebase OUVERTE) :
//   (a) cmc_ia_key DOIT rester dans FB_LOCAL (jamais synchronisé vers Firebase) ;
//   (b) _adminCfgBackup (PUT /cmc_admin_cfg.json) NE DOIT PAS embarquer la clé.
// Test statique (déterministe, 0 régression). Échoue si un des invariants saute.
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
const fail = [];

// (a) cmc_ia_key ∈ FB_LOCAL — sinon ls() le synchroniserait vers la DB Firebase ouverte.
const mLocal = html.match(/var\s+FB_LOCAL\s*=\s*\[([\s\S]*?)\]/);
if (!mLocal) fail.push('FB_LOCAL introuvable (structure changée ?)');
else {
  const arr = mLocal[1];
  for (const k of ['cmc_ia_key', 'cmc_ia_proxy', 'cmc_admin_pin']) {
    if (!new RegExp('"' + k + '"').test(arr)) fail.push(k + ' ABSENT de FB_LOCAL → il serait synchronisé vers Firebase (fuite)');
  }
}
// Contre-preuve : ces clés ne doivent PAS être dans FB_FIX (liste synchronisée).
const mFix = html.match(/var\s+FB_FIX\s*=\s*\[([\s\S]*?)\]/);
if (mFix && /"cmc_ia_key"/.test(mFix[1])) fail.push('cmc_ia_key présent dans FB_FIX (serait poussé vers Firebase !)');

// (b) l'objet cfg de _adminCfgBackup (poussé vers /cmc_admin_cfg.json) NE contient PAS la clé.
const mBk = html.match(/function\s+_adminCfgBackup\s*\(\)\s*\{[\s\S]*?\n\}/);
if (!mBk) fail.push('_adminCfgBackup introuvable (structure changée ?)');
else {
  const body = mBk[0];
  const mCfg = body.match(/var\s+cfg\s*=\s*\{([\s\S]*?)\n\s*\};/);
  const cfgObj = mCfg ? mCfg[1] : body;
  // aucune propriété n'assigne la clé (iaKey:, "cmc_ia_key", iaApiKey, _resolveIaKey)
  if (/iaKey\s*:/.test(cfgObj)) fail.push('_adminCfgBackup : champ iaKey réintroduit dans le PUT Firebase (P0 lecon #787)');
  if (/cmc_ia_key|iaApiKey|_resolveIaKey/.test(cfgObj)) fail.push('_adminCfgBackup : la clé est référencée dans l\'objet cfg poussé vers Firebase');
}

console.log('\n=== GARDE CONFIDENTIALITÉ CLÉ IA (F-C1 / lecon #787) ===');
if (fail.length) {
  fail.forEach((f) => console.log('  ✗ ' + f));
  console.log('\n❌ La clé IA pourrait fuir vers la DB Firebase ouverte. Garder cmc_ia_key dans FB_LOCAL et hors du backup admin.');
  process.exit(1);
}
console.log('  ✓ cmc_ia_key/cmc_ia_proxy/cmc_admin_pin ∈ FB_LOCAL (jamais synchronisés)');
console.log('  ✓ cmc_ia_key absent de FB_FIX');
console.log('  ✓ _adminCfgBackup ne pousse pas la clé vers Firebase');
console.log('✅ GARDE CLÉ IA : la clé ne quitte pas le device (vecteurs de fuite verrouillés)');
process.exit(0);
