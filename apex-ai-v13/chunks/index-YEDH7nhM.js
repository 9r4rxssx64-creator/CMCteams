import{_ as C}from"./apex-kb-CbzVLcxA.js";import{a as l}from"./escape-html-DGIYNPKb.js";import{c as A}from"./listener-cleanup-Y2rGGxxX.js";import{q as d,C as y}from"./monitoring-BqodRReZ.js";import{g as j}from"./apex-tools-dispatch-core-BuiZzNhM.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-CKhc2o3F.js";import"./apex-tools-dispatch-skills-DHiF9xYO.js";import"./apex-tools-dispatch-data-CSnt5vyw.js";import"./apex-tools-dispatch-finance-DoRAfEZC.js";import"./apex-tools-dispatch-misc-BU6yQDTo.js";import"./apex-tools-misc-CnSibEsP.js";import"./apex-tools-registry-core-CQvgkOQw.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";let u=null;function te(){u?.cleanup(),u=null}const h=[{id:"moderne",label:"Moderne",description:"Design contemporain, sections claires",emoji:"✨",recommendedFor:["Marketing","Sales","PM"],atsScore:95},{id:"classique",label:"Classique",description:"Sobre et professionnel, format universel",emoji:"📋",recommendedFor:["RH","Admin","Junior"],atsScore:100},{id:"creatif",label:"Créatif",description:"Original, idéal métiers artistiques",emoji:"🎨",recommendedFor:["Designer","Artiste","Comm"],atsScore:70},{id:"tech",label:"Tech / Dev",description:"GitHub, stack, projets en avant",emoji:"💻",recommendedFor:["Développeur","DevOps","Data"],atsScore:90},{id:"executive",label:"Executive",description:"Cadre dirigeant, premium",emoji:"👔",recommendedFor:["C-Level","Directeur"],atsScore:95},{id:"startup",label:"Startup",description:"Énergie, croissance, impact mesuré",emoji:"🚀",recommendedFor:["Founder","Growth","Product"],atsScore:85},{id:"freelance",label:"Freelance",description:"Portfolio + projets + clients",emoji:"🛠",recommendedFor:["Consultant","Indé"],atsScore:80},{id:"design",label:"Design",description:"Visuel fort, références projets",emoji:"🎯",recommendedFor:["UX/UI","Graphiste","Brand"],atsScore:70},{id:"medical",label:"Médical",description:"Diplômes, spécialités, RPPS",emoji:"⚕",recommendedFor:["Médecin","Infirmier","Pharma"],atsScore:95},{id:"juridique",label:"Juridique",description:"Barreau, dossiers, jurisprudence",emoji:"⚖",recommendedFor:["Avocat","Juriste","Notaire"],atsScore:95},{id:"finance",label:"Finance",description:"Compétences chiffrées, certifs (CFA)",emoji:"💰",recommendedFor:["Banquier","Auditeur","CFO"],atsScore:95},{id:"academique",label:"Académique",description:"Publications, recherche, conférences",emoji:"🎓",recommendedFor:["Chercheur","Doctorant","Prof"],atsScore:90},{id:"etudiant",label:"Étudiant",description:"Premier emploi, stages, projets école",emoji:"📚",recommendedFor:["Stage","Alternance","Junior"],atsScore:100},{id:"reconversion",label:"Reconversion",description:"Compétences transférables en avant",emoji:"🔄",recommendedFor:["Transition pro"],atsScore:90},{id:"international",label:"International",description:"Anglais standard, formats US/UK",emoji:"🌍",recommendedFor:["Expat","Multinational"],atsScore:95}],v=20,x=10,M=15,P=12,E=5,$=30,T="ax_cv_",ne=["expérience","compétences","formation","diplôme","projet","résultat","équipe","gestion","développement","analyse"],ie=["identite.email","identite.telephone","experiences","formations","competences"],re=[{q:"Parlez-moi de vous.",tip:"Pitch 60-90 sec : qui je suis + parcours + ce que je cherche."},{q:"Pourquoi vous ?",tip:"Trois compétences alignées avec le poste, illustrées par un exemple chacune."},{q:"Vos points faibles ?",tip:"Un défaut réel + comment vous le travaillez. Sincérité > perfection."},{q:"Pourquoi nous quittez-vous ?",tip:"Tournez vers ce qui vous attire dans le nouveau poste, pas critiquer l'ancien."},{q:"Où vous voyez-vous dans 5 ans ?",tip:"Évolution réaliste alignée avec le poste actuel + envie d'apprendre."},{q:"Pourquoi notre entreprise ?",tip:"Mentionnez 2-3 valeurs / projets concrets de l'entreprise. Montrez recherche."},{q:"Décrivez un projet difficile.",tip:"Méthode STAR : Situation, Tâche, Action, Résultat (chiffré)."},{q:"Comment gérez-vous le stress ?",tip:'Technique concrète + exemple. Évitez "je gère bien" générique.'},{q:"Comment gérez-vous un conflit ?",tip:"Exemple concret, écoute, médiation, recherche solution gagnant-gagnant."},{q:"Quel est votre style de management ?",tip:"Adaptable selon situation : directif, participatif, délégatif."},{q:"Pourquoi un trou dans votre CV ?",tip:"Sincérité + activités productives durant cette période (formation, projet)."},{q:"Quelle est votre prétention salariale ?",tip:"Fourchette basée recherche marché + flexibilité selon package."},{q:"Quel salaire actuel ?",tip:"Salaire actuel + evolutions souhaitées. Possible refus poli."},{q:"Êtes-vous mobile géographiquement ?",tip:"Soyez clair. Ne mentez pas pour décrocher entretien."},{q:"Pourquoi devrions-nous vous embaucher ?",tip:"Synthèse 3 compétences clés + alignement parfait avec poste."},{q:"Qu'attendez-vous de votre futur manager ?",tip:"Communication claire + retours réguliers + autonomie + soutien."},{q:"Comment décririez-vous votre dernière équipe ?",tip:"Positif sans embellir. Focus sur ce qui marchait + apprentissages."},{q:"Avez-vous des questions ?",tip:"TOUJOURS oui. 3-5 questions sur poste, équipe, croissance, défis."},{q:"Donnez un exemple de leadership.",tip:"Situation où vous avez initié, motivé, livré sans titre formel."},{q:"Comment apprenez-vous de nouvelles compétences ?",tip:"Méthode personnelle + exemple récent (formation, projet)."},{q:"Que pensez-vous de notre concurrent X ?",tip:"Analyse objective + ce qui différencie l'entreprise actuelle."},{q:"Comment réagissez-vous à la critique ?",tip:"Acceptation constructive + exemple où feedback a aidé."},{q:"Décrivez votre journée idéale.",tip:"Productivité + équilibre vie privée + impact concret."},{q:"Avez-vous d'autres entretiens en cours ?",tip:"Sincérité + intérêt principal pour cette entreprise."},{q:"Quand pouvez-vous commencer ?",tip:"Préavis légal honnête + flexibilité."}],oe={classique:`Madame, Monsieur,

Diplômé(e) de [formation] et fort(e) de [X années] d'expérience en [domaine], je vous adresse ma candidature au poste de [poste] proposé au sein de [entreprise].

Ma formation et mes expériences m'ont permis de développer [3 compétences clés alignées avec le poste]. Au cours de [expérience récente], j'ai notamment [résultat chiffré].

Votre entreprise [entreprise], reconnue pour [élément différenciant], correspond pleinement à mes aspirations. Je suis particulièrement intéressé(e) par [projet/valeur spécifique].

Je me tiens à votre disposition pour un entretien.

Veuillez agréer mes salutations distinguées.`,startup:`Hi,

Je vous écris parce que [entreprise] est exactement ce que je cherche : [valeur unique]. En [X années] dans [domaine], j'ai aidé [chiffre] entreprises à [bénéfice mesurable].

Ce qui me motive : [3 points concrets]. Concrètement, je peux apporter à [entreprise] : [3 contributions chiffrées].

Dispo pour un café/visio quand ça vous arrange ?

[Prénom]`,reconversion:`Madame, Monsieur,

Après [X années] dans [ancien domaine], je me reconvertis vers [nouveau domaine] pour [motivation profonde]. Cette transition n'est pas un choix par défaut, mais une vraie passion construite par [actions concrètes : formation, projet personnel, etc].

Mes compétences acquises dans [ancien métier] sont transférables : [3 compétences transférables avec exemples].

Ma formation en [nouveau diplôme] m'a apporté [compétences techniques nouvelles]. Mon projet [projet portfolio] illustre mes capacités.

Disponible pour échanger.

Cordialement.`,international_en:`Dear Hiring Manager,

With [X years] of experience in [field], I am excited to apply for the [position] role at [company]. My background in [specific area] aligns perfectly with what your team needs.

In my current role at [current company], I [specific achievement with metric]. I am drawn to [company] because of [specific reason: mission, project, value].

I would welcome the opportunity to discuss how I can contribute to your team.

Best regards,
[Name]`,spontanee:`Madame, Monsieur,

Votre entreprise [entreprise] m'inspire par [raison spécifique]. Bien que vous n'ayez pas d'offre publiée correspondant à mon profil, je souhaite vous proposer ma candidature spontanée.

Mon profil : [pitch 2 phrases].

Je peux apporter à [entreprise] : [3 valeurs concrètes].

Si mon profil retient votre attention, je serais ravi(e) d'échanger.

Cordialement.`},se={A1:"Débutant - phrases simples, vocabulaire basique",A2:"Élémentaire - conversations simples",B1:"Intermédiaire - voyages, sujets familiers",B2:"Intermédiaire avancé - autonome, idées complexes",C1:"Avancé - usage souple, sujets variés",C2:"Maîtrise - quasi-natif, nuances subtiles",natif:"Langue maternelle"},ae={tech:["JavaScript","TypeScript","Python","React","Node.js","Docker","Kubernetes","AWS","PostgreSQL","Git","CI/CD","GraphQL","Microservices"],data:["Python","SQL","Pandas","NumPy","Scikit-learn","TensorFlow","PyTorch","Tableau","Power BI","Hadoop","Spark","Statistics","Machine Learning"],marketing:["SEO","SEM","Google Analytics","Google Ads","Facebook Ads","Hubspot","Mailchimp","Content marketing","Copywriting","A/B testing","CRM","Marketing automation"],finance:["Excel avancé","SAP","Sage","Bloomberg","CFA","Modélisation financière","IFRS","Consolidation","Analyse risque","M&A","Trading"],sales:["Salesforce","Pipedrive","Cold calling","Négociation","Account management","Pipeline management","CRM","B2B","B2C","SaaS sales"],rh:["Recrutement","Paie","Droit social","Gestion conflits","Formation","GPEC","Workday","SIRH","Onboarding","Politique RH"],design:["Figma","Sketch","Adobe XD","Photoshop","Illustrator","InDesign","Prototyping","Wireframing","UI/UX","Design system","Motion design"],produit:["Agile","Scrum","Kanban","JIRA","User stories","Roadmap","OKR","Discovery","A/B testing","Analytics","Product Management"],comm:["Communication interne","Communication externe","RP","Réseaux sociaux","Community management","Storytelling","Brand","Crisis management"],juridique:["Droit civil","Droit commercial","Droit social","Droit fiscal","Contrats","Compliance","RGPD","M&A","Contentieux","Property"]};function f(i){return`${T}${i}`}function b(i,e,t="fr"){return{template:i,lang:t,identite:{prenom:e?.prenom??"",nom:e?.nom??"",email:"",telephone:"",adresse:"",titre:"",photo:"",linkedin:"",github:"",site:""},resume:"",experiences:[],formations:[],certifications:[],projets:[],references:[],competences:[],langues:[{lang:"Français",niveau:"natif"}],loisirs:""}}function R(){return{id:`exp_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,poste:"",entreprise:"",ville:"",date_debut:"",date_fin:"",description:"",achievements:[]}}function F(){return{id:`form_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,diplome:"",ecole:"",ville:"",annee:"",mention:""}}function I(){return{id:`cert_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,nom:"",organisme:"",date:"",url:""}}function _(){return{id:`proj_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,nom:"",description:"",url:"",technologies:[]}}function D(){return{id:`ref_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,nom:"",poste:"",entreprise:"",email:"",telephone:""}}function S(i){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i)}function ce(i){return i?/linkedin\.com\/in\/([a-zA-Z0-9-_%]+)/i.exec(i)?.[1]??"":""}function le(i){return i?/github\.com\/([a-zA-Z0-9-_]+)/i.exec(i)?.[1]??"":""}function w(i){let e=0;return i.identite.prenom&&(e+=8),i.identite.nom&&(e+=8),i.identite.email&&S(i.identite.email)&&(e+=8),i.identite.telephone&&(e+=5),i.identite.titre&&(e+=8),i.resume&&(e+=8),i.experiences.length>0&&(e+=15),i.experiences.length>=3&&(e+=5),i.formations.length>0&&(e+=12),i.competences.length>=3&&(e+=8),i.competences.length>=8&&(e+=5),i.langues.length>=2&&(e+=5),i.identite.linkedin&&(e+=5),Math.min(100,e)}function k(i){const e=[],t=[];let n=100;(!i.identite.email||!S(i.identite.email))&&(e.push("Email manquant ou invalide"),n-=15),i.identite.telephone||(e.push("Téléphone manquant"),n-=10),i.experiences.length===0&&(e.push("Aucune expérience renseignée"),n-=20),i.formations.length===0&&(e.push("Aucune formation renseignée"),n-=15),i.competences.length<3&&(e.push("Moins de 3 compétences listées"),n-=10,t.push("Ajoute au moins 5-8 compétences clés du métier visé"));const r=h.find(c=>c.id===i.template);r&&r.atsScore<80&&(t.push(`Template "${r.label}" peu ATS-friendly (${r.atsScore}/100). Pour grandes entreprises → choisir Classique ou Tech.`),n-=(100-r.atsScore)/5);const s=i.experiences.filter(c=>/\d+\s*(%|€|k€|M€|client|projet|équipe|personne)/i.test(c.description)||c.achievements.some(o=>/\d+/.test(o))).length;return i.experiences.length>0&&s===0&&(t.push('Quantifie tes réussites (ex: "+30% CA", "équipe de 5", "200K€ budget")'),n-=5),i.identite.photo&&i.lang==="en"&&t.push("Photo non conventionnelle en CV anglo-saxon (US/UK)."),{score:Math.max(0,Math.min(100,Math.round(n))),issues:e,suggestions:t}}function ue(i,e){if(!e||e.trim().length===0)return{score:0,keywordsFound:[],keywordsMissing:[]};const t=new Set(["pour","avec","dans","vous","nous","mais","plus","tres","votre","notre","cette","with","this","that","have","from","will","your","were","they","their"]),n=e.toLowerCase().replace(/[^a-zàâçéèêëîïôûùüÿñæœ0-9\s]/g," ").split(/\s+/).filter(a=>a.length>=4&&!t.has(a)),r=new Map;for(const a of n)r.set(a,(r.get(a)??0)+1);const s=Array.from(r.entries()).sort((a,q)=>q[1]-a[1]).slice(0,30).map(([a])=>a),c=JSON.stringify(i).toLowerCase(),o=[],p=[];for(const a of s)c.includes(a)?o.push(a):p.push(a);return{score:s.length>0?Math.round(o.length/s.length*100):0,keywordsFound:o,keywordsMissing:p}}function pe(i,e,t){const n=i.identite.prenom||"[Prénom]",r=i.identite.nom||"[Nom]",s=i.identite.email||"[email]",c=i.identite.telephone||"[téléphone]",o=i.identite.titre||"[Titre actuel]",p=i.experiences[0],g=p?`${p.poste} chez ${p.entreprise}`:"[dernière expérience]",a=i.competences.slice(0,3).join(", ")||"[compétences]";return`${n} ${r}
${s} · ${c}

${t||"[Entreprise]"}
À l'attention du service Recrutement

Objet : Candidature au poste de ${e||"[Poste visé]"}

Madame, Monsieur,

Actuellement ${o}, fort de mon expérience en tant que ${g}, je vous adresse ma candidature au poste de ${e||"[Poste]"} au sein de ${t||"[entreprise]"}.

Mon parcours m'a permis de développer une solide expertise en ${a}. [Personnalise avec un succès chiffré aligné avec l'offre — ex: "j'ai mené un projet de X€ qui a augmenté le CA de Y%"].

Votre projet [cite un produit/valeur de l'entreprise] me motive particulièrement car [raison personnelle alignée]. Je serais ravi(e) de mettre mon expertise en ${a} au service de votre équipe.

Je suis disponible pour échanger lors d'un entretien à votre convenance.

Bien cordialement,
${n} ${r}`}class z{load(e){if(!e)return null;try{const t=localStorage.getItem(f(e));if(!t)return null;const n=JSON.parse(t);return!n||typeof n!="object"?null:n}catch(t){return d.warn("studio-cv","load failed",{err:t}),null}}save(e,t){if(!e)return!1;try{return localStorage.setItem(f(e),JSON.stringify(t)),!0}catch(n){return d.warn("studio-cv","save failed (quota?)",{err:n}),!1}}setTemplate(e,t){const n=this.load(e)??b(t);return n.template=t,this.save(e,n),n}setLang(e,t){const n=this.load(e);return n?(n.lang=t,this.save(e,n)):!1}addExperience(e){const t=this.load(e);return t?(t.experiences.length>=v||(t.experiences.push(R()),this.save(e,t)),t):null}addFormation(e){const t=this.load(e);return t?(t.formations.length>=x||(t.formations.push(F()),this.save(e,t)),t):null}addCertification(e){const t=this.load(e);return t?(t.certifications.length>=M||(t.certifications.push(I()),this.save(e,t)),t):null}addProject(e){const t=this.load(e);return t?(t.projets.length>=P||(t.projets.push(_()),this.save(e,t)),t):null}addReference(e){const t=this.load(e);return t?(t.references.length>=E||(t.references.push(D()),this.save(e,t)),t):null}removeExperience(e,t){const n=this.load(e);return n?(n.experiences=n.experiences.filter(r=>r.id!==t),this.save(e,n)):!1}removeFormation(e,t){const n=this.load(e);return n?(n.formations=n.formations.filter(r=>r.id!==t),this.save(e,n)):!1}setIdentite(e,t){const n=this.load(e);return n?(n.identite={...n.identite,...t},this.save(e,n)):!1}setResume(e,t){const n=this.load(e);return n?(n.resume=t.slice(0,600),this.save(e,n)):!1}setCompetences(e,t){const n=this.load(e);return n?(n.competences=t.slice(0,$),this.save(e,n)):!1}clear(e){return e?(localStorage.removeItem(f(e)),!0):!1}}const m=new z;function O(i){u?.cleanup(),u=A("studios-cv");const e=y.get("user"),t=e?.id??"anon";if(!j("studio.cv",i,t))return;let n=m.load(t);if(!n){const o={};e?.firstName&&(o.prenom=e.firstName),e?.lastName&&(o.nom=e.lastName),n=b("classique",o),m.save(t,n)}const r=w(n),s=k(n),c=h.map(o=>`
    <button class="ax-btn ax-cv-template" data-template="${l(o.id)}" style="padding:10px;background:${n?.template===o.id?"rgba(201,162,39,0.2)":"rgba(201,162,39,0.05)"};border:1px solid rgba(201,162,39,0.3);border-radius:8px;cursor:pointer;min-height:60px;text-align:left">
      <div class="ax-gs-17">${o.emoji}</div>
      <div class="ax-gs-79">${l(o.label)}</div>
      <div class="ax-gs-2">${l(o.description)}</div>
      <div class="ax-gs-82">ATS: ${o.atsScore}/100</div>
    </button>
  `).join("");i.innerHTML=`
    <div class="ax-page ax-gs-332">
      <header class="ax-gs-210">
        <h1 class="ax-gs-333">📄 Studio CV Pro</h1>
        <span class="ax-gs-3">Complétude ${r}% · ATS ${s.score}/100</span>
      </header>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Template (${h.length} disponibles)</h2>
        <div class="ax-gs-157">${c}</div>
      </div>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Identité</h2>
        <input type="text" id="ax-cv-prenom" aria-label="Prénom CV" placeholder="Prénom" maxlength="100" value="${l(n.identite.prenom)}" class="ax-gs-455">
        <input type="text" id="ax-cv-nom" aria-label="Nom CV" placeholder="Nom" maxlength="100" value="${l(n.identite.nom)}" class="ax-gs-455">
        <input type="text" id="ax-cv-titre" aria-label="Titre professionnel CV" placeholder="Titre (ex: Développeur Full-Stack)" maxlength="200" value="${l(n.identite.titre)}" class="ax-gs-455">
        <input type="email" id="ax-cv-email" aria-label="Email CV" placeholder="Email" maxlength="200" value="${l(n.identite.email)}" class="ax-gs-455">
        <input type="tel" id="ax-cv-tel" aria-label="Téléphone CV" placeholder="Téléphone" maxlength="50" value="${l(n.identite.telephone)}" class="ax-gs-455">
        <input type="url" id="ax-cv-linkedin" aria-label="URL LinkedIn CV" placeholder="LinkedIn URL" maxlength="300" value="${l(n.identite.linkedin)}" class="ax-gs-455">
      </div>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Expériences (${n.experiences.length}/${v})</h2>
        <button class="ax-btn ax-btn-primary ax-gs-401" id="ax-cv-add-exp">➕ Ajouter une expérience</button>
      </div>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Formations (${n.formations.length}/${x})</h2>
        <button class="ax-btn ax-btn-primary ax-gs-401" id="ax-cv-add-form">➕ Ajouter une formation</button>
      </div>

      <div style="background:rgba(33,150,243,0.05);border:1px solid rgba(33,150,243,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#2196f3">🤖 Outils Pro</h2>
        <div class="ax-gs-7">
          <button class="ax-btn ax-gs-401" id="ax-cv-cover-letter">✉ Lettre motivation</button>
          <button class="ax-btn ax-gs-401" id="ax-cv-match-offer">🎯 Match offre</button>
          <button class="ax-btn ax-gs-401" id="ax-cv-interview">🎤 Simulateur entretien</button>
        </div>
      </div>

      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button class="ax-btn ax-btn-primary ax-gs-401" data-export="pdf">💾 Exporter PDF</button>
        <button class="ax-btn ax-gs-401" data-export="docx">📝 Exporter DOCX</button>
        <button class="ax-btn ax-gs-401" data-export="txt-ats">🤖 Export ATS</button>
        <button class="ax-btn ax-gs-460" id="ax-cv-clear">🗑 Réinitialiser</button>
      </div>

      <p class="ax-gs-212"><a href="#studios" class="ax-gs-198">← Retour studios</a></p>
    </div>
  `,N(i,t)}function N(i,e){i.querySelectorAll(".ax-cv-template").forEach(n=>{u.bind(n,"click",()=>{const r=n.dataset.template;r&&(m.setTemplate(e,r),O(i))})});const t=(n,r)=>{const s=i.querySelector(`#${n}`);s&&u.bind(s,"change",()=>{m.setIdentite(e,{[r]:s.value})})};t("ax-cv-prenom","prenom"),t("ax-cv-nom","nom"),t("ax-cv-titre","titre"),t("ax-cv-email","email"),t("ax-cv-tel","telephone"),t("ax-cv-linkedin","linkedin"),i.querySelectorAll("[data-export]").forEach(n=>{u.bind(n,"click",()=>{const r=n.dataset.export;d.info("studio-cv","export requested",{format:r}),(async()=>{try{const{toast:s}=await C(async()=>{const{toast:c}=await import("./toast-CRdbcLoc.js");return{toast:c}},[],import.meta.url).catch(()=>({toast:null}));s?.info(`Export ${r.toUpperCase()} en cours…`)}catch(s){d.warn("studio-cv","export failed",{err:s})}})()})})}export{ne as ATS_REQUIRED_KEYWORDS_FR,ie as ATS_REQUIRED_SECTIONS,ae as COMPETENCES_PAR_DOMAINE,oe as COVER_LETTER_TEMPLATES,re as INTERVIEW_QUESTIONS_FR,M as MAX_CERTIFICATIONS,$ as MAX_COMPETENCES,v as MAX_EXPERIENCES,x as MAX_FORMATIONS,P as MAX_PROJECTS,E as MAX_REFERENCES,se as NIVEAUX_CECRL,T as STORAGE_PREFIX,h as TEMPLATES,k as calcATSScore,w as calcCompleteness,I as createCertification,R as createExperience,F as createFormation,_ as createProject,D as createReference,m as cvStudioStore,te as dispose,l as escapeHtml,le as extractGitHubUsername,ce as extractLinkedInSlug,pe as generateCoverLetterTemplate,f as getStorageKey,b as initCV,S as isValidEmail,ue as matchOffer,O as render};
