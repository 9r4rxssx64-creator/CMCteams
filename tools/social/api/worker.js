/**
 * Cloudflare Worker — API backend pour KDMC Studio
 * Déclenche GitHub Actions, récupère le statut, sert de proxy
 *
 * Déploiement : npx wrangler deploy
 * Variables d'environnement (Cloudflare Secrets) :
 *   GITHUB_TOKEN — Personal Access Token avec scope "repo" + "workflow"
 */

const REPO_OWNER = "9r4rxssx64-creator";
const REPO_NAME = "CMCteams";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === "/api/generate") return handleGenerate(request, env);
      if (path === "/api/status") return handleStatus(env);
      if (path === "/api/videos") return handleVideos(env);
      if (path === "/api/health") return jsonResponse({ ok: true, ts: Date.now() });

      return jsonResponse({ error: "Route inconnue" }, 404);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  },
};

async function handleGenerate(request, env) {
  const body = await request.json().catch(() => ({}));
  const niche = body.niche || "betrayal-revenge";
  const format = body.format || "long";
  const template = body.template || "narrative-storytelling";

  const resp = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/social-publish.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "KDMC-Studio",
      },
      body: JSON.stringify({
        ref: "main",
        inputs: {
          niche: niche,
          format: format,
          publish_platforms: "youtube",
        },
      }),
    }
  );

  if (resp.status === 204) {
    return jsonResponse({
      ok: true,
      message: "Vidéo en cours de génération",
      niche,
      format,
      template,
      estimatedMinutes: 10,
    });
  }

  const errText = await resp.text();
  return jsonResponse({ ok: false, error: `GitHub API: ${resp.status}`, detail: errText }, 500);
}

async function handleStatus(env) {
  const resp = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/social-publish.yml/runs?per_page=5`,
    {
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "KDMC-Studio",
      },
    }
  );

  const data = await resp.json();
  const runs = (data.workflow_runs || []).map((r) => ({
    id: r.id,
    status: r.status,
    conclusion: r.conclusion,
    started: r.created_at,
    duration: r.updated_at,
    url: r.html_url,
  }));

  return jsonResponse({ ok: true, runs });
}

async function handleVideos(env) {
  const resp = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/social-publish.yml/runs?status=completed&per_page=20`,
    {
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "KDMC-Studio",
      },
    }
  );

  const data = await resp.json();
  const videos = (data.workflow_runs || [])
    .filter((r) => r.conclusion === "success")
    .map((r) => ({
      id: r.id,
      date: r.created_at,
      status: "publiée",
      url: r.html_url,
    }));

  return jsonResponse({ ok: true, count: videos.length, videos });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}
