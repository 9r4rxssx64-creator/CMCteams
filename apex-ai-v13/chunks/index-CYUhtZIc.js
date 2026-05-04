import{r as f}from"../core/main-DNJwgJL8.js";import{auth as g}from"./auth-DQ-7dwV7.js";import{h as u,t as p}from"./toast-DbVEuO4x.js";function m(e){return e.replace(/[&<>"']/g,l=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[l]??l)}function v(){const e=location.hash.match(/invite=([A-Za-z0-9+/=]+)/);if(!e||!e[1])return null;try{const d=atob(e[1]??"").split(":")[0];if(d)return{uid:d}}catch{}return null}function S(e){const l=v();e.innerHTML=`
    <div class="ax-landing">
      <div class="ax-landing-card ax-slide-up-fade">
        <div class="ax-landing-logo-wrap">
          <h1 class="ax-landing-logo">APEX</h1>
          <span class="ax-landing-version">v13.0</span>
        </div>
        <p class="ax-landing-tagline">Ton assistant intelligent personnel</p>
        ${l?'<div class="ax-info" role="status">📨 Invitation détectée — connecte-toi avec ton nom complet</div>':""}
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
  `,e.querySelector("#login-form")?.addEventListener("submit",i=>{i.preventDefault(),u.tap(),x(e)}),e.querySelector("#login-reset-pin")?.addEventListener("click",()=>{u.medium();const a=e.querySelector("#login-name")?.value.trim()??"";if(!a){const r=e.querySelector("#login-error");r&&(r.innerHTML=`<div class="ax-alert ax-alert-warn">Tape ton nom et prénom d'abord, puis tap "🔑 J'ai oublié mon code PIN"</div>`);return}if(!confirm(`Réinitialiser le code PIN pour "${a}" ?

• Ton PIN actuel sera EFFACÉ
• Tu pourras créer un nouveau PIN au prochain login
• Tes données (Coffre, conversations, profil) sont PRÉSERVÉES

Continuer ?`))return;try{localStorage.removeItem("apex_v13_pin"),localStorage.removeItem("apex_v13_pin_kdmc_admin");const r=[];for(let n=0;n<localStorage.length;n++){const s=localStorage.key(n);s?.startsWith("apex_v13_pin_fails_")&&r.push(s)}for(const n of r)localStorage.removeItem(n)}catch{}const o=e.querySelector("#login-error");o&&(o.innerHTML='<div class="ax-alert ax-alert-success">✅ PIN réinitialisé. Tape ton nouveau code PIN puis Se connecter.</div>');const c=e.querySelector("#login-pin");c&&(c.value="",c.focus())}),typeof window<"u"&&window.matchMedia("(pointer: fine)").matches&&e.querySelector("#login-name")?.focus()}async function x(e){const l=e.querySelector("#login-name"),d=e.querySelector("#login-pin"),t=e.querySelector("#login-submit"),i=e.querySelector("#login-error"),a=t?.querySelector(".ax-btn-label"),o=t?.querySelector(".ax-spinner"),c=l?.value.trim()??"",r=d?.value??"";if(c.length<2||r.length<4){u.warning(),i&&(i.innerHTML='<div class="ax-error">Nom et PIN obligatoires (min 4 chiffres)</div>');return}t&&(t.disabled=!0),a&&(a.textContent="Vérification..."),o&&(o.style.display="inline-block");try{const n=await g.login(c,r);if(!n.ok){u.error();const s=n.reason??"Connexion impossible";i&&(i.innerHTML=`<div class="ax-error">${m(s)}</div>`),p.error(s),t&&(t.disabled=!1),a&&(a.textContent="Se connecter"),o&&(o.style.display="none");return}u.success(),p.success("Bienvenue !"),setTimeout(()=>{f.navigate("chat")},200)}catch(n){u.error();const s=n instanceof Error?n.message:"Erreur inattendue";i&&(i.innerHTML=`<div class="ax-error">${m(s)}</div>`),p.error(s),t&&(t.disabled=!1),a&&(a.textContent="Se connecter"),o&&(o.style.display="none")}}export{S as render};
//# sourceMappingURL=index-CYUhtZIc.js.map
