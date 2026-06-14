const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-DH74a0iT.js","./multi-source-analyze-Co-t5i4k.js","./credential-patterns-DUMYZEMu.js","./apex-kb-0RG8aBQA.js"])))=>i.map(i=>d[i]);
import{_ as b,e as p,l as A}from"./monitoring-DH74a0iT.js";import{c as S}from"./listener-cleanup-Y2rGGxxX.js";import{A as h,s as P}from"./auto-improvement-core-CrqptrjI.js";import"./multi-source-analyze-Co-t5i4k.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-0RG8aBQA.js";let g=null;function V(){g?.cleanup(),g=null}const T={critical:'<span class="ax-gs-13">🔥 CRITICAL</span>',high:'<span class="ax-gs-14">⭐ HIGH</span>',medium:'<span class="ax-gs-44">○ MEDIUM</span>',low:'<span class="ax-gs-25">— LOW</span>'},_={installed:'<span class="ax-gs-14">🟢 Installé</span>',available:'<span class="ax-gs-139">⚪ Disponible</span>',"unsupported-pwa":'<span class="ax-gs-13">🔴 Non-PWA</span>',planned:'<span style="color:#aa8">🟡 Planifié</span>'},F={"dev-tools":"🛠 Dev Tools",lsp:"📝 LSP (langage)",database:"🗄 Database",cloud:"☁ Cloud",deployment:"🚀 Deployment",monitoring:"📊 Monitoring",security:"🛡 Security",productivity:"✨ Productivity",design:"🎨 Design",api:"🔌 API",search:"🔍 Search","vector-rag":"🧠 Vector RAG",payment:"💳 Payment",messaging:"💬 Messaging",social:"📱 Social",auth:"🔐 Auth","ai-ml":"🤖 AI/ML",analytics:"📈 Analytics",mobile:"📱 Mobile",browser:"🌐 Browser",content:"📁 Content",data:"💾 Data",memory:"🧬 Memory",voice:"🎙 Voice",workflow:"⚙ Workflow",observability:"👁 Observability",testing:"🧪 Testing",location:"📍 Location",finance:"💰 Finance",creator:"🎬 Creator",learning:"📚 Learning"},a={search:"",categoryFilter:"all",statusFilter:"all",pwaOnly:!0,view:"marketplace",extendedTypeFilter:"all",extendedCompatFilter:"all",extendedValueFilter:"all",extendedSortBy:"value"},f={"mcp-server":"🧩 MCP Server","mcp-aggregator":"🌐 MCP Aggregator","claude-skill":"🎯 Claude Skill","claude-hook":"🪝 Claude Hook","claude-command":"⌨ Claude Command","claude-subagent-orchestrator":"🤖 Subagent Orchestrator","agent-framework":"🏗 Agent Framework","browser-api":"🌍 Browser API","web-tool":"🛠 Web Tool","github-action":"⚙ GitHub Action","tooling-cli":"⌨ CLI Tooling","status-line":"📊 Status Line","pwa-capability":"📱 PWA Capability"},$={"pwa-direct":"🟢 PWA Direct","cloudflare-worker":"🟡 CF Worker","node-required":"🔴 Node Only","native-only":"⛔ Native Only"},L={high:'<span class="ax-gs-14">⭐ HIGH</span>',medium:'<span class="ax-gs-44">○ MEDIUM</span>',low:'<span class="ax-gs-25">— LOW</span>'};async function r(e){if(g?.cleanup(),g=S("plugins"),a.view==="extended"){await I(e);return}const{apexPluginsMarketplace:o}=await b(async()=>{const{apexPluginsMarketplace:s}=await import("./apex-plugins-marketplace-D-KCVywG.js");return{apexPluginsMarketplace:s}},__vite__mapDeps([0,1,2,3]),import.meta.url),c=o.getStats(),m=o.getCategories();let n;a.search.trim()?n=o.search(a.search,100):n=o.list({...a.categoryFilter!=="all"&&{category:a.categoryFilter},...a.statusFilter!=="all"&&{status:a.statusFilter},pwaOnly:a.pwaOnly});const u=o.recommendForUser({minValue:"high",max:6});e.innerHTML=`
    <div class="ax-page ax-gs-268">
      <h1 class="ax-gs-365">🔌 Marketplace Plugins Apex</h1>
      <div class="ax-gs-67">
        <button id="ax-plg-tab-marketplace" class="ax-btn ax-gs-410">📦 Marketplace</button>
        <button id="ax-plg-tab-extended" class="ax-btn ax-gs-411">🌐 Extended Catalog (${h.length}+)</button>
      </div>
      <p class="ax-gs-385">
        ${c.totalCatalog} plugins recensés (Anthropic Claude / MCP servers / community / apex-internal).
        <strong class="ax-gs-279">${c.totalInstalled} installés</strong>
        · ${c.totalAvailable} dispo PWA
        · <span class="ax-gs-13">${c.totalUnsupportedPwa} non-PWA</span>.
      </p>

      <div class="ax-gs-141">
        <div class="ax-gs-9">
          <div class="ax-gs-2">Catalog</div>
          <div class="ax-gs-142">${c.totalCatalog}</div>
        </div>
        <div class="ax-gs-9">
          <div class="ax-gs-2">Installés</div>
          <div class="ax-gs-143">${c.totalInstalled}</div>
        </div>
        <div class="ax-gs-9">
          <div class="ax-gs-2">Disponibles</div>
          <div class="ax-gs-144">${c.totalAvailable}</div>
        </div>
        <div class="ax-gs-9">
          <div class="ax-gs-2">Non-PWA</div>
          <div class="ax-gs-145">${c.totalUnsupportedPwa}</div>
        </div>
      </div>

      ${u.length>0?`<h2 class="ax-gs-386">⭐ Recommandés pour Kevin</h2>
           <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:8px;margin-bottom:16px">
             ${u.map(s=>k(s,o.getStatusOf(s.id))).join("")}
           </div>`:""}

      <div class="ax-gs-146">
        <label for="ax-plg-search" class="sr-only">Rechercher un plugin par nom, tag ou description</label>
        <input id="ax-plg-search" placeholder="🔍 Rechercher (nom, tag, description)" aria-label="Rechercher un plugin par nom, tag ou description" value="${p(a.search)}"
          class="ax-gs-412">

        <label for="ax-plg-cat" class="sr-only">Filtrer par catégorie</label>
        <select id="ax-plg-cat" aria-label="Filtrer les plugins par catégorie" class="ax-gs-413">
          <option value="all">Toutes catégories</option>
          ${m.map(s=>`<option value="${p(s)}" ${a.categoryFilter===s?"selected":""}>${F[s]}</option>`).join("")}
        </select>

        <label for="ax-plg-status" class="sr-only">Filtrer par statut</label>
        <select id="ax-plg-status" aria-label="Filtrer les plugins par statut" class="ax-gs-413">
          <option value="all" ${a.statusFilter==="all"?"selected":""}>Tous statuts</option>
          <option value="installed" ${a.statusFilter==="installed"?"selected":""}>🟢 Installés</option>
          <option value="available" ${a.statusFilter==="available"?"selected":""}>⚪ Disponibles</option>
          <option value="unsupported-pwa" ${a.statusFilter==="unsupported-pwa"?"selected":""}>🔴 Non-PWA</option>
          <option value="planned" ${a.statusFilter==="planned"?"selected":""}>🟡 Planifié</option>
        </select>

        <label class="ax-gs-414">
          <input id="ax-plg-pwa-only" type="checkbox" aria-label="Filtrer plugins PWA uniquement" ${a.pwaOnly?"checked":""}> PWA seulement
        </label>
      </div>

      <h2 class="ax-gs-415">${n.length} plugins</h2>

      ${n.length===0?'<p class="ax-gs-231">Aucun plugin ne correspond aux filtres.</p>':`<div class="ax-gs-147">
             ${n.map(s=>k(s,o.getStatusOf(s.id))).join("")}
           </div>`}
    </div>
  `;const x=e.querySelector("#ax-plg-search");if(x){g.bind(x,"input",()=>{a.search=x.value}),g.bind(x,"change",()=>{r(e)});let s=null;g.bind(x,"keyup",()=>{s&&clearTimeout(s),s=setTimeout(()=>{r(e)},350)})}e.querySelector("#ax-plg-cat")?.addEventListener("change",s=>{const l=s.target.value;a.categoryFilter=l==="all"?"all":l,r(e)}),e.querySelector("#ax-plg-status")?.addEventListener("change",s=>{const l=s.target.value;a.statusFilter=l,r(e)}),e.querySelector("#ax-plg-pwa-only")?.addEventListener("change",s=>{a.pwaOnly=s.target.checked,r(e)}),e.querySelectorAll(".ax-plg-install").forEach(s=>{g.bind(s,"click",()=>{(async()=>{const l=s.dataset.id;if(!l)return;s.disabled=!0,s.textContent="⏳ Install…";const d=await o.install(l),{toast:v}=await b(async()=>{const{toast:t}=await import("./toast-CRdbcLoc.js");return{toast:t}},[],import.meta.url);d.ok?v.success(`✅ ${l} installé (${d.toolsAdded?.length??0} tools)`):d.requires_api_key?v.warn(`Clé requise : ${d.requires_api_key} dans le Coffre.`):v.error(`Échec : ${d.error??"inconnu"}`),await r(e)})()})}),e.querySelectorAll(".ax-plg-uninstall").forEach(s=>{g.bind(s,"click",()=>{(async()=>{const l=s.dataset.id;if(!l||typeof confirm=="function"&&!confirm(`Désinstaller ${l} ?`))return;s.disabled=!0,s.textContent="⏳";const d=await o.uninstall(l),{toast:v}=await b(async()=>{const{toast:t}=await import("./toast-CRdbcLoc.js");return{toast:t}},[],import.meta.url);d.ok?v.success(`Désinstallé ${l}`):v.error(`Échec : ${d.error??"inconnu"}`),await r(e)})()})}),e.querySelectorAll(".ax-plg-link").forEach(s=>{g.bind(s,"click",l=>{l.preventDefault();const d=s.dataset.url;d&&window.open(d,"_blank","noopener,noreferrer")})}),e.querySelector("#ax-plg-tab-extended")?.addEventListener("click",()=>{a.view="extended",r(e)}),e.querySelector("#ax-plg-tab-marketplace")?.addEventListener("click",()=>{a.view="marketplace",r(e)}),A.info("feature-plugins",`rendered ${n.length} plugins (cat=${a.categoryFilter}, status=${a.statusFilter}, pwa=${a.pwaOnly})`)}async function I(e){const{autoImprovement:o}=await b(async()=>{const{autoImprovement:t}=await import("./auto-improvement-core-CrqptrjI.js").then(i=>i.a);return{autoImprovement:t}},__vite__mapDeps([0,1,2,3]),import.meta.url),c=o.getState(),m=new Set(c.installed);let n=a.search.trim()?P(a.search):h;a.extendedTypeFilter!=="all"&&(n=n.filter(t=>t.type===a.extendedTypeFilter)),a.extendedCompatFilter!=="all"&&(n=n.filter(t=>t.apex_compatibility===a.extendedCompatFilter)),a.extendedValueFilter!=="all"&&(n=n.filter(t=>t.auto_improvement_value===a.extendedValueFilter)),a.pwaOnly&&(n=n.filter(t=>t.apex_compatibility==="pwa-direct"||t.apex_compatibility==="cloudflare-worker"));const u=[...n].sort((t,i)=>{if(a.extendedSortBy==="value"){const y={high:0,medium:1,low:2};return y[t.auto_improvement_value]-y[i.auto_improvement_value]}return a.extendedSortBy==="stars"?(i.github_stars??0)-(t.github_stars??0):t.name.localeCompare(i.name)}),x=h.length,s=c.installed.length,l=c.skipped.length,d=h.filter(t=>t.apex_compatibility==="pwa-direct"||t.apex_compatibility==="cloudflare-worker").length;e.innerHTML=`
    <div class="ax-page ax-gs-268">
      <h1 class="ax-gs-365">🌐 Extended Catalog Apex</h1>
      <div class="ax-gs-67">
        <button id="ax-plg-tab-marketplace" class="ax-btn ax-gs-411">📦 Marketplace</button>
        <button id="ax-plg-tab-extended" class="ax-btn ax-gs-410">🌐 Extended Catalog (${x})</button>
      </div>
      <p class="ax-gs-385">
        ${x} outils recensés (MCP / Claude skills/hooks/commands / agent frameworks / PWA APIs / GitHub Actions).
        <strong class="ax-gs-279">${s} auto-installés</strong>
        · ${d} PWA-compatibles
        · <span class="ax-gs-13">${l} skipped</span>.
      </p>

      <div class="ax-gs-141">
        <div class="ax-gs-9">
          <div class="ax-gs-2">Total Catalog</div>
          <div class="ax-gs-142">${x}</div>
        </div>
        <div class="ax-gs-9">
          <div class="ax-gs-2">PWA-compatible</div>
          <div class="ax-gs-143">${d}</div>
        </div>
        <div class="ax-gs-9">
          <div class="ax-gs-2">Auto-installés</div>
          <div class="ax-gs-144">${s}</div>
        </div>
        <div class="ax-gs-9">
          <div class="ax-gs-2">Skipped</div>
          <div class="ax-gs-145">${l}</div>
        </div>
      </div>

      <div class="ax-gs-146">
        <label for="ax-ext-search" class="sr-only">Rechercher un outil étendu par nom, description ou catégorie</label>
        <input id="ax-ext-search" placeholder="🔍 Rechercher (nom, description, catégorie)" aria-label="Rechercher un outil étendu par nom, description ou catégorie" value="${p(a.search)}"
          class="ax-gs-412">

        <label for="ax-ext-type" class="sr-only">Filtrer par type d'outil</label>
        <select id="ax-ext-type" aria-label="Filtrer par type d'outil" class="ax-gs-413">
          <option value="all" ${a.extendedTypeFilter==="all"?"selected":""}>Tous types</option>
          ${Object.keys(f).map(t=>`<option value="${t}" ${a.extendedTypeFilter===t?"selected":""}>${f[t]}</option>`).join("")}
        </select>

        <select id="ax-ext-compat" class="ax-gs-413">
          <option value="all" ${a.extendedCompatFilter==="all"?"selected":""}>Toutes compat</option>
          ${Object.keys($).map(t=>`<option value="${t}" ${a.extendedCompatFilter===t?"selected":""}>${$[t]}</option>`).join("")}
        </select>

        <select id="ax-ext-value" class="ax-gs-413">
          <option value="all" ${a.extendedValueFilter==="all"?"selected":""}>Toutes valeurs</option>
          <option value="high" ${a.extendedValueFilter==="high"?"selected":""}>⭐ HIGH</option>
          <option value="medium" ${a.extendedValueFilter==="medium"?"selected":""}>○ MEDIUM</option>
          <option value="low" ${a.extendedValueFilter==="low"?"selected":""}>— LOW</option>
        </select>

        <select id="ax-ext-sort" class="ax-gs-413">
          <option value="value" ${a.extendedSortBy==="value"?"selected":""}>Tri : Valeur ↓</option>
          <option value="stars" ${a.extendedSortBy==="stars"?"selected":""}>Tri : Stars ↓</option>
          <option value="name" ${a.extendedSortBy==="name"?"selected":""}>Tri : Nom A-Z</option>
        </select>

        <label class="ax-gs-414">
          <input id="ax-ext-pwa-only" type="checkbox" aria-label="Filtrer outils PWA uniquement" ${a.pwaOnly?"checked":""}> PWA seulement
        </label>
      </div>

      <h2 class="ax-gs-415">${u.length} outils</h2>

      ${u.length===0?'<p class="ax-gs-231">Aucun outil ne correspond aux filtres.</p>':`<div class="ax-gs-147">
             ${u.slice(0,200).map(t=>D(t,m.has(t.id))).join("")}
           </div>`}
      ${u.length>200?`<p style="text-align:center;color:var(--ax-text-dim);margin-top:8px;font-size:12px">… et ${u.length-200} autres (filtre pour voir).</p>`:""}
    </div>
  `;const v=e.querySelector("#ax-ext-search");if(v){let t=null;g.bind(v,"input",()=>{a.search=v.value}),g.bind(v,"keyup",()=>{t&&clearTimeout(t),t=setTimeout(()=>{r(e)},350)})}e.querySelector("#ax-ext-type")?.addEventListener("change",t=>{const i=t.target.value;a.extendedTypeFilter=i==="all"?"all":i,r(e)}),e.querySelector("#ax-ext-compat")?.addEventListener("change",t=>{const i=t.target.value;a.extendedCompatFilter=i==="all"?"all":i,r(e)}),e.querySelector("#ax-ext-value")?.addEventListener("change",t=>{const i=t.target.value;a.extendedValueFilter=i==="all"?"all":i,r(e)}),e.querySelector("#ax-ext-sort")?.addEventListener("change",t=>{const i=t.target.value;a.extendedSortBy=i,r(e)}),e.querySelector("#ax-ext-pwa-only")?.addEventListener("change",t=>{a.pwaOnly=t.target.checked,r(e)}),e.querySelectorAll(".ax-ext-install").forEach(t=>{g.bind(t,"click",()=>{(async()=>{const i=t.dataset.id;if(!i)return;t.disabled=!0,t.textContent="⏳ Install…";const y=await o.autoInstallSafe(i),{toast:w}=await b(async()=>{const{toast:C}=await import("./toast-CRdbcLoc.js");return{toast:C}},[],import.meta.url);y.ok?w.success(`✅ ${i} installé`):w.warn(`⚠ ${y.message}`),await r(e)})()})}),e.querySelectorAll(".ax-ext-link").forEach(t=>{g.bind(t,"click",i=>{i.preventDefault();const y=t.dataset.url;y&&window.open(y,"_blank","noopener,noreferrer")})}),e.querySelector("#ax-plg-tab-extended")?.addEventListener("click",()=>{a.view="extended",r(e)}),e.querySelector("#ax-plg-tab-marketplace")?.addEventListener("click",()=>{a.view="marketplace",r(e)}),A.info("feature-plugins.extended",`rendered ${u.length} extended tools (type=${a.extendedTypeFilter}, compat=${a.extendedCompatFilter})`)}function D(e,o){const c=L[e.auto_improvement_value],m=$[e.apex_compatibility],n=f[e.type],u=e.github_stars?` ★${e.github_stars>=1e3?`${(e.github_stars/1e3).toFixed(1)}k`:e.github_stars}`:"",x=o?'<span style="font-size:10px;color:#22cc77">🟢 Installé</span>':e.apex_compatibility==="native-only"||e.apex_compatibility==="node-required"?`<span class="ax-gs-8">${m}</span>`:`<button class="ax-btn ax-ext-install" data-id="${p(e.id)}" style="padding:4px 8px;font-size:11px;background:#2c5a2c;color:#fff;border:none;border-radius:4px;cursor:pointer">⬇ Auto-install</button>`;return`
    <div class="ax-gs-148">
      <div class="ax-gs-149">
        <div class="ax-gs-6">
          <div style="font-size:14px;color:#fff;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p(e.name)}${u}</div>
          <div class="ax-gs-150">
            <span class="ax-gs-151">${n}</span>
          </div>
        </div>
        <div style="font-size:10px;white-space:nowrap">${m}</div>
      </div>
      <div class="ax-gs-152">${p(e.description)}</div>
      <div style="font-size:9px;color:var(--ax-text-dim);margin-bottom:6px">
        ${e.categories.map(s=>`<span style="background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:3px;margin-right:2px">${p(s)}</span>`).join("")}
      </div>
      <div class="ax-gs-153">
        <div>${c}</div>
        ${x}
      </div>
      <div class="ax-gs-154">
        <a href="#" class="ax-ext-link ax-gs-237" data-url="${p(e.source_url)}">→ ${p(e.source_url.slice(0,60))}${e.source_url.length>60?"…":""}</a>
      </div>
    </div>
  `}function k(e,o){const c=T[e.estimated_value],m=_[o]??_.available,n=e.source==="anthropic-official"?'<span style="background:rgba(201,162,39,0.2);padding:2px 6px;border-radius:4px;font-size:9px;color:#c9a227">OFFICIAL</span>':e.source==="mcp-server"?'<span style="background:rgba(34,204,119,0.2);padding:2px 6px;border-radius:4px;font-size:9px;color:#22cc77">MCP</span>':e.source==="apex-internal"?'<span style="background:rgba(255,91,91,0.2);padding:2px 6px;border-radius:4px;font-size:9px;color:#ff5b5b">INTERNAL</span>':'<span style="background:rgba(150,150,150,0.2);padding:2px 6px;border-radius:4px;font-size:9px;color:#aaa">COMMUNITY</span>',u=o==="installed",x=o==="unsupported-pwa",s=e.source==="apex-internal";let l="";u&&!s?l=`<button class="ax-btn ax-plg-uninstall" data-id="${p(e.id)}" style="padding:4px 8px;font-size:11px;background:#5a2c2c;color:#fff">🗑 Désinstaller</button>`:u&&s?l='<span class="ax-gs-8">Plugin natif (non-désinstallable)</span>':x?l='<span style="font-size:10px;color:#ff5b5b">Non-PWA</span>':l=`<button class="ax-btn ax-plg-install" data-id="${p(e.id)}" style="padding:4px 8px;font-size:11px;background:#2c5a2c;color:#fff">⬇ Installer</button>`;const d=e.api_key_service?`<div style="font-size:10px;color:var(--ax-text-dim);margin-top:4px">🔑 Clé : ${p(e.api_key_service)}</div>`:"",v=e.oauth_required?'<div style="font-size:10px;color:#f0c020;margin-top:4px">🔐 OAuth requis</div>':"",t=e.apex_tools&&e.apex_tools.length>0?`<div style="font-size:10px;color:#22cc77;margin-top:4px">🛠 ${e.apex_tools.length} tools</div>`:"";return`
    <div class="ax-gs-148">
      <div class="ax-gs-149">
        <div class="ax-gs-26">
          <div class="ax-gs-155">${p(e.name)}</div>
          <div class="ax-gs-150">
            ${n}
            <span class="ax-gs-151">${F[e.category]}</span>
          </div>
        </div>
        <div style="font-size:10px">${m}</div>
      </div>
      <div class="ax-gs-152">${p(e.description)}</div>
      <div class="ax-gs-153">
        <div>${c}</div>
        ${l}
      </div>
      ${d}
      ${v}
      ${t}
      <div class="ax-gs-154">
        <a href="#" class="ax-plg-link ax-gs-237" data-url="${p(e.url)}">→ ${p(e.url.slice(0,60))}${e.url.length>60?"…":""}</a>
      </div>
    </div>
  `}export{V as dispose,r as render};
