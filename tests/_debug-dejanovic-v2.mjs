// Reproduit le bug DEJANOVIC manquant dans V2 chefs BJ
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');

// Extrait littéral de la section chefs BJ V2 que Kevin a collée (sans {{REDNAME}}/{{CONV}})
const V2_CHEFS_BJ = `Chefs black Jack/Responsable de Table
6	20/5c	du	au	5	19/4c	du	au	6	16/22c	du	au	5	14/19c	du	au	5	RH	du	au	6	R	du	au
BRTP+K	FAUTRIER M	1	30	BRTP+E.	FILIPPI F	15	30	BRTP+E.	PASSERON G	*	1	30	BRTP+E.	PASTOR P	1	15
BRTCP+KE.	DEJANOVIC D	1	30	BRE	MILLO W	*	1	30	BTP+K	ESPAGNOL S	*	1	16	BRTP+K	DESSI P	1	30	BRTP+.	BELTRANDI N	1	30	BTP+K	BASILE G	1	30
BRTCP+E.	MARIANI M	1	15	BRTCP+E.	SIRIO J	1	30	BRTCPE.	GALLIS J	1	30	BRTP+E.	BRASSEUR F	1	30	BRTP+KE.	GIORSETTI S	1	30	BRTP+KE.	FOREST M	1	30
BRTCP+E.	MALENFANT PJ	1	30	BRTCP+KE.	RICORDO B	1	30	BRTCP+KE.	HORGNE C	1	30	BRTCP+E.	RUZIC M	1	30	BRTCP+E.	ARCURI F	1	30	BRTCP+E.	GIAUNA S	1	30
BRTC.	DESARZENS K	16	30	BRTCP+E.	GANCIA G	1	15	BRTC.	FARRUGIA VALERI S	*	1	30	BRTCK.	PETIT T	1	30	BRTC.	FIA S	*	1	30	BRTCK.	COZZI H	*	1	30
BRTCK.	DESSI F	1	15	BRTC.	FABRE SOCCAL Y	1	30	BRTCK.	MALGHERINI T	*	1	30	BRTCK.	CAMPI PH	16	30	BRTCK.	REVOLLON L	1	30
0	M	du	au
BTP+K	ROBIN M	1	30
BRTP+.	CAPRA C	1	30
BRTC.	LEMONNIER PH	*	1	30
8	22/6c	du	au	6	19/4'c	du	au	5	16/3c	du	au	6	14/19'c	du	au	5	RH	du	au	5	R	du	au
BRTP+E.	VATRICAN T	1	30	BRTPE	LARINI H	1	30	BRTP+E.	SOLIMEIS F	1	30	BTP+K	MAGAGNIN J	1	30	BRTP+E.	CLAVE C	*	1	30
BRTP+.	LAVAGNA J	15	30	BRTP+K.	VERZELLO O	1	30	BRTP+K.	BATTAGLIA D	1	30	BTP+.	MATTONE F	1	30	BRTCP+.	ADELHEIM P	1	30	BTP+K	MAGARA M	1	30`;

// PUIS la section grille (avec team#)
const V2_CHEFS_BJ_GRID = `juin 2026
lun 1	mar 2	mer 3	jeu 4	ven 5	sam 6	dim 7	lun 8	mar 9	mer 10	jeu 11	ven 12	sam 13	dim 14	lun 15	mar 16	mer 17	jeu 18	ven 19	sam 20	dim 21	lun 22	mar 23	mer 24	jeu 25	ven 26	sam 27	dim 28	lun 29	mar 30
Chefs black Jack
Colonne4	Col	Colonne8	Colonne9	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne	Colonne
BRTP+K	5	FAUTRIER M	1	30	M	19/4c	16/22c	14/19c	RH	19/4'c	22/6c	20/5'c	16/3c	14/19'c	RH	R	20/5c	19/4c	16/22c	14/19c	RH	R	22/6c	19/4'c	16/3c	14/19'c	RH	R	20/5c	19/4c	16/22c	14/19c	RH	R
BRTCP+KE.	1	DEJANOVIC D	1	30	20/5c	19/4c	16/22c	14/19c	RH	19/4'c	22/6c	20/5'c	16/3c	14/19'c	RH	R	20/5c	19/4c	16/22c	14/19c	RH	R	22/6c	19/4'c	16/3c	14/19'c	RH	R	20/5c	19/4c	16/22c	14/19c	RH	R
BRTCP+E.	1	MARIANI M	1	15	20/5c	19/4c	16/22c	14/19c	RH	19/4'c	22/6c	20/5'c	16/3c	14/19'c	RH	R	20/5c	19/4c	16/22c	CP	CP	CP	CP	CP	CP	CP	CP	CP	CP	CP	CP	CP	CP	CP
BRTCP+E.	6	MALENFANT PJ	1	30	20/5*	19/4c	16/22c	14/19c	RH	19/4'c	22/6c	20/5'c	16/3*	14/19'c	RH	R	20/5*	19/4c	16/22c	14/19c	RH	R	22/6c	19/4'c	16/3*	14/19'c	RH	R	20/5*	19/4c	16/22c	14/19c	RH	22/6c
BRTC.	8	DESARZENS K	16	30	CP	CP	CP	CP	CP	CP	CP	CP	CP	CP	CP	CP	CP	CP	CP	14/19c	RH	R	22/6c	19/4'c	16/3*	14/19'c	RH	R	20/5*	19/4c	16/22c	14/19c	RH	R
BRTCK.	8	DESSI F	1	15	20/5*	19/4c	16/22c	14/19c	RH	19/4'c	22/6c	20/5'c	16/3*	14/19'c	RH	R	20/5*	19/4c	16/22c	CP	CP	CP	CP	CP	CP	CP	CP	CP	CP	CP	CP	CP	CP	CP`;

const fullText = V2_CHEFS_BJ + "\n" + V2_CHEFS_BJ_GRID;

async function main(){
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await ctx.newPage();
  await page.goto('file://' + INDEX_PATH, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof window.A === 'object' && typeof window.doImport === 'function', { timeout: 20000 });

  const result = await page.evaluate(async (txt) => {
    window.A.user = { id: 'U11804', name: 'Kevin DESARZENS' };
    const iy=2026,im=5,key=iy+'-'+im;
    window.A.year=iy; window.A.month=im;
    if(!window.A.overrides) window.A.overrides={};
    window.A.overrides[key]={};
    let ta = document.getElementById('impTxt');
    if(!ta){ ta=document.createElement('textarea'); ta.id='impTxt'; ta.style.display='none'; document.body.appendChild(ta); }
    ta.value=txt;
    ['impY','2026','impM','5'].forEach((v,i)=>{ if(i%2) return; let el=document.getElementById(v); if(!el){ el=document.createElement('input'); el.id=v; document.body.appendChild(el); } });
    document.getElementById('impY').value='2026';
    document.getElementById('impM').value='5';
    window._importInProgress=false;
    try { window.doImport(); } catch(e) { return { error: 'doImport: '+e.message }; }
    await new Promise(r => setTimeout(r, 1500));
    const ov=window.A.overrides[key]||{};
    const findEmp = (name) => {
      const e = window.A.employees.find(x => x.name === name);
      if(!e) return { found: false };
      const cells = ov[e.id] || {};
      const codeCount = Object.keys(cells).filter(d => cells[d]).length;
      return { found: true, id: e.id, codeCount, j1: cells[1], j2: cells[2], j5: cells[5], j10: cells[10], j20: cells[20] };
    };
    return {
      fautrier: findEmp('FAUTRIER M'),
      dejanovic: findEmp('DEJANOVIC D'),
      mariani: findEmp('MARIANI M'),
      malenfant: findEmp('MALENFANT PJ'),
      desarzens: findEmp('DESARZENS K'),
      dessi: findEmp('DESSI F'),
      totalEmps: window.A.employees.length,
      empsWithCells: Object.keys(ov).filter(eid => Object.keys(ov[eid]||{}).filter(d => ov[eid][d]).length > 0).length
    };
  }, fullText);

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}
main().catch(e => { console.error('FATAL:', e.stack||e); process.exit(2); });
