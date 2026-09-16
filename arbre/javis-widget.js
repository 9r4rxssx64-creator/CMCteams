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
      /* mouvements du corps entier (portés de Lingua : danse, saut, vol, marche) */
      '.bee-rig.mv-dance{animation:javis-dance 1.05s ease-in-out infinite}' +
      '.bee-rig.mv-jump{animation:javis-jump .85s cubic-bezier(.36,.07,.19,.97) infinite}' +
      '.bee-rig.mv-fly{animation:javis-fly 3.6s ease-in-out infinite}' +
      '.bee-rig.mv-walk{animation:javis-walk .8s ease-in-out infinite}' +
      '.bee-rig.mv-dance .rig-wl,.bee-rig.mv-fly .rig-wl{animation:javis-wingL .3s ease-in-out infinite}' +
      '.bee-rig.mv-dance .rig-wr,.bee-rig.mv-fly .rig-wr{animation:javis-wingR .3s ease-in-out infinite}' +
      '@keyframes javis-dance{0%,100%{transform:rotate(0) translate(0,0)}20%{transform:rotate(-7deg) translate(-4%,-3%)}40%{transform:rotate(6deg) translate(4%,0)}60%{transform:rotate(-6deg) translate(-3%,-4%)}80%{transform:rotate(7deg) translate(3%,0)}}' +
      '@keyframes javis-jump{0%,100%{transform:translateY(0) scale(1,1)}18%{transform:translateY(2%) scale(1.05,.9)}45%{transform:translateY(-16%) scale(.97,1.06)}70%{transform:translateY(0) scale(1.04,.94)}85%{transform:translateY(-1%) scale(1,1)}}' +
      '@keyframes javis-fly{0%,100%{transform:translate(0,0) rotate(0)}12%{transform:translate(7%,-9%) rotate(5deg)}30%{transform:translate(13%,2%) rotate(-3deg)}50%{transform:translate(0,6%) rotate(0)}70%{transform:translate(-13%,-4%) rotate(4deg)}88%{transform:translate(-6%,-10%) rotate(-4deg)}}' +
      '@keyframes javis-walk{0%,100%{transform:translateY(0) rotate(-2.5deg)}25%{transform:translateY(-3%) rotate(0)}50%{transform:translateY(0) rotate(2.5deg)}75%{transform:translateY(-3%) rotate(0)}}' +
      /* tristesse (réseau en panne) — portée de Lingua */
      '.bee-rig.rx-triste .rig-look{animation:javis-triste 1.6s ease-in-out}' +
      '@keyframes javis-triste{0%,100%{transform:rotate(0) translateY(0);filter:none}35%,70%{transform:rotate(-7deg) translateY(4%);filter:saturate(.7) brightness(.94)}}' +
      /* étincelles + bulle (portées de Lingua) */
      '.javis-spark{position:fixed;z-index:2147483002;pointer-events:none;font-size:16px;animation:javis-sparkFly .9s ease-out forwards}' +
      '@keyframes javis-sparkFly{0%{transform:translate(0,0) scale(.6);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(1.25);opacity:0}}' +
      '.javis-bubble{position:fixed;right:14px;bottom:calc(env(safe-area-inset-bottom) + 172px);z-index:2147483002;max-width:240px;' +
      'background:#241905;border:1px solid rgba(246,183,60,.6);border-radius:16px 16px 4px 16px;padding:10px 13px;' +
      'font:13.5px/1.45 -apple-system,BlinkMacSystemFont,sans-serif;color:#f0e2bd;box-shadow:0 6px 18px rgba(0,0,0,.45);cursor:pointer;' +
      'animation:javis-bubblePop .35s cubic-bezier(.34,1.56,.64,1)}' +
      '@keyframes javis-bubblePop{0%{transform:scale(.5) translateY(10px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1}}' +
      '.javis-bubble.bye{opacity:0;transform:translateY(8px);transition:all .4s}' +
      /* « elle écrit… » pendant qu'elle réfléchit */
      '.javis-typing{display:flex;gap:4px;align-self:flex-start;padding:10px 14px;background:#241905;border:1px solid rgba(246,183,60,.18);border-radius:14px;border-bottom-left-radius:4px}' +
      '.javis-typing i{width:7px;height:7px;border-radius:50%;background:#f6b73c;opacity:.4;animation:javis-dot 1.1s ease-in-out infinite}' +
      '.javis-typing i:nth-child(2){animation-delay:.18s}.javis-typing i:nth-child(3){animation-delay:.36s}' +
      '@keyframes javis-dot{0%,100%{opacity:.35;transform:translateY(0)}50%{opacity:1;transform:translateY(-3px)}}' +
      '@media (prefers-reduced-motion:reduce){.javis-spark{display:none}.javis-bubble,.javis-typing i{animation:none}}' +
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

    /* Tu la touches : la réaction DÉPEND de l'endroit (porté de Lingua) —
       la tête = contente, le ventre = elle rit et danse, les ailes = elle s'envole. */
    rig.style.cursor = 'pointer';
    rig.addEventListener('pointerdown', function (ev) {
      var etaitEndormie = dormi;
      reveille();
      var zone = rigZone(rig, ev);
      vibrate(zone === 'ventre' ? 18 : 10);
      if (etaitEndormie) { bubble(pick(RX_LINES.reveil)); return; }
      if (zone === 'aile') { move(rig, 'fly', 2200); }
      else { react(rig, 'poke', 900); move(rig, zone === 'ventre' ? 'dance' : 'jump', 1600); }
      sparkles(rig, zone === 'ventre' ? 10 : 6);
      tone([760, 980], .18);
      bubble(pick(RX_LINES[zone] || RX_LINES.tete), 3500);
    }, { passive: true });
  }

  /* --- Ce qu'elle DIT quand tu la touches, selon l'endroit (porté de Lingua) --- */
  var RX_LINES = {
    tete: ['Oh, tu me caresses la tête !', 'Hihi, ça chatouille !', 'Merci pour le câlin !', 'Toujours là pour toi, Kevin !'],
    ventre: ['Hé, pas le ventre, ça chatouille !', 'Hihihi !', 'Arrête, je vais rire !'],
    aile: ['Attention, je décolle !', 'Regarde comme je vole bien !', 'Zzzzip !'],
    reveil: ['Oh ! Tu es revenu !', 'Je faisais un petit somme…', 'Coucou, on reprend ?'],
  };
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* Où le doigt a touché, en % du personnage (porté de Lingua : _rigZone) */
  function rigZone(rig, ev) {
    var r = rig.getBoundingClientRect();
    var p = (ev.touches && ev.touches[0]) || ev;
    var x = (p.clientX - r.left) / r.width * 100, y = (p.clientY - r.top) / r.height * 100;
    if (x < 28 || x > 72) return 'aile';
    return y < 52 ? 'tete' : 'ventre';
  }

  /* Étincelles (porté de Lingua : beeSparkles) */
  function sparkles(el, n) {
    try {
      var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var em = ['✨', '⭐', '💛', '🐝', '❤️', '🌟'];
      for (var i = 0; i < (n || 8); i++) {
        var sp = document.createElement('span');
        sp.className = 'javis-spark';
        sp.textContent = pick(em);
        var a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 55;
        sp.style.left = cx + 'px'; sp.style.top = cy + 'px';
        sp.style.setProperty('--dx', (Math.cos(a) * d) + 'px');
        sp.style.setProperty('--dy', (Math.sin(a) * d - 24) + 'px');
        document.body.appendChild(sp);
        (function (x) { setTimeout(function () { x.remove(); }, 950); })(sp);
      }
    } catch (_) {}
  }

  /* Petit son (porté de Lingua : tone) — muet si la voix est coupée */
  var AC = null;
  function tone(freqs, dur) {
    try {
      if (localStorage.getItem(STORAGE_VOICE) === '0') return;
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var o = AC.createOscillator(), g = AC.createGain();
      o.connect(g); g.connect(AC.destination); o.type = 'sine';
      freqs.forEach(function (f, i) { o.frequency.setValueAtTime(f, AC.currentTime + i * 0.08); });
      g.gain.setValueAtTime(.10, AC.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + dur);
      o.start(); o.stop(AC.currentTime + dur);
    } catch (_) {}
  }
  function vibrate(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (_) {} }

  /* Bulle qui apparaît à côté d'elle (porté de Lingua : beeBubble) */
  function bubble(text, ms) {
    try {
      var old = document.querySelector('.javis-bubble'); if (old) old.remove();
      var b = document.createElement('div');
      b.className = 'javis-bubble';
      b.textContent = text;
      b.onclick = function () { b.remove(); };
      document.body.appendChild(b);
      setTimeout(function () {
        try { b.classList.add('bye'); setTimeout(function () { b.remove(); }, 400); } catch (_) {}
      }, ms || 6000);
    } catch (_) {}
  }

  /* Mouvements du corps entier (porté de Lingua : beeMove) */
  function move(rig, kind, dur) {
    if (!rig) return;
    ['mv-dance', 'mv-jump', 'mv-fly', 'mv-walk'].forEach(function (c) { rig.classList.remove(c); });
    if (!kind) return;
    rig.classList.add('mv-' + kind);
    setTimeout(function () { try { rig.classList.remove('mv-' + kind); } catch (_) {} }, dur || 2400);
  }

  function react(rig, kind, dur) {
    if (!rig) return;
    ['rx-poke', 'rx-joie', 'rx-triste', 'rx-reflechit', 'rx-coucou'].forEach(function (c) { rig.classList.remove(c); });
    if (!kind) return;
    void rig.offsetWidth; /* relance l'animation même si c'est la même (astuce de Lingua) */
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
  function showTyping(root, on) {
    var list = root.querySelector('#javis-msgs');
    var t = list.querySelector('.javis-typing');
    if (on) {
      if (!t) {
        t = document.createElement('div');
        t.className = 'javis-typing';
        t.innerHTML = '<i></i><i></i><i></i>';
        list.appendChild(t);
        list.scrollTop = list.scrollHeight;
      }
    } else if (t) { t.remove(); }
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
    showTyping(root, true);
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
        showTyping(root, false);
        var ok = !!(j && j.ok && j.text);
        var out = ok ? j.text : 'Je n\'ai pas réussi à répondre là, réessaie dans un instant.';
        var meta = ok ? (j.provider + (j.provider === 'qwen' ? ' (gratuit)' : '')) : null;
        addBubble(root, 'javis', out, meta);
        allRigs(root).forEach(function (r) { react(r, ok ? 'joie' : 'triste', ok ? 1200 : 1600); });
        if (ok) { tone([660, 880], .2); vibrate(8); }
        var h = loadHistory(); h.push({ role: 'assistant', content: out }); saveHistory(h);
        speak(root, out);
      })
      .catch(function () {
        setThinking(root, false);
        showTyping(root, false);
        allRigs(root).forEach(function (r) { react(r, 'triste', 1600); });
        addBubble(root, 'javis', 'Le réseau ne répond pas là, réessaie dans un instant.');
      });
  }

  /* ============================================================
     5 bis. L'ATTITUDE — elle sait quelle heure il est, où elle est, et depuis
     combien de temps tu n'es pas venu. Elle ouvre la conversation elle-même.
     ============================================================ */
  var STORAGE_SEEN = 'javis_widget_last_seen';

  function moment() {
    var h = new Date().getHours();
    if (h < 6) return 'nuit';
    if (h < 12) return 'matin';
    if (h < 18) return 'aprem';
    return 'soir';
  }

  /* Où sommes-nous ? (pour qu'elle commente la page où elle apparaît) */
  function lieu() {
    var h = (location.hostname || '').toLowerCase();
    if (h.indexOf('arbre') === 0) return { nom: 'ton arbre de famille', quoi: 'Tu cherches quelqu\'un ? Je peux t\'aider à retrouver une fiche.' };
    if (h.indexOf('lingua') === 0) return { nom: 'Lingua', quoi: 'Ma maison ! On révise un peu ?' };
    if (h.indexOf('cmcteams') === 0) return { nom: 'tes plannings', quoi: 'Besoin d\'un coup d\'oeil sur une équipe ?' };
    if (h.indexOf('apex') === 0) return { nom: 'Apex', quoi: 'Je te laisse la main, il fait les grosses actions.' };
    return { nom: 'ton domaine', quoi: 'Demande-moi ce que tu veux.' };
  }

  function salut() {
    var m = moment();
    var base = m === 'nuit' ? 'Tu veilles tard, Kevin 🌙'
      : m === 'matin' ? 'Bonjour Kevin ☀️'
        : m === 'aprem' ? 'Coucou Kevin 🐝'
          : 'Bonsoir Kevin 🌆';
    var absence = 0;
    try { absence = Date.now() - (parseInt(localStorage.getItem(STORAGE_SEEN), 10) || Date.now()); } catch (_) {}
    var jours = Math.floor(absence / 86400000);
    if (jours >= 2) return base + ' Ça fait ' + jours + ' jours ! Tu m\'as manqué 🍯';
    return base + ' On est sur ' + lieu().nom + '. ' + lieu().quoi;
  }

  /* Elle s'ennuie : petits gestes espacés tant que tu n'as pas ouvert le chat.
     3 fois maximum, puis elle se tient tranquille (pas de harcèlement). */
  function ennui(root) {
    var fois = 0;
    (function boucle() {
      setTimeout(function () {
        if (!document.contains(root)) return;
        var panel = root.querySelector('#javis-panel');
        var ouvert = panel && panel.classList.contains('javis-open');
        if (!ouvert && fois < 3) {
          fois++;
          var rig = root.querySelector('#javis-launcher .bee-rig');
          if (rig) {
            react(rig, 'coucou', 1400);
            move(rig, fois === 1 ? 'walk' : (fois === 2 ? 'jump' : 'dance'), 1500);
            if (fois === 1) bubble(lieu().quoi, 5000);
          }
        }
        boucle();
      }, 45000 + Math.random() * 40000);
    })();
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
    if (hist.length) {
      hist.forEach(function (m) { addBubble(wrap, m.role === 'user' ? 'user' : 'javis', m.content); });
    }
    /* Elle ouvre la conversation elle-même, avec l'heure et l'endroit (attitude). */
    addBubble(wrap, 'javis', salut());
    try { localStorage.setItem(STORAGE_SEEN, String(Date.now())); } catch (_) {}
    ennui(wrap);

    wrap.querySelector('#javis-launcher').addEventListener('click', function () {
      panel.classList.toggle('javis-open');
      var ouvert = panel.classList.contains('javis-open');
      if (ouvert) {
        setTimeout(function () { input.focus(); }, 150);
        allRigs(wrap).forEach(function (r) { react(r, 'coucou', 1400); });
        tone([620, 820], .16);
        var b = document.querySelector('.javis-bubble'); if (b) b.remove();
      }
    });
    wrap.querySelector('#javis-close').addEventListener('click', function () {
      panel.classList.remove('javis-open');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (input.value || '').trim();
      if (!v) return;
      input.value = '';
      vibrate(6);
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
