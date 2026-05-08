import{_ as y}from"./apex-kb-0vuBuWYy.js";import{l as m}from"./monitoring-BAiQJoxJ.js";import{c as v}from"./listener-cleanup-Y2rGGxxX.js";import{s as $}from"../core/main-BRJyZFXI.js";import{capabilities as h}from"./capabilities-BWljz8Sw.js";import{h as u}from"./haptic-BUEqXK0N.js";import{toast as T}from"./toast-Dgg9rcIP.js";import"./apex-tools-registry-DFaDwWZQ.js";import"./credential-patterns-Dy6Wjk7e.js";import"./multi-source-analyze-DzTKkB_U.js";let s=null;function I(){s?.cleanup(),s=null}function l(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}function _(e,t){return e.filter(a=>{if(t.query){const n=t.query.toLowerCase();if(!(a.name.toLowerCase().includes(n)||a.description.toLowerCase().includes(n)))return!1}return!(t.tier&&t.tier!=="all"&&a.minTier!==t.tier||t.impactLevel&&t.impactLevel!=="all"&&a.impactLevel!==t.impactLevel)})}function w(e){const t={total:e.length,by_tier:{},by_impact:{}};for(const a of e)t.by_tier[a.minTier]=(t.by_tier[a.minTier]??0)+1,t.by_impact[a.impactLevel]=(t.by_impact[a.impactLevel]??0)+1;return t}const x={admin:{color:"#c9a227",label:"Admin"},laurence:{color:"#ff6b9d",label:"Laurence"},family:{color:"#a878ff",label:"Famille"},client_pro:{color:"#5aa8ff",label:"Pro"},client_free:{color:"#22cc77",label:"Free"}},z={A:{color:"#22cc77",label:"Auto",icon:"✅"},B:{color:"#ffaa00",label:"Notify",icon:"⚠️"},C:{color:"#ff5858",label:"Validate",icon:"🚨"}};let i={tier:"all",impactLevel:"all"},c="tools";function A(e){const t=x[e.minTier],a=z[e.impactLevel],n=e.inputSchema.properties??{},o=Object.keys(n).length;return`
    <li class="ax-tool-row" data-tool-name="${l(e.name)}"
      style="background:rgba(20,20,35,0.5);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:12px;margin-bottom:8px;border-left:3px solid ${l(t.color)}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
        <div style="flex:1;min-width:200px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
            <code style="color:#fff;font-weight:700;font-size:13px;background:rgba(0,0,0,.3);padding:2px 8px;border-radius:4px">${l(e.name)}</code>
            <span style="background:rgba(${e.minTier==="admin"?"201,162,39":e.minTier==="family"?"168,120,255":"90,168,255"},.15);color:${l(t.color)};font-size:10px;padding:2px 6px;border-radius:4px">${l(t.label)}</span>
            <span style="background:rgba(${e.impactLevel==="A"?"34,204,119":e.impactLevel==="B"?"255,170,0":"255,88,88"},.15);color:${l(a.color)};font-size:10px;padding:2px 6px;border-radius:4px">${a.icon} ${l(a.label)}</span>
            <span style="color:#888;font-size:10px">${o} param${o>1?"s":""}</span>
          </div>
          <p style="margin:0;color:#a0a4c0;font-size:12px;line-height:1.4">${l(e.description)}</p>
        </div>
        <button class="ax-btn ax-btn-sm" data-tool-test="${l(e.name)}" style="font-size:11px">🧪 Tester</button>
      </div>
    </li>`}function L(e){const t=e.enabled?"#22cc77":"#666",a=e.enabled?"✅":"⚪",n=e.enabled?"enabled":"disabled",o=e.examples.length>0?`<div style="margin-top:4px;color:#888;font-size:10px;font-style:italic">${l(e.examples[0]??"")}</div>`:"";return`
    <li style="background:rgba(20,20,35,0.5);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:10px;margin-bottom:6px;border-left:3px solid ${t}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <div style="flex:1;min-width:0">
          <strong style="color:#fff;font-size:13px">${a} ${l(e.emoji)} ${l(e.label)}</strong>
          <p style="margin:2px 0 0;color:#a0a4c0;font-size:11px">${l(e.description)}</p>
          ${o}
        </div>
        <span style="background:rgba(255,255,255,.05);color:${t};font-size:10px;padding:3px 8px;border-radius:4px;text-transform:uppercase">${n}</span>
      </div>
    </li>`}async function d(e){s?.cleanup(),s=v("apex-toolbox");const a=$.get("user")?.tier??"admin";let n=[];try{const{apexTools:b}=await y(async()=>{const{apexTools:g}=await import("./apex-tools-registry-DFaDwWZQ.js").then(f=>f.d);return{apexTools:g}},[],import.meta.url);n=b.list()}catch(b){m.warn("feature-apex-toolbox","apex-tools load failed",{err:b})}const o=_(n,i),r=w(n),p=h.list();e.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:1100px;margin:0 auto">
      <header style="margin-bottom:20px">
        <h1 style="margin:0 0 4px;color:#c9a227;font-size:28px">🧰 Apex Toolbox</h1>
        <p style="color:#a0a4c0;margin:0;font-size:13px">
          ${r.total} tools IA disponibles · ${p.length} capabilities device · Tier user : <strong style="color:${l(x[a].color)}">${l(x[a].label)}</strong>
        </p>
      </header>

      <nav style="margin-bottom:16px;display:flex;gap:8px">
        <button class="ax-tab ${c==="tools"?"ax-tab-active":""}" data-tb-tab="tools"
          style="background:${c==="tools"?"rgba(201,162,39,.15)":"transparent"};color:${c==="tools"?"#c9a227":"#a0a4c0"};border:1px solid rgba(201,162,39,.3);padding:8px 16px;border-radius:8px;font-size:13px;cursor:pointer">
          🛠 Tools (${r.total})
        </button>
        <button class="ax-tab ${c==="capabilities"?"ax-tab-active":""}" data-tb-tab="capabilities"
          style="background:${c==="capabilities"?"rgba(201,162,39,.15)":"transparent"};color:${c==="capabilities"?"#c9a227":"#a0a4c0"};border:1px solid rgba(201,162,39,.3);padding:8px 16px;border-radius:8px;font-size:13px;cursor:pointer">
          📱 Capabilities (${p.length})
        </button>
      </nav>

      ${c==="tools"?`
        <section style="margin-bottom:16px;background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:14px">
          <h3 style="margin:0 0 10px;color:#c9a227;font-size:13px;text-transform:uppercase">📊 Stats</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;font-size:12px">
            <div><strong style="color:#fff">Total</strong> : ${r.total}</div>
            <div><strong style="color:#c9a227">Admin</strong> : ${r.by_tier.admin??0}</div>
            <div><strong style="color:#5aa8ff">Pro</strong> : ${r.by_tier.client_pro??0}</div>
            <div><strong style="color:#22cc77">Auto (A)</strong> : ${r.by_impact.A??0}</div>
            <div><strong style="color:#ffaa00">Notify (B)</strong> : ${r.by_impact.B??0}</div>
            <div><strong style="color:#ff5858">Validate (C)</strong> : ${r.by_impact.C??0}</div>
          </div>
        </section>

        <section style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <input id="ax-tb-search" type="text" placeholder="🔍 Rechercher tool..." value="${l(i.query??"")}"
            style="flex:1;min-width:200px;background:rgba(0,0,0,.3);color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px 12px;font-size:13px">
          <select id="ax-tb-tier" style="background:rgba(0,0,0,.3);color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px;font-size:12px">
            <option value="all" ${i.tier==="all"?"selected":""}>Tous tiers</option>
            <option value="admin" ${i.tier==="admin"?"selected":""}>Admin</option>
            <option value="laurence" ${i.tier==="laurence"?"selected":""}>Laurence</option>
            <option value="family" ${i.tier==="family"?"selected":""}>Famille</option>
            <option value="client_pro" ${i.tier==="client_pro"?"selected":""}>Pro</option>
            <option value="client_free" ${i.tier==="client_free"?"selected":""}>Free</option>
          </select>
          <select id="ax-tb-impact" style="background:rgba(0,0,0,.3);color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px;font-size:12px">
            <option value="all" ${i.impactLevel==="all"?"selected":""}>Tous impacts</option>
            <option value="A" ${i.impactLevel==="A"?"selected":""}>A (auto)</option>
            <option value="B" ${i.impactLevel==="B"?"selected":""}>B (notify)</option>
            <option value="C" ${i.impactLevel==="C"?"selected":""}>C (validate)</option>
          </select>
        </section>

        <section style="margin-bottom:24px">
          <ul style="list-style:none;padding:0;margin:0">
            ${o.length>0?o.map(A).join(""):'<li style="text-align:center;padding:30px;color:#888">Aucun tool pour ces filtres.</li>'}
          </ul>
        </section>
      `:`
        <section style="margin-bottom:24px">
          <h3 style="margin:0 0 10px;color:#c9a227;font-size:13px;text-transform:uppercase">📱 Capabilities device</h3>
          <p style="color:#a0a4c0;font-size:12px;margin:0 0 12px">Matrice des capacités matérielles + permissions accordées par l'utilisateur.</p>
          <ul style="list-style:none;padding:0;margin:0">
            ${p.length>0?p.map(L).join(""):'<li style="text-align:center;padding:30px;color:#888">Aucune capability détectée.</li>'}
          </ul>
        </section>
      `}

      <p style="text-align:center;color:#666;font-size:11px">🧰 Toolbox v13 · ${r.total} tools registered</p>
    </div>
  `,C(e),m.info("feature-apex-toolbox",`rendered (tab=${c}, ${o.length}/${r.total} tools, ${p.length} caps)`)}function C(e){e.querySelectorAll("[data-tb-tab]").forEach(o=>{s.bind(o,"click",()=>{u.selection(),c=o.dataset.tbTab??"tools",d(e)})});const t=e.querySelector("#ax-tb-search");if(t){let o=null;s.bind(t,"input",()=>{o&&clearTimeout(o),o=setTimeout(()=>{i={...i,query:t.value},d(e)},250)})}const a=e.querySelector("#ax-tb-tier");a&&s&&s.bind(a,"change",o=>{const p=o.target.value;i={...i,tier:p},d(e)});const n=e.querySelector("#ax-tb-impact");n&&s&&s.bind(n,"change",o=>{const p=o.target.value;i={...i,impactLevel:p},d(e)}),e.querySelectorAll("[data-tool-test]").forEach(o=>{s.bind(o,"click",()=>{u.tap();const r=o.dataset.toolTest??"";T.info(`Tester ${r} : modal à implémenter (Jet 5)`)})})}export{w as computeStats,I as dispose,l as escapeHtml,_ as filterTools,d as render};
