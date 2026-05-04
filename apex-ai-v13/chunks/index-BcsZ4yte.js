const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./financial-bilan-DGvRDom8.js","./commerce-TOaxyB9g.js","../core/main-58GY0Lk-.js","../assets/css/main-GfJ7qlqs.css","./consumption-monitor-lN4NAIBy.js","./audit-log-Dp_D_Z3n.js","./links-registry-ByH6gWqH.js","./firebase-CO4hR_IC.js","./push-notifications-CVyEdQ2j.js","./tokens-dashboard-C5ZzZyK6.js","./consumption-dashboard-B2UiHfVi.js"])))=>i.map(i=>d[i]);
import{l as h,s as A,_ as w}from"../core/main-58GY0Lk-.js";import{apexExecute as x}from"./apex-execute-C67aL2BS.js";import{apexKnowledgeBase as g}from"./apex-knowledge-base-CdY-eDmy.js";import{auth as S}from"./auth-CL40XIBF.js";import{commerce as y}from"./commerce-TOaxyB9g.js";import{kdmcProjectsRegistry as k}from"./kdmc-projects-registry-CO6hl9Mo.js";import{firebase as C}from"./firebase-CO4hR_IC.js";import{h as d}from"./haptic-BUEqXK0N.js";import{toast as u}from"./toast-BkOpdP-z.js";import"./audit-log-Dp_D_Z3n.js";import"./claude-bridge-CbjEMB85.js";import"./vault-wDlE-k2B.js";import"./credential-patterns-Ct__OCbr.js";class T{OTP_TTL=1440*60*1e3;getKevinWhatsApp(){return localStorage.getItem("ax_kevin_whatsapp_phone")??""}async requestConfirmation(a){const n=this.getKevinWhatsApp();if(!n)return{ok:!1,reason:"Numéro Kevin WhatsApp non configuré"};const s=this.generateOTP(),l={uid:a.uid,name:a.name,whatsapp:a.whatsappPhone,otp:s,createdAt:Date.now(),expiresAt:Date.now()+this.OTP_TTL,confirmed:!1};try{const c=JSON.parse(localStorage.getItem("apex_v13_pending_confirms")??"[]");c.push(l),localStorage.setItem("apex_v13_pending_confirms",JSON.stringify(c))}catch(c){h.warn("whatsapp","persist failed",{err:c})}C.write("apex_v13_pending_confirms",l);const r=encodeURIComponent(`Bonjour Kevin, je suis ${a.name}. Voici mon code d'inscription Apex : ${s}`),o=`https://wa.me/${n.replace(/[^\d]/g,"")}?text=${r}`;return h.info("whatsapp",`Confirmation requested for ${a.name}`,{otp:s}),{ok:!0,inviteLink:o,otp:s}}confirm(a){try{const n=JSON.parse(localStorage.getItem("apex_v13_pending_confirms")??"[]"),s=n.find(e=>e.otp===a&&!e.confirmed&&e.expiresAt>Date.now());if(!s)return{ok:!1};s.confirmed=!0,localStorage.setItem("apex_v13_pending_confirms",JSON.stringify(n));const l=JSON.parse(localStorage.getItem("apex_v13_users")??"[]"),r=l.find(e=>e.id===s.uid);return r&&(r.activated=!0,localStorage.setItem("apex_v13_users",JSON.stringify(l))),h.info("whatsapp",`Confirmed ${s.name}`),{ok:!0,uid:s.uid}}catch(n){return h.error("whatsapp","confirm failed",{err:n}),{ok:!1}}}listPending(){try{return JSON.parse(localStorage.getItem("apex_v13_pending_confirms")??"[]").filter(n=>!n.confirmed&&n.expiresAt>Date.now())}catch{return[]}}generateOTP(){const a=crypto.getRandomValues(new Uint8Array(9)),n="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let s="";for(let l=0;l<12;l++){const r=a[l%a.length];s+=n[(r??0)%n.length]}return s.slice(0,6)+"-"+s.slice(6)}}const _=new T;let $="commerce";function i(t){return t.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]??a)}function j(){const t=y.isEnabled();return`
    <div class="ax-admin-section">
      <h2>Commercialisation</h2>
      <p class="ax-muted">
        Active le système d'abonnements pour les non-admin. Toi (Kevin admin) gardes l'accès illimité dans tous les cas.
      </p>
      <div class="ax-toggle-row">
        <label class="ax-toggle">
          <input type="checkbox" id="commerce-toggle" ${t?"checked":""}>
          <span class="ax-toggle-slider"></span>
          <span class="ax-toggle-label">Commercialisation ${t?"<strong>ACTIVÉE</strong>":"<strong>désactivée</strong>"}</span>
        </label>
      </div>
      <div class="ax-info-card">
        <h3>Plans disponibles</h3>
        <ul>
          <li><strong>free</strong> : 50 msg/jour, 1 studio, voix basique</li>
          <li><strong>basic 9€/mois</strong> : 500 msg/jour, 5 studios, voix basique</li>
          <li><strong>pro 29€/mois</strong> : illimité, 23 studios, voix premium, marketplace</li>
          <li><strong>business sur devis</strong> : multi-user, marketplace 30%, white-label</li>
          <li><strong>admin</strong> (toi Kevin) : tout illimité, jamais bloqué</li>
        </ul>
      </div>
    </div>
  `}function L(){const t=S.listUsers(),a=new Set(["admin","family","client_pro","client_free"]),n=t.map(s=>{const l=a.has(s.tier)?s.tier:"client_free";return`
      <li class="ax-user-row">
        <span class="ax-user-name">${i(s.name)}</span>
        <span class="ax-tier-badge ax-tier-${l}">${i(l)}</span>
        ${s.activated?'<span class="ax-badge ax-badge-ok">activé</span>':'<span class="ax-badge ax-badge-pending">en attente</span>'}
        <select data-user-plan="${i(s.id)}" class="ax-select-sm">
          <option value="free">free</option>
          <option value="basic">basic</option>
          <option value="pro">pro</option>
          <option value="business">business</option>
        </select>
      </li>
    `}).join("");return`
    <div class="ax-admin-section">
      <h2>Créer un compte</h2>
      <form id="create-user-form" class="ax-form">
        <label>
          Nom complet
          <input type="text" id="cu-name" required minlength="2" autocomplete="off">
        </label>
        <label>
          Type de compte
          <select id="cu-tier" required>
            <option value="family">Famille</option>
            <option value="client_pro">Client Pro</option>
            <option value="client_free">Client Gratuit</option>
          </select>
        </label>
        <label>
          Email (optionnel)
          <input type="email" id="cu-email" autocomplete="off">
        </label>
        <label>
          Téléphone WhatsApp (avec indicatif, ex: +33612345678)
          <input type="tel" id="cu-whatsapp" autocomplete="off" placeholder="+33...">
        </label>
        <label>
          Code PIN initial (optionnel — sinon le client le crée à sa 1ère connexion)
          <input type="password" id="cu-pin" minlength="4" autocomplete="new-password">
        </label>
        <button type="submit" class="ax-btn ax-btn-primary">Créer le compte</button>
      </form>
      <div id="create-user-result"></div>

      <h2>Comptes existants (${t.length})</h2>
      <ul class="ax-user-list">${n||`<li class="ax-muted">Aucun compte créé pour l'instant</li>`}</ul>
    </div>
  `}function P(){const t=_.listPending();return t.length?`
    <div class="ax-admin-section">
      <h2>Confirmations WhatsApp en attente</h2>
      <p class="ax-muted">Quand le client te a envoyé son code par WhatsApp, clique "Confirmer".</p>
      <ul class="ax-pending-list">${t.map(n=>`
      <li class="ax-pending-row">
        <strong>${i(n.name)}</strong>
        <span class="ax-muted">${i(n.whatsapp)}</span>
        <code class="ax-otp">${n.otp}</code>
        <button class="ax-btn ax-btn-sm" data-confirm-otp="${n.otp}">Confirmer</button>
      </li>
    `).join("")}</ul>
    </div>
  `:`
      <div class="ax-admin-section">
        <h2>Confirmations en attente</h2>
        <p class="ax-muted">Aucune confirmation à valider.</p>
      </div>
    `}function q(){return`
    <div class="ax-admin-section">
      <h2>État de santé</h2>
      <p class="ax-muted">Sentinelles + providers IA — Jet 2 enrichira avec dashboard live.</p>
    </div>
  `}function I(){const t=k.list(),a=k.count(),n=k.countActive(),s=["active","wip","archived"],l=t.map(r=>{const e=s.includes(r.status)?r.status:"archived",o=r.tech_stack.slice(0,4).map(c=>i(c)).join(", ");return`
        <li class="ax-project-row" data-project-id="${i(r.id)}">
          <div class="ax-project-head">
            <strong>${i(r.name)}</strong>
            <span class="ax-badge ax-badge-${e}">${i(e)}</span>
            <code class="ax-project-version">${i(r.version)}</code>
          </div>
          <p class="ax-muted">${i(r.description)}</p>
          <p class="ax-project-stack"><em>stack:</em> ${o||"—"}</p>
          <p class="ax-project-links">
            <a href="${i(r.deploy_url)}" target="_blank" rel="noopener">🚀 Live</a>
            ·
            <a href="${i(r.repo_url)}" target="_blank" rel="noopener">📦 Repo</a>
            · <span class="ax-muted">🛡 ${r.sentinels_count} sentinelles</span>
          </p>
          <div class="ax-project-edit">
            <input type="text" data-project-version="${i(r.id)}"
                   value="${i(r.version)}" placeholder="vX.Y" maxlength="20"
                   class="ax-input-sm" autocomplete="off">
            <select data-project-status="${i(r.id)}" class="ax-select-sm">
              <option value="active" ${r.status==="active"?"selected":""}>active</option>
              <option value="wip" ${r.status==="wip"?"selected":""}>wip</option>
              <option value="archived" ${r.status==="archived"?"selected":""}>archived</option>
            </select>
            <button class="ax-btn ax-btn-sm" data-project-save="${i(r.id)}">💾</button>
          </div>
        </li>
      `}).join("");return`
    <div class="ax-admin-section">
      <h2>📦 Projets KDMC (${a} — ${n} actifs/wip)</h2>
      <p class="ax-muted">
        Source de vérité injectée dans le system prompt IA Apex. Modifie version/statut → Apex le sait au prochain message.
      </p>
      <ul class="ax-project-list">${l||'<li class="ax-muted">Aucun projet enregistré</li>'}</ul>
    </div>
  `}function R(){return[["commerce","💳 Commerce"],["users","👥 Comptes"],["pending","📨 En attente"],["health","🩺 Santé"],["projects","📦 Projets KDMC"],["executions","⚙ Exécutions"],["knowledge","📚 Base connaissances"],["bilan","📊 Bilan"],["consumption","💰 Conso IA"]].map(([a,n])=>`
      <button class="ax-tab ${$===a?"ax-tab-active":""}" data-tab="${a}">${n}</button>
    `).join("")}function H(){const t=x.listPendingExecutions({limit:30}),a=x.getStats(),n=x.listAllowedTasks(),s=x.listForbiddenTasks(),l={pending:"pending",dispatched:"wip",running:"wip",completed:"ok",failed:"error",cancelled:"archived",timeout:"error"},r=t.map(e=>{const o=l[e.status]??"archived",c=new Date(e.ts_created).toLocaleString(),p=e.duration_ms?`${Math.round(e.duration_ms/1e3)}s`:"—",v=e.workflow_run_url?`<a href="${i(e.workflow_run_url)}" target="_blank" rel="noopener">🔗 Workflow</a>`:'<span class="ax-muted">—</span>',f=e.status==="pending"||e.status==="dispatched";return`
        <li class="ax-execution-row" data-exec-id="${i(e.id)}">
          <div class="ax-exec-head">
            <code class="ax-exec-id">${i(e.id.slice(0,18))}</code>
            <span class="ax-badge ax-badge-${o}">${i(e.status)}</span>
            <strong>${i(e.task)}</strong>
          </div>
          <p class="ax-muted">📅 ${i(c)} · ⏱ ${i(p)} · 🚀 ${i(e.src)} · 👤 ${i(e.initiated_by)}</p>
          ${e.error?`<p class="ax-error">⚠ ${i(e.error.slice(0,200))}</p>`:""}
          <p class="ax-exec-actions">
            ${v}
            ${f?` · <button class="ax-btn ax-btn-sm" data-exec-cancel="${i(e.id)}">✕ Annuler</button>`:""}
            · <button class="ax-btn ax-btn-sm" data-exec-poll="${i(e.id)}">🔄 Refresh</button>
          </p>
        </li>
      `}).join("");return`
    <div class="ax-admin-section">
      <h2>🤖 Exécutions autonomes (apex-execute)</h2>
      <p class="ax-muted">
        Pont autonome IA → Claude Code via GitHub Actions. Apex IA peut exécuter du code réel
        (modify_file, run_test, deploy_canary…) en dispatchant un workflow CI qui utilise Claude Code Action.
      </p>
      <div class="ax-info-card">
        <h3>📊 Stats</h3>
        <ul>
          <li><strong>Total</strong> : ${a.total}</li>
          <li><strong>En cours</strong> : ${a.pending} pending / ${a.running} running</li>
          <li><strong>Terminées</strong> : ${a.completed} ✅ · ${a.failed} ❌ · ${a.cancelled} 🚫</li>
          <li><strong>Success rate</strong> : ${a.success_rate}%</li>
          <li><strong>Avg duration</strong> : ${Math.round(a.avg_duration_ms/1e3)}s</li>
        </ul>
      </div>
      <div class="ax-info-card">
        <h3>✅ Tâches autorisées (${n.length})</h3>
        <p>${n.map(e=>`<code>${i(e)}</code>`).join(" · ")}</p>
        <h3>🚫 Tâches INTERDITES (${s.length})</h3>
        <p class="ax-muted">${s.map(e=>`<code>${i(e)}</code>`).join(" · ")}</p>
      </div>
      <h3>📋 Historique récent</h3>
      <ul class="ax-execution-list">${r||`<li class="ax-muted">Aucune exécution pour l'instant.</li>`}</ul>
    </div>
  `}function O(){switch($){case"commerce":return j();case"users":return L();case"pending":return P();case"health":return q();case"projects":return I();case"executions":return H();case"knowledge":return M();case"bilan":return'<div id="ax-admin-mount-bilan" class="ax-admin-section"><p class="ax-muted">Chargement du bilan financier…</p></div>';case"consumption":return'<div id="ax-admin-mount-consumption" class="ax-admin-section"><p class="ax-muted">Chargement consommation IA…</p></div>'}}async function D(t){const a=t.querySelector("#ax-admin-mount-bilan");if(a)try{(await w(()=>import("./financial-bilan-DGvRDom8.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9]),import.meta.url)).render(a)}catch(s){h.warn("admin","financial-bilan render failed",{err:s}),a.innerHTML='<p class="ax-muted">Bilan indisponible (module ko)</p>'}const n=t.querySelector("#ax-admin-mount-consumption");if(n)try{(await w(()=>import("./consumption-dashboard-B2UiHfVi.js"),__vite__mapDeps([10,4,2,3,5,6,7,8,9]),import.meta.url)).render(n)}catch(s){h.warn("admin","consumption-dashboard render failed",{err:s}),n.innerHTML='<p class="ax-muted">Consommation indisponible (module ko)</p>'}}function M(){const t=g.listRepos(),a=g.getStats(),n=t.map(s=>`
      <li class="ax-repo-row">
        <code>${i(s)}</code>
        ${t.length>1?`<button class="ax-btn ax-btn-sm" data-remove-repo="${i(s)}">Retirer</button>`:""}
      </li>
    `).join("");return`
    <div class="ax-admin-section">
      <h2>📚 Base de connaissances Kevin</h2>
      <p class="ax-muted">
        Apex peut chercher full-text dans le code de tes repos GitHub via API
        (5000 req/h authenticated, cache 1h).
      </p>

      <div class="ax-info-card">
        <strong>État :</strong> ${a.repos} repos · ${a.cache_entries} entrées cache · ${a.index_entries} fichiers indexés
        <br>
        <strong>Token GitHub :</strong> ${a.has_token?"✅ configuré":"⚪ Configure ax_github_token dans le Coffre pour 5000 req/h"}
      </div>

      <h3>Repos suivis</h3>
      <ul class="ax-repo-list">${n||'<li class="ax-muted">Aucun repo configuré</li>'}</ul>

      <form id="add-repo-form" class="ax-form">
        <label>
          <span>Ajouter un repo (format : owner/repo)</span>
          <input type="text" id="kb-add-repo" placeholder="kevin/MyProject"
                 maxlength="100" autocomplete="off" class="ax-input">
        </label>
        <button type="submit" class="ax-btn ax-btn-primary">Ajouter</button>
      </form>

      <h3>Recherche dans le code</h3>
      <form id="kb-search-form" class="ax-form">
        <input type="text" id="kb-search-query" placeholder="Cherche dans tes repos..."
               maxlength="200" autocomplete="off" class="ax-input">
        <button type="submit" class="ax-btn ax-btn-primary">Chercher</button>
      </form>
      <div id="kb-search-results" class="ax-kb-results"></div>

      <div class="ax-actions">
        <button class="ax-btn ax-btn-sm" id="kb-clear-cache">🧹 Vider le cache</button>
      </div>
    </div>
  `}function E(t){t.querySelectorAll("[data-tab]").forEach(e=>{e.addEventListener("click",()=>{d.selection(),$=e.dataset.tab,m(t)})});const a=t.querySelector("#commerce-toggle");a&&a.addEventListener("change",()=>{d.medium(),y.setEnabled(a.checked),u.success(`Commercialisation ${a.checked?"activée":"désactivée"}`),m(t)});const n=t.querySelector("#create-user-form");n&&n.addEventListener("submit",e=>{e.preventDefault(),K(t)}),t.querySelectorAll("[data-user-plan]").forEach(e=>{e.addEventListener("change",()=>{const o=e.dataset.userPlan??"";o&&(y.setUserPlan(o,e.value),h.info("admin",`Plan ${e.value} → ${o}`))})}),t.querySelectorAll("[data-project-save]").forEach(e=>{e.addEventListener("click",()=>{d.tap();const o=e.dataset.projectSave??"";if(!o)return;const c=t.querySelector(`[data-project-version="${CSS.escape(o)}"]`),p=t.querySelector(`[data-project-status="${CSS.escape(o)}"]`),v=(c?.value??"").trim(),f=p?.value??"active";if(!v){u.warn("Version requise");return}k.update(o,{version:v,status:f})?(d.success(),u.success(`${o} → ${v} (${f})`),h.info("admin",`Project ${o} updated`,{version:v,status:f}),m(t)):(d.error(),u.error("Update échoué"))})}),t.querySelectorAll("[data-confirm-otp]").forEach(e=>{e.addEventListener("click",()=>{d.tap();const o=e.dataset.confirmOtp??"";if(!o)return;const c=_.confirm(o);c.ok?(d.success(),u.success("Compte activé"),h.info("admin",`Confirmed user ${c.uid}`),m(t)):(d.error(),u.error("Code OTP invalide ou expiré"))})}),t.querySelectorAll("[data-exec-cancel]").forEach(e=>{e.addEventListener("click",()=>{d.tap();const o=e.dataset.execCancel??"";if(!o)return;x.cancelExecution(o)?(d.success(),u.success("Exécution annulée"),m(t)):(d.warning(),u.warn("Annulation impossible"))})}),t.querySelectorAll("[data-exec-poll]").forEach(e=>{e.addEventListener("click",()=>{d.tap();const o=e.dataset.execPoll??"";o&&x.pollResult(o).then(c=>{c?(u.success(`Statut : ${c.status}`),m(t)):u.warn("Exécution introuvable")})})});const s=t.querySelector("#add-repo-form");s&&s.addEventListener("submit",e=>{e.preventDefault(),d.tap();const c=t.querySelector("#kb-add-repo")?.value.trim()??"";if(!c){u.warn("Indique un repo");return}const p=g.addRepo(c);p.ok?(d.success(),u.success(`Repo ajouté : ${c}`),m(t)):(d.error(),u.error(p.reason??"Erreur ajout repo"))}),t.querySelectorAll("[data-remove-repo]").forEach(e=>{e.addEventListener("click",()=>{d.tap();const o=e.dataset.removeRepo??"";o&&(g.removeRepo(o),u.success(`Repo retiré : ${o}`),m(t))})});const l=t.querySelector("#kb-search-form");l&&l.addEventListener("submit",e=>{e.preventDefault(),d.tap();const o=t.querySelector("#kb-search-query"),c=t.querySelector("#kb-search-results"),p=o?.value.trim()??"";!p||!c||(c.innerHTML='<p class="ax-muted">Recherche en cours...</p>',g.searchCode(p).then(v=>{if(v.length===0){c.innerHTML='<p class="ax-muted">Aucun résultat (configure ax_github_token pour augmenter la limite).</p>';return}const f=v.slice(0,20).map(b=>`
            <li class="ax-kb-result">
              <a href="${i(b.htmlUrl)}" target="_blank" rel="noopener">
                <code>${i(b.path)}</code>
              </a>
              <span class="ax-muted">${i(b.repo)} · score ${b.score.toFixed(2)}</span>
            </li>
          `).join("");c.innerHTML=`<ul class="ax-kb-results-list">${f}</ul>`}))});const r=t.querySelector("#kb-clear-cache");r&&r.addEventListener("click",()=>{d.tap();const e=g.clearCache();u.success(`Cache vidé : ${e.cleared} entrées`),m(t)})}async function K(t){const a=t.querySelector("#cu-name")?.value.trim()??"",n=t.querySelector("#cu-tier")?.value??"family",s=t.querySelector("#cu-email")?.value.trim()??"",l=t.querySelector("#cu-whatsapp")?.value.trim()??"",r=t.querySelector("#cu-pin")?.value??"";if(!a||a.length<2){d.warning(),u.warn("Nom complet requis (min 2 caractères)");return}const e=await S.createUser({name:a,tier:n,...s&&{email:s},...l&&{whatsappPhone:l},...r&&{initialPin:r}}),o=t.querySelector("#create-user-result");if(!o)return;if(!e.ok||!e.uid){d.error();const p=e.reason??"Erreur création";o.innerHTML=`<div class="ax-error">${i(p)}</div>`,u.error(p);return}d.success(),u.success(`Compte ${a} créé`);let c="";if(l){const p=await _.requestConfirmation({uid:e.uid,name:a,whatsappPhone:l});p.ok&&p.inviteLink&&(c=`
        <a href="${p.inviteLink}" target="_blank" rel="noopener" class="ax-btn ax-btn-primary">
          📨 Envoyer le code via WhatsApp
        </a>
        <p class="ax-muted">Code OTP : <code>${p.otp}</code></p>
      `)}o.innerHTML=`
    <div class="ax-success">
      Compte créé : <strong>${i(a)}</strong> (${n})
      <p>Lien d'invitation : <input type="text" readonly value="${e.inviteLink??""}" onclick="this.select()" style="width:100%"></p>
      ${c}
    </div>
  `,m(t)}function m(t){if(!A.get("isAdmin")){t.innerHTML=`
      <div class="ax-empty">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}t.innerHTML=`
    <div class="ax-admin">
      <header class="ax-admin-header">
        <h1>Centre Admin</h1>
        <button class="ax-btn ax-btn-sm" onclick="location.hash='#chat'">← Chat</button>
      </header>
      <nav class="ax-tabs">${R()}</nav>
      <div class="ax-admin-content">${O()}</div>
    </div>
  `,E(t),($==="bilan"||$==="consumption")&&D(t)}export{m as render};
//# sourceMappingURL=index-BcsZ4yte.js.map
