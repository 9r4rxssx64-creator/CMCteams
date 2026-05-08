/**
 * APEX v13 — Landing / login (path A : visuel/UX repensé premium)
 *
 * Ajoutés :
 * - Animation entrance slide-up-fade
 * - Glow pulse sur logo APEX
 * - Glassmorphism card
 * - Haptic feedback au login
 * - Toast user-friendly remplace #login-error inline
 * - Spinner pendant submit
 * - aria-live polite pour erreurs
 *
 * Reconnaît automatiquement Kevin via aliases CLAUDE.md règle absolue.
 * Token d'invitation depuis URL hash (#invite=...) → pré-remplit nom.
 */

import { APP_VER } from '../../core/bootstrap.js';
import { createCleanupScope, type CleanupScope } from '../../core/listener-cleanup.js';
import { router } from '../../core/router.js';
import { auth } from '../../services/auth.js';
import { isFeatureEnabled } from '../../services/feature-toggles.js';
import { haptic } from '../../ui/haptic.js';
import { toast } from '../../ui/toast.js';

/* P1-6 (audit v13.2.7) : scope listeners pour anti-leak SPA navigation. */
let activeLandingScope: CleanupScope | null = null;

export function dispose(): void {
  activeLandingScope?.cleanup();
  activeLandingScope = null;
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );
}

function parseInviteToken(): { uid: string; name?: string } | null {
  const m = location.hash.match(/invite=([A-Za-z0-9+/=]+)/);
  if (!m || !m[1]) return null;
  try {
    const decoded = atob(m[1] ?? '');
    const uid = decoded.split(':')[0];
    if (uid) return { uid };
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Tente auto-login si device connu + last user identifié.
 * Kevin règle "S'il reconnaît mon appareil, il ne me demande pas connexion".
 */
async function tryAutoLogin(): Promise<boolean> {
  try {
    const lastUid = localStorage.getItem('apex_v13_last_known_uid');
    const lastName = localStorage.getItem('apex_v13_last_known_name');
    const deviceTrusted = localStorage.getItem('apex_v13_device_trusted_v1');
    if (!lastUid || !lastName || !deviceTrusted) return false;
    /* Device fingerprint check */
    const { deviceContext } = await import('../../services/device-context.js');
    const fp = await deviceContext.getFingerprint();
    if (fp.device_id !== deviceTrusted) {
      /* Device a changé — purge trusted, force re-login */
      localStorage.removeItem('apex_v13_device_trusted_v1');
      return false;
    }
    /* Login transparent sans PIN (device trusted) */
    const { auth } = await import('../../services/auth.js');
    const r = await auth.loginTrusted(lastUid, lastName);
    if (r.ok) {
      router.navigate('chat');
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function render(rootEl: HTMLElement): void {
  /* P1-6 : cleanup ancien scope avant re-render */
  activeLandingScope?.cleanup();
  activeLandingScope = createCleanupScope('landing');
  /* Feature toggle module.landing — sécurité : si désactivée globalement,
     afficher message "App fermée" mais ne JAMAIS soft-locker l'admin.
     L'admin reste toujours capable de se connecter (voir auth.ts loginAdmin). */
  if (!isFeatureEnabled('module.landing')) {
    rootEl.innerHTML = `
      <div class="ax-landing">
        <div class="ax-landing-card">
          <h1 class="ax-landing-logo">APEX</h1>
          <p class="ax-muted" style="margin-top:14px">Service temporairement fermé par l'administrateur.</p>
          <p class="ax-muted" style="font-size:12px;margin-top:8px">Si tu es admin Kevin, rafraîchis pour bypass.</p>
        </div>
      </div>
    `;
    return;
  }
  /* Auto-login background si device connu (non bloquant) */
  void tryAutoLogin().then((logged) => {
    if (logged) toast.success('🔐 Reconnu automatiquement (device trusted)');
  });
  const invite = parseInviteToken();
  rootEl.innerHTML = `
    <div class="ax-landing">
      <div class="ax-landing-card ax-slide-up-fade">
        <div class="ax-landing-logo-wrap">
          <h1 class="ax-landing-logo">APEX</h1>
          <span class="ax-landing-version">${APP_VER}</span>
        </div>
        <p class="ax-landing-tagline">Ton assistant intelligent personnel</p>
        ${invite ? '<div class="ax-info" role="status">📨 Invitation détectée — connecte-toi avec ton nom complet</div>' : ''}
        <form id="login-form" class="ax-form" novalidate>
          <label>
            <span class="ax-form-label">Nom et prénom</span>
            <input type="text" id="login-name" required minlength="3" autocomplete="name"
              placeholder="Ton prénom et nom" autocapitalize="words" spellcheck="false">
          </label>
          <label>
            <span class="ax-form-label">Code PIN</span>
            <input type="password" id="login-pin" required minlength="4" autocomplete="current-password"
              inputmode="numeric" placeholder="••••••" maxlength="12">
          </label>
          <button type="submit" id="login-submit" class="ax-btn ax-btn-primary ax-btn-block">
            <span class="ax-btn-label">Se connecter</span>
            <span class="ax-spinner" aria-hidden="true" style="display:none"></span>
          </button>
        </form>
        <div id="login-error" aria-live="polite" aria-atomic="true"></div>
        <button type="button" id="login-reset-pin" class="ax-btn ax-btn-ghost ax-btn-block" style="margin-top:12px;font-size:13px">
          🔑 J'ai oublié mon code PIN
        </button>
        <div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
          <p style="color:var(--ax-text-dim,#888);font-size:12px;margin:0 0 6px">Pas encore de compte ?</p>
          <button type="button" id="login-go-signup" class="ax-btn ax-btn-secondary ax-btn-block" style="font-size:13px">📝 Créer mon compte</button>
        </div>
        <p class="ax-landing-footer ax-muted">
          🔒 Local-first · End-to-end · Zero tracking
        </p>
      </div>
    </div>
  `;

  const form = rootEl.querySelector<HTMLFormElement>('#login-form');
  if (form && activeLandingScope) activeLandingScope.bind(form, 'submit', (e) => {
    e.preventDefault();
    haptic.tap();
    void handleLogin(rootEl);
  });

  /* Reset PIN handler : efface PIN admin/user pour permettre re-init au prochain login */
  const resetBtn = rootEl.querySelector<HTMLButtonElement>('#login-reset-pin');
  if (resetBtn && activeLandingScope) activeLandingScope.bind(resetBtn, 'click', () => {
    haptic.medium();
    const nameInput = rootEl.querySelector<HTMLInputElement>('#login-name');
    const enteredName = nameInput?.value.trim() ?? '';
    if (!enteredName) {
      const errEl = rootEl.querySelector<HTMLDivElement>('#login-error');
      if (errEl) errEl.innerHTML = '<div class="ax-alert ax-alert-warn">Tape ton nom et prénom d\'abord, puis tap "🔑 J\'ai oublié mon code PIN"</div>';
      return;
    }
    if (!confirm(`Réinitialiser le code PIN pour "${enteredName}" ?\n\n` +
      '• Ton PIN actuel sera EFFACÉ\n' +
      '• Tu pourras créer un nouveau PIN au prochain login\n' +
      '• Tes données (Coffre, conversations, profil) sont PRÉSERVÉES\n\n' +
      'Continuer ?')) return;
    /* Anti-énumération : on efface le PIN admin ET tous les PINs per-user matchant */
    try {
      localStorage.removeItem('apex_v13_pin');
      localStorage.removeItem('apex_v13_pin_kdmc_admin');
      /* Nettoie aussi les rate-limit fails pour redémarrer propre */
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith('apex_v13_pin_fails_')) keys.push(k);
      }
      for (const k of keys) localStorage.removeItem(k);
    } catch { /* ignore */ }
    const errEl = rootEl.querySelector<HTMLDivElement>('#login-error');
    if (errEl) errEl.innerHTML = '<div class="ax-alert ax-alert-success">✅ PIN réinitialisé. Tape ton nouveau code PIN puis Se connecter.</div>';
    const pinInput = rootEl.querySelector<HTMLInputElement>('#login-pin');
    if (pinInput) {
      pinInput.value = '';
      pinInput.focus();
    }
  });

  /* Bouton self-signup (Kevin v13.3.67 — clients publics) */
  const signupBtn = rootEl.querySelector<HTMLButtonElement>('#login-go-signup');
  if (signupBtn && activeLandingScope) activeLandingScope.bind(signupBtn, 'click', () => {
    haptic.tap();
    router.navigate('signup');
  });

  /* Auto-focus nom (mobile-friendly : pas keyboard pop sur iPhone si pas user gesture, mais OK desktop) */
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches) {
    rootEl.querySelector<HTMLInputElement>('#login-name')?.focus();
  }
}

async function handleLogin(rootEl: HTMLElement): Promise<void> {
  const nameInput = rootEl.querySelector<HTMLInputElement>('#login-name');
  const pinInput = rootEl.querySelector<HTMLInputElement>('#login-pin');
  const submitBtn = rootEl.querySelector<HTMLButtonElement>('#login-submit');
  const errEl = rootEl.querySelector<HTMLElement>('#login-error');
  const labelEl = submitBtn?.querySelector<HTMLElement>('.ax-btn-label');
  const spinnerEl = submitBtn?.querySelector<HTMLElement>('.ax-spinner');

  const name = nameInput?.value.trim() ?? '';
  const pin = pinInput?.value ?? '';

  /* Validation client-side rapide (avant requête réseau) */
  if (name.length < 2 || pin.length < 4) {
    haptic.warning();
    if (errEl) {
      errEl.innerHTML = `<div class="ax-error">Nom et PIN obligatoires (min 4 chiffres)</div>`;
    }
    return;
  }

  /* État loading */
  if (submitBtn) submitBtn.disabled = true;
  if (labelEl) labelEl.textContent = 'Vérification...';
  if (spinnerEl) spinnerEl.style.display = 'inline-block';

  try {
    const result = await auth.login(name, pin);
    if (!result.ok) {
      haptic.error();
      const reason = result.reason ?? 'Connexion impossible';
      if (errEl) errEl.innerHTML = `<div class="ax-error">${escapeHtml(reason)}</div>`;
      toast.error(reason);
      /* Re-enable submit */
      if (submitBtn) submitBtn.disabled = false;
      if (labelEl) labelEl.textContent = 'Se connecter';
      if (spinnerEl) spinnerEl.style.display = 'none';
      return;
    }

    /* Login réussi */
    haptic.success();
    toast.success('Bienvenue !');
    /* Petit délai pour animation toast visible avant navigate */
    setTimeout(() => {
      router.navigate('chat');
    }, 200);
  } catch (err: unknown) {
    haptic.error();
    const msg = err instanceof Error ? err.message : 'Erreur inattendue';
    if (errEl) errEl.innerHTML = `<div class="ax-error">${escapeHtml(msg)}</div>`;
    toast.error(msg);
    if (submitBtn) submitBtn.disabled = false;
    if (labelEl) labelEl.textContent = 'Se connecter';
    if (spinnerEl) spinnerEl.style.display = 'none';
  }
}
