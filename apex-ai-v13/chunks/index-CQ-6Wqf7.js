import{e as t,l as p}from"./monitoring-eS3mQsuP.js";import{x as d}from"./apex-tools-dispatch-skills-DIn_62CE.js";import{toast as r}from"./toast-CRdbcLoc.js";import"./multi-source-analyze-DRC5_BGP.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-DXirSuC2.js";import"./haptic-CQFg2PXZ.js";function S(s){s.innerHTML=`
    <div class="ax-gs-115">
      <h1 class="ax-gs-289">📈 Studio Excel — Tableau .xlsx</h1>
      <p class="ax-gs-199">Génère un tableau Excel multi-feuilles. Colle données CSV ou saisis manuellement.</p>

      <label class="ax-gs-473">
        <span class="ax-gs-15">Nom fichier</span>
        <input id="xlsx-filename" type="text" value="tableau.xlsx" class="ax-gs-463">
      </label>

      <label class="ax-gs-473">
        <span class="ax-gs-15">Nom de la feuille</span>
        <input id="xlsx-sheetname" type="text" value="Sheet1" class="ax-gs-463">
      </label>

      <label class="ax-gs-473">
        <span class="ax-gs-15">Données (CSV, 1ère ligne = headers)</span>
        <textarea id="xlsx-data" rows="10" placeholder="Catégorie,Recettes,Dépenses&#10;Salaire,4500,0&#10;Loyer,0,1200&#10;Courses,0,400" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:13px;font-family:monospace;resize:vertical">Catégorie,Recettes,Dépenses
Salaire,4500,0
Loyer,0,1200
Courses,0,400</textarea>
      </label>

      <label class="ax-gs-403">
        <input type="checkbox" id="xlsx-freeze" checked> <span class="ax-gs-260">Figer la 1ère ligne (headers)</span>
      </label>

      <button id="xlsx-generate" class="ax-gs-465">
        ⬇️ Générer le .xlsx
      </button>

      <div id="xlsx-result" class="ax-gs-256"></div>
    </div>
  `,s.querySelector("#xlsx-generate")?.addEventListener("click",async()=>{const x=s.querySelector("#xlsx-filename")?.value||"tableau.xlsx",o=s.querySelector("#xlsx-sheetname")?.value||"Sheet1",c=s.querySelector("#xlsx-data")?.value??"",u=s.querySelector("#xlsx-freeze")?.checked??!0,n=c.split(`
`).map(e=>e.trim()).filter(Boolean).map(e=>e.split(",").map(a=>{const l=a.trim(),i=Number(l);return!isNaN(i)&&l!==""?i:l}));if(n.length===0){r.error("Aucune donnée à exporter");return}r.info("Génération en cours...");try{const e=await d.generate({filename:x,sheets:[{name:o,data:n,freezeHeader:u}]}),a=s.querySelector("#xlsx-result");if(!a)return;e.success?(a.innerHTML=`
          <div class="ax-gs-47">
            <p class="ax-gs-466">✅ ${t(e.filename)} (${e.sheetCount} feuille, ${(e.sizeBytes/1024).toFixed(1)} Ko)</p>
            <a href="${e.blobUrl}" download="${t(e.filename)}" class="ax-gs-467">⬇️ Télécharger</a>
          </div>`,r.success(`✅ ${e.filename}`)):(a.innerHTML=`<p class="ax-gs-257">❌ ${t(e.error??"Erreur")}</p>`,r.error(`❌ ${e.error??"Erreur"}`))}catch(e){p.warn("studio-xlsx","failed",{err:e}),r.error(`❌ ${e instanceof Error?e.message:"Erreur"}`)}})}export{S as render};
