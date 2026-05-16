const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-3uBGKGRH.js","./apex-kb-gEqAF3FY.js","./credential-patterns-CLzI061R.js"])))=>i.map(i=>d[i]);
import{_ as l}from"./apex-kb-gEqAF3FY.js";import{c as R}from"./listener-cleanup-Y2rGGxxX.js";import{l as q}from"./monitoring-3uBGKGRH.js";import"./credential-patterns-CLzI061R.js";let o=null;function T(){o?.cleanup(),o=null}const p={anthropic:"🧠",openai:"🤖",groq:"⚡",gemini:"✨",mistral:"🌊",cohere:"🔷",xai:"🔥",perplexity:"🔍",deepseek:"🐋",openrouter:"🌐"};function s(t){return t.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]??a)}function f(t){return t<0?"—":t<1e3?`${Math.round(t)}ms`:`${(t/1e3).toFixed(1)}s`}function $(t){return t<0?"—":`${Math.round(t)}%`}function z(t){if(t===0)return"jamais";const a=Date.now()-t;return a<6e4?"à l'instant":a<36e5?`il y a ${Math.round(a/6e4)} min`:a<864e5?`il y a ${Math.round(a/36e5)} h`:`il y a ${Math.round(a/864e5)} j`}function w(t){return!t||t.last_ping_ts===0?'<span style="color:#666">⚪</span>':t.last_ping_ok?t.latency_avg_ms>3e3?'<span style="color:#f0c020">🟡</span>':'<span style="color:#22cc77">🟢</span>':'<span style="color:#ff5b5b">🔴</span>'}function v(t){return t>=80?"#22cc77":t>=60?"#c9a227":t>=40?"#f0c020":"#ff5b5b"}async function c(t){o?.cleanup(),o=R("smart-router");const{smartRouter:a}=await l(async()=>{const{smartRouter:e}=await import("./smart-router-CUNzRaua.js");return{smartRouter:e}},__vite__mapDeps([0,1,2]),import.meta.url),S=await a.rankProviders(),m=await a.getRecommendations(),u=a.getOverride(),i=S[0],g=a.getAllProviders(),n=i?await a.getStats(i.provider):null,y=await Promise.all(g.map(async e=>({provider:e,stats:await a.getStats(e),score:await a.scoreProvider(e)})));y.sort((e,r)=>r.score.total-e.score.total),t.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:1100px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">🎯 Smart IA Router</h1>
      <p style="color:var(--ax-text-dim);margin:0 0 16px;font-size:14px">
        Sélection automatique du meilleur provider — latence (40%) · quota (30%) · qualité (20%) · uptime (10%).
      </p>

      ${u?`
        <div style="background:rgba(240,192,32,0.15);border:1px solid #c9a227;padding:10px 14px;border-radius:8px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:12px">
          <span>📌 <strong>Override admin actif</strong> : ${s(p[u]??"")} <strong>${s(u)}</strong> forcé pour tous les calls IA.</span>
          <button class="ax-btn ax-btn-sm" id="ax-sr-clear-override" style="background:#444;color:#fff">✕ Retirer override</button>
        </div>
      `:""}

      <!-- Best provider card -->
      ${i?`
        <div style="background:linear-gradient(135deg,rgba(34,204,119,0.15),rgba(20,20,35,0.5));padding:18px;border-radius:12px;border:2px solid ${v(i.score.total)};margin-bottom:18px">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:8px">
            <div>
              <div style="font-size:11px;color:var(--ax-text-dim);text-transform:uppercase;letter-spacing:1px">Best provider courant</div>
              <h2 style="margin:4px 0;color:#fff;font-size:24px">${p[i.provider]} ${s(i.provider)}</h2>
            </div>
            <div style="text-align:right">
              <div style="font-size:36px;font-weight:bold;color:${v(i.score.total)}">${i.score.total}<span style="font-size:16px;color:var(--ax-text-dim)">/100</span></div>
              <div style="font-size:11px;color:var(--ax-text-dim)">${w(n)} ${n?z(n.last_ping_ts):"pas de ping"}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-top:12px">
            <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px">
              <div style="font-size:10px;color:var(--ax-text-dim)">⚡ Latence (40%)</div>
              <div style="font-size:13px;color:#fff">${i.score.latency_pts}pts</div>
              <div style="font-size:10px;color:var(--ax-text-dim)">${n?f(n.latency_avg_ms):"—"} avg</div>
            </div>
            <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px">
              <div style="font-size:10px;color:var(--ax-text-dim)">💰 Quota (30%)</div>
              <div style="font-size:13px;color:#fff">${i.score.quota_pts}pts</div>
              <div style="font-size:10px;color:var(--ax-text-dim)">${n?$(n.quota_remaining_pct):"—"}</div>
            </div>
            <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px">
              <div style="font-size:10px;color:var(--ax-text-dim)">✅ Qualité (20%)</div>
              <div style="font-size:13px;color:#fff">${i.score.quality_pts}pts</div>
              <div style="font-size:10px;color:var(--ax-text-dim)">${n?Math.round(n.success_rate*100):0}% success</div>
            </div>
            <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px">
              <div style="font-size:10px;color:var(--ax-text-dim)">📡 Uptime (10%)</div>
              <div style="font-size:13px;color:#fff">${i.score.uptime_pts}pts</div>
              <div style="font-size:10px;color:var(--ax-text-dim)">${n?Math.round(n.uptime_24h*100):0}% / 24h</div>
            </div>
          </div>
        </div>
      `:'<p>Aucun provider scoré. Lance "Re-tester tous" pour démarrer.</p>'}

      <!-- Action buttons -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">
        <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-sr-retest">🔄 Re-tester tous maintenant</button>
        <button class="ax-btn ax-btn-secondary ax-btn-sm" id="ax-sr-refresh">↻ Rafraîchir vue</button>
        <button class="ax-btn ax-btn-secondary ax-btn-sm" id="ax-sr-reset" style="margin-left:auto;background:#552222;color:#fff">🗑 Reset stats</button>
      </div>

      <!-- Recommandations économiques -->
      ${m.length>0?`
        <div style="background:rgba(34,204,119,0.1);border:1px solid #22cc77;padding:14px;border-radius:10px;margin-bottom:18px">
          <h3 style="margin:0 0 8px;color:#22cc77;font-size:14px">💡 Recommandations économiques</h3>
          <ul style="margin:0;padding-left:20px;color:#fff;font-size:13px">
            ${m.map(e=>`
              <li style="margin-bottom:4px">
                Bascule ${p[e.from]} <strong>${s(e.from)}</strong> → ${p[e.to]} <strong>${s(e.to)}</strong>
                <span style="color:#22cc77">économie ${e.savings_pct}%</span>
                <div style="font-size:11px;color:var(--ax-text-dim)">${s(e.reason)}</div>
              </li>
            `).join("")}
          </ul>
        </div>
      `:""}

      <!-- Tableau tous providers -->
      <h2 style="margin:18px 0 8px;color:#c9a227;font-size:16px">Tous les providers (${g.length})</h2>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;background:rgba(20,20,35,0.5);border-radius:12px;overflow:hidden">
          <thead>
            <tr style="background:rgba(201,162,39,0.1)">
              <th style="padding:10px;text-align:left;font-size:11px;color:#c9a227">Status</th>
              <th style="padding:10px;text-align:left;font-size:11px;color:#c9a227">Provider</th>
              <th style="padding:10px;text-align:right;font-size:11px;color:#c9a227">Score</th>
              <th style="padding:10px;text-align:right;font-size:11px;color:#c9a227">Latence avg</th>
              <th style="padding:10px;text-align:right;font-size:11px;color:#c9a227">p95</th>
              <th style="padding:10px;text-align:right;font-size:11px;color:#c9a227">Success</th>
              <th style="padding:10px;text-align:right;font-size:11px;color:#c9a227">Quota</th>
              <th style="padding:10px;text-align:right;font-size:11px;color:#c9a227">Coût/M</th>
              <th style="padding:10px;text-align:right;font-size:11px;color:#c9a227">Last ping</th>
              <th style="padding:10px;text-align:center;font-size:11px;color:#c9a227">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${y.map(({provider:e,stats:r,score:x})=>`
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05)${e===i?.provider?";background:rgba(34,204,119,0.05)":""}">
                <td style="padding:10px">${w(r)}</td>
                <td style="padding:10px;font-size:13px"><strong>${p[e]} ${s(e)}</strong></td>
                <td style="padding:10px;text-align:right">
                  <span style="color:${v(x.total)};font-weight:bold;font-size:14px">${x.total}</span>
                  <span style="color:var(--ax-text-dim);font-size:10px">/100</span>
                </td>
                <td style="padding:10px;text-align:right;font-size:12px">${f(r?.latency_avg_ms??-1)}</td>
                <td style="padding:10px;text-align:right;font-size:11px;color:var(--ax-text-dim)">${f(r?.latency_p95_ms??-1)}</td>
                <td style="padding:10px;text-align:right;font-size:12px">${r?Math.round(r.success_rate*100):0}%</td>
                <td style="padding:10px;text-align:right;font-size:12px">${$(r?.quota_remaining_pct??-1)}</td>
                <td style="padding:10px;text-align:right;font-size:11px;color:var(--ax-text-dim)">$${a.getPricing(e)}</td>
                <td style="padding:10px;text-align:right;font-size:11px;color:var(--ax-text-dim)">${r?z(r.last_ping_ts):"jamais"}</td>
                <td style="padding:10px;text-align:center">
                  <button class="ax-btn ax-btn-sm ax-sr-force" data-provider="${s(e)}" style="padding:4px 8px;font-size:10px;background:#c9a227;color:#000" title="Forcer ce provider">📌</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <!-- Footer info -->
      <p style="color:var(--ax-text-dim);font-size:11px;margin-top:16px;text-align:center">
        Sentinelle <code>smart-router-watch</code> ping toutes 30 min · Stats persistées localStorage · Override admin instant.
      </p>
    </div>
  `;const d=t.querySelector("#ax-sr-retest");d&&o&&o.bind(d,"click",()=>{(async()=>{const{toast:e}=await l(async()=>{const{toast:r}=await import("./toast-ClsF1KRZ.js");return{toast:r}},[],import.meta.url);d.disabled=!0,d.textContent="⏳ Test en cours…",e.info("Ping de 10 providers en parallèle…");try{await a.pingAllProviders(),e.success("✅ Tous les providers re-testés"),await c(t)}catch(r){e.error("Erreur ping: "+(r instanceof Error?r.message:String(r))),d.disabled=!1,d.textContent="🔄 Re-tester tous maintenant"}})()});const b=t.querySelector("#ax-sr-refresh");b&&o&&o.bind(b,"click",()=>{c(t)});const h=t.querySelector("#ax-sr-reset");h&&o&&o.bind(h,"click",()=>{(async()=>{const{toast:e}=await l(async()=>{const{toast:r}=await import("./toast-ClsF1KRZ.js");return{toast:r}},[],import.meta.url);typeof confirm=="function"&&!confirm("Reset toutes les stats Smart Router ? (samples + scores + override)")||(a.resetAll(),e.success("Stats reset"),await c(t))})()});const _=t.querySelector("#ax-sr-clear-override");_&&o&&o.bind(_,"click",()=>{(async()=>{const{toast:e}=await l(async()=>{const{toast:r}=await import("./toast-ClsF1KRZ.js");return{toast:r}},[],import.meta.url);a.setOverride(null),e.success("Override retiré — auto-routing actif"),await c(t)})()}),t.querySelectorAll(".ax-sr-force").forEach(e=>{o.bind(e,"click",()=>{(async()=>{const r=e.dataset.provider;if(!r)return;const{toast:x}=await l(async()=>{const{toast:k}=await import("./toast-ClsF1KRZ.js");return{toast:k}},[],import.meta.url);a.setOverride(r),x.success(`📌 ${r} forcé pour tous les calls`),await c(t)})()})}),q.info("feature-smart-router",`rendered ${g.length} providers, best=${i?.provider??"none"}`)}export{T as dispose,c as render};
