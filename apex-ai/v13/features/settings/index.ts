/**
 * APEX v13 — Feature Settings (réglages utilisateur).
 * Stub Sprint 2 P0 — sera enrichi avec parité v12.785 vSettings.
 */

import { logger } from '../../core/logger.js';
import { store } from '../../core/store.js';

export function render(rootEl: HTMLElement): void {
  const user = store.get('user');
  const isAdmin = (store.get('isAdmin') as boolean | undefined) ?? false;
  rootEl.innerHTML = `
    <div class="ax-page" style="padding:16px;max-width:600px;margin:0 auto">
      <h1 style="margin:0 0 16px;color:#c9a227">⚙️ Réglages</h1>
      <p style="color:var(--ax-text-dim)">Utilisateur : <strong>${user?.name ?? 'inconnu'}</strong> ${isAdmin ? '👑' : ''}</p>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;margin-top:16px">
        <h2 style="margin:0 0 12px;font-size:16px">🔑 Clés API</h2>
        <p style="margin:0 0 12px;color:var(--ax-text-dim);font-size:14px">Gère tes clés API (Anthropic, OpenAI, Stripe, etc.)</p>
        <button class="ax-btn ax-btn-primary" onclick="location.hash='#chat'" style="width:100%">Ouvrir le Coffre (depuis chat)</button>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;margin-top:12px">
        <h2 style="margin:0 0 12px;font-size:16px">🎨 Apparence</h2>
        <p style="margin:0;color:var(--ax-text-dim);font-size:14px">Thème : <strong>Dark</strong> (clair bientôt)</p>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;margin-top:12px">
        <h2 style="margin:0 0 12px;font-size:16px">🔔 Notifications</h2>
        <button class="ax-btn ax-btn-secondary" id="ax-settings-notif-test" style="width:100%">Tester notification push</button>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;margin-top:12px">
        <h2 style="margin:0 0 12px;font-size:16px">🔐 Compte</h2>
        <button class="ax-btn ax-btn-danger" id="ax-settings-logout" style="width:100%">Se déconnecter</button>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `;
  rootEl.querySelector<HTMLButtonElement>('#ax-settings-logout')?.addEventListener('click', () => {
    void (async () => {
      const { auth } = await import('../../services/auth.js');
      auth.logout();
      location.hash = '#login';
    })();
  });
  rootEl.querySelector<HTMLButtonElement>('#ax-settings-notif-test')?.addEventListener('click', () => {
    void (async () => {
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Test Apex', { body: 'Si tu vois ça, push notif fonctionne ✅' });
        } else if ('Notification' in window) {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            new Notification('Test Apex', { body: 'Push activé ✅' });
          } else {
            const { toast } = await import('../../ui/toast.js');
            toast.warn('Permission notifications refusée');
          }
        } else {
          const { toast } = await import('../../ui/toast.js');
          toast.warn('Notifications non supportées par ce navigateur');
        }
      } catch {
        const { toast } = await import('../../ui/toast.js');
        toast.warn('Test notification échoué');
      }
    })();
  });
  logger.info('feature-settings', 'rendered');
}
