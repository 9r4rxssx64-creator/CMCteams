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
