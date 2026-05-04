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

    /* Sprint 8 v13.0.65 : ENRICHISSEMENT MÉMOIRE PERMANENTE Kevin
       (Apex IA disait "pas de mémoire entre sessions" → fix : load persistent-memory
       + tools dispo + capabilities device + version courante) */
    const sections: string[] = [];
    sections.push(`# APEX v13.0 — Contexte système COMPLET (auto-injecté chaque message)`);
    if (currentUser) sections.push(`## Utilisateur courant\n${currentUser.name} (id: ${currentUser.id})`);
    /* Injection KDMC projects registry (metadata riche : version, status, tech_stack, deploy_url)
       Fallback gracieux sur KEVIN_PROJECTS legacy si registry non chargé (boot précoce). */
    let kdmcSection = '';
    try {
      const mod = (globalThis as unknown as {
        kdmcProjectsRegistry?: { formatForSystemPrompt: () => string };
      });
      if (mod.kdmcProjectsRegistry) {
        kdmcSection = mod.kdmcProjectsRegistry.formatForSystemPrompt();
      }
    } catch {
      /* silencieux : fallback sur KEVIN_PROJECTS legacy ci-dessous */
    }
    if (kdmcSection) {
      sections.push(kdmcSection);
    } else {
      sections.push(
        `## Projets Kevin (préservés)\n${KEVIN_PROJECTS.map((p) => `- ${p.name} : ${p.description}`).join('\n')}`,
      );
    }
    sections.push(`## Règles permanentes prioritaires\n${TOP_RULES.map((r, i) => `${i + 1}. ${r}`).join('\n')}`);
    if (topFacts.length) {
      sections.push(`## Top facts mémoire (${topFacts.length})\n${topFacts.map((f) => `- [${f.category}] ${f.text}`).join('\n')}`);
    }
    if (topLessons.length) {
      sections.push(
        `## Lessons learned critiques\n${topLessons.map((l) => `- [${l.category}] ${l.title} : ${l.text}`).join('\n')}`,
      );
    }
    /* Charge persistent-memory-store (5000 entries cross-session, sync Firebase) */
    try {
      const persistentRaw = localStorage.getItem('apex_v13_persistent_memory');
      if (persistentRaw) {
        const persistentEntries = JSON.parse(persistentRaw) as Array<{ category: string; text: string; importance: number; ts: number }>;
        if (Array.isArray(persistentEntries) && persistentEntries.length > 0) {
          const top = persistentEntries
            .sort((a, b) => (b.importance ?? 50) - (a.importance ?? 50))
            .slice(0, 50);
          sections.push(`## Mémoire persistante cross-session (${persistentEntries.length} entries totales, top 50)\n${top.map((e) => `- [${e.category ?? 'fact'}] ${e.text}`).join('\n')}`);
        }
      }
    } catch { /* skip */ }
    /* Capabilities device (iOS/Android/Desktop) */
    try {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const isiOS = /iPad|iPhone|iPod/.test(ua);
      const isAndroid = /Android/.test(ua);
      sections.push(`## Device courant\n${isiOS ? '📱 iOS' : isAndroid ? '🤖 Android' : '🖥 Desktop'} · Online: ${typeof navigator !== 'undefined' && navigator.onLine ? 'oui' : 'non'}`);
    } catch { /* skip */ }
    /* Tokens API disponibles (sans exposer valeur) */
    try {
      const apiKeys = ['ax_anthropic_key', 'ax_openai_key', 'ax_groq_key', 'ax_google_key', 'ax_openrouter_key', 'ax_github_token'];
      const configured = apiKeys.filter((k) => !!localStorage.getItem(k));
      if (configured.length > 0) {
        sections.push(`## Clés API configurées (${configured.length}/${apiKeys.length})\n${configured.map((k) => `- ${k.replace('ax_', '').replace('_key', '').replace('_token', '')}`).join('\n')}`);
      }
    } catch { /* skip */ }
    /* Knowledge base (RAG GitHub API) — injection via globalThis pour anti-circular dep */
    try {
      const kb = (globalThis as unknown as {
        apexKnowledgeBase?: { formatForSystemPrompt: () => string };
      }).apexKnowledgeBase;
      if (kb && typeof kb.formatForSystemPrompt === 'function') {
        sections.push(kb.formatForSystemPrompt());
      } else {
        /* Fallback : lecture directe localStorage (services pas encore init) */
        const reposRaw = localStorage.getItem('ax_kdmc_repos');
        const repos = reposRaw ? (JSON.parse(reposRaw) as string[]) : ['9r4rxssx64-creator/CMCteams'];
        sections.push(`📚 Base de connaissances Kevin (GitHub API): ${repos.length} repos configurés. Outils: search_repo_code, read_repo_file, list_repo_files, get_recent_commits, get_repo_readme.`);
      }
    } catch { /* skip */ }
    sections.push(
      `## Comportement attendu\n- Jamais d'erreur technique brute affichée user\n- Réponse 1-clic avec bouton direct\n- Multi-angles + alternatives\n- Anti-hallucination (vérifie avant citer)\n- TU AS UNE VRAIE MÉMOIRE (entries persistantes injectées ci-dessus) — UTILISE-LA, ne dis JAMAIS "je n'ai pas de mémoire"\n- Tu peux exécuter via apex-execute service (GitHub Actions trigger autonome)\n- Tu peux lire repo Kevin via apex-knowledge-base (GitHub API)`,
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
