import{e as l}from"./escape-html-BlQj2yEF.js";import{c as b}from"./listener-cleanup-Y2rGGxxX.js";import{l as v,s as m}from"./monitoring-D2lWYrYo.js";import{r as y}from"../core/main-B4DExc5S.js";import{haptic as d}from"./haptic-CQFg2PXZ.js";import{toast as p}from"./toast-CRdbcLoc.js";import"./multi-source-analyze-Bg1HHfSC.js";import"./apex-kb-D1VtWFD9.js";import"./credential-patterns-CLzI061R.js";let s=null,i=1;const u=5,t={name:"",permissionsRequested:!1,capabilities:new Set(["chat","voice","studios"]),mode:"both",done:!1},h=[{id:"chat",label:"💬 Chat IA",desc:"Conversation Claude"},{id:"voice",label:"🎙 Voix",desc:"Dictée + lecture"},{id:"studios",label:"🎨 Studios",desc:"Music/Video/Logo"},{id:"browser",label:"🌐 Browser",desc:"Navigation embed"},{id:"pro",label:"💼 Pro modules",desc:"Cuisine/Médical/Légal"},{id:"crypto",label:"🪙 Crypto",desc:"Wallets + tracking"},{id:"domotique",label:"🏠 Domotique",desc:"Maison connectée"},{id:"remote",label:"📺 Remote TV",desc:"Télécommande univ."}];function L(){s?.cleanup(),s=null}function N(e){if(!e||e==="kdmc_admin")return!1;try{return localStorage.getItem(`apex_v13_onboarding_done_${e}`)!=="true"}catch{return!1}}function S(e){try{localStorage.setItem(`apex_v13_onboarding_done_${e}`,"true"),t.done=!0,v.info("onboarding",`Marked done for uid=${e}`)}catch{}}async function O(e){s?.cleanup(),s=b("onboarding");const a=m.get("user");a?.name&&(t.name=a.name),c(e)}function c(e){const a=`
    <div class="ax-onboarding" style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,#08080f 0%,#181820 100%)">
      <div class="ax-onboarding-card" style="max-width:540px;width:100%;background:rgba(20,20,35,0.85);backdrop-filter:blur(20px);border:1px solid rgba(201,162,39,0.3);border-radius:20px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
        ${k()}
        ${z(i)}
        ${$()}
      </div>
    </div>
  `;e.innerHTML=a,A(e,i)}function k(){return`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <div class="ax-gs-88">
        ${Array.from({length:u},(e,a)=>`
          <div style="width:32px;height:4px;border-radius:2px;background:${a+1<=i?"#c9a227":"rgba(255,255,255,0.15)"};transition:background 0.3s"></div>
        `).join("")}
      </div>
      <button id="ax-onboarding-skip" class="ax-btn ax-btn-ghost" style="font-size:12px;padding:6px 12px">Passer</button>
    </div>
    <div style="font-size:11px;color:var(--ax-text-dim,#888);margin-bottom:8px">Étape ${i} / ${u}</div>
  `}function z(e){switch(e){case 1:return`
        <h1 style="margin:0 0 8px;color:#c9a227;font-size:28px">Bienvenue ${t.name?l(t.name):""}</h1>
        <p style="color:var(--ax-text-dim,#aaa);margin:0 0 24px;font-size:15px;line-height:1.6">
          Apex est ton assistant IA personnel. Configurons-le ensemble en moins de 2 min.
        </p>
        <label style="display:block;margin-bottom:16px">
          <span style="display:block;color:#c9a227;font-size:13px;margin-bottom:6px">Comment dois-je t'appeler ?</span>
          <input type="text" id="ax-onboarding-name" aria-label="Ton prénom" value="${l(t.name)}" placeholder="Ton prénom" style="width:100%;padding:12px;background:rgba(0,0,0,0.3);border:1px solid rgba(201,162,39,0.3);border-radius:10px;color:#fff;font-size:15px">
        </label>
        <p style="color:var(--ax-text-dim,#888);font-size:12px;margin:0">
          🔒 Tes données restent sur ton appareil. Apex est local-first.
        </p>
      `;case 2:return`
        <h1 style="margin:0 0 8px;color:#c9a227;font-size:24px">🔓 Permissions device</h1>
        <p style="color:var(--ax-text-dim,#aaa);margin:0 0 16px;font-size:14px">
          Pour utiliser toutes les capacités d'Apex, autorise :
        </p>
        <div style="display:grid;gap:10px;margin-bottom:20px">
          <div class="ax-gs-68">
            <strong style="color:#fff;font-size:14px">🔔 Notifications</strong>
            <div class="ax-gs-69">Alertes urgentes (sentinelles, messages)</div>
          </div>
          <div class="ax-gs-68">
            <strong style="color:#fff;font-size:14px">🎙 Microphone</strong>
            <div class="ax-gs-69">Dictée vocale + wake word "Dis Apex"</div>
          </div>
          <div class="ax-gs-68">
            <strong style="color:#fff;font-size:14px">📷 Caméra</strong>
            <div class="ax-gs-69">Scan QR / OCR / Vision IA</div>
          </div>
        </div>
        <button id="ax-onboarding-grant-perms" class="ax-btn ax-btn-primary ax-btn-block" style="margin-bottom:8px">Autoriser tout</button>
        <p style="color:var(--ax-text-dim,#888);font-size:11px;margin:0;text-align:center">
          Tu peux révoquer à tout moment dans Réglages.
        </p>
      `;case 3:return`
        <h1 style="margin:0 0 8px;color:#c9a227;font-size:24px">✨ Tes compétences IA</h1>
        <p style="color:var(--ax-text-dim,#aaa);margin:0 0 16px;font-size:14px">
          Active les modules qui t'intéressent (réversible) :
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px" id="ax-onboarding-capabilities">
          ${h.map(a=>`
            <button class="ax-onboarding-cap" data-cap="${a.id}" style="
              text-align:left;padding:12px;background:${t.capabilities.has(a.id)?"rgba(201,162,39,0.2)":"rgba(0,0,0,0.2)"};
              border:1px solid ${t.capabilities.has(a.id)?"#c9a227":"rgba(255,255,255,0.1)"};
              border-radius:10px;cursor:pointer;color:#fff;transition:all 0.2s">
              <div style="font-size:14px;font-weight:600">${l(a.label)}</div>
              <div style="font-size:11px;color:var(--ax-text-dim,#aaa);margin-top:2px">${l(a.desc)}</div>
            </button>
          `).join("")}
        </div>
      `;case 4:return`
        <h1 style="margin:0 0 8px;color:#c9a227;font-size:24px">🎭 Sérieux ou Fun ?</h1>
        <p style="color:var(--ax-text-dim,#aaa);margin:0 0 20px;font-size:14px">
          Mode dual : pro + ludique partout. Choisis ton défaut :
        </p>
        <div style="display:grid;gap:12px;margin-bottom:16px">
          <button class="ax-mode-choice" data-mode="serious" style="
            padding:16px;background:${t.mode==="serious"?"rgba(201,162,39,0.2)":"rgba(0,0,0,0.2)"};
            border:1px solid ${t.mode==="serious"?"#c9a227":"rgba(255,255,255,0.1)"};
            border-radius:12px;cursor:pointer;color:#fff;text-align:left">
            <strong style="font-size:16px">⚙️ Sérieux (par défaut)</strong>
            <div class="ax-gs-70">Réponses pro, sources officielles, expertise</div>
          </button>
          <button class="ax-mode-choice" data-mode="fun" style="
            padding:16px;background:${t.mode==="fun"?"rgba(201,162,39,0.2)":"rgba(0,0,0,0.2)"};
            border:1px solid ${t.mode==="fun"?"#c9a227":"rgba(255,255,255,0.1)"};
            border-radius:12px;cursor:pointer;color:#fff;text-align:left">
            <strong style="font-size:16px">🎉 Fun (par défaut)</strong>
            <div class="ax-gs-70">Voix rigolotes, blagues, memes</div>
          </button>
          <button class="ax-mode-choice" data-mode="both" style="
            padding:16px;background:${t.mode==="both"?"rgba(201,162,39,0.2)":"rgba(0,0,0,0.2)"};
            border:1px solid ${t.mode==="both"?"#c9a227":"rgba(255,255,255,0.1)"};
            border-radius:12px;cursor:pointer;color:#fff;text-align:left">
            <strong style="font-size:16px">🌈 Les deux (recommandé)</strong>
            <div class="ax-gs-70">Toggle dans chaque outil. Surprise mode 🎲 dispo.</div>
          </button>
        </div>
      `;case 5:return`
        <h1 style="margin:0 0 8px;color:#c9a227;font-size:24px">🚀 Tour rapide</h1>
        <p style="color:var(--ax-text-dim,#aaa);margin:0 0 20px;font-size:14px">
          3 zones clés à connaître :
        </p>
        <div style="display:grid;gap:12px;margin-bottom:20px">
          <div class="ax-gs-71">
            <strong style="color:#fff;font-size:15px">💬 Chat</strong>
            <div class="ax-gs-72">Pose une question, demande un studio, dicte. Apex sort l'outil adapté automatiquement.</div>
          </div>
          <div class="ax-gs-71">
            <strong style="color:#fff;font-size:15px">🔐 Coffre</strong>
            <div class="ax-gs-72">Tes clés API, tokens, paiements. Chiffrement AES-GCM 256.</div>
          </div>
          <div class="ax-gs-71">
            <strong style="color:#fff;font-size:15px">🎨 Studios</strong>
            <div class="ax-gs-72">15 studios créatifs (musique, vidéo, archi, etc.). Apparaissent dans le chat selon le contexte.</div>
          </div>
        </div>
        <p style="color:var(--ax-text-dim,#888);font-size:12px;margin:0;text-align:center">
          🎯 Apex apprend de chaque conversation. Plus tu l'utilises, plus il te connaît.
        </p>
      `;default:return"<p>Étape inconnue</p>"}}function $(){return`
    <div style="display:flex;gap:8px;margin-top:24px">
      ${i===1?"":'<button id="ax-onboarding-prev" class="ax-btn ax-btn-secondary" style="flex:1">← Retour</button>'}
      <button id="ax-onboarding-next" class="ax-btn ax-btn-primary" style="flex:2">${i===u?"✅ Terminer":"Suivant →"}</button>
    </div>
  `}function A(e,a){if(!s)return;const r=e.querySelector("#ax-onboarding-skip");r&&s.bind(r,"click",()=>{d.tap(),f()});const g=e.querySelector("#ax-onboarding-next");g&&s.bind(g,"click",()=>{d.tap(),q(e)});const x=e.querySelector("#ax-onboarding-prev");if(x&&s.bind(x,"click",()=>{d.tap(),i=Math.max(1,i-1),c(e)}),a===1){const o=e.querySelector("#ax-onboarding-name");o&&s.bind(o,"input",()=>{t.name=o.value.trim()})}else if(a===2){const o=e.querySelector("#ax-onboarding-grant-perms");o&&s.bind(o,"click",()=>{T()})}else a===3?e.querySelectorAll(".ax-onboarding-cap").forEach(o=>{s.bind(o,"click",()=>{const n=o.dataset.cap;n&&(t.capabilities.has(n)?t.capabilities.delete(n):t.capabilities.add(n),d.tap(),c(e))})}):a===4&&e.querySelectorAll(".ax-mode-choice").forEach(o=>{s.bind(o,"click",()=>{const n=o.dataset.mode;n&&(t.mode=n,d.tap(),c(e))})})}function q(e){if(i===1){if(!t.name||t.name.length<2){p.warn("Tape ton prénom (min 2 caractères)");return}try{localStorage.setItem("apex_v13_user_name",t.name)}catch{}}else if(i===3)try{localStorage.setItem("apex_v13_capabilities",JSON.stringify([...t.capabilities]))}catch{}else if(i===4)try{localStorage.setItem("ax_mode_dual",t.mode)}catch{}if(i===u){f();return}i++,c(e)}async function T(){t.permissionsRequested=!0;let e=0;if(typeof Notification<"u")try{await Notification.requestPermission()==="granted"&&e++}catch{}if(typeof navigator<"u"&&navigator.mediaDevices?.getUserMedia)try{(await navigator.mediaDevices.getUserMedia({audio:!0})).getTracks().forEach(r=>r.stop()),e++}catch{}if(typeof navigator<"u"&&navigator.mediaDevices?.getUserMedia)try{(await navigator.mediaDevices.getUserMedia({video:!0})).getTracks().forEach(r=>r.stop()),e++}catch{}e>0?p.success(`✅ ${e} permission${e>1?"s":""} accordée${e>1?"s":""}`):p.info("Tu pourras autoriser plus tard dans Réglages")}function f(){const e=m.get("user");e?.id&&S(e.id),p.success("🚀 Bienvenue dans Apex !"),setTimeout(()=>y.navigate("chat"),300)}export{L as dispose,N as isOnboardingNeeded,S as markOnboardingDone,O as render};
