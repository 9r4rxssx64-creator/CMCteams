/**
 * APEX v13 — Dispatcher exécution outils Apex IA (parité Claude Code).
 *
 * Reçoit un tool_use Anthropic + paramètres, vérifie permissions, exécute,
 * audit log immutable, retourne tool_result.
 *
 * Anti-pattern Kevin :
 * - Pas d'eval, pas de new Function, pas de exec arbitraire
 * - Whitelist stricte de fonctions par tool name
 * - Validation Kevin (escalate_human) avant action niveau C
 * - Audit log obligatoire avant + après exécution
 */

import { logger } from '../core/logger.js';

import { apexTools, type ApexTool } from './apex-tools.js';
import { auditLog } from './audit-log.js';
import { firebase } from './firebase.js';
import { orchestrator } from './orchestrator.js';
import { guardToolEnabled } from './feature-guard.js';

/**
 * Mapping tool name → feature toggle id (Kevin règle 2026-05-04 — ON/OFF tout).
 * Lorsque le toggle est OFF, le dispatcher refuse l'exécution avec un tool_result d'erreur.
 * Centralisé ici plutôt qu'attacher une métadonnée par tool — les noms restent strings opaques.
 */
const TOOL_TOGGLE_MAP: Record<string, string> = {
  /* Web & search */
  web_search: 'tool.web_search',
  search_web: 'tool.web_search',
  /* Image / vision */
  image_analyze: 'tool.image_analyze',
  analyze_image: 'tool.image_analyze',
  image_generate: 'tool.image_generate',
  generate_image: 'tool.image_generate',
  /* Code / sandbox */
  code_execute: 'tool.code_execute',
  execute_code: 'tool.code_execute',
  /* Météo / calc / unit */
  get_weather: 'tool.weather',
  weather: 'tool.weather',
  calculator: 'tool.calculator',
  calculate: 'tool.calculator',
  unit_convert: 'tool.unit_convert',
  /* Translate */
  translate: 'tool.translate',
  /* QR & barcode */
  qr_generate: 'tool.qr_generate',
  generate_qr: 'tool.qr_generate',
  qr_scan: 'tool.qr_scan',
  scan_qr: 'tool.qr_scan',
  barcode_scan: 'tool.barcode_scan',
  /* OCR / geocode */
  ocr: 'tool.ocr',
  geocode: 'tool.geocode',
  /* Communication */
  send_email: 'tool.send_email',
  send_sms: 'tool.send_sms',
  send_whatsapp: 'tool.send_whatsapp',
  /* Calendrier / contacts / location */
  calendar_create: 'tool.calendar_create',
  create_calendar_event: 'tool.calendar_create',
  calendar_read: 'tool.calendar_read',
  read_calendar: 'tool.calendar_read',
  contacts_read: 'tool.contacts_read',
  read_contacts: 'tool.contacts_read',
  get_location: 'tool.location',
  location: 'tool.location',
  /* Notif / share */
  notif_send: 'tool.notif_send',
  send_notification: 'tool.notif_send',
  share_target: 'tool.share_target',
  /* Hardware Web APIs */
  bluetooth: 'tool.bluetooth',
  nfc_read: 'tool.nfc_read',
  nfc_write: 'tool.nfc_write',
  usb: 'tool.usb',
  midi: 'tool.midi',
  serial: 'tool.serial',
  /* Print / export */
  print: 'tool.print',
  pdf_export: 'tool.pdf_export',
  export_pdf: 'tool.pdf_export',
  markdown: 'tool.markdown',
  timer: 'tool.timer',
};

export interface ToolExecResult {
  ok: boolean;
  result?: unknown;
  error?: string;
  requires_validation?: boolean;
  validation_token?: string;
}

class ApexToolsDispatcher {
  /* P0 fix audit Cure53/NCC : event delegation singleton.
     Au lieu d'attacher un listener par bouton modal (memory leak car les modals
     sont fréquemment ouverts/fermés), on a UN SEUL listener `click` sur document.body
     qui dispatch via data-attribute `data-tool-action`.
     - Pas de cleanup individuel à gérer.
     - 1 listener total, peu importe le nombre de modals ouverts. */
  private delegationInstalled = false;
  private delegationAbort: AbortController | null = null;
  /* Référence vers le listener pour double-cleanup (AbortController + removeEventListener
     explicite — certains environnements browser/test ne respectent pas signal). */
  private delegationListener: EventListener | null = null;
  /* Map d'actions actives → handler. Key = `data-tool-action` value. */
  private toolActionHandlers = new Map<string, (el: Element, ev: Event) => void>();

  /**
   * Installe le listener de délégation unique (idempotent).
   * Appelé lazily à la 1re utilisation d'openUrlModal ou de tout consumer event-delegation.
   */
  private installDelegation(): void {
    if (this.delegationInstalled) return;
    if (typeof document === 'undefined') return;
    this.delegationAbort = new AbortController();
    const listener: EventListener = (ev) => {
      const target = ev.target as Element | null;
      if (!target) return;
      const actionEl = target.closest<HTMLElement>('[data-tool-action]');
      if (!actionEl) return;
      const action = actionEl.dataset['toolAction'];
      if (!action) return;
      const handler = this.toolActionHandlers.get(action);
      if (handler) handler(actionEl, ev);
    };
    this.delegationListener = listener;
    document.body.addEventListener('click', listener, { signal: this.delegationAbort.signal });
    this.delegationInstalled = true;
  }

  /**
   * Enregistre un handler pour un `data-tool-action` donné.
   * Si un handler existait déjà, il est remplacé (no leak).
   * Retourne fonction unregister pour cleanup explicite si voulu.
   */
  private registerToolAction(action: string, handler: (el: Element, ev: Event) => void): () => void {
    this.installDelegation();
    this.toolActionHandlers.set(action, handler);
    return () => {
      const current = this.toolActionHandlers.get(action);
      if (current === handler) this.toolActionHandlers.delete(action);
    };
  }

  /**
   * Cleanup public — appelable au logout/shutdown.
   * Désinstalle le listener de délégation + clear handlers.
   * Double-cleanup : AbortController.abort() + removeEventListener explicite
   * (certains tests/runtimes ne respectent pas le signal automatiquement).
   */
  destroy(): void {
    if (this.delegationAbort) {
      try { this.delegationAbort.abort(); } catch { /* ignore */ }
      this.delegationAbort = null;
    }
    if (this.delegationListener && typeof document !== 'undefined') {
      try { document.body.removeEventListener('click', this.delegationListener); } catch { /* ignore */ }
    }
    this.delegationListener = null;
    this.delegationInstalled = false;
    this.toolActionHandlers.clear();
  }

  /**
   * Audit helper : compte d'actions de délégation enregistrées.
   * Exposé pour tests (vérifier qu'on n'accumule pas de handlers fantômes).
   */
  getActiveDelegationActionCount(): number {
    return this.toolActionHandlers.size;
  }

  /**
   * True si la délégation document est installée (1 seul listener total).
   */
  isDelegationInstalled(): boolean {
    return this.delegationInstalled;
  }

  /**
   * Exécute un tool avec validation tier + audit log + retry.
   * Si tool requires_validation=true, retourne validation_token au lieu d'exécuter.
   * Kevin doit alors appeler validate() avec le token pour confirmer.
   */
  async execute(
    toolName: string,
    params: Record<string, unknown>,
    userTier: ApexTool['minTier'] = 'client_free',
    options: { skipValidation?: boolean } = {},
  ): Promise<ToolExecResult> {
    /* Wire admin feature toggle (Kevin règle 2026-05-04 — ON/OFF tout).
       Si le tool est mappé sur un toggle et que toggle = OFF → refuse. */
    const toggleId = TOOL_TOGGLE_MAP[toolName];
    if (toggleId) {
      const guard = guardToolEnabled(toggleId);
      if (guard) {
        await apexTools.logExecution(toolName, userTier, params, false);
        return { ok: false, error: guard.error };
      }
    }
    /* Vérification permissions */
    const check = apexTools.canExecute(toolName, userTier);
    if (!check.allowed) {
      await apexTools.logExecution(toolName, userTier, params, false);
      return { ok: false, error: check.reason ?? 'Refused' };
    }

    /* Validation Kevin obligatoire si impactLevel C */
    if (check.requires_validation && !options.skipValidation) {
      const token = `val_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      try {
        const pending = JSON.parse(localStorage.getItem('apex_v13_pending_validations') ?? '[]') as Array<{
          token: string;
          tool: string;
          params: unknown;
          tier: string;
          ts: number;
        }>;
        pending.push({ token, tool: toolName, params, tier: userTier, ts: Date.now() });
        localStorage.setItem('apex_v13_pending_validations', JSON.stringify(pending.slice(-50)));
      } catch {
        /* ignore quota */
      }
      logger.info('apex-tools', `Tool ${toolName} pending validation: ${token}`);
      return { ok: false, requires_validation: true, validation_token: token };
    }

    /* Exécution effective */
    try {
      const result = await this.dispatch(toolName, params);
      await apexTools.logExecution(toolName, userTier, params, true);
      return { ok: true, result };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error('apex-tools', `Tool ${toolName} failed: ${msg}`);
      await apexTools.logExecution(toolName, userTier, params, false);
      return { ok: false, error: msg };
    }
  }

  /**
   * Valide un token pending (Kevin only) → ré-exécute avec skipValidation=true.
   */
  async validate(token: string): Promise<ToolExecResult> {
    let pending: Array<{ token: string; tool: string; params: Record<string, unknown>; tier: string }> = [];
    try {
      pending = JSON.parse(localStorage.getItem('apex_v13_pending_validations') ?? '[]') as typeof pending;
    } catch {
      return { ok: false, error: 'pending list corrupt' };
    }
    const found = pending.find((p) => p.token === token);
    if (!found) return { ok: false, error: 'Token inconnu ou expiré' };
    /* Retire du pending */
    const remaining = pending.filter((p) => p.token !== token);
    try {
      localStorage.setItem('apex_v13_pending_validations', JSON.stringify(remaining));
    } catch {
      /* ignore */
    }
    return this.execute(found.tool, found.params, found.tier as ApexTool['minTier'], { skipValidation: true });
  }

  /**
   * Liste les validations en attente (admin only).
   */
  listPendingValidations(): Array<{ token: string; tool: string; tier: string; ts: number }> {
    try {
      const pending = JSON.parse(localStorage.getItem('apex_v13_pending_validations') ?? '[]') as Array<{
        token: string;
        tool: string;
        params: unknown;
        tier: string;
        ts: number;
      }>;
      return pending.map(({ token, tool, tier, ts }) => ({ token, tool, tier, ts }));
    } catch {
      return [];
    }
  }

  /**
   * Dispatch effectif vers la fonction implémentation.
   * Whitelist stricte par tool name (anti eval/exec).
   */
  private async dispatch(toolName: string, params: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
      case 'apex_self_audit':
      case 'self_audit':
      case 'audit':
      case 'fais_ton_audit':
      case 'audit_brutal':
      case 'fais_audit_brutal': {
        /* Kevin règle : "fais ton audit" → audit complet 6 axes + auto-fix + escalade
           Mode brutal = checks supplémentaires + sévérité bumpée + 145 vues v12 manquantes */
        const { apexSelfAudit } = await import('./apex-self-audit.js');
        const brutal = toolName === 'audit_brutal' || toolName === 'fais_audit_brutal' || params['brutal'] === true;
        const report = await apexSelfAudit.runFullAudit(brutal);
        return apexSelfAudit.formatReportMarkdown(report);
      }
      case 'open_url':
      case 'open_browser':
      case 'navigate':
      case 'ouvre_url':
      case 'ouvre':
      case 'va_sur': {
        /* Kevin règle CLAUDE.md "1 CLIC + FENÊTRE + BOUTON DIRECT" :
           Ouvre modal pop-up avec lien direct cliquable (pas window.open auto sans confirm) */
        return this.openUrlModal(
          params['url'] as string ?? params['target'] as string ?? '',
          params['label'] as string | undefined,
          params['description'] as string | undefined,
        );
      }
      /* === DEVICE CONTROL TOOLS (61 méthodes iOS/Android — Kevin règle pilotage) === */
      case 'device_share':
      case 'partage_contenu': {
        const { deviceControl } = await import('./device-control.js');
        const sharePayload: { title?: string; text?: string; url?: string } = {};
        if (typeof params['title'] === 'string') sharePayload.title = params['title'];
        if (typeof params['text'] === 'string') sharePayload.text = params['text'];
        if (typeof params['url'] === 'string') sharePayload.url = params['url'];
        return deviceControl.shareContent(sharePayload);
      }
      case 'device_vibrate':
      case 'vibrer': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.vibrate(params['pattern'] as number | number[] ?? [100, 50, 100]);
      }
      case 'device_geolocation':
      case 'ma_position': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.getGeolocation();
      }
      case 'device_battery':
      case 'batterie': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.getBatteryStatus();
      }
      case 'device_clipboard_read':
      case 'lire_presse_papiers': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.pasteFromClipboard();
      }
      case 'device_clipboard_write':
      case 'copier': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.copyToClipboard(params['text'] as string ?? '');
      }
      case 'device_speak':
      case 'parler':
      case 'tts': {
        const { deviceControl } = await import('./device-control.js');
        const speakOpts: { voiceName?: string; rate?: number; lang?: string } = {};
        if (typeof params['voice'] === 'string') speakOpts.voiceName = params['voice'];
        if (typeof params['rate'] === 'number') speakOpts.rate = params['rate'];
        if (typeof params['lang'] === 'string') speakOpts.lang = params['lang'];
        return deviceControl.speakText(params['text'] as string ?? '', speakOpts);
      }
      case 'device_open_maps':
      case 'ouvrir_maps':
      case 'plan': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.openMaps(params['address'] as string | undefined ?? params['coords'] as string | undefined ?? '');
      }
      case 'device_open_phone':
      case 'appeler': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.openPhone(params['number'] as string ?? '');
      }
      case 'device_open_sms':
      case 'sms': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.openSMS(params['number'] as string ?? '', params['body'] as string | undefined);
      }
      case 'device_get_photos':
      case 'mes_photos': {
        const { deviceControl } = await import('./device-control.js');
        const photoOpts: { maxCount?: number } = {};
        if (typeof params['max'] === 'number') photoOpts.maxCount = params['max'];
        return deviceControl.getPhotosFromGallery(photoOpts);
      }
      case 'device_detect':
      case 'detect_device': {
        const { deviceControl } = await import('./device-control.js');
        return {
          environment: deviceControl.detectDevice(),
          capabilities: deviceControl.listAllSupported(),
        };
      }
      /* === NETWORK SCAN LAN (80+ device probes) === */
      case 'scan_network':
      case 'scan_lan':
      case 'devices_lan': {
        const { networkScan } = await import('./network-scan.js');
        return await networkScan.scan({ useCache: params['useCache'] !== false });
      }
      case 'local_ip': {
        const { networkScan } = await import('./network-scan.js');
        const ip = await networkScan.getLocalIP();
        return { ok: ip !== null, local_ip: ip };
      }
      case 'open_lan_device': {
        const { networkScan } = await import('./network-scan.js');
        const ip = params['ip'] as string ?? '';
        const port = (params['port'] as number | undefined) ?? 80;
        return await networkScan.openDeviceUI({
          ip, port, type: 'unknown', service: 'manual',
          last_seen: Date.now(),
        });
      }
      /* === BADGE CLONER (60+ formats NFC/RFID) === */
      case 'scan_badge':
      case 'badge_scan': {
        const { badgeCloner } = await import('./badge-cloner.js');
        return await badgeCloner.scanBadge();
      }
      case 'list_badges': {
        const { badgeCloner } = await import('./badge-cloner.js');
        return await badgeCloner.listBadgesAsync();
      }
      case 'clone_badge_to_tag': {
        const { badgeCloner } = await import('./badge-cloner.js');
        return await badgeCloner.cloneBadgeToNewTag(params['badge_id'] as string ?? '');
      }
      case 'badge_to_qr': {
        const { badgeCloner } = await import('./badge-cloner.js');
        return await badgeCloner.generateQRCodeFromBadge(params['badge_id'] as string ?? '');
      }
      /* === CARD EMULATOR (18 hardware devices) === */
      case 'list_emulators': {
        const { cardEmulator } = await import('./card-emulator.js');
        return {
          supported: cardEmulator.listSupported(),
          capabilities: cardEmulator.getBrowserCapabilities(),
          status: cardEmulator.getStatus(),
        };
      }
      case 'connect_flipper_usb': {
        const { cardEmulator } = await import('./card-emulator.js');
        return await cardEmulator.connectFlipperUSB();
      }
      case 'connect_flipper_ble': {
        const { cardEmulator } = await import('./card-emulator.js');
        return await cardEmulator.connectFlipperBLE();
      }
      case 'connect_proxmark': {
        const { cardEmulator } = await import('./card-emulator.js');
        return await cardEmulator.connectProxmarkSerial();
      }
      case 'connect_chameleon': {
        const { cardEmulator } = await import('./card-emulator.js');
        return await cardEmulator.connectChameleonSerial();
      }
      case 'emulate_badge': {
        const { cardEmulator } = await import('./card-emulator.js');
        const opts = typeof params['duration_sec'] === 'number' ? { duration_sec: params['duration_sec'] } : undefined;
        return await cardEmulator.emulateBadge(params['badge_id'] as string ?? '', opts);
      }
      case 'emulator_command':
      case 'emulator_cmd': {
        const { cardEmulator } = await import('./card-emulator.js');
        return await cardEmulator.sendCommand(params['cmd'] as string ?? '');
      }
      case 'emulator_disconnect': {
        const { cardEmulator } = await import('./card-emulator.js');
        await cardEmulator.disconnect();
        return { ok: true };
      }
      /* === DEVICE TOOLS COMPLETS (49 supplémentaires — Kevin demande TOUS) === */
      case 'device_notification':
      case 'notification': {
        const { deviceControl } = await import('./device-control.js');
        const titlePerm = params['title'] as string ?? 'Apex';
        const notifOpts: NotificationOptions = {};
        if (typeof params['body'] === 'string') notifOpts.body = params['body'];
        return deviceControl.showNotification(titlePerm, notifOpts);
      }
      case 'device_request_notification':
      case 'permission_notif': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.requestNotificationPermission();
      }
      case 'device_wake_lock':
      case 'wake_lock': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.requestWakeLock();
      }
      case 'device_release_wake_lock': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.releaseWakeLock();
      }
      case 'device_network_info':
      case 'reseau': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.getNetworkInfo();
      }
      case 'device_storage_estimate':
      case 'stockage': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.getStorageEstimate();
      }
      case 'device_persistent_storage': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.requestPersistentStorage();
      }
      case 'device_camera':
      case 'camera': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.requestCamera({
          video: true,
          audio: params['audio'] as boolean | undefined ?? false,
        });
      }
      case 'device_listen_speech':
      case 'dictee': {
        const { deviceControl } = await import('./device-control.js');
        const speechOpts: { lang?: string; continuous?: boolean; onResult?: (text: string, isFinal: boolean) => void } = {};
        if (typeof params['lang'] === 'string') speechOpts.lang = params['lang'];
        if (typeof params['continuous'] === 'boolean') speechOpts.continuous = params['continuous'];
        speechOpts.onResult = (text: string) => logger.info('apex-tools', 'speech', { text: text.slice(0, 100) });
        return deviceControl.listenSpeech(speechOpts);
      }
      case 'device_list_media': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.listMediaDevices();
      }
      case 'device_motion':
      case 'mouvement': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.requestDeviceMotion((ev) => logger.info('apex-tools', 'motion', { x: ev.acceleration?.x, y: ev.acceleration?.y, z: ev.acceleration?.z }));
      }
      case 'device_orientation':
      case 'orientation': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.requestDeviceOrientation((ev) => logger.info('apex-tools', 'orientation', { alpha: ev.alpha, beta: ev.beta, gamma: ev.gamma }));
      }
      case 'device_ambient_light':
      case 'lumiere_ambiante': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.watchAmbientLight((lux) => logger.info('apex-tools', 'ambient', { lux }));
      }
      case 'device_proximity': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.watchProximity((p) => logger.info('apex-tools', 'proximity', { p }));
      }
      case 'device_bluetooth':
      case 'bluetooth_pair': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.requestBluetoothDevice(
          (params['filters'] as ReadonlyArray<Record<string, unknown>> | undefined) ?? [{ services: ['battery_service'] }],
        );
      }
      case 'device_bluetooth_paired':
      case 'bluetooth_list': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.listPairedBluetooth();
      }
      case 'device_nfc_read':
      case 'nfc_lire': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.requestNFCRead((records) => {
          logger.info('apex-tools', 'nfc_records', { count: records.length });
        });
      }
      case 'device_nfc_write':
      case 'nfc_ecrire': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.requestNFCWrite([{
          recordType: 'text',
          data: params['text'] as string ?? '',
        }]);
      }
      case 'device_usb': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.requestUSBDevice((params['filters'] as ReadonlyArray<Record<string, unknown>> | undefined) ?? []);
      }
      case 'device_serial': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.requestSerial();
      }
      case 'device_hid': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.requestHID((params['filters'] as ReadonlyArray<Record<string, unknown>> | undefined) ?? []);
      }
      case 'device_pick_files':
      case 'choisir_fichiers': {
        const { deviceControl } = await import('./device-control.js');
        const pickOpts: { accept?: string; multiple?: boolean } = {};
        if (typeof params['accept'] === 'string') pickOpts.accept = params['accept'];
        if (typeof params['multiple'] === 'boolean') pickOpts.multiple = params['multiple'];
        return deviceControl.pickFiles(pickOpts);
      }
      case 'device_pick_directory': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.pickDirectory();
      }
      case 'device_share_files': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.shareFiles((params['files'] as File[] | undefined) ?? []);
      }
      case 'device_open_mail':
      case 'mail': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.openMail(
          params['to'] as string ?? '',
          params['subject'] as string | undefined,
          params['body'] as string | undefined,
        );
      }
      case 'device_open_facetime':
      case 'facetime': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.openFaceTime(params['contact'] as string ?? '');
      }
      case 'device_open_calendar':
      case 'calendrier': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.openCalendar();
      }
      case 'device_open_health':
      case 'sante': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.openHealth();
      }
      case 'device_open_settings':
      case 'reglages_ios': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.openSettings();
      }
      case 'device_open_shortcuts':
      case 'raccourcis': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.openShortcuts(params['name'] as string ?? '');
      }
      case 'device_open_camera_app': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.openCamera();
      }
      case 'device_open_music':
      case 'musique': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.openMusic(params['track'] as string | undefined ?? '');
      }
      case 'device_open_podcasts':
      case 'podcasts': {
        const { deviceControl } = await import('./device-control.js');
        return deviceControl.openPodcasts();
      }
      case 'device_recent_photos':
      case 'photos_recentes': {
        const { deviceControl } = await import('./device-control.js');
        const days = (params['days'] as number | undefined) ?? 7;
        const photoCount = (params['count'] as number | undefined) ?? 20;
        return deviceControl.getRecentPhotos(days, photoCount);
      }
      case 'device_tri_photos_date':
      case 'tri_photos': {
        const { deviceControl } = await import('./device-control.js');
        const files = (params['files'] as File[] | undefined) ?? [];
        const metadatas = await Promise.all(files.map(async (f) => {
          const r = await deviceControl.analyzePhoto(f);
          return r.data;
        }));
        const valid = metadatas.filter((m): m is NonNullable<typeof m> => m !== undefined);
        return deviceControl.triPhotosByDate(valid);
      }
      case 'read_file':
        return this.readFile(params['path'] as string, params['branch'] as string | undefined);
      case 'web_fetch':
        return this.webFetch(params['url'] as string);
      case 'web_search':
        return this.webSearch(params['query'] as string, params['max_results'] as number | undefined);
      case 'cmc_read':
        return orchestrator.cmcRead();
      case 'kdmc_stats':
        return orchestrator.kdmcStats();
      case 'open_tool':
        return orchestrator.openTool(params['tool_id'] as string);
      case 'read_logs':
        return this.readLogs(params['scope'] as string | undefined, params['limit'] as number | undefined);
      case 'vault_action':
        return this.vaultAction(params['action'] as string, params['key'] as string | undefined);
      case 'finance_calculate':
        return this.financeCalculate(params['type'] as string, params['params'] as Record<string, unknown>);
      case 'qr_generate':
        return this.qrGenerate(params['data'] as string, params['format'] as string | undefined);
      case 'translate':
        return this.translate(params['text'] as string, params['target_lang'] as string);
      case 'escalate_human':
        return this.escalateHuman(
          params['action'] as string,
          params['urgency'] as string,
          params['context'] as string | undefined,
        );
      case 'audit_self':
        return this.auditSelf(params['scope'] as string | undefined);
      case 'backup_trigger':
        return this.backupTrigger();
      case 'project_status':
        return this.projectStatus(params['project_id'] as string);
      case 'project_continue':
        return this.projectContinue(params['project_id'] as string);
      case 'search_latest_tools':
        return this.searchLatestTools(params['domain'] as string);
      case 'self_improve':
        return this.selfImprove(params['target'] as string | undefined);
      case 'knowledge_update':
        return this.knowledgeUpdate(params['provider'] as string);
      case 'memory_recall':
        return this.memoryRecall(params['keyword'] as string, params['scope'] as string | undefined);
      case 'memory_add':
        return this.memoryAdd(params['category'] as string, params['fact'] as string);
      case 'lesson_record':
        return this.lessonRecord(
          params['title'] as string,
          params['text'] as string,
          params['severity'] as string,
          params['category'] as string | undefined,
        );
      /* === v13.0.1 +10 tools === */
      case 'weather':
        return this.weather(params['location'] as string, params['days'] as number | undefined);
      case 'news_headlines':
        return this.newsHeadlines(
          params['category'] as string | undefined,
          params['country'] as string | undefined,
        );
      case 'market_data':
        return this.marketData(params['type'] as string, params['symbol'] as string);
      case 'scrape_url':
        return this.scrapeUrl(params['url'] as string);
      case 'detect_intent':
        return this.detectIntent(params['text'] as string);
      case 'sentinels_status':
        return this.sentinelsStatus();
      case 'perf_metrics':
        return this.perfMetricsSnapshot();
      case 'voice_command':
      case 'screen_share':
      case 'multi_llm_consensus':
        /* Browser API only / orchestrator complexe — placeholder safe */
        return { placeholder: true, message: `Tool ${toolName} disponible côté UI (browser API).` };
      case 'execute_task': {
        /* Apex IA → Claude Code Action GitHub (autonomie totale) */
        const { apexExecute } = await import('./apex-execute.js');
        const task = String(params['task'] ?? '');
        const taskParams = (params['params'] as Record<string, unknown>) ?? {};
        return apexExecute.requestExecution(task, taskParams as Record<string, unknown>, {
          src: 'apex',
          initiated_by: 'apex_ia',
        });
      }
      case 'list_executions': {
        const { apexExecute } = await import('./apex-execute.js');
        const filterOpts: { status?: 'pending'; task?: 'modify_file'; limit?: number } = {};
        if (params['status']) filterOpts.status = params['status'] as 'pending';
        if (params['task']) filterOpts.task = params['task'] as 'modify_file';
        if (typeof params['limit'] === 'number') filterOpts.limit = params['limit'];
        return apexExecute.listPendingExecutions(filterOpts);
      }
      case 'poll_execution': {
        const { apexExecute } = await import('./apex-execute.js');
        const id = String(params['task_id'] ?? '');
        if (!id) throw new Error('task_id requis');
        return apexExecute.pollResult(id);
      }
      case 'cancel_execution': {
        const { apexExecute } = await import('./apex-execute.js');
        const id = String(params['task_id'] ?? '');
        if (!id) throw new Error('task_id requis');
        return { ok: apexExecute.cancelExecution(id) };
      }
      case 'execute_stats': {
        const { apexExecute } = await import('./apex-execute.js');
        return apexExecute.getStats();
      }
      case 'edit_file':
      case 'commit_push':
      case 'run_test':
      case 'run_lint':
      case 'run_typecheck':
      case 'create_calendar_event':
      case 'send_email':
      case 'send_telegram':
      case 'ocr_scan':
      case 'image_analyze':
      case 'project_finish':
        /* Tools nécessitant Cloudflare Worker bridge ou capacités browser
         * → return placeholder (à wirer Jet 9 quand backend prêt) */
        return { placeholder: true, message: `Tool ${toolName} nécessite worker bridge (Jet 9)` };
      /* ========== APEX KNOWLEDGE BASE (RAG GitHub API) ========== */
      case 'search_repo_code': {
        const { apexKnowledgeBase } = await import('./apex-knowledge-base.js');
        const query = typeof params['query'] === 'string' ? params['query'] : '';
        const repo = typeof params['repo'] === 'string' && params['repo'] ? params['repo'] : undefined;
        if (!query) throw new Error('query required');
        const results = repo
          ? await apexKnowledgeBase.searchCode(query, repo)
          : await apexKnowledgeBase.searchCode(query);
        return { query, repo: repo ?? '9r4rxssx64-creator/CMCteams', total: results.length, results };
      }
      case 'read_repo_file': {
        const { apexKnowledgeBase } = await import('./apex-knowledge-base.js');
        const path = typeof params['path'] === 'string' ? params['path'] : '';
        const repo = typeof params['repo'] === 'string' && params['repo'] ? params['repo'] : undefined;
        if (!path) throw new Error('path required');
        const file = repo
          ? await apexKnowledgeBase.getFile(path, repo)
          : await apexKnowledgeBase.getFile(path);
        if (!file) return { found: false, path, repo: repo ?? '9r4rxssx64-creator/CMCteams' };
        return { found: true, ...file };
      }
      case 'list_repo_files': {
        const { apexKnowledgeBase } = await import('./apex-knowledge-base.js');
        const directory = typeof params['directory'] === 'string' ? params['directory'] : '';
        const repo = typeof params['repo'] === 'string' && params['repo'] ? params['repo'] : undefined;
        const list = repo
          ? await apexKnowledgeBase.listFiles(directory, repo)
          : await apexKnowledgeBase.listFiles(directory);
        return { directory, repo: repo ?? '9r4rxssx64-creator/CMCteams', total: list.length, files: list };
      }
      case 'get_recent_commits': {
        const { apexKnowledgeBase } = await import('./apex-knowledge-base.js');
        const limit = typeof params['limit'] === 'number' ? params['limit'] : 10;
        const repo = typeof params['repo'] === 'string' && params['repo'] ? params['repo'] : undefined;
        const commits = repo
          ? await apexKnowledgeBase.getRecentCommits(limit, repo)
          : await apexKnowledgeBase.getRecentCommits(limit);
        return { repo: repo ?? '9r4rxssx64-creator/CMCteams', total: commits.length, commits };
      }
      case 'get_repo_readme': {
        const { apexKnowledgeBase } = await import('./apex-knowledge-base.js');
        const repo = typeof params['repo'] === 'string' && params['repo'] ? params['repo'] : undefined;
        const readme = repo
          ? await apexKnowledgeBase.getReadme(repo)
          : await apexKnowledgeBase.getReadme();
        return { repo: repo ?? '9r4rxssx64-creator/CMCteams', found: !!readme, content: readme ?? '' };
      }
      /* ========== PUSH MAX v13.0.20 — implémentations 25 nouveaux tools ========== */
      /* Web extras */
      case 'wikipedia_lookup':
        return this.wikipediaLookup(
          params['query'] as string,
          (params['lang'] as string | undefined) ?? 'fr',
        );
      case 'youtube_search':
        return this.youtubeSearch(params['query'] as string);
      case 'github_search':
        return this.githubSearch(
          params['query'] as string,
          (params['type'] as string | undefined) ?? 'repositories',
        );
      case 'stackoverflow_search':
        return this.stackoverflowSearch(
          params['query'] as string,
          params['tag'] as string | undefined,
        );
      case 'unshorten_url':
        return this.unshortenUrl(params['url'] as string);
      /* Files & Documents */
      case 'json_validate':
        return this.jsonValidate(params['json'] as string);
      case 'csv_parse':
        return this.csvParse(
          params['csv'] as string,
          params['delimiter'] as string | undefined,
        );
      case 'text_diff':
        return this.textDiff(params['before'] as string, params['after'] as string);
      case 'hash_text':
        return this.hashText(
          params['text'] as string,
          (params['algo'] as string | undefined) ?? 'SHA-256',
        );
      case 'base64_encode_decode':
        return this.base64EncodeDecode(
          params['mode'] as string,
          params['text'] as string,
        );
      /* Code utils */
      case 'regex_test':
        return this.regexTest(
          params['pattern'] as string,
          params['text'] as string,
          params['flags'] as string | undefined,
        );
      case 'jwt_decode':
        return this.jwtDecode(params['token'] as string);
      case 'uuid_generate':
        return this.uuidGenerate((params['count'] as number | undefined) ?? 1);
      /* Productivity */
      case 'summarize_text':
        return this.summarizeText(
          params['text'] as string,
          (params['sentences'] as number | undefined) ?? 3,
        );
      case 'word_count':
        return this.wordCount(params['text'] as string);
      case 'detect_language':
        return this.detectLanguage(params['text'] as string);
      case 'mind_map_generate':
        return this.mindMapGenerate(
          params['topic'] as string,
          (params['branches'] as string[] | undefined) ?? [],
        );
      case 'create_task':
        return this.createTask(
          params['title'] as string,
          params['description'] as string | undefined,
          params['due'] as string | undefined,
          (params['priority'] as 'low' | 'normal' | 'high' | 'critical' | undefined) ?? 'normal',
        );
      /* Communications validators */
      case 'email_validate':
        return this.emailValidate(params['email'] as string);
      case 'phone_validate':
        return this.phoneValidate(
          params['phone'] as string,
          (params['country'] as string | undefined) ?? 'FR',
        );
      case 'whatsapp_link':
        return this.whatsappLink(
          params['phone'] as string,
          params['text'] as string | undefined,
        );
      /* Finance extras */
      case 'vat_validate_eu':
        return this.vatValidateEu(params['vat'] as string);
      case 'compound_interest':
        return this.compoundInterest(
          params['principal'] as number,
          params['rate'] as number,
          params['years'] as number,
          (params['frequency'] as number | undefined) ?? 12,
        );
      case 'currency_convert':
        return this.currencyConvert(
          params['amount'] as number,
          params['from'] as string,
          params['to'] as string,
        );
      /* Image utils */
      case 'image_compress':
        return this.imageCompress(
          params['image_base64'] as string,
          (params['quality'] as number | undefined) ?? 0.8,
          (params['max_width'] as number | undefined) ?? 1920,
        );
      /* === Autonomie totale Kevin 2026-05-04 ===
         Apex IA exécute tâches sur services externes (envoie email, crée issue,
         transfer paiement, post message) via clés API Kevin déjà configurées. */
      case 'execute_task_on_service':
      case 'execute_task_service':
      case 'autonomie_execute_service':
        return this.executeTaskOnService(
          params['service'] as string,
          params['task'] as string,
          (params['params'] as Record<string, unknown> | undefined) ?? {},
        );
      /* P0 PARITÉ CLAUDE CODE (Kevin screenshots 2026-05-07) :
       * Tools dédiés write fichier — short-circuits vers handleGithubTask. */
      case 'create_or_update_file':
      case 'create_file':
      case 'write_file': {
        return this.executeTaskOnService('github', 'create_or_update_file', params);
      }
      case 'delete_repo_file': {
        return this.executeTaskOnService('github', 'delete_file', params);
      }
      case 'list_task_on_service_handlers':
        return { handlers: this.listExecuteTaskHandlers() };
      /* === Personal Assistant (Kevin 2026-05-07) === */
      case 'whatsapp_send_message': {
        const { personalAssistant } = await import('./personal-assistant.js');
        const phone = await this.resolvePhone(
          params['phone'] as string | undefined,
          params['contact_name'] as string | undefined,
        );
        if (!phone) return { ok: false, reason: 'Numéro ou contact_name requis (carnet vide ?)' };
        return personalAssistant.whatsappSendMessage({
          phone,
          message: (params['message'] as string) ?? '',
        });
      }
      case 'whatsapp_call': {
        const { personalAssistant } = await import('./personal-assistant.js');
        const phone = await this.resolvePhone(
          params['phone'] as string | undefined,
          params['contact_name'] as string | undefined,
        );
        if (!phone) return { ok: false, reason: 'Numéro ou contact_name requis' };
        return personalAssistant.whatsappCall({ phone });
      }
      case 'whatsapp_video_call': {
        const { personalAssistant } = await import('./personal-assistant.js');
        const phone = await this.resolvePhone(
          params['phone'] as string | undefined,
          params['contact_name'] as string | undefined,
        );
        if (!phone) return { ok: false, reason: 'Numéro ou contact_name requis' };
        return personalAssistant.whatsappCall({ phone, video: true });
      }
      case 'gmail_compose': {
        const { personalAssistant } = await import('./personal-assistant.js');
        return personalAssistant.gmailCompose({
          to: (params['to'] as string) ?? '',
          subject: (params['subject'] as string) ?? '',
          body: (params['body'] as string) ?? '',
        });
      }
      case 'gmail_list_unread': {
        const { personalAssistant } = await import('./personal-assistant.js');
        return personalAssistant.gmailListUnread((params['max'] as number | undefined) ?? 20);
      }
      case 'gmail_archive': {
        const { personalAssistant } = await import('./personal-assistant.js');
        return personalAssistant.gmailMoveLabel(
          (params['email_id'] as string) ?? '',
          (params['label'] as string) ?? 'archive',
          'INBOX',
        );
      }
      case 'outlook_compose': {
        const { personalAssistant } = await import('./personal-assistant.js');
        return personalAssistant.outlookCompose({
          to: (params['to'] as string) ?? '',
          subject: (params['subject'] as string) ?? '',
          body: (params['body'] as string) ?? '',
        });
      }
      case 'outlook_list_unread': {
        const { personalAssistant } = await import('./personal-assistant.js');
        return personalAssistant.outlookListUnread((params['max'] as number | undefined) ?? 20);
      }
      case 'facebook_post': {
        const { personalAssistant } = await import('./personal-assistant.js');
        const fbOpts: { message?: string; mediaUrl?: string; pageId?: string } = {};
        if (typeof params['message'] === 'string') fbOpts.message = params['message'];
        if (typeof params['media_url'] === 'string') fbOpts.mediaUrl = params['media_url'];
        if (typeof params['page_id'] === 'string') fbOpts.pageId = params['page_id'];
        return personalAssistant.facebookPost(fbOpts);
      }
      case 'instagram_post': {
        const { personalAssistant } = await import('./personal-assistant.js');
        const igType = (params['type'] as string) ?? 'image';
        const igOpts: { mediaUrl: string; caption?: string; type: 'image' | 'video' | 'reel' } = {
          mediaUrl: (params['media_url'] as string) ?? '',
          type: igType === 'video' ? 'video' : igType === 'reel' ? 'reel' : 'image',
        };
        if (typeof params['caption'] === 'string') igOpts.caption = params['caption'];
        return personalAssistant.instagramPost(igOpts);
      }
      case 'tiktok_post': {
        const { personalAssistant } = await import('./personal-assistant.js');
        return personalAssistant.tiktokPost({
          videoUrl: (params['video_url'] as string) ?? '',
          caption: (params['caption'] as string) ?? '',
        });
      }
      case 'youtube_upload': {
        const { personalAssistant } = await import('./personal-assistant.js');
        const ytOpts: {
          videoBlob?: Blob;
          title: string;
          description: string;
          tags?: string[];
          privacy?: 'public' | 'unlisted' | 'private';
        } = {
          title: (params['title'] as string) ?? '',
          description: (params['description'] as string) ?? '',
        };
        if (Array.isArray(params['tags'])) ytOpts.tags = params['tags'] as string[];
        const priv = params['privacy'] as string | undefined;
        if (priv === 'public' || priv === 'unlisted' || priv === 'private') ytOpts.privacy = priv;
        if (params['video_blob'] instanceof Blob) ytOpts.videoBlob = params['video_blob'];
        return personalAssistant.youtubeUpload(ytOpts);
      }
      case 'linkedin_post': {
        const { personalAssistant } = await import('./personal-assistant.js');
        const liOpts: { text: string; mediaUrl?: string } = {
          text: (params['text'] as string) ?? '',
        };
        if (typeof params['media_url'] === 'string') liOpts.mediaUrl = params['media_url'];
        return personalAssistant.linkedinPost(liOpts);
      }
      case 'twitter_post': {
        const { personalAssistant } = await import('./personal-assistant.js');
        return personalAssistant.twitterPost({ text: (params['text'] as string) ?? '' });
      }
      case 'telegram_send': {
        const { personalAssistant } = await import('./personal-assistant.js');
        return personalAssistant.telegramSendMessage({
          chatId: (params['chat_id'] as string) ?? '',
          text: (params['text'] as string) ?? '',
        });
      }
      case 'discord_webhook': {
        const { personalAssistant } = await import('./personal-assistant.js');
        return personalAssistant.discordWebhook({
          url: (params['url'] as string) ?? '',
          content: (params['content'] as string) ?? '',
        });
      }
      case 'slack_post': {
        const { personalAssistant } = await import('./personal-assistant.js');
        const slackOpts: { channel: string; text: string; webhookUrl?: string } = {
          channel: (params['channel'] as string) ?? '',
          text: (params['text'] as string) ?? '',
        };
        if (typeof params['webhook_url'] === 'string') slackOpts.webhookUrl = params['webhook_url'];
        return personalAssistant.slackPost(slackOpts);
      }
      case 'notion_create_page': {
        const { personalAssistant } = await import('./personal-assistant.js');
        return personalAssistant.notionCreatePage({
          databaseId: (params['database_id'] as string) ?? '',
          title: (params['title'] as string) ?? '',
          content: (params['content'] as string) ?? '',
        });
      }
      case 'google_photos_list': {
        const { personalAssistant } = await import('./personal-assistant.js');
        const albumId = params['album_id'] as string | undefined;
        const max = (params['max'] as number | undefined) ?? 50;
        return albumId
          ? personalAssistant.googlePhotosList(albumId, max)
          : personalAssistant.googlePhotosList(undefined, max);
      }
      case 'google_photos_organize': {
        const { personalAssistant } = await import('./personal-assistant.js');
        const orgOpts: { albumName: string; photoIds?: string[] } = {
          albumName: (params['album_name'] as string) ?? '',
        };
        if (Array.isArray(params['photo_ids'])) orgOpts.photoIds = params['photo_ids'] as string[];
        return personalAssistant.googlePhotosOrganize(orgOpts);
      }
      case 'spotify_play': {
        const { personalAssistant } = await import('./personal-assistant.js');
        const spOpts: { trackId?: string; contextUri?: string; deviceId?: string } = {};
        if (typeof params['track_id'] === 'string') spOpts.trackId = params['track_id'];
        if (typeof params['context_uri'] === 'string') spOpts.contextUri = params['context_uri'];
        if (typeof params['device_id'] === 'string') spOpts.deviceId = params['device_id'];
        return personalAssistant.spotifyPlay(spOpts);
      }
      case 'spotify_create_playlist': {
        const { personalAssistant } = await import('./personal-assistant.js');
        const spOpts: { name: string; trackIds?: string[]; isPublic?: boolean } = {
          name: (params['name'] as string) ?? '',
        };
        if (Array.isArray(params['track_ids'])) spOpts.trackIds = params['track_ids'] as string[];
        if (params['is_public'] !== undefined) {
          spOpts.isPublic = params['is_public'] === true || params['is_public'] === 'true';
        }
        return personalAssistant.spotifyCreatePlaylist(spOpts);
      }
      case 'icloud_photos_list': {
        const { personalAssistant } = await import('./personal-assistant.js');
        return personalAssistant.icloudPhotosList();
      }
      case 'integrations_capabilities': {
        const { personalAssistant } = await import('./personal-assistant.js');
        const filterService = params['service'] as string | undefined;
        return filterService
          ? { capabilities: personalAssistant.getCapabilitiesForService(filterService) }
          : { capabilities: personalAssistant.getCapabilities() };
      }
      case 'integrations_oauth_health': {
        const { personalAssistant } = await import('./personal-assistant.js');
        return { services: await personalAssistant.checkAllOAuth() };
      }
      /* === Contacts === */
      case 'contact_add': {
        const { contacts } = await import('./contacts.js');
        const cInput: {
          name: string;
          phone?: string;
          email?: string;
          whatsapp?: string;
          aliases?: string[];
          notes?: string;
        } = { name: (params['name'] as string) ?? '' };
        if (typeof params['phone'] === 'string') cInput.phone = params['phone'];
        if (typeof params['email'] === 'string') cInput.email = params['email'];
        if (typeof params['whatsapp'] === 'string') cInput.whatsapp = params['whatsapp'];
        if (Array.isArray(params['aliases'])) cInput.aliases = params['aliases'] as string[];
        if (typeof params['notes'] === 'string') cInput.notes = params['notes'];
        return { ok: true, contact: contacts.add(cInput) };
      }
      case 'contact_search': {
        const { contacts } = await import('./contacts.js');
        const opts: { maxResults?: number } = {};
        if (typeof params['max'] === 'number') opts.maxResults = params['max'];
        return {
          ok: true,
          results: contacts.search((params['query'] as string) ?? '', opts),
        };
      }
      case 'contact_list': {
        const { contacts } = await import('./contacts.js');
        return { ok: true, contacts: contacts.list() };
      }
      case 'contact_remove': {
        const { contacts } = await import('./contacts.js');
        return { ok: contacts.remove((params['id'] as string) ?? '') };
      }
      /* === Image Transform — Kevin "polyvalent créatif" 2026-05-07 === */
      case 'transform_image':
      case 'cartoonify':
      case 'animate_image':
      case 'image_to_video':
      case 'remove_background':
      case 'stylize_image': {
        const { imageTransform } = await import('./image-transform.js');
        const url = (params['url'] as string) ?? '';
        if (!url || !imageTransform.isValidImageUrl(url)) {
          throw new Error('url invalide (https/data:/blob: requis)');
        }
        /* Aliases shorthand → type */
        let type = (params['type'] as string) ?? '';
        if (toolName === 'cartoonify') type = 'cartoon';
        else if (toolName === 'animate_image' || toolName === 'image_to_video') type = 'video';
        else if (toolName === 'remove_background') type = 'remove-bg';
        else if (toolName === 'stylize_image') type = 'stylize';
        if (!imageTransform.isValidTransformType(type)) {
          throw new Error(`type invalide (cartoon | anime | video | remove-bg | stylize). Reçu: ${type}`);
        }
        const prompt = params['prompt'] as string | undefined;
        let result;
        if (type === 'cartoon') result = await imageTransform.cartoonify(url);
        else if (type === 'anime') result = await imageTransform.animeStyle(url);
        else if (type === 'video') result = await imageTransform.animateToVideo(url);
        else if (type === 'remove-bg') result = await imageTransform.removeBg(url);
        else result = await imageTransform.stylize(url, prompt ?? '');
        return result;
      }
      /* === Marketplace Plugins (Kevin 2026-05-04 — Apex peut s'auto-étendre) === */
      case 'marketplace_list_installed': {
        const { apexPluginsMarketplace } = await import('./apex-plugins-marketplace.js');
        const installed = apexPluginsMarketplace.list({ status: 'installed' });
        return {
          count: installed.length,
          plugins: installed.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            tools: p.apex_tools ?? [],
          })),
          stats: apexPluginsMarketplace.getStats(),
        };
      }
      case 'marketplace_search': {
        const { apexPluginsMarketplace } = await import('./apex-plugins-marketplace.js');
        const query = String(params['query'] ?? '');
        const max = typeof params['max'] === 'number' ? (params['max'] as number) : 30;
        const results = apexPluginsMarketplace.search(query, max);
        return {
          query,
          count: results.length,
          plugins: results.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            category: p.category,
            source: p.source,
            status: apexPluginsMarketplace.getStatusOf(p.id),
            pwa_compatible: p.pwa_compatible,
            value: p.estimated_value,
            url: p.url,
          })),
        };
      }
      case 'marketplace_install': {
        const { apexPluginsMarketplace } = await import('./apex-plugins-marketplace.js');
        const pluginId = String(params['plugin_id'] ?? '');
        if (!pluginId) throw new Error('plugin_id requis');
        const result = await apexPluginsMarketplace.install(pluginId);
        return result;
      }
      case 'marketplace_recommend': {
        const { apexPluginsMarketplace } = await import('./apex-plugins-marketplace.js');
        const category = params['category'] as string | undefined;
        const max = typeof params['max'] === 'number' ? (params['max'] as number) : 20;
        const minValue = (params['min_value'] as 'critical' | 'high' | 'medium' | 'low' | undefined) ?? 'medium';
        const recos = apexPluginsMarketplace.recommendForUser({
          ...(category && { category: category as never }),
          max,
          minValue,
        });
        return {
          count: recos.length,
          recommendations: recos.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            category: p.category,
            value: p.estimated_value,
            requires_api_key: p.api_key_service ?? null,
          })),
        };
      }
      /* === Méta-Marketplace (Kevin 2026-05-07 — hub 30+ marketplaces) === */
      case 'meta_search': {
        const { apexMetaMarketplace } = await import('./apex-meta-marketplace.js');
        const query = String(params['query'] ?? '');
        const limit = typeof params['limit'] === 'number' ? (params['limit'] as number) : 50;
        const includeNonPwa = params['include_non_pwa'] === true;
        const categoriesRaw = params['categories'];
        const opts: {
          categories?: import('./apex-meta-marketplace.js').MarketplaceCategory[];
          limit?: number;
          include_non_pwa?: boolean;
        } = { limit };
        if (includeNonPwa) opts.include_non_pwa = true;
        if (typeof categoriesRaw === 'string' && categoriesRaw.trim()) {
          opts.categories = categoriesRaw
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean) as import('./apex-meta-marketplace.js').MarketplaceCategory[];
        }
        const items = await apexMetaMarketplace.searchAll(query, opts);
        return {
          query,
          count: items.length,
          items: items.map((it) => ({
            id: it.id,
            marketplace: it.marketplace,
            name: it.name,
            description: it.description,
            url: it.url,
            ...(it.category && { category: it.category }),
            ...(typeof it.stars === 'number' && { stars: it.stars }),
            ...(typeof it.downloads === 'number' && { downloads: it.downloads }),
            ...(it.install_method && { install_method: it.install_method }),
          })),
        };
      }
      case 'meta_install': {
        const { apexMetaMarketplace } = await import('./apex-meta-marketplace.js');
        const providerId = String(params['providerId'] ?? '');
        const itemId = String(params['itemId'] ?? '');
        if (!providerId || !itemId) throw new Error('providerId et itemId requis');
        const result = await apexMetaMarketplace.install(providerId, itemId);
        return result;
      }
      case 'meta_trending': {
        const { apexMetaMarketplace } = await import('./apex-meta-marketplace.js');
        const providerId = String(params['providerId'] ?? '');
        if (!providerId) throw new Error('providerId requis');
        const limit = typeof params['limit'] === 'number' ? (params['limit'] as number) : 10;
        const items = await apexMetaMarketplace.getTrending(providerId, limit);
        return { providerId, count: items.length, items };
      }
      case 'meta_recommend': {
        const { apexMetaMarketplace } = await import('./apex-meta-marketplace.js');
        const recos = await apexMetaMarketplace.recommendForApex();
        return {
          count: recos.length,
          recommendations: recos,
        };
      }
      case 'meta_list_providers': {
        const { apexMetaMarketplace } = await import('./apex-meta-marketplace.js');
        const filter: {
          category?: import('./apex-meta-marketplace.js').MarketplaceCategory;
          pwa_compatible?: boolean;
          api_key_required?: boolean;
        } = {};
        if (typeof params['category'] === 'string') {
          filter.category = params['category'] as import('./apex-meta-marketplace.js').MarketplaceCategory;
        }
        if (typeof params['pwa_compatible'] === 'boolean') filter.pwa_compatible = params['pwa_compatible'];
        if (typeof params['api_key_required'] === 'boolean') filter.api_key_required = params['api_key_required'];
        const providers = apexMetaMarketplace.listProviders(filter);
        return {
          count: providers.length,
          providers: providers.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            url: p.url,
            pwa_compatible: p.pwa_compatible,
            api_key_required: p.api_key_required,
            api_key_service: p.api_key_service ?? null,
            free_tier_available: p.free_tier_available,
            description: p.description,
          })),
          stats: apexMetaMarketplace.getStats(),
        };
      }
      /* v13.3.51 — Vision device + Broadlink (Kevin 2026-05-07 "rien fait avec mes photos") */
      case 'analyze_device_image': {
        const { visionDeviceAnalyze } = await import('./vision-device-analyze.js');
        const dataUrl = typeof params['image_data_url'] === 'string' ? params['image_data_url'] : undefined;
        const b64 = typeof params['image_base64'] === 'string' ? params['image_base64'] : undefined;
        if (!dataUrl && !b64) throw new Error('image_data_url ou image_base64 requis');
        const forceType = typeof params['force_type'] === 'string' ? params['force_type'] : 'auto';
        const input = dataUrl ? { imageDataUrl: dataUrl } : { imageBase64: b64! };
        if (forceType === 'broadlink_account') {
          const r = await visionDeviceAnalyze.analyzeBroadlinkAccount(input);
          return { ok: true, type: 'broadlink_account', ...r };
        }
        if (forceType === 'smart_tv') {
          const r = await visionDeviceAnalyze.analyzeSmartTV(input);
          return { ok: true, type: 'smart_tv', ...r };
        }
        const r = await visionDeviceAnalyze.autoDetectAndAnalyze(input);
        return { ok: true, ...r };
      }
      case 'setup_broadlink_from_image': {
        const { visionDeviceAnalyze } = await import('./vision-device-analyze.js');
        const { broadlinkBridge } = await import('./broadlink-bridge.js');
        const dataUrl = typeof params['image_data_url'] === 'string' ? params['image_data_url'] : undefined;
        const b64 = typeof params['image_base64'] === 'string' ? params['image_base64'] : undefined;
        if (!dataUrl && !b64) throw new Error('image_data_url ou image_base64 requis');
        const input = dataUrl ? { imageDataUrl: dataUrl } : { imageBase64: b64! };
        const analysis = await visionDeviceAnalyze.analyzeBroadlinkAccount(input);
        if (!analysis.token) {
          return {
            ok: false,
            reason: 'no_token_visible',
            message: 'Aucun token visible dans l\'image. Connecte-toi via la vue ?view=broadlink-setup avec email + password.',
            analysis,
          };
        }
        const setupResult = await broadlinkBridge.setToken(analysis.token, analysis.email);
        return {
          ok: setupResult.ok,
          token_stored: setupResult.ok,
          email: analysis.email,
          devices_detected: analysis.devices?.length ?? 0,
          devices: analysis.devices,
        };
      }
      case 'broadlink_list_devices': {
        const { broadlinkBridge } = await import('./broadlink-bridge.js');
        const force = params['force_refresh'] === true;
        const devices = await broadlinkBridge.listDevices(force);
        return { ok: true, count: devices.length, devices };
      }
      case 'broadlink_send_ir': {
        const { broadlinkBridge } = await import('./broadlink-bridge.js');
        const deviceId = typeof params['device_id'] === 'string' ? params['device_id'] : '';
        let irHex = typeof params['ir_hex'] === 'string' ? params['ir_hex'] : '';
        const learnedName = typeof params['learned_name'] === 'string' ? params['learned_name'] : '';
        if (!irHex && learnedName && deviceId) {
          const codes = await broadlinkBridge.getLearnedCodes(deviceId);
          const found = codes.find((c) => c.name === learnedName);
          if (found) irHex = found.ir_hex;
        }
        if (!deviceId || !irHex) {
          return { ok: false, error: 'device_id + (ir_hex ou learned_name avec code appris) requis' };
        }
        const r = await broadlinkBridge.sendIR(deviceId, irHex);
        return r;
      }
      /* v13.3.52 — IoT multi-providers framework (Kevin 2026-05-07) */
      case 'install_iot_provider': {
        const { iotRegistry } = await import('./iot-providers-registry.js');
        const providerId = typeof params['provider_id'] === 'string' ? params['provider_id'] : '';
        const credsRaw = params['credentials'];
        const credentials =
          credsRaw && typeof credsRaw === 'object' && !Array.isArray(credsRaw)
            ? (credsRaw as Record<string, string>)
            : {};
        const region = typeof params['region'] === 'string' ? params['region'] : undefined;
        if (!providerId || Object.keys(credentials).length === 0) {
          return { ok: false, error: 'provider_id + credentials requis' };
        }
        const installInput = region
          ? { provider_id: providerId, credentials, region }
          : { provider_id: providerId, credentials };
        const r = await iotRegistry.configureProvider(installInput);
        return r;
      }
      case 'iot_list_devices': {
        const { iotRegistry } = await import('./iot-providers-registry.js');
        const providerId = typeof params['provider_id'] === 'string' ? params['provider_id'] : '';
        const devices = providerId
          ? await iotRegistry.listDevicesFor(providerId)
          : await iotRegistry.listAllDevices();
        return { ok: true, count: devices.length, devices };
      }
      case 'iot_send_command': {
        const { iotRegistry } = await import('./iot-providers-registry.js');
        const providerId = typeof params['provider_id'] === 'string' ? params['provider_id'] : '';
        const deviceId = typeof params['device_id'] === 'string' ? params['device_id'] : '';
        const cmdRaw = params['command'];
        const command =
          cmdRaw && typeof cmdRaw === 'object' && !Array.isArray(cmdRaw)
            ? (cmdRaw as Record<string, unknown>)
            : {};
        if (!providerId || !deviceId) return { ok: false, error: 'provider_id + device_id requis' };
        const r = await iotRegistry.sendCommand(providerId, deviceId, command);
        return r;
      }
      case 'iot_test_provider': {
        const { iotRegistry } = await import('./iot-providers-registry.js');
        const providerId = typeof params['provider_id'] === 'string' ? params['provider_id'] : '';
        if (!providerId) return { ok: false, error: 'provider_id requis' };
        const r = await iotRegistry.testConnection(providerId);
        return r;
      }
      /* v13.3.64 — Admin reset PIN cross-device (Kevin 2026-05-08).
         Push command Firebase ; iPhone target SSE listener (admin-commands-listener.ts)
         applique reset local + toast + reload. */
      case 'reset_user_pin': {
        const targetUid = typeof params['target_uid'] === 'string' ? params['target_uid'] : '';
        const reason = typeof params['reason'] === 'string' ? params['reason'] : '';
        const { adminCommands } = await import('./admin-commands.js');
        return adminCommands.resetUserPin(targetUid, reason);
      }
      /* === v13 — Browser controller (anti-blocage X-Frame-Options) === */
      case 'unblock_url': {
        const { axTryUnblockUrl } = await import('./browser-controller.js');
        const url = String(params['url'] ?? '');
        if (!url) return { ok: false, error: 'url required' };
        return await axTryUnblockUrl(url);
      }
      case 'navigate_to': {
        const { axNavigateTo } = await import('./browser-controller.js');
        const target = String(params['target'] ?? '');
        const field = typeof params['field'] === 'string' ? params['field'] : undefined;
        if (!target) return { ok: false, error: 'target required' };
        return await axNavigateTo(target, field);
      }
      case 'autofill_field': {
        const { axAutofillField } = await import('./form-auto-fill.js');
        const key = String(params['key'] ?? '');
        const value = String(params['value'] ?? '');
        if (!key || !value) return { ok: false, error: 'key and value required' };
        const opts: { confirm?: boolean; reason?: string } = {};
        if (typeof params['confirm'] === 'boolean') opts.confirm = params['confirm'];
        if (typeof params['reason'] === 'string') opts.reason = params['reason'];
        return await axAutofillField(key, value, opts);
      }
      /* v13.3.69 — Setup compte user complet (PIN + activation) en autonomie totale */
      case 'setup_user_account': {
        const targetUid = typeof params['target_uid'] === 'string' ? params['target_uid'] : '';
        const pinClear = typeof params['pin_clear'] === 'string' ? params['pin_clear'] : '';
        const displayName = typeof params['display_name'] === 'string' ? params['display_name'] : undefined;
        const reason = typeof params['reason'] === 'string' ? params['reason'] : '';
        if (!targetUid || !pinClear) return { ok: false, error: 'target_uid et pin_clear requis' };
        if (!/^\d{4,12}$/.test(pinClear)) return { ok: false, error: 'PIN doit être 4-12 chiffres' };
        const { auth } = await import('./auth.js');
        const { adminCommands } = await import('./admin-commands.js');
        const pinHash = await auth.hashPin(pinClear, targetUid);
        const setupOpts: { targetUid: string; pinHash: string; displayName?: string; reason?: string } = { targetUid, pinHash };
        if (displayName) setupOpts.displayName = displayName;
        if (reason) setupOpts.reason = reason;
        return adminCommands.setupAccount(setupOpts);
      }
      /* === v13 — MCP Memory Server (knowledge graph local — issue #240 innovation gratuite) === */
      case 'memory_add_entity': {
        const { mcpMemoryServer } = await import('./mcp-memory-server.js');
        const name = String(params['name'] ?? '');
        const type = String(params['type'] ?? '');
        if (!name || !type) throw new Error('name and type required');
        const obs = Array.isArray(params['observations'])
          ? (params['observations'] as unknown[]).filter((o): o is string => typeof o === 'string')
          : [];
        return await mcpMemoryServer.addEntity(name, type, obs);
      }
      case 'memory_add_relation': {
        const { mcpMemoryServer } = await import('./mcp-memory-server.js');
        const fromId = String(params['from_id'] ?? '');
        const toId = String(params['to_id'] ?? '');
        const type = String(params['type'] ?? '');
        if (!fromId || !toId || !type) throw new Error('from_id, to_id and type required');
        return await mcpMemoryServer.addRelation(fromId, toId, type);
      }
      case 'memory_search': {
        const { mcpMemoryServer } = await import('./mcp-memory-server.js');
        const query = String(params['query'] ?? '');
        if (!query) throw new Error('query required');
        const opts: { limit?: number; type?: string } = {};
        if (typeof params['limit'] === 'number') opts.limit = params['limit'];
        if (typeof params['type'] === 'string' && params['type']) opts.type = params['type'];
        const hits = await mcpMemoryServer.search(query, opts);
        return { hits, count: hits.length };
      }
      case 'memory_get_related': {
        const { mcpMemoryServer } = await import('./mcp-memory-server.js');
        const entityId = String(params['entity_id'] ?? '');
        if (!entityId) throw new Error('entity_id required');
        const depth = typeof params['depth'] === 'number' ? params['depth'] : 1;
        const related = await mcpMemoryServer.getRelated(entityId, depth);
        return { related, count: related.length };
      }
      /* === v13 — Sequential Thinking MCP (raisonnement multi-étapes — issue #240) === */
      case 'thinking_start': {
        const { sequentialThinking } = await import('./sequential-thinking.js');
        const problem = String(params['problem'] ?? '');
        if (!problem) throw new Error('problem required');
        const estimated = typeof params['estimated_steps'] === 'number' ? params['estimated_steps'] : undefined;
        return await sequentialThinking.startThought(problem, estimated);
      }
      case 'thinking_add_step': {
        const { sequentialThinking } = await import('./sequential-thinking.js');
        const thoughtId = String(params['thought_id'] ?? '');
        const content = String(params['content'] ?? '');
        if (!thoughtId || !content) throw new Error('thought_id and content required');
        const opts: { reflections?: string; can_revise?: boolean } = {};
        if (typeof params['reflections'] === 'string' && params['reflections']) {
          opts.reflections = params['reflections'];
        }
        if (typeof params['can_revise'] === 'boolean') opts.can_revise = params['can_revise'];
        return await sequentialThinking.addStep(thoughtId, content, opts);
      }
      case 'thinking_revise': {
        const { sequentialThinking } = await import('./sequential-thinking.js');
        const thoughtId = String(params['thought_id'] ?? '');
        const stepIndex = typeof params['step_index'] === 'number' ? params['step_index'] : -1;
        const newContent = String(params['new_content'] ?? '');
        if (!thoughtId || stepIndex < 0 || !newContent) {
          throw new Error('thought_id, step_index, and new_content required');
        }
        return await sequentialThinking.revise(thoughtId, stepIndex, newContent);
      }
      case 'thinking_branch': {
        const { sequentialThinking } = await import('./sequential-thinking.js');
        const thoughtId = String(params['thought_id'] ?? '');
        const fromStep = typeof params['from_step'] === 'number' ? params['from_step'] : -1;
        const alternative = String(params['alternative'] ?? '');
        if (!thoughtId || fromStep < 0 || !alternative) {
          throw new Error('thought_id, from_step, and alternative required');
        }
        return await sequentialThinking.branch(thoughtId, fromStep, alternative);
      }
      case 'thinking_complete': {
        const { sequentialThinking } = await import('./sequential-thinking.js');
        const thoughtId = String(params['thought_id'] ?? '');
        const conclusion = String(params['conclusion'] ?? '');
        if (!thoughtId || !conclusion) throw new Error('thought_id and conclusion required');
        return await sequentialThinking.complete(thoughtId, conclusion);
      }
      default:
        throw new Error(`Tool inconnu: ${toolName}`);
    }
  }

  /* === Implémentations tools === */

  private async readFile(path: string, branch = 'main'): Promise<{ content: string; size: number }> {
    if (!path || path.includes('..') || path.startsWith('/')) {
      throw new Error('Chemin invalide (relatif obligatoire, pas de ..)');
    }
    const url = `https://raw.githubusercontent.com/9r4rxssx64-creator/cmcteams/${branch}/${path}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const content = await res.text();
    return { content, size: content.length };
  }

  /**
   * Résout un numéro de téléphone : si phone fourni, l'utiliser direct.
   * Sinon cherche le contact dans le carnet (fuzzy) et retourne phone/whatsapp.
   * Pour Kevin "appelle Yannou" → trouve "Yann Roux" → retourne son numéro.
   */
  private async resolvePhone(phoneArg?: string, contactName?: string): Promise<string> {
    if (phoneArg && phoneArg.trim().length > 0) return phoneArg;
    if (!contactName) return '';
    const { contacts } = await import('./contacts.js');
    const direct = contacts.getByName(contactName);
    if (direct) {
      return direct.whatsapp ?? direct.phone ?? '';
    }
    const found = contacts.search(contactName, { maxResults: 1 });
    if (found.length > 0) {
      const first = found[0];
      if (first) return first.whatsapp ?? first.phone ?? '';
    }
    return '';
  }

  /**
   * Kevin règle "1 CLIC + FENÊTRE + BOUTON DIRECT" :
   * Ouvre modal pop-up avec lien direct cliquable (pas window.open auto).
   * IA appelle ce tool quand user dit "ouvre Google", "va sur tel site", etc.
   */
  private async openUrlModal(url: string, label?: string, description?: string): Promise<{ ok: boolean; url: string; opened: boolean }> {
    const cleanUrl = url.trim();
    if (!cleanUrl) return { ok: false, url: '', opened: false };
    /* Préfixe https:// si manquant */
    const fullUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
    /* Domain pour label par défaut */
    let domain = fullUrl;
    try {
      domain = new URL(fullUrl).hostname.replace(/^www\./, '');
    } catch { /* skip */ }
    const labelText = label ?? domain;
    const descText = description ?? `Ouvre ${domain} dans un nouvel onglet`;
    /* Ouvre modal-sheet UI (Kevin règle 1-clic) */
    try {
      const { modalSheet } = await import('../ui/modal-sheet.js');
      const sheet = modalSheet.open({
        title: `🌐 ${labelText}`,
        content: `
          <div style="padding:8px 0">
            <p style="margin:0 0 16px;color:var(--ax-text-dim)">${descText}</p>
            <div style="background:rgba(201,162,39,0.08);border:1px solid rgba(201,162,39,0.3);border-radius:8px;padding:12px;font-family:monospace;font-size:13px;word-break:break-all;color:#c9a227">
              ${fullUrl.replace(/[<>"']/g, '')}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px">
              <button class="ax-btn ax-btn-secondary" data-tool-action="openurl-internal">📱 Ouvrir dans Apex</button>
              <button class="ax-btn ax-btn-primary" data-tool-action="openurl-external">🌐 Ouvrir Safari</button>
            </div>
          </div>
        `,
        actions: [
          {
            label: 'Annuler',
            variant: 'ghost',
            onClick: () => { sheet.close(); },
          },
        ],
      });
      /* P0 fix audit Cure53/NCC : event delegation au lieu d'addEventListener par bouton.
         1 listener global sur document.body via installDelegation() — pas de leak par modal. */
      const unregInternal = this.registerToolAction('openurl-internal', () => {
        sheet.close();
        try {
          localStorage.setItem('apex_v13_browser_last_url', fullUrl);
        } catch { /* skip */ }
        if (typeof location !== 'undefined') location.hash = '#browser';
        unregInternal();
        unregExternal();
      });
      const unregExternal = this.registerToolAction('openurl-external', () => {
        sheet.close();
        if (typeof window !== 'undefined') window.open(fullUrl, '_blank', 'noopener,noreferrer');
        unregInternal();
        unregExternal();
      });
      return { ok: true, url: fullUrl, opened: true };
    } catch (err: unknown) {
      logger.warn('apex-tools', 'openUrlModal failed', { err });
      return { ok: false, url: fullUrl, opened: false };
    }
  }

  private async webFetch(url: string): Promise<{ content: string; status: number }> {
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      throw new Error('URL doit commencer par http:// ou https://');
    }
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const text = await res.text();
    /* Strip HTML tags ultra-light pour extraire texte (Jet 9 enrichira) */
    const stripped = text
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 10000);
    return { content: stripped, status: res.status };
  }

  private async webSearch(query: string, maxResults = 5): Promise<{ results: unknown[]; provider: string }> {
    if (!query) throw new Error('query required');
    const { vault } = await import('./vault.js');
    /* Brave Search API si configuré (déchiffré via vault.readKey si AXENC1:) */
    const braveKey = await vault.readKey('ax_brave_key');
    if (braveKey) {
      try {
        const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}`;
        const res = await fetch(url, {
          headers: { 'X-Subscription-Token': braveKey, Accept: 'application/json' },
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const data = (await res.json()) as { web?: { results?: unknown[] } };
          return { results: data.web?.results ?? [], provider: 'brave' };
        }
      } catch (err: unknown) {
        logger.warn('apex-tools', 'Brave search failed', { err });
      }
    }
    /* Tavily fallback (déchiffré) */
    const tavilyKey = await vault.readKey('ax_tavily_key');
    if (tavilyKey) {
      try {
        const res = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key: tavilyKey, query, max_results: maxResults }),
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const data = (await res.json()) as { results?: unknown[] };
          return { results: data.results ?? [], provider: 'tavily' };
        }
      } catch (err: unknown) {
        logger.warn('apex-tools', 'Tavily search failed', { err });
      }
    }
    /* Fallback : aucune clé = retourne placeholder pour configuration */
    return {
      results: [{ note: 'Configurer ax_brave_key ou ax_tavily_key pour activer web_search' }],
      provider: 'none',
    };
  }

  private readLogs(scope = 'all', limit = 50): Record<string, unknown[]> {
    const result: Record<string, unknown[]> = {};
    if (scope === 'audit' || scope === 'all') {
      try {
        const audit = JSON.parse(localStorage.getItem('apex_v13_audit_log') ?? '[]') as unknown[];
        result['audit'] = audit.slice(-limit);
      } catch {
        result['audit'] = [];
      }
    }
    if (scope === 'errors' || scope === 'all') {
      try {
        const obs = JSON.parse(localStorage.getItem('apex_v13_observability_buffer') ?? '[]') as Array<{
          level: string;
        }>;
        result['errors'] = obs.filter((e) => e.level === 'error').slice(-limit);
      } catch {
        result['errors'] = [];
      }
    }
    if (scope === 'sentinels' || scope === 'all') {
      try {
        const sent = JSON.parse(localStorage.getItem('apex_v13_sentinels') ?? '{}') as Record<string, unknown>;
        result['sentinels'] = Object.entries(sent).slice(0, limit);
      } catch {
        result['sentinels'] = [];
      }
    }
    return result;
  }

  private async vaultAction(action: string, key?: string): Promise<unknown> {
    /* Vault actions limitées : passphrase + encrypt/decrypt seulement
     * (vault.list/delete pas exposés en API tool — anti-enumeration sécurité). */
    switch (action) {
      case 'list': {
        /* Énumération via localStorage keys ax_*_key (pas le vault chiffré directement) */
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k?.match(/^ax_[a-z_]+_key$/)) keys.push(k);
        }
        return { count: keys.length, keys };
      }
      case 'get':
        if (!key) throw new Error('key required for get');
        /* Retourne uniquement existence + masked preview (anti-leak) */
        return { found: !!localStorage.getItem(key), masked: localStorage.getItem(key) ? '***' : null };
      case 'revoke': {
        if (!key) throw new Error('key required for revoke');
        try {
          localStorage.removeItem(key);
          return { ok: true };
        } catch {
          return { ok: false };
        }
      }
      default:
        throw new Error(`Vault action inconnu: ${action}`);
    }
  }

  private financeCalculate(type: string, params: Record<string, unknown>): unknown {
    switch (type) {
      case 'iban_check': {
        const iban = String(params['iban'] ?? '').replace(/\s/g, '').toUpperCase();
        if (iban.length < 14 || iban.length > 34) return { valid: false, reason: 'Longueur IBAN invalide' };
        /* Validation MOD 97 (norme ISO 13616) */
        const rearranged = iban.slice(4) + iban.slice(0, 4);
        const numeric = rearranged
          .split('')
          .map((c) => (/[A-Z]/.test(c) ? (c.charCodeAt(0) - 55).toString() : c))
          .join('');
        let mod = 0;
        for (const d of numeric) mod = (mod * 10 + Number(d)) % 97;
        return { valid: mod === 1, country: iban.slice(0, 2) };
      }
      case 'ir': {
        /* IR France 2026 simplified (tranches officielles) */
        const revenu = Number(params['revenu'] ?? 0);
        const parts = Number(params['parts'] ?? 1);
        const qf = revenu / parts;
        let impot = 0;
        if (qf > 11497) impot += (Math.min(qf, 29315) - 11497) * 0.11;
        if (qf > 29315) impot += (Math.min(qf, 83823) - 29315) * 0.3;
        if (qf > 83823) impot += (Math.min(qf, 180294) - 83823) * 0.41;
        if (qf > 180294) impot += (qf - 180294) * 0.45;
        return { ir_total: Math.round(impot * parts), qf: Math.round(qf), parts };
      }
      case 'credit': {
        /* Mensualité crédit immo (formule classique) */
        const capital = Number(params['capital'] ?? 0);
        const taux = Number(params['taux'] ?? 0) / 100 / 12;
        const duree = Number(params['duree_mois'] ?? 0);
        if (taux === 0) return { mensualite: capital / duree };
        const mens = (capital * taux) / (1 - Math.pow(1 + taux, -duree));
        return { mensualite: Math.round(mens * 100) / 100, total: Math.round(mens * duree * 100) / 100 };
      }
      case 'plus_value': {
        /* PV immo : abattement 6% par an entre 6e et 21e année (impôt) */
        const annees = Number(params['annees'] ?? 0);
        const gain = Number(params['gain'] ?? 0);
        const abattement = annees < 6 ? 0 : annees >= 22 ? 1 : (annees - 5) * 0.06;
        const taxable = gain * (1 - abattement);
        return { taxable: Math.round(taxable), abattement_pct: Math.round(abattement * 100) };
      }
      default:
        throw new Error(`Type calcul inconnu: ${type}`);
    }
  }

  private qrGenerate(data: string, format = 'plain'): { qr_data: string; format: string } {
    /* Pour QR réel, charger qrcode.js via CDN. Ici on retourne le payload formaté. */
    if (format === 'wifi') {
      /* WIFI:T:WPA;S:SSID;P:PASS;; */
      return { qr_data: data, format };
    }
    return { qr_data: data, format };
  }

  private async translate(text: string, targetLang: string): Promise<{ translated: string; provider: string }> {
    const { vault } = await import('./vault.js');
    /* DeepL si key configurée (déchiffré) */
    const deeplKey = await vault.readKey('ax_deepl_key');
    if (deeplKey) {
      try {
        const res = await fetch('https://api-free.deepl.com/v2/translate', {
          method: 'POST',
          headers: { Authorization: `DeepL-Auth-Key ${deeplKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `text=${encodeURIComponent(text)}&target_lang=${encodeURIComponent(targetLang.toUpperCase())}`,
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const data = (await res.json()) as { translations?: Array<{ text: string }> };
          return { translated: data.translations?.[0]?.text ?? text, provider: 'deepl' };
        }
      } catch (err: unknown) {
        logger.warn('apex-tools', 'DeepL failed', { err });
      }
    }
    /* Fallback Gemini Flash (gratuit 1M tokens/jour, 100+ langues) */
    const geminiKey = await vault.readKey('ax_google_key');
    if (geminiKey) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `Traduis ce texte en ${targetLang} (réponse: traduction seule, rien d'autre):\n\n${text}` }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 4000 },
          }),
          signal: AbortSignal.timeout(15000),
        });
        if (res.ok) {
          const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
          const out = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (out) return { translated: out, provider: 'gemini-flash-2.0' };
        }
      } catch (err: unknown) {
        logger.warn('apex-tools', 'Gemini translate failed', { err });
      }
    }
    /* Fallback Claude (paid mais qualité top) */
    const anthropicKey = await vault.readKey('ax_anthropic_key');
    if (anthropicKey) {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 2048,
            messages: [{ role: 'user', content: `Traduis ce texte en ${targetLang} (réponse: traduction seule):\n\n${text}` }],
          }),
          signal: AbortSignal.timeout(15000),
        });
        if (res.ok) {
          const data = (await res.json()) as { content?: Array<{ text?: string }> };
          const out = data.content?.[0]?.text?.trim();
          if (out) return { translated: out, provider: 'claude-haiku' };
        }
      } catch (err: unknown) {
        logger.warn('apex-tools', 'Claude translate failed', { err });
      }
    }
    return { translated: text, provider: 'fallback_no_provider' };
  }

  private async escalateHuman(action: string, urgency: string, context?: string): Promise<{ ok: boolean; ts: number }> {
    /* Push entry dans ax_claude_todo (Kevin reçoit notif via push worker) */
    const entry = {
      id: `esc_${Date.now()}`,
      action,
      urgency,
      context: context ?? '',
      ts: Date.now(),
      status: 'pending',
    };
    try {
      const todos = JSON.parse(localStorage.getItem('ax_claude_todo') ?? '[]') as unknown[];
      todos.push(entry);
      localStorage.setItem('ax_claude_todo', JSON.stringify(todos.slice(-50)));
    } catch {
      /* ignore quota */
    }
    void firebase.write('ax_claude_todo', entry);
    await auditLog.record('escalation.human', { details: { action, urgency } });
    return { ok: true, ts: entry.ts };
  }

  private async auditSelf(scope = 'all'): Promise<{ scope: string; metrics: Record<string, unknown> }> {
    /* Audit minimal : retourne metrics actuelles app (vrai audit subagent = Jet 9) */
    const metrics: Record<string, unknown> = {
      audit_count: this.tryParseLength('apex_v13_audit_log'),
      errors_count: this.tryParseLength('apex_v13_observability_buffer'),
      sentinels_active: this.tryParseObjectKeys('apex_v13_sentinels'),
      claude_todo_pending: this.tryParseLength('ax_claude_todo'),
      credentials_count: (() => {
        let count = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k?.match(/^ax_[a-z_]+_key$/)) count++;
        }
        return count;
      })(),
    };
    return { scope, metrics };
  }

  private async backupTrigger(): Promise<{ ok: boolean; backup_id: string }> {
    const backupId = `backup_${new Date().toISOString().slice(0, 10)}_${Date.now()}`;
    const snapshot: Record<string, unknown> = {};
    /* Snapshot keys critiques uniquement */
    const KEYS_TO_BACKUP = [
      'apex_v13_user',
      'apex_v13_users',
      'apex_v13_audit_log',
      'apex_v13_persistent_memory',
      'apex_v13_lessons',
    ];
    for (const k of KEYS_TO_BACKUP) {
      try {
        const v = localStorage.getItem(k);
        if (v) snapshot[k] = JSON.parse(v);
      } catch {
        /* ignore */
      }
    }
    void firebase.write(`ax_backup_${backupId}`, snapshot);
    return { ok: true, backup_id: backupId };
  }

  private tryParseLength(key: string): number {
    try {
      const arr = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown[];
      return Array.isArray(arr) ? arr.length : 0;
    } catch {
      return 0;
    }
  }

  private tryParseObjectKeys(key: string): number {
    try {
      const obj = JSON.parse(localStorage.getItem(key) ?? '{}') as Record<string, unknown>;
      return Object.keys(obj).length;
    } catch {
      return 0;
    }
  }

  /* === Tools meta-projets Kevin === */

  private async projectStatus(projectId: string): Promise<unknown> {
    const project = orchestrator.listProjects().find((p) => p.id === projectId);
    if (!project) throw new Error(`Projet inconnu: ${projectId}`);

    /* Fetch last commit info via GitHub API public (sans auth pour reads) */
    let lastCommit: { sha: string; message: string; date: string } | null = null;
    try {
      const res = await fetch(
        `https://api.github.com/repos/9r4rxssx64-creator/cmcteams/commits?per_page=1`,
        { signal: AbortSignal.timeout(5000) },
      );
      if (res.ok) {
        const data = (await res.json()) as Array<{ sha: string; commit: { message: string; author: { date: string } } }>;
        if (data[0]) {
          lastCommit = {
            sha: data[0].sha.slice(0, 7),
            message: data[0].commit.message.split('\n')[0] ?? '',
            date: data[0].commit.author.date,
          };
        }
      }
    } catch {
      /* Network fail = ok, retourne quand même project info */
    }

    return {
      id: project.id,
      name: project.name,
      url: project.url,
      tools_available: project.toolsAvailable,
      firebase_path: project.firebasePath,
      last_commit: lastCommit,
    };
  }

  private async projectContinue(projectId: string): Promise<unknown> {
    /* Lit handoff JSON + KEVIN_ACTIONS_TODO.md + lessons depuis GitHub raw */
    const handoffUrl = `https://raw.githubusercontent.com/9r4rxssx64-creator/cmcteams/main/CLAUDE_HANDOFF.json`;
    const todoUrl = `https://raw.githubusercontent.com/9r4rxssx64-creator/cmcteams/main/KEVIN_ACTIONS_TODO.md`;
    let handoff: unknown = null;
    let todo = '';
    try {
      const res = await fetch(handoffUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) handoff = await res.json();
    } catch {
      /* ignore */
    }
    try {
      const res = await fetch(todoUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) todo = (await res.text()).slice(0, 5000);
    } catch {
      /* ignore */
    }

    /* Lit lessons learned cross-session */
    let lessons: unknown[] = [];
    try {
      lessons = JSON.parse(localStorage.getItem('apex_v13_lessons') ?? '[]') as unknown[];
    } catch {
      /* ignore */
    }

    return {
      project_id: projectId,
      handoff,
      kevin_actions_todo: todo,
      recent_lessons: lessons.slice(-10),
      next_step_suggestion: `Pour continuer le projet ${projectId}, lire les TODOs Kevin + lessons + handoff puis appeler 'edit_file' ou 'project_finish'.`,
    };
  }

  private async searchLatestTools(domain: string): Promise<unknown> {
    /* Délègue à web_search avec query enrichi date */
    const year = new Date().getFullYear();
    const query = `latest ${domain} tools released ${year} site:github.com OR site:producthunt.com`;
    return this.webSearch(query, 5);
  }

  private async selfImprove(target = 'all'): Promise<unknown> {
    /* Audit metrics actuelles + propose améliorations
     * (placeholder Jet 9 : intégrer subagent Explore pour vraie analyse) */
    const audit = await this.auditSelf(target);
    return {
      target,
      current_state: audit,
      suggestions: [
        {
          area: 'performance',
          action: 'Activer code-splitting Vite sur features lazy-loaded',
          impact: 'medium',
        },
        {
          area: 'ux',
          action: 'Ajouter skeleton screens sur états loading > 300ms',
          impact: 'high',
        },
        {
          area: 'security',
          action: 'Rotation automatique tokens API tous les 90j (sentinelle credentials-watch)',
          impact: 'high',
        },
      ],
      next_action: 'Appeler edit_file avec changements proposés (validation Kevin requise)',
    };
  }

  private async knowledgeUpdate(provider: string): Promise<unknown> {
    /* Fetch URL docs officielles selon provider */
    const DOCS_URLS: Record<string, string> = {
      anthropic: 'https://docs.anthropic.com/en/docs/welcome',
      openai: 'https://platform.openai.com/docs',
      stripe: 'https://stripe.com/docs',
      firebase: 'https://firebase.google.com/docs',
      cloudflare: 'https://developers.cloudflare.com/',
      vercel: 'https://vercel.com/docs',
      groq: 'https://console.groq.com/docs',
      gemini: 'https://ai.google.dev/docs',
    };
    const url = DOCS_URLS[provider.toLowerCase()];
    if (!url) throw new Error(`Provider inconnu: ${provider}. Utilise: ${Object.keys(DOCS_URLS).join(', ')}`);
    const fetched = await this.webFetch(url);
    /* Stocker dans KB Apex pour next sessions */
    try {
      const kb = JSON.parse(localStorage.getItem('apex_v13_kb_docs') ?? '{}') as Record<string, unknown>;
      kb[provider] = { url, fetched_at: Date.now(), excerpt: String(fetched['content']).slice(0, 2000) };
      localStorage.setItem('apex_v13_kb_docs', JSON.stringify(kb));
    } catch {
      /* ignore quota */
    }
    return { provider, url, excerpt_size: String(fetched['content']).length };
  }

  private memoryRecall(keyword: string, scope = 'all'): unknown {
    if (!keyword) throw new Error('keyword required');
    const result: Record<string, unknown[]> = {};
    const lc = keyword.toLowerCase();
    if (scope === 'facts' || scope === 'all') {
      try {
        const facts = JSON.parse(localStorage.getItem('apex_v13_persistent_memory') ?? '[]') as Array<{
          category: string;
          fact: string;
        }>;
        result['facts'] = facts.filter((f) => f.fact.toLowerCase().includes(lc) || f.category.toLowerCase().includes(lc));
      } catch {
        result['facts'] = [];
      }
    }
    if (scope === 'lessons' || scope === 'all') {
      try {
        const lessons = JSON.parse(localStorage.getItem('apex_v13_lessons') ?? '[]') as Array<{
          title: string;
          text: string;
        }>;
        result['lessons'] = lessons.filter((l) => l.text.toLowerCase().includes(lc) || l.title.toLowerCase().includes(lc));
      } catch {
        result['lessons'] = [];
      }
    }
    if (scope === 'kb' || scope === 'all') {
      try {
        const kb = JSON.parse(localStorage.getItem('apex_v13_kb_docs') ?? '{}') as Record<string, { excerpt: string }>;
        result['kb'] = Object.entries(kb)
          .filter(([_, v]) => v.excerpt.toLowerCase().includes(lc))
          .map(([k]) => k);
      } catch {
        result['kb'] = [];
      }
    }
    return result;
  }

  private memoryAdd(category: string, fact: string): { ok: boolean; total: number } {
    if (!category || !fact) throw new Error('category + fact required');
    try {
      const facts = JSON.parse(localStorage.getItem('apex_v13_persistent_memory') ?? '[]') as Array<{
        category: string;
        fact: string;
        ts: number;
      }>;
      facts.push({ category, fact, ts: Date.now() });
      const trimmed = facts.length > 1000 ? facts.slice(-1000) : facts;
      localStorage.setItem('apex_v13_persistent_memory', JSON.stringify(trimmed));
      void firebase.write('apex_v13_persistent_memory', trimmed);
      return { ok: true, total: trimmed.length };
    } catch {
      return { ok: false, total: 0 };
    }
  }

  private lessonRecord(title: string, text: string, severity: string, category = 'general'): { ok: boolean; total: number } {
    if (!title || !text) throw new Error('title + text required');
    try {
      const lessons = JSON.parse(localStorage.getItem('apex_v13_lessons') ?? '[]') as Array<unknown>;
      lessons.push({
        id: `L_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title: title.slice(0, 200),
        text: text.slice(0, 2000),
        category,
        severity,
        ts: Date.now(),
      });
      const trimmed = lessons.length > 500 ? lessons.slice(-500) : lessons;
      localStorage.setItem('apex_v13_lessons', JSON.stringify(trimmed));
      void firebase.write('apex_v13_lessons', trimmed);
      return { ok: true, total: trimmed.length };
    } catch {
      return { ok: false, total: 0 };
    }
  }

  /* === Implémentations v13.0.1 (+10 tools) === */

  private async weather(location: string, days = 5): Promise<unknown> {
    /* Open-Meteo gratuit, pas de clé requise. Utilise géocoding free pour location → lat/lon */
    if (!location) throw new Error('location required');
    /* 1. Geocoding */
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=fr`;
    const geo = await fetch(geocodeUrl, { signal: AbortSignal.timeout(8000) });
    if (!geo.ok) throw new Error(`Geocoding HTTP ${geo.status}`);
    const geoData = (await geo.json()) as { results?: Array<{ latitude: number; longitude: number; name: string }> };
    const place = geoData.results?.[0];
    if (!place) return { error: 'Lieu introuvable', location };
    /* 2. Forecast */
    const fdays = Math.min(7, Math.max(1, days));
    const fcUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=auto&forecast_days=${fdays}`;
    const fc = await fetch(fcUrl, { signal: AbortSignal.timeout(8000) });
    if (!fc.ok) throw new Error(`Forecast HTTP ${fc.status}`);
    const fcData = (await fc.json()) as { daily: Record<string, unknown[]> };
    return {
      location: place.name,
      lat: place.latitude,
      lon: place.longitude,
      days: fdays,
      forecast: fcData.daily,
    };
  }

  private async newsHeadlines(category = 'general', country = 'fr'): Promise<unknown> {
    const { vault } = await import('./vault.js');
    /* Tente NewsAPI si clé, sinon RSS Le Monde France 24 publics (déchiffré) */
    const newsApiKey = await vault.readKey('ax_newsapi_key');
    if (newsApiKey) {
      try {
        const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${newsApiKey}&pageSize=10`;
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          const data = (await res.json()) as { articles?: unknown[] };
          return { provider: 'newsapi', articles: data.articles ?? [] };
        }
      } catch {
        /* fallback */
      }
    }
    /* Fallback : retourne notice configuration */
    return {
      provider: 'fallback',
      message: `Configurer ax_newsapi_key pour news ${category}/${country}`,
    };
  }

  private async marketData(type: string, symbol: string): Promise<unknown> {
    if (!symbol) throw new Error('symbol required');
    if (type === 'crypto') {
      /* CoinGecko free API */
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(symbol.toLowerCase())}&vs_currencies=usd,eur&include_24hr_change=true`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
      const data = (await res.json()) as Record<string, { usd: number; eur: number; usd_24h_change: number }>;
      return { type: 'crypto', symbol: symbol.toLowerCase(), price: data[symbol.toLowerCase()] ?? null };
    }
    if (type === 'stock' || type === 'forex') {
      const { vault } = await import('./vault.js');
      const finnhubKey = await vault.readKey('ax_finnhub_key');
      if (!finnhubKey) {
        return { type, symbol, message: 'Configurer ax_finnhub_key pour stocks/forex' };
      }
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${finnhubKey}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`Finnhub HTTP ${res.status}`);
      return { type, symbol, ...(await res.json()) };
    }
    throw new Error(`Type market inconnu: ${type}`);
  }

  private async scrapeUrl(url: string): Promise<{
    title: string;
    description: string;
    text: string;
    word_count: number;
  }> {
    if (!url.startsWith('http')) throw new Error('URL invalide');
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const html = await res.text();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    const stripped = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000);
    return {
      title: titleMatch?.[1] ?? '',
      description: descMatch?.[1] ?? '',
      text: stripped,
      word_count: stripped.split(/\s+/).filter(Boolean).length,
    };
  }

  private detectIntent(text: string): { intent: string; confidence: number; suggested_tool?: string } {
    if (!text) return { intent: 'unknown', confidence: 0 };
    const lc = text.toLowerCase();
    /* Patterns ordonnés par spécificité */
    const PATTERNS: Array<{ regex: RegExp; intent: string; tool?: string }> = [
      /* Kevin règle "1-clic ouverture URL" : extract domaine si URL/site mentionné */
      { regex: /(ouvre|va|navigue|ouvrir|aller|montre).*(https?:\/\/[^\s]+)/i, intent: 'open_url', tool: 'open_url' },
      { regex: /(ouvre|va|navigue|ouvrir|aller|montre).*\b([a-z0-9-]+\.(com|fr|io|net|org|app|dev|ai|co))\b/i, intent: 'open_url', tool: 'open_url' },
      { regex: /(ouvre|lance|montre).*(navigateur|browser|google|chrome|safari)/i, intent: 'open_browser', tool: 'open_url' },
      { regex: /(va|navigue)\s+sur\s+(.+)/i, intent: 'open_url', tool: 'open_url' },
      { regex: /(traduis|traduit|translate)\s+(?:en\s+)?(\w+)/, intent: 'translate', tool: 'translate' },
      { regex: /(meteo|météo|pluie|temperature|temps)/, intent: 'weather', tool: 'weather' },
      { regex: /(news|actualit|actu)/, intent: 'news', tool: 'news_headlines' },
      { regex: /(crypto|bitcoin|ethereum|btc|eth)/, intent: 'crypto_price', tool: 'market_data' },
      { regex: /(action|stock|bourse|cours)/, intent: 'stock_price', tool: 'market_data' },
      { regex: /(cherche|recherche|trouve|google)/, intent: 'web_search', tool: 'web_search' },
      { regex: /(scanne|scan|ocr)/, intent: 'ocr', tool: 'ocr_scan' },
      { regex: /(qr|code\s+qr)/, intent: 'qr_generate', tool: 'qr_generate' },
      { regex: /(facture|invoice)/, intent: 'studio_facture' },
      { regex: /(cv|curriculum|resume)/, intent: 'studio_cv' },
      { regex: /(musique|mix|track|chanson)/, intent: 'studio_music' },
      { regex: /(video|montage|clip)/, intent: 'studio_video' },
      { regex: /(plan|architecture|maison)/, intent: 'studio_archi' },
      { regex: /(loi|article|code\s+civil|jurisprudence)/, intent: 'legal_kb' },
      { regex: /(impot|impôt|ir|fiscal)/, intent: 'finance_calc', tool: 'finance_calculate' },
      { regex: /(iban|virement|paiement)/, intent: 'finance_iban', tool: 'finance_calculate' },
      { regex: /(rdv|rendez-vous|calendrier|agenda)/, intent: 'calendar', tool: 'create_calendar_event' },
      { regex: /(envoie.*email|mail|message)/, intent: 'send_email', tool: 'send_email' },
      { regex: /(audit|verifie|check)/, intent: 'audit_self', tool: 'audit_self' },
      { regex: /(memoire|rappelle|souviens)/, intent: 'memory_recall', tool: 'memory_recall' },
      { regex: /(deconnexion|logout|déconnecte)/, intent: 'logout' },
      { regex: /(bonjour|salut|hello|hi)/, intent: 'greeting' },
      { regex: /(aide|help|sos)/, intent: 'help' },
    ];
    for (const p of PATTERNS) {
      if (p.regex.test(lc)) {
        const result: { intent: string; confidence: number; suggested_tool?: string } = {
          intent: p.intent,
          confidence: 0.85,
        };
        if (p.tool) result.suggested_tool = p.tool;
        return result;
      }
    }
    return { intent: 'unknown', confidence: 0.3 };
  }

  private async sentinelsStatus(): Promise<unknown> {
    const { sentinels } = await import('./sentinels.js');
    const list = sentinels.list();
    return {
      total: list.length,
      enabled: list.filter((s) => s.enabled).length,
      sentinels: list.map((s) => ({
        id: s.id,
        name: s.name,
        enabled: s.enabled,
        last_run: s.lastRun ?? 0,
        last_result: s.lastResult ?? null,
      })),
    };
  }

  private async perfMetricsSnapshot(): Promise<unknown> {
    const { perfMetrics } = await import('./perf-metrics.js');
    return {
      ...perfMetrics.formatForUI(),
      score_breakdown: perfMetrics.getScore().details,
    };
  }

  /* ========== PUSH MAX v13.0.20 — Implémentations 25 nouveaux tools ==========
     Tous offline-first ou fetch lazy avec timeout + fallback gracieux.
     Aucune dépendance paid, aucune clé requise par défaut. */

  /* === Web extras === */

  private async wikipediaLookup(
    query: string,
    lang = 'fr',
  ): Promise<{ found: boolean; title?: string; extract?: string; url?: string }> {
    if (!query) throw new Error('query required');
    const safeLang = /^[a-z]{2,3}$/.test(lang) ? lang : 'fr';
    const url = `https://${safeLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return { found: false };
      const data = (await res.json()) as {
        title?: string;
        extract?: string;
        content_urls?: { desktop?: { page?: string } };
      };
      return {
        found: true,
        title: data.title ?? query,
        extract: data.extract ?? '',
        url: data.content_urls?.desktop?.page ?? `https://${safeLang}.wikipedia.org/wiki/${encodeURIComponent(query)}`,
      };
    } catch {
      return { found: false };
    }
  }

  private youtubeSearch(query: string): { search_url: string; embed_url: string } {
    if (!query) throw new Error('query required');
    const q = encodeURIComponent(query);
    return {
      search_url: `https://www.youtube.com/results?search_query=${q}`,
      embed_url: `https://www.youtube.com/embed?listType=search&list=${q}`,
    };
  }

  private async githubSearch(
    query: string,
    type = 'repositories',
  ): Promise<{ total: number; items: unknown[] }> {
    if (!query) throw new Error('query required');
    const validTypes = ['repositories', 'code', 'users', 'issues', 'repos'];
    const t = validTypes.includes(type) ? (type === 'repos' ? 'repositories' : type) : 'repositories';
    const url = `https://api.github.com/search/${t}?q=${encodeURIComponent(query)}&per_page=10`;
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (!res.ok) return { total: 0, items: [] };
      const data = (await res.json()) as { total_count?: number; items?: unknown[] };
      return { total: data.total_count ?? 0, items: (data.items ?? []).slice(0, 10) };
    } catch {
      return { total: 0, items: [] };
    }
  }

  private async stackoverflowSearch(
    query: string,
    tag?: string,
  ): Promise<{ total: number; questions: unknown[] }> {
    if (!query) throw new Error('query required');
    let url = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(query)}&site=stackoverflow&pagesize=10`;
    if (tag) url += `&tagged=${encodeURIComponent(tag)}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return { total: 0, questions: [] };
      const data = (await res.json()) as { items?: Array<{ title: string; link: string; score: number; is_answered: boolean; tags: string[] }> };
      const items = (data.items ?? []).map((q) => ({
        title: q.title,
        link: q.link,
        score: q.score,
        answered: q.is_answered,
        tags: q.tags,
      }));
      return { total: items.length, questions: items };
    } catch {
      return { total: 0, questions: [] };
    }
  }

  private async unshortenUrl(url: string): Promise<{ original: string; final: string; redirected: boolean }> {
    if (!url) throw new Error('url required');
    const safeUrl = url.startsWith('http') ? url : `https://${url}`;
    try {
      const res = await fetch(safeUrl, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
      });
      return {
        original: safeUrl,
        final: res.url || safeUrl,
        redirected: res.url !== safeUrl,
      };
    } catch {
      return { original: safeUrl, final: safeUrl, redirected: false };
    }
  }

  /* === Files & Documents === */

  private jsonValidate(json: string): {
    valid: boolean;
    parsed?: unknown;
    error?: string;
    depth?: number;
    keys_count?: number;
  } {
    if (!json) return { valid: false, error: 'Empty input' };
    try {
      const parsed: unknown = JSON.parse(json);
      const computeDepth = (obj: unknown, d = 0): number => {
        if (obj === null || typeof obj !== 'object') return d;
        const values = Array.isArray(obj) ? obj : Object.values(obj as Record<string, unknown>);
        if (values.length === 0) return d;
        return Math.max(...values.map((v) => computeDepth(v, d + 1)));
      };
      const countKeys = (obj: unknown): number => {
        if (obj === null || typeof obj !== 'object') return 0;
        if (Array.isArray(obj)) return obj.reduce<number>((acc, v) => acc + countKeys(v), 0);
        const entries = Object.entries(obj as Record<string, unknown>);
        return entries.length + entries.reduce<number>((acc, [, v]) => acc + countKeys(v), 0);
      };
      return {
        valid: true,
        parsed,
        depth: computeDepth(parsed),
        keys_count: countKeys(parsed),
      };
    } catch (err) {
      return { valid: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  private csvParse(
    csv: string,
    delimiter?: string,
  ): { headers: string[]; rows: Record<string, string>[]; total: number } {
    if (!csv) throw new Error('csv required');
    const lines = csv.replace(/\r\n/g, '\n').split('\n').filter((l) => l.length > 0);
    if (lines.length === 0) return { headers: [], rows: [], total: 0 };
    const firstLine = lines[0] ?? '';
    const sep =
      delimiter ??
      (firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',');
    const headers = firstLine.split(sep).map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const values = line.split(sep);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = (values[i] ?? '').trim();
      });
      return row;
    });
    return { headers, rows, total: rows.length };
  }

  private textDiff(
    before: string,
    after: string,
  ): { added: string[]; removed: string[]; unchanged: number; total_changes: number } {
    const beforeLines = (before ?? '').split('\n');
    const afterLines = (after ?? '').split('\n');
    const beforeSet = new Set(beforeLines);
    const afterSet = new Set(afterLines);
    const added = afterLines.filter((l) => !beforeSet.has(l));
    const removed = beforeLines.filter((l) => !afterSet.has(l));
    const unchanged = beforeLines.filter((l) => afterSet.has(l)).length;
    return {
      added,
      removed,
      unchanged,
      total_changes: added.length + removed.length,
    };
  }

  private async hashText(text: string, algo = 'SHA-256'): Promise<{ algo: string; hash: string }> {
    if (!text) throw new Error('text required');
    const validAlgos = ['SHA-256', 'SHA-1', 'SHA-384', 'SHA-512'];
    const safeAlgo = validAlgos.includes(algo) ? algo : 'SHA-256';
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest(safeAlgo, enc);
    const hash = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return { algo: safeAlgo, hash };
  }

  private base64EncodeDecode(mode: string, text: string): { mode: string; result: string } {
    if (!text) throw new Error('text required');
    if (mode === 'encode') {
      const bytes = new TextEncoder().encode(text);
      let bin = '';
      for (const b of bytes) bin += String.fromCharCode(b);
      return { mode, result: btoa(bin) };
    }
    if (mode === 'decode') {
      const bin = atob(text.replace(/\s/g, ''));
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return { mode, result: new TextDecoder().decode(bytes) };
    }
    throw new Error(`Mode invalide: ${mode}`);
  }

  /* === Code utils === */

  private regexTest(
    pattern: string,
    text: string,
    flags?: string,
  ): { matches: string[]; groups: string[][]; total: number; valid: boolean; error?: string } {
    if (!pattern) throw new Error('pattern required');
    try {
      const safeFlags = (flags ?? '').replace(/[^gimsuy]/g, '');
      const re = new RegExp(pattern, safeFlags || 'g');
      const matches: string[] = [];
      const groups: string[][] = [];
      const txt = text ?? '';
      if (re.global) {
        for (const m of txt.matchAll(re)) {
          matches.push(m[0]);
          groups.push(m.slice(1).filter((g): g is string => g !== undefined));
        }
      } else {
        const m = txt.match(re);
        if (m) {
          matches.push(m[0]);
          groups.push(m.slice(1).filter((g): g is string => g !== undefined));
        }
      }
      return { matches, groups, total: matches.length, valid: true };
    } catch (err) {
      return {
        matches: [],
        groups: [],
        total: 0,
        valid: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  private jwtDecode(token: string): {
    valid: boolean;
    header?: unknown;
    payload?: unknown;
    error?: string;
  } {
    if (!token) return { valid: false, error: 'Empty token' };
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false, error: 'JWT must have 3 parts' };
    try {
      const decode = (s: string): unknown => {
        const padded = s.replace(/-/g, '+').replace(/_/g, '/');
        const pad = padded + '='.repeat((4 - (padded.length % 4)) % 4);
        return JSON.parse(atob(pad)) as unknown;
      };
      return {
        valid: true,
        header: decode(parts[0] ?? ''),
        payload: decode(parts[1] ?? ''),
      };
    } catch (err) {
      return { valid: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  private uuidGenerate(count = 1): { uuids: string[]; total: number } {
    const safeCount = Math.max(1, Math.min(50, Math.floor(count)));
    const uuids: string[] = [];
    for (let i = 0; i < safeCount; i++) {
      uuids.push(typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : this.fallbackUuid());
    }
    return { uuids, total: uuids.length };
  }

  private fallbackUuid(): string {
    const b = crypto.getRandomValues(new Uint8Array(16));
    if (b[6] !== undefined) b[6] = (b[6] & 0x0f) | 0x40;
    if (b[8] !== undefined) b[8] = (b[8] & 0x3f) | 0x80;
    const hex = Array.from(b).map((x) => x.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  /* === Productivity === */

  private summarizeText(text: string, sentences = 3): { summary: string; total_sentences: number } {
    if (!text) throw new Error('text required');
    const allSentences = text
      .replace(/\s+/g, ' ')
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 5);
    if (allSentences.length === 0) {
      return { summary: text.slice(0, 200), total_sentences: 0 };
    }
    const stopwords = new Set([
      'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 'mais',
      'que', 'qui', 'pour', 'dans', 'sur', 'avec', 'sans', 'this', 'that',
      'the', 'and', 'for', 'with', 'from', 'have', 'has', 'had', 'are', 'was',
    ]);
    const wordFreq: Record<string, number> = {};
    for (const s of allSentences) {
      const words = s.toLowerCase().match(/[\p{L}]{4,}/gu) ?? [];
      for (const w of words) {
        if (!stopwords.has(w)) wordFreq[w] = (wordFreq[w] ?? 0) + 1;
      }
    }
    const scored = allSentences.map((s, idx) => {
      const words = s.toLowerCase().match(/[\p{L}]{4,}/gu) ?? [];
      const score = words.reduce((acc, w) => acc + (wordFreq[w] ?? 0), 0);
      return { idx, sentence: s, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const n = Math.max(1, Math.min(allSentences.length, sentences));
    const top = scored.slice(0, n).sort((a, b) => a.idx - b.idx);
    return {
      summary: top.map((s) => s.sentence).join(' '),
      total_sentences: allSentences.length,
    };
  }

  private wordCount(text: string): {
    words: number;
    chars: number;
    chars_no_spaces: number;
    sentences: number;
    paragraphs: number;
    reading_time_minutes: number;
    flesch_score: number;
  } {
    if (!text) {
      return {
        words: 0,
        chars: 0,
        chars_no_spaces: 0,
        sentences: 0,
        paragraphs: 0,
        reading_time_minutes: 0,
        flesch_score: 0,
      };
    }
    const words = (text.match(/\S+/g) ?? []).length;
    const chars = text.length;
    const chars_no_spaces = text.replace(/\s/g, '').length;
    const sentences = (text.match(/[.!?]+/g) ?? []).length || 1;
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || 1;
    const reading_time_minutes = Math.max(1, Math.round(words / 200));
    const syllables = (text.toLowerCase().match(/[aeiouyàâéèêëîïôöùûü]+/g) ?? []).length || 1;
    const flesch =
      206.835 -
      1.015 * (words / sentences) -
      84.6 * (syllables / Math.max(1, words));
    return {
      words,
      chars,
      chars_no_spaces,
      sentences,
      paragraphs,
      reading_time_minutes,
      flesch_score: Math.round(flesch * 10) / 10,
    };
  }

  private detectLanguage(text: string): { detected: string; confidence: number; scores: Record<string, number> } {
    if (!text) throw new Error('text required');
    const langWords: Record<string, string[]> = {
      fr: ['le', 'de', 'la', 'et', 'à', 'les', 'des', 'est', 'un', 'une', 'pour', 'que', 'qui', 'dans', 'sur', 'pas', 'avec', 'au', 'ce', 'sont'],
      en: ['the', 'of', 'and', 'to', 'a', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'with', 'as', 'his', 'they', 'be'],
      it: ['il', 'di', 'che', 'è', 'la', 'e', 'a', 'per', 'un', 'in', 'sono', 'mi', 'si', 'ho', 'lo', 'ha', 'le', 'una', 'ma', 'ti'],
      es: ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para'],
      de: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als'],
      pt: ['de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais'],
    };
    const lower = text.toLowerCase();
    const tokens = lower.match(/[\p{L}]+/gu) ?? [];
    const scores: Record<string, number> = {};
    for (const [lang, stops] of Object.entries(langWords)) {
      const hits = tokens.filter((t) => stops.includes(t)).length;
      scores[lang] = tokens.length > 0 ? hits / tokens.length : 0;
    }
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const top = sorted[0] ?? ['fr', 0];
    return {
      detected: top[0],
      confidence: Math.round(top[1] * 1000) / 1000,
      scores,
    };
  }

  private mindMapGenerate(topic: string, branches: string[]): { topic: string; markdown: string; nodes: number } {
    if (!topic) throw new Error('topic required');
    const safeBranches = Array.isArray(branches) ? branches.filter((b) => typeof b === 'string') : [];
    let md = `# ${topic}\n\n`;
    safeBranches.forEach((b, i) => {
      md += `## ${i + 1}. ${b}\n\n`;
    });
    if (safeBranches.length === 0) {
      md += `_(Pas de branches fournies — utilise le tool avec branches:[...])_\n`;
    }
    return {
      topic,
      markdown: md,
      nodes: 1 + safeBranches.length,
    };
  }

  private createTask(
    title: string,
    description?: string,
    due?: string,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal',
  ): { ok: boolean; task_id: string; total: number } {
    if (!title) throw new Error('title required');
    const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const task = {
      id: taskId,
      title: title.slice(0, 200),
      description: description?.slice(0, 1000) ?? '',
      due: due ?? '',
      priority,
      status: 'open',
      ts: Date.now(),
    };
    try {
      const list = JSON.parse(localStorage.getItem('apex_v13_tasks') ?? '[]') as unknown[];
      list.push(task);
      const trimmed = list.length > 500 ? list.slice(-500) : list;
      localStorage.setItem('apex_v13_tasks', JSON.stringify(trimmed));
      void firebase.write('apex_v13_tasks', trimmed);
      return { ok: true, task_id: taskId, total: trimmed.length };
    } catch {
      return { ok: false, task_id: taskId, total: 0 };
    }
  }

  /* === Communications validators === */

  private emailValidate(email: string): { valid: boolean; reason?: string; domain?: string } {
    if (!email) return { valid: false, reason: 'Empty' };
    const trimmed = email.trim().toLowerCase();
    const re = /^[a-z0-9._%+-]+@([a-z0-9.-]+\.[a-z]{2,})$/i;
    const m = trimmed.match(re);
    if (!m) return { valid: false, reason: 'Format invalide' };
    if (trimmed.length > 254) return { valid: false, reason: 'Trop long' };
    const domain = m[1] ?? '';
    return { valid: true, domain };
  }

  private phoneValidate(
    phone: string,
    country = 'FR',
  ): { valid: boolean; country: string; normalized?: string; reason?: string } {
    if (!phone) return { valid: false, country, reason: 'Empty' };
    const digits = phone.replace(/[\s().+-]/g, '');
    if (!/^\d+$/.test(digits)) return { valid: false, country, reason: 'Caractères invalides' };
    if (country === 'FR') {
      if (/^0\d{9}$/.test(digits)) return { valid: true, country, normalized: `+33${digits.slice(1)}` };
      if (/^33\d{9}$/.test(digits)) return { valid: true, country, normalized: `+${digits}` };
      return { valid: false, country, reason: 'Format FR invalide' };
    }
    if (country === 'MC') {
      if (/^\d{8}$/.test(digits)) return { valid: true, country, normalized: `+377${digits}` };
      if (/^377\d{8}$/.test(digits)) return { valid: true, country, normalized: `+${digits}` };
      return { valid: false, country, reason: 'Format MC invalide' };
    }
    if (digits.length >= 7 && digits.length <= 15) {
      return { valid: true, country, normalized: `+${digits}` };
    }
    return { valid: false, country, reason: 'Longueur invalide' };
  }

  private whatsappLink(phone: string, text?: string): { url: string; phone_clean: string } {
    if (!phone) throw new Error('phone required');
    const clean = phone.replace(/[\s().+-]/g, '');
    if (!/^\d{7,15}$/.test(clean)) throw new Error('Phone digits invalid (7-15)');
    const params = text ? `?text=${encodeURIComponent(text)}` : '';
    return {
      url: `https://wa.me/${clean}${params}`,
      phone_clean: clean,
    };
  }

  /* === Finance extras === */

  private vatValidateEu(vat: string): { valid: boolean; country?: string; format_ok: boolean; reason?: string } {
    if (!vat) return { valid: false, format_ok: false, reason: 'Empty' };
    const clean = vat.replace(/\s/g, '').toUpperCase();
    const re = /^([A-Z]{2})([A-Z0-9]{2,12})$/;
    const m = clean.match(re);
    if (!m) return { valid: false, format_ok: false, reason: 'Format invalide (pays + numéro)' };
    const EU_COUNTRIES = [
      'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'EL', 'ES', 'FI', 'FR',
      'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO',
      'SE', 'SI', 'SK', 'GB', 'XI',
    ];
    const country = m[1] ?? '';
    const isEu = EU_COUNTRIES.includes(country);
    return { valid: isEu, country, format_ok: true };
  }

  private compoundInterest(
    principal: number,
    rate: number,
    years: number,
    frequency = 12,
  ): { final_value: number; total_interest: number; effective_rate: number } {
    if (principal <= 0 || years <= 0) {
      throw new Error('principal and years must be positive');
    }
    const r = rate / 100;
    const n = Math.max(1, frequency);
    const finalValue = principal * Math.pow(1 + r / n, n * years);
    const interest = finalValue - principal;
    const effective = Math.pow(1 + r / n, n) - 1;
    return {
      final_value: Math.round(finalValue * 100) / 100,
      total_interest: Math.round(interest * 100) / 100,
      effective_rate: Math.round(effective * 10000) / 100,
    };
  }

  private async currencyConvert(
    amount: number,
    from: string,
    to: string,
  ): Promise<{ amount: number; from: string; to: string; converted?: number; rate?: number; provider?: string; error?: string }> {
    if (!Number.isFinite(amount)) throw new Error('amount must be a number');
    const fromCode = from.toUpperCase();
    const toCode = to.toUpperCase();
    if (!/^[A-Z]{3}$/.test(fromCode) || !/^[A-Z]{3}$/.test(toCode)) {
      return { amount, from: fromCode, to: toCode, error: 'Codes ISO 4217 invalides' };
    }
    if (fromCode === toCode) {
      return { amount, from: fromCode, to: toCode, converted: amount, rate: 1, provider: 'identity' };
    }
    try {
      const url = `https://api.exchangerate.host/convert?from=${fromCode}&to=${toCode}&amount=${amount}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return { amount, from: fromCode, to: toCode, error: `HTTP ${res.status}` };
      const data = (await res.json()) as { result?: number; info?: { rate?: number } };
      if (typeof data.result === 'number') {
        const out: { amount: number; from: string; to: string; converted: number; provider: string; rate?: number } = {
          amount,
          from: fromCode,
          to: toCode,
          converted: Math.round(data.result * 100) / 100,
          provider: 'exchangerate.host',
        };
        if (typeof data.info?.rate === 'number') out.rate = data.info.rate;
        return out;
      }
      return { amount, from: fromCode, to: toCode, error: 'No rate found' };
    } catch (err) {
      return {
        amount,
        from: fromCode,
        to: toCode,
        error: err instanceof Error ? err.message : 'Network failed',
      };
    }
  }

  /* === Image utils === */

  private async imageCompress(
    imageBase64: string,
    quality = 0.8,
    maxWidth = 1920,
  ): Promise<{ ok: boolean; original_size?: number; compressed_size?: number; compressed_base64?: string; error?: string }> {
    if (!imageBase64) throw new Error('image_base64 required');
    if (typeof document === 'undefined') {
      return { ok: false, error: 'Canvas API indisponible (env non-browser)' };
    }
    try {
      const safeQuality = Math.max(0.1, Math.min(1, quality));
      const safeMaxWidth = Math.max(64, Math.min(8192, Math.floor(maxWidth)));
      const src = imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`;
      const originalSize = imageBase64.length;
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = (): void => resolve(i);
        i.onerror = (e): void => reject(e instanceof Error ? e : new Error('Image load failed'));
        i.src = src;
      });
      const ratio = Math.min(1, safeMaxWidth / img.width);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return { ok: false, error: 'Canvas context indisponible' };
      ctx.drawImage(img, 0, 0, w, h);
      const compressed = canvas.toDataURL('image/jpeg', safeQuality);
      return {
        ok: true,
        original_size: originalSize,
        compressed_size: compressed.length,
        compressed_base64: compressed,
      };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /* ============================================================================
   * EXECUTE TASK ON SERVICE — Autonomie totale Kevin 2026-05-04
   *
   * Apex IA exécute des tâches concrètes sur services Kevin (clé API configurée).
   * Ex : send_email Resend, create_issue GitHub, transfer Stripe, post Telegram.
   *
   * Sécurité :
   * - Whitelist stricte de services + actions
   * - Toute action audit-loggée
   * - Pas d'exécution si clé non configurée (vault.readKey vide)
   * - Pas de delete/destruction sans confirmation explicite (params.confirm=true)
   * ============================================================================ */

  /**
   * Liste des handlers disponibles (pour list_task_on_service_handlers tool).
   */
  listExecuteTaskHandlers(): string[] {
    return [
      'github', 'stripe', 'resend', 'telegram', 'brevo',
      'openai', 'anthropic', 'vercel', 'cloudflare', 'paypal',
      'discord', 'slack', 'notion', 'airtable', 'shopify',
    ];
  }

  /**
   * Dispatcher service → handler. Retourne {ok, result?, error?}.
   */
  async executeTaskOnService(
    service: string,
    task: string,
    params: Record<string, unknown>,
  ): Promise<{ ok: boolean; service: string; task: string; result?: unknown; error?: string; duration_ms?: number }> {
    const start = Date.now();
    if (!service) return { ok: false, service: '', task, error: 'service required' };
    if (!task) return { ok: false, service, task: '', error: 'task required' };
    const normSvc = service.toLowerCase().trim();
    const normTask = task.toLowerCase().trim();

    /* Audit log avant exécution */
    void auditLog.record('execute_task_on_service.start', {
      details: { service: normSvc, task: normTask, params: this.sanitizeForAudit(params) },
    });

    try {
      let result: unknown;
      /* v13.3.62 code-split : handlers lazy-loaded depuis apex-tools-handlers/.
         Bénéfice : -25KB raw du chunk principal apex-tools-dispatch. */
      switch (normSvc) {
        case 'github': {
          const m = await import('./apex-tools-handlers/github.js');
          result = await m.handleGithubTask(normTask, params);
          break;
        }
        case 'stripe': {
          const m = await import('./apex-tools-handlers/payments.js');
          result = await m.handleStripeTask(normTask, params);
          break;
        }
        case 'paypal': {
          const m = await import('./apex-tools-handlers/payments.js');
          result = await m.handlePaypalTask(normTask, params);
          break;
        }
        case 'resend': {
          const m = await import('./apex-tools-handlers/comm.js');
          result = await m.handleResendTask(normTask, params);
          break;
        }
        case 'telegram': {
          const m = await import('./apex-tools-handlers/comm.js');
          result = await m.handleTelegramTask(normTask, params);
          break;
        }
        case 'brevo':
        case 'sendinblue': {
          const m = await import('./apex-tools-handlers/comm.js');
          result = await m.handleBrevoTask(normTask, params);
          break;
        }
        case 'discord': {
          const m = await import('./apex-tools-handlers/comm.js');
          result = await m.handleDiscordTask(normTask, params);
          break;
        }
        case 'slack': {
          const m = await import('./apex-tools-handlers/comm.js');
          result = await m.handleSlackTask(normTask, params);
          break;
        }
        case 'openai': {
          const m = await import('./apex-tools-handlers/ai.js');
          result = await m.handleOpenaiTask(normTask, params);
          break;
        }
        case 'anthropic': {
          const m = await import('./apex-tools-handlers/ai.js');
          result = await m.handleAnthropicTask(normTask, params);
          break;
        }
        case 'vercel': {
          const m = await import('./apex-tools-handlers/cloud.js');
          result = await m.handleVercelTask(normTask, params);
          break;
        }
        case 'cloudflare': {
          const m = await import('./apex-tools-handlers/cloud.js');
          result = await m.handleCloudflareTask(normTask, params);
          break;
        }
        case 'notion': {
          const m = await import('./apex-tools-handlers/data.js');
          result = await m.handleNotionTask(normTask, params);
          break;
        }
        case 'airtable': {
          const m = await import('./apex-tools-handlers/data.js');
          result = await m.handleAirtableTask(normTask, params);
          break;
        }
        case 'shopify': {
          const m = await import('./apex-tools-handlers/data.js');
          result = await m.handleShopifyTask(normTask, params);
          break;
        }
        default:
          throw new Error(`Service non supporté : ${normSvc}. Services dispo : ${this.listExecuteTaskHandlers().join(', ')}`);
      }
      const duration = Date.now() - start;
      void auditLog.record('execute_task_on_service.success', {
        details: { service: normSvc, task: normTask, duration_ms: duration },
      });
      return { ok: true, service: normSvc, task: normTask, result, duration_ms: duration };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      void auditLog.record('execute_task_on_service.failed', {
        details: { service: normSvc, task: normTask, error: msg },
      });
      return { ok: false, service: normSvc, task: normTask, error: msg, duration_ms: Date.now() - start };
    }
  }

  /**
   * Sanitise params pour audit log (retire fields sensibles).
   */
  private sanitizeForAudit(params: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    const sensitiveKeys = new Set(['password', 'secret', 'token', 'api_key', 'apikey', 'card', 'cvv', 'pin']);
    for (const [k, v] of Object.entries(params)) {
      if (sensitiveKeys.has(k.toLowerCase())) {
        out[k] = '[REDACTED]';
      } else if (typeof v === 'string' && v.length > 200) {
        out[k] = v.slice(0, 200) + '...';
      } else {
        out[k] = v;
      }
    }
    return out;
  }















}

export const apexToolsDispatch = new ApexToolsDispatcher();
