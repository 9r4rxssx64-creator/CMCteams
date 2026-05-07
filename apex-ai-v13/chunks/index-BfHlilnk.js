const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./financial-bilan-BswQPcYo.js","./commerce-DadIEqMD.js","./apex-kb-BtA0z5Zk.js","./monitoring-B17vNBOa.js","./apex-tools-registry-Duck4KzY.js","./credential-patterns-BybElwOv.js","../core/main-DEQmtw3t.js","./consumption-monitor-BZrCucXD.js","./links-registry-CzuQc9be.js","./push-notifications-BhsOuIhf.js","./tokens-dashboard-C5ZzZyK6.js","../assets/css/main-rhfGvOFL.css","./consumption-dashboard-Rq-j3YNv.js"])))=>i.map(i=>d[i]);
import{a as h,_ as S}from"./apex-kb-BtA0z5Zk.js";import{l as f}from"./monitoring-B17vNBOa.js";import{s as A}from"../core/main-DEQmtw3t.js";import{apexExecute as b}from"./apex-execute-BswHPWiT.js";import{auth as _}from"./auth-BYDzsFPU.js";import{commerce as w}from"./commerce-DadIEqMD.js";import{kdmcProjectsRegistry as y}from"./kdmc-projects-registry-Bc-QS4so.js";import{f as C}from"./apex-tools-dispatch-CScB3yDe.js";import{h as d}from"./haptic-BUEqXK0N.js";import{toast as p}from"./toast-Dgg9rcIP.js";import"./apex-tools-registry-Duck4KzY.js";import"./credential-patterns-BybElwOv.js";import"./claude-bridge-YDEQBf5-.js";class T{OTP_TTL=1440*60*1e3;getKevinWhatsApp(){return localStorage.getItem("ax_kevin_whatsapp_phone")??""}async requestConfirmation(a){const s=this.getKevinWhatsApp();if(!s)return{ok:!1,reason:"Numéro Kevin WhatsApp non configuré"};const n=this.generateOTP(),l={uid:a.uid,name:a.name,whatsapp:a.whatsappPhone,otp:n,createdAt:Date.now(),expiresAt:Date.now()+this.OTP_TTL,confirmed:!1};try{const c=JSON.parse(localStorage.getItem("apex_v13_pending_confirms")??"[]");c.push(l),localStorage.setItem("apex_v13_pending_confirms",JSON.stringify(c))}catch(c){f.warn("whatsapp","persist failed",{err:c})}C.write("apex_v13_pending_confirms",l);const o=encodeURIComponent(`Bonjour Kevin, je suis ${a.name}. Voici mon code d'inscription Apex : ${n}`),i=`https://wa.me/${s.replace(/[^\d]/g,"")}?text=${o}`;return f.info("whatsapp",`Confirmation requested for ${a.name}`,{otp:n}),{ok:!0,inviteLink:i,otp:n}}confirm(a){try{const s=JSON.parse(localStorage.getItem("apex_v13_pending_confirms")??"[]"),n=s.find(e=>e.otp===a&&!e.confirmed&&e.expiresAt>Date.now());if(!n)return{ok:!1};n.confirmed=!0,localStorage.setItem("apex_v13_pending_confirms",JSON.stringify(s));const l=JSON.parse(localStorage.getItem("apex_v13_users")??"[]"),o=l.find(e=>e.id===n.uid);return o&&(o.activated=!0,localStorage.setItem("apex_v13_users",JSON.stringify(l))),f.info("whatsapp",`Confirmed ${n.name}`),{ok:!0,uid:n.uid}}catch(s){return f.error("whatsapp","confirm failed",{err:s}),{ok:!1}}}listPending(){try{return JSON.parse(localStorage.getItem("apex_v13_pending_confirms")??"[]").filter(s=>!s.confirmed&&s.expiresAt>Date.now())}catch{return[]}}generateOTP(){const a=crypto.getRandomValues(new Uint8Array(9)),s="ABCDEFGHJKMNPQRSTUVWXYZ23456789";let n="";for(let l=0;l<12;l++){const o=a[l%a.length];n+=s[(o??0)%s.length]}return n.slice(0,6)+"-"+n.slice(6)}}const k=new T;let $="commerce";function r(t){return t.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]??a)}function j(){const t=w.isEnabled();return`
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
  `}function L(){const t=_.listUsers(),a=new Set(["admin","family","client_pro","client_free"]),s=t.map(n=>{const l=a.has(n.tier)?n.tier:"client_free";return`
      <li class="ax-user-row">
        <span class="ax-user-name">${r(n.name)}</span>
        <span class="ax-tier-badge ax-tier-${l}">${r(l)}</span>
        ${n.activated?'<span class="ax-badge ax-badge-ok">activé</span>':'<span class="ax-badge ax-badge-pending">en attente</span>'}
        <select data-user-plan="${r(n.id)}" class="ax-select-sm">
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
      <ul class="ax-user-list">${s||`<li class="ax-muted">Aucun compte créé pour l'instant</li>`}</ul>
    </div>
  `}function P(){const t=k.listPending();return t.length?`
    <div class="ax-admin-section">
      <h2>Confirmations WhatsApp en attente</h2>
      <p class="ax-muted">Quand le client te a envoyé son code par WhatsApp, clique "Confirmer".</p>
      <ul class="ax-pending-list">${t.map(s=>`
      <li class="ax-pending-row">
        <strong>${r(s.name)}</strong>
        <span class="ax-muted">${r(s.whatsapp)}</span>
        <code class="ax-otp">${s.otp}</code>
        <button class="ax-btn ax-btn-sm" data-confirm-otp="${s.otp}">Confirmer</button>
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
  `}function I(){const t=y.list(),a=y.count(),s=y.countActive(),n=["active","wip","archived"],l=t.map(o=>{const e=n.includes(o.status)?o.status:"archived",i=o.tech_stack.slice(0,4).map(c=>r(c)).join(", ");return`
        <li class="ax-project-row" data-project-id="${r(o.id)}">
          <div class="ax-project-head">
            <strong>${r(o.name)}</strong>
            <span class="ax-badge ax-badge-${e}">${r(e)}</span>
            <code class="ax-project-version">${r(o.version)}</code>
          </div>
          <p class="ax-muted">${r(o.description)}</p>
          <p class="ax-project-stack"><em>stack:</em> ${i||"—"}</p>
          <p class="ax-project-links">
            <a href="${r(o.deploy_url)}" target="_blank" rel="noopener">🚀 Live</a>
            ·
            <a href="${r(o.repo_url)}" target="_blank" rel="noopener">📦 Repo</a>
            · <span class="ax-muted">🛡 ${o.sentinels_count} sentinelles</span>
          </p>
          <div class="ax-project-edit">
            <input type="text" data-project-version="${r(o.id)}"
                   value="${r(o.version)}" placeholder="vX.Y" maxlength="20"
                   class="ax-input-sm" autocomplete="off">
            <select data-project-status="${r(o.id)}" class="ax-select-sm">
              <option value="active" ${o.status==="active"?"selected":""}>active</option>
              <option value="wip" ${o.status==="wip"?"selected":""}>wip</option>
              <option value="archived" ${o.status==="archived"?"selected":""}>archived</option>
            </select>
            <button class="ax-btn ax-btn-sm" data-project-save="${r(o.id)}">💾</button>
          </div>
        </li>
      `}).join("");return`
    <div class="ax-admin-section">
      <h2>📦 Projets KDMC (${a} — ${s} actifs/wip)</h2>
      <p class="ax-muted">
        Source de vérité injectée dans le system prompt IA Apex. Modifie version/statut → Apex le sait au prochain message.
      </p>
      <ul class="ax-project-list">${l||'<li class="ax-muted">Aucun projet enregistré</li>'}</ul>
    </div>
  `}function R(){return[["commerce","💳 Commerce"],["users","👥 Comptes"],["pending","📨 Attente"],["health","🩺 Santé"],["projects","📦 Projets"],["executions","⚙️ Exec"],["knowledge","📚 KB"],["bilan","📊 Bilan"],["consumption","💰 Conso"]].map(([a,s])=>{const n=$===a;return`
        <button class="ax-tab ax-bounce-tap ${n?"ax-tab-active":""}" data-tab="${a}" style="flex:0 0 auto;white-space:nowrap;min-height:44px;padding:10px 14px;font-size:13px;line-height:1.2;border-radius:22px;cursor:pointer;transition:all 200ms cubic-bezier(0.16,1,0.3,1);border:1px solid;-webkit-tap-highlight-color:transparent;font-weight:600;letter-spacing:-0.01em;display:inline-flex;align-items:center;gap:4px;scroll-snap-align:start;${n?"background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border-color:transparent;box-shadow:0 4px 16px rgba(232,184,48,0.25),0 1px 3px rgba(0,0,0,0.2)":"background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.7);border-color:rgba(255,255,255,0.08)"}">${s}</button>
      `}).join("")}function H(){const t=b.listPendingExecutions({limit:30}),a=b.getStats(),s=b.listAllowedTasks(),n=b.listForbiddenTasks(),l={pending:"pending",dispatched:"wip",running:"wip",completed:"ok",failed:"error",cancelled:"archived",timeout:"error"},o=t.map(e=>{const i=l[e.status]??"archived",c=new Date(e.ts_created).toLocaleString(),u=e.duration_ms?`${Math.round(e.duration_ms/1e3)}s`:"—",x=e.workflow_run_url?`<a href="${r(e.workflow_run_url)}" target="_blank" rel="noopener">🔗 Workflow</a>`:'<span class="ax-muted">—</span>',g=e.status==="pending"||e.status==="dispatched";return`
        <li class="ax-execution-row" data-exec-id="${r(e.id)}">
          <div class="ax-exec-head">
            <code class="ax-exec-id">${r(e.id.slice(0,18))}</code>
            <span class="ax-badge ax-badge-${i}">${r(e.status)}</span>
            <strong>${r(e.task)}</strong>
          </div>
          <p class="ax-muted">📅 ${r(c)} · ⏱ ${r(u)} · 🚀 ${r(e.src)} · 👤 ${r(e.initiated_by)}</p>
          ${e.error?`<p class="ax-error">⚠ ${r(e.error.slice(0,200))}</p>`:""}
          <p class="ax-exec-actions">
            ${x}
            ${g?` · <button class="ax-btn ax-btn-sm" data-exec-cancel="${r(e.id)}">✕ Annuler</button>`:""}
            · <button class="ax-btn ax-btn-sm" data-exec-poll="${r(e.id)}">🔄 Refresh</button>
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
        <h3>✅ Tâches autorisées (${s.length})</h3>
        <p>${s.map(e=>`<code>${r(e)}</code>`).join(" · ")}</p>
        <h3>🚫 Tâches INTERDITES (${n.length})</h3>
        <p class="ax-muted">${n.map(e=>`<code>${r(e)}</code>`).join(" · ")}</p>
      </div>
      <h3>📋 Historique récent</h3>
      <ul class="ax-execution-list">${o||`<li class="ax-muted">Aucune exécution pour l'instant.</li>`}</ul>
    </div>
  `}function O(){switch($){case"commerce":return j();case"users":return L();case"pending":return P();case"health":return q();case"projects":return I();case"executions":return H();case"knowledge":return E();case"bilan":return'<div id="ax-admin-mount-bilan" class="ax-admin-section"><p class="ax-muted">Chargement du bilan financier…</p></div>';case"consumption":return'<div id="ax-admin-mount-consumption" class="ax-admin-section"><p class="ax-muted">Chargement consommation IA…</p></div>'}}async function z(t){const a=t.querySelector("#ax-admin-mount-bilan");if(a)try{(await S(()=>import("./financial-bilan-BswQPcYo.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]),import.meta.url)).render(a)}catch(n){f.warn("admin","financial-bilan render failed",{err:n}),a.innerHTML='<p class="ax-muted">Bilan indisponible (module ko)</p>'}const s=t.querySelector("#ax-admin-mount-consumption");if(s)try{(await S(()=>import("./consumption-dashboard-Rq-j3YNv.js"),__vite__mapDeps([12,7,3,4,8,2,5,9,10]),import.meta.url)).render(s)}catch(n){f.warn("admin","consumption-dashboard render failed",{err:n}),s.innerHTML='<p class="ax-muted">Consommation indisponible (module ko)</p>'}}function E(){const t=h.listRepos(),a=h.getStats(),s=t.map(n=>`
      <li class="ax-repo-row">
        <code>${r(n)}</code>
        ${t.length>1?`<button class="ax-btn ax-btn-sm" data-remove-repo="${r(n)}">Retirer</button>`:""}
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
      <ul class="ax-repo-list">${s||'<li class="ax-muted">Aucun repo configuré</li>'}</ul>

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
  `}function M(t){t.querySelectorAll("[data-nav-route]").forEach(e=>{e.addEventListener("click",()=>{d.tap();const i=e.dataset.navRoute??"chat";window.location.hash="#"+i})}),t.querySelectorAll('[data-action="select-all"]').forEach(e=>{e.addEventListener("click",()=>{e.select()})}),t.querySelectorAll("[data-tab]").forEach(e=>{e.addEventListener("click",()=>{d.selection(),$=e.dataset.tab,m(t)})});const a=t.querySelector("#commerce-toggle");a&&a.addEventListener("change",()=>{d.medium(),w.setEnabled(a.checked),p.success(`Commercialisation ${a.checked?"activée":"désactivée"}`),m(t)});const s=t.querySelector("#create-user-form");s&&s.addEventListener("submit",e=>{e.preventDefault(),D(t)}),t.querySelectorAll("[data-user-plan]").forEach(e=>{e.addEventListener("change",()=>{const i=e.dataset.userPlan??"";i&&(w.setUserPlan(i,e.value),f.info("admin",`Plan ${e.value} → ${i}`))})}),t.querySelectorAll("[data-project-save]").forEach(e=>{e.addEventListener("click",()=>{d.tap();const i=e.dataset.projectSave??"";if(!i)return;const c=t.querySelector(`[data-project-version="${CSS.escape(i)}"]`),u=t.querySelector(`[data-project-status="${CSS.escape(i)}"]`),x=(c?.value??"").trim(),g=u?.value??"active";if(!x){p.warn("Version requise");return}y.update(i,{version:x,status:g})?(d.success(),p.success(`${i} → ${x} (${g})`),f.info("admin",`Project ${i} updated`,{version:x,status:g}),m(t)):(d.error(),p.error("Update échoué"))})}),t.querySelectorAll("[data-confirm-otp]").forEach(e=>{e.addEventListener("click",()=>{d.tap();const i=e.dataset.confirmOtp??"";if(!i)return;const c=k.confirm(i);c.ok?(d.success(),p.success("Compte activé"),f.info("admin",`Confirmed user ${c.uid}`),m(t)):(d.error(),p.error("Code OTP invalide ou expiré"))})}),t.querySelectorAll("[data-exec-cancel]").forEach(e=>{e.addEventListener("click",()=>{d.tap();const i=e.dataset.execCancel??"";if(!i)return;b.cancelExecution(i)?(d.success(),p.success("Exécution annulée"),m(t)):(d.warning(),p.warn("Annulation impossible"))})}),t.querySelectorAll("[data-exec-poll]").forEach(e=>{e.addEventListener("click",()=>{d.tap();const i=e.dataset.execPoll??"";i&&b.pollResult(i).then(c=>{c?(p.success(`Statut : ${c.status}`),m(t)):p.warn("Exécution introuvable")})})});const n=t.querySelector("#add-repo-form");n&&n.addEventListener("submit",e=>{e.preventDefault(),d.tap();const c=t.querySelector("#kb-add-repo")?.value.trim()??"";if(!c){p.warn("Indique un repo");return}const u=h.addRepo(c);u.ok?(d.success(),p.success(`Repo ajouté : ${c}`),m(t)):(d.error(),p.error(u.reason??"Erreur ajout repo"))}),t.querySelectorAll("[data-remove-repo]").forEach(e=>{e.addEventListener("click",()=>{d.tap();const i=e.dataset.removeRepo??"";i&&(h.removeRepo(i),p.success(`Repo retiré : ${i}`),m(t))})});const l=t.querySelector("#kb-search-form");l&&l.addEventListener("submit",e=>{e.preventDefault(),d.tap();const i=t.querySelector("#kb-search-query"),c=t.querySelector("#kb-search-results"),u=i?.value.trim()??"";!u||!c||(c.innerHTML='<p class="ax-muted">Recherche en cours...</p>',h.searchCode(u).then(x=>{if(x.length===0){c.innerHTML='<p class="ax-muted">Aucun résultat (configure ax_github_token pour augmenter la limite).</p>';return}const g=x.slice(0,20).map(v=>`
            <li class="ax-kb-result">
              <a href="${r(v.htmlUrl)}" target="_blank" rel="noopener">
                <code>${r(v.path)}</code>
              </a>
              <span class="ax-muted">${r(v.repo)} · score ${v.score.toFixed(2)}</span>
            </li>
          `).join("");c.innerHTML=`<ul class="ax-kb-results-list">${g}</ul>`}))});const o=t.querySelector("#kb-clear-cache");o&&o.addEventListener("click",()=>{d.tap();const e=h.clearCache();p.success(`Cache vidé : ${e.cleared} entrées`),m(t)})}async function D(t){const a=t.querySelector("#cu-name")?.value.trim()??"",s=t.querySelector("#cu-tier")?.value??"family",n=t.querySelector("#cu-email")?.value.trim()??"",l=t.querySelector("#cu-whatsapp")?.value.trim()??"",o=t.querySelector("#cu-pin")?.value??"";if(!a||a.length<2){d.warning(),p.warn("Nom complet requis (min 2 caractères)");return}const e=await _.createUser({name:a,tier:s,...n&&{email:n},...l&&{whatsappPhone:l},...o&&{initialPin:o}}),i=t.querySelector("#create-user-result");if(!i)return;if(!e.ok||!e.uid){d.error();const u=e.reason??"Erreur création";i.innerHTML=`<div class="ax-error">${r(u)}</div>`,p.error(u);return}d.success(),p.success(`Compte ${a} créé`);let c="";if(l){const u=await k.requestConfirmation({uid:e.uid,name:a,whatsappPhone:l});u.ok&&u.inviteLink&&(c=`
        <a href="${u.inviteLink}" target="_blank" rel="noopener" class="ax-btn ax-btn-primary">
          📨 Envoyer le code via WhatsApp
        </a>
        <p class="ax-muted">Code OTP : <code>${u.otp}</code></p>
      `)}i.innerHTML=`
    <div class="ax-success">
      Compte créé : <strong>${r(a)}</strong> (${s})
      <p>Lien d'invitation : <input type="text" readonly value="${e.inviteLink??""}" data-action="select-all" style="width:100%"></p>
      ${c}
    </div>
  `,m(t)}function m(t){if(!A.get("isAdmin")){t.innerHTML=`
      <div class="ax-empty">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}t.innerHTML=`
    <style>
      @keyframes ax-fade-up {
        0% { opacity: 0; transform: translateY(12px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .ax-modernized-card { animation: ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) backwards; }
      .ax-bounce-tap { transition: transform 120ms cubic-bezier(0.16,1,0.3,1); }
      .ax-bounce-tap:active { transform: scale(0.96); }
      .ax-admin-content .ax-admin-section {
        background: linear-gradient(135deg, rgba(20,20,35,0.65), rgba(14,14,28,0.45));
        backdrop-filter: blur(16px) saturate(140%);
        -webkit-backdrop-filter: blur(16px) saturate(140%);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 16px;
        animation: ax-fade-up 320ms cubic-bezier(0.16,1,0.3,1) 60ms backwards;
      }
      .ax-admin-content h2 {
        margin: 0 0 12px;
        font-size: 18px;
        font-weight: 700;
        color: #fff;
        letter-spacing: -0.015em;
      }
      .ax-admin-content h3 {
        margin: 14px 0 8px;
        font-size: 13px;
        color: #e8b830;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
      }
      .ax-admin-content .ax-info-card {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px;
        padding: 14px 16px;
        margin: 12px 0;
      }
      .ax-admin-content .ax-muted {
        color: rgba(255,255,255,0.55);
        font-size: 13px;
        line-height: 1.5;
      }
      @media (prefers-reduced-motion: reduce) {
        .ax-modernized-card, .ax-admin-section { animation: none !important; transition: none !important; }
        .ax-bounce-tap { transition: none !important; }
      }
    </style>
    <div class="ax-admin ax-modernized-card" style="padding:max(20px, env(safe-area-inset-top)) 16px max(20px, env(safe-area-inset-bottom)) 16px;max-width:1200px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif">
      <header class="ax-admin-header" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.06);position:sticky;top:0;background:linear-gradient(180deg,rgba(8,8,15,0.95),rgba(8,8,15,0.85));backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:10">
        <div style="min-width:0;flex:1">
          <h1 style="margin:0;font-size:clamp(20px,5vw,28px);font-weight:700;background:linear-gradient(135deg,#c9a227 0%,#e8b830 50%,#f5cc4a 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:Georgia,serif;letter-spacing:-0.025em;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">👑 Centre Admin</h1>
          <p style="margin:2px 0 0;color:rgba(255,255,255,0.5);font-size:11px">Kevin · accès illimité</p>
        </div>
        <button class="ax-btn ax-btn-sm ax-bounce-tap" data-nav-route="chat" style="flex-shrink:0;padding:9px 16px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:24px;font-size:13px;font-weight:600;cursor:pointer;min-height:40px;-webkit-tap-highlight-color:transparent;transition:all 180ms;white-space:nowrap">← Chat</button>
      </header>
      <nav class="ax-tabs" style="display:flex;flex-wrap:nowrap;gap:8px;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;padding:6px 0 12px;margin:0 -16px 14px;padding-left:16px;padding-right:16px;border-bottom:1px solid rgba(255,255,255,0.06);scrollbar-width:thin;scroll-snap-type:x mandatory;scroll-padding-left:16px">${R()}</nav>
      <div class="ax-admin-content">${O()}</div>
    </div>
  `,M(t),($==="bilan"||$==="consumption")&&z(t)}export{m as render};
//# sourceMappingURL=index-BfHlilnk.js.map
