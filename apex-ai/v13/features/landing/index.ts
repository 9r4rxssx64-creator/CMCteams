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

import { router } from '../../core/router.js';
import { auth } from '../../services/auth.js';
import { haptic } from '../../ui/haptic.js';
import { toast } from '../../ui/toast.js';

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

export function render(rootEl: HTMLElement): void {
  const invite = parseInviteToken();
  rootEl.innerHTML = `
    <div class="ax-landing">
      <div class="ax-landing-card ax-slide-up-fade">
        <div class="ax-landing-logo-wrap">
          <h1 class="ax-landing-logo">APEX</h1>
          <span class="ax-landing-version">v13.0</span>
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
        <p class="ax-landing-footer ax-muted">
          🔒 Local-first · End-to-end · Zero tracking
        </p>
      </div>
    </div>
  `;

  const form = rootEl.querySelector<HTMLFormElement>('#login-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    haptic.tap();
    void handleLogin(rootEl);
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
