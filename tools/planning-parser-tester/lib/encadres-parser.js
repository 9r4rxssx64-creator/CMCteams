/**
 * encadres-parser.js — Parse les encadrés « N STATUT du J1 au J2 » du PDF SBM.
 *
 * RÔLE : reconnaître les statuts INTÉGRAUX (CP / AF / M / MAL / MT / PAT /
 * EDC / SS / ABI / AT / CFL / CRH / ABS) qui s'appliquent à plusieurs employés
 * sur une période (parfois mois entier, parfois sous-période 4-8 mai).
 *
 * RÈGLE ABSOLUE (Kevin, CLAUDE.md erreur #49) :
 *   - JAMAIS chercher mots français longs (FORMATION/MALADIE) → cherche les
 *     codes COURTS officiels SBM uniquement.
 *   - Préserver caractère par caractère la donnée trouvée.
 *   - Si emp dans 2 encadrés (CP intégral + AF 4-8) → priorité :
 *     CP par défaut, AF surcharge sur les dates spécifiques.
 *
 * FORMAT PDF attendu (vérité terrain mai 2026 V2 confirmée Kevin 2026-05-19) :
 *   « 13 FORMATION du au »  (followed by lines of names FILIPPI F, LAVAGNA J, ...)
 *   « 2 CP du au »
 *   « 8 CP du au »
 *   « 7 M du au »
 *   « 1 M du au »
 *   « 4 M du au »
 *   « EDC du au »
 *
 * Périodes acceptées : 1-31 (mois entier), 1-15, 16-31, 4-8 (sous-période courte),
 *   tout fromDay/toDay avec 1 ≤ from ≤ to ≤ daysInMonth.
 *
 * SORTIE :
 *   {
 *     ok: true,
 *     boxes: [
 *       { count, code, from, to, family?, names: [{ surname, initials, fullName }] },
 *       ...
 *     ],
 *     warnings: []   // si parsing partiel, periode invalide, etc.
 *   }
 */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.EncadresParser = factory();
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* Codes statuts officiels SBM (CLAUDE.md erreur #49 — codes courts uniquement).
   * Ordre = priorité de détection (les codes plus longs d'abord pour ne pas
   * que `M` match dans `MAL`). */
  const STATUT_CODES_LONG_FIRST = [
    "MAL", "PAT", "ABS", "ABI", "EDC", "CFL", "CRH",
    "CP", "AF", "AT", "MT", "SS", "M"
  ];

  /* Mots-clés long (FORMATION/MALADIE/etc.) acceptés UNIQUEMENT comme alias
   * d'un code court — ne JAMAIS les utiliser comme source primaire. */
  const ALIAS_LONG_TO_SHORT = {
    "FORMATION":   "AF",
    "MALADIE":     "M",
    "MATERNITE":   "MT",
    "MATERNITÉ":   "MT",
    "PATERNITE":   "PAT",
    "PATERNITÉ":   "PAT",
    "CONGE":       "CP",
    "CONGÉ":       "CP",
    "ABSENCE":     "ABS"
  };

  /* Familles déduites depuis le contexte de la section où apparaît l'encadré.
   * NOTES_USER : « encadré "13 FORMATION du au" section Chefs BJ ». */
  const SECTION_HINTS = [
    { re: /CHEF[S]?\s+BJ|BLACK\s*JACK|Chefs?\s+cartes\s+am[ée]ricaines/i, family: "bj" },
    { re: /ROULETTES?|Jeux?\s+europ[ée]ens?|Chefs?\s+roul/i, family: "roulettes" },
    { re: /Employ[ée]s?\s+CMC|Cartes?\s+CMC/i, family: "cmc" },
    { re: /AM[ÉE]NAGEMENT|Horaires?\s+am[ée]nag/i, family: "amenage" },
    { re: /PIT\s*BOSS|SUPERVISEUR|INSPECTEUR/i, family: "cadres" }
  ];

  /* Regex headers d'encadrés.
   * Captures: (count?, code, from, to)
   * Variations rencontrées :
   *   « 13 FORMATION du au »         → count=13, alias FORMATION→AF, from/to absents = mois entier
   *   « 2 CP du 1 au 31 »            → count=2, code=CP, from=1, to=31
   *   « 3 FORMATION du 4 au 8 »      → count=3, AF, from=4, to=8
   *   « EDC du au »                  → count manquant, code=EDC, période absente
   *   « 7 M du au »                  → count=7, code=M, période = mois entier (par défaut)
   */
  const HEADER_RE = /(?:(\d{1,3})\s+)?(\b(?:FORMATION|MALADIE|MATERNIT[ÉE]|PATERNIT[ÉE]|CONG[ÉE]|ABSENCE|MAL|PAT|ABS|ABI|EDC|CFL|CRH|CP|AF|AT|MT|SS|M)\b)\s+du\s*(?:(\d{1,2})\s+au\s+(\d{1,2}))?\b/gi;

  /* Détecte si une ligne est juste un nom (ou plusieurs noms séparés).
   * Format : « NOM Initiale » ou « NOM1 NOM2 Initiale ». */
  const NAME_LINE_RE = /\b([A-ZÉÈÀÊÂÔÛÄËÏÖÜÇ][A-ZÉÈÀÊÂÔÛÄËÏÖÜÇ'\-]{1,30})(?:\s+([A-ZÉÈÀÊÂÔÛÄËÏÖÜÇ][A-ZÉÈÀÊÂÔÛÄËÏÖÜÇ'\-]{1,30}))?\s+([A-Z]{1,3})\.?\b/g;

  /* Faux positifs ligne de noms (codes / mots PDF qu'on ne veut pas matcher). */
  const NAME_EXCLUDE = new Set([
    "RH", "CP", "AF", "M", "MAL", "MT", "ABS", "EDC", "CMC", "CDP", "CCDP", "MCB",
    "PIT", "BOSS", "SUPERVISEUR", "INSPECTEUR", "POKER", "NO", "LIMIT", "DU", "AU",
    "FORMATION", "MALADIE", "MATERNITE", "PATERNITE", "CONGE", "ABSENCE",
    "BJ", "ROULETTES", "BLACKJACK", "AMENAGEMENT", "AMÉNAGEMENT", "PNL",
    "POSTE", "NOM", "ÉQUIPE", "EQUIPE", "TOTAL", "JOURS", "REPOS",
    "AVRIL", "MAI", "JUIN", "JUILLET", "AOUT", "AOÛT", "SEPTEMBRE", "OCTOBRE",
    "NOVEMBRE", "DECEMBRE", "JANVIER", "FEVRIER", "FÉVRIER", "MARS"
  ]);

  /** Résout un alias long en code court SBM, ou retourne tel quel si déjà court. */
  function resolveCode(raw) {
    if (!raw) return null;
    const u = String(raw).toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (ALIAS_LONG_TO_SHORT[u]) return ALIAS_LONG_TO_SHORT[u];
    if (STATUT_CODES_LONG_FIRST.indexOf(u) >= 0) return u;
    return u;
  }

  /** Devine la famille (bj/roulettes/cmc/amenage/cadres) à partir d'un contexte
   *  textuel précédent l'encadré. Retourne null si pas de hint clair. */
  function guessFamily(contextBefore) {
    if (!contextBefore) return null;
    for (const hint of SECTION_HINTS) {
      if (hint.re.test(contextBefore)) return hint.family;
    }
    return null;
  }

  /** Extrait les noms d'une bande de texte (lignes qui suivent un encadré). */
  function extractNames(text, maxNames) {
    if (!text) return [];
    const names = [];
    const seen = new Set();
    NAME_LINE_RE.lastIndex = 0;
    let m;
    while ((m = NAME_LINE_RE.exec(text))) {
      const t1 = m[1] ? m[1].trim() : "";
      const t2 = m[2] ? m[2].trim() : "";
      const init = m[3] ? m[3].trim() : "";
      if (NAME_EXCLUDE.has(t1) || (t2 && NAME_EXCLUDE.has(t2))) continue;
      const surname = t2 ? (t1 + " " + t2) : t1;
      const fullName = surname + " " + init;
      if (seen.has(fullName)) continue;
      seen.add(fullName);
      names.push({ surname, initials: init, fullName });
      if (maxNames && names.length >= maxNames) break;
    }
    return names;
  }

  /** Parser principal. Reçoit le rawText du PDF + le nombre de jours du mois
   *  (pour expanser les périodes « 1-31 » par défaut). Retourne la liste
   *  des encadrés détectés. */
  function parseEncadres(rawText, daysInMonth) {
    const out = { ok: true, boxes: [], warnings: [] };
    if (!rawText) {
      out.ok = false;
      out.warnings.push("rawText vide");
      return out;
    }
    daysInMonth = daysInMonth || 31;

    HEADER_RE.lastIndex = 0;
    let m;
    while ((m = HEADER_RE.exec(rawText))) {
      const countStr = m[1] || "";
      const rawCode = m[2];
      const fromStr = m[3] || "";
      const toStr = m[4] || "";

      const code = resolveCode(rawCode);
      if (!code) {
        out.warnings.push("Code statut non résolu : " + rawCode);
        continue;
      }
      const count = countStr ? parseInt(countStr, 10) : null;
      let from = fromStr ? parseInt(fromStr, 10) : 1;
      let to = toStr ? parseInt(toStr, 10) : daysInMonth;
      // Périodes invalides → flag warning
      if (from < 1 || to > daysInMonth || from > to) {
        out.warnings.push(`Période invalide pour ${code} : ${from}-${to} (daysInMonth=${daysInMonth})`);
        from = Math.max(1, Math.min(from, daysInMonth));
        to = Math.max(from, Math.min(to, daysInMonth));
      }

      // Contexte AVANT l'encadré pour deviner la famille
      const ctxStart = Math.max(0, m.index - 300);
      const contextBefore = rawText.slice(ctxStart, m.index);
      const family = guessFamily(contextBefore);

      // Noms qui SUIVENT l'encadré — extraits sur la bande après le header
      // (200 chars × max count attendu, ou 1500 chars par défaut).
      const expectedNames = count || 12;
      const afterStart = m.index + m[0].length;
      const afterLen = Math.min(rawText.length - afterStart, 200 * expectedNames + 600);
      const after = rawText.slice(afterStart, afterStart + afterLen);
      const names = extractNames(after, expectedNames);

      out.boxes.push({
        count: count,
        names_found: names.length,
        code: code,
        from: from,
        to: to,
        days_count: to - from + 1,
        family: family,
        names: names,
        raw_header: m[0]
      });
    }

    return out;
  }

  /** Construit une map { fullName: { day: code } } à partir des encadrés
   *  détectés. Applique la priorité Kevin (CP intégral + AF 4-8 → AF surcharge
   *  sur 4-8). */
  function expandBoxesToCells(boxes, daysInMonth) {
    daysInMonth = daysInMonth || 31;
    const map = {};
    // 1ère passe : on pose le code de chaque encadré sur sa période,
    // en respectant l'ordre d'apparition (les périodes plus courtes après
    // surchargent les plus longues — comportement attendu par Kevin).
    for (const box of boxes) {
      for (const n of box.names) {
        if (!map[n.fullName]) map[n.fullName] = {};
        for (let d = box.from; d <= box.to; d++) {
          map[n.fullName][String(d)] = box.code;
        }
      }
    }
    return map;
  }

  return {
    parseEncadres,
    expandBoxesToCells,
    resolveCode,
    guessFamily,
    extractNames,
    STATUT_CODES_LONG_FIRST,
    ALIAS_LONG_TO_SHORT,
    VERSION: "T1-encadres-v0.1.0"
  };
}));
