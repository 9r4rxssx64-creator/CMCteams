/**
 * APEX v13 — Vue admin (Kevin only)
 *
 * Onglets :
 * - Commerce : toggle ON/OFF + assignation plans + statut commercialisation
 * - Users    : créer compte client/ami/famille + WhatsApp confirmation OTP
 * - Pending  : confirmations en attente (OTP reçus à valider)
 * - Health   : status providers IA + sentinelles
 * - Bilan    : bilan financier live (Sprint port v12 — CLAUDE.md règle vBilan)
 * - Conso    : consommation IA temps réel (Sprint port v12)
 */

import { logger } from '../../core/logger.js';
import { store } from '../../core/store.js';
import { apexExecute, type ExecutionRequest } from '../../services/apex-execute.js';
import { apexKnowledgeBase } from '../../services/apex-knowledge-base.js';
import { auth } from '../../services/auth.js';
import { commerce, type Plan } from '../../services/commerce.js';
import { kdmcProjectsRegistry, type ProjectStatus } from '../../services/kdmc-projects-registry.js';
import { whatsapp } from '../../services/whatsapp.js';
import { haptic } from '../../ui/haptic.js';
import { toast } from '../../ui/toast.js';

type Tab = 'commerce' | 'users' | 'pending' | 'health' | 'projects' | 'executions' | 'knowledge' | 'bilan' | 'consumption';

let activeTab: Tab = 'commerce';

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

function renderCommerceTab(): string {
  const enabled = commerce.isEnabled();
  return `
    <div class="ax-admin-section">
      <h2>Commercialisation</h2>
      <p class="ax-muted">
        Active le système d'abonnements pour les non-admin. Toi (Kevin admin) gardes l'accès illimité dans tous les cas.
      </p>
      <div class="ax-toggle-row">
        <label class="ax-toggle">
          <input type="checkbox" id="commerce-toggle" ${enabled ? 'checked' : ''}>
          <span class="ax-toggle-slider"></span>
          <span class="ax-toggle-label">Commercialisation ${enabled ? '<strong>ACTIVÉE</strong>' : '<strong>désactivée</strong>'}</span>
        </label>
      </div>
      <div class="ax-info-card">
        <h3>Plans disponibles</h3>
        <ul>
          <li><strong>free</strong> : 50 msg/jour, 1 studio, voix basique</li>
          <li><strong>basic 9€/mois</strong> : 500 msg/jour, 5 studios, voix basique</li>
          <li><strong>pro 29€/mois</strong> : illimité, 23 studios, voix premium, marketplace</li>
          <li><strong>business sur devis</strong> : multi-user, marketplace 30%, white-label</li>
          <li><strong>admin</strong> (toi Kevin) : tout illimité, jamais bloqué</li>
        </ul>
      </div>
    </div>
  `;
}

function renderUsersTab(): string {
  const users = auth.listUsers();
  /* Tier whitelist anti-XSS — fix audit UX P1 */
  const ALLOWED_TIERS = new Set(['admin', 'family', 'client_pro', 'client_free']);
  const list = users
    .map(
      (u) => {
        const safeTier = ALLOWED_TIERS.has(u.tier) ? u.tier : 'client_free';
        return `
      <li class="ax-user-row">
        <span class="ax-user-name">${escapeHtml(u.name)}</span>
        <span class="ax-tier-badge ax-tier-${safeTier}">${escapeHtml(safeTier)}</span>
        ${u.activated ? '<span class="ax-badge ax-badge-ok">activé</span>' : '<span class="ax-badge ax-badge-pending">en attente</span>'}
        <select data-user-plan="${escapeHtml(u.id)}" class="ax-select-sm">
          <option value="free">free</option>
          <option value="basic">basic</option>
          <option value="pro">pro</option>
          <option value="business">business</option>
        </select>
      </li>
    `;
      },
    )
    .join('');

  return `
    <div class="ax-admin-section">
      <h2>Créer un compte</h2>
      <form id="create-user-form" class="ax-form">
        <label>
          Nom complet
          <input type="text" id="cu-name" required minlength="2" autocomplete="off">
        </label>
        <label>
          Type de compte
          <select id="cu-tier" required>
            <option value="family">Famille</option>
            <option value="client_pro">Client Pro</option>
            <option value="client_free">Client Gratuit</option>
          </select>
        </label>
        <label>
          Email (optionnel)
          <input type="email" id="cu-email" autocomplete="off">
        </label>
        <label>
          Téléphone WhatsApp (avec indicatif, ex: +33612345678)
          <input type="tel" id="cu-whatsapp" autocomplete="off" placeholder="+33...">
        </label>
        <label>
          Code PIN initial (optionnel — sinon le client le crée à sa 1ère connexion)
          <input type="password" id="cu-pin" minlength="4" autocomplete="new-password">
        </label>
        <button type="submit" class="ax-btn ax-btn-primary">Créer le compte</button>
      </form>
      <div id="create-user-result"></div>

      <h2>Comptes existants (${users.length})</h2>
      <ul class="ax-user-list">${list || '<li class="ax-muted">Aucun compte créé pour l\'instant</li>'}</ul>
    </div>
  `;
}

function renderPendingTab(): string {
  const pending = whatsapp.listPending();
  if (!pending.length) {
    return `
      <div class="ax-admin-section">
        <h2>Confirmations en attente</h2>
        <p class="ax-muted">Aucune confirmation à valider.</p>
      </div>
    `;
  }
  const items = pending
    .map(
      (p) => `
      <li class="ax-pending-row">
        <strong>${escapeHtml(p.name)}</strong>
        <span class="ax-muted">${escapeHtml(p.whatsapp)}</span>
        <code class="ax-otp">${p.otp}</code>
        <button class="ax-btn ax-btn-sm" data-confirm-otp="${p.otp}">Confirmer</button>
      </li>
    `,
    )
    .join('');
  return `
    <div class="ax-admin-section">
      <h2>Confirmations WhatsApp en attente</h2>
      <p class="ax-muted">Quand le client te a envoyé son code par WhatsApp, clique "Confirmer".</p>
      <ul class="ax-pending-list">${items}</ul>
    </div>
  `;
}

function renderHealthTab(): string {
  return `
    <div class="ax-admin-section">
      <h2>État de santé</h2>
      <p class="ax-muted">Sentinelles + providers IA — Jet 2 enrichira avec dashboard live.</p>
    </div>
  `;
}

function renderProjectsTab(): string {
  const projects = kdmcProjectsRegistry.list();
  const total = kdmcProjectsRegistry.count();
  const active = kdmcProjectsRegistry.countActive();

  const STATUSES: ProjectStatus[] = ['active', 'wip', 'archived'];
  const items = projects
    .map((p) => {
      const safeStatus = STATUSES.includes(p.status) ? p.status : 'archived';
      const stack = p.tech_stack.slice(0, 4).map((s) => escapeHtml(s)).join(', ');
      return `
        <li class="ax-project-row" data-project-id="${escapeHtml(p.id)}">
          <div class="ax-project-head">
            <strong>${escapeHtml(p.name)}</strong>
            <span class="ax-badge ax-badge-${safeStatus}">${escapeHtml(safeStatus)}</span>
            <code class="ax-project-version">${escapeHtml(p.version)}</code>
          </div>
          <p class="ax-muted">${escapeHtml(p.description)}</p>
          <p class="ax-project-stack"><em>stack:</em> ${stack || '—'}</p>
          <p class="ax-project-links">
            <a href="${escapeHtml(p.deploy_url)}" target="_blank" rel="noopener">🚀 Live</a>
            ·
            <a href="${escapeHtml(p.repo_url)}" target="_blank" rel="noopener">📦 Repo</a>
            · <span class="ax-muted">🛡 ${p.sentinels_count} sentinelles</span>
          </p>
          <div class="ax-project-edit">
            <input type="text" data-project-version="${escapeHtml(p.id)}"
                   value="${escapeHtml(p.version)}" placeholder="vX.Y" maxlength="20"
                   class="ax-input-sm" autocomplete="off">
            <select data-project-status="${escapeHtml(p.id)}" class="ax-select-sm">
              <option value="active" ${p.status === 'active' ? 'selected' : ''}>active</option>
              <option value="wip" ${p.status === 'wip' ? 'selected' : ''}>wip</option>
              <option value="archived" ${p.status === 'archived' ? 'selected' : ''}>archived</option>
            </select>
            <button class="ax-btn ax-btn-sm" data-project-save="${escapeHtml(p.id)}">💾</button>
          </div>
        </li>
      `;
    })
    .join('');

  return `
    <div class="ax-admin-section">
      <h2>📦 Projets KDMC (${total} — ${active} actifs/wip)</h2>
      <p class="ax-muted">
        Source de vérité injectée dans le system prompt IA Apex. Modifie version/statut → Apex le sait au prochain message.
      </p>
      <ul class="ax-project-list">${items || '<li class="ax-muted">Aucun projet enregistré</li>'}</ul>
    </div>
  `;
}

function renderTabs(): string {
  const tabs: Array<[Tab, string]> = [
    ['commerce', '💳 Commerce'],
    ['users', '👥 Comptes'],
    ['pending', '📨 En attente'],
    ['health', '🩺 Santé'],
    ['projects', '📦 Projets KDMC'],
    ['executions', '⚙ Exécutions'],
    ['knowledge', '📚 Base connaissances'],
    ['bilan', '📊 Bilan'],
    ['consumption', '💰 Conso IA'],
  ];
  /* v13.0.81 fix Kevin "icônes superposées texte" iPhone : flex-shrink:0 + nowrap + min-width 44px */
  return tabs
    .map(
      ([id, label]) => `
      <button class="ax-tab ${activeTab === id ? 'ax-tab-active' : ''}" data-tab="${id}" style="flex-shrink:0;white-space:nowrap;min-height:44px;padding:10px 14px;font-size:13px;border-radius:10px;cursor:pointer">${label}</button>
    `,
    )
    .join('');
}

function renderExecutionsTab(): string {
  const executions = apexExecute.listPendingExecutions({ limit: 30 });
  const stats = apexExecute.getStats();
  const allowed = apexExecute.listAllowedTasks();
  const forbidden = apexExecute.listForbiddenTasks();

  const STATUS_BADGES: Record<string, string> = {
    pending: 'pending',
    dispatched: 'wip',
    running: 'wip',
    completed: 'ok',
    failed: 'error',
    cancelled: 'archived',
    timeout: 'error',
  };

  const items = executions
    .map((req: ExecutionRequest) => {
      const safeStatus = STATUS_BADGES[req.status] ?? 'archived';
      const date = new Date(req.ts_created).toLocaleString();
      const duration = req.duration_ms ? `${Math.round(req.duration_ms / 1000)}s` : '—';
      const wfLink = req.workflow_run_url
        ? `<a href="${escapeHtml(req.workflow_run_url)}" target="_blank" rel="noopener">🔗 Workflow</a>`
        : '<span class="ax-muted">—</span>';
      const canCancel = req.status === 'pending' || req.status === 'dispatched';
      return `
        <li class="ax-execution-row" data-exec-id="${escapeHtml(req.id)}">
          <div class="ax-exec-head">
            <code class="ax-exec-id">${escapeHtml(req.id.slice(0, 18))}</code>
            <span class="ax-badge ax-badge-${safeStatus}">${escapeHtml(req.status)}</span>
            <strong>${escapeHtml(req.task)}</strong>
          </div>
          <p class="ax-muted">📅 ${escapeHtml(date)} · ⏱ ${escapeHtml(duration)} · 🚀 ${escapeHtml(req.src)} · 👤 ${escapeHtml(req.initiated_by)}</p>
          ${req.error ? `<p class="ax-error">⚠ ${escapeHtml(req.error.slice(0, 200))}</p>` : ''}
          <p class="ax-exec-actions">
            ${wfLink}
            ${canCancel ? ` · <button class="ax-btn ax-btn-sm" data-exec-cancel="${escapeHtml(req.id)}">✕ Annuler</button>` : ''}
            · <button class="ax-btn ax-btn-sm" data-exec-poll="${escapeHtml(req.id)}">🔄 Refresh</button>
          </p>
        </li>
      `;
    })
    .join('');

  return `
    <div class="ax-admin-section">
      <h2>🤖 Exécutions autonomes (apex-execute)</h2>
      <p class="ax-muted">
        Pont autonome IA → Claude Code via GitHub Actions. Apex IA peut exécuter du code réel
        (modify_file, run_test, deploy_canary…) en dispatchant un workflow CI qui utilise Claude Code Action.
      </p>
      <div class="ax-info-card">
        <h3>📊 Stats</h3>
        <ul>
          <li><strong>Total</strong> : ${stats.total}</li>
          <li><strong>En cours</strong> : ${stats.pending} pending / ${stats.running} running</li>
          <li><strong>Terminées</strong> : ${stats.completed} ✅ · ${stats.failed} ❌ · ${stats.cancelled} 🚫</li>
          <li><strong>Success rate</strong> : ${stats.success_rate}%</li>
          <li><strong>Avg duration</strong> : ${Math.round(stats.avg_duration_ms / 1000)}s</li>
        </ul>
      </div>
      <div class="ax-info-card">
        <h3>✅ Tâches autorisées (${allowed.length})</h3>
        <p>${allowed.map((t) => `<code>${escapeHtml(t)}</code>`).join(' · ')}</p>
        <h3>🚫 Tâches INTERDITES (${forbidden.length})</h3>
        <p class="ax-muted">${forbidden.map((t) => `<code>${escapeHtml(t)}</code>`).join(' · ')}</p>
      </div>
      <h3>📋 Historique récent</h3>
      <ul class="ax-execution-list">${items || '<li class="ax-muted">Aucune exécution pour l\'instant.</li>'}</ul>
    </div>
  `;
}

function renderContent(): string {
  switch (activeTab) {
    case 'commerce':
      return renderCommerceTab();
    case 'users':
      return renderUsersTab();
    case 'pending':
      return renderPendingTab();
    case 'health':
      return renderHealthTab();
    case 'projects':
      return renderProjectsTab();
    case 'executions':
      return renderExecutionsTab();
    case 'knowledge':
      return renderKnowledgeTab();
    case 'bilan':
      return '<div id="ax-admin-mount-bilan" class="ax-admin-section"><p class="ax-muted">Chargement du bilan financier…</p></div>';
    case 'consumption':
      return '<div id="ax-admin-mount-consumption" class="ax-admin-section"><p class="ax-muted">Chargement consommation IA…</p></div>';
  }
}

/**
 * Mount lazy-loaded admin sub-views (financial-bilan, consumption-dashboard).
 * Wires existing orphan modules into admin tabs (anti-pattern Declaration ≠ Deployment).
 */
async function mountLazyAdminView(rootEl: HTMLElement): Promise<void> {
  const mountBilan = rootEl.querySelector<HTMLElement>('#ax-admin-mount-bilan');
  if (mountBilan) {
    try {
      const mod = (await import('./financial-bilan.js')) as { render: (el: HTMLElement) => void };
      mod.render(mountBilan);
    } catch (err) {
      logger.warn('admin', 'financial-bilan render failed', { err });
      mountBilan.innerHTML = '<p class="ax-muted">Bilan indisponible (module ko)</p>';
    }
  }
  const mountConsumption = rootEl.querySelector<HTMLElement>('#ax-admin-mount-consumption');
  if (mountConsumption) {
    try {
      const mod = (await import('./consumption-dashboard.js')) as { render: (el: HTMLElement) => void };
      mod.render(mountConsumption);
    } catch (err) {
      logger.warn('admin', 'consumption-dashboard render failed', { err });
      mountConsumption.innerHTML = '<p class="ax-muted">Consommation indisponible (module ko)</p>';
    }
  }
}

function renderKnowledgeTab(): string {
  const repos = apexKnowledgeBase.listRepos();
  const stats = apexKnowledgeBase.getStats();
  const reposHtml = repos
    .map(
      (r) => `
      <li class="ax-repo-row">
        <code>${escapeHtml(r)}</code>
        ${repos.length > 1 ? `<button class="ax-btn ax-btn-sm" data-remove-repo="${escapeHtml(r)}">Retirer</button>` : ''}
      </li>
    `,
    )
    .join('');
  return `
    <div class="ax-admin-section">
      <h2>📚 Base de connaissances Kevin</h2>
      <p class="ax-muted">
        Apex peut chercher full-text dans le code de tes repos GitHub via API
        (5000 req/h authenticated, cache 1h).
      </p>

      <div class="ax-info-card">
        <strong>État :</strong> ${stats.repos} repos · ${stats.cache_entries} entrées cache · ${stats.index_entries} fichiers indexés
        <br>
        <strong>Token GitHub :</strong> ${stats.has_token ? '✅ configuré' : '⚪ Configure ax_github_token dans le Coffre pour 5000 req/h'}
      </div>

      <h3>Repos suivis</h3>
      <ul class="ax-repo-list">${reposHtml || '<li class="ax-muted">Aucun repo configuré</li>'}</ul>

      <form id="add-repo-form" class="ax-form">
        <label>
          <span>Ajouter un repo (format : owner/repo)</span>
          <input type="text" id="kb-add-repo" placeholder="kevin/MyProject"
                 maxlength="100" autocomplete="off" class="ax-input">
        </label>
        <button type="submit" class="ax-btn ax-btn-primary">Ajouter</button>
      </form>

      <h3>Recherche dans le code</h3>
      <form id="kb-search-form" class="ax-form">
        <input type="text" id="kb-search-query" placeholder="Cherche dans tes repos..."
               maxlength="200" autocomplete="off" class="ax-input">
        <button type="submit" class="ax-btn ax-btn-primary">Chercher</button>
      </form>
      <div id="kb-search-results" class="ax-kb-results"></div>

      <div class="ax-actions">
        <button class="ax-btn ax-btn-sm" id="kb-clear-cache">🧹 Vider le cache</button>
      </div>
    </div>
  `;
}

function attachHandlers(rootEl: HTMLElement): void {
  /* Nav route delegation (CSP strict — replaces inline onclick) */
  rootEl.querySelectorAll<HTMLButtonElement>('[data-nav-route]').forEach((btn) => {
    btn.addEventListener('click', () => {
      haptic.tap();
      const route = btn.dataset['navRoute'] ?? 'chat';
      window.location.hash = '#' + route;
    });
  });

  /* Select-all delegation for input click (CSP strict) */
  rootEl.querySelectorAll<HTMLInputElement>('[data-action="select-all"]').forEach((input) => {
    input.addEventListener('click', () => {
      input.select();
    });
  });

  rootEl.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      haptic.selection();
      activeTab = btn.dataset['tab'] as Tab;
      void render(rootEl);
    });
  });

  const toggle = rootEl.querySelector<HTMLInputElement>('#commerce-toggle');
  if (toggle) {
    toggle.addEventListener('change', () => {
      haptic.medium();
      commerce.setEnabled(toggle.checked);
      toast.success(`Commercialisation ${toggle.checked ? 'activée' : 'désactivée'}`);
      void render(rootEl);
    });
  }

  const form = rootEl.querySelector<HTMLFormElement>('#create-user-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      void handleCreateUser(rootEl);
    });
  }

  rootEl.querySelectorAll<HTMLSelectElement>('[data-user-plan]').forEach((select) => {
    select.addEventListener('change', () => {
      const uid = select.dataset['userPlan'] ?? '';
      if (!uid) return;
      commerce.setUserPlan(uid, select.value as Plan);
      logger.info('admin', `Plan ${select.value} → ${uid}`);
    });
  });

  rootEl.querySelectorAll<HTMLButtonElement>('[data-project-save]').forEach((btn) => {
    btn.addEventListener('click', () => {
      haptic.tap();
      const id = btn.dataset['projectSave'] ?? '';
      if (!id) return;
      const verEl = rootEl.querySelector<HTMLInputElement>(`[data-project-version="${CSS.escape(id)}"]`);
      const statusEl = rootEl.querySelector<HTMLSelectElement>(`[data-project-status="${CSS.escape(id)}"]`);
      const newVersion = (verEl?.value ?? '').trim();
      const newStatus = (statusEl?.value ?? 'active') as ProjectStatus;
      if (!newVersion) {
        toast.warn('Version requise');
        return;
      }
      const ok = kdmcProjectsRegistry.update(id, { version: newVersion, status: newStatus });
      if (ok) {
        haptic.success();
        toast.success(`${id} → ${newVersion} (${newStatus})`);
        logger.info('admin', `Project ${id} updated`, { version: newVersion, status: newStatus });
        void render(rootEl);
      } else {
        haptic.error();
        toast.error('Update échoué');
      }
    });
  });

  rootEl.querySelectorAll<HTMLButtonElement>('[data-confirm-otp]').forEach((btn) => {
    btn.addEventListener('click', () => {
      haptic.tap();
      const otp = btn.dataset['confirmOtp'] ?? '';
      if (!otp) return;
      const result = whatsapp.confirm(otp);
      if (result.ok) {
        haptic.success();
        toast.success('Compte activé');
        logger.info('admin', `Confirmed user ${result.uid}`);
        void render(rootEl);
      } else {
        haptic.error();
        toast.error('Code OTP invalide ou expiré');
      }
    });
  });

  /* Apex execute : cancel + poll handlers */
  rootEl.querySelectorAll<HTMLButtonElement>('[data-exec-cancel]').forEach((btn) => {
    btn.addEventListener('click', () => {
      haptic.tap();
      const id = btn.dataset['execCancel'] ?? '';
      if (!id) return;
      const ok = apexExecute.cancelExecution(id);
      if (ok) {
        haptic.success();
        toast.success('Exécution annulée');
        void render(rootEl);
      } else {
        haptic.warning();
        toast.warn('Annulation impossible');
      }
    });
  });

  rootEl.querySelectorAll<HTMLButtonElement>('[data-exec-poll]').forEach((btn) => {
    btn.addEventListener('click', () => {
      haptic.tap();
      const id = btn.dataset['execPoll'] ?? '';
      if (!id) return;
      void apexExecute.pollResult(id).then((req) => {
        if (req) {
          toast.success(`Statut : ${req.status}`);
          void render(rootEl);
        } else {
          toast.warn('Exécution introuvable');
        }
      });
    });
  });

  /* ========== Knowledge Base handlers ========== */
  const addRepoForm = rootEl.querySelector<HTMLFormElement>('#add-repo-form');
  if (addRepoForm) {
    addRepoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      haptic.tap();
      const input = rootEl.querySelector<HTMLInputElement>('#kb-add-repo');
      const value = input?.value.trim() ?? '';
      if (!value) {
        toast.warn('Indique un repo');
        return;
      }
      const r = apexKnowledgeBase.addRepo(value);
      if (r.ok) {
        haptic.success();
        toast.success(`Repo ajouté : ${value}`);
        void render(rootEl);
      } else {
        haptic.error();
        toast.error(r.reason ?? 'Erreur ajout repo');
      }
    });
  }

  rootEl.querySelectorAll<HTMLButtonElement>('[data-remove-repo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      haptic.tap();
      const repo = btn.dataset['removeRepo'] ?? '';
      if (!repo) return;
      apexKnowledgeBase.removeRepo(repo);
      toast.success(`Repo retiré : ${repo}`);
      void render(rootEl);
    });
  });

  const searchForm = rootEl.querySelector<HTMLFormElement>('#kb-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      haptic.tap();
      const queryInput = rootEl.querySelector<HTMLInputElement>('#kb-search-query');
      const resultsEl = rootEl.querySelector<HTMLDivElement>('#kb-search-results');
      const query = queryInput?.value.trim() ?? '';
      if (!query || !resultsEl) return;
      resultsEl.innerHTML = '<p class="ax-muted">Recherche en cours...</p>';
      void apexKnowledgeBase.searchCode(query).then((results) => {
        if (results.length === 0) {
          resultsEl.innerHTML = '<p class="ax-muted">Aucun résultat (configure ax_github_token pour augmenter la limite).</p>';
          return;
        }
        const itemsHtml = results
          .slice(0, 20)
          .map(
            (r) => `
            <li class="ax-kb-result">
              <a href="${escapeHtml(r.htmlUrl)}" target="_blank" rel="noopener">
                <code>${escapeHtml(r.path)}</code>
              </a>
              <span class="ax-muted">${escapeHtml(r.repo)} · score ${r.score.toFixed(2)}</span>
            </li>
          `,
          )
          .join('');
        resultsEl.innerHTML = `<ul class="ax-kb-results-list">${itemsHtml}</ul>`;
      });
    });
  }

  const clearCacheBtn = rootEl.querySelector<HTMLButtonElement>('#kb-clear-cache');
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', () => {
      haptic.tap();
      const r = apexKnowledgeBase.clearCache();
      toast.success(`Cache vidé : ${r.cleared} entrées`);
      void render(rootEl);
    });
  }
}

async function handleCreateUser(rootEl: HTMLElement): Promise<void> {
  const name = rootEl.querySelector<HTMLInputElement>('#cu-name')?.value.trim() ?? '';
  const tier = (rootEl.querySelector<HTMLSelectElement>('#cu-tier')?.value ?? 'family') as
    | 'family'
    | 'client_pro'
    | 'client_free';
  const email = rootEl.querySelector<HTMLInputElement>('#cu-email')?.value.trim() ?? '';
  const whatsappPhone = rootEl.querySelector<HTMLInputElement>('#cu-whatsapp')?.value.trim() ?? '';
  const pin = rootEl.querySelector<HTMLInputElement>('#cu-pin')?.value ?? '';

  if (!name || name.length < 2) {
    haptic.warning();
    toast.warn('Nom complet requis (min 2 caractères)');
    return;
  }

  const result = await auth.createUser({
    name,
    tier,
    ...(email && { email }),
    ...(whatsappPhone && { whatsappPhone }),
    ...(pin && { initialPin: pin }),
  });
  const resultEl = rootEl.querySelector<HTMLElement>('#create-user-result');
  if (!resultEl) return;
  if (!result.ok || !result.uid) {
    haptic.error();
    const reason = result.reason ?? 'Erreur création';
    resultEl.innerHTML = `<div class="ax-error">${escapeHtml(reason)}</div>`;
    toast.error(reason);
    return;
  }
  haptic.success();
  toast.success(`Compte ${name} créé`);

  let waLink = '';
  if (whatsappPhone) {
    const conf = await whatsapp.requestConfirmation({ uid: result.uid, name, whatsappPhone });
    if (conf.ok && conf.inviteLink) {
      waLink = `
        <a href="${conf.inviteLink}" target="_blank" rel="noopener" class="ax-btn ax-btn-primary">
          📨 Envoyer le code via WhatsApp
        </a>
        <p class="ax-muted">Code OTP : <code>${conf.otp}</code></p>
      `;
    }
  }

  resultEl.innerHTML = `
    <div class="ax-success">
      Compte créé : <strong>${escapeHtml(name)}</strong> (${tier})
      <p>Lien d'invitation : <input type="text" readonly value="${result.inviteLink ?? ''}" data-action="select-all" style="width:100%"></p>
      ${waLink}
    </div>
  `;
  void render(rootEl);
}

export function render(rootEl: HTMLElement): void {
  const isAdmin = store.get('isAdmin');
  if (!isAdmin) {
    rootEl.innerHTML = `
      <div class="ax-empty">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;
    return;
  }

  rootEl.innerHTML = `
    <div class="ax-admin">
      <header class="ax-admin-header">
        <h1>Centre Admin</h1>
        <button class="ax-btn ax-btn-sm" data-nav-route="chat">← Chat</button>
      </header>
      <nav class="ax-tabs" style="display:flex;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding:8px;border-bottom:1px solid var(--ax-border);scrollbar-width:thin">${renderTabs()}</nav>
      <div class="ax-admin-content">${renderContent()}</div>
    </div>
  `;
  attachHandlers(rootEl);
  /* Mount lazy admin views (bilan, consumption) — fire and forget, errors logged */
  if (activeTab === 'bilan' || activeTab === 'consumption') {
    void mountLazyAdminView(rootEl);
  }
}
