/* KDMC APEX — Admin domaine : fiches clients (max renseignements, enrichies à
   chaque connexion) + fonctions communes à tous les projets. Réservé admin
   (vérifié côté router via la session SSO ; l'UI ne fait que refléter). */
(function () {
  'use strict';
  var app = document.getElementById('app');
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ago(ts) { if (!ts) return '—'; var d = Date.now() - ts, m = Math.floor(d / 6e4), h = Math.floor(d / 36e5), j = Math.floor(d / 864e5); if (m < 1) return "à l'instant"; if (m < 60) return 'il y a ' + m + ' min'; if (h < 24) return 'il y a ' + h + ' h'; return 'il y a ' + j + ' j'; }
  function dt(ts) { if (!ts) return '—'; try { return new Date(ts).toLocaleString('fr-FR'); } catch (e) { return '—'; } }
  function dur(ms) { ms = ms || 0; if (ms < 60000) return '< 1 min'; var m = Math.round(ms / 60000); if (m < 60) return m + ' min'; var h = Math.floor(m / 60); m = m % 60; return h + ' h' + (m ? (' ' + m) : ''); }

  function deny(s) {
    var diag;
    if (!s) {
      diag = 'Aucune <b>session du domaine</b> détectée sur cet appareil.<br>'
        + '<span style="color:var(--subtle)">(Le cookie de connexion n\'a pas été posé, ou il est bloqué par le navigateur.)</span>';
    } else {
      diag = 'Session du domaine OK ✅ — connecté en tant que <b>' + esc(s.name || '?') + '</b><br>'
        + 'identifiant : <code>' + esc(s.uid || '?') + '</code><br>'
        + '<span style="color:var(--subtle)">mais ce compte n\'est pas dans la liste administrateur.</span>';
    }
    app.innerHTML = '<div class="msg">🔒 <b>Accès administrateur</b><br><br>' + diag
      + '<br><br>Connecte-toi sur <a href="/" style="color:var(--gold)">kd-mc.com</a> avec le compte admin (Kevin).</div>';
  }
  function loading() { app.innerHTML = '<div class="kdmc-skel" style="margin-bottom:10px"></div><div class="kdmc-skel" style="margin-bottom:10px;opacity:.7"></div><div class="kdmc-skel" style="opacity:.4"></div>'; }

  function card(i, n, d, h) {
    return '<a class="kdmc-card kdmc-in cardrow" href="' + h + '"><span class="i">' + i + '</span><span class="ct"><span class="n">' + esc(n) + '</span><span class="d">' + esc(d) + '</span></span><span class="arr">›</span></a>';
  }
  function hub() {
    return '<h2 class="cat">🧩 Fonctions communes — tous les projets</h2><div class="grid">'
      + card('📅', 'CMCteams — Admin', 'Plannings, équipes, employés', 'https://cmcteams.kd-mc.com/')
      + card('🤖', 'Apex AI — Admin', 'Coffre, RGPD, santé, conso', 'https://apex-ai.kd-mc.com/')
      + card('💬', 'Apex Chat — Admin', 'Users, connexions, sentinelles', 'https://apex-chat.kd-mc.com/')
      + card('📊', 'Boutiques — Dashboard', 'Commandes, produits, finances', 'https://dashboard.kd-mc.com/')
      + card('🩺', 'Santé des workers', 'État live de tous les services', 'https://github.com/9r4rxssx64-creator/cmcteams/blob/main/tools/health/workers-status.json')
      + '</div>'
      + '<h2 class="cat">🎨 Studios de création</h2><div class="grid">'
      + card('🎨', 'Studio — La Détente', 'Créer logos & produits (POD)', 'https://9r4rxssx64-creator.github.io/CMCteams/shops/la-detente/studio.html')
      + card('🎨', 'Studio — Chez Lolo', 'Créer logos & produits (POD)', 'https://9r4rxssx64-creator.github.io/CMCteams/shops/chez-lolo/studio.html')
      + '</div>';
  }
  function kvp(k, v) { return '<div><span>' + k + '</span><br>' + v + '</div>'; }
  /* ---- Présence : qui est connecté, combien, cliquable → fiche ---- */
  var ONLINE_MS = 5 * 60e3, RECENT_MS = 60 * 60e3;
  function ini(a) { return (String(a.name || a.uid || '?').trim().charAt(0) || '?').toUpperCase(); }
  function prow(a) {
    var on = Date.now() - (a.last_seen || 0) < ONLINE_MS;
    var meta = ago(a.last_seen) + (a.last_device ? ' · ' + a.last_device : '') + (a.last_place ? ' · ' + a.last_place : '');
    return '<a class="kdmc-card kdmc-in cardrow onrow" href="#fiche-' + esc(a.uid) + '">'
      + '<span class="i">' + esc(ini(a)) + '</span>'
      + '<span class="ct"><span class="n">' + esc(a.name || a.uid) + '</span>'
      + '<span class="d"><span class="don' + (on ? '' : ' rec') + '"></span>' + esc(meta) + '</span></span>'
      + '<span class="arr">›</span></a>';
  }
  function globalPills(accounts) {
    var withCgu = accounts.filter(function (a) { return a.cgu_at; }).length;
    var hits = accounts.reduce(function (s, a) { return s + (a.hits || 0); }, 0);
    return '<div class="pill kdmc-in"><b>' + accounts.length + '</b> comptes clients</div>'
      + '<div class="pill kdmc-in"><b>' + withCgu + '</b> CGU acceptées</div>'
      + '<div class="pill kdmc-in"><b>' + hits + '</b> connexions cumulées</div>';
  }
  function presence(accounts) {
    var now = Date.now();
    var on = accounts.filter(function (a) { return a.last_seen && now - a.last_seen < ONLINE_MS; });
    var rec = accounts.filter(function (a) { return a.last_seen && now - a.last_seen >= ONLINE_MS && now - a.last_seen < RECENT_MS; });
    var h = '<h2 class="cat">🟢 Connectés <button class="refresh" id="prefresh" type="button">↻ Rafraîchir</button></h2>'
      + '<div class="stat">'
      + '<div class="pill kdmc-in"><b>' + on.length + '</b> en ligne <span style="color:var(--subtle)">vus &lt; 5 min</span></div>'
      + '<div class="pill kdmc-in"><b>' + rec.length + '</b> récents <span style="color:var(--subtle)">&lt; 1 h</span></div>'
      + '</div>'
      + (on.length ? '<div>' + on.map(prow).join('') + '</div>'
        : '<div class="msg" style="padding:18px 16px">Personne en ligne à l\'instant.</div>');
    if (rec.length) h += '<h2 class="cat" style="margin-top:14px">🟡 Récents <span style="color:var(--subtle);text-transform:none;letter-spacing:0;font-weight:500">— moins d\'une heure</span></h2><div>' + rec.map(prow).join('') + '</div>';
    return h;
  }
  function wirePresence() { var b = document.getElementById('prefresh'); if (b) b.addEventListener('click', function () { loadAccounts(0, true); }); }

  /* ---- Historique des connexions : 1 personne (pas de doublon), avec quels sites ---- */
  /* Copie de REPLI (hors-ligne). SOURCE UNIQUE = /apps.json (chargée au boot,
     fusionnée par-dessus). Le test apps-consistency garantit qu'elles ne divergent pas. */
  var APP_NAMES = {
    'cmcteams.kd-mc.com': '📅 CMCteams', 'cmcteams-light.kd-mc.com': '🎯 CMCteams light', 'departs.kd-mc.com': '🎯 CMCteams light',
    'apex-ai.kd-mc.com': '🤖 Apex AI', 'apex-chat.kd-mc.com': '💬 Apex Chat',
    'dashboard.kd-mc.com': '📊 Dashboard', 'sourcing.kd-mc.com': '📦 Sourcing', 'coffre.kd-mc.com': '🔐 Coffre',
    'kd-mc.com': '🏠 Portail', 'www.kd-mc.com': '🏠 Portail', 'la-detente.kd-mc.com': '🌿 La Détente', 'chez-lolo.kd-mc.com': '🎨 Chez Lolo'
  };
  try {
    fetch('/apps.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
      var a = j && j.apps; if (!a) return;
      Object.keys(a).forEach(function (h) { APP_NAMES[h] = (a[h].icon ? a[h].icon + ' ' : '') + (a[h].name || h); });
    }).catch(function () { /* repli intégré */ });
  } catch (e) { /* repli intégré */ }
  function appName(host) { return APP_NAMES[host] || ('🌐 ' + (host || '?')); }
  function appsSummary(apps) {
    if (!apps) return '—';
    var keys = Object.keys(apps).sort(function (x, y) { return (apps[y].last || 0) - (apps[x].last || 0); });
    if (!keys.length) return '—';
    return keys.map(function (h) { return appName(h) + ' ×' + (apps[h].sessions || 1); }).join(' · ');
  }
  function histRow(a) {
    var hist = a.history || [];
    var tl = hist.length
      ? hist.slice(0, 40).map(function (e) {
        return '<div class="tlrow">' + esc(dt(e.ts)) + ' · <b>' + esc(appName(e.app)) + '</b>'
          + ' · <span class="tdur">⏱ ' + esc(dur((e.end || e.ts) - e.ts)) + '</span>'
          + (e.device ? ' · ' + esc(e.device) : '') + (e.place ? ' · ' + esc(e.place) : '') + '</div>';
      }).join('')
      : '<div class="tlrow" style="color:var(--subtle)">Aucune connexion enregistrée pour l\'instant — l\'historique se remplit à la prochaine connexion.</div>';
    var n = a.hits || 0;
    var total = hist.reduce(function (s, e) { return s + Math.max(0, (e.end || e.ts) - e.ts); }, 0);
    return '<details class="histrow kdmc-card kdmc-in">'
      + '<summary><span class="i">' + esc(ini(a)) + '</span>'
      + '<span class="ct"><span class="n">' + esc(a.name || a.uid) + '</span>'
      + '<span class="d">' + n + ' connexion' + (n > 1 ? 's' : '') + (total ? ' · ⏱ ' + esc(dur(total)) + ' au total' : '') + ' · ' + esc(appsSummary(a.apps)) + '</span></span>'
      + '<span class="when"><span class="kdmc-dot"></span>' + ago(a.last_seen) + '</span></summary>'
      + '<div class="timeline">' + tl + '</div></details>';
  }
  function histSection(accounts) {
    return '<h2 class="cat">🕘 Historique des connexions</h2>'
      + '<input class="search" id="hq" placeholder="🔎 Filtrer (nom, site…)" autocomplete="off" autocapitalize="off">'
      + (accounts.length ? '<div id="histlist">' + accounts.map(histRow).join('') + '</div>'
        : '<div class="msg">Aucune connexion pour l\'instant.</div>');
  }
  function wireHist() {
    var hq = document.getElementById('hq');
    if (hq) hq.addEventListener('input', function () {
      var v = hq.value.toLowerCase(), list = document.querySelectorAll('#histlist .histrow');
      for (var i = 0; i < list.length; i++) list[i].style.display = list[i].textContent.toLowerCase().indexOf(v) >= 0 ? '' : 'none';
    });
  }

  /* Détail par site : nom + dernière fois VU sur ce site (la donnée existait
     déjà dans apps[host].last, elle n'était juste pas affichée). */
  function appsDetail(apps) {
    if (!apps) return '—';
    var keys = Object.keys(apps).sort(function (x, y) { return (apps[y].last || 0) - (apps[x].last || 0); });
    if (!keys.length) return '—';
    return keys.map(function (h) {
      return esc(appName(h)) + ' ×' + (apps[h].sessions || 1)
        + ' <span style="color:var(--subtle)">— vu ' + esc(ago(apps[h].last)) + '</span>';
    }).join('<br>');
  }
  function fiche(a) {
    var places = (a.places || []).map(esc).join(' · ') || esc(a.last_place || '—');
    var devs = (a.devices || []).map(esc).join(' · ') || esc(a.last_device || '—');
    return '<div class="kdmc-card kdmc-in fiche" id="fiche-' + esc(a.uid) + '">'
      + '<div class="fhead"><div><h3>' + esc(a.name || a.uid) + '</h3><div class="uid">' + esc(a.uid) + '</div></div>'
      + '<div class="when"><span class="kdmc-dot"></span>' + ago(a.last_seen) + '</div></div>'
      + '<div class="kv">'
      + kvp('Compte créé', dt(a.created))
      + kvp('CGU acceptée', a.cgu_at ? dt(a.cgu_at) : '—')
      + kvp('Connexions', String(a.hits || 0))
      + kvp('Sites utilisés', appsDetail(a.apps))
      + kvp('Appareils', devs)
      + kvp('Lieux', places)
      + kvp('Dernière connexion', dt(a.last_seen))
      + '</div>'
      + '<button class="revoke" data-uid="' + esc(a.uid) + '" type="button" '
      + 'title="Coupe toutes ses sessions ouvertes (appareil perdu/volé). Il pourra se reconnecter normalement.">🚪 Déconnecter partout</button>'
      + '</div>';
  }

  /* ---- Journal admin (événements sensibles, tracés côté serveur) ---- */
  var AUD_EV = {
    admin_login_ok: '🔓 Connexion admin réussie', admin_login_fail: '⛔️ Code admin refusé',
    revoke_sessions: '🚪 Déconnexion forcée', new_device: '📱 Nouvel appareil', fbtoken_mint: '🔥 Jeton Firebase admin émis'
  };
  function audRow(e) {
    return '<div class="tlrow">' + esc(dt(e.ts)) + ' · <b>' + esc(AUD_EV[e.ev] || e.ev) + '</b>'
      + (e.uid ? ' · ' + esc(e.uid) : '') + (e.detail ? ' · ' + esc(e.detail) : '')
      + (e.ip ? ' · <span style="color:var(--subtle)">ip ' + esc(e.ip) + '</span>' : '') + '</div>';
  }
  function loadAudit() {
    fetch('/__admin/audit', { credentials: 'include', cache: 'no-store', headers: adminHeaders() })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var el2 = document.getElementById('audsec');
        if (!el2 || !j || !j.ok) return;
        var log = j.log || [];
        el2.innerHTML = '<h2 class="cat">🛡 Journal admin</h2>'
          + '<details class="histrow kdmc-card kdmc-in"><summary><span class="i">🛡</span>'
          + '<span class="ct"><span class="n">Événements sensibles</span>'
          + '<span class="d">' + log.length + ' entrée' + (log.length > 1 ? 's' : '') + ' — connexions admin, nouveaux appareils, déconnexions forcées</span></span></summary>'
          + '<div class="timeline">' + (log.length ? log.slice(0, 60).map(audRow).join('') : '<div class="tlrow" style="color:var(--subtle)">Rien pour l\'instant.</div>') + '</div></details>';
      })
      .catch(function () { /* silencieux : section optionnelle */ });
  }

  function wireRevoke() {
    var list = document.getElementById('list');
    if (!list) return;
    list.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('.revoke') : null;
      if (!b) return;
      var uid = b.getAttribute('data-uid') || '';
      if (!confirm('Déconnecter « ' + uid + ' » de TOUS ses appareils ?\n\nSes sessions ouvertes seront coupées immédiatement.\nIl pourra se reconnecter normalement (Face ID ou nom + code).')) return;
      b.disabled = true; b.textContent = '…';
      fetch('/__admin/revoke', { method: 'POST', credentials: 'include', headers: Object.assign({ 'content-type': 'application/json' }, adminHeaders()), body: JSON.stringify({ uid: uid }) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j && j.ok) { b.textContent = '✅ Déconnecté partout'; loadAudit(); }
          else { b.disabled = false; b.textContent = '⚠️ Échec — réessaie'; }
        })
        .catch(function () { b.disabled = false; b.textContent = '🚪 Déconnecter partout'; });
    });
  }

  function render(accounts, kv) {
    app.innerHTML =
      '<div id="presence">' + presence(accounts) + '</div>'
      + (kv ? '' : '<div class="note">⚙️ Le registre central (KV) s\'activera au prochain déploiement du router : les fiches apparaîtront alors automatiquement. Les fonctions communes ci-dessous marchent déjà.</div>')
      + '<h2 class="cat">📊 Tous les comptes</h2>'
      + '<div class="stat" id="gstat">' + globalPills(accounts) + '</div>'
      + histSection(accounts)
      + '<input class="search" id="q" placeholder="🔎 Rechercher un client (nom, lieu, appareil)…" autocomplete="off" autocapitalize="off">'
      + '<h2 class="cat">👥 Fiches clients</h2>'
      + (accounts.length ? '<div id="list">' + accounts.map(fiche).join('') + '</div>'
        : '<div class="msg">Aucune fiche pour l\'instant.<br>Les comptes apparaissent ici dès leur 1ʳᵉ connexion sur le domaine.</div>')
      + '<div id="audsec"></div>'
      + hub();
    wirePresence();
    wireHist();
    wireRevoke();
    var q = document.getElementById('q');
    if (q) q.addEventListener('input', function () {
      var v = q.value.toLowerCase();
      var list = document.querySelectorAll('#list .fiche');
      for (var i = 0; i < list.length; i++) list[i].style.display = list[i].textContent.toLowerCase().indexOf(v) >= 0 ? '' : 'none';
    });
    loadAudit();
    startPolling();
  }
  /* Rafraîchissement présence : non-intrusif (ne touche QUE #presence + #gstat,
     ne réinitialise ni la recherche ni le scroll). 25 s, seulement onglet visible. */
  var _poll = null, _lastPres = '', _lastPills = '';
  function startPolling() {
    if (_poll) return;
    _poll = setInterval(function () { if (document.visibilityState === 'visible') loadAccounts(0, true); }, 25000);
  }

  /* Le grant admin (preuve du code) voyage en header x-kdmc-admin pour marcher
     même en PWA installée (cookie isolé par app sur iOS). */
  var ADMIN_TOK = 'kdmc_admin_token';
  function adminHeaders() { var t = ''; try { t = localStorage.getItem(ADMIN_TOK) || ''; } catch (e) { /* */ } return t ? { 'x-kdmc-admin': t } : {}; }

  function denyViaWhoami() {
    var who = window.kdmcSSO ? window.kdmcSSO.whoami() : Promise.resolve(null);
    who.then(function (s) { deny(s); }).catch(function () { deny(null); });
  }

  function promptAdminCode(err) {
    app.innerHTML = '<div class="msg" style="max-width:360px;margin:24px auto;text-align:center">'
      + '🔒 <b>Accès administrateur</b><br><br>'
      + 'Entre ton <b>code admin</b> pour voir les fiches clients.<br>'
      + '<span style="color:var(--subtle);font-size:13px">(Le nom seul ne suffit pas — sécurité.)</span><br><br>'
      + '<input id="acode" type="password" inputmode="numeric" autocomplete="off" placeholder="Code admin" '
      + 'style="width:100%;max-width:240px;padding:12px 14px;border-radius:12px;border:1px solid var(--line,#2a2a32);background:#0a120c;color:#f3f0e6;font-size:18px;text-align:center;letter-spacing:4px">'
      + (err ? '<div style="color:#ff6b6b;font-size:13px;margin-top:8px">' + esc(err) + '</div>' : '')
      + '<br><button id="ago2" style="margin-top:12px;padding:12px 22px;border:none;border-radius:12px;background:linear-gradient(135deg,#f6d97a,#e8b830);color:#11160c;font-weight:700;font-size:15px;cursor:pointer;min-height:46px">Déverrouiller</button>'
      + '</div>';
    var inp = document.getElementById('acode'), btn = document.getElementById('ago2');
    function go() {
      var code = (inp.value || '').trim(); if (!code) return;
      btn.disabled = true; btn.textContent = '…';
      fetch('/__admin/login', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: code }) })
        .then(function (r) { return r.json().catch(function () { return null; }); })
        .then(function (j) {
          if (j && j.ok && j.grant) { try { localStorage.setItem(ADMIN_TOK, j.grant); } catch (e) { /* */ } loading(); loadAccounts(0); return; }
          var msg = (j && j.reason === 'code_invalide') ? 'Code invalide.'
            : (j && j.reason === 'admin_pin_not_configured') ? "Le verrou admin n'est pas encore déployé (réessaie dans 1 min)."
              : 'Erreur, réessaie.';
          promptAdminCode(msg);
        })
        .catch(function () { promptAdminCode('Réseau indisponible, réessaie.'); });
    }
    if (btn) btn.addEventListener('click', go);
    if (inp) { inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); }); inp.focus(); }
  }

  function loadAccounts(tries, silent) {
    return fetch('/__admin/accounts', { credentials: 'include', cache: 'no-store', headers: adminHeaders() })
      .then(function (r) { return r.json().then(function (j) { return { st: r.status, j: j }; }).catch(function () { return { st: r.status, j: null }; }); })
      .then(function (res) {
        var j = res.j;
        if (res.st === 403 || !j || !j.ok) {
          if (silent) return; /* refresh auto : ne casse pas la vue si hoquet réseau/grant */
          if (j && j.reason === 'need_admin_code') { try { localStorage.removeItem(ADMIN_TOK); } catch (e) { /* */ } promptAdminCode(); return; }
          denyViaWhoami(); return; /* rollout sans hash : ancien diag par nom */
        }
        var accounts = j.accounts || [];
        /* KV éventuellement cohérent : retente 1-2× (2s) si index vide après 1ʳᵉ connexion. */
        if (accounts.length === 0 && j.kv !== false && (tries || 0) < 2) {
          setTimeout(function () { loadAccounts((tries || 0) + 1, silent); }, 2000);
        }
        if (silent) {
          /* Mise à jour ciblée + IDEMPOTENTE (leçon #94) : ne réécrit le DOM que
             si le HTML a réellement changé → 0 mutation au repos, 0 clignotement. */
          var p = document.getElementById('presence'), g = document.getElementById('gstat');
          if (!p || !g) { render(accounts, j.kv !== false); return; }
          var ph = presence(accounts), gh = globalPills(accounts);
          if (_lastPres !== ph) { _lastPres = ph; p.innerHTML = ph; wirePresence(); }
          if (_lastPills !== gh) { _lastPills = gh; g.innerHTML = gh; }
          return;
        }
        render(accounts, j.kv !== false);
      })
      .catch(function () { if (!silent) denyViaWhoami(); });
  }
  function boot() { loading(); loadAccounts(0); }
  boot();
})();
