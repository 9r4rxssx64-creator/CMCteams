const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-D5vzxqdJ.js","./multi-source-analyze-DdqCfc-V.js","./credential-patterns-DUMYZEMu.js","./apex-kb-BTbqxy9i.js"])))=>i.map(i=>d[i]);
import{e as i,_ as f,l as M}from"./monitoring-D5vzxqdJ.js";import{m as b}from"./memory-D_yw6J2t.js";import{g as L}from"./apex-tools-dispatch-core-De3wOJn0.js";import{toast as p}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-DdqCfc-V.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-BTbqxy9i.js";import"./apex-tools-dispatch-skills-H5yyfRdD.js";import"./apex-tools-dispatch-data-CbfIuTT0.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-BDU5IXpe.js";import"./apex-tools-misc-CDlRgI9m.js";import"./apex-tools-registry-core-48oOK-KS.js";import"./apex-tools-registry-skills-x-mAWYry.js";import"./haptic-CQFg2PXZ.js";const S="kdmc_admin";function T(){try{const r=localStorage.getItem("apex_v13_user");return r?JSON.parse(r):null}catch{return null}}function h(r){if(!r)return"—";try{return new Date(r).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return"—"}}function x(r){if(!r)return"jamais";const t=Date.now()-r,e=t/36e5;return e<1?`${Math.floor(t/6e4)}min`:e<24?`${Math.floor(e)}h`:`${Math.floor(e/24)}j`}function G(r){const t=T(),e=t?.id===S,o=t?.name??"Anonyme";L("admin.kb",r,t?.id)&&(r.innerHTML=`
    <div class="ax-page ax-knowledge">
      <header class="ax-page-header">
        <h1>🧠 Mémoire long-terme</h1>
        <p class="ax-subtitle">Facts, lessons, docs synchronisés ${e?"· 👑 Admin (cross-user)":`· user ${i(o)}`}</p>
      </header>

      <div class="ax-actions" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
        <button id="btn-resync-docs" class="ax-btn ax-btn-primary">🔄 Force re-sync docs</button>
        <button id="btn-compress-mem" class="ax-btn ax-btn-warning">🗜️ Compress memory</button>
        <button id="btn-export-json" class="ax-btn ax-btn-outline">💾 Export JSON</button>
        <button id="btn-extract-test" class="ax-btn ax-btn-outline">🧪 Tester extraction</button>
      </div>

      <section class="ax-card" id="sec-my-facts">
        <h2>📚 Mes facts persistants</h2>
        <div id="my-facts-content"><em>Chargement…</em></div>
      </section>

      ${e?`
      <section class="ax-card" id="sec-cross-user">
        <h2>👑 Cross-user knowledge (admin)</h2>
        <div id="cross-user-content"><em>Chargement…</em></div>
      </section>
      `:""}

      <section class="ax-card" id="sec-lessons">
        <h2>📖 Lessons cross-app</h2>
        <div id="lessons-content"><em>Chargement…</em></div>
      </section>

      <section class="ax-card" id="sec-docs">
        <h2>📂 Docs sync status</h2>
        <div id="docs-content"><em>Chargement…</em></div>
      </section>

      <section class="ax-card" id="sec-audit">
        <h2>🔍 Memory audit log (sentinelle memory-watch)</h2>
        <div id="audit-content"><em>Chargement…</em></div>
      </section>
    </div>
  `,w(r,t,e),H(r,t,e))}async function w(r,t,e){await Promise.all([_(r,t),e?C(r):Promise.resolve(),D(r),v(r),E(r)])}async function _(r,t){const e=r.querySelector("#my-facts-content");if(e){if(!t){e.innerHTML="<em>Pas de user connecté.</em>";return}try{const{persistentMemory:o}=await f(async()=>{const{persistentMemory:s}=await import("./persistent-memory-store-DGUsRMZ_.js");return{persistentMemory:s}},__vite__mapDeps([0,1,2,3]),import.meta.url),l=(await o.list()).filter(s=>s.scope===t.id).sort((s,n)=>n.importance-s.importance);if(l.length===0){e.innerHTML="<em>Aucun fact mémorisé pour ton compte. Les facts seront extraits automatiquement de tes messages chat.</em>";return}const d=l.slice(0,100).map((s,n)=>`
      <tr data-fact-idx="${n}" style="cursor:pointer">
        <td><span class="ax-tag">${i(s.category)}</span></td>
        <td>${i(s.text)}</td>
        <td><span class="ax-importance" style="color:${s.importance>=80?"#ff6b6b":s.importance>=60?"#ffa94d":"#888"};">${s.importance}</span></td>
        <td><time>${x(s.ts)}</time></td>
      </tr>
    `).join("");e.innerHTML=`
      <p>${l.length} fact(s) mémorisé(s) (top 100 affichés) — clic ligne pour drilldown</p>
      <table class="ax-table ax-gs-394">
        <thead><tr><th>Catégorie</th><th>Fact</th><th>Importance</th><th>Âge</th></tr></thead>
        <tbody>${d}</tbody>
      </table>
    `,e.querySelectorAll("tr[data-fact-idx]").forEach(s=>{s.addEventListener("click",()=>{const n=Number(s.dataset.factIdx??"-1"),a=l[n];a&&(async()=>{const{drillDown:y}=await f(async()=>{const{drillDown:g}=await import("./drilldown-1SlvGToi.js");return{drillDown:g}},[],import.meta.url),m="ax-drilldown-mount-knowledge";let u=document.getElementById(m);u||(u=document.createElement("div"),u.id=m,document.body.appendChild(u)),y.open({id:`fact-${n}`,title:`🧠 Fact ${i(a.category)}`,content:()=>`
              <div class="ax-gs-27">
                <table class="ax-gs-291">
                  <tr><td class="ax-gs-367">Catégorie</td><td>${i(a.category)}</td></tr>
                  <tr><td class="ax-gs-367">Texte</td><td>${i(a.text)}</td></tr>
                  <tr><td class="ax-gs-367">Importance</td><td>${a.importance}/100</td></tr>
                  <tr><td class="ax-gs-367">Scope (user)</td><td><code>${i(a.scope??"global")}</code></td></tr>
                  <tr><td class="ax-gs-367">Source</td><td>${i(a.source??"—")}</td></tr>
                  <tr><td class="ax-gs-367">Créé</td><td>${h(a.ts)} (${x(a.ts)})</td></tr>
                </table>
              </div>
            `,data:{factIdx:n}},u)})()})})}catch(o){e.innerHTML=`<em class="ax-gs-233">Erreur chargement : ${i(String(o))}</em>`}}}async function C(r){const t=r.querySelector("#cross-user-content");if(t)try{const{persistentMemory:e}=await f(async()=>{const{persistentMemory:n}=await import("./persistent-memory-store-DGUsRMZ_.js");return{persistentMemory:n}},__vite__mapDeps([0,1,2,3]),import.meta.url),o=await e.list(),c=new Map;for(const n of o){const a=c.get(n.scope)??[];a.push(n),c.set(n.scope,a)}if(c.size===0){t.innerHTML="<em>Aucun user n'a encore de facts mémorisés.</em>";return}const l=[];for(const[n,a]of c){const y=a.sort((m,u)=>u.importance-m.importance).slice(0,3);l.push(`
        <details class="ax-user-block" style="margin-bottom:8px;border:1px solid #333;padding:8px;border-radius:4px;">
          <summary><strong>${i(n)}</strong> · ${a.length} fact(s)</summary>
          <ul style="margin-top:8px;font-size:0.9em;">
            ${y.map(m=>`<li>[${i(m.category)}/${m.importance}] ${i(m.text)}</li>`).join("")}
          </ul>
        </details>
      `)}t.textContent="";const d=document.createElement("p");d.textContent=`${c.size} user(s), ${o.length} fact(s) total`,t.append(d);const s=document.createElement("div");s.innerHTML=l.join(""),t.append(s)}catch(e){t.innerHTML=`<em class="ax-gs-233">Erreur : ${i(String(e))}</em>`}}async function D(r){const t=r.querySelector("#lessons-content");if(t)try{const e=localStorage.getItem("ax_lessons_learned_struct");if(!e){t.innerHTML="<em>Aucune lesson cross-app encore.</em>";return}const o=JSON.parse(e);if(o.length===0){t.innerHTML="<em>Liste vide.</em>";return}const l=[...o].sort((n,a)=>a.ts-n.ts).slice(0,30).map(n=>{const a=n.severity==="critical"?"#ff4444":n.severity==="warn"?"#ffa94d":"#888",y=n.resolved?"✅":"⏳";return`
        <li style="margin-bottom:8px;border-left:3px solid ${a};padding-left:8px;">
          ${y} <strong>${i(n.title)}</strong>
          <small style="color:#888;"> · ${i(n.category)} · ${i(n.src??"apex")} · ${x(n.ts)}</small>
          <div style="font-size:0.85em;color:#bbb;margin-top:4px;">${i(n.text)}</div>
        </li>
      `});t.textContent="";const d=document.createElement("p");d.textContent=`${o.length} lesson(s) (30 plus récentes affichées)`,t.append(d);const s=document.createElement("ul");s.style.cssText="list-style:none;padding:0;",s.innerHTML=l.join(""),t.append(s)}catch(e){t.innerHTML=`<em class="ax-gs-233">Erreur : ${i(String(e))}</em>`}}async function v(r){const t=r.querySelector("#docs-content");if(!t)return;const e=b.getDocsContext(),o=Object.keys(e);if(o.length===0){t.innerHTML='<em>Aucun doc synchronisé. Clique "Force re-sync docs" pour fetcher depuis GitHub.</em>';return}const c=o.map(l=>{const d=e[l];return d?`
      <tr>
        <td><strong>${i(l)}</strong></td>
        <td>${(d.size/1024).toFixed(1)} KB</td>
        <td>${x(d.ts)}</td>
        <td><time title="${h(d.ts)}">${h(d.ts)}</time></td>
      </tr>
    `:""}).join("");t.innerHTML=`
    <table class="ax-table ax-gs-394">
      <thead><tr><th>Doc</th><th>Taille</th><th>Âge</th><th>Last fetch</th></tr></thead>
      <tbody>${c}</tbody>
    </table>
  `}async function E(r){const t=r.querySelector("#audit-content");if(t)try{const e=localStorage.getItem("ax_memory_audit_log");if(!e){t.innerHTML="<em>Sentinelle memory-watch n'a pas encore tourné (1×/jour).</em>";return}const o=JSON.parse(e);if(o.length===0){t.innerHTML="<em>Log vide.</em>";return}const c=o[o.length-1];if(!c){t.innerHTML="<em>Log vide.</em>";return}t.innerHTML=`
      <p><strong>Dernier audit :</strong> ${h(c.ts)} (${x(c.ts)})</p>
      <ul>
        <li>Total facts : <strong>${c.total_facts}</strong></li>
        <li>Users : <strong>${c.users_count}</strong></li>
        <li>Lessons : <strong>${c.lessons_count}</strong></li>
        ${c.oversized_users.length>0?`<li style="color:#ffa94d;">Oversized : ${c.oversized_users.join(", ")}</li>`:'<li style="color:#5cb85c;">Aucun user oversized</li>'}
      </ul>
      <details><summary>Voir ${o.length} audits</summary>
        <ul style="font-size:0.85em;">
          ${o.slice(-10).reverse().map(l=>`<li>${h(l.ts)} : ${l.total_facts} facts, ${l.users_count} users, ${l.lessons_count} lessons</li>`).join("")}
        </ul>
      </details>
    `}catch(e){t.innerHTML=`<em class="ax-gs-233">Erreur : ${i(String(e))}</em>`}}function H(r,t,e){const o=r.querySelector("#btn-resync-docs");o?.addEventListener("click",async()=>{o.disabled=!0,o.textContent="⏳ Sync en cours…";try{const s=await b.syncDocsAtBoot({forceRefresh:!0});p.show(`✅ Docs sync : ${s.synced} OK · ${s.failed} fails`,"success"),await v(r)}catch(s){console.error("[knowledge] resync docs",s),p.show("Synchronisation des docs impossible — réessaie dans un instant","error")}finally{o.disabled=!1,o.textContent="🔄 Force re-sync docs"}});const c=r.querySelector("#btn-compress-mem");c?.addEventListener("click",async()=>{if(confirm("Compresser la mémoire ? Garde top 100 facts par importance par user, supprime le reste. Action irréversible.")){c.disabled=!0;try{const{sentinels:s}=await f(async()=>{const{sentinels:a}=await import("./sentinels-lj55Mac4.js");return{sentinels:a}},__vite__mapDeps([0,1,2,3]),import.meta.url),n=await s.runOne("memory-watch");p.show(`✅ ${n?.msg??"Done"}`,"success"),await w(r,t,e)}catch(s){console.error("[knowledge] compress memory",s),p.show("Compression de la mémoire impossible — réessaie plus tard","error")}finally{c.disabled=!1}}}),r.querySelector("#btn-export-json")?.addEventListener("click",async()=>{try{const{persistentMemory:s}=await f(async()=>{const{persistentMemory:g}=await import("./persistent-memory-store-DGUsRMZ_.js");return{persistentMemory:g}},__vite__mapDeps([0,1,2,3]),import.meta.url),n=await s.list(),a={ts:Date.now(),user_id:t?.id??"anonymous",is_admin:e,facts:e?n:n.filter(g=>g.scope===t?.id),lessons:JSON.parse(localStorage.getItem("ax_lessons_learned_struct")??"[]"),docs_meta:Object.fromEntries(Object.entries(b.getDocsContext()).map(([g,$])=>[g,{ts:$.ts,size:$.size}]))},y=new Blob([JSON.stringify(a,null,2)],{type:"application/json"}),m=URL.createObjectURL(y),u=document.createElement("a");u.href=m,u.download=`apex-memory-${new Date().toISOString().slice(0,10)}.json`,u.click(),URL.revokeObjectURL(m),p.show("💾 Export téléchargé","success")}catch(s){p.show(`❌ Export fail : ${String(s)}`,"error")}}),r.querySelector("#btn-extract-test")?.addEventListener("click",async()=>{const s=prompt(`Tape une phrase (ex: "j'habite Monaco et j'ai 35 ans, je suis allergique aux fruits de mer") :`,"");if(!(!s||!t))try{const n=await b.extractFactsFromMessage(s,t.id);p.show(`✅ ${n.extracted} fact(s) extrait(s)`,"success"),await _(r,t)}catch(n){p.show(`❌ Extract fail : ${String(n)}`,"error")}}),M.info("knowledge","render + handlers wired",{isAdmin:e,user:t?.id})}export{G as render};
