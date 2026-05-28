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

  /** Token pur code-poste (B/R/T/C/P/K/E + séparateurs, ≥2 lettres). */
  function isPosteToken(t) {
    const letters = String(t).replace(/[.+]/g, "");
    return letters.length >= 2 && /^[BRTPECK]+$/.test(letters);
  }

  /** Nettoie un nom pour l'AFFICHAGE (retire codes-poste tête/queue, garde la casse). */
  function cleanDisplayName(s) {
    let tokens = String(s || "").trim().split(/\s+/).filter(Boolean);
    while (tokens.length > 2 && isPosteToken(tokens[0])) tokens.shift();
    while (tokens.length > 2 && isPosteToken(tokens[tokens.length - 1])) tokens.pop();
    if (tokens.length === 2 && isPosteToken(tokens[0]) && !isPosteToken(tokens[1])) tokens = [tokens[1]];
    return tokens.join(" ");
  }

  /** Normalise un nom pour le matching encadré ↔ grille. Retire les codes-poste
   *  (≥2 lettres) en tête ET en queue (« BRTPE PORASSO C » ⇒ clé == « PORASSO C »
   *  pour matcher la grille), upper/NFD/espaces. Protège les initiales 1 lettre. */
  function normName(s) {
    let tokens = String(s || "").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/\s+/g, " ").trim().split(/\s+/).filter(Boolean);
    while (tokens.length > 2 && isPosteToken(tokens[0])) tokens.shift();
    while (tokens.length > 2 && isPosteToken(tokens[tokens.length - 1])) tokens.pop();
    if (tokens.length === 2 && isPosteToken(tokens[0]) && !isPosteToken(tokens[1])) tokens = [tokens[1]];
    return tokens.join(" ");
  }

  /** APPLIQUE les encadrés aux employés (RÈGLE ABSOLUE Kevin 2026-05-26 :
   *  « si il y a un nom, il y a des données à appliquer »).
   *
   *  Pour chaque encadré « N CODE du J1 au J2 » + ses noms :
   *   - employé existant dans la grille → REMPLIT ses jours J1..J2 VIDES avec CODE
   *     (ne JAMAIS écraser une cellule déjà lue — reproduction identique).
   *   - employé absent de la grille → le CRÉE avec CODE sur J1..J2.
   *
   *  Ordre : les encadrés sont appliqués dans l'ordre du PDF — un encadré de
   *  sous-période (ex AF 4-8) appliqué après un CP intégral surcharge bien les
   *  jours 4-8 SEULEMENT s'ils étaient vides (priorité Kevin CP défaut + AF
   *  surcharge → on autorise la surcharge des cellules issues d'un AUTRE
   *  encadré, jamais d'une cellule de grille).
   *
   *  Retourne { employees, stats:{ filled, created, cells_added } }. */
  function applyEncadresToEmployees(employees, boxes, daysInMonth) {
    daysInMonth = daysInMonth || 31;
    const out = (employees || []).map(e => ({
      name: e.name || e.fullName,
      days: Object.assign({}, e.days || {}),
      brtpeck: e.brtpeck || null,
      teamNumber: (e.teamNumber !== undefined ? e.teamNumber : null),
      _gridDays: new Set(Object.keys(e.days || {})), // jours issus de la GRILLE (intouchables)
      statuts: Array.isArray(e.statuts) ? e.statuts.slice() : [], // codes encadrés (section maladie/CP…)
      source: e.source || "grid"
    }));
    const byName = new Map();
    for (const e of out) byName.set(normName(e.name), e);

    // Statuts d'ABSENCE intégrale (Kevin : « longue maladie = seulement dans
    // l'encadré du haut, pas de ligne de grille »). Un employé présent TOUT LE
    // MOIS dans un de ces encadrés n'a PAS de vraie grille → ses rares cellules
    // de grille sont des artefacts de colonnes mélangées (ex : SANNA O en M
    // récupérait le « R » initiale de son voisin CERETTI R).
    const ABSENCE_FULL = new Set(["M", "MAL", "CP", "AF", "MT", "PAT", "SS", "ABI", "AT", "ABS", "EDC", "CFL", "CRH"]);

    const stats = { filled: 0, created: 0, cells_added: 0, overridden: 0, dual_display: 0 };
    for (const box of (boxes || [])) {
      const from = box.from || 1;
      const to = box.to || daysInMonth;
      for (const n of (box.names || [])) {
        const key = normName(n.fullName);
        let emp = byName.get(key);
        if (!emp) {
          emp = { name: cleanDisplayName(n.fullName), days: {}, brtpeck: null, teamNumber: null, _gridDays: new Set(), statuts: [], source: "encadre" };
          byName.set(key, emp);
          out.push(emp);
          stats.created++;
        } else {
          stats.filled++;
        }
        // Marqueur statut encadré → permet la SECTION « longue maladie » / CP
        // (et le DOUBLE affichage si l'employé a aussi une équipe).
        if (!emp.statuts) emp.statuts = [];
        if (emp.statuts.indexOf(box.code) < 0) emp.statuts.push(box.code);

        // RÈGLE Kevin 2026-05-28 : si une longue maladie a AUSSI une vraie ligne
        // d'équipe → afficher LES DEUX (section maladie + vue équipe), même si M
        // tout le mois → on NE touche PAS sa grille (teamNumber non null).
        // Sinon (pas de vraie équipe) : sa grille est un artefact de colonnes
        // mélangées (ex SANGIORGIO 30×CP, SANNA 1×R) → l'encadré PRIME.
        const hasRealTeam = emp.teamNumber != null;
        if (hasRealTeam) stats.dual_display++;
        const gridCodes = new Set(Array.from(emp._gridDays).map(d => emp.days[d]));
        const gridIsArtefact = emp._gridDays.size <= 3 || gridCodes.size <= 1; // sparse OU uniforme
        const override = ABSENCE_FULL.has(box.code) && !hasRealTeam && gridIsArtefact;

        for (let d = from; d <= to; d++) {
          const ds = String(d);
          if (emp._gridDays.has(ds)) {
            // Vraie équipe OU grille non-artefact → on PROTÈGE la cellule de
            // grille (double affichage : reste en vue équipe avec son code).
            if (!override) continue;
            stats.overridden++;
          }
          emp.days[ds] = box.code;
          stats.cells_added++;
        }
      }
    }
    // Nettoie le champ interne avant retour
    for (const e of out) delete e._gridDays;
    return { employees: out, stats };
  }

  /* ───────────────────────────────────────────────────────────────────────
   * RECONSTRUCTION GÉOMÉTRIQUE des encadrés (Kevin 2026-05-28).
   *
   * POURQUOI : le haut du planning SBM est une grille MULTI-COLONNES
   * (« 9 M du au   16 CP du au » puis les noms en colonnes dessous). Quand on
   * APLATIT le PDF en texte (parseEncadres ci-dessus), les colonnes se
   * mélangent → on perd QUI est dans QUELLE boîte (ex : SANNA O en maladie M
   * était collée à un faux « R »). La donnée EST dans le PDF, encodée par la
   * POSITION VISUELLE (x/y) de chaque nom — pas par le texte.
   *
   * MÉTHODE : on lit les items PDF.js avec coordonnées (pages[].items[].x/y) :
   *   1. en-tête = item code statut (M/CP/AF/…) avec « du » à sa droite, même y ;
   *      count = nombre juste à gauche ; from/to = nombres entre du/au (défaut
   *      = mois entier — Kevin : « M et CP tout le mois »).
   *   2. bande X de la colonne = [leftX, leftX de l'en-tête suivant de la rangée).
   *   3. noms de la boîte = items-nom dans cette bande X, sous l'en-tête,
   *      du haut vers le bas, jusqu'à `count` (s'arrête sur un gros saut en y).
   *   4. si noms trouvés < count → on FLAGUE l'écart (PDF.js a parfois lâché un
   *      item-nom isolé) pour Vision ciblée / complétion — JAMAIS inventer.
   *
   * Retourne le MÊME format que parseEncadres → réutilise applyEncadresToEmployees. */
  function parseEncadresGeometric(pages, daysInMonth) {
    const out = { ok: true, boxes: [], warnings: [], geometric: true };
    daysInMonth = daysInMonth || 31;
    if (!pages || !pages.length) {
      out.ok = false;
      out.warnings.push("parseEncadresGeometric : pas de pages/items (PDF sans calque texte ?)");
      return out;
    }

    const up = s => String(s).toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
    const isNum = s => /^\d{1,3}$/.test(String(s).trim());
    function asCode(s) {
      const u = up(s);
      if (ALIAS_LONG_TO_SHORT[u]) return ALIAS_LONG_TO_SHORT[u];
      if (STATUT_CODES_LONG_FIRST.indexOf(u) >= 0) return u;
      return null;
    }
    function isNameStr(s) {
      s = String(s).trim();
      if (!s || s.indexOf(" ") < 0) return false;
      const t = s.split(/\s+/);
      const init = t[t.length - 1];
      if (!/^[A-Z]{1,3}$/.test(init)) return false;          // initiales 1-3 lettres
      const sur = t.slice(0, -1).join(" ");
      if (sur.length < 2) return false;
      if (!/^[A-ZÉÈÀÊÂÔÛÄËÏÖÜÇ'\- ]+$/.test(sur)) return false;
      if (NAME_EXCLUDE.has(up(t[0]))) return false;
      return true;
    }
    function splitName(s) {
      const t = String(s).trim().split(/\s+/).filter(Boolean);
      const init = t.pop();
      const surname = t.join(" ");
      return { surname, initials: init, fullName: surname + " " + init };
    }

    for (const pg of pages) {
      const items = (pg.items || []).filter(i => i.str && i.str.trim());
      if (!items.length) continue;

      // 1) En-têtes d'encadrés (code + « du » à droite, même y).
      const headers = [];
      for (const it of items) {
        const code = asCode(it.str);
        if (!code) continue;
        const du = items.find(o => up(o.str) === "DU" && Math.abs(o.y - it.y) < 3 && o.x > it.x && o.x - it.x < 120);
        if (!du) continue;
        const au = items.find(o => up(o.str) === "AU" && Math.abs(o.y - it.y) < 3 && o.x > du.x && o.x - du.x < 120);
        const cnt = items.filter(o => isNum(o.str) && Math.abs(o.y - it.y) < 3 && o.x < it.x && it.x - o.x < 55)
          .sort((a, b) => b.x - a.x)[0];
        let from = 1, to = daysInMonth;            // défaut = mois entier (M/CP tout le mois)
        if (au) {
          // Dates collées à « du »/« au » uniquement. Gap serré (<16px) pour NE PAS
          // confondre la date de fin avec le numéro en tête de l'encadré suivant
          // (ex « M du au 16 CP » : le 16 est le num de CP, PAS la fin de M).
          const between = items.filter(o => isNum(o.str) && Math.abs(o.y - it.y) < 3 && o.x > du.x && o.x < au.x).sort((a, b) => a.x - b.x);
          const after = items.filter(o => isNum(o.str) && Math.abs(o.y - it.y) < 3 && o.x > au.x && o.x - au.x < 16).sort((a, b) => a.x - b.x);
          if (between[0]) from = parseInt(between[0].str, 10);
          if (after[0]) to = parseInt(after[0].str, 10);
        }
        headers.push({ code, y: it.y, codeX: it.x, leftX: cnt ? cnt.x : it.x, count: cnt ? parseInt(cnt.str, 10) : null, from, to });
      }
      if (!headers.length) continue;

      // 2) Regroupe les en-têtes par rangée (même y) → bornes X des colonnes.
      const rows = [];
      headers.slice().sort((a, b) => b.y - a.y || a.leftX - b.leftX).forEach(h => {
        let r = rows.find(r => Math.abs(r.y - h.y) < 5);
        if (!r) { r = { y: h.y, hs: [] }; rows.push(r); }
        r.hs.push(h);
      });
      rows.forEach(r => {
        r.hs.sort((a, b) => a.leftX - b.leftX);
        r.hs.forEach((h, i) => { h.rightX = (i + 1 < r.hs.length) ? r.hs[i + 1].leftX : h.leftX + 110; });
      });

      // 3) Noms par colonne : on marche du HAUT vers le BAS dans la bande X de la
      //    colonne, jusqu'à la fin visuelle (gros saut en y).
      //    ⚠️ Le nombre en tête d'encadré (« 9 M », « 16 CP ») N'EST PAS un
      //    compte de personnes (Kevin 2026-05-28 : « ce n'est pas le nombre…
      //    peut-être le num des encadrés »). On ne plafonne donc JAMAIS par ce
      //    nombre — on collecte la colonne entière par géométrie. Il est gardé
      //    comme `header_num` (informatif), jamais utilisé pour couper/flaguer.
      const nameItems = items.filter(i => isNameStr(i.str));
      const family = guessFamily(pg.text || "");
      const Y_STEP_MAX = 18;   // lignes de noms espacées ~8px ; >18px = fin de colonne
      for (const h of headers) {
        let from = h.from, to = h.to;
        if (from < 1 || to > daysInMonth || from > to) {
          out.warnings.push(`Période invalide ${h.code} : ${from}-${to} (daysInMonth=${daysInMonth})`);
          from = Math.max(1, Math.min(from, daysInMonth));
          to = Math.max(from, Math.min(to, daysInMonth));
        }
        // Plancher vertical : un en-tête situé PLUS BAS dans la même bande X
        // marque la fin de cette colonne → empêche un encadré vide (« 0 EDC »)
        // placé AU-DESSUS d'aspirer les noms de l'encadré du dessous.
        let yFloor = -Infinity;
        for (const h2 of headers) {
          if (h2 === h || h2.y >= h.y) continue;
          const overlap = h2.leftX < h.rightX && (h2.rightX || h2.leftX + 110) > h.leftX;
          if (overlap && h2.y > yFloor) yFloor = h2.y;
        }
        // header_num === 0 → encadré VIDE (personne dans ce statut ce mois).
        let names = [];
        if (h.count !== 0) {
          const cand = nameItems
            .filter(n => n.x >= h.leftX - 6 && n.x < h.rightX - 6 && n.y < h.y - 1 && n.y > yFloor)
            .sort((a, b) => b.y - a.y);
          const picked = [];
          let lastY = null;
          for (const n of cand) {
            if (lastY !== null && lastY - n.y > Y_STEP_MAX) break;   // fin de colonne
            picked.push(n);
            lastY = n.y;
          }
          names = picked.map(n => splitName(n.str.trim()));
        }
        out.boxes.push({
          header_num: h.count,            // nombre en tête (NON un compte de personnes)
          count: names.length,            // compat : nb réel de noms géométriques
          names_found: names.length,
          code: h.code,
          from, to,
          days_count: to - from + 1,
          family,
          names,
          raw_header: `${h.count != null ? h.count + " " : ""}${h.code} du au`,
          geometric: true
        });
      }
    }
    return out;
  }

  return {
    parseEncadres,
    parseEncadresGeometric,
    expandBoxesToCells,
    applyEncadresToEmployees,
    resolveCode,
    guessFamily,
    extractNames,
    normName,
    STATUT_CODES_LONG_FIRST,
    ALIAS_LONG_TO_SHORT,
    VERSION: "T1-encadres-v0.4.0-geometric"
  };
}));
