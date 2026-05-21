const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-C132uqD8.js","./monitoring-BkJ_WZbY.js","./multi-source-analyze-DCjiC-qU.js","./credential-patterns-CLzI061R.js"])))=>i.map(i=>d[i]);
import{_ as S}from"./apex-kb-C132uqD8.js";import{a as w}from"./escape-html-DGIYNPKb.js";import{C as F}from"./monitoring-BkJ_WZbY.js";import{reportsHistory as v}from"./apex-reports-history-BfKyeJkG.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-DCjiC-qU.js";const p={chat:{category:"chat",label:"Chat",emoji:"💬",color:"#22cc77",accent:"rgba(34,204,119,0.15)"},admin:{category:"admin",label:"Admin",emoji:"⚙️",color:"#c9a227",accent:"rgba(201,162,39,0.15)"},settings:{category:"settings",label:"Réglages",emoji:"🔧",color:"#8bb4ff",accent:"rgba(139,180,255,0.15)"},vault:{category:"vault",label:"Coffre",emoji:"🔐",color:"#e8b830",accent:"rgba(232,184,48,0.15)"},studio:{category:"studio",label:"Studio",emoji:"🎨",color:"#c97aff",accent:"rgba(201,122,255,0.15)"},memory:{category:"memory",label:"Mémoire",emoji:"🧠",color:"#f78322",accent:"rgba(247,131,34,0.15)"},other:{category:"other",label:"Autre",emoji:"📦",color:"#94a3b8",accent:"rgba(148,163,184,0.15)"}},T={critical:{label:"Critique",color:"#ff5b5b",emoji:"❌",bg:"rgba(255,91,91,0.10)"},warning:{label:"Warning",color:"#ffaa66",emoji:"⚠️",bg:"rgba(255,170,102,0.10)"},ok:{label:"OK",color:"#22cc77",emoji:"✅",bg:"rgba(34,204,119,0.10)"}};function g(o){const r=o.toLowerCase();return r.includes("chat")?p.chat:r.includes("admin")||r.includes("runtime-test")||r.includes("apex-audits")||r.includes("all-secrets")||r.includes("credentials")||r.includes("rgpd")||r.includes("health")?p.admin:r.includes("setting")||r.includes("config")||r.includes("reglage")?p.settings:r.includes("vault")||r.includes("coffre")?p.vault:r.includes("studio")||r.includes("image")||r.includes("video")||r.includes("music")?p.studio:r.includes("memor")||r.includes("memoire")||r.includes("kb")||r.includes("know")?p.memory:p.other}function j(o){return o.hasHorizontalOverflow&&o.hiddenButtonsCount>0?"critical":o.hasHorizontalOverflow||o.hiddenButtonsCount>0?"warning":"ok"}function h(o){return o.okRate<.5||o.errors>3||o.escalated?"critical":o.okRate<.8||o.noResponse>0||o.errors>0?"warning":"ok"}function k(o){return new Date(o).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}function L(o){const r=new Date(o);return`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,"0")}-${String(r.getDate()).padStart(2,"0")}`}function A(o){return new Date(o).toLocaleDateString("fr-FR",{weekday:"short",day:"2-digit",month:"short"})}function x(o,r,e=80,l=24){if(o.length===0)return"";const t=Math.max(...o,1),a=o.map((s,n)=>{const d=n/Math.max(1,o.length-1)*e,u=l-s/t*l;return`${d.toFixed(1)},${u.toFixed(1)}`}).join(" ");return`<svg width="${e}" height="${l}" viewBox="0 0 ${e} ${l}" style="display:inline-block;vertical-align:middle">
    <polyline points="${a}" fill="none" stroke="${r}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`}function E(o){return`
    <nav style="display:flex;gap:6px;margin-bottom:16px;overflow-x:auto;padding:2px;scrollbar-width:none">
      ${[{id:"overview",label:"✨ Vue d'ensemble",color:"#c9a227"},{id:"by-view",label:"🗂 Par vue",color:"#8bb4ff"},{id:"by-severity",label:"🚦 Par sévérité",color:"#ff5b5b"},{id:"timeline",label:"📅 Timeline",color:"#22cc77"},{id:"trends",label:"📈 Tendances",color:"#c97aff"}].map(e=>`
        <button class="ax-audits-tab" data-tab="${e.id}" style="
          padding:8px 14px;
          background:${o===e.id?`linear-gradient(135deg,${e.color}22,${e.color}11)`:"rgba(255,255,255,0.03)"};
          color:${o===e.id?e.color:"rgba(255,255,255,0.6)"};
          border:1px solid ${o===e.id?e.color+"55":"rgba(255,255,255,0.08)"};
          border-radius:20px;
          font-size:12px;
          font-weight:${o===e.id?"700":"500"};
          cursor:pointer;
          white-space:nowrap;
          min-height:36px;
          -webkit-tap-highlight-color:transparent;
          transition:all 180ms cubic-bezier(0.16,1,0.3,1);
        ">${e.label}</button>
      `).join("")}
    </nav>
  `}function R(o,r){const e=v.getStats(),l=o.slice(-14).map(i=>(i.hasHorizontalOverflow?1:0)+i.hiddenButtonsCount),t=r.slice(-14).map(i=>i.noResponse+i.errors),a=e.lastLayoutTs?k(e.lastLayoutTs):"jamais",s=e.lastFunctionalTs?k(e.lastFunctionalTs):"jamais",n={critical:0,warning:0,ok:0};o.forEach(i=>n[j(i)]++);const d={critical:0,warning:0,ok:0};r.forEach(i=>d[h(i)]++);const u=(i,c)=>{if(c===0)return'<div style="color:rgba(255,255,255,0.4);font-size:11px">Pas encore de données</div>';const $=i.critical/c*100,m=i.warning/c*100;return`
      <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;background:rgba(255,255,255,0.04);margin-top:6px">
        <div style="width:${i.ok/c*100}%;background:#22cc77" title="OK : ${i.ok}"></div>
        <div style="width:${m}%;background:#ffaa66" title="Warning : ${i.warning}"></div>
        <div style="width:${$}%;background:#ff5b5b" title="Critical : ${i.critical}"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:rgba(255,255,255,0.6)">
        <span>✅ ${i.ok}</span><span>⚠️ ${i.warning}</span><span>❌ ${i.critical}</span>
      </div>
    `};return`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">
      <div style="background:linear-gradient(135deg,rgba(180,90,200,0.10),rgba(180,90,200,0.04));border:1px solid rgba(180,90,200,0.25);border-radius:14px;padding:14px">
        <div class="ax-gs-22">
          <span style="font-weight:700;color:#c97aff">📐 Layout</span>
          ${x(l,"#c97aff")}
        </div>
        <div class="ax-gs-84">${e.layoutCount}</div>
        <div class="ax-gs-23">scans · dernier ${a}</div>
        ${u(n,o.length)}
      </div>

      <div style="background:linear-gradient(135deg,rgba(106,138,255,0.10),rgba(106,138,255,0.04));border:1px solid rgba(106,138,255,0.25);border-radius:14px;padding:14px">
        <div class="ax-gs-22">
          <span style="font-weight:700;color:#8bb4ff">🧪 Fonctionnel</span>
          ${x(t,"#8bb4ff")}
        </div>
        <div class="ax-gs-84">${e.functionalCount}</div>
        <div class="ax-gs-23">tests · dernier ${s}</div>
        ${u(d,r.length)}
      </div>

      <div style="background:linear-gradient(135deg,rgba(255,91,91,0.10),rgba(255,91,91,0.04));border:1px solid rgba(255,91,91,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#ff5b5b;margin-bottom:8px">🐛 Bugs 24h</div>
        <div style="font-size:32px;font-weight:800;color:${e.recentBugs>0?"#ff5b5b":"#22cc77"}">${e.recentBugs}</div>
        <div class="ax-gs-85">détectés sur 24 dernières heures</div>
      </div>

      <div style="background:linear-gradient(135deg,rgba(255,170,102,0.10),rgba(255,170,102,0.04));border:1px solid rgba(255,170,102,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#ffaa66;margin-bottom:8px">📤 Escaladés Claude Code 24h</div>
        <div style="font-size:32px;font-weight:800;color:${e.recentEscalations>0?"#ffaa66":"#22cc77"}">${e.recentEscalations}</div>
        <div class="ax-gs-85">via ax_claude_todo Firebase</div>
      </div>
    </div>
  `}function B(o,r){const e={chat:{layouts:[],funcs:[],views:new Set},admin:{layouts:[],funcs:[],views:new Set},settings:{layouts:[],funcs:[],views:new Set},vault:{layouts:[],funcs:[],views:new Set},studio:{layouts:[],funcs:[],views:new Set},memory:{layouts:[],funcs:[],views:new Set},other:{layouts:[],funcs:[],views:new Set}};return o.forEach(t=>{const a=g(t.view).category;e[a].layouts.push(t),e[a].views.add(t.view)}),r.forEach(t=>{const a=g(t.view).category;e[a].funcs.push(t),e[a].views.add(t.view)}),["chat","admin","settings","vault","studio","memory","other"].filter(t=>e[t].layouts.length+e[t].funcs.length>0).map((t,a)=>{const s=p[t],n=e[t],d=n.layouts.length,u=n.funcs.length,i=n.layouts.filter(b=>b.hasHorizontalOverflow).length,c=n.layouts.reduce((b,C)=>b+C.hiddenButtonsCount,0),$=n.funcs.filter(b=>h(b)==="ok").length,m=u>0?Math.round($/u*100):0,z=Array.from(n.views).slice(0,3).map(b=>w(b)).join(", "),O=n.views.size>3?` +${n.views.size-3}`:"";return`
        <div class="ax-audits-card" style="background:linear-gradient(135deg,${s.accent},rgba(255,255,255,0.02));border:1px solid ${s.color}33;border-radius:14px;padding:14px;margin-bottom:10px;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${a*60}ms backwards">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">
            <div style="font-weight:700;color:${s.color};font-size:15px">${s.emoji} ${s.label}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);font-family:monospace">${z}${O}</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;font-size:12px;color:rgba(255,255,255,0.85)">
            <div>📐 Layout scans : <b>${d}</b></div>
            <div>🧪 Tests : <b>${u}</b></div>
            <div>⚠ Overflow : <b style="color:${i?"#ff5b5b":"#22cc77"}">${i}</b></div>
            <div>🚫 Boutons cachés : <b style="color:${c?"#ffaa66":"#22cc77"}">${c}</b></div>
            <div>✅ OK fonctionnel : <b style="color:${m>=80?"#22cc77":m>=50?"#ffaa66":"#ff5b5b"}">${m}%</b></div>
          </div>
        </div>
      `}).join("")||'<div class="ax-gs-54">Aucune vue auditée encore.</div>'}function _(o,r){const e={critical:[],warning:[],ok:[]};return o.forEach(t=>{const a=j(t),s=g(t.view);e[a].push({type:"Layout",view:`${s.emoji} ${t.view}`,ts:t.ts,summary:`overflow:${t.hasHorizontalOverflow?"OUI":"NON"} · cachés:${t.hiddenButtonsCount} · touch<44:${t.smallTouchTargetsCount}`,color:s.color})}),r.forEach(t=>{const a=h(t),s=g(t.view);e[a].push({type:"Fonctionnel",view:`${s.emoji} ${t.view}`,ts:t.ts,summary:`${t.ok}/${t.tested} OK (${Math.round(t.okRate*100)}%) · no-resp:${t.noResponse} · err:${t.errors}${t.escalated?" · ⚠ escaladé":""}`,color:s.color})}),["critical","warning","ok"].map((t,a)=>{const s=e[t].sort((d,u)=>u.ts-d.ts).slice(0,15);if(s.length===0)return"";const n=T[t];return`
      <div style="background:${n.bg};border:1px solid ${n.color}55;border-radius:14px;padding:14px;margin-bottom:12px;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${a*80}ms backwards">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div style="font-weight:700;color:${n.color};font-size:15px">${n.emoji} ${n.label}</div>
          <div style="background:${n.color};color:#08080f;padding:2px 10px;border-radius:12px;font-weight:700;font-size:12px">${e[t].length}</div>
        </div>
        ${s.map(d=>`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px;flex-wrap:wrap;gap:6px">
            <div class="ax-gs-6">
              <span style="color:${d.color};font-weight:600">${d.type}</span>
              <span style="color:rgba(255,255,255,0.5);margin:0 6px">·</span>
              <span class="ax-gs-86">${d.view}</span>
              <div style="color:rgba(255,255,255,0.6);font-size:11px;margin-top:2px">${d.summary}</div>
            </div>
            <div style="color:rgba(255,255,255,0.5);font-size:11px;font-family:monospace">${k(d.ts)}</div>
          </div>
        `).join("")}
      </div>
    `}).join("")||'<div class="ax-gs-54">Aucun audit historisé.</div>'}function M(o,r){const e={};o.forEach(t=>{const a=L(t.ts);e[a]||(e[a]={ts:t.ts,events:[]});const s=g(t.view);e[a].events.push({type:"Layout",emoji:s.emoji,color:s.color,view:t.view,summary:`overflow:${t.hasHorizontalOverflow?"OUI":"NON"} · cachés:${t.hiddenButtonsCount}`,sev:j(t),ts:t.ts})}),r.forEach(t=>{const a=L(t.ts);e[a]||(e[a]={ts:t.ts,events:[]});const s=g(t.view);e[a].events.push({type:"Fonctionnel",emoji:s.emoji,color:s.color,view:t.view,summary:`${t.ok}/${t.tested} OK (${Math.round(t.okRate*100)}%)`,sev:h(t),ts:t.ts})});const l=Object.entries(e).sort((t,a)=>a[1].ts-t[1].ts);return l.length===0?`<div class="ax-gs-54">Pas encore d'événement.</div>`:l.map(([t,a],s)=>`
    <div style="margin-bottom:14px;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${s*60}ms backwards">
      <div style="font-weight:700;color:#c9a227;font-size:13px;margin-bottom:8px;letter-spacing:0.04em">
        ${A(a.ts)} <span style="color:rgba(255,255,255,0.4);font-weight:500;font-size:11px">· ${w(t)} · ${a.events.length} événement(s)</span>
      </div>
      ${a.events.sort((n,d)=>d.ts-n.ts).map(n=>{const d=T[n.sev];return`
          <div style="display:flex;gap:10px;padding:8px 10px;background:rgba(255,255,255,0.02);border-left:3px solid ${n.color};border-radius:6px;margin-bottom:4px;font-size:12px">
            <div class="ax-gs-87">${n.emoji}</div>
            <div class="ax-gs-6">
              <div class="ax-gs-86"><b>${n.type}</b> <span class="ax-gs-182">${w(n.view)}</span></div>
              <div class="ax-gs-55">${n.summary}</div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="background:${d.bg};color:${d.color};padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">${d.emoji} ${d.label}</div>
              <div style="color:rgba(255,255,255,0.4);font-size:10px;margin-top:2px;font-family:monospace">${new Date(n.ts).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
            </div>
          </div>
        `}).join("")}
    </div>
  `).join("")}function D(o,r){const e=o.slice(-30),l=r.slice(-30),t=e.map(i=>i.hasHorizontalOverflow?1:0),a=e.map(i=>i.hiddenButtonsCount),s=l.map(i=>i.okRate),n=l.map(i=>i.errors),d={};o.forEach(i=>{if(i.hasHorizontalOverflow||i.hiddenButtonsCount>0){const c=g(i.view);d[i.view]||(d[i.view]={layout:0,func:0,meta:c}),d[i.view].layout++}}),r.forEach(i=>{if(i.noResponse>0||i.errors>0){const c=g(i.view);d[i.view]||(d[i.view]={layout:0,func:0,meta:c}),d[i.view].func++}});const u=Object.entries(d).sort((i,c)=>c[1].layout+c[1].func-(i[1].layout+i[1].func)).slice(0,8);return`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-bottom:14px">
      <div style="background:linear-gradient(135deg,rgba(255,91,91,0.08),rgba(255,91,91,0.02));border:1px solid rgba(255,91,91,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#ff5b5b;margin-bottom:6px">📈 Overflow horizontal (30 derniers)</div>
        ${x(t,"#ff5b5b",240,40)}
        <div class="ax-gs-36">Total : ${t.filter(i=>i===1).length}/30</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(255,170,102,0.08),rgba(255,170,102,0.02));border:1px solid rgba(255,170,102,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#ffaa66;margin-bottom:6px">📈 Boutons cachés (30 derniers)</div>
        ${x(a,"#ffaa66",240,40)}
        <div class="ax-gs-36">Max : ${Math.max(0,...a)}</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(34,204,119,0.08),rgba(34,204,119,0.02));border:1px solid rgba(34,204,119,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#22cc77;margin-bottom:6px">📈 OK rate fonctionnel (30 derniers)</div>
        ${x(s,"#22cc77",240,40)}
        <div class="ax-gs-36">Moyenne : ${s.length?Math.round(s.reduce((i,c)=>i+c,0)/s.length*100):0}%</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(106,138,255,0.08),rgba(106,138,255,0.02));border:1px solid rgba(106,138,255,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#8bb4ff;margin-bottom:6px">📈 Erreurs (30 derniers)</div>
        ${x(n,"#8bb4ff",240,40)}
        <div class="ax-gs-36">Total : ${n.reduce((i,c)=>i+c,0)}</div>
      </div>
    </div>

    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:14px">
      <div style="font-weight:700;color:#c9a227;margin-bottom:10px">🏆 Top vues problématiques</div>
      ${u.length===0?'<div class="ax-gs-183">Aucune vue avec issues récurrentes. 🎉</div>':u.map(([i,c])=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px">
              <span style="color:${c.meta.color};font-weight:600">${c.meta.emoji} ${w(i)}</span>
              <span style="color:rgba(255,255,255,0.65)">📐 ${c.layout} · 🧪 ${c.func} · <b style="color:#ff5b5b">Σ ${c.layout+c.func}</b></span>
            </div>
          `).join("")}
    </div>
  `}let f="overview";function y(o){if(!(F.get("isAdmin")===!0)){o.innerHTML='<div class="ax-gs-37">🔒 Réservé admin Kevin</div>';return}const e=v.getLayoutHistory().slice(),l=v.getFunctionalHistory().slice(),t=f==="overview"?R(e,l):f==="by-view"?B(e,l):f==="by-severity"?_(e,l):f==="timeline"?M(e,l):D(e,l);o.innerHTML=`
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
          <button id="ax-audits-run-functional" class="ax-btn" style="padding:6px 10px;background:rgba(106,138,255,0.12);color:#8bb4ff;border:1px solid rgba(106,138,255,0.3);border-radius:18px;cursor:pointer;font-size:11px;min-height:34px">🧪 Tester</button>
          <button id="ax-audits-run-layout" class="ax-btn" style="padding:6px 10px;background:rgba(180,90,200,0.12);color:#c97aff;border:1px solid rgba(180,90,200,0.3);border-radius:18px;cursor:pointer;font-size:11px;min-height:34px">📐 Scan</button>
          <button id="ax-audits-clear" class="ax-btn" style="padding:6px 10px;background:rgba(255,91,91,0.08);color:#ff5b5b;border:1px solid rgba(255,91,91,0.25);border-radius:18px;cursor:pointer;font-size:11px;min-height:34px">🗑</button>
          <button class="ax-btn" data-nav-route="admin" style="padding:6px 10px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.15);border-radius:18px;cursor:pointer;font-size:11px;min-height:34px">← Admin</button>
        </div>
      </header>

      ${E(f)}

      <div id="ax-audits-tab-content">
        ${t}
      </div>
    </div>
  `,o.querySelectorAll(".ax-audits-tab").forEach(a=>{a.addEventListener("click",()=>{const s=a.getAttribute("data-tab");s&&(f=s,y(o))})}),o.querySelector("#ax-audits-run-functional")?.addEventListener("click",()=>{(async()=>{const a=o.querySelector("#ax-audits-run-functional");a&&(a.disabled=!0);try{const{apexFunctionalTester:s}=await S(async()=>{const{apexFunctionalTester:d}=await import("./apex-functional-tester-CH8oFfHV.js");return{apexFunctionalTester:d}},__vite__mapDeps([0,1,2,3]),import.meta.url),n=await s.testAndAutoFix({maxButtons:30});v.recordFunctional(n.before,n.fixes,n.after,n.improvement),y(o)}catch{}a&&(a.disabled=!1)})()}),o.querySelector("#ax-audits-run-layout")?.addEventListener("click",()=>{(async()=>{try{const{apexLayoutInspector:a}=await S(async()=>{const{apexLayoutInspector:n}=await import("./apex-layout-inspector-CQSPmJCw.js");return{apexLayoutInspector:n}},__vite__mapDeps([0,1,2,3]),import.meta.url),s=a.scanDom();v.recordLayout(s),y(o)}catch{}})()}),o.querySelector("#ax-audits-clear")?.addEventListener("click",()=>{confirm("Vider tout l'historique des audits ?")&&(v.clearHistory(),y(o))})}export{y as render};
