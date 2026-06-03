import{F as f,p as c,s as x}from"./monitoring-Cq_vIOf8.js";import{c as v}from"./listener-cleanup-Y2rGGxxX.js";import{g as _}from"./apex-tools-dispatch-core-B4XAlYNx.js";import{haptic as d}from"./haptic-CQFg2PXZ.js";import"./multi-source-analyze-CgbS5D-d.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-DY2-6tey.js";import"./apex-tools-dispatch-skills-CbU55X9m.js";import"./apex-tools-dispatch-data-B-te78M2.js";import"./apex-tools-dispatch-finance-DoRAfEZC.js";import"./apex-tools-dispatch-misc-DztTi3bq.js";import"./apex-tools-misc-BvT9TYn2.js";import"./apex-tools-registry-core-CQvgkOQw.js";import"./apex-tools-registry-skills-x-mAWYry.js";let o=null;function A(){o?.cleanup(),o=null}const l=[{id:"chien",name:"Chien",emoji:"🐕",weight_range_kg:{min:1,max:80},kcal_per_kg_normal:70,vaccinations:["CHPPiL (carré, hépatite, parvo, parainfluenza, leptospirose)","Rage","Toux du chenil","Maladie de Lyme (zone à risque)"],red_flags:["Vomissements répétés > 24h","Diarrhée sanglante","Léthargie soudaine","Refus de manger > 24h","Difficulté à respirer","Convulsions"],age_coefficient:5,base_year_offset:16},{id:"chat",name:"Chat",emoji:"🐈",weight_range_kg:{min:2,max:12},kcal_per_kg_normal:60,vaccinations:["Typhus, coryza, leucose","Rage","Chlamydiose"],red_flags:["Léthargie","Refus de boire/manger > 24h","Vomissements répétés","Mictions difficiles ou absentes","Boiterie soudaine","Respiration rapide au repos"],age_coefficient:4,base_year_offset:15},{id:"lapin",name:"Lapin",emoji:"🐇",weight_range_kg:{min:1,max:6},kcal_per_kg_normal:55,vaccinations:["Myxomatose","VHD (maladie hémorragique virale)"],red_flags:["Arrêt total alimentation > 12h (URGENT)","Pas de selles > 12h","Tête inclinée","Boiterie","Difficulté respiratoire"],age_coefficient:7,base_year_offset:0},{id:"hamster",name:"Hamster",emoji:"🐹",weight_range_kg:{min:.05,max:.2},kcal_per_kg_normal:100,vaccinations:[],red_flags:["Léthargie inhabituelle","Diarrhée (mortelle rapide)","Boiterie","Croûtes / perte poils","Difficulté respiratoire"],age_coefficient:25,base_year_offset:0},{id:"oiseau",name:"Oiseau (perroquet, canari)",emoji:"🦜",weight_range_kg:{min:.01,max:1.5},kcal_per_kg_normal:120,vaccinations:["Polyomavirus (perroquets élevage)","Maladie de Pacheco"],red_flags:["Plumes ébouriffées au repos","Fientes anormales","Respiration bouche ouverte","Repli au fond cage","Refus chant"],age_coefficient:6,base_year_offset:0},{id:"poisson",name:"Poisson (aquarium)",emoji:"🐟",weight_range_kg:{min:.001,max:.5},kcal_per_kg_normal:30,vaccinations:[],red_flags:["Nage de travers","Plaies / champignons visibles","Ouïes pâles ou rouges","Refus alimentation","Reste isolé en surface"],age_coefficient:3,base_year_offset:0}],h={sedentaire:.85,normal:1,actif:1.2,"tres-actif":1.5};function b(e,i,t){const s=l.find(r=>r.id===e);if(!s||!isFinite(i)||i<=0||i<s.weight_range_kg.min||i>s.weight_range_kg.max)return null;const a=70*Math.pow(i,.75),n=h[t];return Math.round(a*n)}function y(e,i){const t=l.find(s=>s.id===e);return!t||!isFinite(i)||i<0?null:Math.round(t.base_year_offset+i*t.age_coefficient)}function z(e){o?.cleanup(),o=v("studios-pet");const i=f.get("user")?.id??"anon";if(!_("studio.pet",e,i))return;const t=l.map(a=>`<option value="${a.id}">${a.emoji} ${c(a.name)}</option>`).join(""),s=l.map(a=>`
    <div style="background:rgba(255,255,255,0.03);border:1px solid #333;border-radius:8px;padding:10px;margin-bottom:8px">
      <div class="ax-gs-77">
        <span class="ax-gs-172">${a.emoji}</span>
        <strong class="ax-gs-266">${c(a.name)}</strong>
      </div>
      ${a.vaccinations.length>0?`<div style="font-size:12px;color:#ddd;margin-bottom:4px"><strong>💉 Vaccins :</strong> ${a.vaccinations.map(n=>c(n)).join(", ")}</div>`:""}
      <div style="font-size:11px;color:#ff8866"><strong>⚠ Urgence véto si :</strong> ${a.red_flags.slice(0,3).map(n=>c(n)).join(" · ")}</div>
    </div>
  `).join("");e.innerHTML=`
    <div class="ax-page ax-gs-451">
      <header class="ax-gs-210">
        <h1 class="ax-gs-333">🐾 Studio Animaux</h1>
        <span class="ax-gs-3">${l.length} espèces</span>
      </header>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Ration alimentaire</h2>
        <select id="ax-pet-species" class="ax-gs-455">${t}</select>
        <input type="number" id="ax-pet-weight" aria-label="Poids de l'animal en kilogrammes" placeholder="Poids (kg)" min="0.001" step="0.01" class="ax-gs-455">
        <select id="ax-pet-activity" class="ax-gs-455">
          <option value="sedentaire">Sédentaire</option>
          <option value="normal" selected>Normal</option>
          <option value="actif">Actif</option>
          <option value="tres-actif">Très actif</option>
        </select>
        <button class="ax-btn ax-btn-primary ax-gs-401" id="ax-pet-calc">Calculer ration</button>
        <div id="ax-pet-out" style="margin-top:12px;color:#c9a227;font-size:14px"></div>
      </div>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Âge humain équivalent</h2>
        <input type="number" id="ax-pet-age" aria-label="Âge de l'animal en années" placeholder="Âge animal (années)" min="0" step="0.1" class="ax-gs-455">
        <button class="ax-btn ax-btn-primary ax-gs-401" id="ax-pet-age-btn">Convertir</button>
        <div id="ax-pet-age-out" class="ax-gs-253"></div>
      </div>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Espèces — vaccins & alertes</h2>
        ${s}
      </div>

      <p class="ax-gs-469">Conseils indicatifs. Pour décision médicale, consulter un vétérinaire.</p>
      <p class="ax-gs-212"><a href="#studios" class="ax-gs-198">← Retour studios</a></p>
    </div>
  `,k(e)}function k(e){const i=e.querySelector("#ax-pet-calc"),t=e.querySelector("#ax-pet-out");i&&t&&o&&o.bind(i,"click",()=>{d.tap();const n=e.querySelector("#ax-pet-species")?.value??"",r=parseFloat(e.querySelector("#ax-pet-weight")?.value??""),p=e.querySelector("#ax-pet-activity")?.value??"normal",u=b(n,r,p);if(u===null){t.textContent="Poids hors plage pour cette espèce.";return}const g=l.find(m=>m.id===n);t.innerHTML=`Ration journalière estimée : <strong>${u} kcal</strong> ${g?`(${g.emoji} ${c(g.name)} · ${r} kg · ${c(p)})`:""}<br><span class="ax-gs-5">Diviser en 2-3 repas. Adapter selon avis véto.</span>`});const s=e.querySelector("#ax-pet-age-btn"),a=e.querySelector("#ax-pet-age-out");s&&a&&o&&o.bind(s,"click",()=>{d.tap();const n=e.querySelector("#ax-pet-species")?.value??"",r=parseFloat(e.querySelector("#ax-pet-age")?.value??""),p=y(n,r);if(p===null){a.textContent="Âge invalide.";return}a.textContent="",a.append("Équivalent humain : ");const u=document.createElement("strong");u.textContent=`≈ ${p} ans`,a.append(u)}),x.info("studios-pet","rendered")}export{l as PET_SPECIES,y as animalToHumanAge,b as calcDailyCalories,A as dispose,z as render};
