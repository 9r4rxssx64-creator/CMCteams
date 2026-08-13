#!/usr/bin/env node
/* Illustrations des recettes du Répertoire de la Riviera.
   SOURCE PRINCIPALE : vraies photos LIBRES DE DROITS via Pexels (PEXELS_API_KEY).
   Repli : IA image si une clé a du crédit (Together/Replicate/OpenAI/Gemini) ; sinon médaillon SVG (dans la page).
   Idempotent (ne retélécharge pas une image déjà présente). N'invente aucune recette — illustre le plat. */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const DIR = path.resolve('tools/cuisine');
const IMG = path.join(DIR, 'img');
fs.mkdirSync(IMG, { recursive: true });
const recipes = JSON.parse(fs.readFileSync(path.join(DIR, 'recipes.json'), 'utf8'));
const ONLY = process.argv[2] ? new Set(process.argv[2].split(',').map(Number)) : null;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const PEXELS = process.env.PEXELS_API_KEY;
const AI = { together: process.env.TOGETHER_API_KEY, replicate: process.env.AX_REPLICATE_KEY, openai: process.env.OPEN_AI_API_KEY, gemini: process.env.GEMINI_API_KEY };
console.log('Pexels:', PEXELS ? 'oui' : 'NON', '| IA repli:', Object.entries(AI).filter(([,v])=>v).map(([k])=>k).join(',') || 'aucune');

const strip = s => (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function cleanQuery(name){
  let q = strip(name)
    .replace(/\(.*?\)/g,' ')
    .replace(/\b(a la|à la|de la|de|du|des|le|la|les|l|aux|au|en|the)\b/g,' ')
    .replace(/\b(monegasque|monte-?carlo|monaco|riviera|menton|condamine|rocher|nicoise|nicois|souverains|princes|princesse|saint-nicolas|saint-jean|alba|saorge)\b/g,' ')
    .replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  return q;
}
const CATQ = {
  'Desserts & Pâtisseries':'french pastry dessert plated',
  'Potages & Soupes':'gourmet soup bowl',
  'Poissons & Fruits de mer':'seafood fish gourmet plate',
  'Viandes, Volailles & Gibiers':'gourmet meat dish plate',
  "Entrées, Œufs & Hors-d'œuvre":'appetizer starter gourmet plate',
  'Spécialités du Terroir':'mediterranean provencal cuisine dish',
};

async function pexels(query){
  const url = 'https://api.pexels.com/v1/search?orientation=landscape&size=medium&per_page=3&query='+encodeURIComponent(query);
  const r = await fetch(url,{headers:{Authorization:PEXELS}});
  if(!r.ok){ if(r.status===429) throw new Error('pexels 429'); return null; }
  const j = await r.json();
  const p = j.photos && j.photos[0];
  if(!p) return null;
  const src = (p.src && (p.src.landscape || p.src.large2x || p.src.large || p.src.original));
  return src ? {url:src} : null;
}
async function toBuf(x){ if(x.b64) return Buffer.from(x.b64,'base64'); const r=await fetch(x.url); if(!r.ok) throw new Error('dl '+r.status); return Buffer.from(await r.arrayBuffer()); }
async function save(buf,out){ await sharp(buf).resize(1000,640,{fit:'cover',position:'attention'}).jpeg({quality:76,mozjpeg:true}).toFile(out); }

// --- IA repli (optionnel) ---
async function aiTogether(p){const r=await fetch('https://api.together.xyz/v1/images/generations',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+AI.together},body:JSON.stringify({model:'black-forest-labs/FLUX.1-schnell-Free',prompt:p,width:1024,height:688,n:1,steps:4,response_format:'b64_json'})});if(!r.ok)return null;const j=await r.json();const d=j.data&&j.data[0];return d?(d.b64_json?{b64:d.b64_json}:{url:d.url}):null;}
async function aiOpenAI(p){const r=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+AI.openai},body:JSON.stringify({model:'gpt-image-1',prompt:p,size:'1536x1024',n:1})});if(!r.ok)return null;const j=await r.json();const d=j.data&&j.data[0];return d?(d.b64_json?{b64:d.b64_json}:{url:d.url}):null;}
async function aiReplicate(p){const r=await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+AI.replicate,Prefer:'wait'},body:JSON.stringify({input:{prompt:p,aspect_ratio:'3:2',output_format:'jpg'}})});if(!r.ok)return null;const j=await r.json();let o=j.output;if(Array.isArray(o))o=o[0];return o?{url:o}:null;}
function aiPrompt(r){return `Elegant fine-dining food photograph of "${r.name}", classic Monégasque/Riviera dish. Plated on white porcelain, soft natural light, appetizing, luxury cookbook, landscape. No text, no people.`;}
async function aiTry(r){
  for(const [k,fn] of [['together',aiTogether],['replicate',aiReplicate],['openai',aiOpenAI]]){ if(!AI[k]) continue; try{ const img=await fn(aiPrompt(r)); if(img) return img; }catch(_){}}
  return null;
}

(async()=>{
  if(!PEXELS){ console.error('PEXELS_API_KEY manquante — impossible de récupérer des photos libres de droits.'); }
  let done=0, skipped=0; const failed=[]; const srcCount={pexels:0,ai:0};
  for(const r of recipes){
    if(ONLY && !ONLY.has(r.id)) continue;
    const out=path.join(IMG,`${r.id}.jpg`);
    if(fs.existsSync(out)&&fs.statSync(out).size>3000){ skipped++; continue; }
    process.stdout.write(`[${r.id}] ${r.name.slice(0,38)} … `);
    let img=null, via='';
    // 1) Pexels : requête ciblée (plat dressé) → nettoyée → repli catégorie
    if(PEXELS){
      const STYLE={'Desserts & Pâtisseries':'dessert plated','Potages & Soupes':'soup bowl','Poissons & Fruits de mer':'seafood dish plated','Viandes, Volailles & Gibiers':'meat dish plated',"Entrées, Œufs & Hors-d'œuvre":'gourmet dish plated','Spécialités du Terroir':'dish plated'};
      const base=cleanQuery(r.name); const style=STYLE[r.cat]||'gourmet dish';
      const q2=CATQ[r.cat]||'gourmet dish';
      for(const q of [base&&(base+' '+style), base&&(base+' food'), q2]){ if(!q) continue;
        for(let a=0;a<3&&!img;a++){ try{ img=await pexels(q); if(img){via='pexels';break;} }catch(e){ if(String(e.message).includes('429')) await sleep(3000); else break; } }
        if(img) break;
      }
    }
    // 2) repli IA
    if(!img){ const ai=await aiTry(r); if(ai){img=ai;via='ai';} }
    if(!img){ console.log('❌'); failed.push(r.id); await sleep(400); continue; }
    try{ await save(await toBuf(img),out); srcCount[via]++; done++; console.log(`✅ ${via} ${(fs.statSync(out).size/1024|0)}Ko`); }
    catch(e){ console.log('save KO '+e.message.slice(0,40)); failed.push(r.id); }
    await sleep(500);
  }
  console.log(`\nTerminé : ${done} images (${srcCount.pexels} Pexels, ${srcCount.ai} IA), ${skipped} déjà là, ${failed.length} échecs${failed.length?(' → '+failed.join(',')):''}`);
  fs.writeFileSync(path.join(IMG,'_status.json'),JSON.stringify({done,skipped,failed,src:srcCount,total:recipes.length,ts:0}));
})();
