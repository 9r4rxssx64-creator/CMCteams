const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-D_1f5IX4.js","./multi-source-analyze-DnTbSy20.js","./credential-patterns-DUMYZEMu.js","./apex-kb-CQaqrW5w.js"])))=>i.map(i=>d[i]);
import{b as g,e as s,_ as v,l as p}from"./monitoring-D_1f5IX4.js";import{skillsWatch as m}from"./skills-watch-DIqM6vYd.js";import{toast as a}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-DnTbSy20.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-CQaqrW5w.js";import"./apex-tools-dispatch-skills-D9s111k6.js";import"./mcp-registry-DD7k6Uaa.js";import"./haptic-CQFg2PXZ.js";const c=[{id:"docx",emoji:"📄",name:"Doc Word (.docx)",description:"Lettres, contrats, CV, rapports — 6 templates",tool:"generate_docx",tier:"client_free",testParams:{template:"letter-formal",data:{subject:"Test Apex",body:"Hello"}}},{id:"pptx",emoji:"📊",name:"PowerPoint (.pptx)",description:"Slides pitch, présentations — 7 templates pro+fun",tool:"generate_pptx",tier:"client_free",testParams:{template:"pitch-startup",title:"Test",author:"Apex",slides:[{title:"Test",content:"Bullet 1"}]}},{id:"xlsx",emoji:"📈",name:"Excel (.xlsx)",description:"Tableaux multi-feuilles, formules, formats",tool:"generate_xlsx",tier:"client_free",testParams:{filename:"test.xlsx",sheets:[{name:"Sheet1",data:[["A","B"],[1,2]]}]}},{id:"pdf",emoji:"📑",name:"PDF",description:"Factures, devis, certificats — 8 templates",tool:"generate_pdf",tier:"client_free",testParams:{template:"invoice",data:{number:"TEST-001"}}},{id:"design",emoji:"🎨",name:"Design System",description:"Palette WCAG AA + Impeccable vocab (23 termes)",tool:"generate_design_system",tier:"family",testParams:{type:"palette",mood:"premium"}},{id:"marketing",emoji:"💡",name:"Marketing Copy",description:"23 frameworks (Cialdini, AIDA, FOMO, etc.)",tool:"generate_marketing_copy",tier:"family",testParams:{product:"Apex AI",target_audience:"Pros"}},{id:"mcp-bofip",emoji:"🇫🇷",name:"MCP BOFiP fiscal",description:"Doctrine fiscale française officielle",tool:"mcp_bofip_search",tier:"client_free",testParams:{query:"TVA jeux de casino"}},{id:"mcp-almanac",emoji:"🔍",name:"MCP Almanac",description:"Deep Research multi-sources",tool:"mcp_almanac_research",tier:"family",testParams:{topic:"AI trends 2026",depth:"shallow"}},{id:"mcp-legal",emoji:"⚖️",name:"MCP Legal Hunter",description:"18M+ docs juridiques 110+ pays",tool:"mcp_legal_search",tier:"family",testParams:{country:"FR",namespace:"caselaw",query:"rupture conventionnelle"}},{id:"security",emoji:"🛡",name:"Security Review",description:"Scan vulnérabilités OWASP/CWE — admin only",tool:"security_review",tier:"admin",testParams:{scope:"recent_changes"}},{id:"code-review",emoji:"👀",name:"Code Review (4 agents)",description:"CLAUDE.md compliance + bugs + git history",tool:"code_review",tier:"admin",testParams:{files:["apex-ai/v13/core/memory.ts"]}},{id:"skill-factory",emoji:"🏭",name:"Skill Factory",description:"Crée nouveaux skills à la volée — admin only",tool:"skill_factory_create",tier:"admin",testParams:{name:"test-skill",description:"Test",when_to_use:"Test"}},{id:"video-edit",emoji:"🎬",name:"Vidéo Edit (ffmpeg.wasm)",description:"Cut, fade, captions, watermark",tool:"video_edit",tier:"family",testParams:{operation:"cut",video_source:"blob:mock"}},{id:"futuristic",emoji:"🚀",name:"Modules futuristes (60+)",description:"FLUX2, Sora 2, Suno v5, Meshy v4, Kyber post-quantum, WebAR...",tool:"futuristic_module_invoke",tier:"family",testParams:{module_id:"apex-image-gen-flux2-pro"}}];function S(r){if(!(g.get("isAdmin")===!0)){r.innerHTML='<div class="ax-gs-37">🔒 Réservé admin Kevin</div>';return}const o=m.getLastReport("skills-watch"),n=m.getLastReport("mcp-health-watch"),u=c.map(e=>{const l=e.tier==="admin"?"#ef4444":e.tier==="family"?"#f59e0b":"#10b981";return`
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:12px">
          <div class="ax-gs-6">
            <div class="ax-gs-108">${e.emoji} ${s(e.name)}</div>
            <div class="ax-gs-109">${s(e.description)}</div>
            <div style="display:flex;gap:8px;margin-top:8px;align-items:center;flex-wrap:wrap">
              <code style="background:#1e293b;padding:2px 6px;border-radius:4px;font-size:11px;color:#cbd5e1">${s(e.tool)}</code>
              <span style="font-size:11px;color:${l};font-weight:600;text-transform:uppercase">${s(e.tier)}</span>
            </div>
          </div>
          <button
            data-skill-test="${s(e.id)}"
            style="padding:8px 14px;background:#3b82f6;color:#fff;border:0;border-radius:6px;font-size:12px;cursor:pointer;min-height:36px;white-space:nowrap">
            🧪 Tester
          </button>
        </div>
      </div>`}).join("");r.innerHTML=`
    <div class="ax-gs-59">
      <h1 class="ax-gs-289">🎯 Skills 2026 — Apex IA</h1>
      <p class="ax-gs-194">
        ${c.length} skills actifs. Apex IA les utilise <strong>systématiquement</strong> sans demander confirmation.
      </p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:24px">
        <div style="background:#0f172a;border-left:4px solid ${o?.severity==="ok"?"#10b981":"#f59e0b"};padding:12px 16px;border-radius:8px">
          <div class="ax-gs-117">CDN Libs</div>
          <div class="ax-gs-118">${o?s(o.message):"Pas encore audité"}</div>
        </div>
        <div style="background:#0f172a;border-left:4px solid ${n?.severity==="ok"?"#10b981":"#f59e0b"};padding:12px 16px;border-radius:8px">
          <div class="ax-gs-117">MCP Servers</div>
          <div class="ax-gs-118">${n?s(n.message):"Pas encore audité"}</div>
        </div>
      </div>

      <div>${u}</div>

      <div class="ax-gs-116">
        💡 <strong>Note Kevin :</strong> Tous ces skills sont auto-invoqués par Apex IA selon
        l'intent détecté dans le chat user. Aucune action manuelle Kevin requise.
        Voir <a href="?view=mcp-servers" class="ax-gs-200">🔌 MCP Servers</a> pour
        gérer les serveurs MCP.
      </div>
    </div>
  `,r.querySelectorAll("[data-skill-test]").forEach(e=>{e.addEventListener("click",async()=>{const l=e.getAttribute("data-skill-test")??"",t=c.find(i=>i.id===l);if(t){a.info(`🧪 Test ${t.tool}...`);try{const{apexToolsDispatch:i}=await v(async()=>{const{apexToolsDispatch:f}=await import("./apex-tools-dispatch-core-CkH4NpnS.js").then(x=>x.b);return{apexToolsDispatch:f}},__vite__mapDeps([0,1,2,3]),import.meta.url),d=await i.execute(t.tool,t.testParams,"admin");d?.success?a.success(`✅ ${t.tool} OK`):a.warn(`⚠️ ${t.tool} : ${JSON.stringify(d).slice(0,100)}`),p.info("skills.test",`${t.tool} result`,{result:d})}catch(i){a.error(`❌ ${t.tool} : ${i instanceof Error?i.message:"error"}`),p.warn("skills.test","failed",{err:i})}}})})}function T(){}export{T as dispose,S as render};
