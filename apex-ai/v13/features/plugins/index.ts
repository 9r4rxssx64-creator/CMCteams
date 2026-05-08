/**
 * APEX v13 — Feature Plugins Marketplace (admin tab).
 *
 * UI inspired App Store : grid de cards, filtres catégorie / source / status,
 * search, install/uninstall buttons, recommandations Apex en tête.
 *
 * Demande Kevin (2026-05-04) :
 * "Marketplace style App Store : Catégories filtrables, Cards plugins, bouton Installer,
 *  Stats installés / disponibles, Search bar."
 *
 * UX :
 *  - Onglet "🔌 Plugins" dans Admin Center.
 *  - Stats globales en tête (catalog total / installés / dispo PWA / non-supporté).
 *  - Onglet "Recommandés" pré-cochés (high+critical PWA).
 *  - Pour chaque card : badge status (🟢 installé / ⚪ dispo / 🔴 non-PWA).
 */

import { logger } from '../../core/logger.js';
import { createCleanupScope, type CleanupScope } from '../../core/listener-cleanup.js';

/* P1-6 (audit v13.2.7) : scope listeners pour anti-leak SPA navigation. */
let activePluginsScope: CleanupScope | null = null;

export function dispose(): void {
  activePluginsScope?.cleanup();
  activePluginsScope = null;
}
import {
  APEX_EXTENDED_CATALOG,
  searchCatalog as searchExtended,
  type ApexExtendedTool,
  type ApexExtendedToolType,
  type ApexCompatibility,
  type AutoImprovementValue,
} from '../../data/apex-extended-catalog.js';
import type { ApexPluginManifest, PluginCategory } from '../../data/apex-plugins-catalog.js';

const VALUE_BADGE: Record<ApexPluginManifest['estimated_value'], string> = {
  critical: '<span style="color:#ff5b5b">🔥 CRITICAL</span>',
  high: '<span style="color:#22cc77">⭐ HIGH</span>',
  medium: '<span style="color:#f0c020">○ MEDIUM</span>',
  low: '<span style="color:#888">— LOW</span>',
};

const STATUS_BADGE: Record<string, string> = {
  installed: '<span style="color:#22cc77">🟢 Installé</span>',
  available: '<span style="color:#9aa">⚪ Disponible</span>',
  'unsupported-pwa': '<span style="color:#ff5b5b">🔴 Non-PWA</span>',
  planned: '<span style="color:#aa8">🟡 Planifié</span>',
};

const CATEGORY_LABELS: Record<PluginCategory, string> = {
  'dev-tools': '🛠 Dev Tools',
  lsp: '📝 LSP (langage)',
  database: '🗄 Database',
  cloud: '☁ Cloud',
  deployment: '🚀 Deployment',
  monitoring: '📊 Monitoring',
  security: '🛡 Security',
  productivity: '✨ Productivity',
  design: '🎨 Design',
  api: '🔌 API',
  search: '🔍 Search',
  'vector-rag': '🧠 Vector RAG',
  payment: '💳 Payment',
  messaging: '💬 Messaging',
  social: '📱 Social',
  auth: '🔐 Auth',
  'ai-ml': '🤖 AI/ML',
  analytics: '📈 Analytics',
  mobile: '📱 Mobile',
  browser: '🌐 Browser',
  content: '📁 Content',
  data: '💾 Data',
  memory: '🧬 Memory',
  voice: '🎙 Voice',
  workflow: '⚙ Workflow',
  observability: '👁 Observability',
  testing: '🧪 Testing',
  location: '📍 Location',
  finance: '💰 Finance',
  creator: '🎬 Creator',
  learning: '📚 Learning',
};

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );
}

/* État runtime UI (filtres) */
interface UIState {
  search: string;
  categoryFilter: PluginCategory | 'all';
  statusFilter: 'all' | 'installed' | 'available' | 'unsupported-pwa' | 'planned';
  pwaOnly: boolean;
  /** Onglet visible : marketplace standard ou extended catalog 300+ */
  view: 'marketplace' | 'extended';
  /** Filtre extended : type tool */
  extendedTypeFilter: ApexExtendedToolType | 'all';
  /** Filtre extended : compatibility */
  extendedCompatFilter: ApexCompatibility | 'all';
  /** Filtre extended : auto_improvement_value */
  extendedValueFilter: AutoImprovementValue | 'all';
  /** Tri extended */
  extendedSortBy: 'value' | 'stars' | 'name';
}

const uiState: UIState = {
  search: '',
  categoryFilter: 'all',
  statusFilter: 'all',
  pwaOnly: true,
  view: 'marketplace',
  extendedTypeFilter: 'all',
  extendedCompatFilter: 'all',
  extendedValueFilter: 'all',
  extendedSortBy: 'value',
};

const EXTENDED_TYPE_LABELS: Record<ApexExtendedToolType, string> = {
  'mcp-server': '🧩 MCP Server',
  'mcp-aggregator': '🌐 MCP Aggregator',
  'claude-skill': '🎯 Claude Skill',
  'claude-hook': '🪝 Claude Hook',
  'claude-command': '⌨ Claude Command',
  'claude-subagent-orchestrator': '🤖 Subagent Orchestrator',
  'agent-framework': '🏗 Agent Framework',
  'browser-api': '🌍 Browser API',
  'web-tool': '🛠 Web Tool',
  'github-action': '⚙ GitHub Action',
  'tooling-cli': '⌨ CLI Tooling',
  'status-line': '📊 Status Line',
  'pwa-capability': '📱 PWA Capability',
};

const EXTENDED_COMPAT_LABELS: Record<ApexCompatibility, string> = {
  'pwa-direct': '🟢 PWA Direct',
  'cloudflare-worker': '🟡 CF Worker',
  'node-required': '🔴 Node Only',
  'native-only': '⛔ Native Only',
};

const EXTENDED_VALUE_BADGE: Record<AutoImprovementValue, string> = {
  high: '<span style="color:#22cc77">⭐ HIGH</span>',
  medium: '<span style="color:#f0c020">○ MEDIUM</span>',
  low: '<span style="color:#888">— LOW</span>',
};

export async function render(rootEl: HTMLElement): Promise<void> {
  /* P1-6 : cleanup ancien scope avant re-render */
  activePluginsScope?.cleanup();
  activePluginsScope = createCleanupScope('plugins');
  if (uiState.view === 'extended') {
    await renderExtended(rootEl);
    return;
  }
  const { apexPluginsMarketplace } = await import('../../services/apex-plugins-marketplace.js');
  const stats = apexPluginsMarketplace.getStats();
  const categories = apexPluginsMarketplace.getCategories();

  /* Détermine la liste à afficher */
  let plugins: ApexPluginManifest[];
  if (uiState.search.trim()) {
    plugins = apexPluginsMarketplace.search(uiState.search, 100);
  } else {
    plugins = apexPluginsMarketplace.list({
      ...(uiState.categoryFilter !== 'all' && { category: uiState.categoryFilter }),
      ...(uiState.statusFilter !== 'all' && { status: uiState.statusFilter }),
      pwaOnly: uiState.pwaOnly,
    });
  }

  const recommended = apexPluginsMarketplace.recommendForUser({ minValue: 'high', max: 6 });

  rootEl.innerHTML = `
    <div class="ax-page" style="padding:16px;max-width:1100px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">🔌 Marketplace Plugins Apex</h1>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button id="ax-plg-tab-marketplace" class="ax-btn" style="padding:6px 12px;background:#c9a227;color:#000;font-weight:600;border:none;border-radius:6px;font-size:12px;cursor:pointer">📦 Marketplace</button>
        <button id="ax-plg-tab-extended" class="ax-btn" style="padding:6px 12px;background:rgba(20,20,35,0.7);color:#fff;border:1px solid #444;border-radius:6px;font-size:12px;cursor:pointer">🌐 Extended Catalog (${APEX_EXTENDED_CATALOG.length}+)</button>
      </div>
      <p style="color:var(--ax-text-dim);margin:0 0 12px;font-size:14px">
        ${stats.totalCatalog} plugins recensés (Anthropic Claude / MCP servers / community / apex-internal).
        <strong style="color:#22cc77">${stats.totalInstalled} installés</strong>
        · ${stats.totalAvailable} dispo PWA
        · <span style="color:#ff5b5b">${stats.totalUnsupportedPwa} non-PWA</span>.
      </p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-bottom:16px">
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">Catalog</div>
          <div style="font-size:20px;color:#c9a227">${stats.totalCatalog}</div>
        </div>
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">Installés</div>
          <div style="font-size:20px;color:#22cc77">${stats.totalInstalled}</div>
        </div>
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">Disponibles</div>
          <div style="font-size:20px;color:#fff">${stats.totalAvailable}</div>
        </div>
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">Non-PWA</div>
          <div style="font-size:20px;color:#ff5b5b">${stats.totalUnsupportedPwa}</div>
        </div>
      </div>

      ${recommended.length > 0
        ? `<h2 style="margin:24px 0 8px;color:#c9a227;font-size:16px">⭐ Recommandés pour Kevin</h2>
           <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:8px;margin-bottom:16px">
             ${recommended.map((p) => renderCard(p, apexPluginsMarketplace.getStatusOf(p.id))).join('')}
           </div>`
        : ''}

      <div style="display:flex;gap:8px;margin:16px 0 12px;flex-wrap:wrap;align-items:center">
        <label for="ax-plg-search" class="sr-only">Rechercher un plugin par nom, tag ou description</label>
        <input id="ax-plg-search" placeholder="🔍 Rechercher (nom, tag, description)" aria-label="Rechercher un plugin par nom, tag ou description" value="${escapeHtml(uiState.search)}"
          style="flex:1 1 240px;background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">

        <label for="ax-plg-cat" class="sr-only">Filtrer par catégorie</label>
        <select id="ax-plg-cat" aria-label="Filtrer les plugins par catégorie" style="background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">
          <option value="all">Toutes catégories</option>
          ${categories.map((c) => `<option value="${escapeHtml(c)}" ${uiState.categoryFilter === c ? 'selected' : ''}>${CATEGORY_LABELS[c]}</option>`).join('')}
        </select>

        <label for="ax-plg-status" class="sr-only">Filtrer par statut</label>
        <select id="ax-plg-status" aria-label="Filtrer les plugins par statut" style="background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">
          <option value="all" ${uiState.statusFilter === 'all' ? 'selected' : ''}>Tous statuts</option>
          <option value="installed" ${uiState.statusFilter === 'installed' ? 'selected' : ''}>🟢 Installés</option>
          <option value="available" ${uiState.statusFilter === 'available' ? 'selected' : ''}>⚪ Disponibles</option>
          <option value="unsupported-pwa" ${uiState.statusFilter === 'unsupported-pwa' ? 'selected' : ''}>🔴 Non-PWA</option>
          <option value="planned" ${uiState.statusFilter === 'planned' ? 'selected' : ''}>🟡 Planifié</option>
        </select>

        <label style="font-size:12px;color:var(--ax-text-dim);display:flex;align-items:center;gap:4px;cursor:pointer">
          <input id="ax-plg-pwa-only" type="checkbox" ${uiState.pwaOnly ? 'checked' : ''}> PWA seulement
        </label>
      </div>

      <h2 style="margin:16px 0 8px;color:#c9a227;font-size:16px">${plugins.length} plugins</h2>

      ${plugins.length === 0
        ? `<p style="text-align:center;color:var(--ax-text-dim);padding:32px">Aucun plugin ne correspond aux filtres.</p>`
        : `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:8px">
             ${plugins.map((p) => renderCard(p, apexPluginsMarketplace.getStatusOf(p.id))).join('')}
           </div>`
      }
    </div>
  `;

  /* Wiring filtres */
  const searchEl = rootEl.querySelector<HTMLInputElement>('#ax-plg-search');
  if (searchEl) {
    activePluginsScope!.bind(searchEl, 'input', () => {
      uiState.search = searchEl.value;
    });
    activePluginsScope!.bind(searchEl, 'change', () => {
      void render(rootEl);
    });
    /* Debounce keyup */
    let timer: ReturnType<typeof setTimeout> | null = null;
    activePluginsScope!.bind(searchEl, 'keyup', () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void render(rootEl);
      }, 350);
    });
  }
  rootEl.querySelector<HTMLSelectElement>('#ax-plg-cat')?.addEventListener('change', (ev) => {
    const v = (ev.target as HTMLSelectElement).value;
    uiState.categoryFilter = (v === 'all' ? 'all' : v) as UIState['categoryFilter'];
    void render(rootEl);
  });
  rootEl.querySelector<HTMLSelectElement>('#ax-plg-status')?.addEventListener('change', (ev) => {
    const v = (ev.target as HTMLSelectElement).value;
    uiState.statusFilter = v as UIState['statusFilter'];
    void render(rootEl);
  });
  rootEl.querySelector<HTMLInputElement>('#ax-plg-pwa-only')?.addEventListener('change', (ev) => {
    uiState.pwaOnly = (ev.target as HTMLInputElement).checked;
    void render(rootEl);
  });

  /* Wiring install / uninstall buttons */
  rootEl.querySelectorAll<HTMLButtonElement>('.ax-plg-install').forEach((btn) => {
    activePluginsScope!.bind(btn, 'click', () => {
      void (async () => {
        const id = btn.dataset['id'];
        if (!id) return;
        btn.disabled = true;
        btn.textContent = '⏳ Install…';
        const result = await apexPluginsMarketplace.install(id);
        const { toast } = await import('../../ui/toast.js');
        if (result.ok) {
          toast.success(`✅ ${id} installé (${result.toolsAdded?.length ?? 0} tools)`);
        } else {
          if (result.requires_api_key) {
            toast.warn(`Clé requise : ${result.requires_api_key} dans le Coffre.`);
          } else {
            toast.error(`Échec : ${result.error ?? 'inconnu'}`);
          }
        }
        await render(rootEl);
      })();
    });
  });

  rootEl.querySelectorAll<HTMLButtonElement>('.ax-plg-uninstall').forEach((btn) => {
    activePluginsScope!.bind(btn, 'click', () => {
      void (async () => {
        const id = btn.dataset['id'];
        if (!id) return;
        if (typeof confirm === 'function' && !confirm(`Désinstaller ${id} ?`)) return;
        btn.disabled = true;
        btn.textContent = '⏳';
        const result = await apexPluginsMarketplace.uninstall(id);
        const { toast } = await import('../../ui/toast.js');
        if (result.ok) {
          toast.success(`Désinstallé ${id}`);
        } else {
          toast.error(`Échec : ${result.error ?? 'inconnu'}`);
        }
        await render(rootEl);
      })();
    });
  });

  rootEl.querySelectorAll<HTMLAnchorElement>('.ax-plg-link').forEach((a) => {
    activePluginsScope!.bind(a, 'click', (ev) => {
      ev.preventDefault();
      const url = a.dataset['url'];
      if (!url) return;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  });

  /* Tab switcher */
  rootEl.querySelector<HTMLButtonElement>('#ax-plg-tab-extended')?.addEventListener('click', () => {
    uiState.view = 'extended';
    void render(rootEl);
  });
  rootEl.querySelector<HTMLButtonElement>('#ax-plg-tab-marketplace')?.addEventListener('click', () => {
    uiState.view = 'marketplace';
    void render(rootEl);
  });

  logger.info('feature-plugins', `rendered ${plugins.length} plugins (cat=${uiState.categoryFilter}, status=${uiState.statusFilter}, pwa=${uiState.pwaOnly})`);
}

/* ============================================================
 * Extended Catalog View — APEX_EXTENDED_CATALOG (300+ entries)
 * ============================================================ */

async function renderExtended(rootEl: HTMLElement): Promise<void> {
  const { autoImprovement } = await import('../../services/auto-improvement.js');
  const state = autoImprovement.getState();
  const installedSet = new Set(state.installed);

  /* Apply filters */
  let filtered: readonly ApexExtendedTool[] = uiState.search.trim()
    ? searchExtended(uiState.search)
    : APEX_EXTENDED_CATALOG;

  if (uiState.extendedTypeFilter !== 'all') {
    filtered = filtered.filter((t) => t.type === uiState.extendedTypeFilter);
  }
  if (uiState.extendedCompatFilter !== 'all') {
    filtered = filtered.filter((t) => t.apex_compatibility === uiState.extendedCompatFilter);
  }
  if (uiState.extendedValueFilter !== 'all') {
    filtered = filtered.filter((t) => t.auto_improvement_value === uiState.extendedValueFilter);
  }
  if (uiState.pwaOnly) {
    filtered = filtered.filter(
      (t) => t.apex_compatibility === 'pwa-direct' || t.apex_compatibility === 'cloudflare-worker',
    );
  }

  /* Sort */
  const sorted = [...filtered].sort((a, b) => {
    if (uiState.extendedSortBy === 'value') {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.auto_improvement_value] - order[b.auto_improvement_value];
    }
    if (uiState.extendedSortBy === 'stars') {
      return (b.github_stars ?? 0) - (a.github_stars ?? 0);
    }
    return a.name.localeCompare(b.name);
  });

  /* Stats */
  const totalCatalog = APEX_EXTENDED_CATALOG.length;
  const totalInstalled = state.installed.length;
  const totalSkipped = state.skipped.length;
  const pwaCompat = APEX_EXTENDED_CATALOG.filter(
    (t) => t.apex_compatibility === 'pwa-direct' || t.apex_compatibility === 'cloudflare-worker',
  ).length;

  rootEl.innerHTML = `
    <div class="ax-page" style="padding:16px;max-width:1100px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">🌐 Extended Catalog Apex</h1>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button id="ax-plg-tab-marketplace" class="ax-btn" style="padding:6px 12px;background:rgba(20,20,35,0.7);color:#fff;border:1px solid #444;border-radius:6px;font-size:12px;cursor:pointer">📦 Marketplace</button>
        <button id="ax-plg-tab-extended" class="ax-btn" style="padding:6px 12px;background:#c9a227;color:#000;font-weight:600;border:none;border-radius:6px;font-size:12px;cursor:pointer">🌐 Extended Catalog (${totalCatalog})</button>
      </div>
      <p style="color:var(--ax-text-dim);margin:0 0 12px;font-size:14px">
        ${totalCatalog} outils recensés (MCP / Claude skills/hooks/commands / agent frameworks / PWA APIs / GitHub Actions).
        <strong style="color:#22cc77">${totalInstalled} auto-installés</strong>
        · ${pwaCompat} PWA-compatibles
        · <span style="color:#ff5b5b">${totalSkipped} skipped</span>.
      </p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-bottom:16px">
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">Total Catalog</div>
          <div style="font-size:20px;color:#c9a227">${totalCatalog}</div>
        </div>
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">PWA-compatible</div>
          <div style="font-size:20px;color:#22cc77">${pwaCompat}</div>
        </div>
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">Auto-installés</div>
          <div style="font-size:20px;color:#fff">${totalInstalled}</div>
        </div>
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">Skipped</div>
          <div style="font-size:20px;color:#ff5b5b">${totalSkipped}</div>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin:16px 0 12px;flex-wrap:wrap;align-items:center">
        <label for="ax-ext-search" class="sr-only">Rechercher un outil étendu par nom, description ou catégorie</label>
        <input id="ax-ext-search" placeholder="🔍 Rechercher (nom, description, catégorie)" aria-label="Rechercher un outil étendu par nom, description ou catégorie" value="${escapeHtml(uiState.search)}"
          style="flex:1 1 240px;background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">

        <label for="ax-ext-type" class="sr-only">Filtrer par type d'outil</label>
        <select id="ax-ext-type" aria-label="Filtrer par type d'outil" style="background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">
          <option value="all" ${uiState.extendedTypeFilter === 'all' ? 'selected' : ''}>Tous types</option>
          ${(Object.keys(EXTENDED_TYPE_LABELS) as ApexExtendedToolType[]).map((t) => `<option value="${t}" ${uiState.extendedTypeFilter === t ? 'selected' : ''}>${EXTENDED_TYPE_LABELS[t]}</option>`).join('')}
        </select>

        <select id="ax-ext-compat" style="background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">
          <option value="all" ${uiState.extendedCompatFilter === 'all' ? 'selected' : ''}>Toutes compat</option>
          ${(Object.keys(EXTENDED_COMPAT_LABELS) as ApexCompatibility[]).map((c) => `<option value="${c}" ${uiState.extendedCompatFilter === c ? 'selected' : ''}>${EXTENDED_COMPAT_LABELS[c]}</option>`).join('')}
        </select>

        <select id="ax-ext-value" style="background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">
          <option value="all" ${uiState.extendedValueFilter === 'all' ? 'selected' : ''}>Toutes valeurs</option>
          <option value="high" ${uiState.extendedValueFilter === 'high' ? 'selected' : ''}>⭐ HIGH</option>
          <option value="medium" ${uiState.extendedValueFilter === 'medium' ? 'selected' : ''}>○ MEDIUM</option>
          <option value="low" ${uiState.extendedValueFilter === 'low' ? 'selected' : ''}>— LOW</option>
        </select>

        <select id="ax-ext-sort" style="background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">
          <option value="value" ${uiState.extendedSortBy === 'value' ? 'selected' : ''}>Tri : Valeur ↓</option>
          <option value="stars" ${uiState.extendedSortBy === 'stars' ? 'selected' : ''}>Tri : Stars ↓</option>
          <option value="name" ${uiState.extendedSortBy === 'name' ? 'selected' : ''}>Tri : Nom A-Z</option>
        </select>

        <label style="font-size:12px;color:var(--ax-text-dim);display:flex;align-items:center;gap:4px;cursor:pointer">
          <input id="ax-ext-pwa-only" type="checkbox" ${uiState.pwaOnly ? 'checked' : ''}> PWA seulement
        </label>
      </div>

      <h2 style="margin:16px 0 8px;color:#c9a227;font-size:16px">${sorted.length} outils</h2>

      ${sorted.length === 0
        ? `<p style="text-align:center;color:var(--ax-text-dim);padding:32px">Aucun outil ne correspond aux filtres.</p>`
        : `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:8px">
             ${sorted.slice(0, 200).map((t) => renderExtendedCard(t, installedSet.has(t.id))).join('')}
           </div>`
      }
      ${sorted.length > 200 ? `<p style="text-align:center;color:var(--ax-text-dim);margin-top:8px;font-size:12px">… et ${sorted.length - 200} autres (filtre pour voir).</p>` : ''}
    </div>
  `;

  /* Wiring filters */
  const searchEl = rootEl.querySelector<HTMLInputElement>('#ax-ext-search');
  if (searchEl) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    activePluginsScope!.bind(searchEl, 'input', () => {
      uiState.search = searchEl.value;
    });
    activePluginsScope!.bind(searchEl, 'keyup', () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void render(rootEl);
      }, 350);
    });
  }
  rootEl.querySelector<HTMLSelectElement>('#ax-ext-type')?.addEventListener('change', (ev) => {
    const v = (ev.target as HTMLSelectElement).value;
    uiState.extendedTypeFilter = (v === 'all' ? 'all' : v) as UIState['extendedTypeFilter'];
    void render(rootEl);
  });
  rootEl.querySelector<HTMLSelectElement>('#ax-ext-compat')?.addEventListener('change', (ev) => {
    const v = (ev.target as HTMLSelectElement).value;
    uiState.extendedCompatFilter = (v === 'all' ? 'all' : v) as UIState['extendedCompatFilter'];
    void render(rootEl);
  });
  rootEl.querySelector<HTMLSelectElement>('#ax-ext-value')?.addEventListener('change', (ev) => {
    const v = (ev.target as HTMLSelectElement).value;
    uiState.extendedValueFilter = (v === 'all' ? 'all' : v) as UIState['extendedValueFilter'];
    void render(rootEl);
  });
  rootEl.querySelector<HTMLSelectElement>('#ax-ext-sort')?.addEventListener('change', (ev) => {
    const v = (ev.target as HTMLSelectElement).value;
    uiState.extendedSortBy = v as UIState['extendedSortBy'];
    void render(rootEl);
  });
  rootEl.querySelector<HTMLInputElement>('#ax-ext-pwa-only')?.addEventListener('change', (ev) => {
    uiState.pwaOnly = (ev.target as HTMLInputElement).checked;
    void render(rootEl);
  });

  /* Install buttons (auto-improvement.autoInstallSafe) */
  rootEl.querySelectorAll<HTMLButtonElement>('.ax-ext-install').forEach((btn) => {
    activePluginsScope!.bind(btn, 'click', () => {
      void (async () => {
        const id = btn.dataset['id'];
        if (!id) return;
        btn.disabled = true;
        btn.textContent = '⏳ Install…';
        const result = await autoImprovement.autoInstallSafe(id);
        const { toast } = await import('../../ui/toast.js');
        if (result.ok) {
          toast.success(`✅ ${id} installé`);
        } else {
          toast.warn(`⚠ ${result.message}`);
        }
        await render(rootEl);
      })();
    });
  });

  rootEl.querySelectorAll<HTMLAnchorElement>('.ax-ext-link').forEach((a) => {
    activePluginsScope!.bind(a, 'click', (ev) => {
      ev.preventDefault();
      const url = a.dataset['url'];
      if (!url) return;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  });

  rootEl.querySelector<HTMLButtonElement>('#ax-plg-tab-extended')?.addEventListener('click', () => {
    uiState.view = 'extended';
    void render(rootEl);
  });
  rootEl.querySelector<HTMLButtonElement>('#ax-plg-tab-marketplace')?.addEventListener('click', () => {
    uiState.view = 'marketplace';
    void render(rootEl);
  });

  logger.info(
    'feature-plugins.extended',
    `rendered ${sorted.length} extended tools (type=${uiState.extendedTypeFilter}, compat=${uiState.extendedCompatFilter})`,
  );
}

function renderExtendedCard(t: ApexExtendedTool, isInstalled: boolean): string {
  const valueBadge = EXTENDED_VALUE_BADGE[t.auto_improvement_value];
  const compatBadge = EXTENDED_COMPAT_LABELS[t.apex_compatibility];
  const typeBadge = EXTENDED_TYPE_LABELS[t.type];
  const stars = t.github_stars ? ` ★${t.github_stars >= 1000 ? `${(t.github_stars / 1000).toFixed(1)}k` : t.github_stars}` : '';
  const installAction = isInstalled
    ? `<span style="font-size:10px;color:#22cc77">🟢 Installé</span>`
    : t.apex_compatibility === 'native-only' || t.apex_compatibility === 'node-required'
      ? `<span style="font-size:10px;color:var(--ax-text-dim)">${compatBadge}</span>`
      : `<button class="ax-btn ax-ext-install" data-id="${escapeHtml(t.id)}" style="padding:4px 8px;font-size:11px;background:#2c5a2c;color:#fff;border:none;border-radius:4px;cursor:pointer">⬇ Auto-install</button>`;

  return `
    <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.05)">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:6px;margin-bottom:6px">
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;color:#fff;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(t.name)}${stars}</div>
          <div style="display:flex;gap:4px;align-items:center;margin-top:2px;flex-wrap:wrap">
            <span style="font-size:9px;color:var(--ax-text-dim)">${typeBadge}</span>
          </div>
        </div>
        <div style="font-size:10px;white-space:nowrap">${compatBadge}</div>
      </div>
      <div style="font-size:11px;color:var(--ax-text-dim);min-height:32px;margin-bottom:6px">${escapeHtml(t.description)}</div>
      <div style="font-size:9px;color:var(--ax-text-dim);margin-bottom:6px">
        ${t.categories.map((c) => `<span style="background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:3px;margin-right:2px">${escapeHtml(c)}</span>`).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-top:6px">
        <div>${valueBadge}</div>
        ${installAction}
      </div>
      <div style="margin-top:6px">
        <a href="#" class="ax-ext-link" data-url="${escapeHtml(t.source_url)}" style="font-size:10px;color:#7aa3ff">→ ${escapeHtml(t.source_url.slice(0, 60))}${t.source_url.length > 60 ? '…' : ''}</a>
      </div>
    </div>
  `;
}

/**
 * Génère HTML d'une card plugin (compact, mobile-first 280px min).
 */
function renderCard(p: ApexPluginManifest, status: string): string {
  const valueBadge = VALUE_BADGE[p.estimated_value];
  const statusBadge = STATUS_BADGE[status] ?? STATUS_BADGE['available'];
  const sourceBadge = p.source === 'anthropic-official'
    ? '<span style="background:rgba(201,162,39,0.2);padding:2px 6px;border-radius:4px;font-size:9px;color:#c9a227">OFFICIAL</span>'
    : p.source === 'mcp-server'
      ? '<span style="background:rgba(34,204,119,0.2);padding:2px 6px;border-radius:4px;font-size:9px;color:#22cc77">MCP</span>'
      : p.source === 'apex-internal'
        ? '<span style="background:rgba(255,91,91,0.2);padding:2px 6px;border-radius:4px;font-size:9px;color:#ff5b5b">INTERNAL</span>'
        : '<span style="background:rgba(150,150,150,0.2);padding:2px 6px;border-radius:4px;font-size:9px;color:#aaa">COMMUNITY</span>';

  const isInstalled = status === 'installed';
  const isUnsupported = status === 'unsupported-pwa';
  const isInternal = p.source === 'apex-internal';

  let actionHtml = '';
  if (isInstalled && !isInternal) {
    actionHtml = `<button class="ax-btn ax-plg-uninstall" data-id="${escapeHtml(p.id)}" style="padding:4px 8px;font-size:11px;background:#5a2c2c;color:#fff">🗑 Désinstaller</button>`;
  } else if (isInstalled && isInternal) {
    actionHtml = `<span style="font-size:10px;color:var(--ax-text-dim)">Plugin natif (non-désinstallable)</span>`;
  } else if (isUnsupported) {
    actionHtml = `<span style="font-size:10px;color:#ff5b5b">Non-PWA</span>`;
  } else {
    actionHtml = `<button class="ax-btn ax-plg-install" data-id="${escapeHtml(p.id)}" style="padding:4px 8px;font-size:11px;background:#2c5a2c;color:#fff">⬇ Installer</button>`;
  }

  const apiKeyNote = p.api_key_service
    ? `<div style="font-size:10px;color:var(--ax-text-dim);margin-top:4px">🔑 Clé : ${escapeHtml(p.api_key_service)}</div>`
    : '';

  const oauthNote = p.oauth_required
    ? `<div style="font-size:10px;color:#f0c020;margin-top:4px">🔐 OAuth requis</div>`
    : '';

  const toolsList = (p.apex_tools && p.apex_tools.length > 0)
    ? `<div style="font-size:10px;color:#22cc77;margin-top:4px">🛠 ${p.apex_tools.length} tools</div>`
    : '';

  return `
    <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.05)">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:6px;margin-bottom:6px">
        <div style="flex:1">
          <div style="font-size:14px;color:#fff;font-weight:600">${escapeHtml(p.name)}</div>
          <div style="display:flex;gap:4px;align-items:center;margin-top:2px;flex-wrap:wrap">
            ${sourceBadge}
            <span style="font-size:9px;color:var(--ax-text-dim)">${CATEGORY_LABELS[p.category]}</span>
          </div>
        </div>
        <div style="font-size:10px">${statusBadge}</div>
      </div>
      <div style="font-size:11px;color:var(--ax-text-dim);min-height:32px;margin-bottom:6px">${escapeHtml(p.description)}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-top:6px">
        <div>${valueBadge}</div>
        ${actionHtml}
      </div>
      ${apiKeyNote}
      ${oauthNote}
      ${toolsList}
      <div style="margin-top:6px">
        <a href="#" class="ax-plg-link" data-url="${escapeHtml(p.url)}" style="font-size:10px;color:#7aa3ff">→ ${escapeHtml(p.url.slice(0, 60))}${p.url.length > 60 ? '…' : ''}</a>
      </div>
    </div>
  `;
}
