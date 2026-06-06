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
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
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
