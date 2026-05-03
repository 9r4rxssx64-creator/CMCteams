import { describe, it, expect, beforeEach } from 'vitest';
import { webauthn } from '../../services/webauthn.js';

describe('webauthn service (tests Jet 6.5)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('isSupported + isPlatformAuthAvailable', () => {
    it('isSupported retourne boolean', () => {
      expect(typeof webauthn.isSupported()).toBe('boolean');
    });

    it('isPlatformAuthAvailable retourne Promise<boolean>', async () => {
      const r = await webauthn.isPlatformAuthAvailable();
      expect(typeof r).toBe('boolean');
    });
  });

  describe('hasEnrollment', () => {
    it('false par défaut', () => {
      expect(webauthn.hasEnrollment('uid_jamais_enroll')).toBe(false);
    });

    it('true après enroll local manuel', () => {
      localStorage.setItem('apex_v13_webauthn_uid_test', 'fake_credential_b64');
      expect(webauthn.hasEnrollment('uid_test')).toBe(true);
    });
  });

  describe('verify sans enrollment', () => {
    it('retourne ok=false si pas de credential stocké', async () => {
      const r = await webauthn.verify('uid_no_enrollment');
      expect(r.ok).toBe(false);
      expect(r.reason).toBeTruthy();
    });
  });

  describe('enroll erreur sans support', () => {
    it('enroll throw soit ok soit reason présent', async () => {
      const r = await webauthn.enroll('uid_test', 'Kevin');
      /* En env happy-dom (pas de WebAuthn natif), enroll échoue gracieusement */
      expect(typeof r.ok).toBe('boolean');
      if (!r.ok) expect(r.reason).toBeTruthy();
    });
  });
});
