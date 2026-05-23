import{a as s}from"./escape-html-DGIYNPKb.js";import{c as f}from"./listener-cleanup-Y2rGGxxX.js";import{q as u,C as M}from"./monitoring-R6_kBcE7.js";import{g as v}from"./apex-tools-dispatch-core-ZfdoIE-H.js";import{haptic as d}from"./haptic-CQFg2PXZ.js";import{toast as y}from"./toast-CRdbcLoc.js";import"./multi-source-analyze-XlVpTFLz.js";import"./apex-kb-0sanZVD_.js";import"./credential-patterns-CLzI061R.js";import"./apex-tools-dispatch-skills-Dh_ZxzbQ.js";import"./apex-tools-dispatch-data-rCsAnzSr.js";import"./apex-tools-dispatch-finance-DoRAfEZC.js";import"./apex-tools-dispatch-misc-BE1GVz_r.js";import"./apex-tools-misc-W6algOoR.js";import"./apex-tools-registry-core-CQvgkOQw.js";import"./apex-tools-registry-skills-DRX4PPQ_.js";let c=null;function E(){c?.cleanup(),c=null}const g={lat:43.7384,lon:7.4246},b=[{id:"casino",name:"Casino de Monte-Carlo",category:"Casino",emoji:"🎰",description:"Casino historique 1863",lat:43.7396,lon:7.4286},{id:"palais",name:"Palais Princier",category:"Monument",emoji:"🏰",description:"Résidence des Grimaldi",lat:43.7311,lon:7.4197},{id:"oceano",name:"Musée océanographique",category:"Musée",emoji:"🐠",description:"Fondé par Albert Ier",lat:43.7301,lon:7.4254},{id:"larvotto",name:"Plage du Larvotto",category:"Plage",emoji:"🏖",description:"Plage publique aménagée",lat:43.7466,lon:7.4356},{id:"jardin",name:"Jardin Exotique",category:"Jardin",emoji:"🌵",description:"Cactus et grotte",lat:43.7298,lon:7.4109},{id:"fontvieille",name:"Port de Fontvieille",category:"Port",emoji:"⛵",description:"Marina et héliport",lat:43.7305,lon:7.4195},{id:"cathedrale",name:"Cathédrale de Monaco",category:"Monument",emoji:"⛪",description:"Tombeau de Grace Kelly",lat:43.7302,lon:7.4234},{id:"gpx",name:"Circuit Grand Prix F1",category:"Sport",emoji:"🏎",description:"Tracé urbain F1",lat:43.7347,lon:7.4197}],$="https://nominatim.openstreetmap.org/search",C=8e3,A=6371;function m(t,a){const n=h=>h*Math.PI/180,o=n(a.lat-t.lat),r=n(a.lon-t.lon),e=n(t.lat),i=n(a.lat),l=Math.sin(o/2)**2+Math.sin(r/2)**2*Math.cos(e)*Math.cos(i);return Math.round(2*A*Math.asin(Math.sqrt(l))*100)/100}function p(t,a){const n=Math.abs(t),o=Math.floor(n),r=(n-o)*60,e=Math.floor(r),i=Math.round((r-e)*60*100)/100,l=a?t>=0?"N":"S":t>=0?"E":"O";return`${o}°${e}'${i}"${l}`}function F(t){return isFinite(t.lat)&&isFinite(t.lon)&&t.lat>=-90&&t.lat<=90&&t.lon>=-180&&t.lon<=180}async function j(t){if(!t||t.trim().length<3||typeof fetch>"u")return null;const a=new AbortController,n=setTimeout(()=>a.abort(),C);try{const o=`${$}?format=json&limit=1&q=${encodeURIComponent(t)}`,r=await fetch(o,{signal:a.signal,headers:{Accept:"application/json"}});if(!r.ok)return null;const e=await r.json();if(!Array.isArray(e)||e.length===0)return null;const i=e[0];if(!i)return null;const l={lat:parseFloat(i.lat),lon:parseFloat(i.lon)};return F(l)?l:null}catch(o){return u.warn("studios-geo","geocode failed",{err:o}),null}finally{clearTimeout(n)}}function x(t,a){return`https://maps.apple.com/?ll=${t.lat},${t.lon}${a?`&q=${encodeURIComponent(a)}`:""}`}function S(t){return`https://www.google.com/maps?q=${t.lat},${t.lon}`}function J(t){c?.cleanup(),c=f("studios-geo");const a=M.get("user")?.id??"anon";if(!v("studio.geo",t,a))return;const n=b.map(o=>{const r=m(g,o);return`
      <div style="background:rgba(255,255,255,0.03);border:1px solid #333;border-radius:8px;padding:10px">
        <div class="ax-gs-103">
          <span class="ax-gs-170">${o.emoji}</span>
          <div class="ax-gs-26">
            <div class="ax-gs-79">${s(o.name)}</div>
            <div class="ax-gs-2">${s(o.category)} · ${r} km du centre</div>
          </div>
          <a href="${s(x(o,o.name))}" target="_blank" rel="noopener" style="color:#c9a227;text-decoration:none;font-size:18px" title="Apple Maps">🗺</a>
        </div>
      </div>
    `}).join("");t.innerHTML=`
    <div class="ax-page ax-gs-451">
      <header class="ax-gs-210">
        <h1 class="ax-gs-333">🗺 Studio Géo</h1>
        <span class="ax-gs-3">Géocodage + distances</span>
      </header>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Adresse → coordonnées</h2>
        <input type="text" id="ax-geo-addr" aria-label="Adresse à géocoder" placeholder="ex : Place du Casino, Monaco" autocomplete="off" class="ax-gs-453">
        <button class="ax-btn ax-btn-primary ax-gs-454" id="ax-geo-go">Géocoder</button>
        <div id="ax-geo-out" style="margin-top:12px;color:#c9a227;font-size:13px"></div>
      </div>

      <div class="ax-gs-1">
        <h2 class="ax-gs-452">Lieux remarquables Monaco</h2>
        <div style="display:grid;grid-template-columns:1fr;gap:6px">${n}</div>
      </div>

      <p style="font-size:11px;color:#666;text-align:center;margin-top:12px">© OpenStreetMap contributors</p>
      <p class="ax-gs-212"><a href="#studios" class="ax-gs-198">← Retour studios</a></p>
    </div>
  `,q(t)}function q(t){const a=t.querySelector("#ax-geo-go"),n=t.querySelector("#ax-geo-addr"),o=t.querySelector("#ax-geo-out");!a||!n||!o||!c||(c.bind(a,"click",()=>{const r=n.value.trim();if(!r){o.textContent="Saisis une adresse.";return}d.tap(),o.textContent="⏳ Recherche…",j(r).then(e=>{if(!e){o.textContent="Adresse introuvable. Vérifie l'orthographe ou ta connexion.",y.warn("Géocodage KO");return}const i=m(g,e);o.innerHTML=`
        <div style="line-height:1.6">
          <strong>Coordonnées trouvées :</strong><br>
          DD : <code>${e.lat.toFixed(6)}, ${e.lon.toFixed(6)}</code><br>
          DMS : <code>${s(p(e.lat,!0))} · ${s(p(e.lon,!1))}</code><br>
          Distance Monaco : <strong>${i} km</strong> (${(i/1.609).toFixed(1)} mi)<br>
          <a href="${s(x(e,r))}" target="_blank" rel="noopener" style="color:#c9a227;margin-right:12px">🗺 Apple Maps</a>
          <a href="${s(S(e))}" target="_blank" rel="noopener" class="ax-gs-198">🗺 Google Maps</a>
        </div>
      `,d.success()})}),u.info("studios-geo","rendered"))}export{g as MONACO_REF,b as POIS_MONACO,x as appleMapsUrl,p as ddToDms,E as dispose,s as escapeHtml,j as geocodeAddress,S as googleMapsUrl,m as haversineKm,F as isValidLatLon,J as render};
