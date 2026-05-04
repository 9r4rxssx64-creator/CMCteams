const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./sentinels-BYvZdmjO.js","../core/main-DB1q5Rz4.js","../assets/css/main-Bng3LWQS.css","./observability-88kl8g6Q.js"])))=>i.map(i=>d[i]);
import{_ as l,l as r}from"../core/main-DB1q5Rz4.js";async function n(a){const{sentinels:s}=await l(async()=>{const{sentinels:t}=await import("./sentinels-BYvZdmjO.js");return{sentinels:t}},__vite__mapDeps([0,1,2,3]),import.meta.url),e=s.list();a.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:800px;margin:0 auto">
      <h1 style="margin:0 0 16px;color:#c9a227">🛡 Sentinelles 24/7</h1>
      <p style="color:var(--ax-text-dim);margin:0 0 16px">${e.length} watchers actifs</p>
      <div style="display:grid;gap:8px">
        ${e.map(t=>`
          <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.2);border-radius:8px;padding:12px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <strong style="color:#c9a227">${t.name}</strong>
              <p style="margin:4px 0 0;font-size:12px;color:var(--ax-text-dim)">interval: ${t.intervalMs}ms · last: ${t.lastResult?(t.lastResult.ok?"✅":"⚠️")+" "+(t.lastResult.msg??""):"jamais"}</p>
            </div>
            <span style="font-size:11px;padding:4px 8px;border-radius:6px;background:${t.lastResult?.ok?"rgba(34,204,119,0.2)":"rgba(255,170,0,0.2)"};color:${t.lastResult?.ok?"#22cc77":"#ffaa00"}">
              ${t.lastResult?t.lastResult.ok?"OK":"WARN":"PENDING"}
            </span>
          </div>
        `).join("")}
      </div>
      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `,r.info("feature-sentinels",`rendered ${e.length} sentinels`)}export{n as render};
//# sourceMappingURL=index-DXhq0bSD.js.map
