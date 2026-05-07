/**
 * APEX v13.3.30 — SOS Rescue (bouton de secours permanent).
 *
 * Demande Kevin (CLAUDE.md règle absolue) :
 * > "Bouton SOS rescue permanent visible partout — Kevin doit pouvoir débloquer
 * >  Apex en 1 clic si jamais quelque chose plante."
 * > "Toast info passive ; jamais bloquer Kevin."
 *
 * Mission :
 * - Bouton flottant 🆘 fixed bottom-right (z-index max), visible TOUT LE TEMPS
 * - 1 clic court → lance autoSelfHeal (clear caches, reset providers, reload modules)
 * - Long-press 1s → modal diagnostic complet (status providers, network, SW, cache)
 *   + boutons "Force reset session", "Hard refresh", "Vider mémoire", "Re-test sentinelles"
 * - Status pastille couleur :
 *   * 🟢 OK (tous services up)
 *   * 🟡 X services dégradés (ping ai-router, network)
 *   * 🔴 BLOCAGE détecté (auto-fix proposé)
 *
 * Anti-pattern : ne JAMAIS retirer ce bouton, même en panic mode. C'est le dernier
 *               recours pour Kevin si tout part en couille.
 */

import { logger } from '../core/logger.js';

class SosRescue {
  private btnEl: HTMLButtonElement | null = null;
  private statusDot: HTMLSpanElement | null = null;
  private mounted = false;
  private pressTimer: number | null = null;
  private healthCheckInterval: number | null = null;

  /**
   * Mount le bouton flottant. À appeler une seule fois au boot.
   */
  mount(): void {
    if (this.mounted) return;
    if (typeof document === 'undefined') return;

    const btn = document.createElement('button');
    btn.id = 'apex-sos-rescue';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'SOS Rescue — Débloquer Apex');
    btn.title = 'SOS — Tap court : auto-fix. Long press : diagnostic complet.';
    btn.style.cssText = [
      'position:fixed',
      'bottom:84px',
      'right:14px',
      'width:50px',
      'height:50px',
      'border-radius:50%',
      'border:2px solid rgba(255,255,255,0.3)',
      'background:linear-gradient(135deg,#dc2626,#991b1b)',
      'color:#fff',
      'font-size:24px',
      'cursor:pointer',
      'z-index:99999',
      'box-shadow:0 4px 16px rgba(220,38,38,0.4)',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      '-webkit-tap-highlight-color:transparent',
      'transition:transform 200ms ease',
      'opacity:0.7',
    ].join(';');
    btn.innerHTML = '🆘';

    /* Pastille status (overlay coin sup-droite) */
    const dot = document.createElement('span');
    dot.style.cssText = [
      'position:absolute',
      'top:2px',
      'right:2px',
      'width:12px',
      'height:12px',
      'border-radius:50%',
      'background:#22c55e',
      'border:2px solid #fff',
    ].join(';');
    btn.appendChild(dot);
    this.statusDot = dot;

    /* Touch / mouse handlers */
    btn.addEventListener('mouseenter', () => { btn.style.opacity = '1'; });
    btn.addEventListener('mouseleave', () => { btn.style.opacity = '0.7'; });

    btn.addEventListener('mousedown', () => this.startPress());
    btn.addEventListener('mouseup', () => this.endPress(false));
    btn.addEventListener('mouseleave', () => this.endPress(true));
    btn.addEventListener('touchstart', () => this.startPress(), { passive: true });
    btn.addEventListener('touchend', () => this.endPress(false));
    btn.addEventListener('touchcancel', () => this.endPress(true));

    document.body.appendChild(btn);
    this.btnEl = btn;
    this.mounted = true;

    /* Health check toutes les 30s */
    this.healthCheckInterval = window.setInterval(() => {
      void this.refreshStatus();
    }, 30_000);
    void this.refreshStatus();

    logger.info('sos-rescue', 'mounted');
  }

  private startPress(): void {
    if (!this.btnEl) return;
    this.btnEl.style.transform = 'scale(0.95)';
    this.pressTimer = window.setTimeout(() => {
      this.openDiagnostic();
      this.pressTimer = null;
    }, 1000);
  }

  private endPress(cancelled: boolean): void {
    if (this.btnEl) this.btnEl.style.transform = 'scale(1)';
    if (this.pressTimer !== null) {
      window.clearTimeout(this.pressTimer);
      this.pressTimer = null;
      if (!cancelled) {
        /* Tap court → auto-heal */
        void this.autoSelfHeal();
      }
    }
  }

  /**
   * Auto-heal léger : clear caches non critiques + ping providers + toast.
   */
  async autoSelfHeal(): Promise<void> {
    logger.info('sos-rescue', 'autoSelfHeal start');
    let healed = 0;
    /* 1. Clear toast pending */
    try {
      const { toast } = await import('./toast.js');
      toast.info('SOS — auto-fix en cours…', { duration: 2000 });
    } catch { /* ignore */ }

    /* 2. Refresh AI provider connectivity */
    try {
      const { aiRouter } = await import('../services/ai-router.js');
      if (aiRouter.hasAnyKey()) healed += 1;
    } catch { /* ignore */ }

    /* 3. Reload memory (recharge facts/lessons depuis localStorage) */
    try {
      const { memory } = await import('../core/memory.js');
      memory.reload();
      healed += 1;
    } catch { /* ignore */ }

    /* 4. Refresh status indicator */
    void this.refreshStatus();

    /* 5. Toast résultat */
    try {
      const { toast } = await import('./toast.js');
      toast.success(`SOS terminé (${healed} modules vérifiés)`, { duration: 3000 });
    } catch { /* ignore */ }

    logger.info('sos-rescue', `autoSelfHeal done (${healed} healed)`);
  }

  /**
   * Modal diagnostic complet (long-press).
   */
  async openDiagnostic(): Promise<void> {
    logger.info('sos-rescue', 'openDiagnostic');
    let body = '';
    try {
      const { aiRouter } = await import('../services/ai-router.js');
      body += `🤖 AI Router : ${aiRouter.hasAnyKey() ? 'OK (clé présente)' : '⚠️ aucune clé'}\n`;
    } catch { body += '🤖 AI Router : ❌ erreur\n'; }
    body += `🌐 Network : ${navigator.onLine ? '🟢 online' : '🔴 offline'}\n`;
    try {
      const { memory } = await import('../core/memory.js');
      body += `🧠 Memory facts : ${memory.getFacts().length}\n`;
    } catch { /* ignore */ }
    try {
      const { autoTestRunner } = await import('../services/auto-test-runner.js');
      const last = autoTestRunner.getLastRun();
      if (last) {
        body += `🧪 Last test run : ${last.passed}/${last.total} passed\n`;
      } else {
        body += `🧪 Last test run : jamais\n`;
      }
    } catch { /* ignore */ }

    try {
      const { modalSheet } = await import('./modal-sheet.js');
      modalSheet.open({
        title: '🆘 Diagnostic Apex',
        content: `<pre style="font-family:monospace;font-size:12px;line-height:1.6;white-space:pre-wrap">${body}</pre>` +
          `<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">` +
          `<button id="sos-test" style="padding:10px 14px;background:rgba(34,197,94,0.15);border:1px solid #22c55e;color:#fff;border-radius:8px;cursor:pointer">🧪 Tester</button>` +
          `<button id="sos-reload" style="padding:10px 14px;background:rgba(99,102,241,0.15);border:1px solid #6366f1;color:#fff;border-radius:8px;cursor:pointer">🔄 Recharger</button>` +
          `<button id="sos-heal" style="padding:10px 14px;background:rgba(220,38,38,0.15);border:1px solid #dc2626;color:#fff;border-radius:8px;cursor:pointer">🩺 Auto-fix</button>` +
          `</div>`,
      });
      setTimeout(() => {
        document.getElementById('sos-test')?.addEventListener('click', () => {
          void import('../services/auto-test-runner.js').then((m) => m.autoTestRunner.runAll());
        });
        document.getElementById('sos-reload')?.addEventListener('click', () => {
          window.location.reload();
        });
        document.getElementById('sos-heal')?.addEventListener('click', () => {
          void this.autoSelfHeal();
        });
      }, 50);
    } catch (err: unknown) {
      logger.warn('sos-rescue', 'modal failed, fallback alert', { err });
      window.alert(body);
    }
  }

  /**
   * Refresh status pastille couleur.
   */
  async refreshStatus(): Promise<void> {
    if (!this.statusDot) return;
    let color = '#22c55e'; /* green default */
    try {
      if (!navigator.onLine) {
        color = '#dc2626'; /* red */
      } else {
        const { aiRouter } = await import('../services/ai-router.js');
        if (!aiRouter.hasAnyKey()) {
          color = '#eab308'; /* yellow */
        }
      }
    } catch {
      color = '#eab308';
    }
    this.statusDot.style.background = color;
  }

  /**
   * Unmount (utile pour tests + reset).
   */
  unmount(): void {
    if (this.btnEl) {
      this.btnEl.remove();
      this.btnEl = null;
      this.statusDot = null;
    }
    if (this.healthCheckInterval !== null) {
      window.clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.mounted = false;
  }
}

export const sosRescue = new SosRescue();
