/**
 * APEX v13 — Landing / login (clients non encore connectés + invités)
 *
 * Reconnaît automatiquement Kevin via aliases CLAUDE.md règle absolue.
 * Token d'invitation depuis URL hash (#invite=...) → pré-remplit nom.
 */

import { auth } from '../../services/auth.js';
import { router } from '../../core/router.js';

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

function parseInviteToken(): { uid: string; name?: string } | null {
  const m = location.hash.match(/invite=([A-Za-z0-9+/=]+)/);
  if (!m || !m[1]) return null;
  try {
    const decoded = atob(m[1]);
    const [uid, _ts, _hash] = decoded.split(':');
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
      <div class="ax-landing-card">
        <h1 class="ax-landing-logo">APEX</h1>
        <p class="ax-landing-tagline">Ton assistant intelligent personnel</p>
        ${invite ? '<div class="ax-info">Invitation détectée — connecte-toi avec ton nom complet</div>' : ''}
        <form id="login-form" class="ax-form">
          <label>
            Nom et prénom
            <input type="text" id="login-name" required minlength="3" autocomplete="name" placeholder="Ex: Kevin DESARZENS">
          </label>
          <label>
            Code PIN
            <input type="password" id="login-pin" required minlength="4" autocomplete="current-password" inputmode="numeric">
          </label>
          <button type="submit" class="ax-btn ax-btn-primary ax-btn-block">Se connecter</button>
        </form>
        <div id="login-error"></div>
      </div>
    </div>
  `;

  const form = rootEl.querySelector<HTMLFormElement>('#login-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    void handleLogin(rootEl);
  });
}

async function handleLogin(rootEl: HTMLElement): Promise<void> {
  const name = rootEl.querySelector<HTMLInputElement>('#login-name')?.value.trim() ?? '';
  const pin = rootEl.querySelector<HTMLInputElement>('#login-pin')?.value ?? '';
  const errEl = rootEl.querySelector<HTMLElement>('#login-error');

  const result = await auth.login(name, pin);
  if (!result.ok) {
    if (errEl) errEl.innerHTML = `<div class="ax-error">${escapeHtml(result.reason ?? 'Connexion impossible')}</div>`;
    return;
  }
  router.navigate('chat');
}
