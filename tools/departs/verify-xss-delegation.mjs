// Preuve navigateur RÉEL (lesson #126) que le fix XSS de la grille Départs :
//  (1) rend un nom malveillant comme TEXTE inerte (aucun JS exécuté),
//  (2) la délégation d'événements dispatche toujours les bonnes actions.
// Sert le dossier via http.server local, Firebase échoue proprement (offline).
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.txt':'text/plain', '.json':'application/json', '.css':'text/css' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/' || p === '') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end('nf'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const port = server.address().port;
const base = `http://127.0.0.1:${port}/index.html`;

let pass = 0, fail = 0;
const ok = (c, m) => { (c ? pass++ : fail++); console.log((c ? '✅' : '❌') + ' ' + m); };

const browser = await chromium.launch();
const ctx = await browser.newContext();
// Bypasse la gate (identité + CGU) + admin — idempotent (lesson #150 : addInitScript
// se rejoue à chaque navigation, on ne réécrit que si absent).
await ctx.addInitScript(() => {
  if (!localStorage.getItem('cmc_dep_identity'))
    localStorage.setItem('cmc_dep_identity', JSON.stringify({ nom: 'TEST', prenom: 'Kevin', cgu: true }));
});
const page = await ctx.newPage();
const pageerrors = [];
page.on('pageerror', e => pageerrors.push(String(e)));
await page.goto(base, { waitUntil: 'load' });
await page.waitForTimeout(400);

// Injecte un board avec un NOM MALVEILLANT et re-render, puis mesure.
const PAYLOAD = `x');window.__pwned=1;//`;         // casse une string JS
const PAYLOAD2 = `<img src=x onerror="window.__pwned2=1">`; // injection HTML
const result = await page.evaluate(({ pl, pl2 }) => {
  window.__pwned = undefined; window.__pwned2 = undefined;
  window.__nameClicked = null; window.__cellEdited = null;
  // neutralise les prompts (editCell/editMark utilisent prompt) et trace les appels
  window.prompt = () => null;
  const origName = window.nameClick, origCell = window.editCell;
  window.nameClick = function (nm) { window.__nameClicked = nm; return origName && origName.apply(this, arguments); };
  window.editCell = function (nm, d) { window.__cellEdited = nm + '|' + d; return origCell && origCell.apply(this, arguments); };
  document.body.classList.add('admin'); // admin pour que les handlers agissent

  // Board de test injecté dans le moteur réel
  const id = '__xsstest';
  window.BOARDS[id] = {
    label: 'XSS TEST', year: 2026, monthIdx: 6, days: 3, kind: '',
    people: [
      { name: pl, codes: { 1: '20/5', 2: 'RH', 3: '19/4' } },
      { name: pl2, codes: { 1: '16/3', 2: '19/4', 3: 'RH' } },
    ],
  };
  window.switchBoard(id); // charge + render le board malveillant

  const grid = document.getElementById('grid');
  const nameCell = grid.querySelector('td.cNom[data-act="name"]');
  const codeCell = grid.querySelector('td[data-act="cell"]');
  return {
    pwned: window.__pwned, pwned2: window.__pwned2,
    // le nom doit apparaître comme TEXTE (escaped), jamais comme balise
    nameText: nameCell ? nameCell.textContent : null,
    nameHtmlHasImg: grid.innerHTML.includes('<img'),   // aucune vraie balise injectée
    nameDataNm: nameCell ? nameCell.getAttribute('data-nm') : null,
    codeDataNm: codeCell ? codeCell.getAttribute('data-nm') : null,
    codeDataD: codeCell ? codeCell.getAttribute('data-d') : null,
    hasNameCell: !!nameCell, hasCodeCell: !!codeCell,
  };
}, { pl: PAYLOAD, pl2: PAYLOAD2 });

ok(result.pwned === undefined, 'nom malveillant #1 (string-break) N\'exécute PAS de JS (window.__pwned indéfini)');
ok(result.pwned2 === undefined, 'nom malveillant #2 (<img onerror>) N\'exécute PAS de JS (window.__pwned2 indéfini)');
ok(result.nameHtmlHasImg === false, 'aucune balise <img> réelle injectée dans le DOM (rendu comme texte)');
ok(result.nameDataNm === PAYLOAD, 'data-nm contient le nom RÉEL décodé (lu via getAttribute, jamais exécuté)');
ok(result.hasNameCell && result.hasCodeCell, 'cellules nom + code rendues avec data-act');

// Délégation : cliquer une cellule de code déclenche editCell avec le bon nom+jour.
await page.evaluate(() => document.querySelector('td[data-act="cell"]').click());
const clicked = await page.evaluate(() => ({ cell: window.__cellEdited }));
ok(clicked.cell === PAYLOAD + '|' + result.codeDataD,
   'clic sur une cellule → editCell(nom, jour) via délégation (nom exact, pas d\'injection) : ' + clicked.cell);

// Délégation : cliquer un nom en mode "désignation chef" déclenche nameClick.
await page.evaluate(() => { window._chefDesignMode = true; document.querySelector('td.cNom[data-act="name"]').click(); });
const nc = await page.evaluate(() => window.__nameClicked);
ok(nc === PAYLOAD, 'clic sur un nom → nameClick(nom) via délégation : ' + nc);

ok(pageerrors.length === 0, 'aucune erreur JS runtime (' + pageerrors.length + ')');

await browser.close();
server.close();
console.log(`\nverify-xss-delegation : ${pass} OK / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
