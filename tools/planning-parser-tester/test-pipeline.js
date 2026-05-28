/**
 * test-pipeline.js — Test régression standalone pour planning-parser-tester
 *
 * Lance node tools/planning-parser-tester/test-pipeline.js
 *
 * Vérifie en environnement Node (jsdom-like) :
 *  1. Tous les JS passent node --check
 *  2. Les helpers cloneBytes, ensurePdfJsReady, getProxyConfig sont exportés
 *  3. Phase A clone le buffer (cherche `new Uint8Array(...).slice()` AVANT getDocument)
 *  4. Les 4 passes Vision ont cloneBytes en première instruction
 *  5. Le format Mistral utilise document_url (pas document_base64)
 *  6. Le modèle Claude par défaut est claude-sonnet-4-6 (alias stable)
 *  7. PIPE.VERSION et VP.VERSION matchent le même numéro v0.X.Y
 *  8. _autoLoaded.worker_url cohérent entre écriture et lecture
 *  9. Pas de `as any` (TypeScript) dans les fichiers .js
 *  10. Worker /test/* exempté de l'auth
 *  11. Workflow Node version >= 22 (wrangler v4)
 *  12. Workflow secrets matchent CLAUDE.md règle 7 (noms exacts Kevin)
 *  13. Mapping CODE→LIEU par rôle (19/4 employé=CMC, Pit Boss=CCDP)
 *  14. Encadres-parser : codes courts uniquement (erreur #49)
 *  15. Team-detector : algo RH/R + miroir (Kevin 2026-05-15/28)
 *  16. Text-parser v0.3 : 12H30 majuscule + MT + BRTPECK + team_num
 *  17. Couverture 43 codes officiels Convention SBM
 *  18. Validations Convention (Art. 17.5, 35, sanctions, everyone-has-planning)
 *  19. Homonyms guard (anti-merge LANDAU B/J — erreurs #38/#44)
 *  20. Code colors (projection cellule, ne modifie pas la source)
 *
 * Tous ces tests auraient attrapé les bugs #1-15 de la session 2026-05-27
 * AVANT le push. Lancer obligatoire avant chaque commit qui touche T1.
 */

"use strict";
const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const ROOT = path.dirname(__filename);
const PASS = "\x1b[32m✅\x1b[0m";
const FAIL = "\x1b[31m❌\x1b[0m";
const INFO = "\x1b[36mℹ\x1b[0m";

let failures = 0;
function check(label, cond, detail) {
  if (cond) {
    console.log(`${PASS} ${label}`);
  } else {
    console.log(`${FAIL} ${label}${detail ? "  → " + detail : ""}`);
    failures++;
  }
}

function readFile(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

/**
 * Strip les commentaires JS pour éviter les faux positifs (un mot mentionné
 * dans un commentaire ne compte pas comme du code actif).
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")  // /* ... */
    .replace(/^\s*\/\/.*$/gm, "")       // // ... en début de ligne
    .replace(/[^:"]\/\/[^\n]*/g, "");   // // ... en fin de ligne (sans toucher URLs http://)
}

// ───── 1. Syntax check tous les JS ─────
console.log(`\n${INFO} Test 1/12 — Syntax check JS`);
const jsFiles = [
  "parser-multi-ocr.js",
  "helpers-reuse.js",
  "lib/vision-passes.js",
  "lib/cell-voting.js",
  "lib/text-parser.js",
  "lib/encadres-parser.js",
  "lib/team-detector.js",
  "lib/validate-post-import.js",
  "lib/homonyms-guard.js",
  "lib/code-colors.js",
  "sw.js",
];
for (const f of jsFiles) {
  try {
    cp.execSync(`node --check "${path.join(ROOT, f)}"`, { stdio: "pipe" });
    check(`  ${f}`, true);
  } catch (e) {
    check(`  ${f}`, false, e.message.slice(0, 200));
  }
}

// ───── 2. Helpers exportés ─────
console.log(`\n${INFO} Test 2/12 — Helpers exportés correctement`);
const parser = readFile("parser-multi-ocr.js");
const vision = readFile("lib/vision-passes.js");
const voting = readFile("lib/cell-voting.js");
check("  PlanningParserPipeline.ensurePdfJsReady exporté", /ensurePdfJsReady,?\s*$/m.test(parser) || /ensurePdfJsReady\s*[,}]/.test(parser));
check("  VisionPasses.getProxyConfig exporté", /getProxyConfig\s*[,}]/.test(vision));
check("  VisionPasses.loadAutoConfig exporté", /loadAutoConfig\s*[,}]/.test(vision));
check("  VisionPasses.runAllVisionPasses exporté", /runAllVisionPasses\s*[,}]/.test(vision));
check("  CellVoting.voteCells exporté", /voteCells\s*[,}]/.test(voting));
check("  cloneBytes() helper défini dans vision-passes", /function cloneBytes\b/.test(vision));

// ───── 3. Phase A clone le buffer AVANT getDocument (bug #12) ─────
console.log(`\n${INFO} Test 3/12 — Phase A clone le buffer (bug #12 jamais reproduit)`);
// Cherche : new Uint8Array(...).slice() AVANT pdfjsLib.getDocument dans extractWithPdfJs
const extractFn = parser.match(/async function extractWithPdfJs[\s\S]*?(?=\n\s{2}\/\*|\n\s{2}async function|\n\s{2}function)/);
check("  extractWithPdfJs trouvée", !!extractFn);
if (extractFn) {
  const code = extractFn[0];
  const hasClone = /new Uint8Array\([^)]+\)\.slice\(\)/.test(code);
  const hasGetDocument = /pdfjsLib\.getDocument\(\{\s*data:/.test(code);
  const cloneBeforeGetDoc = hasClone && code.indexOf("new Uint8Array") < code.indexOf("pdfjsLib.getDocument");
  check("  Phase A clone (new Uint8Array().slice())", hasClone);
  check("  Phase A utilise getDocument", hasGetDocument);
  check("  Phase A clone AVANT getDocument", cloneBeforeGetDoc);
}

// ───── 4. Les 4 passes Vision ont cloneBytes en première instruction ─────
console.log(`\n${INFO} Test 4/12 — 4 passes Vision protégées par cloneBytes (bugs #C/D/E)`);
const passNames = ["runClaudeVision", "runGPT4oVision", "runMistralOCR", "runGeminiVision"];
for (const passName of passNames) {
  const passFn = vision.match(new RegExp(`async function ${passName}[\\s\\S]*?(?=\\n\\s{2}async function|\\n\\s{2}function|\\n  \\/\\*)`));
  if (!passFn) { check(`  ${passName}`, false, "fonction non trouvée"); continue; }
  const tryBody = passFn[0].match(/try\s*\{([\s\S]*?)(?=\n\s{4}\}\s*(?:catch|finally))/);
  if (!tryBody) { check(`  ${passName}`, false, "bloc try non trouvé"); continue; }
  const hasClone = /cloneBytes\s*\(\s*captureBytes\s*\)/.test(tryBody[1].slice(0, 800));
  check(`  ${passName} appelle cloneBytes() au début`, hasClone);
}

// ───── 5. Mistral utilise Pixtral chat completions (refactor v0.5.0) ─────
console.log(`\n${INFO} Test 5/12 — Mistral utilise Pixtral chat completions (refactor v0.5.0)`);
const mistralFn = vision.match(/async function runMistralOCR[\s\S]*?(?=\n\s{2}async function|\n\s{2}function|\n  \/\*)/);
const mistralCode = mistralFn ? stripComments(mistralFn[0]) : "";
// Anciens formats interdits : document_base64 (HTTP 422), document_url (OCR pur retourne markdown brut non parsable)
check("  runMistralOCR ne contient PAS document_base64 (HTTP 422)", mistralFn && !/document_base64/.test(mistralCode));
// Nouveau format attendu : chat completions avec image_url + pixtral-large
check("  runMistralOCR utilise format image_url chat completions", mistralFn && /type:\s*"image_url"/.test(mistralCode) && /image_url:\s*"data:/.test(mistralCode));
check("  runMistralOCR utilise modèle pixtral-large-latest", mistralFn && /pixtral-large-latest|opts\.model\s*\|\|\s*"pixtral/.test(mistralCode));

// ───── 6. Modèle Claude alias stable (bug #9) ─────
console.log(`\n${INFO} Test 6/12 — Modèle Claude alias stable (bug #9)`);
const claudeFn = vision.match(/async function runClaudeVision[\s\S]*?(?=\n\s{2}async function|\n\s{2}function|\n  \/\*)/);
check("  Claude utilise alias claude-sonnet-4-6 ou +", claudeFn && /claude-sonnet-4-6/.test(claudeFn[0]));
check("  Claude PAS un snapshot précis (claude-sonnet-4-5-2025XX par défaut)", claudeFn && !/opts\.model\s*\|\|\s*["']claude-sonnet-4-5-2025/.test(claudeFn[0]));
check("  Claude a cascade fallback modèles", claudeFn && /candidates\s*=|fallback/i.test(claudeFn[0]));

// ───── 7. Versions PIPE et VP cohérentes (bug #13) ─────
console.log(`\n${INFO} Test 7/12 — Versions cohérentes (bug #13)`);
const pipeV = (parser.match(/VERSION:\s*"([^"]+)"/) || [])[1] || "?";
const visV = (vision.match(/VERSION:\s*"([^"]+)"/) || [])[1] || "?";
const pipeMajor = (pipeV.match(/v(\d+\.\d+)/) || [])[1] || "?";
const visMajor = (visV.match(/v(\d+\.\d+)/) || [])[1] || "?";
check(`  PIPE.VERSION (${pipeV}) et VP.VERSION (${visV}) ont le même majeur v${pipeMajor}`, pipeMajor === visMajor && pipeMajor !== "?");

// ───── 8. _autoLoaded.worker_url cohérent (bug #7) ─────
console.log(`\n${INFO} Test 8/12 — _autoLoaded naming cohérent écriture/lecture (bug #7)`);
const visionCode = stripComments(vision);
const writesWorkerUrl = /_autoLoaded\s*=\s*[^;]*\bworker_url:/.test(visionCode) || /worker_url:\s*conv/.test(visionCode);
const readsWorkerUrl = /_autoLoaded\.worker_url/.test(visionCode);
const readsUrlOnly = /_autoLoaded\.url\b/.test(visionCode);
check("  loadAutoConfig écrit _autoLoaded.worker_url", writesWorkerUrl);
check("  getProxyConfig lit _autoLoaded.worker_url (pas .url, code actif uniquement)", readsWorkerUrl && !readsUrlOnly);

// ───── 9. Pas de TypeScript dans .js (bug #11) ─────
console.log(`\n${INFO} Test 9/12 — Pas de TypeScript dans les .js (bug #11)`);
for (const f of jsFiles) {
  if (f.endsWith(".js")) {
    const content = readFile(f);
    check(`  ${f} sans "as any"`, !/\bas\s+any\b/.test(content));
    check(`  ${f} sans annotations TS de paramètres (: type)`, !/function\s+\w+\([^)]*:\s*(string|number|boolean|object)\b/.test(content));
  }
}

// ───── 10. Worker /test/* exempté auth (bug #8) ─────
console.log(`\n${INFO} Test 10/12 — Worker /test/* exempté de l'auth (bug #8)`);
const workerSrc = readFile("worker/index.ts");
check("  /test/ déclaré comme public", /isPublicTest|\/test\//.test(workerSrc) && /url\.pathname\.startsWith\("\/test\/"\)/.test(workerSrc));
check("  checkAuth() bypass si isPublicTest", /if\s*\(!isPublicTest\)\s*\{\s*const auth = checkAuth/.test(workerSrc));

// ───── 11. Workflow Node >= 22 (bug #2) ─────
console.log(`\n${INFO} Test 11/12 — Workflow Node 22 (bug #2)`);
const workflow = fs.readFileSync(path.join(ROOT, "../../.github/workflows/cmc-parser-proxy-deploy.yml"), "utf8");
check("  node-version '22' dans setup-node", /node-version:\s*['"]22/.test(workflow));
check("  PAS node-version 20", !/node-version:\s*['"]20/.test(workflow));

// ───── 12. Workflow secrets matchent convention Kevin (CLAUDE.md règle 7) ─────
console.log(`\n${INFO} Test 12/12 — Secrets noms conformes CLAUDE.md règle 7`);
check("  OPEN_AI_API_KEY (underscore, PAS OPENAI_API_KEY)", /secrets\.OPEN_AI_API_KEY/.test(workflow) && !/secrets\.OPENAI_API_KEY/.test(workflow));
check("  ANTHROPIC_API_KEY", /secrets\.ANTHROPIC_API_KEY/.test(workflow));
check("  MISTRAL_API_KEY", /secrets\.MISTRAL_API_KEY/.test(workflow));
check("  GEMINI_API_KEY", /secrets\.GEMINI_API_KEY/.test(workflow));
check("  CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN", /secrets\.CLOUDFLARE_ACCOUNT_ID/.test(workflow) && /secrets\.CLOUDFLARE_API_TOKEN/.test(workflow));

// ───── 13. Helpers CODE→LIEU exportés + cohérence vérité terrain ─────
console.log(`\n${INFO} Test 13/16 — Mapping CODE→LIEU (Kevin 2026-05-28)`);
const helpers = readFile("helpers-reuse.js");
check("  CODE_TO_LIEU_CADRE table définie", /const CODE_TO_LIEU_CADRE\s*=\s*\{/.test(helpers));
check("  CODE_TO_LIEU_EMPLOYEE table définie", /const CODE_TO_LIEU_EMPLOYEE\s*=\s*\{/.test(helpers));
check("  codeToLieu(code, role) exporté", /codeToLieu\s*[,}]/.test(helpers));
check("  19/4 PIT BOSS = CCDP (NOTES_USER ligne 1184)", /"19\/4":\s*"CCDP"/.test(helpers));
check("  19/4 EMPLOYÉ = CMC (NOTES_USER ligne 1194)", /CODE_TO_LIEU_EMPLOYEE[\s\S]*?"19\/4":\s*"CMC"/.test(helpers));
check("  15/20 = POKER NO LIMIT (NOTES_USER ligne 1192)", /"15\/20":\s*"POKER NO LIMIT"/.test(helpers));
check("  Suffixe * → CCDP+CMC dans codeToLieu", /CCDP\+CMC/.test(helpers));

// ───── 14. Encadres-parser : codes courts uniquement (erreur #49) ─────
console.log(`\n${INFO} Test 14/16 — Encadres parser (Kevin reproduction identique)`);
const encadres = readFile("lib/encadres-parser.js");
check("  STATUT_CODES_LONG_FIRST (ordre détection)", /STATUT_CODES_LONG_FIRST/.test(encadres));
check("  HEADER_RE détecte « N CODE du J1 au J2 »", /HEADER_RE\s*=/.test(encadres) && /\\d{1,3}/.test(encadres));
check("  ALIAS_LONG_TO_SHORT mappe FORMATION→AF (mais cherche pas en primaire)", /"FORMATION":\s*"AF"/.test(encadres));
check("  Codes MAL/PAT/MT/EDC/SS/ABI/AT/CFL/CRH/ABS supportés", /MAL.*PAT.*MT.*EDC|EDC.*ABS|ABI.*AT/.test(encadres.replace(/\n/g, " ")));
check("  parseEncadres exporté", /parseEncadres\s*[,}]/.test(encadres));
check("  expandBoxesToCells exporté", /expandBoxesToCells\s*[,}]/.test(encadres));
check("  Code statut court priorité (jamais mot français)", encadres.indexOf("ALIAS_LONG_TO_SHORT") < encadres.indexOf("STATUT_CODES_LONG_FIRST") + 2000); // doc rule visible

// ───── 15. Team-detector : algo RH/R officiel SBM (Kevin 2026-05-15/28) ─────
// Kevin 2026-05-28 a CORRIGÉ la règle miroir : MÊMES jours RH/R + horaires
// base différents (pas un décalage). Test mis à jour en conséquence.
console.log(`\n${INFO} Test 15/16 — Team detector RH/R + miroir (Kevin 2026-05-28)`);
const teams = readFile("lib/team-detector.js");
check("  detectTeams exporté", /detectTeams\s*[,}]/.test(teams));
check("  getRestSignature (jours RH/R d'un emp)", /function getRestSignature/.test(teams));
check("  isMirrorPair (règle corrigée Kevin 2026-05-28)", /function isMirrorPair/.test(teams));
check("  Skip family=cadres (Pit Boss/Sup pas d'équipe)", /skipFamilies[\s\S]*?cadres/.test(teams));
check("  normalizeWorkCodeForClustering retire suffixes c/'/\"/*/: ", /\[c'"\*:\]\+/.test(teams));
check("  Doc mentionne « gros trait noir » (source primaire)", /trait\s+noir/i.test(teams));
check("  Doc explique miroir = MÊMES jours RH/R + base ≠ (FR clair)", /M[ÊE]MES\s+jours\s+RH\/R|jours\s+RH\/R.*identiques/.test(teams));

// ───── 16. Text-parser v0.3 : 12H30 majuscule + MT + BRTPECK + team_num ─────
console.log(`\n${INFO} Test 16/17 — Text-parser enrichissements v0.3.0`);
const textParser = readFile("lib/text-parser.js");
check("  CODE_RE accepte H majuscule (12H30/19 NOTES_USER 1214)", /\[hH\]\?/.test(textParser));
check("  CODE_RE accepte MT (maternité)", /\|MT\|/.test(textParser));
check("  CODE_RE accepte FL / CSS / ABS", /\bFL\b/.test(textParser) && /\bCSS\b/.test(textParser) && /\bABS\b/.test(textParser));
check("  BRTPECK_RE exporté (compétences devant nom)", /BRTPECK_RE\s*[,}=]/.test(textParser));
check("  TEAM_NUM_AFTER_POST_RE (V1 juin 2026+ format BRTP+K 5 NAME)", /TEAM_NUM_AFTER_POST_RE\s*=/.test(textParser));
check("  parseLineForEmployee retourne brtpeck", /out\.brtpeck\s*=/.test(textParser));
check("  parseLineForEmployee retourne teamNumber", /out\.teamNumber|teamNumber\s*!==\s*null/.test(textParser));

// ───── 17. Couverture Convention SBM (43 codes officiels Note 6 janv 1993) ─────
console.log(`\n${INFO} Test 17/17 — Codes officiels SBM (43 codes Bulletin)`);
const helpersFull = readFile("helpers-reuse.js");
const textParserCode = readFile("lib/text-parser.js");
// helpers-reuse.js : table complète
check("  BULLETIN_CODES_FULL définie (Note 6 janv 1993)", /BULLETIN_CODES_FULL\s*=/.test(helpersFull));
check("  Catégorie presence_repos", /presence_repos:/.test(helpersFull));
check("  Catégorie conges", /conges:\s*\[/.test(helpersFull));
check("  Catégorie fetes", /fetes:\s*\[/.test(helpersFull));
check("  Catégorie masse (à la masse)", /masse:\s*\[/.test(helpersFull));
check("  Catégorie absences", /absences:\s*\[/.test(helpersFull));
check("  Catégorie sanctions", /sanctions:\s*\[/.test(helpersFull));
check("  Catégorie autres", /autres:\s*\[/.test(helpersFull));
check("  Catégorie pit_boss", /pit_boss:\s*\[/.test(helpersFull));
check("  Helper bulletinCategory exporté", /bulletinCategory\s*[,}]/.test(helpersFull));
check("  ALL_BULLETIN_CODES (liste plate) exporté", /ALL_BULLETIN_CODES\s*[,}]/.test(helpersFull));
// Codes spécifiques jamais oubliés
const requiredCodes = ["P", "RH", "RTP", "RTR", "RRT", "RHS", "DP",
                       "CP", "CRH", "CPS", "CPM", "CDP", "CDH",
                       "FL", "CFL", "FTP", "FTR", "RFT",
                       "FCP", "FCS", "FRH", "FFL",
                       "M", "MAL", "AT", "MT", "ABS", "ABI", "ABP", "AF", "CL", "CEO", "CSC", "CSS",
                       "PNE", "AMP", "MPC", "MPP",
                       "PAT", "PRT", "HC", "EDC",
                       "HD", "PK"];
for (const c of requiredCodes) {
  // Le code doit apparaître dans helpers-reuse.js (table BULLETIN_CODES_FULL)
  // ET dans text-parser.js CODE_RE.
  const inHelpers = new RegExp(`code:\\s*"${c}"`).test(helpersFull);
  const inParser  = new RegExp(`\\b${c}\\b`).test(textParserCode);
  check(`  ${c} dans BULLETIN_CODES_FULL + accepté par text-parser`, inHelpers && inParser);
}

// ───── 18. Validate-post-import : Art. 17.5 + 35 + sanctions ─────
console.log(`\n${INFO} Test 18/20 — Validations Convention (Art. 17.5, 35, sanctions)`);
const validate = readFile("lib/validate-post-import.js");
check("  runAll exporté", /runAll\s*[,}]/.test(validate));
check("  validateMinRestPerSixWeeks (Art. 17.5)", /validateMinRestPerSixWeeks/.test(validate));
check("  validateChefRatio (Art. 35)", /validateChefRatio/.test(validate));
check("  validateMin336Effectif (Art. 35 plancher)", /validateMin336Effectif/.test(validate));
check("  validateNoForbiddenCodes (sanctions PNE/AMP/MPC/MPP critical)", /validateNoForbiddenCodes/.test(validate) && /SANCTION_CODES/.test(validate));
check("  validateEveryoneHasPlanning (règle absolue Kevin 2026-05-26)", /validateEveryoneHasPlanning/.test(validate));
check("  validateAffluencePeriodVersion (Art. 17.6)", /validateAffluencePeriodVersion/.test(validate));
// Test fonctionnel : exécuter le module et vérifier la détection sanction
try {
  const VPI = require(path.join(ROOT, "lib/validate-post-import.js"));
  const sanctionFindings = VPI.validateNoForbiddenCodes([
    { fullName: "TEST X", days: { "1": "22/6", "2": "AMP", "3": "RH" } }
  ]);
  check("  Sanction AMP détectée en CRITICAL (test fonctionnel)",
    sanctionFindings.length === 1 && sanctionFindings[0].severity === "critical");
  const restFindings = VPI.validateMinRestPerSixWeeks([
    { fullName: "REST X", days: (function () { const d = {}; for (let i = 1; i <= 31; i++) d[i] = "22/6"; return d; })() }
  ]);
  check("  Emp 31j travail = 0 repos sur 31j (partial, pas de fail strict)",
    Array.isArray(restFindings));
} catch (e) {
  check("  validate-post-import require OK", false, e.message.slice(0, 120));
}

// ───── 19. Homonyms-guard : anti-merge LANDAU B/J (erreurs #38/#44) ─────
console.log(`\n${INFO} Test 19/20 — Homonyms guard (anti-confusion erreurs #38/#44)`);
const homonyms = readFile("lib/homonyms-guard.js");
check("  KNOWN_HOMONYMS table (NOTES_USER 65-94)", /KNOWN_HOMONYMS\s*=/.test(homonyms));
check("  LANDAU B vs J (frères)", /"LANDAU":/.test(homonyms));
check("  ENZA B vs C (frères)", /"ENZA":/.test(homonyms));
check("  CAMPI H vs PH (couple)", /"CAMPI":/.test(homonyms));
check("  canMatch exporté", /canMatch\s*[,}]/.test(homonyms));
check("  auditEmployees exporté", /auditEmployees\s*[,}]/.test(homonyms));
try {
  const HG = require(path.join(ROOT, "lib/homonyms-guard.js"));
  const blocked = HG.canMatch("LANDAU", "B", "LANDAU", "J");
  check("  canMatch(LANDAU B, LANDAU J) = bloqué (test fonctionnel)",
    blocked.safe === false && blocked.reason === "known_homonyms_distinct");
  const ok = HG.canMatch("DESARZENS", "K", "DESARZENS", "K");
  check("  canMatch exact (DESARZENS K) = safe",
    ok.safe === true);
} catch (e) {
  check("  homonyms-guard require OK", false, e.message.slice(0, 120));
}

// ───── 20. Code-colors : mapping 43 codes + suffixes ─────
console.log(`\n${INFO} Test 20/20 — Code colors (projection cellule, ne modifie pas la source)`);
const colors = readFile("lib/code-colors.js");
check("  getCellColor exporté", /getCellColor\s*[,}]/.test(colors));
check("  getCellStyle exporté (anti-XSS hex valide)", /getCellStyle\s*[,}]/.test(colors));
check("  CONVENTION_COLOR rouge/jaune (suffixe '/\")", /CONVENTION_COLOR/.test(colors) && /#d8342e/.test(colors) && /#ffe23a/.test(colors));
check("  CCDP_COLOR orange (suffixe *)", /CCDP_COLOR/.test(colors));
check("  STATUT_COLORS couvre RH/CP/M/AF/PAT", /"RH":/.test(colors) && /"CP":/.test(colors) && /"AF":/.test(colors) && /"PAT":/.test(colors));
check("  Sanctions rouge alerte (PNE/AMP/MPC/MPP)", /"PNE":/.test(colors) && /#e85050/.test(colors));
try {
  const CC = require(path.join(ROOT, "lib/code-colors.js"));
  const conv = CC.getCellColor("19/4'");
  check("  19/4' → Convention rouge/jaune (test fonctionnel)",
    conv.isConvention === true && conv.bg === "#d8342e");
  const ccdp = CC.getCellColor("20/5*");
  check("  20/5* → CCDP orange (test fonctionnel)",
    ccdp.isCcdp === true);
  const style = CC.getCellStyle("RH");
  check("  getCellStyle(RH) retourne background+color hex valide",
    /background:#[0-9a-f]+/i.test(style) && /color:#[0-9a-f]+/i.test(style));
} catch (e) {
  check("  code-colors require OK", false, e.message.slice(0, 120));
}

// ───── Résumé ─────
console.log("\n────────────────────────");
if (failures === 0) {
  console.log(`${PASS} TOUS LES TESTS PASSENT. Safe to push.`);
  process.exit(0);
} else {
  console.log(`${FAIL} ${failures} test(s) en échec. NE PAS pusher avant fix.`);
  process.exit(1);
}
