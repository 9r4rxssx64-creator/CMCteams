import{l}from"../core/main-CyjuGNVJ.js";const r=[{id:"cuisine",emoji:"🍳",label:"Cuisine Pro",description:"10+ recettes, 22 cuissons, 14 allergènes INCO, calories",capabilities:["recettes","cuissons","allergenes_inco","calories","conversions"],intent_keywords:["recette","cuisson","ingrédient","cuisine","allergène","calorie"],sources_autoritaires:["Règlement INCO 1169/2011","ANSES","CIQUAL"],prudence_disclaimer:!1,premium:!1},{id:"medical",emoji:"💊",label:"Medical Pro",description:"Vidal OTC, IMC, métabolisme, urgences SAMU",capabilities:["vidal_otc","imc","metabolisme","urgences","vaccins"],intent_keywords:["médical","vidal","posologie","symptôme","maladie","imc"],sources_autoritaires:["Vidal","ANSM","Has-sante","Ameli"],prudence_disclaimer:!0,premium:!0},{id:"finance",emoji:"💰",label:"Finance Pro",description:"IR FR 2026, PFU 30%, plus-values immo, crédit immo, Monaco fiscal",capabilities:["ir_fr","pfu","pv_immo","pv_mobilier","credit_immo","monaco_fiscal"],intent_keywords:["impôt","IR","crédit","IBAN","paiement","fiscalité","plus-value"],sources_autoritaires:["Impôts.gouv","Service-public.fr","Légimonaco"],prudence_disclaimer:!0,premium:!0},{id:"legal",emoji:"⚖️",label:"Legal Pro",description:"18+ codes français + jurisprudence Cassation/CE/CJUE/CEDH + Monaco",capabilities:["codes_fr","jurisprudence","monaco","calculs_indem","prescription"],intent_keywords:["loi","article","tribunal","code","préfecture","juridique","légal"],sources_autoritaires:["Légifrance","Légimonaco","Curia","CEDH","Cassation","Conseil d'État"],prudence_disclaimer:!0,premium:!0},{id:"translator",emoji:"🌐",label:"Translator Pro",description:"30+ langues + mode interprète temps réel",capabilities:["translate","interprete_live","detect_lang","tts","stt"],intent_keywords:["traduire","translate","anglais","italien","allemand","espagnol","interprète"],sources_autoritaires:["DeepL","Google Translate"],prudence_disclaimer:!1,premium:!0},{id:"business",emoji:"💼",label:"Business Pro",description:"Plan de business, KPIs, MRR, churn analysis",capabilities:["business_plan","kpis","mrr","churn","cac_ltv"],intent_keywords:["business plan","kpi","mrr","churn","startup","entreprise"],sources_autoritaires:["Bpifrance","INSEE"],prudence_disclaimer:!1,premium:!0},{id:"education",emoji:"🎓",label:"Éducation Pro",description:"Programmes scolaires FR, méthodes pédagogiques, exercices",capabilities:["programmes","methodes","exercices","corrections","evaluation"],intent_keywords:["école","programme scolaire","éducation","pédagogie","apprendre"],sources_autoritaires:["Eduscol","Éducation Nationale"],prudence_disclaimer:!1,premium:!1},{id:"certifications",emoji:"📜",label:"Certifications Pro",description:"Préparation certifs (PMP, AWS, Google Cloud, ISTQB, etc.)",capabilities:["quiz","mock_exam","flashcards","planning_revision"],intent_keywords:["certification","pmp","aws","google cloud","examen","quiz"],sources_autoritaires:["PMI.org","AWS Training","Google Cloud Skills Boost"],prudence_disclaimer:!1,premium:!0}];class d{list(){return r}byId(e){return r.find(i=>i.id===e)}matchIntent(e){const i=e.toLowerCase();let s=null;for(const o of r){let a=0;for(const t of o.intent_keywords)i.includes(t)&&a++;a>0&&(!s||a>s.score)&&(s={mod:o,score:a})}return s?.mod??null}filterByPremium(e){return r.filter(i=>i.premium===e)}async render(e,i){const s=this.byId(e);if(!s){l.warn("pro-modules",`Unknown module: ${e}`);return}const o=s.sources_autoritaires.map(n=>`<span class="ax-source">${n}</span>`).join(" "),a=s.capabilities.map(n=>`<span class="ax-cap">${n}</span>`).join(" "),t=s.prudence_disclaimer?'<p class="ax-disclaimer">⚠️ Information indicative. Pour décision importante, consulter un professionnel qualifié.</p>':"";i.innerHTML=`
      <div class="ax-pro-module" data-module="${s.id}">
        <header class="ax-pro-head">
          <span class="ax-pro-emoji">${s.emoji}</span>
          <h2>${s.label}</h2>
          ${s.premium?'<span class="ax-badge-premium">PRO</span>':""}
        </header>
        <p class="ax-pro-desc">${s.description}</p>
        <div class="ax-pro-sources">Sources : ${o}</div>
        <div class="ax-pro-caps">${a}</div>
        ${t}
        <div class="ax-pro-actions">
          <button class="ax-btn-primary" data-action="open">Ouvrir</button>
        </div>
      </div>
    `,l.info("pro-modules",`rendered ${s.id}`)}getStats(){return{total:r.length,free:r.filter(e=>!e.premium).length,premium:r.filter(e=>e.premium).length,with_disclaimer:r.filter(e=>e.prudence_disclaimer).length}}}const p=new d;function m(c){const e=r.map(i=>`
    <div class="ax-pro-card" data-module="${i.id}">
      <div class="ax-pro-card-emoji">${i.emoji}</div>
      <div class="ax-pro-card-label">${i.label}</div>
      <div class="ax-pro-card-desc">${i.description}</div>
      <div class="ax-pro-card-sources">${i.sources_autoritaires.slice(0,2).join(" · ")}</div>
      ${i.premium?'<span class="ax-badge-premium">PRO</span>':""}
      ${i.prudence_disclaimer?'<span class="ax-badge-warning">⚠️</span>':""}
    </div>
  `).join("");c.innerHTML=`
    <div class="ax-pro-hub">
      <h1>💼 Modules Pro Expert</h1>
      <p class="ax-subtitle">${r.length} modules avec sources autoritaires</p>
      <div class="ax-pro-grid">${e}</div>
    </div>
  `}export{r as PRO_MODULES,p as proModulesHub,m as render};
//# sourceMappingURL=index-DOuaOMO0.js.map
