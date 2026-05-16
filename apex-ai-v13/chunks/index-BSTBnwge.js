import{c as T}from"./listener-cleanup-Y2rGGxxX.js";import{l as w}from"./monitoring-3uBGKGRH.js";import{s as q,r as I}from"../core/main-Chf9Kx4D.js";import{a as k,v as A}from"./apex-kb-Ss-LQHUo.js";import{CREDENTIAL_PATTERNS as _}from"./credential-patterns-CLzI061R.js";import{g as f}from"./generic-secrets-BG3BjpKT.js";import{multiKeyVault as S}from"./multi-key-vault-DeKrwMzr.js";import{haptic as g}from"./haptic-CQFg2PXZ.js";import{toast as d}from"./toast-ClsF1KRZ.js";import"./multi-source-analyze-Cb_4xPK7.js";let s=null;function le(){s?.cleanup(),s=null}function p(e){return e.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r]??r)}function $(e){if(!e)return"—";try{return new Date(e).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"})}catch{return"—"}}function j(e){return e?e.length<=10?"••••••":`${e.slice(0,4)}•••${e.slice(-4)}`:"—"}const x="db_cache",v="webhook",R="generic",h={ai:"🤖 IA & LLM",finance:"💰 Paiements & Crypto",devops:"🔧 DevOps & Hosting",comms:"💬 Communications",storage:"📦 Stockage / Productivité",identity:"👤 Identité / OAuth",saas:"🌐 SaaS & Workers",[x]:"🗃 Bases de données",[v]:"🔗 Webhooks",[R]:"🔐 Secrets génériques"},U={ax_postgres_url:x,ax_mysql_url:x,ax_mongodb_url:x,ax_redis_url:x,ax_websocket_url:x,ax_discord_webhook_url:v,ax_slack_webhook_url:v,ax_github_webhook_url:v,ax_railway_url:"devops",ax_cloudflare_worker_url:"devops"};function D(e,r){return U[e]??r}function E(){const e=[];try{const r=S.listAll(!0);for(const t of r){const i=_.find(o=>o.storageKey.includes(t.service)||o.name.toLowerCase().includes(t.service.toLowerCase())),a=i?.category??"ai",n={id:`mk:${t.id}`,source:"multi-key",service:t.service,label:t.alias?`${C(t.service)} — ${t.alias}`:C(t.service),category:a,preview:"••••••",addedAt:t.addedAt};t.lastWorkedAt!==void 0&&(n.lastUsedAt=t.lastWorkedAt),i?.storageKey&&(n.rawStorageKey=i.storageKey),e.push(n)}}catch(r){w.warn("all-secrets","multi-key list failed",{err:r})}return e}function N(){const e=[],r=new Set;for(const t of _){if(t.category==="forbidden"||r.has(t.storageKey))continue;r.add(t.storageKey);let i=null;try{i=localStorage.getItem(t.storageKey)}catch{}i&&e.push({id:`lg:${t.storageKey}`,source:"legacy",service:t.name,label:t.name,category:D(t.storageKey,t.category),preview:"••••••",rawStorageKey:t.storageKey})}return e}function H(){return f.list().map(e=>{const r={id:`gn:${e.id}`,source:"generic",service:"Secret générique",label:e.label,category:R,preview:"••••••",addedAt:e.addedAt,genericId:e.id};return e.lastUsed!==void 0&&(r.lastUsedAt=e.lastUsed),r})}function C(e){return e.charAt(0).toUpperCase()+e.slice(1)}function B(e){const r={};for(const t of e){let i=r[t.category];i||(i=[],r[t.category]=i),i.push(t)}return r}function M(e){const r=p(e.preview),t=$(e.addedAt),i=$(e.lastUsedAt),a=p(e.label),n=p(e.id);return`
    <article style="background:rgba(255,255,255,0.02);border:1px solid rgba(201,162,39,0.18);border-radius:10px;padding:12px;margin-bottom:8px" data-secret-id="${n}">
      <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:10px">
        <div style="flex:1;min-width:200px">
          <div style="font-weight:600;color:#c9a227;font-size:14px">${a}</div>
          <div style="font-family:monospace;font-size:12px;color:var(--ax-text-dim);margin-top:4px" class="ax-sec-preview">${r}</div>
          <div style="font-size:10px;color:#888;margin-top:4px">
            ${e.addedAt?`Ajouté ${p(t)}`:""}
            ${e.lastUsedAt?` · Utilisé ${p(i)}`:""}
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="ax-btn ax-sec-reveal" data-id="${n}" aria-label="Voir 5s la valeur" style="padding:6px 10px;font-size:12px;min-height:36px">👁</button>
          <button class="ax-btn ax-sec-copy" data-id="${n}" aria-label="Copier dans presse-papier" style="padding:6px 10px;font-size:12px;min-height:36px">📋</button>
          ${e.source==="generic"?`<button class="ax-btn ax-sec-rename" data-id="${n}" aria-label="Renommer" style="padding:6px 10px;font-size:12px;min-height:36px">✏️</button>`:""}
          <button class="ax-btn ax-sec-delete" data-id="${n}" aria-label="Supprimer" style="padding:6px 10px;font-size:12px;min-height:36px;color:#ff6b6b">🗑</button>
        </div>
      </div>
    </article>
  `}function G(e,r){const t=h[e]??`📁 ${e}`;return`
    <section style="margin-bottom:24px">
      <h2 style="font-size:15px;color:#c9a227;margin:0 0 10px;display:flex;align-items:center;gap:8px">
        ${p(t)}
        <span style="background:rgba(201,162,39,0.15);color:#c9a227;font-size:11px;padding:2px 8px;border-radius:8px">${r.length}</span>
      </h2>
      <div>${r.map(M).join("")}</div>
    </section>
  `}function W(e,r){const t=r.trim().toLowerCase();return t?e.filter(i=>i.label.toLowerCase().includes(t)||i.service.toLowerCase().includes(t)||(i.rawStorageKey?.toLowerCase().includes(t)??!1)):e}function F(e,r){return!r||r==="all"?e:e.filter(t=>t.category===r)}async function y(e,r){const t=r?.search??"",i=r?.cat??"all",a=[...E(),...N(),...H()],n=F(W(a,t),i),o=B(n),m=Object.keys(h).filter(c=>o[c]?.length),l=a.filter(c=>c.source==="legacy").length,u=a.filter(c=>c.source==="multi-key").length,b=a.filter(c=>c.source==="generic").length,L=["all",...Object.keys(h)].map(c=>{const K=c===i,O=c==="all"?`📁 Tous (${a.length})`:`${h[c]} (${o[c]?.length??0})`;return`<button class="ax-btn ax-sec-cat" data-cat="${p(c)}" style="padding:6px 10px;font-size:12px;min-height:36px;${K?"background:rgba(201,162,39,0.25);border:1px solid #c9a227":"border:1px solid rgba(255,255,255,0.1)"}">${p(O)}</button>`}).join("");e.innerHTML=`
    <div style="padding:20px;max-width:1000px;margin:0 auto">
      <header style="margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <button id="ax-sec-back" class="ax-btn" aria-label="Retour chat" style="padding:6px 10px;font-size:12px;min-height:36px">← Chat</button>
          <h1 style="margin:0;color:#c9a227;font-size:20px">🔐 Mes Secrets — Dossier admin</h1>
        </div>
        <p style="color:var(--ax-text-dim);font-size:12px;margin:8px 0 0">
          Tous tes secrets en 1 endroit (admin-only). API keys, connexions DB,
          webhooks, tokens OAuth, secrets génériques étiquetables.
        </p>
      </header>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:18px">
        <div style="background:rgba(201,162,39,0.1);border:1px solid rgba(201,162,39,0.3);border-radius:10px;padding:12px">
          <div style="font-size:22px;color:#c9a227;font-weight:600">${a.length}</div>
          <div style="font-size:11px;color:var(--ax-text-dim)">Total secrets</div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px">
          <div style="font-size:22px;font-weight:600">${u}</div>
          <div style="font-size:11px;color:var(--ax-text-dim)">Multi-key vault</div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px">
          <div style="font-size:22px;font-weight:600">${l}</div>
          <div style="font-size:11px;color:var(--ax-text-dim)">Legacy (ax_*)</div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px">
          <div style="font-size:22px;font-weight:600">${b}</div>
          <div style="font-size:11px;color:var(--ax-text-dim)">Génériques</div>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
        <input id="ax-sec-search" type="search" placeholder="🔎 Rechercher (nom, service, alias…)" value="${p(t)}" style="flex:1;min-width:200px;padding:10px 12px;font-size:13px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:var(--ax-text)" aria-label="Rechercher un secret" />
        <button id="ax-sec-export" class="ax-btn" aria-label="Exporter JSON chiffré" style="padding:8px 14px;font-size:12px;min-height:40px">📤 Export JSON chiffré</button>
        <button id="ax-sec-refresh" class="ax-btn" aria-label="Rafraîchir" style="padding:8px 14px;font-size:12px;min-height:40px">🔄</button>
      </div>

      <div style="display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap" role="tablist" aria-label="Filtre catégorie">${L}</div>

      <div id="ax-sec-list">
        ${m.length===0?'<p style="text-align:center;color:var(--ax-text-dim);padding:40px">Aucun secret pour ce filtre.</p>':m.map(c=>G(c,o[c]??[])).join("")}
      </div>

      <p style="text-align:center;color:#666;font-size:11px;margin-top:24px">
        🔒 Reveal = audit log immutable. Suppression = backup 30j (restaurable).
      </p>
    </div>
  `,P(e,{search:t,cat:i})}function P(e,r){if(!s)return;const t=e.querySelector("#ax-sec-back");t&&s.bind(t,"click",()=>{g.tap(),I.navigate("chat")});const i=e.querySelector("#ax-sec-refresh");i&&s.bind(i,"click",()=>{g.tap(),y(e,r)});const a=e.querySelector("#ax-sec-export");a&&s.bind(a,"click",()=>{X()});const n=e.querySelector("#ax-sec-search");if(n){let o=null;s.bind(n,"input",()=>{o&&clearTimeout(o),o=setTimeout(()=>{y(e,{search:n.value,cat:r.cat})},250)})}e.querySelectorAll(".ax-sec-cat").forEach(o=>{s&&s.bind(o,"click",()=>{g.tap(),y(e,{search:r.search,cat:o.dataset.cat??"all"})})}),e.querySelectorAll(".ax-sec-reveal").forEach(o=>{s&&s.bind(o,"click",()=>{V(e,o)})}),e.querySelectorAll(".ax-sec-copy").forEach(o=>{s&&s.bind(o,"click",()=>{J(o)})}),e.querySelectorAll(".ax-sec-rename").forEach(o=>{s&&s.bind(o,"click",()=>{Y(e,o,r)})}),e.querySelectorAll(".ax-sec-delete").forEach(o=>{s&&s.bind(o,"click",()=>{Q(e,o,r)})})}async function z(e){const r=e.indexOf(":");if(r<0)return null;const t=e.slice(0,r),i=e.slice(r+1);if(!i)return null;if(t==="gn"){const a=await f.reveal(i);return a.ok?a.plaintext:null}if(t==="lg")try{const a=localStorage.getItem(i);return a?await A.decryptAuto(a):null}catch{return null}if(t==="mk")try{const n=S.listAll(!0).find(o=>o.id===i);return n?await A.decryptAuto(n.encrypted):null}catch{return null}return null}async function V(e,r){const t=r.dataset.id;if(!t)return;const a=e.querySelector(`[data-secret-id="${CSS.escape(t)}"]`)?.querySelector(".ax-sec-preview");if(a){g.tap(),r.disabled=!0;try{const n=await z(t);if(!n){d.error("❌ Impossible de déchiffrer");return}a.textContent=n,a.style.color="#22cc77",k.record("vault.secret_revealed",{details:{id:t}}),setTimeout(()=>{a.textContent=j(n),a.style.color=""},5e3)}finally{r.disabled=!1}}}async function J(e){const r=e.dataset.id;if(!r)return;g.tap();const t=await z(r);if(!t){d.error("❌ Impossible de déchiffrer");return}try{await navigator.clipboard.writeText(t),d.success("📋 Copié 30s puis effacé du presse-papier"),k.record("vault.secret_copied",{details:{id:r}}),setTimeout(()=>{navigator.clipboard.writeText("")},3e4)}catch(i){w.warn("all-secrets","clipboard failed",{err:i}),d.error("❌ Copie refusée par le navigateur")}}async function Y(e,r,t){const i=r.dataset.id;if(!i||!i.startsWith("gn:"))return;const a=i.slice(3),n=f.list().find(u=>u.id===a);if(!n)return;const o=window.prompt("Nouveau label :",n.label);if(!o||o.trim()===n.label)return;const l=window.prompt("Aide-mémoire (optionnel) :",n.hint??"")??void 0;(l===void 0?f.rename(a,o):f.rename(a,o,l))?(d.success("✅ Renommé"),await y(e,t)):d.error("❌ Renommage échoué")}async function Q(e,r,t){const i=r.dataset.id;if(!i)return;const a=i.indexOf(":");if(a<0)return;const n=i.slice(0,a),o=i.slice(a+1);if(!o||!window.confirm(`Supprimer ce secret ?

(backup 30j conservé pour restauration)`))return;g.medium();let l=!1;if(n==="gn")l=f.remove(o);else if(n==="lg")try{const u=`apex_v13_recovery_backup_${o}_${Date.now()}`,b=localStorage.getItem(o);b&&localStorage.setItem(u,b),localStorage.removeItem(o),l=!0}catch{l=!1}else if(n==="mk")try{S.removeKey(o),l=!0}catch(u){w.warn("all-secrets","multi-key remove failed",{err:u})}l?(k.record("vault.secret_deleted",{details:{id:i,src:n}}),d.success("🗑 Supprimé (backup 30j)"),await y(e,t)):d.error("❌ Suppression échouée")}async function X(){try{const e={exported_at:new Date().toISOString(),version:1,multi_key_vault:S.listAll(!0),legacy:_.filter(a=>a.category!=="forbidden").map(a=>({key:a.storageKey,name:a.name,cipher:localStorage.getItem(a.storageKey)})).filter(a=>a.cipher),generic:f.list()},r=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),t=URL.createObjectURL(r),i=document.createElement("a");i.href=t,i.download=`apex-secrets-${new Date().toISOString().slice(0,10)}.json`,i.click(),URL.revokeObjectURL(t),k.record("vault.secrets_exported",{}),d.success("📤 Export téléchargé (chiffré)")}catch(e){w.warn("all-secrets","export failed",{err:e}),d.error("❌ Export échoué")}}async function de(e){if(!(q.get("isAdmin")===!0)){e.innerHTML=`
      <div style="padding:40px;text-align:center;color:#999">
        <h2 style="color:#c9a227">🔒 Accès admin uniquement</h2>
        <p>Cette section est réservée à Kevin.</p>
      </div>
    `;return}s?.cleanup(),s=T("all-secrets"),await y(e)}export{le as dispose,de as render};
