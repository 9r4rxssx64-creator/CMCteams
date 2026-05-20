const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-D2lWYrYo.js","./multi-source-analyze-Bg1HHfSC.js","./apex-kb-D1VtWFD9.js","./credential-patterns-CLzI061R.js"])))=>i.map(i=>d[i]);
import{_ as l}from"./apex-kb-D1VtWFD9.js";import{e as n}from"./escape-html-BlQj2yEF.js";import{c as k}from"./listener-cleanup-Y2rGGxxX.js";import{l as P}from"./monitoring-D2lWYrYo.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-Bg1HHfSC.js";let i=null;function I(){i?.cleanup(),i=null}const c={anthropic:"🧠",openai:"🤖",groq:"⚡",gemini:"✨",mistral:"🌊",cohere:"🔷",xai:"🔥",perplexity:"🔍",deepseek:"🐋",openrouter:"🌐"};function m(t){return t<0?"—":t<1e3?`${Math.round(t)}ms`:`${(t/1e3).toFixed(1)}s`}function $(t){return t<0?"—":`${Math.round(t)}%`}function w(t){if(t===0)return"jamais";const r=Date.now()-t;return r<6e4?"à l'instant":r<36e5?`il y a ${Math.round(r/6e4)} min`:r<864e5?`il y a ${Math.round(r/36e5)} h`:`il y a ${Math.round(r/864e5)} j`}function z(t){return!t||t.last_ping_ts===0?'<span class="ax-gs-64">⚪</span>':t.last_ping_ok?t.latency_avg_ms>3e3?'<span class="ax-gs-44">🟡</span>':'<span class="ax-gs-14">🟢</span>':'<span class="ax-gs-13">🔴</span>'}function v(t){return t>=80?"#22cc77":t>=60?"#c9a227":t>=40?"#f0c020":"#ff5b5b"}async function p(t){i?.cleanup(),i=k("smart-router");const{smartRouter:r}=await l(async()=>{const{smartRouter:e}=await import("./smart-router-BQvHqCfh.js");return{smartRouter:e}},__vite__mapDeps([0,1,2,3]),import.meta.url),S=await r.rankProviders(),f=await r.getRecommendations(),g=r.getOverride(),s=S[0],u=r.getAllProviders(),o=s?await r.getStats(s.provider):null,y=await Promise.all(u.map(async e=>({provider:e,stats:await r.getStats(e),score:await r.scoreProvider(e)})));y.sort((e,a)=>a.score.total-e.score.total),t.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:1100px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">🎯 Smart IA Router</h1>
      <p style="color:var(--ax-text-dim);margin:0 0 16px;font-size:14px">
        Sélection automatique du meilleur provider — latence (40%) · quota (30%) · qualité (20%) · uptime (10%).
      </p>

      ${g?`
        <div style="background:rgba(240,192,32,0.15);border:1px solid #c9a227;padding:10px 14px;border-radius:8px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:12px">
          <span>📌 <strong>Override admin actif</strong> : ${n(c[g]??"")} <strong>${n(g)}</strong> forcé pour tous les calls IA.</span>
          <button class="ax-btn ax-btn-sm" id="ax-sr-clear-override" style="background:#444;color:#fff">✕ Retirer override</button>
        </div>
      `:""}

      <!-- Best provider card -->
      ${s?`
        <div style="background:linear-gradient(135deg,rgba(34,204,119,0.15),rgba(20,20,35,0.5));padding:18px;border-radius:12px;border:2px solid ${v(s.score.total)};margin-bottom:18px">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:8px">
            <div>
              <div style="font-size:11px;color:var(--ax-text-dim);text-transform:uppercase;letter-spacing:1px">Best provider courant</div>
              <h2 style="margin:4px 0;color:#fff;font-size:24px">${c[s.provider]} ${n(s.provider)}</h2>
            </div>
            <div style="text-align:right">
              <div style="font-size:36px;font-weight:bold;color:${v(s.score.total)}">${s.score.total}<span style="font-size:16px;color:var(--ax-text-dim)">/100</span></div>
              <div class="ax-gs-2">${z(o)} ${o?w(o.last_ping_ts):"pas de ping"}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-top:12px">
            <div class="ax-gs-45">
              <div class="ax-gs-8">⚡ Latence (40%)</div>
              <div class="ax-gs-31">${s.score.latency_pts}pts</div>
              <div class="ax-gs-8">${o?m(o.latency_avg_ms):"—"} avg</div>
            </div>
            <div class="ax-gs-45">
              <div class="ax-gs-8">💰 Quota (30%)</div>
              <div class="ax-gs-31">${s.score.quota_pts}pts</div>
              <div class="ax-gs-8">${o?$(o.quota_remaining_pct):"—"}</div>
            </div>
            <div class="ax-gs-45">
              <div class="ax-gs-8">✅ Qualité (20%)</div>
              <div class="ax-gs-31">${s.score.quality_pts}pts</div>
              <div class="ax-gs-8">${o?Math.round(o.success_rate*100):0}% success</div>
            </div>
            <div class="ax-gs-45">
              <div class="ax-gs-8">📡 Uptime (10%)</div>
              <div class="ax-gs-31">${s.score.uptime_pts}pts</div>
              <div class="ax-gs-8">${o?Math.round(o.uptime_24h*100):0}% / 24h</div>
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
      ${f.length>0?`
        <div style="background:rgba(34,204,119,0.1);border:1px solid #22cc77;padding:14px;border-radius:10px;margin-bottom:18px">
          <h3 style="margin:0 0 8px;color:#22cc77;font-size:14px">💡 Recommandations économiques</h3>
          <ul style="margin:0;padding-left:20px;color:#fff;font-size:13px">
            ${f.map(e=>`
              <li style="margin-bottom:4px">
                Bascule ${c[e.from]} <strong>${n(e.from)}</strong> → ${c[e.to]} <strong>${n(e.to)}</strong>
                <span class="ax-gs-14">économie ${e.savings_pct}%</span>
                <div class="ax-gs-2">${n(e.reason)}</div>
              </li>
            `).join("")}
          </ul>
        </div>
      `:""}

      <!-- Tableau tous providers -->
      <h2 style="margin:18px 0 8px;color:#c9a227;font-size:16px">Tous les providers (${u.length})</h2>
      <div class="ax-gs-78">
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
            ${y.map(({provider:e,stats:a,score:x})=>`
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05)${e===s?.provider?";background:rgba(34,204,119,0.05)":""}">
                <td style="padding:10px">${z(a)}</td>
                <td style="padding:10px;font-size:13px"><strong>${c[e]} ${n(e)}</strong></td>
                <td style="padding:10px;text-align:right">
                  <span style="color:${v(x.total)};font-weight:bold;font-size:14px">${x.total}</span>
                  <span style="color:var(--ax-text-dim);font-size:10px">/100</span>
                </td>
                <td style="padding:10px;text-align:right;font-size:12px">${m(a?.latency_avg_ms??-1)}</td>
                <td style="padding:10px;text-align:right;font-size:11px;color:var(--ax-text-dim)">${m(a?.latency_p95_ms??-1)}</td>
                <td style="padding:10px;text-align:right;font-size:12px">${a?Math.round(a.success_rate*100):0}%</td>
                <td style="padding:10px;text-align:right;font-size:12px">${$(a?.quota_remaining_pct??-1)}</td>
                <td style="padding:10px;text-align:right;font-size:11px;color:var(--ax-text-dim)">$${r.getPricing(e)}</td>
                <td style="padding:10px;text-align:right;font-size:11px;color:var(--ax-text-dim)">${a?w(a.last_ping_ts):"jamais"}</td>
                <td style="padding:10px;text-align:center">
                  <button class="ax-btn ax-btn-sm ax-sr-force" data-provider="${n(e)}" style="padding:4px 8px;font-size:10px;background:#c9a227;color:#000" title="Forcer ce provider">📌</button>
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
  `;const d=t.querySelector("#ax-sr-retest");d&&i&&i.bind(d,"click",()=>{(async()=>{const{toast:e}=await l(async()=>{const{toast:a}=await import("./toast-CRdbcLoc.js");return{toast:a}},[],import.meta.url);d.disabled=!0,d.textContent="⏳ Test en cours…",e.info("Ping de 10 providers en parallèle…");try{await r.pingAllProviders(),e.success("✅ Tous les providers re-testés"),await p(t)}catch(a){e.error("Erreur ping: "+(a instanceof Error?a.message:String(a))),d.disabled=!1,d.textContent="🔄 Re-tester tous maintenant"}})()});const b=t.querySelector("#ax-sr-refresh");b&&i&&i.bind(b,"click",()=>{p(t)});const h=t.querySelector("#ax-sr-reset");h&&i&&i.bind(h,"click",()=>{(async()=>{const{toast:e}=await l(async()=>{const{toast:a}=await import("./toast-CRdbcLoc.js");return{toast:a}},[],import.meta.url);typeof confirm=="function"&&!confirm("Reset toutes les stats Smart Router ? (samples + scores + override)")||(r.resetAll(),e.success("Stats reset"),await p(t))})()});const _=t.querySelector("#ax-sr-clear-override");_&&i&&i.bind(_,"click",()=>{(async()=>{const{toast:e}=await l(async()=>{const{toast:a}=await import("./toast-CRdbcLoc.js");return{toast:a}},[],import.meta.url);r.setOverride(null),e.success("Override retiré — auto-routing actif"),await p(t)})()}),t.querySelectorAll(".ax-sr-force").forEach(e=>{i.bind(e,"click",()=>{(async()=>{const a=e.dataset.provider;if(!a)return;const{toast:x}=await l(async()=>{const{toast:R}=await import("./toast-CRdbcLoc.js");return{toast:R}},[],import.meta.url);r.setOverride(a),x.success(`📌 ${a} forcé pour tous les calls`),await p(t)})()})}),P.info("feature-smart-router",`rendered ${u.length} providers, best=${s?.provider??"none"}`)}export{I as dispose,p as render};
