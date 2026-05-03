import{r}from"../core/main-CDktbXwh.js";import{auth as a}from"./auth-DER1PlWI.js";function l(n){return n.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function c(){const n=location.hash.match(/invite=([A-Za-z0-9+/=]+)/);if(!n||!n[1])return null;try{const t=atob(n[1]??"").split(":")[0];if(t)return{uid:t}}catch{}return null}function u(n){const e=c();n.innerHTML=`
    <div class="ax-landing">
      <div class="ax-landing-card">
        <h1 class="ax-landing-logo">APEX</h1>
        <p class="ax-landing-tagline">Ton assistant intelligent personnel</p>
        ${e?'<div class="ax-info">Invitation détectée — connecte-toi avec ton nom complet</div>':""}
        <form id="login-form" class="ax-form">
          <label>
            Nom et prénom
            <input type="text" id="login-name" required minlength="3" autocomplete="name" placeholder="Ton prénom et nom">
          </label>
          <label>
            Code PIN
            <input type="password" id="login-pin" required minlength="4" autocomplete="current-password" inputmode="numeric">
          </label>
          <button type="submit" class="ax-btn ax-btn-primary ax-btn-block">Se connecter</button>
        </form>
        <div id="login-error"></div>
      </div>
    </div>
  `,n.querySelector("#login-form")?.addEventListener("submit",i=>{i.preventDefault(),s(n)})}async function s(n){const e=n.querySelector("#login-name")?.value.trim()??"",t=n.querySelector("#login-pin")?.value??"",i=n.querySelector("#login-error"),o=await a.login(e,t);if(!o.ok){i&&(i.innerHTML=`<div class="ax-error">${l(o.reason??"Connexion impossible")}</div>`);return}r.navigate("chat")}export{u as render};
//# sourceMappingURL=index-Dm_1A0h4.js.map
