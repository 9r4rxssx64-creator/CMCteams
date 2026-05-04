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
        <h2 style="margin:0 0 12px;font-size:16px">🧠 Mémoire externe</h2>
        <p style="margin:0 0 8px;color:var(--ax-text-dim);font-size:13px">
          Backup mémoire vers Notion / GitHub Gist / Firebase. Tokens lus depuis le Coffre.
        </p>
        <div id="ax-memory-bridge-status" style="margin:8px 0;font-size:13px;color:var(--ax-text-dim)"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-memory-bridge-sync" style="width:100%">Sync maintenant</button>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;margin-top:12px">
        <h2 style="margin:0 0 12px;font-size:16px">📊 Conso API temps réel + détection anomalies</h2>
        <p style="margin:0 0 8px;color:var(--ax-text-dim);font-size:13px">
          Apex surveille ta conso et détecte si une clé est utilisée anormalement (potentielle compromission).
        </p>
        <button class="ax-btn ax-btn-secondary" id="ax-conso-scan" style="width:100%;margin-bottom:8px">🔍 Scanner toutes mes API maintenant</button>
        <div id="ax-conso-results" style="margin-top:12px;font-size:13px"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;margin-top:12px">
        <h2 style="margin:0 0 12px;font-size:16px">🔐 Compte</h2>
        <button class="ax-btn ax-btn-danger" id="ax-settings-logout" style="width:100%">Se déconnecter</button>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `;
  /* Wire memory-bridge section : status read-only + sync button */
  void (async () => {
    try {
      const { memoryBridge } = await import('../../services/memory-bridge.js');
      const statusEl = rootEl.querySelector<HTMLElement>('#ax-memory-bridge-status');
      const syncBtn = rootEl.querySelector<HTMLButtonElement>('#ax-memory-bridge-sync');
      const refreshStatus = (): void => {
        if (!statusEl) return;
        const health = memoryBridge.getHealth();
        const allStatus = memoryBridge.getStatus();
        const lastOk = allStatus.filter((s) => s.last_success).length;
        statusEl.textContent =
          `${health.backends_configured} backends configurés · ${lastOk}/${allStatus.length} dernier sync OK`;
      };
      refreshStatus();
      syncBtn?.addEventListener('click', () => {
        void (async () => {
          if (syncBtn) syncBtn.disabled = true;
          const results = await memoryBridge.runAutoSync();
          const ok = results.filter((r) => r.ok).length;
          const { toast } = await import('../../ui/toast.js');
          if (results.length === 0) toast.warn('Aucun backend configuré');
          else if (ok === results.length) toast.success(`Sync OK (${ok}/${results.length})`);
          else toast.warn(`Sync partielle (${ok}/${results.length})`);
          refreshStatus();
          if (syncBtn) syncBtn.disabled = false;
        })();
      });
    } catch (err: unknown) {
      logger.warn('feature-settings', 'memory-bridge wire failed', { err });
    }
  })();
  /* Sprint 8 v13.0.71 : Wire consumption-anomaly-detector (Kevin demande conso temps réel) */
  rootEl.querySelector<HTMLButtonElement>('#ax-conso-scan')?.addEventListener('click', () => {
    void (async () => {
      try {
        const { consumptionAnomalyDetector } = await import('../../services/consumption-anomaly-detector.js');
        const reports = consumptionAnomalyDetector.scanAllVerbose();
        const out = rootEl.querySelector<HTMLDivElement>('#ax-conso-results');
        if (!out) return;
        out.innerHTML = reports.map((r) => {
          const color = r.severity === 'critical' ? '#ff4444'
            : r.severity === 'high' ? '#ff8844'
            : r.severity === 'medium' ? '#ffaa00'
            : r.severity === 'low' ? '#88aaff' : '#22cc77';
          const icon = r.severity === 'critical' ? '🚨'
            : r.severity === 'high' ? '⚠️'
            : r.severity === 'medium' ? '🟡'
            : r.severity === 'low' ? '🔵' : '✅';
          return `<div style="background:rgba(255,255,255,0.03);border-left:3px solid ${color};padding:8px 12px;margin-top:6px;border-radius:4px">
            <strong style="color:${color}">${icon} ${r.service}</strong>
            <div style="font-size:12px;color:var(--ax-text-dim);margin-top:4px">${r.reason}</div>
            <div style="font-size:11px;margin-top:4px">${r.recommended_action}</div>
            ${r.recharge_url ? `<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><a href="${r.recharge_url}" target="_blank" rel="noopener" style="color:#c9a227;font-size:11px">💳 Recharge →</a> <a href="${r.rotate_url}" target="_blank" rel="noopener" style="color:#c9a227;font-size:11px">🔄 Rotate →</a></div>` : ''}
          </div>`;
        }).join('');
      } catch (err: unknown) {
        logger.warn('feature-settings', 'conso scan failed', { err });
      }
    })();
  });
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
