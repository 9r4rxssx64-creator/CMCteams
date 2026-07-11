import{a as h,e as n}from"./monitoring-DfV1jLgN.js";import{toast as b}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-DUElMJpr.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-CQguQfqL.js";import"./haptic-CQFg2PXZ.js";const c={action:"",actor:"",search:""};function w(t){const a=new Map,s=new Map;let i=1/0,d=0;for(const e of t)a.set(e.action,(a.get(e.action)??0)+1),s.set(e.actor,(s.get(e.actor)??0)+1),e.ts<i&&(i=e.ts),e.ts>d&&(d=e.ts);const p=[...a.entries()].map(([e,r])=>({action:e,count:r})).sort((e,r)=>r.count-e.count).slice(0,5),g=[...s.entries()].map(([e,r])=>({actor:e,count:r})).sort((e,r)=>r.count-e.count).slice(0,5);return{total:t.length,topActions:p,topActors:g,oldest_ts:i===1/0?null:i,newest_ts:d===0?null:d}}function $(t,a){return t.filter(s=>!(a.action&&!s.action.toLowerCase().includes(a.action.toLowerCase())||a.actor&&!s.actor.toLowerCase().includes(a.actor.toLowerCase())||a.search&&![s.target??"",JSON.stringify(s.details??{})].join(" ").toLowerCase().includes(a.search.toLowerCase())))}function v(t){return new Date(t).toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"medium"})}function S(t){const a=t.target?n(t.target):'<em style="opacity:0.5">—</em>',s=t.details?Object.keys(t.details).length:0,i=s>0?`<button class="ax-btn-glass" data-audit-details='${n(JSON.stringify(t.details??{}))}' style="font-size:10px;padding:2px 6px">${s} fields</button>`:"";return`
    <tr class="ax-gs-184">
      <td style="padding:6px 8px;font-family:monospace;font-size:11px;color:rgba(255,255,255,0.6)">${n(v(t.ts))}</td>
      <td style="padding:6px 8px;font-weight:600;color:#e8b830">${n(t.action)}</td>
      <td style="padding:6px 8px;color:rgba(255,255,255,0.85)">${n(t.actor)}</td>
      <td style="padding:6px 8px;font-size:12px">${a}</td>
      <td class="ax-gs-267">${i}</td>
    </tr>
  `}async function m(t){h.init();const a=h.getEntries(),s=$(a,c),i=w(a),d=`
    <div class="ax-gs-268">
      <h2 style="margin:0 0 16px;color:#e8b830;font-size:20px">🔒 Audit Log Viewer</h2>
      <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 16px">
        Toutes les actions sensibles (admin, vault, AI, settings) sont loggées avec chain hash tamper detection.
        ${i.total} entries total, ${s.length} affichées après filtres.
      </p>

      <div class="ax-card-elevated ax-gs-185">
        <h3 class="ax-gs-269">📊 Stats</h3>
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
            <div class="ax-gs-24">Plus ancien : ${i.oldest_ts?n(v(i.oldest_ts)):"—"}</div>
            <div class="ax-gs-24">Plus récent : ${i.newest_ts?n(v(i.newest_ts)):"—"}</div>
          </div>
        </div>
      </div>

      <div class="ax-card-elevated ax-gs-185">
        <h3 class="ax-gs-269">🔍 Filtres</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px">
          <input class="ax-input ax-gs-270" id="audit-filter-action" placeholder="Filtrer action…" value="${n(c.action)}">
          <input class="ax-input ax-gs-270" id="audit-filter-actor" placeholder="Filtrer actor…" value="${n(c.actor)}">
          <input class="ax-input ax-gs-270" id="audit-filter-search" placeholder="Recherche target/details…" value="${n(c.search)}">
          <button class="ax-btn-glass-gold" id="audit-filter-reset">Reset</button>
        </div>
      </div>

      <div class="ax-card-elevated" style="padding:0;overflow-x:auto">
        <table class="ax-gs-271">
          <thead>
            <tr style="background:rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.1)">
              <th class="ax-gs-272">Date</th>
              <th class="ax-gs-272">Action</th>
              <th class="ax-gs-272">Actor</th>
              <th class="ax-gs-272">Target</th>
              <th class="ax-gs-272">Details</th>
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
  `;t.innerHTML=d;const p=t.querySelector("#audit-filter-action"),g=t.querySelector("#audit-filter-actor"),e=t.querySelector("#audit-filter-search"),r=t.querySelector("#audit-filter-reset"),y=200;let x=null;const f=(o,l)=>{o&&o.addEventListener("input",()=>{x&&clearTimeout(x),x=setTimeout(()=>{c[l]=o.value,m(t)},y)})};f(p,"action"),f(g,"actor"),f(e,"search"),r?.addEventListener("click",()=>{c.action="",c.actor="",c.search="",m(t)}),t.querySelector("#audit-export-json")?.addEventListener("click",()=>{const o=new Blob([JSON.stringify(a,null,2)],{type:"application/json"}),l=URL.createObjectURL(o),u=document.createElement("a");u.href=l,u.download=`apex-audit-log-${new Date().toISOString().slice(0,10)}.json`,u.click(),URL.revokeObjectURL(l),b.success(`📥 Export OK : ${a.length} entries → JSON téléchargé`,{duration:4e3})}),t.querySelectorAll("[data-audit-details]").forEach(o=>{o.addEventListener("click",()=>{const l=o.getAttribute("data-audit-details")??"{}";try{const u=JSON.parse(l);alert(`Details :
`+JSON.stringify(u,null,2))}catch{alert("Details : "+l)}})})}export{m as render};
