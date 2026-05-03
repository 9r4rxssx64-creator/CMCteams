/**
 * APEX v13 — Error boundary global
 *
 * Capture window.onerror + unhandledrejection.
 * Pas de catch silencieux : toute erreur loggée + affichée si UI cassée.
 *
 * Anti-patterns évités :
 * - Pas de message technique brut à l'utilisateur (cf. règle CLAUDE.md UX erreurs)
 * - Pas de e.message brut HTML (XSS possible)
 */

import { logger } from './logger.js';

interface ErrorContext {
  source: 'window.onerror' | 'unhandledrejection' | 'manual';
  url?: string;
  line?: number;
  col?: number;
  stack?: string;
}

class Errors {
  private installed = false;
  private errorCount = 0;
  private readonly maxErrorsBeforeRescue = 10;

  installGlobalHandlers(): void {
    if (this.installed) return;
    this.installed = true;

    window.addEventListener('error', (event) => {
      this.capture(event.error || new Error(event.message), {
        source: 'window.onerror',
        ...(event.filename && { url: event.filename }),
        ...(typeof event.lineno === 'number' && { line: event.lineno }),
        ...(typeof event.colno === 'number' && { col: event.colno }),
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      const reason: unknown = event.reason;
      const err = reason instanceof Error ? reason : new Error(String(reason));
      this.capture(err, { source: 'unhandledrejection' });
    });
  }

  capture(err: unknown, ctx: Partial<ErrorContext> = {}): void {
    this.errorCount++;
    const error = err instanceof Error ? err : new Error(String(err));

    logger.error('errors', error.message, {
      stack: error.stack,
      ...ctx,
    });

    if (this.errorCount >= this.maxErrorsBeforeRescue) {
      this.triggerRescue();
    }
  }

  private triggerRescue(): void {
    const sos = document.getElementById('apex-rescue-btn');
    if (sos) {
      sos.style.display = 'flex';
      sos.style.background = '#ff5858';
      sos.title = 'Trop d\'erreurs détectées — tap SOS pour recharger';
    }
  }

  /* Convertit erreur technique en message user-friendly (règle CLAUDE.md) */
  toUserMessage(err: unknown): string {
    const msg = err instanceof Error ? err.message : String(err);
    if (/network|fetch|cors/i.test(msg)) return 'Réseau indisponible. Vérifie ta connexion.';
    if (/timeout/i.test(msg)) return 'Pas de réponse, réessaie dans un instant.';
    if (/quota|exceeded/i.test(msg)) return 'Stockage saturé, nettoyage automatique lancé.';
    if (/unauthorized|401/i.test(msg)) return 'Identifiants invalides ou expirés.';
    if (/forbidden|403/i.test(msg)) return 'Action non autorisée.';
    if (/not found|404/i.test(msg)) return 'Élément introuvable.';
    if (/5\d{2}/i.test(msg)) return 'Serveur indisponible, réessaie dans 1 min.';
    return 'Un petit souci, réessaie ou tape SOS.';
  }
}

export const errors = new Errors();
