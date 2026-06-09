/**
 * kdmc-router — Routeur de domaine personnalisé KDMC (kd-mc.com)
 * ----------------------------------------------------------------------------
 * 1) Reverse-proxy : chaque sous-domaine -> son app GitHub Pages.
 * 2) SSO transverse : /__sso/* (session unique signée, cookie .kd-mc.com).
 * 3) Admin domaine : /__admin/* (fiches clients enrichies + fonctions communes),
 *    réservé à la session admin (Kevin). Registre dans Cloudflare KV (ACCOUNTS),
 *    enrichi à chaque connexion (device + géo request.cf + horodatage). Fail-open.
 */

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
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    // SSO transverse (session unique + CGU). Même origine par sous-domaine.
    if (url.pathname.startsWith('/__sso/')) return handleSso(request, url, env);
    // Admin domaine (fiches clients + fonctions communes). Réservé admin.
    if (url.pathname.startsWith('/__admin/')) return handleAdmin(request, url, env);

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
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: outHeaders });
  },
};

function rewriteLocation(loc, base, host) {
  try {
    let path = loc;
    if (loc.startsWith('http')) {
      const u = new URL(loc);
      if (u.hostname.endsWith('github.io')) path = u.pathname + u.search + u.hash;
      else return loc;
    }
    if (path.startsWith(base + '/')) path = path.slice(base.length);
    else if (path === base) path = '/';
    return 'https://' + host + path;
  } catch { return loc; }
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
async function ssoSign(secret, uid, name, cgu) {
  const p = b64urlStr(JSON.stringify({ u: uid, n: name, c: cgu ? 1 : 0, iat: Date.now(), exp: Date.now() + SSO_TTL * 1000 }));
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
  return { uid: d.u, name: d.n || '', cgu: d.c === 1 };
}
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
function J(o, setCookie) {
  return new Response(JSON.stringify(o), {
    status: 200,
    headers: Object.assign({ 'content-type': 'application/json', 'cache-control': 'no-store', 'x-kdmc-sso': '1' }, setCookie ? { 'set-cookie': setCookie } : {}),
  });
}

/* Registre des fiches clients (Cloudflare KV ACCOUNTS). Fail-open si absent. */
async function accGet(env, uid) {
  if (!env || !env.ACCOUNTS) return null;
  try { return JSON.parse((await env.ACCOUNTS.get('acc:' + uid)) || 'null'); } catch { return null; }
}
async function accPut(env, acc) {
  if (!env || !env.ACCOUNTS || !acc || !acc.uid) return;
  try {
    await env.ACCOUNTS.put('acc:' + acc.uid, JSON.stringify(acc));
    const idx = JSON.parse((await env.ACCOUNTS.get('idx:uids')) || '[]');
    if (idx.indexOf(acc.uid) < 0) { idx.push(acc.uid); await env.ACCOUNTS.put('idx:uids', JSON.stringify(idx.slice(-5000))); }
  } catch { /* fail-open */ }
}
/* Enrichit (ou crée) la fiche à chaque connexion : MAX de renseignements. */
async function enrich(env, request, uid, name, cgu) {
  if (!env || !env.ACCOUNTS) return;
  const cf = request.cf || {};
  const ipHash = await sha256Hex((request.headers.get('CF-Connecting-IP') || '') + '|kdmc');
  const ua = request.headers.get('user-agent') || '';
  const device = /mobile|iphone|android/i.test(ua) ? 'mobile' : 'desktop';
  const os = /iphone|ipad|ios/i.test(ua) ? 'iOS' : /android/i.test(ua) ? 'Android' : /mac/i.test(ua) ? 'macOS' : /windows/i.test(ua) ? 'Windows' : /linux/i.test(ua) ? 'Linux' : '';
  const place = [cf.city, cf.region, cf.country].filter(Boolean).join(', ');
  const now = Date.now();
  const prev = (await accGet(env, uid)) || { uid, name, created: now, cgu_at: 0, hits: 0, devices: [], places: [] };
  prev.name = name || prev.name;
  if (cgu && !prev.cgu_at) prev.cgu_at = now;
  prev.last_seen = now;
  prev.last_ip_hash = ipHash;
  prev.last_place = place;
  prev.last_device = device + (os ? ' · ' + os : '');
  prev.hits = (prev.hits || 0) + 1;
  prev.devices = Array.from(new Set([...(prev.devices || []), device + (os ? '·' + os : '')])).slice(-10);
  if (place) prev.places = Array.from(new Set([...(prev.places || []), place])).slice(-20);
  await accPut(env, prev);
}

async function handleSso(request, url, env) {
  const secret = env && env.KDMC_SSO_SECRET;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (!secret) return J({ ok: false, reason: 'sso_not_configured' });
  const path = url.pathname;
  if (path === '/__sso/whoami' && request.method === 'GET') {
    const s = await ssoVerify(secret, ssoToken(request));
    if (s) { await enrich(env, request, s.uid, s.name, s.cgu); return J({ ok: true, uid: s.uid, name: s.name, cgu: s.cgu, admin: ADMIN_UIDS.indexOf(s.uid) >= 0 }); }
    return J({ ok: false });
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
    return J({ ok: true, uid, name, cgu, token, admin: ADMIN_UIDS.indexOf(uid) >= 0 }, cookie);
  }
  if (path === '/__sso/logout' && request.method === 'POST') {
    return J({ ok: true }, `${SSO_COOKIE}=; Domain=.kd-mc.com; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax`);
  }
  return J({ ok: false, reason: 'not_found' });
}

/* ===================== Admin domaine (fiches clients) ===================== */
async function adminSession(request, env) {
  const secret = env && env.KDMC_SSO_SECRET;
  if (!secret) return null;
  const s = await ssoVerify(secret, ssoToken(request));
  if (!s || ADMIN_UIDS.indexOf(s.uid) < 0) return null;
  return s;
}
async function handleAdmin(request, url, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  const me = await adminSession(request, env);
  if (!me) return new Response(JSON.stringify({ ok: false, reason: 'admin_only' }), { status: 403, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  const path = url.pathname;
  if (path === '/__admin/accounts' && request.method === 'GET') {
    if (!env.ACCOUNTS) return J({ ok: true, accounts: [], kv: false });
    const idx = JSON.parse((await env.ACCOUNTS.get('idx:uids')) || '[]');
    const accounts = [];
    for (const uid of idx.slice(-500)) { const a = await accGet(env, uid); if (a) accounts.push(a); }
    accounts.sort((a, b) => (b.last_seen || 0) - (a.last_seen || 0));
    return J({ ok: true, accounts, kv: true, count: accounts.length });
  }
  if (path === '/__admin/account' && request.method === 'GET') {
    const uid = url.searchParams.get('uid') || '';
    const a = await accGet(env, uid);
    return a ? J({ ok: true, account: a }) : J({ ok: false, reason: 'not_found' });
  }
  if (path === '/__admin/me' && request.method === 'GET') {
    return J({ ok: true, uid: me.uid, name: me.name });
  }
  return J({ ok: false, reason: 'not_found' });
}
