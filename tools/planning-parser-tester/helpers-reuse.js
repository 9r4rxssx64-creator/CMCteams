/*
 * helpers-reuse.js
 * Helpers métier ISOLÉS pour l'app de test (T1).
 * Ne touche PAS au index.html racine CMCteams.
 * Copies/dérivés des helpers existants (référence: index.html lignes citées).
 *
 * RÈGLE ABSOLUE : ces helpers ne CORRIGENT JAMAIS la donnée. Ils détectent,
 * classifient, alertent. La donnée écrite = ce qui est lu dans le PDF source.
 */

/* ------------------------------------------------------------------
 * Convention SBM : suffixes ' / " / : / * — sens distincts à préserver
 * Réf : index.html:1441 (_cmcEnsureQuoteVariant) + NOTES_USER "Nomenclature visuelle"
 * ------------------------------------------------------------------ */
const SUFFIX_MEANING = {
  "'":  { kind: "convention", bg: "#d8342e", fg: "#ffe23a", desc: "Jour Convention (rouge/jaune)" },
  '"':  { kind: "convention", bg: "#d8342e", fg: "#ffe23a", desc: "Variante Convention" },
  '"\'':{ kind: "convention", bg: "#d8342e", fg: "#ffe23a", desc: "Variante Convention mix" },
  ":":  { kind: "variant",    bg: null,      fg: null,      desc: "Variante préservée tel quel" },
  "*":  { kind: "location",   bg: "#ffe4d0", fg: "#804418", desc: "CCDP + CMC ce jour" },
  "c":  { kind: "role",       bg: null,      fg: null,      desc: "Chef (minuscule)" }
};

/** Normalise apostrophes courbes → droites avant toute analyse de code. */
function normalizeQuotes(s) {
  if (!s) return s;
  return String(s)
    .replace(/[“”]/g, '"')   // “ ” → "
    .replace(/[‘’ʼ]/g, "'"); // ‘ ’ ʼ → '
}

/** Détecte si un code est de Convention (suffixe ' ou ").
 *  Réf : index.html v9.727 (_cmcIsConv source unique).
 *  Casse-sensitive sur suffixe (jamais uppercase systématique — Erreur #41 v9.715). */
function isConventionCode(code) {
  if (!code) return false;
  return /['"]$/.test(code);
}

/** Détecte si un code est un suffixe CCDP (*). Distinct du ★ rouge nom (chef européen). */
function isCcdpSuffixCode(code) {
  if (!code) return false;
  return /\*$/.test(code);
}

/** Détecte si un code est marqueur de chef (suffixe `c` MINUSCULE — Erreur #41 v9.715). */
function isChefCode(code) {
  if (!code) return false;
  return /c$/.test(code);
}

/* ------------------------------------------------------------------
 * Détection du TYPE de planning depuis le texte source brut
 * Réf : Plan Phase 1bis + NOTES_USER vérité terrain Pit Boss + Roulettes
 * ------------------------------------------------------------------ */
function detectPlanningType(rawText) {
  if (!rawText) return { types: [], confidence: 0, raw: "" };
  const t = String(rawText).toUpperCase();

  const found = [];
  // Cadres
  if (/PIT\s*BOSS\s*\d*/i.test(rawText)) found.push({ kind: "cadres", sub: "pit15", label: "Pit Boss" });
  if (/\bSUPERVISEUR\b/i.test(rawText))  found.push({ kind: "cadres", sub: "sup",   label: "Superviseur" });
  if (/\bINSPECTEUR\b/i.test(rawText))   found.push({ kind: "cadres", sub: "ins",   label: "Inspecteur" });

  // Employés / chefs par famille
  if (/BJ\s*[ÉE]q\.|\bCHEF\s*BJ\b|\bBLACKJACK\b|\bBLACK\s*JACK\b/i.test(rawText))
    found.push({ kind: "famille", sub: "bj", label: "Black Jack" });
  if (/ROUL\.\s*[ÉE]q\.|\bROULETTES?\b/i.test(rawText))
    found.push({ kind: "famille", sub: "roulettes", label: "Roulettes" });
  if (/\bCMC\s*[ÉE]q\.|\bCARTES\s*CMC\b/i.test(rawText))
    found.push({ kind: "famille", sub: "cmc", label: "CMC" });
  if (/\bAMENAGEMENT\b|\bAM[ÉE]NAGEMENT\b|\bHORAIRES\s+AM[ÉE]NAG/i.test(rawText))
    found.push({ kind: "famille", sub: "amenage", label: "Horaires aménagés" });

  // Confidence
  let confidence = 0;
  if (found.length === 1) confidence = 0.95;
  else if (found.length >= 2) confidence = 1.0;
  else confidence = 0;

  return {
    types: found,
    confidence,
    label: found.map(f => f.label).join(" + ") || "Format non reconnu",
    needs_user_confirm: confidence < 0.8
  };
}

/* ------------------------------------------------------------------
 * Détection de version V1/V2/V3 — Plan Phase 2
 * Convention SBM : pas de V dans le nom = V1 (original).
 * ------------------------------------------------------------------ */
function detectVersion(filename, rawText) {
  // Source 1 : filename (priorité 1)
  const f = String(filename || "");
  const mFile = f.match(/\bV\s*(\d+)\b/i);
  if (mFile) {
    return { version: parseInt(mFile[1], 10), source: "filename", confidence: 1.0 };
  }
  // Source 2 : contenu (priorité 2)
  const r = String(rawText || "");
  const mText = r.match(/\bV(?:ersion)?\s*(\d+)\b/i);
  if (mText) {
    return { version: parseInt(mText[1], 10), source: "content", confidence: 0.85 };
  }
  // Default : V1 (original)
  return { version: 1, source: "default", confidence: 1.0, note: "Aucun marqueur V — V1 par défaut (original SBM)" };
}

/* ------------------------------------------------------------------
 * Détection de mois et année dans le texte
 * ------------------------------------------------------------------ */
const MONTHS_FR = {
  "janvier":   0,  "février": 1,  "fevrier": 1, "mars": 2,    "avril": 3,
  "mai":       4,  "juin":    5,  "juillet": 6, "août": 7,    "aout": 7,
  "septembre": 8,  "octobre": 9,  "novembre": 10, "décembre": 11, "decembre": 11
};

function detectMonthYear(rawText, filename) {
  const sources = [rawText || "", filename || ""];
  for (const src of sources) {
    const lower = String(src).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    for (const monthName in MONTHS_FR) {
      const re = new RegExp("\\b" + monthName + "\\s+(\\d{4})\\b", "i");
      const m = lower.match(re);
      if (m) {
        return {
          year: parseInt(m[1], 10),
          month: MONTHS_FR[monthName],
          monthName,
          key: `${m[1]}-${MONTHS_FR[monthName]}`,
          source: src === rawText ? "content" : "filename"
        };
      }
    }
  }
  return { year: null, month: null, monthName: null, key: null, note: "Mois non détecté" };
}

/* ------------------------------------------------------------------
 * Codes BULLETIN officiels SBM (43 codes, Note 6 janvier 1993)
 * Réf : Note SBM Bernard Lées (Directeur Affaires Juridiques et Sociales)
 *       + index.html ligne 2084 (BULLETIN_CODES)
 *       + Convention Collective Jeux de Table 1er avril 2015
 * JAMAIS chercher mots français longs (FORMATION/MALADIE) — leçon Erreur #49.
 * ------------------------------------------------------------------ */

/** Codes statut courts utilisés pour les statuts intégraux (encadrés « du au »).
 *  Sous-ensemble de la table complète qu'on retrouve dans le contexte planning. */
const STATUT_CODES = ["CP", "AF", "M", "MAL", "SS", "CSS", "ABI", "AT", "PAT", "MT", "CFL", "CRH", "EDC", "ABS", "CL"];

/** Table complète des 43 codes officiels SBM organisés par catégorie.
 *  Source : Note 6 janvier 1993 (Bernard Lées) — bulletin de paie SBM. */
const BULLETIN_CODES_FULL = {
  presence_repos: [
    { code: "P",   l: "Jour de Présence" },
    { code: "RH",  l: "Repos Hebdomadaire" },
    { code: "R",   l: "Repos simple" },
    { code: "RTP", l: "Repos Travaillé à Payer" },
    { code: "RTR", l: "Repos Travaillé à Récupérer (+ au compteur)" },
    { code: "RRT", l: "Récupération Repos Travaillé (- au compteur)" },
    { code: "RHS", l: "Récupération Heures Supplémentaires" },
    { code: "DP",  l: "Jour de Disposition" }
  ],
  conges: [
    { code: "CP",  l: "Jour ouvrable de Congé Payé" },
    { code: "CRH", l: "Repos Hebdo inclus dans Congé" },
    { code: "CPS", l: "Congé Payé Samedi (5e pour 5 sem)" },
    { code: "CPM", l: "1er jour Période Congé — droit fractionnement" },
    { code: "CDP", l: "Jour Congé Déjà Payé" },
    { code: "CDH", l: "Repos Hebdo inclus dans Congés Déjà Payés" }
  ],
  fetes: [
    { code: "FL",  l: "Fête Légale chômée et payée" },
    { code: "CFL", l: "Fête Légale incluse dans Congé Payé" },
    { code: "FTP", l: "Fête Légale Travaillée à Payer" },
    { code: "FTR", l: "Fête Légale Travaillée à Récupérer" },
    { code: "RFT", l: "Récupération Fête Travaillée" }
  ],
  masse: [
    { code: "FCP", l: "Idem CP pour employé à la masse" },
    { code: "FCS", l: "Idem CPS pour employé à la masse" },
    { code: "FRH", l: "Idem CRH pour employé à la masse" },
    { code: "FFL", l: "Idem CFL pour employé à la masse" }
  ],
  absences: [
    { code: "M",   l: "Absence Maladie (indemnisée ou non)" },
    { code: "MAL", l: "Maladie longue durée" },
    { code: "AT",  l: "Accident du Travail ou Trajet" },
    { code: "MT",  l: "Congé Maternité" },
    { code: "ABS", l: "Absence tolérée non payée" },
    { code: "ABI", l: "Absence Injustifiée (sanction possible)" },
    { code: "ABP", l: "Absence autorisée exceptionnellement payée" },
    { code: "AF",  l: "Absence Rémunérée Formation (= Présence)" },
    { code: "CL",  l: "Congé Légal événement familial (Art. 18 Convention)" },
    { code: "CEO", l: "Congé d'Éducation Ouvrière" },
    { code: "CSC", l: "Congé Supplémentaire Cadre" },
    { code: "CSS", l: "Congé Sans Solde" }
  ],
  sanctions: [
    { code: "PNE", l: "Préavis non Exécuté" },
    { code: "AMP", l: "Mise à Pied non rémunérée" },
    { code: "MPC", l: "Mise à Pied Conservatoire (attente décision)" },
    { code: "MPP", l: "Mise à Pied Payée" }
  ],
  autres: [
    { code: "PAT", l: "Paternité" },
    { code: "PRT", l: "Prêt (mis à disposition autre service)" },
    { code: "HC",  l: "Heures Complémentaires" },
    { code: "EDC", l: "En Détachement Cadre (statut spécial SBM)" }
  ],
  pit_boss: [
    { code: "HD",  l: "Hors Département / Jour férié spécial (Pit Boss)" },
    { code: "PK",  l: "Poker Cash Game / Rotation Pit Boss au PK" },
    { code: "SS",  l: "Sans solde (alias)" }
  ]
};

/** Map plate code → label (toutes catégories confondues). */
const STATUT_LABEL = (function buildLabel() {
  const out = {};
  for (const cat of Object.keys(BULLETIN_CODES_FULL)) {
    for (const entry of BULLETIN_CODES_FULL[cat]) {
      if (!out[entry.code]) out[entry.code] = entry.l;
    }
  }
  return out;
})();

/** Retourne la catégorie d'un code (presence_repos/conges/fetes/masse/absences/sanctions/autres/pit_boss).
 *  Retourne null si code inconnu. */
function bulletinCategory(code) {
  if (!code) return null;
  const c = String(code).trim().toUpperCase();
  for (const cat of Object.keys(BULLETIN_CODES_FULL)) {
    if (BULLETIN_CODES_FULL[cat].some(e => e.code === c)) return cat;
  }
  return null;
}

/** Liste plate de TOUS les codes connus (utile pour assertions). */
const ALL_BULLETIN_CODES = (function flatList() {
  const seen = new Set();
  for (const cat of Object.keys(BULLETIN_CODES_FULL)) {
    for (const e of BULLETIN_CODES_FULL[cat]) seen.add(e.code);
  }
  return Array.from(seen);
})();

/* ------------------------------------------------------------------
 * Mapping horaire → lieu (CADRE_LIEU vs EMPLOYEE_LIEU) — Plan Phase 6
 * Lieux SBM : CMC / CDP/CCDP (Café de Paris) / Sun / MCB / POKER NO LIMIT
 * Réf : NOTES_USER « CODES HORAIRES PIT BOSS (légende verte) » lignes 1178+
 * Règle critique Kevin : le MÊME code peut avoir un LIEU DIFFÉRENT selon le rôle
 *   - `19/4` EMPLOYÉ = CMC mais `19/4` PIT BOSS = CCDP
 *   - `19/4'` (apostrophe) PIT BOSS = CMC (variante CDP comme les employés)
 * ------------------------------------------------------------------ */
const LIEUX_SBM = ["CMC", "CDP", "CCDP", "SUN", "MCB", "POKER NO LIMIT", "PNL"];

/** Détecte si un token correspond à un lieu SBM connu (insensible casse). */
function isLieuSBM(token) {
  if (!token) return false;
  const t = String(token).toUpperCase().trim();
  return LIEUX_SBM.includes(t);
}

/* Mapping CODE → LIEU par rôle. Le lieu dépend du rôle ET du code (suffixe inclus).
 * Source de vérité : NOTES_USER lignes 1182-1197 (légende verte mai 2026 PDF).
 *
 * Convention de lookup :
 *   1. Normaliser le code via normalizeQuotes() (apostrophes droites)
 *   2. Normaliser `H` → `h` dans format `12H30/19` → `12h30/19`
 *   3. Choisir la table selon le rôle : "pit"/"sup"/"cadres" → CADRE_LIEU, sinon EMPLOYEE_LIEU
 *   4. Lookup exact (avec suffixe) ; à défaut lookup base sans suffixe ; à défaut "?"
 *
 * Suffixe `*` → CCDP+CMC (priorité absolue, applique partout).
 * Suffixe `'`/`"` → Convention (jour additionnel direction, lieu = CMC par défaut côté Pit Boss).
 * Suffixe `CDP` standalone (mot) → CCDP.
 */
const CODE_TO_LIEU_CADRE = {
  // Codes horaires PIT BOSS (légende verte PDF mai 2026)
  "22/6":      "CMC",
  "19/4":      "CCDP",           // ⚠ différent des employés où c'est CMC
  "19/4'":     "CMC",            // variante apostrophe → CMC (comme employés CDP)
  "19/4\"":    "CMC",
  "19/4\"'":   "CMC",
  "16/3":      "CMC",
  "16/20":     "CMC",
  "12h30/19":  "CMC",
  "15/19":     "CCDP",
  "19/2":      "CMC",
  "15/20":     "POKER NO LIMIT", // fond rose
  "20/5":      "CMC",
  "14/19":     "CMC",
  "16/22":     "CMC",
  "PK":        "POKER NO LIMIT",
  "HD":        "HD"              // hors département / jour férié spécial
};

const CODE_TO_LIEU_EMPLOYEE = {
  // Codes horaires EMPLOYÉS / CHEFS BJ / ROULETTES / CMC
  "22/6":      "CMC",
  "19/4":      "CMC",            // ⚠ différent des Pit Boss
  "16/3":      "CMC",
  "16/20":     "CMC",
  "14/19":     "CMC",
  "20/5":      "CMC",
  "16/22":     "CMC",
  "12h30/19":  "CMC",
  "15/19":     "CMC",
  "19/2":      "CMC",
  "15/20":     "CMC"
};

/** Retourne le lieu de travail pour un code et un rôle donné.
 *  rôle ∈ {"pit","sup","cadres","ins","employee","chef","cmc"}.
 *  Suffixe `*` priorité absolue (CCDP+CMC). Code statut → null (pas un horaire).
 *
 *  ⚠ Préserve TOUJOURS la donnée source — ne réécrit pas le code, ne corrige
 *  pas un code inconnu. Retourne juste le lieu déduit OU "?" si non mappé.
 */
function codeToLieu(rawCode, role) {
  if (!rawCode) return null;
  const code = normalizeQuotes(String(rawCode).trim()).replace(/H/g, "h");

  // Codes statut → pas un lieu
  if (STATUT_CODES.indexOf(code.toUpperCase()) >= 0) return null;
  if (/^(RH|R)$/.test(code)) return null;

  // Suffixe `*` → CCDP+CMC partout (priorité absolue)
  if (/\*$/.test(code)) return "CCDP+CMC";

  // Suffixe `CDP` mot → CCDP
  if (/CDP$/i.test(code)) return "CCDP";

  const isCadre = role && /^(pit|sup|cadres?|ins)$/i.test(role);
  const table = isCadre ? CODE_TO_LIEU_CADRE : CODE_TO_LIEU_EMPLOYEE;

  // 1) Lookup exact (avec suffixe)
  if (table[code]) return table[code];
  // 2) Lookup base sans suffixe c/'/":'/  (préservé en stockage, mais pour lookup)
  const base = code.replace(/[c'":]+$/g, "");
  if (table[base]) return table[base];
  // 3) Inconnu
  return "?";
}

/* ------------------------------------------------------------------
 * Compétences BRTPECK — code-poste devant le nom
 * Réf : NOTES_USER "Compétences BRTPECK encodées dans le code poste"
 * ------------------------------------------------------------------ */
const COMPETENCES = {
  B: "BlackJack",
  R: "Roulette américaine",
  T: "Texas Hold'em",
  P: "Punto Banco (Baccara)",
  E: "Roulette Européenne (école premium SBM Art. 4)",
  C: "Craps",
  K: "BJ Super / Poker Cash Game"
};

/** Décode un code-poste BRTPECK. Conserve TEL QUEL — ne corrige rien.
 *  Retourne {raw, letters:[], isChef, isCmcCard, hasPlus, plusLetters:[]}
 *  Exemples :
 *    "BRTP+E."   → letters=[B,R,T,P], plusLetters=[E], isChef=true
 *    ".BRTCPK"   → letters=[B,R,T,C,P,K], isCmcCard=true
 *    "BRTCP+K"   → letters=[B,R,T,C,P], plusLetters=[K]
 */
function parseBrtpeck(rawCode) {
  if (!rawCode) return null;
  const raw = String(rawCode).trim();
  const isChef    = /\.$/.test(raw);
  const isCmcCard = /^\./.test(raw);
  const core = raw.replace(/^\.|\.$/g, "");
  const [main, plus] = core.split("+");
  const letters     = (main || "").split("").filter(c => COMPETENCES[c.toUpperCase()]);
  const plusLetters = (plus || "").split("").filter(c => COMPETENCES[c.toUpperCase()]);
  return { raw, letters, isChef, isCmcCard, hasPlus: !!plus, plusLetters };
}

/* ------------------------------------------------------------------
 * Marqueurs visuels noms — Plan Phase 5.5 (3 sens distincts du *)
 * Réf : NOTES_USER "Petite étoile rouge `*` = CHEF EUROPÉEN" + Erreur #41
 * ------------------------------------------------------------------ */
function detectVisualMarkersForName(rawLine) {
  if (!rawLine) return { senior: false, chef_european: false, faisant_fonction: false };
  // ★ ou * AVANT le nom (col matricule) = chef européen / senior selon contexte
  // (Distinction Kevin 2026-05-16 : * rouge = chef européen ; en parallèle emp.senior gardé pour rotation 40 min)
  const hasStar = /[\*★]/.test(rawLine);
  return {
    senior:        hasStar,   // règle rotation 40 min CLAUDE.md
    chef_european: hasStar,   // compétence E premium SBM Art. 4
    // faisant_fonction = fond bleu, non détectable depuis texte brut, vient de Vision IA
    faisant_fonction: false
  };
}

/* ------------------------------------------------------------------
 * Hash SHA-256 client-side (idempotence import) — Plan Phase 1
 * ------------------------------------------------------------------ */
async function sha256(arrayBufferOrString) {
  let buf;
  if (typeof arrayBufferOrString === "string") {
    buf = new TextEncoder().encode(arrayBufferOrString);
  } else {
    buf = arrayBufferOrString;
  }
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ------------------------------------------------------------------
 * Echappement HTML (anti-XSS) — réutilisé partout
 * Réf : CLAUDE.md règle absolue esc() avant innerHTML
 * ------------------------------------------------------------------ */
function esc(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ------------------------------------------------------------------
 * Export global (UMD-style) pour usage dans index.html + tests
 * ------------------------------------------------------------------ */
const PlanningParserHelpers = {
  SUFFIX_MEANING,
  STATUT_CODES,
  STATUT_LABEL,
  BULLETIN_CODES_FULL,
  ALL_BULLETIN_CODES,
  bulletinCategory,
  LIEUX_SBM,
  CODE_TO_LIEU_CADRE,
  CODE_TO_LIEU_EMPLOYEE,
  COMPETENCES,
  MONTHS_FR,
  normalizeQuotes,
  isConventionCode,
  isCcdpSuffixCode,
  isChefCode,
  isLieuSBM,
  codeToLieu,
  detectPlanningType,
  detectVersion,
  detectMonthYear,
  parseBrtpeck,
  detectVisualMarkersForName,
  sha256,
  esc
};

if (typeof window !== "undefined") window.PlanningParserHelpers = PlanningParserHelpers;
if (typeof module !== "undefined" && module.exports) module.exports = PlanningParserHelpers;
