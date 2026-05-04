import{l as f,s as _}from"../core/main-CVBVMToZ.js";import{apexExecute as x}from"./apex-execute-DwboO3Fq.js";import{apexKnowledgeBase as g}from"./apex-knowledge-base-Yd5yjN_t.js";import{auth as S}from"./auth-Dg-haRDc.js";import{commerce as k}from"./commerce-BNHW-CLP.js";import{kdmcProjectsRegistry as $}from"./kdmc-projects-registry-Cb5DyD62.js";import{firebase as A}from"./firebase-BQ5H-6TP.js";import{h as u}from"./haptic-BUEqXK0N.js";import{toast as d}from"./toast-BkOpdP-z.js";import"./audit-log-CtaoMSI4.js";import"./claude-bridge-D9_oMs0T.js";import"./vault-B0sEuHbf.js";import"./credential-patterns-Ct__OCbr.js";class C{OTP_TTL=1440*60*1e3;getKevinWhatsApp(){return localStorage.getItem("ax_kevin_whatsapp_phone")??""}async requestConfirmation(a){const i=this.getKevinWhatsApp();if(!i)return{ok:!1,reason:"Numéro Kevin WhatsApp non configuré"};const r=this.generateOTP(),l={uid:a.uid,name:a.name,whatsapp:a.whatsappPhone,otp:r,createdAt:Date.now(),expiresAt:Date.now()+this.OTP_TTL,confirmed:!1};try{const c=JSON.parse(localStorage.getItem("apex_v13_pending_confirms")??"[]");c.push(l),localStorage.setItem("apex_v13_pending_confirms",JSON.stringify(c))}catch(c){f.warn("whatsapp","persist failed",{err:c})}A.write("apex_v13_pending_confirms",l);const o=encodeURIComponent(`Bonjour Kevin, je suis ${a.name}. Voici mon code d'inscription Apex : ${r}`),n=`https://wa.me/${i.replace(/[^\d]/g,"")}?text=${o}`;return f.info("whatsapp",`Confirmation requested for ${a.name}`,{otp:r}),{ok:!0,inviteLink:n,otp:r}}confirm(a){try{const i=JSON.parse(localStorage.getItem("apex_v13_pending_confirms")??"[]"),r=i.find(e=>e.otp===a&&!e.confirmed&&e.expiresAt>Date.now());if(!r)return{ok:!1};r.confirmed=!0,localStorage.setItem("apex_v13_pending_confirms",JSON.stringify(i));const l=JSON.parse(localStorage.getItem("apex_v13_users")??"[]"),o=l.find(e=>e.id===r.uid);return o&&(o.activated=!0,localStorage.setItem("apex_v13_users",JSON.stringify(l))),f.info("whatsapp",`Confirmed ${r.name}`),{ok:!0,uid:r.uid}}catch(i){return f.error("whatsapp","confirm failed",{err:i}),{ok:!1}}}listPending(){try{return JSON.parse(localStorage.getItem("apex_v13_pending_confirms")??"[]").filter(i=>!i.confirmed&&i.expiresAt>Date.now())}catch{return[]}}generateOTP(){const a=crypto.getRandomValues(new Uint8Array(9)),i="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let r="";for(let l=0;l<12;l++){const o=a[l%a.length];r+=i[(o??0)%i.length]}return r.slice(0,6)+"-"+r.slice(6)}}const y=new C;let w="commerce";function s(t){return t.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]??a)}function T(){const t=k.isEnabled();return`
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
  `}function j(){const t=S.listUsers(),a=new Set(["admin","family","client_pro","client_free"]),i=t.map(r=>{const l=a.has(r.tier)?r.tier:"client_free";return`
      <li class="ax-user-row">
        <span class="ax-user-name">${s(r.name)}</span>
        <span class="ax-tier-badge ax-tier-${l}">${s(l)}</span>
        ${r.activated?'<span class="ax-badge ax-badge-ok">activé</span>':'<span class="ax-badge ax-badge-pending">en attente</span>'}
        <select data-user-plan="${s(r.id)}" class="ax-select-sm">
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
      <ul class="ax-user-list">${i||`<li class="ax-muted">Aucun compte créé pour l'instant</li>`}</ul>
    </div>
  `}function L(){const t=y.listPending();return t.length?`
    <div class="ax-admin-section">
      <h2>Confirmations WhatsApp en attente</h2>
      <p class="ax-muted">Quand le client te a envoyé son code par WhatsApp, clique "Confirmer".</p>
      <ul class="ax-pending-list">${t.map(i=>`
      <li class="ax-pending-row">
        <strong>${s(i.name)}</strong>
        <span class="ax-muted">${s(i.whatsapp)}</span>
        <code class="ax-otp">${i.otp}</code>
        <button class="ax-btn ax-btn-sm" data-confirm-otp="${i.otp}">Confirmer</button>
      </li>
    `).join("")}</ul>
    </div>
  `:`
      <div class="ax-admin-section">
        <h2>Confirmations en attente</h2>
        <p class="ax-muted">Aucune confirmation à valider.</p>
      </div>
    `}function P(){return`
    <div class="ax-admin-section">
      <h2>État de santé</h2>
      <p class="ax-muted">Sentinelles + providers IA — Jet 2 enrichira avec dashboard live.</p>
    </div>
  `}function q(){const t=$.list(),a=$.count(),i=$.countActive(),r=["active","wip","archived"],l=t.map(o=>{const e=r.includes(o.status)?o.status:"archived",n=o.tech_stack.slice(0,4).map(c=>s(c)).join(", ");return`
        <li class="ax-project-row" data-project-id="${s(o.id)}">
          <div class="ax-project-head">
            <strong>${s(o.name)}</strong>
            <span class="ax-badge ax-badge-${e}">${s(e)}</span>
            <code class="ax-project-version">${s(o.version)}</code>
          </div>
          <p class="ax-muted">${s(o.description)}</p>
          <p class="ax-project-stack"><em>stack:</em> ${n||"—"}</p>
          <p class="ax-project-links">
            <a href="${s(o.deploy_url)}" target="_blank" rel="noopener">🚀 Live</a>
            ·
            <a href="${s(o.repo_url)}" target="_blank" rel="noopener">📦 Repo</a>
            · <span class="ax-muted">🛡 ${o.sentinels_count} sentinelles</span>
          </p>
          <div class="ax-project-edit">
            <input type="text" data-project-version="${s(o.id)}"
                   value="${s(o.version)}" placeholder="vX.Y" maxlength="20"
                   class="ax-input-sm" autocomplete="off">
            <select data-project-status="${s(o.id)}" class="ax-select-sm">
              <option value="active" ${o.status==="active"?"selected":""}>active</option>
              <option value="wip" ${o.status==="wip"?"selected":""}>wip</option>
              <option value="archived" ${o.status==="archived"?"selected":""}>archived</option>
            </select>
            <button class="ax-btn ax-btn-sm" data-project-save="${s(o.id)}">💾</button>
          </div>
        </li>
      `}).join("");return`
    <div class="ax-admin-section">
      <h2>📦 Projets KDMC (${a} — ${i} actifs/wip)</h2>
      <p class="ax-muted">
        Source de vérité injectée dans le system prompt IA Apex. Modifie version/statut → Apex le sait au prochain message.
      </p>
      <ul class="ax-project-list">${l||'<li class="ax-muted">Aucun projet enregistré</li>'}</ul>
    </div>
  `}function I(){return[["commerce","💳 Commerce"],["users","👥 Comptes"],["pending","📨 En attente"],["health","🩺 Santé"],["projects","📦 Projets KDMC"],["executions","⚙ Exécutions"],["knowledge","📚 Base connaissances"]].map(([a,i])=>`
      <button class="ax-tab ${w===a?"ax-tab-active":""}" data-tab="${a}">${i}</button>
    `).join("")}function R(){const t=x.listPendingExecutions({limit:30}),a=x.getStats(),i=x.listAllowedTasks(),r=x.listForbiddenTasks(),l={pending:"pending",dispatched:"wip",running:"wip",completed:"ok",failed:"error",cancelled:"archived",timeout:"error"},o=t.map(e=>{const n=l[e.status]??"archived",c=new Date(e.ts_created).toLocaleString(),p=e.duration_ms?`${Math.round(e.duration_ms/1e3)}s`:"—",v=e.workflow_run_url?`<a href="${s(e.workflow_run_url)}" target="_blank" rel="noopener">🔗 Workflow</a>`:'<span class="ax-muted">—</span>',h=e.status==="pending"||e.status==="dispatched";return`
        <li class="ax-execution-row" data-exec-id="${s(e.id)}">
          <div class="ax-exec-head">
            <code class="ax-exec-id">${s(e.id.slice(0,18))}</code>
            <span class="ax-badge ax-badge-${n}">${s(e.status)}</span>
            <strong>${s(e.task)}</strong>
          </div>
          <p class="ax-muted">📅 ${s(c)} · ⏱ ${s(p)} · 🚀 ${s(e.src)} · 👤 ${s(e.initiated_by)}</p>
          ${e.error?`<p class="ax-error">⚠ ${s(e.error.slice(0,200))}</p>`:""}
          <p class="ax-exec-actions">
            ${v}
            ${h?` · <button class="ax-btn ax-btn-sm" data-exec-cancel="${s(e.id)}">✕ Annuler</button>`:""}
            · <button class="ax-btn ax-btn-sm" data-exec-poll="${s(e.id)}">🔄 Refresh</button>
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
        <h3>✅ Tâches autorisées (${i.length})</h3>
        <p>${i.map(e=>`<code>${s(e)}</code>`).join(" · ")}</p>
        <h3>🚫 Tâches INTERDITES (${r.length})</h3>
        <p class="ax-muted">${r.map(e=>`<code>${s(e)}</code>`).join(" · ")}</p>
      </div>
      <h3>📋 Historique récent</h3>
      <ul class="ax-execution-list">${o||`<li class="ax-muted">Aucune exécution pour l'instant.</li>`}</ul>
    </div>
  `}function H(){switch(w){case"commerce":return T();case"users":return j();case"pending":return L();case"health":return P();case"projects":return q();case"executions":return R();case"knowledge":return O()}}function O(){const t=g.listRepos(),a=g.getStats(),i=t.map(r=>`
      <li class="ax-repo-row">
        <code>${s(r)}</code>
        ${t.length>1?`<button class="ax-btn ax-btn-sm" data-remove-repo="${s(r)}">Retirer</button>`:""}
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
      <ul class="ax-repo-list">${i||'<li class="ax-muted">Aucun repo configuré</li>'}</ul>

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
  `}function D(t){t.querySelectorAll("[data-tab]").forEach(e=>{e.addEventListener("click",()=>{u.selection(),w=e.dataset.tab,m(t)})});const a=t.querySelector("#commerce-toggle");a&&a.addEventListener("change",()=>{u.medium(),k.setEnabled(a.checked),d.success(`Commercialisation ${a.checked?"activée":"désactivée"}`),m(t)});const i=t.querySelector("#create-user-form");i&&i.addEventListener("submit",e=>{e.preventDefault(),M(t)}),t.querySelectorAll("[data-user-plan]").forEach(e=>{e.addEventListener("change",()=>{const n=e.dataset.userPlan??"";n&&(k.setUserPlan(n,e.value),f.info("admin",`Plan ${e.value} → ${n}`))})}),t.querySelectorAll("[data-project-save]").forEach(e=>{e.addEventListener("click",()=>{u.tap();const n=e.dataset.projectSave??"";if(!n)return;const c=t.querySelector(`[data-project-version="${CSS.escape(n)}"]`),p=t.querySelector(`[data-project-status="${CSS.escape(n)}"]`),v=(c?.value??"").trim(),h=p?.value??"active";if(!v){d.warn("Version requise");return}$.update(n,{version:v,status:h})?(u.success(),d.success(`${n} → ${v} (${h})`),f.info("admin",`Project ${n} updated`,{version:v,status:h}),m(t)):(u.error(),d.error("Update échoué"))})}),t.querySelectorAll("[data-confirm-otp]").forEach(e=>{e.addEventListener("click",()=>{u.tap();const n=e.dataset.confirmOtp??"";if(!n)return;const c=y.confirm(n);c.ok?(u.success(),d.success("Compte activé"),f.info("admin",`Confirmed user ${c.uid}`),m(t)):(u.error(),d.error("Code OTP invalide ou expiré"))})}),t.querySelectorAll("[data-exec-cancel]").forEach(e=>{e.addEventListener("click",()=>{u.tap();const n=e.dataset.execCancel??"";if(!n)return;x.cancelExecution(n)?(u.success(),d.success("Exécution annulée"),m(t)):(u.warning(),d.warn("Annulation impossible"))})}),t.querySelectorAll("[data-exec-poll]").forEach(e=>{e.addEventListener("click",()=>{u.tap();const n=e.dataset.execPoll??"";n&&x.pollResult(n).then(c=>{c?(d.success(`Statut : ${c.status}`),m(t)):d.warn("Exécution introuvable")})})});const r=t.querySelector("#add-repo-form");r&&r.addEventListener("submit",e=>{e.preventDefault(),u.tap();const c=t.querySelector("#kb-add-repo")?.value.trim()??"";if(!c){d.warn("Indique un repo");return}const p=g.addRepo(c);p.ok?(u.success(),d.success(`Repo ajouté : ${c}`),m(t)):(u.error(),d.error(p.reason??"Erreur ajout repo"))}),t.querySelectorAll("[data-remove-repo]").forEach(e=>{e.addEventListener("click",()=>{u.tap();const n=e.dataset.removeRepo??"";n&&(g.removeRepo(n),d.success(`Repo retiré : ${n}`),m(t))})});const l=t.querySelector("#kb-search-form");l&&l.addEventListener("submit",e=>{e.preventDefault(),u.tap();const n=t.querySelector("#kb-search-query"),c=t.querySelector("#kb-search-results"),p=n?.value.trim()??"";!p||!c||(c.innerHTML='<p class="ax-muted">Recherche en cours...</p>',g.searchCode(p).then(v=>{if(v.length===0){c.innerHTML='<p class="ax-muted">Aucun résultat (configure ax_github_token pour augmenter la limite).</p>';return}const h=v.slice(0,20).map(b=>`
            <li class="ax-kb-result">
              <a href="${s(b.htmlUrl)}" target="_blank" rel="noopener">
                <code>${s(b.path)}</code>
              </a>
              <span class="ax-muted">${s(b.repo)} · score ${b.score.toFixed(2)}</span>
            </li>
          `).join("");c.innerHTML=`<ul class="ax-kb-results-list">${h}</ul>`}))});const o=t.querySelector("#kb-clear-cache");o&&o.addEventListener("click",()=>{u.tap();const e=g.clearCache();d.success(`Cache vidé : ${e.cleared} entrées`),m(t)})}async function M(t){const a=t.querySelector("#cu-name")?.value.trim()??"",i=t.querySelector("#cu-tier")?.value??"family",r=t.querySelector("#cu-email")?.value.trim()??"",l=t.querySelector("#cu-whatsapp")?.value.trim()??"",o=t.querySelector("#cu-pin")?.value??"";if(!a||a.length<2){u.warning(),d.warn("Nom complet requis (min 2 caractères)");return}const e=await S.createUser({name:a,tier:i,...r&&{email:r},...l&&{whatsappPhone:l},...o&&{initialPin:o}}),n=t.querySelector("#create-user-result");if(!n)return;if(!e.ok||!e.uid){u.error();const p=e.reason??"Erreur création";n.innerHTML=`<div class="ax-error">${s(p)}</div>`,d.error(p);return}u.success(),d.success(`Compte ${a} créé`);let c="";if(l){const p=await y.requestConfirmation({uid:e.uid,name:a,whatsappPhone:l});p.ok&&p.inviteLink&&(c=`
        <a href="${p.inviteLink}" target="_blank" rel="noopener" class="ax-btn ax-btn-primary">
          📨 Envoyer le code via WhatsApp
        </a>
        <p class="ax-muted">Code OTP : <code>${p.otp}</code></p>
      `)}n.innerHTML=`
    <div class="ax-success">
      Compte créé : <strong>${s(a)}</strong> (${i})
      <p>Lien d'invitation : <input type="text" readonly value="${e.inviteLink??""}" onclick="this.select()" style="width:100%"></p>
      ${c}
    </div>
  `,m(t)}function m(t){if(!_.get("isAdmin")){t.innerHTML=`
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
      <nav class="ax-tabs">${I()}</nav>
      <div class="ax-admin-content">${H()}</div>
    </div>
  `,D(t)}export{m as render};
//# sourceMappingURL=index-Cv4tFcKc.js.map
