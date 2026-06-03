/* La Détente — génère des fonds lifestyle photoréalistes (Imagen via GEMINI_API_KEY)
   puis composite le vrai vêtement + logo par-dessus. Sortie : img/lifestyle/<theme>.png
   Sans arme / sans logo / sans texte dans le prompt IA (le logo est ajouté par compositing). */
import { chromium } from 'playwright';
import fs from 'fs';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('❌ GEMINI_API_KEY manquante'); process.exit(1); }
const SHOP = process.cwd() + '/shops/la-detente';

const THEMES = [
  { f:'chasse', prod:'ld009', cap:'CHASSE', sub:'Cerf · Plume · Bois',
    prompt:'Photorealistic cinematic empty autumn forest clearing at golden hour, soft bokeh, deep green and warm amber tones, a rustic dark wooden table surface across the lower third for product placement, shallow depth of field, atmospheric haze, premium editorial fashion lookbook ambiance, moody and dark. Absolutely no people, no text, no logos, no weapons, no firearms.' },
  { f:'tir', prod:'ld018', cap:'TIR · PRÉCISION', sub:'Vise juste',
    prompt:'Photorealistic dark moody concrete and steel industrial interior, dramatic single red rim light, smooth dark gradient background, empty matte surface in foreground, premium product photography ambiance, cinematic. No people, no text, no logos, no weapons.' },
  { f:'balltrap', prod:'ld012', cap:'BALL-TRAP', sub:'Plateau en vol',
    prompt:'Photorealistic overcast green countryside meadow with blurred rolling hills, soft natural light, an empty rustic wooden bench surface in foreground, moody cinematic outdoor ambiance, premium editorial. No people, no text, no logos, no weapons.' },
  { f:'amis', prod:'ld019', cap:'ENTRE AMIS', sub:'Vise juste, entre amis',
    prompt:'Photorealistic cozy dark wood cabin interior at night, warm amber lamp light, soft blurred background, empty rustic wooden table in foreground, intimate cinematic ambiance, premium editorial lookbook. No people, no text, no logos, no weapons.' },
  { f:'nature', prod:'ld016', cap:'NATURE', sub:'Sapin · Montagne',
    prompt:'Photorealistic misty pine forest at dawn with mountains in soft background, cool green and grey tones, an empty flat mossy rock surface in foreground, atmospheric cinematic nature ambiance, premium editorial. No people, no text, no logos, no weapons.' },
  { f:'signature', prod:'ld020', cap:'LA DÉTENTE', sub:'AR15 + Cœur rouge',
    prompt:'Photorealistic premium dark studio backdrop with subtle deep red rim lighting and smooth gradient, matte black surface foreground, high-end product photography ambiance, cinematic and minimal. No people, no text, no logos, no weapons.' }
];

async function genBg(t){
  const models = ['imagen-3.0-generate-002','imagen-3.0-fast-generate-001'];
  for (const model of models){
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${KEY}`;
    let res, txt;
    try {
      res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ instances:[{prompt:t.prompt}], parameters:{ sampleCount:1, aspectRatio:'4:3' } }) });
      txt = await res.text();
    } catch(e){ console.error('  réseau KO', model, e.message); continue; }
    if (!res.ok){ console.error(`  ${model} HTTP ${res.status}: ${txt.slice(0,180)}`); continue; }
    let j; try { j = JSON.parse(txt); } catch(_){ console.error('  parse KO'); continue; }
    const pr = j.predictions && j.predictions[0];
    const b64 = pr && (pr.bytesBase64Encoded || (pr.image && pr.image.imageBytes));
    if (!b64){ console.error('  pas d\'image', model, txt.slice(0,150)); continue; }
    const path = '/tmp/bg-'+t.f+'.png';
    fs.writeFileSync(path, Buffer.from(b64,'base64'));
    console.log(`  ✅ fond généré (${model})`);
    return path;
  }
  return null;
}

(async()=>{
  const b = await chromium.launch();
  const p = await b.newPage({ viewport:{width:1200,height:800}, deviceScaleFactor:2 });
  await p.goto('file://'+SHOP+'/index.html'); await p.waitForTimeout(900);
  let ok=0;
  for (const t of THEMES){
    console.log('▶', t.f);
    const bg = await genBg(t);
    if (!bg){ console.log('  ⏭ skip (garde la scène rendue existante)'); continue; }
    const dataUri = 'data:image/png;base64,'+fs.readFileSync(bg).toString('base64');
    const html = await p.evaluate(({t,dataUri})=>{
      var prod = P.find(z=>z.id===t.prod); var g = gMock(prod.garment, prod.garmentColor, prod.motif);
      return '<img src="'+dataUri+'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">'
        +'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.58))"></div>'
        +'<div style="position:absolute;left:50%;top:46%;width:520px;height:520px;transform:translate(-50%,-50%) rotate(-3deg);filter:drop-shadow(0 32px 48px rgba(0,0,0,.62))">'+g+'</div>'
        +'<div style="position:absolute;left:48px;bottom:50px"><div style="font:900 46px system-ui;color:#fff;text-shadow:0 4px 20px rgba(0,0,0,.7)">'+t.cap+'</div><div style="font:600 18px system-ui;color:#fff;opacity:.85;margin-top:4px">'+t.sub+'</div></div>'
        +'<div style="position:absolute;right:40px;top:34px;font:800 14px system-ui;letter-spacing:3px;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.6)">LA DÉTENTE</div>';
    }, {t,dataUri});
    await p.evaluate(({html})=>{ let d=document.getElementById('shot')||document.body.appendChild(Object.assign(document.createElement('div'),{id:'shot'}));
      d.style.cssText='position:fixed;left:0;top:0;width:1200px;height:800px;z-index:99999;overflow:hidden;background:#000'; d.innerHTML=html; }, {html});
    await p.waitForTimeout(150);
    await (await p.$('#shot')).screenshot({ path: SHOP+'/img/lifestyle/'+t.f+'.png' });
    ok++; console.log('  🖼️ composité →', t.f+'.png');
  }
  await b.close();
  console.log(`\nTerminé : ${ok}/${THEMES.length} scènes IA générées.`);
  if (ok===0){ console.error('Aucune image IA générée (clé sans accès Imagen ?).'); process.exit(2); }
})().catch(e=>{ console.error('FATAL', e.message); process.exit(1); });
