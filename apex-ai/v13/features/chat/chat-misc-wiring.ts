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
import { modalSheet } from '../../ui/modal-sheet.js';
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


/** Câble le bouton menu hamburger (#ax-chat-menu) du chat. */
export function wireMenuButton(rootEl: HTMLElement): void {
  const menuBtn = rootEl.querySelector<HTMLButtonElement>('#ax-chat-menu');
  menuBtn?.addEventListener('click', () => {
    haptic.tap();
    const isAdminUser = store.get('isAdmin');
    const sheet = modalSheet.open({
      title: '☰ Menu',
      content: `
        <div class="ax-gs-123">
          <button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="chat">💬 Chat</button>
          ${isAdminUser ? '<button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="admin">👑 Centre Admin</button>' : ''}
          <button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="studios">🎨 Studios</button>
          <button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="studio-music">🎚 Mix Musique</button>
          <button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="studio-video">🎬 Vidéo</button>
          <button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="studio-cv">📄 CV</button>
          <button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="studio-invoice">🧾 Facture</button>
          <button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="studio-contract">📋 Contrat</button>
          <button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="pro">💼 Pro</button>
          <button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="remote">📡 Télécommande</button>
          <button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="browser">🌐 Browser</button>
          <button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="domotique">🏠 Domotique</button>
          <button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="workflow">⚡ Workflows</button>
          <button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="crypto">₿ Crypto</button>
          <button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="notes">📝 Bloc-notes</button>
          <button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="calendar">📅 Calendrier</button>
          <button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="calculators">🧮 Calculatrices</button>
          <button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="archive">🗄 Archive</button>
          ${isAdminUser ? '<button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="billing">💳 Comptes &amp; Factures</button>' : ''}
          ${isAdminUser ? '<button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="sentinels">🛡 Sentinelles</button>' : ''}
          <button class="ax-btn ax-btn-primary ax-gs-360" data-menu-nav="settings">⚙️ Réglages</button>
          <button class="ax-btn ax-gs-360" data-menu-action="paste-key">🔑 Coller une clé API</button>
          <button class="ax-btn" data-menu-action="logout" style="width:100%;text-align:left;padding:14px;color:var(--ax-error)">🚪 Déconnexion</button>
        </div>
      `,
      actions: [
        { label: 'Fermer', variant: 'ghost', onClick: () => sheet.close() },
      ],
    });
    /* Wire boutons du drawer après render */
    setTimeout(() => {
      document.querySelectorAll<HTMLButtonElement>('[data-menu-nav]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = btn.dataset['menuNav'] ?? '';
          haptic.tap();
          sheet.close();
          if (target) location.hash = `#${target}`;
        });
      });
      document.querySelectorAll<HTMLButtonElement>('[data-menu-action]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const action = btn.dataset['menuAction'] ?? '';
          haptic.tap();
          sheet.close();
          if (action === 'paste-key') {
            /* Trigger paste flow réutilisant la modal existante */
            rootEl.querySelector<HTMLButtonElement>('#ax-paste-key-nav')?.click();
          } else if (action === 'logout') {
            rootEl.querySelector<HTMLButtonElement>('#ax-logout-nav')?.click();
          }
        });
      });
    }, 50);
  });
}
