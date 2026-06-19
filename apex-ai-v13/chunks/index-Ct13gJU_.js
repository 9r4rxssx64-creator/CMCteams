import{b,e as u,l as h}from"./monitoring-BIhGYvG3.js";import{c as f}from"./listener-cleanup-Y2rGGxxX.js";import{g as v}from"./apex-tools-dispatch-core-hEX7adCJ.js";import{haptic as _}from"./haptic-CQFg2PXZ.js";import"./multi-source-analyze-DivxHzon.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-C9TmwGFA.js";import"./apex-tools-dispatch-skills-D-LfalYe.js";import"./apex-tools-dispatch-data-BjvfRMGf.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-ClJ9QxKG.js";import"./apex-tools-misc-DCV8UzsT.js";import"./apex-tools-registry-core-BMhHY4vU.js";import"./apex-tools-registry-skills-x-mAWYry.js";let o=null;function j(){o?.cleanup(),o=null}const x=[{zone:"H1a",bbio_max:72,cep_max:75,description:"Nord-Est (Strasbourg, Reims)"},{zone:"H1b",bbio_max:65,cep_max:70,description:"Centre (Paris, Tours)"},{zone:"H1c",bbio_max:60,cep_max:65,description:"Centre-Est (Lyon, Grenoble)"},{zone:"H2a",bbio_max:65,cep_max:65,description:"Bretagne, Pays de Loire"},{zone:"H2b",bbio_max:60,cep_max:60,description:"Sud-Ouest Atlantique (Bordeaux)"},{zone:"H2c",bbio_max:55,cep_max:55,description:"Sud (Toulouse, Montpellier)"},{zone:"H2d",bbio_max:55,cep_max:50,description:"Méditerranée (Marseille, Nice, Monaco)"},{zone:"H3",bbio_max:50,cep_max:50,description:"Côte méditerranéenne très chaude"}],g=[{type:"Béton de propreté",ciment_kg_m3:150,sable_kg_m3:800,gravier_kg_m3:1100,eau_l_m3:100,usage:"Couche sous fondations"},{type:"Béton dosage 250",ciment_kg_m3:250,sable_kg_m3:750,gravier_kg_m3:1100,eau_l_m3:130,usage:"Dalle non porteuse, terrasse"},{type:"Béton dosage 300",ciment_kg_m3:300,sable_kg_m3:720,gravier_kg_m3:1080,eau_l_m3:150,usage:"Dalle porteuse, fondation maison"},{type:"Béton dosage 350",ciment_kg_m3:350,sable_kg_m3:700,gravier_kg_m3:1050,eau_l_m3:175,usage:"Béton armé, poteau, poutre"},{type:"Béton dosage 400",ciment_kg_m3:400,sable_kg_m3:680,gravier_kg_m3:1020,eau_l_m3:200,usage:"Béton structurel résistant"}],k=[{id:"door_width",label:"Largeur porte d'entrée",min_value_cm:83,description:"Loi 2005-102. Passage utile ≥ 83 cm."},{id:"corridor_width",label:"Largeur couloir",min_value_cm:90,description:"Largeur libre ≥ 90 cm."},{id:"shower_size",label:"Douche italienne",min_value_cm:120,description:"Espace minimum 120×90 cm."},{id:"turn_circle",label:"Aire de rotation",min_value_cm:150,description:"Diamètre Ø1.50 m libre."},{id:"wc_clearance",label:"Espace latéral WC",min_value_cm:80,description:"Latéral ≥ 80 cm pour transfert."},{id:"ramp_slope_pct",label:"Pente rampe (%)",min_value_cm:5,description:"Max 5% (sinon palier + main courante)."}],G=240,I=230,S=60,y=64;function M(e){return!isFinite(e)||e<=0?0:Math.round(e*.95*100)/100}function $(e,i){if(!isFinite(e)||e<=0)return null;const a=g.find(t=>t.type===i);if(!a)return null;const r=Math.round(e*a.ciment_kg_m3);return{volume_m3:e,ciment_kg:r,sable_kg:Math.round(e*a.sable_kg_m3),gravier_kg:Math.round(e*a.gravier_kg_m3),eau_l:Math.round(e*a.eau_l_m3),sacs_ciment_35kg:Math.ceil(r/35)}}function z(e,i,a,r=2){if(!isFinite(e)||e<=0||!isFinite(i)||i<=0||!isFinite(a)||a<=0||r<1||r>5)return null;const t=2*(e+i)*a,d=e*i,p=(t+d)*r,n=Math.ceil(p/10),c=Math.floor(n/5),l=Math.ceil((n-c*5)/2.5);return{surface_a_peindre_m2:Math.round(p*100)/100,litres_total:n,pots_5l:c,pots_2_5l:l<0?0:l}}function Z(e,i,a=10){if(!isFinite(e)||e<=0||!isFinite(i)||i<=0)return null;const r=e*i,t=r*(1+a/100);return{surface_m2:Math.round(r*100)/100,surface_avec_chutes_m2:Math.round(t*100)/100}}function W(e,i){const a=2*e+i;return a<S?{ok:!1,valeur:a,recommandation:"Marches trop basses ou giron trop court (escalier raide à monter)."}:a>y?{ok:!1,valeur:a,recommandation:"Marches trop hautes ou giron trop long (escalier difficile)."}:{ok:!0,valeur:a,recommandation:"Escalier conforme à l'échelle Blondel."}}function X(e){o?.cleanup(),o=f("studios-architecture");const i=b.get("user")?.id??"anon";if(!v("studio.architecture",e,i))return;const a=g.map(t=>`<option value="${u(t.type)}">${u(t.type)} — ${u(t.usage)}</option>`).join(""),r=x.map(t=>`<option value="${u(t.zone)}">${u(t.zone)} — ${u(t.description)}</option>`).join("");e.innerHTML=`
    <div class="ax-page ax-gs-451">
      <header class="ax-gs-210">
        <h1 class="ax-gs-333">🏗 Studio Architecture</h1>
        <span class="ax-gs-3">RE2020 + calculs construction</span>
      </header>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Surface habitable (loi Boutin)</h2>
        <input type="number" id="ax-archi-surface" aria-label="Surface brute en mètres carrés" placeholder="Surface brute (m²)" min="1" step="0.01" class="ax-gs-453">
        <button class="ax-btn ax-btn-primary ax-gs-454" id="ax-archi-surface-btn">Calculer</button>
        <div id="ax-archi-surface-out" class="ax-gs-253"></div>
      </div>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Béton (proportions)</h2>
        <input type="number" id="ax-archi-vol" aria-label="Volume de béton en mètres cubes" placeholder="Volume (m³)" min="0.01" step="0.01" class="ax-gs-455">
        <select id="ax-archi-dosage" class="ax-gs-455">${a}</select>
        <button class="ax-btn ax-btn-primary ax-gs-401" id="ax-archi-beton-btn">Calculer béton</button>
        <pre id="ax-archi-beton-out" class="ax-gs-456"></pre>
      </div>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Peinture (litres pour pièce)</h2>
        <input type="number" id="ax-archi-l" aria-label="Longueur de la pièce en mètres" placeholder="Longueur (m)" min="0.5" step="0.1" class="ax-gs-455">
        <input type="number" id="ax-archi-w" aria-label="Largeur de la pièce en mètres" placeholder="Largeur (m)" min="0.5" step="0.1" class="ax-gs-455">
        <input type="number" id="ax-archi-h" aria-label="Hauteur sous plafond en mètres" placeholder="Hauteur (m)" min="2" max="10" step="0.1" value="2.5" class="ax-gs-455">
        <button class="ax-btn ax-btn-primary ax-gs-401" id="ax-archi-paint-btn">Calculer peinture</button>
        <pre id="ax-archi-paint-out" class="ax-gs-456"></pre>
      </div>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">RE2020 — Zone climatique</h2>
        <select id="ax-archi-zone" class="ax-gs-455">${r}</select>
        <div id="ax-archi-zone-out" style="margin-top:8px;color:#c9a227;font-size:13px"></div>
      </div>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Normes PMR (loi 2005-102)</h2>
        <ul style="margin:0;padding-left:18px;color:var(--ax-text-dim);font-size:13px">
          ${k.map(t=>`<li><strong class="ax-gs-266">${u(t.label)} :</strong> ≥ ${t.min_value_cm} cm — ${u(t.description)}</li>`).join("")}
        </ul>
      </div>

      <p class="ax-gs-212"><a href="#studios" class="ax-gs-198">← Retour studios</a></p>
    </div>
  `,B(e)}function B(e){const i=e.querySelector("#ax-archi-surface-btn");i&&o&&o.bind(i,"click",()=>{_.tap();const n=e.querySelector("#ax-archi-surface"),c=e.querySelector("#ax-archi-surface-out");if(!n||!c)return;const l=parseFloat(n.value),s=M(l);c.textContent=s>0?`Surface habitable estimée : ${s} m²`:"Saisis une surface valide."});const a=e.querySelector("#ax-archi-beton-btn");a&&o&&o.bind(a,"click",()=>{_.tap();const n=parseFloat(e.querySelector("#ax-archi-vol")?.value??""),c=e.querySelector("#ax-archi-dosage")?.value??"",l=e.querySelector("#ax-archi-beton-out");if(!l)return;const s=$(n,c);if(!s){l.textContent="Volume invalide.";return}l.textContent=`Volume : ${s.volume_m3} m³
Ciment : ${s.ciment_kg} kg (${s.sacs_ciment_35kg} sacs de 35 kg)
Sable : ${s.sable_kg} kg
Gravier : ${s.gravier_kg} kg
Eau : ${s.eau_l} L`});const r=e.querySelector("#ax-archi-paint-btn");r&&o&&o.bind(r,"click",()=>{_.tap();const n=parseFloat(e.querySelector("#ax-archi-l")?.value??""),c=parseFloat(e.querySelector("#ax-archi-w")?.value??""),l=parseFloat(e.querySelector("#ax-archi-h")?.value??""),s=e.querySelector("#ax-archi-paint-out");if(!s)return;const m=z(n,c,l,2);if(!m){s.textContent="Dimensions invalides.";return}s.textContent=`Surface peinte (2 couches) : ${m.surface_a_peindre_m2} m²
Total : ${m.litres_total} litres
≈ ${m.pots_5l} pots de 5L + ${m.pots_2_5l} pots de 2.5L`});const t=e.querySelector("#ax-archi-zone"),d=e.querySelector("#ax-archi-zone-out"),p=()=>{if(!t||!d)return;const n=x.find(c=>c.zone===t.value);n&&(d.textContent=`${n.zone} — ${n.description}. Bbio max ${n.bbio_max} pts · Cep max ${n.cep_max} kWh/m²/an.`)};t&&o&&(o.bind(t,"change",p),p()),h.info("studios-architecture","rendered")}export{g as BETON_DOSAGES,y as BLONDEL_MAX,S as BLONDEL_MIN,G as HSP_MIN_FR,I as HSP_MIN_MONACO,k as PMR_NORMS,x as RE2020_ZONES,$ as calcBeton,z as calcPeinture,Z as calcRevetement,M as calcSurfaceHabitable,W as checkBlondel,j as dispose,u as escapeHtml,X as render};
