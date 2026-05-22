/**
 * APEX v13 — Tools registry : Skills category.
 *
 * Tools exposés à Apex IA pour invoquer les skills 2026 :
 * - Generators : Docx, Pptx, Xlsx, Pdf
 * - Video : video_edit, video_compose_hyperframes
 * - Méta : skill_factory_create, security_review, code_review
 * - Design : design_system, marketing_copy
 * - MCP : mcp_bofip_search, mcp_almanac_research, mcp_legal_search
 *
 * Auto-utilisation par Apex IA selon intent détecté dans le chat user.
 */

import type { ApexTool } from '../core-svc/apex-tools-types.js';

export const SKILLS_TOOLS: readonly ApexTool[] = [
  /* ─────────── Document Generators ─────────── */
  {
    name: 'generate_docx',
    description:
      'Génère un fichier Word .docx téléchargeable directement dans le chat. Templates: letter-formal, contract-cdi, contract-nda, cv-modern, meeting-minutes, report-monthly, custom. AUTO-UTILISER quand user demande "lettre", "contrat", "CV", "compte-rendu", "rapport", "document Word". JAMAIS répondre en markdown si docx demandé.',
    inputSchema: {
      type: 'object',
      properties: {
        template: {
          type: 'string',
          enum: ['letter-formal', 'contract-cdi', 'contract-nda', 'cv-modern', 'meeting-minutes', 'report-monthly', 'custom'],
          description: 'Type de document à générer',
        },
        data: { type: 'object', description: 'Données à injecter dans le template (recipient_name, subject, body, etc.)' },
        custom_html: { type: 'string', description: 'HTML simple si template=custom' },
        filename: { type: 'string', description: 'Nom fichier optionnel' },
      },
      required: ['template', 'data'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'generate_pptx',
    description:
      'Génère une présentation PowerPoint .pptx téléchargeable. Templates: pitch-startup, business-quarterly, lecture-academic, wedding-anniversary, birthday-party, casino-training, product-launch. AUTO-UTILISER quand user demande "slides", "pitch", "diapo", "PowerPoint", "présentation".',
    inputSchema: {
      type: 'object',
      properties: {
        template: { type: 'string', description: 'Type présentation' },
        title: { type: 'string' },
        author: { type: 'string' },
        slides: { type: 'array', description: 'Array {title, content, image_url?, notes?}' },
        mode: { type: 'string', enum: ['pro', 'fun'] },
        theme_color: { type: 'string', description: 'Hex color #...' },
      },
      required: ['template', 'title', 'slides'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'generate_xlsx',
    description:
      'Génère un tableau Excel .xlsx multi-feuilles avec formules. AUTO-UTILISER quand user demande "tableau Excel", "feuille calcul", "comptabilité", "budget", "planning export". Pas de markdown table en remplacement.',
    inputSchema: {
      type: 'object',
      properties: {
        filename: { type: 'string' },
        sheets: { type: 'array', description: 'Array {name, data:[[...]], formats?, freeze_header?, column_widths?}' },
      },
      required: ['filename', 'sheets'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'generate_pdf',
    description:
      'Génère un PDF professionnel téléchargeable. Templates: invoice, quote, contract-signed, report-standard, certificate, receipt, bofip-extract, legal-doc, custom. AUTO-UTILISER pour "facture", "devis", "PDF", "rapport final".',
    inputSchema: {
      type: 'object',
      properties: {
        template: { type: 'string', description: 'Type document' },
        data: { type: 'object', description: 'Données document (client_name, items, etc.)' },
        options: { type: 'object', description: '{watermark?, qr_data?, logo_base64?, footer_text?}' },
        filename: { type: 'string' },
      },
      required: ['template', 'data'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },

  /* ─────────── Video ─────────── */
  {
    name: 'video_edit',
    description:
      'Monte une vidéo client-side via ffmpeg.wasm. Operations: cut, concat, watermark, captions (auto-Whisper), resize, extract_audio. AUTO-UTILISER pour "monter vidéo", "couper clip", "sous-titres", "watermark".',
    inputSchema: {
      type: 'object',
      properties: {
        operation: { type: 'string', enum: ['cut', 'concat', 'watermark', 'captions', 'resize', 'extract_audio'] },
        video_source: { type: 'string', description: 'blob://, data:, ou https URL' },
        params: { type: 'object' },
      },
      required: ['operation', 'video_source'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'video_compose_hyperframes',
    description:
      'Compose une vidéo via HTML/CSS/JS (Hyperframes alternative à ffmpeg). Beats déclaratifs avec durée + html + css. AUTO-UTILISER pour animations programmatiques courtes (<60s).',
    inputSchema: {
      type: 'object',
      properties: {
        composition_id: { type: 'string' },
        data_width: { type: 'number' },
        data_height: { type: 'number' },
        data_duration: { type: 'string', description: '5s, 10s, etc.' },
        data_fps: { type: 'number' },
        beats: { type: 'array', description: 'Array {id, duration_ms, html, css}' },
      },
      required: ['composition_id', 'beats'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },

  /* ─────────── Méta skills ─────────── */
  {
    name: 'skill_factory_create',
    description:
      'Méta-skill : Apex crée une nouvelle compétence depuis chat admin Kevin. Génère SKILL.md + validation + activation. ADMIN ONLY.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Slug kebab-case du skill' },
        description: { type: 'string' },
        when_to_use: { type: 'string' },
        allowed_tools: { type: 'array' },
        anti_patterns: { type: 'array' },
      },
      required: ['name', 'description', 'when_to_use'],
    },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'security_review',
    description:
      'Scan toute la base code Apex pour vulnérabilités OWASP (XSS, secrets leaked, CSP, auth, CORS, dependencies). ADMIN ONLY. Retourne findings P0/P1/P2/P3 + score.',
    inputSchema: {
      type: 'object',
      properties: {
        scope: { type: 'string', enum: ['full', 'recent_changes', 'specific_file'] },
        file_path: { type: 'string', description: 'Si scope=specific_file' },
      },
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'code_review',
    description:
      'Spawn 4 agents internes (CLAUDE.md compliance + redundant rules + bug detection + git history) pour audit code. ADMIN ONLY.',
    inputSchema: {
      type: 'object',
      properties: {
        files: { type: 'array', description: 'Liste fichiers à reviewer' },
        commits_to_analyze: { type: 'number', description: 'Nombre commits historique (default 128)' },
      },
    },
    minTier: 'admin',
    impactLevel: 'A',
  },

  /* ─────────── Design ─────────── */
  {
    name: 'generate_design_system',
    description:
      'Génère palette + typo + composants UI production-grade WCAG AA. Vocabulaire Impeccable (weighty, inhabited, ember, swift, etc.). AUTO-UTILISER pour "design", "palette", "thème", "branding".',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['palette', 'typography', 'component', 'full-design-system', 'logo'] },
        mood: { type: 'string', description: 'premium | playful | tech | warm | cold | monochrome | editorial' },
        primary_hex: { type: 'string' },
        purpose: { type: 'string', description: 'saas | landing | dashboard | fintech | editorial' },
        constraints: { type: 'array', description: '["wcag-aa", "dark-mode", "rtl-support"]' },
      },
      required: ['type', 'mood'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'generate_marketing_copy',
    description:
      'Génère copy persuasif via 23 frameworks marketing psy (Cialdini, AIDA, PAS, FOMO, scarcity). Refuse copy non-éthique. AUTO-UTILISER pour "landing", "headline", "pitch marketing", "copy".',
    inputSchema: {
      type: 'object',
      properties: {
        product: { type: 'string', description: 'Description produit/service' },
        target_audience: { type: 'string' },
        framework: { type: 'string', description: 'AIDA, PAS, BAB, Cialdini, etc.' },
        tone: { type: 'string', enum: ['professional', 'playful', 'urgent', 'consultative'] },
      },
      required: ['product', 'target_audience'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },

  /* ─────────── MCP (Model Context Protocol) ─────────── */
  {
    name: 'mcp_bofip_search',
    description:
      'Cherche dans la doctrine fiscale française officielle BOFiP (Bulletin Officiel Finances Publiques). AUTO-UTILISER AVANT répondre fiscal/TVA/IR/impôt FR. Citation BOI-* obligatoire.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Question fiscale en langage naturel' },
        filters: { type: 'object', description: 'Optionnel : {date_from, date_to, theme}' },
      },
      required: ['query'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'mcp_almanac_research',
    description:
      'Deep Research multi-sources via Almanac MCP. Génère rapport structuré avec citations. AUTO-UTILISER pour "recherche approfondie", "analyse complète", "veille".',
    inputSchema: {
      type: 'object',
      properties: {
        topic: { type: 'string' },
        depth: { type: 'string', enum: ['shallow', 'medium', 'deep'] },
        sources: { type: 'array', description: '["web", "academic", "news", "specialized"]' },
        max_duration_min: { type: 'number' },
      },
      required: ['topic'],
    },
    minTier: 'family',
    impactLevel: 'B',
  },
  {
    name: 'mcp_legal_search',
    description:
      'Recherche juridique multi-pays via Legal Data Hunter (18M docs, 110+ pays). Citations ECLI/CELEX obligatoires. AUTO-UTILISER question juridique non-FR ou jurisprudence comparée.',
    inputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string', description: 'Code ISO 2 (FR, US, UK, etc.)' },
        namespace: { type: 'string', description: 'caselaw, legislation, doctrine' },
        query: { type: 'string', description: 'Question juridique' },
      },
      required: ['country', 'namespace', 'query'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },

  /* ─────────── Futuristic Modules (registry) ─────────── */
  {
    name: 'futuristic_module_invoke',
    description:
      'Invoque un module futuriste (60+ disponibles): apex-vision-claude-4, apex-image-gen-flux2-pro, apex-video-gen-sora-2, apex-music-suno-v5, apex-3d-meshy-v4, apex-pq-crypto-kyber, apex-zkp-proofs, apex-webar-modelviewer, etc. AUTO-UTILISER pour features avancées 2026.',
    inputSchema: {
      type: 'object',
      properties: {
        module_id: { type: 'string', description: 'ID exact du module (cf. apex-futuristic-modules.md)' },
        params: { type: 'object', description: 'Paramètres spécifiques au module' },
      },
      required: ['module_id'],
    },
    minTier: 'family',
    impactLevel: 'B',
  },

  /* ─────────── Skills internes Apex (câblés v13.4.260) ─────────── */
  {
    name: 'apex_extra_skills',
    description:
      'Skills internes Apex (ADMIN ONLY). action=security_scan : scanne un texte source (XSS/secrets/eval/CSP). action=gsd_evaluate : note une livraison selon la méthode GSD (zéro demi-mesure). action=context_optimize : compresse facts/lessons pour réduire les tokens. action=mempalace_create/mempalace_list/mempalace_recall : mémoire spatiale. action=skill_list : liste les skills générés.',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['security_scan', 'gsd_evaluate', 'context_optimize', 'mempalace_create', 'mempalace_list', 'mempalace_recall', 'skill_list'],
        },
        text: { type: 'string', description: 'security_scan : texte source à analyser' },
        name: { type: 'string', description: 'mempalace_create : nom de la salle' },
        description: { type: 'string', description: 'mempalace_create : description' },
        facts: { type: 'array', description: 'mempalace_create : faits liés à la salle' },
        query: { type: 'string', description: 'mempalace_recall : requête de rappel' },
        code_written: { type: 'boolean', description: 'gsd_evaluate' },
        tests_pass: { type: 'boolean', description: 'gsd_evaluate' },
        committed: { type: 'boolean', description: 'gsd_evaluate' },
        pushed: { type: 'boolean', description: 'gsd_evaluate' },
        audit_ok: { type: 'boolean', description: 'gsd_evaluate' },
        doc_updated: { type: 'boolean', description: 'gsd_evaluate (optionnel)' },
        max_tokens: { type: 'number', description: 'context_optimize : budget tokens' },
        include_admin_context: { type: 'boolean', description: 'context_optimize' },
      },
      required: ['action'],
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'apex_orchestration',
    description:
      'Orchestration Apex (ADMIN ONLY). action=rc_create/rc_list/rc_revoke : sessions de contrôle à distance. action=swarm_spawn/swarm_list/swarm_execute/swarm_dissolve : multi-agents HiveMind (exécution réelle via crew-experts). action=scrape_start/scrape_list/scrape_domains : web scraping sur domaines whitelistés.',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['rc_create', 'rc_list', 'rc_revoke', 'swarm_spawn', 'swarm_list', 'swarm_execute', 'swarm_dissolve', 'scrape_start', 'scrape_list', 'scrape_domains'],
        },
        name: { type: 'string', description: 'rc_create : nom de session' },
        flags: { type: 'array', description: 'rc_create : verbose/sandbox/no-sandbox' },
        session_id: { type: 'string', description: 'rc_revoke : id de session' },
        topology: { type: 'string', enum: ['hierarchical', 'mesh', 'ring', 'star'], description: 'swarm_spawn' },
        consensus: { type: 'string', enum: ['raft', 'bft', 'gossip', 'crdt', 'pow-lite'], description: 'swarm_spawn' },
        queen_type: { type: 'string', enum: ['strategic', 'tactical', 'adaptive'], description: 'swarm_spawn' },
        workers_count: { type: 'number', description: 'swarm_spawn : 1-20 workers' },
        swarm_id: { type: 'string', description: 'swarm_execute / swarm_dissolve' },
        task: { type: 'string', description: 'swarm_execute : tâche à exécuter' },
        mode: { type: 'string', enum: ['consensus', 'debate', 'specialized'], description: 'swarm_execute' },
        url: { type: 'string', description: 'scrape_start : URL (domaine whitelisté requis)' },
        depth: { type: 'number', description: 'scrape_start : profondeur 1-3' },
      },
      required: ['action'],
    },
    minTier: 'admin',
    impactLevel: 'B',
  },
];
