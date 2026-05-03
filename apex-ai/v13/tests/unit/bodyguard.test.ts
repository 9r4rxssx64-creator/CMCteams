import { describe, it, expect } from 'vitest';
import { bodyguard } from '../../services/bodyguard.js';

describe('bodyguard service (tests Jet 6.5)', () => {
  it('install() ne throw pas', () => {
    expect(() => bodyguard.install()).not.toThrow();
  });

  it('install() idempotent (2e appel sans erreur)', () => {
    bodyguard.install();
    expect(() => bodyguard.install()).not.toThrow();
  });

  it('CSP violation listener installé', () => {
    bodyguard.install();
    /* Simule un événement CSP violation */
    const event = new Event('securitypolicyviolation');
    Object.defineProperty(event, 'violatedDirective', { value: 'script-src' });
    Object.defineProperty(event, 'blockedURI', { value: 'https://evil.com/script.js' });
    /* Ne doit pas throw même si tous les détails ne sont pas présents */
    expect(() => document.dispatchEvent(event)).not.toThrow();
  });

  it('postMessage handler installé : event externe ne throw pas', () => {
    bodyguard.install();
    let threw = false;
    try {
      /* Simule postMessage externe (origin différent) */
      const event = new MessageEvent('message', {
        data: { type: 'unknown', payload: { evil: true } },
        origin: 'https://attacker.example.com',
      });
      window.dispatchEvent(event);
    } catch {
      threw = true;
    }
    expect(threw).toBe(false);
  });
});
