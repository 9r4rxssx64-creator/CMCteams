const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./toast-BkOpdP-z.js","./haptic-BUEqXK0N.js"])))=>i.map(i=>d[i]);
import{l as p,s as f,_ as g}from"../core/main-DP3eEiok.js";const h=[{id:"classique",label:"Classique",description:"Sobre et professionnel, sections claires",emoji:"📋"},{id:"moderne",label:"Moderne",description:"Couleurs vives, design 2026",emoji:"✨"},{id:"creatif",label:"Créatif",description:"Original, idéal métiers artistiques",emoji:"🎨"},{id:"minimaliste",label:"Minimaliste",description:"Épuré, espace blanc, typographie soignée",emoji:"⚪"},{id:"executive",label:"Executive",description:"Cadre dirigeant, sérieux, premium",emoji:"👔"}],m=20,x=10,b=30,v="ax_cv_";function o(r){return r.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function c(r){return`${v}${r}`}function u(r,e){return{template:r,identite:{prenom:e?.prenom??"",nom:e?.nom??"",email:"",telephone:"",adresse:"",titre:""},experiences:[],formations:[],competences:[],langues:["Français (natif)"],loisirs:""}}function y(){return{id:`exp_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,poste:"",entreprise:"",date_debut:"",date_fin:"",description:""}}function S(){return{id:`form_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,diplome:"",ecole:"",annee:""}}function $(r){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r)}function E(r){let e=0;return r.identite.prenom&&(e+=10),r.identite.nom&&(e+=10),r.identite.email&&$(r.identite.email)&&(e+=10),r.identite.telephone&&(e+=5),r.identite.titre&&(e+=10),r.experiences.length>0&&(e+=20),r.experiences.length>=3&&(e+=5),r.formations.length>0&&(e+=15),r.competences.length>=3&&(e+=10),r.langues.length>=2&&(e+=5),Math.min(100,e)}class _{load(e){if(!e)return null;try{const i=localStorage.getItem(c(e));if(!i)return null;const t=JSON.parse(i);return!t||typeof t!="object"?null:t}catch(i){return p.warn("studio-cv","load failed",{err:i}),null}}save(e,i){if(!e)return!1;try{return localStorage.setItem(c(e),JSON.stringify(i)),!0}catch(t){return p.warn("studio-cv","save failed (quota?)",{err:t}),!1}}setTemplate(e,i){const t=this.load(e)??u(i);return t.template=i,this.save(e,t),t}addExperience(e){const i=this.load(e);return i?(i.experiences.length>=m||(i.experiences.push(y()),this.save(e,i)),i):null}addFormation(e){const i=this.load(e);return i?(i.formations.length>=x||(i.formations.push(S()),this.save(e,i)),i):null}removeExperience(e,i){const t=this.load(e);return t?(t.experiences=t.experiences.filter(a=>a.id!==i),this.save(e,t)):!1}removeFormation(e,i){const t=this.load(e);return t?(t.formations=t.formations.filter(a=>a.id!==i),this.save(e,t)):!1}setIdentite(e,i){const t=this.load(e);return t?(t.identite={...t.identite,...i},this.save(e,t)):!1}setCompetences(e,i){const t=this.load(e);return t?(t.competences=i.slice(0,b),this.save(e,t)):!1}clear(e){return e?(localStorage.removeItem(c(e)),!0):!1}}const s=new _;function d(r){const e=f.get("user"),i=e?.id??"anon";let t=s.load(i);if(!t){const n={};e?.firstName&&(n.prenom=e.firstName),e?.lastName&&(n.nom=e.lastName),t=u("classique",n),s.save(i,t)}const a=E(t),l=h.map(n=>`
    <button class="ax-btn ax-cv-template" data-template="${o(n.id)}" style="padding:10px;background:${t?.template===n.id?"rgba(201,162,39,0.2)":"rgba(201,162,39,0.05)"};border:1px solid rgba(201,162,39,0.3);border-radius:8px;cursor:pointer;min-height:60px;text-align:left">
      <div style="font-size:18px">${n.emoji}</div>
      <div style="font-weight:700;color:#c9a227;font-size:13px">${o(n.label)}</div>
      <div style="font-size:11px;color:var(--ax-text-dim)">${o(n.description)}</div>
    </button>
  `).join("");r.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:760px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">📄 Studio CV</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">Complétude : ${a}%</span>
      </header>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Template</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px">${l}</div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Identité</h2>
        <input type="text" id="ax-cv-prenom" placeholder="Prénom" maxlength="100" value="${o(t.identite.prenom)}" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="text" id="ax-cv-nom" placeholder="Nom" maxlength="100" value="${o(t.identite.nom)}" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="text" id="ax-cv-titre" placeholder="Titre (ex: Développeur Full-Stack)" maxlength="200" value="${o(t.identite.titre)}" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="email" id="ax-cv-email" placeholder="Email" maxlength="200" value="${o(t.identite.email)}" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="tel" id="ax-cv-tel" placeholder="Téléphone" maxlength="50" value="${o(t.identite.telephone)}" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Expériences (${t.experiences.length}/${m})</h2>
        <button class="ax-btn ax-btn-primary" id="ax-cv-add-exp" style="min-height:44px">➕ Ajouter une expérience</button>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Formations (${t.formations.length}/${x})</h2>
        <button class="ax-btn ax-btn-primary" id="ax-cv-add-form" style="min-height:44px">➕ Ajouter une formation</button>
      </div>

      <div style="display:flex;gap:8px;justify-content:center">
        <button class="ax-btn ax-btn-primary" id="ax-cv-export" style="min-height:44px">💾 Exporter PDF</button>
        <button class="ax-btn" id="ax-cv-clear" style="min-height:44px;color:#ff6666">🗑 Réinitialiser</button>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#studios" style="color:#c9a227">← Retour studios</a></p>
    </div>
  `,w(r,i)}function w(r,e){r.querySelectorAll(".ax-cv-template").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.template;a&&(s.setTemplate(e,a),d(r))})});const i=(t,a)=>{const l=r.querySelector(`#${t}`);l?.addEventListener("change",()=>{s.setIdentite(e,{[a]:l.value})})};i("ax-cv-prenom","prenom"),i("ax-cv-nom","nom"),i("ax-cv-titre","titre"),i("ax-cv-email","email"),i("ax-cv-tel","telephone"),r.querySelector("#ax-cv-add-exp")?.addEventListener("click",()=>{s.addExperience(e),d(r)}),r.querySelector("#ax-cv-add-form")?.addEventListener("click",()=>{s.addFormation(e),d(r)}),r.querySelector("#ax-cv-clear")?.addEventListener("click",()=>{s.clear(e),d(r)}),r.querySelector("#ax-cv-export")?.addEventListener("click",()=>{p.info("studio-cv","export PDF requested"),(async()=>{try{const{toast:t}=await g(async()=>{const{toast:a}=await import("./toast-BkOpdP-z.js");return{toast:a}},__vite__mapDeps([0,1]),import.meta.url).catch(()=>({toast:null}));t?.info("Export PDF en cours…")}catch(t){p.warn("studio-cv","export PDF failed",{err:t})}})()})}export{b as MAX_COMPETENCES,m as MAX_EXPERIENCES,x as MAX_FORMATIONS,v as STORAGE_PREFIX,h as TEMPLATES,E as calcCompleteness,y as createExperience,S as createFormation,s as cvStudioStore,o as escapeHtml,c as getStorageKey,u as initCV,$ as isValidEmail,d as render};
//# sourceMappingURL=index-BtauAf0E.js.map
