/**
 * APEX v13 — Feature Browser embed (iframe + URL bar + safe sandbox).
 * Stub Sprint 2 — sera enrichi avec fallback cache web archive si X-Frame-Options.
 */

import { logger } from '../../core/logger.js';

export function render(rootEl: HTMLElement): void {
  const lastUrl = localStorage.getItem('apex_v13_browser_last_url') ?? 'https://www.google.com';
  rootEl.innerHTML = `
    <div class="ax-page" style="padding:0;display:flex;flex-direction:column;height:100vh">
      <div style="padding:8px;background:rgba(20,20,35,0.95);border-bottom:1px solid rgba(201,162,39,0.3);display:flex;gap:6px;align-items:center">
        <a href="#chat" style="color:#c9a227;text-decoration:none;padding:6px 10px;border-radius:6px;background:rgba(201,162,39,0.1)">← Chat</a>
        <input type="url" id="ax-browser-url" value="${lastUrl.replace(/"/g, '&quot;')}" style="flex:1;padding:8px;border-radius:6px;background:rgba(255,255,255,0.05);border:1px solid rgba(201,162,39,0.3);color:#fff;font-size:14px">
        <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-browser-go">Go</button>
      </div>
      <iframe id="ax-browser-iframe" src="${lastUrl.replace(/"/g, '&quot;')}"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        style="flex:1;border:none;background:#fff"></iframe>
    </div>
  `;
  const iframe = rootEl.querySelector<HTMLIFrameElement>('#ax-browser-iframe');
  const urlInput = rootEl.querySelector<HTMLInputElement>('#ax-browser-url');
  const goBtn = rootEl.querySelector<HTMLButtonElement>('#ax-browser-go');
  const navigate = (): void => {
    let u = urlInput?.value.trim() ?? '';
    if (!u) return;
    if (!u.startsWith('http')) u = 'https://' + u;
    localStorage.setItem('apex_v13_browser_last_url', u);
    if (iframe) iframe.src = u;
  };
  goBtn?.addEventListener('click', navigate);
  urlInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') navigate(); });
  logger.info('feature-browser', 'rendered');
}
