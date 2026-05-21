import{a as u,e as p}from"./escape-html-DGIYNPKb.js";import{C as x,q as f}from"./monitoring-C21_YuBN.js";import"./multi-source-analyze-BF2gxnOB.js";import"./apex-kb-BFpEt2rP.js";import"./credential-patterns-CLzI061R.js";function a(o){return o>=1e3?`${(o/1e3).toFixed(1)}k`:String(o)}function i(o){let s=0;for(let r=0;r<localStorage.length;r++){const t=localStorage.key(r);t&&t.startsWith(o)&&s++}return s}function n(o,s){try{const r=localStorage.getItem(o);if(!r)return 0;const t=JSON.parse(r);return s==="array"&&Array.isArray(t)?t.length:s==="object"&&t&&typeof t=="object"?Object.keys(t).length:Array.isArray(t)?t.length:1}catch{return 0}}function v(){const o=i("ax_")-i("ax_credentials_deleted")-i("ax_persistent_memory")-i("ax_lessons")-i("ax_links_"),s=(()=>{try{const c=localStorage.getItem("apex_v13_multi_keys");if(!c)return 0;const y=JSON.parse(c);return Object.keys(y).length}catch{return 0}})(),r=n("ax_links_registry","object"),t=i("apex_v13_skill_"),d=n("apex_v13_mcp_servers","array"),e=n("apex_v13_persistent_memory","array")+n("apex_v13_facts","array"),l=n("apex_v13_lessons","array")+n("ax_lessons_learned_struct","array"),g=n("apex_v13_code_snippets_index","array"),h=n("apex_v13_conversation_active","array"),m=(()=>{try{const c=localStorage.getItem("apex_v13_economy_mode");return c?JSON.parse(c).active===!0:!1}catch{return!1}})(),b=n("apex_v13_audit","array");return[{emoji:"🔑",title:"Coffre clés API",count:a(Math.max(o,s)),hint:"Chiffrées AES-GCM-256 + triple persistence",route:"vault",color:"#c9a227"},{emoji:"🔗",title:"Liens auto",count:a(r),hint:"Dashboards, billing, docs détectés",route:"admin",color:"#3b82f6"},{emoji:"🎯",title:"Skills 2026",count:a(t),hint:"20 skills auto-syncés (docx/pptx/xlsx/pdf/video/MCP)",route:"skills-2026",color:"#8b5cf6"},{emoji:"🔌",title:"MCP Servers",count:a(d),hint:"BOFiP, Almanac, Legal Hunter — search 18M+ docs",route:"mcp-servers",color:"#06b6d4"},{emoji:"🧠",title:"Mémoire facts",count:a(e),hint:"Cross-session — Apex n'oublie JAMAIS",route:"admin",color:"#ec4899"},{emoji:"📚",title:"Leçons apprises",count:a(l),hint:"Cross-app Apex ↔ CMCteams",route:"admin",color:"#f59e0b"},{emoji:"💻",title:"Code snippets",count:a(g),hint:"Tape /snippets dans chat",route:"chat",color:"#10b981"},{emoji:"💬",title:"Conversation",count:a(h),hint:"Messages persistés (Firebase backup)",route:"chat",color:"#6366f1"},{emoji:"🧪",title:"Runtime Tests",count:"17",hint:"Lancer TOUS les tests réels (≈30s)",route:"runtime-tests",color:"#3b82f6"},{emoji:m?"🔋":"⚡",title:"Mode économie",count:m?"ON":"OFF",hint:m?"Haiku + tokens÷2":"Modèles premium activés",route:"settings",color:m?"#10b981":"#94a3b8"},{emoji:"📊",title:"Audit log",count:a(b),hint:"Trail immutable actions Apex",route:"admin",color:"#64748b"},{emoji:"🚨",title:"Alertes auto",count:"3",hint:"P0 INP + CSP + Vault backup (Apex IA)",route:"admin",color:"#ef4444"}]}function j(o){const s=x.get("user"),r=x.get("isAdmin"),t=s?.name??"invité",d=v();o.innerHTML=`
    <div style="max-width:900px;margin:0 auto;padding:16px 12px;color:#f1f5f9">
      <div class="ax-gs-30">
        <h1 style="font-size:22px;margin:0 0 4px;font-weight:700;color:#f1f5f9">
          🗂 Dashboard ${u(t)}
        </h1>
        <p style="color:#94a3b8;font-size:13px;margin:0">
          Vue centralisée — tout ce qu'Apex sait de toi en un coup d'œil. Tap une card pour drill-down.
        </p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px">
        ${d.map(e=>`
          <button
            type="button"
            data-route="${p(e.route)}"
            style="
              background:#0f172a;
              border:1px solid ${p(e.color)}33;
              border-radius:12px;
              padding:14px;
              text-align:left;
              cursor:pointer;
              color:#f1f5f9;
              min-height:100px;
              touch-action:manipulation;
              transition:transform 80ms,border-color 120ms;
            "
            onmouseover="this.style.borderColor='${p(e.color)}'"
            onmouseout="this.style.borderColor='${p(e.color)}33'"
          >
            <div style="font-size:24px;line-height:1">${u(e.emoji)}</div>
            <div style="font-size:24px;font-weight:700;color:${p(e.color)};margin-top:6px;line-height:1">${u(String(e.count))}</div>
            <div style="font-size:13px;font-weight:600;margin-top:6px;color:#e2e8f0">${u(e.title)}</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px;line-height:1.3">${u(e.hint)}</div>
          </button>
        `).join("")}
      </div>

      ${r?`
        <div style="margin-top:20px;padding:14px;background:#0f172a;border:1px solid #c9a22733;border-radius:12px">
          <h2 style="font-size:14px;margin:0 0 8px;color:#c9a227">⚙️ Admin actions rapides</h2>
          <div class="ax-gs-7">
            <button data-route="admin-all-secrets" type="button" class="ax-gs-375">🔐 All Secrets</button>
            <button data-route="credentials" type="button" class="ax-gs-375">📦 Credentials</button>
            <button data-route="device" type="button" class="ax-gs-375">📱 Devices</button>
            <button data-route="admin-health-dashboard" type="button" class="ax-gs-375">💊 Health</button>
          </div>
        </div>
      `:""}

      <div style="margin-top:16px;padding:12px;background:#0a0e1a;border-radius:8px;font-size:11px;color:#64748b;line-height:1.5">
        💡 <strong>Persistance garantie</strong> : tout est triple-persisté
        (localStorage + IDB shadow + Firebase backup AES-GCM-256). Tu peux clear cache,
        réinstaller PWA, force-reset Apex — <strong>rien n'est perdu</strong>.
      </div>
    </div>
  `,o.querySelectorAll("[data-route]").forEach(e=>{e.addEventListener("click",()=>{const l=e.getAttribute("data-route");if(l)try{location.hash=`#${l}`}catch(g){f.warn("dashboard-personnel","navigation failed",{err:g,route:l})}})}),f.info("dashboard-personnel",`Rendered (${d.length} cards, user=${t}, admin=${r})`)}export{j as render};
