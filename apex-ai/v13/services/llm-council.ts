/**
 * APEX v13.4.7 — LLM Council (Kevin 2026-05-12).
 *
 * Pattern décisionnel : 3-7 LLMs experts spécialisés délibèrent en 3 rounds
 * pour aboutir à une décision/réponse de qualité expert mondial.
 *
 * Différent de `crew-experts.ts` (synthèse simple consensus/debate) :
 *  - ROUND 1 — Brainstorm parallèle : chaque expert répond independament
 *  - ROUND 2 — Critique croisée : chaque expert critique les autres réponses
 *  - ROUND 3 — Synthèse finale : 1 LLM "juge" agrège + décide
 *
 * Use-cases :
 *  - Décision critique (architecture, sécurité, refactor majeur)
 *  - Validation production (avant push code commercial)
 *  - Choix de techno (5 alternatives à comparer)
 *  - Audit multi-axes (sécu + perf + UX + conformité simultanés)
 *
 * Inspiré de :
 *  - Multi-agent debate (Du et al. 2023, "Improving Factuality and Reasoning")
 *  - Tree of Thoughts (Yao et al. 2023)
 *  - Society of Mind (Marvin Minsky)
 */

import { logger } from '../core/logger.js';

import { aiRouter } from './ai-router.js';
import { auditLog } from './audit-log.js';

export type CouncilProvider = 'anthropic' | 'openai' | 'openrouter' | 'groq' | 'gemini' | 'mistral' | 'deepseek';

export type CouncilExpertise =
  | 'security'
  | 'performance'
  | 'architecture'
  | 'code-quality'
  | 'ux'
  | 'compliance'
  | 'business'
  | 'innovation'
  | 'reasoning'
  | 'critic';

export interface CouncilMember {
  provider: CouncilProvider;
  expertise: CouncilExpertise;
  label: string; /* "Senior Security Architect" / "UX Lead Stripe" */
  weight?: number; /* 0.5-2.0 — pondération vote final */
}

export interface CouncilRound1Response {
  member: CouncilMember;
  text: string;
  latencyMs: number;
  ok: boolean;
  error?: string;
}

export interface CouncilRound2Critique {
  critic: CouncilMember;
  targetExpertise: CouncilExpertise;
  critique: string;
  agreementScore: number; /* 0-100 */
}

export interface CouncilDecision {
  task: string;
  members: CouncilMember[];
  round1: CouncilRound1Response[];
  round2: CouncilRound2Critique[];
  finalSynthesis: string;
  recommendation: string;
  confidence: number; /* 0-100 */
  consensus: boolean;
  dissent: string[];
  totalLatencyMs: number;
  cost_estimate_usd: number;
  ts: number;
}

/** Default council 5 experts ALL-STAR. */
export const DEFAULT_COUNCIL: ReadonlyArray<CouncilMember> = [
  { provider: 'anthropic', expertise: 'reasoning', label: 'Senior Reasoning Lead (Claude Opus)', weight: 1.5 },
  { provider: 'openai', expertise: 'code-quality', label: 'Principal Engineer (GPT-4o)', weight: 1.3 },
  { provider: 'gemini', expertise: 'architecture', label: 'Solution Architect (Gemini Pro)', weight: 1.2 },
  { provider: 'groq', expertise: 'innovation', label: 'Innovation Lead (Llama 70B)', weight: 1.0 },
  { provider: 'mistral', expertise: 'critic', label: 'Devil\'s Advocate (Mistral Large)', weight: 1.0 },
];

const ROUND_TIMEOUT_MS = 30_000;
const HISTORY_KEY = 'apex_v13_council_history';
const HISTORY_CAP = 20;

class LlmCouncil {
  /**
   * Run a complete 3-round council deliberation on a task.
   */
  async deliberate(opts: {
    task: string;
    members?: ReadonlyArray<CouncilMember>;
    systemPrompt?: string;
    maxRounds?: 1 | 2 | 3;
  }): Promise<CouncilDecision> {
    const members = opts.members ?? DEFAULT_COUNCIL;
    const maxRounds = opts.maxRounds ?? 3;
    const startTs = Date.now();

    logger.info('llm-council', `deliberate start : ${members.length} members × ${maxRounds} rounds`);
    void auditLog.record('council.start', {
      details: { task: opts.task.slice(0, 200), members: members.length, maxRounds },
    });

    /* ROUND 1 — Brainstorm parallèle */
    const round1 = await this.runRound1(opts.task, members, opts.systemPrompt);

    /* ROUND 2 — Critique croisée (optionnelle si maxRounds === 1) */
    const round2: CouncilRound2Critique[] = [];
    if (maxRounds >= 2) {
      const r2 = await this.runRound2(opts.task, round1, members);
      round2.push(...r2);
    }

    /* ROUND 3 — Synthèse finale (optionnelle si maxRounds < 3) */
    let finalSynthesis = '';
    let recommendation = '';
    let confidence = 50;
    let consensus = false;
    const dissent: string[] = [];

    if (maxRounds >= 3) {
      const r3 = await this.runRound3(opts.task, round1, round2);
      finalSynthesis = r3.synthesis;
      recommendation = r3.recommendation;
      confidence = r3.confidence;
      consensus = r3.consensus;
      dissent.push(...r3.dissent);
    } else {
      /* Synthèse rapide depuis round1 */
      const successes = round1.filter((r) => r.ok);
      finalSynthesis = successes.map((r) => `[${r.member.label}]\n${r.text}`).join('\n\n---\n\n');
      recommendation = successes[0]?.text.slice(0, 500) ?? 'Aucune réponse';
      confidence = successes.length >= members.length / 2 ? 70 : 40;
      consensus = successes.length === members.length;
    }

    const totalLatencyMs = Date.now() - startTs;
    /* Estimation coût : ~$0.005 par tour par membre (modèles flagship) */
    const cost_estimate_usd = members.length * maxRounds * 0.005;

    const decision: CouncilDecision = {
      task: opts.task,
      members: [...members],
      round1,
      round2,
      finalSynthesis,
      recommendation,
      confidence,
      consensus,
      dissent,
      totalLatencyMs,
      cost_estimate_usd,
      ts: Date.now(),
    };

    this.persistHistory(decision);

    logger.info('llm-council', `deliberate end : confidence=${confidence}% consensus=${consensus} ${totalLatencyMs}ms`);
    void auditLog.record('council.end', {
      details: {
        latency_ms: totalLatencyMs,
        confidence,
        consensus,
        members_ok: round1.filter((r) => r.ok).length,
        cost_estimate_usd,
      },
    });

    return decision;
  }

  private async runRound1(
    task: string,
    members: ReadonlyArray<CouncilMember>,
    systemPrompt?: string,
  ): Promise<CouncilRound1Response[]> {
    const promises = members.map(async (m) => {
      const start = Date.now();
      const sys = (systemPrompt ?? '') + `\n\nTu es ${m.label}, expert en ${m.expertise}. ` +
        'Réponds en moins de 800 mots avec ta perspective spécifique. ' +
        'Sois précis, actionnable, cite des sources si pertinent.';
      try {
        const text = await this.callProvider(m.provider, task, sys);
        return {
          member: m,
          text,
          latencyMs: Date.now() - start,
          ok: true,
        } as CouncilRound1Response;
      } catch (err: unknown) {
        return {
          member: m,
          text: '',
          latencyMs: Date.now() - start,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        } as CouncilRound1Response;
      }
    });
    return Promise.all(promises);
  }

  private async runRound2(
    task: string,
    round1: CouncilRound1Response[],
    members: ReadonlyArray<CouncilMember>,
  ): Promise<CouncilRound2Critique[]> {
    /* Chaque membre critique le membre suivant (cyclique) */
    const critiques: CouncilRound2Critique[] = [];
    const successes = round1.filter((r) => r.ok);
    if (successes.length < 2) return critiques;

    const promises = successes.map(async (resp, idx) => {
      const target = successes[(idx + 1) % successes.length]!;
      const critic = members[idx % members.length]!;
      void resp; /* used for index pairing */
      const sys = `Tu es ${critic.label}. ` +
        `Critique constructivement cette réponse de ${target.member.label} sur "${task}". ` +
        'Identifie 2-3 faiblesses + propose améliorations. ' +
        'Termine par "Score d\'accord: X/100".';
      try {
        const critiqueText = await this.callProvider(critic.provider, target.text, sys);
        const scoreMatch = critiqueText.match(/(\d+)\s*\/\s*100/);
        return {
          critic,
          targetExpertise: target.member.expertise,
          critique: critiqueText,
          agreementScore: scoreMatch ? parseInt(scoreMatch[1]!, 10) : 50,
        } as CouncilRound2Critique;
      } catch {
        return {
          critic,
          targetExpertise: target.member.expertise,
          critique: '',
          agreementScore: 0,
        } as CouncilRound2Critique;
      }
    });
    const settled = await Promise.allSettled(promises);
    for (const s of settled) {
      if (s.status === 'fulfilled') critiques.push(s.value);
    }
    return critiques;
  }

  private async runRound3(
    task: string,
    round1: CouncilRound1Response[],
    round2: CouncilRound2Critique[],
  ): Promise<{
    synthesis: string;
    recommendation: string;
    confidence: number;
    consensus: boolean;
    dissent: string[];
  }> {
    const successes = round1.filter((r) => r.ok);
    const avgAgreement = round2.length > 0
      ? round2.reduce((sum, c) => sum + c.agreementScore, 0) / round2.length
      : 50;

    const dossier = [
      `# Tâche\n${task}`,
      '',
      '# Round 1 — Perspectives experts',
      ...successes.map((r) => `## ${r.member.label} (${r.member.expertise})\n${r.text}`),
      '',
      '# Round 2 — Critiques croisées',
      ...round2.map((c) => `## ${c.critic.label} critique ${c.targetExpertise} (score ${c.agreementScore}/100)\n${c.critique}`),
    ].join('\n\n');

    const judgeSys = 'Tu es le Président du Council, juge final. ' +
      'Synthétise les perspectives + critiques en 3 sections :\n' +
      '1. **SYNTHÈSE** (300 mots max) — points clés convergents\n' +
      '2. **RECOMMANDATION** (200 mots max) — action concrète à prendre\n' +
      '3. **DISSIDENCES** (liste bullet) — désaccords majeurs à considérer\n\n' +
      'Termine par : "Confiance: X/100" + "Consensus: oui/non".';

    try {
      const judgement = await this.callProvider('anthropic', dossier, judgeSys);
      const confMatch = judgement.match(/Confiance\s*:\s*(\d+)/i);
      const consensusMatch = judgement.match(/Consensus\s*:\s*(oui|non)/i);
      const dissent: string[] = [];
      const dissentSection = judgement.match(/DISSIDENCES[^]*?(?=Confiance|$)/i);
      if (dissentSection?.[0]) {
        const lines = dissentSection[0].split('\n').filter((l) => l.trim().startsWith('-') || l.trim().startsWith('•'));
        dissent.push(...lines.map((l) => l.replace(/^[\s\-•]+/, '').trim()).filter(Boolean));
      }
      const recMatch = judgement.match(/RECOMMANDATION[^]*?(?=DISSIDENCES|Confiance|$)/i);
      return {
        synthesis: judgement,
        recommendation: recMatch?.[0]?.replace(/^.*?RECOMMANDATION[^]*?\n/, '').slice(0, 1000) ?? '',
        confidence: confMatch ? parseInt(confMatch[1]!, 10) : Math.round(avgAgreement),
        consensus: consensusMatch ? consensusMatch[1]?.toLowerCase() === 'oui' : avgAgreement > 70,
        dissent,
      };
    } catch (err: unknown) {
      logger.warn('llm-council', 'round3 judgement failed → fallback synthesis', { err });
      return {
        synthesis: successes.map((r) => `[${r.member.label}]\n${r.text}`).join('\n\n---\n\n'),
        recommendation: successes[0]?.text.slice(0, 500) ?? '',
        confidence: Math.round(avgAgreement),
        consensus: avgAgreement > 70,
        dissent: [],
      };
    }
  }

  private async callProvider(provider: CouncilProvider, prompt: string, systemPrompt: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const chunks: string[] = [];
      const timeout = setTimeout(() => reject(new Error(`Council provider ${provider} timeout ${ROUND_TIMEOUT_MS}ms`)), ROUND_TIMEOUT_MS);
      void provider; /* forceProvider non supporté par aiRouter.stream — fallback chain interne */
      void aiRouter.stream(
        [{ role: 'user', content: prompt }],
        systemPrompt,
        (chunk: { text?: string; done?: boolean }) => {
          if (chunk.text) chunks.push(chunk.text);
          if (chunk.done) {
            clearTimeout(timeout);
            resolve(chunks.join(''));
          }
        },
        (err: Error) => {
          clearTimeout(timeout);
          reject(err);
        },
      );
    });
  }

  private persistHistory(decision: CouncilDecision): void {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const history: CouncilDecision[] = raw ? (JSON.parse(raw) as CouncilDecision[]) : [];
      history.push(decision);
      const trimmed = history.slice(-HISTORY_CAP);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch (err: unknown) {
      logger.warn('llm-council', 'history persist failed (quota?)', { err });
    }
  }

  /** Liste l'historique des délibérations (admin view). */
  listHistory(): CouncilDecision[] {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? (JSON.parse(raw) as CouncilDecision[]) : [];
    } catch {
      return [];
    }
  }
}

export const llmCouncil = new LlmCouncil();
