const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-s9DMRVdy.js","./multi-source-analyze-D22Lzh_R.js","./credential-patterns-DUMYZEMu.js","./apex-kb-P7udjtAF.js","./auth-nzhONbFt.js"])))=>i.map(i=>d[i]);
import{b as L,e as x,_ as l,l as z}from"./monitoring-s9DMRVdy.js";import{c as P}from"./listener-cleanup-Y2rGGxxX.js";import{c as O}from"./csp-style-helper-BEHhIhzj.js";import{r as D}from"./recharge-action-v96f50Mf.js";import"./multi-source-analyze-D22Lzh_R.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-P7udjtAF.js";let i=null;function K(){i?.cleanup(),i=null}const I="apex_v13_chat_auto_read";function R(){try{return localStorage.getItem(I)==="1"}catch{return!1}}function V(o){try{localStorage.setItem(I,o?"1":"0")}catch{}}async function q(o){try{const k=await l(()=>import("./voice-CdhMukGZ.js"),__vite__mapDeps([0,1,2,3]),import.meta.url),{listVoices:A,getActiveVoice:g,setActiveVoice:b,speak:v,stopAll:m}=k,_=o.querySelector("#ax-settings-auto-read"),S=o.querySelector("#ax-voice-current"),$=o.querySelector("#ax-voice-list"),E=o.querySelectorAll(".ax-voice-cat-btn"),w=o.querySelector("#ax-settings-rag");if(w&&(l(async()=>{const{apexMemoryRag:c}=await import("./apex-memory-rag-DQ8YU8EJ.js");return{apexMemoryRag:c}},__vite__mapDeps([0,1,2,3]),import.meta.url).then(({apexMemoryRag:c})=>{w.checked=c.isEnabled()}),i.bind(w,"change",()=>{(async()=>{const{apexMemoryRag:c}=await l(async()=>{const{apexMemoryRag:u}=await import("./apex-memory-rag-DQ8YU8EJ.js");return{apexMemoryRag:u}},__vite__mapDeps([0,1,2,3]),import.meta.url);c.enable(w.checked);const{toast:p}=await l(async()=>{const{toast:u}=await import("./toast-BCPNzfMv.js");return{toast:u}},[],import.meta.url);p.success(w.checked?"🧠 Mémoire long terme activée":"Mémoire long terme désactivée")})()})),!$)return;_&&(_.checked=R(),i.bind(_,"change",()=>{V(_.checked),(async()=>{const{toast:c}=await l(async()=>{const{toast:p}=await import("./toast-BCPNzfMv.js");return{toast:p}},[],import.meta.url);c.success(_.checked?"Lecture auto activée":"Lecture auto désactivée")})()}));const T=()=>{if(!S)return;const c=g(),u=A().find(a=>a.id===c);S.textContent=u?`Voix active : ${u.emoji??"🔊"} ${u.name} (${u.category})`:`Voix active : ${c}`};T();const h=c=>{const p=A(),u=c==="all"?p:p.filter(t=>t.category===c),a=g();$.setAttribute("aria-busy","false"),$.innerHTML=u.map(t=>{const s=t.id===a,e=t.emoji??(t.category==="pro"?"🎙️":t.category==="fun"?"🎉":"🎨"),r=t.description?x(t.description):"";return`
            <div class="ax-voice-item${s?" is-active":""}" data-voice-id="${x(t.id)}">
              <span class="ax-gs-17">${e}</span>
              <div class="ax-gs-6">
                <div class="ax-voice-item__name">${x(t.name)}${s?' <span style="color:var(--ax-gold);font-size:11px">★ active</span>':""}</div>
                <div class="ax-voice-item__meta">${x(t.category)}${r?" · "+r:""}</div>
              </div>
              <button class="ax-voice-item__action ax-voice-item__action--test" data-test-voice="${x(t.id)}" title="Tester cette voix" aria-label="Tester ${x(t.name)}">▶</button>
              <button class="ax-voice-item__action ax-voice-item__action--set" data-set-voice="${x(t.id)}" title="Définir comme voix par défaut" aria-label="Définir ${x(t.name)} par défaut">★</button>
            </div>
          `}).join("")};h("all"),E.forEach(c=>{i.bind(c,"click",()=>{const p=c.getAttribute("data-cat");p&&h(p)})}),i.bind($,"click",c=>{const p=c.target,u=p.closest("[data-test-voice]"),a=p.closest("[data-set-voice]");if(u){const t=u.getAttribute("data-test-voice");if(!t)return;(async()=>{m();const s=await v("Bonjour Kevin, je suis ta voix.",t);if(!s.ok){const{toast:e}=await l(async()=>{const{toast:r}=await import("./toast-BCPNzfMv.js");return{toast:r}},[],import.meta.url);e.warn(`Test échoué : ${s.reason??"erreur"}`)}})();return}if(a){const t=a.getAttribute("data-set-voice");if(!t)return;(async()=>{await b(t),T();const s=o.querySelector(".ax-voice-cat-btn[data-cat]:focus")?.getAttribute("data-cat")??"all";h(s);const{toast:e}=await l(async()=>{const{toast:n}=await import("./toast-BCPNzfMv.js");return{toast:n}},[],import.meta.url),d=A().find(n=>n.id===t);e.success(d?`Voix par défaut : ${d.name}`:"Voix mise à jour")})()}})}catch(k){z.warn("feature-settings","wireVoiceSection failed",{err:k})}}function W(o){i?.cleanup(),i=P("settings");const k=L.get("user"),A=L.get("isAdmin")??!1,g="background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;margin-top:14px;max-width:100%;box-sizing:border-box;transition:all 240ms cubic-bezier(0.16,1,0.3,1)",b="margin:0 0 12px;font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.01em;display:flex;align-items:center;gap:10px",v="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:linear-gradient(135deg,rgba(232,184,48,0.2),rgba(201,162,39,0.08));border:1px solid rgba(232,184,48,0.25);border-radius:10px;font-size:16px",m="width:100%;max-width:100%;box-sizing:border-box;min-height:44px;padding:12px 16px;font-size:14px;font-weight:600;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1);white-space:normal;word-break:break-word;overflow-wrap:anywhere;text-align:left";o.innerHTML=O.withNonce(`
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
        <h1 style="margin:0 0 6px;font-size:clamp(26px,5.5vw,32px);font-weight:700;background:linear-gradient(135deg,var(--ax-gold-deep) 0%,var(--ax-gold) 50%,var(--ax-gold-bright) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:Georgia,serif;letter-spacing:-0.025em">⚙️ Réglages</h1>
        <p class="ax-gs-399">Utilisateur : <strong style="color:rgba(255,255,255,0.9)">${x(k?.name??"inconnu")}</strong> ${A?'<span style="color:var(--ax-gold)">👑 Admin</span>':""}</p>
      </header>

      <section class="ax-modernized-card" style="${g};animation-delay:60ms">
        <h2 style="${b}"><span style="${v}">🔑</span> Clés API</h2>
        <p class="ax-gs-437">Gère tes clés API (Anthropic, OpenAI, Stripe, etc.) dans le Coffre sécurisé.</p>
        <button class="ax-btn ax-btn-primary" data-nav-route="vault" style="${m};background:linear-gradient(135deg,var(--ax-gold-deep),var(--ax-gold));color:#000;border:none">🔐 Ouvrir le Coffre</button>
      </section>

      <section class="ax-modernized-card" style="${g};animation-delay:100ms">
        <h2 style="${b}"><span style="${v}">🎨</span> Apparence</h2>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px">
          <span class="ax-gs-164">Thème actuel</span>
          <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(232,184,48,0.12);color:var(--ax-gold);border-radius:24px;font-size:12px;font-weight:700;letter-spacing:0.04em">
            <span style="width:8px;height:8px;background:var(--ax-gold);border-radius:50%;box-shadow:0 0 10px var(--ax-gold)"></span> DARK
          </span>
        </div>
      </section>

      <section class="ax-modernized-card" style="${g};animation-delay:140ms">
        <h2 style="${b}"><span style="${v}">🔔</span> Notifications</h2>
        <p class="ax-gs-437">Active les notifications push pour rester informé en temps réel.</p>
        <button class="ax-btn ax-btn-secondary" id="ax-settings-notif-test" style="${m};background:rgba(106,138,255,0.15);color:var(--ax-blue);border:1px solid rgba(106,138,255,0.3)">🔔 Tester notification push</button>
      </section>

      <section class="ax-modernized-card" style="${g};animation-delay:180ms">
        <h2 style="${b}"><span style="${v}">🧠</span> Mémoire externe</h2>
        <p style="margin:0 0 10px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Backup mémoire vers Notion / GitHub Gist / Firebase. Tokens lus depuis le Coffre.
        </p>
        <label style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px;margin:0 0 10px;cursor:pointer">
          <span class="ax-gs-164">Mémoire long terme — Apex se souvient de tes échanges</span>
          <input type="checkbox" id="ax-settings-rag" aria-label="Activer la mémoire long terme d'Apex (RAG)" class="ax-gs-439">
        </label>
        <div id="ax-memory-bridge-status" class="ax-gs-438"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-memory-bridge-sync" style="${m};background:rgba(160,96,255,0.15);color:var(--ax-purple);border:1px solid rgba(160,96,255,0.3)">🔄 Sync maintenant</button>
      </section>

      <section class="ax-modernized-card" style="${g};animation-delay:220ms">
        <h2 style="${b}"><span style="${v}">📊</span> Conso API temps réel</h2>
        <p class="ax-gs-437">
          Apex surveille ta conso et détecte si une clé est utilisée anormalement (potentielle compromission).
        </p>
        <button class="ax-btn ax-btn-secondary" id="ax-conso-scan" style="${m};margin-bottom:10px;background:rgba(34,204,119,0.15);color:var(--ax-green);border:1px solid rgba(34,204,119,0.3)">🔍 Scanner toutes mes API maintenant</button>
        <div id="ax-conso-results" class="ax-gs-196"></div>
        <!-- v13.4.331 (Kevin "trop de boutons") : outils de debug repliés (rarement utiles au quotidien). -->
        <details style="margin-top:6px">
          <summary style="cursor:pointer;color:rgba(255,255,255,0.6);font-size:13px;font-weight:600;padding:8px 0;min-height:36px;list-style:none">🔧 Diagnostics avancés (debug)</summary>
          <button class="ax-btn ax-btn-secondary" id="ax-zoom-inspector-btn" style="${m};margin-top:10px;background:rgba(201,162,39,0.15);color:var(--ax-gold-deep);border:1px solid rgba(201,162,39,0.3)">🔍 Zoom Inspector live (debug UX zoom Kevin)</button>
          <button class="ax-btn ax-btn-secondary" id="ax-cf-diagnostic-btn" style="${m};margin-top:10px;background:rgba(247,131,34,0.15);color:var(--ax-warning);border:1px solid rgba(247,131,34,0.3)">☁️ Tester Cloudflare API maintenant</button>
          <div id="ax-cf-diagnostic-results" class="ax-gs-249"></div>
          <button class="ax-btn ax-btn-secondary" id="ax-functional-test-btn" style="${m};margin-top:10px;background:rgba(106,138,255,0.15);color:var(--ax-blue);border:1px solid rgba(106,138,255,0.35)">🧪 Tester tous les boutons + auto-fix</button>
          <div id="ax-functional-test-results" class="ax-gs-249"></div>
          <button class="ax-btn ax-btn-secondary" id="ax-layout-inspect-btn" style="${m};margin-top:10px;background:rgba(180,90,200,0.15);color:var(--ax-purple);border:1px solid rgba(180,90,200,0.35)">📐 Scanner la vue actuelle (overflow, boutons cachés)</button>
          <div id="ax-layout-inspect-results" class="ax-gs-249"></div>
        </details>
      </section>

      <section class="ax-modernized-card" style="${g};animation-delay:240ms">
        <h2 style="${b}"><span style="${v}">🔊</span> Voix &amp; Lecture</h2>
        <p class="ax-gs-437">
          Apex peut lire ses réponses à voix haute. Choisis ta voix préférée parmi 60+ (PRO, FUN, Thématique).
        </p>
        <label style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px;margin-bottom:10px;cursor:pointer">
          <span class="ax-gs-164">Lire automatiquement les réponses</span>
          <input type="checkbox" id="ax-settings-auto-read" aria-label="Lire automatiquement les réponses à voix haute" class="ax-gs-439">
        </label>
        <div id="ax-voice-current" class="ax-gs-438">Voix active : ...</div>
        <div id="ax-voice-categories" style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
          <button class="ax-btn ax-btn-secondary ax-voice-cat-btn" data-cat="all" style="padding:6px 12px;font-size:12px;border-radius:14px;background:rgba(232,184,48,0.15);color:var(--ax-gold);border:1px solid rgba(232,184,48,0.3);cursor:pointer">Tous</button>
          <button class="ax-btn ax-btn-secondary ax-voice-cat-btn" data-cat="pro" style="padding:6px 12px;font-size:12px;border-radius:14px;background:rgba(106,138,255,0.15);color:var(--ax-blue);border:1px solid rgba(106,138,255,0.3);cursor:pointer">PRO</button>
          <button class="ax-btn ax-btn-secondary ax-voice-cat-btn" data-cat="fun" style="padding:6px 12px;font-size:12px;border-radius:14px;background:rgba(255,170,0,0.15);color:var(--ax-warning);border:1px solid rgba(255,170,0,0.3);cursor:pointer">FUN</button>
          <button class="ax-btn ax-btn-secondary ax-voice-cat-btn" data-cat="thematic" style="padding:6px 12px;font-size:12px;border-radius:14px;background:rgba(160,96,255,0.15);color:var(--ax-purple);border:1px solid rgba(160,96,255,0.3);cursor:pointer">Thématique</button>
        </div>
        <div id="ax-voice-list" style="max-height:360px;overflow-y:auto;background:rgba(0,0,0,0.2);border-radius:10px;padding:8px" aria-busy="true" aria-live="polite">
          <div class="ax-voice-skeleton" style="display:flex;flex-direction:column;gap:6px">
            <div style="height:48px;background:linear-gradient(90deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 100%);background-size:200% 100%;animation:ax-shimmer-loading 1.4s linear infinite;border-radius:8px"></div>
            <div style="height:48px;background:linear-gradient(90deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 100%);background-size:200% 100%;animation:ax-shimmer-loading 1.4s linear infinite 200ms;border-radius:8px"></div>
            <div style="height:48px;background:linear-gradient(90deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 100%);background-size:200% 100%;animation:ax-shimmer-loading 1.4s linear infinite 400ms;border-radius:8px"></div>
          </div>
        </div>
      </section>

      <section class="ax-modernized-card" style="${g};animation-delay:250ms">
        <h2 style="${b}"><span style="${v}">🧰</span> Suggestions outils</h2>
        <p class="ax-gs-437">
          Quand Apex détecte un outil pertinent dans tes messages (Studio Music, Finance Pro, etc.), il l'affiche directement dans le chat en plus du toast.
        </p>
        <label style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:10px;cursor:pointer">
          <span style="color:rgba(255,255,255,0.85);font-size:14px">Cards outils dans le chat</span>
          <input type="checkbox" id="ax-settings-tools-auto-embed" aria-label="Afficher cards outils dans le chat" class="ax-gs-439">
        </label>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.4);font-size:12px;line-height:1.4">Décoche pour n'avoir que le toast (5s) sans card permanente. Le bouton ✕ sur chaque card permet aussi de la fermer.</p>
      </section>

      <section class="ax-modernized-card" style="${g};animation-delay:260ms">
        <h2 style="${b}"><span style="${v}">🔄</span> Mise à jour</h2>
        <p class="ax-gs-437">
          Si Apex reste bloqué sur une ancienne version malgré le reload (bug Safari iOS PWA cache), force le reset complet : Service Worker + caches + reload propre vers la dernière version.
        </p>
        <div id="ax-force-update-status" class="ax-gs-438"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-force-update-btn" style="${m};background:rgba(232,184,48,0.15);color:var(--ax-gold);border:1px solid rgba(232,184,48,0.3)">🔄 Force reset PWA + reload</button>
      </section>

      <section class="ax-modernized-card" style="${g};animation-delay:280ms">
        <h2 style="${b}"><span style="${v}">🔐</span> Compte</h2>
        <button class="ax-btn ax-btn-danger" id="ax-settings-logout" style="${m};background:rgba(255,91,91,0.15);color:var(--ax-error);border:1px solid rgba(255,91,91,0.3)">🚪 Se déconnecter</button>
      </section>

      <p class="ax-gs-235"><a href="#chat" style="color:var(--ax-gold);text-decoration:none;font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:rgba(232,184,48,0.08);border-radius:24px;border:1px solid rgba(232,184,48,0.2);transition:all 200ms">← Retour chat</a></p>
    </div>
  `),(async()=>{try{const{memoryBridge:a}=await l(async()=>{const{memoryBridge:r}=await import("./memory-bridge-BxIfcnlt.js");return{memoryBridge:r}},__vite__mapDeps([0,1,2,3]),import.meta.url),t=o.querySelector("#ax-memory-bridge-status"),s=o.querySelector("#ax-memory-bridge-sync"),e=()=>{if(!t)return;const r=a.getHealth(),d=a.getStatus(),n=d.filter(f=>f.last_success).length;t.textContent=`${r.backends_configured} backends configurés · ${n}/${d.length} dernier sync OK`};e(),s&&i&&i.bind(s,"click",()=>{(async()=>{s&&(s.disabled=!0);const r=await a.runAutoSync(),d=r.filter(f=>f.ok).length,{toast:n}=await l(async()=>{const{toast:f}=await import("./toast-BCPNzfMv.js");return{toast:f}},[],import.meta.url);r.length===0?n.warn("Aucun backend configuré"):d===r.length?n.success(`Sync OK (${d}/${r.length})`):n.warn(`Sync partielle (${d}/${r.length})`),e(),s&&(s.disabled=!1)})()})}catch(a){z.warn("feature-settings","memory-bridge wire failed",{err:a})}})();const _=o.querySelector("#ax-conso-scan");_&&i&&i.bind(_,"click",()=>{(async()=>{try{const{consumptionAnomalyDetector:a}=await l(async()=>{const{consumptionAnomalyDetector:e}=await import("./monitoring-s9DMRVdy.js").then(r=>r.J);return{consumptionAnomalyDetector:e}},__vite__mapDeps([0,1,2,3]),import.meta.url),t=a.scanAllVerbose(),s=o.querySelector("#ax-conso-results");if(!s)return;s.innerHTML=t.map(e=>{const r=e.severity==="critical"?"var(--ax-sev-critical)":e.severity==="high"?"var(--ax-sev-high)":e.severity==="medium"?"var(--ax-sev-medium)":e.severity==="low"?"var(--ax-sev-low)":"var(--ax-green)",d=e.severity==="critical"?"ax-sev-critical":e.severity==="high"?"ax-sev-high":e.severity==="medium"?"ax-sev-medium":(e.severity==="low","ax-sev-low"),n=e.severity==="critical"?"🚨":e.severity==="high"?"⚠️":e.severity==="medium"?"🟡":e.severity==="low"?"🔵":"✅";return`<div style="background:rgba(255,255,255,0.03);border-left:3px solid ${r};padding:8px 12px;margin-top:6px;border-radius:4px">
            <strong style="color:${r}">${n} ${e.service}</strong> <span class="ax-sev ${d}">${e.severity}</span>
            <div class="ax-gs-165">${e.reason}</div>
            <div style="font-size:11px;margin-top:4px">${e.recommended_action}</div>
            ${D({rechargeUrl:e.recharge_url,rotateUrl:e.rotate_url,variant:"inline"})}
          </div>`}).join("")}catch(a){z.warn("feature-settings","conso scan failed",{err:a})}})()});const S=o.querySelector("#ax-zoom-inspector-btn");S&&i&&i.bind(S,"click",()=>{(async()=>{const{apexZoomInspector:a}=await l(async()=>{const{apexZoomInspector:t}=await import("./apex-zoom-inspector-CxwrXR88.js");return{apexZoomInspector:t}},__vite__mapDeps([0,1,2,3]),import.meta.url);a.isVisible()?a.hide():a.show()})()});const $=o.querySelector("#ax-functional-test-btn");$&&i&&i.bind($,"click",()=>{(async()=>{const a=o.querySelector("#ax-functional-test-results");if(a){a.innerHTML=`<div style="color:var(--ax-blue)">⏳ Test des boutons en cours (jusqu'à 40 boutons, ~30s)...</div>`;try{const{apexFunctionalTester:t}=await l(async()=>{const{apexFunctionalTester:y}=await import("./apex-functional-tester-CDhbv827.js");return{apexFunctionalTester:y}},__vite__mapDeps([0,1,2,3]),import.meta.url),{reportsHistory:s}=await l(async()=>{const{reportsHistory:y}=await import("./apex-reports-history-CBPN1EHx.js");return{reportsHistory:y}},__vite__mapDeps([0,1,2,3]),import.meta.url),e=await t.testAndAutoFix({maxButtons:30});s.recordFunctional(e.before,e.fixes,e.after,e.improvement);const r=e.before.tested>0?Math.round(e.before.ok/e.before.tested*100):0,d=e.after?` → après fix : ${Math.round(e.after.ok/Math.max(1,e.after.tested)*100)}% OK (${e.improvement>0?"+":""}${Math.round(e.improvement*100)}%)`:"",n=e.before.details.filter(y=>y.status==="no_response"||y.status==="error").slice(0,5).map(y=>`<li class="ax-gs-250">${x(y.label||"(no label)")} → ${x(y.status)}</li>`).join(""),f=e.fixes.applied.map(y=>x(String(y))).join(", ");a.innerHTML=`
            <div style="background:rgba(106,138,255,0.08);border:1px solid rgba(106,138,255,0.3);border-radius:8px;padding:10px;color:#fff;font-size:12px">
              <div class="ax-gs-166">🧪 Test fonctionnel terminé</div>
              <div>Testés : <b>${e.before.tested}</b>/${e.before.totalButtons} · OK : <b class="ax-gs-222">${e.before.ok} (${r}%)</b> · No-response : <b style="color:var(--ax-sev-high)">${e.before.noResponse}</b> · Erreurs : <b style="color:var(--ax-error)">${e.before.errors}</b> · Skipped : ${e.before.skipped}${d}</div>
              ${e.fixes.applied.length?`<div class="ax-gs-75">🔧 Auto-fix appliqué : ${f}</div>`:""}
              ${e.fixes.escalated?'<div style="margin-top:6px;color:var(--ax-error)">⚠ Escaladé à Claude Code (ax_claude_todo)</div>':""}
              ${n?`<ul style="margin:6px 0 0 16px;padding:0">${n}</ul>`:""}
              <div class="ax-gs-167">→ Historique complet dans Admin (Apex Audits Live)</div>
            </div>
          `}catch(t){const s=t instanceof Error?t.message:String(t);a.innerHTML=`<div class="ax-gs-76">❌ Erreur test : ${x(s)}</div>`}}})()});const E=o.querySelector("#ax-layout-inspect-btn");E&&i&&i.bind(E,"click",()=>{(async()=>{const a=o.querySelector("#ax-layout-inspect-results");if(a){a.innerHTML='<div style="color:var(--ax-purple)">⏳ Scan layout...</div>';try{const{apexLayoutInspector:t}=await l(async()=>{const{apexLayoutInspector:n}=await import("./apex-layout-inspector-B-sFc-Fc.js");return{apexLayoutInspector:n}},__vite__mapDeps([0,1,2,3]),import.meta.url),{reportsHistory:s}=await l(async()=>{const{reportsHistory:n}=await import("./apex-reports-history-CBPN1EHx.js");return{reportsHistory:n}},__vite__mapDeps([0,1,2,3]),import.meta.url),e=t.scanDom();s.recordLayout(e);const r=e.hiddenButtons.slice(0,5).map(n=>`<li class="ax-gs-250">"${n.label}" → ${n.reason}</li>`).join(""),d=e.overflowingElements.slice(0,5).map(n=>`<li style="color:var(--ax-error);font-size:11px">${n.tag} (+${n.overflowBy}px)</li>`).join("");a.innerHTML=`
            <div style="background:rgba(180,90,200,0.08);border:1px solid rgba(180,90,200,0.3);border-radius:8px;padding:10px;color:#fff;font-size:12px">
              <div class="ax-gs-166">📐 Layout scan</div>
              <div>Viewport : ${e.viewport.width}×${e.viewport.height} · Document : ${e.documentScroll.width}px</div>
              <div>Overflow horizontal : <b style="color:${e.hasHorizontalOverflow?"var(--ax-error)":"var(--ax-green)"}">${e.hasHorizontalOverflow?"OUI":"NON"}</b> · Boutons cachés : <b style="color:${e.hiddenButtons.length?"var(--ax-sev-high)":"var(--ax-green)"}">${e.hiddenButtons.length}</b> · Touch < 44px : ${e.smallTouchTargets.length}</div>
              ${r?`<div class="ax-gs-75">Boutons cachés:</div><ul class="ax-gs-440">${r}</ul>`:""}
              ${d?`<div class="ax-gs-75">Éléments overflow:</div><ul class="ax-gs-440">${d}</ul>`:""}
              <div class="ax-gs-167">→ Historique complet dans Admin (Apex Audits Live)</div>
            </div>
          `}catch(t){const s=t instanceof Error?t.message:String(t);a.innerHTML=`<div class="ax-gs-76">❌ Erreur scan : ${x(s)}</div>`}}})()});const w=o.querySelector("#ax-cf-diagnostic-btn");w&&i&&i.bind(w,"click",()=>{(async()=>{const a=o.querySelector("#ax-cf-diagnostic-results");if(a){a.innerHTML='<div class="ax-gs-168">⏳ Test Cloudflare API en cours...</div>';try{const{apexCloudflareVaultDeploy:t}=await l(async()=>{const{apexCloudflareVaultDeploy:d}=await import("./apex-cloudflare-vault-deploy-CmIKcnkc.js");return{apexCloudflareVaultDeploy:d}},__vite__mapDeps([0,1,2,3]),import.meta.url),s=await t.runDiagnostic(),e=(d,n,f)=>`
            <div style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px">
              <span style="color:${n?"var(--ax-green)":"var(--ax-error)"};font-weight:700">${n?"✅":"❌"}</span>
              <span style="flex:1;color:rgba(255,255,255,0.85)">${d}</span>
              ${f?`<span class="ax-gs-107">${f}</span>`:""}
            </div>`;let r='<div style="background:rgba(15,15,25,0.8);border:1px solid rgba(247,131,34,0.3);border-radius:10px;padding:12px;margin-top:10px">';r+='<div style="color:var(--ax-warning);font-weight:700;margin-bottom:8px">☁️ Diagnostic Cloudflare</div>',r+=e("Token Cloudflare présent",s.token_present),r+=e("Token valide (HTTP 200)",s.token_valid,s.http_status?`HTTP ${s.http_status}`:""),r+=e("Account ID accessible",!!s.account_id,s.account_name??s.account_id??""),r+=e("Permission KV (Workers KV Storage:Edit)",s.kv_permission,s.namespace_id?`ns ${s.namespace_id.slice(0,8)}…`:""),r+=e("Permission Workers (auto-deploy futur)",s.workers_permission),r+=e("Namespace apex-vault-kevin existe",s.namespace_exists),s.error_reason&&(r+=`<div style="margin-top:10px;padding:8px;background:rgba(255,91,91,0.1);border-left:3px solid var(--ax-error);color:var(--ax-error);font-size:12px;border-radius:4px">${s.error_reason}</div>`),s.fix_url&&(r+=`<div class="ax-gs-114"><a href="${s.fix_url}" target="_blank" rel="noopener" style="color:var(--ax-blue);font-size:12px">🔗 Fix : ${s.fix_url}</a></div>`),r+="</div>",a.innerHTML=r,z.info("cf-diag-manual",`Diagnostic result : token=${s.token_valid} kv=${s.kv_permission} workers=${s.workers_permission}`)}catch(t){const s=t instanceof Error?t.message:String(t);a.textContent="";const e=document.createElement("div");e.style.color="var(--ax-error)",e.textContent=`❌ Erreur : ${s.slice(0,100)}`,a.append(e)}}})()}),o.querySelectorAll("[data-nav-route]").forEach(a=>{i.bind(a,"click",()=>{const t=a.getAttribute("data-nav-route");t&&(location.hash="#"+t)})});const T=o.querySelector("#ax-settings-logout");T&&i&&i.bind(T,"click",()=>{(async()=>{const{auth:a}=await l(async()=>{const{auth:t}=await import("./auth-nzhONbFt.js");return{auth:t}},__vite__mapDeps([4,0,1,2,3]),import.meta.url);a.logout(),location.hash="#login"})()});const h=o.querySelector("#ax-settings-tools-auto-embed");if(h&&i){try{const a=JSON.parse(localStorage.getItem("ax_settings")??"{}");h.checked=a.tools_auto_embed!==!1}catch{h.checked=!0}i.bind(h,"change",()=>{try{const a=JSON.parse(localStorage.getItem("ax_settings")??"{}");a.tools_auto_embed=h.checked,localStorage.setItem("ax_settings",JSON.stringify(a))}catch{}})}const c=o.querySelector("#ax-force-update-btn"),p=o.querySelector("#ax-force-update-status");c&&i&&i.bind(c,"click",()=>{(async()=>{const a=t=>{p&&(p.textContent=t)};c.disabled=!0,c.textContent="⏳ Reset en cours…";try{if(a("🔍 Désinstallation Service Workers…"),"serviceWorker"in navigator){const s=await navigator.serviceWorker.getRegistrations();for(const e of s)await e.unregister();a(`✅ ${s.length} SW désinstallés`)}if(a("🔍 Vidage caches PWA…"),"caches"in window){const s=await caches.keys();for(const e of s)await caches.delete(e);a(`✅ ${s.length} caches vidés`)}a("✅ Reset terminé. Rechargement dans 2s…");const{toast:t}=await l(async()=>{const{toast:s}=await import("./toast-BCPNzfMv.js");return{toast:s}},[],import.meta.url);t.info("🔄 Reset OK — reload imminent"),setTimeout(()=>{location.href=location.pathname+"?_forceupd=1&_reset="+Date.now()},2e3)}catch(t){a(`❌ Erreur : ${String(t)}`),c.disabled=!1,c.textContent="🔄 Force reset PWA + reload"}})()}),q(o);const u=o.querySelector("#ax-settings-notif-test");u&&i&&i.bind(u,"click",()=>{(async()=>{try{if("Notification"in window&&Notification.permission==="granted")new Notification("Test Apex",{body:"Si tu vois ça, push notif fonctionne ✅"});else if("Notification"in window)if(await Notification.requestPermission()==="granted")new Notification("Test Apex",{body:"Push activé ✅"});else{const{toast:t}=await l(async()=>{const{toast:s}=await import("./toast-BCPNzfMv.js");return{toast:s}},[],import.meta.url);t.warn("Permission notifications refusée")}else{const{toast:a}=await l(async()=>{const{toast:t}=await import("./toast-BCPNzfMv.js");return{toast:t}},[],import.meta.url);a.warn("Notifications non supportées par ce navigateur")}}catch{const{toast:a}=await l(async()=>{const{toast:t}=await import("./toast-BCPNzfMv.js");return{toast:t}},[],import.meta.url);a.warn("Test notification échoué")}})()}),z.info("feature-settings","rendered")}export{K as dispose,W as render,q as wireVoiceSection};
