const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-self-audit-tDyqUSIh.js","../core/main-CoftA83U.js","../assets/css/main-rhfGvOFL.css","./audit-log-wCr2ONnW.js","./soc2-compliance-DpexQi2b.js","./vault-BLCAggRK.js","./credential-patterns-BybElwOv.js","./sentinels-DzbR7ldU.js","./observability-B22w3nVm.js"])))=>i.map(i=>d[i]);
import{_ as u,l as g}from"../core/main-CoftA83U.js";import{h as c}from"./haptic-BUEqXK0N.js";import{toast as p}from"./toast-Dgg9rcIP.js";function n(e){return e.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r]??r)}const b={security:{icon:"🔒",label:"Sécurité"},performance:{icon:"⚡",label:"Performance"},ux:{icon:"🎨",label:"UX"},tests:{icon:"🧪",label:"Tests"},architecture:{icon:"🏗",label:"Architecture"},ai_safety:{icon:"🤖",label:"AI Safety"}},x={p0_critical:{color:"#ff5858",icon:"🚨",label:"P0 Critical"},p1_high:{color:"#ff8c42",icon:"⚠️",label:"P1 High"},p2_medium:{color:"#ffaa00",icon:"🟡",label:"P2 Medium"},p3_low:{color:"#5aa8ff",icon:"ℹ️",label:"P3 Low"},info:{color:"#888",icon:"💡",label:"Info"}};function h(e){return e>=90?"#22cc77":e>=75?"#a0c878":e>=60?"#ffaa00":e>=40?"#ff8c42":"#ff5858"}function $(e){return e>=95?"A+":e>=85?"A":e>=70?"B":e>=55?"C":e>=40?"D":"F"}function _(e,r){const t={p0_critical:5,p1_high:4,p2_medium:3,p3_low:2,info:1},o=t[r];return e.filter(a=>t[a.severity]>=o)}function w(){try{const e=localStorage.getItem("ax_lessons_learned_struct")??"[]",r=JSON.parse(e);return Array.isArray(r)?r.filter(t=>{if(t===null||typeof t!="object")return!1;const o=t;return typeof o.id=="string"&&typeof o.title=="string"&&typeof o.ts=="number"}):[]}catch{return[]}}let s=null,l=!1,f="p2_medium";function z(e){const r=h(e.total_score),t=$(e.total_score);return`
    <div class="ax-score-card" style="background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:20px;margin-bottom:16px;border-left:4px solid ${r}">
      <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
        <div style="flex-shrink:0">
          <div style="font-size:64px;font-weight:900;color:${r};line-height:1;font-family:Georgia,serif">${e.total_score}</div>
          <div style="font-size:12px;color:#a0a4c0;margin-top:4px">/ 100</div>
        </div>
        <div style="flex:1;min-width:200px">
          <div style="font-size:24px;font-weight:700;color:${r}">Note ${n(t)}</div>
          <div style="font-size:12px;color:#a0a4c0;margin-top:2px">${n(new Date(e.ts).toLocaleString("fr-FR"))}</div>
          <div style="font-size:11px;color:#888;margin-top:4px">Durée audit : ${e.duration_ms}ms</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <div style="background:rgba(34,204,119,.1);padding:8px 12px;border-radius:8px;text-align:center">
            <div style="font-size:18px;font-weight:700;color:#22cc77">${e.auto_fixed_count}</div>
            <div style="font-size:10px;color:#a0a4c0">Auto-fixed</div>
          </div>
          <div style="background:rgba(168,120,255,.1);padding:8px 12px;border-radius:8px;text-align:center">
            <div style="font-size:18px;font-weight:700;color:#a878ff">${e.escalated_count}</div>
            <div style="font-size:10px;color:#a0a4c0">Escaladés</div>
          </div>
          <div style="background:rgba(255,88,88,.1);padding:8px 12px;border-radius:8px;text-align:center">
            <div style="font-size:18px;font-weight:700;color:#ff5858">${e.total_findings}</div>
            <div style="font-size:10px;color:#a0a4c0">Findings</div>
          </div>
        </div>
      </div>
    </div>`}function A(e){return`
    <section style="margin-bottom:16px">
      <h3 style="margin:0 0 10px;color:#c9a227;font-size:13px;text-transform:uppercase">📊 Scores par axe (/20)</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px">
        ${Object.keys(b).map(r=>{const t=e.axes[r],o=b[r],a=t.score>=18?"#22cc77":t.score>=14?"#a0c878":t.score>=10?"#ffaa00":"#ff5858";return`
            <div style="background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:12px;text-align:center;border-left:3px solid ${a}">
              <div style="font-size:24px;margin-bottom:4px">${n(o.icon)}</div>
              <div style="font-size:18px;font-weight:900;color:${a}">${t.score}/20</div>
              <div style="font-size:11px;color:#a0a4c0;margin-top:2px">${n(o.label)}</div>
              <div style="font-size:10px;color:#888;margin-top:2px">${t.findings_count} finding${t.findings_count>1?"s":""}</div>
            </div>`}).join("")}
      </div>
    </section>`}function k(e){const r=_(e,f);return r.length===0?'<p style="color:#a0a4c0;font-size:12px;padding:20px;text-align:center">Aucun finding pour ce filtre.</p>':r.slice(0,50).map(t=>{const o=x[t.severity],a=t.auto_fix_success?"✅ Auto-fixed":t.escalated_to_claude?"📤 Escaladé Claude":"🚨 À traiter";return`
        <div style="background:rgba(20,20,35,0.5);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:12px;margin-bottom:6px;border-left:3px solid ${o.color}">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
            <span style="background:rgba(${t.severity==="p0_critical"?"255,88,88":t.severity==="p1_high"?"255,140,66":"255,170,0"},.15);color:${o.color};font-size:10px;padding:2px 6px;border-radius:4px;font-weight:700">${o.icon} ${n(o.label)}</span>
            <span style="background:rgba(168,120,255,.1);color:#a878ff;font-size:10px;padding:2px 6px;border-radius:4px">${n(t.axis)}</span>
            <span style="font-size:10px;color:#888;margin-left:auto">${n(a)}</span>
          </div>
          <strong style="color:#fff;font-size:13px;display:block">${n(t.title)}</strong>
          <p style="margin:4px 0 0;color:#a0a4c0;font-size:11px;line-height:1.4">${n(t.description)}</p>
          ${t.fix_action?`<p style="margin:4px 0 0;color:#22cc77;font-size:11px"><strong>Fix :</strong> ${n(t.fix_action)}</p>`:""}
        </div>`}).join("")}function S(e){return e.length===0?'<p style="color:#a0a4c0;font-size:12px">Aucune lesson learned pour le moment.</p>':[...e].sort((t,o)=>o.ts-t.ts).slice(0,50).map(t=>{const o=t.severity==="critical"?"#ff5858":t.severity==="warn"?"#ffaa00":"#5aa8ff",a=new Date(t.ts).toLocaleString("fr-FR");return`
        <div style="padding:8px 10px;background:rgba(20,20,35,0.5);border-radius:8px;margin-bottom:4px;border-left:3px solid ${o}">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;flex-wrap:wrap">
            <strong style="color:#fff;font-size:12px">${n(t.title)}</strong>
            <span style="background:rgba(168,120,255,.1);color:#a878ff;font-size:10px;padding:1px 5px;border-radius:4px">${n(t.category)}</span>
            ${t.resolved?'<span style="color:#22cc77;font-size:10px">✅ Résolu</span>':""}
            <span style="font-size:10px;color:#888;margin-left:auto">${n(a)}</span>
          </div>
          <p style="margin:2px 0 0;color:#a0a4c0;font-size:11px;line-height:1.4">${n(t.text.slice(0,200))}${t.text.length>200?"...":""}</p>
        </div>`}).join("")}async function y(e){if(!s)try{const{apexSelfAudit:i}=await u(async()=>{const{apexSelfAudit:m}=await import("./apex-self-audit-tDyqUSIh.js");return{apexSelfAudit:m}},__vite__mapDeps([0,1,2,3,4,5,6]),import.meta.url);s=i.getLastReport()}catch(i){g.warn("feature-self-diag","load last report failed",{err:i})}const r=w();let t=[];try{const{sentinels:i}=await u(async()=>{const{sentinels:m}=await import("./sentinels-DzbR7ldU.js");return{sentinels:m}},__vite__mapDeps([7,1,2,8]),import.meta.url);t=i.list()}catch{}const o=t.filter(i=>i.lastResult?.ok).length,a=t.filter(i=>i.lastResult&&!i.lastResult.ok).length,d=t.filter(i=>!i.lastResult).length;e.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:1100px;margin:0 auto">
      <header style="margin-bottom:20px">
        <h1 style="margin:0 0 4px;color:#c9a227;font-size:28px">🩺 Auto-diagnostic Apex</h1>
        <p style="color:#a0a4c0;margin:0;font-size:13px">
          Apex se teste lui-même : sécurité, perf, UX, tests, architecture, AI safety. Audit subagent indépendant.
        </p>
      </header>

      <section style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap">
        <button id="ax-diag-run" class="ax-btn ax-btn-primary" ${l?"disabled":""}
          style="font-size:14px;padding:10px 18px;background:linear-gradient(135deg,#c9a227,#ffd700);color:#000;border:none;border-radius:10px;cursor:${l?"not-allowed":"pointer"};font-weight:700">
          ${l?"⏳ Audit en cours...":"🔍 Lancer audit complet"}
        </button>
        <button id="ax-diag-brutal" class="ax-btn ax-btn-sm" ${l?"disabled":""}
          style="font-size:13px;padding:8px 14px;background:rgba(255,88,88,.15);color:#ff5858;border:1px solid rgba(255,88,88,.3);border-radius:10px;cursor:${l?"not-allowed":"pointer"}">
          🔥 Audit brutal (no mercy)
        </button>
        ${s?`
          <button id="ax-diag-export" class="ax-btn ax-btn-sm" style="font-size:13px;padding:8px 14px">📥 Export Markdown</button>
        `:""}
      </section>

      ${s?`
        ${z(s)}
        ${A(s)}

        <section style="margin-bottom:24px">
          <h3 style="margin:0 0 10px;color:#c9a227;font-size:13px;text-transform:uppercase">⚠ Findings (${s.findings.length})</h3>
          <div style="margin-bottom:8px;display:flex;gap:6px;flex-wrap:wrap">
            ${["p0_critical","p1_high","p2_medium","p3_low","info"].map(i=>`
              <button class="ax-diag-sev-btn ${f===i?"ax-tab-active":""}"
                data-diag-sev="${i}"
                style="background:${f===i?`rgba(${i==="p0_critical"?"255,88,88":"201,162,39"},.15)`:"transparent"};color:${f===i?x[i].color:"#a0a4c0"};border:1px solid rgba(201,162,39,.3);padding:5px 10px;border-radius:8px;font-size:11px;cursor:pointer">
                ${x[i].icon} ${x[i].label}
              </button>
            `).join("")}
          </div>
          ${k(s.findings)}
        </section>

        <section style="margin-bottom:24px">
          <h3 style="margin:0 0 10px;color:#c9a227;font-size:13px;text-transform:uppercase">📋 Prochaines étapes</h3>
          <ul style="list-style:disc;padding-left:24px;color:#a0a4c0;font-size:12px;line-height:1.6">
            ${s.next_steps.map(i=>`<li>${n(i)}</li>`).join("")}
          </ul>
        </section>
      `:`
        <div style="background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:30px;text-align:center;margin-bottom:16px">
          <p style="color:#a0a4c0;font-size:13px;margin:0 0 12px">Pas encore de diagnostic effectué.</p>
          <p style="color:#888;font-size:11px;margin:0">Clique sur "🔍 Lancer audit complet" pour démarrer.</p>
        </div>
      `}

      <section style="margin-bottom:24px">
        <h3 style="margin:0 0 10px;color:#c9a227;font-size:13px;text-transform:uppercase">🛡 Sentinelles 24/7</h3>
        <div style="background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:14px">
          <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;font-size:13px">
            <span><strong style="color:#22cc77">${o}</strong> OK</span>
            <span><strong style="color:#ffaa00">${a}</strong> WARN</span>
            <span><strong style="color:#888">${d}</strong> PENDING</span>
            <a href="#sentinels" style="color:#c9a227;font-size:11px;margin-left:auto">→ Voir détail</a>
          </div>
        </div>
      </section>

      <section style="margin-bottom:24px">
        <h3 style="margin:0 0 10px;color:#c9a227;font-size:13px;text-transform:uppercase">📚 Lessons learned (${r.length})</h3>
        ${S(r)}
      </section>

      <p style="text-align:center;color:#666;font-size:11px">🩺 Self-Diag v13 · 6 axes · Pondération 25/20/15/15/15/10</p>
    </div>
  `,L(e),g.info("feature-self-diag",`rendered (report=${s?"yes":"no"}, lessons=${r.length}, sentinels=${t.length})`)}function L(e){e.querySelector("#ax-diag-run")?.addEventListener("click",()=>{v(e,!1)}),e.querySelector("#ax-diag-brutal")?.addEventListener("click",()=>{v(e,!0)}),e.querySelector("#ax-diag-export")?.addEventListener("click",()=>{(async()=>{if(c.tap(),!!s)try{const{apexSelfAudit:r}=await u(async()=>{const{apexSelfAudit:i}=await import("./apex-self-audit-tDyqUSIh.js");return{apexSelfAudit:i}},__vite__mapDeps([0,1,2,3,4,5,6]),import.meta.url),t=r.formatReportMarkdown(s),o=new Blob([t],{type:"text/markdown"}),a=URL.createObjectURL(o),d=document.createElement("a");d.href=a,d.download=`apex-audit-${new Date().toISOString().slice(0,10)}.md`,document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(a),p.success("Rapport exporté")}catch(r){g.warn("feature-self-diag","export failed",{err:r}),p.error("Export échoué")}})()}),e.querySelectorAll("[data-diag-sev]").forEach(r=>{r.addEventListener("click",()=>{c.selection(),f=r.dataset.diagSev,y(e)})})}async function v(e,r){if(!l){l=!0,c.medium(),p.info(r?"🔥 Audit brutal en cours...":"🔍 Audit en cours..."),y(e);try{const{apexSelfAudit:t}=await u(async()=>{const{apexSelfAudit:a}=await import("./apex-self-audit-tDyqUSIh.js");return{apexSelfAudit:a}},__vite__mapDeps([0,1,2,3,4,5,6]),import.meta.url),o=await t.runFullAudit(r);s=o,c.success(),p.success(`✅ Audit terminé : ${o.total_score}/100`)}catch(t){g.warn("feature-self-diag","audit failed",{err:t}),c.error(),p.error("Audit échoué")}finally{l=!1,y(e)}}}export{n as escapeHtml,_ as filterFindingsBySeverity,w as loadLessons,y as render,h as scoreColor,$ as scoreGrade};
//# sourceMappingURL=index-C97nktVJ.js.map
