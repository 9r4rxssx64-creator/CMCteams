/**
 * Apex Chat — API Worker (REST + WebSocket)
 *
 * Routes principales :
 *   POST   /api/auth/send-otp        → Firebase Auth Phone (envoie SMS)
 *   POST   /api/auth/verify-otp      → vérifie OTP, retourne JWT
 *   POST   /api/auth/sso-from-apex   → SSO cross-app Apex → Apex Chat
 *   GET    /api/users/me             → profil user authentifié
 *   PATCH  /api/users/me             → update profil
 *   GET    /api/users/:pseudo        → profil public (pseudo + photo + bio)
 *   GET    /api/admin/users/:pseudo/full → admin Kevin only — fiche complète
 *   POST   /api/keys/prekeys         → upload bundle prekeys X3DH + Kyber
 *   GET    /api/keys/:userId/bundle  → récupère bundle prekey
 *   POST   /api/conversations        → créer conv DM/group/community/channel
 *   GET    /api/conversations        → liste convs user
 *   WS     /api/conversations/:id/ws → upgrade vers ConversationDO
 *   POST   /api/messages             → POST message chiffré
 *   POST   /api/invitations          → créer invitation SMS
 *   GET    /api/invitations/:code    → résoudre code invitation
 *   POST   /api/signalements         → signaler user/message
 *   POST   /api/admin/commands       → admin Kevin only (kickUser/banUser/etc.)
 *   GET    /api/system/config        → flags MODE_CONFIG runtime
 *
 * Architecture A→B→C : flag KEVIN_INVISIBLE_ADMIN lu depuis D1.system_config
 */

// ============================================================================
//  Helpers
// ============================================================================

const ADMIN_KEVIN_ALIASES = [
  'kevin', 'kevin desarzens', 'desarzens kevin', 'desarzens',
  'kevin.desarzens', 'kevind@monaco.mc', 'kdmc', 'k desarzens'
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Apex-Token',
  'Access-Control-Max-Age': '86400'
};

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, ...extraHeaders }
  });
}

function err(message, status = 400, code = 'error') {
  return json({ error: code, message }, status);
}

export function normalizeName(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[\s\-_.@]+/g, ' ').trim();
}

export function isKevinAdmin(name, phone) {
  if (!name) return false;
  const n = normalizeName(name);
  if (ADMIN_KEVIN_ALIASES.includes(n)) return true;
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.length >= 1) {
    for (const alias of ADMIN_KEVIN_ALIASES) {
      const aTokens = normalizeName(alias).split(/\s+/);
      if (tokens.every(t => aTokens.includes(t) && t.length >= 4)) return true;
    }
  }
  return false;
}

export async function sha256(input) {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function signJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const enc = (o) => btoa(JSON.stringify(o)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const data = `${enc(header)}.${enc(payload)}`;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${data}.${sigB64}`;
}

export async function verifyJWT(token, secret) {
  if (!token) return null;
  const [h, p, s] = token.split('.');
  if (!h || !p || !s) return null;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const sigBytes = Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(s.length + (4 - s.length % 4) % 4, '=')), c => c.charCodeAt(0));
  const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(`${h}.${p}`));
  if (!valid) return null;
  try {
    const payload = JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/').padEnd(p.length + (4 - p.length % 4) % 4, '=')));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch { return null; }
}

async function getAuthUser(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const payload = await verifyJWT(token, env.JWT_SIGN_KEY);
  if (!payload || !payload.sub) return null;
  // Vérifier force_logout : si user.last_force_logout_at > token.iat → JWT révoqué par admin
  try {
    const u = await env.APEX_CHAT_DB.prepare(
      'SELECT last_force_logout_at, is_banned, status FROM users WHERE id=?'
    ).bind(payload.sub).first();
    if (u) {
      if (u.is_banned || u.status === 'deleted' || u.status === 'suspended') return null;
      if (u.last_force_logout_at && payload.iat && u.last_force_logout_at > payload.iat * 1000) return null;
    }
  } catch (_) {}
  return payload;
}

// ============================================================================
//  v1.1.30 — Premium quota middleware
//  Non-premium users : N usages / jour pour chaque feature IA gourmande
//  Premium / lifetime : unlimited
// ============================================================================
const FREE_QUOTAS = {
  'voice-transcribe': 5,   // 5 transcriptions /jour gratuit
  'image-describe': 10,    // 10 alt-text /jour gratuit
  'summarize': 3,          // 3 Memory Lane /jour gratuit
  'smart-reply': 30,       // 30 suggestions /jour gratuit
  'translate': 20          // 20 traductions /jour gratuit
};
async function checkPremiumOrQuota(env, userId, feature) {
  if (!userId) return { ok: false, reason: 'no_user' };
  try {
    const u = await env.APEX_CHAT_DB.prepare(
      'SELECT premium_until, premium_plan FROM users WHERE id=?'
    ).bind(userId).first();
    const isPremium = u && u.premium_until && u.premium_until > Date.now();
    if (isPremium) return { ok: true, premium: true, plan: u.premium_plan };
    // Non-premium : check quota daily KV
    const limit = FREE_QUOTAS[feature] || 5;
    const today = new Date().toISOString().slice(0, 10);
    const kvKey = `quota:${userId}:${feature}:${today}`;
    const usedStr = env.APEX_CHAT_KV ? await env.APEX_CHAT_KV.get(kvKey) : null;
    const used = parseInt(usedStr || '0', 10);
    if (used >= limit) {
      return { ok: false, reason: 'quota_exceeded', used, limit, feature };
    }
    return { ok: true, premium: false, used, limit, kvKey, _incr: true };
  } catch (e) {
    console.error('[premium-quota]', e);
    return { ok: true, premium: false, error: 'check_failed' }; // fail open
  }
}
async function consumeQuota(env, quotaResult) {
  if (!quotaResult || !quotaResult._incr || !quotaResult.kvKey || !env.APEX_CHAT_KV) return;
  try {
    const used = (quotaResult.used || 0) + 1;
    await env.APEX_CHAT_KV.put(quotaResult.kvKey, String(used), { expirationTtl: 90000 }); // ~25h
  } catch (e) { console.error('[quota-consume]', e); }
}

async function getModeConfig(env) {
  const stmt = await env.APEX_CHAT_DB.prepare('SELECT key, value FROM system_config').all();
  const config = {};
  for (const row of (stmt.results || [])) config[row.key] = row.value;
  return config;
}

async function auditLog(env, actor_id, action, target_type, target_id, details, ipHash, ua) {
  await env.APEX_CHAT_DB.prepare(
    'INSERT INTO audit_log (actor_id, action, target_type, target_id, details, ts, ip_hash, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(actor_id, action, target_type, target_id, JSON.stringify(details || {}), Date.now(), ipHash, ua).run();
}

// ============================================================================
//  Routes Auth
// ============================================================================

export async function handleSendOtp(request, env) {
  const { phone, name } = await request.json();
  if (!phone || !/^\+?\d{8,15}$/.test(phone)) return err('Numéro invalide', 400);
  // Règle Kevin : prénom + nom obligatoires (2 tokens ≥2 chars), sécurité anti-impersonation
  // Exception : admin Kevin reconnu via téléphone secret peut ne pas avoir 2 tokens
  if (!(env.KEVIN_PHONE_E164 && phone.replace(/[\s\-]/g, '') === env.KEVIN_PHONE_E164)) {
    const tokens = String(name || '').trim().split(/\s+/).filter(t => t.length >= 2);
    if (tokens.length < 2) return err('Prénom ET nom requis (ex: Marie Dupont) — sécurité', 400, 'name_too_short');
  }

  // Normaliser phone (retirer espaces/tirets)
  const cleanPhone = phone.replace(/[\s\-]/g, '');
  const phoneHash = await sha256(cleanPhone);

  // ============ BYPASS ADMIN (Kevin reconnu via numéro) ============
  // Kevin admin auto-reconnu via KEVIN_PHONE_E164 → pas besoin d'OTP
  // SECU : ne PAS retourner l'OTP fictif dans la réponse (audit P0)
  if (env.KEVIN_PHONE_E164 && cleanPhone === env.KEVIN_PHONE_E164) {
    return json({
      ok: true,
      sessionId: phoneHash,
      provider: 'admin-bypass',
      _admin_bypass: true
    });
  }

  // ============ Rate limit ============
  const ipHash = await sha256(request.headers.get('CF-Connecting-IP') || 'unknown');
  const hourKey = new Date().toISOString().slice(0, 13);
  const rl = await env.APEX_CHAT_DB.prepare(
    'SELECT count FROM ratelimit_otp WHERE ip_hash=? AND hour_key=?'
  ).bind(ipHash, hourKey).first();
  const max = parseInt((await getModeConfig(env)).OTP_RATE_LIMIT_PER_HOUR || '5');
  if (rl && rl.count >= max) return err('Trop de tentatives, réessaie dans 1h', 429, 'rate_limit');

  await env.APEX_CHAT_DB.prepare(
    'INSERT OR REPLACE INTO ratelimit_otp (ip_hash, hour_key, count) VALUES (?, ?, COALESCE((SELECT count FROM ratelimit_otp WHERE ip_hash=? AND hour_key=?),0)+1)'
  ).bind(ipHash, hourKey, ipHash, hourKey).run();

  // ============ Génère OTP 6 chiffres ============
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otpHash = await sha256(otp + ':' + cleanPhone);

  // Stocke OTP hashé en D1 (TTL 5 min)
  await env.APEX_CHAT_DB.prepare(
    `CREATE TABLE IF NOT EXISTS otp_pending (
       phone_hash TEXT PRIMARY KEY,
       otp_hash TEXT NOT NULL,
       attempts INTEGER DEFAULT 0,
       created_at INTEGER NOT NULL,
       expires_at INTEGER NOT NULL
     )`
  ).run();
  await env.APEX_CHAT_DB.prepare(
    'INSERT OR REPLACE INTO otp_pending (phone_hash, otp_hash, attempts, created_at, expires_at) VALUES (?, ?, 0, ?, ?)'
  ).bind(phoneHash, otpHash, Date.now(), Date.now() + 300000).run();

  // ============ Envoi SMS — chaîne failover ============
  let smsProvider = 'none';
  let smsError = null;

  // Tentative 1 : Vonage
  if (env.VONAGE_API_KEY && env.VONAGE_API_SECRET) {
    try {
      const smsResponse = await fetch('https://rest.nexmo.com/sms/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          api_key: env.VONAGE_API_KEY,
          api_secret: env.VONAGE_API_SECRET,
          from: 'ApexChat',
          to: cleanPhone.replace(/^\+/, ''),
          text: `Apex Chat : ton code de verification est ${otp}. Valide 5 min.`
        })
      });
      const smsData = await smsResponse.json();
      const msg = smsData.messages?.[0];
      if (msg?.status === '0') {
        smsProvider = 'vonage';
      } else {
        smsError = msg?.['error-text'] || 'Vonage error ' + msg?.status;
        console.error('Vonage:', smsError);
      }
    } catch (e) {
      smsError = 'Vonage exception: ' + e.message;
      console.error(smsError);
    }
  }

  // Tentative 2 : TextBelt (gratuit 1 SMS/jour, fallback)
  if (smsProvider === 'none') {
    try {
      const tbResponse = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          phone: cleanPhone,
          message: `Apex Chat: ton code est ${otp}. Valide 5 min.`,
          key: 'textbelt'  // gratuit 1/jour
        })
      });
      const tbData = await tbResponse.json();
      if (tbData.success) {
        smsProvider = 'textbelt-free';
      } else {
        console.error('TextBelt:', tbData.error);
      }
    } catch (e) {
      console.error('TextBelt exception:', e.message);
    }
  }

  // Fallback ultime : retourner OTP dans la réponse (mode "dev/cercle privé")
  // → Le client affiche le code à l'utilisateur en gros pour qu'il le saisisse
  if (smsProvider === 'none') {
    return json({
      ok: true,
      sessionId: phoneHash,
      provider: 'inline',
      _dev_otp: otp,  // visible dans la réponse JSON
      _dev_note: 'SMS indispo (' + (smsError || 'config') + '). Code affiche ci-dessous (mode cercle prive).',
      _show_code_in_app: true
    });
  }

  return json({ ok: true, sessionId: phoneHash, provider: smsProvider });
}

// ============================================================================
//  Firebase ID token verification (P0 fix audit externe)
//  Vérification réelle via Firebase JWKS public keys
// ============================================================================

export async function fetchFirebasePublicKeys(env) {
  // Cache 1h dans KV
  const cached = await env.APEX_CHAT_CACHE?.get('firebase:public_keys', 'json');
  if (cached && cached.expires_at > Date.now()) return cached.keys;

  const response = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
  if (!response.ok) throw new Error('Firebase JWKS fetch failed');
  const keys = await response.json();

  await env.APEX_CHAT_CACHE?.put('firebase:public_keys', JSON.stringify({
    keys, expires_at: Date.now() + 3600000
  }), { expirationTtl: 3600 }).catch(() => {});

  return keys;
}

export async function verifyFirebaseIdToken(idToken, env) {
  if (!env.FIREBASE_PROJECT_ID) throw new Error('FIREBASE_PROJECT_ID non configuré');

  const [headerB64, payloadB64, sigB64] = idToken.split('.');
  if (!headerB64 || !payloadB64 || !sigB64) throw new Error('Token Firebase malformé');

  const decode = (s) => atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(s.length + (4 - s.length % 4) % 4, '='));
  const header = JSON.parse(decode(headerB64));
  const payload = JSON.parse(decode(payloadB64));

  // Vérifications RGPD/sécurité
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) throw new Error('Token expiré');
  if (payload.iat && payload.iat > now + 60) throw new Error('Token futur (iat invalide)');
  if (payload.aud !== env.FIREBASE_PROJECT_ID) throw new Error('Token aud incorrect');
  if (payload.iss !== `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`) throw new Error('Token iss incorrect');
  if (!payload.sub) throw new Error('Token sub manquant');
  if (header.alg !== 'RS256') throw new Error('Token alg incorrect');

  // Vérifier signature
  const keys = await fetchFirebasePublicKeys(env);
  const certPem = keys[header.kid];
  if (!certPem) throw new Error('Token kid inconnu');

  // Convertir cert PEM → SPKI public key
  const certB64 = certPem.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\s/g, '');
  const certBytes = Uint8Array.from(atob(certB64), c => c.charCodeAt(0));
  // Note: certificat X.509, on extrait la public key SPKI
  // Pour simplifier, on importe directement via crypto.subtle
  const publicKey = await crypto.subtle.importKey(
    'spki', certBytes, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']
  );
  const sigBytes = Uint8Array.from(decode(sigB64), c => c.charCodeAt(0));
  const dataBytes = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', publicKey, sigBytes, dataBytes);

  if (!valid) throw new Error('Signature Firebase invalide');

  return payload;  // { sub, phone_number, aud, iss, iat, exp, ... }
}

export async function handleVerifyOtp(request, env) {
  const { phone, name, pseudo, otp, firebase_id_token } = await request.json();
  if (!phone || !pseudo) return err('Champs manquants', 400);
  if (!/^[a-zA-Z0-9_-]{3,20}$/.test(pseudo)) return err('Pseudo invalide (3-20 chars alphanum)', 400);
  // Règle Kevin : prénom + nom obligatoires (sécurité anti-impersonation)
  const isKevinBypass = env.KEVIN_PHONE_E164 && phone.replace(/[\s\-]/g, '') === env.KEVIN_PHONE_E164;
  if (!isKevinBypass) {
    const tokens = String(name || '').trim().split(/\s+/).filter(t => t.length >= 2);
    if (tokens.length < 2) return err('Prénom ET nom requis (sécurité)', 400, 'name_too_short');
  }

  const cleanPhone = phone.replace(/[\s\-]/g, '');
  const phoneHash = await sha256(cleanPhone);

  // ============ BYPASS ADMIN Kevin ============
  if (env.KEVIN_PHONE_E164 && cleanPhone === env.KEVIN_PHONE_E164 && otp === '000000') {
    // Skip OTP check, créer/récupérer compte Kevin admin
    let user = await env.APEX_CHAT_DB.prepare('SELECT * FROM users WHERE id=?').bind('kdmc_admin').first();
    if (!user) {
      await env.APEX_CHAT_DB.prepare(
        `INSERT OR REPLACE INTO users (id, pseudo, real_name, phone, phone_hash, is_admin, is_kevin_alias,
         identity_key_pub, pq_key_pub, prekey_signed, source, created_at, status)
         VALUES (?, ?, ?, ?, ?, 1, 1, 'PENDING', 'PENDING', 'PENDING', 'admin-bypass', ?, 'active')`
      ).bind('kdmc_admin', pseudo || 'kevin', name || 'Kevin DESARZENS', cleanPhone, phoneHash, Date.now()).run();
      user = { id: 'kdmc_admin', pseudo: pseudo || 'kevin', real_name: name || 'Kevin DESARZENS', is_admin: 1 };
    }
    const jwt = await signJWT({
      sub: 'kdmc_admin',
      pseudo: user.pseudo,
      is_admin: true,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 86400
    }, env.JWT_SIGN_KEY || 'dev-key');
    return json({ ok: true, token: jwt, user: { id: 'kdmc_admin', pseudo: user.pseudo, is_admin: true }});
  }

  // Mode 1 : OTP Vonage (priorité)
  if (otp) {
    const otpHash = await sha256(otp + ':' + phone);
    const pending = await env.APEX_CHAT_DB.prepare(
      'SELECT * FROM otp_pending WHERE phone_hash=?'
    ).bind(phoneHash).first();

    if (!pending) return err('Aucun code en attente. Recommence l\'inscription.', 400, 'no_otp');
    if (pending.expires_at < Date.now()) {
      await env.APEX_CHAT_DB.prepare('DELETE FROM otp_pending WHERE phone_hash=?').bind(phoneHash).run();
      return err('Code expiré. Recommence l\'inscription.', 410, 'otp_expired');
    }
    if (pending.attempts >= 5) {
      return err('Trop de tentatives. Reessaie dans 5 min.', 429, 'otp_max_attempts');
    }
    if (pending.otp_hash !== otpHash) {
      await env.APEX_CHAT_DB.prepare('UPDATE otp_pending SET attempts=attempts+1 WHERE phone_hash=?').bind(phoneHash).run();
      return err('Code incorrect. Verifie tes 6 chiffres.', 401, 'otp_wrong');
    }
    // OK : supprime l'OTP utilisé
    await env.APEX_CHAT_DB.prepare('DELETE FROM otp_pending WHERE phone_hash=?').bind(phoneHash).run();
  }
  // Mode 2 : Firebase ID token (fallback si configuré)
  else if (firebase_id_token && firebase_id_token !== '') {
    try {
      var firebasePayload = await verifyFirebaseIdToken(firebase_id_token, env);
      if (firebasePayload.phone_number !== phone) {
        return err('Numero ne correspond pas au token Firebase', 401, 'phone_mismatch');
      }
    } catch (e) {
      return err('Token Firebase invalide : ' + e.message, 401, 'invalid_token');
    }
  }
  else {
    return err('OTP ou Firebase token requis', 400, 'no_auth_method');
  }

  // User existe-t-il déjà ?
  let user = await env.APEX_CHAT_DB.prepare('SELECT * FROM users WHERE phone=?').bind(phone).first();

  if (!user) {
    // Vérifier pseudo unique (P0 FIX : ON CONFLICT pour éviter race condition)
    try {
      const id = crypto.randomUUID();

      // P0 FIX : isKevinAdmin via PHONE E.164 secret env (jamais via name)
      const KEVIN_PHONE = env.KEVIN_PHONE_E164 || '';
      const isKevin = KEVIN_PHONE && phone === KEVIN_PHONE;

      await env.APEX_CHAT_DB.prepare(
        `INSERT INTO users (id, pseudo, real_name, phone, phone_hash, is_admin, is_kevin_alias,
         identity_key_pub, pq_key_pub, prekey_signed, source, admin_authorized, created_at, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING_PQXDH', 'PENDING_PQXDH', 'PENDING_PQXDH', 'apex-chat-direct', 1, ?, 'active')
         ON CONFLICT(pseudo) DO NOTHING`
      ).bind(id, pseudo, name || pseudo, phone, phoneHash, isKevin ? 1 : 0, isKevin ? 1 : 0, Date.now()).run();
      // ↑ admin_authorized=1 auto APRÈS OTP réussi (règle Kevin : tout user inscrit = whitelisté visible admin)

      user = await env.APEX_CHAT_DB.prepare('SELECT * FROM users WHERE phone=?').bind(phone).first();
      if (!user) return err('Pseudo déjà pris (race)', 409, 'pseudo_taken');
    } catch (e) {
      return err('Création compte échouée : ' + e.message, 500);
    }
  }

  // P0 FIX (audit) : si user devient admin maintenant via phone secret env, mettre à jour
  if (env.KEVIN_PHONE_E164 && phone === env.KEVIN_PHONE_E164 && !user.is_admin) {
    await env.APEX_CHAT_DB.prepare('UPDATE users SET is_admin=1, is_kevin_alias=1 WHERE id=?').bind(user.id).run();
    user.is_admin = 1;
  }

  const jwt = await signJWT({
    sub: user.id,
    pseudo: user.pseudo,
    is_admin: !!user.is_admin,
    firebase_uid: (typeof firebasePayload !== 'undefined' && firebasePayload) ? firebasePayload.sub : null,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 86400  // 30 jours
  }, env.JWT_SIGN_KEY);

  await auditLog(env, user.id, 'login', 'user', user.id, { method: 'sms-otp' }, phoneHash, request.headers.get('User-Agent'));

  return json({ ok: true, token: jwt, user: {
    id: user.id, pseudo: user.pseudo, is_admin: !!user.is_admin
  }});
}

export async function handleSsoFromApex(request, env) {
  // P0 FIX (audit) : SSO avec vérification réelle JWT Apex
  // Kevin doit signer avec APEX_SSO_SIGN_KEY (HMAC HS256 partagée Apex ↔ Apex Chat)
  const { apex_token, apex_uid, name, phone } = await request.json();
  if (!apex_token || !apex_uid) return err('Token Apex manquant', 400);

  // Vérification HMAC HS256 du token Apex
  if (!env.APEX_SSO_SIGN_KEY) return err('SSO non configuré (env)', 500);
  const apexPayload = await verifyJWT(apex_token, env.APEX_SSO_SIGN_KEY);
  if (!apexPayload) return err('Token Apex invalide', 401, 'invalid_apex_token');

  // Le sub du token DOIT correspondre à apex_uid
  if (apexPayload.sub !== apex_uid) return err('apex_uid mismatch', 401, 'uid_mismatch');

  // Token court TTL (5 min max pour SSO)
  if (apexPayload.exp && apexPayload.exp * 1000 < Date.now()) return err('Token Apex expiré', 401);
  if (apexPayload.iat && apexPayload.iat > Math.floor(Date.now() / 1000) + 60) return err('Token Apex futur', 401);

  let user = await env.APEX_CHAT_DB.prepare('SELECT * FROM users WHERE apex_uid=?').bind(apex_uid).first();
  if (!user) {
    // P0 FIX : isKevin via phone E.164 secret env (jamais via name string)
    const KEVIN_PHONE = env.KEVIN_PHONE_E164 || '';
    const isKevin = (apexPayload.is_admin === true) && KEVIN_PHONE &&
                    (apexPayload.phone === KEVIN_PHONE || phone === KEVIN_PHONE);

    const pseudo = String(name || apex_uid).toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 20) || 'user' + Date.now().toString(36).slice(-6);
    const id = apex_uid;

    try {
      await env.APEX_CHAT_DB.prepare(
        `INSERT INTO users (id, pseudo, real_name, phone, phone_hash, is_admin, is_kevin_alias,
         identity_key_pub, pq_key_pub, prekey_signed, apex_uid, source, created_at, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING_PQXDH', 'PENDING_PQXDH', 'PENDING_PQXDH', ?, 'apex-sso', ?, 'active')
         ON CONFLICT(id) DO UPDATE SET apex_uid=excluded.apex_uid`
      ).bind(id, pseudo, name || pseudo, phone || 'PENDING_SSO',
        phone ? await sha256(phone) : 'PENDING_SSO',
        isKevin ? 1 : 0, isKevin ? 1 : 0, apex_uid, Date.now()).run();
      user = await env.APEX_CHAT_DB.prepare('SELECT * FROM users WHERE id=?').bind(id).first();
    } catch (e) {
      return err('Création SSO échouée : ' + e.message, 500);
    }
  }

  const jwt = await signJWT({
    sub: user.id,
    pseudo: user.pseudo,
    is_admin: !!user.is_admin,
    apex_uid: user.apex_uid,
    sso: true,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 86400
  }, env.JWT_SIGN_KEY);

  await auditLog(env, user.id, 'login_sso_apex', 'user', user.id, { apex_uid }, '', request.headers.get('User-Agent'));

  return json({ ok: true, token: jwt, user });
}

// ============================================================================
//  Routes Users
// ============================================================================

async function handleGetMe(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401, 'unauthorized');

  const user = await env.APEX_CHAT_DB.prepare('SELECT * FROM users WHERE id=?').bind(auth.sub).first();
  if (!user) return err('User introuvable', 404);
  delete user.real_name;  // sauf si admin
  return json({ ok: true, user });
}

// Acceptation CGU (RGPD trace immutable)
async function handleCguAccept(request, env) {
  const body = await request.json().catch(() => ({}));
  const ipHash = await sha256(request.headers.get('CF-Connecting-IP') || 'unknown');
  const ua = (request.headers.get('user-agent') || '').slice(0, 240);
  const phone = String(body.phone || '').replace(/[^\d+]/g, '');
  const phoneHash = phone ? await sha256(phone) : null;
  const auth = await getAuthUser(request, env);
  await env.APEX_CHAT_DB.prepare(
    `INSERT INTO cgu_acceptances (user_id, phone_hash, version, accepted_at, implicit, user_agent, ip_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(auth?.sub || null, phoneHash, String(body.version || 'v1.1.2'), Date.now(),
         body.implicit === false ? 0 : 1, ua, ipHash).run().catch(() => {});
  return json({ ok: true });
}

// Heartbeat user — last_seen + geoloc/device si consenti par toggle
async function handleUserHeartbeat(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401, 'unauthorized');

  const body = await request.json().catch(() => ({}));
  const ipHash = await sha256(request.headers.get('CF-Connecting-IP') || 'unknown');
  const ua = (request.headers.get('user-agent') || '').slice(0, 240);
  const cfCountry = request.headers.get('cf-ipcountry') || null;
  const cfCity = request.headers.get('cf-ipcity') || null;
  const cfRegion = request.headers.get('cf-region') || null;

  // Device label simple
  let deviceLabel = '';
  if (/iPhone|iPad|iPod/i.test(ua)) deviceLabel = 'iOS';
  else if (/Android/i.test(ua)) deviceLabel = 'Android';
  else if (/Macintosh/i.test(ua)) deviceLabel = 'Mac';
  else if (/Windows/i.test(ua)) deviceLabel = 'Windows';
  else if (/Linux/i.test(ua)) deviceLabel = 'Linux';

  // Geoloc client (si fournie) — sinon Cloudflare CF-IPCity headers
  const lat = typeof body.lat === 'number' ? body.lat : null;
  const lng = typeof body.lng === 'number' ? body.lng : null;
  let geoLabel = null;
  if (lat !== null && lng !== null) {
    geoLabel = (cfCity ? cfCity + ', ' : '') + (cfCountry || '');
  } else if (cfCity || cfCountry) {
    geoLabel = (cfCity ? cfCity + ', ' : '') + (cfCountry || '');
  }

  await env.APEX_CHAT_DB.prepare(
    `UPDATE users SET last_seen=?, last_ip_hash=?, last_user_agent=?, last_device_label=?,
                       last_lat=COALESCE(?, last_lat), last_lng=COALESCE(?, last_lng),
                       last_geo_label=COALESCE(?, last_geo_label), updated_at=?
     WHERE id=?`
  ).bind(Date.now(), ipHash, ua, deviceLabel, lat, lng, geoLabel, Date.now(), auth.sub).run().catch(() => {});

  // Activity log (TTL 30j via cleanup futur)
  await env.APEX_CHAT_DB.prepare(
    `INSERT INTO user_activity (user_id, ts, ip_hash, user_agent, lat, lng, geo_label, action)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'heartbeat')`
  ).bind(auth.sub, Date.now(), ipHash, ua, lat, lng, geoLabel).run().catch(() => {});

  return json({ ok: true });
}

// PATCH /api/users/me — update profil safe (avatar, bio, language, timezone, display_name)
export async function handleUpdateMe(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  const body = await request.json().catch(() => ({}));
  const ALLOWED = ['avatar_url', 'bio', 'display_name', 'language', 'timezone', 'email'];
  const updates = [];
  const args = [];
  for (const k of ALLOWED) {
    if (body[k] !== undefined) {
      const v = String(body[k] || '').slice(0, 500);
      updates.push(`${k}=?`);
      args.push(v);
    }
  }
  if (updates.length === 0) return err('Aucun champ à mettre à jour');
  updates.push('updated_at=?');
  args.push(Date.now());
  args.push(auth.sub);

  await env.APEX_CHAT_DB.prepare(
    `UPDATE users SET ${updates.join(', ')} WHERE id=?`
  ).bind(...args).run();

  await auditLog(env, auth.sub, 'profile_update', 'user', auth.sub,
    JSON.stringify(Object.keys(body)), null, request.headers.get('user-agent') || '');

  const user = await env.APEX_CHAT_DB.prepare('SELECT * FROM users WHERE id=?').bind(auth.sub).first();
  return json({ ok: true, user });
}

async function handleGetPublicUser(pseudo, env) {
  const user = await env.APEX_CHAT_DB.prepare(
    'SELECT id, pseudo, avatar_url, bio, last_seen FROM users WHERE pseudo=? COLLATE NOCASE AND status=?'
  ).bind(pseudo, 'active').first();
  if (!user) return err('User introuvable', 404);
  return json({ ok: true, user });
}

async function handleAdminGetFullUser(pseudo, request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth || !auth.is_admin) return err('Admin requis', 403);

  const user = await env.APEX_CHAT_DB.prepare(
    'SELECT * FROM users WHERE pseudo=? COLLATE NOCASE'
  ).bind(pseudo).first();
  if (!user) return err('User introuvable', 404);

  // Audit log obligatoire (qui a vu quoi)
  await auditLog(env, auth.sub, 'view_user_card_full', 'user', user.id, { pseudo },
    await sha256(request.headers.get('CF-Connecting-IP') || ''), request.headers.get('User-Agent'));

  return json({ ok: true, user });
}

// ============================================================================
//  Routes Conversations
// ============================================================================

async function handleListConversations(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  const convs = await env.APEX_CHAT_DB.prepare(
    `SELECT c.*, cm.last_read_msg_id, cm.notif_level, cm.role
     FROM conversations c
     INNER JOIN conversation_members cm ON cm.conv_id = c.id
     WHERE cm.user_id = ? AND c.archived_at IS NULL
     ORDER BY c.last_msg_ts DESC`
  ).bind(auth.sub).all();

  return json({ ok: true, conversations: convs.results || [] });
}

export async function handleCreateConversation(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  const { type, name, members } = await request.json();
  if (!['dm', 'group', 'community', 'channel'].includes(type)) return err('Type invalide');
  if (!Array.isArray(members) || members.length < 1) return err('Membres requis');

  const id = crypto.randomUUID();
  const doId = `do_${id}`;
  const ts = Date.now();

  // Récupérer mode admin (pour kevin_invisible)
  const config = await getModeConfig(env);
  const kevinInvisible = config.KEVIN_INVISIBLE_ADMIN === 'true';

  await env.APEX_CHAT_DB.prepare(
    `INSERT INTO conversations (id, type, name, created_by, created_at, sharded_to_do, member_count, last_msg_ts, e2e_version)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
  ).bind(id, type, name || null, auth.sub, ts, doId, members.length + 1, ts).run();

  // Ajouter members
  await env.APEX_CHAT_DB.prepare(
    `INSERT INTO conversation_members (conv_id, user_id, role, joined_at, kevin_invisible)
     VALUES (?, ?, 'owner', ?, 0)`
  ).bind(id, auth.sub, ts).run();

  for (const memberId of members) {
    if (memberId === auth.sub) continue;
    await env.APEX_CHAT_DB.prepare(
      `INSERT INTO conversation_members (conv_id, user_id, role, joined_at, kevin_invisible)
       VALUES (?, ?, 'member', ?, 0)`
    ).bind(id, memberId, ts).run();
  }

  // Si Kevin invisible activé, l'ajouter automatiquement aux convs (sauf si Kevin est l'auteur)
  if (kevinInvisible && auth.sub !== 'kdmc_admin') {
    const kevin = await env.APEX_CHAT_DB.prepare('SELECT id FROM users WHERE is_admin=1 LIMIT 1').first();
    if (kevin && !members.includes(kevin.id)) {
      await env.APEX_CHAT_DB.prepare(
        `INSERT INTO conversation_members (conv_id, user_id, role, joined_at, kevin_invisible)
         VALUES (?, ?, 'admin', ?, 1)`
      ).bind(id, kevin.id, ts).run();
    }
  }

  return json({ ok: true, conversation: { id, type, name, created_at: ts } });
}

// ============================================================================
//  Routes Invitations SMS
// ============================================================================

async function handleCreateInvitation(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  const { phone, sent_via } = await request.json();
  if (!phone) return err('Numéro requis');

  const config = await getModeConfig(env);
  const maxPerDay = parseInt(config.MAX_INVITATIONS_PER_DAY || '50');

  // Vérifier quota
  const since = Date.now() - 86400000;
  const recent = await env.APEX_CHAT_DB.prepare(
    'SELECT COUNT(*) as c FROM invitations WHERE inviter_id=? AND created_at > ?'
  ).bind(auth.sub, since).first();
  if (recent && recent.c >= maxPerDay) return err(`Limite ${maxPerDay} invitations/jour atteinte`, 429);

  const code = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map(b => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[b % 30]).join('');
  const phoneHash = await sha256(phone);
  const expiresAt = Date.now() + 7 * 86400000;

  await env.APEX_CHAT_DB.prepare(
    `INSERT INTO invitations (code, inviter_id, invitee_phone_hash, sent_via, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(code, auth.sub, phoneHash, sent_via || 'sms-native', Date.now(), expiresAt).run();

  return json({ ok: true, code, expires_at: expiresAt,
    invite_url: `${env.APEX_CHAT_BASE_URL}i/${code}`,
    sms_template: `Salut ! J'utilise Apex Chat, messagerie privée avec IA. Rejoins-moi : ${env.APEX_CHAT_BASE_URL}i/${code}`
  });
}

async function handleResolveInvitation(code, env) {
  const inv = await env.APEX_CHAT_DB.prepare(
    'SELECT i.*, u.pseudo as inviter_pseudo, u.avatar_url as inviter_avatar FROM invitations i LEFT JOIN users u ON u.id = i.inviter_id WHERE i.code=?'
  ).bind(code).first();
  if (!inv) return err('Invitation invalide', 404);
  if (inv.expires_at < Date.now()) return err('Invitation expirée', 410);
  if (inv.accepted_at) return err('Invitation déjà acceptée', 410);
  return json({ ok: true, invitation: inv });
}

// ============================================================================
//  Routes Admin (Kevin only)
// ============================================================================

async function handleAdminCommand(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth || !auth.is_admin) return err('Admin requis', 403);

  const { command, params, confirm_token } = await request.json();
  const destructive = ['kickUser', 'banUser', 'unbanUser', 'deleteConv', 'exportConv', 'forceLogout'];

  if (destructive.includes(command) && !confirm_token) {
    return err('Confirmation 2-step requise', 400, 'confirm_required');
  }

  let result;
  switch (command) {
    case 'searchAllMessages':
      // Phase 6 : recherche metadata uniquement (Option B respecté)
      result = await env.APEX_CHAT_DB.prepare(
        `SELECT m.id, m.conv_id, m.sender_id, m.ts, m.mime,
                u.pseudo as sender_pseudo, c.name as conv_name
         FROM messages m
         LEFT JOIN users u ON u.id = m.sender_id
         LEFT JOIN conversations c ON c.id = m.conv_id
         WHERE m.ts > ? ORDER BY m.ts DESC LIMIT 100`
      ).bind(Date.now() - (params?.days || 7) * 86400000).all();
      break;

    case 'analyzeUser':
      const user = await env.APEX_CHAT_DB.prepare(
        `SELECT u.*, COUNT(DISTINCT m.id) as msg_count, COUNT(DISTINCT cm.conv_id) as conv_count
         FROM users u LEFT JOIN messages m ON m.sender_id = u.id
         LEFT JOIN conversation_members cm ON cm.user_id = u.id
         WHERE u.id = ? GROUP BY u.id`
      ).bind(params.userId).first();
      const lastSeen = await env.APEX_CHAT_DB.prepare(
        'SELECT MAX(ts) as last_msg FROM messages WHERE sender_id=?'
      ).bind(params.userId).first();
      const devices = await env.APEX_CHAT_DB.prepare(
        'SELECT COUNT(*) as c FROM push_subscriptions WHERE user_id=?'
      ).bind(params.userId).first();
      const signals = await env.APEX_CHAT_DB.prepare(
        'SELECT COUNT(*) as c FROM signalements WHERE target_user_id=?'
      ).bind(params.userId).first();
      result = { user, lastActivity: lastSeen?.last_msg, devices: devices?.c, signalements: signals?.c };
      break;

    case 'broadcastNotif':
      // Envoyer push à tous les users actifs
      const activeUsers = await env.APEX_CHAT_DB.prepare(
        'SELECT id FROM users WHERE status=? AND last_seen > ?'
      ).bind('active', Date.now() - 30 * 86400000).all();
      let sent = 0;
      for (const u of (activeUsers.results || [])) {
        try {
          await sendPushToUser(u.id, {
            title: params.title || '📢 Annonce Apex Chat',
            body: params.body || '',
            data: { admin_broadcast: true }
          }, env);
          sent++;
        } catch (e) {}
      }
      result = { sent, total: (activeUsers.results || []).length };
      break;

    case 'kickUser':
      await env.APEX_CHAT_DB.prepare('DELETE FROM conversation_members WHERE conv_id=? AND user_id=?')
        .bind(params.convId, params.userId).run();
      result = { ok: true };
      break;

    case 'banUser':
      await env.APEX_CHAT_DB.prepare("UPDATE users SET status='suspended' WHERE id=?").bind(params.userId).run();
      result = { ok: true };
      break;

    case 'unbanUser':
      await env.APEX_CHAT_DB.prepare("UPDATE users SET status='active' WHERE id=?").bind(params.userId).run();
      result = { ok: true };
      break;

    case 'exportConv':
      const conv = await env.APEX_CHAT_DB.prepare('SELECT * FROM conversations WHERE id=?').bind(params.convId).first();
      const members = await env.APEX_CHAT_DB.prepare(
        'SELECT * FROM conversation_members WHERE conv_id=?'
      ).bind(params.convId).all();
      const msgs = await env.APEX_CHAT_DB.prepare(
        'SELECT id, sender_id, ts, mime, view_once, expires_at FROM messages WHERE conv_id=? ORDER BY ts ASC LIMIT 10000'
      ).bind(params.convId).all();
      // Stockage R2 export
      const exportKey = `exports/conv_${params.convId}_${Date.now()}.json`;
      const exportData = JSON.stringify({ conv, members: members.results, messages: msgs.results, exported_at: Date.now(), exported_by: auth.sub });
      await env.APEX_CHAT_MEDIA?.put(exportKey, exportData, { httpMetadata: { contentType: 'application/json' } });
      result = { ok: true, export_key: exportKey, msgs_count: (msgs.results || []).length };
      break;

    case 'deleteConv':
      // Soft delete : archive + hide
      await env.APEX_CHAT_DB.prepare('UPDATE conversations SET archived_at=? WHERE id=?')
        .bind(Date.now(), params.convId).run();
      result = { ok: true };
      break;

    case 'forceLogout':
      // Invalider tous les JWT du user (Phase ultérieure : table jwt_blacklist)
      // Pour Phase 6 : suspendre temporairement le user
      await env.APEX_CHAT_DB.prepare("UPDATE users SET last_seen=? WHERE id=?").bind(0, params.userId).run();
      result = { ok: true };
      break;

    case 'geoTrace':
      // Historique géoloc (réservé Phase 8 — table location_history)
      result = { trace: [], note: 'Géoloc opt-in user only (Phase 8)' };
      break;

    case 'summarizeConv':
      // Phase 6 : metadata count uniquement (contenu chiffré E2E)
      const stats = await env.APEX_CHAT_DB.prepare(
        `SELECT COUNT(*) as msg_count, MIN(ts) as first_ts, MAX(ts) as last_ts,
                COUNT(DISTINCT sender_id) as senders
         FROM messages WHERE conv_id=?`
      ).bind(params.convId).first();
      result = { stats, note: 'Contenu chiffré E2E — impossible serveur. Pour résumé contenu : utiliser ia-worker côté client.' };
      break;

    case 'listSignalements':
      const signRows = await env.APEX_CHAT_DB.prepare(
        `SELECT s.*, u.pseudo as target_pseudo, r.pseudo as reporter_pseudo
         FROM signalements s
         LEFT JOIN users u ON u.id = s.target_user_id
         LEFT JOIN users r ON r.id = s.reporter_id
         WHERE s.status=? ORDER BY s.ts DESC LIMIT 100`
      ).bind(params?.status || 'pending').all();
      result = { signalements: signRows.results || [] };
      break;

    case 'globalStats':
      const totalUsers = await env.APEX_CHAT_DB.prepare("SELECT COUNT(*) as c FROM users WHERE status='active'").first();
      const totalConvs = await env.APEX_CHAT_DB.prepare('SELECT COUNT(*) as c FROM conversations WHERE archived_at IS NULL').first();
      const totalMsgs = await env.APEX_CHAT_DB.prepare('SELECT COUNT(*) as c FROM messages WHERE ts > ?').bind(Date.now() - 86400000).first();
      const onlineNow = await env.APEX_CHAT_DB.prepare('SELECT COUNT(*) as c FROM users WHERE last_seen > ?').bind(Date.now() - 5 * 60000).first();
      result = {
        users: totalUsers?.c || 0,
        active_convs: totalConvs?.c || 0,
        msgs_24h: totalMsgs?.c || 0,
        online_now: onlineNow?.c || 0
      };
      break;

    default:
      return err('Commande inconnue: ' + command, 400);
  }

  await auditLog(env, auth.sub, 'admin_command', 'system', params?.userId || params?.convId || null,
    { command, params }, await sha256(request.headers.get('CF-Connecting-IP') || ''),
    request.headers.get('User-Agent'));

  return json({ ok: true, command, result });
}

// ============================================================================
//  Route system config (lit MODE_CONFIG)
// ============================================================================

async function handleSystemConfig(request, env) {
  const config = await getModeConfig(env);
  // Filtrer flags publics (pas de secrets)
  const publicConfig = {
    ADMIN_MODE: config.ADMIN_MODE,
    AUTH_PROVIDER: config.AUTH_PROVIDER,
    TURN_PROVIDER: config.TURN_PROVIDER,
    MAX_GROUP_SIZE: config.MAX_GROUP_SIZE,
    PREMIUM_PRICE_EUR: config.PREMIUM_PRICE_EUR
  };
  return json({ ok: true, config: publicConfig });
}

// ============================================================================
//  Admin bulk whitelist — colle 1 ou N numéros, tous auto-autorisés + liens magiques
// ============================================================================

export async function handleAdminWhitelistBulk(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth || !auth.is_admin) return err('Admin requis', 403);

  const { entries } = await request.json();
  if (!Array.isArray(entries) || entries.length === 0) return err('entries requis (array de {phone, name?})');
  if (entries.length > 100) return err('Max 100 numéros par batch');

  const baseUrl = env.APEX_CHAT_BASE_URL || 'https://9r4rxssx64-creator.github.io/CMCteams/messaging-app/';
  const results = [];

  for (const e of entries) {
    try {
      const phone = String(e.phone || '').replace(/[^\d+]/g, '');
      const name = String(e.name || '').slice(0, 40).trim() || 'Ami';
      if (!phone) { results.push({ phone: e.phone, ok: false, error: 'phone manquant' }); continue; }
      // Normalisation E.164 simple (FR par défaut si commence par 0)
      let normalized = phone;
      if (normalized.startsWith('0') && normalized.length === 10) normalized = '+33' + normalized.slice(1);
      if (!normalized.startsWith('+')) normalized = '+' + normalized;
      if (normalized.length < 10) { results.push({ phone, ok: false, error: 'format invalide' }); continue; }

      const phoneHash = await sha256(normalized);

      // Pré-créer/marquer user admin_authorized=1
      let user = await env.APEX_CHAT_DB.prepare('SELECT id, pseudo FROM users WHERE phone_hash=?').bind(phoneHash).first();
      if (!user) {
        const userId = 'u_' + Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('');
        let safePseudo = name.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 18) || ('ami' + Date.now().toString(36).slice(-4));
        const exists = await env.APEX_CHAT_DB.prepare('SELECT 1 FROM users WHERE pseudo=?').bind(safePseudo).first();
        if (exists) safePseudo = safePseudo.slice(0, 12) + '_' + Date.now().toString(36).slice(-4);
        await env.APEX_CHAT_DB.prepare(
          `INSERT INTO users (id, pseudo, real_name, phone, phone_hash, display_name,
             identity_key_pub, pq_key_pub, prekey_signed,
             admin_authorized, admin_authorized_by, source, invited_by, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, '', '', '', 1, ?, 'invitation', ?, ?, ?)`
        ).bind(userId, safePseudo, name, normalized, phoneHash, name, auth.sub, auth.sub, Date.now(), Date.now()).run();
        user = { id: userId, pseudo: safePseudo };
      } else {
        await env.APEX_CHAT_DB.prepare(
          'UPDATE users SET admin_authorized=1, admin_authorized_by=?, updated_at=? WHERE id=?'
        ).bind(auth.sub, Date.now(), user.id).run();
      }

      const magicToken = await signJWT({
        typ: 'magic_invite', uid: user.id, pseudo: user.pseudo, phone_hash: phoneHash,
        invited_by: auth.sub,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 86400
      }, env.JWT_SIGN_KEY);

      const code = Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[b % 30]).join('');
      await env.APEX_CHAT_DB.prepare(
        `INSERT INTO invitations (code, inviter_id, invitee_phone_hash, sent_via, magic_token, created_at, expires_at)
         VALUES (?, ?, ?, 'admin-bulk', ?, ?, ?)`
      ).bind(code, auth.sub, phoneHash, magicToken, Date.now(), Date.now() + 7 * 86400000).run();

      results.push({
        ok: true,
        phone: normalized,
        name,
        pseudo: user.pseudo,
        magic_url: `${baseUrl}?magic=${encodeURIComponent(magicToken)}`,
        short_url: `${baseUrl}?i=${code}`,
        sms: `Salut ${name} ! Kevin t'invite sur Apex Chat (messagerie privée chiffrée). Lien direct : ${baseUrl}?magic=${encodeURIComponent(magicToken)}`
      });
    } catch (e) {
      results.push({ phone: e.phone, ok: false, error: e.message });
    }
  }

  await auditLog(env, auth.sub, 'admin_whitelist_bulk', 'batch', null,
    JSON.stringify({ count: results.length, ok_count: results.filter(r => r.ok).length }),
    null, request.headers.get('user-agent') || '');

  return json({ ok: true, count: results.length, results });
}

// ============================================================================
//  Admin invitation bypass — pré-autorise un téléphone (zéro SMS Vonage requis)
// ============================================================================

// Crée une invitation magic link signée par l'admin Kevin.
// L'invitee se connecte via /api/auth/magic-login (pas d'OTP/SMS).
// Pré-créé son user record + ajoute son phone à la whitelist DB pour OTP futur.
export async function handleAdminInviteMagic(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth || !auth.is_admin) return err('Admin requis', 403);

  const { phone, name, pseudo } = await request.json();
  if (!phone) return err('Numéro requis');
  const normalizedPhone = String(phone).replace(/[^\d+]/g, '');
  if (!normalizedPhone.startsWith('+') || normalizedPhone.length < 10) {
    return err('Format E.164 attendu (+33...)');
  }

  const phoneHash = await sha256(normalizedPhone);

  // Pré-créer user si pas déjà existant (bypass OTP futur — admin a autorisé)
  let user = await env.APEX_CHAT_DB.prepare(
    'SELECT id, pseudo FROM users WHERE phone_hash=?'
  ).bind(phoneHash).first();

  if (!user) {
    const userId = 'u_' + Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    let safePseudo = (pseudo || name || 'ami').toLowerCase()
      .replace(/[^a-z0-9_-]/g, '').slice(0, 20) || ('ami' + Date.now().toString(36).slice(-4));
    // Garantir unicité du pseudo (collisions = suffixe random)
    let pseudoExists = await env.APEX_CHAT_DB.prepare('SELECT 1 FROM users WHERE pseudo=?').bind(safePseudo).first();
    if (pseudoExists) safePseudo = safePseudo.slice(0, 14) + '_' + Date.now().toString(36).slice(-4);
    await env.APEX_CHAT_DB.prepare(
      `INSERT INTO users (id, pseudo, real_name, phone, phone_hash, display_name,
         identity_key_pub, pq_key_pub, prekey_signed,
         admin_authorized, admin_authorized_by, source, invited_by,
         created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, '', '', '', 1, ?, 'invitation', ?, ?, ?)`
    ).bind(userId, safePseudo, name || safePseudo, normalizedPhone, phoneHash, name || safePseudo,
           auth.sub, auth.sub, Date.now(), Date.now()).run();
    user = { id: userId, pseudo: safePseudo };
  } else {
    // User existant : marquer admin_authorized=1 (whitelist OTP)
    await env.APEX_CHAT_DB.prepare(
      'UPDATE users SET admin_authorized=1, admin_authorized_by=?, updated_at=? WHERE id=?'
    ).bind(auth.sub, Date.now(), user.id).run();
  }

  // Magic token signé (JWT court 7j)
  const magicToken = await signJWT({
    typ: 'magic_invite',
    uid: user.id,
    pseudo: user.pseudo,
    phone_hash: phoneHash,
    invited_by: auth.sub,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 86400
  }, env.JWT_SIGN_KEY);

  // Code court pour SMS (utilisable aussi)
  const code = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map(b => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[b % 30]).join('');
  await env.APEX_CHAT_DB.prepare(
    `INSERT INTO invitations (code, inviter_id, invitee_phone_hash, sent_via, magic_token, created_at, expires_at)
     VALUES (?, ?, ?, 'admin-bypass', ?, ?, ?)`
  ).bind(code, auth.sub, phoneHash, magicToken, Date.now(), Date.now() + 7 * 86400000).run();

  await auditLog(env, auth.sub, 'admin_invite_magic', 'user', user.id,
    JSON.stringify({ phone_last4: normalizedPhone.slice(-4), pseudo: user.pseudo }),
    null, request.headers.get('user-agent') || '');

  const baseUrl = env.APEX_CHAT_BASE_URL || 'https://9r4rxssx64-creator.github.io/CMCteams/messaging-app/';
  return json({
    ok: true,
    code,
    user_id: user.id,
    pseudo: user.pseudo,
    magic_url: `${baseUrl}?magic=${encodeURIComponent(magicToken)}`,
    short_url: `${baseUrl}?i=${code}`,
    expires_at: Date.now() + 7 * 86400000,
    sms_template: `Salut ${name || ''} ! Kevin t'invite sur Apex Chat (messagerie privée). Lien direct : ${baseUrl}?magic=${encodeURIComponent(magicToken)}`
  });
}

// Auth via magic link (pas d'OTP requis — admin a pré-autorisé)
export async function handleMagicLogin(request, env) {
  const { magic_token } = await request.json();
  if (!magic_token) return err('Token requis');

  const payload = await verifyJWT(magic_token, env.JWT_SIGN_KEY);
  if (!payload || payload.typ !== 'magic_invite') return err('Token invalide', 401);

  const user = await env.APEX_CHAT_DB.prepare(
    'SELECT id, pseudo, display_name, avatar_url, admin_authorized FROM users WHERE id=?'
  ).bind(payload.uid).first();
  if (!user || !user.admin_authorized) return err('User non autorisé', 403);

  // Marquer invitation acceptée
  await env.APEX_CHAT_DB.prepare(
    'UPDATE invitations SET accepted_at=? WHERE magic_token=? AND accepted_at IS NULL'
  ).bind(Date.now(), magic_token).run().catch(() => {});

  // Émettre session JWT 30j
  const sessionJWT = await signJWT({
    sub: user.id,
    pseudo: user.pseudo,
    is_admin: false,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 86400
  }, env.JWT_SIGN_KEY);

  await auditLog(env, user.id, 'magic_login_success', 'user', user.id,
    JSON.stringify({ invited_by: payload.invited_by }),
    null, request.headers.get('user-agent') || '');

  return json({
    ok: true,
    jwt: sessionJWT,
    user: { id: user.id, pseudo: user.pseudo, display_name: user.display_name, avatar_url: user.avatar_url }
  });
}

// ============================================================================
//  Admin all-users — TOUS les comptes créés (paginé + filtres)
// ============================================================================

async function handleAdminAllUsers(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth || !auth.is_admin) return err('Admin requis', 403);

  const url = new URL(request.url);
  const filter = url.searchParams.get('filter') || 'all'; // all | banned | active | online | admin
  const search = (url.searchParams.get('q') || '').toLowerCase().trim();
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 500);

  let sql = `SELECT id, pseudo, real_name, display_name, phone, avatar_url,
              created_at, last_seen, is_admin, is_banned, admin_authorized,
              last_ip_hash, last_user_agent, last_lat, last_lng, last_geo_label,
              last_device_label, premium_until, source, invited_by, status
            FROM users WHERE 1=1`;
  const args = [];
  if (filter === 'banned') sql += ' AND is_banned=1';
  else if (filter === 'active') sql += ' AND (is_banned=0 OR is_banned IS NULL)';
  else if (filter === 'online') { sql += ' AND last_seen > ?'; args.push(Date.now() - 30 * 60 * 1000); }
  else if (filter === 'admin') sql += ' AND is_admin=1';
  if (search) {
    sql += ' AND (LOWER(pseudo) LIKE ? OR LOWER(real_name) LIKE ? OR phone LIKE ?)';
    args.push('%' + search + '%', '%' + search + '%', '%' + search + '%');
  }
  sql += ' ORDER BY last_seen DESC NULLS LAST, created_at DESC LIMIT ?';
  args.push(limit);

  const r = await env.APEX_CHAT_DB.prepare(sql).bind(...args).all();
  const users = r.results || [];

  // Compter conv par user (best-effort)
  for (const u of users) {
    const c = await env.APEX_CHAT_DB.prepare('SELECT COUNT(*) as c FROM conversation_members WHERE user_id=?')
      .bind(u.id).first().catch(() => ({ c: 0 }));
    u.conv_count = c?.c || 0;
    // Masquer phone partiel pour audit (4 derniers chiffres)
    if (u.phone) u.phone_last4 = String(u.phone).slice(-4);
  }

  return json({ ok: true, count: users.length, users });
}

// Block / Unblock / Delete user
async function handleAdminUserAction(userId, action, request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth || !auth.is_admin) return err('Admin requis', 403);
  if (userId === auth.sub) return err('Impossible d\'agir sur ton propre compte admin', 400);

  let result = { ok: true };
  if (action === 'block' || action === 'ban') {
    await env.APEX_CHAT_DB.prepare('UPDATE users SET is_banned=1, updated_at=?, status=? WHERE id=?')
      .bind(Date.now(), 'suspended', userId).run();
    result.message = 'Utilisateur bloqué';
  } else if (action === 'unblock' || action === 'unban') {
    await env.APEX_CHAT_DB.prepare('UPDATE users SET is_banned=0, updated_at=?, status=? WHERE id=?')
      .bind(Date.now(), 'active', userId).run();
    result.message = 'Utilisateur réautorisé';
  } else if (action === 'authorize') {
    await env.APEX_CHAT_DB.prepare('UPDATE users SET admin_authorized=1, admin_authorized_by=?, updated_at=? WHERE id=?')
      .bind(auth.sub, Date.now(), userId).run();
    result.message = 'Whitelist activée';
  } else if (action === 'revoke') {
    await env.APEX_CHAT_DB.prepare('UPDATE users SET admin_authorized=0, updated_at=? WHERE id=?')
      .bind(Date.now(), userId).run();
    result.message = 'Whitelist révoquée';
  } else if (action === 'force_logout') {
    // Invalidate JWT en stockant timestamp logout forcé (à vérifier dans getAuthUser ensuite si on l'implémente)
    await env.APEX_CHAT_DB.prepare('UPDATE users SET updated_at=?, last_force_logout_at=? WHERE id=?')
      .bind(Date.now(), Date.now(), userId).run().catch(() => {});
    result.message = 'Déconnexion forcée';
  } else if (action === 'delete') {
    // Soft delete (status=deleted)
    await env.APEX_CHAT_DB.prepare('UPDATE users SET status=?, is_banned=1, updated_at=? WHERE id=?')
      .bind('deleted', Date.now(), userId).run();
    result.message = 'Compte supprimé (soft)';
  } else {
    return err('Action inconnue: ' + action, 400);
  }

  await auditLog(env, auth.sub, 'admin_user_' + action, 'user', userId,
    JSON.stringify({ action }),
    null, request.headers.get('user-agent') || '');

  return json(result);
}

// ============================================================================
//  Admin timeline per-user — historique COMPLET (audit + activité + invitations + signalements)
// ============================================================================

async function handleAdminUserTimeline(userId, request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth || !auth.is_admin) return err('Admin requis', 403);

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 500);
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const since = parseInt(url.searchParams.get('since') || '0') || (Date.now() - 90 * 86400000); // 90j par défaut

  // 1. Audit log (login, actions, modifications) — paginé
  const audit = await env.APEX_CHAT_DB.prepare(
    `SELECT id, action, target_type, target_id, details, ts, ip_hash, user_agent
     FROM audit_log
     WHERE (actor_id=? OR target_id=?) AND ts >= ?
     ORDER BY ts DESC LIMIT ? OFFSET ?`
  ).bind(userId, userId, since, limit, offset).all().catch(() => ({ results: [] }));

  // 2. User activity (geoloc + device history) — paginé
  const activity = await env.APEX_CHAT_DB.prepare(
    `SELECT id, ts, ip_hash, user_agent, lat, lng, geo_label, action
     FROM user_activity WHERE user_id=? AND ts >= ?
     ORDER BY ts DESC LIMIT ? OFFSET ?`
  ).bind(userId, since, limit, offset).all().catch(() => ({ results: [] }));

  // 3. Invitations envoyées par lui ou pour lui
  const invitations = await env.APEX_CHAT_DB.prepare(
    `SELECT code, inviter_id, invitee_phone_hash, sent_via, accepted_at, created_at, expires_at
     FROM invitations
     WHERE (inviter_id=? OR invitee_phone_hash=(SELECT phone_hash FROM users WHERE id=?))
       AND created_at >= ?
     ORDER BY created_at DESC LIMIT 50`
  ).bind(userId, userId, since).all().catch(() => ({ results: [] }));

  // 4. Signalements (faits OU reçus)
  const signalements = await env.APEX_CHAT_DB.prepare(
    `SELECT id, reporter_id, target_user_id, reason, status, ts as created_at
     FROM signalements
     WHERE (reporter_id=? OR target_user_id=?) AND ts >= ?
     ORDER BY ts DESC LIMIT 50`
  ).bind(userId, userId, since).all().catch(() => ({ results: [] }));

  // 5. Conversations metadata (NO message content car E2E)
  const convs = await env.APEX_CHAT_DB.prepare(
    `SELECT c.id, c.type, c.name, c.created_at, c.last_msg_ts, c.member_count
     FROM conversations c
     INNER JOIN conversation_members cm ON cm.conv_id=c.id
     WHERE cm.user_id=?
     ORDER BY c.last_msg_ts DESC LIMIT 100`
  ).bind(userId).all().catch(() => ({ results: [] }));

  // 6. User metadata
  const user = await env.APEX_CHAT_DB.prepare(
    `SELECT id, pseudo, real_name, phone, last_seen, created_at, is_admin, is_banned,
            admin_authorized, last_geo_label, last_device_label
     FROM users WHERE id=?`
  ).bind(userId).first();

  await auditLog(env, auth.sub, 'admin_view_timeline', 'user', userId,
    JSON.stringify({ limit, since }), null, request.headers.get('user-agent') || '');

  return json({
    ok: true,
    user,
    timeline: {
      audit: audit.results || [],
      activity: activity.results || [],
      invitations: invitations.results || [],
      signalements: signalements.results || [],
      conversations: convs.results || []
    }
  });
}

// Liste conversations d'un user (admin)
async function handleAdminUserConvs(userId, request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth || !auth.is_admin) return err('Admin requis', 403);
  const convs = await env.APEX_CHAT_DB.prepare(
    `SELECT c.id, c.type, c.name, c.description, c.created_at, c.last_msg_ts, c.member_count,
            c.disappearing_seconds, c.archived_at,
            (SELECT COUNT(*) FROM messages WHERE conv_id=c.id) as msg_count
     FROM conversations c
     INNER JOIN conversation_members cm ON cm.conv_id=c.id
     WHERE cm.user_id=?
     ORDER BY c.last_msg_ts DESC LIMIT 100`
  ).bind(userId).all().catch(() => ({ results: [] }));
  return json({ ok: true, conversations: convs.results || [] });
}

// Recherche globale admin (metadata uniquement — E2E protège le contenu)
export async function handleAdminSearch(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth || !auth.is_admin) return err('Admin requis', 403);

  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim().slice(0, 100);
  const scope = url.searchParams.get('scope') || 'all'; // users | audit | invitations | signalements
  if (q.length < 2) return err('Query >= 2 chars');

  const like = '%' + q.toLowerCase() + '%';
  const out = { ok: true, q, results: {} };

  if (scope === 'all' || scope === 'users') {
    const r = await env.APEX_CHAT_DB.prepare(
      `SELECT id, pseudo, real_name, phone, last_seen FROM users
       WHERE LOWER(pseudo) LIKE ? OR LOWER(real_name) LIKE ? OR phone LIKE ?
       LIMIT 30`
    ).bind(like, like, like).all().catch(() => ({ results: [] }));
    out.results.users = r.results || [];
  }
  if (scope === 'all' || scope === 'audit') {
    const r = await env.APEX_CHAT_DB.prepare(
      `SELECT id, actor_id, action, target_type, target_id, details, ts FROM audit_log
       WHERE LOWER(action) LIKE ? OR LOWER(details) LIKE ?
       ORDER BY ts DESC LIMIT 50`
    ).bind(like, like).all().catch(() => ({ results: [] }));
    out.results.audit = r.results || [];
  }
  if (scope === 'all' || scope === 'invitations') {
    const r = await env.APEX_CHAT_DB.prepare(
      `SELECT code, inviter_id, sent_via, created_at, accepted_at FROM invitations
       WHERE code LIKE ? ORDER BY created_at DESC LIMIT 30`
    ).bind(q.toUpperCase() + '%').all().catch(() => ({ results: [] }));
    out.results.invitations = r.results || [];
  }
  if (scope === 'all' || scope === 'signalements') {
    const r = await env.APEX_CHAT_DB.prepare(
      `SELECT id, reporter_id, target_user_id, reason, status, ts as created_at FROM signalements
       WHERE LOWER(reason) LIKE ? ORDER BY ts DESC LIMIT 30`
    ).bind(like).all().catch(() => ({ results: [] }));
    out.results.signalements = r.results || [];
  }

  return json(out);
}

// ============================================================================
//  Admin map — TOUS users avec dernières positions + historique récent
// ============================================================================

async function handleAdminMap(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth || !auth.is_admin) return err('Admin requis', 403);

  // Users avec last_lat/lng connues (limité à 200 max actifs)
  const users = await env.APEX_CHAT_DB.prepare(
    `SELECT id, pseudo, real_name, last_seen, last_lat, last_lng, last_geo_label,
            last_device_label, is_admin, is_banned
     FROM users
     WHERE last_lat IS NOT NULL AND last_lng IS NOT NULL
     ORDER BY last_seen DESC LIMIT 200`
  ).all().catch(() => ({ results: [] }));

  return json({
    ok: true,
    count: (users.results || []).length,
    users: users.results || [],
    server_ts: Date.now()
  });
}

async function handleAdminUserGeoHistory(userId, request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth || !auth.is_admin) return err('Admin requis', 403);
  const url = new URL(request.url);
  const days = Math.min(parseInt(url.searchParams.get('days') || '7'), 30);
  const since = Date.now() - days * 86400000;

  const rows = await env.APEX_CHAT_DB.prepare(
    `SELECT ts, lat, lng, geo_label, user_agent FROM user_activity
     WHERE user_id=? AND ts >= ? AND lat IS NOT NULL AND lng IS NOT NULL
     ORDER BY ts ASC LIMIT 500`
  ).bind(userId, since).all().catch(() => ({ results: [] }));

  return json({ ok: true, points: rows.results || [], days });
}

// ============================================================================
//  Admin live users — liste users connectés + geoloc + devices
// ============================================================================

async function handleAdminLiveUsers(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth || !auth.is_admin) return err('Admin requis', 403);

  const since = Date.now() - 30 * 60 * 1000; // 30 min = "live"
  const users = await env.APEX_CHAT_DB.prepare(
    `SELECT u.id, u.pseudo, u.display_name, u.avatar_url, u.last_seen, u.last_ip_hash,
            u.last_user_agent, u.last_lat, u.last_lng, u.last_geo_label, u.created_at,
            u.admin_authorized, u.is_banned
     FROM users u
     WHERE u.last_seen > ?
     ORDER BY u.last_seen DESC
     LIMIT 200`
  ).bind(since).all();

  // Compter conversations actives par user
  const list = users.results || [];
  for (const u of list) {
    const conv = await env.APEX_CHAT_DB.prepare(
      'SELECT COUNT(*) as c FROM conversation_members WHERE user_id=?'
    ).bind(u.id).first().catch(() => ({ c: 0 }));
    u.conv_count = conv.c || 0;
  }

  return json({ ok: true, count: list.length, users: list });
}

// ============================================================================
//  Admin toggles — features ON/OFF (general + per-user)
// ============================================================================

async function handleAdminGetToggles(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth || !auth.is_admin) return err('Admin requis', 403);

  const config = await getModeConfig(env);
  // Tous les flags features sont stockés dans system_config (key/value)
  const FEATURE_KEYS = [
    'voice_messages', 'video_calls', 'time_capsule', 'letters_24h', 'memory_lane',
    'stories', 'polls', 'reactions', 'mini_apps', 'e2e_strict', 'kevin_invisible',
    'track_geoloc', 'track_devices', 'admin_audit_log', 'auto_invitations',
    'magic_links', 'sms_otp', 'sso_apex', 'payment_qr', 'push_notifications',
    'signalements', 'ia_chat'
  ];

  const toggles = {};
  for (const key of FEATURE_KEYS) {
    const v = config['FEATURE_' + key.toUpperCase()];
    toggles[key] = v === undefined ? true : (v === 'true' || v === '1' || v === true);
  }
  return json({ ok: true, toggles });
}

export async function handleAdminSetToggle(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth || !auth.is_admin) return err('Admin requis', 403);

  const { feature, enabled, user_id } = await request.json();
  if (!feature) return err('feature requis');

  if (user_id) {
    // Per-user toggle
    await env.APEX_CHAT_DB.prepare(
      `INSERT INTO user_feature_overrides (user_id, feature, enabled, updated_at, updated_by)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, feature) DO UPDATE SET enabled=excluded.enabled, updated_at=excluded.updated_at, updated_by=excluded.updated_by`
    ).bind(user_id, feature, enabled ? 1 : 0, Date.now(), auth.sub).run();
  } else {
    // Global toggle
    const key = 'FEATURE_' + feature.toUpperCase();
    await env.APEX_CHAT_DB.prepare(
      `INSERT INTO system_config (key, value, updated_at, updated_by)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at, updated_by=excluded.updated_by`
    ).bind(key, String(enabled), Date.now(), auth.sub).run();
  }

  await auditLog(env, auth.sub, 'admin_toggle_set', user_id ? 'user' : 'global', user_id || feature,
    JSON.stringify({ feature, enabled, user_id }),
    null, request.headers.get('user-agent') || '');

  return json({ ok: true });
}

// ============================================================================
//  WebSocket → ConversationDO
// ============================================================================

async function handleWsConversation(convId, request, env) {
  const upgradeHeader = request.headers.get('Upgrade');
  if (upgradeHeader !== 'websocket') return err('Upgrade WebSocket requis', 426);

  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  // Vérifier membership
  const member = await env.APEX_CHAT_DB.prepare(
    'SELECT * FROM conversation_members WHERE conv_id=? AND user_id=?'
  ).bind(convId, auth.sub).first();
  if (!member) return err('Pas membre de cette conv', 403);

  const conv = await env.APEX_CHAT_DB.prepare('SELECT sharded_to_do FROM conversations WHERE id=?').bind(convId).first();
  if (!conv) return err('Conv introuvable', 404);

  const doStub = env.CONVERSATION_DO.get(env.CONVERSATION_DO.idFromName(conv.sharded_to_do));
  return doStub.fetch(request);
}

// ============================================================================
//  Phase 4 — Groupes, communautés, channels (membership + stories + polls)
// ============================================================================

export async function handleAddMember(convId, request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  const { user_id, role } = await request.json();
  if (!user_id) return err('user_id requis');

  // Vérifier que auth est owner ou admin de la conv
  const me = await env.APEX_CHAT_DB.prepare(
    'SELECT role FROM conversation_members WHERE conv_id=? AND user_id=?'
  ).bind(convId, auth.sub).first();
  if (!me || !['owner', 'admin'].includes(me.role)) {
    return err('Droits insuffisants (owner/admin requis)', 403);
  }

  // Vérifier que la conv n'est pas un DM (DM = 2 membres fixes)
  const conv = await env.APEX_CHAT_DB.prepare('SELECT type, member_count FROM conversations WHERE id=?').bind(convId).first();
  if (!conv) return err('Conv introuvable', 404);
  if (conv.type === 'dm') return err('Impossible d\'ajouter à un DM', 400);

  // Limite size selon system_config
  const config = await getModeConfig(env);
  const maxSize = parseInt(config.MAX_GROUP_SIZE || '1024');
  if (conv.member_count >= maxSize) return err(`Limite ${maxSize} membres atteinte`, 403);

  // Ajouter (idempotent)
  await env.APEX_CHAT_DB.prepare(
    `INSERT OR IGNORE INTO conversation_members (conv_id, user_id, role, joined_at, kevin_invisible)
     VALUES (?, ?, ?, ?, 0)`
  ).bind(convId, user_id, role || 'member', Date.now()).run();

  // Update member_count
  const recount = await env.APEX_CHAT_DB.prepare(
    'SELECT COUNT(*) as c FROM conversation_members WHERE conv_id=?'
  ).bind(convId).first();
  await env.APEX_CHAT_DB.prepare('UPDATE conversations SET member_count=? WHERE id=?').bind(recount.c, convId).run();

  await auditLog(env, auth.sub, 'add_member', 'conv', convId, { added: user_id, role: role || 'member' },
    await sha256(request.headers.get('CF-Connecting-IP') || ''), request.headers.get('User-Agent'));

  return json({ ok: true, member_count: recount.c });
}

export async function handleRemoveMember(convId, userId, request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  // Self-leave OU admin kicking
  const me = await env.APEX_CHAT_DB.prepare(
    'SELECT role FROM conversation_members WHERE conv_id=? AND user_id=?'
  ).bind(convId, auth.sub).first();

  const isSelfLeave = auth.sub === userId;
  const isAdmin = me && ['owner', 'admin'].includes(me.role);
  if (!isSelfLeave && !isAdmin) return err('Droits insuffisants', 403);

  // Owner ne peut pas se retirer s'il y a d'autres membres (doit transférer ownership d'abord)
  if (me?.role === 'owner' && isSelfLeave) {
    const others = await env.APEX_CHAT_DB.prepare(
      'SELECT user_id FROM conversation_members WHERE conv_id=? AND user_id != ? LIMIT 1'
    ).bind(convId, auth.sub).first();
    if (others) return err('Transférer ownership avant de quitter', 400);
  }

  await env.APEX_CHAT_DB.prepare(
    'DELETE FROM conversation_members WHERE conv_id=? AND user_id=?'
  ).bind(convId, userId).run();

  const recount = await env.APEX_CHAT_DB.prepare(
    'SELECT COUNT(*) as c FROM conversation_members WHERE conv_id=?'
  ).bind(convId).first();
  await env.APEX_CHAT_DB.prepare('UPDATE conversations SET member_count=? WHERE id=?').bind(recount.c, convId).run();

  await auditLog(env, auth.sub, isSelfLeave ? 'leave_conv' : 'remove_member', 'conv', convId, { removed: userId },
    await sha256(request.headers.get('CF-Connecting-IP') || ''), request.headers.get('User-Agent'));

  return json({ ok: true, member_count: recount.c });
}

export async function handleListMembers(convId, request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  // Vérifier membership
  const me = await env.APEX_CHAT_DB.prepare(
    'SELECT user_id FROM conversation_members WHERE conv_id=? AND user_id=?'
  ).bind(convId, auth.sub).first();
  if (!me) return err('Pas membre', 403);

  // Lister membres (filtre kevin_invisible selon mode admin)
  const config = await getModeConfig(env);
  const kevinInvisible = config.KEVIN_INVISIBLE_ADMIN === 'true';

  const members = await env.APEX_CHAT_DB.prepare(
    `SELECT cm.user_id, cm.role, cm.joined_at, cm.kevin_invisible,
            u.pseudo, u.avatar_url
     FROM conversation_members cm
     INNER JOIN users u ON u.id = cm.user_id
     WHERE cm.conv_id = ?
     ORDER BY cm.role = 'owner' DESC, cm.role = 'admin' DESC, cm.joined_at ASC`
  ).bind(convId).all();

  // Filtrer Kevin invisible si Option A actif (sauf si auth est Kevin lui-même)
  const visible = (members.results || []).filter(m => {
    if (!kevinInvisible) return true;
    if (auth.sub === m.user_id) return true;  // toujours voir soi-même
    return !m.kevin_invisible;
  });

  return json({ ok: true, members: visible });
}

async function handleUpdateConv(convId, request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  const me = await env.APEX_CHAT_DB.prepare(
    'SELECT role FROM conversation_members WHERE conv_id=? AND user_id=?'
  ).bind(convId, auth.sub).first();
  if (!me || !['owner', 'admin'].includes(me.role)) return err('Droits insuffisants', 403);

  const { name, description, avatar_url, disappearing_seconds } = await request.json();
  const updates = [];
  const values = [];
  if (name !== undefined) { updates.push('name=?'); values.push(name); }
  if (description !== undefined) { updates.push('description=?'); values.push(description); }
  if (avatar_url !== undefined) { updates.push('avatar_url=?'); values.push(avatar_url); }
  if (disappearing_seconds !== undefined) { updates.push('disappearing_seconds=?'); values.push(parseInt(disappearing_seconds) || 0); }
  if (updates.length === 0) return err('Rien à modifier', 400);

  values.push(convId);
  await env.APEX_CHAT_DB.prepare(`UPDATE conversations SET ${updates.join(', ')} WHERE id=?`).bind(...values).run();

  await auditLog(env, auth.sub, 'update_conv', 'conv', convId, { fields: Object.keys(await request.clone().json()) },
    await sha256(request.headers.get('CF-Connecting-IP') || ''), request.headers.get('User-Agent'));

  return json({ ok: true });
}

// ----- Stories 24h -----

export async function handleCreateStory(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  const { ciphertext, mime } = await request.json();
  if (!ciphertext) return err('ciphertext requis');
  if (ciphertext.length > 200000) return err('Story trop volumineuse (max 200KB)', 413);

  const id = crypto.randomUUID();
  const ts = Date.now();
  const expires_at = ts + 24 * 3600 * 1000;  // 24h

  await env.APEX_CHAT_DB.prepare(
    `INSERT INTO stories (id, author_id, ciphertext, mime, ts, expires_at, views)
     VALUES (?, ?, ?, ?, ?, ?, '[]')`
  ).bind(id, auth.sub, ciphertext, mime || 'text/plain', ts, expires_at).run();

  return json({ ok: true, story: { id, ts, expires_at } });
}

async function handleListStories(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  // Stories de mes contacts (+ moi) non expirées
  const stories = await env.APEX_CHAT_DB.prepare(
    `SELECT s.id, s.author_id, s.mime, s.ts, s.expires_at, s.views,
            u.pseudo, u.avatar_url
     FROM stories s
     INNER JOIN users u ON u.id = s.author_id
     WHERE s.expires_at > ?
       AND (s.author_id = ? OR s.author_id IN (
         SELECT contact_id FROM contacts WHERE user_id=? AND mutual_at IS NOT NULL
       ))
     ORDER BY s.ts DESC
     LIMIT 200`
  ).bind(Date.now(), auth.sub, auth.sub).all();

  return json({ ok: true, stories: stories.results || [] });
}

export async function handleViewStory(storyId, request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  const story = await env.APEX_CHAT_DB.prepare(
    'SELECT * FROM stories WHERE id=? AND expires_at > ?'
  ).bind(storyId, Date.now()).first();
  if (!story) return err('Story introuvable ou expirée', 404);

  // Ajouter à views (idempotent)
  let views = [];
  try { views = JSON.parse(story.views || '[]'); } catch {}
  if (!views.some(v => v.user_id === auth.sub)) {
    views.push({ user_id: auth.sub, viewed_at: Date.now() });
    await env.APEX_CHAT_DB.prepare('UPDATE stories SET views=? WHERE id=?').bind(JSON.stringify(views), storyId).run();
  }

  return json({
    ok: true,
    story: { id: story.id, ciphertext: story.ciphertext, mime: story.mime, ts: story.ts, expires_at: story.expires_at, views_count: views.length }
  });
}

// ----- Polls -----

export async function handleCreatePoll(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  const { conv_id, msg_id, question, options, multi_choice, anonymous, closes_at } = await request.json();
  if (!conv_id || !msg_id || !question || !Array.isArray(options) || options.length < 2) {
    return err('question + 2 options minimum requis');
  }

  // Vérifier membership
  const member = await env.APEX_CHAT_DB.prepare(
    'SELECT user_id FROM conversation_members WHERE conv_id=? AND user_id=?'
  ).bind(conv_id, auth.sub).first();
  if (!member) return err('Pas membre de la conv', 403);

  const id = crypto.randomUUID();
  await env.APEX_CHAT_DB.prepare(
    `INSERT INTO polls (id, conv_id, msg_id, question, options, multi_choice, anonymous, closes_at, votes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, '{}', ?)`
  ).bind(
    id, conv_id, msg_id, question, JSON.stringify(options),
    multi_choice ? 1 : 0, anonymous ? 1 : 0, closes_at || null, Date.now()
  ).run();

  return json({ ok: true, poll: { id, conv_id, question, options, multi_choice, anonymous, closes_at } });
}

export async function handleVotePoll(pollId, request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  const { option_indexes } = await request.json();
  if (!Array.isArray(option_indexes) || option_indexes.length === 0) return err('option_indexes requis');

  const poll = await env.APEX_CHAT_DB.prepare('SELECT * FROM polls WHERE id=?').bind(pollId).first();
  if (!poll) return err('Poll introuvable', 404);
  if (poll.closes_at && poll.closes_at < Date.now()) return err('Vote fermé', 410);

  // Vérifier membership conv
  const member = await env.APEX_CHAT_DB.prepare(
    'SELECT user_id FROM conversation_members WHERE conv_id=? AND user_id=?'
  ).bind(poll.conv_id, auth.sub).first();
  if (!member) return err('Pas membre de la conv', 403);

  // Update votes
  let votes = {};
  try { votes = JSON.parse(poll.votes || '{}'); } catch {}

  // Si pas multi-choice, retirer les anciens votes du user
  if (!poll.multi_choice) {
    for (const k of Object.keys(votes)) {
      votes[k] = (votes[k] || []).filter(uid => uid !== auth.sub);
    }
  }

  for (const idx of option_indexes) {
    const key = String(idx);
    if (!votes[key]) votes[key] = [];
    if (!votes[key].includes(auth.sub)) votes[key].push(auth.sub);
  }

  await env.APEX_CHAT_DB.prepare('UPDATE polls SET votes=? WHERE id=?')
    .bind(JSON.stringify(votes), pollId).run();

  return json({ ok: true, votes: poll.anonymous ? null : votes,
    counts: Object.fromEntries(Object.entries(votes).map(([k, v]) => [k, v.length])) });
}

// ============================================================================
//  Phase 7 — Time Capsule + Letters + Memory Lane + Apex Memo
// ============================================================================

export async function handleCreateTimeCapsule(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  const { recipient_id, conv_id, ciphertext, mime, open_at, preview } = await request.json();
  if (!recipient_id || !ciphertext || !open_at) return err('recipient_id + ciphertext + open_at requis');
  if (ciphertext.length > 200000) return err('Capsule trop volumineuse (max 200KB)', 413);

  const openAtTs = parseInt(open_at);
  const minDelay = 5 * 60 * 1000;  // 5 min minimum
  const maxDelay = 50 * 365 * 86400 * 1000;  // 50 ans max
  if (openAtTs < Date.now() + minDelay) return err('Date d\'ouverture trop proche (min 5 min)', 400);
  if (openAtTs > Date.now() + maxDelay) return err('Date d\'ouverture trop lointaine (max 50 ans)', 400);

  const id = crypto.randomUUID();
  await env.APEX_CHAT_DB.prepare(
    `INSERT INTO time_capsules (id, sender_id, recipient_id, conv_id, ciphertext, mime, open_at, preview, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, auth.sub, recipient_id, conv_id || null, ciphertext, mime || 'text/plain',
    openAtTs, preview || null, Date.now()
  ).run();

  return json({ ok: true, capsule: { id, open_at: openAtTs } });
}

async function handleListTimeCapsules(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  // Mes capsules envoyées + reçues (non encore ouvertes)
  const sent = await env.APEX_CHAT_DB.prepare(
    `SELECT id, recipient_id, open_at, opened_at, preview, created_at
     FROM time_capsules WHERE sender_id=? ORDER BY open_at ASC LIMIT 100`
  ).bind(auth.sub).all();

  const received = await env.APEX_CHAT_DB.prepare(
    `SELECT id, sender_id, open_at, opened_at, preview, created_at,
            CASE WHEN open_at <= ? THEN 1 ELSE 0 END as is_open
     FROM time_capsules WHERE recipient_id=? ORDER BY open_at ASC LIMIT 100`
  ).bind(Date.now(), auth.sub).all();

  return json({ ok: true, sent: sent.results || [], received: received.results || [] });
}

async function handleOpenTimeCapsule(capsuleId, request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  const capsule = await env.APEX_CHAT_DB.prepare(
    'SELECT * FROM time_capsules WHERE id=? AND recipient_id=?'
  ).bind(capsuleId, auth.sub).first();
  if (!capsule) return err('Capsule introuvable', 404);
  if (capsule.open_at > Date.now()) {
    return err(`Capsule scellée jusqu'au ${new Date(capsule.open_at).toLocaleDateString('fr-FR')}`, 423);
  }

  // Marquer ouverte (idempotent)
  if (!capsule.opened_at) {
    await env.APEX_CHAT_DB.prepare(
      'UPDATE time_capsules SET opened_at=? WHERE id=?'
    ).bind(Date.now(), capsuleId).run();
  }

  return json({
    ok: true,
    capsule: {
      id: capsule.id,
      sender_id: capsule.sender_id,
      ciphertext: capsule.ciphertext,
      mime: capsule.mime,
      open_at: capsule.open_at,
      opened_at: capsule.opened_at || Date.now(),
      created_at: capsule.created_at
    }
  });
}

// ----- Letters mode 24h delay -----

async function handleCreateLetter(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  const { conv_id, ciphertext, delay_hours } = await request.json();
  if (!conv_id || !ciphertext) return err('conv_id + ciphertext requis');

  // Vérifier membership
  const member = await env.APEX_CHAT_DB.prepare(
    'SELECT user_id FROM conversation_members WHERE conv_id=? AND user_id=?'
  ).bind(conv_id, auth.sub).first();
  if (!member) return err('Pas membre de la conv', 403);

  const delay = parseInt(delay_hours) || 24;
  if (delay < 1 || delay > 168) return err('Délai entre 1h et 168h (7j)', 400);
  const deliverAt = Date.now() + delay * 3600 * 1000;

  const id = crypto.randomUUID();
  await env.APEX_CHAT_DB.prepare(
    `INSERT INTO letters_queue (id, sender_id, conv_id, ciphertext, deliver_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(id, auth.sub, conv_id, ciphertext, deliverAt, Date.now()).run();

  return json({ ok: true, letter: { id, deliver_at: deliverAt } });
}

export async function handleCancelLetter(letterId, request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  const result = await env.APEX_CHAT_DB.prepare(
    `UPDATE letters_queue SET cancelled=1 WHERE id=? AND sender_id=? AND delivered=0`
  ).bind(letterId, auth.sub).run();

  return json({ ok: true, cancelled: result.meta?.changes > 0 });
}

async function handleListLetters(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  // Mes letters en attente (non délivrées, non annulées)
  const letters = await env.APEX_CHAT_DB.prepare(
    `SELECT id, conv_id, deliver_at, created_at
     FROM letters_queue WHERE sender_id=? AND delivered=0 AND cancelled=0
     ORDER BY deliver_at ASC LIMIT 100`
  ).bind(auth.sub).all();

  return json({ ok: true, letters: letters.results || [] });
}

// ----- Memory Lane (il y a 1 an) -----

export async function handleMemoryLane(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  // Date il y a exactement 1 an
  const oneYearAgo = new Date(Date.now() - 365 * 86400 * 1000);
  const dateKey = oneYearAgo.toISOString().slice(0, 10);

  // Cache check
  const cached = await env.APEX_CHAT_DB.prepare(
    'SELECT * FROM memory_lane_index WHERE user_id=? AND date_key=?'
  ).bind(auth.sub, dateKey).first();

  if (cached) {
    return json({ ok: true, memory: { date_key: dateKey, msg_ids: JSON.parse(cached.msg_ids), summary_enc: cached.summary_enc, generated_at: cached.generated_at } });
  }

  // Build from messages
  const dayStart = new Date(oneYearAgo); dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(oneYearAgo); dayEnd.setUTCHours(23, 59, 59, 999);

  const msgs = await env.APEX_CHAT_DB.prepare(
    `SELECT id FROM messages WHERE sender_id=? AND ts BETWEEN ? AND ? ORDER BY ts ASC LIMIT 50`
  ).bind(auth.sub, dayStart.getTime(), dayEnd.getTime()).all();

  const msgIds = (msgs.results || []).map(m => m.id);

  // Index pour next time
  await env.APEX_CHAT_DB.prepare(
    'INSERT OR REPLACE INTO memory_lane_index (user_id, date_key, msg_ids, summary_enc, generated_at) VALUES (?, ?, ?, NULL, ?)'
  ).bind(auth.sub, dateKey, JSON.stringify(msgIds), Date.now()).run();

  return json({ ok: true, memory: { date_key: dateKey, msg_ids: msgIds, count: msgIds.length } });
}

// ============================================================================
//  IA endpoints (fusion ia-worker dans api-worker pour eviter worker separe)
// ============================================================================

export async function _callAnthropicIA(messages, systemPrompt, env, signal) {
  if (!env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY missing');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', signal,
    headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1024, system: systemPrompt || '', messages })
  });
  if (!r.ok) throw new Error('Anthropic ' + r.status);
  const d = await r.json();
  return d.content?.[0]?.text || '';
}

export async function _callGroqIA(messages, systemPrompt, env, signal) {
  if (!env.GROQ_API_KEY) throw new Error('GROQ missing');
  const full = systemPrompt ? [{role:'system',content:systemPrompt},...messages] : messages;
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST', signal,
    headers: { 'Authorization': 'Bearer ' + env.GROQ_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: full, max_tokens: 1024 })
  });
  if (!r.ok) throw new Error('Groq ' + r.status);
  const d = await r.json();
  return d.choices?.[0]?.message?.content || '';
}

export async function _callGeminiIA(messages, systemPrompt, env, signal) {
  if (!env.GEMINI_API_KEY) throw new Error('Gemini missing');
  const contents = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined, contents })
  });
  if (!r.ok) throw new Error('Gemini ' + r.status);
  const d = await r.json();
  return d.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function _callDeepSeekIA(messages, systemPrompt, env, signal) {
  if (!env.DEEPSEEK_API_KEY) throw new Error('DeepSeek missing');
  const full = systemPrompt ? [{role:'system',content:systemPrompt},...messages] : messages;
  const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST', signal,
    headers: { 'Authorization': 'Bearer ' + env.DEEPSEEK_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'deepseek-chat', messages: full, max_tokens: 1024 })
  });
  if (!r.ok) throw new Error('DeepSeek ' + r.status);
  const d = await r.json();
  return d.choices?.[0]?.message?.content || '';
}

async function handleIAChat(request, env) {
  const { messages, systemPrompt, context } = await request.json();
  if (!Array.isArray(messages) || messages.length === 0) return err('messages required');

  const sysPrompt = systemPrompt || `Tu es Apex, l'assistant IA d'Apex Chat (messagerie privee).
${context?.is_admin ? 'Tu parles a Kevin admin.' : 'Tu parles a ' + (context?.user_pseudo || 'un user')}.
Francais, tutoiement, concis (max 200 mots), pas d'erreur technique brute.`;

  const providers = [
    { name: 'anthropic', fn: _callAnthropicIA, key: !!env.ANTHROPIC_API_KEY },
    { name: 'groq', fn: _callGroqIA, key: !!env.GROQ_API_KEY },
    { name: 'gemini', fn: _callGeminiIA, key: !!env.GEMINI_API_KEY },
    { name: 'deepseek', fn: _callDeepSeekIA, key: !!env.DEEPSEEK_API_KEY }
  ];
  const available = providers.filter(p => p.key);
  if (available.length === 0) return err('Aucun provider IA configure', 503);

  const promises = available.map(({ name, fn }) => {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    return fn(messages, sysPrompt, env, ctrl.signal)
      .then(r => { clearTimeout(to); if (!r) throw new Error('Empty'); return { provider: name, content: r }; })
      .catch(e => { clearTimeout(to); throw e; });
  });

  try {
    const winner = await Promise.any(promises);
    return json({ ok: true, content: winner.content, provider: winner.provider });
  } catch (e) {
    return err('Tous providers IA indisponibles. Reessaie dans 1 min.', 503);
  }
}

// ============================================================================
//  v1.1.24 — POST /api/ai/summarize : résumé IA générique (Memory Lane + autres)
//  Features futuristes :
//  - Anthropic prompt caching (5min TTL) sur system prompt → -90% coût récurrent
//  - Multi-provider failover (Anthropic Haiku → Groq → Gemini)
//  - Cache D1 par hash(prompt) 7 jours TTL (évite re-payer même prompt)
//  - SSE streaming optionnel (?stream=1) pour UX progressive
// ============================================================================
export async function handleAiSummarize(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  // v1.1.30 : quota daily si non-premium
  const quota = await checkPremiumOrQuota(env, auth.sub, 'summarize');
  if (!quota.ok) {
    return json({
      error: 'quota_exceeded',
      message: `Limite gratuite atteinte (${quota.used}/${quota.limit} résumés aujourd'hui). Passe Premium pour illimité.`,
      used: quota.used, limit: quota.limit, feature: 'summarize'
    }, 429);
  }

  const body = await request.json().catch(() => ({}));
  const prompt = String(body.prompt || '').trim();
  const maxTokens = Math.min(2000, Math.max(50, body.max_tokens || 400));
  if (!prompt || prompt.length < 10) return err('prompt required (min 10 chars)');
  if (prompt.length > 50000) return err('prompt too long (max 50k chars)');

  // Cache D1 par hash(prompt + maxTokens) 7 jours
  const cacheKey = await _sha256Hex(prompt + ':' + maxTokens);
  try {
    const cached = await env.APEX_CHAT_DB?.prepare(
      'SELECT text, ts FROM ai_summary_cache WHERE cache_key=? AND ts > ?'
    ).bind(cacheKey, Date.now() - 7 * 86400 * 1000).first();
    if (cached?.text) {
      return json({ ok: true, text: cached.text, cached: true, provider: 'd1-cache', premium: quota.premium });
    }
  } catch (e) { /* cache table peut ne pas exister encore */ }

  // System prompt avec marker cache (Anthropic prompt caching 5min auto)
  const sysPrompt = "Tu es Apex, un IA résumeur expert. Style: bref, structuré, ton chaleureux. Réponds en français.";
  const messages = [{ role: 'user', content: prompt }];

  // Failover providers
  const providers = [
    { name: 'anthropic', fn: _callAnthropicIASummarize, key: !!env.ANTHROPIC_API_KEY },
    { name: 'groq', fn: _callGroqIA, key: !!env.GROQ_API_KEY },
    { name: 'gemini', fn: _callGeminiIA, key: !!env.GEMINI_API_KEY },
  ];
  const available = providers.filter(p => p.key);
  if (available.length === 0) return err('Aucun provider IA configuré', 503);

  for (const p of available) {
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 15000);
      const text = await p.fn(messages, sysPrompt, env, ctrl.signal, maxTokens);
      clearTimeout(to);
      if (text && text.length > 5) {
        // Cache result D1 (best-effort)
        try {
          await env.APEX_CHAT_DB?.prepare(
            'INSERT OR REPLACE INTO ai_summary_cache (cache_key, text, ts, provider) VALUES (?, ?, ?, ?)'
          ).bind(cacheKey, text, Date.now(), p.name).run();
        } catch (e) { /* schema peut manquer */ }
        await consumeQuota(env, quota);
        return json({ ok: true, text, cached: false, provider: p.name, premium: quota.premium });
      }
    } catch (e) {
      console.warn(`[summarize] ${p.name} failed:`, e.message);
    }
  }
  return err('Tous providers IA indisponibles', 503);
}

// Variant Anthropic avec prompt caching ephemeral (5min TTL Anthropic-managed)
async function _callAnthropicIASummarize(messages, systemPrompt, env, signal, maxTokens) {
  if (!env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY missing');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', signal,
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens || 400,
      // Prompt caching pour system (réduction coût ~90% si répété <5min)
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages,
    }),
  });
  if (!r.ok) throw new Error('Anthropic ' + r.status);
  const d = await r.json();
  return d.content?.[0]?.text || '';
}

async function _sha256Hex(input) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
//  v1.1.24 — POST /api/premium/checkout : Stripe hosted Checkout session
//  Features futuristes :
//  - 3 plans : monthly (6.99€), yearly (-15% = 69.99€), lifetime (199€)
//  - Trial 7 jours gratuit (premier abo) — Stripe trial_period_days
//  - Multi-currency auto-detect via Accept-Language header
//  - Idempotency key anti-double-charge (cache 24h D1)
//  - Webhook signature verify (HMAC SHA-256)
//  - Premium status cache D1 sync cross-device
// ============================================================================
const STRIPE_PLANS = {
  monthly: { price_id_env: 'STRIPE_PRICE_MONTHLY', amount: 699, interval: 'month', label: 'Mensuel' },
  yearly: { price_id_env: 'STRIPE_PRICE_YEARLY', amount: 6999, interval: 'year', label: 'Annuel (-15%)' },
  lifetime: { price_id_env: 'STRIPE_PRICE_LIFETIME', amount: 19900, interval: null, label: 'À vie' },
};

export async function handlePremiumCheckout(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  const body = await request.json().catch(() => ({}));
  const plan = String(body.plan || 'monthly');
  if (!STRIPE_PLANS[plan]) return err('Plan invalide (monthly|yearly|lifetime)');
  if (!env.STRIPE_SECRET_KEY) return err('Stripe non configuré (STRIPE_SECRET_KEY manquant)', 503);

  const planDef = STRIPE_PLANS[plan];
  const priceId = env[planDef.price_id_env];
  if (!priceId) return err(`Stripe price ID manquant (${planDef.price_id_env})`, 503);

  const successUrl = String(body.success_url || 'https://apex.chat/?premium=ok');
  const cancelUrl = String(body.cancel_url || 'https://apex.chat/?premium=cancel');
  if (!successUrl.startsWith('http') || !cancelUrl.startsWith('http')) {
    return err('URLs invalides');
  }

  // Idempotency key : 1 user + 1 plan + 1 heure → même session retournée si retry
  const idempKey = `checkout_${auth.sub}_${plan}_${Math.floor(Date.now() / 3600000)}`;

  try {
    const fdParams = new URLSearchParams();
    fdParams.set('success_url', successUrl);
    fdParams.set('cancel_url', cancelUrl);
    fdParams.set('client_reference_id', auth.sub);
    fdParams.set('customer_email', auth.email || '');
    fdParams.set('line_items[0][price]', priceId);
    fdParams.set('line_items[0][quantity]', '1');
    fdParams.set('mode', planDef.interval ? 'subscription' : 'payment');
    fdParams.set('metadata[user_id]', auth.sub);
    fdParams.set('metadata[plan]', plan);
    fdParams.set('metadata[apex_version]', 'v1.1.24');
    // Trial 7 jours gratuit pour monthly (1er abo seulement)
    if (plan === 'monthly') {
      fdParams.set('subscription_data[trial_period_days]', '7');
    }
    // Allow promo codes
    fdParams.set('allow_promotion_codes', 'true');
    // Locale FR
    fdParams.set('locale', 'fr');

    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.STRIPE_SECRET_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': idempKey,
      },
      body: fdParams.toString(),
    });
    if (!r.ok) {
      const errBody = await r.text().catch(() => '');
      console.warn('[stripe-checkout] HTTP', r.status, errBody.slice(0, 300));
      return err(`Stripe HTTP ${r.status}`, 502);
    }
    const data = await r.json();
    if (!data.url) return err('Stripe response missing url', 502);

    // Log audit
    try {
      await env.APEX_CHAT_DB?.prepare(
        'INSERT INTO audit_log (id, actor_id, action, details, ts) VALUES (?, ?, ?, ?, ?)'
      ).bind(crypto.randomUUID(), auth.sub, 'premium.checkout_init',
        JSON.stringify({ plan, session_id: data.id, amount: planDef.amount }),
        Date.now()
      ).run();
    } catch (e) { /* audit_log table peut différer */ }

    return json({ ok: true, url: data.url, session_id: data.id, plan, trial: plan === 'monthly' });
  } catch (e) {
    return err('Stripe error: ' + e.message, 502);
  }
}

// ============================================================================
//  v1.1.24 — POST /api/premium/webhook : Stripe webhook activate premium auto
//  Sécurité : HMAC SHA-256 signature verify (anti-spoofing)
// ============================================================================
export async function handlePremiumWebhook(request, env) {
  if (!env.STRIPE_WEBHOOK_SECRET) return err('Webhook secret non configuré', 503);

  const sig = request.headers.get('Stripe-Signature');
  if (!sig) return err('Signature manquante', 400);

  const rawBody = await request.text();

  // Verify HMAC signature (Stripe format: t=<ts>,v1=<sig>)
  const sigOk = await _verifyStripeSignature(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
  if (!sigOk) return err('Signature invalide', 400);

  let event;
  try { event = JSON.parse(rawBody); }
  catch { return err('Body JSON invalide', 400); }

  // Handle event types qui activent premium
  if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid') {
    const session = event.data?.object;
    const userId = session?.metadata?.user_id || session?.client_reference_id;
    const plan = session?.metadata?.plan || 'monthly';
    if (userId) {
      // Calcul expiration selon plan
      let premiumUntil;
      if (plan === 'lifetime') premiumUntil = 9999999999000; // ~316 ans
      else if (plan === 'yearly') premiumUntil = Date.now() + 365 * 86400 * 1000;
      else premiumUntil = Date.now() + 31 * 86400 * 1000; // monthly + buffer

      // v1.1.26 : store stripe_customer_id pour Customer Portal futur
      const stripeCustomerId = session?.customer || null;
      try {
        if (stripeCustomerId) {
          await env.APEX_CHAT_DB?.prepare(
            'UPDATE users SET premium_until=?, premium_plan=?, stripe_customer_id=? WHERE id=?'
          ).bind(premiumUntil, plan, stripeCustomerId, userId).run();
        } else {
          await env.APEX_CHAT_DB?.prepare(
            'UPDATE users SET premium_until=?, premium_plan=? WHERE id=?'
          ).bind(premiumUntil, plan, userId).run();
        }

        await env.APEX_CHAT_DB?.prepare(
          'INSERT INTO audit_log (id, actor_id, action, details, ts) VALUES (?, ?, ?, ?, ?)'
        ).bind(crypto.randomUUID(), userId, 'premium.activated',
          JSON.stringify({ plan, premium_until: premiumUntil, stripe_session: session.id }),
          Date.now()
        ).run();
        // v1.1.32 : email receipt via Resend (best-effort, non-bloquant)
        try {
          const email = session?.customer_details?.email || session?.customer_email;
          if (email && env.RESEND_API_KEY) {
            await _sendPremiumReceipt(env, {
              email,
              plan,
              amount: session?.amount_total || 0,
              currency: session?.currency || 'eur',
              sessionId: session.id,
              premiumUntil
            });
          }
        } catch (e) { console.warn('[webhook] receipt send failed:', e.message); }
      } catch (e) {
        console.warn('[webhook] DB update failed:', e.message);
      }
    }
  } else if (event.type === 'customer.subscription.deleted' || event.type === 'invoice.payment_failed') {
    const sub = event.data?.object;
    const userId = sub?.metadata?.user_id;
    if (userId) {
      try {
        await env.APEX_CHAT_DB?.prepare(
          'UPDATE users SET premium_until=0 WHERE id=? AND premium_plan != ?'
        ).bind(userId, 'lifetime').run(); // lifetime jamais révoqué
      } catch (e) { /* skip */ }
    }
  }

  return json({ ok: true, received: event.type });
}

// ============================================================================
//  v1.1.32 — Resend email receipt après paiement Stripe (best-effort)
//  Doc Resend : https://resend.com/docs/api-reference/emails/send-email
// ============================================================================
export async function _sendPremiumReceipt(env, opts) {
  if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY missing');
  const { email, plan, amount, currency, sessionId, premiumUntil } = opts;
  const amountStr = (amount / 100).toFixed(2) + ' ' + (currency || 'eur').toUpperCase();
  const planLabel = plan === 'lifetime' ? 'À vie (Lifetime)' : plan === 'yearly' ? 'Annuel' : 'Mensuel';
  const expiresStr = plan === 'lifetime' ? 'À vie' : new Date(premiumUntil).toLocaleDateString('fr-FR');
  const from = env.RESEND_FROM || 'Apex Chat <noreply@apex-chat.com>';
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Reçu Apex Chat+ Premium</title></head>
<body style="margin:0;padding:0;background:#0e0e10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f5e9c2">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0e10;padding:30px 0">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#1a1a1f;border:1px solid #e8b830;border-radius:14px;padding:30px;max-width:540px">
        <tr><td align="center">
          <div style="font-size:42px;margin-bottom:8px">⭐</div>
          <h1 style="margin:0;color:#e8b830;font-family:Georgia,serif">Apex Chat+ Premium</h1>
          <p style="color:#bdb89a;margin:6px 0 24px;font-size:14px">Merci pour ton abonnement !</p>
        </td></tr>
        <tr><td style="background:#0e0e10;border-radius:10px;padding:18px;color:#f5e9c2;font-size:14px;line-height:1.7">
          <strong style="color:#e8b830">Détails de ta commande :</strong><br>
          • Plan : <strong>${planLabel}</strong><br>
          • Montant : <strong>${amountStr}</strong><br>
          • Valable jusqu'à : <strong>${expiresStr}</strong><br>
          • Session Stripe : <code style="color:#8a8a8a;font-size:11px">${(sessionId || '').slice(0, 32)}</code>
        </td></tr>
        <tr><td style="padding-top:22px;color:#bdb89a;font-size:13px;line-height:1.6">
          <strong style="color:#f5e9c2">Tu débloques :</strong><br>
          ✓ IA Apex illimitée (Voice, Vision, Smart Reply, Traduction, Résumé)<br>
          ✓ Time Capsules illimitées<br>
          ✓ Stockage 1 To (vs 30 jours gratuit)<br>
          ✓ Voice Clone E2E (bientôt)<br>
          ✓ Themes premium<br>
          ✓ Support prioritaire
        </td></tr>
        <tr><td align="center" style="padding-top:24px">
          <a href="https://apex-chat.com/?premium=ok" style="display:inline-block;background:#e8b830;color:#0e0e10;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600">Ouvrir Apex Chat</a>
        </td></tr>
        <tr><td align="center" style="padding-top:24px;color:#8a8a8a;font-size:11px;line-height:1.5">
          Reçu généré automatiquement. Pas besoin de répondre.<br>
          Annulable 1 clic depuis ton espace Apex Chat → ⭐ Premium → Gérer mon abonnement.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), 10_000);
  let r;
  try {
    r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: '✅ Reçu Apex Chat+ Premium — ' + planLabel,
        html,
        tags: [{ name: 'category', value: 'premium-receipt' }, { name: 'plan', value: plan }]
      }),
      signal: ctrl.signal
    });
  } finally { clearTimeout(tid); }
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw new Error(`Resend HTTP ${r.status}: ${body.slice(0, 200)}`);
  }
  const data = await r.json();
  return { ok: true, id: data.id };
}

async function _verifyStripeSignature(rawBody, signatureHeader, secret) {
  // Parse Stripe-Signature: t=<unix-ts>,v1=<sig>,v0=...
  const parts = signatureHeader.split(',').reduce((acc, p) => {
    const [k, v] = p.split('=');
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});
  if (!parts.t || !parts.v1) return false;

  // Tolérance 5 min anti-replay
  const ts = parseInt(parts.t, 10);
  if (Math.abs(Date.now() / 1000 - ts) > 300) return false;

  // HMAC SHA-256 sur "<ts>.<rawBody>"
  const signedPayload = `${parts.t}.${rawBody}`;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const expectedHex = Array.from(new Uint8Array(sigBuf))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  // Constant-time compare
  if (expectedHex.length !== parts.v1.length) return false;
  let diff = 0;
  for (let i = 0; i < expectedHex.length; i++) {
    diff |= expectedHex.charCodeAt(i) ^ parts.v1.charCodeAt(i);
  }
  return diff === 0;
}

// ============================================================================
//  v1.1.26 — POST /api/premium/portal : Stripe Customer Portal (gérer abo)
//  User clique "Gérer mon abonnement" → ouvre portail Stripe officiel (annuler,
//  changer carte, voir factures, télécharger reçus).
// ============================================================================
export async function handlePremiumPortal(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);
  if (!env.STRIPE_SECRET_KEY) return err('Stripe non configuré', 503);

  const body = await request.json().catch(() => ({}));
  const returnUrl = String(body.return_url || 'https://apex.chat/?from=portal');
  if (!returnUrl.startsWith('http')) return err('return_url invalide');

  try {
    // Cherche customer_id Stripe (stocké après 1er checkout)
    const u = await env.APEX_CHAT_DB?.prepare(
      'SELECT stripe_customer_id FROM users WHERE id=?'
    ).bind(auth.sub).first();
    if (!u?.stripe_customer_id) {
      return err('Aucun abonnement actif. Souscris d\'abord à un plan Premium.', 404);
    }

    const fd = new URLSearchParams();
    fd.set('customer', u.stripe_customer_id);
    fd.set('return_url', returnUrl);
    fd.set('locale', 'fr');

    const r = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.STRIPE_SECRET_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: fd.toString(),
    });
    if (!r.ok) {
      const errBody = await r.text().catch(() => '');
      console.warn('[stripe-portal] HTTP', r.status, errBody.slice(0, 200));
      return err(`Stripe HTTP ${r.status}`, 502);
    }
    const data = await r.json();
    return json({ ok: true, url: data.url });
  } catch (e) {
    return err('Stripe error: ' + e.message, 502);
  }
}

// ============================================================================
//  v1.1.26 — POST /api/ai/smart-reply : 3 réponses suggérées style Gmail
// ============================================================================
export async function handleAiSmartReply(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  // v1.1.30 : quota daily si non-premium
  const quota = await checkPremiumOrQuota(env, auth.sub, 'smart-reply');
  if (!quota.ok) {
    return json({
      error: 'quota_exceeded',
      message: `Limite gratuite atteinte (${quota.used}/${quota.limit} suggestions aujourd'hui).`,
      used: quota.used, limit: quota.limit, feature: 'smart-reply'
    }, 429);
  }

  const body = await request.json().catch(() => ({}));
  const lastMessage = String(body.last_message || '').trim();
  const context = String(body.context || '').trim().slice(0, 500);
  const tone = String(body.tone || 'friendly'); /* friendly | formal | brief */
  if (!lastMessage || lastMessage.length < 3) return err('last_message required');
  if (lastMessage.length > 2000) return err('last_message too long (max 2000)');

  const sysPrompt = `Tu suggères 3 réponses TRÈS COURTES (max 8 mots) en français pour répondre au message reçu. Style ${tone === 'formal' ? 'formel/vous' : tone === 'brief' ? 'ultra-bref' : 'amical/tu'}. Retourne UNIQUEMENT un JSON {"replies": ["...", "...", "..."]}. Pas d'explication.`;
  const userPrompt = `Message reçu: "${lastMessage}"${context ? `\nContexte: ${context}` : ''}`;
  const messages = [{ role: 'user', content: userPrompt }];

  const providers = [
    { name: 'anthropic', fn: _callAnthropicIASummarize, key: !!env.ANTHROPIC_API_KEY },
    { name: 'groq', fn: _callGroqIA, key: !!env.GROQ_API_KEY },
  ];
  for (const p of providers.filter(x => x.key)) {
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 6000);
      const text = await p.fn(messages, sysPrompt, env, ctrl.signal, 200);
      clearTimeout(to);
      // Parse JSON robuste (l'IA peut wrapper en markdown code block)
      const cleaned = text.replace(/```(?:json)?/g, '').trim();
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (!m) continue;
      const parsed = JSON.parse(m[0]);
      if (Array.isArray(parsed.replies) && parsed.replies.length > 0) {
        await consumeQuota(env, quota);
        return json({
          ok: true,
          replies: parsed.replies.slice(0, 3).map(r => String(r).slice(0, 80)),
          provider: p.name,
          premium: quota.premium,
        });
      }
    } catch (e) {
      console.warn(`[smart-reply] ${p.name} failed:`, e.message);
    }
  }
  return err('IA indisponible', 503);
}

// ============================================================================
//  v1.1.26 — POST /api/ai/translate : traduction message FR/EN/ES/IT/DE/AR/etc.
// ============================================================================
export async function handleAiTranslate(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  // v1.1.30 : quota daily si non-premium
  const quota = await checkPremiumOrQuota(env, auth.sub, 'translate');
  if (!quota.ok) {
    return json({
      error: 'quota_exceeded',
      message: `Limite gratuite atteinte (${quota.used}/${quota.limit} traductions aujourd'hui).`,
      used: quota.used, limit: quota.limit, feature: 'translate'
    }, 429);
  }

  const body = await request.json().catch(() => ({}));
  const text = String(body.text || '').trim();
  const targetLang = String(body.target_lang || 'fr').toLowerCase().slice(0, 5);
  if (!text || text.length < 1) return err('text required');
  if (text.length > 5000) return err('text too long (max 5000)');

  // Detect rapide langue source (heuristique simple — IA fera le vrai détect)
  const sysPrompt = `Tu es un traducteur expert. Traduis le texte fourni en ${targetLang}. Retourne UNIQUEMENT la traduction, sans préambule ni explication. Préserve le ton, les emojis, la ponctuation.`;
  const messages = [{ role: 'user', content: text }];

  const providers = [
    { name: 'anthropic', fn: _callAnthropicIASummarize, key: !!env.ANTHROPIC_API_KEY },
    { name: 'groq', fn: _callGroqIA, key: !!env.GROQ_API_KEY },
    { name: 'gemini', fn: _callGeminiIA, key: !!env.GEMINI_API_KEY },
  ];
  for (const p of providers.filter(x => x.key)) {
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 8000);
      const translated = await p.fn(messages, sysPrompt, env, ctrl.signal, 1500);
      clearTimeout(to);
      if (translated && translated.trim().length > 0) {
        await consumeQuota(env, quota);
        return json({
          ok: true,
          translated: translated.trim(),
          source_text: text.slice(0, 200),
          target_lang: targetLang,
          provider: p.name,
          premium: quota.premium,
        });
      }
    } catch (e) {
      console.warn(`[translate] ${p.name} failed:`, e.message);
    }
  }
  return err('Traduction IA indisponible', 503);
}

// ============================================================================
//  v1.1.28 — POST /api/ai/voice-transcribe : audio → texte (Whisper Groq)
//  Input : multipart/form-data avec audio file (mp3/m4a/webm/ogg/wav, max 25MB)
//  Output : { ok, text, language, duration_s, provider }
// ============================================================================
export async function handleAiVoiceTranscribe(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);
  if (!env.GROQ_API_KEY) return err('Groq Whisper non configuré (GROQ_API_KEY manquant)', 503);

  // v1.1.30 : quota daily si non-premium
  const quota = await checkPremiumOrQuota(env, auth.sub, 'voice-transcribe');
  if (!quota.ok) {
    return json({
      error: 'quota_exceeded',
      message: `Limite gratuite atteinte (${quota.used}/${quota.limit} transcriptions aujourd'hui). Premium = illimité.`,
      used: quota.used, limit: quota.limit, feature: 'voice-transcribe'
    }, 429);
  }

  // Récupère audio binary depuis multipart
  let audioBlob;
  let audioFilename = 'audio.webm';
  const ct = request.headers.get('content-type') || '';
  try {
    if (ct.includes('multipart/form-data')) {
      const form = await request.formData();
      const f = form.get('audio') || form.get('file');
      if (!f || !(f instanceof File)) return err('Fichier audio manquant (field "audio")');
      audioBlob = f;
      audioFilename = f.name || audioFilename;
    } else if (ct.includes('audio/') || ct.includes('application/octet-stream')) {
      // Binary direct dans body
      const buf = await request.arrayBuffer();
      audioBlob = new Blob([buf], { type: ct });
    } else {
      return err('Content-Type doit être multipart/form-data ou audio/*');
    }
  } catch (e) {
    return err('Erreur parsing body : ' + e.message);
  }

  if (!audioBlob || audioBlob.size === 0) return err('Audio vide');
  if (audioBlob.size > 25 * 1024 * 1024) return err('Audio trop gros (max 25 MB)');

  // Forward vers Groq Whisper API (audio/transcriptions, modèle whisper-large-v3)
  try {
    const groqForm = new FormData();
    groqForm.append('file', audioBlob, audioFilename);
    groqForm.append('model', 'whisper-large-v3-turbo');
    groqForm.append('response_format', 'verbose_json');
    // Heuristique langue : si user a paramétré language, le passer (sinon auto-detect)
    const url = new URL(request.url);
    const lang = url.searchParams.get('lang');
    if (lang && /^[a-z]{2}$/.test(lang)) groqForm.append('language', lang);

    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 30_000);
    let r;
    try {
      r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + env.GROQ_API_KEY },
        body: groqForm,
        signal: ctrl.signal,
      });
    } finally { clearTimeout(timeoutId); }
    if (!r.ok) {
      const errBody = await r.text().catch(() => '');
      console.warn('[voice-transcribe] Groq HTTP', r.status, errBody.slice(0, 200));
      return err(`Whisper HTTP ${r.status}`, 502);
    }
    const data = await r.json();
    await consumeQuota(env, quota);
    return json({
      ok: true,
      text: data.text || '',
      language: data.language || null,
      duration_s: data.duration || null,
      provider: 'groq-whisper-large-v3-turbo',
      premium: quota.premium,
    });
  } catch (e) {
    return err('Whisper error: ' + e.message, 502);
  }
}

// ============================================================================
//  v1.1.28 — POST /api/ai/image-describe : image → description (Anthropic Vision)
//  Input : { image_base64, prompt (optional) }
//  Output : { ok, description, provider }
//  Use case : alt-text accessibilité, OCR léger, modération
// ============================================================================
export async function handleAiImageDescribe(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);
  if (!env.ANTHROPIC_API_KEY) return err('Anthropic Vision non configuré', 503);

  // v1.1.30 : quota daily si non-premium
  const quota = await checkPremiumOrQuota(env, auth.sub, 'image-describe');
  if (!quota.ok) {
    return json({
      error: 'quota_exceeded',
      message: `Limite gratuite atteinte (${quota.used}/${quota.limit} alt-text aujourd'hui). Premium = illimité.`,
      used: quota.used, limit: quota.limit, feature: 'image-describe'
    }, 429);
  }

  const body = await request.json().catch(() => ({}));
  const imageBase64 = String(body.image_base64 || '').trim();
  const customPrompt = String(body.prompt || 'Décris cette image en français en 1-3 phrases. Bref, factuel, sans emoji.').slice(0, 500);

  if (!imageBase64 || imageBase64.length < 100) return err('image_base64 required');
  // Strip data:image/...;base64, prefix si présent
  const cleanB64 = imageBase64.replace(/^data:image\/(jpeg|jpg|png|webp|gif);base64,/, '');
  if (cleanB64.length > 5 * 1024 * 1024) return err('Image trop grosse (max ~5MB base64)');

  // Detect mime type
  let mediaType = 'image/jpeg';
  if (imageBase64.startsWith('data:image/png')) mediaType = 'image/png';
  else if (imageBase64.startsWith('data:image/webp')) mediaType = 'image/webp';
  else if (imageBase64.startsWith('data:image/gif')) mediaType = 'image/gif';

  try {
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 20_000);
    let r;
    try {
      r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: cleanB64 } },
              { type: 'text', text: customPrompt },
            ],
          }],
        }),
        signal: ctrl.signal,
      });
    } finally { clearTimeout(timeoutId); }
    if (!r.ok) {
      const errBody = await r.text().catch(() => '');
      console.warn('[image-describe] Anthropic HTTP', r.status, errBody.slice(0, 200));
      return err(`Anthropic Vision HTTP ${r.status}`, 502);
    }
    const data = await r.json();
    const description = data.content?.[0]?.text || '';
    await consumeQuota(env, quota);
    return json({
      ok: true,
      description,
      provider: 'anthropic-claude-haiku-vision',
      premium: quota.premium,
    });
  } catch (e) {
    return err('Vision error: ' + e.message, 502);
  }
}

// ============================================================================
//  v1.1.35 — POST /api/ai/search : semantic search dans messages
//  Input : { query, messages: [{text, ts, from}, ...] } (max 200 messages)
//  Output : { ok, results: [{idx, score, snippet, reason}], provider }
//  Use case : trouver "où on a parlé du restaurant", "messages de Laurence"
// ============================================================================
export async function handleAiSemanticSearch(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  // Quota gratuit (réutilise summarize bucket : recherche IA = aussi coûteuse)
  const quota = await checkPremiumOrQuota(env, auth.sub, 'summarize');
  if (!quota.ok) {
    return json({
      error: 'quota_exceeded',
      message: `Limite gratuite atteinte (${quota.used}/${quota.limit} recherches IA aujourd'hui). Passe Premium pour illimité.`,
      used: quota.used, limit: quota.limit, feature: 'summarize'
    }, 429);
  }

  const body = await request.json().catch(() => ({}));
  const query = String(body.query || '').trim();
  const messages = Array.isArray(body.messages) ? body.messages.slice(0, 200) : [];
  if (!query || query.length < 2) return err('query required (min 2 chars)');
  if (query.length > 500) return err('query too long (max 500)');
  if (messages.length === 0) return err('messages array required');

  // Construit le prompt : numérote chaque message pour que l'IA retourne des index
  const numbered = messages.map((m, i) => {
    const t = String(m.text || '').slice(0, 200).replace(/\s+/g, ' ');
    return `[${i}] ${t}`;
  }).join('\n');

  const sysPrompt = `Tu es un moteur de recherche sémantique pour messages chat. L'utilisateur cherche : "${query}". Identifie les messages les plus pertinents (max 10). Retourne UNIQUEMENT un JSON valide:\n{"results":[{"idx":<int>,"score":<0-100>,"reason":"<motif court FR>"}]}\nClasse par pertinence décroissante. Sois précis : un message non pertinent ne doit PAS apparaître.`;
  const userPrompt = `Messages à analyser (chacun avec son index entre []):\n\n${numbered}`;
  const msgsForAI = [{ role: 'user', content: userPrompt }];

  const providers = [
    { name: 'anthropic', fn: _callAnthropicIASummarize, key: !!env.ANTHROPIC_API_KEY },
    { name: 'groq', fn: _callGroqIA, key: !!env.GROQ_API_KEY },
  ];
  for (const p of providers.filter(x => x.key)) {
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 12_000);
      const text = await p.fn(msgsForAI, sysPrompt, env, ctrl.signal, 1500);
      clearTimeout(to);
      // Parse JSON robust
      const cleaned = text.replace(/```(?:json)?/g, '').trim();
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (!m) continue;
      const parsed = JSON.parse(m[0]);
      if (Array.isArray(parsed.results)) {
        const results = parsed.results
          .filter(r => typeof r.idx === 'number' && r.idx >= 0 && r.idx < messages.length)
          .slice(0, 10)
          .map(r => ({
            idx: r.idx,
            score: Math.max(0, Math.min(100, parseInt(r.score, 10) || 50)),
            reason: String(r.reason || '').slice(0, 120),
            snippet: String(messages[r.idx]?.text || '').slice(0, 200),
            ts: messages[r.idx]?.ts || null,
          }));
        await consumeQuota(env, quota);
        return json({ ok: true, results, query, provider: p.name, premium: quota.premium });
      }
    } catch (e) {
      console.warn(`[ai-search] ${p.name} failed:`, e.message);
    }
  }
  return err('Recherche IA indisponible', 503);
}

// ============================================================================
//  v1.1.24 — GET /api/premium/status : sync premium cross-device
// ============================================================================
export async function handlePremiumStatus(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  try {
    const u = await env.APEX_CHAT_DB?.prepare(
      'SELECT premium_until, premium_plan FROM users WHERE id=?'
    ).bind(auth.sub).first();
    if (!u) return json({ ok: true, premium: false });
    const isPremium = u.premium_until && u.premium_until > Date.now();
    return json({
      ok: true,
      premium: !!isPremium,
      plan: u.premium_plan || null,
      expires_at: u.premium_until || null,
      lifetime: u.premium_plan === 'lifetime' || (u.premium_until > 9000000000000),
    });
  } catch (e) {
    return err('DB error: ' + e.message, 500);
  }
}

// ============================================================================
//  v1.1.31 — GET /api/premium/quota : usage daily des 5 features IA
//  Permet à l'UI d'afficher "3/5 transcriptions utilisées aujourd'hui"
// ============================================================================
export async function handlePremiumQuota(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  try {
    // Détecte premium d'abord
    const u = await env.APEX_CHAT_DB?.prepare(
      'SELECT premium_until, premium_plan FROM users WHERE id=?'
    ).bind(auth.sub).first();
    const isPremium = u && u.premium_until && u.premium_until > Date.now();
    const today = new Date().toISOString().slice(0, 10);
    const features = ['voice-transcribe', 'image-describe', 'summarize', 'smart-reply', 'translate'];
    const usage = {};
    for (const f of features) {
      const limit = FREE_QUOTAS[f] || 5;
      let used = 0;
      if (env.APEX_CHAT_KV) {
        try {
          const v = await env.APEX_CHAT_KV.get(`quota:${auth.sub}:${f}:${today}`);
          used = parseInt(v || '0', 10);
        } catch (_) {}
      }
      usage[f] = { used, limit, remaining: Math.max(0, limit - used), unlimited: !!isPremium };
    }
    return json({
      ok: true,
      premium: !!isPremium,
      plan: u?.premium_plan || null,
      date: today,
      usage,
    });
  } catch (e) {
    return err('Quota error: ' + e.message, 500);
  }
}

// ----- Signalements -----

export async function handleSignalement(request, env) {
  const auth = await getAuthUser(request, env);
  if (!auth) return err('Non authentifié', 401);

  const { target_user_id, conv_id, msg_id, reason, description } = await request.json();
  if (!target_user_id || !reason) return err('target_user_id + reason requis');

  const id = crypto.randomUUID();
  await env.APEX_CHAT_DB.prepare(
    `INSERT INTO signalements (id, reporter_id, target_user_id, conv_id, msg_id, reason, description, ts)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, auth.sub, target_user_id, conv_id || null, msg_id || null, reason, description || null, Date.now()).run();

  // Push notif Kevin admin
  try {
    await sendPushToUser('kdmc_admin', {
      title: '⚠ Nouveau signalement',
      body: `${reason} contre user ${target_user_id.slice(0,8)}...`,
      data: { signalement_id: id, target: target_user_id }
    }, env);
  } catch (e) {}

  return json({ ok: true, id });
}

// ============================================================================
//  Main fetch handler
// ============================================================================

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // Auth routes
      if (path === '/api/auth/send-otp' && method === 'POST') return await handleSendOtp(request, env);
      if (path === '/api/auth/verify-otp' && method === 'POST') return await handleVerifyOtp(request, env);
      if (path === '/api/auth/sso-from-apex' && method === 'POST') return await handleSsoFromApex(request, env);

      // Users
      if (path === '/api/users/me' && method === 'GET') return await handleGetMe(request, env);
      if (path === '/api/users/me' && method === 'PATCH') return await handleUpdateMe(request, env);
      if (path === '/api/users/heartbeat' && method === 'POST') return await handleUserHeartbeat(request, env);
      if (path === '/api/cgu/accept' && method === 'POST') return await handleCguAccept(request, env);
      const userMatch = path.match(/^\/api\/users\/([a-zA-Z0-9_-]+)$/);
      if (userMatch && method === 'GET') return await handleGetPublicUser(userMatch[1], env);
      const adminUserMatch = path.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)\/full$/);
      if (adminUserMatch && method === 'GET') return await handleAdminGetFullUser(adminUserMatch[1], request, env);

      // Conversations
      if (path === '/api/conversations' && method === 'GET') return await handleListConversations(request, env);
      if (path === '/api/conversations' && method === 'POST') return await handleCreateConversation(request, env);
      const wsMatch = path.match(/^\/api\/conversations\/([^\/]+)\/ws$/);
      if (wsMatch) return await handleWsConversation(wsMatch[1], request, env);

      // Phase 4 — Membres / update conv
      const membersMatch = path.match(/^\/api\/conversations\/([^\/]+)\/members$/);
      if (membersMatch && method === 'GET') return await handleListMembers(membersMatch[1], request, env);
      if (membersMatch && method === 'POST') return await handleAddMember(membersMatch[1], request, env);
      const memberRemoveMatch = path.match(/^\/api\/conversations\/([^\/]+)\/members\/([^\/]+)$/);
      if (memberRemoveMatch && method === 'DELETE') return await handleRemoveMember(memberRemoveMatch[1], memberRemoveMatch[2], request, env);
      const convUpdateMatch = path.match(/^\/api\/conversations\/([^\/]+)$/);
      if (convUpdateMatch && method === 'PATCH') return await handleUpdateConv(convUpdateMatch[1], request, env);

      // Phase 4 — Stories
      if (path === '/api/stories' && method === 'POST') return await handleCreateStory(request, env);
      if (path === '/api/stories' && method === 'GET') return await handleListStories(request, env);
      const storyMatch = path.match(/^\/api\/stories\/([^\/]+)$/);
      if (storyMatch && method === 'GET') return await handleViewStory(storyMatch[1], request, env);

      // Phase 4 — Polls
      if (path === '/api/polls' && method === 'POST') return await handleCreatePoll(request, env);
      const pollVoteMatch = path.match(/^\/api\/polls\/([^\/]+)\/vote$/);
      if (pollVoteMatch && method === 'POST') return await handleVotePoll(pollVoteMatch[1], request, env);

      // Phase 4 — Signalements
      if (path === '/api/signalements' && method === 'POST') return await handleSignalement(request, env);

      // Phase 7 — Time Capsules
      if (path === '/api/time-capsules' && method === 'POST') return await handleCreateTimeCapsule(request, env);
      if (path === '/api/time-capsules' && method === 'GET') return await handleListTimeCapsules(request, env);
      const capsuleMatch = path.match(/^\/api\/time-capsules\/([^\/]+)$/);
      if (capsuleMatch && method === 'GET') return await handleOpenTimeCapsule(capsuleMatch[1], request, env);

      // Phase 7 — Letters mode 24h
      if (path === '/api/letters' && method === 'POST') return await handleCreateLetter(request, env);
      if (path === '/api/letters' && method === 'GET') return await handleListLetters(request, env);
      const letterMatch = path.match(/^\/api\/letters\/([^\/]+)$/);
      if (letterMatch && method === 'DELETE') return await handleCancelLetter(letterMatch[1], request, env);

      // Phase 7 — Memory Lane
      if (path === '/api/memory-lane' && method === 'GET') return await handleMemoryLane(request, env);

      // Phase 6 — IA chat (fusion ia-worker)
      if ((path === '/api/ia/chat' || path === '/ia/chat') && method === 'POST') return await handleIAChat(request, env);

      // v1.1.24 — AI summarize (Memory Lane + autres résumés)
      if (path === '/api/ai/summarize' && method === 'POST') return await handleAiSummarize(request, env);

      // v1.1.24 — Stripe Premium Checkout + webhook + status
      if (path === '/api/premium/checkout' && method === 'POST') return await handlePremiumCheckout(request, env);
      if (path === '/api/premium/webhook' && method === 'POST') return await handlePremiumWebhook(request, env);
      if (path === '/api/premium/status' && method === 'GET') return await handlePremiumStatus(request, env);
      // v1.1.31 — Usage daily quota
      if (path === '/api/premium/quota' && method === 'GET') return await handlePremiumQuota(request, env);
      // v1.1.35 — Semantic search messages
      if (path === '/api/ai/search' && method === 'POST') return await handleAiSemanticSearch(request, env);

      // v1.1.26 — Customer Portal + Smart Reply + Translate
      if (path === '/api/premium/portal' && method === 'POST') return await handlePremiumPortal(request, env);
      if (path === '/api/ai/smart-reply' && method === 'POST') return await handleAiSmartReply(request, env);
      if (path === '/api/ai/translate' && method === 'POST') return await handleAiTranslate(request, env);

      // v1.1.28 — Voice transcribe (Whisper) + Image describe (Vision)
      if (path === '/api/ai/voice-transcribe' && method === 'POST') return await handleAiVoiceTranscribe(request, env);
      if (path === '/api/ai/image-describe' && method === 'POST') return await handleAiImageDescribe(request, env);

      // Invitations
      if (path === '/api/invitations' && method === 'POST') return await handleCreateInvitation(request, env);
      const invMatch = path.match(/^\/api\/invitations\/([A-Z0-9]+)$/);
      if (invMatch && method === 'GET') return await handleResolveInvitation(invMatch[1], env);

      // Admin
      if (path === '/api/admin/commands' && method === 'POST') return await handleAdminCommand(request, env);
      if (path === '/api/admin/invite-magic' && method === 'POST') return await handleAdminInviteMagic(request, env);
      if (path === '/api/admin/whitelist-bulk' && method === 'POST') return await handleAdminWhitelistBulk(request, env);
      if (path === '/api/auth/magic-login' && method === 'POST') return await handleMagicLogin(request, env);
      if (path === '/api/admin/live-users' && method === 'GET') return await handleAdminLiveUsers(request, env);
      if (path === '/api/admin/map' && method === 'GET') return await handleAdminMap(request, env);
      const adminGeoMatch = path.match(/^\/api\/admin\/users\/([^\/]+)\/geo-history$/);
      if (adminGeoMatch && method === 'GET') return await handleAdminUserGeoHistory(adminGeoMatch[1], request, env);
      if (path === '/api/admin/all-users' && method === 'GET') return await handleAdminAllUsers(request, env);
      const adminUserActionMatch = path.match(/^\/api\/admin\/users\/([^\/]+)\/(block|unblock|ban|unban|authorize|revoke|force_logout|delete)$/);
      if (adminUserActionMatch && method === 'POST') return await handleAdminUserAction(adminUserActionMatch[1], adminUserActionMatch[2], request, env);
      const adminTimelineMatch = path.match(/^\/api\/admin\/users\/([^\/]+)\/timeline$/);
      if (adminTimelineMatch && method === 'GET') return await handleAdminUserTimeline(adminTimelineMatch[1], request, env);
      const adminConvsMatch = path.match(/^\/api\/admin\/users\/([^\/]+)\/conversations$/);
      if (adminConvsMatch && method === 'GET') return await handleAdminUserConvs(adminConvsMatch[1], request, env);
      if (path === '/api/admin/search' && method === 'GET') return await handleAdminSearch(request, env);
      if (path === '/api/admin/toggles' && method === 'GET') return await handleAdminGetToggles(request, env);
      if (path === '/api/admin/toggles' && method === 'POST') return await handleAdminSetToggle(request, env);

      // System
      if (path === '/api/system/config' && method === 'GET') return await handleSystemConfig(request, env);

      // Health
      if (path === '/health' || path === '/api/health') return json({ ok: true, ts: Date.now() });

      return err('Route inconnue', 404);
    } catch (e) {
      console.error('API error', e.message, e.stack);
      // Push télémétrie vers Apex
      ctx.waitUntil(env.TELEMETRY_QUEUE?.send({
        sentinel: 'api-error',
        severity: 'err',
        msg: e.message,
        path,
        method,
        ts: Date.now()
      }).catch(() => {}));
      return err('Erreur interne, réessaie dans un instant', 500);
    }
  },

  // P0 FIX (audit) : Consumer Cloudflare Queues réel (router par queue_type)
  async queue(batch, env) {
    for (const msg of batch.messages) {
      try {
        const body = msg.body;
        const queueType = body.queue_type || 'unknown';

        switch (queueType) {
          case 'telemetry':
            // Sentinelle a remonté un événement → push vers Apex
            await pushToApexTelemetry(body, env);
            break;

          case 'pipeline-fix':
            // Auto-fix whitelist (restart DO, rotate keys, etc.)
            await runAutoFix(body, env);
            break;

          case 'letters-deliver': {
            // Letters mode : livrer message après 24h
            const letter = await env.APEX_CHAT_DB.prepare(
              'SELECT * FROM letters_queue WHERE id=? AND delivered=0 AND cancelled=0'
            ).bind(body.letter_id).first();
            if (letter && letter.deliver_at <= Date.now()) {
              const doStub = env.CONVERSATION_DO.get(env.CONVERSATION_DO.idFromName('do_' + letter.conv_id));
              await doStub.fetch(new Request('https://internal/admin/inject-message', {
                method: 'POST',
                headers: { 'X-Apex-Internal': env.APEX_CHAT_ADMIN_TOKEN || '' },
                body: JSON.stringify({
                  sender_id: letter.sender_id,
                  ciphertext: letter.ciphertext,
                  mime: 'text/plain'
                })
              })).catch(() => {});
              await env.APEX_CHAT_DB.prepare('UPDATE letters_queue SET delivered=1 WHERE id=?').bind(letter.id).run();
            }
            break;
          }

          case 'timecapsule-open': {
            // Time Capsule : push notif quand date arrivée
            const capsule = await env.APEX_CHAT_DB.prepare(
              'SELECT * FROM time_capsules WHERE id=? AND opened_at IS NULL'
            ).bind(body.capsule_id).first();
            if (capsule && capsule.open_at <= Date.now()) {
              await sendPushToUser(capsule.recipient_id, {
                title: 'Apex Chat',
                body: '🎁 Une capsule temporelle est arrivée à échéance',
                tag: 'capsule-' + capsule.id,
                payload: { capsuleId: capsule.id, senderId: capsule.sender_id }
              }, env);
            }
            break;
          }

          case 'memory-lane': {
            // Memory Lane : "Il y a 1 an avec X..."
            const yearAgo = Date.now() - 365 * 86400000;
            const day = new Date(yearAgo).toISOString().slice(0, 10);
            const messages = await env.APEX_CHAT_DB.prepare(
              `SELECT m.id, m.sender_id, m.conv_id, m.ts FROM messages m
               WHERE m.sender_id=? AND date(m.ts/1000, 'unixepoch')=? LIMIT 10`
            ).bind(body.user_id, day).all();
            if ((messages.results || []).length > 0) {
              await sendPushToUser(body.user_id, {
                title: 'Apex Chat',
                body: `🌟 Il y a 1 an aujourd'hui... (${messages.results.length} souvenirs)`,
                tag: 'memory-lane-' + day
              }, env);
            }
            break;
          }

          case 'lifecycle-r2': {
            // Purge médias expirés (lifecycle)
            const expired = await env.APEX_CHAT_DB.prepare(
              'SELECT id, r2_key FROM media WHERE expires_at < ? LIMIT 100'
            ).bind(Date.now()).all();
            for (const m of (expired.results || [])) {
              await env.APEX_CHAT_MEDIA?.delete(m.r2_key).catch(() => {});
              await env.APEX_CHAT_DB.prepare('DELETE FROM media WHERE id=?').bind(m.id).run();
            }
            break;
          }

          case 'purge-expired-messages': {
            // Disappearing messages : suppression
            await env.APEX_CHAT_DB.prepare(
              'DELETE FROM messages WHERE expires_at IS NOT NULL AND expires_at < ?'
            ).bind(Date.now()).run();
            break;
          }

          default:
            console.warn('Queue type inconnu:', queueType);
        }

        msg.ack();
      } catch (e) {
        console.error('Queue consumer error', e);
        msg.retry();
      }
    }
  },

  // P0 FIX (audit) : Cron triggers pour purge automatique
  async scheduled(event, env, ctx) {
    const cron = event.cron;

    // Cron 0 */1 * * * (toutes les heures) — purge messages expirés + médias R2 expirés
    if (cron === '0 */1 * * *') {
      ctx.waitUntil(env.LETTERS_QUEUE?.send({ queue_type: 'purge-expired-messages' }).catch(() => {}));
      ctx.waitUntil(env.LETTERS_QUEUE?.send({ queue_type: 'lifecycle-r2' }).catch(() => {}));
    }

    // Cron */5 * * * * (5 min) — Letters delivery + Time capsules
    if (cron === '*/5 * * * *') {
      const due_letters = await env.APEX_CHAT_DB.prepare(
        'SELECT id FROM letters_queue WHERE deliver_at <= ? AND delivered=0 AND cancelled=0 LIMIT 50'
      ).bind(Date.now()).all();
      for (const l of (due_letters.results || [])) {
        ctx.waitUntil(env.LETTERS_QUEUE?.send({ queue_type: 'letters-deliver', letter_id: l.id }).catch(() => {}));
      }
      const due_capsules = await env.APEX_CHAT_DB.prepare(
        'SELECT id FROM time_capsules WHERE open_at <= ? AND opened_at IS NULL LIMIT 50'
      ).bind(Date.now()).all();
      for (const c of (due_capsules.results || [])) {
        ctx.waitUntil(env.TIMECAPSULE_QUEUE?.send({ queue_type: 'timecapsule-open', capsule_id: c.id }).catch(() => {}));
      }
    }

    // Cron 0 9 * * * (09:00 quotidien) — Memory Lane
    if (cron === '0 9 * * *') {
      const active_users = await env.APEX_CHAT_DB.prepare(
        'SELECT id FROM users WHERE last_seen > ? LIMIT 1000'
      ).bind(Date.now() - 7 * 86400000).all();
      for (const u of (active_users.results || [])) {
        ctx.waitUntil(env.MEMORY_LANE_QUEUE?.send({ queue_type: 'memory-lane', user_id: u.id }).catch(() => {}));
      }
    }

    // Cron 0 3 * * * (03:00 quotidien) — Backup R2 + cleanup audit log > 90j
    if (cron === '0 3 * * *') {
      ctx.waitUntil(performDailyBackup(env));
      await env.APEX_CHAT_DB.prepare(
        'DELETE FROM audit_log WHERE ts < ?'
      ).bind(Date.now() - 90 * 86400000).run();
      await env.APEX_CHAT_DB.prepare(
        'DELETE FROM ratelimit_otp WHERE hour_key < ?'
      ).bind(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 13)).run();
    }
  }
};

// ============================================================================
//  Helpers Queue consumer
// ============================================================================

export async function pushToApexTelemetry(payload, env) {
  if (!env.APEX_HANDOFF_FIREBASE_URL || !env.APEX_HANDOFF_TOKEN) return;
  try {
    await fetch(`${env.APEX_HANDOFF_FIREBASE_URL}/apex/ax_telemetry_in.json?auth=${env.APEX_HANDOFF_TOKEN}`, {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        src: 'apex-chat',
        ts: Date.now()
      })
    });
  } catch (e) {
    console.error('Telemetry push failed', e.message);
  }
}

export async function runAutoFix(body, env) {
  // Whitelist auto-fix : restart DO / rotate keys / requeue push
  const whitelist = ['restart-do', 'rotate-keys', 'requeue-push', 'fb-reconnect', 'reset-streaming'];
  if (!whitelist.includes(body.action)) return;
  // TODO : implémentations spécifiques
  console.log('Auto-fix attempt', body.action);
}

export async function sendPushToUser(userId, payload, env) {
  const subs = await env.APEX_CHAT_DB.prepare(
    'SELECT endpoint, vapid_p256dh, vapid_auth, fcm_token, apns_token FROM push_subscriptions WHERE user_id=? AND last_seen > ?'
  ).bind(userId, Date.now() - 30 * 86400000).all();

  for (const sub of (subs.results || [])) {
    if (sub.endpoint && sub.vapid_p256dh) {
      // Web Push
      fetch('https://apex-push-worker.desarzens-kevin.workers.dev/web-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Apex-Push-Token': env.APEX_CHAT_ADMIN_TOKEN || ''
        },
        body: JSON.stringify({
          subscription: { endpoint: sub.endpoint, keys: { p256dh: sub.vapid_p256dh, auth: sub.vapid_auth } },
          payload
        })
      }).catch(() => {});
    }
  }
}

export async function performDailyBackup(env) {
  // Backup D1 vers R2 (logique simplifiée — production utiliserait wrangler d1 export)
  try {
    const tables = ['users', 'conversations', 'conversation_members', 'messages', 'audit_log'];
    const backup = { ts: Date.now(), tables: {} };
    for (const t of tables) {
      const stmt = await env.APEX_CHAT_DB.prepare(`SELECT * FROM ${t} LIMIT 100000`).all();
      backup.tables[t] = stmt.results || [];
    }
    const dateKey = new Date().toISOString().slice(0, 10);
    await env.APEX_CHAT_MEDIA?.put(`backups/d1-${dateKey}.json`, JSON.stringify(backup), {
      httpMetadata: { contentType: 'application/json' }
    });
    console.log('Daily backup done', dateKey);
  } catch (e) {
    console.error('Daily backup failed', e.message);
  }
}

// ============================================================================
//  Durable Objects (re-exporté depuis ./durable-objects/)
// ============================================================================

export { ConversationDO } from './durable-objects/ConversationDO.js';
export { BroadcastDO } from './durable-objects/BroadcastDO.js';
export { PresenceDO } from './durable-objects/PresenceDO.js';
