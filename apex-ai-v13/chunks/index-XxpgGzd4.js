const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-tools-dispatch-neVyz9Kt.js","../core/main-CfiDO_LS.js","../assets/css/main-BEeSXdcc.css","./apex-tools-m-pcfpsD.js","./audit-log-Cc_j6Kdz.js","./firebase-CU4W4eEb.js","./orchestrator-CwrF8GN_.js","./smart-tools-suggester-BmSCCDfX.js","./smart-camera-BHrwCh5w.js","./admin-prompt-DVsuoWpe.js","./toast-DbVEuO4x.js","./ai-router-PNxIr2BW.js","./chat-fallback-CKsK8-E_.js","./pii-redaction-BenraFWG.js","./tokens-dashboard-C5ZzZyK6.js","./commerce-BV08DsWO.js","./vault-DOt3AF-0.js","./credential-patterns-Ct__OCbr.js","./auth-CVUcBq3R.js"])))=>i.map(i=>d[i]);
import{s as v,_ as b,l as C,e as P,m as M}from"../core/main-CfiDO_LS.js";import{aiRouter as L}from"./ai-router-PNxIr2BW.js";import{commerce as D}from"./commerce-BV08DsWO.js";import{vault as E}from"./vault-DOt3AF-0.js";import{h as x,t as m}from"./toast-DbVEuO4x.js";class I{idCounter=0;active=null;open(e){this.active&&this.active.close();const o=`ax-sheet-${++this.idCounter}-${Date.now()}`,t=document.createElement("div");t.className="ax-sheet-overlay",t.id=o,t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),e.title&&t.setAttribute("aria-label",e.title);const r=document.createElement("div");r.className="ax-sheet";const l=e.title?`<div class="ax-sheet-header">
          <h2 class="ax-sheet-title">${this.escapeHtml(e.title)}</h2>
          ${e.dismissable!==!1?'<button class="ax-sheet-close" aria-label="Fermer">×</button>':""}
        </div>`:"",d=e.actions&&e.actions.length>0?`<div class="ax-sheet-actions">${e.actions.map((s,i)=>`
              <button class="ax-btn ax-btn-${s.variant??"ghost"}" data-action-idx="${i}">
                ${this.escapeHtml(s.label)}
              </button>`).join("")}</div>`:"";r.innerHTML=`
      <div class="ax-sheet-handle"></div>
      ${l}
      <div class="ax-sheet-body">${e.content}</div>
      ${d}
    `,t.appendChild(r),document.body.appendChild(t),requestAnimationFrame(()=>{t.classList.add("ax-sheet-visible"),r.classList.add("ax-sheet-up");const s=r.querySelector('input:not([type="hidden"]), textarea, select');s&&(s.focus(),setTimeout(()=>{s.scrollIntoView({behavior:"smooth",block:"center"})},350))}),x.medium();const n=()=>{t.classList.remove("ax-sheet-visible"),r.classList.remove("ax-sheet-up"),r.classList.add("ax-sheet-down"),setTimeout(()=>{t.remove(),this.active&&this.active.el===t&&(this.active=null)},300)};if(e.dismissable!==!1){t.addEventListener("click",i=>{i.target===t&&(x.tap(),n())}),r.querySelector(".ax-sheet-close")?.addEventListener("click",()=>{x.tap(),n()});const s=i=>{i.key==="Escape"&&(n(),document.removeEventListener("keydown",s))};document.addEventListener("keydown",s)}e.actions&&r.querySelectorAll("[data-action-idx]").forEach(s=>{const i=Number(s.dataset.actionIdx),u=e.actions?.[i];u&&s.addEventListener("click",()=>{x.tap(),u.onClick()})});const g={el:t,close:n};return this.active=g,g}closeAll(){this.active&&(this.active.close(),this.active=null),document.querySelectorAll(".ax-sheet-overlay").forEach(e=>e.remove())}escapeHtml(e){return e.replace(/[&<>"']/g,o=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[o]??o)}}const S=new I,y=[],$=[];let A=!1;function f(a){return a.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function k(a){let e=f(a);return e=e.replace(/```([\s\S]*?)```/g,(o,t)=>`<pre class="ax-code"><code>${t}</code></pre>`),e=e.replace(/`([^`\n]+)`/g,'<code class="ax-code-inline">$1</code>'),e=e.replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>"),e=e.replace(/\*([^*\n]+)\*/g,"<em>$1</em>"),e=e.replace(/\n/g,"<br>"),e}function H(){const a=v.get("user");return M.buildSystemPromptContext(a)}async function j(a,e){try{const{apexToolsDispatch:o}=await b(async()=>{const{apexToolsDispatch:i}=await import("./apex-tools-dispatch-neVyz9Kt.js");return{apexToolsDispatch:i}},__vite__mapDeps([0,1,2,3,4,5,6]),import.meta.url),t=await o.execute("detect_intent",{text:a},"admin");if(!t.ok||!t.result)return;const r=t.result.intent,l=t.result.confidence??0;if(!r||r==="unknown"||l<.7)return;const{smartToolsSuggester:d}=await b(async()=>{const{smartToolsSuggester:i}=await import("./smart-tools-suggester-BmSCCDfX.js");return{smartToolsSuggester:i}},__vite__mapDeps([7,1,2,4]),import.meta.url),n=d.suggestForIntent(r);if(!n)return;const{toast:g}=await b(async()=>{const{toast:i}=await import("./toast-DbVEuO4x.js").then(u=>u.a);return{toast:i}},[],import.meta.url);g.info(`${n.emoji} ${n.name} disponible — tape pour ouvrir`,{duration:5e3});const s=v.get("user");s?.id&&d.recordUsage(n.id,s.id),R(e,n)}catch(o){C.warn("chat","detectAndSuggestTool failed",{err:o})}}function R(a,e){const o=a.querySelector(".ax-chat-scroll");if(!o)return;const t=document.createElement("div");t.className="ax-msg ax-msg-tool ax-slide-up-fade",t.innerHTML=`
    <div class="ax-tool-card">
      <div class="ax-tool-icon">${e.emoji}</div>
      <div class="ax-tool-info">
        <strong>${f(e.name)}</strong>
        <p style="margin:4px 0 0;color:var(--ax-text-dim);font-size:13px">${f(e.description)}</p>
      </div>
      <button class="ax-btn ax-btn-primary ax-btn-sm" onclick="location.hash='${f(e.cta_target)}'">${f(e.cta_label)}</button>
    </div>
  `,o.appendChild(t),o.scrollTo({top:o.scrollHeight,behavior:"smooth"})}async function T(a){if(A||$.length===0)return;A=!0;const e=$.shift();if(e===void 0){A=!1;return}const o=v.get("user");if(!D.consumeMessage(o?.id??null).allowed){O(a,"Tu as atteint ta limite quotidienne. Passe en plan supérieur ou réessaie demain."),A=!1;return}j(e,a);const r={id:`u_${Date.now()}`,role:"user",text:e,ts:Date.now()};y.push(r);const l={id:`a_${Date.now()}`,role:"assistant",text:"",ts:Date.now(),streaming:!0};y.push(l),v.set("isStreaming",!0),_(a);const d=y.filter(n=>!n.streaming||n===l).slice(-30).filter(n=>n!==l).map(n=>({role:n.role,content:n.text}));await L.stream(d,H(),n=>{n.text&&(l.text+=n.text,V(a,l)),n.done&&(delete l.streaming,v.set("isStreaming",!1),_(a))},n=>{l.text=P.toUserMessage(n)+" (Apex bascule sur le mode hors-ligne — réessaie dans un instant.)",delete l.streaming,v.set("isStreaming",!1),_(a)}),A=!1,$.length&&T(a)}function O(a,e){y.push({id:`a_${Date.now()}`,role:"assistant",text:e,ts:Date.now()}),_(a)}function V(a,e){const o=a.querySelector(`[data-msg-id="${e.id}"] .ax-msg-body`);if(o){o.innerHTML=k(e.text)+(e.streaming?'<span class="ax-cursor">▌</span>':"");const t=a.querySelector(".ax-chat-scroll");t&&t.scrollTo({top:t.scrollHeight,behavior:"smooth"})}else _(a)}function _(a){const e=a.querySelector(".ax-chat-scroll");if(!e)return;const o=y.map(t=>{let r="";return t.streaming&&(t.text.length===0?r=`
            <span class="ax-typing" aria-label="Apex réfléchit">
              <span class="ax-typing-dot"></span>
              <span class="ax-typing-dot"></span>
              <span class="ax-typing-dot"></span>
            </span>
          `:r='<span class="ax-cursor">▌</span>'),`
        <div class="ax-msg ax-msg-${t.role} ax-slide-up-fade" data-msg-id="${t.id}">
          <div class="ax-msg-body">${k(t.text)}${r}</div>
        </div>
      `}).join("");e.innerHTML=o,e.scrollTo({top:e.scrollHeight,behavior:"smooth"})}function q(a){const e=v.get("user"),o=e?`Bonjour ${e.name}, qu'est-ce que je peux faire pour toi ?`:"Bienvenue dans Apex.",t=v.get("isAdmin"),r=L.hasAnyKey();a.innerHTML=`
    <div class="ax-chat">
      <header class="ax-chat-header">
        <h1>APEX <span style="font-size:0.6em;letter-spacing:1px;color:var(--ax-text-dim)">AI</span></h1>
        <button class="ax-btn ax-btn-icon" id="ax-chat-menu" aria-label="Menu">☰</button>
      </header>
      <div class="ax-chat-scroll" role="log" aria-live="polite" aria-atomic="false">
        <div class="ax-chat-greeting">${f(o)}</div>
        ${r?"":`
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
  `;const l=a.querySelector("#ax-chat-form"),d=a.querySelector("#ax-chat-text");l&&d&&(l.addEventListener("submit",s=>{s.preventDefault();const i=d.value.trim();i&&(d.value="",d.style.height="auto",$.push(i),T(a))}),d.addEventListener("input",()=>{d.style.height="auto",d.style.height=`${Math.min(d.scrollHeight,200)}px`}),d.addEventListener("keydown",s=>{s.key==="Enter"&&!s.shiftKey&&(s.preventDefault(),l.requestSubmit())})),a.querySelector("#ax-chat-camera")?.addEventListener("click",()=>{x.tap(),(async()=>{try{const{smartCamera:s}=await b(async()=>{const{smartCamera:c}=await import("./smart-camera-BHrwCh5w.js");return{smartCamera:c}},__vite__mapDeps([8,1,2,4]),import.meta.url),{adminPrompt:i}=await b(async()=>{const{adminPrompt:c}=await import("./admin-prompt-DVsuoWpe.js");return{adminPrompt:c}},__vite__mapDeps([9,10,4,1,2,5,11,12,13,14,15,16,17]),import.meta.url),u=await i.askChoice("📷 Caméra","Choisis le mode :",[{id:"single",label:"Photo simple",emoji:"📷",variant:"primary"},{id:"burst",label:"Rafale (5 photos)",emoji:"⚡",variant:"ghost"},{id:"qr_live",label:"Scanner QR/Code-barre",emoji:"⬛",variant:"ghost"},{id:"video_record",label:"Enregistrer vidéo (30s)",emoji:"🎬",variant:"ghost"}]);if(!u)return;if(u==="single"){const c=await s.captureSingle();if(!c.ok){m.error(c.reason??"Capture échouée");return}const h=c.dataUrls?.[0];if(h){const p=a.querySelector(".ax-chat-scroll");if(p){const w=document.createElement("div");w.className="ax-msg ax-msg-user ax-slide-up-fade",w.innerHTML=`<img src="${h}" alt="Capture caméra" style="max-width:100%;border-radius:8px">`,p.appendChild(w),p.scrollTo({top:p.scrollHeight,behavior:"smooth"})}m.success("Photo capturée")}}else if(u==="burst"){const c=await s.captureBurst(5,200);m.info(c.ok?`${c.count} photos capturées`:c.reason??"Échec")}else if(u==="qr_live")await s.scanQrLive(c=>{for(const h of c)m.success(`📦 ${h.format}: ${h.rawValue.slice(0,80)}`)},{durationMs:15e3});else if(u==="video_record"){const c=await s.startVideoRecord(3e4);if(!c.ok){m.error(c.reason??"Recording impossible");return}m.info("🔴 Enregistrement 30s..."),setTimeout(()=>{s.stopVideoRecord().then(h=>{h.ok&&m.success(`Vidéo ${Math.round((h.blob?.size??0)/1024)}KB`)})},3e4)}}catch(s){m.error(s instanceof Error?s.message:"Erreur caméra")}})()});const g=s=>{a.querySelector(s)?.addEventListener("click",()=>{x.tap();const u=S.open({title:"🔑 Coller ta clé API",content:`
          <p style="margin:0 0 16px;color:var(--ax-text-dim)">
            Apex détecte automatiquement le service (Anthropic, OpenAI, Stripe, GitHub, etc.) et la range au bon endroit.
          </p>
          <textarea id="ax-paste-input" rows="3"
            placeholder="Colle ici ta clé / token / credential"
            style="width:100%;padding:12px;background:var(--ax-bg-input);border:1px solid var(--ax-border);border-radius:8px;color:var(--ax-text);font-family:var(--ax-font-mono);font-size:13px"
            autofocus spellcheck="false" autocomplete="off"></textarea>
          <p class="ax-muted" style="margin-top:8px">130+ patterns reconnus · 0 stockage des données interdites (CB, seed)</p>
        `,actions:[{label:"Annuler",variant:"ghost",onClick:()=>{x.tap(),u.close()}},{label:"Coller + ranger",variant:"primary",onClick:()=>{const h=document.getElementById("ax-paste-input")?.value.trim()??"";if(!h){m.warn("Colle une clé d'abord");return}u.close(),(async()=>{const p=await E.autoStore(h);if(p.forbidden){x.error(),m.error(`${p.pattern?.name} : Apex ne stocke jamais ce type de donnée pour ta sécurité.`,{duration:6e3});return}if(!p.ok){x.warning(),m.warn("Format non reconnu : "+(p.reason??"inconnu"));return}x.success();const w=p.valid===!0?" ✅ validée":p.valid===!1?" ⚠️ ping échoué":"";m.success(`${p.pattern?.name} rangée${w}`),q(a)})()}}]})})};g("#ax-paste-key"),g("#ax-paste-key-nav"),a.querySelector("#ax-logout-nav")?.addEventListener("click",()=>{x.tap();const s=S.open({title:"Déconnexion ?",content:"<p>Tes données restent sauvegardées (Coffre, conversations, profil).</p>",actions:[{label:"Annuler",variant:"ghost",onClick:()=>s.close()},{label:"Déconnecter",variant:"danger",onClick:()=>{x.medium(),s.close(),b(()=>import("./auth-CVUcBq3R.js"),__vite__mapDeps([18,1,2]),import.meta.url).then(i=>{i.auth.logout(),m.info("Déconnecté"),location.hash="#landing"})}}]})}),y.length&&_(a),C.info("chat","Chat view rendered")}const Q=Object.freeze(Object.defineProperty({__proto__:null,escapeHtml:f,render:q,renderMarkdownLight:k},Symbol.toStringTag,{value:"Module"}));export{Q as i,S as m};
//# sourceMappingURL=index-XxpgGzd4.js.map
