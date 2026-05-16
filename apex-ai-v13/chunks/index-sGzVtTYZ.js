const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-DeiFwD-R.js","./monitoring-3uBGKGRH.js","./credential-patterns-CLzI061R.js"])))=>i.map(i=>d[i]);
import{_ as g}from"./apex-kb-DeiFwD-R.js";import{e as c}from"./escape-html-B4YFbUXM.js";import{l as M}from"./monitoring-3uBGKGRH.js";import{m as b}from"../core/main-B1WxIB7L.js";import{g as L}from"./apex-tools-dispatch-core-DctfUU1m.js";import{toast as p}from"./toast-CRdbcLoc.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-6mKG7DeK.js";import"./apex-tools-dispatch-skills-L47n_BED.js";import"./apex-tools-dispatch-data-DvTVMqeD.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-XVwmy5ZQ.js";import"./apex-tools-registry-CdBWhMtq.js";import"./voice-BmvW5UQL.js";import"./haptic-CQFg2PXZ.js";const S="kdmc_admin";function T(){try{const s=localStorage.getItem("apex_v13_user");return s?JSON.parse(s):null}catch{return null}}function x(s){if(!s)return"—";try{return new Date(s).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return"—"}}function h(s){if(!s)return"jamais";const t=Date.now()-s,e=t/36e5;return e<1?`${Math.floor(t/6e4)}min`:e<24?`${Math.floor(e)}h`:`${Math.floor(e/24)}j`}function G(s){const t=T(),e=t?.id===S,o=t?.name??"Anonyme";L("admin.kb",s,t?.id)&&(s.innerHTML=`
    <div class="ax-page ax-knowledge">
      <header class="ax-page-header">
        <h1>🧠 Mémoire long-terme</h1>
        <p class="ax-subtitle">Facts, lessons, docs synchronisés ${e?"· 👑 Admin (cross-user)":`· user ${c(o)}`}</p>
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
  `,w(s,t,e),H(s,t,e))}async function w(s,t,e){await Promise.all([v(s,t),e?C(s):Promise.resolve(),D(s),_(s),E(s)])}async function v(s,t){const e=s.querySelector("#my-facts-content");if(e){if(!t){e.innerHTML="<em>Pas de user connecté.</em>";return}try{const{persistentMemory:o}=await g(async()=>{const{persistentMemory:r}=await import("./persistent-memory-store-m6LjzzCT.js");return{persistentMemory:r}},__vite__mapDeps([0,1,2]),import.meta.url),d=(await o.list()).filter(r=>r.scope===t.id).sort((r,n)=>n.importance-r.importance);if(d.length===0){e.innerHTML="<em>Aucun fact mémorisé pour ton compte. Les facts seront extraits automatiquement de tes messages chat.</em>";return}const l=d.slice(0,100).map((r,n)=>`
      <tr data-fact-idx="${n}" style="cursor:pointer">
        <td><span class="ax-tag">${c(r.category)}</span></td>
        <td>${c(r.text)}</td>
        <td><span class="ax-importance" style="color:${r.importance>=80?"#ff6b6b":r.importance>=60?"#ffa94d":"#888"};">${r.importance}</span></td>
        <td><time>${h(r.ts)}</time></td>
      </tr>
    `).join("");e.innerHTML=`
      <p>${d.length} fact(s) mémorisé(s) (top 100 affichés) — clic ligne pour drilldown</p>
      <table class="ax-table" style="width:100%;font-size:0.9em;">
        <thead><tr><th>Catégorie</th><th>Fact</th><th>Importance</th><th>Âge</th></tr></thead>
        <tbody>${l}</tbody>
      </table>
    `,e.querySelectorAll("tr[data-fact-idx]").forEach(r=>{r.addEventListener("click",()=>{const n=Number(r.dataset.factIdx??"-1"),a=d[n];a&&(async()=>{const{drillDown:y}=await g(async()=>{const{drillDown:f}=await import("./drilldown-1SlvGToi.js");return{drillDown:f}},[],import.meta.url),m="ax-drilldown-mount-knowledge";let u=document.getElementById(m);u||(u=document.createElement("div"),u.id=m,document.body.appendChild(u)),y.open({id:`fact-${n}`,title:`🧠 Fact ${c(a.category)}`,content:()=>`
              <div style="padding:8px">
                <table style="width:100%;font-size:13px">
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Catégorie</td><td>${c(a.category)}</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Texte</td><td>${c(a.text)}</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Importance</td><td>${a.importance}/100</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Scope (user)</td><td><code>${c(a.scope??"global")}</code></td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Source</td><td>${c(a.source??"—")}</td></tr>
                  <tr><td style="padding:4px;color:var(--ax-text-dim)">Créé</td><td>${x(a.ts)} (${h(a.ts)})</td></tr>
                </table>
              </div>
            `,data:{factIdx:n}},u)})()})})}catch(o){e.innerHTML=`<em style="color:#c00;">Erreur chargement : ${c(String(o))}</em>`}}}async function C(s){const t=s.querySelector("#cross-user-content");if(t)try{const{persistentMemory:e}=await g(async()=>{const{persistentMemory:n}=await import("./persistent-memory-store-m6LjzzCT.js");return{persistentMemory:n}},__vite__mapDeps([0,1,2]),import.meta.url),o=await e.list(),i=new Map;for(const n of o){const a=i.get(n.scope)??[];a.push(n),i.set(n.scope,a)}if(i.size===0){t.innerHTML="<em>Aucun user n'a encore de facts mémorisés.</em>";return}const d=[];for(const[n,a]of i){const y=a.sort((m,u)=>u.importance-m.importance).slice(0,3);d.push(`
        <details class="ax-user-block" style="margin-bottom:8px;border:1px solid #333;padding:8px;border-radius:4px;">
          <summary><strong>${c(n)}</strong> · ${a.length} fact(s)</summary>
          <ul style="margin-top:8px;font-size:0.9em;">
            ${y.map(m=>`<li>[${c(m.category)}/${m.importance}] ${c(m.text)}</li>`).join("")}
          </ul>
        </details>
      `)}t.textContent="";const l=document.createElement("p");l.textContent=`${i.size} user(s), ${o.length} fact(s) total`,t.append(l);const r=document.createElement("div");r.innerHTML=d.join(""),t.append(r)}catch(e){t.innerHTML=`<em style="color:#c00;">Erreur : ${c(String(e))}</em>`}}async function D(s){const t=s.querySelector("#lessons-content");if(t)try{const e=localStorage.getItem("ax_lessons_learned_struct");if(!e){t.innerHTML="<em>Aucune lesson cross-app encore.</em>";return}const o=JSON.parse(e);if(o.length===0){t.innerHTML="<em>Liste vide.</em>";return}const d=[...o].sort((n,a)=>a.ts-n.ts).slice(0,30).map(n=>{const a=n.severity==="critical"?"#ff4444":n.severity==="warn"?"#ffa94d":"#888",y=n.resolved?"✅":"⏳";return`
        <li style="margin-bottom:8px;border-left:3px solid ${a};padding-left:8px;">
          ${y} <strong>${c(n.title)}</strong>
          <small style="color:#888;"> · ${c(n.category)} · ${c(n.src??"apex")} · ${h(n.ts)}</small>
          <div style="font-size:0.85em;color:#bbb;margin-top:4px;">${c(n.text)}</div>
        </li>
      `});t.textContent="";const l=document.createElement("p");l.textContent=`${o.length} lesson(s) (30 plus récentes affichées)`,t.append(l);const r=document.createElement("ul");r.style.cssText="list-style:none;padding:0;",r.innerHTML=d.join(""),t.append(r)}catch(e){t.innerHTML=`<em style="color:#c00;">Erreur : ${c(String(e))}</em>`}}async function _(s){const t=s.querySelector("#docs-content");if(!t)return;const e=b.getDocsContext(),o=Object.keys(e);if(o.length===0){t.innerHTML='<em>Aucun doc synchronisé. Clique "Force re-sync docs" pour fetcher depuis GitHub.</em>';return}const i=o.map(d=>{const l=e[d];return l?`
      <tr>
        <td><strong>${c(d)}</strong></td>
        <td>${(l.size/1024).toFixed(1)} KB</td>
        <td>${h(l.ts)}</td>
        <td><time title="${x(l.ts)}">${x(l.ts)}</time></td>
      </tr>
    `:""}).join("");t.innerHTML=`
    <table class="ax-table" style="width:100%;font-size:0.9em;">
      <thead><tr><th>Doc</th><th>Taille</th><th>Âge</th><th>Last fetch</th></tr></thead>
      <tbody>${i}</tbody>
    </table>
  `}async function E(s){const t=s.querySelector("#audit-content");if(t)try{const e=localStorage.getItem("ax_memory_audit_log");if(!e){t.innerHTML="<em>Sentinelle memory-watch n'a pas encore tourné (1×/jour).</em>";return}const o=JSON.parse(e);if(o.length===0){t.innerHTML="<em>Log vide.</em>";return}const i=o[o.length-1];if(!i){t.innerHTML="<em>Log vide.</em>";return}t.innerHTML=`
      <p><strong>Dernier audit :</strong> ${x(i.ts)} (${h(i.ts)})</p>
      <ul>
        <li>Total facts : <strong>${i.total_facts}</strong></li>
        <li>Users : <strong>${i.users_count}</strong></li>
        <li>Lessons : <strong>${i.lessons_count}</strong></li>
        ${i.oversized_users.length>0?`<li style="color:#ffa94d;">Oversized : ${i.oversized_users.join(", ")}</li>`:'<li style="color:#5cb85c;">Aucun user oversized</li>'}
      </ul>
      <details><summary>Voir ${o.length} audits</summary>
        <ul style="font-size:0.85em;">
          ${o.slice(-10).reverse().map(d=>`<li>${x(d.ts)} : ${d.total_facts} facts, ${d.users_count} users, ${d.lessons_count} lessons</li>`).join("")}
        </ul>
      </details>
    `}catch(e){t.innerHTML=`<em style="color:#c00;">Erreur : ${c(String(e))}</em>`}}function H(s,t,e){const o=s.querySelector("#btn-resync-docs");o?.addEventListener("click",async()=>{o.disabled=!0,o.textContent="⏳ Sync en cours…";try{const r=await b.syncDocsAtBoot({forceRefresh:!0});p.show(`✅ Docs sync : ${r.synced} OK · ${r.failed} fails`,"success"),await _(s)}catch(r){p.show(`❌ Sync fail : ${String(r)}`,"error")}finally{o.disabled=!1,o.textContent="🔄 Force re-sync docs"}});const i=s.querySelector("#btn-compress-mem");i?.addEventListener("click",async()=>{if(confirm("Compresser la mémoire ? Garde top 100 facts par importance par user, supprime le reste. Action irréversible.")){i.disabled=!0;try{const{sentinels:r}=await g(async()=>{const{sentinels:a}=await import("./sentinels-CGg-8QNr.js");return{sentinels:a}},__vite__mapDeps([0,1,2]),import.meta.url),n=await r.runOne("memory-watch");p.show(`✅ ${n?.msg??"Done"}`,"success"),await w(s,t,e)}catch(r){p.show(`❌ Compress fail : ${String(r)}`,"error")}finally{i.disabled=!1}}}),s.querySelector("#btn-export-json")?.addEventListener("click",async()=>{try{const{persistentMemory:r}=await g(async()=>{const{persistentMemory:f}=await import("./persistent-memory-store-m6LjzzCT.js");return{persistentMemory:f}},__vite__mapDeps([0,1,2]),import.meta.url),n=await r.list(),a={ts:Date.now(),user_id:t?.id??"anonymous",is_admin:e,facts:e?n:n.filter(f=>f.scope===t?.id),lessons:JSON.parse(localStorage.getItem("ax_lessons_learned_struct")??"[]"),docs_meta:Object.fromEntries(Object.entries(b.getDocsContext()).map(([f,$])=>[f,{ts:$.ts,size:$.size}]))},y=new Blob([JSON.stringify(a,null,2)],{type:"application/json"}),m=URL.createObjectURL(y),u=document.createElement("a");u.href=m,u.download=`apex-memory-${new Date().toISOString().slice(0,10)}.json`,u.click(),URL.revokeObjectURL(m),p.show("💾 Export téléchargé","success")}catch(r){p.show(`❌ Export fail : ${String(r)}`,"error")}}),s.querySelector("#btn-extract-test")?.addEventListener("click",async()=>{const r=prompt(`Tape une phrase (ex: "j'habite Monaco et j'ai 35 ans, je suis allergique aux fruits de mer") :`,"");if(!(!r||!t))try{const n=await b.extractFactsFromMessage(r,t.id);p.show(`✅ ${n.extracted} fact(s) extrait(s)`,"success"),await v(s,t)}catch(n){p.show(`❌ Extract fail : ${String(n)}`,"error")}}),M.info("knowledge","render + handlers wired",{isAdmin:e,user:t?.id})}export{G as render};
