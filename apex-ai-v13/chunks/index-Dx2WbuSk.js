import{l as g,s as b}from"../core/main-CsQqUsxb.js";import{detectCredential as v,CREDENTIAL_PATTERNS as h}from"./credential-patterns-Ct__OCbr.js";import{vault as f}from"./vault-Cb0mJkno.js";import{h as l}from"./haptic-BUEqXK0N.js";import{toast as p}from"./toast-64I4l5xU.js";function o(e){return e.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]??a)}function m(){return h.filter(e=>e.category!=="forbidden").map(e=>{const a=f.getKeyStatus(e.storageKey),t=(()=>{try{return localStorage.getItem(e.storageKey)??""}catch{return""}})(),i=t&&t.length>8&&!t.startsWith("AXENC1:")?f.maskKey(t):t.startsWith("AXENC1:")?"🔒 chiffré":"";return{pattern:e,status:a,masked:i}})}function k(e,a){return e.filter(t=>{if(a.category&&t.pattern.category!==a.category||a.configuredOnly&&t.status==="empty")return!1;if(a.query){const i=a.query.toLowerCase();if(!(t.pattern.name.toLowerCase().includes(i)||t.pattern.storageKey.toLowerCase().includes(i)))return!1}return!0})}async function $(e){const a=e.trim();if(!a)return{ok:!1,reason:"Entrée vide"};const t=v(a);if(!t)return{ok:!1,reason:"Aucun pattern reconnu"};if(t.category==="forbidden")return{ok:!1,reason:"🚨 Type interdit (cartes/seed phrases jamais stockées)"};try{const i=await f.encryptAuto(a);return localStorage.setItem(t.storageKey,i),{ok:!0,pattern_name:t.name,storage_key:t.storageKey}}catch(i){return g.warn("vault-feature","autoDetectAndStore failed",{err:i}),{ok:!1,reason:"Erreur chiffrement"}}}function S(e){try{return localStorage.removeItem(e),!0}catch(a){return g.warn("vault-feature","remove failed",{err:a}),!1}}function w(e){const a={exported_at:new Date().toISOString(),version:1,entries:e.filter(t=>t.status!=="empty").map(t=>{const i=(()=>{try{return localStorage.getItem(t.pattern.storageKey)??""}catch{return""}})();return{storage_key:t.pattern.storageKey,name:t.pattern.name,value_encrypted:i}})};return JSON.stringify(a,null,2)}const A={configured:{label:"Configurée",color:"#22cc77",icon:"🟢"},encrypted:{label:"Chiffrée",color:"#22cc77",icon:"🔐"},plaintext_legacy:{label:"À migrer",color:"#ffaa00",icon:"🟠"},empty:{label:"Non configurée",color:"#888",icon:"⚪"}},C=[{id:"ai",label:"IA",icon:"🤖"},{id:"saas",label:"SaaS",icon:"🛠"},{id:"devops",label:"DevOps",icon:"⚙️"},{id:"finance",label:"Finance",icon:"💰"},{id:"comms",label:"Comms",icon:"💬"},{id:"storage",label:"Storage",icon:"💾"},{id:"identity",label:"Identité",icon:"🪪"}];let u="all",x=!1,y="";function z(e){const a=A[e.status],t=[];return e.pattern.dashboard&&t.push(`<a href="${o(e.pattern.dashboard)}" target="_blank" rel="noopener" class="ax-vault-link">📊 Dashboard</a>`),e.pattern.billing&&t.push(`<a href="${o(e.pattern.billing)}" target="_blank" rel="noopener" class="ax-vault-link">💳 Billing</a>`),e.pattern.docs&&t.push(`<a href="${o(e.pattern.docs)}" target="_blank" rel="noopener" class="ax-vault-link">📖 Docs</a>`),e.pattern.support&&t.push(`<a href="${o(e.pattern.support)}" target="_blank" rel="noopener" class="ax-vault-link">🆘 Support</a>`),`
    <li class="ax-vault-row" data-vault-key="${o(e.pattern.storageKey)}"
      style="background:rgba(20,20,35,0.5);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:12px;margin-bottom:8px;border-left:3px solid ${o(a.color)}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
        <div style="flex:1;min-width:200px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="font-size:14px">${a.icon}</span>
            <strong style="color:#fff;font-size:14px">${o(e.pattern.name)}</strong>
            <span style="background:rgba(${e.pattern.category==="ai"?"90,168,255":"168,120,255"},.15);color:#a0a4c0;font-size:10px;padding:2px 6px;border-radius:4px;text-transform:uppercase">${o(e.pattern.category)}</span>
          </div>
          <code style="font-size:11px;color:#888;display:block">${o(e.pattern.storageKey)}</code>
          ${e.masked?`<code style="font-size:12px;color:${o(a.color)};display:block;margin-top:2px">${o(e.masked)}</code>`:""}
          <div style="margin-top:6px;display:flex;gap:10px;flex-wrap:wrap;font-size:11px">${t.join(" · ")}</div>
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          ${e.status!=="empty"?`<button class="ax-btn ax-btn-sm" data-vault-test="${o(e.pattern.storageKey)}" style="font-size:11px">🧪 Tester</button>`:""}
          <button class="ax-btn ax-btn-sm" data-vault-edit="${o(e.pattern.storageKey)}" style="font-size:11px">${e.status==="empty"?"➕ Ajouter":"✏️ Modifier"}</button>
          ${e.status!=="empty"?`<button class="ax-btn ax-btn-sm ax-btn-danger" data-vault-remove="${o(e.pattern.storageKey)}" style="font-size:11px;background:rgba(255,88,88,.15);color:#ff5858">🗑</button>`:""}
        </div>
      </div>
    </li>`}function L(){return[{id:"all",label:"🔍 Tous"},...C.map(a=>({id:a.id,label:`${a.icon} ${a.label}`}))].map(a=>`
      <button class="ax-vault-cat-btn ${u===a.id?"ax-tab-active":""}"
        data-vault-cat="${o(a.id)}"
        style="background:${u===a.id?"rgba(201,162,39,.15)":"transparent"};color:${u===a.id?"#c9a227":"#a0a4c0"};border:1px solid rgba(201,162,39,.3);padding:6px 12px;border-radius:8px;font-size:12px;cursor:pointer">
        ${o(a.label)}
      </button>`).join("")}async function d(e){if(!b.get("isAdmin")){e.innerHTML=`<div style="padding:40px;text-align:center"><h2 style="color:#c9a227">🔒 Coffre admin</h2><p style="color:#a0a4c0">Cette section est réservée à l'admin Kevin.</p></div>`;return}const t=m(),i={configuredOnly:x,query:y};u!=="all"&&(i.category=u);const r=k(t,i),n={total:t.length,configured:t.filter(s=>s.status!=="empty").length,encrypted:t.filter(s=>s.status==="encrypted").length};e.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:1100px;margin:0 auto">
      <header style="margin-bottom:20px">
        <h1 style="margin:0 0 4px;color:#c9a227;font-size:28px">🔐 Coffre-fort</h1>
        <p style="color:#a0a4c0;margin:0;font-size:13px">
          ${n.configured}/${n.total} clés configurées · ${n.encrypted} chiffrées AES-GCM 256
        </p>
      </header>

      <section style="margin-bottom:16px;background:rgba(20,20,35,0.6);border:1px solid rgba(201,162,39,.2);border-radius:14px;padding:14px">
        <h3 style="margin:0 0 10px;color:#c9a227;font-size:13px;text-transform:uppercase">🔍 Auto-detect</h3>
        <p style="color:#a0a4c0;font-size:12px;margin:0 0 8px">Colle ici n'importe quelle clé API. Apex la reconnait automatiquement et la stocke dans la bonne case.</p>
        <textarea id="ax-vault-paste" placeholder="Colle ta clé ici (ex: sk-ant-api03-..., AIzaSy..., re_...)"
          style="width:100%;background:rgba(0,0,0,.3);color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px;font-family:monospace;font-size:12px;min-height:60px;resize:vertical"></textarea>
        <button id="ax-vault-paste-btn" class="ax-btn ax-btn-primary" style="margin-top:8px;font-size:13px">🔍 Détecter & stocker</button>
        <div id="ax-vault-paste-result" style="margin-top:8px"></div>
      </section>

      <section style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input id="ax-vault-search" type="text" placeholder="🔍 Filtre par nom/clé..." value="${o(y)}"
          style="flex:1;min-width:200px;background:rgba(0,0,0,.3);color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px 12px;font-size:13px">
        <label style="display:flex;align-items:center;gap:6px;color:#a0a4c0;font-size:12px;cursor:pointer">
          <input type="checkbox" id="ax-vault-configured-only" ${x?"checked":""}>
          Configurées uniquement
        </label>
      </section>

      <section style="margin-bottom:12px;display:flex;gap:6px;flex-wrap:wrap">
        ${L()}
      </section>

      <section style="margin-bottom:24px">
        <ul style="list-style:none;padding:0;margin:0">
          ${r.length>0?r.map(z).join(""):'<li style="text-align:center;padding:30px;color:#888">Aucun credential pour ces filtres.</li>'}
        </ul>
      </section>

      <section style="background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:14px;margin-bottom:16px">
        <h3 style="margin:0 0 10px;color:#c9a227;font-size:13px;text-transform:uppercase">💾 Backup & Restore</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="ax-vault-export" class="ax-btn ax-btn-sm">📥 Exporter coffre (JSON)</button>
          <button id="ax-vault-passphrase" class="ax-btn ax-btn-sm">🔑 Changer passphrase</button>
        </div>
      </section>

      <p style="text-align:center;color:#666;font-size:11px">
        🛡 Sécurité : AES-GCM 256 + PBKDF2 200k iterations · Audit log immutable · JAMAIS Firebase pour ax_pin/ax_user.
      </p>
    </div>
  `,q(e),g.info("feature-vault",`rendered (${t.length} entries, ${r.length} visible, ${n.configured} configured)`)}function q(e){e.querySelectorAll("[data-vault-cat]").forEach(r=>{r.addEventListener("click",()=>{l.selection();const n=r.dataset.vaultCat??"all";u=n==="all"?"all":n,d(e)})});const a=e.querySelector("#ax-vault-search");if(a){let r=null;a.addEventListener("input",()=>{r&&clearTimeout(r),r=setTimeout(()=>{y=a.value,d(e)},300)})}const t=e.querySelector("#ax-vault-configured-only");t&&t.addEventListener("change",()=>{x=t.checked,d(e)});const i=e.querySelector("#ax-vault-paste-btn");i&&i.addEventListener("click",()=>{(async()=>{l.tap();const r=e.querySelector("#ax-vault-paste"),n=e.querySelector("#ax-vault-paste-result");if(!r||!n)return;const s=await $(r.value);s.ok?(l.success(),p.success(`✅ ${s.pattern_name} stocké`),n.innerHTML=`<div style="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px;font-size:12px">✅ ${o(s.pattern_name)} → ${o(s.storage_key)}</div>`,r.value="",d(e)):(l.error(),p.error(s.reason),n.innerHTML=`<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px;font-size:12px">⚠ ${o(s.reason)}</div>`)})()}),e.querySelectorAll("[data-vault-edit]").forEach(r=>{r.addEventListener("click",()=>{(async()=>{l.tap();const n=r.dataset.vaultEdit??"";if(!n)return;const s=window.prompt(`Nouvelle valeur pour ${n} (laisser vide pour annuler) :`);if(!(s===null||s===""))try{const c=await f.encryptAuto(s);localStorage.setItem(n,c),p.success("Clé chiffrée et stockée"),d(e)}catch(c){g.warn("vault-feature","edit failed",{err:c}),p.error("Erreur chiffrement")}})()})}),e.querySelectorAll("[data-vault-remove]").forEach(r=>{r.addEventListener("click",()=>{l.tap();const n=r.dataset.vaultRemove??"";if(!n||!window.confirm(`Supprimer ${n} ?`))return;S(n)?(l.success(),p.success("Credential supprimé"),d(e)):(l.error(),p.error("Suppression échouée"))})}),e.querySelectorAll("[data-vault-test]").forEach(r=>{r.addEventListener("click",()=>{l.tap(),p.info("Test de validité non encore implémenté (Jet 5)")})}),e.querySelector("#ax-vault-export")?.addEventListener("click",()=>{l.tap();const r=w(m()),n=new Blob([r],{type:"application/json"}),s=URL.createObjectURL(n),c=document.createElement("a");c.href=s,c.download=`apex-vault-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(c),c.click(),document.body.removeChild(c),URL.revokeObjectURL(s),p.success("Coffre exporté (chiffré)")}),e.querySelector("#ax-vault-passphrase")?.addEventListener("click",()=>{l.tap(),p.info("Changement passphrase à implémenter (Jet 5)")})}export{$ as autoDetectAndStore,o as escapeHtml,w as exportVaultJson,k as filterVaultEntries,m as listVaultEntries,S as removeCredential,d as render};
//# sourceMappingURL=index-Dx2WbuSk.js.map
