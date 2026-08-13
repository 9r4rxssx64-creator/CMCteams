#!/usr/bin/env node
/* Illustrations des recettes du Répertoire de la Riviera.
   MULTI-FOURNISSEURS : essaie les clés IA image présentes dans les secrets et
   prend automatiquement la première qui a du crédit (Together FLUX → Replicate → OpenAI → Gemini/Imagen).
   Idempotent (ne régénère pas une image déjà présente). N'invente aucune recette — illustre le plat. */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const DIR = path.resolve('tools/cuisine');
const IMG = path.join(DIR, 'img');
fs.mkdirSync(IMG, { recursive: true });
const recipes = JSON.parse(fs.readFileSync(path.join(DIR, 'recipes.json'), 'utf8'));
const ONLY = process.argv[2] ? new Set(process.argv[2].split(',').map(Number)) : null;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const KEYS = {
  together: process.env.TOGETHER_API_KEY,
  replicate: process.env.AX_REPLICATE_KEY,
  openai: process.env.OPEN_AI_API_KEY,
  gemini: process.env.GEMINI_API_KEY,
};
console.log('Clés dispo :', Object.entries(KEYS).filter(([,v])=>v).map(([k])=>k).join(', ') || 'AUCUNE');

function promptFor(r) {
  const desc = (r.desc || '').replace(/\s+/g, ' ').slice(0, 180);
  return `Elegant fine-dining food photograph of the dish "${r.name}", a classic Monégasque / French Riviera recipe. ${desc}. Plated on refined white porcelain, soft natural light, marble or linen table, Mediterranean Belle Époque elegance, shallow depth of field, warm and appetizing, luxury cookbook style, landscape composition. No text, no words, no people, no hands.`;
}
async function toBuffer(x){ // x = {b64} | {url}
  if (x.b64) return Buffer.from(x.b64, 'base64');
  if (x.url){ const r = await fetch(x.url); if(!r.ok) throw new Error('dl '+r.status); return Buffer.from(await r.arrayBuffer()); }
  throw new Error('no image');
}

// ---- providers : renvoient {b64}|{url} ou null ----
async function pTogether(prompt){
  const r = await fetch('https://api.together.xyz/v1/images/generations',{method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+KEYS.together},
    body:JSON.stringify({model:'black-forest-labs/FLUX.1-schnell-Free',prompt,width:1024,height:688,n:1,steps:4,response_format:'b64_json'})});
  const t=await r.text(); if(!r.ok){ if(pfVerbose)console.error('  together',r.status,t.slice(0,120)); return null; }
  const j=JSON.parse(t); const d=j.data&&j.data[0]; return d? (d.b64_json?{b64:d.b64_json}:{url:d.url}) : null;
}
async function pReplicate(prompt){
  const r = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',{method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+KEYS.replicate,'Prefer':'wait'},
    body:JSON.stringify({input:{prompt,aspect_ratio:'3:2',output_format:'jpg',num_outputs:1}})});
  const t=await r.text(); if(!r.ok){ if(pfVerbose)console.error('  replicate',r.status,t.slice(0,120)); return null; }
  const j=JSON.parse(t); let out=j.output; if(Array.isArray(out))out=out[0];
  return out? {url:out} : null;
}
async function pOpenAI(prompt){
  const r = await fetch('https://api.openai.com/v1/images/generations',{method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+KEYS.openai},
    body:JSON.stringify({model:'gpt-image-1',prompt,size:'1536x1024',n:1})});
  const t=await r.text(); if(!r.ok){ if(pfVerbose)console.error('  openai',r.status,t.slice(0,120)); return null; }
  const j=JSON.parse(t); const d=j.data&&j.data[0]; return d? (d.b64_json?{b64:d.b64_json}:{url:d.url}) : null;
}
async function pGemini(prompt){
  const API='https://generativelanguage.googleapis.com/v1beta';
  const models=['gemini-2.5-flash-image','imagen-4.0-fast-generate-001'];
  for(const m of models){
    if(/imagen/.test(m)){
      const r=await fetch(`${API}/models/${m}:predict?key=${KEYS.gemini}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({instances:[{prompt}],parameters:{sampleCount:1,aspectRatio:'16:9'}})});
      if(!r.ok){ if(pfVerbose)console.error('  gemini',m,r.status); continue; }
      const j=await r.json(); const pr=j.predictions&&j.predictions[0]; const b=pr&&(pr.bytesBase64Encoded||pr.image&&pr.image.imageBytes); if(b)return {b64:b};
    } else {
      const r=await fetch(`${API}/models/${m}:generateContent?key=${KEYS.gemini}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt+' Landscape 16:9.'}]}],generationConfig:{responseModalities:['IMAGE']}})});
      if(!r.ok){ if(pfVerbose)console.error('  gemini',m,r.status); continue; }
      const j=await r.json(); const parts=(j.candidates&&j.candidates[0]&&j.candidates[0].content&&j.candidates[0].content.parts)||[];
      for(const p of parts){ const b=p.inlineData&&p.inlineData.data; if(b)return {b64:b}; }
    }
  }
  return null;
}
const PROVIDERS=[['together',pTogether],['replicate',pReplicate],['openai',pOpenAI],['gemini',pGemini]].filter(([k])=>KEYS[k]);
let pfVerbose=true;

async function save(buf,out){ await sharp(buf).resize(1000,640,{fit:'cover',position:'attention'}).jpeg({quality:74,mozjpeg:true}).toFile(out); }

(async()=>{
  if(!PROVIDERS.length){ console.error('Aucune clé IA image dans les secrets.'); process.exit(1); }
  // preflight : trouver le 1er fournisseur qui a du crédit
  let chosen=null, testPrompt=promptFor(recipes[0]);
  for(const [name,fn] of PROVIDERS){
    process.stdout.write(`Test fournisseur ${name} … `);
    try{ const img=await fn(testPrompt); if(img){ const buf=await toBuffer(img); await save(buf,path.join(IMG,`${recipes[0].id}.jpg`)); console.log('✅ crédit OK — fournisseur retenu'); chosen=[name,fn]; break; } else console.log('pas d\'image'); }
    catch(e){ console.log('KO', e.message.slice(0,80)); }
  }
  pfVerbose=false;
  if(!chosen){ console.error('\n❌ Aucune clé image n\'a de crédit disponible (toutes 429/erreur).'); fs.writeFileSync(path.join(IMG,'_status.json'),JSON.stringify({done:0,failed:'all',reason:'no_credit',ts:0})); process.exit(2); }
  const [pname,pfn]=chosen;
  let done=recipes[0]&&fs.existsSync(path.join(IMG,`${recipes[0].id}.jpg`))?1:0, skipped=0; const failed=[];
  for(const r of recipes){
    if(ONLY && !ONLY.has(r.id)) continue;
    const out=path.join(IMG,`${r.id}.jpg`);
    if(fs.existsSync(out)&&fs.statSync(out).size>3000){ skipped++; continue; }
    process.stdout.write(`[${r.id}] ${r.name.slice(0,40)} … `);
    let ok=false;
    for(let a=0;a<3&&!ok;a++){
      try{ const img=await pfn(promptFor(r)); if(img){ await save(await toBuffer(img),out); ok=true; } }catch(e){ if(a===2)console.log('(err '+e.message.slice(0,40)+')'); }
      if(!ok) await sleep(2500);
    }
    if(ok){ console.log(`✅ ${(fs.statSync(out).size/1024|0)}Ko`); done++; } else { console.log('❌'); failed.push(r.id); }
    await sleep(1200); // respect rate limits
  }
  console.log(`\nFournisseur: ${pname} — ${done} générées, ${skipped} déjà là, ${failed.length} échecs${failed.length?(' → '+failed.join(',')):''}`);
  fs.writeFileSync(path.join(IMG,'_status.json'),JSON.stringify({provider:pname,done,skipped,failed,total:recipes.length,ts:0}));
})();
