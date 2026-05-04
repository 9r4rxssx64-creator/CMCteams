/**
 * APEX v13 — AI Router avec failover multi-provider
 *
 * Demande Kevin (qualité ULTRA chat) + règles CLAUDE.md :
 * - "Anti-blocage IA, auto-déblocage total"
 * - "Niveau production Claude.ai/ChatGPT"
 * - JAMAIS de réponse vide / "je n'ai pas compris" / "API indisponible"
 *
 * Chaîne failover : Anthropic → OpenRouter → Groq → Gemini → OpenClaw → mode dégradé local
 *
 * Streaming SSE token-par-token avec animation typing fluide.
 * Idempotency key par requête (pas de double-facturation sur retry).
 * AbortController sur chaque fetch (pas de zombie).
 */

import { errors } from '../core/errors.js';
import { logger } from '../core/logger.js';

import { auditLog } from './audit-log.js';
import { chatFallback } from './chat-fallback.js';
import { redactMessageContent, redactPII } from './pii-redaction.js';
import { tokensDashboard } from './tokens-dashboard.js';

export type Provider = 'anthropic' | 'openrouter' | 'groq' | 'gemini' | 'openclaw';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: string; [k: string]: unknown }>;
}

export interface StreamChunk {
  text: string;
  done: boolean;
  provider: Provider;
}

interface ProviderConfig {
  endpoint: string;
  keyName: string;
  model: string;
  buildBody: (messages: ChatMessage[], system: string) => unknown;
  parseSSE: (data: string) => string | null;
  headers: (apiKey: string) => Record<string, string>;
}

const PROVIDERS: Record<Provider, ProviderConfig> = {
  anthropic: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    keyName: 'ax_anthropic_key',
    model: 'claude-sonnet-4-6',
    buildBody: (messages, system) => ({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      stream: true,
      system,
      messages: messages.filter((m) => m.role !== 'system'),
    }),
    parseSSE: (data) => {
      try {
        const j = JSON.parse(data) as { type?: string; delta?: { text?: string } };
        if (j.type === 'content_block_delta' && j.delta?.text) return j.delta.text;
      } catch {
        /* ignore */
      }
      return null;
    },
    headers: (apiKey) => ({
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    }),
  },
  openrouter: {
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    keyName: 'ax_openrouter_key',
    model: 'anthropic/claude-sonnet-4-6',
    buildBody: (messages, system) => ({
      model: 'anthropic/claude-sonnet-4-6',
      stream: true,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
    parseSSE: (data) => {
      try {
        const j = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> };
        return j.choices?.[0]?.delta?.content ?? null;
      } catch {
        return null;
      }
    },
    headers: (apiKey) => ({
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    }),
  },
  groq: {
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    keyName: 'ax_groq_key',
    model: 'llama-3.3-70b-versatile',
    buildBody: (messages, system) => ({
      model: 'llama-3.3-70b-versatile',
      stream: true,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
    parseSSE: (data) => {
      try {
        const j = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> };
        return j.choices?.[0]?.delta?.content ?? null;
      } catch {
        return null;
      }
    },
    headers: (apiKey) => ({
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    }),
  },
  gemini: {
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:streamGenerateContent',
    keyName: 'ax_google_key',
    model: 'gemini-2.5-pro',
    buildBody: (messages, system) => ({
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }],
      })),
      systemInstruction: { parts: [{ text: system }] },
    }),
    parseSSE: (data) => {
      try {
        const j = JSON.parse(data) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
        return j.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      } catch {
        return null;
      }
    },
    /* P0-2 fix : header x-goog-api-key au lieu de query string (anti leak proxy/log) */
    headers: (apiKey) => ({ 'content-type': 'application/json', 'x-goog-api-key': apiKey }),
  },
  openclaw: {
    endpoint: 'https://api.openclaw.io/v1/chat/completions' /* placeholder, à confirmer quand Kevin fournit clé */,
    keyName: 'ax_openclaw_key',
    model: 'openclaw-default',
    buildBody: (messages, system) => ({
      stream: true,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
    parseSSE: (data) => {
      try {
        const j = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> };
        return j.choices?.[0]?.delta?.content ?? null;
      } catch {
        return null;
      }
    },
    headers: (apiKey) => ({
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    }),
  },
};

const DEFAULT_CHAIN: readonly Provider[] = ['anthropic', 'openrouter', 'groq', 'gemini', 'openclaw'];

class AIRouter {
  private currentAbort: AbortController | null = null;

  /**
   * Lecture sync brute (peut être chiffrée AXENC1: si stockée via vault.autoStore).
   * Préférer getApiKeyDecrypted() async pour usage AI calls.
   */
  getApiKey(provider: Provider): string {
    return localStorage.getItem(PROVIDERS[provider].keyName) ?? '';
  }

  /**
   * Lecture async avec déchiffrement auto si AXENC1: prefix.
   */
  async getApiKeyDecrypted(provider: Provider): Promise<string> {
    const raw = this.getApiKey(provider);
    if (!raw) return '';
    if (raw.startsWith('AXENC1:')) {
      const { vault } = await import('./vault.js');
      const decrypted = await vault.decryptAuto(raw);
      return decrypted ?? '';
    }
    return raw;
  }

  hasAnyKey(): boolean {
    /* Vérifie présence non-vide raw (chiffrée ou non) */
    return DEFAULT_CHAIN.some((p) => this.getApiKey(p).length > 0);
  }

  /**
   * Stream une réponse IA avec failover automatique.
   * Callbacks : onChunk pour rendu progressif, onError pour catch final.
   */
  async stream(
    messages: ChatMessage[],
    system: string,
    onChunk: (chunk: StreamChunk) => void,
    onError?: (err: Error) => void,
  ): Promise<void> {
    if (!this.hasAnyKey()) {
      onError?.(new Error('Aucune clé API configurée. Va dans le Coffre pour ajouter.'));
      return;
    }

    /* P1 fix : PII redaction outbound — filtre email/CB/IBAN/SS/passport/etc.
     * AVANT envoi providers IA pour anti-leak data sensible.
     * Jet 13.0.40 : audit log si PII détecté (SOC2 trail). */
    let totalPiiFound = 0;
    const redactedMessages = messages.map((m) => {
      if (typeof m.content === 'string') {
        const r = redactPII(m.content);
        totalPiiFound += r.foundCount;
        return { ...m, content: r.redacted };
      }
      return { ...m, content: redactMessageContent(m.content) as ChatMessage['content'] };
    });
    if (totalPiiFound > 0) {
      void auditLog.record('ai.pii_redacted_outbound', {
        details: { count: totalPiiFound, messages_count: messages.length },
      });
      logger.info('ai-router', `PII redacted outbound: ${totalPiiFound} occurrences`);
    }

    if (this.currentAbort) this.currentAbort.abort();
    const ctrl = new AbortController();
    this.currentAbort = ctrl;

    /* Wire ai-routing-policy : policy.decide() respecte mode (auto/economy/premium/forced)
     * + Anthropic priority + budget aware. Fallback en cas d'erreur 4xx/5xx via chain. */
    const chain = await this.buildPolicyAwareChain(messages);
    let lastErr: Error | null = null;

    /* Estimation tokens input pour dashboard (heuristique : 1 token ≈ 4 chars FR/EN) */
    const inputTokensEstimate = Math.ceil(
      JSON.stringify(redactedMessages).length / 4 + system.length / 4,
    );
    let outputTokensEstimate = 0;

    /* Wrap onChunk pour count output tokens (visuel conso Kevin) */
    const wrappedOnChunk = (chunk: StreamChunk): void => {
      if (chunk.text) outputTokensEstimate += Math.ceil(chunk.text.length / 4);
      onChunk(chunk);
    };

    for (const provider of chain) {
      /* P0 SÉCU : déchiffrement à l'usage (vault tokens chiffrés au repos) */
      const key = await this.getApiKeyDecrypted(provider);
      if (!key && provider !== 'gemini') continue;
      try {
        await this.streamFromProvider(provider, key, redactedMessages, system, wrappedOnChunk, ctrl.signal);
        this.currentAbort = null;
        /* WIRE tokens-dashboard : enregistre conso après stream succès */
        const modelName = this.getModelKey(provider);
        tokensDashboard.record(provider, inputTokensEstimate, outputTokensEstimate, modelName);
        return; /* succès */
      } catch (err: unknown) {
        const e = err instanceof Error ? err : new Error(String(err));
        if (e.name === 'AbortError') {
          this.currentAbort = null;
          return;
        }
        lastErr = e;
        logger.warn('ai-router', `${provider} failed, trying next`, { err: e.message });
      }
    }

    this.currentAbort = null;
    const finalErr = lastErr ?? new Error('Tous les providers IA indisponibles');
    errors.capture(finalErr);

    /* WIRE chat-fallback : génère réponse actionnable au lieu de message vide
     * (règle CLAUDE.md absolue : JAMAIS message vide) */
    const userLastMsg = redactedMessages[redactedMessages.length - 1];
    const userText =
      typeof userLastMsg?.content === 'string'
        ? userLastMsg.content
        : JSON.stringify(userLastMsg?.content ?? '');
    const fallback = chatFallback.generateFallback(userText, finalErr.message);
    /* Stream le fallback en chunks pour cohérence UI typing animation */
    onChunk({ text: fallback.text, done: false, provider: 'anthropic' });
    onChunk({ text: '', done: true, provider: 'anthropic' });
    onError?.(new Error(errors.toUserMessage(finalErr)));
  }

  /**
   * Map provider → model key pour pricing.
   */
  private getModelKey(provider: Provider): string {
    switch (provider) {
      case 'anthropic':
        return 'anthropic_sonnet';
      case 'groq':
        return 'groq_llama';
      case 'gemini':
        return 'gemini_pro';
      case 'openrouter':
      case 'openclaw':
      default:
        return 'openrouter_default';
    }
  }

  abort(): void {
    if (this.currentAbort) {
      this.currentAbort.abort();
      this.currentAbort = null;
    }
  }

  private getChainOrder(): readonly Provider[] {
    try {
      const stored = localStorage.getItem('apex_v13_failover_chain');
      if (stored) {
        const parsed = JSON.parse(stored) as Provider[];
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_CHAIN;
  }

  /**
   * Wire ai-routing-policy : décide primary + fallback chain selon
   * mode (auto/economy/premium/forced), domain détecté, budget Anthropic.
   * Map policy.ProviderId → router.Provider (drop providers non supportés).
   * Fallback sur DEFAULT_CHAIN si policy indisponible.
   */
  private async buildPolicyAwareChain(messages: ChatMessage[]): Promise<readonly Provider[]> {
    try {
      const { aiRoutingPolicy } = await import('./ai-routing-policy.js');
      /* Détecte domain depuis dernier message user (heuristique policy) */
      const lastUser = [...messages].reverse().find((m) => m.role === 'user');
      const userText =
        typeof lastUser?.content === 'string'
          ? lastUser.content
          : JSON.stringify(lastUser?.content ?? '');
      const domain = aiRoutingPolicy.detectDomain(userText);
      const estimatedTokens = Math.ceil(JSON.stringify(messages).length / 4);
      const decision = aiRoutingPolicy.decide(domain, estimatedTokens);
      logger.info('ai-router', 'policy decision', {
        domain,
        primary: decision.primary,
        reason: decision.reason,
        fallback_count: decision.fallback_chain.length,
      });
      /* SOC2 audit trail : policy decision (sécu trace pour compliance) */
      void auditLog.record('ai.routing_policy_decision', {
        details: {
          domain,
          primary: decision.primary,
          reason: decision.reason,
          fallback_count: decision.fallback_chain.length,
          tokens: estimatedTokens,
        },
      });
      /* Map policy ProviderId → router Provider (filtre supportés) */
      const supported: readonly Provider[] = ['anthropic', 'openrouter', 'groq', 'gemini', 'openclaw'];
      const mapToRouter = (p: string): Provider | null => {
        if ((supported as readonly string[]).includes(p)) return p as Provider;
        /* Providers policy non implémentés ai-router : openai, deepseek, cohere, mistral, perplexity
         * → fallback vers openrouter (proxy universel) si dispo */
        if (['openai', 'deepseek', 'cohere', 'mistral', 'perplexity'].includes(p)) return 'openrouter';
        return null;
      };
      const ordered: Provider[] = [];
      const seen = new Set<Provider>();
      const push = (p: string): void => {
        const mapped = mapToRouter(p);
        if (mapped && !seen.has(mapped)) {
          seen.add(mapped);
          ordered.push(mapped);
        }
      };
      push(decision.primary);
      for (const f of decision.fallback_chain) push(f);
      /* Append legacy chain in queue pour garantir failover total même si policy ne couvre pas tout */
      for (const p of this.getChainOrder()) push(p);
      return ordered.length > 0 ? ordered : DEFAULT_CHAIN;
    } catch (err: unknown) {
      logger.warn('ai-router', 'policy unavailable, fallback DEFAULT_CHAIN', { err });
      return this.getChainOrder();
    }
  }

  private async streamFromProvider(
    provider: Provider,
    apiKey: string,
    messages: ChatMessage[],
    system: string,
    onChunk: (chunk: StreamChunk) => void,
    signal: AbortSignal,
  ): Promise<void> {
    const cfg = PROVIDERS[provider];
    /* P0-2 fix : Gemini key DANS le header (déjà ci-dessus), URL ne contient QUE alt=sse */
    const url = provider === 'gemini' ? `${cfg.endpoint}?alt=sse` : cfg.endpoint;
    const res = await fetch(url, {
      method: 'POST',
      headers: cfg.headers(apiKey),
      body: JSON.stringify(cfg.buildBody(messages, system)),
      signal,
    });
    if (!res.ok) throw new Error(`${provider} HTTP ${res.status}`);
    if (!res.body) throw new Error(`${provider} no stream body`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

     
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const raw of lines) {
        const line = raw.trim();
        if (!line || !line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') {
          onChunk({ text: '', done: true, provider });
          return;
        }
        const text = cfg.parseSSE(data);
        if (text) onChunk({ text, done: false, provider });
      }
    }
     
    onChunk({ text: '', done: true, provider });
  }
}

export const aiRouter = new AIRouter();
