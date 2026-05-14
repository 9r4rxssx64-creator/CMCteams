import{l as m}from"./monitoring-3uBGKGRH.js";import{a as f}from"./apex-tools-dispatch-DNqwx1ut.js";import{toast as i}from"./toast-ClsF1KRZ.js";import"./apex-kb-J2BE6WV_.js";import"./credential-patterns-guxfirLX.js";import"./multi-source-analyze-B6Ty0Khb.js";import"./apex-tools-registry-7bxFgrb_.js";import"./voice-Dig2ZX6I.js";import"./haptic-CQFg2PXZ.js";function a(t){return t.replace(/[&<>"']/g,o=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[o]??o)}const u=[{id:"invoice",label:"Facture",emoji:"💰"},{id:"quote",label:"Devis",emoji:"📋"},{id:"contract-signed",label:"Contrat à signer",emoji:"✍️"},{id:"report-standard",label:"Rapport",emoji:"📊"},{id:"certificate",label:"Certificat",emoji:"🏆"},{id:"receipt",label:"Reçu",emoji:"🧾"},{id:"custom",label:"Texte libre",emoji:"📝"}];function L(t){t.innerHTML=`
    <div style="max-width:720px;margin:0 auto;padding:20px">
      <h1 style="font-size:24px;margin-bottom:8px;color:#f1f5f9">📑 Studio PDF</h1>
      <p style="color:#94a3b8;margin-bottom:20px">Génère un PDF pro téléchargeable.</p>

      <label style="display:block;margin-bottom:16px">
        <span style="font-size:13px;color:#cbd5e1;display:block;margin-bottom:6px;font-weight:600">Type de document</span>
        <select id="pdf-template" style="width:100%;padding:12px;background:#1e293b;border:1px solid #334155;border-radius:8px;color:#f1f5f9;font-size:15px">
          ${u.map(o=>`<option value="${o.id}">${o.emoji} ${a(o.label)}</option>`).join("")}
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
  `,t.querySelector("#pdf-generate")?.addEventListener("click",async()=>{const o=t.querySelector("#pdf-template")?.value??"invoice",p=t.querySelector("#pdf-number")?.value??"",n=t.querySelector("#pdf-client")?.value??"",d=t.querySelector("#pdf-address")?.value??"",s=t.querySelector("#pdf-items")?.value??"",l=t.querySelector("#pdf-watermark")?.value??"",c=s.split(`
`).map(e=>e.trim()).filter(Boolean).map(e=>{const r=e.split("|").map(b=>b.trim());return{description:r[0]??"",quantity:parseFloat(r[1]??"1")||1,unit_price:parseFloat(r[2]??"0")||0}});i.info("Génération en cours...");try{const e=await f.generate({template:o,data:{number:p,client_name:n,client_address:d,items:c,date:new Date().toLocaleDateString("fr-FR")},...l?{options:{watermark:l}}:{}}),r=t.querySelector("#pdf-result");if(!r)return;e.success?(r.innerHTML=`
          <div style="background:#0f172a;border:1px solid #10b981;border-radius:12px;padding:16px;text-align:center">
            <p style="color:#10b981;font-size:14px;margin-bottom:12px">✅ ${a(e.filename)} (${e.pageCount} page${e.pageCount>1?"s":""}, ${(e.sizeBytes/1024).toFixed(1)} Ko)</p>
            <a href="${e.blobUrl}" download="${a(e.filename)}" style="display:inline-block;padding:12px 20px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">⬇️ Télécharger</a>
          </div>`,i.success(`✅ ${e.filename}`)):(r.innerHTML=`<p style="color:#ef4444">❌ ${a(e.error??"Erreur")}</p>`,i.error(`❌ ${e.error??"Erreur"}`))}catch(e){m.warn("studio-pdf","failed",{err:e}),i.error(`❌ ${e instanceof Error?e.message:"Erreur"}`)}})}export{L as render};
