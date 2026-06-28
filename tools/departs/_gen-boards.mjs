// Génère les boards de la page Départs à partir des VRAIS PDF (via le pipeline
// d'import de l'app, parser géométrique validé). Sortie : tools/departs/boards-gen.js
//   window.DEPARTS_GEN = { generatedAt, months:[{key,label,monthIdx,year,days}],
//                          boards:{ id:{label,month,year,monthIdx,days,fam,people:[{name,codes}]} },
//                          mirror:{ id:idMiroir } }
// Usage: node tools/departs/_gen-boards.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', '..');
const PDFJS = readFileSync(resolve(root, 'node_modules/pdfjs-dist/build/pdf.min.js'));
const PDFW = readFileSync(resolve(root, 'node_modules/pdfjs-dist/build/pdf.worker.min.js'));
const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

async function importMonth(browser, pdfRel, year, monthIdx) {
  const pdfBytes = readFileSync(resolve(root, pdfRel));
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/cdnjs\.cloudflare\.com\/.*pdf\.min\.js/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: PDFJS }));
  await ctx.route(/cdnjs\.cloudflare\.com\/.*pdf\.worker\.min\.js/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: PDFW }));
  const page = await ctx.newPage();
  await page.goto('file://' + resolve(root, 'index.html'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.handleFileImport === 'function' && window.A && Array.isArray(A.employees), { timeout: 20000 });
  await page.evaluate(({ y, m }) => { A.user = A.employees.find(e => e.id === 'U11804'); A.year = y; A.month = m; A.overrides = A.overrides || {}; delete A.overrides[y + '-' + m]; if (typeof sv === 'function') sv('import'); }, { y: year, m: monthIdx });
  const b64 = pdfBytes.toString('base64');
  await page.evaluate(async ({ b64, name, y, m }) => {
    const bin = atob(b64); const arr = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    const file = new File([arr], name, { type: 'application/pdf' });
    const inp = document.getElementById('impFile'); const dt = new DataTransfer(); dt.items.add(file); inp.files = dt.files;
    const sy = document.getElementById('impY'); if (sy) sy.value = String(y); const sm = document.getElementById('impM'); if (sm) sm.value = String(m);
    handleFileImport(inp);
  }, { b64, name: pdfRel.split('/').pop(), y: year, m: monthIdx });
  await page.waitForFunction((key) => { const ov = (window.A && A.overrides && A.overrides[key]) || null; return ov && Object.keys(ov).filter(id => ov[id] && Object.keys(ov[id]).length > 0).length > 50; }, year + '-' + monthIdx, { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(3000); // laisse la passe géométrique différée (900ms) + détection équipes finir
  const out = await page.evaluate(({ key, year, monthIdx, MOIS }) => {
    const ov = A.overrides[key] || {};
    const days = new Date(year, monthIdx + 1, 0).getDate();
    const ABS_TEAMS = { conges: 'Congés', maladie: 'Maladie', formation: 'Formation', deplacement: 'Déplacement' };
    const famLabel = { bj: 'BJ', roulettes: 'Roul.', cmc: 'CMC', amenage: 'CMC aménagé', baccara: 'CMC' };
    // 1er code de travail (pour le libellé horaire)
    const ABS = { RH:1,R:1,CP:1,M:1,MAL:1,AF:1,AT:1,PAT:1,ABI:1,SS:1,CFL:1,CRH:1,CDP:1,EDC:1,RRT:1,PRT:1,RTP:1,RTR:1,DEPL:1,DEP:1,CL:1 };
    function firstWork(cells){ for (let d=1; d<=days; d++){ const c=cells[d]||cells[String(d)]; if(!c) continue; const u=String(c).toUpperCase(); if(ABS[u]) continue; return String(c).replace(/[c'"*:]+$/gi,''); } return ''; }
    const teams = {}; // tid -> {fam, people:[{name,codes}]}
    A.employees.forEach(e => {
      if (!e || !e.id || !e.name) return;
      const tid = (e.teamHistory||{})[key]; if (!tid) return;
      const cells = ov[e.id]; if (!cells || !Object.keys(cells).length) return;
      let fam = (e.familyHistory||{})[key] || e.family || 'bj'; if (fam === 'baccara') fam = 'cmc';
      const codes = {}; for (let d=1; d<=days; d++){ const c = cells[d]||cells[String(d)]||''; if(c) codes[d] = c; }
      (teams[tid] = teams[tid] || { fam, people: [] }).people.push({ name: e.name, id: e.id, codes, fw: firstWork(cells) });
    });
    const mirror = {}; try { const m = JSON.parse(localStorage.getItem('cmc_team_mirror_'+key)||'{}'); Object.keys(m).forEach(k=>mirror[k]=m[k]); } catch(_){}
    // Construit les boards
    const boards = {}; const mm = String(monthIdx+1).padStart(2,'0');
    const order = Object.keys(teams).sort((a,b)=>{ const fa=a.replace(/\d.*/,''),fb=b.replace(/\d.*/,''); const na=parseInt(a.replace(/\D/g,''))||0, nb=parseInt(b.replace(/\D/g,''))||0; return fa===fb? na-nb : fa.localeCompare(fb); });
    order.forEach(tid => {
      const t = teams[tid];
      const isAbs = !!ABS_TEAMS[tid];
      const id = year+'-'+mm+'-'+tid;
      // libellé : "Août 2026 — BJ Éq.13 (22/6)" ; absences : "Août 2026 — Congés"
      let label;
      if (isAbs) label = MOIS[monthIdx]+' '+year+' — '+ABS_TEAMS[tid];
      else {
        const fl = famLabel[t.fam] || t.fam;
        const num = /^\d/.test(tid) ? ('Éq.'+tid) : ('Éq.'+tid.replace(/^[a-z]/,''));
        const hw = t.people.map(p=>p.fw).filter(Boolean).sort((a,b)=>{const c={};t.people.forEach(p=>{if(p.fw)c[p.fw]=(c[p.fw]||0)+1;});return (c[b]||0)-(c[a]||0);})[0]||'';
        label = MOIS[monthIdx]+' '+year+' — '+fl+' '+num+(hw?(' ('+hw+')'):'');
      }
      const board = { label, month: MOIS[monthIdx]+' '+year, year, monthIdx, days, fam: t.fam, people: t.people.map(p=>({ name:p.name, id:p.id, codes:p.codes })) };
      if (isAbs) board.kind = 'abs';
      if (t.fam === 'bj' && !isAbs) { const kev = t.people.find(p=>/DESARZENS/.test(p.name)); /* ancre facultative */ }
      boards[id] = board;
    });
    // mirror map → ids préfixés
    const mirIds = {}; Object.keys(mirror).forEach(a=>{ const b=mirror[a]; mirIds[year+'-'+mm+'-'+a] = year+'-'+mm+'-'+b; });
    return { key, label: MOIS[monthIdx]+' '+year, monthIdx, year, days, boards, mirror: mirIds, teamCount: Object.keys(teams).length };
  }, { key: year + '-' + monthIdx, year, monthIdx, MOIS });
  await ctx.close();
  return out;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const targets = [
    { pdf: 'tests/fixtures/aout-2026-v1.pdf', year: 2026, monthIdx: 7 },
    { pdf: 'tests/fixtures/juillet-2026-v2.pdf', year: 2026, monthIdx: 6 },
  ];
  const months = [], boards = {}, mirror = {};
  for (const t of targets) {
    const r = await importMonth(browser, t.pdf, t.year, t.monthIdx);
    months.push({ key: r.key, label: r.label, monthIdx: r.monthIdx, year: r.year, days: r.days });
    Object.assign(boards, r.boards); Object.assign(mirror, r.mirror);
    console.log(r.label + ' : ' + r.teamCount + ' équipes, ' + Object.keys(r.boards).length + ' boards');
  }
  await browser.close();
  const payload = { generatedAt: '2026-06-28', months, boards, mirror };
  const js = '/* GÉNÉRÉ par tools/departs/_gen-boards.mjs depuis les vrais PDF (parser géométrique validé). NE PAS éditer à la main. */\n'
    + 'window.DEPARTS_GEN=' + JSON.stringify(payload) + ';\n';
  writeFileSync(resolve(__dirname, 'boards-gen.js'), js);
  console.log('→ tools/departs/boards-gen.js écrit (' + js.length + ' octets, ' + Object.keys(boards).length + ' boards, ' + Object.keys(mirror).length + ' miroirs)');
}
main().catch(e => { console.error(e); process.exit(1); });
