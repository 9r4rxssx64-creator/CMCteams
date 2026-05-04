const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./kdmc-projects-registry-D05fcRnQ.js","../core/main-BFCqP8AI.js","../assets/css/main-rhfGvOFL.css","./sentinels-B2NX4WWS.js","./observability-DqcMComk.js"])))=>i.map(i=>d[i]);
import{_ as d,s as p,l as f}from"../core/main-BFCqP8AI.js";import{h as u}from"./haptic-BUEqXK0N.js";function r(t){return t.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}const g=[{id:"chat",icon:"💬",label:"Chat",description:"Conversation IA",route:"chat",color:"#5aa8ff"},{id:"vault",icon:"🔐",label:"Coffre",description:"Clés API & secrets",route:"vault",color:"#c9a227"},{id:"browser",icon:"🌐",label:"Browser",description:"Naviguer & embed",route:"browser",color:"#22cc77"},{id:"studios",icon:"🎨",label:"Studios",description:"Créatif (musique/vidéo)",route:"studios",color:"#a878ff"},{id:"pro",icon:"🎓",label:"Pro",description:"Modules expert",route:"pro",color:"#ff6b9d"},{id:"self-diag",icon:"🩺",label:"Audit",description:"Auto-diagnostic",route:"self-diag",color:"#38d8c8"},{id:"settings",icon:"⚙️",label:"Réglages",description:"Configurer Apex",route:"settings",color:"#a0a4c0"},{id:"rgpd",icon:"🛡",label:"RGPD",description:"Mes données",route:"rgpd",color:"#e8b830"}];async function x(){let t=0,e=0,i=0,s=0,o=0,l=0;try{const n=localStorage.getItem("apex_v13_messages_24h")??"0",a=parseInt(n,10);Number.isNaN(a)||(t=a)}catch{}try{const n=localStorage.getItem("apex_v13_tokens_24h")??"0",a=parseInt(n,10);Number.isNaN(a)||(e=a)}catch{}try{const{kdmcProjectsRegistry:n}=await d(async()=>{const{kdmcProjectsRegistry:a}=await import("./kdmc-projects-registry-D05fcRnQ.js");return{kdmcProjectsRegistry:a}},__vite__mapDeps([0,1,2]),import.meta.url);i=n.countActive()}catch{}try{const{sentinels:n}=await d(async()=>{const{sentinels:c}=await import("./sentinels-B2NX4WWS.js");return{sentinels:c}},__vite__mapDeps([3,1,2,4]),import.meta.url),a=n.list();o=a.length,s=a.filter(c=>c.lastResult?.ok).length}catch{}try{const n=localStorage.getItem("ax_claude_todo")??"[]",a=JSON.parse(n);Array.isArray(a)&&(l=a.filter(c=>c.status==="pending").length)}catch{}return[{id:"messages",icon:"💬",label:"Messages 24h",value:t,color:"#5aa8ff",route:"chat"},{id:"tokens",icon:"🔢",label:"Tokens 24h",value:e.toLocaleString("fr-FR"),color:"#c9a227",route:"self-diag"},{id:"projects",icon:"📦",label:"Projets actifs",value:i,color:"#22cc77",route:"admin"},{id:"sentinels",icon:"🛡",label:"Sentinelles OK",value:`${s}/${o}`,color:s===o?"#22cc77":"#ffaa00",route:"sentinels"},{id:"todos",icon:"📋",label:"Todos en attente",value:l,color:l>0?"#ff5858":"#22cc77",route:"self-diag"}]}async function m(){const t=[];try{const{sentinels:e}=await d(async()=>{const{sentinels:o}=await import("./sentinels-B2NX4WWS.js");return{sentinels:o}},__vite__mapDeps([3,1,2,4]),import.meta.url),s=e.list().filter(o=>o.lastResult&&!o.lastResult.ok);for(const o of s.slice(0,3))t.push({id:`sentinel_${o.id}`,level:"warn",title:`Sentinelle ${o.name}`,description:o.lastResult?.msg??"KO",ts:o.lastResult?.ts??Date.now(),action_route:"sentinels"})}catch{}try{const e=JSON.parse(localStorage.getItem("apex_v13_credentials_expiring")??"[]");if(Array.isArray(e))for(const i of e.slice(0,3))i.days_left<30&&t.push({id:`cred_${i.service}`,level:i.days_left<7?"error":"warn",title:`Credential ${i.service}`,description:`Expire dans ${i.days_left} jours`,ts:Date.now(),action_route:"vault"})}catch{}return t}function v(){const t=[];try{const e=localStorage.getItem("ax_claude_todo")??"[]",i=JSON.parse(e);if(Array.isArray(i))for(const s of i.filter(o=>o.status==="pending").slice(0,5))t.push({id:s.id??`todo_${Date.now()}`,source:"apex_todo",title:s.reason??"Todo sans description",severity:s.severity??"medium",ts_created:s.ts??Date.now()})}catch{}return t}function y(t){return`
    <button class="ax-kpi-card" data-route="${r(t.route)}"
      style="background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:16px;cursor:pointer;text-align:center;transition:transform .15s;border-left:4px solid ${r(t.color)}">
      <div style="font-size:32px;margin-bottom:4px">${r(t.icon)}</div>
      <div style="font-size:24px;font-weight:900;color:${r(t.color)};line-height:1">${r(String(t.value))}</div>
      <div style="font-size:11px;color:#a0a4c0;margin-top:6px">${r(t.label)}</div>
    </button>`}function h(t){return`
    <button class="ax-shortcut-card" data-route="${r(t.route)}"
      style="background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:14px;cursor:pointer;text-align:left;transition:transform .15s;display:flex;align-items:center;gap:10px;border-left:3px solid ${r(t.color)}">
      <span style="font-size:28px;flex-shrink:0">${r(t.icon)}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:700;color:#fff">${r(t.label)}</div>
        <div style="font-size:11px;color:#a0a4c0;line-height:1.3">${r(t.description)}</div>
      </div>
      <span style="color:${r(t.color)};font-size:18px">→</span>
    </button>`}function b(t){return t.length===0?'<p style="color:#a0a4c0;font-size:13px;margin:0">✅ Aucune alerte. Tout va bien.</p>':t.map(e=>{const i=e.level==="error"?"#ff5858":e.level==="warn"?"#ffaa00":"#5aa8ff",s=e.level==="error"?"🚨":e.level==="warn"?"⚠️":"ℹ️";return`
        <div class="ax-alert-row" ${e.action_route?`data-route="${r(e.action_route)}"`:""}
          style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(${e.level==="error"?"255,88,88":e.level==="warn"?"255,170,0":"90,168,255"},.08);border-left:3px solid ${i};border-radius:8px;margin-bottom:6px;cursor:${e.action_route?"pointer":"default"}">
          <span style="font-size:18px">${s}</span>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:${i}">${r(e.title)}</div>
            <div style="font-size:11px;color:#a0a4c0">${r(e.description)}</div>
          </div>
        </div>`}).join("")}function $(t){return t.length===0?'<p style="color:#a0a4c0;font-size:13px;margin:0">🎉 Aucun todo en attente.</p>':t.map(e=>{const i=e.severity==="critical"?"#ff5858":e.severity==="high"?"#ffaa00":"#5aa8ff",s=new Date(e.ts_created).toLocaleString("fr-FR");return`
        <div style="padding:10px;background:rgba(255,255,255,0.03);border-left:3px solid ${i};border-radius:6px;margin-bottom:6px">
          <div style="font-size:13px;font-weight:600;color:#fff">${r(e.title)}</div>
          <div style="font-size:10px;color:#888;margin-top:2px">${r(e.source)} · ${r(s)}</div>
        </div>`}).join("")}async function z(t){const e=p.get("user"),i=e?.name?`Bonjour ${e.name}`:"Bonjour",[s,o]=await Promise.all([x(),m()]),l=v();t.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:1100px;margin:0 auto">
      <header style="margin-bottom:24px">
        <h1 style="margin:0 0 4px;font-size:32px;background:linear-gradient(135deg,#c9a227,#ffd700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:Georgia,serif">${r(i)}</h1>
        <p style="color:#a0a4c0;margin:0;font-size:14px">Voici ton dashboard Apex.</p>
      </header>

      <section style="margin-bottom:24px">
        <h2 style="font-size:14px;color:#c9a227;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px">📊 Indicateurs clés</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px">
          ${s.map(y).join("")}
        </div>
      </section>

      <section style="margin-bottom:24px">
        <h2 style="font-size:14px;color:#c9a227;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px">🔔 Alertes ${o.length>0?`<span style="color:#ff5858">(${o.length})</span>`:""}</h2>
        ${b(o)}
      </section>

      <section style="margin-bottom:24px">
        <h2 style="font-size:14px;color:#c9a227;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px">📋 Todos ${l.length>0?`<span style="color:#ffaa00">(${l.length})</span>`:""}</h2>
        ${$(l)}
      </section>

      <section style="margin-bottom:24px">
        <h2 style="font-size:14px;color:#c9a227;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px">🚀 Raccourcis</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">
          ${g.map(h).join("")}
        </div>
      </section>

      <section style="margin-bottom:24px">
        <h2 style="font-size:14px;color:#c9a227;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px">📈 Stats live</h2>
        <div style="background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:16px">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
            <div>
              <div style="font-size:11px;color:#a0a4c0;text-transform:uppercase">Provider santé</div>
              <div style="font-size:18px;font-weight:700;color:#22cc77">🟢 Anthropic OK</div>
            </div>
            <div>
              <div style="font-size:11px;color:#a0a4c0;text-transform:uppercase">Latence dernière req</div>
              <div style="font-size:18px;font-weight:700;color:#5aa8ff">~ 1.2s</div>
            </div>
            <div>
              <div style="font-size:11px;color:#a0a4c0;text-transform:uppercase">Tokens 7j (estimé)</div>
              <div style="font-size:18px;font-weight:700;color:#c9a227">${r((s.find(n=>n.id==="tokens")?.value??0).toString())}</div>
            </div>
          </div>
        </div>
      </section>

      <p style="text-align:center;color:#666;font-size:11px">APEX v13 · Dashboard</p>
    </div>
  `,t.querySelectorAll("[data-route]").forEach(n=>{n.addEventListener("click",()=>{u.tap();const a=n.dataset.route;a&&(window.location.hash="#"+a)})}),f.info("feature-dashboard",`rendered (${s.length} kpis, ${o.length} alerts, ${l.length} todos)`)}export{x as computeKpis,r as escapeHtml,m as loadAlerts,v as loadTodos,z as render};
//# sourceMappingURL=index-D0Hcx9ey.js.map
