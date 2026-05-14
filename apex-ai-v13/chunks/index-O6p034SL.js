const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-CEkJt-I0.js","./monitoring-3uBGKGRH.js","./credential-patterns-guxfirLX.js","./auth-BSLDp9DN.js","./multi-source-analyze-C1m_WZ_G.js","../assets/css/main-CLN-rjKG.css"])))=>i.map(i=>d[i]);
import{_ as v}from"./apex-kb-CEkJt-I0.js";import{A as b,r as f}from"../core/main-CLF8H3Xc.js";import{c as y}from"./listener-cleanup-Y2rGGxxX.js";import{auth as _}from"./auth-BSLDp9DN.js";import{i as h}from"./voice-CVithTKS.js";import{haptic as u}from"./haptic-CQFg2PXZ.js";import{toast as m}from"./toast-ClsF1KRZ.js";import"./monitoring-3uBGKGRH.js";import"./credential-patterns-guxfirLX.js";import"./multi-source-analyze-C1m_WZ_G.js";let c=null;function R(){c?.cleanup(),c=null}function x(e){return e.replace(/[&<>"']/g,o=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[o]??o)}function S(){const e=location.hash.match(/invite=([A-Za-z0-9+/=]+)/);if(!e||!e[1])return null;try{const r=atob(e[1]??"").split(":")[0];if(r)return{uid:r}}catch{}return null}async function I(){try{const e=localStorage.getItem("apex_v13_last_known_uid"),o=localStorage.getItem("apex_v13_last_known_name"),r=localStorage.getItem("apex_v13_device_trusted_v1");if(!e||!o||!r)return!1;const{deviceContext:n}=await v(async()=>{const{deviceContext:p}=await import("./device-context-CaFplWiR.js");return{deviceContext:p}},__vite__mapDeps([0,1,2]),import.meta.url);if((await n.getFingerprint()).device_id!==r)return localStorage.removeItem("apex_v13_device_trusted_v1"),!1;const{auth:t}=await v(async()=>{const{auth:p}=await import("./auth-BSLDp9DN.js");return{auth:p}},__vite__mapDeps([3,0,1,2,4,5]),import.meta.url);if((await t.loginTrusted(e,o)).ok)return f.navigate("chat"),!0}catch{}return!1}function z(e){if(c?.cleanup(),c=y("landing"),!h("module.landing")){e.innerHTML=`
      <div class="ax-landing">
        <div class="ax-landing-card">
          <h1 class="ax-landing-logo">APEX</h1>
          <p class="ax-muted" style="margin-top:14px">Service temporairement fermé par l'administrateur.</p>
          <p class="ax-muted" style="font-size:12px;margin-top:8px">Si tu es admin Kevin, rafraîchis pour bypass.</p>
        </div>
      </div>
    `;return}I().then(t=>{t&&m.success("🔐 Reconnu automatiquement (device trusted)")});const o=S();e.innerHTML=`
    <div class="ax-landing">
      <div class="ax-landing-card ax-slide-up-fade">
        <div class="ax-landing-logo-wrap">
          <h1 class="ax-landing-logo">APEX</h1>
          <span class="ax-landing-version">${b}</span>
        </div>
        <p class="ax-landing-tagline">Ton assistant intelligent personnel</p>
        ${o?'<div class="ax-info" role="status">📨 Invitation détectée — connecte-toi avec ton nom complet</div>':""}
        <form id="login-form" class="ax-form" novalidate>
          <label>
            <span class="ax-form-label">Nom et prénom</span>
            <input type="text" id="login-name" aria-label="Nom et prénom" required minlength="3" autocomplete="name"
              placeholder="Ton prénom et nom" autocapitalize="words" spellcheck="false">
          </label>
          <label>
            <span class="ax-form-label">Code PIN</span>
            <input type="password" id="login-pin" aria-label="Code PIN de connexion" required minlength="4" autocomplete="current-password"
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
        <div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
          <p style="color:var(--ax-text-dim,#888);font-size:12px;margin:0 0 6px">Pas encore de compte ?</p>
          <button type="button" id="login-go-signup" class="ax-btn ax-btn-secondary ax-btn-block" style="font-size:13px">📝 Créer mon compte</button>
        </div>
        <p class="ax-landing-footer ax-muted">
          🔒 Local-first · End-to-end · Zero tracking
        </p>
      </div>
    </div>
  `;const r=e.querySelector("#login-form");r&&c&&c.bind(r,"submit",t=>{t.preventDefault(),u.tap(),T(e)});const n=e.querySelector("#login-reset-pin");n&&c&&c.bind(n,"click",()=>{u.medium();const l=e.querySelector("#login-name")?.value.trim()??"";if(!l){const a=e.querySelector("#login-error");a&&(a.innerHTML=`<div class="ax-alert ax-alert-warn">Tape ton nom et prénom d'abord, puis tap "🔑 J'ai oublié mon code PIN"</div>`);return}if(!confirm(`Réinitialiser le code PIN pour "${l}" ?

• Ton PIN actuel sera EFFACÉ
• Tu pourras créer un nouveau PIN au prochain login
• Tes données (Coffre, conversations, profil) sont PRÉSERVÉES

Continuer ?`))return;try{localStorage.removeItem("apex_v13_pin"),localStorage.removeItem("apex_v13_pin_kdmc_admin");const a=[];for(let i=0;i<localStorage.length;i++){const g=localStorage.key(i);g?.startsWith("apex_v13_pin_fails_")&&a.push(g)}for(const i of a)localStorage.removeItem(i)}catch{}const p=e.querySelector("#login-error");p&&(p.innerHTML='<div class="ax-alert ax-alert-success">✅ PIN réinitialisé. Tape ton nouveau code PIN puis Se connecter.</div>');const d=e.querySelector("#login-pin");d&&(d.value="",d.focus())});const s=e.querySelector("#login-go-signup");s&&c&&c.bind(s,"click",()=>{u.tap(),f.navigate("signup")}),typeof window<"u"&&window.matchMedia("(pointer: fine)").matches&&e.querySelector("#login-name")?.focus()}async function T(e){const o=e.querySelector("#login-name"),r=e.querySelector("#login-pin"),n=e.querySelector("#login-submit"),s=e.querySelector("#login-error"),t=n?.querySelector(".ax-btn-label"),l=n?.querySelector(".ax-spinner"),p=o?.value.trim()??"",d=r?.value??"";if(p.length<2||d.length<4){u.warning(),s&&(s.innerHTML='<div class="ax-error">Nom et PIN obligatoires (min 4 chiffres)</div>');return}n&&(n.disabled=!0),t&&(t.textContent="Vérification..."),l&&(l.style.display="inline-block");try{const a=await _.login(p,d);if(!a.ok){u.error();const i=a.reason??"Connexion impossible";s&&(s.innerHTML=`<div class="ax-error">${x(i)}</div>`),m.error(i),n&&(n.disabled=!1),t&&(t.textContent="Se connecter"),l&&(l.style.display="none");return}u.success(),m.success("Bienvenue !"),setTimeout(()=>{f.navigate("chat")},200)}catch(a){u.error();const i=a instanceof Error?a.message:"Erreur inattendue";s&&(s.innerHTML=`<div class="ax-error">${x(i)}</div>`),m.error(i),n&&(n.disabled=!1),t&&(t.textContent="Se connecter"),l&&(l.style.display="none")}}export{R as dispose,z as render};
