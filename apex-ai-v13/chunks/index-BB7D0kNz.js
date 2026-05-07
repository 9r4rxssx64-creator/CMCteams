const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./device-context-Ddl11Kts.js","./apex-kb-DQZu_EOX.js","./monitoring-B17vNBOa.js","./apex-tools-registry-DloDnFZi.js","./credential-patterns-DqicUg9o.js","./auth-Df2s-dbq.js","../core/main-L_zGa0Dv.js","../assets/css/main-rhfGvOFL.css"])))=>i.map(i=>d[i]);
import{_ as m}from"./apex-kb-DQZu_EOX.js";import{A as g,r as v}from"../core/main-L_zGa0Dv.js";import{auth as x}from"./auth-Df2s-dbq.js";import{h as d}from"./haptic-BUEqXK0N.js";import{toast as p}from"./toast-Dgg9rcIP.js";import"./monitoring-B17vNBOa.js";import"./apex-tools-registry-DloDnFZi.js";import"./credential-patterns-DqicUg9o.js";import"./apex-tools-dispatch-DEwjWW42.js";function f(e){return e.replace(/[&<>"']/g,o=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[o]??o)}function _(){const e=location.hash.match(/invite=([A-Za-z0-9+/=]+)/);if(!e||!e[1])return null;try{const l=atob(e[1]??"").split(":")[0];if(l)return{uid:l}}catch{}return null}async function b(){try{const e=localStorage.getItem("apex_v13_last_known_uid"),o=localStorage.getItem("apex_v13_last_known_name"),l=localStorage.getItem("apex_v13_device_trusted_v1");if(!e||!o||!l)return!1;const{deviceContext:n}=await m(async()=>{const{deviceContext:s}=await import("./device-context-Ddl11Kts.js");return{deviceContext:s}},__vite__mapDeps([0,1,2,3,4]),import.meta.url);if((await n.getFingerprint()).device_id!==l)return localStorage.removeItem("apex_v13_device_trusted_v1"),!1;const{auth:a}=await m(async()=>{const{auth:s}=await import("./auth-Df2s-dbq.js");return{auth:s}},__vite__mapDeps([5,1,2,3,4,6,7]),import.meta.url);if((await a.loginTrusted(e,o)).ok)return v.navigate("chat"),!0}catch{}return!1}function N(e){b().then(t=>{t&&p.success("🔐 Reconnu automatiquement (device trusted)")});const o=_();e.innerHTML=`
    <div class="ax-landing">
      <div class="ax-landing-card ax-slide-up-fade">
        <div class="ax-landing-logo-wrap">
          <h1 class="ax-landing-logo">APEX</h1>
          <span class="ax-landing-version">${g}</span>
        </div>
        <p class="ax-landing-tagline">Ton assistant intelligent personnel</p>
        ${o?'<div class="ax-info" role="status">📨 Invitation détectée — connecte-toi avec ton nom complet</div>':""}
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
        <button type="button" id="login-reset-pin" class="ax-btn ax-btn-ghost ax-btn-block" style="margin-top:12px;font-size:13px">
          🔑 J'ai oublié mon code PIN
        </button>
        <p class="ax-landing-footer ax-muted">
          🔒 Local-first · End-to-end · Zero tracking
        </p>
      </div>
    </div>
  `,e.querySelector("#login-form")?.addEventListener("submit",t=>{t.preventDefault(),d.tap(),y(e)}),e.querySelector("#login-reset-pin")?.addEventListener("click",()=>{d.medium();const a=e.querySelector("#login-name")?.value.trim()??"";if(!a){const c=e.querySelector("#login-error");c&&(c.innerHTML=`<div class="ax-alert ax-alert-warn">Tape ton nom et prénom d'abord, puis tap "🔑 J'ai oublié mon code PIN"</div>`);return}if(!confirm(`Réinitialiser le code PIN pour "${a}" ?

• Ton PIN actuel sera EFFACÉ
• Tu pourras créer un nouveau PIN au prochain login
• Tes données (Coffre, conversations, profil) sont PRÉSERVÉES

Continuer ?`))return;try{localStorage.removeItem("apex_v13_pin"),localStorage.removeItem("apex_v13_pin_kdmc_admin");const c=[];for(let i=0;i<localStorage.length;i++){const u=localStorage.key(i);u?.startsWith("apex_v13_pin_fails_")&&c.push(u)}for(const i of c)localStorage.removeItem(i)}catch{}const r=e.querySelector("#login-error");r&&(r.innerHTML='<div class="ax-alert ax-alert-success">✅ PIN réinitialisé. Tape ton nouveau code PIN puis Se connecter.</div>');const s=e.querySelector("#login-pin");s&&(s.value="",s.focus())}),typeof window<"u"&&window.matchMedia("(pointer: fine)").matches&&e.querySelector("#login-name")?.focus()}async function y(e){const o=e.querySelector("#login-name"),l=e.querySelector("#login-pin"),n=e.querySelector("#login-submit"),t=e.querySelector("#login-error"),a=n?.querySelector(".ax-btn-label"),r=n?.querySelector(".ax-spinner"),s=o?.value.trim()??"",c=l?.value??"";if(s.length<2||c.length<4){d.warning(),t&&(t.innerHTML='<div class="ax-error">Nom et PIN obligatoires (min 4 chiffres)</div>');return}n&&(n.disabled=!0),a&&(a.textContent="Vérification..."),r&&(r.style.display="inline-block");try{const i=await x.login(s,c);if(!i.ok){d.error();const u=i.reason??"Connexion impossible";t&&(t.innerHTML=`<div class="ax-error">${f(u)}</div>`),p.error(u),n&&(n.disabled=!1),a&&(a.textContent="Se connecter"),r&&(r.style.display="none");return}d.success(),p.success("Bienvenue !"),setTimeout(()=>{v.navigate("chat")},200)}catch(i){d.error();const u=i instanceof Error?i.message:"Erreur inattendue";t&&(t.innerHTML=`<div class="ax-error">${f(u)}</div>`),p.error(u),n&&(n.disabled=!1),a&&(a.textContent="Se connecter"),r&&(r.style.display="none")}}export{N as render};
//# sourceMappingURL=index-BB7D0kNz.js.map
