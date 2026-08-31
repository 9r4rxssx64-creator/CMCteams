/* PREUVE — /magic ne rend JAMAIS « quelqu'un d'autre » en douce.
 * Kevin 2026-08-12 : « les figurines et les autres transformations… ce n'est pas moi ».
 * Cause : quand Gemini (le seul moteur qui ÉDITE la photo) échouait, le worker
 * basculait sur un moteur texte→image qui RECRÉE une personne inventée, et
 * l'app présentait ça comme la transformation demandée.
 *
 * On appelle le VRAI worker, sans réseau (fetch mocké) :
 *   A) Gemini KO + Replicate absent + keep_face  → refus explicite (502
 *      face_edit_failed), AUCUNE image inventée renvoyée
 *   B) Gemini KO + Replicate présent            → un moteur d'ÉDITION prend le
 *      relais (l'identité est gardée), image renvoyée
 *   C) Gemini KO + keep_face + allow_recreate   → image inventée AUTORISÉE,
 *      mais marquée 'recreated' + la RAISON de l'échec
 *   D) sans keep_face (ancien client)           → comportement d'avant conservé
 *   E) Gemini OK                                 → aucun secours, image directe
 * Lancer : node tests/verify-crea-magic-identity.mjs
 */
import worker from '../services/kdmc-crea-ai/worker.js';

const R = { ok: [], ko: [] };
const chk = (c, m) => (c ? R.ok : R.ko).push(m);
const PIX = 'data:image/jpeg;base64,' + Buffer.from('FAKE-PHOTO-KEVIN').toString('base64');

/* Cloudflare Workers AI sait faire DEUX choses très différentes, et les
   confondre était le cœur du bug « ce n'est pas moi » :
     - img2img  : il PART de ta photo   → c'est toi (ressemblance approximative)
     - texte→image : il INVENTE quelqu'un → ce n'est pas toi
   La fausse IA doit donc les distinguer, sinon le test ne prouve rien. */
function fakeAI({ img2imgOk = true, texteImageOk = true } = {}) {
  /* >100 caractères : seuil que le worker exige pour considérer qu'une image a
     vraiment été rendue (sinon il passe au modèle suivant). */
  const edite = Buffer.from('EDITED-FROM-PHOTO-'.repeat(40)).toString('base64');
  const invente = Buffer.from('INVENTED-IMAGE-'.repeat(40)).toString('base64');
  return {
    run: async (model, input) => {
      if (/img2img/.test(String(model))) {
        if (!img2imgOk) throw new Error('img2img indisponible');
        if (!input || !(input.image_b64 || input.image)) throw new Error('pas de photo en entrée');
        return { image: edite };
      }
      if (!texteImageOk) throw new Error('texte→image indisponible');
      return { image: invente };
    },
  };
}
/* Remplace fetch : Gemini en panne, Replicate joue le moteur d'édition. */
function mockFetch({ geminiOk = false, replicateOk = false } = {}) {
  global.fetch = async (u, o) => {
    const url = String(u);
    if (/generativelanguage\.googleapis\.com/.test(url)) {
      if (!geminiOk) return new Response(JSON.stringify({ error: { message: 'quota exceeded' } }), { status: 429 });
      return new Response(JSON.stringify({ candidates: [{ content: { parts: [
        { inline_data: { mime_type: 'image/png', data: Buffer.from('EDITED').toString('base64') } }] } }] }), { status: 200 });
    }
    if (/api\.replicate\.com\/v1\/models\//.test(url)) {
      if (!replicateOk) return new Response('nope', { status: 404 });
      return new Response(JSON.stringify({ latest_version: { id: 'v1' } }), { status: 200 });
    }
    if (/api\.replicate\.com\/v1\/predictions/.test(url)) {
      return new Response(JSON.stringify({ status: 'succeeded', output: 'https://out/img.png',
        urls: { get: 'https://api.replicate.com/v1/predictions/x' } }), { status: 200 });
    }
    if (/^https:\/\/out\//.test(url)) return new Response('IMGBYTES', { status: 200, headers: { 'content-type': 'image/png' } });
    return new Response('{}', { status: 200 });
  };
}
const call = (env, body) => worker.fetch(
  new Request('https://w/magic', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  env);

/* A) PLUS RIEN pour éditer (même pas Cloudflare) + keep_face → REFUS */
mockFetch({});
let r = await call({ GEMINI_API_KEY: 'k', AI: fakeAI({ img2imgOk: false }) }, { image: PIX, preset: 'figurine', keep_face: true });
let j = await r.clone().json().catch(() => null);
chk(r.status === 502, 'A. plus AUCUN moteur d\'édition + keep_face → refus (502), reçu ' + r.status);
chk(j && j.error === 'face_edit_failed', 'A. la raison est nommée : face_edit_failed');
chk(!/image/.test(r.headers.get('content-type') || ''), 'A. AUCUNE image inventée n\'est renvoyée');
chk(j && /gemini/.test(j.detail || ''), 'A. le détail dit POURQUOI (gemini…)');

/* A-bis) LE GAIN DU JOUR : Google à sec, Replicate absent… et pourtant ça
   marche, GRATUITEMENT, parce que Cloudflare img2img part de la photo. */
mockFetch({});
r = await call({ GEMINI_API_KEY: 'k', AI: fakeAI() }, { image: PIX, preset: 'figurine', keep_face: true });
chk(r.status === 200, 'A-bis. Google à sec + zéro clé payante → ça marche quand même (' + r.status + ')');
chk(/cloudflare:img2img/.test(r.headers.get('x-crea-provider') || ''),
  'A-bis. et c\'est le moteur GRATUIT sans clé qui a servi (' + r.headers.get('x-crea-provider') + ')');
chk(r.headers.get('x-crea-quality') === 'approx',
  'A-bis. la ressemblance approximative est ANNONCÉE, pas cachée');
chk(r.headers.get('x-crea-fallback') !== 'recreated', 'A-bis. rien n\'a été inventé : on est parti de la photo');
chk(Buffer.from(await r.clone().arrayBuffer()).toString().includes('EDITED-FROM-PHOTO'),
  'A-bis. l\'image rendue vient bien de la photo envoyée (pas d\'invention)');

/* B) un moteur d'ÉDITION disponible → il prend le relais, on garde le visage */
mockFetch({ replicateOk: true });
r = await call({ GEMINI_API_KEY: 'k', AI: fakeAI(), REPLICATE_API_TOKEN: 't' },
  { image: PIX, preset: 'figurine', keep_face: true });
chk(r.status === 200, 'B. moteur d\'édition de secours → 200, reçu ' + r.status);
chk(/replicate-edit/.test(r.headers.get('x-crea-provider') || ''),
  'B. c\'est bien un moteur d\'ÉDITION qui a servi (' + r.headers.get('x-crea-provider') + ')');
chk(r.headers.get('x-crea-fallback') !== 'recreated', 'B. rien n\'a été inventé');

/* C) Kevin accepte explicitement une image inventée. Il faut que même
      Cloudflare img2img soit KO, sinon on n'a AUCUNE raison d'inventer. */
mockFetch({});
r = await call({ GEMINI_API_KEY: 'k', AI: fakeAI({ img2imgOk: false }) },
  { image: PIX, preset: 'figurine', keep_face: true, allow_recreate: true });
chk(r.status === 200, 'C. image inventée autorisée → 200, reçu ' + r.status);
chk(r.headers.get('x-crea-fallback') === 'recreated', 'C. elle est MARQUÉE comme inventée');
chk(/gemini/.test(r.headers.get('x-crea-why') || ''), 'C. et la raison est dite (x-crea-why)');

/* D) ancien client (pas de keep_face), et plus rien pour éditer → l'ancien
      comportement (recréer en le disant) est conservé, aucune régression */
mockFetch({});
r = await call({ GEMINI_API_KEY: 'k', AI: fakeAI({ img2imgOk: false }) }, { image: PIX, preset: 'figurine' });
chk(r.status === 200 && r.headers.get('x-crea-fallback') === 'recreated',
  'D. ancien client : comportement d\'avant conservé (pas de régression)');

/* E) Gemini marche → il édite ta photo, aucun secours */
mockFetch({ geminiOk: true });
r = await call({ GEMINI_API_KEY: 'k', AI: fakeAI() }, { image: PIX, preset: 'figurine', keep_face: true });
chk(r.status === 200 && !r.headers.get('x-crea-fallback'),
  'E. Gemini disponible → ta photo est éditée, aucun secours');
chk(!r.headers.get('x-crea-quality'),
  'E. DISCRIMINANT : le moteur approximatif n\'est PAS utilisé quand le bon marche');

R.ok.forEach((m) => console.log('  OK ' + m));
R.ko.forEach((m) => console.log('  FAIL ' + m));
console.log(`=== ${R.ok.length} OK / ${R.ko.length} FAIL ===`);
process.exit(R.ko.length ? 1 : 0);
