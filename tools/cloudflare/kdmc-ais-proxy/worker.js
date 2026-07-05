/**
 * kdmc-ais-proxy — relais AIS MONDIAL pour World Monitor (kd-mc.com).
 *
 * POURQUOI : la page World Monitor affiche déjà les navires via Digitraffic (gratuit,
 * sans clé) MAIS Digitraffic ne couvre que la Baltique/Finlande. La seule source AIS
 * live *mondiale* gratuite est aisstream.io, qui exige une CLÉ (gratuite) ET une
 * connexion WebSocket persistante — impossible depuis une page statique. Ce worker fait
 * le pont : il garde UNE WebSocket vers aisstream.io côté serveur, met en cache les
 * dernières positions en mémoire, et les expose en GeoJSON que la page interroge en HTTP.
 *
 *   GET /health           → {ok:true, ships:<n>, hasKey:<bool>, connected:<bool>, ts}
 *   GET /ships?bbox=minLon,minLat,maxLon,maxLat&limit=800 → FeatureCollection GeoJSON
 *   OPTIONS               → préflight CORS
 *
 * SÉCURITÉ (règles CLAUDE.md) :
 * - La clé aisstream reste un SECRET Cloudflare (env.AISSTREAM_KEY) — JAMAIS exposée au client.
 * - Anti open-proxy : navigateur autorisé uniquement depuis une Origin whitelist
 *   (kd-mc.com, *.kd-mc.com, github.io, localhost). Lecture seule.
 * - FAIL-OPEN : sans clé, /ships renvoie une FeatureCollection VIDE (200) → la page
 *   bascule proprement sur Digitraffic (Baltique). Aucune panne, aucune régression.
 *
 * URL prod : https://kdmc-ais-proxy.9r4rxssx64.workers.dev  (sous-domaine du COMPTE — leçon #85)
 */

const ORIGIN_OK = [
  /^https?:\/\/kd-mc\.com$/i,
  /^https?:\/\/[a-z0-9-]+\.kd-mc\.com$/i,
  /^https?:\/\/9r4rxssx64-creator\.github\.io$/i,
  /^https?:\/\/localhost(:\d+)?$/i,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/i,
];

function cors(origin) {
  const allow = origin && ORIGIN_OK.some((re) => re.test(origin)) ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}
function json(obj, origin, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }, cors(origin)),
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });

    const hasKey = !!(env.AISSTREAM_KEY && String(env.AISSTREAM_KEY).length > 8);

    // Helper : appelle le Durable Object avec un hostname SYNTHÉTIQUE (le host est ignoré
    // pour le routage DO), en CAPTURANT toute erreur DO (au lieu de laisser Cloudflare
    // renvoyer une page « error code: 10xx »). Le message exact remonte pour diagnostic.
    async function callDO(path) {
      const id = env.AIS_HUB.idFromName("global");
      const stub = env.AIS_HUB.get(id);
      const fwd = new URL(path, "https://ais-hub.internal");
      fwd.searchParams.set("_haskey", hasKey ? "1" : "0");
      const r = await stub.fetch(new Request(fwd.toString(), { method: "GET" }));
      return await r.json();
    }

    // /health : répond TOUJOURS au niveau worker (prouve que le worker tourne). On tente
    // en plus le DO et on joint son état OU l'erreur exacte — sans jamais faire échouer /health.
    if (url.pathname === "/health") {
      let doState = null, doError = null;
      try { doState = await callDO("/health"); }
      catch (e) { doError = String((e && e.message) || e); }
      return json({ ok: true, hasKey, worker: "up", do: doState, doError, ts: Date.now() }, origin);
    }

    // /ships : FAIL-OPEN. Si le DO échoue (plan, migration, 1042…), on renvoie une
    // FeatureCollection VIDE + la note d'erreur → World Monitor bascule sur Digitraffic
    // (Baltique), zéro régression, et le message exact du DO est visible.
    if (url.pathname === "/ships") {
      try {
        const data = await callDO(url.pathname + url.search);
        return json(data, origin);
      } catch (e) {
        return json({ type: "FeatureCollection", features: [], note: "DO indisponible: " + String((e && e.message) || e) }, origin);
      }
    }

    return json({ ok: false, error: "not_found", endpoints: ["/health", "/ships?bbox=…"] }, origin, 404);
  },
};

/**
 * AisHubShips — Durable Object (storage SQLite, compatible plan FREE) : maintient la
 * WebSocket aisstream.io et met en cache les positions par MMSI (Map en mémoire, capée,
 * TTL). Un alarm() reconnecte si la WS tombe.
 */
export class AisHubShips {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.ships = new Map(); // mmsi -> {lat, lon, sog, cog, name, ts}
    this.ws = null;
    this.connected = false;
    this.MAX = 6000;
    this.TTL = 15 * 60 * 1000; // 15 min sans update → position périmée
  }

  async fetch(request) {
    const url = new URL(request.url);
    const hasKey = url.searchParams.get("_haskey") === "1";

    // Démarre/relance la connexion AIS si on a une clé et qu'on n'est pas connecté.
    if (hasKey && !this.connected) this.connect().catch(() => {});
    // Alarme de maintien (reconnexion) toutes les 30 s.
    try { const cur = await this.state.storage.getAlarm(); if (cur == null) await this.state.storage.setAlarm(Date.now() + 30000); } catch (e) {}

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true, ships: this.liveCount(), hasKey, connected: this.connected, ts: Date.now() }), { headers: { "content-type": "application/json" } });
    }

    // /ships → GeoJSON, filtré par bbox optionnel.
    const bbox = (url.searchParams.get("bbox") || "").split(",").map(Number);
    const hasBox = bbox.length === 4 && bbox.every((n) => Number.isFinite(n));
    const limit = Math.max(1, Math.min(2000, parseInt(url.searchParams.get("limit") || "800", 10) || 800));
    const now = Date.now();
    const feats = [];
    for (const [mmsi, s] of this.ships) {
      if (now - s.ts > this.TTL) continue;
      if (hasBox && (s.lon < bbox[0] || s.lon > bbox[2] || s.lat < bbox[1] || s.lat > bbox[3])) continue;
      feats.push({ type: "Feature", geometry: { type: "Point", coordinates: [s.lon, s.lat] }, properties: { mmsi, sog: s.sog, cog: s.cog, name: s.name } });
      if (feats.length >= limit) break;
    }
    return new Response(JSON.stringify({ type: "FeatureCollection", features: feats, note: hasKey ? undefined : "AISSTREAM_KEY manquant — bascule Digitraffic côté page" }), { headers: { "content-type": "application/json" } });
  }

  liveCount() {
    const now = Date.now();
    let n = 0;
    for (const s of this.ships.values()) if (now - s.ts <= this.TTL) n++;
    return n;
  }

  async alarm() {
    // Reconnecte si besoin, puis re-arme l'alarme.
    if (this.env.AISSTREAM_KEY && !this.connected) this.connect().catch(() => {});
    try { await this.state.storage.setAlarm(Date.now() + 30000); } catch (e) {}
  }

  async connect() {
    const key = this.env.AISSTREAM_KEY;
    if (!key) return;
    this.connected = true;
    try {
      const resp = await fetch("https://stream.aisstream.io/v0/stream", { headers: { Upgrade: "websocket" } });
      const ws = resp.webSocket;
      if (!ws) { this.connected = false; return; }
      ws.accept();
      this.ws = ws;
      // Abonnement : monde entier, positions uniquement.
      ws.send(JSON.stringify({ APIKey: key, BoundingBoxes: [[[-90, -180], [90, 180]]], FilterMessageTypes: ["PositionReport"] }));
      ws.addEventListener("message", (ev) => {
        try {
          const m = JSON.parse(typeof ev.data === "string" ? ev.data : "");
          const pr = m && m.Message && m.Message.PositionReport;
          const meta = m && m.MetaData;
          if (!pr || !meta) return;
          const mmsi = String(meta.MMSI || pr.UserID || "");
          if (!mmsi) return;
          this.ships.set(mmsi, {
            lat: pr.Latitude, lon: pr.Longitude,
            sog: pr.Sog, cog: pr.Cog,
            name: (meta.ShipName || "").trim(),
            ts: Date.now(),
          });
          if (this.ships.size > this.MAX) { const k = this.ships.keys().next().value; this.ships.delete(k); }
        } catch (e) {}
      });
      const drop = () => { this.connected = false; this.ws = null; };
      ws.addEventListener("close", drop);
      ws.addEventListener("error", drop);
    } catch (e) {
      this.connected = false;
    }
  }
}
