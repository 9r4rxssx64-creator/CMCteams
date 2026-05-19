import{e as n}from"./escape-html-BlQj2yEF.js";import{a as m}from"./apex-kb-BL-mRJI7.js";import{toast as v}from"./toast-CRdbcLoc.js";import"./monitoring-3uBGKGRH.js";import"./credential-patterns-CLzI061R.js";import"./haptic-CQFg2PXZ.js";const l={action:"",actor:"",search:""};function w(t){const a=new Map,i=new Map;let o=1/0,d=0;for(const e of t)a.set(e.action,(a.get(e.action)??0)+1),i.set(e.actor,(i.get(e.actor)??0)+1),e.ts<o&&(o=e.ts),e.ts>d&&(d=e.ts);const x=[...a.entries()].map(([e,r])=>({action:e,count:r})).sort((e,r)=>r.count-e.count).slice(0,5),u=[...i.entries()].map(([e,r])=>({actor:e,count:r})).sort((e,r)=>r.count-e.count).slice(0,5);return{total:t.length,topActions:x,topActors:u,oldest_ts:o===1/0?null:o,newest_ts:d===0?null:d}}function z(t,a){return t.filter(i=>!(a.action&&!i.action.toLowerCase().includes(a.action.toLowerCase())||a.actor&&!i.actor.toLowerCase().includes(a.actor.toLowerCase())||a.search&&![i.target??"",JSON.stringify(i.details??{})].join(" ").toLowerCase().includes(a.search.toLowerCase())))}function y(t){return new Date(t).toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"medium"})}function $(t){const a=t.target?n(t.target):'<em style="opacity:0.5">—</em>',i=t.details?Object.keys(t.details).length:0,o=i>0?`<button class="ax-btn-glass" data-audit-details='${n(JSON.stringify(t.details??{}))}' style="font-size:10px;padding:2px 6px">${i} fields</button>`:"";return`
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
      <td style="padding:6px 8px;font-family:monospace;font-size:11px;color:rgba(255,255,255,0.6)">${n(y(t.ts))}</td>
      <td style="padding:6px 8px;font-weight:600;color:#e8b830">${n(t.action)}</td>
      <td style="padding:6px 8px;color:rgba(255,255,255,0.85)">${n(t.actor)}</td>
      <td style="padding:6px 8px;font-size:12px">${a}</td>
      <td style="padding:6px 8px">${o}</td>
    </tr>
  `}async function b(t){m.init();const a=m.getEntries(),i=z(a,l),o=w(a),d=`
    <div style="padding:16px;max-width:1100px;margin:0 auto">
      <h2 style="margin:0 0 16px;color:#e8b830;font-size:20px">🔒 Audit Log Viewer</h2>
      <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 16px">
        Toutes les actions sensibles (admin, vault, AI, settings) sont loggées avec chain hash tamper detection.
        ${o.total} entries total, ${i.length} affichées après filtres.
      </p>

      <div class="ax-card-elevated" style="padding:14px;margin-bottom:16px">
        <h3 style="margin:0 0 10px;color:#fff;font-size:14px">📊 Stats</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
          <div>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:4px">Top actions</div>
            ${o.topActions.map(s=>`<div style="font-size:12px"><b>${n(s.action)}</b>: ${s.count}</div>`).join("")||"<em>—</em>"}
          </div>
          <div>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:4px">Top actors</div>
            ${o.topActors.map(s=>`<div style="font-size:12px"><b>${n(s.actor)}</b>: ${s.count}</div>`).join("")||"<em>—</em>"}
          </div>
          <div>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:4px">Période</div>
            <div style="font-size:12px">Plus ancien : ${o.oldest_ts?n(y(o.oldest_ts)):"—"}</div>
            <div style="font-size:12px">Plus récent : ${o.newest_ts?n(y(o.newest_ts)):"—"}</div>
          </div>
        </div>
      </div>

      <div class="ax-card-elevated" style="padding:14px;margin-bottom:16px">
        <h3 style="margin:0 0 10px;color:#fff;font-size:14px">🔍 Filtres</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px">
          <input class="ax-input" id="audit-filter-action" placeholder="Filtrer action…" value="${n(l.action)}" style="font-size:12px">
          <input class="ax-input" id="audit-filter-actor" placeholder="Filtrer actor…" value="${n(l.actor)}" style="font-size:12px">
          <input class="ax-input" id="audit-filter-search" placeholder="Recherche target/details…" value="${n(l.search)}" style="font-size:12px">
          <button class="ax-btn-glass-gold" id="audit-filter-reset">Reset</button>
        </div>
      </div>

      <div class="ax-card-elevated" style="padding:0;overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="background:rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.1)">
              <th style="text-align:left;padding:8px 8px;font-size:11px;color:rgba(255,255,255,0.7)">Date</th>
              <th style="text-align:left;padding:8px 8px;font-size:11px;color:rgba(255,255,255,0.7)">Action</th>
              <th style="text-align:left;padding:8px 8px;font-size:11px;color:rgba(255,255,255,0.7)">Actor</th>
              <th style="text-align:left;padding:8px 8px;font-size:11px;color:rgba(255,255,255,0.7)">Target</th>
              <th style="text-align:left;padding:8px 8px;font-size:11px;color:rgba(255,255,255,0.7)">Details</th>
            </tr>
          </thead>
          <tbody>
            ${i.length===0?'<tr><td colspan="5" style="padding:24px;text-align:center;color:rgba(255,255,255,0.5)">Aucune entrée matchant les filtres</td></tr>':i.slice(-100).reverse().map($).join("")}
          </tbody>
        </table>
      </div>

      <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="ax-btn-glass-gold" id="audit-export-json">📥 Export JSON</button>
      </div>
    </div>
  `;t.innerHTML=d;const x=t.querySelector("#audit-filter-action"),u=t.querySelector("#audit-filter-actor"),e=t.querySelector("#audit-filter-search"),r=t.querySelector("#audit-filter-reset"),h=200;let g=null;const f=(s,c)=>{s&&s.addEventListener("input",()=>{g&&clearTimeout(g),g=setTimeout(()=>{l[c]=s.value,b(t)},h)})};f(x,"action"),f(u,"actor"),f(e,"search"),r?.addEventListener("click",()=>{l.action="",l.actor="",l.search="",b(t)}),t.querySelector("#audit-export-json")?.addEventListener("click",()=>{const s=new Blob([JSON.stringify(a,null,2)],{type:"application/json"}),c=URL.createObjectURL(s),p=document.createElement("a");p.href=c,p.download=`apex-audit-log-${new Date().toISOString().slice(0,10)}.json`,p.click(),URL.revokeObjectURL(c),v.success(`📥 Export OK : ${a.length} entries → JSON téléchargé`,{duration:4e3})}),t.querySelectorAll("[data-audit-details]").forEach(s=>{s.addEventListener("click",()=>{const c=s.getAttribute("data-audit-details")??"{}";try{const p=JSON.parse(c);alert(`Details :
`+JSON.stringify(p,null,2))}catch{alert("Details : "+c)}})})}export{b as render};
