import{e as n}from"./html-safe-CCp1QaJu.js";import{c as y}from"./listener-cleanup-Y2rGGxxX.js";import{l as h}from"./monitoring-3uBGKGRH.js";import{s as b}from"../core/main-CXKKxNES.js";import{m,s as g}from"./multi-source-analyze-CjgCUx08.js";import{haptic as c}from"./haptic-CQFg2PXZ.js";import{toast as o}from"./toast-ClsF1KRZ.js";import"./apex-kb-szdP_hDA.js";import"./credential-patterns-qcw7Brjr.js";let u=null;function M(){u?.cleanup(),u=null}async function p(e){if(!(b.get("isAdmin")===!0)){e.innerHTML=`
      <div style="padding:40px;text-align:center;color:#999">
        <h2 style="color:#c9a227">Accès admin uniquement</h2>
        <p>Multi-Source History — Kevin admin.</p>
      </div>
    `;return}u?.cleanup(),u=y("multi-source-history");const s=m.getHistory(),a=m.getStats(),d=g.listKnown();e.innerHTML=v(s,a,d.length),S(e,s),h.info("multi-source-history",`Render ${s.length} sources, ${a.items_total} items`)}function v(e,t,s){const a=t.items_total>0?Math.round(t.items_configured/t.items_total*100):0,d=t.items_configured>0?Math.round(t.items_tested_ok/t.items_configured*100):0;return`
    <div style="padding:20px;max-width:1100px;margin:0 auto;color:var(--ax-text,#eee)">
      <h2 style="color:#c9a227;margin-bottom:8px">🔍 Multi-Source Extraction History</h2>
      <p style="color:#999;font-size:13px;margin-bottom:24px">
        Analyse exhaustive des sources collées (image / texte / URL).
        1 source = N éléments (credentials + URLs + IPs + MACs + device IDs).
        Étude approfondie + test live + installation auto.
      </p>

      <!-- Stats cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:24px">
        ${l("📥 Sources",String(t.sources_total),"#c9a227")}
        ${l("🎯 Éléments",String(t.items_total),"#5c9eff")}
        ${l("✅ Configurés",`${t.items_configured} (${a}%)`,"#22cc77")}
        ${l("🟢 Testés OK",`${t.items_tested_ok} (${d}%)`,"#aaff77")}
        ${l("📚 Services étudiés",String(s),"#ff8855")}
      </div>

      <!-- Refresh / clear actions -->
      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
        <button id="ax-msh-refresh" class="ax-btn ax-btn-sm" style="padding:8px 14px">🔄 Refresh</button>
        <button id="ax-msh-refresh-services" class="ax-btn ax-btn-sm" style="padding:8px 14px">📚 Re-étudier services</button>
        <button id="ax-msh-clear" class="ax-btn ax-btn-sm" style="padding:8px 14px;background:rgba(255,107,107,0.2);color:#ff6b6b">🗑️ Vider historique</button>
      </div>

      <!-- History list -->
      <div id="ax-msh-list">
        ${e.length===0?`<div style="padding:40px;text-align:center;color:#999;border:1px dashed #444;border-radius:8px">
               <p>Aucune source analysée pour le moment.</p>
               <p style="font-size:12px;margin-top:8px">Colle une image / un texte avec credentials dans le chat → analyse multi-source automatique.</p>
             </div>`:e.map((r,i)=>$(r,i)).join("")}
      </div>
    </div>
  `}function l(e,t,s){return`
    <div style="background:rgba(255,255,255,0.04);border:1px solid ${s}33;border-radius:10px;padding:14px">
      <div style="font-size:12px;color:#999;margin-bottom:4px">${n(e)}</div>
      <div style="font-size:22px;font-weight:700;color:${s}">${n(t)}</div>
    </div>
  `}function $(e,t){const s=new Date(e.ts).toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"});return`
    <details style="background:rgba(255,255,255,0.03);border:1px solid #333;border-radius:8px;margin-bottom:10px;padding:12px">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span style="font-size:18px">${{image:"🖼️",text:"📝",pdf:"📄",url:"🔗",note:"📌"}[e.source_type]??"❔"}</span>
        <span style="color:#c9a227;font-weight:600">${n(e.source_type.toUpperCase())}</span>
        <span style="color:#666;font-size:12px">${n(s)}</span>
        <span style="margin-left:auto;font-size:13px;color:#aaa">
          ${e.extracted_count} extraits ·
          <span style="color:${e.configured_count===e.extracted_count?"#22cc77":"#ffaa00"}">
            ${e.configured_count} configurés
          </span> ·
          <span style="color:${e.tested_ok_count>0?"#22cc77":"#888"}">
            ${e.tested_ok_count}/${e.tested_count} testés OK
          </span>
        </span>
      </summary>
      <div style="margin-top:12px;padding-left:8px">
        <div style="font-size:12px;color:#666;margin-bottom:8px">
          <strong>Aperçu source:</strong> <code style="background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px">${n(e.source_preview.slice(0,200))}</code>
        </div>
        ${e.errors.length>0?`
          <div style="background:rgba(255,107,107,0.1);border-left:3px solid #ff6b6b;padding:8px;margin-bottom:10px;font-size:12px">
            ⚠️ ${e.errors.length} erreur(s):<br>${e.errors.map(n).join("<br>")}
          </div>
        `:""}
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:rgba(0,0,0,0.3);text-align:left">
              <th style="padding:6px 8px">Type</th>
              <th style="padding:6px 8px">Service</th>
              <th style="padding:6px 8px">Valeur (masquée)</th>
              <th style="padding:6px 8px">Confiance</th>
              <th style="padding:6px 8px">Test</th>
            </tr>
          </thead>
          <tbody>
            ${e.items.map(d=>_(d)).join("")}
          </tbody>
        </table>
        <div style="margin-top:10px;text-align:right">
          <button class="ax-btn ax-btn-sm ax-msh-reanalyze" data-idx="${t}" style="padding:6px 12px;font-size:12px">🔄 Re-analyser</button>
        </div>
      </div>
    </details>
  `}function _(e){const t={credential:"#c9a227",site:"#5c9eff",identifier:"#aaff77",address:"#ff8855",device_id:"#ff66cc",metadata:"#888"}[e.type],s=e.test_result?e.test_result.ok?`<span style="color:#22cc77">🟢 OK${e.test_result.latency_ms?` (${e.test_result.latency_ms}ms)`:""}</span>`:`<span style="color:#ff6b6b">🔴 ${n(e.test_result.error??"fail")}</span>`:'<span style="color:#666">—</span>',a=e.forbidden?'<span style="color:#ff6b6b;font-size:10px;margin-left:4px;background:rgba(255,107,107,0.1);padding:2px 4px;border-radius:3px">🚫 FORBIDDEN</span>':"";return`
    <tr style="border-bottom:1px solid #2a2a2a">
      <td style="padding:6px 8px;color:${t};font-weight:600">${n(e.type)}</td>
      <td style="padding:6px 8px">${n(e.service??"—")}${a}</td>
      <td style="padding:6px 8px;font-family:monospace;color:#aaa">${n(e.value.slice(0,32))}${e.value.length>32?"…":""}</td>
      <td style="padding:6px 8px">${Math.round(e.confidence*100)}%</td>
      <td style="padding:6px 8px">${s}</td>
    </tr>
  `}function S(e,t){e.querySelector("#ax-msh-refresh")?.addEventListener("click",()=>{c.tap(),p(e)}),e.querySelector("#ax-msh-refresh-services")?.addEventListener("click",()=>{c.tap(),(async()=>{o.info("🔄 Refresh services en cours...",{duration:3e3});try{const r=await g.refreshAll();o.success(`✅ ${r.refreshed} services rafraîchis`,{duration:5e3}),r.errors.length>0&&o.warn(`⚠️ ${r.errors.length} erreur(s)`,{duration:5e3}),p(e)}catch(r){const i=r instanceof Error?r.message:String(r);o.error(`Refresh fail : ${i}`,{duration:5e3})}})()}),e.querySelector("#ax-msh-clear")?.addEventListener("click",()=>{if(c.warning(),!!confirm("Vider tout l'historique multi-source ? (irréversible)"))try{localStorage.removeItem("ax_multi_source_history"),o.success("🗑️ Historique vidé",{duration:3e3}),p(e)}catch(r){const i=r instanceof Error?r.message:String(r);o.error(`Clear fail : ${i}`)}}),e.querySelectorAll(".ax-msh-reanalyze").forEach(r=>{r.addEventListener("click",()=>{c.tap();const i=parseInt(r.dataset.idx??"-1",10),x=t[i];if(!x){o.warn("Source non trouvée");return}o.info(`Re-analyse demandée pour source #${i} (${x.source_type})`,{duration:4e3}),m.installAll(x,{test:!0}).then(f=>{o.success(`✅ ${f.installed} installés · ${f.tested_ok} testés OK`,{duration:5e3}),p(e)})})})}export{M as dispose,p as render};
