const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-D1VtWFD9.js","./monitoring-D2lWYrYo.js","./multi-source-analyze-Bg1HHfSC.js","./credential-patterns-CLzI061R.js"])))=>i.map(i=>d[i]);
import{_ as c}from"./apex-kb-D1VtWFD9.js";import{e as r}from"./escape-html-BlQj2yEF.js";import{c as f}from"./listener-cleanup-Y2rGGxxX.js";import{l as b}from"./monitoring-D2lWYrYo.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-Bg1HHfSC.js";let o=null;function R(){o?.cleanup(),o=null}const y={"ai-provider":"🤖 IA Provider","lib-npm":"📦 Lib npm","api-service":"🌐 API Service","browser-api":"🌍 Browser API","tts-stt":"🎙 TTS/STT",vision:"👁 Vision","image-gen":"🎨 Image Gen","video-gen":"🎬 Video Gen","vector-db":"🗄 Vector DB",auth:"🔐 Auth","mobile-framework":"📱 Mobile",bundler:"⚙ Bundler"};function h(n){const i=n.estimatedGain;if(!i)return"—";const e=[];return i.perf!==void 0&&e.push(`perf +${i.perf}%`),i.cost!==void 0&&e.push(`cost +${i.cost}%`),i.capabilities!==void 0&&e.push(`cap +${i.capabilities}%`),i.bundleSize!==void 0&&e.push(`bundle -${i.bundleSize}%`),e.join(", ")||"—"}function S(n){return{"upgrade-asap":'<span class="ax-gs-14">⚡ ASAP</span>',"upgrade-soon":'<span class="ax-gs-44">⏳ SOON</span>',monitor:'<span class="ax-gs-25">👀 MONITOR</span>',skip:'<span class="ax-gs-64">— SKIP</span>',"breaking-changes":'<span class="ax-gs-13">⚠ BREAKING</span>'}[n]}async function d(n){o?.cleanup(),o=f("innovation");const{innovationWatch:i}=await c(async()=>{const{innovationWatch:t}=await import("./innovation-watch-foHp_db1.js");return{innovationWatch:t}},__vite__mapDeps([0,1,2,3]),import.meta.url),e=i.getStats(),p=i.getUpdates().filter(t=>(t.status??"pending")==="pending"),v=e.lastScan===0?"jamais":new Date(e.lastScan).toLocaleString("fr-FR"),l=new Map;for(const t of p){const a=l.get(t.category)??[];a.push(t),l.set(t.category,a)}n.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:1000px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">💡 Innovation Watch</h1>
      <p style="color:var(--ax-text-dim);margin:0 0 12px;font-size:14px">
        Veille technologique 24/7 — npm / IA providers / HuggingFace / GitHub.
      </p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:16px">
        <div class="ax-gs-9">
          <div class="ax-gs-2">Dernier scan</div>
          <div class="ax-gs-31">${r(v)}</div>
        </div>
        <div class="ax-gs-9">
          <div class="ax-gs-2">Total détecté</div>
          <div style="font-size:18px;color:#c9a227">${e.totalUpdatesDetected}</div>
        </div>
        <div class="ax-gs-9">
          <div class="ax-gs-2">7 derniers jours</div>
          <div class="ax-gs-137">${e.lastWeek}</div>
        </div>
        <div class="ax-gs-9">
          <div class="ax-gs-2">Auto-appliqués</div>
          <div class="ax-gs-137">${e.appliedCount}</div>
        </div>
        <div class="ax-gs-9">
          <div class="ax-gs-2">Skipped</div>
          <div style="font-size:18px;color:#888">${e.skippedCount}</div>
        </div>
      </div>

      <div class="ax-gs-65">
        <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-inno-scan">🔄 Scanner maintenant</button>
        <button class="ax-btn ax-btn-secondary ax-btn-sm" id="ax-inno-refresh">↻ Rafraîchir</button>
        <button class="ax-btn ax-btn-secondary ax-btn-sm" id="ax-inno-reset">🗑 Reset historique</button>
      </div>

      ${p.length===0?'<p style="text-align:center;color:var(--ax-text-dim);padding:32px">Aucune update en attente. Lance un scan pour vérifier.</p>':[...l.entries()].map(([t,a])=>`
              <h2 style="margin:24px 0 8px;color:#c9a227;font-size:16px">${y[t]} (${a.length})</h2>
              <table style="width:100%;border-collapse:collapse;background:rgba(20,20,35,0.5);border-radius:12px;overflow:hidden;margin-bottom:8px">
                <thead>
                  <tr style="background:rgba(201,162,39,0.1)">
                    <th style="padding:8px;text-align:left;font-size:11px;color:#c9a227">Nom</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#c9a227">Versions</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#c9a227">Gain</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#c9a227">Reco</th>
                    <th style="padding:8px;text-align:right;font-size:11px;color:#c9a227">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${a.map(s=>`
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                      <td style="padding:8px;font-size:12px"><strong>${r(s.name)}</strong>${s.details?`<div class="ax-gs-8">${r(s.details)}</div>`:""}</td>
                      <td style="padding:8px;font-size:11px;color:var(--ax-text-dim)">${r(s.currentVersion??"—")} → ${r(s.latestVersion??"—")}</td>
                      <td style="padding:8px;font-size:11px;color:#22cc77">${r(h(s))}</td>
                      <td style="padding:8px;font-size:11px">${S(s.recommendation)}</td>
                      <td style="padding:8px;text-align:right">
                        <button class="ax-btn ax-btn-sm ax-inno-apply" data-id="${r(s.id)}" style="padding:4px 8px;font-size:11px;background:#22cc77">Apply</button>
                        <button class="ax-btn ax-btn-sm ax-inno-skip" data-id="${r(s.id)}" style="padding:4px 8px;font-size:11px">Skip</button>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            `).join("")}
    </div>
  `;const g=n.querySelector("#ax-inno-scan");g&&o&&o.bind(g,"click",()=>{(async()=>{const{toast:t}=await c(async()=>{const{toast:a}=await import("./toast-CRdbcLoc.js");return{toast:a}},[],import.meta.url);t.info("Scan en cours…");try{const a=await i.runScan();t.success(`✅ ${a.summary}`),await d(n)}catch(a){t.error("Scan failed: "+(a instanceof Error?a.message:String(a)))}})()});const u=n.querySelector("#ax-inno-refresh");u&&o&&o.bind(u,"click",()=>{d(n)});const m=n.querySelector("#ax-inno-reset");m&&o&&o.bind(m,"click",()=>{(async()=>{const{toast:t}=await c(async()=>{const{toast:a}=await import("./toast-CRdbcLoc.js");return{toast:a}},[],import.meta.url);typeof confirm=="function"&&!confirm("Reset historique innovation watch ?")||(i.reset(),t.success("Historique réinitialisé"),await d(n))})()}),n.querySelectorAll(".ax-inno-apply").forEach(t=>{o.bind(t,"click",()=>{(async()=>{const a=t.dataset.id;if(!a)return;const{toast:s}=await c(async()=>{const{toast:x}=await import("./toast-CRdbcLoc.js");return{toast:x}},[],import.meta.url);i.markUpdate(a,"applied"),s.success("Marqué comme appliqué"),await d(n)})()})}),n.querySelectorAll(".ax-inno-skip").forEach(t=>{o.bind(t,"click",()=>{(async()=>{const a=t.dataset.id;if(!a)return;const{toast:s}=await c(async()=>{const{toast:x}=await import("./toast-CRdbcLoc.js");return{toast:x}},[],import.meta.url);i.markUpdate(a,"skipped"),s.info("Skippé"),await d(n)})()})}),b.info("feature-innovation",`rendered ${p.length} pending updates (${e.totalUpdatesDetected} total)`)}export{R as dispose,d as render};
