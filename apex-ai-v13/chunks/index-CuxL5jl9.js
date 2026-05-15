const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-3uBGKGRH.js","./apex-kb-4Yru_caL.js","./credential-patterns-CLzI061R.js","./multi-source-analyze-9ZhG_xKV.js","./auth-ScQyyiiK.js","../assets/css/main-DBQtIeVv.css"])))=>i.map(i=>d[i]);
import{_ as l}from"./apex-kb-4Yru_caL.js";import{c as I}from"./listener-cleanup-Y2rGGxxX.js";import{l as S}from"./monitoring-3uBGKGRH.js";import{s as A}from"../core/main-D1gdyM8d.js";import{c as R}from"./csp-style-helper-BisGRi53.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-9ZhG_xKV.js";let r=null;function M(){r?.cleanup(),r=null}function f(i){return i.replace(/[&<>"']/g,y=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[y]??y)}const T="apex_v13_chat_auto_read";function P(){try{return localStorage.getItem(T)==="1"}catch{return!1}}function V(i){try{localStorage.setItem(T,i?"1":"0")}catch{}}async function O(i){try{const y=await l(()=>import("./voice-Ck07Djoz.js").then(s=>s.c),__vite__mapDeps([0,1,2]),import.meta.url),{listVoices:k,getActiveVoice:d,setActiveVoice:p,speak:u,stopAll:b}=y,h=i.querySelector("#ax-settings-auto-read"),$=i.querySelector("#ax-voice-current"),w=i.querySelector("#ax-voice-list"),v=i.querySelectorAll(".ax-voice-cat-btn");if(!w)return;h&&(h.checked=P(),r.bind(h,"change",()=>{V(h.checked),(async()=>{const{toast:s}=await l(async()=>{const{toast:t}=await import("./toast-ClsF1KRZ.js");return{toast:t}},[],import.meta.url);s.success(h.checked?"Lecture auto activée":"Lecture auto désactivée")})()}));const m=()=>{if(!$)return;const s=d(),a=k().find(o=>o.id===s);$.textContent=a?`Voix active : ${a.emoji??"🔊"} ${a.name} (${a.category})`:`Voix active : ${s}`};m();const _=s=>{const t=k(),a=s==="all"?t:t.filter(e=>e.category===s),o=d();w.innerHTML=a.map(e=>{const n=e.id===o,c=e.emoji??(e.category==="pro"?"🎙️":e.category==="fun"?"🎉":"🎨"),g=e.description?f(e.description):"",x=n?"background:rgba(232,184,48,0.15);border-color:rgba(232,184,48,0.45)":"background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.06)";return`
            <div class="ax-voice-item" data-voice-id="${f(e.id)}" style="display:flex;align-items:center;gap:8px;padding:10px;margin-bottom:6px;border:1px solid;border-radius:8px;${x}">
              <span style="font-size:18px">${c}</span>
              <div style="flex:1;min-width:0">
                <div style="color:#fff;font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f(e.name)}${n?' <span style="color:#e8b830;font-size:11px">★ active</span>':""}</div>
                <div style="color:rgba(255,255,255,0.5);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f(e.category)}${g?" · "+g:""}</div>
              </div>
              <button class="ax-voice-test-btn" data-test-voice="${f(e.id)}" title="Tester cette voix" aria-label="Tester ${f(e.name)}" style="min-width:44px;min-height:44px;width:44px;height:44px;border-radius:8px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.3);cursor:pointer;font-size:14px">▶</button>
              <button class="ax-voice-set-btn" data-set-voice="${f(e.id)}" title="Définir comme voix par défaut" aria-label="Définir ${f(e.name)} par défaut" style="min-width:44px;min-height:44px;width:44px;height:44px;border-radius:8px;background:rgba(232,184,48,0.15);color:#e8b830;border:1px solid rgba(232,184,48,0.3);cursor:pointer;font-size:14px">★</button>
            </div>
          `}).join("")};_("all"),v.forEach(s=>{r.bind(s,"click",()=>{const t=s.getAttribute("data-cat");t&&_(t)})}),r.bind(w,"click",s=>{const t=s.target,a=t.closest("[data-test-voice]"),o=t.closest("[data-set-voice]");if(a){const e=a.getAttribute("data-test-voice");if(!e)return;(async()=>{b();const n=await u("Bonjour Kevin, je suis ta voix.",e);if(!n.ok){const{toast:c}=await l(async()=>{const{toast:g}=await import("./toast-ClsF1KRZ.js");return{toast:g}},[],import.meta.url);c.warn(`Test échoué : ${n.reason??"erreur"}`)}})();return}if(o){const e=o.getAttribute("data-set-voice");if(!e)return;(async()=>{await p(e),m();const n=i.querySelector(".ax-voice-cat-btn[data-cat]:focus")?.getAttribute("data-cat")??"all";_(n);const{toast:c}=await l(async()=>{const{toast:z}=await import("./toast-ClsF1KRZ.js");return{toast:z}},[],import.meta.url),x=k().find(z=>z.id===e);c.success(x?`Voix par défaut : ${x.name}`:"Voix mise à jour")})()}})}catch(y){S.warn("feature-settings","wireVoiceSection failed",{err:y})}}function j(i){r?.cleanup(),r=I("settings");const y=A.get("user"),k=A.get("isAdmin")??!1,d="background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;margin-top:14px;transition:all 240ms cubic-bezier(0.16,1,0.3,1)",p="margin:0 0 12px;font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.01em;display:flex;align-items:center;gap:10px",u="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:linear-gradient(135deg,rgba(232,184,48,0.2),rgba(201,162,39,0.08));border:1px solid rgba(232,184,48,0.25);border-radius:10px;font-size:16px",b="width:100%;min-height:44px;padding:12px 16px;font-size:14px;font-weight:600;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1)";i.innerHTML=R.withNonce(`
    <style>
      @keyframes ax-fade-up {
        0% { opacity: 0; transform: translateY(12px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .ax-modernized-card { animation: ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) backwards; }
      .ax-modernized-card:hover {
        transform: translateY(-2px);
        border-color: rgba(232,184,48,0.25) !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      }
      @media (prefers-reduced-motion: reduce) {
        .ax-modernized-card { animation: none !important; transition: none !important; }
        .ax-modernized-card:hover { transform: none !important; }
      }
    </style>
    <div class="ax-page" style="padding:24px 16px max(24px, env(safe-area-inset-bottom)) 16px;max-width:680px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif">
      <header style="margin-bottom:24px;animation:ax-fade-up 360ms cubic-bezier(0.16,1,0.3,1) backwards">
        <h1 style="margin:0 0 6px;font-size:clamp(26px,4.5vw,32px);font-weight:700;background:linear-gradient(135deg,#c9a227 0%,#e8b830 50%,#f5cc4a 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:Georgia,serif;letter-spacing:-0.025em">⚙️ Réglages</h1>
        <p style="color:rgba(255,255,255,0.55);margin:0;font-size:14px">Utilisateur : <strong style="color:rgba(255,255,255,0.9)">${f(y?.name??"inconnu")}</strong> ${k?'<span style="color:#e8b830">👑 Admin</span>':""}</p>
      </header>

      <section class="ax-modernized-card" style="${d};animation-delay:60ms">
        <h2 style="${p}"><span style="${u}">🔑</span> Clés API</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">Gère tes clés API (Anthropic, OpenAI, Stripe, etc.) dans le Coffre sécurisé.</p>
        <button class="ax-btn ax-btn-primary" data-nav-route="vault" style="${b};background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none">🔐 Ouvrir le Coffre</button>
      </section>

      <section class="ax-modernized-card" style="${d};animation-delay:100ms">
        <h2 style="${p}"><span style="${u}">🎨</span> Apparence</h2>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px">
          <span style="color:rgba(255,255,255,0.7);font-size:14px">Thème actuel</span>
          <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(232,184,48,0.12);color:#e8b830;border-radius:24px;font-size:12px;font-weight:700;letter-spacing:0.04em">
            <span style="width:8px;height:8px;background:#e8b830;border-radius:50%;box-shadow:0 0 10px #e8b830"></span> DARK
          </span>
        </div>
      </section>

      <section class="ax-modernized-card" style="${d};animation-delay:140ms">
        <h2 style="${p}"><span style="${u}">🔔</span> Notifications</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">Active les notifications push pour rester informé en temps réel.</p>
        <button class="ax-btn ax-btn-secondary" id="ax-settings-notif-test" style="${b};background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3)">🔔 Tester notification push</button>
      </section>

      <section class="ax-modernized-card" style="${d};animation-delay:180ms">
        <h2 style="${p}"><span style="${u}">🧠</span> Mémoire externe</h2>
        <p style="margin:0 0 10px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Backup mémoire vers Notion / GitHub Gist / Firebase. Tokens lus depuis le Coffre.
        </p>
        <div id="ax-memory-bridge-status" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-memory-bridge-sync" style="${b};background:rgba(160,96,255,0.15);color:#a060ff;border:1px solid rgba(160,96,255,0.3)">🔄 Sync maintenant</button>
      </section>

      <section class="ax-modernized-card" style="${d};animation-delay:220ms">
        <h2 style="${p}"><span style="${u}">📊</span> Conso API temps réel</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Apex surveille ta conso et détecte si une clé est utilisée anormalement (potentielle compromission).
        </p>
        <button class="ax-btn ax-btn-secondary" id="ax-conso-scan" style="${b};margin-bottom:10px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.3)">🔍 Scanner toutes mes API maintenant</button>
        <div id="ax-conso-results" style="margin-top:12px;font-size:13px"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-zoom-inspector-btn" style="${b};margin-top:10px;background:rgba(201,162,39,0.15);color:#c9a227;border:1px solid rgba(201,162,39,0.3)">🔍 Zoom Inspector live (debug UX zoom Kevin)</button>
      </section>

      <section class="ax-modernized-card" style="${d};animation-delay:240ms">
        <h2 style="${p}"><span style="${u}">🔊</span> Voix &amp; Lecture</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Apex peut lire ses réponses à voix haute. Choisis ta voix préférée parmi 60+ (PRO, FUN, Thématique).
        </p>
        <label style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px;margin-bottom:10px;cursor:pointer">
          <span style="color:rgba(255,255,255,0.7);font-size:14px">Lire automatiquement les réponses</span>
          <input type="checkbox" id="ax-settings-auto-read" aria-label="Lire automatiquement les réponses à voix haute" style="width:20px;height:20px;cursor:pointer">
        </label>
        <div id="ax-voice-current" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace">Voix active : ...</div>
        <div id="ax-voice-categories" style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
          <button class="ax-btn ax-btn-secondary ax-voice-cat-btn" data-cat="all" style="padding:6px 12px;font-size:12px;border-radius:14px;background:rgba(232,184,48,0.15);color:#e8b830;border:1px solid rgba(232,184,48,0.3);cursor:pointer">Tous</button>
          <button class="ax-btn ax-btn-secondary ax-voice-cat-btn" data-cat="pro" style="padding:6px 12px;font-size:12px;border-radius:14px;background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3);cursor:pointer">PRO</button>
          <button class="ax-btn ax-btn-secondary ax-voice-cat-btn" data-cat="fun" style="padding:6px 12px;font-size:12px;border-radius:14px;background:rgba(255,170,0,0.15);color:#ffaa00;border:1px solid rgba(255,170,0,0.3);cursor:pointer">FUN</button>
          <button class="ax-btn ax-btn-secondary ax-voice-cat-btn" data-cat="thematic" style="padding:6px 12px;font-size:12px;border-radius:14px;background:rgba(160,96,255,0.15);color:#a060ff;border:1px solid rgba(160,96,255,0.3);cursor:pointer">Thématique</button>
        </div>
        <div id="ax-voice-list" style="max-height:360px;overflow-y:auto;background:rgba(0,0,0,0.2);border-radius:10px;padding:8px"></div>
      </section>

      <section class="ax-modernized-card" style="${d};animation-delay:250ms">
        <h2 style="${p}"><span style="${u}">🧰</span> Suggestions outils</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Quand Apex détecte un outil pertinent dans tes messages (Studio Music, Finance Pro, etc.), il l'affiche directement dans le chat en plus du toast.
        </p>
        <label style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:10px;cursor:pointer">
          <span style="color:rgba(255,255,255,0.85);font-size:14px">Cards outils dans le chat</span>
          <input type="checkbox" id="ax-settings-tools-auto-embed" aria-label="Afficher cards outils dans le chat" style="width:20px;height:20px;cursor:pointer">
        </label>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.4);font-size:12px;line-height:1.4">Décoche pour n'avoir que le toast (5s) sans card permanente. Le bouton ✕ sur chaque card permet aussi de la fermer.</p>
      </section>

      <section class="ax-modernized-card" style="${d};animation-delay:260ms">
        <h2 style="${p}"><span style="${u}">🔄</span> Mise à jour</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Si Apex reste bloqué sur une ancienne version malgré le reload (bug Safari iOS PWA cache), force le reset complet : Service Worker + caches + reload propre vers la dernière version.
        </p>
        <div id="ax-force-update-status" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-force-update-btn" style="${b};background:rgba(232,184,48,0.15);color:#e8b830;border:1px solid rgba(232,184,48,0.3)">🔄 Force reset PWA + reload</button>
      </section>

      <section class="ax-modernized-card" style="${d};animation-delay:280ms">
        <h2 style="${p}"><span style="${u}">🔐</span> Compte</h2>
        <button class="ax-btn ax-btn-danger" id="ax-settings-logout" style="${b};background:rgba(255,91,91,0.15);color:#ff5b5b;border:1px solid rgba(255,91,91,0.3)">🚪 Se déconnecter</button>
      </section>

      <p style="margin-top:32px;text-align:center"><a href="#chat" style="color:#e8b830;text-decoration:none;font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:rgba(232,184,48,0.08);border-radius:24px;border:1px solid rgba(232,184,48,0.2);transition:all 200ms">← Retour chat</a></p>
    </div>
  `),(async()=>{try{const{memoryBridge:t}=await l(async()=>{const{memoryBridge:n}=await import("./memory-bridge-D3oWTMDF.js");return{memoryBridge:n}},__vite__mapDeps([1,0,2]),import.meta.url),a=i.querySelector("#ax-memory-bridge-status"),o=i.querySelector("#ax-memory-bridge-sync"),e=()=>{if(!a)return;const n=t.getHealth(),c=t.getStatus(),g=c.filter(x=>x.last_success).length;a.textContent=`${n.backends_configured} backends configurés · ${g}/${c.length} dernier sync OK`};e(),o&&r&&r.bind(o,"click",()=>{(async()=>{o&&(o.disabled=!0);const n=await t.runAutoSync(),c=n.filter(x=>x.ok).length,{toast:g}=await l(async()=>{const{toast:x}=await import("./toast-ClsF1KRZ.js");return{toast:x}},[],import.meta.url);n.length===0?g.warn("Aucun backend configuré"):c===n.length?g.success(`Sync OK (${c}/${n.length})`):g.warn(`Sync partielle (${c}/${n.length})`),e(),o&&(o.disabled=!1)})()})}catch(t){S.warn("feature-settings","memory-bridge wire failed",{err:t})}})();const h=i.querySelector("#ax-conso-scan");h&&r&&r.bind(h,"click",()=>{(async()=>{try{const{consumptionAnomalyDetector:t}=await l(async()=>{const{consumptionAnomalyDetector:e}=await import("./consumption-anomaly-detector-B67oI1-I.js");return{consumptionAnomalyDetector:e}},__vite__mapDeps([0,1,2,3]),import.meta.url),a=t.scanAllVerbose(),o=i.querySelector("#ax-conso-results");if(!o)return;o.innerHTML=a.map(e=>{const n=e.severity==="critical"?"#ff4444":e.severity==="high"?"#ff8844":e.severity==="medium"?"#ffaa00":e.severity==="low"?"#88aaff":"#22cc77",c=e.severity==="critical"?"🚨":e.severity==="high"?"⚠️":e.severity==="medium"?"🟡":e.severity==="low"?"🔵":"✅";return`<div style="background:rgba(255,255,255,0.03);border-left:3px solid ${n};padding:8px 12px;margin-top:6px;border-radius:4px">
            <strong style="color:${n}">${c} ${e.service}</strong>
            <div style="font-size:12px;color:var(--ax-text-dim);margin-top:4px">${e.reason}</div>
            <div style="font-size:11px;margin-top:4px">${e.recommended_action}</div>
            ${e.recharge_url?`<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><a href="${e.recharge_url}" target="_blank" rel="noopener" style="color:#c9a227;font-size:11px">💳 Recharge →</a> <a href="${e.rotate_url}" target="_blank" rel="noopener" style="color:#c9a227;font-size:11px">🔄 Rotate →</a></div>`:""}
          </div>`}).join("")}catch(t){S.warn("feature-settings","conso scan failed",{err:t})}})()});const $=i.querySelector("#ax-zoom-inspector-btn");$&&r&&r.bind($,"click",()=>{(async()=>{const{apexZoomInspector:t}=await l(async()=>{const{apexZoomInspector:a}=await import("./apex-zoom-inspector-DbLZ7EZD.js");return{apexZoomInspector:a}},__vite__mapDeps([0]),import.meta.url);t.isVisible()?t.hide():t.show()})()}),i.querySelectorAll("[data-nav-route]").forEach(t=>{r.bind(t,"click",()=>{const a=t.getAttribute("data-nav-route");a&&(location.hash="#"+a)})});const w=i.querySelector("#ax-settings-logout");w&&r&&r.bind(w,"click",()=>{(async()=>{const{auth:t}=await l(async()=>{const{auth:a}=await import("./auth-ScQyyiiK.js");return{auth:a}},__vite__mapDeps([4,1,0,2,3,5]),import.meta.url);t.logout(),location.hash="#login"})()});const v=i.querySelector("#ax-settings-tools-auto-embed");if(v&&r){try{const t=JSON.parse(localStorage.getItem("ax_settings")??"{}");v.checked=t.tools_auto_embed!==!1}catch{v.checked=!0}r.bind(v,"change",()=>{try{const t=JSON.parse(localStorage.getItem("ax_settings")??"{}");t.tools_auto_embed=v.checked,localStorage.setItem("ax_settings",JSON.stringify(t))}catch{}})}const m=i.querySelector("#ax-force-update-btn"),_=i.querySelector("#ax-force-update-status");m&&r&&r.bind(m,"click",()=>{(async()=>{const t=a=>{_&&(_.textContent=a)};m.disabled=!0,m.textContent="⏳ Reset en cours…";try{if(t("🔍 Désinstallation Service Workers…"),"serviceWorker"in navigator){const o=await navigator.serviceWorker.getRegistrations();for(const e of o)await e.unregister();t(`✅ ${o.length} SW désinstallés`)}if(t("🔍 Vidage caches PWA…"),"caches"in window){const o=await caches.keys();for(const e of o)await caches.delete(e);t(`✅ ${o.length} caches vidés`)}t("✅ Reset terminé. Rechargement dans 2s…");const{toast:a}=await l(async()=>{const{toast:o}=await import("./toast-ClsF1KRZ.js");return{toast:o}},[],import.meta.url);a.info("🔄 Reset OK — reload imminent"),setTimeout(()=>{location.href=location.pathname+"?_forceupd=1&_reset="+Date.now()},2e3)}catch(a){t(`❌ Erreur : ${String(a)}`),m.disabled=!1,m.textContent="🔄 Force reset PWA + reload"}})()}),O(i);const s=i.querySelector("#ax-settings-notif-test");s&&r&&r.bind(s,"click",()=>{(async()=>{try{if("Notification"in window&&Notification.permission==="granted")new Notification("Test Apex",{body:"Si tu vois ça, push notif fonctionne ✅"});else if("Notification"in window)if(await Notification.requestPermission()==="granted")new Notification("Test Apex",{body:"Push activé ✅"});else{const{toast:a}=await l(async()=>{const{toast:o}=await import("./toast-ClsF1KRZ.js");return{toast:o}},[],import.meta.url);a.warn("Permission notifications refusée")}else{const{toast:t}=await l(async()=>{const{toast:a}=await import("./toast-ClsF1KRZ.js");return{toast:a}},[],import.meta.url);t.warn("Notifications non supportées par ce navigateur")}}catch{const{toast:t}=await l(async()=>{const{toast:a}=await import("./toast-ClsF1KRZ.js");return{toast:a}},[],import.meta.url);t.warn("Test notification échoué")}})()}),S.info("feature-settings","rendered")}export{M as dispose,j as render,O as wireVoiceSection};
