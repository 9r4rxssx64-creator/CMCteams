import{e as c}from"./escape-html-BlQj2yEF.js";import{c as h}from"./listener-cleanup-Y2rGGxxX.js";import{r as x}from"../core/main-1zxfPgC1.js";import{s as k}from"./signup-BXc9BMFQ.js";import{haptic as m}from"./haptic-CQFg2PXZ.js";import{toast as b}from"./toast-CRdbcLoc.js";import"./apex-kb-BL-mRJI7.js";import"./monitoring-3uBGKGRH.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-CDRNXpkc.js";import"./auth-gate-CecefpMC.js";import"./commerce-BCyslXSZ.js";import"./auth-BAQXvZsZ.js";import"./kevin-alerts-CCw8eQKi.js";import"./whatsapp-BfmSusbQ.js";let t=null;function R(){t?.cleanup(),t=null}const q=[{id:"free",label:"🆓 Découverte",price:"0 €",features:["Chat IA basique","50 messages/jour"]},{id:"basic",label:"✨ Basic",price:"9,90 €/mois",features:["Chat illimité","Studios","Voix"]},{id:"pro",label:"💎 Pro",price:"29,90 €/mois",features:["Tout Basic","Modules pro","Coffre, IoT"]},{id:"family",label:"👨‍👩‍👧 Famille (sur invitation)",price:"Gratuit",features:["Accès complet","Validation Kevin"]}];function F(e){t?.cleanup(),t=h("signup"),e.innerHTML=`
    <div class="ax-signup" style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,#08080f 0%,#181820 100%)">
      <div class="ax-signup-card" style="max-width:560px;width:100%;background:rgba(20,20,35,0.92);backdrop-filter:blur(20px);border:1px solid rgba(201,162,39,0.3);border-radius:20px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="margin:0 0 4px;color:#c9a227;font-size:28px">📝 Créer mon compte Apex</h1>
          <p style="color:var(--ax-text-dim,#aaa);margin:0;font-size:14px">Inscription instantanée · Choisis ton code · Connecté auto</p>
        </div>

        <form id="signup-form" novalidate style="display:grid;gap:14px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label>
              <span style="display:block;color:#c9a227;font-size:12px;margin-bottom:4px">Prénom *</span>
              <input type="text" id="signup-prenom" aria-label="Prénom" required minlength="2" autocomplete="given-name"
                style="width:100%;padding:11px;background:rgba(0,0,0,0.3);border:1px solid rgba(201,162,39,0.3);border-radius:8px;color:#fff;font-size:14px"
                placeholder="Marc">
            </label>
            <label>
              <span style="display:block;color:#c9a227;font-size:12px;margin-bottom:4px">Nom *</span>
              <input type="text" id="signup-nom" aria-label="Nom de famille" required minlength="2" autocomplete="family-name"
                style="width:100%;padding:11px;background:rgba(0,0,0,0.3);border:1px solid rgba(201,162,39,0.3);border-radius:8px;color:#fff;font-size:14px"
                placeholder="Dupont">
            </label>
          </div>
          <label>
            <span style="display:block;color:#c9a227;font-size:12px;margin-bottom:4px">Email *</span>
            <input type="email" id="signup-email" aria-label="Adresse email" required autocomplete="email" inputmode="email"
              style="width:100%;padding:11px;background:rgba(0,0,0,0.3);border:1px solid rgba(201,162,39,0.3);border-radius:8px;color:#fff;font-size:14px"
              placeholder="marc@example.com">
          </label>
          <label>
            <span style="display:block;color:#c9a227;font-size:12px;margin-bottom:4px">Téléphone WhatsApp (format +33xxx)</span>
            <input type="tel" id="signup-whatsapp" aria-label="Numéro WhatsApp avec indicatif pays" autocomplete="tel" inputmode="tel" pattern="^\\+\\d{6,15}$"
              style="width:100%;padding:11px;background:rgba(0,0,0,0.3);border:1px solid rgba(201,162,39,0.3);border-radius:8px;color:#fff;font-size:14px"
              placeholder="+33612345678">
          </label>
          <label>
            <span style="display:block;color:#c9a227;font-size:12px;margin-bottom:4px">🔑 Ton code d'accès * (min 4 chiffres)</span>
            <input type="password" id="signup-pin" aria-label="Code PIN personnel pour te connecter" required minlength="4" maxlength="20" inputmode="numeric" autocomplete="new-password"
              style="width:100%;padding:11px;background:rgba(0,0,0,0.3);border:1px solid rgba(201,162,39,0.3);border-radius:8px;color:#fff;font-size:14px;letter-spacing:4px"
              placeholder="••••">
            <span style="display:block;color:var(--ax-text-dim,#888);font-size:11px;margin-top:4px">Tu utiliseras ce code à chaque connexion. Choisis-le bien.</span>
          </label>

          <div>
            <span style="display:block;color:#c9a227;font-size:12px;margin-bottom:8px">Plan souhaité *</span>
            <div id="signup-plans" style="display:grid;gap:8px">
              ${q.map((i,n)=>`
                <label style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.08);border-radius:10px;cursor:pointer">
                  <input type="radio" name="signup-plan" aria-label="Plan ${c(i.label)}" value="${i.id}" ${n===0?"checked":""} style="accent-color:#c9a227">
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
              <input type="checkbox" id="signup-cgu" aria-label="Accepter CGU et politique de confidentialité" required style="margin-top:2px;accent-color:#c9a227">
              <span>J'accepte les <a href="#" id="signup-link-cgu" style="color:#c9a227;text-decoration:underline">CGU</a> et la <a href="#" id="signup-link-privacy" style="color:#c9a227;text-decoration:underline">Politique de confidentialité</a></span>
            </label>
            <label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer;font-size:12px;color:var(--ax-text-dim,#aaa)">
              <input type="checkbox" id="signup-rgpd" aria-label="Autoriser le traitement des données RGPD" required style="margin-top:2px;accent-color:#c9a227">
              <span>J'autorise le traitement de mes données pour la création + gestion de mon compte Apex (RGPD Art. 6.1.b contrat)</span>
            </label>
          </div>

          <button type="submit" id="signup-submit" class="ax-btn ax-btn-primary ax-btn-block" style="margin-top:8px">
            <span class="ax-btn-label">🚀 Créer mon compte et me connecter</span>
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
  `,S(e)}function S(e){if(!t)return;const i=e.querySelector("#signup-form");i&&t.bind(i,"submit",r=>{r.preventDefault(),m.tap(),z(e)});const n=e.querySelector("#signup-go-login");n&&t.bind(n,"click",()=>{m.tap(),x.navigate("landing")});const g=e.querySelector("#signup-link-cgu");g&&t.bind(g,"click",r=>{r.preventDefault(),x.navigate("legal")});const d=e.querySelector("#signup-link-privacy");d&&t.bind(d,"click",r=>{r.preventDefault(),x.navigate("legal")})}async function z(e){const i=(e.querySelector("#signup-prenom")?.value??"").trim(),n=(e.querySelector("#signup-nom")?.value??"").trim(),g=(e.querySelector("#signup-email")?.value??"").trim(),d=(e.querySelector("#signup-whatsapp")?.value??"").trim(),r=(e.querySelector("#signup-pin")?.value??"").trim(),f=e.querySelector('input[name="signup-plan"]:checked')?.value??"free",y=e.querySelector("#signup-cgu")?.checked??!1,v=e.querySelector("#signup-rgpd")?.checked??!1,a=e.querySelector("#signup-submit"),o=a?.querySelector(".ax-btn-label"),l=a?.querySelector(".ax-spinner"),p=e.querySelector("#signup-error");p&&(p.innerHTML=""),a&&(a.disabled=!0),o&&(o.textContent="Création de ton compte..."),l&&(l.style.display="inline-block");try{const u={prenom:i,nom:n,email:g,pin:r,plan:f,consent:{cgu:y,rgpd:v,ts:Date.now()}};d&&(u.whatsapp=d);const s=await k.selfSignupDirect(u);if(!s.ok){m.error(),p&&(p.innerHTML=`<div class="ax-alert ax-alert-warn">⚠️ ${c(s.reason??"Erreur")}</div>`),b.error(s.reason??"Erreur"),a&&(a.disabled=!1),o&&(o.textContent="🚀 Créer mon compte et me connecter"),l&&(l.style.display="none");return}m.success(),b.success("🎉 Bienvenue ! Tu es connecté."),setTimeout(()=>x.navigate("chat"),500)}catch(u){m.error();const s=u instanceof Error?u.message:"Erreur inattendue";p&&(p.innerHTML=`<div class="ax-alert ax-alert-error">${c(s)}</div>`),b.error(s),a&&(a.disabled=!1),o&&(o.textContent="🚀 Créer mon compte et me connecter"),l&&(l.style.display="none")}}export{R as dispose,F as render};
