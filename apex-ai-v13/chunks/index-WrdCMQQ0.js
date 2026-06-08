import{e as i,l as p}from"./monitoring-DRVTXjnb.js";import{c as v}from"./listener-cleanup-Y2rGGxxX.js";import{apexMetaMarketplace as c,META_MARKETPLACE_CATALOG as x}from"./apex-meta-marketplace-D3wWmEpw.js";import"./multi-source-analyze-oyVqpynn.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-HfCuLlw7.js";let l=null;function L(){l?.cleanup(),l=null}const y={"ai-ml":"🤖 IA / ML","code-packages":"📦 Code / Packages",github:"🐙 GitHub",extensions:"🔌 Extensions",automation:"⚙ Automation",saas:"💼 SaaS",cloud:"☁ Cloud",apis:"🌐 APIs",datasets:"📊 Datasets",anthropic:"✨ Anthropic"};function k(){const e=c.getStats();return`
    <div class="meta-mkt-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:16px;padding:12px;background:rgba(255,255,255,.04);border-radius:10px;">
      <div><div class="ax-gs-32">Marketplaces</div><div class="ax-gs-66">${e.providers}</div></div>
      <div><div class="ax-gs-32">PWA-compatible</div><div style="font-size:1.5em;font-weight:600;color:#22cc77">${e.pwa_compatible}</div></div>
      <div><div class="ax-gs-32">Clés API requises</div><div class="ax-gs-66">${e.require_api_key}</div></div>
      <div><div class="ax-gs-32">Clés configurées</div><div style="font-size:1.5em;font-weight:600;color:#f0c020">${e.api_keys_configured}/${e.require_api_key}</div></div>
      <div><div class="ax-gs-32">Installs total</div><div class="ax-gs-66">${e.installs_total}</div></div>
    </div>
  `}function b(e){return`
    <div class="meta-mkt-cats" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
      <button data-meta-mkt-cat="" style="padding:6px 12px;border-radius:16px;border:1px solid #444;background:${e===null?"#2a2a4a":"transparent"};color:#fff;cursor:pointer;font-size:.9em;">Tous</button>
      ${["ai-ml","code-packages","github","extensions","automation","saas","cloud","apis","datasets","anthropic"].map(t=>`
        <button data-meta-mkt-cat="${t}" style="padding:6px 12px;border-radius:16px;border:1px solid #444;background:${e===t?"#2a2a4a":"transparent"};color:#fff;cursor:pointer;font-size:.9em;">${y[t]}</button>
      `).join("")}
    </div>
  `}function h(e){const r=e.pwa_compatible?"🟢":"🔴",t=e.api_key_required?"🔑":"";return`<span style="opacity:.7;font-size:.8em" title="${e.pwa_compatible?"PWA-compatible (search direct)":"Proxy/OAuth requis"}">${r} ${e.name} ${t}</span>`}function $(e){const r=c.getProvider(e.marketplace),t=typeof e.stars=="number"?`⭐ ${e.stars.toLocaleString("fr")}`:"",s=typeof e.downloads=="number"?`⬇ ${e.downloads.toLocaleString("fr")}`:"",n=e.price?`💰 ${e.price.amount} ${e.price.currency}`:"";return`
    <div class="meta-mkt-card" style="padding:12px;border:1px solid #333;border-radius:8px;background:rgba(255,255,255,.03);">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:8px;">
        <div class="ax-gs-6">
          <div style="font-weight:600;font-size:1em;word-break:break-word">${i(e.name)}</div>
          ${r?`<div style="margin-top:2px">${h(r)}</div>`:""}
        </div>
        <button data-meta-mkt-install="${i(e.marketplace)}|${i(e.id)}" style="padding:6px 10px;border-radius:6px;border:1px solid #22cc77;background:rgba(34,204,119,.1);color:#22cc77;cursor:pointer;font-size:.85em;flex-shrink:0">Installer</button>
      </div>
      <div style="margin-top:6px;opacity:.85;font-size:.85em;line-height:1.4">${i(e.description.slice(0,200))}</div>
      <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:10px;font-size:.8em;opacity:.75">
        ${t} ${s} ${n}
        ${e.category?`<span class="ax-gs-139">#${i(e.category)}</span>`:""}
        <a href="${i(e.url)}" target="_blank" rel="noopener" style="color:#6cf">Ouvrir →</a>
      </div>
    </div>
  `}function w(e){const r={};return e&&(r.category=e),`
    <div class="meta-mkt-providers" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;margin-bottom:16px;">
      ${c.listProviders(r).map(s=>`
        <div style="padding:8px 10px;background:rgba(255,255,255,.03);border-radius:6px;border:1px solid #2a2a2a">
          <div style="font-weight:600;font-size:.9em">${s.pwa_compatible?"🟢":"🔴"} ${i(s.name)}</div>
          <div style="opacity:.7;font-size:.75em;margin-top:2px">${i(s.description.slice(0,80))}</div>
          ${s.api_key_required?`<div style="font-size:.7em;color:#f0c020;margin-top:2px">🔑 ${i(s.api_key_service??"clé requise")}</div>`:""}
        </div>
      `).join("")}
    </div>
  `}function _(e){return e.length===0?'<div class="ax-gs-140">Aucun résultat. Essaie une autre query ou catégorie.</div>':`
    <div class="meta-mkt-results" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;">
      ${e.map($).join("")}
    </div>
  `}const a={category:null,query:"",loading:!1,results:[]};function A(){return`
    <div class="meta-mkt-feature" style="padding:16px;color:#fff;font-family:system-ui,-apple-system,sans-serif">
      <h2 style="margin:0 0 8px 0">🌐 Méta-Marketplace Apex</h2>
      <div style="opacity:.7;margin-bottom:12px;font-size:.9em">
        Search unifié dans <strong>${x.length}+ marketplaces</strong> du monde — IA, code, GitHub, plugins, automation, SaaS, cloud, APIs, datasets, anthropic.
      </div>
      ${k()}
      <div class="ax-gs-67">
        <input id="meta-mkt-search" type="search" aria-label="Recherche dans les marketplaces" placeholder="Cherche dans 30+ marketplaces (ex: stable diffusion, react, postgres)..." value="${i(a.query)}" style="flex:1;padding:10px 12px;border-radius:8px;border:1px solid #444;background:#1a1a2a;color:#fff;font-size:1em">
        <button id="meta-mkt-search-btn" style="padding:10px 16px;border-radius:8px;border:1px solid #6cf;background:rgba(102,204,255,.1);color:#6cf;cursor:pointer">Search</button>
      </div>
      ${b(a.category)}
      <div id="meta-mkt-content">
        ${a.loading?'<div class="ax-gs-140">⏳ Recherche en parallèle...</div>':a.results.length>0?_(a.results):w(a.category)}
      </div>
    </div>
  `}async function f(e,r){a.loading=!0,a.query=e,a.category=r,a.results=[],u();try{const t={limit:50};r&&(t.categories=[r]);const s=await c.searchAll(e,t);a.results=s}catch(t){p.warn("meta-marketplace-feature","searchAll failed",t)}finally{a.loading=!1,u()}}let o=null;function u(){o&&(o.innerHTML=A(),q())}function q(){if(!o)return;l?.cleanup(),l=v("meta-marketplace");const e=o.querySelector("#meta-mkt-search"),r=o.querySelector("#meta-mkt-search-btn");e&&l.bind(e,"keydown",t=>{t.key==="Enter"&&f(e.value,a.category)}),r&&l.bind(r,"click",()=>{const t=e?.value??"";f(t,a.category)}),o.querySelectorAll("[data-meta-mkt-cat]").forEach(t=>{l.bind(t,"click",()=>{const s=t.dataset.metaMktCat??"",n=s||null;a.query?f(a.query,n):(a.category=n,u())})}),o.querySelectorAll("[data-meta-mkt-install]").forEach(t=>{l.bind(t,"click",async()=>{const s=t.dataset.metaMktInstall??"",[n,...g]=s.split("|"),m=g.join("|");if(!(!n||!m)){t.disabled=!0,t.textContent="...";try{const d=await c.install(n,m);d.ok?(t.textContent="✅ Installé",t.style.background="rgba(34,204,119,.25)",d.instructions&&p.info("meta-marketplace-feature",`Install ${n}/${m}: ${d.instructions}`)):(t.textContent="❌ Échec",t.style.background="rgba(255,91,91,.25)",d.requires_api_key&&p.warn("meta-marketplace-feature",`Clé API manquante: ${d.requires_api_key}`))}catch(d){t.textContent="❌ Erreur",p.warn("meta-marketplace-feature","install failed",d)}finally{setTimeout(()=>{t.disabled=!1,t.textContent="Installer",t.style.background="rgba(34,204,119,.1)"},3e3)}}})})}function C(e){return o=e,c.init(),u(),{unmount:()=>{o=null,e.innerHTML=""}}}function T(e){C(e)}function H(){a.category=null,a.query="",a.loading=!1,a.results=[],o=null}export{L as dispose,C as mountMetaMarketplace,T as render,H as resetMetaMarketplaceFeature};
