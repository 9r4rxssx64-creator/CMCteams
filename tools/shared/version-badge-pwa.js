/**
 * Kevin v9.615+ — Shared Version Badge + Auto-Force-Update for ALL Kevin projects.
 *
 * Inclure dans CHAQUE HTML projet (tools/, _PROJECTS_KDMC/, messaging-app/, ...) :
 *
 *   <script src="/tools/shared/version-badge-pwa.js"
 *           data-project="album-laurence"
 *           data-version="v2.1.0"
 *           data-color="#c9a227"
 *           defer></script>
 *
 * Auto-installe :
 * 1. Badge version visible bottom-left (lisible iPhone)
 * 2. Auto-force-update si le fichier HTML distant a changé de version
 *    (vérifie ?_v=ts pour bypass SW + comparaison commentaire HTML `<!-- vX.Y.Z -->`)
 *
 * Conforme règles CLAUDE.md ABSOLUES 2026-05-16 :
 * - "MAJ auto forcé TOUJOURS tous projets"
 * - "Badge version visible toujours tous projets"
 */
(function () {
  'use strict';
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  var script = document.currentScript || (function () {
    var ss = document.getElementsByTagName('script');
    return ss[ss.length - 1];
  })();
  if (!script) return;

  var project = script.getAttribute('data-project') || 'project';
  var version = script.getAttribute('data-version') || '?';
  var color = script.getAttribute('data-color') || '#c9a227';
  var checkUrl = script.getAttribute('data-check-url') || '';  /* URL distant pour version-check */
  var autoUpdate = script.getAttribute('data-auto-update') !== 'false'; /* default true */

  /* ─── BADGE VERSION VISIBLE ───────────────────────────────────────────── */
  function installBadge() {
    if (document.getElementById('kdmc-version-badge')) return;
    var badge = document.createElement('button');
    badge.id = 'kdmc-version-badge';
    badge.type = 'button';
    badge.setAttribute('aria-label', 'Version ' + project + ' ' + version);
    badge.title = project + ' ' + version + ' · click pour info';
    badge.textContent = version;
    badge.style.cssText = [
      'position:fixed',
      'bottom:max(8px,env(safe-area-inset-bottom,8px))',
      'left:8px',
      'z-index:2147483646',
      'padding:5px 10px',
      'background:linear-gradient(135deg,' + color + '38,' + color + '20)',
      'border:1px solid ' + color + '88',
      'color:' + color,
      'font-size:11px',
      'font-family:SF Mono,Menlo,monospace',
      'font-weight:700',
      'border-radius:12px',
      'cursor:pointer',
      'user-select:none',
      '-webkit-user-select:none',
      '-webkit-tap-highlight-color:transparent',
      'opacity:.85',
      'box-shadow:0 2px 8px rgba(0,0,0,.3)',
      'line-height:1',
      'letter-spacing:.02em',
    ].join(';');
    badge.addEventListener('click', function () {
      var swState = 'aucun';
      try {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then(function (r) {
            if (r && r.active) swState = r.active.state;
            alert(project + ' ' + version + '\nService Worker : ' + swState);
          }).catch(function () { alert(project + ' ' + version); });
          return;
        }
      } catch (_) { /* ignore */ }
      alert(project + ' ' + version);
    });
    document.body.appendChild(badge);
  }

  /* ─── AUTO-FORCE-UPDATE ───────────────────────────────────────────────── */
  var _autoMajInProgress = false;
  function autoForceUpdate() {
    if (!autoUpdate || _autoMajInProgress || !navigator.onLine) return;
    var lastAuto = parseInt(localStorage.getItem('kdmc_auto_maj_' + project) || '0', 10);
    if (Date.now() - lastAuto < 10000) return; /* throttle 10s */
    var active = document.activeElement;
    var tag = active && active.tagName && active.tagName.toLowerCase();
    if (tag === 'textarea' || tag === 'input' || (active && active.getAttribute && active.getAttribute('contenteditable') === 'true')) return;
    _autoMajInProgress = true;
    var url = (checkUrl || location.pathname) + (((checkUrl || location.pathname).indexOf('?') >= 0) ? '&' : '?') + '_v=' + Date.now();
    fetch(url, {
      cache: 'reload',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
    }).then(function (r) {
      if (!r.ok) { _autoMajInProgress = false; return null; }
      return r.text();
    }).then(function (html) {
      if (!html) return;
      /* Match data-version="X" puis data-app-ver="X" puis var APP_VER="X" puis fallback commentaire */
      var m = html.match(/data-version="([^"]+)"/)
           || html.match(/data-app-ver="([^"]+)"/)
           || html.match(/var\s+APP_VER\s*=\s*["']([^"']+)["']/)
           || html.match(/<!--\s*v([^\s>-]+)/);
      var remote = m && m[1] ? (m[1].charAt(0) === 'v' ? m[1] : 'v' + m[1]) : null;
      if (!remote || remote === version) { _autoMajInProgress = false; return; }
      console.log('[kdmc-auto-maj]', project, version, '→', remote);
      localStorage.setItem('kdmc_auto_maj_' + project, String(Date.now()));
      /* Nuclear : unregister SW + clear caches + reload */
      var p = Promise.resolve();
      if ('serviceWorker' in navigator) {
        p = p.then(function () {
          return navigator.serviceWorker.getRegistrations().then(function (regs) {
            return Promise.all(regs.map(function (r) { return r.unregister().catch(function () {}); }));
          });
        });
      }
      if (typeof caches !== 'undefined') {
        p = p.then(function () {
          return caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (k) { return caches.delete(k).catch(function () {}); }));
          });
        });
      }
      p.then(function () {
        setTimeout(function () {
          location.replace(location.pathname + '?_force_upd_' + Date.now());
        }, 300);
      });
    }).catch(function () {
      _autoMajInProgress = false;
    });
  }

  /* ─── INSTALL ─────────────────────────────────────────────────────────── */
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    installBadge();
  } else {
    document.addEventListener('DOMContentLoaded', installBadge);
  }

  /* Schedule auto-MAJ : boot + 60s recurrent + on focus/visibility */
  setTimeout(autoForceUpdate, 2000);
  setInterval(autoForceUpdate, 60000);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') autoForceUpdate();
  });
  window.addEventListener('focus', autoForceUpdate);
})();
