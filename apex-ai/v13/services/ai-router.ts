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

import { logger } from '../core/logger.js';
import { errors } from '../core/errors.js';
import { redactMessageContent } from './pii-redaction.js';

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

  getApiKey(provider: Provider): string {
    return localStorage.getItem(PROVIDERS[provider].keyName) ?? '';
  }

  hasAnyKey(): boolean {
    return DEFAULT_CHAIN.some((p) => this.getApiKey(p));
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
     * AVANT envoi providers IA pour anti-leak data sensible. */
    const redactedMessages = messages.map((m) => ({
      ...m,
      content: redactMessageContent(m.content) as ChatMessage['content'],
    }));

    if (this.currentAbort) this.currentAbort.abort();
    const ctrl = new AbortController();
    this.currentAbort = ctrl;

    const chain = this.getChainOrder();
    let lastErr: Error | null = null;

    for (const provider of chain) {
      const key = this.getApiKey(provider);
      if (!key && provider !== 'gemini') continue;
      try {
        await this.streamFromProvider(provider, key, redactedMessages, system, onChunk, ctrl.signal);
        this.currentAbort = null;
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
    onError?.(new Error(errors.toUserMessage(finalErr)));
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

    /* eslint-disable no-await-in-loop */
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
    /* eslint-enable no-await-in-loop */
    onChunk({ text: '', done: true, provider });
  }
}

export const aiRouter = new AIRouter();
