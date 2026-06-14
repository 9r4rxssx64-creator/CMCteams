const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-IoSNM-AS.js","./multi-source-analyze-6nAEVWS4.js","./credential-patterns-DUMYZEMu.js","./apex-kb-C1uVUOol.js","../assets/css/main-DypJgvjZ.css"])))=>i.map(i=>d[i]);
import{_ as m,l as y,e as n}from"./monitoring-IoSNM-AS.js";import{c as w}from"./listener-cleanup-Y2rGGxxX.js";import{haptic as g}from"./haptic-CQFg2PXZ.js";import{toast as x}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-6nAEVWS4.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-C1uVUOol.js";let d=null;function U(){d?.cleanup(),d=null}const h={security:{icon:"🔒",label:"Sécurité"},performance:{icon:"⚡",label:"Performance"},ux:{icon:"🎨",label:"UX"},tests:{icon:"🧪",label:"Tests"},architecture:{icon:"🏗",label:"Architecture"},ai_safety:{icon:"🤖",label:"AI Safety"}},b={p0_critical:{color:"#ff5858",icon:"🚨",label:"P0 Critical"},p1_high:{color:"#ff8c42",icon:"⚠️",label:"P1 High"},p2_medium:{color:"#ffaa00",icon:"🟡",label:"P2 Medium"},p3_low:{color:"#5aa8ff",icon:"ℹ️",label:"P3 Low"},info:{color:"#888",icon:"💡",label:"Info"}};function k(e){return e>=90?"#22cc77":e>=75?"#a0c878":e>=60?"#ffaa00":e>=40?"#ff8c42":"#ff5858"}function z(e){return e>=95?"A+":e>=85?"A":e>=70?"B":e>=55?"C":e>=40?"D":"F"}function S(e,i){const t={p0_critical:5,p1_high:4,p2_medium:3,p3_low:2,info:1},a=t[i];return e.filter(s=>t[s.severity]>=a)}function R(){try{const e=localStorage.getItem("ax_lessons_learned_struct")??"[]",i=JSON.parse(e);return Array.isArray(i)?i.filter(t=>{if(t===null||typeof t!="object")return!1;const a=t;return typeof a.id=="string"&&typeof a.title=="string"&&typeof a.ts=="number"}):[]}catch{return[]}}let o=null,c=!1,f="p2_medium";function L(e){const i=k(e.total_score),t=z(e.total_score);return`
    <div class="ax-score-card" style="background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:20px;margin-bottom:16px;border-left:4px solid ${i}">
      <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
        <div style="flex-shrink:0">
          <div style="font-size:64px;font-weight:900;color:${i};line-height:1;font-family:Georgia,serif">${e.total_score}</div>
          <div style="font-size:12px;color:#a0a4c0;margin-top:4px">/ 100</div>
        </div>
        <div class="ax-gs-11">
          <div style="font-size:24px;font-weight:700;color:${i}">Note ${n(t)}</div>
          <div style="font-size:12px;color:#a0a4c0;margin-top:2px">${n(new Date(e.ts).toLocaleString("fr-FR"))}</div>
          <div style="font-size:11px;color:#888;margin-top:4px">Durée audit : ${e.duration_ms}ms</div>
        </div>
        <div class="ax-gs-7">
          <div style="background:rgba(34,204,119,.1);padding:8px 12px;border-radius:8px;text-align:center">
            <div style="font-size:18px;font-weight:700;color:#22cc77">${e.auto_fixed_count}</div>
            <div class="ax-gs-74">Auto-fixed</div>
          </div>
          <div style="background:rgba(168,120,255,.1);padding:8px 12px;border-radius:8px;text-align:center">
            <div style="font-size:18px;font-weight:700;color:#a878ff">${e.escalated_count}</div>
            <div class="ax-gs-74">Escaladés</div>
          </div>
          <div style="background:rgba(255,88,88,.1);padding:8px 12px;border-radius:8px;text-align:center">
            <div style="font-size:18px;font-weight:700;color:#ff5858">${e.total_findings}</div>
            <div class="ax-gs-74">Findings</div>
          </div>
        </div>
      </div>
    </div>`}function P(e){return`
    <section class="ax-gs-217">
      <h3 class="ax-gs-326">📊 Scores par axe (/20)</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px">
        ${Object.keys(h).map(i=>{const t=e.axes[i],a=h[i],s=t.score>=18?"#22cc77":t.score>=14?"#a0c878":t.score>=10?"#ffaa00":"#ff5858";return`
            <div style="background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:12px;text-align:center;border-left:3px solid ${s}">
              <div style="font-size:24px;margin-bottom:4px">${n(a.icon)}</div>
              <div style="font-size:18px;font-weight:900;color:${s}">${t.score}/20</div>
              <div style="font-size:11px;color:#a0a4c0;margin-top:2px">${n(a.label)}</div>
              <div style="font-size:10px;color:#888;margin-top:2px">${t.findings_count} finding${t.findings_count>1?"s":""}</div>
            </div>`}).join("")}
      </div>
    </section>`}function D(e){const i=S(e,f);return i.length===0?'<p style="color:#a0a4c0;font-size:12px;padding:20px;text-align:center">Aucun finding pour ce filtre.</p>':i.slice(0,50).map(t=>{const a=b[t.severity],s=t.auto_fix_success?"✅ Auto-fixed":t.escalated_to_claude?"📤 Escaladé Claude":"🚨 À traiter";return`
        <div style="background:rgba(20,20,35,0.5);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:12px;margin-bottom:6px;border-left:3px solid ${a.color}">
          <div class="ax-gs-122">
            <span style="background:rgba(${t.severity==="p0_critical"?"255,88,88":t.severity==="p1_high"?"255,140,66":"255,170,0"},.15);color:${a.color};font-size:10px;padding:2px 6px;border-radius:4px;font-weight:700">${a.icon} ${n(a.label)}</span>
            <span class="ax-gs-138">${n(t.axis)}</span>
            <span class="ax-gs-163">${n(s)}</span>
          </div>
          <strong style="color:#fff;font-size:13px;display:block">${n(t.title)}</strong>
          <p style="margin:4px 0 0;color:#a0a4c0;font-size:11px;line-height:1.4">${n(t.description)}</p>
          ${t.fix_action?`<p style="margin:4px 0 0;color:#22cc77;font-size:11px"><strong>Fix :</strong> ${n(t.fix_action)}</p>`:""}
        </div>`}).join("")}function E(e){return e.length===0?'<p style="color:#a0a4c0;font-size:12px">Aucune lesson learned pour le moment.</p>':[...e].sort((t,a)=>a.ts-t.ts).slice(0,50).map(t=>{const a=t.severity==="critical"?"#ff5858":t.severity==="warn"?"#ffaa00":"#5aa8ff",s=new Date(t.ts).toLocaleString("fr-FR");return`
        <div style="padding:8px 10px;background:rgba(20,20,35,0.5);border-radius:8px;margin-bottom:4px;border-left:3px solid ${a}">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;flex-wrap:wrap">
            <strong class="ax-gs-395">${n(t.title)}</strong>
            <span style="background:rgba(168,120,255,.1);color:#a878ff;font-size:10px;padding:1px 5px;border-radius:4px">${n(t.category)}</span>
            ${t.resolved?'<span style="color:#22cc77;font-size:10px">✅ Résolu</span>':""}
            <span class="ax-gs-163">${n(s)}</span>
          </div>
          <p class="ax-gs-396">${n(t.text.slice(0,200))}${t.text.length>200?"...":""}</p>
        </div>`}).join("")}async function v(e){if(d?.cleanup(),d=w("self-diag"),!o)try{const{apexSelfAudit:r}=await m(async()=>{const{apexSelfAudit:p}=await import("./apex-self-audit-6t3YfsoF.js");return{apexSelfAudit:p}},__vite__mapDeps([0,1,2,3,4]),import.meta.url);o=r.getLastReport()}catch(r){y.warn("feature-self-diag","load last report failed",{err:r})}const i=R();let t=[];try{const{sentinels:r}=await m(async()=>{const{sentinels:p}=await import("./sentinels-D7XjfhII.js");return{sentinels:p}},__vite__mapDeps([0,1,2,3]),import.meta.url);t=r.list()}catch{}const a=t.filter(r=>r.lastResult?.ok).length,s=t.filter(r=>r.lastResult&&!r.lastResult.ok).length,l=t.filter(r=>!r.lastResult).length;e.innerHTML=`
    <div class="ax-page ax-gs-268">
      <header class="ax-gs-181">
        <h1 class="ax-gs-324">🩺 Auto-diagnostic Apex</h1>
        <p class="ax-gs-325">
          Apex se teste lui-même : sécurité, perf, UX, tests, architecture, AI safety. Audit subagent indépendant.
        </p>
      </header>

      <section style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap">
        <button id="ax-diag-run" class="ax-btn ax-btn-primary" ${c?"disabled":""}
          style="font-size:14px;padding:10px 18px;background:linear-gradient(135deg,#c9a227,#ffd700);color:#000;border:none;border-radius:10px;cursor:${c?"not-allowed":"pointer"};font-weight:700">
          ${c?"⏳ Audit en cours...":"🔍 Lancer audit complet"}
        </button>
        <button id="ax-diag-brutal" class="ax-btn ax-btn-sm" ${c?"disabled":""}
          style="font-size:13px;padding:8px 14px;background:rgba(255,88,88,.15);color:#ff5858;border:1px solid rgba(255,88,88,.3);border-radius:10px;cursor:${c?"not-allowed":"pointer"}">
          🔥 Audit brutal (no mercy)
        </button>
        ${o?`
          <button id="ax-diag-export" class="ax-btn ax-btn-sm" style="font-size:13px;padding:8px 14px">📥 Export Markdown</button>
        `:""}
      </section>

      ${o?`
        ${L(o)}
        ${P(o)}

        <section class="ax-gs-180">
          <h3 class="ax-gs-326">⚠ Findings (${o.findings.length})</h3>
          <div style="margin-bottom:8px;display:flex;gap:6px;flex-wrap:wrap">
            ${["p0_critical","p1_high","p2_medium","p3_low","info"].map(r=>`
              <button class="ax-diag-sev-btn ${f===r?"ax-tab-active":""}"
                data-diag-sev="${r}"
                style="background:${f===r?`rgba(${r==="p0_critical"?"255,88,88":"201,162,39"},.15)`:"transparent"};color:${f===r?b[r].color:"#a0a4c0"};border:1px solid rgba(201,162,39,.3);padding:5px 10px;border-radius:8px;font-size:11px;cursor:pointer">
                ${b[r].icon} ${b[r].label}
              </button>
            `).join("")}
          </div>
          ${D(o.findings)}
        </section>

        <section class="ax-gs-180">
          <h3 class="ax-gs-326">📋 Prochaines étapes</h3>
          <ul style="list-style:disc;padding-left:24px;color:#a0a4c0;font-size:12px;line-height:1.6">
            ${o.next_steps.map(r=>`<li>${n(r)}</li>`).join("")}
          </ul>
        </section>
      `:`
        <div style="background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:30px;text-align:center;margin-bottom:16px">
          <p style="color:#a0a4c0;font-size:13px;margin:0 0 12px">Pas encore de diagnostic effectué.</p>
          <p style="color:#888;font-size:11px;margin:0">Clique sur "🔍 Lancer audit complet" pour démarrer.</p>
        </div>
      `}

      <section class="ax-gs-180">
        <h3 class="ax-gs-326">🛡 Sentinelles 24/7</h3>
        <div style="background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:14px">
          <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;font-size:13px">
            <span><strong class="ax-gs-279">${a}</strong> OK</span>
            <span><strong class="ax-gs-328">${s}</strong> WARN</span>
            <span><strong style="color:#888">${l}</strong> PENDING</span>
            <a href="#sentinels" style="color:#c9a227;font-size:11px;margin-left:auto">→ Voir détail</a>
          </div>
        </div>
      </section>

      <section class="ax-gs-180">
        <h3 class="ax-gs-326">📚 Lessons learned (${i.length})</h3>
        ${E(i)}
      </section>

      <p class="ax-gs-331">🩺 Self-Diag v13 · 6 axes · Pondération 25/20/15/15/15/10</p>
    </div>
  `,I(e),y.info("feature-self-diag",`rendered (report=${o?"yes":"no"}, lessons=${i.length}, sentinels=${t.length})`)}function I(e){const i=d??w("self-diag");d||(d=i);const t=e.querySelector("#ax-diag-run");t&&i.bind(t,"click",()=>{_(e,!1)});const a=e.querySelector("#ax-diag-brutal");a&&i.bind(a,"click",()=>{_(e,!0)});const s=e.querySelector("#ax-diag-export");s&&i.bind(s,"click",()=>{(async()=>{if(g.tap(),!!o)try{const{apexSelfAudit:l}=await m(async()=>{const{apexSelfAudit:A}=await import("./apex-self-audit-6t3YfsoF.js");return{apexSelfAudit:A}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),r=l.formatReportMarkdown(o),p=new Blob([r],{type:"text/markdown"}),$=URL.createObjectURL(p),u=document.createElement("a");u.href=$,u.download=`apex-audit-${new Date().toISOString().slice(0,10)}.md`,document.body.appendChild(u),u.click(),document.body.removeChild(u),URL.revokeObjectURL($),x.success("Rapport exporté")}catch(l){y.warn("feature-self-diag","export failed",{err:l}),x.error("Export échoué")}})()}),e.querySelectorAll("[data-diag-sev]").forEach(l=>{i.bind(l,"click",()=>{g.selection(),f=l.dataset.diagSev,v(e)})})}async function _(e,i){if(!c){c=!0,g.medium(),x.info(i?"🔥 Audit brutal en cours...":"🔍 Audit en cours..."),v(e);try{const{apexSelfAudit:t}=await m(async()=>{const{apexSelfAudit:s}=await import("./apex-self-audit-6t3YfsoF.js");return{apexSelfAudit:s}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),a=await t.runFullAudit(i);o=a,g.success(),x.success(`✅ Audit terminé : ${a.total_score}/100`)}catch(t){y.warn("feature-self-diag","audit failed",{err:t}),g.error(),x.error("Audit échoué")}finally{c=!1,v(e)}}}export{U as dispose,n as escapeHtml,S as filterFindingsBySeverity,R as loadLessons,v as render,k as scoreColor,z as scoreGrade};
