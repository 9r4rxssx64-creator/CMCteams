const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./memory-bridge-Bd7zVBHo.js","../core/main-BE4AFc6t.js","../assets/css/main-Bng3LWQS.css","./audit-log-DFrKmPvx.js","./observability-CwcWbRME.js","./persistent-memory-store-DQd22xuo.js","./toast-BkOpdP-z.js","./haptic-BUEqXK0N.js","./auth-iTimA4BI.js"])))=>i.map(i=>d[i]);
import{s as p,_ as r,l}from"../core/main-BE4AFc6t.js";function m(o){const u=p.get("user"),g=p.get("isAdmin")??!1;o.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:600px;margin:0 auto">
      <h1 style="margin:0 0 16px;color:#c9a227">⚙️ Réglages</h1>
      <p style="color:var(--ax-text-dim)">Utilisateur : <strong>${u?.name??"inconnu"}</strong> ${g?"👑":""}</p>

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
        <h2 style="margin:0 0 12px;font-size:16px">🔐 Compte</h2>
        <button class="ax-btn ax-btn-danger" id="ax-settings-logout" style="width:100%">Se déconnecter</button>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `,(async()=>{try{const{memoryBridge:t}=await r(async()=>{const{memoryBridge:i}=await import("./memory-bridge-Bd7zVBHo.js");return{memoryBridge:i}},__vite__mapDeps([0,1,2,3,4,5]),import.meta.url),e=o.querySelector("#ax-memory-bridge-status"),a=o.querySelector("#ax-memory-bridge-sync"),d=()=>{if(!e)return;const i=t.getHealth(),n=t.getStatus(),s=n.filter(c=>c.last_success).length;e.textContent=`${i.backends_configured} backends configurés · ${s}/${n.length} dernier sync OK`};d(),a?.addEventListener("click",()=>{(async()=>{a&&(a.disabled=!0);const i=await t.runAutoSync(),n=i.filter(c=>c.ok).length,{toast:s}=await r(async()=>{const{toast:c}=await import("./toast-BkOpdP-z.js");return{toast:c}},__vite__mapDeps([6,7]),import.meta.url);i.length===0?s.warn("Aucun backend configuré"):n===i.length?s.success(`Sync OK (${n}/${i.length})`):s.warn(`Sync partielle (${n}/${i.length})`),d(),a&&(a.disabled=!1)})()})}catch(t){l.warn("feature-settings","memory-bridge wire failed",{err:t})}})(),o.querySelector("#ax-settings-logout")?.addEventListener("click",()=>{(async()=>{const{auth:t}=await r(async()=>{const{auth:e}=await import("./auth-iTimA4BI.js");return{auth:e}},__vite__mapDeps([8,1,2]),import.meta.url);t.logout(),location.hash="#login"})()}),o.querySelector("#ax-settings-notif-test")?.addEventListener("click",()=>{(async()=>{try{if("Notification"in window&&Notification.permission==="granted")new Notification("Test Apex",{body:"Si tu vois ça, push notif fonctionne ✅"});else if("Notification"in window)if(await Notification.requestPermission()==="granted")new Notification("Test Apex",{body:"Push activé ✅"});else{const{toast:e}=await r(async()=>{const{toast:a}=await import("./toast-BkOpdP-z.js");return{toast:a}},__vite__mapDeps([6,7]),import.meta.url);e.warn("Permission notifications refusée")}else{const{toast:t}=await r(async()=>{const{toast:e}=await import("./toast-BkOpdP-z.js");return{toast:e}},__vite__mapDeps([6,7]),import.meta.url);t.warn("Notifications non supportées par ce navigateur")}}catch{const{toast:t}=await r(async()=>{const{toast:e}=await import("./toast-BkOpdP-z.js");return{toast:e}},__vite__mapDeps([6,7]),import.meta.url);t.warn("Test notification échoué")}})()}),l.info("feature-settings","rendered")}export{m as render};
//# sourceMappingURL=index-DA7RkFfh.js.map
