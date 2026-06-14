import{e as l,l as x}from"./monitoring-Bodn2y1F.js";import{t as g}from"./apex-tools-dispatch-skills-CFkP827J.js";import{toast as n}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-BJMpT1Q3.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-CTnbMBTr.js";import"./haptic-CQFg2PXZ.js";const b=[{id:"pitch-startup",label:"Pitch startup",emoji:"🚀"},{id:"business-quarterly",label:"Review trimestrielle",emoji:"📊"},{id:"lecture-academic",label:"Cours académique",emoji:"🎓"},{id:"wedding-anniversary",label:"Mariage / Anniv",emoji:"💍"},{id:"birthday-party",label:"Anniversaire fun",emoji:"🎂"},{id:"casino-training",label:"Formation casino",emoji:"🎰"},{id:"product-launch",label:"Lancement produit",emoji:"📢"}];let r=[{title:"Slide 1",content:`• Point 1
• Point 2
• Point 3`}];function q(t){function p(){return r.map((a,s)=>`<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:10px">
            <div class="ax-gs-22">
              <strong style="color:#cbd5e1;font-size:13px">Slide ${s+1}</strong>
              ${r.length>1?`<button data-rm="${s}" style="padding:4px 10px;background:#ef4444;color:#fff;border:0;border-radius:4px;font-size:12px;cursor:pointer">🗑</button>`:""}
            </div>
            <input data-slide-title="${s}" value="${l(a.title)}" placeholder="Titre slide" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:4px;color:#f1f5f9;font-size:14px;margin-bottom:6px">
            <textarea data-slide-content="${s}" rows="3" placeholder="Contenu (bullets)" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:4px;color:#f1f5f9;font-size:13px;resize:vertical">${l(a.content)}</textarea>
          </div>`).join("")}function o(){t.innerHTML=`
      <div class="ax-gs-59">
        <h1 class="ax-gs-289">📊 Studio PowerPoint</h1>
        <p class="ax-gs-199">Génère un .pptx téléchargeable avec slides personnalisés.</p>

        <label class="ax-gs-473">
          <span class="ax-gs-15">Modèle</span>
          <select id="pptx-template" class="ax-gs-464">
            ${b.map(a=>`<option value="${a.id}">${a.emoji} ${l(a.label)}</option>`).join("")}
          </select>
        </label>

        <label class="ax-gs-473">
          <span class="ax-gs-15">Titre</span>
          <input id="pptx-title" type="text" placeholder="Mon pitch Apex" class="ax-gs-463">
        </label>

        <label class="ax-gs-473">
          <span class="ax-gs-15">Auteur</span>
          <input id="pptx-author" type="text" placeholder="Kevin DESARZENS" class="ax-gs-463">
        </label>

        <label class="ax-gs-403">
          <span class="ax-gs-15">Mode</span>
          <select id="pptx-mode" class="ax-gs-463">
            <option value="pro">⚙️ Pro (sobre, business)</option>
            <option value="fun">🎉 Fun (couleurs vives)</option>
          </select>
        </label>

        <h3 class="ax-gs-294">Slides (${r.length})</h3>
        <div id="pptx-slides">${p()}</div>

        <button id="pptx-add-slide" style="width:100%;padding:10px;background:#3b82f6;color:#fff;border:0;border-radius:8px;font-size:14px;cursor:pointer;margin-bottom:16px;min-height:44px">
          ➕ Ajouter slide
        </button>

        <button id="pptx-generate" class="ax-gs-465">
          ⬇️ Générer le .pptx
        </button>

        <div id="pptx-result" class="ax-gs-256"></div>
      </div>
    `,t.querySelector("#pptx-add-slide")?.addEventListener("click",()=>{r.push({title:`Slide ${r.length+1}`,content:"• Point 1"}),o()}),t.querySelectorAll("[data-rm]").forEach(a=>{a.addEventListener("click",()=>{const s=parseInt(a.getAttribute("data-rm")??"-1",10);s>=0&&r.length>1&&(r.splice(s,1),o())})}),t.querySelector("#pptx-generate")?.addEventListener("click",async()=>{const a=t.querySelector("#pptx-template")?.value??"pitch-startup",s=t.querySelector("#pptx-title")?.value||"Présentation",d=t.querySelector("#pptx-author")?.value||"Apex",c=t.querySelector("#pptx-mode")?.value,u=r.map((e,i)=>({title:t.querySelector(`[data-slide-title="${i}"]`)?.value??`Slide ${i+1}`,content:t.querySelector(`[data-slide-content="${i}"]`)?.value??""}));n.info("Génération en cours...");try{const e=await g.generate({template:a,title:s,author:d,slides:u,mode:c}),i=t.querySelector("#pptx-result");if(!i)return;e.success?(i.innerHTML=`
            <div class="ax-gs-47">
              <p class="ax-gs-466">✅ ${l(e.filename)} (${e.slideCount} slides, ${(e.sizeBytes/1024).toFixed(1)} Ko)</p>
              <a href="${e.blobUrl}" download="${l(e.filename)}" class="ax-gs-467">⬇️ Télécharger</a>
            </div>`,n.success(`✅ ${e.filename}`)):(i.innerHTML=`<p class="ax-gs-257">❌ ${l(e.error??"Erreur")}</p>`,n.error(`❌ ${e.error??"Erreur"}`))}catch(e){x.warn("studio-pptx","failed",{err:e}),n.error(`❌ ${e instanceof Error?e.message:"Erreur"}`)}})}o()}export{q as render};
