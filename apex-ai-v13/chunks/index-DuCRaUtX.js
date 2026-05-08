const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./toast-Dgg9rcIP.js","./haptic-BUEqXK0N.js"])))=>i.map(i=>d[i]);
import{a as i,_ as m}from"./apex-kb-DEV0ns6l.js";import{s as h}from"../core/main-BqtLFpxm.js";import{permissions as x}from"./permissions-DPdPn5Kq.js";import"./monitoring-BAiQJoxJ.js";import"./credential-patterns-Dy6Wjk7e.js";import"./multi-source-analyze-Cjv0lJFa.js";const r=["linear-gradient(135deg, #ffd6e8 0%, #c9a4ff 50%, #a4c8ff 100%)","linear-gradient(135deg, #ffe4ec 0%, #ffb3d9 50%, #d4a5ff 100%)","linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)","linear-gradient(135deg, #f6d365 0%, #fda085 100%)","linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)"];function b(){const e=new Date().getHours();return e<5?"Bonne nuit":e<12?"Bonjour":e<18?"Bon après-midi":e<22?"Bonsoir":"Bonne soirée"}function w(){const n=Math.floor(Date.now()/864e5)%r.length;return r[n]??r[0]??"#ffd6e8"}function t(e,n,o){return`
    <button type="button" class="ax-laurence-chip" data-action="${o}">
      <span class="ax-laurence-chip-emoji">${e}</span>
      <span class="ax-laurence-chip-label">${n}</span>
    </button>
  `}function A(e){const n=b(),o=w(),v=h.get("user")?.name?.split(/\s+/)[0]??localStorage.getItem("apex_v13_laurence_name")??"Laurence";i.record("laurence.view_opened",{details:{greeting:n,ts:Date.now()}}),e.innerHTML=`
    <div class="ax-laurence-app" style="background:${o}">
      <!-- Wallpaper diaporama overlay -->
      <div class="ax-laurence-wallpaper-overlay" aria-hidden="true"></div>

      <!-- Hero -->
      <header class="ax-laurence-hero">
        <div class="ax-laurence-greeting">
          <span class="ax-laurence-emoji-big">🌸</span>
          <h1>${n} <strong>${v}</strong></h1>
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
  `,e.addEventListener("click",s=>{const f=s.target.closest("[data-action]");if(!f)return;const a=f.dataset.action;if(!a)return;i.record("laurence.action_clicked",{details:{action:a,ts:Date.now()}});const u=x.check(a);if(u!=="denied"){if(u==="validate"){i.record("laurence.action_pending_kevin_validation",{details:{action:a}}),m(async()=>{const{toast:d}=await import("./toast-Dgg9rcIP.js");return{toast:d}},__vite__mapDeps([0,1]),import.meta.url).then(({toast:d})=>{d.warn(`⏳ Demande envoyée à Kevin pour validation (${a}). Tu seras notifiée dès qu'il aura répondu.`)});return}u==="notify"&&i.record("laurence.action_notified_kevin",{details:{action:a}}),a.startsWith("studio:")?window.location.hash=`#/studios?focus=${a.slice(7)}`:a.startsWith("pro:")?window.location.hash=`#/pro?focus=${a.slice(4)}`:a==="chat:open"?window.location.hash="#/chat":a==="voice:start"&&window.dispatchEvent(new CustomEvent("apex:voice:start"))}});let c=0;const g=setInterval(()=>{c=(c+1)%r.length;const s=e.querySelector(".ax-laurence-app"),l=r[c];s&&l&&(s.style.background=l)},8e3),p=new MutationObserver(()=>{(!document.body.contains(e)||!e.querySelector(".ax-laurence-app"))&&(clearInterval(g),p.disconnect())});p.observe(document.body,{childList:!0,subtree:!0})}const I="v13.0.20";export{I as LAURENCE_VIEW_VERSION,A as render};
