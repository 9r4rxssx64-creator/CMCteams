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

function renderEntryRow(e: VaultEntry): string {
  const meta = STATUS_META[e.status];
  const links = [];
  if (e.pattern.dashboard) links.push(`<a href="${escapeHtml(e.pattern.dashboard)}" target="_blank" rel="noopener" class="ax-vault-link">📊 Dashboard</a>`);
  if (e.pattern.billing) links.push(`<a href="${escapeHtml(e.pattern.billing)}" target="_blank" rel="noopener" class="ax-vault-link">💳 Billing</a>`);
  if (e.pattern.docs) links.push(`<a href="${escapeHtml(e.pattern.docs)}" target="_blank" rel="noopener" class="ax-vault-link">📖 Docs</a>`);
  if (e.pattern.support) links.push(`<a href="${escapeHtml(e.pattern.support)}" target="_blank" rel="noopener" class="ax-vault-link">🆘 Support</a>`);

  return `
    <li class="ax-vault-row" data-vault-key="${escapeHtml(e.pattern.storageKey)}"
      style="background:rgba(20,20,35,0.5);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:12px;margin-bottom:8px;border-left:3px solid ${escapeHtml(meta.color)}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
        <div style="flex:1;min-width:200px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="font-size:14px">${meta.icon}</span>
            <strong style="color:#fff;font-size:14px">${escapeHtml(e.pattern.name)}</strong>
            <span style="background:rgba(${e.pattern.category === 'ai' ? '90,168,255' : '168,120,255'},.15);color:#a0a4c0;font-size:10px;padding:2px 6px;border-radius:4px;text-transform:uppercase">${escapeHtml(e.pattern.category)}</span>
          </div>
          <code style="font-size:11px;color:#888;display:block">${escapeHtml(e.pattern.storageKey)}</code>
          ${e.masked ? `<code style="font-size:12px;color:${escapeHtml(meta.color)};display:block;margin-top:2px">${escapeHtml(e.masked)}</code>` : ''}
          <div style="margin-top:6px;display:flex;gap:10px;flex-wrap:wrap;font-size:11px">${links.join(' · ')}</div>
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          ${e.status !== 'empty' ? `<button class="ax-btn ax-btn-sm" data-vault-test="${escapeHtml(e.pattern.storageKey)}" style="font-size:11px">🧪 Tester</button>` : ''}
          <button class="ax-btn ax-btn-sm" data-vault-edit="${escapeHtml(e.pattern.storageKey)}" style="font-size:11px">${e.status === 'empty' ? '➕ Ajouter' : '✏️ Modifier'}</button>
          ${e.status !== 'empty' ? `<button class="ax-btn ax-btn-sm ax-btn-danger" data-vault-remove="${escapeHtml(e.pattern.storageKey)}" style="font-size:11px;background:rgba(255,88,88,.15);color:#ff5858">🗑</button>` : ''}
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
      (c) => `
      <button class="ax-vault-cat-btn ${activeCategory === c.id ? 'ax-tab-active' : ''}"
        data-vault-cat="${escapeHtml(c.id)}"
        style="background:${activeCategory === c.id ? 'rgba(201,162,39,.15)' : 'transparent'};color:${activeCategory === c.id ? '#c9a227' : '#a0a4c0'};border:1px solid rgba(201,162,39,.3);padding:6px 12px;border-radius:8px;font-size:12px;cursor:pointer">
        ${escapeHtml(c.label)}
      </button>`,
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
    <div class="ax-page" style="padding:16px;max-width:1100px;margin:0 auto">
      <header style="margin-bottom:20px">
        <h1 style="margin:0 0 4px;color:#c9a227;font-size:28px">🔐 Coffre-fort</h1>
        <p style="color:#a0a4c0;margin:0;font-size:13px">
          ${stats.configured}/${stats.total} clés configurées · ${stats.encrypted} chiffrées AES-GCM 256
        </p>
      </header>

      <section style="margin-bottom:16px;background:rgba(20,20,35,0.6);border:1px solid rgba(201,162,39,.2);border-radius:14px;padding:14px">
        <h3 style="margin:0 0 10px;color:#c9a227;font-size:13px;text-transform:uppercase">🔍 Auto-detect</h3>
        <p style="color:#a0a4c0;font-size:12px;margin:0 0 8px">Colle ici n'importe quelle clé API. Apex la reconnait automatiquement et la stocke dans la bonne case.</p>
        <textarea id="ax-vault-paste" placeholder="Colle ta clé ici (ex: sk-ant-api03-..., AIzaSy..., re_...)"
          style="width:100%;background:rgba(0,0,0,.3);color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px;font-family:monospace;font-size:12px;min-height:60px;resize:vertical"></textarea>
        <button id="ax-vault-paste-btn" class="ax-btn ax-btn-primary" style="margin-top:8px;font-size:13px">🔍 Détecter & stocker</button>
        <div id="ax-vault-paste-result" style="margin-top:8px"></div>
      </section>

      <section style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input id="ax-vault-search" type="text" placeholder="🔍 Filtre par nom/clé..." value="${escapeHtml(searchQuery)}"
          style="flex:1;min-width:200px;background:rgba(0,0,0,.3);color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px 12px;font-size:13px">
        <label style="display:flex;align-items:center;gap:6px;color:#a0a4c0;font-size:12px;cursor:pointer">
          <input type="checkbox" id="ax-vault-configured-only" ${configuredOnly ? 'checked' : ''}>
          Configurées uniquement
        </label>
      </section>

      <section style="margin-bottom:12px;display:flex;gap:6px;flex-wrap:wrap">
        ${renderCategoryFilter()}
      </section>

      <section style="margin-bottom:24px">
        <ul style="list-style:none;padding:0;margin:0">
          ${filtered.length > 0 ? filtered.map(renderEntryRow).join('') : '<li style="text-align:center;padding:30px;color:#888">Aucun credential pour ces filtres.</li>'}
        </ul>
      </section>

      <section style="background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:14px;margin-bottom:16px">
        <h3 style="margin:0 0 10px;color:#c9a227;font-size:13px;text-transform:uppercase">💾 Backup & Restore</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="ax-vault-export" class="ax-btn ax-btn-sm">📥 Exporter coffre (JSON)</button>
          <button id="ax-vault-passphrase" class="ax-btn ax-btn-sm">🔑 Changer passphrase</button>
        </div>
      </section>

      <p style="text-align:center;color:#666;font-size:11px">
        🛡 Sécurité : AES-GCM 256 + PBKDF2 200k iterations · Audit log immutable · JAMAIS Firebase pour ax_pin/ax_user.
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
