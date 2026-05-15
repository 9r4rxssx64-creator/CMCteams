/**
 * APEX v13.4.100 — Test RUNTIME credentials (Kevin "teste tout toujours").
 *
 * Pour chaque service connu, pingue son endpoint /me ou équivalent en lisant
 * le credential vault. Retourne status : ok / invalid / rate_limited / quota / network_error.
 *
 * Utilisé par :
 *  - apex-credential-associator.runTest(id) au add d'un credential
 *  - sentinelle credentials-watch quotidienne
 *  - bouton admin "Re-tester tout maintenant"
 *
 * INTERDIT : prétendre qu'un credential fonctionne sans avoir lancé ce test.
 */

import { vault } from './vault.js';
import { logger } from '../core/logger.js';

export interface TestResult {
  service: string;
  status: 'ok' | 'invalid' | 'rate_limited' | 'quota_exceeded' | 'network_error' | 'untested';
  http_status?: number;
  rate_limit_remaining?: number;
  ts: number;
  detail?: string;
}

/** Configuration test par service connu */
interface ServiceTestConfig {
  /** Clé vault à lire */
  storageKey: string;
  /** URL endpoint pour test (GET ou HEAD) */
  testUrl: string;
  /** Header auth à construire depuis le token */
  authHeader: (token: string) => Record<string, string>;
  /** Méthode HTTP */
  method?: 'GET' | 'HEAD' | 'POST';
  /** Body si POST */
  body?: () => string;
}

const SERVICE_TESTS: Record<string, ServiceTestConfig> = {
  anthropic: {
    storageKey: 'ax_anthropic_key',
    testUrl: 'https://api.anthropic.com/v1/messages',
    /* Anthropic requires POST messages. Use minimal request to check 401 vs 200. */
    method: 'POST',
    authHeader: (t: string) => ({
      'x-api-key': t,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    }),
    body: () => JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'ping' }],
    }),
  },
  openai: {
    storageKey: 'ax_openai_key',
    testUrl: 'https://api.openai.com/v1/models',
    method: 'GET',
    authHeader: (t: string) => ({ Authorization: `Bearer ${t}` }),
  },
  groq: {
    storageKey: 'ax_groq_key',
    testUrl: 'https://api.groq.com/openai/v1/models',
    method: 'GET',
    authHeader: (t: string) => ({ Authorization: `Bearer ${t}` }),
  },
  mistral: {
    storageKey: 'ax_mistral_key',
    testUrl: 'https://api.mistral.ai/v1/models',
    method: 'GET',
    authHeader: (t: string) => ({ Authorization: `Bearer ${t}` }),
  },
  deepseek: {
    storageKey: 'ax_deepseek_key',
    testUrl: 'https://api.deepseek.com/v1/models',
    method: 'GET',
    authHeader: (t: string) => ({ Authorization: `Bearer ${t}` }),
  },
  perplexity: {
    storageKey: 'ax_perplexity_key',
    testUrl: 'https://api.perplexity.ai/chat/completions',
    method: 'POST',
    authHeader: (t: string) => ({ Authorization: `Bearer ${t}`, 'content-type': 'application/json' }),
    body: () => JSON.stringify({
      model: 'sonar',
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 1,
    }),
  },
  github: {
    storageKey: 'ax_github_token',
    testUrl: 'https://api.github.com/user',
    method: 'GET',
    authHeader: (t: string) => ({
      Authorization: `Bearer ${t}`,
      Accept: 'application/vnd.github+json',
    }),
  },
  xai: {
    storageKey: 'ax_xai_key',
    testUrl: 'https://api.x.ai/v1/models',
    method: 'GET',
    authHeader: (t: string) => ({ Authorization: `Bearer ${t}` }),
  },
};

async function testRuntime(service: string): Promise<TestResult> {
  const cfg = SERVICE_TESTS[service.toLowerCase()];
  if (!cfg) {
    return {
      service,
      status: 'untested',
      ts: Date.now(),
      detail: `no test config for service ${service}`,
    };
  }
  let token = '';
  try {
    token = await vault.readKey(cfg.storageKey);
  } catch (err: unknown) {
    return {
      service,
      status: 'network_error',
      ts: Date.now(),
      detail: `vault read failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
  if (!token || token.length < 10) {
    return {
      service,
      status: 'invalid',
      ts: Date.now(),
      detail: 'token missing or too short',
    };
  }
  try {
    const headers = cfg.authHeader(token);
    const init: RequestInit = {
      method: cfg.method ?? 'GET',
      headers,
    };
    if (cfg.body) init.body = cfg.body();
    /* Timeout 8s pour ne pas bloquer trop longtemps */
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    init.signal = controller.signal;
    const resp = await fetch(cfg.testUrl, init);
    clearTimeout(timeout);
    const status = resp.status;
    const rlRemaining = resp.headers.get('x-ratelimit-remaining');
    const rateLimitRemaining = rlRemaining ? parseInt(rlRemaining, 10) : undefined;

    let result: TestResult['status'] = 'untested';
    let detail = `HTTP ${status}`;
    if (status >= 200 && status < 300) {
      result = 'ok';
    } else if (status === 401 || status === 403) {
      result = 'invalid';
      detail = `auth failed HTTP ${status}`;
    } else if (status === 429) {
      result = 'rate_limited';
      detail = `rate limited HTTP 429`;
    } else if (status === 402) {
      result = 'quota_exceeded';
      detail = `quota exceeded HTTP 402`;
    } else if (status >= 500) {
      result = 'network_error';
      detail = `server error HTTP ${status}`;
    } else {
      result = 'invalid';
      detail = `unexpected HTTP ${status}`;
    }
    const out: TestResult = { service, status: result, http_status: status, ts: Date.now(), detail };
    if (rateLimitRemaining !== undefined) out.rate_limit_remaining = rateLimitRemaining;
    return out;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    /* Distinguer abort timeout vs autre */
    const isAbort = /abort/i.test(msg);
    return {
      service,
      status: 'network_error',
      ts: Date.now(),
      detail: isAbort ? 'timeout 8s' : msg.slice(0, 100),
    };
  }
}

async function testAllConfigured(): Promise<TestResult[]> {
  const services = Object.keys(SERVICE_TESTS);
  logger.info('cred-tester', `Running ${services.length} parallel tests`);
  const results = await Promise.allSettled(services.map((s) => testRuntime(s)));
  return results.map((r, i) => {
    const svc = services[i] ?? 'unknown';
    if (r.status === 'fulfilled') return r.value;
    return {
      service: svc,
      status: 'network_error' as const,
      ts: Date.now(),
      detail: r.reason instanceof Error ? r.reason.message : String(r.reason),
    };
  });
}

function isServiceSupported(service: string): boolean {
  return service.toLowerCase() in SERVICE_TESTS;
}

function listSupportedServices(): string[] {
  return Object.keys(SERVICE_TESTS);
}

export { testRuntime, testAllConfigured, isServiceSupported, listSupportedServices };
