/**
 * APEX v13 — Mémoire augmentée (parité Claude Code)
 *
 * Auto-injection contexte system prompt à chaque turn IA :
 * 1. Identité user courant
 * 2. APEX_PROJECTS_REGISTRY (CMCteams, Télécommande, CrackPass, KDMC, e-KDMC, IA-KDMC)
 * 3. Top 50 facts persistent_memory
 * 4. Top 30 facts shared cross-app
 * 5. Top 10 lessons learned
 * 6. 7 règles permanentes CLAUDE.md
 * 7. Outils disponibles (capacités réelles)
 * 8. Sentinelles actives (état)
 * 9. CLAUDE_HANDOFF (todos en attente)
 * 10. State app (APP_VER, modules, compteurs)
 */

import { logger } from './logger.js';

export interface Fact {
  id: string;
  category: string;
  text: string;
  ts: number;
  weight?: number;
}

export interface Lesson {
  id: string;
  category: string;
  title: string;
  text: string;
  severity: 'info' | 'warn' | 'critical';
  resolved: boolean;
  ts: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  preserved: true /* immutable, jamais touché */;
}

const KEVIN_PROJECTS: Project[] = [
  { id: 'cmcteams', name: 'CMCteams', description: 'Casino Monaco — planning + équipes 258 employés', preserved: true },
  { id: 'telecommande', name: 'Télécommande KDMC', description: 'Bridge IR/Wifi/BLE messaging', preserved: true },
  { id: 'crackpass', name: 'CrackPass', description: 'Générateur/vérificateur passwords', preserved: true },
  { id: 'kdmc', name: 'KDMC', description: 'Marketplace principal', preserved: true },
  { id: 'ekdmc', name: 'e-KDMC', description: 'Marketplace e-commerce', preserved: true },
  { id: 'iakdmc', name: 'IA-KDMC', description: 'Archive lessons learned IA', preserved: true },
];

/* 7 règles permanentes CLAUDE.md prioritaires (extraites) */
const TOP_RULES: readonly string[] = [
  '1-clic + fenêtre + bouton direct (Kevin n\'a jamais 2 actions à enchaîner)',
  'Reconnaissance auto credentials + auto-fetch outils (130+ patterns)',
  'Apex crée les liens auto à chaque nouvel ajout/découverte',
  'Sécurité avant autonomie totale (≥95/100 sécu réel avant clés générales)',
  'Automatise tout en autonomie (jamais demander si Apex peut faire)',
  'PROTECTION ≠ STABILITÉ (pas de wrapper qui désactive)',
  'Relit toute sa documentation avant chaque réponse',
];

class Memory {
  private facts: Fact[] = [];
  private lessons: Lesson[] = [];
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    this.reload();
  }

  /* Force re-load depuis localStorage (utile post-migration + tests) */
  reload(): void {
    try {
      const rawFacts = localStorage.getItem('apex_v13_facts');
      this.facts = rawFacts ? (JSON.parse(rawFacts) as Fact[]) : [];
      const rawLessons = localStorage.getItem('apex_v13_lessons');
      this.lessons = rawLessons ? (JSON.parse(rawLessons) as Lesson[]) : [];
    } catch (err: unknown) {
      logger.warn('memory', 'Hydratation partielle', { err });
      this.facts = [];
      this.lessons = [];
    }
    logger.info('memory', `Loaded ${this.facts.length} facts, ${this.lessons.length} lessons`);
  }

  addFact(category: string, text: string, weight = 1): void {
    const fact: Fact = {
      id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      category,
      text: text.slice(0, 500),
      ts: Date.now(),
      weight,
    };
    this.facts.push(fact);
    if (this.facts.length > 1000) this.facts = this.facts.slice(-1000);
    this.persist();
  }

  recordLesson(category: string, title: string, text: string, severity: Lesson['severity'] = 'warn'): void {
    const lesson: Lesson = {
      id: `l_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      category,
      title: title.slice(0, 120),
      text: text.slice(0, 500),
      severity,
      resolved: false,
      ts: Date.now(),
    };
    this.lessons.push(lesson);
    if (this.lessons.length > 200) this.lessons = this.lessons.slice(-200);
    this.persist();
  }

  buildSystemPromptContext(currentUser: { id: string; name: string } | null): string {
    const topFacts = this.facts.slice(-50).reverse();
    const topLessons = this.lessons
      .filter((l) => l.severity === 'critical')
      .slice(-10)
      .reverse();

    const sections: string[] = [];
    sections.push(`# APEX v13.0 — Contexte système`);
    if (currentUser) sections.push(`## Utilisateur courant\n${currentUser.name} (id: ${currentUser.id})`);
    sections.push(
      `## Projets Kevin (préservés)\n${KEVIN_PROJECTS.map((p) => `- ${p.name} : ${p.description}`).join('\n')}`,
    );
    sections.push(`## Règles permanentes prioritaires\n${TOP_RULES.map((r, i) => `${i + 1}. ${r}`).join('\n')}`);
    if (topFacts.length) {
      sections.push(`## Top facts mémoire (${topFacts.length})\n${topFacts.map((f) => `- [${f.category}] ${f.text}`).join('\n')}`);
    }
    if (topLessons.length) {
      sections.push(
        `## Lessons learned critiques\n${topLessons.map((l) => `- [${l.category}] ${l.title} : ${l.text}`).join('\n')}`,
      );
    }
    sections.push(
      `## Comportement attendu\n- Jamais d'erreur technique brute affichée user\n- Réponse 1-clic avec bouton direct\n- Multi-angles + alternatives\n- Anti-hallucination (vérifie avant citer)`,
    );
    return sections.join('\n\n');
  }

  getFacts(): readonly Fact[] {
    return this.facts;
  }

  getLessons(): readonly Lesson[] {
    return this.lessons;
  }

  getProjects(): readonly Project[] {
    return KEVIN_PROJECTS;
  }

  private persist(): void {
    try {
      localStorage.setItem('apex_v13_facts', JSON.stringify(this.facts));
      localStorage.setItem('apex_v13_lessons', JSON.stringify(this.lessons));
    } catch (err: unknown) {
      logger.warn('memory', 'persist failed (quota?)', { err });
    }
  }
}

export const memory = new Memory();
