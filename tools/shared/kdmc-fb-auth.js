/* kdmc-fb-auth.js — Lockdown shops (custom-token par rôle), côté client.
 * ----------------------------------------------------------------------------
 * Rôle : obtenir un id_token Firebase role:admin (minté par le router derrière le
 * GRANT admin du domaine) et l'attacher en `?auth=` SUR LES SEULES écritures admin :
 *   shops_admin_v1/products/*, shops_admin_v1/logos/*, shops_sourcing_v1/selection/*
 * → les règles RTDB peuvent exiger auth.token.role==='admin' (seuls Kevin/Lolo écrivent).
 *
 * NE TOUCHE JAMAIS : les commandes clients (shops_admin_v1/orders), les lectures (GET),
 * ni aucun autre domaine/appel. Intercepteur réseau chirurgical.
 *
 * 🛟 FAIL-OPEN ABSOLU (peur n°1 Kevin = blocage) : toute erreur (router absent, secrets
 * FB non posés, réseau, pas de grant) → AUCUN ?auth= ajouté → l'écriture part comme avant.
 * Le durcissement ne « mord » que lorsque Kevin a (a) laissé le router se redéployer avec
 * les secrets FB, (b) prouvé le PIN admin une fois, (c) activé SHOPS_LOCK=on côté règles.
 *
 * Aucune dépendance, aucun changement CSP requis (tout en same-origin /__admin/*).
 */
(function (global) {
  'use strict';
  if (global.kdmcFbAuth) return;

  var TOKEN_URL = '/__admin/fbtoken';   // router, même origine (sourcing/chez-lolo/... .kd-mc.com)
  var LOGIN_URL = '/__admin/login';     // preuve du PIN admin (lesson #99)
  var GRANT_LS = 'kdmc_admin_grant';    // copie du grant (header x-kdmc-admin, PWA iOS isolées)
  var IDT_SS = 'kdmc_fb_idt';
  var EXP_SS = 'kdmc_fb_exp';
  /* Chemins admin-write à protéger (RTDB REST). Tout le reste passe inchangé. */
  var ADMIN_WRITE = /\/(shops_admin_v1\/(?:products|logos)|shops_sourcing_v1\/selection)\//;
  var WRITE_METHODS = { PUT: 1, PATCH: 1, POST: 1, DELETE: 1 };

  var _tok = null, _exp = 0;
  try { _tok = sessionStorage.getItem(IDT_SS) || null; _exp = parseInt(sessionStorage.getItem(EXP_SS) || '0', 10) || 0; } catch (_) {}

  function now() { return Math.floor(Date.now() / 1000); }
  function valid() { return !!_tok && _exp > now() + 60; }
  function qs() { return valid() ? '?auth=' + encodeURIComponent(_tok) : ''; }
  function grantHeader() { try { return localStorage.getItem(GRANT_LS) || ''; } catch (_) { return ''; } }

  function store(idt, expiresIn) {
    _tok = idt; _exp = now() + (parseInt(expiresIn, 10) || 3600);
    try { sessionStorage.setItem(IDT_SS, _tok); sessionStorage.setItem(EXP_SS, String(_exp)); } catch (_) {}
  }
  function clear() {
    _tok = null; _exp = 0;
    try { sessionStorage.removeItem(IDT_SS); sessionStorage.removeItem(EXP_SS); } catch (_) {}
  }

  /* Demande un id_token role:admin au router. Le grant voyage en cookie (.kd-mc.com)
     ET en header x-kdmc-admin (PWA isolées). Renvoie {ok, status} — jamais ne throw. */
  function mint() {
    var h = { 'Content-Type': 'application/json' };
    var g = grantHeader(); if (g) h['x-kdmc-admin'] = g;
    return fetch(TOKEN_URL, { method: 'POST', headers: h, credentials: 'include' })
      .then(function (r) { return r.json().then(function (d) { return { status: r.status, d: d }; }); })
      .then(function (x) {
        if (x.d && x.d.ok && x.d.id_token) { store(x.d.id_token, x.d.expires_in); return { ok: true }; }
        // fb_not_configured / exchange indispo / pas de grant → fail-open
        return { ok: false, status: x.status, reason: (x.d && x.d.reason) || 'no_token' };
      })
      .catch(function (e) { return { ok: false, reason: 'neterr', detail: (e && e.message) || '?' }; });
  }

  /* Prouve le PIN admin (raw) → pose le grant (cookie + copie localStorage). */
  function adminLogin(code) {
    return fetch(LOGIN_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ code: String(code || '') })
    }).then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (d) {
        if (d && d.ok && d.grant) { try { localStorage.setItem(GRANT_LS, d.grant); } catch (_) {} return { ok: true }; }
        return { ok: false, reason: (d && d.reason) || 'login_failed' };
      })
      .catch(function (e) { return { ok: false, reason: 'neterr', detail: (e && e.message) || '?' }; });
  }

  /* Garantit un token SILENCIEUSEMENT (intercepteur, fail-open). L'interactif
     (saisie du PIN) passe par openLogin() / la modale — jamais prompt() (no-op PWA iOS). */
  function ensure() {
    if (valid()) return Promise.resolve(true);
    return mint().then(function (r) { return !!r.ok; });
  }

  /* Intercepteur fetch chirurgical : ajoute ?auth= sur les écritures admin uniquement. */
  function urlOf(input) { return (typeof input === 'string') ? input : (input && input.url) || ''; }
  function methodOf(input, init) {
    var m = (init && init.method) || (typeof input === 'object' && input && input.method) || 'GET';
    return String(m).toUpperCase();
  }
  function addAuth(u) {
    if (!valid()) return u;
    if (/[?&]auth=/.test(u)) return u;
    return u + (u.indexOf('?') >= 0 ? '&' : '?') + 'auth=' + encodeURIComponent(_tok);
  }
  function installInterceptor() {
    if (global.__kdmcFbFetchPatched || typeof global.fetch !== 'function') return;
    var orig = global.fetch.bind(global);
    global.fetch = function (input, init) {
      try {
        var u = urlOf(input);
        if (ADMIN_WRITE.test(u) && WRITE_METHODS[methodOf(input, init)] &&
            /firebasedatabase\.app/.test(u) && !/[?&]auth=/.test(u)) {
          return ensure(true).then(function () {
            var nu = addAuth(u);
            if (nu === u) return orig(input, init);
            if (typeof input === 'string') return orig(nu, init);
            try { return orig(new Request(nu, input), init); } catch (_) { return orig(nu, init); }
          });
        }
      } catch (_) { /* fail-open */ }
      return orig(input, init);
    };
    global.__kdmcFbFetchPatched = true;
  }

  installInterceptor();

  /* Messages d'erreur EXACTS (leçon #95/#101 : le bouton doit dire pourquoi ça rate). */
  function reasonFr(reason, status) {
    var m = {
      fb_not_configured: 'Firebase pas encore configuré côté router (déploiement en cours) — réessaie dans ~2 min.',
      not_found: 'Endpoint /__admin/fbtoken absent — router pas encore redéployé, réessaie dans ~2 min.',
      code_invalide: 'Code admin incorrect.',
      code_requis: 'Code requis.',
      admin_pin_not_configured: 'PIN admin non configuré côté router.',
      rate_limited: 'Trop d\'essais — patiente un peu.',
      neterr: 'Réseau indisponible.',
      no_token: 'Token non obtenu (échange Firebase a échoué).',
      sign_failed: 'Signature du token échouée (clé Firebase côté router).'
    };
    return (m[reason] || ('Erreur : ' + (reason || 'inconnue'))) + (status ? ' [HTTP ' + status + ']' : '');
  }
  function updateBtn() {
    var b = document.getElementById('kdmc-fb-admin-btn');
    if (b) { b.textContent = valid() ? '🔓 Admin' : '🔒 Admin'; b.disabled = false; }
  }
  /* Modale PIN inline (remplace prompt(), no-op en PWA iOS standalone). */
  function showModal(resolve, firstErr) {
    if (document.getElementById('kdmc-fb-modal')) return;
    var ov = document.createElement('div');
    ov.id = 'kdmc-fb-modal';
    ov.style.cssText = 'position:fixed;inset:0;z-index:2147483600;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:18px;font:14px system-ui,-apple-system,sans-serif';
    var card = document.createElement('div');
    card.style.cssText = 'width:min(360px,94vw);background:#141821;border:1px solid #2a3340;border-radius:16px;padding:18px;color:#e9efe7;box-shadow:0 10px 40px rgba(0,0,0,.5)';
    card.innerHTML = '<div style="font-weight:700;font-size:16px;margin-bottom:4px">🔒 Connexion admin</div>' +
      '<div style="font-size:12.5px;color:#9bb3a3;margin-bottom:12px">Code admin (Kevin/Lolo) pour activer l\'écriture sécurisée.</div>';
    var inp = document.createElement('input');
    inp.type = 'password'; inp.inputMode = 'numeric'; inp.autocomplete = 'off';
    inp.setAttribute('aria-label', 'Code admin'); inp.placeholder = 'Code admin';
    inp.style.cssText = 'width:100%;padding:12px;min-height:46px;border-radius:10px;border:1px solid #2a3340;background:#0c1118;color:#fff;font-size:16px;box-sizing:border-box';
    var st = document.createElement('div');
    st.style.cssText = 'font-size:12.5px;color:#e88;min-height:16px;margin:9px 0 4px';
    if (firstErr && !firstErr.ok && firstErr.reason && firstErr.reason !== 'need_admin_code' &&
        firstErr.status !== 403) st.textContent = reasonFr(firstErr.reason, firstErr.status);
    var row = document.createElement('div'); row.style.cssText = 'display:flex;gap:8px;margin-top:6px';
    var ok = document.createElement('button'); ok.textContent = 'Valider';
    ok.style.cssText = 'flex:1;min-height:44px;border-radius:10px;border:none;background:linear-gradient(135deg,#caa62b,#9c7d18);color:#1a1304;font-weight:700;cursor:pointer';
    var ca = document.createElement('button'); ca.textContent = 'Annuler';
    ca.style.cssText = 'min-height:44px;padding:0 14px;border-radius:10px;border:1px solid #2a3340;background:#1a212b;color:#e9efe7;cursor:pointer';
    var done = false;
    function close(v) { if (done) return; done = true; try { ov.remove(); } catch (_) {} resolve(v); }
    ca.onclick = function () { close(false); };
    ov.onclick = function (e) { if (e.target === ov) close(false); };
    ok.onclick = function () {
      var code = (inp.value || '').trim();
      if (!code) { st.style.color = '#e88'; st.textContent = 'Entre le code.'; return; }
      ok.disabled = true; st.style.color = '#9bb3a3'; st.textContent = '…';
      adminLogin(code).then(function (lr) {
        if (!lr.ok) { ok.disabled = false; st.style.color = '#e88'; st.textContent = reasonFr(lr.reason, lr.status); inp.value = ''; inp.focus(); return; }
        mint().then(function (mr) {
          ok.disabled = false;
          if (mr.ok) { updateBtn(); if (global.toast) global.toast('🔓 Écriture admin activée'); close(true); }
          else { st.style.color = '#e88'; st.textContent = reasonFr(mr.reason, mr.status); }
        });
      });
    };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') ok.onclick(); });
    row.appendChild(ok); row.appendChild(ca);
    card.appendChild(inp); card.appendChild(st); card.appendChild(row);
    ov.appendChild(card); document.body.appendChild(ov);
    setTimeout(function () { try { inp.focus(); } catch (_) {} }, 60);
  }
  /* Connexion admin interactive : tente silencieux (grant déjà là ?) puis modale PIN. */
  function openLogin() {
    return new Promise(function (resolve) {
      if (valid()) { updateBtn(); if (global.toast) global.toast('🔓 Déjà connecté admin'); return resolve(true); }
      mint().then(function (r) {
        if (r.ok) { updateBtn(); if (global.toast) global.toast('🔓 Écriture admin activée'); return resolve(true); }
        if (typeof document === 'undefined' || !document.body) { if (global.toast) global.toast('⚠️ ' + reasonFr(r.reason, r.status)); return resolve(false); }
        showModal(resolve, r);
      });
    });
  }

  global.kdmcFbAuth = {
    qs: qs, authed: valid, ensure: ensure, loginPrompt: openLogin,
    signOut: function () { clear(); try { localStorage.removeItem(GRANT_LS); } catch (_) {} updateBtn(); },
    status: function () { return { authed: valid(), exp: _exp, hasGrant: !!grantHeader() }; }
  };

  /* Bouton discret "🔒 Admin" sur les pages admin (sourcing/studios) : permet à Kevin/Lolo
     de prouver le PIN une fois → token role:admin en cache → écritures sécurisées autorisées.
     Sans ce clic, après activation du lock, les écritures admin partent sans token (fail-open
     → bloquées par les règles). Discret, sous les modales, retiré une fois authentifié. */
  function injectButton() {
    if (typeof document === 'undefined' || !document.body) return;
    if (document.getElementById('kdmc-fb-admin-btn')) return;
    var b = document.createElement('button');
    b.id = 'kdmc-fb-admin-btn';
    b.type = 'button';
    b.textContent = valid() ? '🔓 Admin' : '🔒 Admin';
    b.title = 'Connexion admin Firebase (écriture sécurisée Kevin/Lolo)';
    b.style.cssText = 'position:fixed;right:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 56px);z-index:2147483000;' +
      'font:600 12px/1 system-ui,sans-serif;padding:8px 12px;min-height:36px;border-radius:10px;cursor:pointer;' +
      'border:1px solid rgba(201,162,39,.5);background:rgba(20,20,24,.82);color:#e8c45a;backdrop-filter:blur(6px);box-shadow:0 2px 10px rgba(0,0,0,.35)';
    b.onclick = function () {
      b.disabled = true; b.textContent = '…';
      global.kdmcFbAuth.loginPrompt().then(function (ok) {
        b.disabled = false; b.textContent = ok ? '🔓 Admin' : '🔒 Admin';
      });
    };
    document.body.appendChild(b);
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectButton);
    else injectButton();
  }
})(typeof window !== 'undefined' ? window : this);
