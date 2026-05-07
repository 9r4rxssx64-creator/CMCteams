const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-tools-dispatch-DwcAIGVp.js","./monitoring-675b-Ybt.js","./apex-tools-registry-oQuNaPP9.js","./smart-tools-suggester-CJMwkw4r.js","./toast-Dgg9rcIP.js","./haptic-BUEqXK0N.js","./apex-kb-D33v8GGx.js","./credential-patterns-BybElwOv.js","./voice-zzEOhKUx.js","./file-converter-1WIqwhid.js","./smart-camera-BiIDykR9.js","./admin-prompt-jFoNYHfr.js","./modal-sheet-Pqfkse7W.js","./ai-routing-policy-Dc-8e9ZV.js","./ai-router-BE409aO_.js","../core/main-CJ6ETfJo.js","../assets/css/main-rhfGvOFL.css","./chat-fallback-BiuSoCVw.js","./tokens-dashboard-C5ZzZyK6.js","./consumption-monitor-Dmzx-RX5.js","./links-registry-D_swzzaC.js","./push-notifications-Dy9mY2zs.js","./auth-BO7BfNlv.js"])))=>i.map(i=>d[i]);
import{_ as y}from"./apex-tools-dispatch-DwcAIGVp.js";import{s as A,e as K,m as N}from"../core/main-CJ6ETfJo.js";import{l as V}from"./monitoring-675b-Ybt.js";import{aiRouter as O}from"./ai-router-BE409aO_.js";import{commerce as U}from"./commerce-C4v4F_B9.js";import{v as Q}from"./apex-kb-D33v8GGx.js";import{h as g}from"./haptic-BUEqXK0N.js";import{modalSheet as q}from"./modal-sheet-Pqfkse7W.js";import{toast as l}from"./toast-Dgg9rcIP.js";import"./apex-tools-registry-oQuNaPP9.js";import"./chat-fallback-BiuSoCVw.js";import"./tokens-dashboard-C5ZzZyK6.js";import"./credential-patterns-BybElwOv.js";const L=[],I=[];let D=!1;function k(e){return e.replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[s]??s)}function F(e){let s=k(e);return s=s.replace(/```([\s\S]*?)```/g,(x,c)=>`<pre class="ax-code"><code>${c}</code></pre>`),s=s.replace(/`([^`\n]+)`/g,'<code class="ax-code-inline">$1</code>'),s=s.replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>"),s=s.replace(/\*([^*\n]+)\*/g,"<em>$1</em>"),s=s.replace(/\n/g,"<br>"),s}function J(){const e=A.get("user");return N.buildSystemPromptContext(e)}async function Y(e,s){try{const{apexToolsDispatch:x}=await y(async()=>{const{apexToolsDispatch:v}=await import("./apex-tools-dispatch-DwcAIGVp.js").then(T=>T.c);return{apexToolsDispatch:v}},__vite__mapDeps([0,1,2]),import.meta.url),c=await x.execute("detect_intent",{text:e},"admin");if(!c.ok||!c.result)return;const f=c.result.intent,p=c.result.confidence??0;if(!f||f==="unknown"||p<.7)return;if(f==="open_url"||f==="open_browser"){const v=e.match(/(https?:\/\/[^\s]+)/i),T=e.match(/\b([a-z0-9-]+\.(com|fr|io|net|org|app|dev|ai|co))\b/i),P=v?.[1]??T?.[1]??"https://www.google.com";x.execute("open_url",{url:P},"admin");return}const{smartToolsSuggester:b}=await y(async()=>{const{smartToolsSuggester:v}=await import("./smart-tools-suggester-CJMwkw4r.js");return{smartToolsSuggester:v}},__vite__mapDeps([3,1,2]),import.meta.url),d=b.suggestForIntent(f);if(!d)return;const{toast:h}=await y(async()=>{const{toast:v}=await import("./toast-Dgg9rcIP.js");return{toast:v}},__vite__mapDeps([4,5]),import.meta.url);h.info(`${d.emoji} ${d.name} disponible — tape pour ouvrir`,{duration:5e3});const _=A.get("user");_?.id&&b.recordUsage(d.id,_.id),X(s,d)}catch(x){V.warn("chat","detectAndSuggestTool failed",{err:x})}}function X(e,s){const x=e.querySelector(".ax-chat-scroll");if(!x)return;const c=document.createElement("div");c.className="ax-msg ax-msg-tool ax-slide-up-fade",c.innerHTML=`
    <div class="ax-tool-card">
      <div class="ax-tool-icon">${s.emoji}</div>
      <div class="ax-tool-info">
        <strong>${k(s.name)}</strong>
        <p style="margin:4px 0 0;color:var(--ax-text-dim);font-size:13px">${k(s.description)}</p>
      </div>
      <button class="ax-btn ax-btn-primary ax-btn-sm" onclick="location.hash='${k(s.cta_target)}'">${k(s.cta_label)}</button>
    </div>
  `,x.appendChild(c),x.scrollTo({top:x.scrollHeight,behavior:"smooth"})}async function H(e){if(D||I.length===0)return;D=!0;const s=I.shift();if(s===void 0){D=!1;return}const x=A.get("user");if(!U.consumeMessage(x?.id??null).allowed){Z(e,"Tu as atteint ta limite quotidienne. Passe en plan supérieur ou réessaie demain."),D=!1;return}Y(s,e);const f={id:`u_${Date.now()}`,role:"user",text:s,ts:Date.now()};L.push(f);const p={id:`a_${Date.now()}`,role:"assistant",text:"",ts:Date.now(),streaming:!0};L.push(p),A.set("isStreaming",!0),E(e);const b=L.filter(d=>!d.streaming||d===p).slice(-30).filter(d=>d!==p).map(d=>({role:d.role,content:d.text}));await O.stream(b,J(),d=>{if(d.type==="tool_use_start"&&d.toolName){p.toolPills||(p.toolPills=[]),p.toolPills.push({name:d.toolName,status:"running"}),M(e,p);return}if(d.type==="tool_use_done"){if(p.toolPills)for(const h of p.toolPills)h.status==="running"&&(h.status="done");p.toolBatchCount=(p.toolBatchCount??0)+(d.toolCount??0),M(e,p);return}d.text&&(p.text+=d.text,M(e,p)),d.done&&(delete p.streaming,A.set("isStreaming",!1),E(e))},d=>{p.text=K.toUserMessage(d)+" (Apex bascule sur le mode hors-ligne — réessaie dans un instant.)",delete p.streaming,A.set("isStreaming",!1),E(e)}),D=!1,I.length&&H(e)}function Z(e,s){L.push({id:`a_${Date.now()}`,role:"assistant",text:s,ts:Date.now()}),E(e)}function W(e){if(!e.toolPills||e.toolPills.length===0)return"";const s=e.toolPills.every(c=>c.status==="done"),x="padding:4px 8px;background:rgba(201,162,39,0.1);border-radius:8px;font-size:11px;color:var(--ax-gold);display:inline-block;margin:4px 4px 4px 0;";if(s){const c=e.toolBatchCount??e.toolPills.length,f=e.toolPills.map(p=>k(p.name)).join(", ");return`<details class="ax-tool-pills" style="margin:4px 0;"><summary style="${x}cursor:pointer;">▶ ${c} opération${c>1?"s":""}</summary><div style="font-size:11px;color:#888;padding:4px 8px;">${f}</div></details>`}return e.toolPills.map(c=>{const f=c.status==="running"?"🔧":"✅";return`<span class="ax-tool-pill" style="${x}">${f} ${k(c.name)}</span>`}).join("")}function M(e,s){const x=e.querySelector(`[data-msg-id="${s.id}"] .ax-msg-body`);if(x){x.innerHTML=W(s)+F(s.text)+(s.streaming?'<span class="ax-cursor">▌</span>':"");const c=e.querySelector(".ax-chat-scroll");c&&c.scrollTo({top:c.scrollHeight,behavior:"smooth"})}else E(e)}function E(e){const s=e.querySelector(".ax-chat-scroll");if(!s)return;const x=L.map(c=>{let f="";c.streaming&&(c.text.length===0?f=`
            <span class="ax-typing" aria-label="Apex réfléchit">
              <span class="ax-typing-dot"></span>
              <span class="ax-typing-dot"></span>
              <span class="ax-typing-dot"></span>
            </span>
          `:f='<span class="ax-cursor">▌</span>');const p=W(c);return`
        <div class="ax-msg ax-msg-${c.role} ax-modernized-msg ax-slide-up-fade" data-msg-id="${c.id}">
          <div class="ax-msg-body">${p}${F(c.text)}${f}</div>
        </div>
      `}).join("");s.innerHTML=x,s.scrollTo({top:s.scrollHeight,behavior:"smooth"})}function tt(e){const s=A.get("user"),x=s?`Bonjour ${s.name}, qu'est-ce que je peux faire pour toi ?`:"Bienvenue dans Apex.",c=A.get("isAdmin"),f=O.hasAnyKey();e.innerHTML=`
    <style>
      .ax-chat-header {
        background: linear-gradient(180deg,rgba(20,20,35,0.95),rgba(14,14,28,0.85));
        backdrop-filter: blur(20px) saturate(140%);
        -webkit-backdrop-filter: blur(20px) saturate(140%);
        border-bottom: 1px solid rgba(255,255,255,0.06);
        padding: 14px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        position: sticky;
        top: 0;
        z-index: 50;
      }
      .ax-chat-header h1 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        background: linear-gradient(135deg,#c9a227 0%,#e8b830 50%,#f5cc4a 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-family: Georgia, serif;
        letter-spacing: -0.015em;
      }
      .ax-chat-header .ax-btn-icon {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.85);
        width: 40px;
        height: 40px;
        min-width: 40px;
        border-radius: 12px;
        font-size: 18px;
        cursor: pointer;
        transition: all 160ms cubic-bezier(0.16,1,0.3,1);
        -webkit-tap-highlight-color: transparent;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .ax-chat-header .ax-btn-icon:hover {
        background: rgba(232,184,48,0.12);
        border-color: rgba(232,184,48,0.3);
        transform: translateY(-1px);
      }
      .ax-chat-greeting {
        text-align: center;
        padding: 32px 20px 20px;
        font-size: clamp(20px,4vw,26px);
        font-weight: 600;
        color: rgba(255,255,255,0.9);
        font-family: Georgia, serif;
        letter-spacing: -0.015em;
        line-height: 1.4;
        animation: ax-fade-up 480ms cubic-bezier(0.16,1,0.3,1) backwards;
      }
      .ax-chat-greeting::after {
        content: '';
        display: block;
        width: 60px;
        height: 2px;
        background: linear-gradient(90deg,transparent,#e8b830,transparent);
        margin: 16px auto 0;
        opacity: 0.6;
      }
      .ax-info-card {
        background: linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(232,184,48,0.18);
        border-radius: 16px;
        padding: 20px;
        animation: ax-fade-up 360ms cubic-bezier(0.16,1,0.3,1) backwards;
      }
      .ax-info-card h3 {
        margin: 0 0 8px;
        font-size: 15px;
        font-weight: 700;
        color: #e8b830;
        letter-spacing: -0.01em;
      }
      .ax-info-card p {
        margin: 0 0 14px;
        color: rgba(255,255,255,0.65);
        font-size: 13px;
        line-height: 1.5;
      }
      @keyframes ax-fade-up {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .ax-msg.ax-modernized-msg {
        animation: ax-fade-up 240ms cubic-bezier(0.16,1,0.3,1);
      }
      @media (prefers-reduced-motion: reduce) {
        .ax-chat-greeting, .ax-info-card, .ax-modernized-msg { animation: none !important; }
      }
    </style>
    <div class="ax-chat ax-modernized-card">
      <header class="ax-chat-header">
        <h1>APEX <span style="font-size:0.55em;letter-spacing:0.15em;color:rgba(255,255,255,0.4);font-weight:400">AI</span></h1>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="ax-btn ax-btn-icon" id="ax-chat-settings" aria-label="Paramètres" title="Paramètres">⚙️</button>
          <button class="ax-btn ax-btn-icon" id="ax-chat-menu" aria-label="Menu" title="Menu">☰</button>
        </div>
      </header>
      <div class="ax-chat-scroll" role="log" aria-live="polite" aria-atomic="false">
        <div class="ax-chat-greeting">${k(x)}</div>
        ${f?"":`
          <div class="ax-info-card ax-modernized-card" style="margin:16px;">
            <h3>🔑 Aucune clé API configurée</h3>
            <p>Pour discuter avec Apex, colle une clé API IA. Apex détecte automatiquement Anthropic, OpenAI, Groq ou Gemini.</p>
            <button class="ax-btn ax-btn-primary" id="ax-paste-key" style="background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;padding:12px 20px;border-radius:10px;font-weight:700;cursor:pointer;font-size:14px;width:100%;min-height:44px;-webkit-tap-highlight-color:transparent;transition:all 180ms cubic-bezier(0.16,1,0.3,1)">📋 Coller une clé API</button>
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
      <nav class="ax-chat-nav" style="display:flex;gap:8px;padding:8px;border-top:1px solid var(--ax-border);overflow-x:auto;background:var(--ax-bg-glass);-webkit-overflow-scrolling:touch">
        <button class="ax-btn ax-btn-sm" data-nav-route="chat" style="white-space:nowrap;min-height:44px;padding:8px 14px">💬 Chat</button>
        ${c?'<button class="ax-btn ax-btn-sm" data-nav-route="admin" style="white-space:nowrap;min-height:44px;padding:8px 14px">⚙️ Admin</button>':""}
        <button class="ax-btn ax-btn-sm" data-nav-route="vault" style="white-space:nowrap;min-height:44px;padding:8px 14px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;font-weight:700">🔐 Coffre</button>
        <button class="ax-btn ax-btn-sm" data-nav-route="settings" style="white-space:nowrap;min-height:44px;padding:8px 14px">🔧 Réglages</button>
        <button class="ax-btn ax-btn-sm" id="ax-paste-key-nav" style="white-space:nowrap;min-height:44px;padding:8px 14px">🔑 Clé API</button>
        <button class="ax-btn ax-btn-sm" id="ax-logout-nav" style="white-space:nowrap;min-height:44px;padding:8px 14px;color:#ff6666">🚪 Déconnexion</button>
      </nav>
      <footer style="text-align:center;padding:6px;font-size:11px;color:var(--ax-text-muted);background:var(--ax-bg)">
        APEX AI v13.0 — Créé par <strong style="color:var(--ax-gold)">DK</strong>
      </footer>
    </div>
  `;const p=e.querySelector("#ax-chat-form"),b=e.querySelector("#ax-chat-text");p&&b&&(p.addEventListener("submit",t=>{t.preventDefault();const r=b.value.trim();r&&(async()=>{const{detectAllCredentials:o}=await y(async()=>{const{detectAllCredentials:i}=await import("./credential-patterns-BybElwOv.js");return{detectAllCredentials:i}},[],import.meta.url);if(o(r).length>0){b.value="",b.style.height="auto";const{vault:i}=await y(async()=>{const{vault:u}=await import("./apex-kb-D33v8GGx.js").then(m=>m.b);return{vault:u}},__vite__mapDeps([6,1,2,0,7]),import.meta.url),a=await i.autoStoreBulk(r);if(a.stored.length>0){const u=a.stored.map(m=>m.pattern.name).join(", ");l.success(`🔑 ${a.stored.length} clé(s) chiffrée(s) AES-GCM-256 : ${u}`,{duration:6e3})}if(a.forbidden.length>0){const u=a.forbidden.map(m=>m.pattern.name).join(", ");l.error(`🚫 ${u} JAMAIS stocké (sécu Kevin)`,{duration:8e3})}a.failed>0&&a.stored.length===0&&l.warn(`⚠️ ${a.failed} format inconnu — ouvre 🔐 Coffre pour coller manuellement`,{duration:8e3});return}b.value="",b.style.height="auto",I.push(r),H(e)})()}),b.addEventListener("input",()=>{b.style.height="auto",b.style.height=`${Math.min(b.scrollHeight,200)}px`}),b.addEventListener("keydown",t=>{t.key==="Enter"&&!t.shiftKey&&(t.preventDefault(),p.requestSubmit())}),b.addEventListener("paste",t=>{const r=t.clipboardData?.getData("text")?.trim()??"";r&&(async()=>{const{detectAllCredentials:o}=await y(async()=>{const{detectAllCredentials:i}=await import("./credential-patterns-BybElwOv.js");return{detectAllCredentials:i}},[],import.meta.url);if(o(r).length>0){t.preventDefault(),b.value="";const{vault:i}=await y(async()=>{const{vault:u}=await import("./apex-kb-D33v8GGx.js").then(m=>m.b);return{vault:u}},__vite__mapDeps([6,1,2,0,7]),import.meta.url),a=await i.autoStoreBulk(r);if(a.stored.length>0){const u=a.stored.map(m=>m.pattern.name).join(", ");l.success(`🔑 ${a.stored.length} clé(s) chiffrée(s) auto AES-GCM-256 : ${u}`,{duration:6e3})}if(a.forbidden.length>0){const u=a.forbidden.map(m=>m.pattern.name).join(", ");l.error(`🚫 ${u} JAMAIS stocké (règle sécu)`,{duration:8e3})}a.failed>0&&a.stored.length===0&&l.warn("Format inconnu — ouvre 🔐 Coffre pour coller manuellement",{duration:6e3})}})()}));const d=e.querySelector("#ax-chat-mic");let h=null,_=!1;d?.addEventListener("click",()=>{g.tap();const t=window.SpeechRecognition??window.webkitSpeechRecognition;if(!t){l.warn("Dictée vocale non supportée par ton navigateur");return}if(_&&h){h.stop(),_=!1,d.style.background="";return}try{if(h=new t,!h)return;h.continuous=!1,h.interimResults=!0,h.lang="fr-FR";let r="",o=null;const n=1500;h.onresult=i=>{const a=i;let u="",m=!1;for(let $=a.resultIndex;$<a.results.length;$++){const C=a.results[$];C?.[0]&&(u+=C[0].transcript,C.isFinal&&(m=!0))}const w=e.querySelector("#ax-chat-text");w&&(w.value=u),m&&(r=u,o&&clearTimeout(o),o=setTimeout(()=>{if(r.trim().length>0&&_){try{h?.stop()}catch{}e.querySelector("#ax-chat-form")?.requestSubmit()}},n))},h.onend=()=>{_=!1,d&&(d.style.background=""),o&&(clearTimeout(o),o=null);const i=e.querySelector("#ax-chat-text");r.trim().length>0&&i&&i.value.trim()===r.trim()&&e.querySelector("#ax-chat-form")?.requestSubmit()},h.onerror=i=>{const a=i;l.warn(`Dictée erreur : ${a.error??"inconnu"}`),_=!1,d&&(d.style.background="")},h.start(),_=!0,d.style.background="linear-gradient(135deg,#ff4444,#cc2222)",g.medium(),l.success("🎙 Parle maintenant — re-tap 🎙 pour arrêter")}catch(r){const o=r instanceof Error?r.message:"erreur";l.warn(`Dictée fail : ${o}`)}});const v=e.querySelector("#ax-chat-wake");v?.addEventListener("click",()=>{g.tap(),(async()=>{try{const{voicePrint:t}=await y(async()=>{const{voicePrint:o}=await import("./voice-zzEOhKUx.js").then(n=>n.v);return{voicePrint:o}},__vite__mapDeps([8,1,2]),import.meta.url);if(!t.isSupported()){l.warn("Wake word non supporté par ton navigateur");return}if(t.isListening()){t.stopWakeWord(),v&&(v.style.background=""),l.success("Wake word arrêté");return}const r=t.startWakeWord(o=>{const n=e.querySelector("#ax-chat-text");n&&(n.value=o,e.querySelector("#ax-chat-form")?.requestSubmit())});r.ok&&v?(v.style.background="linear-gradient(135deg,#22cc77,#1a9a5a)",l.success('👂 "Dis Apex" actif — parle quand tu veux')):l.warn(`Wake word fail : ${r.reason??"inconnu"}`)}catch(t){const r=t instanceof Error?t.message:"erreur";l.warn(`Wake word erreur : ${r}`)}})()});const T=e.querySelector("#ax-chat-attach"),P=e.querySelector("#ax-chat-file-input"),z=e.querySelector("#ax-chat-attachments");T?.addEventListener("click",()=>{g.tap(),P?.click()});const R=t=>{if(!z)return;z.style.display="block";const r=(t.size/1024/1024).toFixed(2),o=t.type.startsWith("image/")?"🖼️":t.type.startsWith("video/")?"🎬":t.type.startsWith("audio/")?"🎵":t.type.includes("pdf")?"📄":t.type.includes("zip")||t.type.includes("rar")||t.type.includes("7z")?"📦":"📎",n=document.createElement("div");n.style.cssText="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:rgba(201,162,39,0.1);border:1px solid rgba(201,162,39,0.3);border-radius:6px;margin-right:6px;font-size:12px;color:#c9a227",n.innerHTML=`${o} ${t.name.slice(0,30)}${t.name.length>30?"...":""} (${r} MB)`,z.appendChild(n)};P?.addEventListener("change",()=>{const t=Array.from(P.files??[]);if(t.length!==0){g.success();for(const r of t)R(r),(async()=>{try{const{fileConverter:o}=await y(async()=>{const{fileConverter:i}=await import("./file-converter-1WIqwhid.js");return{fileConverter:i}},__vite__mapDeps([9,1,2]),import.meta.url),n=await o.ingest(r,"admin");n.ok?l.success(`✅ ${r.name} ingéré`):l.warn(`Ingest fail : ${n.reason??r.name}`)}catch(o){const n=o instanceof Error?o.message:"erreur";l.warn(`File error : ${n}`)}})();P.value=""}});const S=e.querySelector(".ax-chat-body, #ax-chat-form");S&&(S.addEventListener("dragover",t=>{t.preventDefault(),S.style.background="rgba(201,162,39,0.1)"}),S.addEventListener("dragleave",()=>{S.style.background=""}),S.addEventListener("drop",t=>{t.preventDefault(),S.style.background="";const o=Array.from(t.dataTransfer?.files??[]);for(const n of o)R(n),(async()=>{try{const{fileConverter:i}=await y(async()=>{const{fileConverter:a}=await import("./file-converter-1WIqwhid.js");return{fileConverter:a}},__vite__mapDeps([9,1,2]),import.meta.url);await i.ingest(n,"admin"),l.success(`📎 ${n.name} ajouté`)}catch{}})()})),e.querySelector("#ax-chat-text")?.addEventListener("paste",t=>{const r=t.clipboardData?.items??[];for(let o=0;o<r.length;o++){const n=r[o];if(n&&n.kind==="file"){const i=n.getAsFile();i&&(R(i),(async()=>{try{const{fileConverter:a}=await y(async()=>{const{fileConverter:u}=await import("./file-converter-1WIqwhid.js");return{fileConverter:u}},__vite__mapDeps([9,1,2]),import.meta.url);await a.ingest(i,"admin"),l.success(`📋 ${i.name||"media collé"} ajouté`)}catch{}})())}}}),e.querySelector("#ax-chat-camera")?.addEventListener("click",()=>{g.tap(),(async()=>{try{const{smartCamera:t}=await y(async()=>{const{smartCamera:n}=await import("./smart-camera-BiIDykR9.js");return{smartCamera:n}},__vite__mapDeps([10,1,2]),import.meta.url),{adminPrompt:r}=await y(async()=>{const{adminPrompt:n}=await import("./admin-prompt-jFoNYHfr.js");return{adminPrompt:n}},__vite__mapDeps([11,5,12,4,2,1,0]),import.meta.url),o=await r.askChoice("📷 Caméra","Choisis le mode :",[{id:"single",label:"Photo simple",emoji:"📷",variant:"primary"},{id:"burst",label:"Rafale (5 photos)",emoji:"⚡",variant:"ghost"},{id:"qr_live",label:"Scanner QR/Code-barre",emoji:"⬛",variant:"ghost"},{id:"video_record",label:"Enregistrer vidéo (30s)",emoji:"🎬",variant:"ghost"}]);if(!o)return;if(o==="single"){const n=await t.captureSingle();if(!n.ok){l.error(n.reason??"Capture échouée");return}const i=n.dataUrls?.[0];if(i){const a=e.querySelector(".ax-chat-scroll");if(a){const u=document.createElement("div");u.className="ax-msg ax-msg-user ax-slide-up-fade",u.innerHTML=`<img src="${i}" alt="Capture caméra" style="max-width:100%;border-radius:8px">`,a.appendChild(u),a.scrollTo({top:a.scrollHeight,behavior:"smooth"})}l.success("Photo capturée")}}else if(o==="burst"){const n=await t.captureBurst(5,200);l.info(n.ok?`${n.count} photos capturées`:n.reason??"Échec")}else if(o==="qr_live")await t.scanQrLive(n=>{for(const i of n)l.success(`📦 ${i.format}: ${i.rawValue.slice(0,80)}`)},{durationMs:15e3});else if(o==="video_record"){const n=await t.startVideoRecord(3e4);if(!n.ok){l.error(n.reason??"Recording impossible");return}l.info("🔴 Enregistrement 30s..."),setTimeout(()=>{t.stopVideoRecord().then(i=>{i.ok&&l.success(`Vidéo ${Math.round((i.blob?.size??0)/1024)}KB`)})},3e4)}}catch(t){l.error(t instanceof Error?t.message:"Erreur caméra")}})()}),e.querySelector("#ax-chat-menu")?.addEventListener("click",()=>{g.tap();const t=A.get("isAdmin"),r=q.open({title:"☰ Menu",content:`
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
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>r.close()}]});setTimeout(()=>{document.querySelectorAll("[data-menu-nav]").forEach(o=>{o.addEventListener("click",()=>{const n=o.dataset.menuNav??"";g.tap(),r.close(),n&&(location.hash=`#${n}`)})}),document.querySelectorAll("[data-menu-action]").forEach(o=>{o.addEventListener("click",()=>{const n=o.dataset.menuAction??"";g.tap(),r.close(),n==="paste-key"?e.querySelector("#ax-paste-key-nav")?.click():n==="logout"&&e.querySelector("#ax-logout-nav")?.click()})})},50)});const B=e.querySelector("#ax-chat-settings");B||e.addEventListener("click",t=>{t.target.closest("#ax-chat-settings")&&(location.hash="#settings")}),B?.addEventListener("click",()=>{g.tap(),(async()=>{try{const{aiRoutingPolicy:t}=await y(async()=>{const{aiRoutingPolicy:a}=await import("./ai-routing-policy-Dc-8e9ZV.js");return{aiRoutingPolicy:a}},__vite__mapDeps([13,1,14,0,2,15,16,17,18,19,20,21]),import.meta.url),r=t.getStatus(),o=t.recommendActions(),n=o.length?o.map(a=>`
              <li style="margin:4px 0">
                <span style="color:${a.priority==="high"?"#ff6666":a.priority==="medium"?"#ffaa00":"#a0a4c0"}">●</span>
                ${k(a.action)}
                ${a.url?` <a href="${k(a.url)}" target="_blank" rel="noopener" style="color:#c9a227">→</a>`:""}
              </li>
            `).join(""):'<li style="color:#22cc77">✅ Tout est configuré au mieux</li>',i=q.open({title:"⚙️ Paramètres",content:`
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
                <ul style="margin:0;padding-left:18px;font-size:13px">${n}</ul>
              </div>
            </div>
          `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>i.close()}]});setTimeout(()=>{const a=document.getElementById("ax-settings-mode");a?.addEventListener("change",()=>{const m=a.value;t.setMode(m),l.success(`Mode routing : ${m}`),g.medium()}),document.getElementById("ax-settings-paste-key")?.addEventListener("click",()=>{i.close(),e.querySelector("#ax-paste-key-nav")?.click()})},50)}catch(t){const r=t instanceof Error?t.message:"erreur";l.error(`Paramètres indisponibles : ${r}`)}})()});const j=t=>{e.querySelector(t)?.addEventListener("click",()=>{g.tap();const o=q.open({title:"🔑 Coller ta clé API",content:`
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
        `,actions:[{label:"Annuler",variant:"ghost",onClick:()=>{g.tap(),o.close()}},{label:"Coller + ranger",variant:"primary",onClick:()=>{const i=document.getElementById("ax-paste-input")?.value.trim()??"";if(!i){l.warn('⚠️ Textarea vide — utilise "📋 Coller automatiquement" ou long press dans le rectangle blanc');return}o.close(),(async()=>{const a=await Q.autoStore(i);if(a.forbidden){g.error(),l.error(`${a.pattern?.name} : Apex ne stocke jamais ce type de donnée pour ta sécurité.`,{duration:6e3});return}if(!a.ok){g.warning(),l.warn("Format non reconnu : "+(a.reason??"inconnu")+` (taille ${i.length} chars, début: "${i.slice(0,12)}...")`,{duration:8e3});return}g.success();const u=a.valid===!0?" ✅ validée":a.valid===!1?" ⚠️ ping échoué":"";l.success(`${a.pattern?.name} rangée${u}`),tt(e)})()}}]});setTimeout(()=>{const n=document.getElementById("ax-paste-clipboard-btn"),i=document.getElementById("ax-paste-input"),a=document.getElementById("ax-paste-preview"),u=document.getElementById("ax-paste-detection");n?.addEventListener("click",async()=>{g.tap();try{if(!navigator.clipboard?.readText){l.warn("Clipboard API non supportée. Long press dans le textarea → Coller manuellement.");return}const w=(await navigator.clipboard.readText()).trim();if(!w){l.warn("Presse-papiers vide. Copie d'abord ta clé puis tap ce bouton.");return}i&&(i.value=w);const{detectCredential:$}=await y(async()=>{const{detectCredential:G}=await import("./credential-patterns-BybElwOv.js");return{detectCredential:G}},[],import.meta.url),C=$(w);a&&u&&(C?(u.textContent=`✅ Détecté : ${C.name} (${w.length} chars)`,a.style.display="block",a.style.background="rgba(34,204,119,0.1)",a.style.color="#22cc77"):(u.textContent=`⚠️ Format inconnu (${w.length} chars, début "${w.slice(0,15)}...")`,a.style.display="block",a.style.background="rgba(255,170,0,0.1)",a.style.color="#ffaa00")),l.success('Clé collée — vérifie + tap "Coller + ranger"'),g.medium()}catch(m){const w=m instanceof Error?m.message:"erreur";l.warn(`Permission presse-papiers refusée. Long press dans le textarea blanc → Coller. (${w})`)}}),i?.addEventListener("input",async()=>{const m=i.value.trim();if(!m||!a||!u){a&&(a.style.display="none");return}const{detectCredential:w}=await y(async()=>{const{detectCredential:C}=await import("./credential-patterns-BybElwOv.js");return{detectCredential:C}},[],import.meta.url),$=w(m);$?(u.textContent=`✅ Détecté : ${$.name} (${m.length} chars)`,a.style.display="block",a.style.background="rgba(34,204,119,0.1)",a.style.color="#22cc77"):(u.textContent=`⚠️ Format inconnu (${m.length} chars)`,a.style.display="block",a.style.background="rgba(255,170,0,0.1)",a.style.color="#ffaa00")})},100)})};j("#ax-paste-key"),j("#ax-paste-key-nav"),e.addEventListener("click",t=>{const o=t.target.closest("[data-nav-route]");if(o){const n=o.dataset.navRoute;n&&(g.tap(),location.hash="#"+n)}}),e.querySelector("#ax-logout-nav")?.addEventListener("click",()=>{g.tap();const t=q.open({title:"Déconnexion ?",content:"<p>Tes données restent sauvegardées (Coffre, conversations, profil).</p>",actions:[{label:"Annuler",variant:"ghost",onClick:()=>t.close()},{label:"Déconnecter",variant:"danger",onClick:()=>{g.medium(),t.close(),y(()=>import("./auth-BO7BfNlv.js"),__vite__mapDeps([22,0,1,2,15,16]),import.meta.url).then(r=>{r.auth.logout(),l.info("Déconnecté"),location.hash="#landing"})}}]})}),L.length&&E(e),V.info("chat","Chat view rendered")}export{k as escapeHtml,tt as render,F as renderMarkdownLight,W as renderToolPills};
//# sourceMappingURL=index-Bu-jOLcl.js.map
