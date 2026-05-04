import{r as f}from"../core/main-BacW9-1V.js";import{auth as g}from"./auth-D6J-kc02.js";import{h as c,t as d}from"./toast-DbVEuO4x.js";function m(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}function v(){const e=location.hash.match(/invite=([A-Za-z0-9+/=]+)/);if(!e||!e[1])return null;try{const o=atob(e[1]??"").split(":")[0];if(o)return{uid:o}}catch{}return null}function q(e){const t=v();e.innerHTML=`
    <div class="ax-landing">
      <div class="ax-landing-card ax-slide-up-fade">
        <div class="ax-landing-logo-wrap">
          <h1 class="ax-landing-logo">APEX</h1>
          <span class="ax-landing-version">v13.0</span>
        </div>
        <p class="ax-landing-tagline">Ton assistant intelligent personnel</p>
        ${t?'<div class="ax-info" role="status">📨 Invitation détectée — connecte-toi avec ton nom complet</div>':""}
        <form id="login-form" class="ax-form" novalidate>
          <label>
            <span class="ax-form-label">Nom et prénom</span>
            <input type="text" id="login-name" required minlength="3" autocomplete="name"
              placeholder="Ton prénom et nom" autocapitalize="words" spellcheck="false">
          </label>
          <label>
            <span class="ax-form-label">Code PIN</span>
            <input type="password" id="login-pin" required minlength="4" autocomplete="current-password"
              inputmode="numeric" placeholder="••••••" maxlength="12">
          </label>
          <button type="submit" id="login-submit" class="ax-btn ax-btn-primary ax-btn-block">
            <span class="ax-btn-label">Se connecter</span>
            <span class="ax-spinner" aria-hidden="true" style="display:none"></span>
          </button>
        </form>
        <div id="login-error" aria-live="polite" aria-atomic="true"></div>
        <p class="ax-landing-footer ax-muted">
          🔒 Local-first · End-to-end · Zero tracking
        </p>
      </div>
    </div>
  `,e.querySelector("#login-form")?.addEventListener("submit",n=>{n.preventDefault(),c.tap(),x(e)}),typeof window<"u"&&window.matchMedia("(pointer: fine)").matches&&e.querySelector("#login-name")?.focus()}async function x(e){const t=e.querySelector("#login-name"),o=e.querySelector("#login-pin"),n=e.querySelector("#login-submit"),i=e.querySelector("#login-error"),a=n?.querySelector(".ax-btn-label"),r=n?.querySelector(".ax-spinner"),p=t?.value.trim()??"",u=o?.value??"";if(p.length<2||u.length<4){c.warning(),i&&(i.innerHTML='<div class="ax-error">Nom et PIN obligatoires (min 4 chiffres)</div>');return}n&&(n.disabled=!0),a&&(a.textContent="Vérification..."),r&&(r.style.display="inline-block");try{const s=await g.login(p,u);if(!s.ok){c.error();const l=s.reason??"Connexion impossible";i&&(i.innerHTML=`<div class="ax-error">${m(l)}</div>`),d.error(l),n&&(n.disabled=!1),a&&(a.textContent="Se connecter"),r&&(r.style.display="none");return}c.success(),d.success("Bienvenue !"),setTimeout(()=>{f.navigate("chat")},200)}catch(s){c.error();const l=s instanceof Error?s.message:"Erreur inattendue";i&&(i.innerHTML=`<div class="ax-error">${m(l)}</div>`),d.error(l),n&&(n.disabled=!1),a&&(a.textContent="Se connecter"),r&&(r.style.display="none")}}export{q as render};
//# sourceMappingURL=index-Byx79jbO.js.map
