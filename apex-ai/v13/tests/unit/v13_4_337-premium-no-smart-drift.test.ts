/**
 * v13.4.337 — Régression : en mode 'premium'/'forced', le smart-router NE DOIT PAS
 * ré-ordonner la chaîne et remettre openai en tête (drift que premium corrige).
 *
 * Kevin 2026-06-19 « toujours openai » : v336 mettait decision.primary=anthropic en
 * premium, mais buildPolicyAwareChain appliquait le PREFIX smart-router AVANT
 * push(decision.primary) → openai (scoré haut après quelques succès) repassait en
 * tête. Le fix saute le prefix smart-router quand le mode est explicite (premium/forced).
 *
 * Ce test reproduit le drift en 'auto' (chain[0]=openai) puis prouve qu'il disparaît
 * en 'premium' (chain[0]=anthropic), avec un smart-router mocké qui préfère openai.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

/* smart-router mocké : préfère TOUJOURS openai avec un score élevé (>50). */
vi.mock('../../services/ai/smart-router.js', () => ({
  smartRouter: {
    getBest: vi.fn(async () => 'openai'),
    scoreProvider: vi.fn(async () => ({ total: 90 })),
    getOverride: vi.fn(() => null),
  },
}));

import { aiRouter } from '../../services/ai/ai-router.js';

type ChainFn = (messages: Array<{ role: string; content: string }>) => Promise<readonly string[]>;
const buildChain = (
  aiRouter as unknown as { buildPolicyAwareChain: ChainFn }
).buildPolicyAwareChain.bind(aiRouter);

const MESSAGES = [{ role: 'user', content: 'Bonjour, peux-tu m\'aider ?' }];

describe('v13.4.337 — premium/forced ignore le prefix smart-router', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('mode auto : le smart-router peut dériver vers openai (reproduction du bug)', async () => {
    localStorage.setItem('apex_v13_routing_mode', 'auto');
    const chain = await buildChain(MESSAGES);
    expect(chain[0]).toBe('openai');
    expect(chain).toContain('anthropic');
  });

  it('mode premium : Anthropic reste EN TÊTE malgré le smart-router pro-openai', async () => {
    localStorage.setItem('apex_v13_routing_mode', 'premium');
    const chain = await buildChain(MESSAGES);
    expect(chain[0]).toBe('anthropic');
  });

  it('admin kdmc_admin par défaut (sans mode stocké) = premium → Anthropic en tête', async () => {
    localStorage.setItem('apex_v13_uid', 'kdmc_admin');
    const chain = await buildChain(MESSAGES);
    expect(chain[0]).toBe('anthropic');
  });

  it('mode forced openai : openai en tête (choix admin explicite respecté)', async () => {
    localStorage.setItem('apex_v13_routing_mode', 'forced');
    localStorage.setItem('apex_v13_routing_forced_provider', 'openai');
    const chain = await buildChain(MESSAGES);
    expect(chain[0]).toBe('openai');
  });
});
