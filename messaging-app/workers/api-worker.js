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

async function handleVerifyOtp(request, env) {
  const { phone, name, pseudo, firebase_id_token } = await request.json();
  if (!phone || !pseudo || !firebase_id_token) return err('Champs manquants', 400);

  // TODO Phase 2 : vérifier firebase_id_token via Firebase Admin SDK ou public keys
  // Pour Phase 1 : on accepte l'idToken (à durcir Phase 2)

  const phoneHash = await sha256(phone);

  // User existe-t-il déjà ?
  let user = await env.APEX_CHAT_DB.prepare('SELECT * FROM users WHERE phone=?').bind(phone).first();

  if (!user) {
    // Vérifier pseudo unique
    const conflict = await env.APEX_CHAT_DB.prepare('SELECT id FROM users WHERE pseudo=? COLLATE NOCASE').bind(pseudo).first();
    if (conflict) return err('Pseudo déjà pris', 409, 'pseudo_taken');

    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(pseudo)) return err('Pseudo invalide (3-20 chars alphanum)', 400);

    const id = crypto.randomUUID();
    const isKevin = isKevinAdmin(name, phone);
    await env.APEX_CHAT_DB.prepare(
      `INSERT INTO users (id, pseudo, real_name, phone, phone_hash, is_admin, is_kevin_alias,
       identity_key_pub, pq_key_pub, prekey_signed, source, created_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', 'PENDING', 'PENDING', 'apex-chat-direct', ?, 'active')`
    ).bind(id, pseudo, name, phone, phoneHash, isKevin ? 1 : 0, isKevin ? 1 : 0, Date.now()).run();
    user = { id, pseudo, real_name: name, is_admin: isKevin ? 1 : 0 };
  }

  const jwt = await signJWT({
    sub: user.id,
    pseudo: user.pseudo,
    is_admin: !!user.is_admin,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 86400  // 30 jours
  }, env.JWT_SIGN_KEY);

  await auditLog(env, user.id, 'login', 'user', user.id, { method: 'sms-otp' }, phoneHash, request.headers.get('User-Agent'));

  return json({ ok: true, token: jwt, user: {
    id: user.id, pseudo: user.pseudo, is_admin: !!user.is_admin
  }});
}

async function handleSsoFromApex(request, env) {
  // Échange JWT Apex contre JWT Apex Chat
  const { apex_token, apex_uid, name } = await request.json();
  if (!apex_token || !apex_uid) return err('Token Apex manquant', 400);

  // TODO Phase 2 : vérifier apex_token via clé publique Apex
  // Pour Phase 1 : créer/récupérer user lié à apex_uid

  let user = await env.APEX_CHAT_DB.prepare('SELECT * FROM users WHERE apex_uid=?').bind(apex_uid).first();
  if (!user) {
    // Chercher par pseudo dérivé du nom
    const pseudo = (name || apex_uid).toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 20);
    const id = apex_uid;  // même UID que Apex
    const isKevin = isKevinAdmin(name);
    await env.APEX_CHAT_DB.prepare(
      `INSERT INTO users (id, pseudo, real_name, phone, phone_hash, is_admin, is_kevin_alias,
       identity_key_pub, pq_key_pub, prekey_signed, apex_uid, source, created_at, status)
       VALUES (?, ?, ?, 'PENDING_SSO', 'PENDING_SSO', ?, ?, 'PENDING', 'PENDING', 'PENDING', ?, 'apex-sso', ?, 'active')`
    ).bind(id, pseudo, name, isKevin ? 1 : 0, isKevin ? 1 : 0, apex_uid, Date.now()).run();
    user = { id, pseudo, real_name: name, is_admin: isKevin ? 1 : 0 };
  }

  const jwt = await signJWT({
    sub: user.id,
    pseudo: user.pseudo,
    is_admin: !!user.is_admin,
    sso: true,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 86400
  }, env.JWT_SIGN_KEY);

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
      result = await env.APEX_CHAT_DB.prepare(
        'SELECT id, conv_id, sender_id, ts, mime FROM messages WHERE ts > ? ORDER BY ts DESC LIMIT 100'
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

  async queue(batch, env) {
    // Consumer Cloudflare Queues (telemetry, letters, time-capsule, memory-lane)
    for (const msg of batch.messages) {
      try {
        // TODO Phase 9 : router selon msg.body.queue_type
        console.log('Queue msg', msg.body);
        msg.ack();
      } catch (e) {
        console.error('Queue error', e);
        msg.retry();
      }
    }
  },

  async scheduled(event, env, ctx) {
    // Cron triggers (lifecycle médias R2, time capsules cron, memory lane daily)
    // TODO Phase 7-9
  }
};

// ============================================================================
//  Durable Objects (re-exporté depuis ./durable-objects/)
// ============================================================================

export { ConversationDO } from './durable-objects/ConversationDO.js';
export { BroadcastDO } from './durable-objects/BroadcastDO.js';
export { PresenceDO } from './durable-objects/PresenceDO.js';
