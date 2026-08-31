/**
 * homonyms-guard.js — Anti-confusion homonymes (CLAUDE.md erreurs #38, #44).
 *
 * Le PDF SBM contient plusieurs personnes au SURNAME identique mais avec
 * des initiales différentes — ce sont des PERSONNES DISTINCTES (parfois
 * frères, conjoints, parents-enfants). Le fuzzy match aveugle a déjà
 * causé plusieurs incidents en production :
 *
 *   - v9.376-377 : Levenshtein ≥0.75 matchait `BORGIA L` à `BORGIA T`
 *     (similarité 0.875). Solution : si surname identique + initiale
 *     différente + initiales courtes (≤2 chars) → consulter
 *     `known_identities` ; vu ≥2× → vrai homonyme.
 *   - v9.723 fallback cadres : matchait `eName` à un emp `family==="cadres"`
 *     par nom de famille seul. Fix : initiale obligatoire + vérifier que
 *     l'import est un import cadres avant de matcher.
 *   - v9.658 : `runAudit` "noms similaires" SEULEMENT si surname EXACTEMENT
 *     identique OU similarité globale ≥ 0.85. Plus de Levenshtein 0.55 lax.
 *
 * Liste cumulative des homonymes connus (NOTES_USER lignes 65-94 +
 * confirmations Kevin 2026-05-16). Toute paire avec surname identique
 * MAIS initiale différente listée ici DOIT être traitée comme 2 personnes
 * distinctes.
 */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.HomonymsGuard = factory();
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* Format : { surname: [["init1", "rôle/contexte"], ["init2", "rôle/contexte"], ...] }
   * Casse-insensible (comparé en upper). */
  const KNOWN_HOMONYMS = {
    "BORGIA":         [["T", "Employé CP"], ["L", "Employé"]],
    "LANDAU":         [["B", "Chef BJ"], ["J", "Pit Boss"]],
    "ENZA":           [["B", "Chef BJ"], ["C", "Pit Boss"]],
    "ESPAGNOL":       [["S", "Chef BJ"], ["P", "Employé"], ["A", "Employé"]],
    "CAMPI":          [["H", "Pit Boss Hélène"], ["PH", "Chef Philippe"]],
    "BERNARDI":       [["JE", "Chef roulette"], ["J", "Employé CMC"]],
    "BERNARD":        [["J", "Employé"]], // distinct de BERNARDI J/JE
    "DESSI":          [["P", "Employé"], ["F", "Employé"]],
    "ELIODORI":       [["V", "Chef"], ["J", "Employé"]],
    "SEGGIARO":       [["G", "Employé"], ["J", "Employé"]],
    "BARILARO":       [["A", "Employé"], ["H", "Employé"]],
    "PETIT":          [["T", "Thierry"], ["J", "Johanna"]],
    "BRASSEUR":       [["F", "Chef BJ"], ["Fr", "Employé"]],
    "LANTERI":        [["E", "Employé"], ["T", "Employé"]],
    "LANTERI MINET":  [["P", "Roulette éq.2"]],  // distinct de LANTERI E/T
    "LAVAGNA":        [["J", "Chef Formation"], ["Y", "Employé"], ["E", "Employé"]],
    "CATALA":         [["P", "Employé M"], ["T", "Employé CMC"]],
    "ELENA":          [["C", "Employé EDC"], ["A", "Employé"]],
    "DELLA PINA":     [["L", "Employé"], ["M", "Employé"]],
    "MARTINI":        [["M", "Employé CP"]],
    "MARTIRE":        [["M", "EDC"]] // distinct de MARTINI M
  };

  /** Normalise un surname pour comparaison (upper, NFD, retire accents). */
  function normSurname(s) {
    if (!s) return "";
    return String(s).toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  }

  /** Normalise une initiale pour comparaison (upper). */
  function normInitial(s) {
    if (!s) return "";
    return String(s).toUpperCase().trim();
  }

  /** Retourne true si (surname, initial) correspond à un homonyme connu.
   *  Permet de savoir si on doit être strict sur le matching. */
  function isKnownHomonym(surname, initial) {
    if (!surname) return false;
    const sn = normSurname(surname);
    const init = normInitial(initial);
    if (!KNOWN_HOMONYMS[sn]) return false;
    return KNOWN_HOMONYMS[sn].some(([i]) => normInitial(i) === init);
  }

  /** Liste les autres homonymes connus pour un surname donné (exclu l'initiale
   *  fournie). Permet d'avertir qu'il y a des risques de confusion. */
  function getOtherHomonyms(surname, initial) {
    if (!surname) return [];
    const sn = normSurname(surname);
    if (!KNOWN_HOMONYMS[sn]) return [];
    const init = normInitial(initial);
    return KNOWN_HOMONYMS[sn]
      .filter(([i]) => normInitial(i) !== init)
      .map(([i, ctx]) => ({ initial: i, context: ctx }));
  }

  /** Vérifie qu'un match candidate (candidateSurname, candidateInitial)
   *  pour un nom source (sourceSurname, sourceInitial) est SAFE.
   *
   *  Retourne :
   *    { safe: true, reason }                  → match autorisé
   *    { safe: false, reason, homonyms: [...] } → bloqué, homonymes connus
   */
  function canMatch(sourceSurname, sourceInitial, candidateSurname, candidateInitial) {
    const sSn = normSurname(sourceSurname);
    const cSn = normSurname(candidateSurname);
    const sIn = normInitial(sourceInitial);
    const cIn = normInitial(candidateInitial);

    // Cas trivial : tout pareil → safe.
    if (sSn === cSn && sIn === cIn) {
      return { safe: true, reason: "exact_match" };
    }

    // Surnames différents → pas notre problème ici.
    if (sSn !== cSn) {
      return { safe: true, reason: "different_surnames" };
    }

    // Surname identique mais initiales différentes → DANGER.
    // Si l'un OU l'autre est dans KNOWN_HOMONYMS → bloquer formellement.
    const homonyms = KNOWN_HOMONYMS[sSn];
    if (homonyms) {
      const allInits = homonyms.map(([i]) => normInitial(i));
      if (allInits.indexOf(sIn) >= 0 && allInits.indexOf(cIn) >= 0) {
        return {
          safe: false,
          reason: "known_homonyms_distinct",
          homonyms: homonyms.map(([i, ctx]) => ({ initial: i, context: ctx })),
          msg: `${sSn} ${sIn} ≠ ${sSn} ${cIn} — homonymes distincts dans le registre. Ne JAMAIS merger.`
        };
      }
    }

    // Initiales courtes (≤ 2 chars) → suspect mais peut être typo OCR.
    // On laisse passer mais on flag.
    if (sIn.length <= 2 && cIn.length <= 2 && sIn !== cIn) {
      return {
        safe: false,
        reason: "initial_mismatch_short",
        msg: `${sSn} ${sIn} vs ${sSn} ${cIn} — initiales courtes différentes, vérifier homonyme.`
      };
    }

    // Cas restant : init1=B init2=Br (initiale étendue ou typo OCR) → safe.
    return { safe: true, reason: "permissive_match" };
  }

  /** Audit complet d'une liste d'employés extraits : détecte les paires
   *  d'emps avec surname identique mais initiales différentes (déjà séparés
   *  par le parser, ce qui est SAIN) + signale les mergeages potentiels
   *  qui auraient été faits par erreur. */
  function auditEmployees(employees) {
    const out = { ok: true, pairs_detected: [], merging_risks: [], known_homonyms_found: 0 };
    if (!employees) return out;

    const bySurname = {};
    for (const emp of employees) {
      const fullName = emp.fullName || emp.name;
      if (!fullName) continue;
      const parts = String(fullName).trim().split(/\s+/);
      if (parts.length < 2) continue;
      const init = parts[parts.length - 1];
      const surname = parts.slice(0, -1).join(" ");
      const sn = normSurname(surname);
      if (!bySurname[sn]) bySurname[sn] = [];
      bySurname[sn].push({ fullName, surname, initial: init, emp });
    }

    for (const sn of Object.keys(bySurname)) {
      const group = bySurname[sn];
      if (group.length < 2) continue;
      const inits = group.map(g => normInitial(g.initial));
      const uniqueInits = Array.from(new Set(inits));
      if (uniqueInits.length === group.length) {
        // Tous distincts → c'est sain (chaque homonyme préservé)
        out.pairs_detected.push({
          surname: sn,
          count: group.length,
          initials: uniqueInits,
          known: !!KNOWN_HOMONYMS[sn],
          status: "ok_distinct"
        });
        if (KNOWN_HOMONYMS[sn]) out.known_homonyms_found++;
      } else {
        // 2 emps même surname + même initiale → ANOMALIE (doublon ?)
        out.merging_risks.push({
          surname: sn,
          duplicate_initial: uniqueInits.find(i => inits.filter(x => x === i).length > 1),
          msg: `${sn} apparaît ${group.length}× avec la même initiale — doublon ou homonyme ratoupé ?`
        });
      }
    }

    return out;
  }

  return {
    canMatch,
    isKnownHomonym,
    getOtherHomonyms,
    auditEmployees,
    normSurname,
    normInitial,
    KNOWN_HOMONYMS,
    VERSION: "T1-homonyms-v0.1.0-anti-merge"
  };
}));
