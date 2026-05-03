/**
 * APEX v13 — WebAuthn FaceID / TouchID admin (P1 audit)
 *
 * Authentification biométrique obligatoire pour admin Kevin sur actions sensibles
 * (toggleCommerce, créer compte, modifier permissions, exporter données).
 *
 * Stratégie :
 * - Premier login admin : enregistrer credential WebAuthn (FaceID iPhone, Windows Hello, etc.)
 * - Actions sensibles : prompt re-auth WebAuthn (geste biométrique seul)
 * - Fallback : PIN admin si WebAuthn indisponible (compat dégradée)
 */

import { logger } from '../core/logger.js';

import { auditLog } from './audit-log.js';

const RP_ID = location.hostname; /* Relying Party ID = origin actuel */
const RP_NAME = 'APEX AI';

class WebAuthn {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'PublicKeyCredential' in window && typeof navigator.credentials?.create === 'function';
  }

  async isPlatformAuthAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  /**
   * Enrôle un nouveau credential WebAuthn pour un user.
   * Appelé une fois au premier login admin avec biométrie disponible.
   */
  async enroll(userId: string, userName: string): Promise<{ ok: boolean; credentialId?: string; reason?: string }> {
    if (!this.isSupported()) return { ok: false, reason: 'WebAuthn non supporté sur ce navigateur' };
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userIdBytes = new TextEncoder().encode(userId);
      const cred = (await navigator.credentials.create({
        publicKey: {
          challenge: challenge as BufferSource,
          rp: { name: RP_NAME, id: RP_ID },
          user: {
            id: userIdBytes as BufferSource,
            name: userName,
            displayName: userName,
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },   /* ES256 */
            { type: 'public-key', alg: -257 }, /* RS256 */
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', /* FaceID / TouchID / Windows Hello */
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
          attestation: 'none',
        },
      })) as PublicKeyCredential | null;
      if (!cred) return { ok: false, reason: 'Enregistrement annulé' };
      const credentialId = this.bufToB64(cred.rawId);
      try {
        localStorage.setItem(`apex_v13_webauthn_${userId}`, credentialId);
      } catch {
        /* ignore quota */
      }
      void auditLog.record('webauthn.enroll.success', { actor: userId });
      logger.info('webauthn', `Enrolled credential for ${userId}`);
      return { ok: true, credentialId };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn('webauthn', 'Enroll failed', { err: msg });
      void auditLog.record('webauthn.enroll.fail', { actor: userId, details: { reason: msg } });
      return { ok: false, reason: msg };
    }
  }

  /**
   * Vérifie identité via biométrie pour action sensible.
   * Ne signe pas serveur-side (PWA pure), juste prouve présence physique user.
   */
  async verify(userId: string): Promise<{ ok: boolean; reason?: string }> {
    if (!this.isSupported()) return { ok: false, reason: 'WebAuthn non supporté' };
    const stored = localStorage.getItem(`apex_v13_webauthn_${userId}`);
    if (!stored) return { ok: false, reason: 'Pas de credential enregistré, fais l\'enrôlement d\'abord' };
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const credentialId = this.b64ToBuf(stored);
      const assertion = (await navigator.credentials.get({
        publicKey: {
          challenge: challenge as BufferSource,
          allowCredentials: [{ type: 'public-key', id: credentialId as BufferSource }],
          userVerification: 'required',
          timeout: 30000,
        },
      })) as PublicKeyCredential | null;
      if (!assertion) return { ok: false, reason: 'Vérification annulée' };
      void auditLog.record('webauthn.verify.success', { actor: userId });
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      void auditLog.record('webauthn.verify.fail', { actor: userId, details: { reason: msg } });
      return { ok: false, reason: msg };
    }
  }

  hasEnrollment(userId: string): boolean {
    return localStorage.getItem(`apex_v13_webauthn_${userId}`) !== null;
  }

  private bufToB64(buf: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  }

  private b64ToBuf(s: string): Uint8Array {
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
}

export const webauthn = new WebAuthn();
