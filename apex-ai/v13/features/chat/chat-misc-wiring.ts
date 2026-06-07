/**
 * APEX v13 — chat-misc-wiring.ts
 * Wiring de boutons header autonomes du chat : logo (long-press → diagnostic
 * admin) + bascule de mode IA (#ax-chat-mode-toggle).
 *
 * Extrait de features/chat/index.ts render() (v13.4.300, refactor monolithe
 * sans régression). Aucune dépendance d'état module. Appelé par render().
 */
import { logger } from '../../core/logger.js';
import { store } from '../../core/store.js';
import { haptic } from '../../ui/haptic.js';
import { toast } from '../../ui/toast.js';

/** Câble le logo (long-press diag) + la bascule de mode IA. */
export function wireLogoAndModeToggle(rootEl: HTMLElement): void {
  const logoEl = rootEl.querySelector<HTMLHeadingElement>('#ax-chat-logo');
  if (logoEl) {
    let pressTimer: number | null = null;
    const startPress = (): void => {
      if (pressTimer !== null) return;
      pressTimer = window.setTimeout(async () => {
        pressTimer = null;
        const isAdminUser = store.get('isAdmin');
        if (!isAdminUser) return; /* discret : long-press silencieux pour non-admin */
        haptic.tap();
        try {
          const { router } = await import('../../core/router.js');
          router.navigate('admin-health-dashboard');
        } catch {
          /* fallback : ouvrir diagnostic SOS direct si dashboard non chargeable */
          try {
            const { sosRescue } = await import('../../ui/sos-rescue.js');
            sosRescue.openDiagnosticDirect();
          } catch { /* ignore */ }
        }
      }, 3000);
    };
    const cancelPress = (): void => {
      if (pressTimer !== null) {
        window.clearTimeout(pressTimer);
        pressTimer = null;
      }
    };
    logoEl.addEventListener('mousedown', startPress);
    logoEl.addEventListener('mouseup', cancelPress);
    logoEl.addEventListener('mouseleave', cancelPress);
    logoEl.addEventListener('touchstart', startPress, { passive: true });
    logoEl.addEventListener('touchend', cancelPress);
    logoEl.addEventListener('touchcancel', cancelPress);
  }

  /* v13.4.273 (Kevin "Revois l'utilisation des différentes ia que tout soit
   * bien en place avec eco token") : toggle 1-tap mode routing IA depuis le
   * header chat. Cycle auto → economy → premium → auto. Toast indique le
   * nouveau mode + icône bouton change pour refléter l'état courant. */
  const modeToggleBtn = rootEl.querySelector<HTMLButtonElement>('#ax-chat-mode-toggle');
  const MODE_ICONS: Record<string, string> = { auto: '⚡', economy: '💚', premium: '👑', forced: '🎯' };
  const MODE_LABELS: Record<string, string> = {
    auto: 'Auto (intelligent, free fallback si budget)',
    economy: 'Économie (gratuit d\'abord — haiku, max_tokens /2)',
    premium: 'Premium (Anthropic Opus toujours)',
    forced: 'Forced (provider admin override)',
  };
  /* Set icon initial selon mode persisté */
  void (async () => {
    try {
      const { aiRoutingPolicy } = await import('../../services/ai/ai-routing-policy.js');
      const m = aiRoutingPolicy.getMode();
      if (modeToggleBtn) {
        modeToggleBtn.textContent = MODE_ICONS[m] ?? '⚡';
        modeToggleBtn.setAttribute('title', `Mode IA : ${MODE_LABELS[m] ?? m} — clic pour basculer`);
      }
    } catch { /* ignore */ }
  })();
  modeToggleBtn?.addEventListener('click', () => {
    haptic.tap();
    void (async () => {
      try {
        const { aiRoutingPolicy } = await import('../../services/ai/ai-routing-policy.js');
        const current = aiRoutingPolicy.getMode();
        /* Cycle : auto → economy → premium → auto (skip forced, admin-only) */
        const next: 'auto' | 'economy' | 'premium' =
          current === 'auto' ? 'economy' : current === 'economy' ? 'premium' : 'auto';
        aiRoutingPolicy.setMode(next);
        if (modeToggleBtn) {
          modeToggleBtn.textContent = MODE_ICONS[next] ?? '⚡';
          modeToggleBtn.setAttribute('title', `Mode IA : ${MODE_LABELS[next]} — clic pour basculer`);
        }
        toast.success(`${MODE_ICONS[next]} Mode IA : ${MODE_LABELS[next]}`);
        haptic.success();
      } catch (err: unknown) {
        logger.warn('chat', 'mode-toggle failed', { err });
        toast.error('Impossible de changer de mode');
      }
    })();
  });
}
