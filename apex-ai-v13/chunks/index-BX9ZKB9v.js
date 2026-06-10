import{l as u,e as p}from"./monitoring-8ioY434g.js";import"./multi-source-analyze-DkniHD_x.js";import"./credential-patterns-DUMYZEMu.js";import"./apex-kb-DGzz0lus.js";const v="apex_v13_geo_favorites",w="apex_v13_geo_last_position",x="apex_v13_geo_fences",y="apex_v13_geo_history",_=1e3,$="https://nominatim.openstreetmap.org",C="https://api.open-meteo.com/v1/forecast",S={0:"Ciel clair",1:"Principalement clair",2:"Partiellement nuageux",3:"Couvert",45:"Brouillard",48:"Brouillard givrant",51:"Bruine légère",53:"Bruine modérée",55:"Bruine dense",61:"Pluie légère",63:"Pluie modérée",65:"Pluie forte",71:"Neige légère",73:"Neige modérée",75:"Neige forte",77:"Grains de neige",80:"Averses légères",81:"Averses modérées",82:"Averses violentes",85:"Averses de neige légères",86:"Averses de neige fortes",95:"Orage",96:"Orage avec grêle",99:"Orage violent grêle"};class L{async getCurrentPosition(e){if(typeof navigator>"u"||!navigator.geolocation)throw new Error("Geolocation API not available");const t=e??{enableHighAccuracy:!0,timeout:3e4,maximumAge:0};return new Promise((o,a)=>{navigator.geolocation.getCurrentPosition(n=>{const i={latitude:n.coords.latitude,longitude:n.coords.longitude,accuracy:n.coords.accuracy,altitude:n.coords.altitude,altitudeAccuracy:n.coords.altitudeAccuracy,heading:n.coords.heading,speed:n.coords.speed,timestamp:n.timestamp||Date.now()};this.saveLastPosition(i),this.appendHistory(i),this.checkGeofences(i),o(i)},n=>{u.warn("geolocation","getCurrentPosition error",{code:n.code,msg:n.message}),a(new Error(n.message||`Geolocation error code ${n.code}`))},t)})}watchPosition(e,t){if(typeof navigator>"u"||!navigator.geolocation)return u.warn("geolocation","watchPosition unsupported"),-1;const o=t??{enableHighAccuracy:!0,maximumAge:5e3,timeout:6e4};return navigator.geolocation.watchPosition(a=>{const n={latitude:a.coords.latitude,longitude:a.coords.longitude,accuracy:a.coords.accuracy,altitude:a.coords.altitude,altitudeAccuracy:a.coords.altitudeAccuracy,heading:a.coords.heading,speed:a.coords.speed,timestamp:a.timestamp||Date.now()};this.saveLastPosition(n),this.appendHistoryThrottled(n),this.checkGeofences(n);try{e(n)}catch(i){u.warn("geolocation","watchPosition callback threw",{err:i})}},a=>{u.warn("geolocation","watchPosition error",{code:a.code,msg:a.message})},o)}clearWatch(e){if(!(typeof navigator>"u"||!navigator.geolocation)&&!(e<0))try{navigator.geolocation.clearWatch(e)}catch(t){u.warn("geolocation","clearWatch failed",{err:t})}}async reverseGeocode(e,t,o){const a=o??"fr",n=`${$}/reverse?format=json&lat=${encodeURIComponent(String(e))}&lon=${encodeURIComponent(String(t))}&accept-language=${encodeURIComponent(a)}&zoom=18`,i=await fetch(n,{headers:{Accept:"application/json","User-Agent":"ApexAI-v13"}});if(!i.ok)throw new Error(`Nominatim reverseGeocode HTTP ${i.status}`);const s=await i.json(),c=s.address??{},d={country:c.country??"",countryCode:(c.country_code??"").toUpperCase(),city:c.city??c.town??c.village??c.municipality??""};return(c.state??c.region)&&(d.region=c.state??c.region),c.postcode&&(d.postalCode=c.postcode),c.road&&(d.street=c.road),c.house_number&&(d.houseNumber=c.house_number),s.display_name&&(d.displayName=s.display_name),d}async geocode(e,t=5){const o=`${$}/search?format=json&q=${encodeURIComponent(e)}&limit=${encodeURIComponent(String(t))}&accept-language=fr`,a=await fetch(o,{headers:{Accept:"application/json","User-Agent":"ApexAI-v13"}});if(!a.ok)throw new Error(`Nominatim geocode HTTP ${a.status}`);return(await a.json()).map(i=>{const s={lat:parseFloat(i.lat),lng:parseFloat(i.lon),displayName:i.display_name};return i.type&&(s.type=i.type),s})}distanceBetween(e,t){const a=d=>d*Math.PI/180,n=a(t.lat-e.lat),i=a(t.lng-e.lng),s=Math.sin(n/2)*Math.sin(n/2)+Math.cos(a(e.lat))*Math.cos(a(t.lat))*Math.sin(i/2)*Math.sin(i/2);return 6371*(2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s)))}bearingBetween(e,t){const o=l=>l*Math.PI/180,a=l=>l*180/Math.PI,n=o(e.lat),i=o(t.lat),s=o(t.lng-e.lng),c=Math.sin(s)*Math.cos(i),d=Math.cos(n)*Math.sin(i)-Math.sin(n)*Math.cos(i)*Math.cos(s);return(a(Math.atan2(c,d))+360)%360}async checkPermission(){try{return typeof navigator>"u"||!navigator.permissions?"prompt":(await navigator.permissions.query({name:"geolocation"})).state}catch(e){return u.debug("geolocation","checkPermission fallback prompt",{err:e}),"prompt"}}async getLocalWeather(e,t){let o;if(typeof e=="number"&&typeof t=="number")o={lat:e,lng:t};else{const l=await this.getCurrentPosition();o={lat:l.latitude,lng:l.longitude}}const a=`${C}?latitude=${o.lat}&longitude=${o.lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=7&timezone=auto`,n=await fetch(a,{headers:{Accept:"application/json"}});if(!n.ok)throw new Error(`Open-Meteo HTTP ${n.status}`);const i=await n.json(),s=i.current,c=i.daily;if(!s||!c)throw new Error("Open-Meteo malformed response");const d=[];for(let l=0;l<c.time.length;l++){const A=c.time[l]??"",b=c.weather_code[l]??0,M=c.temperature_2m_max[l]??0,P=c.temperature_2m_min[l]??0,I=c.precipitation_sum[l]??0;d.push({date:A,tempMin:P,tempMax:M,condition:S[b]??`Code ${b}`,precipMm:I})}const h={temp:s.temperature_2m,apparent:s.apparent_temperature,condition:S[s.weather_code]??`Code ${s.weather_code}`,forecast7d:d};return typeof s.relative_humidity_2m=="number"&&(h.humidity=s.relative_humidity_2m),typeof s.wind_speed_10m=="number"&&(h.windKph=s.wind_speed_10m),h}getLocalTime(e,t){const o=Math.round(t/15),a=new Date,n=a.getTime()+a.getTimezoneOffset()*6e4,i=new Date(n+o*36e5),s=String(i.getHours()).padStart(2,"0"),c=String(i.getMinutes()).padStart(2,"0");return{time:`${s}:${c}`,timezone:`UTC${o>=0?"+":""}${o}`,offset:o}}async getCountryFromIP(){try{const e=await fetch("https://www.cloudflare.com/cdn-cgi/trace",{method:"GET",headers:{Accept:"text/plain"}});if(e.ok){const o=(await e.text()).split(`
`),a={};for(const i of o){const s=i.indexOf("=");s>0&&(a[i.slice(0,s)]=i.slice(s+1))}const n=(a.loc??"").toUpperCase();if(n){const i={country:n,countryCode:n};return a.ip&&(i.ip=a.ip),i}}}catch(e){u.debug("geolocation","Cloudflare trace failed",{err:e})}try{const e=await fetch("https://ipapi.co/json/",{headers:{Accept:"application/json"}});if(e.ok){const t=await e.json(),o={country:t.country_name??"",countryCode:(t.country_code??"").toUpperCase()};return t.city&&(o.city=t.city),t.region&&(o.region=t.region),t.ip&&(o.ip=t.ip),o}}catch(e){u.debug("geolocation","ipapi failed",{err:e})}return{country:"Monaco",countryCode:"MC"}}saveFavoriteLocation(e){const t={id:`fav_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`,name:e.name,lat:e.lat,lng:e.lng,type:e.type??"other",createdAt:Date.now()},o=this.getFavoriteLocations();o.push(t);try{localStorage.setItem(v,JSON.stringify(o))}catch(a){u.warn("geolocation","saveFavoriteLocation storage failed",{err:a})}return t}getFavoriteLocations(){try{const e=localStorage.getItem(v);if(!e)return[];const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}removeFavoriteLocation(e){const t=this.getFavoriteLocations(),o=t.filter(a=>a.id!==e);if(o.length===t.length)return!1;try{return localStorage.setItem(v,JSON.stringify(o)),!0}catch{return!1}}watchGeofence(e){const t={id:`gf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`,name:e.name,lat:e.lat,lng:e.lng,radius:e.radius};e.onEnter&&(t.onEnter=e.onEnter),e.onExit&&(t.onExit=e.onExit),this.fenceCallbacks.set(t.id,t);const o=this.getStoredGeofences();o.push({id:t.id,name:t.name,lat:t.lat,lng:t.lng,radius:t.radius});try{localStorage.setItem(x,JSON.stringify(o))}catch(a){u.warn("geolocation","watchGeofence storage failed",{err:a})}return t.id}removeGeofence(e){const t=this.getStoredGeofences().filter(o=>o.id!==e);this.fenceCallbacks.delete(e);try{return localStorage.setItem(x,JSON.stringify(t)),!0}catch{return!1}}getGeofences(){return this.getStoredGeofences()}checkGeofences(e){const t=this.getStoredGeofences();if(t.length)for(const o of t){const n=this.distanceBetween({lat:e.latitude,lng:e.longitude},{lat:o.lat,lng:o.lng})*1e3<=o.radius,i=`apex_v13_geo_inside_${o.id}`;let s=!1;try{s=localStorage.getItem(i)==="true"}catch{}if(n!==s){try{localStorage.setItem(i,String(n))}catch{}const c=this.fenceCallbacks.get(o.id);if(c)try{n&&c.onEnter?c.onEnter():!n&&c.onExit&&c.onExit()}catch(d){u.warn("geolocation","geofence callback threw",{id:o.id,err:d})}}}}getLastKnownPosition(){try{const e=localStorage.getItem(w);return e?JSON.parse(e):null}catch{return null}}getHistory(){try{const e=localStorage.getItem(y);if(!e)return[];const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}clearHistory(){try{localStorage.removeItem(y)}catch{}}fenceCallbacks=new Map;lastHistoryAppend=0;saveLastPosition(e){try{localStorage.setItem(w,JSON.stringify(e))}catch(t){u.debug("geolocation","saveLastPosition skipped (quota?)",{err:t})}}appendHistory(e){try{const t=this.getHistory();t.push(e);const o=t.length>_?t.slice(-_):t;localStorage.setItem(y,JSON.stringify(o))}catch(t){u.debug("geolocation","appendHistory skipped",{err:t})}}appendHistoryThrottled(e){const t=Date.now();t-this.lastHistoryAppend<6e4||(this.lastHistoryAppend=t,this.appendHistory(e))}getStoredGeofences(){try{const e=localStorage.getItem(x);if(!e)return[];const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}}const g=new L;let f=-1;function O(r){return r<=10?{label:"Excellente",color:"#4ade80"}:r<=50?{label:"Bonne",color:"#60a5fa"}:r<=500?{label:"Moyenne",color:"#facc15"}:{label:"Approximative",color:"#f87171"}}function k(r){const e=O(r.accuracy),t=r.latitude.toFixed(6),o=r.longitude.toFixed(6);let a="";return r.altitude!==null&&r.altitude!==void 0&&(a+=`<br><span class="ax-gs-10">Altitude:</span> ${Math.round(r.altitude)}m`),r.speed!==null&&r.speed!==void 0&&r.speed>0&&(a+=`<br><span class="ax-gs-10">Vitesse:</span> ${Math.round(r.speed*3.6)} km/h`),`
    <div style="font-size:13px;line-height:1.6">
      <strong>GPS</strong> · précision <span style="color:${e.color}">${e.label}</span> (${Math.round(r.accuracy)}m)<br>
      <span class="ax-gs-10">Lat:</span> ${t}<br>
      <span class="ax-gs-10">Lng:</span> ${o}${a}<br>
      <span class="ax-gs-10">Mise à jour:</span> ${new Date(r.timestamp).toLocaleString("fr-FR")}
    </div>
  `}function G(r){return r.length?r.map(e=>`
        <div class="ax-gs-135">
          <div>
            <strong>${p(e.name)}</strong>
            <span class="ax-gs-136"> · ${p(e.type??"other")}</span>
            <div class="ax-gs-8">${e.lat.toFixed(5)}, ${e.lng.toFixed(5)}</div>
          </div>
          <button class="ax-btn ax-btn-danger ax-gs-380" data-action="remove-fav" data-fav-id="${p(e.id)}">Supprimer</button>
        </div>
      `).join(""):'<div class="ax-gs-5">Aucun lieu favori. Cliquez "Ajouter ma position" pour en créer un.</div>'}function H(r){const e=r.forecast7d.slice(0,7).map(t=>{const a=new Date(t.date).toLocaleDateString("fr-FR",{weekday:"short",day:"2-digit",month:"2-digit"});return`
        <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;border-bottom:1px solid var(--ax-border)">
          <span>${p(a)}</span>
          <span class="ax-gs-10">${p(t.condition)}</span>
          <span><strong>${Math.round(t.tempMin)}°</strong> / ${Math.round(t.tempMax)}°</span>
        </div>
      `}).join("");return`
    <div style="font-size:14px;margin-bottom:12px">
      <strong>${Math.round(r.temp)}°C</strong> · ${p(r.condition)}
      ${r.humidity!==void 0&&r.humidity!==null?` · 💧 ${Math.round(r.humidity)}%`:""}
      ${r.windKph!==void 0&&r.windKph!==null?` · 💨 ${Math.round(r.windKph)} km/h`:""}
    </div>
    ${e}
  `}function m(r){const e=g.getLastKnownPosition(),t=g.getFavoriteLocations(),o=g.getGeofences(),a=g.getHistory(),n=f!==-1,i=e?k(e):'<div class="ax-gs-5">Aucune position enregistrée</div>',s=e?`
        <div class="ax-gs-129">
          <a href="https://www.google.com/maps?q=${e.latitude},${e.longitude}" target="_blank" rel="noopener" class="ax-btn ax-btn-outline ax-gs-230">🗺 Google Maps</a>
          <button class="ax-btn ax-btn-outline ax-gs-381" data-action="refresh-position">↻ Actualiser</button>
          <button class="ax-btn ax-btn-outline ax-gs-381" data-action="share-position">📤 Partager</button>
        </div>
      `:'<button class="ax-btn ax-btn-primary" data-action="refresh-position" style="margin-top:10px;min-height:44px">📍 Obtenir ma position</button>',c=a.slice(-30).reverse(),d=c.length?c.map(l=>`
            <div style="font-size:11px;padding:4px 0;border-bottom:1px solid var(--ax-border);display:flex;justify-content:space-between;gap:8px">
              <span>${l.latitude.toFixed(4)}, ${l.longitude.toFixed(4)} <span class="ax-gs-10">(${Math.round(l.accuracy)}m)</span></span>
              <span class="ax-gs-10">${new Date(l.timestamp).toLocaleTimeString("fr-FR")}</span>
            </div>
          `).join(""):'<div class="ax-gs-5">Aucun historique</div>',h=o.length?o.map(l=>`
            <div class="ax-gs-135">
              <div>
                <strong>${p(l.name)}</strong>
                <div class="ax-gs-8">${l.lat.toFixed(5)}, ${l.lng.toFixed(5)} · rayon ${l.radius}m</div>
              </div>
              <button class="ax-btn ax-btn-danger ax-gs-380" data-action="remove-fence" data-fence-id="${p(l.id)}">Supprimer</button>
            </div>
          `).join(""):'<div class="ax-gs-5">Aucune zone définie. Ajoutez votre position courante comme zone.</div>';r.innerHTML=`
    <div class="ax-page ax-gs-332">
      <header class="ax-gs-210">
        <h1 style="margin:0;background:linear-gradient(135deg,#c9a227,#ffd700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">📍 Géolocalisation</h1>
        <span class="ax-gs-3">${t.length} favoris · ${o.length} zones</span>
      </header>

      <div class="ax-card ax-gs-382">
        <h3 class="ax-gs-383">Position actuelle</h3>
        ${i}
        ${s}
      </div>

      <div class="ax-card ax-gs-382">
        <h3 class="ax-gs-383">Suivi continu</h3>
        <div style="font-size:12px;color:var(--ax-text-dim);margin-bottom:8px">Met à jour automatiquement la position et détecte entrées/sorties des zones définies.</div>
        <button class="ax-btn ${n?"ax-btn-danger":"ax-btn-primary"}" data-action="toggle-tracking" style="min-height:44px;width:100%">${n?"⏹ Arrêter le suivi":"▶ Démarrer le suivi continu"}</button>
      </div>

      <div class="ax-card ax-gs-382">
        <header class="ax-gs-214">
          <h3 class="ax-gs-333">Lieux favoris</h3>
          <button class="ax-btn ax-btn-primary ax-gs-384" data-action="add-fav">+ Ajouter ici</button>
        </header>
        ${G(t)}
      </div>

      <div class="ax-card ax-gs-382">
        <header class="ax-gs-214">
          <h3 class="ax-gs-333">Zones (geofences)</h3>
          <button class="ax-btn ax-btn-primary ax-gs-384" data-action="add-fence">+ Créer une zone</button>
        </header>
        ${h}
      </div>

      <div class="ax-card ax-gs-382">
        <header class="ax-gs-214">
          <h3 class="ax-gs-333">Météo locale 7 jours</h3>
          <button class="ax-btn ax-btn-outline ax-gs-384" data-action="load-weather">Charger</button>
        </header>
        <div id="ax-geo-weather"><div class="ax-gs-5">Cliquez "Charger" pour afficher la météo Open-Meteo gratuite.</div></div>
      </div>

      <div class="ax-card ax-gs-382">
        <h3 class="ax-gs-383">Historique — 30 derniers points</h3>
        ${d}
      </div>

      <p style="font-size:10px;color:var(--ax-text-dim);text-align:center;padding:8px">
        Précision : GPS ~5m · WiFi ~50m · Réseau IP ~50km<br>
        Données privées. Aucune sync Firebase (privacy P0).
      </p>

      <p class="ax-gs-212"><a href="#chat" class="ax-gs-198">← Retour chat</a></p>
    </div>
  `,T(r)}function T(r){const e=(t,o)=>{if(t==="refresh-position")g.getCurrentPosition().then(()=>m(r)).catch(a=>{u.warn("geo-view","getCurrentPosition failed",{err:a}),alert("Impossible d'obtenir votre position. Vérifiez les autorisations GPS.")});else if(t==="share-position"){const a=g.getLastKnownPosition();if(!a)return;const n=`https://maps.google.com/?q=${a.latitude},${a.longitude}`,i=navigator;i.share?i.share({title:"Ma position",url:n}).catch(()=>{}):navigator.clipboard&&navigator.clipboard.writeText(n).catch(()=>{})}else if(t==="toggle-tracking")f!==-1?(g.clearWatch(f),f=-1):f=g.watchPosition(()=>{m(r)}),m(r);else if(t==="add-fav"){const a=g.getLastKnownPosition();if(!a){alert("Obtenez d'abord votre position.");return}const n=prompt("Nom du lieu favori (ex: Maison, Bureau) :");if(!n)return;g.saveFavoriteLocation({name:n,lat:a.latitude,lng:a.longitude,type:"other"}),m(r)}else if(t==="remove-fav"){const a=o.dataset.favId;a&&g.removeFavoriteLocation(a)&&m(r)}else if(t==="add-fence"){const a=g.getLastKnownPosition();if(!a){alert("Obtenez d'abord votre position.");return}const n=prompt("Nom de la zone (ex: Casino, Domicile) :");if(!n)return;const i=prompt("Rayon en mètres (défaut 100) :","100"),s=Math.max(10,parseInt(i??"100",10)||100);g.watchGeofence({name:n,lat:a.latitude,lng:a.longitude,radius:s}),m(r)}else if(t==="remove-fence"){const a=o.dataset.fenceId;a&&g.removeGeofence(a)&&m(r)}else if(t==="load-weather"){const a=r.querySelector("#ax-geo-weather");if(!a)return;a.innerHTML='<div class="ax-gs-5">Chargement…</div>';const n=g.getLastKnownPosition();(n?g.getLocalWeather(n.latitude,n.longitude):g.getLocalWeather()).then(s=>{a.innerHTML=H(s)}).catch(s=>{u.warn("geo-view","weather load failed",{err:s}),a.innerHTML='<div style="font-size:12px;color:#f87171">Impossible de charger la météo.</div>'})}};r.querySelectorAll("[data-action]").forEach(t=>{t.addEventListener("click",()=>{const o=t.dataset.action;o&&e(o,t)})})}export{p as escapeHtml,m as render};
