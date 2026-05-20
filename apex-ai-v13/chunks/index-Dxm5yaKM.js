const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-BaxCKkKm.js","./monitoring-3uBGKGRH.js","./credential-patterns-CLzI061R.js"])))=>i.map(i=>d[i]);
import{_ as d}from"./apex-kb-BaxCKkKm.js";import{e as s}from"./escape-html-BlQj2yEF.js";import{c as v}from"./listener-cleanup-Y2rGGxxX.js";import{l as b}from"./monitoring-3uBGKGRH.js";import"./voice-CKlB4PWs.js";import"./credential-patterns-CLzI061R.js";let r=null;function R(){r?.cleanup(),r=null}const y={"ai-provider":"🤖 IA Provider","lib-npm":"📦 Lib npm","api-service":"🌐 API Service","browser-api":"🌍 Browser API","tts-stt":"🎙 TTS/STT",vision:"👁 Vision","image-gen":"🎨 Image Gen","video-gen":"🎬 Video Gen","vector-db":"🗄 Vector DB",auth:"🔐 Auth","mobile-framework":"📱 Mobile",bundler:"⚙ Bundler"};function h(i){const e=i.estimatedGain;if(!e)return"—";const n=[];return e.perf!==void 0&&n.push(`perf +${e.perf}%`),e.cost!==void 0&&n.push(`cost +${e.cost}%`),e.capabilities!==void 0&&n.push(`cap +${e.capabilities}%`),e.bundleSize!==void 0&&n.push(`bundle -${e.bundleSize}%`),n.join(", ")||"—"}function S(i){return{"upgrade-asap":'<span style="color:#22cc77">⚡ ASAP</span>',"upgrade-soon":'<span style="color:#f0c020">⏳ SOON</span>',monitor:'<span style="color:#888">👀 MONITOR</span>',skip:'<span style="color:#666">— SKIP</span>',"breaking-changes":'<span style="color:#ff5b5b">⚠ BREAKING</span>'}[i]}async function p(i){r?.cleanup(),r=v("innovation");const{innovationWatch:e}=await d(async()=>{const{innovationWatch:t}=await import("./innovation-watch-N21ViCwD.js");return{innovationWatch:t}},__vite__mapDeps([0,1,2]),import.meta.url),n=e.getStats(),c=e.getUpdates().filter(t=>(t.status??"pending")==="pending"),f=n.lastScan===0?"jamais":new Date(n.lastScan).toLocaleString("fr-FR"),l=new Map;for(const t of c){const a=l.get(t.category)??[];a.push(t),l.set(t.category,a)}i.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:1000px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">💡 Innovation Watch</h1>
      <p style="color:var(--ax-text-dim);margin:0 0 12px;font-size:14px">
        Veille technologique 24/7 — npm / IA providers / HuggingFace / GitHub.
      </p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:16px">
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">Dernier scan</div>
          <div style="font-size:13px;color:#fff">${s(f)}</div>
        </div>
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">Total détecté</div>
          <div style="font-size:18px;color:#c9a227">${n.totalUpdatesDetected}</div>
        </div>
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">7 derniers jours</div>
          <div style="font-size:18px;color:#22cc77">${n.lastWeek}</div>
        </div>
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">Auto-appliqués</div>
          <div style="font-size:18px;color:#22cc77">${n.appliedCount}</div>
        </div>
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">Skipped</div>
          <div style="font-size:18px;color:#888">${n.skippedCount}</div>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
        <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-inno-scan">🔄 Scanner maintenant</button>
        <button class="ax-btn ax-btn-secondary ax-btn-sm" id="ax-inno-refresh">↻ Rafraîchir</button>
        <button class="ax-btn ax-btn-secondary ax-btn-sm" id="ax-inno-reset">🗑 Reset historique</button>
      </div>

      ${c.length===0?'<p style="text-align:center;color:var(--ax-text-dim);padding:32px">Aucune update en attente. Lance un scan pour vérifier.</p>':[...l.entries()].map(([t,a])=>`
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
                  ${a.map(o=>`
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                      <td style="padding:8px;font-size:12px"><strong>${s(o.name)}</strong>${o.details?`<div style="font-size:10px;color:var(--ax-text-dim)">${s(o.details)}</div>`:""}</td>
                      <td style="padding:8px;font-size:11px;color:var(--ax-text-dim)">${s(o.currentVersion??"—")} → ${s(o.latestVersion??"—")}</td>
                      <td style="padding:8px;font-size:11px;color:#22cc77">${s(h(o))}</td>
                      <td style="padding:8px;font-size:11px">${S(o.recommendation)}</td>
                      <td style="padding:8px;text-align:right">
                        <button class="ax-btn ax-btn-sm ax-inno-apply" data-id="${s(o.id)}" style="padding:4px 8px;font-size:11px;background:#22cc77">Apply</button>
                        <button class="ax-btn ax-btn-sm ax-inno-skip" data-id="${s(o.id)}" style="padding:4px 8px;font-size:11px">Skip</button>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            `).join("")}
    </div>
  `;const u=i.querySelector("#ax-inno-scan");u&&r&&r.bind(u,"click",()=>{(async()=>{const{toast:t}=await d(async()=>{const{toast:a}=await import("./toast-CRdbcLoc.js");return{toast:a}},[],import.meta.url);t.info("Scan en cours…");try{const a=await e.runScan();t.success(`✅ ${a.summary}`),await p(i)}catch(a){t.error("Scan failed: "+(a instanceof Error?a.message:String(a)))}})()});const g=i.querySelector("#ax-inno-refresh");g&&r&&r.bind(g,"click",()=>{p(i)});const m=i.querySelector("#ax-inno-reset");m&&r&&r.bind(m,"click",()=>{(async()=>{const{toast:t}=await d(async()=>{const{toast:a}=await import("./toast-CRdbcLoc.js");return{toast:a}},[],import.meta.url);typeof confirm=="function"&&!confirm("Reset historique innovation watch ?")||(e.reset(),t.success("Historique réinitialisé"),await p(i))})()}),i.querySelectorAll(".ax-inno-apply").forEach(t=>{r.bind(t,"click",()=>{(async()=>{const a=t.dataset.id;if(!a)return;const{toast:o}=await d(async()=>{const{toast:x}=await import("./toast-CRdbcLoc.js");return{toast:x}},[],import.meta.url);e.markUpdate(a,"applied"),o.success("Marqué comme appliqué"),await p(i)})()})}),i.querySelectorAll(".ax-inno-skip").forEach(t=>{r.bind(t,"click",()=>{(async()=>{const a=t.dataset.id;if(!a)return;const{toast:o}=await d(async()=>{const{toast:x}=await import("./toast-CRdbcLoc.js");return{toast:x}},[],import.meta.url);e.markUpdate(a,"skipped"),o.info("Skippé"),await p(i)})()})}),b.info("feature-innovation",`rendered ${c.length} pending updates (${n.totalUpdatesDetected} total)`)}export{R as dispose,p as render};
