const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./device-context-DSZwNp1A.js","./apex-kb-BxZCzbiC.js","./monitoring-B17vNBOa.js","./apex-tools-registry-DloDnFZi.js","./credential-patterns-DqicUg9o.js","./auth-CakKIOUe.js","../core/main-DiZih2RZ.js","../assets/css/main-rhfGvOFL.css"])))=>i.map(i=>d[i]);
import{_ as f}from"./apex-kb-BxZCzbiC.js";import{A as x,r as v}from"../core/main-DiZih2RZ.js";import{c as b}from"./listener-cleanup-Y2rGGxxX.js";import{auth as _}from"./auth-CakKIOUe.js";import{h as d}from"./haptic-BUEqXK0N.js";import{toast as m}from"./toast-Dgg9rcIP.js";import"./monitoring-B17vNBOa.js";import"./apex-tools-registry-DloDnFZi.js";import"./credential-patterns-DqicUg9o.js";import"./apex-tools-dispatch-CXzxpqV1.js";let p=null;function H(){p?.cleanup(),p=null}function g(e){return e.replace(/[&<>"']/g,o=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[o]??o)}function y(){const e=location.hash.match(/invite=([A-Za-z0-9+/=]+)/);if(!e||!e[1])return null;try{const r=atob(e[1]??"").split(":")[0];if(r)return{uid:r}}catch{}return null}async function h(){try{const e=localStorage.getItem("apex_v13_last_known_uid"),o=localStorage.getItem("apex_v13_last_known_name"),r=localStorage.getItem("apex_v13_device_trusted_v1");if(!e||!o||!r)return!1;const{deviceContext:n}=await f(async()=>{const{deviceContext:l}=await import("./device-context-DSZwNp1A.js");return{deviceContext:l}},__vite__mapDeps([0,1,2,3,4]),import.meta.url);if((await n.getFingerprint()).device_id!==r)return localStorage.removeItem("apex_v13_device_trusted_v1"),!1;const{auth:a}=await f(async()=>{const{auth:l}=await import("./auth-CakKIOUe.js");return{auth:l}},__vite__mapDeps([5,1,2,3,4,6,7]),import.meta.url);if((await a.loginTrusted(e,o)).ok)return v.navigate("chat"),!0}catch{}return!1}function M(e){p?.cleanup(),p=b("landing"),h().then(t=>{t&&m.success("🔐 Reconnu automatiquement (device trusted)")});const o=y();e.innerHTML=`
    <div class="ax-landing">
      <div class="ax-landing-card ax-slide-up-fade">
        <div class="ax-landing-logo-wrap">
          <h1 class="ax-landing-logo">APEX</h1>
          <span class="ax-landing-version">${x}</span>
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
  `;const r=e.querySelector("#login-form");r&&p&&p.bind(r,"submit",t=>{t.preventDefault(),d.tap(),S(e)});const n=e.querySelector("#login-reset-pin");n&&p&&p.bind(n,"click",()=>{d.medium();const a=e.querySelector("#login-name")?.value.trim()??"";if(!a){const c=e.querySelector("#login-error");c&&(c.innerHTML=`<div class="ax-alert ax-alert-warn">Tape ton nom et prénom d'abord, puis tap "🔑 J'ai oublié mon code PIN"</div>`);return}if(!confirm(`Réinitialiser le code PIN pour "${a}" ?

• Ton PIN actuel sera EFFACÉ
• Tu pourras créer un nouveau PIN au prochain login
• Tes données (Coffre, conversations, profil) sont PRÉSERVÉES

Continuer ?`))return;try{localStorage.removeItem("apex_v13_pin"),localStorage.removeItem("apex_v13_pin_kdmc_admin");const c=[];for(let i=0;i<localStorage.length;i++){const u=localStorage.key(i);u?.startsWith("apex_v13_pin_fails_")&&c.push(u)}for(const i of c)localStorage.removeItem(i)}catch{}const s=e.querySelector("#login-error");s&&(s.innerHTML='<div class="ax-alert ax-alert-success">✅ PIN réinitialisé. Tape ton nouveau code PIN puis Se connecter.</div>');const l=e.querySelector("#login-pin");l&&(l.value="",l.focus())}),typeof window<"u"&&window.matchMedia("(pointer: fine)").matches&&e.querySelector("#login-name")?.focus()}async function S(e){const o=e.querySelector("#login-name"),r=e.querySelector("#login-pin"),n=e.querySelector("#login-submit"),t=e.querySelector("#login-error"),a=n?.querySelector(".ax-btn-label"),s=n?.querySelector(".ax-spinner"),l=o?.value.trim()??"",c=r?.value??"";if(l.length<2||c.length<4){d.warning(),t&&(t.innerHTML='<div class="ax-error">Nom et PIN obligatoires (min 4 chiffres)</div>');return}n&&(n.disabled=!0),a&&(a.textContent="Vérification..."),s&&(s.style.display="inline-block");try{const i=await _.login(l,c);if(!i.ok){d.error();const u=i.reason??"Connexion impossible";t&&(t.innerHTML=`<div class="ax-error">${g(u)}</div>`),m.error(u),n&&(n.disabled=!1),a&&(a.textContent="Se connecter"),s&&(s.style.display="none");return}d.success(),m.success("Bienvenue !"),setTimeout(()=>{v.navigate("chat")},200)}catch(i){d.error();const u=i instanceof Error?i.message:"Erreur inattendue";t&&(t.innerHTML=`<div class="ax-error">${g(u)}</div>`),m.error(u),n&&(n.disabled=!1),a&&(a.textContent="Se connecter"),s&&(s.style.display="none")}}export{H as dispose,M as render};
//# sourceMappingURL=index-31aJMS_j.js.map
