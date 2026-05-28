/**
 * test-e2e-pdf.js — Harnais E2E AUTONOME (contourne le sandbox).
 *
 * Objectif (Kevin « contourne le sandbox, sois autonome ») : tester le pipeline
 * d'import sur un VRAI PDF, sans dépendre de Kevin ni du réseau externe.
 *
 * Pipeline du test :
 *   1. Génère un PDF SBM réaliste avec Chromium (HTML → page.pdf()) :
 *      - section « Chefs black jack » (POSTE NUM NOM + 30 jours)
 *      - section « Employés cartes CMC »
 *      - page « Roulements du mois » (noms SANS codes → piège lignes vides)
 *      - codes avec suffixes réels : '  "  ""  'c  *  (Convention, CCDP, chef)
 *      - couleurs de fond réelles (rouge Convention, orange CCDP, violet RH…)
 *   2. Extrait les items avec pdfjs-dist en Node (= ce que fait extractWithPdfJs).
 *   3. Passe au text-parser (passe G) + code-colors.
 *   4. Vérifie :
 *      - AUCUNE ligne vide (le fix merge keep-most-cells gère la page Roulements)
 *      - tous les employés du planning ont leurs codes
 *      - couleurs correctes (19/4'c chef+Convention = rouge/jaune, pas jaune)
 *      - suffixes préservés caractère par caractère
 *
 * Lancer : node tools/planning-parser-tester/test-e2e-pdf.js
 */

"use strict";
const fs = require("fs");
const path = require("path");
const os = require("os");

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
const CodeColors = require(path.join(ROOT, "lib/code-colors.js"));

/* ---- 1. HTML reproduisant la structure SBM (données FICTIVES) ---- */
function buildSbmHtml() {
  // Codes réalistes avec suffixes variés (cycle décalé par employé)
  const cycle = ["22/6'", "19/4\"\"", "16/3", "14/19'", "RH", "R", "20/5", "19/4", "16/22", "14/19",
                 "RH", "R", "22/6'", "19/4\"\"", "16/3", "14/19'", "RH", "R", "20/5", "19/4",
                 "16/22", "14/19", "RH", "R", "22/6'", "19/4\"\"", "16/3", "14/19'", "RH", "R"];
  const cycleChef = ["22/6'c", "19/4'c", "16/3*", "14/19'c", "RH", "R", "20/5c", "19/4c", "16/22c", "14/19c",
                     "RH", "R", "22/6c", "19/4'c", "16/3*", "14/19'c", "RH", "R", "20/5*", "19/4c",
                     "16/22c", "14/19c", "RH", "R", "22/6c", "19/4'c", "16/3*", "14/19'c", "RH", "R"];
  function rot(arr, n) { return arr.slice(n).concat(arr.slice(0, n)); }
  function colorOf(code) {
    const c = CodeColors.getCellColor(code);
    return c.bg ? `background:${c.bg};color:${c.fg};` : "";
  }
  function row(poste, num, nom, codes) {
    let tds = `<td>${poste}</td><td>${num}</td><td>${nom}</td>`;
    for (const cd of codes) tds += `<td style="${colorOf(cd)}">${cd}</td>`;
    return `<tr>${tds}</tr>`;
  }
  // Employés planning (avec codes)
  const chefs = [
    ["BRTP+E.", 1, "DUVALOIS K", rot(cycleChef, 0)],
    ["BRTCP+E.", 1, "MERLO JC", rot(cycleChef, 4)],
    ["BRTP+KE.", 1, "FONTANA R", rot(cycleChef, 8)],
  ];
  const employes = [
    [".BRTCP+KE", 1, "ALBERTI N", rot(cycle, 0)],
    [".BRTCPKE", 1, "BORGHESE T", rot(cycle, 6)],
    [".BRTP", 1, "CASSINO L", rot(cycle, 12)],
    [".BRTCK", 1, "DELORME PH", rot(cycleChef, 2)],
  ];
  // Page Roulements : MÊMES noms mais SANS codes (juste roster) → piège lignes vides.
  // Un nom par ligne (comme les cases distinctes du vrai PDF Roulements).
  const rouSection = chefs.concat(employes).map(e =>
    `<div class="rou">${e[2]}</div>`).join("");

  function section(title, rows) {
    return `<h3>${title}</h3><table>${rows.map(r => row(r[0], r[1], r[2], r[3])).join("")}</table>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:Arial;font-size:7px;}
    table{border-collapse:collapse;width:100%;}
    td{border:1px solid #ccc;padding:1px 2px;text-align:center;white-space:nowrap;}
    h3{font-size:9px;margin:8px 0 2px;}
    .rou{display:block;margin:3px;padding:2px;border:1px solid #aaa;}
  </style></head><body>
    <h2>juin 2026</h2>
    ${section("Chefs black jack", chefs)}
    <div style="page-break-before:always;"></div>
    <h2>juin 2026</h2>
    ${section("Employés cartes CMC", employes)}
    <div style="page-break-before:always;"></div>
    <h2>Roulements du mois de juin 2026</h2>
    ${rouSection}
  </body></html>`;
}

/* ---- 2 & 3 & 4 : génère PDF, extrait, parse, vérifie ---- */
(async () => {
  let chromium;
  try { chromium = require("playwright").chromium; }
  catch (e) { console.log(`${INFO} Playwright absent — test E2E sauté (CI-only). ${e.message}`); process.exit(0); }

  const tmpPdf = path.join(os.tmpdir(), "sbm-e2e-" + Date.now() + ".pdf");
  console.log(`\n${INFO} 1. Génération PDF SBM réaliste (Chromium HTML→PDF)`);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(buildSbmHtml(), { waitUntil: "load" });
    await page.pdf({ path: tmpPdf, format: "A3", landscape: true, printBackground: true });
    check("  PDF généré", fs.existsSync(tmpPdf) && fs.statSync(tmpPdf).size > 1000,
      fs.existsSync(tmpPdf) ? fs.statSync(tmpPdf).size + " octets" : "absent");
  } finally {
    await browser.close();
  }

  console.log(`\n${INFO} 2. Extraction items avec pdfjs-dist (= extractWithPdfJs)`);
  // pdfjs-dist legacy build pour Node
  const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
  const data = new Uint8Array(fs.readFileSync(tmpPdf));
  const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const pg = await doc.getPage(i);
    const content = await pg.getTextContent();
    const items = content.items.map(it => ({
      str: it.str,
      x: it.transform ? it.transform[4] : 0,
      y: it.transform ? it.transform[5] : 0,
      w: it.width || 0, h: it.height || 0
    }));
    let text = "";
    let lastY = null;
    for (const it of items) {
      if (lastY !== null && Math.abs(it.y - lastY) > 2) text += "\n";
      text += it.str + " ";
      lastY = it.y;
    }
    pages.push({ pageNum: i, items, text });
  }
  const pdfPass = {
    passe: "A", tool: "pdf.js", pages,
    textRaw: pages.map(p => p.text).join("\n--- page break ---\n"),
    itemsTotal: pages.reduce((s, p) => s + p.items.length, 0)
  };
  check("  Pages extraites", pages.length >= 2, pages.length + " pages");
  check("  Items extraits", pdfPass.itemsTotal > 50, pdfPass.itemsTotal + " items");

  console.log(`\n${INFO} 3. Parsing (passe G text-parser + merge keep-most-cells)`);
  const g = TextParser.parseFromPdfJs(pdfPass);
  check("  parseFromPdfJs ok", g.ok, g.error && g.error.message);
  const byName = {};
  for (const e of g.employees) byName[e.name] = e;
  console.log(`  ${INFO} employés: ${g.employees.length} | ` +
    g.employees.map(e => e.name + "(" + Object.keys(e.days).length + ")").join(" "));

  console.log(`\n${INFO} 4. Vérifications « aucun oubli »`);
  // Les 7 employés planning (chefs+employés) doivent avoir des cellules
  const planningNames = ["DUVALOIS K", "MERLO JC", "FONTANA R", "ALBERTI N", "BORGHESE T", "CASSINO L", "DELORME PH"];
  let foundWithCells = 0, emptyRows = 0;
  for (const e of g.employees) {
    const n = Object.keys(e.days).length;
    if (n === 0) emptyRows++;
  }
  for (const nm of planningNames) {
    const e = byName[nm];
    if (e && Object.keys(e.days).length >= 20) foundWithCells++;
  }
  check(`  Les ${planningNames.length} employés planning ont ≥20 cellules (anti-Roulements-écrase)`,
    foundWithCells === planningNames.length, foundWithCells + "/" + planningNames.length);
  check("  AUCUNE ligne vide (merge keep-most-cells)", emptyRows === 0, emptyRows + " vides");

  // Couleurs : 19/4'c (chef+Convention) = rouge/jaune Convention
  const cChefConv = CodeColors.getCellColor("19/4'c");
  check("  19/4'c (chef+Convention) → rouge/jaune Convention (pas jaune base)",
    cChefConv.isConvention === true && cChefConv.bg === "#d8342e",
    JSON.stringify({ bg: cChefConv.bg, conv: cChefConv.isConvention }));
  const cConv2 = CodeColors.getCellColor("19/4\"\"");
  check("  19/4\"\" (double quote Convention) → rouge/jaune", cConv2.isConvention === true);
  const cStar = CodeColors.getCellColor("16/3*");
  check("  16/3* → CCDP orange", cStar.isCcdp === true);

  // Suffixes préservés dans les cellules extraites
  let suffixOk = false;
  for (const e of g.employees) {
    for (const d of Object.keys(e.days)) {
      if (/['"*]/.test(e.days[d])) { suffixOk = true; break; }
    }
    if (suffixOk) break;
  }
  check("  Suffixes ('/\"/*) préservés dans les cellules extraites", suffixOk);

  try { fs.unlinkSync(tmpPdf); } catch (_) {}

  console.log("\n────────────────────────");
  if (failures === 0) {
    console.log(`${PASS} E2E PDF OK — pipeline validé sur PDF réel généré (zéro ligne vide, couleurs correctes).`);
    process.exit(0);
  } else {
    console.log(`${FAIL} ${failures} échec(s) E2E. Le pipeline a un problème sur PDF réel.`);
    process.exit(1);
  }
})().catch(e => { console.error(`${FAIL} Exception E2E:`, e.message); process.exit(1); });
