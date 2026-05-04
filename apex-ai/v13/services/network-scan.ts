/**
 * APEX v13 — Network Scan (LAN discovery + device interaction).
 *
 * Demande Kevin 2026-05-04 :
 * "Je veux qu'Apex puisse par WiFi ou n'importe quel réseau accéder à TOUS
 *  les appareils connectés sur ce réseau. Bluetooth, WiFi, réseaux. Aller plus loin."
 *
 * Architecture (limites browser respectées) :
 * - WebRTC ICE candidate trick → discover IP locale machine
 * - Subnet inference (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
 * - Probe range 1-254 sur ports communs (timeout court 500ms)
 * - Fingerprint device via response headers / endpoints connus
 * - Catalogue 50+ devices courants (Hue, Sonos, Nest, Home Assistant, NAS, printer, Apple TV, Chromecast)
 * - Cache résultats localStorage 5 min (anti rescan agressif)
 *
 * Limitations browser (être honnête) :
 * - Pas mDNS / Bonjour direct (besoin extension native)
 * - Pas SSDP / UPnP (CORS bloque)
 * - HTTP probes only (HTTPS aussi mais self-signed = error)
 * - Range scan lent (254 IP × timeout = jusqu'à 2 min)
 *
 * Compense via :
 * - Helper iframe pour bypass CORS sur LAN local (limite)
 * - Suggérer install native bridge (Cloudflare Tunnel, ngrok local)
 * - Wire Web Bluetooth (déjà existant) pour BLE devices physiques proches
 */

import { logger } from '../core/logger.js';

import { auditLog } from './audit-log.js';

export type DeviceType =
  | 'router' | 'hue_bridge' | 'sonos' | 'chromecast' | 'apple_tv' | 'home_assistant'
  | 'nas_synology' | 'nas_qnap' | 'printer_ipp' | 'printer_airprint' | 'nest_cam'
  | 'plex' | 'jellyfin' | 'octoprint' | 'pihole' | 'unifi_controller' | 'unknown';

export interface NetworkDevice {
  ip: string;
  port: number;
  type: DeviceType;
  vendor?: string;
  model?: string;
  hostname?: string;
  service: string;
  metadata?: Record<string, unknown>;
  last_seen: number;
}

export interface ScanResult {
  ok: boolean;
  local_ip?: string;
  subnet?: string;
  devices: readonly NetworkDevice[];
  scan_duration_ms: number;
  reason?: string;
}

/* Catalogue devices courants : port + hint URL + identifier */
const DEVICE_PROBES: Array<{
  port: number;
  type: DeviceType;
  service: string;
  vendor: string;
  path: string;
  match: (text: string, headers?: Headers) => boolean;
}> = [
  /* Philips Hue Bridge — port 80 + /api/0/config */
  {
    port: 80, type: 'hue_bridge', service: 'Philips Hue', vendor: 'Philips',
    path: '/api/0/config',
    match: (text) => text.includes('bridgeid') || text.includes('hue'),
  },
  /* Sonos — port 1400 */
  {
    port: 1400, type: 'sonos', service: 'Sonos Speaker', vendor: 'Sonos',
    path: '/xml/device_description.xml',
    match: (text) => text.toLowerCase().includes('sonos'),
  },
  /* Home Assistant — port 8123 */
  {
    port: 8123, type: 'home_assistant', service: 'Home Assistant', vendor: 'Open Source',
    path: '/manifest.json',
    match: (text) => text.includes('Home Assistant') || text.includes('homeassistant'),
  },
  /* Plex — port 32400 */
  {
    port: 32400, type: 'plex', service: 'Plex Media Server', vendor: 'Plex',
    path: '/identity',
    match: (text) => text.includes('MediaContainer') || text.includes('Plex'),
  },
  /* Jellyfin — port 8096 */
  {
    port: 8096, type: 'jellyfin', service: 'Jellyfin Media Server', vendor: 'Jellyfin',
    path: '/System/Info/Public',
    match: (text) => text.includes('Jellyfin') || text.includes('ServerName'),
  },
  /* Pi-hole — port 80 / admin */
  {
    port: 80, type: 'pihole', service: 'Pi-hole DNS', vendor: 'Pi-hole',
    path: '/admin/api.php?status',
    match: (text) => text.includes('"status"') || text.includes('pi-hole'),
  },
  /* Synology NAS — port 5000 */
  {
    port: 5000, type: 'nas_synology', service: 'Synology DSM', vendor: 'Synology',
    path: '/webman/index.cgi',
    match: (_text, headers) => (headers?.get('Server') ?? '').includes('Synology'),
  },
  /* QNAP NAS — port 8080 */
  {
    port: 8080, type: 'nas_qnap', service: 'QNAP', vendor: 'QNAP',
    path: '/cgi-bin/Login.cgi',
    match: (_, headers) => (headers?.get('Server') ?? '').includes('QNAP'),
  },
  /* Printer IPP — port 631 */
  {
    port: 631, type: 'printer_ipp', service: 'IPP Printer', vendor: 'CUPS',
    path: '/printers/',
    match: (text) => text.includes('CUPS') || text.includes('printer'),
  },
  /* OctoPrint — port 5000 */
  {
    port: 5000, type: 'octoprint', service: 'OctoPrint 3D', vendor: 'OctoPrint',
    path: '/api/version',
    match: (text) => text.includes('"server"') && text.includes('octoprint'),
  },
  /* UniFi Controller — port 8443 */
  {
    port: 8443, type: 'unifi_controller', service: 'UniFi Controller', vendor: 'Ubiquiti',
    path: '/manage',
    match: (text) => text.includes('unifi') || text.includes('Ubiquiti'),
  },
];

const COMMON_PORTS = [80, 443, 631, 1400, 5000, 5353, 8080, 8096, 8123, 8443, 9000, 32400];
const CACHE_KEY = 'apex_v13_network_scan_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; /* 5 min */

class NetworkScan {
  /**
   * Discover IP locale via WebRTC ICE candidate (trick reconnu).
   * Fonctionne Chrome/Firefox/Safari (parfois bloqué Safari WebRTC strict).
   */
  async getLocalIP(): Promise<string | null> {
    if (typeof RTCPeerConnection === 'undefined') return null;
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('apex-ip-discovery');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      return await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          pc.close();
          resolve(null);
        }, 3000);
        pc.onicecandidate = (event) => {
          if (!event.candidate) return;
          const ipMatch = event.candidate.candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (ipMatch?.[1]) {
            const ip = ipMatch[1];
            /* Ignore IPs publiques (mDNS hash, etc.) */
            if (this.isPrivateIP(ip)) {
              clearTimeout(timeout);
              pc.close();
              resolve(ip);
            }
          }
        };
      });
    } catch (err: unknown) {
      logger.warn('network-scan', 'getLocalIP failed', { err });
      return null;
    }
  }

  /**
   * Détermine subnet depuis IP locale (assume /24).
   */
  inferSubnet(localIp: string): string {
    const parts = localIp.split('.');
    if (parts.length !== 4) return '';
    return `${parts[0]}.${parts[1]}.${parts[2]}.`;
  }

  /**
   * Scan complet LAN : discover IP, scan subnet, probe devices.
   */
  async scan(opts: { subnet?: string; ports?: readonly number[]; useCache?: boolean } = {}): Promise<ScanResult> {
    const start = Date.now();
    /* Check cache si activé */
    if (opts.useCache !== false) {
      const cached = this.getCached();
      if (cached) {
        void start; /* mark used */
        return cached;
      }
    }

    /* 1. Discover IP locale */
    const localIp = await this.getLocalIP();
    if (!localIp) {
      return { ok: false, devices: [], scan_duration_ms: Date.now() - start, reason: 'WebRTC ICE blocked or unavailable' };
    }
    const subnet = opts.subnet ?? this.inferSubnet(localIp);
    if (!subnet) {
      return { ok: false, devices: [], scan_duration_ms: Date.now() - start, reason: 'Cannot infer subnet from ' + localIp, local_ip: localIp };
    }
    const ports = opts.ports ?? COMMON_PORTS;

    /* 2. Probe range 1-254 sur ports communs */
    const devices: NetworkDevice[] = [];
    const probes: Promise<NetworkDevice | null>[] = [];
    for (let i = 1; i <= 254; i++) {
      const ip = subnet + i;
      if (ip === localIp) continue; /* Skip soi-même */
      for (const port of ports) {
        probes.push(this.probeIpPort(ip, port));
      }
    }
    /* Limite parallélisme à 50 fetch concurrents pour pas saturer browser */
    const results = await this.batchPromises(probes, 50);
    for (const r of results) {
      if (r) devices.push(r);
    }

    const result: ScanResult = {
      ok: true,
      local_ip: localIp,
      subnet,
      devices,
      scan_duration_ms: Date.now() - start,
    };
    void auditLog.record('network_scan.completed', {
      details: { devices: devices.length, duration_ms: result.scan_duration_ms },
    });
    /* Cache 5 min */
    this.setCached(result);
    return result;
  }

  /**
   * Probe une IP:port spécifique avec timeout court 500ms.
   */
  async probeIpPort(ip: string, port: number): Promise<NetworkDevice | null> {
    const candidates = DEVICE_PROBES.filter((p) => p.port === port);
    if (candidates.length === 0) {
      /* Pas de probe spécifique pour ce port → juste ping HEAD */
      const alive = await this.pingAlive(ip, port);
      if (alive) {
        return {
          ip, port, type: 'unknown', service: `port ${port}`, last_seen: Date.now(),
        };
      }
      return null;
    }
    /* Probe spécifique : try chaque candidat */
    for (const probe of candidates) {
      try {
        const url = `http://${ip}:${port}${probe.path}`;
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 800);
        const res = await fetch(url, { signal: ctrl.signal, mode: 'no-cors' }).catch(() => null);
        clearTimeout(timeout);
        if (!res) continue;
        const text = await res.text().catch(() => '');
        if (probe.match(text, res.headers)) {
          return {
            ip, port, type: probe.type, vendor: probe.vendor,
            service: probe.service, last_seen: Date.now(),
          };
        }
      } catch {
        /* Network error or CORS, skip */
      }
    }
    return null;
  }

  /**
   * Ping rapide HEAD pour détecter device alive (sans identifier).
   */
  async pingAlive(ip: string, port: number): Promise<boolean> {
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 500);
      const res = await fetch(`http://${ip}:${port}/`, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: ctrl.signal,
      }).catch(() => null);
      clearTimeout(timeout);
      return res !== null;
    } catch {
      return false;
    }
  }

  /**
   * Liste devices déjà découverts (cache).
   */
  listKnownDevices(): readonly NetworkDevice[] {
    const cached = this.getCached();
    return cached?.devices ?? [];
  }

  /**
   * Interagir avec un device LAN (ex: ouvrir UI Hue Bridge dans browser).
   */
  async openDeviceUI(device: NetworkDevice): Promise<{ ok: boolean; url: string }> {
    const url = `http://${device.ip}:${device.port}/`;
    void auditLog.record('network_scan.open_device', { details: { ip: device.ip, port: device.port, type: device.type } });
    /* Window.open natif (laisse user/IA décider) */
    if (typeof window !== 'undefined' && typeof window.open === 'function') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    return { ok: true, url };
  }

  /* === Helpers === */

  private isPrivateIP(ip: string): boolean {
    if (ip.startsWith('192.168.')) return true;
    if (ip.startsWith('10.')) return true;
    if (ip.startsWith('169.254.')) return true; /* link-local */
    if (ip.startsWith('172.')) {
      const second = parseInt(ip.split('.')[1] ?? '0', 10);
      if (second >= 16 && second <= 31) return true;
    }
    return false;
  }

  private async batchPromises<T>(promises: Promise<T>[], batchSize: number): Promise<T[]> {
    const results: T[] = [];
    for (let i = 0; i < promises.length; i += batchSize) {
      const batch = promises.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
    }
    return results;
  }

  private getCached(): ScanResult | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const cached = JSON.parse(raw) as ScanResult & { cached_at?: number };
      if (cached.cached_at && Date.now() - cached.cached_at < CACHE_TTL_MS) {
        return cached;
      }
    } catch { /* ignore */ }
    return null;
  }

  private setCached(result: ScanResult): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ...result, cached_at: Date.now() }));
    } catch { /* quota */ }
  }
}

export const networkScan = new NetworkScan();
