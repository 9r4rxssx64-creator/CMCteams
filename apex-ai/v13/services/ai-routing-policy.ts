/**
 * APEX v13 — AI Routing Policy intelligente.
 *
 * Demande Kevin 2026-05-04 :
 * "Priorise les gratuits performants sans limite ou non gênant à terme.
 *  Organise au mieux la conso entre les différentes IA suivant les demandes,
 *  travaux demandés et les choix admins. Toujours garder Anthropic opérationnel
 *  en priorité."
 *
 * Stratégie :
 * 1. ANTHROPIC = priorité absolue par défaut (admin, sécu, raisonnement complexe)
 * 2. FREE FIRST : tâches simples → Groq/Gemini gratuit
 * 3. DOMAIN ROUTING : code → DeepSeek/Claude, vision → Gemini, speed → Groq
 * 4. FAILOVER : Anthropic → OpenRouter (free) → Gemini → Groq → OpenAI
 * 5. ADMIN OVERRIDE : preferredProvider + economyMode/premiumMode
 * 6. AUTO ÉCONOMIE : si budget Anthropic > 80% → bascule auto free-first
 *
 * Anti-pattern :
 * - Pas bloquer user si Anthropic full → toujours fallback gratuit
 * - Garder réserve Anthropic pour admin Kevin urgent
 */

import { logger } from '../core/logger.js';

import { consumptionMonitor } from './consumption-monitor.js';

export type ProviderId = 'anthropic' | 'openai' | 'groq' | 'gemini' | 'openrouter' | 'deepseek' | 'cohere' | 'mistral' | 'perplexity';

export type TaskDomain =
  | 'general' /* Chat normal */
  | 'admin' /* Admin Kevin (sécurité, config, sensitive) */
  | 'code' /* Programmation */
  | 'vision' /* Image / OCR analysis */
  | 'long_context' /* Document > 5000 tokens */
  | 'speed' /* Vitesse critique */
  | 'reasoning' /* Raisonnement complexe */
  | 'search' /* Citations / recherche */
  | 'translation' /* Traduction simple */
  | 'summary' /* Résumé court */
  | 'creative'; /* Écriture créative */

export type RoutingMode = 'auto' | 'economy' | 'premium' | 'forced';

export interface RoutingDecision {
  primary: ProviderId;
  fallback_chain: readonly ProviderId[];
  reason: string;
  is_free_tier: boolean;
  estimated_cost_eur: number;
}

const DOMAIN_PREFERENCES: Record<TaskDomain, readonly ProviderId[]> = {
  /* Admin Kevin = TOUJOURS Anthropic d'abord */
  admin: ['anthropic', 'openai', 'gemini'],
  /* Raisonnement complexe = Anthropic > OpenAI > Gemini */
  reasoning: ['anthropic', 'openai', 'gemini', 'groq'],
  /* Code = DeepSeek très bon marché ou Claude */
  code: ['anthropic', 'deepseek', 'openai', 'gemini'],
  /* Vision = Gemini gratuit + Claude */
  vision: ['gemini', 'anthropic', 'openai'],
  /* Long context = Gemini 1M tokens gratuit */
  long_context: ['gemini', 'anthropic', 'openai'],
  /* Speed = Groq (500+ tok/sec) */
  speed: ['groq', 'gemini', 'openrouter', 'anthropic'],
  /* Search citations = Perplexity puis Anthropic */
  search: ['perplexity', 'anthropic', 'gemini'],
  /* Traduction simple = free first */
  translation: ['gemini', 'groq', 'openrouter', 'anthropic'],
  /* Résumé court = free first */
  summary: ['groq', 'gemini', 'openrouter', 'anthropic'],
  /* Créatif = Anthropic en premier */
  creative: ['anthropic', 'openai', 'gemini'],
  /* Général = priorité Anthropic + free fallback */
  general: ['anthropic', 'gemini', 'groq', 'openrouter'],
};

const FREE_PROVIDERS: readonly ProviderId[] = ['groq', 'gemini', 'openrouter'];

/* Coûts indicatifs €/1M tokens (avg in/out) */
const COST_PER_M_TOKENS_EUR: Record<ProviderId, number> = {
  anthropic: 8.0,    /* Sonnet 4.6 */
  openai: 6.0,       /* GPT-4o */
  groq: 0,           /* Free tier */
  gemini: 0,         /* Free tier 1M/jour */
  openrouter: 0,     /* Free models Llama, Mixtral */
  deepseek: 0.4,     /* Très bon marché */
  cohere: 1.5,       /* Command R+ */
  mistral: 4.0,      /* Large */
  perplexity: 5.0,   /* Sonar */
};

class AIRoutingPolicy {
  /**
   * Décide quel provider utiliser pour une tâche donnée.
   */
  decide(domain: TaskDomain = 'general', estimatedTokens = 1000): RoutingDecision {
    const mode = this.getMode();
    const adminOverride = this.getAdminOverride();

    /* Mode forced : admin a forcé un provider spécifique */
    if (mode === 'forced' && adminOverride) {
      return this.buildDecision(adminOverride, domain, estimatedTokens, `Admin forced ${adminOverride}`);
    }

    /* Mode premium : Anthropic Opus toujours */
    if (mode === 'premium') {
      return this.buildDecision('anthropic', domain, estimatedTokens, 'Premium mode (Anthropic always)');
    }

    /* Mode economy : free first systématique */
    if (mode === 'economy') {
      const freeAvailable = FREE_PROVIDERS.find((p) => this.hasKey(p));
      if (freeAvailable) {
        return this.buildDecision(freeAvailable, domain, estimatedTokens, 'Economy mode (free first)');
      }
      /* Pas de provider gratuit configuré → fallback Anthropic */
      return this.buildDecision('anthropic', domain, estimatedTokens, 'Economy mode mais aucun free configuré');
    }

    /* Mode auto (défaut) : domain-based + Anthropic priority + budget aware */

    /* Check budget Anthropic */
    const anthropicStatus = consumptionMonitor.getServiceStatus('anthropic');
    const anthropicCritical = anthropicStatus.severity === 'critical';
    const anthropicWarn = anthropicStatus.severity === 'warn';

    /* Domain admin = TOUJOURS Anthropic même si budget critique (réserve admin) */
    if (domain === 'admin') {
      return this.buildDecision('anthropic', domain, estimatedTokens, 'Admin task : Anthropic priority absolute');
    }

    const preferences = DOMAIN_PREFERENCES[domain];
    const available = preferences.filter((p) => this.hasKey(p));

    /* Si Anthropic critique → free first */
    if (anthropicCritical) {
      const freeOption = available.find((p) => FREE_PROVIDERS.includes(p));
      if (freeOption) {
        return this.buildDecision(freeOption, domain, estimatedTokens,
          `Anthropic ${anthropicStatus.pct_used}% → free fallback ${freeOption}`);
      }
    }

    /* Si Anthropic warn (>70%) et tâche simple (summary/translation) → free first */
    if (anthropicWarn && (domain === 'summary' || domain === 'translation' || domain === 'speed')) {
      const freeOption = available.find((p) => FREE_PROVIDERS.includes(p));
      if (freeOption) {
        return this.buildDecision(freeOption, domain, estimatedTokens,
          `Anthropic ${anthropicStatus.pct_used}% + tâche simple → ${freeOption}`);
      }
    }

    /* Sinon : préférence domain (Anthropic priority par défaut) */
    const primary = available[0] ?? 'anthropic';
    return this.buildDecision(primary, domain, estimatedTokens,
      `Domain ${domain} preference (Anthropic priority)`);
  }

  /**
   * Construit decision complète avec fallback chain.
   */
  private buildDecision(primary: ProviderId, domain: TaskDomain, tokens: number, reason: string): RoutingDecision {
    const allPrefs = DOMAIN_PREFERENCES[domain];
    const fallbacks = allPrefs.filter((p) => p !== primary && this.hasKey(p));
    /* Ajoute always free providers en queue de fallback */
    for (const free of FREE_PROVIDERS) {
      if (!fallbacks.includes(free) && primary !== free && this.hasKey(free)) {
        fallbacks.push(free);
      }
    }
    const cost = (COST_PER_M_TOKENS_EUR[primary] * tokens) / 1_000_000;
    return {
      primary,
      fallback_chain: fallbacks,
      reason,
      is_free_tier: FREE_PROVIDERS.includes(primary),
      estimated_cost_eur: cost,
    };
  }

  /**
   * Mode actuel (admin choice persisté).
   */
  getMode(): RoutingMode {
    try {
      const m = localStorage.getItem('apex_v13_routing_mode');
      if (m === 'auto' || m === 'economy' || m === 'premium' || m === 'forced') return m;
    } catch {
      /* ignore */
    }
    return 'auto';
  }

  setMode(mode: RoutingMode): void {
    try {
      localStorage.setItem('apex_v13_routing_mode', mode);
      logger.info('ai-routing-policy', `mode set to ${mode}`);
    } catch {
      /* ignore */
    }
  }

  getAdminOverride(): ProviderId | null {
    try {
      const o = localStorage.getItem('apex_v13_routing_forced_provider');
      if (!o) return null;
      const valid: ProviderId[] = ['anthropic', 'openai', 'groq', 'gemini', 'openrouter', 'deepseek', 'cohere', 'mistral', 'perplexity'];
      return valid.includes(o as ProviderId) ? (o as ProviderId) : null;
    } catch {
      return null;
    }
  }

  setAdminOverride(provider: ProviderId | null): void {
    try {
      if (provider === null) {
        localStorage.removeItem('apex_v13_routing_forced_provider');
      } else {
        localStorage.setItem('apex_v13_routing_forced_provider', provider);
      }
    } catch {
      /* ignore */
    }
  }

  /**
   * Détecte automatiquement le domain depuis le texte user.
   * Heuristique simple — Apex IA peut override.
   */
  detectDomain(text: string): TaskDomain {
    const lc = text.toLowerCase();
    if (/\bcode|programme|fonction|debug|bug|typescript|javascript|python|php|sql\b/.test(lc)) return 'code';
    if (/\bimage|photo|vision|scanner?|reconnaitre|détecter\b/.test(lc)) return 'vision';
    if (/\btraduit?|translate|en (anglais|italien|allemand|espagnol)\b/.test(lc)) return 'translation';
    if (/\brésume|résum[eé]|tldr|résumé\b/.test(lc)) return 'summary';
    if (/\b(rapide|vite|urgent|asap|maintenant)\b/.test(lc)) return 'speed';
    if (/\bcherche|recherche|trouve|google|info sur\b/.test(lc)) return 'search';
    if (/\bécris|invente|imagine|crée|histoire|poème\b/.test(lc)) return 'creative';
    if (text.length > 5000) return 'long_context';
    if (/\branalyse|réfléchis|explique|pourquoi|comment\b/.test(lc) && text.length > 200) return 'reasoning';
    return 'general';
  }

  /**
   * Status complet pour vue admin (debug routing).
   */
  getStatus(): {
    mode: RoutingMode;
    forced: ProviderId | null;
    anthropic_health: 'ok' | 'warn' | 'critical';
    free_providers_available: readonly ProviderId[];
    paid_providers_available: readonly ProviderId[];
  } {
    const free = FREE_PROVIDERS.filter((p) => this.hasKey(p));
    const paid = (['anthropic', 'openai', 'deepseek', 'cohere', 'mistral', 'perplexity'] as ProviderId[]).filter((p) => this.hasKey(p));
    const anthropicStatus = consumptionMonitor.getServiceStatus('anthropic');
    return {
      mode: this.getMode(),
      forced: this.getAdminOverride(),
      anthropic_health: anthropicStatus.severity,
      free_providers_available: free,
      paid_providers_available: paid,
    };
  }

  /**
   * Recommandation Kevin : qu'est-ce qui manque pour optimal ?
   */
  recommendActions(): readonly { priority: 'high' | 'medium' | 'low'; action: string; url?: string }[] {
    const recos: Array<{ priority: 'high' | 'medium' | 'low'; action: string; url?: string }> = [];
    if (!this.hasKey('anthropic')) {
      recos.push({
        priority: 'high',
        action: 'Configurer Anthropic (priorité absolue Kevin)',
        url: 'https://console.anthropic.com/settings/keys',
      });
    }
    if (!this.hasKey('groq')) {
      recos.push({
        priority: 'high',
        action: 'Inscription Groq (gratuit + 500 tok/sec rapide)',
        url: 'https://console.groq.com/keys',
      });
    }
    if (!this.hasKey('gemini')) {
      recos.push({
        priority: 'high',
        action: 'Inscription Gemini (gratuit 1M tokens/jour)',
        url: 'https://aistudio.google.com/app/apikey',
      });
    }
    if (!this.hasKey('openrouter')) {
      recos.push({
        priority: 'medium',
        action: 'Inscription OpenRouter (failover universel free Llama/Mixtral)',
        url: 'https://openrouter.ai/keys',
      });
    }
    return recos;
  }

  private hasKey(provider: ProviderId): boolean {
    try {
      const raw = localStorage.getItem(`ax_${provider}_key`);
      return raw !== null && raw.length > 0;
    } catch {
      return false;
    }
  }
}

export const aiRoutingPolicy = new AIRoutingPolicy();
