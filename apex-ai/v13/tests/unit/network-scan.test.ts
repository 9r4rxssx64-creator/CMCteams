/**
 * Tests network-scan.ts (v13.0.59 — Sprint 7 max).
 * Cible : 51% → 90%+ branches, mock RTCPeerConnection + fetch + cache.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { networkScan } from '../../services/network-scan.js';

const CACHE_KEY = 'apex_v13_network_scan_cache';

interface RTCMock {
  onicecandidate: ((event: { candidate: { candidate: string } | null }) => void) | null;
  createDataChannel: () => unknown;
  createOffer: () => Promise<unknown>;
  setLocalDescription: (offer: unknown) => Promise<void>;
  close: () => void;
}

function makeRTCMock(candidates: string[]): RTCMock {
  return {
    onicecandidate: null,
    createDataChannel: () => ({}),
    createOffer: () => Promise.resolve({}),
    setLocalDescription: () => Promise.resolve(),
    close: () => undefined,
  };
}

describe('network-scan — getLocalIP', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sans RTCPeerConnection → null', async () => {
    vi.stubGlobal('RTCPeerConnection', undefined);
    const ip = await networkScan.getLocalIP();
    expect(ip).toBeNull();
  });

  it('throw RTCPeerConnection ctor → null', async () => {
    vi.stubGlobal('RTCPeerConnection', class {
      constructor() { throw new Error('blocked'); }
    });
    const ip = await networkScan.getLocalIP();
    expect(ip).toBeNull();
  });

  it('retourne IP private 192.168.x via ICE candidate', async () => {
    let savedHandler: ((evt: { candidate: { candidate: string } | null }) => void) | null = null;
    class RTCStub {
      onicecandidate: typeof savedHandler = null;
      createDataChannel(): unknown { return {}; }
      createOffer(): Promise<unknown> { return Promise.resolve({}); }
      setLocalDescription(): Promise<void> { return Promise.resolve(); }
      close(): void { /* noop */ }
      constructor() {
        Object.defineProperty(this, 'onicecandidate', {
          set: (fn: typeof savedHandler) => { savedHandler = fn; },
          get: () => savedHandler,
          configurable: true,
        });
      }
    }
    vi.stubGlobal('RTCPeerConnection', RTCStub);
    const promise = networkScan.getLocalIP();
    await new Promise((res) => setTimeout(res, 0));
    if (savedHandler) {
      (savedHandler as (e: { candidate: { candidate: string } | null }) => void)({
        candidate: { candidate: 'candidate:1 1 udp 1 192.168.1.50 3000 typ host' },
      });
    }
    const ip = await promise;
    expect(ip).toBe('192.168.1.50');
  });

  it('retourne IP private 10.x.x.x', async () => {
    let h: ((e: { candidate: { candidate: string } | null }) => void) | null = null;
    class S {
      createDataChannel(): unknown { return {}; }
      createOffer(): Promise<unknown> { return Promise.resolve({}); }
      setLocalDescription(): Promise<void> { return Promise.resolve(); }
      close(): void { /* noop */ }
      set onicecandidate(fn: typeof h) { h = fn; }
      get onicecandidate(): typeof h { return h; }
    }
    vi.stubGlobal('RTCPeerConnection', S);
    const p = networkScan.getLocalIP();
    await new Promise((res) => setTimeout(res, 0));
    if (h) {
      (h as (e: { candidate: { candidate: string } | null }) => void)({
        candidate: { candidate: 'candidate:1 1 udp 1 10.0.0.42 3000 typ host' },
      });
    }
    expect(await p).toBe('10.0.0.42');
  });

  it('retourne IP private 172.20.x.x', async () => {
    let h: ((e: { candidate: { candidate: string } | null }) => void) | null = null;
    class S {
      createDataChannel(): unknown { return {}; }
      createOffer(): Promise<unknown> { return Promise.resolve({}); }
      setLocalDescription(): Promise<void> { return Promise.resolve(); }
      close(): void { /* noop */ }
      set onicecandidate(fn: typeof h) { h = fn; }
      get onicecandidate(): typeof h { return h; }
    }
    vi.stubGlobal('RTCPeerConnection', S);
    const p = networkScan.getLocalIP();
    await new Promise((res) => setTimeout(res, 0));
    if (h) {
      (h as (e: { candidate: { candidate: string } | null }) => void)({
        candidate: { candidate: 'candidate:1 1 udp 1 172.20.5.10 3000 typ host' },
      });
    }
    expect(await p).toBe('172.20.5.10');
  });

  it('IP publique ignorée (ne retourne pas)', async () => {
    let h: ((e: { candidate: { candidate: string } | null }) => void) | null = null;
    class S {
      createDataChannel(): unknown { return {}; }
      createOffer(): Promise<unknown> { return Promise.resolve({}); }
      setLocalDescription(): Promise<void> { return Promise.resolve(); }
      close(): void { /* noop */ }
      set onicecandidate(fn: typeof h) { h = fn; }
      get onicecandidate(): typeof h { return h; }
    }
    vi.stubGlobal('RTCPeerConnection', S);
    const p = networkScan.getLocalIP();
    await new Promise((res) => setTimeout(res, 0));
    if (h) {
      /* Public IP → ignored, attendre timeout 3s */
      (h as (e: { candidate: { candidate: string } | null }) => void)({
        candidate: { candidate: 'candidate:1 1 udp 1 8.8.8.8 3000 typ host' },
      });
    }
    /* On ne attend PAS 3 sec dans les tests : on coupe avant */
    /* On laisse promise pending mais close pc. setTimeout 3s pas fired ici */
    /* À la place : test timing court via fake timers serait mieux mais ici on accepte */
    /* On vérifie juste que le test ne crash pas en retournant rien */
    /* Force resolve via cleanup : */
    const winnerOrTimeout = await Promise.race([
      p,
      new Promise<null>((res) => setTimeout(() => res(null), 100)),
    ]);
    expect(winnerOrTimeout).toBeNull();
  });

  it('candidate sans IP regex match → ignoré', async () => {
    let h: ((e: { candidate: { candidate: string } | null }) => void) | null = null;
    class S {
      createDataChannel(): unknown { return {}; }
      createOffer(): Promise<unknown> { return Promise.resolve({}); }
      setLocalDescription(): Promise<void> { return Promise.resolve(); }
      close(): void { /* noop */ }
      set onicecandidate(fn: typeof h) { h = fn; }
      get onicecandidate(): typeof h { return h; }
    }
    vi.stubGlobal('RTCPeerConnection', S);
    const p = networkScan.getLocalIP();
    await new Promise((res) => setTimeout(res, 0));
    if (h) {
      (h as (e: { candidate: { candidate: string } | null }) => void)({
        candidate: { candidate: 'candidate:1 1 udp 1 some.host.local 3000 typ host' },
      });
    }
    const winnerOrTimeout = await Promise.race([
      p,
      new Promise<null>((res) => setTimeout(() => res(null), 100)),
    ]);
    expect(winnerOrTimeout).toBeNull();
  });

  it('candidate null event → reste pending', async () => {
    let h: ((e: { candidate: { candidate: string } | null }) => void) | null = null;
    class S {
      createDataChannel(): unknown { return {}; }
      createOffer(): Promise<unknown> { return Promise.resolve({}); }
      setLocalDescription(): Promise<void> { return Promise.resolve(); }
      close(): void { /* noop */ }
      set onicecandidate(fn: typeof h) { h = fn; }
      get onicecandidate(): typeof h { return h; }
    }
    vi.stubGlobal('RTCPeerConnection', S);
    const p = networkScan.getLocalIP();
    await new Promise((res) => setTimeout(res, 0));
    if (h) {
      (h as (e: { candidate: { candidate: string } | null }) => void)({
        candidate: null,
      });
    }
    const winnerOrTimeout = await Promise.race([
      p,
      new Promise<null>((res) => setTimeout(() => res(null), 100)),
    ]);
    expect(winnerOrTimeout).toBeNull();
  });

  it('mock RTCMock helper renvoie objet structurellement valide', () => {
    const m = makeRTCMock([]);
    expect(m.createDataChannel).toBeTruthy();
  });
});

describe('network-scan — inferSubnet', () => {
  it('format /24 standard', () => {
    expect(networkScan.inferSubnet('192.168.1.50')).toBe('192.168.1.');
  });

  it('format 10.x', () => {
    expect(networkScan.inferSubnet('10.0.0.42')).toBe('10.0.0.');
  });

  it('format 172.20.x', () => {
    expect(networkScan.inferSubnet('172.20.5.10')).toBe('172.20.5.');
  });

  it('IP malformée → string vide', () => {
    expect(networkScan.inferSubnet('not-an-ip')).toBe('');
  });

  it('IP avec moins de 4 octets → string vide', () => {
    expect(networkScan.inferSubnet('192.168.1')).toBe('');
  });

  it('IP avec plus de 4 octets → string vide', () => {
    expect(networkScan.inferSubnet('192.168.1.1.1')).toBe('');
  });
});

describe('network-scan — pingAlive / probeIpPort', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('pingAlive succès retourne true', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }));
    const r = await networkScan.pingAlive('192.168.1.10', 80);
    expect(r).toBe(true);
  });

  it('pingAlive fetch reject → false', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('connection refused'));
    const r = await networkScan.pingAlive('192.168.1.99', 8080);
    expect(r).toBe(false);
  });

  it('probeIpPort port inconnu sans candidate → ping HEAD', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
    const r = await networkScan.probeIpPort('192.168.1.10', 12345);
    expect(r?.type).toBe('unknown');
    expect(r?.service).toContain('port 12345');
    expect(r?.ip).toBe('192.168.1.10');
  });

  it('probeIpPort port inconnu + ping fail → null', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('boom'));
    const r = await networkScan.probeIpPort('192.168.1.99', 12345);
    expect(r).toBeNull();
  });

  it('probeIpPort port avec candidate match → device identifié', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response('"bridgeid":"abc"', { status: 200 });
    });
    const r = await networkScan.probeIpPort('192.168.1.5', 80);
    expect(r).not.toBeNull();
    /* Plusieurs candidats pour port 80, accepte n'importe lequel */
    expect(r?.ip).toBe('192.168.1.5');
    expect(r?.port).toBe(80);
  });

  it('probeIpPort port avec candidate no match → null', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('random text', { status: 200 }));
    const r = await networkScan.probeIpPort('192.168.1.5', 1400);
    /* Sonos port 1400 mais texte ne contient pas "sonos" */
    expect(r).toBeNull();
  });

  it('probeIpPort fetch null (CORS) → continue suivants → null', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(null as unknown as Response);
    const r = await networkScan.probeIpPort('192.168.1.5', 8123);
    expect(r).toBeNull();
  });

  it('probeIpPort fetch text() throws → continue', async () => {
    const badResponse = {
      text: () => Promise.reject(new Error('text fail')),
      headers: new Headers(),
    } as unknown as Response;
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(badResponse);
    const r = await networkScan.probeIpPort('192.168.1.5', 8123);
    /* Match sur texte vide '' → check probe.match avec headers */
    /* Home Assistant probe : /manifest.json + match Home Assistant ou homeassistant
       text='' donc match=false → null */
    expect(r).toBeNull();
  });

  it('probeIpPort port Synology 5000 match via Server header', async () => {
    const headers = new Headers({ Server: 'Synology DSM' });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { headers }));
    const r = await networkScan.probeIpPort('192.168.1.10', 5000);
    /* Plusieurs candidats port 5000 (synology, octoprint, frigate) → premier match */
    expect(r).not.toBeNull();
  });
});

describe('network-scan — listKnownDevices / cache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('cache absent → liste vide', () => {
    expect(networkScan.listKnownDevices()).toEqual([]);
  });

  it('cache valide retourne devices', () => {
    const cached = {
      ok: true,
      local_ip: '192.168.1.50',
      subnet: '192.168.1.',
      devices: [
        { ip: '192.168.1.10', port: 80, type: 'hue_bridge', service: 'Hue', last_seen: Date.now() },
      ],
      scan_duration_ms: 100,
      cached_at: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    const devices = networkScan.listKnownDevices();
    expect(devices.length).toBe(1);
    expect(devices[0]?.type).toBe('hue_bridge');
  });

  it('cache expiré (> 5 min) → liste vide', () => {
    const cached = {
      ok: true, devices: [{ ip: '1.1.1.1', port: 80, type: 'unknown', service: 's', last_seen: 0 }],
      scan_duration_ms: 0,
      cached_at: Date.now() - 1000 * 60 * 10,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    expect(networkScan.listKnownDevices()).toEqual([]);
  });

  it('cache JSON corrupt → []', () => {
    localStorage.setItem(CACHE_KEY, 'BROKEN');
    expect(networkScan.listKnownDevices()).toEqual([]);
  });

  it('cache sans cached_at → traité comme expiré', () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      ok: true, devices: [{ ip: 'x', port: 1, type: 'unknown', service: 'x', last_seen: 0 }],
      scan_duration_ms: 0,
    }));
    expect(networkScan.listKnownDevices()).toEqual([]);
  });
});

describe('network-scan — openDeviceUI', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('appelle window.open avec URL formée', async () => {
    const openMock = vi.spyOn(window, 'open').mockImplementation(() => null);
    const r = await networkScan.openDeviceUI({
      ip: '192.168.1.10', port: 8080, type: 'home_assistant',
      service: 'HA', last_seen: 0,
    });
    expect(r.ok).toBe(true);
    expect(r.url).toBe('http://192.168.1.10:8080/');
    expect(openMock).toHaveBeenCalledWith('http://192.168.1.10:8080/', '_blank', 'noopener,noreferrer');
  });

  it('window.open absent → ok=true mais pas de crash', async () => {
    const orig = window.open;
    Object.defineProperty(window, 'open', { value: undefined, configurable: true });
    const r = await networkScan.openDeviceUI({
      ip: '10.0.0.1', port: 80, type: 'pihole', service: 'PiHole', last_seen: 0,
    });
    expect(r.ok).toBe(true);
    expect(r.url).toBe('http://10.0.0.1:80/');
    Object.defineProperty(window, 'open', { value: orig, configurable: true });
  });
});

describe('network-scan — scan() entry', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('useCache true + cache valide → retourne cache direct', async () => {
    const cached = {
      ok: true, local_ip: '192.168.1.50', subnet: '192.168.1.',
      devices: [], scan_duration_ms: 50, cached_at: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    const r = await networkScan.scan({ useCache: true });
    expect(r.ok).toBe(true);
    expect(r.devices).toEqual([]);
  });

  it('sans RTCPeerConnection → ok=false reason WebRTC', async () => {
    vi.stubGlobal('RTCPeerConnection', undefined);
    const r = await networkScan.scan({ useCache: false });
    expect(r.ok).toBe(false);
    expect(r.reason).toContain('WebRTC');
  });

  it('subnet explicite + RTCPeerConnection block → ok=false reason WebRTC', async () => {
    vi.stubGlobal('RTCPeerConnection', undefined);
    const r = await networkScan.scan({ subnet: '192.168.1.', useCache: false });
    expect(r.ok).toBe(false);
    expect(r.reason).toContain('WebRTC');
  });

  it('useCache false ignoré du cache même valide', async () => {
    /* Cache valide */
    const cached = {
      ok: true, local_ip: '192.168.1.50', subnet: '192.168.1.',
      devices: [{ ip: 'x', port: 1, type: 'unknown', service: 's', last_seen: 0 }],
      scan_duration_ms: 50, cached_at: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    /* Mais RTCPeerConnection bloqué → fallback sur fail */
    vi.stubGlobal('RTCPeerConnection', undefined);
    const r = await networkScan.scan({ useCache: false });
    expect(r.ok).toBe(false);
  });
});

describe('network-scan — DEVICE_PROBES catalog (smoke)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reachable port 8123 returns Home Assistant si manifest.json contient', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{"name":"Home Assistant"}', { status: 200 }),
    );
    const r = await networkScan.probeIpPort('192.168.1.20', 8123);
    expect(r?.type).toBe('home_assistant');
  });

  it('Plex port 32400 detection', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<MediaContainer>blabla</MediaContainer>', { status: 200 }),
    );
    const r = await networkScan.probeIpPort('192.168.1.30', 32400);
    expect(r?.type).toBe('plex');
  });

  it('Jellyfin port 8096 detection', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Jellyfin Server', { status: 200 }),
    );
    const r = await networkScan.probeIpPort('192.168.1.40', 8096);
    expect(r).not.toBeNull();
    /* Pourrait être jellyfin ou emby selon ordre catalogue */
  });

  it('chromecast TLS port 8009 always-true match', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 200 }));
    const r = await networkScan.probeIpPort('192.168.1.50', 8009);
    expect(r?.type).toBe('chromecast');
  });

  it('apple_tv port 9197 always-true match', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 200 }));
    const r = await networkScan.probeIpPort('192.168.1.60', 9197);
    expect(r?.type).toBe('apple_tv');
  });

  it('mqtt_broker port 1883 always-true match', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 200 }));
    const r = await networkScan.probeIpPort('192.168.1.70', 1883);
    expect(r?.type).toBe('mqtt_broker');
  });

  it('ports 631 IPP printer detection via texte CUPS', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('CUPS 2.4.1', { status: 200 }));
    const r = await networkScan.probeIpPort('192.168.1.80', 631);
    expect(r?.type).toBe('printer_ipp');
  });
});
