import{b as q,e as u,l as w,a as k}from"./monitoring-D464VzTN.js";import{c as I}from"./listener-cleanup-Y2rGGxxX.js";import{r as j}from"../core/main-7bAU6g_B.js";import{CREDENTIAL_PATTERNS as _}from"./credential-patterns-DUMYZEMu.js";import{g as f}from"./generic-secrets-WtF3lhYV.js";import{multiKeyVault as S}from"./multi-key-vault-B51wSX7t.js";import{v as A}from"./apex-kb-DEnZH7Q6.js";import{haptic as x}from"./haptic-CQFg2PXZ.js";import{toast as d}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-DQ6ZtyiG.js";let n=null;function le(){n?.cleanup(),n=null}function $(e){if(!e)return"—";try{return new Date(e).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"})}catch{return"—"}}function U(e){return e?e.length<=10?"••••••":`${e.slice(0,4)}•••${e.slice(-4)}`:"—"}const g="db_cache",b="webhook",R="generic",h={ai:"🤖 IA & LLM",finance:"💰 Paiements & Crypto",devops:"🔧 DevOps & Hosting",comms:"💬 Communications",storage:"📦 Stockage / Productivité",identity:"👤 Identité / OAuth",saas:"🌐 SaaS & Workers",[g]:"🗃 Bases de données",[b]:"🔗 Webhooks",[R]:"🔐 Secrets génériques"},z={ax_postgres_url:g,ax_mysql_url:g,ax_mongodb_url:g,ax_redis_url:g,ax_websocket_url:g,ax_discord_webhook_url:b,ax_slack_webhook_url:b,ax_github_webhook_url:b,ax_railway_url:"devops",ax_cloudflare_worker_url:"devops"};function D(e,r){return z[e]??r}function E(){const e=[];try{const r=S.listAll(!0);for(const t of r){const a=_.find(s=>s.storageKey.includes(t.service)||s.name.toLowerCase().includes(t.service.toLowerCase())),i=a?.category??"ai",c={id:`mk:${t.id}`,source:"multi-key",service:t.service,label:t.alias?`${C(t.service)} — ${t.alias}`:C(t.service),category:i,preview:"••••••",addedAt:t.addedAt};t.lastWorkedAt!==void 0&&(c.lastUsedAt=t.lastWorkedAt),a?.storageKey&&(c.rawStorageKey=a.storageKey),e.push(c)}}catch(r){w.warn("all-secrets","multi-key list failed",{err:r})}return e}function N(){const e=[],r=new Set;for(const t of _){if(t.category==="forbidden"||r.has(t.storageKey))continue;r.add(t.storageKey);let a=null;try{a=localStorage.getItem(t.storageKey)}catch{}a&&e.push({id:`lg:${t.storageKey}`,source:"legacy",service:t.name,label:t.name,category:D(t.storageKey,t.category),preview:"••••••",rawStorageKey:t.storageKey})}return e}function H(){return f.list().map(e=>{const r={id:`gn:${e.id}`,source:"generic",service:"Secret générique",label:e.label,category:R,preview:"••••••",addedAt:e.addedAt,genericId:e.id};return e.lastUsed!==void 0&&(r.lastUsedAt=e.lastUsed),r})}function C(e){return e.charAt(0).toUpperCase()+e.slice(1)}function B(e){const r={};for(const t of e){let a=r[t.category];a||(a=[],r[t.category]=a),a.push(t)}return r}function M(e){const r=u(e.preview),t=$(e.addedAt),a=$(e.lastUsedAt),i=u(e.label),c=u(e.id);return`
    <article style="background:rgba(255,255,255,0.02);border:1px solid rgba(201,162,39,0.18);border-radius:10px;padding:12px;margin-bottom:8px" data-secret-id="${c}">
      <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:10px">
        <div class="ax-gs-11">
          <div style="font-weight:600;color:#c9a227;font-size:14px">${i}</div>
          <div style="font-family:monospace;font-size:12px;color:var(--ax-text-dim);margin-top:4px" class="ax-sec-preview">${r}</div>
          <div class="ax-gs-82">
            ${e.addedAt?`Ajouté ${u(t)}`:""}
            ${e.lastUsedAt?` · Utilisé ${u(a)}`:""}
          </div>
        </div>
        <div class="ax-gs-20">
          <button class="ax-btn ax-sec-reveal ax-gs-263" data-id="${c}" aria-label="Voir 5s la valeur">👁</button>
          <button class="ax-btn ax-sec-copy ax-gs-263" data-id="${c}" aria-label="Copier dans presse-papier">📋</button>
          ${e.source==="generic"?`<button class="ax-btn ax-sec-rename ax-gs-263" data-id="${c}" aria-label="Renommer">✏️</button>`:""}
          <button class="ax-btn ax-sec-delete" data-id="${c}" aria-label="Supprimer" style="padding:6px 10px;font-size:12px;min-height:36px;color:#ff6b6b">🗑</button>
        </div>
      </div>
    </article>
  `}function G(e,r){const t=h[e]??`📁 ${e}`;return`
    <section class="ax-gs-180">
      <h2 style="font-size:15px;color:#c9a227;margin:0 0 10px;display:flex;align-items:center;gap:8px">
        ${u(t)}
        <span style="background:rgba(201,162,39,0.15);color:#c9a227;font-size:11px;padding:2px 8px;border-radius:8px">${r.length}</span>
      </h2>
      <div>${r.map(M).join("")}</div>
    </section>
  `}function W(e,r){const t=r.trim().toLowerCase();return t?e.filter(a=>a.label.toLowerCase().includes(t)||a.service.toLowerCase().includes(t)||(a.rawStorageKey?.toLowerCase().includes(t)??!1)):e}function F(e,r){return!r||r==="all"?e:e.filter(t=>t.category===r)}async function m(e,r){const t=r?.search??"",a=r?.cat??"all",i=[...E(),...N(),...H()],c=F(W(i,t),a),s=B(c),y=Object.keys(h).filter(o=>s[o]?.length),l=i.filter(o=>o.source==="legacy").length,p=i.filter(o=>o.source==="multi-key").length,v=i.filter(o=>o.source==="generic").length,K=["all",...Object.keys(h)].map(o=>{const O=o===a,T=o==="all"?`📁 Tous (${i.length})`:`${h[o]} (${s[o]?.length??0})`;return`<button class="ax-btn ax-sec-cat" data-cat="${u(o)}" style="padding:6px 10px;font-size:12px;min-height:36px;${O?"background:rgba(201,162,39,0.25);border:1px solid #c9a227":"border:1px solid rgba(255,255,255,0.1)"}">${u(T)}</button>`}).join("");e.innerHTML=`
    <div style="padding:20px;max-width:1000px;margin:0 auto">
      <header class="ax-gs-181">
        <div class="ax-gs-83">
          <button id="ax-sec-back" class="ax-btn ax-gs-263" aria-label="Retour chat">← Chat</button>
          <h1 style="margin:0;color:#c9a227;font-size:20px">🔐 Mes Secrets — Dossier admin</h1>
        </div>
        <p style="color:var(--ax-text-dim);font-size:12px;margin:8px 0 0">
          Tous tes secrets en 1 endroit (admin-only). API keys, connexions DB,
          webhooks, tokens OAuth, secrets génériques étiquetables.
        </p>
      </header>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:18px">
        <div style="background:rgba(201,162,39,0.1);border:1px solid rgba(201,162,39,0.3);border-radius:10px;padding:12px">
          <div style="font-size:22px;color:#c9a227;font-weight:600">${i.length}</div>
          <div class="ax-gs-2">Total secrets</div>
        </div>
        <div class="ax-gs-52">
          <div class="ax-gs-53">${p}</div>
          <div class="ax-gs-2">Multi-key vault</div>
        </div>
        <div class="ax-gs-52">
          <div class="ax-gs-53">${l}</div>
          <div class="ax-gs-2">Legacy (ax_*)</div>
        </div>
        <div class="ax-gs-52">
          <div class="ax-gs-53">${v}</div>
          <div class="ax-gs-2">Génériques</div>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
        <input id="ax-sec-search" type="search" placeholder="🔎 Rechercher (nom, service, alias…)" value="${u(t)}" style="flex:1;min-width:200px;padding:10px 12px;font-size:13px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:var(--ax-text)" aria-label="Rechercher un secret" />
        <button id="ax-sec-export" class="ax-btn ax-gs-264" aria-label="Exporter JSON chiffré">📤 Export JSON chiffré</button>
        <button id="ax-sec-refresh" class="ax-btn ax-gs-264" aria-label="Rafraîchir">🔄</button>
      </div>

      <div style="display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap" role="tablist" aria-label="Filtre catégorie">${K}</div>

      <div id="ax-sec-list">
        ${y.length===0?'<p style="text-align:center;color:var(--ax-text-dim);padding:40px">Aucun secret pour ce filtre.</p>':y.map(o=>G(o,s[o]??[])).join("")}
      </div>

      <p class="ax-gs-265">
        🔒 Reveal = audit log immutable. Suppression = backup 30j (restaurable).
      </p>
    </div>
  `,P(e,{search:t,cat:a})}function P(e,r){if(!n)return;const t=e.querySelector("#ax-sec-back");t&&n.bind(t,"click",()=>{x.tap(),j.navigate("chat")});const a=e.querySelector("#ax-sec-refresh");a&&n.bind(a,"click",()=>{x.tap(),m(e,r)});const i=e.querySelector("#ax-sec-export");i&&n.bind(i,"click",()=>{X()});const c=e.querySelector("#ax-sec-search");if(c){let s=null;n.bind(c,"input",()=>{s&&clearTimeout(s),s=setTimeout(()=>{m(e,{search:c.value,cat:r.cat})},250)})}e.querySelectorAll(".ax-sec-cat").forEach(s=>{n&&n.bind(s,"click",()=>{x.tap(),m(e,{search:r.search,cat:s.dataset.cat??"all"})})}),e.querySelectorAll(".ax-sec-reveal").forEach(s=>{n&&n.bind(s,"click",()=>{V(e,s)})}),e.querySelectorAll(".ax-sec-copy").forEach(s=>{n&&n.bind(s,"click",()=>{J(s)})}),e.querySelectorAll(".ax-sec-rename").forEach(s=>{n&&n.bind(s,"click",()=>{Y(e,s,r)})}),e.querySelectorAll(".ax-sec-delete").forEach(s=>{n&&n.bind(s,"click",()=>{Q(e,s,r)})})}async function L(e){const r=e.indexOf(":");if(r<0)return null;const t=e.slice(0,r),a=e.slice(r+1);if(!a)return null;if(t==="gn"){const i=await f.reveal(a);return i.ok?i.plaintext:null}if(t==="lg")try{const i=localStorage.getItem(a);return i?await A.decryptAuto(i):null}catch{return null}if(t==="mk")try{const c=S.listAll(!0).find(s=>s.id===a);return c?await A.decryptAuto(c.encrypted):null}catch{return null}return null}async function V(e,r){const t=r.dataset.id;if(!t)return;const i=e.querySelector(`[data-secret-id="${CSS.escape(t)}"]`)?.querySelector(".ax-sec-preview");if(i){x.tap(),r.disabled=!0;try{const c=await L(t);if(!c){d.error("❌ Impossible de déchiffrer");return}i.textContent=c,i.style.color="#22cc77",k.record("vault.secret_revealed",{details:{id:t}}),setTimeout(()=>{i.textContent=U(c),i.style.color=""},5e3)}finally{r.disabled=!1}}}async function J(e){const r=e.dataset.id;if(!r)return;x.tap();const t=await L(r);if(!t){d.error("❌ Impossible de déchiffrer");return}try{await navigator.clipboard.writeText(t),d.success("📋 Copié 30s puis effacé du presse-papier"),k.record("vault.secret_copied",{details:{id:r}}),setTimeout(()=>{navigator.clipboard.writeText("")},3e4)}catch(a){w.warn("all-secrets","clipboard failed",{err:a}),d.error("❌ Copie refusée par le navigateur")}}async function Y(e,r,t){const a=r.dataset.id;if(!a||!a.startsWith("gn:"))return;const i=a.slice(3),c=f.list().find(p=>p.id===i);if(!c)return;const s=window.prompt("Nouveau label :",c.label);if(!s||s.trim()===c.label)return;const l=window.prompt("Aide-mémoire (optionnel) :",c.hint??"")??void 0;(l===void 0?f.rename(i,s):f.rename(i,s,l))?(d.success("✅ Renommé"),await m(e,t)):d.error("❌ Renommage échoué")}async function Q(e,r,t){const a=r.dataset.id;if(!a)return;const i=a.indexOf(":");if(i<0)return;const c=a.slice(0,i),s=a.slice(i+1);if(!s||!window.confirm(`Supprimer ce secret ?

(backup 30j conservé pour restauration)`))return;x.medium();let l=!1;if(c==="gn")l=f.remove(s);else if(c==="lg")try{const p=`apex_v13_recovery_backup_${s}_${Date.now()}`,v=localStorage.getItem(s);v&&localStorage.setItem(p,v),localStorage.removeItem(s),l=!0}catch{l=!1}else if(c==="mk")try{S.removeKey(s),l=!0}catch(p){w.warn("all-secrets","multi-key remove failed",{err:p})}l?(k.record("vault.secret_deleted",{details:{id:a,src:c}}),d.success("🗑 Supprimé (backup 30j)"),await m(e,t)):d.error("❌ Suppression échouée")}async function X(){try{const e={exported_at:new Date().toISOString(),version:1,multi_key_vault:S.listAll(!0),legacy:_.filter(i=>i.category!=="forbidden").map(i=>({key:i.storageKey,name:i.name,cipher:localStorage.getItem(i.storageKey)})).filter(i=>i.cipher),generic:f.list()},r=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),t=URL.createObjectURL(r),a=document.createElement("a");a.href=t,a.download=`apex-secrets-${new Date().toISOString().slice(0,10)}.json`,a.click(),URL.revokeObjectURL(t),k.record("vault.secrets_exported",{}),d.success("📤 Export téléchargé (chiffré)")}catch(e){w.warn("all-secrets","export failed",{err:e}),d.error("❌ Export échoué")}}async function de(e){if(!(q.get("isAdmin")===!0)){e.innerHTML=`
      <div class="ax-gs-21">
        <h2 class="ax-gs-266">🔒 Accès admin uniquement</h2>
        <p>Cette section est réservée à Kevin.</p>
      </div>
    `;return}n?.cleanup(),n=I("all-secrets"),await m(e)}export{le as dispose,de as render};
