const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-tools-dispatch-C56eOcsz.js","../core/main-B0S6fS4k.js","../assets/css/main-BEeSXdcc.css","./apex-tools-CSlfcJc4.js","./audit-log-B_PeOxy-.js","./firebase-PpozAIts.js","./orchestrator-D1wYpuwY.js","./smart-tools-suggester-B6Z2EkGB.js","./vault-CB4bGiIy.js","./credential-patterns-Ct__OCbr.js","./smart-camera-CUoJa-ev.js","./admin-prompt-DeBjd28v.js","./toast-DbVEuO4x.js","./ai-router-CFtB3sBi.js","./chat-fallback-tgdvj6fn.js","./pii-redaction-BenraFWG.js","./tokens-dashboard-C5ZzZyK6.js","./commerce-2eNC9_h4.js","./auth-BXimJosI.js"])))=>i.map(i=>d[i]);
import{s as f,_ as h,l as L,e as D,m as P}from"../core/main-B0S6fS4k.js";import{aiRouter as S}from"./ai-router-CFtB3sBi.js";import{commerce as q}from"./commerce-2eNC9_h4.js";import{vault as I}from"./vault-CB4bGiIy.js";import{h as x,t as p}from"./toast-DbVEuO4x.js";class M{idCounter=0;active=null;open(e){this.active&&this.active.close();const i=`ax-sheet-${++this.idCounter}-${Date.now()}`,t=document.createElement("div");t.className="ax-sheet-overlay",t.id=i,t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),e.title&&t.setAttribute("aria-label",e.title);const l=document.createElement("div");l.className="ax-sheet";const v=e.title?`<div class="ax-sheet-header">
          <h2 class="ax-sheet-title">${this.escapeHtml(e.title)}</h2>
          ${e.dismissable!==!1?'<button class="ax-sheet-close" aria-label="Fermer">×</button>':""}
        </div>`:"",d=e.actions&&e.actions.length>0?`<div class="ax-sheet-actions">${e.actions.map((a,n)=>`
              <button class="ax-btn ax-btn-${a.variant??"ghost"}" data-action-idx="${n}">
                ${this.escapeHtml(a.label)}
              </button>`).join("")}</div>`:"";l.innerHTML=`
      <div class="ax-sheet-handle"></div>
      ${v}
      <div class="ax-sheet-body">${e.content}</div>
      ${d}
    `,t.appendChild(l),document.body.appendChild(t),requestAnimationFrame(()=>{t.classList.add("ax-sheet-visible"),l.classList.add("ax-sheet-up");const a=l.querySelector('input:not([type="hidden"]), textarea, select');a&&(a.focus(),setTimeout(()=>{a.scrollIntoView({behavior:"smooth",block:"center"})},350))}),x.medium();const r=()=>{t.classList.remove("ax-sheet-visible"),l.classList.remove("ax-sheet-up"),l.classList.add("ax-sheet-down"),setTimeout(()=>{t.remove(),this.active&&this.active.el===t&&(this.active=null)},300)};if(e.dismissable!==!1){t.addEventListener("click",n=>{n.target===t&&(x.tap(),r())}),l.querySelector(".ax-sheet-close")?.addEventListener("click",()=>{x.tap(),r()});const a=n=>{n.key==="Escape"&&(r(),document.removeEventListener("keydown",a))};document.addEventListener("keydown",a)}e.actions&&l.querySelectorAll("[data-action-idx]").forEach(a=>{const n=Number(a.dataset.actionIdx),m=e.actions?.[n];m&&a.addEventListener("click",()=>{x.tap(),m.onClick()})});const b={el:t,close:r};return this.active=b,b}closeAll(){this.active&&(this.active.close(),this.active=null),document.querySelectorAll(".ax-sheet-overlay").forEach(e=>e.remove())}escapeHtml(e){return e.replace(/[&<>"']/g,i=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[i]??i)}}const C=new M,_=[],$=[];let A=!1;function y(s){return s.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function k(s){let e=y(s);return e=e.replace(/```([\s\S]*?)```/g,(i,t)=>`<pre class="ax-code"><code>${t}</code></pre>`),e=e.replace(/`([^`\n]+)`/g,'<code class="ax-code-inline">$1</code>'),e=e.replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>"),e=e.replace(/\*([^*\n]+)\*/g,"<em>$1</em>"),e=e.replace(/\n/g,"<br>"),e}function H(){const s=f.get("user");return P.buildSystemPromptContext(s)}async function R(s,e){try{const{apexToolsDispatch:i}=await h(async()=>{const{apexToolsDispatch:n}=await import("./apex-tools-dispatch-C56eOcsz.js");return{apexToolsDispatch:n}},__vite__mapDeps([0,1,2,3,4,5,6]),import.meta.url),t=await i.execute("detect_intent",{text:s},"admin");if(!t.ok||!t.result)return;const l=t.result.intent,v=t.result.confidence??0;if(!l||l==="unknown"||v<.7)return;const{smartToolsSuggester:d}=await h(async()=>{const{smartToolsSuggester:n}=await import("./smart-tools-suggester-B6Z2EkGB.js");return{smartToolsSuggester:n}},__vite__mapDeps([7,1,2,4]),import.meta.url),r=d.suggestForIntent(l);if(!r)return;const{toast:b}=await h(async()=>{const{toast:n}=await import("./toast-DbVEuO4x.js").then(m=>m.a);return{toast:n}},[],import.meta.url);b.info(`${r.emoji} ${r.name} disponible — tape pour ouvrir`,{duration:5e3});const a=f.get("user");a?.id&&d.recordUsage(r.id,a.id),O(e,r)}catch(i){L.warn("chat","detectAndSuggestTool failed",{err:i})}}function O(s,e){const i=s.querySelector(".ax-chat-scroll");if(!i)return;const t=document.createElement("div");t.className="ax-msg ax-msg-tool ax-slide-up-fade",t.innerHTML=`
    <div class="ax-tool-card">
      <div class="ax-tool-icon">${e.emoji}</div>
      <div class="ax-tool-info">
        <strong>${y(e.name)}</strong>
        <p style="margin:4px 0 0;color:var(--ax-text-dim);font-size:13px">${y(e.description)}</p>
      </div>
      <button class="ax-btn ax-btn-primary ax-btn-sm" onclick="location.hash='${y(e.cta_target)}'">${y(e.cta_label)}</button>
    </div>
  `,i.appendChild(t),i.scrollTo({top:i.scrollHeight,behavior:"smooth"})}async function T(s){if(A||$.length===0)return;A=!0;const e=$.shift();if(e===void 0){A=!1;return}const i=f.get("user");if(!q.consumeMessage(i?.id??null).allowed){V(s,"Tu as atteint ta limite quotidienne. Passe en plan supérieur ou réessaie demain."),A=!1;return}R(e,s);const l={id:`u_${Date.now()}`,role:"user",text:e,ts:Date.now()};_.push(l);const v={id:`a_${Date.now()}`,role:"assistant",text:"",ts:Date.now(),streaming:!0};_.push(v),f.set("isStreaming",!0),w(s);const d=_.filter(r=>!r.streaming||r===v).slice(-30).filter(r=>r!==v).map(r=>({role:r.role,content:r.text}));await S.stream(d,H(),r=>{r.text&&(v.text+=r.text,j(s,v)),r.done&&(delete v.streaming,f.set("isStreaming",!1),w(s))},r=>{v.text=D.toUserMessage(r)+" (Apex bascule sur le mode hors-ligne — réessaie dans un instant.)",delete v.streaming,f.set("isStreaming",!1),w(s)}),A=!1,$.length&&T(s)}function V(s,e){_.push({id:`a_${Date.now()}`,role:"assistant",text:e,ts:Date.now()}),w(s)}function j(s,e){const i=s.querySelector(`[data-msg-id="${e.id}"] .ax-msg-body`);if(i){i.innerHTML=k(e.text)+(e.streaming?'<span class="ax-cursor">▌</span>':"");const t=s.querySelector(".ax-chat-scroll");t&&t.scrollTo({top:t.scrollHeight,behavior:"smooth"})}else w(s)}function w(s){const e=s.querySelector(".ax-chat-scroll");if(!e)return;const i=_.map(t=>{let l="";return t.streaming&&(t.text.length===0?l=`
            <span class="ax-typing" aria-label="Apex réfléchit">
              <span class="ax-typing-dot"></span>
              <span class="ax-typing-dot"></span>
              <span class="ax-typing-dot"></span>
            </span>
          `:l='<span class="ax-cursor">▌</span>'),`
        <div class="ax-msg ax-msg-${t.role} ax-slide-up-fade" data-msg-id="${t.id}">
          <div class="ax-msg-body">${k(t.text)}${l}</div>
        </div>
      `}).join("");e.innerHTML=i,e.scrollTo({top:e.scrollHeight,behavior:"smooth"})}function E(s){const e=f.get("user"),i=e?`Bonjour ${e.name}, qu'est-ce que je peux faire pour toi ?`:"Bienvenue dans Apex.",t=f.get("isAdmin"),l=S.hasAnyKey();s.innerHTML=`
    <div class="ax-chat">
      <header class="ax-chat-header">
        <h1>APEX <span style="font-size:0.6em;letter-spacing:1px;color:var(--ax-text-dim)">AI</span></h1>
        <button class="ax-btn ax-btn-icon" id="ax-chat-menu" aria-label="Menu">☰</button>
      </header>
      <div class="ax-chat-scroll" role="log" aria-live="polite" aria-atomic="false">
        <div class="ax-chat-greeting">${y(i)}</div>
        ${l?"":`
          <div class="ax-info-card" style="margin:16px;">
            <h3>🔑 Aucune clé API configurée</h3>
            <p>Pour discuter avec Apex, ajoute une clé API IA. Coller une clé Anthropic, OpenAI, Groq ou Gemini :</p>
            <button class="ax-btn ax-btn-primary" id="ax-paste-key">📋 Coller une clé API</button>
          </div>
        `}
      </div>
      <form class="ax-chat-input" id="ax-chat-form">
        <textarea
          id="ax-chat-text"
          rows="1"
          placeholder="Écris, dicte 🎙 ou scanne 📷"
          aria-label="Message"
          autocomplete="off"
        ></textarea>
        <button type="button" class="ax-btn ax-btn-icon" id="ax-chat-camera" aria-label="Ouvrir caméra" title="Caméra (photo, scan, QR, vidéo)">📷</button>
        <button type="submit" class="ax-btn ax-btn-primary" aria-label="Envoyer">→</button>
      </form>
      <nav class="ax-chat-nav" style="display:flex;gap:8px;padding:8px;border-top:1px solid var(--ax-border);overflow-x:auto;background:var(--ax-bg-glass)">
        <button class="ax-btn ax-btn-sm" onclick="location.hash='#chat'">💬 Chat</button>
        ${t?`<button class="ax-btn ax-btn-sm" onclick="location.hash='#admin'">⚙️ Admin</button>`:""}
        <button class="ax-btn ax-btn-sm" id="ax-paste-key-nav">🔑 Clé API</button>
        <button class="ax-btn ax-btn-sm" id="ax-logout-nav">🚪 Déconnexion</button>
      </nav>
      <footer style="text-align:center;padding:6px;font-size:11px;color:var(--ax-text-muted);background:var(--ax-bg)">
        APEX AI v13.0 — Créé par <strong style="color:var(--ax-gold)">DK</strong>
      </footer>
    </div>
  `;const v=s.querySelector("#ax-chat-form"),d=s.querySelector("#ax-chat-text");v&&d&&(v.addEventListener("submit",a=>{a.preventDefault();const n=d.value.trim();n&&(async()=>{const{detectCredential:m}=await h(async()=>{const{detectCredential:u}=await import("./credential-patterns-Ct__OCbr.js");return{detectCredential:u}},[],import.meta.url),o=m(n);if(o&&o.category!=="forbidden"&&o.category!=="identity"){d.value="";const{vault:u}=await h(async()=>{const{vault:g}=await import("./vault-CB4bGiIy.js");return{vault:g}},__vite__mapDeps([8,1,2,9]),import.meta.url),c=await u.autoStore(n);c.ok&&c.pattern?p.success(`🔑 ${c.pattern.name} détectée + chiffrée + stockée`):p.error(c.reason??"Erreur stockage clé");return}d.value="",d.style.height="auto",$.push(n),T(s)})()}),d.addEventListener("input",()=>{d.style.height="auto",d.style.height=`${Math.min(d.scrollHeight,200)}px`}),d.addEventListener("keydown",a=>{a.key==="Enter"&&!a.shiftKey&&(a.preventDefault(),v.requestSubmit())}),d.addEventListener("paste",a=>{const n=a.clipboardData?.getData("text")?.trim()??"";n&&(async()=>{const{detectCredential:m}=await h(async()=>{const{detectCredential:u}=await import("./credential-patterns-Ct__OCbr.js");return{detectCredential:u}},[],import.meta.url),o=m(n);if(o&&o.category!=="forbidden"&&o.category!=="identity"){a.preventDefault(),d.value="";const{vault:u}=await h(async()=>{const{vault:g}=await import("./vault-CB4bGiIy.js");return{vault:g}},__vite__mapDeps([8,1,2,9]),import.meta.url),c=await u.autoStore(n);c.ok&&c.pattern?p.success(`🔑 ${c.pattern.name} détectée auto + chiffrée AES-GCM-256`):p.error(c.reason??"Erreur stockage")}})()})),s.querySelector("#ax-chat-camera")?.addEventListener("click",()=>{x.tap(),(async()=>{try{const{smartCamera:a}=await h(async()=>{const{smartCamera:o}=await import("./smart-camera-CUoJa-ev.js");return{smartCamera:o}},__vite__mapDeps([10,1,2,4]),import.meta.url),{adminPrompt:n}=await h(async()=>{const{adminPrompt:o}=await import("./admin-prompt-DeBjd28v.js");return{adminPrompt:o}},__vite__mapDeps([11,12,4,1,2,5,13,14,15,16,17,8,9]),import.meta.url),m=await n.askChoice("📷 Caméra","Choisis le mode :",[{id:"single",label:"Photo simple",emoji:"📷",variant:"primary"},{id:"burst",label:"Rafale (5 photos)",emoji:"⚡",variant:"ghost"},{id:"qr_live",label:"Scanner QR/Code-barre",emoji:"⬛",variant:"ghost"},{id:"video_record",label:"Enregistrer vidéo (30s)",emoji:"🎬",variant:"ghost"}]);if(!m)return;if(m==="single"){const o=await a.captureSingle();if(!o.ok){p.error(o.reason??"Capture échouée");return}const u=o.dataUrls?.[0];if(u){const c=s.querySelector(".ax-chat-scroll");if(c){const g=document.createElement("div");g.className="ax-msg ax-msg-user ax-slide-up-fade",g.innerHTML=`<img src="${u}" alt="Capture caméra" style="max-width:100%;border-radius:8px">`,c.appendChild(g),c.scrollTo({top:c.scrollHeight,behavior:"smooth"})}p.success("Photo capturée")}}else if(m==="burst"){const o=await a.captureBurst(5,200);p.info(o.ok?`${o.count} photos capturées`:o.reason??"Échec")}else if(m==="qr_live")await a.scanQrLive(o=>{for(const u of o)p.success(`📦 ${u.format}: ${u.rawValue.slice(0,80)}`)},{durationMs:15e3});else if(m==="video_record"){const o=await a.startVideoRecord(3e4);if(!o.ok){p.error(o.reason??"Recording impossible");return}p.info("🔴 Enregistrement 30s..."),setTimeout(()=>{a.stopVideoRecord().then(u=>{u.ok&&p.success(`Vidéo ${Math.round((u.blob?.size??0)/1024)}KB`)})},3e4)}}catch(a){p.error(a instanceof Error?a.message:"Erreur caméra")}})()});const b=a=>{s.querySelector(a)?.addEventListener("click",()=>{x.tap();const m=C.open({title:"🔑 Coller ta clé API",content:`
          <p style="margin:0 0 16px;color:var(--ax-text-dim)">
            Apex détecte automatiquement le service (Anthropic, OpenAI, Stripe, GitHub, etc.) et la range au bon endroit.
          </p>
          <textarea id="ax-paste-input" rows="3"
            placeholder="Colle ici ta clé / token / credential"
            style="width:100%;padding:12px;background:var(--ax-bg-input);border:1px solid var(--ax-border);border-radius:8px;color:var(--ax-text);font-family:var(--ax-font-mono);font-size:13px"
            autofocus spellcheck="false" autocomplete="off"></textarea>
          <p class="ax-muted" style="margin-top:8px">130+ patterns reconnus · 0 stockage des données interdites (CB, seed)</p>
        `,actions:[{label:"Annuler",variant:"ghost",onClick:()=>{x.tap(),m.close()}},{label:"Coller + ranger",variant:"primary",onClick:()=>{const u=document.getElementById("ax-paste-input")?.value.trim()??"";if(!u){p.warn("Colle une clé d'abord");return}m.close(),(async()=>{const c=await I.autoStore(u);if(c.forbidden){x.error(),p.error(`${c.pattern?.name} : Apex ne stocke jamais ce type de donnée pour ta sécurité.`,{duration:6e3});return}if(!c.ok){x.warning(),p.warn("Format non reconnu : "+(c.reason??"inconnu"));return}x.success();const g=c.valid===!0?" ✅ validée":c.valid===!1?" ⚠️ ping échoué":"";p.success(`${c.pattern?.name} rangée${g}`),E(s)})()}}]})})};b("#ax-paste-key"),b("#ax-paste-key-nav"),s.querySelector("#ax-logout-nav")?.addEventListener("click",()=>{x.tap();const a=C.open({title:"Déconnexion ?",content:"<p>Tes données restent sauvegardées (Coffre, conversations, profil).</p>",actions:[{label:"Annuler",variant:"ghost",onClick:()=>a.close()},{label:"Déconnecter",variant:"danger",onClick:()=>{x.medium(),a.close(),h(()=>import("./auth-BXimJosI.js"),__vite__mapDeps([18,1,2]),import.meta.url).then(n=>{n.auth.logout(),p.info("Déconnecté"),location.hash="#landing"})}}]})}),_.length&&w(s),L.info("chat","Chat view rendered")}const G=Object.freeze(Object.defineProperty({__proto__:null,escapeHtml:y,render:E,renderMarkdownLight:k},Symbol.toStringTag,{value:"Module"}));export{G as i,C as m};
//# sourceMappingURL=index-DrrZGPhL.js.map
