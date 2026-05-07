const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./sentinels-Bi-ZQc39.js","./apex-tools-dispatch-BIDkouHS.js","./monitoring-B17vNBOa.js","./apex-tools-registry-eSveblul.js","./sentinels-registry-CS9LotJk.js","./toast-Dgg9rcIP.js","./haptic-BUEqXK0N.js"])))=>i.map(i=>d[i]);
import{_ as l}from"./apex-tools-dispatch-BIDkouHS.js";import{l as f}from"./monitoring-B17vNBOa.js";import"./apex-tools-registry-eSveblul.js";async function c(a){const{sentinels:s}=await l(async()=>{const{sentinels:t}=await import("./sentinels-Bi-ZQc39.js");return{sentinels:t}},__vite__mapDeps([0,1,2,3]),import.meta.url),{sentinelsRegistry:u,bootstrapSentinelsRegistry:m}=await l(async()=>{const{sentinelsRegistry:t,bootstrapSentinelsRegistry:e}=await import("./sentinels-registry-CS9LotJk.js");return{sentinelsRegistry:t,bootstrapSentinelsRegistry:e}},__vite__mapDeps([4,1,2,3,0]),import.meta.url);m();const n=s.list(),y=u.getStatus(),r=u.getMetrics(),x=n.filter(t=>t.lastResult?.ok).length,g=n.filter(t=>t.lastResult&&!t.lastResult.ok).length,b=n.filter(t=>!t.lastResult).length;a.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:900px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">🛡 Sentinelles 24/7</h1>
      <p style="color:var(--ax-text-dim);margin:0 0 12px;font-size:14px">
        ${n.length} watchers (${y.running} active) ·
        <span style="color:#22cc77">✅ ${x} OK</span> ·
        <span style="color:#ffaa00">⚠️ ${g} WARN</span> ·
        <span style="color:#888">⏳ ${b} PENDING</span>
      </p>
      <p style="color:var(--ax-text-dim);margin:0 0 12px;font-size:12px">
        📊 Métriques : ${r.totalRuns} runs · avg ${r.avgDurationMs}ms · auto-fix ${r.totalAutoFixSuccess}✅ / ${r.totalAutoFixFailures}❌
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
          ${n.map(t=>{const e=t.intervalMs>=36e5?`${Math.round(t.intervalMs/36e5)}h`:t.intervalMs>=6e4?`${Math.round(t.intervalMs/6e4)}min`:`${Math.round(t.intervalMs/1e3)}s`,d=t.lastResult?t.lastResult.ok?"✅":"⚠️":"⏳",o=t.lastResult?.msg??"Pas encore exécuté",i=t.lastResult?Math.round((Date.now()-t.lastResult.ts)/6e4):null;return`
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                <td style="padding:10px;font-size:13px">
                  <strong>${p(t.name)}</strong>
                  <div style="font-size:11px;color:var(--ax-text-dim)">${p(t.desc)}</div>
                </td>
                <td style="padding:10px;font-size:12px;color:var(--ax-text-dim)">${e}</td>
                <td style="padding:10px;font-size:12px">
                  ${d} <span style="color:${t.lastResult?.ok?"#22cc77":t.lastResult?"#ffaa00":"#888"}">${p(o.slice(0,60))}</span>
                  ${i!==null?`<div style="font-size:10px;color:#888">il y a ${i}min</div>`:""}
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
  `,a.querySelector("#ax-sent-run-all")?.addEventListener("click",()=>{(async()=>{const{toast:t}=await l(async()=>{const{toast:e}=await import("./toast-Dgg9rcIP.js");return{toast:e}},__vite__mapDeps([5,6]),import.meta.url);t.info(`Exécution de ${n.length} sentinelles...`),await Promise.all(n.map(e=>s.runOne(e.id))),t.success("✅ Tous les sentinelles re-exécutés"),await c(a)})()}),a.querySelector("#ax-sent-refresh")?.addEventListener("click",()=>{c(a)}),a.querySelectorAll(".ax-sent-run").forEach(t=>{t.addEventListener("click",()=>{(async()=>{const e=t.dataset.sentId;if(!e)return;const{toast:d}=await l(async()=>{const{toast:i}=await import("./toast-Dgg9rcIP.js");return{toast:i}},__vite__mapDeps([5,6]),import.meta.url),o=await s.runOne(e);d[o?.ok?"success":"warn"](`${e}: ${o?.msg??"KO"}`),await c(a)})()})}),f.info("feature-sentinels",`rendered ${n.length} sentinels (${x}OK / ${g}WARN)`)}function p(a){return a.replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[s]??s)}export{c as render};
//# sourceMappingURL=index-By7HZCEY.js.map
