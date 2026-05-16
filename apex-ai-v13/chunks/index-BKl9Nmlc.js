const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-3uBGKGRH.js","./apex-kb-BTjMfcEM.js","./credential-patterns-CLzI061R.js","./multi-source-analyze-D5mviugG.js","./auth-Cy_i5vIf.js","../assets/css/main-CHYznJwT.css"])))=>i.map(i=>d[i]);
import{_ as d}from"./apex-kb-BTjMfcEM.js";import{c as P}from"./listener-cleanup-Y2rGGxxX.js";import{l as S}from"./monitoring-3uBGKGRH.js";import{s as A}from"../core/main-C8f0ioof.js";import{c as I}from"./csp-style-helper-BisGRi53.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-D5mviugG.js";let n=null;function N(){n?.cleanup(),n=null}function y(r){return r.replace(/[&<>"']/g,h=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[h]??h)}const T="apex_v13_chat_auto_read";function V(){try{return localStorage.getItem(T)==="1"}catch{return!1}}function D(r){try{localStorage.setItem(T,r?"1":"0")}catch{}}async function R(r){try{const h=await d(()=>import("./voice-CmXxr4Jw.js").then(c=>c.c),__vite__mapDeps([0,1,2]),import.meta.url),{listVoices:k,getActiveVoice:u,setActiveVoice:x,speak:b,stopAll:m}=h,v=r.querySelector("#ax-settings-auto-read"),$=r.querySelector("#ax-voice-current"),w=r.querySelector("#ax-voice-list"),z=r.querySelectorAll(".ax-voice-cat-btn");if(!w)return;v&&(v.checked=V(),n.bind(v,"change",()=>{D(v.checked),(async()=>{const{toast:c}=await d(async()=>{const{toast:l}=await import("./toast-ClsF1KRZ.js");return{toast:l}},[],import.meta.url);c.success(v.checked?"Lecture auto activée":"Lecture auto désactivée")})()}));const _=()=>{if(!$)return;const c=u(),t=k().find(o=>o.id===c);$.textContent=t?`Voix active : ${t.emoji??"🔊"} ${t.name} (${t.category})`:`Voix active : ${c}`};_();const f=c=>{const l=k(),t=c==="all"?l:l.filter(e=>e.category===c),o=u();w.innerHTML=t.map(e=>{const a=e.id===o,i=e.emoji??(e.category==="pro"?"🎙️":e.category==="fun"?"🎉":"🎨"),s=e.description?y(e.description):"",p=a?"background:rgba(232,184,48,0.15);border-color:rgba(232,184,48,0.45)":"background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.06)";return`
            <div class="ax-voice-item" data-voice-id="${y(e.id)}" style="display:flex;align-items:center;gap:8px;padding:10px;margin-bottom:6px;border:1px solid;border-radius:8px;${p}">
              <span style="font-size:18px">${i}</span>
              <div style="flex:1;min-width:0">
                <div style="color:#fff;font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${y(e.name)}${a?' <span style="color:#e8b830;font-size:11px">★ active</span>':""}</div>
                <div style="color:rgba(255,255,255,0.5);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${y(e.category)}${s?" · "+s:""}</div>
              </div>
              <button class="ax-voice-test-btn" data-test-voice="${y(e.id)}" title="Tester cette voix" aria-label="Tester ${y(e.name)}" style="min-width:44px;min-height:44px;width:44px;height:44px;border-radius:8px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.3);cursor:pointer;font-size:14px">▶</button>
              <button class="ax-voice-set-btn" data-set-voice="${y(e.id)}" title="Définir comme voix par défaut" aria-label="Définir ${y(e.name)} par défaut" style="min-width:44px;min-height:44px;width:44px;height:44px;border-radius:8px;background:rgba(232,184,48,0.15);color:#e8b830;border:1px solid rgba(232,184,48,0.3);cursor:pointer;font-size:14px">★</button>
            </div>
          `}).join("")};f("all"),z.forEach(c=>{n.bind(c,"click",()=>{const l=c.getAttribute("data-cat");l&&f(l)})}),n.bind(w,"click",c=>{const l=c.target,t=l.closest("[data-test-voice]"),o=l.closest("[data-set-voice]");if(t){const e=t.getAttribute("data-test-voice");if(!e)return;(async()=>{m();const a=await b("Bonjour Kevin, je suis ta voix.",e);if(!a.ok){const{toast:i}=await d(async()=>{const{toast:s}=await import("./toast-ClsF1KRZ.js");return{toast:s}},[],import.meta.url);i.warn(`Test échoué : ${a.reason??"erreur"}`)}})();return}if(o){const e=o.getAttribute("data-set-voice");if(!e)return;(async()=>{await x(e),_();const a=r.querySelector(".ax-voice-cat-btn[data-cat]:focus")?.getAttribute("data-cat")??"all";f(a);const{toast:i}=await d(async()=>{const{toast:g}=await import("./toast-ClsF1KRZ.js");return{toast:g}},[],import.meta.url),p=k().find(g=>g.id===e);i.success(p?`Voix par défaut : ${p.name}`:"Voix mise à jour")})()}})}catch(h){S.warn("feature-settings","wireVoiceSection failed",{err:h})}}function j(r){n?.cleanup(),n=P("settings");const h=A.get("user"),k=A.get("isAdmin")??!1,u="background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;margin-top:14px;transition:all 240ms cubic-bezier(0.16,1,0.3,1)",x="margin:0 0 12px;font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.01em;display:flex;align-items:center;gap:10px",b="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:linear-gradient(135deg,rgba(232,184,48,0.2),rgba(201,162,39,0.08));border:1px solid rgba(232,184,48,0.25);border-radius:10px;font-size:16px",m="width:100%;min-height:44px;padding:12px 16px;font-size:14px;font-weight:600;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1)";r.innerHTML=I.withNonce(`
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
        <p style="color:rgba(255,255,255,0.55);margin:0;font-size:14px">Utilisateur : <strong style="color:rgba(255,255,255,0.9)">${y(h?.name??"inconnu")}</strong> ${k?'<span style="color:#e8b830">👑 Admin</span>':""}</p>
      </header>

      <section class="ax-modernized-card" style="${u};animation-delay:60ms">
        <h2 style="${x}"><span style="${b}">🔑</span> Clés API</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">Gère tes clés API (Anthropic, OpenAI, Stripe, etc.) dans le Coffre sécurisé.</p>
        <button class="ax-btn ax-btn-primary" data-nav-route="vault" style="${m};background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none">🔐 Ouvrir le Coffre</button>
      </section>

      <section class="ax-modernized-card" style="${u};animation-delay:100ms">
        <h2 style="${x}"><span style="${b}">🎨</span> Apparence</h2>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px">
          <span style="color:rgba(255,255,255,0.7);font-size:14px">Thème actuel</span>
          <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(232,184,48,0.12);color:#e8b830;border-radius:24px;font-size:12px;font-weight:700;letter-spacing:0.04em">
            <span style="width:8px;height:8px;background:#e8b830;border-radius:50%;box-shadow:0 0 10px #e8b830"></span> DARK
          </span>
        </div>
      </section>

      <section class="ax-modernized-card" style="${u};animation-delay:140ms">
        <h2 style="${x}"><span style="${b}">🔔</span> Notifications</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">Active les notifications push pour rester informé en temps réel.</p>
        <button class="ax-btn ax-btn-secondary" id="ax-settings-notif-test" style="${m};background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3)">🔔 Tester notification push</button>
      </section>

      <section class="ax-modernized-card" style="${u};animation-delay:180ms">
        <h2 style="${x}"><span style="${b}">🧠</span> Mémoire externe</h2>
        <p style="margin:0 0 10px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Backup mémoire vers Notion / GitHub Gist / Firebase. Tokens lus depuis le Coffre.
        </p>
        <div id="ax-memory-bridge-status" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-memory-bridge-sync" style="${m};background:rgba(160,96,255,0.15);color:#a060ff;border:1px solid rgba(160,96,255,0.3)">🔄 Sync maintenant</button>
      </section>

      <section class="ax-modernized-card" style="${u};animation-delay:220ms">
        <h2 style="${x}"><span style="${b}">📊</span> Conso API temps réel</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Apex surveille ta conso et détecte si une clé est utilisée anormalement (potentielle compromission).
        </p>
        <button class="ax-btn ax-btn-secondary" id="ax-conso-scan" style="${m};margin-bottom:10px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.3)">🔍 Scanner toutes mes API maintenant</button>
        <div id="ax-conso-results" style="margin-top:12px;font-size:13px"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-zoom-inspector-btn" style="${m};margin-top:10px;background:rgba(201,162,39,0.15);color:#c9a227;border:1px solid rgba(201,162,39,0.3)">🔍 Zoom Inspector live (debug UX zoom Kevin)</button>
        <button class="ax-btn ax-btn-secondary" id="ax-cf-diagnostic-btn" style="${m};margin-top:10px;background:rgba(247,131,34,0.15);color:#f78322;border:1px solid rgba(247,131,34,0.3)">☁️ Tester Cloudflare API maintenant</button>
        <div id="ax-cf-diagnostic-results" style="margin-top:8px;font-size:12px"></div>
      </section>

      <section class="ax-modernized-card" style="${u};animation-delay:240ms">
        <h2 style="${x}"><span style="${b}">🔊</span> Voix &amp; Lecture</h2>
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

      <section class="ax-modernized-card" style="${u};animation-delay:250ms">
        <h2 style="${x}"><span style="${b}">🧰</span> Suggestions outils</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Quand Apex détecte un outil pertinent dans tes messages (Studio Music, Finance Pro, etc.), il l'affiche directement dans le chat en plus du toast.
        </p>
        <label style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:10px;cursor:pointer">
          <span style="color:rgba(255,255,255,0.85);font-size:14px">Cards outils dans le chat</span>
          <input type="checkbox" id="ax-settings-tools-auto-embed" aria-label="Afficher cards outils dans le chat" style="width:20px;height:20px;cursor:pointer">
        </label>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.4);font-size:12px;line-height:1.4">Décoche pour n'avoir que le toast (5s) sans card permanente. Le bouton ✕ sur chaque card permet aussi de la fermer.</p>
      </section>

      <section class="ax-modernized-card" style="${u};animation-delay:260ms">
        <h2 style="${x}"><span style="${b}">🔄</span> Mise à jour</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Si Apex reste bloqué sur une ancienne version malgré le reload (bug Safari iOS PWA cache), force le reset complet : Service Worker + caches + reload propre vers la dernière version.
        </p>
        <div id="ax-force-update-status" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-force-update-btn" style="${m};background:rgba(232,184,48,0.15);color:#e8b830;border:1px solid rgba(232,184,48,0.3)">🔄 Force reset PWA + reload</button>
      </section>

      <section class="ax-modernized-card" style="${u};animation-delay:280ms">
        <h2 style="${x}"><span style="${b}">🔐</span> Compte</h2>
        <button class="ax-btn ax-btn-danger" id="ax-settings-logout" style="${m};background:rgba(255,91,91,0.15);color:#ff5b5b;border:1px solid rgba(255,91,91,0.3)">🚪 Se déconnecter</button>
      </section>

      <p style="margin-top:32px;text-align:center"><a href="#chat" style="color:#e8b830;text-decoration:none;font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:rgba(232,184,48,0.08);border-radius:24px;border:1px solid rgba(232,184,48,0.2);transition:all 200ms">← Retour chat</a></p>
    </div>
  `),(async()=>{try{const{memoryBridge:t}=await d(async()=>{const{memoryBridge:i}=await import("./memory-bridge-ID-F3PoJ.js");return{memoryBridge:i}},__vite__mapDeps([1,0,2]),import.meta.url),o=r.querySelector("#ax-memory-bridge-status"),e=r.querySelector("#ax-memory-bridge-sync"),a=()=>{if(!o)return;const i=t.getHealth(),s=t.getStatus(),p=s.filter(g=>g.last_success).length;o.textContent=`${i.backends_configured} backends configurés · ${p}/${s.length} dernier sync OK`};a(),e&&n&&n.bind(e,"click",()=>{(async()=>{e&&(e.disabled=!0);const i=await t.runAutoSync(),s=i.filter(g=>g.ok).length,{toast:p}=await d(async()=>{const{toast:g}=await import("./toast-ClsF1KRZ.js");return{toast:g}},[],import.meta.url);i.length===0?p.warn("Aucun backend configuré"):s===i.length?p.success(`Sync OK (${s}/${i.length})`):p.warn(`Sync partielle (${s}/${i.length})`),a(),e&&(e.disabled=!1)})()})}catch(t){S.warn("feature-settings","memory-bridge wire failed",{err:t})}})();const v=r.querySelector("#ax-conso-scan");v&&n&&n.bind(v,"click",()=>{(async()=>{try{const{consumptionAnomalyDetector:t}=await d(async()=>{const{consumptionAnomalyDetector:a}=await import("./consumption-anomaly-detector-CQYI2F4Y.js");return{consumptionAnomalyDetector:a}},__vite__mapDeps([0,1,2,3]),import.meta.url),o=t.scanAllVerbose(),e=r.querySelector("#ax-conso-results");if(!e)return;e.innerHTML=o.map(a=>{const i=a.severity==="critical"?"#ff4444":a.severity==="high"?"#ff8844":a.severity==="medium"?"#ffaa00":a.severity==="low"?"#88aaff":"#22cc77",s=a.severity==="critical"?"🚨":a.severity==="high"?"⚠️":a.severity==="medium"?"🟡":a.severity==="low"?"🔵":"✅";return`<div style="background:rgba(255,255,255,0.03);border-left:3px solid ${i};padding:8px 12px;margin-top:6px;border-radius:4px">
            <strong style="color:${i}">${s} ${a.service}</strong>
            <div style="font-size:12px;color:var(--ax-text-dim);margin-top:4px">${a.reason}</div>
            <div style="font-size:11px;margin-top:4px">${a.recommended_action}</div>
            ${a.recharge_url?`<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><a href="${a.recharge_url}" target="_blank" rel="noopener" style="color:#c9a227;font-size:11px">💳 Recharge →</a> <a href="${a.rotate_url}" target="_blank" rel="noopener" style="color:#c9a227;font-size:11px">🔄 Rotate →</a></div>`:""}
          </div>`}).join("")}catch(t){S.warn("feature-settings","conso scan failed",{err:t})}})()});const $=r.querySelector("#ax-zoom-inspector-btn");$&&n&&n.bind($,"click",()=>{(async()=>{const{apexZoomInspector:t}=await d(async()=>{const{apexZoomInspector:o}=await import("./apex-zoom-inspector-B8y_QB7s.js");return{apexZoomInspector:o}},__vite__mapDeps([1,0,2]),import.meta.url);t.isVisible()?t.hide():t.show()})()});const w=r.querySelector("#ax-cf-diagnostic-btn");w&&n&&n.bind(w,"click",()=>{(async()=>{const t=r.querySelector("#ax-cf-diagnostic-results");if(t){t.innerHTML='<div style="color:#f78322">⏳ Test Cloudflare API en cours...</div>';try{const{apexCloudflareVaultDeploy:o}=await d(async()=>{const{apexCloudflareVaultDeploy:s}=await import("./apex-cloudflare-vault-deploy-Bx4-c5Ay.js");return{apexCloudflareVaultDeploy:s}},__vite__mapDeps([1,0,2]),import.meta.url),e=await o.runDiagnostic(),a=(s,p,g)=>`
            <div style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px">
              <span style="color:${p?"#22cc77":"#ff5b5b"};font-weight:700">${p?"✅":"❌"}</span>
              <span style="flex:1;color:rgba(255,255,255,0.85)">${s}</span>
              ${g?`<span style="color:rgba(255,255,255,0.5);font-size:11px">${g}</span>`:""}
            </div>`;let i='<div style="background:rgba(15,15,25,0.8);border:1px solid rgba(247,131,34,0.3);border-radius:10px;padding:12px;margin-top:10px">';i+='<div style="color:#f78322;font-weight:700;margin-bottom:8px">☁️ Diagnostic Cloudflare</div>',i+=a("Token Cloudflare présent",e.token_present),i+=a("Token valide (HTTP 200)",e.token_valid,e.http_status?`HTTP ${e.http_status}`:""),i+=a("Account ID accessible",!!e.account_id,e.account_name??e.account_id??""),i+=a("Permission KV (Workers KV Storage:Edit)",e.kv_permission,e.namespace_id?`ns ${e.namespace_id.slice(0,8)}…`:""),i+=a("Permission Workers (auto-deploy futur)",e.workers_permission),i+=a("Namespace apex-vault-kevin existe",e.namespace_exists),e.error_reason&&(i+=`<div style="margin-top:10px;padding:8px;background:rgba(255,91,91,0.1);border-left:3px solid #ff5b5b;color:#ff5b5b;font-size:12px;border-radius:4px">${e.error_reason}</div>`),e.fix_url&&(i+=`<div style="margin-top:8px"><a href="${e.fix_url}" target="_blank" rel="noopener" style="color:#6a8aff;font-size:12px">🔗 Fix : ${e.fix_url}</a></div>`),i+="</div>",t.innerHTML=i,S.info("cf-diag-manual",`Diagnostic result : token=${e.token_valid} kv=${e.kv_permission} workers=${e.workers_permission}`)}catch(o){const e=o instanceof Error?o.message:String(o);t.textContent="";const a=document.createElement("div");a.style.color="#ff5b5b",a.textContent=`❌ Erreur : ${e.slice(0,100)}`,t.append(a)}}})()}),r.querySelectorAll("[data-nav-route]").forEach(t=>{n.bind(t,"click",()=>{const o=t.getAttribute("data-nav-route");o&&(location.hash="#"+o)})});const z=r.querySelector("#ax-settings-logout");z&&n&&n.bind(z,"click",()=>{(async()=>{const{auth:t}=await d(async()=>{const{auth:o}=await import("./auth-Cy_i5vIf.js");return{auth:o}},__vite__mapDeps([4,1,0,2,3,5]),import.meta.url);t.logout(),location.hash="#login"})()});const _=r.querySelector("#ax-settings-tools-auto-embed");if(_&&n){try{const t=JSON.parse(localStorage.getItem("ax_settings")??"{}");_.checked=t.tools_auto_embed!==!1}catch{_.checked=!0}n.bind(_,"change",()=>{try{const t=JSON.parse(localStorage.getItem("ax_settings")??"{}");t.tools_auto_embed=_.checked,localStorage.setItem("ax_settings",JSON.stringify(t))}catch{}})}const f=r.querySelector("#ax-force-update-btn"),c=r.querySelector("#ax-force-update-status");f&&n&&n.bind(f,"click",()=>{(async()=>{const t=o=>{c&&(c.textContent=o)};f.disabled=!0,f.textContent="⏳ Reset en cours…";try{if(t("🔍 Désinstallation Service Workers…"),"serviceWorker"in navigator){const e=await navigator.serviceWorker.getRegistrations();for(const a of e)await a.unregister();t(`✅ ${e.length} SW désinstallés`)}if(t("🔍 Vidage caches PWA…"),"caches"in window){const e=await caches.keys();for(const a of e)await caches.delete(a);t(`✅ ${e.length} caches vidés`)}t("✅ Reset terminé. Rechargement dans 2s…");const{toast:o}=await d(async()=>{const{toast:e}=await import("./toast-ClsF1KRZ.js");return{toast:e}},[],import.meta.url);o.info("🔄 Reset OK — reload imminent"),setTimeout(()=>{location.href=location.pathname+"?_forceupd=1&_reset="+Date.now()},2e3)}catch(o){t(`❌ Erreur : ${String(o)}`),f.disabled=!1,f.textContent="🔄 Force reset PWA + reload"}})()}),R(r);const l=r.querySelector("#ax-settings-notif-test");l&&n&&n.bind(l,"click",()=>{(async()=>{try{if("Notification"in window&&Notification.permission==="granted")new Notification("Test Apex",{body:"Si tu vois ça, push notif fonctionne ✅"});else if("Notification"in window)if(await Notification.requestPermission()==="granted")new Notification("Test Apex",{body:"Push activé ✅"});else{const{toast:o}=await d(async()=>{const{toast:e}=await import("./toast-ClsF1KRZ.js");return{toast:e}},[],import.meta.url);o.warn("Permission notifications refusée")}else{const{toast:t}=await d(async()=>{const{toast:o}=await import("./toast-ClsF1KRZ.js");return{toast:o}},[],import.meta.url);t.warn("Notifications non supportées par ce navigateur")}}catch{const{toast:t}=await d(async()=>{const{toast:o}=await import("./toast-ClsF1KRZ.js");return{toast:o}},[],import.meta.url);t.warn("Test notification échoué")}})()}),S.info("feature-settings","rendered")}export{N as dispose,j as render,R as wireVoiceSection};
