import{c as v}from"./listener-cleanup-Y2rGGxxX.js";import{r as m}from"../core/main-k2hhEa6P.js";import{s as h}from"./signup-BNVt8Sp-.js";import{h as d}from"./haptic-BUEqXK0N.js";import{toast as x}from"./toast-Dgg9rcIP.js";import"./apex-kb-DEV0ns6l.js";import"./monitoring-BAiQJoxJ.js";import"./credential-patterns-Dy6Wjk7e.js";import"./multi-source-analyze-Cjv0lJFa.js";import"./auth-gate-DAtSJGL4.js";import"./commerce-nLp2-Lgt.js";import"./kevin-alerts-CA4MMK5v.js";import"./whatsapp-CtgSkElE.js";let a=null;function W(){a?.cleanup(),a=null}function c(e){return e.replace(/[&<>"']/g,i=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[i]??i)}const k=[{id:"free",label:"🆓 Découverte",price:"0 €",features:["Chat IA basique","50 messages/jour"]},{id:"basic",label:"✨ Basic",price:"9,90 €/mois",features:["Chat illimité","Studios","Voix"]},{id:"pro",label:"💎 Pro",price:"29,90 €/mois",features:["Tout Basic","Modules pro","Coffre, IoT"]},{id:"family",label:"👨‍👩‍👧 Famille (sur invitation)",price:"Gratuit",features:["Accès complet","Validation Kevin"]}];function H(e){a?.cleanup(),a=v("signup"),e.innerHTML=`
    <div class="ax-signup" style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,#08080f 0%,#181820 100%)">
      <div class="ax-signup-card" style="max-width:560px;width:100%;background:rgba(20,20,35,0.92);backdrop-filter:blur(20px);border:1px solid rgba(201,162,39,0.3);border-radius:20px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="margin:0 0 4px;color:#c9a227;font-size:28px">📝 Créer mon compte Apex</h1>
          <p style="color:var(--ax-text-dim,#aaa);margin:0;font-size:14px">Validation par Kevin via WhatsApp · Local-first · RGPD-friendly</p>
        </div>

        <form id="signup-form" novalidate style="display:grid;gap:14px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label>
              <span style="display:block;color:#c9a227;font-size:12px;margin-bottom:4px">Prénom *</span>
              <input type="text" id="signup-prenom" required minlength="2" autocomplete="given-name"
                style="width:100%;padding:11px;background:rgba(0,0,0,0.3);border:1px solid rgba(201,162,39,0.3);border-radius:8px;color:#fff;font-size:14px"
                placeholder="Marc">
            </label>
            <label>
              <span style="display:block;color:#c9a227;font-size:12px;margin-bottom:4px">Nom *</span>
              <input type="text" id="signup-nom" required minlength="2" autocomplete="family-name"
                style="width:100%;padding:11px;background:rgba(0,0,0,0.3);border:1px solid rgba(201,162,39,0.3);border-radius:8px;color:#fff;font-size:14px"
                placeholder="Dupont">
            </label>
          </div>
          <label>
            <span style="display:block;color:#c9a227;font-size:12px;margin-bottom:4px">Email *</span>
            <input type="email" id="signup-email" required autocomplete="email" inputmode="email"
              style="width:100%;padding:11px;background:rgba(0,0,0,0.3);border:1px solid rgba(201,162,39,0.3);border-radius:8px;color:#fff;font-size:14px"
              placeholder="marc@example.com">
          </label>
          <label>
            <span style="display:block;color:#c9a227;font-size:12px;margin-bottom:4px">Téléphone WhatsApp * (format +33xxx)</span>
            <input type="tel" id="signup-whatsapp" required autocomplete="tel" inputmode="tel" pattern="^\\+\\d{6,15}$"
              style="width:100%;padding:11px;background:rgba(0,0,0,0.3);border:1px solid rgba(201,162,39,0.3);border-radius:8px;color:#fff;font-size:14px"
              placeholder="+33612345678">
          </label>

          <div>
            <span style="display:block;color:#c9a227;font-size:12px;margin-bottom:8px">Plan souhaité *</span>
            <div id="signup-plans" style="display:grid;gap:8px">
              ${k.map((i,o)=>`
                <label style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.08);border-radius:10px;cursor:pointer">
                  <input type="radio" name="signup-plan" value="${i.id}" ${o===0?"checked":""} style="accent-color:#c9a227">
                  <div style="flex:1">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                      <strong style="color:#fff;font-size:14px">${c(i.label)}</strong>
                      <span style="color:#c9a227;font-size:13px">${c(i.price)}</span>
                    </div>
                    <div style="color:var(--ax-text-dim,#888);font-size:11px;margin-top:2px">${c(i.features.join(" · "))}</div>
                  </div>
                </label>
              `).join("")}
            </div>
          </div>

          <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:14px;display:grid;gap:8px">
            <label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer;font-size:12px;color:var(--ax-text-dim,#aaa)">
              <input type="checkbox" id="signup-cgu" required style="margin-top:2px;accent-color:#c9a227">
              <span>J'accepte les <a href="#" id="signup-link-cgu" style="color:#c9a227;text-decoration:underline">CGU</a> et la <a href="#" id="signup-link-privacy" style="color:#c9a227;text-decoration:underline">Politique de confidentialité</a></span>
            </label>
            <label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer;font-size:12px;color:var(--ax-text-dim,#aaa)">
              <input type="checkbox" id="signup-rgpd" required style="margin-top:2px;accent-color:#c9a227">
              <span>J'autorise le traitement de mes données pour la création + gestion de mon compte Apex (RGPD Art. 6.1.b contrat)</span>
            </label>
          </div>

          <button type="submit" id="signup-submit" class="ax-btn ax-btn-primary ax-btn-block" style="margin-top:8px">
            <span class="ax-btn-label">📤 Envoyer ma demande via WhatsApp</span>
            <span class="ax-spinner" aria-hidden="true" style="display:none"></span>
          </button>
        </form>

        <div id="signup-error" aria-live="polite" aria-atomic="true" style="margin-top:12px"></div>

        <div style="text-align:center;margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08)">
          <p style="color:var(--ax-text-dim,#888);font-size:12px;margin:0 0 8px">Déjà un compte ?</p>
          <button type="button" id="signup-go-login" class="ax-btn ax-btn-ghost" style="font-size:13px">← Retour à la connexion</button>
        </div>
      </div>
    </div>
  `,q(e)}function q(e){if(!a)return;const i=e.querySelector("#signup-form");i&&a.bind(i,"submit",n=>{n.preventDefault(),d.tap(),S(e)});const o=e.querySelector("#signup-go-login");o&&a.bind(o,"click",()=>{d.tap(),m.navigate("landing")});const u=e.querySelector("#signup-link-cgu");u&&a.bind(u,"click",n=>{n.preventDefault(),m.navigate("legal")});const g=e.querySelector("#signup-link-privacy");g&&a.bind(g,"click",n=>{n.preventDefault(),m.navigate("legal")})}async function S(e){const i=(e.querySelector("#signup-prenom")?.value??"").trim(),o=(e.querySelector("#signup-nom")?.value??"").trim(),u=(e.querySelector("#signup-email")?.value??"").trim(),g=(e.querySelector("#signup-whatsapp")?.value??"").trim(),n=e.querySelector('input[name="signup-plan"]:checked')?.value??"free",b=e.querySelector("#signup-cgu")?.checked??!1,y=e.querySelector("#signup-rgpd")?.checked??!1,r=e.querySelector("#signup-submit"),p=r?.querySelector(".ax-btn-label"),l=r?.querySelector(".ax-spinner"),s=e.querySelector("#signup-error");s&&(s.innerHTML=""),r&&(r.disabled=!0),p&&(p.textContent="Envoi en cours..."),l&&(l.style.display="inline-block");try{const t=await h.requestSignup({prenom:i,nom:o,email:u,whatsapp:g,plan:n,consent:{cgu:b,rgpd:y,ts:Date.now()}});if(!t.ok){d.error(),s&&(s.innerHTML=`<div class="ax-alert ax-alert-warn">⚠️ ${c(t.reason??"Erreur")}</div>`),x.error(t.reason??"Erreur"),r&&(r.disabled=!1),p&&(p.textContent="📤 Envoyer ma demande via WhatsApp"),l&&(l.style.display="none");return}d.success();try{t.requestId&&localStorage.setItem("apex_v13_signup_pending_id",t.requestId),t.inviteLink&&localStorage.setItem("apex_v13_signup_invite_link",t.inviteLink)}catch{}if(t.inviteLink)try{window.open(t.inviteLink,"_blank")}catch{}x.success("✅ Demande envoyée — ouvre WhatsApp pour valider"),setTimeout(()=>m.navigate("waiting-approval"),500)}catch(t){d.error();const f=t instanceof Error?t.message:"Erreur inattendue";s&&(s.innerHTML=`<div class="ax-alert ax-alert-error">${c(f)}</div>`),x.error(f),r&&(r.disabled=!1),p&&(p.textContent="📤 Envoyer ma demande via WhatsApp"),l&&(l.style.display="none")}}export{W as dispose,H as render};
