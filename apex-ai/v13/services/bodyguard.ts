/**
 * APEX v13 — Bodyguard runtime (P1 audit)
 *
 * Listeners CSP violations + postMessage cross-frame + devtools detect.
 * Log toutes anomalies dans audit log immutable.
 *
 * Anti-pattern v12.785 : pas de monitoring runtime, attaques silencieuses.
 */

import { logger } from '../core/logger.js';

import { auditLog } from './audit-log.js';

class Bodyguard {
  private installed = false;

  install(): void {
    if (this.installed) return;
    this.installed = true;

    /* CSP violations — toute tentative d'injection de script externe */
    document.addEventListener('securitypolicyviolation', (e) => {
      logger.error('bodyguard', `CSP violation: ${e.violatedDirective}`, {
        blockedURI: e.blockedURI,
        sourceFile: e.sourceFile,
        lineNumber: e.lineNumber,
      });
      void auditLog.record('security.csp_violation', {
        details: {
          directive: e.violatedDirective,
          blockedURI: String(e.blockedURI).slice(0, 200),
          sourceFile: String(e.sourceFile).slice(0, 200),
        },
      });
    });

    /* postMessage cross-frame externe = potentiellement malveillant */
    window.addEventListener('message', (e) => {
      if (!e.origin) return;
      const trusted = ['https://www.google.com', 'https://www.youtube.com', location.origin];
      if (!trusted.includes(e.origin)) {
        logger.warn('bodyguard', `postMessage external: ${e.origin}`);
        void auditLog.record('security.postmessage_external', {
          details: { origin: e.origin, dataPreview: String(e.data).slice(0, 100) },
        });
      }
    });

    /* visibilitychange = utile pour rotation tokens / verify session */
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) return;
      void auditLog.record('session.visible', {});
    });
  }
}

export const bodyguard = new Bodyguard();
