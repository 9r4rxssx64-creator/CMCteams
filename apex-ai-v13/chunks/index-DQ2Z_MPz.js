const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-Ss-LQHUo.js","./monitoring-3uBGKGRH.js","./credential-patterns-CLzI061R.js"])))=>i.map(i=>d[i]);
import{_ as u}from"./apex-kb-Ss-LQHUo.js";import{c as M}from"./listener-cleanup-Y2rGGxxX.js";import{l as D}from"./monitoring-3uBGKGRH.js";import"./credential-patterns-CLzI061R.js";let i=null;function z(){i?.cleanup(),i=null}async function g(a){i?.cleanup(),i=M("sentinels");const{sentinels:d}=await u(async()=>{const{sentinels:t}=await import("./sentinels-Cx1WWffn.js");return{sentinels:t}},__vite__mapDeps([0,1,2]),import.meta.url),{sentinelsRegistry:m,bootstrapSentinelsRegistry:h}=await u(async()=>{const{sentinelsRegistry:t,bootstrapSentinelsRegistry:n}=await import("./sentinels-registry-2r7XL6Y8.js");return{sentinelsRegistry:t,bootstrapSentinelsRegistry:n}},__vite__mapDeps([0,1,2]),import.meta.url);h();const s=d.list(),$=m.getStatus(),x=m.getMetrics(),y=s.filter(t=>t.lastResult?.ok).length,f=s.filter(t=>t.lastResult&&!t.lastResult.ok).length,R=s.filter(t=>!t.lastResult).length;a.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:900px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">🛡 Sentinelles 24/7</h1>
      <p style="color:var(--ax-text-dim);margin:0 0 12px;font-size:14px">
        ${s.length} watchers (${$.running} active) ·
        <span style="color:#22cc77">✅ ${y} OK</span> ·
        <span style="color:#ffaa00">⚠️ ${f} WARN</span> ·
        <span style="color:#888">⏳ ${R} PENDING</span>
      </p>
      <p style="color:var(--ax-text-dim);margin:0 0 12px;font-size:12px">
        📊 Métriques : ${x.totalRuns} runs · avg ${x.avgDurationMs}ms · auto-fix ${x.totalAutoFixSuccess}✅ / ${x.totalAutoFixFailures}❌
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
          ${s.map(t=>{const n=t.intervalMs>=36e5?`${Math.round(t.intervalMs/36e5)}h`:t.intervalMs>=6e4?`${Math.round(t.intervalMs/6e4)}min`:`${Math.round(t.intervalMs/1e3)}s`,e=t.lastResult?t.lastResult.ok?"✅":"⚠️":"⏳",p=t.lastResult?.msg??"Pas encore exécuté",r=t.lastResult?Math.round((Date.now()-t.lastResult.ts)/6e4):null;return`
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer" class="ax-sent-row" data-sent-id="${t.id}">
                <td style="padding:10px;font-size:13px">
                  <strong>${o(t.name)}</strong>
                  <div style="font-size:11px;color:var(--ax-text-dim)">${o(t.desc)}</div>
                </td>
                <td style="padding:10px;font-size:12px;color:var(--ax-text-dim)">${n}</td>
                <td style="padding:10px;font-size:12px">
                  ${e} <span style="color:${t.lastResult?.ok?"#22cc77":t.lastResult?"#ffaa00":"#888"}">${o(p.slice(0,60))}</span>
                  ${r!==null?`<div style="font-size:10px;color:#888">il y a ${r}min</div>`:""}
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
  `;const b=a.querySelector("#ax-sent-run-all");b&&i.bind(b,"click",()=>{(async()=>{const{toast:t}=await u(async()=>{const{toast:n}=await import("./toast-ClsF1KRZ.js");return{toast:n}},[],import.meta.url);t.info(`Exécution de ${s.length} sentinelles...`),await Promise.all(s.map(n=>d.runOne(n.id))),t.success("✅ Tous les sentinelles re-exécutés"),await g(a)})()});const v=a.querySelector("#ax-sent-refresh");v&&i.bind(v,"click",()=>{g(a)}),a.querySelectorAll(".ax-sent-run").forEach(t=>{i.bind(t,"click",n=>{n.stopPropagation(),(async()=>{const e=t.dataset.sentId;if(!e)return;const{toast:p}=await u(async()=>{const{toast:l}=await import("./toast-ClsF1KRZ.js");return{toast:l}},[],import.meta.url),r=await d.runOne(e);p[r?.ok?"success":"warn"](`${e}: ${r?.msg??"KO"}`),await g(a)})()})}),a.querySelectorAll(".ax-sent-row").forEach(t=>{i.bind(t,"click",()=>{(async()=>{const n=t.dataset.sentId;if(!n)return;const e=s.find(c=>c.id===n);if(!e)return;const{drillDown:p}=await u(async()=>{const{drillDown:c}=await import("./drilldown-1SlvGToi.js");return{drillDown:c}},[],import.meta.url),r="ax-drilldown-mount-sentinels";let l=document.getElementById(r);l||(l=document.createElement("div"),l.id=r,document.body.appendChild(l)),p.open({id:`sent-${n}`,title:`🛡 ${e.name}`,content:()=>{const c=e.lastResult?.ok,w=e.lastResult?.msg??"—",_=e.lastResult?new Date(e.lastResult.ts).toLocaleString("fr-FR"):"—";return`
              <div style="padding:8px">
                <p style="margin:0 0 12px;color:var(--ax-text-dim)">${o(e.desc)}</p>
                <table style="width:100%;font-size:13px">
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">ID</td><td><code>${o(e.id)}</code></td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Interval</td><td>${Math.round(e.intervalMs/1e3)}s</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Dernier statut</td><td>${c===void 0?"⏳ Pending":c?"✅ OK":"⚠️ WARN"}</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Dernier message</td><td>${o(w)}</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Dernière exec</td><td>${o(_)}</td></tr>
                </table>
              </div>
            `},data:{sentinelId:n}},l)})()})}),D.info("feature-sentinels",`rendered ${s.length} sentinels (${y}OK / ${f}WARN)`)}function o(a){return a.replace(/[&<>"']/g,d=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[d]??d)}export{z as dispose,g as render};
