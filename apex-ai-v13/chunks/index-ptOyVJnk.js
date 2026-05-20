const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-3uBGKGRH.js"])))=>i.map(i=>d[i]);
import{_ as m}from"./apex-kb-BUdkXo7X.js";import{e as c}from"./escape-html-BlQj2yEF.js";import{c as C}from"./listener-cleanup-Y2rGGxxX.js";import{l as A}from"./monitoring-3uBGKGRH.js";import{A as b,s as S}from"./auto-improvement-core-Dt7OknT2.js";import"./voice-CKlB4PWs.js";import"./credential-patterns-CLzI061R.js";let u=null;function V(){u?.cleanup(),u=null}const P={critical:'<span style="color:#ff5b5b">🔥 CRITICAL</span>',high:'<span style="color:#22cc77">⭐ HIGH</span>',medium:'<span style="color:#f0c020">○ MEDIUM</span>',low:'<span style="color:#888">— LOW</span>'},k={installed:'<span style="color:#22cc77">🟢 Installé</span>',available:'<span style="color:#9aa">⚪ Disponible</span>',"unsupported-pwa":'<span style="color:#ff5b5b">🔴 Non-PWA</span>',planned:'<span style="color:#aa8">🟡 Planifié</span>'},z={"dev-tools":"🛠 Dev Tools",lsp:"📝 LSP (langage)",database:"🗄 Database",cloud:"☁ Cloud",deployment:"🚀 Deployment",monitoring:"📊 Monitoring",security:"🛡 Security",productivity:"✨ Productivity",design:"🎨 Design",api:"🔌 API",search:"🔍 Search","vector-rag":"🧠 Vector RAG",payment:"💳 Payment",messaging:"💬 Messaging",social:"📱 Social",auth:"🔐 Auth","ai-ml":"🤖 AI/ML",analytics:"📈 Analytics",mobile:"📱 Mobile",browser:"🌐 Browser",content:"📁 Content",data:"💾 Data",memory:"🧬 Memory",voice:"🎙 Voice",workflow:"⚙ Workflow",observability:"👁 Observability",testing:"🧪 Testing",location:"📍 Location",finance:"💰 Finance",creator:"🎬 Creator",learning:"📚 Learning"},t={search:"",categoryFilter:"all",statusFilter:"all",pwaOnly:!0,view:"marketplace",extendedTypeFilter:"all",extendedCompatFilter:"all",extendedValueFilter:"all",extendedSortBy:"value"},h={"mcp-server":"🧩 MCP Server","mcp-aggregator":"🌐 MCP Aggregator","claude-skill":"🎯 Claude Skill","claude-hook":"🪝 Claude Hook","claude-command":"⌨ Claude Command","claude-subagent-orchestrator":"🤖 Subagent Orchestrator","agent-framework":"🏗 Agent Framework","browser-api":"🌍 Browser API","web-tool":"🛠 Web Tool","github-action":"⚙ GitHub Action","tooling-cli":"⌨ CLI Tooling","status-line":"📊 Status Line","pwa-capability":"📱 PWA Capability"},$={"pwa-direct":"🟢 PWA Direct","cloudflare-worker":"🟡 CF Worker","node-required":"🔴 Node Only","native-only":"⛔ Native Only"},T={high:'<span style="color:#22cc77">⭐ HIGH</span>',medium:'<span style="color:#f0c020">○ MEDIUM</span>',low:'<span style="color:#888">— LOW</span>'};async function s(e){if(u?.cleanup(),u=C("plugins"),t.view==="extended"){await L(e);return}const{apexPluginsMarketplace:n}=await m(async()=>{const{apexPluginsMarketplace:i}=await import("./apex-plugins-marketplace-WgHbLSmB.js");return{apexPluginsMarketplace:i}},__vite__mapDeps([0]),import.meta.url),d=n.getStats(),f=n.getCategories();let r;t.search.trim()?r=n.search(t.search,100):r=n.list({...t.categoryFilter!=="all"&&{category:t.categoryFilter},...t.statusFilter!=="all"&&{status:t.statusFilter},pwaOnly:t.pwaOnly});const x=n.recommendForUser({minValue:"high",max:6});e.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:1100px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">🔌 Marketplace Plugins Apex</h1>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button id="ax-plg-tab-marketplace" class="ax-btn" style="padding:6px 12px;background:#c9a227;color:#000;font-weight:600;border:none;border-radius:6px;font-size:12px;cursor:pointer">📦 Marketplace</button>
        <button id="ax-plg-tab-extended" class="ax-btn" style="padding:6px 12px;background:rgba(20,20,35,0.7);color:#fff;border:1px solid #444;border-radius:6px;font-size:12px;cursor:pointer">🌐 Extended Catalog (${b.length}+)</button>
      </div>
      <p style="color:var(--ax-text-dim);margin:0 0 12px;font-size:14px">
        ${d.totalCatalog} plugins recensés (Anthropic Claude / MCP servers / community / apex-internal).
        <strong style="color:#22cc77">${d.totalInstalled} installés</strong>
        · ${d.totalAvailable} dispo PWA
        · <span style="color:#ff5b5b">${d.totalUnsupportedPwa} non-PWA</span>.
      </p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-bottom:16px">
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">Catalog</div>
          <div style="font-size:20px;color:#c9a227">${d.totalCatalog}</div>
        </div>
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">Installés</div>
          <div style="font-size:20px;color:#22cc77">${d.totalInstalled}</div>
        </div>
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">Disponibles</div>
          <div style="font-size:20px;color:#fff">${d.totalAvailable}</div>
        </div>
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">Non-PWA</div>
          <div style="font-size:20px;color:#ff5b5b">${d.totalUnsupportedPwa}</div>
        </div>
      </div>

      ${x.length>0?`<h2 style="margin:24px 0 8px;color:#c9a227;font-size:16px">⭐ Recommandés pour Kevin</h2>
           <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:8px;margin-bottom:16px">
             ${x.map(i=>_(i,n.getStatusOf(i.id))).join("")}
           </div>`:""}

      <div style="display:flex;gap:8px;margin:16px 0 12px;flex-wrap:wrap;align-items:center">
        <label for="ax-plg-search" class="sr-only">Rechercher un plugin par nom, tag ou description</label>
        <input id="ax-plg-search" placeholder="🔍 Rechercher (nom, tag, description)" aria-label="Rechercher un plugin par nom, tag ou description" value="${c(t.search)}"
          style="flex:1 1 240px;background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">

        <label for="ax-plg-cat" class="sr-only">Filtrer par catégorie</label>
        <select id="ax-plg-cat" aria-label="Filtrer les plugins par catégorie" style="background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">
          <option value="all">Toutes catégories</option>
          ${f.map(i=>`<option value="${c(i)}" ${t.categoryFilter===i?"selected":""}>${z[i]}</option>`).join("")}
        </select>

        <label for="ax-plg-status" class="sr-only">Filtrer par statut</label>
        <select id="ax-plg-status" aria-label="Filtrer les plugins par statut" style="background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">
          <option value="all" ${t.statusFilter==="all"?"selected":""}>Tous statuts</option>
          <option value="installed" ${t.statusFilter==="installed"?"selected":""}>🟢 Installés</option>
          <option value="available" ${t.statusFilter==="available"?"selected":""}>⚪ Disponibles</option>
          <option value="unsupported-pwa" ${t.statusFilter==="unsupported-pwa"?"selected":""}>🔴 Non-PWA</option>
          <option value="planned" ${t.statusFilter==="planned"?"selected":""}>🟡 Planifié</option>
        </select>

        <label style="font-size:12px;color:var(--ax-text-dim);display:flex;align-items:center;gap:4px;cursor:pointer">
          <input id="ax-plg-pwa-only" type="checkbox" aria-label="Filtrer plugins PWA uniquement" ${t.pwaOnly?"checked":""}> PWA seulement
        </label>
      </div>

      <h2 style="margin:16px 0 8px;color:#c9a227;font-size:16px">${r.length} plugins</h2>

      ${r.length===0?'<p style="text-align:center;color:var(--ax-text-dim);padding:32px">Aucun plugin ne correspond aux filtres.</p>':`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:8px">
             ${r.map(i=>_(i,n.getStatusOf(i.id))).join("")}
           </div>`}
    </div>
  `;const g=e.querySelector("#ax-plg-search");if(g){u.bind(g,"input",()=>{t.search=g.value}),u.bind(g,"change",()=>{s(e)});let i=null;u.bind(g,"keyup",()=>{i&&clearTimeout(i),i=setTimeout(()=>{s(e)},350)})}e.querySelector("#ax-plg-cat")?.addEventListener("change",i=>{const l=i.target.value;t.categoryFilter=l==="all"?"all":l,s(e)}),e.querySelector("#ax-plg-status")?.addEventListener("change",i=>{const l=i.target.value;t.statusFilter=l,s(e)}),e.querySelector("#ax-plg-pwa-only")?.addEventListener("change",i=>{t.pwaOnly=i.target.checked,s(e)}),e.querySelectorAll(".ax-plg-install").forEach(i=>{u.bind(i,"click",()=>{(async()=>{const l=i.dataset.id;if(!l)return;i.disabled=!0,i.textContent="⏳ Install…";const p=await n.install(l),{toast:v}=await m(async()=>{const{toast:a}=await import("./toast-CRdbcLoc.js");return{toast:a}},[],import.meta.url);p.ok?v.success(`✅ ${l} installé (${p.toolsAdded?.length??0} tools)`):p.requires_api_key?v.warn(`Clé requise : ${p.requires_api_key} dans le Coffre.`):v.error(`Échec : ${p.error??"inconnu"}`),await s(e)})()})}),e.querySelectorAll(".ax-plg-uninstall").forEach(i=>{u.bind(i,"click",()=>{(async()=>{const l=i.dataset.id;if(!l||typeof confirm=="function"&&!confirm(`Désinstaller ${l} ?`))return;i.disabled=!0,i.textContent="⏳";const p=await n.uninstall(l),{toast:v}=await m(async()=>{const{toast:a}=await import("./toast-CRdbcLoc.js");return{toast:a}},[],import.meta.url);p.ok?v.success(`Désinstallé ${l}`):v.error(`Échec : ${p.error??"inconnu"}`),await s(e)})()})}),e.querySelectorAll(".ax-plg-link").forEach(i=>{u.bind(i,"click",l=>{l.preventDefault();const p=i.dataset.url;p&&window.open(p,"_blank","noopener,noreferrer")})}),e.querySelector("#ax-plg-tab-extended")?.addEventListener("click",()=>{t.view="extended",s(e)}),e.querySelector("#ax-plg-tab-marketplace")?.addEventListener("click",()=>{t.view="marketplace",s(e)}),A.info("feature-plugins",`rendered ${r.length} plugins (cat=${t.categoryFilter}, status=${t.statusFilter}, pwa=${t.pwaOnly})`)}async function L(e){const{autoImprovement:n}=await m(async()=>{const{autoImprovement:a}=await import("./auto-improvement-core-Dt7OknT2.js").then(o=>o.a);return{autoImprovement:a}},__vite__mapDeps([0]),import.meta.url),d=n.getState(),f=new Set(d.installed);let r=t.search.trim()?S(t.search):b;t.extendedTypeFilter!=="all"&&(r=r.filter(a=>a.type===t.extendedTypeFilter)),t.extendedCompatFilter!=="all"&&(r=r.filter(a=>a.apex_compatibility===t.extendedCompatFilter)),t.extendedValueFilter!=="all"&&(r=r.filter(a=>a.auto_improvement_value===t.extendedValueFilter)),t.pwaOnly&&(r=r.filter(a=>a.apex_compatibility==="pwa-direct"||a.apex_compatibility==="cloudflare-worker"));const x=[...r].sort((a,o)=>{if(t.extendedSortBy==="value"){const y={high:0,medium:1,low:2};return y[a.auto_improvement_value]-y[o.auto_improvement_value]}return t.extendedSortBy==="stars"?(o.github_stars??0)-(a.github_stars??0):a.name.localeCompare(o.name)}),g=b.length,i=d.installed.length,l=d.skipped.length,p=b.filter(a=>a.apex_compatibility==="pwa-direct"||a.apex_compatibility==="cloudflare-worker").length;e.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:1100px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">🌐 Extended Catalog Apex</h1>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button id="ax-plg-tab-marketplace" class="ax-btn" style="padding:6px 12px;background:rgba(20,20,35,0.7);color:#fff;border:1px solid #444;border-radius:6px;font-size:12px;cursor:pointer">📦 Marketplace</button>
        <button id="ax-plg-tab-extended" class="ax-btn" style="padding:6px 12px;background:#c9a227;color:#000;font-weight:600;border:none;border-radius:6px;font-size:12px;cursor:pointer">🌐 Extended Catalog (${g})</button>
      </div>
      <p style="color:var(--ax-text-dim);margin:0 0 12px;font-size:14px">
        ${g} outils recensés (MCP / Claude skills/hooks/commands / agent frameworks / PWA APIs / GitHub Actions).
        <strong style="color:#22cc77">${i} auto-installés</strong>
        · ${p} PWA-compatibles
        · <span style="color:#ff5b5b">${l} skipped</span>.
      </p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-bottom:16px">
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">Total Catalog</div>
          <div style="font-size:20px;color:#c9a227">${g}</div>
        </div>
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">PWA-compatible</div>
          <div style="font-size:20px;color:#22cc77">${p}</div>
        </div>
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">Auto-installés</div>
          <div style="font-size:20px;color:#fff">${i}</div>
        </div>
        <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:8px">
          <div style="font-size:11px;color:var(--ax-text-dim)">Skipped</div>
          <div style="font-size:20px;color:#ff5b5b">${l}</div>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin:16px 0 12px;flex-wrap:wrap;align-items:center">
        <label for="ax-ext-search" class="sr-only">Rechercher un outil étendu par nom, description ou catégorie</label>
        <input id="ax-ext-search" placeholder="🔍 Rechercher (nom, description, catégorie)" aria-label="Rechercher un outil étendu par nom, description ou catégorie" value="${c(t.search)}"
          style="flex:1 1 240px;background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">

        <label for="ax-ext-type" class="sr-only">Filtrer par type d'outil</label>
        <select id="ax-ext-type" aria-label="Filtrer par type d'outil" style="background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">
          <option value="all" ${t.extendedTypeFilter==="all"?"selected":""}>Tous types</option>
          ${Object.keys(h).map(a=>`<option value="${a}" ${t.extendedTypeFilter===a?"selected":""}>${h[a]}</option>`).join("")}
        </select>

        <select id="ax-ext-compat" style="background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">
          <option value="all" ${t.extendedCompatFilter==="all"?"selected":""}>Toutes compat</option>
          ${Object.keys($).map(a=>`<option value="${a}" ${t.extendedCompatFilter===a?"selected":""}>${$[a]}</option>`).join("")}
        </select>

        <select id="ax-ext-value" style="background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">
          <option value="all" ${t.extendedValueFilter==="all"?"selected":""}>Toutes valeurs</option>
          <option value="high" ${t.extendedValueFilter==="high"?"selected":""}>⭐ HIGH</option>
          <option value="medium" ${t.extendedValueFilter==="medium"?"selected":""}>○ MEDIUM</option>
          <option value="low" ${t.extendedValueFilter==="low"?"selected":""}>— LOW</option>
        </select>

        <select id="ax-ext-sort" style="background:rgba(20,20,35,0.7);border:1px solid #444;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px">
          <option value="value" ${t.extendedSortBy==="value"?"selected":""}>Tri : Valeur ↓</option>
          <option value="stars" ${t.extendedSortBy==="stars"?"selected":""}>Tri : Stars ↓</option>
          <option value="name" ${t.extendedSortBy==="name"?"selected":""}>Tri : Nom A-Z</option>
        </select>

        <label style="font-size:12px;color:var(--ax-text-dim);display:flex;align-items:center;gap:4px;cursor:pointer">
          <input id="ax-ext-pwa-only" type="checkbox" aria-label="Filtrer outils PWA uniquement" ${t.pwaOnly?"checked":""}> PWA seulement
        </label>
      </div>

      <h2 style="margin:16px 0 8px;color:#c9a227;font-size:16px">${x.length} outils</h2>

      ${x.length===0?'<p style="text-align:center;color:var(--ax-text-dim);padding:32px">Aucun outil ne correspond aux filtres.</p>':`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:8px">
             ${x.slice(0,200).map(a=>I(a,f.has(a.id))).join("")}
           </div>`}
      ${x.length>200?`<p style="text-align:center;color:var(--ax-text-dim);margin-top:8px;font-size:12px">… et ${x.length-200} autres (filtre pour voir).</p>`:""}
    </div>
  `;const v=e.querySelector("#ax-ext-search");if(v){let a=null;u.bind(v,"input",()=>{t.search=v.value}),u.bind(v,"keyup",()=>{a&&clearTimeout(a),a=setTimeout(()=>{s(e)},350)})}e.querySelector("#ax-ext-type")?.addEventListener("change",a=>{const o=a.target.value;t.extendedTypeFilter=o==="all"?"all":o,s(e)}),e.querySelector("#ax-ext-compat")?.addEventListener("change",a=>{const o=a.target.value;t.extendedCompatFilter=o==="all"?"all":o,s(e)}),e.querySelector("#ax-ext-value")?.addEventListener("change",a=>{const o=a.target.value;t.extendedValueFilter=o==="all"?"all":o,s(e)}),e.querySelector("#ax-ext-sort")?.addEventListener("change",a=>{const o=a.target.value;t.extendedSortBy=o,s(e)}),e.querySelector("#ax-ext-pwa-only")?.addEventListener("change",a=>{t.pwaOnly=a.target.checked,s(e)}),e.querySelectorAll(".ax-ext-install").forEach(a=>{u.bind(a,"click",()=>{(async()=>{const o=a.dataset.id;if(!o)return;a.disabled=!0,a.textContent="⏳ Install…";const y=await n.autoInstallSafe(o),{toast:w}=await m(async()=>{const{toast:F}=await import("./toast-CRdbcLoc.js");return{toast:F}},[],import.meta.url);y.ok?w.success(`✅ ${o} installé`):w.warn(`⚠ ${y.message}`),await s(e)})()})}),e.querySelectorAll(".ax-ext-link").forEach(a=>{u.bind(a,"click",o=>{o.preventDefault();const y=a.dataset.url;y&&window.open(y,"_blank","noopener,noreferrer")})}),e.querySelector("#ax-plg-tab-extended")?.addEventListener("click",()=>{t.view="extended",s(e)}),e.querySelector("#ax-plg-tab-marketplace")?.addEventListener("click",()=>{t.view="marketplace",s(e)}),A.info("feature-plugins.extended",`rendered ${x.length} extended tools (type=${t.extendedTypeFilter}, compat=${t.extendedCompatFilter})`)}function I(e,n){const d=T[e.auto_improvement_value],f=$[e.apex_compatibility],r=h[e.type],x=e.github_stars?` ★${e.github_stars>=1e3?`${(e.github_stars/1e3).toFixed(1)}k`:e.github_stars}`:"",g=n?'<span style="font-size:10px;color:#22cc77">🟢 Installé</span>':e.apex_compatibility==="native-only"||e.apex_compatibility==="node-required"?`<span style="font-size:10px;color:var(--ax-text-dim)">${f}</span>`:`<button class="ax-btn ax-ext-install" data-id="${c(e.id)}" style="padding:4px 8px;font-size:11px;background:#2c5a2c;color:#fff;border:none;border-radius:4px;cursor:pointer">⬇ Auto-install</button>`;return`
    <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.05)">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:6px;margin-bottom:6px">
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;color:#fff;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c(e.name)}${x}</div>
          <div style="display:flex;gap:4px;align-items:center;margin-top:2px;flex-wrap:wrap">
            <span style="font-size:9px;color:var(--ax-text-dim)">${r}</span>
          </div>
        </div>
        <div style="font-size:10px;white-space:nowrap">${f}</div>
      </div>
      <div style="font-size:11px;color:var(--ax-text-dim);min-height:32px;margin-bottom:6px">${c(e.description)}</div>
      <div style="font-size:9px;color:var(--ax-text-dim);margin-bottom:6px">
        ${e.categories.map(i=>`<span style="background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:3px;margin-right:2px">${c(i)}</span>`).join("")}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-top:6px">
        <div>${d}</div>
        ${g}
      </div>
      <div style="margin-top:6px">
        <a href="#" class="ax-ext-link" data-url="${c(e.source_url)}" style="font-size:10px;color:#7aa3ff">→ ${c(e.source_url.slice(0,60))}${e.source_url.length>60?"…":""}</a>
      </div>
    </div>
  `}function _(e,n){const d=P[e.estimated_value],f=k[n]??k.available,r=e.source==="anthropic-official"?'<span style="background:rgba(201,162,39,0.2);padding:2px 6px;border-radius:4px;font-size:9px;color:#c9a227">OFFICIAL</span>':e.source==="mcp-server"?'<span style="background:rgba(34,204,119,0.2);padding:2px 6px;border-radius:4px;font-size:9px;color:#22cc77">MCP</span>':e.source==="apex-internal"?'<span style="background:rgba(255,91,91,0.2);padding:2px 6px;border-radius:4px;font-size:9px;color:#ff5b5b">INTERNAL</span>':'<span style="background:rgba(150,150,150,0.2);padding:2px 6px;border-radius:4px;font-size:9px;color:#aaa">COMMUNITY</span>',x=n==="installed",g=n==="unsupported-pwa",i=e.source==="apex-internal";let l="";x&&!i?l=`<button class="ax-btn ax-plg-uninstall" data-id="${c(e.id)}" style="padding:4px 8px;font-size:11px;background:#5a2c2c;color:#fff">🗑 Désinstaller</button>`:x&&i?l='<span style="font-size:10px;color:var(--ax-text-dim)">Plugin natif (non-désinstallable)</span>':g?l='<span style="font-size:10px;color:#ff5b5b">Non-PWA</span>':l=`<button class="ax-btn ax-plg-install" data-id="${c(e.id)}" style="padding:4px 8px;font-size:11px;background:#2c5a2c;color:#fff">⬇ Installer</button>`;const p=e.api_key_service?`<div style="font-size:10px;color:var(--ax-text-dim);margin-top:4px">🔑 Clé : ${c(e.api_key_service)}</div>`:"",v=e.oauth_required?'<div style="font-size:10px;color:#f0c020;margin-top:4px">🔐 OAuth requis</div>':"",a=e.apex_tools&&e.apex_tools.length>0?`<div style="font-size:10px;color:#22cc77;margin-top:4px">🛠 ${e.apex_tools.length} tools</div>`:"";return`
    <div style="background:rgba(20,20,35,0.5);padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.05)">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:6px;margin-bottom:6px">
        <div style="flex:1">
          <div style="font-size:14px;color:#fff;font-weight:600">${c(e.name)}</div>
          <div style="display:flex;gap:4px;align-items:center;margin-top:2px;flex-wrap:wrap">
            ${r}
            <span style="font-size:9px;color:var(--ax-text-dim)">${z[e.category]}</span>
          </div>
        </div>
        <div style="font-size:10px">${f}</div>
      </div>
      <div style="font-size:11px;color:var(--ax-text-dim);min-height:32px;margin-bottom:6px">${c(e.description)}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-top:6px">
        <div>${d}</div>
        ${l}
      </div>
      ${p}
      ${v}
      ${a}
      <div style="margin-top:6px">
        <a href="#" class="ax-plg-link" data-url="${c(e.url)}" style="font-size:10px;color:#7aa3ff">→ ${c(e.url.slice(0,60))}${e.url.length>60?"…":""}</a>
      </div>
    </div>
  `}export{V as dispose,s as render};
