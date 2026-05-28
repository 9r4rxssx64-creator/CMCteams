/*
 * vision-passes.js — Passes 3.B → 3.E (Claude Vision / GPT-4o Vision / Mistral OCR / Gemini Vision)
 *
 * Toutes les passes appellent le Worker proxy `cmc-parser-proxy` qui détient les
 * clés API (lues depuis les secrets GitHub via .github/workflows/cmc-parser-proxy-deploy.yml).
 * Le frontend n'a JAMAIS de clé API en clair.
 *
 * Convention de sortie commune (toutes les passes retournent le MÊME shape) :
 *   {
 *     passe: "B" | "C" | "D" | "E",
 *     tool:  "claude-vision" | "gpt4o-vision" | "mistral-ocr" | "gemini-vision",
 *     ok:    boolean,
 *     latency_ms: number,
 *     employees: [{ name: "DESARZENS K", days: { "1": "22/6", "2": "RH", ... } }],
 *     error: string | null,
 *     raw:   any   // réponse brute pour debug
 *   }
 *
 * RÈGLE ABSOLUE : ces fonctions LISENT le PDF, elles n'INVENTENT rien. Si une
 * cellule n'est pas claire, l'IA doit retourner null pour ce jour — le vote 4/4
 * mettra alors la cellule en needs_review.
 */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.VisionPasses = factory();
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ====================================================================
   * Config proxy
   * ==================================================================== */

  const STORAGE_KEY_URL = "cmc_parser_proxy_url";
  const STORAGE_KEY_TOKEN = "cmc_parser_proxy_token";

  // Cache mémoire pour l'auto-config chargée depuis proxy-config.json
  let _autoLoaded = null;

  function getProxyConfig() {
    // 1) sessionStorage (override manuel Kevin pour debug) en priorité
    if (typeof sessionStorage !== "undefined") {
      const url = sessionStorage.getItem(STORAGE_KEY_URL) || "";
      const token = sessionStorage.getItem(STORAGE_KEY_TOKEN) || "";
      if (url) {
        return { url: url.replace(/\/$/, ""), token: token || "", source: token ? "session_token" : "session_url" };
      }
    }
    // 2) Auto-config depuis proxy-config.json ou URL conventionnelle.
    // ⚠️ NB : loadAutoConfig() stocke l'URL dans _autoLoaded.worker_url
    // (clé issue du JSON proxy-config.json + objet synthetic). Le champ
    // _autoLoaded.url n'existe pas — bug historique corrigé ici.
    if (_autoLoaded && _autoLoaded.worker_url) {
      return {
        url: String(_autoLoaded.worker_url).replace(/\/$/, ""),
        token: "",
        source: _autoLoaded.source_method === "conventional_url_probe" ? "auto_conventional" : "auto_config_json"
      };
    }
    return null;
  }

  function setProxyConfig(url, token) {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(STORAGE_KEY_URL, url || "");
    sessionStorage.setItem(STORAGE_KEY_TOKEN, token || "");
  }

  function clearProxyConfig() {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.removeItem(STORAGE_KEY_URL);
    sessionStorage.removeItem(STORAGE_KEY_TOKEN);
  }

  /**
   * URLs conventionnelles à tester si proxy-config.json n'existe pas (encore).
   * Le subdomain Cloudflare de Kevin est `desarzens-kevin` (cf NOTES_USER).
   * On essaie aussi des variantes courantes — si /healthz répond, on adopte.
   */
  const CONVENTIONAL_URLS = [
    // Subdomain réel observé dans le workflow run : 9r4rxssx64 (username GitHub Kevin)
    "https://cmc-parser-proxy.9r4rxssx64.workers.dev",
    // Fallbacks éventuels au cas où Kevin reconfigure le subdomain Cloudflare
    "https://cmc-parser-proxy.desarzens-kevin.workers.dev",
    "https://cmc-parser-proxy.kdmc.workers.dev",
  ];

  /**
   * Probe une URL : GET /healthz, retourne true si 200.
   */
  async function probeUrl(baseUrl, timeoutMs) {
    timeoutMs = timeoutMs || 5000;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      const r = await fetch(baseUrl.replace(/\/$/, "") + "/healthz",
        { method: "GET", signal: ctrl.signal });
      clearTimeout(t);
      if (!r.ok) return false;
      const d = await r.json();
      return !!(d && d.ok);
    } catch (_) { return false; }
  }

  /**
   * Charge proxy-config.json (généré automatiquement par le workflow GitHub
   * Actions à chaque déploiement du worker). Kevin n'a RIEN à configurer.
   *
   * Fallback en cascade :
   *  1) Fetch ./proxy-config.json (cas nominal)
   *  2) Si absent → essaie les URLs conventionnelles (probe /healthz)
   *  3) Si rien ne répond → retour erreur structurée claire
   *
   * Retour : { ok, config?, error? } structuré.
   */
  async function loadAutoConfig(opts) {
    opts = opts || {};
    const url = opts.url || "./proxy-config.json";
    const triedUrls = [];

    // Tentative 1 : proxy-config.json (préféré — URL exacte connue)
    try {
      const r = await fetch(url + "?_t=" + Date.now(), { cache: "no-store" });
      if (r.ok) {
        const data = await r.json();
        if (data && data.worker_url) {
          _autoLoaded = data;
          return { ok: true, config: data, source: "proxy_config_json" };
        }
        triedUrls.push({ url, http: r.status, reason: "JSON sans champ worker_url" });
      } else {
        triedUrls.push({ url, http: r.status, reason: "HTTP " + r.status });
      }
    } catch (e) {
      triedUrls.push({ url, reason: "Exception : " + ((e && e.message) || String(e)) });
    }

    // Tentative 2 : URLs conventionnelles (fallback intelligent — Kevin n'a rien à faire)
    for (const conv of CONVENTIONAL_URLS) {
      const ok = await probeUrl(conv, 4000);
      triedUrls.push({ url: conv + "/healthz", probe_ok: ok });
      if (ok) {
        const synthetic = {
          worker_url: conv,
          auth_mode: "trusted_origin",
          source_method: "conventional_url_probe",
          tried_urls: triedUrls.slice(),
          note: "URL devinée via convention SBM Cloudflare. proxy-config.json absent ou non commité."
        };
        _autoLoaded = synthetic;
        return { ok: true, config: synthetic, source: "conventional_probe" };
      }
    }

    // Tentative 3 : tout a échoué — erreur claire structurée
    return { ok: false, error: {
      code: "auto_config_all_failed",
      message: "Impossible de trouver l'URL du proxy automatiquement.",
      detail: "Ni proxy-config.json ni les URLs conventionnelles ne répondent. URLs essayées : " + JSON.stringify(triedUrls).slice(0, 400),
      step: "loadAutoConfig:all_attempts_failed",
      tried: triedUrls,
      hint: "(1) Vérifier que le workflow cmc-parser-proxy-deploy.yml a réussi. (2) Sinon, configurer l'URL manuellement dans le bloc « 0. Proxy Vision IA »."
    }};
  }

  async function proxyHealthz() {
    const cfg = getProxyConfig();
    if (!cfg) {
      return {
        ok: false,
        error: {
          code: "proxy_not_configured",
          message: "Aucun proxy configuré.",
          detail: "URL et token absents (sessionStorage vide).",
          step: "healthz:precheck",
          hint: "Renseigner URL + X-Auth-Token dans le bloc « 0. Proxy Vision IA »."
        }
      };
    }
    let r, rawText = "", data = null;
    try {
      r = await fetch(cfg.url + "/healthz", { method: "GET" });
    } catch (e) {
      const ex = describeException(e);
      return {
        ok: false,
        error: {
          code: "network_error",
          message: "Impossible de joindre le proxy Cloudflare.",
          detail: ex.message,
          step: "healthz:fetch",
          exception_name: ex.name,
          where: ex.stack,
          hint: "Vérifier l'URL et la connexion réseau."
        }
      };
    }
    try { rawText = await r.text(); data = rawText ? JSON.parse(rawText) : null; }
    catch (_) { data = { _non_json_body: rawText.slice(0, 400) }; }
    if (!r.ok) {
      return {
        ok: false,
        http: r.status,
        data,
        error: {
          code: (data && data.code) || ("http_" + r.status),
          message: (data && data.message) || ("Le proxy a répondu HTTP " + r.status + "."),
          detail: (data && data.detail) || rawText.slice(0, 400),
          step: (data && data.step) || "healthz:response",
          http_status: r.status
        }
      };
    }
    return { ok: true, http: r.status, data };
  }

  /* ====================================================================
   * Prompt commun pour les 4 IA
   * ==================================================================== */

  const STRUCTURED_PROMPT = `Tu es un OCR strict pour un planning casino SBM Monaco (Convention 2015).

Le document fourni est un planning mensuel (cadres, chefs ou employés). Ta tâche :
LIRE EXACTEMENT ce qui est écrit, caractère pour caractère, SANS rien interpréter ni corriger.

Pour chaque employé visible :
- Extrais son nom format "NOM Initiale" (ex: "DESARZENS K")
- Pour chaque jour du mois (1 à 31, ou la plage visible), retourne le code horaire EXACT tel qu'il est écrit dans la cellule.
- Préserve TOUS les suffixes : ' (apostrophe simple), " (guillemet double), * (étoile), : (deux-points), c (chef minuscule), CDP (Café de Paris)
- Préserve la casse exacte (ex: "12H30/19" si écrit avec H majuscule, "12h30/19" si minuscule)
- Codes d'absence : RH, R, CP, AF, M, MAL, SS, ABI, AT, PAT, CFL, CRH, EDC
- Si une cellule est VIDE ou ILLISIBLE → retourne null (PAS de devinette, PAS d'invention)
- Si tu n'es PAS sûr à 100% d'une cellule → retourne null

Retourne UNIQUEMENT un JSON valide (pas de markdown, pas de prose) au format :
{
  "employees": [
    { "name": "DESARZENS K", "days": { "1": "22/6", "2": "RH", "3": null, ... } },
    ...
  ]
}

INTERDICTION ABSOLUE :
- Ne JAMAIS deviner une cellule vide
- Ne JAMAIS auto-corriger un code qui semble bizarre
- Ne JAMAIS uppercase/lowercase ou strip de suffixe
- Ne JAMAIS te baser sur un autre mois ou un pattern habituel`;

  /* ====================================================================
   * Helpers conversion blob → base64 / image PNG
   * ==================================================================== */

  function bytesToBase64(bytes) {
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  /**
   * Rasterise UNE page d'un PDF déjà chargé en PNG base64.
   * IMPORTANT : prend un objet `pdf` déjà chargé via getDocument (pas les bytes
   * bruts), parce que pdf.js DÉTACHE l'ArrayBuffer transmis à getDocument
   * (transferable) → un 2e appel avec les mêmes bytes échoue avec
   * « The object can not be cloned ». Bug observé runtime sur PDFs SBM.
   */
  async function pdfPageToPngBase64FromDoc(pdf, pageNum, scale) {
    if (!pdf || typeof pdf.getPage !== "function") {
      throw new Error("pdfPageToPngBase64FromDoc : objet pdf invalide (utilise getDocument().promise d'abord)");
    }
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: scale || 2.0 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport }).promise;
    const dataUrl = canvas.toDataURL("image/png");
    return dataUrl.replace(/^data:image\/png;base64,/, "");
  }

  function tryParseJson(text) {
    if (!text || typeof text !== "string") return null;
    // 1) Direct
    try { return JSON.parse(text); } catch (_) { /* */ }
    // 2) Extraction depuis bloc markdown ```json
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) {
      try { return JSON.parse(fence[1]); } catch (_) { /* */ }
    }
    // 3) Extraction du 1er object { ... }
    const obj = text.match(/\{[\s\S]*\}/);
    if (obj) {
      try { return JSON.parse(obj[0]); } catch (_) { /* */ }
    }
    return null;
  }

  /**
   * Construit un objet d'erreur structuré commun à toutes les passes.
   * Garantit : code machine + message FR clair + detail technique exact + step + hint.
   * (CLAUDE.md règle absolue « TOUJOURS DÉTAILLER LES ERREURS PARTOUT, CAUSE EXACTE »)
   */
  function makeErr(code, message, detail, step, extra) {
    return Object.assign({
      code: code || "unknown",
      message: message || "",
      detail: detail == null ? null : (typeof detail === "string" ? detail : (function () {
        try { return JSON.stringify(detail).slice(0, 600); } catch (_) { return String(detail).slice(0, 600); }
      })()),
      step: step || "",
      ts: new Date().toISOString()
    }, extra || {});
  }

  function describeException(e) {
    if (!e) return { message: "(exception vide)", name: "", stack: "" };
    if (typeof e === "string") return { message: e, name: "", stack: "" };
    return {
      name: (e && e.name) || "",
      message: (e && e.message) || String(e),
      stack: (e && e.stack ? String(e.stack).split("\n").slice(0, 4).join(" | ") : "")
    };
  }

  /* ====================================================================
   * Passe B — Claude Sonnet 4.6 Vision (accepte PDF natif)
   * ==================================================================== */

  async function runClaudeVision(captureBytes, mime, opts) {
    opts = opts || {};
    const cfg = getProxyConfig();
    const started = Date.now();
    const out = { passe: "B", tool: "claude-vision", ok: false, latency_ms: 0, employees: [], error: null, raw: null };
    if (!cfg) {
      out.error = makeErr("proxy_not_configured",
        "Le proxy Vision IA n'est pas configuré.",
        "URL et token absents (sessionStorage vide).",
        "claude:precheck",
        { hint: "Renseigner l'URL et le X-Auth-Token dans le bloc « 0. Proxy Vision IA »." });
      out.latency_ms = Date.now() - started;
      return out;
    }
    try {
      const myBytes = cloneBytes(captureBytes);  // clone INDÉPENDANT (anti-detach)
      const isPdf = mime === "application/pdf";
      const contentBlocks = [];
      if (isPdf) {
        contentBlocks.push({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: bytesToBase64(myBytes) }
        });
      } else {
        contentBlocks.push({
          type: "image",
          source: { type: "base64", media_type: mime || "image/png", data: bytesToBase64(myBytes) }
        });
      }
      contentBlocks.push({ type: "text", text: STRUCTURED_PROMPT });

      // Modèle par défaut : claude-sonnet-4-6 (CLAUDE.md mentionne disponible
      // largement). Fallback automatique sur d'autres modèles si 404 (modèle
      // inconnu) ou 403 (pas d'accès à ce snapshot).
      const candidates = opts.model
        ? [opts.model]
        : ["claude-sonnet-4-6", "claude-sonnet-4-5", "claude-opus-4-7", "claude-haiku-4-5"];
      const body = {
        model: candidates[0],
        max_tokens: 8192,
        messages: [{ role: "user", content: contentBlocks }]
      };
      // max_tokens : 11625 cellules × ~5 tokens + structure JSON ≈ 60k tokens.
      // claude-sonnet-4-6 supporte jusqu'à 64k output. On alloue 32k pour avoir
      // marge sans coûter trop (l'API ne facture que les tokens réellement émis).
      body.max_tokens = 32768;

      // Boucle fallback modèles : si 404 (model not found) ou 403 sur ce
      // snapshot précis, on essaie le candidat suivant. 401 = clé invalide
      // → on s'arrête immédiatement (pas la peine d'essayer d'autres modèles).
      let r, rawText = "", data = null, modelTried = candidates[0];
      let lastError = null;
      for (let mi = 0; mi < candidates.length; mi++) {
        modelTried = candidates[mi];
        body.model = modelTried;
        try {
          r = await fetch(cfg.url + "/v1/anthropic", {
            method: "POST",
            headers: { "content-type": "application/json", "X-Auth-Token": cfg.token },
            body: JSON.stringify(body)
          });
        } catch (e) {
          const ex = describeException(e);
          out.error = makeErr("network_error",
            "Impossible de joindre le proxy Cloudflare.",
            ex.message, "claude:fetch",
            { exception_name: ex.name, where: ex.stack, hint: "Vérifier la connexion réseau et l'URL du proxy." });
          return out;
        }
        try {
          rawText = await r.text();
          data = rawText ? JSON.parse(rawText) : null;
        } catch (_) {
          data = { _non_json_body: rawText.slice(0, 400) };
        }
        if (r.ok) break;
        // 401 = clé invalide, inutile d'essayer d'autres modèles
        if (r.status === 401) {
          lastError = { code: "upstream_unauthorized", model: modelTried, data, status: 401 };
          break;
        }
        // 404 ou 403 ou 400 (model_not_found) → essaie modèle suivant
        const upstreamMsgLc = String((data && data.error && data.error.message) || (data && data.message) || rawText || "").toLowerCase();
        if (r.status === 404 || r.status === 403 ||
            upstreamMsgLc.includes("model") && upstreamMsgLc.includes("not")) {
          lastError = { code: "model_unavailable", model: modelTried, data, status: r.status };
          continue;
        }
        // Toute autre erreur → on s'arrête
        lastError = { code: "http_" + r.status, model: modelTried, data, status: r.status };
        break;
      }
      out.raw = { last_response: data, model_tried: modelTried, all_candidates: candidates };
      if (!r || !r.ok) {
        out.error = makeErr(
          (data && data.code) || (lastError && lastError.code) || ("http_" + (r && r.status || "?")),
          (data && data.message) || ("Erreur HTTP " + (r && r.status) + " côté proxy/Claude (modèle: " + modelTried + ")."),
          (data && data.detail) || rawText.slice(0, 400),
          (data && data.step) || "claude:proxy_response",
          {
            http_status: r && r.status,
            upstream: data,
            model_tried: modelTried,
            all_models_tried: candidates,
            hint: (data && data.hint) || (r && r.status === 401
              ? "Vérifier que le secret GitHub ANTHROPIC_API_KEY contient la clé qui fonctionne dans Apex AI."
              : "Modèle " + modelTried + " indisponible. Essayer manuellement opts.model='claude-opus-4-7'.")
          }
        );
      } else {
        const text = (data && data.content || []).filter(c => c.type === "text").map(c => c.text).join("\n");
        const parsed = tryParseJson(text);
        if (parsed && Array.isArray(parsed.employees)) {
          out.employees = parsed.employees;
          out.ok = true;
        } else {
          out.error = makeErr("json_unparseable",
            "Claude a répondu mais sa sortie n'est pas un JSON {employees:[…]} parsable.",
            "Aperçu réponse texte : " + (text || "(vide)").slice(0, 300),
            "claude:parse_response",
            { response_preview: (text || "").slice(0, 600), hint: "Vérifier le prompt STRUCTURED_PROMPT ou réessayer." });
        }
      }
    } catch (e) {
      const ex = describeException(e);
      out.error = makeErr("uncaught_exception",
        "Exception inattendue pendant l'appel Claude.",
        ex.message,
        "claude:uncaught",
        { exception_name: ex.name, where: ex.stack });
    } finally {
      out.latency_ms = Date.now() - started;
    }
    return out;
  }

  /**
   * Helper CRITIQUE : retourne un clone INDÉPENDANT du buffer source.
   * Indispensable parce que pdf.js, et plusieurs APIs Vision (Mistral, Gemini),
   * peuvent DÉTACHER l'ArrayBuffer transmis (transferable). Si on partage le
   * même buffer entre 4 passes parallèles, la 1ère qui le détache rend les 3
   * autres invalides → erreurs « ArrayBuffer has been detached »,
   * « document has no pages », « application/x-empty ».
   *
   * Usage : appeler cloneBytes(captureBytes) au TOUT DÉBUT de chaque passe,
   * avant tout fetch ou getDocument.
   */
  function cloneBytes(srcBytes) {
    if (!srcBytes) throw new Error("cloneBytes: source vide");
    // new Uint8Array(srcBytes) crée une vue partageant le même buffer.
    // .slice() FORCE une copie indépendante (nouveau buffer, GC-safe).
    return new Uint8Array(srcBytes).slice();
  }

  /* ====================================================================
   * Passe C — GPT-4o Vision (images uniquement → on rasterise le PDF)
   * ==================================================================== */

  /**
   * Wrapper commun pour un appel proxy + parsing JSON + capture d'erreurs détaillée.
   * Toutes les passes (B/C/D/E) passent par cette fonction pour garantir des erreurs
   * structurées et la cause exacte préservée.
   */
  async function callProxyAndExtract(out, cfg, providerName, providerLabel, endpoint, body, extractText) {
    let r, rawText = "", data = null;
    // 1) Appel proxy
    try {
      r = await fetch(cfg.url + endpoint, {
        method: "POST",
        headers: { "content-type": "application/json", "X-Auth-Token": cfg.token },
        body: JSON.stringify(body)
      });
    } catch (e) {
      const ex = describeException(e);
      out.error = makeErr("network_error",
        `Impossible de joindre le proxy Cloudflare pour ${providerLabel}.`,
        ex.message,
        `${providerName}:fetch`,
        { exception_name: ex.name, where: ex.stack, hint: "Vérifier la connexion réseau et l'URL du proxy." });
      return;
    }
    // 2) Lecture body (essaie JSON, garde brut en fallback)
    try {
      rawText = await r.text();
      data = rawText ? JSON.parse(rawText) : null;
    } catch (_) {
      data = { _non_json_body: rawText.slice(0, 400) };
    }
    out.raw = data;
    // 3) Erreur HTTP : exposer la chaîne d'erreur structurée du proxy
    if (!r.ok) {
      out.error = makeErr(
        (data && data.code) || ("http_" + r.status),
        (data && data.message) || `Erreur HTTP ${r.status} côté proxy/${providerLabel}.`,
        (data && data.detail) || rawText.slice(0, 400),
        (data && data.step) || `${providerName}:proxy_response`,
        { http_status: r.status, upstream: data, hint: data && data.hint }
      );
      return;
    }
    // 4) Succès → extraction texte + parsing JSON structuré
    let text = "";
    try {
      text = extractText(data) || "";
    } catch (e) {
      const ex = describeException(e);
      out.error = makeErr("response_shape_unexpected",
        `Forme de réponse inattendue pour ${providerLabel}.`,
        ex.message,
        `${providerName}:extract_text`,
        { exception_name: ex.name, where: ex.stack, response_preview: JSON.stringify(data).slice(0, 400) });
      return;
    }
    const parsed = tryParseJson(text);
    if (parsed && Array.isArray(parsed.employees)) {
      out.employees = parsed.employees;
      out.ok = true;
    } else {
      out.error = makeErr("json_unparseable",
        `${providerLabel} a répondu mais sa sortie n'est pas un JSON {employees:[…]} parsable.`,
        "Aperçu réponse texte : " + (text || "(vide)").slice(0, 300),
        `${providerName}:parse_response`,
        { response_preview: (text || "").slice(0, 600), hint: "Vérifier le prompt STRUCTURED_PROMPT ou réessayer." });
    }
  }

  async function runGPT4oVision(captureBytes, mime, opts) {
    opts = opts || {};
    const cfg = getProxyConfig();
    const started = Date.now();
    const out = { passe: "C", tool: "gpt4o-vision", ok: false, latency_ms: 0, employees: [], error: null, raw: null };
    if (!cfg) {
      out.error = makeErr("proxy_not_configured",
        "Le proxy Vision IA n'est pas configuré.",
        "URL et token absents (sessionStorage vide).",
        "gpt4o:precheck",
        { hint: "Renseigner l'URL et le X-Auth-Token dans le bloc « 0. Proxy Vision IA »." });
      out.latency_ms = Date.now() - started;
      return out;
    }
    try {
      const isPdf = mime === "application/pdf";
      const imageMessages = [];
      if (isPdf) {
        try {
          if (window.PlanningParserPipeline && typeof window.PlanningParserPipeline.ensurePdfJsReady === "function") {
            await window.PlanningParserPipeline.ensurePdfJsReady();
          }
        } catch (e) {
          out.error = makeErr("pdfjs_load_failed",
            "PDF.js n'a pas pu être chargé depuis le CDN.",
            (e && e.message) || String(e),
            "gpt4o:pdfjs_load",
            { hint: "Vérifier la connexion internet et que le CDN cdnjs.cloudflare.com est accessible." });
          return out;
        }
        try {
          // Clone indépendant — anti detach (cf cloneBytes doc)
          const bytesClone = cloneBytes(captureBytes);
          const pdf = await window.pdfjsLib.getDocument({ data: bytesClone }).promise;
          const maxPages = Math.min(pdf.numPages, opts.maxPages || 8);
          for (let i = 1; i <= maxPages; i++) {
            const b64 = await pdfPageToPngBase64FromDoc(pdf, i, opts.scale || 2.0);
            imageMessages.push({ type: "image_url", image_url: { url: "data:image/png;base64," + b64 } });
          }
        } catch (e) {
          const ex = describeException(e);
          out.error = makeErr("pdf_rasterize_failed",
            "Échec de la rasterisation du PDF en images PNG pour GPT-4o.",
            ex.message,
            "gpt4o:rasterize",
            { exception_name: ex.name, where: ex.stack });
          return out;
        }
      } else {
        const myBytes = cloneBytes(captureBytes);
        imageMessages.push({
          type: "image_url",
          image_url: { url: "data:" + (mime || "image/png") + ";base64," + bytesToBase64(myBytes) }
        });
      }

      const body = {
        model: opts.model || "gpt-4o",
        // 11625 cellules × ~5 tokens + JSON ≈ 60k. GPT-4o max 16384 output.
        // On utilise le max pour avoir le plus de chances de cap toutes les
        // cellules. Si insuffisant, le résultat sera tronqué — détecté par le
        // parser JSON qui retournera une erreur claire.
        max_tokens: 16384,
        messages: [{
          role: "user",
          content: [{ type: "text", text: STRUCTURED_PROMPT }, ...imageMessages]
        }]
      };
      await callProxyAndExtract(out, cfg, "gpt4o", "GPT-4o", "/v1/openai", body,
        (data) => data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || "");
    } catch (e) {
      const ex = describeException(e);
      out.error = makeErr("uncaught_exception",
        "Exception inattendue pendant l'appel GPT-4o.",
        ex.message,
        "gpt4o:uncaught",
        { exception_name: ex.name, where: ex.stack });
    } finally {
      out.latency_ms = Date.now() - started;
    }
    return out;
  }

  /* ====================================================================
   * Passe D — Mistral OCR (endpoint Document AI)
   * ==================================================================== */

  async function runMistralOCR(captureBytes, mime, opts) {
    opts = opts || {};
    const cfg = getProxyConfig();
    const started = Date.now();
    const out = { passe: "D", tool: "mistral-ocr", ok: false, latency_ms: 0, employees: [], error: null, raw: null };
    if (!cfg) {
      out.error = makeErr("proxy_not_configured",
        "Le proxy Vision IA n'est pas configuré.",
        "URL et token absents (sessionStorage vide).",
        "mistral:precheck",
        { hint: "Renseigner l'URL et le X-Auth-Token dans le bloc « 0. Proxy Vision IA »." });
      out.latency_ms = Date.now() - started;
      return out;
    }
    try {
      const isPdf = mime === "application/pdf";
      // Refactor 2026-05-27 : Pixtral-large via /v1/chat/completions au lieu
      // de l'endpoint OCR pur (qui retournait markdown brut non parsable pour
      // le vote unanime). Format identique à GPT-4o (rasterise PDF en images).
      const imageMessages = [];
      if (isPdf) {
        try {
          if (window.PlanningParserPipeline && typeof window.PlanningParserPipeline.ensurePdfJsReady === "function") {
            await window.PlanningParserPipeline.ensurePdfJsReady();
          }
          const bytesClone = cloneBytes(captureBytes);
          const pdf = await window.pdfjsLib.getDocument({ data: bytesClone }).promise;
          const maxPages = Math.min(pdf.numPages, opts.maxPages || 8);
          for (let i = 1; i <= maxPages; i++) {
            const b64 = await pdfPageToPngBase64FromDoc(pdf, i, opts.scale || 2.0);
            imageMessages.push({ type: "image_url", image_url: "data:image/png;base64," + b64 });
          }
        } catch (e) {
          const ex = describeException(e);
          out.error = makeErr("pdf_rasterize_failed",
            "Échec rasterisation PDF pour Pixtral-large.",
            ex.message, "mistral:rasterize",
            { exception_name: ex.name, where: ex.stack });
          return out;
        }
      } else {
        const myBytes = cloneBytes(captureBytes);
        imageMessages.push({
          type: "image_url",
          image_url: "data:" + (mime || "image/png") + ";base64," + bytesToBase64(myBytes)
        });
      }

      const body = {
        model: opts.model || "pixtral-large-latest",
        max_tokens: 16384,
        messages: [{
          role: "user",
          content: [{ type: "text", text: STRUCTURED_PROMPT }, ...imageMessages]
        }],
        response_format: { type: "json_object" }
      };
      await callProxyAndExtract(out, cfg, "mistral", "Pixtral-large", "/v1/mistral", body,
        (data) => data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || "");
    } catch (e) {
      const ex = describeException(e);
      out.error = makeErr("uncaught_exception",
        "Exception inattendue pendant l'appel Mistral OCR.",
        ex.message,
        "mistral:uncaught",
        { exception_name: ex.name, where: ex.stack });
    } finally {
      out.latency_ms = Date.now() - started;
    }
    return out;
  }

  /* ====================================================================
   * Passe E — Gemini 2.5 Pro Vision (accepte PDF natif via inline_data)
   * ==================================================================== */

  async function runGeminiVision(captureBytes, mime, opts) {
    opts = opts || {};
    const cfg = getProxyConfig();
    const started = Date.now();
    const out = { passe: "E", tool: "gemini-vision", ok: false, latency_ms: 0, employees: [], error: null, raw: null };
    if (!cfg) {
      out.error = makeErr("proxy_not_configured",
        "Le proxy Vision IA n'est pas configuré.",
        "URL et token absents (sessionStorage vide).",
        "gemini:precheck",
        { hint: "Renseigner l'URL et le X-Auth-Token dans le bloc « 0. Proxy Vision IA »." });
      out.latency_ms = Date.now() - started;
      return out;
    }
    try {
      const myBytes = cloneBytes(captureBytes);  // anti-detach
      const useMime = mime === "application/pdf" ? "application/pdf" : (mime || "image/png");
      // 2026-05-27 : retiré responseMimeType=application/json qui causait
      // réponse vide sur PDFs complexes (Gemini gère mal JSON strict + inline_data
      // PDF). tryParseJson() extrait le JSON depuis text classique ou bloc ```json```.
      const body = {
        contents: [{
          role: "user",
          parts: [
            { text: STRUCTURED_PROMPT },
            { inline_data: { mime_type: useMime, data: bytesToBase64(myBytes) } }
          ]
        }],
        generationConfig: { temperature: 0, maxOutputTokens: 32768 }
      };
      await callProxyAndExtract(out, cfg, "gemini", "Gemini",
        "/v1/gemini?model=" + encodeURIComponent(opts.model || "gemini-2.5-pro"), body,
        (data) => (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts || []).map(p => p.text || "").join("\n"));
    } catch (e) {
      const ex = describeException(e);
      out.error = makeErr("uncaught_exception",
        "Exception inattendue pendant l'appel Gemini.",
        ex.message,
        "gemini:uncaught",
        { exception_name: ex.name, where: ex.stack });
    } finally {
      out.latency_ms = Date.now() - started;
    }
    return out;
  }

  /* ====================================================================
   * Orchestrateur Phase 3.B → 3.E (parallèle, Promise.allSettled)
   * ==================================================================== */

  async function runAllVisionPasses(captureBytes, mime, opts) {
    opts = opts || {};
    const TIMEOUT = opts.timeout_ms || 45000;
    // Wrap chaque passe avec un timeout dur. Si timeout → erreur structurée claire.
    function withTimeout(promiseFactory, ms, passe, tool) {
      return new Promise((resolve) => {
        const started = Date.now();
        let settled = false;
        const t = setTimeout(() => {
          if (settled) return;
          settled = true;
          resolve({
            passe, tool, ok: false, latency_ms: Date.now() - started, employees: [],
            error: makeErr("timeout",
              `${tool} n'a pas répondu dans le délai imparti (${ms} ms).`,
              `Timeout ${ms} ms dépassé pour la passe ${passe}/${tool}.`,
              `${tool}:timeout`,
              { hint: "Augmenter opts.timeout_ms ou vérifier la santé du provider." }),
            raw: null
          });
        }, ms);
        Promise.resolve()
          .then(promiseFactory)
          .then((res) => {
            if (settled) return;
            settled = true;
            clearTimeout(t);
            resolve(res);
          })
          .catch((e) => {
            if (settled) return;
            settled = true;
            clearTimeout(t);
            const ex = describeException(e);
            resolve({
              passe, tool, ok: false, latency_ms: Date.now() - started, employees: [],
              error: makeErr("uncaught_in_wrapper",
                `Exception non capturée par la passe ${tool}.`,
                ex.message,
                `${tool}:wrapper`,
                { exception_name: ex.name, where: ex.stack }),
              raw: null
            });
          });
      });
    }
    return await Promise.all([
      withTimeout(() => runClaudeVision(captureBytes, mime, opts), TIMEOUT, "B", "claude-vision"),
      withTimeout(() => runGPT4oVision(captureBytes, mime, opts), TIMEOUT, "C", "gpt4o-vision"),
      withTimeout(() => runMistralOCR(captureBytes, mime, opts), TIMEOUT, "D", "mistral-ocr"),
      withTimeout(() => runGeminiVision(captureBytes, mime, opts), TIMEOUT, "E", "gemini-vision"),
    ]);
  }

  /* ====================================================================
   * Export
   * ==================================================================== */

  return {
    getProxyConfig, setProxyConfig, clearProxyConfig, proxyHealthz, loadAutoConfig,
    runClaudeVision, runGPT4oVision, runMistralOCR, runGeminiVision,
    runAllVisionPasses,
    STRUCTURED_PROMPT,
    VERSION: "T1-vision-v0.7.0-lieu-encadres-teams"
  };
}));
