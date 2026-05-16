const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-DMtdadhB.js","./apex-kb-CiJ6oLya.js","./credential-patterns-CLzI061R.js","./multi-source-analyze-WbPxI2dr.js","./auth-CZEEpXJF.js","../assets/css/main-BjtUc25U.css"])))=>i.map(i=>d[i]);
import{_ as p}from"./apex-kb-CiJ6oLya.js";import{a as u}from"./escape-html-DGIYNPKb.js";import{c as E}from"./listener-cleanup-Y2rGGxxX.js";import{l as T}from"./monitoring-DMtdadhB.js";import{i as I}from"../core/main-BM5uPYT0.js";import{c as O}from"./csp-style-helper-BisGRi53.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-WbPxI2dr.js";let i=null;function W(){i?.cleanup(),i=null}const P="apex_v13_chat_auto_read";function D(){try{return localStorage.getItem(P)==="1"}catch{return!1}}function V(n){try{localStorage.setItem(P,n?"1":"0")}catch{}}async function R(n){try{const k=await p(()=>import("./voice-BlZ80Nv-.js").then(l=>l.v),__vite__mapDeps([0,1,2]),import.meta.url),{listVoices:S,getActiveVoice:x,setActiveVoice:f,speak:m,stopAll:b}=k,w=n.querySelector("#ax-settings-auto-read"),z=n.querySelector("#ax-voice-current"),_=n.querySelector("#ax-voice-list"),L=n.querySelectorAll(".ax-voice-cat-btn");if(!_)return;w&&(w.checked=D(),i.bind(w,"change",()=>{V(w.checked),(async()=>{const{toast:l}=await p(async()=>{const{toast:d}=await import("./toast-CRdbcLoc.js");return{toast:d}},[],import.meta.url);l.success(w.checked?"Lecture auto activée":"Lecture auto désactivée")})()}));const A=()=>{if(!z)return;const l=x(),g=S().find(h=>h.id===l);z.textContent=g?`Voix active : ${g.emoji??"🔊"} ${g.name} (${g.category})`:`Voix active : ${l}`};A();const $=l=>{const d=S(),g=l==="all"?d:d.filter(e=>e.category===l),h=x();_.innerHTML=g.map(e=>{const a=e.id===h,o=e.emoji??(e.category==="pro"?"🎙️":e.category==="fun"?"🎉":"🎨"),t=e.description?u(e.description):"",r=a?"background:rgba(232,184,48,0.15);border-color:rgba(232,184,48,0.45)":"background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.06)";return`
            <div class="ax-voice-item" data-voice-id="${u(e.id)}" style="display:flex;align-items:center;gap:8px;padding:10px;margin-bottom:6px;border:1px solid;border-radius:8px;${r}">
              <span style="font-size:18px">${o}</span>
              <div style="flex:1;min-width:0">
                <div style="color:#fff;font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${u(e.name)}${a?' <span style="color:#e8b830;font-size:11px">★ active</span>':""}</div>
                <div style="color:rgba(255,255,255,0.5);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${u(e.category)}${t?" · "+t:""}</div>
              </div>
              <button class="ax-voice-test-btn" data-test-voice="${u(e.id)}" title="Tester cette voix" aria-label="Tester ${u(e.name)}" style="min-width:44px;min-height:44px;width:44px;height:44px;border-radius:8px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.3);cursor:pointer;font-size:14px">▶</button>
              <button class="ax-voice-set-btn" data-set-voice="${u(e.id)}" title="Définir comme voix par défaut" aria-label="Définir ${u(e.name)} par défaut" style="min-width:44px;min-height:44px;width:44px;height:44px;border-radius:8px;background:rgba(232,184,48,0.15);color:#e8b830;border:1px solid rgba(232,184,48,0.3);cursor:pointer;font-size:14px">★</button>
            </div>
          `}).join("")};$("all"),L.forEach(l=>{i.bind(l,"click",()=>{const d=l.getAttribute("data-cat");d&&$(d)})}),i.bind(_,"click",l=>{const d=l.target,g=d.closest("[data-test-voice]"),h=d.closest("[data-set-voice]");if(g){const e=g.getAttribute("data-test-voice");if(!e)return;(async()=>{b();const a=await m("Bonjour Kevin, je suis ta voix.",e);if(!a.ok){const{toast:o}=await p(async()=>{const{toast:t}=await import("./toast-CRdbcLoc.js");return{toast:t}},[],import.meta.url);o.warn(`Test échoué : ${a.reason??"erreur"}`)}})();return}if(h){const e=h.getAttribute("data-set-voice");if(!e)return;(async()=>{await f(e),A();const a=n.querySelector(".ax-voice-cat-btn[data-cat]:focus")?.getAttribute("data-cat")??"all";$(a);const{toast:o}=await p(async()=>{const{toast:s}=await import("./toast-CRdbcLoc.js");return{toast:s}},[],import.meta.url),r=S().find(s=>s.id===e);o.success(r?`Voix par défaut : ${r.name}`:"Voix mise à jour")})()}})}catch(k){T.warn("feature-settings","wireVoiceSection failed",{err:k})}}function K(n){i?.cleanup(),i=E("settings");const k=I.get("user"),S=I.get("isAdmin")??!1,x="background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;margin-top:14px;max-width:100%;box-sizing:border-box;transition:all 240ms cubic-bezier(0.16,1,0.3,1)",f="margin:0 0 12px;font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.01em;display:flex;align-items:center;gap:10px",m="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:linear-gradient(135deg,rgba(232,184,48,0.2),rgba(201,162,39,0.08));border:1px solid rgba(232,184,48,0.25);border-radius:10px;font-size:16px",b="width:100%;max-width:100%;box-sizing:border-box;min-height:44px;padding:12px 16px;font-size:14px;font-weight:600;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1);white-space:normal;word-break:break-word;overflow-wrap:anywhere;text-align:left";n.innerHTML=O.withNonce(`
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
        <p style="color:rgba(255,255,255,0.55);margin:0;font-size:14px">Utilisateur : <strong style="color:rgba(255,255,255,0.9)">${u(k?.name??"inconnu")}</strong> ${S?'<span style="color:#e8b830">👑 Admin</span>':""}</p>
      </header>

      <section class="ax-modernized-card" style="${x};animation-delay:60ms">
        <h2 style="${f}"><span style="${m}">🔑</span> Clés API</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">Gère tes clés API (Anthropic, OpenAI, Stripe, etc.) dans le Coffre sécurisé.</p>
        <button class="ax-btn ax-btn-primary" data-nav-route="vault" style="${b};background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none">🔐 Ouvrir le Coffre</button>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:100ms">
        <h2 style="${f}"><span style="${m}">🎨</span> Apparence</h2>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px">
          <span style="color:rgba(255,255,255,0.7);font-size:14px">Thème actuel</span>
          <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(232,184,48,0.12);color:#e8b830;border-radius:24px;font-size:12px;font-weight:700;letter-spacing:0.04em">
            <span style="width:8px;height:8px;background:#e8b830;border-radius:50%;box-shadow:0 0 10px #e8b830"></span> DARK
          </span>
        </div>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:140ms">
        <h2 style="${f}"><span style="${m}">🔔</span> Notifications</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">Active les notifications push pour rester informé en temps réel.</p>
        <button class="ax-btn ax-btn-secondary" id="ax-settings-notif-test" style="${b};background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3)">🔔 Tester notification push</button>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:180ms">
        <h2 style="${f}"><span style="${m}">🧠</span> Mémoire externe</h2>
        <p style="margin:0 0 10px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Backup mémoire vers Notion / GitHub Gist / Firebase. Tokens lus depuis le Coffre.
        </p>
        <div id="ax-memory-bridge-status" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-memory-bridge-sync" style="${b};background:rgba(160,96,255,0.15);color:#a060ff;border:1px solid rgba(160,96,255,0.3)">🔄 Sync maintenant</button>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:220ms">
        <h2 style="${f}"><span style="${m}">📊</span> Conso API temps réel</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Apex surveille ta conso et détecte si une clé est utilisée anormalement (potentielle compromission).
        </p>
        <button class="ax-btn ax-btn-secondary" id="ax-conso-scan" style="${b};margin-bottom:10px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.3)">🔍 Scanner toutes mes API maintenant</button>
        <div id="ax-conso-results" style="margin-top:12px;font-size:13px"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-zoom-inspector-btn" style="${b};margin-top:10px;background:rgba(201,162,39,0.15);color:#c9a227;border:1px solid rgba(201,162,39,0.3)">🔍 Zoom Inspector live (debug UX zoom Kevin)</button>
        <button class="ax-btn ax-btn-secondary" id="ax-cf-diagnostic-btn" style="${b};margin-top:10px;background:rgba(247,131,34,0.15);color:#f78322;border:1px solid rgba(247,131,34,0.3)">☁️ Tester Cloudflare API maintenant</button>
        <div id="ax-cf-diagnostic-results" style="margin-top:8px;font-size:12px"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-functional-test-btn" style="${b};margin-top:10px;background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.35)">🧪 Tester tous les boutons + auto-fix (v13.4.182)</button>
        <div id="ax-functional-test-results" style="margin-top:8px;font-size:12px"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-layout-inspect-btn" style="${b};margin-top:10px;background:rgba(180,90,200,0.15);color:#c97aff;border:1px solid rgba(180,90,200,0.35)">📐 Scanner la vue actuelle (overflow, boutons cachés)</button>
        <div id="ax-layout-inspect-results" style="margin-top:8px;font-size:12px"></div>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:240ms">
        <h2 style="${f}"><span style="${m}">🔊</span> Voix &amp; Lecture</h2>
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

      <section class="ax-modernized-card" style="${x};animation-delay:250ms">
        <h2 style="${f}"><span style="${m}">🧰</span> Suggestions outils</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Quand Apex détecte un outil pertinent dans tes messages (Studio Music, Finance Pro, etc.), il l'affiche directement dans le chat en plus du toast.
        </p>
        <label style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:10px;cursor:pointer">
          <span style="color:rgba(255,255,255,0.85);font-size:14px">Cards outils dans le chat</span>
          <input type="checkbox" id="ax-settings-tools-auto-embed" aria-label="Afficher cards outils dans le chat" style="width:20px;height:20px;cursor:pointer">
        </label>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.4);font-size:12px;line-height:1.4">Décoche pour n'avoir que le toast (5s) sans card permanente. Le bouton ✕ sur chaque card permet aussi de la fermer.</p>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:260ms">
        <h2 style="${f}"><span style="${m}">🔄</span> Mise à jour</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Si Apex reste bloqué sur une ancienne version malgré le reload (bug Safari iOS PWA cache), force le reset complet : Service Worker + caches + reload propre vers la dernière version.
        </p>
        <div id="ax-force-update-status" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-force-update-btn" style="${b};background:rgba(232,184,48,0.15);color:#e8b830;border:1px solid rgba(232,184,48,0.3)">🔄 Force reset PWA + reload</button>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:280ms">
        <h2 style="${f}"><span style="${m}">🔐</span> Compte</h2>
        <button class="ax-btn ax-btn-danger" id="ax-settings-logout" style="${b};background:rgba(255,91,91,0.15);color:#ff5b5b;border:1px solid rgba(255,91,91,0.3)">🚪 Se déconnecter</button>
      </section>

      <p style="margin-top:32px;text-align:center"><a href="#chat" style="color:#e8b830;text-decoration:none;font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:rgba(232,184,48,0.08);border-radius:24px;border:1px solid rgba(232,184,48,0.2);transition:all 200ms">← Retour chat</a></p>
    </div>
  `),(async()=>{try{const{memoryBridge:e}=await p(async()=>{const{memoryBridge:r}=await import("./memory-bridge-Bc7wI4KA.js");return{memoryBridge:r}},__vite__mapDeps([1,0,2]),import.meta.url),a=n.querySelector("#ax-memory-bridge-status"),o=n.querySelector("#ax-memory-bridge-sync"),t=()=>{if(!a)return;const r=e.getHealth(),s=e.getStatus(),c=s.filter(v=>v.last_success).length;a.textContent=`${r.backends_configured} backends configurés · ${c}/${s.length} dernier sync OK`};t(),o&&i&&i.bind(o,"click",()=>{(async()=>{o&&(o.disabled=!0);const r=await e.runAutoSync(),s=r.filter(v=>v.ok).length,{toast:c}=await p(async()=>{const{toast:v}=await import("./toast-CRdbcLoc.js");return{toast:v}},[],import.meta.url);r.length===0?c.warn("Aucun backend configuré"):s===r.length?c.success(`Sync OK (${s}/${r.length})`):c.warn(`Sync partielle (${s}/${r.length})`),t(),o&&(o.disabled=!1)})()})}catch(e){T.warn("feature-settings","memory-bridge wire failed",{err:e})}})();const w=n.querySelector("#ax-conso-scan");w&&i&&i.bind(w,"click",()=>{(async()=>{try{const{consumptionAnomalyDetector:e}=await p(async()=>{const{consumptionAnomalyDetector:t}=await import("./consumption-anomaly-detector-DB9vbukG.js");return{consumptionAnomalyDetector:t}},__vite__mapDeps([0,1,2,3]),import.meta.url),a=e.scanAllVerbose(),o=n.querySelector("#ax-conso-results");if(!o)return;o.innerHTML=a.map(t=>{const r=t.severity==="critical"?"#ff4444":t.severity==="high"?"#ff8844":t.severity==="medium"?"#ffaa00":t.severity==="low"?"#88aaff":"#22cc77",s=t.severity==="critical"?"🚨":t.severity==="high"?"⚠️":t.severity==="medium"?"🟡":t.severity==="low"?"🔵":"✅";return`<div style="background:rgba(255,255,255,0.03);border-left:3px solid ${r};padding:8px 12px;margin-top:6px;border-radius:4px">
            <strong style="color:${r}">${s} ${t.service}</strong>
            <div style="font-size:12px;color:var(--ax-text-dim);margin-top:4px">${t.reason}</div>
            <div style="font-size:11px;margin-top:4px">${t.recommended_action}</div>
            ${t.recharge_url?`<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><a href="${t.recharge_url}" target="_blank" rel="noopener" style="color:#c9a227;font-size:11px">💳 Recharge →</a> <a href="${t.rotate_url}" target="_blank" rel="noopener" style="color:#c9a227;font-size:11px">🔄 Rotate →</a></div>`:""}
          </div>`}).join("")}catch(e){T.warn("feature-settings","conso scan failed",{err:e})}})()});const z=n.querySelector("#ax-zoom-inspector-btn");z&&i&&i.bind(z,"click",()=>{(async()=>{const{apexZoomInspector:e}=await p(async()=>{const{apexZoomInspector:a}=await import("./apex-zoom-inspector-CePTRLIv.js");return{apexZoomInspector:a}},__vite__mapDeps([1,0,2]),import.meta.url);e.isVisible()?e.hide():e.show()})()});const _=n.querySelector("#ax-functional-test-btn");_&&i&&i.bind(_,"click",()=>{(async()=>{const e=n.querySelector("#ax-functional-test-results");if(e){e.innerHTML=`<div style="color:#6a8aff">⏳ Test des boutons en cours (jusqu'à 40 boutons, ~30s)...</div>`;try{const{apexFunctionalTester:a}=await p(async()=>{const{apexFunctionalTester:y}=await import("./apex-functional-tester-xRopxeha.js");return{apexFunctionalTester:y}},__vite__mapDeps([1,0,2]),import.meta.url),{reportsHistory:o}=await p(async()=>{const{reportsHistory:y}=await import("./apex-reports-history-CrX0f_kq.js");return{reportsHistory:y}},__vite__mapDeps([0]),import.meta.url),t=await a.testAndAutoFix({maxButtons:30});o.recordFunctional(t.before,t.fixes,t.after,t.improvement);const r=t.before.tested>0?Math.round(t.before.ok/t.before.tested*100):0,s=t.after?` → après fix : ${Math.round(t.after.ok/Math.max(1,t.after.tested)*100)}% OK (${t.improvement>0?"+":""}${Math.round(t.improvement*100)}%)`:"",c=t.before.details.filter(y=>y.status==="no_response"||y.status==="error").slice(0,5).map(y=>`<li style="color:#ffaa66;font-size:11px">${u(y.label||"(no label)")} → ${u(y.status)}</li>`).join(""),v=t.fixes.applied.map(y=>u(String(y))).join(", ");e.innerHTML=`
            <div style="background:rgba(106,138,255,0.08);border:1px solid rgba(106,138,255,0.3);border-radius:8px;padding:10px;color:#fff;font-size:12px">
              <div style="font-weight:700;margin-bottom:6px">🧪 Test fonctionnel terminé</div>
              <div>Testés : <b>${t.before.tested}</b>/${t.before.totalButtons} · OK : <b style="color:#22cc77">${t.before.ok} (${r}%)</b> · No-response : <b style="color:#ffaa66">${t.before.noResponse}</b> · Erreurs : <b style="color:#ff5b5b">${t.before.errors}</b> · Skipped : ${t.before.skipped}${s}</div>
              ${t.fixes.applied.length?`<div style="margin-top:6px;color:#c9a227">🔧 Auto-fix appliqué : ${v}</div>`:""}
              ${t.fixes.escalated?'<div style="margin-top:6px;color:#ff5b5b">⚠ Escaladé à Claude Code (ax_claude_todo)</div>':""}
              ${c?`<ul style="margin:6px 0 0 16px;padding:0">${c}</ul>`:""}
              <div style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.5)">→ Historique complet dans Admin (Apex Audits Live)</div>
            </div>
          `}catch(a){const o=a instanceof Error?a.message:String(a);e.innerHTML=`<div style="color:#ff5b5b">❌ Erreur test : ${u(o)}</div>`}}})()});const L=n.querySelector("#ax-layout-inspect-btn");L&&i&&i.bind(L,"click",()=>{(async()=>{const e=n.querySelector("#ax-layout-inspect-results");if(e){e.innerHTML='<div style="color:#c97aff">⏳ Scan layout...</div>';try{const{apexLayoutInspector:a}=await p(async()=>{const{apexLayoutInspector:c}=await import("./apex-layout-inspector-VQmd1tc8.js");return{apexLayoutInspector:c}},__vite__mapDeps([1,0,2]),import.meta.url),{reportsHistory:o}=await p(async()=>{const{reportsHistory:c}=await import("./apex-reports-history-CrX0f_kq.js");return{reportsHistory:c}},__vite__mapDeps([0]),import.meta.url),t=a.scanDom();o.recordLayout(t);const r=t.hiddenButtons.slice(0,5).map(c=>`<li style="color:#ffaa66;font-size:11px">"${c.label}" → ${c.reason}</li>`).join(""),s=t.overflowingElements.slice(0,5).map(c=>`<li style="color:#ff5b5b;font-size:11px">${c.tag} (+${c.overflowBy}px)</li>`).join("");e.innerHTML=`
            <div style="background:rgba(180,90,200,0.08);border:1px solid rgba(180,90,200,0.3);border-radius:8px;padding:10px;color:#fff;font-size:12px">
              <div style="font-weight:700;margin-bottom:6px">📐 Layout scan</div>
              <div>Viewport : ${t.viewport.width}×${t.viewport.height} · Document : ${t.documentScroll.width}px</div>
              <div>Overflow horizontal : <b style="color:${t.hasHorizontalOverflow?"#ff5b5b":"#22cc77"}">${t.hasHorizontalOverflow?"OUI":"NON"}</b> · Boutons cachés : <b style="color:${t.hiddenButtons.length?"#ffaa66":"#22cc77"}">${t.hiddenButtons.length}</b> · Touch < 44px : ${t.smallTouchTargets.length}</div>
              ${r?`<div style="margin-top:6px;color:#c9a227">Boutons cachés:</div><ul style="margin:2px 0 0 16px;padding:0">${r}</ul>`:""}
              ${s?`<div style="margin-top:6px;color:#c9a227">Éléments overflow:</div><ul style="margin:2px 0 0 16px;padding:0">${s}</ul>`:""}
              <div style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.5)">→ Historique complet dans Admin (Apex Audits Live)</div>
            </div>
          `}catch(a){const o=a instanceof Error?a.message:String(a);e.innerHTML=`<div style="color:#ff5b5b">❌ Erreur scan : ${u(o)}</div>`}}})()});const A=n.querySelector("#ax-cf-diagnostic-btn");A&&i&&i.bind(A,"click",()=>{(async()=>{const e=n.querySelector("#ax-cf-diagnostic-results");if(e){e.innerHTML='<div style="color:#f78322">⏳ Test Cloudflare API en cours...</div>';try{const{apexCloudflareVaultDeploy:a}=await p(async()=>{const{apexCloudflareVaultDeploy:s}=await import("./apex-cloudflare-vault-deploy-Bm8aqU9m.js");return{apexCloudflareVaultDeploy:s}},__vite__mapDeps([1,0,2]),import.meta.url),o=await a.runDiagnostic(),t=(s,c,v)=>`
            <div style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px">
              <span style="color:${c?"#22cc77":"#ff5b5b"};font-weight:700">${c?"✅":"❌"}</span>
              <span style="flex:1;color:rgba(255,255,255,0.85)">${s}</span>
              ${v?`<span style="color:rgba(255,255,255,0.5);font-size:11px">${v}</span>`:""}
            </div>`;let r='<div style="background:rgba(15,15,25,0.8);border:1px solid rgba(247,131,34,0.3);border-radius:10px;padding:12px;margin-top:10px">';r+='<div style="color:#f78322;font-weight:700;margin-bottom:8px">☁️ Diagnostic Cloudflare</div>',r+=t("Token Cloudflare présent",o.token_present),r+=t("Token valide (HTTP 200)",o.token_valid,o.http_status?`HTTP ${o.http_status}`:""),r+=t("Account ID accessible",!!o.account_id,o.account_name??o.account_id??""),r+=t("Permission KV (Workers KV Storage:Edit)",o.kv_permission,o.namespace_id?`ns ${o.namespace_id.slice(0,8)}…`:""),r+=t("Permission Workers (auto-deploy futur)",o.workers_permission),r+=t("Namespace apex-vault-kevin existe",o.namespace_exists),o.error_reason&&(r+=`<div style="margin-top:10px;padding:8px;background:rgba(255,91,91,0.1);border-left:3px solid #ff5b5b;color:#ff5b5b;font-size:12px;border-radius:4px">${o.error_reason}</div>`),o.fix_url&&(r+=`<div style="margin-top:8px"><a href="${o.fix_url}" target="_blank" rel="noopener" style="color:#6a8aff;font-size:12px">🔗 Fix : ${o.fix_url}</a></div>`),r+="</div>",e.innerHTML=r,T.info("cf-diag-manual",`Diagnostic result : token=${o.token_valid} kv=${o.kv_permission} workers=${o.workers_permission}`)}catch(a){const o=a instanceof Error?a.message:String(a);e.textContent="";const t=document.createElement("div");t.style.color="#ff5b5b",t.textContent=`❌ Erreur : ${o.slice(0,100)}`,e.append(t)}}})()}),n.querySelectorAll("[data-nav-route]").forEach(e=>{i.bind(e,"click",()=>{const a=e.getAttribute("data-nav-route");a&&(location.hash="#"+a)})});const $=n.querySelector("#ax-settings-logout");$&&i&&i.bind($,"click",()=>{(async()=>{const{auth:e}=await p(async()=>{const{auth:a}=await import("./auth-CZEEpXJF.js");return{auth:a}},__vite__mapDeps([4,1,0,2,3,5]),import.meta.url);e.logout(),location.hash="#login"})()});const l=n.querySelector("#ax-settings-tools-auto-embed");if(l&&i){try{const e=JSON.parse(localStorage.getItem("ax_settings")??"{}");l.checked=e.tools_auto_embed!==!1}catch{l.checked=!0}i.bind(l,"change",()=>{try{const e=JSON.parse(localStorage.getItem("ax_settings")??"{}");e.tools_auto_embed=l.checked,localStorage.setItem("ax_settings",JSON.stringify(e))}catch{}})}const d=n.querySelector("#ax-force-update-btn"),g=n.querySelector("#ax-force-update-status");d&&i&&i.bind(d,"click",()=>{(async()=>{const e=a=>{g&&(g.textContent=a)};d.disabled=!0,d.textContent="⏳ Reset en cours…";try{if(e("🔍 Désinstallation Service Workers…"),"serviceWorker"in navigator){const o=await navigator.serviceWorker.getRegistrations();for(const t of o)await t.unregister();e(`✅ ${o.length} SW désinstallés`)}if(e("🔍 Vidage caches PWA…"),"caches"in window){const o=await caches.keys();for(const t of o)await caches.delete(t);e(`✅ ${o.length} caches vidés`)}e("✅ Reset terminé. Rechargement dans 2s…");const{toast:a}=await p(async()=>{const{toast:o}=await import("./toast-CRdbcLoc.js");return{toast:o}},[],import.meta.url);a.info("🔄 Reset OK — reload imminent"),setTimeout(()=>{location.href=location.pathname+"?_forceupd=1&_reset="+Date.now()},2e3)}catch(a){e(`❌ Erreur : ${String(a)}`),d.disabled=!1,d.textContent="🔄 Force reset PWA + reload"}})()}),R(n);const h=n.querySelector("#ax-settings-notif-test");h&&i&&i.bind(h,"click",()=>{(async()=>{try{if("Notification"in window&&Notification.permission==="granted")new Notification("Test Apex",{body:"Si tu vois ça, push notif fonctionne ✅"});else if("Notification"in window)if(await Notification.requestPermission()==="granted")new Notification("Test Apex",{body:"Push activé ✅"});else{const{toast:a}=await p(async()=>{const{toast:o}=await import("./toast-CRdbcLoc.js");return{toast:o}},[],import.meta.url);a.warn("Permission notifications refusée")}else{const{toast:e}=await p(async()=>{const{toast:a}=await import("./toast-CRdbcLoc.js");return{toast:a}},[],import.meta.url);e.warn("Notifications non supportées par ce navigateur")}}catch{const{toast:e}=await p(async()=>{const{toast:a}=await import("./toast-CRdbcLoc.js");return{toast:a}},[],import.meta.url);e.warn("Test notification échoué")}})()}),T.info("feature-settings","rendered")}export{W as dispose,K as render,R as wireVoiceSection};
