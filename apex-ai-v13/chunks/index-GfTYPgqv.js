import{l as p,s as b}from"../core/main-Z2cXS-NH.js";import{auth as x}from"./auth-DQOhGcuy.js";import{c as v}from"./commerce-Cq2Wo9rQ.js";import{firebase as y}from"./firebase-BwWKgY1w.js";import{h as o,t as d}from"./toast-D1-s5Kao.js";class ${OTP_TTL=1440*60*1e3;getKevinWhatsApp(){return localStorage.getItem("ax_kevin_whatsapp_phone")??""}async requestConfirmation(t){const a=this.getKevinWhatsApp();if(!a)return{ok:!1,reason:"Numéro Kevin WhatsApp non configuré"};const n=this.generateOTP(),i={uid:t.uid,name:t.name,whatsapp:t.whatsappPhone,otp:n,createdAt:Date.now(),expiresAt:Date.now()+this.OTP_TTL,confirmed:!1};try{const c=JSON.parse(localStorage.getItem("apex_v13_pending_confirms")??"[]");c.push(i),localStorage.setItem("apex_v13_pending_confirms",JSON.stringify(c))}catch(c){p.warn("whatsapp","persist failed",{err:c})}y.write("apex_v13_pending_confirms",i);const s=encodeURIComponent(`Bonjour Kevin, je suis ${t.name}. Voici mon code d'inscription Apex : ${n}`),u=`https://wa.me/${a.replace(/[^\d]/g,"")}?text=${s}`;return p.info("whatsapp",`Confirmation requested for ${t.name}`,{otp:n}),{ok:!0,inviteLink:u,otp:n}}confirm(t){try{const a=JSON.parse(localStorage.getItem("apex_v13_pending_confirms")??"[]"),n=a.find(r=>r.otp===t&&!r.confirmed&&r.expiresAt>Date.now());if(!n)return{ok:!1};n.confirmed=!0,localStorage.setItem("apex_v13_pending_confirms",JSON.stringify(a));const i=JSON.parse(localStorage.getItem("apex_v13_users")??"[]"),s=i.find(r=>r.id===n.uid);return s&&(s.activated=!0,localStorage.setItem("apex_v13_users",JSON.stringify(i))),p.info("whatsapp",`Confirmed ${n.name}`),{ok:!0,uid:n.uid}}catch(a){return p.error("whatsapp","confirm failed",{err:a}),{ok:!1}}}listPending(){try{return JSON.parse(localStorage.getItem("apex_v13_pending_confirms")??"[]").filter(a=>!a.confirmed&&a.expiresAt>Date.now())}catch{return[]}}generateOTP(){const t=crypto.getRandomValues(new Uint8Array(9)),a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let n="";for(let i=0;i<12;i++){const s=t[i%t.length];n+=a[(s??0)%a.length]}return n.slice(0,6)+"-"+n.slice(6)}}const g=new $;let h="commerce";function m(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}function w(){const e=v.isEnabled();return`
    <div class="ax-admin-section">
      <h2>Commercialisation</h2>
      <p class="ax-muted">
        Active le système d'abonnements pour les non-admin. Toi (Kevin admin) gardes l'accès illimité dans tous les cas.
      </p>
      <div class="ax-toggle-row">
        <label class="ax-toggle">
          <input type="checkbox" id="commerce-toggle" ${e?"checked":""}>
          <span class="ax-toggle-slider"></span>
          <span class="ax-toggle-label">Commercialisation ${e?"<strong>ACTIVÉE</strong>":"<strong>désactivée</strong>"}</span>
        </label>
      </div>
      <div class="ax-info-card">
        <h3>Plans disponibles</h3>
        <ul>
          <li><strong>free</strong> : 50 msg/jour, 1 studio, voix basique</li>
          <li><strong>basic 9€/mois</strong> : 500 msg/jour, 5 studios, voix basique</li>
          <li><strong>pro 29€/mois</strong> : illimité, 23 studios, voix premium, marketplace</li>
          <li><strong>business sur devis</strong> : multi-user, marketplace 30%, white-label</li>
          <li><strong>admin</strong> (toi Kevin) : tout illimité, jamais bloqué</li>
        </ul>
      </div>
    </div>
  `}function C(){const e=x.listUsers(),t=e.map(a=>`
      <li class="ax-user-row">
        <span class="ax-user-name">${m(a.name)}</span>
        <span class="ax-tier-badge ax-tier-${a.tier}">${a.tier}</span>
        ${a.activated?'<span class="ax-badge ax-badge-ok">activé</span>':'<span class="ax-badge ax-badge-pending">en attente</span>'}
        <select data-user-plan="${a.id}" class="ax-select-sm">
          <option value="free">free</option>
          <option value="basic">basic</option>
          <option value="pro">pro</option>
          <option value="business">business</option>
        </select>
      </li>
    `).join("");return`
    <div class="ax-admin-section">
      <h2>Créer un compte</h2>
      <form id="create-user-form" class="ax-form">
        <label>
          Nom complet
          <input type="text" id="cu-name" required minlength="2" autocomplete="off">
        </label>
        <label>
          Type de compte
          <select id="cu-tier" required>
            <option value="family">Famille</option>
            <option value="client_pro">Client Pro</option>
            <option value="client_free">Client Gratuit</option>
          </select>
        </label>
        <label>
          Email (optionnel)
          <input type="email" id="cu-email" autocomplete="off">
        </label>
        <label>
          Téléphone WhatsApp (avec indicatif, ex: +33612345678)
          <input type="tel" id="cu-whatsapp" autocomplete="off" placeholder="+33...">
        </label>
        <label>
          Code PIN initial (optionnel — sinon le client le crée à sa 1ère connexion)
          <input type="password" id="cu-pin" minlength="4" autocomplete="new-password">
        </label>
        <button type="submit" class="ax-btn ax-btn-primary">Créer le compte</button>
      </form>
      <div id="create-user-result"></div>

      <h2>Comptes existants (${e.length})</h2>
      <ul class="ax-user-list">${t||`<li class="ax-muted">Aucun compte créé pour l'instant</li>`}</ul>
    </div>
  `}function _(){const e=g.listPending();return e.length?`
    <div class="ax-admin-section">
      <h2>Confirmations WhatsApp en attente</h2>
      <p class="ax-muted">Quand le client te a envoyé son code par WhatsApp, clique "Confirmer".</p>
      <ul class="ax-pending-list">${e.map(a=>`
      <li class="ax-pending-row">
        <strong>${m(a.name)}</strong>
        <span class="ax-muted">${m(a.whatsapp)}</span>
        <code class="ax-otp">${a.otp}</code>
        <button class="ax-btn ax-btn-sm" data-confirm-otp="${a.otp}">Confirmer</button>
      </li>
    `).join("")}</ul>
    </div>
  `:`
      <div class="ax-admin-section">
        <h2>Confirmations en attente</h2>
        <p class="ax-muted">Aucune confirmation à valider.</p>
      </div>
    `}function S(){return`
    <div class="ax-admin-section">
      <h2>État de santé</h2>
      <p class="ax-muted">Sentinelles + providers IA — Jet 2 enrichira avec dashboard live.</p>
    </div>
  `}function A(){return[["commerce","💳 Commerce"],["users","👥 Comptes"],["pending","📨 En attente"],["health","🩺 Santé"]].map(([t,a])=>`
      <button class="ax-tab ${h===t?"ax-tab-active":""}" data-tab="${t}">${a}</button>
    `).join("")}function k(){switch(h){case"commerce":return w();case"users":return C();case"pending":return _();case"health":return S()}}function T(e){e.querySelectorAll("[data-tab]").forEach(n=>{n.addEventListener("click",()=>{o.selection(),h=n.dataset.tab,f(e)})});const t=e.querySelector("#commerce-toggle");t&&t.addEventListener("change",()=>{o.medium(),v.setEnabled(t.checked),d.success(`Commercialisation ${t.checked?"activée":"désactivée"}`),f(e)});const a=e.querySelector("#create-user-form");a&&a.addEventListener("submit",n=>{n.preventDefault(),q(e)}),e.querySelectorAll("[data-user-plan]").forEach(n=>{n.addEventListener("change",()=>{const i=n.dataset.userPlan??"";i&&(v.setUserPlan(i,n.value),p.info("admin",`Plan ${n.value} → ${i}`))})}),e.querySelectorAll("[data-confirm-otp]").forEach(n=>{n.addEventListener("click",()=>{o.tap();const i=n.dataset.confirmOtp??"";if(!i)return;const s=g.confirm(i);s.ok?(o.success(),d.success("Compte activé"),p.info("admin",`Confirmed user ${s.uid}`),f(e)):(o.error(),d.error("Code OTP invalide ou expiré"))})})}async function q(e){const t=e.querySelector("#cu-name")?.value.trim()??"",a=e.querySelector("#cu-tier")?.value??"family",n=e.querySelector("#cu-email")?.value.trim()??"",i=e.querySelector("#cu-whatsapp")?.value.trim()??"",s=e.querySelector("#cu-pin")?.value??"";if(!t||t.length<2){o.warning(),d.warn("Nom complet requis (min 2 caractères)");return}const r=await x.createUser({name:t,tier:a,...n&&{email:n},...i&&{whatsappPhone:i},...s&&{initialPin:s}}),u=e.querySelector("#create-user-result");if(!u)return;if(!r.ok||!r.uid){o.error();const l=r.reason??"Erreur création";u.innerHTML=`<div class="ax-error">${m(l)}</div>`,d.error(l);return}o.success(),d.success(`Compte ${t} créé`);let c="";if(i){const l=await g.requestConfirmation({uid:r.uid,name:t,whatsappPhone:i});l.ok&&l.inviteLink&&(c=`
        <a href="${l.inviteLink}" target="_blank" rel="noopener" class="ax-btn ax-btn-primary">
          📨 Envoyer le code via WhatsApp
        </a>
        <p class="ax-muted">Code OTP : <code>${l.otp}</code></p>
      `)}u.innerHTML=`
    <div class="ax-success">
      Compte créé : <strong>${m(t)}</strong> (${a})
      <p>Lien d'invitation : <input type="text" readonly value="${r.inviteLink??""}" onclick="this.select()" style="width:100%"></p>
      ${c}
    </div>
  `,f(e)}function f(e){if(!b.get("isAdmin")){e.innerHTML=`
      <div class="ax-empty">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}e.innerHTML=`
    <div class="ax-admin">
      <header class="ax-admin-header">
        <h1>Centre Admin</h1>
        <button class="ax-btn ax-btn-sm" onclick="location.hash='#chat'">← Chat</button>
      </header>
      <nav class="ax-tabs">${A()}</nav>
      <div class="ax-admin-content">${k()}</div>
    </div>
  `,T(e)}export{f as render};
//# sourceMappingURL=index-GfTYPgqv.js.map
