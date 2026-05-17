import{e as s}from"./escape-html-BlQj2yEF.js";import{l as m}from"./monitoring-3uBGKGRH.js";import{s as f}from"../core/main-D3ZvsLUN.js";import{p as x}from"./apex-tools-dispatch-skills-DLYz7zEZ.js";import{mcpRegistry as d}from"./mcp-registry-B27sZ7b8.js";import{skillsWatch as b}from"./skills-watch-D2lKfdhh.js";import{toast as o}from"./toast-CRdbcLoc.js";import"./apex-kb-BoJKlzXO.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-CD3qyri_.js";import"./haptic-CQFg2PXZ.js";function g(t){const l={alive:{color:"#10b981",emoji:"🟢"},dead:{color:"#ef4444",emoji:"🔴"},unknown:{color:"#94a3b8",emoji:"⚪"}},n=l[t]??l.unknown;return`<span style="color:${n.color};font-weight:600">${n.emoji} ${s(t)}</span>`}function c(t){if(!(f.get("isAdmin")===!0)){t.innerHTML='<div style="padding:24px;text-align:center;color:#94a3b8">🔒 Réservé admin Kevin</div>';return}d.init();const n=d.list(),p=b.getLastReport("mcp-health-watch"),u=n.map(e=>{const r=e.toolsExposed?.length??0,i=e.lastCheck?new Date(e.lastCheck).toLocaleString("fr-FR"):"jamais";return`
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:16px;margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
            <div>
              <div style="font-size:16px;font-weight:600;color:#f1f5f9">${s(e.name)}</div>
              <div style="font-size:12px;color:#94a3b8;margin-top:2px">${s(e.id)}</div>
            </div>
            ${g(e.status)}
          </div>
          <div style="font-size:12px;color:#cbd5e1;margin:8px 0;word-break:break-all">
            ${s(e.url)}
          </div>
          <div style="display:flex;gap:12px;font-size:12px;color:#94a3b8;flex-wrap:wrap;margin-bottom:12px">
            <span>🔧 ${r} tools</span>
            <span>⏱ ${s(i)}</span>
            ${e.errorCount>0?`<span style="color:#ef4444">❌ ${e.errorCount} erreurs</span>`:""}
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button
              data-mcp-test="${s(e.id)}"
              style="padding:8px 14px;background:#3b82f6;color:#fff;border:0;border-radius:8px;font-size:13px;cursor:pointer;min-height:36px">
              🧪 Tester
            </button>
            <button
              data-mcp-discover="${s(e.id)}"
              style="padding:8px 14px;background:#8b5cf6;color:#fff;border:0;border-radius:8px;font-size:13px;cursor:pointer;min-height:36px">
              🔍 Découvrir tools
            </button>
            ${["bofip","almanac","legal-hunter"].includes(e.id)?"":`<button
                    data-mcp-remove="${s(e.id)}"
                    style="padding:8px 14px;background:#ef4444;color:#fff;border:0;border-radius:8px;font-size:13px;cursor:pointer;min-height:36px">
                    🗑 Retirer
                  </button>`}
          </div>
          ${r>0?`<details style="margin-top:12px;padding:8px;background:#1e293b;border-radius:6px">
                  <summary style="cursor:pointer;font-size:13px;color:#cbd5e1">📋 Voir ${r} tools exposés</summary>
                  <ul style="margin:8px 0 0 16px;font-size:12px;color:#94a3b8">
                    ${e.toolsExposed.map(a=>`<li>${s(a.name)} — ${s(a.description)}</li>`).join("")}
                  </ul>
                </details>`:""}
        </div>`}).join("");t.innerHTML=`
    <div style="max-width:760px;margin:0 auto;padding:20px">
      <h1 style="font-size:24px;margin-bottom:8px;color:#f1f5f9">🔌 MCP Servers</h1>
      <p style="color:#94a3b8;margin-bottom:24px">
        Model Context Protocol servers connectés à Apex. ${n.length} server${n.length>1?"s":""} enregistré${n.length>1?"s":""}.
      </p>

      ${p?`<div style="background:#0f172a;border-left:4px solid ${p.severity==="ok"?"#10b981":"#f59e0b"};padding:12px 16px;border-radius:8px;margin-bottom:24px">
              <div style="font-size:14px;color:#cbd5e1">${s(p.message)}</div>
              <div style="font-size:12px;color:#94a3b8;margin-top:4px">
                Dernier check : ${new Date(p.ts).toLocaleString("fr-FR")}
              </div>
            </div>`:""}

      <div style="margin-bottom:24px">
        ${u||'<p style="color:#94a3b8">Aucun server MCP enregistré.</p>'}
      </div>

      <div style="background:#0f172a;border:1px dashed #334155;border-radius:12px;padding:16px;margin-top:24px">
        <h3 style="font-size:16px;margin-bottom:12px;color:#f1f5f9">➕ Ajouter un MCP server custom</h3>
        <input id="mcp-new-id" placeholder="ID (kebab-case)" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;margin-bottom:8px;font-size:14px">
        <input id="mcp-new-name" placeholder="Nom affiché" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;margin-bottom:8px;font-size:14px">
        <input id="mcp-new-url" placeholder="URL MCP (https://...)" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;margin-bottom:8px;font-size:14px">
        <input id="mcp-new-token-key" placeholder="Clé Vault (optionnel, ex: my_server_token)" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;margin-bottom:12px;font-size:14px">
        <button id="mcp-new-submit" style="padding:10px 18px;background:#10b981;color:#fff;border:0;border-radius:8px;font-size:14px;cursor:pointer;min-height:40px">
          ➕ Enregistrer le server
        </button>
      </div>

      <div style="margin-top:32px;padding:16px;background:#0f172a;border-radius:8px;font-size:12px;color:#94a3b8">
        💡 <strong>Note Kevin :</strong> Tokens MCP stockés chiffrés AES-GCM-256 dans Vault Apex.
        Rate-limit 30 req/min par server. Cache LRU 50 entries TTL 1h.
      </div>
    </div>
  `,t.querySelectorAll("[data-mcp-test]").forEach(e=>{e.addEventListener("click",async()=>{const r=e.getAttribute("data-mcp-test")??"";o.info(`Test MCP ${r}...`);try{const i=await x.healthCheck(r);i.alive?o.success(`✅ ${r} alive (${i.latencyMs}ms)`):o.error(`🔴 ${r} dead`),c(t)}catch(i){o.error(`Erreur test ${r}`),m.warn("mcp.test","failed",{err:i})}})}),t.querySelectorAll("[data-mcp-discover]").forEach(e=>{e.addEventListener("click",async()=>{const r=e.getAttribute("data-mcp-discover")??"";o.info(`Discovery ${r}...`);try{await d.discoverTools(r),o.success(`✅ Tools discovered for ${r}`),c(t)}catch(i){o.error(`Erreur discovery ${r}`),m.warn("mcp.discover","failed",{err:i})}})}),t.querySelectorAll("[data-mcp-remove]").forEach(e=>{e.addEventListener("click",async()=>{const r=e.getAttribute("data-mcp-remove")??"";confirm(`Retirer le server MCP "${r}" ?`)&&(await d.unregister(r),o.success(`✅ ${r} retiré`),c(t))})}),t.querySelector("#mcp-new-submit")?.addEventListener("click",async()=>{const e=t.querySelector("#mcp-new-id")?.value?.trim()??"",r=t.querySelector("#mcp-new-name")?.value?.trim()??"",i=t.querySelector("#mcp-new-url")?.value?.trim()??"",a=t.querySelector("#mcp-new-token-key")?.value?.trim()??"";if(!e||!r||!i){o.error("ID, nom et URL obligatoires");return}if(!/^[a-z][a-z0-9-]+$/.test(e)){o.error("ID doit être kebab-case");return}if(!i.startsWith("https://")){o.error("URL doit commencer par https://");return}await d.register({id:e,name:r,url:i,...a?{tokenKey:a}:{}})?(o.success(`✅ ${e} ajouté`),c(t)):o.error(`❌ ${e} existe déjà`)})}function R(){}export{R as dispose,c as render};
