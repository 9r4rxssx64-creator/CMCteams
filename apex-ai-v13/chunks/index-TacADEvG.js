const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-DE8tOht_.js","./multi-source-analyze-y_3vQuz1.js","./credential-patterns-DUMYZEMu.js","./apex-kb-BHH7h7Vp.js"])))=>i.map(i=>d[i]);
import{b as B,_ as T,e as w}from"./monitoring-DE8tOht_.js";import{reportsHistory as v}from"./apex-reports-history-BdNzyvlU.js";import{toast as y}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-y_3vQuz1.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-BHH7h7Vp.js";import"./haptic-CQFg2PXZ.js";function A(e,r,i){return Promise.race([e,new Promise((l,t)=>setTimeout(()=>t(new Error(`${i} : délai dépassé (${Math.round(r/1e3)}s)`)),r))])}const g={chat:{category:"chat",label:"Chat",emoji:"💬",color:"#22cc77",accent:"rgba(34,204,119,0.15)"},admin:{category:"admin",label:"Admin",emoji:"⚙️",color:"#c9a227",accent:"rgba(201,162,39,0.15)"},settings:{category:"settings",label:"Réglages",emoji:"🔧",color:"#8bb4ff",accent:"rgba(139,180,255,0.15)"},vault:{category:"vault",label:"Coffre",emoji:"🔐",color:"#e8b830",accent:"rgba(232,184,48,0.15)"},studio:{category:"studio",label:"Studio",emoji:"🎨",color:"#c97aff",accent:"rgba(201,122,255,0.15)"},memory:{category:"memory",label:"Mémoire",emoji:"🧠",color:"#f78322",accent:"rgba(247,131,34,0.15)"},other:{category:"other",label:"Autre",emoji:"📦",color:"#94a3b8",accent:"rgba(148,163,184,0.15)"}},L={critical:{label:"Critique",color:"#ff5b5b",emoji:"❌",bg:"rgba(255,91,91,0.10)"},warning:{label:"Warning",color:"#ffaa66",emoji:"⚠️",bg:"rgba(255,170,102,0.10)"},ok:{label:"OK",color:"#22cc77",emoji:"✅",bg:"rgba(34,204,119,0.10)"}};function p(e){const r=e.toLowerCase();return r.includes("chat")?g.chat:r.includes("admin")||r.includes("runtime-test")||r.includes("apex-audits")||r.includes("all-secrets")||r.includes("credentials")||r.includes("rgpd")||r.includes("health")?g.admin:r.includes("setting")||r.includes("config")||r.includes("reglage")?g.settings:r.includes("vault")||r.includes("coffre")?g.vault:r.includes("studio")||r.includes("image")||r.includes("video")||r.includes("music")?g.studio:r.includes("memor")||r.includes("memoire")||r.includes("kb")||r.includes("know")?g.memory:g.other}function z(e){return e.hasHorizontalOverflow&&e.hiddenButtonsCount>0?"critical":e.hasHorizontalOverflow||e.hiddenButtonsCount>0?"warning":"ok"}function $(e){return e.okRate<.5||e.errors>3||e.escalated?"critical":e.okRate<.8||e.noResponse>0||e.errors>0?"warning":"ok"}function j(e){return new Date(e).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}function O(e){const r=new Date(e);return`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,"0")}-${String(r.getDate()).padStart(2,"0")}`}function E(e){return new Date(e).toLocaleDateString("fr-FR",{weekday:"short",day:"2-digit",month:"short"})}function m(e,r,i=80,l=24){if(e.length===0)return"";const t=Math.max(...e,1),s=e.map((n,a)=>{const d=a/Math.max(1,e.length-1)*i,u=l-n/t*l;return`${d.toFixed(1)},${u.toFixed(1)}`}).join(" ");return`<svg width="${i}" height="${l}" viewBox="0 0 ${i} ${l}" style="display:inline-block;vertical-align:middle">
    <polyline points="${s}" fill="none" stroke="${r}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`}function R(e){return`
    <nav style="display:flex;gap:6px;margin-bottom:16px;overflow-x:auto;padding:2px;scrollbar-width:none">
      ${[{id:"overview",label:"✨ Vue d'ensemble",color:"#c9a227"},{id:"by-view",label:"🗂 Par vue",color:"#8bb4ff"},{id:"by-severity",label:"🚦 Par sévérité",color:"#ff5b5b"},{id:"timeline",label:"📅 Timeline",color:"#22cc77"},{id:"trends",label:"📈 Tendances",color:"#c97aff"}].map(i=>`
        <button class="ax-audits-tab" data-tab="${i.id}" style="
          padding:8px 14px;
          background:${e===i.id?`linear-gradient(135deg,${i.color}22,${i.color}11)`:"rgba(255,255,255,0.03)"};
          color:${e===i.id?i.color:"rgba(255,255,255,0.6)"};
          border:1px solid ${e===i.id?i.color+"55":"rgba(255,255,255,0.08)"};
          border-radius:20px;
          font-size:12px;
          font-weight:${e===i.id?"700":"500"};
          cursor:pointer;
          white-space:nowrap;
          min-height:44px;
          -webkit-tap-highlight-color:transparent;
          transition:all 180ms cubic-bezier(0.16,1,0.3,1);
        ">${i.label}</button>
      `).join("")}
    </nav>
  `}function _(e,r){const i=v.getStats(),l=e.slice(-14).map(o=>(o.hasHorizontalOverflow?1:0)+o.hiddenButtonsCount),t=r.slice(-14).map(o=>o.noResponse+o.errors),s=i.lastLayoutTs?j(i.lastLayoutTs):"jamais",n=i.lastFunctionalTs?j(i.lastFunctionalTs):"jamais",a={critical:0,warning:0,ok:0};e.forEach(o=>a[z(o)]++);const d={critical:0,warning:0,ok:0};r.forEach(o=>d[$(o)]++);const u=(o,c)=>{if(c===0)return'<div style="color:rgba(255,255,255,0.4);font-size:11px">Pas encore de données</div>';const k=o.critical/c*100,x=o.warning/c*100;return`
      <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;background:rgba(255,255,255,0.04);margin-top:6px">
        <div style="width:${o.ok/c*100}%;background:#22cc77" title="OK : ${o.ok}"></div>
        <div style="width:${x}%;background:#ffaa66" title="Warning : ${o.warning}"></div>
        <div style="width:${k}%;background:#ff5b5b" title="Critical : ${o.critical}"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:rgba(255,255,255,0.6)">
        <span>✅ ${o.ok}</span><span>⚠️ ${o.warning}</span><span>❌ ${o.critical}</span>
      </div>
    `};return`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">
      <div style="background:linear-gradient(135deg,rgba(180,90,200,0.10),rgba(180,90,200,0.04));border:1px solid rgba(180,90,200,0.25);border-radius:14px;padding:14px">
        <div class="ax-gs-22">
          <span style="font-weight:700;color:#c97aff">📐 Layout</span>
          ${m(l,"#c97aff")}
        </div>
        <div class="ax-gs-84">${i.layoutCount}</div>
        <div class="ax-gs-23">scans · dernier ${s}</div>
        ${u(a,e.length)}
      </div>

      <div style="background:linear-gradient(135deg,rgba(106,138,255,0.10),rgba(106,138,255,0.04));border:1px solid rgba(106,138,255,0.25);border-radius:14px;padding:14px">
        <div class="ax-gs-22">
          <span style="font-weight:700;color:#8bb4ff">🧪 Fonctionnel</span>
          ${m(t,"#8bb4ff")}
        </div>
        <div class="ax-gs-84">${i.functionalCount}</div>
        <div class="ax-gs-23">tests · dernier ${n}</div>
        ${u(d,r.length)}
      </div>

      <div style="background:linear-gradient(135deg,rgba(255,91,91,0.10),rgba(255,91,91,0.04));border:1px solid rgba(255,91,91,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#ff5b5b;margin-bottom:8px">🐛 Bugs 24h</div>
        <div style="font-size:32px;font-weight:800;color:${i.recentBugs>0?"#ff5b5b":"#22cc77"}">${i.recentBugs}</div>
        <div class="ax-gs-85">détectés sur 24 dernières heures</div>
      </div>

      <div style="background:linear-gradient(135deg,rgba(255,170,102,0.10),rgba(255,170,102,0.04));border:1px solid rgba(255,170,102,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#ffaa66;margin-bottom:8px">📤 Escaladés Claude Code 24h</div>
        <div style="font-size:32px;font-weight:800;color:${i.recentEscalations>0?"#ffaa66":"#22cc77"}">${i.recentEscalations}</div>
        <div class="ax-gs-85">via ax_claude_todo Firebase</div>
      </div>
    </div>
  `}function M(e,r){const i={chat:{layouts:[],funcs:[],views:new Set},admin:{layouts:[],funcs:[],views:new Set},settings:{layouts:[],funcs:[],views:new Set},vault:{layouts:[],funcs:[],views:new Set},studio:{layouts:[],funcs:[],views:new Set},memory:{layouts:[],funcs:[],views:new Set},other:{layouts:[],funcs:[],views:new Set}};return e.forEach(t=>{const s=p(t.view).category;i[s].layouts.push(t),i[s].views.add(t.view)}),r.forEach(t=>{const s=p(t.view).category;i[s].funcs.push(t),i[s].views.add(t.view)}),["chat","admin","settings","vault","studio","memory","other"].filter(t=>i[t].layouts.length+i[t].funcs.length>0).map((t,s)=>{const n=g[t],a=i[t],d=a.layouts.length,u=a.funcs.length,o=a.layouts.filter(b=>b.hasHorizontalOverflow).length,c=a.layouts.reduce((b,F)=>b+F.hiddenButtonsCount,0),k=a.funcs.filter(b=>$(b)==="ok").length,x=u>0?Math.round(k/u*100):0,S=Array.from(a.views).slice(0,3).map(b=>w(b)).join(", "),C=a.views.size>3?` +${a.views.size-3}`:"";return`
        <div class="ax-audits-card" style="background:linear-gradient(135deg,${n.accent},rgba(255,255,255,0.02));border:1px solid ${n.color}33;border-radius:14px;padding:14px;margin-bottom:10px;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${s*60}ms backwards">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">
            <div style="font-weight:700;color:${n.color};font-size:15px">${n.emoji} ${n.label}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);font-family:monospace">${S}${C}</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;font-size:12px;color:rgba(255,255,255,0.85)">
            <div>📐 Layout scans : <b>${d}</b></div>
            <div>🧪 Tests : <b>${u}</b></div>
            <div>⚠ Overflow : <b style="color:${o?"#ff5b5b":"#22cc77"}">${o}</b></div>
            <div>🚫 Boutons cachés : <b style="color:${c?"#ffaa66":"#22cc77"}">${c}</b></div>
            <div>✅ OK fonctionnel : <b style="color:${x>=80?"#22cc77":x>=50?"#ffaa66":"#ff5b5b"}">${x}%</b></div>
          </div>
        </div>
      `}).join("")||'<div class="ax-gs-54">Aucune vue auditée encore.</div>'}function P(e,r){const i={critical:[],warning:[],ok:[]};return e.forEach(t=>{const s=z(t),n=p(t.view);i[s].push({type:"Layout",view:`${n.emoji} ${t.view}`,ts:t.ts,summary:`overflow:${t.hasHorizontalOverflow?"OUI":"NON"} · cachés:${t.hiddenButtonsCount} · touch<44:${t.smallTouchTargetsCount}`,color:n.color})}),r.forEach(t=>{const s=$(t),n=p(t.view);i[s].push({type:"Fonctionnel",view:`${n.emoji} ${t.view}`,ts:t.ts,summary:`${t.ok}/${t.tested} OK (${Math.round(t.okRate*100)}%) · no-resp:${t.noResponse} · err:${t.errors}${t.escalated?" · ⚠ escaladé":""}`,color:n.color})}),["critical","warning","ok"].map((t,s)=>{const n=i[t].sort((d,u)=>u.ts-d.ts).slice(0,15);if(n.length===0)return"";const a=L[t];return`
      <div style="background:${a.bg};border:1px solid ${a.color}55;border-radius:14px;padding:14px;margin-bottom:12px;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${s*80}ms backwards">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div style="font-weight:700;color:${a.color};font-size:15px">${a.emoji} ${a.label}</div>
          <div style="background:${a.color};color:#08080f;padding:2px 10px;border-radius:12px;font-weight:700;font-size:12px">${i[t].length}</div>
        </div>
        ${n.map(d=>`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px;flex-wrap:wrap;gap:6px">
            <div class="ax-gs-6">
              <span style="color:${d.color};font-weight:600">${d.type}</span>
              <span style="color:rgba(255,255,255,0.5);margin:0 6px">·</span>
              <span class="ax-gs-86">${d.view}</span>
              <div style="color:rgba(255,255,255,0.6);font-size:11px;margin-top:2px">${d.summary}</div>
            </div>
            <div style="color:rgba(255,255,255,0.5);font-size:11px;font-family:monospace">${j(d.ts)}</div>
          </div>
        `).join("")}
      </div>
    `}).join("")||'<div class="ax-gs-54">Aucun audit historisé.</div>'}function D(e,r){const i={};e.forEach(t=>{const s=O(t.ts);i[s]||(i[s]={ts:t.ts,events:[]});const n=p(t.view);i[s].events.push({type:"Layout",emoji:n.emoji,color:n.color,view:t.view,summary:`overflow:${t.hasHorizontalOverflow?"OUI":"NON"} · cachés:${t.hiddenButtonsCount}`,sev:z(t),ts:t.ts})}),r.forEach(t=>{const s=O(t.ts);i[s]||(i[s]={ts:t.ts,events:[]});const n=p(t.view);i[s].events.push({type:"Fonctionnel",emoji:n.emoji,color:n.color,view:t.view,summary:`${t.ok}/${t.tested} OK (${Math.round(t.okRate*100)}%)`,sev:$(t),ts:t.ts})});const l=Object.entries(i).sort((t,s)=>s[1].ts-t[1].ts);return l.length===0?`<div class="ax-gs-54">Pas encore d'événement.</div>`:l.map(([t,s],n)=>`
    <div style="margin-bottom:14px;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${n*60}ms backwards">
      <div style="font-weight:700;color:#c9a227;font-size:13px;margin-bottom:8px;letter-spacing:0.04em">
        ${E(s.ts)} <span style="color:rgba(255,255,255,0.4);font-weight:500;font-size:11px">· ${w(t)} · ${s.events.length} événement(s)</span>
      </div>
      ${s.events.sort((a,d)=>d.ts-a.ts).map(a=>{const d=L[a.sev];return`
          <div style="display:flex;gap:10px;padding:8px 10px;background:rgba(255,255,255,0.02);border-left:3px solid ${a.color};border-radius:6px;margin-bottom:4px;font-size:12px">
            <div class="ax-gs-87">${a.emoji}</div>
            <div class="ax-gs-6">
              <div class="ax-gs-86"><b>${a.type}</b> <span class="ax-gs-182">${w(a.view)}</span></div>
              <div class="ax-gs-55">${a.summary}</div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="background:${d.bg};color:${d.color};padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">${d.emoji} ${d.label}</div>
              <div style="color:rgba(255,255,255,0.4);font-size:10px;margin-top:2px;font-family:monospace">${new Date(a.ts).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
            </div>
          </div>
        `}).join("")}
    </div>
  `).join("")}function q(e,r){const i=e.slice(-30),l=r.slice(-30),t=i.map(o=>o.hasHorizontalOverflow?1:0),s=i.map(o=>o.hiddenButtonsCount),n=l.map(o=>o.okRate),a=l.map(o=>o.errors),d={};e.forEach(o=>{if(o.hasHorizontalOverflow||o.hiddenButtonsCount>0){const c=p(o.view);d[o.view]||(d[o.view]={layout:0,func:0,meta:c}),d[o.view].layout++}}),r.forEach(o=>{if(o.noResponse>0||o.errors>0){const c=p(o.view);d[o.view]||(d[o.view]={layout:0,func:0,meta:c}),d[o.view].func++}});const u=Object.entries(d).sort((o,c)=>c[1].layout+c[1].func-(o[1].layout+o[1].func)).slice(0,8);return`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-bottom:14px">
      <div style="background:linear-gradient(135deg,rgba(255,91,91,0.08),rgba(255,91,91,0.02));border:1px solid rgba(255,91,91,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#ff5b5b;margin-bottom:6px">📈 Overflow horizontal (30 derniers)</div>
        ${m(t,"#ff5b5b",240,40)}
        <div class="ax-gs-36">Total : ${t.filter(o=>o===1).length}/30</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(255,170,102,0.08),rgba(255,170,102,0.02));border:1px solid rgba(255,170,102,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#ffaa66;margin-bottom:6px">📈 Boutons cachés (30 derniers)</div>
        ${m(s,"#ffaa66",240,40)}
        <div class="ax-gs-36">Max : ${Math.max(0,...s)}</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(34,204,119,0.08),rgba(34,204,119,0.02));border:1px solid rgba(34,204,119,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#22cc77;margin-bottom:6px">📈 OK rate fonctionnel (30 derniers)</div>
        ${m(n,"#22cc77",240,40)}
        <div class="ax-gs-36">Moyenne : ${n.length?Math.round(n.reduce((o,c)=>o+c,0)/n.length*100):0}%</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(106,138,255,0.08),rgba(106,138,255,0.02));border:1px solid rgba(106,138,255,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#8bb4ff;margin-bottom:6px">📈 Erreurs (30 derniers)</div>
        ${m(a,"#8bb4ff",240,40)}
        <div class="ax-gs-36">Total : ${a.reduce((o,c)=>o+c,0)}</div>
      </div>
    </div>

    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:14px">
      <div style="font-weight:700;color:#c9a227;margin-bottom:10px">🏆 Top vues problématiques</div>
      ${u.length===0?'<div class="ax-gs-183">Aucune vue avec issues récurrentes. 🎉</div>':u.map(([o,c])=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px">
              <span style="color:${c.meta.color};font-weight:600">${c.meta.emoji} ${w(o)}</span>
              <span style="color:rgba(255,255,255,0.65)">📐 ${c.layout} · 🧪 ${c.func} · <b style="color:#ff5b5b">Σ ${c.layout+c.func}</b></span>
            </div>
          `).join("")}
    </div>
  `}let f="overview";function h(e){if(!(B.get("isAdmin")===!0)){e.innerHTML='<div class="ax-gs-37">🔒 Réservé admin Kevin</div>';return}const i=v.getLayoutHistory().slice(),l=v.getFunctionalHistory().slice(),t=f==="overview"?_(i,l):f==="by-view"?M(i,l):f==="by-severity"?P(i,l):f==="timeline"?D(i,l):q(i,l);e.innerHTML=`
    <style>
      @keyframes ax-fade-up { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
      .ax-audits-tab:active { transform: scale(0.96); }
      .ax-audits-card { backdrop-filter: blur(8px) saturate(120%); -webkit-backdrop-filter: blur(8px) saturate(120%); }
    </style>
    <div class="ax-admin ax-page" style="padding:14px;max-width:980px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:8px">
        <div>
          <h1 style="margin:0;background:linear-gradient(135deg,#c9a227,#e8b830);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;font-size:22px;letter-spacing:-0.02em">📊 Apex Audits Live</h1>
          <div style="color:rgba(255,255,255,0.5);font-size:11px;margin-top:2px">Classification intelligente · par fonction · par sévérité · par thème</div>
        </div>
        <div class="ax-gs-88">
          <button id="ax-audits-run-functional" class="ax-btn" style="padding:6px 10px;background:rgba(106,138,255,0.12);color:#8bb4ff;border:1px solid rgba(106,138,255,0.3);border-radius:18px;cursor:pointer;font-size:11px;min-height:44px">🧪 Tester</button>
          <button id="ax-audits-run-layout" class="ax-btn" style="padding:6px 10px;background:rgba(180,90,200,0.12);color:#c97aff;border:1px solid rgba(180,90,200,0.3);border-radius:18px;cursor:pointer;font-size:11px;min-height:44px">📐 Scan</button>
          <button id="ax-audits-clear" class="ax-btn" aria-label="Effacer les audits" style="padding:6px 10px;background:rgba(255,91,91,0.08);color:#ff5b5b;border:1px solid rgba(255,91,91,0.25);border-radius:18px;cursor:pointer;font-size:11px;min-height:44px">🗑</button>
          <button class="ax-btn" data-nav-route="admin" style="padding:6px 10px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.15);border-radius:18px;cursor:pointer;font-size:11px;min-height:44px">← Admin</button>
        </div>
      </header>

      ${R(f)}

      <div id="ax-audits-tab-content">
        ${t}
      </div>
    </div>
  `,e.querySelectorAll(".ax-audits-tab").forEach(s=>{s.addEventListener("click",()=>{const n=s.getAttribute("data-tab");n&&(f=n,h(e))})}),e.querySelector("#ax-audits-run-functional")?.addEventListener("click",()=>{(async()=>{const s=e.querySelector("#ax-audits-run-functional");s&&(s.disabled=!0,s.textContent="⏳ Test…");try{const{apexFunctionalTester:n}=await T(async()=>{const{apexFunctionalTester:d}=await import("./apex-functional-tester-BqajyVf5.js");return{apexFunctionalTester:d}},__vite__mapDeps([0,1,2,3]),import.meta.url),a=await A(n.testAndAutoFix({maxButtons:30}),9e4,"Test fonctionnel");v.recordFunctional(a.before,a.fixes,a.after,a.improvement),y.success(`🧪 Test terminé : ${a.before.ok}/${a.before.tested} OK`),h(e)}catch(n){const a=n instanceof Error?n.message:String(n);y.error(`Test fonctionnel KO — ${a}`);const d=e.querySelector("#ax-audits-run-functional");d&&(d.disabled=!1,d.textContent="🧪 Tester")}})()}),e.querySelector("#ax-audits-run-layout")?.addEventListener("click",()=>{(async()=>{const s=e.querySelector("#ax-audits-run-layout");s&&(s.disabled=!0);try{const{apexLayoutInspector:n}=await T(async()=>{const{apexLayoutInspector:d}=await import("./apex-layout-inspector-sUVOHwOn.js");return{apexLayoutInspector:d}},__vite__mapDeps([0,1,2,3]),import.meta.url),a=n.scanDom();v.recordLayout(a),y.success(`📐 Scan layout : ${a.hiddenButtons.length} bouton(s) caché(s)`),h(e)}catch(n){const a=n instanceof Error?n.message:String(n);y.error(`Scan layout KO — ${a}`);const d=e.querySelector("#ax-audits-run-layout");d&&(d.disabled=!1)}})()}),e.querySelector("#ax-audits-clear")?.addEventListener("click",()=>{confirm("Vider tout l'historique des audits ?")&&(v.clearHistory(),h(e))})}export{h as render};
