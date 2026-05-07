const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-WiO5ZBU9.js","./apex-tools-registry-DPQHcZUW.js","./toast-Dgg9rcIP.js","./haptic-BUEqXK0N.js","./memory-bridge-DoFVSIe-.js","./apex-kb-Duna9QEJ.js","./credential-patterns-DqicUg9o.js","./persistent-memory-store-BfesGUbz.js","./consumption-anomaly-detector-CP-PF8iO.js","./consumption-monitor-tmg98cBM.js","./links-registry-CKDh-eng.js","./push-notifications-BgYmJKn-.js","./tokens-dashboard-C5ZzZyK6.js","./auth-8h8ANMds.js","../core/main-DIkkpXt1.js","../assets/css/main-CjlSpvBL.css"])))=>i.map(i=>d[i]);
import{_ as d}from"./apex-kb-Duna9QEJ.js";import{l as A}from"./monitoring-WiO5ZBU9.js";import{c as V}from"./listener-cleanup-Y2rGGxxX.js";import{s as S}from"../core/main-DIkkpXt1.js";import"./apex-tools-registry-DPQHcZUW.js";import"./credential-patterns-DqicUg9o.js";import"./apex-tools-dispatch-DsBmALAD.js";let s=null;function C(){s?.cleanup(),s=null}function g(i){return i.replace(/[&<>"']/g,b=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[b]??b)}const T="apex_v13_chat_auto_read";function R(){try{return localStorage.getItem(T)==="1"}catch{return!1}}function I(i){try{localStorage.setItem(T,i?"1":"0")}catch{}}async function P(i){try{const b=await d(()=>import("./voice-C504Jd_V.js").then(t=>t.a),__vite__mapDeps([0,1]),import.meta.url),{listVoices:v,getActiveVoice:p,setActiveVoice:u,speak:x,stopAll:f}=b,m=i.querySelector("#ax-settings-auto-read"),w=i.querySelector("#ax-voice-current"),h=i.querySelector("#ax-voice-list"),o=i.querySelectorAll(".ax-voice-cat-btn");if(!h)return;m&&(m.checked=R(),s.bind(m,"change",()=>{I(m.checked),(async()=>{const{toast:t}=await d(async()=>{const{toast:a}=await import("./toast-Dgg9rcIP.js");return{toast:a}},__vite__mapDeps([2,3]),import.meta.url);t.success(m.checked?"Lecture auto activée":"Lecture auto désactivée")})()}));const r=()=>{if(!w)return;const t=p(),n=v().find(l=>l.id===t);w.textContent=n?`Voix active : ${n.emoji??"🔊"} ${n.name} (${n.category})`:`Voix active : ${t}`};r();const c=t=>{const a=v(),n=t==="all"?a:a.filter(e=>e.category===t),l=p();h.innerHTML=n.map(e=>{const y=e.id===l,_=e.emoji??(e.category==="pro"?"🎙️":e.category==="fun"?"🎉":"🎨"),$=e.description?g(e.description):"",k=y?"background:rgba(232,184,48,0.15);border-color:rgba(232,184,48,0.45)":"background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.06)";return`
            <div class="ax-voice-item" data-voice-id="${g(e.id)}" style="display:flex;align-items:center;gap:8px;padding:10px;margin-bottom:6px;border:1px solid;border-radius:8px;${k}">
              <span style="font-size:18px">${_}</span>
              <div style="flex:1;min-width:0">
                <div style="color:#fff;font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${g(e.name)}${y?' <span style="color:#e8b830;font-size:11px">★ active</span>':""}</div>
                <div style="color:rgba(255,255,255,0.5);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${g(e.category)}${$?" · "+$:""}</div>
              </div>
              <button class="ax-voice-test-btn" data-test-voice="${g(e.id)}" title="Tester cette voix" aria-label="Tester ${g(e.name)}" style="min-width:36px;height:36px;border-radius:8px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.3);cursor:pointer;font-size:14px">▶</button>
              <button class="ax-voice-set-btn" data-set-voice="${g(e.id)}" title="Définir comme voix par défaut" aria-label="Définir ${g(e.name)} par défaut" style="min-width:36px;height:36px;border-radius:8px;background:rgba(232,184,48,0.15);color:#e8b830;border:1px solid rgba(232,184,48,0.3);cursor:pointer;font-size:14px">★</button>
            </div>
          `}).join("")};c("all"),o.forEach(t=>{s.bind(t,"click",()=>{const a=t.getAttribute("data-cat");a&&c(a)})}),s.bind(h,"click",t=>{const a=t.target,n=a.closest("[data-test-voice]"),l=a.closest("[data-set-voice]");if(n){const e=n.getAttribute("data-test-voice");if(!e)return;(async()=>{f();const y=await x("Bonjour Kevin, je suis ta voix.",e);if(!y.ok){const{toast:_}=await d(async()=>{const{toast:$}=await import("./toast-Dgg9rcIP.js");return{toast:$}},__vite__mapDeps([2,3]),import.meta.url);_.warn(`Test échoué : ${y.reason??"erreur"}`)}})();return}if(l){const e=l.getAttribute("data-set-voice");if(!e)return;(async()=>{await u(e),r();const y=i.querySelector(".ax-voice-cat-btn[data-cat]:focus")?.getAttribute("data-cat")??"all";c(y);const{toast:_}=await d(async()=>{const{toast:z}=await import("./toast-Dgg9rcIP.js");return{toast:z}},__vite__mapDeps([2,3]),import.meta.url),k=v().find(z=>z.id===e);_.success(k?`Voix par défaut : ${k.name}`:"Voix mise à jour")})()}})}catch(b){A.warn("feature-settings","wireVoiceSection failed",{err:b})}}function N(i){s?.cleanup(),s=V("settings");const b=S.get("user"),v=S.get("isAdmin")??!1,p="background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;margin-top:14px;transition:all 240ms cubic-bezier(0.16,1,0.3,1)",u="margin:0 0 12px;font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.01em;display:flex;align-items:center;gap:10px",x="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:linear-gradient(135deg,rgba(232,184,48,0.2),rgba(201,162,39,0.08));border:1px solid rgba(232,184,48,0.25);border-radius:10px;font-size:16px",f="width:100%;min-height:44px;padding:12px 16px;font-size:14px;font-weight:600;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1)";i.innerHTML=`
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
        <p style="color:rgba(255,255,255,0.55);margin:0;font-size:14px">Utilisateur : <strong style="color:rgba(255,255,255,0.9)">${g(b?.name??"inconnu")}</strong> ${v?'<span style="color:#e8b830">👑 Admin</span>':""}</p>
      </header>

      <section class="ax-modernized-card" style="${p};animation-delay:60ms">
        <h2 style="${u}"><span style="${x}">🔑</span> Clés API</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">Gère tes clés API (Anthropic, OpenAI, Stripe, etc.) dans le Coffre sécurisé.</p>
        <button class="ax-btn ax-btn-primary" data-nav-route="vault" style="${f};background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none">🔐 Ouvrir le Coffre</button>
      </section>

      <section class="ax-modernized-card" style="${p};animation-delay:100ms">
        <h2 style="${u}"><span style="${x}">🎨</span> Apparence</h2>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px">
          <span style="color:rgba(255,255,255,0.7);font-size:14px">Thème actuel</span>
          <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(232,184,48,0.12);color:#e8b830;border-radius:24px;font-size:12px;font-weight:700;letter-spacing:0.04em">
            <span style="width:8px;height:8px;background:#e8b830;border-radius:50%;box-shadow:0 0 10px #e8b830"></span> DARK
          </span>
        </div>
      </section>

      <section class="ax-modernized-card" style="${p};animation-delay:140ms">
        <h2 style="${u}"><span style="${x}">🔔</span> Notifications</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">Active les notifications push pour rester informé en temps réel.</p>
        <button class="ax-btn ax-btn-secondary" id="ax-settings-notif-test" style="${f};background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3)">🔔 Tester notification push</button>
      </section>

      <section class="ax-modernized-card" style="${p};animation-delay:180ms">
        <h2 style="${u}"><span style="${x}">🧠</span> Mémoire externe</h2>
        <p style="margin:0 0 10px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Backup mémoire vers Notion / GitHub Gist / Firebase. Tokens lus depuis le Coffre.
        </p>
        <div id="ax-memory-bridge-status" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-memory-bridge-sync" style="${f};background:rgba(160,96,255,0.15);color:#a060ff;border:1px solid rgba(160,96,255,0.3)">🔄 Sync maintenant</button>
      </section>

      <section class="ax-modernized-card" style="${p};animation-delay:220ms">
        <h2 style="${u}"><span style="${x}">📊</span> Conso API temps réel</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Apex surveille ta conso et détecte si une clé est utilisée anormalement (potentielle compromission).
        </p>
        <button class="ax-btn ax-btn-secondary" id="ax-conso-scan" style="${f};margin-bottom:10px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.3)">🔍 Scanner toutes mes API maintenant</button>
        <div id="ax-conso-results" style="margin-top:12px;font-size:13px"></div>
      </section>

      <section class="ax-modernized-card" style="${p};animation-delay:240ms">
        <h2 style="${u}"><span style="${x}">🔊</span> Voix &amp; Lecture</h2>
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

      <section class="ax-modernized-card" style="${p};animation-delay:280ms">
        <h2 style="${u}"><span style="${x}">🔐</span> Compte</h2>
        <button class="ax-btn ax-btn-danger" id="ax-settings-logout" style="${f};background:rgba(255,91,91,0.15);color:#ff5b5b;border:1px solid rgba(255,91,91,0.3)">🚪 Se déconnecter</button>
      </section>

      <p style="margin-top:32px;text-align:center"><a href="#chat" style="color:#e8b830;text-decoration:none;font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:rgba(232,184,48,0.08);border-radius:24px;border:1px solid rgba(232,184,48,0.2);transition:all 200ms">← Retour chat</a></p>
    </div>
  `,(async()=>{try{const{memoryBridge:o}=await d(async()=>{const{memoryBridge:a}=await import("./memory-bridge-DoFVSIe-.js");return{memoryBridge:a}},__vite__mapDeps([4,5,0,1,6,7]),import.meta.url),r=i.querySelector("#ax-memory-bridge-status"),c=i.querySelector("#ax-memory-bridge-sync"),t=()=>{if(!r)return;const a=o.getHealth(),n=o.getStatus(),l=n.filter(e=>e.last_success).length;r.textContent=`${a.backends_configured} backends configurés · ${l}/${n.length} dernier sync OK`};t(),c&&s&&s.bind(c,"click",()=>{(async()=>{c&&(c.disabled=!0);const a=await o.runAutoSync(),n=a.filter(e=>e.ok).length,{toast:l}=await d(async()=>{const{toast:e}=await import("./toast-Dgg9rcIP.js");return{toast:e}},__vite__mapDeps([2,3]),import.meta.url);a.length===0?l.warn("Aucun backend configuré"):n===a.length?l.success(`Sync OK (${n}/${a.length})`):l.warn(`Sync partielle (${n}/${a.length})`),t(),c&&(c.disabled=!1)})()})}catch(o){A.warn("feature-settings","memory-bridge wire failed",{err:o})}})();const m=i.querySelector("#ax-conso-scan");m&&s&&s.bind(m,"click",()=>{(async()=>{try{const{consumptionAnomalyDetector:o}=await d(async()=>{const{consumptionAnomalyDetector:t}=await import("./consumption-anomaly-detector-CP-PF8iO.js");return{consumptionAnomalyDetector:t}},__vite__mapDeps([8,0,1,9,10,5,6,11,12]),import.meta.url),r=o.scanAllVerbose(),c=i.querySelector("#ax-conso-results");if(!c)return;c.innerHTML=r.map(t=>{const a=t.severity==="critical"?"#ff4444":t.severity==="high"?"#ff8844":t.severity==="medium"?"#ffaa00":t.severity==="low"?"#88aaff":"#22cc77",n=t.severity==="critical"?"🚨":t.severity==="high"?"⚠️":t.severity==="medium"?"🟡":t.severity==="low"?"🔵":"✅";return`<div style="background:rgba(255,255,255,0.03);border-left:3px solid ${a};padding:8px 12px;margin-top:6px;border-radius:4px">
            <strong style="color:${a}">${n} ${t.service}</strong>
            <div style="font-size:12px;color:var(--ax-text-dim);margin-top:4px">${t.reason}</div>
            <div style="font-size:11px;margin-top:4px">${t.recommended_action}</div>
            ${t.recharge_url?`<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><a href="${t.recharge_url}" target="_blank" rel="noopener" style="color:#c9a227;font-size:11px">💳 Recharge →</a> <a href="${t.rotate_url}" target="_blank" rel="noopener" style="color:#c9a227;font-size:11px">🔄 Rotate →</a></div>`:""}
          </div>`}).join("")}catch(o){A.warn("feature-settings","conso scan failed",{err:o})}})()}),i.querySelectorAll("[data-nav-route]").forEach(o=>{s.bind(o,"click",()=>{const r=o.getAttribute("data-nav-route");r&&(location.hash="#"+r)})});const w=i.querySelector("#ax-settings-logout");w&&s&&s.bind(w,"click",()=>{(async()=>{const{auth:o}=await d(async()=>{const{auth:r}=await import("./auth-8h8ANMds.js");return{auth:r}},__vite__mapDeps([13,5,0,1,6,14,15]),import.meta.url);o.logout(),location.hash="#login"})()}),P(i);const h=i.querySelector("#ax-settings-notif-test");h&&s&&s.bind(h,"click",()=>{(async()=>{try{if("Notification"in window&&Notification.permission==="granted")new Notification("Test Apex",{body:"Si tu vois ça, push notif fonctionne ✅"});else if("Notification"in window)if(await Notification.requestPermission()==="granted")new Notification("Test Apex",{body:"Push activé ✅"});else{const{toast:r}=await d(async()=>{const{toast:c}=await import("./toast-Dgg9rcIP.js");return{toast:c}},__vite__mapDeps([2,3]),import.meta.url);r.warn("Permission notifications refusée")}else{const{toast:o}=await d(async()=>{const{toast:r}=await import("./toast-Dgg9rcIP.js");return{toast:r}},__vite__mapDeps([2,3]),import.meta.url);o.warn("Notifications non supportées par ce navigateur")}}catch{const{toast:o}=await d(async()=>{const{toast:r}=await import("./toast-Dgg9rcIP.js");return{toast:r}},__vite__mapDeps([2,3]),import.meta.url);o.warn("Test notification échoué")}})()}),A.info("feature-settings","rendered")}export{C as dispose,N as render,P as wireVoiceSection};
//# sourceMappingURL=index-8rZv_Brn.js.map
