const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./persistent-memory-store-CbSpdW4c.js","./apex-kb-CZDvauou.js","./monitoring-WiO5ZBU9.js","./apex-tools-registry-DPQHcZUW.js","./credential-patterns-DqicUg9o.js","./sentinels-DdvUT16b.js"])))=>i.map(i=>d[i]);
import{_ as y}from"./apex-kb-CZDvauou.js";import{l as v}from"./monitoring-WiO5ZBU9.js";import{m as p}from"../core/main-fj7ZXEwJ.js";import{toast as d}from"./toast-Dgg9rcIP.js";import"./apex-tools-registry-DPQHcZUW.js";import"./credential-patterns-DqicUg9o.js";import"./apex-tools-dispatch-CIybR1R1.js";import"./haptic-BUEqXK0N.js";const L="kdmc_admin";function c(s){return s.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}function S(){try{const s=localStorage.getItem("apex_v13_user");return s?JSON.parse(s):null}catch{return null}}function f(s){if(!s)return"—";try{return new Date(s).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return"—"}}function g(s){if(!s)return"jamais";const t=Date.now()-s,e=t/36e5;return e<1?`${Math.floor(t/6e4)}min`:e<24?`${Math.floor(e)}h`:`${Math.floor(e/24)}j`}function R(s){const t=S(),e=t?.id===L,n=t?.name??"Anonyme";s.innerHTML=`
    <div class="ax-page ax-knowledge">
      <header class="ax-page-header">
        <h1>🧠 Mémoire long-terme</h1>
        <p class="ax-subtitle">Facts, lessons, docs synchronisés ${e?"· 👑 Admin (cross-user)":`· user ${c(n)}`}</p>
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
  `,w(s,t,e),D(s,t,e)}async function w(s,t,e){await Promise.all([_(s,t),e?T(s):Promise.resolve(),H(s),M(s),j(s)])}async function _(s,t){const e=s.querySelector("#my-facts-content");if(e){if(!t){e.innerHTML="<em>Pas de user connecté.</em>";return}try{const{persistentMemory:n}=await y(async()=>{const{persistentMemory:r}=await import("./persistent-memory-store-CbSpdW4c.js");return{persistentMemory:r}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),i=(await n.list()).filter(r=>r.scope===t.id).sort((r,l)=>l.importance-r.importance);if(i.length===0){e.innerHTML="<em>Aucun fact mémorisé pour ton compte. Les facts seront extraits automatiquement de tes messages chat.</em>";return}const o=i.slice(0,100).map(r=>`
      <tr>
        <td><span class="ax-tag">${c(r.category)}</span></td>
        <td>${c(r.text)}</td>
        <td><span class="ax-importance" style="color:${r.importance>=80?"#ff6b6b":r.importance>=60?"#ffa94d":"#888"};">${r.importance}</span></td>
        <td><time>${g(r.ts)}</time></td>
      </tr>
    `).join("");e.innerHTML=`
      <p>${i.length} fact(s) mémorisé(s) (top 100 affichés)</p>
      <table class="ax-table" style="width:100%;font-size:0.9em;">
        <thead><tr><th>Catégorie</th><th>Fact</th><th>Importance</th><th>Âge</th></tr></thead>
        <tbody>${o}</tbody>
      </table>
    `}catch(n){e.innerHTML=`<em style="color:#c00;">Erreur chargement : ${c(String(n))}</em>`}}}async function T(s){const t=s.querySelector("#cross-user-content");if(t)try{const{persistentMemory:e}=await y(async()=>{const{persistentMemory:o}=await import("./persistent-memory-store-CbSpdW4c.js");return{persistentMemory:o}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),n=await e.list(),a=new Map;for(const o of n){const r=a.get(o.scope)??[];r.push(o),a.set(o.scope,r)}if(a.size===0){t.innerHTML="<em>Aucun user n'a encore de facts mémorisés.</em>";return}const i=[];for(const[o,r]of a){const l=r.sort((m,h)=>h.importance-m.importance).slice(0,3);i.push(`
        <details class="ax-user-block" style="margin-bottom:8px;border:1px solid #333;padding:8px;border-radius:4px;">
          <summary><strong>${c(o)}</strong> · ${r.length} fact(s)</summary>
          <ul style="margin-top:8px;font-size:0.9em;">
            ${l.map(m=>`<li>[${c(m.category)}/${m.importance}] ${c(m.text)}</li>`).join("")}
          </ul>
        </details>
      `)}t.innerHTML=`<p>${a.size} user(s), ${n.length} fact(s) total</p>${i.join("")}`}catch(e){t.innerHTML=`<em style="color:#c00;">Erreur : ${c(String(e))}</em>`}}async function H(s){const t=s.querySelector("#lessons-content");if(t)try{const e=localStorage.getItem("ax_lessons_learned_struct");if(!e){t.innerHTML="<em>Aucune lesson cross-app encore.</em>";return}const n=JSON.parse(e);if(n.length===0){t.innerHTML="<em>Liste vide.</em>";return}const i=[...n].sort((o,r)=>r.ts-o.ts).slice(0,30).map(o=>{const r=o.severity==="critical"?"#ff4444":o.severity==="warn"?"#ffa94d":"#888",l=o.resolved?"✅":"⏳";return`
        <li style="margin-bottom:8px;border-left:3px solid ${r};padding-left:8px;">
          ${l} <strong>${c(o.title)}</strong>
          <small style="color:#888;"> · ${c(o.category)} · ${c(o.src??"apex")} · ${g(o.ts)}</small>
          <div style="font-size:0.85em;color:#bbb;margin-top:4px;">${c(o.text)}</div>
        </li>
      `});t.innerHTML=`<p>${n.length} lesson(s) (30 plus récentes affichées)</p><ul style="list-style:none;padding:0;">${i.join("")}</ul>`}catch(e){t.innerHTML=`<em style="color:#c00;">Erreur : ${c(String(e))}</em>`}}async function M(s){const t=s.querySelector("#docs-content");if(!t)return;const e=p.getDocsContext(),n=Object.keys(e);if(n.length===0){t.innerHTML='<em>Aucun doc synchronisé. Clique "Force re-sync docs" pour fetcher depuis GitHub.</em>';return}const a=n.map(i=>{const o=e[i];return o?`
      <tr>
        <td><strong>${c(i)}</strong></td>
        <td>${(o.size/1024).toFixed(1)} KB</td>
        <td>${g(o.ts)}</td>
        <td><time title="${f(o.ts)}">${f(o.ts)}</time></td>
      </tr>
    `:""}).join("");t.innerHTML=`
    <table class="ax-table" style="width:100%;font-size:0.9em;">
      <thead><tr><th>Doc</th><th>Taille</th><th>Âge</th><th>Last fetch</th></tr></thead>
      <tbody>${a}</tbody>
    </table>
  `}async function j(s){const t=s.querySelector("#audit-content");if(t)try{const e=localStorage.getItem("ax_memory_audit_log");if(!e){t.innerHTML="<em>Sentinelle memory-watch n'a pas encore tourné (1×/jour).</em>";return}const n=JSON.parse(e);if(n.length===0){t.innerHTML="<em>Log vide.</em>";return}const a=n[n.length-1];if(!a){t.innerHTML="<em>Log vide.</em>";return}t.innerHTML=`
      <p><strong>Dernier audit :</strong> ${f(a.ts)} (${g(a.ts)})</p>
      <ul>
        <li>Total facts : <strong>${a.total_facts}</strong></li>
        <li>Users : <strong>${a.users_count}</strong></li>
        <li>Lessons : <strong>${a.lessons_count}</strong></li>
        ${a.oversized_users.length>0?`<li style="color:#ffa94d;">Oversized : ${a.oversized_users.join(", ")}</li>`:'<li style="color:#5cb85c;">Aucun user oversized</li>'}
      </ul>
      <details><summary>Voir ${n.length} audits</summary>
        <ul style="font-size:0.85em;">
          ${n.slice(-10).reverse().map(i=>`<li>${f(i.ts)} : ${i.total_facts} facts, ${i.users_count} users, ${i.lessons_count} lessons</li>`).join("")}
        </ul>
      </details>
    `}catch(e){t.innerHTML=`<em style="color:#c00;">Erreur : ${c(String(e))}</em>`}}function D(s,t,e){const n=s.querySelector("#btn-resync-docs");n?.addEventListener("click",async()=>{n.disabled=!0,n.textContent="⏳ Sync en cours…";try{const r=await p.syncDocsAtBoot({forceRefresh:!0});d.show(`✅ Docs sync : ${r.synced} OK · ${r.failed} fails`,"success"),await M(s)}catch(r){d.show(`❌ Sync fail : ${String(r)}`,"error")}finally{n.disabled=!1,n.textContent="🔄 Force re-sync docs"}});const a=s.querySelector("#btn-compress-mem");a?.addEventListener("click",async()=>{if(confirm("Compresser la mémoire ? Garde top 100 facts par importance par user, supprime le reste. Action irréversible.")){a.disabled=!0;try{const{sentinels:r}=await y(async()=>{const{sentinels:m}=await import("./sentinels-DdvUT16b.js");return{sentinels:m}},__vite__mapDeps([5,1,2,3,4]),import.meta.url),l=await r.runOne("memory-watch");d.show(`✅ ${l?.msg??"Done"}`,"success"),await w(s,t,e)}catch(r){d.show(`❌ Compress fail : ${String(r)}`,"error")}finally{a.disabled=!1}}}),s.querySelector("#btn-export-json")?.addEventListener("click",async()=>{try{const{persistentMemory:r}=await y(async()=>{const{persistentMemory:u}=await import("./persistent-memory-store-CbSpdW4c.js");return{persistentMemory:u}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),l=await r.list(),m={ts:Date.now(),user_id:t?.id??"anonymous",is_admin:e,facts:e?l:l.filter(u=>u.scope===t?.id),lessons:JSON.parse(localStorage.getItem("ax_lessons_learned_struct")??"[]"),docs_meta:Object.fromEntries(Object.entries(p.getDocsContext()).map(([u,$])=>[u,{ts:$.ts,size:$.size}]))},h=new Blob([JSON.stringify(m,null,2)],{type:"application/json"}),b=URL.createObjectURL(h),x=document.createElement("a");x.href=b,x.download=`apex-memory-${new Date().toISOString().slice(0,10)}.json`,x.click(),URL.revokeObjectURL(b),d.show("💾 Export téléchargé","success")}catch(r){d.show(`❌ Export fail : ${String(r)}`,"error")}}),s.querySelector("#btn-extract-test")?.addEventListener("click",async()=>{const r=prompt(`Tape une phrase (ex: "j'habite Monaco et j'ai 35 ans, je suis allergique aux fruits de mer") :`,"");if(!(!r||!t))try{const l=await p.extractFactsFromMessage(r,t.id);d.show(`✅ ${l.extracted} fact(s) extrait(s)`,"success"),await _(s,t)}catch(l){d.show(`❌ Extract fail : ${String(l)}`,"error")}}),v.info("knowledge","render + handlers wired",{isAdmin:e,user:t?.id})}export{R as render};
//# sourceMappingURL=index-Dp_vj-7B.js.map
