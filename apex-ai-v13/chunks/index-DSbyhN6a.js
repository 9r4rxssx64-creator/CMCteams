import{l as h}from"./monitoring-BAiQJoxJ.js";import{c as _}from"./listener-cleanup-Y2rGGxxX.js";import{h as x}from"./haptic-BUEqXK0N.js";let n=null;function C(){n?.cleanup(),n=null}function p(e){return e.replace(/[&<>"']/g,i=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[i]??i)}const b=[{zone:"H1a",bbio_max:72,cep_max:75,description:"Nord-Est (Strasbourg, Reims)"},{zone:"H1b",bbio_max:65,cep_max:70,description:"Centre (Paris, Tours)"},{zone:"H1c",bbio_max:60,cep_max:65,description:"Centre-Est (Lyon, Grenoble)"},{zone:"H2a",bbio_max:65,cep_max:65,description:"Bretagne, Pays de Loire"},{zone:"H2b",bbio_max:60,cep_max:60,description:"Sud-Ouest Atlantique (Bordeaux)"},{zone:"H2c",bbio_max:55,cep_max:55,description:"Sud (Toulouse, Montpellier)"},{zone:"H2d",bbio_max:55,cep_max:50,description:"Méditerranée (Marseille, Nice, Monaco)"},{zone:"H3",bbio_max:50,cep_max:50,description:"Côte méditerranéenne très chaude"}],g=[{type:"Béton de propreté",ciment_kg_m3:150,sable_kg_m3:800,gravier_kg_m3:1100,eau_l_m3:100,usage:"Couche sous fondations"},{type:"Béton dosage 250",ciment_kg_m3:250,sable_kg_m3:750,gravier_kg_m3:1100,eau_l_m3:130,usage:"Dalle non porteuse, terrasse"},{type:"Béton dosage 300",ciment_kg_m3:300,sable_kg_m3:720,gravier_kg_m3:1080,eau_l_m3:150,usage:"Dalle porteuse, fondation maison"},{type:"Béton dosage 350",ciment_kg_m3:350,sable_kg_m3:700,gravier_kg_m3:1050,eau_l_m3:175,usage:"Béton armé, poteau, poutre"},{type:"Béton dosage 400",ciment_kg_m3:400,sable_kg_m3:680,gravier_kg_m3:1020,eau_l_m3:200,usage:"Béton structurel résistant"}],f=[{id:"door_width",label:"Largeur porte d'entrée",min_value_cm:83,description:"Loi 2005-102. Passage utile ≥ 83 cm."},{id:"corridor_width",label:"Largeur couloir",min_value_cm:90,description:"Largeur libre ≥ 90 cm."},{id:"shower_size",label:"Douche italienne",min_value_cm:120,description:"Espace minimum 120×90 cm."},{id:"turn_circle",label:"Aire de rotation",min_value_cm:150,description:"Diamètre Ø1.50 m libre."},{id:"wc_clearance",label:"Espace latéral WC",min_value_cm:80,description:"Latéral ≥ 80 cm pour transfert."},{id:"ramp_slope_pct",label:"Pente rampe (%)",min_value_cm:5,description:"Max 5% (sinon palier + main courante)."}],q=240,L=230,y=60,v=64;function k(e){return!isFinite(e)||e<=0?0:Math.round(e*.95*100)/100}function S(e,i){if(!isFinite(e)||e<=0)return null;const a=g.find(s=>s.type===i);if(!a)return null;const t=Math.round(e*a.ciment_kg_m3);return{volume_m3:e,ciment_kg:t,sable_kg:Math.round(e*a.sable_kg_m3),gravier_kg:Math.round(e*a.gravier_kg_m3),eau_l:Math.round(e*a.eau_l_m3),sacs_ciment_35kg:Math.ceil(t/35)}}function z(e,i,a,t=2){if(!isFinite(e)||e<=0||!isFinite(i)||i<=0||!isFinite(a)||a<=0||t<1||t>5)return null;const s=2*(e+i)*a,m=e*i,d=(s+m)*t,r=Math.ceil(d/10),c=Math.floor(r/5),l=Math.ceil((r-c*5)/2.5);return{surface_a_peindre_m2:Math.round(d*100)/100,litres_total:r,pots_5l:c,pots_2_5l:l<0?0:l}}function H(e,i,a=10){if(!isFinite(e)||e<=0||!isFinite(i)||i<=0)return null;const t=e*i,s=t*(1+a/100);return{surface_m2:Math.round(t*100)/100,surface_avec_chutes_m2:Math.round(s*100)/100}}function F(e,i){const a=2*e+i;return a<y?{ok:!1,valeur:a,recommandation:"Marches trop basses ou giron trop court (escalier raide à monter)."}:a>v?{ok:!1,valeur:a,recommandation:"Marches trop hautes ou giron trop long (escalier difficile)."}:{ok:!0,valeur:a,recommandation:"Escalier conforme à l'échelle Blondel."}}function N(e){n?.cleanup(),n=_("studios-architecture");const i=g.map(t=>`<option value="${p(t.type)}">${p(t.type)} — ${p(t.usage)}</option>`).join(""),a=b.map(t=>`<option value="${p(t.zone)}">${p(t.zone)} — ${p(t.description)}</option>`).join("");e.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:780px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">🏗 Studio Architecture</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">RE2020 + calculs construction</span>
      </header>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Surface habitable (loi Boutin)</h2>
        <input type="number" id="ax-archi-surface" placeholder="Surface brute (m²)" min="1" step="0.01" style="width:100%;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <button class="ax-btn ax-btn-primary" id="ax-archi-surface-btn" style="margin-top:8px;min-height:44px">Calculer</button>
        <div id="ax-archi-surface-out" style="margin-top:8px;color:#c9a227"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Béton (proportions)</h2>
        <input type="number" id="ax-archi-vol" placeholder="Volume (m³)" min="0.01" step="0.01" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <select id="ax-archi-dosage" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">${i}</select>
        <button class="ax-btn ax-btn-primary" id="ax-archi-beton-btn" style="min-height:44px">Calculer béton</button>
        <pre id="ax-archi-beton-out" style="margin-top:8px;color:#c9a227;white-space:pre-wrap;font-size:13px"></pre>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Peinture (litres pour pièce)</h2>
        <input type="number" id="ax-archi-l" placeholder="Longueur (m)" min="0.5" step="0.1" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="number" id="ax-archi-w" placeholder="Largeur (m)" min="0.5" step="0.1" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="number" id="ax-archi-h" placeholder="Hauteur (m)" min="2" max="10" step="0.1" value="2.5" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <button class="ax-btn ax-btn-primary" id="ax-archi-paint-btn" style="min-height:44px">Calculer peinture</button>
        <pre id="ax-archi-paint-out" style="margin-top:8px;color:#c9a227;white-space:pre-wrap;font-size:13px"></pre>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">RE2020 — Zone climatique</h2>
        <select id="ax-archi-zone" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">${a}</select>
        <div id="ax-archi-zone-out" style="margin-top:8px;color:#c9a227;font-size:13px"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Normes PMR (loi 2005-102)</h2>
        <ul style="margin:0;padding-left:18px;color:var(--ax-text-dim);font-size:13px">
          ${f.map(t=>`<li><strong style="color:#c9a227">${p(t.label)} :</strong> ≥ ${t.min_value_cm} cm — ${p(t.description)}</li>`).join("")}
        </ul>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#studios" style="color:#c9a227">← Retour studios</a></p>
    </div>
  `,M(e)}function M(e){const i=e.querySelector("#ax-archi-surface-btn");i&&n&&n.bind(i,"click",()=>{x.tap();const r=e.querySelector("#ax-archi-surface"),c=e.querySelector("#ax-archi-surface-out");if(!r||!c)return;const l=parseFloat(r.value),o=k(l);c.textContent=o>0?`Surface habitable estimée : ${o} m²`:"Saisis une surface valide."});const a=e.querySelector("#ax-archi-beton-btn");a&&n&&n.bind(a,"click",()=>{x.tap();const r=parseFloat(e.querySelector("#ax-archi-vol")?.value??""),c=e.querySelector("#ax-archi-dosage")?.value??"",l=e.querySelector("#ax-archi-beton-out");if(!l)return;const o=S(r,c);if(!o){l.textContent="Volume invalide.";return}l.textContent=`Volume : ${o.volume_m3} m³
Ciment : ${o.ciment_kg} kg (${o.sacs_ciment_35kg} sacs de 35 kg)
Sable : ${o.sable_kg} kg
Gravier : ${o.gravier_kg} kg
Eau : ${o.eau_l} L`});const t=e.querySelector("#ax-archi-paint-btn");t&&n&&n.bind(t,"click",()=>{x.tap();const r=parseFloat(e.querySelector("#ax-archi-l")?.value??""),c=parseFloat(e.querySelector("#ax-archi-w")?.value??""),l=parseFloat(e.querySelector("#ax-archi-h")?.value??""),o=e.querySelector("#ax-archi-paint-out");if(!o)return;const u=z(r,c,l,2);if(!u){o.textContent="Dimensions invalides.";return}o.textContent=`Surface peinte (2 couches) : ${u.surface_a_peindre_m2} m²
Total : ${u.litres_total} litres
≈ ${u.pots_5l} pots de 5L + ${u.pots_2_5l} pots de 2.5L`});const s=e.querySelector("#ax-archi-zone"),m=e.querySelector("#ax-archi-zone-out"),d=()=>{if(!s||!m)return;const r=b.find(c=>c.zone===s.value);r&&(m.textContent=`${r.zone} — ${r.description}. Bbio max ${r.bbio_max} pts · Cep max ${r.cep_max} kWh/m²/an.`)};s&&n&&(n.bind(s,"change",d),d()),h.info("studios-architecture","rendered")}export{g as BETON_DOSAGES,v as BLONDEL_MAX,y as BLONDEL_MIN,q as HSP_MIN_FR,L as HSP_MIN_MONACO,f as PMR_NORMS,b as RE2020_ZONES,S as calcBeton,z as calcPeinture,H as calcRevetement,k as calcSurfaceHabitable,F as checkBlondel,C as dispose,p as escapeHtml,N as render};
