import{auth as r}from"./auth-WOD95gMI.js";import{r as a}from"../core/main-D-tvw78T.js";function l(n){return n.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function s(){const n=location.hash.match(/invite=([A-Za-z0-9+/=]+)/);if(!n||!n[1])return null;try{const e=atob(n[1]),[t,i,o]=e.split(":");if(t)return{uid:t}}catch{}return null}function u(n){const e=s();n.innerHTML=`
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
  `,n.querySelector("#login-form")?.addEventListener("submit",i=>{i.preventDefault(),c(n)})}async function c(n){const e=n.querySelector("#login-name")?.value.trim()??"",t=n.querySelector("#login-pin")?.value??"",i=n.querySelector("#login-error"),o=await r.login(e,t);if(!o.ok){i&&(i.innerHTML=`<div class="ax-error">${l(o.reason??"Connexion impossible")}</div>`);return}a.navigate("chat")}export{u as render};
//# sourceMappingURL=index-CbtqQJGP.js.map
