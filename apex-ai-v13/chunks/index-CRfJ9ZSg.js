const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-3uBGKGRH.js","./apex-kb-CJ6ngxm2.js","./credential-patterns-guxfirLX.js","./multi-source-analyze-CjdivhdY.js","./auth-DM3Fner2.js","../assets/css/main-DkJDY-ZY.css"])))=>i.map(i=>d[i]);
import{_ as l}from"./apex-kb-CJ6ngxm2.js";import{c as R}from"./listener-cleanup-Y2rGGxxX.js";import{l as S}from"./monitoring-3uBGKGRH.js";import{s as z}from"../core/main-DUgDPO3o.js";import{c as P}from"./csp-style-helper-BisGRi53.js";import"./credential-patterns-guxfirLX.js";import"./multi-source-analyze-CjdivhdY.js";let n=null;function M(){n?.cleanup(),n=null}function b(r){return r.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[m]??m)}const T="apex_v13_chat_auto_read";function I(){try{return localStorage.getItem(T)==="1"}catch{return!1}}function O(r){try{localStorage.setItem(T,r?"1":"0")}catch{}}async function V(r){try{const m=await l(()=>import("./voice-DmRXx2Rz.js").then(t=>t.c),__vite__mapDeps([0,1,2]),import.meta.url),{listVoices:w,getActiveVoice:c,setActiveVoice:d,speak:p,stopAll:f}=m,y=r.querySelector("#ax-settings-auto-read"),_=r.querySelector("#ax-voice-current"),x=r.querySelector("#ax-voice-list"),h=r.querySelectorAll(".ax-voice-cat-btn");if(!x)return;y&&(y.checked=I(),n.bind(y,"change",()=>{O(y.checked),(async()=>{const{toast:t}=await l(async()=>{const{toast:a}=await import("./toast-ClsF1KRZ.js");return{toast:a}},[],import.meta.url);t.success(y.checked?"Lecture auto activée":"Lecture auto désactivée")})()}));const k=()=>{if(!_)return;const t=c(),i=w().find(o=>o.id===t);_.textContent=i?`Voix active : ${i.emoji??"🔊"} ${i.name} (${i.category})`:`Voix active : ${t}`};k();const v=t=>{const a=w(),i=t==="all"?a:a.filter(e=>e.category===t),o=c();x.innerHTML=i.map(e=>{const s=e.id===o,u=e.emoji??(e.category==="pro"?"🎙️":e.category==="fun"?"🎉":"🎨"),g=e.description?b(e.description):"",$=s?"background:rgba(232,184,48,0.15);border-color:rgba(232,184,48,0.45)":"background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.06)";return`
            <div class="ax-voice-item" data-voice-id="${b(e.id)}" style="display:flex;align-items:center;gap:8px;padding:10px;margin-bottom:6px;border:1px solid;border-radius:8px;${$}">
              <span style="font-size:18px">${u}</span>
              <div style="flex:1;min-width:0">
                <div style="color:#fff;font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${b(e.name)}${s?' <span style="color:#e8b830;font-size:11px">★ active</span>':""}</div>
                <div style="color:rgba(255,255,255,0.5);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${b(e.category)}${g?" · "+g:""}</div>
              </div>
              <button class="ax-voice-test-btn" data-test-voice="${b(e.id)}" title="Tester cette voix" aria-label="Tester ${b(e.name)}" style="min-width:44px;min-height:44px;width:44px;height:44px;border-radius:8px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.3);cursor:pointer;font-size:14px">▶</button>
              <button class="ax-voice-set-btn" data-set-voice="${b(e.id)}" title="Définir comme voix par défaut" aria-label="Définir ${b(e.name)} par défaut" style="min-width:44px;min-height:44px;width:44px;height:44px;border-radius:8px;background:rgba(232,184,48,0.15);color:#e8b830;border:1px solid rgba(232,184,48,0.3);cursor:pointer;font-size:14px">★</button>
            </div>
          `}).join("")};v("all"),h.forEach(t=>{n.bind(t,"click",()=>{const a=t.getAttribute("data-cat");a&&v(a)})}),n.bind(x,"click",t=>{const a=t.target,i=a.closest("[data-test-voice]"),o=a.closest("[data-set-voice]");if(i){const e=i.getAttribute("data-test-voice");if(!e)return;(async()=>{f();const s=await p("Bonjour Kevin, je suis ta voix.",e);if(!s.ok){const{toast:u}=await l(async()=>{const{toast:g}=await import("./toast-ClsF1KRZ.js");return{toast:g}},[],import.meta.url);u.warn(`Test échoué : ${s.reason??"erreur"}`)}})();return}if(o){const e=o.getAttribute("data-set-voice");if(!e)return;(async()=>{await d(e),k();const s=r.querySelector(".ax-voice-cat-btn[data-cat]:focus")?.getAttribute("data-cat")??"all";v(s);const{toast:u}=await l(async()=>{const{toast:A}=await import("./toast-ClsF1KRZ.js");return{toast:A}},[],import.meta.url),$=w().find(A=>A.id===e);u.success($?`Voix par défaut : ${$.name}`:"Voix mise à jour")})()}})}catch(m){S.warn("feature-settings","wireVoiceSection failed",{err:m})}}function j(r){n?.cleanup(),n=R("settings");const m=z.get("user"),w=z.get("isAdmin")??!1,c="background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;margin-top:14px;transition:all 240ms cubic-bezier(0.16,1,0.3,1)",d="margin:0 0 12px;font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.01em;display:flex;align-items:center;gap:10px",p="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:linear-gradient(135deg,rgba(232,184,48,0.2),rgba(201,162,39,0.08));border:1px solid rgba(232,184,48,0.25);border-radius:10px;font-size:16px",f="width:100%;min-height:44px;padding:12px 16px;font-size:14px;font-weight:600;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1)";r.innerHTML=P.withNonce(`
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
        <p style="color:rgba(255,255,255,0.55);margin:0;font-size:14px">Utilisateur : <strong style="color:rgba(255,255,255,0.9)">${b(m?.name??"inconnu")}</strong> ${w?'<span style="color:#e8b830">👑 Admin</span>':""}</p>
      </header>

      <section class="ax-modernized-card" style="${c};animation-delay:60ms">
        <h2 style="${d}"><span style="${p}">🔑</span> Clés API</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">Gère tes clés API (Anthropic, OpenAI, Stripe, etc.) dans le Coffre sécurisé.</p>
        <button class="ax-btn ax-btn-primary" data-nav-route="vault" style="${f};background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none">🔐 Ouvrir le Coffre</button>
      </section>

      <section class="ax-modernized-card" style="${c};animation-delay:100ms">
        <h2 style="${d}"><span style="${p}">🎨</span> Apparence</h2>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px">
          <span style="color:rgba(255,255,255,0.7);font-size:14px">Thème actuel</span>
          <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(232,184,48,0.12);color:#e8b830;border-radius:24px;font-size:12px;font-weight:700;letter-spacing:0.04em">
            <span style="width:8px;height:8px;background:#e8b830;border-radius:50%;box-shadow:0 0 10px #e8b830"></span> DARK
          </span>
        </div>
      </section>

      <section class="ax-modernized-card" style="${c};animation-delay:140ms">
        <h2 style="${d}"><span style="${p}">🔔</span> Notifications</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">Active les notifications push pour rester informé en temps réel.</p>
        <button class="ax-btn ax-btn-secondary" id="ax-settings-notif-test" style="${f};background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3)">🔔 Tester notification push</button>
      </section>

      <section class="ax-modernized-card" style="${c};animation-delay:180ms">
        <h2 style="${d}"><span style="${p}">🧠</span> Mémoire externe</h2>
        <p style="margin:0 0 10px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Backup mémoire vers Notion / GitHub Gist / Firebase. Tokens lus depuis le Coffre.
        </p>
        <div id="ax-memory-bridge-status" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-memory-bridge-sync" style="${f};background:rgba(160,96,255,0.15);color:#a060ff;border:1px solid rgba(160,96,255,0.3)">🔄 Sync maintenant</button>
      </section>

      <section class="ax-modernized-card" style="${c};animation-delay:220ms">
        <h2 style="${d}"><span style="${p}">📊</span> Conso API temps réel</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Apex surveille ta conso et détecte si une clé est utilisée anormalement (potentielle compromission).
        </p>
        <button class="ax-btn ax-btn-secondary" id="ax-conso-scan" style="${f};margin-bottom:10px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.3)">🔍 Scanner toutes mes API maintenant</button>
        <div id="ax-conso-results" style="margin-top:12px;font-size:13px"></div>
      </section>

      <section class="ax-modernized-card" style="${c};animation-delay:240ms">
        <h2 style="${d}"><span style="${p}">🔊</span> Voix &amp; Lecture</h2>
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

      <section class="ax-modernized-card" style="${c};animation-delay:250ms">
        <h2 style="${d}"><span style="${p}">🧰</span> Suggestions outils</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Quand Apex détecte un outil pertinent dans tes messages (Studio Music, Finance Pro, etc.), il l'affiche directement dans le chat en plus du toast.
        </p>
        <label style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:10px;cursor:pointer">
          <span style="color:rgba(255,255,255,0.85);font-size:14px">Cards outils dans le chat</span>
          <input type="checkbox" id="ax-settings-tools-auto-embed" aria-label="Afficher cards outils dans le chat" style="width:20px;height:20px;cursor:pointer">
        </label>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.4);font-size:12px;line-height:1.4">Décoche pour n'avoir que le toast (5s) sans card permanente. Le bouton ✕ sur chaque card permet aussi de la fermer.</p>
      </section>

      <section class="ax-modernized-card" style="${c};animation-delay:260ms">
        <h2 style="${d}"><span style="${p}">🔄</span> Mise à jour</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Si Apex reste bloqué sur une ancienne version malgré le reload (bug Safari iOS PWA cache), force le reset complet : Service Worker + caches + reload propre vers la dernière version.
        </p>
        <div id="ax-force-update-status" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-force-update-btn" style="${f};background:rgba(232,184,48,0.15);color:#e8b830;border:1px solid rgba(232,184,48,0.3)">🔄 Force reset PWA + reload</button>
      </section>

      <section class="ax-modernized-card" style="${c};animation-delay:280ms">
        <h2 style="${d}"><span style="${p}">🔐</span> Compte</h2>
        <button class="ax-btn ax-btn-danger" id="ax-settings-logout" style="${f};background:rgba(255,91,91,0.15);color:#ff5b5b;border:1px solid rgba(255,91,91,0.3)">🚪 Se déconnecter</button>
      </section>

      <p style="margin-top:32px;text-align:center"><a href="#chat" style="color:#e8b830;text-decoration:none;font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:rgba(232,184,48,0.08);border-radius:24px;border:1px solid rgba(232,184,48,0.2);transition:all 200ms">← Retour chat</a></p>
    </div>
  `),(async()=>{try{const{memoryBridge:t}=await l(async()=>{const{memoryBridge:e}=await import("./memory-bridge-BEYQRQ4W.js");return{memoryBridge:e}},__vite__mapDeps([1,0,2]),import.meta.url),a=r.querySelector("#ax-memory-bridge-status"),i=r.querySelector("#ax-memory-bridge-sync"),o=()=>{if(!a)return;const e=t.getHealth(),s=t.getStatus(),u=s.filter(g=>g.last_success).length;a.textContent=`${e.backends_configured} backends configurés · ${u}/${s.length} dernier sync OK`};o(),i&&n&&n.bind(i,"click",()=>{(async()=>{i&&(i.disabled=!0);const e=await t.runAutoSync(),s=e.filter(g=>g.ok).length,{toast:u}=await l(async()=>{const{toast:g}=await import("./toast-ClsF1KRZ.js");return{toast:g}},[],import.meta.url);e.length===0?u.warn("Aucun backend configuré"):s===e.length?u.success(`Sync OK (${s}/${e.length})`):u.warn(`Sync partielle (${s}/${e.length})`),o(),i&&(i.disabled=!1)})()})}catch(t){S.warn("feature-settings","memory-bridge wire failed",{err:t})}})();const y=r.querySelector("#ax-conso-scan");y&&n&&n.bind(y,"click",()=>{(async()=>{try{const{consumptionAnomalyDetector:t}=await l(async()=>{const{consumptionAnomalyDetector:o}=await import("./consumption-anomaly-detector-DCCx0VFD.js");return{consumptionAnomalyDetector:o}},__vite__mapDeps([0,1,2,3]),import.meta.url),a=t.scanAllVerbose(),i=r.querySelector("#ax-conso-results");if(!i)return;i.innerHTML=a.map(o=>{const e=o.severity==="critical"?"#ff4444":o.severity==="high"?"#ff8844":o.severity==="medium"?"#ffaa00":o.severity==="low"?"#88aaff":"#22cc77",s=o.severity==="critical"?"🚨":o.severity==="high"?"⚠️":o.severity==="medium"?"🟡":o.severity==="low"?"🔵":"✅";return`<div style="background:rgba(255,255,255,0.03);border-left:3px solid ${e};padding:8px 12px;margin-top:6px;border-radius:4px">
            <strong style="color:${e}">${s} ${o.service}</strong>
            <div style="font-size:12px;color:var(--ax-text-dim);margin-top:4px">${o.reason}</div>
            <div style="font-size:11px;margin-top:4px">${o.recommended_action}</div>
            ${o.recharge_url?`<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><a href="${o.recharge_url}" target="_blank" rel="noopener" style="color:#c9a227;font-size:11px">💳 Recharge →</a> <a href="${o.rotate_url}" target="_blank" rel="noopener" style="color:#c9a227;font-size:11px">🔄 Rotate →</a></div>`:""}
          </div>`}).join("")}catch(t){S.warn("feature-settings","conso scan failed",{err:t})}})()}),r.querySelectorAll("[data-nav-route]").forEach(t=>{n.bind(t,"click",()=>{const a=t.getAttribute("data-nav-route");a&&(location.hash="#"+a)})});const _=r.querySelector("#ax-settings-logout");_&&n&&n.bind(_,"click",()=>{(async()=>{const{auth:t}=await l(async()=>{const{auth:a}=await import("./auth-DM3Fner2.js");return{auth:a}},__vite__mapDeps([4,1,0,2,3,5]),import.meta.url);t.logout(),location.hash="#login"})()});const x=r.querySelector("#ax-settings-tools-auto-embed");if(x&&n){try{const t=JSON.parse(localStorage.getItem("ax_settings")??"{}");x.checked=t.tools_auto_embed!==!1}catch{x.checked=!0}n.bind(x,"change",()=>{try{const t=JSON.parse(localStorage.getItem("ax_settings")??"{}");t.tools_auto_embed=x.checked,localStorage.setItem("ax_settings",JSON.stringify(t))}catch{}})}const h=r.querySelector("#ax-force-update-btn"),k=r.querySelector("#ax-force-update-status");h&&n&&n.bind(h,"click",()=>{(async()=>{const t=a=>{k&&(k.textContent=a)};h.disabled=!0,h.textContent="⏳ Reset en cours…";try{if(t("🔍 Désinstallation Service Workers…"),"serviceWorker"in navigator){const i=await navigator.serviceWorker.getRegistrations();for(const o of i)await o.unregister();t(`✅ ${i.length} SW désinstallés`)}if(t("🔍 Vidage caches PWA…"),"caches"in window){const i=await caches.keys();for(const o of i)await caches.delete(o);t(`✅ ${i.length} caches vidés`)}t("✅ Reset terminé. Rechargement dans 2s…");const{toast:a}=await l(async()=>{const{toast:i}=await import("./toast-ClsF1KRZ.js");return{toast:i}},[],import.meta.url);a.info("🔄 Reset OK — reload imminent"),setTimeout(()=>{location.href=location.pathname+"?_forceupd=1&_reset="+Date.now()},2e3)}catch(a){t(`❌ Erreur : ${String(a)}`),h.disabled=!1,h.textContent="🔄 Force reset PWA + reload"}})()}),V(r);const v=r.querySelector("#ax-settings-notif-test");v&&n&&n.bind(v,"click",()=>{(async()=>{try{if("Notification"in window&&Notification.permission==="granted")new Notification("Test Apex",{body:"Si tu vois ça, push notif fonctionne ✅"});else if("Notification"in window)if(await Notification.requestPermission()==="granted")new Notification("Test Apex",{body:"Push activé ✅"});else{const{toast:a}=await l(async()=>{const{toast:i}=await import("./toast-ClsF1KRZ.js");return{toast:i}},[],import.meta.url);a.warn("Permission notifications refusée")}else{const{toast:t}=await l(async()=>{const{toast:a}=await import("./toast-ClsF1KRZ.js");return{toast:a}},[],import.meta.url);t.warn("Notifications non supportées par ce navigateur")}}catch{const{toast:t}=await l(async()=>{const{toast:a}=await import("./toast-ClsF1KRZ.js");return{toast:a}},[],import.meta.url);t.warn("Test notification échoué")}})()}),S.info("feature-settings","rendered")}export{M as dispose,j as render,V as wireVoiceSection};
