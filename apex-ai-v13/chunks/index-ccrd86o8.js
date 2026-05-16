const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-D6gjJiDN.js","./monitoring-3uBGKGRH.js","./credential-patterns-CLzI061R.js","./multi-source-analyze-8fXmK5FN.js"])))=>i.map(i=>d[i]);
import{_ as g}from"./apex-kb-D6gjJiDN.js";import{e as o}from"./escape-html-B4YFbUXM.js";import{l as c}from"./monitoring-3uBGKGRH.js";import{s as v}from"../core/main-DBiCqUwg.js";import{skillsWatch as m}from"./skills-watch-wwCTNRIR.js";import{toast as s}from"./toast-ClsF1KRZ.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-8fXmK5FN.js";import"./apex-tools-dispatch-skills-2lTzdA2f.js";import"./mcp-registry-3Ts6jub0.js";import"./haptic-CQFg2PXZ.js";const p=[{id:"docx",emoji:"📄",name:"Doc Word (.docx)",description:"Lettres, contrats, CV, rapports — 6 templates",tool:"generate_docx",tier:"client_free",testParams:{template:"letter-formal",data:{subject:"Test Apex",body:"Hello"}}},{id:"pptx",emoji:"📊",name:"PowerPoint (.pptx)",description:"Slides pitch, présentations — 7 templates pro+fun",tool:"generate_pptx",tier:"client_free",testParams:{template:"pitch-startup",title:"Test",author:"Apex",slides:[{title:"Test",content:"Bullet 1"}]}},{id:"xlsx",emoji:"📈",name:"Excel (.xlsx)",description:"Tableaux multi-feuilles, formules, formats",tool:"generate_xlsx",tier:"client_free",testParams:{filename:"test.xlsx",sheets:[{name:"Sheet1",data:[["A","B"],[1,2]]}]}},{id:"pdf",emoji:"📑",name:"PDF",description:"Factures, devis, certificats — 8 templates",tool:"generate_pdf",tier:"client_free",testParams:{template:"invoice",data:{number:"TEST-001"}}},{id:"design",emoji:"🎨",name:"Design System",description:"Palette WCAG AA + Impeccable vocab (23 termes)",tool:"generate_design_system",tier:"family",testParams:{type:"palette",mood:"premium"}},{id:"marketing",emoji:"💡",name:"Marketing Copy",description:"23 frameworks (Cialdini, AIDA, FOMO, etc.)",tool:"generate_marketing_copy",tier:"family",testParams:{product:"Apex AI",target_audience:"Pros"}},{id:"mcp-bofip",emoji:"🇫🇷",name:"MCP BOFiP fiscal",description:"Doctrine fiscale française officielle",tool:"mcp_bofip_search",tier:"client_free",testParams:{query:"TVA jeux de casino"}},{id:"mcp-almanac",emoji:"🔍",name:"MCP Almanac",description:"Deep Research multi-sources",tool:"mcp_almanac_research",tier:"family",testParams:{topic:"AI trends 2026",depth:"shallow"}},{id:"mcp-legal",emoji:"⚖️",name:"MCP Legal Hunter",description:"18M+ docs juridiques 110+ pays",tool:"mcp_legal_search",tier:"family",testParams:{country:"FR",namespace:"caselaw",query:"rupture conventionnelle"}},{id:"security",emoji:"🛡",name:"Security Review",description:"Scan vulnérabilités OWASP/CWE — admin only",tool:"security_review",tier:"admin",testParams:{scope:"recent_changes"}},{id:"code-review",emoji:"👀",name:"Code Review (4 agents)",description:"CLAUDE.md compliance + bugs + git history",tool:"code_review",tier:"admin",testParams:{files:["apex-ai/v13/core/memory.ts"]}},{id:"skill-factory",emoji:"🏭",name:"Skill Factory",description:"Crée nouveaux skills à la volée — admin only",tool:"skill_factory_create",tier:"admin",testParams:{name:"test-skill",description:"Test",when_to_use:"Test"}},{id:"video-edit",emoji:"🎬",name:"Vidéo Edit (ffmpeg.wasm)",description:"Cut, fade, captions, watermark",tool:"video_edit",tier:"family",testParams:{operation:"cut",video_source:"blob:mock"}},{id:"futuristic",emoji:"🚀",name:"Modules futuristes (60+)",description:"FLUX2, Sora 2, Suno v5, Meshy v4, Kyber post-quantum, WebAR...",tool:"futuristic_module_invoke",tier:"family",testParams:{module_id:"apex-image-gen-flux2-pro"}}];function L(r){if(!(v.get("isAdmin")===!0)){r.innerHTML='<div style="padding:24px;text-align:center;color:#94a3b8">🔒 Réservé admin Kevin</div>';return}const a=m.getLastReport("skills-watch"),n=m.getLastReport("mcp-health-watch"),f=p.map(e=>{const l=e.tier==="admin"?"#ef4444":e.tier==="family"?"#f59e0b":"#10b981";return`
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:12px">
          <div style="flex:1;min-width:0">
            <div style="font-size:16px;font-weight:600;color:#f1f5f9">${e.emoji} ${o(e.name)}</div>
            <div style="font-size:12px;color:#94a3b8;margin-top:2px">${o(e.description)}</div>
            <div style="display:flex;gap:8px;margin-top:8px;align-items:center;flex-wrap:wrap">
              <code style="background:#1e293b;padding:2px 6px;border-radius:4px;font-size:11px;color:#cbd5e1">${o(e.tool)}</code>
              <span style="font-size:11px;color:${l};font-weight:600;text-transform:uppercase">${o(e.tier)}</span>
            </div>
          </div>
          <button
            data-skill-test="${o(e.id)}"
            style="padding:8px 14px;background:#3b82f6;color:#fff;border:0;border-radius:6px;font-size:12px;cursor:pointer;min-height:36px;white-space:nowrap">
            🧪 Tester
          </button>
        </div>
      </div>`}).join("");r.innerHTML=`
    <div style="max-width:760px;margin:0 auto;padding:20px">
      <h1 style="font-size:24px;margin-bottom:8px;color:#f1f5f9">🎯 Skills 2026 — Apex IA</h1>
      <p style="color:#94a3b8;margin-bottom:24px">
        ${p.length} skills actifs. Apex IA les utilise <strong>systématiquement</strong> sans demander confirmation.
      </p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:24px">
        <div style="background:#0f172a;border-left:4px solid ${a?.severity==="ok"?"#10b981":"#f59e0b"};padding:12px 16px;border-radius:8px">
          <div style="font-size:12px;color:#94a3b8;margin-bottom:4px">CDN Libs</div>
          <div style="font-size:14px;color:#f1f5f9">${a?o(a.message):"Pas encore audité"}</div>
        </div>
        <div style="background:#0f172a;border-left:4px solid ${n?.severity==="ok"?"#10b981":"#f59e0b"};padding:12px 16px;border-radius:8px">
          <div style="font-size:12px;color:#94a3b8;margin-bottom:4px">MCP Servers</div>
          <div style="font-size:14px;color:#f1f5f9">${n?o(n.message):"Pas encore audité"}</div>
        </div>
      </div>

      <div>${f}</div>

      <div style="margin-top:24px;padding:16px;background:#0f172a;border-radius:8px;font-size:12px;color:#94a3b8;line-height:1.6">
        💡 <strong>Note Kevin :</strong> Tous ces skills sont auto-invoqués par Apex IA selon
        l'intent détecté dans le chat user. Aucune action manuelle Kevin requise.
        Voir <a href="?view=mcp-servers" style="color:#3b82f6">🔌 MCP Servers</a> pour
        gérer les serveurs MCP.
      </div>
    </div>
  `,r.querySelectorAll("[data-skill-test]").forEach(e=>{e.addEventListener("click",async()=>{const l=e.getAttribute("data-skill-test")??"",t=p.find(i=>i.id===l);if(t){s.info(`🧪 Test ${t.tool}...`);try{const{apexToolsDispatch:i}=await g(async()=>{const{apexToolsDispatch:u}=await import("./apex-tools-dispatch-core-DRX6OVKm.js").then(x=>x.a);return{apexToolsDispatch:u}},__vite__mapDeps([0,1,2,3]),import.meta.url),d=await i.execute(t.tool,t.testParams,"admin");d?.success?s.success(`✅ ${t.tool} OK`):s.warn(`⚠️ ${t.tool} : ${JSON.stringify(d).slice(0,100)}`),c.info("skills.test",`${t.tool} result`,{result:d})}catch(i){s.error(`❌ ${t.tool} : ${i instanceof Error?i.message:"error"}`),c.warn("skills.test","failed",{err:i})}}})})}function M(){}export{M as dispose,L as render};
