/**
 * kdmc-uptime — surveillance du domaine kd-mc.com
 *
 * POURQUOI CE WORKER EXISTE
 * -------------------------
 * Le 15/08/2026, les 7 workflows de surveillance ont été rangés dans
 * .github/workflows-desactives/ pour retirer les crons qui avaient fait
 * suspendre le compte GitHub. Personne ne les a remis ailleurs.
 * Résultat mesuré le 05/09 : dernier relevé le 14/08 à 18h52 → 22 jours
 * SANS aucun contrôle. Et même avant, la sonde ne couvrait que 13 des
 * 26 sous-domaines (arbre, cuisine, lingua, studio, shops… jamais testés).
 *
 * Sa place est ICI et pas sur GitHub : règle « jamais de tâche programmée
 * sur GitHub Actions » (fait n°10/11 de ETAT-INFRA.md). Un cron Cloudflare
 * est hors quota GitLab CI et n'expose pas le compte.
 *
 * CONTRAINTES DU COMPTE (respectées, pas devinées)
 * ------------------------------------------------
 * - ZÉRO binding : les Durable Objects échouent au démarrage sur ce compte
 *   (error 1042, leçons #132/#133) et les KV à id placeholder cassent
 *   `wrangler deploy` (commentaire de services/kdmc-router/wrangler.toml).
 *   → l'état entre deux passages vit dans le Cache API, disponible sans
 *     aucun binding. Il est évictable : c'est assumé, voir plus bas.
 * - Fail-open partout : sans jeton de notification le worker continue de
 *   sonder et de servir son état. Une surveillance qui tombe en panne
 *   parce qu'un secret manque ne surveille rien.
 *
 * ENDPOINTS
 *   GET /         → état complet du dernier passage (JSON)
 *   GET /health   → {ok:true} (pour être soi-même surveillé)
 *   GET /run      → force un passage maintenant (utile pour le smoke test)
 */

/* ------------------------------------------------------------------ *
 * LES CIBLES
 *
 * ⚠️ Cette liste DOIT rester le miroir exact de ROUTES dans
 *    services/kdmc-router/worker.js. C'est précisément la dérive qui a
 *    laissé 13 adresses sans surveillance pendant des mois : on ajoutait
 *    un sous-domaine au routeur, jamais à la sonde, et rien ne le disait.
 *    Le test tests/uptime-couverture.test.mjs échoue désormais si un
 *    sous-domaine du routeur manque ici. Ajouter une app = 3 endroits :
 *    wrangler.toml du routeur + ROUTES du routeur + CETTE liste.
 * ------------------------------------------------------------------ */
const SITES = [
  'kd-mc.com',
  'www.kd-mc.com',
  'cmcteams.kd-mc.com',
  'cmcteams-light.kd-mc.com',
  'departs.kd-mc.com',
  'apex-ai.kd-mc.com',
  'apex-chat.kd-mc.com',
  'dashboard.kd-mc.com',
  'sourcing.kd-mc.com',
  'coffre.kd-mc.com',
  'la-detente.kd-mc.com',
  'chez-lolo.kd-mc.com',
  'bot.kd-mc.com',
  'beatbot.kd-mc.com',
  'autorisations.kd-mc.com',
  'arbre.kd-mc.com',
  'lingua.kd-mc.com',
  'studio.kd-mc.com',
  'worldmonitor.kd-mc.com',
  'osint.kd-mc.com',
  'ia.kd-mc.com',
  'outils.kd-mc.com',
  'shops.kd-mc.com',
  'cuisine.kd-mc.com',
  'cocina.kd-mc.com',
  'cujina.kd-mc.com',
];

/* Workers critiques : on sonde leur /health, pas leur racine. */
const WORKERS = [
  'apex-secrets-proxy',
  'kdmc-ais',
  'kdmc-live',
  'kdmc-rag',
  'apex-v13-backend',
  'apex-auth-worker',
];

/* Ces adresses exigent une session admin : un 401/403 est la BONNE réponse,
   pas une panne. Les confondre produirait une alerte permanente que plus
   personne ne lirait — c'est comme ça qu'on cesse de lire les alertes. */
const ADMIN_GATED = new Set(['autorisations.kd-mc.com', 'beatbot.kd-mc.com']);

const TIMEOUT_MS = 12000;
const STATE_URL = 'https://kdmc-uptime.internal/state/v1';

function targets() {
  const out = SITES.map((host) => ({
    id: host,
    url: 'https://' + host + '/',
    kind: 'site',
    adminGated: ADMIN_GATED.has(host),
  }));
  for (const w of WORKERS) {
    out.push({
      id: w,
      url: 'https://' + w + '.9r4rxssx64.workers.dev/health',
      kind: 'worker',
      adminGated: false,
    });
  }
  return out;
}

/** Sonde une cible. Ne jette jamais : une exception ici tuerait tout le passage. */
async function probe(t) {
  const started = Date.now();
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(t.url, {
      method: 'GET',
      redirect: 'follow',
      signal: ctl.signal,
      headers: { 'user-agent': 'kdmc-uptime/1.0 (+https://kd-mc.com)' },
      cf: { cacheTtl: 0, cacheEverything: false },
    });
    const ms = Date.now() - started;
    const code = res.status;
    // 401/403 sur une page admin = verrou qui fonctionne, donc en bonne santé.
    const ok = code < 400 || (t.adminGated && (code === 401 || code === 403));
    return { id: t.id, url: t.url, kind: t.kind, code: String(code), ms, ok };
  } catch (e) {
    const ms = Date.now() - started;
    const aborted = e && (e.name === 'AbortError' || /abort/i.test(String(e && e.message)));
    return {
      id: t.id,
      url: t.url,
      kind: t.kind,
      code: aborted ? 'timeout' : 'erreur',
      ms,
      ok: false,
      // Cause EXACTE conservée (règle « toujours détailler les erreurs »).
      detail: String((e && e.message) || e).slice(0, 200),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function readState() {
  try {
    const hit = await caches.default.match(STATE_URL);
    if (!hit) return null;
    return await hit.json();
  } catch (_) {
    return null;
  }
}

async function writeState(state) {
  try {
    await caches.default.put(
      STATE_URL,
      new Response(JSON.stringify(state), {
        headers: {
          'content-type': 'application/json',
          'cache-control': 'max-age=86400',
        },
      }),
    );
  } catch (_) {
    /* best-effort : perdre l'état ne doit pas faire échouer le passage */
  }
}

/**
 * Notifie l'iPhone via apex-push-worker. Best-effort et silencieux :
 * pas de jeton → on ne notifie pas, mais on continue de sonder.
 */
async function notify(env, title, body) {
  const url = env && env.KDMC_PUSH_URL;
  const token = env && env.KDMC_PUSH_TOKEN;
  if (!url || !token) return { sent: false, why: 'push non configuré' };
  try {
    const r = await fetch(url.replace(/\/+$/, '') + '/send', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({ title, body }),
    });
    return { sent: r.ok, code: r.status };
  } catch (e) {
    return { sent: false, why: String((e && e.message) || e).slice(0, 120) };
  }
}

async function runPass(env) {
  const list = targets();
  const results = [];
  // Par paquets de 8 : 32 requêtes d'un coup depuis un worker se font
  // étrangler, et une sonde étranglée invente des pannes.
  for (let i = 0; i < list.length; i += 8) {
    const chunk = list.slice(i, i + 8);
    results.push(...(await Promise.all(chunk.map(probe))));
  }

  const prev = await readState();
  const prevDown = new Set((prev && prev.down) || []);
  const down = results.filter((r) => !r.ok).map((r) => r.id);
  const nowDown = new Set(down);

  const tombees = down.filter((id) => !prevDown.has(id));
  const revenues = [...prevDown].filter((id) => !nowDown.has(id));

  const state = {
    ts: new Date().toISOString(),
    total: results.length,
    ok: results.filter((r) => r.ok).length,
    down,
    results,
  };
  await writeState(state);

  let push = { sent: false, why: 'rien à signaler' };
  if (tombees.length) {
    const lignes = results
      .filter((r) => tombees.includes(r.id))
      .map((r) => `${r.id} → ${r.code}`)
      .join('\n');
    push = await notify(
      env,
      `⚠️ ${tombees.length} adresse(s) ne répondent plus`,
      lignes,
    );
  } else if (revenues.length) {
    push = await notify(env, `✅ ${revenues.length} adresse(s) de nouveau en ligne`, revenues.join('\n'));
  }

  return { ...state, tombees, revenues, push };
}

function json(obj, status) {
  return new Response(JSON.stringify(obj, null, 2), {
    status: status || 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'x-content-type-options': 'nosniff',
    },
  });
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runPass(env));
  },

  async fetch(request, env) {
    const path = new URL(request.url).pathname;

    if (path === '/health') {
      return json({ ok: true, service: 'kdmc-uptime', cibles: targets().length });
    }

    if (path === '/run') {
      return json(await runPass(env));
    }

    if (path === '/' || path === '') {
      const state = await readState();
      if (!state) {
        return json({
          ok: true,
          etat: 'aucun passage enregistré pour le moment',
          note: "Le premier passage a lieu au prochain déclenchement horaire, ou tout de suite via /run.",
          cibles: targets().length,
        });
      }
      return json({ ok: true, ...state });
    }

    return json({ ok: false, error: 'chemin inconnu', chemins: ['/', '/health', '/run'] }, 404);
  },
};
