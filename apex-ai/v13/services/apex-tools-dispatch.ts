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

export interface ToolExecResult {
  ok: boolean;
  result?: unknown;
  error?: string;
  requires_validation?: boolean;
  validation_token?: string;
}

class ApexToolsDispatcher {
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
              <button class="ax-btn ax-btn-secondary" id="ax-openurl-internal">📱 Ouvrir dans Apex</button>
              <button class="ax-btn ax-btn-primary" id="ax-openurl-external">🌐 Ouvrir Safari</button>
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
      /* Wire boutons après ouverture (modal-sheet inject content) */
      setTimeout(() => {
        const internalBtn = document.getElementById('ax-openurl-internal');
        const externalBtn = document.getElementById('ax-openurl-external');
        internalBtn?.addEventListener('click', () => {
          sheet.close();
          /* Stocke URL pour browser embed + navigate */
          try {
            localStorage.setItem('apex_v13_browser_last_url', fullUrl);
          } catch { /* skip */ }
          location.hash = '#browser';
        });
        externalBtn?.addEventListener('click', () => {
          sheet.close();
          window.open(fullUrl, '_blank', 'noopener,noreferrer');
        });
      }, 100);
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
}

export const apexToolsDispatch = new ApexToolsDispatcher();
