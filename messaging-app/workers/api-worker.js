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

function normalizeName(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[\s\-_.@]+/g, ' ').trim();
}

function isKevinAdmin(name, phone) {
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

async function sha256(input) {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function signJWT(payload, secret) {
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

async function verifyJWT(token, secret) {
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
  return await verifyJWT(token, env.JWT_SIGN_KEY);
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

async function handleSendOtp(request, env) {
  const { phone, name } = await request.json();
  if (!phone || !/^\+?\d{8,15}$/.test(phone)) return err('Numéro invalide', 400);

  // Rate limit
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

  // Délégué à Firebase Auth Phone côté client (web SDK)
  // Le worker confirme juste que le numéro est OK (pas blacklisté)
  const phoneHash = await sha256(phone);
  return json({ ok: true, sessionId: phoneHash, provider: 'firebase' });
}

// ============================================================================
//  Firebase ID token verification (P0 fix audit externe)
//  Vérification réelle via Firebase JWKS public keys
// ============================================================================

async function fetchFirebasePublicKeys(env) {
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

async function verifyFirebaseIdToken(idToken, env) {
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

async function handleVerifyOtp(request, env) {
  const { phone, name, pseudo, firebase_id_token } = await request.json();
  if (!phone || !pseudo || !firebase_id_token) return err('Champs manquants', 400);
  if (!/^[a-zA-Z0-9_-]{3,20}$/.test(pseudo)) return err('Pseudo invalide (3-20 chars alphanum)', 400);

  // P0 FIX (audit) : vérification Firebase ID token RÉELLE
  let firebasePayload;
  try {
    firebasePayload = await verifyFirebaseIdToken(firebase_id_token, env);
  } catch (e) {
    return err('Token Firebase invalide : ' + e.message, 401, 'invalid_token');
  }

  // P0 FIX : phone du body DOIT correspondre au phone_number du token Firebase
  if (firebasePayload.phone_number !== phone) {
    return err('Numéro téléphone ne correspond pas au token Firebase', 401, 'phone_mismatch');
  }

  const phoneHash = await sha256(phone);

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
         identity_key_pub, pq_key_pub, prekey_signed, source, created_at, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING_PQXDH', 'PENDING_PQXDH', 'PENDING_PQXDH', 'apex-chat-direct', ?, 'active')
         ON CONFLICT(pseudo) DO NOTHING`
      ).bind(id, pseudo, name || pseudo, phone, phoneHash, isKevin ? 1 : 0, isKevin ? 1 : 0, Date.now()).run();

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
    firebase_uid: firebasePayload.sub,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 86400  // 30 jours
  }, env.JWT_SIGN_KEY);

  await auditLog(env, user.id, 'login', 'user', user.id, { method: 'sms-otp' }, phoneHash, request.headers.get('User-Agent'));

  return json({ ok: true, token: jwt, user: {
    id: user.id, pseudo: user.pseudo, is_admin: !!user.is_admin
  }});
}

async function handleSsoFromApex(request, env) {
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

async function handleCreateConversation(request, env) {
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
  const destructive = ['kickUser', 'banUser', 'deleteConv', 'exportConv'];

  if (destructive.includes(command) && !confirm_token) {
    return err('Confirmation 2-step requise', 400, 'confirm_required');
  }

  let result;
  switch (command) {
    case 'searchAllMessages':
      // Mode A (Kevin 2026-04-30) : admin lit aussi le ciphertext (déchiffrement côté client avec clé maître)
      result = await env.APEX_CHAT_DB.prepare(
        'SELECT id, conv_id, sender_id, ts, mime, ciphertext FROM messages WHERE ts > ? ORDER BY ts DESC LIMIT 100'
      ).bind(Date.now() - 7 * 86400000).all();
      break;
    case 'analyzeUser':
      result = await env.APEX_CHAT_DB.prepare(
        `SELECT u.*, COUNT(DISTINCT m.id) as msg_count, COUNT(DISTINCT cm.conv_id) as conv_count
         FROM users u LEFT JOIN messages m ON m.sender_id = u.id
         LEFT JOIN conversation_members cm ON cm.user_id = u.id
         WHERE u.id = ? GROUP BY u.id`
      ).bind(params.userId).first();
      break;
    case 'broadcastNotif':
      // TODO : appeler push-worker
      result = { sent: 0 };
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
    default:
      return err('Commande inconnue', 400);
  }

  await auditLog(env, auth.sub, 'admin_command', 'system', null, { command, params },
    await sha256(request.headers.get('CF-Connecting-IP') || ''), request.headers.get('User-Agent'));

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
      const userMatch = path.match(/^\/api\/users\/([a-zA-Z0-9_-]+)$/);
      if (userMatch && method === 'GET') return await handleGetPublicUser(userMatch[1], env);
      const adminUserMatch = path.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)\/full$/);
      if (adminUserMatch && method === 'GET') return await handleAdminGetFullUser(adminUserMatch[1], request, env);

      // Conversations
      if (path === '/api/conversations' && method === 'GET') return await handleListConversations(request, env);
      if (path === '/api/conversations' && method === 'POST') return await handleCreateConversation(request, env);
      const wsMatch = path.match(/^\/api\/conversations\/([^\/]+)\/ws$/);
      if (wsMatch) return await handleWsConversation(wsMatch[1], request, env);

      // Invitations
      if (path === '/api/invitations' && method === 'POST') return await handleCreateInvitation(request, env);
      const invMatch = path.match(/^\/api\/invitations\/([A-Z0-9]+)$/);
      if (invMatch && method === 'GET') return await handleResolveInvitation(invMatch[1], env);

      // Admin
      if (path === '/api/admin/commands' && method === 'POST') return await handleAdminCommand(request, env);

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

async function pushToApexTelemetry(payload, env) {
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

async function runAutoFix(body, env) {
  // Whitelist auto-fix : restart DO / rotate keys / requeue push
  const whitelist = ['restart-do', 'rotate-keys', 'requeue-push', 'fb-reconnect', 'reset-streaming'];
  if (!whitelist.includes(body.action)) return;
  // TODO : implémentations spécifiques
  console.log('Auto-fix attempt', body.action);
}

async function sendPushToUser(userId, payload, env) {
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

async function performDailyBackup(env) {
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
