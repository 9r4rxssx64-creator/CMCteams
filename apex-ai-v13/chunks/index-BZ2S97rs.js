const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./toast-Dgg9rcIP.js","./haptic-BUEqXK0N.js"])))=>i.map(i=>d[i]);
import{_ as u}from"./apex-kb-CZDvauou.js";import{l as c}from"./monitoring-WiO5ZBU9.js";import"./apex-tools-registry-DPQHcZUW.js";import"./credential-patterns-DqicUg9o.js";const a=[{id:"music",emoji:"🎚",label:"Studio Mix Pro",description:"Mixage 12+ pistes, EQ, reverb, BPM detect",capabilities:["mix","eq","reverb","bpm","export_wav","export_mp3"],intent_keywords:["mix","musique","beat","piste","dj","son"],premium:!0},{id:"video",emoji:"🎬",label:"Studio Vidéo CapCut-like",description:"Timeline cut, fade, captions auto, export MP4",capabilities:["cut","fade","captions","export_mp4","export_webm"],intent_keywords:["vidéo","montage","clip","film","tiktok","youtube"],premium:!0},{id:"cv",emoji:"📄",label:"Studio CV",description:"Templates pro, IA suggest, export PDF",capabilities:["template","ia_suggest","export_pdf","export_docx"],intent_keywords:["cv","curriculum","candidature","job"],premium:!1},{id:"facture",emoji:"🧾",label:"Studio Facture",description:"Devis + factures + relance auto",capabilities:["devis","facture","relance","export_pdf","tva_auto"],intent_keywords:["facture","devis","comptabilité"],premium:!1},{id:"contrat",emoji:"📋",label:"Studio Contrat",description:"CDI, NDA, prestation, modèles légaux FR/Monaco",capabilities:["template","cdi","nda","prestation","export_pdf"],intent_keywords:["contrat","nda","cdi","prestation"],premium:!0},{id:"presentation",emoji:"📊",label:"Studio Présentation",description:"Slides + pitch + animations",capabilities:["slides","pitch","animation","export_pptx","export_pdf"],intent_keywords:["présentation","slides","pitch","powerpoint"],premium:!0},{id:"clip",emoji:"🎥",label:"Studio Clip Photo→Vidéo",description:"Animer photos en vidéo + son",capabilities:["animate","soundtrack","export_mp4"],intent_keywords:["clip","animation photo","vidéo souvenir"],premium:!0},{id:"logo",emoji:"🎨",label:"Studio Logo",description:"Branding + Pantone + variantes",capabilities:["design","pantone","variantes","export_svg","export_png"],intent_keywords:["logo","branding","identité visuelle"],premium:!0},{id:"architecture",emoji:"🏗",label:"Studio Architecture",description:"RE2020, calcul surface, mélange béton, PMR",capabilities:["re2020","surface","beton","pmr","palette"],intent_keywords:["plan","maison","archi","surface","béton"],premium:!0},{id:"plant",emoji:"🌱",label:"Studio Plantes",description:"Identification + soins + arrosage",capabilities:["identify","care","watering_schedule","season"],intent_keywords:["plante","jardinage","fleurs","potager"],premium:!1},{id:"geo",emoji:"🗺",label:"Studio Géo",description:"Cartes interactives + GPS + lieux",capabilities:["map","gps","route","poi"],intent_keywords:["carte","gps","itinéraire","lieu"],premium:!1},{id:"building",emoji:"🏢",label:"Studio Bâtiment",description:"DTU, normes, dimensions standards",capabilities:["dtu","norms","dimensions","blondel"],intent_keywords:["dtu","norme","bâtiment","construction"],premium:!0},{id:"lunar",emoji:"🌙",label:"Studio Jardin Lunaire",description:"Calendrier biodynamique + phases lune",capabilities:["phase_lune","biodynamie","calendrier"],intent_keywords:["lune","biodynamie","jardinage lunaire"],premium:!1},{id:"pet",emoji:"🐾",label:"Studio Animaux",description:"Suivi santé + nutrition + RDV vétérinaire",capabilities:["sante","nutrition","rdv_veto"],intent_keywords:["animal","chien","chat","vétérinaire"],premium:!1},{id:"scan",emoji:"📷",label:"Studio Scan",description:"OCR + QR + barcode + cartes visite",capabilities:["ocr","qr","barcode","vcard"],intent_keywords:["scan","ocr","qr code","carte de visite"],premium:!1}];class m{list(){return a}byId(e){return a.find(t=>t.id===e)}matchIntent(e){const t=e.toLowerCase();let i=null;for(const o of a){let r=0;for(const d of o.intent_keywords)t.includes(d)&&r++;r>0&&(!i||r>i.score)&&(i={studio:o,score:r})}return i?.studio??null}filterByCapability(e){return a.filter(t=>t.capabilities.includes(e))}filterByPremium(e){return a.filter(t=>t.premium===e)}async render(e,t){const i=this.byId(e);if(!i){c.warn("studios",`Unknown studio: ${e}`);return}t.innerHTML=`
      <div class="ax-studio" data-studio="${i.id}">
        <header class="ax-studio-head">
          <span class="ax-studio-emoji">${i.emoji}</span>
          <h2>${i.label}</h2>
        </header>
        <p class="ax-studio-desc">${i.description}</p>
        <div class="ax-studio-caps">
          ${i.capabilities.map(o=>`<span class="ax-cap">${o}</span>`).join(" ")}
        </div>
        <div class="ax-studio-actions">
          <button class="ax-btn-primary" data-action="start">Commencer</button>
          ${i.premium?'<span class="ax-badge-premium">PRO</span>':""}
        </div>
      </div>
    `,c.info("studios",`rendered ${i.id}`)}getStats(){return{total:a.length,free:a.filter(e=>!e.premium).length,premium:a.filter(e=>e.premium).length,capabilities_total:a.reduce((e,t)=>e+t.capabilities.length,0)}}}const f=new m;function y(n){const e=a.map(i=>`
    <div class="ax-studio-card" data-studio="${i.id}" style="cursor:pointer;background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;transition:transform 0.15s">
      <div class="ax-studio-card-emoji" style="font-size:36px">${i.emoji}</div>
      <div class="ax-studio-card-label" style="font-weight:700;color:#c9a227;margin-top:8px">${i.label}</div>
      <div class="ax-studio-card-desc" style="font-size:12px;color:var(--ax-text-dim);margin-top:4px">${i.description}</div>
      ${i.premium?'<span class="ax-badge-premium" style="background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;margin-top:8px;display:inline-block">PRO</span>':""}
    </div>
  `).join("");n.innerHTML=`
    <div class="ax-studios-hub" style="padding:16px;max-width:900px;margin:0 auto">
      <h1 style="color:#c9a227">🎨 Studios créatifs</h1>
      <p class="ax-subtitle" style="color:var(--ax-text-dim)">${a.length} studios pour créer, monter, designer</p>
      <div class="ax-studios-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-top:16px">${e}</div>
      <div id="ax-studio-detail" style="margin-top:24px"></div>
      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `;const t={music:"studio-music",video:"studio-video",cv:"studio-cv",facture:"studio-invoice",contrat:"studio-contract"};n.querySelectorAll(".ax-studio-card").forEach(i=>{i.addEventListener("click",()=>{const o=i.dataset.studio;if(!o)return;const r=t[o];if(r){window.location.hash=r;return}(async()=>{const{toast:d}=await u(async()=>{const{toast:l}=await import("./toast-Dgg9rcIP.js");return{toast:l}},__vite__mapDeps([0,1]),import.meta.url),s=a.find(l=>l.id===o);if(!s)return;d.info(`${s.emoji} ${s.label} — ouverture Sprint 5`);const p=n.querySelector("#ax-studio-detail");p&&(p.innerHTML=`
            <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:24px;text-align:center">
              <div style="font-size:64px">${s.emoji}</div>
              <h2 style="color:#c9a227;margin:8px 0">${s.label}</h2>
              <p style="color:var(--ax-text-dim);margin:0">${s.description}</p>
              <p style="margin-top:16px;font-size:13px;color:#888">Studio en cours de développement (Sprint 5).</p>
            </div>
          `)})()})})}export{a as STUDIOS,y as render,f as studiosHub};
//# sourceMappingURL=index-BZ2S97rs.js.map
