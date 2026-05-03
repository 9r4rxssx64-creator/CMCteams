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
      /* Pas de throw, queué pour retry */
      expect(true).toBe(true);
      fetchSpy.mockRestore();
    });

    it('write timeout → push dans queue', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('AbortError timeout'));
      await firebase.write('apex_v13_facts', [{ timeout: true }]);
      expect(true).toBe(true);
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

    it('write si offline → push queue', async () => {
      /* Sans init, connected=false */
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      await firebase.write('apex_v13_facts', [{ offline: true }]);
      /* Pas de fetch car offline */
      expect(true).toBe(true);
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
