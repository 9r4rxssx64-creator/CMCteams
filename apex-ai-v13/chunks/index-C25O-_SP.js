const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-3uBGKGRH.js","./apex-kb-DRERxXuJ.js","./credential-patterns-CLzI061R.js","./multi-source-analyze-Bfq2osax.js","./auth-Dc-xlCWe.js","../assets/css/main-DHnkOnRu.css"])))=>i.map(i=>d[i]);
import{_ as u}from"./apex-kb-DRERxXuJ.js";import{e as d}from"./escape-html-BlQj2yEF.js";import{c as P}from"./listener-cleanup-Y2rGGxxX.js";import{l as T}from"./monitoring-3uBGKGRH.js";import{s as R}from"../core/main-CxoKTJ9r.js";import{c as E}from"./csp-style-helper-BisGRi53.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-Bfq2osax.js";function O(i){const{rechargeUrl:m,rotateUrl:f,variant:x="inline",label:g="Recharge"}=i;if(!m&&!f)return"";if(x==="button"){const w=m?d(m):"",k=f?d(f):"";return`<div class="ax-recharge-action ax-recharge-action-button" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
      ${m?`<a class="ax-btn-health ax-btn-health-primary" href="${w}" target="_blank" rel="noopener" style="text-decoration:none;font-size:12px">💳 ${d(g)}</a>`:""}
      ${f?`<a class="ax-btn-health ax-btn-health-blue" href="${k}" target="_blank" rel="noopener" style="text-decoration:none;font-size:12px">🔄 Rotate</a>`:""}
    </div>`}const y=m?d(m):"",b=f?d(f):"";return`<div class="ax-recharge-action ax-recharge-action-inline" style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap;font-size:11px">
    ${m?`<a href="${y}" target="_blank" rel="noopener" style="color:var(--ax-gold-deep);text-decoration:none;font-weight:600">💳 ${d(g)} →</a>`:""}
    ${f?`<a href="${b}" target="_blank" rel="noopener" style="color:var(--ax-gold-deep);text-decoration:none;font-weight:600">🔄 Rotate →</a>`:""}
  </div>`}let n=null;function W(){n?.cleanup(),n=null}const I="apex_v13_chat_auto_read";function D(){try{return localStorage.getItem(I)==="1"}catch{return!1}}function V(i){try{localStorage.setItem(I,i?"1":"0")}catch{}}async function q(i){try{const m=await u(()=>import("./voice-627WxwAa.js").then(l=>l.e),__vite__mapDeps([0,1,2]),import.meta.url),{listVoices:f,getActiveVoice:x,setActiveVoice:g,speak:y,stopAll:b}=m,w=i.querySelector("#ax-settings-auto-read"),k=i.querySelector("#ax-voice-current"),S=i.querySelector("#ax-voice-list"),L=i.querySelectorAll(".ax-voice-cat-btn");if(!S)return;w&&(w.checked=D(),n.bind(w,"change",()=>{V(w.checked),(async()=>{const{toast:l}=await u(async()=>{const{toast:p}=await import("./toast-CRdbcLoc.js");return{toast:p}},[],import.meta.url);l.success(w.checked?"Lecture auto activée":"Lecture auto désactivée")})()}));const A=()=>{if(!k)return;const l=x(),v=f().find($=>$.id===l);k.textContent=v?`Voix active : ${v.emoji??"🔊"} ${v.name} (${v.category})`:`Voix active : ${l}`};A();const z=l=>{const p=f(),v=l==="all"?p:p.filter(t=>t.category===l),$=x();S.innerHTML=v.map(t=>{const o=t.id===$,a=t.emoji??(t.category==="pro"?"🎙️":t.category==="fun"?"🎉":"🎨"),e=t.description?d(t.description):"",r=o?"background:rgba(232,184,48,0.15);border-color:rgba(232,184,48,0.45)":"background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.06)";return`
            <div class="ax-voice-item" data-voice-id="${d(t.id)}" style="display:flex;align-items:center;gap:8px;padding:10px;margin-bottom:6px;border:1px solid;border-radius:8px;${r}">
              <span style="font-size:18px">${a}</span>
              <div style="flex:1;min-width:0">
                <div style="color:#fff;font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d(t.name)}${o?' <span style="color:var(--ax-gold);font-size:11px">★ active</span>':""}</div>
                <div style="color:rgba(255,255,255,0.5);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d(t.category)}${e?" · "+e:""}</div>
              </div>
              <button class="ax-voice-test-btn" data-test-voice="${d(t.id)}" title="Tester cette voix" aria-label="Tester ${d(t.name)}" style="min-width:44px;min-height:44px;width:44px;height:44px;border-radius:8px;background:rgba(34,204,119,0.15);color:var(--ax-green);border:1px solid rgba(34,204,119,0.3);cursor:pointer;font-size:14px">▶</button>
              <button class="ax-voice-set-btn" data-set-voice="${d(t.id)}" title="Définir comme voix par défaut" aria-label="Définir ${d(t.name)} par défaut" style="min-width:44px;min-height:44px;width:44px;height:44px;border-radius:8px;background:rgba(232,184,48,0.15);color:var(--ax-gold);border:1px solid rgba(232,184,48,0.3);cursor:pointer;font-size:14px">★</button>
            </div>
          `}).join("")};z("all"),L.forEach(l=>{n.bind(l,"click",()=>{const p=l.getAttribute("data-cat");p&&z(p)})}),n.bind(S,"click",l=>{const p=l.target,v=p.closest("[data-test-voice]"),$=p.closest("[data-set-voice]");if(v){const t=v.getAttribute("data-test-voice");if(!t)return;(async()=>{b();const o=await y("Bonjour Kevin, je suis ta voix.",t);if(!o.ok){const{toast:a}=await u(async()=>{const{toast:e}=await import("./toast-CRdbcLoc.js");return{toast:e}},[],import.meta.url);a.warn(`Test échoué : ${o.reason??"erreur"}`)}})();return}if($){const t=$.getAttribute("data-set-voice");if(!t)return;(async()=>{await g(t),A();const o=i.querySelector(".ax-voice-cat-btn[data-cat]:focus")?.getAttribute("data-cat")??"all";z(o);const{toast:a}=await u(async()=>{const{toast:c}=await import("./toast-CRdbcLoc.js");return{toast:c}},[],import.meta.url),r=f().find(c=>c.id===t);a.success(r?`Voix par défaut : ${r.name}`:"Voix mise à jour")})()}})}catch(m){T.warn("feature-settings","wireVoiceSection failed",{err:m})}}function K(i){n?.cleanup(),n=P("settings");const m=R.get("user"),f=R.get("isAdmin")??!1,x="background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;margin-top:14px;max-width:100%;box-sizing:border-box;transition:all 240ms cubic-bezier(0.16,1,0.3,1)",g="margin:0 0 12px;font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.01em;display:flex;align-items:center;gap:10px",y="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:linear-gradient(135deg,rgba(232,184,48,0.2),rgba(201,162,39,0.08));border:1px solid rgba(232,184,48,0.25);border-radius:10px;font-size:16px",b="width:100%;max-width:100%;box-sizing:border-box;min-height:44px;padding:12px 16px;font-size:14px;font-weight:600;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1);white-space:normal;word-break:break-word;overflow-wrap:anywhere;text-align:left";i.innerHTML=E.withNonce(`
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
        <h1 style="margin:0 0 6px;font-size:clamp(26px,4.5vw,32px);font-weight:700;background:linear-gradient(135deg,var(--ax-gold-deep) 0%,var(--ax-gold) 50%,var(--ax-gold-bright) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:Georgia,serif;letter-spacing:-0.025em">⚙️ Réglages</h1>
        <p style="color:rgba(255,255,255,0.55);margin:0;font-size:14px">Utilisateur : <strong style="color:rgba(255,255,255,0.9)">${d(m?.name??"inconnu")}</strong> ${f?'<span style="color:var(--ax-gold)">👑 Admin</span>':""}</p>
      </header>

      <section class="ax-modernized-card" style="${x};animation-delay:60ms">
        <h2 style="${g}"><span style="${y}">🔑</span> Clés API</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">Gère tes clés API (Anthropic, OpenAI, Stripe, etc.) dans le Coffre sécurisé.</p>
        <button class="ax-btn ax-btn-primary" data-nav-route="vault" style="${b};background:linear-gradient(135deg,var(--ax-gold-deep),var(--ax-gold));color:#000;border:none">🔐 Ouvrir le Coffre</button>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:100ms">
        <h2 style="${g}"><span style="${y}">🎨</span> Apparence</h2>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px">
          <span style="color:rgba(255,255,255,0.7);font-size:14px">Thème actuel</span>
          <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(232,184,48,0.12);color:var(--ax-gold);border-radius:24px;font-size:12px;font-weight:700;letter-spacing:0.04em">
            <span style="width:8px;height:8px;background:var(--ax-gold);border-radius:50%;box-shadow:0 0 10px var(--ax-gold)"></span> DARK
          </span>
        </div>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:140ms">
        <h2 style="${g}"><span style="${y}">🔔</span> Notifications</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">Active les notifications push pour rester informé en temps réel.</p>
        <button class="ax-btn ax-btn-secondary" id="ax-settings-notif-test" style="${b};background:rgba(106,138,255,0.15);color:var(--ax-blue);border:1px solid rgba(106,138,255,0.3)">🔔 Tester notification push</button>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:180ms">
        <h2 style="${g}"><span style="${y}">🧠</span> Mémoire externe</h2>
        <p style="margin:0 0 10px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Backup mémoire vers Notion / GitHub Gist / Firebase. Tokens lus depuis le Coffre.
        </p>
        <div id="ax-memory-bridge-status" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-memory-bridge-sync" style="${b};background:rgba(160,96,255,0.15);color:var(--ax-purple);border:1px solid rgba(160,96,255,0.3)">🔄 Sync maintenant</button>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:220ms">
        <h2 style="${g}"><span style="${y}">📊</span> Conso API temps réel</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Apex surveille ta conso et détecte si une clé est utilisée anormalement (potentielle compromission).
        </p>
        <button class="ax-btn ax-btn-secondary" id="ax-conso-scan" style="${b};margin-bottom:10px;background:rgba(34,204,119,0.15);color:var(--ax-green);border:1px solid rgba(34,204,119,0.3)">🔍 Scanner toutes mes API maintenant</button>
        <div id="ax-conso-results" style="margin-top:12px;font-size:13px"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-zoom-inspector-btn" style="${b};margin-top:10px;background:rgba(201,162,39,0.15);color:var(--ax-gold-deep);border:1px solid rgba(201,162,39,0.3)">🔍 Zoom Inspector live (debug UX zoom Kevin)</button>
        <button class="ax-btn ax-btn-secondary" id="ax-cf-diagnostic-btn" style="${b};margin-top:10px;background:rgba(247,131,34,0.15);color:#f78322;border:1px solid rgba(247,131,34,0.3)">☁️ Tester Cloudflare API maintenant</button>
        <div id="ax-cf-diagnostic-results" style="margin-top:8px;font-size:12px"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-functional-test-btn" style="${b};margin-top:10px;background:rgba(106,138,255,0.15);color:var(--ax-blue);border:1px solid rgba(106,138,255,0.35)">🧪 Tester tous les boutons + auto-fix (v13.4.182)</button>
        <div id="ax-functional-test-results" style="margin-top:8px;font-size:12px"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-layout-inspect-btn" style="${b};margin-top:10px;background:rgba(180,90,200,0.15);color:var(--ax-purple);border:1px solid rgba(180,90,200,0.35)">📐 Scanner la vue actuelle (overflow, boutons cachés)</button>
        <div id="ax-layout-inspect-results" style="margin-top:8px;font-size:12px"></div>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:240ms">
        <h2 style="${g}"><span style="${y}">🔊</span> Voix &amp; Lecture</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Apex peut lire ses réponses à voix haute. Choisis ta voix préférée parmi 60+ (PRO, FUN, Thématique).
        </p>
        <label style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px;margin-bottom:10px;cursor:pointer">
          <span style="color:rgba(255,255,255,0.7);font-size:14px">Lire automatiquement les réponses</span>
          <input type="checkbox" id="ax-settings-auto-read" aria-label="Lire automatiquement les réponses à voix haute" style="width:20px;height:20px;cursor:pointer">
        </label>
        <div id="ax-voice-current" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace">Voix active : ...</div>
        <div id="ax-voice-categories" style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
          <button class="ax-btn ax-btn-secondary ax-voice-cat-btn" data-cat="all" style="padding:6px 12px;font-size:12px;border-radius:14px;background:rgba(232,184,48,0.15);color:var(--ax-gold);border:1px solid rgba(232,184,48,0.3);cursor:pointer">Tous</button>
          <button class="ax-btn ax-btn-secondary ax-voice-cat-btn" data-cat="pro" style="padding:6px 12px;font-size:12px;border-radius:14px;background:rgba(106,138,255,0.15);color:var(--ax-blue);border:1px solid rgba(106,138,255,0.3);cursor:pointer">PRO</button>
          <button class="ax-btn ax-btn-secondary ax-voice-cat-btn" data-cat="fun" style="padding:6px 12px;font-size:12px;border-radius:14px;background:rgba(255,170,0,0.15);color:var(--ax-warning);border:1px solid rgba(255,170,0,0.3);cursor:pointer">FUN</button>
          <button class="ax-btn ax-btn-secondary ax-voice-cat-btn" data-cat="thematic" style="padding:6px 12px;font-size:12px;border-radius:14px;background:rgba(160,96,255,0.15);color:var(--ax-purple);border:1px solid rgba(160,96,255,0.3);cursor:pointer">Thématique</button>
        </div>
        <div id="ax-voice-list" style="max-height:360px;overflow-y:auto;background:rgba(0,0,0,0.2);border-radius:10px;padding:8px"></div>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:250ms">
        <h2 style="${g}"><span style="${y}">🧰</span> Suggestions outils</h2>
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
        <h2 style="${g}"><span style="${y}">🔄</span> Mise à jour</h2>
        <p style="margin:0 0 14px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Si Apex reste bloqué sur une ancienne version malgré le reload (bug Safari iOS PWA cache), force le reset complet : Service Worker + caches + reload propre vers la dernière version.
        </p>
        <div id="ax-force-update-status" style="margin:10px 0;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);font-family:ui-monospace,'SF Mono',Menlo,monospace"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-force-update-btn" style="${b};background:rgba(232,184,48,0.15);color:var(--ax-gold);border:1px solid rgba(232,184,48,0.3)">🔄 Force reset PWA + reload</button>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:280ms">
        <h2 style="${g}"><span style="${y}">🔐</span> Compte</h2>
        <button class="ax-btn ax-btn-danger" id="ax-settings-logout" style="${b};background:rgba(255,91,91,0.15);color:var(--ax-error);border:1px solid rgba(255,91,91,0.3)">🚪 Se déconnecter</button>
      </section>

      <p style="margin-top:32px;text-align:center"><a href="#chat" style="color:var(--ax-gold);text-decoration:none;font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:rgba(232,184,48,0.08);border-radius:24px;border:1px solid rgba(232,184,48,0.2);transition:all 200ms">← Retour chat</a></p>
    </div>
  `),(async()=>{try{const{memoryBridge:t}=await u(async()=>{const{memoryBridge:r}=await import("./memory-bridge-XULZ5a1A.js");return{memoryBridge:r}},__vite__mapDeps([1,0,2]),import.meta.url),o=i.querySelector("#ax-memory-bridge-status"),a=i.querySelector("#ax-memory-bridge-sync"),e=()=>{if(!o)return;const r=t.getHealth(),c=t.getStatus(),s=c.filter(_=>_.last_success).length;o.textContent=`${r.backends_configured} backends configurés · ${s}/${c.length} dernier sync OK`};e(),a&&n&&n.bind(a,"click",()=>{(async()=>{a&&(a.disabled=!0);const r=await t.runAutoSync(),c=r.filter(_=>_.ok).length,{toast:s}=await u(async()=>{const{toast:_}=await import("./toast-CRdbcLoc.js");return{toast:_}},[],import.meta.url);r.length===0?s.warn("Aucun backend configuré"):c===r.length?s.success(`Sync OK (${c}/${r.length})`):s.warn(`Sync partielle (${c}/${r.length})`),e(),a&&(a.disabled=!1)})()})}catch(t){T.warn("feature-settings","memory-bridge wire failed",{err:t})}})();const w=i.querySelector("#ax-conso-scan");w&&n&&n.bind(w,"click",()=>{(async()=>{try{const{consumptionAnomalyDetector:t}=await u(async()=>{const{consumptionAnomalyDetector:e}=await import("./consumption-anomaly-detector-AzM2QOtR.js");return{consumptionAnomalyDetector:e}},__vite__mapDeps([0,1,2,3]),import.meta.url),o=t.scanAllVerbose(),a=i.querySelector("#ax-conso-results");if(!a)return;a.innerHTML=o.map(e=>{const r=e.severity==="critical"?"var(--ax-sev-critical)":e.severity==="high"?"var(--ax-sev-high)":e.severity==="medium"?"var(--ax-sev-medium)":e.severity==="low"?"var(--ax-sev-low)":"var(--ax-green)",c=e.severity==="critical"?"ax-sev-critical":e.severity==="high"?"ax-sev-high":e.severity==="medium"?"ax-sev-medium":(e.severity==="low","ax-sev-low"),s=e.severity==="critical"?"🚨":e.severity==="high"?"⚠️":e.severity==="medium"?"🟡":e.severity==="low"?"🔵":"✅";return`<div style="background:rgba(255,255,255,0.03);border-left:3px solid ${r};padding:8px 12px;margin-top:6px;border-radius:4px">
            <strong style="color:${r}">${s} ${e.service}</strong> <span class="ax-sev ${c}">${e.severity}</span>
            <div style="font-size:12px;color:var(--ax-text-dim);margin-top:4px">${e.reason}</div>
            <div style="font-size:11px;margin-top:4px">${e.recommended_action}</div>
            ${O({rechargeUrl:e.recharge_url,rotateUrl:e.rotate_url,variant:"inline"})}
          </div>`}).join("")}catch(t){T.warn("feature-settings","conso scan failed",{err:t})}})()});const k=i.querySelector("#ax-zoom-inspector-btn");k&&n&&n.bind(k,"click",()=>{(async()=>{const{apexZoomInspector:t}=await u(async()=>{const{apexZoomInspector:o}=await import("./apex-zoom-inspector-DrPc8bPv.js");return{apexZoomInspector:o}},__vite__mapDeps([1,0,2]),import.meta.url);t.isVisible()?t.hide():t.show()})()});const S=i.querySelector("#ax-functional-test-btn");S&&n&&n.bind(S,"click",()=>{(async()=>{const t=i.querySelector("#ax-functional-test-results");if(t){t.innerHTML=`<div style="color:var(--ax-blue)">⏳ Test des boutons en cours (jusqu'à 40 boutons, ~30s)...</div>`;try{const{apexFunctionalTester:o}=await u(async()=>{const{apexFunctionalTester:h}=await import("./apex-functional-tester-D9nVAibI.js");return{apexFunctionalTester:h}},__vite__mapDeps([1,0,2]),import.meta.url),{reportsHistory:a}=await u(async()=>{const{reportsHistory:h}=await import("./apex-reports-history-Cv_X_jWe.js");return{reportsHistory:h}},__vite__mapDeps([0]),import.meta.url),e=await o.testAndAutoFix({maxButtons:30});a.recordFunctional(e.before,e.fixes,e.after,e.improvement);const r=e.before.tested>0?Math.round(e.before.ok/e.before.tested*100):0,c=e.after?` → après fix : ${Math.round(e.after.ok/Math.max(1,e.after.tested)*100)}% OK (${e.improvement>0?"+":""}${Math.round(e.improvement*100)}%)`:"",s=e.before.details.filter(h=>h.status==="no_response"||h.status==="error").slice(0,5).map(h=>`<li style="color:var(--ax-sev-high);font-size:11px">${d(h.label||"(no label)")} → ${d(h.status)}</li>`).join(""),_=e.fixes.applied.map(h=>d(String(h))).join(", ");t.innerHTML=`
            <div style="background:rgba(106,138,255,0.08);border:1px solid rgba(106,138,255,0.3);border-radius:8px;padding:10px;color:#fff;font-size:12px">
              <div style="font-weight:700;margin-bottom:6px">🧪 Test fonctionnel terminé</div>
              <div>Testés : <b>${e.before.tested}</b>/${e.before.totalButtons} · OK : <b style="color:var(--ax-green)">${e.before.ok} (${r}%)</b> · No-response : <b style="color:var(--ax-sev-high)">${e.before.noResponse}</b> · Erreurs : <b style="color:var(--ax-error)">${e.before.errors}</b> · Skipped : ${e.before.skipped}${c}</div>
              ${e.fixes.applied.length?`<div style="margin-top:6px;color:var(--ax-gold-deep)">🔧 Auto-fix appliqué : ${_}</div>`:""}
              ${e.fixes.escalated?'<div style="margin-top:6px;color:var(--ax-error)">⚠ Escaladé à Claude Code (ax_claude_todo)</div>':""}
              ${s?`<ul style="margin:6px 0 0 16px;padding:0">${s}</ul>`:""}
              <div style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.5)">→ Historique complet dans Admin (Apex Audits Live)</div>
            </div>
          `}catch(o){const a=o instanceof Error?o.message:String(o);t.innerHTML=`<div style="color:var(--ax-error)">❌ Erreur test : ${d(a)}</div>`}}})()});const L=i.querySelector("#ax-layout-inspect-btn");L&&n&&n.bind(L,"click",()=>{(async()=>{const t=i.querySelector("#ax-layout-inspect-results");if(t){t.innerHTML='<div style="color:var(--ax-purple)">⏳ Scan layout...</div>';try{const{apexLayoutInspector:o}=await u(async()=>{const{apexLayoutInspector:s}=await import("./apex-layout-inspector-19ZpxsLO.js");return{apexLayoutInspector:s}},__vite__mapDeps([1,0,2]),import.meta.url),{reportsHistory:a}=await u(async()=>{const{reportsHistory:s}=await import("./apex-reports-history-Cv_X_jWe.js");return{reportsHistory:s}},__vite__mapDeps([0]),import.meta.url),e=o.scanDom();a.recordLayout(e);const r=e.hiddenButtons.slice(0,5).map(s=>`<li style="color:var(--ax-sev-high);font-size:11px">"${s.label}" → ${s.reason}</li>`).join(""),c=e.overflowingElements.slice(0,5).map(s=>`<li style="color:var(--ax-error);font-size:11px">${s.tag} (+${s.overflowBy}px)</li>`).join("");t.innerHTML=`
            <div style="background:rgba(180,90,200,0.08);border:1px solid rgba(180,90,200,0.3);border-radius:8px;padding:10px;color:#fff;font-size:12px">
              <div style="font-weight:700;margin-bottom:6px">📐 Layout scan</div>
              <div>Viewport : ${e.viewport.width}×${e.viewport.height} · Document : ${e.documentScroll.width}px</div>
              <div>Overflow horizontal : <b style="color:${e.hasHorizontalOverflow?"var(--ax-error)":"var(--ax-green)"}">${e.hasHorizontalOverflow?"OUI":"NON"}</b> · Boutons cachés : <b style="color:${e.hiddenButtons.length?"var(--ax-sev-high)":"var(--ax-green)"}">${e.hiddenButtons.length}</b> · Touch < 44px : ${e.smallTouchTargets.length}</div>
              ${r?`<div style="margin-top:6px;color:var(--ax-gold-deep)">Boutons cachés:</div><ul style="margin:2px 0 0 16px;padding:0">${r}</ul>`:""}
              ${c?`<div style="margin-top:6px;color:var(--ax-gold-deep)">Éléments overflow:</div><ul style="margin:2px 0 0 16px;padding:0">${c}</ul>`:""}
              <div style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.5)">→ Historique complet dans Admin (Apex Audits Live)</div>
            </div>
          `}catch(o){const a=o instanceof Error?o.message:String(o);t.innerHTML=`<div style="color:var(--ax-error)">❌ Erreur scan : ${d(a)}</div>`}}})()});const A=i.querySelector("#ax-cf-diagnostic-btn");A&&n&&n.bind(A,"click",()=>{(async()=>{const t=i.querySelector("#ax-cf-diagnostic-results");if(t){t.innerHTML='<div style="color:#f78322">⏳ Test Cloudflare API en cours...</div>';try{const{apexCloudflareVaultDeploy:o}=await u(async()=>{const{apexCloudflareVaultDeploy:c}=await import("./apex-cloudflare-vault-deploy-vFaV6lpc.js");return{apexCloudflareVaultDeploy:c}},__vite__mapDeps([1,0,2]),import.meta.url),a=await o.runDiagnostic(),e=(c,s,_)=>`
            <div style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px">
              <span style="color:${s?"var(--ax-green)":"var(--ax-error)"};font-weight:700">${s?"✅":"❌"}</span>
              <span style="flex:1;color:rgba(255,255,255,0.85)">${c}</span>
              ${_?`<span style="color:rgba(255,255,255,0.5);font-size:11px">${_}</span>`:""}
            </div>`;let r='<div style="background:rgba(15,15,25,0.8);border:1px solid rgba(247,131,34,0.3);border-radius:10px;padding:12px;margin-top:10px">';r+='<div style="color:#f78322;font-weight:700;margin-bottom:8px">☁️ Diagnostic Cloudflare</div>',r+=e("Token Cloudflare présent",a.token_present),r+=e("Token valide (HTTP 200)",a.token_valid,a.http_status?`HTTP ${a.http_status}`:""),r+=e("Account ID accessible",!!a.account_id,a.account_name??a.account_id??""),r+=e("Permission KV (Workers KV Storage:Edit)",a.kv_permission,a.namespace_id?`ns ${a.namespace_id.slice(0,8)}…`:""),r+=e("Permission Workers (auto-deploy futur)",a.workers_permission),r+=e("Namespace apex-vault-kevin existe",a.namespace_exists),a.error_reason&&(r+=`<div style="margin-top:10px;padding:8px;background:rgba(255,91,91,0.1);border-left:3px solid var(--ax-error);color:var(--ax-error);font-size:12px;border-radius:4px">${a.error_reason}</div>`),a.fix_url&&(r+=`<div style="margin-top:8px"><a href="${a.fix_url}" target="_blank" rel="noopener" style="color:var(--ax-blue);font-size:12px">🔗 Fix : ${a.fix_url}</a></div>`),r+="</div>",t.innerHTML=r,T.info("cf-diag-manual",`Diagnostic result : token=${a.token_valid} kv=${a.kv_permission} workers=${a.workers_permission}`)}catch(o){const a=o instanceof Error?o.message:String(o);t.textContent="";const e=document.createElement("div");e.style.color="var(--ax-error)",e.textContent=`❌ Erreur : ${a.slice(0,100)}`,t.append(e)}}})()}),i.querySelectorAll("[data-nav-route]").forEach(t=>{n.bind(t,"click",()=>{const o=t.getAttribute("data-nav-route");o&&(location.hash="#"+o)})});const z=i.querySelector("#ax-settings-logout");z&&n&&n.bind(z,"click",()=>{(async()=>{const{auth:t}=await u(async()=>{const{auth:o}=await import("./auth-Dc-xlCWe.js");return{auth:o}},__vite__mapDeps([4,1,0,2,3,5]),import.meta.url);t.logout(),location.hash="#login"})()});const l=i.querySelector("#ax-settings-tools-auto-embed");if(l&&n){try{const t=JSON.parse(localStorage.getItem("ax_settings")??"{}");l.checked=t.tools_auto_embed!==!1}catch{l.checked=!0}n.bind(l,"change",()=>{try{const t=JSON.parse(localStorage.getItem("ax_settings")??"{}");t.tools_auto_embed=l.checked,localStorage.setItem("ax_settings",JSON.stringify(t))}catch{}})}const p=i.querySelector("#ax-force-update-btn"),v=i.querySelector("#ax-force-update-status");p&&n&&n.bind(p,"click",()=>{(async()=>{const t=o=>{v&&(v.textContent=o)};p.disabled=!0,p.textContent="⏳ Reset en cours…";try{if(t("🔍 Désinstallation Service Workers…"),"serviceWorker"in navigator){const a=await navigator.serviceWorker.getRegistrations();for(const e of a)await e.unregister();t(`✅ ${a.length} SW désinstallés`)}if(t("🔍 Vidage caches PWA…"),"caches"in window){const a=await caches.keys();for(const e of a)await caches.delete(e);t(`✅ ${a.length} caches vidés`)}t("✅ Reset terminé. Rechargement dans 2s…");const{toast:o}=await u(async()=>{const{toast:a}=await import("./toast-CRdbcLoc.js");return{toast:a}},[],import.meta.url);o.info("🔄 Reset OK — reload imminent"),setTimeout(()=>{location.href=location.pathname+"?_forceupd=1&_reset="+Date.now()},2e3)}catch(o){t(`❌ Erreur : ${String(o)}`),p.disabled=!1,p.textContent="🔄 Force reset PWA + reload"}})()}),q(i);const $=i.querySelector("#ax-settings-notif-test");$&&n&&n.bind($,"click",()=>{(async()=>{try{if("Notification"in window&&Notification.permission==="granted")new Notification("Test Apex",{body:"Si tu vois ça, push notif fonctionne ✅"});else if("Notification"in window)if(await Notification.requestPermission()==="granted")new Notification("Test Apex",{body:"Push activé ✅"});else{const{toast:o}=await u(async()=>{const{toast:a}=await import("./toast-CRdbcLoc.js");return{toast:a}},[],import.meta.url);o.warn("Permission notifications refusée")}else{const{toast:t}=await u(async()=>{const{toast:o}=await import("./toast-CRdbcLoc.js");return{toast:o}},[],import.meta.url);t.warn("Notifications non supportées par ce navigateur")}}catch{const{toast:t}=await u(async()=>{const{toast:o}=await import("./toast-CRdbcLoc.js");return{toast:o}},[],import.meta.url);t.warn("Test notification échoué")}})()}),T.info("feature-settings","rendered")}export{W as dispose,K as render,q as wireVoiceSection};
