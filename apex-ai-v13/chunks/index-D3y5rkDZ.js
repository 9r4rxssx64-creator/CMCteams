const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-C81ortcm.js","./monitoring-WiO5ZBU9.js","./apex-tools-registry-DPQHcZUW.js","./credential-patterns-DqicUg9o.js","./smart-tools-suggester-2ae1dTNs.js","./toast-Dgg9rcIP.js","./haptic-BUEqXK0N.js","./cmc-planning-bridge-CHCqLtAf.js","./file-converter-CYwJSg1O.js","./admin-prompt-u2Swv-xC.js","./modal-sheet-Pqfkse7W.js","./ai-routing-policy-Dq-fXSrV.js","./ai-router-xjr0FhEs.js","../core/main-Ddzxm_px.js","./chat-fallback-Btv6QKCT.js","./tokens-dashboard-C5ZzZyK6.js","./consumption-monitor-D6FNDy41.js","./links-registry-DOfPhj4G.js","./push-notifications-DQcU7R3t.js","../assets/css/main-CjlSpvBL.css","./auth-C103NZpt.js"])))=>i.map(i=>d[i]);
import{_ as w,v as tt}from"./apex-kb-C81ortcm.js";import{s as E,A as et,e as at,m as nt}from"../core/main-Ddzxm_px.js";import{l as H}from"./monitoring-WiO5ZBU9.js";import{aiRouter as K}from"./ai-router-xjr0FhEs.js";import{commerce as rt}from"./commerce-B49RH-Eu.js";import{h as v}from"./haptic-BUEqXK0N.js";import{modalSheet as M}from"./modal-sheet-Pqfkse7W.js";import{toast as d}from"./toast-Dgg9rcIP.js";import"./apex-tools-registry-DPQHcZUW.js";import"./credential-patterns-DqicUg9o.js";import"./apex-tools-dispatch-D8s-5aDg.js";import"./chat-fallback-Btv6QKCT.js";import"./tokens-dashboard-C5ZzZyK6.js";const T=[],O=[];let R=!1;function A(t){return t.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]??a)}function ot(t){if(!Array.isArray(t)||t.length===0)return"";const a=t.length===1?1:t.length<=4?2:3,u=t.map((i,x)=>{const g=A(i.url),s=A(i.filename);return`<div class="ax-album-item" data-img-idx="${x}" style="aspect-ratio:1;background:#1a1a2e;border-radius:8px;overflow:hidden;position:relative;cursor:pointer;-webkit-tap-highlight-color:transparent"><img src="${g}" alt="${s}" loading="lazy" style="width:100%;height:100%;object-fit:cover;transition:transform 200ms cubic-bezier(0.16,1,0.3,1)"><div class="ax-album-overlay" style="position:absolute;bottom:0;left:0;right:0;padding:8px;background:linear-gradient(to top,rgba(0,0,0,0.85),transparent);color:#fff;font-size:11px;line-height:1.3;text-overflow:ellipsis;overflow:hidden;white-space:nowrap">${s}</div></div>`}).join("");return`<div class="ax-image-album" style="display:grid;grid-template-columns:repeat(${a},1fr);gap:8px;margin:12px 0;border-radius:12px">${u}</div>`}function it(t,a){const u=A(a.url),i=A(a.filename),x=document.createElement("div");x.className="ax-lightbox",x.setAttribute("role","dialog"),x.setAttribute("aria-modal","true"),x.setAttribute("aria-label","Visualisation image"),x.style.cssText="position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:env(safe-area-inset-top,20px) 16px env(safe-area-inset-bottom,20px) 16px";const g="min-height:44px;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(20,20,35,0.7);color:#fff;font-size:13px;cursor:pointer;-webkit-tap-highlight-color:transparent;font-weight:600;";x.innerHTML=`<button class="ax-lb-close" aria-label="Fermer" style="position:absolute;top:env(safe-area-inset-top,20px);right:16px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.1);border:none;color:#fff;font-size:20px;cursor:pointer;-webkit-tap-highlight-color:transparent;z-index:1">✕</button><img src="${u}" alt="${i}" style="max-width:100%;max-height:65vh;object-fit:contain;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.5)"><div class="ax-lb-filename" style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:12px;text-align:center">${i}</div><div class="ax-lb-actions" style="display:flex;gap:8px;margin-top:20px;flex-wrap:wrap;justify-content:center;max-width:680px"><button data-action="cartoon" style="${g}" title="Transformer en cartoon">🎨 Cartoon</button><button data-action="anime" style="${g}" title="Style anime">🤖 Anime</button><button data-action="video" style="${g}" title="Animer en vidéo">🎬 Animer vidéo</button><button data-action="remove-bg" style="${g}" title="Retirer le fond">✂️ Retirer fond</button><button data-action="stylize" style="${g}" title="Variation stylisée">🎭 Variations</button><button data-action="share" style="${g}" title="Partager">📤 Partager</button><button data-action="download" style="${g}" title="Télécharger">💾 Télécharger</button></div><div class="ax-lb-status" data-status style="margin-top:14px;color:#c9a227;font-size:12px;min-height:18px;text-align:center"></div>`,document.body.appendChild(x);const s=()=>{x.parentNode&&x.parentNode.removeChild(x)};x.querySelector(".ax-lb-close")?.addEventListener("click",s);const b=f=>{f.key==="Escape"&&(s(),document.removeEventListener("keydown",b))};document.addEventListener("keydown",b),x.addEventListener("click",f=>{f.target===x&&s()});const y=x.querySelector("[data-status]");return x.querySelectorAll("[data-action]").forEach(f=>{f.addEventListener("click",()=>{const k=f.dataset.action??"";st(t,a,k,y,s)})}),x}async function st(t,a,u,i,x){if(u==="share"){const s=navigator;if(s.share)try{await s.share({url:a.url,title:a.filename});return}catch{}try{await navigator.clipboard.writeText(a.url),d.success("Lien copié dans le presse-papiers")}catch{d.warn("Partage non supporté par ce navigateur")}return}if(u==="download"){try{const s=document.createElement("a");s.href=a.url,s.download=a.filename||"image",document.body.appendChild(s),s.click(),document.body.removeChild(s)}catch(s){d.error(s instanceof Error?s.message:"Téléchargement échoué")}return}if(["cartoon","anime","video","remove-bg","stylize"].includes(u)){i&&(i.textContent=`⏳ ${u} en cours… (Replicate)`);let s;if(u==="stylize"){const c=window.prompt('Style souhaité (ex: "huile sur toile renaissance") :');if(!c){i&&(i.textContent="");return}s=c}try{const{apexToolsDispatch:c}=await w(async()=>{const{apexToolsDispatch:k}=await import("./apex-tools-dispatch-D8s-5aDg.js").then(S=>S.b);return{apexToolsDispatch:k}},__vite__mapDeps([0,1,2,3]),import.meta.url),b={url:a.url,type:u};s&&(b.prompt=s);const y=await c.execute("transform_image",b,"admin");if(!y.ok){const k=y.error??"transformation échouée";i&&(i.textContent=`❌ ${k}`),d.error(k);return}const f=y.result;if(!f.success||!f.outputUrl){const k=f.error??"aucun outputUrl";i&&(i.textContent=`❌ ${k}`);return}if(i){const k=f.cost_eur!==void 0&&f.cost_eur!==null?` (${f.cost_eur.toFixed(3)}€)`:"";i.textContent=`✅ Transformé${k}`}ct(t,f.outputUrl,u,a.filename),setTimeout(x,1500)}catch(c){const b=c instanceof Error?c.message:"erreur";i&&(i.textContent=`❌ ${b}`)}return}}function ct(t,a,u,i){const x=t.querySelector(".ax-chat-scroll");if(!x)return;const g=A(a),s=A(i),c=A(u),y=u==="video"||/\.(mp4|webm|mov)(\?|$)/i.test(a)?`<video src="${g}" controls autoplay loop playsinline style="max-width:100%;max-height:70vh;border-radius:12px;display:block">Ton navigateur ne supporte pas la vidéo HTML5.</video>`:`<img src="${g}" alt="${s} ${c}" style="max-width:100%;max-height:70vh;object-fit:contain;border-radius:12px;display:block">`,f=document.createElement("div");f.className="ax-msg ax-msg-assistant ax-slide-up-fade ax-transform-result",f.dataset.transformType=u,f.innerHTML=`<div class="ax-msg-body"><p style="margin:0 0 8px;color:#c9a227;font-size:12px;font-weight:600">${lt(u)} ${c} appliqué sur ${s}</p>`+y+`<div class="ax-transform-actions" style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap"><button data-tr-action="download" data-tr-url="${g}" style="min-height:36px;padding:6px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);background:rgba(20,20,35,0.7);color:#fff;font-size:12px;cursor:pointer">💾 Télécharger</button><button data-tr-action="share" data-tr-url="${g}" style="min-height:36px;padding:6px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);background:rgba(20,20,35,0.7);color:#fff;font-size:12px;cursor:pointer">📤 Partager</button></div></div>`,x.appendChild(f),x.scrollTo({top:x.scrollHeight,behavior:"smooth"}),f.querySelectorAll("[data-tr-action]").forEach(k=>{k.addEventListener("click",()=>{const S=k.dataset.trAction??"",I=k.dataset.trUrl??"";if(S==="download"){const C=document.createElement("a");C.href=I,C.download=`apex-${u}-${Date.now()}`,document.body.appendChild(C),C.click(),document.body.removeChild(C)}else if(S==="share"){const C=navigator;C.share?C.share({url:I}).catch(()=>{}):navigator.clipboard?.writeText(I)}})})}function lt(t){return{cartoon:"🎨",anime:"🤖",video:"🎬","remove-bg":"✂️",stylize:"🎭"}[t]??"🖼️"}function G(t){if(t.role!=="assistant"||t.streaming||!t.text||t.text.length===0)return"";const a="width:32px;height:32px;border-radius:50%;background:rgba(201,162,39,0.1);border:1px solid rgba(201,162,39,0.3);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:14px;color:var(--ax-gold);transition:all 200ms;opacity:0.7;-webkit-tap-highlight-color:transparent;padding:0;";return`<div class="ax-msg-actions" style="display:flex;gap:6px;margin-top:8px;justify-content:flex-end;flex-wrap:wrap"><button class="ax-msg-action" data-action="speak" data-msg-id="${A(t.id)}" style="${a}" title="Lire la réponse à voix haute" aria-label="Lire la réponse">🔊</button><button class="ax-msg-action" data-action="copy" data-msg-id="${A(t.id)}" style="${a}" title="Copier dans presse-papiers" aria-label="Copier le texte">📋</button><button class="ax-msg-action" data-action="export-pdf" data-msg-id="${A(t.id)}" style="${a}" title="Exporter en PDF" aria-label="Exporter PDF">📄</button></div>`}function J(t){let a=A(t);return a=a.replace(/```([\s\S]*?)```/g,(u,i)=>`<pre class="ax-code"><code>${i}</code></pre>`),a=a.replace(/`([^`\n]+)`/g,'<code class="ax-code-inline">$1</code>'),a=a.replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>"),a=a.replace(/\*([^*\n]+)\*/g,"<em>$1</em>"),a=a.replace(/\n/g,"<br>"),a}function dt(){const t=E.get("user");return nt.buildSystemPromptContext(t)}async function ut(t,a){try{const{apexToolsDispatch:u}=await w(async()=>{const{apexToolsDispatch:f}=await import("./apex-tools-dispatch-D8s-5aDg.js").then(k=>k.b);return{apexToolsDispatch:f}},__vite__mapDeps([0,1,2,3]),import.meta.url),i=await u.execute("detect_intent",{text:t},"admin");if(!i.ok||!i.result)return;const x=i.result.intent,g=i.result.confidence??0;if(!x||x==="unknown"||g<.7)return;if(x==="open_url"||x==="open_browser"){const f=t.match(/(https?:\/\/[^\s]+)/i),k=t.match(/\b([a-z0-9-]+\.(com|fr|io|net|org|app|dev|ai|co))\b/i),S=f?.[1]??k?.[1]??"https://www.google.com";u.execute("open_url",{url:S},"admin");return}const{smartToolsSuggester:s}=await w(async()=>{const{smartToolsSuggester:f}=await import("./smart-tools-suggester-2ae1dTNs.js");return{smartToolsSuggester:f}},__vite__mapDeps([4,1,2]),import.meta.url),c=s.suggestForIntent(x);if(!c)return;const{toast:b}=await w(async()=>{const{toast:f}=await import("./toast-Dgg9rcIP.js");return{toast:f}},__vite__mapDeps([5,6]),import.meta.url);b.info(`${c.emoji} ${c.name} disponible — tape pour ouvrir`,{duration:5e3});const y=E.get("user");y?.id&&s.recordUsage(c.id,y.id),pt(a,c)}catch(u){H.warn("chat","detectAndSuggestTool failed",{err:u})}}function pt(t,a){const u=t.querySelector(".ax-chat-scroll");if(!u)return;const i=document.createElement("div");i.className="ax-msg ax-msg-tool ax-slide-up-fade",i.innerHTML=`
    <div class="ax-tool-card">
      <div class="ax-tool-icon">${a.emoji}</div>
      <div class="ax-tool-info">
        <strong>${A(a.name)}</strong>
        <p style="margin:4px 0 0;color:var(--ax-text-dim);font-size:13px">${A(a.description)}</p>
      </div>
      <button class="ax-btn ax-btn-primary ax-btn-sm" onclick="location.hash='${A(a.cta_target)}'">${A(a.cta_label)}</button>
    </div>
  `,u.appendChild(i),u.scrollTo({top:u.scrollHeight,behavior:"smooth"})}async function Y(t){if(R||O.length===0)return;R=!0;const a=O.shift();if(a===void 0){R=!1;return}const u=E.get("user");if(!rt.consumeMessage(u?.id??null).allowed){mt(t,"Tu as atteint ta limite quotidienne. Passe en plan supérieur ou réessaie demain."),R=!1;return}ut(a,t);const x={id:`u_${Date.now()}`,role:"user",text:a,ts:Date.now()};T.push(x);const g={id:`a_${Date.now()}`,role:"assistant",text:"",ts:Date.now(),streaming:!0};T.push(g),E.set("isStreaming",!0),D(t);const s=T.filter(c=>!c.streaming||c===g).slice(-30).filter(c=>c!==g).map(c=>({role:c.role,content:c.text}));await K.stream(s,dt(),c=>{if(c.type==="tool_use_start"&&c.toolName){g.toolPills||(g.toolPills=[]),g.toolPills.push({name:c.toolName,status:"running"}),F(t,g);return}if(c.type==="tool_use_done"){if(g.toolPills)for(const b of g.toolPills)b.status==="running"&&(b.status="done");g.toolBatchCount=(g.toolBatchCount??0)+(c.toolCount??0),F(t,g);return}c.text&&(g.text+=c.text,F(t,g)),c.done&&(delete g.streaming,E.set("isStreaming",!1),D(t),bt(g))},c=>{g.text=at.toUserMessage(c)+" (Apex bascule sur le mode hors-ligne — réessaie dans un instant.)",delete g.streaming,E.set("isStreaming",!1),D(t)}),R=!1,O.length&&Y(t)}function mt(t,a){T.push({id:`a_${Date.now()}`,role:"assistant",text:a,ts:Date.now()}),D(t)}const Q="apex_v13_chat_auto_read";function xt(){try{return localStorage.getItem(Q)==="1"}catch{return!1}}function zt(t){try{localStorage.setItem(Q,t?"1":"0")}catch{}}async function gt(t,a){if(v.tap(),t.classList.contains("ax-playing")){try{const{stopAll:u}=await w(async()=>{const{stopAll:i}=await import("./voice-BcOs5xoC.js").then(x=>x.a);return{stopAll:i}},__vite__mapDeps([1,2]),import.meta.url);u()}catch{}t.classList.remove("ax-playing"),t.textContent="🔊";return}try{const{stopAll:u,speak:i,getActiveVoice:x}=await w(async()=>{const{stopAll:c,speak:b,getActiveVoice:y}=await import("./voice-BcOs5xoC.js").then(f=>f.a);return{stopAll:c,speak:b,getActiveVoice:y}},__vite__mapDeps([1,2]),import.meta.url);u(),document.querySelectorAll(".ax-msg-action.ax-playing").forEach(c=>{c.classList.remove("ax-playing"),c.textContent="🔊"}),t.classList.add("ax-playing"),t.textContent="⏸";const g=x(),s=await i(a.text,g);s.ok||d.warn(`Lecture impossible : ${s.reason??"erreur"}`)}catch(u){const i=u instanceof Error?u.message:"erreur";d.warn(`Lecture vocale échouée : ${i}`)}finally{t.classList.remove("ax-playing"),t.textContent="🔊"}}async function ft(t){v.tap();try{if(!navigator.clipboard?.writeText){d.warn("Presse-papiers non supporté par ton navigateur");return}await navigator.clipboard.writeText(t.text),v.success(),d.success("Copié dans presse-papiers")}catch(a){const u=a instanceof Error?a.message:"erreur";d.warn(`Copie échouée : ${u}`)}}async function ht(t){v.tap();try{const u=await import("https://cdn.jsdelivr.net/npm/jspdf@2.5.2/+esm"),i=u.default,x=u.jsPDF??(typeof i=="function"?i:i?.jsPDF);if(typeof x!="function"){d.warn("Export PDF indisponible");return}const g=x,s=new g,c=s.internal.pageSize.getHeight(),b=s.splitTextToSize(t.text,180);let y=20;const f=7;for(const k of b)y>c-20&&(s.addPage(),y=20),s.text(k,15,y),y+=f;s.save(`apex-${Date.now()}.pdf`),v.success(),d.success("PDF téléchargé")}catch(a){const u=a instanceof Error?a.message:"erreur";d.warn(`Export PDF échoué : ${u}`)}}async function bt(t){if(!(t.role!=="assistant"||t.streaming)&&!(!t.text||t.text.length===0)&&xt())try{const{speak:a,getActiveVoice:u,stopAll:i}=await w(async()=>{const{speak:g,getActiveVoice:s,stopAll:c}=await import("./voice-BcOs5xoC.js").then(b=>b.a);return{speak:g,getActiveVoice:s,stopAll:c}},__vite__mapDeps([1,2]),import.meta.url);i();const x=u();await a(t.text,x)}catch(a){H.warn("chat","auto-read failed",{err:a})}}function X(t){if(!t.toolPills||t.toolPills.length===0)return"";const a=t.toolPills.every(i=>i.status==="done"),u="padding:4px 8px;background:rgba(201,162,39,0.1);border-radius:8px;font-size:11px;color:var(--ax-gold);display:inline-block;margin:4px 4px 4px 0;";if(a){const i=t.toolBatchCount??t.toolPills.length,x=t.toolPills.map(g=>A(g.name)).join(", ");return`<details class="ax-tool-pills" style="margin:4px 0;"><summary style="${u}cursor:pointer;">▶ ${i} opération${i>1?"s":""}</summary><div style="font-size:11px;color:#888;padding:4px 8px;">${x}</div></details>`}return t.toolPills.map(i=>{const x=i.status==="running"?"🔧":"✅";return`<span class="ax-tool-pill" style="${u}">${x} ${A(i.name)}</span>`}).join("")}function F(t,a){const u=t.querySelector(`[data-msg-id="${a.id}"] .ax-msg-body`);if(u){u.innerHTML=X(a)+J(a.text)+(a.streaming?'<span class="ax-cursor">▌</span>':"")+G(a);const i=t.querySelector(".ax-chat-scroll");i&&i.scrollTo({top:i.scrollHeight,behavior:"smooth"})}else D(t)}function D(t){const a=t.querySelector(".ax-chat-scroll");if(!a)return;const u=T.map(i=>{let x="";i.streaming&&(i.text.length===0?x=`
            <span class="ax-typing" aria-label="Apex réfléchit">
              <span class="ax-typing-dot"></span>
              <span class="ax-typing-dot"></span>
              <span class="ax-typing-dot"></span>
            </span>
          `:x='<span class="ax-cursor">▌</span>');const g=X(i),s=G(i);return`
        <div class="ax-msg ax-msg-${i.role} ax-modernized-msg ax-slide-up-fade" data-msg-id="${i.id}">
          <div class="ax-msg-body">${g}${J(i.text)}${x}${s}</div>
        </div>
      `}).join("");a.innerHTML=u,a.scrollTo({top:a.scrollHeight,behavior:"smooth"})}function yt(t){const a=E.get("user"),u=a?`Bonjour ${a.name}, qu'est-ce que je peux faire pour toi ?`:"Bienvenue dans Apex.",i=E.get("isAdmin"),x=K.hasAnyKey();t.innerHTML=`
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
        <div class="ax-chat-greeting">${A(u)}</div>
        ${x?"":`
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
        ${i?'<button class="ax-btn ax-btn-sm" data-nav-route="admin" style="white-space:nowrap;min-height:44px;padding:8px 14px">⚙️ Admin</button>':""}
        <button class="ax-btn ax-btn-sm" data-nav-route="vault" style="white-space:nowrap;min-height:44px;padding:8px 14px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;font-weight:700">🔐 Coffre</button>
        <button class="ax-btn ax-btn-sm" data-nav-route="settings" style="white-space:nowrap;min-height:44px;padding:8px 14px">🔧 Réglages</button>
        <button class="ax-btn ax-btn-sm" id="ax-paste-key-nav" style="white-space:nowrap;min-height:44px;padding:8px 14px">🔑 Clé API</button>
        <button class="ax-btn ax-btn-sm" id="ax-logout-nav" style="white-space:nowrap;min-height:44px;padding:8px 14px;color:#ff6666">🚪 Déconnexion</button>
      </nav>
      <footer style="text-align:center;padding:6px 6px calc(env(safe-area-inset-bottom,0px) + 6px);font-size:11px;color:var(--ax-text-muted);background:var(--ax-bg);flex-shrink:0">
        APEX AI ${et} — Créé par <strong style="color:var(--ax-gold)">DK</strong>
      </footer>
    </div>
  `;const g=t.querySelector("#ax-chat-form"),s=t.querySelector("#ax-chat-text");g&&s&&(g.addEventListener("submit",n=>{n.preventDefault();const l=s.value.trim();l&&(async()=>{const{detectAllCredentials:p}=await w(async()=>{const{detectAllCredentials:r}=await import("./credential-patterns-DqicUg9o.js");return{detectAllCredentials:r}},[],import.meta.url);if(p(l).length>0){s.value="",s.style.height="auto";const{vault:r}=await w(async()=>{const{vault:m}=await import("./apex-kb-C81ortcm.js").then(h=>h.b);return{vault:m}},__vite__mapDeps([0,1,2,3]),import.meta.url),e=await r.autoStoreBulk(l);if(e.stored.length>0){const m=e.stored.map(h=>h.pattern.name).join(", ");d.success(`🔑 ${e.stored.length} clé(s) chiffrée(s) AES-GCM-256 : ${m}`,{duration:6e3})}if(e.forbidden.length>0){const m=e.forbidden.map(h=>h.pattern.name).join(", ");d.error(`🚫 ${m} JAMAIS stocké (sécu Kevin)`,{duration:8e3})}e.failed>0&&e.stored.length===0&&d.warn(`⚠️ ${e.failed} format inconnu — ouvre 🔐 Coffre pour coller manuellement`,{duration:8e3});return}s.value="",s.style.height="auto",O.push(l),Y(t),(async()=>{try{const{detectAndPushIfPlanning:r}=await w(async()=>{const{detectAndPushIfPlanning:m}=await import("./cmc-planning-bridge-CHCqLtAf.js");return{detectAndPushIfPlanning:m}},__vite__mapDeps([7,0,1,2,3]),import.meta.url),e=await r(l,"chat");e&&e.push.ok&&e.push.id&&d.info(`📋 Planning détecté → envoyé à CMCteams (id: ${e.push.id})`,{duration:5e3})}catch{}})()})()}),s.addEventListener("input",()=>{s.style.height="auto",s.style.height=`${Math.min(s.scrollHeight,200)}px`}),s.addEventListener("keydown",n=>{n.key==="Enter"&&!n.shiftKey&&(n.preventDefault(),g.requestSubmit())}),s.addEventListener("paste",n=>{const l=n.clipboardData?.getData("text")?.trim()??"";l&&((async()=>{try{const{detectAndPushIfPlanning:p}=await w(async()=>{const{detectAndPushIfPlanning:r}=await import("./cmc-planning-bridge-CHCqLtAf.js");return{detectAndPushIfPlanning:r}},__vite__mapDeps([7,0,1,2,3]),import.meta.url),o=await p(l,"paste");o&&o.push.ok&&o.push.id&&d.info(`📋 Planning détecté → envoyé à CMCteams (id: ${o.push.id})`,{duration:5e3})}catch{}})(),(async()=>{const{detectAllCredentials:p}=await w(async()=>{const{detectAllCredentials:m}=await import("./credential-patterns-DqicUg9o.js");return{detectAllCredentials:m}},[],import.meta.url);if(p(l).length===0)return;s.value="";const{vault:r}=await w(async()=>{const{vault:m}=await import("./apex-kb-C81ortcm.js").then(h=>h.b);return{vault:m}},__vite__mapDeps([0,1,2,3]),import.meta.url),e=await r.autoStoreBulk(l);if(e.stored.length>0){const m=e.stored.map(h=>h.pattern.name).join(", ");d.success(`🔑 ${e.stored.length} clé(s) chiffrée(s) auto AES-GCM-256 : ${m}`,{duration:6e3})}if(e.forbidden.length>0){const m=e.forbidden.map(h=>h.pattern.name).join(", ");d.error(`🚫 ${m} JAMAIS stocké (règle sécu)`,{duration:8e3})}e.failed>0&&e.stored.length===0&&d.warn("Format inconnu — ouvre 🔐 Coffre pour coller manuellement",{duration:6e3})})())}));const c=t.querySelector("#ax-chat-mic");let b=null,y=!1,f=0;const k=20;c?.addEventListener("click",()=>{v.tap();const n=window.SpeechRecognition??window.webkitSpeechRecognition;if(!n){d.warn("Dictée vocale non supportée par ton navigateur");return}if(y&&b){b.stop(),y=!1,c.style.background="";return}(async()=>{try{const{checkMicrophonePermission:r}=await w(async()=>{const{checkMicrophonePermission:m}=await import("./voice-BcOs5xoC.js").then(h=>h.v);return{checkMicrophonePermission:m}},__vite__mapDeps([1,2]),import.meta.url);if(await r()==="denied"){d.warn("🚫 Micro refusé — autorise dans Réglages iOS > Apex > Microphone",{duration:7e3});return}o()}catch{o()}})();function l(r,e){try{const m="ax_voice_log",h=localStorage.getItem(m),_=h?JSON.parse(h):[],P={ts:Date.now(),evt:r,src:"dictation"};for(e!==void 0&&(P.detail=e),_.push(P);_.length>100;)_.shift();localStorage.setItem(m,JSON.stringify(_))}catch{}}function p(){const r=navigator.userAgent||"";return/iPhone|iPad|iPod/.test(r)?!0:navigator.platform==="MacIntel"&&(navigator.maxTouchPoints??0)>1}function o(){try{if(b=new n,!b)return;const r=p();b.continuous=!1,b.interimResults=!0,b.lang="fr-FR";let e="",m=null;const h=1500;f=0,b.onstart=()=>{l("start",r?"iOS":"desktop")},b.onresult=_=>{const P=_;let $="",q=!1;for(let z=P.resultIndex;z<P.results.length;z++){const B=P.results[z];B?.[0]&&($+=B[0].transcript,B.isFinal&&(q=!0))}const W=t.querySelector("#ax-chat-text");W&&(W.value=$),f=0,l(q?"result":"interim",$.slice(0,80)),q&&(e=$,m&&clearTimeout(m),m=setTimeout(()=>{if(e.trim().length>0&&y){try{b?.stop()}catch{}t.querySelector("#ax-chat-form")?.requestSubmit()}},h))},b.onend=()=>{l("end"),y=!1,c&&(c.style.background=""),m&&(clearTimeout(m),m=null);const _=t.querySelector("#ax-chat-text");e.trim().length>0&&_&&_.value.trim()===e.trim()&&t.querySelector("#ax-chat-form")?.requestSubmit()},b.onerror=_=>{const $=_.error??"inconnu";if(l("error",$),$!=="aborted"){if($==="no-speech"){if(f++,f<k)return;d.warn("🤫 Pas entendu — réessaye en parlant plus fort",{duration:4e3}),y=!1,c&&(c.style.background="");return}if($==="not-allowed"||$==="service-not-allowed"){d.warn("🚫 Micro refusé — Réglages iOS > Safari > Microphone",{duration:7e3}),y=!1,c&&(c.style.background="");return}d.warn(`Dictée erreur : ${$}`),y=!1,c&&(c.style.background="")}},b.start(),y=!0,c&&(c.style.background="linear-gradient(135deg,#ff4444,#cc2222)"),v.medium(),d.success("🎙 Parle maintenant — re-tap 🎙 pour arrêter")}catch(r){const e=r instanceof Error?r.message:"erreur";l("error",`start: ${e}`),d.warn(`Dictée fail : ${e}`)}}});const S=t.querySelector("#ax-chat-wake");S?.addEventListener("click",()=>{v.tap(),(async()=>{try{const{voicePrint:n,checkMicrophonePermission:l}=await w(async()=>{const{voicePrint:r,checkMicrophonePermission:e}=await import("./voice-BcOs5xoC.js").then(m=>m.v);return{voicePrint:r,checkMicrophonePermission:e}},__vite__mapDeps([1,2]),import.meta.url);if(!n.isSupported()){d.warn("Wake word non supporté par ton navigateur");return}if(n.isListening()){n.stopWakeWord(),S&&(S.style.background=""),d.success("Wake word arrêté");return}if(await l()==="denied"){d.warn("🚫 Micro refusé — autorise dans Réglages iOS > Apex > Microphone",{duration:7e3});return}n.onWakeInterim((r,e)=>{const m=t.querySelector("#ax-chat-text");m&&r&&m.dataset.wakeInterim==="1"&&(m.placeholder=e?`🎙 ${r.slice(0,60)}`:`🎙 ${r.slice(0,60)}…`)});const o=n.startWakeWord(r=>{const e=t.querySelector("#ax-chat-text");e&&(e.value=r,e.placeholder="",t.querySelector("#ax-chat-form")?.requestSubmit())});if(o.ok&&S){S.style.background="linear-gradient(135deg,#22cc77,#1a9a5a)";const r=t.querySelector("#ax-chat-text");r&&(r.dataset.wakeInterim="1"),d.success('👂 "Dis Apex" actif — parle quand tu veux')}else d.warn(`Wake word fail : ${o.reason??"inconnu"}`)}catch(n){const l=n instanceof Error?n.message:"erreur";d.warn(`Wake word erreur : ${l}`)}})()});const I=t.querySelector("#ax-chat-attach"),C=t.querySelector("#ax-chat-file-input"),V=t.querySelector("#ax-chat-attachments");I?.addEventListener("click",()=>{v.tap(),C?.click()});const j=n=>{if(!V)return;V.style.display="block";const l=(n.size/1024/1024).toFixed(2),p=n.type.startsWith("image/")?"🖼️":n.type.startsWith("video/")?"🎬":n.type.startsWith("audio/")?"🎵":n.type.includes("pdf")?"📄":n.type.includes("zip")||n.type.includes("rar")||n.type.includes("7z")?"📦":"📎",o=document.createElement("div");o.style.cssText="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:rgba(201,162,39,0.1);border:1px solid rgba(201,162,39,0.3);border-radius:6px;margin-right:6px;font-size:12px;color:#c9a227",o.textContent=`${p} ${n.name.slice(0,30)}${n.name.length>30?"...":""} (${l} MB)`,V.appendChild(o)},Z=n=>{const l=t.querySelector(".ax-chat-scroll");if(!l||n.length===0)return;const p=document.createElement("div");p.className="ax-msg ax-msg-user ax-slide-up-fade",p.innerHTML=`<div class="ax-msg-body">${ot(n)}</div>`,l.appendChild(p),l.scrollTo({top:l.scrollHeight,behavior:"smooth"}),p.querySelectorAll(".ax-album-item").forEach(o=>{o.addEventListener("click",()=>{const r=o.dataset.imgIdx??"0",e=parseInt(r,10),m=n[e];m&&it(t,m)})})};C?.addEventListener("change",()=>{const n=Array.from(C.files??[]);if(n.length===0)return;v.success();const l=[];for(const p of n){if(j(p),p.type.startsWith("image/"))try{const o=URL.createObjectURL(p);l.push({url:o,filename:p.name})}catch{}(async()=>{try{const{fileConverter:o}=await w(async()=>{const{fileConverter:e}=await import("./file-converter-CYwJSg1O.js");return{fileConverter:e}},__vite__mapDeps([8,1,2]),import.meta.url),r=await o.ingest(p,"admin");r.ok?d.success(`✅ ${p.name} ingéré`):d.warn(`Ingest fail : ${r.reason??p.name}`)}catch(o){const r=o instanceof Error?o.message:"erreur";d.warn(`File error : ${r}`)}})()}l.length>0&&Z(l),C.value=""});const L=t.querySelector(".ax-chat-body, #ax-chat-form");L&&(L.addEventListener("dragover",n=>{n.preventDefault(),L.style.background="rgba(201,162,39,0.1)"}),L.addEventListener("dragleave",()=>{L.style.background=""}),L.addEventListener("drop",n=>{n.preventDefault(),L.style.background="";const p=Array.from(n.dataTransfer?.files??[]);for(const o of p)j(o),(async()=>{try{const{fileConverter:r}=await w(async()=>{const{fileConverter:e}=await import("./file-converter-CYwJSg1O.js");return{fileConverter:e}},__vite__mapDeps([8,1,2]),import.meta.url);await r.ingest(o,"admin"),d.success(`📎 ${o.name} ajouté`)}catch{}})()})),t.querySelector("#ax-chat-text")?.addEventListener("paste",n=>{const l=n.clipboardData?.items??[];for(let p=0;p<l.length;p++){const o=l[p];if(o&&o.kind==="file"){const r=o.getAsFile();r&&(j(r),(async()=>{try{const{fileConverter:e}=await w(async()=>{const{fileConverter:m}=await import("./file-converter-CYwJSg1O.js");return{fileConverter:m}},__vite__mapDeps([8,1,2]),import.meta.url);await e.ingest(r,"admin"),d.success(`📋 ${r.name||"media collé"} ajouté`)}catch{}})())}}}),t.querySelector("#ax-chat-camera")?.addEventListener("click",()=>{v.tap(),(async()=>{try{const{smartCamera:n}=await w(async()=>{const{smartCamera:o}=await import("./smart-camera-Big1kwzd.js");return{smartCamera:o}},__vite__mapDeps([1,2]),import.meta.url),{adminPrompt:l}=await w(async()=>{const{adminPrompt:o}=await import("./admin-prompt-u2Swv-xC.js");return{adminPrompt:o}},__vite__mapDeps([9,6,10,5,2,1,0,3]),import.meta.url),p=await l.askChoice("📷 Caméra","Choisis le mode :",[{id:"single",label:"Photo simple",emoji:"📷",variant:"primary"},{id:"burst",label:"Rafale (5 photos)",emoji:"⚡",variant:"ghost"},{id:"qr_live",label:"Scanner QR/Code-barre",emoji:"⬛",variant:"ghost"},{id:"video_record",label:"Enregistrer vidéo (30s)",emoji:"🎬",variant:"ghost"}]);if(!p)return;if(p==="single"){const o=await n.captureSingle();if(!o.ok){d.error(o.reason??"Capture échouée");return}const r=o.dataUrls?.[0];if(r){const e=t.querySelector(".ax-chat-scroll");if(e){const m=document.createElement("div");m.className="ax-msg ax-msg-user ax-slide-up-fade";const h=document.createElement("img");h.alt="Capture caméra",h.style.maxWidth="100%",h.style.borderRadius="8px",(typeof r=="string"&&/^data:image\/[a-z+]+;base64,/i.test(r)||typeof r=="string"&&/^https?:/.test(r))&&(h.src=r),m.appendChild(h),e.appendChild(m),e.scrollTo({top:e.scrollHeight,behavior:"smooth"})}d.success("Photo capturée")}}else if(p==="burst"){const o=await n.captureBurst(5,200);d.info(o.ok?`${o.count} photos capturées`:o.reason??"Échec")}else if(p==="qr_live")await n.scanQrLive(o=>{for(const r of o)d.success(`📦 ${r.format}: ${r.rawValue.slice(0,80)}`)},{durationMs:15e3});else if(p==="video_record"){const o=await n.startVideoRecord(3e4);if(!o.ok){d.error(o.reason??"Recording impossible");return}d.info("🔴 Enregistrement 30s..."),setTimeout(()=>{n.stopVideoRecord().then(r=>{r.ok&&d.success(`Vidéo ${Math.round((r.blob?.size??0)/1024)}KB`)})},3e4)}}catch(n){d.error(n instanceof Error?n.message:"Erreur caméra")}})()}),t.querySelector("#ax-chat-menu")?.addEventListener("click",()=>{v.tap();const n=E.get("isAdmin"),l=M.open({title:"☰ Menu",content:`
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="ax-btn ax-btn-primary" data-menu-nav="chat" style="width:100%;text-align:left;padding:14px">💬 Chat</button>
          ${n?'<button class="ax-btn ax-btn-primary" data-menu-nav="admin" style="width:100%;text-align:left;padding:14px">👑 Centre Admin</button>':""}
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
          ${n?'<button class="ax-btn ax-btn-primary" data-menu-nav="billing" style="width:100%;text-align:left;padding:14px">💳 Comptes &amp; Factures</button>':""}
          ${n?'<button class="ax-btn ax-btn-primary" data-menu-nav="sentinels" style="width:100%;text-align:left;padding:14px">🛡 Sentinelles</button>':""}
          <button class="ax-btn ax-btn-primary" data-menu-nav="settings" style="width:100%;text-align:left;padding:14px">⚙️ Réglages</button>
          <button class="ax-btn" data-menu-action="paste-key" style="width:100%;text-align:left;padding:14px">🔑 Coller une clé API</button>
          <button class="ax-btn" data-menu-action="logout" style="width:100%;text-align:left;padding:14px;color:#ff6666">🚪 Déconnexion</button>
        </div>
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>l.close()}]});setTimeout(()=>{document.querySelectorAll("[data-menu-nav]").forEach(p=>{p.addEventListener("click",()=>{const o=p.dataset.menuNav??"";v.tap(),l.close(),o&&(location.hash=`#${o}`)})}),document.querySelectorAll("[data-menu-action]").forEach(p=>{p.addEventListener("click",()=>{const o=p.dataset.menuAction??"";v.tap(),l.close(),o==="paste-key"?t.querySelector("#ax-paste-key-nav")?.click():o==="logout"&&t.querySelector("#ax-logout-nav")?.click()})})},50)});const N=t.querySelector("#ax-chat-settings");N||t.addEventListener("click",n=>{n.target.closest("#ax-chat-settings")&&(location.hash="#settings")}),N?.addEventListener("click",()=>{v.tap(),(async()=>{try{const{aiRoutingPolicy:n}=await w(async()=>{const{aiRoutingPolicy:e}=await import("./ai-routing-policy-Dq-fXSrV.js");return{aiRoutingPolicy:e}},__vite__mapDeps([11,1,12,0,2,3,13,14,15,16,17,18,19]),import.meta.url),l=n.getStatus(),p=n.recommendActions(),o=p.length?p.map(e=>`
              <li style="margin:4px 0">
                <span style="color:${e.priority==="high"?"#ff6666":e.priority==="medium"?"#ffaa00":"#a0a4c0"}">●</span>
                ${A(e.action)}
                ${e.url?` <a href="${A(e.url)}" target="_blank" rel="noopener" style="color:#c9a227">→</a>`:""}
              </li>
            `).join(""):'<li style="color:#22cc77">✅ Tout est configuré au mieux</li>',r=M.open({title:"⚙️ Paramètres",content:`
            <div style="display:flex;flex-direction:column;gap:14px">
              <div>
                <h4 style="margin:0 0 6px;color:#c9a227">Routing IA</h4>
                <label style="display:block;margin:6px 0">
                  Mode :
                  <select id="ax-settings-mode" style="margin-left:8px;padding:6px;background:#1a1a2e;color:#fff;border:1px solid #c9a227;border-radius:4px">
                    <option value="auto" ${l.mode==="auto"?"selected":""}>Auto (intelligent)</option>
                    <option value="economy" ${l.mode==="economy"?"selected":""}>Économie (gratuit d'abord)</option>
                    <option value="premium" ${l.mode==="premium"?"selected":""}>Premium (Anthropic toujours)</option>
                  </select>
                </label>
                <p style="margin:6px 0;color:#a0a4c0;font-size:12px">
                  Anthropic : <span style="color:${l.anthropic_health==="ok"?"#22cc77":l.anthropic_health==="warn"?"#ffaa00":"#ff6666"}">${l.anthropic_health}</span>
                  · Gratuits dispo : ${l.free_providers_available.length}
                  · Payants dispo : ${l.paid_providers_available.length}
                </p>
              </div>
              <div>
                <h4 style="margin:0 0 6px;color:#c9a227">Clés API</h4>
                <button type="button" class="ax-btn ax-btn-primary" id="ax-settings-paste-key" style="width:100%">🔑 Coller une clé API</button>
              </div>
              <div>
                <h4 style="margin:0 0 6px;color:#c9a227">Recommandations</h4>
                <ul style="margin:0;padding-left:18px;font-size:13px">${o}</ul>
              </div>
            </div>
          `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>r.close()}]});setTimeout(()=>{const e=document.getElementById("ax-settings-mode");e?.addEventListener("change",()=>{const h=e.value;n.setMode(h),d.success(`Mode routing : ${h}`),v.medium()}),document.getElementById("ax-settings-paste-key")?.addEventListener("click",()=>{r.close(),t.querySelector("#ax-paste-key-nav")?.click()})},50)}catch(n){const l=n instanceof Error?n.message:"erreur";d.error(`Paramètres indisponibles : ${l}`)}})()});const U=n=>{t.querySelector(n)?.addEventListener("click",()=>{v.tap();const p=M.open({title:"🔑 Coller ta clé API",content:`
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
        `,actions:[{label:"Annuler",variant:"ghost",onClick:()=>{v.tap(),p.close()}},{label:"Coller + ranger",variant:"primary",onClick:()=>{const r=document.getElementById("ax-paste-input")?.value.trim()??"";if(!r){d.warn('⚠️ Textarea vide — utilise "📋 Coller automatiquement" ou long press dans le rectangle blanc');return}p.close(),(async()=>{const e=await tt.autoStore(r);if(e.forbidden){v.error(),d.error(`${e.pattern?.name} : Apex ne stocke jamais ce type de donnée pour ta sécurité.`,{duration:6e3});return}if(!e.ok){v.warning(),d.warn("Format non reconnu : "+(e.reason??"inconnu")+` (taille ${r.length} chars, début: "${r.slice(0,12)}...")`,{duration:8e3});return}v.success();const m=e.valid===!0?" ✅ validée":e.valid===!1?" ⚠️ ping échoué":"";d.success(`${e.pattern?.name} rangée${m}`),yt(t)})()}}]});setTimeout(()=>{const o=document.getElementById("ax-paste-clipboard-btn"),r=document.getElementById("ax-paste-input"),e=document.getElementById("ax-paste-preview"),m=document.getElementById("ax-paste-detection");o?.addEventListener("click",async()=>{v.tap();try{if(!navigator.clipboard?.readText){d.warn("Clipboard API non supportée. Long press dans le textarea → Coller manuellement.");return}const _=(await navigator.clipboard.readText()).trim();if(!_){d.warn("Presse-papiers vide. Copie d'abord ta clé puis tap ce bouton.");return}r&&(r.value=_);const{detectCredential:P}=await w(async()=>{const{detectCredential:q}=await import("./credential-patterns-DqicUg9o.js");return{detectCredential:q}},[],import.meta.url),$=P(_);e&&m&&($?(m.textContent=`✅ Détecté : ${$.name} (${_.length} chars)`,e.style.display="block",e.style.background="rgba(34,204,119,0.1)",e.style.color="#22cc77"):(m.textContent=`⚠️ Format inconnu (${_.length} chars, début "${_.slice(0,15)}...")`,e.style.display="block",e.style.background="rgba(255,170,0,0.1)",e.style.color="#ffaa00")),d.success('Clé collée — vérifie + tap "Coller + ranger"'),v.medium()}catch(h){const _=h instanceof Error?h.message:"erreur";d.warn(`Permission presse-papiers refusée. Long press dans le textarea blanc → Coller. (${_})`)}}),r?.addEventListener("input",async()=>{const h=r.value.trim();if(!h||!e||!m){e&&(e.style.display="none");return}const{detectCredential:_}=await w(async()=>{const{detectCredential:$}=await import("./credential-patterns-DqicUg9o.js");return{detectCredential:$}},[],import.meta.url),P=_(h);P?(m.textContent=`✅ Détecté : ${P.name} (${h.length} chars)`,e.style.display="block",e.style.background="rgba(34,204,119,0.1)",e.style.color="#22cc77"):(m.textContent=`⚠️ Format inconnu (${h.length} chars)`,e.style.display="block",e.style.background="rgba(255,170,0,0.1)",e.style.color="#ffaa00")})},100)})};U("#ax-paste-key"),U("#ax-paste-key-nav"),t.addEventListener("click",n=>{const p=n.target.closest("[data-nav-route]");if(p){const o=p.dataset.navRoute;o&&(v.tap(),location.hash="#"+o)}}),t.addEventListener("click",n=>{const p=n.target.closest("[data-action]");if(!p)return;const o=p.getAttribute("data-action"),r=p.getAttribute("data-msg-id");if(!o||!r||o!=="speak"&&o!=="copy"&&o!=="export-pdf")return;const e=T.find(m=>m.id===r);if(e){if(o==="speak"){gt(p,e);return}if(o==="copy"){ft(e);return}if(o==="export-pdf"){ht(e);return}}}),t.querySelector("#ax-logout-nav")?.addEventListener("click",()=>{v.tap();const n=M.open({title:"Déconnexion ?",content:"<p>Tes données restent sauvegardées (Coffre, conversations, profil).</p>",actions:[{label:"Annuler",variant:"ghost",onClick:()=>n.close()},{label:"Déconnecter",variant:"danger",onClick:()=>{v.medium(),n.close(),w(()=>import("./auth-C103NZpt.js"),__vite__mapDeps([20,0,1,2,3,13,19]),import.meta.url).then(l=>{l.auth.logout(),d.info("Déconnecté"),location.hash="#landing"})}}]})}),T.length&&D(t),H.info("chat","Chat view rendered")}export{A as escapeHtml,st as handleLightboxAction,xt as isAutoReadEnabled,bt as maybeAutoReadAssistant,it as openImageLightbox,ct as pushTransformResult,yt as render,ot as renderImageAlbum,J as renderMarkdownLight,G as renderMessageActions,X as renderToolPills,zt as setAutoReadEnabled};
//# sourceMappingURL=index-D3y5rkDZ.js.map
