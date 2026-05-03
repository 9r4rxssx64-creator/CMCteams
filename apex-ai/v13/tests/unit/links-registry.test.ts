/**
 * Tests links-registry.ts (path 100/100 — règle Kevin axLinksAutoCreate).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { linksRegistry } from '../../services/links-registry.js';

describe('Links Registry (auto-create + verification)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('autoCreate avec services connus', () => {
    it('autoCreate("anthropic") → ServiceLink complet pré-configuré', async () => {
      const link = await linksRegistry.autoCreate('anthropic');
      expect(link.service).toBe('anthropic');
      expect(link.dashboard).toBe('https://console.anthropic.com');
      expect(link.billing).toContain('billing');
      expect(link.docs).toContain('docs.anthropic');
      expect(link.api_keys_page).toContain('keys');
      expect(link.alive).toBe(true);
    });

    it('autoCreate normalize case ("OPENAI" → openai)', async () => {
      const link = await linksRegistry.autoCreate('OPENAI');
      expect(link.service).toBe('openai');
      expect(link.dashboard).toContain('platform.openai.com');
    });

    it('autoCreate persist dans localStorage ax_links_registry', async () => {
      await linksRegistry.autoCreate('stripe');
      const raw = localStorage.getItem('ax_links_registry');
      expect(raw).toBeTruthy();
      const list = JSON.parse(raw!) as Array<{ service: string }>;
      expect(list.find((l) => l.service === 'stripe')).toBeDefined();
    });

    it('autoCreate update si déjà existant (no duplicate)', async () => {
      await linksRegistry.autoCreate('github');
      await linksRegistry.autoCreate('github');
      const list = linksRegistry.list();
      const githubs = list.filter((l) => l.service === 'github');
      expect(githubs.length).toBe(1);
    });
  });

  describe('autoCreate service inconnu', () => {
    it('service inconnu → tente patterns standards via HEAD fetch', async () => {
      /* Mock fetch HEAD pour failer (no live URL) */
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('not reachable'));
      const link = await linksRegistry.autoCreate('xyz_unknown_service');
      expect(link.service).toBe('xyz_unknown_service');
      expect(link.alive).toBe(false);
      /* Escalation vers ax_unknown_services */
      const unknowns = JSON.parse(localStorage.getItem('ax_unknown_services') ?? '[]') as string[];
      expect(unknowns).toContain('xyz_unknown_service');
    });

    it('service inconnu avec HEAD ok → dashboard candidate trouvé', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(null, { status: 200 }),
      );
      const link = await linksRegistry.autoCreate('mysvc');
      expect(link.service).toBe('mysvc');
      expect(link.alive).toBe(true);
      expect(link.dashboard).toBeTruthy();
    });
  });

  describe('list + get', () => {
    it('list() vide retourne array vide', () => {
      expect(linksRegistry.list()).toEqual([]);
    });

    it('get(service) retourne lien ou null', async () => {
      await linksRegistry.autoCreate('groq');
      const link = linksRegistry.get('groq');
      expect(link).not.toBeNull();
      expect(link?.dashboard).toContain('console.groq.com');
      expect(linksRegistry.get('inexistant')).toBeNull();
    });

    it('list() corrupt localStorage → array vide gracefull', () => {
      localStorage.setItem('ax_links_registry', 'INVALID_JSON{{');
      expect(linksRegistry.list()).toEqual([]);
    });
  });

  describe('retestAll (sentinelle quotidienne)', () => {
    it('retestAll → met à jour alive sur tous links', async () => {
      await linksRegistry.autoCreate('cloudflare');
      await linksRegistry.autoCreate('vercel');
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }));
      const result = await linksRegistry.retestAll();
      expect(result.tested).toBeGreaterThanOrEqual(2);
      expect(result.alive + result.dead).toBe(result.tested);
    });

    it('retestAll fetch fail → mark alive=false', async () => {
      await linksRegistry.autoCreate('telegram');
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
      const result = await linksRegistry.retestAll();
      expect(result.dead).toBeGreaterThanOrEqual(1);
      const link = linksRegistry.get('telegram');
      expect(link?.alive).toBe(false);
    });
  });

  describe('getStats dashboard', () => {
    it('stats vide retourne 0/0/0/0', () => {
      const stats = linksRegistry.getStats();
      expect(stats.total).toBe(0);
      expect(stats.alive).toBe(0);
      expect(stats.pct_alive).toBe(0);
    });

    it('stats avec liens calcule pct_alive', async () => {
      await linksRegistry.autoCreate('brevo');
      await linksRegistry.autoCreate('resend');
      const stats = linksRegistry.getStats();
      expect(stats.total).toBe(2);
      expect(stats.pct_alive).toBe(100);
    });
  });
});
