import{l as u}from"./monitoring-BAiQJoxJ.js";import{c as h}from"./listener-cleanup-Y2rGGxxX.js";import{h as d}from"./haptic-BUEqXK0N.js";import{toast as y}from"./toast-Dgg9rcIP.js";let c=null;function k(){c?.cleanup(),c=null}function l(t){return t.replace(/[&<>"']/g,o=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[o]??o)}const g={lat:43.7384,lon:7.4246},b=[{id:"casino",name:"Casino de Monte-Carlo",category:"Casino",emoji:"🎰",description:"Casino historique 1863",lat:43.7396,lon:7.4286},{id:"palais",name:"Palais Princier",category:"Monument",emoji:"🏰",description:"Résidence des Grimaldi",lat:43.7311,lon:7.4197},{id:"oceano",name:"Musée océanographique",category:"Musée",emoji:"🐠",description:"Fondé par Albert Ier",lat:43.7301,lon:7.4254},{id:"larvotto",name:"Plage du Larvotto",category:"Plage",emoji:"🏖",description:"Plage publique aménagée",lat:43.7466,lon:7.4356},{id:"jardin",name:"Jardin Exotique",category:"Jardin",emoji:"🌵",description:"Cactus et grotte",lat:43.7298,lon:7.4109},{id:"fontvieille",name:"Port de Fontvieille",category:"Port",emoji:"⛵",description:"Marina et héliport",lat:43.7305,lon:7.4195},{id:"cathedrale",name:"Cathédrale de Monaco",category:"Monument",emoji:"⛪",description:"Tombeau de Grace Kelly",lat:43.7302,lon:7.4234},{id:"gpx",name:"Circuit Grand Prix F1",category:"Sport",emoji:"🏎",description:"Tracé urbain F1",lat:43.7347,lon:7.4197}],M="https://nominatim.openstreetmap.org/search",v=8e3,$=6371;function m(t,o){const e=f=>f*Math.PI/180,a=e(o.lat-t.lat),r=e(o.lon-t.lon),n=e(t.lat),i=e(o.lat),s=Math.sin(a/2)**2+Math.sin(r/2)**2*Math.cos(n)*Math.cos(i);return Math.round(2*$*Math.asin(Math.sqrt(s))*100)/100}function p(t,o){const e=Math.abs(t),a=Math.floor(e),r=(e-a)*60,n=Math.floor(r),i=Math.round((r-n)*60*100)/100,s=o?t>=0?"N":"S":t>=0?"E":"O";return`${a}°${n}'${i}"${s}`}function C(t){return isFinite(t.lat)&&isFinite(t.lon)&&t.lat>=-90&&t.lat<=90&&t.lon>=-180&&t.lon<=180}async function j(t){if(!t||t.trim().length<3||typeof fetch>"u")return null;const o=new AbortController,e=setTimeout(()=>o.abort(),v);try{const a=`${M}?format=json&limit=1&q=${encodeURIComponent(t)}`,r=await fetch(a,{signal:o.signal,headers:{Accept:"application/json"}});if(!r.ok)return null;const n=await r.json();if(!Array.isArray(n)||n.length===0)return null;const i=n[0];if(!i)return null;const s={lat:parseFloat(i.lat),lon:parseFloat(i.lon)};return C(s)?s:null}catch(a){return u.warn("studios-geo","geocode failed",{err:a}),null}finally{clearTimeout(e)}}function x(t,o){return`https://maps.apple.com/?ll=${t.lat},${t.lon}${o?`&q=${encodeURIComponent(o)}`:""}`}function A(t){return`https://www.google.com/maps?q=${t.lat},${t.lon}`}function P(t){c?.cleanup(),c=h("studios-geo");const o=b.map(e=>{const a=m(g,e);return`
      <div style="background:rgba(255,255,255,0.03);border:1px solid #333;border-radius:8px;padding:10px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:22px">${e.emoji}</span>
          <div style="flex:1">
            <div style="font-weight:700;color:#c9a227;font-size:13px">${l(e.name)}</div>
            <div style="font-size:11px;color:var(--ax-text-dim)">${l(e.category)} · ${a} km du centre</div>
          </div>
          <a href="${l(x(e,e.name))}" target="_blank" rel="noopener" style="color:#c9a227;text-decoration:none;font-size:18px" title="Apple Maps">🗺</a>
        </div>
      </div>
    `}).join("");t.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:780px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">🗺 Studio Géo</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">Géocodage + distances</span>
      </header>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Adresse → coordonnées</h2>
        <input type="text" id="ax-geo-addr" placeholder="ex : Place du Casino, Monaco" autocomplete="off" style="width:100%;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <button class="ax-btn ax-btn-primary" id="ax-geo-go" style="margin-top:8px;min-height:44px">Géocoder</button>
        <div id="ax-geo-out" style="margin-top:12px;color:#c9a227;font-size:13px"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Lieux remarquables Monaco</h2>
        <div style="display:grid;grid-template-columns:1fr;gap:6px">${o}</div>
      </div>

      <p style="font-size:11px;color:#666;text-align:center;margin-top:12px">© OpenStreetMap contributors</p>
      <p style="margin-top:24px;text-align:center"><a href="#studios" style="color:#c9a227">← Retour studios</a></p>
    </div>
  `,F(t)}function F(t){const o=t.querySelector("#ax-geo-go"),e=t.querySelector("#ax-geo-addr"),a=t.querySelector("#ax-geo-out");!o||!e||!a||!c||(c.bind(o,"click",()=>{const r=e.value.trim();if(!r){a.textContent="Saisis une adresse.";return}d.tap(),a.textContent="⏳ Recherche…",j(r).then(n=>{if(!n){a.textContent="Adresse introuvable. Vérifie l'orthographe ou ta connexion.",y.warn("Géocodage KO");return}const i=m(g,n);a.innerHTML=`
        <div style="line-height:1.6">
          <strong>Coordonnées trouvées :</strong><br>
          DD : <code>${n.lat.toFixed(6)}, ${n.lon.toFixed(6)}</code><br>
          DMS : <code>${l(p(n.lat,!0))} · ${l(p(n.lon,!1))}</code><br>
          Distance Monaco : <strong>${i} km</strong> (${(i/1.609).toFixed(1)} mi)<br>
          <a href="${l(x(n,r))}" target="_blank" rel="noopener" style="color:#c9a227;margin-right:12px">🗺 Apple Maps</a>
          <a href="${l(A(n))}" target="_blank" rel="noopener" style="color:#c9a227">🗺 Google Maps</a>
        </div>
      `,d.success()})}),u.info("studios-geo","rendered"))}export{g as MONACO_REF,b as POIS_MONACO,x as appleMapsUrl,p as ddToDms,k as dispose,l as escapeHtml,j as geocodeAddress,A as googleMapsUrl,m as haversineKm,C as isValidLatLon,P as render};
