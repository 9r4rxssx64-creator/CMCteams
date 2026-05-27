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

// ───── Résumé ─────
console.log("\n────────────────────────");
if (failures === 0) {
  console.log(`${PASS} TOUS LES TESTS PASSENT. Safe to push.`);
  process.exit(0);
} else {
  console.log(`${FAIL} ${failures} test(s) en échec. NE PAS pusher avant fix.`);
  process.exit(1);
}
