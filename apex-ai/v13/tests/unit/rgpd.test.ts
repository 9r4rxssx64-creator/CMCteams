import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rgpd } from '../../services/rgpd.js';

describe('rgpd service (tests réels Jet 6 — cascade Firebase)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Art. 15 + 20 export', () => {
    it('export retourne structure complète', async () => {
      localStorage.setItem('apex_v13_user', JSON.stringify({ id: 'u1', name: 'Test' }));
      localStorage.setItem('apex_v13_facts', JSON.stringify([{ id: 'f1', text: 'fact1' }]));
      localStorage.setItem('apex_v13_lessons', JSON.stringify([{ id: 'l1' }]));
      localStorage.setItem('apex_v13_theme', JSON.stringify('dark'));
      const exp = await rgpd.exportUserData('u1');
      expect(exp.uid).toBe('u1');
      expect(exp.format).toBe('json');
      expect(exp.apex_version).toBe('v13.0.0');
      expect(exp.persistent_memory).toBeUndefined(); /* moved to .data */
      expect(exp.data.persistent_memory).toBeDefined();
      expect(exp.data.lessons).toBeDefined();
      expect(exp.data.settings).toBeDefined();
    });

    it('format jsonld supporté', async () => {
      const exp = await rgpd.exportUserData('u1', { format: 'jsonld' });
      expect(exp.format).toBe('jsonld');
    });

    it('exportedAt timestamp présent', async () => {
      const before = Date.now();
      const exp = await rgpd.exportUserData('u1');
      expect(exp.exportedAt).toBeGreaterThanOrEqual(before);
    });
  });

  describe('Art. 17 cascade delete RÉELLE (Firebase + IDB + localStorage)', () => {
    it('refuse sans confirmation', async () => {
      const r = await rgpd.deleteUserData('u1', false);
      expect(r.ok).toBe(false);
      expect(r.deletedKeys).toEqual([]);
      expect(r.failures).toContain('not_confirmed');
    });

    it('cascade efface localStorage scoped user', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('null', { status: 200 }));
      localStorage.setItem('apex_v13_user', JSON.stringify({ id: 'u1' }));
      localStorage.setItem('apex_v13_pin_u1', 'hash');
      localStorage.setItem('apex_v13_tier_u1', 'family');
      const r = await rgpd.deleteUserData('u1', true);
      expect(r.deletedKeys.length).toBeGreaterThanOrEqual(2);
      expect(r.deletedKeys).toContain('apex_v13_pin_u1');
      expect(localStorage.getItem('apex_v13_pin_u1')).toBeNull();
      fetchSpy.mockRestore();
    });

    it('cascade appelle Firebase DELETE 3 paths (users + persistent_memory + lessons)', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('null'));
      await rgpd.deleteUserData('u_test', true);
      expect(fetchSpy.mock.calls.length).toBeGreaterThanOrEqual(3);
      const urls = fetchSpy.mock.calls.map((c) => String(c[0]));
      expect(urls.some((u) => u.includes('/apex/users/'))).toBe(true);
      expect(urls.some((u) => u.includes('/apex/persistent_memory/'))).toBe(true);
      expect(urls.some((u) => u.includes('/apex/lessons/'))).toBe(true);
      fetchSpy.mockRestore();
    });

    it('cascade utilise méthode DELETE (vs PUT/GET)', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('null'));
      await rgpd.deleteUserData('u_method', true);
      for (const call of fetchSpy.mock.calls) {
        const init = call[1] as RequestInit | undefined;
        if (init) expect(init.method).toBe('DELETE');
      }
      fetchSpy.mockRestore();
    });

    it('signale failures Firebase si HTTP 500', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('error', { status: 500 }));
      const r = await rgpd.deleteUserData('u_fail', true);
      expect(r.firebaseDeleted).toBe(false);
      expect(r.ok).toBe(false);
      expect(r.failures.some((f) => f.startsWith('firebase:'))).toBe(true);
      fetchSpy.mockRestore();
    });

    it('signale failures Firebase si network error', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
      const r = await rgpd.deleteUserData('u_net', true);
      expect(r.firebaseDeleted).toBe(false);
      expect(r.failures.length).toBeGreaterThan(0);
      fetchSpy.mockRestore();
    });

    it('return shape complète', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('null'));
      const r = await rgpd.deleteUserData('u_shape', true);
      expect(r).toHaveProperty('ok');
      expect(r).toHaveProperty('deletedKeys');
      expect(r).toHaveProperty('firebaseDeleted');
      expect(r).toHaveProperty('idbDeleted');
      expect(r).toHaveProperty('failures');
      fetchSpy.mockRestore();
    });
  });

  describe('Art. 21 opt-out IA training', () => {
    it('opt-in puis opt-out', () => {
      rgpd.optOutAITraining('u1', true);
      expect(rgpd.isOptedOut('u1')).toBe(true);
      rgpd.optOutAITraining('u1', false);
      expect(rgpd.isOptedOut('u1')).toBe(false);
    });

    it('isOptedOut retourne false par défaut', () => {
      expect(rgpd.isOptedOut('jamais_set')).toBe(false);
    });
  });

  describe('Art. 18 restrictProcessing', () => {
    it('restrict + remove', () => {
      rgpd.restrictProcessing('u1', true);
      expect(localStorage.getItem('apex_v13_restricted_u1')).toBe('1');
      rgpd.restrictProcessing('u1', false);
      expect(localStorage.getItem('apex_v13_restricted_u1')).toBeNull();
    });
  });

  describe('Art. 30 registre traitements', () => {
    it('≥ 5 activités déclarées', () => {
      const reg = rgpd.getProcessingRegistry();
      expect(reg.length).toBeGreaterThanOrEqual(5);
    });

    it('chaque activité a finalite + donnees + baseLegale + duree + destinataires', () => {
      const reg = rgpd.getProcessingRegistry();
      for (const a of reg) {
        expect(a.finalite).toBeTruthy();
        expect(Array.isArray(a.donnees)).toBe(true);
        expect(['consent', 'contract', 'legal_obligation', 'legitimate_interest']).toContain(a.baseLegale);
        expect(a.duree).toBeTruthy();
        expect(Array.isArray(a.destinataires)).toBe(true);
      }
    });
  });

  describe('consent + audit', () => {
    it('record + hasConsent', () => {
      rgpd.recordConsent('u1', { aiTraining: true, analytics: false, thirdParty: true });
      expect(rgpd.hasConsent('u1')).toBe(true);
    });

    it('hasConsent false par défaut', () => {
      expect(rgpd.hasConsent('jamais')).toBe(false);
    });
  });
});
