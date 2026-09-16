/* javis-widget.js — Le personnage "Javis" flottant, pour TOUT le domaine kd-mc.com.
 * ==========================================================================
 * Kevin (2026-09-16) : « Un bouton flottant avec une image du personnage, que je
 * puisse cliquer dessus quand j'ouvre le domaine — seulement moi. Il connaît tout,
 * tourne sur Apex en gratuit d'abord. Je lui demande n'importe quoi, il peut ouvrir
 * des liens, m'aider. Une vraie interaction : mouvements, mimiques, bouche, yeux. »
 *
 * ── Ce que c'est ────────────────────────────────────────────────────────────
 * Un <script> unique, à coller sur n'importe quelle page *.kd-mc.com. Il :
 *  1. Vérifie via /__sso/whoami (même pattern que tools/departs/index.html
 *     `_depSsoAutoAdmin`, éprouvé) que c'est bien KEVIN, admin, Face ID prouvé.
 *     Si non → ne s'affiche PAS DU TOUT (fail-closed sur la VISIBILITÉ — l'appel
 *     réseau lui-même reste fail-open pour ne jamais bloquer la page).
 *  2. Affiche un personnage rond animé (respire, cligne des yeux, bouche qui
 *     parle) — voir buildJavisSVG(). Dessin ORIGINAL aux couleurs or/sombre du
 *     domaine : Kevin a demandé de s'inspirer de Duo (Duolingo) — s'en inspirer
 *     dans l'esprit (rond, grands yeux expressifs) est repris ; RECOPIER À
 *     L'IDENTIQUE le personnage précis de Duolingo ne l'est pas (marque déposée
 *     d'un tiers) — voir la note dans le message livré à Kevin.
 *  3. Au clic → panneau de chat. Chaque question part vers `apis.kd-mc.com/ai`
 *     (services/kdmc-apis/worker.js, DÉJÀ EN PROD, DÉJÀ gratuit-d'abord Qwen,
 *     bascule Anthropic pour code/raisonnement/action — cf. services/_shared/
 *     ia-route.js). Zéro logique dupliquée, zéro nouveau backend (leçon #142).
 *  4. Javis PARLE sa réponse (Web Speech API, native, gratuite) et sa bouche
 *     s'anime en rythme (boundary events de l'utterance) — pas un vrai lip-sync
 *     phonétique (ça demanderait un moteur payant type D-ID/HeyGen), mais un
 *     vrai mouvement synchronisé à la voix, 0 €, 0 dépendance.
 *  5. Intentions locales (naviguer vers une app du domaine, météo) exécutées
 *     directement dans le navigateur — rien à attendre du serveur pour ça.
 *     Pour une ACTION qui touche tes données (envoyer un message, modifier un
 *     planning) → Javis ouvre Apex avec ta question déjà écrite dans le chat
 *     (`apex_v13_chat_prefill`, pattern déjà utilisé par /commands) : Apex a la
 *     session authentifiée + le vrai registre d'outils, le widget public non.
 *
 * ── Comment l'ajouter à une page ────────────────────────────────────────────
 *   <script src="https://VOTRE-HÉBERGEMENT/javis-widget.js" defer></script>
 * (ou en local : copier le fichier à côté de index.html et l'inclure en relatif)
 *
 * Zéro dépendance, zéro build. Fail-open partout où un fail-open est sûr
 * (réseau, TTS, animation) ; fail-CLOSED uniquement sur la VISIBILITÉ (jamais
 * montré à quelqu'un qui n'est pas Kevin).
 */
(function () {
  'use strict';
  if (window.__javisWidgetLoaded) return;
  window.__javisWidgetLoaded = true;

  var AI_ENDPOINT = 'https://apis.kd-mc.com/ai';
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
        .then(function (j) { cb(!!(j && j.ok && j.verified === true && j.admin === true), j); })
        .catch(function () { cb(false, null); });
    } catch (_) { cb(false, null); }
  }

  /* ============================================================
     1. Le personnage — PERSONNAGE HUMAIN, esprit "Bea" (Duolingo) :
        cheveux orange au carré, taches de rousseur, grands yeux expressifs.
        Dessin ORIGINAL : Kevin a demandé l'apparence de Bea — l'esprit est
        repris (coupe, rousseur, rondeur, style plat et chaleureux), le dessin
        précis de Duolingo ne l'est pas (marque déposée d'un tiers, et ce dépôt
        est PUBLIC). Toutes les pièces animées gardent leur id (pupilles,
        paupières, sourcils, bouche) : l'animation ne dépend pas du style.
     ============================================================ */
  function buildJavisSVG() {
    return (
      '<svg id="javis-face" viewBox="0 0 200 200" aria-hidden="true">' +
      '<defs>' +
      '<linearGradient id="javis-hair" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#f4873f"/><stop offset="100%" stop-color="#d2551d"/>' +
      '</linearGradient>' +
      '<linearGradient id="javis-skin" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#fcdcb8"/><stop offset="100%" stop-color="#f2bd90"/>' +
      '</linearGradient>' +
      '</defs>' +
      '<g id="javis-body-wrap">' +
      /* épaules + haut */
      '<path d="M34 200 Q38 160 74 150 L126 150 Q162 160 166 200 Z" fill="#6f5fd0"/>' +
      /* cou */
      '<path d="M86 136 L114 136 L114 152 Q100 164 86 152 Z" fill="#eab183"/>' +
      /* cheveux (carré, derrière) */
      '<path d="M44 100 Q40 32 100 30 Q160 32 156 100 L156 130 Q150 116 146 110 L54 110 Q50 116 44 130 Z" fill="url(#javis-hair)"/>' +
      /* visage */
      '<ellipse cx="100" cy="96" rx="47" ry="51" fill="url(#javis-skin)"/>' +
      /* oreilles */
      '<ellipse cx="53" cy="99" rx="7" ry="10" fill="#f2bd90"/>' +
      '<ellipse cx="147" cy="99" rx="7" ry="10" fill="#f2bd90"/>' +
      /* frange */
      '<path d="M53 76 Q58 38 100 36 Q142 38 147 76 Q136 56 114 52 Q104 64 88 60 Q68 60 53 76 Z" fill="url(#javis-hair)"/>' +
      /* joues */
      '<ellipse cx="67" cy="110" rx="12" ry="7" fill="#ef8f74" opacity=".4"/>' +
      '<ellipse cx="133" cy="110" rx="12" ry="7" fill="#ef8f74" opacity=".4"/>' +
      /* taches de rousseur */
      '<g fill="#cf8055" opacity=".6">' +
      '<circle cx="63" cy="104" r="1.7"/><circle cx="71" cy="110" r="1.7"/><circle cx="61" cy="113" r="1.5"/>' +
      '<circle cx="137" cy="104" r="1.7"/><circle cx="129" cy="110" r="1.7"/><circle cx="139" cy="113" r="1.5"/>' +
      '</g>' +
      /* oeil gauche */
      '<g id="javis-eye-l" transform="translate(80,92)">' +
      '<ellipse rx="13" ry="15" fill="#fff"/>' +
      '<circle id="javis-pupil-l" r="7" fill="#3b2415" cx="0" cy="1"/>' +
      '<circle r="2.6" fill="#fff" cx="-2.6" cy="-2.6"/>' +
      '<rect id="javis-lid-l" x="-14" y="-16" width="28" height="18" fill="#f2bd90" transform="scaleY(0)" style="transform-origin:0 -16px"/>' +
      '</g>' +
      /* oeil droit */
      '<g id="javis-eye-r" transform="translate(120,92)">' +
      '<ellipse rx="13" ry="15" fill="#fff"/>' +
      '<circle id="javis-pupil-r" r="7" fill="#3b2415" cx="0" cy="1"/>' +
      '<circle r="2.6" fill="#fff" cx="-2.6" cy="-2.6"/>' +
      '<rect id="javis-lid-r" x="-14" y="-16" width="28" height="18" fill="#f2bd90" transform="scaleY(0)" style="transform-origin:0 -16px"/>' +
      '</g>' +
      /* sourcils (expressivité) */
      '<path id="javis-brow-l" d="M68 70 Q80 63 92 69" stroke="#b9491a" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path id="javis-brow-r" d="M108 69 Q120 63 132 70" stroke="#b9491a" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      /* nez */
      '<path d="M100 102 Q104 111 99 113" stroke="#d9996d" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      /* bouche : path remplacé selon l'état (idle / open / talk) */
      '<path id="javis-mouth" d="M86 126 Q100 136 114 126" stroke="#a63f2d" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '</g>' +
      '</svg>'
    );
  }

  /* ============================================================
     2. Injection DOM + styles (isolés, préfixe javis- partout)
     ============================================================ */
  function injectStyles() {
    var css =
      '#javis-launcher{position:fixed;right:16px;bottom:calc(env(safe-area-inset-bottom) + 96px);' +
      'z-index:2147483000;width:64px;height:64px;border:0;border-radius:50%;padding:0;cursor:pointer;' +
      'background:transparent;box-shadow:0 10px 28px rgba(232,184,48,.45);' +
      'transition:transform .15s ease;-webkit-tap-highlight-color:transparent}' +
      '#javis-launcher:active{transform:scale(.92)}' +
      '#javis-launcher svg{width:100%;height:100%;display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,.25))}' +
      '#javis-launcher.javis-breathe{animation:javis-breathe 3.2s ease-in-out infinite}' +
      '@keyframes javis-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}' +
      '#javis-pupil-l,#javis-pupil-r{transition:transform .35s ease}' +
      '#javis-lid-l,#javis-lid-r{transition:transform .09s ease}' +
      '.javis-blink #javis-lid-l,.javis-blink #javis-lid-r{transform:scaleY(1)!important}' +
      '#javis-mouth{transition:d .09s linear}' +
      '#javis-panel{position:fixed;z-index:2147483001;right:12px;left:12px;bottom:calc(env(safe-area-inset-bottom) + 12px);' +
      'max-width:420px;margin-left:auto;background:#171008;border:1px solid rgba(232,184,48,.3);border-radius:20px;' +
      'box-shadow:0 24px 60px rgba(0,0,0,.55);display:none;flex-direction:column;overflow:hidden;' +
      'max-height:min(72vh,620px);font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}' +
      '#javis-panel.javis-open{display:flex;animation:javis-pop .18s ease}' +
      '@keyframes javis-pop{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}' +
      '#javis-head{display:flex;align-items:center;gap:10px;padding:12px 14px;background:linear-gradient(135deg,#241905,#171008);' +
      'border-bottom:1px solid rgba(232,184,48,.2)}' +
      '#javis-head svg{width:40px;height:40px;flex:0 0 auto}' +
      '#javis-head b{color:#f5cc4a;font-size:15px}' +
      '#javis-head span{display:block;color:#c9b98a;font-size:11px}' +
      '#javis-close{margin-left:auto;background:none;border:0;color:#c9b98a;font-size:20px;line-height:1;padding:6px;cursor:pointer}' +
      '#javis-msgs{flex:1;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:10px;-webkit-overflow-scrolling:touch}' +
      '.javis-bub{max-width:88%;padding:9px 12px;border-radius:14px;white-space:pre-wrap;word-break:break-word}' +
      '.javis-bub.me{align-self:flex-end;background:#3a2c16;color:#f7efd9;border-bottom-right-radius:4px}' +
      '.javis-bub.js{align-self:flex-start;background:#241905;color:#f0e2bd;border:1px solid rgba(232,184,48,.18);border-bottom-left-radius:4px}' +
      '.javis-bub.js small{display:block;margin-top:4px;color:#8a7550;font-size:10px}' +
      '#javis-form{display:flex;gap:8px;padding:10px;border-top:1px solid rgba(232,184,48,.2);background:#171008}' +
      '#javis-input{flex:1;background:#241905;border:1px solid rgba(232,184,48,.25);color:#f7efd9;border-radius:12px;' +
      'padding:10px 12px;font-size:14px;min-height:44px;resize:none}' +
      '#javis-send,#javis-mic{flex:0 0 44px;height:44px;border-radius:12px;border:0;background:linear-gradient(135deg,#e8b830,#f5cc4a);' +
      'color:#241905;font-size:18px;font-weight:700;cursor:pointer}' +
      '#javis-mic.on{background:linear-gradient(135deg,#c8506a,#e2748f)}' +
      '@media (min-width:480px){#javis-panel{right:16px}}';
    var s = document.createElement('style');
    s.id = 'javis-widget-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ============================================================
     3. Animation : respiration, clignement, regard, bouche qui parle
     ============================================================ */
  /* Géométrie calée sur le visage humain (bouche centrée x≈100, y≈126). */
  var mouthShapes = {
    idle: 'M86 126 Q100 136 114 126',
    smallOpen: 'M88 125 Q100 137 112 125 Q100 131 88 125',
    open: 'M85 124 Q100 146 115 124 Q100 133 85 124',
    talkA: 'M88 126 Q100 133 112 126 Q100 130 88 126',
    talkB: 'M86 124 Q100 142 114 124 Q100 132 86 124',
  };

  function startIdleAnimations(root) {
    var launcher = root.querySelector('#javis-launcher');
    if (launcher) launcher.classList.add('javis-breathe');
    /* clignement aléatoire 2.5-6s */
    (function blinkLoop() {
      var delay = 2500 + Math.random() * 3500;
      setTimeout(function () {
        root.classList.add('javis-blink');
        setTimeout(function () { root.classList.remove('javis-blink'); }, 140);
        blinkLoop();
      }, delay);
    })();
    /* regard qui dérive doucement (vivant même sans interaction) */
    (function lookLoop() {
      var delay = 1800 + Math.random() * 2600;
      setTimeout(function () {
        var dx = (Math.random() * 6 - 3).toFixed(1);
        var dy = (Math.random() * 4 - 1).toFixed(1);
        ['javis-pupil-l', 'javis-pupil-r'].forEach(function (id) {
          var el = root.querySelector('#' + id);
          if (el) el.setAttribute('transform', 'translate(' + dx + ',' + dy + ')');
        });
        lookLoop();
      }, delay);
    })();
  }

  var mouthTimer = null;
  function setMouth(root, key) {
    var m = root.querySelector('#javis-mouth');
    if (m && mouthShapes[key]) m.setAttribute('d', mouthShapes[key]);
  }
  function startTalking(root) {
    stopTalking(root);
    var toggle = false;
    mouthTimer = setInterval(function () {
      toggle = !toggle;
      setMouth(root, toggle ? 'talkA' : 'talkB');
    }, 110);
  }
  function stopTalking(root) {
    if (mouthTimer) { clearInterval(mouthTimer); mouthTimer = null; }
    setMouth(root, 'idle');
  }
  function setThinking(root, on) {
    var launcher = root.querySelector('#javis-launcher');
    if (!launcher) return;
    if (on) { launcher.style.animationDuration = '.9s'; setMouth(root, 'smallOpen'); }
    else { launcher.style.animationDuration = ''; setMouth(root, 'idle'); }
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
      u.onstart = function () { startTalking(root); };
      u.onend = function () { stopTalking(root); };
      u.onerror = function () { stopTalking(root); };
      window.speechSynthesis.speak(u);
    } catch (_) { /* TTS indisponible : pas grave, le texte reste affiché */ }
  }

  /* Intentions exécutables SANS appel réseau IA — ouvrir une app du domaine,
   * la météo (open-meteo, gratuit, 0 clé). Miroir léger du pattern
   * AX_EXEC_INTENTS déjà documenté dans CLAUDE.md pour Apex. */
  var DOMAIN_APPS = {
    'arbre|généalog|famille|arrière.grand.père|arrière grand père': 'https://arbre.kd-mc.com',
    'apex|assistant ia|javis avancé': 'https://apex.kd-mc.com',
    'planning|cmcteams|équipe|départ': 'https://cmcteams.kd-mc.com',
  };

  function tryLocalIntent(text, respond) {
    var t = text.toLowerCase();
    /* Ouvrir une app du domaine */
    for (var pattern in DOMAIN_APPS) {
      if (new RegExp(pattern, 'i').test(t) && /ouvre|va sur|montre|affiche|lance/.test(t)) {
        var url = DOMAIN_APPS[pattern];
        respond('J\'ouvre ça pour toi 👉 ' + url, { local: true });
        setTimeout(function () { window.open(url, '_blank', 'noopener'); }, 300);
        return true;
      }
    }
    /* Météo (open-meteo, gratuit, sans clé — géoloc navigateur ou Monaco par défaut) */
    if (/m[eé]t[eé]o|temps.*(fera|fait)|pleuvoir|prévisions?/.test(t)) {
      var giveWeather = function (lat, lon, place) {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
              '&current=temperature_2m,weather_code&timezone=auto')
          .then(function (r) { return r.json(); })
          .then(function (j) {
            var c = j && j.current;
            var temp = c ? Math.round(c.temperature_2m) : null;
            respond(temp !== null
              ? ('Il fait ' + temp + '°C' + (place ? ' à ' + place : '') + ' en ce moment.')
              : 'Je n\'ai pas réussi à lire la météo, réessaie dans un instant.', { local: true });
          })
          .catch(function () { respond('Météo indisponible là, réessaie.', { local: true }); });
      };
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function (pos) { giveWeather(pos.coords.latitude, pos.coords.longitude, ''); },
          function () { giveWeather(43.7325, 7.4197, 'Monaco'); }, /* défaut : Monaco */
          { timeout: 4000 }
        );
      } else {
        giveWeather(43.7325, 7.4197, 'Monaco');
      }
      return true;
    }
    /* Actions sur tes données (message, planning...) → délègue à Apex authentifié,
     * jamais exécuté par ce widget public (leçon sécurité : pas de credentials
     * d'écriture côté client d'un script embarqué sur des pages publiques). */
    if (/envoie.*message|écris.*à|planning.*modifi|change.*planning/.test(t)) {
      try {
        localStorage.setItem('apex_v13_chat_prefill', text);
      } catch (_) {}
      respond('Ça, je te l\'ouvre dans Apex (lui a accès à ton compte et peut vraiment agir) — ta question est déjà écrite, tu n\'as qu\'à valider.', { local: true });
      setTimeout(function () { window.open('https://apex.kd-mc.com/#chat', '_blank', 'noopener'); }, 500);
      return true;
    }
    return false;
  }

  /* ============================================================
     5. Chat — appelle apis.kd-mc.com/ai (Qwen gratuit d'abord, déjà en prod)
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
    if (meta) {
      var small = document.createElement('small');
      small.textContent = meta;
      b.appendChild(small);
    }
    list.appendChild(b);
    list.scrollTop = list.scrollHeight;
  }

  function askJavis(root, text) {
    addBubble(root, 'user', text);
    var hist = loadHistory();
    hist.push({ role: 'user', content: text });
    saveHistory(hist);

    var handled = tryLocalIntent(text, function (reply, opts) {
      addBubble(root, 'javis', reply);
      hist = loadHistory();
      hist.push({ role: 'assistant', content: reply });
      saveHistory(hist);
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
        system: 'Tu es Javis, l\'assistant personnel de Kevin sur son domaine kd-mc.com. ' +
          'Réponds court, chaleureux, tutoiement, en français. Si la demande exige une action réelle ' +
          '(envoyer un message, modifier des données), dis-le clairement plutôt que de prétendre l\'avoir fait.',
        max_tokens: 500,
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        setThinking(root, false);
        var text2 = (j && j.ok && j.text) ? j.text : 'Je n\'ai pas réussi à répondre là, réessaie dans un instant.';
        var meta = (j && j.ok) ? (j.provider + (j.provider === 'qwen' ? ' (gratuit)' : '')) : null;
        addBubble(root, 'javis', text2, meta);
        hist = loadHistory();
        hist.push({ role: 'assistant', content: text2 });
        saveHistory(hist);
        speak(root, text2);
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
      '<button id="javis-launcher" type="button" aria-label="Parler à Javis">' + buildJavisSVG() + '</button>' +
      '<div id="javis-panel" role="dialog" aria-label="Javis">' +
      '<div id="javis-head">' + buildJavisSVG() + '<div><b>Javis</b><span>Ton assistant · gratuit d\'abord</span></div>' +
      '<button id="javis-close" type="button" aria-label="Fermer">✕</button></div>' +
      '<div id="javis-msgs"></div>' +
      '<form id="javis-form"><textarea id="javis-input" placeholder="Demande-moi n\'importe quoi…" rows="1"></textarea>' +
      '<button id="javis-mic" type="button" aria-label="Dicter">🎙</button>' +
      '<button id="javis-send" type="submit" aria-label="Envoyer">➤</button></form>' +
      '</div>';
    document.body.appendChild(wrap);

    startIdleAnimations(wrap);

    var launcher = wrap.querySelector('#javis-launcher');
    var panel = wrap.querySelector('#javis-panel');
    var msgs = wrap.querySelector('#javis-msgs');
    var form = wrap.querySelector('#javis-form');
    var input = wrap.querySelector('#javis-input');
    var mic = wrap.querySelector('#javis-mic');

    var hist = loadHistory();
    if (!hist.length) {
      addBubble(wrap, 'javis', 'Salut Kevin 👋 Je suis Javis. Demande-moi n\'importe quoi — je réponds gratuit d\'abord, et je peux t\'ouvrir tes applis.');
    } else {
      hist.forEach(function (m) { addBubble(wrap, m.role === 'user' ? 'user' : 'javis', m.content); });
    }

    launcher.addEventListener('click', function () {
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

    /* Dictée (Web Speech API reconnaissance — gratuite, native, tolère absence) */
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
    } else {
      mic.style.display = 'none';
    }
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
