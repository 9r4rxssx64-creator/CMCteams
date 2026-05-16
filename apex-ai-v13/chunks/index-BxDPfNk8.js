const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-3uBGKGRH.js","./multi-source-analyze-C5iju7K1.js","./apex-kb-CYBdNpxT.js","./credential-patterns-CLzI061R.js","../assets/css/main-BUIq5pfg.css"])))=>i.map(i=>d[i]);
import{b as v,_ as $}from"./apex-kb-CYBdNpxT.js";import{e as i}from"./escape-html-B4YFbUXM.js";import{c as H}from"./listener-cleanup-Y2rGGxxX.js";import{l as h}from"./monitoring-3uBGKGRH.js";import{s as I,a as M}from"../core/main-BU35gOTN.js";import{apexExecute as y}from"./apex-execute-Bk1rmegw.js";import{auth as P}from"./auth-BkgJ9fQa.js";import{commerce as _}from"./commerce-C_cvrpFF.js";import{c as D}from"./csp-style-helper-BisGRi53.js";import{i as T,r as z}from"./voice-BS8axcZk.js";import{kdmcProjectsRegistry as S}from"./kdmc-projects-registry-DdTqW2gy.js";import{w as j}from"./whatsapp-BMuvlHkc.js";import{haptic as d}from"./haptic-CQFg2PXZ.js";import{toast as p}from"./toast-CRdbcLoc.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-C5iju7K1.js";import"./claude-bridge-DrM6vAQj.js";let f="commerce";const R={commerce:"admin.commerce",users:"admin.users",pending:"admin.users",health:null,projects:null,executions:"admin.executions",knowledge:"admin.kb",bilan:"admin.bilan",consumption:"admin.consumption","audit-log":"admin.audit-log"};function E(){const t=_.isEnabled();return`
    <div class="ax-admin-section">
      <h2>Commercialisation</h2>
      <p class="ax-muted">
        Active le système d'abonnements pour les non-admin. Toi (Kevin admin) gardes l'accès illimité dans tous les cas.
      </p>
      <div class="ax-toggle-row">
        <label class="ax-toggle">
          <input type="checkbox" id="commerce-toggle" aria-label="Activer la commercialisation des plans payants" ${t?"checked":""}>
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
  `}function B(){const t=P.listUsers(),o=new Set(["admin","family","client_pro","client_free"]),c=t.map(r=>{const l=o.has(r.tier)?r.tier:"client_free";return`
      <li class="ax-user-row">
        <span class="ax-user-name">${i(r.name)}</span>
        <span class="ax-tier-badge ax-tier-${l}">${i(l)}</span>
        ${r.activated?'<span class="ax-badge ax-badge-ok">activé</span>':'<span class="ax-badge ax-badge-pending">en attente</span>'}
        <select data-user-plan="${i(r.id)}" class="ax-select-sm">
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
          <input type="text" id="cu-name" aria-label="Nom complet du nouveau compte" required minlength="2" autocomplete="off">
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
          <input type="email" id="cu-email" aria-label="Email du nouveau compte" autocomplete="off">
        </label>
        <label>
          Téléphone WhatsApp (avec indicatif, ex: +33612345678)
          <input type="tel" id="cu-whatsapp" aria-label="Numéro WhatsApp avec indicatif" autocomplete="off" placeholder="+33...">
        </label>
        <label>
          Code PIN initial (optionnel — sinon le client le crée à sa 1ère connexion)
          <input type="password" id="cu-pin" aria-label="PIN initial 4 chiffres minimum" minlength="4" autocomplete="new-password">
        </label>
        <button type="submit" class="ax-btn ax-btn-primary">Créer le compte</button>
      </form>
      <div id="create-user-result"></div>

      <h2>Comptes existants (${t.length})</h2>
      <ul class="ax-user-list">${c||`<li class="ax-muted">Aucun compte créé pour l'instant</li>`}</ul>
    </div>
  `}function F(){const t=j.listPending();return t.length?`
    <div class="ax-admin-section">
      <h2>Confirmations WhatsApp en attente</h2>
      <p class="ax-muted">Quand le client te a envoyé son code par WhatsApp, clique "Confirmer".</p>
      <ul class="ax-pending-list">${t.map(c=>`
      <li class="ax-pending-row">
        <strong>${i(c.name)}</strong>
        <span class="ax-muted">${i(c.whatsapp)}</span>
        <code class="ax-otp">${c.otp}</code>
        <button class="ax-btn ax-btn-sm" data-confirm-otp="${c.otp}">Confirmer</button>
      </li>
    `).join("")}</ul>
    </div>
  `:`
      <div class="ax-admin-section">
        <h2>Confirmations en attente</h2>
        <p class="ax-muted">Aucune confirmation à valider.</p>
      </div>
    `}function N(){return`
    <div class="ax-admin-section" data-scrollable="true">
      <h2>État de santé</h2>
      <p class="ax-muted">Codes vault · Liens dashboards · Sentinelles 24/7 · Connecteurs MCP · Vault drift. Tout testé en autonomie.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0">
        <button class="ax-btn ax-btn-primary" data-nav-route="admin-health-dashboard"
                style="background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;padding:12px 18px;border-radius:24px;font-weight:700;cursor:pointer;font-size:13px;min-height:44px;-webkit-tap-highlight-color:transparent">
          📊 Voir dashboard santé live
        </button>
        <button class="ax-btn" data-nav-route="admin-credentials-status"
                style="background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.1);padding:12px 18px;border-radius:24px;font-weight:600;cursor:pointer;font-size:13px;min-height:44px;-webkit-tap-highlight-color:transparent">
          🔑 Credentials
        </button>
        <button class="ax-btn" data-nav-route="admin-all-secrets"
                style="background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.1);padding:12px 18px;border-radius:24px;font-weight:600;cursor:pointer;font-size:13px;min-height:44px;-webkit-tap-highlight-color:transparent">
          🔐 Mes Secrets
        </button>
        <button class="ax-btn" data-nav-route="admin-yury-plugins"
                style="background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.1);padding:12px 18px;border-radius:24px;font-weight:600;cursor:pointer;font-size:13px;min-height:44px;-webkit-tap-highlight-color:transparent">
          🚀 Plugins Yury
        </button>
        <button class="ax-btn" data-nav-route="admin-shubham-skills"
                style="background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.1);padding:12px 18px;border-radius:24px;font-weight:600;cursor:pointer;font-size:13px;min-height:44px;-webkit-tap-highlight-color:transparent">
          🎬 Shubham Skills
        </button>
        <button class="ax-btn" data-nav-route="admin-autonomous"
                style="background:linear-gradient(135deg,rgba(60,200,80,0.18),rgba(232,184,48,0.12));color:#3c8;border:1px solid rgba(60,200,80,0.3);padding:12px 18px;border-radius:24px;font-weight:700;cursor:pointer;font-size:13px;min-height:44px;-webkit-tap-highlight-color:transparent">
          🤖 Mode Autonome
        </button>
        <button class="ax-btn" data-nav-route="skills-2026"
                style="background:linear-gradient(135deg,rgba(59,130,246,0.18),rgba(168,85,247,0.12));color:#8bb4ff;border:1px solid rgba(59,130,246,0.3);padding:12px 18px;border-radius:24px;font-weight:700;cursor:pointer;font-size:13px;min-height:44px;-webkit-tap-highlight-color:transparent">
          🎯 Skills 2026
        </button>
        <button class="ax-btn" data-nav-route="mcp-servers"
                style="background:linear-gradient(135deg,rgba(168,85,247,0.18),rgba(217,70,239,0.12));color:#c8a6ff;border:1px solid rgba(168,85,247,0.3);padding:12px 18px;border-radius:24px;font-weight:700;cursor:pointer;font-size:13px;min-height:44px;-webkit-tap-highlight-color:transparent">
          🔌 MCP Servers
        </button>
        <button class="ax-btn" data-nav-route="runtime-tests"
                style="background:linear-gradient(135deg,rgba(16,185,129,0.22),rgba(34,197,94,0.14));color:#34d399;border:1px solid rgba(16,185,129,0.4);padding:12px 18px;border-radius:24px;font-weight:700;cursor:pointer;font-size:13px;min-height:44px;-webkit-tap-highlight-color:transparent">
          🧪 Tester TOUT (live)
        </button>
        <button class="ax-btn" data-nav-route="apex-audits-live"
                style="background:linear-gradient(135deg,rgba(106,138,255,0.22),rgba(180,90,200,0.14));color:#8bb4ff;border:1px solid rgba(106,138,255,0.4);padding:12px 18px;border-radius:24px;font-weight:700;cursor:pointer;font-size:13px;min-height:44px;-webkit-tap-highlight-color:transparent">
          📊 Audits Apex (historique)
        </button>
      </div>
      <div id="ax-admin-health-mount" style="margin-top:14px"></div>
      <div id="ax-admin-audits-summary" style="margin-top:14px"></div>
    </div>
  `}function V(){const t=S.list(),o=S.count(),c=S.countActive(),r=["active","wip","archived"],l=t.map(n=>{const e=r.includes(n.status)?n.status:"archived",a=n.tech_stack.slice(0,4).map(s=>i(s)).join(", ");return`
        <li class="ax-project-row" data-project-id="${i(n.id)}">
          <div class="ax-project-head">
            <strong>${i(n.name)}</strong>
            <span class="ax-badge ax-badge-${e}">${i(e)}</span>
            <code class="ax-project-version">${i(n.version)}</code>
          </div>
          <p class="ax-muted">${i(n.description)}</p>
          <p class="ax-project-stack"><em>stack:</em> ${a||"—"}</p>
          <p class="ax-project-links">
            <a href="${i(n.deploy_url)}" target="_blank" rel="noopener">🚀 Live</a>
            ·
            <a href="${i(n.repo_url)}" target="_blank" rel="noopener">📦 Repo</a>
            · <span class="ax-muted">🛡 ${n.sentinels_count} sentinelles</span>
          </p>
          <div class="ax-project-edit">
            <input type="text" data-project-version="${i(n.id)}"
                   aria-label="Version du projet ${i(n.id)}"
                   value="${i(n.version)}" placeholder="vX.Y" maxlength="20"
                   class="ax-input-sm" autocomplete="off">
            <select data-project-status="${i(n.id)}" class="ax-select-sm">
              <option value="active" ${n.status==="active"?"selected":""}>active</option>
              <option value="wip" ${n.status==="wip"?"selected":""}>wip</option>
              <option value="archived" ${n.status==="archived"?"selected":""}>archived</option>
            </select>
            <button class="ax-btn ax-btn-sm" data-project-save="${i(n.id)}">💾</button>
          </div>
        </li>
      `}).join("");return`
    <div class="ax-admin-section">
      <h2>📦 Projets KDMC (${o} — ${c} actifs/wip)</h2>
      <p class="ax-muted">
        Source de vérité injectée dans le system prompt IA Apex. Modifie version/statut → Apex le sait au prochain message.
      </p>
      <ul class="ax-project-list">${l||'<li class="ax-muted">Aucun projet enregistré</li>'}</ul>
    </div>
  `}function U(){return[["commerce","💳 Commerce"],["users","👥 Comptes"],["pending","📨 Attente"],["health","🩺 Santé"],["projects","📦 Projets"],["executions","⚙️ Exec"],["knowledge","📚 KB"],["bilan","📊 Bilan"],["consumption","💰 Conso"],["audit-log","🔒 Audit"]].filter(([c])=>{const r=R[c];return!r||T(r)}).map(([c,r])=>{const l=f===c;return`
        <button class="ax-tab ax-bounce-tap ${l?"ax-tab-active":""}" data-tab="${c}" style="flex:0 0 auto;white-space:nowrap;min-height:44px;padding:10px 14px;font-size:13px;line-height:1.2;border-radius:22px;cursor:pointer;transition:all 200ms cubic-bezier(0.16,1,0.3,1);border:1px solid;-webkit-tap-highlight-color:transparent;font-weight:600;letter-spacing:-0.01em;display:inline-flex;align-items:center;gap:4px;scroll-snap-align:start;${l?"background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border-color:transparent;box-shadow:0 4px 16px rgba(232,184,48,0.25),0 1px 3px rgba(0,0,0,0.2)":"background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.7);border-color:rgba(255,255,255,0.08)"}">${r}</button>
      `}).join("")}function O(){const t=y.listPendingExecutions({limit:30}),o=y.getStats(),c=y.listAllowedTasks(),r=y.listForbiddenTasks(),l={pending:"pending",dispatched:"wip",running:"wip",completed:"ok",failed:"error",cancelled:"archived",timeout:"error"},n=t.map(e=>{const a=l[e.status]??"archived",s=new Date(e.ts_created).toLocaleString(),u=e.duration_ms?`${Math.round(e.duration_ms/1e3)}s`:"—",b=e.workflow_run_url?`<a href="${i(e.workflow_run_url)}" target="_blank" rel="noopener">🔗 Workflow</a>`:'<span class="ax-muted">—</span>',x=e.status==="pending"||e.status==="dispatched";return`
        <li class="ax-execution-row" data-exec-id="${i(e.id)}">
          <div class="ax-exec-head">
            <code class="ax-exec-id">${i(e.id.slice(0,18))}</code>
            <span class="ax-badge ax-badge-${a}">${i(e.status)}</span>
            <strong>${i(e.task)}</strong>
          </div>
          <p class="ax-muted">📅 ${i(s)} · ⏱ ${i(u)} · 🚀 ${i(e.src)} · 👤 ${i(e.initiated_by)}</p>
          ${e.error?`<p class="ax-error">⚠ ${i(e.error.slice(0,200))}</p>`:""}
          <p class="ax-exec-actions">
            ${b}
            ${x?` · <button class="ax-btn ax-btn-sm" data-exec-cancel="${i(e.id)}">✕ Annuler</button>`:""}
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
          <li><strong>Total</strong> : ${o.total}</li>
          <li><strong>En cours</strong> : ${o.pending} pending / ${o.running} running</li>
          <li><strong>Terminées</strong> : ${o.completed} ✅ · ${o.failed} ❌ · ${o.cancelled} 🚫</li>
          <li><strong>Success rate</strong> : ${o.success_rate}%</li>
          <li><strong>Avg duration</strong> : ${Math.round(o.avg_duration_ms/1e3)}s</li>
        </ul>
      </div>
      <div class="ax-info-card">
        <h3>✅ Tâches autorisées (${c.length})</h3>
        <p>${c.map(e=>`<code>${i(e)}</code>`).join(" · ")}</p>
        <h3>🚫 Tâches INTERDITES (${r.length})</h3>
        <p class="ax-muted">${r.map(e=>`<code>${i(e)}</code>`).join(" · ")}</p>
      </div>
      <h3>📋 Historique récent</h3>
      <ul class="ax-execution-list">${n||`<li class="ax-muted">Aucune exécution pour l'instant.</li>`}</ul>
    </div>
  `}function G(){const t=R[f];if(t&&!T(t))return`<div class="ax-admin-section">${z(t)}</div>`;switch(f){case"commerce":return E();case"users":return B();case"pending":return F();case"health":return N();case"projects":return V();case"executions":return O();case"knowledge":return K();case"bilan":return'<div id="ax-admin-mount-bilan" class="ax-admin-section"><p class="ax-muted">Chargement du bilan financier…</p></div>';case"consumption":return'<div id="ax-admin-mount-consumption" class="ax-admin-section"><p class="ax-muted">Chargement consommation IA…</p></div>';case"audit-log":return'<div id="ax-admin-mount-audit-log" class="ax-admin-section"><p class="ax-muted">Chargement audit log immuable…</p></div>'}}async function q(t){const o=t.querySelector("#ax-admin-audits-summary");if(o)try{const{reportsHistory:n}=await $(async()=>{const{reportsHistory:x}=await import("./apex-reports-history-Cv_X_jWe.js");return{reportsHistory:x}},__vite__mapDeps([0]),import.meta.url),e=n.getStats(),a=e.lastLayoutTs?new Date(e.lastLayoutTs).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"jamais",s=e.lastFunctionalTs?new Date(e.lastFunctionalTs).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"jamais",u=e.recentBugs>0?"#ff5b5b":"#22cc77",b=e.recentEscalations>0?"#ffaa66":"#22cc77";o.innerHTML=`
        <div class="ax-bounce-tap" data-nav-route="apex-audits-live" style="background:linear-gradient(135deg,rgba(106,138,255,0.10),rgba(180,90,200,0.06));border:1px solid rgba(106,138,255,0.3);border-radius:12px;padding:14px;cursor:pointer">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px">
            <h3 style="margin:0;color:#8bb4ff;font-size:14px;font-weight:700">📊 Apex Audits Live</h3>
            <span style="color:rgba(255,255,255,0.5);font-size:11px">Tap → historique complet →</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;font-size:12px;color:rgba(255,255,255,0.85)">
            <div>📐 Layout : <b>${e.layoutCount}</b> scans<br><span style="font-size:11px;color:rgba(255,255,255,0.5)">${a}</span></div>
            <div>🧪 Fonctionnel : <b>${e.functionalCount}</b> tests<br><span style="font-size:11px;color:rgba(255,255,255,0.5)">${s}</span></div>
            <div>🐛 Bugs 24h : <b style="color:${u}">${e.recentBugs}</b></div>
            <div>📤 Escaladés 24h : <b style="color:${b}">${e.recentEscalations}</b></div>
          </div>
        </div>
      `}catch(n){h.warn("admin","audits summary render failed",{err:n})}const c=t.querySelector("#ax-admin-mount-bilan");if(c)try{(await $(()=>import("./financial-bilan-D8OhAhZc.js"),__vite__mapDeps([1,2,0,3,4]),import.meta.url)).render(c)}catch(n){h.warn("admin","financial-bilan render failed",{err:n}),c.innerHTML='<p class="ax-muted">Bilan indisponible (module ko)</p>'}const r=t.querySelector("#ax-admin-mount-consumption");if(r)try{(await $(()=>import("./consumption-dashboard-DXu6ubSh.js"),__vite__mapDeps([2,0,3,1,4]),import.meta.url)).render(r)}catch(n){h.warn("admin","consumption-dashboard render failed",{err:n}),r.innerHTML='<p class="ax-muted">Consommation indisponible (module ko)</p>'}const l=t.querySelector("#ax-admin-mount-audit-log");if(l){if(!T("admin.audit-log")){l.innerHTML=z("admin.audit-log");return}try{const{auditLog:n}=await $(async()=>{const{auditLog:s}=await import("./apex-kb-CYBdNpxT.js").then(u=>u.d);return{auditLog:s}},__vite__mapDeps([2,0,3]),import.meta.url);n.init();const e=n.getEntries().slice(-100).reverse(),a=e.map(s=>`<li><code>${i(new Date(s.ts).toLocaleString())}</code> · <strong>${i(s.action)}</strong> · ${i(s.actor||"system")}</li>`).join("");l.innerHTML=`
        <h2>🔒 Audit log immuable</h2>
        <p class="ax-muted">${e.length} évènements récents (chain hash vérifié).</p>
        <ul class="ax-audit-list">${a||'<li class="ax-muted">Aucun événement</li>'}</ul>
      `}catch(n){h.warn("admin","audit-log render failed",{err:n}),l.innerHTML='<p class="ax-muted">Audit log indisponible (module ko)</p>'}}}function K(){const t=v.listRepos(),o=v.getStats(),c=t.map(r=>`
      <li class="ax-repo-row">
        <code>${i(r)}</code>
        ${t.length>1?`<button class="ax-btn ax-btn-sm" data-remove-repo="${i(r)}">Retirer</button>`:""}
      </li>
    `).join("");return`
    <div class="ax-admin-section">
      <h2>📚 Base de connaissances Kevin</h2>
      <p class="ax-muted">
        Apex peut chercher full-text dans le code de tes repos GitHub via API
        (5000 req/h authenticated, cache 1h).
      </p>

      <div class="ax-info-card">
        <strong>État :</strong> ${o.repos} repos · ${o.cache_entries} entrées cache · ${o.index_entries} fichiers indexés
        <br>
        <strong>Token GitHub :</strong> ${o.has_token?"✅ configuré":"⚪ Configure ax_github_token dans le Coffre pour 5000 req/h"}
      </div>

      <h3>Repos suivis</h3>
      <ul class="ax-repo-list">${c||'<li class="ax-muted">Aucun repo configuré</li>'}</ul>

      <form id="add-repo-form" class="ax-form">
        <label>
          <span>Ajouter un repo (format : owner/repo)</span>
          <input type="text" id="kb-add-repo" aria-label="Repo GitHub à ajouter (owner/repo)" placeholder="kevin/MyProject"
                 maxlength="100" autocomplete="off" class="ax-input">
        </label>
        <button type="submit" class="ax-btn ax-btn-primary">Ajouter</button>
      </form>

      <h3>Recherche dans le code</h3>
      <form id="kb-search-form" class="ax-form">
        <input type="text" id="kb-search-query" aria-label="Rechercher dans le code des repos" placeholder="Cherche dans tes repos..."
               maxlength="200" autocomplete="off" class="ax-input">
        <button type="submit" class="ax-btn ax-btn-primary">Chercher</button>
      </form>
      <div id="kb-search-results" class="ax-kb-results"></div>

      <div class="ax-actions">
        <button class="ax-btn ax-btn-sm" id="kb-clear-cache">🧹 Vider le cache</button>
      </div>
    </div>
  `}function W(t){t.querySelectorAll("[data-nav-route]").forEach(e=>{m.bind(e,"click",()=>{d.tap();const a=e.dataset.navRoute??"chat";window.location.hash="#"+a})}),t.querySelectorAll('[data-action="select-all"]').forEach(e=>{m.bind(e,"click",()=>{e.select()})}),t.querySelectorAll("[data-tab]").forEach(e=>{m.bind(e,"click",()=>{d.selection(),f=e.dataset.tab,g(t)})});const o=t.querySelector("#commerce-toggle");o&&m.bind(o,"change",()=>{const e=o.checked;d.medium();const a=t.querySelector(".ax-toggle-label");if(a){a.textContent="",a.append("Commercialisation ");const s=document.createElement("strong");s.textContent=e?"ACTIVÉE":"désactivée",a.append(s)}_.setEnabled(e),p.success(`Commercialisation ${e?"activée":"désactivée"}`),g(t)});const c=t.querySelector("#create-user-form");c&&m.bind(c,"submit",e=>{e.preventDefault(),Y(t)}),t.querySelectorAll("[data-user-plan]").forEach(e=>{m.bind(e,"change",()=>{const a=e.dataset.userPlan??"";a&&(_.setUserPlan(a,e.value),h.info("admin",`Plan ${e.value} → ${a}`))})}),t.querySelectorAll("[data-project-save]").forEach(e=>{m.bind(e,"click",()=>{d.tap();const a=e.dataset.projectSave??"";if(!a)return;const s=t.querySelector(`[data-project-version="${CSS.escape(a)}"]`),u=t.querySelector(`[data-project-status="${CSS.escape(a)}"]`),b=(s?.value??"").trim(),x=u?.value??"active";if(!b){p.warn("Version requise");return}S.update(a,{version:b,status:x})?(d.success(),p.success(`${a} → ${b} (${x})`),h.info("admin",`Project ${a} updated`,{version:b,status:x}),g(t)):(d.error(),p.error("Update échoué"))})}),t.querySelectorAll("[data-confirm-otp]").forEach(e=>{m.bind(e,"click",()=>{d.tap();const a=e.dataset.confirmOtp??"";if(!a)return;const s=j.confirm(a);s.ok?(d.success(),p.success("Compte activé"),h.info("admin",`Confirmed user ${s.uid}`),g(t)):(d.error(),p.error("Code OTP invalide ou expiré"))})}),t.querySelectorAll("[data-exec-cancel]").forEach(e=>{m.bind(e,"click",()=>{d.tap();const a=e.dataset.execCancel??"";if(!a)return;y.cancelExecution(a)?(d.success(),p.success("Exécution annulée"),g(t)):(d.warning(),p.warn("Annulation impossible"))})}),t.querySelectorAll("[data-exec-poll]").forEach(e=>{m.bind(e,"click",()=>{d.tap();const a=e.dataset.execPoll??"";a&&y.pollResult(a).then(s=>{s?(p.success(`Statut : ${s.status}`),g(t)):p.warn("Exécution introuvable")})})});const r=t.querySelector("#add-repo-form");r&&m.bind(r,"submit",e=>{e.preventDefault(),d.tap();const s=t.querySelector("#kb-add-repo")?.value.trim()??"";if(!s){p.warn("Indique un repo");return}const u=v.addRepo(s);u.ok?(d.success(),p.success(`Repo ajouté : ${s}`),g(t)):(d.error(),p.error(u.reason??"Erreur ajout repo"))}),t.querySelectorAll("[data-remove-repo]").forEach(e=>{m.bind(e,"click",()=>{d.tap();const a=e.dataset.removeRepo??"";a&&(v.removeRepo(a),p.success(`Repo retiré : ${a}`),g(t))})});const l=t.querySelector("#kb-search-form");l&&m.bind(l,"submit",e=>{e.preventDefault(),d.tap();const a=t.querySelector("#kb-search-query"),s=t.querySelector("#kb-search-results"),u=a?.value.trim()??"";!u||!s||(s.innerHTML='<p class="ax-muted">Recherche en cours...</p>',v.searchCode(u).then(b=>{if(b.length===0){s.innerHTML='<p class="ax-muted">Aucun résultat (configure ax_github_token pour augmenter la limite).</p>';return}s.textContent="";const x=document.createElement("ul");x.className="ax-kb-results-list",b.slice(0,20).forEach(w=>{const A=document.createElement("li");A.className="ax-kb-result";const k=document.createElement("a");k.href=w.htmlUrl,k.target="_blank",k.rel="noopener";const L=document.createElement("code");L.textContent=w.path,k.append(L);const C=document.createElement("span");C.className="ax-muted",C.textContent=`${w.repo} · score ${w.score.toFixed(2)}`,A.append(k," ",C),x.append(A)}),s.append(x)}))});const n=t.querySelector("#kb-clear-cache");n&&m.bind(n,"click",()=>{d.tap();const e=v.clearCache();p.success(`Cache vidé : ${e.cleared} entrées`),g(t)})}async function Y(t){const o=t.querySelector("#cu-name")?.value.trim()??"",c=t.querySelector("#cu-tier")?.value??"family",r=t.querySelector("#cu-email")?.value.trim()??"",l=t.querySelector("#cu-whatsapp")?.value.trim()??"",n=t.querySelector("#cu-pin")?.value??"";if(!o||o.length<2){d.warning(),p.warn("Nom complet requis (min 2 caractères)");return}const e=await P.createUser({name:o,tier:c,...r&&{email:r},...l&&{whatsappPhone:l},...n&&{initialPin:n}}),a=t.querySelector("#create-user-result");if(!a)return;if(!e.ok||!e.uid){d.error();const u=e.reason??"Erreur création";a.innerHTML=`<div class="ax-error">${i(u)}</div>`,p.error(u);return}d.success(),p.success(`Compte ${o} créé`);let s="";if(l){const u=await j.requestConfirmation({uid:e.uid,name:o,whatsappPhone:l});u.ok&&u.inviteLink&&(s=`
        <a href="${u.inviteLink}" target="_blank" rel="noopener" class="ax-btn ax-btn-primary">
          📨 Envoyer le code via WhatsApp
        </a>
        <p class="ax-muted">Code OTP : <code>${u.otp}</code></p>
      `)}a.innerHTML=`
    <div class="ax-success">
      Compte créé : <strong>${i(o)}</strong> (${c})
      <p>Lien d'invitation : <input type="text" aria-label="Lien d'invitation à copier" readonly value="${e.inviteLink??""}" data-action="select-all" style="width:100%"></p>
      ${s}
    </div>
  `,g(t)}let m=null;function me(){m?.cleanup(),m=null}function g(t){if(m?.cleanup(),m=H("admin"),!I.get("isAdmin")){t.innerHTML=`
      <div class="ax-empty">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}if(t.innerHTML=D.withNonce(`
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
      <nav class="ax-tabs" style="display:flex;flex-wrap:nowrap;gap:8px;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;padding:6px 0 12px;margin:0 -16px 14px;padding-left:16px;padding-right:16px;border-bottom:1px solid rgba(255,255,255,0.06);scrollbar-width:thin;scroll-snap-type:x mandatory;scroll-padding-left:16px">${U()}</nav>
      <div class="ax-admin-content">${G()}</div>
    </div>
  `),W(t),f==="bilan"||f==="consumption"){const c=f==="bilan"?"ax-admin-mount-bilan":"ax-admin-mount-consumption",r=t.querySelector(`#${c}`);if(r){const l=r.querySelector("p.ax-muted"),n=l?M(l,"admin-table"):()=>{};q(t).finally(()=>{n()})}else q(t)}}export{me as dispose,g as render};
