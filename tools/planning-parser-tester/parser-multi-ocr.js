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
      require("./lib/cell-voting.js"),
      require("./lib/text-parser.js"),
      require("./lib/encadres-parser.js"),
      require("./lib/team-detector.js"),
      require("./lib/validate-post-import.js"),
      require("./lib/homonyms-guard.js"),
      require("./lib/code-colors.js")
    );
  } else {
    root.PlanningParserPipeline = factory(
      root.PlanningParserHelpers,
      root.VisionPasses,
      root.CellVoting,
      root.TextParser,
      root.EncadresParser,
      root.TeamDetector,
      root.ValidatePostImport,
      root.HomonymsGuard,
      root.CodeColors
    );
  }
}(typeof self !== "undefined" ? self : this, function (H, VisionPasses, CellVoting, TextParser, EncadresParser, TeamDetector, ValidatePostImport, HomonymsGuard, CodeColors) {
  "use strict";

  if (!H) throw new Error("[parser-multi-ocr] helpers-reuse.js doit être chargé avant.");

  /** Calcule le nombre de jours dans un mois donné (0-indexé). */
  function daysInMonth(year, monthZeroIdx) {
    if (!year || monthZeroIdx === null || monthZeroIdx === undefined) return 31;
    return new Date(year, monthZeroIdx + 1, 0).getDate();
  }

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

      /* ---- Phase 3.G : Parser texte natif (PDF.js → JSON, ZÉRO IA) ---- */
      // CORRECTION over-engineering 2026-05-27 : pour les PDFs SBM avec texte
      // extractible (cas usuel), on n'a PAS besoin des 4 IA Vision. PDF.js a
      // déjà tout extrait en 419ms. Un parser texte simple reconstruit
      // {employees, days} en 50-200ms, déterministe, gratuit, 0 timeout.
      // Les passes Vision restent comme RENFORT pour vote 4/4 + PDFs scannés.
      if (TextParser && opts.runTextParser !== false) {
        const passeA_PdfJs = result.passes.find(p => p.passe === "A" && p.tool === "pdf.js");
        if (passeA_PdfJs) {
          const tText = Date.now();
          const passeG = TextParser.parseFromPdfJs(passeA_PdfJs);
          result.passes.push(passeG);
          result.durations_ms.text_parser = Date.now() - tText;
          if (passeG.ok && passeG.employees.length > 0) {
            result.alerts.push({
              severity: "info",
              msg: `Parser texte natif : ${passeG.employees.length} employés détectés en ${passeG.latency_ms} ms (zéro coût IA).`
            });
          }
        }
      }

      /* ---- Phase 3.H : Parser encadrés « du au » (statuts intégraux CP/AF/M/EDC...) ---- */
      // Source : NOTES_USER « FORMATION du au », « N CP du au », « M du au ».
      // Règle Kevin CLAUDE.md erreur #49 : codes courts uniquement, jamais
      // chercher « FORMATION/MALADIE » en source primaire.
      if (EncadresParser && opts.runEncadres !== false) {
        const passeA_PdfJs = result.passes.find(p => p.passe === "A" && p.tool === "pdf.js");
        const rawText = passeA_PdfJs && passeA_PdfJs.textRaw;
        if (rawText) {
          const tEnc = Date.now();
          const monthYear = result.month_year_detected || {};
          const dim = daysInMonth(monthYear.year, monthYear.month);
          const encResult = EncadresParser.parseEncadres(rawText, dim);
          result.encadres = encResult;
          result.durations_ms.encadres_parser = Date.now() - tEnc;
          if (encResult.boxes && encResult.boxes.length > 0) {
            result.alerts.push({
              severity: "info",
              msg: `Encadrés statuts détectés : ${encResult.boxes.length} (` +
                   encResult.boxes.map(b => b.code + "×" + (b.names_found || 0)).join(", ") + ")"
            });
          }
          if (encResult.warnings && encResult.warnings.length > 0) {
            for (const w of encResult.warnings) {
              result.alerts.push({ severity: "warn", msg: "Encadrés : " + w });
            }
          }

          /* APPLIQUE les encadrés à la passe G (RÈGLE ABSOLUE Kevin 2026-05-26 :
           * « si il y a un nom, il y a des données à appliquer ». Personne sans
           * horaire : ceux absents de la grille ou avec jours vides récupèrent
           * leur statut CP/M/AF/EDC depuis l'encadré). Ne JAMAIS écraser une
           * cellule de grille (reproduction identique). */
          if (typeof EncadresParser.applyEncadresToEmployees === "function" && encResult.boxes && encResult.boxes.length) {
            const passeG = result.passes.find(p => p.passe === "G" && p.ok);
            if (passeG && Array.isArray(passeG.employees)) {
              const before = passeG.employees.length;
              const applied = EncadresParser.applyEncadresToEmployees(passeG.employees, encResult.boxes, dim);
              passeG.employees = applied.employees;
              passeG.encadres_applied = applied.stats;
              result.alerts.push({
                severity: "info",
                msg: `Encadrés appliqués : +${applied.stats.cells_added} cellules statut, ` +
                     `${applied.stats.filled} employés complétés, ${applied.stats.created} créés ` +
                     `(${before}→${passeG.employees.length} employés).`
              });
            }
          }

          /* ---- Rattachement des employés SANS grille à leur ENCADRÉ statut ----
           * (Kevin : « prendre en compte les encadrés en haut bien en étendu »
           *  + « double info qui valide »). Page 1 = blocs de rotation 2D +
           * encadrés statut (M/CP/AF/EDC/FORMATION). Un employé présent au
           * roster sans ligne de grille EST en réalité listé dans un encadré
           * statut (vérifié sur PDF réel : ORRADO F→M, DUPONT A/CASTEL N/…→CP,
           * ORENGO N/CREMA F/…→CP). On lui applique le code de l'encadré le plus
           * proche AVANT lui dans le texte du roster, étendu sur 1..dim.
           * Marqué needs_review (affectation 2D inférée — Kevin valide, surtout
           * si 2 encadrés adjacents M/CP). On n'INVENTE pas : le code vient d'un
           * encadré réel du PDF. */
          const passeGc = result.passes.find(p => p.passe === "G" && p.ok);
          if (passeGc && Array.isArray(passeGc.employees) && rawText) {
            const fb = rawText.indexOf("--- page break ---");
            const rosterU = (fb > 0 ? rawText.slice(0, fb) : rawText)
              .toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");
            const gridU = " " + (fb > 0 ? rawText.slice(fb) : "")
              .toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ") + " ";
            const DAYCODE = /\d{1,2}(?:H\d{2})?\/\d{1,2}|RH|CP|AF|EDC|RRT|PRT|PAT|MAL|\bM\b/;
            // Headers d'encadrés statut dans le roster, avec position
            const HDR = /(\d{1,3})\s+(CP|AF|MAL|MT|PAT|EDC|CFL|CRH|ABS|ABI|AT|SS|FORMATION|M)\b/g;
            const headers = [];
            let hm;
            while ((hm = HDR.exec(rosterU))) {
              const code = EncadresParser && EncadresParser.resolveCode
                ? EncadresParser.resolveCode(hm[2]) : hm[2];
              headers.push({ code, count: parseInt(hm[1], 10), idx: hm.index });
            }
            let inferred = 0, rosterOnly = 0;
            for (const e of passeGc.employees) {
              if (e.days && Object.keys(e.days).length > 0) continue;
              const full = String(e.name).toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
              // vrai oubli si le nom complet a des codes dans la grille → on laisse vide (bug)
              const gidx = gridU.indexOf(" " + full + " ");
              if (gidx >= 0 && DAYCODE.test(gridU.slice(gidx + full.length, gidx + full.length + 90))) continue;
              // sinon : rattache à l'encadré statut le plus proche AVANT dans le roster
              const ridx = rosterU.indexOf(" " + full + " ");
              let box = null;
              if (ridx >= 0) for (const hd of headers) { if (hd.idx < ridx && (!box || hd.idx > box.idx)) box = hd; }
              if (box && box.code) {
                for (let d = 1; d <= dim; d++) e.days[String(d)] = box.code;
                e.source = "encadre_box_inferred";
                e.needs_review_box = box.code;
                inferred++;
              } else {
                e.roster_only = true; rosterOnly++;
              }
            }
            if (inferred > 0) {
              result.alerts.push({
                severity: "info",
                msg: `${inferred} employé(s) sans grille rattaché(s) à leur encadré statut ` +
                     `(CP/M/AF/EDC) sur 1-${dim} — « double info » roster+encadré. À VÉRIFIER ` +
                     `(affectation de boîte inférée du texte 2D, surtout si encadrés M/CP adjacents).`
              });
            }
            if (rosterOnly > 0) {
              result.alerts.push({
                severity: "warn",
                msg: `${rosterOnly} employé(s) au roster sans encadré identifiable — à vérifier.`
              });
            }
          }
        }
      }

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

      /* ---- Phase 3.I : Détection équipes (RH/R pattern) + miroirs ---- */
      // Algorithme officiel SBM (Kevin 2026-05-15) — pattern RH identique = même
      // équipe ; offset constant + horaire base différent = équipe miroir.
      // Source primaire idéale = trait noir foncé du PDF (Vision IA seulement),
      // ce module est le FALLBACK quand seul le texte natif est dispo.
      if (TeamDetector && opts.runTeamDetector !== false) {
        // On préfère les emps de la passe G (text-parser, plus fiable sur
        // texte natif). Si absente, fallback sur 1ère passe Vision avec emps.
        const passeG = result.passes.find(p => p.passe === "G" && p.ok);
        let teamSource = null;
        if (passeG && passeG.employees && passeG.employees.length > 0) {
          teamSource = { name: "G:text-parser", employees: passeG.employees };
        } else {
          const visionWithEmps = result.passes.find(p =>
            ["B", "C", "D", "E"].indexOf(p.passe) >= 0 && p.ok && Array.isArray(p.employees) && p.employees.length > 0
          );
          if (visionWithEmps) {
            teamSource = { name: visionWithEmps.passe + ":" + (visionWithEmps.tool || "?"), employees: visionWithEmps.employees };
          }
        }
        if (teamSource) {
          const tTeams = Date.now();
          // Adapte la forme : team-detector attend { fullName, days, family? }
          const adapted = teamSource.employees.map(e => ({
            fullName: e.name || e.fullName,
            days: e.days || {},
            family: e.family || null
          }));
          const teamRes = TeamDetector.detectTeams(adapted, { minTeamSize: 2 });
          result.teams = teamRes;
          result.teams.source = teamSource.name;
          result.durations_ms.team_detector = Date.now() - tTeams;
          if (teamRes.teams && teamRes.teams.length > 0) {
            result.alerts.push({
              severity: "info",
              msg: `Équipes détectées (source ${teamSource.name}) : ${teamRes.teams.length} équipe(s), ${teamRes.mirrors.length} miroir(s).`
            });
          }
        }
      }

      /* ---- Phase 3.J : Enrichir cellules avec LIEU (CMC/CCDP/PNL) ---- */
      // Mapping conditionnel sur rôle (Kevin 2026-05-28) : le MÊME code peut
      // avoir un LIEU DIFFÉRENT selon rôle (19/4 employé = CMC, Pit Boss = CCDP).
      // On n'écrit pas dans les cellules — on ajoute juste une projection `lieux`
      // à côté pour que l'UI affiche le badge (préserve règle "reproduction
      // identique" : la cellule reste exactement le code source).
      if (H.codeToLieu && opts.runLieuMapping !== false) {
        const tLieu = Date.now();
        result.lieux_per_emp = {};
        for (const passe of result.passes) {
          if (!passe.ok || !Array.isArray(passe.employees)) continue;
          for (const emp of passe.employees) {
            const name = emp.name || emp.fullName;
            if (!name) continue;
            // Rôle déduit depuis result.type_detected (Pit Boss / Sup / Inspecteur → cadres)
            const cadreType = result.type_detected.types &&
              result.type_detected.types.find(t => t.kind === "cadres");
            const role = cadreType ? cadreType.sub : (emp.family === "cadres" ? "pit" : "employee");
            const daysLieux = {};
            for (const d of Object.keys(emp.days || {})) {
              const code = emp.days[d];
              const lieu = H.codeToLieu(code, role);
              if (lieu) daysLieux[d] = lieu;
            }
            // Stocke la projection (1 fois par emp, source = 1ère passe qui le voit)
            if (!result.lieux_per_emp[name]) {
              result.lieux_per_emp[name] = { role, days: daysLieux, source: passe.passe };
            }
          }
        }
        result.durations_ms.lieu_mapping = Date.now() - tLieu;
      }

      /* ---- Phase 3.K : Audit homonymes (CLAUDE.md erreurs #38, #44) ---- */
      // Détecte les paires d'emps avec surname identique mais initiales
      // différentes (sain si distinctes, doublon si même initiale).
      if (HomonymsGuard && opts.runHomonymsGuard !== false) {
        const passG = result.passes.find(p => p.passe === "G" && p.ok);
        const sourceEmps = (passG && passG.employees) || [];
        if (sourceEmps.length > 0) {
          const tHom = Date.now();
          const audit = HomonymsGuard.auditEmployees(
            sourceEmps.map(e => ({ fullName: e.name || e.fullName }))
          );
          result.homonyms_audit = audit;
          result.durations_ms.homonyms_audit = Date.now() - tHom;
          if (audit.merging_risks && audit.merging_risks.length > 0) {
            for (const risk of audit.merging_risks) {
              result.alerts.push({
                severity: "warn",
                msg: "Homonymes risque doublon : " + risk.msg
              });
            }
          }
          if (audit.known_homonyms_found > 0) {
            result.alerts.push({
              severity: "info",
              msg: `${audit.known_homonyms_found} groupe(s) d'homonymes connus correctement séparés (LANDAU B/J, ENZA B/C, etc.)`
            });
          }
        }
      }

      /* ---- Phase 3.L : Validations Convention SBM (Art. 17.5, 35, sanctions) ---- */
      if (ValidatePostImport && opts.runValidations !== false) {
        const tVal = Date.now();
        try {
          const validations = ValidatePostImport.runAll(result);
          result.validations = validations;
          result.durations_ms.validations = Date.now() - tVal;
          const c = validations.stats.by_severity || {};
          if (c.critical > 0) {
            result.alerts.push({
              severity: "err",
              msg: `Validations Convention : ${c.critical} CRITICAL — vérifier sanctions ou noms PDF non extraits`
            });
          }
          if (c.warn > 0) {
            result.alerts.push({
              severity: "warn",
              msg: `Validations Convention : ${c.warn} warning(s) (Art. 17.5 / 35 / homonymes)`
            });
          }
          if (c.info > 0) {
            result.alerts.push({
              severity: "info",
              msg: `Validations Convention : ${c.info} info`
            });
          }
        } catch (e) {
          result.errors.push({
            code: "validations_exception",
            phase: "validations",
            message: "Exception lors des validations Convention",
            detail: (e && e.message) || String(e)
          });
        }
      }

      /* ---- Phase 3.M : Projection couleurs cellule (UI helper) ---- */
      // Ne MODIFIE PAS les cellules — ajoute juste une couche `colors_per_emp`
      // avec { bg, fg, label } pour chaque cellule, pour rendu UI.
      if (CodeColors && opts.runColorMapping !== false) {
        const tCol = Date.now();
        result.colors_per_emp = {};
        for (const passe of result.passes) {
          if (!passe.ok || !Array.isArray(passe.employees)) continue;
          for (const emp of passe.employees) {
            const name = emp.name || emp.fullName;
            if (!name || result.colors_per_emp[name]) continue;
            const dayColors = {};
            for (const d of Object.keys(emp.days || {})) {
              dayColors[d] = CodeColors.getCellColor(emp.days[d]);
            }
            result.colors_per_emp[name] = dayColors;
          }
        }
        result.durations_ms.color_mapping = Date.now() - tCol;
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
    VERSION: "T1-v0.9.6-encadre-box-inference"
  };
}));
