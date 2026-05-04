import{auditLog as i}from"./audit-log-DRoUwS6u.js";import{permissions as g}from"./permissions-DDsRKFea.js";import"../core/main-DJD0WOrQ.js";const r=["linear-gradient(135deg, #ffd6e8 0%, #c9a4ff 50%, #a4c8ff 100%)","linear-gradient(135deg, #ffe4ec 0%, #ffb3d9 50%, #d4a5ff 100%)","linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)","linear-gradient(135deg, #f6d365 0%, #fda085 100%)","linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)"];function h(){const e=new Date().getHours();return e<5?"Bonne nuit":e<12?"Bonjour":e<18?"Bon après-midi":e<22?"Bonsoir":"Bonne soirée"}function x(){const t=Math.floor(Date.now()/864e5)%r.length;return r[t]??r[0]??"#ffd6e8"}function n(e,t,o){return`
    <button type="button" class="ax-laurence-chip" data-action="${o}">
      <span class="ax-laurence-chip-emoji">${e}</span>
      <span class="ax-laurence-chip-label">${t}</span>
    </button>
  `}function y(e){const t=h(),o=x(),f="Laurence";i.record("laurence.view_opened",{details:{greeting:t,ts:Date.now()}}),e.innerHTML=`
    <div class="ax-laurence-app" style="background:${o}">
      <!-- Wallpaper diaporama overlay -->
      <div class="ax-laurence-wallpaper-overlay" aria-hidden="true"></div>

      <!-- Hero -->
      <header class="ax-laurence-hero">
        <div class="ax-laurence-greeting">
          <span class="ax-laurence-emoji-big">🌸</span>
          <h1>${t} <strong>${f}</strong></h1>
          <p class="ax-laurence-subtitle">Qu'est-ce que je peux faire pour toi ?</p>
        </div>
      </header>

      <!-- Suggestions chips -->
      <section class="ax-laurence-suggestions" aria-label="Suggestions">
        ${n("🎵","Mixer une musique","studio:music")}
        ${n("🎬","Monter une vidéo","studio:video")}
        ${n("💬","Discuter","chat:open")}
        ${n("🎙","Dicter","voice:start")}
        ${n("📸","Scanner","studio:scan")}
        ${n("🌐","Traduire","pro:translator")}
        ${n("🍳","Cuisine","pro:cuisine")}
        ${n("🌱","Plantes","studio:plant")}
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
  `,e.addEventListener("click",s=>{const p=s.target.closest("[data-action]");if(!p)return;const a=p.dataset.action;if(!a)return;i.record("laurence.action_clicked",{details:{action:a,ts:Date.now()}});const u=g.check(a);if(u!=="denied"){if(u==="validate"){i.record("laurence.action_pending_kevin_validation",{details:{action:a}});return}u==="notify"&&i.record("laurence.action_notified_kevin",{details:{action:a}}),a.startsWith("studio:")?window.location.hash=`#/studios?focus=${a.slice(7)}`:a.startsWith("pro:")?window.location.hash=`#/pro?focus=${a.slice(4)}`:a==="chat:open"?window.location.hash="#/chat":a==="voice:start"&&window.dispatchEvent(new CustomEvent("apex:voice:start"))}});let c=0;const v=setInterval(()=>{c=(c+1)%r.length;const s=e.querySelector(".ax-laurence-app"),l=r[c];s&&l&&(s.style.background=l)},8e3),d=new MutationObserver(()=>{(!document.body.contains(e)||!e.querySelector(".ax-laurence-app"))&&(clearInterval(v),d.disconnect())});d.observe(document.body,{childList:!0,subtree:!0})}const $="v13.0.20";export{$ as LAURENCE_VIEW_VERSION,y as render};
//# sourceMappingURL=index-DxgFLULY.js.map
