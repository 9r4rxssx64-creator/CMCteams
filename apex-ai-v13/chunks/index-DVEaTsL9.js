const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-3uBGKGRH.js","./apex-kb-Dut8ppfy.js","./credential-patterns-CLzI061R.js","./multi-source-analyze-DcWgsAAp.js"])))=>i.map(i=>d[i]);
import{_ as g}from"./apex-kb-Dut8ppfy.js";import{c as u}from"./listener-cleanup-Y2rGGxxX.js";import{l as b}from"./monitoring-3uBGKGRH.js";import{s as m}from"../core/main-C6XVEYVZ.js";import{c as h}from"./csp-style-helper-BisGRi53.js";import{g as y}from"./apex-tools-dispatch-core-3gkwsLsM.js";import{haptic as v}from"./haptic-CQFg2PXZ.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-DcWgsAAp.js";import"./apex-tools-dispatch-skills-C_1JIg7T.js";import"./apex-tools-dispatch-data-DvNGL6xI.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-rTkkZmBV.js";import"./apex-tools-registry-CCpvWT7v.js";import"./voice-CCivQYdU.js";let d=null;function Y(){d?.cleanup(),d=null}function i(e){return e.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r]??r)}const w=[{id:"chat",icon:"💬",label:"Chat",description:"Conversation IA",route:"chat",color:"#5aa8ff"},{id:"vault",icon:"🔐",label:"Coffre",description:"Clés API & secrets",route:"vault",color:"#c9a227"},{id:"browser",icon:"🌐",label:"Browser",description:"Naviguer & embed",route:"browser",color:"#22cc77"},{id:"studios",icon:"🎨",label:"Studios",description:"Créatif (musique/vidéo)",route:"studios",color:"#a878ff"},{id:"pro",icon:"🎓",label:"Pro",description:"Modules expert",route:"pro",color:"#ff6b9d"},{id:"self-diag",icon:"🩺",label:"Audit",description:"Auto-diagnostic",route:"self-diag",color:"#38d8c8"},{id:"settings",icon:"⚙️",label:"Réglages",description:"Configurer Apex",route:"settings",color:"#a0a4c0"},{id:"rgpd",icon:"🛡",label:"RGPD",description:"Mes données",route:"rgpd",color:"#e8b830"}];async function k(){let e=0,r=0,o=0,a=0,t=0,c=0;try{const l=localStorage.getItem("apex_v13_messages_24h")??"0",n=parseInt(l,10);Number.isNaN(n)||(e=n)}catch{}try{const l=localStorage.getItem("apex_v13_tokens_24h")??"0",n=parseInt(l,10);Number.isNaN(n)||(r=n)}catch{}try{const{kdmcProjectsRegistry:l}=await g(async()=>{const{kdmcProjectsRegistry:n}=await import("./kdmc-projects-registry-DdTqW2gy.js");return{kdmcProjectsRegistry:n}},__vite__mapDeps([0]),import.meta.url);o=l.countActive()}catch{}try{const{sentinels:l}=await g(async()=>{const{sentinels:s}=await import("./sentinels-CS8A3gM6.js");return{sentinels:s}},__vite__mapDeps([1,0,2]),import.meta.url),n=l.list();t=n.length,a=n.filter(s=>s.lastResult?.ok).length}catch{}try{const l=localStorage.getItem("ax_claude_todo")??"[]",n=JSON.parse(l);Array.isArray(n)&&(c=n.filter(s=>s.status==="pending").length)}catch{}return[{id:"messages",icon:"💬",label:"Messages 24h",value:e,color:"#5aa8ff",route:"chat"},{id:"tokens",icon:"🔢",label:"Tokens 24h",value:r.toLocaleString("fr-FR"),color:"#c9a227",route:"self-diag"},{id:"projects",icon:"📦",label:"Projets actifs",value:o,color:"#22cc77",route:"admin"},{id:"sentinels",icon:"🛡",label:"Sentinelles OK",value:`${a}/${t}`,color:a===t?"#22cc77":"#ffaa00",route:"sentinels"},{id:"todos",icon:"📋",label:"Todos en attente",value:c,color:c>0?"#ff5858":"#22cc77",route:"self-diag"}]}async function $(){const e=[];try{const{sentinels:r}=await g(async()=>{const{sentinels:t}=await import("./sentinels-CS8A3gM6.js");return{sentinels:t}},__vite__mapDeps([1,0,2]),import.meta.url),a=r.list().filter(t=>t.lastResult&&!t.lastResult.ok);for(const t of a.slice(0,3))e.push({id:`sentinel_${t.id}`,level:"warn",title:`Sentinelle ${t.name}`,description:t.lastResult?.msg??"KO",ts:t.lastResult?.ts??Date.now(),action_route:"sentinels"})}catch{}try{const r=JSON.parse(localStorage.getItem("apex_v13_credentials_expiring")??"[]");if(Array.isArray(r))for(const o of r.slice(0,3))o.days_left<30&&e.push({id:`cred_${o.service}`,level:o.days_left<7?"error":"warn",title:`Credential ${o.service}`,description:`Expire dans ${o.days_left} jours`,ts:Date.now(),action_route:"vault"})}catch{}return e}async function z(){try{const{multiKeyVault:e}=await g(async()=>{const{multiKeyVault:a}=await import("./multi-key-vault-Cbx20AIc.js");return{multiKeyVault:a}},__vite__mapDeps([1,0,2]),import.meta.url),r=e.getKnownServices(),o=[];for(const a of r){const t=e.getStats(a),c=e.getServiceLight(a);o.push({service:a,light:c,totalKeys:t.total,activeKeys:t.active,failingKeys:t.failing,invalidKeys:t.invalid,lastSuccess:t.lastSuccess})}return o}catch{return[]}}function _(){const e=[];try{const r=localStorage.getItem("ax_claude_todo")??"[]",o=JSON.parse(r);if(Array.isArray(o))for(const a of o.filter(t=>t.status==="pending").slice(0,5))e.push({id:a.id??`todo_${Date.now()}`,source:"apex_todo",title:a.reason??"Todo sans description",severity:a.severity??"medium",ts_created:a.ts??Date.now()})}catch{}return e}function S(e,r=0){return`
    <button class="ax-kpi-card ax-modernized-card ax-bounce-tap" data-route="${i(e.route)}"
      style="position:relative;background:linear-gradient(135deg,rgba(20,20,35,0.85),rgba(14,14,28,0.75));backdrop-filter:blur(20px) saturate(140%);-webkit-backdrop-filter:blur(20px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px 16px;cursor:pointer;text-align:center;transition:all 280ms cubic-bezier(0.34,1.56,0.64,1);overflow:hidden;min-height:120px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:6px;animation:ax-fade-up 360ms cubic-bezier(0.16,1,0.3,1) ${50+r*40}ms backwards;-webkit-tap-highlight-color:transparent">
      <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,${i(e.color)},transparent);border-radius:16px 16px 0 0;opacity:0.85"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(circle at top right,${i(e.color)}11,transparent 60%);pointer-events:none"></div>
      <div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 8px ${i(e.color)}40)">${i(e.icon)}</div>
      <div style="font-size:26px;font-weight:800;color:${i(e.color)};line-height:1;letter-spacing:-0.02em;font-feature-settings:'tnum'">${i(String(e.value))}</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.06em;font-weight:600">${i(e.label)}</div>
    </button>`}function A(e,r=0){return`
    <button class="ax-shortcut-card ax-modernized-card ax-bounce-tap" data-route="${i(e.route)}"
      style="position:relative;background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.55));backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px;cursor:pointer;text-align:left;transition:all 240ms cubic-bezier(0.16,1,0.3,1);display:flex;align-items:center;gap:14px;min-height:72px;overflow:hidden;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${80+r*35}ms backwards;-webkit-tap-highlight-color:transparent">
      <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,${i(e.color)},${i(e.color)}88);border-radius:14px 0 0 14px"></div>
      <span style="font-size:30px;flex-shrink:0;filter:drop-shadow(0 4px 12px ${i(e.color)}40);transition:transform 240ms cubic-bezier(0.34,1.56,0.64,1)" class="ax-shortcut-icon">${i(e.icon)}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.01em;line-height:1.3">${i(e.label)}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.55);line-height:1.4;margin-top:2px">${i(e.description)}</div>
      </div>
      <span style="color:${i(e.color)};font-size:20px;flex-shrink:0;transition:transform 240ms cubic-bezier(0.34,1.56,0.64,1)" class="ax-shortcut-arrow">→</span>
    </button>`}function R(e){return e.length===0?`
      <div style="display:flex;align-items:center;gap:12px;padding:16px;background:linear-gradient(135deg,rgba(34,204,119,0.08),rgba(34,204,119,0.03));border:1px solid rgba(34,204,119,0.15);border-radius:12px">
        <span style="font-size:20px;filter:drop-shadow(0 2px 6px rgba(34,204,119,0.4))">✅</span>
        <span style="color:rgba(255,255,255,0.85);font-size:14px;font-weight:500">Aucune alerte. Tout fonctionne.</span>
      </div>`:e.map((r,o)=>{const a=r.level==="error"?"#ff5b5b":r.level==="warn"?"#ffaa00":"#6a8aff",t=r.level==="error"?"255,91,91":r.level==="warn"?"255,170,0":"106,138,255",c=r.level==="error"?"🚨":r.level==="warn"?"⚠️":"ℹ️";return`
        <div class="ax-alert-row ax-modernized-card ax-bounce-tap" ${r.action_route?`data-route="${i(r.action_route)}"`:""}
          style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:linear-gradient(135deg,rgba(${t},.10),rgba(${t},.04));border:1px solid rgba(${t},.18);border-left:3px solid ${a};border-radius:12px;margin-bottom:8px;cursor:${r.action_route?"pointer":"default"};transition:all 200ms cubic-bezier(0.16,1,0.3,1);animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${60+o*50}ms backwards">
          <span style="font-size:20px;flex-shrink:0;filter:drop-shadow(0 2px 6px ${a}55)">${c}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:600;color:${a};letter-spacing:-0.01em">${i(r.title)}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:2px">${i(r.description)}</div>
          </div>
          ${r.action_route?`<span style="color:${a};font-size:18px;opacity:0.7">→</span>`:""}
        </div>`}).join("")}function K(e){return e.length===0?`
      <div style="display:flex;align-items:center;gap:12px;padding:16px;background:linear-gradient(135deg,rgba(34,204,119,0.08),rgba(34,204,119,0.03));border:1px solid rgba(34,204,119,0.15);border-radius:12px">
        <span style="font-size:20px;filter:drop-shadow(0 2px 6px rgba(34,204,119,0.4))">🎉</span>
        <span style="color:rgba(255,255,255,0.85);font-size:14px;font-weight:500">Aucun todo en attente.</span>
      </div>`:e.map((r,o)=>{const a=r.severity==="critical"?"#ff5b5b":r.severity==="high"?"#ffaa00":"#6a8aff",t=new Date(r.ts_created).toLocaleString("fr-FR");return`
        <div class="ax-modernized-card" style="padding:12px 14px;background:linear-gradient(135deg,rgba(20,20,35,0.6),rgba(14,14,28,0.4));backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.06);border-left:3px solid ${a};border-radius:10px;margin-bottom:8px;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${60+o*50}ms backwards">
          <div style="font-size:13px;font-weight:600;color:#fff;line-height:1.4">${i(r.title)}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:4px;display:flex;gap:8px;align-items:center">
            <span style="display:inline-block;padding:2px 8px;background:rgba(255,255,255,0.06);border-radius:6px;font-size:10px;text-transform:uppercase;letter-spacing:0.06em">${i(r.source)}</span>
            <span>${i(t)}</span>
          </div>
        </div>`}).join("")}function P(e,r={}){if(e.length===0)return`
      <div class="ax-modernized-card" style="padding:14px 16px;background:linear-gradient(135deg,rgba(20,20,35,0.6),rgba(14,14,28,0.4));backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.06);border-radius:12px">
        <div style="font-size:13px;color:rgba(255,255,255,0.55)">Aucune clé API encore configurée. Va dans le <strong style="color:#c9a227">Coffre</strong> pour ajouter tes premières clés.</div>
      </div>`;const o={green:"#22cc77",yellow:"#ffaa00",red:"#ff5b5b",gray:"#666b80"},a={green:"OK",yellow:"Partiel",red:"Panne",gray:"Non testé"};return e.map((t,c)=>{const l=o[t.light],n=a[t.light],s=`${t.activeKeys}/${t.totalKeys} active${t.failingKeys>0?` · ${t.failingKeys} failing`:""}${t.invalidKeys>0?` · ${t.invalidKeys} invalid`:""}`,p=r[t.service]??{recharge:null,usage:null},f=p.recharge&&(t.light==="yellow"||t.light==="red"||t.light==="gray")&&p.recharge?`<a class="ax-recharge-btn" href="${i(p.recharge)}" target="_blank" rel="noopener noreferrer"
            style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;font-weight:700;font-size:11px;border-radius:8px;text-decoration:none;text-transform:uppercase;letter-spacing:0.04em;flex-shrink:0;-webkit-tap-highlight-color:transparent"
>💳 Recharge</a>`:"",x=p.usage?`<a class="ax-usage-btn" href="${i(p.usage)}" target="_blank" rel="noopener noreferrer"
            style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(106,138,255,0.15);color:#6a8aff;font-weight:600;font-size:11px;border-radius:8px;text-decoration:none;text-transform:uppercase;letter-spacing:0.04em;flex-shrink:0;-webkit-tap-highlight-color:transparent;border:1px solid rgba(106,138,255,0.3)"
>📊 Usage</a>`:"";return`
        <div class="ax-service-health-row ax-modernized-card"
          style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:linear-gradient(135deg,rgba(20,20,35,0.6),rgba(14,14,28,0.4));backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.06);border-left:3px solid ${l};border-radius:10px;margin-bottom:8px;width:100%;text-align:left;transition:all 200ms cubic-bezier(0.16,1,0.3,1);animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${60+c*50}ms backwards;flex-wrap:wrap">
          <button class="ax-service-health-main ax-bounce-tap" data-route="vault" data-service="${i(t.service)}"
            style="display:flex;align-items:center;gap:12px;background:transparent;border:0;color:inherit;flex:1;min-width:200px;cursor:pointer;text-align:left;padding:0;-webkit-tap-highlight-color:transparent">
            <span aria-hidden="true" style="display:inline-block;width:12px;height:12px;background:${l};border-radius:50%;box-shadow:0 0 12px ${l};flex-shrink:0"></span>
            <div style="flex:1;min-width:0">
              <div style="font-size:14px;font-weight:600;color:#fff;text-transform:capitalize">${i(t.service)}</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:2px">${i(s)}</div>
            </div>
            <span style="font-size:11px;font-weight:700;color:${l};text-transform:uppercase;letter-spacing:0.06em;flex-shrink:0">${i(n)}</span>
          </button>
          ${f}
          ${x}
        </div>`}).join("")}async function I(e){const r={};if(e.length===0)return r;try{const{linksRegistry:o}=await g(async()=>{const{linksRegistry:a}=await import("./multi-source-analyze-DcWgsAAp.js").then(t=>t.c);return{linksRegistry:a}},__vite__mapDeps([3,1,0,2]),import.meta.url);for(const a of e)r[a]={recharge:o.getRechargeLink(a),usage:o.getUsageLink(a),apiKeys:o.getApiKeysLink(a)}}catch{}return r}async function G(e){d?.cleanup(),d=u("dashboard");const r=m.get("user");if(!y("admin.dashboard",e,r?.id))return;const o=r?.name?`Bonjour ${r.name}`:"Bonjour",[a,t,c]=await Promise.all([k(),$(),z()]),l=await I(c.map(s=>s.service)),n=_();e.innerHTML=h.withNonce(`
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
        <h1 style="margin:0 0 6px;font-size:clamp(28px,5vw,36px);font-weight:700;background:linear-gradient(135deg,#c9a227 0%,#e8b830 50%,#f5cc4a 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:Georgia,serif;letter-spacing:-0.025em;line-height:1.1">${i(o)}</h1>
        <p style="color:rgba(255,255,255,0.55);margin:0;font-size:15px;font-weight:400;letter-spacing:-0.005em">Voici ton dashboard Apex.</p>
      </header>

      <section style="margin-bottom:32px">
        <h2 style="font-size:12px;color:rgba(232,184,48,0.85);margin:0 0 14px;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;display:flex;align-items:center;gap:6px">
          <span style="font-size:14px;-webkit-text-fill-color:initial">📊</span> Indicateurs clés
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px">
          ${a.map((s,p)=>S(s,p)).join("")}
        </div>
      </section>

      <section style="margin-bottom:32px">
        <h2 style="font-size:12px;color:rgba(232,184,48,0.85);margin:0 0 14px;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;display:flex;align-items:center;gap:8px">
          <span style="font-size:14px;-webkit-text-fill-color:initial">🔔</span> Alertes ${t.length>0?`<span style="display:inline-block;padding:2px 10px;background:rgba(255,91,91,0.15);color:#ff5b5b;border-radius:24px;font-size:11px;font-weight:700">${t.length}</span>`:""}
        </h2>
        ${R(t)}
      </section>

      <section style="margin-bottom:32px">
        <h2 style="font-size:12px;color:rgba(232,184,48,0.85);margin:0 0 14px;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;display:flex;align-items:center;gap:8px">
          <span style="font-size:14px;-webkit-text-fill-color:initial">🚥</span> Statut services IA ${c.length>0?`<span style="display:inline-block;padding:2px 10px;background:rgba(106,138,255,0.15);color:#6a8aff;border-radius:24px;font-size:11px;font-weight:700">${c.length}</span>`:""}
        </h2>
        ${P(c,l)}
      </section>

      <section style="margin-bottom:32px">
        <h2 style="font-size:12px;color:rgba(232,184,48,0.85);margin:0 0 14px;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;display:flex;align-items:center;gap:8px">
          <span style="font-size:14px;-webkit-text-fill-color:initial">📋</span> Todos ${n.length>0?`<span style="display:inline-block;padding:2px 10px;background:rgba(255,170,0,0.15);color:#ffaa00;border-radius:24px;font-size:11px;font-weight:700">${n.length}</span>`:""}
        </h2>
        ${K(n)}
      </section>

      <section style="margin-bottom:32px">
        <h2 style="font-size:12px;color:rgba(232,184,48,0.85);margin:0 0 14px;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;display:flex;align-items:center;gap:6px">
          <span style="font-size:14px;-webkit-text-fill-color:initial">🚀</span> Raccourcis
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
          ${w.map((s,p)=>A(s,p)).join("")}
        </div>
      </section>

      <section style="margin-bottom:32px">
        <h2 style="font-size:12px;color:rgba(232,184,48,0.85);margin:0 0 14px;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;display:flex;align-items:center;gap:6px">
          <span style="font-size:14px;-webkit-text-fill-color:initial">📈</span> Stats live
        </h2>
        <div class="ax-modernized-card" style="background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));backdrop-filter:blur(20px) saturate(140%);-webkit-backdrop-filter:blur(20px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;animation:ax-fade-up 360ms cubic-bezier(0.16,1,0.3,1) 200ms backwards">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px">
            <div style="display:flex;flex-direction:column;gap:6px">
              <div style="font-size:11px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Provider santé</div>
              <div style="font-size:18px;font-weight:700;color:#22cc77;display:flex;align-items:center;gap:8px;letter-spacing:-0.01em">
                <span style="display:inline-block;width:8px;height:8px;background:#22cc77;border-radius:50%;box-shadow:0 0 12px #22cc77"></span>
                Anthropic OK
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px">
              <div style="font-size:11px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Latence dernière req</div>
              <div style="font-size:18px;font-weight:700;color:#6a8aff;letter-spacing:-0.01em;font-feature-settings:'tnum'">~ 1.2s</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px">
              <div style="font-size:11px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Tokens 7j (estimé)</div>
              <div style="font-size:18px;font-weight:700;color:#e8b830;letter-spacing:-0.01em;font-feature-settings:'tnum'">${i((a.find(s=>s.id==="tokens")?.value??0).toString())}</div>
            </div>
          </div>
        </div>
      </section>

      <p style="text-align:center;color:rgba(255,255,255,0.3);font-size:11px;letter-spacing:0.05em;margin-top:24px">APEX v13 · Dashboard</p>
    </div>
  `),e.querySelectorAll("[data-route]").forEach(s=>{d.bind(s,"click",()=>{v.tap();const p=s.dataset.route;p&&(window.location.hash="#"+p)})}),b.info("feature-dashboard",`rendered (${a.length} kpis, ${t.length} alerts, ${n.length} todos)`)}export{k as computeKpis,Y as dispose,i as escapeHtml,$ as loadAlerts,I as loadRechargeLinks,z as loadServiceHealth,_ as loadTodos,G as render,P as renderServiceHealthCard};
