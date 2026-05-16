import{l as m}from"./monitoring-3uBGKGRH.js";import{s as x}from"../core/main-lGQlSbid.js";import"./apex-kb-ciEeY8Py.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-CMDJ5gOJ.js";function n(o){return o>=1e3?`${(o/1e3).toFixed(1)}k`:String(o)}function s(o){let i=0;for(let r=0;r<localStorage.length;r++){const t=localStorage.key(r);t&&t.startsWith(o)&&i++}return i}function a(o,i){try{const r=localStorage.getItem(o);if(!r)return 0;const t=JSON.parse(r);return i==="array"&&Array.isArray(t)?t.length:i==="object"&&t&&typeof t=="object"?Object.keys(t).length:Array.isArray(t)?t.length:1}catch{return 0}}function f(){const o=s("ax_")-s("ax_credentials_deleted")-s("ax_persistent_memory")-s("ax_lessons")-s("ax_links_"),i=(()=>{try{const c=localStorage.getItem("apex_v13_multi_keys");if(!c)return 0;const b=JSON.parse(c);return Object.keys(b).length}catch{return 0}})(),r=a("ax_links_registry","object"),t=s("apex_v13_skill_"),p=a("apex_v13_mcp_servers","array"),e=a("apex_v13_persistent_memory","array")+a("apex_v13_facts","array"),l=a("apex_v13_lessons","array")+a("ax_lessons_learned_struct","array"),d=a("apex_v13_code_snippets_index","array"),g=a("apex_v13_conversation_active","array"),u=(()=>{try{const c=localStorage.getItem("apex_v13_economy_mode");return c?JSON.parse(c).active===!0:!1}catch{return!1}})(),h=a("apex_v13_audit","array");return[{emoji:"🔑",title:"Coffre clés API",count:n(Math.max(o,i)),hint:"Chiffrées AES-GCM-256 + triple persistence",route:"vault",color:"#c9a227"},{emoji:"🔗",title:"Liens auto",count:n(r),hint:"Dashboards, billing, docs détectés",route:"admin",color:"#3b82f6"},{emoji:"🎯",title:"Skills 2026",count:n(t),hint:"20 skills auto-syncés (docx/pptx/xlsx/pdf/video/MCP)",route:"skills-2026",color:"#8b5cf6"},{emoji:"🔌",title:"MCP Servers",count:n(p),hint:"BOFiP, Almanac, Legal Hunter — search 18M+ docs",route:"mcp-servers",color:"#06b6d4"},{emoji:"🧠",title:"Mémoire facts",count:n(e),hint:"Cross-session — Apex n'oublie JAMAIS",route:"admin",color:"#ec4899"},{emoji:"📚",title:"Leçons apprises",count:n(l),hint:"Cross-app Apex ↔ CMCteams",route:"admin",color:"#f59e0b"},{emoji:"💻",title:"Code snippets",count:n(d),hint:"Tape /snippets dans chat",route:"chat",color:"#10b981"},{emoji:"💬",title:"Conversation",count:n(g),hint:"Messages persistés (Firebase backup)",route:"chat",color:"#6366f1"},{emoji:"🧪",title:"Runtime Tests",count:"17",hint:"Lancer TOUS les tests réels (≈30s)",route:"runtime-tests",color:"#3b82f6"},{emoji:u?"🔋":"⚡",title:"Mode économie",count:u?"ON":"OFF",hint:u?"Haiku + tokens÷2":"Modèles premium activés",route:"settings",color:u?"#10b981":"#94a3b8"},{emoji:"📊",title:"Audit log",count:n(h),hint:"Trail immutable actions Apex",route:"admin",color:"#64748b"},{emoji:"🚨",title:"Alertes auto",count:"3",hint:"P0 INP + CSP + Vault backup (Apex IA)",route:"admin",color:"#ef4444"}]}function C(o){const i=x.get("user"),r=x.get("isAdmin"),t=i?.name??"invité",p=f();o.innerHTML=`
    <div style="max-width:900px;margin:0 auto;padding:16px 12px;color:#f1f5f9">
      <div style="margin-bottom:16px">
        <h1 style="font-size:22px;margin:0 0 4px;font-weight:700;color:#f1f5f9">
          🗂 Dashboard ${t}
        </h1>
        <p style="color:#94a3b8;font-size:13px;margin:0">
          Vue centralisée — tout ce qu'Apex sait de toi en un coup d'œil. Tap une card pour drill-down.
        </p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px">
        ${p.map(e=>`
          <button
            type="button"
            data-route="${e.route}"
            style="
              background:#0f172a;
              border:1px solid ${e.color}33;
              border-radius:12px;
              padding:14px;
              text-align:left;
              cursor:pointer;
              color:#f1f5f9;
              min-height:100px;
              touch-action:manipulation;
              transition:transform 80ms,border-color 120ms;
            "
            onmouseover="this.style.borderColor='${e.color}'"
            onmouseout="this.style.borderColor='${e.color}33'"
          >
            <div style="font-size:24px;line-height:1">${e.emoji}</div>
            <div style="font-size:24px;font-weight:700;color:${e.color};margin-top:6px;line-height:1">${e.count}</div>
            <div style="font-size:13px;font-weight:600;margin-top:6px;color:#e2e8f0">${e.title}</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px;line-height:1.3">${e.hint}</div>
          </button>
        `).join("")}
      </div>

      ${r?`
        <div style="margin-top:20px;padding:14px;background:#0f172a;border:1px solid #c9a22733;border-radius:12px">
          <h2 style="font-size:14px;margin:0 0 8px;color:#c9a227">⚙️ Admin actions rapides</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button data-route="admin-all-secrets" type="button" style="background:#1e293b;border:1px solid #c9a22755;color:#c9a227;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px;min-height:36px;touch-action:manipulation">🔐 All Secrets</button>
            <button data-route="credentials" type="button" style="background:#1e293b;border:1px solid #c9a22755;color:#c9a227;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px;min-height:36px;touch-action:manipulation">📦 Credentials</button>
            <button data-route="device" type="button" style="background:#1e293b;border:1px solid #c9a22755;color:#c9a227;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px;min-height:36px;touch-action:manipulation">📱 Devices</button>
            <button data-route="admin-health-dashboard" type="button" style="background:#1e293b;border:1px solid #c9a22755;color:#c9a227;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px;min-height:36px;touch-action:manipulation">💊 Health</button>
          </div>
        </div>
      `:""}

      <div style="margin-top:16px;padding:12px;background:#0a0e1a;border-radius:8px;font-size:11px;color:#64748b;line-height:1.5">
        💡 <strong>Persistance garantie</strong> : tout est triple-persisté
        (localStorage + IDB shadow + Firebase backup AES-GCM-256). Tu peux clear cache,
        réinstaller PWA, force-reset Apex — <strong>rien n'est perdu</strong>.
      </div>
    </div>
  `,o.querySelectorAll("[data-route]").forEach(e=>{e.addEventListener("click",()=>{const l=e.getAttribute("data-route");if(l)try{location.hash=`#${l}`}catch(d){m.warn("dashboard-personnel","navigation failed",{err:d,route:l})}})}),m.info("dashboard-personnel",`Rendered (${p.length} cards, user=${t}, admin=${r})`)}export{C as render};
