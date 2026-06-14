import{b as c,e as o,l as u}from"./monitoring-0Or-o96J.js";import{c as p}from"./listener-cleanup-Y2rGGxxX.js";import{g as x}from"./apex-tools-dispatch-core-ClD6jP77.js";import{haptic as h}from"./haptic-CQFg2PXZ.js";import"./multi-source-analyze-U7RQC08b.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-CzSg8Qy1.js";import"./apex-tools-dispatch-skills-DwcCezf1.js";import"./apex-tools-dispatch-data-CxkEaJ2d.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-BBpuUyLP.js";import"./apex-tools-misc-BW8Whjjz.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-x-mAWYry.js";let d=null;function C(){d?.cleanup(),d=null}const f=[{num:"DTU 13.3",titre:"Dallages — conception, calcul, exécution",domaine:"Béton"},{num:"DTU 20.1",titre:"Ouvrages en maçonnerie de petits éléments",domaine:"Maçonnerie"},{num:"DTU 21",titre:"Exécution des ouvrages en béton",domaine:"Béton"},{num:"DTU 25.1",titre:"Enduits intérieurs en plâtre",domaine:"Plâtre"},{num:"DTU 25.41",titre:"Plaques de plâtre",domaine:"Plaque"},{num:"DTU 26.1",titre:"Enduits aux mortiers de ciments / chaux",domaine:"Enduit"},{num:"DTU 31.1",titre:"Charpentes et escaliers en bois",domaine:"Bois"},{num:"DTU 36.5",titre:"Mise en œuvre des fenêtres et portes extérieures",domaine:"Menuiserie"},{num:"DTU 39",titre:"Vitrerie / miroiterie",domaine:"Vitrage"},{num:"DTU 40.11",titre:"Couverture en ardoises",domaine:"Couverture"},{num:"DTU 43.1",titre:"Étanchéité des toitures-terrasses",domaine:"Étanchéité"},{num:"DTU 70.1",titre:"Installations électriques résidentielles",domaine:"Électricité"}],b=[{element:"Porte intérieure",dimensions:"L 73/83/93 × H 204 cm",norme:"NF P 23-501"},{element:"Porte d'entrée",dimensions:"L 90 × H 215 cm",norme:"NF P 23-501"},{element:"Fenêtre 1 vantail",dimensions:"L 60-100 × H 75-115 cm",norme:"NF P 24-101"},{element:"Fenêtre 2 vantaux",dimensions:"L 100-160 × H 95-145 cm",norme:"NF P 24-101"},{element:"Allège fenêtre",dimensions:"H ≥ 90 cm depuis sol",norme:"NF P 01-012"},{element:"Garde-corps balcon",dimensions:"H ≥ 100 cm",norme:"NF P 01-012"},{element:"Garde-corps escalier",dimensions:"H 90 cm",norme:"NF P 01-012"},{element:"Hauteur sous plafond",dimensions:"≥ 240 cm (FR), ≥ 230 cm (Monaco)",norme:"CCH R.111-1-1"},{element:"Marche escalier (giron)",dimensions:"24-32 cm",norme:"Échelle Blondel"},{element:"Marche escalier (hauteur)",dimensions:"16-20 cm",norme:"Échelle Blondel"},{element:"Largeur escalier",dimensions:"≥ 80 cm (résidentiel)",norme:"NF P 21-211"},{element:"Plinthe",dimensions:"H 5-10 cm",norme:"Standard"}];function g(e,t,i){return!isFinite(e)||e<=0||!isFinite(t)||t<=0||!isFinite(i)||i<=0?null:{surface_m2:Math.round(e*t*100)/100,perimetre_m:Math.round(2*(e+t)*100)/100,volume_m3:Math.round(e*t*i*100)/100,plinthe_ml:Math.round(2*(e+t)*100)/100}}function v(e,t,i){if(e<=0||t<=0)return"";const a=360,n=Math.min(a/e,a/t,60),l=Math.round(e*n),r=Math.round(t*n),s=30,m=30;return`
    <svg viewBox="0 0 ${l+60} ${r+60}" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;background:#0a0a14;border:1px solid #333;border-radius:8px">
      <rect x="${s}" y="${m}" width="${l}" height="${r}" fill="rgba(201,162,39,0.1)" stroke="#c9a227" stroke-width="2"/>
      <text x="${s+l/2}" y="${m+r/2}" fill="#c9a227" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="14">${o(i)}</text>
      <text x="${s+l/2}" y="${m-8}" fill="#aaa" text-anchor="middle" font-family="sans-serif" font-size="11">${e} m</text>
      <text x="${s-8}" y="${m+r/2}" fill="#aaa" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="11" transform="rotate(-90,${s-8},${m+r/2})">${t} m</text>
    </svg>
  `}function z(e){d?.cleanup(),d=p("studios-building");const t=c.get("user")?.id??"anon";if(!x("studio.building",e,t))return;const i=f.map(n=>`
    <li style="margin-bottom:6px;font-size:13px"><strong class="ax-gs-266">${o(n.num)}</strong> — ${o(n.titre)} <span class="ax-gs-10">[${o(n.domaine)}]</span></li>
  `).join(""),a=b.map(n=>`
    <tr>
      <td style="padding:6px 10px;border-bottom:1px solid #222;color:#c9a227">${o(n.element)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #222">${o(n.dimensions)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #222;font-size:11px;color:var(--ax-text-dim)">${o(n.norme)}</td>
    </tr>
  `).join("");e.innerHTML=`
    <div class="ax-page ax-gs-451">
      <header class="ax-gs-210">
        <h1 class="ax-gs-333">🏢 Studio Bâtiment</h1>
        <span class="ax-gs-3">DTU · normes · métré</span>
      </header>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Métré rapide pièce</h2>
        <input type="number" id="ax-bld-l" aria-label="Longueur de la pièce en mètres" placeholder="Longueur (m)" min="0.1" step="0.01" class="ax-gs-455">
        <input type="number" id="ax-bld-w" aria-label="Largeur de la pièce en mètres" placeholder="Largeur (m)" min="0.1" step="0.01" class="ax-gs-455">
        <input type="number" id="ax-bld-h" aria-label="Hauteur sous plafond en mètres" placeholder="Hauteur (m)" min="0.1" step="0.01" value="2.5" class="ax-gs-455">
        <input type="text" id="ax-bld-name" aria-label="Nom de la pièce" placeholder="Nom pièce (ex : Salon)" maxlength="40" value="Pièce" class="ax-gs-455">
        <button class="ax-btn ax-btn-primary ax-gs-401" id="ax-bld-go">Calculer + plan</button>
        <div id="ax-bld-out" class="ax-gs-248"></div>
      </div>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Dimensions standards</h2>
        <table style="width:100%;border-collapse:collapse;font-size:12px;color:#fff">
          <thead><tr style="border-bottom:2px solid #c9a227"><th class="ax-gs-457">Élément</th><th class="ax-gs-457">Dimensions</th><th class="ax-gs-457">Norme</th></tr></thead>
          <tbody>${a}</tbody>
        </table>
      </div>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">DTU principaux</h2>
        <ul style="margin:0;padding-left:18px;color:#ddd">${i}</ul>
      </div>

      <p class="ax-gs-212"><a href="#studios" class="ax-gs-198">← Retour studios</a></p>
    </div>
  `,$(e)}function $(e){const t=e.querySelector("#ax-bld-go"),i=e.querySelector("#ax-bld-out");!t||!i||!d||(d.bind(t,"click",()=>{h.tap();const a=parseFloat(e.querySelector("#ax-bld-l")?.value??""),n=parseFloat(e.querySelector("#ax-bld-w")?.value??""),l=parseFloat(e.querySelector("#ax-bld-h")?.value??""),r=(e.querySelector("#ax-bld-name")?.value??"Pièce").slice(0,40),s=g(a,n,l);if(!s){i.innerHTML='<div style="color:#ff8866">Dimensions invalides.</div>';return}i.innerHTML=`
      ${v(a,n,r)}
      <pre class="ax-gs-456">Surface : ${s.surface_m2} m²
Périmètre : ${s.perimetre_m} m
Volume : ${s.volume_m3} m³
Plinthes : ${s.plinthe_ml} mL</pre>
    `}),u.info("studios-building","rendered"))}export{f as DTU_REFS,b as STANDARD_DIMS,g as calcMetre,C as dispose,z as render,v as svgPlanView};
