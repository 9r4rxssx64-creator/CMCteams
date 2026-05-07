const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./memory-bridge-B7473zN2.js","./apex-tools-dispatch-B5F6KHQD.js","./monitoring-675b-Ybt.js","./apex-tools-registry-oQuNaPP9.js","./persistent-memory-store-cUdktmox.js","./toast-Dgg9rcIP.js","./haptic-BUEqXK0N.js","./consumption-anomaly-detector-Bax4LSey.js","./consumption-monitor-BHna91Uh.js","./links-registry-C0ncmn8i.js","./push-notifications-D763BIep.js","./tokens-dashboard-C5ZzZyK6.js","./auth-BGN24lt0.js","../core/main-6t1HpfGY.js","../assets/css/main-rhfGvOFL.css"])))=>i.map(i=>d[i]);
import{_ as s}from"./apex-tools-dispatch-B5F6KHQD.js";import{l as x}from"./monitoring-675b-Ybt.js";import{s as b}from"../core/main-6t1HpfGY.js";import"./apex-tools-registry-oQuNaPP9.js";function y(i){return i.replace(/[&<>"']/g,u=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[u]??u)}function k(i){const u=b.get("user"),f=b.get("isAdmin")??!1,c="background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;margin-top:14px;transition:all 240ms cubic-bezier(0.16,1,0.3,1)",l="margin:0 0 12px;font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.01em;display:flex;align-items:center;gap:10px",d="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:linear-gradient(135deg,rgba(232,184,48,0.2),rgba(201,162,39,0.08));border:1px solid rgba(232,184,48,0.25);border-radius:10px;font-size:16px",p="width:100%;min-height:44px;padding:12px 16px;font-size:14px;font-weight:600;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1)";i.innerHTML=`
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
        <p style="color:rgba(255,255,255,0.55);margin:0;font-size:14px">Utilisateur : <strong style="color:rgba(255,255,255,0.9)">${y(u?.name??"inconnu")}</strong> ${f?'<span style="color:#e8b830">👑 Admin</span>':""}</p>
      </header>

      <section class="ax-modernized-card" style="${c};animation-delay:60ms">
        <h2 style="${l}"><span style="${d}">🔑</span> Clés API</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">Gère tes clés API (Anthropic, OpenAI, Stripe, etc.) dans le Coffre sécurisé.</p>
        <button class="ax-btn ax-btn-primary" data-nav-route="vault" style="${p};background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none">🔐 Ouvrir le Coffre</button>
      </section>

      <section class="ax-modernized-card" style="${c};animation-delay:100ms">
        <h2 style="${l}"><span style="${d}">🎨</span> Apparence</h2>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px">
          <span style="color:rgba(255,255,255,0.7);font-size:14px">Thème actuel</span>
          <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(232,184,48,0.12);color:#e8b830;border-radius:24px;font-size:12px;font-weight:700;letter-spacing:0.04em">
            <span style="width:8px;height:8px;background:#e8b830;border-radius:50%;box-shadow:0 0 10px #e8b830"></span> DARK
          </span>
        </div>
      </section>

      <section class="ax-modernized-card" style="${c};animation-delay:140ms">
        <h2 style="${l}"><span style="${d}">🔔</span> Notifications</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">Active les notifications push pour rester informé en temps réel.</p>
        <button class="ax-btn ax-btn-secondary" id="ax-settings-notif-test" style="${p};background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3)">🔔 Tester notification push</button>
      </section>

      <section class="ax-modernized-card" style="${c};animation-delay:180ms">
        <h2 style="${l}"><span style="${d}">🧠</span> Mémoire externe</h2>
        <p style="margin:0 0 10px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Backup mémoire vers Notion / GitHub Gist / Firebase. Tokens lus depuis le Coffre.
        </p>
        <div id="ax-memory-bridge-status" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-memory-bridge-sync" style="${p};background:rgba(160,96,255,0.15);color:#a060ff;border:1px solid rgba(160,96,255,0.3)">🔄 Sync maintenant</button>
      </section>

      <section class="ax-modernized-card" style="${c};animation-delay:220ms">
        <h2 style="${l}"><span style="${d}">📊</span> Conso API temps réel</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Apex surveille ta conso et détecte si une clé est utilisée anormalement (potentielle compromission).
        </p>
        <button class="ax-btn ax-btn-secondary" id="ax-conso-scan" style="${p};margin-bottom:10px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.3)">🔍 Scanner toutes mes API maintenant</button>
        <div id="ax-conso-results" style="margin-top:12px;font-size:13px"></div>
      </section>

      <section class="ax-modernized-card" style="${c};animation-delay:260ms">
        <h2 style="${l}"><span style="${d}">🔐</span> Compte</h2>
        <button class="ax-btn ax-btn-danger" id="ax-settings-logout" style="${p};background:rgba(255,91,91,0.15);color:#ff5b5b;border:1px solid rgba(255,91,91,0.3)">🚪 Se déconnecter</button>
      </section>

      <p style="margin-top:32px;text-align:center"><a href="#chat" style="color:#e8b830;text-decoration:none;font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:rgba(232,184,48,0.08);border-radius:24px;border:1px solid rgba(232,184,48,0.2);transition:all 200ms">← Retour chat</a></p>
    </div>
  `,(async()=>{try{const{memoryBridge:e}=await s(async()=>{const{memoryBridge:n}=await import("./memory-bridge-B7473zN2.js");return{memoryBridge:n}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),a=i.querySelector("#ax-memory-bridge-status"),r=i.querySelector("#ax-memory-bridge-sync"),t=()=>{if(!a)return;const n=e.getHealth(),o=e.getStatus(),g=o.filter(m=>m.last_success).length;a.textContent=`${n.backends_configured} backends configurés · ${g}/${o.length} dernier sync OK`};t(),r?.addEventListener("click",()=>{(async()=>{r&&(r.disabled=!0);const n=await e.runAutoSync(),o=n.filter(m=>m.ok).length,{toast:g}=await s(async()=>{const{toast:m}=await import("./toast-Dgg9rcIP.js");return{toast:m}},__vite__mapDeps([5,6]),import.meta.url);n.length===0?g.warn("Aucun backend configuré"):o===n.length?g.success(`Sync OK (${o}/${n.length})`):g.warn(`Sync partielle (${o}/${n.length})`),t(),r&&(r.disabled=!1)})()})}catch(e){x.warn("feature-settings","memory-bridge wire failed",{err:e})}})(),i.querySelector("#ax-conso-scan")?.addEventListener("click",()=>{(async()=>{try{const{consumptionAnomalyDetector:e}=await s(async()=>{const{consumptionAnomalyDetector:t}=await import("./consumption-anomaly-detector-Bax4LSey.js");return{consumptionAnomalyDetector:t}},__vite__mapDeps([7,2,3,8,9,1,10,11]),import.meta.url),a=e.scanAllVerbose(),r=i.querySelector("#ax-conso-results");if(!r)return;r.innerHTML=a.map(t=>{const n=t.severity==="critical"?"#ff4444":t.severity==="high"?"#ff8844":t.severity==="medium"?"#ffaa00":t.severity==="low"?"#88aaff":"#22cc77",o=t.severity==="critical"?"🚨":t.severity==="high"?"⚠️":t.severity==="medium"?"🟡":t.severity==="low"?"🔵":"✅";return`<div style="background:rgba(255,255,255,0.03);border-left:3px solid ${n};padding:8px 12px;margin-top:6px;border-radius:4px">
            <strong style="color:${n}">${o} ${t.service}</strong>
            <div style="font-size:12px;color:var(--ax-text-dim);margin-top:4px">${t.reason}</div>
            <div style="font-size:11px;margin-top:4px">${t.recommended_action}</div>
            ${t.recharge_url?`<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><a href="${t.recharge_url}" target="_blank" rel="noopener" style="color:#c9a227;font-size:11px">💳 Recharge →</a> <a href="${t.rotate_url}" target="_blank" rel="noopener" style="color:#c9a227;font-size:11px">🔄 Rotate →</a></div>`:""}
          </div>`}).join("")}catch(e){x.warn("feature-settings","conso scan failed",{err:e})}})()}),i.querySelectorAll("[data-nav-route]").forEach(e=>{e.addEventListener("click",()=>{const a=e.getAttribute("data-nav-route");a&&(location.hash="#"+a)})}),i.querySelector("#ax-settings-logout")?.addEventListener("click",()=>{(async()=>{const{auth:e}=await s(async()=>{const{auth:a}=await import("./auth-BGN24lt0.js");return{auth:a}},__vite__mapDeps([12,1,2,3,13,14]),import.meta.url);e.logout(),location.hash="#login"})()}),i.querySelector("#ax-settings-notif-test")?.addEventListener("click",()=>{(async()=>{try{if("Notification"in window&&Notification.permission==="granted")new Notification("Test Apex",{body:"Si tu vois ça, push notif fonctionne ✅"});else if("Notification"in window)if(await Notification.requestPermission()==="granted")new Notification("Test Apex",{body:"Push activé ✅"});else{const{toast:a}=await s(async()=>{const{toast:r}=await import("./toast-Dgg9rcIP.js");return{toast:r}},__vite__mapDeps([5,6]),import.meta.url);a.warn("Permission notifications refusée")}else{const{toast:e}=await s(async()=>{const{toast:a}=await import("./toast-Dgg9rcIP.js");return{toast:a}},__vite__mapDeps([5,6]),import.meta.url);e.warn("Notifications non supportées par ce navigateur")}}catch{const{toast:e}=await s(async()=>{const{toast:a}=await import("./toast-Dgg9rcIP.js");return{toast:a}},__vite__mapDeps([5,6]),import.meta.url);e.warn("Test notification échoué")}})()}),x.info("feature-settings","rendered")}export{k as render};
//# sourceMappingURL=index-CyPicyMx.js.map
