#!/usr/bin/env node
/**
 * Publie les règles Firebase RTDB du projet cmcteams-c16ab via le SERVICE ACCOUNT
 * (secrets GitHub FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY). Zéro clic Kevin.
 *
 * Source de vérité = firebase-rules-apex.json (objet "rules"). Publie EXACTEMENT lui,
 * sauf si RULES_STATE=open → rollback : remet /cmcteams .read/.write = true.
 *
 * Étapes : (1) JWT RS256 signé SA → access_token Google ; (2) PUT /.settings/rules.json ;
 * (3) GET de vérif → confirme l'état de /cmcteams. Échoue fort + détaillé (règle CLAUDE.md).
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DB = 'https://cmcteams-c16ab-default-rtdb.europe-west1.firebasedatabase.app';
const ROOT = path.resolve(__dirname, '..', '..');
const RULES_FILE = path.join(ROOT, 'firebase-rules-apex.json');
const STATE = (process.env.RULES_STATE || 'hardened').toLowerCase();
// Durcissement /apex + /coffre_vault (Kevin 2026-07-04 « Durci ») :
// 'hardened' (défaut) = auth != null (état du fichier) | 'open' = rollback lecture/écriture libres.
const APEX_STATE = (process.env.APEX_STATE || 'hardened').toLowerCase();
// Lockdown shops par rôle : 'on' applique les .write role:admin aux écritures admin
// (products/logos/selection) depuis le bloc _phase_shops_rolelock. 'off' = écriture
// anon+validation actuelle (n'affecte JAMAIS les commandes clients ni les lectures).
// 'keep' (défaut) = préserve l'état LIVE actuel du lock shops (lu avant publication)
// → re-déclencher ce workflow pour /cmcteams ou /apex ne change JAMAIS les shops par accident.
const SHOPS_LOCK = (process.env.SHOPS_LOCK || 'keep').toLowerCase();

function b64url(buf){ return Buffer.from(buf).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }

async function getAccessToken(){
  let email = process.env.FIREBASE_CLIENT_EMAIL;
  let raw = (process.env.FIREBASE_PRIVATE_KEY || '').trim();
  if (!email || !raw) throw new Error('Secrets manquants : FIREBASE_CLIENT_EMAIL et/ou FIREBASE_PRIVATE_KEY');
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) raw = raw.slice(1, -1);

  let raw2 = raw;
  // secret = JSON complet du service account → extraire private_key
  if (raw2.startsWith('{')) { try { const j = JSON.parse(raw2); if (j.private_key) raw2 = j.private_key; if (j.client_email && !email) email = j.client_email; } catch (_) {} }
  raw2 = raw2.replace(/\\r/g, '').replace(/\\n/g, '\n');

  // MÉTHODE FIDÈLE au worker qui marche (apex-auth-worker importPrivateKey) :
  // strip armure + tout caractère non-base64 → DER → createPrivateKey pkcs8.
  let keyObj = null, how = '';
  if (/-----BEGIN/.test(raw2)) { try { keyObj = crypto.createPrivateKey(raw2); how = 'pem'; } catch (_) {} }
  if (!keyObj) {
    let b64 = raw2.replace(/-----BEGIN[^-]*-----/g, '').replace(/-----END[^-]*-----/g, '').replace(/[^A-Za-z0-9+/]/g, '');
    while (b64.length % 4) b64 += '=';
    try { const der = Buffer.from(b64, 'base64'); keyObj = crypto.createPrivateKey({ key: der, format: 'der', type: 'pkcs8' }); how = 'der-pkcs8(b64=' + b64.length + ' der=' + der.length + ')'; }
    catch (e) { how = 'der KO: ' + e.message; }
  }
  console.log('   clé: ' + (keyObj ? ('OK ' + how) : ('ÉCHEC ' + how)));
  if (!keyObj) throw new Error('FIREBASE_PRIVATE_KEY illisible (PEM + DER pkcs8 échoués) — ' + how);
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600
  }));
  const signed = crypto.createSign('RSA-SHA256').update(header + '.' + claim).sign(keyObj);
  const jwt = header + '.' + claim + '.' + b64url(signed);
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + encodeURIComponent(jwt)
  });
  const j = await r.json().catch(() => null);
  if (!r.ok || !j || !j.access_token) throw new Error('OAuth token KO : HTTP ' + r.status + ' ' + JSON.stringify(j));
  return j.access_token;
}

(async () => {
  const doc = JSON.parse(fs.readFileSync(RULES_FILE, 'utf8'));
  const rules = doc.rules;
  if (!rules || !rules.cmcteams) throw new Error('firebase-rules-apex.json : objet rules.cmcteams introuvable');

  if (STATE === 'open') { // rollback
    rules.cmcteams['.read'] = true;
    rules.cmcteams['.write'] = true;
    console.log('⏪ ROLLBACK : /cmcteams .read/.write = true');
  } else {
    console.log('🔒 HARDEN : /cmcteams .read/.write = ' + JSON.stringify(rules.cmcteams['.read']));
  }
  const token = await getAccessToken();
  console.log('✅ access_token obtenu');

  // SHOPS_LOCK=keep → lire l'état LIVE et le préserver (anti-régression : un run
  // déclenché pour durcir /apex ne doit pas rouvrir un lock shops déjà actif).
  let shopsLock = SHOPS_LOCK;
  if (shopsLock === 'keep') {
    try {
      const cur = await fetch(DB + '/.settings/rules.json?access_token=' + encodeURIComponent(token)).then(r => r.json());
      const w = cur && cur.rules && cur.rules.shops_admin_v1 && cur.rules.shops_admin_v1.products
        && cur.rules.shops_admin_v1.products.$shop && cur.rules.shops_admin_v1.products.$shop.$id
        && cur.rules.shops_admin_v1.products.$shop.$id['.write'];
      shopsLock = /role/.test(String(w || '')) ? 'on' : 'off';
      console.log('🔎 SHOPS_LOCK=keep → état live détecté : ' + shopsLock);
    } catch (e) {
      throw new Error('SHOPS_LOCK=keep : lecture des règles live impossible (' + e.message + '), abort (ne pas publier à l\'aveugle)');
    }
  }

  // Lockdown shops par rôle (custom-token) — applique les .write role:admin si lock actif.
  // N'altère QUE products/logos/selection ; orders + lectures intacts.
  if (shopsLock === 'on') {
    const lock = doc._phase_shops_rolelock && doc._phase_shops_rolelock.writes;
    if (!lock) throw new Error('SHOPS_LOCK=on mais bloc _phase_shops_rolelock.writes absent, abort');
    const setWrite = (dotPath, val) => {
      const parts = dotPath.split('/'); let node = rules;
      for (const p of parts) { if (!node[p]) node[p] = {}; node = node[p]; }
      node['.write'] = val;
    };
    Object.keys(lock).forEach((p) => setWrite(p, lock[p]));
    // garde-fou : ne JAMAIS verrouiller les commandes clients
    const ow = rules.shops_admin_v1.orders.$shop.$orderId['.write'];
    if (/role/.test(String(ow))) throw new Error('SECURITÉ : orders ne doit PAS exiger role:admin (clients), abort');
    console.log('🔒 SHOPS_LOCK=on : products/logos/selection .write = role:admin (orders inchangé)');
  } else {
    console.log('🛟 SHOPS_LOCK=off : écriture shops anon+validation (inchangé)');
  }
  // /apex + /coffre_vault : hardened (défaut, état du fichier = auth != null) ou rollback open
  if (APEX_STATE === 'open') {
    rules.apex['.read'] = true;
    rules.apex['.write'] = true; // rollback = sémantique pré-durcissement (write au niveau parent)
    rules.coffre_vault['.read'] = true;
    rules.coffre_vault['.write'] = true;
    console.log('⏪ ROLLBACK APEX : /apex + /coffre_vault .read/.write = true');
  } else {
    if (JSON.stringify(rules.apex['.read']) !== '"auth != null"') throw new Error('SECURITÉ : /apex .read attendu "auth != null" dans le fichier, abort');
    if (JSON.stringify(rules.coffre_vault['.read']) !== '"auth != null"') throw new Error('SECURITÉ : /coffre_vault .read attendu "auth != null" dans le fichier, abort');
    console.log('🔒 HARDEN : /apex + /coffre_vault .read/.write = auth != null');
  }
  // garde-fou : ne JAMAIS perdre le deny racine
  if (rules['.read'] !== false || rules['.write'] !== false) throw new Error('SECURITÉ : deny racine perdu, abort');

  const put = await fetch(DB + '/.settings/rules.json?access_token=' + encodeURIComponent(token), {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rules })
  });
  const putBody = await put.text();
  if (!put.ok) throw new Error('PUT rules KO : HTTP ' + put.status + ' — ' + putBody.slice(0, 300));
  console.log('✅ Règles publiées (HTTP ' + put.status + ')');

  // vérif
  const get = await fetch(DB + '/.settings/rules.json?access_token=' + encodeURIComponent(token));
  const live = await get.json().catch(() => null);
  const cr = live && live.rules && live.rules.cmcteams && live.rules.cmcteams['.read'];
  console.log('🔎 Vérif live : /cmcteams .read = ' + JSON.stringify(cr));
  const expect = STATE === 'open' ? true : 'auth != null';
  if (JSON.stringify(cr) !== JSON.stringify(expect)) throw new Error('Vérif KO : attendu ' + JSON.stringify(expect) + ', live ' + JSON.stringify(cr));
  const ar = live && live.rules && live.rules.apex && live.rules.apex['.read'];
  const vr = live && live.rules && live.rules.coffre_vault && live.rules.coffre_vault['.read'];
  console.log('🔎 Vérif live : /apex .read = ' + JSON.stringify(ar) + ' · /coffre_vault .read = ' + JSON.stringify(vr));
  const expectApex = APEX_STATE === 'open' ? true : 'auth != null';
  if (JSON.stringify(ar) !== JSON.stringify(expectApex)) throw new Error('Vérif KO /apex : attendu ' + JSON.stringify(expectApex) + ', live ' + JSON.stringify(ar));
  if (JSON.stringify(vr) !== JSON.stringify(expectApex)) throw new Error('Vérif KO /coffre_vault : attendu ' + JSON.stringify(expectApex) + ', live ' + JSON.stringify(vr));

  // Vérif COMPORTEMENTALE (lesson #95 : un état de règles ne prouve rien — tester
  // un vrai appel) : GET anonyme sur chaque path durci → 401 attendu quand hardened.
  async function anonProbe(path) {
    const r = await fetch(DB + path + '.json?shallow=true');
    return r.status;
  }
  const sApex = await anonProbe('/apex');
  const sCoffre = await anonProbe('/coffre_vault');
  const sCmc = await anonProbe('/cmcteams');
  console.log('🔬 Probe anonyme : /apex=' + sApex + ' /coffre_vault=' + sCoffre + ' /cmcteams=' + sCmc);
  if (APEX_STATE !== 'open') {
    if (sApex === 200) throw new Error('DANGER : /apex lisible SANS auth malgré hardened, abort');
    if (sCoffre === 200) throw new Error('DANGER : /coffre_vault lisible SANS auth malgré hardened, abort');
  }
  if (STATE !== 'open' && sCmc === 200) throw new Error('DANGER : /cmcteams lisible SANS auth malgré hardened, abort');
  console.log('✅ Vérif OK — /cmcteams ' + (STATE === 'open' ? 'ouvert' : 'fermé') + ' · /apex + /coffre_vault ' + (APEX_STATE === 'open' ? 'ouverts' : 'fermés (auth requise)'));

  // PURGE credentials du cloud partagé (audit 2026-07-07) — SEULEMENT en hardened.
  // ax_admin_pin/ax_pin/ax_user/ax_uid/ax_admin_pass sont FB_LOCAL (règle #40/#41) :
  // ils ne doivent JAMAIS vivre dans la base partagée. Les règles bloquent déjà leur
  // ÉCRITURE (.write:false), mais /apex .read:"auth != null" est nécessaire au SSE
  // temps réel (/apex.json entier, firebase.ts:819) → on ne peut PAS révoquer la
  // lecture d'une clé sous un parent qui l'accorde (cascade RTDB). On ferme donc la
  // fuite À LA SOURCE : pas de donnée = rien à lire. DELETE service-account (bypass
  // règles), idempotent (404/absent = no-op). N'affecte PAS ax_pin_<uid> per-user.
  if (APEX_STATE !== 'open') {
    const CREDS = ['ax_admin_pin', 'ax_pin', 'ax_user', 'ax_uid', 'ax_admin_pass'];
    for (const k of CREDS) {
      try {
        const chk = await fetch(DB + '/apex/' + k + '.json?shallow=true&access_token=' + encodeURIComponent(token));
        const had = chk.ok && (await chk.json().catch(() => null)) !== null;
        const del = await fetch(DB + '/apex/' + k + '.json?access_token=' + encodeURIComponent(token), { method: 'DELETE' });
        console.log('🧹 purge /apex/' + k + ' : ' + (had ? 'PRÉSENT → supprimé' : 'absent (no-op)') + ' (HTTP ' + del.status + ')');
      } catch (e) {
        console.log('⚠ purge /apex/' + k + ' échouée (non-bloquant) : ' + e.message);
      }
    }
  }
})().catch(e => { console.error('❌ ' + e.message); process.exit(1); });
