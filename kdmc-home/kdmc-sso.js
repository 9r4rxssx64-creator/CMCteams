/* KDMC APEX — client SSO transverse (session unique kd-mc.com).
   Tout est fail-open : si le router SSO est indisponible, les fonctions
   renvoient null/false et l'appelant retombe sur son comportement normal.
   Le cookie de session est HttpOnly (posé par le router) → jamais lu en JS
   (anti-vol XSS) ; on interroge /__sso/whoami côté serveur. */
(function (global) {
  'use strict';
  var BASE = '/__sso';

  function whoami() {
    /* → { uid, name, cgu } si session valide, sinon null. */
    return fetch(BASE + '/whoami', { method: 'GET', credentials: 'include', cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return j && j.ok ? { uid: j.uid, name: j.name, cgu: !!j.cgu } : null; })
      .catch(function () { return null; });
  }

  function issue(uid, name, cgu) {
    /* Établit la session unique pour tout le domaine. → true/false. */
    return fetch(BASE + '/issue', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ uid: uid, name: name, cgu: !!cgu }),
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return !!(j && j.ok); })
      .catch(function () { return false; });
  }

  function logout() {
    return fetch(BASE + '/logout', { method: 'POST', credentials: 'include' })
      .then(function () { return true; })
      .catch(function () { return false; });
  }

  global.kdmcSSO = { whoami: whoami, issue: issue, logout: logout };
})(window);
