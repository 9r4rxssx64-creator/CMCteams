import{e as u}from"./escape-html-BlQj2yEF.js";import{c as v}from"./listener-cleanup-Y2rGGxxX.js";import{l as y}from"./monitoring-3uBGKGRH.js";import{s as w}from"../core/main-1zxfPgC1.js";import{g as $}from"./apex-tools-dispatch-core-DAn36Ign.js";import{haptic as z}from"./haptic-CQFg2PXZ.js";import"./apex-kb-BL-mRJI7.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-CDRNXpkc.js";import"./apex-tools-dispatch-skills-BogAQ4Vd.js";import"./apex-tools-dispatch-data-D1T5OmzL.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-DFVUUqOd.js";import"./apex-tools-misc-QTFmYJ9X.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";import"./voice-BQ1FH04d.js";let p=null;function E(){p?.cleanup(),p=null}const g=29.530588853,f=Date.UTC(2e3,0,6,18,14);function m(t){let e=(t.getTime()-f)/864e5%g;e<0&&(e+=g);const s=e/g,l=Math.round((1-Math.cos(2*Math.PI*s))/2*100);let a,o,n;e<1.84?(a="new",o="Nouvelle lune",n="🌑"):e<5.53?(a="waxing-crescent",o="Premier croissant",n="🌒"):e<9.22?(a="first-quarter",o="Premier quartier",n="🌓"):e<12.91?(a="waxing-gibbous",o="Lune gibbeuse croissante",n="🌔"):e<16.61?(a="full",o="Pleine lune",n="🌕"):e<20.3?(a="waning-gibbous",o="Lune gibbeuse décroissante",n="🌖"):e<23.99?(a="last-quarter",o="Dernier quartier",n="🌗"):(a="waning-crescent",o="Dernier croissant",n="🌘");const d=27.32166,h=((t.getTime()-f)/864e5%d+d)%d<d/2;return{phase:a,phase_label:o,emoji:n,age_days:Math.round(e*10)/10,illumination_pct:l,rising:h}}function b(t){const i=[];switch(t.phase){case"new":i.push("🌑 Nouvelle lune : repos. Préparer le sol, désherber, composter.");break;case"waxing-crescent":case"first-quarter":case"waxing-gibbous":i.push("🌱 Lune croissante : semer, greffer, planter (sève monte).");break;case"full":i.push("🌕 Pleine lune : récolter herbes aromatiques (parfum max), éviter tailles importantes.");break;case"waning-gibbous":case"last-quarter":case"waning-crescent":i.push("✂ Lune décroissante : tailler, élaguer, récolter racines, conserves.");break}return t.rising?i.push("⬆ Lune montante : récolter fruits/légumes-feuilles. Gain de saveur."):i.push("⬇ Lune descendante : planter, repiquer, tailler. Sève descend = enracinement."),i}function x(t,i){const r=i==="new"?0:14.77;for(let e=0;e<35;e++){const s=new Date(t.getTime()+e*864e5),l=m(s);if(i==="new"&&l.phase==="new"||i==="full"&&l.phase==="full"||Math.abs(l.age_days-r)<.5)return s}return new Date(t.getTime()+14*864e5)}function k(t){const i=[];for(let r=0;r<7;r++){const e=new Date(t.getTime()+r*864e5),s=m(e),l=b(s)[0]??"";i.push({date:e,info:s,advice:l})}return i}function D(t){p?.cleanup(),p=v("studios-lunar");const i=w.get("user")?.id??"anon";if(!$("studio.lunar",t,i))return;const r=new Date,e=m(r),s=b(e),l=x(r,"full"),a=x(r,"new"),o=k(r),n=c=>c.toLocaleDateString("fr-FR",{weekday:"short",day:"2-digit",month:"short"});t.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:780px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">🌙 Studio Jardin Lunaire</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">Biodynamie</span>
      </header>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px;text-align:center">
        <div style="font-size:64px">${e.emoji}</div>
        <h2 style="margin:6px 0;color:#c9a227">${u(e.phase_label)}</h2>
        <div style="color:var(--ax-text-dim);font-size:13px">
          Âge ${e.age_days} jours · Illumination ${e.illumination_pct}% · ${e.rising?"⬆ Montante":"⬇ Descendante"}
        </div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Conseils du jour</h2>
        <ul style="margin:0;padding-left:18px;color:#ddd;font-size:14px;line-height:1.8">
          ${s.map(c=>`<li>${u(c)}</li>`).join("")}
        </ul>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Prochaines phases</h2>
        <div style="font-size:13px;color:#ddd;line-height:1.7">
          🌕 Prochaine pleine lune : <strong style="color:#c9a227">${n(l)}</strong><br>
          🌑 Prochaine nouvelle lune : <strong style="color:#c9a227">${n(a)}</strong>
        </div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">7 jours à venir</h2>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${o.map(c=>`
            <div style="display:flex;align-items:center;gap:10px;padding:6px 10px;background:rgba(255,255,255,0.02);border-radius:6px">
              <span style="font-size:22px">${c.info.emoji}</span>
              <div style="flex:1">
                <div style="color:#c9a227;font-weight:700;font-size:13px">${n(c.date)}</div>
                <div style="color:var(--ax-text-dim);font-size:11px">${u(c.advice)}</div>
              </div>
              <span style="font-size:11px;color:#888">${c.info.illumination_pct}%</span>
            </div>
          `).join("")}
        </div>
      </div>

      <p style="font-size:11px;color:#666;text-align:center">Précision algo ±1 jour. Pour usage agricole strict consulter calendrier biodynamique officiel.</p>
      <p style="margin-top:24px;text-align:center"><a href="#studios" style="color:#c9a227">← Retour studios</a></p>
    </div>
  `;const d=t.querySelector(".ax-page > div:nth-child(2)");d&&p&&p.bind(d,"click",()=>{z.tap(),D(t)}),y.info("studios-lunar","rendered",{phase:e.phase,illumination:e.illumination_pct})}export{E as dispose,b as getBiodynamicAdvice,m as getLunarInfo,x as nextPhaseDate,k as nextSevenDays,D as render};
