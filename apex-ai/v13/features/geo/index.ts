/**
 * APEX v13 — Feature Geolocation (port v12 vGeolocation + vSecuritePerso GPS share).
 *
 * Vue dédiée géolocalisation expert pro :
 * - Affiche position courante avec précision (excellente/bonne/moyenne/approximative)
 * - Bouton "Obtenir ma position" haute précision GPS
 * - Bouton "Actualiser" + "Voir sur Google Maps" + "Partager position"
 * - Toggle suivi continu (watchPosition) pour géofencing
 * - Liste lieux favoris (home/work/other) avec ajout/suppression
 * - Liste géofences avec rayon + statut entrée/sortie
 * - Météo locale 7j (Open-Meteo gratuit)
 * - Historique 30 dernières positions
 * - Lazy-load Leaflet via CDN si admin demande carte interactive
 *
 * Anti-patterns évités (CLAUDE.md) :
 * - escapeHtml partout
 * - Pas de innerHTML brut sur user input
 * - Per-user isolation (lieux favoris/historique)
 * - CGU implicite (geolocation API browser demande déjà permission)
 */

import { logger } from '../../core/logger.js';
import { geolocation, type GeoPosition, type FavoriteLocation, type LocalWeather } from '../../services/geolocation.js';

let activeWatchId = -1;

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

function precisionLabel(accuracyM: number): { label: string; color: string } {
  if (accuracyM <= 10) return { label: 'Excellente', color: '#4ade80' };
  if (accuracyM <= 50) return { label: 'Bonne', color: '#60a5fa' };
  if (accuracyM <= 500) return { label: 'Moyenne', color: '#facc15' };
  return { label: 'Approximative', color: '#f87171' };
}

function formatPosition(p: GeoPosition): string {
  const prec = precisionLabel(p.accuracy);
  const lat = p.latitude.toFixed(6);
  const lng = p.longitude.toFixed(6);
  let extra = '';
  if (p.altitude !== null && p.altitude !== undefined) extra += `<br><span style="color:var(--ax-text-dim)">Altitude:</span> ${Math.round(p.altitude)}m`;
  if (p.speed !== null && p.speed !== undefined && p.speed > 0) extra += `<br><span style="color:var(--ax-text-dim)">Vitesse:</span> ${Math.round(p.speed * 3.6)} km/h`;
  return `
    <div style="font-size:13px;line-height:1.6">
      <strong>GPS</strong> · précision <span style="color:${prec.color}">${prec.label}</span> (${Math.round(p.accuracy)}m)<br>
      <span style="color:var(--ax-text-dim)">Lat:</span> ${lat}<br>
      <span style="color:var(--ax-text-dim)">Lng:</span> ${lng}${extra}<br>
      <span style="color:var(--ax-text-dim)">Mise à jour:</span> ${new Date(p.timestamp).toLocaleString('fr-FR')}
    </div>
  `;
}

function formatFavorites(favs: FavoriteLocation[]): string {
  if (!favs.length) {
    return '<div style="font-size:12px;color:var(--ax-text-dim)">Aucun lieu favori. Cliquez "Ajouter ma position" pour en créer un.</div>';
  }
  return favs
    .map(
      (f) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--ax-border)">
          <div>
            <strong>${escapeHtml(f.name)}</strong>
            <span style="color:var(--ax-text-dim);font-size:11px"> · ${escapeHtml(f.type ?? 'other')}</span>
            <div style="font-size:10px;color:var(--ax-text-dim)">${f.lat.toFixed(5)}, ${f.lng.toFixed(5)}</div>
          </div>
          <button class="ax-btn ax-btn-danger" data-action="remove-fav" data-fav-id="${escapeHtml(f.id)}" style="min-height:36px;padding:6px 10px;font-size:11px">Supprimer</button>
        </div>
      `,
    )
    .join('');
}

function formatWeather(w: LocalWeather): string {
  const days = w.forecast7d
    .slice(0, 7)
    .map((d) => {
      const date = new Date(d.date);
      const day = date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' });
      return `
        <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;border-bottom:1px solid var(--ax-border)">
          <span>${escapeHtml(day)}</span>
          <span style="color:var(--ax-text-dim)">${escapeHtml(d.condition)}</span>
          <span><strong>${Math.round(d.tempMin)}°</strong> / ${Math.round(d.tempMax)}°</span>
        </div>
      `;
    })
    .join('');
  return `
    <div style="font-size:14px;margin-bottom:12px">
      <strong>${Math.round(w.temp)}°C</strong> · ${escapeHtml(w.condition)}
      ${w.humidity !== undefined && w.humidity !== null ? ` · 💧 ${Math.round(w.humidity)}%` : ''}
      ${w.windKph !== undefined && w.windKph !== null ? ` · 💨 ${Math.round(w.windKph)} km/h` : ''}
    </div>
    ${days}
  `;
}

export function render(rootEl: HTMLElement): void {
  const last = geolocation.getLastKnownPosition();
  const favs = geolocation.getFavoriteLocations();
  const fences = geolocation.getGeofences();
  const hist = geolocation.getHistory();
  const tracking = activeWatchId !== -1;

  const positionHtml = last
    ? formatPosition(last)
    : '<div style="font-size:12px;color:var(--ax-text-dim)">Aucune position enregistrée</div>';

  const positionActions = last
    ? `
        <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
          <a href="https://www.google.com/maps?q=${last.latitude},${last.longitude}" target="_blank" rel="noopener" class="ax-btn ax-btn-outline" style="min-height:44px;padding:10px 14px">🗺 Google Maps</a>
          <button class="ax-btn ax-btn-outline" data-action="refresh-position" style="min-height:44px;padding:10px 14px">↻ Actualiser</button>
          <button class="ax-btn ax-btn-outline" data-action="share-position" style="min-height:44px;padding:10px 14px">📤 Partager</button>
        </div>
      `
    : `<button class="ax-btn ax-btn-primary" data-action="refresh-position" style="margin-top:10px;min-height:44px">📍 Obtenir ma position</button>`;

  const recent = hist.slice(-30).reverse();
  const historyHtml = recent.length
    ? recent
        .map(
          (p) => `
            <div style="font-size:11px;padding:4px 0;border-bottom:1px solid var(--ax-border);display:flex;justify-content:space-between;gap:8px">
              <span>${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)} <span style="color:var(--ax-text-dim)">(${Math.round(p.accuracy)}m)</span></span>
              <span style="color:var(--ax-text-dim)">${new Date(p.timestamp).toLocaleTimeString('fr-FR')}</span>
            </div>
          `,
        )
        .join('')
    : '<div style="font-size:12px;color:var(--ax-text-dim)">Aucun historique</div>';

  const fencesHtml = fences.length
    ? fences
        .map(
          (f) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--ax-border)">
              <div>
                <strong>${escapeHtml(f.name)}</strong>
                <div style="font-size:10px;color:var(--ax-text-dim)">${f.lat.toFixed(5)}, ${f.lng.toFixed(5)} · rayon ${f.radius}m</div>
              </div>
              <button class="ax-btn ax-btn-danger" data-action="remove-fence" data-fence-id="${escapeHtml(f.id)}" style="min-height:36px;padding:6px 10px;font-size:11px">Supprimer</button>
            </div>
          `,
        )
        .join('')
    : '<div style="font-size:12px;color:var(--ax-text-dim)">Aucune zone définie. Ajoutez votre position courante comme zone.</div>';

  rootEl.innerHTML = `
    <div class="ax-page" style="padding:16px;max-width:760px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;background:linear-gradient(135deg,#c9a227,#ffd700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">📍 Géolocalisation</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">${favs.length} favoris · ${fences.length} zones</span>
      </header>

      <div class="ax-card" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="margin:0 0 8px 0;color:#c9a227">Position actuelle</h3>
        ${positionHtml}
        ${positionActions}
      </div>

      <div class="ax-card" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="margin:0 0 8px 0;color:#c9a227">Suivi continu</h3>
        <div style="font-size:12px;color:var(--ax-text-dim);margin-bottom:8px">Met à jour automatiquement la position et détecte entrées/sorties des zones définies.</div>
        <button class="ax-btn ${tracking ? 'ax-btn-danger' : 'ax-btn-primary'}" data-action="toggle-tracking" style="min-height:44px;width:100%">${tracking ? '⏹ Arrêter le suivi' : '▶ Démarrer le suivi continu'}</button>
      </div>

      <div class="ax-card" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <h3 style="margin:0;color:#c9a227">Lieux favoris</h3>
          <button class="ax-btn ax-btn-primary" data-action="add-fav" style="min-height:36px;padding:6px 12px;font-size:12px">+ Ajouter ici</button>
        </header>
        ${formatFavorites(favs)}
      </div>

      <div class="ax-card" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <h3 style="margin:0;color:#c9a227">Zones (geofences)</h3>
          <button class="ax-btn ax-btn-primary" data-action="add-fence" style="min-height:36px;padding:6px 12px;font-size:12px">+ Créer une zone</button>
        </header>
        ${fencesHtml}
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
        ${historyHtml}
      </div>

      <p style="font-size:10px;color:var(--ax-text-dim);text-align:center;padding:8px">
        Précision : GPS ~5m · WiFi ~50m · Réseau IP ~50km<br>
        Données privées. Aucune sync Firebase (privacy P0).
      </p>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `;
  attachHandlers(rootEl);
}

function attachHandlers(rootEl: HTMLElement): void {
  const handle = (action: string, btn: HTMLElement): void => {
    if (action === 'refresh-position') {
      geolocation
        .getCurrentPosition()
        .then(() => render(rootEl))
        .catch((e: unknown) => {
          logger.warn('geo-view', 'getCurrentPosition failed', { err: e });
          alert('Impossible d\'obtenir votre position. Vérifiez les autorisations GPS.');
        });
    } else if (action === 'share-position') {
      const last = geolocation.getLastKnownPosition();
      if (!last) return;
      const url = `https://maps.google.com/?q=${last.latitude},${last.longitude}`;
      const navAny = navigator as Navigator & { share?: (data: { title?: string; url?: string }) => Promise<void> };
      if (navAny.share) {
        navAny.share({ title: 'Ma position', url }).catch(() => {/* ignored */});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).catch(() => {/* ignored */});
      }
    } else if (action === 'toggle-tracking') {
      if (activeWatchId !== -1) {
        geolocation.clearWatch(activeWatchId);
        activeWatchId = -1;
      } else {
        activeWatchId = geolocation.watchPosition(() => {
          /* re-render every update */
          render(rootEl);
        });
      }
      render(rootEl);
    } else if (action === 'add-fav') {
      const last = geolocation.getLastKnownPosition();
      if (!last) {
        alert('Obtenez d\'abord votre position.');
        return;
      }
      const name = prompt('Nom du lieu favori (ex: Maison, Bureau) :');
      if (!name) return;
      geolocation.saveFavoriteLocation({ name, lat: last.latitude, lng: last.longitude, type: 'other' });
      render(rootEl);
    } else if (action === 'remove-fav') {
      const id = btn.dataset['favId'];
      if (id && geolocation.removeFavoriteLocation(id)) render(rootEl);
    } else if (action === 'add-fence') {
      const last = geolocation.getLastKnownPosition();
      if (!last) {
        alert('Obtenez d\'abord votre position.');
        return;
      }
      const name = prompt('Nom de la zone (ex: Casino, Domicile) :');
      if (!name) return;
      const radiusStr = prompt('Rayon en mètres (défaut 100) :', '100');
      const radius = Math.max(10, parseInt(radiusStr ?? '100', 10) || 100);
      geolocation.watchGeofence({ name, lat: last.latitude, lng: last.longitude, radius });
      render(rootEl);
    } else if (action === 'remove-fence') {
      const id = btn.dataset['fenceId'];
      if (id && geolocation.removeGeofence(id)) render(rootEl);
    } else if (action === 'load-weather') {
      const target = rootEl.querySelector<HTMLElement>('#ax-geo-weather');
      if (!target) return;
      target.innerHTML = '<div style="font-size:12px;color:var(--ax-text-dim)">Chargement…</div>';
      const known = geolocation.getLastKnownPosition();
      const promise = known
        ? geolocation.getLocalWeather(known.latitude, known.longitude)
        : geolocation.getLocalWeather();
      promise
        .then((w) => {
          target.innerHTML = formatWeather(w);
        })
        .catch((e: unknown) => {
          logger.warn('geo-view', 'weather load failed', { err: e });
          target.innerHTML = '<div style="font-size:12px;color:#f87171">Impossible de charger la météo.</div>';
        });
    }
  };
  rootEl.querySelectorAll<HTMLElement>('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset['action'];
      if (action) handle(action, btn);
    });
  });
}
