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
}

const uiState: UIState = {
  search: '',
  categoryFilter: 'all',
  statusFilter: 'all',
  pwaOnly: true,
};

export async function render(rootEl: HTMLElement): Promise<void> {
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
        <input id="ax-plg-search" placeholder="🔍 Rechercher (nom, tag, description)" value="${escapeHtml(uiState.search)}"
          style="flex:1 1 240px;background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">

        <select id="ax-plg-cat" style="background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">
          <option value="all">Toutes catégories</option>
          ${categories.map((c) => `<option value="${escapeHtml(c)}" ${uiState.categoryFilter === c ? 'selected' : ''}>${CATEGORY_LABELS[c]}</option>`).join('')}
        </select>

        <select id="ax-plg-status" style="background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">
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
    searchEl.addEventListener('input', () => {
      uiState.search = searchEl.value;
    });
    searchEl.addEventListener('change', () => {
      void render(rootEl);
    });
    /* Debounce keyup */
    let timer: ReturnType<typeof setTimeout> | null = null;
    searchEl.addEventListener('keyup', () => {
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
    btn.addEventListener('click', () => {
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
    btn.addEventListener('click', () => {
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
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const url = a.dataset['url'];
      if (!url) return;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  });

  logger.info('feature-plugins', `rendered ${plugins.length} plugins (cat=${uiState.categoryFilter}, status=${uiState.statusFilter}, pwa=${uiState.pwaOnly})`);
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
