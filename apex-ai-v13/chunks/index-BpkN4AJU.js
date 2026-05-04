const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./auth-BUqGgsFj.js","../core/main-DfrxuvLS.js","../assets/css/main-Bng3LWQS.css","./toast-BkOpdP-z.js","./haptic-BUEqXK0N.js"])))=>i.map(i=>d[i]);
import{s as e,_ as a,l as p}from"../core/main-DfrxuvLS.js";function c(o){const n=e.get("user"),r=e.get("isAdmin")??!1;o.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:600px;margin:0 auto">
      <h1 style="margin:0 0 16px;color:#c9a227">⚙️ Réglages</h1>
      <p style="color:var(--ax-text-dim)">Utilisateur : <strong>${n?.name??"inconnu"}</strong> ${r?"👑":""}</p>

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
        <h2 style="margin:0 0 12px;font-size:16px">🔐 Compte</h2>
        <button class="ax-btn ax-btn-danger" id="ax-settings-logout" style="width:100%">Se déconnecter</button>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `,o.querySelector("#ax-settings-logout")?.addEventListener("click",()=>{(async()=>{const{auth:i}=await a(async()=>{const{auth:t}=await import("./auth-BUqGgsFj.js");return{auth:t}},__vite__mapDeps([0,1,2]),import.meta.url);i.logout(),location.hash="#login"})()}),o.querySelector("#ax-settings-notif-test")?.addEventListener("click",()=>{(async()=>{try{if("Notification"in window&&Notification.permission==="granted")new Notification("Test Apex",{body:"Si tu vois ça, push notif fonctionne ✅"});else if("Notification"in window)if(await Notification.requestPermission()==="granted")new Notification("Test Apex",{body:"Push activé ✅"});else{const{toast:t}=await a(async()=>{const{toast:s}=await import("./toast-BkOpdP-z.js");return{toast:s}},__vite__mapDeps([3,4]),import.meta.url);t.warn("Permission notifications refusée")}else{const{toast:i}=await a(async()=>{const{toast:t}=await import("./toast-BkOpdP-z.js");return{toast:t}},__vite__mapDeps([3,4]),import.meta.url);i.warn("Notifications non supportées par ce navigateur")}}catch{const{toast:i}=await a(async()=>{const{toast:t}=await import("./toast-BkOpdP-z.js");return{toast:t}},__vite__mapDeps([3,4]),import.meta.url);i.warn("Test notification échoué")}})()}),p.info("feature-settings","rendered")}export{c as render};
//# sourceMappingURL=index-BpkN4AJU.js.map
