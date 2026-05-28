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
  function detectTeams(employees, opts) {
    opts = opts || {};
    const minCellsForSignature = opts.minCellsForSignature || 20;
    const minTeamSize = opts.minTeamSize !== undefined ? opts.minTeamSize : 2;
    const skipFamilies = new Set(opts.skipFamilies || ["cadres"]);

    const out = { ok: true, teams: [], mirrors: [], unassigned: [], warnings: [] };

    // 1) Filter et calcule signatures
    const sigs = [];
    for (const emp of employees) {
      if (!emp || !emp.fullName) continue;
      if (emp.family && skipFamilies.has(emp.family)) {
        out.unassigned.push({ fullName: emp.fullName, reason: "family=" + emp.family + " (skip — pas d'équipe)" });
        continue;
      }
      const totalCells = emp.days ? Object.keys(emp.days).length : 0;
      if (totalCells < minCellsForSignature) {
        out.unassigned.push({ fullName: emp.fullName, reason: "<" + minCellsForSignature + " cellules (" + totalCells + ")" });
        continue;
      }
      const ext = getExtendedSignature(emp.days);
      if (ext.rhDays.length === 0) {
        out.unassigned.push({ fullName: emp.fullName, reason: "0 jours RH/R (statut intégral ?)" });
        continue;
      }
      sigs.push({
        emp: emp,
        rhDays: ext.rhDays,
        firstWorkCode: ext.firstWorkCode,
        firstWorkCodeNorm: ext.firstWorkCodeNorm,
        cycleHint: ext.cycleHint
      });
    }

    // 2) GROUPE PRIMAIRE = FAMILLE + jours de repos IDENTIQUES.
    //    Kevin 2026-05-28 : « les équipes sont triées par famille ; dans une
    //    famille, le groupe qui a les mêmes repos forme l'équipe principale,
    //    puis plus bas le groupe qui a les MÊMES repos est son équipe miroir ».
    //    Donc un groupe de repos (famille+RH) = équipe principale + son miroir.
    const rhGroups = new Map(); // famille::RH → sigs[]
    for (const s of sigs) {
      const key = (s.emp.family || "?") + "::" + JSON.stringify(s.rhDays);
      if (!rhGroups.has(key)) rhGroups.set(key, []);
      rhGroups.get(key).push(s);
    }

    // 3) Dans chaque groupe de repos : partition par HORAIRE DE BASE.
    //    - équipe PRINCIPALE = sous-groupe (horaire) le plus nombreux
    //    - MIROIR = autre sous-groupe d'AU MOINS 2 membres (un miroir est un
    //      GROUPE, pas 1 personne — Kevin)
    //    - sous-groupe d'1 personne (horaire isolé) = bruit du « premier code
    //      travail » → REPLIÉ dans la principale (mêmes repos = même équipe)
    let teamIdx = 1;
    const teamsArr = [];
    for (const [rhKey, group] of rhGroups) {
      if (group.length < minTeamSize) {
        for (const s of group) out.unassigned.push({ fullName: s.emp.fullName, reason: "repos unique (" + group.length + " <" + minTeamSize + ")" });
        continue;
      }
      const sep = rhKey.indexOf("::");
      const famStr = rhKey.substring(0, sep);
      const family = famStr && famStr !== "?" ? famStr : null;
      const rhDays = JSON.parse(rhKey.substring(sep + 2));

      // partition par horaire de base
      const byBase = new Map();
      for (const s of group) {
        const b = s.firstWorkCodeNorm || "?";
        if (!byBase.has(b)) byBase.set(b, []);
        byBase.get(b).push(s);
      }
      const subs = Array.from(byBase.values()).sort((a, b) => b.length - a.length);
      const main = subs[0].slice();
      const mirrors = [];
      for (let k = 1; k < subs.length; k++) {
        if (subs[k].length >= 2) mirrors.push(subs[k]);   // vrai miroir (groupe)
        else for (const s of subs[k]) main.push(s);        // solo = bruit → replie
      }
      const mkTeam = (members) => {
        const t = {
          id: "t" + (teamIdx++),
          signature_rh: rhDays.slice(),
          firstWorkCode: members[0].firstWorkCode,
          firstWorkCodeNorm: members[0].firstWorkCodeNorm,
          family,
          members: members.map(s => ({ fullName: s.emp.fullName })),
          rhDays: rhDays.slice(),
          cycleHint: members[0].cycleHint
        };
        teamsArr.push(t);
        return t;
      };
      const mainTeam = mkTeam(main);
      for (const mir of mirrors) {
        const mirTeam = mkTeam(mir);
        out.mirrors.push({
          teamId: mainTeam.id,
          mirrorTeamId: mirTeam.id,
          rhDays: rhDays.slice(),
          reason: "MÊMES jours RH/R [" + rhDays.join(",") + "] + horaires base différents (" +
                  mainTeam.firstWorkCodeNorm + " ≠ " + mirTeam.firstWorkCodeNorm + ")"
        });
      }
    }
    out.teams = teamsArr;

    if (teamsArr.length === 0 && employees.length > 0) {
      out.warnings.push("Aucune équipe détectée — vérifier les signatures RH / la qualité de l'extraction");
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
