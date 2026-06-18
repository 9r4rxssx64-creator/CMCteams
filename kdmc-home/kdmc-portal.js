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
    var priv = document.getElementById('priv-zone');
    if (!priv) return;
    var done = function (s) {
      /* Espace privé regroupé (Sourcing, Coffre-fort, Dashboard, Admin) :
         Kevin + Laurence (Lolo) OU admin. Les autres clients ne le voient jamais.
         /admin/ reste protégé par le code admin côté serveur (fail-closed). */
      var isPriv = !!(s && s.admin) || /kevin|desarzens|laurence|lolo|saint.?polit/.test(norm(s && s.name || ''));
      priv.hidden = !isPriv;
    };
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
    // Kevin « CGU le plus bref, vague possible » + « pas de CGU pas de connexion ».
    // Texte minimal/vague ; la case reste OBLIGATOIRE (doCreate bloque si non cochée).
    return '<label class="cgu"><input type="checkbox" id="cgu-ok"> '
      + 'J\'accepte les <a href="#" id="cgu-link">conditions</a>.</label>'
      + '<div id="cgu-text" class="cgu-text" hidden>'
      + 'Un identifiant unique pour tes apps KDMC. Données privées, utilisées seulement pour te connecter. '
      + 'Déconnexion possible à tout moment.</div>';
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
    var hasPk = _hasPasskey(acc.uid) && _pkSupported();
    gate.innerHTML =
      '<h2 class="g-title">Bonjour ' + esc(acc.name.split(' ')[0]) + '</h2>'
      + '<p class="g-sub">' + (hasPk ? 'Déverrouille avec Face ID, ou ton code.' : 'Entre ton code pour ouvrir ton univers KDMC.') + '</p>'
      + (hasPk ? '<button class="btn" id="u-pk">🔓 Se connecter avec Face ID</button>' : '')
      + '<input class="fld" id="u-code" type="password" inputmode="numeric" autocomplete="current-password" placeholder="Code secret"' + (hasPk ? ' style="margin-top:8px"' : '') + '>'
      + '<button class="btn' + (hasPk ? ' ghost' : '') + '" id="u-go">' + (hasPk ? 'Utiliser mon code' : 'Se connecter') + '</button>'
      + '<button class="btn ghost" id="u-other">Ce n\'est pas moi</button>'
      + '<p class="g-err" id="u-err" role="alert" aria-live="polite"></p>';
    if (hasPk) document.getElementById('u-pk').addEventListener('click', function () {
      var b = document.getElementById('u-pk'); b.disabled = true; b.textContent = '…';
      window.kdmcSSO.loginPasskey(acc.uid).then(function (j) {
        if (j && j.ok) { showHub(acc.name); }
        else { document.getElementById('u-err').textContent = 'Face ID : ' + ((j && j.reason) || 'échec') + ' — utilise ton code.'; b.disabled = false; b.textContent = '🔓 Se connecter avec Face ID'; }
      });
    });
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
      _postLogin(acc);
    }).catch(function () { err.textContent = 'Erreur, réessaie.'; btn.disabled = false; btn.textContent = 'Créer mon compte'; });
  }

  function doUnlock(acc) {
    var code = (document.getElementById('u-code').value || '').trim();
    var err = document.getElementById('u-err'); err.textContent = '';
    if (!code) { err.textContent = 'Entre ton code.'; return; }
    var btn = document.getElementById('u-go'); btn.disabled = true; btn.textContent = '…';
    hashCode(code, acc.salt).then(function (h) {
      if (!timingEq(h, acc.codeHash)) { err.textContent = 'Code incorrect.'; btn.disabled = false; btn.textContent = 'Se connecter'; return; }
      return (window.kdmcSSO ? window.kdmcSSO.issue(acc.uid, acc.name, true) : Promise.resolve(false)).then(function () { _postLogin(acc); });
    }).catch(function () { err.textContent = 'Erreur, réessaie.'; btn.disabled = false; btn.textContent = 'Se connecter'; });
  }

  /* ===== Passkey (Face ID) — fait de l'appareil une preuve d'identité FORTE ===== */
  var LS_PASSKEY = 'kdmc_passkey_v1';
  function _hasPasskey(uid) { try { return !!(lg(LS_PASSKEY, {})[uid]); } catch (e) { return false; } }
  function _setPasskey(uid) { try { var m = lg(LS_PASSKEY, {}); m[uid] = 1; ls(LS_PASSKEY, m); } catch (e) { /* */ } }
  function _pkSupported() { return !!(window.kdmcSSO && window.kdmcSSO.supportsPasskey && window.kdmcSSO.supportsPasskey()); }
  /* Après connexion : propose l'enrôlement Face ID si supporté + pas déjà fait. */
  function _postLogin(acc) {
    var skipped = false; try { skipped = !!sessionStorage.getItem('kdmc_pk_skip'); } catch (e) { /* */ }
    if (_pkSupported() && !_hasPasskey(acc.uid) && !skipped) { renderPasskeyOffer(acc); } else { showHub(acc.name); }
  }
  function renderPasskeyOffer(acc) {
    hide(hub); show(gate); /* boot avec session existante : le hub peut être affiché → on remontre la porte */
    gate.innerHTML =
      '<h2 class="g-title">🔐 Active Face ID</h2>'
      + '<p class="g-sub">Reconnecte-toi sans code — et ton appareil devient ta <b>preuve d\'identité forte</b> sur tout KDMC (Face ID / Touch ID).</p>'
      + '<button class="btn" id="pk-go">Activer Face ID / Touch ID</button>'
      + '<button class="btn ghost" id="pk-skip">Plus tard</button>'
      + '<p class="g-err" id="pk-err" role="alert" aria-live="polite"></p>';
    document.getElementById('pk-skip').addEventListener('click', function () { try { sessionStorage.setItem('kdmc_pk_skip', '1'); } catch (e) { /* */ } showHub(acc.name); });
    document.getElementById('pk-go').addEventListener('click', function () {
      var b = document.getElementById('pk-go'); b.disabled = true; b.textContent = '…';
      window.kdmcSSO.registerPasskey().then(function (j) {
        if (j && j.ok) { _setPasskey(acc.uid); showHub(acc.name); }
        else { document.getElementById('pk-err').textContent = 'Face ID non activé (' + ((j && j.reason) || 'annulé') + '). Tu peux réessayer plus tard.'; b.disabled = false; b.textContent = 'Activer Face ID / Touch ID'; }
      });
    });
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

  /* SSO sur la tuile Apex Chat UNIQUEMENT : on injecte le pass signé FRAIS dans le
     fragment (#kdmc_sso=) — non envoyé aux serveurs ni journalisé. Indispensable
     iPhone : une PWA installée a ses cookies ISOLÉS, donc le cookie de session
     .kd-mc.com ne traverse pas ; Apex Chat se reconnaît via ce pass (Bearer) et sait
     CONSOMMER+nettoyer le fragment (_kdmcConsumeHashPass).
     ⚠ RESTREINT À apex-chat : les apps à routeur #hash qui NE consomment PAS le jeton
     (ex Apex AI v13) prenaient « #kdmc_sso=… » pour une route → « Page introuvable ».
     Donc on ne décore QUE le consommateur connu. Fail-open : pas de jeton → lien brut. */
  function _decorateAppLinks() {
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a.card') : null;
      if (!a || !a.getAttribute('href')) return;
      var host; try { host = new URL(a.href).hostname; } catch (_) { return; }
      if (host !== 'apex-chat.kd-mc.com') return; /* seul consommateur du fragment */
      var t = (window.kdmcSSO && window.kdmcSSO.token) ? window.kdmcSSO.token() : '';
      if (!t) return;
      var base = a.href.replace(/([#&])kdmc_sso=[^&]*/, '$1').replace(/[#&]+$/, '');
      a.href = base + (base.indexOf('#') >= 0 ? '&' : '#') + 'kdmc_sso=' + encodeURIComponent(t);
    }, true);
  }
  _decorateAppLinks();

  /* ---------------------------- Boot ---------------------------- */
  function boot() {
    var acc = lg(LS_ACCOUNT, null);
    var done = function (sess) {
      if (sess && sess.uid) { _postLogin({ uid: sess.uid, name: sess.name || (acc && acc.name) }); return; }
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
