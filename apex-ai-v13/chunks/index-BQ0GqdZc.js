import{c as m}from"./commerce-DrEYGBWa.js";import{auth as g}from"./auth-EhoW4C6U.js";import{l as c,s as h}from"../core/main-CAfKhyyq.js";import{firebase as x}from"./firebase-DnVKUCRH.js";class b{OTP_TTL=1440*60*1e3;getKevinWhatsApp(){return localStorage.getItem("ax_kevin_whatsapp_phone")??""}async requestConfirmation(a){const t=this.getKevinWhatsApp();if(!t)return{ok:!1,reason:"Numéro Kevin WhatsApp non configuré"};const n=this.generateOTP(),i={uid:a.uid,name:a.name,whatsapp:a.whatsappPhone,otp:n,createdAt:Date.now(),expiresAt:Date.now()+this.OTP_TTL,confirmed:!1};try{const o=JSON.parse(localStorage.getItem("apex_v13_pending_confirms")??"[]");o.push(i),localStorage.setItem("apex_v13_pending_confirms",JSON.stringify(o))}catch(o){c.warn("whatsapp","persist failed",{err:o})}x.write("apex_v13_pending_confirms",i);const s=encodeURIComponent(`Bonjour Kevin, je suis ${a.name}. Voici mon code d'inscription Apex : ${n}`),l=`https://wa.me/${t.replace(/[^\d]/g,"")}?text=${s}`;return c.info("whatsapp",`Confirmation requested for ${a.name}`,{otp:n}),{ok:!0,inviteLink:l,otp:n}}confirm(a){try{const t=JSON.parse(localStorage.getItem("apex_v13_pending_confirms")??"[]"),n=t.find(r=>r.otp===a&&!r.confirmed&&r.expiresAt>Date.now());if(!n)return{ok:!1};n.confirmed=!0,localStorage.setItem("apex_v13_pending_confirms",JSON.stringify(t));const i=JSON.parse(localStorage.getItem("apex_v13_users")??"[]"),s=i.find(r=>r.id===n.uid);return s&&(s.activated=!0,localStorage.setItem("apex_v13_users",JSON.stringify(i))),c.info("whatsapp",`Confirmed ${n.name}`),{ok:!0,uid:n.uid}}catch(t){return c.error("whatsapp","confirm failed",{err:t}),{ok:!1}}}listPending(){try{return JSON.parse(localStorage.getItem("apex_v13_pending_confirms")??"[]").filter(t=>!t.confirmed&&t.expiresAt>Date.now())}catch{return[]}}generateOTP(){const a=crypto.getRandomValues(new Uint8Array(9)),t="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let n="";for(let i=0;i<12;i++){const s=a[i%a.length];n+=t[(s??0)%t.length]}return n.slice(0,6)+"-"+n.slice(6)}}const f=new b;let v="commerce";function d(e){return e.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]??a)}function y(){const e=m.isEnabled();return`
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
  `}function $(){const e=g.listUsers(),a=e.map(t=>`
      <li class="ax-user-row">
        <span class="ax-user-name">${d(t.name)}</span>
        <span class="ax-tier-badge ax-tier-${t.tier}">${t.tier}</span>
        ${t.activated?'<span class="ax-badge ax-badge-ok">activé</span>':'<span class="ax-badge ax-badge-pending">en attente</span>'}
        <select data-user-plan="${t.id}" class="ax-select-sm">
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
      <ul class="ax-user-list">${a||`<li class="ax-muted">Aucun compte créé pour l'instant</li>`}</ul>
    </div>
  `}function w(){const e=f.listPending();return e.length?`
    <div class="ax-admin-section">
      <h2>Confirmations WhatsApp en attente</h2>
      <p class="ax-muted">Quand le client te a envoyé son code par WhatsApp, clique "Confirmer".</p>
      <ul class="ax-pending-list">${e.map(t=>`
      <li class="ax-pending-row">
        <strong>${d(t.name)}</strong>
        <span class="ax-muted">${d(t.whatsapp)}</span>
        <code class="ax-otp">${t.otp}</code>
        <button class="ax-btn ax-btn-sm" data-confirm-otp="${t.otp}">Confirmer</button>
      </li>
    `).join("")}</ul>
    </div>
  `:`
      <div class="ax-admin-section">
        <h2>Confirmations en attente</h2>
        <p class="ax-muted">Aucune confirmation à valider.</p>
      </div>
    `}function C(){return`
    <div class="ax-admin-section">
      <h2>État de santé</h2>
      <p class="ax-muted">Sentinelles + providers IA — Jet 2 enrichira avec dashboard live.</p>
    </div>
  `}function _(){return[["commerce","💳 Commerce"],["users","👥 Comptes"],["pending","📨 En attente"],["health","🩺 Santé"]].map(([a,t])=>`
      <button class="ax-tab ${v===a?"ax-tab-active":""}" data-tab="${a}">${t}</button>
    `).join("")}function S(){switch(v){case"commerce":return y();case"users":return $();case"pending":return w();case"health":return C()}}function A(e){e.querySelectorAll("[data-tab]").forEach(n=>{n.addEventListener("click",()=>{v=n.dataset.tab,u(e)})});const a=e.querySelector("#commerce-toggle");a&&a.addEventListener("change",()=>{m.setEnabled(a.checked),u(e)});const t=e.querySelector("#create-user-form");t&&t.addEventListener("submit",n=>{n.preventDefault(),k(e)}),e.querySelectorAll("[data-user-plan]").forEach(n=>{n.addEventListener("change",()=>{const i=n.dataset.userPlan;m.setUserPlan(i,n.value),c.info("admin",`Plan ${n.value} → ${i}`)})}),e.querySelectorAll("[data-confirm-otp]").forEach(n=>{n.addEventListener("click",()=>{const i=n.dataset.confirmOtp,s=f.confirm(i);s.ok&&(c.info("admin",`Confirmed user ${s.uid}`),u(e))})})}async function k(e){const a=e.querySelector("#cu-name")?.value.trim()??"",t=e.querySelector("#cu-tier")?.value??"family",n=e.querySelector("#cu-email")?.value.trim()??"",i=e.querySelector("#cu-whatsapp")?.value.trim()??"",s=e.querySelector("#cu-pin")?.value??"",r=await g.createUser({name:a,tier:t,...n&&{email:n},...i&&{whatsappPhone:i},...s&&{initialPin:s}}),l=e.querySelector("#create-user-result");if(!l)return;if(!r.ok||!r.uid){l.innerHTML=`<div class="ax-error">${d(r.reason??"Erreur")}</div>`;return}let o="";if(i){const p=await f.requestConfirmation({uid:r.uid,name:a,whatsappPhone:i});p.ok&&p.inviteLink&&(o=`
        <a href="${p.inviteLink}" target="_blank" rel="noopener" class="ax-btn ax-btn-primary">
          📨 Envoyer le code via WhatsApp
        </a>
        <p class="ax-muted">Code OTP : <code>${p.otp}</code></p>
      `)}l.innerHTML=`
    <div class="ax-success">
      Compte créé : <strong>${d(a)}</strong> (${t})
      <p>Lien d'invitation : <input type="text" readonly value="${r.inviteLink??""}" onclick="this.select()" style="width:100%"></p>
      ${o}
    </div>
  `,u(e)}function u(e){if(!h.get("isAdmin")){e.innerHTML=`
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
      <nav class="ax-tabs">${_()}</nav>
      <div class="ax-admin-content">${S()}</div>
    </div>
  `,A(e)}export{u as render};
//# sourceMappingURL=index-BQ0GqdZc.js.map
