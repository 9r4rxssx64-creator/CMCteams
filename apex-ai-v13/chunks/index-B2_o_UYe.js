import{e as c}from"./monitoring-gdN37KLL.js";import{c as h}from"./listener-cleanup-Y2rGGxxX.js";import{r as x}from"../core/main-DiaFS3il.js";import{s as q}from"./signup-Dg7ERhD7.js";import{haptic as m}from"./haptic-CQFg2PXZ.js";import{toast as b}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-_RAvLX0s.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-DEigeGWI.js";import"./memory-Dg6nUh9q.js";import"./kevin-alerts-LHgovbn2.js";import"./whatsapp-B_hP3mXE.js";import"./auth-gate-1I4cGOmr.js";import"./auth-OsJOepWc.js";let i=null;function I(){i?.cleanup(),i=null}const k=[{id:"free",label:"🆓 Découverte",price:"0 €",features:["Chat IA basique","50 messages/jour"]},{id:"basic",label:"✨ Basic",price:"9,90 €/mois",features:["Chat illimité","Studios","Voix"]},{id:"pro",label:"💎 Pro",price:"29,90 €/mois",features:["Tout Basic","Modules pro","Coffre, IoT"]},{id:"family",label:"👨‍👩‍👧 Famille (sur invitation)",price:"Gratuit",features:["Accès complet","Validation Kevin"]}];function R(e){i?.cleanup(),i=h("signup"),e.innerHTML=`
    <div class="ax-signup ax-gs-402">
      <div class="ax-signup-card ax-gs-441">
        <div style="text-align:center;margin-bottom:24px">
          <h1 class="ax-gs-324">📝 Créer mon compte Apex</h1>
          <p class="ax-gs-442">Inscription instantanée · Choisis ton code · Connecté auto</p>
        </div>

        <form id="signup-form" novalidate style="display:grid;gap:14px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label>
              <span class="ax-gs-35">Prénom *</span>
              <input type="text" id="signup-prenom" aria-label="Prénom" required minlength="2" autocomplete="given-name"
                class="ax-gs-443"
                placeholder="Marc">
            </label>
            <label>
              <span class="ax-gs-35">Nom *</span>
              <input type="text" id="signup-nom" aria-label="Nom de famille" required minlength="2" autocomplete="family-name"
                class="ax-gs-443"
                placeholder="Dupont">
            </label>
          </div>
          <label>
            <span class="ax-gs-35">Email *</span>
            <input type="email" id="signup-email" aria-label="Adresse email" required autocomplete="email" inputmode="email"
              class="ax-gs-443"
              placeholder="marc@example.com">
          </label>
          <label>
            <span class="ax-gs-35">Téléphone WhatsApp (format +33xxx)</span>
            <input type="tel" id="signup-whatsapp" aria-label="Numéro WhatsApp avec indicatif pays" autocomplete="tel" inputmode="tel" pattern="^\\+\\d{6,15}$"
              class="ax-gs-443"
              placeholder="+33612345678">
          </label>
          <label>
            <span class="ax-gs-35">🔑 Ton code d'accès * (min 4 chiffres)</span>
            <input type="password" id="signup-pin" aria-label="Code PIN personnel pour te connecter" required minlength="4" maxlength="20" inputmode="numeric" autocomplete="new-password"
              style="width:100%;padding:11px;background:rgba(0,0,0,0.3);border:1px solid rgba(201,162,39,0.3);border-radius:8px;color:#fff;font-size:14px;letter-spacing:4px"
              placeholder="••••">
            <span style="display:block;color:var(--ax-text-dim,#888);font-size:11px;margin-top:4px">Tu utiliseras ce code à chaque connexion. Choisis-le bien.</span>
          </label>

          <div>
            <span style="display:block;color:#c9a227;font-size:12px;margin-bottom:8px">Plan souhaité *</span>
            <div id="signup-plans" class="ax-gs-251">
              ${k.map((a,s)=>`
                <label style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.08);border-radius:10px;cursor:pointer">
                  <input type="radio" name="signup-plan" aria-label="Plan ${c(a.label)}" value="${a.id}" ${s===0?"checked":""} style="accent-color:#c9a227">
                  <div class="ax-gs-26">
                    <div class="ax-gs-219">
                      <strong class="ax-gs-406">${c(a.label)}</strong>
                      <span style="color:#c9a227;font-size:13px">${c(a.price)}</span>
                    </div>
                    <div style="color:var(--ax-text-dim,#888);font-size:11px;margin-top:2px">${c(a.features.join(" · "))}</div>
                  </div>
                </label>
              `).join("")}
            </div>
          </div>

          <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:14px;display:grid;gap:8px">
            <label class="ax-gs-444">
              <input type="checkbox" id="signup-cgu" aria-label="Accepter CGU et politique de confidentialité" required class="ax-gs-252">
              <span>J'accepte les <a href="#" id="signup-link-cgu" class="ax-gs-445">CGU</a> et la <a href="#" id="signup-link-privacy" class="ax-gs-445">Politique de confidentialité</a></span>
            </label>
            <label class="ax-gs-444">
              <input type="checkbox" id="signup-rgpd" aria-label="Autoriser le traitement des données RGPD" required class="ax-gs-252">
              <span>J'autorise le traitement de mes données pour la création + gestion de mon compte Apex (RGPD Art. 6.1.b contrat)</span>
            </label>
          </div>

          <button type="submit" id="signup-submit" class="ax-btn ax-btn-primary ax-btn-block ax-gs-186">
            <span class="ax-btn-label">🚀 Créer mon compte et me connecter</span>
            <span class="ax-spinner ax-gs-234" aria-hidden="true"></span>
          </button>
        </form>

        <div id="signup-error" aria-live="polite" aria-atomic="true" class="ax-gs-248"></div>

        <div style="text-align:center;margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08)">
          <p style="color:var(--ax-text-dim,#888);font-size:12px;margin:0 0 8px">Déjà un compte ?</p>
          <button type="button" id="signup-go-login" class="ax-btn ax-btn-ghost ax-gs-398">← Retour à la connexion</button>
        </div>
      </div>
    </div>
  `,S(e)}function S(e){if(!i)return;const a=e.querySelector("#signup-form");a&&i.bind(a,"submit",n=>{n.preventDefault(),m.tap(),C(e)});const s=e.querySelector("#signup-go-login");s&&i.bind(s,"click",()=>{m.tap(),x.navigate("landing")});const g=e.querySelector("#signup-link-cgu");g&&i.bind(g,"click",n=>{n.preventDefault(),x.navigate("legal")});const u=e.querySelector("#signup-link-privacy");u&&i.bind(u,"click",n=>{n.preventDefault(),x.navigate("legal")})}async function C(e){const a=(e.querySelector("#signup-prenom")?.value??"").trim(),s=(e.querySelector("#signup-nom")?.value??"").trim(),g=(e.querySelector("#signup-email")?.value??"").trim(),u=(e.querySelector("#signup-whatsapp")?.value??"").trim(),n=(e.querySelector("#signup-pin")?.value??"").trim(),f=e.querySelector('input[name="signup-plan"]:checked')?.value??"free",y=e.querySelector("#signup-cgu")?.checked??!1,v=e.querySelector("#signup-rgpd")?.checked??!1,t=e.querySelector("#signup-submit"),r=t?.querySelector(".ax-btn-label"),l=t?.querySelector(".ax-spinner"),o=e.querySelector("#signup-error");o&&(o.innerHTML=""),t&&(t.disabled=!0),r&&(r.textContent="Création de ton compte..."),l&&(l.style.display="inline-block");try{const d={prenom:a,nom:s,email:g,pin:n,plan:f,consent:{cgu:y,rgpd:v,ts:Date.now()}};u&&(d.whatsapp=u);const p=await q.selfSignupDirect(d);if(!p.ok){m.error(),o&&(o.innerHTML=`<div class="ax-alert ax-alert-warn">⚠️ ${c(p.reason??"Erreur")}</div>`),b.error(p.reason??"Erreur"),t&&(t.disabled=!1),r&&(r.textContent="🚀 Créer mon compte et me connecter"),l&&(l.style.display="none");return}m.success(),b.success("🎉 Bienvenue ! Tu es connecté."),setTimeout(()=>x.navigate("chat"),500)}catch(d){m.error();const p=d instanceof Error?d.message:"Erreur inattendue";o&&(o.innerHTML=`<div class="ax-alert ax-alert-error">${c(p)}</div>`),b.error(p),t&&(t.disabled=!1),r&&(r.textContent="🚀 Créer mon compte et me connecter"),l&&(l.style.display="none")}}export{I as dispose,R as render};
