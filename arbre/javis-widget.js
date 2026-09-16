/* javis-widget.js — Bee, le personnage de Lingua, en assistant flottant partout.
 * ==========================================================================
 * Kevin (2026-09-16) : « Un bouton flottant avec le personnage, cliquable, seulement
 * pour moi quand j'ouvre le domaine. Il connaît tout, tourne sur Apex en gratuit
 * d'abord, peut m'ouvrir des liens. De vraies mimiques. »
 * Puis : « Bee, le personnage qu'on a créé pour apprendre les langues — Lingua. »
 *
 * ── LE PERSONNAGE : Bee, PAS un nouveau dessin ──────────────────────────────
 * On réutilise LA marionnette de Lingua, pas une copie : mêmes images
 * (`lingua.kd-mc.com/bee/v2/rig/`), mêmes classes (`bee-rig`, `rig-base`,
 * `rig-lid`, `disc-mouth`), même géométrie mesurée sur son dessin (position des
 * paupières et de la bouche en %). Si l'art de Bee évolue dans Lingua, Javis suit
 * tout seul — aucune image dupliquée à re-synchroniser (leçon #142 : deux copies
 * d'une même vérité divergent toujours).
 * Le CSS/JS ci-dessous est un PORT FIDÈLE de lingua/index.html + lingua/app.js
 * (mascotAlive) : respiration, clignement naturel, regard qui te suit, sommeil
 * avec « z », réaction au toucher, bouche qui parle, ailes qui battent plus vite
 * quand elle parle.
 *
 * ── Le reste ────────────────────────────────────────────────────────────────
 *  1. `/__sso/whoami` : le bouton n'apparaît QUE pour Kevin (admin + Face ID
 *     prouvé) — même pattern éprouvé que tools/departs/_depSsoAutoAdmin.
 *     Fail-CLOSED sur la visibilité, fail-OPEN sur le réseau (SSO muet = pas de
 *     bouton, page intacte).
 *  2. Le chat parle à `apis.kd-mc.com/ai` (DÉJÀ en prod) → gratuit Qwen d'abord,
 *     bascule Anthropic pour code/raisonnement/action. Zéro backend nouveau.
 *  3. Bee PARLE sa réponse (Web Speech API, native, gratuite) et sa bouche
 *     s'anime pendant — pas un lip-sync phonétique, un vrai mouvement synchronisé.
 *  4. Intentions locales (ouvrir une app du domaine, météo) exécutées directement dans le
 *     navigateur. Une ACTION sur tes données part vers Apex authentifié
 *     (`apex_v13_chat_prefill`) : un script public ne détient jamais de secret
 *     d'écriture.
 *
 * ── À ajouter sur une page ──────────────────────────────────────────────────
 *   <script src="javis-widget.js" defer></script>
 *   + CSP : `img-src` doit inclure https://lingua.kd-mc.com (les images de Bee)
 *           `connect-src` doit inclure https://apis.kd-mc.com https://api.open-meteo.com
 *   (sinon échec silencieux : piège CSP⇄fetch déjà documenté dans CLAUDE.md)
 */
(function () {
  'use strict';
  if (window.__javisWidgetLoaded) return;
  window.__javisWidgetLoaded = true;

  var AI_ENDPOINT = 'https://apis.kd-mc.com/ai';
  var BEE_BASE = 'https://lingua.kd-mc.com/bee/v2/rig/'; /* la source de vérité du dessin */
  var STORAGE_HIST = 'javis_widget_history';
  var STORAGE_VOICE = 'javis_widget_voice_on';
  var MAX_HISTORY = 40;

  /* ============================================================
     0. Qui es-tu ? (SSO domaine — même pattern que tools/departs)
     ============================================================ */
  function ssoToken() {
    try {
      var m = (location.hash || '').match(/[#&]kdmc_sso=([^&]+)/);
      if (m) {
        try { localStorage.setItem('kdmc_sso_token', decodeURIComponent(m[1])); } catch (_) {}
        try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {}
      }
      return localStorage.getItem('kdmc_sso_token') || '';
    } catch (_) { return ''; }
  }

  function checkAdmin(cb) {
    try {
      var tok = ssoToken();
      var hdr = {};
      if (tok) hdr.Authorization = 'Bearer ' + tok;
      fetch('/__sso/whoami', { credentials: 'include', cache: 'no-store', headers: hdr })
        .then(function (r) { return r && r.ok ? r.json() : null; })
        .then(function (j) { cb(!!(j && j.ok && j.verified === true && j.admin === true)); })
        .catch(function () { cb(false); });
    } catch (_) { cb(false); }
  }

  /* ============================================================
     1. Bee — la MÊME marionnette que dans Lingua (beeRigHTML)
     ============================================================ */
  function buildBeeRig() {
    return (
      '<div class="bee-rig" data-mascot="bee" data-art="vive">' +
      '<div class="rig-look">' +
      '<img class="rig-base" src="' + BEE_BASE + 'base.webp" alt="Bee">' +
      '<img class="rig-piece rig-wl" src="' + BEE_BASE + 'wing-l.webp" alt="" onerror="this.remove()">' +
      '<img class="rig-piece rig-wr" src="' + BEE_BASE + 'wing-r.webp" alt="" onerror="this.remove()">' +
      '<div class="rig-lid ll"></div><div class="rig-lid lr"></div>' +
      '<div class="disc-mouth"></div>' +
      '<div class="rig-zzz">z</div>' +
      '</div></div>'
    );
  }

  /* ============================================================
     2. Styles — port fidèle du rig Lingua + habillage du widget
     ============================================================ */
  function injectStyles() {
    var css =
      /* ---- le rig Bee (copié de lingua/index.html, mêmes valeurs mesurées) ---- */
      '.bee-rig{position:relative;width:100%;height:100%;border-radius:50%;overflow:hidden;background:#fdf7e7}' +
      '.rig-look{position:absolute;inset:0;transform:translate(var(--lx,0),var(--ly,0)) rotate(var(--lr,0deg));transition:transform .28s cubic-bezier(.22,1,.36,1)}' +
      '.rig-base,.rig-piece{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}' +
      '.bee-rig.vivant .rig-base{animation:javis-respire 3.8s ease-in-out infinite;transform-origin:50% 88%}' +
      '@keyframes javis-respire{0%,100%{transform:scale(1,1)}50%{transform:scale(1.018,.986)}}' +
      '.rig-wl{transform-origin:34% 46%;animation:javis-wingL 1.15s ease-in-out infinite}' +
      '.rig-wr{transform-origin:66% 44%;animation:javis-wingR 1.15s ease-in-out infinite}' +
      '@keyframes javis-wingL{0%,100%{transform:rotate(0)}50%{transform:rotate(-6deg)}}' +
      '@keyframes javis-wingR{0%,100%{transform:rotate(0)}50%{transform:rotate(6deg)}}' +
      '.bee-rig.talk .rig-wl{animation:javis-wingL .32s ease-in-out infinite}' +
      '.bee-rig.talk .rig-wr{animation:javis-wingR .32s ease-in-out infinite}' +
      /* paupières et bouche : géométrie MESURÉE sur le dessin de Bee (v2 "vive") */
      '.bee-rig[data-mascot="bee"]{--lid:rgb(252,185,51);' +
      '--ll-l:28.1%;--ll-t:29.6%;--ll-w:15.5%;--ll-h:15.0%;' +
      '--lr-l:56.3%;--lr-t:29.7%;--lr-w:15.5%;--lr-h:15.5%;' +
      '--mo-l:51.1%;--mo-t:54.9%}' +
      '.rig-lid{position:absolute;background:var(--lid,rgb(253,225,87));border:0;border-radius:46%;opacity:0;pointer-events:none;transition:opacity .05s}' +
      '.rig-lid.ll{left:var(--ll-l);top:var(--ll-t);width:var(--ll-w);height:var(--ll-h)}' +
      '.rig-lid.lr{left:var(--lr-l);top:var(--lr-t);width:var(--lr-w);height:var(--lr-h)}' +
      '.bee-rig.blink .rig-lid{opacity:1}' +
      '.disc-mouth{position:absolute;left:var(--mo-l,52.4%);top:var(--mo-t,42.6%);width:6.6%;height:5.2%;' +
      'transform:translate(-50%,-50%) scale(1);border-radius:42% 42% 50% 50%/36% 36% 64% 64%;' +
      'background:radial-gradient(60% 55% at 50% 66%,#ff5d6c 0%,#8a3018 60%,#53200f 100%);' +
      'border:2px solid #3a1c10;opacity:0;pointer-events:none}' +
      '.disc-mouth.talking{opacity:1;animation:javis-mouth .27s ease-in-out infinite alternate}' +
      '@keyframes javis-mouth{0%{transform:translate(-50%,-50%) scale(1.02,.96)}100%{transform:translate(-50%,-50%) scale(1.38,1.52)}}' +
      /* sommeil + réactions */
      '.bee-rig.dort .rig-lid{opacity:1}' +
      '.bee-rig.dort .rig-base{animation:javis-respire 6.5s ease-in-out infinite}' +
      '.bee-rig.dort .rig-piece{animation:none!important}' +
      '.rig-zzz{position:absolute;left:64%;top:16%;font-size:15%;font-weight:900;color:#cfe0ee;opacity:0;pointer-events:none;text-shadow:0 2px 6px rgba(0,0,0,.5)}' +
      '.bee-rig.dort .rig-zzz{animation:javis-zzz 2.6s ease-out infinite}' +
      '@keyframes javis-zzz{0%{opacity:0;transform:translate(0,0) scale(.6)}25%{opacity:.95}100%{opacity:0;transform:translate(38%,-52%) scale(1.5)}}' +
      '.bee-rig.rx-poke .rig-look{animation:javis-poke .9s cubic-bezier(.34,1.56,.64,1)}' +
      '@keyframes javis-poke{0%{transform:scale(1,1)}22%{transform:scale(1.1,.88) translateY(3%)}55%{transform:scale(.94,1.09) translateY(-4%)}100%{transform:scale(1,1)}}' +
      '.bee-rig.rx-joie .rig-look{animation:javis-joie 1.5s ease-in-out}' +
      '@keyframes javis-joie{0%,100%{transform:translateY(0) rotate(0)}20%{transform:translateY(-13%) rotate(-8deg)}45%{transform:translateY(0) rotate(6deg)}70%{transform:translateY(-8%) rotate(-4deg)}}' +
      '.bee-rig.rx-reflechit .rig-look{animation:javis-pense 2s ease-in-out infinite}' +
      '@keyframes javis-pense{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}' +
      '.bee-rig.rx-coucou .rig-look{animation:javis-coucou 1.4s ease-in-out}' +
      '@keyframes javis-coucou{0%,100%{transform:rotate(0)}25%{transform:rotate(-9deg)}50%{transform:rotate(7deg)}75%{transform:rotate(-5deg)}}' +
      '@media (prefers-reduced-motion:reduce){.rig-look,.bee-rig.vivant .rig-base,.bee-rig.dort .rig-base,.rig-zzz,.rig-wl,.rig-wr,.disc-mouth.talking,.bee-rig.rx-poke .rig-look,.bee-rig.rx-joie .rig-look,.bee-rig.rx-reflechit .rig-look,.bee-rig.rx-coucou .rig-look{animation:none;transition:none}}' +
      /* ---- habillage du widget ---- */
      '#javis-launcher{position:fixed;right:16px;bottom:calc(env(safe-area-inset-bottom) + 96px);' +
      'z-index:2147483000;width:68px;height:68px;border:0;border-radius:50%;padding:0;cursor:pointer;' +
      'background:#fdf7e7;box-shadow:0 0 0 3px rgba(246,183,60,.55),0 10px 26px rgba(0,0,0,.4);' +
      'overflow:hidden;transition:transform .15s ease;-webkit-tap-highlight-color:transparent;' +
      'animation:javis-float 3.4s ease-in-out infinite}' +
      '@keyframes javis-float{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-6px) rotate(1.5deg)}}' +
      '#javis-launcher:active{transform:scale(.93)}' +
      '#javis-panel{position:fixed;z-index:2147483001;right:12px;left:12px;bottom:calc(env(safe-area-inset-bottom) + 12px);' +
      'max-width:420px;margin-left:auto;background:#171008;border:1px solid rgba(246,183,60,.3);border-radius:20px;' +
      'box-shadow:0 24px 60px rgba(0,0,0,.55);display:none;flex-direction:column;overflow:hidden;' +
      'max-height:min(72vh,620px);font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}' +
      '#javis-panel.javis-open{display:flex;animation:javis-pop .18s ease}' +
      '@keyframes javis-pop{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}' +
      '#javis-head{display:flex;align-items:center;gap:10px;padding:12px 14px;background:linear-gradient(135deg,#241905,#171008);' +
      'border-bottom:1px solid rgba(246,183,60,.2)}' +
      '#javis-head .javis-mini{width:46px;height:46px;flex:0 0 auto;border-radius:50%;overflow:hidden;box-shadow:0 0 0 2px rgba(246,183,60,.45)}' +
      '#javis-head b{color:#f6b73c;font-size:15px}' +
      '#javis-head span{display:block;color:#c9b98a;font-size:11px}' +
      '#javis-close{margin-left:auto;background:none;border:0;color:#c9b98a;font-size:20px;line-height:1;padding:6px;cursor:pointer}' +
      '#javis-msgs{flex:1;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:10px;-webkit-overflow-scrolling:touch}' +
      '.javis-bub{max-width:88%;padding:9px 12px;border-radius:14px;white-space:pre-wrap;word-break:break-word}' +
      '.javis-bub.me{align-self:flex-end;background:#3a2c16;color:#f7efd9;border-bottom-right-radius:4px}' +
      '.javis-bub.js{align-self:flex-start;background:#241905;color:#f0e2bd;border:1px solid rgba(246,183,60,.18);border-bottom-left-radius:4px}' +
      '.javis-bub.js small{display:block;margin-top:4px;color:#8a7550;font-size:10px}' +
      '#javis-form{display:flex;gap:8px;padding:10px;border-top:1px solid rgba(246,183,60,.2);background:#171008}' +
      '#javis-input{flex:1;background:#241905;border:1px solid rgba(246,183,60,.25);color:#f7efd9;border-radius:12px;' +
      'padding:10px 12px;font-size:14px;min-height:44px;resize:none;font-family:inherit}' +
      '#javis-send,#javis-mic{flex:0 0 44px;height:44px;border-radius:12px;border:0;background:linear-gradient(135deg,#f6b73c,#ffd75e);' +
      'color:#241905;font-size:18px;font-weight:700;cursor:pointer}' +
      '#javis-mic.on{background:linear-gradient(135deg,#c8506a,#e2748f)}' +
      '@media (min-width:480px){#javis-panel{right:16px}}';
    var s = document.createElement('style');
    s.id = 'javis-widget-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ============================================================
     3. Elle est vivante — port de mascotAlive() de lingua/app.js
        (respiration, clignement, regard qui suit, sommeil, toucher)
     ============================================================ */
  function mascotAlive(rig, opts) {
    if (!rig || rig._alive) return;
    rig._alive = true;
    opts = opts || {};
    var look = rig.querySelector('.rig-look') || rig;
    rig.classList.add('vivant');
    var lastTouch = Date.now(), dormi = false;

    (function blink() {
      if (!document.contains(rig)) return;
      if (!dormi) {
        rig.classList.add('blink');
        setTimeout(function () { try { rig.classList.remove('blink'); } catch (_) {} }, 150);
      }
      setTimeout(blink, dormi ? 9000 : (2400 + Math.random() * 3400));
    })();

    function suivre(cx, cy) {
      if (dormi) return;
      var r = rig.getBoundingClientRect();
      if (!r.width) return;
      var dx = Math.max(-1, Math.min(1, (cx - (r.left + r.width / 2)) / (r.width * 0.9)));
      var dy = Math.max(-1, Math.min(1, (cy - (r.top + r.height / 2)) / (r.height * 0.9)));
      look.style.setProperty('--lx', (dx * 3.2).toFixed(2) + '%');
      look.style.setProperty('--ly', (dy * 2.2).toFixed(2) + '%');
      look.style.setProperty('--lr', (dx * 4.5).toFixed(2) + 'deg');
    }
    function onMove(e) { var p = (e.touches && e.touches[0]) || e; if (p) suivre(p.clientX, p.clientY); reveille(); }
    document.addEventListener('pointermove', onMove, { passive: true });

    function reveille() {
      lastTouch = Date.now();
      if (dormi) { dormi = false; rig.classList.remove('dort'); react(rig, 'coucou', 1500); }
    }
    (function veille() {
      if (!document.contains(rig)) { document.removeEventListener('pointermove', onMove); return; }
      if (!dormi && Date.now() - lastTouch > (opts.sommeil || 120000)) {
        dormi = true;
        rig.classList.add('dort');
        look.style.removeProperty('--lx'); look.style.removeProperty('--ly'); look.style.removeProperty('--lr');
      }
      setTimeout(veille, 4000);
    })();

    rig.addEventListener('pointerdown', function () {
      var etaitEndormie = dormi;
      reveille();
      if (!etaitEndormie) react(rig, 'poke', 900);
      try { if (navigator.vibrate) navigator.vibrate(10); } catch (_) {}
    }, { passive: true });
  }

  function react(rig, kind, dur) {
    if (!rig) return;
    ['rx-poke', 'rx-joie', 'rx-reflechit', 'rx-coucou'].forEach(function (c) { rig.classList.remove(c); });
    if (!kind) return;
    rig.classList.add('rx-' + kind);
    setTimeout(function () { try { rig.classList.remove('rx-' + kind); } catch (_) {} }, dur || 1500);
  }

  function allRigs(root) { return Array.prototype.slice.call(root.querySelectorAll('.bee-rig')); }
  function startTalking(root) {
    allRigs(root).forEach(function (r) {
      r.classList.add('talk');
      var m = r.querySelector('.disc-mouth'); if (m) m.classList.add('talking');
    });
  }
  function stopTalking(root) {
    allRigs(root).forEach(function (r) {
      r.classList.remove('talk');
      var m = r.querySelector('.disc-mouth'); if (m) m.classList.remove('talking');
    });
  }
  function setThinking(root, on) {
    allRigs(root).forEach(function (r) { r.classList[on ? 'add' : 'remove']('rx-reflechit'); });
  }

  /* ============================================================
     4. Voix (Web Speech API — gratuite, native) + intentions locales
     ============================================================ */
  function speak(root, text) {
    var on = true;
    try { on = localStorage.getItem(STORAGE_VOICE) !== '0'; } catch (_) {}
    if (!on || !('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text.slice(0, 600));
      u.lang = 'fr-FR';
      u.rate = 1.02;
      u.pitch = 1.35; /* Bee a une voix claire et enjouée (comme dans Lingua) */
      u.onstart = function () { startTalking(root); };
      u.onend = function () { stopTalking(root); };
      u.onerror = function () { stopTalking(root); };
      window.speechSynthesis.speak(u);
    } catch (_) { stopTalking(root); }
  }

  var DOMAIN_APPS = {
    'arbre|généalog|famille|arrière.grand.père|arrière grand père': 'https://arbre.kd-mc.com',
    'lingua|langue|apprendre.*(langue|anglais|italien)|monégasque': 'https://lingua.kd-mc.com',
    'apex|assistant ia avancé': 'https://apex.kd-mc.com',
    'planning|cmcteams|équipe|départ': 'https://cmcteams.kd-mc.com',
  };

  function tryLocalIntent(text, respond) {
    var t = text.toLowerCase();
    for (var pattern in DOMAIN_APPS) {
      if (new RegExp(pattern, 'i').test(t) && /ouvre|va sur|montre|affiche|lance/.test(t)) {
        var url = DOMAIN_APPS[pattern];
        respond('J\'ouvre ça pour toi 👉 ' + url);
        setTimeout(function () { window.open(url, '_blank', 'noopener'); }, 300);
        return true;
      }
    }
    if (/m[eé]t[eé]o|temps.*(fera|fait)|pleuvoir|prévisions?/.test(t)) {
      var give = function (lat, lon, place) {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
              '&current=temperature_2m,weather_code&timezone=auto')
          .then(function (r) { return r.json(); })
          .then(function (j) {
            var c = j && j.current;
            var temp = c ? Math.round(c.temperature_2m) : null;
            respond(temp !== null
              ? ('Il fait ' + temp + '°C' + (place ? ' à ' + place : '') + ' en ce moment.')
              : 'Je n\'ai pas réussi à lire la météo, réessaie.');
          })
          .catch(function () { respond('Météo indisponible là, réessaie.'); });
      };
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function (pos) { give(pos.coords.latitude, pos.coords.longitude, ''); },
          function () { give(43.7325, 7.4197, 'Monaco'); },
          { timeout: 4000 }
        );
      } else { give(43.7325, 7.4197, 'Monaco'); }
      return true;
    }
    if (/envoie.*message|écris.*à|planning.*modifi|change.*planning/.test(t)) {
      try { localStorage.setItem('apex_v13_chat_prefill', text); } catch (_) {}
      respond('Ça, je te l\'ouvre dans Apex (lui a accès à ton compte et peut vraiment agir) — ta question est déjà écrite, tu n\'as qu\'à valider.');
      setTimeout(function () { window.open('https://apex.kd-mc.com/#chat', '_blank', 'noopener'); }, 500);
      return true;
    }
    return false;
  }

  /* ============================================================
     5. Chat — apis.kd-mc.com/ai (Qwen gratuit d'abord, déjà en prod)
     ============================================================ */
  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(STORAGE_HIST) || '[]'); } catch (_) { return []; }
  }
  function saveHistory(h) {
    try { localStorage.setItem(STORAGE_HIST, JSON.stringify(h.slice(-MAX_HISTORY))); } catch (_) {}
  }
  function addBubble(root, role, text, meta) {
    var list = root.querySelector('#javis-msgs');
    var b = document.createElement('div');
    b.className = 'javis-bub ' + (role === 'user' ? 'me' : 'js');
    b.textContent = text;
    if (meta) { var small = document.createElement('small'); small.textContent = meta; b.appendChild(small); }
    list.appendChild(b);
    list.scrollTop = list.scrollHeight;
  }

  function askJavis(root, text) {
    addBubble(root, 'user', text);
    var hist = loadHistory();
    hist.push({ role: 'user', content: text });
    saveHistory(hist);

    var handled = tryLocalIntent(text, function (reply) {
      addBubble(root, 'javis', reply);
      var h = loadHistory(); h.push({ role: 'assistant', content: reply }); saveHistory(h);
      speak(root, reply);
    });
    if (handled) return;

    setThinking(root, true);
    var messages = hist.slice(-10).map(function (m) { return { role: m.role, content: m.content }; });
    fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages,
        system: 'Tu es Bee, l\'assistante personnelle de Kevin sur son domaine kd-mc.com (le même personnage que dans son app Lingua). ' +
          'Réponds court, chaleureuse, enjouée, tutoiement, en français. Si la demande exige une action réelle ' +
          '(envoyer un message, modifier des données), dis-le clairement plutôt que de prétendre l\'avoir faite.',
        max_tokens: 500,
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        setThinking(root, false);
        var out = (j && j.ok && j.text) ? j.text : 'Je n\'ai pas réussi à répondre là, réessaie dans un instant.';
        var meta = (j && j.ok) ? (j.provider + (j.provider === 'qwen' ? ' (gratuit)' : '')) : null;
        addBubble(root, 'javis', out, meta);
        if (j && j.ok) { allRigs(root).forEach(function (r) { react(r, 'joie', 1200); }); }
        var h = loadHistory(); h.push({ role: 'assistant', content: out }); saveHistory(h);
        speak(root, out);
      })
      .catch(function () {
        setThinking(root, false);
        addBubble(root, 'javis', 'Le réseau ne répond pas là, réessaie dans un instant.');
      });
  }

  /* ============================================================
     6. Montage
     ============================================================ */
  function mount() {
    injectStyles();
    var wrap = document.createElement('div');
    wrap.id = 'javis-root';
    wrap.innerHTML =
      '<button id="javis-launcher" type="button" aria-label="Parler à Bee">' + buildBeeRig() + '</button>' +
      '<div id="javis-panel" role="dialog" aria-label="Bee">' +
      '<div id="javis-head"><div class="javis-mini">' + buildBeeRig() + '</div>' +
      '<div><b>Bee</b><span>Ton assistante · gratuit d\'abord</span></div>' +
      '<button id="javis-close" type="button" aria-label="Fermer">✕</button></div>' +
      '<div id="javis-msgs"></div>' +
      '<form id="javis-form"><textarea id="javis-input" placeholder="Demande-moi n\'importe quoi…" rows="1"></textarea>' +
      '<button id="javis-mic" type="button" aria-label="Dicter">🎙</button>' +
      '<button id="javis-send" type="submit" aria-label="Envoyer">➤</button></form>' +
      '</div>';
    document.body.appendChild(wrap);

    allRigs(wrap).forEach(function (r) { mascotAlive(r, { sommeil: 120000 }); });

    var panel = wrap.querySelector('#javis-panel');
    var form = wrap.querySelector('#javis-form');
    var input = wrap.querySelector('#javis-input');
    var mic = wrap.querySelector('#javis-mic');

    var hist = loadHistory();
    if (!hist.length) {
      addBubble(wrap, 'javis', 'Coucou Kevin 🐝 C\'est moi, Bee ! Demande-moi n\'importe quoi — je réponds gratuit d\'abord, et je peux t\'ouvrir tes applis.');
    } else {
      hist.forEach(function (m) { addBubble(wrap, m.role === 'user' ? 'user' : 'javis', m.content); });
    }

    wrap.querySelector('#javis-launcher').addEventListener('click', function () {
      panel.classList.toggle('javis-open');
      if (panel.classList.contains('javis-open')) setTimeout(function () { input.focus(); }, 150);
    });
    wrap.querySelector('#javis-close').addEventListener('click', function () {
      panel.classList.remove('javis-open');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (input.value || '').trim();
      if (!v) return;
      input.value = '';
      askJavis(wrap, v);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
    });

    var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (Recognition) {
      var rec = new Recognition();
      rec.lang = 'fr-FR';
      rec.interimResults = false;
      mic.addEventListener('click', function () {
        if (mic.classList.contains('on')) { try { rec.stop(); } catch (_) {} return; }
        try { rec.start(); mic.classList.add('on'); } catch (_) {}
      });
      rec.onresult = function (e) {
        var t = e.results && e.results[0] && e.results[0][0] && e.results[0][0].transcript;
        if (t) { input.value = t; form.requestSubmit(); }
      };
      rec.onend = function () { mic.classList.remove('on'); };
      rec.onerror = function () { mic.classList.remove('on'); };
    } else { mic.style.display = 'none'; }
  }

  /* ============================================================
     7. Go — visibilité fail-closed (admin only), réseau fail-open
     ============================================================ */
  function boot() {
    checkAdmin(function (isAdmin) {
      if (!isAdmin) return; /* pas Kevin (ou SSO injoignable) → rien affiché, page intacte */
      mount();
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
