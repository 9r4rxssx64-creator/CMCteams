import{l as c}from"../core/main-dEBR7riU.js";const a=[{id:"cuisine",emoji:"🍳",label:"Cuisine Pro",description:"10+ recettes, 22 cuissons, 14 allergènes INCO, calories",capabilities:["recettes","cuissons","allergenes_inco","calories","conversions"],intent_keywords:["recette","cuisson","ingrédient","cuisine","allergène","calorie"],sources_autoritaires:["Règlement INCO 1169/2011","ANSES","CIQUAL"],prudence_disclaimer:!1,premium:!1},{id:"medical",emoji:"💊",label:"Medical Pro",description:"Vidal OTC, IMC, métabolisme, urgences SAMU",capabilities:["vidal_otc","imc","metabolisme","urgences","vaccins"],intent_keywords:["médical","vidal","posologie","symptôme","maladie","imc"],sources_autoritaires:["Vidal","ANSM","Has-sante","Ameli"],prudence_disclaimer:!0,premium:!0},{id:"finance",emoji:"💰",label:"Finance Pro",description:"IR FR 2026, PFU 30%, plus-values immo, crédit immo, Monaco fiscal",capabilities:["ir_fr","pfu","pv_immo","pv_mobilier","credit_immo","monaco_fiscal"],intent_keywords:["impôt","IR","crédit","IBAN","paiement","fiscalité","plus-value"],sources_autoritaires:["Impôts.gouv","Service-public.fr","Légimonaco"],prudence_disclaimer:!0,premium:!0},{id:"legal",emoji:"⚖️",label:"Legal Pro",description:"18+ codes français + jurisprudence Cassation/CE/CJUE/CEDH + Monaco",capabilities:["codes_fr","jurisprudence","monaco","calculs_indem","prescription"],intent_keywords:["loi","article","tribunal","code","préfecture","juridique","légal"],sources_autoritaires:["Légifrance","Légimonaco","Curia","CEDH","Cassation","Conseil d'État"],prudence_disclaimer:!0,premium:!0},{id:"translator",emoji:"🌐",label:"Translator Pro",description:"30+ langues + mode interprète temps réel",capabilities:["translate","interprete_live","detect_lang","tts","stt"],intent_keywords:["traduire","translate","anglais","italien","allemand","espagnol","interprète"],sources_autoritaires:["DeepL","Google Translate"],prudence_disclaimer:!1,premium:!0},{id:"business",emoji:"💼",label:"Business Pro",description:"Plan de business, KPIs, MRR, churn analysis",capabilities:["business_plan","kpis","mrr","churn","cac_ltv"],intent_keywords:["business plan","kpi","mrr","churn","startup","entreprise"],sources_autoritaires:["Bpifrance","INSEE"],prudence_disclaimer:!1,premium:!0},{id:"education",emoji:"🎓",label:"Éducation Pro",description:"Programmes scolaires FR, méthodes pédagogiques, exercices",capabilities:["programmes","methodes","exercices","corrections","evaluation"],intent_keywords:["école","programme scolaire","éducation","pédagogie","apprendre"],sources_autoritaires:["Eduscol","Éducation Nationale"],prudence_disclaimer:!1,premium:!1},{id:"certifications",emoji:"📜",label:"Certifications Pro",description:"Préparation certifs (PMP, AWS, Google Cloud, ISTQB, etc.)",capabilities:["quiz","mock_exam","flashcards","planning_revision"],intent_keywords:["certification","pmp","aws","google cloud","examen","quiz"],sources_autoritaires:["PMI.org","AWS Training","Google Cloud Skills Boost"],prudence_disclaimer:!1,premium:!0}];class d{list(){return a}byId(r){return a.find(e=>e.id===r)}matchIntent(r){const e=r.toLowerCase();let i=null;for(const s of a){let o=0;for(const n of s.intent_keywords)e.includes(n)&&o++;o>0&&(!i||o>i.score)&&(i={mod:s,score:o})}return i?.mod??null}filterByPremium(r){return a.filter(e=>e.premium===r)}async render(r,e){const i=this.byId(r);if(!i){c.warn("pro-modules",`Unknown module: ${r}`);return}const s=i.sources_autoritaires.map(l=>`<span class="ax-source">${l}</span>`).join(" "),o=i.capabilities.map(l=>`<span class="ax-cap">${l}</span>`).join(" "),n=i.prudence_disclaimer?'<p class="ax-disclaimer">⚠️ Information indicative. Pour décision importante, consulter un professionnel qualifié.</p>':"";e.innerHTML=`
      <div class="ax-pro-module" data-module="${i.id}">
        <header class="ax-pro-head">
          <span class="ax-pro-emoji">${i.emoji}</span>
          <h2>${i.label}</h2>
          ${i.premium?'<span class="ax-badge-premium">PRO</span>':""}
        </header>
        <p class="ax-pro-desc">${i.description}</p>
        <div class="ax-pro-sources">Sources : ${s}</div>
        <div class="ax-pro-caps">${o}</div>
        ${n}
        <div class="ax-pro-actions">
          <button class="ax-btn-primary" data-action="open">Ouvrir</button>
        </div>
      </div>
    `,c.info("pro-modules",`rendered ${i.id}`)}getStats(){return{total:a.length,free:a.filter(r=>!r.premium).length,premium:a.filter(r=>r.premium).length,with_disclaimer:a.filter(r=>r.prudence_disclaimer).length}}}const p=new d;function m(t){const r=a.map(e=>`
    <div class="ax-pro-card" data-module="${e.id}" style="cursor:pointer;background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;transition:transform 0.15s">
      <div class="ax-pro-card-emoji" style="font-size:36px">${e.emoji}</div>
      <div class="ax-pro-card-label" style="font-weight:700;color:#c9a227;margin-top:8px">${e.label}</div>
      <div class="ax-pro-card-desc" style="font-size:12px;color:var(--ax-text-dim);margin-top:4px">${e.description}</div>
      <div class="ax-pro-card-sources" style="font-size:11px;color:#888;margin-top:8px">${e.sources_autoritaires.slice(0,2).join(" · ")}</div>
      ${e.premium?'<span class="ax-badge-premium" style="background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700">PRO</span>':""}
      ${e.prudence_disclaimer?'<span class="ax-badge-warning" style="display:inline-block;margin-left:6px">⚠️</span>':""}
    </div>
  `).join("");t.innerHTML=`
    <div class="ax-pro-hub" style="padding:16px;max-width:900px;margin:0 auto">
      <h1 style="color:#c9a227">💼 Modules Pro Expert</h1>
      <p class="ax-subtitle" style="color:var(--ax-text-dim)">${a.length} modules avec sources autoritaires</p>
      <div class="ax-pro-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:16px">${r}</div>
      <div id="ax-pro-detail" style="margin-top:24px"></div>
      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `,t.querySelectorAll(".ax-pro-card").forEach(e=>{e.addEventListener("click",()=>{const i=e.dataset.module;if(!i)return;const s=t.querySelector("#ax-pro-detail");s&&p.render(i,s)})})}export{a as PRO_MODULES,p as proModulesHub,m as render};
//# sourceMappingURL=index-DrdTFN2Q.js.map
