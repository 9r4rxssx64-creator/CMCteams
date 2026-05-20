import{e as n}from"./escape-html-BlQj2yEF.js";import{a as m}from"./monitoring-D2lWYrYo.js";import{toast as b}from"./toast-CRdbcLoc.js";import"./multi-source-analyze-Bg1HHfSC.js";import"./apex-kb-D1VtWFD9.js";import"./credential-patterns-CLzI061R.js";import"./haptic-CQFg2PXZ.js";const l={action:"",actor:"",search:""};function w(t){const a=new Map,s=new Map;let i=1/0,d=0;for(const e of t)a.set(e.action,(a.get(e.action)??0)+1),s.set(e.actor,(s.get(e.actor)??0)+1),e.ts<i&&(i=e.ts),e.ts>d&&(d=e.ts);const u=[...a.entries()].map(([e,r])=>({action:e,count:r})).sort((e,r)=>r.count-e.count).slice(0,5),x=[...s.entries()].map(([e,r])=>({actor:e,count:r})).sort((e,r)=>r.count-e.count).slice(0,5);return{total:t.length,topActions:u,topActors:x,oldest_ts:i===1/0?null:i,newest_ts:d===0?null:d}}function $(t,a){return t.filter(s=>!(a.action&&!s.action.toLowerCase().includes(a.action.toLowerCase())||a.actor&&!s.actor.toLowerCase().includes(a.actor.toLowerCase())||a.search&&![s.target??"",JSON.stringify(s.details??{})].join(" ").toLowerCase().includes(a.search.toLowerCase())))}function y(t){return new Date(t).toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"medium"})}function S(t){const a=t.target?n(t.target):'<em style="opacity:0.5">—</em>',s=t.details?Object.keys(t.details).length:0,i=s>0?`<button class="ax-btn-glass" data-audit-details='${n(JSON.stringify(t.details??{}))}' style="font-size:10px;padding:2px 6px">${s} fields</button>`:"";return`
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
      <td style="padding:6px 8px;font-family:monospace;font-size:11px;color:rgba(255,255,255,0.6)">${n(y(t.ts))}</td>
      <td style="padding:6px 8px;font-weight:600;color:#e8b830">${n(t.action)}</td>
      <td style="padding:6px 8px;color:rgba(255,255,255,0.85)">${n(t.actor)}</td>
      <td style="padding:6px 8px;font-size:12px">${a}</td>
      <td style="padding:6px 8px">${i}</td>
    </tr>
  `}async function h(t){m.init();const a=m.getEntries(),s=$(a,l),i=w(a),d=`
    <div style="padding:16px;max-width:1100px;margin:0 auto">
      <h2 style="margin:0 0 16px;color:#e8b830;font-size:20px">🔒 Audit Log Viewer</h2>
      <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 16px">
        Toutes les actions sensibles (admin, vault, AI, settings) sont loggées avec chain hash tamper detection.
        ${i.total} entries total, ${s.length} affichées après filtres.
      </p>

      <div class="ax-card-elevated" style="padding:14px;margin-bottom:16px">
        <h3 style="margin:0 0 10px;color:#fff;font-size:14px">📊 Stats</h3>
        <div class="ax-gs-89">
          <div>
            <div class="ax-gs-56">Top actions</div>
            ${i.topActions.map(o=>`<div class="ax-gs-24"><b>${n(o.action)}</b>: ${o.count}</div>`).join("")||"<em>—</em>"}
          </div>
          <div>
            <div class="ax-gs-56">Top actors</div>
            ${i.topActors.map(o=>`<div class="ax-gs-24"><b>${n(o.actor)}</b>: ${o.count}</div>`).join("")||"<em>—</em>"}
          </div>
          <div>
            <div class="ax-gs-56">Période</div>
            <div class="ax-gs-24">Plus ancien : ${i.oldest_ts?n(y(i.oldest_ts)):"—"}</div>
            <div class="ax-gs-24">Plus récent : ${i.newest_ts?n(y(i.newest_ts)):"—"}</div>
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
            ${s.length===0?'<tr><td colspan="5" style="padding:24px;text-align:center;color:rgba(255,255,255,0.5)">Aucune entrée matchant les filtres</td></tr>':s.slice(-100).reverse().map(S).join("")}
          </tbody>
        </table>
      </div>

      <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="ax-btn-glass-gold" id="audit-export-json">📥 Export JSON</button>
      </div>
    </div>
  `;t.innerHTML=d;const u=t.querySelector("#audit-filter-action"),x=t.querySelector("#audit-filter-actor"),e=t.querySelector("#audit-filter-search"),r=t.querySelector("#audit-filter-reset"),v=200;let g=null;const f=(o,c)=>{o&&o.addEventListener("input",()=>{g&&clearTimeout(g),g=setTimeout(()=>{l[c]=o.value,h(t)},v)})};f(u,"action"),f(x,"actor"),f(e,"search"),r?.addEventListener("click",()=>{l.action="",l.actor="",l.search="",h(t)}),t.querySelector("#audit-export-json")?.addEventListener("click",()=>{const o=new Blob([JSON.stringify(a,null,2)],{type:"application/json"}),c=URL.createObjectURL(o),p=document.createElement("a");p.href=c,p.download=`apex-audit-log-${new Date().toISOString().slice(0,10)}.json`,p.click(),URL.revokeObjectURL(c),b.success(`📥 Export OK : ${a.length} entries → JSON téléchargé`,{duration:4e3})}),t.querySelectorAll("[data-audit-details]").forEach(o=>{o.addEventListener("click",()=>{const c=o.getAttribute("data-audit-details")??"{}";try{const p=JSON.parse(c);alert(`Details :
`+JSON.stringify(p,null,2))}catch{alert("Details : "+c)}})})}export{h as render};
