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
// Lockdown shops par rôle : 'on' applique les .write role:admin aux écritures admin
// (products/logos/selection) depuis le bloc _phase_shops_rolelock. 'off' = écriture
// anon+validation actuelle (n'affecte JAMAIS les commandes clients ni les lectures).
const SHOPS_LOCK = (process.env.SHOPS_LOCK || 'off').toLowerCase();

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
  // Lockdown shops par rôle (custom-token) — applique les .write role:admin si SHOPS_LOCK=on.
  // N'altère QUE products/logos/selection ; orders + lectures intacts.
  if (SHOPS_LOCK === 'on') {
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
  // garde-fou : ne JAMAIS toucher apex/coffre/deny racine
  if (rules['.read'] !== false || rules['.write'] !== false) throw new Error('SECURITÉ : deny racine perdu, abort');
  if (rules.apex['.read'] !== true) throw new Error('SECURITÉ : /apex modifié par erreur, abort');

  const token = await getAccessToken();
  console.log('✅ access_token obtenu');

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
  console.log('✅ Vérif OK — base ' + (STATE === 'open' ? 'rouverte' : 'fermée (auth requise)'));
})().catch(e => { console.error('❌ ' + e.message); process.exit(1); });
