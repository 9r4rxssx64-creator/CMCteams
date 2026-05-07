/**
 * APEX v13 — Feature Signup (self-service inscription)
 *
 * Mission Kevin 2026-05-08 02h : "création de compte, 1ère connexion etc avec validation WhatsApp"
 *
 * Form public :
 *  - Prénom + Nom (séparés, validation 2-tokens règle v13.3.65)
 *  - Email
 *  - Téléphone WhatsApp (E.164)
 *  - Plan Free/Basic/Pro/Family
 *  - Consentements CGU + RGPD obligatoires
 *
 * Submit → signup.requestSignup() → wa.me link Kevin → vue waiting-approval.
 *
 * RGPD : consent enregistré dans signup record + audit log.
 */

import { createCleanupScope, type CleanupScope } from '../../core/listener-cleanup.js';
import { router } from '../../core/router.js';
import { signup, type SignupPlan } from '../../services/signup.js';
import { haptic } from '../../ui/haptic.js';
import { toast } from '../../ui/toast.js';

let activeScope: CleanupScope | null = null;

export function dispose(): void {
  activeScope?.cleanup();
  activeScope = null;
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );
}

const PLANS: Array<{ id: SignupPlan; label: string; price: string; features: string[] }> = [
  { id: 'free', label: '🆓 Découverte', price: '0 €', features: ['Chat IA basique', '50 messages/jour'] },
  { id: 'basic', label: '✨ Basic', price: '9,90 €/mois', features: ['Chat illimité', 'Studios', 'Voix'] },
  { id: 'pro', label: '💎 Pro', price: '29,90 €/mois', features: ['Tout Basic', 'Modules pro', 'Coffre, IoT'] },
  { id: 'family', label: '👨‍👩‍👧 Famille (sur invitation)', price: 'Gratuit', features: ['Accès complet', 'Validation Kevin'] },
];

export function render(rootEl: HTMLElement): void {
  activeScope?.cleanup();
  activeScope = createCleanupScope('signup');

  rootEl.innerHTML = `
    <div class="ax-signup" style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,#08080f 0%,#181820 100%)">
      <div class="ax-signup-card" style="max-width:560px;width:100%;background:rgba(20,20,35,0.92);backdrop-filter:blur(20px);border:1px solid rgba(201,162,39,0.3);border-radius:20px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="margin:0 0 4px;color:#c9a227;font-size:28px">📝 Créer mon compte Apex</h1>
          <p style="color:var(--ax-text-dim,#aaa);margin:0;font-size:14px">Validation par Kevin via WhatsApp · Local-first · RGPD-friendly</p>
        </div>

        <form id="signup-form" novalidate style="display:grid;gap:14px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label>
              <span style="display:block;color:#c9a227;font-size:12px;margin-bottom:4px">Prénom *</span>
              <input type="text" id="signup-prenom" required minlength="2" autocomplete="given-name"
                style="width:100%;padding:11px;background:rgba(0,0,0,0.3);border:1px solid rgba(201,162,39,0.3);border-radius:8px;color:#fff;font-size:14px"
                placeholder="Marc">
            </label>
            <label>
              <span style="display:block;color:#c9a227;font-size:12px;margin-bottom:4px">Nom *</span>
              <input type="text" id="signup-nom" required minlength="2" autocomplete="family-name"
                style="width:100%;padding:11px;background:rgba(0,0,0,0.3);border:1px solid rgba(201,162,39,0.3);border-radius:8px;color:#fff;font-size:14px"
                placeholder="Dupont">
            </label>
          </div>
          <label>
            <span style="display:block;color:#c9a227;font-size:12px;margin-bottom:4px">Email *</span>
            <input type="email" id="signup-email" required autocomplete="email" inputmode="email"
              style="width:100%;padding:11px;background:rgba(0,0,0,0.3);border:1px solid rgba(201,162,39,0.3);border-radius:8px;color:#fff;font-size:14px"
              placeholder="marc@example.com">
          </label>
          <label>
            <span style="display:block;color:#c9a227;font-size:12px;margin-bottom:4px">Téléphone WhatsApp * (format +33xxx)</span>
            <input type="tel" id="signup-whatsapp" required autocomplete="tel" inputmode="tel" pattern="^\\+\\d{6,15}$"
              style="width:100%;padding:11px;background:rgba(0,0,0,0.3);border:1px solid rgba(201,162,39,0.3);border-radius:8px;color:#fff;font-size:14px"
              placeholder="+33612345678">
          </label>

          <div>
            <span style="display:block;color:#c9a227;font-size:12px;margin-bottom:8px">Plan souhaité *</span>
            <div id="signup-plans" style="display:grid;gap:8px">
              ${PLANS.map((p, i) => `
                <label style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.08);border-radius:10px;cursor:pointer">
                  <input type="radio" name="signup-plan" value="${p.id}" ${i === 0 ? 'checked' : ''} style="accent-color:#c9a227">
                  <div style="flex:1">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                      <strong style="color:#fff;font-size:14px">${escapeHtml(p.label)}</strong>
                      <span style="color:#c9a227;font-size:13px">${escapeHtml(p.price)}</span>
                    </div>
                    <div style="color:var(--ax-text-dim,#888);font-size:11px;margin-top:2px">${escapeHtml(p.features.join(' · '))}</div>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>

          <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:14px;display:grid;gap:8px">
            <label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer;font-size:12px;color:var(--ax-text-dim,#aaa)">
              <input type="checkbox" id="signup-cgu" required style="margin-top:2px;accent-color:#c9a227">
              <span>J'accepte les <a href="#" id="signup-link-cgu" style="color:#c9a227;text-decoration:underline">CGU</a> et la <a href="#" id="signup-link-privacy" style="color:#c9a227;text-decoration:underline">Politique de confidentialité</a></span>
            </label>
            <label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer;font-size:12px;color:var(--ax-text-dim,#aaa)">
              <input type="checkbox" id="signup-rgpd" required style="margin-top:2px;accent-color:#c9a227">
              <span>J'autorise le traitement de mes données pour la création + gestion de mon compte Apex (RGPD Art. 6.1.b contrat)</span>
            </label>
          </div>

          <button type="submit" id="signup-submit" class="ax-btn ax-btn-primary ax-btn-block" style="margin-top:8px">
            <span class="ax-btn-label">📤 Envoyer ma demande via WhatsApp</span>
            <span class="ax-spinner" aria-hidden="true" style="display:none"></span>
          </button>
        </form>

        <div id="signup-error" aria-live="polite" aria-atomic="true" style="margin-top:12px"></div>

        <div style="text-align:center;margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08)">
          <p style="color:var(--ax-text-dim,#888);font-size:12px;margin:0 0 8px">Déjà un compte ?</p>
          <button type="button" id="signup-go-login" class="ax-btn ax-btn-ghost" style="font-size:13px">← Retour à la connexion</button>
        </div>
      </div>
    </div>
  `;

  wireForm(rootEl);
}

function wireForm(rootEl: HTMLElement): void {
  if (!activeScope) return;

  const form = rootEl.querySelector<HTMLFormElement>('#signup-form');
  if (form) {
    activeScope.bind(form, 'submit', (e) => {
      e.preventDefault();
      haptic.tap();
      void handleSubmit(rootEl);
    });
  }

  const backBtn = rootEl.querySelector<HTMLButtonElement>('#signup-go-login');
  if (backBtn) {
    activeScope.bind(backBtn, 'click', () => {
      haptic.tap();
      router.navigate('landing');
    });
  }

  const linkCgu = rootEl.querySelector<HTMLAnchorElement>('#signup-link-cgu');
  if (linkCgu) {
    activeScope.bind(linkCgu, 'click', (e) => {
      e.preventDefault();
      router.navigate('legal');
    });
  }
  const linkPrivacy = rootEl.querySelector<HTMLAnchorElement>('#signup-link-privacy');
  if (linkPrivacy) {
    activeScope.bind(linkPrivacy, 'click', (e) => {
      e.preventDefault();
      router.navigate('legal');
    });
  }
}

async function handleSubmit(rootEl: HTMLElement): Promise<void> {
  const prenom = (rootEl.querySelector<HTMLInputElement>('#signup-prenom')?.value ?? '').trim();
  const nom = (rootEl.querySelector<HTMLInputElement>('#signup-nom')?.value ?? '').trim();
  const email = (rootEl.querySelector<HTMLInputElement>('#signup-email')?.value ?? '').trim();
  const whatsapp = (rootEl.querySelector<HTMLInputElement>('#signup-whatsapp')?.value ?? '').trim();
  const plan = (rootEl.querySelector<HTMLInputElement>('input[name="signup-plan"]:checked')?.value ?? 'free') as SignupPlan;
  const cgu = rootEl.querySelector<HTMLInputElement>('#signup-cgu')?.checked ?? false;
  const rgpdConsent = rootEl.querySelector<HTMLInputElement>('#signup-rgpd')?.checked ?? false;

  const submitBtn = rootEl.querySelector<HTMLButtonElement>('#signup-submit');
  const labelEl = submitBtn?.querySelector<HTMLElement>('.ax-btn-label');
  const spinnerEl = submitBtn?.querySelector<HTMLElement>('.ax-spinner');
  const errEl = rootEl.querySelector<HTMLElement>('#signup-error');

  if (errEl) errEl.innerHTML = '';

  if (submitBtn) submitBtn.disabled = true;
  if (labelEl) labelEl.textContent = 'Envoi en cours...';
  if (spinnerEl) spinnerEl.style.display = 'inline-block';

  try {
    const result = await signup.requestSignup({
      prenom,
      nom,
      email,
      whatsapp,
      plan,
      consent: { cgu, rgpd: rgpdConsent, ts: Date.now() },
    });

    if (!result.ok) {
      haptic.error();
      if (errEl) errEl.innerHTML = `<div class="ax-alert ax-alert-warn">⚠️ ${escapeHtml(result.reason ?? 'Erreur')}</div>`;
      toast.error(result.reason ?? 'Erreur');
      if (submitBtn) submitBtn.disabled = false;
      if (labelEl) labelEl.textContent = '📤 Envoyer ma demande via WhatsApp';
      if (spinnerEl) spinnerEl.style.display = 'none';
      return;
    }

    /* Success — store request id pour vue waiting-approval */
    haptic.success();
    try {
      if (result.requestId) localStorage.setItem('apex_v13_signup_pending_id', result.requestId);
      if (result.inviteLink) localStorage.setItem('apex_v13_signup_invite_link', result.inviteLink);
    } catch { /* ignore */ }

    /* Ouvre WhatsApp dans nouvel onglet (pré-rempli avec OTP) */
    if (result.inviteLink) {
      try { window.open(result.inviteLink, '_blank'); } catch { /* ignore */ }
    }

    toast.success('✅ Demande envoyée — ouvre WhatsApp pour valider');
    setTimeout(() => router.navigate('waiting-approval'), 500);
  } catch (err: unknown) {
    haptic.error();
    const msg = err instanceof Error ? err.message : 'Erreur inattendue';
    if (errEl) errEl.innerHTML = `<div class="ax-alert ax-alert-error">${escapeHtml(msg)}</div>`;
    toast.error(msg);
    if (submitBtn) submitBtn.disabled = false;
    if (labelEl) labelEl.textContent = '📤 Envoyer ma demande via WhatsApp';
    if (spinnerEl) spinnerEl.style.display = 'none';
  }
}
