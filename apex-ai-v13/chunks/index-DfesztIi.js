const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-yJ4fpvfw.js","./multi-source-analyze-CutjfdEy.js","./credential-patterns-DUMYZEMu.js","./apex-kb-HxI2DoPN.js"])))=>i.map(i=>d[i]);
import{_ as g,b,e as i,l as v}from"./monitoring-yJ4fpvfw.js";import{c as f}from"./listener-cleanup-Y2rGGxxX.js";import{g as m}from"./apex-tools-dispatch-core-DnnEbCaL.js";import{c as h}from"./csp-style-helper-BEHhIhzj.js";import{haptic as y}from"./haptic-CQFg2PXZ.js";import{r as w}from"./recharge-action-B5bxXsSY.js";import"./multi-source-analyze-CutjfdEy.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-HxI2DoPN.js";import"./apex-tools-dispatch-skills-C2UUyJm6.js";import"./apex-tools-dispatch-data-D7Pfr6Cn.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-De71cNx9.js";import"./apex-tools-misc-TdrAJt0n.js";import"./apex-tools-registry-core-B4u4pCoL.js";import"./apex-tools-registry-skills-x-mAWYry.js";let p=null;function G(){p?.cleanup(),p=null}const $=[{id:"chat",icon:"💬",label:"Chat",description:"Conversation IA",route:"chat",color:"var(--ax-blue-bright)"},{id:"vault",icon:"🔐",label:"Coffre",description:"Clés API & secrets",route:"vault",color:"var(--ax-gold-deep)"},{id:"browser",icon:"🌐",label:"Browser",description:"Naviguer & embed",route:"browser",color:"var(--ax-green)"},{id:"studios",icon:"🎨",label:"Studios",description:"Créatif (musique/vidéo)",route:"studios",color:"var(--ax-purple)"},{id:"pro",icon:"🎓",label:"Pro",description:"Modules expert",route:"pro",color:"var(--ax-pink)"},{id:"self-diag",icon:"🩺",label:"Audit",description:"Auto-diagnostic",route:"self-diag",color:"var(--ax-cyan)"},{id:"settings",icon:"⚙️",label:"Réglages",description:"Configurer Apex",route:"settings",color:"var(--ax-text-dim)"},{id:"rgpd",icon:"🛡",label:"RGPD",description:"Mes données",route:"admin-rgpd",color:"var(--ax-gold)"}];async function k(){let t=0,a=0,s=0,r=0,e=0,c=0;try{const l=localStorage.getItem("apex_v13_messages_24h")??"0",o=parseInt(l,10);Number.isNaN(o)||(t=o)}catch{}try{const l=localStorage.getItem("apex_v13_tokens_24h")??"0",o=parseInt(l,10);Number.isNaN(o)||(a=o)}catch{}try{const{kdmcProjectsRegistry:l}=await g(async()=>{const{kdmcProjectsRegistry:o}=await import("./kdmc-projects-registry-I6PVTCby.js");return{kdmcProjectsRegistry:o}},__vite__mapDeps([0,1,2,3]),import.meta.url);s=l.countActive()}catch{}try{const{sentinels:l}=await g(async()=>{const{sentinels:n}=await import("./sentinels-DWjIaYSq.js");return{sentinels:n}},__vite__mapDeps([0,1,2,3]),import.meta.url),o=l.list();e=o.length,r=o.filter(n=>n.lastResult?.ok).length}catch{}try{const l=localStorage.getItem("ax_claude_todo")??"[]",o=JSON.parse(l);Array.isArray(o)&&(c=o.filter(n=>n.status==="pending").length)}catch{}return[{id:"messages",icon:"💬",label:"Messages 24h",value:t,color:"var(--ax-blue-bright)",route:"chat"},{id:"tokens",icon:"🔢",label:"Tokens 24h",value:a.toLocaleString("fr-FR"),color:"var(--ax-gold-deep)",route:"self-diag"},{id:"projects",icon:"📦",label:"Projets actifs",value:s,color:"var(--ax-green)",route:"admin"},{id:"sentinels",icon:"🛡",label:"Sentinelles OK",value:`${r}/${e}`,color:r===e?"var(--ax-green)":"var(--ax-warning)",route:"sentinels"},{id:"todos",icon:"📋",label:"Todos en attente",value:c,color:c>0?"var(--ax-error)":"var(--ax-green)",route:"self-diag"}]}async function _(){const t=[];try{const{sentinels:a}=await g(async()=>{const{sentinels:e}=await import("./sentinels-DWjIaYSq.js");return{sentinels:e}},__vite__mapDeps([0,1,2,3]),import.meta.url),r=a.list().filter(e=>e.lastResult&&!e.lastResult.ok);for(const e of r.slice(0,3))t.push({id:`sentinel_${e.id}`,level:"warn",title:`Sentinelle ${e.name}`,description:e.lastResult?.msg??"KO",ts:e.lastResult?.ts??Date.now(),action_route:"sentinels"})}catch{}try{const a=JSON.parse(localStorage.getItem("apex_v13_credentials_expiring")??"[]");if(Array.isArray(a))for(const s of a.slice(0,3))s.days_left<30&&t.push({id:`cred_${s.service}`,level:s.days_left<7?"error":"warn",title:`Credential ${s.service}`,description:`Expire dans ${s.days_left} jours`,ts:Date.now(),action_route:"vault"})}catch{}return t}async function z(){try{const{multiKeyVault:t}=await g(async()=>{const{multiKeyVault:r}=await import("./multi-key-vault-BoBy4CSb.js");return{multiKeyVault:r}},__vite__mapDeps([0,1,2,3]),import.meta.url),a=t.getKnownServices(),s=[];for(const r of a){const e=t.getStats(r),c=t.getServiceLight(r);s.push({service:r,light:c,totalKeys:e.total,activeKeys:e.active,failingKeys:e.failing,invalidKeys:e.invalid,lastSuccess:e.lastSuccess})}return s}catch{return[]}}function S(){const t=[];try{const a=localStorage.getItem("ax_claude_todo")??"[]",s=JSON.parse(a);if(Array.isArray(s))for(const r of s.filter(e=>e.status==="pending").slice(0,5))t.push({id:r.id??`todo_${Date.now()}`,source:"apex_todo",title:r.reason??"Todo sans description",severity:r.severity??"medium",ts_created:r.ts??Date.now()})}catch{}return t}function A(t,a=0){return`
    <button class="ax-kpi-card ax-modernized-card ax-bounce-tap" data-route="${i(t.route)}"
      style="position:relative;background:linear-gradient(135deg,rgba(20,20,35,0.85),rgba(14,14,28,0.75));backdrop-filter:blur(20px) saturate(140%);-webkit-backdrop-filter:blur(20px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px 16px;cursor:pointer;text-align:center;transition:all 280ms cubic-bezier(0.34,1.56,0.64,1);overflow:hidden;min-height:120px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:6px;animation:ax-fade-up 320ms cubic-bezier(0.34,1.56,0.64,1) ${30+a*20}ms backwards;-webkit-tap-highlight-color:transparent">
      <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,${i(t.color)},transparent);border-radius:16px 16px 0 0;opacity:0.85"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(circle at top right,${i(t.color)}11,transparent 60%);pointer-events:none"></div>
      <div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 8px ${i(t.color)}40)">${i(t.icon)}</div>
      <div style="font-size:26px;font-weight:800;color:${i(t.color)};line-height:1;letter-spacing:-0.02em;font-feature-settings:'tnum'">${i(String(t.value))}</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.06em;font-weight:600">${i(t.label)}</div>
    </button>`}function R(t,a=0){return`
    <button class="ax-shortcut-card ax-modernized-card ax-bounce-tap" data-route="${i(t.route)}"
      style="position:relative;background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.55));backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px;cursor:pointer;text-align:left;transition:all 240ms cubic-bezier(0.16,1,0.3,1);display:flex;align-items:center;gap:14px;min-height:72px;overflow:hidden;animation:ax-fade-up 320ms cubic-bezier(0.34,1.56,0.64,1) ${30+a*20}ms backwards;-webkit-tap-highlight-color:transparent">
      <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,${i(t.color)},${i(t.color)}88);border-radius:14px 0 0 14px"></div>
      <span style="font-size:30px;flex-shrink:0;filter:drop-shadow(0 4px 12px ${i(t.color)}40);transition:transform 240ms cubic-bezier(0.34,1.56,0.64,1)" class="ax-shortcut-icon">${i(t.icon)}</span>
      <div class="ax-gs-6">
        <div style="font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.01em;line-height:1.3">${i(t.label)}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.55);line-height:1.4;margin-top:2px">${i(t.description)}</div>
      </div>
      <span style="color:${i(t.color)};font-size:20px;flex-shrink:0;transition:transform 240ms cubic-bezier(0.34,1.56,0.64,1)" class="ax-shortcut-arrow">→</span>
    </button>`}function K(t){return t.length===0?`
      <div class="ax-gs-132">
        <span class="ax-gs-133">✅</span>
        <span class="ax-gs-134">Aucune alerte. Tout fonctionne.</span>
      </div>`:t.map((a,s)=>{const r=a.level==="error"?"var(--ax-sev-critical)":a.level==="warn"?"var(--ax-sev-high)":"var(--ax-sev-low)",e=a.level==="error"?"255,91,91":a.level==="warn"?"255,153,68":"106,138,255",c=a.level==="error"?"🚨":a.level==="warn"?"⚠️":"ℹ️";return`
        <div class="ax-alert-row ax-modernized-card ax-bounce-tap" ${a.action_route?`data-route="${i(a.action_route)}" role="button" tabindex="0" aria-label="${i(a.title)} — ouvrir"`:""}
          style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:linear-gradient(135deg,rgba(${e},.10),rgba(${e},.04));border:1px solid rgba(${e},.18);border-left:3px solid ${r};border-radius:12px;margin-bottom:8px;cursor:${a.action_route?"pointer":"default"};transition:all 200ms cubic-bezier(0.16,1,0.3,1);animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${60+s*50}ms backwards">
          <span style="font-size:20px;flex-shrink:0;filter:drop-shadow(0 2px 6px ${r}55)">${c}</span>
          <div class="ax-gs-6">
            <div style="font-size:14px;font-weight:600;color:${r};letter-spacing:-0.01em">${i(a.title)}</div>
            <div class="ax-gs-119">${i(a.description)}</div>
          </div>
          ${a.action_route?`<span style="color:${r};font-size:18px;opacity:0.7">→</span>`:""}
        </div>`}).join("")}function P(t){return t.length===0?`
      <div class="ax-gs-132">
        <span class="ax-gs-133">🎉</span>
        <span class="ax-gs-134">Aucun todo en attente.</span>
      </div>`:t.map((a,s)=>{const r=a.severity==="critical"?"var(--ax-sev-critical)":a.severity==="high"?"var(--ax-sev-high)":a.severity==="medium"?"var(--ax-sev-medium)":"var(--ax-sev-low)",e=new Date(a.ts_created).toLocaleString("fr-FR");return`
        <div class="ax-modernized-card" style="padding:12px 14px;background:linear-gradient(135deg,rgba(20,20,35,0.6),rgba(14,14,28,0.4));backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.06);border-left:3px solid ${r};border-radius:10px;margin-bottom:8px;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${60+s*50}ms backwards">
          <div style="font-size:13px;font-weight:600;color:#fff;line-height:1.4">${i(a.title)}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:4px;display:flex;gap:8px;align-items:center">
            <span style="display:inline-block;padding:2px 8px;background:rgba(255,255,255,0.06);border-radius:6px;font-size:10px;text-transform:uppercase;letter-spacing:0.06em">${i(a.source)}</span>
            <span>${i(e)}</span>
          </div>
        </div>`}).join("")}function I(t,a={}){if(t.length===0)return`
      <div class="ax-modernized-card" style="padding:14px 16px;background:linear-gradient(135deg,rgba(20,20,35,0.6),rgba(14,14,28,0.4));backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.06);border-radius:12px">
        <div class="ax-gs-227">Aucune clé API encore configurée. Va dans le <strong class="ax-gs-372">Coffre</strong> pour ajouter tes premières clés.</div>
      </div>`;const s={green:"var(--ax-green)",yellow:"var(--ax-warning)",red:"var(--ax-error)",gray:"var(--ax-text-muted)"},r={green:"OK",yellow:"Partiel",red:"Panne",gray:"Non testé"};return t.map((e,c)=>{const l=s[e.light],o=r[e.light],n=`${e.activeKeys}/${e.totalKeys} active${e.failingKeys>0?` · ${e.failingKeys} failing`:""}${e.invalidKeys>0?` · ${e.invalidKeys} invalid`:""}`,d=a[e.service]??{recharge:null,usage:null},u=d.recharge&&(e.light==="yellow"||e.light==="red"||e.light==="gray"),x=w({rechargeUrl:u?d.recharge??void 0:void 0,rotateUrl:d.usage??void 0,variant:"button",label:"Recharge"});return`
        <div class="ax-service-health-row ax-modernized-card"
          style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:linear-gradient(135deg,rgba(20,20,35,0.6),rgba(14,14,28,0.4));backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.06);border-left:3px solid ${l};border-radius:10px;margin-bottom:8px;width:100%;text-align:left;transition:all 200ms cubic-bezier(0.16,1,0.3,1);animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${60+c*50}ms backwards;flex-wrap:wrap">
          <button class="ax-service-health-main ax-bounce-tap" data-route="vault" data-service="${i(e.service)}"
            style="display:flex;align-items:center;gap:12px;background:transparent;border:0;color:inherit;flex:1;min-width:200px;cursor:pointer;text-align:left;padding:0;-webkit-tap-highlight-color:transparent">
            <span aria-hidden="true" style="display:inline-block;width:12px;height:12px;background:${l};border-radius:50%;box-shadow:0 0 12px ${l};flex-shrink:0"></span>
            <div class="ax-gs-6">
              <div style="font-size:14px;font-weight:600;color:#fff;text-transform:capitalize">${i(e.service)}</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:2px">${i(n)}</div>
            </div>
            <span style="font-size:11px;font-weight:700;color:${l};text-transform:uppercase;letter-spacing:0.06em;flex-shrink:0">${i(o)}</span>
          </button>
          ${x}
        </div>`}).join("")}async function T(t){const a={};if(t.length===0)return a;try{const{linksRegistry:s}=await g(async()=>{const{linksRegistry:r}=await import("./multi-source-analyze-CutjfdEy.js").then(e=>e.g);return{linksRegistry:r}},__vite__mapDeps([1,0,3,2]),import.meta.url);for(const r of t)a[r]={recharge:s.getRechargeLink(r),usage:s.getUsageLink(r),apiKeys:s.getApiKeysLink(r)}}catch{}return a}async function X(t){p?.cleanup(),p=f("dashboard");const a=b.get("user");if(!m("admin.dashboard",t,a?.id))return;const s=a?.name?`Bonjour ${a.name}`:"Bonjour",[r,e,c]=await Promise.all([k(),_(),z()]),l=await T(c.map(n=>n.service)),o=S();t.innerHTML=h.withNonce(`
    <style>
      @keyframes ax-fade-up {
        0% { opacity: 0; transform: translateY(12px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .ax-modernized-card:hover {
        transform: translateY(-2px);
        border-color: rgba(232, 184, 48, 0.25) !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.35), 0 2px 6px rgba(232,184,48,0.08);
      }
      .ax-shortcut-card:hover .ax-shortcut-icon { transform: scale(1.1) rotate(-3deg); }
      .ax-shortcut-card:hover .ax-shortcut-arrow { transform: translateX(4px); }
      @media (prefers-reduced-motion: reduce) {
        .ax-modernized-card { animation: none !important; transition: none !important; }
        .ax-modernized-card:hover { transform: none !important; }
      }
    </style>
    <div class="ax-page" style="padding:24px 16px max(24px, env(safe-area-inset-bottom)) 16px;max-width:1140px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif">
      <header style="margin-bottom:32px;animation:ax-fade-up 400ms cubic-bezier(0.16,1,0.3,1) backwards">
        <h1 style="margin:0 0 6px;font-size:clamp(26px,5.5vw,32px);font-weight:700;background:linear-gradient(135deg,var(--ax-gold-deep) 0%,var(--ax-gold) 50%,var(--ax-gold-bright) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:Georgia,serif;letter-spacing:-0.025em;line-height:1.1">${i(s)}</h1>
        <p style="color:rgba(255,255,255,0.55);margin:0;font-size:15px;font-weight:400;letter-spacing:-0.005em">Voici ton dashboard Apex.</p>
      </header>

      <section class="ax-gs-228">
        <h2 class="ax-gs-373">
          <span class="ax-gs-19">📊</span> Indicateurs clés
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px">
          ${r.map((n,d)=>A(n,d)).join("")}
        </div>
      </section>

      <section class="ax-gs-228">
        <h2 class="ax-gs-374">
          <span class="ax-gs-19">🔔</span> Alertes ${e.length>0?`<span style="display:inline-block;padding:2px 10px;background:rgba(255,91,91,0.15);color:var(--ax-error);border-radius:24px;font-size:11px;font-weight:700">${e.length}</span>`:""}
        </h2>
        ${K(e)}
      </section>

      <section class="ax-gs-228">
        <h2 class="ax-gs-374">
          <span class="ax-gs-19">🚥</span> Statut services IA ${c.length>0?`<span style="display:inline-block;padding:2px 10px;background:rgba(106,138,255,0.15);color:var(--ax-blue);border-radius:24px;font-size:11px;font-weight:700">${c.length}</span>`:""}
        </h2>
        ${I(c,l)}
      </section>

      <section class="ax-gs-228">
        <h2 class="ax-gs-374">
          <span class="ax-gs-19">📋</span> Todos ${o.length>0?`<span style="display:inline-block;padding:2px 10px;background:rgba(255,170,0,0.15);color:var(--ax-warning);border-radius:24px;font-size:11px;font-weight:700">${o.length}</span>`:""}
        </h2>
        ${P(o)}
      </section>

      <section class="ax-gs-228">
        <h2 class="ax-gs-373">
          <span class="ax-gs-19">🚀</span> Raccourcis
        </h2>
        <div class="ax-gs-89">
          ${$.map((n,d)=>R(n,d)).join("")}
        </div>
      </section>

      <section class="ax-gs-228">
        <h2 class="ax-gs-373">
          <span class="ax-gs-19">📈</span> Stats live
        </h2>
        <div class="ax-modernized-card" style="background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));backdrop-filter:blur(20px) saturate(140%);-webkit-backdrop-filter:blur(20px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;animation:ax-fade-up 360ms cubic-bezier(0.16,1,0.3,1) 200ms backwards">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px">
            <div class="ax-gs-29">
              <div class="ax-gs-63">Provider santé</div>
              <div style="font-size:18px;font-weight:700;color:var(--ax-green);display:flex;align-items:center;gap:8px;letter-spacing:-0.01em">
                <span style="display:inline-block;width:8px;height:8px;background:var(--ax-green);border-radius:50%;box-shadow:0 0 12px var(--ax-green)"></span>
                Anthropic OK
              </div>
            </div>
            <div class="ax-gs-29">
              <div class="ax-gs-63">Latence dernière req</div>
              <div style="font-size:18px;font-weight:700;color:var(--ax-blue);letter-spacing:-0.01em;font-feature-settings:'tnum'">~ 1.2s</div>
            </div>
            <div class="ax-gs-29">
              <div class="ax-gs-63">Tokens 7j (estimé)</div>
              <div style="font-size:18px;font-weight:700;color:var(--ax-gold);letter-spacing:-0.01em;font-feature-settings:'tnum'">${i((r.find(n=>n.id==="tokens")?.value??0).toString())}</div>
            </div>
          </div>
        </div>
      </section>

      <p style="text-align:center;color:rgba(255,255,255,0.3);font-size:11px;letter-spacing:0.05em;margin-top:24px">APEX v13 · Dashboard</p>
    </div>
  `),t.querySelectorAll("[data-route]").forEach(n=>{p.bind(n,"click",()=>{y.tap();const d=n.dataset.route;d&&(window.location.hash="#"+d)})}),v.info("feature-dashboard",`rendered (${r.length} kpis, ${e.length} alerts, ${o.length} todos)`)}export{k as computeKpis,G as dispose,i as escapeHtml,_ as loadAlerts,T as loadRechargeLinks,z as loadServiceHealth,S as loadTodos,X as render,I as renderServiceHealthCard};
