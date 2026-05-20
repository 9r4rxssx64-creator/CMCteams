import{e as d}from"./escape-html-BlQj2yEF.js";import{c as S}from"./listener-cleanup-Y2rGGxxX.js";import{l as k}from"./monitoring-3uBGKGRH.js";import{s as C}from"../core/main-CDwVTNJR.js";import{f as n}from"./voice-CKlB4PWs.js";import{haptic as c}from"./haptic-CQFg2PXZ.js";import{toast as p}from"./toast-CRdbcLoc.js";import"./apex-kb-BaxCKkKm.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-vwBLLHvK.js";const A={studio:"🎨 Studios",pro:"💼 Modules Pro",voice:"🎙 Voix",browser:"🌐 Browser",sentinel:"🛡 Sentinelles",tool:"🛠 Outils IA",auth:"🔐 Authentification",admin:"👑 Admin",module:"📦 Modules"};let b="",l=null;function J(){m?.cleanup(),m=null}function Q(){b="",l=null}function z(){try{const e=localStorage.getItem("ax_users_v13");if(e){const t=JSON.parse(e);if(Array.isArray(t))return t.filter(r=>typeof r?.id=="string"&&typeof r?.name=="string").map(r=>({id:r.id,name:r.name}))}}catch{}return[{id:"kdmc_admin",name:"Kevin DESARZENS (admin)"},{id:"laurence_sp",name:"Laurence SAINT-POLIT"}]}function U(e){const t=n.list();if(!e.trim())return t;const r=e.toLowerCase().trim();return t.filter(a=>a.id.toLowerCase().includes(r)||a.description.toLowerCase().includes(r)||a.category.toLowerCase().includes(r))}function F(e){const t=new Map;for(const r of e){const a=t.get(r.category)??[];a.push(r),t.set(r.category,a)}return t}function O(e){const t=l?n.isEnabledForUser(e.id,l):n.isEnabledGlobal(e.id),r=d(e.id),a=d(e.description);return`
    <div class="ax-toggle-row" data-feature="${r}" style="display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid rgba(201,162,39,0.1)">
      <div style="flex:1;min-width:0">
        <div style="color:#fff;font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a}</div>
        <code style="color:#888;font-size:11px">${r}</code>
      </div>
      <button class="${t?"ax-toggle-on":"ax-toggle-off"}" data-toggle="${r}"
        style="min-width:64px;min-height:32px;padding:4px 12px;border:1px solid ${t?"#c9a227":"rgba(255,255,255,0.2)"};background:${t?"#c9a227":"transparent"};color:${t?"#000":"#999"};border-radius:16px;cursor:pointer;font-weight:600;font-size:12px"
        aria-label="${t?"Désactiver":"Activer"} ${a}"
        aria-pressed="${t}">
        ${t?"ON":"OFF"}
      </button>
      <button data-per-user="${r}"
        style="min-width:36px;min-height:32px;padding:4px 8px;border:1px solid rgba(201,162,39,0.3);background:transparent;color:#c9a227;border-radius:6px;cursor:pointer;font-size:11px"
        title="Configurer per-user">
        👤
      </button>
    </div>
  `}function T(e,t){const r=A[e]??e,a=t.filter(o=>l?n.isEnabledForUser(o.id,l):n.isEnabledGlobal(o.id)).length;return`
    <section data-category="${d(e)}" style="background:rgba(20,20,35,0.5);border:1px solid rgba(201,162,39,0.2);border-radius:12px;margin-bottom:14px;overflow:hidden">
      <header style="padding:10px 14px;background:rgba(201,162,39,0.08);border-bottom:1px solid rgba(201,162,39,0.2);display:flex;align-items:center;justify-content:space-between">
        <h2 style="margin:0;color:#c9a227;font-size:14px">${r}</h2>
        <span style="color:#888;font-size:11px">${a}/${t.length} actifs</span>
      </header>
      <div>${t.map(O).join("")}</div>
    </section>
  `}function R(){return`
    <select id="ax-toggles-user-filter" class="ax-select-sm"
      style="padding:6px 10px;background:rgba(255,255,255,0.05);border:1px solid rgba(201,162,39,0.3);color:#fff;border-radius:6px;font-size:13px">
      <option value="">Global (général)</option>
      ${z().map(r=>`<option value="${d(r.id)}" ${l===r.id?"selected":""}>${d(r.name)}</option>`).join("")}
    </select>
  `}function L(){const e=n.getStats();return`
    <header style="display:flex;align-items:center;flex-wrap:wrap;gap:10px;padding:14px;background:rgba(20,20,35,0.95);border-bottom:1px solid rgba(201,162,39,0.3);position:sticky;top:0;z-index:10">
      <h1 style="margin:0;color:#c9a227;font-size:18px;flex:1;min-width:160px">🔘 Toggles ON/OFF</h1>
      <span style="color:#888;font-size:12px">${e.enabledGlobal}/${e.total} actifs · ${e.users} users</span>
      <input type="search" id="ax-toggles-search" aria-label="Rechercher une feature dans les toggles" placeholder="Rechercher feature..." value="${d(b)}"
        style="padding:6px 10px;background:rgba(255,255,255,0.05);border:1px solid rgba(201,162,39,0.3);color:#fff;border-radius:6px;font-size:13px;min-width:160px">
      ${R()}
      <button class="ax-btn" data-action="enable-all" style="padding:6px 12px;background:rgba(201,162,39,0.15);border:1px solid #c9a227;color:#c9a227;border-radius:6px;cursor:pointer;font-size:12px">Tout activer</button>
      <button class="ax-btn" data-action="disable-all" style="padding:6px 12px;background:rgba(255,100,100,0.1);border:1px solid #ff6666;color:#ff6666;border-radius:6px;cursor:pointer;font-size:12px">Tout désactiver</button>
      <button class="ax-btn" data-action="reset-defaults" style="padding:6px 12px;background:transparent;border:1px solid rgba(201,162,39,0.3);color:#c9a227;border-radius:6px;cursor:pointer;font-size:12px">Reset défauts</button>
      <button class="ax-btn" data-action="export-config" style="padding:6px 12px;background:transparent;border:1px solid rgba(201,162,39,0.3);color:#c9a227;border-radius:6px;cursor:pointer;font-size:12px">📤 Export</button>
    </header>
  `}function M(e){const t=n.get(e);if(!t)return"";const a=z().map(o=>{const i=_(o.id),s=Object.prototype.hasOwnProperty.call(i,e),u=n.isEnabledForUser(e,o.id);return`
        <div style="display:flex;align-items:center;gap:10px;padding:8px;border-bottom:1px solid rgba(201,162,39,0.1)">
          <div style="flex:1;color:#fff;font-size:13px">${d(o.name)}</div>
          <span style="color:${s?"#c9a227":"#888"};font-size:11px">${s?"override":"global"}</span>
          <button data-modal-toggle="${d(e)}" data-modal-uid="${d(o.id)}"
            style="min-width:54px;min-height:30px;padding:4px 10px;border:1px solid ${u?"#c9a227":"rgba(255,255,255,0.2)"};background:${u?"#c9a227":"transparent"};color:${u?"#000":"#999"};border-radius:14px;cursor:pointer;font-weight:600;font-size:11px">
            ${u?"ON":"OFF"}
          </button>
          ${s?`<button data-modal-remove="${d(e)}" data-modal-uid="${d(o.id)}" style="padding:4px 8px;background:transparent;border:1px solid rgba(255,100,100,0.3);color:#ff6666;border-radius:4px;cursor:pointer;font-size:10px">Reset</button>`:""}
        </div>
      `}).join("");return`
    <div id="ax-toggles-modal" role="dialog" aria-modal="true" aria-labelledby="ax-toggles-modal-title"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px">
      <div style="max-width:480px;width:100%;background:#0a0a14;border:1px solid rgba(201,162,39,0.4);border-radius:14px;overflow:hidden">
        <header style="padding:14px;border-bottom:1px solid rgba(201,162,39,0.3);display:flex;justify-content:space-between;align-items:center">
          <h3 id="ax-toggles-modal-title" style="margin:0;color:#c9a227;font-size:15px">👤 Per-user : ${d(t.description)}</h3>
          <button data-action="modal-close" style="padding:6px 10px;background:transparent;border:1px solid rgba(255,255,255,0.2);color:#999;border-radius:6px;cursor:pointer">✕</button>
        </header>
        <div style="max-height:60vh;overflow-y:auto">${a||'<p style="padding:20px;color:#888;text-align:center">Aucun utilisateur connu.</p>'}</div>
        <footer style="padding:10px 14px;background:rgba(201,162,39,0.05);font-size:11px;color:#888;text-align:center">
          Per-user override > Global > Default
        </footer>
      </div>
    </div>
  `}function _(e){try{const t=localStorage.getItem("ax_feature_toggles_user_"+e);return t?JSON.parse(t):{}}catch{return{}}}function f(e){if(!C.get("isAdmin")){e.innerHTML=`
      <div class="ax-empty" style="padding:40px;text-align:center;color:#999">
        <h2 style="color:#c9a227">Accès réservé</h2>
        <p>Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}const r=U(b),o=[...F(r).entries()].sort((s,u)=>s[0].localeCompare(u[0])).map(([s,u])=>T(s,u)).join(""),i=l?`<div style="padding:10px 14px;background:rgba(201,162,39,0.1);border-bottom:1px solid rgba(201,162,39,0.2);color:#c9a227;font-size:12px">📌 Mode per-user : <strong>${d(l)}</strong> — les changements n'affectent que cet utilisateur. <button data-action="clear-user-filter" style="margin-left:8px;padding:2px 8px;background:transparent;border:1px solid rgba(201,162,39,0.4);color:#c9a227;border-radius:4px;cursor:pointer;font-size:11px">Repasser global</button></div>`:"";e.innerHTML=`
    <div class="ax-admin-toggles" style="background:#0a0a14;color:#fff;min-height:100vh;font-family:system-ui,-apple-system,sans-serif">
      ${L()}
      ${i}
      <main style="padding:14px;max-width:900px;margin:0 auto">
        ${o||'<p style="text-align:center;color:#888;padding:40px">Aucune feature trouvée pour "<strong>'+d(b)+'</strong>".</p>'}
      </main>
    </div>
  `,j(e)}let m=null;function j(e){m?.cleanup();const t=S("admin-toggles");m=t;const r=e.querySelector("#ax-toggles-search");r&&t.bind(r,"input",()=>{b=r.value,f(e);const o=e.querySelector("#ax-toggles-search");o&&(o.focus(),o.setSelectionRange(b.length,b.length))});const a=e.querySelector("#ax-toggles-user-filter");a&&t.bind(a,"change",()=>{l=a.value||null,c.selection(),f(e)}),e.querySelectorAll("[data-toggle]").forEach(o=>{t.bind(o,"click",()=>{const i=o.dataset.toggle;if(i){if(c.tap(),l){const s=n.isEnabledForUser(i,l);n.setForUser(i,l,!s),p.success(`${i} ${s?"désactivé":"activé"} pour ${l}`)}else{const s=n.isEnabledGlobal(i);n.setGlobal(i,!s),p.success(`${i} ${s?"désactivé":"activé"}`)}f(e)}})}),e.querySelectorAll("[data-per-user]").forEach(o=>{t.bind(o,"click",()=>{const i=o.dataset.perUser;i&&(c.tap(),$(e,i))})}),e.querySelectorAll("[data-action]").forEach(o=>{t.bind(o,"click",()=>{switch(o.dataset.action){case"enable-all":c.medium(),n.enableAll(),p.success("Toutes les features activées"),f(e);break;case"disable-all":if(!confirm("Désactiver TOUTES les features globalement ? Confirmer"))return;c.warning(),n.disableAll(),p.warn("Toutes les features désactivées"),f(e);break;case"reset-defaults":c.medium(),n.resetDefaults(),p.info("Reset aux valeurs par défaut"),f(e);break;case"export-config":{c.tap();const s=n.exportConfig();navigator.clipboard?navigator.clipboard.writeText(s).then(()=>p.success("Config copiée dans le presse-papier")).catch(()=>{k.info("admin-toggles","export config (no clipboard)",{json:s}),p.info("Config exportée (voir console)")}):(k.info("admin-toggles","export config",{json:s}),p.info("Config exportée (voir console)"));break}case"clear-user-filter":l=null,c.selection(),f(e);break;case"modal-close":y();break}})})}function $(e,t){y();const r=document.createElement("div");r.innerHTML=M(t);const a=r.firstElementChild;if(!a)return;document.body.appendChild(a),(m??S("admin-toggles-modal")).bind(a,"click",i=>{const s=i.target;if(s===a){y();return}if(s.closest('[data-action="modal-close"]')){y();return}const h=s.closest("[data-modal-toggle]");if(h){const g=h.dataset.modalToggle,x=h.dataset.modalUid;if(!g||!x)return;const w=n.isEnabledForUser(g,x);n.setForUser(g,x,!w),c.tap(),p.success(`${g} ${w?"désactivé":"activé"} pour ${x}`),$(e,g),f(e);return}const v=s.closest("[data-modal-remove]");if(v){const g=v.dataset.modalRemove,x=v.dataset.modalUid;if(!g||!x)return;n.removeUserOverride(g,x),c.tap(),p.info(`Override retiré pour ${x}`),$(e,g),f(e)}})}function y(){const e=document.getElementById("ax-toggles-modal");e&&e.parentNode&&e.parentNode.removeChild(e)}export{Q as _resetState,J as dispose,f as render};
