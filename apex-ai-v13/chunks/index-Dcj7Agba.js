const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-CXcraAs2.js","./multi-source-analyze-umEgTQRh.js","./credential-patterns-DUMYZEMu.js","./apex-kb-BpE4KfvW.js"])))=>i.map(i=>d[i]);
import{_ as c,e as r,l as f}from"./monitoring-CXcraAs2.js";import{c as b}from"./listener-cleanup-Y2rGGxxX.js";import"./multi-source-analyze-umEgTQRh.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-BpE4KfvW.js";let o=null;function R(){o?.cleanup(),o=null}const h={"ai-provider":"🤖 IA Provider","lib-npm":"📦 Lib npm","api-service":"🌐 API Service","browser-api":"🌍 Browser API","tts-stt":"🎙 TTS/STT",vision:"👁 Vision","image-gen":"🎨 Image Gen","video-gen":"🎬 Video Gen","vector-db":"🗄 Vector DB",auth:"🔐 Auth","mobile-framework":"📱 Mobile",bundler:"⚙ Bundler"};function y(i){const s=i.estimatedGain;if(!s)return"—";const n=[];return s.perf!==void 0&&n.push(`perf +${s.perf}%`),s.cost!==void 0&&n.push(`cost +${s.cost}%`),s.capabilities!==void 0&&n.push(`cap +${s.capabilities}%`),s.bundleSize!==void 0&&n.push(`bundle -${s.bundleSize}%`),n.join(", ")||"—"}function S(i){return{"upgrade-asap":'<span class="ax-gs-14">⚡ ASAP</span>',"upgrade-soon":'<span class="ax-gs-44">⏳ SOON</span>',monitor:'<span class="ax-gs-25">👀 MONITOR</span>',skip:'<span class="ax-gs-64">— SKIP</span>',"breaking-changes":'<span class="ax-gs-13">⚠ BREAKING</span>'}[i]}async function d(i){o?.cleanup(),o=b("innovation");const{innovationWatch:s}=await c(async()=>{const{innovationWatch:a}=await import("./innovation-watch-dd6f6iXk.js");return{innovationWatch:a}},__vite__mapDeps([0,1,2,3]),import.meta.url),n=s.getStats(),p=s.getUpdates().filter(a=>(a.status??"pending")==="pending"),m=n.lastScan===0?"jamais":new Date(n.lastScan).toLocaleString("fr-FR"),l=new Map;for(const a of p){const t=l.get(a.category)??[];t.push(a),l.set(a.category,t)}i.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:1000px;margin:0 auto">
      <h1 class="ax-gs-365">💡 Innovation Watch</h1>
      <p class="ax-gs-385">
        Veille technologique 24/7 — npm / IA providers / HuggingFace / GitHub.
      </p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:16px">
        <div class="ax-gs-9">
          <div class="ax-gs-2">Dernier scan</div>
          <div class="ax-gs-31">${r(m)}</div>
        </div>
        <div class="ax-gs-9">
          <div class="ax-gs-2">Total détecté</div>
          <div style="font-size:18px;color:#c9a227">${n.totalUpdatesDetected}</div>
        </div>
        <div class="ax-gs-9">
          <div class="ax-gs-2">7 derniers jours</div>
          <div class="ax-gs-137">${n.lastWeek}</div>
        </div>
        <div class="ax-gs-9">
          <div class="ax-gs-2">Auto-appliqués</div>
          <div class="ax-gs-137">${n.appliedCount}</div>
        </div>
        <div class="ax-gs-9">
          <div class="ax-gs-2">Skipped</div>
          <div style="font-size:18px;color:#888">${n.skippedCount}</div>
        </div>
      </div>

      <div class="ax-gs-65">
        <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-inno-scan">🔄 Scanner maintenant</button>
        <button class="ax-btn ax-btn-secondary ax-btn-sm" id="ax-inno-refresh">↻ Rafraîchir</button>
        <button class="ax-btn ax-btn-secondary ax-btn-sm" id="ax-inno-reset">🗑 Reset historique</button>
      </div>

      ${p.length===0?'<p class="ax-gs-231">Aucune update en attente. Lance un scan pour vérifier.</p>':[...l.entries()].map(([a,t])=>`
              <h2 class="ax-gs-386">${h[a]} (${t.length})</h2>
              <table style="width:100%;border-collapse:collapse;background:rgba(20,20,35,0.5);border-radius:12px;overflow:hidden;margin-bottom:8px">
                <thead>
                  <tr class="ax-gs-387">
                    <th class="ax-gs-388">Nom</th>
                    <th class="ax-gs-388">Versions</th>
                    <th class="ax-gs-388">Gain</th>
                    <th class="ax-gs-388">Reco</th>
                    <th style="padding:8px;text-align:right;font-size:11px;color:#c9a227">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${t.map(e=>`
                    <tr class="ax-gs-184">
                      <td style="padding:8px;font-size:12px"><strong>${r(e.name)}</strong>${e.details?`<div class="ax-gs-8">${r(e.details)}</div>`:""}</td>
                      <td style="padding:8px;font-size:11px;color:var(--ax-text-dim)">${r(e.currentVersion??"—")} → ${r(e.latestVersion??"—")}</td>
                      <td style="padding:8px;font-size:11px;color:#22cc77">${r(y(e))}</td>
                      <td style="padding:8px;font-size:11px">${S(e.recommendation)}</td>
                      <td style="padding:8px;text-align:right">
                        <button class="ax-btn ax-btn-sm ax-inno-apply" data-id="${r(e.id)}" style="padding:4px 8px;font-size:11px;background:#22cc77">Apply</button>
                        <button class="ax-btn ax-btn-sm ax-inno-skip ax-gs-389" data-id="${r(e.id)}">Skip</button>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            `).join("")}
    </div>
  `;const g=i.querySelector("#ax-inno-scan");g&&o&&o.bind(g,"click",()=>{(async()=>{const{toast:a}=await c(async()=>{const{toast:t}=await import("./toast-BCPNzfMv.js");return{toast:t}},[],import.meta.url);a.info("Scan en cours…");try{const t=await s.runScan();a.success(`✅ ${t.summary}`),await d(i)}catch(t){a.error("Scan failed: "+(t instanceof Error?t.message:String(t)))}})()});const x=i.querySelector("#ax-inno-refresh");x&&o&&o.bind(x,"click",()=>{d(i)});const v=i.querySelector("#ax-inno-reset");v&&o&&o.bind(v,"click",()=>{(async()=>{const{toast:a}=await c(async()=>{const{toast:t}=await import("./toast-BCPNzfMv.js");return{toast:t}},[],import.meta.url);typeof confirm=="function"&&!confirm("Reset historique innovation watch ?")||(s.reset(),a.success("Historique réinitialisé"),await d(i))})()}),i.querySelectorAll(".ax-inno-apply").forEach(a=>{o.bind(a,"click",()=>{(async()=>{const t=a.dataset.id;if(!t)return;const{toast:e}=await c(async()=>{const{toast:u}=await import("./toast-BCPNzfMv.js");return{toast:u}},[],import.meta.url);s.markUpdate(t,"applied"),e.success("Marqué comme appliqué"),await d(i)})()})}),i.querySelectorAll(".ax-inno-skip").forEach(a=>{o.bind(a,"click",()=>{(async()=>{const t=a.dataset.id;if(!t)return;const{toast:e}=await c(async()=>{const{toast:u}=await import("./toast-BCPNzfMv.js");return{toast:u}},[],import.meta.url);s.markUpdate(t,"skipped"),e.info("Skippé"),await d(i)})()})}),f.info("feature-innovation",`rendered ${p.length} pending updates (${n.totalUpdatesDetected} total)`)}export{R as dispose,d as render};
