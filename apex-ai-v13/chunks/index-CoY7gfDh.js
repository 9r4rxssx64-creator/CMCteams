import{a as o,_ as x}from"./apex-kb-DENh8rzx.js";import{s as v}from"../core/main-CkKqQ0fR.js";import{g as b}from"./apex-tools-dispatch-B7G8jfEk.js";import{permissions as w}from"./permissions-BQf0C0F9.js";import"./monitoring-3uBGKGRH.js";import"./credential-patterns-qcw7Brjr.js";import"./multi-source-analyze-LsVLr_Tt.js";import"./apex-tools-registry-CgywmWp5.js";import"./voice-7K-JzHKt.js";const r=["linear-gradient(135deg, #ffd6e8 0%, #c9a4ff 50%, #a4c8ff 100%)","linear-gradient(135deg, #ffe4ec 0%, #ffb3d9 50%, #d4a5ff 100%)","linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)","linear-gradient(135deg, #f6d365 0%, #fda085 100%)","linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)"];function _(){const e=new Date().getHours();return e<5?"Bonne nuit":e<12?"Bonjour":e<18?"Bon après-midi":e<22?"Bonsoir":"Bonne soirée"}function y(){const n=Math.floor(Date.now()/864e5)%r.length;return r[n]??r[0]??"#ffd6e8"}function t(e,n,s){return`
    <button type="button" class="ax-laurence-chip" data-action="${s}">
      <span class="ax-laurence-chip-emoji">${e}</span>
      <span class="ax-laurence-chip-label">${n}</span>
    </button>
  `}function B(e){const n=v.get("user")?.id??"anon";if(!b("module.laurence",e,n))return;const s=_(),g=y(),m=v.get("user")?.name?.split(/\s+/)[0]??localStorage.getItem("apex_v13_laurence_name")??"Laurence";o.record("laurence.view_opened",{details:{greeting:s,ts:Date.now()}}),e.innerHTML=`
    <div class="ax-laurence-app" style="background:${g}">
      <!-- Wallpaper diaporama overlay -->
      <div class="ax-laurence-wallpaper-overlay" aria-hidden="true"></div>

      <!-- Hero -->
      <header class="ax-laurence-hero">
        <div class="ax-laurence-greeting">
          <span class="ax-laurence-emoji-big">🌸</span>
          <h1>${s} <strong>${m}</strong></h1>
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
  `,e.addEventListener("click",i=>{const f=i.target.closest("[data-action]");if(!f)return;const a=f.dataset.action;if(!a)return;o.record("laurence.action_clicked",{details:{action:a,ts:Date.now()}});const u=w.check(a);if(u!=="denied"){if(u==="validate"){o.record("laurence.action_pending_kevin_validation",{details:{action:a}}),x(async()=>{const{toast:d}=await import("./toast-ClsF1KRZ.js");return{toast:d}},[],import.meta.url).then(({toast:d})=>{d.warn(`⏳ Demande envoyée à Kevin pour validation (${a}). Tu seras notifiée dès qu'il aura répondu.`)});return}u==="notify"&&o.record("laurence.action_notified_kevin",{details:{action:a}}),a.startsWith("studio:")?window.location.hash=`#/studios?focus=${a.slice(7)}`:a.startsWith("pro:")?window.location.hash=`#/pro?focus=${a.slice(4)}`:a==="chat:open"?window.location.hash="#/chat":a==="voice:start"&&window.dispatchEvent(new CustomEvent("apex:voice:start"))}});let c=0;const h=setInterval(()=>{c=(c+1)%r.length;const i=e.querySelector(".ax-laurence-app"),l=r[c];i&&l&&(i.style.background=l)},8e3),p=new MutationObserver(()=>{(!document.body.contains(e)||!e.querySelector(".ax-laurence-app"))&&(clearInterval(h),p.disconnect())});p.observe(document.body,{childList:!0,subtree:!0})}const P="v13.0.20";export{P as LAURENCE_VIEW_VERSION,B as render};
