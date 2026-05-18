import{a as o,_ as b}from"./apex-kb-CDiD0QTn.js";import{e as c,a as w}from"./escape-html-BlQj2yEF.js";import{s as v}from"../core/main-D4xmnC8f.js";import{g as _}from"./apex-tools-dispatch-core-ecRvZFpF.js";import{permissions as y}from"./permissions-KBdmK1Rq.js";import"./monitoring-3uBGKGRH.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-CYq0vGhf.js";import"./apex-tools-dispatch-skills-D5azUJ5K.js";import"./apex-tools-dispatch-data-DZ95c6Tm.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-Cqr34q9z.js";import"./apex-tools-misc-J1lTgwfs.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";import"./voice-DIA2dz_L.js";const n=["linear-gradient(135deg, #ffd6e8 0%, #c9a4ff 50%, #a4c8ff 100%)","linear-gradient(135deg, #ffe4ec 0%, #ffb3d9 50%, #d4a5ff 100%)","linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)","linear-gradient(135deg, #f6d365 0%, #fda085 100%)","linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)"];function $(){const e=new Date().getHours();return e<5?"Bonne nuit":e<12?"Bonjour":e<18?"Bon après-midi":e<22?"Bonsoir":"Bonne soirée"}function E(){const r=Math.floor(Date.now()/864e5)%n.length;return n[r]??n[0]??"#ffd6e8"}function t(e,r,s){return`
    <button type="button" class="ax-laurence-chip" data-action="${w(s)}">
      <span class="ax-laurence-chip-emoji">${c(e)}</span>
      <span class="ax-laurence-chip-label">${c(r)}</span>
    </button>
  `}function U(e){const r=v.get("user")?.id??"anon";if(!_("module.laurence",e,r))return;const s=$(),g=E(),h=v.get("user")?.name?.split(/\s+/)[0]??localStorage.getItem("apex_v13_laurence_name")??"Laurence";o.record("laurence.view_opened",{details:{greeting:s,ts:Date.now()}}),e.innerHTML=`
    <div class="ax-laurence-app" style="background:${g}">
      <!-- Wallpaper diaporama overlay -->
      <div class="ax-laurence-wallpaper-overlay" aria-hidden="true"></div>

      <!-- Hero -->
      <header class="ax-laurence-hero">
        <div class="ax-laurence-greeting">
          <span class="ax-laurence-emoji-big">🌸</span>
          <h1>${c(s)} <strong>${c(h)}</strong></h1>
          <p class="ax-laurence-subtitle">Qu'est-ce que je peux faire pour toi ?</p>
        </div>
      </header>

      <!-- Suggestions chips -->
      <section class="ax-laurence-suggestions" aria-label="Suggestions">
        ${t("🎵","Mixer une musique","studio:music")}
        ${t("🎬","Monter une vidéo","studio:video")}
        ${t("💬","Discuter","chat:open")}
        ${t("🎙","Dicter","voice:start")}
        ${t("📸","Scanner","studio:scan")}
        ${t("🌐","Traduire","pro:translator")}
        ${t("🍳","Cuisine","pro:cuisine")}
        ${t("🌱","Plantes","studio:plant")}
      </section>

      <!-- Bouton voice central prominent -->
      <div class="ax-laurence-voice-zone">
        <button type="button" class="ax-laurence-voice-btn" data-action="voice:start" aria-label="Parler à Apex">
          <span class="ax-laurence-voice-emoji">🎙</span>
          <span class="ax-laurence-voice-pulse"></span>
        </button>
        <p class="ax-laurence-voice-hint">Touche pour parler<br>ou dis <strong>"Dis Apex"</strong></p>
      </div>

      <!-- Mes derniers projets -->
      <section class="ax-laurence-projects" aria-label="Mes projets récents">
        <h2>📂 Mes derniers projets</h2>
        <div class="ax-laurence-projects-list" id="ax-laurence-projects-list">
          <!-- Empty state élégant -->
          <div class="ax-laurence-empty">
            <span class="ax-laurence-empty-emoji">✨</span>
            <p>Tes projets apparaîtront ici dès la première création.</p>
          </div>
        </div>
      </section>

      <!-- Footer minimaliste -->
      <footer class="ax-laurence-footer">
        <span class="ax-laurence-footer-brand">APEX AI</span>
        <span class="ax-laurence-footer-by">Créé par DK</span>
      </footer>
    </div>
  `,e.addEventListener("click",i=>{const m=i.target.closest("[data-action]");if(!m)return;const a=m.dataset.action;if(!a)return;o.record("laurence.action_clicked",{details:{action:a,ts:Date.now()}});const p=y.check(a);if(p!=="denied"){if(p==="validate"){o.record("laurence.action_pending_kevin_validation",{details:{action:a}}),b(async()=>{const{toast:d}=await import("./toast-CRdbcLoc.js");return{toast:d}},[],import.meta.url).then(({toast:d})=>{d.warn(`⏳ Demande envoyée à Kevin pour validation (${a}). Tu seras notifiée dès qu'il aura répondu.`)});return}p==="notify"&&o.record("laurence.action_notified_kevin",{details:{action:a}}),a.startsWith("studio:")?window.location.hash=`#/studios?focus=${a.slice(7)}`:a.startsWith("pro:")?window.location.hash=`#/pro?focus=${a.slice(4)}`:a==="chat:open"?window.location.hash="#/chat":a==="voice:start"&&window.dispatchEvent(new CustomEvent("apex:voice:start"))}});let l=0;const x=setInterval(()=>{l=(l+1)%n.length;const i=e.querySelector(".ax-laurence-app"),u=n[l];i&&u&&(i.style.background=u)},8e3),f=new MutationObserver(()=>{(!document.body.contains(e)||!e.querySelector(".ax-laurence-app"))&&(clearInterval(x),f.disconnect())});f.observe(document.body,{childList:!0,subtree:!0})}const O="v13.0.20";export{O as LAURENCE_VIEW_VERSION,U as render};
