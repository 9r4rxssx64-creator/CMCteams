import{l as b}from"./monitoring-675b-Ybt.js";import{s as y}from"../core/main-CJ6ETfJo.js";import{detectCredential as h,CREDENTIAL_PATTERNS as v}from"./credential-patterns-BybElwOv.js";import{v as u}from"./apex-kb-D33v8GGx.js";import{h as p}from"./haptic-BUEqXK0N.js";import{toast as c}from"./toast-Dgg9rcIP.js";import"./apex-tools-dispatch-DwcAIGVp.js";import"./apex-tools-registry-oQuNaPP9.js";function o(e){return e.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]??a)}function m(){return v.filter(e=>e.category!=="forbidden").map(e=>{const a=u.getKeyStatus(e.storageKey),t=(()=>{try{return localStorage.getItem(e.storageKey)??""}catch{return""}})(),s=t&&t.length>8&&!t.startsWith("AXENC1:")?u.maskKey(t):t.startsWith("AXENC1:")?"🔒 chiffré":"";return{pattern:e,status:a,masked:s}})}function k(e,a){return e.filter(t=>{if(a.category&&t.pattern.category!==a.category||a.configuredOnly&&t.status==="empty")return!1;if(a.query){const s=a.query.toLowerCase();if(!(t.pattern.name.toLowerCase().includes(s)||t.pattern.storageKey.toLowerCase().includes(s)))return!1}return!0})}async function w(e){const a=e.trim();if(!a)return{ok:!1,reason:"Entrée vide"};const t=h(a);if(!t)return{ok:!1,reason:"Aucun pattern reconnu"};if(t.category==="forbidden")return{ok:!1,reason:"🚨 Type interdit (cartes/seed phrases jamais stockées)"};try{const s=await u.encryptAuto(a);return localStorage.setItem(t.storageKey,s),{ok:!0,pattern_name:t.name,storage_key:t.storageKey}}catch(s){return b.warn("vault-feature","autoDetectAndStore failed",{err:s}),{ok:!1,reason:"Erreur chiffrement"}}}function $(e){try{return localStorage.removeItem(e),!0}catch(a){return b.warn("vault-feature","remove failed",{err:a}),!1}}function z(e){const a={exported_at:new Date().toISOString(),version:1,entries:e.filter(t=>t.status!=="empty").map(t=>{const s=(()=>{try{return localStorage.getItem(t.pattern.storageKey)??""}catch{return""}})();return{storage_key:t.pattern.storageKey,name:t.pattern.name,value_encrypted:s}})};return JSON.stringify(a,null,2)}const S={configured:{label:"Configurée",color:"#22cc77",icon:"🟢"},encrypted:{label:"Chiffrée",color:"#22cc77",icon:"🔐"},plaintext_legacy:{label:"À migrer",color:"#ffaa00",icon:"🟠"},empty:{label:"Non configurée",color:"#888",icon:"⚪"}},A=[{id:"ai",label:"IA",icon:"🤖"},{id:"saas",label:"SaaS",icon:"🛠"},{id:"devops",label:"DevOps",icon:"⚙️"},{id:"finance",label:"Finance",icon:"💰"},{id:"comms",label:"Comms",icon:"💬"},{id:"storage",label:"Storage",icon:"💾"},{id:"identity",label:"Identité",icon:"🪪"}];let g="all",x=!1,f="";function C(e,a=0){const t=S[e.status],s="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.7);text-decoration:none;border-radius:8px;font-size:11px;font-weight:500;border:1px solid rgba(255,255,255,0.06);transition:all 160ms cubic-bezier(0.16,1,0.3,1)",r=[];e.pattern.dashboard&&r.push(`<a href="${o(e.pattern.dashboard)}" target="_blank" rel="noopener" style="${s}">📊 Dashboard</a>`),e.pattern.billing&&r.push(`<a href="${o(e.pattern.billing)}" target="_blank" rel="noopener" style="${s}">💳 Billing</a>`),e.pattern.docs&&r.push(`<a href="${o(e.pattern.docs)}" target="_blank" rel="noopener" style="${s}">📖 Docs</a>`),e.pattern.support&&r.push(`<a href="${o(e.pattern.support)}" target="_blank" rel="noopener" style="${s}">🆘 Support</a>`);const n={ai:"106,138,255",saas:"160,96,255",devops:"34,204,119",finance:"232,184,48",comms:"255,107,157",storage:"79,214,224",identity:"255,170,0"}[e.pattern.category]??"160,160,180",l="min-height:36px;padding:8px 12px;font-size:12px;font-weight:600;border-radius:9px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 160ms cubic-bezier(0.16,1,0.3,1);border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.85)";return`
    <li class="ax-vault-row ax-modernized-card" data-vault-key="${o(e.pattern.storageKey)}"
      style="background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));backdrop-filter:blur(12px) saturate(140%);-webkit-backdrop-filter:blur(12px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px;margin-bottom:10px;border-left:3px solid ${o(t.color)};animation:ax-fade-up 280ms cubic-bezier(0.16,1,0.3,1) ${30+a*20}ms backwards;transition:all 200ms cubic-bezier(0.16,1,0.3,1)">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div style="flex:1;min-width:220px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap">
            <span style="font-size:18px;filter:drop-shadow(0 2px 4px ${o(t.color)}55)">${t.icon}</span>
            <strong style="color:#fff;font-size:14px;letter-spacing:-0.01em">${o(e.pattern.name)}</strong>
            <span style="display:inline-block;background:rgba(${n},0.15);color:rgba(${n},1);font-size:10px;padding:3px 8px;border-radius:24px;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;border:1px solid rgba(${n},0.25)">${o(e.pattern.category)}</span>
            <span style="display:inline-block;padding:2px 8px;background:rgba(${t.color==="#22cc77"?"34,204,119":t.color==="#ffaa00"?"255,170,0":"160,160,180"},0.12);color:${o(t.color)};border-radius:24px;font-size:10px;font-weight:700;letter-spacing:0.04em">${o(t.label)}</span>
          </div>
          <code style="font-size:11px;color:rgba(255,255,255,0.4);display:block;font-family:ui-monospace,'SF Mono',Menlo,monospace">${o(e.pattern.storageKey)}</code>
          ${e.masked?`<code style="font-size:13px;color:${o(t.color)};display:block;margin-top:4px;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-weight:600">${o(e.masked)}</code>`:""}
          ${r.length>0?`<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${r.join("")}</div>`:""}
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;flex-shrink:0">
          ${e.status!=="empty"?`<button class="ax-bounce-tap" data-vault-test="${o(e.pattern.storageKey)}" style="${l}">🧪 Tester</button>`:""}
          <button class="ax-bounce-tap" data-vault-edit="${o(e.pattern.storageKey)}" style="${l};${e.status==="empty"?"background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border-color:transparent":""}">${e.status==="empty"?"➕ Ajouter":"✏️ Modifier"}</button>
          ${e.status!=="empty"?`<button class="ax-bounce-tap" data-vault-remove="${o(e.pattern.storageKey)}" style="${l};background:rgba(255,91,91,0.12);color:#ff5b5b;border-color:rgba(255,91,91,0.25)">🗑</button>`:""}
        </div>
      </div>
    </li>`}function L(){return[{id:"all",label:"🔍 Tous"},...A.map(a=>({id:a.id,label:`${a.icon} ${a.label}`}))].map(a=>{const t=g===a.id;return`
        <button class="ax-vault-cat-btn ax-bounce-tap ${t?"ax-tab-active":""}"
          data-vault-cat="${o(a.id)}"
          style="background:${t?"linear-gradient(135deg,#c9a227,#e8b830)":"rgba(255,255,255,0.04)"};color:${t?"#000":"rgba(255,255,255,0.7)"};border:1px solid ${t?"transparent":"rgba(255,255,255,0.08)"};padding:8px 14px;border-radius:24px;font-size:12px;font-weight:${t?"700":"500"};cursor:pointer;min-height:36px;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1);white-space:nowrap">
          ${o(a.label)}
        </button>`}).join("")}async function d(e){if(!y.get("isAdmin")){e.innerHTML=`<div style="padding:40px;text-align:center"><h2 style="color:#c9a227">🔒 Coffre admin</h2><p style="color:#a0a4c0">Cette section est réservée à l'admin Kevin.</p></div>`;return}const t=m(),s={configuredOnly:x,query:f};g!=="all"&&(s.category=g);const r=k(t,s),i={total:t.length,configured:t.filter(n=>n.status!=="empty").length,encrypted:t.filter(n=>n.status==="encrypted").length};e.innerHTML=`
    <style>
      @keyframes ax-fade-up {
        0% { opacity: 0; transform: translateY(12px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .ax-modernized-card:hover {
        transform: translateY(-2px);
        border-color: rgba(232,184,48,0.25) !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      }
      .ax-bounce-tap { transition: transform 120ms cubic-bezier(0.16,1,0.3,1); }
      .ax-bounce-tap:active { transform: scale(0.95); }
      @media (prefers-reduced-motion: reduce) {
        .ax-modernized-card { animation: none !important; transition: none !important; }
        .ax-modernized-card:hover { transform: none !important; }
        .ax-bounce-tap { transition: none !important; }
      }
    </style>
    <div class="ax-page" style="padding:24px 16px max(24px, env(safe-area-inset-bottom)) 16px;max-width:1140px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif">
      <header style="margin-bottom:24px;animation:ax-fade-up 360ms cubic-bezier(0.16,1,0.3,1) backwards">
        <h1 style="margin:0 0 6px;font-size:clamp(26px,4.5vw,32px);font-weight:700;background:linear-gradient(135deg,#c9a227 0%,#e8b830 50%,#f5cc4a 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:Georgia,serif;letter-spacing:-0.025em">🔐 Coffre-fort</h1>
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:8px">
          <div style="display:flex;align-items:center;gap:8px;padding:6px 12px;background:rgba(34,204,119,0.1);border:1px solid rgba(34,204,119,0.2);border-radius:24px">
            <span style="width:6px;height:6px;background:#22cc77;border-radius:50%;box-shadow:0 0 8px #22cc77"></span>
            <span style="color:#22cc77;font-size:12px;font-weight:600">${i.configured}/${i.total} configurées</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;padding:6px 12px;background:rgba(232,184,48,0.1);border:1px solid rgba(232,184,48,0.25);border-radius:24px">
            <span style="font-size:12px">🔐</span>
            <span style="color:#e8b830;font-size:12px;font-weight:600">${i.encrypted} chiffrées AES-256</span>
          </div>
        </div>
      </header>

      <section class="ax-modernized-card" style="margin-bottom:14px;background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));backdrop-filter:blur(20px) saturate(140%);-webkit-backdrop-filter:blur(20px) saturate(140%);border:1px solid rgba(232,184,48,0.18);border-radius:16px;padding:18px;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) 80ms backwards;transition:all 240ms cubic-bezier(0.16,1,0.3,1)">
        <h3 style="margin:0 0 8px;font-size:13px;color:#e8b830;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;display:flex;align-items:center;gap:6px">🔍 Auto-détection</h3>
        <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 12px;line-height:1.5">Colle ici n'importe quelle clé API. Apex la reconnaît automatiquement et la range au bon endroit.</p>
        <textarea id="ax-vault-paste" placeholder="Colle ta clé ici (ex: sk-ant-api03-..., AIzaSy..., re_...)"
          style="width:100%;background:rgba(0,0,0,0.35);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px 14px;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:13px;line-height:1.5;min-height:72px;resize:vertical;box-sizing:border-box;-webkit-appearance:none;transition:all 160ms"></textarea>
        <button id="ax-vault-paste-btn" class="ax-bounce-tap" style="margin-top:10px;padding:12px 22px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;min-height:44px;-webkit-tap-highlight-color:transparent;transition:all 160ms">🔍 Détecter & stocker</button>
        <div id="ax-vault-paste-result" style="margin-top:10px"></div>
      </section>

      <section style="margin-bottom:14px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) 120ms backwards">
        <input id="ax-vault-search" type="text" placeholder="🔍 Filtre par nom/clé..." value="${o(f)}"
          style="flex:1;min-width:220px;background:linear-gradient(135deg,rgba(20,20,35,0.6),rgba(14,14,28,0.4));backdrop-filter:blur(12px);color:#fff;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:11px 14px;font-size:14px;min-height:44px;-webkit-appearance:none;transition:all 160ms">
        <label style="display:flex;align-items:center;gap:8px;color:rgba(255,255,255,0.7);font-size:13px;cursor:pointer;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;min-height:44px;-webkit-tap-highlight-color:transparent;transition:all 160ms">
          <input type="checkbox" id="ax-vault-configured-only" ${x?"checked":""} style="cursor:pointer;accent-color:#e8b830">
          Configurées uniquement
        </label>
      </section>

      <section style="margin-bottom:14px;display:flex;gap:8px;flex-wrap:wrap;overflow-x:auto;-webkit-overflow-scrolling:touch;animation:ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) 160ms backwards">
        ${L()}
      </section>

      <section style="margin-bottom:24px">
        <ul style="list-style:none;padding:0;margin:0">
          ${r.length>0?r.map((n,l)=>C(n,l)).join(""):`
            <li style="text-align:center;padding:48px 24px;background:linear-gradient(135deg,rgba(20,20,35,0.5),rgba(14,14,28,0.3));border:1px solid rgba(255,255,255,0.06);border-radius:14px">
              <div style="font-size:32px;opacity:0.5;margin-bottom:10px">🔍</div>
              <div style="color:rgba(255,255,255,0.6);font-size:14px">Aucun credential pour ces filtres.</div>
            </li>`}
        </ul>
      </section>

      <section class="ax-modernized-card" style="background:linear-gradient(135deg,rgba(20,20,35,0.6),rgba(14,14,28,0.4));backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:16px;margin-bottom:18px;transition:all 200ms">
        <h3 style="margin:0 0 12px;color:#e8b830;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;font-weight:700">💾 Backup & Restore</h3>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button id="ax-vault-export" class="ax-bounce-tap" style="padding:10px 16px;background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3);border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;min-height:42px;-webkit-tap-highlight-color:transparent;transition:all 160ms">📥 Exporter coffre (JSON)</button>
          <button id="ax-vault-passphrase" class="ax-bounce-tap" style="padding:10px 16px;background:rgba(160,96,255,0.15);color:#a060ff;border:1px solid rgba(160,96,255,0.3);border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;min-height:42px;-webkit-tap-highlight-color:transparent;transition:all 160ms">🔑 Changer passphrase</button>
        </div>
      </section>

      <p style="text-align:center;color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.02em;line-height:1.6;padding:16px;background:rgba(255,255,255,0.02);border-radius:12px">
        🛡 <strong style="color:rgba(255,255,255,0.6)">Sécurité</strong> : AES-GCM 256 + PBKDF2 200k iterations · Audit log immutable<br>
        <span style="opacity:0.7">JAMAIS Firebase pour ax_pin/ax_user (FB_LOCAL strict)</span>
      </p>
    </div>
  `,q(e),b.info("feature-vault",`rendered (${t.length} entries, ${r.length} visible, ${i.configured} configured)`)}function q(e){e.querySelectorAll("[data-vault-cat]").forEach(r=>{r.addEventListener("click",()=>{p.selection();const i=r.dataset.vaultCat??"all";g=i==="all"?"all":i,d(e)})});const a=e.querySelector("#ax-vault-search");if(a){let r=null;a.addEventListener("input",()=>{r&&clearTimeout(r),r=setTimeout(()=>{f=a.value,d(e)},300)})}const t=e.querySelector("#ax-vault-configured-only");t&&t.addEventListener("change",()=>{x=t.checked,d(e)});const s=e.querySelector("#ax-vault-paste-btn");s&&s.addEventListener("click",()=>{(async()=>{p.tap();const r=e.querySelector("#ax-vault-paste"),i=e.querySelector("#ax-vault-paste-result");if(!r||!i)return;const n=await w(r.value);n.ok?(p.success(),c.success(`✅ ${n.pattern_name} stocké`),i.innerHTML=`<div style="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px;font-size:12px">✅ ${o(n.pattern_name)} → ${o(n.storage_key)}</div>`,r.value="",d(e)):(p.error(),c.error(n.reason),i.innerHTML=`<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px;font-size:12px">⚠ ${o(n.reason)}</div>`)})()}),e.querySelectorAll("[data-vault-edit]").forEach(r=>{r.addEventListener("click",()=>{(async()=>{p.tap();const i=r.dataset.vaultEdit??"";if(!i)return;const n=window.prompt(`Nouvelle valeur pour ${i} (laisser vide pour annuler) :`);if(!(n===null||n===""))try{const l=await u.encryptAuto(n);localStorage.setItem(i,l),c.success("Clé chiffrée et stockée"),d(e)}catch(l){b.warn("vault-feature","edit failed",{err:l}),c.error("Erreur chiffrement")}})()})}),e.querySelectorAll("[data-vault-remove]").forEach(r=>{r.addEventListener("click",()=>{p.tap();const i=r.dataset.vaultRemove??"";if(!i||!window.confirm(`Supprimer ${i} ?`))return;$(i)?(p.success(),c.success("Credential supprimé"),d(e)):(p.error(),c.error("Suppression échouée"))})}),e.querySelectorAll("[data-vault-test]").forEach(r=>{r.addEventListener("click",()=>{p.tap(),c.info("Test de validité non encore implémenté (Jet 5)")})}),e.querySelector("#ax-vault-export")?.addEventListener("click",()=>{p.tap();const r=z(m()),i=new Blob([r],{type:"application/json"}),n=URL.createObjectURL(i),l=document.createElement("a");l.href=n,l.download=`apex-vault-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(l),l.click(),document.body.removeChild(l),URL.revokeObjectURL(n),c.success("Coffre exporté (chiffré)")}),e.querySelector("#ax-vault-passphrase")?.addEventListener("click",()=>{p.tap(),c.info("Changement passphrase à implémenter (Jet 5)")})}export{w as autoDetectAndStore,o as escapeHtml,z as exportVaultJson,k as filterVaultEntries,m as listVaultEntries,$ as removeCredential,d as render};
//# sourceMappingURL=index-CVcu0Ngr.js.map
