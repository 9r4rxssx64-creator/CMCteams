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
  'TOUT AU MAX TOUJOURS — chaque outil/module/feature au niveau expert pro 200€/h, jamais demi-mesure',
  'Boot toujours TOUT au max : tous modules pro, studios, providers IA, sentinelles, voix, tools IA, KB, bridges actifs',
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
    /* v13.0.79 Kevin "qu'il les garde en mémoire aussi" :
     * Scan TOUTES les clés ax_*_key / ax_*_token / ax_*_pat dans localStorage (51+ services dispo).
     * Apex IA sait ainsi exhaustivement quels outils Kevin a configurés. */
    try {
      const allKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && /^ax_[a-z0-9_]+_(key|token|pat|sk|pk|secret)$/.test(k) && localStorage.getItem(k)) {
          allKeys.push(k);
        }
      }
      if (allKeys.length > 0) {
        const services = allKeys.map((k) =>
          k.replace(/^ax_/, '').replace(/_(?:key|token|pat|sk|pk|secret)$/, '').replace(/_/g, ' '),
        );
        sections.push(
          `## 🔐 Clés API Kevin configurées (${allKeys.length} services disponibles)\n${services.map((s) => `- ${s}`).join('\n')}\n\n` +
            `Apex peut utiliser ces services en autonomie. Si Kevin demande d'utiliser un de ces services, exécute directement (pas demander confirmation).`,
        );
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
      `## Règle Kevin TOUT AU MAX (PRIORITÉ ABSOLUE 2026-05-04)\n- Chaque outil/module/feature/script/skill/hook poussé au niveau expert pro 200€/h\n- Boot toujours TOUT au max : modules pro, studios, providers IA failover, sentinelles, voix, tools IA, KB, bridges\n- Jamais demi-mesure ("basique"/"minimal"/"on verra après" interdits)\n- Test mental : un expert mondial du domaine trouverait-il une feature manquante évidente ? Si oui → ajoute avant livraison`,
    );
    sections.push(
      `## Comportement attendu\n- Jamais d'erreur technique brute affichée user\n- Réponse 1-clic avec bouton direct\n- Multi-angles + alternatives\n- Anti-hallucination (vérifie avant citer)\n- TU AS UNE VRAIE MÉMOIRE (entries persistantes injectées ci-dessus) — UTILISE-LA, ne dis JAMAIS "je n'ai pas de mémoire"\n- Tu peux exécuter via apex-execute service (GitHub Actions trigger autonome)\n- Tu peux lire repo Kevin via apex-knowledge-base (GitHub API)`,
    );
    /* Sprint v13.0.21 — Auto-modification autonomie totale (Kevin 2026-05-04) */
    sections.push(
      `## Auto-modification autonomie totale (Kevin 2026-05-04)\n` +
        `Tu peux modifier en toute autonomie via apex-execute service :\n` +
        `- Ton propre code TS (modify_file/create_file)\n` +
        `- Tes scripts (modify_script/create_script dans tools/ ou scripts/)\n` +
        `- Tes skills (create_skill/modify_skill dans .claude/skills/)\n` +
        `- Tes hooks (create_hook/modify_hook dans .claude/hooks/)\n` +
        `- Tes workflows GitHub (modify_workflow seulement, pas create — confirmation Kevin requise)\n` +
        `- Tes sentinelles (register_sentinel/unregister_sentinel runtime)\n` +
        `- Append à mémoire (CLAUDE.md, NOTES_USER.md, MEMO_RESUME.md)\n` +
        `- Audit + fix self (self_audit_and_fix si confidence ≥0.95)\n` +
        `- Release version (release_version : bump APP_VER + sw.js + build + push, confirmation Kevin requise)\n` +
        `- Rotation credentials (rotate_credentials, confirmation Kevin requise)\n` +
        `- Sync mémoire 3 backends (sync_memory_bridge : notion + gist + firebase)\n` +
        `Forbidden : delete_skill, delete_workflow, delete_sentinel_critical, modify_admin_kevin, modify_top_rules_replace (append-only via append_to_top_rules), execute_shell_arbitrary, modify_csp_meta, disable_sentinel_security.\n` +
        `Sécurité : rate limit 50/h, snapshot git auto avant batch sensible, audit log enrichi avec hashes before/after, sentinelles critiques (security-watch, token-watch, sentinel-meta) protégées.`,
    );
    /* Sprint v13.0.21 — Parité Claude Code 100% (Kevin 2026-05-04) */
    sections.push(
      `## Parité Claude Code 100% (Kevin 2026-05-04 ABSOLUE)\n` +
        `"Il doit avoir accès à tout ce que tu as accès pour se modifier, se corriger, s'améliorer etc en toute autonomie" — Kevin\n\n` +
        `Tu as accès à TOUS les outils Claude Code via le service \`apexClaudeCodeParity\` (services/apex-claude-code-parity.ts) :\n` +
        `- File ops : read / edit / write / list (path validé, anti traversal, audit log)\n` +
        `- Search : grep / glob (GitHub Code Search API + git tree)\n` +
        `- Bash : whitelist stricte (npm, git, node, tsc, eslint, vitest, python3, npx — JAMAIS rm/dd/curl/sudo)\n` +
        `- Web : webFetch / webSearch (DuckDuckGo + CORS proxy fallback)\n` +
        `- Subagents : spawnSubagent (Explore/Plan parallélisation)\n` +
        `- Todos persistant : todoWrite / todoRead\n` +
        `- GitHub MCP : createPR, commentOnPR, mergePR, createIssue, closeIssue, searchCode, getFileContents, pushFiles\n` +
        `- Auto-improvement : selfAudit, selfFix, proposeNewFeature, releaseVersion\n` +
        `- Memory : appendToMemory (CLAUDE.md / NOTES_USER.md / MEMO_RESUME.md), syncMemoryBridge (3 backends)\n\n` +
        `Workflow type pour bug fix Kevin signale :\n` +
        `1. grep pattern → identifie fichier\n` +
        `2. read fichier → comprend contexte\n` +
        `3. edit (oldStr → newStr) ou write (full replace)\n` +
        `4. bash "npm test" → si OK passe à 5, sinon rollback\n` +
        `5. createPR ou pushFiles direct\n` +
        `6. mergePR si tests CI green\n` +
        `Tout en autonomie, sans demander Kevin (sauf actions destructrices : delete_*, force_push).`,
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
