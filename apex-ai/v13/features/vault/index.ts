/**
 * APEX v13 — Vue Coffre (Vault)
 *
 * Port v12 vVault : gestion secrets/credentials/API keys.
 * - Liste credentials masqués avec status (configured / encrypted / empty)
 * - CRUD : ajouter / modifier / supprimer / tester
 * - Auto-detect : paste → détecte type → store dans bonne clé
 * - Recharge links : bouton vers dashboard provider direct
 * - Sécurité : changer passphrase, audit log accès
 *
 * Anti-patterns évités :
 * - Pas d'innerHTML brut sur valeurs déchiffrées (escapeHtml)
 * - Toujours masque + jamais exposer plain text
 * - Confirm avant delete
 */

import { logger } from '../../core/logger.js';
import { store } from '../../core/store.js';
import { CREDENTIAL_PATTERNS, detectCredential, type CredentialPattern } from '../../services/credential-patterns.js';
import { vault } from '../../services/vault.js';
import { haptic } from '../../ui/haptic.js';
import { toast } from '../../ui/toast.js';

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

export interface VaultEntry {
  pattern: CredentialPattern;
  status: 'configured' | 'empty' | 'encrypted' | 'plaintext_legacy';
  masked: string;
}

/**
 * Construit la liste des credentials avec leur statut actuel (sync, fast).
 */
export function listVaultEntries(): VaultEntry[] {
  return CREDENTIAL_PATTERNS.filter((p) => p.category !== 'forbidden').map((p) => {
    const status = vault.getKeyStatus(p.storageKey);
    const raw = (() => {
      try {
        return localStorage.getItem(p.storageKey) ?? '';
      } catch {
        return '';
      }
    })();
    /* On masque sur le statut brut, jamais de déchiffrement ici (sync) */
    const masked = raw && raw.length > 8 && !raw.startsWith('AXENC1:')
      ? vault.maskKey(raw)
      : raw.startsWith('AXENC1:') ? '🔒 chiffré' : '';
    return { pattern: p, status, masked };
  });
}

/**
 * Filtre les entrées par catégorie (ai/saas/devops/etc.) ou statut.
 */
export function filterVaultEntries(
  entries: ReadonlyArray<VaultEntry>,
  filter: { category?: CredentialPattern['category']; configuredOnly?: boolean; query?: string },
): VaultEntry[] {
  return entries.filter((e) => {
    if (filter.category && e.pattern.category !== filter.category) return false;
    if (filter.configuredOnly && e.status === 'empty') return false;
    if (filter.query) {
      const q = filter.query.toLowerCase();
      const matches = e.pattern.name.toLowerCase().includes(q) || e.pattern.storageKey.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });
}

/**
 * Auto-detect + store credential.
 * Retourne { ok, pattern_name, storage_key } ou { ok:false, reason }.
 */
export async function autoDetectAndStore(
  input: string,
): Promise<{ ok: true; pattern_name: string; storage_key: string } | { ok: false; reason: string }> {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, reason: 'Entrée vide' };
  const detected = detectCredential(trimmed);
  if (!detected) return { ok: false, reason: 'Aucun pattern reconnu' };
  if (detected.category === 'forbidden') {
    return { ok: false, reason: '🚨 Type interdit (cartes/seed phrases jamais stockées)' };
  }
  try {
    const encrypted = await vault.encryptAuto(trimmed);
    localStorage.setItem(detected.storageKey, encrypted);
    return { ok: true, pattern_name: detected.name, storage_key: detected.storageKey };
  } catch (err: unknown) {
    logger.warn('vault-feature', 'autoDetectAndStore failed', { err });
    return { ok: false, reason: 'Erreur chiffrement' };
  }
}

/**
 * Removes credential from storage.
 */
export function removeCredential(storageKey: string): boolean {
  try {
    localStorage.removeItem(storageKey);
    return true;
  } catch (err: unknown) {
    logger.warn('vault-feature', 'remove failed', { err });
    return false;
  }
}

/**
 * Export coffre complet en JSON chiffré (pour backup).
 */
export function exportVaultJson(entries: ReadonlyArray<VaultEntry>): string {
  const payload = {
    exported_at: new Date().toISOString(),
    version: 1,
    entries: entries
      .filter((e) => e.status !== 'empty')
      .map((e) => {
        const raw = (() => {
          try {
            return localStorage.getItem(e.pattern.storageKey) ?? '';
          } catch {
            return '';
          }
        })();
        return { storage_key: e.pattern.storageKey, name: e.pattern.name, value_encrypted: raw };
      }),
  };
  return JSON.stringify(payload, null, 2);
}

const STATUS_META: Record<VaultEntry['status'], { label: string; color: string; icon: string }> = {
  configured: { label: 'Configurée', color: '#22cc77', icon: '🟢' },
  encrypted: { label: 'Chiffrée', color: '#22cc77', icon: '🔐' },
  plaintext_legacy: { label: 'À migrer', color: '#ffaa00', icon: '🟠' },
  empty: { label: 'Non configurée', color: '#888', icon: '⚪' },
};

const CATEGORIES: ReadonlyArray<{ id: CredentialPattern['category']; label: string; icon: string }> = [
  { id: 'ai', label: 'IA', icon: '🤖' },
  { id: 'saas', label: 'SaaS', icon: '🛠' },
  { id: 'devops', label: 'DevOps', icon: '⚙️' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'comms', label: 'Comms', icon: '💬' },
  { id: 'storage', label: 'Storage', icon: '💾' },
  { id: 'identity', label: 'Identité', icon: '🪪' },
];

let activeCategory: CredentialPattern['category'] | 'all' = 'all';
let configuredOnly = false;
let searchQuery = '';

function renderEntryRow(e: VaultEntry, idx = 0): string {
  const meta = STATUS_META[e.status];
  const linkBase = 'display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.7);text-decoration:none;border-radius:8px;font-size:11px;font-weight:500;border:1px solid rgba(255,255,255,0.06);transition:all 160ms cubic-bezier(0.16,1,0.3,1)';
  const links = [];
  if (e.pattern.dashboard) links.push(`<a href="${escapeHtml(e.pattern.dashboard)}" target="_blank" rel="noopener" style="${linkBase}">📊 Dashboard</a>`);
  if (e.pattern.billing) links.push(`<a href="${escapeHtml(e.pattern.billing)}" target="_blank" rel="noopener" style="${linkBase}">💳 Billing</a>`);
  if (e.pattern.docs) links.push(`<a href="${escapeHtml(e.pattern.docs)}" target="_blank" rel="noopener" style="${linkBase}">📖 Docs</a>`);
  if (e.pattern.support) links.push(`<a href="${escapeHtml(e.pattern.support)}" target="_blank" rel="noopener" style="${linkBase}">🆘 Support</a>`);

  /* Category color palette for badge */
  const catColors: Record<string, string> = {
    ai: '106,138,255', saas: '160,96,255', devops: '34,204,119', finance: '232,184,48',
    comms: '255,107,157', storage: '79,214,224', identity: '255,170,0',
  };
  const catRgb = catColors[e.pattern.category] ?? '160,160,180';
  const btnBase = 'min-height:36px;padding:8px 12px;font-size:12px;font-weight:600;border-radius:9px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 160ms cubic-bezier(0.16,1,0.3,1);border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.85)';

  return `
    <li class="ax-vault-row ax-modernized-card" data-vault-key="${escapeHtml(e.pattern.storageKey)}"
      style="background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));backdrop-filter:blur(12px) saturate(140%);-webkit-backdrop-filter:blur(12px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px;margin-bottom:10px;border-left:3px solid ${escapeHtml(meta.color)};animation:ax-fade-up 280ms cubic-bezier(0.16,1,0.3,1) ${30 + idx * 20}ms backwards;transition:all 200ms cubic-bezier(0.16,1,0.3,1)">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div style="flex:1;min-width:220px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap">
            <span style="font-size:18px;filter:drop-shadow(0 2px 4px ${escapeHtml(meta.color)}55)">${meta.icon}</span>
            <strong style="color:#fff;font-size:14px;letter-spacing:-0.01em">${escapeHtml(e.pattern.name)}</strong>
            <span style="display:inline-block;background:rgba(${catRgb},0.15);color:rgba(${catRgb},1);font-size:10px;padding:3px 8px;border-radius:24px;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;border:1px solid rgba(${catRgb},0.25)">${escapeHtml(e.pattern.category)}</span>
            <span style="display:inline-block;padding:2px 8px;background:rgba(${meta.color === '#22cc77' ? '34,204,119' : meta.color === '#ffaa00' ? '255,170,0' : '160,160,180'},0.12);color:${escapeHtml(meta.color)};border-radius:24px;font-size:10px;font-weight:700;letter-spacing:0.04em">${escapeHtml(meta.label)}</span>
          </div>
          <code style="font-size:11px;color:rgba(255,255,255,0.4);display:block;font-family:ui-monospace,'SF Mono',Menlo,monospace">${escapeHtml(e.pattern.storageKey)}</code>
          ${e.masked ? `<code style="font-size:13px;color:${escapeHtml(meta.color)};display:block;margin-top:4px;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-weight:600">${escapeHtml(e.masked)}</code>` : ''}
          ${links.length > 0 ? `<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${links.join('')}</div>` : ''}
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;flex-shrink:0">
          ${e.status !== 'empty' ? `<button class="ax-bounce-tap" data-vault-test="${escapeHtml(e.pattern.storageKey)}" style="${btnBase}">🧪 Tester</button>` : ''}
          <button class="ax-bounce-tap" data-vault-edit="${escapeHtml(e.pattern.storageKey)}" style="${btnBase};${e.status === 'empty' ? 'background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border-color:transparent' : ''}">${e.status === 'empty' ? '➕ Ajouter' : '✏️ Modifier'}</button>
          ${e.status !== 'empty' ? `<button class="ax-bounce-tap" data-vault-remove="${escapeHtml(e.pattern.storageKey)}" style="${btnBase};background:rgba(255,91,91,0.12);color:#ff5b5b;border-color:rgba(255,91,91,0.25)">🗑</button>` : ''}
        </div>
      </div>
    </li>`;
}

function renderCategoryFilter(): string {
  const categories: ReadonlyArray<{ id: 'all' | CredentialPattern['category']; label: string }> = [
    { id: 'all', label: '🔍 Tous' },
    ...CATEGORIES.map((c) => ({ id: c.id, label: `${c.icon} ${c.label}` })),
  ];
  return categories
    .map(
      (c) => {
        const isActive = activeCategory === c.id;
        return `
        <button class="ax-vault-cat-btn ax-bounce-tap ${isActive ? 'ax-tab-active' : ''}"
          data-vault-cat="${escapeHtml(c.id)}"
          style="background:${isActive ? 'linear-gradient(135deg,#c9a227,#e8b830)' : 'rgba(255,255,255,0.04)'};color:${isActive ? '#000' : 'rgba(255,255,255,0.7)'};border:1px solid ${isActive ? 'transparent' : 'rgba(255,255,255,0.08)'};padding:8px 14px;border-radius:24px;font-size:12px;font-weight:${isActive ? '700' : '500'};cursor:pointer;min-height:36px;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1);white-space:nowrap">
          ${escapeHtml(c.label)}
        </button>`;
      },
    )
    .join('');
}

export async function render(rootEl: HTMLElement): Promise<void> {
  const isAdmin = store.get('isAdmin') as boolean | undefined;
  if (!isAdmin) {
    rootEl.innerHTML = `<div style="padding:40px;text-align:center"><h2 style="color:#c9a227">🔒 Coffre admin</h2><p style="color:#a0a4c0">Cette section est réservée à l'admin Kevin.</p></div>`;
    return;
  }

  const all = listVaultEntries();
  const filterArgs: Parameters<typeof filterVaultEntries>[1] = { configuredOnly, query: searchQuery };
  if (activeCategory !== 'all') {
    filterArgs.category = activeCategory;
  }
  const filtered = filterVaultEntries(all, filterArgs);
  const stats = {
    total: all.length,
    configured: all.filter((e) => e.status !== 'empty').length,
    encrypted: all.filter((e) => e.status === 'encrypted').length,
  };

  rootEl.innerHTML = `
    <style>
      @keyframes ax-fade-up {
        0% { opacity: 0; transform: translateY(12px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .ax-modernized-card:hover {
        transform: translateY(-2px);
        border-color: rgba(232,184,48,0.25) !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      }
      .ax-bounce-tap { transition: transform 120ms cubic-bezier(0.16,1,0.3,1); }
      .ax-bounce-tap:active { transform: scale(0.95); }
      @media (prefers-reduced-motion: reduce) {
        .ax-modernized-card { animation: none !important; transition: none !important; }
        .ax-modernized-card:hover { transform: none !important; }
        .ax-bounce-tap { transition: none !important; }
      }
    </style>
    <div class="ax-page" style="padding:24px 16px max(24px, env(safe-area-inset-bottom)) 16px;max-width:1140px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif">
      <header style="margin-bottom:24px;animation:ax-fade-up 360ms cubic-bezier(0.16,1,0.3,1) backwards">
        <h1 style="margin:0 0 6px;font-size:clamp(26px,4.5vw,32px);font-weight:700;background:linear-gradient(135deg,#c9a227 0%,#e8b830 50%,#f5cc4a 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:Georgia,serif;letter-spacing:-0.025em">🔐 Coffre-fort</h1>
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:8px">
          <div style="display:flex;align-items:center;gap:8px;padding:6px 12px;background:rgba(34,204,119,0.1);border:1px solid rgba(34,204,119,0.2);border-radius:24px">
            <span style="width:6px;height:6px;background:#22cc77;border-radius:50%;box-shadow:0 0 8px #22cc77"></span>
            <span style="color:#22cc77;font-size:12px;font-weight:600">${stats.configured}/${stats.total} configurées</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;padding:6px 12px;background:rgba(232,184,48,0.1);border:1px solid rgba(232,184,48,0.25);border-radius:24px">
            <span style="font-size:12px">🔐</span>
            <span style="color:#e8b830;font-size:12px;font-weight:600">${stats.encrypted} chiffrées AES-256</span>
          </div>
        </div>
      </header>

      <section class="ax-modernized-card" style="margin-bottom:14px;background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));backdrop-filter:blur(20px) saturate(140%);-webkit-backdrop-filter:blur(20px) saturate(140%);border:1px solid rgba(232,184,48,0.18);border-radius:16px;padding:18px;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) 80ms backwards;transition:all 240ms cubic-bezier(0.16,1,0.3,1)">
        <h3 style="margin:0 0 8px;font-size:13px;color:#e8b830;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;display:flex;align-items:center;gap:6px">🔍 Auto-détection</h3>
        <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 12px;line-height:1.5">Colle ici n'importe quelle clé API. Apex la reconnaît automatiquement et la range au bon endroit.</p>
        <textarea id="ax-vault-paste" placeholder="Colle ta clé ici (ex: sk-ant-api03-..., AIzaSy..., re_...)"
          style="width:100%;background:rgba(0,0,0,0.35);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px 14px;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:13px;line-height:1.5;min-height:72px;resize:vertical;box-sizing:border-box;-webkit-appearance:none;transition:all 160ms"></textarea>
        <button id="ax-vault-paste-btn" class="ax-bounce-tap" style="margin-top:10px;padding:12px 22px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;min-height:44px;-webkit-tap-highlight-color:transparent;transition:all 160ms">🔍 Détecter & stocker</button>
        <div id="ax-vault-paste-result" style="margin-top:10px"></div>
      </section>

      <section style="margin-bottom:14px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) 120ms backwards">
        <input id="ax-vault-search" type="text" placeholder="🔍 Filtre par nom/clé..." value="${escapeHtml(searchQuery)}"
          style="flex:1;min-width:220px;background:linear-gradient(135deg,rgba(20,20,35,0.6),rgba(14,14,28,0.4));backdrop-filter:blur(12px);color:#fff;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:11px 14px;font-size:14px;min-height:44px;-webkit-appearance:none;transition:all 160ms">
        <label style="display:flex;align-items:center;gap:8px;color:rgba(255,255,255,0.7);font-size:13px;cursor:pointer;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;min-height:44px;-webkit-tap-highlight-color:transparent;transition:all 160ms">
          <input type="checkbox" id="ax-vault-configured-only" ${configuredOnly ? 'checked' : ''} style="cursor:pointer;accent-color:#e8b830">
          Configurées uniquement
        </label>
      </section>

      <section style="margin-bottom:14px;display:flex;gap:8px;flex-wrap:wrap;overflow-x:auto;-webkit-overflow-scrolling:touch;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) 160ms backwards">
        ${renderCategoryFilter()}
      </section>

      <section style="margin-bottom:24px">
        <ul style="list-style:none;padding:0;margin:0">
          ${filtered.length > 0 ? filtered.map((e, i) => renderEntryRow(e, i)).join('') : `
            <li style="text-align:center;padding:48px 24px;background:linear-gradient(135deg,rgba(20,20,35,0.5),rgba(14,14,28,0.3));border:1px solid rgba(255,255,255,0.06);border-radius:14px">
              <div style="font-size:32px;opacity:0.5;margin-bottom:10px">🔍</div>
              <div style="color:rgba(255,255,255,0.6);font-size:14px">Aucun credential pour ces filtres.</div>
            </li>`}
        </ul>
      </section>

      <section class="ax-modernized-card" style="background:linear-gradient(135deg,rgba(20,20,35,0.6),rgba(14,14,28,0.4));backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:16px;margin-bottom:18px;transition:all 200ms">
        <h3 style="margin:0 0 12px;color:#e8b830;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;font-weight:700">💾 Backup & Restore</h3>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button id="ax-vault-export" class="ax-bounce-tap" style="padding:10px 16px;background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3);border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;min-height:42px;-webkit-tap-highlight-color:transparent;transition:all 160ms">📥 Exporter coffre (JSON)</button>
          <button id="ax-vault-passphrase" class="ax-bounce-tap" style="padding:10px 16px;background:rgba(160,96,255,0.15);color:#a060ff;border:1px solid rgba(160,96,255,0.3);border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;min-height:42px;-webkit-tap-highlight-color:transparent;transition:all 160ms">🔑 Changer passphrase</button>
        </div>
      </section>

      <p style="text-align:center;color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.02em;line-height:1.6;padding:16px;background:rgba(255,255,255,0.02);border-radius:12px">
        🛡 <strong style="color:rgba(255,255,255,0.6)">Sécurité</strong> : AES-GCM 256 + PBKDF2 200k iterations · Audit log immutable<br>
        <span style="opacity:0.7">JAMAIS Firebase pour ax_pin/ax_user (FB_LOCAL strict)</span>
      </p>
    </div>
  `;

  attachVaultHandlers(rootEl);
  logger.info('feature-vault', `rendered (${all.length} entries, ${filtered.length} visible, ${stats.configured} configured)`);
}

function attachVaultHandlers(rootEl: HTMLElement): void {
  /* Category filter */
  rootEl.querySelectorAll<HTMLButtonElement>('[data-vault-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      haptic.selection();
      const cat = btn.dataset['vaultCat'] ?? 'all';
      activeCategory = (cat === 'all' ? 'all' : cat) as typeof activeCategory;
      void render(rootEl);
    });
  });

  /* Search input */
  const searchEl = rootEl.querySelector<HTMLInputElement>('#ax-vault-search');
  if (searchEl) {
    let debounce: ReturnType<typeof setTimeout> | null = null;
    searchEl.addEventListener('input', () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => {
        searchQuery = searchEl.value;
        void render(rootEl);
      }, 300);
    });
  }

  /* Configured only toggle */
  const configuredEl = rootEl.querySelector<HTMLInputElement>('#ax-vault-configured-only');
  if (configuredEl) {
    configuredEl.addEventListener('change', () => {
      configuredOnly = configuredEl.checked;
      void render(rootEl);
    });
  }

  /* Auto-detect paste */
  const pasteBtn = rootEl.querySelector<HTMLButtonElement>('#ax-vault-paste-btn');
  if (pasteBtn) {
    pasteBtn.addEventListener('click', () => {
      void (async () => {
        haptic.tap();
        const ta = rootEl.querySelector<HTMLTextAreaElement>('#ax-vault-paste');
        const result = rootEl.querySelector<HTMLDivElement>('#ax-vault-paste-result');
        if (!ta || !result) return;
        const r = await autoDetectAndStore(ta.value);
        if (r.ok) {
          haptic.success();
          toast.success(`✅ ${r.pattern_name} stocké`);
          result.innerHTML = `<div style="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px;font-size:12px">✅ ${escapeHtml(r.pattern_name)} → ${escapeHtml(r.storage_key)}</div>`;
          ta.value = '';
          void render(rootEl);
        } else {
          haptic.error();
          toast.error(r.reason);
          result.innerHTML = `<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px;font-size:12px">⚠ ${escapeHtml(r.reason)}</div>`;
        }
      })();
    });
  }

  /* Edit credential */
  rootEl.querySelectorAll<HTMLButtonElement>('[data-vault-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      void (async () => {
        haptic.tap();
        const key = btn.dataset['vaultEdit'] ?? '';
        if (!key) return;
        const value = window.prompt(`Nouvelle valeur pour ${key} (laisser vide pour annuler) :`);
        if (value === null || value === '') return;
        try {
          const encrypted = await vault.encryptAuto(value);
          localStorage.setItem(key, encrypted);
          toast.success('Clé chiffrée et stockée');
          void render(rootEl);
        } catch (err: unknown) {
          logger.warn('vault-feature', 'edit failed', { err });
          toast.error('Erreur chiffrement');
        }
      })();
    });
  });

  /* Remove credential */
  rootEl.querySelectorAll<HTMLButtonElement>('[data-vault-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      haptic.tap();
      const key = btn.dataset['vaultRemove'] ?? '';
      if (!key) return;
      if (!window.confirm(`Supprimer ${key} ?`)) return;
      const ok = removeCredential(key);
      if (ok) {
        haptic.success();
        toast.success('Credential supprimé');
        void render(rootEl);
      } else {
        haptic.error();
        toast.error('Suppression échouée');
      }
    });
  });

  /* Test credential */
  rootEl.querySelectorAll<HTMLButtonElement>('[data-vault-test]').forEach((btn) => {
    btn.addEventListener('click', () => {
      haptic.tap();
      toast.info('Test de validité non encore implémenté (Jet 5)');
    });
  });

  /* Export */
  rootEl.querySelector<HTMLButtonElement>('#ax-vault-export')?.addEventListener('click', () => {
    haptic.tap();
    const json = exportVaultJson(listVaultEntries());
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apex-vault-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Coffre exporté (chiffré)');
  });

  /* Change passphrase */
  rootEl.querySelector<HTMLButtonElement>('#ax-vault-passphrase')?.addEventListener('click', () => {
    haptic.tap();
    toast.info('Changement passphrase à implémenter (Jet 5)');
  });
}
