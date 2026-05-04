const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./memory-bridge-CZqk9JjU.js","../core/main-O0Blisa8.js","../assets/css/main-rhfGvOFL.css","./audit-log-B3VLZ-Fj.js","./observability-DluYvg_I.js","./persistent-memory-store-DWY-WfyS.js","./toast-Dgg9rcIP.js","./haptic-BUEqXK0N.js","./consumption-anomaly-detector-BAEcHFXi.js","./consumption-monitor-DNxhVMkt.js","./links-registry-CK8HtQnE.js","./firebase-DOD1Wv15.js","./push-notifications-CuaCSx26.js","./tokens-dashboard-C5ZzZyK6.js","./auth-pSgXFnm8.js"])))=>i.map(i=>d[i]);
import{s as p,_ as s,l}from"../core/main-O0Blisa8.js";function m(o){const u=p.get("user"),x=p.get("isAdmin")??!1;o.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:600px;margin:0 auto">
      <h1 style="margin:0 0 16px;color:#c9a227">⚙️ Réglages</h1>
      <p style="color:var(--ax-text-dim)">Utilisateur : <strong>${u?.name??"inconnu"}</strong> ${x?"👑":""}</p>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;margin-top:16px">
        <h2 style="margin:0 0 12px;font-size:16px">🔑 Clés API</h2>
        <p style="margin:0 0 12px;color:var(--ax-text-dim);font-size:14px">Gère tes clés API (Anthropic, OpenAI, Stripe, etc.)</p>
        <button class="ax-btn ax-btn-primary" onclick="location.hash='#chat'" style="width:100%">Ouvrir le Coffre (depuis chat)</button>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;margin-top:12px">
        <h2 style="margin:0 0 12px;font-size:16px">🎨 Apparence</h2>
        <p style="margin:0;color:var(--ax-text-dim);font-size:14px">Thème : <strong>Dark</strong> (clair bientôt)</p>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;margin-top:12px">
        <h2 style="margin:0 0 12px;font-size:16px">🔔 Notifications</h2>
        <button class="ax-btn ax-btn-secondary" id="ax-settings-notif-test" style="width:100%">Tester notification push</button>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;margin-top:12px">
        <h2 style="margin:0 0 12px;font-size:16px">🧠 Mémoire externe</h2>
        <p style="margin:0 0 8px;color:var(--ax-text-dim);font-size:13px">
          Backup mémoire vers Notion / GitHub Gist / Firebase. Tokens lus depuis le Coffre.
        </p>
        <div id="ax-memory-bridge-status" style="margin:8px 0;font-size:13px;color:var(--ax-text-dim)"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-memory-bridge-sync" style="width:100%">Sync maintenant</button>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;margin-top:12px">
        <h2 style="margin:0 0 12px;font-size:16px">📊 Conso API temps réel + détection anomalies</h2>
        <p style="margin:0 0 8px;color:var(--ax-text-dim);font-size:13px">
          Apex surveille ta conso et détecte si une clé est utilisée anormalement (potentielle compromission).
        </p>
        <button class="ax-btn ax-btn-secondary" id="ax-conso-scan" style="width:100%;margin-bottom:8px">🔍 Scanner toutes mes API maintenant</button>
        <div id="ax-conso-results" style="margin-top:12px;font-size:13px"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;margin-top:12px">
        <h2 style="margin:0 0 12px;font-size:16px">🔐 Compte</h2>
        <button class="ax-btn ax-btn-danger" id="ax-settings-logout" style="width:100%">Se déconnecter</button>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `,(async()=>{try{const{memoryBridge:e}=await s(async()=>{const{memoryBridge:a}=await import("./memory-bridge-CZqk9JjU.js");return{memoryBridge:a}},__vite__mapDeps([0,1,2,3,4,5]),import.meta.url),i=o.querySelector("#ax-memory-bridge-status"),n=o.querySelector("#ax-memory-bridge-sync"),t=()=>{if(!i)return;const a=e.getHealth(),r=e.getStatus(),c=r.filter(d=>d.last_success).length;i.textContent=`${a.backends_configured} backends configurés · ${c}/${r.length} dernier sync OK`};t(),n?.addEventListener("click",()=>{(async()=>{n&&(n.disabled=!0);const a=await e.runAutoSync(),r=a.filter(d=>d.ok).length,{toast:c}=await s(async()=>{const{toast:d}=await import("./toast-Dgg9rcIP.js");return{toast:d}},__vite__mapDeps([6,7]),import.meta.url);a.length===0?c.warn("Aucun backend configuré"):r===a.length?c.success(`Sync OK (${r}/${a.length})`):c.warn(`Sync partielle (${r}/${a.length})`),t(),n&&(n.disabled=!1)})()})}catch(e){l.warn("feature-settings","memory-bridge wire failed",{err:e})}})(),o.querySelector("#ax-conso-scan")?.addEventListener("click",()=>{(async()=>{try{const{consumptionAnomalyDetector:e}=await s(async()=>{const{consumptionAnomalyDetector:t}=await import("./consumption-anomaly-detector-BAEcHFXi.js");return{consumptionAnomalyDetector:t}},__vite__mapDeps([8,1,2,3,9,10,11,12,13]),import.meta.url),i=e.scanAllVerbose(),n=o.querySelector("#ax-conso-results");if(!n)return;n.innerHTML=i.map(t=>{const a=t.severity==="critical"?"#ff4444":t.severity==="high"?"#ff8844":t.severity==="medium"?"#ffaa00":t.severity==="low"?"#88aaff":"#22cc77",r=t.severity==="critical"?"🚨":t.severity==="high"?"⚠️":t.severity==="medium"?"🟡":t.severity==="low"?"🔵":"✅";return`<div style="background:rgba(255,255,255,0.03);border-left:3px solid ${a};padding:8px 12px;margin-top:6px;border-radius:4px">
            <strong style="color:${a}">${r} ${t.service}</strong>
            <div style="font-size:12px;color:var(--ax-text-dim);margin-top:4px">${t.reason}</div>
            <div style="font-size:11px;margin-top:4px">${t.recommended_action}</div>
            ${t.recharge_url?`<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><a href="${t.recharge_url}" target="_blank" rel="noopener" style="color:#c9a227;font-size:11px">💳 Recharge →</a> <a href="${t.rotate_url}" target="_blank" rel="noopener" style="color:#c9a227;font-size:11px">🔄 Rotate →</a></div>`:""}
          </div>`}).join("")}catch(e){l.warn("feature-settings","conso scan failed",{err:e})}})()}),o.querySelector("#ax-settings-logout")?.addEventListener("click",()=>{(async()=>{const{auth:e}=await s(async()=>{const{auth:i}=await import("./auth-pSgXFnm8.js");return{auth:i}},__vite__mapDeps([14,1,2]),import.meta.url);e.logout(),location.hash="#login"})()}),o.querySelector("#ax-settings-notif-test")?.addEventListener("click",()=>{(async()=>{try{if("Notification"in window&&Notification.permission==="granted")new Notification("Test Apex",{body:"Si tu vois ça, push notif fonctionne ✅"});else if("Notification"in window)if(await Notification.requestPermission()==="granted")new Notification("Test Apex",{body:"Push activé ✅"});else{const{toast:i}=await s(async()=>{const{toast:n}=await import("./toast-Dgg9rcIP.js");return{toast:n}},__vite__mapDeps([6,7]),import.meta.url);i.warn("Permission notifications refusée")}else{const{toast:e}=await s(async()=>{const{toast:i}=await import("./toast-Dgg9rcIP.js");return{toast:i}},__vite__mapDeps([6,7]),import.meta.url);e.warn("Notifications non supportées par ce navigateur")}}catch{const{toast:e}=await s(async()=>{const{toast:i}=await import("./toast-Dgg9rcIP.js");return{toast:i}},__vite__mapDeps([6,7]),import.meta.url);e.warn("Test notification échoué")}})()}),l.info("feature-settings","rendered")}export{m as render};
//# sourceMappingURL=index-CA8hxEMq.js.map
