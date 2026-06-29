// Régression v9.834 — ALGORITHME DES NUMÉROS DE DÉPART (Kevin 2026-06-29
// « vérifie les numéros des départs pour chacun, l'algorithme, les horaires »).
// Garantit que calcDepPos (app) == compute() de la page Départs (v1.11.1 validée Kevin)
// sur le VRAI import : (a) AUCUN chef qui travaille ne reste sans numéro (bug « manque
// les départs à partir du 16 ») ; (b) AUCUN numéro fantôme > nb de chefs présents ;
// (c) app == page sur CHAQUE cellule. Câblé dans test:ci.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const PDFJS = readFileSync(resolve(root, 'node_modules/pdfjs-dist/build/pdf.min.js'));
const PDFW = readFileSync(resolve(root, 'node_modules/pdfjs-dist/build/pdf.worker.min.js'));

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const browser = await chromium.launch({ headless: true });
try {
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  await ctx.route(/cdnjs\.cloudflare\.com\/.*pdf\.min\.js/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: PDFJS }));
  await ctx.route(/cdnjs\.cloudflare\.com\/.*pdf\.worker\.min\.js/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: PDFW }));
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.__CMC_NO_SEED = true; });
  await page.goto('file://' + resolve(root, 'index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.handleFileImport === 'function' && window.A && Array.isArray(A.employees), { timeout: 20000 });
  await page.evaluate(() => { A.user = A.employees.find(e => e.id === 'U11804'); A.year = 2026; A.month = 7; A.overrides = A.overrides || {}; delete A.overrides['2026-7']; sv('import'); });
  const b64 = readFileSync(resolve(root, 'tests/fixtures/aout-2026-v1.pdf')).toString('base64');
  await page.evaluate(async ({ b64 }) => {
    const bin = atob(b64); const arr = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    const file = new File([arr], 'aout.pdf', { type: 'application/pdf' });
    const inp = document.getElementById('impFile'); const dt = new DataTransfer(); dt.items.add(file); inp.files = dt.files;
    document.getElementById('impY').value = '2026'; document.getElementById('impM').value = '7';
    handleFileImport(inp);
  }, { b64 });
  await page.waitForFunction(() => { const ov = (A.overrides && A.overrides['2026-7']) || null; return ov && Object.keys(ov).filter(id => ov[id] && Object.keys(ov[id]).length > 0).length > 50; }, { timeout: 45000 }).catch(() => {});
  await page.evaluate(() => { try { _cmcFinalGeometricFill(2026, 7); } catch (_) {} });

  const out = await page.evaluate(() => {
    const days = getDays(2026, 7), pl = gpl();
    const SEQS = { 2:[1,2],3:[1,3,2],4:[1,4,2,3],5:[1,4,2,3,5],6:[1,6,4,2,3,5],7:[1,6,4,2,7,3,5],8:[1,6,4,2,7,3,8,5],9:[1,6,4,9,2,7,3,8,5],10:[1,6,4,9,2,7,3,8,5,10],11:[1,6,4,9,2,11,7,3,8,5,10],12:[1,6,4,9,2,11,7,3,12,8,5,10],13:[1,6,4,9,2,11,7,3,13,8,5,10,12] };
    const sq = n => SEQS[n] || Array.from({length:n},(_,i)=>i+1);
    // Algo PAGE (compute v1.11.1) — référence validée par Kevin (off=0)
    function pageDeps(chefEmps) {
      const active = chefEmps.filter(e => { for(let d=1;d<=days;d++) if(isWork((pl[e.id]||{})[d]||'')) return true; return false; });
      const wd = []; for(let d=1;d<=days;d++){ for(const e of active){ if(isWork((pl[e.id]||{})[d]||'')){ wd.push(d); break; } } }
      const baseOf = {}; active.forEach((e,ai)=>baseOf[e.name]=ai);
      const deps = {}; active.forEach(e=>deps[e.name]={});
      for(let d=1;d<=days;d++){ const wi=wd.indexOf(d); if(wi<0) continue;
        const present = active.filter(e=>isWork((pl[e.id]||{})[d]||'')).sort((a,b)=>baseOf[a.name]-baseOf[b.name]);
        const pc=present.length; if(!pc) continue; const SEQd=sq(pc), rot=(wi%4)+Math.floor(wi/4);
        present.forEach((e,j)=>deps[e.name][d]=SEQd[(((rot+j)%pc)+pc)%pc]); }
      return deps;
    }
    let teamsChecked = 0, nullWorks = 0, phantom = 0, mismatch = 0, totalCells = 0, withNumber = 0;
    Object.keys(CHEFS_T).forEach(tid => {
      const names = CHEFS_T[tid] || []; if (!names.length) return;
      const chefEmps = names.map(n => A.employees.find(e => e.name === n)).filter(e => e && isEmpActive(e, 2026, 7) && [...Array(days)].some((_,i)=>isWork((pl[e.id]||{})[i+1]||'')));
      if (chefEmps.length < 2) return; teamsChecked++;
      const pg = pageDeps(chefEmps);
      chefEmps.forEach(e => { for (let d=1;d<=days;d++){ const c=(pl[e.id]||{})[d]||''; if(!isWork(c)) continue; totalCells++;
        A.year=2026; A.month=7; const ap = calcDepPos(e.name, tid, d); const pgv = pg[e.name] && pg[e.name][d];
        const present = chefEmps.filter(x=>isWork((pl[x.id]||{})[d]||'')).length;
        if (ap != null) withNumber++;
        if (ap == null && pgv != null) nullWorks++;
        if (ap != null && ap > present) phantom++;
        if (ap != null && pgv != null && ap !== pgv) mismatch++;
      }});
    });
    return { teamsChecked, nullWorks, phantom, mismatch, totalCells, withNumber };
  });

  console.log('DÉPARTS — algo calcDepPos vs page compute() (Août 2026, vrai import) :');
  console.log('  ' + out.teamsChecked + ' équipes ≥2 chefs · ' + out.totalCells + ' cellules travaillées · ' + out.withNumber + ' avec numéro');
  ok(out.teamsChecked >= 20, 'assez d’équipes vérifiées (' + out.teamsChecked + ' ≥ 20)');
  ok(out.totalCells > 1000, 'volume de cellules vérifié (' + out.totalCells + ' > 1000)');
  ok(out.nullWorks === 0, 'AUCUN chef travaillant sans numéro de départ (' + out.nullWorks + ') — bug « manque les départs à partir du 16 »');
  ok(out.phantom === 0, 'AUCUN numéro fantôme > nb chefs présents (' + out.phantom + ')');
  ok(out.mismatch === 0, 'app == page sur CHAQUE cellule (' + out.mismatch + ' écart)');
  ok(out.withNumber === out.totalCells, 'TOUT chef qui travaille a un numéro (' + out.withNumber + '/' + out.totalCells + ')');
  await ctx.close();
} finally { await browser.close(); }

console.log('\nDÉPARTS-ALGO : ' + pass + ' OK / ' + fail + ' KO');
process.exit(fail ? 1 : 0);
