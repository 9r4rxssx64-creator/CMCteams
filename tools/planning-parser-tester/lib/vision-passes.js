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
    // 2) Auto-config depuis proxy-config.json (mode trusted_origin, zéro saisie)
    if (_autoLoaded && _autoLoaded.url) {
      return { url: _autoLoaded.url.replace(/\/$/, ""), token: "", source: "auto_config" };
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
   * Charge proxy-config.json (généré automatiquement par le workflow GitHub
   * Actions à chaque déploiement du worker). Kevin n'a RIEN à configurer.
   *
   * Retour : { ok, config?, error? } structuré.
   */
  async function loadAutoConfig(opts) {
    opts = opts || {};
    const url = opts.url || "./proxy-config.json";
    try {
      const r = await fetch(url + "?_t=" + Date.now(), { cache: "no-store" });
      if (!r.ok) {
        return { ok: false, error: {
          code: "auto_config_http_" + r.status,
          message: "Impossible de charger proxy-config.json (HTTP " + r.status + ").",
          detail: "URL: " + url + " — Le fichier sera créé automatiquement au prochain déploiement du worker via le workflow cmc-parser-proxy-deploy.yml.",
          step: "loadAutoConfig:fetch",
          http_status: r.status,
          hint: "Vérifier que le workflow Actions s'est exécuté avec succès."
        }};
      }
      const data = await r.json();
      if (!data || !data.worker_url) {
        return { ok: false, error: {
          code: "auto_config_invalid",
          message: "proxy-config.json est présent mais vide ou mal formé.",
          detail: "Champ worker_url absent. Contenu reçu : " + JSON.stringify(data).slice(0, 300),
          step: "loadAutoConfig:parse",
          hint: "Re-déclencher le workflow cmc-parser-proxy-deploy.yml."
        }};
      }
      _autoLoaded = data;
      return { ok: true, config: data };
    } catch (e) {
      return { ok: false, error: {
        code: "auto_config_exception",
        message: "Exception pendant le chargement de proxy-config.json.",
        detail: (e && e.message) || String(e),
        step: "loadAutoConfig:catch",
        hint: "Vérifier la console réseau du navigateur."
      }};
    }
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

  async function pdfPageToPngBase64(pdfBytes, pageNum, scale) {
    if (typeof window === "undefined" || !window.pdfjsLib) throw new Error("pdfjsLib requis");
    const pdf = await window.pdfjsLib.getDocument({ data: pdfBytes }).promise;
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
      const isPdf = mime === "application/pdf";
      const contentBlocks = [];
      if (isPdf) {
        contentBlocks.push({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: bytesToBase64(captureBytes) }
        });
      } else {
        contentBlocks.push({
          type: "image",
          source: { type: "base64", media_type: mime || "image/png", data: bytesToBase64(captureBytes) }
        });
      }
      contentBlocks.push({ type: "text", text: STRUCTURED_PROMPT });

      const body = {
        model: opts.model || "claude-sonnet-4-5-20250929",
        max_tokens: 8192,
        messages: [{ role: "user", content: contentBlocks }]
      };
      let r;
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
          ex.message,
          "claude:fetch",
          { exception_name: ex.name, where: ex.stack, hint: "Vérifier la connexion réseau et l'URL du proxy." });
        return out;
      }
      let data = null, rawText = "";
      try {
        rawText = await r.text();
        data = rawText ? JSON.parse(rawText) : null;
      } catch (_) {
        data = { _non_json_body: rawText.slice(0, 400) };
      }
      out.raw = data;
      if (!r.ok) {
        // Le proxy renvoie déjà un objet structuré {code, message, detail, step, ...}
        out.error = makeErr(
          (data && data.code) || ("http_" + r.status),
          (data && data.message) || ("Erreur HTTP " + r.status + " côté proxy/Claude."),
          (data && data.detail) || rawText.slice(0, 400),
          (data && data.step) || "claude:proxy_response",
          { http_status: r.status, upstream: data }
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
        if (!window.pdfjsLib) {
          out.error = makeErr("pdfjs_missing",
            "PDF.js n'est pas chargé — impossible de rasteriser le PDF pour GPT-4o.",
            "window.pdfjsLib indéfini",
            "gpt4o:rasterize",
            { hint: "Vérifier l'inclusion CDN de pdf.js dans index.html." });
          return out;
        }
        try {
          const pdf = await window.pdfjsLib.getDocument({ data: captureBytes }).promise;
          const maxPages = Math.min(pdf.numPages, opts.maxPages || 8);
          for (let i = 1; i <= maxPages; i++) {
            const b64 = await pdfPageToPngBase64(captureBytes, i, opts.scale || 2.0);
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
        imageMessages.push({
          type: "image_url",
          image_url: { url: "data:" + (mime || "image/png") + ";base64," + bytesToBase64(captureBytes) }
        });
      }

      const body = {
        model: opts.model || "gpt-4o",
        max_tokens: 8192,
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
      const documentObj = isPdf
        ? { type: "document_base64", document_base64: bytesToBase64(captureBytes), document_name: "planning.pdf" }
        : { type: "image_base64", image_base64: bytesToBase64(captureBytes), image_format: (mime && mime.replace("image/", "")) || "png" };

      const body = {
        model: opts.model || "mistral-ocr-latest",
        document: documentObj,
        include_image_base64: false
      };
      // Mistral OCR retourne `pages[]` avec `markdown` — on cherche un JSON {employees:[…]}
      // si présent ; sinon, on considère le résultat comme une sortie OCR brute (employees=[],
      // ok=true) et on garde un aperçu du markdown pour debug humain.
      let r, rawText = "", data = null;
      try {
        r = await fetch(cfg.url + "/v1/mistral", {
          method: "POST",
          headers: { "content-type": "application/json", "X-Auth-Token": cfg.token },
          body: JSON.stringify(body)
        });
      } catch (e) {
        const ex = describeException(e);
        out.error = makeErr("network_error",
          "Impossible de joindre le proxy Cloudflare pour Mistral OCR.",
          ex.message,
          "mistral:fetch",
          { exception_name: ex.name, where: ex.stack, hint: "Vérifier la connexion réseau et l'URL du proxy." });
        return out;
      }
      try { rawText = await r.text(); data = rawText ? JSON.parse(rawText) : null; }
      catch (_) { data = { _non_json_body: rawText.slice(0, 400) }; }
      out.raw = data;
      if (!r.ok) {
        out.error = makeErr(
          (data && data.code) || ("http_" + r.status),
          (data && data.message) || ("Erreur HTTP " + r.status + " côté proxy/Mistral OCR."),
          (data && data.detail) || rawText.slice(0, 400),
          (data && data.step) || "mistral:proxy_response",
          { http_status: r.status, upstream: data, hint: data && data.hint }
        );
        return out;
      }
      const md = ((data && data.pages) || []).map(p => p.markdown || "").join("\n");
      const parsed = tryParseJson(md);
      if (parsed && Array.isArray(parsed.employees)) {
        out.employees = parsed.employees;
        out.ok = true;
      } else {
        // Sortie OCR brute sans JSON : succès partiel, on garde pour debug.
        out.employees = [];
        out.ok = true;
        out.raw = Object.assign({}, data, { _markdown_preview: md.slice(0, 1000) });
      }
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
      const useMime = mime === "application/pdf" ? "application/pdf" : (mime || "image/png");
      const body = {
        contents: [{
          role: "user",
          parts: [
            { text: STRUCTURED_PROMPT },
            { inline_data: { mime_type: useMime, data: bytesToBase64(captureBytes) } }
          ]
        }],
        generationConfig: { temperature: 0, maxOutputTokens: 8192, responseMimeType: "application/json" }
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
    VERSION: "T1-vision-v0.2.0-auto"
  };
}));
