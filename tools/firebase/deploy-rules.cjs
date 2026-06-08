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

function b64url(buf){ return Buffer.from(buf).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }

async function getAccessToken(){
  let email = process.env.FIREBASE_CLIENT_EMAIL;
  let raw = (process.env.FIREBASE_PRIVATE_KEY || '').trim();
  if (!email || !raw) throw new Error('Secrets manquants : FIREBASE_CLIENT_EMAIL et/ou FIREBASE_PRIVATE_KEY');
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) raw = raw.slice(1, -1);

  let key = '';
  // cas 1 : le secret est tout le JSON du service account
  if (raw.startsWith('{')) { try { const j = JSON.parse(raw); if (j.private_key) key = j.private_key; if (j.client_email && !email) email = j.client_email; } catch (_) {} }
  if (!key) key = raw;
  key = key.replace(/\\r/g, '').replace(/\\n/g, '\n').trim();    // \n littéraux → vrais newlines

  // cas 2 : base64 d'un PEM complet
  if (!/-----BEGIN/.test(key)) { try { const d = Buffer.from(key.replace(/\s/g, ''), 'base64').toString('utf8'); if (/-----BEGIN/.test(d)) key = d.replace(/\\n/g, '\n'); } catch (_) {} }
  // cas 3 : corps base64 NU (sans armure) → envelopper en PKCS#8
  if (!/-----BEGIN/.test(key)) {
    const body = key.replace(/\s/g, '');
    if (/^[A-Za-z0-9+/=]+$/.test(body) && body.length > 800) {
      key = '-----BEGIN PRIVATE KEY-----\n' + body.match(/.{1,64}/g).join('\n') + '\n-----END PRIVATE KEY-----\n';
    }
  }
  const beginsPEM = /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/.test(key);
  console.log('   clé diag: len=' + key.length + ' beginsPEM=' + beginsPEM + (beginsPEM ? ' header="' + (key.match(/-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/) || [''])[0] + '"' : ' first8="' + key.slice(0, 8).replace(/[^ -~]/g, '?') + '" wasJSON=' + raw.startsWith('{')));
  if (!beginsPEM) throw new Error("FIREBASE_PRIVATE_KEY : format non reconnu (ni PEM, ni JSON SA, ni base64). len=" + key.length);
  // validation crypto explicite (erreur claire si la clé est corrompue)
  try { crypto.createPrivateKey(key); } catch (e) { throw new Error("Clé privée illisible par crypto : " + e.message); }
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600
  }));
  const signed = crypto.createSign('RSA-SHA256').update(header + '.' + claim).sign(key);
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
  // garde-fou : ne JAMAIS toucher apex/coffre/shops/deny racine
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
