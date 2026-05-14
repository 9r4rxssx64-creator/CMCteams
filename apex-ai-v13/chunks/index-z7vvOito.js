import{c as b}from"./listener-cleanup-Y2rGGxxX.js";import{r as l}from"../core/main-BjaowFSq.js";import{haptic as x}from"./haptic-CQFg2PXZ.js";import{toast as g}from"./toast-ClsF1KRZ.js";import"./apex-kb-CMfx-GyD.js";import"./monitoring-3uBGKGRH.js";import"./credential-patterns-D-srKehy.js";import"./multi-source-analyze-pNmlRgki.js";let n=null,i=null;function q(){n?.cleanup(),n=null,i&&(clearInterval(i),i=null)}function o(t){return t.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function c(){try{const t=localStorage.getItem("apex_v13_signup_pending_id");return t?JSON.parse(localStorage.getItem("apex_v13_signup_requests")??"[]").find(a=>a.id===t)??null:null}catch{return null}}function j(t){n?.cleanup(),n=b("waiting-approval"),s(t),i&&clearInterval(i),i=setInterval(()=>{const e=c();if(e)if(e.status==="approved"){g.success("🎉 Compte approuvé ! Tu peux te connecter.");try{localStorage.removeItem("apex_v13_signup_pending_id")}catch{}setTimeout(()=>l.navigate("landing"),1500)}else(e.status==="rejected"||e.status==="expired")&&s(t)},3e4)}function s(t){const e=c(),a=(()=>{try{return localStorage.getItem("apex_v13_signup_invite_link")??""}catch{return""}})();if(!e){t.innerHTML=`
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px">
        <div style="max-width:480px;text-align:center;color:#fff">
          <h1 style="color:#c9a227">Aucune demande en cours</h1>
          <p style="color:var(--ax-text-dim,#aaa)">Tu n'as pas de demande d'inscription en attente.</p>
          <button id="wa-back" class="ax-btn ax-btn-primary" style="margin-top:16px">← Retour à la connexion</button>
        </div>
      </div>
    `;const u=t.querySelector("#wa-back");u&&n&&n.bind(u,"click",()=>l.navigate("landing"));return}const r=`${e.prenom} ${e.nom}`,d=e.otp,m=e.expiresAt-Date.now(),v=Math.max(0,Math.ceil(m/(1440*60*1e3))),p=e.status==="approved"?{color:"#10b981",icon:"✅",label:"Approuvé"}:e.status==="rejected"?{color:"#ef4444",icon:"❌",label:"Refusé"}:e.status==="expired"?{color:"#888",icon:"⏰",label:"Expiré"}:{color:"#c9a227",icon:"⏳",label:"En attente Kevin"};t.innerHTML=`
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,#08080f 0%,#181820 100%)">
      <div style="max-width:560px;width:100%;background:rgba(20,20,35,0.92);backdrop-filter:blur(20px);border:1px solid rgba(201,162,39,0.3);border-radius:20px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
        <div style="text-align:center;margin-bottom:20px">
          <div style="font-size:42px;margin-bottom:8px">${p.icon}</div>
          <h1 style="margin:0 0 4px;color:${p.color};font-size:24px">${p.label}</h1>
          <p style="color:var(--ax-text-dim,#aaa);margin:0;font-size:14px">${o(r)}</p>
        </div>

        ${e.status==="awaiting_kevin"?`
          <div style="background:rgba(201,162,39,0.08);border:1px solid rgba(201,162,39,0.2);border-radius:12px;padding:16px;margin-bottom:16px">
            <h3 style="margin:0 0 8px;color:#c9a227;font-size:15px">📱 Ouvre WhatsApp et envoie ce code à Kevin</h3>
            <div style="background:rgba(0,0,0,0.5);border-radius:10px;padding:14px;text-align:center;font-family:'Courier New',monospace;font-size:24px;color:#c9a227;letter-spacing:2px;margin-bottom:12px">
              ${o(d)}
            </div>
            <a href="${o(a||"#")}" target="_blank" rel="noopener" id="wa-open-link"
              class="ax-btn ax-btn-primary ax-btn-block" style="text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:6px">
              💬 Ouvrir WhatsApp
            </a>
          </div>
          <div style="font-size:13px;color:var(--ax-text-dim,#aaa);line-height:1.6">
            <p style="margin:0 0 8px"><strong style="color:#fff">Étapes suivantes :</strong></p>
            <ol style="margin:0;padding-left:20px">
              <li>Ouvre WhatsApp via le bouton ci-dessus (lien pré-rempli)</li>
              <li>Envoie le message à Kevin</li>
              <li>Attends sa validation (généralement &lt; 24h)</li>
              <li>Tu recevras un message WhatsApp de confirmation</li>
              <li>Reviens ici et clique "Vérifier" ou tu seras redirigé automatiquement</li>
            </ol>
          </div>
          <p style="margin:14px 0 0;font-size:11px;color:var(--ax-text-dim,#888);text-align:center">
            Demande valide ${v}j · Vérification auto toutes les 30s
          </p>
        `:""}

        ${e.status==="rejected"?`
          <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:16px;margin-bottom:16px">
            <p style="margin:0;color:#ef4444;font-size:14px"><strong>Raison :</strong> ${o(e.rejectReason??"Non précisée")}</p>
          </div>
          <p style="color:var(--ax-text-dim,#aaa);font-size:13px;text-align:center">
            Tu peux contacter Kevin directement pour comprendre et resoumettre une demande corrigée.
          </p>
        `:""}

        ${e.status==="expired"?`
          <p style="color:var(--ax-text-dim,#aaa);font-size:13px;text-align:center;margin-bottom:16px">
            Cette demande a expiré (validité 7 jours). Tu peux soumettre une nouvelle demande.
          </p>
        `:""}

        ${e.status==="approved"?`
          <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:16px;margin-bottom:16px;text-align:center">
            <p style="margin:0;color:#10b981;font-size:14px">🎉 Bienvenue dans Apex !</p>
            <p style="margin:8px 0 0;color:var(--ax-text-dim,#aaa);font-size:12px">Connecte-toi avec ton prénom + nom + un code PIN de ton choix.</p>
          </div>
        `:""}

        <div style="display:grid;gap:8px;margin-top:16px">
          <button id="wa-check" class="ax-btn ax-btn-secondary ax-btn-block">🔄 Vérifier maintenant</button>
          <button id="wa-cancel" class="ax-btn ax-btn-ghost ax-btn-block" style="font-size:12px">${e.status==="rejected"||e.status==="expired"?"📝 Nouvelle demande":"Annuler ma demande"}</button>
          <button id="wa-back" class="ax-btn ax-btn-ghost ax-btn-block" style="font-size:12px">← Connexion</button>
        </div>
      </div>
    </div>
  `,f(t)}function f(t){if(!n)return;const e=t.querySelector("#wa-check");e&&n.bind(e,"click",()=>{x.tap(),s(t),c()?.status==="awaiting_kevin"&&g.info("Toujours en attente Kevin")});const a=t.querySelector("#wa-cancel");a&&n.bind(a,"click",()=>{x.medium();try{localStorage.removeItem("apex_v13_signup_pending_id"),localStorage.removeItem("apex_v13_signup_invite_link")}catch{}l.navigate("signup")});const r=t.querySelector("#wa-back");r&&n.bind(r,"click",()=>l.navigate("landing"))}export{q as dispose,j as render};
