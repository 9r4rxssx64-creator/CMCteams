const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-D4Mc3m80.js","./monitoring-B17vNBOa.js","./apex-tools-registry-DloDnFZi.js","./credential-patterns-BybElwOv.js","./smart-tools-suggester-DStQAaaW.js","./toast-Dgg9rcIP.js","./haptic-BUEqXK0N.js","./file-converter-C4bAF1pZ.js","./admin-prompt-DK70NFHm.js","./modal-sheet-Pqfkse7W.js","./ai-routing-policy-Cexax9OY.js","./ai-router-BMk87Fy2.js","../core/main-CPmwu7dM.js","./chat-fallback-BTgk9lp3.js","./tokens-dashboard-C5ZzZyK6.js","./consumption-monitor-38BWvPD9.js","./links-registry-Ce8s55Ef.js","./push-notifications-C67SspxH.js","../assets/css/main-rhfGvOFL.css","./auth-CT9-pFQt.js"])))=>i.map(i=>d[i]);
import{_ as k,v as Y}from"./apex-kb-D4Mc3m80.js";import{s as P,e as J,m as Q}from"../core/main-CPmwu7dM.js";import{l as j}from"./monitoring-B17vNBOa.js";import{aiRouter as O}from"./ai-router-BMk87Fy2.js";import{commerce as X}from"./commerce-CkggByiB.js";import{h as y}from"./haptic-BUEqXK0N.js";import{modalSheet as z}from"./modal-sheet-Pqfkse7W.js";import{toast as m}from"./toast-Dgg9rcIP.js";import"./apex-tools-registry-DloDnFZi.js";import"./credential-patterns-BybElwOv.js";import"./apex-tools-dispatch-BDZxzUZ0.js";import"./chat-fallback-BTgk9lp3.js";import"./tokens-dashboard-C5ZzZyK6.js";const D=[],R=[];let q=!1;function _(t){return t.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function Z(t){if(!Array.isArray(t)||t.length===0)return"";const e=t.length===1?1:t.length<=4?2:3,d=t.map((o,p)=>{const x=_(o.url),l=_(o.filename);return`<div class="ax-album-item" data-img-idx="${p}" style="aspect-ratio:1;background:#1a1a2e;border-radius:8px;overflow:hidden;position:relative;cursor:pointer;-webkit-tap-highlight-color:transparent"><img src="${x}" alt="${l}" loading="lazy" style="width:100%;height:100%;object-fit:cover;transition:transform 200ms cubic-bezier(0.16,1,0.3,1)"><div class="ax-album-overlay" style="position:absolute;bottom:0;left:0;right:0;padding:8px;background:linear-gradient(to top,rgba(0,0,0,0.85),transparent);color:#fff;font-size:11px;line-height:1.3;text-overflow:ellipsis;overflow:hidden;white-space:nowrap">${l}</div></div>`}).join("");return`<div class="ax-image-album" style="display:grid;grid-template-columns:repeat(${e},1fr);gap:8px;margin:12px 0;border-radius:12px">${d}</div>`}function tt(t,e){const d=_(e.url),o=_(e.filename),p=document.createElement("div");p.className="ax-lightbox",p.setAttribute("role","dialog"),p.setAttribute("aria-modal","true"),p.setAttribute("aria-label","Visualisation image"),p.style.cssText="position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:env(safe-area-inset-top,20px) 16px env(safe-area-inset-bottom,20px) 16px";const x="min-height:44px;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(20,20,35,0.7);color:#fff;font-size:13px;cursor:pointer;-webkit-tap-highlight-color:transparent;font-weight:600;";p.innerHTML=`<button class="ax-lb-close" aria-label="Fermer" style="position:absolute;top:env(safe-area-inset-top,20px);right:16px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.1);border:none;color:#fff;font-size:20px;cursor:pointer;-webkit-tap-highlight-color:transparent;z-index:1">✕</button><img src="${d}" alt="${o}" style="max-width:100%;max-height:65vh;object-fit:contain;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.5)"><div class="ax-lb-filename" style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:12px;text-align:center">${o}</div><div class="ax-lb-actions" style="display:flex;gap:8px;margin-top:20px;flex-wrap:wrap;justify-content:center;max-width:680px"><button data-action="cartoon" style="${x}" title="Transformer en cartoon">🎨 Cartoon</button><button data-action="anime" style="${x}" title="Style anime">🤖 Anime</button><button data-action="video" style="${x}" title="Animer en vidéo">🎬 Animer vidéo</button><button data-action="remove-bg" style="${x}" title="Retirer le fond">✂️ Retirer fond</button><button data-action="stylize" style="${x}" title="Variation stylisée">🎭 Variations</button><button data-action="share" style="${x}" title="Partager">📤 Partager</button><button data-action="download" style="${x}" title="Télécharger">💾 Télécharger</button></div><div class="ax-lb-status" data-status style="margin-top:14px;color:#c9a227;font-size:12px;min-height:18px;text-align:center"></div>`,document.body.appendChild(p);const l=()=>{p.parentNode&&p.parentNode.removeChild(p)};p.querySelector(".ax-lb-close")?.addEventListener("click",l);const h=g=>{g.key==="Escape"&&(l(),document.removeEventListener("keydown",h))};document.addEventListener("keydown",h),p.addEventListener("click",g=>{g.target===p&&l()});const v=p.querySelector("[data-status]");return p.querySelectorAll("[data-action]").forEach(g=>{g.addEventListener("click",()=>{const w=g.dataset.action??"";et(t,e,w,v,l)})}),p}async function et(t,e,d,o,p){if(d==="share"){const l=navigator;if(l.share)try{await l.share({url:e.url,title:e.filename});return}catch{}try{await navigator.clipboard.writeText(e.url),m.success("Lien copié dans le presse-papiers")}catch{m.warn("Partage non supporté par ce navigateur")}return}if(d==="download"){try{const l=document.createElement("a");l.href=e.url,l.download=e.filename||"image",document.body.appendChild(l),l.click(),document.body.removeChild(l)}catch(l){m.error(l instanceof Error?l.message:"Téléchargement échoué")}return}if(["cartoon","anime","video","remove-bg","stylize"].includes(d)){o&&(o.textContent=`⏳ ${d} en cours… (Replicate)`);let l;if(d==="stylize"){const u=window.prompt('Style souhaité (ex: "huile sur toile renaissance") :');if(!u){o&&(o.textContent="");return}l=u}try{const{apexToolsDispatch:u}=await k(async()=>{const{apexToolsDispatch:w}=await import("./apex-tools-dispatch-BDZxzUZ0.js").then(C=>C.b);return{apexToolsDispatch:w}},__vite__mapDeps([0,1,2,3]),import.meta.url),h={url:e.url,type:d};l&&(h.prompt=l);const v=await u.execute("transform_image",h,"admin");if(!v.ok){const w=v.error??"transformation échouée";o&&(o.textContent=`❌ ${w}`),m.error(w);return}const g=v.result;if(!g.success||!g.outputUrl){const w=g.error??"aucun outputUrl";o&&(o.textContent=`❌ ${w}`);return}if(o){const w=g.cost_eur!==void 0&&g.cost_eur!==null?` (${g.cost_eur.toFixed(3)}€)`:"";o.textContent=`✅ Transformé${w}`}at(t,g.outputUrl,d,e.filename),setTimeout(p,1500)}catch(u){const h=u instanceof Error?u.message:"erreur";o&&(o.textContent=`❌ ${h}`)}return}}function at(t,e,d,o){const p=t.querySelector(".ax-chat-scroll");if(!p)return;const x=_(e),l=_(o),u=_(d),v=d==="video"||/\.(mp4|webm|mov)(\?|$)/i.test(e)?`<video src="${x}" controls autoplay loop playsinline style="max-width:100%;max-height:70vh;border-radius:12px;display:block">Ton navigateur ne supporte pas la vidéo HTML5.</video>`:`<img src="${x}" alt="${l} ${u}" style="max-width:100%;max-height:70vh;object-fit:contain;border-radius:12px;display:block">`,g=document.createElement("div");g.className="ax-msg ax-msg-assistant ax-slide-up-fade ax-transform-result",g.dataset.transformType=d,g.innerHTML=`<div class="ax-msg-body"><p style="margin:0 0 8px;color:#c9a227;font-size:12px;font-weight:600">${nt(d)} ${u} appliqué sur ${l}</p>`+v+`<div class="ax-transform-actions" style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap"><button data-tr-action="download" data-tr-url="${x}" style="min-height:36px;padding:6px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);background:rgba(20,20,35,0.7);color:#fff;font-size:12px;cursor:pointer">💾 Télécharger</button><button data-tr-action="share" data-tr-url="${x}" style="min-height:36px;padding:6px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);background:rgba(20,20,35,0.7);color:#fff;font-size:12px;cursor:pointer">📤 Partager</button></div></div>`,p.appendChild(g),p.scrollTo({top:p.scrollHeight,behavior:"smooth"}),g.querySelectorAll("[data-tr-action]").forEach(w=>{w.addEventListener("click",()=>{const C=w.dataset.trAction??"",L=w.dataset.trUrl??"";if(C==="download"){const A=document.createElement("a");A.href=L,A.download=`apex-${d}-${Date.now()}`,document.body.appendChild(A),A.click(),document.body.removeChild(A)}else if(C==="share"){const A=navigator;A.share?A.share({url:L}).catch(()=>{}):navigator.clipboard?.writeText(L)}})})}function nt(t){return{cartoon:"🎨",anime:"🤖",video:"🎬","remove-bg":"✂️",stylize:"🎭"}[t]??"🖼️"}function F(t){if(t.role!=="assistant"||t.streaming||!t.text||t.text.length===0)return"";const e="width:32px;height:32px;border-radius:50%;background:rgba(201,162,39,0.1);border:1px solid rgba(201,162,39,0.3);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:14px;color:var(--ax-gold);transition:all 200ms;opacity:0.7;-webkit-tap-highlight-color:transparent;padding:0;";return`<div class="ax-msg-actions" style="display:flex;gap:6px;margin-top:8px;justify-content:flex-end;flex-wrap:wrap"><button class="ax-msg-action" data-action="speak" data-msg-id="${_(t.id)}" style="${e}" title="Lire la réponse à voix haute" aria-label="Lire la réponse">🔊</button><button class="ax-msg-action" data-action="copy" data-msg-id="${_(t.id)}" style="${e}" title="Copier dans presse-papiers" aria-label="Copier le texte">📋</button><button class="ax-msg-action" data-action="export-pdf" data-msg-id="${_(t.id)}" style="${e}" title="Exporter en PDF" aria-label="Exporter PDF">📄</button></div>`}function H(t){let e=_(t);return e=e.replace(/```([\s\S]*?)```/g,(d,o)=>`<pre class="ax-code"><code>${o}</code></pre>`),e=e.replace(/`([^`\n]+)`/g,'<code class="ax-code-inline">$1</code>'),e=e.replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>"),e=e.replace(/\*([^*\n]+)\*/g,"<em>$1</em>"),e=e.replace(/\n/g,"<br>"),e}function rt(){const t=P.get("user");return Q.buildSystemPromptContext(t)}async function ot(t,e){try{const{apexToolsDispatch:d}=await k(async()=>{const{apexToolsDispatch:g}=await import("./apex-tools-dispatch-BDZxzUZ0.js").then(w=>w.b);return{apexToolsDispatch:g}},__vite__mapDeps([0,1,2,3]),import.meta.url),o=await d.execute("detect_intent",{text:t},"admin");if(!o.ok||!o.result)return;const p=o.result.intent,x=o.result.confidence??0;if(!p||p==="unknown"||x<.7)return;if(p==="open_url"||p==="open_browser"){const g=t.match(/(https?:\/\/[^\s]+)/i),w=t.match(/\b([a-z0-9-]+\.(com|fr|io|net|org|app|dev|ai|co))\b/i),C=g?.[1]??w?.[1]??"https://www.google.com";d.execute("open_url",{url:C},"admin");return}const{smartToolsSuggester:l}=await k(async()=>{const{smartToolsSuggester:g}=await import("./smart-tools-suggester-DStQAaaW.js");return{smartToolsSuggester:g}},__vite__mapDeps([4,1,2]),import.meta.url),u=l.suggestForIntent(p);if(!u)return;const{toast:h}=await k(async()=>{const{toast:g}=await import("./toast-Dgg9rcIP.js");return{toast:g}},__vite__mapDeps([5,6]),import.meta.url);h.info(`${u.emoji} ${u.name} disponible — tape pour ouvrir`,{duration:5e3});const v=P.get("user");v?.id&&l.recordUsage(u.id,v.id),it(e,u)}catch(d){j.warn("chat","detectAndSuggestTool failed",{err:d})}}function it(t,e){const d=t.querySelector(".ax-chat-scroll");if(!d)return;const o=document.createElement("div");o.className="ax-msg ax-msg-tool ax-slide-up-fade",o.innerHTML=`
    <div class="ax-tool-card">
      <div class="ax-tool-icon">${e.emoji}</div>
      <div class="ax-tool-info">
        <strong>${_(e.name)}</strong>
        <p style="margin:4px 0 0;color:var(--ax-text-dim);font-size:13px">${_(e.description)}</p>
      </div>
      <button class="ax-btn ax-btn-primary ax-btn-sm" onclick="location.hash='${_(e.cta_target)}'">${_(e.cta_label)}</button>
    </div>
  `,d.appendChild(o),d.scrollTo({top:d.scrollHeight,behavior:"smooth"})}async function U(t){if(q||R.length===0)return;q=!0;const e=R.shift();if(e===void 0){q=!1;return}const d=P.get("user");if(!X.consumeMessage(d?.id??null).allowed){st(t,"Tu as atteint ta limite quotidienne. Passe en plan supérieur ou réessaie demain."),q=!1;return}ot(e,t);const p={id:`u_${Date.now()}`,role:"user",text:e,ts:Date.now()};D.push(p);const x={id:`a_${Date.now()}`,role:"assistant",text:"",ts:Date.now(),streaming:!0};D.push(x),P.set("isStreaming",!0),I(t);const l=D.filter(u=>!u.streaming||u===x).slice(-30).filter(u=>u!==x).map(u=>({role:u.role,content:u.text}));await O.stream(l,rt(),u=>{if(u.type==="tool_use_start"&&u.toolName){x.toolPills||(x.toolPills=[]),x.toolPills.push({name:u.toolName,status:"running"}),M(t,x);return}if(u.type==="tool_use_done"){if(x.toolPills)for(const h of x.toolPills)h.status==="running"&&(h.status="done");x.toolBatchCount=(x.toolBatchCount??0)+(u.toolCount??0),M(t,x);return}u.text&&(x.text+=u.text,M(t,x)),u.done&&(delete x.streaming,P.set("isStreaming",!1),I(t),pt(x))},u=>{x.text=J.toUserMessage(u)+" (Apex bascule sur le mode hors-ligne — réessaie dans un instant.)",delete x.streaming,P.set("isStreaming",!1),I(t)}),q=!1,R.length&&U(t)}function st(t,e){D.push({id:`a_${Date.now()}`,role:"assistant",text:e,ts:Date.now()}),I(t)}const W="apex_v13_chat_auto_read";function ct(){try{return localStorage.getItem(W)==="1"}catch{return!1}}function Lt(t){try{localStorage.setItem(W,t?"1":"0")}catch{}}async function lt(t,e){if(y.tap(),t.classList.contains("ax-playing")){try{const{stopAll:d}=await k(async()=>{const{stopAll:o}=await import("./voice-Dr7NkkAT.js").then(p=>p.a);return{stopAll:o}},__vite__mapDeps([1,2]),import.meta.url);d()}catch{}t.classList.remove("ax-playing"),t.textContent="🔊";return}try{const{stopAll:d,speak:o,getActiveVoice:p}=await k(async()=>{const{stopAll:u,speak:h,getActiveVoice:v}=await import("./voice-Dr7NkkAT.js").then(g=>g.a);return{stopAll:u,speak:h,getActiveVoice:v}},__vite__mapDeps([1,2]),import.meta.url);d(),document.querySelectorAll(".ax-msg-action.ax-playing").forEach(u=>{u.classList.remove("ax-playing"),u.textContent="🔊"}),t.classList.add("ax-playing"),t.textContent="⏸";const x=p(),l=await o(e.text,x);l.ok||m.warn(`Lecture impossible : ${l.reason??"erreur"}`)}catch(d){const o=d instanceof Error?d.message:"erreur";m.warn(`Lecture vocale échouée : ${o}`)}finally{t.classList.remove("ax-playing"),t.textContent="🔊"}}async function dt(t){y.tap();try{if(!navigator.clipboard?.writeText){m.warn("Presse-papiers non supporté par ton navigateur");return}await navigator.clipboard.writeText(t.text),y.success(),m.success("Copié dans presse-papiers")}catch(e){const d=e instanceof Error?e.message:"erreur";m.warn(`Copie échouée : ${d}`)}}async function ut(t){y.tap();try{const d=await import("https://cdn.jsdelivr.net/npm/jspdf@2.5.2/+esm"),o=d.default,p=d.jsPDF??(typeof o=="function"?o:o?.jsPDF);if(typeof p!="function"){m.warn("Export PDF indisponible");return}const x=p,l=new x,u=l.internal.pageSize.getHeight(),h=l.splitTextToSize(t.text,180);let v=20;const g=7;for(const w of h)v>u-20&&(l.addPage(),v=20),l.text(w,15,v),v+=g;l.save(`apex-${Date.now()}.pdf`),y.success(),m.success("PDF téléchargé")}catch(e){const d=e instanceof Error?e.message:"erreur";m.warn(`Export PDF échoué : ${d}`)}}async function pt(t){if(!(t.role!=="assistant"||t.streaming)&&!(!t.text||t.text.length===0)&&ct())try{const{speak:e,getActiveVoice:d,stopAll:o}=await k(async()=>{const{speak:x,getActiveVoice:l,stopAll:u}=await import("./voice-Dr7NkkAT.js").then(h=>h.a);return{speak:x,getActiveVoice:l,stopAll:u}},__vite__mapDeps([1,2]),import.meta.url);o();const p=d();await e(t.text,p)}catch(e){j.warn("chat","auto-read failed",{err:e})}}function N(t){if(!t.toolPills||t.toolPills.length===0)return"";const e=t.toolPills.every(o=>o.status==="done"),d="padding:4px 8px;background:rgba(201,162,39,0.1);border-radius:8px;font-size:11px;color:var(--ax-gold);display:inline-block;margin:4px 4px 4px 0;";if(e){const o=t.toolBatchCount??t.toolPills.length,p=t.toolPills.map(x=>_(x.name)).join(", ");return`<details class="ax-tool-pills" style="margin:4px 0;"><summary style="${d}cursor:pointer;">▶ ${o} opération${o>1?"s":""}</summary><div style="font-size:11px;color:#888;padding:4px 8px;">${p}</div></details>`}return t.toolPills.map(o=>{const p=o.status==="running"?"🔧":"✅";return`<span class="ax-tool-pill" style="${d}">${p} ${_(o.name)}</span>`}).join("")}function M(t,e){const d=t.querySelector(`[data-msg-id="${e.id}"] .ax-msg-body`);if(d){d.innerHTML=N(e)+H(e.text)+(e.streaming?'<span class="ax-cursor">▌</span>':"")+F(e);const o=t.querySelector(".ax-chat-scroll");o&&o.scrollTo({top:o.scrollHeight,behavior:"smooth"})}else I(t)}function I(t){const e=t.querySelector(".ax-chat-scroll");if(!e)return;const d=D.map(o=>{let p="";o.streaming&&(o.text.length===0?p=`
            <span class="ax-typing" aria-label="Apex réfléchit">
              <span class="ax-typing-dot"></span>
              <span class="ax-typing-dot"></span>
              <span class="ax-typing-dot"></span>
            </span>
          `:p='<span class="ax-cursor">▌</span>');const x=N(o),l=F(o);return`
        <div class="ax-msg ax-msg-${o.role} ax-modernized-msg ax-slide-up-fade" data-msg-id="${o.id}">
          <div class="ax-msg-body">${x}${H(o.text)}${p}${l}</div>
        </div>
      `}).join("");e.innerHTML=d,e.scrollTo({top:e.scrollHeight,behavior:"smooth"})}function mt(t){const e=P.get("user"),d=e?`Bonjour ${e.name}, qu'est-ce que je peux faire pour toi ?`:"Bienvenue dans Apex.",o=P.get("isAdmin"),p=O.hasAnyKey();t.innerHTML=`
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
        <div class="ax-chat-greeting">${_(d)}</div>
        ${p?"":`
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
        ${o?'<button class="ax-btn ax-btn-sm" data-nav-route="admin" style="white-space:nowrap;min-height:44px;padding:8px 14px">⚙️ Admin</button>':""}
        <button class="ax-btn ax-btn-sm" data-nav-route="vault" style="white-space:nowrap;min-height:44px;padding:8px 14px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;font-weight:700">🔐 Coffre</button>
        <button class="ax-btn ax-btn-sm" data-nav-route="settings" style="white-space:nowrap;min-height:44px;padding:8px 14px">🔧 Réglages</button>
        <button class="ax-btn ax-btn-sm" id="ax-paste-key-nav" style="white-space:nowrap;min-height:44px;padding:8px 14px">🔑 Clé API</button>
        <button class="ax-btn ax-btn-sm" id="ax-logout-nav" style="white-space:nowrap;min-height:44px;padding:8px 14px;color:#ff6666">🚪 Déconnexion</button>
      </nav>
      <footer style="text-align:center;padding:6px;font-size:11px;color:var(--ax-text-muted);background:var(--ax-bg)">
        APEX AI v13.0 — Créé par <strong style="color:var(--ax-gold)">DK</strong>
      </footer>
    </div>
  `;const x=t.querySelector("#ax-chat-form"),l=t.querySelector("#ax-chat-text");x&&l&&(x.addEventListener("submit",n=>{n.preventDefault();const s=l.value.trim();s&&(async()=>{const{detectAllCredentials:i}=await k(async()=>{const{detectAllCredentials:c}=await import("./credential-patterns-BybElwOv.js");return{detectAllCredentials:c}},[],import.meta.url);if(i(s).length>0){l.value="",l.style.height="auto";const{vault:c}=await k(async()=>{const{vault:f}=await import("./apex-kb-D4Mc3m80.js").then(b=>b.b);return{vault:f}},__vite__mapDeps([0,1,2,3]),import.meta.url),a=await c.autoStoreBulk(s);if(a.stored.length>0){const f=a.stored.map(b=>b.pattern.name).join(", ");m.success(`🔑 ${a.stored.length} clé(s) chiffrée(s) AES-GCM-256 : ${f}`,{duration:6e3})}if(a.forbidden.length>0){const f=a.forbidden.map(b=>b.pattern.name).join(", ");m.error(`🚫 ${f} JAMAIS stocké (sécu Kevin)`,{duration:8e3})}a.failed>0&&a.stored.length===0&&m.warn(`⚠️ ${a.failed} format inconnu — ouvre 🔐 Coffre pour coller manuellement`,{duration:8e3});return}l.value="",l.style.height="auto",R.push(s),U(t)})()}),l.addEventListener("input",()=>{l.style.height="auto",l.style.height=`${Math.min(l.scrollHeight,200)}px`}),l.addEventListener("keydown",n=>{n.key==="Enter"&&!n.shiftKey&&(n.preventDefault(),x.requestSubmit())}),l.addEventListener("paste",n=>{const s=n.clipboardData?.getData("text")?.trim()??"";s&&(async()=>{const{detectAllCredentials:i}=await k(async()=>{const{detectAllCredentials:c}=await import("./credential-patterns-BybElwOv.js");return{detectAllCredentials:c}},[],import.meta.url);if(i(s).length>0){n.preventDefault(),l.value="";const{vault:c}=await k(async()=>{const{vault:f}=await import("./apex-kb-D4Mc3m80.js").then(b=>b.b);return{vault:f}},__vite__mapDeps([0,1,2,3]),import.meta.url),a=await c.autoStoreBulk(s);if(a.stored.length>0){const f=a.stored.map(b=>b.pattern.name).join(", ");m.success(`🔑 ${a.stored.length} clé(s) chiffrée(s) auto AES-GCM-256 : ${f}`,{duration:6e3})}if(a.forbidden.length>0){const f=a.forbidden.map(b=>b.pattern.name).join(", ");m.error(`🚫 ${f} JAMAIS stocké (règle sécu)`,{duration:8e3})}a.failed>0&&a.stored.length===0&&m.warn("Format inconnu — ouvre 🔐 Coffre pour coller manuellement",{duration:6e3})}})()}));const u=t.querySelector("#ax-chat-mic");let h=null,v=!1;u?.addEventListener("click",()=>{y.tap();const n=window.SpeechRecognition??window.webkitSpeechRecognition;if(!n){m.warn("Dictée vocale non supportée par ton navigateur");return}if(v&&h){h.stop(),v=!1,u.style.background="";return}try{if(h=new n,!h)return;h.continuous=!1,h.interimResults=!0,h.lang="fr-FR";let s="",i=null;const r=1500;h.onresult=c=>{const a=c;let f="",b=!1;for(let S=a.resultIndex;S<a.results.length;S++){const E=a.results[S];E?.[0]&&(f+=E[0].transcript,E.isFinal&&(b=!0))}const $=t.querySelector("#ax-chat-text");$&&($.value=f),b&&(s=f,i&&clearTimeout(i),i=setTimeout(()=>{if(s.trim().length>0&&v){try{h?.stop()}catch{}t.querySelector("#ax-chat-form")?.requestSubmit()}},r))},h.onend=()=>{v=!1,u&&(u.style.background=""),i&&(clearTimeout(i),i=null);const c=t.querySelector("#ax-chat-text");s.trim().length>0&&c&&c.value.trim()===s.trim()&&t.querySelector("#ax-chat-form")?.requestSubmit()},h.onerror=c=>{const a=c;m.warn(`Dictée erreur : ${a.error??"inconnu"}`),v=!1,u&&(u.style.background="")},h.start(),v=!0,u.style.background="linear-gradient(135deg,#ff4444,#cc2222)",y.medium(),m.success("🎙 Parle maintenant — re-tap 🎙 pour arrêter")}catch(s){const i=s instanceof Error?s.message:"erreur";m.warn(`Dictée fail : ${i}`)}});const g=t.querySelector("#ax-chat-wake");g?.addEventListener("click",()=>{y.tap(),(async()=>{try{const{voicePrint:n}=await k(async()=>{const{voicePrint:i}=await import("./voice-Dr7NkkAT.js").then(r=>r.v);return{voicePrint:i}},__vite__mapDeps([1,2]),import.meta.url);if(!n.isSupported()){m.warn("Wake word non supporté par ton navigateur");return}if(n.isListening()){n.stopWakeWord(),g&&(g.style.background=""),m.success("Wake word arrêté");return}const s=n.startWakeWord(i=>{const r=t.querySelector("#ax-chat-text");r&&(r.value=i,t.querySelector("#ax-chat-form")?.requestSubmit())});s.ok&&g?(g.style.background="linear-gradient(135deg,#22cc77,#1a9a5a)",m.success('👂 "Dis Apex" actif — parle quand tu veux')):m.warn(`Wake word fail : ${s.reason??"inconnu"}`)}catch(n){const s=n instanceof Error?n.message:"erreur";m.warn(`Wake word erreur : ${s}`)}})()});const w=t.querySelector("#ax-chat-attach"),C=t.querySelector("#ax-chat-file-input"),L=t.querySelector("#ax-chat-attachments");w?.addEventListener("click",()=>{y.tap(),C?.click()});const A=n=>{if(!L)return;L.style.display="block";const s=(n.size/1024/1024).toFixed(2),i=n.type.startsWith("image/")?"🖼️":n.type.startsWith("video/")?"🎬":n.type.startsWith("audio/")?"🎵":n.type.includes("pdf")?"📄":n.type.includes("zip")||n.type.includes("rar")||n.type.includes("7z")?"📦":"📎",r=document.createElement("div");r.style.cssText="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:rgba(201,162,39,0.1);border:1px solid rgba(201,162,39,0.3);border-radius:6px;margin-right:6px;font-size:12px;color:#c9a227",r.textContent=`${i} ${n.name.slice(0,30)}${n.name.length>30?"...":""} (${s} MB)`,L.appendChild(r)},G=n=>{const s=t.querySelector(".ax-chat-scroll");if(!s||n.length===0)return;const i=document.createElement("div");i.className="ax-msg ax-msg-user ax-slide-up-fade",i.innerHTML=`<div class="ax-msg-body">${Z(n)}</div>`,s.appendChild(i),s.scrollTo({top:s.scrollHeight,behavior:"smooth"}),i.querySelectorAll(".ax-album-item").forEach(r=>{r.addEventListener("click",()=>{const c=r.dataset.imgIdx??"0",a=parseInt(c,10),f=n[a];f&&tt(t,f)})})};C?.addEventListener("change",()=>{const n=Array.from(C.files??[]);if(n.length===0)return;y.success();const s=[];for(const i of n){if(A(i),i.type.startsWith("image/"))try{const r=URL.createObjectURL(i);s.push({url:r,filename:i.name})}catch{}(async()=>{try{const{fileConverter:r}=await k(async()=>{const{fileConverter:a}=await import("./file-converter-C4bAF1pZ.js");return{fileConverter:a}},__vite__mapDeps([7,1,2]),import.meta.url),c=await r.ingest(i,"admin");c.ok?m.success(`✅ ${i.name} ingéré`):m.warn(`Ingest fail : ${c.reason??i.name}`)}catch(r){const c=r instanceof Error?r.message:"erreur";m.warn(`File error : ${c}`)}})()}s.length>0&&G(s),C.value=""});const T=t.querySelector(".ax-chat-body, #ax-chat-form");T&&(T.addEventListener("dragover",n=>{n.preventDefault(),T.style.background="rgba(201,162,39,0.1)"}),T.addEventListener("dragleave",()=>{T.style.background=""}),T.addEventListener("drop",n=>{n.preventDefault(),T.style.background="";const i=Array.from(n.dataTransfer?.files??[]);for(const r of i)A(r),(async()=>{try{const{fileConverter:c}=await k(async()=>{const{fileConverter:a}=await import("./file-converter-C4bAF1pZ.js");return{fileConverter:a}},__vite__mapDeps([7,1,2]),import.meta.url);await c.ingest(r,"admin"),m.success(`📎 ${r.name} ajouté`)}catch{}})()})),t.querySelector("#ax-chat-text")?.addEventListener("paste",n=>{const s=n.clipboardData?.items??[];for(let i=0;i<s.length;i++){const r=s[i];if(r&&r.kind==="file"){const c=r.getAsFile();c&&(A(c),(async()=>{try{const{fileConverter:a}=await k(async()=>{const{fileConverter:f}=await import("./file-converter-C4bAF1pZ.js");return{fileConverter:f}},__vite__mapDeps([7,1,2]),import.meta.url);await a.ingest(c,"admin"),m.success(`📋 ${c.name||"media collé"} ajouté`)}catch{}})())}}}),t.querySelector("#ax-chat-camera")?.addEventListener("click",()=>{y.tap(),(async()=>{try{const{smartCamera:n}=await k(async()=>{const{smartCamera:r}=await import("./smart-camera-D_59mrUx.js");return{smartCamera:r}},__vite__mapDeps([1,2]),import.meta.url),{adminPrompt:s}=await k(async()=>{const{adminPrompt:r}=await import("./admin-prompt-DK70NFHm.js");return{adminPrompt:r}},__vite__mapDeps([8,6,9,5,2,1,0,3]),import.meta.url),i=await s.askChoice("📷 Caméra","Choisis le mode :",[{id:"single",label:"Photo simple",emoji:"📷",variant:"primary"},{id:"burst",label:"Rafale (5 photos)",emoji:"⚡",variant:"ghost"},{id:"qr_live",label:"Scanner QR/Code-barre",emoji:"⬛",variant:"ghost"},{id:"video_record",label:"Enregistrer vidéo (30s)",emoji:"🎬",variant:"ghost"}]);if(!i)return;if(i==="single"){const r=await n.captureSingle();if(!r.ok){m.error(r.reason??"Capture échouée");return}const c=r.dataUrls?.[0];if(c){const a=t.querySelector(".ax-chat-scroll");if(a){const f=document.createElement("div");f.className="ax-msg ax-msg-user ax-slide-up-fade";const b=document.createElement("img");b.alt="Capture caméra",b.style.maxWidth="100%",b.style.borderRadius="8px",(typeof c=="string"&&/^data:image\/[a-z+]+;base64,/i.test(c)||typeof c=="string"&&/^https?:/.test(c))&&(b.src=c),f.appendChild(b),a.appendChild(f),a.scrollTo({top:a.scrollHeight,behavior:"smooth"})}m.success("Photo capturée")}}else if(i==="burst"){const r=await n.captureBurst(5,200);m.info(r.ok?`${r.count} photos capturées`:r.reason??"Échec")}else if(i==="qr_live")await n.scanQrLive(r=>{for(const c of r)m.success(`📦 ${c.format}: ${c.rawValue.slice(0,80)}`)},{durationMs:15e3});else if(i==="video_record"){const r=await n.startVideoRecord(3e4);if(!r.ok){m.error(r.reason??"Recording impossible");return}m.info("🔴 Enregistrement 30s..."),setTimeout(()=>{n.stopVideoRecord().then(c=>{c.ok&&m.success(`Vidéo ${Math.round((c.blob?.size??0)/1024)}KB`)})},3e4)}}catch(n){m.error(n instanceof Error?n.message:"Erreur caméra")}})()}),t.querySelector("#ax-chat-menu")?.addEventListener("click",()=>{y.tap();const n=P.get("isAdmin"),s=z.open({title:"☰ Menu",content:`
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
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>s.close()}]});setTimeout(()=>{document.querySelectorAll("[data-menu-nav]").forEach(i=>{i.addEventListener("click",()=>{const r=i.dataset.menuNav??"";y.tap(),s.close(),r&&(location.hash=`#${r}`)})}),document.querySelectorAll("[data-menu-action]").forEach(i=>{i.addEventListener("click",()=>{const r=i.dataset.menuAction??"";y.tap(),s.close(),r==="paste-key"?t.querySelector("#ax-paste-key-nav")?.click():r==="logout"&&t.querySelector("#ax-logout-nav")?.click()})})},50)});const B=t.querySelector("#ax-chat-settings");B||t.addEventListener("click",n=>{n.target.closest("#ax-chat-settings")&&(location.hash="#settings")}),B?.addEventListener("click",()=>{y.tap(),(async()=>{try{const{aiRoutingPolicy:n}=await k(async()=>{const{aiRoutingPolicy:a}=await import("./ai-routing-policy-Cexax9OY.js");return{aiRoutingPolicy:a}},__vite__mapDeps([10,1,11,0,2,3,12,13,14,15,16,17,18]),import.meta.url),s=n.getStatus(),i=n.recommendActions(),r=i.length?i.map(a=>`
              <li style="margin:4px 0">
                <span style="color:${a.priority==="high"?"#ff6666":a.priority==="medium"?"#ffaa00":"#a0a4c0"}">●</span>
                ${_(a.action)}
                ${a.url?` <a href="${_(a.url)}" target="_blank" rel="noopener" style="color:#c9a227">→</a>`:""}
              </li>
            `).join(""):'<li style="color:#22cc77">✅ Tout est configuré au mieux</li>',c=z.open({title:"⚙️ Paramètres",content:`
            <div style="display:flex;flex-direction:column;gap:14px">
              <div>
                <h4 style="margin:0 0 6px;color:#c9a227">Routing IA</h4>
                <label style="display:block;margin:6px 0">
                  Mode :
                  <select id="ax-settings-mode" style="margin-left:8px;padding:6px;background:#1a1a2e;color:#fff;border:1px solid #c9a227;border-radius:4px">
                    <option value="auto" ${s.mode==="auto"?"selected":""}>Auto (intelligent)</option>
                    <option value="economy" ${s.mode==="economy"?"selected":""}>Économie (gratuit d'abord)</option>
                    <option value="premium" ${s.mode==="premium"?"selected":""}>Premium (Anthropic toujours)</option>
                  </select>
                </label>
                <p style="margin:6px 0;color:#a0a4c0;font-size:12px">
                  Anthropic : <span style="color:${s.anthropic_health==="ok"?"#22cc77":s.anthropic_health==="warn"?"#ffaa00":"#ff6666"}">${s.anthropic_health}</span>
                  · Gratuits dispo : ${s.free_providers_available.length}
                  · Payants dispo : ${s.paid_providers_available.length}
                </p>
              </div>
              <div>
                <h4 style="margin:0 0 6px;color:#c9a227">Clés API</h4>
                <button type="button" class="ax-btn ax-btn-primary" id="ax-settings-paste-key" style="width:100%">🔑 Coller une clé API</button>
              </div>
              <div>
                <h4 style="margin:0 0 6px;color:#c9a227">Recommandations</h4>
                <ul style="margin:0;padding-left:18px;font-size:13px">${r}</ul>
              </div>
            </div>
          `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>c.close()}]});setTimeout(()=>{const a=document.getElementById("ax-settings-mode");a?.addEventListener("change",()=>{const b=a.value;n.setMode(b),m.success(`Mode routing : ${b}`),y.medium()}),document.getElementById("ax-settings-paste-key")?.addEventListener("click",()=>{c.close(),t.querySelector("#ax-paste-key-nav")?.click()})},50)}catch(n){const s=n instanceof Error?n.message:"erreur";m.error(`Paramètres indisponibles : ${s}`)}})()});const V=n=>{t.querySelector(n)?.addEventListener("click",()=>{y.tap();const i=z.open({title:"🔑 Coller ta clé API",content:`
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
        `,actions:[{label:"Annuler",variant:"ghost",onClick:()=>{y.tap(),i.close()}},{label:"Coller + ranger",variant:"primary",onClick:()=>{const c=document.getElementById("ax-paste-input")?.value.trim()??"";if(!c){m.warn('⚠️ Textarea vide — utilise "📋 Coller automatiquement" ou long press dans le rectangle blanc');return}i.close(),(async()=>{const a=await Y.autoStore(c);if(a.forbidden){y.error(),m.error(`${a.pattern?.name} : Apex ne stocke jamais ce type de donnée pour ta sécurité.`,{duration:6e3});return}if(!a.ok){y.warning(),m.warn("Format non reconnu : "+(a.reason??"inconnu")+` (taille ${c.length} chars, début: "${c.slice(0,12)}...")`,{duration:8e3});return}y.success();const f=a.valid===!0?" ✅ validée":a.valid===!1?" ⚠️ ping échoué":"";m.success(`${a.pattern?.name} rangée${f}`),mt(t)})()}}]});setTimeout(()=>{const r=document.getElementById("ax-paste-clipboard-btn"),c=document.getElementById("ax-paste-input"),a=document.getElementById("ax-paste-preview"),f=document.getElementById("ax-paste-detection");r?.addEventListener("click",async()=>{y.tap();try{if(!navigator.clipboard?.readText){m.warn("Clipboard API non supportée. Long press dans le textarea → Coller manuellement.");return}const $=(await navigator.clipboard.readText()).trim();if(!$){m.warn("Presse-papiers vide. Copie d'abord ta clé puis tap ce bouton.");return}c&&(c.value=$);const{detectCredential:S}=await k(async()=>{const{detectCredential:K}=await import("./credential-patterns-BybElwOv.js");return{detectCredential:K}},[],import.meta.url),E=S($);a&&f&&(E?(f.textContent=`✅ Détecté : ${E.name} (${$.length} chars)`,a.style.display="block",a.style.background="rgba(34,204,119,0.1)",a.style.color="#22cc77"):(f.textContent=`⚠️ Format inconnu (${$.length} chars, début "${$.slice(0,15)}...")`,a.style.display="block",a.style.background="rgba(255,170,0,0.1)",a.style.color="#ffaa00")),m.success('Clé collée — vérifie + tap "Coller + ranger"'),y.medium()}catch(b){const $=b instanceof Error?b.message:"erreur";m.warn(`Permission presse-papiers refusée. Long press dans le textarea blanc → Coller. (${$})`)}}),c?.addEventListener("input",async()=>{const b=c.value.trim();if(!b||!a||!f){a&&(a.style.display="none");return}const{detectCredential:$}=await k(async()=>{const{detectCredential:E}=await import("./credential-patterns-BybElwOv.js");return{detectCredential:E}},[],import.meta.url),S=$(b);S?(f.textContent=`✅ Détecté : ${S.name} (${b.length} chars)`,a.style.display="block",a.style.background="rgba(34,204,119,0.1)",a.style.color="#22cc77"):(f.textContent=`⚠️ Format inconnu (${b.length} chars)`,a.style.display="block",a.style.background="rgba(255,170,0,0.1)",a.style.color="#ffaa00")})},100)})};V("#ax-paste-key"),V("#ax-paste-key-nav"),t.addEventListener("click",n=>{const i=n.target.closest("[data-nav-route]");if(i){const r=i.dataset.navRoute;r&&(y.tap(),location.hash="#"+r)}}),t.addEventListener("click",n=>{const i=n.target.closest("[data-action]");if(!i)return;const r=i.getAttribute("data-action"),c=i.getAttribute("data-msg-id");if(!r||!c||r!=="speak"&&r!=="copy"&&r!=="export-pdf")return;const a=D.find(f=>f.id===c);if(a){if(r==="speak"){lt(i,a);return}if(r==="copy"){dt(a);return}if(r==="export-pdf"){ut(a);return}}}),t.querySelector("#ax-logout-nav")?.addEventListener("click",()=>{y.tap();const n=z.open({title:"Déconnexion ?",content:"<p>Tes données restent sauvegardées (Coffre, conversations, profil).</p>",actions:[{label:"Annuler",variant:"ghost",onClick:()=>n.close()},{label:"Déconnecter",variant:"danger",onClick:()=>{y.medium(),n.close(),k(()=>import("./auth-CT9-pFQt.js"),__vite__mapDeps([19,0,1,2,3,12,18]),import.meta.url).then(s=>{s.auth.logout(),m.info("Déconnecté"),location.hash="#landing"})}}]})}),D.length&&I(t),j.info("chat","Chat view rendered")}export{_ as escapeHtml,et as handleLightboxAction,ct as isAutoReadEnabled,pt as maybeAutoReadAssistant,tt as openImageLightbox,at as pushTransformResult,mt as render,Z as renderImageAlbum,H as renderMarkdownLight,F as renderMessageActions,N as renderToolPills,Lt as setAutoReadEnabled};
//# sourceMappingURL=index-BTuUQgkE.js.map
