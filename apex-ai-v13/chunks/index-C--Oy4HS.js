const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-D3OZMspj.js","./monitoring-3uBGKGRH.js","./credential-patterns-CLzI061R.js"])))=>i.map(i=>d[i]);
import{_ as S}from"./apex-kb-D3OZMspj.js";import{s as F}from"../core/main-D6LPyU12.js";import{reportsHistory as v}from"./apex-reports-history-Cv_X_jWe.js";import"./monitoring-3uBGKGRH.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-IO1VLhJg.js";const u={chat:{category:"chat",label:"Chat",emoji:"💬",color:"#22cc77",accent:"rgba(34,204,119,0.15)"},admin:{category:"admin",label:"Admin",emoji:"⚙️",color:"#c9a227",accent:"rgba(201,162,39,0.15)"},settings:{category:"settings",label:"Réglages",emoji:"🔧",color:"#8bb4ff",accent:"rgba(139,180,255,0.15)"},vault:{category:"vault",label:"Coffre",emoji:"🔐",color:"#e8b830",accent:"rgba(232,184,48,0.15)"},studio:{category:"studio",label:"Studio",emoji:"🎨",color:"#c97aff",accent:"rgba(201,122,255,0.15)"},memory:{category:"memory",label:"Mémoire",emoji:"🧠",color:"#f78322",accent:"rgba(247,131,34,0.15)"},other:{category:"other",label:"Autre",emoji:"📦",color:"#94a3b8",accent:"rgba(148,163,184,0.15)"}},T={critical:{label:"Critique",color:"#ff5b5b",emoji:"❌",bg:"rgba(255,91,91,0.10)"},warning:{label:"Warning",color:"#ffaa66",emoji:"⚠️",bg:"rgba(255,170,102,0.10)"},ok:{label:"OK",color:"#22cc77",emoji:"✅",bg:"rgba(34,204,119,0.10)"}};function g(e){const r=e.toLowerCase();return r.includes("chat")?u.chat:r.includes("admin")||r.includes("runtime-test")||r.includes("apex-audits")||r.includes("all-secrets")||r.includes("credentials")||r.includes("rgpd")||r.includes("health")?u.admin:r.includes("setting")||r.includes("config")||r.includes("reglage")?u.settings:r.includes("vault")||r.includes("coffre")?u.vault:r.includes("studio")||r.includes("image")||r.includes("video")||r.includes("music")?u.studio:r.includes("memor")||r.includes("memoire")||r.includes("kb")||r.includes("know")?u.memory:u.other}function z(e){return e.hasHorizontalOverflow&&e.hiddenButtonsCount>0?"critical":e.hasHorizontalOverflow||e.hiddenButtonsCount>0?"warning":"ok"}function h(e){return e.okRate<.5||e.errors>3||e.escalated?"critical":e.okRate<.8||e.noResponse>0||e.errors>0?"warning":"ok"}function w(e){return e.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r]??r)}function k(e){return new Date(e).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}function L(e){const r=new Date(e);return`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,"0")}-${String(r.getDate()).padStart(2,"0")}`}function A(e){return new Date(e).toLocaleDateString("fr-FR",{weekday:"short",day:"2-digit",month:"short"})}function x(e,r,i=80,c=24){if(e.length===0)return"";const t=Math.max(...e,1),n=e.map((s,a)=>{const d=a/Math.max(1,e.length-1)*i,p=c-s/t*c;return`${d.toFixed(1)},${p.toFixed(1)}`}).join(" ");return`<svg width="${i}" height="${c}" viewBox="0 0 ${i} ${c}" style="display:inline-block;vertical-align:middle">
    <polyline points="${n}" fill="none" stroke="${r}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`}function E(e){return`
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
          min-height:36px;
          -webkit-tap-highlight-color:transparent;
          transition:all 180ms cubic-bezier(0.16,1,0.3,1);
        ">${i.label}</button>
      `).join("")}
    </nav>
  `}function R(e,r){const i=v.getStats(),c=e.slice(-14).map(o=>(o.hasHorizontalOverflow?1:0)+o.hiddenButtonsCount),t=r.slice(-14).map(o=>o.noResponse+o.errors),n=i.lastLayoutTs?k(i.lastLayoutTs):"jamais",s=i.lastFunctionalTs?k(i.lastFunctionalTs):"jamais",a={critical:0,warning:0,ok:0};e.forEach(o=>a[z(o)]++);const d={critical:0,warning:0,ok:0};r.forEach(o=>d[h(o)]++);const p=(o,l)=>{if(l===0)return'<div style="color:rgba(255,255,255,0.4);font-size:11px">Pas encore de données</div>';const $=o.critical/l*100,m=o.warning/l*100;return`
      <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;background:rgba(255,255,255,0.04);margin-top:6px">
        <div style="width:${o.ok/l*100}%;background:#22cc77" title="OK : ${o.ok}"></div>
        <div style="width:${m}%;background:#ffaa66" title="Warning : ${o.warning}"></div>
        <div style="width:${$}%;background:#ff5b5b" title="Critical : ${o.critical}"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:rgba(255,255,255,0.6)">
        <span>✅ ${o.ok}</span><span>⚠️ ${o.warning}</span><span>❌ ${o.critical}</span>
      </div>
    `};return`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">
      <div style="background:linear-gradient(135deg,rgba(180,90,200,0.10),rgba(180,90,200,0.04));border:1px solid rgba(180,90,200,0.25);border-radius:14px;padding:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-weight:700;color:#c97aff">📐 Layout</span>
          ${x(c,"#c97aff")}
        </div>
        <div style="font-size:24px;font-weight:800;color:#fff">${i.layoutCount}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.5)">scans · dernier ${n}</div>
        ${p(a,e.length)}
      </div>

      <div style="background:linear-gradient(135deg,rgba(106,138,255,0.10),rgba(106,138,255,0.04));border:1px solid rgba(106,138,255,0.25);border-radius:14px;padding:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-weight:700;color:#8bb4ff">🧪 Fonctionnel</span>
          ${x(t,"#8bb4ff")}
        </div>
        <div style="font-size:24px;font-weight:800;color:#fff">${i.functionalCount}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.5)">tests · dernier ${s}</div>
        ${p(d,r.length)}
      </div>

      <div style="background:linear-gradient(135deg,rgba(255,91,91,0.10),rgba(255,91,91,0.04));border:1px solid rgba(255,91,91,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#ff5b5b;margin-bottom:8px">🐛 Bugs 24h</div>
        <div style="font-size:32px;font-weight:800;color:${i.recentBugs>0?"#ff5b5b":"#22cc77"}">${i.recentBugs}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px">détectés sur 24 dernières heures</div>
      </div>

      <div style="background:linear-gradient(135deg,rgba(255,170,102,0.10),rgba(255,170,102,0.04));border:1px solid rgba(255,170,102,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#ffaa66;margin-bottom:8px">📤 Escaladés Claude Code 24h</div>
        <div style="font-size:32px;font-weight:800;color:${i.recentEscalations>0?"#ffaa66":"#22cc77"}">${i.recentEscalations}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px">via ax_claude_todo Firebase</div>
      </div>
    </div>
  `}function B(e,r){const i={chat:{layouts:[],funcs:[],views:new Set},admin:{layouts:[],funcs:[],views:new Set},settings:{layouts:[],funcs:[],views:new Set},vault:{layouts:[],funcs:[],views:new Set},studio:{layouts:[],funcs:[],views:new Set},memory:{layouts:[],funcs:[],views:new Set},other:{layouts:[],funcs:[],views:new Set}};return e.forEach(t=>{const n=g(t.view).category;i[n].layouts.push(t),i[n].views.add(t.view)}),r.forEach(t=>{const n=g(t.view).category;i[n].funcs.push(t),i[n].views.add(t.view)}),["chat","admin","settings","vault","studio","memory","other"].filter(t=>i[t].layouts.length+i[t].funcs.length>0).map((t,n)=>{const s=u[t],a=i[t],d=a.layouts.length,p=a.funcs.length,o=a.layouts.filter(b=>b.hasHorizontalOverflow).length,l=a.layouts.reduce((b,C)=>b+C.hiddenButtonsCount,0),$=a.funcs.filter(b=>h(b)==="ok").length,m=p>0?Math.round($/p*100):0,j=Array.from(a.views).slice(0,3).map(b=>w(b)).join(", "),O=a.views.size>3?` +${a.views.size-3}`:"";return`
        <div class="ax-audits-card" style="background:linear-gradient(135deg,${s.accent},rgba(255,255,255,0.02));border:1px solid ${s.color}33;border-radius:14px;padding:14px;margin-bottom:10px;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${n*60}ms backwards">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">
            <div style="font-weight:700;color:${s.color};font-size:15px">${s.emoji} ${s.label}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);font-family:monospace">${j}${O}</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;font-size:12px;color:rgba(255,255,255,0.85)">
            <div>📐 Layout scans : <b>${d}</b></div>
            <div>🧪 Tests : <b>${p}</b></div>
            <div>⚠ Overflow : <b style="color:${o?"#ff5b5b":"#22cc77"}">${o}</b></div>
            <div>🚫 Boutons cachés : <b style="color:${l?"#ffaa66":"#22cc77"}">${l}</b></div>
            <div>✅ OK fonctionnel : <b style="color:${m>=80?"#22cc77":m>=50?"#ffaa66":"#ff5b5b"}">${m}%</b></div>
          </div>
        </div>
      `}).join("")||'<div style="color:rgba(255,255,255,0.5);font-size:12px;padding:24px;text-align:center">Aucune vue auditée encore.</div>'}function _(e,r){const i={critical:[],warning:[],ok:[]};return e.forEach(t=>{const n=z(t),s=g(t.view);i[n].push({type:"Layout",view:`${s.emoji} ${t.view}`,ts:t.ts,summary:`overflow:${t.hasHorizontalOverflow?"OUI":"NON"} · cachés:${t.hiddenButtonsCount} · touch<44:${t.smallTouchTargetsCount}`,color:s.color})}),r.forEach(t=>{const n=h(t),s=g(t.view);i[n].push({type:"Fonctionnel",view:`${s.emoji} ${t.view}`,ts:t.ts,summary:`${t.ok}/${t.tested} OK (${Math.round(t.okRate*100)}%) · no-resp:${t.noResponse} · err:${t.errors}${t.escalated?" · ⚠ escaladé":""}`,color:s.color})}),["critical","warning","ok"].map((t,n)=>{const s=i[t].sort((d,p)=>p.ts-d.ts).slice(0,15);if(s.length===0)return"";const a=T[t];return`
      <div style="background:${a.bg};border:1px solid ${a.color}55;border-radius:14px;padding:14px;margin-bottom:12px;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${n*80}ms backwards">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div style="font-weight:700;color:${a.color};font-size:15px">${a.emoji} ${a.label}</div>
          <div style="background:${a.color};color:#08080f;padding:2px 10px;border-radius:12px;font-weight:700;font-size:12px">${i[t].length}</div>
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
    `}).join("")||'<div style="color:rgba(255,255,255,0.5);font-size:12px;padding:24px;text-align:center">Aucun audit historisé.</div>'}function M(e,r){const i={};e.forEach(t=>{const n=L(t.ts);i[n]||(i[n]={ts:t.ts,events:[]});const s=g(t.view);i[n].events.push({type:"Layout",emoji:s.emoji,color:s.color,view:t.view,summary:`overflow:${t.hasHorizontalOverflow?"OUI":"NON"} · cachés:${t.hiddenButtonsCount}`,sev:z(t),ts:t.ts})}),r.forEach(t=>{const n=L(t.ts);i[n]||(i[n]={ts:t.ts,events:[]});const s=g(t.view);i[n].events.push({type:"Fonctionnel",emoji:s.emoji,color:s.color,view:t.view,summary:`${t.ok}/${t.tested} OK (${Math.round(t.okRate*100)}%)`,sev:h(t),ts:t.ts})});const c=Object.entries(i).sort((t,n)=>n[1].ts-t[1].ts);return c.length===0?`<div style="color:rgba(255,255,255,0.5);font-size:12px;padding:24px;text-align:center">Pas encore d'événement.</div>`:c.map(([t,n],s)=>`
    <div style="margin-bottom:14px;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) ${s*60}ms backwards">
      <div style="font-weight:700;color:#c9a227;font-size:13px;margin-bottom:8px;letter-spacing:0.04em">
        ${A(n.ts)} <span style="color:rgba(255,255,255,0.4);font-weight:500;font-size:11px">· ${w(t)} · ${n.events.length} événement(s)</span>
      </div>
      ${n.events.sort((a,d)=>d.ts-a.ts).map(a=>{const d=T[a.sev];return`
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
  `).join("")}function D(e,r){const i=e.slice(-30),c=r.slice(-30),t=i.map(o=>o.hasHorizontalOverflow?1:0),n=i.map(o=>o.hiddenButtonsCount),s=c.map(o=>o.okRate),a=c.map(o=>o.errors),d={};e.forEach(o=>{if(o.hasHorizontalOverflow||o.hiddenButtonsCount>0){const l=g(o.view);d[o.view]||(d[o.view]={layout:0,func:0,meta:l}),d[o.view].layout++}}),r.forEach(o=>{if(o.noResponse>0||o.errors>0){const l=g(o.view);d[o.view]||(d[o.view]={layout:0,func:0,meta:l}),d[o.view].func++}});const p=Object.entries(d).sort((o,l)=>l[1].layout+l[1].func-(o[1].layout+o[1].func)).slice(0,8);return`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-bottom:14px">
      <div style="background:linear-gradient(135deg,rgba(255,91,91,0.08),rgba(255,91,91,0.02));border:1px solid rgba(255,91,91,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#ff5b5b;margin-bottom:6px">📈 Overflow horizontal (30 derniers)</div>
        ${x(t,"#ff5b5b",240,40)}
        <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:6px">Total : ${t.filter(o=>o===1).length}/30</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(255,170,102,0.08),rgba(255,170,102,0.02));border:1px solid rgba(255,170,102,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#ffaa66;margin-bottom:6px">📈 Boutons cachés (30 derniers)</div>
        ${x(n,"#ffaa66",240,40)}
        <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:6px">Max : ${Math.max(0,...n)}</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(34,204,119,0.08),rgba(34,204,119,0.02));border:1px solid rgba(34,204,119,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#22cc77;margin-bottom:6px">📈 OK rate fonctionnel (30 derniers)</div>
        ${x(s,"#22cc77",240,40)}
        <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:6px">Moyenne : ${s.length?Math.round(s.reduce((o,l)=>o+l,0)/s.length*100):0}%</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(106,138,255,0.08),rgba(106,138,255,0.02));border:1px solid rgba(106,138,255,0.25);border-radius:14px;padding:14px">
        <div style="font-weight:700;color:#8bb4ff;margin-bottom:6px">📈 Erreurs (30 derniers)</div>
        ${x(a,"#8bb4ff",240,40)}
        <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:6px">Total : ${a.reduce((o,l)=>o+l,0)}</div>
      </div>
    </div>

    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:14px">
      <div style="font-weight:700;color:#c9a227;margin-bottom:10px">🏆 Top vues problématiques</div>
      ${p.length===0?'<div style="color:rgba(255,255,255,0.5);font-size:12px">Aucune vue avec issues récurrentes. 🎉</div>':p.map(([o,l])=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px">
              <span style="color:${l.meta.color};font-weight:600">${l.meta.emoji} ${w(o)}</span>
              <span style="color:rgba(255,255,255,0.65)">📐 ${l.layout} · 🧪 ${l.func} · <b style="color:#ff5b5b">Σ ${l.layout+l.func}</b></span>
            </div>
          `).join("")}
    </div>
  `}let f="overview";function y(e){if(!(F.get("isAdmin")===!0)){e.innerHTML='<div style="padding:24px;text-align:center;color:#94a3b8">🔒 Réservé admin Kevin</div>';return}const i=v.getLayoutHistory().slice(),c=v.getFunctionalHistory().slice(),t=f==="overview"?R(i,c):f==="by-view"?B(i,c):f==="by-severity"?_(i,c):f==="timeline"?M(i,c):D(i,c);e.innerHTML=`
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
  `,e.querySelectorAll(".ax-audits-tab").forEach(n=>{n.addEventListener("click",()=>{const s=n.getAttribute("data-tab");s&&(f=s,y(e))})}),e.querySelector("#ax-audits-run-functional")?.addEventListener("click",()=>{(async()=>{const n=e.querySelector("#ax-audits-run-functional");n&&(n.disabled=!0);try{const{apexFunctionalTester:s}=await S(async()=>{const{apexFunctionalTester:d}=await import("./apex-functional-tester-_UJKlMCD.js");return{apexFunctionalTester:d}},__vite__mapDeps([0,1,2]),import.meta.url),a=await s.testAndAutoFix({maxButtons:30});v.recordFunctional(a.before,a.fixes,a.after,a.improvement),y(e)}catch{}n&&(n.disabled=!1)})()}),e.querySelector("#ax-audits-run-layout")?.addEventListener("click",()=>{(async()=>{try{const{apexLayoutInspector:n}=await S(async()=>{const{apexLayoutInspector:a}=await import("./apex-layout-inspector-CacZLE_6.js");return{apexLayoutInspector:a}},__vite__mapDeps([0,1,2]),import.meta.url),s=n.scanDom();v.recordLayout(s),y(e)}catch{}})()}),e.querySelector("#ax-audits-clear")?.addEventListener("click",()=>{confirm("Vider tout l'historique des audits ?")&&(v.clearHistory(),y(e))})}export{y as render};
