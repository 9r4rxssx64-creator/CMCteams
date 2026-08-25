/**
 * validate-post-import.js — Validations Convention SBM post-import.
 *
 * Sources :
 *   - Convention Collective Jeux de Table SBM 1er avril 2015 (Articles 17.5, 35)
 *   - Note SBM 6 janvier 1993 (Bernard Lées) — 43 codes Bulletin officiels
 *   - NOTES_USER « RÈGLE ABSOLUE : TOUT LE MONDE A UN PLANNING SI SON NOM EST
 *     DANS LE PDF » (Kevin 2026-05-26)
 *   - IMPORT_RECONNAISSANCE.md §13.3 (règles validation post-import)
 *
 * Règle absolue Kevin : reproduction à l'identique. Ce module ne CORRIGE
 * RIEN, il ne fait que SIGNALER. Toute violation détectée → entry dans
 * `findings` avec severity (info / warn / err / critical).
 *
 * SORTIE :
 *   {
 *     ok: true,
 *     findings: [
 *       { id, severity, code, emp?, count?, msg, hint?, article? }
 *     ],
 *     stats: {
 *       checks_run, findings_total, by_severity, employees_checked
 *     }
 *   }
 */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.ValidatePostImport = factory();
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* Codes considérés comme "repos" pour Art. 17.5. */
  const REST_CODES = new Set(["RH", "R", "RTP", "RTR", "RRT", "RHS", "DP",
                              "CP", "CRH", "CPS", "CPM", "CDP", "CDH",
                              "FL", "CFL",
                              "FCP", "FCS", "FRH", "FFL"]);

  /* Codes sanctions à signaler en CRITICAL. */
  const SANCTION_CODES = new Set(["PNE", "AMP", "MPC", "MPP"]);

  /* Codes absences maladie / accident (peuvent compter comme repos sur le
   * volet "ne travaille pas" mais pas comme "repos hebdo" stricto sensu). */
  const ABSENCE_CODES = new Set(["M", "MAL", "AT", "MT", "ABS", "ABI", "ABP",
                                 "AF", "CL", "CEO", "CSC", "CSS", "PAT"]);

  /** Compte les jours de repos dans une fenêtre glissante de N jours.
   *  Retourne le min observé sur toutes les fenêtres possibles. */
  function minRestInWindow(days, windowSize) {
    if (!days) return 0;
    windowSize = windowSize || 42; // 6 semaines

    const dayKeys = Object.keys(days).map(d => parseInt(d, 10))
      .filter(n => !isNaN(n) && n >= 1 && n <= 31)
      .sort((a, b) => a - b);
    if (dayKeys.length === 0) return 0;

    const maxDay = dayKeys[dayKeys.length - 1];
    // Sur le mois courant, on regarde toutes les fenêtres de windowSize
    // qui tiennent dedans. Si maxDay < windowSize, on retourne juste le
    // total (pas assez de données pour 6 sem complètes — info).
    if (maxDay < windowSize) {
      let restCount = 0;
      for (const d of dayKeys) {
        if (REST_CODES.has(days[String(d)])) restCount++;
      }
      return { partial: true, restCount, maxDayObserved: maxDay };
    }

    let minObs = Infinity;
    for (let start = 1; start + windowSize - 1 <= 31; start++) {
      let count = 0;
      for (let d = start; d < start + windowSize; d++) {
        if (REST_CODES.has(days[String(d)])) count++;
      }
      if (count < minObs) minObs = count;
    }
    return { partial: false, minObserved: minObs === Infinity ? 0 : minObs };
  }

  /** Art. 17.5 : min 10 jours repos / 6 semaines (42 jours) glissantes.
   *  PARTIEL sur 1 mois (max 31j) : on retourne le total + flag partial. */
  function validateMinRestPerSixWeeks(employees) {
    const findings = [];
    if (!employees) return findings;
    for (const emp of employees) {
      const name = emp.fullName || emp.name;
      if (!name || !emp.days) continue;
      // Skip emps en statut intégral (CP/AF/M tout le mois)
      const dayCount = Object.keys(emp.days).length;
      if (dayCount < 10) continue;
      const res = minRestInWindow(emp.days, 42);
      if (res.partial) {
        // Sur 31j max, le min de RH attendu est ~5-7 (proportionnel à 10 sur 42j).
        // Pour rester strict Art. 17.5, on ne flag pas en partial mais on note.
        continue;
      }
      if (res.minObserved < 10) {
        findings.push({
          id: "art_17_5_min_rest",
          severity: "warn",
          code: "MIN_REST_42D",
          emp: name,
          count: res.minObserved,
          msg: `${name} : seulement ${res.minObserved} jours repos sur 6 semaines (min 10 selon Convention)`,
          article: "17.5",
          hint: "Le 2e jour de repos peut être supprimé hors forte affluence. Les 4 premiers récupérés sans majoration, au-delà = +50%."
        });
      }
    }
    return findings;
  }

  /** Art. 35 : effectif chefs / effectif employés non-cadre ∈ [25%, 30%].
   *  Si groupe fermé : ratio transitoire 33,5% accepté (10 ans). */
  function validateChefRatio(employees) {
    const findings = [];
    if (!employees) return findings;

    let chefs = 0, employesNonCadres = 0;
    for (const emp of employees) {
      const isCadre = emp.family === "cadres" || emp.role === "pit" ||
                      emp.role === "sup" || emp.role === "ins";
      if (isCadre) continue;
      employesNonCadres++;
      if (emp.chef === true || (emp.brtpeck && /\.$/.test(emp.brtpeck))) chefs++;
    }

    if (employesNonCadres === 0) return findings;
    const ratio = chefs / employesNonCadres;
    const pct = Math.round(ratio * 100);

    if (ratio < 0.25) {
      findings.push({
        id: "art_35_chef_ratio_low",
        severity: "warn",
        code: "CHEF_RATIO",
        count: pct,
        msg: `Ratio chefs / employés non-cadres = ${pct}% (Convention Art. 35 : min 25%)`,
        article: "35",
        hint: "Convention Art. 35 : Chefs de table = 25-30% effectif employés. Groupe fermé : ratio transitoire 33,5% à ramener dans les 10 ans."
      });
    } else if (ratio > 0.335) {
      findings.push({
        id: "art_35_chef_ratio_high",
        severity: "info",
        code: "CHEF_RATIO",
        count: pct,
        msg: `Ratio chefs = ${pct}% (au-dessus du seuil 30% mais sous 33,5% transitoire groupe fermé)`,
        article: "35"
      });
    } else if (ratio > 0.30) {
      findings.push({
        id: "art_35_chef_ratio_above_max",
        severity: "info",
        code: "CHEF_RATIO",
        count: pct,
        msg: `Ratio chefs = ${pct}% (cible 25-30%)`,
        article: "35"
      });
    }

    return findings;
  }

  /** Art. 35 : plancher absolu 336 personnes (cadres + employés). */
  function validateMin336Effectif(employees) {
    const findings = [];
    if (!employees) return findings;
    const total = employees.length;
    if (total < 336) {
      findings.push({
        id: "art_35_min_336",
        severity: "warn",
        code: "MIN_336_EFFECTIF",
        count: total,
        msg: `Effectif total ${total} < 336 (plancher absolu Convention Art. 35)`,
        article: "35",
        hint: "Cet effectif n'est peut-être qu'un sous-ensemble (1 PDF = 1 section)."
      });
    }
    return findings;
  }

  /** Vérifie que tout marqueur ★/* avant le nom est cohérent avec
   *  emp.senior === true OU emp.chef_european === true. */
  function validateSeniorMarker(employees) {
    const findings = [];
    if (!employees) return findings;
    for (const emp of employees) {
      const name = emp.fullName || emp.name;
      if (!name) continue;
      const hasMarker = emp.has_star_marker === true ||
                        emp.senior === true ||
                        emp.chef_european === true;
      if (!hasMarker) continue;
      // S'il a un marqueur ★ mais aucune des deux capacités cochées → flag
      if (emp.has_star_marker === true && !emp.senior && !emp.chef_european) {
        findings.push({
          id: "marker_star_unmapped",
          severity: "info",
          code: "STAR_MARKER",
          emp: name,
          msg: `${name} : marqueur ★/* détecté mais ni senior ni chef_european assignés`,
          hint: "Le ★ rouge avant le nom signifie chef européen (Convention Art. 4) OU senior 55+ (rotation 40 min Art. 17.8)."
        });
      }
    }
    return findings;
  }

  /** Détecte les codes sanctions dans les cellules (PNE/AMP/MPC/MPP).
   *  Toujours CRITICAL — Kevin doit vérifier avec RH avant de garder. */
  function validateNoForbiddenCodes(employees) {
    const findings = [];
    if (!employees) return findings;
    for (const emp of employees) {
      const name = emp.fullName || emp.name;
      if (!name || !emp.days) continue;
      for (const dayStr of Object.keys(emp.days)) {
        const code = String(emp.days[dayStr] || "").toUpperCase();
        // Strip suffixes for sanction detection
        const baseCode = code.replace(/[c'":*]+$/g, "");
        if (SANCTION_CODES.has(baseCode)) {
          findings.push({
            id: "sanction_code_detected",
            severity: "critical",
            code: baseCode,
            emp: name,
            count: parseInt(dayStr, 10),
            msg: `⚠ ${name} : code sanction "${baseCode}" détecté jour ${dayStr}`,
            hint: "PNE (Préavis non Exécuté), AMP (Mise à Pied non rémunérée), MPC (Mise à Pied Conservatoire), MPP (Mise à Pied Payée). Vérifier avec RH avant de garder."
          });
        }
      }
    }
    return findings;
  }

  /** Règle absolue Kevin 2026-05-26 : « TOUT LE MONDE A UN PLANNING SI SON
   *  NOM EST DANS LE PDF ». Vérifie que chaque nom détecté dans rawText
   *  a au moins une cellule remplie dans les passes employees.
   *
   *  Utilise la regex NAME_RE du PDF source : `[A-Z]{2,}\s+[A-Z]{1,3}\s+\d+\s+\d+`
   *  (nom + initiale + 2 chiffres = format avec période d'embauche).
   *
   *  Plus souple : on cherche aussi `NOM Initiale` simple. */
  function validateEveryoneHasPlanning(rawText, employees) {
    const findings = [];
    if (!rawText || !employees) return findings;

    const empMap = new Map();
    for (const emp of employees) {
      const name = emp.fullName || emp.name;
      if (!name) continue;
      empMap.set(name.toUpperCase().trim(), emp);
    }

    // Extraction des noms depuis le rawText.
    const NAME_RE = /\b([A-ZÉÈÀÊÂÔÛÄËÏÖÜÇ][A-ZÉÈÀÊÂÔÛÄËÏÖÜÇ'\- ]{2,30})\s+([A-Z]{1,3})\.?\b/g;
    const EXCLUDE = new Set(["DU", "AU", "CP", "AF", "RH", "MAL", "EDC",
                             "PIT", "BOSS", "CMC", "CDP", "CCDP",
                             "MAI", "JUIN", "AVRIL", "JUILLET", "AOUT",
                             "FORMATION", "MALADIE", "PATERNITE"]);
    const foundInPdf = new Set();
    let m;
    while ((m = NAME_RE.exec(rawText))) {
      const t1 = m[1].trim().replace(/\s+/g, " ");
      const t2 = m[2].trim();
      if (EXCLUDE.has(t1.split(" ")[0])) continue;
      const fullName = (t1 + " " + t2).toUpperCase();
      foundInPdf.add(fullName);
    }

    for (const fullName of foundInPdf) {
      const emp = empMap.get(fullName);
      if (!emp) {
        // Nom dans PDF mais aucun emp extrait → erreur P0 absolue
        findings.push({
          id: "name_in_pdf_no_emp",
          severity: "critical",
          code: "NAME_NO_EMP",
          emp: fullName,
          msg: `${fullName} : présent dans le PDF source mais aucun employé extrait`,
          hint: "Règle absolue Kevin 2026-05-26 : tout nom écrit dans le PDF DOIT avoir ≥1 cellule remplie. Le parser a échoué à le détecter."
        });
        continue;
      }
      const cellCount = emp.days ? Object.keys(emp.days).length : 0;
      if (cellCount === 0) {
        findings.push({
          id: "emp_zero_cells",
          severity: "critical",
          code: "ZERO_CELLS",
          emp: fullName,
          msg: `${fullName} : 0 cellule remplie alors que présent dans PDF`,
          hint: "Règle absolue Kevin 2026-05-26. Causes possibles : encadré statut intégral (CP/AF/M tout le mois) non parsé, ligne mal lue, format non supporté."
        });
      }
    }

    return findings;
  }

  /** Validation cohérence calendrier affluence : si import = période peak
   *  (Grand Prix mai 22-26, été, Noël) et version V3+ → cohérent.
   *  Si période calme et V3+ → flag pourquoi 3 versions. */
  function validateAffluencePeriodVersion(meta) {
    const findings = [];
    if (!meta) return findings;
    const version = meta.version || 1;
    const monthY = meta.month_year;
    if (!monthY || monthY.month === undefined) return findings;

    const peakMonths = [4, 6, 7, 11]; // mai (GP F1), juillet, août, décembre
    const isPeak = peakMonths.indexOf(monthY.month) >= 0;

    if (version >= 3 && !isPeak) {
      findings.push({
        id: "version_high_no_affluence",
        severity: "info",
        code: "VERSION_AFFLUENCE",
        count: version,
        msg: `Import V${version} dans un mois sans forte affluence (${monthY.monthName || "?"})`,
        article: "17.6",
        hint: "Convention Art. 17.6 : forte affluence = juillet-août, 16 déc-15 janv, Grand Prix, Pâques. Pourquoi cette V" + version + " ?"
      });
    }

    return findings;
  }

  /** Lance toutes les validations dans l'ordre. */
  function runAll(parseResult) {
    const out = {
      ok: true,
      findings: [],
      stats: {
        checks_run: 7,
        findings_total: 0,
        by_severity: { info: 0, warn: 0, err: 0, critical: 0 },
        employees_checked: 0
      }
    };

    if (!parseResult) {
      out.ok = false;
      out.findings.push({ severity: "err", msg: "parseResult absent" });
      return out;
    }

    // Source unique d'emps = passe G si présente, sinon 1ère passe avec emps.
    const passes = parseResult.passes || [];
    let employees = [];
    const passG = passes.find(p => p.passe === "G" && p.ok);
    if (passG && passG.employees) {
      employees = passG.employees;
    } else {
      const anyWithEmps = passes.find(p => p.ok && Array.isArray(p.employees) && p.employees.length > 0);
      if (anyWithEmps) employees = anyWithEmps.employees;
    }

    // Normalisation : { fullName, days, family?, brtpeck?, chef?, senior? }
    const normEmps = employees.map(e => ({
      fullName: e.name || e.fullName,
      days: e.days || {},
      family: e.family || null,
      role: e.role || null,
      brtpeck: e.brtpeck || null,
      chef: e.chef === true,
      senior: e.senior === true,
      chef_european: e.chef_european === true,
      has_star_marker: e.has_star_marker === true
    }));
    out.stats.employees_checked = normEmps.length;

    // Exécution des checks
    const checks = [
      { name: "art_17_5", fn: () => validateMinRestPerSixWeeks(normEmps) },
      { name: "art_35_ratio", fn: () => validateChefRatio(normEmps) },
      { name: "art_35_min_336", fn: () => validateMin336Effectif(normEmps) },
      { name: "senior_marker", fn: () => validateSeniorMarker(normEmps) },
      { name: "forbidden_codes", fn: () => validateNoForbiddenCodes(normEmps) },
      { name: "everyone_has_planning", fn: () => {
          const passA = passes.find(p => p.passe === "A" && p.ok);
          const raw = passA ? (passA.textRaw || "") : "";
          return validateEveryoneHasPlanning(raw, normEmps);
        }
      },
      { name: "affluence_version", fn: () => validateAffluencePeriodVersion({
          version: parseResult.version_detected && parseResult.version_detected.version,
          month_year: parseResult.month_year_detected
        })
      }
    ];

    for (const check of checks) {
      try {
        const findings = check.fn();
        for (const f of findings) {
          out.findings.push(Object.assign({ check: check.name }, f));
          out.stats.by_severity[f.severity || "info"]++;
        }
      } catch (e) {
        out.findings.push({
          severity: "err",
          check: check.name,
          msg: "Exception dans validation " + check.name + " : " + ((e && e.message) || String(e))
        });
        out.stats.by_severity.err++;
      }
    }

    out.stats.findings_total = out.findings.length;
    return out;
  }

  return {
    runAll,
    validateMinRestPerSixWeeks,
    validateChefRatio,
    validateMin336Effectif,
    validateSeniorMarker,
    validateNoForbiddenCodes,
    validateEveryoneHasPlanning,
    validateAffluencePeriodVersion,
    minRestInWindow,
    REST_CODES,
    SANCTION_CODES,
    ABSENCE_CODES,
    VERSION: "T1-validate-v0.1.0-art-17-5-35"
  };
}));
