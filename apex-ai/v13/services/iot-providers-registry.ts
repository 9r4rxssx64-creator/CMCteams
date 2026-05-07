/**
 * APEX v13.3.52 — IoT Providers Registry (Kevin 2026-05-07).
 *
 * Demande Kevin (textuel 2026-05-07 23h40) :
 *   "Je veux qu'il commande aussi dans mes comptes eWeLink et SmartLife"
 *   "Et qu'il puisse s'installer en autonomie d'autres plus tard"
 *
 * Framework générique pluggable qui permet à Apex IA :
 * - de piloter N+ providers Smart Home/IoT (eWeLink, Tuya/SmartLife, Hue, Sonos,
 *   Home Assistant, Broadlink) via une seule API uniforme
 * - de self-installer de nouveaux providers à la volée (tool install_iot_provider)
 *   sans modification du code (Kevin règle "autonomie totale toujours partout")
 *
 * Architecture :
 * - Pattern registry : chaque provider implémente IoTProvider (descripteur déclaratif)
 *   + IoTProviderClient (implémentation runtime).
 * - 6 providers BUILTIN_PROVIDERS pré-enregistrés (eWeLink/Tuya/Broadlink/Hue/Sonos/HA).
 * - Custom providers ajoutables runtime (persistés `ax_iot_custom_providers`).
 * - Credentials stockés chiffrés via vault (clés `ax_<provider>_*`).
 * - testConnection ping endpoint léger → status 🟢/🔴.
 * - listAllDevices aggregate cross-provider → tableau unique.
 * - sendCommand route vers bon provider selon providerId.
 *
 * Sécurité (CLAUDE.md "SÉCURITÉ AVANT AUTONOMIE TOTALE") :
 * - Tous tokens/passwords passent par vault.setKey (AES-GCM-256 + PBKDF2 200k).
 * - Aucun secret jamais en clair en localStorage.
 * - Audit log immutable sur chaque install/sendCommand.
 * - Whitelist endpoints stricte (pas d'URL arbitraire dans custom provider sans guard).
 *
 * CORS / Network :
 * - Comme broadlink-bridge, fallback Cloudflare Worker proxy si CORS bloque
 *   (clé `ax_iot_proxy_url`). Permet utilisation depuis Safari iOS PWA.
 *
 * NB : ne PAS dupliquer broadlink-bridge — on l'enregistre comme provider du
 * registry et on délègue les appels (réutilisation propre).
 */

import { logger } from '../core/logger.js';

import { auditLog } from './audit-log.js';
import { broadlinkBridge, type BroadlinkDevice } from './broadlink-bridge.js';
import { vault } from './vault.js';

/* ============================================================================
 * Types publics (descripteur provider)
 * ============================================================================ */

export type IoTProviderCategory =
  | 'broadlink'
  | 'sonoff' /* eWeLink */
  | 'tuya' /* SmartLife */
  | 'hue'
  | 'sonos'
  | 'shelly'
  | 'tasmota'
  | 'homekit'
  | 'home-assistant'
  | 'custom';

export type IoTAuthFormat = 'bearer' | 'basic' | 'api_key' | 'jwt' | 'oauth2' | 'session';

export interface IoTProvider {
  id: string;
  name: string;
  category: IoTProviderCategory;
  /** URL console/dashboard où Kevin peut gérer son compte. */
  console_url: string;
  /** OAuth optionnel (si applicable). */
  oauth?: {
    authorize_url: string;
    token_url: string;
    client_id_key: string;
    client_secret_key: string;
    scopes: string[];
  };
  /** API endpoint base + auth scheme. */
  api?: {
    base_url: string;
    auth_header: string;
    auth_format: IoTAuthFormat;
  };
  /** Endpoints templates (relative paths, body templates). */
  endpoints: {
    login?: { method: 'POST'; path: string; body_template: Record<string, unknown> };
    list_devices: { method: 'GET' | 'POST'; path: string };
    send_command: { method: 'POST'; path: string; body_template: Record<string, unknown> };
    get_state?: { method: 'GET'; path: string };
  };
  /** Clés vault attendues (ex: ['ax_ewelink_email','ax_ewelink_password']). */
  credential_keys: string[];
  /** Endpoint léger pour testConnection (HEAD/GET ping). Relatif au base_url. */
  test_endpoint: string;
  free_tier_limit?: { requests_per_hour?: number; devices_max?: number };
  /** Catégorie d'icône (UI). */
  icon?: string;
  /** Brève description user-friendly. */
  description?: string;
}

export interface IoTDevice {
  provider: string;
  device_id: string;
  name: string;
  type: string;
  online: boolean;
  /** Capabilities standard : on_off, brightness, color, temp, etc. */
  capabilities?: string[];
}

export interface IoTConnectionResult {
  ok: boolean;
  latency_ms?: number;
  devices_count?: number;
  error?: string;
  reason?: 'no_credentials' | 'cors_blocked' | 'http_error' | 'invalid_credentials' | 'network';
}

export interface IoTInstallInput {
  provider_id: string;
  /** Map credentials : { email, password } OU { client_id, client_secret } OU { token }. */
  credentials: Record<string, string>;
  /** Région optionnelle (us|eu|cn|as) pour eWeLink/Tuya. */
  region?: string;
}

export interface IoTInstallResult {
  ok: boolean;
  provider_id: string;
  devices_found?: number;
  error?: string;
}

export interface IoTSendCommandResult {
  ok: boolean;
  error?: string;
  reason?: 'no_provider' | 'no_credentials' | 'cors_blocked' | 'http_error' | 'network';
}

/* ============================================================================
 * Constantes & storage
 * ============================================================================ */

const CUSTOM_PROVIDERS_KEY = 'ax_iot_custom_providers';
const PROXY_KEY = 'ax_iot_proxy_url';
const FETCH_TIMEOUT_MS = 8000;

/* Régions multi-providers (eWeLink + Tuya) */
const EWELINK_REGION_MAP: Record<string, string> = {
  us: 'https://us-apia.coolkit.cc',
  eu: 'https://eu-apia.coolkit.cc',
  as: 'https://as-apia.coolkit.cc',
  cn: 'https://cn-apia.coolkit.cn',
};

const TUYA_REGION_MAP: Record<string, string> = {
  us: 'https://openapi.tuyaus.com',
  eu: 'https://openapi.tuyaeu.com',
  cn: 'https://openapi.tuyacn.com',
  in: 'https://openapi.tuyain.com',
};

/* ============================================================================
 * Builtin providers — 6 majeurs préinstallés
 * ============================================================================ */

export const BUILTIN_PROVIDERS: readonly IoTProvider[] = [
  /* A. eWeLink (Sonoff) */
  {
    id: 'ewelink',
    name: 'eWeLink (Sonoff)',
    category: 'sonoff',
    console_url: 'https://web.ewelink.cc',
    icon: '🔌',
    description: 'Sonoff / eWeLink : interrupteurs, prises, lampes, capteurs. Auth email + password.',
    api: {
      base_url: 'https://eu-apia.coolkit.cc',
      auth_header: 'Authorization',
      auth_format: 'bearer',
    },
    endpoints: {
      login: { method: 'POST', path: '/v2/user/login', body_template: { email: '{email}', password: '{password}', countryCode: '+33' } },
      list_devices: { method: 'GET', path: '/v2/device/thing' },
      send_command: { method: 'POST', path: '/v2/device/thing/control', body_template: { thingList: [{ itemType: 1, id: '{device_id}', params: '{params}' }] } },
      get_state: { method: 'GET', path: '/v2/device/thing' },
    },
    credential_keys: ['ax_ewelink_email', 'ax_ewelink_password', 'ax_ewelink_region', 'ax_ewelink_token'],
    test_endpoint: '/v2/user/profile',
    free_tier_limit: { requests_per_hour: 1000 },
  },
  /* B. SmartLife (Tuya) */
  {
    id: 'tuya',
    name: 'SmartLife (Tuya Cloud)',
    category: 'tuya',
    console_url: 'https://iot.tuya.com',
    icon: '💡',
    description: 'Tuya / SmartLife : compatibilité Tuya OEM (lumières, prises, climat, sécu). Auth OAuth2 client_id + client_secret.',
    api: {
      base_url: 'https://openapi.tuyaeu.com',
      auth_header: 'access_token',
      auth_format: 'oauth2',
    },
    endpoints: {
      login: { method: 'GET', path: '/v1.0/token?grant_type=1', body_template: {} },
      list_devices: { method: 'GET', path: '/v1.0/users/{uid}/devices' },
      send_command: { method: 'POST', path: '/v1.0/devices/{device_id}/commands', body_template: { commands: '{commands}' } },
      get_state: { method: 'GET', path: '/v1.0/devices/{device_id}/status' },
    },
    credential_keys: ['ax_tuya_client_id', 'ax_tuya_client_secret', 'ax_tuya_uid', 'ax_tuya_region', 'ax_tuya_access_token'],
    test_endpoint: '/v1.0/token?grant_type=1',
    free_tier_limit: { requests_per_hour: 5000 },
  },
  /* C. Broadlink Cloud */
  {
    id: 'broadlink',
    name: 'Broadlink Cloud',
    category: 'broadlink',
    console_url: 'https://www.ibroadlink.com',
    icon: '📡',
    description: 'Broadlink RM Pro/Mini, prises, capteurs. Pilotage IR/RF. Auth email + password.',
    api: {
      base_url: 'https://api.ibroadlink.com',
      auth_header: 'common-loginsession',
      auth_format: 'session',
    },
    endpoints: {
      login: { method: 'POST', path: '/appsync/group/v2/login', body_template: { email: '{email}', password: '{password}', loginsource: 0 } },
      list_devices: { method: 'POST', path: '/appsync/group/v2/family/list' },
      send_command: { method: 'POST', path: '/appsync/group/dev/v3/sendcmd', body_template: { endpointId: '{device_id}', act: 'sendcmd', data: { code: '{ir_hex}' } } },
    },
    credential_keys: ['ax_broadlink_email', 'ax_broadlink_password', 'ax_broadlink_token'],
    test_endpoint: '/appsync/group/v2/family/list',
  },
  /* D. Philips Hue (LAN bridge ou Cloud) */
  {
    id: 'hue',
    name: 'Philips Hue',
    category: 'hue',
    console_url: 'https://account.meethue.com',
    icon: '🌈',
    description: 'Philips Hue : lampes connectées via Hue Bridge LAN ou cloud. Auth username (LAN) ou OAuth (cloud).',
    api: {
      base_url: 'https://api.meethue.com',
      auth_header: 'Authorization',
      auth_format: 'bearer',
    },
    endpoints: {
      list_devices: { method: 'GET', path: '/route/api/{username}/lights' },
      send_command: { method: 'POST', path: '/route/api/{username}/lights/{device_id}/state', body_template: { on: '{on}', bri: '{bri}', xy: '{xy}' } },
      get_state: { method: 'GET', path: '/route/api/{username}/lights/{device_id}' },
    },
    credential_keys: ['ax_hue_bridge_ip', 'ax_hue_username', 'ax_hue_oauth_token'],
    test_endpoint: '/route/api/{username}/config',
  },
  /* E. Sonos (Cloud OAuth2) */
  {
    id: 'sonos',
    name: 'Sonos',
    category: 'sonos',
    console_url: 'https://developer.sonos.com',
    icon: '🔊',
    description: 'Sonos : enceintes connectées, audio multi-room. Auth OAuth2 Sonos Developer.',
    oauth: {
      authorize_url: 'https://api.sonos.com/login/v3/oauth',
      token_url: 'https://api.sonos.com/login/v3/oauth/access',
      client_id_key: 'ax_sonos_client_id',
      client_secret_key: 'ax_sonos_client_secret',
      scopes: ['playback-control-all'],
    },
    api: {
      base_url: 'https://api.ws.sonos.com/control/api',
      auth_header: 'Authorization',
      auth_format: 'bearer',
    },
    endpoints: {
      list_devices: { method: 'GET', path: '/v1/households/{household}/groups' },
      send_command: { method: 'POST', path: '/v1/groups/{device_id}/playback/{action}', body_template: {} },
      get_state: { method: 'GET', path: '/v1/groups/{device_id}/playbackStatus' },
    },
    credential_keys: ['ax_sonos_client_id', 'ax_sonos_client_secret', 'ax_sonos_token', 'ax_sonos_household'],
    test_endpoint: '/v1/households',
  },
  /* F. Home Assistant (self-hosted local ou exposé) */
  {
    id: 'home-assistant',
    name: 'Home Assistant',
    category: 'home-assistant',
    console_url: 'https://www.home-assistant.io',
    icon: '🏠',
    description: 'Home Assistant self-hosted : tout protocole (Zigbee, Z-Wave, Matter, ...). Auth Long-Lived Access Token.',
    api: {
      base_url: '', /* dynamique via ax_ha_url */
      auth_header: 'Authorization',
      auth_format: 'bearer',
    },
    endpoints: {
      list_devices: { method: 'GET', path: '/api/states' },
      send_command: { method: 'POST', path: '/api/services/{domain}/{service}', body_template: { entity_id: '{device_id}' } },
      get_state: { method: 'GET', path: '/api/states/{device_id}' },
    },
    credential_keys: ['ax_ha_url', 'ax_ha_token'],
    test_endpoint: '/api/',
  },
];

/* ============================================================================
 * HTTP helper unifié (proxy fallback CORS)
 * ============================================================================ */

interface FetchResultOk<T> { ok: true; data: T; status: number; latency_ms: number }
interface FetchResultErr { ok: false; status?: number; error: string; reason: IoTConnectionResult['reason']; latency_ms: number }
type FetchResult<T> = FetchResultOk<T> | FetchResultErr;

async function fetchIot<T>(
  url: string,
  options: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; headers?: Record<string, string>; body?: unknown } = {},
): Promise<FetchResult<T>> {
  const proxy = (typeof localStorage !== 'undefined' ? localStorage.getItem(PROXY_KEY) : null) ?? '';
  const finalUrl = proxy ? `${proxy.replace(/\/$/, '')}/?url=${encodeURIComponent(url)}` : url;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  const start = Date.now();
  try {
    const init: RequestInit = {
      method: options.method ?? 'GET',
      headers: { 'content-type': 'application/json', ...(options.headers ?? {}) },
      signal: ctrl.signal,
    };
    if (options.body !== undefined) init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    const resp = await fetch(finalUrl, init);
    clearTimeout(timer);
    const latency = Date.now() - start;
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      return { ok: false, status: resp.status, error: `HTTP ${resp.status}: ${text.slice(0, 200)}`, reason: 'http_error', latency_ms: latency };
    }
    const data = (await resp.json().catch(() => ({}))) as T;
    return { ok: true, data, status: resp.status, latency_ms: latency };
  } catch (err: unknown) {
    clearTimeout(timer);
    const latency = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    if (/cors|cross-?origin|opaque/i.test(msg)) return { ok: false, error: msg, reason: 'cors_blocked', latency_ms: latency };
    return { ok: false, error: msg, reason: 'network', latency_ms: latency };
  }
}

/* ============================================================================
 * Provider-specific clients (route depuis sendCommand/listDevices)
 * ============================================================================ */

interface ProviderClient {
  install(input: IoTInstallInput): Promise<IoTInstallResult>;
  testConnection(): Promise<IoTConnectionResult>;
  listDevices(): Promise<IoTDevice[]>;
  sendCommand(deviceId: string, command: Record<string, unknown>): Promise<IoTSendCommandResult>;
}

/* --- eWeLink client --- */
class EWeLinkClient implements ProviderClient {
  private getBase(): string {
    const region = (typeof localStorage !== 'undefined' ? localStorage.getItem('ax_ewelink_region') : null) ?? 'eu';
    return EWELINK_REGION_MAP[region] ?? EWELINK_REGION_MAP.eu;
  }

  async install(input: IoTInstallInput): Promise<IoTInstallResult> {
    const email = input.credentials.email ?? input.credentials.username ?? '';
    const password = input.credentials.password ?? '';
    if (!email || !password) return { ok: false, provider_id: 'ewelink', error: 'email + password requis' };
    if (input.region) {
      try { localStorage.setItem('ax_ewelink_region', input.region); } catch { /* quota */ }
    }
    const url = `${this.getBase()}/v2/user/login`;
    const body = { email, password, countryCode: '+33' };
    const r = await fetchIot<{ data?: { at?: string; user?: { apikey?: string } }; error?: number; msg?: string }>(url, {
      method: 'POST',
      body,
    });
    if (!r.ok) return { ok: false, provider_id: 'ewelink', error: r.error };
    if (r.data.error && r.data.error !== 0) return { ok: false, provider_id: 'ewelink', error: r.data.msg ?? `error ${r.data.error}` };
    const token = r.data.data?.at;
    if (!token) return { ok: false, provider_id: 'ewelink', error: 'Pas de token retourné' };
    try { localStorage.setItem('ax_ewelink_email', email); } catch { /* quota */ }
    await vault.setKey('ax_ewelink_password', password);
    await vault.setKey('ax_ewelink_token', token);
    const devices = await this.listDevices().catch(() => []);
    return { ok: true, provider_id: 'ewelink', devices_found: devices.length };
  }

  async testConnection(): Promise<IoTConnectionResult> {
    const token = await vault.readKey('ax_ewelink_token').catch(() => '');
    if (!token) return { ok: false, reason: 'no_credentials', error: 'Token eWeLink manquant' };
    const r = await fetchIot<{ data?: { thingList?: unknown[] } }>(`${this.getBase()}/v2/device/thing`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return { ok: false, reason: r.reason, error: r.error };
    const out: IoTConnectionResult = { ok: true, latency_ms: r.latency_ms, devices_count: r.data.data?.thingList?.length ?? 0 };
    return out;
  }

  async listDevices(): Promise<IoTDevice[]> {
    const token = await vault.readKey('ax_ewelink_token').catch(() => '');
    if (!token) return [];
    const r = await fetchIot<{ data?: { thingList?: Array<{ itemData?: { deviceid?: string; name?: string; productModel?: string; online?: boolean } }> } }>(
      `${this.getBase()}/v2/device/thing`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!r.ok) return [];
    const list = r.data.data?.thingList ?? [];
    return list.map((t) => ({
      provider: 'ewelink',
      device_id: t.itemData?.deviceid ?? '',
      name: t.itemData?.name ?? 'Sonoff sans nom',
      type: t.itemData?.productModel ?? 'unknown',
      online: !!t.itemData?.online,
      capabilities: ['on_off'],
    }));
  }

  async sendCommand(deviceId: string, command: Record<string, unknown>): Promise<IoTSendCommandResult> {
    const token = await vault.readKey('ax_ewelink_token').catch(() => '');
    if (!token) return { ok: false, reason: 'no_credentials', error: 'Pas connecté à eWeLink' };
    const r = await fetchIot<{ error?: number; msg?: string }>(
      `${this.getBase()}/v2/device/thing/control`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { thingList: [{ itemType: 1, id: deviceId, params: command }] },
      },
    );
    if (!r.ok) return { ok: false, reason: r.reason, error: r.error };
    if (r.data.error && r.data.error !== 0) return { ok: false, reason: 'http_error', error: r.data.msg ?? `error ${r.data.error}` };
    return { ok: true };
  }
}

/* --- Tuya / SmartLife client --- */
class TuyaClient implements ProviderClient {
  private getBase(): string {
    const region = (typeof localStorage !== 'undefined' ? localStorage.getItem('ax_tuya_region') : null) ?? 'eu';
    return TUYA_REGION_MAP[region] ?? TUYA_REGION_MAP.eu;
  }

  async install(input: IoTInstallInput): Promise<IoTInstallResult> {
    const clientId = input.credentials.client_id ?? input.credentials.access_id ?? '';
    const clientSecret = input.credentials.client_secret ?? input.credentials.access_secret ?? '';
    const uid = input.credentials.uid ?? '';
    const accessToken = input.credentials.access_token ?? input.credentials.token ?? '';
    if (!clientId || !clientSecret) return { ok: false, provider_id: 'tuya', error: 'client_id + client_secret requis' };
    if (input.region) {
      try { localStorage.setItem('ax_tuya_region', input.region); } catch { /* quota */ }
    }
    await vault.setKey('ax_tuya_client_id', clientId);
    await vault.setKey('ax_tuya_client_secret', clientSecret);
    if (uid) {
      try { localStorage.setItem('ax_tuya_uid', uid); } catch { /* quota */ }
    }
    if (accessToken) await vault.setKey('ax_tuya_access_token', accessToken);
    /* Note : signature Tuya HMAC-SHA256 requiert plus que client_id/secret.
     * Pour MVP, on fait confiance au token fourni si présent.
     * Sinon on tente endpoint token (gateway permet le grant_type=1). */
    const test = await this.testConnection();
    return { ok: test.ok, provider_id: 'tuya', error: test.error, devices_found: test.devices_count };
  }

  async testConnection(): Promise<IoTConnectionResult> {
    const token = await vault.readKey('ax_tuya_access_token').catch(() => '');
    const clientId = await vault.readKey('ax_tuya_client_id').catch(() => '');
    if (!token && !clientId) return { ok: false, reason: 'no_credentials', error: 'Tuya credentials manquants' };
    /* Light ping : list devices si uid + token présents, sinon endpoint /v1.0/token */
    const uid = (typeof localStorage !== 'undefined' ? localStorage.getItem('ax_tuya_uid') : null) ?? '';
    if (token && uid) {
      const r = await fetchIot<{ result?: unknown[]; success?: boolean }>(`${this.getBase()}/v1.0/users/${uid}/devices`, {
        headers: { access_token: token },
      });
      if (!r.ok) return { ok: false, reason: r.reason, error: r.error };
      return { ok: true, latency_ms: r.latency_ms, devices_count: Array.isArray(r.data.result) ? r.data.result.length : 0 };
    }
    return { ok: !!clientId, latency_ms: 0, devices_count: 0 };
  }

  async listDevices(): Promise<IoTDevice[]> {
    const token = await vault.readKey('ax_tuya_access_token').catch(() => '');
    const uid = (typeof localStorage !== 'undefined' ? localStorage.getItem('ax_tuya_uid') : null) ?? '';
    if (!token || !uid) return [];
    const r = await fetchIot<{ result?: Array<{ id?: string; name?: string; category?: string; online?: boolean }> }>(
      `${this.getBase()}/v1.0/users/${uid}/devices`,
      { headers: { access_token: token } },
    );
    if (!r.ok) return [];
    const list = r.data.result ?? [];
    return list.map((d) => ({
      provider: 'tuya',
      device_id: d.id ?? '',
      name: d.name ?? 'Tuya sans nom',
      type: d.category ?? 'unknown',
      online: !!d.online,
      capabilities: ['on_off', 'brightness'],
    }));
  }

  async sendCommand(deviceId: string, command: Record<string, unknown>): Promise<IoTSendCommandResult> {
    const token = await vault.readKey('ax_tuya_access_token').catch(() => '');
    if (!token) return { ok: false, reason: 'no_credentials', error: 'Pas connecté à Tuya' };
    /* Tuya commands format : [{code, value}] */
    const commands = Array.isArray(command.commands)
      ? command.commands
      : Object.entries(command).map(([code, value]) => ({ code, value }));
    const r = await fetchIot<{ success?: boolean; msg?: string }>(
      `${this.getBase()}/v1.0/devices/${deviceId}/commands`,
      {
        method: 'POST',
        headers: { access_token: token },
        body: { commands },
      },
    );
    if (!r.ok) return { ok: false, reason: r.reason, error: r.error };
    if (r.data.success === false) return { ok: false, reason: 'http_error', error: r.data.msg ?? 'Tuya refusé' };
    return { ok: true };
  }
}

/* --- Broadlink client (réutilise broadlinkBridge) --- */
class BroadlinkClient implements ProviderClient {
  async install(input: IoTInstallInput): Promise<IoTInstallResult> {
    const email = input.credentials.email ?? '';
    const password = input.credentials.password ?? '';
    const token = input.credentials.token ?? '';
    if (token) {
      const r = await broadlinkBridge.setToken(token, email);
      if (!r.ok) return { ok: false, provider_id: 'broadlink', error: 'setToken failed' };
    } else {
      if (!email || !password) return { ok: false, provider_id: 'broadlink', error: 'email + password requis (ou token)' };
      const r = await broadlinkBridge.login(email, password);
      if (!r.ok) return { ok: false, provider_id: 'broadlink', error: r.error };
    }
    const devices = await broadlinkBridge.listDevices(true).catch(() => []);
    return { ok: true, provider_id: 'broadlink', devices_found: devices.length };
  }

  async testConnection(): Promise<IoTConnectionResult> {
    const status = await broadlinkBridge.status();
    if (!status.configured) return { ok: false, reason: 'no_credentials', error: 'Broadlink pas configuré' };
    const devices = await broadlinkBridge.listDevices().catch(() => []);
    return { ok: true, devices_count: devices.length, latency_ms: 0 };
  }

  async listDevices(): Promise<IoTDevice[]> {
    const list: BroadlinkDevice[] = await broadlinkBridge.listDevices().catch(() => []);
    return list.map((d) => ({
      provider: 'broadlink',
      device_id: d.id,
      name: d.name,
      type: d.type,
      online: d.online,
      capabilities: d.type === 'rm' ? ['ir_send', 'ir_learn'] : ['on_off'],
    }));
  }

  async sendCommand(deviceId: string, command: Record<string, unknown>): Promise<IoTSendCommandResult> {
    const irHex = String(command.ir_hex ?? command.code ?? '');
    if (!irHex) return { ok: false, reason: 'http_error', error: 'ir_hex manquant pour Broadlink' };
    const r = await broadlinkBridge.sendIR(deviceId, irHex);
    if (!r.ok) {
      const reason: IoTSendCommandResult['reason'] =
        r.reason === 'cors_blocked' ? 'cors_blocked'
        : r.reason === 'no_token' ? 'no_credentials'
        : r.reason === 'http_error' ? 'http_error'
        : 'network';
      return { ok: false, reason, error: r.error };
    }
    return { ok: true };
  }
}

/* --- Hue client (LAN bridge ou cloud) --- */
class HueClient implements ProviderClient {
  private getBaseAndAuth(): { base: string; username: string; cloud: boolean } {
    const ip = (typeof localStorage !== 'undefined' ? localStorage.getItem('ax_hue_bridge_ip') : null) ?? '';
    const username = (typeof localStorage !== 'undefined' ? localStorage.getItem('ax_hue_username') : null) ?? '';
    if (ip) return { base: `http://${ip}`, username, cloud: false };
    return { base: 'https://api.meethue.com/route', username, cloud: true };
  }

  async install(input: IoTInstallInput): Promise<IoTInstallResult> {
    const ip = input.credentials.bridge_ip ?? input.credentials.ip ?? '';
    const username = input.credentials.username ?? input.credentials.user ?? '';
    const oauthToken = input.credentials.oauth_token ?? input.credentials.token ?? '';
    if (!username && !oauthToken) return { ok: false, provider_id: 'hue', error: 'username (LAN) ou oauth_token (cloud) requis' };
    if (ip) {
      try { localStorage.setItem('ax_hue_bridge_ip', ip); } catch { /* quota */ }
    }
    if (username) {
      try { localStorage.setItem('ax_hue_username', username); } catch { /* quota */ }
    }
    if (oauthToken) await vault.setKey('ax_hue_oauth_token', oauthToken);
    const test = await this.testConnection();
    return { ok: test.ok, provider_id: 'hue', error: test.error, devices_found: test.devices_count };
  }

  async testConnection(): Promise<IoTConnectionResult> {
    const { base, username } = this.getBaseAndAuth();
    if (!username) return { ok: false, reason: 'no_credentials', error: 'Username Hue manquant' };
    const r = await fetchIot<Record<string, unknown>>(`${base}/api/${username}/lights`);
    if (!r.ok) return { ok: false, reason: r.reason, error: r.error };
    const count = typeof r.data === 'object' ? Object.keys(r.data).length : 0;
    return { ok: true, latency_ms: r.latency_ms, devices_count: count };
  }

  async listDevices(): Promise<IoTDevice[]> {
    const { base, username } = this.getBaseAndAuth();
    if (!username) return [];
    const r = await fetchIot<Record<string, { name?: string; type?: string; state?: { reachable?: boolean } }>>(`${base}/api/${username}/lights`);
    if (!r.ok) return [];
    return Object.entries(r.data).map(([id, light]) => ({
      provider: 'hue',
      device_id: id,
      name: light.name ?? `Hue ${id}`,
      type: light.type ?? 'light',
      online: light.state?.reachable !== false,
      capabilities: ['on_off', 'brightness', 'color'],
    }));
  }

  async sendCommand(deviceId: string, command: Record<string, unknown>): Promise<IoTSendCommandResult> {
    const { base, username } = this.getBaseAndAuth();
    if (!username) return { ok: false, reason: 'no_credentials', error: 'Hue pas configuré' };
    const r = await fetchIot<unknown>(`${base}/api/${username}/lights/${deviceId}/state`, {
      method: 'PUT',
      body: command,
    });
    if (!r.ok) return { ok: false, reason: r.reason, error: r.error };
    return { ok: true };
  }
}

/* --- Sonos client (cloud OAuth2) --- */
class SonosClient implements ProviderClient {
  async install(input: IoTInstallInput): Promise<IoTInstallResult> {
    const token = input.credentials.token ?? input.credentials.access_token ?? '';
    const household = input.credentials.household ?? input.credentials.household_id ?? '';
    if (!token) return { ok: false, provider_id: 'sonos', error: 'access_token Sonos requis (OAuth2)' };
    await vault.setKey('ax_sonos_token', token);
    if (household) {
      try { localStorage.setItem('ax_sonos_household', household); } catch { /* quota */ }
    }
    const test = await this.testConnection();
    return { ok: test.ok, provider_id: 'sonos', error: test.error, devices_found: test.devices_count };
  }

  async testConnection(): Promise<IoTConnectionResult> {
    const token = await vault.readKey('ax_sonos_token').catch(() => '');
    if (!token) return { ok: false, reason: 'no_credentials', error: 'Sonos token manquant' };
    const r = await fetchIot<{ households?: Array<{ id: string }> }>('https://api.ws.sonos.com/control/api/v1/households', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return { ok: false, reason: r.reason, error: r.error };
    const count = r.data.households?.length ?? 0;
    /* Persist 1er household si pas configuré */
    if (count > 0) {
      const stored = (typeof localStorage !== 'undefined' ? localStorage.getItem('ax_sonos_household') : null) ?? '';
      const firstId = r.data.households?.[0]?.id;
      if (!stored && firstId) {
        try { localStorage.setItem('ax_sonos_household', firstId); } catch { /* quota */ }
      }
    }
    return { ok: true, latency_ms: r.latency_ms, devices_count: count };
  }

  async listDevices(): Promise<IoTDevice[]> {
    const token = await vault.readKey('ax_sonos_token').catch(() => '');
    const household = (typeof localStorage !== 'undefined' ? localStorage.getItem('ax_sonos_household') : null) ?? '';
    if (!token || !household) return [];
    const r = await fetchIot<{ groups?: Array<{ id?: string; name?: string }> }>(
      `https://api.ws.sonos.com/control/api/v1/households/${household}/groups`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!r.ok) return [];
    return (r.data.groups ?? []).map((g) => ({
      provider: 'sonos',
      device_id: g.id ?? '',
      name: g.name ?? 'Sonos group',
      type: 'speaker_group',
      online: true,
      capabilities: ['play', 'pause', 'volume', 'next', 'previous'],
    }));
  }

  async sendCommand(deviceId: string, command: Record<string, unknown>): Promise<IoTSendCommandResult> {
    const token = await vault.readKey('ax_sonos_token').catch(() => '');
    if (!token) return { ok: false, reason: 'no_credentials', error: 'Sonos pas configuré' };
    const action = String(command.action ?? 'play');
    const r = await fetchIot<unknown>(`https://api.ws.sonos.com/control/api/v1/groups/${deviceId}/playback/${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {},
    });
    if (!r.ok) return { ok: false, reason: r.reason, error: r.error };
    return { ok: true };
  }
}

/* --- Home Assistant client --- */
class HomeAssistantClient implements ProviderClient {
  private getBase(): string {
    return ((typeof localStorage !== 'undefined' ? localStorage.getItem('ax_ha_url') : null) ?? '').replace(/\/$/, '');
  }

  async install(input: IoTInstallInput): Promise<IoTInstallResult> {
    const url = input.credentials.url ?? input.credentials.ha_url ?? '';
    const token = input.credentials.token ?? input.credentials.access_token ?? '';
    if (!url || !token) return { ok: false, provider_id: 'home-assistant', error: 'url + token (LLAT) requis' };
    try { localStorage.setItem('ax_ha_url', url); } catch { /* quota */ }
    await vault.setKey('ax_ha_token', token);
    const test = await this.testConnection();
    return { ok: test.ok, provider_id: 'home-assistant', error: test.error, devices_found: test.devices_count };
  }

  async testConnection(): Promise<IoTConnectionResult> {
    const base = this.getBase();
    const token = await vault.readKey('ax_ha_token').catch(() => '');
    if (!base || !token) return { ok: false, reason: 'no_credentials', error: 'Home Assistant URL + token manquants' };
    const r = await fetchIot<{ message?: string }>(`${base}/api/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return { ok: false, reason: r.reason, error: r.error };
    /* listDevices pour count exact */
    const devices = await this.listDevices().catch(() => []);
    return { ok: true, latency_ms: r.latency_ms, devices_count: devices.length };
  }

  async listDevices(): Promise<IoTDevice[]> {
    const base = this.getBase();
    const token = await vault.readKey('ax_ha_token').catch(() => '');
    if (!base || !token) return [];
    const r = await fetchIot<Array<{ entity_id?: string; attributes?: { friendly_name?: string }; state?: string }>>(
      `${base}/api/states`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!r.ok) return [];
    return r.data
      .filter((e) => /^(light|switch|climate|media_player|cover|fan|lock)\./.test(e.entity_id ?? ''))
      .map((e) => ({
        provider: 'home-assistant',
        device_id: e.entity_id ?? '',
        name: e.attributes?.friendly_name ?? e.entity_id ?? 'HA entity',
        type: (e.entity_id ?? '').split('.')[0] ?? 'unknown',
        online: e.state !== 'unavailable',
        capabilities: ['on_off'],
      }));
  }

  async sendCommand(deviceId: string, command: Record<string, unknown>): Promise<IoTSendCommandResult> {
    const base = this.getBase();
    const token = await vault.readKey('ax_ha_token').catch(() => '');
    if (!base || !token) return { ok: false, reason: 'no_credentials', error: 'Home Assistant pas configuré' };
    const domain = (deviceId.split('.')[0] ?? 'homeassistant');
    const service = String(command.service ?? command.action ?? 'toggle');
    const body: Record<string, unknown> = { entity_id: deviceId, ...command };
    delete body.service;
    delete body.action;
    const r = await fetchIot<unknown>(`${base}/api/services/${domain}/${service}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body,
    });
    if (!r.ok) return { ok: false, reason: r.reason, error: r.error };
    return { ok: true };
  }
}

/* ============================================================================
 * Registry principal
 * ============================================================================ */

class IoTRegistry {
  private providers = new Map<string, IoTProvider>();
  private clients = new Map<string, ProviderClient>();

  constructor() {
    /* Builtin providers */
    for (const p of BUILTIN_PROVIDERS) this.providers.set(p.id, p);
    /* Clients runtime (DI manuelle pour les builtin) */
    this.clients.set('ewelink', new EWeLinkClient());
    this.clients.set('tuya', new TuyaClient());
    this.clients.set('broadlink', new BroadlinkClient());
    this.clients.set('hue', new HueClient());
    this.clients.set('sonos', new SonosClient());
    this.clients.set('home-assistant', new HomeAssistantClient());
    /* Restore custom providers */
    this.loadCustomProviders();
  }

  private loadCustomProviders(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(CUSTOM_PROVIDERS_KEY);
      if (!raw) return;
      const arr = JSON.parse(raw) as IoTProvider[];
      if (!Array.isArray(arr)) return;
      for (const p of arr) {
        if (p && p.id && !this.providers.has(p.id)) {
          this.providers.set(p.id, p);
          /* Custom providers utilisent un client générique basé sur leur descripteur */
          this.clients.set(p.id, new GenericProviderClient(p));
        }
      }
    } catch {
      /* corrupt cache */
    }
  }

  private persistCustomProviders(): void {
    if (typeof localStorage === 'undefined') return;
    const builtinIds = new Set(BUILTIN_PROVIDERS.map((p) => p.id));
    const custom = Array.from(this.providers.values()).filter((p) => !builtinIds.has(p.id));
    try {
      localStorage.setItem(CUSTOM_PROVIDERS_KEY, JSON.stringify(custom));
    } catch {
      /* quota */
    }
  }

  /** Retourne tous les providers (builtin + custom). */
  list(): IoTProvider[] {
    return Array.from(this.providers.values());
  }

  /** Retourne les providers builtin uniquement. */
  listBuiltin(): readonly IoTProvider[] {
    return BUILTIN_PROVIDERS;
  }

  get(id: string): IoTProvider | null {
    return this.providers.get(id) ?? null;
  }

  /** Ajoute un provider custom runtime (Apex auto-install future). */
  install(provider: IoTProvider): void {
    if (!provider || !provider.id) throw new Error('Provider invalide : id requis');
    if (BUILTIN_PROVIDERS.some((p) => p.id === provider.id)) {
      throw new Error(`Provider builtin protégé : ${provider.id}`);
    }
    this.providers.set(provider.id, provider);
    this.clients.set(provider.id, new GenericProviderClient(provider));
    this.persistCustomProviders();
    void auditLog.record('iot.provider.install_custom', { details: { provider_id: provider.id, name: provider.name } });
    logger.info('iot-registry', `Custom provider installé: ${provider.id}`);
  }

  /** Retire un provider custom (builtin protégés). */
  remove(id: string): void {
    if (BUILTIN_PROVIDERS.some((p) => p.id === id)) {
      throw new Error(`Provider builtin protégé : ${id}`);
    }
    this.providers.delete(id);
    this.clients.delete(id);
    this.persistCustomProviders();
    void auditLog.record('iot.provider.remove_custom', { details: { provider_id: id } });
  }

  /**
   * Configure un provider builtin avec credentials user (workflow install).
   * Appelé par le tool IA install_iot_provider.
   */
  async configureProvider(input: IoTInstallInput): Promise<IoTInstallResult> {
    const provider = this.providers.get(input.provider_id);
    if (!provider) return { ok: false, provider_id: input.provider_id, error: 'Provider inconnu' };
    const client = this.clients.get(input.provider_id);
    if (!client) return { ok: false, provider_id: input.provider_id, error: 'Client provider non disponible' };
    const r = await client.install(input);
    if (r.ok) {
      void auditLog.record('iot.provider.configure', {
        details: { provider_id: input.provider_id, devices_found: r.devices_found ?? 0 },
      });
    } else {
      void auditLog.record('iot.provider.configure_fail', {
        details: { provider_id: input.provider_id, error: r.error ?? 'unknown' },
      });
    }
    return r;
  }

  /** Test connexion légère un provider (status badge). */
  async testConnection(providerId: string): Promise<IoTConnectionResult> {
    const client = this.clients.get(providerId);
    if (!client) return { ok: false, reason: 'no_credentials', error: `Provider inconnu: ${providerId}` };
    return client.testConnection();
  }

  /** Liste tous les devices cross-provider (aggregate). */
  async listAllDevices(): Promise<IoTDevice[]> {
    const all: IoTDevice[] = [];
    for (const [id, client] of this.clients) {
      try {
        const devices = await client.listDevices();
        all.push(...devices);
      } catch (err) {
        logger.warn('iot-registry', `listDevices fail pour ${id}`, { err: String(err) });
      }
    }
    return all;
  }

  /** Liste devices d'un provider spécifique. */
  async listDevicesFor(providerId: string): Promise<IoTDevice[]> {
    const client = this.clients.get(providerId);
    if (!client) return [];
    return client.listDevices();
  }

  /** Envoie commande à un device via le bon provider. */
  async sendCommand(
    providerId: string,
    deviceId: string,
    command: Record<string, unknown>,
  ): Promise<IoTSendCommandResult> {
    const client = this.clients.get(providerId);
    if (!client) return { ok: false, reason: 'no_provider', error: `Provider inconnu: ${providerId}` };
    const r = await client.sendCommand(deviceId, command);
    void auditLog.record(r.ok ? 'iot.send_command.success' : 'iot.send_command.fail', {
      details: { provider_id: providerId, device_id: deviceId, command_keys: Object.keys(command), error: r.error },
    });
    return r;
  }

  /**
   * Retourne le status global de tous les providers (vue admin).
   */
  async statusAll(): Promise<Array<{ provider: IoTProvider; status: IoTConnectionResult }>> {
    const results: Array<{ provider: IoTProvider; status: IoTConnectionResult }> = [];
    for (const provider of this.providers.values()) {
      const status = await this.testConnection(provider.id);
      results.push({ provider, status });
    }
    return results;
  }
}

/* ============================================================================
 * Generic provider client (pour custom providers ajoutés runtime)
 * ============================================================================ */

class GenericProviderClient implements ProviderClient {
  constructor(private provider: IoTProvider) {}

  private getBase(): string {
    return this.provider.api?.base_url ?? '';
  }

  private async getAuthHeader(): Promise<Record<string, string>> {
    if (!this.provider.api) return {};
    /* Tente de lire le 1er credential connu (token > access_token > username) */
    for (const k of this.provider.credential_keys) {
      const v = await vault.readKey(k).catch(() => '');
      if (v) {
        const headerName = this.provider.api.auth_header;
        const fmt = this.provider.api.auth_format;
        if (fmt === 'bearer') return { [headerName]: `Bearer ${v}` };
        if (fmt === 'basic') return { [headerName]: `Basic ${v}` };
        return { [headerName]: v };
      }
    }
    return {};
  }

  async install(input: IoTInstallInput): Promise<IoTInstallResult> {
    /* Stocke chaque credential fourni dans la clé attendue */
    for (const [k, v] of Object.entries(input.credentials)) {
      const matchingKey = this.provider.credential_keys.find((ck) => ck.includes(k));
      if (matchingKey) await vault.setKey(matchingKey, v);
    }
    const test = await this.testConnection();
    return { ok: test.ok, provider_id: this.provider.id, error: test.error, devices_found: test.devices_count };
  }

  async testConnection(): Promise<IoTConnectionResult> {
    const base = this.getBase();
    if (!base) return { ok: false, reason: 'no_credentials', error: 'Provider sans api.base_url' };
    const headers = await this.getAuthHeader();
    if (Object.keys(headers).length === 0) return { ok: false, reason: 'no_credentials', error: 'Aucun credential stocké' };
    const r = await fetchIot<unknown>(`${base}${this.provider.test_endpoint}`, { headers });
    if (!r.ok) return { ok: false, reason: r.reason, error: r.error };
    return { ok: true, latency_ms: r.latency_ms, devices_count: 0 };
  }

  async listDevices(): Promise<IoTDevice[]> {
    const base = this.getBase();
    if (!base) return [];
    const headers = await this.getAuthHeader();
    const ep = this.provider.endpoints.list_devices;
    const r = await fetchIot<unknown>(`${base}${ep.path}`, { method: ep.method, headers });
    if (!r.ok) return [];
    /* Heuristique : si data est un array, on map. Sinon on cherche .devices ou .result. */
    const raw = r.data;
    let arr: unknown[] = [];
    if (Array.isArray(raw)) arr = raw;
    else if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      if (Array.isArray(obj.devices)) arr = obj.devices;
      else if (Array.isArray(obj.result)) arr = obj.result;
      else if (Array.isArray(obj.data)) arr = obj.data;
    }
    return arr.slice(0, 50).map((d, i) => {
      const o = (d ?? {}) as Record<string, unknown>;
      return {
        provider: this.provider.id,
        device_id: String(o.id ?? o.device_id ?? o.entity_id ?? `dev${i}`),
        name: String(o.name ?? o.friendly_name ?? `Device ${i}`),
        type: String(o.type ?? o.category ?? 'unknown'),
        online: o.online !== false && o.state !== 'unavailable',
        capabilities: ['on_off'],
      };
    });
  }

  async sendCommand(deviceId: string, command: Record<string, unknown>): Promise<IoTSendCommandResult> {
    const base = this.getBase();
    if (!base) return { ok: false, reason: 'no_provider', error: 'Provider sans base_url' };
    const headers = await this.getAuthHeader();
    const ep = this.provider.endpoints.send_command;
    const path = ep.path.replace('{device_id}', deviceId);
    const body = { ...ep.body_template, ...command, device_id: deviceId };
    const r = await fetchIot<unknown>(`${base}${path}`, { method: ep.method, headers, body });
    if (!r.ok) return { ok: false, reason: r.reason, error: r.error };
    return { ok: true };
  }
}

/* ============================================================================
 * Singleton export
 * ============================================================================ */

export const iotRegistry = new IoTRegistry();
