/**
 * text-parser.js — Parser texte direct PDF.js → {employees, days}.
 *
 * STRATÉGIE EXPERT (correction over-engineering session 2026-05-27) :
 *
 * Pour les PDFs SBM (tableaux natifs avec texte extractible), PDF.js suffit.
 * Pas besoin de 4 IA Vision en parallèle + proxy + vote 4/4.
 *
 * Cette passe G (texte natif) :
 *   - Prend la sortie de passes[0] (extractWithPdfJs) qui contient déjà
 *     les items texte avec coordonnées x/y
 *   - Reconstruit les lignes du tableau en groupant les items par y
 *   - Détecte les noms d'employés via regex « NOM Initiale »
 *   - Extrait pour chaque employé la séquence de codes horaires sur la ligne
 *   - Retourne le même shape que les passes Vision : { employees, ok, latency_ms }
 *
 * AVANTAGES vs IA Vision :
 *   - 0 latence réseau (purement local, 50-200ms)
 *   - 0 coût API
 *   - 0 timeout
 *   - 100% déterministe (même PDF → exactement la même sortie)
 *   - Préserve la casse, les suffixes (', ", *, :)
 *
 * LIMITES :
 *   - Ne marche QUE sur PDFs natifs (texte extractible)
 *   - PDF scanné/photo → fallback IA Vision nécessaire
 */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.TextParser = factory();
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Regex stricte : surname + initiale (1-3 lettres)
  const NAME_RE = /\b([A-ZÉÈÀÊÂÔÛÄËÏÖÜÇ][A-ZÉÈÀÊÂÔÛÄËÏÖÜÇ' \-]{1,30})\s+([A-Z]{1,3})\.?\b/g;

  // Faux positifs courants dans les PDFs SBM
  const EXCLUDE_NAMES = new Set([
    "RH", "CP", "AF", "M", "MAL", "ABS", "EDC", "CMC", "CDP", "CCDP", "MCB",
    "PIT", "BOSS", "SUPERVISEUR", "INSPECTEUR", "POKER", "NO", "LIMIT", "DU", "AU",
    "AVRIL", "MAI", "JUIN", "JUILLET", "AOUT", "AOÛT", "SEPTEMBRE", "OCTOBRE",
    "NOVEMBRE", "DECEMBRE", "JANVIER", "FEVRIER", "FÉVRIER", "MARS",
    "FORMATION", "MALADIE", "SS", "ABI", "AT", "PAT", "CFL", "CRH", "PNL",
    "BJ", "ROULETTES", "BLACKJACK", "AMENAGEMENT", "AMÉNAGEMENT",
    "LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM",
    "POSTE", "NOM", "ÉQUIPE", "TOTAL", "JOURS", "REPOS"
  ]);

  const CODE_RE = /^(?:\d{1,2}h?\d{0,2}\/\d{1,2}h?\d{0,2}[c'"\*\:CDP]*|RH|R|CP|AF|M|MAL|SS|ABI|AT|PAT|CFL|CRH|EDC|HD|PK|PRT|HC|RRT)$/;

  function groupItemsByLine(items, yTolerance) {
    yTolerance = yTolerance || 2;
    const sorted = items.slice().sort((a, b) => (b.y || 0) - (a.y || 0));
    const lines = [];
    let current = null;
    let currentY = null;
    for (const it of sorted) {
      if (!it.str || !it.str.trim()) continue;
      const y = it.y || 0;
      if (current === null || Math.abs(y - currentY) > yTolerance) {
        current = [];
        lines.push(current);
        currentY = y;
      }
      current.push(it);
    }
    for (const line of lines) line.sort((a, b) => (a.x || 0) - (b.x || 0));
    return lines;
  }

  function parseLineForEmployee(line) {
    if (!line || line.length < 2) return null;
    const fullText = line.map(i => i.str).join(" ").replace(/\s+/g, " ").trim();

    NAME_RE.lastIndex = 0;
    let nameMatch = null;
    while (true) {
      const m = NAME_RE.exec(fullText);
      if (!m) break;
      const surname = m[1].trim();
      if (EXCLUDE_NAMES.has(surname) || EXCLUDE_NAMES.has(surname.replace(/\s+/g, ""))) continue;
      nameMatch = { surname, initials: m[2], fullName: surname + " " + m[2], idx: m.index };
      break;
    }
    if (!nameMatch) return null;

    // Position approximative du nom dans la ligne
    let firstCodeItemIdx = -1;
    let charCount = 0;
    const nameEndChar = nameMatch.idx + nameMatch.fullName.length;
    for (let i = 0; i < line.length; i++) {
      const len = (line[i].str || "").length + 1;
      if (charCount + len > nameEndChar) {
        firstCodeItemIdx = i + 1;
        break;
      }
      charCount += len;
    }

    const days = {};
    let dayIdx = 1;
    for (let i = firstCodeItemIdx; i < line.length && dayIdx <= 31; i++) {
      const token = (line[i].str || "").trim();
      if (!token) continue;
      if (CODE_RE.test(token)) {
        days[String(dayIdx)] = token;
        dayIdx++;
      }
    }

    if (Object.keys(days).length < 5) return null;

    return {
      name: nameMatch.fullName,
      days,
      raw_line_preview: fullText.slice(0, 200)
    };
  }

  function parseFromPdfJs(pdfPass) {
    const started = Date.now();
    const out = { passe: "G", tool: "text-parser-native", ok: false, latency_ms: 0, employees: [], error: null, raw: null };
    try {
      if (!pdfPass || !Array.isArray(pdfPass.pages)) {
        out.error = {
          code: "no_pdf_pass",
          message: "Pas de passe A (PDF.js) à parser.",
          detail: "pdfPass.pages absent ou non-array",
          step: "text-parser:input_check",
          hint: "Cette passe nécessite que extractWithPdfJs ait tourné avant."
        };
        return out;
      }

      const allEmployees = [];
      let totalLines = 0;
      let linesWithName = 0;

      for (const page of pdfPass.pages) {
        const lines = groupItemsByLine(page.items || [], 2);
        totalLines += lines.length;
        for (const line of lines) {
          const emp = parseLineForEmployee(line);
          if (emp) {
            allEmployees.push(emp);
            linesWithName++;
          }
        }
      }

      // Dédoublonnage par nom (merge cellules si lignes split)
      const dedup = {};
      for (const emp of allEmployees) {
        if (!dedup[emp.name]) {
          dedup[emp.name] = emp;
        } else {
          for (const [d, v] of Object.entries(emp.days)) {
            if (!dedup[emp.name].days[d]) dedup[emp.name].days[d] = v;
          }
        }
      }

      out.employees = Object.values(dedup);
      out.ok = true;
      out.raw = {
        pages_processed: pdfPass.pages.length,
        lines_total: totalLines,
        lines_with_name: linesWithName,
        unique_employees: out.employees.length,
        sample_first_emp: out.employees[0] || null
      };
    } catch (e) {
      out.error = {
        code: "text_parser_exception",
        message: "Exception pendant le parsing texte.",
        detail: (e && e.message) || String(e),
        step: "text-parser:catch",
        where: (e && e.stack ? String(e.stack) : "").split("\n").slice(0, 3).join(" | ")
      };
    } finally {
      out.latency_ms = Date.now() - started;
    }
    return out;
  }

  return {
    parseFromPdfJs,
    groupItemsByLine,
    parseLineForEmployee,
    EXCLUDE_NAMES,
    CODE_RE,
    NAME_RE,
    VERSION: "T1-text-parser-v0.1.0"
  };
}));
