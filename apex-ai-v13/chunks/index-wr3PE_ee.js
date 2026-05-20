import{e as u}from"./escape-html-BlQj2yEF.js";import{l as g}from"./monitoring-3uBGKGRH.js";const x="apex_v13_geo_favorites",w="apex_v13_geo_last_position",y="apex_v13_geo_fences",v="apex_v13_geo_history",_=1e3,$="https://nominatim.openstreetmap.org",C="https://api.open-meteo.com/v1/forecast",S={0:"Ciel clair",1:"Principalement clair",2:"Partiellement nuageux",3:"Couvert",45:"Brouillard",48:"Brouillard givrant",51:"Bruine légère",53:"Bruine modérée",55:"Bruine dense",61:"Pluie légère",63:"Pluie modérée",65:"Pluie forte",71:"Neige légère",73:"Neige modérée",75:"Neige forte",77:"Grains de neige",80:"Averses légères",81:"Averses modérées",82:"Averses violentes",85:"Averses de neige légères",86:"Averses de neige fortes",95:"Orage",96:"Orage avec grêle",99:"Orage violent grêle"};class k{async getCurrentPosition(e){if(typeof navigator>"u"||!navigator.geolocation)throw new Error("Geolocation API not available");const t=e??{enableHighAccuracy:!0,timeout:3e4,maximumAge:0};return new Promise((a,o)=>{navigator.geolocation.getCurrentPosition(n=>{const i={latitude:n.coords.latitude,longitude:n.coords.longitude,accuracy:n.coords.accuracy,altitude:n.coords.altitude,altitudeAccuracy:n.coords.altitudeAccuracy,heading:n.coords.heading,speed:n.coords.speed,timestamp:n.timestamp||Date.now()};this.saveLastPosition(i),this.appendHistory(i),this.checkGeofences(i),a(i)},n=>{g.warn("geolocation","getCurrentPosition error",{code:n.code,msg:n.message}),o(new Error(n.message||`Geolocation error code ${n.code}`))},t)})}watchPosition(e,t){if(typeof navigator>"u"||!navigator.geolocation)return g.warn("geolocation","watchPosition unsupported"),-1;const a=t??{enableHighAccuracy:!0,maximumAge:5e3,timeout:6e4};return navigator.geolocation.watchPosition(o=>{const n={latitude:o.coords.latitude,longitude:o.coords.longitude,accuracy:o.coords.accuracy,altitude:o.coords.altitude,altitudeAccuracy:o.coords.altitudeAccuracy,heading:o.coords.heading,speed:o.coords.speed,timestamp:o.timestamp||Date.now()};this.saveLastPosition(n),this.appendHistoryThrottled(n),this.checkGeofences(n);try{e(n)}catch(i){g.warn("geolocation","watchPosition callback threw",{err:i})}},o=>{g.warn("geolocation","watchPosition error",{code:o.code,msg:o.message})},a)}clearWatch(e){if(!(typeof navigator>"u"||!navigator.geolocation)&&!(e<0))try{navigator.geolocation.clearWatch(e)}catch(t){g.warn("geolocation","clearWatch failed",{err:t})}}async reverseGeocode(e,t,a){const o=a??"fr",n=`${$}/reverse?format=json&lat=${encodeURIComponent(String(e))}&lon=${encodeURIComponent(String(t))}&accept-language=${encodeURIComponent(o)}&zoom=18`,i=await fetch(n,{headers:{Accept:"application/json","User-Agent":"ApexAI-v13"}});if(!i.ok)throw new Error(`Nominatim reverseGeocode HTTP ${i.status}`);const s=await i.json(),c=s.address??{},d={country:c.country??"",countryCode:(c.country_code??"").toUpperCase(),city:c.city??c.town??c.village??c.municipality??""};return(c.state??c.region)&&(d.region=c.state??c.region),c.postcode&&(d.postalCode=c.postcode),c.road&&(d.street=c.road),c.house_number&&(d.houseNumber=c.house_number),s.display_name&&(d.displayName=s.display_name),d}async geocode(e,t=5){const a=`${$}/search?format=json&q=${encodeURIComponent(e)}&limit=${encodeURIComponent(String(t))}&accept-language=fr`,o=await fetch(a,{headers:{Accept:"application/json","User-Agent":"ApexAI-v13"}});if(!o.ok)throw new Error(`Nominatim geocode HTTP ${o.status}`);return(await o.json()).map(i=>{const s={lat:parseFloat(i.lat),lng:parseFloat(i.lon),displayName:i.display_name};return i.type&&(s.type=i.type),s})}distanceBetween(e,t){const o=d=>d*Math.PI/180,n=o(t.lat-e.lat),i=o(t.lng-e.lng),s=Math.sin(n/2)*Math.sin(n/2)+Math.cos(o(e.lat))*Math.cos(o(t.lat))*Math.sin(i/2)*Math.sin(i/2);return 6371*(2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s)))}bearingBetween(e,t){const a=l=>l*Math.PI/180,o=l=>l*180/Math.PI,n=a(e.lat),i=a(t.lat),s=a(t.lng-e.lng),c=Math.sin(s)*Math.cos(i),d=Math.cos(n)*Math.sin(i)-Math.sin(n)*Math.cos(i)*Math.cos(s);return(o(Math.atan2(c,d))+360)%360}async checkPermission(){try{return typeof navigator>"u"||!navigator.permissions?"prompt":(await navigator.permissions.query({name:"geolocation"})).state}catch(e){return g.debug("geolocation","checkPermission fallback prompt",{err:e}),"prompt"}}async getLocalWeather(e,t){let a;if(typeof e=="number"&&typeof t=="number")a={lat:e,lng:t};else{const l=await this.getCurrentPosition();a={lat:l.latitude,lng:l.longitude}}const o=`${C}?latitude=${a.lat}&longitude=${a.lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=7&timezone=auto`,n=await fetch(o,{headers:{Accept:"application/json"}});if(!n.ok)throw new Error(`Open-Meteo HTTP ${n.status}`);const i=await n.json(),s=i.current,c=i.daily;if(!s||!c)throw new Error("Open-Meteo malformed response");const d=[];for(let l=0;l<c.time.length;l++){const A=c.time[l]??"",b=c.weather_code[l]??0,M=c.temperature_2m_max[l]??0,P=c.temperature_2m_min[l]??0,I=c.precipitation_sum[l]??0;d.push({date:A,tempMin:P,tempMax:M,condition:S[b]??`Code ${b}`,precipMm:I})}const h={temp:s.temperature_2m,apparent:s.apparent_temperature,condition:S[s.weather_code]??`Code ${s.weather_code}`,forecast7d:d};return typeof s.relative_humidity_2m=="number"&&(h.humidity=s.relative_humidity_2m),typeof s.wind_speed_10m=="number"&&(h.windKph=s.wind_speed_10m),h}getLocalTime(e,t){const a=Math.round(t/15),o=new Date,n=o.getTime()+o.getTimezoneOffset()*6e4,i=new Date(n+a*36e5),s=String(i.getHours()).padStart(2,"0"),c=String(i.getMinutes()).padStart(2,"0");return{time:`${s}:${c}`,timezone:`UTC${a>=0?"+":""}${a}`,offset:a}}async getCountryFromIP(){try{const e=await fetch("https://www.cloudflare.com/cdn-cgi/trace",{method:"GET",headers:{Accept:"text/plain"}});if(e.ok){const a=(await e.text()).split(`
`),o={};for(const i of a){const s=i.indexOf("=");s>0&&(o[i.slice(0,s)]=i.slice(s+1))}const n=(o.loc??"").toUpperCase();if(n){const i={country:n,countryCode:n};return o.ip&&(i.ip=o.ip),i}}}catch(e){g.debug("geolocation","Cloudflare trace failed",{err:e})}try{const e=await fetch("https://ipapi.co/json/",{headers:{Accept:"application/json"}});if(e.ok){const t=await e.json(),a={country:t.country_name??"",countryCode:(t.country_code??"").toUpperCase()};return t.city&&(a.city=t.city),t.region&&(a.region=t.region),t.ip&&(a.ip=t.ip),a}}catch(e){g.debug("geolocation","ipapi failed",{err:e})}return{country:"Monaco",countryCode:"MC"}}saveFavoriteLocation(e){const t={id:`fav_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`,name:e.name,lat:e.lat,lng:e.lng,type:e.type??"other",createdAt:Date.now()},a=this.getFavoriteLocations();a.push(t);try{localStorage.setItem(x,JSON.stringify(a))}catch(o){g.warn("geolocation","saveFavoriteLocation storage failed",{err:o})}return t}getFavoriteLocations(){try{const e=localStorage.getItem(x);if(!e)return[];const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}removeFavoriteLocation(e){const t=this.getFavoriteLocations(),a=t.filter(o=>o.id!==e);if(a.length===t.length)return!1;try{return localStorage.setItem(x,JSON.stringify(a)),!0}catch{return!1}}watchGeofence(e){const t={id:`gf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`,name:e.name,lat:e.lat,lng:e.lng,radius:e.radius};e.onEnter&&(t.onEnter=e.onEnter),e.onExit&&(t.onExit=e.onExit),this.fenceCallbacks.set(t.id,t);const a=this.getStoredGeofences();a.push({id:t.id,name:t.name,lat:t.lat,lng:t.lng,radius:t.radius});try{localStorage.setItem(y,JSON.stringify(a))}catch(o){g.warn("geolocation","watchGeofence storage failed",{err:o})}return t.id}removeGeofence(e){const t=this.getStoredGeofences().filter(a=>a.id!==e);this.fenceCallbacks.delete(e);try{return localStorage.setItem(y,JSON.stringify(t)),!0}catch{return!1}}getGeofences(){return this.getStoredGeofences()}checkGeofences(e){const t=this.getStoredGeofences();if(t.length)for(const a of t){const n=this.distanceBetween({lat:e.latitude,lng:e.longitude},{lat:a.lat,lng:a.lng})*1e3<=a.radius,i=`apex_v13_geo_inside_${a.id}`;let s=!1;try{s=localStorage.getItem(i)==="true"}catch{}if(n!==s){try{localStorage.setItem(i,String(n))}catch{}const c=this.fenceCallbacks.get(a.id);if(c)try{n&&c.onEnter?c.onEnter():!n&&c.onExit&&c.onExit()}catch(d){g.warn("geolocation","geofence callback threw",{id:a.id,err:d})}}}}getLastKnownPosition(){try{const e=localStorage.getItem(w);return e?JSON.parse(e):null}catch{return null}}getHistory(){try{const e=localStorage.getItem(v);if(!e)return[];const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}clearHistory(){try{localStorage.removeItem(v)}catch{}}fenceCallbacks=new Map;lastHistoryAppend=0;saveLastPosition(e){try{localStorage.setItem(w,JSON.stringify(e))}catch(t){g.debug("geolocation","saveLastPosition skipped (quota?)",{err:t})}}appendHistory(e){try{const t=this.getHistory();t.push(e);const a=t.length>_?t.slice(-_):t;localStorage.setItem(v,JSON.stringify(a))}catch(t){g.debug("geolocation","appendHistory skipped",{err:t})}}appendHistoryThrottled(e){const t=Date.now();t-this.lastHistoryAppend<6e4||(this.lastHistoryAppend=t,this.appendHistory(e))}getStoredGeofences(){try{const e=localStorage.getItem(y);if(!e)return[];const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}}const p=new k;let f=-1;function L(r){return r<=10?{label:"Excellente",color:"#4ade80"}:r<=50?{label:"Bonne",color:"#60a5fa"}:r<=500?{label:"Moyenne",color:"#facc15"}:{label:"Approximative",color:"#f87171"}}function z(r){const e=L(r.accuracy),t=r.latitude.toFixed(6),a=r.longitude.toFixed(6);let o="";return r.altitude!==null&&r.altitude!==void 0&&(o+=`<br><span style="color:var(--ax-text-dim)">Altitude:</span> ${Math.round(r.altitude)}m`),r.speed!==null&&r.speed!==void 0&&r.speed>0&&(o+=`<br><span style="color:var(--ax-text-dim)">Vitesse:</span> ${Math.round(r.speed*3.6)} km/h`),`
    <div style="font-size:13px;line-height:1.6">
      <strong>GPS</strong> · précision <span style="color:${e.color}">${e.label}</span> (${Math.round(r.accuracy)}m)<br>
      <span style="color:var(--ax-text-dim)">Lat:</span> ${t}<br>
      <span style="color:var(--ax-text-dim)">Lng:</span> ${a}${o}<br>
      <span style="color:var(--ax-text-dim)">Mise à jour:</span> ${new Date(r.timestamp).toLocaleString("fr-FR")}
    </div>
  `}function O(r){return r.length?r.map(e=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--ax-border)">
          <div>
            <strong>${u(e.name)}</strong>
            <span style="color:var(--ax-text-dim);font-size:11px"> · ${u(e.type??"other")}</span>
            <div style="font-size:10px;color:var(--ax-text-dim)">${e.lat.toFixed(5)}, ${e.lng.toFixed(5)}</div>
          </div>
          <button class="ax-btn ax-btn-danger" data-action="remove-fav" data-fav-id="${u(e.id)}" style="min-height:36px;padding:6px 10px;font-size:11px">Supprimer</button>
        </div>
      `).join(""):'<div style="font-size:12px;color:var(--ax-text-dim)">Aucun lieu favori. Cliquez "Ajouter ma position" pour en créer un.</div>'}function G(r){const e=r.forecast7d.slice(0,7).map(t=>{const o=new Date(t.date).toLocaleDateString("fr-FR",{weekday:"short",day:"2-digit",month:"2-digit"});return`
        <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;border-bottom:1px solid var(--ax-border)">
          <span>${u(o)}</span>
          <span style="color:var(--ax-text-dim)">${u(t.condition)}</span>
          <span><strong>${Math.round(t.tempMin)}°</strong> / ${Math.round(t.tempMax)}°</span>
        </div>
      `}).join("");return`
    <div style="font-size:14px;margin-bottom:12px">
      <strong>${Math.round(r.temp)}°C</strong> · ${u(r.condition)}
      ${r.humidity!==void 0&&r.humidity!==null?` · 💧 ${Math.round(r.humidity)}%`:""}
      ${r.windKph!==void 0&&r.windKph!==null?` · 💨 ${Math.round(r.windKph)} km/h`:""}
    </div>
    ${e}
  `}function m(r){const e=p.getLastKnownPosition(),t=p.getFavoriteLocations(),a=p.getGeofences(),o=p.getHistory(),n=f!==-1,i=e?z(e):'<div style="font-size:12px;color:var(--ax-text-dim)">Aucune position enregistrée</div>',s=e?`
        <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
          <a href="https://www.google.com/maps?q=${e.latitude},${e.longitude}" target="_blank" rel="noopener" class="ax-btn ax-btn-outline" style="min-height:44px;padding:10px 14px">🗺 Google Maps</a>
          <button class="ax-btn ax-btn-outline" data-action="refresh-position" style="min-height:44px;padding:10px 14px">↻ Actualiser</button>
          <button class="ax-btn ax-btn-outline" data-action="share-position" style="min-height:44px;padding:10px 14px">📤 Partager</button>
        </div>
      `:'<button class="ax-btn ax-btn-primary" data-action="refresh-position" style="margin-top:10px;min-height:44px">📍 Obtenir ma position</button>',c=o.slice(-30).reverse(),d=c.length?c.map(l=>`
            <div style="font-size:11px;padding:4px 0;border-bottom:1px solid var(--ax-border);display:flex;justify-content:space-between;gap:8px">
              <span>${l.latitude.toFixed(4)}, ${l.longitude.toFixed(4)} <span style="color:var(--ax-text-dim)">(${Math.round(l.accuracy)}m)</span></span>
              <span style="color:var(--ax-text-dim)">${new Date(l.timestamp).toLocaleTimeString("fr-FR")}</span>
            </div>
          `).join(""):'<div style="font-size:12px;color:var(--ax-text-dim)">Aucun historique</div>',h=a.length?a.map(l=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--ax-border)">
              <div>
                <strong>${u(l.name)}</strong>
                <div style="font-size:10px;color:var(--ax-text-dim)">${l.lat.toFixed(5)}, ${l.lng.toFixed(5)} · rayon ${l.radius}m</div>
              </div>
              <button class="ax-btn ax-btn-danger" data-action="remove-fence" data-fence-id="${u(l.id)}" style="min-height:36px;padding:6px 10px;font-size:11px">Supprimer</button>
            </div>
          `).join(""):'<div style="font-size:12px;color:var(--ax-text-dim)">Aucune zone définie. Ajoutez votre position courante comme zone.</div>';r.innerHTML=`
    <div class="ax-page" style="padding:16px;max-width:760px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;background:linear-gradient(135deg,#c9a227,#ffd700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">📍 Géolocalisation</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">${t.length} favoris · ${a.length} zones</span>
      </header>

      <div class="ax-card" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="margin:0 0 8px 0;color:#c9a227">Position actuelle</h3>
        ${i}
        ${s}
      </div>

      <div class="ax-card" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="margin:0 0 8px 0;color:#c9a227">Suivi continu</h3>
        <div style="font-size:12px;color:var(--ax-text-dim);margin-bottom:8px">Met à jour automatiquement la position et détecte entrées/sorties des zones définies.</div>
        <button class="ax-btn ${n?"ax-btn-danger":"ax-btn-primary"}" data-action="toggle-tracking" style="min-height:44px;width:100%">${n?"⏹ Arrêter le suivi":"▶ Démarrer le suivi continu"}</button>
      </div>

      <div class="ax-card" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <h3 style="margin:0;color:#c9a227">Lieux favoris</h3>
          <button class="ax-btn ax-btn-primary" data-action="add-fav" style="min-height:36px;padding:6px 12px;font-size:12px">+ Ajouter ici</button>
        </header>
        ${O(t)}
      </div>

      <div class="ax-card" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <h3 style="margin:0;color:#c9a227">Zones (geofences)</h3>
          <button class="ax-btn ax-btn-primary" data-action="add-fence" style="min-height:36px;padding:6px 12px;font-size:12px">+ Créer une zone</button>
        </header>
        ${h}
      </div>

      <div class="ax-card" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <h3 style="margin:0;color:#c9a227">Météo locale 7 jours</h3>
          <button class="ax-btn ax-btn-outline" data-action="load-weather" style="min-height:36px;padding:6px 12px;font-size:12px">Charger</button>
        </header>
        <div id="ax-geo-weather"><div style="font-size:12px;color:var(--ax-text-dim)">Cliquez "Charger" pour afficher la météo Open-Meteo gratuite.</div></div>
      </div>

      <div class="ax-card" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="margin:0 0 8px 0;color:#c9a227">Historique — 30 derniers points</h3>
        ${d}
      </div>

      <p style="font-size:10px;color:var(--ax-text-dim);text-align:center;padding:8px">
        Précision : GPS ~5m · WiFi ~50m · Réseau IP ~50km<br>
        Données privées. Aucune sync Firebase (privacy P0).
      </p>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `,H(r)}function H(r){const e=(t,a)=>{if(t==="refresh-position")p.getCurrentPosition().then(()=>m(r)).catch(o=>{g.warn("geo-view","getCurrentPosition failed",{err:o}),alert("Impossible d'obtenir votre position. Vérifiez les autorisations GPS.")});else if(t==="share-position"){const o=p.getLastKnownPosition();if(!o)return;const n=`https://maps.google.com/?q=${o.latitude},${o.longitude}`,i=navigator;i.share?i.share({title:"Ma position",url:n}).catch(()=>{}):navigator.clipboard&&navigator.clipboard.writeText(n).catch(()=>{})}else if(t==="toggle-tracking")f!==-1?(p.clearWatch(f),f=-1):f=p.watchPosition(()=>{m(r)}),m(r);else if(t==="add-fav"){const o=p.getLastKnownPosition();if(!o){alert("Obtenez d'abord votre position.");return}const n=prompt("Nom du lieu favori (ex: Maison, Bureau) :");if(!n)return;p.saveFavoriteLocation({name:n,lat:o.latitude,lng:o.longitude,type:"other"}),m(r)}else if(t==="remove-fav"){const o=a.dataset.favId;o&&p.removeFavoriteLocation(o)&&m(r)}else if(t==="add-fence"){const o=p.getLastKnownPosition();if(!o){alert("Obtenez d'abord votre position.");return}const n=prompt("Nom de la zone (ex: Casino, Domicile) :");if(!n)return;const i=prompt("Rayon en mètres (défaut 100) :","100"),s=Math.max(10,parseInt(i??"100",10)||100);p.watchGeofence({name:n,lat:o.latitude,lng:o.longitude,radius:s}),m(r)}else if(t==="remove-fence"){const o=a.dataset.fenceId;o&&p.removeGeofence(o)&&m(r)}else if(t==="load-weather"){const o=r.querySelector("#ax-geo-weather");if(!o)return;o.innerHTML='<div style="font-size:12px;color:var(--ax-text-dim)">Chargement…</div>';const n=p.getLastKnownPosition();(n?p.getLocalWeather(n.latitude,n.longitude):p.getLocalWeather()).then(s=>{o.innerHTML=G(s)}).catch(s=>{g.warn("geo-view","weather load failed",{err:s}),o.innerHTML='<div style="font-size:12px;color:#f87171">Impossible de charger la météo.</div>'})}};r.querySelectorAll("[data-action]").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.action;a&&e(a,t)})})}export{u as escapeHtml,m as render};
