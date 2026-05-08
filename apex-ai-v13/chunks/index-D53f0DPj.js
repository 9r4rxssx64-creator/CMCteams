const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./multi-source-analyze-BefgB4O2.js","./apex-kb-BrxoW6ip.js","./monitoring-BAiQJoxJ.js","./credential-patterns-Dy6Wjk7e.js","../assets/css/main-BV2cw0DV.css"])))=>i.map(i=>d[i]);
import{b as g,_ as A}from"./apex-kb-BrxoW6ip.js";import{l as $}from"./monitoring-BAiQJoxJ.js";import{c as j}from"./listener-cleanup-Y2rGGxxX.js";import{s as T,a as q}from"../core/main-C9h0PGqO.js";import{apexExecute as h}from"./apex-execute-D1dScyVb.js";import{auth as _}from"./auth-CfqpDQHO.js";import{commerce as w}from"./commerce-Bu4l1GJI.js";import{kdmcProjectsRegistry as k}from"./kdmc-projects-registry-sRmoyobO.js";import{w as S}from"./whatsapp-Da9lMcEi.js";import{h as l}from"./haptic-BUEqXK0N.js";import{toast as d}from"./toast-Dgg9rcIP.js";import"./credential-patterns-Dy6Wjk7e.js";import"./multi-source-analyze-BefgB4O2.js";import"./claude-bridge-BDGYcmLV.js";let y="commerce";function n(t){return t.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]??a)}function P(){const t=w.isEnabled();return`
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
  `}function L(){const t=_.listUsers(),a=new Set(["admin","family","client_pro","client_free"]),o=t.map(i=>{const m=a.has(i.tier)?i.tier:"client_free";return`
      <li class="ax-user-row">
        <span class="ax-user-name">${n(i.name)}</span>
        <span class="ax-tier-badge ax-tier-${m}">${n(m)}</span>
        ${i.activated?'<span class="ax-badge ax-badge-ok">activé</span>':'<span class="ax-badge ax-badge-pending">en attente</span>'}
        <select data-user-plan="${n(i.id)}" class="ax-select-sm">
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
      <ul class="ax-user-list">${o||`<li class="ax-muted">Aucun compte créé pour l'instant</li>`}</ul>
    </div>
  `}function R(){const t=S.listPending();return t.length?`
    <div class="ax-admin-section">
      <h2>Confirmations WhatsApp en attente</h2>
      <p class="ax-muted">Quand le client te a envoyé son code par WhatsApp, clique "Confirmer".</p>
      <ul class="ax-pending-list">${t.map(o=>`
      <li class="ax-pending-row">
        <strong>${n(o.name)}</strong>
        <span class="ax-muted">${n(o.whatsapp)}</span>
        <code class="ax-otp">${o.otp}</code>
        <button class="ax-btn ax-btn-sm" data-confirm-otp="${o.otp}">Confirmer</button>
      </li>
    `).join("")}</ul>
    </div>
  `:`
      <div class="ax-admin-section">
        <h2>Confirmations en attente</h2>
        <p class="ax-muted">Aucune confirmation à valider.</p>
      </div>
    `}function H(){return`
    <div class="ax-admin-section">
      <h2>État de santé</h2>
      <p class="ax-muted">Sentinelles + providers IA — Jet 2 enrichira avec dashboard live.</p>
    </div>
  `}function I(){const t=k.list(),a=k.count(),o=k.countActive(),i=["active","wip","archived"],m=t.map(r=>{const e=i.includes(r.status)?r.status:"archived",s=r.tech_stack.slice(0,4).map(c=>n(c)).join(", ");return`
        <li class="ax-project-row" data-project-id="${n(r.id)}">
          <div class="ax-project-head">
            <strong>${n(r.name)}</strong>
            <span class="ax-badge ax-badge-${e}">${n(e)}</span>
            <code class="ax-project-version">${n(r.version)}</code>
          </div>
          <p class="ax-muted">${n(r.description)}</p>
          <p class="ax-project-stack"><em>stack:</em> ${s||"—"}</p>
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
      <h2>📦 Projets KDMC (${a} — ${o} actifs/wip)</h2>
      <p class="ax-muted">
        Source de vérité injectée dans le system prompt IA Apex. Modifie version/statut → Apex le sait au prochain message.
      </p>
      <ul class="ax-project-list">${m||'<li class="ax-muted">Aucun projet enregistré</li>'}</ul>
    </div>
  `}function z(){return[["commerce","💳 Commerce"],["users","👥 Comptes"],["pending","📨 Attente"],["health","🩺 Santé"],["projects","📦 Projets"],["executions","⚙️ Exec"],["knowledge","📚 KB"],["bilan","📊 Bilan"],["consumption","💰 Conso"]].map(([a,o])=>{const i=y===a;return`
        <button class="ax-tab ax-bounce-tap ${i?"ax-tab-active":""}" data-tab="${a}" style="flex:0 0 auto;white-space:nowrap;min-height:44px;padding:10px 14px;font-size:13px;line-height:1.2;border-radius:22px;cursor:pointer;transition:all 200ms cubic-bezier(0.16,1,0.3,1);border:1px solid;-webkit-tap-highlight-color:transparent;font-weight:600;letter-spacing:-0.01em;display:inline-flex;align-items:center;gap:4px;scroll-snap-align:start;${i?"background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border-color:transparent;box-shadow:0 4px 16px rgba(232,184,48,0.25),0 1px 3px rgba(0,0,0,0.2)":"background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.7);border-color:rgba(255,255,255,0.08)"}">${o}</button>
      `}).join("")}function M(){const t=h.listPendingExecutions({limit:30}),a=h.getStats(),o=h.listAllowedTasks(),i=h.listForbiddenTasks(),m={pending:"pending",dispatched:"wip",running:"wip",completed:"ok",failed:"error",cancelled:"archived",timeout:"error"},r=t.map(e=>{const s=m[e.status]??"archived",c=new Date(e.ts_created).toLocaleString(),p=e.duration_ms?`${Math.round(e.duration_ms/1e3)}s`:"—",b=e.workflow_run_url?`<a href="${n(e.workflow_run_url)}" target="_blank" rel="noopener">🔗 Workflow</a>`:'<span class="ax-muted">—</span>',f=e.status==="pending"||e.status==="dispatched";return`
        <li class="ax-execution-row" data-exec-id="${n(e.id)}">
          <div class="ax-exec-head">
            <code class="ax-exec-id">${n(e.id.slice(0,18))}</code>
            <span class="ax-badge ax-badge-${s}">${n(e.status)}</span>
            <strong>${n(e.task)}</strong>
          </div>
          <p class="ax-muted">📅 ${n(c)} · ⏱ ${n(p)} · 🚀 ${n(e.src)} · 👤 ${n(e.initiated_by)}</p>
          ${e.error?`<p class="ax-error">⚠ ${n(e.error.slice(0,200))}</p>`:""}
          <p class="ax-exec-actions">
            ${b}
            ${f?` · <button class="ax-btn ax-btn-sm" data-exec-cancel="${n(e.id)}">✕ Annuler</button>`:""}
            · <button class="ax-btn ax-btn-sm" data-exec-poll="${n(e.id)}">🔄 Refresh</button>
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
        <h3>✅ Tâches autorisées (${o.length})</h3>
        <p>${o.map(e=>`<code>${n(e)}</code>`).join(" · ")}</p>
        <h3>🚫 Tâches INTERDITES (${i.length})</h3>
        <p class="ax-muted">${i.map(e=>`<code>${n(e)}</code>`).join(" · ")}</p>
      </div>
      <h3>📋 Historique récent</h3>
      <ul class="ax-execution-list">${r||`<li class="ax-muted">Aucune exécution pour l'instant.</li>`}</ul>
    </div>
  `}function D(){switch(y){case"commerce":return P();case"users":return L();case"pending":return R();case"health":return H();case"projects":return I();case"executions":return M();case"knowledge":return U();case"bilan":return'<div id="ax-admin-mount-bilan" class="ax-admin-section"><p class="ax-muted">Chargement du bilan financier…</p></div>';case"consumption":return'<div id="ax-admin-mount-consumption" class="ax-admin-section"><p class="ax-muted">Chargement consommation IA…</p></div>'}}async function C(t){const a=t.querySelector("#ax-admin-mount-bilan");if(a)try{(await A(()=>import("./financial-bilan-D-uVp6Gg.js"),__vite__mapDeps([0,1,2,3,4]),import.meta.url)).render(a)}catch(i){$.warn("admin","financial-bilan render failed",{err:i}),a.innerHTML='<p class="ax-muted">Bilan indisponible (module ko)</p>'}const o=t.querySelector("#ax-admin-mount-consumption");if(o)try{(await A(()=>import("./consumption-dashboard-0z6nxrhu.js"),__vite__mapDeps([1,2,3,0,4]),import.meta.url)).render(o)}catch(i){$.warn("admin","consumption-dashboard render failed",{err:i}),o.innerHTML='<p class="ax-muted">Consommation indisponible (module ko)</p>'}}function U(){const t=g.listRepos(),a=g.getStats(),o=t.map(i=>`
      <li class="ax-repo-row">
        <code>${n(i)}</code>
        ${t.length>1?`<button class="ax-btn ax-btn-sm" data-remove-repo="${n(i)}">Retirer</button>`:""}
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
      <ul class="ax-repo-list">${o||'<li class="ax-muted">Aucun repo configuré</li>'}</ul>

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
  `}function B(t){t.querySelectorAll("[data-nav-route]").forEach(e=>{u.bind(e,"click",()=>{l.tap();const s=e.dataset.navRoute??"chat";window.location.hash="#"+s})}),t.querySelectorAll('[data-action="select-all"]').forEach(e=>{u.bind(e,"click",()=>{e.select()})}),t.querySelectorAll("[data-tab]").forEach(e=>{u.bind(e,"click",()=>{l.selection(),y=e.dataset.tab,x(t)})});const a=t.querySelector("#commerce-toggle");a&&u.bind(a,"change",()=>{l.medium(),w.setEnabled(a.checked),d.success(`Commercialisation ${a.checked?"activée":"désactivée"}`),x(t)});const o=t.querySelector("#create-user-form");o&&u.bind(o,"submit",e=>{e.preventDefault(),K(t)}),t.querySelectorAll("[data-user-plan]").forEach(e=>{u.bind(e,"change",()=>{const s=e.dataset.userPlan??"";s&&(w.setUserPlan(s,e.value),$.info("admin",`Plan ${e.value} → ${s}`))})}),t.querySelectorAll("[data-project-save]").forEach(e=>{u.bind(e,"click",()=>{l.tap();const s=e.dataset.projectSave??"";if(!s)return;const c=t.querySelector(`[data-project-version="${CSS.escape(s)}"]`),p=t.querySelector(`[data-project-status="${CSS.escape(s)}"]`),b=(c?.value??"").trim(),f=p?.value??"active";if(!b){d.warn("Version requise");return}k.update(s,{version:b,status:f})?(l.success(),d.success(`${s} → ${b} (${f})`),$.info("admin",`Project ${s} updated`,{version:b,status:f}),x(t)):(l.error(),d.error("Update échoué"))})}),t.querySelectorAll("[data-confirm-otp]").forEach(e=>{u.bind(e,"click",()=>{l.tap();const s=e.dataset.confirmOtp??"";if(!s)return;const c=S.confirm(s);c.ok?(l.success(),d.success("Compte activé"),$.info("admin",`Confirmed user ${c.uid}`),x(t)):(l.error(),d.error("Code OTP invalide ou expiré"))})}),t.querySelectorAll("[data-exec-cancel]").forEach(e=>{u.bind(e,"click",()=>{l.tap();const s=e.dataset.execCancel??"";if(!s)return;h.cancelExecution(s)?(l.success(),d.success("Exécution annulée"),x(t)):(l.warning(),d.warn("Annulation impossible"))})}),t.querySelectorAll("[data-exec-poll]").forEach(e=>{u.bind(e,"click",()=>{l.tap();const s=e.dataset.execPoll??"";s&&h.pollResult(s).then(c=>{c?(d.success(`Statut : ${c.status}`),x(t)):d.warn("Exécution introuvable")})})});const i=t.querySelector("#add-repo-form");i&&u.bind(i,"submit",e=>{e.preventDefault(),l.tap();const c=t.querySelector("#kb-add-repo")?.value.trim()??"";if(!c){d.warn("Indique un repo");return}const p=g.addRepo(c);p.ok?(l.success(),d.success(`Repo ajouté : ${c}`),x(t)):(l.error(),d.error(p.reason??"Erreur ajout repo"))}),t.querySelectorAll("[data-remove-repo]").forEach(e=>{u.bind(e,"click",()=>{l.tap();const s=e.dataset.removeRepo??"";s&&(g.removeRepo(s),d.success(`Repo retiré : ${s}`),x(t))})});const m=t.querySelector("#kb-search-form");m&&u.bind(m,"submit",e=>{e.preventDefault(),l.tap();const s=t.querySelector("#kb-search-query"),c=t.querySelector("#kb-search-results"),p=s?.value.trim()??"";!p||!c||(c.innerHTML='<p class="ax-muted">Recherche en cours...</p>',g.searchCode(p).then(b=>{if(b.length===0){c.innerHTML='<p class="ax-muted">Aucun résultat (configure ax_github_token pour augmenter la limite).</p>';return}const f=b.slice(0,20).map(v=>`
            <li class="ax-kb-result">
              <a href="${n(v.htmlUrl)}" target="_blank" rel="noopener">
                <code>${n(v.path)}</code>
              </a>
              <span class="ax-muted">${n(v.repo)} · score ${v.score.toFixed(2)}</span>
            </li>
          `).join("");c.innerHTML=`<ul class="ax-kb-results-list">${f}</ul>`}))});const r=t.querySelector("#kb-clear-cache");r&&u.bind(r,"click",()=>{l.tap();const e=g.clearCache();d.success(`Cache vidé : ${e.cleared} entrées`),x(t)})}async function K(t){const a=t.querySelector("#cu-name")?.value.trim()??"",o=t.querySelector("#cu-tier")?.value??"family",i=t.querySelector("#cu-email")?.value.trim()??"",m=t.querySelector("#cu-whatsapp")?.value.trim()??"",r=t.querySelector("#cu-pin")?.value??"";if(!a||a.length<2){l.warning(),d.warn("Nom complet requis (min 2 caractères)");return}const e=await _.createUser({name:a,tier:o,...i&&{email:i},...m&&{whatsappPhone:m},...r&&{initialPin:r}}),s=t.querySelector("#create-user-result");if(!s)return;if(!e.ok||!e.uid){l.error();const p=e.reason??"Erreur création";s.innerHTML=`<div class="ax-error">${n(p)}</div>`,d.error(p);return}l.success(),d.success(`Compte ${a} créé`);let c="";if(m){const p=await S.requestConfirmation({uid:e.uid,name:a,whatsappPhone:m});p.ok&&p.inviteLink&&(c=`
        <a href="${p.inviteLink}" target="_blank" rel="noopener" class="ax-btn ax-btn-primary">
          📨 Envoyer le code via WhatsApp
        </a>
        <p class="ax-muted">Code OTP : <code>${p.otp}</code></p>
      `)}s.innerHTML=`
    <div class="ax-success">
      Compte créé : <strong>${n(a)}</strong> (${o})
      <p>Lien d'invitation : <input type="text" readonly value="${e.inviteLink??""}" data-action="select-all" style="width:100%"></p>
      ${c}
    </div>
  `,x(t)}let u=null;function ae(){u?.cleanup(),u=null}function x(t){if(u?.cleanup(),u=j("admin"),!T.get("isAdmin")){t.innerHTML=`
      <div class="ax-empty">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}if(t.innerHTML=`
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
      <nav class="ax-tabs" style="display:flex;flex-wrap:nowrap;gap:8px;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;padding:6px 0 12px;margin:0 -16px 14px;padding-left:16px;padding-right:16px;border-bottom:1px solid rgba(255,255,255,0.06);scrollbar-width:thin;scroll-snap-type:x mandatory;scroll-padding-left:16px">${z()}</nav>
      <div class="ax-admin-content">${D()}</div>
    </div>
  `,B(t),y==="bilan"||y==="consumption"){const o=t.querySelector(".ax-admin-content");if(o){const i=q(o,"admin-table");C(t).finally(()=>{i()})}else C(t)}}export{ae as dispose,x as render};
