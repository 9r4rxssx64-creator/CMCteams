const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-Dwmx5tS-.js","./multi-source-analyze-BwmGob6O.js","./credential-patterns-DUMYZEMu.js","./apex-kb-D-RQMX7f.js"])))=>i.map(i=>d[i]);
import{_ as d,e as n,l as P}from"./monitoring-Dwmx5tS-.js";import{c as q}from"./listener-cleanup-Y2rGGxxX.js";import"./multi-source-analyze-BwmGob6O.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-D-RQMX7f.js";let i=null;function M(){i?.cleanup(),i=null}const l={anthropic:"🧠",openai:"🤖",groq:"⚡",gemini:"✨",mistral:"🌊",cohere:"🔷",xai:"🔥",perplexity:"🔍",deepseek:"🐋",openrouter:"🌐"};function v(t){return t<0?"—":t<1e3?`${Math.round(t)}ms`:`${(t/1e3).toFixed(1)}s`}function $(t){return t<0?"—":`${Math.round(t)}%`}function w(t){if(t===0)return"jamais";const e=Date.now()-t;return e<6e4?"à l'instant":e<36e5?`il y a ${Math.round(e/6e4)} min`:e<864e5?`il y a ${Math.round(e/36e5)} h`:`il y a ${Math.round(e/864e5)} j`}function S(t){return!t||t.last_ping_ts===0?'<span class="ax-gs-64">⚪</span>':t.last_ping_ok?t.latency_avg_ms>3e3?'<span class="ax-gs-44">🟡</span>':'<span class="ax-gs-14">🟢</span>':'<span class="ax-gs-13">🔴</span>'}function m(t){return t>=80?"#22cc77":t>=60?"#c9a227":t>=40?"#f0c020":"#ff5b5b"}async function p(t){i?.cleanup(),i=q("smart-router");const{smartRouter:e}=await d(async()=>{const{smartRouter:s}=await import("./smart-router-OZLT_2JY.js");return{smartRouter:s}},__vite__mapDeps([0,1,2,3]),import.meta.url),R=await e.rankProviders(),f=await e.getRecommendations(),g=e.getOverride(),r=R[0],x=e.getAllProviders(),o=r?await e.getStats(r.provider):null,b=await Promise.all(x.map(async s=>({provider:s,stats:await e.getStats(s),score:await e.scoreProvider(s)})));b.sort((s,a)=>a.score.total-s.score.total),t.innerHTML=`
    <div class="ax-page ax-gs-268">
      <h1 class="ax-gs-365">🎯 Smart IA Router</h1>
      <p class="ax-gs-377">
        Sélection automatique du meilleur provider — latence (40%) · quota (30%) · qualité (20%) · uptime (10%).
      </p>

      ${g?`
        <div style="background:rgba(240,192,32,0.15);border:1px solid #c9a227;padding:10px 14px;border-radius:8px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:12px">
          <span>📌 <strong>Override admin actif</strong> : ${n(l[g]??"")} <strong>${n(g)}</strong> forcé pour tous les calls IA.</span>
          <button class="ax-btn ax-btn-sm" id="ax-sr-clear-override" style="background:#444;color:#fff">✕ Retirer override</button>
        </div>
      `:""}

      <!-- Best provider card -->
      ${r?`
        <div style="background:linear-gradient(135deg,rgba(34,204,119,0.15),rgba(20,20,35,0.5));padding:18px;border-radius:12px;border:2px solid ${m(r.score.total)};margin-bottom:18px">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:8px">
            <div>
              <div style="font-size:11px;color:var(--ax-text-dim);text-transform:uppercase;letter-spacing:1px">Best provider courant</div>
              <h2 style="margin:4px 0;color:#fff;font-size:24px">${l[r.provider]} ${n(r.provider)}</h2>
            </div>
            <div style="text-align:right">
              <div style="font-size:36px;font-weight:bold;color:${m(r.score.total)}">${r.score.total}<span style="font-size:16px;color:var(--ax-text-dim)">/100</span></div>
              <div class="ax-gs-2">${S(o)} ${o?w(o.last_ping_ts):"pas de ping"}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-top:12px">
            <div class="ax-gs-45">
              <div class="ax-gs-8">⚡ Latence (40%)</div>
              <div class="ax-gs-31">${r.score.latency_pts}pts</div>
              <div class="ax-gs-8">${o?v(o.latency_avg_ms):"—"} avg</div>
            </div>
            <div class="ax-gs-45">
              <div class="ax-gs-8">💰 Quota (30%)</div>
              <div class="ax-gs-31">${r.score.quota_pts}pts</div>
              <div class="ax-gs-8">${o?$(o.quota_remaining_pct):"—"}</div>
            </div>
            <div class="ax-gs-45">
              <div class="ax-gs-8">✅ Qualité (20%)</div>
              <div class="ax-gs-31">${r.score.quality_pts}pts</div>
              <div class="ax-gs-8">${o?Math.round(o.success_rate*100):0}% success</div>
            </div>
            <div class="ax-gs-45">
              <div class="ax-gs-8">📡 Uptime (10%)</div>
              <div class="ax-gs-31">${r.score.uptime_pts}pts</div>
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
            ${f.map(s=>`
              <li style="margin-bottom:4px">
                Bascule ${l[s.from]} <strong>${n(s.from)}</strong> → ${l[s.to]} <strong>${n(s.to)}</strong>
                <span class="ax-gs-14">économie ${s.savings_pct}%</span>
                <div class="ax-gs-2">${n(s.reason)}</div>
              </li>
            `).join("")}
          </ul>
        </div>
      `:""}

      <!-- Tableau tous providers -->
      <h2 style="margin:18px 0 8px;color:#c9a227;font-size:16px">Tous les providers (${x.length})</h2>
      <div class="ax-gs-78">
        <table class="ax-gs-434">
          <thead>
            <tr class="ax-gs-387">
              <th class="ax-gs-447">Status</th>
              <th class="ax-gs-447">Provider</th>
              <th class="ax-gs-448">Score</th>
              <th class="ax-gs-448">Latence avg</th>
              <th class="ax-gs-448">p95</th>
              <th class="ax-gs-448">Success</th>
              <th class="ax-gs-448">Quota</th>
              <th class="ax-gs-448">Coût/M</th>
              <th class="ax-gs-448">Last ping</th>
              <th style="padding:10px;text-align:center;font-size:11px;color:#c9a227">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${b.map(({provider:s,stats:a,score:u})=>`
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05)${s===r?.provider?";background:rgba(34,204,119,0.05)":""}">
                <td class="ax-gs-316">${S(a)}</td>
                <td class="ax-gs-436"><strong>${l[s]} ${n(s)}</strong></td>
                <td class="ax-gs-317">
                  <span style="color:${m(u.total)};font-weight:bold;font-size:14px">${u.total}</span>
                  <span style="color:var(--ax-text-dim);font-size:10px">/100</span>
                </td>
                <td class="ax-gs-449">${v(a?.latency_avg_ms??-1)}</td>
                <td class="ax-gs-450">${v(a?.latency_p95_ms??-1)}</td>
                <td class="ax-gs-449">${a?Math.round(a.success_rate*100):0}%</td>
                <td class="ax-gs-449">${$(a?.quota_remaining_pct??-1)}</td>
                <td class="ax-gs-450">$${e.getPricing(s)}</td>
                <td class="ax-gs-450">${a?w(a.last_ping_ts):"jamais"}</td>
                <td style="padding:10px;text-align:center">
                  <button class="ax-btn ax-btn-sm ax-sr-force" data-provider="${n(s)}" style="padding:4px 8px;font-size:10px;background:#c9a227;color:#000" title="Forcer ce provider">📌</button>
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
  `;const c=t.querySelector("#ax-sr-retest");c&&i&&i.bind(c,"click",()=>{(async()=>{const{toast:s}=await d(async()=>{const{toast:a}=await import("./toast-BCPNzfMv.js");return{toast:a}},[],import.meta.url);c.disabled=!0,c.textContent="⏳ Test en cours…",s.info("Ping de 10 providers en parallèle…");try{await e.pingAllProviders(),s.success("✅ Tous les providers re-testés"),await p(t)}catch(a){s.error("Erreur ping: "+(a instanceof Error?a.message:String(a))),c.disabled=!1,c.textContent="🔄 Re-tester tous maintenant"}})()});const y=t.querySelector("#ax-sr-refresh");y&&i&&i.bind(y,"click",()=>{p(t)});const _=t.querySelector("#ax-sr-reset");_&&i&&i.bind(_,"click",()=>{(async()=>{const{toast:s}=await d(async()=>{const{toast:a}=await import("./toast-BCPNzfMv.js");return{toast:a}},[],import.meta.url);typeof confirm=="function"&&!confirm("Reset toutes les stats Smart Router ? (samples + scores + override)")||(e.resetAll(),s.success("Stats reset"),await p(t))})()});const h=t.querySelector("#ax-sr-clear-override");h&&i&&i.bind(h,"click",()=>{(async()=>{const{toast:s}=await d(async()=>{const{toast:a}=await import("./toast-BCPNzfMv.js");return{toast:a}},[],import.meta.url);e.setOverride(null),s.success("Override retiré — auto-routing actif"),await p(t)})()}),t.querySelectorAll(".ax-sr-force").forEach(s=>{i.bind(s,"click",()=>{(async()=>{const a=s.dataset.provider;if(!a)return;const{toast:u}=await d(async()=>{const{toast:k}=await import("./toast-BCPNzfMv.js");return{toast:k}},[],import.meta.url);e.setOverride(a),u.success(`📌 ${a} forcé pour tous les calls`),await p(t)})()})}),P.info("feature-smart-router",`rendered ${x.length} providers, best=${r?.provider??"none"}`)}export{M as dispose,p as render};
