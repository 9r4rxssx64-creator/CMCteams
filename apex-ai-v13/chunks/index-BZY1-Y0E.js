const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-D1VtWFD9.js","./monitoring-D2lWYrYo.js","./multi-source-analyze-Bg1HHfSC.js","./credential-patterns-CLzI061R.js"])))=>i.map(i=>d[i]);
import{_ as p}from"./apex-kb-D1VtWFD9.js";import{e as o}from"./escape-html-BlQj2yEF.js";import{c as M}from"./listener-cleanup-Y2rGGxxX.js";import{l as D}from"./monitoring-D2lWYrYo.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-Bg1HHfSC.js";let r=null;function P(){r?.cleanup(),r=null}async function g(s){r?.cleanup(),r=M("sentinels");const{sentinels:x}=await p(async()=>{const{sentinels:t}=await import("./sentinels-DZ-dPvtb.js");return{sentinels:t}},__vite__mapDeps([0,1,2,3]),import.meta.url),{sentinelsRegistry:m,bootstrapSentinelsRegistry:h}=await p(async()=>{const{sentinelsRegistry:t,bootstrapSentinelsRegistry:a}=await import("./sentinels-registry-BaAQAsQU.js");return{sentinelsRegistry:t,bootstrapSentinelsRegistry:a}},__vite__mapDeps([0,1,2,3]),import.meta.url);h();const n=x.list(),$=m.getStatus(),u=m.getMetrics(),y=n.filter(t=>t.lastResult?.ok).length,b=n.filter(t=>t.lastResult&&!t.lastResult.ok).length,R=n.filter(t=>!t.lastResult).length;s.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:900px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">🛡 Sentinelles 24/7</h1>
      <p style="color:var(--ax-text-dim);margin:0 0 12px;font-size:14px">
        ${n.length} watchers (${$.running} active) ·
        <span class="ax-gs-14">✅ ${y} OK</span> ·
        <span class="ax-gs-61">⚠️ ${b} WARN</span> ·
        <span class="ax-gs-25">⏳ ${R} PENDING</span>
      </p>
      <p style="color:var(--ax-text-dim);margin:0 0 12px;font-size:12px">
        📊 Métriques : ${u.totalRuns} runs · avg ${u.avgDurationMs}ms · auto-fix ${u.totalAutoFixSuccess}✅ / ${u.totalAutoFixFailures}❌
      </p>

      <div class="ax-gs-65">
        <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-sent-run-all">▶️ Run all maintenant</button>
        <button class="ax-btn ax-btn-secondary ax-btn-sm" id="ax-sent-refresh">🔄 Rafraîchir</button>
      </div>

      <table style="width:100%;border-collapse:collapse;background:rgba(20,20,35,0.5);border-radius:12px;overflow:hidden">
        <thead>
          <tr style="background:rgba(201,162,39,0.1)">
            <th style="padding:10px;text-align:left;font-size:12px;color:#c9a227;border-bottom:1px solid rgba(201,162,39,0.3)">Sentinel</th>
            <th style="padding:10px;text-align:left;font-size:12px;color:#c9a227;border-bottom:1px solid rgba(201,162,39,0.3)">Interval</th>
            <th style="padding:10px;text-align:left;font-size:12px;color:#c9a227;border-bottom:1px solid rgba(201,162,39,0.3)">Last result</th>
            <th style="padding:10px;text-align:right;font-size:12px;color:#c9a227;border-bottom:1px solid rgba(201,162,39,0.3)">Action</th>
          </tr>
        </thead>
        <tbody>
          ${n.map(t=>{const a=t.intervalMs>=36e5?`${Math.round(t.intervalMs/36e5)}h`:t.intervalMs>=6e4?`${Math.round(t.intervalMs/6e4)}min`:`${Math.round(t.intervalMs/1e3)}s`,e=t.lastResult?t.lastResult.ok?"✅":"⚠️":"⏳",c=t.lastResult?.msg??"Pas encore exécuté",i=t.lastResult?Math.round((Date.now()-t.lastResult.ts)/6e4):null;return`
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer" class="ax-sent-row" data-sent-id="${t.id}">
                <td style="padding:10px;font-size:13px">
                  <strong>${o(t.name)}</strong>
                  <div class="ax-gs-2">${o(t.desc)}</div>
                </td>
                <td style="padding:10px;font-size:12px;color:var(--ax-text-dim)">${a}</td>
                <td style="padding:10px;font-size:12px">
                  ${e} <span style="color:${t.lastResult?.ok?"#22cc77":t.lastResult?"#ffaa00":"#888"}">${o(c.slice(0,60))}</span>
                  ${i!==null?`<div style="font-size:10px;color:#888">il y a ${i}min</div>`:""}
                </td>
                <td style="padding:10px;text-align:right">
                  <button class="ax-btn ax-btn-sm ax-sent-run" data-sent-id="${t.id}" style="padding:4px 10px;font-size:11px" aria-label="Exécuter sentinelle">▶️</button>
                </td>
              </tr>
            `}).join("")}
        </tbody>
      </table>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `;const f=s.querySelector("#ax-sent-run-all");f&&r.bind(f,"click",()=>{(async()=>{const{toast:t}=await p(async()=>{const{toast:a}=await import("./toast-CRdbcLoc.js");return{toast:a}},[],import.meta.url);t.info(`Exécution de ${n.length} sentinelles...`),await Promise.all(n.map(a=>x.runOne(a.id))),t.success("✅ Tous les sentinelles re-exécutés"),await g(s)})()});const v=s.querySelector("#ax-sent-refresh");v&&r.bind(v,"click",()=>{g(s)}),s.querySelectorAll(".ax-sent-run").forEach(t=>{r.bind(t,"click",a=>{a.stopPropagation(),(async()=>{const e=t.dataset.sentId;if(!e)return;const{toast:c}=await p(async()=>{const{toast:l}=await import("./toast-CRdbcLoc.js");return{toast:l}},[],import.meta.url),i=await x.runOne(e);c[i?.ok?"success":"warn"](`${e}: ${i?.msg??"KO"}`),await g(s)})()})}),s.querySelectorAll(".ax-sent-row").forEach(t=>{r.bind(t,"click",()=>{(async()=>{const a=t.dataset.sentId;if(!a)return;const e=n.find(d=>d.id===a);if(!e)return;const{drillDown:c}=await p(async()=>{const{drillDown:d}=await import("./drilldown-1SlvGToi.js");return{drillDown:d}},[],import.meta.url),i="ax-drilldown-mount-sentinels";let l=document.getElementById(i);l||(l=document.createElement("div"),l.id=i,document.body.appendChild(l)),c.open({id:`sent-${a}`,title:`🛡 ${e.name}`,content:()=>{const d=e.lastResult?.ok,_=e.lastResult?.msg??"—",w=e.lastResult?new Date(e.lastResult.ts).toLocaleString("fr-FR"):"—";return`
              <div class="ax-gs-27">
                <p style="margin:0 0 12px;color:var(--ax-text-dim)">${o(e.desc)}</p>
                <table style="width:100%;font-size:13px">
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">ID</td><td><code>${o(e.id)}</code></td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Interval</td><td>${Math.round(e.intervalMs/1e3)}s</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Dernier statut</td><td>${d===void 0?"⏳ Pending":d?"✅ OK":"⚠️ WARN"}</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Dernier message</td><td>${o(_)}</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Dernière exec</td><td>${o(w)}</td></tr>
                </table>
              </div>
            `},data:{sentinelId:a}},l)})()})}),D.info("feature-sentinels",`rendered ${n.length} sentinels (${y}OK / ${b}WARN)`)}export{P as dispose,g as render};
