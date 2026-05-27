/*
 * parser-multi-ocr.js — Pipeline d'import multi-format + multi-OCR (T1 sandbox).
 *
 * RÈGLE ABSOLUE (Kevin, répétée 3×) :
 *   JAMAIS d'auto-correction. JAMAIS d'historique. JAMAIS d'auto-remplissage.
 *   Reproduction à l'identique uniquement. Si une lecture est ambiguë → flag needs_review.
 *
 * Phases implémentées (cf. plan /root/.claude/plans/comment-ferais-tu-pour-cuddly-acorn.md) :
 *   Phase 0   — Inventaire exhaustif (sections, noms attendus, cellules attendues)
 *   Phase 1   — Capture multi-format (PDF, photo, ZIP, paste, texte)
 *   Phase 1bis— Auto-détection type (cadres/employés/chefs/roulettes/CMC/amenage)
 *   Phase 2   — Détection version V1/V2/V3 (default V1)
 *   Phase 3.A — Passe A : PDF.js (texte natif) — IMPLÉMENTÉ
 *   Phase 3.B → 3.F — Stubs (Claude / GPT-4o / Mistral / Gemini / Tesseract) — à ajouter incrémentalement
 *
 * Output : objet ParseResult { meta, inventory, sources, cells_certain, cells_needs_review, alerts }
 */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory(
      require("./helpers-reuse.js"),
      require("./lib/vision-passes.js"),
      require("./lib/cell-voting.js")
    );
  } else {
    root.PlanningParserPipeline = factory(
      root.PlanningParserHelpers,
      root.VisionPasses,
      root.CellVoting
    );
  }
}(typeof self !== "undefined" ? self : this, function (H, VisionPasses, CellVoting) {
  "use strict";

  if (!H) throw new Error("[parser-multi-ocr] helpers-reuse.js doit être chargé avant.");

  /* ================================================================
   * Phase 1 — Capture multi-format
   * ================================================================ */
  async function captureSource(input, filename) {
    // input peut être : File, Blob, ArrayBuffer, string (texte brut), DataTransferItem
    if (!input) throw new Error("Aucune source fournie");

    let mime = "";
    let bytes = null;
    let textRaw = "";
    let name = filename || "";

    if (typeof input === "string") {
      // Cas 1 : paste texte brut
      mime = "text/plain";
      textRaw = input;
    } else if (input instanceof File || input instanceof Blob) {
      mime = input.type || "";
      name = input.name || name;
      bytes = new Uint8Array(await input.arrayBuffer());
    } else if (input instanceof ArrayBuffer) {
      bytes = new Uint8Array(input);
    } else if (input.kind === "file" && typeof input.getAsFile === "function") {
      // Cas DataTransferItem
      const f = input.getAsFile();
      mime = f.type || "";
      name = f.name || name;
      bytes = new Uint8Array(await f.arrayBuffer());
    } else {
      throw new Error("Format d'entrée non supporté : " + Object.prototype.toString.call(input));
    }

    // Magic bytes fallback si MIME absent
    if (bytes && !mime) {
      const head = bytes.slice(0, 4);
      if (head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46) mime = "application/pdf";
      else if (head[0] === 0xFF && head[1] === 0xD8) mime = "image/jpeg";
      else if (head[0] === 0x89 && head[1] === 0x50) mime = "image/png";
      else if (head[0] === 0x50 && head[1] === 0x4B) mime = "application/zip";
    }

    return { mime, name, bytes, textRaw, sizeBytes: bytes ? bytes.byteLength : (textRaw.length) };
  }

  /* ================================================================
   * Helper : charge pdf.js depuis le CDN + configure workerSrc.
   * Idempotent — appelable depuis n'importe quelle fonction qui touche pdf.js.
   * Évite la race condition « script CDN async pas encore prêt ».
   * ================================================================ */
  const PDFJS_VERSION = "3.11.174";
  const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/" + PDFJS_VERSION;
  let _pdfJsReadyPromise = null;

  function ensurePdfJsReady() {
    if (typeof window === "undefined") {
      return Promise.reject(new Error("window indéfini (env non-browser)"));
    }
    if (_pdfJsReadyPromise) return _pdfJsReadyPromise;
    _pdfJsReadyPromise = new Promise(function (resolve, reject) {
      function configure() {
        if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
          if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_CDN + "/pdf.worker.min.js";
          }
          resolve(window.pdfjsLib);
        } else {
          reject(new Error("pdfjsLib chargé mais sans GlobalWorkerOptions — version CDN incompatible ?"));
        }
      }
      if (window.pdfjsLib) { configure(); return; }
      var existing = document.querySelector("script[data-pdfjs-loader='1']");
      if (existing) {
        existing.addEventListener("load", configure, { once: true });
        existing.addEventListener("error", function () {
          reject(new Error("Échec chargement script pdf.js depuis " + PDFJS_CDN));
        }, { once: true });
        return;
      }
      var s = document.createElement("script");
      s.src = PDFJS_CDN + "/pdf.min.js";
      s.async = true;
      s.setAttribute("data-pdfjs-loader", "1");
      s.onload = configure;
      s.onerror = function () {
        reject(new Error("Échec chargement script pdf.js depuis " + PDFJS_CDN));
      };
      document.head.appendChild(s);
    });
    return _pdfJsReadyPromise;
  }

  /* ================================================================
   * Phase 3.A — Extraction texte PDF.js
   * Réf : Plan Phase 3 stratégie 1 (grille jour-par-jour).
   * ================================================================ */
  async function extractWithPdfJs(bytes) {
    await ensurePdfJsReady();
    // CRITIQUE : pdf.js getDocument({data: bytes}) TRANSFÈRE et DÉTACHE
    // l'ArrayBuffer source. Si on passait `bytes` directement, le buffer
    // original (result.capture.bytes du pipeline) serait détaché → les 4
    // passes Vision qui tournent APRÈS recevraient un buffer mort
    // ('Underlying ArrayBuffer has been detached from the view or out-of-bounds').
    // Clone avant pour préserver l'original.
    const bytesClone = new Uint8Array(bytes).slice();
    const pdf = await window.pdfjsLib.getDocument({ data: bytesClone }).promise;
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // Préserve l'ordre logique des items (pas de flatten)
      const items = content.items.map(it => ({
        str: H.normalizeQuotes(it.str),
        x: it.transform ? it.transform[4] : 0,
        y: it.transform ? it.transform[5] : 0,
        w: it.width || 0,
        h: it.height || 0,
        fontName: it.fontName || ""
      }));
      // Texte brut concaténé (avec retours ligne approximatifs)
      let text = "";
      let lastY = null;
      for (const it of items) {
        if (lastY !== null && Math.abs(it.y - lastY) > 2) text += "\n";
        else if (text && !text.endsWith(" ") && !text.endsWith("\n")) text += " ";
        text += it.str;
        lastY = it.y;
      }
      pages.push({ pageNum: i, items, text });
    }
    return {
      passe: "A",
      tool: "pdf.js",
      pages,
      textRaw: pages.map(p => p.text).join("\n--- page break ---\n"),
      itemsTotal: pages.reduce((sum, p) => sum + p.items.length, 0)
    };
  }

  /* ================================================================
   * Phase 0 — Inventaire exhaustif AVANT parsing
   * ================================================================ */
  function buildInventory(textRaw) {
    if (!textRaw) return { names_total: 0, names: [], sections_detected: [], cells_expected: 0 };
    // Regex stricte noms : NOM Init (1-3 lettres)
    const nameRe = /\b([A-ZÉÈÀÊÂÔÛÄËÏÖÜÇ][A-ZÉÈÀÊÂÔÛÄËÏÖÜÇ' \-]{2,30})\s+([A-Z]{1,3})\.?\b/g;
    const names = new Set();
    let m;
    while ((m = nameRe.exec(textRaw))) {
      const surname = m[1].trim();
      const initials = m[2];
      // Filtrer faux positifs (mots tout-majuscules courants)
      if (["RH", "CP", "AF", "MAL", "ABS", "EDC", "CMC", "CDP", "CCDP", "MCB", "PIT", "BOSS", "SUPERVISEUR", "INSPECTEUR", "POKER", "NO", "LIMIT", "DU", "AU", "VRAI", "AVRIL", "MAI", "JUIN", "JUILLET", "AOUT", "AOÛT", "FORMATION"].includes(surname)) continue;
      names.add(`${surname} ${initials}`);
    }

    // Sections détectées
    const sectionsFound = [];
    const sectionPatterns = [
      { re: /\bPIT\s*BOSS\s*\d*/i,           label: "Pit Boss" },
      { re: /\bSUPERVISEUR\b/i,              label: "Superviseur" },
      { re: /\bINSPECTEUR\b/i,               label: "Inspecteur" },
      { re: /BJ\s*[ÉE]q\.\s*\d+/gi,         label: "BJ Équipe" },
      { re: /Roul\.\s*[ÉE]q\.\s*\d+/gi,     label: "Roulettes Équipe" },
      { re: /CMC\s*[ÉE]q\.\s*\d+/gi,        label: "CMC Équipe" },
      { re: /\bAM[ÉE]NAGEMENT\b/i,           label: "Aménagement" }
    ];
    for (const sp of sectionPatterns) {
      const matches = textRaw.match(sp.re);
      if (matches) sectionsFound.push({ label: sp.label, count: matches.length });
    }

    // Cellules attendues : approximation (noms × 31 jours moyen)
    // (le vrai calcul nécessite parsing structuré — Phase 3 complète)
    const cellsExpected = names.size * 31;

    return {
      names_total: names.size,
      names: Array.from(names).sort(),
      sections_detected: sectionsFound,
      cells_expected: cellsExpected,
      note: "Approximation. Le décompte exact vient du parsing structuré Phase 3."
    };
  }

  /* ================================================================
   * Pipeline orchestré : Phases 0 → 1 → 1bis → 2 → 3.A
   * (Phases 3.B-F, 4-13 à ajouter incrémentalement après validation Kevin)
   * ================================================================ */
  async function runPipeline(input, filename, opts) {
    opts = opts || {};
    const startedAt = Date.now();
    const result = {
      meta: {
        started_at: new Date(startedAt).toISOString(),
        filename: filename || "",
        version_app: "T1-v0.1.0",
        rule: "Reproduction à l'identique — JAMAIS d'auto-correction (Kevin règle absolue)"
      },
      capture: null,
      hash: null,
      inventory: null,
      type_detected: null,
      version_detected: null,
      month_year_detected: null,
      passes: [],
      cells_certain: {},     // {emp_name: {day: token}} cellules unanimes 4/4
      cells_needs_review: {},// {emp_name: {day: [tokens]}} divergences
      alerts: [],
      errors: [],
      durations_ms: {}
    };

    try {
      /* ---- Phase 1 : Capture ---- */
      const tCap = Date.now();
      result.capture = await captureSource(input, filename);
      result.durations_ms.capture = Date.now() - tCap;

      /* ---- Phase 1.5 : Validation taille (bug #19 fix) ---- */
      // Garde-fou : refuse PDF vide (0 octet) ou > 32 MB (limite Anthropic + Mistral).
      // Évite des appels Vision IA inutiles qui retournent des erreurs vagues.
      const SIZE_MIN = 100;                 // PDF < 100 octets = corrompu/vide
      const SIZE_MAX = 32 * 1024 * 1024;    // 32 MB = limite stricte Anthropic + Mistral
      const sizeBytes = result.capture.sizeBytes || 0;
      if (sizeBytes === 0) {
        result.alerts.push({
          severity: "err",
          msg: "Fichier vide (0 octet). Vérifier le drag&drop ou le sélecteur de fichier."
        });
        result.errors.push({
          code: "input_empty", phase: "capture", message: "Source vide après capture.",
          detail: "result.capture.sizeBytes = 0", step: "pipeline:size_check_empty",
          hint: "Re-glisse le PDF dans la zone de dépôt."
        });
        result.meta.finished_at = new Date().toISOString();
        result.meta.total_duration_ms = Date.now() - startedAt;
        return result;
      }
      if (sizeBytes < SIZE_MIN) {
        result.alerts.push({
          severity: "warn",
          msg: "Fichier suspicieusement petit (" + sizeBytes + " octets). Probablement corrompu."
        });
      }
      if (sizeBytes > SIZE_MAX) {
        result.alerts.push({
          severity: "err",
          msg: "Fichier trop volumineux (" + (sizeBytes / 1024 / 1024).toFixed(1) + " MB > 32 MB max). Anthropic + Mistral refusent au-delà."
        });
        result.errors.push({
          code: "input_too_large", phase: "capture", message: "Fichier dépasse 32 MB.",
          detail: "sizeBytes=" + sizeBytes + " > MAX=" + SIZE_MAX,
          step: "pipeline:size_check_max",
          hint: "Compresser le PDF (Adobe Acrobat 'Réduire la taille du fichier') ou scinder en plusieurs."
        });
        // On continue quand même la Phase A (PDF.js qui peut lire les gros PDFs)
        // mais on désactive les passes Vision (qui rejetteraient).
        opts.runVision = false;
      }

      /* ---- Hash idempotence ---- */
      const tHash = Date.now();
      const hashInput = result.capture.bytes || result.capture.textRaw;
      result.hash = await H.sha256(hashInput);
      result.durations_ms.hash = Date.now() - tHash;

      /* ---- Phase 3.A : PDF.js (si PDF) OU paste texte direct ---- */
      const tPasseA = Date.now();
      let textRaw = "";
      if (result.capture.mime === "application/pdf") {
        const passeA = await extractWithPdfJs(result.capture.bytes);
        result.passes.push(passeA);
        textRaw = passeA.textRaw;
      } else if (result.capture.mime === "text/plain") {
        textRaw = result.capture.textRaw;
        result.passes.push({ passe: "A", tool: "paste-texte", textRaw });
      } else if (/^image\//.test(result.capture.mime)) {
        // Image : nécessite Vision IA (passes B-E). Stub pour l'instant.
        result.alerts.push({
          severity: "info",
          msg: "Image détectée — les passes Vision IA (Phase 3.B-E) sont nécessaires pour lire le contenu. À ajouter dans le pipeline."
        });
        textRaw = "";
      } else if (result.capture.mime === "application/zip") {
        result.alerts.push({
          severity: "info",
          msg: "ZIP détecté — décompression JSZip à ajouter (Phase 1 multi-fichiers)."
        });
        textRaw = "";
      } else {
        result.alerts.push({
          severity: "warn",
          msg: `Format non reconnu (${result.capture.mime}). Le pipeline accepte PDF, images (JPG/PNG/HEIC/WEBP), ZIP, et texte brut.`
        });
        textRaw = "";
      }
      result.durations_ms.passe_A = Date.now() - tPasseA;

      /* ---- Phase 2 : Détection version ---- */
      result.version_detected = H.detectVersion(filename, textRaw);

      /* ---- Phase 1bis : Auto-détection type ---- */
      result.type_detected = H.detectPlanningType(textRaw);

      /* ---- Détection mois/année ---- */
      result.month_year_detected = H.detectMonthYear(textRaw, filename);

      /* ---- Phase 0 : Inventaire exhaustif ---- */
      result.inventory = buildInventory(textRaw);

      /* ---- Phase 3.B → 3.E : Passes Vision IA via proxy (auto-config lazy) ---- */
      if (VisionPasses && opts.runVision !== false && result.capture.bytes) {
        // Si le proxy n'est pas configuré, on tente le loadAutoConfig en lazy
        // ici (et pas seulement au boot — pour gérer le cas où l'utilisateur
        // drop un PDF AVANT que autoLoadProxy() ait fini).
        let proxyCfg = VisionPasses.getProxyConfig();
        if (!proxyCfg && typeof VisionPasses.loadAutoConfig === "function") {
          try {
            const tLoad = Date.now();
            const loadRes = await VisionPasses.loadAutoConfig();
            result.durations_ms.proxy_autoload = Date.now() - tLoad;
            if (loadRes && loadRes.ok) {
              proxyCfg = VisionPasses.getProxyConfig();
              result.alerts.push({
                severity: "info",
                msg: "Proxy auto-configuré au lancement du pipeline : " + (proxyCfg && proxyCfg.url || "?") +
                     " (source: " + (loadRes.source || "?") + ")"
              });
            } else {
              const e = loadRes && loadRes.error || {};
              result.alerts.push({
                severity: "warn",
                msg: "Auto-config proxy a échoué : " + (e.message || "?") +
                     " — Détail : " + (e.detail || "?").toString().slice(0, 200) +
                     (e.hint ? " — 💡 " + e.hint : "")
              });
            }
          } catch (e) {
            result.errors.push({
              code: "proxy_autoload_exception",
              phase: "vision_autoload",
              message: "Exception pendant l'auto-config du proxy.",
              detail: (e && e.message) || String(e),
              step: "pipeline:autoload_proxy",
              where: (e && e.stack ? String(e.stack) : "").split("\n").slice(0, 4).join(" | ")
            });
          }
        }
        if (proxyCfg) {
          const isVisionable =
            result.capture.mime === "application/pdf" ||
            /^image\//.test(result.capture.mime);
          if (isVisionable) {
            const tVision = Date.now();
            try {
              const visionResults = await VisionPasses.runAllVisionPasses(
                result.capture.bytes,
                result.capture.mime,
                { timeout_ms: opts.visionTimeoutMs || 120000 }  // 120s : 4 passes parallèles sur PDFs SBM ~2 MB / 8 pages
              );
              for (const vr of visionResults) result.passes.push(vr);
              // Remonte les erreurs des passes individuelles dans result.errors
              // pour audit central (en plus de passe.error qui reste sur la passe).
              for (const vr of visionResults) {
                if (vr.error && !vr.ok) {
                  result.errors.push({
                    code: vr.error.code || "vision_passe_failed",
                    phase: "vision_" + (vr.passe || "?"),
                    message: vr.error.message || "Échec passe Vision",
                    detail: vr.error.detail || null,
                    step: vr.error.step || ("vision:" + (vr.tool || "")),
                    http_status: vr.error.http_status || null,
                    hint: vr.error.hint || null,
                    where: vr.error.where || null,
                    ts: vr.error.ts || new Date().toISOString()
                  });
                }
              }
            } catch (e) {
              result.errors.push({
                code: "vision_orchestrator_failed",
                phase: "vision_passes",
                message: "Orchestrateur Vision a échoué.",
                detail: (e && e.message) || String(e),
                step: "vision:orchestrator",
                where: (e && e.stack ? String(e.stack) : "").split("\n").slice(0, 4).join(" | ")
              });
            }
            result.durations_ms.vision_total = Date.now() - tVision;

            /* ---- Vote 4/4 cellule par cellule (CertVoting) ---- */
            if (CellVoting) {
              const passesWithCells = result.passes.filter(p =>
                Array.isArray(p.employees) && p.employees.length > 0
              );
              if (passesWithCells.length >= 2) {
                const minAgree = opts.minAgreeingPasses || Math.min(4, passesWithCells.length);
                const vote = CellVoting.voteCells(passesWithCells, { minAgreeingPasses: minAgree });
                result.cells_certain = vote.cells_certain;
                result.cells_needs_review = vote.cells_needs_review;
                result.vote_stats = vote.stats;
              } else {
                result.alerts.push({
                  severity: "warn",
                  msg: `Vote impossible : seulement ${passesWithCells.length} passe(s) ont retourné des données structurées. Vérifier les erreurs des passes Vision.`
                });
              }
            }
          } else {
            result.alerts.push({
              severity: "info",
              msg: `Format ${result.capture.mime} ne déclenche pas les passes Vision (PDF / image uniquement).`
            });
          }
        } else {
          result.alerts.push({
            severity: "info",
            msg: "Proxy Vision non configuré — seule la passe A (PDF.js) a été exécutée. Configure l'URL + token dans la section « Proxy IA »."
          });
        }
      }

      /* ---- Alertes globales ---- */
      if (result.type_detected.needs_user_confirm) {
        result.alerts.push({
          severity: "warn",
          msg: `Type détecté avec confiance ${result.type_detected.confidence}. Kevin doit confirmer avant le parsing détaillé.`,
          requires_user_action: true
        });
      }
      if (!result.month_year_detected.key) {
        result.alerts.push({
          severity: "warn",
          msg: "Mois/année non détectés automatiquement. Kevin doit les renseigner manuellement."
        });
      }

    } catch (e) {
      // Erreur fatale du pipeline — toujours structurée avec cause exacte
      result.errors.push({
        code: e && e.name ? ("exception_" + e.name) : "pipeline_uncaught",
        phase: "pipeline",
        message: (e && e.message) ? "Erreur pipeline : " + e.message : "Erreur inattendue dans le pipeline.",
        detail: (e && e.message) || String(e),
        step: "pipeline:run",
        where: (e && e.stack ? String(e.stack) : "").split("\n").slice(0, 5).join(" | "),
        ts: new Date().toISOString()
      });
    }

    result.meta.finished_at = new Date().toISOString();
    result.meta.total_duration_ms = Date.now() - startedAt;
    return result;
  }

  /* ================================================================
   * Helpers de présentation pour l'UI
   * ================================================================ */
  function summarize(parseResult) {
    if (!parseResult) return "Pas de résultat.";
    const r = parseResult;
    const lines = [];
    lines.push(`📄 Source : ${H.esc(r.capture?.name || "—")} (${r.capture?.mime || "?"}, ${r.capture?.sizeBytes || 0} octets)`);
    lines.push(`🔢 Hash SHA-256 : ${(r.hash || "").slice(0, 16)}…`);
    lines.push(`📋 Type détecté : ${H.esc(r.type_detected?.label || "—")} (confiance ${r.type_detected?.confidence || 0})`);
    lines.push(`🔢 Version : V${r.version_detected?.version || "?"} (source: ${r.version_detected?.source || "?"})`);
    lines.push(`📅 Mois/année : ${H.esc(r.month_year_detected?.monthName || "?")} ${r.month_year_detected?.year || "?"}`);
    lines.push(`👥 Noms détectés : ${r.inventory?.names_total || 0}`);
    lines.push(`📊 Sections : ${(r.inventory?.sections_detected || []).map(s => s.label + " (×" + s.count + ")").join(", ") || "—"}`);
    lines.push(`📐 Cellules attendues : ${r.inventory?.cells_expected || 0}`);
    lines.push(`⏱  Durée totale : ${r.meta?.total_duration_ms || 0} ms`);
    if (r.alerts?.length) {
      lines.push(`\n⚠ Alertes (${r.alerts.length}) :`);
      r.alerts.forEach(a => lines.push(`  • [${a.severity}] ${H.esc(a.msg)}`));
    }
    if (r.errors?.length) {
      lines.push(`\n❌ Erreurs (${r.errors.length}) :`);
      r.errors.forEach(e => lines.push(`  • ${H.esc(e.phase)}: ${H.esc(e.message)}`));
    }
    return lines.join("\n");
  }

  /* ================================================================
   * Export
   * ================================================================ */
  return {
    runPipeline,
    captureSource,
    extractWithPdfJs,
    ensurePdfJsReady,
    buildInventory,
    summarize,
    VERSION: "T1-v0.5.0-tokens-pixtral-gemini"
  };
}));
