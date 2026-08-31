/*
 * cell-voting.js — Vote 4/4 unanime cellule par cellule
 *
 * RÈGLE ABSOLUE Kevin :
 *   - 4/4 d'accord (toutes passes lisent la même chose) → cellule CERTAINE
 *   - Toute divergence ≠ 4/4 → cellule NEEDS_REVIEW (Kevin tranche manuellement)
 *   - JAMAIS de vote majoritaire 2/3 ou 3/4 qui écrirait automatiquement
 *   - JAMAIS de fallback historique ou de devinette
 *
 * Input : array de passes (de visionPasses.runAllVisionPasses) + passe A (PDF.js parsé)
 * Output : { cells_certain, cells_needs_review, stats }
 */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.CellVoting = factory();
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function normalizeName(s) {
    if (!s) return "";
    return String(s).trim().toUpperCase().replace(/\s+/g, " ");
  }

  function normalizeCellToken(v) {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    if (!s || s === "-" || s === "—" || s.toLowerCase() === "null") return null;
    return s;
  }

  /**
   * Reconstruit une map { empName → { day → token } } depuis le résultat d'une passe.
   */
  function passeToMap(passe) {
    const map = {};
    if (!passe || !Array.isArray(passe.employees)) return map;
    for (const emp of passe.employees) {
      if (!emp || !emp.name) continue;
      const key = normalizeName(emp.name);
      if (!key) continue;
      if (!map[key]) map[key] = {};
      const days = emp.days || {};
      for (const d of Object.keys(days)) {
        const dn = parseInt(d, 10);
        if (!Number.isFinite(dn) || dn < 1 || dn > 31) continue;
        map[key][dn] = normalizeCellToken(days[d]);
      }
    }
    return map;
  }

  /**
   * Vote : pour chaque (emp, day) présent dans AU MOINS UNE passe,
   *  - si toutes les passes qui ont lu cette cellule retournent EXACTEMENT le même token
   *    ET qu'au moins N_MIN passes ont lu la cellule → CERTAIN.
   *  - sinon → needs_review avec toutes les lectures pour décision Kevin.
   */
  function voteCells(passes, opts) {
    opts = opts || {};
    const N_MIN = opts.minAgreeingPasses || 4; // 4/4 par défaut
    const maps = passes.map(passeToMap);

    // Union des noms
    const allNames = new Set();
    for (const m of maps) for (const n of Object.keys(m)) allNames.add(n);

    const cells_certain = {};
    const cells_needs_review = {};
    const stats = {
      total_cells: 0,
      certain: 0,
      needs_review: 0,
      missing_reads: 0,
      per_passe: passes.map(p => ({ tool: p.tool, ok: p.ok, cells_read: 0 }))
    };

    for (const name of allNames) {
      // Union des jours
      const allDays = new Set();
      maps.forEach(m => {
        if (m[name]) Object.keys(m[name]).forEach(d => allDays.add(parseInt(d, 10)));
      });
      for (const day of allDays) {
        stats.total_cells++;
        const reads = maps.map((m, idx) => {
          const present = m[name] && Object.prototype.hasOwnProperty.call(m[name], day);
          if (present) stats.per_passe[idx].cells_read++;
          return present ? m[name][day] : undefined;
        });
        // Filtre les passes qui ont effectivement lu cette cellule (undefined = pas lue)
        const readsPresent = reads.filter(r => r !== undefined);
        if (readsPresent.length < N_MIN) {
          // Pas assez de passes ont lu la cellule → needs_review
          stats.missing_reads++;
          stats.needs_review++;
          if (!cells_needs_review[name]) cells_needs_review[name] = {};
          cells_needs_review[name][day] = {
            reason: "missing_reads",
            count_present: readsPresent.length,
            min_required: N_MIN,
            reads: passes.map((p, i) => ({ tool: p.tool, value: reads[i] }))
          };
          continue;
        }
        // Vérifie unanimité STRICTE des passes présentes
        const first = readsPresent[0];
        const unanime = readsPresent.every(r => r === first);
        if (unanime) {
          stats.certain++;
          if (!cells_certain[name]) cells_certain[name] = {};
          cells_certain[name][day] = first;
        } else {
          stats.needs_review++;
          if (!cells_needs_review[name]) cells_needs_review[name] = {};
          cells_needs_review[name][day] = {
            reason: "divergence",
            reads: passes.map((p, i) => ({ tool: p.tool, value: reads[i] }))
          };
        }
      }
    }

    return { cells_certain, cells_needs_review, stats };
  }

  /**
   * Génère un résumé Markdown pour affichage UI.
   */
  function summarizeVote(vote) {
    const lines = [];
    lines.push(`📊 Total cellules examinées : ${vote.stats.total_cells}`);
    lines.push(`✅ Certaines (unanime) : ${vote.stats.certain}`);
    lines.push(`🟡 needs_review : ${vote.stats.needs_review}`);
    lines.push(`⚠️  Lectures manquantes : ${vote.stats.missing_reads}`);
    lines.push("");
    lines.push("Lectures par passe :");
    vote.stats.per_passe.forEach(p => {
      lines.push(`  • ${p.tool} : ${p.cells_read} cellules lues (ok=${p.ok})`);
    });
    return lines.join("\n");
  }

  return { voteCells, passeToMap, normalizeName, normalizeCellToken, summarizeVote, VERSION: "T1-vote-v0.1.0" };
}));
