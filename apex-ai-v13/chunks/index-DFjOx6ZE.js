import{l as u}from"./monitoring-3uBGKGRH.js";import{p as x}from"./apex-tools-dispatch-D1QTI3JF.js";import{toast as a}from"./toast-ClsF1KRZ.js";import"./apex-kb-GTRJxfuo.js";import"./credential-patterns-guxfirLX.js";import"./multi-source-analyze-DW-C8JwG.js";import"./apex-tools-registry-YcGRMlO2.js";import"./voice-z-KGl62X.js";import"./haptic-CQFg2PXZ.js";function l(t){return t.replace(/[&<>"']/g,p=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[p]??p)}const f=[{id:"pitch-startup",label:"Pitch startup",emoji:"🚀"},{id:"business-quarterly",label:"Review trimestrielle",emoji:"📊"},{id:"lecture-academic",label:"Cours académique",emoji:"🎓"},{id:"wedding-anniversary",label:"Mariage / Anniv",emoji:"💍"},{id:"birthday-party",label:"Anniversaire fun",emoji:"🎂"},{id:"casino-training",label:"Formation casino",emoji:"🎰"},{id:"product-launch",label:"Lancement produit",emoji:"📢"}];let i=[{title:"Slide 1",content:`• Point 1
• Point 2
• Point 3`}];function z(t){function p(){return i.map((o,r)=>`<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <strong style="color:#cbd5e1;font-size:13px">Slide ${r+1}</strong>
              ${i.length>1?`<button data-rm="${r}" style="padding:4px 10px;background:#ef4444;color:#fff;border:0;border-radius:4px;font-size:12px;cursor:pointer">🗑</button>`:""}
            </div>
            <input data-slide-title="${r}" value="${l(o.title)}" placeholder="Titre slide" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:4px;color:#f1f5f9;font-size:14px;margin-bottom:6px">
            <textarea data-slide-content="${r}" rows="3" placeholder="Contenu (bullets)" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:4px;color:#f1f5f9;font-size:13px;resize:vertical">${l(o.content)}</textarea>
          </div>`).join("")}function d(){t.innerHTML=`
      <div style="max-width:760px;margin:0 auto;padding:20px">
        <h1 style="font-size:24px;margin-bottom:8px;color:#f1f5f9">📊 Studio PowerPoint</h1>
        <p style="color:#94a3b8;margin-bottom:20px">Génère un .pptx téléchargeable avec slides personnalisés.</p>

        <label style="display:block;margin-bottom:12px">
          <span style="font-size:13px;color:#cbd5e1;display:block;margin-bottom:6px;font-weight:600">Modèle</span>
          <select id="pptx-template" style="width:100%;padding:12px;background:#1e293b;border:1px solid #334155;border-radius:8px;color:#f1f5f9;font-size:15px">
            ${f.map(o=>`<option value="${o.id}">${o.emoji} ${l(o.label)}</option>`).join("")}
          </select>
        </label>

        <label style="display:block;margin-bottom:12px">
          <span style="font-size:13px;color:#cbd5e1;display:block;margin-bottom:6px;font-weight:600">Titre</span>
          <input id="pptx-title" type="text" placeholder="Mon pitch Apex" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
        </label>

        <label style="display:block;margin-bottom:12px">
          <span style="font-size:13px;color:#cbd5e1;display:block;margin-bottom:6px;font-weight:600">Auteur</span>
          <input id="pptx-author" type="text" placeholder="Kevin DESARZENS" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
        </label>

        <label style="display:block;margin-bottom:16px">
          <span style="font-size:13px;color:#cbd5e1;display:block;margin-bottom:6px;font-weight:600">Mode</span>
          <select id="pptx-mode" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
            <option value="pro">⚙️ Pro (sobre, business)</option>
            <option value="fun">🎉 Fun (couleurs vives)</option>
          </select>
        </label>

        <h3 style="font-size:16px;color:#f1f5f9;margin-bottom:12px">Slides (${i.length})</h3>
        <div id="pptx-slides">${p()}</div>

        <button id="pptx-add-slide" style="width:100%;padding:10px;background:#3b82f6;color:#fff;border:0;border-radius:8px;font-size:14px;cursor:pointer;margin-bottom:16px;min-height:44px">
          ➕ Ajouter slide
        </button>

        <button id="pptx-generate" style="width:100%;padding:14px;background:#10b981;color:#fff;border:0;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;min-height:48px">
          ⬇️ Générer le .pptx
        </button>

        <div id="pptx-result" style="margin-top:20px"></div>
      </div>
    `,t.querySelector("#pptx-add-slide")?.addEventListener("click",()=>{i.push({title:`Slide ${i.length+1}`,content:"• Point 1"}),d()}),t.querySelectorAll("[data-rm]").forEach(o=>{o.addEventListener("click",()=>{const r=parseInt(o.getAttribute("data-rm")??"-1",10);r>=0&&i.length>1&&(i.splice(r,1),d())})}),t.querySelector("#pptx-generate")?.addEventListener("click",async()=>{const o=t.querySelector("#pptx-template")?.value??"pitch-startup",r=t.querySelector("#pptx-title")?.value||"Présentation",s=t.querySelector("#pptx-author")?.value||"Apex",c=t.querySelector("#pptx-mode")?.value,b=i.map((e,n)=>({title:t.querySelector(`[data-slide-title="${n}"]`)?.value??`Slide ${n+1}`,content:t.querySelector(`[data-slide-content="${n}"]`)?.value??""}));a.info("Génération en cours...");try{const e=await x.generate({template:o,title:r,author:s,slides:b,mode:c}),n=t.querySelector("#pptx-result");if(!n)return;e.success?(n.innerHTML=`
            <div style="background:#0f172a;border:1px solid #10b981;border-radius:12px;padding:16px;text-align:center">
              <p style="color:#10b981;font-size:14px;margin-bottom:12px">✅ ${l(e.filename)} (${e.slideCount} slides, ${(e.sizeBytes/1024).toFixed(1)} Ko)</p>
              <a href="${e.blobUrl}" download="${l(e.filename)}" style="display:inline-block;padding:12px 20px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">⬇️ Télécharger</a>
            </div>`,a.success(`✅ ${e.filename}`)):(n.innerHTML=`<p style="color:#ef4444">❌ ${l(e.error??"Erreur")}</p>`,a.error(`❌ ${e.error??"Erreur"}`))}catch(e){u.warn("studio-pptx","failed",{err:e}),a.error(`❌ ${e instanceof Error?e.message:"Erreur"}`)}})}d()}export{z as render};
