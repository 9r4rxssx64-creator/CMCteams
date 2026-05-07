/**
 * APEX v13 — Vue admin Credentials Registry (Kevin demande 2026-05-04 P0).
 *
 * "Vérifie que toutes les clés/codes sont sécurisés, mémorisés, sauvegardés."
 *
 * Vue admin-only qui affiche dashboard live de tous les credentials :
 *  - Score sécurité 0-100 (encrypted/configured + Firebase backup)
 *  - Liste 88+ patterns avec status (ok/missing/corrupted)
 *  - Bouton "Tester" par credential (ping API live)
 *  - Bouton "Recharger" → ouvre dashboard URL externe
 *  - Recommandations actionables (clés manquantes, alertes channels, etc.)
 *  - Filtres par catégorie (ai/banking/payment/...)
 *
 * Sécurité :
 *  - Admin only (store.get('isAdmin') strict)
 *  - JAMAIS de valeur en clair affichée — preview masquée seulement
 *  - listener-cleanup scope (anti-leak SPA)
 */

import { logger } from '../../core/logger.js';
import { createCleanupScope, type CleanupScope } from '../../core/listener-cleanup.js';
import { escapeHtml } from '../../core/html-safe.js';
import { store } from '../../core/store.js';
import { credentialsAudit, type CredentialAuditEntry, type CredentialsAuditReport } from '../../services/credentials-audit.js';
import { haptic } from '../../ui/haptic.js';
import { toast } from '../../ui/toast.js';

let activeRegistryScope: CleanupScope | null = null;
let currentReport: CredentialsAuditReport | null = null;
let currentCategoryFilter: string = 'all';

export function dispose(): void {
  activeRegistryScope?.cleanup();
  activeRegistryScope = null;
}

const STATUS_COLORS = {
  ok: { color: '#22cc77', icon: '🟢', label: 'OK' },
  missing: { color: '#888', icon: '⚪', label: 'Non config' },
  corrupted: { color: '#ff6b6b', icon: '🔴', label: 'Corrompu' },
  expired: { color: '#ffaa00', icon: '🟠', label: 'Expiré' },
  unknown: { color: '#aaa', icon: '❓', label: 'Inconnu' },
} as const;

const CATEGORY_LABELS: Record<string, string> = {
  all: 'Tous',
  ai: '🤖 IA',
  banking: '🏦 Banque',
  payment: '💳 Paiement',
  social: '📱 Social',
  email: '📧 Email',
  crypto: '₿ Crypto',
  hosting: '☁️ Hosting',
  productivity: '📋 Productivité',
  forbidden: '⚠️ Forbidden',
};

export async function render(rootEl: HTMLElement): Promise<void> {
  const isAdmin = store.get('isAdmin') === true;
  if (!isAdmin) {
    rootEl.innerHTML = `
      <div style="padding:40px;text-align:center;color:#999">
        <h2 style="color:#c9a227">Accès admin uniquement</h2>
        <p>Cette section est réservée à Kevin.</p>
      </div>
    `;
    return;
  }

  /* Cleanup ancien scope */
  activeRegistryScope?.cleanup();
  activeRegistryScope = createCleanupScope('credentials-registry');

  /* Loading state */
  rootEl.innerHTML = `
    <div style="padding:40px;text-align:center;color:var(--ax-text-dim)">
      <p>🔍 Audit credentials en cours...</p>
    </div>
  `;

  /* Run audit (async, peut prendre 1-2s) */
  try {
    currentReport = await credentialsAudit.runFullAudit();
  } catch (err: unknown) {
    logger.error('credentials-registry', 'audit failed', { err });
    rootEl.innerHTML = `<div style="padding:40px;color:#ff6b6b">Erreur audit : ${escapeHtml(String(err))}</div>`;
    return;
  }

  renderReport(rootEl, currentReport);
}

function renderReport(rootEl: HTMLElement, report: CredentialsAuditReport): void {
  const score = report.security_score;
  const scoreColor = score >= 80 ? '#22cc77' : score >= 60 ? '#ffaa00' : '#ff6b6b';

  /* Filtre catégorie */
  const filtered = currentCategoryFilter === 'all'
    ? report.entries
    : report.entries.filter((e) => e.category === currentCategoryFilter);

  /* Tri : configurés d'abord, puis par catégorie */
  const sorted = [...filtered].sort((a, b) => {
    if (a.configured !== b.configured) return a.configured ? -1 : 1;
    return a.service_name.localeCompare(b.service_name);
  });

  /* Catégories disponibles avec compteurs */
  const catCounts = new Map<string, number>();
  catCounts.set('all', report.entries.length);
  for (const e of report.entries) {
    catCounts.set(e.category, (catCounts.get(e.category) ?? 0) + 1);
  }

  const categoryChips = [...catCounts.entries()]
    .filter(([cat]) => cat === 'all' || (CATEGORY_LABELS[cat] && (catCounts.get(cat) ?? 0) > 0))
    .map(([cat, count]) => {
      const isActive = currentCategoryFilter === cat;
      const label = CATEGORY_LABELS[cat] ?? cat;
      return `<button data-cat="${escapeHtml(cat)}" class="ax-cat-chip" style="
        padding:8px 14px;border-radius:20px;border:1px solid ${isActive ? '#c9a227' : 'rgba(255,255,255,0.15)'};
        background:${isActive ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.03)'};
        color:${isActive ? '#c9a227' : 'var(--ax-text-dim)'};
        cursor:pointer;font-size:13px;margin:4px;font-weight:${isActive ? '600' : '400'}
      ">${escapeHtml(label)} (${count})</button>`;
    }).join('');

  const recommendations = report.recommendations.length === 0
    ? '<p style="color:#22cc77;margin:0">✅ Aucune recommandation — config saine</p>'
    : report.recommendations.map((r) => `<li style="margin:8px 0;color:#ffaa00">${escapeHtml(r)}</li>`).join('');

  const credentialsList = sorted.length === 0
    ? '<p style="color:var(--ax-text-dim);text-align:center;padding:24px">Aucun credential dans cette catégorie</p>'
    : sorted.map((e) => renderEntry(e)).join('');

  rootEl.innerHTML = `
    <div class="ax-page" style="padding:16px;max-width:960px;margin:0 auto">
      <header style="margin-bottom:24px">
        <h1 style="margin:0 0 8px;color:#c9a227">🔐 Coffre — Audit credentials</h1>
        <p style="color:var(--ax-text-dim);margin:0;font-size:13px">
          ${report.total_patterns} patterns reconnus · ${report.configured_count} configurés ·
          ${report.encrypted_count} chiffrés AES-GCM-256 · ${report.firebase_backup_count} backup Firebase
        </p>
      </header>

      <!-- Security Score Card -->
      <div style="background:linear-gradient(135deg,rgba(201,162,39,0.1),rgba(201,162,39,0.02));
                  border:1px solid rgba(201,162,39,0.3);border-radius:14px;padding:20px;margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <div style="font-size:13px;color:var(--ax-text-dim)">Score sécurité credentials</div>
            <div style="font-size:42px;font-weight:700;color:${scoreColor};line-height:1">
              ${score.toFixed(0)}<span style="font-size:20px;color:var(--ax-text-dim)">/100</span>
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button id="ax-cred-refresh" class="ax-btn ax-btn-outline" style="padding:8px 14px">🔄 Refresh audit</button>
            <button id="ax-cred-test-channels" class="ax-btn ax-btn-outline" style="padding:8px 14px">📡 Test alertes</button>
          </div>
        </div>
      </div>

      <!-- Recommandations -->
      <div style="background:rgba(255,170,0,0.05);border:1px solid rgba(255,170,0,0.2);
                  border-radius:12px;padding:16px;margin-bottom:20px">
        <h3 style="margin:0 0 12px;color:#ffaa00;font-size:15px">💡 Recommandations</h3>
        <ul style="margin:0;padding-left:18px;font-size:13px">${recommendations}</ul>
      </div>

      <!-- Filtres catégorie -->
      <div style="margin-bottom:20px">
        <h3 style="margin:0 0 8px;color:var(--ax-text-dim);font-size:13px;text-transform:uppercase;letter-spacing:0.5px">
          Filtrer par catégorie
        </h3>
        <div style="display:flex;flex-wrap:wrap">${categoryChips}</div>
      </div>

      <!-- Liste credentials -->
      <div id="ax-cred-list">${credentialsList}</div>

      <p style="text-align:center;color:#666;font-size:11px;margin-top:24px">
        🔒 Coffre Apex v13 · AES-GCM-256 + PBKDF2 200k · Triple persistence (local+IDB+Firebase)
      </p>
    </div>
  `;

  attachHandlers(rootEl);
  logger.info('credentials-registry', `rendered : ${report.configured_count}/${report.total_patterns} configured, score=${score}`);
}

function renderEntry(e: CredentialAuditEntry): string {
  const status = STATUS_COLORS[e.status];
  const persistedIcons = [
    e.persisted.local ? '<span title="localStorage" style="color:#22cc77">💾</span>' : '<span title="pas en local" style="color:#666">·</span>',
    e.persisted.idb ? '<span title="IndexedDB shadow" style="color:#22cc77">🗄️</span>' : '<span title="pas en IDB" style="color:#666">·</span>',
    e.persisted.firebase ? '<span title="Firebase backup" style="color:#22cc77">☁️</span>' : '<span title="pas en Firebase" style="color:#666">·</span>',
  ].join(' ');

  return `
    <article style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);
                    border-radius:10px;padding:14px;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
        <div style="flex:1;min-width:200px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <strong style="color:#c9a227">${escapeHtml(e.service_name)}</strong>
            <span style="font-size:11px;padding:2px 6px;border-radius:8px;background:rgba(255,255,255,0.05);color:var(--ax-text-dim)">
              ${escapeHtml(e.category)}
            </span>
          </div>
          <code style="font-size:11px;color:var(--ax-text-dim);font-family:monospace">${escapeHtml(e.storage_key)}</code>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span style="color:${status.color};font-size:13px">${status.icon} ${status.label}</span>
          ${e.encrypted ? '<span style="color:#22cc77;font-size:11px" title="AES-GCM-256">🔒</span>' : ''}
          <span style="font-size:11px">${persistedIcons}</span>
          <code style="font-family:monospace;font-size:11px;color:var(--ax-text-dim);background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px">${escapeHtml(e.preview)}</code>
        </div>
      </div>
      ${e.status_detail ? `<p style="margin:6px 0 0;color:#ff6b6b;font-size:11px">⚠️ ${escapeHtml(e.status_detail)}</p>` : ''}
      <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
        ${e.configured ? `<button class="ax-btn ax-btn-sm" data-test="${escapeHtml(e.storage_key)}" style="font-size:11px;padding:4px 10px">🧪 Tester</button>` : ''}
        ${e.dashboard_url ? `<a href="${escapeHtml(e.dashboard_url)}" target="_blank" rel="noopener" class="ax-btn ax-btn-sm" style="font-size:11px;padding:4px 10px;text-decoration:none">🔗 Dashboard</a>` : ''}
        ${e.billing_url ? `<a href="${escapeHtml(e.billing_url)}" target="_blank" rel="noopener" class="ax-btn ax-btn-sm" style="font-size:11px;padding:4px 10px;text-decoration:none">💰 Recharger</a>` : ''}
      </div>
    </article>
  `;
}

function attachHandlers(rootEl: HTMLElement): void {
  if (!activeRegistryScope) return;

  /* Refresh */
  const refreshBtn = rootEl.querySelector<HTMLButtonElement>('#ax-cred-refresh');
  if (refreshBtn) {
    activeRegistryScope.bind(refreshBtn, 'click', () => {
      haptic.tap();
      void render(rootEl);
    });
  }

  /* Test channels */
  const testChannelsBtn = rootEl.querySelector<HTMLButtonElement>('#ax-cred-test-channels');
  if (testChannelsBtn) {
    activeRegistryScope.bind(testChannelsBtn, 'click', () => {
      haptic.tap();
      void (async () => {
        toast.info('📡 Test alertes en cours...');
        const { kevinAlerts } = await import('../../services/kevin-alerts.js');
        const r = await kevinAlerts.testAllChannels();
        const ok = Object.entries(r).filter(([, v]) => v).map(([k]) => k);
        if (ok.length === 0) {
          toast.warn('Aucun channel d\'alerte configuré');
        } else {
          toast.success(`✅ Channels OK : ${ok.join(', ')}`);
        }
      })();
    });
  }

  /* Catégorie filter chips */
  rootEl.querySelectorAll<HTMLButtonElement>('[data-cat]').forEach((btn) => {
    activeRegistryScope!.bind(btn, 'click', () => {
      currentCategoryFilter = btn.dataset['cat'] ?? 'all';
      haptic.selection();
      if (currentReport) renderReport(rootEl, currentReport);
    });
  });

  /* Test credential individuel */
  rootEl.querySelectorAll<HTMLButtonElement>('[data-test]').forEach((btn) => {
    activeRegistryScope!.bind(btn, 'click', () => {
      const key = btn.dataset['test'];
      if (!key) return;
      haptic.tap();
      void (async () => {
        const original = btn.textContent;
        btn.textContent = '⏳ Test...';
        btn.disabled = true;
        try {
          const r = await credentialsAudit.testCredential(key);
          if (r.valid === true) toast.success(`✅ ${key} : valide (${r.latency_ms}ms)`);
          else if (r.valid === false) toast.warn(`❌ ${key} : invalide`);
          else toast.info(`❓ ${key} : ${r.error ?? 'test impossible'}`);
        } catch (err: unknown) {
          toast.error(`Test failed : ${String(err).slice(0, 100)}`);
        } finally {
          btn.textContent = original ?? '🧪 Tester';
          btn.disabled = false;
        }
      })();
    });
  });
}
