import{l as n}from"../core/main-94Y1o88p.js";const a=[{id:"music",emoji:"🎚",label:"Studio Mix Pro",description:"Mixage 12+ pistes, EQ, reverb, BPM detect",capabilities:["mix","eq","reverb","bpm","export_wav","export_mp3"],intent_keywords:["mix","musique","beat","piste","dj","son"],premium:!0},{id:"video",emoji:"🎬",label:"Studio Vidéo CapCut-like",description:"Timeline cut, fade, captions auto, export MP4",capabilities:["cut","fade","captions","export_mp4","export_webm"],intent_keywords:["vidéo","montage","clip","film","tiktok","youtube"],premium:!0},{id:"cv",emoji:"📄",label:"Studio CV",description:"Templates pro, IA suggest, export PDF",capabilities:["template","ia_suggest","export_pdf","export_docx"],intent_keywords:["cv","curriculum","candidature","job"],premium:!1},{id:"facture",emoji:"🧾",label:"Studio Facture",description:"Devis + factures + relance auto",capabilities:["devis","facture","relance","export_pdf","tva_auto"],intent_keywords:["facture","devis","comptabilité"],premium:!1},{id:"contrat",emoji:"📋",label:"Studio Contrat",description:"CDI, NDA, prestation, modèles légaux FR/Monaco",capabilities:["template","cdi","nda","prestation","export_pdf"],intent_keywords:["contrat","nda","cdi","prestation"],premium:!0},{id:"presentation",emoji:"📊",label:"Studio Présentation",description:"Slides + pitch + animations",capabilities:["slides","pitch","animation","export_pptx","export_pdf"],intent_keywords:["présentation","slides","pitch","powerpoint"],premium:!0},{id:"clip",emoji:"🎥",label:"Studio Clip Photo→Vidéo",description:"Animer photos en vidéo + son",capabilities:["animate","soundtrack","export_mp4"],intent_keywords:["clip","animation photo","vidéo souvenir"],premium:!0},{id:"logo",emoji:"🎨",label:"Studio Logo",description:"Branding + Pantone + variantes",capabilities:["design","pantone","variantes","export_svg","export_png"],intent_keywords:["logo","branding","identité visuelle"],premium:!0},{id:"architecture",emoji:"🏗",label:"Studio Architecture",description:"RE2020, calcul surface, mélange béton, PMR",capabilities:["re2020","surface","beton","pmr","palette"],intent_keywords:["plan","maison","archi","surface","béton"],premium:!0},{id:"plant",emoji:"🌱",label:"Studio Plantes",description:"Identification + soins + arrosage",capabilities:["identify","care","watering_schedule","season"],intent_keywords:["plante","jardinage","fleurs","potager"],premium:!1},{id:"geo",emoji:"🗺",label:"Studio Géo",description:"Cartes interactives + GPS + lieux",capabilities:["map","gps","route","poi"],intent_keywords:["carte","gps","itinéraire","lieu"],premium:!1},{id:"building",emoji:"🏢",label:"Studio Bâtiment",description:"DTU, normes, dimensions standards",capabilities:["dtu","norms","dimensions","blondel"],intent_keywords:["dtu","norme","bâtiment","construction"],premium:!0},{id:"lunar",emoji:"🌙",label:"Studio Jardin Lunaire",description:"Calendrier biodynamique + phases lune",capabilities:["phase_lune","biodynamie","calendrier"],intent_keywords:["lune","biodynamie","jardinage lunaire"],premium:!1},{id:"pet",emoji:"🐾",label:"Studio Animaux",description:"Suivi santé + nutrition + RDV vétérinaire",capabilities:["sante","nutrition","rdv_veto"],intent_keywords:["animal","chien","chat","vétérinaire"],premium:!1},{id:"scan",emoji:"📷",label:"Studio Scan",description:"OCR + QR + barcode + cartes visite",capabilities:["ocr","qr","barcode","vcard"],intent_keywords:["scan","ocr","qr code","carte de visite"],premium:!1}];class l{list(){return a}byId(i){return a.find(e=>e.id===i)}matchIntent(i){const e=i.toLowerCase();let t=null;for(const s of a){let o=0;for(const d of s.intent_keywords)e.includes(d)&&o++;o>0&&(!t||o>t.score)&&(t={studio:s,score:o})}return t?.studio??null}filterByCapability(i){return a.filter(e=>e.capabilities.includes(i))}filterByPremium(i){return a.filter(e=>e.premium===i)}async render(i,e){const t=this.byId(i);if(!t){n.warn("studios",`Unknown studio: ${i}`);return}e.innerHTML=`
      <div class="ax-studio" data-studio="${t.id}">
        <header class="ax-studio-head">
          <span class="ax-studio-emoji">${t.emoji}</span>
          <h2>${t.label}</h2>
        </header>
        <p class="ax-studio-desc">${t.description}</p>
        <div class="ax-studio-caps">
          ${t.capabilities.map(s=>`<span class="ax-cap">${s}</span>`).join(" ")}
        </div>
        <div class="ax-studio-actions">
          <button class="ax-btn-primary" data-action="start">Commencer</button>
          ${t.premium?'<span class="ax-badge-premium">PRO</span>':""}
        </div>
      </div>
    `,n.info("studios",`rendered ${t.id}`)}getStats(){return{total:a.length,free:a.filter(i=>!i.premium).length,premium:a.filter(i=>i.premium).length,capabilities_total:a.reduce((i,e)=>i+e.capabilities.length,0)}}}const p=new l;function u(r){const i=a.map(e=>`
    <div class="ax-studio-card" data-studio="${e.id}">
      <div class="ax-studio-card-emoji">${e.emoji}</div>
      <div class="ax-studio-card-label">${e.label}</div>
      <div class="ax-studio-card-desc">${e.description}</div>
      ${e.premium?'<span class="ax-badge-premium">PRO</span>':""}
    </div>
  `).join("");r.innerHTML=`
    <div class="ax-studios-hub">
      <h1>🎨 Studios créatifs</h1>
      <p class="ax-subtitle">${a.length} studios pour créer, monter, designer</p>
      <div class="ax-studios-grid">${i}</div>
    </div>
  `}export{a as STUDIOS,u as render,p as studiosHub};
//# sourceMappingURL=index-BJJdeDc4.js.map
