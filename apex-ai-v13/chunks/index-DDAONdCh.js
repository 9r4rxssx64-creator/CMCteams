import{_ as q}from"./apex-kb-BnhygcNh.js";import{l as d}from"./monitoring-3uBGKGRH.js";import{c as C}from"./listener-cleanup-Y2rGGxxX.js";import{s as A}from"../core/main-OxZeppzC.js";import{g as j}from"./apex-tools-dispatch-CtDhFrLZ.js";import"./credential-patterns-xogPPKNY.js";import"./multi-source-analyze-CaRx0igv.js";import"./apex-tools-registry-DzHiJgNo.js";import"./voice-COi9Aack.js";let p=null;function K(){p?.cleanup(),p=null}const h=[{id:"moderne",label:"Moderne",description:"Design contemporain, sections claires",emoji:"✨",recommendedFor:["Marketing","Sales","PM"],atsScore:95},{id:"classique",label:"Classique",description:"Sobre et professionnel, format universel",emoji:"📋",recommendedFor:["RH","Admin","Junior"],atsScore:100},{id:"creatif",label:"Créatif",description:"Original, idéal métiers artistiques",emoji:"🎨",recommendedFor:["Designer","Artiste","Comm"],atsScore:70},{id:"tech",label:"Tech / Dev",description:"GitHub, stack, projets en avant",emoji:"💻",recommendedFor:["Développeur","DevOps","Data"],atsScore:90},{id:"executive",label:"Executive",description:"Cadre dirigeant, premium",emoji:"👔",recommendedFor:["C-Level","Directeur"],atsScore:95},{id:"startup",label:"Startup",description:"Énergie, croissance, impact mesuré",emoji:"🚀",recommendedFor:["Founder","Growth","Product"],atsScore:85},{id:"freelance",label:"Freelance",description:"Portfolio + projets + clients",emoji:"🛠",recommendedFor:["Consultant","Indé"],atsScore:80},{id:"design",label:"Design",description:"Visuel fort, références projets",emoji:"🎯",recommendedFor:["UX/UI","Graphiste","Brand"],atsScore:70},{id:"medical",label:"Médical",description:"Diplômes, spécialités, RPPS",emoji:"⚕",recommendedFor:["Médecin","Infirmier","Pharma"],atsScore:95},{id:"juridique",label:"Juridique",description:"Barreau, dossiers, jurisprudence",emoji:"⚖",recommendedFor:["Avocat","Juriste","Notaire"],atsScore:95},{id:"finance",label:"Finance",description:"Compétences chiffrées, certifs (CFA)",emoji:"💰",recommendedFor:["Banquier","Auditeur","CFO"],atsScore:95},{id:"academique",label:"Académique",description:"Publications, recherche, conférences",emoji:"🎓",recommendedFor:["Chercheur","Doctorant","Prof"],atsScore:90},{id:"etudiant",label:"Étudiant",description:"Premier emploi, stages, projets école",emoji:"📚",recommendedFor:["Stage","Alternance","Junior"],atsScore:100},{id:"reconversion",label:"Reconversion",description:"Compétences transférables en avant",emoji:"🔄",recommendedFor:["Transition pro"],atsScore:90},{id:"international",label:"International",description:"Anglais standard, formats US/UK",emoji:"🌍",recommendedFor:["Expat","Multinational"],atsScore:95}],x=20,v=10,M=15,P=12,E=5,$=30,T="ax_cv_",W=["expérience","compétences","formation","diplôme","projet","résultat","équipe","gestion","développement","analyse"],Y=["identite.email","identite.telephone","experiences","formations","competences"],Z=[{q:"Parlez-moi de vous.",tip:"Pitch 60-90 sec : qui je suis + parcours + ce que je cherche."},{q:"Pourquoi vous ?",tip:"Trois compétences alignées avec le poste, illustrées par un exemple chacune."},{q:"Vos points faibles ?",tip:"Un défaut réel + comment vous le travaillez. Sincérité > perfection."},{q:"Pourquoi nous quittez-vous ?",tip:"Tournez vers ce qui vous attire dans le nouveau poste, pas critiquer l'ancien."},{q:"Où vous voyez-vous dans 5 ans ?",tip:"Évolution réaliste alignée avec le poste actuel + envie d'apprendre."},{q:"Pourquoi notre entreprise ?",tip:"Mentionnez 2-3 valeurs / projets concrets de l'entreprise. Montrez recherche."},{q:"Décrivez un projet difficile.",tip:"Méthode STAR : Situation, Tâche, Action, Résultat (chiffré)."},{q:"Comment gérez-vous le stress ?",tip:'Technique concrète + exemple. Évitez "je gère bien" générique.'},{q:"Comment gérez-vous un conflit ?",tip:"Exemple concret, écoute, médiation, recherche solution gagnant-gagnant."},{q:"Quel est votre style de management ?",tip:"Adaptable selon situation : directif, participatif, délégatif."},{q:"Pourquoi un trou dans votre CV ?",tip:"Sincérité + activités productives durant cette période (formation, projet)."},{q:"Quelle est votre prétention salariale ?",tip:"Fourchette basée recherche marché + flexibilité selon package."},{q:"Quel salaire actuel ?",tip:"Salaire actuel + evolutions souhaitées. Possible refus poli."},{q:"Êtes-vous mobile géographiquement ?",tip:"Soyez clair. Ne mentez pas pour décrocher entretien."},{q:"Pourquoi devrions-nous vous embaucher ?",tip:"Synthèse 3 compétences clés + alignement parfait avec poste."},{q:"Qu'attendez-vous de votre futur manager ?",tip:"Communication claire + retours réguliers + autonomie + soutien."},{q:"Comment décririez-vous votre dernière équipe ?",tip:"Positif sans embellir. Focus sur ce qui marchait + apprentissages."},{q:"Avez-vous des questions ?",tip:"TOUJOURS oui. 3-5 questions sur poste, équipe, croissance, défis."},{q:"Donnez un exemple de leadership.",tip:"Situation où vous avez initié, motivé, livré sans titre formel."},{q:"Comment apprenez-vous de nouvelles compétences ?",tip:"Méthode personnelle + exemple récent (formation, projet)."},{q:"Que pensez-vous de notre concurrent X ?",tip:"Analyse objective + ce qui différencie l'entreprise actuelle."},{q:"Comment réagissez-vous à la critique ?",tip:"Acceptation constructive + exemple où feedback a aidé."},{q:"Décrivez votre journée idéale.",tip:"Productivité + équilibre vie privée + impact concret."},{q:"Avez-vous d'autres entretiens en cours ?",tip:"Sincérité + intérêt principal pour cette entreprise."},{q:"Quand pouvez-vous commencer ?",tip:"Préavis légal honnête + flexibilité."}],ee={classique:`Madame, Monsieur,

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

Cordialement.`},te={A1:"Débutant - phrases simples, vocabulaire basique",A2:"Élémentaire - conversations simples",B1:"Intermédiaire - voyages, sujets familiers",B2:"Intermédiaire avancé - autonome, idées complexes",C1:"Avancé - usage souple, sujets variés",C2:"Maîtrise - quasi-natif, nuances subtiles",natif:"Langue maternelle"},ie={tech:["JavaScript","TypeScript","Python","React","Node.js","Docker","Kubernetes","AWS","PostgreSQL","Git","CI/CD","GraphQL","Microservices"],data:["Python","SQL","Pandas","NumPy","Scikit-learn","TensorFlow","PyTorch","Tableau","Power BI","Hadoop","Spark","Statistics","Machine Learning"],marketing:["SEO","SEM","Google Analytics","Google Ads","Facebook Ads","Hubspot","Mailchimp","Content marketing","Copywriting","A/B testing","CRM","Marketing automation"],finance:["Excel avancé","SAP","Sage","Bloomberg","CFA","Modélisation financière","IFRS","Consolidation","Analyse risque","M&A","Trading"],sales:["Salesforce","Pipedrive","Cold calling","Négociation","Account management","Pipeline management","CRM","B2B","B2C","SaaS sales"],rh:["Recrutement","Paie","Droit social","Gestion conflits","Formation","GPEC","Workday","SIRH","Onboarding","Politique RH"],design:["Figma","Sketch","Adobe XD","Photoshop","Illustrator","InDesign","Prototyping","Wireframing","UI/UX","Design system","Motion design"],produit:["Agile","Scrum","Kanban","JIRA","User stories","Roadmap","OKR","Discovery","A/B testing","Analytics","Product Management"],comm:["Communication interne","Communication externe","RP","Réseaux sociaux","Community management","Storytelling","Brand","Crisis management"],juridique:["Droit civil","Droit commercial","Droit social","Droit fiscal","Contrats","Compliance","RGPD","M&A","Contentieux","Property"]};function l(n){return n.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function f(n){return`${T}${n}`}function b(n,e,t="fr"){return{template:n,lang:t,identite:{prenom:e?.prenom??"",nom:e?.nom??"",email:"",telephone:"",adresse:"",titre:"",photo:"",linkedin:"",github:"",site:""},resume:"",experiences:[],formations:[],certifications:[],projets:[],references:[],competences:[],langues:[{lang:"Français",niveau:"natif"}],loisirs:""}}function w(){return{id:`exp_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,poste:"",entreprise:"",ville:"",date_debut:"",date_fin:"",description:"",achievements:[]}}function R(){return{id:`form_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,diplome:"",ecole:"",ville:"",annee:"",mention:""}}function k(){return{id:`cert_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,nom:"",organisme:"",date:"",url:""}}function F(){return{id:`proj_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,nom:"",description:"",url:"",technologies:[]}}function I(){return{id:`ref_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,nom:"",poste:"",entreprise:"",email:"",telephone:""}}function y(n){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n)}function ne(n){return n?/linkedin\.com\/in\/([a-zA-Z0-9-_%]+)/i.exec(n)?.[1]??"":""}function re(n){return n?/github\.com\/([a-zA-Z0-9-_]+)/i.exec(n)?.[1]??"":""}function _(n){let e=0;return n.identite.prenom&&(e+=8),n.identite.nom&&(e+=8),n.identite.email&&y(n.identite.email)&&(e+=8),n.identite.telephone&&(e+=5),n.identite.titre&&(e+=8),n.resume&&(e+=8),n.experiences.length>0&&(e+=15),n.experiences.length>=3&&(e+=5),n.formations.length>0&&(e+=12),n.competences.length>=3&&(e+=8),n.competences.length>=8&&(e+=5),n.langues.length>=2&&(e+=5),n.identite.linkedin&&(e+=5),Math.min(100,e)}function D(n){const e=[],t=[];let i=100;(!n.identite.email||!y(n.identite.email))&&(e.push("Email manquant ou invalide"),i-=15),n.identite.telephone||(e.push("Téléphone manquant"),i-=10),n.experiences.length===0&&(e.push("Aucune expérience renseignée"),i-=20),n.formations.length===0&&(e.push("Aucune formation renseignée"),i-=15),n.competences.length<3&&(e.push("Moins de 3 compétences listées"),i-=10,t.push("Ajoute au moins 5-8 compétences clés du métier visé"));const r=h.find(c=>c.id===n.template);r&&r.atsScore<80&&(t.push(`Template "${r.label}" peu ATS-friendly (${r.atsScore}/100). Pour grandes entreprises → choisir Classique ou Tech.`),i-=(100-r.atsScore)/5);const a=n.experiences.filter(c=>/\d+\s*(%|€|k€|M€|client|projet|équipe|personne)/i.test(c.description)||c.achievements.some(o=>/\d+/.test(o))).length;return n.experiences.length>0&&a===0&&(t.push('Quantifie tes réussites (ex: "+30% CA", "équipe de 5", "200K€ budget")'),i-=5),n.identite.photo&&n.lang==="en"&&t.push("Photo non conventionnelle en CV anglo-saxon (US/UK)."),{score:Math.max(0,Math.min(100,Math.round(i))),issues:e,suggestions:t}}function oe(n,e){if(!e||e.trim().length===0)return{score:0,keywordsFound:[],keywordsMissing:[]};const t=new Set(["pour","avec","dans","vous","nous","mais","plus","tres","votre","notre","cette","with","this","that","have","from","will","your","were","they","their"]),i=e.toLowerCase().replace(/[^a-zàâçéèêëîïôûùüÿñæœ0-9\s]/g," ").split(/\s+/).filter(s=>s.length>=4&&!t.has(s)),r=new Map;for(const s of i)r.set(s,(r.get(s)??0)+1);const a=Array.from(r.entries()).sort((s,S)=>S[1]-s[1]).slice(0,30).map(([s])=>s),c=JSON.stringify(n).toLowerCase(),o=[],u=[];for(const s of a)c.includes(s)?o.push(s):u.push(s);return{score:a.length>0?Math.round(o.length/a.length*100):0,keywordsFound:o,keywordsMissing:u}}function ae(n,e,t){const i=n.identite.prenom||"[Prénom]",r=n.identite.nom||"[Nom]",a=n.identite.email||"[email]",c=n.identite.telephone||"[téléphone]",o=n.identite.titre||"[Titre actuel]",u=n.experiences[0],g=u?`${u.poste} chez ${u.entreprise}`:"[dernière expérience]",s=n.competences.slice(0,3).join(", ")||"[compétences]";return`${i} ${r}
${a} · ${c}

${t||"[Entreprise]"}
À l'attention du service Recrutement

Objet : Candidature au poste de ${e||"[Poste visé]"}

Madame, Monsieur,

Actuellement ${o}, fort de mon expérience en tant que ${g}, je vous adresse ma candidature au poste de ${e||"[Poste]"} au sein de ${t||"[entreprise]"}.

Mon parcours m'a permis de développer une solide expertise en ${s}. [Personnalise avec un succès chiffré aligné avec l'offre — ex: "j'ai mené un projet de X€ qui a augmenté le CA de Y%"].

Votre projet [cite un produit/valeur de l'entreprise] me motive particulièrement car [raison personnelle alignée]. Je serais ravi(e) de mettre mon expertise en ${s} au service de votre équipe.

Je suis disponible pour échanger lors d'un entretien à votre convenance.

Bien cordialement,
${i} ${r}`}class z{load(e){if(!e)return null;try{const t=localStorage.getItem(f(e));if(!t)return null;const i=JSON.parse(t);return!i||typeof i!="object"?null:i}catch(t){return d.warn("studio-cv","load failed",{err:t}),null}}save(e,t){if(!e)return!1;try{return localStorage.setItem(f(e),JSON.stringify(t)),!0}catch(i){return d.warn("studio-cv","save failed (quota?)",{err:i}),!1}}setTemplate(e,t){const i=this.load(e)??b(t);return i.template=t,this.save(e,i),i}setLang(e,t){const i=this.load(e);return i?(i.lang=t,this.save(e,i)):!1}addExperience(e){const t=this.load(e);return t?(t.experiences.length>=x||(t.experiences.push(w()),this.save(e,t)),t):null}addFormation(e){const t=this.load(e);return t?(t.formations.length>=v||(t.formations.push(R()),this.save(e,t)),t):null}addCertification(e){const t=this.load(e);return t?(t.certifications.length>=M||(t.certifications.push(k()),this.save(e,t)),t):null}addProject(e){const t=this.load(e);return t?(t.projets.length>=P||(t.projets.push(F()),this.save(e,t)),t):null}addReference(e){const t=this.load(e);return t?(t.references.length>=E||(t.references.push(I()),this.save(e,t)),t):null}removeExperience(e,t){const i=this.load(e);return i?(i.experiences=i.experiences.filter(r=>r.id!==t),this.save(e,i)):!1}removeFormation(e,t){const i=this.load(e);return i?(i.formations=i.formations.filter(r=>r.id!==t),this.save(e,i)):!1}setIdentite(e,t){const i=this.load(e);return i?(i.identite={...i.identite,...t},this.save(e,i)):!1}setResume(e,t){const i=this.load(e);return i?(i.resume=t.slice(0,600),this.save(e,i)):!1}setCompetences(e,t){const i=this.load(e);return i?(i.competences=t.slice(0,$),this.save(e,i)):!1}clear(e){return e?(localStorage.removeItem(f(e)),!0):!1}}const m=new z;function O(n){p?.cleanup(),p=C("studios-cv");const e=A.get("user"),t=e?.id??"anon";if(!j("studio.cv",n,t))return;let i=m.load(t);if(!i){const o={};e?.firstName&&(o.prenom=e.firstName),e?.lastName&&(o.nom=e.lastName),i=b("classique",o),m.save(t,i)}const r=_(i),a=D(i),c=h.map(o=>`
    <button class="ax-btn ax-cv-template" data-template="${l(o.id)}" style="padding:10px;background:${i?.template===o.id?"rgba(201,162,39,0.2)":"rgba(201,162,39,0.05)"};border:1px solid rgba(201,162,39,0.3);border-radius:8px;cursor:pointer;min-height:60px;text-align:left">
      <div style="font-size:18px">${o.emoji}</div>
      <div style="font-weight:700;color:#c9a227;font-size:13px">${l(o.label)}</div>
      <div style="font-size:11px;color:var(--ax-text-dim)">${l(o.description)}</div>
      <div style="font-size:10px;color:#888;margin-top:4px">ATS: ${o.atsScore}/100</div>
    </button>
  `).join("");n.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:760px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">📄 Studio CV Pro</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">Complétude ${r}% · ATS ${a.score}/100</span>
      </header>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Template (${h.length} disponibles)</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px">${c}</div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Identité</h2>
        <input type="text" id="ax-cv-prenom" aria-label="Prénom CV" placeholder="Prénom" maxlength="100" value="${l(i.identite.prenom)}" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="text" id="ax-cv-nom" aria-label="Nom CV" placeholder="Nom" maxlength="100" value="${l(i.identite.nom)}" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="text" id="ax-cv-titre" aria-label="Titre professionnel CV" placeholder="Titre (ex: Développeur Full-Stack)" maxlength="200" value="${l(i.identite.titre)}" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="email" id="ax-cv-email" aria-label="Email CV" placeholder="Email" maxlength="200" value="${l(i.identite.email)}" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="tel" id="ax-cv-tel" aria-label="Téléphone CV" placeholder="Téléphone" maxlength="50" value="${l(i.identite.telephone)}" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="url" id="ax-cv-linkedin" aria-label="URL LinkedIn CV" placeholder="LinkedIn URL" maxlength="300" value="${l(i.identite.linkedin)}" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Expériences (${i.experiences.length}/${x})</h2>
        <button class="ax-btn ax-btn-primary" id="ax-cv-add-exp" style="min-height:44px">➕ Ajouter une expérience</button>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Formations (${i.formations.length}/${v})</h2>
        <button class="ax-btn ax-btn-primary" id="ax-cv-add-form" style="min-height:44px">➕ Ajouter une formation</button>
      </div>

      <div style="background:rgba(33,150,243,0.05);border:1px solid rgba(33,150,243,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#2196f3">🤖 Outils Pro</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="ax-btn" id="ax-cv-cover-letter" style="min-height:44px">✉ Lettre motivation</button>
          <button class="ax-btn" id="ax-cv-match-offer" style="min-height:44px">🎯 Match offre</button>
          <button class="ax-btn" id="ax-cv-interview" style="min-height:44px">🎤 Simulateur entretien</button>
        </div>
      </div>

      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button class="ax-btn ax-btn-primary" data-export="pdf" style="min-height:44px">💾 Exporter PDF</button>
        <button class="ax-btn" data-export="docx" style="min-height:44px">📝 Exporter DOCX</button>
        <button class="ax-btn" data-export="txt-ats" style="min-height:44px">🤖 Export ATS</button>
        <button class="ax-btn" id="ax-cv-clear" style="min-height:44px;color:#ff6666">🗑 Réinitialiser</button>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#studios" style="color:#c9a227">← Retour studios</a></p>
    </div>
  `,N(n,t)}function N(n,e){n.querySelectorAll(".ax-cv-template").forEach(i=>{p.bind(i,"click",()=>{const r=i.dataset.template;r&&(m.setTemplate(e,r),O(n))})});const t=(i,r)=>{const a=n.querySelector(`#${i}`);a&&p.bind(a,"change",()=>{m.setIdentite(e,{[r]:a.value})})};t("ax-cv-prenom","prenom"),t("ax-cv-nom","nom"),t("ax-cv-titre","titre"),t("ax-cv-email","email"),t("ax-cv-tel","telephone"),t("ax-cv-linkedin","linkedin"),n.querySelectorAll("[data-export]").forEach(i=>{p.bind(i,"click",()=>{const r=i.dataset.export;d.info("studio-cv","export requested",{format:r}),(async()=>{try{const{toast:a}=await q(async()=>{const{toast:c}=await import("./toast-ClsF1KRZ.js");return{toast:c}},[],import.meta.url).catch(()=>({toast:null}));a?.info(`Export ${r.toUpperCase()} en cours…`)}catch(a){d.warn("studio-cv","export failed",{err:a})}})()})})}export{W as ATS_REQUIRED_KEYWORDS_FR,Y as ATS_REQUIRED_SECTIONS,ie as COMPETENCES_PAR_DOMAINE,ee as COVER_LETTER_TEMPLATES,Z as INTERVIEW_QUESTIONS_FR,M as MAX_CERTIFICATIONS,$ as MAX_COMPETENCES,x as MAX_EXPERIENCES,v as MAX_FORMATIONS,P as MAX_PROJECTS,E as MAX_REFERENCES,te as NIVEAUX_CECRL,T as STORAGE_PREFIX,h as TEMPLATES,D as calcATSScore,_ as calcCompleteness,k as createCertification,w as createExperience,R as createFormation,F as createProject,I as createReference,m as cvStudioStore,K as dispose,l as escapeHtml,re as extractGitHubUsername,ne as extractLinkedInSlug,ae as generateCoverLetterTemplate,f as getStorageKey,b as initCV,y as isValidEmail,oe as matchOffer,O as render};
