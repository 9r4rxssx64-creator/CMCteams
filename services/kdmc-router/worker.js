/**
 * kdmc-router — Routeur de domaine personnalisé KDMC (kd-mc.com)
 * ----------------------------------------------------------------------------
 * 1) Reverse-proxy : chaque sous-domaine -> son app GitHub Pages.
 * 2) SSO transverse : /__sso/* (session unique signée, cookie .kd-mc.com).
 * 3) Admin domaine : /__admin/* (fiches clients enrichies + fonctions communes),
 *    réservé à la session admin (Kevin). Registre dans Cloudflare KV (ACCOUNTS),
 *    enrichi à chaque connexion (device + géo request.cf + horodatage). Fail-open.
 */

import { makeChallenge, parseRegistration, verifyAssertion, b64uEnc, b64uDec } from './webauthn.js';
import { mintShopsAdminIdToken } from './fb-token.js';

const UPSTREAM = 'https://9r4rxssx64-creator.github.io';
const PAGES_PREFIX = '/CMCteams';

const ROUTES = {
  'kd-mc.com': '/CMCteams/kdmc-home',
  'www.kd-mc.com': '/CMCteams/kdmc-home',
  'cmcteams.kd-mc.com': '/CMCteams',
  'apex-ai.kd-mc.com': '/CMCteams/apex-ai-v13',
  'apex-chat.kd-mc.com': '/CMCteams/messaging-app',
  'la-detente.kd-mc.com': '/CMCteams/la-detente',
  'chez-lolo.kd-mc.com': '/CMCteams/shops/chez-lolo',
  'dashboard.kd-mc.com': '/CMCteams/shops/dashboard',
  'sourcing.kd-mc.com': '/CMCteams/shops/sourcing',
  'coffre.kd-mc.com': '/CMCteams/coffre-fort',
  'departs.kd-mc.com': '/CMCteams/tools/departs',
  'cmcteams-light.kd-mc.com': '/CMCteams/tools/departs', // « CMCteams light » (Kevin 2026-07-01) — alias nommé de la page Départs (departs.kd-mc.com reste actif)
  'bot.kd-mc.com': '/CMCteams/tools/crypto-bot-dashboard', // Tableau de bord crypto-bot (Kevin 2026-07-03) — admin-gated via /__bot/*
  'beatbot.kd-mc.com': '/CMCteams/tools/poolrobot', // PoolPilot — app robot piscine Beatbot (Kevin 2026-07-05)
  'autorisations.kd-mc.com': '/CMCteams/tools/approvals', // Coffre d'autorisations — admin only (Kevin 2026-07-10)
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    // SSO transverse (session unique + CGU). Même origine par sous-domaine.
    if (url.pathname.startsWith('/__sso/')) return handleSso(request, url, env);
    // Admin domaine (fiches clients + fonctions communes). Réservé admin.
    if (url.pathname.startsWith('/__admin/')) return handleAdmin(request, url, env);
    // Coffre Finances : sauvegarde EN LIGNE chiffrée de bout en bout. Réservé admin
    // (même grant que /__admin). Le serveur ne stocke qu'un bloc illisible (AES-GCM
    // côté client) → même le worker/KV ne peut PAS lire. Cf. tools/finances/.
    if (url.pathname.startsWith('/__fin/')) return handleFin(request, url, env);
    if (url.pathname.startsWith('/__mail/')) return handleMail(request, url, env);
    // Crypto-bot Railway (statut + kill switch). Réservé admin (même grant que /__admin).
    if (url.pathname.startsWith('/__bot/')) return handleBot(request, url, env);
    // Relais Beatbot (contrôle réel du robot piscine) — admin-gated, HTTPS public only, même origine que l'app beatbot.kd-mc.com.
    if (url.pathname.startsWith('/__beatbot/')) return handleBeatbot(request, url, env);
    // Push « message CMCteams light » → Kevin même app fermée (token serveur, anti-spam KV).
    if (url.pathname === '/__notify-kevin' && request.method === 'POST') return handleNotifyKevin(request, env);

    const base = ROUTES[host];
    if (!base) return Response.redirect('https://kd-mc.com/', 302);

    // beatbot.kd-mc.com = ESPACE PRIVÉ ADMIN (Kevin) : session admin (Face ID/PIN) requise
    // pour VOIR l'app PoolPilot. Fail-open si le PIN admin n'est pas déployé (anti-lockout
    // au rollout — leçons #99/#100 ; le secret étant déployé, le gate est effectif).
    if (host === 'beatbot.kd-mc.com' && env && env.KDMC_ADMIN_PIN_SHA256) {
      const meB = await adminSession(request, env);
      if (!meB) return beatbotLock();
    }

    // autorisations.kd-mc.com = COFFRE D'AUTORISATIONS — RÉSERVÉ ADMIN (Kevin).
    // Session admin (Face ID/code, même grant que /__admin) requise pour VOIR l'app.
    // Fail-open si le PIN admin n'est pas déployé (anti-lockout au rollout — leçons #99/#100).
    if (host === 'autorisations.kd-mc.com' && env && env.KDMC_ADMIN_PIN_SHA256) {
      const meA = await adminSession(request, env);
      if (!meA) return approvalsLock();
    }

    let p = url.pathname;
    let upstreamPath;
    if (p === '/' || p === '') upstreamPath = base + '/';
    else if (p.startsWith(PAGES_PREFIX + '/')) upstreamPath = p;
    else upstreamPath = base + p;

    const upstreamUrl = UPSTREAM + upstreamPath + url.search;
    const reqHeaders = new Headers(request.headers);
    reqHeaders.delete('host');
    const upstreamReq = new Request(upstreamUrl, {
      method: request.method,
      headers: reqHeaders,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
    });
    let res = await fetch(upstreamReq);
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      if (loc) {
        const h = new Headers(res.headers);
        h.set('location', rewriteLocation(loc, base, host));
        return new Response(null, { status: res.status, headers: h });
      }
    }
    const outHeaders = new Headers(res.headers);
    outHeaders.delete('content-security-policy-report-only');
    outHeaders.set('x-kdmc-router', host);
    /* En-têtes sécurité (ajoutés seulement si l'upstream ne les pose pas) :
       nosniff + Referrer-Policy (renforce la confidentialité du pass #kdmc_sso=). */
    if (!outHeaders.has('x-content-type-options')) outHeaders.set('x-content-type-options', 'nosniff');
    if (!outHeaders.has('referrer-policy')) outHeaders.set('referrer-policy', 'strict-origin-when-cross-origin');
    /* Anti-clickjacking (équivaut à frame-ancestors 'self', impossible en <meta>) +
       HSTS (tous les sous-domaines kd-mc.com sont en HTTPS via Cloudflare). */
    if (!outHeaders.has('x-frame-options')) outHeaders.set('x-frame-options', 'SAMEORIGIN');
    if (!outHeaders.has('strict-transport-security')) outHeaders.set('strict-transport-security', 'max-age=31536000; includeSubDomains');
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: outHeaders });
  },
};

function rewriteLocation(loc, base, host) {
  /* FAIL-SECURE : on ne renvoie JAMAIS un Location vers un autre domaine que
     github.io (anti open-redirect) et jamais de Location avec CRLF (anti header
     injection). Tout cas douteux → racine de l'host courant. */
  try {
    let path = loc;
    if (/^https?:\/\//i.test(loc)) {
      const u = new URL(loc);
      if (!u.hostname.endsWith('github.io')) return 'https://' + host + '/';
      path = u.pathname + u.search + u.hash;
    }
    if (/[\r\n]/.test(path)) return 'https://' + host + '/';
    if (path.startsWith(base + '/')) path = path.slice(base.length);
    else if (path === base) path = '/';
    return 'https://' + host + path;
  } catch { return 'https://' + host + '/'; }
}

/* ===================== SSO transverse kd-mc.com ===================== */
const SSO_COOKIE = 'kdmc_sso';
const SSO_TTL = 30 * 24 * 3600;
/* Admins du domaine (peuvent voir les fiches clients). uid = slug prénom-nom. */
const ADMIN_UIDS = ['kdmc_admin', 'kevin-desarzens'];

function b64url(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlStr(str) { return b64url(new TextEncoder().encode(str)); }
function b64urlToStr(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return atob(s); }
async function ssoHmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg))));
}
async function sha256Hex(str) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function ssoSign(secret, uid, name, cgu, verified) {
  /* v=1 → identité FORTE (prouvée par passkey/Face ID). v=0 → faible (nom+code
     auto-asserté). Les apps ne doivent accorder de confiance qu'à v=1. */
  const p = b64urlStr(JSON.stringify({ u: uid, n: name, c: cgu ? 1 : 0, v: verified ? 1 : 0, iat: Date.now(), exp: Date.now() + SSO_TTL * 1000 }));
  return p + '.' + (await ssoHmac(secret, p));
}
async function ssoVerify(secret, token) {
  if (!token || token.indexOf('.') < 0) return null;
  const dot = token.indexOf('.'); const p = token.slice(0, dot); const sig = token.slice(dot + 1);
  const expect = await ssoHmac(secret, p);
  if (sig.length !== expect.length) return null;
  let diff = 0; for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expect.charCodeAt(i);
  if (diff !== 0) return null;
  let d; try { d = JSON.parse(b64urlToStr(p)); } catch { return null; }
  if (!d || !d.u || !d.exp || d.exp < Date.now()) return null;
  return { uid: d.u, name: d.n || '', cgu: d.c === 1, verified: d.v === 1, iat: d.iat || 0 };
}
/* Révocation à distance (« Déconnecter partout ») : un token émis AVANT
   acc.revoked_at est refusé. Le user peut se RE-connecter (nouveau token,
   iat > revoked_at) — on tue les sessions perdues/volées, jamais le compte. */
function revoked(acc, s) { return !!(acc && acc.revoked_at && (s.iat || 0) < acc.revoked_at); }
function ssoCookie(request, name) {
  const c = request.headers.get('cookie') || '';
  const m = c.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : '';
}
/* Source du pass de session : header Authorization Bearer EN PRIORITÉ (marche
   même avec les PWA installées sur iOS, où chaque app a un jar de cookies isolé),
   sinon le cookie (Safari même-origine). Rend le compte unique iPhone-proof. */
function ssoToken(request) {
  const auth = request.headers.get('authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (m) return m[1].trim();
  return ssoCookie(request, SSO_COOKIE);
}
function J(o, setCookie, status) {
  return new Response(JSON.stringify(o), {
    status: status || 200,
    headers: Object.assign({ 'content-type': 'application/json', 'cache-control': 'no-store', 'x-kdmc-sso': '1', 'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin' }, setCookie ? { 'set-cookie': setCookie } : {}),
  });
}

/* Garde anti-rejeu WebAuthn : deny-list des challenges DÉJÀ consommés (KV).
   - 1ʳᵉ utilisation d'un challenge → 'fresh' (jamais bloquée : anti-lockout absolu).
   - rejeu du même challenge → 'replay' (refusé).
   - KV absent / erreur / pas de challenge → 'skip' (fail-open, comportement actuel).
   Complète le TTL HMAC 2 min : un (challenge, assertion) capté ne peut être rejoué. */
async function challengeConsume(env, clientDataJSONB64) {
  if (!env || !env.ACCOUNTS) return 'skip';
  try {
    const cd = JSON.parse(new TextDecoder().decode(b64uDec(clientDataJSONB64)));
    const ch = cd && cd.challenge;
    if (!ch) return 'skip';
    const key = 'chx:' + (await sha256Hex(ch));
    if (await env.ACCOUNTS.get(key)) return 'replay';
    await env.ACCOUNTS.put(key, '1', { expirationTtl: 300 });
    return 'fresh';
  } catch { return 'skip'; }
}

/* ---- Rate-limit serveur du code admin (anti brute-force du PIN 6 chiffres) ----
   Compteur d'échecs par IP (hashée) en KV, lockout progressif. Fail-open : si KV
   absent/KO, on n'enferme jamais l'admin légitime (la sécurité repose alors sur le
   hash du PIN seul). TTL KV 24h = auto-nettoyage. */
const RL_STEPS = { 5: 30e3, 6: 120e3, 7: 600e3, 8: 3600e3, 9: 86400e3 };
async function rlGet(env, ipHash) {
  if (!env || !env.ACCOUNTS) return null;
  try { return JSON.parse((await env.ACCOUNTS.get('al:' + ipHash)) || 'null'); } catch { return null; }
}
async function rlBlocked(env, ipHash) {
  const rec = await rlGet(env, ipHash);
  if (rec && rec.until && rec.until > Date.now()) return Math.ceil((rec.until - Date.now()) / 1000);
  return 0;
}
async function rlFail(env, ipHash) {
  if (!env || !env.ACCOUNTS) return;
  try {
    const rec = (await rlGet(env, ipHash)) || { fails: 0 };
    rec.fails = (rec.fails || 0) + 1;
    rec.until = rec.fails >= 5 ? Date.now() + (RL_STEPS[Math.min(rec.fails, 9)] || 86400e3) : 0;
    await env.ACCOUNTS.put('al:' + ipHash, JSON.stringify(rec), { expirationTtl: 86400 });
  } catch { /* fail-open */ }
}
async function rlReset(env, ipHash) {
  if (!env || !env.ACCOUNTS || !env.ACCOUNTS.delete) return;
  try { await env.ACCOUNTS.delete('al:' + ipHash); } catch { /* fail-open */ }
}

/* Registre des fiches clients (Cloudflare KV ACCOUNTS). Fail-open si absent. */
async function accGet(env, uid) {
  if (!env || !env.ACCOUNTS) return null;
  try { return JSON.parse((await env.ACCOUNTS.get('acc:' + uid)) || 'null'); } catch { return null; }
}
async function accPut(env, acc, knownExisting) {
  if (!env || !env.ACCOUNTS || !acc || !acc.uid) return;
  try {
    await env.ACCOUNTS.put('acc:' + acc.uid, JSON.stringify(acc));
    if (knownExisting) return; /* fiche déjà indexée → pas de relecture idx (chemin chaud) */
    const idx = JSON.parse((await env.ACCOUNTS.get('idx:uids')) || '[]');
    if (idx.indexOf(acc.uid) < 0) { idx.push(acc.uid); await env.ACCOUNTS.put('idx:uids', JSON.stringify(idx.slice(-5000))); }
  } catch { /* fail-open */ }
}
/* Alerte push « nouvel appareil » vers l'iPhone de Kevin, via le worker de push
   existant (POST /send-all, Bearer). OPT-IN par config : sans KDMC_PUSH_URL +
   KDMC_PUSH_TOKEN, on ne fait RIEN (le journal admin reste la trace = repli).
   Fail-open total : timeout 2 s, jamais d'exception propagée, ne bloque jamais
   la connexion. Corps volontairement générique (pas de donnée sensible). */
async function notifyPush(env, title, body, opts) {
  const url = env && env.KDMC_PUSH_URL, tok = env && env.KDMC_PUSH_TOKEN;
  if (!url || !tok) return; /* non configuré → repli = journal admin */
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 2000);
    await fetch(url.replace(/\/$/, '') + '/send-all', {
      method: 'POST', signal: ctrl.signal,
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + tok },
      body: JSON.stringify({ payload: { title, body, tag: (opts && opts.tag) || 'kdmc-new-device', url: (opts && opts.url) || 'https://kd-mc.com/admin/' } }),
    }).catch(() => {});
    clearTimeout(to);
  } catch { /* fail-open : jamais d'échec de connexion à cause d'une notif */ }
}
/* Push « nouveau message CMCteams light » → iPhone de Kevin même app fermée, via le
   worker de push existant (token gardé SERVEUR, jamais exposé à la page). Appelé par la
   page CMCteams light quand un employé écrit. Anti-spam : throttle KV 12 s. Fail-open.
   Corps générique + tronqué (pas de donnée sensible au-delà du prénom + court aperçu). */
async function handleNotifyKevin(request, env) {
  const J = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: { 'content-type': 'application/json' } });
  try {
    const host = (request.headers.get('host') || '').toLowerCase().replace(/:.*$/, '');
    if (!ROUTES[host]) return J({ ok: false, reason: 'bad_host' }, 403);
    let b = {}; try { b = await request.json(); } catch { /* corps vide */ }
    const name = String((b && b.name) || '').slice(0, 60).replace(/[\r\n]+/g, ' ').trim() || 'Employé';
    const text = String((b && b.text) || '').slice(0, 140).replace(/[\r\n]+/g, ' ').trim();
    if (!text) return J({ ok: true, skipped: 'empty' });
    if (env && env.ACCOUNTS) {
      try {
        const last = parseInt((await env.ACCOUNTS.get('push:kevin_last')) || '0', 10) || 0;
        if (Date.now() - last < 12000) return J({ ok: true, throttled: true });
        await env.ACCOUNTS.put('push:kevin_last', String(Date.now()));
      } catch { /* fail-open */ }
    }
    await notifyPush(env, '💬 ' + name, text, { tag: 'cmc-msg', url: 'https://cmcteams.kd-mc.com/' });
    return J({ ok: true });
  } catch { return J({ ok: false }, 200); }
}
/* Journal d'audit ADMIN (KV, FIFO 200) : trace les événements sensibles —
   connexions admin (ok/échec), déconnexions forcées, nouveaux appareils, mints
   Firebase. L'action la plus sensible du domaine doit laisser une trace. Fail-open. */
async function audLog(env, entry) {
  if (!env || !env.ACCOUNTS) return;
  try {
    const log = JSON.parse((await env.ACCOUNTS.get('aud:log')) || '[]');
    log.unshift(Object.assign({ ts: Date.now() }, entry));
    await env.ACCOUNTS.put('aud:log', JSON.stringify(log.slice(0, 200)));
  } catch { /* fail-open */ }
}
/* Enrichit (ou crée) la fiche à chaque connexion : MAX de renseignements. */
async function enrich(env, request, uid, name, cgu, pre) {
  if (!env || !env.ACCOUNTS) return;
  const cf = request.cf || {};
  const ipHash = await sha256Hex((request.headers.get('CF-Connecting-IP') || '') + '|kdmc');
  const ua = request.headers.get('user-agent') || '';
  const device = /mobile|iphone|android/i.test(ua) ? 'mobile' : 'desktop';
  const os = /iphone|ipad|ios/i.test(ua) ? 'iOS' : /android/i.test(ua) ? 'Android' : /mac/i.test(ua) ? 'macOS' : /windows/i.test(ua) ? 'Windows' : /linux/i.test(ua) ? 'Linux' : '';
  const place = [cf.city, cf.region, cf.country].filter(Boolean).join(', ');
  const now = Date.now();
  const rawHost = (request.headers.get('host') || '').toLowerCase().replace(/:.*$/, '');
  /* Whitelist ROUTES : un en-tête Host forgé ne crée JAMAIS de clé apps/history
     parasite (la map apps reste bornée aux vrais sous-domaines du domaine). */
  const host = ROUTES[rawHost] ? rawHost : '';
  /* `pre` = fiche préchargée par l'appelant (whoami la lit déjà pour la révocation)
     → évite une 2e lecture KV sur le chemin chaud. undefined = on lit nous-même. */
  const prev = pre !== undefined ? pre : await accGet(env, uid);
  const isNew = !prev;
  const acc = prev || { uid, name, created: now, cgu_at: 0, hits: 0, devices: [], places: [], apps: {}, history: [] };
  const prevSeen = acc.last_seen || 0;
  const prevCountry = acc.last_country || '';
  /* `structural` = quelque chose de NOUVEAU à persister tout de suite (nouvelle fiche,
     CGU, nouvel appareil/lieu, nouvelle session). Un simple heartbeat n'en est pas un. */
  let structural = isNew;
  if (name && name !== acc.name) { acc.name = name; structural = true; }
  if (cgu && !acc.cgu_at) { acc.cgu_at = now; structural = true; }
  acc.last_seen = now;
  acc.last_ip_hash = ipHash;
  acc.last_place = place;
  acc.last_device = device + (os ? ' · ' + os : '');
  acc.last_app = host || acc.last_app || '';
  const devKey = device + (os ? '·' + os : '');
  const newDevice = (acc.devices || []).indexOf(devKey) < 0;
  if (newDevice) structural = true;
  acc.devices = Array.from(new Set([...(acc.devices || []), devKey])).slice(-10);
  if (place && (acc.places || []).indexOf(place) < 0) structural = true;
  if (place) acc.places = Array.from(new Set([...(acc.places || []), place])).slice(-20);
  /* Détection d'anomalie SIMPLE (pas de ML) : changement de PAYS entre deux
     connexions rapprochées (< 60 min) = déplacement géographiquement impossible
     (compte partagé/volé, ou VPN). On FLAGUE (jamais on ne bloque : anti-lockout ;
     un VPN reste légitime). Le drapeau est affiché en admin + poussé en alerte. */
  const curCountry = cf.country || '';
  const geoAnomaly = !isNew && curCountry && prevCountry && curCountry !== prevCountry && (now - prevSeen) < 60 * 60e3;
  if (geoAnomaly) { acc.anomaly = { at: now, from: prevCountry, to: curCountry, place: place, mins: Math.round((now - prevSeen) / 60e3) }; structural = true; }
  if (curCountry) acc.last_country = curCountry;
  /* Historique de connexions PAR SITE, avec DURÉE. Une "connexion" = une session :
     début à la 1re activité, PROLONGÉE par les pings de présence tant que l'app
     reste ouverte, TERMINÉE dès ~3 min sans ping (= app fermée). Durée = end - ts.
     Les pings ne créent PAS de doublon (ils prolongent la session en cours).
     hits = nombre de vraies sessions. */
  const SESSION_GAP = 3 * 60e3;
  acc.apps = acc.apps || {};
  acc.history = acc.history || [];
  if (host) {
    const a = acc.apps[host] || { first: now, last: 0, sessions: 0 };
    const cont = a.sessions > 0 && (now - (a.last || 0)) <= SESSION_GAP; /* session encore en cours ? */
    a.last = now;
    let cur = null; /* la session la plus récente pour CE site */
    for (let i = 0; i < acc.history.length; i++) { if (acc.history[i].app === host) { cur = acc.history[i]; break; } }
    if (cont && cur) {
      cur.end = now; /* prolonge la session ouverte → la durée grandit */
    } else {
      a.sessions = (a.sessions || 0) + 1;
      acc.hits = (acc.hits || 0) + 1;
      acc.history.unshift({ ts: now, end: now, app: host, device: devKey, place: place });
      if (acc.history.length > 80) acc.history = acc.history.slice(0, 80);
      structural = true;
    }
    acc.apps[host] = a;
  } else if (!acc.hits) {
    acc.hits = 1;
  }
  /* THROTTLE écritures KV (quota free = 1000 writes/jour, partagé compte) : un
     heartbeat qui ne change rien de structurel n'écrit que si last_seen stocké a
     plus de 2 min. Présence « en ligne < 5 min » intacte (écriture ≤ toutes les
     2 min) ; SESSION_GAP 3 min intact (2 min < 3 min). Précision durée : ±2 min. */
  if (!structural && now - prevSeen < 120e3) return;
  /* Nouvel appareil sur une fiche EXISTANTE → trace dans le journal admin
     (signal fort avec si peu d'utilisateurs) + alerte push si configurée. */
  if (newDevice && !isNew) {
    await audLog(env, { ev: 'new_device', uid, detail: devKey + (place ? ' · ' + place : '') });
    await notifyPush(env, '🔐 KDMC — nouvel appareil',
      'Nouvelle connexion (' + (acc.name || uid) + ') depuis ' + devKey + (place ? ' · ' + place : '') + '.');
  }
  if (geoAnomaly) {
    await audLog(env, { ev: 'geo_anomaly', uid, detail: prevCountry + ' → ' + curCountry + ' en ' + acc.anomaly.mins + ' min' });
    await notifyPush(env, '⚠️ KDMC — connexion suspecte',
      (acc.name || uid) + ' : ' + prevCountry + ' → ' + curCountry + ' en ' + acc.anomaly.mins + ' min (déplacement impossible).');
  }
  await accPut(env, acc, !isNew);
}

async function handleSso(request, url, env) {
  const secret = env && env.KDMC_SSO_SECRET;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (!secret) return J({ ok: false, reason: 'sso_not_configured' });
  const path = url.pathname;
  if (path === '/__sso/whoami' && request.method === 'GET') {
    const s = await ssoVerify(secret, ssoToken(request));
    /* SÉCU (leçon #99) : admin EXIGE une identité FORTE (verified = Face ID prouvé).
       Un uid admin auto-déclaré via /__sso/issue reste verified:false → admin:false. */
    if (s) {
      const acc = await accGet(env, s.uid);
      /* Révocation à distance : token émis avant « Déconnecter partout » → refusé. */
      if (revoked(acc, s)) return J({ ok: false, reason: 'session_revoquee' });
      await enrich(env, request, s.uid, s.name, s.cgu, acc);
      return J({ ok: true, uid: s.uid, name: s.name, cgu: s.cgu, verified: !!s.verified, admin: ADMIN_UIDS.indexOf(s.uid) >= 0 && !!s.verified });
    }
    return J({ ok: false });
  }

  /* ===== WebAuthn (passkey / Face ID) — fait du domaine un IdP à identité FORTE ===== */
  /* rpId/origins surchargés par env UNIQUEMENT pour les tests (localhost) ;
     en prod aucune de ces vars n'est posée → valeurs kd-mc.com. */
  const RP_ID = (env && env.KDMC_RP_ID) || 'kd-mc.com';
  const RP_ORIGINS = (env && env.KDMC_RP_ORIGINS) ? env.KDMC_RP_ORIGINS.split(',') : ['https://kd-mc.com', 'https://www.kd-mc.com'];
  if (path === '/__sso/webauthn/register/options' && request.method === 'POST') {
    const s = await ssoVerify(secret, ssoToken(request));
    if (!s) return J({ ok: false, reason: 'session requise' });
    if (revoked(await accGet(env, s.uid), s)) return J({ ok: false, reason: 'session révoquée — reconnecte-toi' });
    const challenge = await makeChallenge(secret, 'reg');
    return J({ ok: true, challenge, rp: { id: RP_ID, name: 'KDMC APEX' }, user: { id: b64uEnc(new TextEncoder().encode(s.uid)), name: s.name || s.uid, displayName: s.name || s.uid }, pubKeyCredParams: [{ type: 'public-key', alg: -7 }] });
  }
  if (path === '/__sso/webauthn/register/verify' && request.method === 'POST') {
    const s = await ssoVerify(secret, ssoToken(request));
    if (!s) return J({ ok: false, reason: 'session requise' });
    if (revoked(await accGet(env, s.uid), s)) return J({ ok: false, reason: 'session révoquée — reconnecte-toi' });
    let b = {}; try { b = await request.json(); } catch { /* ignore */ }
    let reg;
    try { reg = await parseRegistration(secret, b.attestationObject, b.clientDataJSON); }
    catch (e) { return J({ ok: false, reason: String((e && e.message) || e).slice(0, 120) }); }
    if (!RP_ORIGINS.includes(reg.origin)) return J({ ok: false, reason: 'origin non autorisée' });
    if ((await challengeConsume(env, b.clientDataJSON)) === 'replay') return J({ ok: false, reason: 'challenge déjà utilisé (rejeu)' });
    if (env && env.ACCOUNTS) {
      const list = JSON.parse((await env.ACCOUNTS.get('pk:' + s.uid)) || '[]');
      const already = list.some((k) => k.credId === reg.credId);
      /* SÉCU (leçon #99) : l'identité SSO est AUTO-DÉCLARÉE. Interdit de GREFFER un
         passkey sur un UID ADMIN dont la liste est déjà NON VIDE depuis une session
         non-vérifiée — sinon un inconnu déclarant "kevin-desarzens" au portail
         pourrait enrôler SON Face ID sur le compte admin. Bootstrap (liste vide) OK ;
         une session déjà vérifiée OU une preuve du code admin (grant /__admin/login)
         autorise l'ajout d'un nouvel appareil → Kevin n'est JAMAIS bloqué (il connaît
         le PIN admin). Les comptes non-admin (Laurence, etc.) restent multi-appareils. */
      const isAdminUid = ADMIN_UIDS.indexOf(s.uid) >= 0;
      if (isAdminUid && list.length > 0 && !already && !s.verified) {
        const g = await ssoVerify(secret, adminGrantTok(request));
        if (!(g && g.uid === '__kdmc_admin__')) {
          return J({ ok: false, reason: 'compte admin protégé — prouve le code admin (/__admin/login) pour ajouter un appareil' });
        }
      }
      if (!already) list.push({ credId: reg.credId, jwk: reg.jwk, created: Date.now() });
      await env.ACCOUNTS.put('pk:' + s.uid, JSON.stringify(list.slice(-10)));
      const acc = await accGet(env, s.uid);
      if (acc) { acc.passkey = true; acc.passkey_at = acc.passkey_at || Date.now(); await accPut(env, acc); }
    }
    /* Émet immédiatement une session FORTE (verified) — l'enrôlement prouve Face ID. */
    await enrich(env, request, s.uid, s.name, s.cgu);
    const token = await ssoSign(secret, s.uid, s.name, s.cgu, true);
    const cookie = `${SSO_COOKIE}=${token}; Domain=.kd-mc.com; Path=/; Max-Age=${SSO_TTL}; Secure; HttpOnly; SameSite=Lax`;
    return J({ ok: true, verified: true, token }, cookie);
  }
  if (path === '/__sso/webauthn/auth/options' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch { /* ignore */ }
    const uid = String(b.uid || '').slice(0, 80).trim();
    let allow = [];
    if (env && env.ACCOUNTS && uid) {
      const list = JSON.parse((await env.ACCOUNTS.get('pk:' + uid)) || '[]');
      allow = list.map((k) => ({ type: 'public-key', id: k.credId }));
    }
    const challenge = await makeChallenge(secret, 'auth');
    return J({ ok: true, challenge, rpId: RP_ID, allowCredentials: allow });
  }
  if (path === '/__sso/webauthn/auth/verify' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch { /* ignore */ }
    const uid = String(b.uid || '').slice(0, 80).trim();
    const credId = String(b.credId || '');
    if (!uid || !credId) return J({ ok: false, reason: 'uid+credId requis' });
    const list = (env && env.ACCOUNTS) ? JSON.parse((await env.ACCOUNTS.get('pk:' + uid)) || '[]') : [];
    const rec = list.find((k) => k.credId === credId);
    if (!rec) return J({ ok: false, reason: 'passkey inconnu' });
    const r = await verifyAssertion(secret, rec.jwk, { clientDataJSON: b.clientDataJSON, authenticatorData: b.authenticatorData, signature: b.signature }, { origins: RP_ORIGINS, rpId: RP_ID });
    if (!r.ok) return J({ ok: false, reason: r.reason });
    if ((await challengeConsume(env, b.clientDataJSON)) === 'replay') return J({ ok: false, reason: 'challenge déjà utilisé (rejeu)' });
    /* Détection de clone par compteur de signature : on ne rejette QUE si le compteur
       régresse alors que les deux valeurs sont > 0 (no-op pour les passkeys Apple/Google
       synchronisés, qui restent à 0 — jamais de faux rejet, jamais de lockout). */
    if (env && env.ACCOUNTS) {
      if (r.count > 0 && (rec.count || 0) > 0 && r.count <= rec.count) return J({ ok: false, reason: 'compteur de signature régressé (clone suspecté)' });
      if ((r.count || 0) > (rec.count || 0)) { rec.count = r.count; try { await env.ACCOUNTS.put('pk:' + uid, JSON.stringify(list)); } catch { /* fail-open */ } }
    }
    const acc = await accGet(env, uid);
    const name = (acc && acc.name) || uid;
    await enrich(env, request, uid, name, true);
    const token = await ssoSign(secret, uid, name, true, true);
    const cookie = `${SSO_COOKIE}=${token}; Domain=.kd-mc.com; Path=/; Max-Age=${SSO_TTL}; Secure; HttpOnly; SameSite=Lax`;
    return J({ ok: true, uid, name, verified: true, token }, cookie);
  }
  if (path === '/__sso/issue' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch { /* ignore */ }
    const uid = String(b.uid || '').slice(0, 80).trim();
    const name = String(b.name || '').slice(0, 80).trim();
    const cgu = !!b.cgu;
    if (!uid || !name) return J({ ok: false, reason: 'uid+name requis' });
    await enrich(env, request, uid, name, cgu);
    const token = await ssoSign(secret, uid, name, cgu);
    const cookie = `${SSO_COOKIE}=${token}; Domain=.kd-mc.com; Path=/; Max-Age=${SSO_TTL}; Secure; HttpOnly; SameSite=Lax`;
    /* token renvoyé dans le corps : le portail le met dans le lien de retour
       (#kdmc_sso=) pour les apps installées (où le cookie ne traverse pas). */
    /* /issue = identité AUTO-DÉCLARÉE (aucune preuve) → jamais admin/verified ici.
       L'admin ne s'obtient que par un passkey Face ID vérifié (auth/verify). */
    return J({ ok: true, uid, name, cgu, token, admin: false }, cookie);
  }
  if (path === '/__sso/logout' && request.method === 'POST') {
    return J({ ok: true }, `${SSO_COOKIE}=; Domain=.kd-mc.com; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax`);
  }

  /* ===== Self-service utilisateur : chacun ne voit/gère QUE SES données =====
     (uid pris dans SON token vérifié — jamais un paramètre → aucun accès croisé). */

  /* Mes appareils (passkeys Face ID) : liste. Session requise. */
  if (path === '/__sso/passkeys' && request.method === 'GET') {
    const s = await ssoVerify(secret, ssoToken(request));
    if (!s) return J({ ok: false, reason: 'session requise' });
    if (revoked(await accGet(env, s.uid), s)) return J({ ok: false, reason: 'session_revoquee' });
    let list = [];
    if (env && env.ACCOUNTS) { try { list = JSON.parse((await env.ACCOUNTS.get('pk:' + s.uid)) || '[]'); } catch { /* fail-open */ } }
    /* On ne renvoie JAMAIS la clé publique/jwk — juste un aperçu non sensible. */
    const items = list.map((k) => ({ id: String(k.credId || '').slice(0, 12), created: k.created || 0 }));
    return J({ ok: true, passkeys: items, count: items.length });
  }
  /* Supprimer un de MES appareils. Session VÉRIFIÉE requise (tu as prouvé Face ID
     cette session) → un token faible volé ne peut pas retirer tes passkeys.
     Pas de lockout : sans passkey, le login retombe sur nom+code (fail-open). */
  if (path === '/__sso/passkeys/delete' && request.method === 'POST') {
    const s = await ssoVerify(secret, ssoToken(request));
    if (!s) return J({ ok: false, reason: 'session requise' });
    if (!s.verified) return J({ ok: false, reason: 'Face ID requis pour gérer tes appareils' });
    if (revoked(await accGet(env, s.uid), s)) return J({ ok: false, reason: 'session_revoquee' });
    let b = {}; try { b = await request.json(); } catch { /* ignore */ }
    const id = String(b.id || b.credId || '').trim();
    if (!id || !env || !env.ACCOUNTS) return J({ ok: false, reason: 'id requis' });
    let list = []; try { list = JSON.parse((await env.ACCOUNTS.get('pk:' + s.uid)) || '[]'); } catch { /* */ }
    const next = list.filter((k) => String(k.credId || '').slice(0, 12) !== id && k.credId !== id);
    await env.ACCOUNTS.put('pk:' + s.uid, JSON.stringify(next));
    if (next.length === 0) { const acc = await accGet(env, s.uid); if (acc && acc.passkey) { acc.passkey = false; await accPut(env, acc, true); } }
    return J({ ok: true, removed: list.length - next.length, remaining: next.length });
  }
  /* Mon historique de connexions (le mien uniquement). Session requise. */
  if (path === '/__sso/me/history' && request.method === 'GET') {
    const s = await ssoVerify(secret, ssoToken(request));
    if (!s) return J({ ok: false, reason: 'session requise' });
    const acc = await accGet(env, s.uid);
    if (revoked(acc, s)) return J({ ok: false, reason: 'session_revoquee' });
    return J({
      ok: true, uid: s.uid, name: s.name,
      hits: (acc && acc.hits) || 0,
      devices: (acc && acc.devices) || [],
      apps: (acc && acc.apps) || {},
      history: (acc && acc.history) || [],
    });
  }
  /* « Déconnecter mes AUTRES appareils » : je révoque mes sessions puis on émet un
     token frais pour CE device (il reste connecté) → les autres tombent. */
  if (path === '/__sso/me/revoke' && request.method === 'POST') {
    const s = await ssoVerify(secret, ssoToken(request));
    if (!s) return J({ ok: false, reason: 'session requise' });
    const acc = (await accGet(env, s.uid)) || { uid: s.uid, name: s.name };
    if (revoked(acc, s)) return J({ ok: false, reason: 'session_revoquee' });
    acc.revoked_at = Date.now();
    await accPut(env, acc, true);
    /* token frais pour CE device (iat >= revoked_at → survit ; les autres non) */
    const token = await ssoSign(secret, s.uid, s.name, s.cgu, s.verified);
    const cookie = `${SSO_COOKIE}=${token}; Domain=.kd-mc.com; Path=/; Max-Age=${SSO_TTL}; Secure; HttpOnly; SameSite=Lax`;
    return J({ ok: true, token, revoked_at: acc.revoked_at }, cookie);
  }
  return J({ ok: false, reason: 'not_found' });
}

/* ===================== Admin domaine (fiches clients) ===================== */
/* SÉCU : l'identité SSO est AUTO-ASSERTÉE (n'importe qui peut taper le nom
   "Kevin Desarzens" au portail). On NE peut donc PAS accorder l'accès admin
   (fiches clients) sur la seule base du nom. Quand un hash de code admin est
   configuré (env.KDMC_ADMIN_PIN_SHA256 = sha256 du PIN admin), l'accès /__admin/*
   exige un GRANT signé, obtenu en prouvant le code via /__admin/login. Le grant
   voyage en cookie HttpOnly (Safari) ET en header x-kdmc-admin (PWA iOS isolées).
   Fail-open vers l'ancien contrôle par nom UNIQUEMENT si le hash n'est pas encore
   déployé (évite tout verrouillage pendant le rollout). */
function adminGrantTok(request) {
  const h = request.headers.get('x-kdmc-admin') || '';
  const m = h.match(/^(?:Bearer\s+)?(.+)$/i);
  if (m && m[1].trim()) return m[1].trim();
  return ssoCookie(request, 'kdmc_admin');
}
async function adminSession(request, env) {
  const secret = env && env.KDMC_SSO_SECRET;
  if (!secret) return null;
  const adminHash = env && env.KDMC_ADMIN_PIN_SHA256;
  /* FAIL-CLOSED (leçons #98/#99) : l'identité SSO est AUTO-ASSERTÉE (n'importe qui
     peut taper le nom "Kevin Desarzens"). Le nom seul ne donne donc JAMAIS l'accès
     admin. Sans hash de PIN configuré → aucun accès (au lieu de l'ancien fail-open
     par nom). Le hash est déployé en prod ; un déploiement sans hash FERME l'admin
     plutôt que de l'ouvrir. L'accès exige un GRANT signé prouvé via /__admin/login. */
  if (!adminHash) return null;
  /* 1) GRANT prouvé par le CODE admin (/__admin/login) — cookie kdmc_admin ou header x-kdmc-admin. */
  const g = await ssoVerify(secret, adminGrantTok(request));
  if (g && g.uid === '__kdmc_admin__') return { uid: '__kdmc_admin__', name: 'Admin', grant: true };
  /* 2) Session SSO FORTE (Face ID = verified) d'un UID ADMIN connu. Une session verified
     n'est émise QUE par le flux WebAuthn (passkey), et un passkey ne peut être GREFFÉ sur
     un uid admin qu'après bootstrap + preuve du code pour tout appareil suivant (voir
     enrôlement, leçon #99) → « verified + uid∈ADMIN_UIDS » = Kevin, même confiance que
     whoami admin:true. Jeton via header x-kdmc-sso (PWA iOS = cookies isolés) OU cookie
     kdmc_sso (Safari). Permet le Face ID sur bot.kd-mc.com sans retaper le code. */
  const ssoRaw = (request.headers.get('x-kdmc-sso') || '').replace(/^Bearer\s+/i, '').trim() || ssoCookie(request, SSO_COOKIE);
  if (ssoRaw) {
    const s = await ssoVerify(secret, ssoRaw);
    if (s && s.verified && ADMIN_UIDS.indexOf(s.uid) >= 0) return { uid: s.uid, name: s.name, faceid: true };
  }
  return null;
}
async function handleAdmin(request, url, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  const secret = env && env.KDMC_SSO_SECRET;
  const path = url.pathname;
  /* Login admin (preuve du code) — AVANT le gate, sinon poule-œuf. */
  if (path === '/__admin/login' && request.method === 'POST') {
    const adminHash = env && env.KDMC_ADMIN_PIN_SHA256;
    if (!secret || !adminHash) return J({ ok: false, reason: 'admin_pin_not_configured' });
    const ipHash = await sha256Hex((request.headers.get('CF-Connecting-IP') || '') + '|kdmc-al');
    const wait = await rlBlocked(env, ipHash);
    if (wait) return J({ ok: false, reason: 'rate_limited', wait });
    let b = {}; try { b = await request.json(); } catch { /* ignore */ }
    const code = String(b.code || '').trim();
    /* Accepte le CODE (sha256(code)===secret) OU directement le HASH (=== secret).
       Le hash est déjà l'équivalent porteur du PIN dans ce système (header x-apex-pin,
       leçon #95) : il déverrouille déjà l'IA (capacité plus sensible), donc l'accepter
       pour émettre le grant mail/sauvegarde n'ouvre aucune faille — et un hash 64-hex est
       plus dur à forcer qu'un PIN à 6 chiffres. → une app qui a déjà le hash (Finances)
       obtient le grant SANS redemander le code (« à la connexion ensuite plus besoin »). */
    const hash = String(b.hash || '').trim().toLowerCase();
    if (!code && !hash) return J({ ok: false, reason: 'code_requis' });
    const okHash = !!hash && hash === String(adminHash).toLowerCase();
    const okCode = !!code && (await sha256Hex(code)) === adminHash;
    if (!okHash && !okCode) { await rlFail(env, ipHash); await audLog(env, { ev: 'admin_login_fail', ip: ipHash.slice(0, 12) }); return J({ ok: false, reason: 'code_invalide' }); }
    await rlReset(env, ipHash);
    await audLog(env, { ev: 'admin_login_ok', ip: ipHash.slice(0, 12) });
    const grant = await ssoSign(secret, '__kdmc_admin__', 'admin', 1);
    const cookie = `kdmc_admin=${grant}; Domain=.kd-mc.com; Path=/; Max-Age=43200; Secure; HttpOnly; SameSite=Lax`;
    return J({ ok: true, grant }, cookie);
  }
  if (path === '/__admin/logout' && request.method === 'POST') {
    return J({ ok: true }, 'kdmc_admin=; Domain=.kd-mc.com; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax');
  }
  const me = await adminSession(request, env);
  if (!me) {
    const needCode = !!(env && env.KDMC_ADMIN_PIN_SHA256);
    return new Response(JSON.stringify({ ok: false, reason: needCode ? 'need_admin_code' : 'admin_only' }), { status: 403, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  }
  if (path === '/__admin/accounts' && request.method === 'GET') {
    if (!env.ACCOUNTS) return J({ ok: true, accounts: [], kv: false });
    const idx = JSON.parse((await env.ACCOUNTS.get('idx:uids')) || '[]');
    /* PERF : lectures KV en PARALLÈLE (avant : boucle `await` séquentielle → ~5 s
       pour 500 fiches, re-tirée toutes les 25 s par l'admin). ?limit= borne. */
    const lim = Math.max(1, Math.min(500, parseInt(url.searchParams.get('limit') || '500', 10) || 500));
    const accounts = (await Promise.all(idx.slice(-lim).map((uid) => accGet(env, uid)))).filter(Boolean);
    accounts.sort((a, b) => (b.last_seen || 0) - (a.last_seen || 0));
    return J({ ok: true, accounts, kv: true, count: accounts.length });
  }
  /* Journal d'audit admin : connexions admin ok/échec, déconnexions forcées,
     nouveaux appareils, mints Firebase. FIFO 200 en KV. */
  if (path === '/__admin/audit' && request.method === 'GET') {
    if (!env.ACCOUNTS) return J({ ok: true, log: [] });
    let log = []; try { log = JSON.parse((await env.ACCOUNTS.get('aud:log')) || '[]'); } catch { /* fail-open */ }
    return J({ ok: true, log });
  }
  /* « Déconnecter partout » : révoque toutes les sessions ÉMISES d'un compte
     (perte/vol d'appareil). Le compte reste intact : une reconnexion (Face ID ou
     nom+code) émet un token frais (iat > revoked_at) qui marche normalement. */
  if (path === '/__admin/revoke' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch { /* ignore */ }
    const uid = String(b.uid || '').slice(0, 80).trim();
    if (!uid) return J({ ok: false, reason: 'uid requis' });
    const acc = await accGet(env, uid);
    if (!acc) return J({ ok: false, reason: 'not_found' });
    acc.revoked_at = Date.now();
    await accPut(env, acc, true);
    await audLog(env, { ev: 'revoke_sessions', uid });
    return J({ ok: true, uid, revoked_at: acc.revoked_at });
  }
  if (path === '/__admin/account' && request.method === 'GET') {
    const uid = url.searchParams.get('uid') || '';
    const a = await accGet(env, uid);
    return a ? J({ ok: true, account: a }) : J({ ok: false, reason: 'not_found' });
  }
  if (path === '/__admin/me' && request.method === 'GET') {
    return J({ ok: true, uid: me.uid, name: me.name });
  }
  /* Lockdown shops (custom-token par rôle) : derrière le GRANT admin (prouvé via
     /__admin/login = PIN sha256), mint un id_token Firebase role:admin pour que les
     écritures shops_admin_v1/(products|logos) + shops_sourcing_v1/selection exigent
     auth.token.role==='admin'. FAIL-SAFE si secrets FB absents (client fail-open). */
  if (path === '/__admin/fbtoken' && request.method === 'POST') { // POST-only (durcissement audit P2-d : réduit la surface CSRF via cookie SameSite=Lax sur GET)
    const out = await mintShopsAdminIdToken(env);
    if (out.ok) await audLog(env, { ev: 'fbtoken_mint' });
    return out.ok ? J(out) : J(out, null, 503);
  }
  return J({ ok: false, reason: 'not_found' });
}

/* ===================== Crypto-bot Railway (bot.kd-mc.com) ===================== */
/* Tableau de bord du bot de trading (service Railway "crypto-bot").
   SÉCU : réservé admin — MÊME grant signé que /__admin (fail-closed, leçons #98/#99).
   Le RAILWAY_TOKEN (secret worker, posé par deploy-kdmc-router.yml) ne quitte JAMAIS
   le worker ; la page ne reçoit que du JSON déjà filtré.
   Erreurs : cause EXACTE relayée dans `detail` (règle "détailler les erreurs"). */
const BOT_SERVICE_NAME = 'crypto-bot';
async function railGql(env, query) {
  const r = await fetch('https://backboard.railway.com/graphql/v2', {
    method: 'POST',
    headers: { 'Project-Access-Token': env.RAILWAY_TOKEN, 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  let j = null; try { j = await r.json(); } catch { /* corps non-JSON */ }
  return { http: r.status, j };
}
async function botCtx(env) {
  const pt = await railGql(env, 'query { projectToken { projectId environmentId } }');
  const projectId = pt.j && pt.j.data && pt.j.data.projectToken && pt.j.data.projectToken.projectId;
  const environmentId = pt.j && pt.j.data && pt.j.data.projectToken && pt.j.data.projectToken.environmentId;
  if (!projectId) return { err: 'token_railway_invalide', detail: JSON.stringify(pt.j || pt.http).slice(0, 300) };
  const pr = await railGql(env, `query { project(id: "${projectId}") { name services { edges { node { id name } } } } }`);
  const edges = (((pr.j || {}).data || {}).project || { services: { edges: [] } }).services.edges || [];
  const services = edges.map((e) => e.node);
  const svc = services.find((n) => n.name === BOT_SERVICE_NAME);
  if (!svc) return { err: 'service_bot_introuvable', detail: 'services: ' + services.map((n) => n.name).join(', ') };
  return { projectId, environmentId, serviceId: svc.id, projectName: (((pr.j || {}).data || {}).project || {}).name, services };
}
/* Compte les VRAIS trades dans les logs d'un bot (mêmes règles que
   crypto-bot/trade_stats.py) : appariement FIFO 🟢 ACHAT → 🔻 VENTE par paire,
   net = Σ qty×(prix_vente − prix_achat). Jamais d'estimation : uniquement les
   lignes réellement présentes dans les logs visibles. */
/* ===== Indicateurs techniques (analyse expert style TradingView, Kevin 2026-07-10)
   Formules STANDARD (EMA, RSI Wilder, MACD, Stochastique, CCI) calculées sur les
   VRAIES bougies Binance publiques — jamais d'estimation, pas de clé requise. ===== */
function taEmaSeries(v, p) {
  const k = 2 / (p + 1); const out = []; let e = v[0];
  for (let i = 0; i < v.length; i++) { e = i ? v[i] * k + e * (1 - k) : v[0]; out.push(e); }
  return out;
}
function taRsi(c, p) {
  if (c.length < p + 2) return null;
  let g = 0, l = 0;
  for (let i = 1; i <= p; i++) { const d = c[i] - c[i - 1]; if (d > 0) g += d; else l -= d; }
  g /= p; l /= p;
  for (let i = p + 1; i < c.length; i++) {
    const d = c[i] - c[i - 1];
    g = (g * (p - 1) + Math.max(d, 0)) / p;
    l = (l * (p - 1) + Math.max(-d, 0)) / p;
  }
  return l === 0 ? 100 : 100 - 100 / (1 + g / l);
}
function taStoch(h, l, c, p, dP) {
  if (c.length < p + dP) return null;
  const ks = [];
  for (let j = c.length - dP; j < c.length; j++) {
    const hh = Math.max(...h.slice(j - p + 1, j + 1)), ll = Math.min(...l.slice(j - p + 1, j + 1));
    ks.push(hh === ll ? 50 : ((c[j] - ll) / (hh - ll)) * 100);
  }
  return { k: ks[ks.length - 1], d: ks.reduce((a, b) => a + b, 0) / ks.length };
}
function taCci(h, l, c, p) {
  if (c.length < p) return null;
  const tp = c.map((_, i) => (h[i] + l[i] + c[i]) / 3);
  const win = tp.slice(-p); const sma = win.reduce((a, b) => a + b, 0) / p;
  const dev = win.reduce((a, b) => a + Math.abs(b - sma), 0) / p;
  return dev === 0 ? 0 : (tp[tp.length - 1] - sma) / (0.015 * dev);
}
/* Notation façon TradingView : votes moyennes mobiles + oscillateurs → score −1..+1. */
function taRating(h, l, c) {
  const price = c[c.length - 1];
  let maBuy = 0, maSell = 0, oscBuy = 0, oscSell = 0, oscNeu = 0;
  [10, 20, 50, 100, 200].forEach((p) => {
    if (c.length < p) return;
    const e = taEmaSeries(c, p)[c.length - 1];
    if (price > e) maBuy++; else maSell++;
  });
  const rsi = taRsi(c, 14);
  if (rsi != null) { if (rsi < 30) oscBuy++; else if (rsi > 70) oscSell++; else oscNeu++; }
  const macdS = taEmaSeries(c, 12).map((v, i) => v - taEmaSeries(c, 26)[i]);
  const sig = taEmaSeries(macdS, 9);
  const macd = macdS[macdS.length - 1], macdSig = sig[sig.length - 1];
  if (macd > macdSig) oscBuy++; else oscSell++;
  const st = taStoch(h, l, c, 14, 3);
  if (st) { if (st.k < 20 && st.k > st.d) oscBuy++; else if (st.k > 80 && st.k < st.d) oscSell++; else oscNeu++; }
  const cci = taCci(h, l, c, 20);
  if (cci != null) { if (cci < -100) oscBuy++; else if (cci > 100) oscSell++; else oscNeu++; }
  const mom = c.length > 10 ? price - c[c.length - 11] : 0;
  if (mom > 0) oscBuy++; else if (mom < 0) oscSell++;
  const buy = maBuy + oscBuy, sell = maSell + oscSell, total = buy + sell + oscNeu;
  const score = total ? (buy - sell) / total : 0;
  const label = score >= 0.5 ? 'Achat fort' : score >= 0.1 ? 'Achat' : score > -0.1 ? 'Neutre' : score > -0.5 ? 'Vente' : 'Vente forte';
  return { price, score: Math.round(score * 100) / 100, label, rsi: rsi == null ? null : Math.round(rsi * 10) / 10, ma_buy: maBuy, ma_sell: maSell, osc_buy: oscBuy, osc_sell: oscSell, macd_up: macd > macdSig };
}
function fleetTradeStats(logs) {
  const fifo = {}; let buys = 0, sells = 0, wins = 0, losses = 0, net = 0;
  for (const l of logs) {
    const m = String((l && l.message) || '');
    let mm = m.match(/🟢\s+(\S+)\s+ACHAT\s+qty=([\d.]+)\s+@\s+([\d.]+)/);
    if (mm) { buys++; (fifo[mm[1]] = fifo[mm[1]] || []).push({ q: Number(mm[2]), p: Number(mm[3]) }); continue; }
    mm = m.match(/🔻\s+(\S+)\s+VENTE\s+\([^)]*\)\s+qty=([\d.]+)\s+@\s+([\d.]+)/);
    if (mm) {
      sells++; let q = Number(mm[2]); const ps = Number(mm[3]); let pnl = 0; const lot = fifo[mm[1]] || [];
      while (q > 1e-12 && lot.length) {
        const b = lot[0]; const take = Math.min(q, b.q);
        pnl += take * (ps - b.p); b.q -= take; q -= take;
        if (b.q <= 1e-12) lot.shift();
      }
      net += pnl; if (pnl >= 0) wins++; else losses++;
    }
  }
  let open = 0; Object.keys(fifo).forEach((k) => { if (fifo[k].length) open++; });
  return { buys, sells, wins, losses, net: Math.round(net * 100) / 100, open };
}
/* Validation serveur des « gros réglages » (défense en profondeur — la page valide
   aussi). Renvoie { set:{VAR:val} } ou { err:"cause exacte" }. */
function botValidateConfig(b) {
  const set = {};
  if (b.symbols !== undefined) {
    const arr = (Array.isArray(b.symbols) ? b.symbols : String(b.symbols).split(','))
      .map((s) => String(s).trim().toUpperCase().replace(/[-_]/g, '/'))
      .map((s) => (!s.includes('/') && s.endsWith('USDT') ? s.slice(0, -4) + '/USDT' : s))
      .filter(Boolean);
    const uniq = [...new Set(arr)];
    if (uniq.length < 1 || uniq.length > 8) return { err: 'choisis entre 1 et 8 cryptos' };
    for (const s of uniq) {
      if (!/^[A-Z0-9]{2,15}\/USDT$/.test(s)) return { err: 'paire invalide: ' + s + ' (format attendu ex BTC/USDT, cotation en USDT)' };
    }
    set.SYMBOLS = uniq.join(',');
  }
  const num = (key, envName, min, max) => {
    if (b[key] === undefined) return null;
    const n = Number(b[key]);
    if (!isFinite(n) || n < min || n > max) return envName + ' doit être entre ' + min + ' et ' + max;
    set[envName] = String(n);
    return null;
  };
  const errs = [
    (b.timeframe !== undefined) ? (['5m', '15m', '30m', '1h', '4h'].includes(String(b.timeframe)) ? (set.TIMEFRAME = String(b.timeframe), null) : 'timeframe: 5m/15m/30m/1h/4h') : null,
    num('risk', 'RISK_PER_TRADE_PCT', 0.1, 5),
    num('maxpos', 'MAX_POSITION_PCT', 5, 90),
    num('dailyloss', 'DAILY_LOSS_CAP_PCT', 1, 20),
    num('maxdd', 'MAX_DRAWDOWN_PCT', 3, 40),
  ].filter(Boolean);
  if (errs.length) return { err: errs.join(' ; ') };
  if (!Object.keys(set).length) return { err: 'aucun réglage fourni' };
  return { set };
}
/* Coffre Finances — sauvegarde en ligne CHIFFRÉE DE BOUT EN BOUT (admin only).
   Le client (tools/finances/) chiffre tout en AES-GCM-256 avec le code du coffre AVANT
   d'envoyer. Le serveur ne voit qu'un bloc {salt,iv,ct} illisible → confidentialité même
   vis-à-vis du worker/KV. Réutilise le KV ACCOUNTS (clés fin:*) — aucun binding en plus.
   Réservé admin (adminSession : grant prouvé via /__admin/login, cookie/x-kdmc-admin). */
async function handleFin(request, url, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  const me = await adminSession(request, env);
  if (!me) {
    const needCode = !!(env && env.KDMC_ADMIN_PIN_SHA256);
    return new Response(JSON.stringify({ ok: false, reason: needCode ? 'need_admin_code' : 'admin_only' }), { status: 403, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  }
  if (!env.ACCOUNTS) return J({ ok: false, reason: 'kv_absent' });
  const path = url.pathname;
  if (path === '/__fin/vault' && request.method === 'GET') {
    const blob = await env.ACCOUNTS.get('fin:vault:main');
    if (!blob) return J({ ok: true, empty: true });
    let meta = null; try { meta = JSON.parse((await env.ACCOUNTS.get('fin:meta:main')) || 'null'); } catch { /* */ }
    let parsed = null; try { parsed = JSON.parse(blob); } catch { return J({ ok: false, reason: 'corrupt' }); }
    return J({ ok: true, blob: parsed, meta });
  }
  if (path === '/__fin/meta' && request.method === 'GET') {
    let meta = null; try { meta = JSON.parse((await env.ACCOUNTS.get('fin:meta:main')) || 'null'); } catch { /* */ }
    return J({ ok: true, meta });
  }
  if (path === '/__fin/vault' && request.method === 'PUT') {
    let b = {}; try { b = await request.json(); } catch { return J({ ok: false, reason: 'bad_json' }); }
    if (!b || !b.blob || !b.blob.ct || !b.blob.salt || !b.blob.iv) return J({ ok: false, reason: 'blob_invalide' });
    const s = JSON.stringify(b.blob);
    if (s.length > 20 * 1024 * 1024) return J({ ok: false, reason: 'trop_gros' });
    const savedAt = b.savedAt || Date.now();
    await env.ACCOUNTS.put('fin:vault:main', s);
    await env.ACCOUNTS.put('fin:meta:main', JSON.stringify({ savedAt, size: s.length, tx: b.tx || 0 }));
    await audLog(env, { ev: 'fin_backup', size: s.length });
    return J({ ok: true, savedAt });
  }
  return new Response(JSON.stringify({ ok: false, reason: 'not_found' }), { status: 404, headers: { 'content-type': 'application/json' } });
}

/* Boîte factures@kd-mc.com : le worker "kdmc-mail" (Cloudflare Email Routing) dépose les
   pièces jointes des mails reçus dans KV (mail:p:<id>). Ici, l'app admin les récupère,
   les classe, puis les acquitte (supprime). E2E : l'app chiffre les originaux localement. */
async function handleMail(request, url, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  const me = await adminSession(request, env);
  if (!me) {
    const needCode = !!(env && env.KDMC_ADMIN_PIN_SHA256);
    return J({ ok: false, reason: needCode ? 'need_admin_code' : 'admin_only' }, null, 403);
  }
  if (!env.ACCOUNTS) return J({ ok: false, reason: 'kv_absent' });
  const path = url.pathname;
  if (path === '/__mail/scan' && request.method === 'GET') {
    const CAP = 120;   // vide plus vite (gros arriéré) ; l'app boucle en plus jusqu'à file vide
    const items = []; let cursor;
    do {
      const l = await env.ACCOUNTS.list({ prefix: 'mail:p:', cursor });
      for (const k of l.keys) {
        if (items.length >= CAP) break;
        const raw = await env.ACCOUNTS.get(k.name); if (!raw) continue;
        try { const it = JSON.parse(raw); it.id = k.name.slice('mail:p:'.length); items.push(it); } catch { /* */ }
      }
      cursor = l.list_complete ? null : l.cursor;
    } while (cursor && items.length < CAP);
    return J({ ok: true, items });
  }
  if (path === '/__mail/ack' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch { return J({ ok: false, reason: 'bad_json' }); }
    const ids = Array.isArray(b.ids) ? b.ids : [];
    for (const id of ids) { try { await env.ACCOUNTS.delete('mail:p:' + String(id)); } catch { /* */ } }
    await audLog(env, { ev: 'mail_ack', n: ids.length });
    return J({ ok: true, deleted: ids.length });
  }
  return J({ ok: false, reason: 'not_found' }, null, 404);
}

async function handleBot(request, url, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  const me = await adminSession(request, env);
  if (!me) {
    const needCode = !!(env && env.KDMC_ADMIN_PIN_SHA256);
    return J({ ok: false, reason: needCode ? 'need_admin_code' : 'admin_only' }, null, 403);
  }
  if (!env.RAILWAY_TOKEN) return J({ ok: false, reason: 'railway_token_absent', detail: 'Secret RAILWAY_TOKEN non déployé sur le worker (relancer deploy-kdmc-router).' });
  const ctx = await botCtx(env);
  if (ctx.err) return J({ ok: false, reason: ctx.err, detail: ctx.detail });
  const path = url.pathname;

  if (path === '/__bot/status' && request.method === 'GET') {
    const dp = await railGql(env, `query { deployments(first: 1, input: { projectId: "${ctx.projectId}", serviceId: "${ctx.serviceId}", environmentId: "${ctx.environmentId}" }) { edges { node { id status createdAt } } } }`);
    const node = ((((dp.j || {}).data || {}).deployments || { edges: [] }).edges[0] || {}).node;
    if (!node) return J({ ok: false, reason: 'aucun_deploiement', detail: JSON.stringify(dp.j || dp.http).slice(0, 300) });
    const rl = await railGql(env, `query { deploymentLogs(deploymentId: "${node.id}", limit: 80) { timestamp message } }`);
    const logs = (((rl.j || {}).data || {}).deploymentLogs || []).map((l) => ({ t: l.timestamp, m: String(l.message || '').slice(0, 300) }));
    return J({ ok: true, project: ctx.projectName, status: node.status, since: node.createdAt, logs });
  }

  /* Classement de la FLOTTE : bot principal (testnet) + 5 bots papier — tournoi de
     stratégies (Kevin 2026-07-06 « Je ne les vois pas dans l'app »). Net = gains/pertes
     RÉALISÉS comptés dans les logs visibles (FIFO, cf fleetTradeStats). Le RAILWAY_TOKEN
     ne quitte jamais le worker ; les 6 services sont interrogés EN PARALLÈLE. */
  if (path === '/__bot/fleet' && request.method === 'GET') {
    const FLEET = ['crypto-bot', 'crypto-bot-p1', 'crypto-bot-p2', 'crypto-bot-p3', 'crypto-bot-p4', 'crypto-bot-p5'];
    const bots = await Promise.all(FLEET.map(async (name) => {
      const svc = (ctx.services || []).find((s) => s.name === name);
      if (!svc) return { name, status: 'absent' };
      const dp = await railGql(env, `query { deployments(first: 1, input: { projectId: "${ctx.projectId}", serviceId: "${svc.id}", environmentId: "${ctx.environmentId}" }) { edges { node { id status } } } }`);
      const node = ((((dp.j || {}).data || {}).deployments || { edges: [] }).edges[0] || {}).node;
      if (!node) return { name, status: 'aucun_deploiement' };
      const rl = await railGql(env, `query { deploymentLogs(deploymentId: "${node.id}", limit: 1000) { message } }`);
      const logs = (((rl.j || {}).data || {}).deploymentLogs || []);
      const st = fleetTradeStats(logs);
      let equity = null;
      for (let i = logs.length - 1; i >= 0; i--) {
        const m = String(logs[i].message || '').match(/equity=([0-9.]+)/);
        if (m) { equity = Number(m[1]); break; }
      }
      return Object.assign({ name, status: node.status, equity }, st);
    }));
    /* Tri par net réalisé décroissant ; les bots absents/sans logs en dernier. */
    bots.sort((a, b) => (((b.net == null) ? -1e9 : b.net) - ((a.net == null) ? -1e9 : a.net)));
    return J({ ok: true, bots });
  }

  /* ANALYSE EXPERT (Kevin 2026-07-10 « qu'il serve à faire des analyses ») :
     notation Achat/Vente par crypto façon TradingView, calculée dans le worker
     depuis les VRAIES bougies Binance publiques (data-api.binance.vision, sans clé —
     api.binance.com renvoie HTTP 451 géo-bloqué hors UE). Timeframe validé (?tf=1h|4h|1d), symboles
     lus depuis la config réelle du bot. Aucune promesse : c'est une photo technique. */
  if (path === '/__bot/analysis' && request.method === 'GET') {
    const TFS = { '1h': '1h', '4h': '4h', '1d': '1d' };
    const tf = TFS[url.searchParams.get('tf') || '1h'] || '1h';
    const vq = await railGql(env, `query { variables(projectId: "${ctx.projectId}", environmentId: "${ctx.environmentId}", serviceId: "${ctx.serviceId}") }`);
    const vars = ((vq.j || {}).data || {}).variables || {};
    const syms = String(vars.SYMBOLS || 'BTC/USDT,ETH/USDT,SOL/USDT,BNB/USDT,XRP/USDT')
      .split(',').map((s) => s.trim().toUpperCase()).filter((s) => /^[A-Z0-9]{2,15}\/USDT$/.test(s)).slice(0, 8);
    const out = await Promise.all(syms.map(async (sym) => {
      const pair = sym.replace('/', '');
      try {
        const r = await fetch(`https://data-api.binance.vision/api/v3/klines?symbol=${pair}&interval=${tf}&limit=250`);
        if (!r.ok) return { symbol: sym, err: 'binance HTTP ' + r.status };
        const k = await r.json();
        if (!Array.isArray(k) || k.length < 60) return { symbol: sym, err: 'bougies insuffisantes (' + (k.length || 0) + ')' };
        const h = k.map((x) => Number(x[2])), l = k.map((x) => Number(x[3])), c = k.map((x) => Number(x[4]));
        return Object.assign({ symbol: sym }, taRating(h, l, c));
      } catch (e) { return { symbol: sym, err: String(e && e.message || e).slice(0, 120) }; }
    }));
    return J({ ok: true, tf, analysis: out });
  }

  /* Réglages (« gros réglages » choisis par Kevin ; le bot gère le reste).
     GET = valeurs actuelles ; POST = applique + redéploie. TESTNET non modifiable
     ici (bascule argent réel = décision volontaire hors dashboard). */
  const BOT_KNOBS = ['SYMBOLS', 'TIMEFRAME', 'RISK_PER_TRADE_PCT', 'MAX_POSITION_PCT', 'DAILY_LOSS_CAP_PCT', 'MAX_DRAWDOWN_PCT'];
  if (path === '/__bot/config' && request.method === 'GET') {
    const vq = await railGql(env, `query { variables(projectId: "${ctx.projectId}", environmentId: "${ctx.environmentId}", serviceId: "${ctx.serviceId}") }`);
    const vars = ((vq.j || {}).data || {}).variables || {};
    const cfg = {};
    BOT_KNOBS.forEach((k) => { if (vars[k] != null) cfg[k] = vars[k]; });
    return J({ ok: true, config: cfg, testnet: (vars.TESTNET !== 'false'), live: (vars.BOT_LIVE === 'true'), symbol_default: 'BTC/USDT' });
  }
  if (path === '/__bot/config' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch { /* ignore */ }
    const v = botValidateConfig(b);
    if (v.err) return J({ ok: false, reason: 'reglage_invalide', detail: v.err });
    for (const [name, value] of Object.entries(v.set)) {
      const up = await railGql(env, `mutation { variableUpsert(input: { projectId: "${ctx.projectId}", environmentId: "${ctx.environmentId}", serviceId: "${ctx.serviceId}", name: "${name}", value: "${value}" }) }`);
      if (!up.j || up.j.errors) return J({ ok: false, reason: 'variable_upsert_echec', detail: name + ': ' + JSON.stringify((up.j && up.j.errors) || up.http).slice(0, 200) });
    }
    const rd = await railGql(env, `mutation { serviceInstanceRedeploy(environmentId: "${ctx.environmentId}", serviceId: "${ctx.serviceId}") }`);
    if (!rd.j || rd.j.errors) return J({ ok: false, reason: 'redeploy_echec', detail: JSON.stringify((rd.j && rd.j.errors) || rd.http).slice(0, 200) });
    await audLog(env, { ev: 'bot_config', set: Object.keys(v.set).join(',') });
    return J({ ok: true, set: v.set });
  }

  /* Kill switch / relance : pose BOT_KILL puis redéploie (le bot lit BOT_KILL au
     cycle suivant → vend et s'arrête proprement ; exit 0 + ON_FAILURE = pas de restart). */
  if ((path === '/__bot/kill' || path === '/__bot/start') && request.method === 'POST') {
    const val = path === '/__bot/kill' ? '1' : '0';
    const up = await railGql(env, `mutation { variableUpsert(input: { projectId: "${ctx.projectId}", environmentId: "${ctx.environmentId}", serviceId: "${ctx.serviceId}", name: "BOT_KILL", value: "${val}" }) }`);
    if (!up.j || up.j.errors) return J({ ok: false, reason: 'variable_upsert_echec', detail: JSON.stringify((up.j && up.j.errors) || up.http).slice(0, 300) });
    const rd = await railGql(env, `mutation { serviceInstanceRedeploy(environmentId: "${ctx.environmentId}", serviceId: "${ctx.serviceId}") }`);
    if (!rd.j || rd.j.errors) return J({ ok: false, reason: 'redeploy_echec', detail: JSON.stringify((rd.j && rd.j.errors) || rd.http).slice(0, 300) });
    await audLog(env, { ev: path === '/__bot/kill' ? 'bot_kill' : 'bot_start' });
    return J({ ok: true, action: path === '/__bot/kill' ? 'kill' : 'start' });
  }

  return J({ ok: false, reason: 'not_found' });
}

function beatbotLock() {
  const html = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#08131f"><title>PoolPilot — privé</title>'
  + '<style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#08131f,#050c14);color:#e8f1fa;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:24px}'
  + '.c{width:100%;max-width:340px;text-align:center}.lg{font-size:44px}h1{font-size:19px;margin:10px 0 4px}p{color:#93b0c8;font-size:13px;margin:0 0 18px}'
  + 'input{width:100%;background:#0d1c2c;border:1px solid #1f3d5a;color:#e8f1fa;border-radius:12px;padding:14px;font-size:20px;text-align:center;letter-spacing:6px}'
  + 'button{width:100%;margin-top:12px;background:linear-gradient(135deg,#39c2ff,#0e88c9);color:#052034;border:none;border-radius:12px;padding:14px;font-size:16px;font-weight:700}'
  + '.e{color:#f2b632;font-size:12.5px;margin-top:10px;min-height:16px}a{color:#39c2ff}</style></head><body>'
  + '<div class="c"><div class="lg">🔒🌊</div><h1>PoolPilot — espace privé</h1><p>Réservé à l\'administrateur. Déverrouille avec ton code (Face ID te reconnaît ensuite automatiquement).</p>'
  + '<input id="pin" type="password" inputmode="numeric" autocomplete="one-time-code" placeholder="••••••" maxlength="12">'
  + '<button id="go">Déverrouiller</button><div class="e" id="err"></div>'
  + '<p style="margin-top:18px;font-size:11.5px">Déjà connecté sur <a href="https://kd-mc.com">kd-mc.com</a> ? Recharge cette page.</p></div>'
  + '<script>var b=document.getElementById("go"),pin=document.getElementById("pin"),err=document.getElementById("err");'
  + 'function sub(){var c=(pin.value||"").trim();if(!c){err.textContent="Entre ton code.";return;}b.disabled=true;err.textContent="Vérification…";'
  + 'fetch("/__admin/login",{method:"POST",headers:{"content-type":"application/json"},credentials:"include",body:JSON.stringify({code:c})}).then(function(r){return r.json();}).then(function(j){'
  + 'if(j.ok){location.reload();}else{b.disabled=false;err.textContent=j.reason==="rate_limited"?("Trop d\'essais, attends "+Math.ceil((j.wait||0)/1000)+"s"):(j.reason==="code_invalide"?"Code incorrect.":"Erreur : "+(j.reason||"?"));}}).catch(function(e){b.disabled=false;err.textContent="Réseau : "+e;});}'
  + 'b.onclick=sub;pin.addEventListener("keydown",function(e){if(e.key==="Enter")sub();});pin.focus();</script></body></html>';
  return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin' } });
}
function approvalsLock() {
  const html = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0b0f0a"><title>Coffre d\'autorisations — privé</title>'
  + '<style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#0b0f0a,#05070a);color:#f2efe0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:24px}'
  + '.c{width:100%;max-width:340px;text-align:center}.lg{font-size:44px}h1{font-size:19px;margin:10px 0 4px}p{color:#a9b39a;font-size:13px;margin:0 0 18px}'
  + 'input{width:100%;background:#0b1108;border:1px solid #2a331f;color:#f2efe0;border-radius:12px;padding:14px;font-size:20px;text-align:center;letter-spacing:6px}'
  + 'button{width:100%;margin-top:12px;background:linear-gradient(135deg,#e8c766,#c9a94a);color:#0b0f0a;border:none;border-radius:12px;padding:14px;font-size:16px;font-weight:700}'
  + '.e{color:#e0a83a;font-size:12.5px;margin-top:10px;min-height:16px}a{color:#e8c766}</style></head><body>'
  + '<div class="c"><div class="lg">🔐🆔</div><h1>Coffre d\'autorisations — espace privé</h1><p>Réservé à l\'administrateur. Déverrouille avec ton code (Face ID te reconnaît ensuite automatiquement).</p>'
  + '<input id="pin" type="password" inputmode="numeric" autocomplete="one-time-code" placeholder="••••••" maxlength="12">'
  + '<button id="go">Déverrouiller</button><div class="e" id="err"></div>'
  + '<p style="margin-top:18px;font-size:11.5px">Déjà connecté sur <a href="https://kd-mc.com">kd-mc.com</a> ? Recharge cette page.</p></div>'
  + '<script>var b=document.getElementById("go"),pin=document.getElementById("pin"),err=document.getElementById("err");'
  + 'function sub(){var c=(pin.value||"").trim();if(!c){err.textContent="Entre ton code.";return;}b.disabled=true;err.textContent="Vérification…";'
  + 'fetch("/__admin/login",{method:"POST",headers:{"content-type":"application/json"},credentials:"include",body:JSON.stringify({code:c})}).then(function(r){return r.json();}).then(function(j){'
  + 'if(j.ok){location.reload();}else{b.disabled=false;err.textContent=j.reason==="rate_limited"?("Trop d\'essais, attends "+Math.ceil((j.wait||0)/1000)+"s"):(j.reason==="code_invalide"?"Code incorrect.":"Erreur : "+(j.reason||"?"));}}).catch(function(e){b.disabled=false;err.textContent="Réseau : "+e;});}'
  + 'b.onclick=sub;pin.addEventListener("keydown",function(e){if(e.key==="Enter")sub();});pin.focus();</script></body></html>';
  return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin' } });
}
/* ---- Relais Beatbot : contrôle réel du robot piscine (PoolPilot / beatbot.kd-mc.com) ----
   L'app découvre l'API cloud Beatbot depuis une CAPTURE que Kevin exporte de SON iPhone
   (seul geste manuel possible), puis relaie start/stop/mode/base + carte via ce proxy.
   SÉCURITÉ : admin-gated (même grant Face ID/PIN que /__admin), HTTPS public uniquement
   (blocage IP privées/métadonnées → anti-SSRF), même origine (0 CORS), audité, réponse cap 256 Ko.
   AUCUNE modif firmware (garantie intacte) : on relaie les MÊMES requêtes que l'app officielle. */
function beatbotTargetOk(rawUrl) {
  let u; try { u = new URL(rawUrl); } catch { return false; }
  if (u.protocol !== 'https:') return false;
  const h = (u.hostname || '').toLowerCase();
  if (!h || h.indexOf(':') >= 0) return false;           // pas d'IPv6 littéral
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal') || h.endsWith('.localhost')) return false;
  if (!h.includes('.')) return false;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) {              // IPv4 littéral → bloque plages privées/link-local/multicast
    const p = h.split('.').map(Number);
    if (p.some((n) => n > 255)) return false;
    if (p[0] === 0 || p[0] === 10 || p[0] === 127 || p[0] >= 224) return false;
    if (p[0] === 169 && p[1] === 254) return false;
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return false;
    if (p[0] === 192 && p[1] === 168) return false;
    if (p[0] === 100 && p[1] >= 64 && p[1] <= 127) return false;
  }
  return true;
}
function abToB64(ab) { const u = new Uint8Array(ab); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); }
async function handleBeatbot(request, url, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  const me = await adminSession(request, env);
  if (!me) { const needCode = !!(env && env.KDMC_ADMIN_PIN_SHA256); return J({ ok: false, reason: needCode ? 'need_admin_code' : 'admin_only' }, null, 403); }
  const path = url.pathname;
  if (path === '/__beatbot/health' && request.method === 'GET') return J({ ok: true, relay: 'ready' });
  if (path.startsWith('/__beatbot/tuya/')) return handleTuya(request, path, env);
  if (path === '/__beatbot/relay' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch { return J({ ok: false, reason: 'bad_json' }); }
    if (!beatbotTargetOk(b.url)) return J({ ok: false, reason: 'target_refuse', detail: 'URL cible invalide (HTTPS public uniquement, IP privées interdites).' });
    const method = String(b.method || 'GET').toUpperCase();
    if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'].indexOf(method) < 0) return J({ ok: false, reason: 'method_refuse' });
    const headers = new Headers();
    if (b.headers && typeof b.headers === 'object') for (const k in b.headers) { const kl = k.toLowerCase(); if (['host', 'cookie', 'content-length'].indexOf(kl) < 0) headers.set(k, String(b.headers[k])); }
    let resp;
    try { resp = await fetch(b.url, { method, headers, body: (method === 'GET' || method === 'HEAD') ? undefined : (typeof b.body === 'string' ? b.body : JSON.stringify(b.body || {})), redirect: 'manual' }); }
    catch (e) { return J({ ok: false, reason: 'fetch_fail', detail: String((e && e.message) || e).slice(0, 300) }); }
    const ct = resp.headers.get('content-type') || '';
    const raw = await resp.arrayBuffer();
    const capped = raw.byteLength > 262144 ? raw.slice(0, 262144) : raw;
    const isText = /text|json|xml|javascript|urlencoded/.test(ct);
    const bodyOut = isText ? { text: new TextDecoder().decode(capped) } : { b64: abToB64(capped) };
    try { await audLog(env, { ev: 'beatbot_relay', host: new URL(b.url).hostname, st: resp.status }); } catch { /* fail-open */ }
    return J({ ok: true, status: resp.status, ct, size: raw.byteLength, body: bodyOut });
  }
  return J({ ok: false, reason: 'not_found' });
}

/* ---- Tuya OpenAPI : contrôle RÉEL du robot piscine via l'écosystème cloud Tuya ----
   Le robot Beatbot AquaSense 2 Ultra passe par le cloud Tuya (« plug-in » + ID/UUID
   robot). La capture .har de l'app est bloquée (certificate pinning) ; l'API Tuya, elle,
   est officielle, documentée, SANS bidouille firmware → garantie intacte. Kevin lie une
   fois son compte robot à un projet Tuya IoT et colle 2 clés (Access ID + Secret) DANS
   PoolPilot ; le worker les garde côté serveur (KV ACCOUNTS, préfixe `tuya:`, jamais
   renvoyées au client), signe chaque requête (HMAC-SHA256, algo Tuya v2) et relaie
   status/commandes. Admin-gated (handleTuya n'est atteint qu'après adminSession OK).
   Honnête : on lit/écrit les VRAIS « data points » du robot (batterie, état, mode,
   marche/arrêt, retour base…). La position live n'est exposée que si le robot publie un
   DP de position — sinon l'app le dit franchement (aucune invention). */
async function tuyaSha256Hex(str) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str || ''));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
async function tuyaHmacHex(secret, msg) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const s = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(msg));
  return [...new Uint8Array(s)].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}
/* stringToSign Tuya = METHOD \n SHA256(body) \n (headers vides) \n url?query-trié */
async function tuyaStringToSign(method, pathWithQuery, bodyStr) {
  return String(method).toUpperCase() + '\n' + (await tuyaSha256Hex(bodyStr || '')) + '\n' + '' + '\n' + pathWithQuery;
}
/* sign = HMAC-SHA256( clientId + [access_token] + t + nonce("") + stringToSign , secret ) */
async function tuyaSign(clientId, secret, token, t, s2s) {
  return tuyaHmacHex(secret, clientId + (token || '') + t + '' + s2s);
}
const TUYA_HOSTS = { eu: 'openapi.tuyaeu.com', us: 'openapi.tuyaus.com', cn: 'openapi.tuyacn.com', in: 'openapi.tuyain.com' };
async function tuyaCfg(env) { if (!env || !env.ACCOUNTS) return null; try { return JSON.parse((await env.ACCOUNTS.get('tuya:cfg')) || 'null'); } catch { return null; } }
async function tuyaSaveCfg(env, cfg) { if (env && env.ACCOUNTS) await env.ACCOUNTS.put('tuya:cfg', JSON.stringify(cfg)); }
async function tuyaMintToken(host, clientId, secret) {
  const p = '/v1.0/token?grant_type=1', t = Date.now();
  const sign = await tuyaSign(clientId, secret, '', t, await tuyaStringToSign('GET', p, ''));
  const r = await fetch('https://' + host + p, { headers: { client_id: clientId, sign, t: String(t), sign_method: 'HMAC-SHA256' } });
  const j = await r.json().catch(() => ({}));
  if (!j || j.success !== true || !j.result) return { ok: false, detail: (j && (j.msg || ('code ' + j.code))) || ('HTTP ' + r.status) };
  return { ok: true, token: j.result.access_token, exp: Date.now() + Math.max(60, (j.result.expire_time || 7200) - 60) * 1000 };
}
async function tuyaEnsureToken(env, cfg) {
  let tok = null; try { tok = JSON.parse((await env.ACCOUNTS.get('tuya:token')) || 'null'); } catch { /* */ }
  if (tok && tok.token && tok.exp > Date.now()) return tok.token;
  const m = await tuyaMintToken(cfg.host, cfg.access_id, cfg.access_secret);
  if (!m.ok) return null;
  await env.ACCOUNTS.put('tuya:token', JSON.stringify({ token: m.token, exp: m.exp }), { expirationTtl: 7200 });
  return m.token;
}
/* Appel métier signé (status, commandes, découverte…). Retourne {ok, http, result, msg}. */
async function tuyaBiz(env, cfg, method, pathWithQuery, bodyObj) {
  const token = await tuyaEnsureToken(env, cfg);
  if (!token) return { ok: false, reason: 'token_fail', detail: 'Clés Tuya refusées (Access ID/Secret ou région incorrects).' };
  const bodyStr = bodyObj ? JSON.stringify(bodyObj) : '';
  const t = Date.now();
  const sign = await tuyaSign(cfg.access_id, cfg.access_secret, token, t, await tuyaStringToSign(method, pathWithQuery, bodyStr));
  let r; try {
    r = await fetch('https://' + cfg.host + pathWithQuery, { method, headers: { client_id: cfg.access_id, access_token: token, sign, t: String(t), sign_method: 'HMAC-SHA256', 'Content-Type': 'application/json' }, body: bodyStr || undefined });
  } catch (e) { return { ok: false, reason: 'fetch_fail', detail: String((e && e.message) || e).slice(0, 200) }; }
  const j = await r.json().catch(() => ({}));
  return { ok: j && j.success === true, http: r.status, result: j && j.result, msg: j && j.msg, code: j && j.code };
}
async function handleTuya(request, path, env) {
  const seg = path.slice('/__beatbot/tuya/'.length);
  const need = () => J({ ok: false, reason: 'not_linked', detail: 'Robot non lié. Colle tes clés Tuya (Access ID + Secret) dans PoolPilot.' });
  /* état de liaison (jamais le secret) */
  if (seg === 'state' && request.method === 'GET') {
    const c = await tuyaCfg(env);
    return J({ ok: true, linked: !!c, host: c && c.host, region: c && c.region, device_id: c && c.device_id, id_hint: c && c.access_id ? c.access_id.slice(0, 4) + '…' : null });
  }
  /* lier : stocke les clés + teste le token */
  if (seg === 'link' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch { return J({ ok: false, reason: 'bad_json' }); }
    const region = (b.region || 'eu').toLowerCase();
    const host = TUYA_HOSTS[region] || TUYA_HOSTS.eu;
    const access_id = String(b.access_id || '').trim(), access_secret = String(b.access_secret || '').trim();
    if (!access_id || !access_secret) return J({ ok: false, reason: 'missing', detail: 'Access ID et Access Secret requis.' });
    const m = await tuyaMintToken(host, access_id, access_secret);
    if (!m.ok) return J({ ok: false, reason: 'auth_fail', detail: m.detail });
    const cfg = { access_id, access_secret, host, region, device_id: (b.device_id || '').trim() || null };
    await tuyaSaveCfg(env, cfg);
    await env.ACCOUNTS.put('tuya:token', JSON.stringify({ token: m.token, exp: m.exp }), { expirationTtl: 7200 });
    try { await audLog(env, { ev: 'tuya_link', region }); } catch { /* */ }
    return J({ ok: true, linked: true, region });
  }
  const cfg = await tuyaCfg(env);
  if (!cfg) return need();
  /* découverte des robots liés au projet Tuya */
  if (seg === 'devices' && request.method === 'GET') {
    const r = await tuyaBiz(env, cfg, 'GET', '/v1.0/iot-01/associated-users/devices', null);
    if (!r.ok) return J({ ok: false, reason: 'tuya_error', detail: r.detail || r.msg || ('code ' + r.code) });
    const devs = ((r.result && r.result.devices) || []).map((d) => ({ id: d.id, name: d.name, category: d.category, product_name: d.product_name, online: d.online }));
    return J({ ok: true, devices: devs });
  }
  /* choisir le robot actif */
  if (seg === 'select' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch { return J({ ok: false, reason: 'bad_json' }); }
    const id = String(b.device_id || '').trim(); if (!id) return J({ ok: false, reason: 'missing' });
    cfg.device_id = id; await tuyaSaveCfg(env, cfg);
    return J({ ok: true, device_id: id });
  }
  if (seg === 'unlink' && request.method === 'POST') {
    try { await env.ACCOUNTS.delete('tuya:cfg'); await env.ACCOUNTS.delete('tuya:token'); } catch { /* */ }
    return J({ ok: true, linked: false });
  }
  /* les routes suivantes ont besoin d'un robot choisi */
  if (!cfg.device_id) return J({ ok: false, reason: 'no_device', detail: 'Choisis d\'abord ton robot (découverte).' });
  const idp = encodeURIComponent(cfg.device_id);
  if (seg === 'status' && request.method === 'GET') {
    const info = await tuyaBiz(env, cfg, 'GET', '/v1.0/devices/' + idp, null);
    const st = await tuyaBiz(env, cfg, 'GET', '/v1.0/devices/' + idp + '/status', null);
    if (!st.ok && !info.ok) return J({ ok: false, reason: 'tuya_error', detail: st.detail || st.msg || info.msg || ('code ' + st.code) });
    return J({ ok: true, online: info.result && info.result.online, name: info.result && info.result.name, status: st.result || [] });
  }
  if (seg === 'functions' && request.method === 'GET') {
    const r = await tuyaBiz(env, cfg, 'GET', '/v1.0/devices/' + idp + '/functions', null);
    if (!r.ok) return J({ ok: false, reason: 'tuya_error', detail: r.detail || r.msg || ('code ' + r.code) });
    return J({ ok: true, functions: (r.result && r.result.functions) || [] });
  }
  if (seg === 'command' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch { return J({ ok: false, reason: 'bad_json' }); }
    const cmds = Array.isArray(b.commands) ? b.commands : null;
    if (!cmds || !cmds.length) return J({ ok: false, reason: 'missing', detail: 'commands[] requis.' });
    const safe = cmds.filter((c) => c && typeof c.code === 'string').map((c) => ({ code: c.code, value: c.value }));
    const r = await tuyaBiz(env, cfg, 'POST', '/v1.0/devices/' + idp + '/commands', { commands: safe });
    try { await audLog(env, { ev: 'tuya_command', codes: safe.map((c) => c.code).join(',') }); } catch { /* */ }
    if (!r.ok) return J({ ok: false, reason: 'tuya_error', detail: r.detail || r.msg || ('code ' + r.code) });
    return J({ ok: true, sent: safe });
  }
  return J({ ok: false, reason: 'not_found' });
}

/* Grant admin MACHINE : produit le même jeton signé que /__admin/login, mais à
   partir du SECRET SSO (pas du code PIN). Sert à l'agent de contrôle GitHub Actions
   pour s'authentifier en admin et vérifier le bot À LA PLACE de Kevin, sans jamais
   détenir son Face ID. Minter un jeton exige déjà le secret → n'affaiblit rien.
   Utilise le MÊME ssoSign que le worker → zéro dérive (le jeton est forcément accepté). */
async function adminGrant(secret) { return ssoSign(secret, '__kdmc_admin__', 'admin', 1); }

/* Export nommé pour les tests régression (Cloudflare utilise seulement le default export). */
export { enrich, adminGrant, beatbotTargetOk, tuyaStringToSign, tuyaSign, tuyaSha256Hex, tuyaHmacHex };
