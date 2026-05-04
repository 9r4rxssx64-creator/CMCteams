const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-tools-DGjF3q-Z.js","../core/main-DTTu8ZLV.js","../assets/css/main-rhfGvOFL.css","./audit-log-CAd7qOch.js"])))=>i.map(i=>d[i]);
import{s as u,_ as f,l as b}from"../core/main-DTTu8ZLV.js";import{capabilities as y}from"./capabilities-jEfTaW8k.js";import{h as m}from"./haptic-BUEqXK0N.js";import{toast as v}from"./toast-Dgg9rcIP.js";import"./apex-tools-DGjF3q-Z.js";import"./audit-log-CAd7qOch.js";function i(e){return e.replace(/[&<>"']/g,o=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[o]??o)}function $(e,o){return e.filter(t=>{if(o.query){const r=o.query.toLowerCase();if(!(t.name.toLowerCase().includes(r)||t.description.toLowerCase().includes(r)))return!1}return!(o.tier&&o.tier!=="all"&&t.minTier!==o.tier||o.impactLevel&&o.impactLevel!=="all"&&t.impactLevel!==o.impactLevel)})}function h(e){const o={total:e.length,by_tier:{},by_impact:{}};for(const t of e)o.by_tier[t.minTier]=(o.by_tier[t.minTier]??0)+1,o.by_impact[t.impactLevel]=(o.by_impact[t.impactLevel]??0)+1;return o}const x={admin:{color:"#c9a227",label:"Admin"},laurence:{color:"#ff6b9d",label:"Laurence"},family:{color:"#a878ff",label:"Famille"},client_pro:{color:"#5aa8ff",label:"Pro"},client_free:{color:"#22cc77",label:"Free"}},T={A:{color:"#22cc77",label:"Auto",icon:"✅"},B:{color:"#ffaa00",label:"Notify",icon:"⚠️"},C:{color:"#ff5858",label:"Validate",icon:"🚨"}};let a={tier:"all",impactLevel:"all"},s="tools";function _(e){const o=x[e.minTier],t=T[e.impactLevel],r=e.inputSchema.properties??{},l=Object.keys(r).length;return`
    <li class="ax-tool-row" data-tool-name="${i(e.name)}"
      style="background:rgba(20,20,35,0.5);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:12px;margin-bottom:8px;border-left:3px solid ${i(o.color)}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
        <div style="flex:1;min-width:200px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
            <code style="color:#fff;font-weight:700;font-size:13px;background:rgba(0,0,0,.3);padding:2px 8px;border-radius:4px">${i(e.name)}</code>
            <span style="background:rgba(${e.minTier==="admin"?"201,162,39":e.minTier==="family"?"168,120,255":"90,168,255"},.15);color:${i(o.color)};font-size:10px;padding:2px 6px;border-radius:4px">${i(o.label)}</span>
            <span style="background:rgba(${e.impactLevel==="A"?"34,204,119":e.impactLevel==="B"?"255,170,0":"255,88,88"},.15);color:${i(t.color)};font-size:10px;padding:2px 6px;border-radius:4px">${t.icon} ${i(t.label)}</span>
            <span style="color:#888;font-size:10px">${l} param${l>1?"s":""}</span>
          </div>
          <p style="margin:0;color:#a0a4c0;font-size:12px;line-height:1.4">${i(e.description)}</p>
        </div>
        <button class="ax-btn ax-btn-sm" data-tool-test="${i(e.name)}" style="font-size:11px">🧪 Tester</button>
      </div>
    </li>`}function L(e){const o=e.enabled?"#22cc77":"#666",t=e.enabled?"✅":"⚪",r=e.enabled?"enabled":"disabled",l=e.examples.length>0?`<div style="margin-top:4px;color:#888;font-size:10px;font-style:italic">${i(e.examples[0]??"")}</div>`:"";return`
    <li style="background:rgba(20,20,35,0.5);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:10px;margin-bottom:6px;border-left:3px solid ${o}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <div style="flex:1;min-width:0">
          <strong style="color:#fff;font-size:13px">${t} ${i(e.emoji)} ${i(e.label)}</strong>
          <p style="margin:2px 0 0;color:#a0a4c0;font-size:11px">${i(e.description)}</p>
          ${l}
        </div>
        <span style="background:rgba(255,255,255,.05);color:${o};font-size:10px;padding:3px 8px;border-radius:4px;text-transform:uppercase">${r}</span>
      </div>
    </li>`}async function c(e){const t=u.get("user")?.tier??"admin";let r=[];try{const{apexTools:d}=await f(async()=>{const{apexTools:g}=await import("./apex-tools-DGjF3q-Z.js");return{apexTools:g}},__vite__mapDeps([0,1,2,3]),import.meta.url);r=d.list()}catch(d){b.warn("feature-apex-toolbox","apex-tools load failed",{err:d})}const l=$(r,a),n=h(r),p=y.list();e.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:1100px;margin:0 auto">
      <header style="margin-bottom:20px">
        <h1 style="margin:0 0 4px;color:#c9a227;font-size:28px">🧰 Apex Toolbox</h1>
        <p style="color:#a0a4c0;margin:0;font-size:13px">
          ${n.total} tools IA disponibles · ${p.length} capabilities device · Tier user : <strong style="color:${i(x[t].color)}">${i(x[t].label)}</strong>
        </p>
      </header>

      <nav style="margin-bottom:16px;display:flex;gap:8px">
        <button class="ax-tab ${s==="tools"?"ax-tab-active":""}" data-tb-tab="tools"
          style="background:${s==="tools"?"rgba(201,162,39,.15)":"transparent"};color:${s==="tools"?"#c9a227":"#a0a4c0"};border:1px solid rgba(201,162,39,.3);padding:8px 16px;border-radius:8px;font-size:13px;cursor:pointer">
          🛠 Tools (${n.total})
        </button>
        <button class="ax-tab ${s==="capabilities"?"ax-tab-active":""}" data-tb-tab="capabilities"
          style="background:${s==="capabilities"?"rgba(201,162,39,.15)":"transparent"};color:${s==="capabilities"?"#c9a227":"#a0a4c0"};border:1px solid rgba(201,162,39,.3);padding:8px 16px;border-radius:8px;font-size:13px;cursor:pointer">
          📱 Capabilities (${p.length})
        </button>
      </nav>

      ${s==="tools"?`
        <section style="margin-bottom:16px;background:rgba(20,20,35,0.6);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:14px">
          <h3 style="margin:0 0 10px;color:#c9a227;font-size:13px;text-transform:uppercase">📊 Stats</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;font-size:12px">
            <div><strong style="color:#fff">Total</strong> : ${n.total}</div>
            <div><strong style="color:#c9a227">Admin</strong> : ${n.by_tier.admin??0}</div>
            <div><strong style="color:#5aa8ff">Pro</strong> : ${n.by_tier.client_pro??0}</div>
            <div><strong style="color:#22cc77">Auto (A)</strong> : ${n.by_impact.A??0}</div>
            <div><strong style="color:#ffaa00">Notify (B)</strong> : ${n.by_impact.B??0}</div>
            <div><strong style="color:#ff5858">Validate (C)</strong> : ${n.by_impact.C??0}</div>
          </div>
        </section>

        <section style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <input id="ax-tb-search" type="text" placeholder="🔍 Rechercher tool..." value="${i(a.query??"")}"
            style="flex:1;min-width:200px;background:rgba(0,0,0,.3);color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px 12px;font-size:13px">
          <select id="ax-tb-tier" style="background:rgba(0,0,0,.3);color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px;font-size:12px">
            <option value="all" ${a.tier==="all"?"selected":""}>Tous tiers</option>
            <option value="admin" ${a.tier==="admin"?"selected":""}>Admin</option>
            <option value="laurence" ${a.tier==="laurence"?"selected":""}>Laurence</option>
            <option value="family" ${a.tier==="family"?"selected":""}>Famille</option>
            <option value="client_pro" ${a.tier==="client_pro"?"selected":""}>Pro</option>
            <option value="client_free" ${a.tier==="client_free"?"selected":""}>Free</option>
          </select>
          <select id="ax-tb-impact" style="background:rgba(0,0,0,.3);color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px;font-size:12px">
            <option value="all" ${a.impactLevel==="all"?"selected":""}>Tous impacts</option>
            <option value="A" ${a.impactLevel==="A"?"selected":""}>A (auto)</option>
            <option value="B" ${a.impactLevel==="B"?"selected":""}>B (notify)</option>
            <option value="C" ${a.impactLevel==="C"?"selected":""}>C (validate)</option>
          </select>
        </section>

        <section style="margin-bottom:24px">
          <ul style="list-style:none;padding:0;margin:0">
            ${l.length>0?l.map(_).join(""):'<li style="text-align:center;padding:30px;color:#888">Aucun tool pour ces filtres.</li>'}
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

      <p style="text-align:center;color:#666;font-size:11px">🧰 Toolbox v13 · ${n.total} tools registered</p>
    </div>
  `,w(e),b.info("feature-apex-toolbox",`rendered (tab=${s}, ${l.length}/${n.total} tools, ${p.length} caps)`)}function w(e){e.querySelectorAll("[data-tb-tab]").forEach(t=>{t.addEventListener("click",()=>{m.selection(),s=t.dataset.tbTab??"tools",c(e)})});const o=e.querySelector("#ax-tb-search");if(o){let t=null;o.addEventListener("input",()=>{t&&clearTimeout(t),t=setTimeout(()=>{a={...a,query:o.value},c(e)},250)})}e.querySelector("#ax-tb-tier")?.addEventListener("change",t=>{const l=t.target.value;a={...a,tier:l},c(e)}),e.querySelector("#ax-tb-impact")?.addEventListener("change",t=>{const l=t.target.value;a={...a,impactLevel:l},c(e)}),e.querySelectorAll("[data-tool-test]").forEach(t=>{t.addEventListener("click",()=>{m.tap();const r=t.dataset.toolTest??"";v.info(`Tester ${r} : modal à implémenter (Jet 5)`)})})}export{h as computeStats,i as escapeHtml,$ as filterTools,c as render};
//# sourceMappingURL=index-w5anM6nl.js.map
