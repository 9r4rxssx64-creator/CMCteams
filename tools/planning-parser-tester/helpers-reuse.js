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
 * Codes statuts officiels SBM (encadrés bas de page)
 * Réf : NOTES_USER + index.html:37300 (_parseEncadresStatuts)
 * JAMAIS chercher mots français longs (FORMATION/MALADIE) — leçon Erreur #49.
 * ------------------------------------------------------------------ */
const STATUT_CODES = ["CP", "AF", "M", "MAL", "SS", "ABI", "AT", "PAT", "MT", "CFL", "CRH", "EDC", "ABS"];

const STATUT_LABEL = {
  "CP":  "Congé payé",
  "AF":  "Formation",
  "M":   "Maladie",
  "MAL": "Maladie longue",
  "SS":  "Sans solde",
  "ABI": "Absence injustifiée",
  "AT":  "Accident travail",
  "PAT": "Paternité (v9.118)",
  "MT":  "Maternité",
  "CFL": "Congé fête légale",
  "CRH": "Congé repos hebdo",
  "EDC": "En détachement cadre",
  "ABS": "Absence tolérée"
};

/* ------------------------------------------------------------------
 * Mapping horaire → lieu (CADRE_LIEU vs EMPLOYEE_LIEU) — Plan Phase 6
 * Lieux SBM : CMC / CDP/CCDP (Café de Paris) / Sun / MCB / POKER NO LIMIT
 * ------------------------------------------------------------------ */
const LIEUX_SBM = ["CMC", "CDP", "CCDP", "SUN", "MCB", "POKER NO LIMIT", "PNL"];

/** Détecte si un token correspond à un lieu SBM connu (insensible casse). */
function isLieuSBM(token) {
  if (!token) return false;
  const t = String(token).toUpperCase().trim();
  return LIEUX_SBM.includes(t);
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
  LIEUX_SBM,
  COMPETENCES,
  MONTHS_FR,
  normalizeQuotes,
  isConventionCode,
  isCcdpSuffixCode,
  isChefCode,
  isLieuSBM,
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
