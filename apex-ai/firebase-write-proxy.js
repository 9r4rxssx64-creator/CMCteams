/**
 * KDMC — Firebase Write Proxy (Cloudflare Worker)
 * ════════════════════════════════════════════════════════════════════
 *
 * RÔLE (Option B du verrouillage — cf. FIREBASE_SECURITY.md) :
 * Seul ce Worker est autorisé à ÉCRIRE dans les bases Firebase RTDB.
 * Les apps (CMCteams + Apex) envoient leurs écritures ICI ; le Worker
 * valide puis écrit côté serveur avec un secret Firebase. Les règles RTDB
 * passent à `".write": false` → plus aucune écriture directe externe.
 *
 * Les LECTURES restent directes (`.read: true`) — la synchro temps réel
 * SSE des apps continue de fonctionner sans changement.
 *
 * ⚠️ Honnêteté : Origin + clé partagée = durcissement fort (point de
 * contrôle unique, RTDB verrouillée, validation), PAS une attestation
 * cryptographique. Un attaquant qui lit le JS de l'app peut rejouer des
 * requêtes. Phase 2 possible : vérifier un jeton App Check côté Worker.
 *
 * ════════════════════════════════════════════════════════════════════
 * DÉPLOIEMENT
 * ════════════════════════════════════════════════════════════════════
 * 1. Cloudflare → Workers & Pages → Create Worker → nom `firebase-write-proxy`
 * 2. Coller ce fichier → Deploy
 * 3. Settings → Variables and Secrets → ajouter (type Secret/Encrypted) :
 *      CMC_RTDB_URL   = https://cmcteams-c16ab-default-rtdb.europe-west1.firebasedatabase.app
 *      APEX_RTDB_URL  = (URL RTDB du projet Apex)
 *      CMC_DB_SECRET  = (Database secret du projet CMCteams)
 *      APEX_DB_SECRET = (Database secret du projet Apex)
 *      PROXY_KEY      = (chaîne aléatoire longue — clé partagée app↔Worker)
 * 4. Noter l'URL du Worker → la mettre dans les 2 apps (étape reroutage).
 *
 * Database secret : Console Firebase → ⚙ Paramètres du projet →
 *   Comptes de service → Secrets de base de données (hérités). Si absent,
 *   bascule service-account (à implémenter — voir FIREBASE_WORKER_CHANTIER.md).
 */

const ALLOWED_ORIGINS = ['https://9r4rxssx64-creator.github.io'];
const MAX_BODY = 1_000_000; /* 1 Mo — anti-DoS */

/* Préfixes de chemin RTDB autorisés par app. Toute écriture hors de ces
 * sous-arbres est refusée (anti-pollution). */
const ALLOWED_PREFIXES = {
  cmc: ['cmcteams/'],
  apex: ['apex/', 'vault_backup/'],
};

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-App, X-Proxy-Key',
    'Access-Control-Max-Age': '86400',
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method === 'GET' && new URL(request.url).pathname === '/health') {
      return json({ ok: true, proxy: 'firebase-write-proxy-v1' }, 200, origin);
    }
    if (request.method !== 'POST') {
      return json({ ok: false, error: 'Méthode non autorisée' }, 405, origin);
    }

    /* 1. Origine */
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return json({ ok: false, error: 'Origine refusée' }, 403, origin);
    }
    /* 2. Clé partagée */
    if (!env.PROXY_KEY || request.headers.get('X-Proxy-Key') !== env.PROXY_KEY) {
      return json({ ok: false, error: 'Clé proxy invalide' }, 403, origin);
    }
    /* 3. App ciblée */
    const app = request.headers.get('X-App');
    if (app !== 'cmc' && app !== 'apex') {
      return json({ ok: false, error: 'En-tête X-App invalide' }, 400, origin);
    }
    const rtdbUrl = app === 'cmc' ? env.CMC_RTDB_URL : env.APEX_RTDB_URL;
    const dbSecret = app === 'cmc' ? env.CMC_DB_SECRET : env.APEX_DB_SECRET;
    if (!rtdbUrl || !dbSecret) {
      return json({ ok: false, error: 'Worker non configuré (RTDB/secret)' }, 500, origin);
    }

    /* 4. Corps */
    const raw = await request.text();
    if (raw.length > MAX_BODY) {
      return json({ ok: false, error: 'Charge trop volumineuse' }, 413, origin);
    }
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return json({ ok: false, error: 'JSON invalide' }, 400, origin);
    }
    const { path, method, value } = payload;
    const wmethod = (method || 'PUT').toUpperCase();
    if (!['PUT', 'PATCH', 'DELETE'].includes(wmethod)) {
      return json({ ok: false, error: 'Méthode d\'écriture invalide' }, 400, origin);
    }

    /* 5. Validation du chemin : non vide, sans `.`, sans `//`, dans un préfixe autorisé */
    if (typeof path !== 'string' || !path || path.includes('..') || path.includes('//') || path.startsWith('/')) {
      return json({ ok: false, error: 'Chemin invalide' }, 400, origin);
    }
    const okPrefix = ALLOWED_PREFIXES[app].some((p) => path.startsWith(p));
    if (!okPrefix) {
      return json({ ok: false, error: 'Chemin hors zone autorisée' }, 403, origin);
    }

    /* 6. Écriture côté serveur (le secret bypasse `.write:false`) */
    const target = `${rtdbUrl}/${path}.json?auth=${encodeURIComponent(dbSecret)}`;
    const init = { method: wmethod };
    if (wmethod !== 'DELETE') {
      init.headers = { 'Content-Type': 'application/json' };
      init.body = JSON.stringify(value ?? null);
    }
    try {
      const r = await fetch(target, init);
      const text = await r.text();
      /* Log d'audit (visible via `wrangler tail`) — cause exacte conservée. */
      console.log(`[fw-proxy] ${app} ${wmethod} ${path} → ${r.status}`);
      if (!r.ok) {
        return json({ ok: false, error: 'Échec écriture Firebase', status: r.status, detail: text.slice(0, 300) }, 502, origin);
      }
      return json({ ok: true }, 200, origin);
    } catch (e) {
      console.error(`[fw-proxy] ${app} ${path} EXCEPTION`, e && e.message);
      return json({ ok: false, error: 'Proxy injoignable', detail: String(e && e.message || e).slice(0, 200) }, 502, origin);
    }
  },
};
