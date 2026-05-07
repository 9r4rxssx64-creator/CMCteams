/**
 * APEX v13 — Registry complet outils IA Apex (parité Claude Code).
 *
 * Demande Kevin (2026-05-03) :
 * "Apex doit pouvoir s'autogérer s'autocorriger s'automodifier.
 * Quoique je lui demande comme modification, qu'il puisse le faire.
 * Niveau Claude Code expert. Polyvalence. Autonomie totale."
 *
 * Outils exposés via tool_use Anthropic format :
 * - read_file       : lit un fichier du repo via GitHub raw
 * - edit_file       : propose un edit (review obligatoire si non admin Kevin)
 * - run_test        : lance la suite de tests (sandbox safe)
 * - audit_self      : lance audit subagent indépendant
 * - commit_push     : git commit + push (nécessite GitHub PAT scopé)
 * - web_search      : recherche web (Brave/Tavily/DuckDuckGo failover)
 * - web_fetch       : fetch URL et extrait contenu textuel
 * - run_lint        : npm run lint sandbox
 * - run_typecheck   : tsc --noEmit
 * - read_logs       : lit logs runtime + audit log
 * - escalate_human  : escalade Kevin via push notif si action niveau C
 *
 * Sécurité :
 * - Tier admin (Kevin) : tous tools accessibles
 * - Tier laurence/family : read-only + escalate_human pour modifications
 * - Tier client_pro/free : read_file + web_search + web_fetch uniquement
 *
 * Anti-pattern Kevin : pas d'eval, pas de new Function, pas d'exec arbitraire.
 * Tout passe par dispatcher whitelist + audit log immutable.
 */

import { logger } from '../core/logger.js';

import { auditLog } from './audit-log.js';

export interface ApexTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description?: string; enum?: readonly string[] }>;
    required?: readonly string[];
  };
  /* Tier requis pour exécuter ce tool */
  minTier: 'admin' | 'laurence' | 'family' | 'client_pro' | 'client_free';
  /* Action niveau impact :
   * A = auto (pas de validation)
   * B = notify (Kevin reçoit info en push)
   * C = validate (Kevin doit valider avant) */
  impactLevel: 'A' | 'B' | 'C';
}

const APEX_TOOLS: readonly ApexTool[] = [
  {
    name: 'read_file',
    description: 'Lit le contenu d\'un fichier du repo CMCteams via GitHub raw URL.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Chemin relatif depuis racine repo (ex: apex-ai/v13/core/store.ts)' },
        branch: { type: 'string', description: 'Branche git (default: main)' },
      },
      required: ['path'],
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'edit_file',
    description: 'Propose un edit : remplace old_string par new_string dans path. Niveau C = validation Kevin obligatoire si non admin.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        old_string: { type: 'string', description: 'Texte exact à remplacer (unique dans le fichier)' },
        new_string: { type: 'string' },
      },
      required: ['path', 'old_string', 'new_string'],
    },
    minTier: 'admin',
    impactLevel: 'C',
  },
  {
    name: 'run_test',
    description: 'Lance npm test (vitest) en sandbox. Retourne stdout + exit code.',
    inputSchema: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: 'Pattern fichiers test (default: tous)' },
      },
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'audit_self',
    description: 'Lance un audit subagent indépendant Explore sur l\'état actuel d\'Apex. Retourne score /100 par axe.',
    inputSchema: {
      type: 'object',
      properties: {
        scope: { type: 'string', description: 'Scope audit : security, performance, ux, accessibility, all (default: all)' },
      },
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'commit_push',
    description: 'Git commit + push (nécessite GitHub PAT). Crée commit avec message + push branche claude/*.',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Message de commit clair (1-3 lignes)' },
        branch: { type: 'string', description: 'Branche cible (default: claude/auto-<ts>)' },
      },
      required: ['message'],
    },
    minTier: 'admin',
    impactLevel: 'C',
  },
  {
    name: 'web_search',
    description: 'Recherche web via Brave Search → Tavily → DuckDuckGo failover. Retourne 5 résultats.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Requête de recherche' },
        max_results: { type: 'number', description: 'Nombre de résultats (default: 5)' },
      },
      required: ['query'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'web_fetch',
    description: 'Fetch une URL HTTP et extrait le contenu textuel (sans HTML).',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL HTTPS' },
      },
      required: ['url'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'open_url',
    description: 'Ouvre une URL dans modal pop-up Apex avec 2 boutons 1-clic : "Ouvrir dans Apex" (browser embed) ou "Ouvrir Safari" (nouvel onglet). Kevin règle CLAUDE.md "1 CLIC + FENÊTRE + BOUTON DIRECT". Utilise quand user dit "ouvre Google", "va sur tel site", "navigue vers...".',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL ou domaine (https:// ajouté auto si manquant)' },
        label: { type: 'string', description: 'Label affiché dans titre modal (optionnel)' },
        description: { type: 'string', description: 'Description courte (optionnel)' },
      },
      required: ['url'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'run_lint',
    description: 'Lance ESLint sur le repo. Retourne erreurs + warnings.',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'run_typecheck',
    description: 'Lance tsc --noEmit pour vérifier types TypeScript.',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'read_logs',
    description: 'Lit les logs runtime Apex (audit log + observability buffer + sentinels).',
    inputSchema: {
      type: 'object',
      properties: {
        scope: { type: 'string', enum: ['audit', 'errors', 'sentinels', 'all'], description: 'Type de logs' },
        limit: { type: 'number', description: 'Nb max entries (default: 50)' },
      },
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'escalate_human',
    description: 'Escalade vers Kevin (push notif WhatsApp/email) pour validation action niveau C.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', description: 'Description action proposée' },
        context: { type: 'string', description: 'Contexte / pourquoi nécessaire' },
        urgency: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
      },
      required: ['action', 'urgency'],
    },
    minTier: 'family',
    impactLevel: 'B',
  },
  {
    name: 'cmc_read',
    description: 'Lit les données CMCteams (planning casino, employés) depuis Firebase shared.',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'open_tool',
    description: 'Ouvre un outil HTML autonome (album-laurence, codes-decoder, calc-conventions, etc.) dans browser embed.',
    inputSchema: {
      type: 'object',
      properties: {
        tool_id: { type: 'string' },
      },
      required: ['tool_id'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'create_calendar_event',
    description: 'Crée un événement calendrier (iCal export ou Google Calendar API si configuré).',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        start: { type: 'string', description: 'ISO 8601' },
        end: { type: 'string', description: 'ISO 8601' },
        location: { type: 'string' },
        description: { type: 'string' },
      },
      required: ['title', 'start'],
    },
    minTier: 'family',
    impactLevel: 'B',
  },
  {
    name: 'send_email',
    description: 'Envoie un email via Brevo/Resend/EmailJS configuré. Limité à 10/jour pour family/client.',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string' },
        subject: { type: 'string' },
        body: { type: 'string' },
      },
      required: ['to', 'subject', 'body'],
    },
    minTier: 'family',
    impactLevel: 'C',
  },
  {
    name: 'send_telegram',
    description: 'Envoie un message Telegram via bot @Kdmc_kevind_2026_bot.',
    inputSchema: {
      type: 'object',
      properties: {
        chat_id: { type: 'string' },
        text: { type: 'string' },
      },
      required: ['chat_id', 'text'],
    },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'finance_calculate',
    description: 'Calcul fiscal/financier (IR FR 2026, crédit immo, plus-value, IBAN check).',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['ir', 'credit', 'plus_value', 'iban_check'] },
        params: { type: 'object', description: 'Paramètres spécifiques au calcul' },
      },
      required: ['type', 'params'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'translate',
    description: 'Traduit un texte (30+ langues) via DeepL ou Claude Haiku failover.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        target_lang: { type: 'string', description: 'Code langue ISO (ex: en, es, ja)' },
      },
      required: ['text', 'target_lang'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'qr_generate',
    description: 'Génère un QR code (URL, vCard, WiFi credentials).',
    inputSchema: {
      type: 'object',
      properties: {
        data: { type: 'string' },
        format: { type: 'string', enum: ['url', 'vcard', 'wifi', 'plain'] },
      },
      required: ['data'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'ocr_scan',
    description: 'OCR sur image base64 via Tesseract.js local (sans cloud).',
    inputSchema: {
      type: 'object',
      properties: {
        image_base64: { type: 'string' },
        lang: { type: 'string', description: 'fra, eng, ita, etc.' },
      },
      required: ['image_base64'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'image_analyze',
    description: 'Analyse vision IA (Claude Sonnet 4.6 vision ou GPT-4o vision).',
    inputSchema: {
      type: 'object',
      properties: {
        image_base64: { type: 'string' },
        prompt: { type: 'string' },
      },
      required: ['image_base64', 'prompt'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'backup_trigger',
    description: 'Déclenche un backup Firebase complet (snapshot daté + IDB shadow).',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'vault_action',
    description: 'Action sur Coffre : list, get (uid), set (admin only), revoke. Tous opérations chiffrées AES-GCM 256.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['list', 'get', 'set', 'revoke'] },
        key: { type: 'string' },
        value: { type: 'string', description: 'Pour set uniquement' },
      },
      required: ['action'],
    },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'find_my_login_url',
    description: 'Cherche en autonomie l\'URL de connexion + dashboard + billing + api_keys + usage pour un service Kevin (ex: "ouvre ma boîte Gmail" → URL accounts.google.com).',
    inputSchema: {
      type: 'object',
      properties: {
        service: { type: 'string', description: 'Nom du service (ex: anthropic, gmail, github, revolut) ou identifiant (email, IBAN)' },
      },
      required: ['service'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  /* === Tools meta-projets Kevin (multi-polyvalence) === */
  {
    name: 'project_status',
    description: 'État courant d\'un projet Kevin (CMCteams, Télécommande, KDMC, e-KDMC, IA-KDMC, CrackPass) : version actuelle, tâches en cours, derniers commits.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'string', enum: ['cmcteams', 'telecommande', 'kdmc', 'ekdmc', 'iakdmc', 'crackpass', 'apex'] },
      },
      required: ['project_id'],
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'project_continue',
    description: 'Reprend un projet Kevin où il en est : lit handoff JSON + KEVIN_ACTIONS_TODO + dernières lessons learned, propose next steps.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'string' },
      },
      required: ['project_id'],
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'project_finish',
    description: 'Finalise un projet Kevin : audit complet + tests + deploy + closure handoff. Niveau C validation Kevin obligatoire.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'string' },
      },
      required: ['project_id'],
    },
    minTier: 'admin',
    impactLevel: 'C',
  },
  {
    name: 'search_latest_tools',
    description: 'Cherche derniers outils/APIs/libs récents dans un domaine via web_search. Retourne 5 candidats + dates de release.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Ex: ai-models, cloud-storage, payment-api, voice-recognition' },
      },
      required: ['domain'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'self_improve',
    description: 'Auto-amélioration : analyse le code Apex, propose 3 améliorations concrètes (perf, UX, sécurité). Niveau C si edit_file enchaîné.',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'Cible : performance, ux, security, accessibility, code_quality' },
      },
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'knowledge_update',
    description: 'Fetch documentation officielle récente (Anthropic, OpenAI, Stripe, Firebase, Cloudflare, etc.) et met à jour la KB Apex.',
    inputSchema: {
      type: 'object',
      properties: {
        provider: { type: 'string', description: 'Ex: anthropic, openai, stripe, firebase, cloudflare, vercel' },
      },
      required: ['provider'],
    },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'memory_recall',
    description: 'Cherche dans la mémoire persistante Apex (ax_persistent_memory) par mot-clé. Retourne facts + lessons learned correspondants.',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: { type: 'string' },
        scope: { type: 'string', enum: ['facts', 'lessons', 'kb', 'all'] },
      },
      required: ['keyword'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'memory_add',
    description: 'Ajoute un fait à la mémoire persistante Apex (catégorisé). Cross-session retention.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Ex: kevin_preferences, project_state, lesson_learned' },
        fact: { type: 'string' },
      },
      required: ['category', 'fact'],
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'lesson_record',
    description: 'Enregistre une lesson learned (erreur évitée + pattern + sévérité) cross-session.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        text: { type: 'string' },
        category: { type: 'string', description: 'Ex: parser, security, ui, perf' },
        severity: { type: 'string', enum: ['info', 'warn', 'critical'] },
      },
      required: ['title', 'text', 'severity'],
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  /* === Extension v13.0.1 : +10 outils (Kevin "plus poussé") === */
  {
    name: 'weather',
    description: 'Météo 7 jours via Open-Meteo (gratuit, sans clé). Lat/lon ou nom ville.',
    inputSchema: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'Ex: Monaco, Paris, lat,lon' },
        days: { type: 'number', description: 'Nombre jours forecast (1-7)' },
      },
      required: ['location'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'news_headlines',
    description: 'Dernières news via NewsAPI (clé optionnelle) ou RSS publics.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['general', 'tech', 'business', 'sports', 'health', 'science'] },
        country: { type: 'string', description: 'Code ISO 2 lettres (fr, us, etc.)' },
      },
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'market_data',
    description: 'Prix temps réel : crypto (CoinGecko gratuit) ou stocks (Finnhub clé optionnelle).',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['crypto', 'stock', 'forex'] },
        symbol: { type: 'string', description: 'Ex: BTC, ETH, AAPL, EUR/USD' },
      },
      required: ['type', 'symbol'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'scrape_url',
    description: 'Extraction structurée d\'une page web (titre, méta, body texte). Pas exec JS.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL HTTPS' },
      },
      required: ['url'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'voice_command',
    description: 'Reconnaissance vocale Web Speech API + intent matching (ouvrir/lancer/chercher).',
    inputSchema: {
      type: 'object',
      properties: {
        lang: { type: 'string', description: 'Code lang (fr-FR, en-US)' },
        timeout_sec: { type: 'number', description: 'Timeout micro 5-30s' },
      },
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'screen_share',
    description: 'Capture screen via getDisplayMedia (sandbox iframe) pour debug visuel ou présentation.',
    inputSchema: {
      type: 'object',
      properties: {
        duration_sec: { type: 'number', description: 'Durée enregistrement max' },
      },
    },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'multi_llm_consensus',
    description: 'Lance 3 LLM en parallèle (Claude+GPT+Groq) sur même prompt → vote consensus + confidence.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string' },
        providers: { type: 'string', description: 'Comma-separated (default: anthropic,openrouter,groq)' },
      },
      required: ['prompt'],
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'detect_intent',
    description: 'NLP intent detection sur message user (chat/search/admin/studio_X). Retourne intent + confidence.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
      },
      required: ['text'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'sentinels_status',
    description: 'État des 13 sentinelles 24/7 (token-watch, backup-watch, error-watch, etc.) + lastResult.',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'perf_metrics',
    description: 'Snapshot Web Vitals (LCP/INP/CLS/FCP/TTFB) + score Lighthouse runtime.',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'admin',
    impactLevel: 'A',
  },
  /* ========== DEVICE CONTROL TOOLS (Kevin règle pilotage iOS/Android) ========== */
  {
    name: 'partage_contenu',
    description: 'Partage natif iOS/Android (URL, texte, fichiers) via navigator.share. Utilise quand user dit "partage", "envoie", "share".',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        text: { type: 'string' },
        url: { type: 'string' },
      },
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'vibrer',
    description: 'Vibration haptique iPhone/Android (Android only physiquement, iOS ignore silencieusement).',
    inputSchema: {
      type: 'object',
      properties: {
        pattern: { type: 'array', description: 'Durées ms (ex: [100,50,100])' },
      },
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'ma_position',
    description: 'Coordonnées GPS via navigator.geolocation. Demande permission une fois.',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'batterie',
    description: 'Niveau batterie + en charge (Android Chrome only).',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'parler',
    description: 'TTS Web Speech (synthèse vocale). Voix native iOS/Android. Utilise quand user dit "lis-moi", "dis-moi", "parle".',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        voice: { type: 'string', description: 'Nom voix optionnel' },
        lang: { type: 'string', description: 'fr-FR par défaut' },
        rate: { type: 'number', description: '0.5-2 (1 par défaut)' },
      },
      required: ['text'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'ouvrir_maps',
    description: 'Ouvre Apple Maps (iOS) ou Google Maps avec adresse/coords. Utilise quand user dit "va à", "itinéraire", "carte".',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string' },
        coords: { type: 'string', description: 'lat,lon' },
      },
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'appeler',
    description: 'Ouvre app téléphone iOS/Android avec numéro pré-rempli (tel:URI).',
    inputSchema: {
      type: 'object',
      properties: { number: { type: 'string' } },
      required: ['number'],
    },
    minTier: 'client_free',
    impactLevel: 'B',
  },
  {
    name: 'sms',
    description: 'Ouvre app SMS iOS/Android avec destinataire + message pré-rempli (sms:URI).',
    inputSchema: {
      type: 'object',
      properties: {
        number: { type: 'string' },
        body: { type: 'string' },
      },
      required: ['number'],
    },
    minTier: 'client_free',
    impactLevel: 'B',
  },
  {
    name: 'mail',
    description: 'Ouvre app Mail iOS/Android avec destinataire + sujet + corps pré-rempli (mailto:URI).',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string' },
        subject: { type: 'string' },
        body: { type: 'string' },
      },
      required: ['to'],
    },
    minTier: 'client_free',
    impactLevel: 'B',
  },
  {
    name: 'mes_photos',
    description: 'Sélection multiple photos galerie iPhone/Android via input file. Utilise quand user dit "trie mes photos", "mes photos".',
    inputSchema: {
      type: 'object',
      properties: { max: { type: 'number', description: 'Max nombre photos' } },
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'tri_photos',
    description: 'Analyse EXIF photos (date, GPS, caméra) et regroupe par date YYYY-MM.',
    inputSchema: {
      type: 'object',
      properties: { files: { type: 'array', description: 'Array File objects' } },
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'detect_device',
    description: 'Detect environnement (iOS/Android/Desktop, PWA standalone ou browser) + capabilities supportées.',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  /* ========== NETWORK SCAN LAN (Kevin demande pilotage WiFi) ========== */
  {
    name: 'scan_network',
    description: 'Scan LAN complet (WebRTC ICE → IP locale + subnet + 80+ device probes : Hue, Sonos, Plex, NAS, caméras, imprimantes, IoT). Retourne devices trouvés.',
    inputSchema: {
      type: 'object',
      properties: {
        useCache: { type: 'string', description: 'Si "false" force rescan (default true cache 5 min)' },
      },
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'local_ip',
    description: 'Découvre IP locale via WebRTC ICE candidate.',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'open_lan_device',
    description: 'Ouvre UI HTTP d\'un device LAN dans nouvel onglet (window.open).',
    inputSchema: {
      type: 'object',
      properties: {
        ip: { type: 'string', description: 'IP du device (ex: 192.168.1.50)' },
        port: { type: 'number', description: 'Port HTTP (default 80)' },
      },
      required: ['ip'],
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  /* ========== BADGE CLONER NFC/RFID (60+ formats) ========== */
  {
    name: 'scan_badge',
    description: 'Lecture NFC tag (Android Chrome only). 60+ formats reconnus (NDEF, MIFARE, NTAG, FeliCa, ISO14443/15693, HID Prox, Vigik, EMV, etc.).',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'list_badges',
    description: 'Liste tous les badges scannés (chiffrés AES-GCM via vault).',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'clone_badge_to_tag',
    description: 'Clone badge stocké dans nouveau tag NFC vierge (Android Chrome write).',
    inputSchema: {
      type: 'object',
      properties: { badge_id: { type: 'string' } },
      required: ['badge_id'],
    },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'badge_to_qr',
    description: 'Génère QR code équivalent du badge (alternative scanners QR/NFC).',
    inputSchema: {
      type: 'object',
      properties: { badge_id: { type: 'string' } },
      required: ['badge_id'],
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  /* ========== CARD EMULATOR (18 hardware devices) ========== */
  {
    name: 'list_emulators',
    description: 'Liste 18 émulateurs hardware supportés (Flipper Zero USB+BLE, Proxmark3, ChameleonMini, ACR122, OMNIKEY, HydraNFC, RFIDler, M5Stick, ESP32+PN532, MagSpoof, Apex Companion App iOS/Android) + capabilities browser.',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'connect_flipper_usb',
    description: 'Connecte Flipper Zero via WebUSB (Vendor 0x0483).',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'connect_flipper_ble',
    description: 'Connecte Flipper Zero via Web Bluetooth (Service UUID 8fe5b3d5-...).',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'connect_proxmark',
    description: 'Connecte Proxmark3 Easy/RDV4 via WebSerial.',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'connect_chameleon',
    description: 'Connecte ChameleonMini via WebSerial CDC ACM.',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'emulate_badge',
    description: 'Émule badge stocké via device connecté (Flipper, Proxmark, Chameleon, etc.). Délègue commandes spécifiques.',
    inputSchema: {
      type: 'object',
      properties: {
        badge_id: { type: 'string' },
        duration_sec: { type: 'number', description: 'Durée émulation (default 60s)' },
      },
      required: ['badge_id'],
    },
    minTier: 'admin',
    impactLevel: 'C',
  },
  {
    name: 'emulator_command',
    description: 'Envoie commande RAW au device émulateur connecté (ex Proxmark "hf mfu read", Flipper "rfid emulate").',
    inputSchema: {
      type: 'object',
      properties: { cmd: { type: 'string' } },
      required: ['cmd'],
    },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'emulator_disconnect',
    description: 'Déconnecte device émulateur en cours.',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'admin',
    impactLevel: 'A',
  },
  /* ========== APEX KNOWLEDGE BASE (RAG GitHub API) ==========
     Kevin règle 2026-05-04 : "Apex doit tout connaître pour tout faire".
     5 tools pour fouiller le code Kevin (CMCteams + projets ajoutés par UI). */
  {
    name: 'search_repo_code',
    description: 'Cherche full-text dans le code source d\'un repo Kevin via GitHub Code Search API. Retourne paths + scores (max 20 résultats). Cache 1h anti rate-limit.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Requête full-text (ex: "addRepo function")' },
        repo: { type: 'string', description: 'Repo cible owner/repo (default: 9r4rxssx64-creator/CMCteams)' },
      },
      required: ['query'],
    },
    minTier: 'laurence',
    impactLevel: 'A',
  },
  {
    name: 'read_repo_file',
    description: 'Lit le contenu complet d\'un fichier d\'un repo Kevin via GitHub contents API. Décode base64 → string UTF-8.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Chemin relatif depuis racine repo (ex: apex-ai/v13/core/store.ts)' },
        repo: { type: 'string', description: 'Repo cible owner/repo (default: 9r4rxssx64-creator/CMCteams)' },
      },
      required: ['path'],
    },
    minTier: 'laurence',
    impactLevel: 'A',
  },
  {
    name: 'list_repo_files',
    description: 'Liste les fichiers d\'un répertoire d\'un repo (1 niveau profondeur, type file/dir).',
    inputSchema: {
      type: 'object',
      properties: {
        directory: { type: 'string', description: 'Chemin répertoire (default: racine repo)' },
        repo: { type: 'string', description: 'Repo cible owner/repo (default: 9r4rxssx64-creator/CMCteams)' },
      },
    },
    minTier: 'laurence',
    impactLevel: 'A',
  },
  {
    name: 'get_recent_commits',
    description: 'Liste les N derniers commits d\'un repo (default 10, max 100). Inclut sha, message, auteur, date.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Nombre de commits (1-100, default 10)' },
        repo: { type: 'string', description: 'Repo cible owner/repo (default: 9r4rxssx64-creator/CMCteams)' },
      },
    },
    minTier: 'laurence',
    impactLevel: 'A',
  },
  {
    name: 'get_repo_readme',
    description: 'Récupère le README d\'un repo Kevin (markdown brut, décodé base64).',
    inputSchema: {
      type: 'object',
      properties: {
        repo: { type: 'string', description: 'Repo cible owner/repo (default: 9r4rxssx64-creator/CMCteams)' },
      },
    },
    minTier: 'laurence',
    impactLevel: 'A',
  },
  /* ========== APEX EXECUTE (pont autonome IA → Claude Code via GitHub Actions) ==========
     Kevin règle 2026-05-04 : "Apex doit pouvoir tout faire en autonomie totale".
     Whitelist 8 tâches sécurisées + 4 INTERDITES. Audit log immutable. */
  {
    name: 'execute_task',
    description: 'Exécute autonome via Claude Code Action GitHub : modify_file, create_file, run_test, run_lint, audit_repo, deploy_canary, backup_user_data, restore_from_backup. INTERDIT : delete_file, force_push, modify_user_credentials_external, send_external_email_without_consent. Niveau C = validation Kevin obligatoire.',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'Type de tâche autorisée (whitelist sécurité)',
          enum: ['modify_file', 'create_file', 'run_test', 'run_lint', 'audit_repo', 'deploy_canary', 'backup_user_data', 'restore_from_backup'],
        },
        params: { type: 'object', description: 'Paramètres spécifiques (path, content, env, depth, uid, ts...)' },
      },
      required: ['task', 'params'],
    },
    minTier: 'admin',
    impactLevel: 'C',
  },
  {
    name: 'list_executions',
    description: 'Liste exécutions autonomes en cours/récentes (apex-execute). Filtres par statut, tâche, projet source.',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['pending', 'dispatched', 'running', 'completed', 'failed', 'cancelled', 'timeout'] },
        task: { type: 'string' },
        limit: { type: 'number' },
      },
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'poll_execution',
    description: 'Vérifie le résultat d\'une exécution autonome (statut + url workflow GitHub).',
    inputSchema: {
      type: 'object',
      properties: { task_id: { type: 'string', description: 'ID exécution (exec_xxx)' } },
      required: ['task_id'],
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'cancel_execution',
    description: 'Annule une exécution pending/dispatched. Si workflow déjà running, le CI termine normalement.',
    inputSchema: {
      type: 'object',
      properties: { task_id: { type: 'string' } },
      required: ['task_id'],
    },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'execute_stats',
    description: 'Stats apex-execute : total, success rate, avg duration, breakdown par tâche.',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'admin',
    impactLevel: 'A',
  },
  /* ========== PUSH MAX v13.0.20 — +25 outils pour atteindre 100+ ==========
     Kevin règle : "À chaque outils, modules etc toujours pousser au max".
     Catégories : productivity (text/data), web extras, files utils,
     code utils, image, communications validators, finance extras. */
  /* === Web extras (5) === */
  {
    name: 'wikipedia_lookup',
    description: 'Recherche Wikipedia (FR par défaut) via API publique gratuite. Retourne extrait + URL article.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Terme recherché' },
        lang: { type: 'string', description: 'Code langue ISO (fr, en, it, es, de... default: fr)' },
      },
      required: ['query'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'youtube_search',
    description: 'Recherche YouTube (URL search results, sans clé API). Retourne lien recherche cliquable + suggestions vidéos via embed.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
      },
      required: ['query'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'github_search',
    description: 'Recherche code/repos GitHub via API publique (rate-limit 10/min sans token, 30/min avec).',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Requête (ex: "language:typescript user:9r4rxssx64-creator")' },
        type: { type: 'string', enum: ['code', 'repos', 'users', 'issues'] },
      },
      required: ['query'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'stackoverflow_search',
    description: 'Recherche StackOverflow via API gratuite. Retourne questions + réponses acceptées.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        tag: { type: 'string', description: 'Tag optionnel (ex: typescript, react)' },
      },
      required: ['query'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'unshorten_url',
    description: 'Déplie une URL raccourcie (bit.ly, t.co, etc.) via redirection HTTP.',
    inputSchema: {
      type: 'object',
      properties: { url: { type: 'string' } },
      required: ['url'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  /* === Files & Documents (5) === */
  {
    name: 'json_validate',
    description: 'Valide un JSON, retourne {valid, parsed?, error?, depth, keys_count}. Pratique pour debug API.',
    inputSchema: {
      type: 'object',
      properties: { json: { type: 'string' } },
      required: ['json'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'csv_parse',
    description: 'Parse CSV (séparateur , ; \t auto-détecté) → array of objects. Header row obligatoire.',
    inputSchema: {
      type: 'object',
      properties: {
        csv: { type: 'string' },
        delimiter: { type: 'string', description: 'Délimiteur custom (auto si absent)' },
      },
      required: ['csv'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'text_diff',
    description: 'Diff deux textes ligne par ligne. Retourne added/removed/unchanged + stats.',
    inputSchema: {
      type: 'object',
      properties: {
        before: { type: 'string' },
        after: { type: 'string' },
      },
      required: ['before', 'after'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'hash_text',
    description: 'Hash SHA-256/SHA-1/MD5 d\'un texte via Web Crypto API.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        algo: { type: 'string', enum: ['SHA-256', 'SHA-1', 'SHA-384', 'SHA-512'] },
      },
      required: ['text'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'base64_encode_decode',
    description: 'Encode ou décode Base64 (UTF-8 safe).',
    inputSchema: {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['encode', 'decode'] },
        text: { type: 'string' },
      },
      required: ['mode', 'text'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  /* === Code utils (3) === */
  {
    name: 'regex_test',
    description: 'Test une regex sur un texte. Retourne matches + groupes capture.',
    inputSchema: {
      type: 'object',
      properties: {
        pattern: { type: 'string' },
        flags: { type: 'string', description: 'Ex: gi, gm' },
        text: { type: 'string' },
      },
      required: ['pattern', 'text'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'jwt_decode',
    description: 'Decode JWT (header + payload, SANS vérification signature). Pratique pour debug.',
    inputSchema: {
      type: 'object',
      properties: { token: { type: 'string' } },
      required: ['token'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'uuid_generate',
    description: 'Génère UUID v4 (crypto.randomUUID) pour clés uniques, IDs.',
    inputSchema: {
      type: 'object',
      properties: { count: { type: 'number', description: '1-50 (default 1)' } },
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  /* === Productivity (5) === */
  {
    name: 'summarize_text',
    description: 'Résumé extractif rapide (top N phrases scoring TF-IDF). Sans IA externe.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        sentences: { type: 'number', description: 'Nombre de phrases résumé (default 3)' },
      },
      required: ['text'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'word_count',
    description: 'Stats texte : mots, caractères, phrases, paragraphes, durée lecture (200 wpm), Flesch readability.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'detect_language',
    description: 'Détection langue d\'un texte (heuristique trigrammes, FR/EN/IT/ES/DE/PT). Sans appel API.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'mind_map_generate',
    description: 'Génère mind map markdown depuis sujet central + branches.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: { type: 'string' },
        branches: { type: 'array', description: 'Array de sous-thèmes' },
      },
      required: ['topic'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'create_task',
    description: 'Crée une tâche locale (apex_v13_tasks). Stockée local + Firebase shared admin.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        due: { type: 'string', description: 'ISO 8601 date optionnelle' },
        priority: { type: 'string', enum: ['low', 'normal', 'high', 'critical'] },
      },
      required: ['title'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  /* === Communications validators (3) === */
  {
    name: 'email_validate',
    description: 'Valide format email (regex RFC simplifiée + check domaine).',
    inputSchema: {
      type: 'object',
      properties: { email: { type: 'string' } },
      required: ['email'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'phone_validate',
    description: 'Valide numéro téléphone format E.164 / FR / Monaco. Retourne {valid, country, normalized}.',
    inputSchema: {
      type: 'object',
      properties: {
        phone: { type: 'string' },
        country: { type: 'string', description: 'Code ISO 2 (FR, MC, IT...)' },
      },
      required: ['phone'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'whatsapp_link',
    description: 'Génère lien wa.me/ pour ouvrir WhatsApp avec numéro + message pré-rempli.',
    inputSchema: {
      type: 'object',
      properties: {
        phone: { type: 'string', description: 'E.164 sans + (ex: 33612345678)' },
        text: { type: 'string', description: 'Message pré-rempli optionnel' },
      },
      required: ['phone'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  /* === Finance extras (3) === */
  {
    name: 'vat_validate_eu',
    description: 'Valide numéro TVA UE format (heuristique préfixe pays + longueur).',
    inputSchema: {
      type: 'object',
      properties: { vat: { type: 'string' } },
      required: ['vat'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'compound_interest',
    description: 'Calcul intérêts composés. Capital, taux, durée, fréquence → valeur finale.',
    inputSchema: {
      type: 'object',
      properties: {
        principal: { type: 'number' },
        rate: { type: 'number', description: 'Taux annuel % (ex: 5)' },
        years: { type: 'number' },
        frequency: { type: 'number', description: 'Compositions/an (default 12)' },
      },
      required: ['principal', 'rate', 'years'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'currency_convert',
    description: 'Conversion devises via taux exchangerate-api gratuit (100+ devises).',
    inputSchema: {
      type: 'object',
      properties: {
        amount: { type: 'number' },
        from: { type: 'string', description: 'Code ISO 4217 (EUR, USD, ...)' },
        to: { type: 'string' },
      },
      required: ['amount', 'from', 'to'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  /* === Image utils (1) === */
  {
    name: 'image_compress',
    description: 'Compresse image base64 via Canvas API (qualité réglable, conserve ratio).',
    inputSchema: {
      type: 'object',
      properties: {
        image_base64: { type: 'string' },
        quality: { type: 'number', description: '0.1-1.0 (default 0.8)' },
        max_width: { type: 'number', description: 'Largeur max px (default 1920)' },
      },
      required: ['image_base64'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  /* === Image Transform (Replicate API) — Kevin demande "polyvalent créatif" 2026-05-07 === */
  {
    name: 'transform_image',
    description:
      'Transforme une image (URL https/data:/blob:) en cartoon, anime, vidéo animée, fond retiré, ou variation stylisée. ' +
      'Réponse : {success, outputUrl, cost_eur, estimatedSeconds}. ' +
      'Utilise Replicate API (clé Vault `ax_replicate_key`). ' +
      'Modes : cartoon (catacolabs/cartoonify) · anime (animeganv2) · video (stable-video-diffusion 4s) · ' +
      'remove-bg (lucataco/remove-bg) · stylize (sdxl img2img avec prompt).',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL image source (https://, data:image/, ou blob:). Pas http:// ni file://.',
        },
        type: {
          type: 'string',
          enum: ['cartoon', 'anime', 'video', 'remove-bg', 'stylize'],
          description: 'Type de transformation à appliquer.',
        },
        prompt: {
          type: 'string',
          description: 'Pour `type=stylize` uniquement : prompt SDXL img2img (ex: "huile sur toile renaissance").',
        },
      },
      required: ['url', 'type'],
    },
    minTier: 'family',
    impactLevel: 'B',
  },
  {
    name: 'execute_task_on_service',
    description: 'Exécute tâche concrète sur service externe Kevin (clé API vault). Services supportés : github, stripe, resend, telegram, brevo, openai, anthropic, vercel, cloudflare, paypal, discord, slack, notion, airtable, shopify. GitHub tasks: create_issue, add_comment, merge_pr (confirm:true), dispatch_workflow, create_or_update_file, delete_file (confirm:true). Autonomie totale Kevin 2026-05-04.',
    inputSchema: {
      type: 'object',
      properties: {
        service: { type: 'string', description: 'Nom service (github | stripe | resend | telegram | brevo | openai | anthropic | vercel | cloudflare | paypal | discord | slack | notion | airtable | shopify)' },
        task: { type: 'string', description: 'Tâche : send_email, create_issue, create_or_update_file, delete_file, send_message, etc. Voir docs handler.' },
        params: { type: 'object', description: 'Paramètres tâche (to, subject, amount, repo, channel, path, content, message, branch, etc.). Actions destructives (delete_file, merge_pr) exigent confirm:true.' },
      },
      required: ['service', 'task'],
    },
    minTier: 'admin',
    impactLevel: 'B',
  },
  /* P0 PARITÉ CLAUDE CODE (Kevin screenshots 2026-05-07) : tools dédiés write fichiers
   * pour qu'Apex IA n'aie pas besoin de passer par execute_task_on_service.
   * Réponse au screenshot "Tools GitHub | Non exécutés — affichage seulement". */
  {
    name: 'create_or_update_file',
    description: 'CRÉE ou MET À JOUR un fichier dans le repo GitHub Kevin. Apex IA peut désormais écrire du code réellement (pas juste afficher). Si le fichier existe → update via SHA, sinon création. Encode auto base64. Branch default: main.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Chemin relatif depuis racine repo (ex: src/modules/clients/types.ts)' },
        content: { type: 'string', description: 'Contenu UTF-8 complet du fichier (sera encodé base64 auto)' },
        message: { type: 'string', description: 'Message commit (default: "Apex IA: update {path}")' },
        branch: { type: 'string', description: 'Branche cible (default: main)' },
        repo: { type: 'string', description: 'Repo cible owner/repo (default: 9r4rxssx64-creator/CMCteams)' },
      },
      required: ['path', 'content'],
    },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'delete_repo_file',
    description: 'SUPPRIME un fichier du repo GitHub. Action destructive — exige confirm:true. Crée commit avec message explicite.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Chemin relatif fichier à supprimer' },
        message: { type: 'string', description: 'Message commit (default: "Apex IA: delete {path}")' },
        branch: { type: 'string', description: 'Branche cible (default: main)' },
        repo: { type: 'string', description: 'Repo cible (default: 9r4rxssx64-creator/CMCteams)' },
        confirm: { type: 'boolean', description: 'DOIT être true pour valider la suppression' },
      },
      required: ['path', 'confirm'],
    },
    minTier: 'admin',
    impactLevel: 'C',
  },
  {
    name: 'list_task_on_service_handlers',
    description: 'Liste services supportés par execute_task_on_service.',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  /* === Géolocalisation v13.0.x (Kevin "il manquait la géolocalisation") === */
  {
    name: 'get_my_location',
    description: 'Position GPS courante du user (haute précision, ~5m). Retourne lat/lng/accuracy/altitude. Demande permission browser au premier appel.',
    inputSchema: {
      type: 'object',
      properties: {
        high_accuracy: { type: 'boolean', description: 'true (default) = GPS, false = WiFi/IP rapide' },
      },
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'distance_to',
    description: 'Distance Haversine entre user et destination (km). Destination = adresse texte (geocoded) ou {lat,lng}.',
    inputSchema: {
      type: 'object',
      properties: {
        destination: { type: 'string', description: 'Adresse ou "lat,lng"' },
      },
      required: ['destination'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'find_nearby',
    description: 'Cherche lieux proches (restaurants, pharmacies, hôpitaux, etc.) via Overpass API OSM gratuit. Retourne 10 résultats triés par distance.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Type lieu : restaurant, pharmacy, hospital, atm, fuel, supermarket, etc.' },
        radius_m: { type: 'number', description: 'Rayon recherche en mètres (default 1000)' },
      },
      required: ['category'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'reverse_geocode',
    description: 'Adresse depuis coordonnées GPS via Nominatim OpenStreetMap (gratuit). Retourne {country, city, street, postalCode}.',
    inputSchema: {
      type: 'object',
      properties: {
        lat: { type: 'number', description: 'Latitude' },
        lng: { type: 'number', description: 'Longitude' },
        language: { type: 'string', description: 'Code langue (default fr)' },
      },
      required: ['lat', 'lng'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'weather_local',
    description: 'Météo locale 7 jours via Open-Meteo (gratuit, sans clé). Si pas de coords fournies, utilise position user.',
    inputSchema: {
      type: 'object',
      properties: {
        lat: { type: 'number', description: 'Latitude (optionnel)' },
        lng: { type: 'number', description: 'Longitude (optionnel)' },
      },
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  /* ========== PERSONAL ASSISTANT (Kevin 2026-05-07 — réseaux sociaux + apps + appareils) ==========
     22+ outils : WhatsApp, Gmail, Outlook, FB/IG/TikTok/YouTube/LinkedIn/X,
     Telegram, Discord, Slack, Notion, Google Photos, Spotify, iCloud, Capabilities, Contacts.
     HONNÊTETÉ : retours typés ApiResult avec status web vs native vs oauth-required. */
  {
    name: 'whatsapp_send_message',
    description: 'Envoie message WhatsApp via deeplink wa.me (ouvre app native iPhone/Android, user clique envoyer). Phone E.164 ou avec espaces. Retourne url + visual pour modal Apex.',
    inputSchema: {
      type: 'object',
      properties: {
        phone: { type: 'string', description: 'Numéro téléphone (E.164 +33... ou avec espaces)' },
        message: { type: 'string', description: 'Message pré-rempli' },
        contact_name: { type: 'string', description: 'Nom contact pour résolution carnet (alternative à phone)' },
      },
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'whatsapp_call',
    description: 'Appel WhatsApp : ouvre wa.me avec contact, user clique icône appel. Direct call sans clic impossible côté web (limite plateforme). Visual modal Apex avec bouton.',
    inputSchema: {
      type: 'object',
      properties: {
        phone: { type: 'string' },
        contact_name: { type: 'string', description: 'Nom contact pour résolution carnet (ex: "Yannou")' },
      },
    },
    minTier: 'client_free',
    impactLevel: 'B',
  },
  {
    name: 'whatsapp_video_call',
    description: 'Appel vidéo WhatsApp : ouvre app pour video call (user clique icône caméra).',
    inputSchema: {
      type: 'object',
      properties: {
        phone: { type: 'string' },
        contact_name: { type: 'string' },
      },
    },
    minTier: 'client_free',
    impactLevel: 'B',
  },
  {
    name: 'gmail_compose',
    description: 'Compose email Gmail via deeplink Gmail web.',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string' },
        subject: { type: 'string' },
        body: { type: 'string' },
      },
      required: ['to', 'subject', 'body'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'gmail_list_unread',
    description: 'Liste emails non lus Gmail (nécessite OAuth token configuré dans Vault). Retourne {oauthRequired:true} sinon.',
    inputSchema: {
      type: 'object',
      properties: {
        max: { type: 'number', description: 'Nombre max résultats (default 20)' },
      },
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'gmail_archive',
    description: 'Archive un email Gmail (retire INBOX) ou applique un label custom. Nécessite OAuth.',
    inputSchema: {
      type: 'object',
      properties: {
        email_id: { type: 'string' },
        label: { type: 'string', description: 'Label à ajouter (default: archive)' },
      },
      required: ['email_id'],
    },
    minTier: 'family',
    impactLevel: 'B',
  },
  {
    name: 'outlook_compose',
    description: 'Compose email Outlook via deeplink Outlook web.',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string' },
        subject: { type: 'string' },
        body: { type: 'string' },
      },
      required: ['to', 'subject', 'body'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'outlook_list_unread',
    description: 'Liste emails non lus Outlook (Microsoft Graph API, nécessite OAuth).',
    inputSchema: {
      type: 'object',
      properties: { max: { type: 'number' } },
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'facebook_post',
    description: 'Publie post sur page Facebook Business (token + pageId + Meta App Review obligatoires).',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        media_url: { type: 'string', description: 'URL image/vidéo' },
        page_id: { type: 'string' },
      },
    },
    minTier: 'admin',
    impactLevel: 'C',
  },
  {
    name: 'instagram_post',
    description: 'Publie sur Instagram (Business account + Meta App Review). Type: image, video, ou reel.',
    inputSchema: {
      type: 'object',
      properties: {
        media_url: { type: 'string' },
        caption: { type: 'string' },
        type: { type: 'string', enum: ['image', 'video', 'reel'] },
      },
      required: ['media_url', 'type'],
    },
    minTier: 'admin',
    impactLevel: 'C',
  },
  {
    name: 'tiktok_post',
    description: 'Publie vidéo sur TikTok (Business account + app review obligatoires).',
    inputSchema: {
      type: 'object',
      properties: {
        video_url: { type: 'string' },
        caption: { type: 'string' },
      },
      required: ['video_url', 'caption'],
    },
    minTier: 'admin',
    impactLevel: 'C',
  },
  {
    name: 'youtube_upload',
    description: 'Upload vidéo YouTube (OAuth + quota daily 6 uploads gratuits).',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        tags: { type: 'array', description: 'Tags string[]' },
        privacy: { type: 'string', enum: ['public', 'unlisted', 'private'] },
      },
      required: ['title', 'description'],
    },
    minTier: 'admin',
    impactLevel: 'C',
  },
  {
    name: 'linkedin_post',
    description: 'Publie post LinkedIn (OAuth requis + personUrn).',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        media_url: { type: 'string' },
      },
      required: ['text'],
    },
    minTier: 'admin',
    impactLevel: 'C',
  },
  {
    name: 'twitter_post',
    description: 'Publie tweet sur X (Twitter) — API v2 OAuth, plan Basic 100€/mois pour write.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Max 280 caractères' },
      },
      required: ['text'],
    },
    minTier: 'admin',
    impactLevel: 'C',
  },
  {
    name: 'telegram_send',
    description: 'Envoie message Telegram via Bot Token (gratuit @BotFather).',
    inputSchema: {
      type: 'object',
      properties: {
        chat_id: { type: 'string' },
        text: { type: 'string' },
      },
      required: ['chat_id', 'text'],
    },
    minTier: 'family',
    impactLevel: 'B',
  },
  {
    name: 'discord_webhook',
    description: 'Envoie message Discord via webhook URL (créé dans channel settings).',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        content: { type: 'string' },
      },
      required: ['url', 'content'],
    },
    minTier: 'family',
    impactLevel: 'B',
  },
  {
    name: 'slack_post',
    description: 'Envoie message Slack via webhook URL ou Bot Token OAuth.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel ID ou #name' },
        text: { type: 'string' },
        webhook_url: { type: 'string', description: 'Webhook optionnel (sinon Bot Token Vault)' },
      },
      required: ['channel', 'text'],
    },
    minTier: 'family',
    impactLevel: 'B',
  },
  {
    name: 'notion_create_page',
    description: 'Crée page Notion dans une database (integration token + page partagée requis).',
    inputSchema: {
      type: 'object',
      properties: {
        database_id: { type: 'string' },
        title: { type: 'string' },
        content: { type: 'string' },
      },
      required: ['database_id', 'title', 'content'],
    },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'google_photos_list',
    description: 'Liste photos Google Photos (OAuth requis). albumId optionnel pour filtrer.',
    inputSchema: {
      type: 'object',
      properties: {
        album_id: { type: 'string' },
        max: { type: 'number', description: 'Default 50' },
      },
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'google_photos_organize',
    description: 'Crée album Google Photos (OAuth scope appendonly). HONNÊTETÉ : limite API ne permet d\'ajouter que photos uploadées via app.',
    inputSchema: {
      type: 'object',
      properties: {
        album_name: { type: 'string' },
        photo_ids: { type: 'array', description: 'IDs photos optionnels' },
      },
      required: ['album_name'],
    },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'spotify_play',
    description: 'Lance lecture Spotify (Premium requis + OAuth user-modify-playback-state).',
    inputSchema: {
      type: 'object',
      properties: {
        track_id: { type: 'string' },
        context_uri: { type: 'string', description: 'URI playlist/album' },
        device_id: { type: 'string' },
      },
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'spotify_create_playlist',
    description: 'Crée playlist Spotify et y ajoute tracks (OAuth playlist-modify).',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        track_ids: { type: 'array', description: 'IDs tracks Spotify' },
        is_public: { type: 'string', description: '"true" si public (default privé)' },
      },
      required: ['name'],
    },
    minTier: 'family',
    impactLevel: 'B',
  },
  {
    name: 'icloud_photos_list',
    description: 'Liste photos iCloud — HONNÊTETÉ : pas d\'API publique Apple. Retourne native-only avec alternative Capacitor + PhotoKit.',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'integrations_capabilities',
    description: 'Retourne matrice complète des capacités d\'intégration (status web/native/oauth-required par service + feature). HONNÊTETÉ Kevin.',
    inputSchema: {
      type: 'object',
      properties: {
        service: { type: 'string', description: 'Filtre par service (whatsapp, gmail, etc.). Vide = tout.' },
      },
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'integrations_oauth_health',
    description: 'Vérifie état OAuth de tous les services (token présent + non expiré).',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'admin',
    impactLevel: 'A',
  },
  /* === Contacts (carnet d'adresses) === */
  {
    name: 'contact_add',
    description: 'Ajoute un contact (nom, phone, email, whatsapp, aliases). Aliases pour fuzzy lookup ("Yannou" → Yann Roux).',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        whatsapp: { type: 'string' },
        aliases: { type: 'array', description: 'Surnoms / variantes' },
        notes: { type: 'string' },
      },
      required: ['name'],
    },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'contact_search',
    description: 'Recherche fuzzy un contact par nom/alias. Retourne array trié par similarité.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Nom à chercher (fuzzy : "Yannou" → "Yann Roux")' },
        max: { type: 'number', description: 'Max résultats (default 10)' },
      },
      required: ['query'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'contact_list',
    description: 'Liste tous les contacts.',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'family',
    impactLevel: 'A',
  },
  {
    name: 'contact_remove',
    description: 'Supprime contact par ID.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
    minTier: 'family',
    impactLevel: 'B',
  },
  /* === Marketplace Plugins (Kevin 2026-05-04 — recense ~196 plugins Anthropic / MCP / community) === */
  {
    name: 'marketplace_list_installed',
    description: 'Liste tous les plugins actuellement installés dans Apex (catalog + runtime).',
    inputSchema: { type: 'object', properties: {} },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'marketplace_search',
    description: 'Recherche fuzzy dans le catalog (~196 plugins) par nom / tag / description.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Mot-clé recherché (ex: "github", "memory", "rag")' },
        max: { type: 'number', description: 'Nombre max de résultats (default 30)' },
      },
      required: ['query'],
    },
    minTier: 'client_free',
    impactLevel: 'A',
  },
  {
    name: 'marketplace_install',
    description: 'Installe un plugin du catalog. Vérifie pwa_compatible + clé API requise. Niveau B (Kevin notifié).',
    inputSchema: {
      type: 'object',
      properties: {
        plugin_id: { type: 'string', description: 'ID plugin (ex: "github", "supabase", "exa")' },
      },
      required: ['plugin_id'],
    },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'marketplace_recommend',
    description: 'Liste les plugins recommandés pour Kevin (PWA-compatible + valeur ≥ medium, pas installés).',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Filtre catégorie (ex: "memory", "vector-rag")' },
        max: { type: 'number', description: 'Nombre max (default 20)' },
        min_value: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] as const },
      },
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  /* ========================================================================
   * Méta-Marketplace : hub unifié vers 30+ marketplaces du monde.
   * Demande Kevin 2026-05-07 : "Tous les marketplace disponibles pour qu'il
   * aille chercher tout ce qui qu'il a besoin en autonomie."
   * ===================================================================== */
  {
    name: 'meta_search',
    description:
      'Cherche unifié dans 30+ marketplaces (HuggingFace, NPM, GitHub, Civitai, Replicate, Docker Hub, WordPress, Apple Store, data.gouv.fr, MCP servers, …). Retourne items agrégés.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Mot-clé recherché (ex: "stable diffusion", "react", "postgres")' },
        categories: {
          type: 'string',
          description: 'Catégories séparées virgule (ai-ml, code-packages, github, extensions, automation, saas, cloud, apis, datasets, anthropic). Vide = toutes PWA-compat.',
        },
        limit: { type: 'number', description: 'Limite résultats agrégés (default 50)' },
        include_non_pwa: { type: 'boolean', description: 'Inclure marketplaces non-PWA (proxy/OAuth requis)' },
      },
      required: ['query'],
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'meta_install',
    description:
      'Installe / utilise un item depuis un marketplace (npm install, ouvre URL, copie commande CLI, lance OAuth). Audit log immutable.',
    inputSchema: {
      type: 'object',
      properties: {
        providerId: { type: 'string', description: 'ID provider (ex: "npm", "huggingface", "github-marketplace")' },
        itemId: { type: 'string', description: 'ID item natif marketplace (package name, model id, etc.)' },
      },
      required: ['providerId', 'itemId'],
    },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'meta_trending',
    description:
      'Récupère les items trending d\'un marketplace donné (top stars / downloads). Utile pour discovery passive.',
    inputSchema: {
      type: 'object',
      properties: {
        providerId: { type: 'string', description: 'ID marketplace' },
        limit: { type: 'number', description: 'Nombre items (default 10)' },
      },
      required: ['providerId'],
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'meta_recommend',
    description:
      'Recommandations contextuelles pour Apex/Kevin (marketplaces non explorés + Anthropic-specific + trending HF). Aucun param.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'meta_list_providers',
    description:
      'Liste les 30+ marketplaces enregistrés (avec filtres optionnels catégorie / pwa-compat / clé-api / free-tier).',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Filtre catégorie' },
        pwa_compatible: { type: 'boolean', description: 'Si true, garder seulement PWA-compatible' },
        api_key_required: { type: 'boolean', description: 'Si true, garder seulement ceux qui exigent clé API' },
      },
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  /* v13.3.51 — Vision device + Broadlink (Kevin 2026-05-07 "rien fait avec mes photos") */
  {
    name: 'setup_broadlink_from_image',
    description:
      'Configure un compte Broadlink à partir d\'un screenshot user (token + devices détectés via Claude Vision). Stocke chiffré dans Coffre + propose modal config 1-clic.',
    inputSchema: {
      type: 'object',
      properties: {
        image_data_url: { type: 'string', description: 'Image data URL (data:image/...;base64,...)' },
        image_base64: { type: 'string', description: 'Image base64 pure (sans data: prefix)' },
      },
    },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'analyze_device_image',
    description:
      'Analyse photo device IoT (Smart TV, Hue, Sonos, Broadlink, routeur) → extrait infos structurées (MAC, IP, brand, model, token). Réutilise Claude Vision multimodal.',
    inputSchema: {
      type: 'object',
      properties: {
        image_data_url: { type: 'string', description: 'Image data URL (data:image/...;base64,...)' },
        image_base64: { type: 'string', description: 'Image base64 pure (sans data: prefix)' },
        force_type: { type: 'string', enum: ['broadlink_account', 'smart_tv', 'auto'] as const, description: 'Forcer type (default auto-detect)' },
      },
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'broadlink_list_devices',
    description: 'Liste les devices liés au compte Broadlink configuré (force_refresh=true pour bypass cache 5min).',
    inputSchema: {
      type: 'object',
      properties: {
        force_refresh: { type: 'boolean', description: 'Force re-fetch API (bypass cache)' },
      },
    },
    minTier: 'admin',
    impactLevel: 'A',
  },
  {
    name: 'broadlink_send_ir',
    description:
      'Envoie une commande IR via le hub Broadlink (RM Pro/Mini) vers un device cible (TV, climatiseur). irHex = code IR hex (capturé/appris).',
    inputSchema: {
      type: 'object',
      properties: {
        device_id: { type: 'string', description: 'ID device Broadlink RM' },
        ir_hex: { type: 'string', description: 'Code IR hexadécimal' },
        learned_name: { type: 'string', description: 'Alternative : nom code appris (cherche dans cache local)' },
      },
      required: ['device_id'],
    },
    minTier: 'admin',
    impactLevel: 'B',
  },
  /* v13.3.52 Kevin 2026-05-07 — IoT multi-providers framework */
  {
    name: 'install_iot_provider',
    description:
      'Installe/configure un provider IoT (eWeLink, SmartLife/Tuya, Hue, Sonos, Home Assistant, Broadlink). Apex peut self-installer en autonomie quand Kevin fournit ses identifiants ou quand vision-device-analyze a extrait token. Ouvre access cross-provider via iot_list_devices + iot_send_command.',
    inputSchema: {
      type: 'object',
      properties: {
        provider_id: {
          type: 'string',
          description: 'Provider id : ewelink | tuya | broadlink | hue | sonos | home-assistant | (custom)',
          enum: ['ewelink', 'tuya', 'broadlink', 'hue', 'sonos', 'home-assistant'],
        },
        credentials: {
          type: 'object',
          description:
            'Map credentials. eWeLink/Broadlink: {email,password}. Tuya: {client_id,client_secret,uid,access_token}. Hue: {bridge_ip,username} ou {oauth_token}. Sonos: {token,household}. Home Assistant: {url,token}.',
        },
        region: {
          type: 'string',
          description: 'Région optionnelle (us|eu|cn|as) pour eWeLink/Tuya. Default eu.',
        },
      },
      required: ['provider_id', 'credentials'],
    },
    minTier: 'admin',
    impactLevel: 'C', /* setup credentials = sensible → validation Kevin */
  },
  {
    name: 'iot_list_devices',
    description:
      'Liste tous les devices IoT cross-provider configurés (eWeLink, Tuya, Hue, Sonos, HA, Broadlink). Retourne tableau {provider, device_id, name, type, online, capabilities}.',
    inputSchema: {
      type: 'object',
      properties: {
        provider_id: {
          type: 'string',
          description: 'Optionnel : filtre devices d\'un provider spécifique. Sinon retourne tout.',
        },
      },
    },
    minTier: 'laurence', /* read-only sécurisé pour Laurence + family */
    impactLevel: 'A',
  },
  {
    name: 'iot_send_command',
    description:
      'Envoie commande à un device IoT via le bon provider. Exemples : eWeLink {switch:"on"} | Tuya {switch_led:true,bright_value:500} | Hue {on:true,bri:200} | Sonos {action:"play"} | Home Assistant {service:"turn_on"}.',
    inputSchema: {
      type: 'object',
      properties: {
        provider_id: { type: 'string', description: 'Provider du device' },
        device_id: { type: 'string', description: 'ID device dans le provider' },
        command: {
          type: 'object',
          description: 'Commande spécifique au provider (cf. description). Free-form selon device.',
        },
      },
      required: ['provider_id', 'device_id', 'command'],
    },
    minTier: 'admin',
    impactLevel: 'B',
  },
  {
    name: 'iot_test_provider',
    description:
      'Teste connexion d\'un provider IoT (latence + count devices). Utile pour status badge ou diagnostic.',
    inputSchema: {
      type: 'object',
      properties: {
        provider_id: { type: 'string' },
      },
      required: ['provider_id'],
    },
    minTier: 'laurence',
    impactLevel: 'A',
  },
];

class ApexToolsRegistry {
  /**
   * Liste les tools disponibles pour un user donné selon son tier.
   * (P0 audit Kevin : tier admin = TOUT, tier client = read-only).
   */
  listForTier(tier: ApexTool['minTier']): readonly ApexTool[] {
    const TIER_RANK: Record<ApexTool['minTier'], number> = {
      admin: 5,
      laurence: 4,
      family: 3,
      client_pro: 2,
      client_free: 1,
    };
    const userRank = TIER_RANK[tier];
    return APEX_TOOLS.filter((t) => TIER_RANK[t.minTier] <= userRank);
  }

  list(): readonly ApexTool[] {
    return APEX_TOOLS;
  }

  getByName(name: string): ApexTool | null {
    return APEX_TOOLS.find((t) => t.name === name) ?? null;
  }

  /**
   * Format Anthropic tool_use pour injection system prompt.
   */
  toAnthropicFormat(filterTier?: ApexTool['minTier']): unknown[] {
    const tools = filterTier ? this.listForTier(filterTier) : APEX_TOOLS;
    return tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.inputSchema,
    }));
  }

  /**
   * Vérifie si un user peut exécuter un tool donné.
   * Retourne {allowed, requires_validation} :
   * - allowed=false → tier insuffisant
   * - requires_validation=true → impactLevel C, escalate Kevin obligatoire
   */
  canExecute(toolName: string, userTier: ApexTool['minTier']): {
    allowed: boolean;
    requires_validation: boolean;
    reason?: string;
  } {
    const tool = this.getByName(toolName);
    if (!tool) return { allowed: false, requires_validation: false, reason: 'Tool inconnu' };

    /* Tier rank check : userTier doit être >= tool.minTier */
    const TIER_RANK: Record<ApexTool['minTier'], number> = {
      admin: 5,
      laurence: 4,
      family: 3,
      client_pro: 2,
      client_free: 1,
    };
    const userRank = TIER_RANK[userTier];
    const minRank = TIER_RANK[tool.minTier];
    if (userRank < minRank) {
      return { allowed: false, requires_validation: false, reason: 'Tier insuffisant' };
    }

    /* Impact level C → validation Kevin obligatoire si pas admin */
    if (tool.impactLevel === 'C' && userTier !== 'admin') {
      return { allowed: true, requires_validation: true };
    }
    return { allowed: true, requires_validation: false };
  }

  /**
   * Audit log obligatoire pour toute exécution tool (traçabilité immutable).
   */
  async logExecution(toolName: string, userTier: string, params: Record<string, unknown>, ok: boolean): Promise<void> {
    await auditLog.record('tool.execution', {
      details: {
        tool: toolName,
        tier: userTier,
        params: JSON.parse(JSON.stringify(params)) as Record<string, unknown>,
        ok,
      },
    });
    logger.info('apex-tools', `Tool exec: ${toolName} (${userTier}) → ${ok ? 'OK' : 'FAIL'}`);
  }
}

export const apexTools = new ApexToolsRegistry();
