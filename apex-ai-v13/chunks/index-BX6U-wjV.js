const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-D6gjJiDN.js","./monitoring-3uBGKGRH.js","./credential-patterns-CLzI061R.js","./auth-CbQBxw6M.js","./multi-source-analyze-8fXmK5FN.js","../assets/css/main-BUIq5pfg.css"])))=>i.map(i=>d[i]);
import{_ as v}from"./apex-kb-D6gjJiDN.js";import{A as b,r as f}from"../core/main-DBiCqUwg.js";import{e as x}from"./escape-html-B4YFbUXM.js";import{c as y}from"./listener-cleanup-Y2rGGxxX.js";import{auth as _}from"./auth-CbQBxw6M.js";import{i as h}from"./voice-pOsZW5qo.js";import{haptic as u}from"./haptic-CQFg2PXZ.js";import{toast as m}from"./toast-ClsF1KRZ.js";import"./monitoring-3uBGKGRH.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-8fXmK5FN.js";let l=null;function z(){l?.cleanup(),l=null}function S(){const e=location.hash.match(/invite=([A-Za-z0-9+/=]+)/);if(!e||!e[1])return null;try{const o=atob(e[1]??"").split(":")[0];if(o)return{uid:o}}catch{}return null}async function I(){try{const e=localStorage.getItem("apex_v13_last_known_uid"),p=localStorage.getItem("apex_v13_last_known_name"),o=localStorage.getItem("apex_v13_device_trusted_v1");if(!e||!p||!o)return!1;const{deviceContext:n}=await v(async()=>{const{deviceContext:c}=await import("./device-context-D0r9_TWr.js");return{deviceContext:c}},__vite__mapDeps([0,1,2]),import.meta.url);if((await n.getFingerprint()).device_id!==o)return localStorage.removeItem("apex_v13_device_trusted_v1"),!1;const{auth:t}=await v(async()=>{const{auth:c}=await import("./auth-CbQBxw6M.js");return{auth:c}},__vite__mapDeps([3,0,1,2,4,5]),import.meta.url);if((await t.loginTrusted(e,p)).ok)return f.navigate("chat"),!0}catch{}return!1}function E(e){if(l?.cleanup(),l=y("landing"),!h("module.landing")){e.innerHTML=`
      <div class="ax-landing">
        <div class="ax-landing-card">
          <h1 class="ax-landing-logo">APEX</h1>
          <p class="ax-muted" style="margin-top:14px">Service temporairement fermé par l'administrateur.</p>
          <p class="ax-muted" style="font-size:12px;margin-top:8px">Si tu es admin Kevin, rafraîchis pour bypass.</p>
        </div>
      </div>
    `;return}I().then(t=>{t&&m.success("🔐 Reconnu automatiquement (device trusted)")});const p=S();e.innerHTML=`
    <div class="ax-landing">
      <div class="ax-landing-card ax-slide-up-fade">
        <div class="ax-landing-logo-wrap">
          <h1 class="ax-landing-logo">APEX</h1>
          <span class="ax-landing-version">${b}</span>
        </div>
        <p class="ax-landing-tagline">Ton assistant intelligent personnel</p>
        ${p?'<div class="ax-info" role="status">📨 Invitation détectée — connecte-toi avec ton nom complet</div>':""}
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
  `;const o=e.querySelector("#login-form");o&&l&&l.bind(o,"submit",t=>{t.preventDefault(),u.tap(),T(e)});const n=e.querySelector("#login-reset-pin");n&&l&&l.bind(n,"click",()=>{u.medium();const s=e.querySelector("#login-name")?.value.trim()??"";if(!s){const a=e.querySelector("#login-error");a&&(a.innerHTML=`<div class="ax-alert ax-alert-warn">Tape ton nom et prénom d'abord, puis tap "🔑 J'ai oublié mon code PIN"</div>`);return}if(!confirm(`Réinitialiser le code PIN pour "${s}" ?

• Ton PIN actuel sera EFFACÉ
• Tu pourras créer un nouveau PIN au prochain login
• Tes données (Coffre, conversations, profil) sont PRÉSERVÉES

Continuer ?`))return;try{localStorage.removeItem("apex_v13_pin"),localStorage.removeItem("apex_v13_pin_kdmc_admin");const a=[];for(let i=0;i<localStorage.length;i++){const g=localStorage.key(i);g?.startsWith("apex_v13_pin_fails_")&&a.push(g)}for(const i of a)localStorage.removeItem(i)}catch{}const c=e.querySelector("#login-error");c&&(c.innerHTML='<div class="ax-alert ax-alert-success">✅ PIN réinitialisé. Tape ton nouveau code PIN puis Se connecter.</div>');const d=e.querySelector("#login-pin");d&&(d.value="",d.focus())});const r=e.querySelector("#login-go-signup");r&&l&&l.bind(r,"click",()=>{u.tap(),f.navigate("signup")}),typeof window<"u"&&window.matchMedia("(pointer: fine)").matches&&e.querySelector("#login-name")?.focus()}async function T(e){const p=e.querySelector("#login-name"),o=e.querySelector("#login-pin"),n=e.querySelector("#login-submit"),r=e.querySelector("#login-error"),t=n?.querySelector(".ax-btn-label"),s=n?.querySelector(".ax-spinner"),c=p?.value.trim()??"",d=o?.value??"";if(c.length<2||d.length<4){u.warning(),r&&(r.innerHTML='<div class="ax-error">Nom et PIN obligatoires (min 4 chiffres)</div>');return}n&&(n.disabled=!0),t&&(t.textContent="Vérification..."),s&&(s.style.display="inline-block");try{const a=await _.login(c,d);if(!a.ok){u.error();const i=a.reason??"Connexion impossible";r&&(r.innerHTML=`<div class="ax-error">${x(i)}</div>`),m.error(i),n&&(n.disabled=!1),t&&(t.textContent="Se connecter"),s&&(s.style.display="none");return}u.success(),m.success("Bienvenue !"),setTimeout(()=>{f.navigate("chat")},200)}catch(a){u.error();const i=a instanceof Error?a.message:"Erreur inattendue";r&&(r.innerHTML=`<div class="ax-error">${x(i)}</div>`),m.error(i),n&&(n.disabled=!1),t&&(t.textContent="Se connecter"),s&&(s.style.display="none")}}export{z as dispose,E as render};
