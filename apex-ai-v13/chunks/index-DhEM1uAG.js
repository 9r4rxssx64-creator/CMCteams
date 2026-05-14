const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-DXcTmB0A.js","./monitoring-3uBGKGRH.js","./credential-patterns-guxfirLX.js"])))=>i.map(i=>d[i]);
import{_ as g}from"./apex-kb-DXcTmB0A.js";import{l as M}from"./monitoring-3uBGKGRH.js";import{m as b}from"../core/main-5filfXHL.js";import{g as L}from"./apex-tools-dispatch-D_Sfbsk6.js";import{toast as u}from"./toast-ClsF1KRZ.js";import"./credential-patterns-guxfirLX.js";import"./multi-source-analyze-ClGK5Wdh.js";import"./apex-tools-registry-B410uZAb.js";import"./voice-f9fsCsL1.js";import"./haptic-CQFg2PXZ.js";const S="kdmc_admin";function c(s){return s.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}function T(){try{const s=localStorage.getItem("apex_v13_user");return s?JSON.parse(s):null}catch{return null}}function h(s){if(!s)return"—";try{return new Date(s).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return"—"}}function x(s){if(!s)return"jamais";const t=Date.now()-s,r=t/36e5;return r<1?`${Math.floor(t/6e4)}min`:r<24?`${Math.floor(r)}h`:`${Math.floor(r/24)}j`}function P(s){const t=T(),r=t?.id===S,n=t?.name??"Anonyme";L("admin.kb",s,t?.id)&&(s.innerHTML=`
    <div class="ax-page ax-knowledge">
      <header class="ax-page-header">
        <h1>🧠 Mémoire long-terme</h1>
        <p class="ax-subtitle">Facts, lessons, docs synchronisés ${r?"· 👑 Admin (cross-user)":`· user ${c(n)}`}</p>
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

      ${r?`
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
  `,w(s,t,r),C(s,t,r))}async function w(s,t,r){await Promise.all([v(s,t),r?D(s):Promise.resolve(),H(s),_(s),j(s)])}async function v(s,t){const r=s.querySelector("#my-facts-content");if(r){if(!t){r.innerHTML="<em>Pas de user connecté.</em>";return}try{const{persistentMemory:n}=await g(async()=>{const{persistentMemory:e}=await import("./persistent-memory-store-BQPJClJ5.js");return{persistentMemory:e}},__vite__mapDeps([0,1,2]),import.meta.url),d=(await n.list()).filter(e=>e.scope===t.id).sort((e,i)=>i.importance-e.importance);if(d.length===0){r.innerHTML="<em>Aucun fact mémorisé pour ton compte. Les facts seront extraits automatiquement de tes messages chat.</em>";return}const o=d.slice(0,100).map((e,i)=>`
      <tr data-fact-idx="${i}" style="cursor:pointer">
        <td><span class="ax-tag">${c(e.category)}</span></td>
        <td>${c(e.text)}</td>
        <td><span class="ax-importance" style="color:${e.importance>=80?"#ff6b6b":e.importance>=60?"#ffa94d":"#888"};">${e.importance}</span></td>
        <td><time>${x(e.ts)}</time></td>
      </tr>
    `).join("");r.innerHTML=`
      <p>${d.length} fact(s) mémorisé(s) (top 100 affichés) — clic ligne pour drilldown</p>
      <table class="ax-table" style="width:100%;font-size:0.9em;">
        <thead><tr><th>Catégorie</th><th>Fact</th><th>Importance</th><th>Âge</th></tr></thead>
        <tbody>${o}</tbody>
      </table>
    `,r.querySelectorAll("tr[data-fact-idx]").forEach(e=>{e.addEventListener("click",()=>{const i=Number(e.dataset.factIdx??"-1"),l=d[i];l&&(async()=>{const{drillDown:y}=await g(async()=>{const{drillDown:p}=await import("./drilldown-1SlvGToi.js");return{drillDown:p}},[],import.meta.url),f="ax-drilldown-mount-knowledge";let m=document.getElementById(f);m||(m=document.createElement("div"),m.id=f,document.body.appendChild(m)),y.open({id:`fact-${i}`,title:`🧠 Fact ${c(l.category)}`,content:()=>`
              <div style="padding:8px">
                <table style="width:100%;font-size:13px">
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Catégorie</td><td>${c(l.category)}</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Texte</td><td>${c(l.text)}</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Importance</td><td>${l.importance}/100</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Scope (user)</td><td><code>${c(l.scope??"global")}</code></td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Source</td><td>${c(l.source??"—")}</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Créé</td><td>${h(l.ts)} (${x(l.ts)})</td></tr>
                </table>
              </div>
            `,data:{factIdx:i}},m)})()})})}catch(n){r.innerHTML=`<em style="color:#c00;">Erreur chargement : ${c(String(n))}</em>`}}}async function D(s){const t=s.querySelector("#cross-user-content");if(t)try{const{persistentMemory:r}=await g(async()=>{const{persistentMemory:o}=await import("./persistent-memory-store-BQPJClJ5.js");return{persistentMemory:o}},__vite__mapDeps([0,1,2]),import.meta.url),n=await r.list(),a=new Map;for(const o of n){const e=a.get(o.scope)??[];e.push(o),a.set(o.scope,e)}if(a.size===0){t.innerHTML="<em>Aucun user n'a encore de facts mémorisés.</em>";return}const d=[];for(const[o,e]of a){const i=e.sort((l,y)=>y.importance-l.importance).slice(0,3);d.push(`
        <details class="ax-user-block" style="margin-bottom:8px;border:1px solid #333;padding:8px;border-radius:4px;">
          <summary><strong>${c(o)}</strong> · ${e.length} fact(s)</summary>
          <ul style="margin-top:8px;font-size:0.9em;">
            ${i.map(l=>`<li>[${c(l.category)}/${l.importance}] ${c(l.text)}</li>`).join("")}
          </ul>
        </details>
      `)}t.innerHTML=`<p>${a.size} user(s), ${n.length} fact(s) total</p>${d.join("")}`}catch(r){t.innerHTML=`<em style="color:#c00;">Erreur : ${c(String(r))}</em>`}}async function H(s){const t=s.querySelector("#lessons-content");if(t)try{const r=localStorage.getItem("ax_lessons_learned_struct");if(!r){t.innerHTML="<em>Aucune lesson cross-app encore.</em>";return}const n=JSON.parse(r);if(n.length===0){t.innerHTML="<em>Liste vide.</em>";return}const d=[...n].sort((o,e)=>e.ts-o.ts).slice(0,30).map(o=>{const e=o.severity==="critical"?"#ff4444":o.severity==="warn"?"#ffa94d":"#888",i=o.resolved?"✅":"⏳";return`
        <li style="margin-bottom:8px;border-left:3px solid ${e};padding-left:8px;">
          ${i} <strong>${c(o.title)}</strong>
          <small style="color:#888;"> · ${c(o.category)} · ${c(o.src??"apex")} · ${x(o.ts)}</small>
          <div style="font-size:0.85em;color:#bbb;margin-top:4px;">${c(o.text)}</div>
        </li>
      `});t.innerHTML=`<p>${n.length} lesson(s) (30 plus récentes affichées)</p><ul style="list-style:none;padding:0;">${d.join("")}</ul>`}catch(r){t.innerHTML=`<em style="color:#c00;">Erreur : ${c(String(r))}</em>`}}async function _(s){const t=s.querySelector("#docs-content");if(!t)return;const r=b.getDocsContext(),n=Object.keys(r);if(n.length===0){t.innerHTML='<em>Aucun doc synchronisé. Clique "Force re-sync docs" pour fetcher depuis GitHub.</em>';return}const a=n.map(d=>{const o=r[d];return o?`
      <tr>
        <td><strong>${c(d)}</strong></td>
        <td>${(o.size/1024).toFixed(1)} KB</td>
        <td>${x(o.ts)}</td>
        <td><time title="${h(o.ts)}">${h(o.ts)}</time></td>
      </tr>
    `:""}).join("");t.innerHTML=`
    <table class="ax-table" style="width:100%;font-size:0.9em;">
      <thead><tr><th>Doc</th><th>Taille</th><th>Âge</th><th>Last fetch</th></tr></thead>
      <tbody>${a}</tbody>
    </table>
  `}async function j(s){const t=s.querySelector("#audit-content");if(t)try{const r=localStorage.getItem("ax_memory_audit_log");if(!r){t.innerHTML="<em>Sentinelle memory-watch n'a pas encore tourné (1×/jour).</em>";return}const n=JSON.parse(r);if(n.length===0){t.innerHTML="<em>Log vide.</em>";return}const a=n[n.length-1];if(!a){t.innerHTML="<em>Log vide.</em>";return}t.innerHTML=`
      <p><strong>Dernier audit :</strong> ${h(a.ts)} (${x(a.ts)})</p>
      <ul>
        <li>Total facts : <strong>${a.total_facts}</strong></li>
        <li>Users : <strong>${a.users_count}</strong></li>
        <li>Lessons : <strong>${a.lessons_count}</strong></li>
        ${a.oversized_users.length>0?`<li style="color:#ffa94d;">Oversized : ${a.oversized_users.join(", ")}</li>`:'<li style="color:#5cb85c;">Aucun user oversized</li>'}
      </ul>
      <details><summary>Voir ${n.length} audits</summary>
        <ul style="font-size:0.85em;">
          ${n.slice(-10).reverse().map(d=>`<li>${h(d.ts)} : ${d.total_facts} facts, ${d.users_count} users, ${d.lessons_count} lessons</li>`).join("")}
        </ul>
      </details>
    `}catch(r){t.innerHTML=`<em style="color:#c00;">Erreur : ${c(String(r))}</em>`}}function C(s,t,r){const n=s.querySelector("#btn-resync-docs");n?.addEventListener("click",async()=>{n.disabled=!0,n.textContent="⏳ Sync en cours…";try{const e=await b.syncDocsAtBoot({forceRefresh:!0});u.show(`✅ Docs sync : ${e.synced} OK · ${e.failed} fails`,"success"),await _(s)}catch(e){u.show(`❌ Sync fail : ${String(e)}`,"error")}finally{n.disabled=!1,n.textContent="🔄 Force re-sync docs"}});const a=s.querySelector("#btn-compress-mem");a?.addEventListener("click",async()=>{if(confirm("Compresser la mémoire ? Garde top 100 facts par importance par user, supprime le reste. Action irréversible.")){a.disabled=!0;try{const{sentinels:e}=await g(async()=>{const{sentinels:l}=await import("./sentinels-DMRyAq3Y.js");return{sentinels:l}},__vite__mapDeps([0,1,2]),import.meta.url),i=await e.runOne("memory-watch");u.show(`✅ ${i?.msg??"Done"}`,"success"),await w(s,t,r)}catch(e){u.show(`❌ Compress fail : ${String(e)}`,"error")}finally{a.disabled=!1}}}),s.querySelector("#btn-export-json")?.addEventListener("click",async()=>{try{const{persistentMemory:e}=await g(async()=>{const{persistentMemory:p}=await import("./persistent-memory-store-BQPJClJ5.js");return{persistentMemory:p}},__vite__mapDeps([0,1,2]),import.meta.url),i=await e.list(),l={ts:Date.now(),user_id:t?.id??"anonymous",is_admin:r,facts:r?i:i.filter(p=>p.scope===t?.id),lessons:JSON.parse(localStorage.getItem("ax_lessons_learned_struct")??"[]"),docs_meta:Object.fromEntries(Object.entries(b.getDocsContext()).map(([p,$])=>[p,{ts:$.ts,size:$.size}]))},y=new Blob([JSON.stringify(l,null,2)],{type:"application/json"}),f=URL.createObjectURL(y),m=document.createElement("a");m.href=f,m.download=`apex-memory-${new Date().toISOString().slice(0,10)}.json`,m.click(),URL.revokeObjectURL(f),u.show("💾 Export téléchargé","success")}catch(e){u.show(`❌ Export fail : ${String(e)}`,"error")}}),s.querySelector("#btn-extract-test")?.addEventListener("click",async()=>{const e=prompt(`Tape une phrase (ex: "j'habite Monaco et j'ai 35 ans, je suis allergique aux fruits de mer") :`,"");if(!(!e||!t))try{const i=await b.extractFactsFromMessage(e,t.id);u.show(`✅ ${i.extracted} fact(s) extrait(s)`,"success"),await v(s,t)}catch(i){u.show(`❌ Extract fail : ${String(i)}`,"error")}}),M.info("knowledge","render + handlers wired",{isAdmin:r,user:t?.id})}export{P as render};
