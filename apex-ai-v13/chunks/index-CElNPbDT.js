import{e as l}from"./escape-html-BlQj2yEF.js";import{l as x}from"./monitoring-D2lWYrYo.js";import{r as b}from"./apex-tools-dispatch-skills-DOw4cI4G.js";import{toast as n}from"./toast-CRdbcLoc.js";import"./multi-source-analyze-Bg1HHfSC.js";import"./apex-kb-D1VtWFD9.js";import"./credential-patterns-CLzI061R.js";import"./haptic-CQFg2PXZ.js";const f=[{id:"pitch-startup",label:"Pitch startup",emoji:"🚀"},{id:"business-quarterly",label:"Review trimestrielle",emoji:"📊"},{id:"lecture-academic",label:"Cours académique",emoji:"🎓"},{id:"wedding-anniversary",label:"Mariage / Anniv",emoji:"💍"},{id:"birthday-party",label:"Anniversaire fun",emoji:"🎂"},{id:"casino-training",label:"Formation casino",emoji:"🎰"},{id:"product-launch",label:"Lancement produit",emoji:"📢"}];let i=[{title:"Slide 1",content:`• Point 1
• Point 2
• Point 3`}];function w(t){function d(){return i.map((r,o)=>`<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:10px">
            <div class="ax-gs-22">
              <strong style="color:#cbd5e1;font-size:13px">Slide ${o+1}</strong>
              ${i.length>1?`<button data-rm="${o}" style="padding:4px 10px;background:#ef4444;color:#fff;border:0;border-radius:4px;font-size:12px;cursor:pointer">🗑</button>`:""}
            </div>
            <input data-slide-title="${o}" value="${l(r.title)}" placeholder="Titre slide" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:4px;color:#f1f5f9;font-size:14px;margin-bottom:6px">
            <textarea data-slide-content="${o}" rows="3" placeholder="Contenu (bullets)" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:4px;color:#f1f5f9;font-size:13px;resize:vertical">${l(r.content)}</textarea>
          </div>`).join("")}function s(){t.innerHTML=`
      <div class="ax-gs-59">
        <h1 style="font-size:24px;margin-bottom:8px;color:#f1f5f9">📊 Studio PowerPoint</h1>
        <p style="color:#94a3b8;margin-bottom:20px">Génère un .pptx téléchargeable avec slides personnalisés.</p>

        <label style="display:block;margin-bottom:12px">
          <span class="ax-gs-15">Modèle</span>
          <select id="pptx-template" style="width:100%;padding:12px;background:#1e293b;border:1px solid #334155;border-radius:8px;color:#f1f5f9;font-size:15px">
            ${f.map(r=>`<option value="${r.id}">${r.emoji} ${l(r.label)}</option>`).join("")}
          </select>
        </label>

        <label style="display:block;margin-bottom:12px">
          <span class="ax-gs-15">Titre</span>
          <input id="pptx-title" type="text" placeholder="Mon pitch Apex" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
        </label>

        <label style="display:block;margin-bottom:12px">
          <span class="ax-gs-15">Auteur</span>
          <input id="pptx-author" type="text" placeholder="Kevin DESARZENS" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
        </label>

        <label style="display:block;margin-bottom:16px">
          <span class="ax-gs-15">Mode</span>
          <select id="pptx-mode" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
            <option value="pro">⚙️ Pro (sobre, business)</option>
            <option value="fun">🎉 Fun (couleurs vives)</option>
          </select>
        </label>

        <h3 style="font-size:16px;color:#f1f5f9;margin-bottom:12px">Slides (${i.length})</h3>
        <div id="pptx-slides">${d()}</div>

        <button id="pptx-add-slide" style="width:100%;padding:10px;background:#3b82f6;color:#fff;border:0;border-radius:8px;font-size:14px;cursor:pointer;margin-bottom:16px;min-height:44px">
          ➕ Ajouter slide
        </button>

        <button id="pptx-generate" style="width:100%;padding:14px;background:#10b981;color:#fff;border:0;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;min-height:48px">
          ⬇️ Générer le .pptx
        </button>

        <div id="pptx-result" style="margin-top:20px"></div>
      </div>
    `,t.querySelector("#pptx-add-slide")?.addEventListener("click",()=>{i.push({title:`Slide ${i.length+1}`,content:"• Point 1"}),s()}),t.querySelectorAll("[data-rm]").forEach(r=>{r.addEventListener("click",()=>{const o=parseInt(r.getAttribute("data-rm")??"-1",10);o>=0&&i.length>1&&(i.splice(o,1),s())})}),t.querySelector("#pptx-generate")?.addEventListener("click",async()=>{const r=t.querySelector("#pptx-template")?.value??"pitch-startup",o=t.querySelector("#pptx-title")?.value||"Présentation",p=t.querySelector("#pptx-author")?.value||"Apex",c=t.querySelector("#pptx-mode")?.value,u=i.map((e,a)=>({title:t.querySelector(`[data-slide-title="${a}"]`)?.value??`Slide ${a+1}`,content:t.querySelector(`[data-slide-content="${a}"]`)?.value??""}));n.info("Génération en cours...");try{const e=await b.generate({template:r,title:o,author:p,slides:u,mode:c}),a=t.querySelector("#pptx-result");if(!a)return;e.success?(a.innerHTML=`
            <div class="ax-gs-47">
              <p style="color:#10b981;font-size:14px;margin-bottom:12px">✅ ${l(e.filename)} (${e.slideCount} slides, ${(e.sizeBytes/1024).toFixed(1)} Ko)</p>
              <a href="${e.blobUrl}" download="${l(e.filename)}" style="display:inline-block;padding:12px 20px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">⬇️ Télécharger</a>
            </div>`,n.success(`✅ ${e.filename}`)):(a.innerHTML=`<p style="color:#ef4444">❌ ${l(e.error??"Erreur")}</p>`,n.error(`❌ ${e.error??"Erreur"}`))}catch(e){x.warn("studio-pptx","failed",{err:e}),n.error(`❌ ${e instanceof Error?e.message:"Erreur"}`)}})}s()}export{w as render};
