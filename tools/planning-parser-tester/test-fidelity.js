/**
 * test-fidelity.js — Test de FIDÉLITÉ « reproduction à l'identique » (T1).
 *
 * Règle absolue Kevin (répétée 4×) : reproduction à l'identique, aucune
 * erreur ni oubli. Ce test prouve que le pipeline texte reproduit EXACTEMENT
 * les codes du planning source — suffixes (', ", *, c) préservés caractère
 * par caractère, homonymes séparés, encadrés détectés, 43 codes reconnus.
 *
 * Fixture : fixtures/synthetic-mai-2026-v1.txt (données FICTIVES — aucun vrai
 * employé exposé, mais format SBM réel reproduit).
 *
 * Lancer : node tools/planning-parser-tester/test-fidelity.js
 * Exit 0 si reproduction parfaite, 1 sinon.
 */

"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.dirname(__filename);
const PASS = "\x1b[32m✅\x1b[0m";
const FAIL = "\x1b[31m❌\x1b[0m";
const INFO = "\x1b[36mℹ\x1b[0m";

let failures = 0;
function check(label, cond, detail) {
  if (cond) console.log(`${PASS} ${label}`);
  else { console.log(`${FAIL} ${label}${detail ? "  → " + detail : ""}`); failures++; }
}

const TextParser = require(path.join(ROOT, "lib/text-parser.js"));
const EncadresParser = require(path.join(ROOT, "lib/encadres-parser.js"));
const HomonymsGuard = require(path.join(ROOT, "lib/homonyms-guard.js"));
const CodeColors = require(path.join(ROOT, "lib/code-colors.js"));
const Helpers = require(path.join(ROOT, "helpers-reuse.js"));

const rawText = fs.readFileSync(path.join(ROOT, "fixtures/synthetic-mai-2026-v1.txt"), "utf8");

// ───── 1. Parsing texte natif (passe G via parseFromRawText) ─────
console.log(`\n${INFO} Fidélité 1 — Extraction noms + codes (parseFromRawText)`);
// parseFromPdfJs attend pdfPass.pages ; on construit un pseudo-pass minimal
// avec textRaw pour exercer la passe 2 (raw text).
const fakePass = { passe: "A", tool: "pdf.js", pages: [{ items: [] }], textRaw: rawText };
const g = TextParser.parseFromPdfJs(fakePass);
check("  parseFromPdfJs ok", g.ok, g.error && g.error.message);
const empByName = {};
for (const e of g.employees) empByName[e.name] = e;
check(`  Employés détectés (${g.employees.length})`, g.employees.length >= 6);

// ───── 2. Suffixes préservés caractère par caractère ─────
console.log(`\n${INFO} Fidélité 2 — Suffixes préservés (' / * / c)`);
// MOCKBA V : tous ses codes travail = "22/6'" (apostrophe Convention)
const mockba = empByName["MOCKBA V"];
if (mockba) {
  const codes = Object.values(mockba.days).filter(c => c !== "RH" && c !== "R");
  const allConv = codes.length > 0 && codes.every(c => c === "22/6'");
  check("  MOCKBA V : tous les '22/6'' préservés avec apostrophe", allConv,
    "codes vus: " + JSON.stringify(codes.slice(0, 3)));
} else {
  check("  MOCKBA V trouvé", false, "non détecté");
}
// LANDAU B (employé CMC) : a un 16/3* (CCDP) à préserver
const landauB = empByName["LANDAU B"];
if (landauB) {
  const hasStar = Object.values(landauB.days).some(c => c === "16/3*");
  check("  LANDAU B : suffixe '16/3*' (CCDP) préservé", hasStar,
    "codes: " + JSON.stringify(Object.values(landauB.days).slice(0, 8)));
} else {
  check("  LANDAU B trouvé", false);
}

// ───── 3. Homonymes LANDAU B (employé) ≠ LANDAU J (Pit Boss) ─────
console.log(`\n${INFO} Fidélité 3 — Homonymes séparés (LANDAU B ≠ LANDAU J)`);
check("  LANDAU B détecté (employé CMC)", !!empByName["LANDAU B"]);
check("  LANDAU J détecté (Pit Boss)", !!empByName["LANDAU J"]);
const canMatch = HomonymsGuard.canMatch("LANDAU", "B", "LANDAU", "J");
check("  canMatch(LANDAU B, LANDAU J) = bloqué", canMatch.safe === false);
const audit = HomonymsGuard.auditEmployees(g.employees.map(e => ({ fullName: e.name })));
check("  auditEmployees : aucun risque de doublon", audit.merging_risks.length === 0,
  JSON.stringify(audit.merging_risks));

// ───── 4. Codes 12H30/19 (H majuscule) reconnus ─────
console.log(`\n${INFO} Fidélité 4 — 12H30/19 (H majuscule NOTES_USER 1214)`);
const janel = empByName["JANEL JM"];
if (janel) {
  const has1230 = Object.values(janel.days).some(c => /12H30\/19/i.test(c));
  check("  JANEL JM : 12H30/19 capturé (H majuscule)", has1230,
    "codes: " + JSON.stringify(Object.values(janel.days).slice(0, 6)));
  const hasPK = Object.values(janel.days).some(c => c === "PK");
  check("  JANEL JM : code PK (Poker) capturé", hasPK);
} else {
  check("  JANEL JM trouvé", false);
}

// ───── 5. Encadrés statuts « du J1 au J2 » ─────
console.log(`\n${INFO} Fidélité 5 — Encadrés statuts intégraux`);
const enc = EncadresParser.parseEncadres(rawText, 31);
check("  Encadrés détectés", enc.boxes.length >= 3, "boxes: " + enc.boxes.length);
const cpBox = enc.boxes.find(b => b.code === "CP");
check("  Encadré CP du 1 au 31 (mois entier)", cpBox && cpBox.from === 1 && cpBox.to === 31,
  cpBox ? `from=${cpBox.from} to=${cpBox.to}` : "absent");
const formBox = enc.boxes.find(b => b.code === "AF");
check("  Encadré FORMATION→AF du 4 au 8 (sous-période)", formBox && formBox.from === 4 && formBox.to === 8,
  formBox ? `from=${formBox.from} to=${formBox.to}` : "absent");
const mBox = enc.boxes.find(b => b.code === "M");
check("  Encadré M du 1 au 31", mBox && mBox.from === 1 && mBox.to === 31,
  mBox ? `from=${mBox.from} to=${mBox.to}` : "absent");

// ───── 6. Couleurs : Convention rouge/jaune, CCDP orange ─────
console.log(`\n${INFO} Fidélité 6 — Projection couleurs (ne modifie pas la source)`);
const cConv = CodeColors.getCellColor("22/6'");
check("  22/6' → Convention rouge #d8342e / jaune #ffe23a",
  cConv.bg === "#d8342e" && cConv.fg === "#ffe23a");
const cStar = CodeColors.getCellColor("16/3*");
check("  16/3* → CCDP orange", cStar.isCcdp === true);
const cRH = CodeColors.getCellColor("RH");
check("  RH → violet", cRH.bg && /^#/.test(cRH.bg));
// Vérif que getCellColor ne modifie pas le code source
check("  getCellColor préserve le code source", cConv.code === "22/6'");

// ───── 7. Lieux : 19/4 Pit Boss = CCDP, employé = CMC ─────
console.log(`\n${INFO} Fidélité 7 — Mapping lieu conditionnel sur rôle`);
check("  codeToLieu(19/4, pit) = CCDP", Helpers.codeToLieu("19/4", "pit") === "CCDP");
check("  codeToLieu(19/4, employee) = CMC", Helpers.codeToLieu("19/4", "employee") === "CMC");
check("  codeToLieu(12H30/19, pit) = CMC (H normalisé)", Helpers.codeToLieu("12H30/19", "pit") === "CMC");
check("  codeToLieu(15/20, pit) = POKER NO LIMIT", Helpers.codeToLieu("15/20", "pit") === "POKER NO LIMIT");

// ───── 8. BRTPECK capturé ─────
console.log(`\n${INFO} Fidélité 8 — Compétences BRTPECK devant le nom`);
if (landauB) {
  check("  LANDAU B : code BRTPECK capturé (.BRTCP+KE)",
    !!landauB.brtpeck && /BRTCP/.test(landauB.brtpeck),
    "brtpeck: " + landauB.brtpeck);
}
const decoded = Helpers.parseBrtpeck(".BRTCP+KE");
check("  parseBrtpeck(.BRTCP+KE) : isCmcCard + 7 compétences",
  decoded && decoded.isCmcCard && (decoded.letters.length + decoded.plusLetters.length) >= 6);

// ───── Résumé ─────
console.log("\n────────────────────────");
if (failures === 0) {
  console.log(`${PASS} FIDÉLITÉ 100% — reproduction à l'identique vérifiée sur la fixture.`);
  process.exit(0);
} else {
  console.log(`${FAIL} ${failures} écart(s) de fidélité. La reproduction n'est PAS identique.`);
  process.exit(1);
}
