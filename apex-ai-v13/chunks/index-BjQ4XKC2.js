import{l as h}from"./monitoring-BAiQJoxJ.js";import{c as v}from"./listener-cleanup-Y2rGGxxX.js";import{h as y}from"./haptic-BUEqXK0N.js";let d=null;function _(){d?.cleanup(),d=null}function p(n){return n.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}const u=29.530588853,x=Date.UTC(2e3,0,6,18,14);function g(n){let i=(n.getTime()-x)/864e5%u;i<0&&(i+=u);const o=i/u,c=Math.round((1-Math.cos(2*Math.PI*o))/2*100);let l,a,r;i<1.84?(l="new",a="Nouvelle lune",r="🌑"):i<5.53?(l="waxing-crescent",a="Premier croissant",r="🌒"):i<9.22?(l="first-quarter",a="Premier quartier",r="🌓"):i<12.91?(l="waxing-gibbous",a="Lune gibbeuse croissante",r="🌔"):i<16.61?(l="full",a="Pleine lune",r="🌕"):i<20.3?(l="waning-gibbous",a="Lune gibbeuse décroissante",r="🌖"):i<23.99?(l="last-quarter",a="Dernier quartier",r="🌗"):(l="waning-crescent",a="Dernier croissant",r="🌘");const s=27.32166,b=((n.getTime()-x)/864e5%s+s)%s<s/2;return{phase:l,phase_label:a,emoji:r,age_days:Math.round(i*10)/10,illumination_pct:c,rising:b}}function m(n){const e=[];switch(n.phase){case"new":e.push("🌑 Nouvelle lune : repos. Préparer le sol, désherber, composter.");break;case"waxing-crescent":case"first-quarter":case"waxing-gibbous":e.push("🌱 Lune croissante : semer, greffer, planter (sève monte).");break;case"full":e.push("🌕 Pleine lune : récolter herbes aromatiques (parfum max), éviter tailles importantes.");break;case"waning-gibbous":case"last-quarter":case"waning-crescent":e.push("✂ Lune décroissante : tailler, élaguer, récolter racines, conserves.");break}return n.rising?e.push("⬆ Lune montante : récolter fruits/légumes-feuilles. Gain de saveur."):e.push("⬇ Lune descendante : planter, repiquer, tailler. Sève descend = enracinement."),e}function f(n,e){const t=e==="new"?0:14.77;for(let i=0;i<35;i++){const o=new Date(n.getTime()+i*864e5),c=g(o);if(e==="new"&&c.phase==="new"||e==="full"&&c.phase==="full"||Math.abs(c.age_days-t)<.5)return o}return new Date(n.getTime()+14*864e5)}function w(n){const e=[];for(let t=0;t<7;t++){const i=new Date(n.getTime()+t*864e5),o=g(i),c=m(o)[0]??"";e.push({date:i,info:o,advice:c})}return e}function $(n){d?.cleanup(),d=v("studios-lunar");const e=new Date,t=g(e),i=m(t),o=f(e,"full"),c=f(e,"new"),l=w(e),a=s=>s.toLocaleDateString("fr-FR",{weekday:"short",day:"2-digit",month:"short"});n.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:780px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">🌙 Studio Jardin Lunaire</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">Biodynamie</span>
      </header>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px;text-align:center">
        <div style="font-size:64px">${t.emoji}</div>
        <h2 style="margin:6px 0;color:#c9a227">${p(t.phase_label)}</h2>
        <div style="color:var(--ax-text-dim);font-size:13px">
          Âge ${t.age_days} jours · Illumination ${t.illumination_pct}% · ${t.rising?"⬆ Montante":"⬇ Descendante"}
        </div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Conseils du jour</h2>
        <ul style="margin:0;padding-left:18px;color:#ddd;font-size:14px;line-height:1.8">
          ${i.map(s=>`<li>${p(s)}</li>`).join("")}
        </ul>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Prochaines phases</h2>
        <div style="font-size:13px;color:#ddd;line-height:1.7">
          🌕 Prochaine pleine lune : <strong style="color:#c9a227">${a(o)}</strong><br>
          🌑 Prochaine nouvelle lune : <strong style="color:#c9a227">${a(c)}</strong>
        </div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">7 jours à venir</h2>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${l.map(s=>`
            <div style="display:flex;align-items:center;gap:10px;padding:6px 10px;background:rgba(255,255,255,0.02);border-radius:6px">
              <span style="font-size:22px">${s.info.emoji}</span>
              <div style="flex:1">
                <div style="color:#c9a227;font-weight:700;font-size:13px">${a(s.date)}</div>
                <div style="color:var(--ax-text-dim);font-size:11px">${p(s.advice)}</div>
              </div>
              <span style="font-size:11px;color:#888">${s.info.illumination_pct}%</span>
            </div>
          `).join("")}
        </div>
      </div>

      <p style="font-size:11px;color:#666;text-align:center">Précision algo ±1 jour. Pour usage agricole strict consulter calendrier biodynamique officiel.</p>
      <p style="margin-top:24px;text-align:center"><a href="#studios" style="color:#c9a227">← Retour studios</a></p>
    </div>
  `;const r=n.querySelector(".ax-page > div:nth-child(2)");r&&d&&d.bind(r,"click",()=>{y.tap(),$(n)}),h.info("studios-lunar","rendered",{phase:t.phase,illumination:t.illumination_pct})}export{_ as dispose,p as escapeHtml,m as getBiodynamicAdvice,g as getLunarInfo,f as nextPhaseDate,w as nextSevenDays,$ as render};
