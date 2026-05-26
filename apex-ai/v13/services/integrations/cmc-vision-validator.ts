/**
 * v13.4.277 — CMC Vision Validator (Kevin 2026-05-26 "Go 3 tout auto").
 *
 * Côté Apex du flux Option 3 hybride CMCteams v9.738+ :
 * 1. CMCteams calcule un score de confiance post-import. Si < 90 + image
 *    attachée + clé IA dispo → écrit `cmc_apex_vision_request_<key>` Firebase.
 * 2. Apex écoute via SSE (event `firebase:remote_change`).
 * 3. Lit `cmc_visual_planning_<key>` (image dataUrl), `cmc_ov` (parsed).
 * 4. Appelle Claude Vision avec prompt structuré → JSON par emp/jour.
 * 5. Cross-check vs parsed → liste divergences.
 * 6. Écrit `cmc_apex_vision_result_<key>` → CMCteams affiche modal admin.
 *
 * Throttle : 1 traitement à la fois (mutex global). 5 min cooldown par key.
 * Aucune écriture sur cmc_ov : Apex ne fait que PROPOSER les divergences.
 * Kevin arbitre manuellement (règle CLAUDE.md "aucune invention").
 *
 * Admin only (auth.isAdminSync()). Skip silencieux pour non-admin (Laurence,
 * family, client_pro, client_free).
 */
import { logger } from '../../core/logger.js';
import { events } from '../../core/events.js';
import { auth } from '../auth/auth.js';
import { firebase } from '../storage/firebase.js';
import { vision } from '../ai/vision.js';

/** Préfixe Firebase pour requêtes de validation Vision déclenchées par CMCteams. */
const REQUEST_PREFIX = 'cmc_apex_vision_request_';
/** Préfixe Firebase pour résultats de validation (lu par CMCteams). */
const RESULT_PREFIX = 'cmc_apex_vision_result_';
/** Préfixe Firebase pour visuels planning (image dataUrl). */
const VISUAL_PREFIX = 'cmc_visual_planning_';
/** Cooldown par key (anti-spam). 5 minutes. */
const COOLDOWN_MS = 5 * 60 * 1000;
/** Cap divergences retournées (évite payload trop gros). */
const MAX_DIVERGENCES = 50;

interface VisionRequestPayload {
  ts: number;
  from?: string;
  app_ver?: string;
  key?: string;
  year?: number;
  month?: number;
  visual_attached?: boolean;
  visual_size?: number;
  visual_mime?: string;
  visual_name?: string;
  ov_summary?: {
    emps_with_codes?: number;
    total_active?: number;
  };
  task?: string;
}

interface VisionResultPayload {
  ts: number;
  app_ver: string;
  summary: string;
  divergences: Array<{ emp: string; day: number; visual: string; parsed: string }>;
  vision_emps_total?: number;
  parsed_emps_total?: number;
  error?: string;
}

interface VisualPlanningPayload {
  dataUrl?: string;
  mime?: string;
  name?: string;
  size?: number;
}

interface CmcOverrides {
  [empId: string]: { [day: string]: string };
}

interface CmcEmployee {
  id: string;
  name?: string;
  family?: string;
  active?: boolean;
}

/** Prompt structuré pour reconnaissance planning SBM par Claude Vision. */
const VISION_PROMPT = `Tu es un assistant qui lit des plannings de service du Casino de Monaco (SBM).

Sur l'image jointe, identifie chaque EMPLOYÉ (ligne) et chaque JOUR (colonne 1-31).
Pour chaque cellule, retourne le CODE EXACT lu sur l'image (caractère pour caractère, suffixes ' " * c inclus).

Codes typiques : 20/5, 19/4, 16/22, 14/19, 22/6, 16/3, RH, R, CP, M, AF, RRT, PRT,
12h30/19, 15/19, ou variantes avec suffixe (20/5*, 22/6', 19/4"", 14/19'c, 16/3*).

RÉPONSE STRICTEMENT en JSON valide, format :
{
  "employees": [
    {"name": "BARONE E", "days": {"1": "20/5", "2": "19/4", "3": "16/22", ...}},
    {"name": "AUBERT P", "days": {"1": "19/4", "2": "16/22", ...}},
    ...
  ]
}

RÈGLES STRICTES (Kevin SBM) :
- AUCUNE invention : si une cellule est vide ou illisible, omets le jour (ne mets pas RH/CP par défaut)
- Reproduction EXACTE : préserve les suffixes ' " * c (importants sémantiquement)
- Ne mets PAS de markdown, PAS de texte hors JSON
- Maximum 100 employés (priorise les noms lisibles)`;

interface VisionParsedEmployee {
  name: string;
  days: Record<string, string>;
}

interface VisionParsedResponse {
  employees: VisionParsedEmployee[];
}

class CmcVisionValidator {
  private listenerStarted = false;
  private processing = false;
  private cooldownByKey = new Map<string, number>();

  /**
   * Démarre l'écoute des requêtes Vision depuis CMCteams.
   * Idempotent.
   */
  start(): void {
    if (this.listenerStarted) return;
    this.listenerStarted = true;
    events.on('firebase:remote_change', ({ key, data }) => {
      if (!key || !key.startsWith(REQUEST_PREFIX) || !data) return;
      const monthKey = key.slice(REQUEST_PREFIX.length);
      if (!monthKey) return;
      /* Async fire-and-forget, errors loggées */
      void this.handleRequest(monthKey, data as VisionRequestPayload).catch((err: unknown) => {
        logger.warn('cmc-vision-validator', 'handleRequest failed', { monthKey, err });
      });
    });
    logger.info('cmc-vision-validator', 'started listening on firebase:remote_change');
  }

  /**
   * Traite une requête de validation Vision.
   * Garde-fous : admin only, mutex global, cooldown par key.
   */
  private async handleRequest(monthKey: string, payload: VisionRequestPayload): Promise<void> {
    /* Admin only (isolation Laurence/clients). */
    if (!auth.isAdminSync()) {
      logger.debug('cmc-vision-validator', 'skip: non-admin', { monthKey });
      return;
    }
    /* Cooldown par key. */
    const lastTs = this.cooldownByKey.get(monthKey) ?? 0;
    if (Date.now() - lastTs < COOLDOWN_MS) {
      logger.debug('cmc-vision-validator', `cooldown active for ${monthKey} (${Math.round((Date.now() - lastTs) / 1000)}s ago)`);
      return;
    }
    /* Mutex global : 1 traitement à la fois. */
    if (this.processing) {
      logger.debug('cmc-vision-validator', 'busy, deferring', { monthKey });
      return;
    }
    this.processing = true;
    this.cooldownByKey.set(monthKey, Date.now());
    try {
      await this.processRequest(monthKey, payload);
    } finally {
      this.processing = false;
    }
  }

  /** Pipeline complet : lit visuel + ov, appelle Vision, cross-check, écrit résultat. */
  private async processRequest(monthKey: string, payload: VisionRequestPayload): Promise<void> {
    logger.info('cmc-vision-validator', `processing ${monthKey}`, {
      visual_size: payload.visual_size,
      visual_mime: payload.visual_mime,
    });
    /* Lit l'image visuelle (Firebase ou localStorage). */
    const visual = await this.readVisual(monthKey);
    if (!visual || !visual.dataUrl) {
      await this.writeResult(monthKey, {
        ts: Date.now(),
        app_ver: 'apex',
        summary: 'Erreur : image visuel introuvable pour ' + monthKey,
        divergences: [],
        error: 'visual_not_found',
      });
      return;
    }
    /* Appelle Claude Vision avec prompt structuré. */
    let visionResult: VisionParsedResponse | null = null;
    let visionErr: string | null = null;
    try {
      const vr = await vision.analyze({
        imageBase64: visual.dataUrl,
        prompt: VISION_PROMPT,
        provider: 'anthropic',
      });
      visionResult = this.parseVisionResponse(vr.description);
    } catch (err: unknown) {
      visionErr = err instanceof Error ? err.message : String(err);
      logger.warn('cmc-vision-validator', 'vision.analyze failed', { monthKey, err: visionErr });
    }
    if (!visionResult) {
      await this.writeResult(monthKey, {
        ts: Date.now(),
        app_ver: 'apex',
        summary: 'Vision API : ' + (visionErr ?? 'réponse JSON invalide'),
        divergences: [],
        error: visionErr ?? 'parse_failed',
      });
      return;
    }
    /* Cross-check vs cmc_ov. */
    const overrides = await this.readOverrides(monthKey);
    const employees = await this.readEmployees();
    const { divergences, summary } = this.crossCheck(visionResult, overrides, employees, monthKey);
    /* Écrit résultat. */
    await this.writeResult(monthKey, {
      ts: Date.now(),
      app_ver: 'apex',
      summary,
      divergences: divergences.slice(0, MAX_DIVERGENCES),
      vision_emps_total: visionResult.employees.length,
      parsed_emps_total: Object.keys(overrides).length,
    });
  }

  /** Lit le visuel : Firebase d'abord (sync), fallback localStorage. */
  private async readVisual(monthKey: string): Promise<VisualPlanningPayload | null> {
    const fbKey = VISUAL_PREFIX + monthKey;
    const fbValue = await firebase.read<VisualPlanningPayload | string>(fbKey);
    if (fbValue) {
      if (typeof fbValue === 'string') {
        try {
          return JSON.parse(fbValue) as VisualPlanningPayload;
        } catch {
          return null;
        }
      }
      return fbValue;
    }
    /* Fallback localStorage (si SSE n'a pas encore reçu). */
    try {
      const raw = localStorage.getItem(fbKey);
      if (raw) return JSON.parse(raw) as VisualPlanningPayload;
    } catch { /* ignore */ }
    return null;
  }

  /** Lit cmc_ov (synced) pour comparaison. */
  private async readOverrides(monthKey: string): Promise<CmcOverrides> {
    try {
      const raw = localStorage.getItem('cmc_ov');
      if (!raw) return {};
      const all = JSON.parse(raw) as Record<string, CmcOverrides>;
      return all[monthKey] ?? {};
    } catch {
      return {};
    }
  }

  /** Lit cmc_e (synced) pour mapper nom → id emp. */
  private async readEmployees(): Promise<CmcEmployee[]> {
    try {
      const raw = localStorage.getItem('cmc_e');
      if (!raw) return [];
      return JSON.parse(raw) as CmcEmployee[];
    } catch {
      return [];
    }
  }

  /** Parse la réponse Vision (JSON entre éventuelles backticks markdown). */
  private parseVisionResponse(raw: string): VisionParsedResponse | null {
    if (!raw || typeof raw !== 'string') return null;
    /* Cherche un bloc JSON valide (avec ou sans ```json fences). */
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    const candidate = fenceMatch && fenceMatch[1] ? fenceMatch[1] : raw;
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      const parsed = JSON.parse(candidate.slice(start, end + 1)) as VisionParsedResponse;
      if (!parsed || !Array.isArray(parsed.employees)) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  /** Compare Vision vs cmc_ov[key]. Retourne divergences + summary. */
  private crossCheck(
    vis: VisionParsedResponse,
    overrides: CmcOverrides,
    employees: CmcEmployee[],
    monthKey: string,
  ): { divergences: Array<{ emp: string; day: number; visual: string; parsed: string }>; summary: string } {
    /* Index emp par nom normalisé (NOM + initiale). */
    const empByName = new Map<string, CmcEmployee>();
    function norm(s: string): string {
      return (s || '')
        .toUpperCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[-'’‘.]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    for (const e of employees) {
      if (e.name) empByName.set(norm(e.name), e);
    }
    const divergences: Array<{ emp: string; day: number; visual: string; parsed: string }> = [];
    let matched = 0;
    let cellsCompared = 0;
    let cellsDiverge = 0;
    for (const ve of vis.employees) {
      if (!ve.name || !ve.days) continue;
      const emp = empByName.get(norm(ve.name));
      if (!emp) continue; /* nom vu par Vision mais pas dans roster — skip */
      matched++;
      const parsedRow = overrides[emp.id] ?? {};
      for (const dayStr in ve.days) {
        const day = parseInt(dayStr, 10);
        if (!day || day < 1 || day > 31) continue;
        const visCode = String(ve.days[dayStr] || '').trim();
        const parsedCode = String(parsedRow[String(day)] || '').trim();
        if (!visCode) continue;
        cellsCompared++;
        if (visCode === parsedCode) continue;
        cellsDiverge++;
        if (divergences.length < MAX_DIVERGENCES) {
          divergences.push({
            emp: ve.name,
            day,
            visual: visCode,
            parsed: parsedCode || '(vide)',
          });
        }
      }
    }
    const accuracy = cellsCompared > 0 ? Math.round((1 - cellsDiverge / cellsCompared) * 100) : 0;
    const summary =
      `Apex Vision ${monthKey} : ${vis.employees.length} emps lus, ${matched} matchés au roster, ` +
      `${cellsCompared} cellules comparées, ${cellsDiverge} divergences ` +
      `(${accuracy}% conformité parsed vs visuel).`;
    return { divergences, summary };
  }

  /** Écrit le résultat dans Firebase pour que CMCteams le lise. */
  private async writeResult(monthKey: string, result: VisionResultPayload): Promise<void> {
    const key = RESULT_PREFIX + monthKey;
    try {
      await firebase.write(key, result);
      logger.info('cmc-vision-validator', `result written for ${monthKey}`, {
        divergences: result.divergences.length,
        has_error: !!result.error,
      });
    } catch (err: unknown) {
      logger.warn('cmc-vision-validator', `result write failed for ${monthKey}`, { err });
    }
  }
}

export const cmcVisionValidator = new CmcVisionValidator();

/** Auto-bootstrap (idempotent, appelable depuis bootstrap). */
export function startCmcVisionValidator(): void {
  cmcVisionValidator.start();
}
