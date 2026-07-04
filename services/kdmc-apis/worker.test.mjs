// Tests unitaires kdmc-apis (node --test, sans réseau). Valide : CORS/origines,
// health, dispatch keyless/keyed, gate origine, constructeurs IA purs, noms secrets.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, {
  isTrustedOrigin,
  corsHeaders,
  KEYLESS,
  buildAiRequest,
  extractAiText,
  secretName,
  AI_CHAIN,
} from './worker.js';

const ENV = {}; // aucune clé → teste le comportement fail-open

async function call(pathAndQuery, opts = {}) {
  const req = new Request('https://apis.kd-mc.com' + pathAndQuery, {
    method: opts.method || 'GET',
    headers: opts.headers || {},
    body: opts.body,
  });
  return worker.fetch(req, opts.env || ENV);
}

test('isTrustedOrigin : *.kd-mc.com + Pages + localhost OK, reste KO', () => {
  assert.equal(isTrustedOrigin('https://cmcteams.kd-mc.com'), true);
  assert.equal(isTrustedOrigin('https://kd-mc.com'), true);
  assert.equal(isTrustedOrigin('https://9r4rxssx64.github.io'), true);
  assert.equal(isTrustedOrigin('http://localhost:8080'), true);
  assert.equal(isTrustedOrigin('https://evil.com'), false);
  assert.equal(isTrustedOrigin('https://kd-mc.com.evil.com'), false);
  assert.equal(isTrustedOrigin(''), false);
});

test('corsHeaders : origine de confiance renvoyée telle quelle, sinon *', () => {
  assert.equal(corsHeaders('https://apex-ai.kd-mc.com')['Access-Control-Allow-Origin'], 'https://apex-ai.kd-mc.com');
  assert.equal(corsHeaders('https://evil.com')['Access-Control-Allow-Origin'], '*');
});

test('OPTIONS préflight → 204 avec CORS (avant toute auth)', async () => {
  const r = await call('/ai', { method: 'OPTIONS', headers: { Origin: 'https://evil.com' } });
  assert.equal(r.status, 204);
  assert.ok(r.headers.get('Access-Control-Allow-Methods').includes('POST'));
});

test('/health : ok + liste routes + statut clés (aucune auth)', async () => {
  const r = await call('/health');
  assert.equal(r.status, 200);
  const b = await r.json();
  assert.equal(b.ok, true);
  assert.equal(b.service, 'kdmc-apis');
  assert.ok(b.keyless.includes('weather'));
  assert.ok(b.keyed.includes('ai'));
  assert.equal(b.keys.gemini, false); // pas de clé dans ENV de test
});

test('KEYLESS.weather : URL open-meteo Monaco par défaut', () => {
  const p = new URLSearchParams('');
  const u = KEYLESS.weather(p);
  assert.ok(u.startsWith('https://api.open-meteo.com/v1/forecast'));
  assert.ok(u.includes('latitude=43.7384'));
  assert.ok(u.includes('timezone=auto'));
});

test('KEYLESS.holidays : nager.date FR année courante', () => {
  const u = KEYLESS.holidays(new URLSearchParams('country=FR&year=2026'));
  assert.equal(u, 'https://date.nager.at/api/v3/PublicHolidays/2026/FR');
});

test('KEYLESS.fx : frankfurter USD→EUR', () => {
  const u = KEYLESS.fx(new URLSearchParams('from=USD&to=EUR&amount=25'));
  assert.ok(u.includes('base=USD') && u.includes('symbols=EUR') && u.includes('amount=25'));
});

test('KEYLESS.translate : mymemory encode le pipe langpair', () => {
  const u = KEYLESS.translate(new URLSearchParams('q=bonjour&from=fr&to=en'));
  assert.ok(u.includes('langpair=fr%7Cen'));
  assert.ok(u.includes('q=bonjour'));
});

test('route keyed sans origine de confiance → 403', async () => {
  const r = await call('/ai', { method: 'POST', headers: { Origin: 'https://evil.com', 'Content-Type': 'application/json' }, body: '{"messages":[{"role":"user","content":"hi"}]}' });
  assert.equal(r.status, 403);
});

test('/ai origine OK mais aucune clé → 503 avec détail par provider', async () => {
  const r = await call('/ai', {
    method: 'POST',
    headers: { Origin: 'https://apex-chat.kd-mc.com', 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'salut' }] }),
    env: {},
  });
  assert.equal(r.status, 503);
  const b = await r.json();
  assert.equal(b.ok, false);
  assert.ok(Array.isArray(b.detail));
  assert.ok(b.detail.every((t) => t.skipped === 'no_key'));
});

test('/search origine OK sans clés → 501 clair', async () => {
  const r = await call('/search?q=monaco', { headers: { Origin: 'https://apex-ai.kd-mc.com' } });
  assert.equal(r.status, 501);
});

test('buildAiRequest gemini : format contents + clé en query', () => {
  const req = buildAiRequest('gemini', 'KEY123', { messages: [{ role: 'system', content: 'sys' }, { role: 'user', content: 'hi' }] });
  assert.ok(req.url.includes('generativelanguage.googleapis.com'));
  assert.ok(req.url.includes('key=KEY123'));
  const body = JSON.parse(req.body);
  assert.equal(body.contents[0].parts[0].text, 'hi');
  assert.equal(body.systemInstruction.parts[0].text, 'sys');
});

test('buildAiRequest groq : OpenAI-compatible + Bearer', () => {
  const req = buildAiRequest('groq', 'KEY', { messages: [{ role: 'user', content: 'x' }] });
  assert.ok(req.url.includes('api.groq.com'));
  assert.equal(req.headers.Authorization, 'Bearer KEY');
  assert.equal(JSON.parse(req.body).model, 'llama-3.3-70b-versatile');
});

test('buildAiRequest cohere : v2/chat', () => {
  const req = buildAiRequest('cohere', 'KEY', { messages: [{ role: 'user', content: 'x' }] });
  assert.ok(req.url.includes('api.cohere.com/v2/chat'));
});

test('extractAiText : gemini / openai-compat / cohere', () => {
  assert.equal(extractAiText('gemini', { candidates: [{ content: { parts: [{ text: 'A' }, { text: 'B' }] } }] }), 'AB');
  assert.equal(extractAiText('groq', { choices: [{ message: { content: 'hey' } }] }), 'hey');
  assert.equal(extractAiText('cohere', { message: { content: [{ text: 'co' }] } }), 'co');
});

test('secretName : noms EXACTS (leçon secrets)', () => {
  assert.equal(secretName('gemini'), 'GEMINI_API_KEY');
  assert.equal(secretName('openrouter'), 'OPENROUTER_API_KEY');
  assert.equal(secretName('printify'), 'PRINTIFY_API_KEY');
  assert.equal(secretName('inconnu'), '');
});

test('AI_CHAIN : gemini en tête, providers connus', () => {
  assert.equal(AI_CHAIN[0], 'gemini');
  assert.ok(AI_CHAIN.includes('openrouter'));
});

test('route inconnue → 404 avec chemin', async () => {
  const r = await call('/nope', { headers: { Origin: 'https://kd-mc.com' } });
  assert.equal(r.status, 404);
});

test('pwned : prefix invalide → 400', async () => {
  const r = await call('/pwned?prefix=zz', { headers: { Origin: 'https://kd-mc.com' } });
  assert.equal(r.status, 400);
});
