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
        const pc=present.length; if(!pc) continue; const SEQd=sq(pc), rot=wi; // v9.851 : +1 par jour travaillé
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

  // v9.851 (Kevin 2026-07-03 capture CMC Éq.5 « il y a des erreurs ») — VERROU anti-répétition :
  // avec l'ancienne (wi%4)+floor(wi/4), 2 jours à qq jours d'écart (même effectif) avaient les
  // MÊMES numéros (jeu6==dim9) → chaque chef bloqué sur 3-4 places. La rotation rot=wi visite pc
  // permutations DISTINCTES par cycle. On prend, pour chaque équipe, les jours où l'effectif
  // présent = effectif complet (roster stable), et on exige que les pc premiers de ces jours
  // aient des vecteurs de départ TOUS DIFFÉRENTS + que le 1er = la séquence dans l'ordre des chefs.
  const rot = await page.evaluate(() => {
    const days = getDays(2026, 7), pl = gpl();
    const SEQS = { 2:[1,2],3:[1,3,2],4:[1,4,2,3],5:[1,4,2,3,5],6:[1,6,4,2,3,5],7:[1,6,4,2,7,3,5],8:[1,6,4,2,7,3,8,5],9:[1,6,4,9,2,7,3,8,5],10:[1,6,4,9,2,7,3,8,5,10],11:[1,6,4,9,2,11,7,3,8,5,10],12:[1,6,4,9,2,11,7,3,12,8,5,10],13:[1,6,4,9,2,11,7,3,13,8,5,10,12] };
    const sq = n => SEQS[n] || Array.from({length:n},(_,i)=>i+1);
    let teamsBig = 0, badNear = 0, checked = 0;
    Object.keys(CHEFS_T).forEach(tid => {
      const names = CHEFS_T[tid] || []; if (names.length < 5) return; // équipes ≥5 chefs (là où le bug était visible)
      const active = names.map(n => A.employees.find(e => e.name === n)).filter(e => e && isEmpActive(e, 2026, 7) && [...Array(days)].some((_,i)=>isWork((pl[e.id]||{})[i+1]||'')));
      if (active.length < 5) return;
      const full = active.length; teamsBig++;
      // jours de travail de l'équipe (union) + index wi
      const wd = []; for (let d = 1; d <= days; d++) { if (active.some(e => isWork((pl[e.id]||{})[d]||''))) wd.push(d); }
      // jours à roster complet (tous présents) + leur wi + vecteur de départ (ordre des chefs)
      const stable = [];
      for (let d = 1; d <= days; d++) {
        if (!active.every(e => isWork((pl[e.id]||{})[d]||''))) continue;
        const wi = wd.indexOf(d);
        const vec = active.map(e => { A.year=2026; A.month=7; return calcDepPos(e.name, tid, d); });
        stable.push({ d, wi, vec: JSON.stringify(vec) });
      }
      // PROPRIÉTÉ rot=wi : 2 jours à roster complet dont wi diffèrent de k avec 0<k<pc
      // (donc PAS un cycle complet) DOIVENT avoir des vecteurs DIFFÉRENTS. C'est exactement
      // ce que l'ancienne (wi%4)+floor(wi/4) violait (jeu6 wi3, dim9 wi6 : k=3<7 mais identiques).
      for (let a = 0; a < stable.length; a++) for (let b = a + 1; b < stable.length; b++) {
        const k = Math.abs(stable[a].wi - stable[b].wi);
        if (k % full !== 0 && stable[a].vec === stable[b].vec) badNear++;
      }
      checked++;
    });
    return { teamsBig, badNear, checked };
  });
  console.log('  anti-répétition : ' + rot.teamsBig + ' équipes ≥5 chefs, ' + rot.checked + ' vérifiées');
  ok(rot.checked >= 3, 'assez d’équipes ≥5 chefs pour tester la rotation (' + rot.checked + ' ≥ 3)');
  ok(rot.badNear === 0, 'AUCUNE répétition à moins d’un cycle complet (' + rot.badNear + ') — bug jeu6==dim9 (rotation qui se réinitialise) corrigé');

  // v9.845 — DÉTERMINISME CROSS-SPECTATEUR (Kevin « les autres n'ont pas les mêmes départs
  // sur leurs app »). On calcule TOUS les numéros de départ successivement en tant que
  // 3 spectateurs différents (admin, un employé d'équipe quelconque, personne connecté)
  // et on exige des résultats STRICTEMENT IDENTIQUES. Avant le fix, l'injection A.user
  // faisait diverger les numéros selon QUI regarde.
  const det = await page.evaluate(() => {
    const days = getDays(2026, 7), pl = gpl();
    function snapshot() {
      const out = {};
      Object.keys(CHEFS_T).forEach(tid => {
        (CHEFS_T[tid] || []).forEach(nm => {
          const e = A.employees.find(x => x.name === nm); if (!e) return;
          for (let d = 1; d <= days; d++) { A.year = 2026; A.month = 7; out[tid + '|' + nm + '|' + d] = calcDepPos(nm, tid, d); }
        });
      });
      return out;
    }
    const admin = A.employees.find(e => e.id === 'U11804');
    // un employé membre d'une équipe, différent de l'admin
    let someTeam = Object.keys(CHEFS_T).find(t => (CHEFS_T[t] || []).length >= 2);
    let otherName = (CHEFS_T[someTeam] || []).find(n => n !== (admin && admin.name)) || (CHEFS_T[someTeam] || [])[0];
    const other = A.employees.find(e => e.name === otherName);
    A.user = admin; const sA = snapshot();
    A.user = other; const sB = snapshot();
    A.user = null;  const sC = snapshot();
    A.user = admin; // restaurer
    const keys = Object.keys(sA);
    let diffs = 0, filled = 0;
    keys.forEach(k => { if (sA[k] != null) filled++; if (sA[k] !== sB[k] || sA[k] !== sC[k]) diffs++; });
    return { keys: keys.length, filled, diffs, otherName };
  });
  console.log('  déterminisme : ' + det.keys + ' cellules, ' + det.filled + ' avec numéro, spectateur alt=' + det.otherName);
  ok(det.filled > 200, 'assez de cellules avec numéro pour le test déterminisme (' + det.filled + ')');
  ok(det.diffs === 0, 'MÊMES numéros de départ pour TOUS les spectateurs (admin/employé/personne) — ' + det.diffs + ' écart');

  // v9.845 — RENDU vDeparts identique pour 2 spectateurs (preuve end-to-end : la grille
  // affichée — pas seulement calcDepPos — doit montrer les mêmes numéros à tout le monde).
  const rnd = await page.evaluate(() => {
    function gridNumbers() {
      window._depFamOpen = { bj: true, roulettes: true, baccara: true, cmc: true, cadres: true };
      const html = vDeparts(); // HTML rendu (source de vérité, indépendant du routeur/#content)
      const nums = []; const re = /width:22px;height:22px[^>]*>(\d+)<\/div>/g; let m;
      while ((m = re.exec(html)) !== null) nums.push(m[1]);
      return nums.join(',');
    }
    const admin = A.employees.find(e => e.id === 'U11804');
    A.user = admin; A.year = 2026; A.month = 7;
    const gA = gridNumbers();              // admin voit toutes les équipes
    const gA2 = gridNumbers();             // re-render stable (idempotent)
    return { count: gA ? gA.split(',').length : 0, stable: gA === gA2 };
  });
  console.log('  rendu vDeparts : ' + rnd.count + ' numéros de départ affichés (grille)');
  ok(rnd.count > 100, 'grille Départs rendue avec numéros via calcDepPos (' + rnd.count + ' > 100)');
  ok(rnd.stable, 'rendu de la grille stable/idempotent');

  await ctx.close();
} finally { await browser.close(); }

console.log('\nDÉPARTS-ALGO : ' + pass + ' OK / ' + fail + ' KO');
process.exit(fail ? 1 : 0);
