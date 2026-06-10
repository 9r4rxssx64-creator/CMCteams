/* KDMC APEX — Admin domaine : fiches clients (max renseignements, enrichies à
   chaque connexion) + fonctions communes à tous les projets. Réservé admin
   (vérifié côté router via la session SSO ; l'UI ne fait que refléter). */
(function () {
  'use strict';
  var app = document.getElementById('app');
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ago(ts) { if (!ts) return '—'; var d = Date.now() - ts, m = Math.floor(d / 6e4), h = Math.floor(d / 36e5), j = Math.floor(d / 864e5); if (m < 1) return "à l'instant"; if (m < 60) return 'il y a ' + m + ' min'; if (h < 24) return 'il y a ' + h + ' h'; return 'il y a ' + j + ' j'; }
  function dt(ts) { if (!ts) return '—'; try { return new Date(ts).toLocaleString('fr-FR'); } catch (e) { return '—'; } }

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
      + card('📊', 'Boutiques — Dashboard', 'Commandes, produits, finances', 'https://9r4rxssx64-creator.github.io/CMCteams/shops/dashboard/')
      + card('🩺', 'Santé des workers', 'État live de tous les services', 'https://github.com/9r4rxssx64-creator/cmcteams/blob/main/tools/health/workers-status.json')
      + '</div>';
  }
  function kvp(k, v) { return '<div><span>' + k + '</span><br>' + v + '</div>'; }
  function fiche(a) {
    var places = (a.places || []).join(' · ') || a.last_place || '—';
    var devs = (a.devices || []).join(' · ') || a.last_device || '—';
    return '<div class="kdmc-card kdmc-in fiche">'
      + '<div class="fhead"><div><h3>' + esc(a.name || a.uid) + '</h3><div class="uid">' + esc(a.uid) + '</div></div>'
      + '<div class="when"><span class="kdmc-dot"></span>' + ago(a.last_seen) + '</div></div>'
      + '<div class="kv">'
      + kvp('Compte créé', dt(a.created))
      + kvp('CGU acceptée', a.cgu_at ? dt(a.cgu_at) : '—')
      + kvp('Connexions', String(a.hits || 0))
      + kvp('Appareils', esc(devs))
      + kvp('Lieux', esc(places))
      + kvp('Dernière connexion', dt(a.last_seen))
      + '</div></div>';
  }

  function render(accounts, kv) {
    var withCgu = accounts.filter(function (a) { return a.cgu_at; }).length;
    var hits = accounts.reduce(function (s, a) { return s + (a.hits || 0); }, 0);
    app.innerHTML =
      '<div class="stat">'
      + '<div class="pill kdmc-in"><b>' + accounts.length + '</b> comptes clients</div>'
      + '<div class="pill kdmc-in"><b>' + withCgu + '</b> CGU acceptées</div>'
      + '<div class="pill kdmc-in"><b>' + hits + '</b> connexions</div>'
      + '</div>'
      + (kv ? '' : '<div class="note">⚙️ Le registre central (KV) s\'activera au prochain déploiement du router : les fiches apparaîtront alors automatiquement. Les fonctions communes ci-dessous marchent déjà.</div>')
      + '<input class="search" id="q" placeholder="🔎 Rechercher un client (nom, lieu, appareil)…" autocomplete="off" autocapitalize="off">'
      + '<h2 class="cat">👥 Fiches clients</h2>'
      + (accounts.length ? '<div id="list">' + accounts.map(fiche).join('') + '</div>'
        : '<div class="msg">Aucune fiche pour l\'instant.<br>Les comptes apparaissent ici dès leur 1ʳᵉ connexion sur le domaine.</div>')
      + hub();
    var q = document.getElementById('q');
    if (q) q.addEventListener('input', function () {
      var v = q.value.toLowerCase();
      var list = document.querySelectorAll('#list .fiche');
      for (var i = 0; i < list.length; i++) list[i].style.display = list[i].textContent.toLowerCase().indexOf(v) >= 0 ? '' : 'none';
    });
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

  function loadAccounts(tries) {
    return fetch('/__admin/accounts', { credentials: 'include', cache: 'no-store', headers: adminHeaders() })
      .then(function (r) { return r.json().then(function (j) { return { st: r.status, j: j }; }).catch(function () { return { st: r.status, j: null }; }); })
      .then(function (res) {
        var j = res.j;
        if (res.st === 403 || !j || !j.ok) {
          if (j && j.reason === 'need_admin_code') { promptAdminCode(); return; }
          denyViaWhoami(); return; /* rollout sans hash : ancien diag par nom */
        }
        var accounts = j.accounts || [];
        /* KV éventuellement cohérent : retente 1-2× (2s) si index vide après 1ʳᵉ connexion. */
        if (accounts.length === 0 && j.kv !== false && (tries || 0) < 2) {
          setTimeout(function () { loadAccounts((tries || 0) + 1); }, 2000);
        }
        render(accounts, j.kv !== false);
      })
      .catch(function () { denyViaWhoami(); });
  }
  function boot() { loading(); loadAccounts(0); }
  boot();
})();
