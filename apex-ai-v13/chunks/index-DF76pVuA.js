import{l as c}from"./monitoring-3uBGKGRH.js";import{x as u}from"./apex-tools-dispatch-skills-B3P-0xbA.js";import{toast as o}from"./toast-ClsF1KRZ.js";import"./apex-kb-DRP-rQ5c.js";import"./credential-patterns-CLzI061R.js";import"./haptic-CQFg2PXZ.js";function s(r){return r.replace(/[&<>"']/g,l=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[l]??l)}function k(r){r.innerHTML=`
    <div style="max-width:800px;margin:0 auto;padding:20px">
      <h1 style="font-size:24px;margin-bottom:8px;color:#f1f5f9">📈 Studio Excel — Tableau .xlsx</h1>
      <p style="color:#94a3b8;margin-bottom:20px">Génère un tableau Excel multi-feuilles. Colle données CSV ou saisis manuellement.</p>

      <label style="display:block;margin-bottom:12px">
        <span style="font-size:13px;color:#cbd5e1;display:block;margin-bottom:6px;font-weight:600">Nom fichier</span>
        <input id="xlsx-filename" type="text" value="tableau.xlsx" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
      </label>

      <label style="display:block;margin-bottom:12px">
        <span style="font-size:13px;color:#cbd5e1;display:block;margin-bottom:6px;font-weight:600">Nom de la feuille</span>
        <input id="xlsx-sheetname" type="text" value="Sheet1" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
      </label>

      <label style="display:block;margin-bottom:12px">
        <span style="font-size:13px;color:#cbd5e1;display:block;margin-bottom:6px;font-weight:600">Données (CSV, 1ère ligne = headers)</span>
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
  `,r.querySelector("#xlsx-generate")?.addEventListener("click",async()=>{const l=r.querySelector("#xlsx-filename")?.value||"tableau.xlsx",p=r.querySelector("#xlsx-sheetname")?.value||"Sheet1",d=r.querySelector("#xlsx-data")?.value??"",x=r.querySelector("#xlsx-freeze")?.checked??!0,i=d.split(`
`).map(e=>e.trim()).filter(Boolean).map(e=>e.split(",").map(t=>{const a=t.trim(),n=Number(a);return!isNaN(n)&&a!==""?n:a}));if(i.length===0){o.error("Aucune donnée à exporter");return}o.info("Génération en cours...");try{const e=await u.generate({filename:l,sheets:[{name:p,data:i,freezeHeader:x}]}),t=r.querySelector("#xlsx-result");if(!t)return;e.success?(t.innerHTML=`
          <div style="background:#0f172a;border:1px solid #10b981;border-radius:12px;padding:16px;text-align:center">
            <p style="color:#10b981;font-size:14px;margin-bottom:12px">✅ ${s(e.filename)} (${e.sheetCount} feuille, ${(e.sizeBytes/1024).toFixed(1)} Ko)</p>
            <a href="${e.blobUrl}" download="${s(e.filename)}" style="display:inline-block;padding:12px 20px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">⬇️ Télécharger</a>
          </div>`,o.success(`✅ ${e.filename}`)):(t.innerHTML=`<p style="color:#ef4444">❌ ${s(e.error??"Erreur")}</p>`,o.error(`❌ ${e.error??"Erreur"}`))}catch(e){c.warn("studio-xlsx","failed",{err:e}),o.error(`❌ ${e instanceof Error?e.message:"Erreur"}`)}})}export{k as render};
