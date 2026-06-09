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
      .then(function (j) { return j && j.ok ? { uid: j.uid, name: j.name, cgu: !!j.cgu, admin: !!j.admin } : null; })
      .catch(function () { return null; });
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

  global.kdmcSSO = {
    whoami: whoami,
    issue: issue,
    logout: logout,
    consumeHashToken: consumeHashToken,
    ensureSession: ensureSession,
    token: storedToken,
  };
})(window);
