/**
 * kdmc-router — Routeur de domaine personnalisé KDMC (kd-mc.com)
 * ----------------------------------------------------------------------------
 * Donne à chaque projet KDMC sa "belle adresse" (sous-domaine par projet) en
 * reverse-proxyfiant vers le bon sous-chemin GitHub Pages du repo CMCteams.
 *
 * GitHub Pages n'autorise qu'UN domaine personnalisé par repo, or les 5 apps
 * vivent dans le même repo. Ce worker unique route selon le sous-domaine :
 *
 *   kd-mc.com / www.kd-mc.com  -> /CMCteams/kdmc-home   (portfolio)
 *   cmcteams.kd-mc.com         -> /CMCteams
 *   apex-ai.kd-mc.com          -> /CMCteams/apex-ai-v13
 *   apex-chat.kd-mc.com        -> /CMCteams/messaging-app
 *   la-detente.kd-mc.com       -> /CMCteams/la-detente
 *   chez-lolo.kd-mc.com        -> /CMCteams/shops/chez-lolo
 *
 * Comme tout est servi sous le sous-domaine kd-mc.com (même origine), les PWA /
 * service workers / caches fonctionnent normalement.
 *
 * Les anciennes URLs (…github.io/CMCteams/…) restent valides en parallèle.
 */

const UPSTREAM = 'https://9r4rxssx64-creator.github.io';
const PAGES_PREFIX = '/CMCteams';

// host -> base sous-chemin GitHub Pages (sans slash final)
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

    // ===== SSO transverse kd-mc.com (session unique + CGU multi-app) =====
    // Les apps appellent /__sso/* sur LEUR propre sous-domaine (même origine →
    // pas de CORS). Le cookie est posé sur Domain=.kd-mc.com → partagé par TOUS
    // les sous-domaines. Sécurité : cookie HMAC-SHA256 signé + HttpOnly + Secure
    // + SameSite=Lax (ni vol XSS, ni forge). Fail-open : si non configuré →
    // {ok:false} et les apps gardent leur login normal (zéro régression).
    if (url.pathname.startsWith('/__sso/')) {
      return handleSso(request, url, env);
    }

    const base = ROUTES[host];

    // Hôte inconnu : page d'accueil par défaut (filet de sécurité).
    if (!base) {
      return Response.redirect('https://kd-mc.com/', 302);
    }

    // Calcule le chemin amont sur GitHub Pages.
    //  - Les assets en chemin ABSOLU incluent déjà /CMCteams/... (build Vite) :
    //    on les proxie tels quels (évite de doubler le préfixe).
    //  - Sinon (racine ou asset relatif) : on préfixe par la base de l'app.
    let p = url.pathname;
    let upstreamPath;
    if (p === '/' || p === '') {
      upstreamPath = base + '/';
    } else if (p.startsWith(PAGES_PREFIX + '/')) {
      upstreamPath = p;
    } else {
      upstreamPath = base + p;
    }

    const upstreamUrl = UPSTREAM + upstreamPath + url.search;

    // Recopie la requête sans l'en-tête Host (fetch le règle depuis l'URL).
    const reqHeaders = new Headers(request.headers);
    reqHeaders.delete('host');

    const upstreamReq = new Request(upstreamUrl, {
      method: request.method,
      headers: reqHeaders,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
    });

    let res = await fetch(upstreamReq);

    // Réécrit les redirections internes GitHub Pages (slash de répertoire, etc.)
    // pour rester sur le domaine personnalisé.
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      if (loc) {
        const newLoc = rewriteLocation(loc, base, host);
        const h = new Headers(res.headers);
        h.set('location', newLoc);
        return new Response(null, { status: res.status, headers: h });
      }
    }

    // Renvoie la réponse en retirant les en-têtes qui révèlent l'amont.
    const outHeaders = new Headers(res.headers);
    outHeaders.delete('content-security-policy-report-only');
    outHeaders.set('x-kdmc-router', host);
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: outHeaders,
    });
  },
};

/**
 * Transforme une Location amont (github.io/CMCteams/<app>/…) en chemin relatif
 * au domaine personnalisé courant.
 */
function rewriteLocation(loc, base, host) {
  try {
    let path = loc;
    // Absolu vers github.io -> garder seulement le pathname.
    if (loc.startsWith('http')) {
      const u = new URL(loc);
      if (u.hostname.endsWith('github.io')) {
        path = u.pathname + u.search + u.hash;
      } else {
        return loc; // redirection externe légitime : ne pas toucher.
      }
    }
    // Retire le préfixe de base de l'app si présent.
    if (path.startsWith(base + '/')) {
      path = path.slice(base.length); // garde le slash initial
    } else if (path === base) {
      path = '/';
    }
    return 'https://' + host + path;
  } catch {
    return loc;
  }
}

/* ===================== SSO transverse kd-mc.com ===================== */
const SSO_COOKIE = 'kdmc_sso';
const SSO_TTL = 30 * 24 * 3600; /* 30 jours (reconnu auto après 1ère connexion) */

function b64url(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlStr(str) { return b64url(new TextEncoder().encode(str)); }
function b64urlToStr(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return atob(s);
}
async function ssoHmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return b64url(new Uint8Array(sig));
}
async function ssoSign(secret, uid, name, cgu) {
  const payload = JSON.stringify({ u: uid, n: name, c: cgu ? 1 : 0, iat: Date.now(), exp: Date.now() + SSO_TTL * 1000 });
  const p = b64urlStr(payload);
  return p + '.' + (await ssoHmac(secret, p));
}
async function ssoVerify(secret, token) {
  if (!token || token.indexOf('.') < 0) return null;
  const dot = token.indexOf('.');
  const p = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expect = await ssoHmac(secret, p);
  if (sig.length !== expect.length) return null;
  let diff = 0; /* comparaison à temps constant */
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expect.charCodeAt(i);
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
async function handleSso(request, url, env) {
  const secret = env && env.KDMC_SSO_SECRET;
  const J = (o, setCookie) => new Response(JSON.stringify(o), {
    status: 200,
    headers: Object.assign(
      { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-kdmc-sso': '1' },
      setCookie ? { 'set-cookie': setCookie } : {},
    ),
  });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  /* Non configuré (secret absent) → fail-open : les apps gardent leur login. */
  if (!secret) return J({ ok: false, reason: 'sso_not_configured' });

  const path = url.pathname;
  if (path === '/__sso/whoami' && request.method === 'GET') {
    const s = await ssoVerify(secret, ssoCookie(request, SSO_COOKIE));
    return s ? J({ ok: true, uid: s.uid, name: s.name, cgu: s.cgu }) : J({ ok: false });
  }
  if (path === '/__sso/issue' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch { /* ignore */ }
    const uid = String(b.uid || '').slice(0, 80).trim();
    const name = String(b.name || '').slice(0, 80).trim();
    const cgu = !!b.cgu;
    if (!uid || !name) return J({ ok: false, reason: 'uid+name requis' });
    const token = await ssoSign(secret, uid, name, cgu);
    const cookie = `${SSO_COOKIE}=${token}; Domain=.kd-mc.com; Path=/; Max-Age=${SSO_TTL}; Secure; HttpOnly; SameSite=Lax`;
    return J({ ok: true, uid, name, cgu }, cookie);
  }
  if (path === '/__sso/logout' && request.method === 'POST') {
    const cookie = `${SSO_COOKIE}=; Domain=.kd-mc.com; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax`;
    return J({ ok: true }, cookie);
  }
  return J({ ok: false, reason: 'not_found' });
}
