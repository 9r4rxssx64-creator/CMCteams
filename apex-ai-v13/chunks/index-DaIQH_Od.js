const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-0Or-o96J.js","./multi-source-analyze-U7RQC08b.js","./credential-patterns-DUMYZEMu.js","./apex-kb-CzSg8Qy1.js","./auth-AJtBCkaN.js"])))=>i.map(i=>d[i]);
import{b as I,e as u,_ as p,l as z}from"./monitoring-0Or-o96J.js";import{c as E}from"./listener-cleanup-Y2rGGxxX.js";import{c as O}from"./csp-style-helper-BEHhIhzj.js";import{r as D}from"./recharge-action-1x0bo8gv.js";import"./multi-source-analyze-U7RQC08b.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-CzSg8Qy1.js";let o=null;function W(){o?.cleanup(),o=null}const P="apex_v13_chat_auto_read";function V(){try{return localStorage.getItem(P)==="1"}catch{return!1}}function q(i){try{localStorage.setItem(P,i?"1":"0")}catch{}}async function R(i){try{const k=await p(()=>import("./voice-C2x1XHI-.js"),__vite__mapDeps([0,1,2,3]),import.meta.url),{listVoices:A,getActiveVoice:x,setActiveVoice:m,speak:v,stopAll:g}=k,_=i.querySelector("#ax-settings-auto-read"),S=i.querySelector("#ax-voice-current"),w=i.querySelector("#ax-voice-list"),L=i.querySelectorAll(".ax-voice-cat-btn");if(!w)return;_&&(_.checked=V(),o.bind(_,"change",()=>{q(_.checked),(async()=>{const{toast:l}=await p(async()=>{const{toast:d}=await import("./toast-CRdbcLoc.js");return{toast:d}},[],import.meta.url);l.success(_.checked?"Lecture auto activée":"Lecture auto désactivée")})()}));const T=()=>{if(!S)return;const l=x(),b=A().find(h=>h.id===l);S.textContent=b?`Voix active : ${b.emoji??"🔊"} ${b.name} (${b.category})`:`Voix active : ${l}`};T();const $=l=>{const d=A(),b=l==="all"?d:d.filter(t=>t.category===l),h=x();w.setAttribute("aria-busy","false"),w.innerHTML=b.map(t=>{const s=t.id===h,a=t.emoji??(t.category==="pro"?"🎙️":t.category==="fun"?"🎉":"🎨"),e=t.description?u(t.description):"";return`
            <div class="ax-voice-item${s?" is-active":""}" data-voice-id="${u(t.id)}">
              <span class="ax-gs-17">${a}</span>
              <div class="ax-gs-6">
                <div class="ax-voice-item__name">${u(t.name)}${s?' <span style="color:var(--ax-gold);font-size:11px">★ active</span>':""}</div>
                <div class="ax-voice-item__meta">${u(t.category)}${e?" · "+e:""}</div>
              </div>
              <button class="ax-voice-item__action ax-voice-item__action--test" data-test-voice="${u(t.id)}" title="Tester cette voix" aria-label="Tester ${u(t.name)}">▶</button>
              <button class="ax-voice-item__action ax-voice-item__action--set" data-set-voice="${u(t.id)}" title="Définir comme voix par défaut" aria-label="Définir ${u(t.name)} par défaut">★</button>
            </div>
          `}).join("")};$("all"),L.forEach(l=>{o.bind(l,"click",()=>{const d=l.getAttribute("data-cat");d&&$(d)})}),o.bind(w,"click",l=>{const d=l.target,b=d.closest("[data-test-voice]"),h=d.closest("[data-set-voice]");if(b){const t=b.getAttribute("data-test-voice");if(!t)return;(async()=>{g();const s=await v("Bonjour Kevin, je suis ta voix.",t);if(!s.ok){const{toast:a}=await p(async()=>{const{toast:e}=await import("./toast-CRdbcLoc.js");return{toast:e}},[],import.meta.url);a.warn(`Test échoué : ${s.reason??"erreur"}`)}})();return}if(h){const t=h.getAttribute("data-set-voice");if(!t)return;(async()=>{await m(t),T();const s=i.querySelector(".ax-voice-cat-btn[data-cat]:focus")?.getAttribute("data-cat")??"all";$(s);const{toast:a}=await p(async()=>{const{toast:c}=await import("./toast-CRdbcLoc.js");return{toast:c}},[],import.meta.url),r=A().find(c=>c.id===t);a.success(r?`Voix par défaut : ${r.name}`:"Voix mise à jour")})()}})}catch(k){z.warn("feature-settings","wireVoiceSection failed",{err:k})}}function K(i){o?.cleanup(),o=E("settings");const k=I.get("user"),A=I.get("isAdmin")??!1,x="background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;margin-top:14px;max-width:100%;box-sizing:border-box;transition:all 240ms cubic-bezier(0.16,1,0.3,1)",m="margin:0 0 12px;font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.01em;display:flex;align-items:center;gap:10px",v="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:linear-gradient(135deg,rgba(232,184,48,0.2),rgba(201,162,39,0.08));border:1px solid rgba(232,184,48,0.25);border-radius:10px;font-size:16px",g="width:100%;max-width:100%;box-sizing:border-box;min-height:44px;padding:12px 16px;font-size:14px;font-weight:600;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1);white-space:normal;word-break:break-word;overflow-wrap:anywhere;text-align:left";i.innerHTML=O.withNonce(`
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
        <p class="ax-gs-399">Utilisateur : <strong style="color:rgba(255,255,255,0.9)">${u(k?.name??"inconnu")}</strong> ${A?'<span style="color:var(--ax-gold)">👑 Admin</span>':""}</p>
      </header>

      <section class="ax-modernized-card" style="${x};animation-delay:60ms">
        <h2 style="${m}"><span style="${v}">🔑</span> Clés API</h2>
        <p class="ax-gs-437">Gère tes clés API (Anthropic, OpenAI, Stripe, etc.) dans le Coffre sécurisé.</p>
        <button class="ax-btn ax-btn-primary" data-nav-route="vault" style="${g};background:linear-gradient(135deg,var(--ax-gold-deep),var(--ax-gold));color:#000;border:none">🔐 Ouvrir le Coffre</button>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:100ms">
        <h2 style="${m}"><span style="${v}">🎨</span> Apparence</h2>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px">
          <span class="ax-gs-164">Thème actuel</span>
          <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(232,184,48,0.12);color:var(--ax-gold);border-radius:24px;font-size:12px;font-weight:700;letter-spacing:0.04em">
            <span style="width:8px;height:8px;background:var(--ax-gold);border-radius:50%;box-shadow:0 0 10px var(--ax-gold)"></span> DARK
          </span>
        </div>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:140ms">
        <h2 style="${m}"><span style="${v}">🔔</span> Notifications</h2>
        <p class="ax-gs-437">Active les notifications push pour rester informé en temps réel.</p>
        <button class="ax-btn ax-btn-secondary" id="ax-settings-notif-test" style="${g};background:rgba(106,138,255,0.15);color:var(--ax-blue);border:1px solid rgba(106,138,255,0.3)">🔔 Tester notification push</button>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:180ms">
        <h2 style="${m}"><span style="${v}">🧠</span> Mémoire externe</h2>
        <p style="margin:0 0 10px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5">
          Backup mémoire vers Notion / GitHub Gist / Firebase. Tokens lus depuis le Coffre.
        </p>
        <div id="ax-memory-bridge-status" class="ax-gs-438"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-memory-bridge-sync" style="${g};background:rgba(160,96,255,0.15);color:var(--ax-purple);border:1px solid rgba(160,96,255,0.3)">🔄 Sync maintenant</button>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:220ms">
        <h2 style="${m}"><span style="${v}">📊</span> Conso API temps réel</h2>
        <p class="ax-gs-437">
          Apex surveille ta conso et détecte si une clé est utilisée anormalement (potentielle compromission).
        </p>
        <button class="ax-btn ax-btn-secondary" id="ax-conso-scan" style="${g};margin-bottom:10px;background:rgba(34,204,119,0.15);color:var(--ax-green);border:1px solid rgba(34,204,119,0.3)">🔍 Scanner toutes mes API maintenant</button>
        <div id="ax-conso-results" class="ax-gs-196"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-zoom-inspector-btn" style="${g};margin-top:10px;background:rgba(201,162,39,0.15);color:var(--ax-gold-deep);border:1px solid rgba(201,162,39,0.3)">🔍 Zoom Inspector live (debug UX zoom Kevin)</button>
        <button class="ax-btn ax-btn-secondary" id="ax-cf-diagnostic-btn" style="${g};margin-top:10px;background:rgba(247,131,34,0.15);color:var(--ax-warning);border:1px solid rgba(247,131,34,0.3)">☁️ Tester Cloudflare API maintenant</button>
        <div id="ax-cf-diagnostic-results" class="ax-gs-249"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-functional-test-btn" style="${g};margin-top:10px;background:rgba(106,138,255,0.15);color:var(--ax-blue);border:1px solid rgba(106,138,255,0.35)">🧪 Tester tous les boutons + auto-fix (v13.4.182)</button>
        <div id="ax-functional-test-results" class="ax-gs-249"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-layout-inspect-btn" style="${g};margin-top:10px;background:rgba(180,90,200,0.15);color:var(--ax-purple);border:1px solid rgba(180,90,200,0.35)">📐 Scanner la vue actuelle (overflow, boutons cachés)</button>
        <div id="ax-layout-inspect-results" class="ax-gs-249"></div>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:240ms">
        <h2 style="${m}"><span style="${v}">🔊</span> Voix &amp; Lecture</h2>
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

      <section class="ax-modernized-card" style="${x};animation-delay:250ms">
        <h2 style="${m}"><span style="${v}">🧰</span> Suggestions outils</h2>
        <p class="ax-gs-437">
          Quand Apex détecte un outil pertinent dans tes messages (Studio Music, Finance Pro, etc.), il l'affiche directement dans le chat en plus du toast.
        </p>
        <label style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:10px;cursor:pointer">
          <span style="color:rgba(255,255,255,0.85);font-size:14px">Cards outils dans le chat</span>
          <input type="checkbox" id="ax-settings-tools-auto-embed" aria-label="Afficher cards outils dans le chat" class="ax-gs-439">
        </label>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.4);font-size:12px;line-height:1.4">Décoche pour n'avoir que le toast (5s) sans card permanente. Le bouton ✕ sur chaque card permet aussi de la fermer.</p>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:260ms">
        <h2 style="${m}"><span style="${v}">🔄</span> Mise à jour</h2>
        <p class="ax-gs-437">
          Si Apex reste bloqué sur une ancienne version malgré le reload (bug Safari iOS PWA cache), force le reset complet : Service Worker + caches + reload propre vers la dernière version.
        </p>
        <div id="ax-force-update-status" class="ax-gs-438"></div>
        <button class="ax-btn ax-btn-secondary" id="ax-force-update-btn" style="${g};background:rgba(232,184,48,0.15);color:var(--ax-gold);border:1px solid rgba(232,184,48,0.3)">🔄 Force reset PWA + reload</button>
      </section>

      <section class="ax-modernized-card" style="${x};animation-delay:280ms">
        <h2 style="${m}"><span style="${v}">🔐</span> Compte</h2>
        <button class="ax-btn ax-btn-danger" id="ax-settings-logout" style="${g};background:rgba(255,91,91,0.15);color:var(--ax-error);border:1px solid rgba(255,91,91,0.3)">🚪 Se déconnecter</button>
      </section>

      <p class="ax-gs-235"><a href="#chat" style="color:var(--ax-gold);text-decoration:none;font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:rgba(232,184,48,0.08);border-radius:24px;border:1px solid rgba(232,184,48,0.2);transition:all 200ms">← Retour chat</a></p>
    </div>
  `),(async()=>{try{const{memoryBridge:t}=await p(async()=>{const{memoryBridge:r}=await import("./memory-bridge-C_qEOl6E.js");return{memoryBridge:r}},__vite__mapDeps([0,1,2,3]),import.meta.url),s=i.querySelector("#ax-memory-bridge-status"),a=i.querySelector("#ax-memory-bridge-sync"),e=()=>{if(!s)return;const r=t.getHealth(),c=t.getStatus(),n=c.filter(y=>y.last_success).length;s.textContent=`${r.backends_configured} backends configurés · ${n}/${c.length} dernier sync OK`};e(),a&&o&&o.bind(a,"click",()=>{(async()=>{a&&(a.disabled=!0);const r=await t.runAutoSync(),c=r.filter(y=>y.ok).length,{toast:n}=await p(async()=>{const{toast:y}=await import("./toast-CRdbcLoc.js");return{toast:y}},[],import.meta.url);r.length===0?n.warn("Aucun backend configuré"):c===r.length?n.success(`Sync OK (${c}/${r.length})`):n.warn(`Sync partielle (${c}/${r.length})`),e(),a&&(a.disabled=!1)})()})}catch(t){z.warn("feature-settings","memory-bridge wire failed",{err:t})}})();const _=i.querySelector("#ax-conso-scan");_&&o&&o.bind(_,"click",()=>{(async()=>{try{const{consumptionAnomalyDetector:t}=await p(async()=>{const{consumptionAnomalyDetector:e}=await import("./monitoring-0Or-o96J.js").then(r=>r.J);return{consumptionAnomalyDetector:e}},__vite__mapDeps([0,1,2,3]),import.meta.url),s=t.scanAllVerbose(),a=i.querySelector("#ax-conso-results");if(!a)return;a.innerHTML=s.map(e=>{const r=e.severity==="critical"?"var(--ax-sev-critical)":e.severity==="high"?"var(--ax-sev-high)":e.severity==="medium"?"var(--ax-sev-medium)":e.severity==="low"?"var(--ax-sev-low)":"var(--ax-green)",c=e.severity==="critical"?"ax-sev-critical":e.severity==="high"?"ax-sev-high":e.severity==="medium"?"ax-sev-medium":(e.severity==="low","ax-sev-low"),n=e.severity==="critical"?"🚨":e.severity==="high"?"⚠️":e.severity==="medium"?"🟡":e.severity==="low"?"🔵":"✅";return`<div style="background:rgba(255,255,255,0.03);border-left:3px solid ${r};padding:8px 12px;margin-top:6px;border-radius:4px">
            <strong style="color:${r}">${n} ${e.service}</strong> <span class="ax-sev ${c}">${e.severity}</span>
            <div class="ax-gs-165">${e.reason}</div>
            <div style="font-size:11px;margin-top:4px">${e.recommended_action}</div>
            ${D({rechargeUrl:e.recharge_url,rotateUrl:e.rotate_url,variant:"inline"})}
          </div>`}).join("")}catch(t){z.warn("feature-settings","conso scan failed",{err:t})}})()});const S=i.querySelector("#ax-zoom-inspector-btn");S&&o&&o.bind(S,"click",()=>{(async()=>{const{apexZoomInspector:t}=await p(async()=>{const{apexZoomInspector:s}=await import("./apex-zoom-inspector-CqfxB1l4.js");return{apexZoomInspector:s}},__vite__mapDeps([0,1,2,3]),import.meta.url);t.isVisible()?t.hide():t.show()})()});const w=i.querySelector("#ax-functional-test-btn");w&&o&&o.bind(w,"click",()=>{(async()=>{const t=i.querySelector("#ax-functional-test-results");if(t){t.innerHTML=`<div style="color:var(--ax-blue)">⏳ Test des boutons en cours (jusqu'à 40 boutons, ~30s)...</div>`;try{const{apexFunctionalTester:s}=await p(async()=>{const{apexFunctionalTester:f}=await import("./apex-functional-tester-Ch3D1BmW.js");return{apexFunctionalTester:f}},__vite__mapDeps([0,1,2,3]),import.meta.url),{reportsHistory:a}=await p(async()=>{const{reportsHistory:f}=await import("./apex-reports-history-DJyop_DW.js");return{reportsHistory:f}},__vite__mapDeps([0,1,2,3]),import.meta.url),e=await s.testAndAutoFix({maxButtons:30});a.recordFunctional(e.before,e.fixes,e.after,e.improvement);const r=e.before.tested>0?Math.round(e.before.ok/e.before.tested*100):0,c=e.after?` → après fix : ${Math.round(e.after.ok/Math.max(1,e.after.tested)*100)}% OK (${e.improvement>0?"+":""}${Math.round(e.improvement*100)}%)`:"",n=e.before.details.filter(f=>f.status==="no_response"||f.status==="error").slice(0,5).map(f=>`<li class="ax-gs-250">${u(f.label||"(no label)")} → ${u(f.status)}</li>`).join(""),y=e.fixes.applied.map(f=>u(String(f))).join(", ");t.innerHTML=`
            <div style="background:rgba(106,138,255,0.08);border:1px solid rgba(106,138,255,0.3);border-radius:8px;padding:10px;color:#fff;font-size:12px">
              <div class="ax-gs-166">🧪 Test fonctionnel terminé</div>
              <div>Testés : <b>${e.before.tested}</b>/${e.before.totalButtons} · OK : <b class="ax-gs-222">${e.before.ok} (${r}%)</b> · No-response : <b style="color:var(--ax-sev-high)">${e.before.noResponse}</b> · Erreurs : <b style="color:var(--ax-error)">${e.before.errors}</b> · Skipped : ${e.before.skipped}${c}</div>
              ${e.fixes.applied.length?`<div class="ax-gs-75">🔧 Auto-fix appliqué : ${y}</div>`:""}
              ${e.fixes.escalated?'<div style="margin-top:6px;color:var(--ax-error)">⚠ Escaladé à Claude Code (ax_claude_todo)</div>':""}
              ${n?`<ul style="margin:6px 0 0 16px;padding:0">${n}</ul>`:""}
              <div class="ax-gs-167">→ Historique complet dans Admin (Apex Audits Live)</div>
            </div>
          `}catch(s){const a=s instanceof Error?s.message:String(s);t.innerHTML=`<div class="ax-gs-76">❌ Erreur test : ${u(a)}</div>`}}})()});const L=i.querySelector("#ax-layout-inspect-btn");L&&o&&o.bind(L,"click",()=>{(async()=>{const t=i.querySelector("#ax-layout-inspect-results");if(t){t.innerHTML='<div style="color:var(--ax-purple)">⏳ Scan layout...</div>';try{const{apexLayoutInspector:s}=await p(async()=>{const{apexLayoutInspector:n}=await import("./apex-layout-inspector-NbwDuDav.js");return{apexLayoutInspector:n}},__vite__mapDeps([0,1,2,3]),import.meta.url),{reportsHistory:a}=await p(async()=>{const{reportsHistory:n}=await import("./apex-reports-history-DJyop_DW.js");return{reportsHistory:n}},__vite__mapDeps([0,1,2,3]),import.meta.url),e=s.scanDom();a.recordLayout(e);const r=e.hiddenButtons.slice(0,5).map(n=>`<li class="ax-gs-250">"${n.label}" → ${n.reason}</li>`).join(""),c=e.overflowingElements.slice(0,5).map(n=>`<li style="color:var(--ax-error);font-size:11px">${n.tag} (+${n.overflowBy}px)</li>`).join("");t.innerHTML=`
            <div style="background:rgba(180,90,200,0.08);border:1px solid rgba(180,90,200,0.3);border-radius:8px;padding:10px;color:#fff;font-size:12px">
              <div class="ax-gs-166">📐 Layout scan</div>
              <div>Viewport : ${e.viewport.width}×${e.viewport.height} · Document : ${e.documentScroll.width}px</div>
              <div>Overflow horizontal : <b style="color:${e.hasHorizontalOverflow?"var(--ax-error)":"var(--ax-green)"}">${e.hasHorizontalOverflow?"OUI":"NON"}</b> · Boutons cachés : <b style="color:${e.hiddenButtons.length?"var(--ax-sev-high)":"var(--ax-green)"}">${e.hiddenButtons.length}</b> · Touch < 44px : ${e.smallTouchTargets.length}</div>
              ${r?`<div class="ax-gs-75">Boutons cachés:</div><ul class="ax-gs-440">${r}</ul>`:""}
              ${c?`<div class="ax-gs-75">Éléments overflow:</div><ul class="ax-gs-440">${c}</ul>`:""}
              <div class="ax-gs-167">→ Historique complet dans Admin (Apex Audits Live)</div>
            </div>
          `}catch(s){const a=s instanceof Error?s.message:String(s);t.innerHTML=`<div class="ax-gs-76">❌ Erreur scan : ${u(a)}</div>`}}})()});const T=i.querySelector("#ax-cf-diagnostic-btn");T&&o&&o.bind(T,"click",()=>{(async()=>{const t=i.querySelector("#ax-cf-diagnostic-results");if(t){t.innerHTML='<div class="ax-gs-168">⏳ Test Cloudflare API en cours...</div>';try{const{apexCloudflareVaultDeploy:s}=await p(async()=>{const{apexCloudflareVaultDeploy:c}=await import("./apex-cloudflare-vault-deploy-CUBgGgJ2.js");return{apexCloudflareVaultDeploy:c}},__vite__mapDeps([0,1,2,3]),import.meta.url),a=await s.runDiagnostic(),e=(c,n,y)=>`
            <div style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px">
              <span style="color:${n?"var(--ax-green)":"var(--ax-error)"};font-weight:700">${n?"✅":"❌"}</span>
              <span style="flex:1;color:rgba(255,255,255,0.85)">${c}</span>
              ${y?`<span class="ax-gs-107">${y}</span>`:""}
            </div>`;let r='<div style="background:rgba(15,15,25,0.8);border:1px solid rgba(247,131,34,0.3);border-radius:10px;padding:12px;margin-top:10px">';r+='<div style="color:var(--ax-warning);font-weight:700;margin-bottom:8px">☁️ Diagnostic Cloudflare</div>',r+=e("Token Cloudflare présent",a.token_present),r+=e("Token valide (HTTP 200)",a.token_valid,a.http_status?`HTTP ${a.http_status}`:""),r+=e("Account ID accessible",!!a.account_id,a.account_name??a.account_id??""),r+=e("Permission KV (Workers KV Storage:Edit)",a.kv_permission,a.namespace_id?`ns ${a.namespace_id.slice(0,8)}…`:""),r+=e("Permission Workers (auto-deploy futur)",a.workers_permission),r+=e("Namespace apex-vault-kevin existe",a.namespace_exists),a.error_reason&&(r+=`<div style="margin-top:10px;padding:8px;background:rgba(255,91,91,0.1);border-left:3px solid var(--ax-error);color:var(--ax-error);font-size:12px;border-radius:4px">${a.error_reason}</div>`),a.fix_url&&(r+=`<div class="ax-gs-114"><a href="${a.fix_url}" target="_blank" rel="noopener" style="color:var(--ax-blue);font-size:12px">🔗 Fix : ${a.fix_url}</a></div>`),r+="</div>",t.innerHTML=r,z.info("cf-diag-manual",`Diagnostic result : token=${a.token_valid} kv=${a.kv_permission} workers=${a.workers_permission}`)}catch(s){const a=s instanceof Error?s.message:String(s);t.textContent="";const e=document.createElement("div");e.style.color="var(--ax-error)",e.textContent=`❌ Erreur : ${a.slice(0,100)}`,t.append(e)}}})()}),i.querySelectorAll("[data-nav-route]").forEach(t=>{o.bind(t,"click",()=>{const s=t.getAttribute("data-nav-route");s&&(location.hash="#"+s)})});const $=i.querySelector("#ax-settings-logout");$&&o&&o.bind($,"click",()=>{(async()=>{const{auth:t}=await p(async()=>{const{auth:s}=await import("./auth-AJtBCkaN.js");return{auth:s}},__vite__mapDeps([4,0,1,2,3]),import.meta.url);t.logout(),location.hash="#login"})()});const l=i.querySelector("#ax-settings-tools-auto-embed");if(l&&o){try{const t=JSON.parse(localStorage.getItem("ax_settings")??"{}");l.checked=t.tools_auto_embed!==!1}catch{l.checked=!0}o.bind(l,"change",()=>{try{const t=JSON.parse(localStorage.getItem("ax_settings")??"{}");t.tools_auto_embed=l.checked,localStorage.setItem("ax_settings",JSON.stringify(t))}catch{}})}const d=i.querySelector("#ax-force-update-btn"),b=i.querySelector("#ax-force-update-status");d&&o&&o.bind(d,"click",()=>{(async()=>{const t=s=>{b&&(b.textContent=s)};d.disabled=!0,d.textContent="⏳ Reset en cours…";try{if(t("🔍 Désinstallation Service Workers…"),"serviceWorker"in navigator){const a=await navigator.serviceWorker.getRegistrations();for(const e of a)await e.unregister();t(`✅ ${a.length} SW désinstallés`)}if(t("🔍 Vidage caches PWA…"),"caches"in window){const a=await caches.keys();for(const e of a)await caches.delete(e);t(`✅ ${a.length} caches vidés`)}t("✅ Reset terminé. Rechargement dans 2s…");const{toast:s}=await p(async()=>{const{toast:a}=await import("./toast-CRdbcLoc.js");return{toast:a}},[],import.meta.url);s.info("🔄 Reset OK — reload imminent"),setTimeout(()=>{location.href=location.pathname+"?_forceupd=1&_reset="+Date.now()},2e3)}catch(s){t(`❌ Erreur : ${String(s)}`),d.disabled=!1,d.textContent="🔄 Force reset PWA + reload"}})()}),R(i);const h=i.querySelector("#ax-settings-notif-test");h&&o&&o.bind(h,"click",()=>{(async()=>{try{if("Notification"in window&&Notification.permission==="granted")new Notification("Test Apex",{body:"Si tu vois ça, push notif fonctionne ✅"});else if("Notification"in window)if(await Notification.requestPermission()==="granted")new Notification("Test Apex",{body:"Push activé ✅"});else{const{toast:s}=await p(async()=>{const{toast:a}=await import("./toast-CRdbcLoc.js");return{toast:a}},[],import.meta.url);s.warn("Permission notifications refusée")}else{const{toast:t}=await p(async()=>{const{toast:s}=await import("./toast-CRdbcLoc.js");return{toast:s}},[],import.meta.url);t.warn("Notifications non supportées par ce navigateur")}}catch{const{toast:t}=await p(async()=>{const{toast:s}=await import("./toast-CRdbcLoc.js");return{toast:s}},[],import.meta.url);t.warn("Test notification échoué")}})()}),z.info("feature-settings","rendered")}export{W as dispose,K as render,R as wireVoiceSection};
