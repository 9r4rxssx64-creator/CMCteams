const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./sentinels-Bd_DX1vP.js","../core/main-DQpwpmEC.js","../assets/css/main-Bng3LWQS.css","./observability-BDHfDi3o.js","./toast-BkOpdP-z.js","./haptic-BUEqXK0N.js"])))=>i.map(i=>d[i]);
import{_ as i,l as g}from"../core/main-DQpwpmEC.js";async function d(e){const{sentinels:s}=await i(async()=>{const{sentinels:t}=await import("./sentinels-Bd_DX1vP.js");return{sentinels:t}},__vite__mapDeps([0,1,2,3]),import.meta.url),n=s.list(),p=n.filter(t=>t.lastResult?.ok).length,x=n.filter(t=>t.lastResult&&!t.lastResult.ok).length,u=n.filter(t=>!t.lastResult).length;e.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:900px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">🛡 Sentinelles 24/7</h1>
      <p style="color:var(--ax-text-dim);margin:0 0 12px;font-size:14px">
        ${n.length} watchers actifs ·
        <span style="color:#22cc77">✅ ${p} OK</span> ·
        <span style="color:#ffaa00">⚠️ ${x} WARN</span> ·
        <span style="color:#888">⏳ ${u} PENDING</span>
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
          ${n.map(t=>{const a=t.intervalMs>=36e5?`${Math.round(t.intervalMs/36e5)}h`:t.intervalMs>=6e4?`${Math.round(t.intervalMs/6e4)}min`:`${Math.round(t.intervalMs/1e3)}s`,r=t.lastResult?t.lastResult.ok?"✅":"⚠️":"⏳",l=t.lastResult?.msg??"Pas encore exécuté",o=t.lastResult?Math.round((Date.now()-t.lastResult.ts)/6e4):null;return`
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                <td style="padding:10px;font-size:13px">
                  <strong>${c(t.name)}</strong>
                  <div style="font-size:11px;color:var(--ax-text-dim)">${c(t.desc)}</div>
                </td>
                <td style="padding:10px;font-size:12px;color:var(--ax-text-dim)">${a}</td>
                <td style="padding:10px;font-size:12px">
                  ${r} <span style="color:${t.lastResult?.ok?"#22cc77":t.lastResult?"#ffaa00":"#888"}">${c(l.slice(0,60))}</span>
                  ${o!==null?`<div style="font-size:10px;color:#888">il y a ${o}min</div>`:""}
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
  `,e.querySelector("#ax-sent-run-all")?.addEventListener("click",()=>{(async()=>{const{toast:t}=await i(async()=>{const{toast:a}=await import("./toast-BkOpdP-z.js");return{toast:a}},__vite__mapDeps([4,5]),import.meta.url);t.info(`Exécution de ${n.length} sentinelles...`),await Promise.all(n.map(a=>s.runOne(a.id))),t.success("✅ Tous les sentinelles re-exécutés"),await d(e)})()}),e.querySelector("#ax-sent-refresh")?.addEventListener("click",()=>{d(e)}),e.querySelectorAll(".ax-sent-run").forEach(t=>{t.addEventListener("click",()=>{(async()=>{const a=t.dataset.sentId;if(!a)return;const{toast:r}=await i(async()=>{const{toast:o}=await import("./toast-BkOpdP-z.js");return{toast:o}},__vite__mapDeps([4,5]),import.meta.url),l=await s.runOne(a);r[l?.ok?"success":"warn"](`${a}: ${l?.msg??"KO"}`),await d(e)})()})}),g.info("feature-sentinels",`rendered ${n.length} sentinels (${p}OK / ${x}WARN)`)}function c(e){return e.replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[s]??s)}export{d as render};
//# sourceMappingURL=index-DSYu4o9E.js.map
