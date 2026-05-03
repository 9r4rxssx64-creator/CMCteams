/**
 * APEX v13 — Vue admin (Kevin only)
 *
 * Onglets :
 * - Commerce : toggle ON/OFF + assignation plans + statut commercialisation
 * - Users    : créer compte client/ami/famille + WhatsApp confirmation OTP
 * - Pending  : confirmations en attente (OTP reçus à valider)
 * - Health   : status providers IA + sentinelles
 */

import { logger } from '../../core/logger.js';
import { store } from '../../core/store.js';
import { auth } from '../../services/auth.js';
import { commerce, type Plan } from '../../services/commerce.js';
import { whatsapp } from '../../services/whatsapp.js';

type Tab = 'commerce' | 'users' | 'pending' | 'health';

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
  const list = users
    .map(
      (u) => `
      <li class="ax-user-row">
        <span class="ax-user-name">${escapeHtml(u.name)}</span>
        <span class="ax-tier-badge ax-tier-${u.tier}">${u.tier}</span>
        ${u.activated ? '<span class="ax-badge ax-badge-ok">activé</span>' : '<span class="ax-badge ax-badge-pending">en attente</span>'}
        <select data-user-plan="${u.id}" class="ax-select-sm">
          <option value="free">free</option>
          <option value="basic">basic</option>
          <option value="pro">pro</option>
          <option value="business">business</option>
        </select>
      </li>
    `,
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

function renderTabs(): string {
  const tabs: Array<[Tab, string]> = [
    ['commerce', '💳 Commerce'],
    ['users', '👥 Comptes'],
    ['pending', '📨 En attente'],
    ['health', '🩺 Santé'],
  ];
  return tabs
    .map(
      ([id, label]) => `
      <button class="ax-tab ${activeTab === id ? 'ax-tab-active' : ''}" data-tab="${id}">${label}</button>
    `,
    )
    .join('');
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
  }
}

function attachHandlers(rootEl: HTMLElement): void {
  rootEl.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset['tab'] as Tab;
      void render(rootEl);
    });
  });

  const toggle = rootEl.querySelector<HTMLInputElement>('#commerce-toggle');
  if (toggle) {
    toggle.addEventListener('change', () => {
      commerce.setEnabled(toggle.checked);
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

  rootEl.querySelectorAll<HTMLButtonElement>('[data-confirm-otp]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const otp = btn.dataset['confirmOtp'] ?? '';
      if (!otp) return;
      const result = whatsapp.confirm(otp);
      if (result.ok) {
        logger.info('admin', `Confirmed user ${result.uid}`);
        void render(rootEl);
      }
    });
  });
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
    resultEl.innerHTML = `<div class="ax-error">${escapeHtml(result.reason ?? 'Erreur')}</div>`;
    return;
  }

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
      <p>Lien d'invitation : <input type="text" readonly value="${result.inviteLink ?? ''}" onclick="this.select()" style="width:100%"></p>
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
        <button class="ax-btn ax-btn-sm" onclick="location.hash='#chat'">← Chat</button>
      </header>
      <nav class="ax-tabs">${renderTabs()}</nav>
      <div class="ax-admin-content">${renderContent()}</div>
    </div>
  `;
  attachHandlers(rootEl);
}
