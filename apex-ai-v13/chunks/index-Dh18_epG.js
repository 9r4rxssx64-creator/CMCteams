const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-Duna9QEJ.js","./monitoring-WiO5ZBU9.js","./apex-tools-registry-DPQHcZUW.js","./credential-patterns-DqicUg9o.js","./smart-tools-suggester-2ae1dTNs.js","./toast-Dgg9rcIP.js","./haptic-BUEqXK0N.js","./cmc-planning-bridge-C0VQVebN.js","./file-converter-CYwJSg1O.js","./admin-prompt-ZLXrSv4A.js","./modal-sheet-Pqfkse7W.js","./ai-routing-policy-D3UY3_bD.js","./ai-router-ymlOUlXv.js","../core/main-DIkkpXt1.js","./chat-fallback-Btv6QKCT.js","./tokens-dashboard-C5ZzZyK6.js","./consumption-monitor-tmg98cBM.js","./links-registry-CKDh-eng.js","./push-notifications-BgYmJKn-.js","../assets/css/main-CjlSpvBL.css","./auth-8h8ANMds.js"])))=>i.map(i=>d[i]);
import{_ as w,v as Y}from"./apex-kb-Duna9QEJ.js";import{s as E,A as J,e as Q,m as X}from"../core/main-DIkkpXt1.js";import{l as V}from"./monitoring-WiO5ZBU9.js";import{aiRouter as O}from"./ai-router-ymlOUlXv.js";import{commerce as Z}from"./commerce-BfGNtXH9.js";import{h as y}from"./haptic-BUEqXK0N.js";import{modalSheet as z}from"./modal-sheet-Pqfkse7W.js";import{toast as p}from"./toast-Dgg9rcIP.js";import"./apex-tools-registry-DPQHcZUW.js";import"./credential-patterns-DqicUg9o.js";import"./apex-tools-dispatch-DsBmALAD.js";import"./chat-fallback-Btv6QKCT.js";import"./tokens-dashboard-C5ZzZyK6.js";const D=[],R=[];let q=!1;function _(t){return t.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]??a)}function tt(t){if(!Array.isArray(t)||t.length===0)return"";const a=t.length===1?1:t.length<=4?2:3,d=t.map((o,m)=>{const x=_(o.url),l=_(o.filename);return`<div class="ax-album-item" data-img-idx="${m}" style="aspect-ratio:1;background:#1a1a2e;border-radius:8px;overflow:hidden;position:relative;cursor:pointer;-webkit-tap-highlight-color:transparent"><img src="${x}" alt="${l}" loading="lazy" style="width:100%;height:100%;object-fit:cover;transition:transform 200ms cubic-bezier(0.16,1,0.3,1)"><div class="ax-album-overlay" style="position:absolute;bottom:0;left:0;right:0;padding:8px;background:linear-gradient(to top,rgba(0,0,0,0.85),transparent);color:#fff;font-size:11px;line-height:1.3;text-overflow:ellipsis;overflow:hidden;white-space:nowrap">${l}</div></div>`}).join("");return`<div class="ax-image-album" style="display:grid;grid-template-columns:repeat(${a},1fr);gap:8px;margin:12px 0;border-radius:12px">${d}</div>`}function et(t,a){const d=_(a.url),o=_(a.filename),m=document.createElement("div");m.className="ax-lightbox",m.setAttribute("role","dialog"),m.setAttribute("aria-modal","true"),m.setAttribute("aria-label","Visualisation image"),m.style.cssText="position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:env(safe-area-inset-top,20px) 16px env(safe-area-inset-bottom,20px) 16px";const x="min-height:44px;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(20,20,35,0.7);color:#fff;font-size:13px;cursor:pointer;-webkit-tap-highlight-color:transparent;font-weight:600;";m.innerHTML=`<button class="ax-lb-close" aria-label="Fermer" style="position:absolute;top:env(safe-area-inset-top,20px);right:16px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.1);border:none;color:#fff;font-size:20px;cursor:pointer;-webkit-tap-highlight-color:transparent;z-index:1">✕</button><img src="${d}" alt="${o}" style="max-width:100%;max-height:65vh;object-fit:contain;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.5)"><div class="ax-lb-filename" style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:12px;text-align:center">${o}</div><div class="ax-lb-actions" style="display:flex;gap:8px;margin-top:20px;flex-wrap:wrap;justify-content:center;max-width:680px"><button data-action="cartoon" style="${x}" title="Transformer en cartoon">🎨 Cartoon</button><button data-action="anime" style="${x}" title="Style anime">🤖 Anime</button><button data-action="video" style="${x}" title="Animer en vidéo">🎬 Animer vidéo</button><button data-action="remove-bg" style="${x}" title="Retirer le fond">✂️ Retirer fond</button><button data-action="stylize" style="${x}" title="Variation stylisée">🎭 Variations</button><button data-action="share" style="${x}" title="Partager">📤 Partager</button><button data-action="download" style="${x}" title="Télécharger">💾 Télécharger</button></div><div class="ax-lb-status" data-status style="margin-top:14px;color:#c9a227;font-size:12px;min-height:18px;text-align:center"></div>`,document.body.appendChild(m);const l=()=>{m.parentNode&&m.parentNode.removeChild(m)};m.querySelector(".ax-lb-close")?.addEventListener("click",l);const h=f=>{f.key==="Escape"&&(l(),document.removeEventListener("keydown",h))};document.addEventListener("keydown",h),m.addEventListener("click",f=>{f.target===m&&l()});const v=m.querySelector("[data-status]");return m.querySelectorAll("[data-action]").forEach(f=>{f.addEventListener("click",()=>{const k=f.dataset.action??"";at(t,a,k,v,l)})}),m}async function at(t,a,d,o,m){if(d==="share"){const l=navigator;if(l.share)try{await l.share({url:a.url,title:a.filename});return}catch{}try{await navigator.clipboard.writeText(a.url),p.success("Lien copié dans le presse-papiers")}catch{p.warn("Partage non supporté par ce navigateur")}return}if(d==="download"){try{const l=document.createElement("a");l.href=a.url,l.download=a.filename||"image",document.body.appendChild(l),l.click(),document.body.removeChild(l)}catch(l){p.error(l instanceof Error?l.message:"Téléchargement échoué")}return}if(["cartoon","anime","video","remove-bg","stylize"].includes(d)){o&&(o.textContent=`⏳ ${d} en cours… (Replicate)`);let l;if(d==="stylize"){const u=window.prompt('Style souhaité (ex: "huile sur toile renaissance") :');if(!u){o&&(o.textContent="");return}l=u}try{const{apexToolsDispatch:u}=await w(async()=>{const{apexToolsDispatch:k}=await import("./apex-tools-dispatch-DsBmALAD.js").then(C=>C.b);return{apexToolsDispatch:k}},__vite__mapDeps([0,1,2,3]),import.meta.url),h={url:a.url,type:d};l&&(h.prompt=l);const v=await u.execute("transform_image",h,"admin");if(!v.ok){const k=v.error??"transformation échouée";o&&(o.textContent=`❌ ${k}`),p.error(k);return}const f=v.result;if(!f.success||!f.outputUrl){const k=f.error??"aucun outputUrl";o&&(o.textContent=`❌ ${k}`);return}if(o){const k=f.cost_eur!==void 0&&f.cost_eur!==null?` (${f.cost_eur.toFixed(3)}€)`:"";o.textContent=`✅ Transformé${k}`}nt(t,f.outputUrl,d,a.filename),setTimeout(m,1500)}catch(u){const h=u instanceof Error?u.message:"erreur";o&&(o.textContent=`❌ ${h}`)}return}}function nt(t,a,d,o){const m=t.querySelector(".ax-chat-scroll");if(!m)return;const x=_(a),l=_(o),u=_(d),v=d==="video"||/\.(mp4|webm|mov)(\?|$)/i.test(a)?`<video src="${x}" controls autoplay loop playsinline style="max-width:100%;max-height:70vh;border-radius:12px;display:block">Ton navigateur ne supporte pas la vidéo HTML5.</video>`:`<img src="${x}" alt="${l} ${u}" style="max-width:100%;max-height:70vh;object-fit:contain;border-radius:12px;display:block">`,f=document.createElement("div");f.className="ax-msg ax-msg-assistant ax-slide-up-fade ax-transform-result",f.dataset.transformType=d,f.innerHTML=`<div class="ax-msg-body"><p style="margin:0 0 8px;color:#c9a227;font-size:12px;font-weight:600">${rt(d)} ${u} appliqué sur ${l}</p>`+v+`<div class="ax-transform-actions" style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap"><button data-tr-action="download" data-tr-url="${x}" style="min-height:36px;padding:6px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);background:rgba(20,20,35,0.7);color:#fff;font-size:12px;cursor:pointer">💾 Télécharger</button><button data-tr-action="share" data-tr-url="${x}" style="min-height:36px;padding:6px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);background:rgba(20,20,35,0.7);color:#fff;font-size:12px;cursor:pointer">📤 Partager</button></div></div>`,m.appendChild(f),m.scrollTo({top:m.scrollHeight,behavior:"smooth"}),f.querySelectorAll("[data-tr-action]").forEach(k=>{k.addEventListener("click",()=>{const C=k.dataset.trAction??"",L=k.dataset.trUrl??"";if(C==="download"){const $=document.createElement("a");$.href=L,$.download=`apex-${d}-${Date.now()}`,document.body.appendChild($),$.click(),document.body.removeChild($)}else if(C==="share"){const $=navigator;$.share?$.share({url:L}).catch(()=>{}):navigator.clipboard?.writeText(L)}})})}function rt(t){return{cartoon:"🎨",anime:"🤖",video:"🎬","remove-bg":"✂️",stylize:"🎭"}[t]??"🖼️"}function F(t){if(t.role!=="assistant"||t.streaming||!t.text||t.text.length===0)return"";const a="width:32px;height:32px;border-radius:50%;background:rgba(201,162,39,0.1);border:1px solid rgba(201,162,39,0.3);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:14px;color:var(--ax-gold);transition:all 200ms;opacity:0.7;-webkit-tap-highlight-color:transparent;padding:0;";return`<div class="ax-msg-actions" style="display:flex;gap:6px;margin-top:8px;justify-content:flex-end;flex-wrap:wrap"><button class="ax-msg-action" data-action="speak" data-msg-id="${_(t.id)}" style="${a}" title="Lire la réponse à voix haute" aria-label="Lire la réponse">🔊</button><button class="ax-msg-action" data-action="copy" data-msg-id="${_(t.id)}" style="${a}" title="Copier dans presse-papiers" aria-label="Copier le texte">📋</button><button class="ax-msg-action" data-action="export-pdf" data-msg-id="${_(t.id)}" style="${a}" title="Exporter en PDF" aria-label="Exporter PDF">📄</button></div>`}function H(t){let a=_(t);return a=a.replace(/```([\s\S]*?)```/g,(d,o)=>`<pre class="ax-code"><code>${o}</code></pre>`),a=a.replace(/`([^`\n]+)`/g,'<code class="ax-code-inline">$1</code>'),a=a.replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>"),a=a.replace(/\*([^*\n]+)\*/g,"<em>$1</em>"),a=a.replace(/\n/g,"<br>"),a}function ot(){const t=E.get("user");return X.buildSystemPromptContext(t)}async function it(t,a){try{const{apexToolsDispatch:d}=await w(async()=>{const{apexToolsDispatch:f}=await import("./apex-tools-dispatch-DsBmALAD.js").then(k=>k.b);return{apexToolsDispatch:f}},__vite__mapDeps([0,1,2,3]),import.meta.url),o=await d.execute("detect_intent",{text:t},"admin");if(!o.ok||!o.result)return;const m=o.result.intent,x=o.result.confidence??0;if(!m||m==="unknown"||x<.7)return;if(m==="open_url"||m==="open_browser"){const f=t.match(/(https?:\/\/[^\s]+)/i),k=t.match(/\b([a-z0-9-]+\.(com|fr|io|net|org|app|dev|ai|co))\b/i),C=f?.[1]??k?.[1]??"https://www.google.com";d.execute("open_url",{url:C},"admin");return}const{smartToolsSuggester:l}=await w(async()=>{const{smartToolsSuggester:f}=await import("./smart-tools-suggester-2ae1dTNs.js");return{smartToolsSuggester:f}},__vite__mapDeps([4,1,2]),import.meta.url),u=l.suggestForIntent(m);if(!u)return;const{toast:h}=await w(async()=>{const{toast:f}=await import("./toast-Dgg9rcIP.js");return{toast:f}},__vite__mapDeps([5,6]),import.meta.url);h.info(`${u.emoji} ${u.name} disponible — tape pour ouvrir`,{duration:5e3});const v=E.get("user");v?.id&&l.recordUsage(u.id,v.id),st(a,u)}catch(d){V.warn("chat","detectAndSuggestTool failed",{err:d})}}function st(t,a){const d=t.querySelector(".ax-chat-scroll");if(!d)return;const o=document.createElement("div");o.className="ax-msg ax-msg-tool ax-slide-up-fade",o.innerHTML=`
    <div class="ax-tool-card">
      <div class="ax-tool-icon">${a.emoji}</div>
      <div class="ax-tool-info">
        <strong>${_(a.name)}</strong>
        <p style="margin:4px 0 0;color:var(--ax-text-dim);font-size:13px">${_(a.description)}</p>
      </div>
      <button class="ax-btn ax-btn-primary ax-btn-sm" onclick="location.hash='${_(a.cta_target)}'">${_(a.cta_label)}</button>
    </div>
  `,d.appendChild(o),d.scrollTo({top:d.scrollHeight,behavior:"smooth"})}async function U(t){if(q||R.length===0)return;q=!0;const a=R.shift();if(a===void 0){q=!1;return}const d=E.get("user");if(!Z.consumeMessage(d?.id??null).allowed){ct(t,"Tu as atteint ta limite quotidienne. Passe en plan supérieur ou réessaie demain."),q=!1;return}it(a,t);const m={id:`u_${Date.now()}`,role:"user",text:a,ts:Date.now()};D.push(m);const x={id:`a_${Date.now()}`,role:"assistant",text:"",ts:Date.now(),streaming:!0};D.push(x),E.set("isStreaming",!0),I(t);const l=D.filter(u=>!u.streaming||u===x).slice(-30).filter(u=>u!==x).map(u=>({role:u.role,content:u.text}));await O.stream(l,ot(),u=>{if(u.type==="tool_use_start"&&u.toolName){x.toolPills||(x.toolPills=[]),x.toolPills.push({name:u.toolName,status:"running"}),M(t,x);return}if(u.type==="tool_use_done"){if(x.toolPills)for(const h of x.toolPills)h.status==="running"&&(h.status="done");x.toolBatchCount=(x.toolBatchCount??0)+(u.toolCount??0),M(t,x);return}u.text&&(x.text+=u.text,M(t,x)),u.done&&(delete x.streaming,E.set("isStreaming",!1),I(t),mt(x))},u=>{x.text=Q.toUserMessage(u)+" (Apex bascule sur le mode hors-ligne — réessaie dans un instant.)",delete x.streaming,E.set("isStreaming",!1),I(t)}),q=!1,R.length&&U(t)}function ct(t,a){D.push({id:`a_${Date.now()}`,role:"assistant",text:a,ts:Date.now()}),I(t)}const W="apex_v13_chat_auto_read";function lt(){try{return localStorage.getItem(W)==="1"}catch{return!1}}function Tt(t){try{localStorage.setItem(W,t?"1":"0")}catch{}}async function dt(t,a){if(y.tap(),t.classList.contains("ax-playing")){try{const{stopAll:d}=await w(async()=>{const{stopAll:o}=await import("./voice-C504Jd_V.js").then(m=>m.a);return{stopAll:o}},__vite__mapDeps([1,2]),import.meta.url);d()}catch{}t.classList.remove("ax-playing"),t.textContent="🔊";return}try{const{stopAll:d,speak:o,getActiveVoice:m}=await w(async()=>{const{stopAll:u,speak:h,getActiveVoice:v}=await import("./voice-C504Jd_V.js").then(f=>f.a);return{stopAll:u,speak:h,getActiveVoice:v}},__vite__mapDeps([1,2]),import.meta.url);d(),document.querySelectorAll(".ax-msg-action.ax-playing").forEach(u=>{u.classList.remove("ax-playing"),u.textContent="🔊"}),t.classList.add("ax-playing"),t.textContent="⏸";const x=m(),l=await o(a.text,x);l.ok||p.warn(`Lecture impossible : ${l.reason??"erreur"}`)}catch(d){const o=d instanceof Error?d.message:"erreur";p.warn(`Lecture vocale échouée : ${o}`)}finally{t.classList.remove("ax-playing"),t.textContent="🔊"}}async function ut(t){y.tap();try{if(!navigator.clipboard?.writeText){p.warn("Presse-papiers non supporté par ton navigateur");return}await navigator.clipboard.writeText(t.text),y.success(),p.success("Copié dans presse-papiers")}catch(a){const d=a instanceof Error?a.message:"erreur";p.warn(`Copie échouée : ${d}`)}}async function pt(t){y.tap();try{const d=await import("https://cdn.jsdelivr.net/npm/jspdf@2.5.2/+esm"),o=d.default,m=d.jsPDF??(typeof o=="function"?o:o?.jsPDF);if(typeof m!="function"){p.warn("Export PDF indisponible");return}const x=m,l=new x,u=l.internal.pageSize.getHeight(),h=l.splitTextToSize(t.text,180);let v=20;const f=7;for(const k of h)v>u-20&&(l.addPage(),v=20),l.text(k,15,v),v+=f;l.save(`apex-${Date.now()}.pdf`),y.success(),p.success("PDF téléchargé")}catch(a){const d=a instanceof Error?a.message:"erreur";p.warn(`Export PDF échoué : ${d}`)}}async function mt(t){if(!(t.role!=="assistant"||t.streaming)&&!(!t.text||t.text.length===0)&&lt())try{const{speak:a,getActiveVoice:d,stopAll:o}=await w(async()=>{const{speak:x,getActiveVoice:l,stopAll:u}=await import("./voice-C504Jd_V.js").then(h=>h.a);return{speak:x,getActiveVoice:l,stopAll:u}},__vite__mapDeps([1,2]),import.meta.url);o();const m=d();await a(t.text,m)}catch(a){V.warn("chat","auto-read failed",{err:a})}}function N(t){if(!t.toolPills||t.toolPills.length===0)return"";const a=t.toolPills.every(o=>o.status==="done"),d="padding:4px 8px;background:rgba(201,162,39,0.1);border-radius:8px;font-size:11px;color:var(--ax-gold);display:inline-block;margin:4px 4px 4px 0;";if(a){const o=t.toolBatchCount??t.toolPills.length,m=t.toolPills.map(x=>_(x.name)).join(", ");return`<details class="ax-tool-pills" style="margin:4px 0;"><summary style="${d}cursor:pointer;">▶ ${o} opération${o>1?"s":""}</summary><div style="font-size:11px;color:#888;padding:4px 8px;">${m}</div></details>`}return t.toolPills.map(o=>{const m=o.status==="running"?"🔧":"✅";return`<span class="ax-tool-pill" style="${d}">${m} ${_(o.name)}</span>`}).join("")}function M(t,a){const d=t.querySelector(`[data-msg-id="${a.id}"] .ax-msg-body`);if(d){d.innerHTML=N(a)+H(a.text)+(a.streaming?'<span class="ax-cursor">▌</span>':"")+F(a);const o=t.querySelector(".ax-chat-scroll");o&&o.scrollTo({top:o.scrollHeight,behavior:"smooth"})}else I(t)}function I(t){const a=t.querySelector(".ax-chat-scroll");if(!a)return;const d=D.map(o=>{let m="";o.streaming&&(o.text.length===0?m=`
            <span class="ax-typing" aria-label="Apex réfléchit">
              <span class="ax-typing-dot"></span>
              <span class="ax-typing-dot"></span>
              <span class="ax-typing-dot"></span>
            </span>
          `:m='<span class="ax-cursor">▌</span>');const x=N(o),l=F(o);return`
        <div class="ax-msg ax-msg-${o.role} ax-modernized-msg ax-slide-up-fade" data-msg-id="${o.id}">
          <div class="ax-msg-body">${x}${H(o.text)}${m}${l}</div>
        </div>
      `}).join("");a.innerHTML=d,a.scrollTo({top:a.scrollHeight,behavior:"smooth"})}function xt(t){const a=E.get("user"),d=a?`Bonjour ${a.name}, qu'est-ce que je peux faire pour toi ?`:"Bienvenue dans Apex.",o=E.get("isAdmin"),m=O.hasAnyKey();t.innerHTML=`
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
        ${m?"":`
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
      <footer style="text-align:center;padding:6px 6px calc(env(safe-area-inset-bottom,0px) + 6px);font-size:11px;color:var(--ax-text-muted);background:var(--ax-bg);flex-shrink:0">
        APEX AI ${J} — Créé par <strong style="color:var(--ax-gold)">DK</strong>
      </footer>
    </div>
  `;const x=t.querySelector("#ax-chat-form"),l=t.querySelector("#ax-chat-text");x&&l&&(x.addEventListener("submit",n=>{n.preventDefault();const s=l.value.trim();s&&(async()=>{const{detectAllCredentials:i}=await w(async()=>{const{detectAllCredentials:c}=await import("./credential-patterns-DqicUg9o.js");return{detectAllCredentials:c}},[],import.meta.url);if(i(s).length>0){l.value="",l.style.height="auto";const{vault:c}=await w(async()=>{const{vault:g}=await import("./apex-kb-Duna9QEJ.js").then(b=>b.b);return{vault:g}},__vite__mapDeps([0,1,2,3]),import.meta.url),e=await c.autoStoreBulk(s);if(e.stored.length>0){const g=e.stored.map(b=>b.pattern.name).join(", ");p.success(`🔑 ${e.stored.length} clé(s) chiffrée(s) AES-GCM-256 : ${g}`,{duration:6e3})}if(e.forbidden.length>0){const g=e.forbidden.map(b=>b.pattern.name).join(", ");p.error(`🚫 ${g} JAMAIS stocké (sécu Kevin)`,{duration:8e3})}e.failed>0&&e.stored.length===0&&p.warn(`⚠️ ${e.failed} format inconnu — ouvre 🔐 Coffre pour coller manuellement`,{duration:8e3});return}l.value="",l.style.height="auto",R.push(s),U(t),(async()=>{try{const{detectAndPushIfPlanning:c}=await w(async()=>{const{detectAndPushIfPlanning:g}=await import("./cmc-planning-bridge-C0VQVebN.js");return{detectAndPushIfPlanning:g}},__vite__mapDeps([7,0,1,2,3]),import.meta.url),e=await c(s,"chat");e&&e.push.ok&&e.push.id&&p.info(`📋 Planning détecté → envoyé à CMCteams (id: ${e.push.id})`,{duration:5e3})}catch{}})()})()}),l.addEventListener("input",()=>{l.style.height="auto",l.style.height=`${Math.min(l.scrollHeight,200)}px`}),l.addEventListener("keydown",n=>{n.key==="Enter"&&!n.shiftKey&&(n.preventDefault(),x.requestSubmit())}),l.addEventListener("paste",n=>{const s=n.clipboardData?.getData("text")?.trim()??"";s&&((async()=>{try{const{detectAndPushIfPlanning:i}=await w(async()=>{const{detectAndPushIfPlanning:c}=await import("./cmc-planning-bridge-C0VQVebN.js");return{detectAndPushIfPlanning:c}},__vite__mapDeps([7,0,1,2,3]),import.meta.url),r=await i(s,"paste");r&&r.push.ok&&r.push.id&&p.info(`📋 Planning détecté → envoyé à CMCteams (id: ${r.push.id})`,{duration:5e3})}catch{}})(),(async()=>{const{detectAllCredentials:i}=await w(async()=>{const{detectAllCredentials:g}=await import("./credential-patterns-DqicUg9o.js");return{detectAllCredentials:g}},[],import.meta.url);if(i(s).length===0)return;l.value="";const{vault:c}=await w(async()=>{const{vault:g}=await import("./apex-kb-Duna9QEJ.js").then(b=>b.b);return{vault:g}},__vite__mapDeps([0,1,2,3]),import.meta.url),e=await c.autoStoreBulk(s);if(e.stored.length>0){const g=e.stored.map(b=>b.pattern.name).join(", ");p.success(`🔑 ${e.stored.length} clé(s) chiffrée(s) auto AES-GCM-256 : ${g}`,{duration:6e3})}if(e.forbidden.length>0){const g=e.forbidden.map(b=>b.pattern.name).join(", ");p.error(`🚫 ${g} JAMAIS stocké (règle sécu)`,{duration:8e3})}e.failed>0&&e.stored.length===0&&p.warn("Format inconnu — ouvre 🔐 Coffre pour coller manuellement",{duration:6e3})})())}));const u=t.querySelector("#ax-chat-mic");let h=null,v=!1;u?.addEventListener("click",()=>{y.tap();const n=window.SpeechRecognition??window.webkitSpeechRecognition;if(!n){p.warn("Dictée vocale non supportée par ton navigateur");return}if(v&&h){h.stop(),v=!1,u.style.background="";return}try{if(h=new n,!h)return;h.continuous=!1,h.interimResults=!0,h.lang="fr-FR";let s="",i=null;const r=1500;h.onresult=c=>{const e=c;let g="",b=!1;for(let P=e.resultIndex;P<e.results.length;P++){const S=e.results[P];S?.[0]&&(g+=S[0].transcript,S.isFinal&&(b=!0))}const A=t.querySelector("#ax-chat-text");A&&(A.value=g),b&&(s=g,i&&clearTimeout(i),i=setTimeout(()=>{if(s.trim().length>0&&v){try{h?.stop()}catch{}t.querySelector("#ax-chat-form")?.requestSubmit()}},r))},h.onend=()=>{v=!1,u&&(u.style.background=""),i&&(clearTimeout(i),i=null);const c=t.querySelector("#ax-chat-text");s.trim().length>0&&c&&c.value.trim()===s.trim()&&t.querySelector("#ax-chat-form")?.requestSubmit()},h.onerror=c=>{const e=c;p.warn(`Dictée erreur : ${e.error??"inconnu"}`),v=!1,u&&(u.style.background="")},h.start(),v=!0,u.style.background="linear-gradient(135deg,#ff4444,#cc2222)",y.medium(),p.success("🎙 Parle maintenant — re-tap 🎙 pour arrêter")}catch(s){const i=s instanceof Error?s.message:"erreur";p.warn(`Dictée fail : ${i}`)}});const f=t.querySelector("#ax-chat-wake");f?.addEventListener("click",()=>{y.tap(),(async()=>{try{const{voicePrint:n}=await w(async()=>{const{voicePrint:i}=await import("./voice-C504Jd_V.js").then(r=>r.v);return{voicePrint:i}},__vite__mapDeps([1,2]),import.meta.url);if(!n.isSupported()){p.warn("Wake word non supporté par ton navigateur");return}if(n.isListening()){n.stopWakeWord(),f&&(f.style.background=""),p.success("Wake word arrêté");return}const s=n.startWakeWord(i=>{const r=t.querySelector("#ax-chat-text");r&&(r.value=i,t.querySelector("#ax-chat-form")?.requestSubmit())});s.ok&&f?(f.style.background="linear-gradient(135deg,#22cc77,#1a9a5a)",p.success('👂 "Dis Apex" actif — parle quand tu veux')):p.warn(`Wake word fail : ${s.reason??"inconnu"}`)}catch(n){const s=n instanceof Error?n.message:"erreur";p.warn(`Wake word erreur : ${s}`)}})()});const k=t.querySelector("#ax-chat-attach"),C=t.querySelector("#ax-chat-file-input"),L=t.querySelector("#ax-chat-attachments");k?.addEventListener("click",()=>{y.tap(),C?.click()});const $=n=>{if(!L)return;L.style.display="block";const s=(n.size/1024/1024).toFixed(2),i=n.type.startsWith("image/")?"🖼️":n.type.startsWith("video/")?"🎬":n.type.startsWith("audio/")?"🎵":n.type.includes("pdf")?"📄":n.type.includes("zip")||n.type.includes("rar")||n.type.includes("7z")?"📦":"📎",r=document.createElement("div");r.style.cssText="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:rgba(201,162,39,0.1);border:1px solid rgba(201,162,39,0.3);border-radius:6px;margin-right:6px;font-size:12px;color:#c9a227",r.textContent=`${i} ${n.name.slice(0,30)}${n.name.length>30?"...":""} (${s} MB)`,L.appendChild(r)},G=n=>{const s=t.querySelector(".ax-chat-scroll");if(!s||n.length===0)return;const i=document.createElement("div");i.className="ax-msg ax-msg-user ax-slide-up-fade",i.innerHTML=`<div class="ax-msg-body">${tt(n)}</div>`,s.appendChild(i),s.scrollTo({top:s.scrollHeight,behavior:"smooth"}),i.querySelectorAll(".ax-album-item").forEach(r=>{r.addEventListener("click",()=>{const c=r.dataset.imgIdx??"0",e=parseInt(c,10),g=n[e];g&&et(t,g)})})};C?.addEventListener("change",()=>{const n=Array.from(C.files??[]);if(n.length===0)return;y.success();const s=[];for(const i of n){if($(i),i.type.startsWith("image/"))try{const r=URL.createObjectURL(i);s.push({url:r,filename:i.name})}catch{}(async()=>{try{const{fileConverter:r}=await w(async()=>{const{fileConverter:e}=await import("./file-converter-CYwJSg1O.js");return{fileConverter:e}},__vite__mapDeps([8,1,2]),import.meta.url),c=await r.ingest(i,"admin");c.ok?p.success(`✅ ${i.name} ingéré`):p.warn(`Ingest fail : ${c.reason??i.name}`)}catch(r){const c=r instanceof Error?r.message:"erreur";p.warn(`File error : ${c}`)}})()}s.length>0&&G(s),C.value=""});const T=t.querySelector(".ax-chat-body, #ax-chat-form");T&&(T.addEventListener("dragover",n=>{n.preventDefault(),T.style.background="rgba(201,162,39,0.1)"}),T.addEventListener("dragleave",()=>{T.style.background=""}),T.addEventListener("drop",n=>{n.preventDefault(),T.style.background="";const i=Array.from(n.dataTransfer?.files??[]);for(const r of i)$(r),(async()=>{try{const{fileConverter:c}=await w(async()=>{const{fileConverter:e}=await import("./file-converter-CYwJSg1O.js");return{fileConverter:e}},__vite__mapDeps([8,1,2]),import.meta.url);await c.ingest(r,"admin"),p.success(`📎 ${r.name} ajouté`)}catch{}})()})),t.querySelector("#ax-chat-text")?.addEventListener("paste",n=>{const s=n.clipboardData?.items??[];for(let i=0;i<s.length;i++){const r=s[i];if(r&&r.kind==="file"){const c=r.getAsFile();c&&($(c),(async()=>{try{const{fileConverter:e}=await w(async()=>{const{fileConverter:g}=await import("./file-converter-CYwJSg1O.js");return{fileConverter:g}},__vite__mapDeps([8,1,2]),import.meta.url);await e.ingest(c,"admin"),p.success(`📋 ${c.name||"media collé"} ajouté`)}catch{}})())}}}),t.querySelector("#ax-chat-camera")?.addEventListener("click",()=>{y.tap(),(async()=>{try{const{smartCamera:n}=await w(async()=>{const{smartCamera:r}=await import("./smart-camera-Big1kwzd.js");return{smartCamera:r}},__vite__mapDeps([1,2]),import.meta.url),{adminPrompt:s}=await w(async()=>{const{adminPrompt:r}=await import("./admin-prompt-ZLXrSv4A.js");return{adminPrompt:r}},__vite__mapDeps([9,6,10,5,2,1,0,3]),import.meta.url),i=await s.askChoice("📷 Caméra","Choisis le mode :",[{id:"single",label:"Photo simple",emoji:"📷",variant:"primary"},{id:"burst",label:"Rafale (5 photos)",emoji:"⚡",variant:"ghost"},{id:"qr_live",label:"Scanner QR/Code-barre",emoji:"⬛",variant:"ghost"},{id:"video_record",label:"Enregistrer vidéo (30s)",emoji:"🎬",variant:"ghost"}]);if(!i)return;if(i==="single"){const r=await n.captureSingle();if(!r.ok){p.error(r.reason??"Capture échouée");return}const c=r.dataUrls?.[0];if(c){const e=t.querySelector(".ax-chat-scroll");if(e){const g=document.createElement("div");g.className="ax-msg ax-msg-user ax-slide-up-fade";const b=document.createElement("img");b.alt="Capture caméra",b.style.maxWidth="100%",b.style.borderRadius="8px",(typeof c=="string"&&/^data:image\/[a-z+]+;base64,/i.test(c)||typeof c=="string"&&/^https?:/.test(c))&&(b.src=c),g.appendChild(b),e.appendChild(g),e.scrollTo({top:e.scrollHeight,behavior:"smooth"})}p.success("Photo capturée")}}else if(i==="burst"){const r=await n.captureBurst(5,200);p.info(r.ok?`${r.count} photos capturées`:r.reason??"Échec")}else if(i==="qr_live")await n.scanQrLive(r=>{for(const c of r)p.success(`📦 ${c.format}: ${c.rawValue.slice(0,80)}`)},{durationMs:15e3});else if(i==="video_record"){const r=await n.startVideoRecord(3e4);if(!r.ok){p.error(r.reason??"Recording impossible");return}p.info("🔴 Enregistrement 30s..."),setTimeout(()=>{n.stopVideoRecord().then(c=>{c.ok&&p.success(`Vidéo ${Math.round((c.blob?.size??0)/1024)}KB`)})},3e4)}}catch(n){p.error(n instanceof Error?n.message:"Erreur caméra")}})()}),t.querySelector("#ax-chat-menu")?.addEventListener("click",()=>{y.tap();const n=E.get("isAdmin"),s=z.open({title:"☰ Menu",content:`
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
      `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>s.close()}]});setTimeout(()=>{document.querySelectorAll("[data-menu-nav]").forEach(i=>{i.addEventListener("click",()=>{const r=i.dataset.menuNav??"";y.tap(),s.close(),r&&(location.hash=`#${r}`)})}),document.querySelectorAll("[data-menu-action]").forEach(i=>{i.addEventListener("click",()=>{const r=i.dataset.menuAction??"";y.tap(),s.close(),r==="paste-key"?t.querySelector("#ax-paste-key-nav")?.click():r==="logout"&&t.querySelector("#ax-logout-nav")?.click()})})},50)});const j=t.querySelector("#ax-chat-settings");j||t.addEventListener("click",n=>{n.target.closest("#ax-chat-settings")&&(location.hash="#settings")}),j?.addEventListener("click",()=>{y.tap(),(async()=>{try{const{aiRoutingPolicy:n}=await w(async()=>{const{aiRoutingPolicy:e}=await import("./ai-routing-policy-D3UY3_bD.js");return{aiRoutingPolicy:e}},__vite__mapDeps([11,1,12,0,2,3,13,14,15,16,17,18,19]),import.meta.url),s=n.getStatus(),i=n.recommendActions(),r=i.length?i.map(e=>`
              <li style="margin:4px 0">
                <span style="color:${e.priority==="high"?"#ff6666":e.priority==="medium"?"#ffaa00":"#a0a4c0"}">●</span>
                ${_(e.action)}
                ${e.url?` <a href="${_(e.url)}" target="_blank" rel="noopener" style="color:#c9a227">→</a>`:""}
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
          `,actions:[{label:"Fermer",variant:"ghost",onClick:()=>c.close()}]});setTimeout(()=>{const e=document.getElementById("ax-settings-mode");e?.addEventListener("change",()=>{const b=e.value;n.setMode(b),p.success(`Mode routing : ${b}`),y.medium()}),document.getElementById("ax-settings-paste-key")?.addEventListener("click",()=>{c.close(),t.querySelector("#ax-paste-key-nav")?.click()})},50)}catch(n){const s=n instanceof Error?n.message:"erreur";p.error(`Paramètres indisponibles : ${s}`)}})()});const B=n=>{t.querySelector(n)?.addEventListener("click",()=>{y.tap();const i=z.open({title:"🔑 Coller ta clé API",content:`
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
        `,actions:[{label:"Annuler",variant:"ghost",onClick:()=>{y.tap(),i.close()}},{label:"Coller + ranger",variant:"primary",onClick:()=>{const c=document.getElementById("ax-paste-input")?.value.trim()??"";if(!c){p.warn('⚠️ Textarea vide — utilise "📋 Coller automatiquement" ou long press dans le rectangle blanc');return}i.close(),(async()=>{const e=await Y.autoStore(c);if(e.forbidden){y.error(),p.error(`${e.pattern?.name} : Apex ne stocke jamais ce type de donnée pour ta sécurité.`,{duration:6e3});return}if(!e.ok){y.warning(),p.warn("Format non reconnu : "+(e.reason??"inconnu")+` (taille ${c.length} chars, début: "${c.slice(0,12)}...")`,{duration:8e3});return}y.success();const g=e.valid===!0?" ✅ validée":e.valid===!1?" ⚠️ ping échoué":"";p.success(`${e.pattern?.name} rangée${g}`),xt(t)})()}}]});setTimeout(()=>{const r=document.getElementById("ax-paste-clipboard-btn"),c=document.getElementById("ax-paste-input"),e=document.getElementById("ax-paste-preview"),g=document.getElementById("ax-paste-detection");r?.addEventListener("click",async()=>{y.tap();try{if(!navigator.clipboard?.readText){p.warn("Clipboard API non supportée. Long press dans le textarea → Coller manuellement.");return}const A=(await navigator.clipboard.readText()).trim();if(!A){p.warn("Presse-papiers vide. Copie d'abord ta clé puis tap ce bouton.");return}c&&(c.value=A);const{detectCredential:P}=await w(async()=>{const{detectCredential:K}=await import("./credential-patterns-DqicUg9o.js");return{detectCredential:K}},[],import.meta.url),S=P(A);e&&g&&(S?(g.textContent=`✅ Détecté : ${S.name} (${A.length} chars)`,e.style.display="block",e.style.background="rgba(34,204,119,0.1)",e.style.color="#22cc77"):(g.textContent=`⚠️ Format inconnu (${A.length} chars, début "${A.slice(0,15)}...")`,e.style.display="block",e.style.background="rgba(255,170,0,0.1)",e.style.color="#ffaa00")),p.success('Clé collée — vérifie + tap "Coller + ranger"'),y.medium()}catch(b){const A=b instanceof Error?b.message:"erreur";p.warn(`Permission presse-papiers refusée. Long press dans le textarea blanc → Coller. (${A})`)}}),c?.addEventListener("input",async()=>{const b=c.value.trim();if(!b||!e||!g){e&&(e.style.display="none");return}const{detectCredential:A}=await w(async()=>{const{detectCredential:S}=await import("./credential-patterns-DqicUg9o.js");return{detectCredential:S}},[],import.meta.url),P=A(b);P?(g.textContent=`✅ Détecté : ${P.name} (${b.length} chars)`,e.style.display="block",e.style.background="rgba(34,204,119,0.1)",e.style.color="#22cc77"):(g.textContent=`⚠️ Format inconnu (${b.length} chars)`,e.style.display="block",e.style.background="rgba(255,170,0,0.1)",e.style.color="#ffaa00")})},100)})};B("#ax-paste-key"),B("#ax-paste-key-nav"),t.addEventListener("click",n=>{const i=n.target.closest("[data-nav-route]");if(i){const r=i.dataset.navRoute;r&&(y.tap(),location.hash="#"+r)}}),t.addEventListener("click",n=>{const i=n.target.closest("[data-action]");if(!i)return;const r=i.getAttribute("data-action"),c=i.getAttribute("data-msg-id");if(!r||!c||r!=="speak"&&r!=="copy"&&r!=="export-pdf")return;const e=D.find(g=>g.id===c);if(e){if(r==="speak"){dt(i,e);return}if(r==="copy"){ut(e);return}if(r==="export-pdf"){pt(e);return}}}),t.querySelector("#ax-logout-nav")?.addEventListener("click",()=>{y.tap();const n=z.open({title:"Déconnexion ?",content:"<p>Tes données restent sauvegardées (Coffre, conversations, profil).</p>",actions:[{label:"Annuler",variant:"ghost",onClick:()=>n.close()},{label:"Déconnecter",variant:"danger",onClick:()=>{y.medium(),n.close(),w(()=>import("./auth-8h8ANMds.js"),__vite__mapDeps([20,0,1,2,3,13,19]),import.meta.url).then(s=>{s.auth.logout(),p.info("Déconnecté"),location.hash="#landing"})}}]})}),D.length&&I(t),V.info("chat","Chat view rendered")}export{_ as escapeHtml,at as handleLightboxAction,lt as isAutoReadEnabled,mt as maybeAutoReadAssistant,et as openImageLightbox,nt as pushTransformResult,xt as render,tt as renderImageAlbum,H as renderMarkdownLight,F as renderMessageActions,N as renderToolPills,Tt as setAutoReadEnabled};
//# sourceMappingURL=index-Dh18_epG.js.map
