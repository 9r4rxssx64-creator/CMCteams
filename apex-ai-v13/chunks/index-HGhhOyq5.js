const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./kdmc-projects-registry-FZame6eR.js","./monitoring-675b-Ybt.js","./sentinels-BXjLGm8G.js","./apex-tools-dispatch-BQ_g7Mtu.js","./apex-tools-registry-BbvN32iJ.js"])))=>i.map(i=>d[i]);
import{_ as c}from"./apex-tools-dispatch-BQ_g7Mtu.js";import{l as d}from"./monitoring-675b-Ybt.js";import{s as g}from"../core/main-CDhRWD2L.js";import{h as f}from"./haptic-BUEqXK0N.js";import"./apex-tools-registry-BbvN32iJ.js";function i(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}const x=[{id:"chat",icon:"💬",label:"Chat",description:"Conversation IA",route:"chat",color:"#5aa8ff"},{id:"vault",icon:"🔐",label:"Coffre",description:"Clés API & secrets",route:"vault",color:"#c9a227"},{id:"browser",icon:"🌐",label:"Browser",description:"Naviguer & embed",route:"browser",color:"#22cc77"},{id:"studios",icon:"🎨",label:"Studios",description:"Créatif (musique/vidéo)",route:"studios",color:"#a878ff"},{id:"pro",icon:"🎓",label:"Pro",description:"Modules expert",route:"pro",color:"#ff6b9d"},{id:"self-diag",icon:"🩺",label:"Audit",description:"Auto-diagnostic",route:"self-diag",color:"#38d8c8"},{id:"settings",icon:"⚙️",label:"Réglages",description:"Configurer Apex",route:"settings",color:"#a0a4c0"},{id:"rgpd",icon:"🛡",label:"RGPD",description:"Mes données",route:"rgpd",color:"#e8b830"}];async function u(){let e=0,t=0,s=0,a=0,r=0,l=0;try{const n=localStorage.getItem("apex_v13_messages_24h")??"0",o=parseInt(n,10);Number.isNaN(o)||(e=o)}catch{}try{const n=localStorage.getItem("apex_v13_tokens_24h")??"0",o=parseInt(n,10);Number.isNaN(o)||(t=o)}catch{}try{const{kdmcProjectsRegistry:n}=await c(async()=>{const{kdmcProjectsRegistry:o}=await import("./kdmc-projects-registry-FZame6eR.js");return{kdmcProjectsRegistry:o}},__vite__mapDeps([0,1]),import.meta.url);s=n.countActive()}catch{}try{const{sentinels:n}=await c(async()=>{const{sentinels:p}=await import("./sentinels-BXjLGm8G.js");return{sentinels:p}},__vite__mapDeps([2,3,1,4]),import.meta.url),o=n.list();r=o.length,a=o.filter(p=>p.lastResult?.ok).length}catch{}try{const n=localStorage.getItem("ax_claude_todo")??"[]",o=JSON.parse(n);Array.isArray(o)&&(l=o.filter(p=>p.status==="pending").length)}catch{}return[{id:"messages",icon:"💬",label:"Messages 24h",value:e,color:"#5aa8ff",route:"chat"},{id:"tokens",icon:"🔢",label:"Tokens 24h",value:t.toLocaleString("fr-FR"),color:"#c9a227",route:"self-diag"},{id:"projects",icon:"📦",label:"Projets actifs",value:s,color:"#22cc77",route:"admin"},{id:"sentinels",icon:"🛡",label:"Sentinelles OK",value:`${a}/${r}`,color:a===r?"#22cc77":"#ffaa00",route:"sentinels"},{id:"todos",icon:"📋",label:"Todos en attente",value:l,color:l>0?"#ff5858":"#22cc77",route:"self-diag"}]}async function b(){const e=[];try{const{sentinels:t}=await c(async()=>{const{sentinels:r}=await import("./sentinels-BXjLGm8G.js");return{sentinels:r}},__vite__mapDeps([2,3,1,4]),import.meta.url),a=t.list().filter(r=>r.lastResult&&!r.lastResult.ok);for(const r of a.slice(0,3))e.push({id:`sentinel_${r.id}`,level:"warn",title:`Sentinelle ${r.name}`,description:r.lastResult?.msg??"KO",ts:r.lastResult?.ts??Date.now(),action_route:"sentinels"})}catch{}try{const t=JSON.parse(localStorage.getItem("apex_v13_credentials_expiring")??"[]");if(Array.isArray(t))for(const s of t.slice(0,3))s.days_left<30&&e.push({id:`cred_${s.service}`,level:s.days_left<7?"error":"warn",title:`Credential ${s.service}`,description:`Expire dans ${s.days_left} jours`,ts:Date.now(),action_route:"vault"})}catch{}return e}function m(){const e=[];try{const t=localStorage.getItem("ax_claude_todo")??"[]",s=JSON.parse(t);if(Array.isArray(s))for(const a of s.filter(r=>r.status==="pending").slice(0,5))e.push({id:a.id??`todo_${Date.now()}`,source:"apex_todo",title:a.reason??"Todo sans description",severity:a.severity??"medium",ts_created:a.ts??Date.now()})}catch{}return e}function h(e,t=0){return`
    <button class="ax-kpi-card ax-modernized-card ax-bounce-tap" data-route="${i(e.route)}"
      style="position:relative;background:linear-gradient(135deg,rgba(20,20,35,0.85),rgba(14,14,28,0.75));backdrop-filter:blur(20px) saturate(140%);-webkit-backdrop-filter:blur(20px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px 16px;cursor:pointer;text-align:center;transition:all 280ms cubic-bezier(0.34,1.56,0.64,1);overflow:hidden;min-height:120px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:6px;animation:ax-fade-up 360ms cubic-bezier(0.16,1,0.3,1) ${50+t*40}ms backwards;-webkit-tap-highlight-color:transparent">
      <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,${i(e.color)},transparent);border-radius:16px 16px 0 0;opacity:0.85"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(circle at top right,${i(e.color)}11,transparent 60%);pointer-events:none"></div>
      <div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 8px ${i(e.color)}40)">${i(e.icon)}</div>
      <div style="font-size:26px;font-weight:800;color:${i(e.color)};line-height:1;letter-spacing:-0.02em;font-feature-settings:'tnum'">${i(String(e.value))}</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.06em;font-weight:600">${i(e.label)}</div>
    </button>`}function y(e,t=0){return`
    <button class="ax-shortcut-card ax-modernized-card ax-bounce-tap" data-route="${i(e.route)}"
      style="position:relative;background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.55));backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px;cursor:pointer;text-align:left;transition:all 240ms cubic-bezier(0.16,1,0.3,1);display:flex;align-items:center;gap:14px;min-height:72px;overflow:hidden;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${80+t*35}ms backwards;-webkit-tap-highlight-color:transparent">
      <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,${i(e.color)},${i(e.color)}88);border-radius:14px 0 0 14px"></div>
      <span style="font-size:30px;flex-shrink:0;filter:drop-shadow(0 4px 12px ${i(e.color)}40);transition:transform 240ms cubic-bezier(0.34,1.56,0.64,1)" class="ax-shortcut-icon">${i(e.icon)}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.01em;line-height:1.3">${i(e.label)}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.55);line-height:1.4;margin-top:2px">${i(e.description)}</div>
      </div>
      <span style="color:${i(e.color)};font-size:20px;flex-shrink:0;transition:transform 240ms cubic-bezier(0.34,1.56,0.64,1)" class="ax-shortcut-arrow">→</span>
    </button>`}function v(e){return e.length===0?`
      <div style="display:flex;align-items:center;gap:12px;padding:16px;background:linear-gradient(135deg,rgba(34,204,119,0.08),rgba(34,204,119,0.03));border:1px solid rgba(34,204,119,0.15);border-radius:12px">
        <span style="font-size:20px;filter:drop-shadow(0 2px 6px rgba(34,204,119,0.4))">✅</span>
        <span style="color:rgba(255,255,255,0.85);font-size:14px;font-weight:500">Aucune alerte. Tout fonctionne.</span>
      </div>`:e.map((t,s)=>{const a=t.level==="error"?"#ff5b5b":t.level==="warn"?"#ffaa00":"#6a8aff",r=t.level==="error"?"255,91,91":t.level==="warn"?"255,170,0":"106,138,255",l=t.level==="error"?"🚨":t.level==="warn"?"⚠️":"ℹ️";return`
        <div class="ax-alert-row ax-modernized-card ax-bounce-tap" ${t.action_route?`data-route="${i(t.action_route)}"`:""}
          style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:linear-gradient(135deg,rgba(${r},.10),rgba(${r},.04));border:1px solid rgba(${r},.18);border-left:3px solid ${a};border-radius:12px;margin-bottom:8px;cursor:${t.action_route?"pointer":"default"};transition:all 200ms cubic-bezier(0.16,1,0.3,1);animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${60+s*50}ms backwards">
          <span style="font-size:20px;flex-shrink:0;filter:drop-shadow(0 2px 6px ${a}55)">${l}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:600;color:${a};letter-spacing:-0.01em">${i(t.title)}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:2px">${i(t.description)}</div>
          </div>
          ${t.action_route?`<span style="color:${a};font-size:18px;opacity:0.7">→</span>`:""}
        </div>`}).join("")}function w(e){return e.length===0?`
      <div style="display:flex;align-items:center;gap:12px;padding:16px;background:linear-gradient(135deg,rgba(34,204,119,0.08),rgba(34,204,119,0.03));border:1px solid rgba(34,204,119,0.15);border-radius:12px">
        <span style="font-size:20px;filter:drop-shadow(0 2px 6px rgba(34,204,119,0.4))">🎉</span>
        <span style="color:rgba(255,255,255,0.85);font-size:14px;font-weight:500">Aucun todo en attente.</span>
      </div>`:e.map((t,s)=>{const a=t.severity==="critical"?"#ff5b5b":t.severity==="high"?"#ffaa00":"#6a8aff",r=new Date(t.ts_created).toLocaleString("fr-FR");return`
        <div class="ax-modernized-card" style="padding:12px 14px;background:linear-gradient(135deg,rgba(20,20,35,0.6),rgba(14,14,28,0.4));backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.06);border-left:3px solid ${a};border-radius:10px;margin-bottom:8px;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${60+s*50}ms backwards">
          <div style="font-size:13px;font-weight:600;color:#fff;line-height:1.4">${i(t.title)}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:4px;display:flex;gap:8px;align-items:center">
            <span style="display:inline-block;padding:2px 8px;background:rgba(255,255,255,0.06);border-radius:6px;font-size:10px;text-transform:uppercase;letter-spacing:0.06em">${i(t.source)}</span>
            <span>${i(r)}</span>
          </div>
        </div>`}).join("")}async function S(e){const t=g.get("user"),s=t?.name?`Bonjour ${t.name}`:"Bonjour",[a,r]=await Promise.all([u(),b()]),l=m();e.innerHTML=`
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
        <h1 style="margin:0 0 6px;font-size:clamp(28px,5vw,36px);font-weight:700;background:linear-gradient(135deg,#c9a227 0%,#e8b830 50%,#f5cc4a 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:Georgia,serif;letter-spacing:-0.025em;line-height:1.1">${i(s)}</h1>
        <p style="color:rgba(255,255,255,0.55);margin:0;font-size:15px;font-weight:400;letter-spacing:-0.005em">Voici ton dashboard Apex.</p>
      </header>

      <section style="margin-bottom:32px">
        <h2 style="font-size:12px;color:rgba(232,184,48,0.85);margin:0 0 14px;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;display:flex;align-items:center;gap:6px">
          <span style="font-size:14px;-webkit-text-fill-color:initial">📊</span> Indicateurs clés
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px">
          ${a.map((n,o)=>h(n,o)).join("")}
        </div>
      </section>

      <section style="margin-bottom:32px">
        <h2 style="font-size:12px;color:rgba(232,184,48,0.85);margin:0 0 14px;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;display:flex;align-items:center;gap:8px">
          <span style="font-size:14px;-webkit-text-fill-color:initial">🔔</span> Alertes ${r.length>0?`<span style="display:inline-block;padding:2px 10px;background:rgba(255,91,91,0.15);color:#ff5b5b;border-radius:24px;font-size:11px;font-weight:700">${r.length}</span>`:""}
        </h2>
        ${v(r)}
      </section>

      <section style="margin-bottom:32px">
        <h2 style="font-size:12px;color:rgba(232,184,48,0.85);margin:0 0 14px;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;display:flex;align-items:center;gap:8px">
          <span style="font-size:14px;-webkit-text-fill-color:initial">📋</span> Todos ${l.length>0?`<span style="display:inline-block;padding:2px 10px;background:rgba(255,170,0,0.15);color:#ffaa00;border-radius:24px;font-size:11px;font-weight:700">${l.length}</span>`:""}
        </h2>
        ${w(l)}
      </section>

      <section style="margin-bottom:32px">
        <h2 style="font-size:12px;color:rgba(232,184,48,0.85);margin:0 0 14px;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;display:flex;align-items:center;gap:6px">
          <span style="font-size:14px;-webkit-text-fill-color:initial">🚀</span> Raccourcis
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
          ${x.map((n,o)=>y(n,o)).join("")}
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
              <div style="font-size:18px;font-weight:700;color:#e8b830;letter-spacing:-0.01em;font-feature-settings:'tnum'">${i((a.find(n=>n.id==="tokens")?.value??0).toString())}</div>
            </div>
          </div>
        </div>
      </section>

      <p style="text-align:center;color:rgba(255,255,255,0.3);font-size:11px;letter-spacing:0.05em;margin-top:24px">APEX v13 · Dashboard</p>
    </div>
  `,e.querySelectorAll("[data-route]").forEach(n=>{n.addEventListener("click",()=>{f.tap();const o=n.dataset.route;o&&(window.location.hash="#"+o)})}),d.info("feature-dashboard",`rendered (${a.length} kpis, ${r.length} alerts, ${l.length} todos)`)}export{u as computeKpis,i as escapeHtml,b as loadAlerts,m as loadTodos,S as render};
//# sourceMappingURL=index-HGhhOyq5.js.map
