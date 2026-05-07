const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./sentinels-DD2mD5E_.js","./apex-kb-BxZCzbiC.js","./monitoring-B17vNBOa.js","./apex-tools-registry-DloDnFZi.js","./credential-patterns-DqicUg9o.js","./sentinels-registry-BlsRk1_i.js","./toast-Dgg9rcIP.js","./haptic-BUEqXK0N.js"])))=>i.map(i=>d[i]);
import{_ as c}from"./apex-kb-BxZCzbiC.js";import{l as $}from"./monitoring-B17vNBOa.js";import{c as R}from"./listener-cleanup-Y2rGGxxX.js";import"./apex-tools-registry-DloDnFZi.js";import"./credential-patterns-DqicUg9o.js";let s=null;function k(){s?.cleanup(),s=null}async function d(n){s?.cleanup(),s=R("sentinels");const{sentinels:o}=await c(async()=>{const{sentinels:t}=await import("./sentinels-DD2mD5E_.js");return{sentinels:t}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),{sentinelsRegistry:x,bootstrapSentinelsRegistry:f}=await c(async()=>{const{sentinelsRegistry:t,bootstrapSentinelsRegistry:e}=await import("./sentinels-registry-BlsRk1_i.js");return{sentinelsRegistry:t,bootstrapSentinelsRegistry:e}},__vite__mapDeps([5,1,2,3,4,0]),import.meta.url);f();const a=o.list(),h=x.getStatus(),l=x.getMetrics(),g=a.filter(t=>t.lastResult?.ok).length,m=a.filter(t=>t.lastResult&&!t.lastResult.ok).length,v=a.filter(t=>!t.lastResult).length;n.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:900px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">🛡 Sentinelles 24/7</h1>
      <p style="color:var(--ax-text-dim);margin:0 0 12px;font-size:14px">
        ${a.length} watchers (${h.running} active) ·
        <span style="color:#22cc77">✅ ${g} OK</span> ·
        <span style="color:#ffaa00">⚠️ ${m} WARN</span> ·
        <span style="color:#888">⏳ ${v} PENDING</span>
      </p>
      <p style="color:var(--ax-text-dim);margin:0 0 12px;font-size:12px">
        📊 Métriques : ${l.totalRuns} runs · avg ${l.avgDurationMs}ms · auto-fix ${l.totalAutoFixSuccess}✅ / ${l.totalAutoFixFailures}❌
      </p>

      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
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
          ${a.map(t=>{const e=t.intervalMs>=36e5?`${Math.round(t.intervalMs/36e5)}h`:t.intervalMs>=6e4?`${Math.round(t.intervalMs/6e4)}min`:`${Math.round(t.intervalMs/1e3)}s`,p=t.lastResult?t.lastResult.ok?"✅":"⚠️":"⏳",i=t.lastResult?.msg??"Pas encore exécuté",r=t.lastResult?Math.round((Date.now()-t.lastResult.ts)/6e4):null;return`
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                <td style="padding:10px;font-size:13px">
                  <strong>${u(t.name)}</strong>
                  <div style="font-size:11px;color:var(--ax-text-dim)">${u(t.desc)}</div>
                </td>
                <td style="padding:10px;font-size:12px;color:var(--ax-text-dim)">${e}</td>
                <td style="padding:10px;font-size:12px">
                  ${p} <span style="color:${t.lastResult?.ok?"#22cc77":t.lastResult?"#ffaa00":"#888"}">${u(i.slice(0,60))}</span>
                  ${r!==null?`<div style="font-size:10px;color:#888">il y a ${r}min</div>`:""}
                </td>
                <td style="padding:10px;text-align:right">
                  <button class="ax-btn ax-btn-sm ax-sent-run" data-sent-id="${t.id}" style="padding:4px 10px;font-size:11px">▶️</button>
                </td>
              </tr>
            `}).join("")}
        </tbody>
      </table>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `;const b=n.querySelector("#ax-sent-run-all");b&&s.bind(b,"click",()=>{(async()=>{const{toast:t}=await c(async()=>{const{toast:e}=await import("./toast-Dgg9rcIP.js");return{toast:e}},__vite__mapDeps([6,7]),import.meta.url);t.info(`Exécution de ${a.length} sentinelles...`),await Promise.all(a.map(e=>o.runOne(e.id))),t.success("✅ Tous les sentinelles re-exécutés"),await d(n)})()});const y=n.querySelector("#ax-sent-refresh");y&&s.bind(y,"click",()=>{d(n)}),n.querySelectorAll(".ax-sent-run").forEach(t=>{s.bind(t,"click",()=>{(async()=>{const e=t.dataset.sentId;if(!e)return;const{toast:p}=await c(async()=>{const{toast:r}=await import("./toast-Dgg9rcIP.js");return{toast:r}},__vite__mapDeps([6,7]),import.meta.url),i=await o.runOne(e);p[i?.ok?"success":"warn"](`${e}: ${i?.msg??"KO"}`),await d(n)})()})}),$.info("feature-sentinels",`rendered ${a.length} sentinels (${g}OK / ${m}WARN)`)}function u(n){return n.replace(/[&<>"']/g,o=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[o]??o)}export{k as dispose,d as render};
//# sourceMappingURL=index-DbZbZt8c.js.map
