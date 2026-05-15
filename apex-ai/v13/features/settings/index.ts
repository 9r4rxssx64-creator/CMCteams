/**
 * APEX v13 — Feature Settings (réglages utilisateur).
 * Stub Sprint 2 P0 — sera enrichi avec parité v12.785 vSettings.
 */

import { createCleanupScope, type CleanupScope } from '../../core/listener-cleanup.js';
import { logger } from '../../core/logger.js';
import { store } from '../../core/store.js';
import { cspStyleHelper } from '../../services/csp-style-helper.js';

/* P1-6 (audit v13.2.7) : scope listeners pour anti-leak SPA navigation. */
let activeSettingsScope: CleanupScope | null = null;

export function dispose(): void {
  activeSettingsScope?.cleanup();
  activeSettingsScope = null;
}

function escapeHtmlSafe(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

const AUTO_READ_KEY = 'apex_v13_chat_auto_read';

function isAutoReadEnabled(): boolean {
  try {
    return localStorage.getItem(AUTO_READ_KEY) === '1';
  } catch {
    return false;
  }
}

function setAutoReadEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(AUTO_READ_KEY, enabled ? '1' : '0');
  } catch {
    /* ignore quota */
  }
}

interface VoiceListItem {
  readonly id: string;
  readonly name: string;
  readonly emoji?: string;
  readonly category: 'pro' | 'fun' | 'thematic';
  readonly description?: string;
}

/**
 * Wire la section Voice : auto-read toggle, liste 60+ voix avec
 * Test ▶ + Définir comme défaut. Lazy-load voice service.
 *
 * Exposé pour tests.
 */
export async function wireVoiceSection(rootEl: HTMLElement): Promise<void> {
  try {
    const voiceMod = await import('../../services/voice.js');
    const { listVoices, getActiveVoice, setActiveVoice, speak, stopAll } = voiceMod;

    const autoReadInput = rootEl.querySelector<HTMLInputElement>('#ax-settings-auto-read');
    const currentEl = rootEl.querySelector<HTMLDivElement>('#ax-voice-current');
    const listEl = rootEl.querySelector<HTMLDivElement>('#ax-voice-list');
    const catBtns = rootEl.querySelectorAll<HTMLButtonElement>('.ax-voice-cat-btn');
    if (!listEl) return;

    /* Init auto-read toggle */
    if (autoReadInput) {
      autoReadInput.checked = isAutoReadEnabled();
      activeSettingsScope!.bind(autoReadInput, 'change', () => {
        setAutoReadEnabled(autoReadInput.checked);
        void (async () => {
          const { toast } = await import('../../ui/toast.js');
          toast.success(autoReadInput.checked ? 'Lecture auto activée' : 'Lecture auto désactivée');
        })();
      });
    }

    /* Affiche voix active */
    const refreshCurrent = (): void => {
      if (!currentEl) return;
      const id = getActiveVoice();
      const list = listVoices() as readonly VoiceListItem[];
      const v = list.find((x) => x.id === id);
      currentEl.textContent = v ? `Voix active : ${v.emoji ?? '🔊'} ${v.name} (${v.category})` : `Voix active : ${id}`;
    };
    refreshCurrent();

    /* Render liste filtrée */
    const renderList = (filter: 'all' | 'pro' | 'fun' | 'thematic'): void => {
      const list = listVoices() as readonly VoiceListItem[];
      const filtered = filter === 'all' ? list : list.filter((v) => v.category === filter);
      const activeId = getActiveVoice();
      listEl.innerHTML = filtered
        .map((v) => {
          const isActive = v.id === activeId;
          const emoji = v.emoji ?? (v.category === 'pro' ? '🎙️' : v.category === 'fun' ? '🎉' : '🎨');
          const desc = v.description ? escapeHtmlSafe(v.description) : '';
          const activeBg = isActive
            ? 'background:rgba(232,184,48,0.15);border-color:rgba(232,184,48,0.45)'
            : 'background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.06)';
          return `
            <div class="ax-voice-item" data-voice-id="${escapeHtmlSafe(v.id)}" style="display:flex;align-items:center;gap:8px;padding:10px;margin-bottom:6px;border:1px solid;border-radius:8px;${activeBg}">
              <span style="font-size:18px">${emoji}</span>
              <div style="flex:1;min-width:0">
                <div style="color:#fff;font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtmlSafe(v.name)}${isActive ? ' <span style="color:#e8b830;font-size:11px">★ active</span>' : ''}</div>
                <div style="color:rgba(255,255,255,0.5);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtmlSafe(v.category)}${desc ? ' · ' + desc : ''}</div>
              </div>
              <button class="ax-voice-test-btn" data-test-voice="${escapeHtmlSafe(v.id)}" title="Tester cette voix" aria-label="Tester ${escapeHtmlSafe(v.name)}" style="min-width:44px;min-height:44px;width:44px;height:44px;border-radius:8px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.3);cursor:pointer;font-size:14px">▶</button>
              <button class="ax-voice-set-btn" data-set-voice="${escapeHtmlSafe(v.id)}" title="Définir comme voix par défaut" aria-label="Définir ${escapeHtmlSafe(v.name)} par défaut" style="min-width:44px;min-height:44px;width:44px;height:44px;border-radius:8px;background:rgba(232,184,48,0.15);color:#e8b830;border:1px solid rgba(232,184,48,0.3);cursor:pointer;font-size:14px">★</button>
            </div>
          `;
        })
        .join('');
    };
    renderList('all');

    /* Wire boutons catégorie */
    catBtns.forEach((btn) => {
      activeSettingsScope!.bind(btn, 'click', () => {
        const cat = btn.getAttribute('data-cat') as 'all' | 'pro' | 'fun' | 'thematic' | null;
        if (cat) renderList(cat);
      });
    });

    /* Event delegation pour boutons test ▶ + définir comme défaut */
    activeSettingsScope!.bind(listEl, 'click', (e) => {
      const target = e.target as HTMLElement;
      const testBtn = target.closest('[data-test-voice]') as HTMLButtonElement | null;
      const setBtn = target.closest('[data-set-voice]') as HTMLButtonElement | null;

      if (testBtn) {
        const id = testBtn.getAttribute('data-test-voice');
        if (!id) return;
        void (async () => {
          stopAll();
          const r = await speak('Bonjour Kevin, je suis ta voix.', id);
          if (!r.ok) {
            const { toast } = await import('../../ui/toast.js');
            toast.warn(`Test échoué : ${r.reason ?? 'erreur'}`);
          }
        })();
        return;
      }

      if (setBtn) {
        const id = setBtn.getAttribute('data-set-voice');
        if (!id) return;
        void (async () => {
          await setActiveVoice(id);
          refreshCurrent();
          /* Re-render avec nouvelle active */
          const activeFilter = (rootEl.querySelector<HTMLButtonElement>('.ax-voice-cat-btn[data-cat]:focus')?.getAttribute('data-cat') ?? 'all') as 'all' | 'pro' | 'fun' | 'thematic';
          renderList(activeFilter);
          const { toast } = await import('../../ui/toast.js');
          const list = listVoices() as readonly VoiceListItem[];
          const v = list.find((x) => x.id === id);
          toast.success(v ? `Voix par défaut : ${v.name}` : 'Voix mise à jour');
        })();
      }
    });
  } catch (err: unknown) {
    logger.warn('feature-settings', 'wireVoiceSection failed', { err });
  }
}

export function render(rootEl: HTMLElement): void {
  /* P1-6 : cleanup ancien scope avant re-render */
  activeSettingsScope?.cleanup();
  activeSettingsScope = createCleanupScope('settings');
  const user = store.get('user');
  const isAdmin = (store.get('isAdmin') as boolean | undefined) ?? false;
  /* Premium settings sections with glass + lift hover + section icon */
  const sectionStyle = 'background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;margin-top:14px;transition:all 240ms cubic-bezier(0.16,1,0.3,1)';
  const sectionHeaderStyle = 'margin:0 0 12px;font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.01em;display:flex;align-items:center;gap:10px';
  const iconBadgeStyle = 'display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:linear-gradient(135deg,rgba(232,184,48,0.2),rgba(201,162,39,0.08));border:1px solid rgba(232,184,48,0.25);border-radius:10px;font-size:16px';
  const btnFullWidthStyle = 'width:100%;min-height:44px;padding:12px 16px;font-size:14px;font-weight:600;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1)';

  rootEl.innerHTML = cspStyleHelper.withNonce(`
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
        <button class="ax-btn ax-btn-secondary" id="ax-zoom-inspector-btn" style="${btnFullWidthStyle};margin-top:10px;background:rgba(201,162,39,0.15);color:#c9a227;border:1px solid rgba(201,162,39,0.3)">🔍 Zoom Inspector live (debug UX zoom Kevin)</button>
        <button class="ax-btn ax-btn-secondary" id="ax-cf-diagnostic-btn" style="${btnFullWidthStyle};margin-top:10px;background:rgba(247,131,34,0.15);color:#f78322;border:1px solid rgba(247,131,34,0.3)">☁️ Tester Cloudflare API maintenant</button>
        <div id="ax-cf-diagnostic-results" style="margin-top:8px;font-size:12px"></div>
      </section>

      <section class="ax-modernized-card" style="${sectionStyle};animation-delay:240ms">
        <h2 style="${sectionHeaderStyle}"><span style="${iconBadgeStyle}">🔊</span> Voix &amp; Lecture</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Apex peut lire ses réponses à voix haute. Choisis ta voix préférée parmi 60+ (PRO, FUN, Thématique).
        </p>
        <label style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px;margin-bottom:10px;cursor:pointer">
          <span style="color:rgba(255,255,255,0.7);font-size:14px">Lire automatiquement les réponses</span>
          <input type="checkbox" id="ax-settings-auto-read" aria-label="Lire automatiquement les réponses à voix haute" style="width:20px;height:20px;cursor:pointer">
        </label>
        <div id="ax-voice-current" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace">Voix active : ...</div>
        <div id="ax-voice-categories" style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
          <button class="ax-btn ax-btn-secondary ax-voice-cat-btn" data-cat="all" style="padding:6px 12px;font-size:12px;border-radius:14px;background:rgba(232,184,48,0.15);color:#e8b830;border:1px solid rgba(232,184,48,0.3);cursor:pointer">Tous</button>
          <button class="ax-btn ax-btn-secondary ax-voice-cat-btn" data-cat="pro" style="padding:6px 12px;font-size:12px;border-radius:14px;background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3);cursor:pointer">PRO</button>
          <button class="ax-btn ax-btn-secondary ax-voice-cat-btn" data-cat="fun" style="padding:6px 12px;font-size:12px;border-radius:14px;background:rgba(255,170,0,0.15);color:#ffaa00;border:1px solid rgba(255,170,0,0.3);cursor:pointer">FUN</button>
          <button class="ax-btn ax-btn-secondary ax-voice-cat-btn" data-cat="thematic" style="padding:6px 12px;font-size:12px;border-radius:14px;background:rgba(160,96,255,0.15);color:#a060ff;border:1px solid rgba(160,96,255,0.3);cursor:pointer">Thématique</button>
        </div>
        <div id="ax-voice-list" style="max-height:360px;overflow-y:auto;background:rgba(0,0,0,0.2);border-radius:10px;padding:8px"></div>
      </section>

      <section class="ax-modernized-card" style="${sectionStyle};animation-delay:250ms">
        <h2 style="${sectionHeaderStyle}"><span style="${iconBadgeStyle}">🧰</span> Suggestions outils</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Quand Apex détecte un outil pertinent dans tes messages (Studio Music, Finance Pro, etc.), il l'affiche directement dans le chat en plus du toast.
        </p>
        <label style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:10px;cursor:pointer">
          <span style="color:rgba(255,255,255,0.85);font-size:14px">Cards outils dans le chat</span>
          <input type="checkbox" id="ax-settings-tools-auto-embed" aria-label="Afficher cards outils dans le chat" style="width:20px;height:20px;cursor:pointer">
        </label>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.4);font-size:12px;line-height:1.4">Décoche pour n'avoir que le toast (5s) sans card permanente. Le bouton ✕ sur chaque card permet aussi de la fermer.</p>
      </section>

      <section class="ax-modernized-card" style="${sectionStyle};animation-delay:260ms">
        <h2 style="${sectionHeaderStyle}"><span style="${iconBadgeStyle}">🔄</span> Mise à jour</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Si Apex reste bloqué sur une ancienne version malgré le reload (bug Safari iOS PWA cache), force le reset complet : Service Worker + caches + reload propre vers la dernière version.
        </p>
        <div id="ax-force-update-status" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-force-update-btn" style="${btnFullWidthStyle};background:rgba(232,184,48,0.15);color:#e8b830;border:1px solid rgba(232,184,48,0.3)">🔄 Force reset PWA + reload</button>
      </section>

      <section class="ax-modernized-card" style="${sectionStyle};animation-delay:280ms">
        <h2 style="${sectionHeaderStyle}"><span style="${iconBadgeStyle}">🔐</span> Compte</h2>
        <button class="ax-btn ax-btn-danger" id="ax-settings-logout" style="${btnFullWidthStyle};background:rgba(255,91,91,0.15);color:#ff5b5b;border:1px solid rgba(255,91,91,0.3)">🚪 Se déconnecter</button>
      </section>

      <p style="margin-top:32px;text-align:center"><a href="#chat" style="color:#e8b830;text-decoration:none;font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:rgba(232,184,48,0.08);border-radius:24px;border:1px solid rgba(232,184,48,0.2);transition:all 200ms">← Retour chat</a></p>
    </div>
  `);
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
      if (syncBtn && activeSettingsScope) activeSettingsScope.bind(syncBtn, 'click', () => {
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
  const consoBtn = rootEl.querySelector<HTMLButtonElement>('#ax-conso-scan');
  if (consoBtn && activeSettingsScope) activeSettingsScope.bind(consoBtn, 'click', () => {
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

  /* v13.4.111 — Zoom Inspector live (Kevin "UX zoom encore" 8e fois). */
  const zoomBtn = rootEl.querySelector<HTMLButtonElement>('#ax-zoom-inspector-btn');
  if (zoomBtn && activeSettingsScope) {
    activeSettingsScope.bind(zoomBtn, 'click', () => {
      void (async () => {
        const { apexZoomInspector } = await import('../../services/apex-zoom-inspector.js');
        if (apexZoomInspector.isVisible()) {
          apexZoomInspector.hide();
        } else {
          apexZoomInspector.show();
        }
      })();
    });
  }

  /* v13.4.120 (Kevin "verifie maintenant avant d'etre bloque") :
   * Bouton manuel diagnostic Cloudflare API. Run on-demand + affiche
   * resultat detaille des 6 checks dans la div ax-cf-diagnostic-results. */
  const cfDiagBtn = rootEl.querySelector<HTMLButtonElement>('#ax-cf-diagnostic-btn');
  if (cfDiagBtn && activeSettingsScope) {
    activeSettingsScope.bind(cfDiagBtn, 'click', () => {
      void (async () => {
        const resultsEl = rootEl.querySelector<HTMLDivElement>('#ax-cf-diagnostic-results');
        if (!resultsEl) return;
        resultsEl.innerHTML = '<div style="color:#f78322">⏳ Test Cloudflare API en cours...</div>';
        try {
          const { apexCloudflareVaultDeploy } = await import('../../services/apex-cloudflare-vault-deploy.js');
          const diag = await apexCloudflareVaultDeploy.runDiagnostic();
          const row = (label: string, ok: boolean, detail?: string): string => `
            <div style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px">
              <span style="color:${ok ? '#22cc77' : '#ff5b5b'};font-weight:700">${ok ? '✅' : '❌'}</span>
              <span style="flex:1;color:rgba(255,255,255,0.85)">${label}</span>
              ${detail ? `<span style="color:rgba(255,255,255,0.5);font-size:11px">${detail}</span>` : ''}
            </div>`;
          let html = '<div style="background:rgba(15,15,25,0.8);border:1px solid rgba(247,131,34,0.3);border-radius:10px;padding:12px;margin-top:10px">';
          html += '<div style="color:#f78322;font-weight:700;margin-bottom:8px">☁️ Diagnostic Cloudflare</div>';
          html += row('Token Cloudflare présent', diag.token_present);
          html += row('Token valide (HTTP 200)', diag.token_valid, diag.http_status ? `HTTP ${diag.http_status}` : '');
          html += row('Account ID accessible', !!diag.account_id, diag.account_name ?? diag.account_id ?? '');
          html += row('Permission KV (Workers KV Storage:Edit)', diag.kv_permission, diag.namespace_id ? `ns ${diag.namespace_id.slice(0, 8)}…` : '');
          html += row('Permission Workers (auto-deploy futur)', diag.workers_permission);
          html += row('Namespace apex-vault-kevin existe', diag.namespace_exists);
          if (diag.error_reason) {
            html += `<div style="margin-top:10px;padding:8px;background:rgba(255,91,91,0.1);border-left:3px solid #ff5b5b;color:#ff5b5b;font-size:12px;border-radius:4px">${diag.error_reason}</div>`;
          }
          if (diag.fix_url) {
            html += `<div style="margin-top:8px"><a href="${diag.fix_url}" target="_blank" rel="noopener" style="color:#6a8aff;font-size:12px">🔗 Fix : ${diag.fix_url}</a></div>`;
          }
          html += '</div>';
          resultsEl.innerHTML = html;
          logger.info('cf-diag-manual', `Diagnostic result : token=${diag.token_valid} kv=${diag.kv_permission} workers=${diag.workers_permission}`);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          /* v13.4.133 audit-grade : DOM API (msg pourrait contenir HTML user-controlled) */
          resultsEl.textContent = '';
          const errDiv = document.createElement('div');
          errDiv.style.color = '#ff5b5b';
          errDiv.textContent = `❌ Erreur : ${msg.slice(0, 100)}`;
          resultsEl.append(errDiv);
        }
      })();
    });
  }

  /* Wire new data-nav-route buttons (CSP strict, no inline onclick) */
  rootEl.querySelectorAll<HTMLElement>('[data-nav-route]').forEach((el) => {
    activeSettingsScope!.bind(el, 'click', () => {
      const route = el.getAttribute('data-nav-route');
      if (route) location.hash = '#' + route;
    });
  });
  const logoutBtn = rootEl.querySelector<HTMLButtonElement>('#ax-settings-logout');
  if (logoutBtn && activeSettingsScope) activeSettingsScope.bind(logoutBtn, 'click', () => {
    void (async () => {
      const { auth } = await import('../../services/auth.js');
      auth.logout();
      location.hash = '#login';
    })();
  });

  /* Toggle "tools auto embed in chat" — Kevin bug "modules apparaissent tout seuls" 2026-05-07 */
  const toolsAutoEmbedToggle = rootEl.querySelector<HTMLInputElement>('#ax-settings-tools-auto-embed');
  if (toolsAutoEmbedToggle && activeSettingsScope) {
    try {
      const settings = JSON.parse(localStorage.getItem('ax_settings') ?? '{}') as Record<string, unknown>;
      toolsAutoEmbedToggle.checked = settings['tools_auto_embed'] !== false; /* default true */
    } catch { toolsAutoEmbedToggle.checked = true; }
    activeSettingsScope.bind(toolsAutoEmbedToggle, 'change', () => {
      try {
        const settings = JSON.parse(localStorage.getItem('ax_settings') ?? '{}') as Record<string, unknown>;
        settings['tools_auto_embed'] = toolsAutoEmbedToggle.checked;
        localStorage.setItem('ax_settings', JSON.stringify(settings));
      } catch { /* silent */ }
    });
  }

  /* Force update PWA — fix bug Safari iOS cache tenace (Kevin 2026-05-07) */
  const forceUpdateBtn = rootEl.querySelector<HTMLButtonElement>('#ax-force-update-btn');
  const forceUpdateStatus = rootEl.querySelector<HTMLElement>('#ax-force-update-status');
  if (forceUpdateBtn && activeSettingsScope) activeSettingsScope.bind(forceUpdateBtn, 'click', () => {
    void (async () => {
      const updateStatus = (msg: string): void => {
        if (forceUpdateStatus) forceUpdateStatus.textContent = msg;
      };
      forceUpdateBtn.disabled = true;
      forceUpdateBtn.textContent = '⏳ Reset en cours…';
      try {
        updateStatus('🔍 Désinstallation Service Workers…');
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const r of regs) await r.unregister();
          updateStatus(`✅ ${regs.length} SW désinstallés`);
        }
        updateStatus('🔍 Vidage caches PWA…');
        if ('caches' in window) {
          const keys = await caches.keys();
          for (const k of keys) await caches.delete(k);
          updateStatus(`✅ ${keys.length} caches vidés`);
        }
        updateStatus('✅ Reset terminé. Rechargement dans 2s…');
        const { toast } = await import('../../ui/toast.js');
        toast.info('🔄 Reset OK — reload imminent');
        setTimeout(() => {
          location.href = location.pathname + '?_forceupd=1&_reset=' + Date.now();
        }, 2000);
      } catch (err) {
        updateStatus(`❌ Erreur : ${String(err)}`);
        forceUpdateBtn.disabled = false;
        forceUpdateBtn.textContent = '🔄 Force reset PWA + reload';
      }
    })();
  });
  /* Wire voice section : auto-read toggle + voice list (61 voix) + test ▶ + définir comme défaut.
     Demande Kevin : "qu'il puisse me lire les choses, me raconter etc, que je choisisse les voix". */
  void wireVoiceSection(rootEl);

  const notifBtn = rootEl.querySelector<HTMLButtonElement>('#ax-settings-notif-test');
  if (notifBtn && activeSettingsScope) activeSettingsScope.bind(notifBtn, 'click', () => {
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
