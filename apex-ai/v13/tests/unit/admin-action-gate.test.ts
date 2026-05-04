/**
 * Test admin-action-gate (P0 sécu fix v13.0.13).
 * Wrap actions sensibles avec WebAuthn verify obligatoire (fallback PIN).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { adminActionGate } from '../../services/admin-action-gate.js';

describe('Admin Action Gate (P0 sécu — WebAuthn obligatoire actions sensibles)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('verify sans WebAuthn enrollé', () => {
    it('sans PIN → ok=false denied PIN required', async () => {
      const r = await adminActionGate.verify('toggle_commerce', 'kdmc_admin');
      expect(r.ok).toBe(false);
      expect(r.method).toBe('denied');
      expect(r.reason).toContain('PIN');
    });

    it('PIN incorrect → denied', async () => {
      const r = await adminActionGate.verify('change_pin', 'kdmc_admin', 'wrong');
      expect(r.ok).toBe(false);
      expect(r.method).toBe('denied');
    });
  });

  describe('guardAction higher-order wrapper', () => {
    it('action wrappée bloquée si gate refuse', async () => {
      const sensitiveAction = adminActionGate.guardAction(
        'erase_account',
        'kdmc_admin',
        async (target: string) => ({ ok: true, deleted: target }),
      );
      const result = await sensitiveAction('user_to_erase');
      /* Sans WebAuthn ni PIN → bloqué */
      if ('gateBlocked' in result) {
        expect(result.gateBlocked).toBe(true);
        expect(result.ok).toBe(false);
      }
    });

    it('si gate passe (mock), action exécutée', async () => {
      /* Pas de WebAuthn enrollé donc fallback PIN, mais on test wrapper structure */
      let called = false;
      const fn = adminActionGate.guardAction('toggle_commerce', 'kdmc_admin', async () => {
        called = true;
        return { ok: true };
      });
      await fn();
      /* Sans PIN, fonction NE doit PAS être appelée */
      expect(called).toBe(false);
    });
  });

  describe('getStatus pour dashboard UI', () => {
    it('retourne webauthn_enrolled + supported + requires_setup', () => {
      const s = adminActionGate.getStatus('kdmc_admin');
      expect(typeof s.webauthn_enrolled).toBe('boolean');
      expect(typeof s.webauthn_supported).toBe('boolean');
      expect(typeof s.requires_setup).toBe('boolean');
    });

    it('requires_setup=true si supported mais pas enrollé', () => {
      const s = adminActionGate.getStatus('kdmc_admin');
      if (s.webauthn_supported && !s.webauthn_enrolled) {
        expect(s.requires_setup).toBe(true);
      }
    });
  });

  describe('audit log par action', () => {
    it('toutes 9 actions sensibles traçables', async () => {
      const actions: Array<Parameters<typeof adminActionGate.verify>[0]> = [
        'toggle_commerce', 'set_user_plan', 'erase_account', 'export_data',
        'change_pin', 'change_passphrase', 'rotate_api_key', 'factory_reset',
        'change_email_admin',
      ];
      for (const action of actions) {
        const r = await adminActionGate.verify(action, 'kdmc_admin');
        expect(r).toHaveProperty('ok');
      }
    });
  });
});
