/**
 * APEX v13 — Unknown Credential Resolver (autonome).
 *
 * Demande Kevin 2026-05-04 :
 * "Si une clé ne se range pas il doit aller chercher sur internet le bon lien
 *  pour coller au bon endroit automatiquement et autonome.
 *  Tout autonome et automatique toujours partout."
 *
 * Architecture :
 * - Heuristiques sur la valeur (prefix, length, charset, format)
 * - Identification du service probable via patterns étendus
 * - Auto-fetch dashboard URL via heuristiques URL standards
 * - Web search fallback (via DuckDuckGo HTML scrape ou Brave si configuré)
 * - Auto-store dans `ax_<service>_key` deviné
 * - Auto-link dans links-registry
 * - Apprentissage : ajoute le nouveau pattern à `apex_v13_learned_patterns`
 * - Escalade Claude Code via `ax_claude_todo` pour ajouter au registry officiel
 */

import { logger } from '../core/logger.js';

import { auditLog } from './audit-log.js';

export interface ResolvedCredential {
  service: string;
  storage_key: string;
  dashboard_url: string;
  billing_url?: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  pattern_learned?: string; /* Nouveau pattern regex appris */
}

/* Heuristiques étendues pour identifier service via prefix */
const PREFIX_HEURISTICS: ReadonlyArray<{
  prefix_match: RegExp;
  service: string;
  dashboard: string;
  billing?: string;
  confidence: 'high' | 'medium' | 'low';
}> = [
  /* AI Providers */
  { prefix_match: /^sk-ant-/i, service: 'anthropic', dashboard: 'https://console.anthropic.com/', billing: 'https://console.anthropic.com/settings/billing', confidence: 'high' },
  { prefix_match: /^sk-proj-/, service: 'openai_project', dashboard: 'https://platform.openai.com/', billing: 'https://platform.openai.com/account/billing', confidence: 'high' },
  { prefix_match: /^sk-svcacct-/, service: 'openai_service_account', dashboard: 'https://platform.openai.com/', confidence: 'high' },
  { prefix_match: /^sk-/, service: 'openai', dashboard: 'https://platform.openai.com/', billing: 'https://platform.openai.com/account/billing', confidence: 'medium' },
  { prefix_match: /^gsk_/, service: 'groq', dashboard: 'https://console.groq.com/', billing: 'https://console.groq.com/settings/billing', confidence: 'high' },
  { prefix_match: /^sk-or-/, service: 'openrouter', dashboard: 'https://openrouter.ai/', billing: 'https://openrouter.ai/credits', confidence: 'high' },
  { prefix_match: /^pplx-/, service: 'perplexity', dashboard: 'https://www.perplexity.ai/settings/api', confidence: 'high' },
  { prefix_match: /^xai-/, service: 'xai_grok', dashboard: 'https://console.x.ai/', confidence: 'high' },
  { prefix_match: /^AIza/, service: 'google_ai', dashboard: 'https://aistudio.google.com/app/apikey', confidence: 'high' },
  { prefix_match: /^r8_/, service: 'replicate', dashboard: 'https://replicate.com/account/api-tokens', billing: 'https://replicate.com/account/billing', confidence: 'high' },

  /* Payments */
  { prefix_match: /^sk_(live|test)_/, service: 'stripe_secret', dashboard: 'https://dashboard.stripe.com/apikeys', billing: 'https://dashboard.stripe.com/billing', confidence: 'high' },
  { prefix_match: /^pk_(live|test)_/, service: 'stripe_publishable', dashboard: 'https://dashboard.stripe.com/apikeys', confidence: 'high' },
  { prefix_match: /^rk_(live|test)_/, service: 'stripe_restricted', dashboard: 'https://dashboard.stripe.com/apikeys', confidence: 'high' },
  { prefix_match: /^whsec_/, service: 'stripe_webhook', dashboard: 'https://dashboard.stripe.com/webhooks', confidence: 'high' },

  /* Email */
  { prefix_match: /^xkeysib-/, service: 'brevo', dashboard: 'https://app.brevo.com/', billing: 'https://app.brevo.com/billing/plan', confidence: 'high' },
  { prefix_match: /^re_/, service: 'resend', dashboard: 'https://resend.com/api-keys', billing: 'https://resend.com/settings/billing', confidence: 'high' },
  { prefix_match: /^SG\./, service: 'sendgrid', dashboard: 'https://app.sendgrid.com/settings/api_keys', confidence: 'high' },

  /* Dev / Hosting */
  { prefix_match: /^ghp_/, service: 'github_pat', dashboard: 'https://github.com/settings/tokens', confidence: 'high' },
  { prefix_match: /^github_pat_/, service: 'github_fine_grained', dashboard: 'https://github.com/settings/tokens?type=beta', confidence: 'high' },
  { prefix_match: /^gho_/, service: 'github_oauth', dashboard: 'https://github.com/settings/applications', confidence: 'high' },
  { prefix_match: /^glpat-/, service: 'gitlab', dashboard: 'https://gitlab.com/-/profile/personal_access_tokens', confidence: 'high' },
  { prefix_match: /^pat[A-Za-z0-9.]+$/, service: 'airtable', dashboard: 'https://airtable.com/create/tokens', confidence: 'high' },
  { prefix_match: /^secret_/, service: 'notion', dashboard: 'https://www.notion.so/my-integrations', confidence: 'high' },
  { prefix_match: /^xox[bp]-/, service: 'slack', dashboard: 'https://api.slack.com/apps', confidence: 'high' },

  /* Cloud */
  { prefix_match: /^AKIA/, service: 'aws_access_key', dashboard: 'https://console.aws.amazon.com/iam/home', confidence: 'high' },
  { prefix_match: /^AGPA[A-Z0-9]{16}$/, service: 'aws_root', dashboard: 'https://console.aws.amazon.com/', confidence: 'medium' },

  /* Misc */
  { prefix_match: /^xoxb-/, service: 'slack_bot', dashboard: 'https://api.slack.com/apps', confidence: 'high' },
  { prefix_match: /^\d+:[A-Za-z0-9_-]+$/, service: 'telegram_bot', dashboard: 'https://t.me/BotFather', confidence: 'high' },
];

class UnknownCredentialResolver {
  /**
   * Tente d'identifier un service via heuristiques + web search fallback.
   */
  async tryIdentify(value: string): Promise<ResolvedCredential | null> {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 16) return null;

    /* 1. Heuristiques prefix (rapide, offline) */
    for (const h of PREFIX_HEURISTICS) {
      if (h.prefix_match.test(trimmed)) {
        const result: ResolvedCredential = {
          service: h.service,
          storage_key: `ax_${h.service}_key`,
          dashboard_url: h.dashboard,
          ...(h.billing && { billing_url: h.billing }),
          confidence: h.confidence,
          reason: `Prefix heuristic match : ${h.prefix_match.source}`,
        };
        void auditLog.record('credential.resolved_heuristic', {
          details: { service: h.service, confidence: h.confidence },
        });
        return result;
      }
    }

    /* 2. Format générique (length + charset) → propose service générique */
    const charset = this.detectCharset(trimmed);
    if (trimmed.length >= 32 && trimmed.length <= 256 && (charset === 'base64url' || charset === 'hex' || charset === 'alphanum')) {
      /* Token générique potentiel — auto-store comme "unknown_token_<hash>" */
      const shortHash = await this.shortHash(trimmed);
      const service = `unknown_${shortHash}`;
      void auditLog.record('credential.resolved_generic', {
        details: { length: trimmed.length, charset },
      });
      return {
        service,
        storage_key: `ax_${service}_key`,
        dashboard_url: 'https://duckduckgo.com/?q=' + encodeURIComponent(`API key format ${trimmed.slice(0, 8)}*`),
        confidence: 'low',
        reason: `Format générique ${charset} ${trimmed.length} chars — recherche web nécessaire`,
        pattern_learned: this.buildPatternFromValue(trimmed),
      };
    }

    /* 3. Web search fallback (si DDG endpoint dispo) */
    try {
      const searched = await this.webSearchService(trimmed);
      if (searched) {
        void auditLog.record('credential.resolved_websearch', {
          details: { service: searched.service },
        });
        return searched;
      }
    } catch (err: unknown) {
      logger.warn('credential-resolver', 'web search failed', { err });
    }

    return null;
  }

  /**
   * Web search via DuckDuckGo HTML pour identifier service inconnu.
   */
  private async webSearchService(value: string): Promise<ResolvedCredential | null> {
    const prefix = value.slice(0, 8);
    const query = `API key format prefix ${prefix} dashboard URL`;
    try {
      /* DuckDuckGo HTML scrape (sans CORS si configurer proxy) */
      const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      const html = await res.text();
      /* Extract premier domaine pertinent dans les résultats */
      const m = html.match(/href="https?:\/\/([a-z0-9-]+\.[a-z]{2,})/i);
      const domain = m?.[1];
      if (!domain) return null;
      const service = domain.split('.')[0] ?? 'unknown';
      return {
        service,
        storage_key: `ax_${service}_key`,
        dashboard_url: `https://${domain}`,
        confidence: 'low',
        reason: `Web search match domain : ${domain}`,
      };
    } catch {
      return null;
    }
  }

  /**
   * Apprend pattern + escalade Claude Code pour intégration officielle.
   */
  async learn(value: string, resolved: ResolvedCredential): Promise<void> {
    if (!resolved.pattern_learned) return;
    try {
      const learned = JSON.parse(localStorage.getItem('apex_v13_learned_patterns') ?? '[]') as Array<{
        service: string;
        pattern: string;
        sample_prefix: string;
        learned_at: number;
      }>;
      const exists = learned.some((l) => l.service === resolved.service);
      if (!exists) {
        learned.push({
          service: resolved.service,
          pattern: resolved.pattern_learned,
          sample_prefix: value.slice(0, 8),
          learned_at: Date.now(),
        });
        localStorage.setItem('apex_v13_learned_patterns', JSON.stringify(learned.slice(-50)));
      }
      /* Escalade Claude Code pour ajout officiel */
      const todos = JSON.parse(localStorage.getItem('ax_claude_todo') ?? '[]') as Array<unknown>;
      todos.push({
        id: `c_pattern_${Date.now()}`,
        type: 'add_credential_pattern',
        service: resolved.service,
        pattern: resolved.pattern_learned,
        sample_prefix: value.slice(0, 8),
        confidence: resolved.confidence,
        ts: Date.now(),
        status: 'pending',
      });
      localStorage.setItem('ax_claude_todo', JSON.stringify(todos.slice(-50)));
    } catch (err: unknown) {
      logger.warn('credential-resolver', 'learn failed', { err });
    }
  }

  /**
   * Liste patterns appris (admin UI).
   */
  listLearned(): readonly { service: string; pattern: string; sample_prefix: string; learned_at: number }[] {
    try {
      return JSON.parse(localStorage.getItem('apex_v13_learned_patterns') ?? '[]') as Array<{
        service: string; pattern: string; sample_prefix: string; learned_at: number;
      }>;
    } catch {
      return [];
    }
  }

  /* === Helpers === */

  private detectCharset(value: string): 'hex' | 'base64' | 'base64url' | 'alphanum' | 'mixed' {
    if (/^[0-9a-f]+$/i.test(value)) return 'hex';
    if (/^[A-Za-z0-9+/=]+$/.test(value)) return 'base64';
    if (/^[A-Za-z0-9_-]+$/.test(value)) return 'base64url';
    if (/^[A-Za-z0-9]+$/.test(value)) return 'alphanum';
    return 'mixed';
  }

  private async shortHash(value: string): Promise<string> {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      let h = 0;
      for (let i = 0; i < value.length; i++) h = ((h << 5) - h + value.charCodeAt(i)) | 0;
      return (h >>> 0).toString(36).slice(0, 8);
    }
    try {
      const data = new TextEncoder().encode(value);
      const buf = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(buf))
        .slice(0, 4)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      return Math.random().toString(36).slice(2, 10);
    }
  }

  private buildPatternFromValue(value: string): string {
    /* Construit regex générique basé sur la valeur (premier 4 chars + reste générique) */
    const prefix = value.slice(0, 4).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const charset = this.detectCharset(value);
    const range =
      charset === 'hex' ? '[0-9a-f]' :
      charset === 'base64url' ? '[A-Za-z0-9_-]' :
      charset === 'alphanum' ? '[A-Za-z0-9]' :
      '[A-Za-z0-9+/=]';
    const minLen = Math.max(8, value.length - 8);
    return `^${prefix}${range}{${minLen},}$`;
  }
}

export const unknownCredentialResolver = new UnknownCredentialResolver();
