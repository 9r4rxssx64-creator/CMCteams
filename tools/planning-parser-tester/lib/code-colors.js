/**
 * code-colors.js — Mapping CODE → couleur (fond + texte) cellule planning.
 *
 * Sources :
 *   - NOTES_USER « Couleurs CODES (v9.105 — affinées à partir PDF SBM) » lignes 1393+
 *   - NOTES_USER « Couleurs du PDF original SBM (v9.103) » lignes 1045+
 *   - NOTES_USER « Nomenclature visuelle codes horaires SBM Mai V2 » lignes 215+
 *
 * RÈGLE Kevin : ces couleurs PROJETTENT le rendu attendu — elles ne
 * MODIFIENT JAMAIS la cellule source. La cellule reste le code observé
 * caractère par caractère. C'est juste une couche d'affichage UI.
 *
 * Convention de suffixes (priorité décroissante) :
 *   - Suffixe `'` ou `"` ou `"'` → CONVENTION (rouge fond / jaune texte)
 *   - Suffixe `*` → CCDP+CMC (orange)
 *   - Suffixe `CDP` ou `c` ou `:` → préserve la couleur de base
 *   - Code statut (RH/R/CP/...) → couleur dédiée
 *   - Code horaire pur (22/6, 19/4, etc.) → couleur par base
 */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.CodeColors = factory();
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* Couleurs Convention (suffixe ' ou " — jours rajoutés direction). */
  const CONVENTION_COLOR = { bg: "#d8342e", fg: "#ffe23a", label: "Convention" };

  /* Couleurs CCDP (suffixe *). */
  const CCDP_COLOR = { bg: "#ffe4d0", fg: "#804418", label: "CCDP + CMC" };
  const CCDP_VIVID = { bg: "#ffb480", fg: "#a84018", label: "CCDP (variante vive)" };

  /* Couleurs des horaires de base CMC (NOTES_USER ligne 1052+). */
  const HORAIRES_BASE = {
    "22/6":  { bg: "#fccfe0", fg: "#a82858", label: "22h-6h CMC" },
    "19/4":  { bg: "#fff4a0", fg: "#6a5410", label: "19h-4h CMC" },
    "16/3":  { bg: "#ffc890", fg: "#8a4a10", label: "16h-3h CMC (coupure)" },
    "14/19": { bg: "#c4e8a8", fg: "#3a6a18", label: "14h-19h CMC" },
    "20/5":  { bg: "#b8d4f0", fg: "#1a5090", label: "20h-5h CMC" },
    "16/22": { bg: "#d4c4ec", fg: "#5838a0", label: "16h-22h CMC" },
    "16/20": { bg: "#d4c4ec", fg: "#5838a0", label: "16h-20h CMC" },
    "15/19": { bg: "#fff4a0", fg: "#6a5410", label: "15h-19h CCDP (Pit Boss)" },
    "19/2":  { bg: "#fff4a0", fg: "#6a5410", label: "19h-2h CMC (Pit Boss)" },
    "15/20": { bg: "#ffd0e0", fg: "#a82858", label: "15h-20h POKER NO LIMIT" },
    "12h30/19": { bg: "#fff4a0", fg: "#6a5410", label: "12h30-19h CMC" }
  };

  /* Couleurs des codes statut (43 codes Note 6 janv 1993). */
  const STATUT_COLORS = {
    /* Présence / Repos */
    "P":   { bg: "#e8f0e8", fg: "#202020", label: "Présence" },
    "RH":  { bg: "#c8a8e0", fg: "#2a0870", label: "Repos hebdo" },
    "R":   { bg: "#e8e8e8", fg: "#202020", label: "Repos" },
    "RTP": { bg: "#ffd060", fg: "#5a3808", label: "Repos travaillé à payer" },
    "RTR": { bg: "#ffd060", fg: "#5a3808", label: "Repos travaillé à récupérer" },
    "RRT": { bg: "#ffd850", fg: "#5a3808", label: "Récup repos travaillé" },
    "RHS": { bg: "#ffd850", fg: "#5a3808", label: "Récup heures sup" },
    "DP":  { bg: "#e0e0e8", fg: "#202020", label: "Disposition" },
    /* Congés */
    "CP":  { bg: "#f8c0d0", fg: "#6a1028", label: "Congé payé" },
    "CRH": { bg: "#f0b8c8", fg: "#6a1028", label: "Repos hebdo dans congé" },
    "CPS": { bg: "#f8c0d0", fg: "#6a1028", label: "Congé payé samedi" },
    "CPM": { bg: "#f8c0d0", fg: "#6a1028", label: "1er jour congé (fractionnement)" },
    "CDP": { bg: "#f0b8c8", fg: "#6a1028", label: "Congé déjà payé" },
    "CDH": { bg: "#f0b8c8", fg: "#6a1028", label: "Repos hebdo dans congé déjà payé" },
    /* Fêtes légales */
    "FL":  { bg: "#a8e0a8", fg: "#0c3a0c", label: "Fête légale chômée" },
    "CFL": { bg: "#a8c0a8", fg: "#0c3a0c", label: "Fête légale dans CP" },
    "FTP": { bg: "#80e080", fg: "#0c3a0c", label: "Fête travaillée à payer" },
    "FTR": { bg: "#80e080", fg: "#0c3a0c", label: "Fête travaillée à récupérer" },
    "RFT": { bg: "#a0d0a0", fg: "#0c3a0c", label: "Récup fête travaillée" },
    /* À la masse */
    "FCP": { bg: "#f0b8c0", fg: "#6a1028", label: "CP (masse)" },
    "FCS": { bg: "#f0b8c0", fg: "#6a1028", label: "CPS (masse)" },
    "FRH": { bg: "#c8a8d8", fg: "#2a0870", label: "CRH (masse)" },
    "FFL": { bg: "#a8c0a8", fg: "#0c3a0c", label: "CFL (masse)" },
    /* Absences */
    "M":   { bg: "#ffe840", fg: "#4a3808", label: "Maladie" },
    "MAL": { bg: "#ffe840", fg: "#4a3808", label: "Maladie longue" },
    "AT":  { bg: "#ffc850", fg: "#5a2808", label: "Accident travail" },
    "MT":  { bg: "#ffe080", fg: "#5a3808", label: "Maternité" },
    "ABS": { bg: "#e8c8b0", fg: "#4a2808", label: "Absence tolérée" },
    "ABI": { bg: "#e88080", fg: "#5a0808", label: "Absence injustifiée" },
    "ABP": { bg: "#e8c8b0", fg: "#4a2808", label: "Absence autorisée payée" },
    "AF":  { bg: "#a8e0a8", fg: "#0c3a0c", label: "Formation 9h15-17h45" },
    "CL":  { bg: "#c8e8c8", fg: "#0c3a0c", label: "Congé légal famille (Art. 18)" },
    "CEO": { bg: "#c8e8c8", fg: "#0c3a0c", label: "Congé éducation ouvrière" },
    "CSC": { bg: "#c8e8c8", fg: "#0c3a0c", label: "Congé supplémentaire cadre" },
    "CSS": { bg: "#d0d0d0", fg: "#202020", label: "Congé sans solde" },
    /* Sanctions (rouge alerte) */
    "PNE": { bg: "#e85050", fg: "#ffffff", label: "Préavis non exécuté" },
    "AMP": { bg: "#e85050", fg: "#ffffff", label: "Mise à pied non payée" },
    "MPC": { bg: "#e85050", fg: "#ffffff", label: "Mise à pied conservatoire" },
    "MPP": { bg: "#e8a050", fg: "#ffffff", label: "Mise à pied payée" },
    /* Autres */
    "PAT": { bg: "#b8e0f0", fg: "#0c3a58", label: "Paternité (v9.118)" },
    "PRT": { bg: "#ffd060", fg: "#5a3808", label: "Prêt (autre service)" },
    "HC":  { bg: "#d8e8a8", fg: "#2e3a10", label: "Heures complémentaires" },
    "EDC": { bg: "#e0d0f0", fg: "#4a2080", label: "En détachement cadre" },
    /* Pit Boss spécifiques */
    "HD":  { bg: "#e85050", fg: "#ffffff", label: "Hors département / férié" },
    "PK":  { bg: "#ffd0e0", fg: "#a82858", label: "Poker Cash Game" }
  };

  /** Normalise apostrophes courbes en droites. */
  function normalizeQuotes(s) {
    if (!s) return s;
    return String(s)
      .replace(/[“”]/g, '"')
      .replace(/[‘’ʼ]/g, "'");
  }

  /** Détermine la couleur d'une cellule à partir de son code.
   *  Retourne { bg, fg, label, isConvention?, isCcdp?, source }.
   *  Si code inconnu → { bg: null, fg: null, label: "?", source: "unknown" }.
   *
   *  Priorité (NOTES_USER « Nomenclature visuelle ») :
   *   1. Convention : code contient `'` ou `"` N'IMPORTE OÙ (ex `19/4'c`,
   *      `20/5""`, `22/6'c` chef+Convention) → rouge fond / jaune texte.
   *      Le `c` final (chef) ne doit PAS masquer le `'` (bug réel JUIN 2026).
   *   2. CCDP : suffixe `*` (sans quote) → orange.
   *   3. Code statut (RH/CP/M/...) → couleur dédiée.
   *   4. Code horaire base (+ suffixe `c` chef) → couleur par horaire. */
  function getCellColor(rawCode) {
    if (!rawCode) return { bg: null, fg: null, label: "vide", source: "empty" };
    const code = normalizeQuotes(String(rawCode).trim());

    // 1. Convention — `'` ou `"` PRÉSENT (où que ce soit après le code horaire).
    //    Les horaires de base (22/6, 19/4, 12h30/19) et les codes statut
    //    (RH/CP/M) ne contiennent jamais de quote → détection fiable.
    if (/['"]/.test(code)) {
      const r = Object.assign({}, CONVENTION_COLOR, { isConvention: true, source: "quote_convention", code });
      if (/c['"]*$/.test(code)) r.label = "Convention (chef)";
      return r;
    }

    // 2. CCDP (suffixe *)
    if (/\*/.test(code)) {
      return Object.assign({}, CCDP_COLOR, { isCcdp: true, source: "suffix_ccdp", code });
    }

    // 3. Standalone CDP
    if (/^CDP$/i.test(code)) {
      return Object.assign({}, CCDP_VIVID, { isCcdp: true, source: "standalone_cdp", code });
    }

    // 4. Code statut court (RH, CP, M, etc.) — match exact upper
    const upper = code.toUpperCase();
    if (STATUT_COLORS[upper]) {
      return Object.assign({}, STATUT_COLORS[upper], { source: "statut", code: upper });
    }

    // 5. Code horaire base : normaliser le suffixe c/CDP/H et lookup
    const lowH = code.replace(/H/g, "h");
    const normalized = lowH.replace(/[c:]+$/g, "").replace(/CDP$/i, "");
    if (HORAIRES_BASE[normalized]) {
      const result = Object.assign({}, HORAIRES_BASE[normalized], { source: "horaire_base", code: code });
      if (/c$/.test(code)) result.label += " (chef)";
      return result;
    }

    // 6. Inconnu — la cellule reste affichée (texte préservé), sans couleur.
    return { bg: null, fg: null, label: "?", source: "unknown", code };
  }

  /** Génère un style CSS inline depuis le retour de getCellColor.
   *  Anti-XSS : ne retourne que `background:` et `color:` hex valides. */
  function getCellStyle(rawCode) {
    const c = getCellColor(rawCode);
    if (!c.bg && !c.fg) return "";
    const styles = [];
    if (c.bg && /^#[0-9a-fA-F]{3,8}$/.test(c.bg)) styles.push(`background:${c.bg}`);
    if (c.fg && /^#[0-9a-fA-F]{3,8}$/.test(c.fg)) styles.push(`color:${c.fg}`);
    return styles.join(";");
  }

  return {
    getCellColor,
    getCellStyle,
    normalizeQuotes,
    HORAIRES_BASE,
    STATUT_COLORS,
    CONVENTION_COLOR,
    CCDP_COLOR,
    CCDP_VIVID,
    VERSION: "T1-colors-v0.1.0-43-codes"
  };
}));
