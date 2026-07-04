import{g as m,e as s,_ as b,l as u}from"./monitoring-CFQVdAR4.js";import"./multi-source-analyze-2o-Ko5KY.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-K0odi1bp.js";const a=[{id:"music",emoji:"🎚",label:"Studio Mix Pro",description:"Mixage 12+ pistes, EQ, reverb, BPM detect",capabilities:["mix","eq","reverb","bpm","export_wav","export_mp3"],intent_keywords:["mix","musique","beat","piste","dj","son"],premium:!0},{id:"video",emoji:"🎬",label:"Studio Vidéo CapCut-like",description:"Timeline cut, fade, captions auto, export MP4",capabilities:["cut","fade","captions","export_mp4","export_webm"],intent_keywords:["vidéo","montage","clip","film","tiktok","youtube"],premium:!0},{id:"cv",emoji:"📄",label:"Studio CV",description:"Templates pro, IA suggest, export PDF",capabilities:["template","ia_suggest","export_pdf","export_docx"],intent_keywords:["cv","curriculum","candidature","job"],premium:!1},{id:"facture",emoji:"🧾",label:"Studio Facture",description:"Devis + factures + relance auto",capabilities:["devis","facture","relance","export_pdf","tva_auto"],intent_keywords:["facture","devis","comptabilité"],premium:!1},{id:"contrat",emoji:"📋",label:"Studio Contrat",description:"CDI, NDA, prestation, modèles légaux FR/Monaco",capabilities:["template","cdi","nda","prestation","export_pdf"],intent_keywords:["contrat","nda","cdi","prestation"],premium:!0},{id:"presentation",emoji:"📊",label:"Studio Présentation",description:"Slides + pitch + animations",capabilities:["slides","pitch","animation","export_pptx","export_pdf"],intent_keywords:["présentation","slides","pitch","powerpoint"],premium:!0},{id:"clip",emoji:"🎥",label:"Studio Clip Photo→Vidéo",description:"Animer photos en vidéo + son",capabilities:["animate","soundtrack","export_mp4"],intent_keywords:["clip","animation photo","vidéo souvenir"],premium:!0},{id:"logo",emoji:"🎨",label:"Studio Logo",description:"Branding + Pantone + variantes",capabilities:["design","pantone","variantes","export_svg","export_png"],intent_keywords:["logo","branding","identité visuelle"],premium:!0},{id:"architecture",emoji:"🏗",label:"Studio Architecture",description:"RE2020, calcul surface, mélange béton, PMR",capabilities:["re2020","surface","beton","pmr","palette"],intent_keywords:["plan","maison","archi","surface","béton"],premium:!0},{id:"plant",emoji:"🌱",label:"Studio Plantes",description:"Identification + soins + arrosage",capabilities:["identify","care","watering_schedule","season"],intent_keywords:["plante","jardinage","fleurs","potager"],premium:!1},{id:"geo",emoji:"🗺",label:"Studio Géo",description:"Cartes interactives + GPS + lieux",capabilities:["map","gps","route","poi"],intent_keywords:["carte","gps","itinéraire","lieu"],premium:!1},{id:"building",emoji:"🏢",label:"Studio Bâtiment",description:"DTU, normes, dimensions standards",capabilities:["dtu","norms","dimensions","blondel"],intent_keywords:["dtu","norme","bâtiment","construction"],premium:!0},{id:"lunar",emoji:"🌙",label:"Studio Jardin Lunaire",description:"Calendrier biodynamique + phases lune",capabilities:["phase_lune","biodynamie","calendrier"],intent_keywords:["lune","biodynamie","jardinage lunaire"],premium:!1},{id:"pet",emoji:"🐾",label:"Studio Animaux",description:"Suivi santé + nutrition + RDV vétérinaire",capabilities:["sante","nutrition","rdv_veto"],intent_keywords:["animal","chien","chat","vétérinaire"],premium:!1},{id:"scan",emoji:"📷",label:"Studio Scan",description:"OCR + QR + barcode + cartes visite",capabilities:["ocr","qr","barcode","vcard"],intent_keywords:["scan","ocr","qr code","carte de visite"],premium:!1}];class x{list(){return a}byId(e){return a.find(t=>t.id===e)}matchIntent(e){const t=e.toLowerCase();let i=null;for(const o of a){let r=0;for(const l of o.intent_keywords)t.includes(l)&&r++;r>0&&(!i||r>i.score)&&(i={studio:o,score:r})}return i?.studio??null}filterByCapability(e){return a.filter(t=>t.capabilities.includes(e))}filterByPremium(e){return a.filter(t=>t.premium===e)}async render(e,t){const i=this.byId(e);if(!i){u.warn("studios",`Unknown studio: ${e}`);return}t.innerHTML=`
      <div class="ax-studio" data-studio="${m(i.id)}">
        <header class="ax-studio-head">
          <span class="ax-studio-emoji">${s(i.emoji)}</span>
          <h2>${s(i.label)}</h2>
        </header>
        <p class="ax-studio-desc">${s(i.description)}</p>
        <div class="ax-studio-caps">
          ${i.capabilities.map(o=>`<span class="ax-cap">${s(o)}</span>`).join(" ")}
        </div>
        <div class="ax-studio-actions">
          <button class="ax-btn-primary" data-action="start">Commencer</button>
          ${i.premium?'<span class="ax-badge-premium">PRO</span>':""}
        </div>
      </div>
    `,u.info("studios",`rendered ${i.id}`)}getStats(){return{total:a.length,free:a.filter(e=>!e.premium).length,premium:a.filter(e=>e.premium).length,capabilities_total:a.reduce((e,t)=>e+t.capabilities.length,0)}}}const h=new x;function y(d){const e=a.map(i=>`
    <div class="ax-studio-card ax-gs-416" data-studio="${m(i.id)}">
      <div class="ax-studio-card-emoji ax-gs-192">${s(i.emoji)}</div>
      <div class="ax-studio-card-label ax-gs-238">${s(i.label)}</div>
      <div class="ax-studio-card-desc ax-gs-239">${s(i.description)}</div>
      ${i.premium?'<span class="ax-badge-premium" style="background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;margin-top:8px;display:inline-block">PRO</span>':""}
    </div>
  `).join("");d.innerHTML=`
    <div class="ax-studios-hub ax-gs-376">
      <h1 class="ax-gs-266">🎨 Studios créatifs</h1>
      <p class="ax-subtitle ax-gs-226">${a.length} studios pour créer, monter, designer</p>
      <div class="ax-studios-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-top:16px">${e}</div>
      <div id="ax-studio-detail" class="ax-gs-218"></div>
      <p class="ax-gs-212"><a href="#chat" class="ax-gs-198">← Retour chat</a></p>
    </div>
  `;const t={music:"studio-music",video:"studio-video",cv:"studio-cv",facture:"studio-invoice",contrat:"studio-contract",presentation:"studio-presentation",clip:"studio-clip",logo:"studio-logo",architecture:"studio-architecture",plant:"studio-plant",geo:"studio-geo",building:"studio-building",lunar:"studio-lunar",pet:"studio-pet",scan:"studio-scan"};d.querySelectorAll(".ax-studio-card").forEach(i=>{i.addEventListener("click",()=>{const o=i.dataset.studio;if(!o)return;const r=t[o];if(r){window.location.hash=r;return}(async()=>{const{toast:l}=await b(async()=>{const{toast:c}=await import("./toast-BCPNzfMv.js");return{toast:c}},[],import.meta.url),n=a.find(c=>c.id===o);if(!n)return;l.info(`${n.emoji} ${n.label} — ouverture Sprint 5`);const p=d.querySelector("#ax-studio-detail");p&&(p.innerHTML=`
            <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:24px;text-align:center">
              <div class="ax-gs-171">${s(n.emoji)}</div>
              <h2 style="color:#c9a227;margin:8px 0">${s(n.label)}</h2>
              <p style="color:var(--ax-text-dim);margin:0">${s(n.description)}</p>
              <p style="margin-top:16px;font-size:13px;color:#888">Studio en cours de développement (Sprint 5).</p>
            </div>
          `)})()})})}export{a as STUDIOS,y as render,h as studiosHub};
