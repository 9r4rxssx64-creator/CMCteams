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
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    // SSO transverse (session unique + CGU). Même origine par sous-domaine.
    if (url.pathname.startsWith('/__sso/')) return handleSso(request, url, env);
    // Admin domaine (fiches clients + fonctions communes). Réservé admin.
    if (url.pathname.startsWith('/__admin/')) return handleAdmin(request, url, env);
    // Crypto-bot Railway (statut + kill switch). Réservé admin (même grant que /__admin).
    if (url.pathname.startsWith('/__bot/')) return handleBot(request, url, env);

    const base = ROUTES[host];
    if (!base) return Response.redirect('https://kd-mc.com/', 302);

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
async function notifyPush(env, title, body) {
  const url = env && env.KDMC_PUSH_URL, tok = env && env.KDMC_PUSH_TOKEN;
  if (!url || !tok) return; /* non configuré → repli = journal admin */
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 2000);
    await fetch(url.replace(/\/$/, '') + '/send-all', {
      method: 'POST', signal: ctrl.signal,
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + tok },
      body: JSON.stringify({ payload: { title, body, tag: 'kdmc-new-device', url: 'https://kd-mc.com/admin/' } }),
    }).catch(() => {});
    clearTimeout(to);
  } catch { /* fail-open : jamais d'échec de connexion à cause d'une notif */ }
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
  const g = await ssoVerify(secret, adminGrantTok(request));
  if (!g || g.uid !== '__kdmc_admin__') return null;
  return { uid: '__kdmc_admin__', name: 'Admin', grant: true };
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
    if (!code) return J({ ok: false, reason: 'code_requis' });
    if ((await sha256Hex(code)) !== adminHash) { await rlFail(env, ipHash); await audLog(env, { ev: 'admin_login_fail', ip: ipHash.slice(0, 12) }); return J({ ok: false, reason: 'code_invalide' }); }
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
  const svc = edges.map((e) => e.node).find((n) => n.name === BOT_SERVICE_NAME);
  if (!svc) return { err: 'service_bot_introuvable', detail: 'services: ' + edges.map((e) => e.node.name).join(', ') };
  return { projectId, environmentId, serviceId: svc.id, projectName: (((pr.j || {}).data || {}).project || {}).name };
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

/* Export nommé pour les tests régression (Cloudflare utilise seulement le default export). */
export { enrich };
