const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./apex-kb-DkXWMstU.js","./monitoring-CjXQKsP-.js","./multi-source-analyze-BlYjOulu.js","./credential-patterns-CLzI061R.js","./auth-DaFk2Tly.js"])))=>i.map(i=>d[i]);
import{_ as g}from"./apex-kb-DkXWMstU.js";import{b as _,r as f}from"../core/main-CG62Gq_8.js";import{a as x}from"./escape-html-DGIYNPKb.js";import{c as b}from"./listener-cleanup-Y2rGGxxX.js";import{auth as y}from"./auth-DaFk2Tly.js";import{i as h}from"./apex-tools-dispatch-core-CsAQnFXt.js";import{haptic as u}from"./haptic-CQFg2PXZ.js";import{toast as m}from"./toast-CRdbcLoc.js";import"./monitoring-CjXQKsP-.js";import"./multi-source-analyze-BlYjOulu.js";import"./credential-patterns-CLzI061R.js";import"./apex-tools-dispatch-skills-BmaPPmFT.js";import"./apex-tools-dispatch-data-CwPHEssD.js";import"./apex-tools-dispatch-finance-DoRAfEZC.js";import"./apex-tools-dispatch-misc-JukyXsGG.js";import"./apex-tools-misc-DsyCIMlO.js";import"./apex-tools-registry-core-CQvgkOQw.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";let c=null;function O(){c?.cleanup(),c=null}function S(){const e=location.hash.match(/invite=([A-Za-z0-9+/=]+)/);if(!e||!e[1])return null;try{const o=atob(e[1]??"").split(":")[0];if(o)return{uid:o}}catch{}return null}async function I(){try{const e=localStorage.getItem("apex_v13_last_known_uid"),d=localStorage.getItem("apex_v13_last_known_name");let o=localStorage.getItem("apex_v13_device_trusted_v1");if(!e||!d)return!1;if(!o&&(localStorage.getItem("apex_v13_pin")!==null||localStorage.getItem(`apex_v13_pin_${e}`)!==null))try{const{deviceContext:p}=await g(async()=>{const{deviceContext:i}=await import("./device-context-DKaTksjZ.js");return{deviceContext:i}},__vite__mapDeps([0,1,2,3]),import.meta.url),t=await p.getFingerprint();localStorage.setItem("apex_v13_device_trusted_v1",t.device_id),o=t.device_id}catch{}if(!o)return!1;const{deviceContext:n}=await g(async()=>{const{deviceContext:l}=await import("./device-context-DKaTksjZ.js");return{deviceContext:l}},__vite__mapDeps([0,1,2,3]),import.meta.url);if((await n.getFingerprint()).device_id!==o)return localStorage.removeItem("apex_v13_device_trusted_v1"),!1;const{auth:a}=await g(async()=>{const{auth:l}=await import("./auth-DaFk2Tly.js");return{auth:l}},__vite__mapDeps([4,0,1,2,3]),import.meta.url);if((await a.loginTrusted(e,d)).ok)return f.navigate("chat"),!0}catch{}return!1}function J(e){if(c?.cleanup(),c=b("landing"),!h("module.landing")){e.innerHTML=`
      <div class="ax-landing">
        <div class="ax-landing-card">
          <h1 class="ax-landing-logo">APEX</h1>
          <p class="ax-muted ax-gs-187">Service temporairement fermé par l'administrateur.</p>
          <p class="ax-muted ax-gs-397">Si tu es admin Kevin, rafraîchis pour bypass.</p>
        </div>
      </div>
    `;return}I().then(a=>{a&&m.success("🔐 Reconnu automatiquement (device trusted)")});const d=S();e.innerHTML=`
    <div class="ax-landing">
      <div class="ax-landing-card ax-slide-up-fade">
        <div class="ax-landing-logo-wrap">
          <h1 class="ax-landing-logo">APEX</h1>
          <span class="ax-landing-version">${_}</span>
        </div>
        <p class="ax-landing-tagline">Ton assistant intelligent personnel</p>
        ${d?'<div class="ax-info" role="status">📨 Invitation détectée — connecte-toi avec ton nom complet</div>':""}
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
            <span class="ax-spinner ax-gs-234" aria-hidden="true"></span>
          </button>
        </form>
        <div id="login-error" aria-live="polite" aria-atomic="true"></div>
        <button type="button" id="login-reset-pin" class="ax-btn ax-btn-ghost ax-btn-block" style="margin-top:12px;font-size:13px">
          🔑 J'ai oublié mon code PIN
        </button>
        <div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
          <p style="color:var(--ax-text-dim,#888);font-size:12px;margin:0 0 6px">Pas encore de compte ?</p>
          <button type="button" id="login-go-signup" class="ax-btn ax-btn-secondary ax-btn-block ax-gs-398">📝 Créer mon compte</button>
        </div>
        <p class="ax-landing-footer ax-muted">
          🔒 Local-first · End-to-end · Zero tracking
        </p>
      </div>
    </div>
  `;const o=e.querySelector("#login-form");o&&c&&c.bind(o,"submit",a=>{a.preventDefault(),u.tap(),w(e)});const n=e.querySelector("#login-reset-pin");n&&c&&c.bind(n,"click",()=>{u.medium();const s=e.querySelector("#login-name")?.value.trim()??"";if(!s){const t=e.querySelector("#login-error");t&&(t.innerHTML=`<div class="ax-alert ax-alert-warn">Tape ton nom et prénom d'abord, puis tap "🔑 J'ai oublié mon code PIN"</div>`);return}if(!confirm(`Réinitialiser le code PIN pour "${s}" ?

• Ton PIN actuel sera EFFACÉ
• Tu pourras créer un nouveau PIN au prochain login
• Tes données (Coffre, conversations, profil) sont PRÉSERVÉES

Continuer ?`))return;try{localStorage.removeItem("apex_v13_pin"),localStorage.removeItem("apex_v13_pin_kdmc_admin");const t=[];for(let i=0;i<localStorage.length;i++){const v=localStorage.key(i);v?.startsWith("apex_v13_pin_fails_")&&t.push(v)}for(const i of t)localStorage.removeItem(i)}catch{}const l=e.querySelector("#login-error");l&&(l.innerHTML='<div class="ax-alert ax-alert-success">✅ PIN réinitialisé. Tape ton nouveau code PIN puis Se connecter.</div>');const p=e.querySelector("#login-pin");p&&(p.value="",p.focus())});const r=e.querySelector("#login-go-signup");r&&c&&c.bind(r,"click",()=>{u.tap(),f.navigate("signup")}),typeof window<"u"&&window.matchMedia("(pointer: fine)").matches&&e.querySelector("#login-name")?.focus()}async function w(e){const d=e.querySelector("#login-name"),o=e.querySelector("#login-pin"),n=e.querySelector("#login-submit"),r=e.querySelector("#login-error"),a=n?.querySelector(".ax-btn-label"),s=n?.querySelector(".ax-spinner"),l=d?.value.trim()??"",p=o?.value??"";if(l.length<2||p.length<4){u.warning(),r&&(r.innerHTML='<div class="ax-error">Nom et PIN obligatoires (min 4 chiffres)</div>');return}n&&(n.disabled=!0),a&&(a.textContent="Vérification..."),s&&(s.style.display="inline-block");try{const t=await y.login(l,p);if(!t.ok){u.error();const i=t.reason??"Connexion impossible";r&&(r.innerHTML=`<div class="ax-error">${x(i)}</div>`),m.error(i),n&&(n.disabled=!1),a&&(a.textContent="Se connecter"),s&&(s.style.display="none");return}u.success(),m.success("Bienvenue !"),setTimeout(()=>{f.navigate("chat")},200)}catch(t){u.error();const i=t instanceof Error?t.message:"Erreur inattendue";r&&(r.innerHTML=`<div class="ax-error">${x(i)}</div>`),m.error(i),n&&(n.disabled=!1),a&&(a.textContent="Se connecter"),s&&(s.style.display="none")}}export{O as dispose,J as render};
