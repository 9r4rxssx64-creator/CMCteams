/* =====================================================================
   kdmc-crea-ai — Worker IA pour Créa Studio (studio.kd-mc.com)

   IA GRATUITE EN PREMIER (clés déjà dans les secrets GitHub de Kevin) :
     1) Google Gemini 2.5 Flash Image ("nano-banana") — GEMINI_API_KEY
        → détourage, cartoon, amélioration, fond IA, poses de danse.
          Free tier généreux, aucune carte requise.
     2) Together FLUX.1-schnell-Free — TOGETHER_API_KEY (texte→image, gratuit)
     3) Replicate — REPLICATE_API_TOKEN (payant, SECOURS uniquement)

   Images (réponse = image binaire) — POST { image: dataURL } :
     /cutout   → détourage IA du sujet
     /cartoon  → cartoon / dessin animé IA
     /enhance  → amélioration IA
     /bg       → fond IA depuis un texte  { prompt, ratio }
   Photo → vidéo qui danse :
     /frames   → { image, prompt?, n? } → { frames:[dataURL…], provider }
                 (poses générées par l'IA, la vidéo est montée dans le
                  navigateur — 100% GRATUIT, pas de crédit requis)
     /animate  → { image, prompt, model } → { id } puis /job?id= (Replicate, payant)
     /proxy?url= → rapatrie la vidéo en même origine
   GET /health = statut + quelles IA sont disponibles.
   Isolation : worker dédié (une panne n'affecte AUCUNE autre app kd-mc.com).
   ===================================================================== */

const ALLOW = [
  /^https:\/\/([a-z0-9-]+\.)?kd-mc\.com$/,
  /^https:\/\/9r4rxssx64-creator\.github\.io$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/
];
function corsHeaders(origin) {
  const ok = origin && ALLOW.some((r) => r.test(origin));
  return {
    'Access-Control-Allow-Origin': ok ? origin : 'https://studio.kd-mc.com',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}
function json(obj, headers, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ 'content-type': 'application/json', 'cache-control': 'no-store' }, headers)
  });
}
function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function imgResponse(mime, b64, h) {
  return new Response(b64ToBytes(b64), {
    status: 200,
    headers: Object.assign({ 'content-type': mime || 'image/png', 'cache-control': 'no-store' }, h)
  });
}

/* ---------------- Consignes IA par tâche (français → prompt anglais précis) --------------- */
const PROMPTS = {
  cutout: 'Remove the background completely. Keep ONLY the main subject, cut out precisely along its edges (including hair details). Output a PNG image with a fully transparent background. Do not add any new background, shadow, border or text. Keep the subject pixel-identical.',
  cartoon: 'Redraw this photo in a vivid cartoon / animated-movie style. Keep the SAME subject, same pose, same composition and same framing. Bold clean outlines, flat vibrant colors, cel shading, expressive but faithful. No text, no watermark, no border.',
  enhance: 'Enhance this photo: sharper details, cleaner lighting, better contrast and natural colors, reduce noise and blur. Keep the subject, pose, framing and composition EXACTLY the same. Photorealistic result. No text, no watermark.'
};
/* ---------------- ✨ MAGIE IA : transformations 1-clic (reverse-engineering des
   apps virales : AI Mirror, ToonApp, AI Catch, Donna IA Musique, AI Music) ------- */
const KEEP_FACE = ' Keep the SAME person and a clearly recognizable face (same features, same hair colour). Photorealistic quality where relevant. No text, no watermark, no border.';
const MAGIC = {
  /* AI Mirror — figurine / action figure / anime / 3D toon */
  figurine: 'Turn this person into a collectible action figure: a small, glossy, highly detailed toy figurine of them, standing on a real desk in soft daylight, shallow depth of field, realistic plastic material with visible seams and paint finish, miniature scale next to everyday objects.' + KEEP_FACE,
  boite: 'Turn this person into a boxed collectible action figure still sealed in its blister pack: transparent plastic bubble on a printed cardboard backing, small accessories beside the figure, product photo on a clean background, realistic packaging.' + KEEP_FACE,
  anime: 'Redraw this person in modern Japanese anime style: clean line art, expressive large eyes, soft cel shading, vibrant colours, detailed hair strands, anime background with light bokeh.' + KEEP_FACE,
  toon3d: 'Redraw this person as a charming 3D animated-movie character (Pixar/Disney style): big expressive eyes, soft rounded features, subsurface-scattering skin, cinematic soft lighting, rendered in 3D.' + KEEP_FACE,
  /* Donna — glow-up / clip look */
  glowup: 'Restyle this person as a stylish music-video shot: they stand in a neon-lit city street at night, wet reflective ground, cinematic colour grading, fashionable modern outfit, confident pose, shallow depth of field, film look.' + KEEP_FACE,
  /* AI Catch — scènes impossibles / fun */
  lion: 'Place this person at a luxurious birthday party seated next to a real majestic lion wearing a party hat: birthday cake with lit candles, balloons, elegant table, warm party lighting, both looking at the camera, photorealistic and funny.' + KEEP_FACE,
  espace: 'Place this person as an astronaut floating inside a space station with Earth visible through the window, realistic spacesuit (helmet open so the face is visible), cinematic lighting, photorealistic.' + KEEP_FACE,
  redcarpet: 'Place this person on a red carpet premiere: paparazzi flashes, elegant outfit, crowd and banners blurred in the background, glamorous cinematic lighting, photorealistic.' + KEEP_FACE,
  /* Cosplay / époques */
  cosplay: 'Restyle this person as an epic superhero: detailed original costume with cape and armour details, dramatic rim lighting, city rooftop at dusk, heroic pose, cinematic and photorealistic.' + KEEP_FACE,
  vintage: 'Restyle this person as a 1970s film photograph: period clothing and hairstyle, warm faded film colours, grain, soft vignette, authentic vintage look.' + KEEP_FACE,
  bebe: 'Show this person as an adorable small child version of themselves (about 5 years old), same recognizable facial features, cheerful, natural soft lighting, photorealistic.' + KEEP_FACE,
  vieux: 'Show this person realistically aged to about 80 years old: natural wrinkles, grey hair, same recognizable features, warm natural lighting, photorealistic.' + KEEP_FACE
};
/* Poses de bouche pour le LIP-SYNC (« je chante ») — l'app choisit selon le volume. */
const SING_POSES = [
  'mouth closed, calm confident expression, holding a microphone near the face, stage lighting',
  'mouth slightly open as if singing a soft note, eyes engaged, holding a microphone, stage lighting',
  'mouth wide open singing loudly and passionately, expressive eyebrows, holding a microphone, stage lighting'
];
/* Poses successives pour la vidéo « qui danse » (une image IA par pose). */
const DANCE_POSES = [
  'both arms raised up high, big joyful smile, leaning slightly to the left, dancing',
  'arms out to the sides, hips shifted to the right, mid dance move, happy energetic',
  'one arm pointing up to the sky (disco pose), other hand on the hip, leaning right',
  'both hands near the face, shoulders up, playful funny dance move, leaning left',
  'arms crossed in front doing a fun robot dance move, head tilted',
  'jumping slightly with both arms wide open, huge smile, celebrating',
  'hands clapping in front of the chest, bouncing, cheerful',
  'one leg lifted, arms swinging to the opposite side, lively dance step'
];
function singPrompt(pose) {
  return 'Edit this photo so the SAME person is singing on stage: ' + pose + '. '
    + 'Keep the exact same person, same face, same hair, same clothes and the same camera framing — only the mouth and expression change. '
    + 'Photorealistic. No text, no watermark, no border.';
}
function dancePrompt(pose, extra) {
  return 'Edit this photo so the SAME person is dancing: ' + pose + '. '
    + (extra ? 'Style/mood: ' + extra + '. ' : '')
    + 'Keep the exact same person, same face, same clothes, same background and same camera framing — only the body pose changes. '
    + 'Photorealistic, natural anatomy, full body visible if possible. No text, no watermark, no border.';
}

/* ---------------- Fournisseur 1 : Google Gemini (GRATUIT) ---------------- */
const GEM_MODELS = ['gemini-2.5-flash-image', 'gemini-2.0-flash-preview-image-generation'];

function parseDataUrl(u) {
  const m = /^data:([^;,]+);base64,(.+)$/.exec(String(u || ''));
  if (!m) return null;
  return { mime: m[1], b64: m[2] };
}

async function geminiImage(env, prompt, imgDataUrl) {
  const key = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
  if (!key) throw new Error('gemini_no_key');
  const parts = [{ text: prompt }];
  if (imgDataUrl) {
    const p = parseDataUrl(imgDataUrl);
    if (!p) throw new Error('bad_image_data');
    parts.push({ inline_data: { mime_type: p.mime, data: p.b64 } });
  }
  const body = JSON.stringify({
    contents: [{ parts }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
  });
  let lastErr = 'gemini_failed';
  for (const model of GEM_MODELS) {
    let r, j;
    try {
      r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
        { method: 'POST', headers: { 'content-type': 'application/json' }, body }
      );
      j = await r.json();
    } catch (e) { lastErr = 'gemini_net_' + String((e && e.message) || e).slice(0, 80); continue; }
    if (!r.ok) {
      const msg = (j && j.error && j.error.message) || '';
      lastErr = 'gemini_' + r.status + (msg ? '_' + msg.slice(0, 140) : '');
      continue;
    }
    const cand = (j && j.candidates && j.candidates[0]) || null;
    const outParts = (cand && cand.content && cand.content.parts) || [];
    for (const p of outParts) {
      const d = p.inlineData || p.inline_data;
      if (d && d.data) return { mime: d.mimeType || d.mime_type || 'image/png', b64: d.data, provider: 'gemini:' + model };
    }
    /* Pas d'image : souvent un refus de sécurité → remonter la cause exacte. */
    const fin = (cand && (cand.finishReason || cand.finish_reason)) || '';
    lastErr = 'gemini_no_image' + (fin ? '_' + fin : '');
  }
  throw new Error(lastErr);
}

/* ---------------- Fournisseur 2 : Together FLUX.1-schnell-Free (GRATUIT, texte→image) ---- */
async function togetherImage(env, prompt, ratio) {
  const key = env.TOGETHER_API_KEY;
  if (!key) throw new Error('together_no_key');
  const size = ratio === '16:9' ? [1024, 576] : ratio === '9:16' ? [576, 1024] : [1024, 1024];
  let r, j;
  try {
    r = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell-Free',
        prompt, width: size[0], height: size[1], steps: 4, n: 1, response_format: 'b64_json'
      })
    });
    j = await r.json();
  } catch (e) { throw new Error('together_net_' + String((e && e.message) || e).slice(0, 80)); }
  if (!r.ok) throw new Error('together_' + r.status + ((j && j.error && j.error.message) ? '_' + String(j.error.message).slice(0, 120) : ''));
  const b64 = j && j.data && j.data[0] && j.data[0].b64_json;
  if (!b64) throw new Error('together_no_image');
  return { mime: 'image/png', b64, provider: 'together:flux-schnell-free' };
}

/* ---------------- Fournisseur 3 : Replicate (payant — SECOURS) ---------------- */
const MODELS = {
  cutout: { owner: 'cjwbw', name: 'rembg', input: (img) => ({ image: img }),
            fb: { owner: '851-labs', name: 'background-remover', input: (img) => ({ image: img }) } },
  cartoon: { owner: 'catacolabs', name: 'cartoonify', input: (img) => ({ image: img }) },
  enhance: { owner: 'nightmareai', name: 'real-esrgan', input: (img) => ({ image: img, scale: 2, face_enhance: true }) }
};
const DEF_MOTION = 'the subject is dancing, funny energetic happy dance, lively motion';
const I2V = {
  standard: { owner: 'minimax', name: 'video-01-live', input: (img, p) => ({ first_frame_image: img, prompt: p || DEF_MOTION }) },
  quality: { owner: 'minimax', name: 'video-01', input: (img, p) => ({ first_frame_image: img, prompt: p || DEF_MOTION }) }
};
const BG = { owner: 'black-forest-labs', name: 'flux-schnell', input: (prompt, ratio) => ({ prompt: prompt, aspect_ratio: ratio || '1:1', num_outputs: 1, output_format: 'png' }) };

async function latestVersion(owner, name, token) {
  const r = await fetch(`https://api.replicate.com/v1/models/${owner}/${name}`, { headers: { Authorization: `Token ${token}` } });
  if (!r.ok) throw new Error('model_lookup_' + r.status);
  const j = await r.json();
  const v = j && j.latest_version && j.latest_version.id;
  if (!v) throw new Error('no_version');
  return v;
}
async function createPrediction(version, input, token) {
  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ version, input })
  });
  const pred = await res.json();
  if (pred.error) throw new Error('create_' + pred.error);
  return pred;
}
function pickOutput(pred) {
  let out = pred.output;
  if (Array.isArray(out)) out = out[out.length - 1];
  return (out && typeof out === 'string') ? out : null;
}
async function pollUntilDone(pred, token) {
  const started = Date.now();
  while (pred.status === 'starting' || pred.status === 'processing') {
    if (Date.now() - started > 58000) throw new Error('timeout');
    await new Promise((r) => setTimeout(r, 1500));
    pred = await (await fetch(pred.urls.get, { headers: { Authorization: `Token ${token}` } })).json();
  }
  if (pred.status !== 'succeeded') throw new Error('model_' + (pred.error || pred.status || 'failed'));
  const out = pickOutput(pred);
  if (!out) throw new Error('no_output');
  return out;
}
async function runImageModel(cfg, buildInput, token, h) {
  const version = await latestVersion(cfg.owner, cfg.name, token);
  const pred = await createPrediction(version, buildInput, token);
  const outUrl = await pollUntilDone(pred, token);
  const img = await fetch(outUrl);
  if (!img.ok) throw new Error('fetch_out_' + img.status);
  const ct = img.headers.get('content-type') || 'image/png';
  return new Response(img.body, { status: 200, headers: Object.assign({ 'content-type': ct, 'cache-control': 'no-store' }, h) });
}

/* ---------------- Chaîne : gratuit d'abord, payant en secours ---------------- */
async function editImageChain(env, kind, imgDataUrl, h) {
  const errs = [];
  /* 1. Gemini (gratuit) */
  try {
    const g = await geminiImage(env, PROMPTS[kind], imgDataUrl);
    return imgResponse(g.mime, g.b64, Object.assign({ 'x-crea-provider': g.provider }, h));
  } catch (e) { errs.push(String((e && e.message) || e)); }
  /* 2. Replicate (payant) */
  const token = env.REPLICATE_API_TOKEN;
  if (token) {
    const m = MODELS[kind];
    try {
      return await runImageModel(m, m.input(imgDataUrl), token, Object.assign({ 'x-crea-provider': 'replicate' }, h));
    } catch (e1) {
      errs.push(String((e1 && e1.message) || e1));
      if (m.fb) {
        try { return await runImageModel(m.fb, m.fb.input(imgDataUrl), token, Object.assign({ 'x-crea-provider': 'replicate-fb' }, h)); }
        catch (e2) { errs.push(String((e2 && e2.message) || e2)); }
      }
    }
  } else errs.push('replicate_no_key');
  throw new Error(errs.join(' | '));
}

async function textToImageChain(env, prompt, ratio, h) {
  const errs = [];
  try {
    const g = await geminiImage(env, prompt + '. High quality, detailed, no text, no watermark.', null);
    return imgResponse(g.mime, g.b64, Object.assign({ 'x-crea-provider': g.provider }, h));
  } catch (e) { errs.push(String((e && e.message) || e)); }
  try {
    const t = await togetherImage(env, prompt, ratio);
    return imgResponse(t.mime, t.b64, Object.assign({ 'x-crea-provider': t.provider }, h));
  } catch (e) { errs.push(String((e && e.message) || e)); }
  const token = env.REPLICATE_API_TOKEN;
  if (token) {
    try { return await runImageModel(BG, BG.input(prompt, ratio), token, Object.assign({ 'x-crea-provider': 'replicate' }, h)); }
    catch (e) { errs.push(String((e && e.message) || e)); }
  } else errs.push('replicate_no_key');
  throw new Error(errs.join(' | '));
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin') || '';
    const h = corsHeaders(origin);
    const token = env.REPLICATE_API_TOKEN;
    const freeAI = !!(env.GEMINI_API_KEY || env.GOOGLE_API_KEY);

    if (req.method === 'OPTIONS') return new Response(null, { headers: h });
    if (url.pathname === '/health') {
      return json({
        ok: true,
        configured: !!(freeAI || token),
        free: freeAI,                    // IA gratuite (Gemini) disponible
        together: !!env.TOGETHER_API_KEY, // repli gratuit texte→image
        paid: !!token                    // Replicate (secours payant)
      }, h);
    }

    // --- suivi d'un job vidéo Replicate (async) ---
    if (url.pathname === '/job' && req.method === 'GET') {
      if (!token) return json({ error: 'not_configured' }, h, 503);
      const id = url.searchParams.get('id') || '';
      if (!/^[a-zA-Z0-9]+$/.test(id)) return json({ error: 'bad_id' }, h, 400);
      try {
        const pred = await (await fetch('https://api.replicate.com/v1/predictions/' + id, { headers: { Authorization: `Token ${token}` } })).json();
        return json({ status: pred.status, output: pred.status === 'succeeded' ? pickOutput(pred) : null, error: pred.error || null }, h);
      } catch (e) { return json({ error: String((e && e.message) || e) }, h, 502); }
    }

    // --- rapatrie la vidéo générée en même origine ---
    if (url.pathname === '/proxy' && req.method === 'GET') {
      const u = url.searchParams.get('url') || '';
      if (!/^https:\/\/[a-z0-9.-]*replicate\.delivery\//.test(u)) return json({ error: 'bad_url' }, h, 400);
      try {
        const rr = await fetch(u);
        if (!rr.ok) return json({ error: 'fetch_' + rr.status }, h, 502);
        return new Response(rr.body, { status: 200, headers: Object.assign({ 'content-type': rr.headers.get('content-type') || 'video/mp4', 'cache-control': 'no-store' }, h) });
      } catch (e) { return json({ error: String((e && e.message) || e) }, h, 502); }
    }

    if (req.method !== 'POST') return json({ error: 'post_only' }, h, 405);
    if (!freeAI && !token) return json({ error: 'not_configured' }, h, 503);

    let body = null;
    try { body = await req.json(); } catch (_) { return json({ error: 'bad_json' }, h, 400); }
    const image = body && body.image;
    const badImage = (v) => (!v || typeof v !== 'string' || v.length > 12 * 1024 * 1024);

    // --- ✨ MAGIE : transformation 1-clic de la photo (figurine, anime, scène…) ---
    if (url.pathname === '/magic') {
      if (badImage(image)) return json({ error: 'bad_image' }, h, 400);
      const preset = (body && typeof body.preset === 'string') ? body.preset : '';
      const custom = (body && typeof body.custom === 'string') ? body.custom.slice(0, 300) : '';
      const prompt = MAGIC[preset] || (custom ? ('Edit this photo: ' + custom + '.' + KEEP_FACE) : '');
      if (!prompt) return json({ error: 'unknown_preset' }, h, 400);
      const errs = [];
      try {
        const g = await geminiImage(env, prompt, image);
        return imgResponse(g.mime, g.b64, Object.assign({ 'x-crea-provider': g.provider }, h));
      } catch (e) { errs.push(String((e && e.message) || e)); }
      return json({ error: errs.join(' | ') }, h, 502);
    }

    // --- 🎵 PAROLES DE CHANSON (texte IA gratuit) ---
    if (url.pathname === '/lyrics') {
      if (!freeAI) return json({ error: 'gemini_no_key' }, h, 503);
      const theme = (body && typeof body.theme === 'string') ? body.theme.slice(0, 300) : '';
      const style = (body && typeof body.style === 'string') ? body.style.slice(0, 60) : 'pop';
      if (!theme) return json({ error: 'no_theme' }, h, 400);
      const key = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
      const ask = 'Écris une chanson originale en FRANÇAIS, style ' + style + ', sur : ' + theme
        + '.\nFormat EXACT, rien d\'autre :\nTITRE: <titre court>\nCOUPLET 1:\n<4 lignes>\nREFRAIN:\n<4 lignes accrocheuses et répétables>\nCOUPLET 2:\n<4 lignes>\nRefrain court, rimes simples, facile à chanter. Pas d\'explications.';
      try {
        const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(key),
          { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: ask }] }] }) });
        const j = await r.json();
        if (!r.ok) return json({ error: 'gemini_' + r.status + '_' + (((j && j.error && j.error.message) || '')).slice(0, 140) }, h, 502);
        const parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
        const text = parts.map((p) => p.text || '').join('').trim();
        if (!text) return json({ error: 'no_lyrics' }, h, 502);
        const t = /TITRE\s*:\s*(.+)/i.exec(text);
        return json({ title: (t ? t[1] : 'Ma chanson').trim().slice(0, 80), lyrics: text, style }, h);
      } catch (e) { return json({ error: String((e && e.message) || e) }, h, 502); }
    }

    // --- POSES (danse OU chant) : photo → vidéo, GRATUIT via Gemini ---
    if (url.pathname === '/frames') {
      if (badImage(image)) return json({ error: 'bad_image' }, h, 400);
      if (!freeAI) return json({ error: 'gemini_no_key' }, h, 503);
      const extra = (body && typeof body.prompt === 'string') ? body.prompt.slice(0, 200) : '';
      const mode = (body && body.mode) === 'sing' ? 'sing' : 'dance';
      const n = Math.max(2, Math.min(8, parseInt((body && body.n), 10) || (mode === 'sing' ? 3 : 5)));
      const poses = mode === 'sing' ? SING_POSES.slice(0, n) : DANCE_POSES.slice(0, n);
      const res = await Promise.allSettled(poses.map((p) => geminiImage(env, mode === 'sing' ? singPrompt(p) : dancePrompt(p, extra), image)));
      const frames = [];
      const errs = [];
      res.forEach((r) => {
        if (r.status === 'fulfilled') frames.push('data:' + r.value.mime + ';base64,' + r.value.b64);
        else errs.push(String((r.reason && r.reason.message) || r.reason));
      });
      if (frames.length < 2) return json({ error: (errs[0] || 'frames_failed'), got: frames.length }, h, 502);
      return json({ frames, provider: 'gemini', asked: n, got: frames.length, errors: errs.slice(0, 2) }, h);
    }

    // --- lancement génération vidéo Replicate (payant) ---
    if (url.pathname === '/animate') {
      if (!token) return json({ error: 'not_configured' }, h, 503);
      if (badImage(image)) return json({ error: 'bad_image' }, h, 400);
      try {
        const prompt = (body && typeof body.prompt === 'string') ? body.prompt.slice(0, 400) : '';
        const cfg = I2V[(body && body.model) || 'standard'] || I2V.standard;
        const version = await latestVersion(cfg.owner, cfg.name, token);
        const pred = await createPrediction(version, cfg.input(image, prompt), token);
        return json({ id: pred.id, status: pred.status }, h);
      } catch (e) { return json({ error: String((e && e.message) || e) }, h, 502); }
    }

    // --- fond IA (texte → image) ---
    if (url.pathname === '/bg') {
      const prompt = (body && typeof body.prompt === 'string') ? body.prompt.slice(0, 400) : '';
      if (!prompt) return json({ error: 'no_prompt' }, h, 400);
      try { return await textToImageChain(env, prompt, body && body.ratio, h); }
      catch (e) { return json({ error: String((e && e.message) || e) }, h, 502); }
    }

    // --- images (cutout / cartoon / enhance) ---
    const kind = url.pathname === '/cartoon' ? 'cartoon' : url.pathname === '/enhance' ? 'enhance' : url.pathname === '/cutout' ? 'cutout' : '';
    if (!kind) return json({ error: 'unknown_endpoint' }, h, 404);
    if (badImage(image)) return json({ error: 'bad_image' }, h, 400);
    try { return await editImageChain(env, kind, image, h); }
    catch (e) { return json({ error: String((e && e.message) || e) }, h, 502); }
  }
};
