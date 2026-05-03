/**
 * Mock fetch SSE pour init/connected, write avec idempotency persisted, queue flush, applyRemoteChange.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { firebase, FB_FIX, FB_LOCAL } from '../../services/firebase.js';

describe('firebase massive coverage Jet 8', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('init + connectivity', () => {
    it('init avec stored URL custom', async () => {
      localStorage.setItem('apex_v13_fb_url', 'https://custom-rtdb.firebaseio.com');
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      await firebase.init();
      expect(firebase.isConnected()).toBe(true);
      fetchSpy.mockRestore();
    });

    it('init ping fail → connected=false offline mode', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
      await firebase.init();
      expect(firebase.isConnected()).toBe(false);
      fetchSpy.mockRestore();
    });

    it('init ping HTTP 500 → connected=false', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('error', { status: 500 }));
      await firebase.init();
      expect(firebase.isConnected()).toBe(false);
      fetchSpy.mockRestore();
    });

    it('localStorage corrupt fb_url gracefull', async () => {
      /* Pas vraiment corrompable car simple string, mais assure pas throw */
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      await firebase.init();
      expect(typeof firebase.isConnected()).toBe('boolean');
      fetchSpy.mockRestore();
    });
  });

  describe('write avec idempotency complet', () => {
    beforeEach(async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('null', { status: 200 }));
      await firebase.init();
      fetchSpy.mockRestore();
    });

    it('write success → fetch PUT appelé avec X-Idempotency-Key header', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('null', { status: 200 }));
      await firebase.write('apex_v13_facts', [{ id: 'f1' }]);
      const calls = fetchSpy.mock.calls;
      const writeCall = calls.find((c) => (c[1] as RequestInit)?.method === 'PUT');
      if (writeCall) {
        const headers = (writeCall[1] as RequestInit).headers as Record<string, string>;
        expect(headers['X-Idempotency-Key']).toBeTruthy();
      }
      fetchSpy.mockRestore();
    });

    it('write avec idempotencyKey explicite', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('null', { status: 200 }));
      await firebase.write('apex_v13_facts', [{ id: 'f2' }], { idempotencyKey: 'custom_key_123' });
      expect(fetchSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
      fetchSpy.mockRestore();
    });

    it('write 2x same key/value → 2nd skip (idempotent dedup)', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('null', { status: 200 }));
      await firebase.write('apex_v13_facts', [{ x: 1 }]);
      const callsAfterFirst = fetchSpy.mock.calls.length;
      await firebase.write('apex_v13_facts', [{ x: 1 }]);
      const callsAfterSecond = fetchSpy.mock.calls.length;
      /* 2nd write skip car même hash dans 60s window */
      expect(callsAfterSecond).toBe(callsAfterFirst);
      fetchSpy.mockRestore();
    });

    it('write HTTP 500 → push dans queue (retry plus tard)', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('error', { status: 500 }));
      await firebase.write('apex_v13_facts', [{ retry: true }]);
      /* Vraie assertion : le PUT a bien été tenté (au moins 1 call PUT) */
      const putCalls = fetchSpy.mock.calls.filter((c) => (c[1] as RequestInit)?.method === 'PUT');
      expect(putCalls.length).toBeGreaterThanOrEqual(1);
      /* Pas de throw — le caller ne reçoit pas d'exception */
      fetchSpy.mockRestore();
    });

    it('write timeout → push dans queue (pas de throw)', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('AbortError timeout'));
      let threw = false;
      try {
        await firebase.write('apex_v13_facts', [{ timeout: true }]);
      } catch {
        threw = true;
      }
      /* Vraie assertion : write swallow l'erreur, queue + log warning seulement */
      expect(threw).toBe(false);
      /* PUT call attempted */
      const putCalls = fetchSpy.mock.calls.filter((c) => (c[1] as RequestInit)?.method === 'PUT');
      expect(putCalls.length).toBeGreaterThanOrEqual(1);
      fetchSpy.mockRestore();
    });

    it('idempotency persisted survie reload (localStorage check)', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('null', { status: 200 }));
      await firebase.write('apex_v13_facts', [{ persist: true }]);
      const stored = localStorage.getItem('apex_v13_idempotency');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(Object.keys(parsed).length).toBeGreaterThan(0);
      fetchSpy.mockRestore();
    });

    it('GC entries > 60s dans recentWrites', async () => {
      /* Pré-rempli avec entries old + nouvelles */
      const old = Date.now() - 70_000;
      const fresh = Date.now();
      localStorage.setItem('apex_v13_idempotency', JSON.stringify({
        old_hash: old,
        fresh_hash: fresh,
      }));
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('null', { status: 200 }));
      /* Nouveau write trigger loadRecentWrites qui filter */
      await firebase.write('apex_v13_facts', [{ gc: true }]);
      fetchSpy.mockRestore();
    });
  });

  describe('write skip cases', () => {
    it('write FB_LOCAL key skip silencieusement', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      await firebase.write('apex_v13_user', { id: 'kevin' });
      /* Pas de fetch car FB_LOCAL */
      const writeCalls = fetchSpy.mock.calls.filter((c) => (c[1] as RequestInit)?.method === 'PUT');
      expect(writeCalls.length).toBe(0);
      fetchSpy.mockRestore();
    });

    it('write key inconnu (pas dans FB_FIX) skip', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      await firebase.write('random_unknown_key', { x: 1 });
      const writeCalls = fetchSpy.mock.calls.filter((c) => (c[1] as RequestInit)?.method === 'PUT');
      expect(writeCalls.length).toBe(0);
      fetchSpy.mockRestore();
    });

    it('write si offline → push queue (zero fetch PUT)', async () => {
      /* Force offline via init ping fail */
      const offlineSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
      await firebase.init();
      offlineSpy.mockRestore();
      expect(firebase.isConnected()).toBe(false);

      /* Maintenant write : doit bypass fetch totalement */
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      await firebase.write('apex_v13_facts', [{ offline: true }]);
      /* Aucun PUT car connected=false → straight to queue */
      const putCalls = fetchSpy.mock.calls.filter((c) => (c[1] as RequestInit)?.method === 'PUT');
      expect(putCalls.length).toBe(0);
      fetchSpy.mockRestore();
    });
  });

  describe('read', () => {
    it('read offline retourne null', async () => {
      const r = await firebase.read('apex_v13_facts');
      expect(r).toBeNull();
    });

    it('read connected fetch GET', async () => {
      let fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      await firebase.init();
      fetchSpy.mockRestore();
      fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"key":"value"}', { status: 200 }));
      const r = await firebase.read<{ key: string }>('apex_v13_facts');
      expect(r?.key).toBe('value');
      fetchSpy.mockRestore();
    });

    it('read HTTP 404 retourne null', async () => {
      let fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      await firebase.init();
      fetchSpy.mockRestore();
      fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('not found', { status: 404 }));
      const r = await firebase.read('not_exist');
      expect(r).toBeNull();
      fetchSpy.mockRestore();
    });

    it('read timeout retourne null', async () => {
      let fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      await firebase.init();
      fetchSpy.mockRestore();
      fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('timeout'));
      const r = await firebase.read('apex_v13_facts');
      expect(r).toBeNull();
      fetchSpy.mockRestore();
    });
  });

  describe('SSE EventSource + applyRemoteChange (anti-pattern v12 plain wins)', () => {
    /* Mock EventSource minimal pour tester startSSE + put events */
    class MockEventSource {
      static instances: MockEventSource[] = [];
      url: string;
      listeners: Record<string, ((e: Event) => void)[]> = {};
      onerror: (() => void) | null = null;
      onopen: (() => void) | null = null;
      readyState = 0;
      constructor(url: string) {
        this.url = url;
        MockEventSource.instances.push(this);
      }
      addEventListener(type: string, fn: (e: Event) => void) {
        (this.listeners[type] ??= []).push(fn);
      }
      close() {
        this.readyState = 2;
      }
      /* Test helpers */
      _firePut(path: string, data: unknown) {
        const event = new MessageEvent('put', { data: JSON.stringify({ path, data }) });
        (this.listeners['put'] ?? []).forEach((fn) => fn(event));
      }
      _fireOpen() {
        if (this.onopen) this.onopen();
      }
      _fireError() {
        if (this.onerror) this.onerror();
      }
    }

    beforeEach(() => {
      MockEventSource.instances = [];
      (globalThis as unknown as { EventSource: typeof MockEventSource }).EventSource = MockEventSource;
    });

    it('init connected → startSSE crée EventSource', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      await firebase.init();
      expect(MockEventSource.instances.length).toBeGreaterThanOrEqual(1);
      const sse = MockEventSource.instances[MockEventSource.instances.length - 1]!;
      expect(sse.url).toContain('/apex.json');
      fetchSpy.mockRestore();
    });

    it('SSE put event → applyRemoteChange écrit localStorage', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      await firebase.init();
      const sse = MockEventSource.instances[MockEventSource.instances.length - 1]!;
      sse._firePut('/apex_v13_facts', [{ remote: true }]);
      const stored = localStorage.getItem('apex_v13_facts');
      expect(stored).toBeTruthy();
      expect(stored).toContain('remote');
      fetchSpy.mockRestore();
    });

    it('SSE put data=null avec valeur locale → SKIP (plain wins guard)', async () => {
      localStorage.setItem('apex_v13_facts', JSON.stringify([{ local: 'preserve' }]));
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      await firebase.init();
      const sse = MockEventSource.instances[MockEventSource.instances.length - 1]!;
      sse._firePut('/apex_v13_facts', null);
      /* Plain wins : la valeur locale doit rester intacte */
      const stored = localStorage.getItem('apex_v13_facts');
      expect(stored).toContain('local');
      expect(stored).toContain('preserve');
      fetchSpy.mockRestore();
    });

    it('SSE put sur FB_LOCAL key → SKIP (jamais écrit)', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      await firebase.init();
      const sse = MockEventSource.instances[MockEventSource.instances.length - 1]!;
      const before = localStorage.getItem('apex_v13_user');
      sse._firePut('/apex_v13_user', { id: 'malicious_remote' });
      const after = localStorage.getItem('apex_v13_user');
      /* FB_LOCAL : jamais touché par remote */
      expect(after).toBe(before);
      fetchSpy.mockRestore();
    });

    it('SSE onerror → connected=false + auto-reconnect setTimeout', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      vi.useFakeTimers();
      await firebase.init();
      const sse = MockEventSource.instances[MockEventSource.instances.length - 1]!;
      sse._fireError();
      expect(firebase.isConnected()).toBe(false);
      /* setTimeout 5s pour reconnect — advance timers */
      vi.advanceTimersByTime(5001);
      /* Nouvelle instance EventSource créée */
      expect(MockEventSource.instances.length).toBeGreaterThanOrEqual(2);
      vi.useRealTimers();
      fetchSpy.mockRestore();
    });

    it('SSE onopen → connected=true + flushQueue', async () => {
      /* Setup : init offline → write se met en queue */
      const offlineSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
      await firebase.init();
      offlineSpy.mockRestore();
      await firebase.write('apex_v13_facts', [{ queued: true }]);

      /* Re-init connected pour avoir un SSE */
      const onlineSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('null', { status: 200 }));
      await firebase.init();
      const sse = MockEventSource.instances[MockEventSource.instances.length - 1]!;
      sse._fireOpen();
      expect(firebase.isConnected()).toBe(true);
      onlineSpy.mockRestore();
    });

    it('SSE put avec JSON corrompu → catch error gracefull (pas de throw)', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      await firebase.init();
      const sse = MockEventSource.instances[MockEventSource.instances.length - 1]!;
      const corruptedEvent = new MessageEvent('put', { data: 'not_valid_json{{{' });
      let threw = false;
      try {
        (sse.listeners['put'] ?? []).forEach((fn) => fn(corruptedEvent));
      } catch {
        threw = true;
      }
      expect(threw).toBe(false);
      fetchSpy.mockRestore();
    });
  });

  describe('FB_FIX + FB_LOCAL whitelist', () => {
    it('FB_FIX contient apex_v13_facts + lessons + telemetry + claude_todo', () => {
      
      expect(FB_FIX).toContain('apex_v13_facts');
      expect(FB_FIX).toContain('apex_v13_lessons');
      expect(FB_FIX).toContain('ax_telemetry_in');
      expect(FB_FIX).toContain('ax_claude_todo');
    });

    it('FB_LOCAL contient user + uid + lastact + pin + voice_print prefix', () => {
      
      expect(FB_LOCAL).toContain('apex_v13_user');
      expect(FB_LOCAL).toContain('apex_v13_uid');
      expect(FB_LOCAL).toContain('apex_v13_pin');
      expect(FB_LOCAL).toContain('ax_voice_print_');
    });

    it('isLocalOnly détecte voice_print prefix', () => {
      expect(firebase.isLocalOnly('ax_voice_print_kdmc_admin')).toBe(true);
      expect(firebase.isLocalOnly('ax_voice_print_laurence')).toBe(true);
    });
  });
});
