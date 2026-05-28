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

  // Regex stricte : surname (1 token), avec aussi tolérance multi-token via NAME_RE_MULTI.
  const NAME_RE = /\b([A-ZÉÈÀÊÂÔÛÄËÏÖÜÇ][A-ZÉÈÀÊÂÔÛÄËÏÖÜÇ' \-]{1,30})\s+([A-Z]{1,3})\.?\b/g;
  // Multi-token : « LANTERI MINET P », « DELLA PINA L », « DE RYCKE K ».
  // 2 tokens maj + initiale (1-3 lettres).
  const NAME_RE_MULTI = /\b([A-ZÉÈÀÊÂÔÛÄËÏÖÜÇ][A-ZÉÈÀÊÂÔÛÄËÏÖÜÇ'\-]{1,20})\s+([A-ZÉÈÀÊÂÔÛÄËÏÖÜÇ][A-ZÉÈÀÊÂÔÛÄËÏÖÜÇ'\-]{1,20})\s+([A-Z]{1,3})\.?\b/g;

  // Faux positifs courants dans les PDFs SBM
  const EXCLUDE_NAMES = new Set([
    "RH", "R", "CP", "AF", "M", "MAL", "MT", "ABS", "ABI", "ABP", "EDC",
    "CMC", "CDP", "CCDP", "MCB", "SUN", "PK", "HD", "PRT", "HC", "RRT",
    "RTP", "RTR", "RHS", "DP", "CRH", "CPS", "CPM", "CDH", "FL", "CFL",
    "FTP", "FTR", "RFT", "FCP", "FCS", "FRH", "FFL", "CL", "CEO", "CSC",
    "CSS", "PNE", "AMP", "MPC", "MPP", "AT", "PAT", "SS", "P",
    "PIT", "BOSS", "SUPERVISEUR", "INSPECTEUR", "POKER", "NO", "LIMIT", "DU", "AU",
    "AVRIL", "MAI", "JUIN", "JUILLET", "AOUT", "AOÛT", "SEPTEMBRE", "OCTOBRE",
    "NOVEMBRE", "DECEMBRE", "JANVIER", "FEVRIER", "FÉVRIER", "MARS",
    "FORMATION", "MALADIE", "MATERNITE", "PATERNITE", "PNL",
    "BJ", "ROUL", "ROULETTES", "BLACKJACK", "BLACK", "JACK", "AMENAGEMENT", "AMÉNAGEMENT",
    "LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM",
    "POSTE", "NOM", "ÉQUIPE", "EQUIPE", "TOTAL", "JOURS", "REPOS",
    "PLANNING", "CHEF", "CHEFS", "CARTES", "EMPLOYE", "EMPLOYES", "EMPLOYÉS",
    "MIROIR", "EQ", "ÉQ"
  ]);

  // Code poste BRTPECK en début de ligne : « .BRTCP+KE », « BRTP+E. », etc.
  // (optionnellement suivi d'un numéro d'équipe explicite V1 juin « ... 5 NAME »).
  // Capturé puis retiré AVANT extraction du nom — sinon le « KE » du suffixe
  // `+KE` pollue le nom (« KE LANDAU B » au lieu de « LANDAU B »).
  const POST_CODE_PREFIX_RE = /^\s*(\.?[BRTPECK]+(?:\+[BRTPECK]+)?\.?)(?:\s+(\d{1,2}))?\s+/;

  // CODE_RE — couvre TOUS les codes officiels SBM (43 codes, Note 6 janv 1993).
  // Sources : Note SBM 6 janvier 1993 (Bernard Lées) + Convention 1er avril 2015
  //   + NOTES_USER + index.html ligne 2084 (BULLETIN_CODES).
  //
  // Catégories couvertes :
  //   Présence/Repos (7) : P · RH · RTP · RTR · RRT · RHS · DP
  //   Congés (6)         : CP · CRH · CPS · CPM · CDP · CDH
  //   Fêtes légales (5)  : FL · CFL · FTP · FTR · RFT
  //   À la masse (4)     : FCP · FCS · FRH · FFL
  //   Absences (11)      : M · MAL · AT · MT · ABS · ABI · ABP · AF · CL · CEO · CSC · CSS
  //   Sanctions (4)      : PNE · AMP · MPC · MPP
  //   Autres (4)         : PAT · PRT · HC · EDC
  //   Pit Boss spécifiques (2) : HD · PK
  //   « R » seul (repos générique) : également accepté.
  // Format horaire : <heures>/<heures> avec suffixes c/'/"/:/* + CDP/PK (postfix)
  //   H majuscule accepté (12H30/19 cf NOTES_USER 1214).
  const CODE_RE = /^(?:\d{1,2}[hH]?\d{0,2}\/\d{1,2}[hH]?\d{0,2}(?:[c'":]|"\'|\*|CDP|PK)*|P|RH|R|RTP|RTR|RRT|RHS|DP|CP|CRH|CPS|CPM|CDP|CDH|FL|CFL|FTP|FTR|RFT|FCP|FCS|FRH|FFL|M|MAL|AT|MT|ABS|ABI|ABP|AF|CL|CEO|CSC|CSS|PNE|AMP|MPC|MPP|PAT|PRT|HC|EDC|HD|PK)$/;

  // Numéro d'équipe explicite (V1 juin 2026+) : « BRTP+K 5 NAME »
  //   - Code poste BRTPECK suivi d'un espace, puis 1-2 chiffres = numéro d'équipe,
  //     puis le nom. Capture le numéro pour le rattacher à l'employé.
  // Ne match QUE si vraiment entre POST et NOM (pas dans la liste de codes).
  const TEAM_NUM_AFTER_POST_RE = /(\.?[BRTPECK]+(?:\+[BRTPECK]+)?\.?)\s+(\d{1,2})\s+([A-ZÉÈÀÊÂÔÛÄËÏÖÜÇ])/;

  // Compétences BRTPECK : code poste devant le nom (ex « .BRTCP+E. »).
  // Capture le code complet (avec . initial/final et + optionnel).
  const BRTPECK_RE = /\b(\.?[BRTPECK]+(?:\+[BRTPECK]+)?\.?)/;

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

  /**
   * Cherche un nom employé dans une ligne. Essaie d'abord multi-token (3 mots)
   * puis simple (2 mots) pour ne pas rater « LANTERI MINET P » → « LANTERI » seul.
   */
  function findNameInLine(fullText) {
    // 1) Essai multi-token : « SURNAME1 SURNAME2 Init »
    NAME_RE_MULTI.lastIndex = 0;
    while (true) {
      const m = NAME_RE_MULTI.exec(fullText);
      if (!m) break;
      const t1 = m[1].trim();
      const t2 = m[2].trim();
      if (EXCLUDE_NAMES.has(t1) || EXCLUDE_NAMES.has(t2)) continue;
      // Évite faux positifs : si t2 est un code typique RH/CP/etc., c'est un surname simple
      if (CODE_RE.test(t2)) continue;
      return { surname: t1 + " " + t2, initials: m[3], fullName: t1 + " " + t2 + " " + m[3], idx: m.index, length: m[0].length };
    }
    // 2) Fallback simple : « SURNAME Init »
    NAME_RE.lastIndex = 0;
    while (true) {
      const m = NAME_RE.exec(fullText);
      if (!m) break;
      const surname = m[1].trim();
      if (EXCLUDE_NAMES.has(surname) || EXCLUDE_NAMES.has(surname.replace(/\s+/g, ""))) continue;
      return { surname, initials: m[2], fullName: surname + " " + m[2], idx: m.index, length: m[0].length };
    }
    return null;
  }

  function parseLineForEmployee(line, opts) {
    opts = opts || {};
    const minCodes = opts.minCodes || 3;  // relâché : 3 codes min (employés CP intégral peuvent avoir peu de codes visibles)
    if (!line || line.length < 2) return null;
    const rawText = line.map(i => i.str).join(" ").replace(/\s+/g, " ").trim();

    // Strip le code-poste BRTPECK du début (sinon « +KE » pollue le nom →
    // « KE LANDAU B »). Capture brtpeck + teamNumber explicite (V1 juin).
    let brtpeck = null;
    let teamNumber = null;
    let fullText = rawText;
    let offset = 0;
    const pm = POST_CODE_PREFIX_RE.exec(rawText);
    if (pm) {
      brtpeck = pm[1];
      if (pm[2]) teamNumber = parseInt(pm[2], 10);
      fullText = rawText.slice(pm[0].length);
      offset = pm[0].length;
    }

    const nameMatch = findNameInLine(fullText);
    if (!nameMatch) return null;

    // Position du nom dans la ligne (char offset → item idx).
    // nameEndChar référencé au rawText d'origine (offset du strip ajouté).
    let firstCodeItemIdx = -1;
    let charCount = 0;
    const nameEndChar = offset + nameMatch.idx + nameMatch.length;
    for (let i = 0; i < line.length; i++) {
      const len = (line[i].str || "").length + 1;
      if (charCount + len > nameEndChar) {
        firstCodeItemIdx = i + 1;
        break;
      }
      charCount += len;
    }
    if (firstCodeItemIdx === -1) firstCodeItemIdx = line.length;

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

    const out = {
      name: nameMatch.fullName,
      days,
      raw_line_preview: fullText.slice(0, 200)
    };
    if (brtpeck) out.brtpeck = brtpeck;
    if (teamNumber !== null) out.teamNumber = teamNumber;
    if (Object.keys(days).length < minCodes) out.partial = true;
    return out;
  }

  /**
   * Pass 2 : recherche les noms dans le texte brut concaténé (passe lignes-libres).
   * Récupère les employés qui ont été ratés par la pass 1 (lignes split, format atypique).
   * Pour chaque nom trouvé, scanne les ~40 items qui suivent dans le texte source
   * pour extraire les codes horaires associés.
   */
  /**
   * Parse UNE ligne de texte brut → employé (nom + codes + brtpeck + teamNumber).
   * Strippe d'abord le code-poste BRTPECK du début (sinon il pollue le nom),
   * puis extrait le nom, puis les codes jour.
   */
  function parseRawLine(line) {
    if (!line) return null;
    const raw = String(line).replace(/\s+/g, " ").trim();
    if (raw.length < 4) return null;

    // 1) Strip le code-poste BRTPECK du début + capture brtpeck + teamNumber
    let brtpeck = null;
    let teamNumber = null;
    let working = raw;
    const pm = POST_CODE_PREFIX_RE.exec(raw);
    if (pm) {
      brtpeck = pm[1];
      if (pm[2]) teamNumber = parseInt(pm[2], 10);
      working = raw.slice(pm[0].length);
    }

    // 2) Extrait le nom (multi-token d'abord, puis simple)
    const nameMatch = findNameInLine(working);
    if (!nameMatch) return null;
    // Refuse si le "nom" est en fait un code (ligne de codes sans nom)
    if (EXCLUDE_NAMES.has(nameMatch.surname) || CODE_RE.test(nameMatch.surname)) return null;

    // 3) Extrait les codes APRÈS le nom
    const after = working.slice(nameMatch.idx + nameMatch.length);
    const tokens = after.split(/\s+/);
    const days = {};
    let d = 1;
    for (const t of tokens) {
      if (d > 31) break;
      const tok = t.trim();
      if (!tok) continue;
      if (CODE_RE.test(tok)) { days[String(d)] = tok; d++; }
    }
    if (Object.keys(days).length === 0) return null;

    const out = { name: nameMatch.fullName, days, source: "pass2_raw" };
    if (brtpeck) out.brtpeck = brtpeck;
    if (teamNumber !== null) out.teamNumber = teamNumber;
    return out;
  }

  /**
   * Pass 2 : ligne par ligne (split \n). Plus fiable que le scan global —
   * chaque ligne = un employé, le code-poste est strippé, les titres et
   * lignes de codes purs sont rejetés.
   */
  function parseFromRawText(textRaw) {
    if (!textRaw) return [];
    const employees = [];
    const seen = new Set();
    const lines = String(textRaw).split(/\r?\n/);
    for (const line of lines) {
      const emp = parseRawLine(line);
      if (!emp) continue;
      if (seen.has(emp.name)) continue;
      seen.add(emp.name);
      employees.push(emp);
    }
    return employees;
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

      // Pass 1 — par ligne via coordonnées x/y
      const pass1Employees = [];
      let totalLines = 0;
      let linesWithName = 0;
      for (const page of pdfPass.pages) {
        const lines = groupItemsByLine(page.items || [], 2);
        totalLines += lines.length;
        for (const line of lines) {
          const emp = parseLineForEmployee(line);
          if (emp) {
            pass1Employees.push(emp);
            linesWithName++;
          }
        }
      }

      // Pass 2 — texte brut complet (rattrape les noms ratés par pass 1)
      const pass2Employees = parseFromRawText(pdfPass.textRaw || "");

      // Merge — pass1 prioritaire (cellules par coordonnées plus fiables),
      // pass2 complète pour les noms manqués.
      const dedup = {};
      for (const emp of pass1Employees) {
        dedup[emp.name] = emp;
      }
      let pass2Added = 0;
      for (const emp of pass2Employees) {
        if (!dedup[emp.name]) {
          dedup[emp.name] = emp;
          pass2Added++;
        } else {
          // Merge cellules : pass1 prioritaire, pass2 complète les manquants
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
        pass1_employees: pass1Employees.length,
        pass2_employees: pass2Employees.length,
        pass2_added_after_dedup: pass2Added,
        unique_employees: out.employees.length,
        sample_first_emp: out.employees[0] || null,
        sample_last_emp: out.employees[out.employees.length - 1] || null
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
    BRTPECK_RE,
    TEAM_NUM_AFTER_POST_RE,
    POST_CODE_PREFIX_RE,
    parseRawLine,
    parseFromRawText,
    VERSION: "T1-text-parser-v0.4.0-line-by-line-poststrip"
  };
}));
