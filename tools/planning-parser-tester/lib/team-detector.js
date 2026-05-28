/**
 * team-detector.js — Détection des équipes par PATTERN DE JOURS REPOS (RH/R).
 *
 * ALGORITHME OFFICIEL SBM (Kevin 2026-05-15 + 2026-05-28, NOTES_USER lignes 8-40,
 * CLAUDE.md « DÉTECTION ÉQUIPES PAR JOURS REPOS ») :
 *
 * Le PDF SBM utilise 4 sources de délimitation (par priorité décroissante) :
 *   1. GROS TRAIT NOIR FONCÉ entre blocs équipes (visible PDF, PERDU au copy-paste texte)
 *      → Source PRIMAIRE selon Kevin (« en plus du gros trait normalement »)
 *      → Détectable UNIQUEMENT via Vision IA (passes B-E) qui voit le rendu graphique
 *      → Si fourni en input via `opts.teamSeparators` (lignes y des séparateurs),
 *        c'est ÇA qui prime sur tout le reste.
 *   2. NUMÉRO ÉQUIPE EXPLICITE entre POST et NOM (V1 juin 2026+, ex « BRTP+K 5 NAME »)
 *      → Détecté côté text-parser.js (capture numérique)
 *   3. PATTERN DE JOURS DE REPOS (RH / R) IDENTIQUE = même équipe
 *      → ce que ce module implémente. Fonctionne sur texte natif seul.
 *   4. COLONNE PDF (algo v9.719 CMCteams) : chaque colonne du PDF = une équipe
 *      → fallback si signature RH ambiguë.
 *
 * Règle de détection (CORRIGÉE Kevin 2026-05-28) :
 *   - Les employés ayant EXACTEMENT les mêmes jours RH/R dans le mois
 *     appartiennent à la MÊME équipe OU à son ÉQUIPE MIROIR.
 *   - Distinction équipe principale ⇆ miroir :
 *       MÊMES jours RH/R (identiques !) + HORAIRES DE BASE DIFFÉRENTS
 *       + POSITION DIFFÉRENTE dans le PDF (principale en haut, miroir plus bas).
 *     Exemple vérité terrain (juin V1 NOTES_USER 134+) :
 *       Équipe principale : BARONE E et al. — horaires `20/5` — RH jours X
 *       Équipe miroir     : BONO V et al.   — horaires `22/6'` — MÊMES RH jours X
 *     L'idée métier : 2 groupes qui se REPOSENT les mêmes jours mais qui
 *     travaillent à des HORAIRES DIFFÉRENTS (l'un en matinée/jour, l'autre
 *     en soirée/nuit) — couvre les amplitudes d'ouverture du casino.
 *   - Chaque équipe a typiquement 4-6 employés (header PDF indique le compte :
 *     « 4 RH du au » = 4 emps avec RH à cette position)
 *
 * Effectifs vérité terrain Kevin :
 *   - Chefs BJ : 2-3 emps/équipe (effectifs plus petits)
 *   - Roulettes : 5-6 emps/équipe
 *   - Employés CMC : variable selon mois
 *   - Cadres (Pit Boss/Sup) : PAS D'ÉQUIPES — assignation individuelle (skip)
 *
 * RÈGLES Kevin (CLAUDE.md erreurs #38, #44, #50, #62, #63) :
 *   - JAMAIS écraser une cellule déjà parsée (consensus = fill-empty-only)
 *   - JAMAIS confondre homonymes (LANDAU B ≠ LANDAU J : surname identique + initiale ≠)
 *   - NE PAS fallback sur emp.team DEF_EMP (équipe change CHAQUE mois)
 *   - Skip emps avec <20 cells (signature non fiable)
 *   - Skip groupes <3 emps (faux groupements évités) — sauf chefs BJ effectif 2
 *   - SKIP emps `family==="cadres"` (Pit Boss/Sup pas d'équipe)
 *
 * SORTIE :
 *   {
 *     ok: true,
 *     teams: [
 *       { id: "t1", signature: "RH:[7,14,21,28]", family: "roulettes",
 *         firstWorkCode: "20/5", members: [{fullName}], rhDays: [7,14,21,28] }
 *     ],
 *     mirrors: [ { teamId, mirrorTeamId, rhOffset, reason } ],
 *     unassigned: [{fullName, reason}],
 *     warnings: []
 *   }
 */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.TeamDetector = factory();
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /** Détecte si un code est un jour de repos (RH ou R, casse insensible). */
  function isRestCode(code) {
    if (!code) return false;
    const c = String(code).trim().toUpperCase();
    return c === "RH" || c === "R";
  }

  /** Extrait la signature de jours de repos d'un employé : tableau des jours
   *  où l'emp est en RH/R, triés croissants. */
  function getRestSignature(days) {
    if (!days) return [];
    const rest = [];
    for (const dayStr of Object.keys(days)) {
      if (isRestCode(days[dayStr])) {
        const d = parseInt(dayStr, 10);
        if (!isNaN(d)) rest.push(d);
      }
    }
    return rest.sort((a, b) => a - b);
  }

  /** Trouve le premier code de travail (non-statut, non-repos) dans days.
   *  Préserve le code TEL QUEL (suffixes inclus) — règle reproduction identique. */
  function getFirstWorkCode(days) {
    if (!days) return null;
    const STATUS = new Set(["RH", "R", "CP", "AF", "M", "MAL", "MT", "PAT", "AT", "ABS", "ABI",
                            "SS", "RRT", "CRH", "CFL", "FL", "CSS", "EDC", "HD", "HC", "PRT"]);
    const dayKeys = Object.keys(days).map(d => parseInt(d, 10)).filter(n => !isNaN(n)).sort((a, b) => a - b);
    for (const d of dayKeys) {
      const code = days[String(d)];
      if (!code) continue;
      const upper = String(code).trim().toUpperCase();
      if (STATUS.has(upper)) continue;
      return code;
    }
    return null;
  }

  /** Normalise un code horaire pour clustering (retire suffixes c, apostrophe,
   *  guillemet, astérisque, deux-points en fin de code).
   *  RAPPEL CLAUDE.md erreur #63 : on ne strip JAMAIS au stockage. Ici c'est
   *  juste pour le clustering d'équipes (le code de base donne le « cycle »
   *  partagé chef + croupiers). */
  function normalizeWorkCodeForClustering(code) {
    if (!code) return null;
    return String(code).replace(/[c'"*:]+$/g, "").trim();
  }

  /** Trouve dans `days` la "signature étendue" :
   *    { rhDays, firstWorkCode, firstWorkCodeNorm, cycleHint }
   *  cycleHint = nombre de jours entre 2 RH consécutifs (utile pour matcher
   *  les miroirs même si l'offset est juste un décalage de cycle). */
  function getExtendedSignature(days) {
    const rhDays = getRestSignature(days);
    const firstWorkCode = getFirstWorkCode(days);
    const firstWorkCodeNorm = normalizeWorkCodeForClustering(firstWorkCode);
    let cycleHint = null;
    if (rhDays.length >= 2) {
      const diffs = [];
      for (let i = 1; i < rhDays.length; i++) diffs.push(rhDays[i] - rhDays[i - 1]);
      // Mode commun de l'intervalle entre 2 RH
      const counts = {};
      for (const d of diffs) counts[d] = (counts[d] || 0) + 1;
      let max = 0;
      for (const d of Object.keys(counts)) {
        if (counts[d] > max) { max = counts[d]; cycleHint = parseInt(d, 10); }
      }
    }
    return { rhDays, firstWorkCode, firstWorkCodeNorm, cycleHint };
  }

  /** Compare 2 signatures RH : retourne true si IDENTIQUES (même jours exactement). */
  function rhEqual(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  /** DEPRECATED (Kevin 2026-05-28) : avant je croyais que les miroirs étaient
   *  DÉCALÉS d'un offset constant. Kevin a corrigé : ils ont les MÊMES RH/R
   *  exactement, mais horaires base différents. La fonction reste exportée
   *  pour les tests legacy mais le pipeline utilise désormais rhEqual + base ≠. */
  function rhMirrorOffset(a, b) {
    if (!a || !b || a.length !== b.length || a.length < 2) return null;
    const offsets = [];
    for (let i = 0; i < a.length; i++) offsets.push(b[i] - a[i]);
    const first = offsets[0];
    let consistent = 0;
    for (const o of offsets) if (o === first) consistent++;
    if (consistent / offsets.length >= 0.75 && first !== 0) return first;
    return null;
  }

  /** Vraie règle miroir (Kevin 2026-05-28) : MÊMES jours RH/R + HORAIRES DE
   *  BASE DIFFÉRENTS. Retourne true si A et B sont une paire miroir
   *  (l'ordre dans le PDF distingue principale/miroir, géré par l'appelant). */
  function isMirrorPair(A, B) {
    if (!A || !B || !A.rhDays || !B.rhDays) return false;
    if (!rhEqual(A.rhDays, B.rhDays)) return false;
    if (!A.firstWorkCodeNorm || !B.firstWorkCodeNorm) return false;
    return A.firstWorkCodeNorm !== B.firstWorkCodeNorm;
  }

  /** Algorithme principal. Reçoit une liste d'emps { fullName, days, family? }.
   *  Retourne teams + mirrors + unassigned + warnings. */
  /* Codes d'absence/statut (jour NON travaillé dans la rotation d'équipe, à
   *  ignorer dans la comparaison). DEPL (déplacement/détaché) et RRT (repos
   *  compensateur) ne font pas partie de la rotation normale → ignorés aussi
   *  (sinon un membre détaché quelques jours est faussement séparé de son équipe
   *  — cas LAVAGNA J, juin). */
  const STATUS_ABS = new Set(["CP", "AF", "M", "MAL", "MT", "PAT", "AT", "ABS", "ABI",
                              "SS", "RRT", "CRH", "CFL", "FL", "CSS", "EDC", "HD", "HC", "PRT",
                              "DEPL", "DEP", "FORM", "STAGE"]);

  /** Normalise un code journalier pour comparaison d'équipe :
   *   RH/R → "REST" ; CP/M/AF/… → "ABS" (jour non travaillé) ; sinon le code de
   *   base SANS suffixe (c/'/"/*), upper. Deux coéquipiers ont le MÊME code
   *   normalisé chaque jour travaillé (ils tournent ensemble). */
  function normalizeDayCode(code) {
    if (!code) return null;
    const u = String(code).trim().toUpperCase();
    if (u === "RH" || u === "R") return "REST";
    if (STATUS_ABS.has(u)) return "ABS";
    return String(code).replace(/[c'"*:]+$/gi, "").trim().toUpperCase();
  }

  /** Algorithme principal (v0.4 — Kevin 2026-05-28, validé sur son équipe juin).
   *
   *  CLÉ D'ÉQUIPE = MÊMES CODES JOURNALIERS sur les jours TRAVAILLÉS EN COMMUN.
   *  Robuste aux CP/absence partiels (un membre en CP la moitié du mois reste
   *  dans l'équipe : sur ses jours travaillés, ses codes == ceux des coéquipiers)
   *  et à la rotation (toute l'équipe tourne ensemble : 20/5→19/4→16/22→14/19→
   *  RH…). L'ancienne signature « repos brut + 1er code » cassait sur les CP
   *  partiels (repos tronqués → coéquipiers séparés).
   *
   *  Étapes : (1) normalise chaque jour ; (2) union-find : 2 emps unis si codes
   *  identiques sur ≥minOverlap jours co-présents (dont ≥minWorkOverlap jours
   *  travaillés) à 100% ; (3) clusters ≥minTeamSize = équipes ; (4) miroir =
   *  2 équipes même famille, MÊMES repos, rotations horaires différentes. */
  function detectTeams(employees, opts) {
    opts = opts || {};
    const minWorkDays = opts.minWorkDays || 5;        // jours travaillés min pour signature fiable
    const minOverlap = opts.minOverlap || 6;           // jours co-présents min pour comparer
    const minWorkOverlap = opts.minWorkOverlap || 3;   // dont jours travaillés (pas que du repos)
    const minTeamSize = opts.minTeamSize !== undefined ? opts.minTeamSize : 2;
    const skipFamilies = new Set(opts.skipFamilies || ["cadres"]);

    const out = { ok: true, teams: [], mirrors: [], unassigned: [], warnings: [] };

    // 1) Filtre + carte des codes journaliers normalisés
    const nodes = [];
    for (const emp of employees) {
      if (!emp || !emp.fullName) continue;
      if (emp.family && skipFamilies.has(emp.family)) {
        out.unassigned.push({ fullName: emp.fullName, reason: "family=" + emp.family + " (skip — pas d'équipe)" });
        continue;
      }
      const days = emp.days || {};
      const dn = {}; let work = 0, rest = 0;
      for (const k of Object.keys(days)) {
        const d = parseInt(k, 10); if (isNaN(d)) continue;
        const n = normalizeDayCode(days[k]); if (!n) continue;
        dn[d] = n;
        if (n === "REST") rest++; else if (n !== "ABS") work++;
      }
      if (work < minWorkDays) {
        out.unassigned.push({ fullName: emp.fullName, reason: work + " jours travaillés (<" + minWorkDays + ") — statut/absence intégral ?" });
        continue;
      }
      nodes.push({ emp, dn, work, rest, family: emp.family || null });
    }

    // 2) Union-find par identité des codes journaliers (jours co-travaillés)
    const parent = nodes.map((_, i) => i);
    function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
    function union(a, b) { parent[find(a)] = find(b); }
    function compatible(A, B) {
      if (A.family !== B.family) return false;
      let overlap = 0, workOverlap = 0, match = 0;
      for (let d = 1; d <= 31; d++) {
        const a = A.dn[d], b = B.dn[d];
        if (!a || !b || a === "ABS" || b === "ABS") continue;
        overlap++;
        if (a !== "REST" && b !== "REST") workOverlap++;
        if (a === b) match++;
      }
      return overlap >= minOverlap && workOverlap >= minWorkOverlap && match === overlap;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let k = i + 1; k < nodes.length; k++) {
        if (find(i) === find(k)) continue;
        if (compatible(nodes[i], nodes[k])) union(i, k);
      }
    }

    // 3) Regroupe les clusters → équipes
    const clusters = new Map();
    for (let i = 0; i < nodes.length; i++) {
      const r = find(i);
      if (!clusters.has(r)) clusters.set(r, []);
      clusters.get(r).push(nodes[i]);
    }
    let teamIdx = 1;
    const teamsArr = [];
    for (const [, members] of clusters) {
      if (members.length < minTeamSize) {
        for (const n of members) out.unassigned.push({ fullName: n.emp.fullName, reason: "cluster trop petit (" + members.length + " <" + minTeamSize + ")" });
        continue;
      }
      // Référence = membre le plus complet (max jours présents) → repos + rotation
      const ref = members.slice().sort((a, b) => (b.work + b.rest) - (a.work + a.rest))[0];
      const rhDays = Object.keys(ref.dn).filter(d => ref.dn[d] === "REST").map(Number).sort((a, b) => a - b);
      teamsArr.push({
        id: "t" + (teamIdx++),
        family: ref.family,
        members: members.map(n => ({ fullName: n.emp.fullName })),
        rhDays: rhDays,
        signature_rh: rhDays.slice(),
        daySig: ref.dn,                       // rotation de référence (pour miroir)
        firstWorkCodeNorm: getFirstWorkCode(ref.emp.days) ? normalizeWorkCodeForClustering(getFirstWorkCode(ref.emp.days)) : null
      });
    }
    out.teams = teamsArr;

    // 4) Miroirs : 2 équipes même famille, MÊMES repos, rotations DIFFÉRENTES
    //    (l'union-find les a séparées car codes journaliers ≠).
    const used = new Set();
    for (let i = 0; i < teamsArr.length; i++) {
      if (used.has(teamsArr[i].id)) continue;
      for (let k = i + 1; k < teamsArr.length; k++) {
        if (used.has(teamsArr[k].id)) continue;
        const A = teamsArr[i], B = teamsArr[k];
        if (A.family !== B.family) continue;
        if (!rhEqual(A.rhDays, B.rhDays)) continue;
        let common = 0, diff = false;
        for (let d = 1; d <= 31; d++) {
          const a = A.daySig[d], b = B.daySig[d];
          if (!a || !b || a === "ABS" || b === "ABS" || a === "REST" || b === "REST") continue;
          common++; if (a !== b) diff = true;
        }
        if (common >= 3 && diff) {
          out.mirrors.push({
            teamId: A.id, mirrorTeamId: B.id, rhDays: A.rhDays.slice(),
            reason: "MÊMES repos [" + A.rhDays.join(",") + "] + rotations horaires différentes"
          });
          used.add(A.id); used.add(B.id);
          break;
        }
      }
    }

    if (teamsArr.length === 0 && employees.length > 0) {
      out.warnings.push("Aucune équipe détectée — vérifier la qualité de l'extraction des codes journaliers");
    }

    return out;
  }

  /** Helper utilitaire pour les tests : produit une signature lisible humaine. */
  function describeTeam(team) {
    return `${team.id} (${team.family || "?"}) — RH:[${team.rhDays.join(",")}] base:${team.firstWorkCodeNorm} — ${team.members.length} emps`;
  }

  return {
    detectTeams,
    getRestSignature,
    getFirstWorkCode,
    getExtendedSignature,
    normalizeWorkCodeForClustering,
    rhEqual,
    rhMirrorOffset,  // deprecated, gardé pour tests legacy
    isMirrorPair,
    isRestCode,
    describeTeam,
    VERSION: "T1-teams-v0.3.0-family-rhgroup-mirror"
  };
}));
