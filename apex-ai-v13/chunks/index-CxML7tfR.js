import{l as f,b as m,e as l}from"./monitoring-DrYio7_k.js";import{c as v}from"./listener-cleanup-Y2rGGxxX.js";import{r as h}from"../core/main-Dorhhd3b.js";import{haptic as d}from"./haptic-CQFg2PXZ.js";import{toast as p}from"./toast-CRdbcLoc.js";import"./multi-source-analyze-ZZ2u9mng.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-CxlqDgaN.js";let o=null,s=1;const g=5,a={name:"",permissionsRequested:!1,capabilities:new Set(["chat","voice","studios"]),mode:"both",done:!1},y=[{id:"chat",label:"💬 Chat IA",desc:"Conversation Claude"},{id:"voice",label:"🎙 Voix",desc:"Dictée + lecture"},{id:"studios",label:"🎨 Studios",desc:"Music/Video/Logo"},{id:"browser",label:"🌐 Browser",desc:"Navigation embed"},{id:"pro",label:"💼 Pro modules",desc:"Cuisine/Médical/Légal"},{id:"crypto",label:"🪙 Crypto",desc:"Wallets + tracking"},{id:"domotique",label:"🏠 Domotique",desc:"Maison connectée"},{id:"remote",label:"📺 Remote TV",desc:"Télécommande univ."}];function B(){o?.cleanup(),o=null}function L(e){if(!e||e==="kdmc_admin")return!1;try{return localStorage.getItem(`apex_v13_onboarding_done_${e}`)!=="true"}catch{return!1}}function S(e){try{localStorage.setItem(`apex_v13_onboarding_done_${e}`,"true"),a.done=!0,f.info("onboarding",`Marked done for uid=${e}`)}catch{}}async function N(e){o?.cleanup(),o=v("onboarding");const t=m.get("user");t?.name&&(a.name=t.name),c(e)}function c(e){const t=`
    <div class="ax-onboarding ax-gs-402">
      <div class="ax-onboarding-card" style="max-width:540px;width:100%;background:rgba(20,20,35,0.85);backdrop-filter:blur(20px);border:1px solid rgba(201,162,39,0.3);border-radius:20px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
        ${k()}
        ${$(s)}
        ${A()}
      </div>
    </div>
  `;e.innerHTML=t,q(e,s)}function k(){return`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <div class="ax-gs-88">
        ${Array.from({length:g},(e,t)=>`
          <div style="width:32px;height:4px;border-radius:2px;background:${t+1<=s?"#c9a227":"rgba(255,255,255,0.15)"};transition:background 0.3s"></div>
        `).join("")}
      </div>
      <button id="ax-onboarding-skip" class="ax-btn ax-btn-ghost" style="font-size:12px;padding:6px 12px">Passer</button>
    </div>
    <div style="font-size:11px;color:var(--ax-text-dim,#888);margin-bottom:8px">Étape ${s} / ${g}</div>
  `}function $(e){switch(e){case 1:return`
        <h1 style="margin:0 0 8px;color:#c9a227;font-size:28px">Bienvenue ${a.name?l(a.name):""}</h1>
        <p style="color:var(--ax-text-dim,#aaa);margin:0 0 24px;font-size:15px;line-height:1.6">
          Apex est ton assistant IA personnel. Configurons-le ensemble en moins de 2 min.
        </p>
        <label class="ax-gs-403">
          <span style="display:block;color:#c9a227;font-size:13px;margin-bottom:6px">Comment dois-je t'appeler ?</span>
          <input type="text" id="ax-onboarding-name" aria-label="Ton prénom" value="${l(a.name)}" placeholder="Ton prénom" style="width:100%;padding:12px;background:rgba(0,0,0,0.3);border:1px solid rgba(201,162,39,0.3);border-radius:10px;color:#fff;font-size:15px">
        </label>
        <p style="color:var(--ax-text-dim,#888);font-size:12px;margin:0">
          🔒 Tes données restent sur ton appareil. Apex est local-first.
        </p>
      `;case 2:return`
        <h1 class="ax-gs-404">🔓 Permissions device</h1>
        <p class="ax-gs-405">
          Pour utiliser toutes les capacités d'Apex, autorise :
        </p>
        <div style="display:grid;gap:10px;margin-bottom:20px">
          <div class="ax-gs-68">
            <strong class="ax-gs-406">🔔 Notifications</strong>
            <div class="ax-gs-69">Alertes urgentes (sentinelles, messages)</div>
          </div>
          <div class="ax-gs-68">
            <strong class="ax-gs-406">🎙 Microphone</strong>
            <div class="ax-gs-69">Dictée vocale + wake word "Dis Apex"</div>
          </div>
          <div class="ax-gs-68">
            <strong class="ax-gs-406">📷 Caméra</strong>
            <div class="ax-gs-69">Scan QR / OCR / Vision IA</div>
          </div>
        </div>
        <button id="ax-onboarding-grant-perms" class="ax-btn ax-btn-primary ax-btn-block" style="margin-bottom:8px">Autoriser tout</button>
        <p style="color:var(--ax-text-dim,#888);font-size:11px;margin:0;text-align:center">
          Tu peux révoquer à tout moment dans Réglages.
        </p>
      `;case 3:return`
        <h1 class="ax-gs-404">✨ Tes compétences IA</h1>
        <p class="ax-gs-405">
          Active les modules qui t'intéressent (réversible) :
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px" id="ax-onboarding-capabilities">
          ${y.map(t=>`
            <button class="ax-onboarding-cap" data-cap="${t.id}" style="
              text-align:left;padding:12px;background:${a.capabilities.has(t.id)?"rgba(201,162,39,0.2)":"rgba(0,0,0,0.2)"};
              border:1px solid ${a.capabilities.has(t.id)?"#c9a227":"rgba(255,255,255,0.1)"};
              border-radius:10px;cursor:pointer;color:#fff;transition:all 0.2s">
              <div style="font-size:14px;font-weight:600">${l(t.label)}</div>
              <div style="font-size:11px;color:var(--ax-text-dim,#aaa);margin-top:2px">${l(t.desc)}</div>
            </button>
          `).join("")}
        </div>
      `;case 4:return`
        <h1 class="ax-gs-404">🎭 Sérieux ou Fun ?</h1>
        <p class="ax-gs-407">
          Mode dual : pro + ludique partout. Choisis ton défaut :
        </p>
        <div style="display:grid;gap:12px;margin-bottom:16px">
          <button class="ax-mode-choice" data-mode="serious" style="
            padding:16px;background:${a.mode==="serious"?"rgba(201,162,39,0.2)":"rgba(0,0,0,0.2)"};
            border:1px solid ${a.mode==="serious"?"#c9a227":"rgba(255,255,255,0.1)"};
            border-radius:12px;cursor:pointer;color:#fff;text-align:left">
            <strong class="ax-gs-408">⚙️ Sérieux (par défaut)</strong>
            <div class="ax-gs-70">Réponses pro, sources officielles, expertise</div>
          </button>
          <button class="ax-mode-choice" data-mode="fun" style="
            padding:16px;background:${a.mode==="fun"?"rgba(201,162,39,0.2)":"rgba(0,0,0,0.2)"};
            border:1px solid ${a.mode==="fun"?"#c9a227":"rgba(255,255,255,0.1)"};
            border-radius:12px;cursor:pointer;color:#fff;text-align:left">
            <strong class="ax-gs-408">🎉 Fun (par défaut)</strong>
            <div class="ax-gs-70">Voix rigolotes, blagues, memes</div>
          </button>
          <button class="ax-mode-choice" data-mode="both" style="
            padding:16px;background:${a.mode==="both"?"rgba(201,162,39,0.2)":"rgba(0,0,0,0.2)"};
            border:1px solid ${a.mode==="both"?"#c9a227":"rgba(255,255,255,0.1)"};
            border-radius:12px;cursor:pointer;color:#fff;text-align:left">
            <strong class="ax-gs-408">🌈 Les deux (recommandé)</strong>
            <div class="ax-gs-70">Toggle dans chaque outil. Surprise mode 🎲 dispo.</div>
          </button>
        </div>
      `;case 5:return`
        <h1 class="ax-gs-404">🚀 Tour rapide</h1>
        <p class="ax-gs-407">
          3 zones clés à connaître :
        </p>
        <div style="display:grid;gap:12px;margin-bottom:20px">
          <div class="ax-gs-71">
            <strong class="ax-gs-409">💬 Chat</strong>
            <div class="ax-gs-72">Pose une question, demande un studio, dicte. Apex sort l'outil adapté automatiquement.</div>
          </div>
          <div class="ax-gs-71">
            <strong class="ax-gs-409">🔐 Coffre</strong>
            <div class="ax-gs-72">Tes clés API, tokens, paiements. Chiffrement AES-GCM 256.</div>
          </div>
          <div class="ax-gs-71">
            <strong class="ax-gs-409">🎨 Studios</strong>
            <div class="ax-gs-72">15 studios créatifs (musique, vidéo, archi, etc.). Apparaissent dans le chat selon le contexte.</div>
          </div>
        </div>
        <p style="color:var(--ax-text-dim,#888);font-size:12px;margin:0;text-align:center">
          🎯 Apex apprend de chaque conversation. Plus tu l'utilises, plus il te connaît.
        </p>
      `;default:return"<p>Étape inconnue</p>"}}function A(){return`
    <div style="display:flex;gap:8px;margin-top:24px">
      ${s===1?"":'<button id="ax-onboarding-prev" class="ax-btn ax-btn-secondary" style="flex:1">← Retour</button>'}
      <button id="ax-onboarding-next" class="ax-btn ax-btn-primary" style="flex:2">${s===g?"✅ Terminer":"Suivant →"}</button>
    </div>
  `}function q(e,t){if(!o)return;const n=e.querySelector("#ax-onboarding-skip");n&&o.bind(n,"click",()=>{d.tap(),b()});const u=e.querySelector("#ax-onboarding-next");u&&o.bind(u,"click",()=>{d.tap(),T(e)});const x=e.querySelector("#ax-onboarding-prev");if(x&&o.bind(x,"click",()=>{d.tap(),s=Math.max(1,s-1),c(e)}),t===1){const i=e.querySelector("#ax-onboarding-name");i&&o.bind(i,"input",()=>{a.name=i.value.trim()})}else if(t===2){const i=e.querySelector("#ax-onboarding-grant-perms");i&&o.bind(i,"click",()=>{w()})}else t===3?e.querySelectorAll(".ax-onboarding-cap").forEach(i=>{o.bind(i,"click",()=>{const r=i.dataset.cap;r&&(a.capabilities.has(r)?a.capabilities.delete(r):a.capabilities.add(r),d.tap(),c(e))})}):t===4&&e.querySelectorAll(".ax-mode-choice").forEach(i=>{o.bind(i,"click",()=>{const r=i.dataset.mode;r&&(a.mode=r,d.tap(),c(e))})})}function T(e){if(s===1){if(!a.name||a.name.length<2){p.warn("Tape ton prénom (min 2 caractères)");return}try{localStorage.setItem("apex_v13_user_name",a.name)}catch{}}else if(s===3)try{localStorage.setItem("apex_v13_capabilities",JSON.stringify([...a.capabilities]))}catch{}else if(s===4)try{localStorage.setItem("ax_mode_dual",a.mode)}catch{}if(s===g){b();return}s++,c(e)}async function w(){a.permissionsRequested=!0;let e=0;if(typeof Notification<"u")try{await Notification.requestPermission()==="granted"&&e++}catch{}if(typeof navigator<"u"&&navigator.mediaDevices?.getUserMedia)try{(await navigator.mediaDevices.getUserMedia({audio:!0})).getTracks().forEach(n=>n.stop()),e++}catch{}if(typeof navigator<"u"&&navigator.mediaDevices?.getUserMedia)try{(await navigator.mediaDevices.getUserMedia({video:!0})).getTracks().forEach(n=>n.stop()),e++}catch{}e>0?p.success(`✅ ${e} permission${e>1?"s":""} accordée${e>1?"s":""}`):p.info("Tu pourras autoriser plus tard dans Réglages")}function b(){const e=m.get("user");e?.id&&S(e.id),p.success("🚀 Bienvenue dans Apex !"),setTimeout(()=>h.navigate("chat"),300)}export{B as dispose,L as isOnboardingNeeded,S as markOnboardingDone,N as render};
