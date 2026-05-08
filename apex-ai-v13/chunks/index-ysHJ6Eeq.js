import{l as p}from"./monitoring-3uBGKGRH.js";import{c}from"./listener-cleanup-Y2rGGxxX.js";import{haptic as u}from"./haptic-CQFg2PXZ.js";import{s as x}from"../core/main-6yqAd6rq.js";import{g as b}from"./apex-tools-dispatch-9L0B42RZ.js";import"./apex-kb-Dm_IVyZM.js";import"./credential-patterns-Dy6Wjk7e.js";import"./multi-source-analyze-DuJcGHKH.js";import"./apex-tools-registry-BO9tE-vp.js";import"./voice-Cwgrqjea.js";let l=null;function L(){l?.cleanup(),l=null}function s(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}const f=[{num:"DTU 13.3",titre:"Dallages — conception, calcul, exécution",domaine:"Béton"},{num:"DTU 20.1",titre:"Ouvrages en maçonnerie de petits éléments",domaine:"Maçonnerie"},{num:"DTU 21",titre:"Exécution des ouvrages en béton",domaine:"Béton"},{num:"DTU 25.1",titre:"Enduits intérieurs en plâtre",domaine:"Plâtre"},{num:"DTU 25.41",titre:"Plaques de plâtre",domaine:"Plaque"},{num:"DTU 26.1",titre:"Enduits aux mortiers de ciments / chaux",domaine:"Enduit"},{num:"DTU 31.1",titre:"Charpentes et escaliers en bois",domaine:"Bois"},{num:"DTU 36.5",titre:"Mise en œuvre des fenêtres et portes extérieures",domaine:"Menuiserie"},{num:"DTU 39",titre:"Vitrerie / miroiterie",domaine:"Vitrage"},{num:"DTU 40.11",titre:"Couverture en ardoises",domaine:"Couverture"},{num:"DTU 43.1",titre:"Étanchéité des toitures-terrasses",domaine:"Étanchéité"},{num:"DTU 70.1",titre:"Installations électriques résidentielles",domaine:"Électricité"}],g=[{element:"Porte intérieure",dimensions:"L 73/83/93 × H 204 cm",norme:"NF P 23-501"},{element:"Porte d'entrée",dimensions:"L 90 × H 215 cm",norme:"NF P 23-501"},{element:"Fenêtre 1 vantail",dimensions:"L 60-100 × H 75-115 cm",norme:"NF P 24-101"},{element:"Fenêtre 2 vantaux",dimensions:"L 100-160 × H 95-145 cm",norme:"NF P 24-101"},{element:"Allège fenêtre",dimensions:"H ≥ 90 cm depuis sol",norme:"NF P 01-012"},{element:"Garde-corps balcon",dimensions:"H ≥ 100 cm",norme:"NF P 01-012"},{element:"Garde-corps escalier",dimensions:"H 90 cm",norme:"NF P 01-012"},{element:"Hauteur sous plafond",dimensions:"≥ 240 cm (FR), ≥ 230 cm (Monaco)",norme:"CCH R.111-1-1"},{element:"Marche escalier (giron)",dimensions:"24-32 cm",norme:"Échelle Blondel"},{element:"Marche escalier (hauteur)",dimensions:"16-20 cm",norme:"Échelle Blondel"},{element:"Largeur escalier",dimensions:"≥ 80 cm (résidentiel)",norme:"NF P 21-211"},{element:"Plinthe",dimensions:"H 5-10 cm",norme:"Standard"}];function h(e,t,n){return!isFinite(e)||e<=0||!isFinite(t)||t<=0||!isFinite(n)||n<=0?null:{surface_m2:Math.round(e*t*100)/100,perimetre_m:Math.round(2*(e+t)*100)/100,volume_m3:Math.round(e*t*n*100)/100,plinthe_ml:Math.round(2*(e+t)*100)/100}}function y(e,t,n){if(e<=0||t<=0)return"";const o=360,i=Math.min(o/e,o/t,60),d=Math.round(e*i),a=Math.round(t*i),r=30,m=30;return`
    <svg viewBox="0 0 ${d+60} ${a+60}" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;background:#0a0a14;border:1px solid #333;border-radius:8px">
      <rect x="${r}" y="${m}" width="${d}" height="${a}" fill="rgba(201,162,39,0.1)" stroke="#c9a227" stroke-width="2"/>
      <text x="${r+d/2}" y="${m+a/2}" fill="#c9a227" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="14">${s(n)}</text>
      <text x="${r+d/2}" y="${m-8}" fill="#aaa" text-anchor="middle" font-family="sans-serif" font-size="11">${e} m</text>
      <text x="${r-8}" y="${m+a/2}" fill="#aaa" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="11" transform="rotate(-90,${r-8},${m+a/2})">${t} m</text>
    </svg>
  `}function N(e){l?.cleanup(),l=c("studios-building");const t=x.get("user")?.id??"anon";if(!b("studio.building",e,t))return;const n=f.map(i=>`
    <li style="margin-bottom:6px;font-size:13px"><strong style="color:#c9a227">${s(i.num)}</strong> — ${s(i.titre)} <span style="color:var(--ax-text-dim)">[${s(i.domaine)}]</span></li>
  `).join(""),o=g.map(i=>`
    <tr>
      <td style="padding:6px 10px;border-bottom:1px solid #222;color:#c9a227">${s(i.element)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #222">${s(i.dimensions)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #222;font-size:11px;color:var(--ax-text-dim)">${s(i.norme)}</td>
    </tr>
  `).join("");e.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:780px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">🏢 Studio Bâtiment</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">DTU · normes · métré</span>
      </header>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Métré rapide pièce</h2>
        <input type="number" id="ax-bld-l" aria-label="Longueur de la pièce en mètres" placeholder="Longueur (m)" min="0.1" step="0.01" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="number" id="ax-bld-w" aria-label="Largeur de la pièce en mètres" placeholder="Largeur (m)" min="0.1" step="0.01" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="number" id="ax-bld-h" aria-label="Hauteur sous plafond en mètres" placeholder="Hauteur (m)" min="0.1" step="0.01" value="2.5" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="text" id="ax-bld-name" aria-label="Nom de la pièce" placeholder="Nom pièce (ex : Salon)" maxlength="40" value="Pièce" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <button class="ax-btn ax-btn-primary" id="ax-bld-go" style="min-height:44px">Calculer + plan</button>
        <div id="ax-bld-out" style="margin-top:12px"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Dimensions standards</h2>
        <table style="width:100%;border-collapse:collapse;font-size:12px;color:#fff">
          <thead><tr style="border-bottom:2px solid #c9a227"><th style="text-align:left;padding:6px 10px">Élément</th><th style="text-align:left;padding:6px 10px">Dimensions</th><th style="text-align:left;padding:6px 10px">Norme</th></tr></thead>
          <tbody>${o}</tbody>
        </table>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">DTU principaux</h2>
        <ul style="margin:0;padding-left:18px;color:#ddd">${n}</ul>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#studios" style="color:#c9a227">← Retour studios</a></p>
    </div>
  `,v(e)}function v(e){const t=e.querySelector("#ax-bld-go"),n=e.querySelector("#ax-bld-out");!t||!n||!l||(l.bind(t,"click",()=>{u.tap();const o=parseFloat(e.querySelector("#ax-bld-l")?.value??""),i=parseFloat(e.querySelector("#ax-bld-w")?.value??""),d=parseFloat(e.querySelector("#ax-bld-h")?.value??""),a=(e.querySelector("#ax-bld-name")?.value??"Pièce").slice(0,40),r=h(o,i,d);if(!r){n.innerHTML='<div style="color:#ff8866">Dimensions invalides.</div>';return}n.innerHTML=`
      ${y(o,i,a)}
      <pre style="margin-top:8px;color:#c9a227;white-space:pre-wrap;font-size:13px">Surface : ${r.surface_m2} m²
Périmètre : ${r.perimetre_m} m
Volume : ${r.volume_m3} m³
Plinthes : ${r.plinthe_ml} mL</pre>
    `}),p.info("studios-building","rendered"))}export{f as DTU_REFS,g as STANDARD_DIMS,h as calcMetre,L as dispose,s as escapeHtml,N as render,y as svgPlanView};
