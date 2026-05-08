import{l as f}from"./monitoring-BAiQJoxJ.js";import{c as x}from"./listener-cleanup-Y2rGGxxX.js";import{h as m}from"./haptic-BUEqXK0N.js";import{s as h}from"../core/main-C9h0PGqO.js";import{g as b}from"./apex-tools-dispatch-Dmryj_FW.js";import"./apex-kb-BrxoW6ip.js";import"./credential-patterns-Dy6Wjk7e.js";import"./multi-source-analyze-BefgB4O2.js";import"./apex-tools-registry-B37X3vXu.js";import"./voice-D_1ntYe5.js";let r=null;function M(){r?.cleanup(),r=null}function p(e){return e.replace(/[&<>"']/g,i=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[i]??i)}const l=[{id:"chien",name:"Chien",emoji:"🐕",weight_range_kg:{min:1,max:80},kcal_per_kg_normal:70,vaccinations:["CHPPiL (carré, hépatite, parvo, parainfluenza, leptospirose)","Rage","Toux du chenil","Maladie de Lyme (zone à risque)"],red_flags:["Vomissements répétés > 24h","Diarrhée sanglante","Léthargie soudaine","Refus de manger > 24h","Difficulté à respirer","Convulsions"],age_coefficient:5,base_year_offset:16},{id:"chat",name:"Chat",emoji:"🐈",weight_range_kg:{min:2,max:12},kcal_per_kg_normal:60,vaccinations:["Typhus, coryza, leucose","Rage","Chlamydiose"],red_flags:["Léthargie","Refus de boire/manger > 24h","Vomissements répétés","Mictions difficiles ou absentes","Boiterie soudaine","Respiration rapide au repos"],age_coefficient:4,base_year_offset:15},{id:"lapin",name:"Lapin",emoji:"🐇",weight_range_kg:{min:1,max:6},kcal_per_kg_normal:55,vaccinations:["Myxomatose","VHD (maladie hémorragique virale)"],red_flags:["Arrêt total alimentation > 12h (URGENT)","Pas de selles > 12h","Tête inclinée","Boiterie","Difficulté respiratoire"],age_coefficient:7,base_year_offset:0},{id:"hamster",name:"Hamster",emoji:"🐹",weight_range_kg:{min:.05,max:.2},kcal_per_kg_normal:100,vaccinations:[],red_flags:["Léthargie inhabituelle","Diarrhée (mortelle rapide)","Boiterie","Croûtes / perte poils","Difficulté respiratoire"],age_coefficient:25,base_year_offset:0},{id:"oiseau",name:"Oiseau (perroquet, canari)",emoji:"🦜",weight_range_kg:{min:.01,max:1.5},kcal_per_kg_normal:120,vaccinations:["Polyomavirus (perroquets élevage)","Maladie de Pacheco"],red_flags:["Plumes ébouriffées au repos","Fientes anormales","Respiration bouche ouverte","Repli au fond cage","Refus chant"],age_coefficient:6,base_year_offset:0},{id:"poisson",name:"Poisson (aquarium)",emoji:"🐟",weight_range_kg:{min:.001,max:.5},kcal_per_kg_normal:30,vaccinations:[],red_flags:["Nage de travers","Plaies / champignons visibles","Ouïes pâles ou rouges","Refus alimentation","Reste isolé en surface"],age_coefficient:3,base_year_offset:0}],v={sedentaire:.85,normal:1,actif:1.2,"tres-actif":1.5};function y(e,i,t){const n=l.find(s=>s.id===e);if(!n||!isFinite(i)||i<=0||i<n.weight_range_kg.min||i>n.weight_range_kg.max)return null;const a=70*Math.pow(i,.75),o=v[t];return Math.round(a*o)}function _(e,i){const t=l.find(n=>n.id===e);return!t||!isFinite(i)||i<0?null:Math.round(t.base_year_offset+i*t.age_coefficient)}function H(e){r?.cleanup(),r=x("studios-pet");const i=h.get("user")?.id??"anon";if(!b("studio.pet",e,i))return;const t=l.map(a=>`<option value="${a.id}">${a.emoji} ${p(a.name)}</option>`).join(""),n=l.map(a=>`
    <div style="background:rgba(255,255,255,0.03);border:1px solid #333;border-radius:8px;padding:10px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:24px">${a.emoji}</span>
        <strong style="color:#c9a227">${p(a.name)}</strong>
      </div>
      ${a.vaccinations.length>0?`<div style="font-size:12px;color:#ddd;margin-bottom:4px"><strong>💉 Vaccins :</strong> ${a.vaccinations.map(o=>p(o)).join(", ")}</div>`:""}
      <div style="font-size:11px;color:#ff8866"><strong>⚠ Urgence véto si :</strong> ${a.red_flags.slice(0,3).map(o=>p(o)).join(" · ")}</div>
    </div>
  `).join("");e.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:780px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">🐾 Studio Animaux</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">${l.length} espèces</span>
      </header>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Ration alimentaire</h2>
        <select id="ax-pet-species" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">${t}</select>
        <input type="number" id="ax-pet-weight" placeholder="Poids (kg)" min="0.001" step="0.01" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <select id="ax-pet-activity" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
          <option value="sedentaire">Sédentaire</option>
          <option value="normal" selected>Normal</option>
          <option value="actif">Actif</option>
          <option value="tres-actif">Très actif</option>
        </select>
        <button class="ax-btn ax-btn-primary" id="ax-pet-calc" style="min-height:44px">Calculer ration</button>
        <div id="ax-pet-out" style="margin-top:12px;color:#c9a227;font-size:14px"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Âge humain équivalent</h2>
        <input type="number" id="ax-pet-age" placeholder="Âge animal (années)" min="0" step="0.1" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <button class="ax-btn ax-btn-primary" id="ax-pet-age-btn" style="min-height:44px">Convertir</button>
        <div id="ax-pet-age-out" style="margin-top:8px;color:#c9a227"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Espèces — vaccins & alertes</h2>
        ${n}
      </div>

      <p style="font-size:11px;color:#666;text-align:center">Conseils indicatifs. Pour décision médicale, consulter un vétérinaire.</p>
      <p style="margin-top:24px;text-align:center"><a href="#studios" style="color:#c9a227">← Retour studios</a></p>
    </div>
  `,k(e)}function k(e){const i=e.querySelector("#ax-pet-calc"),t=e.querySelector("#ax-pet-out");i&&t&&r&&r.bind(i,"click",()=>{m.tap();const o=e.querySelector("#ax-pet-species")?.value??"",s=parseFloat(e.querySelector("#ax-pet-weight")?.value??""),c=e.querySelector("#ax-pet-activity")?.value??"normal",u=y(o,s,c);if(u===null){t.textContent="Poids hors plage pour cette espèce.";return}const d=l.find(g=>g.id===o);t.innerHTML=`Ration journalière estimée : <strong>${u} kcal</strong> ${d?`(${d.emoji} ${p(d.name)} · ${s} kg · ${p(c)})`:""}<br><span style="font-size:12px;color:var(--ax-text-dim)">Diviser en 2-3 repas. Adapter selon avis véto.</span>`});const n=e.querySelector("#ax-pet-age-btn"),a=e.querySelector("#ax-pet-age-out");n&&a&&r&&r.bind(n,"click",()=>{m.tap();const o=e.querySelector("#ax-pet-species")?.value??"",s=parseFloat(e.querySelector("#ax-pet-age")?.value??""),c=_(o,s);if(c===null){a.textContent="Âge invalide.";return}a.innerHTML=`Équivalent humain : <strong>≈ ${c} ans</strong>`}),f.info("studios-pet","rendered")}export{l as PET_SPECIES,_ as animalToHumanAge,y as calcDailyCalories,M as dispose,p as escapeHtml,H as render};
