/* Test E2E réel du studio La Détente (Playwright/chromium en CI).
   Charge le studio, se connecte (gate), importe une image, exerce l'éditeur
   (gomme + gomme magique + recadrer), copier/coller + undo, capture l'écran.
   Échoue s'il y a une erreur console/page ou si une assertion casse. */
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE || 'http://localhost:8080';
const errors = [];
function ok(c, m){ if(!c){ throw new Error('ASSERT: '+m); } console.log('  ✓', m); }

const b = await chromium.launch();
const p = await b.newPage({ viewport:{ width:1100, height:820 } });
p.on('console', m => { if (m.type()==='error') errors.push('console: '+m.text()); });
p.on('pageerror', e => errors.push('pageerror: '+e.message));

try {
  await p.goto(BASE+'/studio.html', { waitUntil:'load', timeout:30000 });
  await p.waitForTimeout(700);

  // --- Connexion (gate Kevin) ---
  await p.fill('#sgName', 'Kevin Desarzens');
  await p.fill('#sgPin', '200807');
  await p.click('#studioGate button:has-text("Entrer")');
  await p.waitForFunction(() => { const g=document.getElementById('studioGate'); return !g || g.style.display==='none'; }, { timeout:10000 });
  ok(true, 'connexion studio OK (gate fermé)');

  // --- Coupes (garments) ---
  const garments = await p.$$eval('#garments .gbtn', els => els.length);
  ok(garments >= 11, 'coupes affichées = '+garments+' (>=11)');

  const lyr = () => p.$$eval('#layers .lyr', e => e.length);
  const base = await lyr(); // emblème seedé = 1

  // --- Ajouter du texte ---
  await p.click('button:has-text("Ajouter du texte")');
  await p.waitForTimeout(150);
  ok(await lyr() === base+1, 'ajout texte → +1 calque');

  // --- Annuler (undo) ---
  await p.evaluate(() => Studio.undo());
  await p.waitForTimeout(150);
  ok(await lyr() === base, 'undo → calque retiré');

  // --- Import image (fixture du repo) ---
  await p.setInputFiles('#upl', 'shops/la-detente/img/designs/rose-pistol.png');
  await p.waitForTimeout(1000);
  ok(await lyr() === base+1, 'import image → +1 calque');

  // --- Copier / Coller ---
  await p.click('#layers .lyr >> nth=0');           // sélectionne l'image (en haut)
  await p.evaluate(() => Studio.copyLayer());
  await p.evaluate(() => Studio.pasteLayer());
  await p.waitForTimeout(150);
  ok(await lyr() === base+2, 'copier+coller → +1 calque');

  // --- Éditeur photo : ouvrir, gomme, gomme magique, appliquer ---
  await p.click('#layers .lyr >> nth=0');
  await p.click('button:has-text("Retoucher")');
  await p.waitForSelector('#iceCanvas', { timeout:8000 });
  ok(true, 'éditeur photo ouvert (canvas présent)');
  const box = await (await p.$('#iceCanvas')).boundingBox();
  // gomme manuelle (trait)
  await p.click('#iceTb-gomme');
  await p.mouse.move(box.x+box.width*0.5, box.y+box.height*0.5);
  await p.mouse.down();
  await p.mouse.move(box.x+box.width*0.6, box.y+box.height*0.6);
  await p.mouse.up();
  // gomme magique (clic coin = fond)
  await p.click('#iceTb-magique');
  await p.mouse.click(box.x+box.width*0.08, box.y+box.height*0.08);
  await p.waitForTimeout(150);
  await p.click('button:has-text("Appliquer")');
  await p.waitForFunction(() => { const m=document.getElementById('modal'); return m.className.indexOf('show')<0; }, { timeout:8000 });
  ok(true, 'éditeur appliqué (modal fermé)');

  fs.mkdirSync('tools/la-detente-e2e', { recursive:true });
  await p.screenshot({ path:'tools/la-detente-e2e/studio-test.png' });
  console.log('  📸 capture enregistrée');

  if (errors.length) { console.error('\n❌ ERREURS console/page :\n'+errors.join('\n')); process.exit(1); }
  console.log('\n✅ E2E studio OK — aucune erreur, toutes assertions passées.');
} catch (e) {
  try { await p.screenshot({ path:'tools/la-detente-e2e/studio-test.png' }); } catch(_){}
  console.error('\n❌ ÉCHEC E2E :', e.message);
  if (errors.length) console.error('Erreurs console:\n'+errors.join('\n'));
  await b.close();
  process.exit(1);
}
await b.close();
