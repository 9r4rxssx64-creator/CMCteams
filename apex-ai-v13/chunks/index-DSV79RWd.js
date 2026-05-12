import{c as h}from"./listener-cleanup-Y2rGGxxX.js";import{l as _}from"./monitoring-3uBGKGRH.js";import{s as f}from"../core/main-0m-Lk24j.js";import{g as y}from"./apex-tools-dispatch-TlxFdg3r.js";import{haptic as x}from"./haptic-CQFg2PXZ.js";import"./apex-kb-D4uVYgZ7.js";import"./credential-patterns-D-srKehy.js";import"./multi-source-analyze-Cm5HpYlv.js";import"./apex-tools-registry-QHHothtE.js";import"./voice-Db_3I5Yf.js";let c=null;function D(){c?.cleanup(),c=null}function p(e){return e.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r]??r)}const b=[{zone:"H1a",bbio_max:72,cep_max:75,description:"Nord-Est (Strasbourg, Reims)"},{zone:"H1b",bbio_max:65,cep_max:70,description:"Centre (Paris, Tours)"},{zone:"H1c",bbio_max:60,cep_max:65,description:"Centre-Est (Lyon, Grenoble)"},{zone:"H2a",bbio_max:65,cep_max:65,description:"Bretagne, Pays de Loire"},{zone:"H2b",bbio_max:60,cep_max:60,description:"Sud-Ouest Atlantique (Bordeaux)"},{zone:"H2c",bbio_max:55,cep_max:55,description:"Sud (Toulouse, Montpellier)"},{zone:"H2d",bbio_max:55,cep_max:50,description:"Méditerranée (Marseille, Nice, Monaco)"},{zone:"H3",bbio_max:50,cep_max:50,description:"Côte méditerranéenne très chaude"}],g=[{type:"Béton de propreté",ciment_kg_m3:150,sable_kg_m3:800,gravier_kg_m3:1100,eau_l_m3:100,usage:"Couche sous fondations"},{type:"Béton dosage 250",ciment_kg_m3:250,sable_kg_m3:750,gravier_kg_m3:1100,eau_l_m3:130,usage:"Dalle non porteuse, terrasse"},{type:"Béton dosage 300",ciment_kg_m3:300,sable_kg_m3:720,gravier_kg_m3:1080,eau_l_m3:150,usage:"Dalle porteuse, fondation maison"},{type:"Béton dosage 350",ciment_kg_m3:350,sable_kg_m3:700,gravier_kg_m3:1050,eau_l_m3:175,usage:"Béton armé, poteau, poutre"},{type:"Béton dosage 400",ciment_kg_m3:400,sable_kg_m3:680,gravier_kg_m3:1020,eau_l_m3:200,usage:"Béton structurel résistant"}],v=[{id:"door_width",label:"Largeur porte d'entrée",min_value_cm:83,description:"Loi 2005-102. Passage utile ≥ 83 cm."},{id:"corridor_width",label:"Largeur couloir",min_value_cm:90,description:"Largeur libre ≥ 90 cm."},{id:"shower_size",label:"Douche italienne",min_value_cm:120,description:"Espace minimum 120×90 cm."},{id:"turn_circle",label:"Aire de rotation",min_value_cm:150,description:"Diamètre Ø1.50 m libre."},{id:"wc_clearance",label:"Espace latéral WC",min_value_cm:80,description:"Latéral ≥ 80 cm pour transfert."},{id:"ramp_slope_pct",label:"Pente rampe (%)",min_value_cm:5,description:"Max 5% (sinon palier + main courante)."}],A=240,T=230,k=60,S=64;function z(e){return!isFinite(e)||e<=0?0:Math.round(e*.95*100)/100}function M(e,r){if(!isFinite(e)||e<=0)return null;const t=g.find(a=>a.type===r);if(!t)return null;const o=Math.round(e*t.ciment_kg_m3);return{volume_m3:e,ciment_kg:o,sable_kg:Math.round(e*t.sable_kg_m3),gravier_kg:Math.round(e*t.gravier_kg_m3),eau_l:Math.round(e*t.eau_l_m3),sacs_ciment_35kg:Math.ceil(o/35)}}function $(e,r,t,o=2){if(!isFinite(e)||e<=0||!isFinite(r)||r<=0||!isFinite(t)||t<=0||o<1||o>5)return null;const a=2*(e+r)*t,m=e*r,d=(a+m)*o,i=Math.ceil(d/10),s=Math.floor(i/5),l=Math.ceil((i-s*5)/2.5);return{surface_a_peindre_m2:Math.round(d*100)/100,litres_total:i,pots_5l:s,pots_2_5l:l<0?0:l}}function j(e,r,t=10){if(!isFinite(e)||e<=0||!isFinite(r)||r<=0)return null;const o=e*r,a=o*(1+t/100);return{surface_m2:Math.round(o*100)/100,surface_avec_chutes_m2:Math.round(a*100)/100}}function V(e,r){const t=2*e+r;return t<k?{ok:!1,valeur:t,recommandation:"Marches trop basses ou giron trop court (escalier raide à monter)."}:t>S?{ok:!1,valeur:t,recommandation:"Marches trop hautes ou giron trop long (escalier difficile)."}:{ok:!0,valeur:t,recommandation:"Escalier conforme à l'échelle Blondel."}}function G(e){c?.cleanup(),c=h("studios-architecture");const r=f.get("user")?.id??"anon";if(!y("studio.architecture",e,r))return;const t=g.map(a=>`<option value="${p(a.type)}">${p(a.type)} — ${p(a.usage)}</option>`).join(""),o=b.map(a=>`<option value="${p(a.zone)}">${p(a.zone)} — ${p(a.description)}</option>`).join("");e.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:780px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">🏗 Studio Architecture</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">RE2020 + calculs construction</span>
      </header>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Surface habitable (loi Boutin)</h2>
        <input type="number" id="ax-archi-surface" aria-label="Surface brute en mètres carrés" placeholder="Surface brute (m²)" min="1" step="0.01" style="width:100%;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <button class="ax-btn ax-btn-primary" id="ax-archi-surface-btn" style="margin-top:8px;min-height:44px">Calculer</button>
        <div id="ax-archi-surface-out" style="margin-top:8px;color:#c9a227"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Béton (proportions)</h2>
        <input type="number" id="ax-archi-vol" aria-label="Volume de béton en mètres cubes" placeholder="Volume (m³)" min="0.01" step="0.01" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <select id="ax-archi-dosage" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">${t}</select>
        <button class="ax-btn ax-btn-primary" id="ax-archi-beton-btn" style="min-height:44px">Calculer béton</button>
        <pre id="ax-archi-beton-out" style="margin-top:8px;color:#c9a227;white-space:pre-wrap;font-size:13px"></pre>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Peinture (litres pour pièce)</h2>
        <input type="number" id="ax-archi-l" aria-label="Longueur de la pièce en mètres" placeholder="Longueur (m)" min="0.5" step="0.1" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="number" id="ax-archi-w" aria-label="Largeur de la pièce en mètres" placeholder="Largeur (m)" min="0.5" step="0.1" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="number" id="ax-archi-h" aria-label="Hauteur sous plafond en mètres" placeholder="Hauteur (m)" min="2" max="10" step="0.1" value="2.5" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <button class="ax-btn ax-btn-primary" id="ax-archi-paint-btn" style="min-height:44px">Calculer peinture</button>
        <pre id="ax-archi-paint-out" style="margin-top:8px;color:#c9a227;white-space:pre-wrap;font-size:13px"></pre>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">RE2020 — Zone climatique</h2>
        <select id="ax-archi-zone" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">${o}</select>
        <div id="ax-archi-zone-out" style="margin-top:8px;color:#c9a227;font-size:13px"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Normes PMR (loi 2005-102)</h2>
        <ul style="margin:0;padding-left:18px;color:var(--ax-text-dim);font-size:13px">
          ${v.map(a=>`<li><strong style="color:#c9a227">${p(a.label)} :</strong> ≥ ${a.min_value_cm} cm — ${p(a.description)}</li>`).join("")}
        </ul>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#studios" style="color:#c9a227">← Retour studios</a></p>
    </div>
  `,B(e)}function B(e){const r=e.querySelector("#ax-archi-surface-btn");r&&c&&c.bind(r,"click",()=>{x.tap();const i=e.querySelector("#ax-archi-surface"),s=e.querySelector("#ax-archi-surface-out");if(!i||!s)return;const l=parseFloat(i.value),n=z(l);s.textContent=n>0?`Surface habitable estimée : ${n} m²`:"Saisis une surface valide."});const t=e.querySelector("#ax-archi-beton-btn");t&&c&&c.bind(t,"click",()=>{x.tap();const i=parseFloat(e.querySelector("#ax-archi-vol")?.value??""),s=e.querySelector("#ax-archi-dosage")?.value??"",l=e.querySelector("#ax-archi-beton-out");if(!l)return;const n=M(i,s);if(!n){l.textContent="Volume invalide.";return}l.textContent=`Volume : ${n.volume_m3} m³
Ciment : ${n.ciment_kg} kg (${n.sacs_ciment_35kg} sacs de 35 kg)
Sable : ${n.sable_kg} kg
Gravier : ${n.gravier_kg} kg
Eau : ${n.eau_l} L`});const o=e.querySelector("#ax-archi-paint-btn");o&&c&&c.bind(o,"click",()=>{x.tap();const i=parseFloat(e.querySelector("#ax-archi-l")?.value??""),s=parseFloat(e.querySelector("#ax-archi-w")?.value??""),l=parseFloat(e.querySelector("#ax-archi-h")?.value??""),n=e.querySelector("#ax-archi-paint-out");if(!n)return;const u=$(i,s,l,2);if(!u){n.textContent="Dimensions invalides.";return}n.textContent=`Surface peinte (2 couches) : ${u.surface_a_peindre_m2} m²
Total : ${u.litres_total} litres
≈ ${u.pots_5l} pots de 5L + ${u.pots_2_5l} pots de 2.5L`});const a=e.querySelector("#ax-archi-zone"),m=e.querySelector("#ax-archi-zone-out"),d=()=>{if(!a||!m)return;const i=b.find(s=>s.zone===a.value);i&&(m.textContent=`${i.zone} — ${i.description}. Bbio max ${i.bbio_max} pts · Cep max ${i.cep_max} kWh/m²/an.`)};a&&c&&(c.bind(a,"change",d),d()),_.info("studios-architecture","rendered")}export{g as BETON_DOSAGES,S as BLONDEL_MAX,k as BLONDEL_MIN,A as HSP_MIN_FR,T as HSP_MIN_MONACO,v as PMR_NORMS,b as RE2020_ZONES,M as calcBeton,$ as calcPeinture,j as calcRevetement,z as calcSurfaceHabitable,V as checkBlondel,D as dispose,p as escapeHtml,G as render};
