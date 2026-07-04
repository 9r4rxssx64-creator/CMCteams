import{b as u,l as p,e as a,a as x}from"./monitoring-D5tsr3af.js";import{c as v}from"./listener-cleanup-Y2rGGxxX.js";import{rgpd as g}from"./rgpd-DK5thsxk.js";import{haptic as o}from"./haptic-CQFg2PXZ.js";import{toast as l}from"./toast-BCPNzfMv.js";import"./multi-source-analyze-CveK6Yjo.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-ChMac__O.js";let s=null;function S(){s?.cleanup(),s=null}function f(i){if(!i)return"—";try{return new Date(i).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return"—"}}function m(i){const e=i.scopes.includes("*")?'<span style="color:#ff6b6b;font-weight:600">Globale (tous scopes)</span>':i.scopes.map(n=>`<code style="background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:4px;font-size:11px;margin-right:4px">${a(n)}</code>`).join("");return`
    <article style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,107,107,0.25);border-radius:10px;padding:14px;margin-bottom:8px">
      <div class="ax-gs-112">
        <div class="ax-gs-11">
          <strong style="color:#ff6b6b;font-size:14px">${a(i.uid)}</strong>
          <div style="margin-top:6px;font-size:12px;color:var(--ax-text-dim)">
            Scopes : ${e}
          </div>
          <div style="margin-top:4px;font-size:11px;color:#888">
            Depuis : ${a(f(i.ts))}
          </div>
        </div>
        <button
          class="ax-btn ax-rgpd-lift-btn"
          data-uid="${a(i.uid)}"
          aria-label="Lever la restriction RGPD pour ${a(i.uid)}"
          style="padding:8px 14px;font-size:13px;background:rgba(34,204,119,0.15);color:#22cc77;border:1px solid rgba(34,204,119,0.4);border-radius:8px;cursor:pointer;font-weight:600;min-height:40px"
        >
          🔓 Lever
        </button>
      </div>
    </article>
  `}async function d(i){i.innerHTML=`
    <div class="ax-gs-57">
      <p>🔍 Chargement restrictions RGPD…</p>
    </div>
  `;try{const e=g.listRestrictedUsers(),n=e.length>0?e.map(m).join(""):'<p style="color:var(--ax-text-dim);text-align:center;padding:40px">✅ Aucune restriction RGPD active.<br><span class="ax-gs-24">Tous les users peuvent traiter leurs données librement.</span></p>';i.innerHTML=`
      <div class="ax-gs-95">
        <header class="ax-gs-180">
          <h1 class="ax-gs-281">🛡 RGPD — Restrictions actives</h1>
          <p class="ax-gs-282">
            Art. 18 RGPD — droit de limitation du traitement.
            Les users en restriction ne peuvent plus que lire leurs données (pas de modif/AI/sync).
          </p>
        </header>

        <div class="ax-gs-96">
          <div class="ax-gs-99">
            <div class="ax-gs-58">${e.length}</div>
            <div class="ax-gs-5">Restrictions actives</div>
          </div>
          <div style="background:rgba(255,107,107,0.05);border:1px solid rgba(255,107,107,0.15);border-radius:10px;padding:14px">
            <div class="ax-gs-58">${e.filter(r=>r.scopes.includes("*")).length}</div>
            <div class="ax-gs-5">Globales (tous scopes)</div>
          </div>
          <div class="ax-gs-97">
            <div class="ax-gs-98">${e.filter(r=>!r.scopes.includes("*")).length}</div>
            <div class="ax-gs-5">Granulaires</div>
          </div>
        </div>

        <div class="ax-gs-100">
          <button id="ax-rgpd-refresh" class="ax-btn ax-gs-283" aria-label="Rafraîchir la liste des restrictions">🔄 Rafraîchir</button>
        </div>

        <section>
          <h2 class="ax-gs-285">⛔ Users restreints (${e.length})</h2>
          <div id="ax-rgpd-list">${n}</div>
        </section>

        <p class="ax-gs-265">
          🔒 Lift restriction = audit log immutable (rgpd.restrict.lifted) + reprise normale du traitement
        </p>
      </div>
    `,b(i)}catch(e){p.error("rgpd-admin","refresh failed",{err:e}),i.innerHTML=`
      <div class="ax-gs-101">
        <p>❌ Chargement échoué : ${a(String(e).slice(0,200))}</p>
      </div>
    `}}function b(i){if(!s)return;const e=i.querySelector("#ax-rgpd-refresh");e&&s.bind(e,"click",()=>{o.tap(),d(i)}),i.querySelectorAll(".ax-rgpd-lift-btn").forEach(r=>{s&&s.bind(r,"click",async()=>{const t=r.dataset.uid;if(!(!t||!window.confirm(`Lever la restriction RGPD pour ${t} ?

L'utilisateur retrouvera l'accès complet (modif, AI, sync).`)))try{o.medium(),g.liftRestriction(t),await x.record("rgpd.admin.lift",{actor:"admin",details:{target_uid:t,via:"vRGPDAdmin"}}),l.success(`✅ Restriction levée pour ${t}`),await d(i)}catch(c){p.error("rgpd-admin","liftRestriction failed",{err:c,uid:t}),l.error(`❌ Échec : ${String(c).slice(0,100)}`)}})})}async function H(i){if(!(u.get("isAdmin")===!0)){i.innerHTML=`
      <div class="ax-gs-21">
        <h2 class="ax-gs-266">Accès admin uniquement</h2>
        <p>Cette section est réservée à Kevin.</p>
      </div>
    `;return}s?.cleanup(),s=v("rgpd-admin"),await d(i)}export{S as dispose,H as render};
