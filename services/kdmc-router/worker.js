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

/* D'où viennent les pages. Historiquement GitHub Pages — mais le compte GitHub
   a été suspendu le 15/08/2026 et le support a refusé de lever la restriction,
   donc cette source peut disparaître pour de bon.
   Ces deux valeurs sont désormais RÉGLABLES depuis le tableau de bord
   Cloudflare (Variables du Worker), sans toucher au code ni redéployer :
     UPSTREAM_BASE   = https://mon-projet.pages.dev   (ex. Cloudflare Pages)
     UPSTREAM_PREFIX = ''                             (Pages sert à la racine)
   Basculer d'hébergeur devient un réglage à changer sur iPhone, pas une mise
   en ligne. Sans ces variables, le comportement d'avant est conservé. */
const UPSTREAM_DEFAUT = 'https://9r4rxssx64-creator.github.io';
const PAGES_PREFIX_DEFAUT = '/CMCteams';

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
  'arbre.kd-mc.com': '/CMCteams/arbre', // Arbre généalogique familial — protégé par code famille (Kevin 2026-08-03)
  'lingua.kd-mc.com': '/CMCteams/lingua', // KDMC Lingua — app d'apprentissage de langues (Kevin 2026-08-04)
  'studio.kd-mc.com': '/CMCteams/tools/crea-studio', // Créa Studio — montage vidéo + retouche photo (niveau Photoshop/GIMP) + dessin animé, 100% client-side (Kevin 2026-08-04)
  'cuisine.kd-mc.com': '/CMCteams/tools/cuisine', // Le Grand Répertoire de la Riviera — livre de cuisine numérique (Monaco/Riviera + Ligurie), 113+ recettes illustrées (Kevin 2026-08-13)
  'cocina.kd-mc.com': '/CMCteams/tools/cuisine',  // alias — même livre (Kevin 2026-08-13)
  'cujina.kd-mc.com': '/CMCteams/tools/cuisine',
  // Belles adresses des apps qui n'en avaient pas — Kevin 2026-08-13 « pourquoi les adresses
  // ne sont pas pareilles ». Règle KDMC_ADRESSES.md : UNE belle adresse par projet. Les
  // anciens chemins (kd-mc.com/worldmonitor…) restent valides : rien ne casse, on ajoute.
  'worldmonitor.kd-mc.com': '/CMCteams/kdmc-home/worldmonitor',
  'osint.kd-mc.com': '/CMCteams/kdmc-home/osint',
  'ia.kd-mc.com': '/CMCteams/kdmc-home/ia',
  'outils.kd-mc.com': '/CMCteams/kdmc-home/outils',
  // Portail boutiques : vivait SEULEMENT sur github.io (le portail y renvoyait en dur,
  // hors du domaine, en affichant « kd-mc.com → shops » — une adresse fausse).
  'shops.kd-mc.com': '/CMCteams/shops',  // « A Cüjina de Mùnegu » — adresse au nom monégasque correct/sourcé (Kevin 2026-08-13)
};

// Proxy MÊME ORIGINE vers l'API des décès INSEE (matchID) — données PUBLIQUES,
// lecture seule. L'API matchID ne renvoie PAS d'en-tête CORS → un appel direct
// depuis arbre.kd-mc.com est bloqué par le navigateur (Kevin « je ne vois rien »).
// Ici arbre.kd-mc.com/__deces?q=… reste same-origin → 0 CORS, marche sur iPhone.
async function handleDeces(request, url) {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': '*' };
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  const q = (url.searchParams.get('q') || '').trim();
  let size = parseInt(url.searchParams.get('size') || '25', 10); if (!(size > 0)) size = 25; if (size > 50) size = 50;
  if (q.length < 2) return new Response(JSON.stringify({ response: { persons: [] } }), { headers: { 'content-type': 'application/json', ...cors } });
  const api = 'https://deces.matchid.io/deces/api/v1/search?q=' + encodeURIComponent(q) + '&size=' + size;
  try {
    const r = await fetch(api, { headers: { accept: 'application/json' } });
    const body = await r.text();
    return new Response(body, { status: r.status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300', ...cors } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'proxy', message: String((e && e.message) || e) }), { status: 502, headers: { 'content-type': 'application/json', ...cors } });
  }
}

/* ===== ARBRE GÉNÉALOGIQUE — les DONNÉES sortent du fichier public (fait n°12, 5.09.2026) =====
   Avant : arbre/index.html (dépôt PUBLIC) embarquait ~100 personnes (noms, dates de
   naissance) ET l'empreinte du code famille comparée dans le navigateur → n'importe qui
   lisant le fichier avait les données, et l'empreinte donnait le chemin Firebase.
   Maintenant : le code se vérifie ICI (empreinte en KV, jamais dans le dépôt), et les
   données de départ (« seed ») ne sont servies qu'à qui prouve le code. Même origine
   (arbre.kd-mc.com/__arbre/…) → 0 CORS, iPhone OK. Préfixe KV `arbre:` (isolé).
   - POST /__arbre/unlock {hash}      → {ok, seed} · essais limités par IP (rlFail), journalisés
   - GET  /__arbre/seed  (x-arbre-code: hash) → {ok, seed, savedAt}
   - PUT  /__arbre/seed  {codehash?, persons, meta}  → ADMIN (grant /__admin/login) : publie
   - POST /__arbre/code  {old, new}   → rotation du code famille (preuve = ancien hash, ou admin)
   - GET  /__arbre/status             → {code:bool, seed:bool, count, savedAt} — aucun secret
   FAIL-OPEN côté app : l'app garde son contrôle local (empreinte mémorisée sur l'appareil)
   si le domaine est muet. FAIL-CLOSED ici : sans empreinte publiée → « code_non_publie ». */
const ARBRE_HEX64 = /^[a-f0-9]{64}$/;
function hexEq(a, b) {
  a = String(a || '').toLowerCase(); b = String(b || '').toLowerCase();
  if (!ARBRE_HEX64.test(a) || !ARBRE_HEX64.test(b)) return false;
  let d = 0; for (let i = 0; i < 64; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
async function arbreSeedOut(env) {
  let seed = null, meta = null;
  try { const raw = await env.ACCOUNTS.get('arbre:seed'); if (raw) seed = JSON.parse(raw); } catch { seed = null; }
  try { meta = JSON.parse((await env.ACCOUNTS.get('arbre:meta')) || 'null'); } catch { meta = null; }
  return { seed, savedAt: meta && meta.savedAt || 0, count: meta && meta.count || 0 };
}
async function handleArbre(request, url, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  const path = url.pathname;
  if (!env || !env.ACCOUNTS) return J({ ok: false, reason: 'kv_absent' });
  const stored = await env.ACCOUNTS.get('arbre:codehash');

  if (path === '/__arbre/status' && request.method === 'GET') {
    const m = await arbreSeedOut(env);
    return J({ ok: true, code: !!stored, seed: !!m.seed, count: m.count, savedAt: m.savedAt });
  }

  /* Publication (admin seulement) : l'app envoie SES données (texte, sans photos) + l'empreinte
     du code qu'elle connaît. C'est le seul chemin d'écriture des données. */
  if (path === '/__arbre/seed' && request.method === 'PUT') {
    const me = await adminSession(request, env);
    if (!me) return J({ ok: false, reason: (env.KDMC_ADMIN_PIN_SHA256 ? 'need_admin_code' : 'admin_only') }, null, 403);
    let b = {}; try { b = await request.json(); } catch { return J({ ok: false, reason: 'bad_json' }); }
    const persons = b && b.persons && typeof b.persons === 'object' ? b.persons : null;
    const count = persons ? Object.keys(persons).length : 0;
    if (!count) return J({ ok: false, reason: 'persons_vides' });
    const s = JSON.stringify({ persons, meta: b.meta && typeof b.meta === 'object' ? b.meta : {} });
    if (s.length > 5 * 1024 * 1024) return J({ ok: false, reason: 'trop_gros' });
    if (b.codehash != null && String(b.codehash) !== '') {
      const ch = String(b.codehash).toLowerCase();
      if (!ARBRE_HEX64.test(ch)) return J({ ok: false, reason: 'codehash_invalide' });
      await env.ACCOUNTS.put('arbre:codehash', ch);
    } else if (!stored) return J({ ok: false, reason: 'codehash_requis' });
    const savedAt = Date.now();
    await env.ACCOUNTS.put('arbre:seed', s);
    await env.ACCOUNTS.put('arbre:meta', JSON.stringify({ savedAt, count, size: s.length }));
    await audLog(env, { ev: 'arbre_seed_publish', count, size: s.length });
    return J({ ok: true, savedAt, count });
  }

  if (path === '/__arbre/unlock' && request.method === 'POST') {
    const ipHash = await sha256Hex((request.headers.get('CF-Connecting-IP') || '') + '|arbre-ul');
    const wait = await rlBlocked(env, ipHash);
    if (wait) return J({ ok: false, reason: 'rate_limited', wait });
    let b = {}; try { b = await request.json(); } catch { /* ignore */ }
    const hash = String(b.hash || '').trim().toLowerCase();
    if (!ARBRE_HEX64.test(hash)) return J({ ok: false, reason: 'hash_requis' });
    if (!stored) return J({ ok: false, reason: 'code_non_publie' });
    if (!hexEq(hash, stored)) { await rlFail(env, ipHash); await audLog(env, { ev: 'arbre_unlock_fail', ip: ipHash.slice(0, 12) }); return J({ ok: false, reason: 'code_invalide' }); }
    await rlReset(env, ipHash);
    await audLog(env, { ev: 'arbre_unlock_ok', ip: ipHash.slice(0, 12) });
    const m = await arbreSeedOut(env);
    return J({ ok: true, seed: m.seed, savedAt: m.savedAt });
  }

  if (path === '/__arbre/seed' && request.method === 'GET') {
    const hash = String(request.headers.get('x-arbre-code') || '').trim().toLowerCase();
    if (!stored) return J({ ok: false, reason: 'code_non_publie' });
    if (!hexEq(hash, stored)) return J({ ok: false, reason: 'code_invalide' }, null, 403);
    const m = await arbreSeedOut(env);
    return J({ ok: true, seed: m.seed, savedAt: m.savedAt });
  }

  /* Rotation du code famille : prouver l'ANCIEN (ou être admin). Le nouveau n'est jamais
     transmis en clair — seulement son empreinte, calculée sur l'appareil. */
  if (path === '/__arbre/code' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch { return J({ ok: false, reason: 'bad_json' }); }
    const nu = String(b.new || '').trim().toLowerCase();
    if (!ARBRE_HEX64.test(nu)) return J({ ok: false, reason: 'hash_requis' });
    const me = await adminSession(request, env);
    const old = String(b.old || '').trim().toLowerCase();
    if (!me) {
      if (!stored) return J({ ok: false, reason: 'code_non_publie' });
      const ipHash = await sha256Hex((request.headers.get('CF-Connecting-IP') || '') + '|arbre-ul');
      const wait = await rlBlocked(env, ipHash);
      if (wait) return J({ ok: false, reason: 'rate_limited', wait });
      if (!hexEq(old, stored)) { await rlFail(env, ipHash); return J({ ok: false, reason: 'code_invalide' }); }
    }
    await env.ACCOUNTS.put('arbre:codehash', nu);
    await audLog(env, { ev: 'arbre_code_rotate', by: me ? 'admin' : 'famille' });
    return J({ ok: true });
  }
  return J({ ok: false, reason: 'not_found' }, null, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    /* Source des pages : réglable sans redéploiement (cf. commentaire en tête). */
    const UPSTREAM = ((env && env.UPSTREAM_BASE) || UPSTREAM_DEFAUT).trim().replace(/\/+$/, '');
    /* ⚠️ Deux usages DIFFÉRENTS du préfixe, à ne pas confondre :
       - à l'ENTRÉE, les pages contiennent des liens en /CMCteams/… (c'est ainsi
         que GitHub Pages les a construites) → on reconnaît toujours
         PAGES_PREFIX_DEFAUT, quoi qu'il arrive ;
       - à la SORTIE, le nouvel hébergeur peut servir à la racine → on remplace
         alors ce préfixe par UPSTREAM_PREFIX (souvent vide).
       Utiliser une seule variable pour les deux ferait correspondre TOUTES les
       adresses dès que le préfixe est vide (p.startsWith('/') = toujours vrai). */
    /* .trim() : un tableau de bord n'accepte pas toujours un champ vide, et
       Kevin pourrait y mettre un espace. Sans nettoyage, le préfixe deviendrait
       « » et toutes les adresses seraient cassées. Une barre oblique finale est
       retirée aussi (« /kd-mc-sites/ » → « /kd-mc-sites »), sinon on obtient des
       doubles barres. */
    const PREFIX_SORTIE = (env && typeof env.UPSTREAM_PREFIX === 'string')
      ? env.UPSTREAM_PREFIX.trim().replace(/\/+$/, '')
      : PAGES_PREFIX_DEFAUT;

    // Recherche décès INSEE (proxy same-origin, public read-only) — pour l'arbre.
    if (url.pathname === '/__deces') return handleDeces(request, url);
    // Arbre : code famille vérifié ici + données servies à qui le prouve (fait n°12).
    if (url.pathname.startsWith('/__arbre/')) return handleArbre(request, url, env);

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
    // Mémoire cloud KDMC Lingua : sauvegarde/restauration de la progression par « clé
    // de compte » (hash nom+code = capacité). Données NON sensibles (XP/série/nom choisi).
    // ISOLÉ (préfixe KV lingua:), FAIL-OPEN (jamais throw → la mémoire locale reste).
    if (url.pathname.startsWith('/__lingua/')) return handleLingua(request, url, env);

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

    // Livre de cuisine « A Cüjina de Mùnegu » aussi accessible en CHEMIN du domaine
    // principal (Kevin 2026-08-13, « je dois pouvoir l'ouvrir même en 4G »). kd-mc.com
    // est déjà résolu par tous les réseaux/opérateurs → 0 attente de propagation DNS,
    // contrairement à un sous-domaine tout neuf (cujina/cocina). Chemins : /cujina,
    // /cuisine, /livre. Redirection vers le / final pour que les images relatives marchent.
    if ((host === 'kd-mc.com' || host === 'www.kd-mc.com')) {
      if (/^\/(cujina|cuisine|livre)$/.test(p)) return Response.redirect('https://' + host + p + '/', 301);
      const cm = p.match(/^\/(cujina|cuisine|livre)(\/.*)?$/);
      if (cm) {
        const rest = cm[2] || '/';
        const upstreamUrl2 = UPSTREAM + '/CMCteams/tools/cuisine' + rest + url.search;
        const rh2 = new Headers(request.headers); rh2.delete('host');
        const res2 = await fetch(new Request(upstreamUrl2, {
          method: request.method, headers: rh2,
          body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
          redirect: 'manual',
        }));
        const oh2 = new Headers(res2.headers);
        oh2.set('x-kdmc-router', host + ' (cuisine-path)');
        if (!oh2.has('x-content-type-options')) oh2.set('x-content-type-options', 'nosniff');
        if (!oh2.has('x-frame-options')) oh2.set('x-frame-options', 'SAMEORIGIN');
        if (!oh2.has('strict-transport-security')) oh2.set('strict-transport-security', 'max-age=31536000; includeSubDomains');
        return new Response(res2.body, { status: res2.status, statusText: res2.statusText, headers: oh2 });
      }
    }

    let upstreamPath;
    if (p === '/' || p === '') upstreamPath = base + '/';
    else if (p.startsWith(PAGES_PREFIX_DEFAUT + '/')) upstreamPath = p;
    else upstreamPath = base + p;
    /* Bascule d'hébergeur : on retire le préfixe /CMCteams si la nouvelle
       source sert à la racine (Cloudflare Pages, par exemple). */
    if (PREFIX_SORTIE !== PAGES_PREFIX_DEFAUT && upstreamPath.startsWith(PAGES_PREFIX_DEFAUT + '/')) {
      upstreamPath = PREFIX_SORTIE + upstreamPath.slice(PAGES_PREFIX_DEFAUT.length);
    }

    const upstreamUrl = UPSTREAM + upstreamPath + url.search;
    const reqHeaders = new Headers(request.headers);
    reqHeaders.delete('host');
    const upstreamReq = new Request(upstreamUrl, {
      method: request.method,
      headers: reqHeaders,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
    });
    let res;
    try {
      res = await fetch(upstreamReq);
    } catch (e) {
      res = new Response('upstream injoignable', { status: 502 });
    }
    /* ---- BOUÉE DE SECOURS (Kevin 2026-08-14) --------------------------------
       Le compte GitHub a été suspendu → GitHub Pages s'est éteint et les 20
       sous-domaines renvoyaient 404 (« 404 » constaté par Kevin sur iPhone).
       Si une COPIE des pages a été embarquée dans le Worker (binding ASSETS,
       cf. prepare-secours.mjs), on la sert au lieu de la page morte.
       Ce repli ne se déclenche QUE sur échec de l'amont : dès que GitHub
       revient, le comportement est identique à avant, sans rien remettre. */
    if (env && env.ASSETS && (res.status === 404 || res.status === 403 || res.status >= 500)) {
      try {
        const local = new Request(new URL(upstreamPath, url.origin).toString(), { method: 'GET', headers: request.headers });
        let secours = await env.ASSETS.fetch(local);
        /* Un dossier sans fichier exact → on tente son index.html (le
           comportement de GitHub Pages, qu'on doit reproduire fidèlement). */
        if (!secours.ok && !/\.[a-z0-9]{2,5}$/i.test(upstreamPath)) {
          const avecIndex = upstreamPath.replace(/\/?$/, '/') + 'index.html';
          secours = await env.ASSETS.fetch(new Request(new URL(avecIndex, url.origin).toString(), { method: 'GET', headers: request.headers }));
        }
        if (secours.ok) {
          const hs = new Headers(secours.headers);
          hs.set('x-kdmc-secours', 'assets');   /* honnêteté : on DIT que c'est la copie */
          res = new Response(secours.body, { status: 200, headers: hs });
        }
      } catch (e) { /* le secours ne doit JAMAIS aggraver : on garde la réponse d'origine */ }
    }
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
  /* Cron 5 min (wrangler.toml [triggers]) : sentinelle « robot en surface » — no-op tant
     que Tuya n'est pas lié ; notifie Kevin à CHAQUE remontée du robot (transition seule). */
  async scheduled(event, env, ctx) { ctx.waitUntil(Promise.all([tuyaSurfaceCheck(env), tuyaScheduleTick(env), tuyaHistoryTick(env)])); },
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

/* ===== Mémoire cloud KDMC Lingua (progression apprenants) =====
   Stocke/restaure un blob par « clé de compte » = hash(nom+code) fourni par le client
   (accès par CAPACITÉ : il faut connaître nom+code). Données NON sensibles (XP, série,
   prénom choisi). Isolé par préfixe KV `lingua:`. FAIL-OPEN : ne jette jamais → si KV
   absent/erreur, l'app garde sa mémoire locale. Même origine (lingua.kd-mc.com) mais on
   autorise le CORS en lecture large (endpoints par capacité, non sensibles). */
async function handleLingua(request, url, env) {
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type' };
  const JL = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: Object.assign({ 'content-type': 'application/json', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }, cors) });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (!env || !env.ACCOUNTS) return JL({ ok: false, reason: 'kv_absent' }); // fail-open (200)
  try {
    const okKey = (k) => /^[a-f0-9]{16,64}$/.test(k);
    if (url.pathname === '/__lingua/load' && request.method === 'GET') {
      const k = url.searchParams.get('k') || '';
      if (!okKey(k)) return JL({ ok: false, reason: 'bad_key' }, 400);
      const blob = await env.ACCOUNTS.get('lingua:' + k);
      return JL({ ok: true, data: blob ? JSON.parse(blob) : null });
    }
    if (url.pathname === '/__lingua/save' && request.method === 'POST') {
      let b; try { b = await request.json(); } catch { return JL({ ok: false, reason: 'bad_json' }, 400); }
      const k = String(b && b.k || '');
      if (!okKey(k)) return JL({ ok: false, reason: 'bad_key' }, 400);
      const s = JSON.stringify(b && b.data || {});
      if (s.length > 200000) return JL({ ok: false, reason: 'too_big' }, 413);
      await env.ACCOUNTS.put('lingua:' + k, s, { expirationTtl: 60 * 60 * 24 * 400 }); // ~400 j, renouvelé à chaque save
      return JL({ ok: true });
    }
    // Voix naturelle : synthèse OpenAI TTS, mise en CACHE KV (1 mot = 1 synthèse à vie).
    // FAIL-OPEN : si clé absente ou erreur → le client repasse en voix navigateur.
    if (url.pathname === '/__lingua/tts' && request.method === 'GET') {
      /* Kevin 2026-08-08 « elle ne lit pas toute la phrase, s'arrête avant la fin » :
         la limite 200 coupait les textes longs (réponse du Coach, explications) au milieu.
         1000 couvre tout le contenu de l'app ; tts-1 accepte jusqu'à 4096, et l'URL GET
         reste largement sous les limites Workers/CDN. */
      const text = (url.searchParams.get('t') || '').slice(0, 1000);
      /* Kevin 2026-08-11 « la voix est trop robot » : les 6 voix historiques marchent sur les
         DEUX moteurs ; les 5 voix « HD » (coral, sage, ash, ballad, verse) n'existent QUE sur
         gpt-4o-mini-tts → REPLI obligatoire vers leur cousine tts-1, sinon OpenAI répond 400. */
      const VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
      const VOIX_HD = { coral: 'nova', sage: 'shimmer', ash: 'onyx', ballad: 'fable', verse: 'echo' };
      let voice = (url.searchParams.get('v') || 'nova').toLowerCase();
      const isAntonin = voice === 'antonin'; // 🎙️ vraie voix CLONÉE d'Antonin (Kevin a validé à l'oreille)
      if (!isAntonin && VOICES.indexOf(voice) < 0 && !VOIX_HD[voice]) voice = 'nova';
      // Vitesse de GÉNÉRATION (0.25–2) : permet la voix « fillette » — générée lente puis
      // accélérée côté client (pitch monte, tempo net redevient normal). Clampée + cachée à part.
      let speed = parseFloat(url.searchParams.get('s') || '1');
      if (!(speed >= 0.25 && speed <= 2)) speed = 1;
      speed = Math.round(speed * 100) / 100;
      if (!text.trim()) return JL({ ok: false, reason: 'no_text' }, 400);
      const audioHdr = Object.assign({ 'content-type': 'audio/mpeg', 'cache-control': 'public, max-age=31536000' }, cors);
      const hashOf = async (s) => { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
        return Array.prototype.map.call(new Uint8Array(b), (x) => ('0' + x.toString(16)).slice(-2)).join(''); };
      /* 🎙️ ANTONIN — voix clonée via Replicate (minimax/speech-02-hd, voice_id du clone).
         Cache KV : 1 phrase = 1 génération à vie. FAIL-OPEN : si clé absente / Replicate KO,
         on retombe sur onyx (voix d'homme proche) SANS jamais cacher le repli sous la clé
         Antonin (sinon une panne passagère collerait la mauvaise voix pour toujours). */
      if (isAntonin) {
        const aSpeed = Math.max(0.5, speed); // MiniMax accepte 0.5–2 (OpenAI descend à 0.25)
        const akey = 'ltts:' + (await hashOf('antonin:' + aSpeed + ':' + text));
        const acached = await env.ACCOUNTS.get(akey, 'arrayBuffer');
        if (acached) return new Response(acached, { status: 200, headers: audioHdr });
        if (env.AX_REPLICATE_KEY) {
          try {
            const rp = await fetch('https://api.replicate.com/v1/models/minimax/speech-02-hd/predictions', {
              method: 'POST',
              headers: { 'authorization': 'Bearer ' + env.AX_REPLICATE_KEY, 'content-type': 'application/json', 'prefer': 'wait' },
              body: JSON.stringify({ input: { text: text, voice_id: env.ANTONIN_VOICE_ID || 'R8_QFPX9IXV', speed: aSpeed } }),
            });
            const j = await rp.json().catch(() => null);
            const out = j && (typeof j.output === 'string' ? j.output : (Array.isArray(j.output) ? j.output[0] : null));
            if (rp.ok && j && j.status === 'succeeded' && out) {
              const af = await fetch(out);
              if (af.ok) {
                const abuf = await af.arrayBuffer();
                try { await env.ACCOUNTS.put(akey, abuf, { expirationTtl: 60 * 60 * 24 * 400 }); } catch (_) { /* best-effort */ }
                return new Response(abuf, { status: 200, headers: audioHdr });
              }
            }
          } catch (_) { /* fail-open → onyx ci-dessous */ }
        }
        voice = 'onyx'; // repli honnête : voix d'homme OpenAI, cachée sous SA clé onyx (jamais sous Antonin)
      }
      /* 🗣️ MOTEUR DE VOIX — Kevin 2026-08-11 : « la voix est trop robot, dur de comprendre ».
         Cause mesurée : on synthétisait avec « tts-1 », le plus ancien moteur OpenAI. On passe
         à gpt-4o-mini-tts, nettement plus humain, PLUS une consigne de jeu (« instructions »)
         qui n'existe que sur ce moteur : ton chaleureux de prof, articulation nette.
         GARDE-FOU : la vitesse (bouton 🐢 Lent, syllabes) n'est fiable que sur tts-1 → dès que
         la vitesse n'est pas normale, on RESTE sur tts-1. Le 🐢 continue donc de marcher.
         REPLI : si le nouveau moteur refuse (modèle/voix/quota), on refait avec tts-1 → jamais
         de silence. La CLÉ DE CACHE contient le moteur : sans ça, tous les mots déjà entendus
         resteraient servis dans leur ancienne version robotique — Kevin n'entendrait AUCUN
         changement (c'est le piège classique du cache). */
      const HD_MODELE = 'gpt-4o-mini-tts';
      const HD_CONSIGNE = "Voix humaine et chaleureuse de professeur de langue : articulation nette, rythme posé et naturel, ton bienveillant, jamais robotique. Prononce le texte dans sa propre langue, avec l'accent d'un locuteur natif.";
      const hd = speed === 1;                       // vitesse normale → nouveau moteur
      const modele = hd ? HD_MODELE : 'tts-1';
      const voixPour = (m) => (m === 'tts-1' && VOIX_HD[voice]) ? VOIX_HD[voice] : voice;
      const cle = async (m) => 'ltts:' + (await hashOf(m + ':' + voixPour(m) + ':' + speed + ':' + text));
      const ckey = await cle(modele);
      const cached = await env.ACCOUNTS.get(ckey, 'arrayBuffer');
      if (cached) return new Response(cached, { status: 200, headers: audioHdr });
      if (!env.OPEN_AI_API_KEY) return JL({ ok: false, reason: 'tts_absent' }); // fail-open (200) → repli navigateur
      const synth = async (m) => {
        const corps = { model: m, voice: voixPour(m), input: text, response_format: 'mp3' };
        if (m === HD_MODELE) corps.instructions = HD_CONSIGNE; else corps.speed = speed;
        return fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: { 'authorization': 'Bearer ' + env.OPEN_AI_API_KEY, 'content-type': 'application/json' },
          body: JSON.stringify(corps),
        });
      };
      let mUse = modele, rr = await synth(mUse);
      if (!rr.ok && mUse === HD_MODELE) { mUse = 'tts-1'; rr = await synth(mUse); } // repli honnête, jamais de silence
      if (!rr.ok) return JL({ ok: false, reason: 'tts_err', status: rr.status }); // fail-open (200)
      const buf = await rr.arrayBuffer();
      try { await env.ACCOUNTS.put(await cle(mUse), buf, { expirationTtl: 60 * 60 * 24 * 400 }); } catch (_) { /* cache best-effort */ }
      return new Response(buf, { status: 200, headers: audioHdr });
    }
    // Mode « APPEL EN DIRECT » (voix-à-voix temps réel) : on frappe un JETON ÉPHÉMÈRE OpenAI Realtime
    // côté serveur (la vraie clé ne quitte jamais le worker) ; le navigateur ouvre ensuite la WebRTC
    // avec ce jeton court. FAIL-OPEN : si pas de clé / erreur, on renvoie ok:false → repli conversation normale.
    if (url.pathname === '/__lingua/rt-session' && request.method === 'POST') {
      if (!env.OPEN_AI_API_KEY) return JL({ ok: false, reason: 'no_key' });
      let b = {}; try { b = await request.json(); } catch (_) { /* corps optionnel */ }
      const langName = String((b && b.langName) || 'la langue cible').slice(0, 40);
      const level = String((b && b.level) || 'Débutant').slice(0, 30);
      const model = env.OPENAI_REALTIME_MODEL || 'gpt-realtime';
      const voice = env.OPENAI_REALTIME_VOICE || 'coral';
      const instructions = 'Tu es Bee, une abeille tutrice de ' + langName + ' chaleureuse et vivante, pour un francophone (niveau ' + level + '). '
        + 'Conversation ORALE naturelle, phrases COURTES. Parle surtout en ' + langName + ' ; reviens au français seulement si l\'apprenant bloque. '
        + 'Suis le sujet qu\'il lance (tout thème), réagis comme une vraie amie, puis relance par une petite question. '
        + 'Corrige ses fautes EN DOUCEUR : reformule correctement puis explique en une phrase simple en français. Reste encourageante.';
      try {
        // API Realtime GA : jeton éphémère via /v1/realtime/client_secrets (l'ancien /sessions a disparu).
        const rr = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
          method: 'POST', headers: { authorization: 'Bearer ' + env.OPEN_AI_API_KEY, 'content-type': 'application/json' },
          body: JSON.stringify({ session: { type: 'realtime', model, instructions, audio: { output: { voice } } } }),
        });
        const j = await rr.json().catch(() => null);
        const secret = j && (j.value || (j.client_secret && j.client_secret.value)); // GA: {value}; compat ancien {client_secret:{value}}
        if (!rr.ok || !secret) return JL({ ok: false, reason: 'openai_error', detail: (j && j.error && j.error.message) || ('http ' + rr.status) });
        return JL({ ok: true, client_secret: secret, expires_at: (j.expires_at) || (j.client_secret && j.client_secret.expires_at) || 0, model });
      } catch (e) { return JL({ ok: false, reason: 'error', detail: String((e && e.message) || e).slice(0, 120) }); }
    }
    // Coach IA (conversation) : IA gratuite via clé serveur (jamais exposée). FAIL-OPEN.
    if (url.pathname === '/__lingua/ai' && request.method === 'POST') {
      let b; try { b = await request.json(); } catch { return JL({ ok: false, reason: 'bad_json' }, 400); }
      const langName = String((b && b.langName) || 'la langue cible').slice(0, 40);
      const level = String((b && b.level) || 'Débutant').slice(0, 30);
      const lvi = Math.max(0, Math.min(4, parseInt((b && b.levelIndex), 10) || 0));
      const weak = Array.isArray(b && b.weak) ? b.weak.slice(0, 15).map((x) => String(x).slice(0, 60)) : [];
      const scenario = String((b && b.scenario) || '').slice(0, 120); // jeu de rôle (scène originale choisie côté app)
      const msgs = Array.isArray(b && b.messages) ? b.messages.slice(-12) : [];
      const share = ['surtout en français, avec seulement quelques mots simples de ' + langName,
                     'moitié français, moitié ' + langName + ' (phrases très simples)',
                     'surtout en ' + langName + ', et en français uniquement si besoin',
                     'presque entièrement en ' + langName,
                     'entièrement en ' + langName][lvi];
      const sys = 'Tu es un professeur de ' + langName + ' expert et bienveillant, spécialisé dans l\'enseignement aux francophones, 20 ans d\'expérience. '
        + "Niveau actuel de l'apprenant : " + level + '. Parle ' + share + '. '
        + 'Style : conversation orale NATURELLE, réponses COURTES (1 à 4 phrases), chaleureuses, jamais scolaires ni robotiques. '
        + "Fais parler l'apprenant : termine presque toujours par une petite question adaptée à son niveau. "
        + (!scenario ? ("CONVERSATION LIBRE IMPROVISÉE : c'est l'apprenant qui mène. Suis le SUJET QU'IL LANCE, quel qu'il soit (son week-end, un film, le travail, l'actualité, un souvenir, un rêve, une opinion, la cuisine, le sport, ses projets, la philosophie… absolument tout) et RESTE dessus tant qu'il l'anime — ne le ramène JAMAIS de force à une leçon. Réagis d'abord comme un vrai ami natif : intérêt sincère, une petite réaction ou un avis personnel court, rebondis sur un détail précis qu'il vient de dire, puis relance par une question qui APPROFONDIT (va plus loin : le pourquoi, un exemple, un ressenti, une suite). S'il change de thème, enchaîne naturellement sans résister. Objectif : un vrai échange vivant et spontané, pas un questionnaire ni une interrogation scolaire. ") : '')
        + "CORRECTION EXPERTE ET DOUCE : si l'apprenant fait une faute (grammaire, orthographe, conjugaison, syntaxe, accord, genre, préposition, temps), reformule d'abord correctement de façon naturelle, puis explique l'erreur en UNE phrase simple en français, sans le décourager ; valorise ce qui est juste. "
        + "Enseigne la langue VIVANTE : au bon moment, glisse une expression idiomatique, une tournure familière ou un mot de jargon courant, en précisant le registre (familier / courant / soutenu) et quand l'employer. "
        + "Progression : introduis peu à peu du vocabulaire et des structures un cran au-dessus de son niveau pour le tirer vers le haut, sans le noyer. Objectif : l'amener au BILINGUE, pas à pas. "
        + (weak.length ? ('Points à retravailler en priorité avec lui : ' + weak.join(', ') + '. ') : '')
        + (scenario ? ("JEU DE RÔLE : joue la scène suivante avec l'apprenant et RESTE DANS TON PERSONNAGE du début à la fin : " + scenario + ". C'est TOI qui joues l'autre rôle de la scène (pas le professeur), en " + langName + " selon le dosage indiqué. Ouvre la scène toi-même par une première réplique courte et naturelle. Les corrections restent douces et en une phrase, glissées sans casser la scène. ") : '')
        /* Kevin 2026-08-11 : « le coach n'est pas au point, il donne les réponses, demande de
           remplir un mot dans un texte mais on peut pas écrire dessus ». Trois règles dures :
           une seule question à la fois, JAMAIS la réponse avant l'essai, et le format ___ que
           l'application transforme en vraie case à remplir. */
        + "EXERCICES — RÈGLES ABSOLUES : (1) UNE SEULE question ou phrase à la fois, jamais une liste de 2, 3 ou 4 exercices d'un coup ; "
        + "(2) ne DONNE JAMAIS la réponse dans le message où tu poses la question — tu attends la réponse de l'apprenant, même s'il se trompe ou s'il ne répond pas ; ne mets ni la solution, ni un exemple qui la contient, ni un indice qui la révèle ; "
        + "(3) pour un mot à compléter, écris la phrase avec exactement trois tirets bas ___ à l'endroit du mot manquant (l'application les transforme en case à remplir) ; un seul ___ par phrase, et jamais de ___ dans une phrase d'exemple déjà corrigée ; "
        /* Vu EN VRAI le 2026-08-11 sur le domaine : le coach proposait « J'ai ___ mon sac à dos »
           à quelqu'un qui apprend l'anglais. Un trou dans une phrase FRANÇAISE n'enseigne rien
           de la langue étudiée. La phrase de l'exercice est TOUJOURS dans la langue apprise. */
        + "(3 bis) la phrase de l'exercice est TOUJOURS écrite en " + langName + " — jamais en français : un trou dans une phrase française n'apprend rien de " + langName + ". Seule ta consigne autour peut être en français ; "
        + "(3 ter) va droit au but : quand l'apprenant demande un exercice, donne-le tout de suite, sans enchaîner d'abord plusieurs questions de politesse ; "
        + "(4) quand il a répondu : dis d'abord si c'est juste, donne la forme correcte, explique en UNE phrase, puis propose la phrase SUIVANTE avec un nouveau ___. "
        + "N'utilise ni listes à puces ni titres : reste dans le style d'un vrai échange, avec une orthographe et une ponctuation irréprochables dans les deux langues.";
      const chat = [{ role: 'system', content: sys }].concat(msgs.map((m) => ({ role: (m && m.role === 'user') ? 'user' : 'assistant', content: String((m && m.text) || '').slice(0, 500) })));
      if (!chat.some((m) => m.role === 'user')) chat.push({ role: 'user', content: 'Bonjour !' });
      if (env.GROQ_API_KEY) {
        try {
          const rr = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST', headers: { 'authorization': 'Bearer ' + env.GROQ_API_KEY, 'content-type': 'application/json' },
            body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: chat, max_tokens: 300, temperature: 0.75 }),
          });
          if (rr.ok) { const j = await rr.json(); const reply = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content; if (reply) return JL({ ok: true, reply: String(reply).trim(), by: 'groq' }); }
        } catch (_) { /* repli */ }
      }
      if (env.MISTRAL_API_KEY) {
        try {
          const rr = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST', headers: { 'authorization': 'Bearer ' + env.MISTRAL_API_KEY, 'content-type': 'application/json' },
            body: JSON.stringify({ model: 'mistral-small-latest', messages: chat, max_tokens: 300, temperature: 0.75 }),
          });
          if (rr.ok) { const j = await rr.json(); const reply = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content; if (reply) return JL({ ok: true, reply: String(reply).trim(), by: 'mistral' }); }
        } catch (_) { /* repli */ }
      }
      if (env.GEMINI_API_KEY) {
        try {
          const contents = chat.filter((m) => m.role !== 'system').map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }));
          const rr = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + env.GEMINI_API_KEY, {
            method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ system_instruction: { parts: [{ text: sys }] }, contents: contents, generationConfig: { maxOutputTokens: 300, temperature: 0.75 } }),
          });
          if (rr.ok) { const j = await rr.json(); const reply = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts[0] && j.candidates[0].content.parts[0].text; if (reply) return JL({ ok: true, reply: String(reply).trim(), by: 'gemini' }); }
        } catch (_) { /* repli */ }
      }
      return JL({ ok: false, reason: 'ai_absent' }); // aucune clé/erreur → message hors-ligne côté client (fail-open)
    }
    return JL({ ok: false, reason: 'bad_route' }, 404);
  } catch (e) {
    return JL({ ok: false, reason: 'error', detail: String((e && e.message) || e).slice(0, 120) }); // fail-open (200)
  }
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

/* ===== COMPTE UNIQUE PAR PERSONNE (Kevin 2026-08-05 : « Je ne veux pas plusieurs
   comptes, qu'ils soient tous reliés à mon compte admin ») =====
   CAUSE RACINE : /__sso/issue accepte l'uid envoyé par CHAQUE app (CMCteams → U11804,
   Apex → kdmc_admin, Lingua → lingua_xxx…) → une fiche par app pour la MÊME personne,
   donc des connexions éparpillées (« 2 » affichées au lieu de ~191).
   RÈGLE ABSOLUE déjà écrite dans CLAUDE.md (« COMPTE ADMIN UNIQUE KEVIN ») : tous les
   alias de Kevin désignent UN SEUL compte. On applique la même idée à la fiche. */
const CANON_UID = 'kdmc_admin';
/* Intervalle de re-passage de la fusion « un compte par personne ». Une fusion
   DÉFINITIVE laisse passer les doublons créés ensuite (constaté en vrai) → on repasse. */
const MERGE_RESCAN_MS = 7 * 24 * 60 * 60 * 1000;
function normName(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}
/* Le nom est-il celui de l'admin ? Exige 2 tokens OU un alias explicite — jamais un
   prénom seul auto-déclaré (règle « login = prénom + nom », leçon #99 : un nom
   auto-déclaré n'accorde AUCUN droit ; ici il ne fait que RANGER la fiche au bon
   endroit, il ne donne aucun privilège). */
function isAdminName(name) {
  const n = normName(name);
  if (!n) return false;
  if (n === 'kdmc' || n === 'kdmc admin') return true;
  const t = n.split(' ').filter(Boolean);
  /* Le NOM DE FAMILLE seul ne suffit PAS : « Ronan Desarzens » est quelqu'un d'autre.
     Il faut le nom de famille ET le prénom (ou son initiale) — « Desarzens K » compte. */
  return t.indexOf('desarzens') >= 0 && t.some((x) => x === 'kevin' || x === 'k');
}
/* Identifiant CANONIQUE : toutes les fiches d'une même personne pointent vers un
   seul dossier. Ne change JAMAIS l'uid de session (les apps s'en servent pour leur
   propre logique) — uniquement l'endroit où le dossier est rangé.
   Kevin 2026-08-05 : « Personne ne doit avoir plusieurs comptes. Un compte par
   personne » → la règle vaut pour TOUT LE MONDE, pas seulement l'admin.
   Annuaire `nm:<prénom nom>` → uid canonique : le PREMIER identifiant vu pour un nom
   complet devient le dossier de cette personne ; tous les suivants y sont rattachés.
   EXIGE 2 mots (prénom + nom) — même règle que la connexion : un prénom seul ne
   regroupe rien (sinon tous les « Marie » finiraient dans le même dossier). */
async function canonFor(env, uid, name) {
  if (uid === CANON_UID) return uid;
  if (isAdminName(name)) return CANON_UID;
  if (!env || !env.ACCOUNTS) return uid;
  const n = normName(name);
  if (n.split(' ').filter(Boolean).length < 2) return uid;
  try {
    const cur = await env.ACCOUNTS.get('nm:' + n);
    if (cur) return cur;
    await env.ACCOUNTS.put('nm:' + n, uid);
  } catch { /* fail-open : au pire on garde l'uid d'origine */ }
  return uid;
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
/* Lecture FINE de l'appareil depuis l'User-Agent : modèle, OS + version, navigateur
   + version. Côté SERVEUR → ni CSP ni bloqueur ne peut l'empêcher, et ça marche même
   si l'app ne coopère pas. Tolérant : tout champ inconnu reste vide (jamais d'erreur). */
function uaParse(ua) {
  const s = String(ua || '');
  let model = 'Autre';
  if (/iPhone/i.test(s)) model = 'iPhone';
  else if (/iPad/i.test(s)) model = 'iPad';
  else if (/Android/i.test(s)) { const m = s.match(/;\s*([^;()]+?)\s*(?:Build\/|\))/); model = (m && m[1] && m[1].trim()) || 'Android'; }
  else if (/Macintosh|Mac OS X/i.test(s)) model = 'Mac';
  else if (/Windows/i.test(s)) model = 'PC Windows';
  else if (/Linux/i.test(s)) model = 'Linux';
  let os = '', osv = '', m;
  if ((m = s.match(/(?:iPhone |CPU )?OS (\d+[._]\d+)/))) { os = 'iOS'; osv = m[1].replace(/_/g, '.'); }
  else if ((m = s.match(/Android (\d+(?:\.\d+)?)/))) { os = 'Android'; osv = m[1]; }
  else if ((m = s.match(/Mac OS X (\d+[._]\d+)/))) { os = 'macOS'; osv = m[1].replace(/_/g, '.'); }
  else if (/Windows NT 10/.test(s)) { os = 'Windows'; osv = '10/11'; }
  else if (/Windows/i.test(s)) { os = 'Windows'; }
  else if (/Linux/i.test(s)) { os = 'Linux'; }
  let br = '', brv = '';
  if ((m = s.match(/Edg\/(\d+)/))) { br = 'Edge'; brv = m[1]; }
  else if ((m = s.match(/OPR\/(\d+)/))) { br = 'Opera'; brv = m[1]; }
  else if (/Chrome\//.test(s) && !/Edg\//.test(s)) { m = s.match(/Chrome\/(\d+)/); br = 'Chrome'; brv = m ? m[1] : ''; }
  else if ((m = s.match(/Firefox\/(\d+)/))) { br = 'Firefox'; brv = m[1]; }
  else if ((m = s.match(/Version\/(\d+)[^)]*Safari/))) { br = 'Safari'; brv = m[1]; }
  else if (/Safari/i.test(s)) { br = 'Safari'; }
  return { model, os, osv, br, brv };
}
/* Opérateur/hébergeur → distingue 4G, box maison, WiFi public… et signale un
   VPN/serveur (quelqu'un qui masque sa provenance). Signal de sécurité utile. */
function ispInfo(cf) {
  const isp = String((cf && cf.asOrganization) || '');
  const vpn = /vpn|proxy|host|server|cloud|data ?cent|ovh|hetzner|digitalocean|linode|vultr|amazon|aws|google|azure|m247|nordvpn|surfshark|expressvpn|mullvad|cloudflare warp/i.test(isp);
  return { isp, vpn };
}
/* Enrichit (ou crée) la fiche à chaque connexion : MAX de renseignements. */
async function enrich(env, request, uid, name, cgu, pre) {
  if (!env || !env.ACCOUNTS) return;
  /* Toutes les apps de la même personne alimentent UN SEUL dossier. */
  const inUid = uid;
  uid = await canonFor(env, uid, name);
  if (uid !== inUid) pre = undefined; /* la fiche préchargée était celle de l'ancien uid */
  const cf = request.cf || {};
  const ipHash = await sha256Hex((request.headers.get('CF-Connecting-IP') || '') + '|kdmc');
  const ua = request.headers.get('user-agent') || '';
  const device = /mobile|iphone|android/i.test(ua) ? 'mobile' : 'desktop';
  const os = /iphone|ipad|ios/i.test(ua) ? 'iOS' : /android/i.test(ua) ? 'Android' : /mac/i.test(ua) ? 'macOS' : /windows/i.test(ua) ? 'Windows' : /linux/i.test(ua) ? 'Linux' : '';
  /* Détail « espion » : modèle + versions + opérateur + géo fine + fuseau. */
  const D = uaParse(ua);
  const NET = ispInfo(cf);
  const devFull = [D.model, D.os + (D.osv ? ' ' + D.osv : ''), D.br + (D.brv ? ' ' + D.brv : '')].filter(function (x) { return x && x.trim(); }).join(' · ');
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
  acc.last_device = devFull || (device + (os ? ' · ' + os : ''));
  acc.last_app = host || acc.last_app || '';
  /* Renseignements fins conservés sur la fiche (dernier état connu). */
  acc.last_isp = NET.isp; acc.last_vpn = !!NET.vpn;
  acc.last_tz = cf.timezone || acc.last_tz || '';
  acc.last_geo = { city: cf.city || '', postal: cf.postalCode || '', lat: cf.latitude || '', lon: cf.longitude || '' };
  /* MAX DE RENSEIGNEMENTS — tout ce que le réseau nous donne déjà, gratuitement,
     côté serveur (impossible à bloquer par le navigateur ou un bloqueur de pub). */
  acc.last_lang = (request.headers.get('accept-language') || '').split(',')[0].trim().slice(0, 12) || acc.last_lang || '';
  acc.last_net = {
    asn: cf.asn || '', colo: cf.colo || '', continent: cf.continent || '',
    region: cf.regionCode || '', http: cf.httpProtocol || '', tls: cf.tlsVersion || '',
  };
  /* Par où il est entré (app d'origine) et sur quelle page il est tombé. */
  try {
    const ref = request.headers.get('referer') || '';
    acc.last_from = ref ? new URL(ref).hostname : acc.last_from || '';
  } catch { /* referer illisible */ }
  try { acc.last_path = new URL(request.url).pathname.slice(0, 80) || acc.last_path || ''; } catch { /* url illisible */ }
  /* RYTHME : à quelles heures cette personne se connecte (histogramme 24 h, cumulatif). */
  acc.hours = acc.hours || {};
  const hh = String(new Date(now).getUTCHours());
  acc.hours[hh] = (acc.hours[hh] || 0) + 1;
  /* devKey VOLONTAIREMENT sans version : sinon chaque mise à jour d'iOS/navigateur
     compterait comme un « nouvel appareil » → alerte push à chaque update (spam). */
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
    const prevLast = a.last || 0;
    const cont = a.sessions > 0 && (now - prevLast) <= SESSION_GAP; /* session encore en cours ? */
    a.last = now;
    let cur = null; /* la session la plus récente pour CE site */
    for (let i = 0; i < acc.history.length; i++) { if (acc.history[i].app === host) { cur = acc.history[i]; break; } }
    if (cont && cur) {
      cur.end = now; /* prolonge la session ouverte → la durée grandit */
      /* TEMPS CUMULÉ réellement passé sur cette app (somme des prolongations). */
      a.ms = (a.ms || 0) + Math.max(0, now - prevLast);
    } else {
      a.sessions = (a.sessions || 0) + 1;
      acc.hits = (acc.hits || 0) + 1;
      /* Chaque session garde SON contexte (appareil détaillé, opérateur, VPN, coords)
         → on voit l'évolution dans le temps, pas seulement le dernier état. */
      acc.history.unshift({
        ts: now, end: now, app: host, device: devKey, place: place,
        dev: devFull, isp: NET.isp, vpn: NET.vpn ? 1 : 0,
        lat: cf.latitude || '', lon: cf.longitude || '', tz: cf.timezone || '',
      });
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
  /* Fusion AUTOMATIQUE des fiches éparpillées, sans aucune action de Kevin. Rien n'est
     perdu : les connexions s'additionnent, les historiques se concatènent, appareils/
     lieux/apps s'unissent. L'ancienne fiche n'est pas effacée : elle devient un renvoi.
     MESURÉ le 2026-08-06 : deux fiches « kevin Desarzens » (196 + 116 connexions)
     coexistaient encore — parce que le drapeau `merged_v1` était DÉFINITIF : une fiche
     en double apparue APRÈS la première fusion n'était plus jamais absorbée. On repasse
     donc régulièrement (au plus 1×/semaine par dossier, coût négligeable) au lieu d'une
     seule fois. Les dossiers déjà fusionnés (merged_v1 sans date) repassent une fois. */
  const lastMerge = acc.merged_at || 0;
  if (now - lastMerge > MERGE_RESCAN_MS) { try { await mergeIntoCanon(env, acc); } catch { /* fail-open */ } }
}

/* Absorbe dans la fiche canonique toutes les fiches de la MÊME personne (autres uid).
   « Même personne » = même nom complet normalisé (accents/casse/tirets ignorés), ou
   tout alias de l'admin. Jamais sur un prénom seul → deux « Marie » restent distinctes. */
async function mergeIntoCanon(env, acc) {
  /* Borné : on ne relit jamais plus de 300 dossiers dans une même requête. */
  const idx = JSON.parse((await env.ACCOUNTS.get('idx:uids')) || '[]').slice(-300);
  const me = normName(acc.name);
  const admin = acc.uid === CANON_UID;
  const stamp = async () => { acc.merged_v1 = 1; acc.merged_at = Date.now(); await accPut(env, acc, true); };
  if (!admin && me.split(' ').filter(Boolean).length < 2) { await stamp(); return; }
  const others = [];
  for (const u of idx) {
    if (u === acc.uid) continue;
    const o = await accGet(env, u);
    if (!o || o.merged_into) continue;
    const same = admin ? isAdminName(o.name) : (normName(o.name) === me && !isAdminName(o.name));
    if (same) others.push(o);
  }
  if (!others.length) { await stamp(); return; }
  for (const o of others) {
    acc.hits = (acc.hits || 0) + (o.hits || 0);
    acc.history = (acc.history || []).concat(o.history || [])
      .sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 80);
    acc.devices = Array.from(new Set([...(acc.devices || []), ...(o.devices || [])])).slice(-10);
    acc.places = Array.from(new Set([...(acc.places || []), ...(o.places || [])])).slice(-20);
    acc.apps = acc.apps || {};
    for (const [h, s] of Object.entries(o.apps || {})) {
      const t = acc.apps[h] || { first: s.first || 0, last: 0, sessions: 0, ms: 0 };
      t.sessions = (t.sessions || 0) + (s.sessions || 0);
      t.ms = (t.ms || 0) + (s.ms || 0);
      t.last = Math.max(t.last || 0, s.last || 0);
      t.first = Math.min(t.first || s.first || 0, s.first || t.first || 0) || t.first;
      acc.apps[h] = t;
    }
    if (o.created && (!acc.created || o.created < acc.created)) acc.created = o.created;
    if (o.cgu_at && !acc.cgu_at) acc.cgu_at = o.cgu_at;
    if ((o.last_seen || 0) > (acc.last_seen || 0)) acc.last_seen = o.last_seen;
    acc.aliases = Array.from(new Set([...(acc.aliases || []), o.uid])).slice(-20);
    /* L'ancienne fiche devient un RENVOI (jamais supprimée : traçabilité + réversible). */
    await env.ACCOUNTS.put('acc:' + o.uid, JSON.stringify({ uid: o.uid, name: o.name, merged_into: acc.uid, merged_at: Date.now() }));
  }
  await stamp();
  await audLog(env, { ev: 'accounts_merged', uid: acc.uid, detail: others.map((o) => o.uid).join(', ') + ' → ' + acc.uid });
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
    /* Lire le dossier CANONIQUE (sinon on afficherait la fiche partielle de l'app
       d'où vient la session, au lieu de l'historique complet de la personne). */
    const acc = await accGet(env, await canonFor(env, s.uid, s.name));
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
  /* `domain-log` est le SEUL endpoint admin lu depuis un autre sous-domaine
     (admin.kd-mc.com) : son préflight a besoin des en-têtes CORS, donc il ne doit
     PAS être avalé par ce 204 générique — sinon le navigateur bloque la lecture et
     la page « Qui se connecte » reste vide sans le moindre message (bug attrapé par
     domain-log.test.mjs avant la mise en ligne). */
  if (request.method === 'OPTIONS' && url.pathname !== '/__admin/domain-log') return new Response(null, { status: 204 });
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

  /* « Qui se connecte » (admin.kd-mc.com) — SOURCE UNIQUE des connexions du domaine.
     Le journal des connexions existe DÉJÀ ici (KV ACCOUNTS : hits, history[], devices,
     places, apps). Kevin 2026-08-05 : « enlève ça et intègre le dedans » → plutôt qu'un
     2e journal en parallèle (doublon interdit par « zéro doublon, source unique »), la
     page admin lit CETTE donnée — la vraie, déjà peuplée (191 connexions).
     AUTH PAR EN-TÊTE, pas par cookie : `x-apex-pin` = sha256(code admin), déjà équivalent
     -porteur ailleurs (leçon #95 ; /__admin/login l'accepte tel quel). Sans cookie → aucune
     autorité ambiante → AUCUNE surface CSRF ajoutée (en-tête personnalisé = préflight
     obligatoire, non forgeable par un site tiers). CORS limité à admin.kd-mc.com. Lecture seule. */
  if (path === '/__admin/domain-log' && (request.method === 'GET' || request.method === 'OPTIONS')) {
    const origin = request.headers.get('origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': origin === 'https://admin.kd-mc.com' ? origin : 'https://admin.kd-mc.com',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'x-apex-pin',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    };
    const jc = (o, st) => new Response(JSON.stringify(o), { status: st || 200, headers: Object.assign({ 'content-type': 'application/json', 'cache-control': 'no-store' }, cors) });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const expected = env && env.KDMC_ADMIN_PIN_SHA256;
    const given = request.headers.get('x-apex-pin') || '';
    /* Comparaison en temps constant + fail-closed si le code n'est pas configuré. */
    let same = !!expected && given.length === expected.length;
    if (same) { let d = 0; for (let i = 0; i < expected.length; i++) d |= expected.charCodeAt(i) ^ given.charCodeAt(i); same = d === 0; }
    if (!same) return jc({ ok: false, reason: 'unauthorized' }, 401);
    if (!env.ACCOUNTS) return jc({ ok: true, people: [], kv: false });
    const idx = JSON.parse((await env.ACCOUNTS.get('idx:uids')) || '[]');
    /* Les fiches FUSIONNÉES ne sont que des renvois → jamais listées comme personnes
       (sinon les doublons que Kevin veut supprimer réapparaîtraient dans la page). */
    const accs = (await Promise.all(idx.slice(-500).map((uid) => accGet(env, uid))))
      .filter(Boolean).filter((a) => !a.merged_into);
    /* Projection MINIMALE (RGPD : le nécessaire — ni e-mail, ni jeton, ni contenu privé). */
    const people = accs.map((a) => ({
      uid: a.uid, name: a.name || '', hits: a.hits || 0, lastSeen: a.last_seen || 0,
      devices: (a.devices || []).slice(0, 8), places: (a.places || []).slice(0, 8),
      apps: a.apps || {}, history: (a.history || []).slice(0, 80),
      /* Renseignements fins (dernier état) : appareil complet, opérateur, VPN,
         fuseau, géo approximative, 1re fois, anomalie de déplacement détectée. */
      device: a.last_device || '', isp: a.last_isp || '', vpn: !!a.last_vpn,
      tz: a.last_tz || '', geo: a.last_geo || null, place: a.last_place || '',
      lastApp: a.last_app || '', created: a.created || 0, cguAt: a.cgu_at || 0,
      anomaly: a.anomaly || null,
      /* Renseignements réseau/entrée + rythme + appareil déclaré par l'app. */
      lang: a.last_lang || '', net: a.last_net || null, from: a.last_from || '',
      path: a.last_path || '', hours: a.hours || null, ua: a.last_ua || null,
      aliases: a.aliases || [], passkey: !!a.passkey,
    })).sort((x, y) => (y.lastSeen || 0) - (x.lastSeen || 0));
    return jc({ ok: true, people, count: people.length, ts: Date.now() });
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
    // Le plan KV gratuit plafonne list() à ~1000/jour (namespace PARTAGÉ). Si le budget est
    // épuisé, list() lève → on renvoie la CAUSE EXACTE (leçon #97) au lieu d'un http_500 opaque,
    // pour que l'app affiche « budget du jour atteint, ça reprend demain » au lieu d'une erreur.
    try {
      do {
        const l = await env.ACCOUNTS.list({ prefix: 'mail:p:', cursor });
        for (const k of l.keys) {
          if (items.length >= CAP) break;
          const raw = await env.ACCOUNTS.get(k.name); if (!raw) continue;
          try { const it = JSON.parse(raw); it.id = k.name.slice('mail:p:'.length); items.push(it); } catch { /* */ }
        }
        cursor = l.list_complete ? null : l.cursor;
      } while (cursor && items.length < CAP);
    } catch (e) {
      const detail = String(e && e.message || e);
      const quota = /limit exceeded|rate limit|429|quota/i.test(detail);
      return J({ ok: false, reason: quota ? 'kv_quota_jour' : 'scan_error', detail }, null, 200);
    }
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
/* Chaque zone Tuya a parfois 2 data centers (ex Europe : Central + Western/Azure). Un
   compte France peut être sur l'un OU l'autre → on essaie tous les hôtes de la zone à la
   découverte, et on retient celui qui renvoie le robot (leçon : mesurer, pas deviner). */
const TUYA_ALT_HOSTS = {
  eu: ['openapi.tuyaeu.com', 'openapi-weaz.tuyaeu.com'],
  us: ['openapi.tuyaus.com', 'openapi-ueaz.tuyaus.com'],
  cn: ['openapi.tuyacn.com'],
  in: ['openapi.tuyain.com'],
};
function tuyaCandidateHosts(region, current) {
  const list = (TUYA_ALT_HOSTS[region] || TUYA_ALT_HOSTS.eu).slice();
  if (current && !list.includes(current)) list.unshift(current);
  const i = current ? list.indexOf(current) : -1;
  if (i > 0) { list.splice(i, 1); list.unshift(current); } /* hôte courant d'abord */
  return list;
}
/* Appel Tuya signé sur un hôte + token DONNÉS (pas de cache) — utilisé pour tester
   chaque data center à la découverte. Retourne {ok, http, result, msg, code}. */
async function tuyaFetchSigned(host, clientId, secret, token, method, pathWithQuery, bodyObj) {
  const bodyStr = bodyObj ? JSON.stringify(bodyObj) : '';
  const t = Date.now();
  const sign = await tuyaSign(clientId, secret, token, t, await tuyaStringToSign(method, pathWithQuery, bodyStr));
  let r; try {
    r = await fetch('https://' + host + pathWithQuery, { method, headers: { client_id: clientId, access_token: token, sign, t: String(t), sign_method: 'HMAC-SHA256', 'Content-Type': 'application/json' }, body: bodyStr || undefined });
  } catch (e) { return { ok: false, reason: 'fetch_fail', detail: String((e && e.message) || e).slice(0, 200) }; }
  const j = await r.json().catch(() => ({}));
  return { ok: j && j.success === true, http: r.status, result: j && j.result, msg: j && j.msg, code: j && j.code };
}
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
  /* HISTORIQUE AUTO : compteurs cumulés + dernières sessions détectées côté serveur */
  if (seg === 'stats' && request.method === 'GET') {
    let stats = null, sessions = [], snaps = [];
    try { stats = JSON.parse((await env.ACCOUNTS.get('tuya:stats')) || 'null'); } catch { /* */ }
    try { sessions = JSON.parse((await env.ACCOUNTS.get('tuya:sessions')) || '[]'); } catch { /* */ }
    try { snaps = JSON.parse((await env.ACCOUNTS.get('tuya:snaps')) || '[]'); } catch { /* */ }
    return J({ ok: true, stats, sessions: sessions.slice(0, 60), snaps: snaps.slice(0, 48) });
  }
  /* BASELINE officielle (fiche de nettoyage de l'app Beatbot, fournie par Kevin) :
     totaux affichés = base + relevés auto → l'app colle aux compteurs d'origine */
  if (seg === 'stats' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch { return J({ ok: false, reason: 'bad_json' }); }
    let stats = null; try { stats = JSON.parse((await env.ACCOUNTS.get('tuya:stats')) || 'null'); } catch { /* */ }
    if (!stats) stats = { count: 0, minutes: 0, m2: 0, since: Date.now() };
    if (Number.isFinite(+b.baseCount)) stats.baseCount = Math.max(0, Math.round(+b.baseCount));
    if (Number.isFinite(+b.baseMinutes)) stats.baseMinutes = Math.max(0, Math.round(+b.baseMinutes));
    if (Number.isFinite(+b.baseM2)) stats.baseM2 = Math.max(0, Math.round(+b.baseM2));
    stats.baseSource = String(b.source || 'app Beatbot').slice(0, 120);
    stats.baseAt = Date.now();
    await env.ACCOUNTS.put('tuya:stats', JSON.stringify(stats));
    try { await audLog(env, { ev: 'tuya_stats_baseline', c: stats.baseCount, m: stats.baseMinutes }); } catch { /* */ }
    return J({ ok: true, stats });
  }
  /* MODÈLE PROFOND (thing model v2.0) : TOUS les DP du produit, y compris ceux absents
     de /specifications — pour vérifier s'il existe un DP « mode/surface » caché. Lecture seule. */
  if (seg === 'model' && request.method === 'GET') {
    if (!cfg.device_id) return J({ ok: false, reason: 'no_device' });
    const r = await tuyaBiz(env, cfg, 'GET', '/v2.0/cloud/thing/' + encodeURIComponent(cfg.device_id) + '/model', null);
    return J({ ok: r.ok, model: r.result || null, detail: r.ok ? undefined : (r.msg || ('code ' + r.code)) });
  }
  /* PROPRIÉTÉS COMPLÈTES (shadow properties v2.0) : les VALEURS live de TOUS les DP
     (température d'eau, litres filtrés, position, mode courant…) — /status n'en
     renvoie qu'un sous-ensemble. Lecture seule. */
  if (seg === 'props' && request.method === 'GET') {
    if (!cfg.device_id) return J({ ok: false, reason: 'no_device' });
    const r = await tuyaBiz(env, cfg, 'GET', '/v2.0/cloud/thing/' + encodeURIComponent(cfg.device_id) + '/shadow/properties', null);
    const props = (r.result && r.result.properties) || [];
    return J({ ok: r.ok, properties: props.map((p) => ({ code: p.code, value: p.value, time: p.time })), detail: r.ok ? undefined : (r.msg || ('code ' + r.code)) });
  }
  /* découverte des robots : essaie TOUS les data centers de la zone, retient celui qui
     renvoie le robot, et remonte le diagnostic brut par hôte (compte/erreur) pour qu'on
     voie la vérité si c'est encore vide (leçon #56/#97 : mesurer + détailler). */
  if (seg === 'devices' && request.method === 'GET') {
    const map = (d) => ({ id: d.id, name: d.name, category: d.category, product_name: d.product_name, online: d.online });
    const paths = ['/v1.0/iot-01/associated-users/devices', '/v2.0/cloud/thing/space/devices'];
    const tried = [];
    for (const host of tuyaCandidateHosts(cfg.region, cfg.host)) {
      const m = await tuyaMintToken(host, cfg.access_id, cfg.access_secret);
      if (!m.ok) { tried.push({ host, error: m.detail || 'auth_fail' }); continue; }
      for (const p of paths) {
        const r = await tuyaFetchSigned(host, cfg.access_id, cfg.access_secret, m.token, 'GET', p, null);
        const devs = (r.result && (r.result.devices || (Array.isArray(r.result) ? r.result : null))) || [];
        if (!r.ok) { tried.push({ host, path: p, error: r.msg || ('code ' + r.code) }); continue; }
        tried.push({ host, path: p, count: devs.length });
        if (devs.length) {
          if (host !== cfg.host) { cfg.host = host; await tuyaSaveCfg(env, cfg); }
          await env.ACCOUNTS.put('tuya:token', JSON.stringify({ token: m.token, exp: m.exp }), { expirationTtl: 7200 });
          return J({ ok: true, devices: devs.map(map), host, tried });
        }
      }
    }
    return J({ ok: true, devices: [], tried }); /* honnête : rien trouvé + diag par hôte */
  }
  /* choisir le robot actif */
  if (seg === 'select' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch { return J({ ok: false, reason: 'bad_json' }); }
    const id = String(b.device_id || '').trim(); if (!id) return J({ ok: false, reason: 'missing' });
    cfg.device_id = id; await tuyaSaveCfg(env, cfg);
    return J({ ok: true, device_id: id });
  }
  if (seg === 'unlink' && request.method === 'POST') {
    try { await env.ACCOUNTS.delete('tuya:cfg'); await env.ACCOUNTS.delete('tuya:token'); await env.ACCOUNTS.delete('tuya:online'); } catch { /* */ }
    return J({ ok: true, linked: false });
  }
  /* état de surface (sentinelle) : dernier état connu + check live à la demande */
  if (seg === 'surface' && request.method === 'GET') {
    const r = await tuyaSurfaceCheck(env);
    let last = null; try { last = JSON.parse((await env.ACCOUNTS.get('tuya:online')) || 'null'); } catch { /* */ }
    return J({ ok: true, check: r, last });
  }
  /* PROGRAMMATION (planning horaire + auto-relance après charge) — lit/écrit la config KV.
     N'exige pas de robot choisi pour LIRE, mais le moteur cron n'agit que si device choisi. */
  if (seg === 'schedule' && request.method === 'GET') {
    let s = null; try { s = JSON.parse((await env.ACCOUNTS.get('tuya:schedule')) || 'null'); } catch { /* */ }
    return J({ ok: true, schedule: s || { enabled: false, tz: 'Europe/Monaco', slots: [], suction: 'strong', autoResume: false, minBatt: 20 } });
  }
  if (seg === 'schedule' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch { return J({ ok: false, reason: 'bad_json' }); }
    const slots = Array.isArray(b.slots) ? b.slots.slice(0, 21).filter((x) => x && /^[0-6]$/.test(String(x.dow)) && /^\d{1,2}:\d{2}$/.test(String(x.hm))).map((x) => ({ dow: +x.dow, hm: String(x.hm) })) : [];
    const s = { enabled: !!b.enabled, tz: 'Europe/Monaco', slots, suction: ['strong', 'normal', 'gentle'].includes(b.suction) ? b.suction : 'strong', autoResume: !!b.autoResume, minBatt: Math.max(0, Math.min(90, Number(b.minBatt) || 20)) };
    await env.ACCOUNTS.put('tuya:schedule', JSON.stringify(s));
    try { await audLog(env, { ev: 'tuya_schedule_set', slots: slots.length, enabled: s.enabled, autoResume: s.autoResume }); } catch { /* */ }
    return J({ ok: true, schedule: s });
  }
  /* les routes suivantes ont besoin d'un robot choisi */
  if (!cfg.device_id) return J({ ok: false, reason: 'no_device', detail: 'Choisis d\'abord ton robot (découverte).' });
  const idp = encodeURIComponent(cfg.device_id);
  /* démarrage serveur d'un cycle complet (bouton « Lancer maintenant » côté app) */
  if (seg === 'start' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch { /* */ }
    const r = await tuyaStartClean(env, cfg, { suction: b && b.suction, src: 'manual' });
    return J(r);
  }
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
  /* modèle COMPLET du robot : toutes les commandes écrivables + tous les capteurs (le
     data model Tuya, souvent plus riche que /functions). Sert à exploiter le MAX réel. */
  if (seg === 'spec' && request.method === 'GET') {
    const r = await tuyaBiz(env, cfg, 'GET', '/v1.0/devices/' + idp + '/specifications', null);
    if (!r.ok) return J({ ok: false, reason: 'tuya_error', detail: r.detail || r.msg || ('code ' + r.code) });
    return J({ ok: true, category: r.result && r.result.category, functions: (r.result && r.result.functions) || [], status: (r.result && r.result.status) || [] });
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

/* ---- Sentinelle « robot en surface » (le robot n'émet pas sous l'eau) ----
   Le robot ne redevient joignable QUE quand il remonte (surface/base) — fenêtre de
   quelques minutes. Cron Cloudflare toutes les 5 min : lit l'état Tuya, détecte la
   transition hors-ligne → EN LIGNE, et pousse une notif iPhone à Kevin (« 🌊 Robot en
   surface — batterie X% ») via l'infra push existante. S'active AUTOMATIQUEMENT dès que
   les clés Tuya sont liées ; sans liaison → no-op (1 lecture KV). ANTI-SPAM : notifie
   UNIQUEMENT à la transition + throttle 15 min. Fail-open total (jamais d'exception). */
async function tuyaSurfaceCheck(env) {
  try {
    if (!env || !env.ACCOUNTS) return { ok: true, skip: 'no_kv' };
    const cfg = await tuyaCfg(env);
    if (!cfg || !cfg.device_id) return { ok: true, skip: 'not_linked' };
    const idp = encodeURIComponent(cfg.device_id);
    const info = await tuyaBiz(env, cfg, 'GET', '/v1.0/devices/' + idp, null);
    if (!info.ok) return { ok: false, reason: info.msg || info.reason || ('code ' + info.code) };
    const online = !!(info.result && info.result.online);
    let prev = null; try { prev = JSON.parse((await env.ACCOUNTS.get('tuya:online')) || 'null'); } catch { /* */ }
    await env.ACCOUNTS.put('tuya:online', JSON.stringify({ online, ts: Date.now() }));
    if (!(online && prev && prev.online === false)) return { ok: true, online, notified: false };
    /* transition plongée → SURFACE : notif (throttle 15 min) */
    const lastN = Number((await env.ACCOUNTS.get('tuya:surf_notif')) || 0);
    if (Date.now() - lastN < 15 * 60 * 1000) return { ok: true, online, notified: false, throttled: true };
    let batt = null;
    const st = await tuyaBiz(env, cfg, 'GET', '/v1.0/devices/' + idp + '/status', null);
    if (st.ok) (st.result || []).forEach((s) => { const k = String(s.code || '').toLowerCase(); if (batt == null && /electric|battery|soc|residual/.test(k) && typeof s.value === 'number' && s.value >= 0 && s.value <= 100) batt = Math.round(s.value); });
    await notifyPush(env, '🌊 Robot en surface', 'Ton robot piscine est joignable' + (batt != null ? ' — batterie ' + batt + '%' : '') + '. Fenêtre pour commandes et données.', { tag: 'poolpilot-surface', url: 'https://beatbot.kd-mc.com/' });
    await env.ACCOUNTS.put('tuya:surf_notif', String(Date.now()), { expirationTtl: 86400 });
    try { await audLog(env, { ev: 'tuya_surface_notif', batt }); } catch { /* */ }
    return { ok: true, online, notified: true, batt };
  } catch (e) { return { ok: false, reason: String((e && e.message) || e).slice(0, 200) }; }
}

/* ---- HISTORIQUE AUTO (comme l'app d'origine) : le robot remonte clean_time /
   clean_area / batterie via Tuya → à chaque tick cron (5 min) on détecte les cycles
   TERMINÉS et on les enregistre côté serveur (KV), même app fermée. Aucune invention :
   uniquement les valeurs RÉELLES remontées par le robot. Astuce fiabilité : sous l'eau
   le robot est hors wifi → on peut rater le passage « cleaning » ; mais les DP gardent
   les compteurs de la DERNIÈRE session → tout CHANGEMENT de clean_time/clean_area
   (hors nettoyage en cours) = un cycle réel qui vient de finir. */
async function tuyaHistoryTick(env) {
  try {
    if (!env || !env.ACCOUNTS) return { ok: true, skip: 'no_kv' };
    const cfg = await tuyaCfg(env);
    if (!cfg || !cfg.device_id) return { ok: true, skip: 'not_linked' };
    const idp = encodeURIComponent(cfg.device_id);
    /* shadow properties = TOUTES les valeurs (status/compteurs + température d'eau,
       litres filtrés, mode…) en UN appel — repli sur /status si indisponible */
    let dps = null;
    const sh = await tuyaBiz(env, cfg, 'GET', '/v2.0/cloud/thing/' + idp + '/shadow/properties', null);
    if (sh.ok && sh.result && Array.isArray(sh.result.properties)) dps = sh.result.properties;
    if (!dps) {
      const st = await tuyaBiz(env, cfg, 'GET', '/v1.0/devices/' + idp + '/status', null);
      if (!st.ok) return { ok: false, reason: st.msg || st.reason || ('code ' + st.code) };
      dps = st.result || [];
    }
    let ct = null, ca = null, batt = null, status = '', temp = null, fw = null, mode = null;
    (dps || []).forEach((s) => {
      const k = String(s.code || '').toLowerCase(), v = s.value;
      if (k === 'status') status = String(v);
      if (k === 'mode') mode = String(v);
      if (k === 'water_temperature' && typeof v === 'number') temp = v;
      if (k === 'filtered_water' && typeof v === 'number') fw = v;
      if (ct == null && /clean_time|work_time/.test(k) && typeof v === 'number') ct = v;
      if (ca == null && /clean_area|^area$/.test(k) && typeof v === 'number') ca = v;
      if (batt == null && /battery|electric|residual|soc/.test(k) && typeof v === 'number' && v >= 0 && v <= 100) batt = Math.round(v);
    });
    /* INSTANTANÉS pendant le travail : à CHAQUE changement observé (remontée, progression,
       température…), on archive un point {ts,…} → « toutes les infos, auto, temps réel » */
    try {
      let snaps = []; try { snaps = JSON.parse((await env.ACCOUNTS.get('tuya:snaps')) || '[]'); } catch { /* */ }
      const lastSnap = snaps[0] || {};
      const snap = { ts: Date.now(), st: status, batt, ct, ca, temp, fw, mode };
      const moved = ['st', 'batt', 'ct', 'ca', 'temp', 'fw', 'mode'].some((k) => snap[k] !== lastSnap[k]);
      if (moved) { snaps.unshift(snap); if (snaps.length > 288) snaps = snaps.slice(0, 288); await env.ACCOUNTS.put('tuya:snaps', JSON.stringify(snaps)); }
    } catch { /* jamais bloquant */ }
    let last = null; try { last = JSON.parse((await env.ACCOUNTS.get('tuya:lastdp')) || 'null'); } catch { /* */ }
    const cur = { ct, ca, batt, status, ts: Date.now() };
    if (!last) { await env.ACCOUNTS.put('tuya:lastdp', JSON.stringify(cur)); return { ok: true, first: true }; }
    /* états « cycle EN COURS » mesurés via thing model (2026-07-21) : le robot peut faire
       surface mi-cycle (emerge/diving/return_trip) → ne PAS finaliser sur ces états,
       sinon on compterait une session partielle + une complète (double comptage) */
    const inProgress = /cleaning|diving|emerge|clean_wait|return_trip/.test(status);
    const changed = (ct != null && ct !== last.ct) || (ca != null && ca !== last.ca);
    const finished = changed && !inProgress && ct != null && ct >= 3;
    if (finished) {
      let sessions = []; try { sessions = JSON.parse((await env.ACCOUNTS.get('tuya:sessions')) || '[]'); } catch { /* */ }
      sessions.unshift({ ts: Date.now(), dur: ct, area: ca, batt, src: 'auto' });
      if (sessions.length > 300) sessions = sessions.slice(0, 300);
      await env.ACCOUNTS.put('tuya:sessions', JSON.stringify(sessions));
      let stats = null; try { stats = JSON.parse((await env.ACCOUNTS.get('tuya:stats')) || 'null'); } catch { /* */ }
      if (!stats) stats = { count: 0, minutes: 0, m2: 0, since: Date.now() };
      stats.count += 1; stats.minutes += ct; stats.m2 += (ca || 0);
      await env.ACCOUNTS.put('tuya:stats', JSON.stringify(stats));
      try { await audLog(env, { ev: 'tuya_session_logged', dur: ct, area: ca, batt }); } catch { /* */ }
    }
    /* la référence n'avance PAS pendant un cycle en cours (sinon on rate la fin) */
    if (!inProgress) await env.ACCOUNTS.put('tuya:lastdp', JSON.stringify(cur));
    return { ok: true, recorded: !!finished };
  } catch (e) { return { ok: false, reason: String((e && e.message) || e).slice(0, 200) }; }
}

/* Grant admin MACHINE : produit le même jeton signé que /__admin/login, mais à
   partir du SECRET SSO (pas du code PIN). Sert à l'agent de contrôle GitHub Actions
   pour s'authentifier en admin et vérifier le bot À LA PLACE de Kevin, sans jamais
   détenir son Face ID. Minter un jeton exige déjà le secret → n'affaiblit rien.
   Utilise le MÊME ssoSign que le worker → zéro dérive (le jeton est forcément accepté). */
async function adminGrant(secret) { return ssoSign(secret, '__kdmc_admin__', 'admin', 1); }

/* ---- Moteur « programme » PoolPilot (par-dessus les 4 vraies commandes) ----
   Le firmware du robot est fermé/signé : on ne le modifie PAS. À la place, on lui ajoute
   des capacités par orchestration serveur des commandes réelles : planning horaire +
   auto-relance après charge. Garde-fous stricts (jamais de démarrage à l'aveugle). */
async function tuyaStartClean(env, cfg, opts) {
  opts = opts || {};
  const idp = encodeURIComponent(cfg.device_id);
  const info = await tuyaBiz(env, cfg, 'GET', '/v1.0/devices/' + idp, null);
  if (!info.ok) return { ok: false, reason: info.msg || info.reason || ('code ' + info.code) };
  if (!(info.result && info.result.online)) return { ok: false, reason: 'offline' };
  const st = await tuyaBiz(env, cfg, 'GET', '/v1.0/devices/' + idp + '/status', null);
  let status = '', batt = null;
  if (st.ok) (st.result || []).forEach((s) => { const k = String(s.code || '').toLowerCase(); if (k === 'status') status = String(s.value); if (batt == null && /battery|electric|residual|soc/.test(k) && typeof s.value === 'number') batt = s.value; });
  if (/cleaning/.test(status)) return { ok: false, reason: 'already_cleaning' };
  const minB = typeof opts.minBatt === 'number' ? opts.minBatt : 20;
  if (batt != null && batt < minB) return { ok: false, reason: 'low_batt', batt };
  const suc = ['strong', 'normal', 'gentle'].includes(opts.suction) ? opts.suction : 'strong';
  const r = await tuyaBiz(env, cfg, 'POST', '/v1.0/devices/' + idp + '/commands', { commands: [{ code: 'suction', value: suc }, { code: 'switch', value: true }, { code: 'switch_go', value: true }] });
  if (r.ok) { try { await audLog(env, { ev: 'tuya_autostart', src: opts.src || 'sched', batt, suction: suc }); } catch { /* */ } }
  return { ok: r.ok, reason: r.ok ? null : (r.detail || r.msg || ('code ' + r.code)), batt };
}
/* Tick cron (toutes les 5 min) : auto-relance après charge + déclenchements planifiés
   (Europe/Monaco, DST-safe via Intl). Fail-open total ; no-op si non lié / non activé. */
async function tuyaScheduleTick(env) {
  try {
    if (!env || !env.ACCOUNTS) return { ok: true, skip: 'no_kv' };
    const cfg = await tuyaCfg(env);
    if (!cfg || !cfg.device_id) return { ok: true, skip: 'not_linked' };
    let sched = null; try { sched = JSON.parse((await env.ACCOUNTS.get('tuya:schedule')) || 'null'); } catch { /* */ }
    if (!sched) return { ok: true, skip: 'no_schedule' };
    const idp = encodeURIComponent(cfg.device_id);
    /* AUTO-RELANCE : mémorise le statut ; si on a nettoyé puis chargé, relance à charge_done */
    if (sched.autoResume) {
      const st = await tuyaBiz(env, cfg, 'GET', '/v1.0/devices/' + idp + '/status', null);
      let status = '';
      if (st.ok) (st.result || []).forEach((s) => { if (String(s.code || '').toLowerCase() === 'status') status = String(s.value); });
      let prev = ''; try { prev = (await env.ACCOUNTS.get('tuya:laststatus')) || ''; } catch { /* */ }
      if (status) await env.ACCOUNTS.put('tuya:laststatus', status);
      if (/cleaning/.test(prev) && /goto_charge|charging/.test(status)) await env.ACCOUNTS.put('tuya:resume_pending', '1', { expirationTtl: 86400 });
      let want = false; try { want = (await env.ACCOUNTS.get('tuya:resume_pending')) === '1'; } catch { /* */ }
      if (want && /charge_done/.test(status)) {
        const r = await tuyaStartClean(env, cfg, { suction: sched.suction, minBatt: sched.minBatt, src: 'resume' });
        await env.ACCOUNTS.delete('tuya:resume_pending');
        if (r.ok) await notifyPush(env, '🔁 Robot relancé', 'Rechargé — je relance le nettoyage pour finir la piscine.', { tag: 'poolpilot-resume', url: 'https://beatbot.kd-mc.com/' });
      }
    }
    /* PLANNING HORAIRE */
    if (sched.enabled && Array.isArray(sched.slots) && sched.slots.length) {
      const tz = sched.tz || 'Europe/Monaco';
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      const wk = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      let dow = -1, hh = 0, mm = 0;
      parts.forEach((p) => { if (p.type === 'weekday') dow = wk[p.value]; if (p.type === 'hour') hh = +p.value; if (p.type === 'minute') mm = +p.value; });
      const nowMin = hh * 60 + mm;
      const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
      for (const sl of sched.slots) {
        if (+sl.dow !== dow) continue;
        const m = /^(\d{1,2}):(\d{2})$/.exec(String(sl.hm || ''));
        if (!m) continue;
        const slotMin = (+m[1]) * 60 + (+m[2]);
        if (slotMin < nowMin || slotMin >= nowMin + 5) continue; /* fenêtre du tick (cron 5 min) */
        const firedKey = 'tuya:fired:' + dateKey + ':' + sl.dow + ':' + sl.hm;
        let already = false; try { already = (await env.ACCOUNTS.get(firedKey)) === '1'; } catch { /* */ }
        if (already) continue;
        await env.ACCOUNTS.put(firedKey, '1', { expirationTtl: 172800 });
        const r = await tuyaStartClean(env, cfg, { suction: sched.suction, minBatt: sched.minBatt, src: 'sched' });
        await notifyPush(env, r.ok ? '🗓️ Nettoyage programmé lancé' : '🗓️ Nettoyage non lancé', r.ok ? ('Le robot démarre (aspiration ' + (sched.suction || 'strong') + ').') : ('Impossible : ' + (r.reason || '?') + '. Vérifie qu\'il est dans l\'eau et chargé.'), { tag: 'poolpilot-sched', url: 'https://beatbot.kd-mc.com/' });
      }
    }
    return { ok: true };
  } catch (e) { return { ok: false, reason: String((e && e.message) || e).slice(0, 200) }; }
}

/* Export nommé pour les tests régression (Cloudflare utilise seulement le default export). */
export { enrich, adminGrant, beatbotTargetOk, tuyaStringToSign, tuyaSign, tuyaSha256Hex, tuyaHmacHex, tuyaSurfaceCheck, tuyaScheduleTick, tuyaStartClean, tuyaHistoryTick };
