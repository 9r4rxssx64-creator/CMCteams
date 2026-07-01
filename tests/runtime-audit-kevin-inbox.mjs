// v9.840 — Message direct à Kevin (problème/question) routé vers son Apex.
// Vérifie : cmcSendToKevin écrit dans la boîte admin (cmc_kevin_inbox) ET le chemin
// partagé cross-app (ax_cmc_kevin_inbox, lu par Apex) ; les 2 clés sont dans FB_FIX
// (sync) ; vKevinInbox rend les messages ; la modale s'ouvre pour un employé.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
let pass=0,fail=0; const ok=(c,m)=>{if(c){pass++;console.log('  ✓ '+m);}else{fail++;console.log('  ✗ '+m);}};
const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({viewport:{width:390,height:844}})).newPage();
await page.addInitScript(()=>{window.__CMC_NO_SEED=true;});
await page.goto('file://'+resolve(__dirname,'../index.html'),{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForFunction(()=>typeof window.cmcSendToKevin==='function'&&window.A&&Array.isArray(A.employees),{timeout:20000});

// 1) FB_FIX contient les 2 clés (sync cross-device + bridge Apex)
ok(await page.evaluate(()=>FB_FIX.indexOf('cmc_kevin_inbox')>=0&&FB_FIX.indexOf('ax_cmc_kevin_inbox')>=0),'cmc_kevin_inbox + ax_cmc_kevin_inbox dans FB_FIX (sync + bridge Apex)');

// 2) un EMPLOYÉ envoie un message
const r = await page.evaluate(()=>{
  A.user=A.employees.find(e=>e.id!=='U11804')||A.employees[0];
  localStorage.removeItem('cmc_kevin_inbox');localStorage.removeItem('ax_cmc_kevin_inbox');
  const okSend=cmcSendToKevin('Problème avec mon planning de juillet');
  const box=JSON.parse(localStorage.getItem('cmc_kevin_inbox')||'[]');
  const shared=JSON.parse(localStorage.getItem('ax_cmc_kevin_inbox')||'[]');
  return {okSend,boxLen:box.length,sharedLen:shared.length,txt:(box[0]||{}).text,from:(box[0]||{}).from,status:(box[0]||{}).status,app:(shared[0]||{}).app};
});
ok(r.okSend===true,'cmcSendToKevin retourne true');
ok(r.boxLen===1,'message dans la boîte admin CMCteams (cmc_kevin_inbox)');
ok(r.sharedLen===1,'message dans le chemin partagé Apex (ax_cmc_kevin_inbox)');
ok(r.txt==='Problème avec mon planning de juillet','texte préservé');
ok(r.status==='new','statut new');
ok(r.app==='cmcteams','tag app=cmcteams pour Apex');

// 3) message vide ignoré
ok(await page.evaluate(()=>cmcSendToKevin('  ')===false),'message vide ignoré');

// 4) vKevinInbox (admin) rend le message
const inboxHtml = await page.evaluate(()=>{A.user=A.employees.find(e=>e.id==='U11804');return vKevinInbox();});
ok(/Messages reçus \(1\)/.test(inboxHtml),'vKevinInbox affiche le compteur (1)');
ok(/Problème avec mon planning/.test(inboxHtml),'vKevinInbox affiche le texte du message');

// 5) vKevinInbox refusé pour non-admin
ok(await page.evaluate(()=>{A.user=A.employees.find(e=>e.id!=='U11804');return /réservé/i.test(vKevinInbox());}),'vKevinInbox refusé pour non-admin');

// 6) la modale « Écrire à Kevin » s'ouvre
const modal = await page.evaluate(()=>{A.user=A.employees.find(e=>e.id!=='U11804');cmcOpenContactKevin();return !!document.getElementById('cmcContactKevin')&&!!document.getElementById('cmcCkTxt');});
ok(modal,'modale Écrire à Kevin s\'ouvre (textarea présent)');

await browser.close();
console.log('\nKEVIN INBOX : '+pass+' OK / '+fail+' KO');
process.exit(fail?1:0);
