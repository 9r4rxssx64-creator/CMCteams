/**
 * APEX v13 — Feature Settings (réglages utilisateur).
 * Stub Sprint 2 P0 — sera enrichi avec parité v12.785 vSettings.
 */

import { logger } from '../../core/logger.js';
import { store } from '../../core/store.js';

function escapeHtmlSafe(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

export function render(rootEl: HTMLElement): void {
  const user = store.get('user');
  const isAdmin = (store.get('isAdmin') as boolean | undefined) ?? false;
  /* Premium settings sections with glass + lift hover + section icon */
  const sectionStyle = 'background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;margin-top:14px;transition:all 240ms cubic-bezier(0.16,1,0.3,1)';
  const sectionHeaderStyle = 'margin:0 0 12px;font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.01em;display:flex;align-items:center;gap:10px';
  const iconBadgeStyle = 'display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:linear-gradient(135deg,rgba(232,184,48,0.2),rgba(201,162,39,0.08));border:1px solid rgba(232,184,48,0.25);border-radius:10px;font-size:16px';
  const btnFullWidthStyle = 'width:100%;min-height:44px;padding:12px 16px;font-size:14px;font-weight:600;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1)';

  rootEl.innerHTML = `
    <style>
      @keyframes ax-fade-up {
        0% { opacity: 0; transform: translateY(12px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .ax-modernized-card { animation: ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) backwards; }
      .ax-modernized-card:hover {
        transform: translateY(-2px);
        border-color: rgba(232,184,48,0.25) !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      }
      @media (prefers-reduced-motion: reduce) {
        .ax-modernized-card { animation: none !important; transition: none !important; }
        .ax-modernized-card:hover { transform: none !important; }
      }
    </style>
    <div class="ax-page" style="padding:24px 16px max(24px, env(safe-area-inset-bottom)) 16px;max-width:680px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif">
      <header style="margin-bottom:24px;animation:ax-fade-up 360ms cubic-bezier(0.16,1,0.3,1) backwards">
        <h1 style="margin:0 0 6px;font-size:clamp(26px,4.5vw,32px);font-weight:700;background:linear-gradient(135deg,#c9a227 0%,#e8b830 50%,#f5cc4a 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:Georgia,serif;letter-spacing:-0.025em">⚙️ Réglages</h1>
        <p style="color:rgba(255,255,255,0.55);margin:0;font-size:14px">Utilisateur : <strong style="color:rgba(255,255,255,0.9)">${escapeHtmlSafe(user?.name ?? 'inconnu')}</strong> ${isAdmin ? '<span style="color:#e8b830">👑 Admin</span>' : ''}</p>
      </header>

      <section class="ax-modernized-card" style="${sectionStyle};animation-delay:60ms">
        <h2 style="${sectionHeaderStyle}"><span style="${iconBadgeStyle}">🔑</span> Clés API</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">Gère tes clés API (Anthropic, OpenAI, Stripe, etc.) dans le Coffre sécurisé.</p>
        <button class="ax-btn ax-btn-primary" data-nav-route="vault" style="${btnFullWidthStyle};background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none">🔐 Ouvrir le Coffre</button>
      </section>

      <section class="ax-modernized-card" style="${sectionStyle};animation-delay:100ms">
        <h2 style="${sectionHeaderStyle}"><span style="${iconBadgeStyle}">🎨</span> Apparence</h2>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px">
          <span style="color:rgba(255,255,255,0.7);font-size:14px">Thème actuel</span>
          <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(232,184,48,0.12);color:#e8b830;border-radius:24px;font-size:12px;font-weight:700;letter-spacing:0.04em">
            <span style="width:8px;height:8px;background:#e8b830;border-radius:50%;box-shadow:0 0 10px #e8b830"></span> DARK
          </span>
        </div>
      </section>

      <section class="ax-modernized-card" style="${sectionStyle};animation-delay:140ms">
        <h2 style="${sectionHeaderStyle}"><span style="${iconBadgeStyle}">🔔</span> Notifications</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">Active les notifications push pour rester informé en temps réel.</p>
        <button class="ax-btn ax-btn-secondary" id="ax-settings-notif-test" style="${btnFullWidthStyle};background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3)">🔔 Tester notification push</button>
      </section>

      <section class="ax-modernized-card" style="${sectionStyle};animation-delay:180ms">
        <h2 style="${sectionHeaderStyle}"><span style="${iconBadgeStyle}">🧠</span> Mémoire externe</h2>
        <p style="margin:0 0 10px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Backup mémoire vers Notion / GitHub Gist / Firebase. Tokens lus depuis le Coffre.
        </p>
        <div id="ax-memory-bridge-status" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-memory-bridge-sync" style="${btnFullWidthStyle};background:rgba(160,96,255,0.15);color:#a060ff;border:1px solid rgba(160,96,255,0.3)">🔄 Sync maintenant</button>
      </section>

      <section class="ax-modernized-card" style="${sectionStyle};animation-delay:220ms">
        <h2 style="${sectionHeaderStyle}"><span style="${iconBadgeStyle}">📊</span> Conso API temps réel</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Apex surveille ta conso et détecte si une clé est utilisée anormalement (potentielle compromission).
        </p>
        <button class="ax-btn ax-btn-secondary" id="ax-conso-scan" style="${btnFullWidthStyle};margin-bottom:10px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.3)">🔍 Scanner toutes mes API maintenant</button>
        <div id="ax-conso-results" style="margin-top:12px;font-size:13px"></div>
      </section>

      <section class="ax-modernized-card" style="${sectionStyle};animation-delay:260ms">
        <h2 style="${sectionHeaderStyle}"><span style="${iconBadgeStyle}">🔐</span> Compte</h2>
        <button class="ax-btn ax-btn-danger" id="ax-settings-logout" style="${btnFullWidthStyle};background:rgba(255,91,91,0.15);color:#ff5b5b;border:1px solid rgba(255,91,91,0.3)">🚪 Se déconnecter</button>
      </section>

      <p style="margin-top:32px;text-align:center"><a href="#chat" style="color:#e8b830;text-decoration:none;font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:rgba(232,184,48,0.08);border-radius:24px;border:1px solid rgba(232,184,48,0.2);transition:all 200ms">← Retour chat</a></p>
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
  /* Wire new data-nav-route buttons (CSP strict, no inline onclick) */
  rootEl.querySelectorAll<HTMLElement>('[data-nav-route]').forEach((el) => {
    el.addEventListener('click', () => {
      const route = el.getAttribute('data-nav-route');
      if (route) location.hash = '#' + route;
    });
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
