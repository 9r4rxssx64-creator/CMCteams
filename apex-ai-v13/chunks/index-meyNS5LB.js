import{l as d,s as b}from"../core/main-D3YjGr3r.js";import{auth as x}from"./auth-DZsHr0LM.js";import{c as v}from"./commerce-CK_tC_iI.js";import{firebase as y}from"./firebase-DL5LL9gP.js";import{h as o,t as u}from"./toast-BuJ8GQaZ.js";class ${OTP_TTL=1440*60*1e3;getKevinWhatsApp(){return localStorage.getItem("ax_kevin_whatsapp_phone")??""}async requestConfirmation(n){const a=this.getKevinWhatsApp();if(!a)return{ok:!1,reason:"Numéro Kevin WhatsApp non configuré"};const e=this.generateOTP(),i={uid:n.uid,name:n.name,whatsapp:n.whatsappPhone,otp:e,createdAt:Date.now(),expiresAt:Date.now()+this.OTP_TTL,confirmed:!1};try{const c=JSON.parse(localStorage.getItem("apex_v13_pending_confirms")??"[]");c.push(i),localStorage.setItem("apex_v13_pending_confirms",JSON.stringify(c))}catch(c){d.warn("whatsapp","persist failed",{err:c})}y.write("apex_v13_pending_confirms",i);const s=encodeURIComponent(`Bonjour Kevin, je suis ${n.name}. Voici mon code d'inscription Apex : ${e}`),m=`https://wa.me/${a.replace(/[^\d]/g,"")}?text=${s}`;return d.info("whatsapp",`Confirmation requested for ${n.name}`,{otp:e}),{ok:!0,inviteLink:m,otp:e}}confirm(n){try{const a=JSON.parse(localStorage.getItem("apex_v13_pending_confirms")??"[]"),e=a.find(r=>r.otp===n&&!r.confirmed&&r.expiresAt>Date.now());if(!e)return{ok:!1};e.confirmed=!0,localStorage.setItem("apex_v13_pending_confirms",JSON.stringify(a));const i=JSON.parse(localStorage.getItem("apex_v13_users")??"[]"),s=i.find(r=>r.id===e.uid);return s&&(s.activated=!0,localStorage.setItem("apex_v13_users",JSON.stringify(i))),d.info("whatsapp",`Confirmed ${e.name}`),{ok:!0,uid:e.uid}}catch(a){return d.error("whatsapp","confirm failed",{err:a}),{ok:!1}}}listPending(){try{return JSON.parse(localStorage.getItem("apex_v13_pending_confirms")??"[]").filter(a=>!a.confirmed&&a.expiresAt>Date.now())}catch{return[]}}generateOTP(){const n=crypto.getRandomValues(new Uint8Array(9)),a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let e="";for(let i=0;i<12;i++){const s=n[i%n.length];e+=a[(s??0)%a.length]}return e.slice(0,6)+"-"+e.slice(6)}}const g=new $;let h="commerce";function p(t){return t.replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n]??n)}function w(){const t=v.isEnabled();return`
    <div class="ax-admin-section">
      <h2>Commercialisation</h2>
      <p class="ax-muted">
        Active le système d'abonnements pour les non-admin. Toi (Kevin admin) gardes l'accès illimité dans tous les cas.
      </p>
      <div class="ax-toggle-row">
        <label class="ax-toggle">
          <input type="checkbox" id="commerce-toggle" ${t?"checked":""}>
          <span class="ax-toggle-slider"></span>
          <span class="ax-toggle-label">Commercialisation ${t?"<strong>ACTIVÉE</strong>":"<strong>désactivée</strong>"}</span>
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
  `}function C(){const t=x.listUsers(),n=new Set(["admin","family","client_pro","client_free"]),a=t.map(e=>{const i=n.has(e.tier)?e.tier:"client_free";return`
      <li class="ax-user-row">
        <span class="ax-user-name">${p(e.name)}</span>
        <span class="ax-tier-badge ax-tier-${i}">${p(i)}</span>
        ${e.activated?'<span class="ax-badge ax-badge-ok">activé</span>':'<span class="ax-badge ax-badge-pending">en attente</span>'}
        <select data-user-plan="${p(e.id)}" class="ax-select-sm">
          <option value="free">free</option>
          <option value="basic">basic</option>
          <option value="pro">pro</option>
          <option value="business">business</option>
        </select>
      </li>
    `}).join("");return`
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

      <h2>Comptes existants (${t.length})</h2>
      <ul class="ax-user-list">${a||`<li class="ax-muted">Aucun compte créé pour l'instant</li>`}</ul>
    </div>
  `}function _(){const t=g.listPending();return t.length?`
    <div class="ax-admin-section">
      <h2>Confirmations WhatsApp en attente</h2>
      <p class="ax-muted">Quand le client te a envoyé son code par WhatsApp, clique "Confirmer".</p>
      <ul class="ax-pending-list">${t.map(a=>`
      <li class="ax-pending-row">
        <strong>${p(a.name)}</strong>
        <span class="ax-muted">${p(a.whatsapp)}</span>
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
  `}function A(){return[["commerce","💳 Commerce"],["users","👥 Comptes"],["pending","📨 En attente"],["health","🩺 Santé"]].map(([n,a])=>`
      <button class="ax-tab ${h===n?"ax-tab-active":""}" data-tab="${n}">${a}</button>
    `).join("")}function k(){switch(h){case"commerce":return w();case"users":return C();case"pending":return _();case"health":return S()}}function T(t){t.querySelectorAll("[data-tab]").forEach(e=>{e.addEventListener("click",()=>{o.selection(),h=e.dataset.tab,f(t)})});const n=t.querySelector("#commerce-toggle");n&&n.addEventListener("change",()=>{o.medium(),v.setEnabled(n.checked),u.success(`Commercialisation ${n.checked?"activée":"désactivée"}`),f(t)});const a=t.querySelector("#create-user-form");a&&a.addEventListener("submit",e=>{e.preventDefault(),q(t)}),t.querySelectorAll("[data-user-plan]").forEach(e=>{e.addEventListener("change",()=>{const i=e.dataset.userPlan??"";i&&(v.setUserPlan(i,e.value),d.info("admin",`Plan ${e.value} → ${i}`))})}),t.querySelectorAll("[data-confirm-otp]").forEach(e=>{e.addEventListener("click",()=>{o.tap();const i=e.dataset.confirmOtp??"";if(!i)return;const s=g.confirm(i);s.ok?(o.success(),u.success("Compte activé"),d.info("admin",`Confirmed user ${s.uid}`),f(t)):(o.error(),u.error("Code OTP invalide ou expiré"))})})}async function q(t){const n=t.querySelector("#cu-name")?.value.trim()??"",a=t.querySelector("#cu-tier")?.value??"family",e=t.querySelector("#cu-email")?.value.trim()??"",i=t.querySelector("#cu-whatsapp")?.value.trim()??"",s=t.querySelector("#cu-pin")?.value??"";if(!n||n.length<2){o.warning(),u.warn("Nom complet requis (min 2 caractères)");return}const r=await x.createUser({name:n,tier:a,...e&&{email:e},...i&&{whatsappPhone:i},...s&&{initialPin:s}}),m=t.querySelector("#create-user-result");if(!m)return;if(!r.ok||!r.uid){o.error();const l=r.reason??"Erreur création";m.innerHTML=`<div class="ax-error">${p(l)}</div>`,u.error(l);return}o.success(),u.success(`Compte ${n} créé`);let c="";if(i){const l=await g.requestConfirmation({uid:r.uid,name:n,whatsappPhone:i});l.ok&&l.inviteLink&&(c=`
        <a href="${l.inviteLink}" target="_blank" rel="noopener" class="ax-btn ax-btn-primary">
          📨 Envoyer le code via WhatsApp
        </a>
        <p class="ax-muted">Code OTP : <code>${l.otp}</code></p>
      `)}m.innerHTML=`
    <div class="ax-success">
      Compte créé : <strong>${p(n)}</strong> (${a})
      <p>Lien d'invitation : <input type="text" readonly value="${r.inviteLink??""}" onclick="this.select()" style="width:100%"></p>
      ${c}
    </div>
  `,f(t)}function f(t){if(!b.get("isAdmin")){t.innerHTML=`
      <div class="ax-empty">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin Kevin.</p>
      </div>
    `;return}t.innerHTML=`
    <div class="ax-admin">
      <header class="ax-admin-header">
        <h1>Centre Admin</h1>
        <button class="ax-btn ax-btn-sm" onclick="location.hash='#chat'">← Chat</button>
      </header>
      <nav class="ax-tabs">${A()}</nav>
      <div class="ax-admin-content">${k()}</div>
    </div>
  `,T(t)}export{f as render};
//# sourceMappingURL=index-meyNS5LB.js.map
