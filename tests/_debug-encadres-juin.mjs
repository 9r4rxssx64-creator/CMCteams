// Debug ciblé : appeler EncadresParser sur capture JUIN_2026_V1 et lister
// chaque encadré + les noms capturés. Objectif : voir pourquoi CAISSON JC
// et LANTERI E sont attrapés par l'encadré CP alors qu'ils travaillent.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');
const CAPTURE_PATH = resolve(__dirname, '../tools/planning-parser-tester/captures/_decrypted/1779981740200___JUIN_2026_V1.pdf.json');

async function main(){
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('file://' + INDEX_PATH, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.EncadresParser === 'object', { timeout: 20000 });

  const capture = JSON.parse(readFileSync(CAPTURE_PATH, 'utf-8'));
  const passA = capture.result.passes['0'];

  const out = await page.evaluate(({ pages }) => {
    const r = { boxes: [] };
    try {
      const encRes = window.EncadresParser.parseEncadresGeometric(pages, 30);
      (encRes.boxes || []).forEach(b => {
        r.boxes.push({
          code: b.code,
          from: b.from,
          to: b.to,
          headerX: b.headerX || null,
          headerY: b.headerY || null,
          count: b.names ? b.names.length : 0,
          names: (b.names || []).map(n => ({ fullName: n.fullName, x: n.x, y: n.y, initials: n.initials })).slice(0, 30)
        });
      });
    } catch(e){ r.error = e.message; }
    return r;
  }, { pages: passA.pages });

  if(out.error){ console.error('ERR:', out.error); process.exit(2); }

  console.log('=== ENCADRÉS détectés ===');
  out.boxes.forEach((b, i) => {
    console.log('\n[' + i + '] code=' + b.code + ' du ' + b.from + ' au ' + b.to + ' header(x=' + b.headerX + ', y=' + b.headerY + ') count=' + b.count);
    b.names.forEach(n => {
      console.log('  • ' + n.fullName + ' (x=' + Math.round(n.x) + ', y=' + Math.round(n.y) + ')');
    });
  });

  await browser.close();
}
main().catch(e => { console.error('FATAL:', e.stack || e); process.exit(2); });
