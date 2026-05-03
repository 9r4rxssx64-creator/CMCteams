/**
 * APEX v13 — Orchestrateur central des projets Kevin
 *
 * Demande Kevin (rebuild plan) :
 * "Apex doit auto-gérer les autres projets Kevin (orchestrateur central)"
 *
 * Bridges exposés via tools IA :
 * - cmc_read       : lit /cmcteams/* Firebase shared
 * - cmc_write_motd : écrit message du jour CMC (admin only)
 * - open_tool      : ouvre tools/*.html dans browser embed
 * - kdmc_stats     : stats e-KDMC marketplaces
 * - telecommande_send : envoie commande IR/Wifi via bridge
 *
 * Aucun projet Kevin n'est modifié — Apex ne fait que LIRE leurs schémas Firebase
 * et LANCER leurs URLs publiques.
 */

import { logger } from '../core/logger.js';

import { firebase } from './firebase.js';

export interface KevinProject {
  id: string;
  name: string;
  url: string;
  firebasePath?: string;
  toolsAvailable: string[];
}

export const PROJECTS: readonly KevinProject[] = [
  {
    id: 'apex',
    name: 'APEX AI v13',
    url: 'https://9r4rxssx64-creator.github.io/CMCteams/apex-ai-v13/',
    firebasePath: 'apex',
    toolsAvailable: [
      'audit_self', 'memory_recall', 'memory_add', 'lesson_record',
      'self_improve', 'project_status', 'sentinels_status', 'perf_metrics',
    ],
  },
  {
    id: 'cmcteams',
    name: 'CMCteams (Casino Monaco)',
    url: 'https://9r4rxssx64-creator.github.io/CMCteams/',
    firebasePath: 'cmcteams',
    toolsAvailable: ['cmc_read', 'cmc_write_motd', 'cmc_get_admin_profile'],
  },
  {
    id: 'telecommande',
    name: 'Télécommande KDMC',
    url: 'https://9r4rxssx64-creator.github.io/CMCteams/messaging-app/',
    toolsAvailable: ['telecommande_send', 'telecommande_status'],
  },
  {
    id: 'crackpass',
    name: 'CrackPass (générateur passwords)',
    url: 'https://9r4rxssx64-creator.github.io/CMCteams/tools/codes-decoder.html',
    toolsAvailable: ['crackpass_check', 'crackpass_generate'],
  },
  {
    id: 'kdmc',
    name: 'KDMC (hub central)',
    url: 'https://9r4rxssx64-creator.github.io/CMCteams/_PROJECTS_KDMC/',
    toolsAvailable: ['kdmc_stats'],
  },
  {
    id: 'ekdmc',
    name: 'e-KDMC (marketplace)',
    url: 'https://9r4rxssx64-creator.github.io/CMCteams/_PROJECTS_KDMC/e-KDMC/',
    firebasePath: 'ekdmc',
    toolsAvailable: ['ekdmc_stats', 'ekdmc_orders'],
  },
  {
    id: 'iakdmc',
    name: 'IA-KDMC (référence archive)',
    url: 'https://9r4rxssx64-creator.github.io/CMCteams/_PROJECTS_KDMC/IA-KDMC/',
    toolsAvailable: ['iakdmc_lookup'],
  },
  /* Extensions v13.0.1 (Kevin demande "tous mes projets intégrés") */
  /* Apex Chat EMBEDDED dans Apex AI (Kevin + Laurence + family) */
  {
    id: 'apex_chat_embedded',
    name: 'Apex Chat (embedded admin/family)',
    url: 'https://9r4rxssx64-creator.github.io/CMCteams/apex-ai-v13/#chat',
    firebasePath: 'apex/chat',
    toolsAvailable: ['chat_read', 'chat_export'],
  },
  /* Apex Chat STANDALONE pour amis/autres (avec pub Apex AI cross-promo) */
  {
    id: 'apex_chat_standalone',
    name: 'Apex Chat Standalone (amis/clients)',
    url: 'https://apex-chat.kdmc.fr/',
    firebasePath: 'apex_chat_standalone',
    toolsAvailable: ['chat_basic', 'chat_share'],
  },
  {
    id: 'social_video',
    name: 'Social Video Pipeline',
    url: 'https://9r4rxssx64-creator.github.io/CMCteams/_PROJECTS_KDMC/social-video/',
    toolsAvailable: ['video_studio', 'social_publish'],
  },
  {
    id: 'eapex',
    name: 'e-APEX (commerce admin)',
    url: 'https://9r4rxssx64-creator.github.io/CMCteams/apex-ai-v13/#admin',
    firebasePath: 'eapex',
    toolsAvailable: ['eapex_stats', 'eapex_subscriptions'],
  },
];

export const TOOLS_HTML: ReadonlyArray<{ id: string; name: string; path: string }> = [
  { id: 'album_laurence', name: 'Album Laurence', path: 'tools/album-laurence.html' },
  { id: 'kevin_todo', name: 'TODO Kevin iPhone', path: 'tools/kevin-todo-iphone.html' },
  { id: 'gen_bulletin', name: 'Bulletin de paie', path: 'tools/gen-bulletin-paie.html' },
  { id: 'planning_weekend', name: 'Planning weekend', path: 'tools/planning-weekend.html' },
  { id: 'codes_decoder', name: 'Décodeur codes', path: 'tools/codes-decoder.html' },
  { id: 'calc_conventions', name: 'Calculatrice conventions', path: 'tools/calc-conventions.html' },
  { id: 'gen_og_png', name: 'Generator OG PNG', path: 'tools/gen-og-png.html' },
  { id: 'cf_deploy', name: 'Cloudflare deploy', path: 'tools/cloudflare/deploy-worker.html' },
  { id: 'cf_vapid', name: 'Cloudflare VAPID gen', path: 'tools/cloudflare/gen-vapid.html' },
];

class Orchestrator {
  listProjects(): readonly KevinProject[] {
    return PROJECTS;
  }

  listTools(): typeof TOOLS_HTML {
    return TOOLS_HTML;
  }

  async cmcRead(): Promise<unknown> {
    return firebase.read<unknown>('cmcteams');
  }

  async kdmcStats(): Promise<unknown> {
    return firebase.read<unknown>('ekdmc');
  }

  openTool(toolId: string): { ok: boolean; url?: string } {
    const tool = TOOLS_HTML.find((t) => t.id === toolId);
    if (!tool) return { ok: false };
    const baseUrl = location.origin;
    const fullUrl = `${baseUrl}/CMCteams/${tool.path}`;
    logger.info('orchestrator', `Opening tool: ${tool.name}`);
    return { ok: true, url: fullUrl };
  }

  /* IA tool definitions au format Anthropic — exportable au system prompt */
  getToolDefinitions(): unknown[] {
    return [
      {
        name: 'cmc_read',
        description: 'Lit les données CMCteams (planning casino) depuis Firebase shared',
        input_schema: { type: 'object', properties: {} },
      },
      {
        name: 'open_tool',
        description: 'Ouvre un outil HTML autonome dans le browser embed',
        input_schema: {
          type: 'object',
          properties: { tool_id: { type: 'string', enum: TOOLS_HTML.map((t) => t.id) } },
          required: ['tool_id'],
        },
      },
      {
        name: 'kdmc_stats',
        description: 'Statistiques e-KDMC marketplace',
        input_schema: { type: 'object', properties: {} },
      },
    ];
  }
}

export const orchestrator = new Orchestrator();
