import{e as a,l as b}from"./monitoring-Dc_MPZJt.js";import{s as m}from"./apex-tools-dispatch-skills-BBsi1gWu.js";import{toast as n}from"./toast-CRdbcLoc.js";import"./multi-source-analyze-DBkIeXDV.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-DEgSiSOC.js";import"./haptic-CQFg2PXZ.js";const d=[{id:"letter-formal",label:"Lettre formelle",emoji:"✉️",fields:[{key:"sender_name",label:"Expéditeur",type:"text"},{key:"recipient_name",label:"Destinataire",type:"text"},{key:"subject",label:"Objet",type:"text"},{key:"body",label:"Corps de lettre",type:"textarea"}]},{id:"contract-cdi",label:"Contrat CDI",emoji:"📋",fields:[{key:"employer_name",label:"Employeur",type:"text"},{key:"employee_name",label:"Salarié(e)",type:"text"},{key:"job_title",label:"Poste",type:"text"},{key:"salary",label:"Salaire brut (€/mois)",type:"text"},{key:"start_date",label:"Date début",type:"text"}]},{id:"contract-nda",label:"NDA",emoji:"🤝",fields:[{key:"party_a",label:"Partie A",type:"text"},{key:"party_b",label:"Partie B",type:"text"},{key:"scope",label:"Périmètre",type:"textarea"},{key:"duration_years",label:"Durée (années)",type:"text"}]},{id:"cv-modern",label:"CV moderne",emoji:"📄",fields:[{key:"full_name",label:"Nom complet",type:"text"},{key:"title",label:"Titre/Poste",type:"text"},{key:"email",label:"Email",type:"text"},{key:"phone",label:"Téléphone",type:"text"},{key:"summary",label:"Profil",type:"textarea"},{key:"experience",label:"Expérience",type:"textarea"},{key:"education",label:"Formation",type:"textarea"},{key:"skills",label:"Compétences",type:"textarea"}]},{id:"meeting-minutes",label:"CR de réunion",emoji:"📝",fields:[{key:"date",label:"Date",type:"text"},{key:"participants",label:"Participants",type:"text"},{key:"agenda",label:"Ordre du jour",type:"textarea"},{key:"decisions",label:"Décisions",type:"textarea"},{key:"actions",label:"Actions",type:"textarea"}]},{id:"report-monthly",label:"Rapport mensuel",emoji:"📊",fields:[{key:"period",label:"Période",type:"text"},{key:"author",label:"Auteur",type:"text"},{key:"highlights",label:"Points clés",type:"textarea"},{key:"kpis",label:"Indicateurs",type:"textarea"},{key:"challenges",label:"Challenges",type:"textarea"},{key:"roadmap",label:"Roadmap",type:"textarea"}]}];function j(l){const y=d[0];function x(r){return r.fields.map(t=>t.type==="textarea"?`<label class="ax-gs-461"><span class="ax-gs-16">${a(t.label)}</span><textarea data-field="${a(t.key)}" rows="3" class="ax-gs-462"></textarea></label>`:`<label class="ax-gs-461"><span class="ax-gs-16">${a(t.label)}</span><input data-field="${a(t.key)}" type="text" class="ax-gs-463"></label>`).join("")}function p(r){l.innerHTML=`
      <div class="ax-gs-169">
        <h1 class="ax-gs-289">📄 Studio Word — Document .docx</h1>
        <p class="ax-gs-199">Génère un document Word téléchargeable. 100% client-side, aucune donnée envoyée serveur.</p>

        <label class="ax-gs-403">
          <span class="ax-gs-15">Choisir un modèle</span>
          <select id="docx-template-select" class="ax-gs-464">
            ${d.map(t=>`<option value="${t.id}" ${t.id===r.id?"selected":""}>${t.emoji} ${a(t.label)}</option>`).join("")}
          </select>
        </label>

        <div id="docx-form-fields" style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:16px;margin-bottom:16px">
          ${x(r)}
        </div>

        <button id="docx-generate" class="ax-gs-465">
          ⬇️ Générer le .docx
        </button>

        <div id="docx-result" class="ax-gs-256"></div>
      </div>
    `,l.querySelector("#docx-template-select")?.addEventListener("change",t=>{const c=t.target.value,s=d.find(o=>o.id===c);s&&p(s)}),l.querySelector("#docx-generate")?.addEventListener("click",async()=>{const c=l.querySelector("#docx-template-select")?.value??r.id,s=d.find(e=>e.id===c)??r,o={};s.fields.forEach(e=>{const i=l.querySelector(`[data-field="${e.key}"]`);o[e.key]=i?.value??""}),n.info("Génération en cours...");try{const e=await m.generate({template:s.id,data:o}),i=l.querySelector("#docx-result");if(!i)return;e.success?(i.innerHTML=`
            <div class="ax-gs-47">
              <p class="ax-gs-466">✅ ${a(e.filename)} (${(e.sizeBytes/1024).toFixed(1)} Ko)</p>
              <a href="${e.blobUrl}" download="${a(e.filename)}" class="ax-gs-467">⬇️ Télécharger</a>
            </div>`,n.success(`✅ ${e.filename}`)):(i.innerHTML=`<p class="ax-gs-257">❌ ${a(e.error??"Erreur inconnue")}</p>`,n.error(`❌ ${e.error??"Erreur"}`))}catch(e){b.warn("studio-docx","failed",{err:e}),n.error(`❌ ${e instanceof Error?e.message:"Erreur"}`)}})}p(y)}export{j as render};
