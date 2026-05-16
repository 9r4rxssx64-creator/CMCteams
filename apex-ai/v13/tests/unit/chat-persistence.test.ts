/**
 * Tests chat-persistence v13.4.172 (refactor minutieux extraction depuis chat/index.ts).
 *
 * Vérifie zéro régression :
 * - loadPersistedConversation lit localStorage + strip streaming flag + filtre vides
 * - persistConversation debounce 500ms localStorage + 30s Firebase
 * - tryFirebaseRestoreConversation push mutate in-place si conversation vide
 *
 * Cap CONV_MAX_PERSIST=200, fallback half si quota exceeded.
 */
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';

import {
  type PersistedMessage,
  _resetPersistenceTimeoutsForTests,
  loadPersistedConversation,
  persistConversation,
  tryFirebaseRestoreConversation,
} from '../../features/chat/chat-persistence.js';

const STORAGE_KEY = 'apex_v13_conversation_active';

function makeMsg(id: string, text: string, opts: Partial<PersistedMessage> = {}): PersistedMessage {
  return {
    id,
    role: 'user',
    text,
    ts: Date.now(),
    ...opts,
  };
}

describe('chat-persistence loadPersistedConversation (v13.4.172)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('localStorage vide → tableau vide', () => {
    expect(loadPersistedConversation()).toEqual([]);
  });

  it('JSON invalide → tableau vide (silent recovery)', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json');
    expect(loadPersistedConversation()).toEqual([]);
  });

  it('non-array sérialisé → tableau vide', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }));
    expect(loadPersistedConversation()).toEqual([]);
  });

  it('strip streaming:true → streaming:false au load', () => {
    const stored: PersistedMessage[] = [makeMsg('a1', 'hi', { streaming: true })];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    const loaded = loadPersistedConversation();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.streaming).toBe(false);
  });

  it('filtre messages text vide sauf tool_card', () => {
    const stored: PersistedMessage[] = [
      makeMsg('a1', 'hello'),
      makeMsg('a2', '', { role: 'tool_card' }),
      makeMsg('a3', ''),
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    const loaded = loadPersistedConversation();
    expect(loaded).toHaveLength(2);
    expect(loaded.map((m) => m.id)).toEqual(['a1', 'a2']);
  });
});

describe('chat-persistence persistConversation (v13.4.172)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    _resetPersistenceTimeoutsForTests();
  });

  afterEach(() => {
    vi.useRealTimers();
    _resetPersistenceTimeoutsForTests();
  });

  it('debounce 500ms avant écriture localStorage', () => {
    const conv: PersistedMessage[] = [makeMsg('a1', 'hi')];
    persistConversation(conv);
    /* Avant 500ms : pas encore écrit */
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    vi.advanceTimersByTime(500);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as PersistedMessage[];
    expect(parsed).toHaveLength(1);
  });

  it('reset timer à chaque appel (debounce idempotent)', () => {
    const conv1: PersistedMessage[] = [makeMsg('a1', 'first')];
    persistConversation(conv1);
    vi.advanceTimersByTime(300);
    /* Re-appel avant échéance reset timer */
    const conv2: PersistedMessage[] = [makeMsg('a1', 'first'), makeMsg('a2', 'second')];
    persistConversation(conv2);
    vi.advanceTimersByTime(300);
    /* À 600ms total mais seulement 300ms depuis dernier appel → pas écrit */
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    vi.advanceTimersByTime(200);
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as PersistedMessage[];
    expect(parsed).toHaveLength(2);
  });

  it('filtre messages streaming avant save', () => {
    const conv: PersistedMessage[] = [
      makeMsg('a1', 'done'),
      makeMsg('a2', 'partial', { streaming: true }),
    ];
    persistConversation(conv);
    vi.advanceTimersByTime(500);
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as PersistedMessage[];
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.id).toBe('a1');
  });

  it('cap CONV_MAX_PERSIST=200 (drop oldest)', () => {
    const conv: PersistedMessage[] = Array.from({ length: 250 }, (_, i) =>
      makeMsg(`a${i}`, `msg-${i}`),
    );
    persistConversation(conv);
    vi.advanceTimersByTime(500);
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as PersistedMessage[];
    expect(parsed).toHaveLength(200);
    /* derniers 200 (indices 50..249) */
    expect(parsed[0]?.id).toBe('a50');
    expect(parsed[199]?.id).toBe('a249');
  });

  it('fallback half cap si QuotaExceededError', () => {
    const conv: PersistedMessage[] = Array.from({ length: 250 }, (_, i) =>
      makeMsg(`a${i}`, `msg-${i}`),
    );
    const original = localStorage.setItem.bind(localStorage);
    let throwCount = 0;
    const spy = vi.spyOn(localStorage, 'setItem').mockImplementation((k: string, v: string) => {
      if (k === STORAGE_KEY && throwCount === 0) {
        throwCount++;
        const err = new Error('QuotaExceededError');
        err.name = 'QuotaExceededError';
        throw err;
      }
      original(k, v);
    });
    try {
      persistConversation(conv);
      vi.advanceTimersByTime(500);
      expect(throwCount).toBe(1);
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as PersistedMessage[];
      /* Half cap = 100 */
      expect(parsed).toHaveLength(100);
    } finally {
      spy.mockRestore();
    }
  });
});

describe('chat-persistence tryFirebaseRestoreConversation (v13.4.172)', () => {
  beforeEach(() => {
    localStorage.clear();
    _resetPersistenceTimeoutsForTests();
    vi.restoreAllMocks();
  });

  it('conversation non vide → no-op (return early)', async () => {
    const conv: PersistedMessage[] = [makeMsg('a1', 'existing')];
    await tryFirebaseRestoreConversation(conv);
    expect(conv).toHaveLength(1);
    expect(conv[0]?.id).toBe('a1');
  });

  it('Firebase read non-array → conversation reste vide', async () => {
    vi.doMock('../../services/firebase.js', () => ({
      firebase: {
        read: vi.fn().mockResolvedValue(null),
      },
    }));
    const conv: PersistedMessage[] = [];
    await tryFirebaseRestoreConversation(conv);
    expect(conv).toHaveLength(0);
    vi.doUnmock('../../services/firebase.js');
  });

  it('Firebase read array vide → conversation reste vide', async () => {
    vi.doMock('../../services/firebase.js', () => ({
      firebase: {
        read: vi.fn().mockResolvedValue([]),
      },
    }));
    const conv: PersistedMessage[] = [];
    await tryFirebaseRestoreConversation(conv);
    expect(conv).toHaveLength(0);
    vi.doUnmock('../../services/firebase.js');
  });

  it('Firebase throw → silent recovery (no rethrow)', async () => {
    vi.doMock('../../services/firebase.js', () => ({
      firebase: {
        read: vi.fn().mockRejectedValue(new Error('network')),
      },
    }));
    const conv: PersistedMessage[] = [];
    await expect(tryFirebaseRestoreConversation(conv)).resolves.toBeUndefined();
    expect(conv).toHaveLength(0);
    vi.doUnmock('../../services/firebase.js');
  });
});
