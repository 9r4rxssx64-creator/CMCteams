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

  function getProxyConfig() {
    // sessionStorage : auto-purge à la fermeture, jamais persisté Firebase.
    if (typeof sessionStorage === "undefined") return null;
    const url = sessionStorage.getItem(STORAGE_KEY_URL) || "";
    const token = sessionStorage.getItem(STORAGE_KEY_TOKEN) || "";
    if (!url || !token) return null;
    return { url: url.replace(/\/$/, ""), token };
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

  async function proxyHealthz() {
    const cfg = getProxyConfig();
    if (!cfg) return { ok: false, reason: "Proxy non configuré" };
    try {
      const r = await fetch(cfg.url + "/healthz", { method: "GET" });
      const data = await r.json();
      return { ok: r.ok, http: r.status, data };
    } catch (e) {
      return { ok: false, reason: "Fetch échoué : " + (e && e.message) };
    }
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

  /* ====================================================================
   * Passe B — Claude Sonnet 4.6 Vision (accepte PDF natif)
   * ==================================================================== */

  async function runClaudeVision(captureBytes, mime, opts) {
    opts = opts || {};
    const cfg = getProxyConfig();
    const started = Date.now();
    const out = { passe: "B", tool: "claude-vision", ok: false, latency_ms: 0, employees: [], error: null, raw: null };
    if (!cfg) { out.error = "Proxy non configuré"; return out; }
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
      const r = await fetch(cfg.url + "/v1/anthropic", {
        method: "POST",
        headers: { "content-type": "application/json", "X-Auth-Token": cfg.token },
        body: JSON.stringify(body)
      });
      const data = await r.json();
      out.raw = data;
      if (!r.ok) {
        out.error = "HTTP " + r.status + " : " + (data && (data.message || data.error?.message || JSON.stringify(data).slice(0, 200)));
      } else {
        const text = (data.content || []).filter(c => c.type === "text").map(c => c.text).join("\n");
        const parsed = tryParseJson(text);
        if (parsed && Array.isArray(parsed.employees)) {
          out.employees = parsed.employees;
          out.ok = true;
        } else {
          out.error = "JSON non parsable depuis réponse Claude";
        }
      }
    } catch (e) {
      out.error = e && e.message ? e.message : String(e);
    } finally {
      out.latency_ms = Date.now() - started;
    }
    return out;
  }

  /* ====================================================================
   * Passe C — GPT-4o Vision (images uniquement → on rasterise le PDF)
   * ==================================================================== */

  async function runGPT4oVision(captureBytes, mime, opts) {
    opts = opts || {};
    const cfg = getProxyConfig();
    const started = Date.now();
    const out = { passe: "C", tool: "gpt4o-vision", ok: false, latency_ms: 0, employees: [], error: null, raw: null };
    if (!cfg) { out.error = "Proxy non configuré"; return out; }
    try {
      const isPdf = mime === "application/pdf";
      const imageMessages = [];
      if (isPdf) {
        // Rasterise jusqu'à 8 pages (assez pour les PDFs SBM standards)
        const pdf = await window.pdfjsLib.getDocument({ data: captureBytes }).promise;
        const maxPages = Math.min(pdf.numPages, opts.maxPages || 8);
        for (let i = 1; i <= maxPages; i++) {
          const b64 = await pdfPageToPngBase64(captureBytes, i, opts.scale || 2.0);
          imageMessages.push({ type: "image_url", image_url: { url: "data:image/png;base64," + b64 } });
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
      const r = await fetch(cfg.url + "/v1/openai", {
        method: "POST",
        headers: { "content-type": "application/json", "X-Auth-Token": cfg.token },
        body: JSON.stringify(body)
      });
      const data = await r.json();
      out.raw = data;
      if (!r.ok) {
        out.error = "HTTP " + r.status + " : " + (data && (data.message || data.error?.message || JSON.stringify(data).slice(0, 200)));
      } else {
        const text = data.choices?.[0]?.message?.content || "";
        const parsed = tryParseJson(text);
        if (parsed && Array.isArray(parsed.employees)) {
          out.employees = parsed.employees;
          out.ok = true;
        } else {
          out.error = "JSON non parsable depuis réponse GPT-4o";
        }
      }
    } catch (e) {
      out.error = e && e.message ? e.message : String(e);
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
    if (!cfg) { out.error = "Proxy non configuré"; return out; }
    try {
      const isPdf = mime === "application/pdf";
      const documentObj = isPdf
        ? { type: "document_base64", document_base64: bytesToBase64(captureBytes), document_name: "planning.pdf" }
        : { type: "image_base64", image_base64: bytesToBase64(captureBytes), image_format: mime?.replace("image/", "") || "png" };

      const body = {
        model: opts.model || "mistral-ocr-latest",
        document: documentObj,
        include_image_base64: false
      };
      const r = await fetch(cfg.url + "/v1/mistral", {
        method: "POST",
        headers: { "content-type": "application/json", "X-Auth-Token": cfg.token },
        body: JSON.stringify(body)
      });
      const data = await r.json();
      out.raw = data;
      if (!r.ok) {
        out.error = "HTTP " + r.status + " : " + (data && (data.message || data.error?.message || JSON.stringify(data).slice(0, 200)));
      } else {
        // Mistral OCR retourne `pages[]` avec `markdown` — on essaie d'extraire un tableau JSON si possible,
        // sinon on délègue le parsing à une passe ultérieure et on retourne le markdown comme employees=[].
        const md = (data.pages || []).map(p => p.markdown || "").join("\n");
        const parsed = tryParseJson(md);
        if (parsed && Array.isArray(parsed.employees)) {
          out.employees = parsed.employees;
          out.ok = true;
        } else {
          // Pas de JSON dans la sortie OCR — c'est normal pour Mistral OCR brut.
          // On garde la sortie pour analyse manuelle.
          out.employees = [];
          out.ok = true;
          out.raw = { ...data, _markdown_preview: md.slice(0, 1000) };
        }
      }
    } catch (e) {
      out.error = e && e.message ? e.message : String(e);
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
    if (!cfg) { out.error = "Proxy non configuré"; return out; }
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
      const r = await fetch(
        cfg.url + "/v1/gemini?model=" + encodeURIComponent(opts.model || "gemini-2.5-pro"),
        {
          method: "POST",
          headers: { "content-type": "application/json", "X-Auth-Token": cfg.token },
          body: JSON.stringify(body)
        }
      );
      const data = await r.json();
      out.raw = data;
      if (!r.ok) {
        out.error = "HTTP " + r.status + " : " + (data && (data.error?.message || JSON.stringify(data).slice(0, 200)));
      } else {
        const text = data.candidates?.[0]?.content?.parts?.map(p => p.text).join("\n") || "";
        const parsed = tryParseJson(text);
        if (parsed && Array.isArray(parsed.employees)) {
          out.employees = parsed.employees;
          out.ok = true;
        } else {
          out.error = "JSON non parsable depuis réponse Gemini";
        }
      }
    } catch (e) {
      out.error = e && e.message ? e.message : String(e);
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
    // Lance les 4 passes en parallèle. Chaque passe a un timeout dur de 45s.
    function withTimeout(promise, ms, label) {
      return Promise.race([
        promise,
        new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timeout ${ms}ms`)), ms))
      ]).catch(e => ({
        passe: label, tool: label.toLowerCase(), ok: false, latency_ms: ms, employees: [],
        error: e && e.message ? e.message : String(e), raw: null
      }));
    }
    const TIMEOUT = opts.timeout_ms || 45000;
    const results = await Promise.allSettled([
      withTimeout(runClaudeVision(captureBytes, mime, opts), TIMEOUT, "B"),
      withTimeout(runGPT4oVision(captureBytes, mime, opts), TIMEOUT, "C"),
      withTimeout(runMistralOCR(captureBytes, mime, opts), TIMEOUT, "D"),
      withTimeout(runGeminiVision(captureBytes, mime, opts), TIMEOUT, "E"),
    ]);
    return results.map(r => r.status === "fulfilled" ? r.value : ({
      passe: "?", tool: "unknown", ok: false, latency_ms: 0, employees: [],
      error: r.reason && r.reason.message ? r.reason.message : String(r.reason), raw: null
    }));
  }

  /* ====================================================================
   * Export
   * ==================================================================== */

  return {
    getProxyConfig, setProxyConfig, clearProxyConfig, proxyHealthz,
    runClaudeVision, runGPT4oVision, runMistralOCR, runGeminiVision,
    runAllVisionPasses,
    STRUCTURED_PROMPT,
    VERSION: "T1-vision-v0.1.0"
  };
}));
