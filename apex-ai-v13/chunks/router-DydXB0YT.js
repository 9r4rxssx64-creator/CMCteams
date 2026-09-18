import{e as c}from"./errors-gtCQHpGH.js";import{e as p}from"./multi-source-analyze-i0SrWIqV.js";import{l as n,c as l}from"./monitoring-CdKapu3A.js";function x(){if(typeof document>"u"||document.getElementById("ax-skeleton-styles"))return;const e=document.createElement("style");e.id="ax-skeleton-styles",e.textContent=`
    .ax-skel-shimmer {
      background: linear-gradient(90deg,
        rgba(255, 255, 255, 0.04) 0%,
        rgba(255, 255, 255, 0.10) 50%,
        rgba(255, 255, 255, 0.04) 100%);
      background-size: 200% 100%;
      animation: axSkelShimmer 1.4s ease-in-out infinite;
      border-radius: 6px;
    }
    @keyframes axSkelShimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .ax-skel-host {
      width: 100%;
      display: block;
    }
    .ax-skel-chat-msg {
      display: flex;
      gap: 12px;
      padding: 12px;
      align-items: flex-start;
    }
    .ax-skel-chat-msg__avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      flex: 0 0 auto;
    }
    .ax-skel-chat-msg__body { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .ax-skel-chat-msg__line { height: 12px; }
    .ax-skel-feat-list {
      display: flex; flex-direction: column; gap: 8px; padding: 8px;
    }
    .ax-skel-feat-list__item { height: 48px; }
    .ax-skel-vault-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px; padding: 12px;
    }
    .ax-skel-vault-cards__card { height: 96px; }
    .ax-skel-studio-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px; padding: 12px;
    }
    .ax-skel-studio-grid__tile { height: 120px; }
    .ax-skel-admin-table {
      display: flex; flex-direction: column; gap: 4px; padding: 8px;
    }
    .ax-skel-admin-table__row { height: 36px; }
    @media (prefers-reduced-motion: reduce) {
      .ax-skel-shimmer { animation: none; opacity: 0.45; }
    }
  `,document.head.appendChild(e)}function g(a,e){return a?(x(),a.innerHTML=f(e),a.classList.add("ax-skel-host"),a.setAttribute("aria-busy","true"),a.setAttribute("data-ax-skeleton",e),()=>{a.getAttribute("data-ax-skeleton")===e&&(a.classList.remove("ax-skel-host"),a.removeAttribute("aria-busy"),a.removeAttribute("data-ax-skeleton"),a.querySelector("[data-ax-skel-marker]")&&(a.innerHTML=""))}):()=>{}}function f(a){switch(a){case"chat-message":return Array.from({length:3},()=>`
        <div class="ax-skel-chat-msg" data-ax-skel-marker>
          <div class="ax-skel-chat-msg__avatar ax-skel-shimmer"></div>
          <div class="ax-skel-chat-msg__body">
            <div class="ax-skel-chat-msg__line ax-skel-shimmer" style="width:35%"></div>
            <div class="ax-skel-chat-msg__line ax-skel-shimmer" style="width:88%"></div>
            <div class="ax-skel-chat-msg__line ax-skel-shimmer" style="width:62%"></div>
          </div>
        </div>
      `).join("");case"feature-list":return`<div class="ax-skel-feat-list" data-ax-skel-marker>${Array.from({length:6},()=>'<div class="ax-skel-feat-list__item ax-skel-shimmer"></div>').join("")}</div>`;case"vault-cards":return`<div class="ax-skel-vault-cards" data-ax-skel-marker>${Array.from({length:6},()=>'<div class="ax-skel-vault-cards__card ax-skel-shimmer"></div>').join("")}</div>`;case"studio-grid":return`<div class="ax-skel-studio-grid" data-ax-skel-marker>${Array.from({length:8},()=>'<div class="ax-skel-studio-grid__tile ax-skel-shimmer"></div>').join("")}</div>`;case"admin-table":return`<div class="ax-skel-admin-table" data-ax-skel-marker>${Array.from({length:8},()=>'<div class="ax-skel-admin-table__row ax-skel-shimmer"></div>').join("")}</div>`;default:return""}}class k{routes=new Map;currentRoute="";rootEl=null;initialized=!1;duplicates=[];register(e,t){this.routes.has(e)&&this.duplicates.push(e),this.routes.set(e,t)}getDuplicateRoutes(){return[...new Set(this.duplicates)]}getRouteCount(){return this.routes.size}init(){this.initialized||(this.initialized=!0,this.rootEl=document.getElementById("apex-root"),window.addEventListener("hashchange",()=>void this.dispatch()))}navigate(e){if(location.hash===`#${e}`){this.dispatch();return}location.hash=`#${e}`}async dispatch(){if(!this.rootEl){n.warn("router","dispatch called before init");return}const e=location.hash.replace(/^#\/?/,"")||this.defaultRoute(),t=this.routes.get(e);if(!t){n.warn("router",`Unknown route: ${e} → fallback`),this.renderNotFound(e);return}const d=l.get("user")!==null,o=l.get("isAdmin");if(t.requiresAuth&&!d){this.navigate("login");return}if(t.requiresAdmin&&!o){this.renderForbidden();return}const r=this.currentRoute;this.currentRoute=e,p.emit("route:change",{from:r,to:e}),l.set("view",e);const u=r===e&&r!==""?window.scrollY:0;let h=null;try{t.skeleton&&(h=g(this.rootEl,t.skeleton)),await(await t.loader()).render(this.rootEl),queueMicrotask(()=>{try{window.scrollTo({top:u,left:0,behavior:"instant"})}catch{window.scrollTo(0,u)}})}catch(i){const m=i instanceof Error?i.message:String(i);if(/import.*module.*script|failed.*fetch.*dynamically.*imported|Loading.*chunk.*failed|Failed.*to.*fetch.*dynamically.*imported.*module/i.test(m)){n.warn("router",`Module load failed for ${e}, retry in 800ms`,{errMsg:m}),await new Promise(s=>setTimeout(s,800));try{await(await t.loader()).render(this.rootEl),n.info("router",`Module load retry success for ${e}`);return}catch(s){n.warn("router",`Module load retry failed for ${e}`,{err2:s}),c.capture(s,{source:"manual"}),this.renderError(c.toUserMessage(s));return}}c.capture(i,{source:"manual"}),this.renderError(c.toUserMessage(i))}finally{h?.()}}defaultRoute(){return l.get("user")?"chat":"landing"}renderNotFound(e){this.rootEl&&(this.rootEl.innerHTML=`
      <div class="ax-empty">
        <h2>Page introuvable</h2>
        <p>Route "${this.escape(e)}" inconnue.</p>
        <button class="ax-btn" id="ax-nf-back" type="button">Retour</button>
      </div>
    `,this.rootEl.querySelector("#ax-nf-back")?.addEventListener("click",()=>{location.hash="#chat"}))}renderForbidden(){if(!this.rootEl)return;const e=l.get("user")!==null,t=e?"":'<button class="ax-btn ax-btn-primary" id="ax-forbid-login" type="button" style="margin-right:8px">Se connecter admin</button>';this.rootEl.innerHTML=`
      <div class="ax-empty" style="padding:24px;text-align:center">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin.</p>
        <p style="font-size:14px;color:var(--ax-muted);margin-top:8px">${e?"Tu es connecté mais sans droits admin.":"Connecte-toi avec ton compte admin pour accéder à cette section."}</p>
        <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          ${t}
          <button class="ax-btn" id="ax-forbid-back" type="button">Retour au chat</button>
        </div>
      </div>
    `,this.rootEl.querySelector("#ax-forbid-login")?.addEventListener("click",()=>{location.hash="#login"}),this.rootEl.querySelector("#ax-forbid-back")?.addEventListener("click",()=>{location.hash="#chat"})}renderError(e){if(!this.rootEl)return;this.rootEl.innerHTML=`
      <div class="ax-empty" style="padding:24px;text-align:center">
        <h2>Souci de chargement</h2>
        <p>${this.escape(e)}</p>
        <p style="font-size:13px;color:var(--ax-muted);margin-top:8px">Le premier bouton réinitialise complètement le cache pour repartir propre.</p>
        <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <button class="ax-btn ax-btn-primary" id="ax-router-hard-reset" type="button">🔄 Recharger (hard reset)</button>
          <button class="ax-btn" id="ax-router-soft-reload" type="button">Reload simple</button>
        </div>
      </div>
    `;const t=this.rootEl.querySelector("#ax-router-hard-reset");t&&t.addEventListener("click",()=>{(async()=>{try{if(navigator.serviceWorker){const o=await navigator.serviceWorker.getRegistrations();await Promise.all(o.map(r=>r.unregister().catch(()=>!1)))}if(window.caches){const o=await caches.keys();await Promise.all(o.map(r=>caches.delete(r).catch(()=>!1)))}}catch{}location.replace(location.pathname+"?_v="+Date.now()+(location.hash||"#chat"))})()});const d=this.rootEl.querySelector("#ax-router-soft-reload");d&&d.addEventListener("click",()=>location.reload())}escape(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}}const v=new k,E=Object.freeze(Object.defineProperty({__proto__:null,router:v},Symbol.toStringTag,{value:"Module"}));export{E as a,v as r,g as s};
