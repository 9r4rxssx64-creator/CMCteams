/* Garde du routage IA commun (Kevin 2026-09-05 « Pareil dans mes autres projets »).
 * node --test services/_shared/ia-route.test.mjs — hors ligne, 0 clé, fetch simulé.
 * Prouve : Qwen gratuit en principal pour les questions courantes, bascule par TYPE de
 * question (action/code/raisonnement → Anthropic, image → Gemini, recherche → Perplexity),
 * secours en chaîne (Qwen mort → suivant), <think> jamais montré, cause exacte quand tout tombe. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectDomain, planChain, routeText, stripThink, availableProviders, routingStatus,
  QWEN_MODELS, FREE_PROVIDERS, DOMAIN_PREFERENCES, SECRET_NAMES,
} from './ia-route.js';

const fakeAI = (opts = {}) => ({
  calls: [],
  run(model, input) {
    this.calls.push(model);
    if ((opts.dead || []).includes(model)) throw new Error('No such model');
    if (opts.allDead) throw new Error('boom');
    return { response: '<think>je réfléchis</think>' + (opts.reply || 'Bonjour Kevin') };
  },
});

function mockFetch(handler) {
  const orig = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), body: init && init.body ? JSON.parse(init.body) : null });
    return handler(String(url), init);
  };
  return { calls, restore: () => { globalThis.fetch = orig; } };
}
const okJson = (obj) => new Response(JSON.stringify(obj), { status: 200 });
const openaiReply = (t) => okJson({ choices: [{ message: { content: t } }] });

test('détection : action → admin, code, image, traduction, résumé, général', () => {
  assert.equal(detectDomain('lance le déploiement'), 'admin');
  assert.equal(detectDomain('comment lance-t-on un déploiement ?'), 'general');
  assert.equal(detectDomain('corrige ce bug javascript'), 'admin');
  assert.equal(detectDomain('explique ce code python'), 'code');
  assert.equal(detectDomain('regarde cette photo'), 'vision');
  assert.equal(detectDomain('traduis en anglais'), 'translation');
  assert.equal(detectDomain('résume ce texte'), 'summary');
  assert.equal(detectDomain('quelle heure ouvre le casino ?'), 'general');
});

test('Qwen est le 1er gratuit et le principal des questions courantes', () => {
  assert.equal(FREE_PROVIDERS[0], 'qwen');
  for (const d of ['general', 'summary', 'translation']) assert.equal(DOMAIN_PREFERENCES[d][0], 'qwen', d);
  const all = ['qwen', 'anthropic', 'gemini', 'groq', 'perplexity', 'mistral'];
  assert.equal(planChain('general', all)[0], 'qwen');
  assert.equal(planChain('summary', all)[0], 'qwen');
  assert.equal(planChain('translation', all)[0], 'qwen');
  assert.equal(planChain('speed', all)[0], 'groq');
});

test('bascule par question : action/code/raisonnement → Anthropic, image → Gemini, recherche → Perplexity', () => {
  const all = ['qwen', 'anthropic', 'gemini', 'groq', 'perplexity'];
  assert.equal(planChain('admin', all)[0], 'anthropic');
  assert.equal(planChain('code', all)[0], 'anthropic');
  assert.equal(planChain('reasoning', all)[0], 'anthropic');
  assert.equal(planChain('creative', all)[0], 'anthropic');
  assert.equal(planChain('vision', all)[0], 'gemini');
  assert.ok(!planChain('vision', all).includes('qwen'), 'jamais Qwen pour une image');
  assert.equal(planChain('search', all)[0], 'perplexity');
  /* Anthropic reste en secours derrière Qwen, et rien n'est perdu */
  assert.deepEqual(planChain('general', all).slice(0, 2), ['qwen', 'anthropic']);
  assert.equal(planChain('general', all).length, all.length);
});

test('sans Anthropic ni clé : Qwen répond quand même (0 clé)', () => {
  assert.deepEqual(availableProviders({ AI: {} }), ['qwen']);
  assert.deepEqual(planChain('code', ['qwen']), ['qwen']);
  assert.deepEqual(availableProviders({}), []);
});

test('routeText : Qwen sert la question générale, <think> filtré, modèle nommé', async () => {
  const AI = fakeAI();
  const env = { AI, ANTHROPIC_API_KEY: 'x' };
  const f = mockFetch(() => { throw new Error('réseau interdit ici'); });
  try {
    const r = await routeText(env, { prompt: 'quel temps fait-il à Monaco ?', system: 'Tu es Apex.' });
    assert.equal(r.ok, true);
    assert.equal(r.provider, 'qwen');
    assert.equal(r.model, QWEN_MODELS[0]);
    assert.equal(r.text, 'Bonjour Kevin');
    assert.equal(r.domain, 'general');
    assert.equal(f.calls.length, 0, 'Anthropic pas appelé pour une question simple');
  } finally { f.restore(); }
});

test('routeText : une ACTION va à Anthropic même si Qwen est là', async () => {
  const AI = fakeAI();
  const env = { AI, ANTHROPIC_API_KEY: 'k' };
  const f = mockFetch((url) => {
    assert.match(url, /api\.anthropic\.com/);
    return okJson({ content: [{ type: 'text', text: 'Déploiement lancé.' }] });
  });
  try {
    const r = await routeText(env, { prompt: 'déploie le worker maintenant' });
    assert.equal(r.provider, 'anthropic');
    assert.equal(r.domain, 'admin');
    assert.equal(r.text, 'Déploiement lancé.');
    assert.equal(AI.calls.length, 0);
    assert.equal(f.calls[0].body.model, 'claude-haiku-4-5-20251001');
  } finally { f.restore(); }
});

test('routeText : 1er modèle Qwen mort → le suivant, Qwen entièrement mort → Groq (gratuit), tout mort → cause exacte', async () => {
  const env1 = { AI: fakeAI({ dead: [QWEN_MODELS[0]] }) };
  const f0 = mockFetch(() => { throw new Error('non'); });
  try {
    const r1 = await routeText(env1, { prompt: 'bonjour' });
    assert.equal(r1.ok, true); assert.equal(r1.model, QWEN_MODELS[1]);
  } finally { f0.restore(); }

  const env2 = { AI: fakeAI({ allDead: true }), GROQ_API_KEY: 'g', ANTHROPIC_API_KEY: 'a' };
  const f = mockFetch((url) => (/groq/.test(url) ? openaiReply('<think>x</think>Salut !') : okJson({})));
  try {
    const r2 = await routeText(env2, { prompt: 'bonjour' });
    assert.equal(r2.provider, 'groq');
    assert.equal(r2.text, 'Salut !', '<think> filtré aussi sur les moteurs OpenAI-compatibles');
    /* Anthropic est le secours n°1 derrière Qwen (réponse vide ici → on passe à Groq) */
    assert.deepEqual(r2.tried.map((t) => t.provider), ['qwen', 'anthropic']);
  } finally { f.restore(); }

  const env3 = { AI: fakeAI({ allDead: true }), GROQ_API_KEY: 'g' };
  const f3 = mockFetch(() => new Response('{"error":{"message":"rate limited"}}', { status: 429 }));
  try {
    const r3 = await routeText(env3, { prompt: 'bonjour' });
    assert.equal(r3.ok, false);
    assert.equal(r3.tried.length, 2);
    assert.match(r3.tried[1].error, /429/);
  } finally { f3.restore(); }
});

test('routeText : chaîne forcée et domaine forcé respectés ; premium → Anthropic d\'abord', async () => {
  const env = { AI: fakeAI(), ANTHROPIC_API_KEY: 'a', GEMINI_API_KEY: 'g' };
  const f = mockFetch((url) => (/anthropic/.test(url)
    ? okJson({ content: [{ type: 'text', text: 'A' }] })
    : okJson({ candidates: [{ content: { parts: [{ text: 'G' }] } }] })));
  try {
    const r = await routeText(env, { prompt: 'bonjour', domain: 'summary', premium: true });
    assert.equal(r.provider, 'anthropic');
    const g = await routeText(env, { prompt: 'bonjour', chain: ['gemini'] });
    assert.equal(g.provider, 'gemini'); assert.equal(g.text, 'G');
  } finally { f.restore(); }
});

test('secrets : noms EXACTS de Kevin (PERPLEXITI, OPEN_AI)', () => {
  assert.equal(SECRET_NAMES.perplexity, 'PERPLEXITI_API_KEY');
  assert.equal(SECRET_NAMES.openai, 'OPEN_AI_API_KEY');
  assert.equal(stripThink('<think>a\nb</think>ok'), 'ok');
  assert.equal(stripThink('<think>coupé sans fin'), '');
  const st = routingStatus({ AI: {}, ANTHROPIC_API_KEY: 'a' });
  assert.equal(st.first_by_domain.general, 'qwen');
  assert.equal(st.first_by_domain.code, 'anthropic');
  assert.equal(st.first_by_domain.vision, 'anthropic', 'sans Gemini, une image va à Anthropic, jamais à Qwen');
});
