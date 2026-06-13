const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-CWQm8S_w.js","./multi-source-analyze-BLdnngVZ.js","./credential-patterns-DUMYZEMu.js","./apex-kb-Bf_SPpoW.js"])))=>i.map(i=>d[i]);
import{_ as u,e as o,l as M}from"./monitoring-CWQm8S_w.js";import{c as D}from"./listener-cleanup-Y2rGGxxX.js";import"./multi-source-analyze-BLdnngVZ.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-Bf_SPpoW.js";let i=null;function P(){i?.cleanup(),i=null}async function g(n){i?.cleanup(),i=D("sentinels");const{sentinels:p}=await u(async()=>{const{sentinels:t}=await import("./sentinels-TTsHk6c1.js");return{sentinels:t}},__vite__mapDeps([0,1,2,3]),import.meta.url),{sentinelsRegistry:m,bootstrapSentinelsRegistry:f}=await u(async()=>{const{sentinelsRegistry:t,bootstrapSentinelsRegistry:a}=await import("./sentinels-registry-oFCmIjTg.js");return{sentinelsRegistry:t,bootstrapSentinelsRegistry:a}},__vite__mapDeps([0,1,2,3]),import.meta.url);f();const e=p.list(),y=m.getStatus(),x=m.getMetrics(),v=e.filter(t=>t.lastResult?.ok).length,$=e.filter(t=>t.lastResult&&!t.lastResult.ok).length,R=e.filter(t=>!t.lastResult).length;n.innerHTML=`
    <div class="ax-page ax-gs-376">
      <h1 class="ax-gs-365">🛡 Sentinelles 24/7</h1>
      <p class="ax-gs-385">
        ${e.length} watchers (${y.running} active) ·
        <span class="ax-gs-14">✅ ${v} OK</span> ·
        <span class="ax-gs-61">⚠️ ${$} WARN</span> ·
        <span class="ax-gs-25">⏳ ${R} PENDING</span>
      </p>
      <p style="color:var(--ax-text-dim);margin:0 0 12px;font-size:12px">
        📊 Métriques : ${x.totalRuns} runs · avg ${x.avgDurationMs}ms · auto-fix ${x.totalAutoFixSuccess}✅ / ${x.totalAutoFixFailures}❌
      </p>

      <div class="ax-gs-65">
        <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-sent-run-all">▶️ Run all maintenant</button>
        <button class="ax-btn ax-btn-secondary ax-btn-sm" id="ax-sent-refresh">🔄 Rafraîchir</button>
      </div>

      <table class="ax-gs-434">
        <thead>
          <tr class="ax-gs-387">
            <th class="ax-gs-435">Sentinel</th>
            <th class="ax-gs-435">Interval</th>
            <th class="ax-gs-435">Last result</th>
            <th style="padding:10px;text-align:right;font-size:12px;color:#c9a227;border-bottom:1px solid rgba(201,162,39,0.3)">Action</th>
          </tr>
        </thead>
        <tbody>
          ${e.map(t=>{const a=t.intervalMs>=36e5?`${Math.round(t.intervalMs/36e5)}h`:t.intervalMs>=6e4?`${Math.round(t.intervalMs/6e4)}min`:`${Math.round(t.intervalMs/1e3)}s`,s=t.lastResult?t.lastResult.ok?"✅":"⚠️":"⏳",d=t.lastResult?.msg??"Pas encore exécuté",l=t.lastResult?Math.round((Date.now()-t.lastResult.ts)/6e4):null;return`
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer" class="ax-sent-row" data-sent-id="${t.id}">
                <td class="ax-gs-436">
                  <strong>${o(t.name)}</strong>
                  <div class="ax-gs-2">${o(t.desc)}</div>
                </td>
                <td style="padding:10px;font-size:12px;color:var(--ax-text-dim)">${a}</td>
                <td style="padding:10px;font-size:12px">
                  ${s} <span style="color:${t.lastResult?.ok?"#22cc77":t.lastResult?"#ffaa00":"#888"}">${o(d.slice(0,60))}</span>
                  ${l!==null?`<div style="font-size:10px;color:#888">il y a ${l}min</div>`:""}
                </td>
                <td class="ax-gs-317">
                  <button class="ax-btn ax-btn-sm ax-sent-run" data-sent-id="${t.id}" style="padding:4px 10px;font-size:11px" aria-label="Exécuter sentinelle">▶️</button>
                </td>
              </tr>
            `}).join("")}
        </tbody>
      </table>

      <p class="ax-gs-212"><a href="#chat" class="ax-gs-198">← Retour chat</a></p>
    </div>
  `;const h=n.querySelector("#ax-sent-run-all");h&&i.bind(h,"click",()=>{(async()=>{const{toast:t}=await u(async()=>{const{toast:a}=await import("./toast-CRdbcLoc.js");return{toast:a}},[],import.meta.url);t.info(`Exécution de ${e.length} sentinelles...`),await Promise.all(e.map(a=>p.runOne(a.id))),t.success("✅ Tous les sentinelles re-exécutés"),await g(n)})()});const b=n.querySelector("#ax-sent-refresh");b&&i.bind(b,"click",()=>{g(n)}),n.querySelectorAll(".ax-sent-run").forEach(t=>{i.bind(t,"click",a=>{a.stopPropagation(),(async()=>{const s=t.dataset.sentId;if(!s)return;const{toast:d}=await u(async()=>{const{toast:r}=await import("./toast-CRdbcLoc.js");return{toast:r}},[],import.meta.url),l=await p.runOne(s);d[l?.ok?"success":"warn"](`${s}: ${l?.msg??"KO"}`),await g(n)})()})}),n.querySelectorAll(".ax-sent-row").forEach(t=>{i.bind(t,"click",()=>{(async()=>{const a=t.dataset.sentId;if(!a)return;const s=e.find(c=>c.id===a);if(!s)return;const{drillDown:d}=await u(async()=>{const{drillDown:c}=await import("./drilldown-1SlvGToi.js");return{drillDown:c}},[],import.meta.url),l="ax-drilldown-mount-sentinels";let r=document.getElementById(l);r||(r=document.createElement("div"),r.id=l,document.body.appendChild(r)),d.open({id:`sent-${a}`,title:`🛡 ${s.name}`,content:()=>{const c=s.lastResult?.ok,_=s.lastResult?.msg??"—",w=s.lastResult?new Date(s.lastResult.ts).toLocaleString("fr-FR"):"—";return`
              <div class="ax-gs-27">
                <p class="ax-gs-363">${o(s.desc)}</p>
                <table class="ax-gs-291">
                  <tr><td class="ax-gs-367">ID</td><td><code>${o(s.id)}</code></td></tr>
                  <tr><td class="ax-gs-367">Interval</td><td>${Math.round(s.intervalMs/1e3)}s</td></tr>
                  <tr><td class="ax-gs-367">Dernier statut</td><td>${c===void 0?"⏳ Pending":c?"✅ OK":"⚠️ WARN"}</td></tr>
                  <tr><td class="ax-gs-367">Dernier message</td><td>${o(_)}</td></tr>
                  <tr><td class="ax-gs-367">Dernière exec</td><td>${o(w)}</td></tr>
                </table>
              </div>
            `},data:{sentinelId:a}},r)})()})}),M.info("feature-sentinels",`rendered ${e.length} sentinels (${v}OK / ${$}WARN)`)}export{P as dispose,g as render};
