const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./monitoring-DbICRMwL.js","./multi-source-analyze-BD3w6c3T.js","./credential-patterns-DUMYZEMu.js","./apex-kb-DuVUJwm8.js","../assets/css/main-CL36MkOW.css"])))=>i.map(i=>d[i]);
import{a as _,l as b,_ as l,b as $}from"./monitoring-DbICRMwL.js";import{toast as y}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-BD3w6c3T.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-DuVUJwm8.js";import"./haptic-CQFg2PXZ.js";class R{currentReport=null;async runAll(e){const t=Date.now(),a=`report_${t}_${Math.random().toString(36).slice(2,8)}`,s=[],r=[{id:"gen-docx",cat:"generator",name:"Génération .docx letter-formal",fn:this.testDocx},{id:"gen-pptx",cat:"generator",name:"Génération .pptx pitch-startup",fn:this.testPptx},{id:"gen-xlsx",cat:"generator",name:"Génération .xlsx multi-feuille",fn:this.testXlsx},{id:"gen-pdf",cat:"generator",name:"Génération .pdf invoice",fn:this.testPdf},{id:"mcp-bofip-health",cat:"mcp",name:"MCP BOFiP health check",fn:()=>this.testMcpHealth("bofip")},{id:"mcp-almanac-health",cat:"mcp",name:"MCP Almanac health check",fn:()=>this.testMcpHealth("almanac")},{id:"mcp-legal-health",cat:"mcp",name:"MCP Legal Hunter health check",fn:()=>this.testMcpHealth("legal-hunter")},{id:"fut-flux2",cat:"futuristic",name:"Module FLUX 2 Pro routing",fn:()=>this.testFuturistic("apex-image-gen-flux2-pro")},{id:"fut-vision",cat:"futuristic",name:"Module Vision Claude 4",fn:()=>this.testFuturistic("apex-vision-claude-4")},{id:"fut-mermaid",cat:"futuristic",name:"Module Mermaid flowchart",fn:()=>this.testFuturistic("apex-flowchart-mermaid")},{id:"fut-kyber",cat:"futuristic",name:"Module Kyber PQ Crypto",fn:()=>this.testFuturistic("apex-pq-crypto-kyber")},{id:"fut-ar",cat:"futuristic",name:"Module WebAR model-viewer",fn:()=>this.testFuturistic("apex-webar-modelviewer")},{id:"sent-skills",cat:"sentinel",name:"Sentinelle skills-watch (CDN probe)",fn:this.testSkillsWatch},{id:"sent-mcp",cat:"sentinel",name:"Sentinelle mcp-health-watch",fn:this.testMcpHealthWatch},{id:"sec-audit",cat:"security",name:"Security review (audit complet)",fn:this.testSecurityReview},{id:"video-hyperframes",cat:"video",name:"Hyperframes MediaRecorder check",fn:this.testHyperframes}];for(let o=0;o<r.length;o++){const d=r[o];e?.(d.name,o,r.length);const w=Date.now();try{const c=await d.fn.call(this);s.push({testId:d.id,category:d.cat,name:d.name,status:c.status,durationMs:Date.now()-w,...c.evidence?{evidence:c.evidence}:{},...c.error?{error:c.error}:{},ts:Date.now()})}catch(c){s.push({testId:d.id,category:d.cat,name:d.name,status:"fail",durationMs:Date.now()-w,error:c instanceof Error?c.message:String(c),ts:Date.now()})}}const i=Date.now(),p=s.filter(o=>o.status==="pass").length,g=s.filter(o=>o.status==="fail").length,m=s.filter(o=>o.status==="warn").length,h=s.filter(o=>o.status==="skip").length,u={reportId:a,startedAt:t,finishedAt:i,totalDurationMs:i-t,results:s,summary:{total:s.length,passed:p,failed:g,warnings:m,skipped:h,successRate:Math.round(p/s.length*100)}};this.currentReport=u,this.persist(u);try{await _.record("runtime-tester.run",{details:{reportId:a,total:u.summary.total,passed:p,failed:g,duration:u.totalDurationMs}})}catch{}return e?.(`Done (${p}/${s.length} passed)`,s.length,s.length),b.info("runtime-tester",`Run complete: ${p}/${s.length} passed`,{reportId:a}),u}getLastReport(){if(this.currentReport)return this.currentReport;try{const e=localStorage.getItem("ax_runtime_test_last");return e?JSON.parse(e):null}catch{return null}}persist(e){try{localStorage.setItem("ax_runtime_test_last",JSON.stringify(e));const t=this.getHistory();t.unshift({reportId:e.reportId,startedAt:e.startedAt,successRate:e.summary.successRate,total:e.summary.total}),t.length>20&&(t.length=20),localStorage.setItem("ax_runtime_test_history",JSON.stringify(t))}catch(t){b.warn("runtime-tester","persist failed",{err:t})}}getHistory(){try{const e=localStorage.getItem("ax_runtime_test_history");return e?JSON.parse(e):[]}catch{return[]}}async testDocx(){const{docxGenerator:e}=await l(async()=>{const{docxGenerator:a}=await import("./apex-tools-dispatch-skills--n2TV83u.js").then(s=>s.w);return{docxGenerator:a}},__vite__mapDeps([0,1,2,3]),import.meta.url),t=await e.generate({template:"letter-formal",data:{sender_name:"Apex Runtime Test",recipient_name:"Test",subject:"Auto-test",body:"Test généré par Apex Runtime Tester."}});return t.success?{status:"pass",evidence:{filename:t.filename,sizeBytes:t.sizeBytes,blobUrl:t.blobUrl}}:{status:"fail",error:t.error??"Inconnu"}}async testPptx(){const{pptxGenerator:e}=await l(async()=>{const{pptxGenerator:a}=await import("./apex-tools-dispatch-skills--n2TV83u.js").then(s=>s.y);return{pptxGenerator:a}},__vite__mapDeps([0,1,2,3]),import.meta.url),t=await e.generate({template:"pitch-startup",title:"Apex Auto-Test",author:"Apex",slides:[{title:"Slide 1",content:"Test"},{title:"Slide 2",content:"Auto"}],mode:"pro"});return t.success?{status:"pass",evidence:{filename:t.filename,sizeBytes:t.sizeBytes,blobUrl:t.blobUrl}}:{status:"fail",error:t.error??"Inconnu"}}async testXlsx(){const{xlsxGenerator:e}=await l(async()=>{const{xlsxGenerator:a}=await import("./apex-tools-dispatch-skills--n2TV83u.js").then(s=>s.z);return{xlsxGenerator:a}},__vite__mapDeps([0,1,2,3]),import.meta.url),t=await e.generate({filename:"apex-auto-test.xlsx",sheets:[{name:"Test",data:[["Item","Quantité","Prix"],["Service A",1,100],["Service B",2,50]]}]});return t.success?{status:"pass",evidence:{filename:t.filename,sizeBytes:t.sizeBytes,blobUrl:t.blobUrl}}:{status:"fail",error:t.error??"Inconnu"}}async testPdf(){const{pdfGenerator:e}=await l(async()=>{const{pdfGenerator:a}=await import("./apex-tools-dispatch-skills--n2TV83u.js").then(s=>s.A);return{pdfGenerator:a}},__vite__mapDeps([0,1,2,3]),import.meta.url),t=await e.generate({template:"invoice",data:{number:"AUTO-TEST-001",client_name:"Apex Runtime",items:[{description:"Test",quantity:1,unit_price:100}]}});return t.success?{status:"pass",evidence:{filename:t.filename,sizeBytes:t.sizeBytes,blobUrl:t.blobUrl}}:{status:"fail",error:t.error??"Inconnu"}}async testMcpHealth(e){const{mcpClient:t}=await l(async()=>{const{mcpClient:s}=await import("./apex-tools-dispatch-skills--n2TV83u.js").then(r=>r.v);return{mcpClient:s}},__vite__mapDeps([0,1,2,3]),import.meta.url),a=Date.now();try{const s=await t.healthCheck(e);return{status:s.alive?"pass":"warn",evidence:{latencyMs:Date.now()-a,output:s},...s.alive?{}:{error:"Server not alive (token absent ou URL down)"}}}catch(s){return{status:"fail",error:s instanceof Error?s.message:String(s)}}}async testFuturistic(e){const{futuristicModules:t}=await l(async()=>{const{futuristicModules:s}=await import("./futuristic-modules-DCWQs1x1.js");return{futuristicModules:s}},__vite__mapDeps([0,1,2,3]),import.meta.url),a=await t.invoke(e,{});return a.success?{status:"pass",evidence:{output:{module_id:a.module_id,category:a.category}}}:{status:"fail",error:a.error??"Inconnu"}}async testSkillsWatch(){const{skillsWatch:e}=await l(async()=>{const{skillsWatch:a}=await import("./skills-watch-BY2o-sQF.js");return{skillsWatch:a}},__vite__mapDeps([0,1,2,3]),import.meta.url),t=await e.skillsWatch();return{status:t.severity==="ok"?"pass":t.severity==="warn"?"warn":"fail",evidence:{output:t.details},...t.severity!=="ok"?{error:t.message}:{}}}async testMcpHealthWatch(){const{skillsWatch:e}=await l(async()=>{const{skillsWatch:a}=await import("./skills-watch-BY2o-sQF.js");return{skillsWatch:a}},__vite__mapDeps([0,1,2,3]),import.meta.url),t=await e.mcpHealthWatch();return{status:t.severity==="ok"?"pass":t.severity==="warn"?"warn":"fail",evidence:{output:t.details},...t.severity!=="ok"?{error:t.message}:{}}}async testSecurityReview(){try{const{apexSelfAudit:e}=await l(async()=>{const{apexSelfAudit:s}=await import("./apex-self-audit-BrL_JS0A.js");return{apexSelfAudit:s}},__vite__mapDeps([0,1,2,3,4]),import.meta.url),a=(await e.runFullAudit(!1))?.score??0;return{status:a>=80?"pass":a>=60?"warn":"fail",evidence:{output:{score:a}}}}catch(e){return{status:"fail",error:e instanceof Error?e.message:String(e)}}}async testHyperframes(){return typeof MediaRecorder>"u"?{status:"skip",error:"MediaRecorder API indispo (env headless/old browser)"}:typeof document.createElement("canvas").captureStream!="function"?{status:"skip",error:"canvas.captureStream indispo"}:{status:"pass",evidence:{output:{mediaRecorder:"available",captureStream:"available"}}}}}const v=new R;function f(n){return n.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function S(n){return{pass:"✅",fail:"❌",warn:"⚠️",skip:"⏭"}[n]??"❓"}function x(n){return{pass:"#10b981",fail:"#ef4444",warn:"#f59e0b",skip:"#94a3b8"}[n]??"#cbd5e1"}function k(n){if(!($.get("isAdmin")===!0)){n.innerHTML='<div class="ax-gs-37">🔒 Réservé admin Kevin</div>';return}const t=v.getLastReport(),a=v.getHistory();function s(r){return`
      <div class="ax-gs-113">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
          <div>
            <strong style="color:#f1f5f9;font-size:16px">${r.summary.passed}/${r.summary.total} passed</strong>
            <span style="color:${x(r.summary.successRate===100?"pass":r.summary.successRate>=70?"warn":"fail")};font-weight:600;margin-left:8px">${r.summary.successRate}%</span>
          </div>
          <div style="font-size:12px;color:#94a3b8">
            ${f(new Date(r.startedAt).toLocaleString("fr-FR"))} • ${(r.totalDurationMs/1e3).toFixed(1)}s
          </div>
        </div>
        <div style="display:flex;gap:12px;font-size:12px;color:#cbd5e1;margin-bottom:12px;flex-wrap:wrap">
          <span>✅ ${r.summary.passed}</span>
          <span>❌ ${r.summary.failed}</span>
          <span>⚠️ ${r.summary.warnings}</span>
          <span>⏭ ${r.summary.skipped}</span>
        </div>
        <details class="ax-gs-186">
          <summary style="cursor:pointer;color:#cbd5e1;font-size:13px;padding:6px 0">📋 Voir détails (${r.results.length} tests)</summary>
          <div class="ax-gs-114">
            ${r.results.map(i=>`
              <div style="background:#1e293b;padding:10px;border-radius:6px;margin-bottom:6px;border-left:3px solid ${x(i.status)}">
                <div style="display:flex;justify-content:space-between;gap:8px">
                  <div class="ax-gs-6">
                    <div style="color:#f1f5f9;font-size:13px;font-weight:600">${S(i.status)} ${f(i.name)}</div>
                    <div style="color:#94a3b8;font-size:11px;margin-top:2px">${f(i.category)} • ${i.durationMs}ms</div>
                    ${i.error?`<div style="color:#ef4444;font-size:11px;margin-top:4px">❌ ${f(i.error)}</div>`:""}
                    ${i.evidence?.filename?`<div style="color:#10b981;font-size:11px;margin-top:4px">📄 ${f(i.evidence.filename)} (${(i.evidence.sizeBytes??0)/1024} Ko) ${i.evidence.blobUrl?`<a href="${i.evidence.blobUrl}" download="${f(i.evidence.filename)}" style="color:#3b82f6;margin-left:8px">⬇️ DL</a>`:""}</div>`:""}
                    ${i.evidence?.latencyMs?`<div style="color:#94a3b8;font-size:11px;margin-top:4px">⏱ ${i.evidence.latencyMs}ms</div>`:""}
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </details>
      </div>
    `}n.innerHTML=`
    <div class="ax-gs-115">
      <h1 class="ax-gs-289">🧪 Runtime Tests — Apex teste TOUT</h1>
      <p class="ax-gs-199">
        Exécute tous les skills 2026 + MCP + sentinelles en runtime browser <strong>RÉEL</strong>
        (CDN load → lib exec → blob téléchargeable).
      </p>

      <button id="run-all-tests" style="width:100%;padding:14px;background:#3b82f6;color:#fff;border:0;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;min-height:48px;margin-bottom:20px">
        🧪 Lancer TOUS les tests réels (env 30s)
      </button>

      <div id="test-progress" style="display:none;background:#0f172a;border:1px solid #3b82f6;border-radius:8px;padding:12px;margin-bottom:16px">
        <div id="progress-text" style="color:#f1f5f9;font-size:13px;margin-bottom:6px">Initialisation...</div>
        <div style="background:#1e293b;border-radius:4px;height:6px;overflow:hidden">
          <div id="progress-bar" style="background:#3b82f6;height:100%;width:0%;transition:width 0.3s"></div>
        </div>
      </div>

      <div id="test-results">
        ${t?`<h3 class="ax-gs-294">Dernier rapport</h3>${s(t)}`:'<p style="color:#94a3b8;text-align:center;padding:30px;background:#0f172a;border-radius:12px">Aucun test runtime exécuté. Clique sur le bouton ci-dessus pour démarrer.</p>'}
      </div>

      ${a.length>1?`
        <h3 style="font-size:16px;color:#f1f5f9;margin:24px 0 12px">📊 Historique (${a.length} runs)</h3>
        <div style="background:#0f172a;border-radius:8px;padding:12px">
          ${a.slice(0,10).map(r=>`
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1e293b;font-size:12px">
              <span style="color:#cbd5e1">${f(new Date(r.startedAt).toLocaleString("fr-FR"))}</span>
              <span style="color:${x(r.successRate===100?"pass":r.successRate>=70?"warn":"fail")};font-weight:600">${r.successRate}% (${r.total} tests)</span>
            </div>
          `).join("")}
        </div>
      `:""}

      <div class="ax-gs-116">
        💡 <strong>Note Kevin :</strong> Ces tests sont <strong>RÉELS</strong> (CDN chargés, libs exécutées,
        blobs créés). Le bouton ⬇️ DL télécharge le fichier produit pendant le test pour vérification visuelle.
        Voir aussi <a href="?view=skills-2026" class="ax-gs-200">🎯 Skills 2026</a> et
        <a href="?view=mcp-servers" class="ax-gs-200">🔌 MCP Servers</a>.
      </div>
    </div>
  `,n.querySelector("#run-all-tests")?.addEventListener("click",async()=>{const r=n.querySelector("#run-all-tests"),i=n.querySelector("#test-progress"),p=n.querySelector("#progress-text"),g=n.querySelector("#progress-bar");r.disabled=!0,r.textContent="🧪 Tests en cours...",i.style.display="block";try{y.info("🧪 Tests runtime lancés..."),await v.runAll((m,h,u)=>{p.textContent=`${m} (${h}/${u})`,g.style.width=`${Math.round(h/u*100)}%`}),y.success("✅ Tests runtime terminés"),k(n)}catch(m){b.warn("runtime-tests","failed",{err:m}),y.error(`❌ ${m instanceof Error?m.message:"Erreur"}`),r.disabled=!1,r.textContent="🧪 Lancer TOUS les tests réels (env 30s)"}})}export{k as render};
