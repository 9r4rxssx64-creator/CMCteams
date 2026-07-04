/* free-apis-client.js — client léger de la passerelle kdmc-apis (toutes apps kd-mc.com).
 * À inclure en chemin ABSOLU (leçon #102 : le routeur laisse passer /CMCteams/…) :
 *   <script src="/CMCteams/tools/shared/free-apis-client.js"></script>
 * Puis : await KdmcApis.holidays({country:'FR',year:2026})
 *        await KdmcApis.ai({messages:[{role:'user',content:'Bonjour'}]})
 *        await KdmcApis.fx({from:'USD',to:'EUR',amount:25})
 * Aucune clé côté client. Fail-safe : renvoie {ok:false, error} au lieu de throw.
 * Isolation : passe app=<tag> pour scoper (logs/rate-limit côté passerelle). */
(function (root) {
  'use strict';
  var GW = 'https://apis.kd-mc.com';
  var GW_FB = 'https://kdmc-apis.9r4rxssx64.workers.dev';
  var APP = (root.__KDMC_APP__ || 'app');

  function qs(params) {
    if (!params) return '';
    var parts = [];
    for (var k in params) {
      if (Object.prototype.hasOwnProperty.call(params, k) && params[k] != null) {
        parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
      }
    }
    parts.push('app=' + encodeURIComponent(APP));
    return parts.length ? '?' + parts.join('&') : '';
  }

  async function req(route, opts) {
    opts = opts || {};
    var body = opts.body ? JSON.stringify(opts.body) : undefined;
    var init = {
      method: opts.method || (opts.body ? 'POST' : 'GET'),
      headers: opts.body ? { 'Content-Type': 'application/json', 'x-kdmc-app': APP } : { 'x-kdmc-app': APP },
      body: body,
    };
    var path = '/' + route + (opts.params ? qs(opts.params) : (opts.body ? qs(null) : ''));
    for (var i = 0; i < 2; i++) {
      var base = i === 0 ? GW : GW_FB;
      try {
        var r = await fetch(base + path, init);
        var data = await r.json().catch(function () { return {}; });
        if (r.ok) return data.ok === false ? data : (data.ok === undefined ? { ok: true, data: data } : data);
        if (r.status >= 500 || r.status === 0) continue; // failover sur panne serveur
        return { ok: false, error: data.error || ('HTTP ' + r.status), detail: data.detail || null, status: r.status };
      } catch (e) {
        if (i === 1) return { ok: false, error: 'réseau', detail: String(e && e.message) };
      }
    }
    return { ok: false, error: 'passerelle indisponible' };
  }

  var API = {
    setApp: function (name) { APP = String(name || 'app'); },
    // Keyless
    weather: function (params) { return req('weather', { params: params }); },
    holidays: function (params) { return req('holidays', { params: params }); },
    fx: function (params) { return req('fx', { params: params }); },
    geo: function (params) { return req('geo', { params: params }); },
    geoip: function () { return req('geoip', {}); },
    time: function (params) { return req('time', { params: params }); },
    translate: function (params) { return req('translate', { params: params }); },
    wiki: function (params) { return req('wiki', { params: params }); },
    pwned: function (params) { return req('pwned', { params: params }); },
    // Keyed (origine de confiance requise → marche sur *.kd-mc.com)
    ai: function (body) { return req('ai', { body: body }); },
    search: function (params) { return req('search', { params: params }); },
    finance: function (params) { return req('finance', { params: params }); },
    images: function (params) { return req('images', { params: params }); },
    printify: function (path) { return req('printify/' + (path || 'catalog/blueprints.json'), {}); },
    health: function () { return req('health', {}); },
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.KdmcApis = API;
})(typeof window !== 'undefined' ? window : globalThis);
