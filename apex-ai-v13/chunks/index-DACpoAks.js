import{e as s}from"./escape-html-BlQj2yEF.js";import{c as p}from"./listener-cleanup-Y2rGGxxX.js";import{s as c,l as u}from"./monitoring-D2lWYrYo.js";import{g as x}from"./apex-tools-dispatch-core-C_k5h2yM.js";import{haptic as f}from"./haptic-CQFg2PXZ.js";import"./multi-source-analyze-Bg1HHfSC.js";import"./apex-kb-D1VtWFD9.js";import"./credential-patterns-CLzI061R.js";import"./apex-tools-dispatch-skills-DOw4cI4G.js";import"./apex-tools-dispatch-data-DHUpGBCD.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-fNevKu6E.js";import"./apex-tools-misc-DBbScgMK.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";let d=null;function B(){d?.cleanup(),d=null}const h=[{num:"DTU 13.3",titre:"Dallages — conception, calcul, exécution",domaine:"Béton"},{num:"DTU 20.1",titre:"Ouvrages en maçonnerie de petits éléments",domaine:"Maçonnerie"},{num:"DTU 21",titre:"Exécution des ouvrages en béton",domaine:"Béton"},{num:"DTU 25.1",titre:"Enduits intérieurs en plâtre",domaine:"Plâtre"},{num:"DTU 25.41",titre:"Plaques de plâtre",domaine:"Plaque"},{num:"DTU 26.1",titre:"Enduits aux mortiers de ciments / chaux",domaine:"Enduit"},{num:"DTU 31.1",titre:"Charpentes et escaliers en bois",domaine:"Bois"},{num:"DTU 36.5",titre:"Mise en œuvre des fenêtres et portes extérieures",domaine:"Menuiserie"},{num:"DTU 39",titre:"Vitrerie / miroiterie",domaine:"Vitrage"},{num:"DTU 40.11",titre:"Couverture en ardoises",domaine:"Couverture"},{num:"DTU 43.1",titre:"Étanchéité des toitures-terrasses",domaine:"Étanchéité"},{num:"DTU 70.1",titre:"Installations électriques résidentielles",domaine:"Électricité"}],b=[{element:"Porte intérieure",dimensions:"L 73/83/93 × H 204 cm",norme:"NF P 23-501"},{element:"Porte d'entrée",dimensions:"L 90 × H 215 cm",norme:"NF P 23-501"},{element:"Fenêtre 1 vantail",dimensions:"L 60-100 × H 75-115 cm",norme:"NF P 24-101"},{element:"Fenêtre 2 vantaux",dimensions:"L 100-160 × H 95-145 cm",norme:"NF P 24-101"},{element:"Allège fenêtre",dimensions:"H ≥ 90 cm depuis sol",norme:"NF P 01-012"},{element:"Garde-corps balcon",dimensions:"H ≥ 100 cm",norme:"NF P 01-012"},{element:"Garde-corps escalier",dimensions:"H 90 cm",norme:"NF P 01-012"},{element:"Hauteur sous plafond",dimensions:"≥ 240 cm (FR), ≥ 230 cm (Monaco)",norme:"CCH R.111-1-1"},{element:"Marche escalier (giron)",dimensions:"24-32 cm",norme:"Échelle Blondel"},{element:"Marche escalier (hauteur)",dimensions:"16-20 cm",norme:"Échelle Blondel"},{element:"Largeur escalier",dimensions:"≥ 80 cm (résidentiel)",norme:"NF P 21-211"},{element:"Plinthe",dimensions:"H 5-10 cm",norme:"Standard"}];function g(e,t,n){return!isFinite(e)||e<=0||!isFinite(t)||t<=0||!isFinite(n)||n<=0?null:{surface_m2:Math.round(e*t*100)/100,perimetre_m:Math.round(2*(e+t)*100)/100,volume_m3:Math.round(e*t*n*100)/100,plinthe_ml:Math.round(2*(e+t)*100)/100}}function y(e,t,n){if(e<=0||t<=0)return"";const r=360,i=Math.min(r/e,r/t,60),l=Math.round(e*i),a=Math.round(t*i),o=30,m=30;return`
    <svg viewBox="0 0 ${l+60} ${a+60}" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;background:#0a0a14;border:1px solid #333;border-radius:8px">
      <rect x="${o}" y="${m}" width="${l}" height="${a}" fill="rgba(201,162,39,0.1)" stroke="#c9a227" stroke-width="2"/>
      <text x="${o+l/2}" y="${m+a/2}" fill="#c9a227" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="14">${s(n)}</text>
      <text x="${o+l/2}" y="${m-8}" fill="#aaa" text-anchor="middle" font-family="sans-serif" font-size="11">${e} m</text>
      <text x="${o-8}" y="${m+a/2}" fill="#aaa" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="11" transform="rotate(-90,${o-8},${m+a/2})">${t} m</text>
    </svg>
  `}function C(e){d?.cleanup(),d=p("studios-building");const t=c.get("user")?.id??"anon";if(!x("studio.building",e,t))return;const n=h.map(i=>`
    <li style="margin-bottom:6px;font-size:13px"><strong style="color:#c9a227">${s(i.num)}</strong> — ${s(i.titre)} <span class="ax-gs-10">[${s(i.domaine)}]</span></li>
  `).join(""),r=b.map(i=>`
    <tr>
      <td style="padding:6px 10px;border-bottom:1px solid #222;color:#c9a227">${s(i.element)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #222">${s(i.dimensions)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #222;font-size:11px;color:var(--ax-text-dim)">${s(i.norme)}</td>
    </tr>
  `).join("");e.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:780px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">🏢 Studio Bâtiment</h1>
        <span class="ax-gs-3">DTU · normes · métré</span>
      </header>

      <div class="ax-gs-1">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Métré rapide pièce</h2>
        <input type="number" id="ax-bld-l" aria-label="Longueur de la pièce en mètres" placeholder="Longueur (m)" min="0.1" step="0.01" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="number" id="ax-bld-w" aria-label="Largeur de la pièce en mètres" placeholder="Largeur (m)" min="0.1" step="0.01" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="number" id="ax-bld-h" aria-label="Hauteur sous plafond en mètres" placeholder="Hauteur (m)" min="0.1" step="0.01" value="2.5" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="text" id="ax-bld-name" aria-label="Nom de la pièce" placeholder="Nom pièce (ex : Salon)" maxlength="40" value="Pièce" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <button class="ax-btn ax-btn-primary" id="ax-bld-go" style="min-height:44px">Calculer + plan</button>
        <div id="ax-bld-out" style="margin-top:12px"></div>
      </div>

      <div class="ax-gs-1">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Dimensions standards</h2>
        <table style="width:100%;border-collapse:collapse;font-size:12px;color:#fff">
          <thead><tr style="border-bottom:2px solid #c9a227"><th style="text-align:left;padding:6px 10px">Élément</th><th style="text-align:left;padding:6px 10px">Dimensions</th><th style="text-align:left;padding:6px 10px">Norme</th></tr></thead>
          <tbody>${r}</tbody>
        </table>
      </div>

      <div class="ax-gs-1">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">DTU principaux</h2>
        <ul style="margin:0;padding-left:18px;color:#ddd">${n}</ul>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#studios" style="color:#c9a227">← Retour studios</a></p>
    </div>
  `,v(e)}function v(e){const t=e.querySelector("#ax-bld-go"),n=e.querySelector("#ax-bld-out");!t||!n||!d||(d.bind(t,"click",()=>{f.tap();const r=parseFloat(e.querySelector("#ax-bld-l")?.value??""),i=parseFloat(e.querySelector("#ax-bld-w")?.value??""),l=parseFloat(e.querySelector("#ax-bld-h")?.value??""),a=(e.querySelector("#ax-bld-name")?.value??"Pièce").slice(0,40),o=g(r,i,l);if(!o){n.innerHTML='<div style="color:#ff8866">Dimensions invalides.</div>';return}n.innerHTML=`
      ${y(r,i,a)}
      <pre style="margin-top:8px;color:#c9a227;white-space:pre-wrap;font-size:13px">Surface : ${o.surface_m2} m²
Périmètre : ${o.perimetre_m} m
Volume : ${o.volume_m3} m³
Plinthes : ${o.plinthe_ml} mL</pre>
    `}),u.info("studios-building","rendered"))}export{h as DTU_REFS,b as STANDARD_DIMS,g as calcMetre,B as dispose,C as render,y as svgPlanView};
