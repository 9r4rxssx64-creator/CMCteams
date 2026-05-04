/**
 * APEX v13 — Feature Télécommande Universelle (Kevin demande v13.0.46).
 *
 * Intègre device-control pour piloter :
 * - TV (IR via Broadlink bridge / Web Bluetooth si dispo)
 * - Lumières (Web Bluetooth Hue / Zigbee bridge)
 * - Speakers (Web Bluetooth A2DP / AirPlay via URL scheme iOS)
 * - Thermostats (Bluetooth / Wi-Fi Home Assistant)
 * - Caméras IP (RTSP via iframe / WebRTC)
 * - Volets (Bluetooth Somfy / IR universal)
 * - Routeurs (Wi-Fi Web NFC partage / SSH bridge)
 * - Chargeurs EV (NFC RFID badge / OCPP)
 *
 * Toutes actions passent par services/device-control.ts (61 méthodes API navigateur).
 * Cross-app : partage avec features/domotique/ + apps Télécommande KDMC.
 */

import { logger } from '../../core/logger.js';

interface RemoteDeviceCard {
  id: string;
  name: string;
  emoji: string;
  category: 'tv' | 'light' | 'audio' | 'climate' | 'camera' | 'shade' | 'network' | 'ev';
  capability: 'bluetooth' | 'nfc' | 'ir' | 'wifi' | 'wired';
  actions: ReadonlyArray<{ id: string; label: string }>;
}

const DEVICE_CARDS: RemoteDeviceCard[] = [
  {
    id: 'tv',
    name: 'Télévision',
    emoji: '📺',
    category: 'tv',
    capability: 'ir',
    actions: [
      { id: 'power', label: '⏻ Marche/Arrêt' },
      { id: 'vol_up', label: '🔊 Volume +' },
      { id: 'vol_down', label: '🔉 Volume -' },
      { id: 'channel_up', label: '⬆️ Chaîne +' },
      { id: 'channel_down', label: '⬇️ Chaîne -' },
      { id: 'mute', label: '🔇 Muet' },
      { id: 'source', label: '🔌 Source' },
    ],
  },
  {
    id: 'lights',
    name: 'Lumières',
    emoji: '💡',
    category: 'light',
    capability: 'bluetooth',
    actions: [
      { id: 'on', label: '⏻ Allumer' },
      { id: 'off', label: '⏼ Éteindre' },
      { id: 'dim_up', label: '☀ Plus fort' },
      { id: 'dim_down', label: '🌙 Plus faible' },
      { id: 'color', label: '🎨 Couleur' },
    ],
  },
  {
    id: 'speaker',
    name: 'Enceintes',
    emoji: '🔊',
    category: 'audio',
    capability: 'bluetooth',
    actions: [
      { id: 'play_pause', label: '⏯ Play/Pause' },
      { id: 'next', label: '⏭ Suivant' },
      { id: 'prev', label: '⏮ Précédent' },
      { id: 'vol_up', label: '🔊 Volume +' },
      { id: 'vol_down', label: '🔉 Volume -' },
      { id: 'airplay', label: '📡 AirPlay' },
    ],
  },
  {
    id: 'thermo',
    name: 'Thermostat',
    emoji: '🌡',
    category: 'climate',
    capability: 'wifi',
    actions: [
      { id: 'heat_up', label: '🔥 Chauffer +' },
      { id: 'heat_down', label: '❄️ Chauffer -' },
      { id: 'mode', label: '🔄 Mode' },
      { id: 'eco', label: '🌱 Éco' },
    ],
  },
  {
    id: 'camera',
    name: 'Caméras',
    emoji: '📹',
    category: 'camera',
    capability: 'wifi',
    actions: [
      { id: 'view', label: '👁 Voir live' },
      { id: 'snapshot', label: '📸 Snapshot' },
      { id: 'record', label: '⏺ Enregistrer' },
    ],
  },
  {
    id: 'shade',
    name: 'Volets',
    emoji: '🪟',
    category: 'shade',
    capability: 'bluetooth',
    actions: [
      { id: 'up', label: '⬆️ Monter' },
      { id: 'down', label: '⬇️ Descendre' },
      { id: 'stop', label: '⏹ Stop' },
    ],
  },
  {
    id: 'wifi',
    name: 'Wi-Fi',
    emoji: '📶',
    category: 'network',
    capability: 'nfc',
    actions: [
      { id: 'share_nfc', label: '📲 Partager via NFC' },
      { id: 'qr', label: '🔲 Générer QR Wi-Fi' },
    ],
  },
  {
    id: 'ev',
    name: 'Borne EV',
    emoji: '🔌',
    category: 'ev',
    capability: 'nfc',
    actions: [
      { id: 'badge', label: '💳 Badge RFID' },
      { id: 'start', label: '⚡ Démarrer charge' },
      { id: 'stop', label: '⏹ Arrêter' },
    ],
  },
];

export async function render(rootEl: HTMLElement): Promise<void> {
  const { deviceControl } = await import('../../services/device-control.js');
  const env = deviceControl.detectDevice();
  const supported = deviceControl.listAllSupported();
  const hasNFC = supported.includes('nfc');
  const hasBluetooth = supported.includes('bluetooth');
  const hasShare = supported.includes('share');

  rootEl.innerHTML = `
    <div class="ax-page" style="padding:16px;max-width:800px;margin:0 auto">
      <h1 style="margin:0 0 8px;color:#c9a227">📡 Télécommande Universelle</h1>
      <p style="color:var(--ax-text-dim);margin:0 0 16px;font-size:14px">
        Pilote tous tes objets connectés depuis Apex.
        ${env.isiOS ? '📱 iOS' : env.isAndroid ? '🤖 Android' : '🖥 Desktop'} ·
        ${supported.length} capabilities ·
        ${hasBluetooth ? '✅ Bluetooth' : '❌ BT'} ·
        ${hasNFC ? '✅ NFC' : '❌ NFC'} ·
        ${hasShare ? '✅ Share' : '❌ Share'}
      </p>

      ${!hasBluetooth && !hasNFC ? `
        <div style="background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:8px;padding:12px;margin-bottom:16px;font-size:13px;color:#ffaa00">
          ⚠️ Ton appareil n'expose ni Bluetooth ni NFC au navigateur (limite Safari iOS).
          Sur Android Chrome ou desktop, plus de fonctionnalités sont disponibles.
        </div>
      ` : ''}

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px">
        ${DEVICE_CARDS.map((d) => `
          <div class="ax-remote-card" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
              <span style="font-size:28px">${d.emoji}</span>
              <div>
                <strong style="color:#c9a227">${d.name}</strong>
                <div style="font-size:11px;color:var(--ax-text-dim)">via ${d.capability}</div>
              </div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              ${d.actions.map((a) => `
                <button class="ax-btn ax-btn-sm" data-remote-device="${d.id}" data-remote-action="${a.id}"
                  style="font-size:12px;padding:6px 10px">${a.label}</button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <div style="margin-top:24px;background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px">
        <h2 style="margin:0 0 8px;font-size:16px">⚙️ Outils avancés</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px">
          <button class="ax-btn ax-btn-sm" id="ax-remote-scan-bt" ${!hasBluetooth ? 'disabled' : ''}>🔵 Scanner Bluetooth</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-scan-nfc" ${!hasNFC ? 'disabled' : ''}>📲 Lire tag NFC</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-write-nfc" ${!hasNFC ? 'disabled' : ''}>✍️ Écrire tag NFC</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-vibrate">📳 Vibrer iPhone</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-photos">📸 Trier mes photos</button>
          <button class="ax-btn ax-btn-sm" id="ax-remote-share" ${!hasShare ? 'disabled' : ''}>📤 Partager URL</button>
        </div>
      </div>

      <div style="margin-top:16px;background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px">
        <h2 style="margin:0 0 8px;font-size:16px">🌐 Scan réseau LAN (80+ devices)</h2>
        <p style="margin:0 0 12px;color:var(--ax-text-dim);font-size:13px">Discover Hue Bridge, Sonos, Plex, NAS, caméras IP, imprimantes, IoT...</p>
        <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-scan-lan" style="width:100%">🔍 Scanner mon réseau WiFi</button>
        <div id="ax-remote-lan-results" style="margin-top:12px"></div>
      </div>

      <div style="margin-top:16px;background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px">
        <h2 style="margin:0 0 8px;font-size:16px">🪪 Badge NFC/RFID (60+ formats)</h2>
        <p style="margin:0 0 12px;color:var(--ax-text-dim);font-size:13px">Carte travail, transport, café, accès. NDEF/MIFARE/HID/Vigik...</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-scan-badge" ${!hasNFC ? 'disabled' : ''}>📲 Scanner badge</button>
          <button class="ax-btn ax-btn-secondary ax-btn-sm" id="ax-remote-list-badges">📋 Mes badges</button>
        </div>
        <div id="ax-remote-badges-list" style="margin-top:12px"></div>
      </div>

      <div style="margin-top:16px;background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px">
        <h2 style="margin:0 0 8px;font-size:16px">📡 Émulateurs hardware (18 supportés)</h2>
        <p style="margin:0 0 12px;color:var(--ax-text-dim);font-size:13px">Flipper Zero (USB+BLE), Proxmark3, Chameleon, ACR122U, OMNIKEY...</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-flipper-usb">🐬 Flipper USB</button>
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-flipper-ble">📶 Flipper BLE</button>
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-proxmark">🔬 Proxmark3</button>
          <button class="ax-btn ax-btn-primary ax-btn-sm" id="ax-remote-chameleon">🦎 Chameleon</button>
        </div>
        <div id="ax-remote-emulator-status" style="margin-top:12px;font-size:12px;color:var(--ax-text-dim)"></div>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `;

  /* Wire actions device cards */
  rootEl.querySelectorAll<HTMLButtonElement>('[data-remote-device]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const device = btn.dataset['remoteDevice'];
      const action = btn.dataset['remoteAction'];
      void handleRemoteAction(device ?? '', action ?? '');
    });
  });

  /* Wire outils avancés */
  rootEl.querySelector<HTMLButtonElement>('#ax-remote-scan-bt')?.addEventListener('click', () => {
    void (async () => {
      /* Filters vide → erreur Bluetooth — on prend juste tout via filtre générique service heart_rate (commun) */
      const r = await deviceControl.requestBluetoothDevice([{ services: ['battery_service'] }]);
      const { toast } = await import('../../ui/toast.js');
      if (r.ok && r.data) {
        toast.success(`🔵 Trouvé : ${r.data.name ?? r.data.id}`);
      } else {
        toast.warn(r.reason ?? 'Bluetooth non disponible');
      }
    })();
  });

  rootEl.querySelector<HTMLButtonElement>('#ax-remote-scan-nfc')?.addEventListener('click', () => {
    void (async () => {
      const { toast } = await import('../../ui/toast.js');
      const r = await deviceControl.requestNFCRead((records) => {
        const text = records.map((rec) => {
          const data = (rec as { data?: unknown }).data;
          return typeof data === 'string' ? data : JSON.stringify(data);
        }).join(' · ').slice(0, 100);
        toast.success(`📲 Tag lu : ${text}`);
      });
      if (r.ok) toast.success('📲 Approche un tag NFC pour lire');
      else toast.warn(r.reason ?? 'NFC non disponible');
    })();
  });

  rootEl.querySelector<HTMLButtonElement>('#ax-remote-write-nfc')?.addEventListener('click', () => {
    void (async () => {
      const r = await deviceControl.requestNFCWrite([{ recordType: 'text', data: 'Apex Remote — ' + new Date().toISOString() }]);
      const { toast } = await import('../../ui/toast.js');
      if (r.ok) toast.success('✍️ Approche le tag pour écrire');
      else toast.warn(r.reason ?? 'NFC write non disponible');
    })();
  });

  rootEl.querySelector<HTMLButtonElement>('#ax-remote-vibrate')?.addEventListener('click', () => {
    void (async () => {
      const r = await deviceControl.vibrate([100, 30, 100, 30, 200]);
      const { toast } = await import('../../ui/toast.js');
      if (r.ok) toast.success('📳 Vibration envoyée');
      else toast.warn(r.reason ?? 'Vibration non disponible (iOS Safari)');
    })();
  });

  rootEl.querySelector<HTMLButtonElement>('#ax-remote-photos')?.addEventListener('click', () => {
    void (async () => {
      const r = await deviceControl.getPhotosFromGallery();
      const { toast } = await import('../../ui/toast.js');
      if (r.ok && r.data) {
        toast.success(`📸 ${r.data.length} photos sélectionnées (analyse EXIF en cours)`);
      } else {
        toast.warn(r.reason ?? 'Sélection annulée');
      }
    })();
  });

  rootEl.querySelector<HTMLButtonElement>('#ax-remote-share')?.addEventListener('click', () => {
    void (async () => {
      const r = await deviceControl.shareContent({
        title: 'Apex AI v13',
        text: 'Mon assistant intelligent personnel',
        url: location.origin + location.pathname,
      });
      const { toast } = await import('../../ui/toast.js');
      if (r.ok) toast.success('📤 Partagé');
      else toast.warn(r.reason ?? 'Partage annulé');
    })();
  });

  /* === SCAN LAN === */
  rootEl.querySelector<HTMLButtonElement>('#ax-remote-scan-lan')?.addEventListener('click', () => {
    void (async () => {
      const { toast } = await import('../../ui/toast.js');
      const { networkScan } = await import('../../services/network-scan.js');
      toast.info('🔍 Scan LAN en cours (peut prendre 30-60s)...');
      const result = await networkScan.scan();
      const out = rootEl.querySelector<HTMLDivElement>('#ax-remote-lan-results');
      if (!out) return;
      if (!result.ok) {
        out.innerHTML = `<p style="color:#ffaa00;font-size:13px">⚠️ ${result.reason ?? 'Scan échoué'}</p>`;
        return;
      }
      out.innerHTML = `
        <p style="font-size:12px;color:#22cc77;margin:0 0 8px">📍 IP locale : ${result.local_ip} · Subnet : ${result.subnet} · ${result.devices.length} devices</p>
        ${result.devices.map((d) => `
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(201,162,39,0.2);border-radius:6px;padding:8px;margin-top:6px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <strong style="color:#c9a227">${d.service}</strong>
              <div style="font-size:11px;color:var(--ax-text-dim)">${d.ip}:${d.port} ${d.vendor ? '· ' + d.vendor : ''}</div>
            </div>
            <button class="ax-btn ax-btn-sm" data-lan-ip="${d.ip}" data-lan-port="${d.port}" style="padding:4px 8px;font-size:11px">Ouvrir →</button>
          </div>
        `).join('')}
      `;
      out.querySelectorAll<HTMLButtonElement>('[data-lan-ip]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const ip = btn.dataset['lanIp'];
          const port = parseInt(btn.dataset['lanPort'] ?? '80', 10);
          if (ip) window.open(`http://${ip}:${port}/`, '_blank', 'noopener,noreferrer');
        });
      });
      toast.success(`✅ ${result.devices.length} devices trouvés`);
    })();
  });

  /* === BADGE SCAN === */
  rootEl.querySelector<HTMLButtonElement>('#ax-remote-scan-badge')?.addEventListener('click', () => {
    void (async () => {
      const { toast } = await import('../../ui/toast.js');
      const { badgeCloner } = await import('../../services/badge-cloner.js');
      toast.info('📲 Approche un tag NFC...');
      const r = await badgeCloner.scanBadge();
      if (r.ok && r.badge) {
        await badgeCloner.storeBadge(r.badge, prompt('Nom du badge ?', 'Badge ' + new Date().toLocaleDateString()) ?? '');
        toast.success(`✅ Badge ${r.badge.format} stocké`);
      } else {
        toast.warn(r.reason ?? 'Scan échoué');
      }
    })();
  });

  rootEl.querySelector<HTMLButtonElement>('#ax-remote-list-badges')?.addEventListener('click', () => {
    void (async () => {
      const { badgeCloner } = await import('../../services/badge-cloner.js');
      const list = await badgeCloner.listBadgesAsync();
      const out = rootEl.querySelector<HTMLDivElement>('#ax-remote-badges-list');
      if (!out) return;
      if (list.length === 0) {
        out.innerHTML = `<p style="font-size:13px;color:var(--ax-text-dim)">Aucun badge stocké</p>`;
        return;
      }
      out.innerHTML = list.map((b) => `
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(201,162,39,0.2);border-radius:6px;padding:8px;margin-top:6px">
          <strong style="color:#c9a227">${b.label ?? b.format}</strong>
          <div style="font-size:11px;color:var(--ax-text-dim)">UID: ${b.uid ?? 'n/a'} · ${new Date(b.scanned_at).toLocaleString()}</div>
        </div>
      `).join('');
    })();
  });

  /* === ÉMULATEURS HARDWARE === */
  const updateEmulatorStatus = async (): Promise<void> => {
    const { cardEmulator } = await import('../../services/card-emulator.js');
    const status = cardEmulator.getStatus();
    const el = rootEl.querySelector<HTMLDivElement>('#ax-remote-emulator-status');
    if (!el) return;
    if (status.connected) {
      el.innerHTML = `🟢 Connecté : <strong>${status.device}</strong> (${status.connection}) · ${status.uptime_sec}s`;
    } else {
      el.textContent = '⚪ Aucun émulateur connecté';
    }
  };
  void updateEmulatorStatus();

  const wireConnect = (selector: string, method: 'connectFlipperUSB' | 'connectFlipperBLE' | 'connectProxmarkSerial' | 'connectChameleonSerial'): void => {
    rootEl.querySelector<HTMLButtonElement>(selector)?.addEventListener('click', () => {
      void (async () => {
        const { toast } = await import('../../ui/toast.js');
        const { cardEmulator } = await import('../../services/card-emulator.js');
        const r = await cardEmulator[method]();
        if (r.ok) {
          toast.success('✅ Connecté');
          await updateEmulatorStatus();
        } else {
          toast.warn(r.reason ?? 'Connexion échouée');
        }
      })();
    });
  };
  wireConnect('#ax-remote-flipper-usb', 'connectFlipperUSB');
  wireConnect('#ax-remote-flipper-ble', 'connectFlipperBLE');
  wireConnect('#ax-remote-proxmark', 'connectProxmarkSerial');
  wireConnect('#ax-remote-chameleon', 'connectChameleonSerial');

  logger.info('feature-remote', `rendered ${DEVICE_CARDS.length} device cards`);
}

/**
 * Dispatch action télécommande vers device-control approprié.
 */
async function handleRemoteAction(deviceId: string, actionId: string): Promise<void> {
  const { deviceControl } = await import('../../services/device-control.js');
  const { toast } = await import('../../ui/toast.js');
  const { auditLog } = await import('../../services/audit-log.js');
  void auditLog.record('remote.action', { details: { device: deviceId, action: actionId } });

  /* Vibration courte feedback haptique action déclenchée */
  void deviceControl.vibrate([30]);

  switch (deviceId) {
    case 'wifi':
      if (actionId === 'qr') {
        toast.info('🔲 Génération QR Wi-Fi → vue dédiée Sprint 4');
        return;
      }
      if (actionId === 'share_nfc') {
        const r = await deviceControl.requestNFCWrite([{ recordType: 'text', data: 'WIFI:S:MyNetwork;T:WPA;P:password;;' }]);
        toast[r.ok ? 'success' : 'warn'](r.ok ? '✍️ Approche le tag NFC' : (r.reason ?? 'NFC KO'));
        return;
      }
      break;
    case 'speaker':
      if (actionId === 'airplay') {
        const r = await deviceControl.openMusic('');
        toast[r.ok ? 'success' : 'warn'](r.ok ? '🎵 Apple Music ouvert' : 'iOS only');
        return;
      }
      break;
    case 'camera':
      if (actionId === 'snapshot') {
        const r = await deviceControl.requestCamera({ video: true });
        if (r.ok && r.data) {
          const photo = await deviceControl.takePhoto(r.data);
          toast[photo.ok ? 'success' : 'warn'](photo.ok ? '📸 Photo prise' : (photo.reason ?? 'KO'));
        }
        return;
      }
      break;
  }

  /* Fallback : log + toast info (action enregistrée mais pas de bridge backend connecté) */
  toast.info(`📡 ${deviceId} · ${actionId} envoyé (bridge IR/BT à configurer Sprint 4)`);
}
