const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-tools-dispatch-InLMu65n.js","../core/main-D4zwvifF.js","../assets/css/main-rhfGvOFL.css","./apex-tools-B2C4VfuA.js","./audit-log-B0KCn-Eo.js","./firebase-BY3GRVm2.js","./orchestrator-BDZIUOcA.js","./smart-tools-suggester-DYSXLAD5.js","./toast-64I4l5xU.js","./haptic-BUEqXK0N.js","./vault-BgRqS32l.js","./credential-patterns-Ct__OCbr.js","./voice-print-Dfaahnkb.js","./file-converter-CUKRR_pP.js","./smart-camera-DEojDqVZ.js","./admin-prompt-CODOvE2p.js","./modal-sheet-U57prbzZ.js","./ai-routing-policy-Buap1tv-.js","./ai-router-A8ZJX7r4.js","./chat-fallback-4aPkHDN8.js","./pii-redaction-BenraFWG.js","./tokens-dashboard-C5ZzZyK6.js","./consumption-monitor-vZGTgew_.js","./links-registry-Dr2XHkLb.js","./push-notifications-DbYrzBGj.js","./auth-BRAqrvFk.js"])))=>i.map(i=>d[i]);
import{s as $,_ as g,l as O,e as W,m as K}from"../core/main-D4zwvifF.js";import{aiRouter as z}from"./ai-router-A8ZJX7r4.js";import{commerce as G}from"./commerce-BnOpYrjE.js";import{vault as N}from"./vault-BgRqS32l.js";import{h as p}from"./haptic-BUEqXK0N.js";import{modalSheet as D}from"./modal-sheet-U57prbzZ.js";import{toast as c}from"./toast-64I4l5xU.js";import"./audit-log-B0KCn-Eo.js";import"./chat-fallback-4aPkHDN8.js";import"./pii-redaction-BenraFWG.js";import"./tokens-dashboard-C5ZzZyK6.js";import"./credential-patterns-Ct__OCbr.js";const L=[],q=[];let T=!1;function C(n){return n.replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[s]??s)}function j(n){let s=C(n);return s=s.replace(/```([\s\S]*?)```/g,(m,d)=>`<pre class="ax-code"><code>${d}</code></pre>`),s=s.replace(/`([^`\n]+)`/g,'<code class="ax-code-inline">$1</code>'),s=s.replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>"),s=s.replace(/\*([^*\n]+)\*/g,"<em>$1</em>"),s=s.replace(/\n/g,"<br>"),s}function U(){const n=$.get("user");return K.buildSystemPromptContext(n)}async function Q(n,s){try{const{apexToolsDispatch:m}=await g(async()=>{const{apexToolsDispatch:h}=await import("./apex-tools-dispatch-InLMu65n.js");return{apexToolsDispatch:h}},__vite__mapDeps([0,1,2,3,4,5,6]),import.meta.url),d=await m.execute("detect_intent",{text:n},"admin");if(!d.ok||!d.result)return;const y=d.result.intent,b=d.result.confidence??0;if(!y||y==="unknown"||b<.7)return;if(y==="open_url"||y==="open_browser"){const h=n.match(/(https?:\/\/[^\s]+)/i),I=n.match(/\b([a-z0-9-]+\.(com|fr|io|net|org|app|dev|ai|co))\b/i),E=h?.[1]??I?.[1]??"https://www.google.com";m.execute("open_url",{url:E},"admin");return}const{smartToolsSuggester:x}=await g(async()=>{const{smartToolsSuggester:h}=await import("./smart-tools-suggester-DYSXLAD5.js");return{smartToolsSuggester:h}},__vite__mapDeps([7,1,2,4]),import.meta.url),l=x.suggestForIntent(y);if(!l)return;const{toast:f}=await g(async()=>{const{toast:h}=await import("./toast-64I4l5xU.js");return{toast:h}},__vite__mapDeps([8,9]),import.meta.url);f.info(`${l.emoji} ${l.name} disponible — tape pour ouvrir`,{duration:5e3});const _=$.get("user");_?.id&&x.recordUsage(l.id,_.id),X(s,l)}catch(m){O.warn("chat","detectAndSuggestTool failed",{err:m})}}function X(n,s){const m=n.querySelector(".ax-chat-scroll");if(!m)return;const d=document.createElement("div");d.className="ax-msg ax-msg-tool ax-slide-up-fade",d.innerHTML=`
    <div class="ax-tool-card">
      <div class="ax-tool-icon">${s.emoji}</div>
      <div class="ax-tool-info">
        <strong>${C(s.name)}</strong>
        <p style="margin:4px 0 0;color:var(--ax-text-dim);font-size:13px">${C(s.description)}</p>
      </div>
      <button class="ax-btn ax-btn-primary ax-btn-sm" onclick="location.hash='${C(s.cta_target)}'">${C(s.cta_label)}</button>
    </div>
  `,m.appendChild(d),m.scrollTo({top:m.scrollHeight,behavior:"smooth"})}async function F(n){if(T||q.length===0)return;T=!0;const s=q.shift();if(s===void 0){T=!1;return}const m=$.get("user");if(!G.consumeMessage(m?.id??null).allowed){J(n,"Tu as atteint ta limite quotidienne. Passe en plan supérieur ou réessaie demain."),T=!1;return}Q(s,n);const y={id:`u_${Date.now()}`,role:"user",text:s,ts:Date.now()};L.push(y);const b={id:`a_${Date.now()}`,role:"assistant",text:"",ts:Date.now(),streaming:!0};L.push(b),$.set("isStreaming",!0),P(n);const x=L.filter(l=>!l.streaming||l===b).slice(-30).filter(l=>l!==b).map(l=>({role:l.role,content:l.text}));await z.stream(x,U(),l=>{l.text&&(b.text+=l.text,Y(n,b)),l.done&&(delete b.streaming,$.set("isStreaming",!1),P(n))},l=>{b.text=W.toUserMessage(l)+" (Apex bascule sur le mode hors-ligne — réessaie dans un instant.)",delete b.streaming,$.set("isStreaming",!1),P(n)}),T=!1,q.length&&F(n)}function J(n,s){L.push({id:`a_${Date.now()}`,role:"assistant",text:s,ts:Date.now()}),P(n)}function Y(n,s){const m=n.querySelector(`[data-msg-id="${s.id}"] .ax-msg-body`);if(m){m.innerHTML=j(s.text)+(s.streaming?'<span class="ax-cursor">▌</span>':"");const d=n.querySelector(".ax-chat-scroll");d&&d.scrollTo({top:d.scrollHeight,behavior:"smooth"})}else P(n)}function P(n){const s=n.querySelector(".ax-chat-scroll");if(!s)return;const m=L.map(d=>{let y="";return d.streaming&&(d.text.length===0?y=`
            <span class="ax-typing" aria-label="Apex réfléchit">
              <span class="ax-typing-dot"></span>
              <span class="ax-typing-dot"></span>
              <span class="ax-typing-dot"></span>
            </span>
          `:y='<span class="ax-cursor">▌</span>'),`
        <div class="ax-msg ax-msg-${d.role} ax-slide-up-fade" data-msg-id="${d.id}">
          <div class="ax-msg-body">${j(d.text)}${y}</div>
        </div>
      `}).join("");s.innerHTML=m,s.scrollTo({top:s.scrollHeight,behavior:"smooth"})}function Z(n){const s=$.get("user"),m=s?`Bonjour ${s.name}, qu'est-ce que je peux faire pour toi ?`:"Bienvenue dans Apex.",d=$.get("isAdmin"),y=z.hasAnyKey();n.innerHTML=`
    <div class="ax-chat">
      <header class="ax-chat-header">
        <h1>APEX <span style="font-size:0.6em;letter-spacing:1px;color:var(--ax-text-dim)">AI</span></h1>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="ax-btn ax-btn-icon" id="ax-chat-settings" aria-label="Paramètres" title="Paramètres">⚙️</button>
          <button class="ax-btn ax-btn-icon" id="ax-chat-menu" aria-label="Menu" title="Menu">☰</button>
        </div>
      </header>
      <div class="ax-chat-scroll" role="log" aria-live="polite" aria-atomic="false">
        <div class="ax-chat-greeting">${C(m)}</div>
        ${y?"":`
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
          placeholder="Écris, dicte ou scanne — colle aussi photos/vidéos/docs"
          aria-label="Message"
          autocomplete="off"
        ></textarea>
        <button type="button" class="ax-btn ax-btn-icon" id="ax-chat-mic" aria-label="Dictée vocale" title="Dictée vocale (Web Speech)">🎙</button>
        <button type="button" class="ax-btn ax-btn-icon" id="ax-chat-wake" aria-label="Activer Dis Apex" title="Wake word 'Dis Apex' actif/inactif">👂</button>
        <button type="button" class="ax-btn ax-btn-icon" id="ax-chat-attach" aria-label="Joindre fichier" title="Photo, vidéo, document, archive">📎</button>
        <button type="button" class="ax-btn ax-btn-icon" id="ax-chat-camera" aria-label="Ouvrir caméra" title="Caméra (photo, scan, QR, vidéo)">📷</button>
        <button type="submit" class="ax-btn ax-btn-primary" aria-label="Envoyer">→</button>
        <input type="file" id="ax-chat-file-input" multiple
          accept="image/*,video/*,audio/*,.pdf,.txt,.md,.json,.csv,.zip,.rar,.7z,.docx,.xlsx,.pptx"
          style="display:none">
      </form>
      <div id="ax-chat-attachments" style="display:none;padding:8px;border-top:1px solid var(--ax-border);background:rgba(201,162,39,0.05);overflow-x:auto;white-space:nowrap"></div>
      <nav class="ax-chat-nav" style="display:flex;gap:8px;padding:8px;border-top:1px solid var(--ax-border);overflow-x:auto;background:var(--ax-bg-glass)">
        <button class="ax-btn ax-btn-sm" data-nav-route="chat">💬 Chat</button>
        ${d?'<button class="ax-btn ax-btn-sm" data-nav-route="admin">⚙️ Admin</button>':""}
        <button class="ax-btn ax-btn-sm" data-nav-route="settings">🔧 Réglages</button>
        <button class="ax-btn ax-btn-sm" id="ax-paste-key-nav">🔑 Clé API</button>
        <button class="ax-btn ax-btn-sm" id="ax-logout-nav">🚪 Déconnexion</button>
      </nav>
      <footer style="text-align:center;padding:6px;font-size:11px;color:var(--ax-text-muted);background:var(--ax-bg)">
        APEX AI v13.0 — Créé par <strong style="color:var(--ax-gold)">DK</strong>
      </footer>
    </div>
  `;const b=n.querySelector("#ax-chat-form"),x=n.querySelector("#ax-chat-text");b&&x&&(b.addEventListener("submit",t=>{t.preventDefault();const r=x.value.trim();r&&(async()=>{const{detectCredential:o}=await g(async()=>{const{detectCredential:i}=await import("./credential-patterns-Ct__OCbr.js");return{detectCredential:i}},[],import.meta.url),a=o(r);if(a&&a.category!=="forbidden"&&a.category!=="identity"){x.value="";const{vault:i}=await g(async()=>{const{vault:u}=await import("./vault-BgRqS32l.js");return{vault:u}},__vite__mapDeps([10,1,2,11]),import.meta.url),e=await i.autoStore(r);e.ok&&e.pattern?c.success(`🔑 ${e.pattern.name} détectée + chiffrée + stockée`):c.error(e.reason??"Erreur stockage clé");return}x.value="",x.style.height="auto",q.push(r),F(n)})()}),x.addEventListener("input",()=>{x.style.height="auto",x.style.height=`${Math.min(x.scrollHeight,200)}px`}),x.addEventListener("keydown",t=>{t.key==="Enter"&&!t.shiftKey&&(t.preventDefault(),b.requestSubmit())}),x.addEventListener("paste",t=>{const r=t.clipboardData?.getData("text")?.trim()??"";r&&(async()=>{const{detectCredential:o}=await g(async()=>{const{detectCredential:i}=await import("./credential-patterns-Ct__OCbr.js");return{detectCredential:i}},[],import.meta.url),a=o(r);if(a&&a.category!=="forbidden"&&a.category!=="identity"){t.preventDefault(),x.value="";const{vault:i}=await g(async()=>{const{vault:u}=await import("./vault-BgRqS32l.js");return{vault:u}},__vite__mapDeps([10,1,2,11]),import.meta.url),e=await i.autoStore(r);e.ok&&e.pattern?c.success(`🔑 ${e.pattern.name} détectée auto + chiffrée AES-GCM-256`):c.error(e.reason??"Erreur stockage")}})()}));const l=n.querySelector("#ax-chat-mic");let f=null,_=!1;l?.addEventListener("click",()=>{p.tap();const t=window.SpeechRecognition??window.webkitSpeechRecognition;if(!t){c.warn("Dictée vocale non supportée par ton navigateur");return}if(_&&f){f.stop(),_=!1,l.style.background="";return}try{if(f=new t,!f)return;f.continuous=!1,f.interimResults=!0,f.lang="fr-FR";let r="",o=null;const a=1500;f.onresult=i=>{const e=i;let u="",v=!1;for(let k=e.resultIndex;k<e.results.length;k++){const A=e.results[k];A?.[0]&&(u+=A[0].transcript,A.isFinal&&(v=!0))}const w=n.querySelector("#ax-chat-text");w&&(w.value=u),v&&(r=u,o&&clearTimeout(o),o=setTimeout(()=>{if(r.trim().length>0&&_){try{f?.stop()}catch{}n.querySelector("#ax-chat-form")?.requestSubmit()}},a))},f.onend=()=>{_=!1,l&&(l.style.background=""),o&&(clearTimeout(o),o=null);const i=n.querySelector("#ax-chat-text");r.trim().length>0&&i&&i.value.trim()===r.trim()&&n.querySelector("#ax-chat-form")?.requestSubmit()},f.onerror=i=>{const e=i;c.warn(`Dictée erreur : ${e.error??"inconnu"}`),_=!1,l&&(l.style.background="")},f.start(),_=!0,l.style.background="linear-gradient(135deg,#ff4444,#cc2222)",p.medium(),c.success("🎙 Parle maintenant — re-tap 🎙 pour arrêter")}catch(r){const o=r instanceof Error?r.message:"erreur";c.warn(`Dictée fail : ${o}`)}});const h=n.querySelector("#ax-chat-wake");h?.addEventListener("click",()=>{p.tap(),(async()=>{try{const{voicePrint:t}=await g(async()=>{const{voicePrint:o}=await import("./voice-print-Dfaahnkb.js");return{voicePrint:o}},__vite__mapDeps([12,1,2,4]),import.meta.url);if(!t.isSupported()){c.warn("Wake word non supporté par ton navigateur");return}if(t.isListening()){t.stopWakeWord(),h&&(h.style.background=""),c.success("Wake word arrêté");return}const r=t.startWakeWord(o=>{const a=n.querySelector("#ax-chat-text");a&&(a.value=o,n.querySelector("#ax-chat-form")?.requestSubmit())});r.ok&&h?(h.style.background="linear-gradient(135deg,#22cc77,#1a9a5a)",c.success('👂 "Dis Apex" actif — parle quand tu veux')):c.warn(`Wake word fail : ${r.reason??"inconnu"}`)}catch(t){const r=t instanceof Error?t.message:"erreur";c.warn(`Wake word erreur : ${r}`)}})()});const I=n.querySelector("#ax-chat-attach"),E=n.querySelector("#ax-chat-file-input"),R=n.querySelector("#ax-chat-attachments");I?.addEventListener("click",()=>{p.tap(),E?.click()});const M=t=>{if(!R)return;R.style.display="block";const r=(t.size/1024/1024).toFixed(2),o=t.type.startsWith("image/")?"🖼️":t.type.startsWith("video/")?"🎬":t.type.startsWith("audio/")?"🎵":t.type.includes("pdf")?"📄":t.type.includes("zip")||t.type.includes("rar")||t.type.includes("7z")?"📦":"📎",a=document.createElement("div");a.style.cssText="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:rgba(201,162,39,0.1);border:1px solid rgba(201,162,39,0.3);border-radius:6px;margin-right:6px;font-size:12px;color:#c9a227",a.innerHTML=`${o} ${t.name.slice(0,30)}${t.name.length>30?"...":""} (${r} MB)`,R.appendChild(a)};E?.addEventListener("change",()=>{const t=Array.from(E.files??[]);if(t.length!==0){p.success();for(const r of t)M(r),(async()=>{try{const{fileConverter:o}=await g(async()=>{const{fileConverter:i}=await import("./file-converter-CUKRR_pP.js");return{fileConverter:i}},__vite__mapDeps([13,1,2,4]),import.meta.url),a=await o.ingest(r,"admin");a.ok?c.success(`✅ ${r.name} ingéré`):c.warn(`Ingest fail : ${a.reason??r.name}`)}catch(o){const a=o instanceof Error?o.message:"erreur";c.warn(`File error : ${a}`)}})();E.value=""}});const S=n.querySelector(".ax-chat-body, #ax-chat-form");S&&(S.addEventListener("dragover",t=>{t.preventDefault(),S.style.background="rgba(201,162,39,0.1)"}),S.addEventListener("dragleave",()=>{S.style.background=""}),S.addEventListener("drop",t=>{t.preventDefault(),S.style.background="";const o=Array.from(t.dataTransfer?.files??[]);for(const a of o)M(a),(async()=>{try{const{fileConverter:i}=await g(async()=>{const{fileConverter:e}=await import("./file-converter-CUKRR_pP.js");return{fileConverter:e}},__vite__mapDeps([13,1,2,4]),import.meta.url);await i.ingest(a,"admin"),c.success(`📎 ${a.name} ajouté`)}catch{}})()})),n.querySelector("#ax-chat-text")?.addEventListener("paste",t=>{const r=t.clipboardData?.items??[];for(let o=0;o<r.length;o++){const a=r[o];if(a&&a.kind==="file"){const i=a.getAsFile();i&&(M(i),(async()=>{try{const{fileConverter:e}=await g(async()=>{const{fileConverter:u}=await import("./file-converter-CUKRR_pP.js");return{fileConverter:u}},__vite__mapDeps([13,1,2,4]),import.meta.url);await e.ingest(i,"admin"),c.success(`📋 ${i.name||"media collé"} ajouté`)}catch{}})())}}}),n.querySelector("#ax-chat-camera")?.addEventListener("click",()=>{p.tap(),(async()=>{try{const{smartCamera:t}=await g(async()=>{const{smartCamera:a}=await import("./smart-camera-DEojDqVZ.js");return{smartCamera:a}},__vite__mapDeps([14,1,2,4]),import.meta.url),{adminPrompt:r}=await g(async()=>{const{adminPrompt:a}=await import("./admin-prompt-CODOvE2p.js");return{adminPrompt:a}},__vite__mapDeps([15,9,16,8,4,1,2,5]),import.meta.url),o=await r.askChoice("📷 Caméra","Choisis le mode :",[{id:"single",label:"Photo simple",emoji:"📷",variant:"primary"},{id:"burst",label:"Rafale (5 photos)",emoji:"⚡",variant:"ghost"},{id:"qr_live",label:"Scanner QR/Code-barre",emoji:"⬛",variant:"ghost"},{id:"video_record",label:"Enregistrer vidéo (30s)",emoji:"🎬",variant:"ghost"}]);if(!o)return;if(o==="single"){const a=await t.captureSingle();if(!a.ok){c.error(a.reason??"Capture échouée");return}const i=a.dataUrls?.[0];if(i){const e=n.querySelector(".ax-chat-scroll");if(e){const u=document.createElement("div");u.className="ax-msg ax-msg-user ax-slide-up-fade",u.innerHTML=`<img src="${i}" alt="Capture caméra" style="max-width:100%;border-radius:8px">`,e.appendChild(u),e.scrollTo({top:e.scrollHeight,behavior:"smooth"})}c.success("Photo capturée")}}else if(o==="burst"){const a=await t.captureBurst(5,200);c.info(a.ok?`${a.count} photos capturées`:a.reason??"Échec")}else if(o==="qr_live")await t.scanQrLive(a=>{for(const i of a)c.success(`📦 ${i.format}: ${i.rawValue.slice(0,80)}`)},{durationMs:15e3});else if(o==="video_record"){const a=await t.startVideoRecord(3e4);if(!a.ok){c.error(a.reason??"Recording impossible");return}c.info("🔴 Enregistrement 30s..."),setTimeout(()=>{t.stopVideoRecord().then(i=>{i.ok&&c.success(`Vidéo ${Math.round((i.blob?.size??0)/1024)}KB`)})},3e4)}}catch(t){c.error(t instanceof Error?t.message:"Erreur caméra")}})()}),n.querySelector("#ax-chat-menu")?.addEventListener("click",()=>{p.tap();const t=$.get("isAdmin"),r=D.open({title:"☰ Menu",content:`
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="ax-btn ax-btn-primary" data-menu-nav="chat" style="width:100%;text-align:left;padding:14px">💬 Chat</button>
          ${t?'<button class="ax-btn ax-btn-primary" data-menu-nav="admin" style="width:100%;text-align:left;padding:14px">👑 Centre Admin</button>':""}
          <button class="ax-btn ax-btn-primary" data-menu-nav="studios" style="width:100%;text-align:left;padding:14px">🎨 Studios</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="studio-music" style="width:100%;text-align:left;padding:14px">🎚 Mix Musique</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="studio-video" style="width:100%;text-align:left;padding:14px">🎬 Vidéo</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="studio-cv" style="width:100%;text-align:left;padding:14px">📄 CV</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="studio-invoice" style="width:100%;text-align:left;padding:14px">🧾 Facture</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="studio-contract" style="width:100%;text-align:left;padding:14px">📋 Contrat</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="pro" style="width:100%;text-align:left;padding:14px">💼 Pro</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="remote" style="width:100%;text-align:left;padding:14px">📡 Télécommande</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="browser" style="width:100%;text-align:left;padding:14px">🌐 Browser</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="domotique" style="width:100%;text-align:left;padding:14px">🏠 Domotique</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="workflow" style="width:100%;text-align:left;padding:14px">⚡ Workflows</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="crypto" style="width:100%;text-align:left;padding:14px">₿ Crypto</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="notes" style="width:100%;text-align:left;padding:14px">📝 Bloc-notes</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="calendar" style="width:100%;text-align:left;padding:14px">📅 Calendrier</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="calculators" style="width:100%;text-align:left;padding:14px">🧮 Calculatrices</button>
          <button class="ax-btn ax-btn-primary" data-menu-nav="archive" style="width:100%;text-align:left;padding:14px">🗄 Archive</button>
          ${t?'<button class="ax-btn ax-btn-primary" data-menu-nav="billing" style="width:100%;text-align:left;padding:14px">💳 Comptes &amp; Factures</button>':""}
          ${t?'<button class="ax-btn ax-btn-primary" data-menu-nav="sentinels" style="width:100%;text-align:left;padding:14px">🛡 Sentinelles</button>':""}
          <button class="ax-btn ax-btn-primary" data-menu-nav="settings" style="width:100%;text-align:left;padding:14px">⚙️ Réglages</button>
          <button class="ax-btn" data-menu-action="paste-key" style="width:100%;text-align:left;padding:14px">🔑 Coller une clé API</button>
          <button class="ax-btn" data-menu-action="logout" style="width:100%;text-align:left;padding:14px;color:#ff6666">🚪 Déconnexion</button>
        </div>
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>r.close()}]});setTimeout(()=>{document.querySelectorAll("[data-menu-nav]").forEach(o=>{o.addEventListener("click",()=>{const a=o.dataset.menuNav??"";p.tap(),r.close(),a&&(location.hash=`#${a}`)})}),document.querySelectorAll("[data-menu-action]").forEach(o=>{o.addEventListener("click",()=>{const a=o.dataset.menuAction??"";p.tap(),r.close(),a==="paste-key"?n.querySelector("#ax-paste-key-nav")?.click():a==="logout"&&n.querySelector("#ax-logout-nav")?.click()})})},50)});const B=n.querySelector("#ax-chat-settings");B||n.addEventListener("click",t=>{t.target.closest("#ax-chat-settings")&&(location.hash="#settings")}),B?.addEventListener("click",()=>{p.tap(),(async()=>{try{const{aiRoutingPolicy:t}=await g(async()=>{const{aiRoutingPolicy:e}=await import("./ai-routing-policy-Buap1tv-.js");return{aiRoutingPolicy:e}},__vite__mapDeps([17,1,2,18,4,19,20,21,22,23,5,24]),import.meta.url),r=t.getStatus(),o=t.recommendActions(),a=o.length?o.map(e=>`
              <li style="margin:4px 0">
                <span style="color:${e.priority==="high"?"#ff6666":e.priority==="medium"?"#ffaa00":"#a0a4c0"}">●</span>
                ${C(e.action)}
                ${e.url?` <a href="${C(e.url)}" target="_blank" rel="noopener" style="color:#c9a227">→</a>`:""}
              </li>
            `).join(""):'<li style="color:#22cc77">✅ Tout est configuré au mieux</li>',i=D.open({title:"⚙️ Paramètres",content:`
            <div style="display:flex;flex-direction:column;gap:14px">
              <div>
                <h4 style="margin:0 0 6px;color:#c9a227">Routing IA</h4>
                <label style="display:block;margin:6px 0">
                  Mode :
                  <select id="ax-settings-mode" style="margin-left:8px;padding:6px;background:#1a1a2e;color:#fff;border:1px solid #c9a227;border-radius:4px">
                    <option value="auto" ${r.mode==="auto"?"selected":""}>Auto (intelligent)</option>
                    <option value="economy" ${r.mode==="economy"?"selected":""}>Économie (gratuit d'abord)</option>
                    <option value="premium" ${r.mode==="premium"?"selected":""}>Premium (Anthropic toujours)</option>
                  </select>
                </label>
                <p style="margin:6px 0;color:#a0a4c0;font-size:12px">
                  Anthropic : <span style="color:${r.anthropic_health==="ok"?"#22cc77":r.anthropic_health==="warn"?"#ffaa00":"#ff6666"}">${r.anthropic_health}</span>
                  · Gratuits dispo : ${r.free_providers_available.length}
                  · Payants dispo : ${r.paid_providers_available.length}
                </p>
              </div>
              <div>
                <h4 style="margin:0 0 6px;color:#c9a227">Clés API</h4>
                <button type="button" class="ax-btn ax-btn-primary" id="ax-settings-paste-key" style="width:100%">🔑 Coller une clé API</button>
              </div>
              <div>
                <h4 style="margin:0 0 6px;color:#c9a227">Recommandations</h4>
                <ul style="margin:0;padding-left:18px;font-size:13px">${a}</ul>
              </div>
            </div>
          `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>i.close()}]});setTimeout(()=>{const e=document.getElementById("ax-settings-mode");e?.addEventListener("change",()=>{const v=e.value;t.setMode(v),c.success(`Mode routing : ${v}`),p.medium()}),document.getElementById("ax-settings-paste-key")?.addEventListener("click",()=>{i.close(),n.querySelector("#ax-paste-key-nav")?.click()})},50)}catch(t){const r=t instanceof Error?t.message:"erreur";c.error(`Paramètres indisponibles : ${r}`)}})()});const V=t=>{n.querySelector(t)?.addEventListener("click",()=>{p.tap();const o=D.open({title:"🔑 Coller ta clé API",content:`
          <p style="margin:0 0 12px;color:var(--ax-text-dim)">
            Apex détecte automatiquement le service (Anthropic, OpenAI, Stripe, GitHub, etc.) et la range au bon endroit.
          </p>
          <button type="button" id="ax-paste-clipboard-btn"
            style="width:100%;padding:12px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;margin-bottom:12px;-webkit-tap-highlight-color:transparent">
            📋 Coller automatiquement depuis presse-papiers
          </button>
          <textarea id="ax-paste-input" rows="4"
            placeholder="Ou colle ici manuellement (long press → Coller)"
            style="width:100%;padding:14px;background:#1a1a2e;border:2px solid #c9a227;border-radius:10px;color:#ffffff !important;-webkit-text-fill-color:#ffffff;font-family:'Courier New',monospace;font-size:14px;line-height:1.5;box-sizing:border-box;resize:vertical;min-height:90px"
            autofocus spellcheck="false" autocomplete="off"
            autocapitalize="off" autocorrect="off"
            inputmode="text"></textarea>
          <div id="ax-paste-preview" style="margin-top:8px;padding:8px;background:rgba(201,162,39,0.08);border-radius:6px;font-size:12px;color:#c9a227;display:none">
            <span id="ax-paste-detection"></span>
          </div>
          <p class="ax-muted" style="margin-top:8px">130+ patterns reconnus · 0 stockage des données interdites (CB, seed)</p>
        `,actions:[{label:"Annuler",variant:"ghost",onClick:()=>{p.tap(),o.close()}},{label:"Coller + ranger",variant:"primary",onClick:()=>{const i=document.getElementById("ax-paste-input")?.value.trim()??"";if(!i){c.warn('⚠️ Textarea vide — utilise "📋 Coller automatiquement" ou long press dans le rectangle blanc');return}o.close(),(async()=>{const e=await N.autoStore(i);if(e.forbidden){p.error(),c.error(`${e.pattern?.name} : Apex ne stocke jamais ce type de donnée pour ta sécurité.`,{duration:6e3});return}if(!e.ok){p.warning(),c.warn("Format non reconnu : "+(e.reason??"inconnu")+` (taille ${i.length} chars, début: "${i.slice(0,12)}...")`,{duration:8e3});return}p.success();const u=e.valid===!0?" ✅ validée":e.valid===!1?" ⚠️ ping échoué":"";c.success(`${e.pattern?.name} rangée${u}`),Z(n)})()}}]});setTimeout(()=>{const a=document.getElementById("ax-paste-clipboard-btn"),i=document.getElementById("ax-paste-input"),e=document.getElementById("ax-paste-preview"),u=document.getElementById("ax-paste-detection");a?.addEventListener("click",async()=>{p.tap();try{if(!navigator.clipboard?.readText){c.warn("Clipboard API non supportée. Long press dans le textarea → Coller manuellement.");return}const w=(await navigator.clipboard.readText()).trim();if(!w){c.warn("Presse-papiers vide. Copie d'abord ta clé puis tap ce bouton.");return}i&&(i.value=w);const{detectCredential:k}=await g(async()=>{const{detectCredential:H}=await import("./credential-patterns-Ct__OCbr.js");return{detectCredential:H}},[],import.meta.url),A=k(w);e&&u&&(A?(u.textContent=`✅ Détecté : ${A.name} (${w.length} chars)`,e.style.display="block",e.style.background="rgba(34,204,119,0.1)",e.style.color="#22cc77"):(u.textContent=`⚠️ Format inconnu (${w.length} chars, début "${w.slice(0,15)}...")`,e.style.display="block",e.style.background="rgba(255,170,0,0.1)",e.style.color="#ffaa00")),c.success('Clé collée — vérifie + tap "Coller + ranger"'),p.medium()}catch(v){const w=v instanceof Error?v.message:"erreur";c.warn(`Permission presse-papiers refusée. Long press dans le textarea blanc → Coller. (${w})`)}}),i?.addEventListener("input",async()=>{const v=i.value.trim();if(!v||!e||!u){e&&(e.style.display="none");return}const{detectCredential:w}=await g(async()=>{const{detectCredential:A}=await import("./credential-patterns-Ct__OCbr.js");return{detectCredential:A}},[],import.meta.url),k=w(v);k?(u.textContent=`✅ Détecté : ${k.name} (${v.length} chars)`,e.style.display="block",e.style.background="rgba(34,204,119,0.1)",e.style.color="#22cc77"):(u.textContent=`⚠️ Format inconnu (${v.length} chars)`,e.style.display="block",e.style.background="rgba(255,170,0,0.1)",e.style.color="#ffaa00")})},100)})};V("#ax-paste-key"),V("#ax-paste-key-nav"),n.addEventListener("click",t=>{const o=t.target.closest("[data-nav-route]");if(o){const a=o.dataset.navRoute;a&&(p.tap(),location.hash="#"+a)}}),n.querySelector("#ax-logout-nav")?.addEventListener("click",()=>{p.tap();const t=D.open({title:"Déconnexion ?",content:"<p>Tes données restent sauvegardées (Coffre, conversations, profil).</p>",actions:[{label:"Annuler",variant:"ghost",onClick:()=>t.close()},{label:"Déconnecter",variant:"danger",onClick:()=>{p.medium(),t.close(),g(()=>import("./auth-BRAqrvFk.js"),__vite__mapDeps([25,1,2]),import.meta.url).then(r=>{r.auth.logout(),c.info("Déconnecté"),location.hash="#landing"})}}]})}),L.length&&P(n),O.info("chat","Chat view rendered")}export{C as escapeHtml,Z as render,j as renderMarkdownLight};
//# sourceMappingURL=index-Baw_UpgN.js.map
