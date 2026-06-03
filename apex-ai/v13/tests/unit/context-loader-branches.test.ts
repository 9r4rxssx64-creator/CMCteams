/**
 * context-loader — couverture branches restantes (campagne 100% réel, 2026-06-02).
 * Cible les catch de loadUserFacts / loadRecentMemory (persistentMemory throw → []).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const list = vi.fn();
const topForPrompt = vi.fn();

vi.mock('../../services/storage/persistent-memory-store.js', () => ({
  persistentMemory: {
    list: (...a: unknown[]) => list(...a),
    topForPrompt: (...a: unknown[]) => topForPrompt(...a),
  },
}));

import { contextLoader } from '../../services/ai/context-loader.js';

beforeEach(() => {
  vi.clearAllMocks();
  list.mockResolvedValue([]);
  topForPrompt.mockResolvedValue([]);
});
afterEach(() => { vi.restoreAllMocks(); });

describe('context-loader — résilience persistentMemory', () => {
  it('load OK : facts triés par importance + recent formatés', async () => {
    list.mockImplementation(async ({ category }: { category: string }) =>
      category === 'profile'
        ? [{ text: 'a', importance: 10 }, { text: 'b', importance: 99 }]
        : [{ text: 'pref', importance: 50 }],
    );
    topForPrompt.mockResolvedValue([{ category: 'facts', text: 'recent1' }]);
    const ctx = await contextLoader.load('global', true);
    expect(ctx.user_facts[0]).toBe('b'); // importance 99 en tête
    expect(ctx.recent_memory).toContain('[facts] recent1');
  });

  it('persistentMemory.list throw → loadUserFacts catch → []', async () => {
    list.mockRejectedValue(new Error('mem down'));
    const ctx = await contextLoader.load('global', true);
    expect(ctx.user_facts).toEqual([]);
  });

  it('persistentMemory.topForPrompt throw → loadRecentMemory catch → []', async () => {
    topForPrompt.mockRejectedValue(new Error('top down'));
    const ctx = await contextLoader.load('global', true);
    expect(ctx.recent_memory).toEqual([]);
  });
});
