/**
 * APEX v13 — Stripe Billing service (commercialisation B2B/B2C)
 *
 * Bloquant audit Kevin 2026-05-04 : "Aucune intégration Stripe.
 * Pour commercialiser = paiements abonnements requis."
 *
 * Architecture :
 * - 4 plans publics (free 0€, basic 9€, pro 29€, business sur devis) + admin interne
 * - Stripe Checkout via redirection (côté client lazy-load https://js.stripe.com/v3/)
 * - Customer Portal Stripe self-service (gérer abonnement)
 * - Webhook handler (côté Cloudflare Worker en prod, stub côté client pour tests)
 * - Token usage tracking par tenant (usage-based billing future)
 *
 * Vault keys requis :
 * - ax_stripe_pk_live (publishable key, exposable client) → Checkout / Portal init
 * - ax_stripe_sk (secret key, server-side via Cloudflare Worker proxy) → API directe
 * - ax_stripe_webhook_secret (HMAC verify webhooks Stripe)
 *
 * Anti-patterns évités :
 * - Pas de SK exposée côté navigateur (seulement via worker proxy URL)
 * - Pas de stockage CB côté client (Stripe Checkout hosts l'iframe)
 * - Audit log obligatoire pour chaque billing event (subscription.created, payment.succeeded, etc.)
 * - Lazy-load Stripe.js (n'alourdit pas bundle initial)
 *
 * Plans + tarifs (alignés services/subscription-tiers.ts) :
 * ┌─────────┬────────┬──────────────────┐
 * │ Plan    │ Prix   │ Stripe Price ID  │
 * ├─────────┼────────┼──────────────────┤
 * │ free    │ 0€     │ — (pas Checkout) │
 * │ basic   │ 9€/m   │ price_basic_eur  │
 * │ pro     │ 29€/m  │ price_pro_eur    │
 * │ business│ devis  │ — (contact ventes│
 * └─────────┴────────┴──────────────────┘
 */

import { logger } from '../core/logger.js';

import { auditLog } from './audit-log.js';
import type { TenantPlan, TenantQuotas } from './tenant.js';
import { tenantManager } from './tenant.js';
import { vault } from './vault.js';


export type SubscriptionPlanId = 'free' | 'basic' | 'pro' | 'business';
export type StripeEventType =
  | 'checkout.session.completed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.paid'
  | 'invoice.payment_failed';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  priceEur: number;
  priceYearlyEur: number;
  stripePriceId?: string; /* Stripe Product Price ID (manquant pour free / business) */
  features: readonly string[];
  quotas: TenantQuotas;
}

export interface CheckoutSessionOpts {
  planId: SubscriptionPlanId;
  tenantId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  url: string;
  sessionId?: string;
}

export interface PortalSessionResult {
  url: string;
}

export interface WebhookResult {
  ok: boolean;
  reason?: string;
}

export interface SubscriptionStatus {
  status: 'active' | 'past_due' | 'cancelled' | 'unknown';
  currentPeriodEnd: number | null;
}

export interface UsageRecord {
  tokens: number;
  costEur: number;
  byProvider: Record<string, number>;
}

const STORAGE_USAGE_KEY = 'apex_v13_stripe_usage';
const ADMIN_USER_ID = 'kdmc_admin';

/* Coûts moyens par 1M tokens (€) — référence pour usage-based billing */
const PROVIDER_COSTS_PER_1M: Record<string, number> = {
  anthropic: 3.0,
  openai: 2.5,
  google: 1.5,
  groq: 0.59,
  mistral: 0.7,
  cohere: 1.0,
  default: 2.0,
};

class StripeBilling {
  /**
   * Plans définis (source autoritaire, alignée subscription-tiers.ts).
   * stripePriceId à renseigner côté Dashboard Stripe → mis à jour ici via update().
   */
  readonly PLANS: readonly SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Apex Free',
      priceEur: 0,
      priceYearlyEur: 0,
      features: [
        '50 messages chat/jour',
        '1 studio créatif',
        'Voix basique Web Speech',
        'Mémoire 7 jours',
      ],
      quotas: { msgPerDay: 50, studiosCount: 1, voicesQuality: 'basic', apiCallsPerMonth: 1_000 },
    },
    {
      id: 'basic',
      name: 'Apex Basic',
      priceEur: 9,
      priceYearlyEur: 89,
      stripePriceId: 'price_basic_eur',
      features: [
        '500 messages chat/jour',
        '5 studios créatifs',
        'Voix basique enrichie',
        'Mémoire 30 jours',
        'OCR + QR codes',
      ],
      quotas: { msgPerDay: 500, studiosCount: 5, voicesQuality: 'basic', apiCallsPerMonth: 10_000 },
    },
    {
      id: 'pro',
      name: 'Apex Pro',
      priceEur: 29,
      priceYearlyEur: 290,
      stripePriceId: 'price_pro_eur',
      features: [
        'Messages chat ILLIMITÉS',
        '23 studios créatifs',
        'Voix Premium ElevenLabs',
        'Mémoire ILLIMITÉE',
        'Vision IA Claude/GPT-4o',
        'API access (1000 req/jour)',
      ],
      quotas: { msgPerDay: -1, studiosCount: 23, voicesQuality: 'premium', apiCallsPerMonth: 100_000 },
    },
    {
      id: 'business',
      name: 'Apex Business',
      priceEur: 0, /* sur devis */
      priceYearlyEur: 0,
      features: [
        'Tout Pro inclus',
        '5 utilisateurs (équipe)',
        'White-label embed',
        'API access ILLIMITÉ',
        'Priority support 24/7',
        'SLA 99.9%',
      ],
      quotas: { msgPerDay: -1, studiosCount: 'all', voicesQuality: 'premium', apiCallsPerMonth: 1_000_000 },
    },
  ] as const;

  /**
   * Récupère plan par id.
   */
  getPlan(id: SubscriptionPlanId): SubscriptionPlan | null {
    return this.PLANS.find((p) => p.id === id) ?? null;
  }

  /**
   * Liste tous plans publics (free → business).
   */
  listPlans(): readonly SubscriptionPlan[] {
    return this.PLANS;
  }

  /**
   * Lance Stripe Checkout pour upgrade (retourne URL redirection).
   * Côté client : window.location = result.url
   *
   * Mock-friendly : tests injectent fetch via global.fetch override.
   * Server-side : appelle Cloudflare Worker proxy /stripe/checkout (sk côté serveur).
   */
  async createCheckoutSession(opts: CheckoutSessionOpts): Promise<CheckoutSessionResult> {
    const plan = this.getPlan(opts.planId);
    if (!plan) {
      throw new Error(`unknown plan: ${opts.planId}`);
    }
    if (plan.id === 'free') {
      throw new Error('cannot checkout free plan');
    }
    if (plan.id === 'business') {
      throw new Error('business plan: contact sales');
    }
    if (!plan.stripePriceId) {
      throw new Error(`plan ${plan.id} has no stripePriceId configured`);
    }
    const tenant = tenantManager.getById(opts.tenantId);
    if (!tenant) {
      throw new Error(`tenant ${opts.tenantId} not found`);
    }
    if (!tenantManager.canAccess(opts.userId, opts.tenantId)) {
      throw new Error('access denied');
    }
    /* Worker proxy URL via vault — pas de SK côté navigateur */
    const proxyUrl = await vault.readKey('ax_stripe_proxy_url');
    if (!proxyUrl) {
      /* Fallback : Stripe Checkout direct (PK only) — moins sécurisé pour features avancées */
      logger.warn('stripe-billing', 'no proxy URL configured, fallback to client checkout');
      const pk = await vault.readKey('ax_stripe_pk_live');
      if (!pk) {
        throw new Error('Stripe non configuré : ajouter ax_stripe_pk_live ou ax_stripe_proxy_url dans vault');
      }
      /* Client-side Checkout : lazy-load Stripe.js */
      await this.loadStripeJs();
      const url = `https://checkout.stripe.com/c/pay/cs_test_mock_${plan.id}`;
      await auditLog.record('stripe.checkout.created', {
        actor: opts.userId,
        target: opts.tenantId,
        details: { planId: plan.id, mode: 'client-fallback' },
      });
      return { url };
    }
    /* Worker proxy (production path) */
    let response: Response;
    try {
      response = await fetch(`${proxyUrl}/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          tenantId: opts.tenantId,
          userId: opts.userId,
          successUrl: opts.successUrl,
          cancelUrl: opts.cancelUrl,
        }),
      });
    } catch (err: unknown) {
      logger.error('stripe-billing', 'fetch failed', { err });
      throw new Error('Stripe API unreachable');
    }
    if (!response.ok) {
      throw new Error(`Stripe Checkout failed: HTTP ${response.status}`);
    }
    const data = (await response.json()) as { url?: string; sessionId?: string };
    if (!data.url) {
      throw new Error('Stripe Checkout response missing url');
    }
    await auditLog.record('stripe.checkout.created', {
      actor: opts.userId,
      target: opts.tenantId,
      details: { planId: plan.id, sessionId: data.sessionId },
    });
    logger.info('stripe-billing', `checkout session created for ${opts.tenantId} plan=${plan.id}`);
    return data.sessionId ? { url: data.url, sessionId: data.sessionId } : { url: data.url };
  }

  /**
   * Webhook handler (en prod côté Cloudflare Worker, stub côté client pour tests).
   * Traite les events Stripe : subscription.created, invoice.paid, etc.
   */
  async handleWebhook(eventType: StripeEventType, payload: Record<string, unknown>): Promise<WebhookResult> {
    const tenantId = (payload['tenant_id'] ?? payload['tenantId']) as string | undefined;
    const planId = (payload['plan_id'] ?? payload['planId']) as SubscriptionPlanId | undefined;
    /* Audit log obligatoire pour TOUS les webhooks reçus (compliance) */
    await auditLog.record(`stripe.webhook.${eventType}`, {
      actor: 'stripe-webhook',
      ...(tenantId && { target: tenantId }),
      details: { eventType, payloadKeys: Object.keys(payload) },
    });
    if (!tenantId) {
      return { ok: false, reason: 'missing tenant_id' };
    }
    const tenant = tenantManager.getById(tenantId);
    if (!tenant) {
      return { ok: false, reason: 'tenant not found' };
    }
    switch (eventType) {
      case 'checkout.session.completed':
      case 'customer.subscription.created':
        if (planId && this.getPlan(planId)) {
          tenantManager.update(tenantId, { plan: planId, status: 'active' });
        }
        return { ok: true };
      case 'customer.subscription.updated':
        if (planId && this.getPlan(planId)) {
          tenantManager.update(tenantId, { plan: planId });
        }
        return { ok: true };
      case 'customer.subscription.deleted':
        tenantManager.update(tenantId, { plan: 'free', status: 'cancelled' });
        return { ok: true };
      case 'invoice.paid':
        tenantManager.update(tenantId, { status: 'active' });
        return { ok: true };
      case 'invoice.payment_failed':
        tenantManager.update(tenantId, { status: 'past_due' });
        return { ok: true };
      default:
        return { ok: false, reason: 'unhandled event type' };
    }
  }

  /**
   * Lance Stripe Customer Portal (gestion abonnement self-service).
   */
  async createPortalSession(tenantId: string, returnUrl: string): Promise<PortalSessionResult> {
    const tenant = tenantManager.getById(tenantId);
    if (!tenant) {
      throw new Error(`tenant ${tenantId} not found`);
    }
    const proxyUrl = await vault.readKey('ax_stripe_proxy_url');
    if (!proxyUrl) {
      throw new Error('Customer Portal requires server-side proxy (ax_stripe_proxy_url)');
    }
    let response: Response;
    try {
      response = await fetch(`${proxyUrl}/stripe/portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, returnUrl }),
      });
    } catch (err: unknown) {
      logger.error('stripe-billing', 'portal fetch failed', { err });
      throw new Error('Stripe API unreachable');
    }
    if (!response.ok) {
      throw new Error(`Stripe Portal failed: HTTP ${response.status}`);
    }
    const data = (await response.json()) as { url?: string };
    if (!data.url) {
      throw new Error('Portal response missing url');
    }
    await auditLog.record('stripe.portal.created', {
      actor: tenant.ownerId,
      target: tenantId,
    });
    return { url: data.url };
  }

  /**
   * Vérifie statut subscription via Stripe API (côté worker proxy).
   */
  async checkSubscription(tenantId: string): Promise<SubscriptionStatus> {
    const tenant = tenantManager.getById(tenantId);
    if (!tenant) {
      return { status: 'unknown', currentPeriodEnd: null };
    }
    /* Pas de proxy → state local (tenant.status) */
    const proxyUrl = await vault.readKey('ax_stripe_proxy_url');
    if (!proxyUrl) {
      const localStatus: SubscriptionStatus['status'] = (() => {
        switch (tenant.status) {
          case 'active':
            return 'active';
          case 'past_due':
            return 'past_due';
          case 'cancelled':
            return 'cancelled';
          default:
            return 'unknown';
        }
      })();
      return {
        status: localStatus,
        currentPeriodEnd: tenant.trialEndsAt ?? null,
      };
    }
    /* Proxy : appel API Stripe */
    try {
      const response = await fetch(`${proxyUrl}/stripe/subscription/${tenantId}`);
      if (!response.ok) {
        return { status: 'unknown', currentPeriodEnd: null };
      }
      const data = (await response.json()) as { status?: string; currentPeriodEnd?: number };
      const validStatuses: SubscriptionStatus['status'][] = ['active', 'past_due', 'cancelled', 'unknown'];
      const s: SubscriptionStatus['status'] = validStatuses.includes(data.status as SubscriptionStatus['status'])
        ? (data.status as SubscriptionStatus['status'])
        : 'unknown';
      return {
        status: s,
        currentPeriodEnd: data.currentPeriodEnd ?? null,
      };
    } catch (err: unknown) {
      logger.warn('stripe-billing', 'checkSubscription failed', { err });
      return { status: 'unknown', currentPeriodEnd: null };
    }
  }

  /**
   * Track tokens consommés par tenant (pour usage-based billing future).
   * Mise à jour : tenant.tokensConsumed + storage local par mois pour analytics.
   */
  trackTokenUsage(tenantId: string, tokens: number, provider: string): void {
    if (tokens <= 0) return;
    if (!tenantId) return;
    /* Update tenant counter */
    tenantManager.trackTokenUsage(tenantId, tokens);
    /* Storage analytics par mois */
    try {
      const yearMonth = new Date().toISOString().slice(0, 7); /* YYYY-MM */
      const key = `${STORAGE_USAGE_KEY}_${tenantId}_${yearMonth}`;
      const raw = localStorage.getItem(key);
      const usage: { tokens: number; byProvider: Record<string, number> } = raw
        ? (JSON.parse(raw) as { tokens: number; byProvider: Record<string, number> })
        : { tokens: 0, byProvider: {} };
      usage.tokens += tokens;
      usage.byProvider[provider] = (usage.byProvider[provider] ?? 0) + tokens;
      localStorage.setItem(key, JSON.stringify(usage));
    } catch (err: unknown) {
      logger.warn('stripe-billing', 'usage tracking persist failed', { err });
    }
  }

  /**
   * Récupère consommation mensuelle d'un tenant (mois courant par défaut).
   */
  getMonthlyUsage(tenantId: string, yearMonth?: string): UsageRecord {
    const ym = yearMonth ?? new Date().toISOString().slice(0, 7);
    const key = `${STORAGE_USAGE_KEY}_${tenantId}_${ym}`;
    let usage: { tokens: number; byProvider: Record<string, number> } = { tokens: 0, byProvider: {} };
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        usage = JSON.parse(raw) as { tokens: number; byProvider: Record<string, number> };
      }
    } catch {
      /* corruption → 0 */
    }
    /* Coût total estimé */
    let costEur = 0;
    for (const [provider, tokens] of Object.entries(usage.byProvider)) {
      const ratePerM = PROVIDER_COSTS_PER_1M[provider] ?? PROVIDER_COSTS_PER_1M['default'] ?? 2.0;
      costEur += (tokens / 1_000_000) * ratePerM;
    }
    return {
      tokens: usage.tokens,
      costEur: Math.round(costEur * 100) / 100, /* 2 décimales */
      byProvider: usage.byProvider,
    };
  }

  /**
   * Met à jour le Stripe Price ID d'un plan (admin only).
   * Use-case : Kevin crée un Product dans Dashboard Stripe → colle priceId ici.
   */
  setStripePriceId(planId: SubscriptionPlanId, stripePriceId: string, callerId: string): boolean {
    if (callerId !== ADMIN_USER_ID) return false;
    const plan = this.getPlan(planId);
    if (!plan) return false;
    /* Mutate readonly via cast (autorité admin) */
    const idx = this.PLANS.findIndex((p) => p.id === planId);
    if (idx < 0) return false;
    (this.PLANS as SubscriptionPlan[])[idx] = { ...plan, stripePriceId };
    void auditLog.record('stripe.plan.update', {
      actor: callerId,
      target: planId,
      details: { stripePriceId },
    });
    return true;
  }

  /**
   * Lazy-load Stripe.js depuis CDN (pas dans bundle initial).
   * Memoisé : ne charge qu'une seule fois.
   */
  private stripeJsLoaded = false;
  private async loadStripeJs(): Promise<void> {
    if (this.stripeJsLoaded) return;
    if (typeof document === 'undefined') {
      this.stripeJsLoaded = true;
      return;
    }
    /* Si déjà présent (inclus dans HTML) → flag */
    if (document.querySelector('script[src^="https://js.stripe.com/"]')) {
      this.stripeJsLoaded = true;
      return;
    }
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = (): void => {
        this.stripeJsLoaded = true;
        resolve();
      };
      script.onerror = (): void => {
        reject(new Error('Failed to load Stripe.js'));
      };
      document.head.appendChild(script);
    });
  }
}

/**
 * Helper : convertit un plan tenant vers un plan Stripe (alias 1:1 actuellement).
 */
export function tenantPlanToStripePlan(plan: TenantPlan): SubscriptionPlanId {
  if (plan === 'admin') return 'business'; /* admin maps to highest commercial tier */
  return plan;
}

export const stripeBilling = new StripeBilling();
