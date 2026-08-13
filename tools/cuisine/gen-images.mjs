#!/usr/bin/env node
/* Génère les illustrations des recettes du Répertoire de la Riviera via GEMINI_API_KEY.
   Réutilise le pattern éprouvé de shops/la-detente (generateContent responseModalities IMAGE, repli Imagen :predict).
   Idempotent : ne régénère pas une image déjà présente (reprise possible). N'invente aucune recette — génère une ILLUSTRATION du plat. */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('GEMINI_API_KEY manquante'); process.exit(1); }
const API = 'https://generativelanguage.googleapis.com/v1beta';
const DIR = path.resolve('tools/cuisine');
const IMG = path.join(DIR, 'img');
fs.mkdirSync(IMG, { recursive: true });
const recipes = JSON.parse(fs.readFileSync(path.join(DIR, 'recipes.json'), 'utf8'));
const ONLY = process.argv[2] ? new Set(process.argv[2].split(',').map(Number)) : null; // ex: "0,1,2" pour un lot

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function discoverModels() {
  let listed = [];
  try {
    const r = await fetch(`${API}/models?key=${KEY}&pageSize=200`);
    const j = await r.json();
    if (j.models) listed = j.models.filter(m => /image/i.test(m.name)).map(m => m.name.replace('models/', ''));
  } catch (e) { console.error('discover KO', e.message); }
  const pref = ['gemini-2.5-flash-image-preview','gemini-2.0-flash-preview-image-generation','gemini-2.0-flash-exp-image-generation'];
  const ordered = [];
  for (const m of pref) if (listed.includes(m)) ordered.push(m);
  for (const m of listed) if (!ordered.includes(m) && !/imagen/.test(m)) ordered.push(m);   // autres gemini image
  for (const m of listed) if (/imagen/.test(m) && !ordered.includes(m)) ordered.push(m);     // Imagen en dernier
  console.log('Modèles image détectés:', ordered.join(', ') || '(aucun)');
  return ordered;
}

function promptFor(r) {
  const desc = (r.desc || '').replace(/\s+/g, ' ').slice(0, 200);
  return `Elegant fine-dining food photograph of the dish "${r.name}", a classic Monégasque / French Riviera recipe (${r.cat}). ${desc}. Beautifully plated on refined white porcelain, soft natural window light, marble or linen tabletop, Mediterranean Belle Époque elegance, shallow depth of field, warm and appetizing, styled like a luxury cookbook. No text, no words, no labels, no people, no hands, no cutlery clutter.`;
}

async function genGemini(model, prompt) {
  const url = `${API}/models/${model}:generateContent?key=${KEY}`;
  const body = { contents: [{ parts: [{ text: prompt + ' Landscape 16:9 composition.' }] }], generationConfig: { responseModalities: ['IMAGE'] } };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const txt = await res.text();
  if (!res.ok) { console.error(`   ${model} HTTP ${res.status}: ${txt.slice(0,140)}`); return null; }
  let j; try { j = JSON.parse(txt); } catch { return null; }
  const parts = j.candidates?.[0]?.content?.parts || [];
  for (const p of parts) { const b = p.inlineData?.data || p.inline_data?.data; if (b) return b; }
  const fr = j.candidates?.[0]?.finishReason; console.error(`   ${model} pas d'image ${fr?('finish='+fr):''}`); return null;
}
async function genImagen(model, prompt) {
  const url = `${API}/models/${model}:predict?key=${KEY}`;
  const body = { instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: '16:9' } };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const txt = await res.text();
  if (!res.ok) { console.error(`   ${model} HTTP ${res.status}: ${txt.slice(0,140)}`); return null; }
  const j = JSON.parse(txt); const pr = j.predictions?.[0];
  return pr?.bytesBase64Encoded || pr?.image?.imageBytes || null;
}

async function generate(models, prompt) {
  for (const m of models) {
    const b64 = /imagen/.test(m) ? await genImagen(m, prompt) : await genGemini(m, prompt);
    if (b64) return { b64, model: m };
  }
  return null;
}

(async () => {
  const models = await discoverModels();
  if (!models.length) { console.error('Aucun modèle image disponible pour cette clé.'); process.exit(2); }
  let done = 0, skipped = 0, failed = [];
  for (const r of recipes) {
    if (ONLY && !ONLY.has(r.id)) continue;
    const out = path.join(IMG, `${r.id}.jpg`);
    if (fs.existsSync(out) && fs.statSync(out).size > 3000) { skipped++; continue; }
    process.stdout.write(`[${r.id}] ${r.name.slice(0,42)} … `);
    let got = null;
    for (let attempt = 0; attempt < 2 && !got; attempt++) {
      got = await generate(models, promptFor(r));
      if (!got) await sleep(1500);
    }
    if (!got) { console.log('❌'); failed.push(r.id); await sleep(500); continue; }
    try {
      const buf = Buffer.from(got.b64, 'base64');
      await sharp(buf).resize(1000, 640, { fit: 'cover', position: 'attention' }).jpeg({ quality: 74, mozjpeg: true }).toFile(out);
      console.log(`✅ ${(fs.statSync(out).size/1024|0)}Ko (${got.model})`);
      done++;
    } catch (e) { console.log('compress KO', e.message); failed.push(r.id); }
    await sleep(700);
  }
  console.log(`\nTerminé : ${done} générées, ${skipped} déjà présentes, ${failed.length} échecs${failed.length?(' → '+failed.join(',')):''}`);
  fs.writeFileSync(path.join(DIR, 'img', '_status.json'), JSON.stringify({ done, skipped, failed, total: recipes.length, ts: Date.now() }));
})();
