const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./multi-source-analyze-Bai9IpOh.js","./apex-kb-D-Wwv6M3.js","./monitoring-3uBGKGRH.js","./credential-patterns-Dy6Wjk7e.js","../assets/css/main-BV2cw0DV.css"])))=>i.map(i=>d[i]);
import{b as f,_ as w}from"./apex-kb-D-Wwv6M3.js";import{l as v}from"./monitoring-3uBGKGRH.js";import{c as L}from"./listener-cleanup-Y2rGGxxX.js";import{s as P,a as H}from"../core/main-BmbDabbw.js";import{apexExecute as h}from"./apex-execute-idyHcxuU.js";import{auth as T}from"./auth-COGIzPVo.js";import{commerce as S}from"./commerce-B1qbvisq.js";import{i as A,r as j}from"./voice-mgMrh-FL.js";import{kdmcProjectsRegistry as k}from"./kdmc-projects-registry-DdTqW2gy.js";import{w as _}from"./whatsapp-DeHC4mmk.js";import{h as d}from"./haptic-BUEqXK0N.js";import{toast as u}from"./toast-Dgg9rcIP.js";import"./credential-patterns-Dy6Wjk7e.js";import"./multi-source-analyze-Bai9IpOh.js";import"./claude-bridge-Cg8vDhdo.js";let $="commerce";const q={commerce:"admin.commerce",users:"admin.users",pending:"admin.users",health:null,projects:null,executions:"admin.executions",knowledge:"admin.kb",bilan:"admin.bilan",consumption:"admin.consumption","audit-log":"admin.audit-log"};function n(e){return e.replace(/[&<>"']/g,i=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[i]??i)}function I(){const e=S.isEnabled();return`
    <div class="ax-admin-section">
      <h2>Commercialisation</h2>
      <p class="ax-muted">
        Active le système d'abonnements pour les non-admin. Toi (Kevin admin) gardes l'accès illimité dans tous les cas.
      </p>
      <div class="ax-toggle-row">
        <label class="ax-toggle">
          <input type="checkbox" id="commerce-toggle" ${e?"checked":""}>
          <span class="ax-toggle-slider"></span>
          <span class="ax-toggle-label">Commercialisation ${e?"<strong>ACTIVÉE</strong>":"<strong>désactivée</strong>"}</span>
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
  `}function R(){const e=T.listUsers(),i=new Set(["admin","family","client_pro","client_free"]),s=e.map(o=>{const c=i.has(o.tier)?o.tier:"client_free";return`
      <li class="ax-user-row">
        <span class="ax-user-name">${n(o.name)}</span>
        <span class="ax-tier-badge ax-tier-${c}">${n(c)}</span>
        ${o.activated?'<span class="ax-badge ax-badge-ok">activé</span>':'<span class="ax-badge ax-badge-pending">en attente</span>'}
        <select data-user-plan="${n(o.id)}" class="ax-select-sm">
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

      <h2>Comptes existants (${e.length})</h2>
      <ul class="ax-user-list">${s||`<li class="ax-muted">Aucun compte créé pour l'instant</li>`}</ul>
    </div>
  `}function M(){const e=_.listPending();return e.length?`
    <div class="ax-admin-section">
      <h2>Confirmations WhatsApp en attente</h2>
      <p class="ax-muted">Quand le client te a envoyé son code par WhatsApp, clique "Confirmer".</p>
      <ul class="ax-pending-list">${e.map(s=>`
      <li class="ax-pending-row">
        <strong>${n(s.name)}</strong>
        <span class="ax-muted">${n(s.whatsapp)}</span>
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
    `}function z(){return`
    <div class="ax-admin-section">
      <h2>État de santé</h2>
      <p class="ax-muted">Sentinelles + providers IA — Jet 2 enrichira avec dashboard live.</p>
    </div>
  `}function D(){const e=k.list(),i=k.count(),s=k.countActive(),o=["active","wip","archived"],c=e.map(r=>{const t=o.includes(r.status)?r.status:"archived",a=r.tech_stack.slice(0,4).map(l=>n(l)).join(", ");return`
        <li class="ax-project-row" data-project-id="${n(r.id)}">
          <div class="ax-project-head">
            <strong>${n(r.name)}</strong>
            <span class="ax-badge ax-badge-${t}">${n(t)}</span>
            <code class="ax-project-version">${n(r.version)}</code>
          </div>
          <p class="ax-muted">${n(r.description)}</p>
          <p class="ax-project-stack"><em>stack:</em> ${a||"—"}</p>
          <p class="ax-project-links">
            <a href="${n(r.deploy_url)}" target="_blank" rel="noopener">🚀 Live</a>
            ·
            <a href="${n(r.repo_url)}" target="_blank" rel="noopener">📦 Repo</a>
            · <span class="ax-muted">🛡 ${r.sentinels_count} sentinelles</span>
          </p>
          <div class="ax-project-edit">
            <input type="text" data-project-version="${n(r.id)}"
                   value="${n(r.version)}" placeholder="vX.Y" maxlength="20"
                   class="ax-input-sm" autocomplete="off">
            <select data-project-status="${n(r.id)}" class="ax-select-sm">
              <option value="active" ${r.status==="active"?"selected":""}>active</option>
              <option value="wip" ${r.status==="wip"?"selected":""}>wip</option>
              <option value="archived" ${r.status==="archived"?"selected":""}>archived</option>
            </select>
            <button class="ax-btn ax-btn-sm" data-project-save="${n(r.id)}">💾</button>
          </div>
        </li>
      `}).join("");return`
    <div class="ax-admin-section">
      <h2>📦 Projets KDMC (${i} — ${s} actifs/wip)</h2>
      <p class="ax-muted">
        Source de vérité injectée dans le system prompt IA Apex. Modifie version/statut → Apex le sait au prochain message.
      </p>
      <ul class="ax-project-list">${c||'<li class="ax-muted">Aucun projet enregistré</li>'}</ul>
    </div>
  `}function B(){return[["commerce","💳 Commerce"],["users","👥 Comptes"],["pending","📨 Attente"],["health","🩺 Santé"],["projects","📦 Projets"],["executions","⚙️ Exec"],["knowledge","📚 KB"],["bilan","📊 Bilan"],["consumption","💰 Conso"],["audit-log","🔒 Audit"]].filter(([s])=>{const o=q[s];return!o||A(o)}).map(([s,o])=>{const c=$===s;return`
        <button class="ax-tab ax-bounce-tap ${c?"ax-tab-active":""}" data-tab="${s}" style="flex:0 0 auto;white-space:nowrap;min-height:44px;padding:10px 14px;font-size:13px;line-height:1.2;border-radius:22px;cursor:pointer;transition:all 200ms cubic-bezier(0.16,1,0.3,1);border:1px solid;-webkit-tap-highlight-color:transparent;font-weight:600;letter-spacing:-0.01em;display:inline-flex;align-items:center;gap:4px;scroll-snap-align:start;${c?"background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border-color:transparent;box-shadow:0 4px 16px rgba(232,184,48,0.25),0 1px 3px rgba(0,0,0,0.2)":"background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.7);border-color:rgba(255,255,255,0.08)"}">${o}</button>
      `}).join("")}function U(){const e=h.listPendingExecutions({limit:30}),i=h.getStats(),s=h.listAllowedTasks(),o=h.listForbiddenTasks(),c={pending:"pending",dispatched:"wip",running:"wip",completed:"ok",failed:"error",cancelled:"archived",timeout:"error"},r=e.map(t=>{const a=c[t.status]??"archived",l=new Date(t.ts_created).toLocaleString(),m=t.duration_ms?`${Math.round(t.duration_ms/1e3)}s`:"—",b=t.workflow_run_url?`<a href="${n(t.workflow_run_url)}" target="_blank" rel="noopener">🔗 Workflow</a>`:'<span class="ax-muted">—</span>',g=t.status==="pending"||t.status==="dispatched";return`
        <li class="ax-execution-row" data-exec-id="${n(t.id)}">
          <div class="ax-exec-head">
            <code class="ax-exec-id">${n(t.id.slice(0,18))}</code>
            <span class="ax-badge ax-badge-${a}">${n(t.status)}</span>
            <strong>${n(t.task)}</strong>
          </div>
          <p class="ax-muted">📅 ${n(l)} · ⏱ ${n(m)} · 🚀 ${n(t.src)} · 👤 ${n(t.initiated_by)}</p>
          ${t.error?`<p class="ax-error">⚠ ${n(t.error.slice(0,200))}</p>`:""}
          <p class="ax-exec-actions">
            ${b}
            ${g?` · <button class="ax-btn ax-btn-sm" data-exec-cancel="${n(t.id)}">✕ Annuler</button>`:""}
            · <button class="ax-btn ax-btn-sm" data-exec-poll="${n(t.id)}">🔄 Refresh</button>
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
          <li><strong>Total</strong> : ${i.total}</li>
          <li><strong>En cours</strong> : ${i.pending} pending / ${i.running} running</li>
          <li><strong>Terminées</strong> : ${i.completed} ✅ · ${i.failed} ❌ · ${i.cancelled} 🚫</li>
          <li><strong>Success rate</strong> : ${i.success_rate}%</li>
          <li><strong>Avg duration</strong> : ${Math.round(i.avg_duration_ms/1e3)}s</li>
        </ul>
      </div>
      <div class="ax-info-card">
        <h3>✅ Tâches autorisées (${s.length})</h3>
        <p>${s.map(t=>`<code>${n(t)}</code>`).join(" · ")}</p>
        <h3>🚫 Tâches INTERDITES (${o.length})</h3>
        <p class="ax-muted">${o.map(t=>`<code>${n(t)}</code>`).join(" · ")}</p>
      </div>
      <h3>📋 Historique récent</h3>
      <ul class="ax-execution-list">${r||`<li class="ax-muted">Aucune exécution pour l'instant.</li>`}</ul>
    </div>
  `}function K(){const e=q[$];if(e&&!A(e))return`<div class="ax-admin-section">${j(e)}</div>`;switch($){case"commerce":return I();case"users":return R();case"pending":return M();case"health":return z();case"projects":return D();case"executions":return U();case"knowledge":return G();case"bilan":return'<div id="ax-admin-mount-bilan" class="ax-admin-section"><p class="ax-muted">Chargement du bilan financier…</p></div>';case"consumption":return'<div id="ax-admin-mount-consumption" class="ax-admin-section"><p class="ax-muted">Chargement consommation IA…</p></div>';case"audit-log":return'<div id="ax-admin-mount-audit-log" class="ax-admin-section"><p class="ax-muted">Chargement audit log immuable…</p></div>'}}async function C(e){const i=e.querySelector("#ax-admin-mount-bilan");if(i)try{(await w(()=>import("./financial-bilan-BOaW2uP7.js"),__vite__mapDeps([0,1,2,3,4]),import.meta.url)).render(i)}catch(c){v.warn("admin","financial-bilan render failed",{err:c}),i.innerHTML='<p class="ax-muted">Bilan indisponible (module ko)</p>'}const s=e.querySelector("#ax-admin-mount-consumption");if(s)try{(await w(()=>import("./consumption-dashboard-C5P_BCu6.js"),__vite__mapDeps([1,2,3,0,4]),import.meta.url)).render(s)}catch(c){v.warn("admin","consumption-dashboard render failed",{err:c}),s.innerHTML='<p class="ax-muted">Consommation indisponible (module ko)</p>'}const o=e.querySelector("#ax-admin-mount-audit-log");if(o){if(!A("admin.audit-log")){o.innerHTML=j("admin.audit-log");return}try{const{auditLog:c}=await w(async()=>{const{auditLog:a}=await import("./apex-kb-D-Wwv6M3.js").then(l=>l.c);return{auditLog:a}},__vite__mapDeps([1,2,3]),import.meta.url);c.init();const r=c.getEntries().slice(-100).reverse(),t=r.map(a=>`<li><code>${n(new Date(a.ts).toLocaleString())}</code> · <strong>${n(a.action)}</strong> · ${n(a.actor||"system")}</li>`).join("");o.innerHTML=`
        <h2>🔒 Audit log immuable</h2>
        <p class="ax-muted">${r.length} évènements récents (chain hash vérifié).</p>
        <ul class="ax-audit-list">${t||'<li class="ax-muted">Aucun événement</li>'}</ul>
      `}catch(c){v.warn("admin","audit-log render failed",{err:c}),o.innerHTML='<p class="ax-muted">Audit log indisponible (module ko)</p>'}}}function G(){const e=f.listRepos(),i=f.getStats(),s=e.map(o=>`
      <li class="ax-repo-row">
        <code>${n(o)}</code>
        ${e.length>1?`<button class="ax-btn ax-btn-sm" data-remove-repo="${n(o)}">Retirer</button>`:""}
      </li>
    `).join("");return`
    <div class="ax-admin-section">
      <h2>📚 Base de connaissances Kevin</h2>
      <p class="ax-muted">
        Apex peut chercher full-text dans le code de tes repos GitHub via API
        (5000 req/h authenticated, cache 1h).
      </p>

      <div class="ax-info-card">
        <strong>État :</strong> ${i.repos} repos · ${i.cache_entries} entrées cache · ${i.index_entries} fichiers indexés
        <br>
        <strong>Token GitHub :</strong> ${i.has_token?"✅ configuré":"⚪ Configure ax_github_token dans le Coffre pour 5000 req/h"}
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
  `}function O(e){e.querySelectorAll("[data-nav-route]").forEach(t=>{p.bind(t,"click",()=>{d.tap();const a=t.dataset.navRoute??"chat";window.location.hash="#"+a})}),e.querySelectorAll('[data-action="select-all"]').forEach(t=>{p.bind(t,"click",()=>{t.select()})}),e.querySelectorAll("[data-tab]").forEach(t=>{p.bind(t,"click",()=>{d.selection(),$=t.dataset.tab,x(e)})});const i=e.querySelector("#commerce-toggle");i&&p.bind(i,"change",()=>{d.medium(),S.setEnabled(i.checked),u.success(`Commercialisation ${i.checked?"activée":"désactivée"}`),x(e)});const s=e.querySelector("#create-user-form");s&&p.bind(s,"submit",t=>{t.preventDefault(),V(e)}),e.querySelectorAll("[data-user-plan]").forEach(t=>{p.bind(t,"change",()=>{const a=t.dataset.userPlan??"";a&&(S.setUserPlan(a,t.value),v.info("admin",`Plan ${t.value} → ${a}`))})}),e.querySelectorAll("[data-project-save]").forEach(t=>{p.bind(t,"click",()=>{d.tap();const a=t.dataset.projectSave??"";if(!a)return;const l=e.querySelector(`[data-project-version="${CSS.escape(a)}"]`),m=e.querySelector(`[data-project-status="${CSS.escape(a)}"]`),b=(l?.value??"").trim(),g=m?.value??"active";if(!b){u.warn("Version requise");return}k.update(a,{version:b,status:g})?(d.success(),u.success(`${a} → ${b} (${g})`),v.info("admin",`Project ${a} updated`,{version:b,status:g}),x(e)):(d.error(),u.error("Update échoué"))})}),e.querySelectorAll("[data-confirm-otp]").forEach(t=>{p.bind(t,"click",()=>{d.tap();const a=t.dataset.confirmOtp??"";if(!a)return;const l=_.confirm(a);l.ok?(d.success(),u.success("Compte activé"),v.info("admin",`Confirmed user ${l.uid}`),x(e)):(d.error(),u.error("Code OTP invalide ou expiré"))})}),e.querySelectorAll("[data-exec-cancel]").forEach(t=>{p.bind(t,"click",()=>{d.tap();const a=t.dataset.execCancel??"";if(!a)return;h.cancelExecution(a)?(d.success(),u.success("Exécution annulée"),x(e)):(d.warning(),u.warn("Annulation impossible"))})}),e.querySelectorAll("[data-exec-poll]").forEach(t=>{p.bind(t,"click",()=>{d.tap();const a=t.dataset.execPoll??"";a&&h.pollResult(a).then(l=>{l?(u.success(`Statut : ${l.status}`),x(e)):u.warn("Exécution introuvable")})})});const o=e.querySelector("#add-repo-form");o&&p.bind(o,"submit",t=>{t.preventDefault(),d.tap();const l=e.querySelector("#kb-add-repo")?.value.trim()??"";if(!l){u.warn("Indique un repo");return}const m=f.addRepo(l);m.ok?(d.success(),u.success(`Repo ajouté : ${l}`),x(e)):(d.error(),u.error(m.reason??"Erreur ajout repo"))}),e.querySelectorAll("[data-remove-repo]").forEach(t=>{p.bind(t,"click",()=>{d.tap();const a=t.dataset.removeRepo??"";a&&(f.removeRepo(a),u.success(`Repo retiré : ${a}`),x(e))})});const c=e.querySelector("#kb-search-form");c&&p.bind(c,"submit",t=>{t.preventDefault(),d.tap();const a=e.querySelector("#kb-search-query"),l=e.querySelector("#kb-search-results"),m=a?.value.trim()??"";!m||!l||(l.innerHTML='<p class="ax-muted">Recherche en cours...</p>',f.searchCode(m).then(b=>{if(b.length===0){l.innerHTML='<p class="ax-muted">Aucun résultat (configure ax_github_token pour augmenter la limite).</p>';return}const g=b.slice(0,20).map(y=>`
            <li class="ax-kb-result">
              <a href="${n(y.htmlUrl)}" target="_blank" rel="noopener">
                <code>${n(y.path)}</code>
              </a>
              <span class="ax-muted">${n(y.repo)} · score ${y.score.toFixed(2)}</span>
            </li>
          `).join("");l.innerHTML=`<ul class="ax-kb-results-list">${g}</ul>`}))});const r=e.querySelector("#kb-clear-cache");r&&p.bind(r,"click",()=>{d.tap();const t=f.clearCache();u.success(`Cache vidé : ${t.cleared} entrées`),x(e)})}async function V(e){const i=e.querySelector("#cu-name")?.value.trim()??"",s=e.querySelector("#cu-tier")?.value??"family",o=e.querySelector("#cu-email")?.value.trim()??"",c=e.querySelector("#cu-whatsapp")?.value.trim()??"",r=e.querySelector("#cu-pin")?.value??"";if(!i||i.length<2){d.warning(),u.warn("Nom complet requis (min 2 caractères)");return}const t=await T.createUser({name:i,tier:s,...o&&{email:o},...c&&{whatsappPhone:c},...r&&{initialPin:r}}),a=e.querySelector("#create-user-result");if(!a)return;if(!t.ok||!t.uid){d.error();const m=t.reason??"Erreur création";a.innerHTML=`<div class="ax-error">${n(m)}</div>`,u.error(m);return}d.success(),u.success(`Compte ${i} créé`);let l="";if(c){const m=await _.requestConfirmation({uid:t.uid,name:i,whatsappPhone:c});m.ok&&m.inviteLink&&(l=`
        <a href="${m.inviteLink}" target="_blank" rel="noopener" class="ax-btn ax-btn-primary">
          📨 Envoyer le code via WhatsApp
        </a>
        <p class="ax-muted">Code OTP : <code>${m.otp}</code></p>
      `)}a.innerHTML=`
    <div class="ax-success">
      Compte créé : <strong>${n(i)}</strong> (${s})
      <p>Lien d'invitation : <input type="text" readonly value="${t.inviteLink??""}" data-action="select-all" style="width:100%"></p>
      ${l}
    </div>
  `,x(e)}let p=null;function oe(){p?.cleanup(),p=null}function x(e){if(p?.cleanup(),p=L("admin"),!P.get("isAdmin")){e.innerHTML=`
      <div class="ax-empty">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}if(e.innerHTML=`
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
      <nav class="ax-tabs" style="display:flex;flex-wrap:nowrap;gap:8px;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;padding:6px 0 12px;margin:0 -16px 14px;padding-left:16px;padding-right:16px;border-bottom:1px solid rgba(255,255,255,0.06);scrollbar-width:thin;scroll-snap-type:x mandatory;scroll-padding-left:16px">${B()}</nav>
      <div class="ax-admin-content">${K()}</div>
    </div>
  `,O(e),$==="bilan"||$==="consumption"){const s=e.querySelector(".ax-admin-content");if(s){const o=H(s,"admin-table");C(e).finally(()=>{o()})}else C(e)}}export{oe as dispose,x as render};
