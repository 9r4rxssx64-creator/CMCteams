/* APEX v13 — Rescue button handler externalisé (CSP strict v13.0.13).
 * Avant : onclick=" inline = besoin unsafe-inline.
 * Après : addEventListener depuis script avec nonce = CSP strict OK.
 *
 * Préserve la règle Kevin "qu'au minimum 1 bouton fonctionne TOUJOURS".
 * Reset complet : SW unregister + cache clear + reload, données préservées.
 */
(function () {
  'use strict';

  function rescueReset() {
    try {
      if (!confirm(
        "Reset Apex complet ?\n\n" +
        "• Service Worker desinstalle\n" +
        "• Caches effaces\n" +
        "• App rechargee fraiche\n\n" +
        "Tes donnees (Coffre, profil, conversations) sont PRESERVEES."
      )) return;
    } catch (_) { /* prompt bloqué : continue quand même */ }

    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (rs) {
          rs.forEach(function (r) { r.unregister(); });
        }).catch(function () {});
      }
    } catch (_) { /* ignore */ }

    try {
      if ('caches' in window) {
        caches.keys().then(function (ks) {
          ks.forEach(function (k) { caches.delete(k); });
        }).catch(function () {});
      }
    } catch (_) { /* ignore */ }

    setTimeout(function () {
      try {
        location.href = location.pathname + '?_reset=' + Date.now();
      } catch (_) {
        location.reload();
      }
    }, 400);
  }

  /* v13.3.74 a11y fix : skip-link bypass router hash (focus programmatique).
   * On évite href="#apex-root" qui collisionnerait avec router.dispatch (route inconnue).
   */
  function initSkipLink() {
    var skipLinks = document.querySelectorAll('a.ax-skip-link, a.skip-link');
    for (var i = 0; i < skipLinks.length; i++) {
      skipLinks[i].addEventListener('click', function (e) {
        var target = this.getAttribute('data-ax-skip-target') || 'apex-root';
        var el = document.getElementById(target);
        if (el) {
          e.preventDefault();
          /* tabindex=-1 permet focus programmatique sans entrer dans tab order */
          if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
          el.focus({ preventScroll: false });
          /* scroll smooth vers le main */
          try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) {}
        }
      });
    }
  }

  /* v13.4.80 — Toolbar permanente HTML pur (Kevin "pas de bouton / tjs pas de coffre"). */
  function navHash(hash) {
    return function () {
      try {
        location.hash = hash;
        /* Force re-dispatch même si déjà sur la route (Apex router écoute hashchange) */
        if (location.hash === hash) {
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      } catch (_) {
        location.replace(location.pathname + hash);
      }
    };
  }

  function initRescueToolbar() {
    var bind = function (id, fn) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    };
    bind('apex-rescue-coffre', navHash('#vault'));
    bind('apex-rescue-dashboard', navHash('#dashboard'));
    bind('apex-rescue-admin', navHash('#admin'));
    bind('apex-rescue-chat', navHash('#chat'));
    bind('apex-rescue-login', navHash('#login'));
  }

  /* v13.4.95 — Anti-zoom RADICAL Safari iOS 16+ (Kevin "Zoom tjs UX") :
     Bloque gesturestart/gesturechange/gestureend qui sont les events Safari iOS
     pour pinch-zoom. Même avec user-scalable=no le navigateur peut zoomer
     accessibilité — ces preventDefault bloquent ÇA. */
  function initAntiZoom() {
    try {
      ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (evt) {
        document.addEventListener(evt, function (e) {
          e.preventDefault();
        }, { passive: false });
      });
      /* Double-tap to zoom : preventDefault sur dblclick + détection 2-touches rapides */
      var lastTouchEnd = 0;
      document.addEventListener('touchend', function (e) {
        var now = Date.now();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      }, { passive: false });
    } catch (_) { /* navigator pas iOS Safari : ignore */ }
  }

  /* v13.4.95 — Toolbar rescue masquable (Kevin "boutons superposés / pas accès fonctions").
     Tap long sur n'importe quel bouton toolbar → toggle visibility.
     Persistence localStorage apex_v13_rescue_hidden. */
  function initToolbarToggle() {
    try {
      var toolbar = document.getElementById('apex-rescue-toolbar');
      if (!toolbar) return;
      /* Restore visibility state */
      var hidden = false;
      try { hidden = localStorage.getItem('apex_v13_rescue_hidden') === '1'; } catch (_) {}
      if (hidden) toolbar.style.display = 'none';

      /* Bouton flottant 👁 pour ré-afficher si masqué */
      var showBtn = document.createElement('button');
      showBtn.id = 'apex-rescue-show';
      showBtn.type = 'button';
      showBtn.setAttribute('aria-label', 'Afficher toolbar rescue');
      showBtn.title = 'Afficher toolbar rescue';
      showBtn.textContent = '👁';
      showBtn.style.cssText = 'position:fixed;bottom:max(48px,calc(env(safe-area-inset-bottom,0px) + 48px));right:4px;width:24px;height:24px;border-radius:50%;background:rgba(20,20,35,0.6);border:1px solid rgba(201,162,39,0.3);color:#c9a227;font-size:11px;cursor:pointer;z-index:9999;opacity:0.5;display:' + (hidden ? 'flex' : 'none') + ';align-items:center;justify-content:center;-webkit-tap-highlight-color:transparent;touch-action:manipulation';
      document.body.appendChild(showBtn);

      showBtn.addEventListener('click', function () {
        toolbar.style.display = 'flex';
        showBtn.style.display = 'none';
        try { localStorage.setItem('apex_v13_rescue_hidden', '0'); } catch (_) {}
      });

      /* Long press 800ms sur toolbar → masque + montre showBtn */
      var pressTimer = null;
      toolbar.addEventListener('touchstart', function () {
        pressTimer = setTimeout(function () {
          toolbar.style.display = 'none';
          showBtn.style.display = 'flex';
          try { localStorage.setItem('apex_v13_rescue_hidden', '1'); } catch (_) {}
        }, 800);
      }, { passive: true });
      ['touchend', 'touchmove', 'touchcancel'].forEach(function (evt) {
        toolbar.addEventListener(evt, function () {
          if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
        }, { passive: true });
      });
    } catch (_) { /* ignore */ }
  }

  function init() {
    var btn = document.getElementById('apex-rescue-btn');
    if (btn) btn.addEventListener('click', rescueReset);
    initRescueToolbar();
    initSkipLink();
    initAntiZoom();
    initToolbarToggle();
  }

  /* Fail-safe : si bundle ne charge pas dans 6s, montre rescue button */
  function failSafe() {
    setTimeout(function () {
      try {
        var root = document.getElementById('apex-root');
        if (!root || !root.innerHTML.trim()) {
          var btn = document.getElementById('apex-rescue-btn');
          if (btn) btn.classList.add('visible');
          var splash = document.getElementById('apex-splash');
          if (splash) {
            var hint = document.createElement('div');
            hint.className = 'apex-splash-hint';
            hint.textContent = 'Chargement plus long que prévu. Tape SOS en bas-droite si bloqué.';
            splash.appendChild(hint);
          }
        }
      } catch (_) { /* ignore */ }
    }, 6000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init();
      failSafe();
    });
  } else {
    init();
    failSafe();
  }
})();
