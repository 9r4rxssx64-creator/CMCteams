import{b,e as g,l as w}from"./monitoring-DafGCuY_.js";import{c as y}from"./listener-cleanup-Y2rGGxxX.js";import{g as $}from"./apex-tools-dispatch-core-Cae-voui.js";import{haptic as D}from"./haptic-CQFg2PXZ.js";import"./multi-source-analyze-v-ftw4rg.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-CTUq4zDU.js";import"./apex-tools-dispatch-skills-DADUx8Dl.js";import"./apex-tools-dispatch-data-D2bNJrh_.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-Et2Pr6Cf.js";import"./apex-tools-misc-Bcv2znxx.js";import"./apex-tools-registry-core-B4u4pCoL.js";import"./apex-tools-registry-skills-x-mAWYry.js";let d=null;function H(){d?.cleanup(),d=null}const p=29.530588853,f=Date.UTC(2e3,0,6,18,14);function m(a){let e=(a.getTime()-f)/864e5%p;e<0&&(e+=p);const t=e/p,l=Math.round((1-Math.cos(2*Math.PI*t))/2*100);let r,o,i;e<1.84?(r="new",o="Nouvelle lune",i="🌑"):e<5.53?(r="waxing-crescent",o="Premier croissant",i="🌒"):e<9.22?(r="first-quarter",o="Premier quartier",i="🌓"):e<12.91?(r="waxing-gibbous",o="Lune gibbeuse croissante",i="🌔"):e<16.61?(r="full",o="Pleine lune",i="🌕"):e<20.3?(r="waning-gibbous",o="Lune gibbeuse décroissante",i="🌖"):e<23.99?(r="last-quarter",o="Dernier quartier",i="🌗"):(r="waning-crescent",o="Dernier croissant",i="🌘");const u=27.32166,v=((a.getTime()-f)/864e5%u+u)%u<u/2;return{phase:r,phase_label:o,emoji:i,age_days:Math.round(e*10)/10,illumination_pct:l,rising:v}}function x(a){const s=[];switch(a.phase){case"new":s.push("🌑 Nouvelle lune : repos. Préparer le sol, désherber, composter.");break;case"waxing-crescent":case"first-quarter":case"waxing-gibbous":s.push("🌱 Lune croissante : semer, greffer, planter (sève monte).");break;case"full":s.push("🌕 Pleine lune : récolter herbes aromatiques (parfum max), éviter tailles importantes.");break;case"waning-gibbous":case"last-quarter":case"waning-crescent":s.push("✂ Lune décroissante : tailler, élaguer, récolter racines, conserves.");break}return a.rising?s.push("⬆ Lune montante : récolter fruits/légumes-feuilles. Gain de saveur."):s.push("⬇ Lune descendante : planter, repiquer, tailler. Sève descend = enracinement."),s}function h(a,s){const n=s==="new"?0:14.77;for(let e=0;e<35;e++){const t=new Date(a.getTime()+e*864e5),l=m(t);if(s==="new"&&l.phase==="new"||s==="full"&&l.phase==="full"||Math.abs(l.age_days-n)<.5)return t}return new Date(a.getTime()+14*864e5)}function P(a){const s=[];for(let n=0;n<7;n++){const e=new Date(a.getTime()+n*864e5),t=m(e),l=x(t)[0]??"";s.push({date:e,info:t,advice:l})}return s}function _(a){d?.cleanup(),d=y("studios-lunar");const s=b.get("user")?.id??"anon";if(!$("studio.lunar",a,s))return;const n=new Date,e=m(n),t=x(e),l=h(n,"full"),r=h(n,"new"),o=P(n),i=c=>c.toLocaleDateString("fr-FR",{weekday:"short",day:"2-digit",month:"short"});a.innerHTML=`
    <div class="ax-page ax-gs-451">
      <header class="ax-gs-210">
        <h1 class="ax-gs-333">🌙 Studio Jardin Lunaire</h1>
        <span class="ax-gs-3">Biodynamie</span>
      </header>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px;text-align:center">
        <div class="ax-gs-171">${e.emoji}</div>
        <h2 style="margin:6px 0;color:#c9a227">${g(e.phase_label)}</h2>
        <div class="ax-gs-3">
          Âge ${e.age_days} jours · Illumination ${e.illumination_pct}% · ${e.rising?"⬆ Montante":"⬇ Descendante"}
        </div>
      </div>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Conseils du jour</h2>
        <ul style="margin:0;padding-left:18px;color:#ddd;font-size:14px;line-height:1.8">
          ${t.map(c=>`<li>${g(c)}</li>`).join("")}
        </ul>
      </div>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Prochaines phases</h2>
        <div style="font-size:13px;color:#ddd;line-height:1.7">
          🌕 Prochaine pleine lune : <strong class="ax-gs-266">${i(l)}</strong><br>
          🌑 Prochaine nouvelle lune : <strong class="ax-gs-266">${i(r)}</strong>
        </div>
      </div>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">7 jours à venir</h2>
        <div class="ax-gs-29">
          ${o.map(c=>`
            <div style="display:flex;align-items:center;gap:10px;padding:6px 10px;background:rgba(255,255,255,0.02);border-radius:6px">
              <span class="ax-gs-170">${c.info.emoji}</span>
              <div class="ax-gs-26">
                <div style="color:#c9a227;font-weight:700;font-size:13px">${i(c.date)}</div>
                <div class="ax-gs-136">${g(c.advice)}</div>
              </div>
              <span class="ax-gs-124">${c.info.illumination_pct}%</span>
            </div>
          `).join("")}
        </div>
      </div>

      <p class="ax-gs-469">Précision algo ±1 jour. Pour usage agricole strict consulter calendrier biodynamique officiel.</p>
      <p class="ax-gs-212"><a href="#studios" class="ax-gs-198">← Retour studios</a></p>
    </div>
  `;const u=a.querySelector(".ax-page > div:nth-child(2)");u&&d&&d.bind(u,"click",()=>{D.tap(),_(a)}),w.info("studios-lunar","rendered",{phase:e.phase,illumination:e.illumination_pct})}export{H as dispose,x as getBiodynamicAdvice,m as getLunarInfo,h as nextPhaseDate,P as nextSevenDays,_ as render};
