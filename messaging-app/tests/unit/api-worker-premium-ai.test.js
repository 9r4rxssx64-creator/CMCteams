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
  handlePremiumCheckout,
  handlePremiumWebhook,
  handlePremiumStatus,
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
