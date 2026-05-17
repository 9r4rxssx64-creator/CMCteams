const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-bcUFYneG.js","./monitoring-DMtdadhB.js","./credential-patterns-CLzI061R.js"])))=>i.map(i=>d[i]);
import{_ as S}from"./apex-kb-bcUFYneG.js";import{a as w}from"./escape-html-DGIYNPKb.js";import{i as F}from"../core/main-C-Np2BYW.js";import{reportsHistory as v}from"./apex-reports-history-CrX0f_kq.js";import"./monitoring-DMtdadhB.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-BGn3sGzl.js";const u={chat:{category:"chat",label:"Chat",emoji:"💬",color:"#22cc77",accent:"rgba(34,204,119,0.15)"},admin:{category:"admin",label:"Admin",emoji:"⚙️",color:"#c9a227",accent:"rgba(201,162,39,0.15)"},settings:{category:"settings",label:"Réglages",emoji:"🔧",color:"#8bb4ff",accent:"rgba(139,180,255,0.15)"},vault:{category:"vault",label:"Coffre",emoji:"🔐",color:"#e8b830",accent:"rgba(232,184,48,0.15)"},studio:{category:"studio",label:"Studio",emoji:"🎨",color:"#c97aff",accent:"rgba(201,122,255,0.15)"},memory:{category:"memory",label:"Mémoire",emoji:"🧠",color:"#f78322",accent:"rgba(247,131,34,0.15)"},other:{category:"other",label:"Autre",emoji:"📦",color:"#94a3b8",accent:"rgba(148,163,184,0.15)"}},T={critical:{label:"Critique",color:"#ff5b5b",emoji:"❌",bg:"rgba(255,91,91,0.10)"},warning:{label:"Warning",color:"#ffaa66",emoji:"⚠️",bg:"rgba(255,170,102,0.10)"},ok:{label:"OK",color:"#22cc77",emoji:"✅",bg:"rgba(34,204,119,0.10)"}};function g(o){const n=o.toLowerCase();return n.includes("chat")?u.chat:n.includes("admin")||n.includes("runtime-test")||n.includes("apex-audits")||n.includes("all-secrets")||n.includes("credentials")||n.includes("rgpd")||n.includes("health")?u.admin:n.includes("setting")||n.includes("config")||n.includes("reglage")?u.settings:n.includes("vault")||n.includes("coffre")?u.vault:n.includes("studio")||n.includes("image")||n.includes("video")||n.includes("music")?u.studio:n.includes("memor")||n.includes("memoire")||n.includes("kb")||n.includes("know")?u.memory:u.other}function z(o){return o.hasHorizontalOverflow&&o.hiddenButtonsCount>0?"critical":o.hasHorizontalOverflow||o.hiddenButtonsCount>0?"warning":"ok"}function h(o){return o.okRate<.5||o.errors>3||o.escalated?"critical":o.okRate<.8||o.noResponse>0||o.errors>0?"warning":"ok"}function k(o){return new Date(o).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}function L(o){const n=new Date(o);return`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`}function A(o){return new Date(o).toLocaleDateString("fr-FR",{weekday:"short",day:"2-digit",month:"short"})}function m(o,n,e=80,c=24){if(o.length===0)return"";const t=Math.max(...o,1),r=o.map((s,a)=>{const d=a/Math.max(1,o.length-1)*e,p=c-s/t*c;return`${d.toFixed(1)},${p.toFixed(1)}`}).join(" ");return`<svg width="${e}" height="${c}" viewBox="0 0 ${e} ${c}" style="display:inline-block;vertical-align:middle">
    <polyline points="${r}" fill="none" stroke="${n}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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
  `}function R(o,n){const e=v.getStats(),c=o.slice(-14).map(i=>(i.hasHorizontalOverflow?1:0)+i.hiddenButtonsCount),t=n.slice(-14).map(i=>i.noResponse+i.errors),r=e.lastLayoutTs?k(e.lastLayoutTs):"jamais",s=e.lastFunctionalTs?k(e.lastFunctionalTs):"jamais",a={critical:0,warning:0,ok:0};o.forEach(i=>a[z(i)]++);const d={critical:0,warning:0,ok:0};n.forEach(i=>d[h(i)]++);const p=(i,l)=>{if(l===0)return'<div style="color:rgba(255,255,255,0.4);font-size:11px">Pas encore de données</div>';const $=i.critical/l*100,x=i.warning/l*100;return`
      <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;background:rgba(255,255,255,0.04);margin-top:6px">
        <div style="width:${i.ok/l*100}%;background:#22cc77" title="OK : ${i.ok}"></div>
        <div style="width:${x}%;background:#ffaa66" title="Warning : ${i.warning}"></div>
        <div style="width:${$}%;background:#ff5b5b" title="Critical : ${i.critical}"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:rgba(255,255,255,0.6)">
        <span>✅ ${i.ok}</span><span>⚠️ ${i.warning}</span><span>❌ ${i.critical}</span>
      </div>
    `};return`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">
      <div style="background:linear-gradient(135deg,rgba(180,90,200,0.10),rgba(180,90,200,0.04));border:1px solid rgba(180,90,200,0.25);border-radius:14px;padding:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-weight:700;color:#c97aff">📐 Layout</span>
          ${m(c,"#c97aff")}
        </div>
        <div style="font-size:24px;font-weight:800;color:#fff">${e.layoutCount}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.5)">scans · dernier ${r}</div>
        ${p(a,o.length)}
      </div>

      <div style="background:linear-gradient(135deg,rgba(106,138,255,0.10),rgba(106,138,255,0.04));border:1px solid rgba(106,138,255,0.25);border-radius:14px;padding:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-weight:700;color:#8bb4ff">🧪 Fonctionnel</span>
          ${m(t,"#8bb4ff")}
        </div>
        <div style="font-size:24px;font-weight:800;color:#fff">${e.functionalCount}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.5)">tests · dernier ${s}</div>
        ${p(d,n.length)}
      </div>

      <div style="background:linear-gradient(135deg,rgba(255,91,91,0.10),rgba(255,91,91,0.04));border:1px solid rgba(255,91,91,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#ff5b5b;margin-bottom:8px">🐛 Bugs 24h</div>
        <div style="font-size:32px;font-weight:800;color:${e.recentBugs>0?"#ff5b5b":"#22cc77"}">${e.recentBugs}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px">détectés sur 24 dernières heures</div>
      </div>

      <div style="background:linear-gradient(135deg,rgba(255,170,102,0.10),rgba(255,170,102,0.04));border:1px solid rgba(255,170,102,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#ffaa66;margin-bottom:8px">📤 Escaladés Claude Code 24h</div>
        <div style="font-size:32px;font-weight:800;color:${e.recentEscalations>0?"#ffaa66":"#22cc77"}">${e.recentEscalations}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px">via ax_claude_todo Firebase</div>
      </div>
    </div>
  `}function B(o,n){const e={chat:{layouts:[],funcs:[],views:new Set},admin:{layouts:[],funcs:[],views:new Set},settings:{layouts:[],funcs:[],views:new Set},vault:{layouts:[],funcs:[],views:new Set},studio:{layouts:[],funcs:[],views:new Set},memory:{layouts:[],funcs:[],views:new Set},other:{layouts:[],funcs:[],views:new Set}};return o.forEach(t=>{const r=g(t.view).category;e[r].layouts.push(t),e[r].views.add(t.view)}),n.forEach(t=>{const r=g(t.view).category;e[r].funcs.push(t),e[r].views.add(t.view)}),["chat","admin","settings","vault","studio","memory","other"].filter(t=>e[t].layouts.length+e[t].funcs.length>0).map((t,r)=>{const s=u[t],a=e[t],d=a.layouts.length,p=a.funcs.length,i=a.layouts.filter(b=>b.hasHorizontalOverflow).length,l=a.layouts.reduce((b,C)=>b+C.hiddenButtonsCount,0),$=a.funcs.filter(b=>h(b)==="ok").length,x=p>0?Math.round($/p*100):0,j=Array.from(a.views).slice(0,3).map(b=>w(b)).join(", "),O=a.views.size>3?` +${a.views.size-3}`:"";return`
        <div class="ax-audits-card" style="background:linear-gradient(135deg,${s.accent},rgba(255,255,255,0.02));border:1px solid ${s.color}33;border-radius:14px;padding:14px;margin-bottom:10px;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${r*60}ms backwards">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">
            <div style="font-weight:700;color:${s.color};font-size:15px">${s.emoji} ${s.label}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);font-family:monospace">${j}${O}</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;font-size:12px;color:rgba(255,255,255,0.85)">
            <div>📐 Layout scans : <b>${d}</b></div>
            <div>🧪 Tests : <b>${p}</b></div>
            <div>⚠ Overflow : <b style="color:${i?"#ff5b5b":"#22cc77"}">${i}</b></div>
            <div>🚫 Boutons cachés : <b style="color:${l?"#ffaa66":"#22cc77"}">${l}</b></div>
            <div>✅ OK fonctionnel : <b style="color:${x>=80?"#22cc77":x>=50?"#ffaa66":"#ff5b5b"}">${x}%</b></div>
          </div>
        </div>
      `}).join("")||'<div style="color:rgba(255,255,255,0.5);font-size:12px;padding:24px;text-align:center">Aucune vue auditée encore.</div>'}function _(o,n){const e={critical:[],warning:[],ok:[]};return o.forEach(t=>{const r=z(t),s=g(t.view);e[r].push({type:"Layout",view:`${s.emoji} ${t.view}`,ts:t.ts,summary:`overflow:${t.hasHorizontalOverflow?"OUI":"NON"} · cachés:${t.hiddenButtonsCount} · touch<44:${t.smallTouchTargetsCount}`,color:s.color})}),n.forEach(t=>{const r=h(t),s=g(t.view);e[r].push({type:"Fonctionnel",view:`${s.emoji} ${t.view}`,ts:t.ts,summary:`${t.ok}/${t.tested} OK (${Math.round(t.okRate*100)}%) · no-resp:${t.noResponse} · err:${t.errors}${t.escalated?" · ⚠ escaladé":""}`,color:s.color})}),["critical","warning","ok"].map((t,r)=>{const s=e[t].sort((d,p)=>p.ts-d.ts).slice(0,15);if(s.length===0)return"";const a=T[t];return`
      <div style="background:${a.bg};border:1px solid ${a.color}55;border-radius:14px;padding:14px;margin-bottom:12px;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${r*80}ms backwards">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div style="font-weight:700;color:${a.color};font-size:15px">${a.emoji} ${a.label}</div>
          <div style="background:${a.color};color:#08080f;padding:2px 10px;border-radius:12px;font-weight:700;font-size:12px">${e[t].length}</div>
        </div>
        ${s.map(d=>`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px;flex-wrap:wrap;gap:6px">
            <div style="flex:1;min-width:0">
              <span style="color:${d.color};font-weight:600">${d.type}</span>
              <span style="color:rgba(255,255,255,0.5);margin:0 6px">·</span>
              <span style="color:#fff">${d.view}</span>
              <div style="color:rgba(255,255,255,0.6);font-size:11px;margin-top:2px">${d.summary}</div>
            </div>
            <div style="color:rgba(255,255,255,0.5);font-size:11px;font-family:monospace">${k(d.ts)}</div>
          </div>
        `).join("")}
      </div>
    `}).join("")||'<div style="color:rgba(255,255,255,0.5);font-size:12px;padding:24px;text-align:center">Aucun audit historisé.</div>'}function M(o,n){const e={};o.forEach(t=>{const r=L(t.ts);e[r]||(e[r]={ts:t.ts,events:[]});const s=g(t.view);e[r].events.push({type:"Layout",emoji:s.emoji,color:s.color,view:t.view,summary:`overflow:${t.hasHorizontalOverflow?"OUI":"NON"} · cachés:${t.hiddenButtonsCount}`,sev:z(t),ts:t.ts})}),n.forEach(t=>{const r=L(t.ts);e[r]||(e[r]={ts:t.ts,events:[]});const s=g(t.view);e[r].events.push({type:"Fonctionnel",emoji:s.emoji,color:s.color,view:t.view,summary:`${t.ok}/${t.tested} OK (${Math.round(t.okRate*100)}%)`,sev:h(t),ts:t.ts})});const c=Object.entries(e).sort((t,r)=>r[1].ts-t[1].ts);return c.length===0?`<div style="color:rgba(255,255,255,0.5);font-size:12px;padding:24px;text-align:center">Pas encore d'événement.</div>`:c.map(([t,r],s)=>`
    <div style="margin-bottom:14px;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${s*60}ms backwards">
      <div style="font-weight:700;color:#c9a227;font-size:13px;margin-bottom:8px;letter-spacing:0.04em">
        ${A(r.ts)} <span style="color:rgba(255,255,255,0.4);font-weight:500;font-size:11px">· ${w(t)} · ${r.events.length} événement(s)</span>
      </div>
      ${r.events.sort((a,d)=>d.ts-a.ts).map(a=>{const d=T[a.sev];return`
          <div style="display:flex;gap:10px;padding:8px 10px;background:rgba(255,255,255,0.02);border-left:3px solid ${a.color};border-radius:6px;margin-bottom:4px;font-size:12px">
            <div style="font-size:14px">${a.emoji}</div>
            <div style="flex:1;min-width:0">
              <div style="color:#fff"><b>${a.type}</b> <span style="color:rgba(255,255,255,0.6)">${w(a.view)}</span></div>
              <div style="color:rgba(255,255,255,0.55);font-size:11px;margin-top:2px">${a.summary}</div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="background:${d.bg};color:${d.color};padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">${d.emoji} ${d.label}</div>
              <div style="color:rgba(255,255,255,0.4);font-size:10px;margin-top:2px;font-family:monospace">${new Date(a.ts).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
            </div>
          </div>
        `}).join("")}
    </div>
  `).join("")}function D(o,n){const e=o.slice(-30),c=n.slice(-30),t=e.map(i=>i.hasHorizontalOverflow?1:0),r=e.map(i=>i.hiddenButtonsCount),s=c.map(i=>i.okRate),a=c.map(i=>i.errors),d={};o.forEach(i=>{if(i.hasHorizontalOverflow||i.hiddenButtonsCount>0){const l=g(i.view);d[i.view]||(d[i.view]={layout:0,func:0,meta:l}),d[i.view].layout++}}),n.forEach(i=>{if(i.noResponse>0||i.errors>0){const l=g(i.view);d[i.view]||(d[i.view]={layout:0,func:0,meta:l}),d[i.view].func++}});const p=Object.entries(d).sort((i,l)=>l[1].layout+l[1].func-(i[1].layout+i[1].func)).slice(0,8);return`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-bottom:14px">
      <div style="background:linear-gradient(135deg,rgba(255,91,91,0.08),rgba(255,91,91,0.02));border:1px solid rgba(255,91,91,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#ff5b5b;margin-bottom:6px">📈 Overflow horizontal (30 derniers)</div>
        ${m(t,"#ff5b5b",240,40)}
        <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:6px">Total : ${t.filter(i=>i===1).length}/30</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(255,170,102,0.08),rgba(255,170,102,0.02));border:1px solid rgba(255,170,102,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#ffaa66;margin-bottom:6px">📈 Boutons cachés (30 derniers)</div>
        ${m(r,"#ffaa66",240,40)}
        <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:6px">Max : ${Math.max(0,...r)}</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(34,204,119,0.08),rgba(34,204,119,0.02));border:1px solid rgba(34,204,119,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#22cc77;margin-bottom:6px">📈 OK rate fonctionnel (30 derniers)</div>
        ${m(s,"#22cc77",240,40)}
        <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:6px">Moyenne : ${s.length?Math.round(s.reduce((i,l)=>i+l,0)/s.length*100):0}%</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(106,138,255,0.08),rgba(106,138,255,0.02));border:1px solid rgba(106,138,255,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#8bb4ff;margin-bottom:6px">📈 Erreurs (30 derniers)</div>
        ${m(a,"#8bb4ff",240,40)}
        <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:6px">Total : ${a.reduce((i,l)=>i+l,0)}</div>
      </div>
    </div>

    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:14px">
      <div style="font-weight:700;color:#c9a227;margin-bottom:10px">🏆 Top vues problématiques</div>
      ${p.length===0?'<div style="color:rgba(255,255,255,0.5);font-size:12px">Aucune vue avec issues récurrentes. 🎉</div>':p.map(([i,l])=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px">
              <span style="color:${l.meta.color};font-weight:600">${l.meta.emoji} ${w(i)}</span>
              <span style="color:rgba(255,255,255,0.65)">📐 ${l.layout} · 🧪 ${l.func} · <b style="color:#ff5b5b">Σ ${l.layout+l.func}</b></span>
            </div>
          `).join("")}
    </div>
  `}let f="overview";function y(o){if(!(F.get("isAdmin")===!0)){o.innerHTML='<div style="padding:24px;text-align:center;color:#94a3b8">🔒 Réservé admin Kevin</div>';return}const e=v.getLayoutHistory().slice(),c=v.getFunctionalHistory().slice(),t=f==="overview"?R(e,c):f==="by-view"?B(e,c):f==="by-severity"?_(e,c):f==="timeline"?M(e,c):D(e,c);o.innerHTML=`
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
        <div style="display:flex;gap:6px">
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
  `,o.querySelectorAll(".ax-audits-tab").forEach(r=>{r.addEventListener("click",()=>{const s=r.getAttribute("data-tab");s&&(f=s,y(o))})}),o.querySelector("#ax-audits-run-functional")?.addEventListener("click",()=>{(async()=>{const r=o.querySelector("#ax-audits-run-functional");r&&(r.disabled=!0);try{const{apexFunctionalTester:s}=await S(async()=>{const{apexFunctionalTester:d}=await import("./apex-functional-tester-CLEMZmTo.js");return{apexFunctionalTester:d}},__vite__mapDeps([0,1,2]),import.meta.url),a=await s.testAndAutoFix({maxButtons:30});v.recordFunctional(a.before,a.fixes,a.after,a.improvement),y(o)}catch{}r&&(r.disabled=!1)})()}),o.querySelector("#ax-audits-run-layout")?.addEventListener("click",()=>{(async()=>{try{const{apexLayoutInspector:r}=await S(async()=>{const{apexLayoutInspector:a}=await import("./apex-layout-inspector-DQwMXg0R.js");return{apexLayoutInspector:a}},__vite__mapDeps([0,1,2]),import.meta.url),s=r.scanDom();v.recordLayout(s),y(o)}catch{}})()}),o.querySelector("#ax-audits-clear")?.addEventListener("click",()=>{confirm("Vider tout l'historique des audits ?")&&(v.clearHistory(),y(o))})}export{y as render};
