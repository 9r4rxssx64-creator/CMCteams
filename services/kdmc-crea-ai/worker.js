/* =====================================================================
   kdmc-crea-ai — Worker IA pour Créa Studio (studio.kd-mc.com)
   Proxy vers Replicate (clé REPLICATE_API_TOKEN côté serveur, jamais exposée).
   Endpoints POST { image: dataURL } :
     /cutout   → détourage IA du sujet (fond transparent, PNG)
     /cartoon  → cartoon / dessin animé IA
     /enhance  → amélioration / upscale IA (netteté, résolution)
   Réponse : image binaire (Content-Type image/*) + CORS. GET /health = statut.
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
  cutout:  { owner: 'cjwbw',       name: 'rembg',        input: (img) => ({ image: img }) },
  cartoon: { owner: 'catacolabs',  name: 'cartoonify',   input: (img) => ({ image: img }) },
  enhance: { owner: 'nightmareai', name: 'real-esrgan',  input: (img) => ({ image: img, scale: 2, face_enhance: true }) }
};

async function latestVersion(owner, name, token) {
  const r = await fetch(`https://api.replicate.com/v1/models/${owner}/${name}`, {
    headers: { Authorization: `Token ${token}` }
  });
  if (!r.ok) throw new Error('model_lookup_' + r.status);
  const j = await r.json();
  const v = j && j.latest_version && j.latest_version.id;
  if (!v) throw new Error('no_version');
  return v;
}

async function runModel(kind, imageDataUrl, token) {
  const m = MODELS[kind];
  const version = await latestVersion(m.owner, m.name, token);
  let res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ version, input: m.input(imageDataUrl) })
  });
  let pred = await res.json();
  if (pred.error) throw new Error('create_' + pred.error);
  const started = Date.now();
  while (pred.status === 'starting' || pred.status === 'processing') {
    if (Date.now() - started > 58000) throw new Error('timeout');
    await new Promise((r) => setTimeout(r, 1500));
    const p = await fetch(pred.urls.get, { headers: { Authorization: `Token ${token}` } });
    pred = await p.json();
  }
  if (pred.status !== 'succeeded') throw new Error('model_' + (pred.error || pred.status || 'failed'));
  let out = pred.output;
  if (Array.isArray(out)) out = out[out.length - 1];
  if (!out || typeof out !== 'string') throw new Error('no_output');
  return out; // URL du résultat
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin') || '';
    const h = corsHeaders(origin);

    if (req.method === 'OPTIONS') return new Response(null, { headers: h });
    if (url.pathname === '/health') return json({ ok: true, configured: !!env.REPLICATE_API_TOKEN }, h);
    if (req.method !== 'POST') return json({ error: 'post_only' }, h, 405);

    const kind = url.pathname === '/cartoon' ? 'cartoon' : url.pathname === '/enhance' ? 'enhance' : 'cutout';
    const token = env.REPLICATE_API_TOKEN;
    if (!token) return json({ error: 'not_configured' }, h, 503);

    try {
      const body = await req.json();
      const image = body && body.image;
      if (!image || typeof image !== 'string' || image.length > 12 * 1024 * 1024) {
        return json({ error: 'bad_image' }, h, 400);
      }
      const outUrl = await runModel(kind, image, token);
      // Rapatrie l'image côté serveur → le client la reçoit en même origine (pas de canvas taint).
      const img = await fetch(outUrl);
      if (!img.ok) throw new Error('fetch_out_' + img.status);
      const ct = img.headers.get('content-type') || 'image/png';
      return new Response(img.body, {
        status: 200,
        headers: Object.assign({ 'content-type': ct, 'cache-control': 'no-store' }, h)
      });
    } catch (e) {
      return json({ error: String((e && e.message) || e) }, h, 502);
    }
  }
};
