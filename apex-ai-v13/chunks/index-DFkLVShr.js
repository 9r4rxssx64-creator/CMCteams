const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-DE8tOht_.js","./multi-source-analyze-y_3vQuz1.js","./credential-patterns-DUMYZEMu.js","./apex-kb-BHH7h7Vp.js"])))=>i.map(i=>d[i]);
import{b as v,_ as y,l as u,e as l}from"./monitoring-DE8tOht_.js";import{c as $}from"./listener-cleanup-Y2rGGxxX.js";import{capabilities as h}from"./capabilities-E8XLcn0p.js";import{haptic as g}from"./haptic-CQFg2PXZ.js";import{toast as T}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-y_3vQuz1.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-BHH7h7Vp.js";let n=null;function M(){n?.cleanup(),n=null}function _(e,t){return e.filter(o=>{if(t.query){const r=t.query.toLowerCase();if(!(o.name.toLowerCase().includes(r)||o.description.toLowerCase().includes(r)))return!1}return!(t.tier&&t.tier!=="all"&&o.minTier!==t.tier||t.impactLevel&&t.impactLevel!=="all"&&o.impactLevel!==t.impactLevel)})}function A(e){const t={total:e.length,by_tier:{},by_impact:{}};for(const o of e)t.by_tier[o.minTier]=(t.by_tier[o.minTier]??0)+1,t.by_impact[o.impactLevel]=(t.by_impact[o.impactLevel]??0)+1;return t}const x={admin:{color:"#c9a227",label:"Admin"},laurence:{color:"#ff6b9d",label:"Laurence"},family:{color:"#a878ff",label:"Famille"},client_pro:{color:"#5aa8ff",label:"Pro"},client_free:{color:"#22cc77",label:"Free"}},L={A:{color:"#22cc77",label:"Auto",icon:"✅"},B:{color:"#ffaa00",label:"Notify",icon:"⚠️"},C:{color:"#ff5858",label:"Validate",icon:"🚨"}};let i={tier:"all",impactLevel:"all"},p="tools";function w(e){const t=x[e.minTier],o=L[e.impactLevel],r=e.inputSchema.properties??{},a=Object.keys(r).length;return`
    <li class="ax-tool-row" data-tool-name="${l(e.name)}"
      style="background:rgba(20,20,35,0.5);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:12px;margin-bottom:8px;border-left:3px solid ${l(t.color)}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
        <div class="ax-gs-11">
          <div class="ax-gs-122">
            <code style="color:#fff;font-weight:700;font-size:13px;background:rgba(0,0,0,.3);padding:2px 8px;border-radius:4px">${l(e.name)}</code>
            <span style="background:rgba(${e.minTier==="admin"?"201,162,39":e.minTier==="family"?"168,120,255":"90,168,255"},.15);color:${l(t.color)};font-size:10px;padding:2px 6px;border-radius:4px">${l(t.label)}</span>
            <span style="background:rgba(${e.impactLevel==="A"?"34,204,119":e.impactLevel==="B"?"255,170,0":"255,88,88"},.15);color:${l(o.color)};font-size:10px;padding:2px 6px;border-radius:4px">${o.icon} ${l(o.label)}</span>
            <span style="color:#888;font-size:10px">${a} param${a>1?"s":""}</span>
          </div>
          <p style="margin:0;color:#a0a4c0;font-size:12px;line-height:1.4">${l(e.description)}</p>
        </div>
        <button class="ax-btn ax-btn-sm" data-tool-test="${l(e.name)}" style="font-size:11px">🧪 Tester</button>
      </div>
    </li>`}function C(e){const t=e.enabled?"#22cc77":"#666",o=e.enabled?"✅":"⚪",r=e.enabled?"enabled":"disabled",a=e.examples.length>0?`<div style="margin-top:4px;color:#888;font-size:10px;font-style:italic">${l(e.examples[0]??"")}</div>`:"";return`
    <li style="background:rgba(20,20,35,0.5);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:10px;margin-bottom:6px;border-left:3px solid ${t}">
      <div class="ax-gs-204">
        <div class="ax-gs-6">
          <strong style="color:#fff;font-size:13px">${o} ${l(e.emoji)} ${l(e.label)}</strong>
          <p style="margin:2px 0 0;color:#a0a4c0;font-size:11px">${l(e.description)}</p>
          ${a}
        </div>
        <span style="background:rgba(255,255,255,.05);color:${t};font-size:10px;padding:3px 8px;border-radius:4px;text-transform:uppercase">${r}</span>
      </div>
    </li>`}async function d(e){n?.cleanup(),n=$("apex-toolbox");const o=v.get("user")?.tier??"admin";let r=[];try{const{apexTools:b}=await y(async()=>{const{apexTools:m}=await import("./apex-tools-misc-C0BUnpd1.js").then(f=>f.b);return{apexTools:m}},__vite__mapDeps([0,1,2,3]),import.meta.url);r=b.list()}catch(b){u.warn("feature-apex-toolbox","apex-tools load failed",{err:b})}const a=_(r,i),s=A(r),c=h.list();e.innerHTML=`
    <div class="ax-page ax-gs-268">
      <header class="ax-gs-181">
        <h1 class="ax-gs-324">🧰 Apex Toolbox</h1>
        <p class="ax-gs-325">
          ${s.total} tools IA disponibles · ${c.length} capabilities device · Tier user : <strong style="color:${l(x[o].color)}">${l(x[o].label)}</strong>
        </p>
      </header>

      <nav style="margin-bottom:16px;display:flex;gap:8px">
        <button class="ax-tab ${p==="tools"?"ax-tab-active":""}" data-tb-tab="tools"
          style="background:${p==="tools"?"rgba(201,162,39,.15)":"transparent"};color:${p==="tools"?"#c9a227":"#a0a4c0"};border:1px solid rgba(201,162,39,.3);padding:8px 16px;border-radius:8px;font-size:13px;cursor:pointer">
          🛠 Tools (${s.total})
        </button>
        <button class="ax-tab ${p==="capabilities"?"ax-tab-active":""}" data-tb-tab="capabilities"
          style="background:${p==="capabilities"?"rgba(201,162,39,.15)":"transparent"};color:${p==="capabilities"?"#c9a227":"#a0a4c0"};border:1px solid rgba(201,162,39,.3);padding:8px 16px;border-radius:8px;font-size:13px;cursor:pointer">
          📱 Capabilities (${c.length})
        </button>
      </nav>

      ${p==="tools"?`
        <section style="margin-bottom:16px;background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:14px">
          <h3 class="ax-gs-326">📊 Stats</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;font-size:12px">
            <div><strong class="ax-gs-327">Total</strong> : ${s.total}</div>
            <div><strong class="ax-gs-266">Admin</strong> : ${s.by_tier.admin??0}</div>
            <div><strong style="color:#5aa8ff">Pro</strong> : ${s.by_tier.client_pro??0}</div>
            <div><strong class="ax-gs-279">Auto (A)</strong> : ${s.by_impact.A??0}</div>
            <div><strong class="ax-gs-328">Notify (B)</strong> : ${s.by_impact.B??0}</div>
            <div><strong class="ax-gs-329">Validate (C)</strong> : ${s.by_impact.C??0}</div>
          </div>
        </section>

        <section style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <input id="ax-tb-search" type="text" aria-label="Rechercher un outil" placeholder="🔍 Rechercher tool..." value="${l(i.query??"")}"
            style="flex:1;min-width:200px;background:rgba(0,0,0,.3);color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px 12px;font-size:13px">
          <select id="ax-tb-tier" class="ax-gs-330">
            <option value="all" ${i.tier==="all"?"selected":""}>Tous tiers</option>
            <option value="admin" ${i.tier==="admin"?"selected":""}>Admin</option>
            <option value="laurence" ${i.tier==="laurence"?"selected":""}>Laurence</option>
            <option value="family" ${i.tier==="family"?"selected":""}>Famille</option>
            <option value="client_pro" ${i.tier==="client_pro"?"selected":""}>Pro</option>
            <option value="client_free" ${i.tier==="client_free"?"selected":""}>Free</option>
          </select>
          <select id="ax-tb-impact" class="ax-gs-330">
            <option value="all" ${i.impactLevel==="all"?"selected":""}>Tous impacts</option>
            <option value="A" ${i.impactLevel==="A"?"selected":""}>A (auto)</option>
            <option value="B" ${i.impactLevel==="B"?"selected":""}>B (notify)</option>
            <option value="C" ${i.impactLevel==="C"?"selected":""}>C (validate)</option>
          </select>
        </section>

        <section class="ax-gs-180">
          <ul class="ax-gs-286">
            ${a.length>0?a.map(w).join(""):'<li class="ax-gs-209">Aucun tool pour ces filtres.</li>'}
          </ul>
        </section>
      `:`
        <section class="ax-gs-180">
          <h3 class="ax-gs-326">📱 Capabilities device</h3>
          <p style="color:#a0a4c0;font-size:12px;margin:0 0 12px">Matrice des capacités matérielles + permissions accordées par l'utilisateur.</p>
          <ul class="ax-gs-286">
            ${c.length>0?c.map(C).join(""):'<li class="ax-gs-209">Aucune capability détectée.</li>'}
          </ul>
        </section>
      `}

      <p class="ax-gs-331">🧰 Toolbox v13 · ${s.total} tools registered</p>
    </div>
  `,z(e),u.info("feature-apex-toolbox",`rendered (tab=${p}, ${a.length}/${s.total} tools, ${c.length} caps)`)}function z(e){e.querySelectorAll("[data-tb-tab]").forEach(a=>{n.bind(a,"click",()=>{g.selection(),p=a.dataset.tbTab??"tools",d(e)})});const t=e.querySelector("#ax-tb-search");if(t){let a=null;n.bind(t,"input",()=>{a&&clearTimeout(a),a=setTimeout(()=>{i={...i,query:t.value},d(e)},250)})}const o=e.querySelector("#ax-tb-tier");o&&n&&n.bind(o,"change",a=>{const c=a.target.value;i={...i,tier:c},d(e)});const r=e.querySelector("#ax-tb-impact");r&&n&&n.bind(r,"change",a=>{const c=a.target.value;i={...i,impactLevel:c},d(e)}),e.querySelectorAll("[data-tool-test]").forEach(a=>{n.bind(a,"click",()=>{g.tap();const s=a.dataset.toolTest??"";T.info(`Tester ${s} : modal à implémenter (Jet 5)`)})})}export{A as computeStats,M as dispose,l as escapeHtml,_ as filterTools,d as render};
