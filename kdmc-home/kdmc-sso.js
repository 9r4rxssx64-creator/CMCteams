/* KDMC APEX — client SSO transverse (session unique kd-mc.com).
   Tout est fail-open : si le router SSO est indisponible, les fonctions
   renvoient null/false et l'appelant retombe sur son comportement normal.

   Deux canaux de session, pour être iPhone-proof :
   1) Cookie HttpOnly .kd-mc.com (posé par le router) — marche dans Safari.
   2) "Pass signé" en localStorage + header Authorization Bearer — marche AUSSI
      entre des PWA installées séparément (iOS isole les cookies par app).
   Le pass est récupéré depuis le lien (#kdmc_sso=...) que le domaine ajoute en
   renvoyant l'utilisateur vers l'app, puis stocké localement et envoyé en Bearer. */
(function (global) {
  'use strict';
  var BASE = '/__sso';
  var LS_TOK = 'kdmc_sso_token';

  function storedToken() { try { return localStorage.getItem(LS_TOK) || ''; } catch (e) { return ''; } }
  function setToken(t) { try { if (t) localStorage.setItem(LS_TOK, t); else localStorage.removeItem(LS_TOK); } catch (e) { /* quota */ } }
  function authHeaders(extra) {
    var h = extra || {};
    var t = storedToken();
    if (t) h.Authorization = 'Bearer ' + t;
    return h;
  }

  /* À appeler au boot d'une app : récupère le pass signé passé dans l'URL
     (#kdmc_sso=...) par le domaine, le stocke, et nettoie l'URL. → true si trouvé. */
  function consumeHashToken() {
    try {
      var h = location.hash || '';
      var m = h.match(/[#&]kdmc_sso=([^&]+)/);
      if (!m) return false;
      setToken(decodeURIComponent(m[1]));
      var clean = h.replace(/([#&])kdmc_sso=[^&]*/, '$1').replace(/[#&]+$/, '');
      try { history.replaceState(null, '', location.pathname + location.search + (clean && clean !== '#' ? clean : '')); } catch (e) { /* ignore */ }
      return true;
    } catch (e) { return false; }
  }

  function whoami() {
    /* → { uid, name, cgu, admin } si session valide, sinon null.
       Le champ `admin` DOIT être propagé. Envoie le pass en Bearer (cross-PWA)
       ET les cookies (Safari) — l'un ou l'autre suffit. */
    return fetch(BASE + '/whoami', { method: 'GET', credentials: 'include', cache: 'no-store', headers: authHeaders() })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return j && j.ok ? { uid: j.uid, name: j.name, cgu: !!j.cgu, admin: !!j.admin, verified: !!j.verified } : null; })
      .catch(function () { return null; });
  }

  /* ===== Passkey (Face ID / Touch ID) — identité FORTE (verified) ===== */
  function _b64uToBuf(s) { s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; var bin = atob(s); var u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; }
  function _bufToB64u(buf) { var u = new Uint8Array(buf); var s = ''; for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function supportsPasskey() { return typeof window !== 'undefined' && !!window.PublicKeyCredential; }

  /* Enrôle un passkey pour la session courante (nécessite une session). Émet une
     session FORTE (verified). → {ok, reason?}. */
  function registerPasskey() {
    if (!supportsPasskey()) return Promise.resolve({ ok: false, reason: 'non supporté sur cet appareil' });
    return fetch(BASE + '/webauthn/register/options', { method: 'POST', credentials: 'include', headers: authHeaders({ 'content-type': 'application/json' }), body: '{}' })
      .then(function (r) { return r.json(); })
      .then(function (o) {
        if (!o || !o.ok) return { ok: false, reason: (o && o.reason) || 'options' };
        return navigator.credentials.create({ publicKey: {
          challenge: _b64uToBuf(o.challenge),
          rp: o.rp,
          user: { id: _b64uToBuf(o.user.id), name: o.user.name, displayName: o.user.displayName },
          pubKeyCredParams: o.pubKeyCredParams,
          authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
          timeout: 60000, attestation: 'none',
        } }).then(function (cred) {
          var att = cred.response;
          return fetch(BASE + '/webauthn/register/verify', { method: 'POST', credentials: 'include', headers: authHeaders({ 'content-type': 'application/json' }), body: JSON.stringify({ attestationObject: _bufToB64u(att.attestationObject), clientDataJSON: _bufToB64u(att.clientDataJSON) }) })
            .then(function (r) { return r.json(); })
            .then(function (j) { if (j && j.ok && j.token) setToken(j.token); return j || { ok: false }; });
        });
      })
      .catch(function (e) { return { ok: false, reason: String((e && e.message) || e).slice(0, 120) }; });
  }

  /* Connexion par passkey (Face ID) pour un uid connu. → {ok, verified, ...} ; stocke le pass. */
  function loginPasskey(uid) {
    if (!supportsPasskey()) return Promise.resolve({ ok: false, reason: 'non supporté' });
    return fetch(BASE + '/webauthn/auth/options', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ uid: uid }) })
      .then(function (r) { return r.json(); })
      .then(function (o) {
        if (!o || !o.ok) return { ok: false, reason: (o && o.reason) || 'options' };
        if (!o.allowCredentials || !o.allowCredentials.length) return { ok: false, reason: 'aucun passkey' };
        return navigator.credentials.get({ publicKey: {
          challenge: _b64uToBuf(o.challenge),
          rpId: o.rpId,
          allowCredentials: o.allowCredentials.map(function (c) { return { type: 'public-key', id: _b64uToBuf(c.id) }; }),
          userVerification: 'required', timeout: 60000,
        } }).then(function (cred) {
          var a = cred.response;
          return fetch(BASE + '/webauthn/auth/verify', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ uid: uid, credId: cred.id, clientDataJSON: _bufToB64u(a.clientDataJSON), authenticatorData: _bufToB64u(a.authenticatorData), signature: _bufToB64u(a.signature) }) })
            .then(function (r) { return r.json(); })
            .then(function (j) { if (j && j.ok && j.token) setToken(j.token); return j || { ok: false }; });
        });
      })
      .catch(function (e) { return { ok: false, reason: String((e && e.message) || e).slice(0, 120) }; });
  }

  function issue(uid, name, cgu) {
    /* Établit la session unique pour tout le domaine. Stocke le pass signé
       (pour le canal Bearer / les PWA). → true/false. */
    return fetch(BASE + '/issue', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ uid: uid, name: name, cgu: !!cgu }),
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.ok && j.token) setToken(j.token); return !!(j && j.ok); })
      .catch(function () { return false; });
  }

  function logout() {
    setToken('');
    return fetch(BASE + '/logout', { method: 'POST', credentials: 'include', headers: authHeaders() })
      .then(function () { return true; })
      .catch(function () { return false; });
  }

  /* Pour les APPS : garantit une session du domaine.
     - Récupère un éventuel pass dans l'URL.
     - whoami : si session → la retourne.
     - sinon → redirige vers le domaine pour se connecter (et revenir avec le pass),
       SAUF si on a déjà tenté (on a un pass mais invalide) → anti-boucle : retourne
       null et l'app garde son login normal (jamais de verrouillage). */
  function ensureSession(returnUrl) {
    var hadToken = !!storedToken();
    var got = consumeHashToken();
    return whoami().then(function (s) {
      if (s) return s;
      if (got || hadToken) { setToken(''); return null; } /* pass présent mais KO → ne pas boucler */
      try {
        var u = 'https://kd-mc.com/?return=' + encodeURIComponent(returnUrl || location.href);
        location.replace(u);
      } catch (e) { /* ignore */ }
      return null;
    }).catch(function () { return null; });
  }

  /* ===== POLITIQUE DE CONFIANCE CROSS-APP (« Admin auto, toi seul ») =====
     Décide si une app peut ouvrir une session AUTOMATIQUE depuis la session du
     domaine — et avec quel rôle. RÈGLE DE SÉCURITÉ ABSOLUE :
       - role 'admin' UNIQUEMENT si l'identité est PROUVÉE par Face ID (verified)
         ET propriétaire (admin = uid dans la liste blanche côté domaine).
       - verified mais non-propriétaire → role 'user' (session normale).
       - NON vérifié (nom auto-déclaré, code choisi) → AUCUN auto-login (null).
         L'app peut quand même pré-remplir le nom via whoami(), mais ne DOIT pas
         accorder de session/privilège sur cette seule base (faille d'usurpation).
     Récupère d'abord un éventuel pass signé dans l'URL (#kdmc_sso=). Fail-open :
     toute erreur → null → l'app garde son login normal (jamais de verrouillage). */
  function autoLogin() {
    try { consumeHashToken(); } catch (e) { /* ignore */ }
    return whoami().then(function (s) {
      if (!s) return null;
      if (!s.verified) return null; /* jamais d'auto-login sans preuve Face ID */
      return { uid: s.uid, name: s.name, cgu: !!s.cgu, role: s.admin ? 'admin' : 'user', verified: true };
    }).catch(function () { return null; });
  }

  global.kdmcSSO = {
    whoami: whoami,
    issue: issue,
    logout: logout,
    consumeHashToken: consumeHashToken,
    ensureSession: ensureSession,
    autoLogin: autoLogin,
    token: storedToken,
    supportsPasskey: supportsPasskey,
    registerPasskey: registerPasskey,
    loginPasskey: loginPasskey,
  };
})(window);
