import{a as i}from"./escape-html-DGIYNPKb.js";import{l as f}from"./monitoring-DMtdadhB.js";import{t as m}from"./apex-tools-dispatch-skills-CAa2hVUn.js";import{toast as a}from"./toast-CRdbcLoc.js";import"./apex-kb-WlLpLTss.js";import"./credential-patterns-CLzI061R.js";import"./haptic-CQFg2PXZ.js";const x=[{id:"invoice",label:"Facture",emoji:"💰"},{id:"quote",label:"Devis",emoji:"📋"},{id:"contract-signed",label:"Contrat à signer",emoji:"✍️"},{id:"report-standard",label:"Rapport",emoji:"📊"},{id:"certificate",label:"Certificat",emoji:"🏆"},{id:"receipt",label:"Reçu",emoji:"🧾"},{id:"custom",label:"Texte libre",emoji:"📝"}];function z(t){t.innerHTML=`
    <div style="max-width:720px;margin:0 auto;padding:20px">
      <h1 style="font-size:24px;margin-bottom:8px;color:#f1f5f9">📑 Studio PDF</h1>
      <p style="color:#94a3b8;margin-bottom:20px">Génère un PDF pro téléchargeable.</p>

      <label style="display:block;margin-bottom:16px">
        <span style="font-size:13px;color:#cbd5e1;display:block;margin-bottom:6px;font-weight:600">Type de document</span>
        <select id="pdf-template" style="width:100%;padding:12px;background:#1e293b;border:1px solid #334155;border-radius:8px;color:#f1f5f9;font-size:15px">
          ${x.map(r=>`<option value="${r.id}">${r.emoji} ${i(r.label)}</option>`).join("")}
        </select>
      </label>

      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:16px;margin-bottom:16px">
        <label style="display:block;margin-bottom:10px">
          <span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">N° / Référence</span>
          <input id="pdf-number" type="text" placeholder="F-2026-001" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
        </label>
        <label style="display:block;margin-bottom:10px">
          <span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Client / Destinataire</span>
          <input id="pdf-client" type="text" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
        </label>
        <label style="display:block;margin-bottom:10px">
          <span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Adresse client</span>
          <input id="pdf-address" type="text" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
        </label>
        <label style="display:block;margin-bottom:10px">
          <span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Lignes (1 par ligne : "description | qty | prix HT")</span>
          <textarea id="pdf-items" rows="4" placeholder="Service A | 1 | 500&#10;Service B | 2 | 250" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px;resize:vertical"></textarea>
        </label>
        <label style="display:block;margin-bottom:10px">
          <span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Watermark (optionnel)</span>
          <select id="pdf-watermark" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
            <option value="">Aucun</option>
            <option value="BROUILLON">BROUILLON</option>
            <option value="CONFIDENTIEL">CONFIDENTIEL</option>
          </select>
        </label>
      </div>

      <button id="pdf-generate" style="width:100%;padding:14px;background:#10b981;color:#fff;border:0;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;min-height:48px">
        ⬇️ Générer le PDF
      </button>

      <div id="pdf-result" style="margin-top:20px"></div>
    </div>
  `,t.querySelector("#pdf-generate")?.addEventListener("click",async()=>{const r=t.querySelector("#pdf-template")?.value??"invoice",p=t.querySelector("#pdf-number")?.value??"",n=t.querySelector("#pdf-client")?.value??"",d=t.querySelector("#pdf-address")?.value??"",s=t.querySelector("#pdf-items")?.value??"",l=t.querySelector("#pdf-watermark")?.value??"",c=s.split(`
`).map(e=>e.trim()).filter(Boolean).map(e=>{const o=e.split("|").map(b=>b.trim());return{description:o[0]??"",quantity:parseFloat(o[1]??"1")||1,unit_price:parseFloat(o[2]??"0")||0}});a.info("Génération en cours...");try{const e=await m.generate({template:r,data:{number:p,client_name:n,client_address:d,items:c,date:new Date().toLocaleDateString("fr-FR")},...l?{options:{watermark:l}}:{}}),o=t.querySelector("#pdf-result");if(!o)return;e.success?(o.innerHTML=`
          <div style="background:#0f172a;border:1px solid #10b981;border-radius:12px;padding:16px;text-align:center">
            <p style="color:#10b981;font-size:14px;margin-bottom:12px">✅ ${i(e.filename)} (${e.pageCount} page${e.pageCount>1?"s":""}, ${(e.sizeBytes/1024).toFixed(1)} Ko)</p>
            <a href="${e.blobUrl}" download="${i(e.filename)}" style="display:inline-block;padding:12px 20px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">⬇️ Télécharger</a>
          </div>`,a.success(`✅ ${e.filename}`)):(o.innerHTML=`<p style="color:#ef4444">❌ ${i(e.error??"Erreur")}</p>`,a.error(`❌ ${e.error??"Erreur"}`))}catch(e){f.warn("studio-pdf","failed",{err:e}),a.error(`❌ ${e instanceof Error?e.message:"Erreur"}`)}})}export{z as render};
