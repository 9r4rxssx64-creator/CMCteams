import{e as a}from"./escape-html-BlQj2yEF.js";import{l as c}from"./monitoring-D2lWYrYo.js";import{x as u}from"./apex-tools-dispatch-skills-DOw4cI4G.js";import{toast as s}from"./toast-CRdbcLoc.js";import"./multi-source-analyze-Bg1HHfSC.js";import"./apex-kb-D1VtWFD9.js";import"./credential-patterns-CLzI061R.js";import"./haptic-CQFg2PXZ.js";function z(r){r.innerHTML=`
    <div class="ax-gs-115">
      <h1 style="font-size:24px;margin-bottom:8px;color:#f1f5f9">📈 Studio Excel — Tableau .xlsx</h1>
      <p style="color:#94a3b8;margin-bottom:20px">Génère un tableau Excel multi-feuilles. Colle données CSV ou saisis manuellement.</p>

      <label style="display:block;margin-bottom:12px">
        <span class="ax-gs-15">Nom fichier</span>
        <input id="xlsx-filename" type="text" value="tableau.xlsx" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
      </label>

      <label style="display:block;margin-bottom:12px">
        <span class="ax-gs-15">Nom de la feuille</span>
        <input id="xlsx-sheetname" type="text" value="Sheet1" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
      </label>

      <label style="display:block;margin-bottom:12px">
        <span class="ax-gs-15">Données (CSV, 1ère ligne = headers)</span>
        <textarea id="xlsx-data" rows="10" placeholder="Catégorie,Recettes,Dépenses&#10;Salaire,4500,0&#10;Loyer,0,1200&#10;Courses,0,400" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:13px;font-family:monospace;resize:vertical">Catégorie,Recettes,Dépenses
Salaire,4500,0
Loyer,0,1200
Courses,0,400</textarea>
      </label>

      <label style="display:block;margin-bottom:16px">
        <input type="checkbox" id="xlsx-freeze" checked> <span style="color:#cbd5e1;font-size:13px">Figer la 1ère ligne (headers)</span>
      </label>

      <button id="xlsx-generate" style="width:100%;padding:14px;background:#10b981;color:#fff;border:0;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;min-height:48px">
        ⬇️ Générer le .xlsx
      </button>

      <div id="xlsx-result" style="margin-top:20px"></div>
    </div>
  `,r.querySelector("#xlsx-generate")?.addEventListener("click",async()=>{const n=r.querySelector("#xlsx-filename")?.value||"tableau.xlsx",x=r.querySelector("#xlsx-sheetname")?.value||"Sheet1",p=r.querySelector("#xlsx-data")?.value??"",d=r.querySelector("#xlsx-freeze")?.checked??!0,o=p.split(`
`).map(e=>e.trim()).filter(Boolean).map(e=>e.split(",").map(t=>{const l=t.trim(),i=Number(l);return!isNaN(i)&&l!==""?i:l}));if(o.length===0){s.error("Aucune donnée à exporter");return}s.info("Génération en cours...");try{const e=await u.generate({filename:n,sheets:[{name:x,data:o,freezeHeader:d}]}),t=r.querySelector("#xlsx-result");if(!t)return;e.success?(t.innerHTML=`
          <div class="ax-gs-47">
            <p style="color:#10b981;font-size:14px;margin-bottom:12px">✅ ${a(e.filename)} (${e.sheetCount} feuille, ${(e.sizeBytes/1024).toFixed(1)} Ko)</p>
            <a href="${e.blobUrl}" download="${a(e.filename)}" style="display:inline-block;padding:12px 20px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">⬇️ Télécharger</a>
          </div>`,s.success(`✅ ${e.filename}`)):(t.innerHTML=`<p style="color:#ef4444">❌ ${a(e.error??"Erreur")}</p>`,s.error(`❌ ${e.error??"Erreur"}`))}catch(e){c.warn("studio-xlsx","failed",{err:e}),s.error(`❌ ${e instanceof Error?e.message:"Erreur"}`)}})}export{z as render};
