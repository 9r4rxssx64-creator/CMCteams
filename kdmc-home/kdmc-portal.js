/* KDMC APEX — portail PWA : 1ʳᵉ connexion = création de compte (prénom+nom+code
   + CGU unique), session unique kd-mc.com, puis installation PWA. Reconnu auto
   ensuite. 100% côté client (code haché PBKDF2 200k, jamais en clair) + session
   SSO signée côté router. Fail-open : si SSO indispo, le compte local marche
   quand même sur cet appareil. */
(function () {
  'use strict';
  var LS_ACCOUNT = 'kdmc_account_v1';
  var LS_CGU = 'kdmc_cgu_accepted_v1';
  var gate = document.getElementById('gate');
  var hub = document.getElementById('hub');
  var hello = document.getElementById('hello');
  var installWrap = document.getElementById('install');
  var deferredPrompt = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function lg(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function ls(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* quota */ } }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\s\-_.]+/g, ' ').trim(); }
  function slug(s) { return norm(s).replace(/\s+/g, '-').slice(0, 60); }

  /* ---- PBKDF2 (Web Crypto) : haché du code, jamais le code en clair ---- */
  function rndSalt() { var a = new Uint8Array(16); crypto.getRandomValues(a); return Array.from(a).map(function (b) { return b.toString(16).padStart(2, '0'); }).join(''); }
  function hashCode(code, salt) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(code), { name: 'PBKDF2' }, false, ['deriveBits'])
      .then(function (k) { return crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 200000, hash: 'SHA-256' }, k, 256); })
      .then(function (bits) { return Array.from(new Uint8Array(bits)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join(''); });
  }
  function timingEq(a, b) { if (a.length !== b.length) return false; var d = 0; for (var i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }

  /* ---------------------------- Vues ---------------------------- */
  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }

  /* Si une app a renvoyé l'utilisateur ici pour se connecter (?return=<url app>),
     on le ramène dans l'app une fois la session domaine posée. Sécurité anti
     open-redirect : on n'autorise QUE les sous-domaines de kd-mc.com. */
  function safeReturnUrl() {
    try {
      var raw = new URLSearchParams(location.search).get('return');
      if (!raw) return null;
      var u = new URL(raw, location.origin);
      if (u.protocol !== 'https:') return null;
      var h = u.hostname;
      if (h === 'kd-mc.com' || h.slice(-10) === '.kd-mc.com') return u.href;
      return null;
    } catch (e) { return null; }
  }
  function gotoReturnIfAny() {
    var r = safeReturnUrl();
    if (r) {
      /* On ajoute le "pass signé" dans le fragment (#) — non envoyé aux serveurs,
         non journalisé — pour que l'app installée (cookie isolé) puisse se
         reconnaître via le canal Bearer. */
      var t = (window.kdmcSSO && window.kdmcSSO.token) ? window.kdmcSSO.token() : '';
      if (t) r += (r.indexOf('#') >= 0 ? '&' : '#') + 'kdmc_sso=' + encodeURIComponent(t);
      location.replace(r);
      return true;
    }
    return false;
  }

  /* La zone Administration est cachée par défaut (hidden dans le HTML). On ne la
     révèle QUE si la session du domaine dit admin === true (vérifié côté serveur
     via whoami). Les clients/Laurence ne la voient jamais. */
  function applyAdminVisibility() {
    var zone = document.getElementById('admin-zone');
    if (!zone) return;
    var done = function (s) { if (s && s.admin) { zone.hidden = false; } else { zone.hidden = true; } };
    if (window.kdmcSSO) { window.kdmcSSO.whoami().then(done).catch(function () { done(null); }); } else { done(null); }
  }

  function showHub(name) {
    if (gotoReturnIfAny()) return; /* session posée → on rebascule dans l'app */
    if (hello) hello.textContent = name ? ('Bonjour ' + name) : 'Bienvenue';
    hide(gate); show(hub);
    applyAdminVisibility();
    maybeOfferInstall();
  }

  function cguBlock() {
    return '<label class="cgu"><input type="checkbox" id="cgu-ok"> '
      + 'J\'accepte les <a href="#" id="cgu-link">conditions d\'utilisation &amp; la politique de confidentialité</a> KDMC '
      + '(un seul accord, valable pour toutes les apps du domaine).</label>'
      + '<div id="cgu-text" class="cgu-text" hidden>'
      + 'KDMC APEX — un identifiant unique (prénom + nom + code) pour accéder à toutes '
      + 'tes applications du domaine kd-mc.com (CMCteams, Apex, boutiques). Ton code est '
      + 'haché (PBKDF2, jamais stocké en clair). La session est signée et liée au domaine '
      + '(cookie sécurisé HttpOnly). Tes données restent privées et ne sont utilisées que '
      + 'pour te connecter et personnaliser ton espace. Tu peux te déconnecter à tout moment. '
      + 'Reconnaissance automatique de l\'appareil après la 1ʳᵉ connexion (Face ID / Touch ID '
      + 'gérés par chaque app).</div>';
  }

  function renderCreate() {
    gate.innerHTML =
      '<h2 class="g-title">Créer mon compte KDMC</h2>'
      + '<p class="g-sub">Première connexion. Un seul compte pour tout ton univers.</p>'
      + '<input class="fld" id="f-prenom" type="text" autocomplete="given-name" placeholder="Prénom" inputmode="text">'
      + '<input class="fld" id="f-nom" type="text" autocomplete="family-name" placeholder="Nom">'
      + '<input class="fld" id="f-code" type="password" inputmode="numeric" autocomplete="new-password" placeholder="Code secret (6 chiffres min.)">'
      + '<input class="fld" id="f-code2" type="password" inputmode="numeric" autocomplete="new-password" placeholder="Confirme le code">'
      + cguBlock()
      + '<button class="btn" id="f-create">Créer mon compte</button>'
      + '<p class="g-err" id="f-err" role="alert" aria-live="polite"></p>';
    wireCgu();
    document.getElementById('f-create').addEventListener('click', doCreate);
  }

  function renderUnlock(acc) {
    gate.innerHTML =
      '<h2 class="g-title">Bonjour ' + esc(acc.name.split(' ')[0]) + '</h2>'
      + '<p class="g-sub">Entre ton code pour ouvrir ton univers KDMC.</p>'
      + '<input class="fld" id="u-code" type="password" inputmode="numeric" autocomplete="current-password" placeholder="Code secret">'
      + '<button class="btn" id="u-go">Se connecter</button>'
      + '<button class="btn ghost" id="u-other">Ce n\'est pas moi</button>'
      + '<p class="g-err" id="u-err" role="alert" aria-live="polite"></p>';
    document.getElementById('u-go').addEventListener('click', function () { doUnlock(acc); });
    document.getElementById('u-code').addEventListener('keydown', function (e) { if (e.key === 'Enter') doUnlock(acc); });
    document.getElementById('u-other').addEventListener('click', function () {
      if (confirm('Créer un autre compte sur cet appareil ? (ton compte actuel reste enregistré)')) renderCreate();
    });
  }

  function wireCgu() {
    var link = document.getElementById('cgu-link');
    if (link) link.addEventListener('click', function (e) { e.preventDefault(); var t = document.getElementById('cgu-text'); if (t) t.hidden = !t.hidden; });
  }

  function doCreate() {
    var prenom = (document.getElementById('f-prenom').value || '').trim();
    var nom = (document.getElementById('f-nom').value || '').trim();
    var code = (document.getElementById('f-code').value || '').trim();
    var code2 = (document.getElementById('f-code2').value || '').trim();
    var cgu = document.getElementById('cgu-ok').checked;
    var err = document.getElementById('f-err');
    err.textContent = '';
    if (prenom.length < 2 || nom.length < 2) { err.textContent = 'Prénom ET nom requis (sécurité).'; return; }
    if (code.length < 6) { err.textContent = 'Code trop court (6 chiffres minimum).'; return; }
    if (code !== code2) { err.textContent = 'Les deux codes ne correspondent pas.'; return; }
    if (!cgu) { err.textContent = 'Merci d\'accepter les conditions pour continuer.'; return; }
    var name = prenom + ' ' + nom;
    var uid = slug(name) || ('u-' + Date.now());
    var salt = rndSalt();
    var btn = document.getElementById('f-create'); btn.disabled = true; btn.textContent = 'Création…';
    hashCode(code, salt).then(function (h) {
      var acc = { uid: uid, name: name, salt: salt, codeHash: h, created: Date.now() };
      ls(LS_ACCOUNT, acc);
      ls(LS_CGU, { at: Date.now(), v: 1 });
      return (window.kdmcSSO ? window.kdmcSSO.issue(uid, name, true) : Promise.resolve(false)).then(function () { return acc; });
    }).then(function (acc) {
      showHub(acc.name);
    }).catch(function () { err.textContent = 'Erreur, réessaie.'; btn.disabled = false; btn.textContent = 'Créer mon compte'; });
  }

  function doUnlock(acc) {
    var code = (document.getElementById('u-code').value || '').trim();
    var err = document.getElementById('u-err'); err.textContent = '';
    if (!code) { err.textContent = 'Entre ton code.'; return; }
    var btn = document.getElementById('u-go'); btn.disabled = true; btn.textContent = '…';
    hashCode(code, acc.salt).then(function (h) {
      if (!timingEq(h, acc.codeHash)) { err.textContent = 'Code incorrect.'; btn.disabled = false; btn.textContent = 'Se connecter'; return; }
      return (window.kdmcSSO ? window.kdmcSSO.issue(acc.uid, acc.name, true) : Promise.resolve(false)).then(function () { showHub(acc.name); });
    }).catch(function () { err.textContent = 'Erreur, réessaie.'; btn.disabled = false; btn.textContent = 'Se connecter'; });
  }

  /* ---------------------------- PWA install ---------------------------- */
  function isStandalone() { return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; }
  function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
  function maybeOfferInstall() {
    if (!installWrap || isStandalone()) return;
    if (deferredPrompt) {
      installWrap.innerHTML = '<button class="btn install" id="pwa-go">📲 Installer KDMC sur mon appareil</button>';
      installWrap.hidden = false;
      document.getElementById('pwa-go').addEventListener('click', function () {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.finally(function () { deferredPrompt = null; installWrap.hidden = true; });
      });
    } else if (isIOS()) {
      installWrap.innerHTML = '<div class="ios-tip">📲 Pour installer : appuie sur <b>Partager</b> puis <b>« Sur l\'écran d\'accueil »</b>.</div>';
      installWrap.hidden = false;
    }
  }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredPrompt = e; if (hub && !hub.hidden) maybeOfferInstall(); });

  /* ---------------------------- Logout ---------------------------- */
  var lo = document.getElementById('logout');
  if (lo) lo.addEventListener('click', function () {
    if (window.kdmcSSO) window.kdmcSSO.logout();
    hide(hub);
    var acc = lg(LS_ACCOUNT, null);
    if (acc) renderUnlock(acc); else renderCreate();
    show(gate);
  });

  /* ---------------------------- Boot ---------------------------- */
  function boot() {
    var acc = lg(LS_ACCOUNT, null);
    var done = function (sess) {
      if (sess && sess.uid) { showHub(sess.name || (acc && acc.name)); return; }
      if (acc) renderUnlock(acc); else renderCreate();
      show(gate);
    };
    if (window.kdmcSSO) { window.kdmcSSO.whoami().then(done); } else { done(null); }
  }
  boot();

  /* Service worker (MAJ auto, offline). Fail-safe. */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () { /* ignore */ });
  }
})();
