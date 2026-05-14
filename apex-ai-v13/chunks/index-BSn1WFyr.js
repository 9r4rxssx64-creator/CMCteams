import{c as y}from"./listener-cleanup-Y2rGGxxX.js";import{l as b}from"./monitoring-3uBGKGRH.js";import{c as k}from"./csp-style-helper-BisGRi53.js";import{rgpd as p}from"./rgpd-xK_eQN8E.js";import"./apex-kb-BfnoPN_c.js";import"./credential-patterns-qcw7Brjr.js";let i=null;function L(){i?.cleanup(),i=null}const x=[{id:"cgu",label:"CGU",file:"cgu",emoji:"📜"},{id:"cgv",label:"CGV",file:"cgv",emoji:"💳"},{id:"privacy",label:"Confidentialité",file:"privacy-policy",emoji:"🔒"},{id:"cookies",label:"Cookies",file:"cookie-policy",emoji:"🍪"},{id:"dpa",label:"DPA",file:"data-processing-agreement",emoji:"🤝"},{id:"mentions",label:"Mentions légales",file:"mentions-legales",emoji:"🏛️"},{id:"rgpd",label:"Mes données",file:"",emoji:"⚙️"}];function d(t){return t.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function $(t){let e=d(t);return e=e.replace(/^###### (.+)$/gm,"<h6>$1</h6>"),e=e.replace(/^##### (.+)$/gm,"<h5>$1</h5>"),e=e.replace(/^#### (.+)$/gm,"<h4>$1</h4>"),e=e.replace(/^### (.+)$/gm,"<h3>$1</h3>"),e=e.replace(/^## (.+)$/gm,"<h2>$1</h2>"),e=e.replace(/^# (.+)$/gm,"<h1>$1</h1>"),e=e.replace(/^&gt; (.+)$/gm,"<blockquote>$1</blockquote>"),e=e.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),e=e.replace(/\*([^*]+)\*/g,"<em>$1</em>"),e=e.replace(/`([^`]+)`/g,"<code>$1</code>"),e=e.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'),e=e.replace(/^- (.+)$/gm,"<li>$1</li>"),e=e.replace(/(<li>.*?<\/li>(\n|$))+/gs,n=>`<ul>${n.replace(/\n/g,"")}</ul>`),e=e.replace(/^\|(.+)\|\s*\n\|[\s|:-]+\|\s*\n((?:\|.+\|\s*\n?)+)/gm,(n,o,s)=>{const c=o.split("|").map(a=>a.trim()).filter(Boolean),g=s.trim().split(`
`).map(a=>a.split("|").map(m=>m.trim()).filter(Boolean)),r=c.map(a=>`<th>${a}</th>`).join(""),l=g.map(a=>`<tr>${a.map(m=>`<td>${m}</td>`).join("")}</tr>`).join("");return`<table><thead><tr>${r}</tr></thead><tbody>${l}</tbody></table>`}),e=e.replace(/^---$/gm,"<hr/>"),e=e.replace(/\n\n+/g,"</p><p>"),e=`<p>${e}</p>`,e=e.replace(/<p>(<h[1-6]>)/g,"$1"),e=e.replace(/(<\/h[1-6]>)<\/p>/g,"$1"),e=e.replace(/<p>(<ul>|<table>|<blockquote>|<hr\/>)/g,"$1"),e=e.replace(/(<\/ul>|<\/table>|<\/blockquote>)<\/p>/g,"$1"),e}async function w(t){if(!t)return"";try{const e=await fetch(`/docs/legal/${t}.md`,{signal:AbortSignal.timeout(5e3)});if(e.ok)return await e.text()}catch(e){b.warn("feature-legal",`Failed to load doc ${t}`,{err:e})}return`# Document indisponible

Le document **${t}** est temporairement indisponible. Réessaie plus tard ou contacte kevin.desarzens@gmail.com.`}function f(t){return x.map(e=>{const n=e.id===t,o=`padding:10px 14px;font-size:13px;font-weight:600;border-radius:8px;cursor:pointer;background:${n?"rgba(232,184,48,0.18)":"rgba(255,255,255,0.03)"};color:${n?"#e8b830":"rgba(255,255,255,0.7)"};border:1px solid ${n?"rgba(232,184,48,0.4)":"rgba(255,255,255,0.05)"};transition:all 180ms`;return`<button class="ax-legal-tab" data-tab="${d(e.id)}" style="${o}">${e.emoji} ${d(e.label)}</button>`}).join("")}function v(){const t=p.showCookieBanner(),e=p.hasConsent("analytics"),n=p.hasConsent("marketing");return`
    <h2>⚙️ Mes données RGPD</h2>
    <p>Tu peux exercer tes droits RGPD (Art. 15-22) directement depuis cette page.</p>

    <h3>📤 Export de mes données (Art. 15)</h3>
    <p>Télécharge toutes tes données au format JSON portable.</p>
    <button id="ax-rgpd-export" class="ax-btn" style="padding:12px 16px;background:rgba(106,138,255,0.18);color:#6a8aff;border:1px solid rgba(106,138,255,0.4);border-radius:10px;font-weight:600;cursor:pointer">📤 Exporter mes données</button>

    <h3>🗑 Suppression de compte (Art. 17)</h3>
    <p>Supprime définitivement ton compte et toutes tes données (cascade localStorage + Firebase + IndexedDB). Audit log final immutable conservé 5 ans (obligation légale).</p>
    <button id="ax-rgpd-delete" class="ax-btn" style="padding:12px 16px;background:rgba(255,91,91,0.18);color:#ff5b5b;border:1px solid rgba(255,91,91,0.4);border-radius:10px;font-weight:600;cursor:pointer">🗑 Supprimer mon compte</button>

    <h3>🍪 Préférences cookies</h3>
    <p>Statut consentement : <strong>${t.shouldShow?"🟠 À configurer":"✅ Configuré"}</strong></p>
    <p>Cookies analytics : <strong>${e?"✅ Acceptés":"❌ Refusés"}</strong></p>
    <p>Cookies marketing : <strong>${n?"✅ Acceptés":"❌ Refusés"}</strong></p>
    <button id="ax-rgpd-cookies-customize" class="ax-btn" style="padding:12px 16px;background:rgba(232,184,48,0.18);color:#e8b830;border:1px solid rgba(232,184,48,0.4);border-radius:10px;font-weight:600;cursor:pointer">🍪 Modifier mes préférences cookies</button>

    <h3>🚫 Opt-out (Art. 21 + 22)</h3>
    <p>Refuser amélioration modèles IA avec mes données :</p>
    <button id="ax-rgpd-optout-training" class="ax-btn" style="padding:10px 14px;background:rgba(34,204,119,0.18);color:#22cc77;border:1px solid rgba(34,204,119,0.4);border-radius:10px;font-weight:600;cursor:pointer;margin-bottom:8px">🚫 Opt-out IA training (Art. 21)</button>
    <p>Opposition au profilage automatisé :</p>
    <button id="ax-rgpd-optout-automation" class="ax-btn" style="padding:10px 14px;background:rgba(160,96,255,0.18);color:#a060ff;border:1px solid rgba(160,96,255,0.4);border-radius:10px;font-weight:600;cursor:pointer">🚫 Opt-out automation (Art. 22)</button>

    <h3>📋 Registre des traitements (Art. 30)</h3>
    <div id="ax-rgpd-registry" style="background:rgba(255,255,255,0.02);padding:12px;border-radius:8px;font-size:13px"></div>

    <h3>📞 Contacter le DPO</h3>
    <p>Pour toute question RGPD, contacte le Délégué à la Protection des Données :</p>
    <p><strong>Email :</strong> <a href="mailto:kevin.desarzens@gmail.com">kevin.desarzens@gmail.com</a></p>
    <p>Délai de réponse : 30 jours maximum (extensible 60j si demande complexe).</p>

    <h3>⚖️ Recours CNIL</h3>
    <p>En cas de désaccord, tu peux saisir la CNIL :</p>
    <p><a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">https://www.cnil.fr/fr/plaintes</a></p>
  `}function u(){try{const t=localStorage.getItem("apex_v13_user");return t?JSON.parse(t).id??"":""}catch{return""}}function S(t,e){const n=URL.createObjectURL(t),o=document.createElement("a");o.href=n,o.download=e,o.style.display="none",document.body.appendChild(o),o.click(),setTimeout(()=>{URL.revokeObjectURL(n),o.remove()},1e3)}function A(t){const e=t.querySelector("#ax-rgpd-registry");if(e){const r=p.getProcessingRegistry();e.innerHTML=r.map(l=>`
      <div style="margin-bottom:10px;padding:8px;background:rgba(255,255,255,0.03);border-radius:6px">
        <strong>${d(l.finalite)}</strong>
        <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:4px">
          Données : ${l.donnees.map(a=>d(a)).join(", ")}<br/>
          Base légale : ${d(l.baseLegale)}<br/>
          Durée : ${d(l.duree)}<br/>
          Destinataires : ${l.destinataires.map(a=>d(a)).join(", ")}
        </div>
      </div>
    `).join("")}const n=t.querySelector("#ax-rgpd-export");n&&i&&i.bind(n,"click",()=>{(async()=>{try{const r=u();if(!r){alert("Tu dois être connecté pour exporter tes données.");return}const l=await p.portableExport(r);S(l,`apex-data-${r}-${Date.now()}.json`)}catch(r){b.warn("feature-legal","Export failed",{err:r}),alert("Export échoué. Réessaie ou contacte le support.")}})()});const o=t.querySelector("#ax-rgpd-delete");o&&i&&i.bind(o,"click",()=>{(async()=>{const r=u();if(!r){alert("Tu dois être connecté pour supprimer ton compte.");return}if(confirm("Confirmer la suppression définitive de ton compte ? Cette action est IRRÉVERSIBLE."))try{const a=await p.deleteUserData(r,!0);a.ok?(alert(`Compte supprimé. ${a.deletedKeys.length} clés effacées. Audit log conservé.`),location.hash="#login"):alert(`Suppression partielle : ${a.failures.join(", ")}`)}catch(a){b.warn("feature-legal","Delete failed",{err:a}),alert("Suppression échouée. Contacte le support.")}})()});const s=t.querySelector("#ax-rgpd-cookies-customize");s&&i&&i.bind(s,"click",()=>{const r=confirm("Cookies analytics (anonymisés) — accepter ?"),l=confirm("Cookies marketing — accepter ? (non utilisés actuellement)");p.setConsent({analytics:r,marketing:l,preferences:!0}),alert("Préférences cookies enregistrées. Recharge la page pour voir l'effet.")});const c=t.querySelector("#ax-rgpd-optout-training");c&&i&&i.bind(c,"click",()=>{const r=u();if(!r){alert("Tu dois être connecté.");return}p.optOutAITraining(r,!0),alert("Opt-out IA training enregistré.")});const g=t.querySelector("#ax-rgpd-optout-automation");g&&i&&i.bind(g,"click",()=>{const r=u();if(!r){alert("Tu dois être connecté.");return}p.optOutAutomation(r,!0),alert("Opt-out automation Art. 22 enregistré.")})}async function h(t,e){const n=x.find(c=>c.id===e);if(!n)return;const o=t.querySelector("#ax-legal-content");if(!o)return;if(n.id==="rgpd"){o.innerHTML=v(),A(o);return}o.innerHTML='<p style="color:rgba(255,255,255,0.5);font-style:italic">Chargement…</p>';const s=await w(n.file);o.innerHTML=$(s)}function z(t){i?.cleanup(),i=y("legal");const e=location.hash.replace(/^#legal\/?/,"").split("/")[0]||"cgu",n=x.find(o=>o.id===e)?e:"cgu";t.innerHTML=k.withNonce(`
    <style>
      .ax-legal-content {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        line-height: 1.65;
        color: rgba(255,255,255,0.85);
      }
      .ax-legal-content h1, .ax-legal-content h2, .ax-legal-content h3, .ax-legal-content h4 {
        color: #e8b830;
        margin-top: 24px;
      }
      .ax-legal-content h1 { font-size: 26px; }
      .ax-legal-content h2 { font-size: 20px; }
      .ax-legal-content h3 { font-size: 16px; }
      .ax-legal-content table {
        width: 100%; border-collapse: collapse; margin: 12px 0;
      }
      .ax-legal-content th, .ax-legal-content td {
        padding: 8px; border: 1px solid rgba(255,255,255,0.1); text-align: left;
        font-size: 13px;
      }
      .ax-legal-content th {
        background: rgba(232,184,48,0.1); color: #e8b830;
      }
      .ax-legal-content blockquote {
        border-left: 3px solid #e8b830; padding-left: 12px;
        color: rgba(255,255,255,0.7); font-style: italic; margin: 8px 0;
      }
      .ax-legal-content code {
        background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px;
        font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 12px;
      }
      .ax-legal-content a { color: #e8b830; }
      .ax-legal-content ul { padding-left: 20px; }
      .ax-legal-content hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 16px 0; }
    </style>
    <div style="max-width:880px;margin:0 auto;padding:24px 16px max(24px, env(safe-area-inset-bottom)) 16px">
      <header style="margin-bottom:24px">
        <h1 style="margin:0 0 6px;font-size:clamp(24px,4.5vw,30px);font-weight:700;background:linear-gradient(135deg,#c9a227 0%,#e8b830 50%,#f5cc4a 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:Georgia,serif;letter-spacing:-0.025em">⚖️ Documents légaux</h1>
        <p style="color:rgba(255,255,255,0.55);margin:0;font-size:14px">Conformité RGPD + EU + France/Monaco</p>
      </header>

      <div id="ax-legal-tabs" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px">
        ${f(n)}
      </div>

      <div id="ax-legal-content" class="ax-legal-content"></div>

      <p style="margin-top:32px;text-align:center">
        <a href="#chat" style="color:#e8b830;text-decoration:none;font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:rgba(232,184,48,0.08);border-radius:24px;border:1px solid rgba(232,184,48,0.2)">← Retour</a>
      </p>
    </div>
  `),h(t,n),t.querySelectorAll(".ax-legal-tab").forEach(o=>{i.bind(o,"click",()=>{const s=o.getAttribute("data-tab");if(!s)return;const c=t.querySelector("#ax-legal-tabs");c&&(c.innerHTML=f(s),t.querySelectorAll(".ax-legal-tab").forEach(g=>{i.bind(g,"click",()=>{const r=g.getAttribute("data-tab");r&&(location.hash=`#legal/${r}`)})})),h(t,s);try{history.replaceState(null,"",`#legal/${s}`)}catch{}})}),b.info("feature-legal","rendered",{tab:n})}export{L as dispose,z as render};
