// v9.837 (Kevin 2026-07-01 « reproduit à l'identique partout DELTTRA, PRT, etc … ajoute
// aux légendes ») — vérifie que les codes SBM spéciaux sont (1) reconnus (CODES), (2)
// colorés à l'identique dans l'app (cmcCodeStatusBg) ET la page Départs (codeStyle) — même
// FAMILLE de couleur, (3) présents dans la légende vPlan. Empêche qu'un code (DELTTRA
// bleu, DEPL beige, MT gris…) soit washé en blanc ou absent de la légende. Câblé test:ci.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));

// famille attendue par code (mêmes pour app + page)
const FAM = {
  DELTTRA: 'bleu', DELPT: 'beige', DEPL: 'beige', DEP: 'beige',
  PRT: 'jaune', RRT: 'jaune', RTP: 'jaune', RTR: 'jaune',
  EDC: 'gris', MT: 'gris', AT: 'gris', SS: 'gris', CL: 'gris', ABS: 'gris', ABI: 'gris', CSS: 'gris',
  CRH: 'rose'
};
const CODES_LIST = Object.keys(FAM);
// classifie une couleur (rgba app ou hex page) en famille par sa teinte dominante
function famOf(col) {
  if (!col) return 'none';
  let r, g, b;
  const m = String(col).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) { r = +m[1]; g = +m[2]; b = +m[3]; }
  else { const h = String(col).replace('#', ''); if (h.length < 6) return 'other'; r = parseInt(h.slice(0,2),16); g = parseInt(h.slice(2,4),16); b = parseInt(h.slice(4,6),16); }
  if (Math.abs(r-g) < 22 && Math.abs(g-b) < 22 && Math.abs(r-b) < 22) return 'gris';       // gris ~équilibré
  if (b > r + 25 && b > g + 10) return 'bleu';        // bleu dominant
  if (r > 180 && g > 150 && b < 140 && Math.abs(r-g) < 60) return 'jaune'; // jaune (r+g haut, b bas)
  if (r > 170 && g > 140 && b > 120 && r >= g && g >= b) return 'beige';   // beige (chaud clair, r≥g≥b)
  if (r > 180 && b > 140 && r > g) return 'rose';     // rose (r haut, b moyen, g plus bas)
  return 'autre:' + r + ',' + g + ',' + b;
}

async function main() {
  const text = readFileSync(resolve(__dirname, 'fixtures/juillet-2026-v1.txt'), 'utf8');
  const geo = JSON.parse(readFileSync(resolve(__dirname, 'fixtures/juillet-2026-v1.geo.json'), 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const tests = []; const t = (l, ok) => tests.push({ l, ok: ok === true });

  // ── APP : couleurs + CODES + légende ──
  const pa = await ctx.newPage();
  await pa.addInitScript(() => { window.__CMC_NO_SEED = true; });
  await pa.goto('file://' + resolve(__dirname, '../index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await pa.waitForFunction(() => typeof window.doImport === 'function' && window.A && Array.isArray(A.employees), { timeout: 20000 });
  await pa.evaluate(() => { A.user = A.employees.find(e => e.id === 'U11804'); A.year = 2026; A.month = 6; A.overrides = A.overrides || {}; delete A.overrides['2026-6']; });
  const app = await pa.evaluate(async ({ text, geo, codes }) => {
    window._cmcPdfGeometry = geo; window._lastImportText = text;
    window.doImport(); await new Promise(r => setTimeout(r, 2200));
    const status = {}, inCODES = {};
    codes.forEach(c => { status[c] = cmcCodeStatusBg(c); inCODES[c] = !!(CODES[c] && CODES[c].l); });
    A.showLeg = true; const html = vPlan();
    const inLeg = {}; codes.forEach(c => { inLeg[c] = new RegExp('>' + c + '<').test(html); });
    return { status, inCODES, inLeg, conv: /Convention \(repos travaillé\)/.test(html) };
  }, { text, geo, codes: CODES_LIST });

  // ── PAGE Départs : codeStyle ──
  const pp = await ctx.newPage();
  await pp.goto('file://' + resolve(__dirname, '../tools/departs/index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await pp.waitForFunction(() => typeof window.codeStyle === 'function', { timeout: 20000 });
  const page = await pp.evaluate((codes) => { const o = {}; codes.forEach(c => { const s = codeStyle(c); o[c] = s ? s.bg : null; }); return o; }, CODES_LIST);

  CODES_LIST.forEach(c => {
    const fa = famOf(app.status[c]), fp = famOf(page[c]), exp = FAM[c];
    t(c + ' : reconnu dans CODES (→ légende)', app.inCODES[c]);
    t(c + ' : présent dans la légende vPlan', app.inLeg[c]);
    t(c + ' : app couleur = ' + exp + ' (mesuré ' + fa + ')', fa === exp);
    t(c + ' : page couleur = ' + exp + ' (mesuré ' + fp + ')', fp === exp);
    t(c + ' : app ≡ page (à l\'identique)', fa === fp);
  });
  t('légende contient le repère Convention (fond rouge)', app.conv);

  await browser.close();
  let pass = 0, fail = 0;
  tests.forEach(tt => { if (!tt.ok) { console.log('  ❌ ' + tt.l); fail++; } else pass++; });
  console.log('\n' + (fail === 0 ? '✅ CODES & LÉGENDES à l\'identique' : '❌ KO') + '  PASS:' + pass + ' FAIL:' + fail);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
