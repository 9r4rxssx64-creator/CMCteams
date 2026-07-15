import{b as h,l as y,e as a}from"./monitoring-D5vzxqdJ.js";import{c as v}from"./listener-cleanup-Y2rGGxxX.js";import{m as x,s as f}from"./multi-source-analyze-DdqCfc-V.js";import{haptic as l}from"./haptic-CQFg2PXZ.js";import{toast as n}from"./toast-BCPNzfMv.js";import"./apex-kb-BTbqxy9i.js";import"./credential-patterns-DUMYZEMu.js";let p=null;function H(){p?.cleanup(),p=null}async function u(e){if(!(h.get("isAdmin")===!0)){e.innerHTML=`
      <div class="ax-gs-21">
        <h2 class="ax-gs-266">Accès admin uniquement</h2>
        <p>Multi-Source History — Kevin admin.</p>
      </div>
    `;return}p?.cleanup(),p=v("multi-source-history");const r=x.getHistory(),o=x.getStats(),c=f.listKnown();e.innerHTML=b(r,o,c.length),S(e,r),y.info("multi-source-history",`Render ${r.length} sources, ${o.items_total} items`)}function b(e,t,r){const o=t.items_total>0?Math.round(t.items_configured/t.items_total*100):0,c=t.items_configured>0?Math.round(t.items_tested_ok/t.items_configured*100):0;return`
    <div style="padding:20px;max-width:1100px;margin:0 auto;color:var(--ax-text,#eee)">
      <h2 style="color:#c9a227;margin-bottom:8px">🔍 Multi-Source Extraction History</h2>
      <p style="color:#999;font-size:13px;margin-bottom:24px">
        Analyse exhaustive des sources collées (image / texte / URL).
        1 source = N éléments (credentials + URLs + IPs + MACs + device IDs).
        Étude approfondie + test live + installation auto.
      </p>

      <!-- Stats cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:24px">
        ${d("📥 Sources",String(t.sources_total),"#c9a227")}
        ${d("🎯 Éléments",String(t.items_total),"#5c9eff")}
        ${d("✅ Configurés",`${t.items_configured} (${o}%)`,"#22cc77")}
        ${d("🟢 Testés OK",`${t.items_tested_ok} (${c}%)`,"#aaff77")}
        ${d("📚 Services étudiés",String(r),"#ff8855")}
      </div>

      <!-- Refresh / clear actions -->
      <div class="ax-gs-65">
        <button id="ax-msh-refresh" class="ax-btn ax-btn-sm ax-gs-366">🔄 Refresh</button>
        <button id="ax-msh-refresh-services" class="ax-btn ax-btn-sm ax-gs-366">📚 Re-étudier services</button>
        <button id="ax-msh-clear" class="ax-btn ax-btn-sm" style="padding:8px 14px;background:rgba(255,107,107,0.2);color:#ff6b6b">🗑️ Vider historique</button>
      </div>

      <!-- History list -->
      <div id="ax-msh-list">
        ${e.length===0?`<div style="padding:40px;text-align:center;color:#999;border:1px dashed #444;border-radius:8px">
               <p>Aucune source analysée pour le moment.</p>
               <p class="ax-gs-397">Colle une image / un texte avec credentials dans le chat → analyse multi-source automatique.</p>
             </div>`:e.map((s,i)=>$(s,i)).join("")}
      </div>
    </div>
  `}function d(e,t,r){return`
    <div style="background:rgba(255,255,255,0.04);border:1px solid ${r}33;border-radius:10px;padding:14px">
      <div style="font-size:12px;color:#999;margin-bottom:4px">${a(e)}</div>
      <div style="font-size:22px;font-weight:700;color:${r}">${a(t)}</div>
    </div>
  `}function $(e,t){const r=new Date(e.ts).toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"});return`
    <details style="background:rgba(255,255,255,0.03);border:1px solid #333;border-radius:8px;margin-bottom:10px;padding:12px">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span class="ax-gs-17">${{image:"🖼️",text:"📝",pdf:"📄",url:"🔗",note:"📌"}[e.source_type]??"❔"}</span>
        <span style="color:#c9a227;font-weight:600">${a(e.source_type.toUpperCase())}</span>
        <span style="color:#666;font-size:12px">${a(r)}</span>
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
          <strong>Aperçu source:</strong> <code style="background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px">${a(e.source_preview.slice(0,200))}</code>
        </div>
        ${e.errors.length>0?`
          <div style="background:rgba(255,107,107,0.1);border-left:3px solid #ff6b6b;padding:8px;margin-bottom:10px;font-size:12px">
            ⚠️ ${e.errors.length} erreur(s):<br>${e.errors.map(a).join("<br>")}
          </div>
        `:""}
        <table class="ax-gs-392">
          <thead>
            <tr style="background:rgba(0,0,0,0.3);text-align:left">
              <th class="ax-gs-267">Type</th>
              <th class="ax-gs-267">Service</th>
              <th class="ax-gs-267">Valeur (masquée)</th>
              <th class="ax-gs-267">Confiance</th>
              <th class="ax-gs-267">Test</th>
            </tr>
          </thead>
          <tbody>
            ${e.items.map(c=>_(c)).join("")}
          </tbody>
        </table>
        <div style="margin-top:10px;text-align:right">
          <button class="ax-btn ax-btn-sm ax-msh-reanalyze" data-idx="${t}" style="padding:6px 12px;font-size:12px">🔄 Re-analyser</button>
        </div>
      </div>
    </details>
  `}function _(e){const t={credential:"#c9a227",site:"#5c9eff",identifier:"#aaff77",address:"#ff8855",device_id:"#ff66cc",metadata:"#888"}[e.type],r=e.test_result?e.test_result.ok?`<span class="ax-gs-14">🟢 OK${e.test_result.latency_ms?` (${e.test_result.latency_ms}ms)`:""}</span>`:`<span class="ax-gs-236">🔴 ${a(e.test_result.error??"fail")}</span>`:'<span class="ax-gs-64">—</span>',o=e.forbidden?'<span style="color:#ff6b6b;font-size:10px;margin-left:4px;background:rgba(255,107,107,0.1);padding:2px 4px;border-radius:3px">🚫 FORBIDDEN</span>':"";return`
    <tr class="ax-gs-232">
      <td style="padding:6px 8px;color:${t};font-weight:600">${a(e.type)}</td>
      <td class="ax-gs-267">${a(e.service??"—")}${o}</td>
      <td style="padding:6px 8px;font-family:monospace;color:#aaa">${a(e.value.slice(0,32))}${e.value.length>32?"…":""}</td>
      <td class="ax-gs-267">${Math.round(e.confidence*100)}%</td>
      <td class="ax-gs-267">${r}</td>
    </tr>
  `}function S(e,t){e.querySelector("#ax-msh-refresh")?.addEventListener("click",()=>{l.tap(),u(e)}),e.querySelector("#ax-msh-refresh-services")?.addEventListener("click",()=>{l.tap(),(async()=>{n.info("🔄 Refresh services en cours...",{duration:3e3});try{const s=await f.refreshAll();n.success(`✅ ${s.refreshed} services rafraîchis`,{duration:5e3}),s.errors.length>0&&n.warn(`⚠️ ${s.errors.length} erreur(s)`,{duration:5e3}),u(e)}catch(s){const i=s instanceof Error?s.message:String(s);n.error(`Refresh fail : ${i}`,{duration:5e3})}})()}),e.querySelector("#ax-msh-clear")?.addEventListener("click",()=>{if(l.warning(),!!confirm("Vider tout l'historique multi-source ? (irréversible)"))try{localStorage.removeItem("ax_multi_source_history"),n.success("🗑️ Historique vidé",{duration:3e3}),u(e)}catch(s){const i=s instanceof Error?s.message:String(s);n.error(`Clear fail : ${i}`)}}),e.querySelectorAll(".ax-msh-reanalyze").forEach(s=>{s.addEventListener("click",()=>{l.tap();const i=parseInt(s.dataset.idx??"-1",10),g=t[i];if(!g){n.warn("Source non trouvée");return}n.info(`Re-analyse demandée pour source #${i} (${g.source_type})`,{duration:4e3}),x.installAll(g,{test:!0}).then(m=>{n.success(`✅ ${m.installed} installés · ${m.tested_ok} testés OK`,{duration:5e3}),u(e)})})})}export{H as dispose,u as render};
