const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-WiO5ZBU9.js","./apex-tools-registry-DPQHcZUW.js","./toast-Dgg9rcIP.js","./haptic-BUEqXK0N.js","./memory-bridge-B5kPnSvU.js","./apex-kb-CYd99vYi.js","./credential-patterns-DqicUg9o.js","./persistent-memory-store-SzHYZSph.js","./consumption-anomaly-detector-C2DxYV-p.js","./consumption-monitor-FVw-brR1.js","./links-registry-Du0VNQE9.js","./push-notifications-BmQVsGNt.js","./tokens-dashboard-C5ZzZyK6.js","./auth-Bm-QG8_A.js","../core/main-Cifqh60i.js","../assets/css/main-CjlSpvBL.css"])))=>i.map(i=>d[i]);
import{_ as l}from"./apex-kb-CYd99vYi.js";import{l as A}from"./monitoring-WiO5ZBU9.js";import{c as R}from"./listener-cleanup-Y2rGGxxX.js";import{s as z}from"../core/main-Cifqh60i.js";import"./apex-tools-registry-DPQHcZUW.js";import"./credential-patterns-DqicUg9o.js";import"./apex-tools-dispatch-CpNodyWh.js";let s=null;function M(){s?.cleanup(),s=null}function b(r){return r.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[m]??m)}const T="apex_v13_chat_auto_read";function P(){try{return localStorage.getItem(T)==="1"}catch{return!1}}function V(r){try{localStorage.setItem(T,r?"1":"0")}catch{}}async function I(r){try{const m=await l(()=>import("./voice-BcOs5xoC.js").then(t=>t.a),__vite__mapDeps([0,1]),import.meta.url),{listVoices:h,getActiveVoice:d,setActiveVoice:u,speak:g,stopAll:f}=m,y=r.querySelector("#ax-settings-auto-read"),v=r.querySelector("#ax-voice-current"),x=r.querySelector("#ax-voice-list"),k=r.querySelectorAll(".ax-voice-cat-btn");if(!x)return;y&&(y.checked=P(),s.bind(y,"change",()=>{V(y.checked),(async()=>{const{toast:t}=await l(async()=>{const{toast:a}=await import("./toast-Dgg9rcIP.js");return{toast:a}},__vite__mapDeps([2,3]),import.meta.url);t.success(y.checked?"Lecture auto activée":"Lecture auto désactivée")})()}));const w=()=>{if(!v)return;const t=d(),e=h().find(n=>n.id===t);v.textContent=e?`Voix active : ${e.emoji??"🔊"} ${e.name} (${e.category})`:`Voix active : ${t}`};w();const i=t=>{const a=h(),e=t==="all"?a:a.filter(o=>o.category===t),n=d();x.innerHTML=e.map(o=>{const c=o.id===n,p=o.emoji??(o.category==="pro"?"🎙️":o.category==="fun"?"🎉":"🎨"),_=o.description?b(o.description):"",$=c?"background:rgba(232,184,48,0.15);border-color:rgba(232,184,48,0.45)":"background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.06)";return`
            <div class="ax-voice-item" data-voice-id="${b(o.id)}" style="display:flex;align-items:center;gap:8px;padding:10px;margin-bottom:6px;border:1px solid;border-radius:8px;${$}">
              <span style="font-size:18px">${p}</span>
              <div style="flex:1;min-width:0">
                <div style="color:#fff;font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${b(o.name)}${c?' <span style="color:#e8b830;font-size:11px">★ active</span>':""}</div>
                <div style="color:rgba(255,255,255,0.5);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${b(o.category)}${_?" · "+_:""}</div>
              </div>
              <button class="ax-voice-test-btn" data-test-voice="${b(o.id)}" title="Tester cette voix" aria-label="Tester ${b(o.name)}" style="min-width:36px;height:36px;border-radius:8px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.3);cursor:pointer;font-size:14px">▶</button>
              <button class="ax-voice-set-btn" data-set-voice="${b(o.id)}" title="Définir comme voix par défaut" aria-label="Définir ${b(o.name)} par défaut" style="min-width:36px;height:36px;border-radius:8px;background:rgba(232,184,48,0.15);color:#e8b830;border:1px solid rgba(232,184,48,0.3);cursor:pointer;font-size:14px">★</button>
            </div>
          `}).join("")};i("all"),k.forEach(t=>{s.bind(t,"click",()=>{const a=t.getAttribute("data-cat");a&&i(a)})}),s.bind(x,"click",t=>{const a=t.target,e=a.closest("[data-test-voice]"),n=a.closest("[data-set-voice]");if(e){const o=e.getAttribute("data-test-voice");if(!o)return;(async()=>{f();const c=await g("Bonjour Kevin, je suis ta voix.",o);if(!c.ok){const{toast:p}=await l(async()=>{const{toast:_}=await import("./toast-Dgg9rcIP.js");return{toast:_}},__vite__mapDeps([2,3]),import.meta.url);p.warn(`Test échoué : ${c.reason??"erreur"}`)}})();return}if(n){const o=n.getAttribute("data-set-voice");if(!o)return;(async()=>{await u(o),w();const c=r.querySelector(".ax-voice-cat-btn[data-cat]:focus")?.getAttribute("data-cat")??"all";i(c);const{toast:p}=await l(async()=>{const{toast:S}=await import("./toast-Dgg9rcIP.js");return{toast:S}},__vite__mapDeps([2,3]),import.meta.url),$=h().find(S=>S.id===o);p.success($?`Voix par défaut : ${$.name}`:"Voix mise à jour")})()}})}catch(m){A.warn("feature-settings","wireVoiceSection failed",{err:m})}}function j(r){s?.cleanup(),s=R("settings");const m=z.get("user"),h=z.get("isAdmin")??!1,d="background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;margin-top:14px;transition:all 240ms cubic-bezier(0.16,1,0.3,1)",u="margin:0 0 12px;font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.01em;display:flex;align-items:center;gap:10px",g="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:linear-gradient(135deg,rgba(232,184,48,0.2),rgba(201,162,39,0.08));border:1px solid rgba(232,184,48,0.25);border-radius:10px;font-size:16px",f="width:100%;min-height:44px;padding:12px 16px;font-size:14px;font-weight:600;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1)";r.innerHTML=`
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
        <p style="color:rgba(255,255,255,0.55);margin:0;font-size:14px">Utilisateur : <strong style="color:rgba(255,255,255,0.9)">${b(m?.name??"inconnu")}</strong> ${h?'<span style="color:#e8b830">👑 Admin</span>':""}</p>
      </header>

      <section class="ax-modernized-card" style="${d};animation-delay:60ms">
        <h2 style="${u}"><span style="${g}">🔑</span> Clés API</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">Gère tes clés API (Anthropic, OpenAI, Stripe, etc.) dans le Coffre sécurisé.</p>
        <button class="ax-btn ax-btn-primary" data-nav-route="vault" style="${f};background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none">🔐 Ouvrir le Coffre</button>
      </section>

      <section class="ax-modernized-card" style="${d};animation-delay:100ms">
        <h2 style="${u}"><span style="${g}">🎨</span> Apparence</h2>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px">
          <span style="color:rgba(255,255,255,0.7);font-size:14px">Thème actuel</span>
          <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(232,184,48,0.12);color:#e8b830;border-radius:24px;font-size:12px;font-weight:700;letter-spacing:0.04em">
            <span style="width:8px;height:8px;background:#e8b830;border-radius:50%;box-shadow:0 0 10px #e8b830"></span> DARK
          </span>
        </div>
      </section>

      <section class="ax-modernized-card" style="${d};animation-delay:140ms">
        <h2 style="${u}"><span style="${g}">🔔</span> Notifications</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">Active les notifications push pour rester informé en temps réel.</p>
        <button class="ax-btn ax-btn-secondary" id="ax-settings-notif-test" style="${f};background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3)">🔔 Tester notification push</button>
      </section>

      <section class="ax-modernized-card" style="${d};animation-delay:180ms">
        <h2 style="${u}"><span style="${g}">🧠</span> Mémoire externe</h2>
        <p style="margin:0 0 10px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Backup mémoire vers Notion / GitHub Gist / Firebase. Tokens lus depuis le Coffre.
        </p>
        <div id="ax-memory-bridge-status" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-memory-bridge-sync" style="${f};background:rgba(160,96,255,0.15);color:#a060ff;border:1px solid rgba(160,96,255,0.3)">🔄 Sync maintenant</button>
      </section>

      <section class="ax-modernized-card" style="${d};animation-delay:220ms">
        <h2 style="${u}"><span style="${g}">📊</span> Conso API temps réel</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Apex surveille ta conso et détecte si une clé est utilisée anormalement (potentielle compromission).
        </p>
        <button class="ax-btn ax-btn-secondary" id="ax-conso-scan" style="${f};margin-bottom:10px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.3)">🔍 Scanner toutes mes API maintenant</button>
        <div id="ax-conso-results" style="margin-top:12px;font-size:13px"></div>
      </section>

      <section class="ax-modernized-card" style="${d};animation-delay:240ms">
        <h2 style="${u}"><span style="${g}">🔊</span> Voix &amp; Lecture</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Apex peut lire ses réponses à voix haute. Choisis ta voix préférée parmi 60+ (PRO, FUN, Thématique).
        </p>
        <label style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px;margin-bottom:10px;cursor:pointer">
          <span style="color:rgba(255,255,255,0.7);font-size:14px">Lire automatiquement les réponses</span>
          <input type="checkbox" id="ax-settings-auto-read" style="width:20px;height:20px;cursor:pointer">
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

      <section class="ax-modernized-card" style="${d};animation-delay:260ms">
        <h2 style="${u}"><span style="${g}">🔄</span> Mise à jour</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Si Apex reste bloqué sur une ancienne version malgré le reload (bug Safari iOS PWA cache), force le reset complet : Service Worker + caches + reload propre vers la dernière version.
        </p>
        <div id="ax-force-update-status" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-force-update-btn" style="${f};background:rgba(232,184,48,0.15);color:#e8b830;border:1px solid rgba(232,184,48,0.3)">🔄 Force reset PWA + reload</button>
      </section>

      <section class="ax-modernized-card" style="${d};animation-delay:280ms">
        <h2 style="${u}"><span style="${g}">🔐</span> Compte</h2>
        <button class="ax-btn ax-btn-danger" id="ax-settings-logout" style="${f};background:rgba(255,91,91,0.15);color:#ff5b5b;border:1px solid rgba(255,91,91,0.3)">🚪 Se déconnecter</button>
      </section>

      <p style="margin-top:32px;text-align:center"><a href="#chat" style="color:#e8b830;text-decoration:none;font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:rgba(232,184,48,0.08);border-radius:24px;border:1px solid rgba(232,184,48,0.2);transition:all 200ms">← Retour chat</a></p>
    </div>
  `,(async()=>{try{const{memoryBridge:i}=await l(async()=>{const{memoryBridge:n}=await import("./memory-bridge-B5kPnSvU.js");return{memoryBridge:n}},__vite__mapDeps([4,5,0,1,6,7]),import.meta.url),t=r.querySelector("#ax-memory-bridge-status"),a=r.querySelector("#ax-memory-bridge-sync"),e=()=>{if(!t)return;const n=i.getHealth(),o=i.getStatus(),c=o.filter(p=>p.last_success).length;t.textContent=`${n.backends_configured} backends configurés · ${c}/${o.length} dernier sync OK`};e(),a&&s&&s.bind(a,"click",()=>{(async()=>{a&&(a.disabled=!0);const n=await i.runAutoSync(),o=n.filter(p=>p.ok).length,{toast:c}=await l(async()=>{const{toast:p}=await import("./toast-Dgg9rcIP.js");return{toast:p}},__vite__mapDeps([2,3]),import.meta.url);n.length===0?c.warn("Aucun backend configuré"):o===n.length?c.success(`Sync OK (${o}/${n.length})`):c.warn(`Sync partielle (${o}/${n.length})`),e(),a&&(a.disabled=!1)})()})}catch(i){A.warn("feature-settings","memory-bridge wire failed",{err:i})}})();const y=r.querySelector("#ax-conso-scan");y&&s&&s.bind(y,"click",()=>{(async()=>{try{const{consumptionAnomalyDetector:i}=await l(async()=>{const{consumptionAnomalyDetector:e}=await import("./consumption-anomaly-detector-C2DxYV-p.js");return{consumptionAnomalyDetector:e}},__vite__mapDeps([8,0,1,9,10,5,6,11,12]),import.meta.url),t=i.scanAllVerbose(),a=r.querySelector("#ax-conso-results");if(!a)return;a.innerHTML=t.map(e=>{const n=e.severity==="critical"?"#ff4444":e.severity==="high"?"#ff8844":e.severity==="medium"?"#ffaa00":e.severity==="low"?"#88aaff":"#22cc77",o=e.severity==="critical"?"🚨":e.severity==="high"?"⚠️":e.severity==="medium"?"🟡":e.severity==="low"?"🔵":"✅";return`<div style="background:rgba(255,255,255,0.03);border-left:3px solid ${n};padding:8px 12px;margin-top:6px;border-radius:4px">
            <strong style="color:${n}">${o} ${e.service}</strong>
            <div style="font-size:12px;color:var(--ax-text-dim);margin-top:4px">${e.reason}</div>
            <div style="font-size:11px;margin-top:4px">${e.recommended_action}</div>
            ${e.recharge_url?`<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><a href="${e.recharge_url}" target="_blank" rel="noopener" style="color:#c9a227;font-size:11px">💳 Recharge →</a> <a href="${e.rotate_url}" target="_blank" rel="noopener" style="color:#c9a227;font-size:11px">🔄 Rotate →</a></div>`:""}
          </div>`}).join("")}catch(i){A.warn("feature-settings","conso scan failed",{err:i})}})()}),r.querySelectorAll("[data-nav-route]").forEach(i=>{s.bind(i,"click",()=>{const t=i.getAttribute("data-nav-route");t&&(location.hash="#"+t)})});const v=r.querySelector("#ax-settings-logout");v&&s&&s.bind(v,"click",()=>{(async()=>{const{auth:i}=await l(async()=>{const{auth:t}=await import("./auth-Bm-QG8_A.js");return{auth:t}},__vite__mapDeps([13,5,0,1,6,14,15]),import.meta.url);i.logout(),location.hash="#login"})()});const x=r.querySelector("#ax-force-update-btn"),k=r.querySelector("#ax-force-update-status");x&&s&&s.bind(x,"click",()=>{(async()=>{const i=t=>{k&&(k.textContent=t)};x.disabled=!0,x.textContent="⏳ Reset en cours…";try{if(i("🔍 Désinstallation Service Workers…"),"serviceWorker"in navigator){const a=await navigator.serviceWorker.getRegistrations();for(const e of a)await e.unregister();i(`✅ ${a.length} SW désinstallés`)}if(i("🔍 Vidage caches PWA…"),"caches"in window){const a=await caches.keys();for(const e of a)await caches.delete(e);i(`✅ ${a.length} caches vidés`)}i("✅ Reset terminé. Rechargement dans 2s…");const{toast:t}=await l(async()=>{const{toast:a}=await import("./toast-Dgg9rcIP.js");return{toast:a}},__vite__mapDeps([2,3]),import.meta.url);t.info("🔄 Reset OK — reload imminent"),setTimeout(()=>{location.href=location.pathname+"?_forceupd=1&_reset="+Date.now()},2e3)}catch(t){i(`❌ Erreur : ${String(t)}`),x.disabled=!1,x.textContent="🔄 Force reset PWA + reload"}})()}),I(r);const w=r.querySelector("#ax-settings-notif-test");w&&s&&s.bind(w,"click",()=>{(async()=>{try{if("Notification"in window&&Notification.permission==="granted")new Notification("Test Apex",{body:"Si tu vois ça, push notif fonctionne ✅"});else if("Notification"in window)if(await Notification.requestPermission()==="granted")new Notification("Test Apex",{body:"Push activé ✅"});else{const{toast:t}=await l(async()=>{const{toast:a}=await import("./toast-Dgg9rcIP.js");return{toast:a}},__vite__mapDeps([2,3]),import.meta.url);t.warn("Permission notifications refusée")}else{const{toast:i}=await l(async()=>{const{toast:t}=await import("./toast-Dgg9rcIP.js");return{toast:t}},__vite__mapDeps([2,3]),import.meta.url);i.warn("Notifications non supportées par ce navigateur")}}catch{const{toast:i}=await l(async()=>{const{toast:t}=await import("./toast-Dgg9rcIP.js");return{toast:t}},__vite__mapDeps([2,3]),import.meta.url);i.warn("Test notification échoué")}})()}),A.info("feature-settings","rendered")}export{M as dispose,j as render,I as wireVoiceSection};
//# sourceMappingURL=index-CJtEypM8.js.map
