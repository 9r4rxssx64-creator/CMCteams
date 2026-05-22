import{e as l}from"./escape-html-BlQj2yEF.js";import{c as S}from"./listener-cleanup-Y2rGGxxX.js";import{s as A,l as k}from"./monitoring-Bl85iYvy.js";import{f as n}from"./apex-tools-dispatch-core-BeYV5sWk.js";import{haptic as c}from"./haptic-CQFg2PXZ.js";import{toast as p}from"./toast-CRdbcLoc.js";import"./multi-source-analyze-DfuDcC7m.js";import"./apex-kb-CAfWvMOn.js";import"./credential-patterns-CLzI061R.js";import"./apex-tools-dispatch-skills-CdD7Sr1W.js";import"./apex-tools-dispatch-data-ByzpzGMP.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-DhdhgHe_.js";import"./apex-tools-misc-DPMkGN9i.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";const U={studio:"🎨 Studios",pro:"💼 Modules Pro",voice:"🎙 Voix",browser:"🌐 Browser",sentinel:"🛡 Sentinelles",tool:"🛠 Outils IA",auth:"🔐 Authentification",admin:"👑 Admin",module:"📦 Modules"};let b="",d=null;function X(){m?.cleanup(),m=null}function ee(){b="",d=null}function C(){try{const e=localStorage.getItem("ax_users_v13");if(e){const t=JSON.parse(e);if(Array.isArray(t))return t.filter(r=>typeof r?.id=="string"&&typeof r?.name=="string").map(r=>({id:r.id,name:r.name}))}}catch{}return[{id:"kdmc_admin",name:"Kevin DESARZENS (admin)"},{id:"laurence_sp",name:"Laurence SAINT-POLIT"}]}function F(e){const t=n.list();if(!e.trim())return t;const r=e.toLowerCase().trim();return t.filter(o=>o.id.toLowerCase().includes(r)||o.description.toLowerCase().includes(r)||o.category.toLowerCase().includes(r))}function O(e){const t=new Map;for(const r of e){const o=t.get(r.category)??[];o.push(r),t.set(r.category,o)}return t}function T(e){const t=d?n.isEnabledForUser(e.id,d):n.isEnabledGlobal(e.id),r=l(e.id),o=l(e.description);return`
    <div class="ax-toggle-row" data-feature="${r}" style="display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid rgba(201,162,39,0.1)">
      <div class="ax-gs-6">
        <div style="color:#fff;font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${o}</div>
        <code class="ax-gs-208">${r}</code>
      </div>
      <button class="${t?"ax-toggle-on":"ax-toggle-off"}" data-toggle="${r}"
        style="min-width:64px;min-height:32px;padding:4px 12px;border:1px solid ${t?"#c9a227":"rgba(255,255,255,0.2)"};background:${t?"#c9a227":"transparent"};color:${t?"#000":"#999"};border-radius:16px;cursor:pointer;font-weight:600;font-size:12px"
        aria-label="${t?"Désactiver":"Activer"} ${o}"
        aria-pressed="${t}">
        ${t?"ON":"OFF"}
      </button>
      <button data-per-user="${r}"
        style="min-width:36px;min-height:32px;padding:4px 8px;border:1px solid rgba(201,162,39,0.3);background:transparent;color:#c9a227;border-radius:6px;cursor:pointer;font-size:11px"
        title="Configurer per-user">
        👤
      </button>
    </div>
  `}function z(e,t){const r=U[e]??e,o=t.filter(a=>d?n.isEnabledForUser(a.id,d):n.isEnabledGlobal(a.id)).length;return`
    <section data-category="${l(e)}" style="background:rgba(20,20,35,0.5);border:1px solid rgba(201,162,39,0.2);border-radius:12px;margin-bottom:14px;overflow:hidden">
      <header style="padding:10px 14px;background:rgba(201,162,39,0.08);border-bottom:1px solid rgba(201,162,39,0.2);display:flex;align-items:center;justify-content:space-between">
        <h2 style="margin:0;color:#c9a227;font-size:14px">${r}</h2>
        <span class="ax-gs-208">${o}/${t.length} actifs</span>
      </header>
      <div>${t.map(T).join("")}</div>
    </section>
  `}function R(){return`
    <select id="ax-toggles-user-filter" class="ax-select-sm"
      style="padding:6px 10px;background:rgba(255,255,255,0.05);border:1px solid rgba(201,162,39,0.3);color:#fff;border-radius:6px;font-size:13px">
      <option value="">Global (général)</option>
      ${C().map(r=>`<option value="${l(r.id)}" ${d===r.id?"selected":""}>${l(r.name)}</option>`).join("")}
    </select>
  `}function L(){const e=n.getStats();return`
    <header class="ax-gs-313">
      <h1 class="ax-gs-314">🔘 Toggles ON/OFF</h1>
      <span class="ax-gs-121">${e.enabledGlobal}/${e.total} actifs · ${e.users} users</span>
      <input type="search" id="ax-toggles-search" aria-label="Rechercher une feature dans les toggles" placeholder="Rechercher feature..." value="${l(b)}"
        style="padding:6px 10px;background:rgba(255,255,255,0.05);border:1px solid rgba(201,162,39,0.3);color:#fff;border-radius:6px;font-size:13px;min-width:160px">
      ${R()}
      <button class="ax-btn" data-action="enable-all" style="padding:6px 12px;background:rgba(201,162,39,0.15);border:1px solid #c9a227;color:#c9a227;border-radius:6px;cursor:pointer;font-size:12px">Tout activer</button>
      <button class="ax-btn" data-action="disable-all" style="padding:6px 12px;background:rgba(255,100,100,0.1);border:1px solid #ff6666;color:#ff6666;border-radius:6px;cursor:pointer;font-size:12px">Tout désactiver</button>
      <button class="ax-btn ax-gs-323" data-action="reset-defaults">Reset défauts</button>
      <button class="ax-btn ax-gs-323" data-action="export-config">📤 Export</button>
    </header>
  `}function M(e){const t=n.get(e);if(!t)return"";const o=C().map(a=>{const i=_(a.id),s=Object.prototype.hasOwnProperty.call(i,e),u=n.isEnabledForUser(e,a.id);return`
        <div style="display:flex;align-items:center;gap:10px;padding:8px;border-bottom:1px solid rgba(201,162,39,0.1)">
          <div style="flex:1;color:#fff;font-size:13px">${l(a.name)}</div>
          <span style="color:${s?"#c9a227":"#888"};font-size:11px">${s?"override":"global"}</span>
          <button data-modal-toggle="${l(e)}" data-modal-uid="${l(a.id)}"
            style="min-width:54px;min-height:30px;padding:4px 10px;border:1px solid ${u?"#c9a227":"rgba(255,255,255,0.2)"};background:${u?"#c9a227":"transparent"};color:${u?"#000":"#999"};border-radius:14px;cursor:pointer;font-weight:600;font-size:11px">
            ${u?"ON":"OFF"}
          </button>
          ${s?`<button data-modal-remove="${l(e)}" data-modal-uid="${l(a.id)}" style="padding:4px 8px;background:transparent;border:1px solid rgba(255,100,100,0.3);color:#ff6666;border-radius:4px;cursor:pointer;font-size:10px">Reset</button>`:""}
        </div>
      `}).join("");return`
    <div id="ax-toggles-modal" role="dialog" aria-modal="true" aria-labelledby="ax-toggles-modal-title"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px">
      <div style="max-width:480px;width:100%;background:#0a0a14;border:1px solid rgba(201,162,39,0.4);border-radius:14px;overflow:hidden">
        <header class="ax-gs-206">
          <h3 id="ax-toggles-modal-title" class="ax-gs-319">👤 Per-user : ${l(t.description)}</h3>
          <button data-action="modal-close" class="ax-gs-320">✕</button>
        </header>
        <div style="max-height:60vh;overflow-y:auto">${o||'<p style="padding:20px;color:#888;text-align:center">Aucun utilisateur connu.</p>'}</div>
        <footer class="ax-gs-321">
          Per-user override > Global > Default
        </footer>
      </div>
    </div>
  `}function _(e){try{const t=localStorage.getItem("ax_feature_toggles_user_"+e);return t?JSON.parse(t):{}}catch{return{}}}function f(e){if(!A.get("isAdmin")){e.innerHTML=`
      <div class="ax-empty ax-gs-207">
        <h2 class="ax-gs-266">Accès réservé</h2>
        <p>Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}const r=F(b),a=[...O(r).entries()].sort((s,u)=>s[0].localeCompare(u[0])).map(([s,u])=>z(s,u)).join(""),i=d?`<div style="padding:10px 14px;background:rgba(201,162,39,0.1);border-bottom:1px solid rgba(201,162,39,0.2);color:#c9a227;font-size:12px">📌 Mode per-user : <strong>${l(d)}</strong> — les changements n'affectent que cet utilisateur. <button data-action="clear-user-filter" style="margin-left:8px;padding:2px 8px;background:transparent;border:1px solid rgba(201,162,39,0.4);color:#c9a227;border-radius:4px;cursor:pointer;font-size:11px">Repasser global</button></div>`:"";e.innerHTML=`
    <div class="ax-admin-toggles ax-gs-322">
      ${L()}
      ${i}
      <main style="padding:14px;max-width:900px;margin:0 auto">
        ${a||'<p style="text-align:center;color:#888;padding:40px">Aucune feature trouvée pour "<strong>'+l(b)+'</strong>".</p>'}
      </main>
    </div>
  `,N(e)}let m=null;function N(e){m?.cleanup();const t=S("admin-toggles");m=t;const r=e.querySelector("#ax-toggles-search");r&&t.bind(r,"input",()=>{b=r.value,f(e);const a=e.querySelector("#ax-toggles-search");a&&(a.focus(),a.setSelectionRange(b.length,b.length))});const o=e.querySelector("#ax-toggles-user-filter");o&&t.bind(o,"change",()=>{d=o.value||null,c.selection(),f(e)}),e.querySelectorAll("[data-toggle]").forEach(a=>{t.bind(a,"click",()=>{const i=a.dataset.toggle;if(i){if(c.tap(),d){const s=n.isEnabledForUser(i,d);n.setForUser(i,d,!s),p.success(`${i} ${s?"désactivé":"activé"} pour ${d}`)}else{const s=n.isEnabledGlobal(i);n.setGlobal(i,!s),p.success(`${i} ${s?"désactivé":"activé"}`)}f(e)}})}),e.querySelectorAll("[data-per-user]").forEach(a=>{t.bind(a,"click",()=>{const i=a.dataset.perUser;i&&(c.tap(),$(e,i))})}),e.querySelectorAll("[data-action]").forEach(a=>{t.bind(a,"click",()=>{switch(a.dataset.action){case"enable-all":c.medium(),n.enableAll(),p.success("Toutes les features activées"),f(e);break;case"disable-all":if(!confirm("Désactiver TOUTES les features globalement ? Confirmer"))return;c.warning(),n.disableAll(),p.warn("Toutes les features désactivées"),f(e);break;case"reset-defaults":c.medium(),n.resetDefaults(),p.info("Reset aux valeurs par défaut"),f(e);break;case"export-config":{c.tap();const s=n.exportConfig();navigator.clipboard?navigator.clipboard.writeText(s).then(()=>p.success("Config copiée dans le presse-papier")).catch(()=>{k.info("admin-toggles","export config (no clipboard)",{json:s}),p.info("Config exportée (voir console)")}):(k.info("admin-toggles","export config",{json:s}),p.info("Config exportée (voir console)"));break}case"clear-user-filter":d=null,c.selection(),f(e);break;case"modal-close":v();break}})})}function $(e,t){v();const r=document.createElement("div");r.innerHTML=M(t);const o=r.firstElementChild;if(!o)return;document.body.appendChild(o),(m??S("admin-toggles-modal")).bind(o,"click",i=>{const s=i.target;if(s===o){v();return}if(s.closest('[data-action="modal-close"]')){v();return}const h=s.closest("[data-modal-toggle]");if(h){const g=h.dataset.modalToggle,x=h.dataset.modalUid;if(!g||!x)return;const w=n.isEnabledForUser(g,x);n.setForUser(g,x,!w),c.tap(),p.success(`${g} ${w?"désactivé":"activé"} pour ${x}`),$(e,g),f(e);return}const y=s.closest("[data-modal-remove]");if(y){const g=y.dataset.modalRemove,x=y.dataset.modalUid;if(!g||!x)return;n.removeUserOverride(g,x),c.tap(),p.info(`Override retiré pour ${x}`),$(e,g),f(e)}})}function v(){const e=document.getElementById("ax-toggles-modal");e&&e.parentNode&&e.parentNode.removeChild(e)}export{ee as _resetState,X as dispose,f as render};
