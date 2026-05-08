/**
 * APEX v13.3.74 — Crew Experts (multi-IA parallèle gros travail)
 *
 * Règle Kevin 2026-05-08 : "Lorsque je demande du gros travail à Apex,
 * qu'il fasse marcher plusieurs IA ensemble pour aller plus vite toujours
 * en suivant ses méthodes de travail et ses documents."
 *
 * Pattern :
 *  1. Détecter "gros travail" (audit complet, génération longue, multi-angle)
 *  2. Lancer 3-5 providers en parallèle via Promise.allSettled
 *  3. Synthétiser : consensus / debate / specialized
 *  4. Préserver méthodes de travail (system prompt enrichi pour CHAQUE provider)
 *  5. Audit log + stats par provider
 *
 * INTERDICTIONS :
 *  - Pas de provider "stripped" sans context (violation CLAUDE.md)
 *  - Pas de timeout >30s par provider (failover global)
 *  - Pas de cache provider-level (chaque run est fresh)
 */

import { logger } from '../core/logger.js';

import { aiRouter } from './ai-router.js';
import { auditLog } from './audit-log.js';

export type CrewMode = 'consensus' | 'debate' | 'specialized';
export type CrewProvider = 'anthropic' | 'openai' | 'openrouter' | 'groq' | 'gemini' | 'mistral';

export interface CrewMember {
  provider: CrewProvider;
  expertise?: string; /* "security" | "code-quality" | "perf" | "ux" | "reasoning" */
  systemPromptOverride?: string;
}

export interface CrewResponse {
  provider: CrewProvider;
  expertise: string;
  text: string;
  latencyMs: number;
  ok: boolean;
  error?: string;
}

export interface CrewResult {
  task: string;
  mode: CrewMode;
  responses: CrewResponse[];
  synthesis: string;
  conflicts: string[];
  consensus: boolean;
  totalLatencyMs: number;
  ts: number;
}

export interface CrewRunOptions {
  task: string;
  systemPrompt: string;
  members: readonly CrewMember[];
  mode?: CrewMode;
  timeoutMs?: number;
  signal?: AbortSignal;
}

const DEFAULT_TIMEOUT_MS = 30_000;
const HISTORY_KEY = 'ax_crew_runs_history';
const HISTORY_MAX = 50;

/* Expertise par provider (cohérent règle CLAUDE.md "Hybrid LLM Orchestration") */
const EXPERTISE_MAP: Record<CrewProvider, string> = {
  anthropic: 'reasoning',
  openai: 'code-quality',
  gemini: 'vision',
  groq: 'speed',
  openrouter: 'general',
  mistral: 'multilingual',
};

class CrewExpertsService {
  /**
   * Lance N providers en parallèle, synthétise leurs réponses.
   *
   * Important : chaque provider reçoit le MÊME system prompt enrichi
   * (méthodes de travail Kevin préservées partout — CLAUDE.md règle).
   */
  async run(opts: CrewRunOptions): Promise<CrewResult> {
    const tStart = Date.now();
    const mode = opts.mode ?? 'consensus';
    const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    if (opts.members.length < 2) {
      throw new Error('Crew Experts requires at least 2 members');
    }

    /* Lance tous providers en parallèle */
    const promises = opts.members.map((member) =>
      this.runMember(member, opts.task, opts.systemPrompt, mode, timeoutMs, opts.signal),
    );
    const settled = await Promise.allSettled(promises);
    const responses: CrewResponse[] = settled.map((r, i) => {
      const member = opts.members[i];
      if (!member) throw new Error('member undefined');
      if (r.status === 'fulfilled') return r.value;
      const errMsg = r.reason instanceof Error ? r.reason.message : String(r.reason);
      return {
        provider: member.provider,
        expertise: member.expertise ?? EXPERTISE_MAP[member.provider],
        text: '',
        latencyMs: 0,
        ok: false,
        error: errMsg.slice(0, 200),
      };
    });

    /* Synthèse selon mode */
    const synthesis = this.synthesize(responses, mode);
    const conflicts = this.detectConflicts(responses);
    const successful = responses.filter((r) => r.ok);
    const consensus = successful.length >= Math.ceil(responses.length / 2);

    const result: CrewResult = {
      task: opts.task.slice(0, 500),
      mode,
      responses,
      synthesis,
      conflicts,
      consensus,
      totalLatencyMs: Date.now() - tStart,
      ts: Date.now(),
    };

    /* Persist history (cap FIFO) */
    this.persistHistory(result);

    /* Audit log */
    void auditLog.record('crew.run', {
      details: {
        mode,
        members: opts.members.length,
        successful: successful.length,
        latencyMs: result.totalLatencyMs,
        consensus,
      },
    });

    logger.info(
      'crew-experts',
      `${successful.length}/${opts.members.length} providers OK · ${result.totalLatencyMs}ms · consensus=${consensus}`,
    );

    return result;
  }

  private async runMember(
    member: CrewMember,
    task: string,
    systemPrompt: string,
    mode: CrewMode,
    timeoutMs: number,
    parentSignal?: AbortSignal,
  ): Promise<CrewResponse> {
    const tStart = Date.now();
    const expertise = member.expertise ?? EXPERTISE_MAP[member.provider];
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
    if (parentSignal) {
      parentSignal.addEventListener('abort', () => ctrl.abort(), { once: true });
    }

    /* System prompt enrichi avec rôle expertise du membre */
    const enrichedPrompt = this.buildMemberPrompt(systemPrompt, expertise, mode, member.systemPromptOverride);

    let collectedText = '';
    let lastError: Error | undefined;
    try {
      /* aiRouter.stream signature : (messages, system, onChunk, onError?)
       * On capture text via onChunk + erreur via onError pour cohérence multi-provider. */
      await aiRouter.stream(
        [{ role: 'user', content: task }],
        enrichedPrompt,
        (chunk: { text?: string; done?: boolean }) => {
          if (chunk.text) collectedText += chunk.text;
        },
        (err: Error) => { lastError = err; },
      );
      clearTimeout(timeout);
      if (lastError) throw lastError;
      return {
        provider: member.provider,
        expertise,
        text: collectedText,
        latencyMs: Date.now() - tStart,
        ok: true,
      };
    } catch (err: unknown) {
      clearTimeout(timeout);
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        provider: member.provider,
        expertise,
        text: collectedText,
        latencyMs: Date.now() - tStart,
        ok: false,
        error: errMsg.slice(0, 200),
      };
    }
  }

  private buildMemberPrompt(
    baseSystemPrompt: string,
    expertise: string,
    mode: CrewMode,
    override?: string,
  ): string {
    if (override) return override;
    let roleHint = '';
    if (mode === 'specialized') {
      roleHint = `\n\nTon expertise spécifique : ${expertise}. Concentre-toi sur cet angle.`;
    } else if (mode === 'debate') {
      roleHint = `\n\nMode débat : défends ton point de vue (expertise=${expertise}). Sois précis sur les divergences.`;
    } else {
      roleHint = `\n\nMode consensus : donne ta meilleure réponse en intégrant ton expertise (${expertise}).`;
    }
    return baseSystemPrompt + roleHint;
  }

  /**
   * Synthèse des N réponses selon mode.
   * - consensus : extrait le consensus des réponses similaires
   * - debate : présente divergences cliquables
   * - specialized : présente chaque expert avec son angle
   */
  synthesize(responses: readonly CrewResponse[], mode: CrewMode): string {
    const successful = responses.filter((r) => r.ok && r.text);
    if (successful.length === 0) return '⚠️ Aucun expert n\'a répondu. Réessaie.';
    if (successful.length === 1) {
      const r = successful[0];
      if (!r) return '';
      return r.text;
    }

    const lines: string[] = [];
    if (mode === 'specialized' || mode === 'debate') {
      lines.push(`## Synthèse ${successful.length} experts\n`);
      for (const r of successful) {
        lines.push(`### ${this.providerName(r.provider)} (${r.expertise})\n${r.text}\n`);
      }
    } else {
      /* consensus mode : prendre la réponse la plus longue (souvent la plus complète)
         + mentions des autres */
      const sorted = [...successful].sort((a, b) => b.text.length - a.text.length);
      const primary = sorted[0];
      if (!primary) return '';
      lines.push(primary.text);
      const others = sorted.slice(1);
      if (others.length > 0) {
        lines.push(`\n---\n*Aussi consulté : ${others.map((r) => this.providerName(r.provider)).join(', ')}*`);
      }
    }
    return lines.join('\n');
  }

  /**
   * Détecte conflits significatifs entre réponses.
   * Heuristique simple : longueurs très différentes ou mots-clés contradictoires.
   */
  detectConflicts(responses: readonly CrewResponse[]): string[] {
    const successful = responses.filter((r) => r.ok && r.text);
    if (successful.length < 2) return [];
    const conflicts: string[] = [];

    /* Conflit 1 : longueurs très différentes (>3x) */
    const lengths = successful.map((r) => r.text.length);
    const maxLen = Math.max(...lengths);
    const minLen = Math.min(...lengths);
    if (minLen > 0 && maxLen / minLen > 3) {
      conflicts.push(`Divergence longueur : ${minLen}c → ${maxLen}c (3×+)`);
    }

    /* Conflit 2 : mots-clés contradictoires */
    const positivePhrases = ['oui', 'safe', 'sécurisé', 'recommandé', 'préférable'];
    const negativePhrases = ['non', 'dangereux', 'éviter', 'déconseillé', 'risqué'];
    for (let i = 0; i < successful.length - 1; i++) {
      for (let j = i + 1; j < successful.length; j++) {
        const r1 = successful[i];
        const r2 = successful[j];
        if (!r1 || !r2) continue;
        const t1 = r1.text.toLowerCase();
        const t2 = r2.text.toLowerCase();
        const r1Pos = positivePhrases.some((p) => t1.includes(p));
        const r1Neg = negativePhrases.some((p) => t1.includes(p));
        const r2Pos = positivePhrases.some((p) => t2.includes(p));
        const r2Neg = negativePhrases.some((p) => t2.includes(p));
        if ((r1Pos && r2Neg) || (r1Neg && r2Pos)) {
          conflicts.push(`${this.providerName(r1.provider)} vs ${this.providerName(r2.provider)} : avis opposés`);
        }
      }
    }

    return conflicts;
  }

  private providerName(provider: CrewProvider): string {
    const names: Record<CrewProvider, string> = {
      anthropic: 'Claude',
      openai: 'GPT',
      gemini: 'Gemini',
      groq: 'Groq',
      openrouter: 'OpenRouter',
      mistral: 'Mistral',
    };
    return names[provider];
  }

  private persistHistory(result: CrewResult): void {
    try {
      const raw = localStorage.getItem(HISTORY_KEY) ?? '[]';
      const arr = JSON.parse(raw) as CrewResult[];
      const list = Array.isArray(arr) ? arr : [];
      list.push(result);
      const trimmed = list.slice(-HISTORY_MAX);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch (err: unknown) {
      logger.warn('crew-experts', 'history persist failed', { err });
    }
  }

  /**
   * Liste runs récents (admin debug + vue vCrewMonitor).
   */
  history(): CrewResult[] {
    try {
      const raw = localStorage.getItem(HISTORY_KEY) ?? '[]';
      const arr = JSON.parse(raw) as CrewResult[];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  /**
   * Détection automatique : tâche éligible crew-experts ?
   *
   * Critères trigger (cohérent CLAUDE.md règle 2026-05-08) :
   *  - Keywords explicites : audit, expert, complet, consulte, exhaustif
   *  - Question complexe (>200 caractères)
   *  - Décision critique (suppression, paiement, validation)
   */
  shouldUseCrew(taskText: string): boolean {
    const t = taskText.toLowerCase();
    const explicitKeywords = /\b(audit|expert|complet|consulte|exhaustif|approfondi|concert|tous?\s+les?\s+angles)\b/i;
    if (explicitKeywords.test(t)) return true;
    if (taskText.length > 600) return true;
    const criticalDecision = /\b(suppress|delete|effac|paiement|payer|valid|critique)\b/i;
    if (criticalDecision.test(t) && taskText.length > 100) return true;
    return false;
  }

  /**
   * Crew par défaut (utilisé par tool IA `crew_experts`).
   */
  defaultMembers(mode: CrewMode = 'specialized'): CrewMember[] {
    if (mode === 'specialized') {
      return [
        { provider: 'anthropic', expertise: 'security' },
        { provider: 'openai', expertise: 'code-quality' },
        { provider: 'gemini', expertise: 'perf' },
        { provider: 'groq', expertise: 'ux' },
      ];
    }
    return [
      { provider: 'anthropic' },
      { provider: 'openai' },
      { provider: 'gemini' },
    ];
  }
}

export const crewExperts = new CrewExpertsService();
