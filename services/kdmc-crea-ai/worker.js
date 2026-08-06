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
  vieux: 'Show this person realistically aged to about 80 years old: natural wrinkles, grey hair, same recognizable features, warm natural lighting, photorealistic.' + KEEP_FACE,
  /* Gio — photo pro / CV / shooting */
  cv: 'Turn this into a professional corporate headshot: the person wears an elegant dark business suit, neutral studio background, soft flattering key light, sharp focus on the eyes, confident friendly expression, LinkedIn/CV quality.' + KEEP_FACE,
  nb: 'Turn this into a high-end black and white studio portrait: dramatic side lighting, deep blacks and clean whites, fine grain, editorial fashion look, sharp eyes.' + KEEP_FACE,
  shooting: 'Turn this into a magazine fashion shooting photo: stylish outfit, professional studio lighting with coloured gels, confident pose, editorial composition, ultra sharp, high-end retouching.' + KEEP_FACE,
  passeport: 'Turn this into a compliant ID/passport photo: plain light grey background, even frontal lighting, neutral expression, face centred and fully visible, shoulders straight, no shadow.' + KEEP_FACE,
  /* Face Maker — coiffures IA */
  coif_court: 'Change ONLY the hairstyle: give this person a modern short haircut, clean fade on the sides, neatly styled on top. Keep the exact same face, expression, clothes and background.' + KEEP_FACE,
  coif_long: 'Change ONLY the hairstyle: give this person long flowing hair, healthy and well styled. Keep the exact same face, expression, clothes and background.' + KEEP_FACE,
  coif_boucle: 'Change ONLY the hairstyle: give this person natural voluminous curly hair. Keep the exact same face, expression, clothes and background.' + KEEP_FACE,
  coif_blond: 'Change ONLY the hair colour to a natural blond, keeping the same haircut. Keep the exact same face, expression, clothes and background.' + KEEP_FACE,
  coif_barbe: 'Change ONLY the facial hair: give this person a well-groomed full beard that suits their face. Keep the exact same face, eyes, expression, clothes and background.' + KEEP_FACE,
  coif_rase: 'Change ONLY the hair: give this person a clean shaved head (and no beard), realistic scalp. Keep the exact same face, expression, clothes and background.' + KEEP_FACE,
  /* Trends virales */
  muscle: 'Show this person with an impressively athletic muscular body at the gym, same head and face, realistic sportswear, gym lighting, photorealistic and flattering.' + KEEP_FACE,
  bebedanse: 'Turn this person into an adorable chubby baby version dancing in the street wearing sunglasses, a gold chain and floral shorts, warm golden-hour light, funny and cute, photorealistic 3D render.' + KEEP_FACE,
  drole: 'Make a funny cartoon caricature of this person: exaggerated proportions (big head, small body), goofy joyful expression, comic style, funny but friendly, colourful background.' + KEEP_FACE
};
/* Scènes à DEUX photos (Hype AI : réunir deux personnes). */
const DUO = {
  souvenir: 'Create one single warm photo where the person from the FIRST image and the person from the SECOND image are together side by side, standing close and smiling, soft golden light, peaceful beautiful garden background. Keep BOTH faces clearly recognizable and unchanged. Natural, respectful and photorealistic. No text, no watermark.',
  famille: 'Create one single natural family photo where the person from the FIRST image and the person from the SECOND image pose together, warm indoor light, both smiling at the camera. Keep BOTH faces clearly recognizable and unchanged. Photorealistic. No text.',
  couple: 'Create one single romantic photo where the person from the FIRST image and the person from the SECOND image are together at sunset by the sea, happy and relaxed. Keep BOTH faces clearly recognizable and unchanged. Photorealistic. No text.',
  fete: 'Create one single festive photo where the person from the FIRST image and the person from the SECOND image celebrate together with balloons and a cake, joyful party lighting. Keep BOTH faces clearly recognizable and unchanged. Photorealistic. No text.'
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

async function geminiImage(env, prompt, imgDataUrl, extraImg) {
  const key = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
  if (!key) throw new Error('gemini_no_key');
  const parts = [{ text: prompt }];
  if (imgDataUrl) {
    const p = parseDataUrl(imgDataUrl);
    if (!p) throw new Error('bad_image_data');
    parts.push({ inline_data: { mime_type: p.mime, data: p.b64 } });
  }
  if (extraImg) {                       /* 2e image : duo, ou pose de référence */
    const p2 = parseDataUrl(extraImg);
    if (!p2) throw new Error('bad_image_data2');
    parts.push({ inline_data: { mime_type: p2.mime, data: p2.b64 } });
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

/* ---------------- Fournisseur 1bis : Cloudflare Workers AI (GRATUIT, même compte) -------
   Free tier quotidien, binding direct (aucune clé). Sert de vrai secours ET de
   renfort parallèle. FLUX pour l'image, MeloTTS pour la voix chantée du Studio. */
async function cfImage(env, prompt) {
  if (!env.AI) throw new Error('cf_no_binding');
  const p = String(prompt).slice(0, 1800);
  const errs = [];
  for (const model of CF_IMG_MODELS) {
    try {
      const r = await env.AI.run(model, /flux/.test(model) ? { prompt: p, steps: 4 } : { prompt: p });
      /* flux renvoie { image: "<base64>" } ; d'autres renvoient un flux binaire */
      if (r && typeof r.image === 'string' && r.image.length > 100) return { mime: 'image/jpeg', b64: r.image, provider: 'cloudflare:' + model.split('/').pop() };
      if (r instanceof ReadableStream) {
        const u = new Uint8Array(await new Response(r).arrayBuffer());
        if (u.length > 100) { let s = ''; for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
          return { mime: 'image/png', b64: btoa(s), provider: 'cloudflare:' + model.split('/').pop() }; }
      }
      errs.push(model.split('/').pop() + ':vide');
    } catch (e) { errs.push(model.split('/').pop() + ':' + String((e && e.message) || e).slice(0, 60)); }
  }
  throw new Error('cf_' + errs.join(' ; ').slice(0, 240));
}
/* Plusieurs modèles candidats, essayés dans l'ordre. Un seul modèle figé =
   une dépréciation (vécu : llama-3.1-8b retiré le 2026-05-30) casse la feature
   du jour au lendemain, en silence. */
const CF_TXT_MODELS = [
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  '@cf/meta/llama-4-scout-17b-16e-instruct',
  '@cf/mistralai/mistral-small-3.1-24b-instruct',
  '@cf/google/gemma-3-12b-it',
  '@cf/meta/llama-3.1-8b-instruct-fast',
];
const CF_TTS_TRIES = [
  { model: '@cf/myshell-ai/melotts', input: (t, l) => ({ prompt: t, lang: l || 'fr' }) },
  { model: '@cf/myshell-ai/melotts', input: (t) => ({ prompt: t }) },
  { model: '@cf/myshell-ai/melotts', input: (t) => ({ prompt: t, lang: 'en' }) },
  { model: '@cf/deepgram/aura-1', input: (t) => ({ text: t, speaker: 'angus' }) },
  { model: '@cf/deepgram/aura-1', input: (t) => ({ text: t }) },
];
const CF_IMG_MODELS = [
  '@cf/black-forest-labs/flux-1-schnell',
  '@cf/stabilityai/stable-diffusion-xl-base-1.0',
  '@cf/bytedance/stable-diffusion-xl-lightning',
];
/* Écriture de texte par Cloudflare Workers AI — GRATUIT, aucune clé.
   Sert de secours quand Gemini tombe : sans ça, une panne Gemini = plus de
   paroles NI de partition, donc plus de morceau du tout. */
async function cfText(env, prompt, wantJson) {
  if (!env.AI) throw new Error('cf_no_binding');
  const input = {
    messages: [
      { role: 'system', content: wantJson
          ? 'Tu reponds UNIQUEMENT par un JSON valide, sans texte autour, sans balises markdown.'
          : 'Tu ecris en francais, en respectant EXACTEMENT le format demande, sans explications.' },
      { role: 'user', content: String(prompt).slice(0, 4000) },
    ],
    max_tokens: wantJson ? 900 : 700,
  };
  const errs = [];
  for (const model of CF_TXT_MODELS) {
    try {
      const r = await env.AI.run(model, input);
      const t = String((r && (r.response || (r.result && r.result.response) || r.text)) || '').trim();
      if (t) return t;
      errs.push(model.split('/').pop() + ':vide');
    } catch (e) { errs.push(model.split('/').pop() + ':' + String((e && e.message) || e).slice(0, 60)); }
  }
  throw new Error('cf_' + errs.join(' ; ').slice(0, 240));
}

async function cfSpeech(env, text, lang) {
  if (!env.AI) throw new Error('cf_no_binding');
  const t = String(text || '').slice(0, 1800);
  const errs = [];
  for (const cand of CF_TTS_TRIES) {
    try {
      const r = await env.AI.run(cand.model, cand.input(t, lang));
      if (r && typeof r.audio === 'string' && r.audio.length > 100) return { mime: 'audio/mpeg', b64: r.audio, model: cand.model };
      if (r instanceof ReadableStream) {
        const buf = new Uint8Array(await new Response(r).arrayBuffer());
        if (buf.length > 100) {
          let bin = ''; for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
          return { mime: 'audio/mpeg', b64: btoa(bin), model: cand.model };
        }
      }
      errs.push(cand.model.split('/').pop() + ':vide');
    } catch (e) { errs.push(cand.model.split('/').pop() + ':' + String((e && e.message) || e).slice(0, 60)); }
  }
  throw new Error('cf_' + errs.join(' ; ').slice(0, 240));
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

/* Course : plusieurs moteurs GRATUITS lancés EN MÊME TEMPS, on garde le premier
   qui rend une image. Plus rapide qu'en file d'attente, et si l'un tombe (quota,
   panne) l'autre a déjà pris le relais — sans attendre son échec. */
async function firstOf(tasks) {
  const errs = [];
  return await new Promise((resolve, reject) => {
    let left = tasks.length, done = false;
    if (!left) return reject(new Error('no_provider'));
    tasks.forEach((t) => {
      Promise.resolve().then(t).then((v) => { if (!done) { done = true; resolve(v); } },
        (e) => { errs.push(String((e && e.message) || e)); if (--left === 0 && !done) reject(new Error(errs.join(' | '))); });
    });
  });
}
async function textToImageChain(env, prompt, ratio, h) {
  const full = prompt + '. High quality, detailed, no text, no watermark.';
  const errs = [];
  /* 1) Les deux moteurs gratuits COURENT ENSEMBLE (le plus rapide gagne). */
  try {
    const r = await firstOf([
      () => geminiImage(env, full, null),
      () => cfImage(env, full)
    ]);
    return imgResponse(r.mime, r.b64, Object.assign({ 'x-crea-provider': r.provider }, h));
  } catch (e) { errs.push(String((e && e.message) || e)); }
  /* 2) 3e gratuit */
  try {
    const t = await togetherImage(env, prompt, ratio);
    return imgResponse(t.mime, t.b64, Object.assign({ 'x-crea-provider': t.provider }, h));
  } catch (e) { errs.push(String((e && e.message) || e)); }
  /* 3) payant en tout dernier */
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
    /* --- 🔎 SONDE MODÈLES (diagnostic) ---
       Je n'ai pas accès à Cloudflare depuis l'agent : cette sonde, lancée par la
       CI, dit QUELS modèles répondent vraiment aujourd'hui. Sans elle, un modèle
       déprécié (vécu : llama-3.1-8b retiré le 2026-05-30) se découvre en
       devinant, un déploiement à la fois. Lecture seule, aucune donnée écrite. */
    if (url.pathname === '/aidiag') {
      if (!env.AI) return json({ error: 'cf_no_binding' }, h, 503);
      const out = { text: [], tts: [], img: [] };
      for (const m of CF_TXT_MODELS) {
        try {
          const r = await env.AI.run(m, { messages: [{ role: 'user', content: 'Dis bonjour en 3 mots.' }], max_tokens: 24 });
          const t = String((r && (r.response || (r.result && r.result.response))) || '').trim();
          out.text.push({ m, ok: !!t, sample: t.slice(0, 40) });
        } catch (e) { out.text.push({ m, ok: false, err: String((e && e.message) || e).slice(0, 110) }); }
      }
      for (const c of CF_TTS_TRIES) {
        const shape = Object.keys(c.input('x', 'fr')).join('+');
        try {
          const r = await env.AI.run(c.model, c.input('bonjour tout le monde', 'fr'));
          let n = 0;
          if (r && typeof r.audio === 'string') n = r.audio.length;
          else if (r instanceof ReadableStream) n = (await new Response(r).arrayBuffer()).byteLength;
          out.tts.push({ m: c.model, shape, ok: n > 100, size: n });
        } catch (e) { out.tts.push({ m: c.model, shape, ok: false, err: String((e && e.message) || e).slice(0, 110) }); }
      }
      for (const m of CF_IMG_MODELS) {
        try {
          const r = await env.AI.run(m, /flux/.test(m) ? { prompt: 'a red apple', steps: 4 } : { prompt: 'a red apple' });
          let n = 0;
          if (r && typeof r.image === 'string') n = r.image.length;
          else if (r instanceof ReadableStream) n = (await new Response(r).arrayBuffer()).byteLength;
          out.img.push({ m, ok: n > 100, size: n });
        } catch (e) { out.img.push({ m, ok: false, err: String((e && e.message) || e).slice(0, 110) }); }
      }
      return json(out, h);
    }

    if (url.pathname === '/health') {
      return json({
        ok: true,
        configured: !!(freeAI || token || env.AI),
        free: freeAI,                    // IA gratuite (Gemini) disponible
        together: !!env.TOGETHER_API_KEY, // repli gratuit texte→image
        cloudflare: !!env.AI,            // 2e IA gratuite (image + voix + texte)
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
    /* Workers AI compte comme moteur : sans ce test, une clé Gemini absente
       fermait TOUTE l'app alors que la 2e IA gratuite est disponible. */
    if (!freeAI && !token && !env.AI) return json({ error: 'not_configured' }, h, 503);

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
      /* Gemini sait ÉDITER la photo (garde le visage) → toujours en premier. */
      try {
        const g = await geminiImage(env, prompt, image);
        return imgResponse(g.mime, g.b64, Object.assign({ 'x-crea-provider': g.provider }, h));
      } catch (e) { errs.push(String((e && e.message) || e)); }
      /* Secours GRATUIT réel (Workers AI) : il ne peut pas repartir de la photo,
         il recrée la scène décrite — moins fidèle, mais mieux que « rien ». */
      try {
        const c = await cfImage(env, prompt.replace(/Keep the SAME person[^.]*\./g, '') + ' Portrait, cinematic, detailed.');
        return imgResponse(c.mime, c.b64, Object.assign({ 'x-crea-provider': c.provider, 'x-crea-fallback': 'recreated' }, h));
      } catch (e2) { errs.push(String((e2 && e2.message) || e2)); }
      return json({ error: errs.join(' | ') }, h, 502);
    }

    // --- 👥 DUO : réunir DEUX photos dans une même scène (Hype AI) ---
    if (url.pathname === '/duo') {
      if (badImage(image)) return json({ error: 'bad_image' }, h, 400);
      const img2 = body && body.image2;
      if (badImage(img2)) return json({ error: 'bad_image2' }, h, 400);
      const p = DUO[(body && body.preset)] || DUO.souvenir;
      try {
        const g = await geminiImage(env, p, image, img2);
        return imgResponse(g.mime, g.b64, Object.assign({ 'x-crea-provider': g.provider }, h));
      } catch (e) { return json({ error: String((e && e.message) || e) }, h, 502); }
    }

    // --- 🕺 REJOUER UNE VRAIE VIDÉO : chaque pose de référence est refaite
    //     avec la personne de la photo (Pose / Dance AI / CapCut templates) ---
    if (url.pathname === '/pose') {
      if (badImage(image)) return json({ error: 'bad_image' }, h, 400);
      if (!freeAI) return json({ error: 'gemini_no_key' }, h, 503);
      const refs = (body && Array.isArray(body.poses)) ? body.poses.slice(0, 6) : [];
      if (refs.length < 2) return json({ error: 'need_poses' }, h, 400);
      const ask = 'You are given TWO images. The FIRST is a person. The SECOND shows a reference body pose. '
        + 'Redraw the person from the FIRST image adopting EXACTLY the same body pose, arm and leg positions as in the SECOND image. '
        + 'Keep the person\'s own face, hair, clothes and background from the FIRST image — copy ONLY the pose. '
        + 'Full body if possible, natural anatomy, photorealistic. No text, no watermark, no border.';
      const res = await Promise.allSettled(refs.map((r) => geminiImage(env, ask, image, r)));
      const frames = [], errs = [];
      res.forEach((r) => {
        if (r.status === 'fulfilled') frames.push('data:' + r.value.mime + ';base64,' + r.value.b64);
        else errs.push(String((r.reason && r.reason.message) || r.reason));
      });
      if (frames.length < 2) return json({ error: (errs[0] || 'pose_failed'), got: frames.length }, h, 502);
      return json({ frames, provider: 'gemini', asked: refs.length, got: frames.length, errors: errs.slice(0, 2) }, h);
    }

    // --- 🎙 VOIX CHANTÉE (Studio) : le texte est dit par une vraie voix de
    //     synthèse (Cloudflare Workers AI, gratuit). L'app la met en musique :
    //     calage sur le tempo + correction de hauteur sur la mélodie. ---
    if (url.pathname === '/voice') {
      const text = (body && typeof body.text === 'string') ? body.text.slice(0, 1500) : '';
      if (!text) return json({ error: 'no_text' }, h, 400);
      try {
        const v = await cfSpeech(env, text, (body && body.lang) || 'fr');
        return new Response(b64ToBytes(v.b64), {
          status: 200,
          headers: Object.assign({ 'content-type': v.mime, 'cache-control': 'no-store', 'x-crea-provider': 'cloudflare:melotts' }, h)
        });
      } catch (e) { return json({ error: String((e && e.message) || e) }, h, 502); }
    }

    // --- 🎼 PARTITION : l'IA compose la structure (accords, mélodie, tempo) que
    //     le téléphone joue en multi-pistes → « studio » complet et gratuit. ---
    if (url.pathname === '/compose') {
      const style = (body && typeof body.style === 'string') ? body.style.slice(0, 40) : 'pop';
      const mood = (body && typeof body.mood === 'string') ? body.mood.slice(0, 80) : '';
      const key = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
      const ask = 'Tu es compositeur. Donne UNIQUEMENT un JSON valide (aucun texte autour) pour un morceau '
        + style + (mood ? ' , ambiance ' + mood : '') + ' :\n'
        + '{"bpm":<60-160>,"key":<0-11 (0=Do)>,"scale":"major"|"minor",'
        + '"progression":[<4 à 8 degrés entre 0 et 6>],'
        + '"melody":[<16 à 32 entiers, degrés -7..14, -99 = silence>],'
        + '"drums":{"kick":[<16 0/1>],"snare":[<16 0/1>],"hat":[<16 0/1>]},'
        + '"bassPattern":[<8 à 16 entiers 0..7>]}\n'
        + 'Cohérent musicalement, refrain accrocheur, rien d\'autre que le JSON.';
      const parseScore = (txt) => {
        let sc = null;
        const m = /\{[\s\S]*\}/.exec(String(txt || ''));   /* tolère du bavardage autour */
        try { sc = JSON.parse((m ? m[0] : String(txt)).replace(/^```json\s*|```$/g, '')); } catch (_) { }
        return (sc && Array.isArray(sc.melody)) ? sc : null;
      };
      const errs = [];
      if (key) {
        try {
          const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(key),
            { method: 'POST', headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: ask }] }], generationConfig: { responseMimeType: 'application/json' } }) });
          const j = await r.json();
          if (!r.ok) errs.push('gemini_' + r.status);
          else {
            const parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
            const score = parseScore(parts.map((p) => p.text || '').join('').trim());
            if (score) return json({ score, style, provider: 'gemini' }, h);
            errs.push('gemini_bad_score');
          }
        } catch (e) { errs.push('gemini_' + String((e && e.message) || e).slice(0, 80)); }
      } else errs.push('gemini_no_key');
      /* SECOURS GRATUIT : Workers AI écrit la partition à la place */
      try {
        const score = parseScore(await cfText(env, ask, true));
        if (score) return json({ score, style, provider: 'cloudflare', fallback: errs[0] || '' }, h);
        errs.push('cf_bad_score');
      } catch (e) { const m = String((e && e.message) || e); errs.push((/^cf_/.test(m) ? m : 'cf_' + m).slice(0, 160)); }
      return json({ error: errs.join(' | ') }, h, 502);
    }

    // --- 🎵 PAROLES DE CHANSON (texte IA gratuit) ---
    if (url.pathname === '/lyrics') {
      const theme = (body && typeof body.theme === 'string') ? body.theme.slice(0, 300) : '';
      const style = (body && typeof body.style === 'string') ? body.style.slice(0, 60) : 'pop';
      if (!theme) return json({ error: 'no_theme' }, h, 400);
      const key = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
      const mode = (body && body.mode) === 'voix' ? 'voix' : ((body && body.mode) === 'perso' ? 'perso' : 'simple');
      const ask = mode === 'voix'
        /* Shoom « Voix » : un texte calibré à lire au micro (~30 s) */
        ? ('Écris un TEXTE À LIRE À VOIX HAUTE en FRANÇAIS, à enregistrer en 30 secondes environ (75 à 90 mots), '
           + 'sur : ' + theme + '. Ton : ' + style + '. Phrases courtes, rythmées, faciles à dire, avec un refrain répété 2 fois.\n'
           + 'Format EXACT, rien d\'autre :\nTITRE: <titre court>\nTEXTE:\n<le texte à lire>')
        : (mode === 'perso'
          ? ('Écris une chanson originale en FRANÇAIS, style ' + style + ', sur : ' + theme
             + '.\nFormat EXACT, rien d\'autre :\nTITRE: <titre court>\nCOUPLET 1:\n<4 lignes>\nREFRAIN:\n<4 lignes>\nCOUPLET 2:\n<4 lignes>\nPONT:\n<2 lignes>\nREFRAIN FINAL:\n<4 lignes>\nRimes riches, images fortes, vocabulaire varié. Pas d\'explications.')
          : ('Écris une chanson originale en FRANÇAIS, style ' + style + ', sur : ' + theme
             + '.\nFormat EXACT, rien d\'autre :\nTITRE: <titre court>\nCOUPLET 1:\n<4 lignes>\nREFRAIN:\n<4 lignes accrocheuses et répétables>\nCOUPLET 2:\n<4 lignes>\nRefrain court, rimes simples, facile à chanter. Pas d\'explications.'));
      const outLyrics = (text, provider, why) => {
        const t = /TITRE\s*:\s*(.+)/i.exec(text);
        return json({ title: (t ? t[1] : 'Ma chanson').trim().slice(0, 80), lyrics: text, style, mode, provider, fallback: why || '' }, h);
      };
      const errs = [];
      if (key) {
        try {
          const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(key),
            { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: ask }] }] }) });
          const j = await r.json();
          if (!r.ok) errs.push('gemini_' + r.status + '_' + (((j && j.error && j.error.message) || '')).slice(0, 120));
          else {
            const parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
            const text = parts.map((p) => p.text || '').join('').trim();
            if (text) return outLyrics(text, 'gemini');
            errs.push('gemini_no_lyrics');
          }
        } catch (e) { errs.push('gemini_' + String((e && e.message) || e).slice(0, 80)); }
      } else errs.push('gemini_no_key');
      /* SECOURS GRATUIT : Workers AI écrit les paroles à la place */
      try {
        const text = await cfText(env, ask, false);
        if (text) return outLyrics(text, 'cloudflare', errs[0] || '');
        errs.push('cf_no_lyrics');
      } catch (e) { const m = String((e && e.message) || e); errs.push((/^cf_/.test(m) ? m : 'cf_' + m).slice(0, 160)); }
      return json({ error: errs.join(' | ') }, h, 502);
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
