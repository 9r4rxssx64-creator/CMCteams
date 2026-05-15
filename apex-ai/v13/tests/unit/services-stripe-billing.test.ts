/**
 * Tests services/stripe-billing.ts — Stripe Billing (commercialisation B2B/B2C).
 *
 * Couvre :
 * - PLANS structure (4 plans : free, basic, pro, business)
 * - createCheckoutSession() validations + worker proxy + audit
 * - handleWebhook() events Stripe (subscription, invoice, payment)
 * - createPortalSession() Customer Portal Stripe
 * - checkSubscription() local fallback + proxy
 * - trackTokenUsage + getMonthlyUsage (storage analytics)
 * - setStripePriceId() admin only
 * - tenantPlanToStripePlan() mapping
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { auditLog } from '../../services/audit-log.js';
import { stripeBilling, tenantPlanToStripePlan } from '../../services/stripe-billing.js';
import { tenantManager } from '../../services/tenant.js';
import { vault } from '../../services/vault.js';

const ADMIN = 'kdmc_admin';

async function setupVaultMock(keys: Record<string, string>): Promise<void> {
  vi.spyOn(vault, 'readKey').mockImplementation(async (k: string) => keys[k] ?? '');
}

describe('stripeBilling (Kevin v13.0.74 — commercialisation)', () => {
  beforeEach(() => {
    localStorage.clear();
    auditLog.reload();
    tenantManager.reload();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('PLANS structure', () => {
    it('contient 4 plans : free, basic, pro, business', () => {
      const plans = stripeBilling.listPlans();
      expect(plans.length).toBe(4);
      const ids = plans.map((p) => p.id);
      expect(ids).toEqual(['free', 'basic', 'pro', 'business']);
    });

    it('basic = 9€/mois, 89€/an, stripePriceId défini', () => {
      const basic = stripeBilling.getPlan('basic');
      expect(basic?.priceEur).toBe(9);
      expect(basic?.priceYearlyEur).toBe(89);
      expect(basic?.stripePriceId).toBeTruthy();
    });

    it('pro = 29€/mois, illimité messages', () => {
      const pro = stripeBilling.getPlan('pro');
      expect(pro?.priceEur).toBe(29);
      expect(pro?.quotas.msgPerDay).toBe(-1);
      expect(pro?.quotas.voicesQuality).toBe('premium');
    });

    it('business = sur devis (priceEur 0) + studios all', () => {
      const biz = stripeBilling.getPlan('business');
      expect(biz?.priceEur).toBe(0);
      expect(biz?.quotas.studiosCount).toBe('all');
      expect(biz?.stripePriceId).toBeUndefined();
    });

    it('free = pas de stripePriceId (pas Checkout)', () => {
      const free = stripeBilling.getPlan('free');
      expect(free?.stripePriceId).toBeUndefined();
    });

    it('getPlan retourne null si id inconnu', () => {
      expect(stripeBilling.getPlan('enterprise' as 'pro')).toBeNull();
    });
  });

  describe('createCheckoutSession()', () => {
    it('throw si plan inconnu', async () => {
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      await expect(
        stripeBilling.createCheckoutSession({
          planId: 'enterprise' as 'pro',
          tenantId: t.id,
          userId: 'u1',
          successUrl: '/ok',
          cancelUrl: '/cancel',
        }),
      ).rejects.toThrow(/unknown plan/);
    });

    it('throw si plan = free', async () => {
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      await expect(
        stripeBilling.createCheckoutSession({
          planId: 'free',
          tenantId: t.id,
          userId: 'u1',
          successUrl: '/ok',
          cancelUrl: '/cancel',
        }),
      ).rejects.toThrow(/free plan/);
    });

    it('throw si plan = business (contact sales)', async () => {
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      await expect(
        stripeBilling.createCheckoutSession({
          planId: 'business',
          tenantId: t.id,
          userId: 'u1',
          successUrl: '/ok',
          cancelUrl: '/cancel',
        }),
      ).rejects.toThrow(/contact sales/);
    });

    it('throw si tenant introuvable', async () => {
      await setupVaultMock({ ax_stripe_proxy_url: 'https://w.example' });
      await expect(
        stripeBilling.createCheckoutSession({
          planId: 'pro',
          tenantId: 'tenant_nope',
          userId: 'u1',
          successUrl: '/ok',
          cancelUrl: '/cancel',
        }),
      ).rejects.toThrow(/not found/);
    });

    it('throw si user pas accès au tenant', async () => {
      await setupVaultMock({ ax_stripe_proxy_url: 'https://w.example' });
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      await expect(
        stripeBilling.createCheckoutSession({
          planId: 'pro',
          tenantId: t.id,
          userId: 'u_attacker',
          successUrl: '/ok',
          cancelUrl: '/cancel',
        }),
      ).rejects.toThrow(/access denied/);
    });

    it('worker proxy → URL Stripe + audit log', async () => {
      await setupVaultMock({ ax_stripe_proxy_url: 'https://worker.kdmc.workers.dev' });
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ url: 'https://checkout.stripe.com/c/pay/cs_123', sessionId: 'cs_123' }), {
          status: 200,
        }),
      );
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X', plan: 'free' });
      const r = await stripeBilling.createCheckoutSession({
        planId: 'pro',
        tenantId: t.id,
        userId: 'u1',
        successUrl: 'https://app/ok',
        cancelUrl: 'https://app/cancel',
      });
      expect(r.url).toContain('checkout.stripe.com');
      expect(r.sessionId).toBe('cs_123');
      const audits = auditLog.getEntries({ action: 'stripe.checkout.created' });
      expect(audits.length).toBe(1);
    });

    it('worker proxy HTTP error → throw', async () => {
      await setupVaultMock({ ax_stripe_proxy_url: 'https://worker.example' });
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 500 }));
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      await expect(
        stripeBilling.createCheckoutSession({
          planId: 'pro',
          tenantId: t.id,
          userId: 'u1',
          successUrl: '/ok',
          cancelUrl: '/cancel',
        }),
      ).rejects.toThrow(/HTTP 500/);
    });

    it('worker proxy network error → unreachable', async () => {
      await setupVaultMock({ ax_stripe_proxy_url: 'https://worker.example' });
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      await expect(
        stripeBilling.createCheckoutSession({
          planId: 'pro',
          tenantId: t.id,
          userId: 'u1',
          successUrl: '/ok',
          cancelUrl: '/cancel',
        }),
      ).rejects.toThrow(/unreachable/);
    });

    it('proxy URL absent + pas de PK → throw config manquante', async () => {
      await setupVaultMock({}); /* rien dans vault */
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      await expect(
        stripeBilling.createCheckoutSession({
          planId: 'pro',
          tenantId: t.id,
          userId: 'u1',
          successUrl: '/ok',
          cancelUrl: '/cancel',
        }),
      ).rejects.toThrow(/non configuré/);
    });
  });

  describe('handleWebhook()', () => {
    it('audit log obligatoire pour TOUS les webhooks', async () => {
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      await stripeBilling.handleWebhook('invoice.paid', { tenant_id: t.id });
      const audits = auditLog.getEntries({ action: 'stripe.webhook.invoice.paid' });
      expect(audits.length).toBe(1);
    });

    it('checkout.session.completed → tenant.plan + status active', async () => {
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X', plan: 'free' });
      const r = await stripeBilling.handleWebhook('checkout.session.completed', {
        tenant_id: t.id,
        plan_id: 'pro',
      });
      expect(r.ok).toBe(true);
      const after = tenantManager.getById(t.id);
      expect(after?.plan).toBe('pro');
      expect(after?.status).toBe('active');
    });

    it('invoice.paid → status active', async () => {
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      tenantManager.update(t.id, { status: 'past_due' });
      const r = await stripeBilling.handleWebhook('invoice.paid', { tenant_id: t.id });
      expect(r.ok).toBe(true);
      expect(tenantManager.getById(t.id)?.status).toBe('active');
    });

    it('invoice.payment_failed → status past_due', async () => {
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      tenantManager.update(t.id, { status: 'active' });
      const r = await stripeBilling.handleWebhook('invoice.payment_failed', { tenant_id: t.id });
      expect(r.ok).toBe(true);
      expect(tenantManager.getById(t.id)?.status).toBe('past_due');
    });

    it('subscription.deleted → plan free + cancelled', async () => {
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X', plan: 'pro' });
      const r = await stripeBilling.handleWebhook('customer.subscription.deleted', { tenant_id: t.id });
      expect(r.ok).toBe(true);
      const after = tenantManager.getById(t.id);
      expect(after?.plan).toBe('free');
      expect(after?.status).toBe('cancelled');
    });

    it('subscription.updated → plan changé', async () => {
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X', plan: 'basic' });
      await stripeBilling.handleWebhook('customer.subscription.updated', {
        tenant_id: t.id,
        plan_id: 'pro',
      });
      expect(tenantManager.getById(t.id)?.plan).toBe('pro');
    });

    it('webhook sans tenant_id → ok:false reason', async () => {
      const r = await stripeBilling.handleWebhook('invoice.paid', {});
      expect(r.ok).toBe(false);
      expect(r.reason).toContain('tenant_id');
    });

    it('webhook tenant inexistant → ok:false', async () => {
      const r = await stripeBilling.handleWebhook('invoice.paid', { tenant_id: 'tenant_nope' });
      expect(r.ok).toBe(false);
      expect(r.reason).toContain('not found');
    });
  });

  describe('createPortalSession()', () => {
    it('throw si tenant introuvable', async () => {
      await setupVaultMock({ ax_stripe_proxy_url: 'https://w.example' });
      await expect(stripeBilling.createPortalSession('tenant_nope', '/ret')).rejects.toThrow(/not found/);
    });

    it('throw si pas de proxy URL', async () => {
      await setupVaultMock({}); /* vide */
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      await expect(stripeBilling.createPortalSession(t.id, '/ret')).rejects.toThrow(/proxy/);
    });

    it('proxy → URL Portal Stripe + audit', async () => {
      await setupVaultMock({ ax_stripe_proxy_url: 'https://w.example' });
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ url: 'https://billing.stripe.com/p/session/test_xxx' }), { status: 200 }),
      );
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      const r = await stripeBilling.createPortalSession(t.id, 'https://app/return');
      expect(r.url).toContain('billing.stripe.com');
      const audits = auditLog.getEntries({ action: 'stripe.portal.created' });
      expect(audits.length).toBe(1);
    });

    it('proxy network error → throw', async () => {
      await setupVaultMock({ ax_stripe_proxy_url: 'https://w.example' });
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('down'));
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      await expect(stripeBilling.createPortalSession(t.id, '/r')).rejects.toThrow(/unreachable/);
    });
  });

  describe('checkSubscription()', () => {
    it('tenant inexistant → unknown', async () => {
      const r = await stripeBilling.checkSubscription('tenant_nope');
      expect(r.status).toBe('unknown');
      expect(r.currentPeriodEnd).toBeNull();
    });

    it('pas de proxy → fallback statut local du tenant', async () => {
      await setupVaultMock({});
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      tenantManager.update(t.id, { status: 'active' });
      const r = await stripeBilling.checkSubscription(t.id);
      expect(r.status).toBe('active');
    });

    it('proxy OK → status remonté', async () => {
      await setupVaultMock({ ax_stripe_proxy_url: 'https://w.example' });
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ status: 'past_due', currentPeriodEnd: 1234567890 }), { status: 200 }),
      );
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      const r = await stripeBilling.checkSubscription(t.id);
      expect(r.status).toBe('past_due');
      expect(r.currentPeriodEnd).toBe(1234567890);
    });

    it('proxy invalid status → unknown (sanitization)', async () => {
      await setupVaultMock({ ax_stripe_proxy_url: 'https://w.example' });
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ status: 'weird_status' }), { status: 200 }),
      );
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      const r = await stripeBilling.checkSubscription(t.id);
      expect(r.status).toBe('unknown');
    });

    it('proxy network error → unknown (no throw)', async () => {
      await setupVaultMock({ ax_stripe_proxy_url: 'https://w.example' });
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('down'));
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      const r = await stripeBilling.checkSubscription(t.id);
      expect(r.status).toBe('unknown');
    });
  });

  describe('trackTokenUsage() + getMonthlyUsage()', () => {
    it('persiste tokens par provider', async () => {
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      stripeBilling.trackTokenUsage(t.id, 5000, 'anthropic');
      stripeBilling.trackTokenUsage(t.id, 2000, 'openai');
      const usage = stripeBilling.getMonthlyUsage(t.id);
      expect(usage.tokens).toBe(7000);
      expect(usage.byProvider['anthropic']).toBe(5000);
      expect(usage.byProvider['openai']).toBe(2000);
    });

    it('cumule plusieurs appels même provider', async () => {
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      stripeBilling.trackTokenUsage(t.id, 1000, 'groq');
      stripeBilling.trackTokenUsage(t.id, 500, 'groq');
      const usage = stripeBilling.getMonthlyUsage(t.id);
      expect(usage.byProvider['groq']).toBe(1500);
    });

    it('costEur calculé depuis tarifs providers', async () => {
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      stripeBilling.trackTokenUsage(t.id, 1_000_000, 'anthropic'); /* 3.0€ */
      const usage = stripeBilling.getMonthlyUsage(t.id);
      expect(usage.costEur).toBeCloseTo(3.0, 2);
    });

    it('met à jour tenant.tokensConsumed aussi', async () => {
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      stripeBilling.trackTokenUsage(t.id, 4000, 'anthropic');
      expect(tenantManager.getById(t.id)?.tokensConsumed).toBe(4000);
    });

    it('ignore tokens <= 0', () => {
      const r1 = stripeBilling.getMonthlyUsage('any');
      stripeBilling.trackTokenUsage('any', -10, 'foo');
      stripeBilling.trackTokenUsage('any', 0, 'foo');
      const r2 = stripeBilling.getMonthlyUsage('any');
      expect(r2.tokens).toBe(r1.tokens);
    });

    it('ignore tenantId vide', () => {
      stripeBilling.trackTokenUsage('', 1000, 'foo');
      /* pas crash */
    });

    it('getMonthlyUsage retourne 0 si pas de data', () => {
      const u = stripeBilling.getMonthlyUsage('tenant_no_usage');
      expect(u.tokens).toBe(0);
      expect(u.costEur).toBe(0);
      expect(u.byProvider).toEqual({});
    });

    it('getMonthlyUsage avec yearMonth spécifique', () => {
      const u = stripeBilling.getMonthlyUsage('any', '2024-01');
      expect(u.tokens).toBe(0);
    });

    it('provider inconnu → tarif default 2€/1M', async () => {
      const t = await tenantManager.create({ ownerId: 'u1', brandName: 'X' });
      stripeBilling.trackTokenUsage(t.id, 1_000_000, 'mystery_provider');
      const usage = stripeBilling.getMonthlyUsage(t.id);
      expect(usage.costEur).toBeCloseTo(2.0, 2);
    });
  });

  describe('setStripePriceId() — admin only', () => {
    it('admin Kevin update priceId', () => {
      const ok = stripeBilling.setStripePriceId('basic', 'price_new_xyz', ADMIN);
      expect(ok).toBe(true);
      expect(stripeBilling.getPlan('basic')?.stripePriceId).toBe('price_new_xyz');
      /* restore pour les autres tests */
      stripeBilling.setStripePriceId('basic', 'price_basic_eur', ADMIN);
    });

    it('non-admin REFUSÉ', () => {
      const ok = stripeBilling.setStripePriceId('basic', 'price_hacked', 'u_attacker');
      expect(ok).toBe(false);
    });

    it('plan inconnu → false', () => {
      expect(stripeBilling.setStripePriceId('enterprise' as 'pro', 'price_x', ADMIN)).toBe(false);
    });
  });

  describe('tenantPlanToStripePlan()', () => {
    it('admin → business (highest commercial tier)', () => {
      expect(tenantPlanToStripePlan('admin')).toBe('business');
    });

    it('free/basic/pro/business mapping 1:1', () => {
      expect(tenantPlanToStripePlan('free')).toBe('free');
      expect(tenantPlanToStripePlan('basic')).toBe('basic');
      expect(tenantPlanToStripePlan('pro')).toBe('pro');
      expect(tenantPlanToStripePlan('business')).toBe('business');
    });
  });
});
