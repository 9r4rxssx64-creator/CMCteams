import{e as p}from"./escape-html-BlQj2yEF.js";import{c as b}from"./listener-cleanup-Y2rGGxxX.js";import{s as y,l as w}from"./monitoring-D2lWYrYo.js";import{g as $}from"./apex-tools-dispatch-core-C_k5h2yM.js";import{haptic as D}from"./haptic-CQFg2PXZ.js";import"./multi-source-analyze-Bg1HHfSC.js";import"./apex-kb-D1VtWFD9.js";import"./credential-patterns-CLzI061R.js";import"./apex-tools-dispatch-skills-DOw4cI4G.js";import"./apex-tools-dispatch-data-DHUpGBCD.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-fNevKu6E.js";import"./apex-tools-misc-DBbScgMK.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";let d=null;function R(){d?.cleanup(),d=null}const g=29.530588853,f=Date.UTC(2e3,0,6,18,14);function m(s){let e=(s.getTime()-f)/864e5%g;e<0&&(e+=g);const a=e/g,l=Math.round((1-Math.cos(2*Math.PI*a))/2*100);let r,o,n;e<1.84?(r="new",o="Nouvelle lune",n="🌑"):e<5.53?(r="waxing-crescent",o="Premier croissant",n="🌒"):e<9.22?(r="first-quarter",o="Premier quartier",n="🌓"):e<12.91?(r="waxing-gibbous",o="Lune gibbeuse croissante",n="🌔"):e<16.61?(r="full",o="Pleine lune",n="🌕"):e<20.3?(r="waning-gibbous",o="Lune gibbeuse décroissante",n="🌖"):e<23.99?(r="last-quarter",o="Dernier quartier",n="🌗"):(r="waning-crescent",o="Dernier croissant",n="🌘");const u=27.32166,v=((s.getTime()-f)/864e5%u+u)%u<u/2;return{phase:r,phase_label:o,emoji:n,age_days:Math.round(e*10)/10,illumination_pct:l,rising:v}}function x(s){const i=[];switch(s.phase){case"new":i.push("🌑 Nouvelle lune : repos. Préparer le sol, désherber, composter.");break;case"waxing-crescent":case"first-quarter":case"waxing-gibbous":i.push("🌱 Lune croissante : semer, greffer, planter (sève monte).");break;case"full":i.push("🌕 Pleine lune : récolter herbes aromatiques (parfum max), éviter tailles importantes.");break;case"waning-gibbous":case"last-quarter":case"waning-crescent":i.push("✂ Lune décroissante : tailler, élaguer, récolter racines, conserves.");break}return s.rising?i.push("⬆ Lune montante : récolter fruits/légumes-feuilles. Gain de saveur."):i.push("⬇ Lune descendante : planter, repiquer, tailler. Sève descend = enracinement."),i}function h(s,i){const t=i==="new"?0:14.77;for(let e=0;e<35;e++){const a=new Date(s.getTime()+e*864e5),l=m(a);if(i==="new"&&l.phase==="new"||i==="full"&&l.phase==="full"||Math.abs(l.age_days-t)<.5)return a}return new Date(s.getTime()+14*864e5)}function P(s){const i=[];for(let t=0;t<7;t++){const e=new Date(s.getTime()+t*864e5),a=m(e),l=x(a)[0]??"";i.push({date:e,info:a,advice:l})}return i}function _(s){d?.cleanup(),d=b("studios-lunar");const i=y.get("user")?.id??"anon";if(!$("studio.lunar",s,i))return;const t=new Date,e=m(t),a=x(e),l=h(t,"full"),r=h(t,"new"),o=P(t),n=c=>c.toLocaleDateString("fr-FR",{weekday:"short",day:"2-digit",month:"short"});s.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:780px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">🌙 Studio Jardin Lunaire</h1>
        <span class="ax-gs-3">Biodynamie</span>
      </header>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px;text-align:center">
        <div class="ax-gs-171">${e.emoji}</div>
        <h2 style="margin:6px 0;color:#c9a227">${p(e.phase_label)}</h2>
        <div class="ax-gs-3">
          Âge ${e.age_days} jours · Illumination ${e.illumination_pct}% · ${e.rising?"⬆ Montante":"⬇ Descendante"}
        </div>
      </div>

      <div class="ax-gs-1">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Conseils du jour</h2>
        <ul style="margin:0;padding-left:18px;color:#ddd;font-size:14px;line-height:1.8">
          ${a.map(c=>`<li>${p(c)}</li>`).join("")}
        </ul>
      </div>

      <div class="ax-gs-1">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Prochaines phases</h2>
        <div style="font-size:13px;color:#ddd;line-height:1.7">
          🌕 Prochaine pleine lune : <strong style="color:#c9a227">${n(l)}</strong><br>
          🌑 Prochaine nouvelle lune : <strong style="color:#c9a227">${n(r)}</strong>
        </div>
      </div>

      <div class="ax-gs-1">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">7 jours à venir</h2>
        <div class="ax-gs-29">
          ${o.map(c=>`
            <div style="display:flex;align-items:center;gap:10px;padding:6px 10px;background:rgba(255,255,255,0.02);border-radius:6px">
              <span class="ax-gs-170">${c.info.emoji}</span>
              <div class="ax-gs-26">
                <div style="color:#c9a227;font-weight:700;font-size:13px">${n(c.date)}</div>
                <div class="ax-gs-136">${p(c.advice)}</div>
              </div>
              <span class="ax-gs-124">${c.info.illumination_pct}%</span>
            </div>
          `).join("")}
        </div>
      </div>

      <p style="font-size:11px;color:#666;text-align:center">Précision algo ±1 jour. Pour usage agricole strict consulter calendrier biodynamique officiel.</p>
      <p style="margin-top:24px;text-align:center"><a href="#studios" style="color:#c9a227">← Retour studios</a></p>
    </div>
  `;const u=s.querySelector(".ax-page > div:nth-child(2)");u&&d&&d.bind(u,"click",()=>{D.tap(),_(s)}),w.info("studios-lunar","rendered",{phase:e.phase,illumination:e.illumination_pct})}export{R as dispose,x as getBiodynamicAdvice,m as getLunarInfo,h as nextPhaseDate,P as nextSevenDays,_ as render};
