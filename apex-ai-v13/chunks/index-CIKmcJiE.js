import{e as r,l as m}from"./monitoring-DKvm4AF3.js";import{u as g}from"./apex-tools-dispatch-skills-DRfHCn10.js";import{toast as l}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-4KwHUxnT.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-D5AC3Kxi.js";import"./haptic-CQFg2PXZ.js";const x=[{id:"invoice",label:"Facture",emoji:"💰"},{id:"quote",label:"Devis",emoji:"📋"},{id:"contract-signed",label:"Contrat à signer",emoji:"✍️"},{id:"report-standard",label:"Rapport",emoji:"📊"},{id:"certificate",label:"Certificat",emoji:"🏆"},{id:"receipt",label:"Reçu",emoji:"🧾"},{id:"custom",label:"Texte libre",emoji:"📝"}];function T(a){a.innerHTML=`
    <div class="ax-gs-169">
      <h1 class="ax-gs-289">📑 Studio PDF</h1>
      <p class="ax-gs-199">Génère un PDF pro téléchargeable.</p>

      <label class="ax-gs-403">
        <span class="ax-gs-15">Type de document</span>
        <select id="pdf-template" class="ax-gs-464">
          ${x.map(t=>`<option value="${t.id}">${t.emoji} ${r(t.label)}</option>`).join("")}
        </select>
      </label>

      <div class="ax-gs-113">
        <label class="ax-gs-472">
          <span class="ax-gs-16">N° / Référence</span>
          <input id="pdf-number" type="text" placeholder="F-2026-001" class="ax-gs-463">
        </label>
        <label class="ax-gs-472">
          <span class="ax-gs-16">Client / Destinataire</span>
          <input id="pdf-client" type="text" class="ax-gs-463">
        </label>
        <label class="ax-gs-472">
          <span class="ax-gs-16">Adresse client</span>
          <input id="pdf-address" type="text" class="ax-gs-463">
        </label>
        <label class="ax-gs-472">
          <span class="ax-gs-16">Lignes (1 par ligne : "description | qty | prix HT")</span>
          <textarea id="pdf-items" rows="4" placeholder="Service A | 1 | 500&#10;Service B | 2 | 250" class="ax-gs-462"></textarea>
        </label>
        <label class="ax-gs-472">
          <span class="ax-gs-16">Watermark (optionnel)</span>
          <select id="pdf-watermark" class="ax-gs-463">
            <option value="">Aucun</option>
            <option value="BROUILLON">BROUILLON</option>
            <option value="CONFIDENTIEL">CONFIDENTIEL</option>
          </select>
        </label>
      </div>

      <button id="pdf-generate" class="ax-gs-465">
        ⬇️ Générer le PDF
      </button>

      <div id="pdf-result" class="ax-gs-256"></div>
    </div>
  `,a.querySelector("#pdf-generate")?.addEventListener("click",async()=>{const t=a.querySelector("#pdf-template")?.value??"invoice",n=a.querySelector("#pdf-number")?.value??"",c=a.querySelector("#pdf-client")?.value??"",p=a.querySelector("#pdf-address")?.value??"",o=a.querySelector("#pdf-items")?.value??"",i=a.querySelector("#pdf-watermark")?.value??"",d=o.split(`
`).map(e=>e.trim()).filter(Boolean).map(e=>{const s=e.split("|").map(u=>u.trim());return{description:s[0]??"",quantity:parseFloat(s[1]??"1")||1,unit_price:parseFloat(s[2]??"0")||0}});l.info("Génération en cours...");try{const e=await g.generate({template:t,data:{number:n,client_name:c,client_address:p,items:d,date:new Date().toLocaleDateString("fr-FR")},...i?{options:{watermark:i}}:{}}),s=a.querySelector("#pdf-result");if(!s)return;e.success?(s.innerHTML=`
          <div class="ax-gs-47">
            <p class="ax-gs-466">✅ ${r(e.filename)} (${e.pageCount} page${e.pageCount>1?"s":""}, ${(e.sizeBytes/1024).toFixed(1)} Ko)</p>
            <a href="${e.blobUrl}" download="${r(e.filename)}" class="ax-gs-467">⬇️ Télécharger</a>
          </div>`,l.success(`✅ ${e.filename}`)):(s.innerHTML=`<p class="ax-gs-257">❌ ${r(e.error??"Erreur")}</p>`,l.error(`❌ ${e.error??"Erreur"}`))}catch(e){m.warn("studio-pdf","failed",{err:e}),l.error(`❌ ${e instanceof Error?e.message:"Erreur"}`)}})}export{T as render};
