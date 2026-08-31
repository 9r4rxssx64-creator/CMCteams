/**
 * Cloudflare Worker — GitHub API proxy pour Apex AI
 *
 * Contourne les restrictions Safari iOS PWA qui bloquent les requêtes directes
 * vers api.github.com / raw.githubusercontent.com.
 *
 * DÉPLOIEMENT (3 min) :
 * 1. Va sur https://workers.cloudflare.com → "Create Worker"
 * 2. Colle ce code
 * 3. Variables d'environnement (onglet Settings > Variables) :
 *    - GITHUB_PAT : ton token (github_pat_11...) - chiffré côté worker
 *    - ALLOWED_ORIGIN : https://9r4rxssx64-creator.github.io
 * 4. Sauvegarde + Deploy
 * 5. Copie l'URL finale (ex: https://apex-github-proxy.xxx.workers.dev)
 * 6. Dans Apex Vault → clé `ax_github_proxy_url` → colle l'URL → OK
 *
 * SÉCURITÉ :
 * - Le PAT reste côté Worker (jamais exposé au navigateur)
 * - CORS limité à ton domaine github.io
 * - Rate limit natif Cloudflare (100k requests/jour gratuit)
 * - Whitelist du repo : uniquement 9r4rxssx64-creator/CMCteams
 */

const ALLOWED_REPO = "9r4rxssx64-creator/CMCteams";

/* Les seules pages autorisées à lire le dépôt par ce relais. */
const ORIGINES_AUTORISEES = [
  "https://kd-mc.com",
  "https://www.kd-mc.com",
  "https://9r4rxssx64-creator.github.io",
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const liste = (env.ALLOWED_ORIGIN || "").trim()
      ? env.ALLOWED_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
      : ORIGINES_AUTORISEES;
    const autorisee = liste.includes(origin);
    const pourEnTetes = autorisee ? origin : liste[0];

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(pourEnTetes)
      });
    }

    /* ⚠️ FERMÉ PAR DÉFAUT — corrigé le 2026-08-12.
     *
     * L'ancienne version disait : « si une origine est présente ET qu'elle
     * n'est pas la bonne, refuse ». Autrement dit, une requête SANS origine
     * passait. Or un navigateur envoie toujours une origine ; ce qui n'en
     * envoie pas, c'est un outil en ligne de commande ou un serveur.
     *
     * Tant que le dépôt est public, ça ne changeait rien. Mais ce relais
     * existe précisément pour le jour où il sera PRIVÉ : la porte grande
     * ouverte aurait alors laissé n'importe qui connaissant l'adresse lire
     * un dépôt fermé, avec le jeton de Kevin. On refuse donc par défaut, et
     * on n'autorise que ce qui est explicitement listé.
     */
    if (!autorisee) {
      return new Response("Origine non autorisée", {
        status: 403,
        headers: corsHeaders(pourEnTetes)
      });
    }
    const allowedOrigin = pourEnTetes;

    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "read";
    const path = url.searchParams.get("path") || "";
    const branch = url.searchParams.get("branch") || "main";

    /* ⚠️ ÉCHAPPEMENT DU DÉPÔT — corrigé le 2026-08-12.
     *
     * `path` et `branch` sont recollés dans l'adresse GitHub. Sans contrôle,
     * un chemin contenant « .. » sort du dépôt whitelisté :
     *     path=../../autre-depot/main/secret.txt
     * devient, une fois l'adresse simplifiée, une lecture d'un AUTRE dépôt.
     *
     * Et le jeton porté par ce relais donne accès à TOUS les dépôts de
     * Kevin, pas seulement CMCteams. La liste blanche d'un seul dépôt ne
     * protégeait donc rien. On n'accepte que des chemins simples.
     */
    const cheminOk = /^[A-Za-z0-9._\-/]*$/.test(path) && !path.split("/").includes("..");
    const brancheOk = /^[A-Za-z0-9._\-/]+$/.test(branch) && !branch.split("/").includes("..");
    if (!cheminOk || !brancheOk) {
      return new Response("Chemin ou branche refusé", {
        status: 400,
        headers: corsHeaders(allowedOrigin)
      });
    }

    // Whitelist : uniquement le repo Kevin
    let githubUrl;
    if (action === "read") {
      // Lecture via raw.githubusercontent.com (contenu brut)
      githubUrl = `https://raw.githubusercontent.com/${ALLOWED_REPO}/${branch}/${path}`;
    } else if (action === "api") {
      // API GitHub pour métadonnées
      githubUrl = `https://api.github.com/repos/${ALLOWED_REPO}/contents/${path}?ref=${branch}`;
    } else if (action === "list") {
      // Lister un dossier
      githubUrl = `https://api.github.com/repos/${ALLOWED_REPO}/contents/${path}?ref=${branch}`;
    } else {
      return new Response("Invalid action", {
        status: 400,
        headers: corsHeaders(allowedOrigin)
      });
    }

    // Forward avec PAT côté worker (jamais exposé au client)
    const headers = {
      "User-Agent": "apex-github-proxy"
    };
    if (env.GITHUB_PAT) {
      headers["Authorization"] = `Bearer ${env.GITHUB_PAT}`;
    }

    try {
      const ghResponse = await fetch(githubUrl, { headers });
      const body = await ghResponse.text();

      return new Response(body, {
        status: ghResponse.status,
        headers: {
          ...corsHeaders(allowedOrigin),
          "Content-Type": ghResponse.headers.get("Content-Type") || "text/plain",
          "Cache-Control": "public, max-age=60"
        }
      });
    } catch (e) {
      return new Response(`Proxy error: ${e.message}`, {
        status: 500,
        headers: corsHeaders(allowedOrigin)
      });
    }
  }
};

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}
