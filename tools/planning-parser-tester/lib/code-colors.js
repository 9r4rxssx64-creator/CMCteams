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

  /* Couleurs + DÉNOMINATION OFFICIELLE des codes statut (43 codes).
   * Libellés conformes Convention SBM Note 6 janvier 1993 (Bernard Lées) —
   * source : index.html racine BULLETIN_CODES. Le label s'affiche au survol
   * du comparateur visuel (Kevin « aide-toi de la Convention pour la
   * dénomination des jours »). */
  const STATUT_COLORS = {
    /* Présence / Repos */
    "P":   { bg: "#e8f0e8", fg: "#202020", label: "Jour de Présence" },
    "RH":  { bg: "#c8a8e0", fg: "#2a0870", label: "Repos Hebdomadaire" },
    "R":   { bg: "#e8e8e8", fg: "#202020", label: "Repos simple" },
    "RTP": { bg: "#ffd060", fg: "#5a3808", label: "Repos Travaillé à Payer" },
    "RTR": { bg: "#ffd060", fg: "#5a3808", label: "Repos Travaillé à Récupérer (+ compteur)" },
    "RRT": { bg: "#ffd850", fg: "#5a3808", label: "Récupération Repos Travaillé (- compteur)" },
    "RHS": { bg: "#ffd850", fg: "#5a3808", label: "Récupération Heures Supplémentaires" },
    "DP":  { bg: "#e0e0e8", fg: "#202020", label: "Jour de Disposition" },
    /* Congés */
    "CP":  { bg: "#f8c0d0", fg: "#6a1028", label: "Jour ouvrable de Congé Payé" },
    "CRH": { bg: "#f0b8c8", fg: "#6a1028", label: "Repos Hebdo inclus dans Congé" },
    "CPS": { bg: "#f8c0d0", fg: "#6a1028", label: "Congé Payé Samedi (5e pour 5 sem)" },
    "CPM": { bg: "#f8c0d0", fg: "#6a1028", label: "1er jour Période Congé (droit fractionnement)" },
    "CDP": { bg: "#f0b8c8", fg: "#6a1028", label: "Jour Congé Déjà Payé" },
    "CDH": { bg: "#f0b8c8", fg: "#6a1028", label: "Repos Hebdo inclus dans Congés Déjà Payés" },
    /* Fêtes légales */
    "FL":  { bg: "#a8e0a8", fg: "#0c3a0c", label: "Fête Légale chômée et payée" },
    "CFL": { bg: "#a8c0a8", fg: "#0c3a0c", label: "Fête Légale incluse dans Congé Payé" },
    "FTP": { bg: "#80e080", fg: "#0c3a0c", label: "Fête Légale Travaillée à Payer" },
    "FTR": { bg: "#80e080", fg: "#0c3a0c", label: "Fête Légale Travaillée à Récupérer (+ compteur)" },
    "RFT": { bg: "#a0d0a0", fg: "#0c3a0c", label: "Récupération Fête Travaillée (- compteur)" },
    /* À la masse */
    "FCP": { bg: "#f0b8c0", fg: "#6a1028", label: "Idem CP (employé à la masse)" },
    "FCS": { bg: "#f0b8c0", fg: "#6a1028", label: "Idem CPS (employé à la masse)" },
    "FRH": { bg: "#c8a8d8", fg: "#2a0870", label: "Idem CRH (employé à la masse)" },
    "FFL": { bg: "#a8c0a8", fg: "#0c3a0c", label: "Idem CFL (employé à la masse)" },
    /* Absences */
    "M":   { bg: "#ffe840", fg: "#4a3808", label: "Absence Maladie (indemnisée ou non)" },
    "MAL": { bg: "#ffe840", fg: "#4a3808", label: "Maladie longue durée" },
    "AT":  { bg: "#ffc850", fg: "#5a2808", label: "Accident du Travail ou Trajet" },
    "MT":  { bg: "#ffe080", fg: "#5a3808", label: "Congé Maternité" },
    "ABS": { bg: "#e8c8b0", fg: "#4a2808", label: "Absence tolérée non payée" },
    "ABI": { bg: "#e88080", fg: "#5a0808", label: "Absence Injustifiée (sanction possible)" },
    "ABP": { bg: "#e8c8b0", fg: "#4a2808", label: "Absence autorisée exceptionnellement payée" },
    "AF":  { bg: "#a8e0a8", fg: "#0c3a0c", label: "Absence Rémunérée Formation (= Présence)" },
    "CL":  { bg: "#c8e8c8", fg: "#0c3a0c", label: "Congé Légal événement familial (Art. 18)" },
    "CEO": { bg: "#c8e8c8", fg: "#0c3a0c", label: "Congé d'Éducation Ouvrière" },
    "CSC": { bg: "#c8e8c8", fg: "#0c3a0c", label: "Congé Supplémentaire Cadre" },
    "CSS": { bg: "#d0d0d0", fg: "#202020", label: "Congé Sans Solde" },
    /* Sanctions (rouge alerte) */
    "PNE": { bg: "#e85050", fg: "#ffffff", label: "Préavis non Exécuté" },
    "AMP": { bg: "#e85050", fg: "#ffffff", label: "Mise à Pied non rémunérée" },
    "MPC": { bg: "#e85050", fg: "#ffffff", label: "Mise à Pied Conservatoire (attente décision)" },
    "MPP": { bg: "#e8a050", fg: "#ffffff", label: "Mise à Pied Payée" },
    /* Autres */
    "PAT": { bg: "#b8e0f0", fg: "#0c3a58", label: "Paternité" },
    "PRT": { bg: "#ffd060", fg: "#5a3808", label: "Prêt (mis à disposition autre service)" },
    "HC":  { bg: "#d8e8a8", fg: "#2e3a10", label: "Heures Complémentaires" },
    "EDC": { bg: "#e0d0f0", fg: "#4a2080", label: "En Détachement Cadre" },
    /* Pit Boss spécifiques */
    "HD":  { bg: "#e85050", fg: "#ffffff", label: "Hors Département / Jour férié spécial" },
    "PK":  { bg: "#ffd0e0", fg: "#a82858", label: "Poker Cash Game" }
  };

  /* Couleurs des LIEUX SBM (badge / liseré cellule). Distinctes des couleurs
   * d'horaire (qui colorent le fond de la cellule) — le lieu se montre en
   * liseré + légende. Kevin 2026-05-28 « les couleurs aussi des lieux ». */
  const LIEU_COLORS = {
    "CMC":            { c: "#3a86ff", label: "Casino Monte-Carlo" },
    "CCDP":           { c: "#ff7a18", label: "Café de Paris" },
    "CDP":            { c: "#ff7a18", label: "Café de Paris" },
    "CCDP+CMC":       { c: "#ff7a18", label: "Café de Paris + CMC" },
    "SUN":            { c: "#ffd23f", label: "Sun Casino" },
    "MCB":            { c: "#06d6a0", label: "Monte-Carlo Bay" },
    "POKER NO LIMIT": { c: "#e84a8a", label: "Poker No Limit" },
    "PNL":            { c: "#e84a8a", label: "Poker No Limit" },
    "HD":             { c: "#9b5de5", label: "Hors Département" }
  };

  /** Couleur d'un lieu (pour liseré/badge). Retourne {c, label} ou null. */
  function getLieuColor(lieu) {
    if (!lieu) return null;
    const key = String(lieu).toUpperCase().trim();
    return LIEU_COLORS[key] || null;
  }

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
    getLieuColor,
    normalizeQuotes,
    HORAIRES_BASE,
    STATUT_COLORS,
    CONVENTION_COLOR,
    CCDP_COLOR,
    CCDP_VIVID,
    LIEU_COLORS,
    VERSION: "T1-colors-v0.2.0-lieux"
  };
}));
