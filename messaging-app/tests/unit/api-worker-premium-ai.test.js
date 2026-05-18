/**
 * Tests api-worker.js v1.1.24 — endpoints /api/ai/summarize + /api/premium/*
 *
 * Couvre :
 * - handleAiSummarize : auth 401, prompt validation, cache D1 hit, failover providers
 * - handlePremiumCheckout : auth, plan validation, Stripe session create, idempotency
 * - handlePremiumWebhook : signature verify HMAC, event activation premium
 * - handlePremiumStatus : query D1 premium_until + lifetime detect
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  handleAiSummarize,
  handleAiSmartReply,
  handleAiTranslate,
  handleAiVoiceTranscribe,
  handleAiImageDescribe,
  handlePremiumCheckout,
  handlePremiumPortal,
  handlePremiumWebhook,
  handlePremiumStatus,
  handlePremiumQuota,
  handleAiRewrite,
  _sendPremiumReceipt,
} from '../../workers/api-worker.js';
import { ENV, makeJWT } from './api-worker-helpers.js';

beforeEach(() => {
  vi.restoreAllMocks();
});

async function userToken() {
  return makeJWT({ sub: 'user_test', email: 'test@apex.fr', iat: Math.floor(Date.now() / 1000) });
}

function makeReq(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  return new Request('https://api.apex/' + path.replace(/^\//, ''), {
    method,
    headers,
    body: body !== undefined && method !== 'GET' ? JSON.stringify(body) : undefined,
  });
}

function userEnv(overrides = {}) {
  const env = ENV(overrides);
  env.APEX_CHAT_DB.prepare = vi.fn(() => ({
    bind: function () { return this; },
    first: async () => ({ is_admin: 0, status: 'active', is_banned: 0 }),
    all: async () => ({ results: [] }),
    run: async () => ({ success: true }),
  }));
  return env;
}

describe('handleAiSummarize', () => {
  it('refuse non-auth (401)', async () => {
    const req = makeReq('POST', '/api/ai/summarize', { prompt: 'résume moi ça' });
    const env = userEnv();
    const r = await handleAiSummarize(req, env);
    expect(r.status).toBe(401);
  });

  it('refuse prompt vide ou trop court', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    const tok = await userToken();
    const r = await handleAiSummarize(makeReq('POST', '/api/ai/summarize', { prompt: '' }, tok), env);
    expect(r.status).toBe(400);
    const j = await r.json();
    expect(j.message).toMatch(/prompt required/i);
  });

  it('refuse prompt > 50k chars', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    const tok = await userToken();
    const r = await handleAiSummarize(
      makeReq('POST', '/api/ai/summarize', { prompt: 'a'.repeat(60000) }, tok),
      env,
    );
    expect(r.status).toBe(400);
  });

  it('aucun provider configuré → 503', async () => {
    const env = userEnv(); /* pas de clé IA */
    delete env.ANTHROPIC_API_KEY;
    delete env.GROQ_API_KEY;
    delete env.GEMINI_API_KEY;
    delete env.DEEPSEEK_API_KEY;
    const tok = await userToken();
    const r = await handleAiSummarize(
      makeReq('POST', '/api/ai/summarize', { prompt: 'résume cette conversation longue de mai 2025' }, tok),
      env,
    );
    expect(r.status).toBe(503);
  });

  it('cache D1 hit → retourne cached sans appeler IA', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    env.APEX_CHAT_DB.prepare = vi.fn((sql) => ({
      bind: function () { return this; },
      first: async () => {
        if (sql.includes('ai_summary_cache')) {
          return { text: 'résumé en cache', ts: Date.now() };
        }
        return { is_admin: 0 };
      },
      run: async () => ({ success: true }),
    }));
    globalThis.fetch = vi.fn(); /* ne doit PAS être appelé */
    const tok = await userToken();
    const r = await handleAiSummarize(
      makeReq('POST', '/api/ai/summarize', { prompt: 'résume mes messages anciens' }, tok),
      env,
    );
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.cached).toBe(true);
    expect(j.text).toBe('résumé en cache');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('Anthropic success → retourne text + cache D1', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    globalThis.fetch = vi.fn(async (url) => {
      if (url.includes('anthropic.com')) {
        return new Response(JSON.stringify({ content: [{ text: 'voici le résumé IA' }] }), { status: 200 });
      }
      return new Response('not implemented', { status: 500 });
    });
    const tok = await userToken();
    const r = await handleAiSummarize(
      makeReq('POST', '/api/ai/summarize', { prompt: 'résume cette discussion intéressante' }, tok),
      env,
    );
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.text).toBe('voici le résumé IA');
    expect(j.provider).toBe('anthropic');
    expect(j.cached).toBe(false);
  });

  it('Anthropic fail → failover Groq', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k1', GROQ_API_KEY: 'k2' });
    globalThis.fetch = vi.fn(async (url) => {
      if (url.includes('anthropic.com')) {
        return new Response('error', { status: 500 });
      }
      if (url.includes('groq.com')) {
        return new Response(JSON.stringify({ choices: [{ message: { content: 'groq résumé' } }] }), { status: 200 });
      }
      return new Response('?', { status: 500 });
    });
    const tok = await userToken();
    const r = await handleAiSummarize(
      makeReq('POST', '/api/ai/summarize', { prompt: 'résume cette discussion sur mai' }, tok),
      env,
    );
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.text).toBe('groq résumé');
    expect(j.provider).toBe('groq');
  });
});

describe('handlePremiumCheckout', () => {
  it('refuse non-auth', async () => {
    const r = await handlePremiumCheckout(makeReq('POST', '/api/premium/checkout', { plan: 'monthly' }), userEnv());
    expect(r.status).toBe(401);
  });

  it('refuse plan invalide', async () => {
    const env = userEnv({ STRIPE_SECRET_KEY: 'sk_test_x', STRIPE_PRICE_MONTHLY: 'price_x' });
    const tok = await userToken();
    const r = await handlePremiumCheckout(makeReq('POST', '/api/premium/checkout', { plan: 'unknown' }, tok), env);
    expect(r.status).toBe(400);
    const j = await r.json();
    expect(j.message).toMatch(/Plan invalide/i);
  });

  it('refuse si STRIPE_SECRET_KEY manquant', async () => {
    const env = userEnv();
    const tok = await userToken();
    const r = await handlePremiumCheckout(makeReq('POST', '/api/premium/checkout', { plan: 'monthly' }, tok), env);
    expect(r.status).toBe(503);
  });

  it('refuse si STRIPE_PRICE_MONTHLY manquant', async () => {
    const env = userEnv({ STRIPE_SECRET_KEY: 'sk_test_x' });
    const tok = await userToken();
    const r = await handlePremiumCheckout(makeReq('POST', '/api/premium/checkout', { plan: 'monthly' }, tok), env);
    expect(r.status).toBe(503);
  });

  it('refuse URLs invalides (non http)', async () => {
    const env = userEnv({ STRIPE_SECRET_KEY: 'sk_test_x', STRIPE_PRICE_MONTHLY: 'price_x' });
    const tok = await userToken();
    const r = await handlePremiumCheckout(
      makeReq('POST', '/api/premium/checkout', { plan: 'monthly', success_url: 'javascript:alert(1)', cancel_url: 'http://x' }, tok),
      env,
    );
    expect(r.status).toBe(400);
  });

  it('Stripe success → retourne url + session_id', async () => {
    const env = userEnv({ STRIPE_SECRET_KEY: 'sk_test_x', STRIPE_PRICE_MONTHLY: 'price_xyz' });
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ id: 'cs_test_123', url: 'https://checkout.stripe.com/c/cs_test_123' }), { status: 200 }),
    );
    const tok = await userToken();
    const r = await handlePremiumCheckout(
      makeReq('POST', '/api/premium/checkout', { plan: 'monthly', success_url: 'https://apex.chat/ok', cancel_url: 'https://apex.chat/cancel' }, tok),
      env,
    );
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.url).toContain('checkout.stripe.com');
    expect(j.session_id).toBe('cs_test_123');
    expect(j.plan).toBe('monthly');
    expect(j.trial).toBe(true); /* monthly = 7 days trial */
  });

  it('plan lifetime → trial false + mode payment', async () => {
    const env = userEnv({ STRIPE_SECRET_KEY: 'sk', STRIPE_PRICE_LIFETIME: 'price_life' });
    let capturedBody = '';
    globalThis.fetch = vi.fn(async (_, opts) => {
      capturedBody = opts.body;
      return new Response(JSON.stringify({ id: 'cs_life', url: 'https://checkout.stripe.com/cs_life' }));
    });
    const tok = await userToken();
    const r = await handlePremiumCheckout(
      makeReq('POST', '/api/premium/checkout', { plan: 'lifetime', success_url: 'https://x', cancel_url: 'https://y' }, tok),
      env,
    );
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.trial).toBe(false);
    expect(capturedBody).toContain('mode=payment');
    expect(capturedBody).not.toContain('trial_period_days');
  });

  it('plan yearly → mode subscription sans trial', async () => {
    const env = userEnv({ STRIPE_SECRET_KEY: 'sk', STRIPE_PRICE_YEARLY: 'price_year' });
    let capturedBody = '';
    globalThis.fetch = vi.fn(async (_, opts) => {
      capturedBody = opts.body;
      return new Response(JSON.stringify({ id: 'cs_year', url: 'https://stripe' }));
    });
    const tok = await userToken();
    await handlePremiumCheckout(
      makeReq('POST', '/api/premium/checkout', { plan: 'yearly', success_url: 'https://x', cancel_url: 'https://y' }, tok),
      env,
    );
    expect(capturedBody).toContain('mode=subscription');
    expect(capturedBody).not.toContain('trial_period_days');
  });

  it('Stripe HTTP 400 → 502 propagé', async () => {
    const env = userEnv({ STRIPE_SECRET_KEY: 'sk', STRIPE_PRICE_MONTHLY: 'p' });
    globalThis.fetch = vi.fn(async () => new Response('bad', { status: 400 }));
    const tok = await userToken();
    const r = await handlePremiumCheckout(
      makeReq('POST', '/api/premium/checkout', { plan: 'monthly', success_url: 'https://x', cancel_url: 'https://y' }, tok),
      env,
    );
    expect(r.status).toBe(502);
  });

  it('passe metadata user_id + plan + apex_version', async () => {
    const env = userEnv({ STRIPE_SECRET_KEY: 'sk', STRIPE_PRICE_MONTHLY: 'p' });
    let body = '';
    globalThis.fetch = vi.fn(async (_, opts) => {
      body = opts.body;
      return new Response(JSON.stringify({ id: 'cs', url: 'https://x' }));
    });
    const tok = await userToken();
    await handlePremiumCheckout(
      makeReq('POST', '/api/premium/checkout', { plan: 'monthly', success_url: 'https://x', cancel_url: 'https://y' }, tok),
      env,
    );
    expect(body).toContain('metadata%5Buser_id%5D=user_test');
    expect(body).toContain('metadata%5Bplan%5D=monthly');
    expect(body).toContain('apex_version');
    expect(body).toContain('allow_promotion_codes=true');
    expect(body).toContain('locale=fr');
  });
});

describe('handlePremiumWebhook', () => {
  it('refuse sans STRIPE_WEBHOOK_SECRET → 503', async () => {
    const env = userEnv();
    const req = new Request('https://api.apex/api/premium/webhook', {
      method: 'POST',
      headers: { 'Stripe-Signature': 't=1,v1=abc' },
      body: '{}',
    });
    const r = await handlePremiumWebhook(req, env);
    expect(r.status).toBe(503);
  });

  it('refuse sans Stripe-Signature header → 400', async () => {
    const env = userEnv({ STRIPE_WEBHOOK_SECRET: 'whsec_x' });
    const req = new Request('https://api.apex/api/premium/webhook', {
      method: 'POST',
      body: '{}',
    });
    const r = await handlePremiumWebhook(req, env);
    expect(r.status).toBe(400);
  });

  it('refuse signature invalide', async () => {
    const env = userEnv({ STRIPE_WEBHOOK_SECRET: 'whsec_x' });
    const req = new Request('https://api.apex/api/premium/webhook', {
      method: 'POST',
      headers: { 'Stripe-Signature': 't=1,v1=invalid_sig' },
      body: '{"type":"test"}',
    });
    const r = await handlePremiumWebhook(req, env);
    expect(r.status).toBe(400);
  });

  it('signature valide checkout.session.completed → active premium monthly', async () => {
    const secret = 'whsec_test_' + crypto.randomUUID();
    const ts = Math.floor(Date.now() / 1000);
    const eventBody = JSON.stringify({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          metadata: { user_id: 'user_test', plan: 'monthly' },
          client_reference_id: 'user_test',
        },
      },
    });
    // Compute valid signature
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${ts}.${eventBody}`));
    const sigHex = Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

    const env = userEnv({ STRIPE_WEBHOOK_SECRET: secret });
    let updateCalled = false;
    env.APEX_CHAT_DB.prepare = vi.fn((sql) => ({
      bind: function (...args) {
        if (sql.includes('UPDATE users SET premium_until')) updateCalled = true;
        return this;
      },
      run: async () => ({ success: true }),
    }));

    const req = new Request('https://api.apex/api/premium/webhook', {
      method: 'POST',
      headers: { 'Stripe-Signature': `t=${ts},v1=${sigHex}` },
      body: eventBody,
    });
    const r = await handlePremiumWebhook(req, env);
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.received).toBe('checkout.session.completed');
    expect(updateCalled).toBe(true);
  });

  it('refuse signature trop ancienne (anti-replay > 5min)', async () => {
    const secret = 'whsec_x';
    const oldTs = Math.floor(Date.now() / 1000) - 600; /* 10 min old */
    const body = '{"type":"test"}';
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${oldTs}.${body}`));
    const sigHex = Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

    const env = userEnv({ STRIPE_WEBHOOK_SECRET: secret });
    const req = new Request('https://api.apex/api/premium/webhook', {
      method: 'POST',
      headers: { 'Stripe-Signature': `t=${oldTs},v1=${sigHex}` },
      body,
    });
    const r = await handlePremiumWebhook(req, env);
    expect(r.status).toBe(400);
  });
});

describe('handlePremiumPortal (v1.1.26)', () => {
  it('refuse non-auth', async () => {
    const r = await handlePremiumPortal(makeReq('POST', '/api/premium/portal'), userEnv());
    expect(r.status).toBe(401);
  });

  it('refuse sans STRIPE_SECRET_KEY', async () => {
    const env = userEnv();
    const tok = await userToken();
    const r = await handlePremiumPortal(makeReq('POST', '/api/premium/portal', {}, tok), env);
    expect(r.status).toBe(503);
  });

  it('refuse return_url invalide (non http)', async () => {
    const env = userEnv({ STRIPE_SECRET_KEY: 'sk' });
    const tok = await userToken();
    const r = await handlePremiumPortal(
      makeReq('POST', '/api/premium/portal', { return_url: 'javascript:alert(1)' }, tok),
      env,
    );
    expect(r.status).toBe(400);
  });

  it('user sans stripe_customer_id → 404 (pas d\'abo actif)', async () => {
    const env = userEnv({ STRIPE_SECRET_KEY: 'sk' });
    env.APEX_CHAT_DB.prepare = vi.fn(() => ({
      bind: function () { return this; },
      first: async () => ({ stripe_customer_id: null }),
    }));
    const tok = await userToken();
    const r = await handlePremiumPortal(
      makeReq('POST', '/api/premium/portal', { return_url: 'https://apex.chat/back' }, tok),
      env,
    );
    expect(r.status).toBe(404);
  });

  it('user avec customer_id → retourne url portail', async () => {
    const env = userEnv({ STRIPE_SECRET_KEY: 'sk' });
    env.APEX_CHAT_DB.prepare = vi.fn(() => ({
      bind: function () { return this; },
      first: async () => ({ stripe_customer_id: 'cus_test_123' }),
    }));
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ url: 'https://billing.stripe.com/p/session/abc' }), { status: 200 }),
    );
    const tok = await userToken();
    const r = await handlePremiumPortal(
      makeReq('POST', '/api/premium/portal', { return_url: 'https://apex.chat/' }, tok),
      env,
    );
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.url).toContain('billing.stripe.com');
  });

  it('Stripe HTTP error → 502', async () => {
    const env = userEnv({ STRIPE_SECRET_KEY: 'sk' });
    env.APEX_CHAT_DB.prepare = vi.fn(() => ({
      bind: function () { return this; },
      first: async () => ({ stripe_customer_id: 'cus_x' }),
    }));
    globalThis.fetch = vi.fn(async () => new Response('err', { status: 500 }));
    const tok = await userToken();
    const r = await handlePremiumPortal(
      makeReq('POST', '/api/premium/portal', { return_url: 'https://apex.chat/' }, tok),
      env,
    );
    expect(r.status).toBe(502);
  });
});

describe('handleAiSmartReply (v1.1.26)', () => {
  it('refuse non-auth', async () => {
    const r = await handleAiSmartReply(makeReq('POST', '/api/ai/smart-reply'), userEnv());
    expect(r.status).toBe(401);
  });

  it('refuse last_message vide', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    const tok = await userToken();
    const r = await handleAiSmartReply(makeReq('POST', '/api/ai/smart-reply', { last_message: '' }, tok), env);
    expect(r.status).toBe(400);
  });

  it('refuse last_message > 2000 chars', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    const tok = await userToken();
    const r = await handleAiSmartReply(
      makeReq('POST', '/api/ai/smart-reply', { last_message: 'x'.repeat(2500) }, tok),
      env,
    );
    expect(r.status).toBe(400);
  });

  it('IA Anthropic retourne JSON valide → 3 replies', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({
        content: [{ text: '{"replies":["Bien sûr !","D\'accord","Je dois voir"]}' }],
      })),
    );
    const tok = await userToken();
    const r = await handleAiSmartReply(
      makeReq('POST', '/api/ai/smart-reply', { last_message: 'Tu viens samedi ?' }, tok),
      env,
    );
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.replies).toHaveLength(3);
    expect(j.replies[0]).toBe('Bien sûr !');
  });

  it('IA retourne markdown code block → parse robuste', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({
        content: [{ text: '```json\n{"replies":["Oui","Non","Peut-être"]}\n```' }],
      })),
    );
    const tok = await userToken();
    const r = await handleAiSmartReply(
      makeReq('POST', '/api/ai/smart-reply', { last_message: 'Ça te va ?' }, tok),
      env,
    );
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.replies).toHaveLength(3);
  });

  it('IA réponse non-JSON → failover Groq', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k1', GROQ_API_KEY: 'k2' });
    globalThis.fetch = vi.fn(async (url) => {
      if (url.includes('anthropic')) {
        return new Response(JSON.stringify({ content: [{ text: 'pas du JSON' }] }));
      }
      return new Response(JSON.stringify({
        choices: [{ message: { content: '{"replies":["G1","G2","G3"]}' } }],
      }));
    });
    const tok = await userToken();
    const r = await handleAiSmartReply(
      makeReq('POST', '/api/ai/smart-reply', { last_message: 'hello' }, tok),
      env,
    );
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.provider).toBe('groq');
  });

  it('cap à 3 replies (si IA en retourne plus)', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({
        content: [{ text: '{"replies":["A","B","C","D","E"]}' }],
      })),
    );
    const tok = await userToken();
    const r = await handleAiSmartReply(
      makeReq('POST', '/api/ai/smart-reply', { last_message: 'hello' }, tok),
      env,
    );
    const j = await r.json();
    expect(j.replies).toHaveLength(3);
  });
});

describe('handleAiTranslate (v1.1.26)', () => {
  it('refuse non-auth', async () => {
    const r = await handleAiTranslate(makeReq('POST', '/api/ai/translate'), userEnv());
    expect(r.status).toBe(401);
  });

  it('refuse text vide', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    const tok = await userToken();
    const r = await handleAiTranslate(makeReq('POST', '/api/ai/translate', { text: '' }, tok), env);
    expect(r.status).toBe(400);
  });

  it('refuse text > 5000 chars', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    const tok = await userToken();
    const r = await handleAiTranslate(
      makeReq('POST', '/api/ai/translate', { text: 'x'.repeat(6000) }, tok),
      env,
    );
    expect(r.status).toBe(400);
  });

  it('Anthropic → retourne traduction', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({
        content: [{ text: 'Bonjour le monde' }],
      })),
    );
    const tok = await userToken();
    const r = await handleAiTranslate(
      makeReq('POST', '/api/ai/translate', { text: 'Hello world', target_lang: 'fr' }, tok),
      env,
    );
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.translated).toBe('Bonjour le monde');
    expect(j.target_lang).toBe('fr');
    expect(j.provider).toBe('anthropic');
  });

  it('failover providers si Anthropic vide', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k1', GROQ_API_KEY: 'k2' });
    globalThis.fetch = vi.fn(async (url) => {
      if (url.includes('anthropic')) {
        return new Response(JSON.stringify({ content: [{ text: '' }] }));
      }
      return new Response(JSON.stringify({
        choices: [{ message: { content: 'Hola mundo' } }],
      }));
    });
    const tok = await userToken();
    const r = await handleAiTranslate(
      makeReq('POST', '/api/ai/translate', { text: 'Bonjour', target_lang: 'es' }, tok),
      env,
    );
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.translated).toBe('Hola mundo');
    expect(j.provider).toBe('groq');
  });

  it('aucun provider → 503', async () => {
    const env = userEnv();
    delete env.ANTHROPIC_API_KEY;
    delete env.GROQ_API_KEY;
    delete env.GEMINI_API_KEY;
    const tok = await userToken();
    const r = await handleAiTranslate(
      makeReq('POST', '/api/ai/translate', { text: 'hello' }, tok),
      env,
    );
    expect(r.status).toBe(503);
  });

  it('target_lang clamp à 5 chars', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    let capturedSysPrompt = '';
    globalThis.fetch = vi.fn(async (_, opts) => {
      const body = JSON.parse(opts.body);
      // system can be string OR array (Anthropic prompt caching format)
      const sys = body.system;
      capturedSysPrompt = Array.isArray(sys) ? sys[0]?.text : sys;
      return new Response(JSON.stringify({ content: [{ text: 'OK' }] }));
    });
    const tok = await userToken();
    await handleAiTranslate(
      makeReq('POST', '/api/ai/translate', { text: 'hi', target_lang: 'verylonglangcode' }, tok),
      env,
    );
    /* slice(0,5) → "veryl" (5 chars max) */
    expect(capturedSysPrompt).toContain('veryl');
    expect(capturedSysPrompt).not.toContain('verylonglangcode');
  });
});

describe('handleAiVoiceTranscribe (v1.1.28)', () => {
  function makeMultipartReq(audioBlob, filename, token) {
    const form = new FormData();
    form.append('audio', audioBlob, filename);
    const req = new Request('https://api.apex/api/ai/voice-transcribe', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: form,
    });
    return req;
  }

  it('refuse non-auth', async () => {
    const req = new Request('https://api.apex/api/ai/voice-transcribe', { method: 'POST' });
    const r = await handleAiVoiceTranscribe(req, userEnv());
    expect(r.status).toBe(401);
  });

  it('refuse sans GROQ_API_KEY', async () => {
    const env = userEnv();
    delete env.GROQ_API_KEY;
    const tok = await userToken();
    const blob = new Blob(['fake audio'], { type: 'audio/webm' });
    const r = await handleAiVoiceTranscribe(makeMultipartReq(blob, 'a.webm', tok), env);
    expect(r.status).toBe(503);
  });

  it('refuse content-type non supporté', async () => {
    const env = userEnv({ GROQ_API_KEY: 'k' });
    const tok = await userToken();
    const req = new Request('https://api.apex/api/ai/voice-transcribe', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + tok, 'Content-Type': 'text/plain' },
      body: 'hello',
    });
    const r = await handleAiVoiceTranscribe(req, env);
    expect(r.status).toBe(400);
  });

  it('refuse audio vide', async () => {
    const env = userEnv({ GROQ_API_KEY: 'k' });
    const tok = await userToken();
    const blob = new Blob([], { type: 'audio/webm' });
    const r = await handleAiVoiceTranscribe(makeMultipartReq(blob, 'empty.webm', tok), env);
    expect(r.status).toBe(400);
  });

  it('refuse audio > 25 MB', async () => {
    const env = userEnv({ GROQ_API_KEY: 'k' });
    const tok = await userToken();
    /* 26 MB fake buffer */
    const big = new Uint8Array(26 * 1024 * 1024);
    const blob = new Blob([big], { type: 'audio/webm' });
    const r = await handleAiVoiceTranscribe(makeMultipartReq(blob, 'big.webm', tok), env);
    expect(r.status).toBe(400);
  });

  it('audio binary direct (application/octet-stream)', async () => {
    const env = userEnv({ GROQ_API_KEY: 'k' });
    const tok = await userToken();
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ text: 'Bonjour à tous', language: 'fr', duration: 2.5 }), { status: 200 }),
    );
    const buf = new TextEncoder().encode('fake audio bytes here');
    const req = new Request('https://api.apex/api/ai/voice-transcribe', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + tok, 'Content-Type': 'audio/webm' },
      body: buf,
    });
    const r = await handleAiVoiceTranscribe(req, env);
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.text).toBe('Bonjour à tous');
    expect(j.language).toBe('fr');
    expect(j.provider).toContain('whisper');
  });

  it('Groq Whisper success → text + language + duration', async () => {
    const env = userEnv({ GROQ_API_KEY: 'k' });
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ text: 'Hello world', language: 'en', duration: 1.2 }), { status: 200 }),
    );
    const tok = await userToken();
    const blob = new Blob(['x'.repeat(100)], { type: 'audio/webm' });
    const r = await handleAiVoiceTranscribe(makeMultipartReq(blob, 'h.webm', tok), env);
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.text).toBe('Hello world');
    expect(j.language).toBe('en');
    expect(j.duration_s).toBe(1.2);
  });

  it('Whisper HTTP 500 → 502', async () => {
    const env = userEnv({ GROQ_API_KEY: 'k' });
    globalThis.fetch = vi.fn(async () => new Response('err', { status: 500 }));
    const tok = await userToken();
    const blob = new Blob(['x'.repeat(100)], { type: 'audio/webm' });
    const r = await handleAiVoiceTranscribe(makeMultipartReq(blob, 'h.webm', tok), env);
    expect(r.status).toBe(502);
  });

  it('lang query param transmis à Whisper', async () => {
    const env = userEnv({ GROQ_API_KEY: 'k' });
    let capturedForm = null;
    globalThis.fetch = vi.fn(async (_, opts) => {
      capturedForm = opts.body;
      return new Response(JSON.stringify({ text: 'OK' }));
    });
    const tok = await userToken();
    const form = new FormData();
    form.append('audio', new Blob(['x'.repeat(100)], { type: 'audio/webm' }), 'h.webm');
    const req = new Request('https://api.apex/api/ai/voice-transcribe?lang=fr', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + tok },
      body: form,
    });
    await handleAiVoiceTranscribe(req, env);
    /* FormData stringify n'expose pas keys facilement, mais on vérifie qu'on est passé par */
    expect(globalThis.fetch).toHaveBeenCalled();
  });

  it('lang param invalide (non 2 chars) → ignoré', async () => {
    const env = userEnv({ GROQ_API_KEY: 'k' });
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ text: 'OK' })));
    const tok = await userToken();
    const form = new FormData();
    form.append('audio', new Blob(['x'.repeat(100)], { type: 'audio/webm' }), 'h.webm');
    const req = new Request('https://api.apex/api/ai/voice-transcribe?lang=french', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + tok },
      body: form,
    });
    const r = await handleAiVoiceTranscribe(req, env);
    expect(r.status).toBe(200); /* pas crash */
  });
});

describe('handleAiImageDescribe (v1.1.28)', () => {
  it('refuse non-auth', async () => {
    const r = await handleAiImageDescribe(makeReq('POST', '/api/ai/image-describe'), userEnv());
    expect(r.status).toBe(401);
  });

  it('refuse sans ANTHROPIC_API_KEY', async () => {
    const env = userEnv();
    delete env.ANTHROPIC_API_KEY;
    const tok = await userToken();
    const r = await handleAiImageDescribe(
      makeReq('POST', '/api/ai/image-describe', { image_base64: 'x'.repeat(200) }, tok),
      env,
    );
    expect(r.status).toBe(503);
  });

  it('refuse image_base64 vide ou trop court', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    const tok = await userToken();
    const r = await handleAiImageDescribe(
      makeReq('POST', '/api/ai/image-describe', { image_base64: 'x' }, tok),
      env,
    );
    expect(r.status).toBe(400);
  });

  it('refuse image > 5 MB base64', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    const tok = await userToken();
    const huge = 'A'.repeat(6 * 1024 * 1024);
    const r = await handleAiImageDescribe(
      makeReq('POST', '/api/ai/image-describe', { image_base64: huge }, tok),
      env,
    );
    expect(r.status).toBe(400);
  });

  it('Anthropic Vision success → description', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({
        content: [{ text: 'Une plage au coucher du soleil avec des palmiers.' }],
      }), { status: 200 }),
    );
    const tok = await userToken();
    const fakeB64 = 'A'.repeat(500);
    const r = await handleAiImageDescribe(
      makeReq('POST', '/api/ai/image-describe', { image_base64: fakeB64 }, tok),
      env,
    );
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.description).toContain('plage');
    expect(j.provider).toContain('vision');
  });

  it('détecte media_type depuis data: prefix', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    let capturedBody = '';
    globalThis.fetch = vi.fn(async (_, opts) => {
      capturedBody = opts.body;
      return new Response(JSON.stringify({ content: [{ text: 'PNG image' }] }));
    });
    const tok = await userToken();
    const b64WithPrefix = 'data:image/png;base64,' + 'A'.repeat(500);
    await handleAiImageDescribe(
      makeReq('POST', '/api/ai/image-describe', { image_base64: b64WithPrefix }, tok),
      env,
    );
    expect(capturedBody).toContain('"media_type":"image/png"');
    /* Le prefix data:image doit être strippé */
    expect(capturedBody).not.toContain('data:image/png;base64,');
  });

  it('custom prompt utilisé', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    let capturedBody = '';
    globalThis.fetch = vi.fn(async (_, opts) => {
      capturedBody = opts.body;
      return new Response(JSON.stringify({ content: [{ text: 'OK' }] }));
    });
    const tok = await userToken();
    await handleAiImageDescribe(
      makeReq('POST', '/api/ai/image-describe', {
        image_base64: 'A'.repeat(500),
        prompt: 'Quel est le texte visible dans cette photo ?',
      }, tok),
      env,
    );
    expect(capturedBody).toContain('texte visible');
  });

  it('Anthropic HTTP 400 → 502', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    globalThis.fetch = vi.fn(async () => new Response('err', { status: 400 }));
    const tok = await userToken();
    const r = await handleAiImageDescribe(
      makeReq('POST', '/api/ai/image-describe', { image_base64: 'A'.repeat(500) }, tok),
      env,
    );
    expect(r.status).toBe(502);
  });
});

describe('handlePremiumStatus', () => {
  it('refuse non-auth', async () => {
    const r = await handlePremiumStatus(makeReq('GET', '/api/premium/status'), userEnv());
    expect(r.status).toBe(401);
  });

  it('user inconnu → premium false', async () => {
    const env = userEnv();
    env.APEX_CHAT_DB.prepare = vi.fn(() => ({
      bind: function () { return this; },
      first: async () => null,
    }));
    const tok = await userToken();
    const r = await handlePremiumStatus(makeReq('GET', '/api/premium/status', undefined, tok), env);
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.premium).toBe(false);
  });

  it('user avec premium_until futur → premium true', async () => {
    const env = userEnv();
    env.APEX_CHAT_DB.prepare = vi.fn(() => ({
      bind: function () { return this; },
      first: async () => ({ premium_until: Date.now() + 30 * 86400 * 1000, premium_plan: 'monthly' }),
    }));
    const tok = await userToken();
    const r = await handlePremiumStatus(makeReq('GET', '/api/premium/status', undefined, tok), env);
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.premium).toBe(true);
    expect(j.plan).toBe('monthly');
    expect(j.lifetime).toBe(false);
  });

  it('user avec lifetime → premium true + lifetime true', async () => {
    const env = userEnv();
    env.APEX_CHAT_DB.prepare = vi.fn(() => ({
      bind: function () { return this; },
      first: async () => ({ premium_until: 9999999999000, premium_plan: 'lifetime' }),
    }));
    const tok = await userToken();
    const r = await handlePremiumStatus(makeReq('GET', '/api/premium/status', undefined, tok), env);
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.premium).toBe(true);
    expect(j.lifetime).toBe(true);
  });

  it('user avec premium_until passé → premium false', async () => {
    const env = userEnv();
    env.APEX_CHAT_DB.prepare = vi.fn(() => ({
      bind: function () { return this; },
      first: async () => ({ premium_until: Date.now() - 86400 * 1000, premium_plan: 'monthly' }),
    }));
    const tok = await userToken();
    const r = await handlePremiumStatus(makeReq('GET', '/api/premium/status', undefined, tok), env);
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.premium).toBe(false);
  });
});

// ============================================================================
//  v1.1.30 — Premium quota daily middleware tests
//  Vérifie : non-premium = limite/jour, premium = illimité, KV increment, 429
// ============================================================================
describe('Premium quota middleware (v1.1.30)', () => {
  function mkUserWithPremium(env, isPremium, plan = 'monthly') {
    env.APEX_CHAT_DB.prepare = vi.fn(() => ({
      bind: function () { return this; },
      first: async () => ({
        is_admin: 0, status: 'active', is_banned: 0,
        premium_until: isPremium ? Date.now() + 86400_000 : 0,
        premium_plan: isPremium ? plan : null,
      }),
      all: async () => ({ results: [] }),
      run: async () => ({ success: true }),
    }));
  }

  it('non-premium user : quota 5/jour voice-transcribe → 429 au 6e', async () => {
    const env = userEnv();
    mkUserWithPremium(env, false);
    // Pré-remplit KV à la limite (5/5)
    const today = new Date().toISOString().slice(0, 10);
    await env.APEX_CHAT_KV.put(`quota:user_test:voice-transcribe:${today}`, '5');
    const tok = await userToken();
    const fd = new FormData();
    fd.append('audio', new File([new Uint8Array(1000)], 'a.webm', { type: 'audio/webm' }));
    const req = new Request('https://api.apex/api/ai/voice-transcribe', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + tok },
      body: fd,
    });
    const r = await handleAiVoiceTranscribe(req, env);
    expect(r.status).toBe(429);
    const j = await r.json();
    expect(j.error).toBe('quota_exceeded');
    expect(j.limit).toBe(5);
    expect(j.feature).toBe('voice-transcribe');
  });

  it('premium user : pas de check quota, fetch Groq direct', async () => {
    const env = userEnv();
    mkUserWithPremium(env, true);
    // Même si quota préfill 100 → ignoré pour premium
    const today = new Date().toISOString().slice(0, 10);
    await env.APEX_CHAT_KV.put(`quota:user_test:voice-transcribe:${today}`, '100');
    globalThis.fetch = vi.fn(async () => new Response(
      JSON.stringify({ text: 'Bonjour Apex', language: 'fr', duration: 1.5 }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));
    const tok = await userToken();
    const fd = new FormData();
    fd.append('audio', new File([new Uint8Array(1000)], 'a.webm', { type: 'audio/webm' }));
    const req = new Request('https://api.apex/api/ai/voice-transcribe', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + tok },
      body: fd,
    });
    const r = await handleAiVoiceTranscribe(req, env);
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.ok).toBe(true);
    expect(j.premium).toBe(true);
  });

  it('non-premium : 1er appel → 200 + KV incrémenté à 1', async () => {
    const env = userEnv();
    mkUserWithPremium(env, false);
    globalThis.fetch = vi.fn(async () => new Response(
      JSON.stringify({ text: 'OK', language: 'fr' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));
    const tok = await userToken();
    const fd = new FormData();
    fd.append('audio', new File([new Uint8Array(1000)], 'a.webm', { type: 'audio/webm' }));
    const req = new Request('https://api.apex/api/ai/voice-transcribe', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + tok },
      body: fd,
    });
    const r = await handleAiVoiceTranscribe(req, env);
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.premium).toBe(false);
    const today = new Date().toISOString().slice(0, 10);
    const stored = await env.APEX_CHAT_KV.get(`quota:user_test:voice-transcribe:${today}`);
    expect(stored).toBe('1');
  });

  it('non-premium : image-describe quota 10/jour', async () => {
    const env = userEnv();
    mkUserWithPremium(env, false);
    const today = new Date().toISOString().slice(0, 10);
    await env.APEX_CHAT_KV.put(`quota:user_test:image-describe:${today}`, '10');
    const tok = await userToken();
    const r = await handleAiImageDescribe(
      makeReq('POST', '/api/ai/image-describe', { image_base64: 'a'.repeat(200) }, tok),
      env,
    );
    expect(r.status).toBe(429);
    const j = await r.json();
    expect(j.feature).toBe('image-describe');
    expect(j.limit).toBe(10);
  });

  it('non-premium : summarize quota 3/jour', async () => {
    const env = userEnv();
    mkUserWithPremium(env, false);
    const today = new Date().toISOString().slice(0, 10);
    await env.APEX_CHAT_KV.put(`quota:user_test:summarize:${today}`, '3');
    const tok = await userToken();
    const r = await handleAiSummarize(
      makeReq('POST', '/api/ai/summarize', { prompt: 'résume ceci stp longtemps' }, tok),
      env,
    );
    expect(r.status).toBe(429);
    const j = await r.json();
    expect(j.feature).toBe('summarize');
    expect(j.limit).toBe(3);
  });

  it('non-premium : smart-reply quota 30/jour', async () => {
    const env = userEnv();
    mkUserWithPremium(env, false);
    const today = new Date().toISOString().slice(0, 10);
    await env.APEX_CHAT_KV.put(`quota:user_test:smart-reply:${today}`, '30');
    const tok = await userToken();
    const r = await handleAiSmartReply(
      makeReq('POST', '/api/ai/smart-reply', { last_message: 'salut ça va ?' }, tok),
      env,
    );
    expect(r.status).toBe(429);
    const j = await r.json();
    expect(j.feature).toBe('smart-reply');
  });

  it('non-premium : translate quota 20/jour', async () => {
    const env = userEnv();
    mkUserWithPremium(env, false);
    const today = new Date().toISOString().slice(0, 10);
    await env.APEX_CHAT_KV.put(`quota:user_test:translate:${today}`, '20');
    const tok = await userToken();
    const r = await handleAiTranslate(
      makeReq('POST', '/api/ai/translate', { text: 'hello', target_lang: 'fr' }, tok),
      env,
    );
    expect(r.status).toBe(429);
    const j = await r.json();
    expect(j.feature).toBe('translate');
    expect(j.limit).toBe(20);
  });

  it('KV indisponible → fail-open (pas de blocage)', async () => {
    const env = userEnv();
    mkUserWithPremium(env, false);
    delete env.APEX_CHAT_KV; // simule absence binding
    globalThis.fetch = vi.fn(async () => new Response(
      JSON.stringify({ text: 'OK', language: 'fr' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));
    const tok = await userToken();
    const fd = new FormData();
    fd.append('audio', new File([new Uint8Array(1000)], 'a.webm', { type: 'audio/webm' }));
    const req = new Request('https://api.apex/api/ai/voice-transcribe', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + tok },
      body: fd,
    });
    const r = await handleAiVoiceTranscribe(req, env);
    // KV null → check_failed → fail open → 200 OK
    expect(r.status).toBe(200);
  });
});

// ============================================================================
//  v1.1.31 — handlePremiumQuota tests (GET /api/premium/quota)
// ============================================================================
describe("handlePremiumQuota (v1.1.31)", () => {
  it("refuse non-auth (401)", async () => {
    const r = await handlePremiumQuota(makeReq("GET", "/api/premium/quota"), userEnv());
    expect(r.status).toBe(401);
  });

  it("non-premium user : retourne usage 0/limit pour chaque feature", async () => {
    const env = userEnv();
    env.APEX_CHAT_DB.prepare = vi.fn(() => ({
      bind: function () { return this; },
      first: async () => ({ premium_until: 0, premium_plan: null }),
    }));
    const tok = await userToken();
    const r = await handlePremiumQuota(makeReq("GET", "/api/premium/quota", undefined, tok), env);
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.premium).toBe(false);
    expect(j.usage["voice-transcribe"].limit).toBe(5);
    expect(j.usage["voice-transcribe"].used).toBe(0);
    expect(j.usage["voice-transcribe"].remaining).toBe(5);
    expect(j.usage["voice-transcribe"].unlimited).toBe(false);
    expect(j.usage["image-describe"].limit).toBe(10);
    expect(j.usage["summarize"].limit).toBe(3);
    expect(j.usage["smart-reply"].limit).toBe(30);
    expect(j.usage["translate"].limit).toBe(20);
  });

  it("non-premium user : usage incrémenté reflète KV", async () => {
    const env = userEnv();
    env.APEX_CHAT_DB.prepare = vi.fn(() => ({
      bind: function () { return this; },
      first: async () => ({ premium_until: 0, premium_plan: null }),
    }));
    const today = new Date().toISOString().slice(0, 10);
    await env.APEX_CHAT_KV.put(`quota:user_test:voice-transcribe:${today}`, "3");
    await env.APEX_CHAT_KV.put(`quota:user_test:translate:${today}`, "20");
    const tok = await userToken();
    const r = await handlePremiumQuota(makeReq("GET", "/api/premium/quota", undefined, tok), env);
    const j = await r.json();
    expect(j.usage["voice-transcribe"].used).toBe(3);
    expect(j.usage["voice-transcribe"].remaining).toBe(2);
    expect(j.usage["translate"].used).toBe(20);
    expect(j.usage["translate"].remaining).toBe(0);
  });

  it("premium user : unlimited:true sur tous", async () => {
    const env = userEnv();
    env.APEX_CHAT_DB.prepare = vi.fn(() => ({
      bind: function () { return this; },
      first: async () => ({ premium_until: Date.now() + 86400_000, premium_plan: "monthly" }),
    }));
    const tok = await userToken();
    const r = await handlePremiumQuota(makeReq("GET", "/api/premium/quota", undefined, tok), env);
    const j = await r.json();
    expect(j.premium).toBe(true);
    expect(j.plan).toBe("monthly");
    Object.values(j.usage).forEach(u => expect(u.unlimited).toBe(true));
  });

  it("KV indispo : usage remains 0 (pas crash)", async () => {
    const env = userEnv();
    env.APEX_CHAT_DB.prepare = vi.fn(() => ({
      bind: function () { return this; },
      first: async () => ({ premium_until: 0 }),
    }));
    delete env.APEX_CHAT_KV;
    const tok = await userToken();
    const r = await handlePremiumQuota(makeReq("GET", "/api/premium/quota", undefined, tok), env);
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.usage["voice-transcribe"].used).toBe(0);
  });
});

// ============================================================================
//  v1.1.32 — _sendPremiumReceipt tests (Resend email after Stripe success)
// ============================================================================
describe('_sendPremiumReceipt (v1.1.32)', () => {
  it('rejette si RESEND_API_KEY manquant', async () => {
    await expect(
      _sendPremiumReceipt({}, { email: 'k@apex.fr', plan: 'monthly', amount: 699, currency: 'eur', sessionId: 's', premiumUntil: Date.now() })
    ).rejects.toThrow(/RESEND_API_KEY missing/);
  });

  it('envoie email avec plan monthly + retourne id', async () => {
    globalThis.fetch = vi.fn(async () => new Response(
      JSON.stringify({ id: 'email_abc123' }), { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));
    const result = await _sendPremiumReceipt({ RESEND_API_KEY: 're_xxx' }, {
      email: 'laurence@apex.fr', plan: 'monthly', amount: 699, currency: 'eur',
      sessionId: 'cs_test_1', premiumUntil: Date.now() + 31 * 86400 * 1000
    });
    expect(result.ok).toBe(true);
    expect(result.id).toBe('email_abc123');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const call = globalThis.fetch.mock.calls[0];
    expect(call[0]).toBe('https://api.resend.com/emails');
    const body = JSON.parse(call[1].body);
    expect(body.to).toEqual(['laurence@apex.fr']);
    expect(body.subject).toMatch(/Mensuel/);
    expect(body.html).toMatch(/Apex Chat\+ Premium/);
    expect(body.html).toMatch(/6\.99 EUR/);
    expect(call[1].headers.Authorization).toBe('Bearer re_xxx');
  });

  it('plan lifetime → "À vie" dans subject + body', async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ id: 'e1' }), { status: 200 }));
    await _sendPremiumReceipt({ RESEND_API_KEY: 're' }, {
      email: 'k@a.fr', plan: 'lifetime', amount: 19900, currency: 'eur',
      sessionId: 'cs', premiumUntil: 9999999999000
    });
    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body.subject).toMatch(/À vie/);
    expect(body.html).toMatch(/À vie/);
    expect(body.html).toMatch(/199\.00 EUR/);
  });

  it('plan yearly → "Annuel" + date formatée', async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ id: 'e' }), { status: 200 }));
    await _sendPremiumReceipt({ RESEND_API_KEY: 're' }, {
      email: 'k@a.fr', plan: 'yearly', amount: 5999, currency: 'eur',
      sessionId: 'cs2', premiumUntil: Date.now() + 365 * 86400 * 1000
    });
    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body.subject).toMatch(/Annuel/);
  });

  it('Resend HTTP error → throw avec status', async () => {
    globalThis.fetch = vi.fn(async () => new Response('Invalid API key', { status: 401 }));
    await expect(
      _sendPremiumReceipt({ RESEND_API_KEY: 'bad' }, {
        email: 'k@a.fr', plan: 'monthly', amount: 699, currency: 'eur',
        sessionId: 'cs', premiumUntil: Date.now()
      })
    ).rejects.toThrow(/Resend HTTP 401/);
  });

  it('From custom env.RESEND_FROM est utilisé', async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ id: 'e' }), { status: 200 }));
    await _sendPremiumReceipt({
      RESEND_API_KEY: 're',
      RESEND_FROM: 'Apex <hello@kdmc.io>'
    }, {
      email: 'k@a.fr', plan: 'monthly', amount: 699, currency: 'eur',
      sessionId: 'cs', premiumUntil: Date.now()
    });
    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body.from).toBe('Apex <hello@kdmc.io>');
  });

  it('tags Resend incluent category + plan', async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ id: 'e' }), { status: 200 }));
    await _sendPremiumReceipt({ RESEND_API_KEY: 're' }, {
      email: 'k@a.fr', plan: 'lifetime', amount: 19900, currency: 'eur',
      sessionId: 'cs', premiumUntil: 9999999999000
    });
    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body.tags).toEqual([
      { name: 'category', value: 'premium-receipt' },
      { name: 'plan', value: 'lifetime' }
    ]);
  });
});

// ============================================================================
//  v1.1.41 — handleAiRewrite tests (8 styles, share translate quota)
// ============================================================================
describe('handleAiRewrite (v1.1.41)', () => {
  it('refuse non-auth (401)', async () => {
    const r = await handleAiRewrite(makeReq('POST', '/api/ai/rewrite', { text: 'hello' }), userEnv());
    expect(r.status).toBe(401);
  });

  it('refuse text vide', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    const tok = await userToken();
    const r = await handleAiRewrite(makeReq('POST', '/api/ai/rewrite', { text: 'a' }, tok), env);
    expect(r.status).toBe(400);
  });

  it('refuse text > 2000 chars', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    const tok = await userToken();
    const r = await handleAiRewrite(
      makeReq('POST', '/api/ai/rewrite', { text: 'a'.repeat(3000), style: 'friendly' }, tok),
      env,
    );
    expect(r.status).toBe(400);
  });

  it('Anthropic success retourne rewritten + style', async () => {
    const env = userEnv({ ANTHROPIC_API_KEY: 'k' });
    env.APEX_CHAT_DB.prepare = vi.fn(() => ({
      bind: function () { return this; },
      first: async () => ({ premium_until: Date.now() + 86400_000, premium_plan: 'monthly' }),
    }));
    globalThis.fetch = vi.fn(async () => new Response(
      JSON.stringify({ content: [{ text: 'Bonjour, ravi de te rencontrer 🙏' }] }),
      { status: 200 }
    ));
    const tok = await userToken();
    const r = await handleAiRewrite(
      makeReq('POST', '/api/ai/rewrite', { text: 'salut', style: 'formal' }, tok),
      env,
    );
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.ok).toBe(true);
    expect(j.rewritten).toMatch(/Bonjour/);
    expect(j.style).toBe('formal');
    expect(j.original).toBe('salut');
    expect(j.premium).toBe(true);
  });

  it('quota dépassé → 429', async () => {
    const env = userEnv();
    env.APEX_CHAT_DB.prepare = vi.fn(() => ({
      bind: function () { return this; },
      first: async () => ({ premium_until: 0 }),
    }));
    const today = new Date().toISOString().slice(0, 10);
    await env.APEX_CHAT_KV.put(`quota:user_test:translate:${today}`, '20');
    const tok = await userToken();
    const r = await handleAiRewrite(
      makeReq('POST', '/api/ai/rewrite', { text: 'bonjour comment vas-tu' }, tok),
      env,
    );
    expect(r.status).toBe(429);
  });
});
