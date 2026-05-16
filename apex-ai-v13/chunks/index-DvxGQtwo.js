import{c as h}from"./listener-cleanup-Y2rGGxxX.js";import{l as u}from"./monitoring-3uBGKGRH.js";import{s as y}from"../core/main-Chf9Kx4D.js";import{g as b}from"./apex-tools-dispatch-core-CscT1PrL.js";import{haptic as d}from"./haptic-CQFg2PXZ.js";import{toast as M}from"./toast-ClsF1KRZ.js";import"./apex-kb-Ss-LQHUo.js";import"./credential-patterns-CLzI061R.js";import"./multi-source-analyze-Cb_4xPK7.js";import"./apex-tools-dispatch-skills-0fh-89Jk.js";import"./apex-tools-dispatch-data-C9w8sOql.js";import"./apex-tools-dispatch-finance-D84Ce07W.js";import"./apex-tools-dispatch-misc-BT0loxBS.js";import"./apex-tools-registry-CTvFo_GP.js";import"./voice-DMlxiGcD.js";let c=null;function K(){c?.cleanup(),c=null}function l(t){return t.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}const m={lat:43.7384,lon:7.4246},v=[{id:"casino",name:"Casino de Monte-Carlo",category:"Casino",emoji:"🎰",description:"Casino historique 1863",lat:43.7396,lon:7.4286},{id:"palais",name:"Palais Princier",category:"Monument",emoji:"🏰",description:"Résidence des Grimaldi",lat:43.7311,lon:7.4197},{id:"oceano",name:"Musée océanographique",category:"Musée",emoji:"🐠",description:"Fondé par Albert Ier",lat:43.7301,lon:7.4254},{id:"larvotto",name:"Plage du Larvotto",category:"Plage",emoji:"🏖",description:"Plage publique aménagée",lat:43.7466,lon:7.4356},{id:"jardin",name:"Jardin Exotique",category:"Jardin",emoji:"🌵",description:"Cactus et grotte",lat:43.7298,lon:7.4109},{id:"fontvieille",name:"Port de Fontvieille",category:"Port",emoji:"⛵",description:"Marina et héliport",lat:43.7305,lon:7.4195},{id:"cathedrale",name:"Cathédrale de Monaco",category:"Monument",emoji:"⛪",description:"Tombeau de Grace Kelly",lat:43.7302,lon:7.4234},{id:"gpx",name:"Circuit Grand Prix F1",category:"Sport",emoji:"🏎",description:"Tracé urbain F1",lat:43.7347,lon:7.4197}],$="https://nominatim.openstreetmap.org/search",C=8e3,A=6371;function g(t,e){const a=f=>f*Math.PI/180,o=a(e.lat-t.lat),r=a(e.lon-t.lon),n=a(t.lat),i=a(e.lat),s=Math.sin(o/2)**2+Math.sin(r/2)**2*Math.cos(n)*Math.cos(i);return Math.round(2*A*Math.asin(Math.sqrt(s))*100)/100}function p(t,e){const a=Math.abs(t),o=Math.floor(a),r=(a-o)*60,n=Math.floor(r),i=Math.round((r-n)*60*100)/100,s=e?t>=0?"N":"S":t>=0?"E":"O";return`${o}°${n}'${i}"${s}`}function j(t){return isFinite(t.lat)&&isFinite(t.lon)&&t.lat>=-90&&t.lat<=90&&t.lon>=-180&&t.lon<=180}async function F(t){if(!t||t.trim().length<3||typeof fetch>"u")return null;const e=new AbortController,a=setTimeout(()=>e.abort(),C);try{const o=`${$}?format=json&limit=1&q=${encodeURIComponent(t)}`,r=await fetch(o,{signal:e.signal,headers:{Accept:"application/json"}});if(!r.ok)return null;const n=await r.json();if(!Array.isArray(n)||n.length===0)return null;const i=n[0];if(!i)return null;const s={lat:parseFloat(i.lat),lon:parseFloat(i.lon)};return j(s)?s:null}catch(o){return u.warn("studios-geo","geocode failed",{err:o}),null}finally{clearTimeout(a)}}function x(t,e){return`https://maps.apple.com/?ll=${t.lat},${t.lon}${e?`&q=${encodeURIComponent(e)}`:""}`}function S(t){return`https://www.google.com/maps?q=${t.lat},${t.lon}`}function E(t){c?.cleanup(),c=h("studios-geo");const e=y.get("user")?.id??"anon";if(!b("studio.geo",t,e))return;const a=v.map(o=>{const r=g(m,o);return`
      <div style="background:rgba(255,255,255,0.03);border:1px solid #333;border-radius:8px;padding:10px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:22px">${o.emoji}</span>
          <div style="flex:1">
            <div style="font-weight:700;color:#c9a227;font-size:13px">${l(o.name)}</div>
            <div style="font-size:11px;color:var(--ax-text-dim)">${l(o.category)} · ${r} km du centre</div>
          </div>
          <a href="${l(x(o,o.name))}" target="_blank" rel="noopener" style="color:#c9a227;text-decoration:none;font-size:18px" title="Apple Maps">🗺</a>
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
        <input type="text" id="ax-geo-addr" aria-label="Adresse à géocoder" placeholder="ex : Place du Casino, Monaco" autocomplete="off" style="width:100%;padding:10px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <button class="ax-btn ax-btn-primary" id="ax-geo-go" style="margin-top:8px;min-height:44px">Géocoder</button>
        <div id="ax-geo-out" style="margin-top:12px;color:#c9a227;font-size:13px"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Lieux remarquables Monaco</h2>
        <div style="display:grid;grid-template-columns:1fr;gap:6px">${a}</div>
      </div>

      <p style="font-size:11px;color:#666;text-align:center;margin-top:12px">© OpenStreetMap contributors</p>
      <p style="margin-top:24px;text-align:center"><a href="#studios" style="color:#c9a227">← Retour studios</a></p>
    </div>
  `,q(t)}function q(t){const e=t.querySelector("#ax-geo-go"),a=t.querySelector("#ax-geo-addr"),o=t.querySelector("#ax-geo-out");!e||!a||!o||!c||(c.bind(e,"click",()=>{const r=a.value.trim();if(!r){o.textContent="Saisis une adresse.";return}d.tap(),o.textContent="⏳ Recherche…",F(r).then(n=>{if(!n){o.textContent="Adresse introuvable. Vérifie l'orthographe ou ta connexion.",M.warn("Géocodage KO");return}const i=g(m,n);o.innerHTML=`
        <div style="line-height:1.6">
          <strong>Coordonnées trouvées :</strong><br>
          DD : <code>${n.lat.toFixed(6)}, ${n.lon.toFixed(6)}</code><br>
          DMS : <code>${l(p(n.lat,!0))} · ${l(p(n.lon,!1))}</code><br>
          Distance Monaco : <strong>${i} km</strong> (${(i/1.609).toFixed(1)} mi)<br>
          <a href="${l(x(n,r))}" target="_blank" rel="noopener" style="color:#c9a227;margin-right:12px">🗺 Apple Maps</a>
          <a href="${l(S(n))}" target="_blank" rel="noopener" style="color:#c9a227">🗺 Google Maps</a>
        </div>
      `,d.success()})}),u.info("studios-geo","rendered"))}export{m as MONACO_REF,v as POIS_MONACO,x as appleMapsUrl,p as ddToDms,K as dispose,l as escapeHtml,F as geocodeAddress,S as googleMapsUrl,g as haversineKm,j as isValidLatLon,E as render};
