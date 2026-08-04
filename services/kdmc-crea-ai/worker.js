/* =====================================================================
   kdmc-crea-ai — Worker IA pour Créa Studio (studio.kd-mc.com)
   Proxy vers Replicate (clé REPLICATE_API_TOKEN côté serveur, jamais exposée).

   Images (rapide, réponse = image binaire) — POST { image: dataURL } :
     /cutout   → détourage IA du sujet (fond transparent)
     /cartoon  → cartoon / dessin animé IA
     /enhance  → amélioration / upscale IA
   Vidéo depuis une photo (lent 1-3 min → asynchrone) :
     POST /animate  { image: dataURL, prompt } → { id, status }
     GET  /job?id=… → { status, output(url|null), error }
     GET  /proxy?url=… → rapatrie la vidéo (replicate.delivery) en même origine
   GET /health = statut.
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

/* Modèles Replicate (résolus à leur dernière version au runtime, pas de hash figé). */
const MODELS = {
  cutout:  { owner: 'cjwbw',       name: 'rembg',       input: (img) => ({ image: img }) },
  cartoon: { owner: 'catacolabs',  name: 'cartoonify',  input: (img) => ({ image: img }) },
  enhance: { owner: 'nightmareai', name: 'real-esrgan', input: (img) => ({ image: img, scale: 2, face_enhance: true }) }
};
/* Image → vidéo (photo qui « prend vie » / danse) — minimax video-01-live est conçu pour animer une image. */
const I2V = {
  owner: 'minimax', name: 'video-01-live',
  input: (img, prompt) => ({ first_frame_image: img, prompt: prompt || 'the subject is dancing, funny energetic happy dance, lively motion' })
};

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

/* Sync (images rapides) : crée + attend + renvoie l'URL du résultat. */
async function runModelSync(kind, image, token) {
  const m = MODELS[kind];
  const version = await latestVersion(m.owner, m.name, token);
  let pred = await createPrediction(version, m.input(image), token);
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

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin') || '';
    const h = corsHeaders(origin);
    const token = env.REPLICATE_API_TOKEN;

    if (req.method === 'OPTIONS') return new Response(null, { headers: h });
    if (url.pathname === '/health') return json({ ok: true, configured: !!token }, h);

    // --- suivi d'un job vidéo (async) ---
    if (url.pathname === '/job' && req.method === 'GET') {
      if (!token) return json({ error: 'not_configured' }, h, 503);
      const id = url.searchParams.get('id') || '';
      if (!/^[a-zA-Z0-9]+$/.test(id)) return json({ error: 'bad_id' }, h, 400);
      try {
        const pred = await (await fetch('https://api.replicate.com/v1/predictions/' + id, { headers: { Authorization: `Token ${token}` } })).json();
        return json({ status: pred.status, output: pred.status === 'succeeded' ? pickOutput(pred) : null, error: pred.error || null }, h);
      } catch (e) { return json({ error: String((e && e.message) || e) }, h, 502); }
    }

    // --- rapatrie la vidéo générée en même origine (pour l'enregistrement) ---
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
    if (!token) return json({ error: 'not_configured' }, h, 503);

    // --- lancement génération vidéo (retour immédiat, poll via /job) ---
    if (url.pathname === '/animate') {
      try {
        const body = await req.json();
        const image = body && body.image;
        if (!image || typeof image !== 'string' || image.length > 12 * 1024 * 1024) return json({ error: 'bad_image' }, h, 400);
        const prompt = (body && typeof body.prompt === 'string') ? body.prompt.slice(0, 400) : '';
        const version = await latestVersion(I2V.owner, I2V.name, token);
        const pred = await createPrediction(version, I2V.input(image, prompt), token);
        return json({ id: pred.id, status: pred.status }, h);
      } catch (e) { return json({ error: String((e && e.message) || e) }, h, 502); }
    }

    // --- images sync (cutout / cartoon / enhance) ---
    const kind = url.pathname === '/cartoon' ? 'cartoon' : url.pathname === '/enhance' ? 'enhance' : url.pathname === '/cutout' ? 'cutout' : '';
    if (!kind) return json({ error: 'unknown_endpoint' }, h, 404);
    try {
      const body = await req.json();
      const image = body && body.image;
      if (!image || typeof image !== 'string' || image.length > 12 * 1024 * 1024) return json({ error: 'bad_image' }, h, 400);
      const outUrl = await runModelSync(kind, image, token);
      const img = await fetch(outUrl);
      if (!img.ok) throw new Error('fetch_out_' + img.status);
      const ct = img.headers.get('content-type') || 'image/png';
      return new Response(img.body, { status: 200, headers: Object.assign({ 'content-type': ct, 'cache-control': 'no-store' }, h) });
    } catch (e) {
      return json({ error: String((e && e.message) || e) }, h, 502);
    }
  }
};
